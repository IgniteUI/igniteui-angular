import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import * as path from 'path';

const version = '21.0.0';

// Entry point mapping for components
const ENTRY_POINT_MAP = new Map<string, string>([
    // Components
    ['IgxAccordionComponent', 'accordion'],
    ['IgxAccordionModule', 'accordion'],
    ['IgxActionStripComponent', 'action-strip'],
    ['IgxActionStripModule', 'action-strip'],
    ['IgxAvatarComponent', 'avatar'],
    ['IgxAvatarModule', 'avatar'],
    ['IgxBadgeComponent', 'badge'],
    ['IgxBadgeModule', 'badge'],
    ['IgxBannerComponent', 'banner'],
    ['IgxBannerModule', 'banner'],
    ['IgxButtonGroupComponent', 'buttonGroup'],
    ['IgxButtonGroupModule', 'buttonGroup'],
    ['IgxCalendarComponent', 'calendar'],
    ['IgxCalendarModule', 'calendar'],
    ['IgxCardComponent', 'card'],
    ['IgxCardModule', 'card'],
    ['IgxCarouselComponent', 'carousel'],
    ['IgxCarouselModule', 'carousel'],
    ['IgxCheckboxComponent', 'checkbox'],
    ['IgxCheckboxModule', 'checkbox'],
    ['IgxChipsComponent', 'chips'],
    ['IgxChipsModule', 'chips'],
    ['IgxComboComponent', 'combo'],
    ['IgxComboModule', 'combo'],
    ['IgxDatePickerComponent', 'date-picker'],
    ['IgxDatePickerModule', 'date-picker'],
    ['IgxDateRangePickerComponent', 'date-range-picker'],
    ['IgxDateRangePickerModule', 'date-range-picker'],
    ['IgxDialogComponent', 'dialog'],
    ['IgxDialogModule', 'dialog'],
    ['IgxDropDownComponent', 'drop-down'],
    ['IgxDropDownModule', 'drop-down'],
    ['IgxAutocompleteDirective', 'drop-down'], // Breaking change
    ['IgxExpansionPanelComponent', 'expansion-panel'],
    ['IgxExpansionPanelModule', 'expansion-panel'],
    ['IgxGridComponent', 'grids'],
    ['IgxTreeGridComponent', 'grids'],
    ['IgxHierarchicalGridComponent', 'grids'],
    ['IgxPivotGridComponent', 'grids'],
    ['IgxGridModule', 'grids'],
    ['IgxIconComponent', 'icon'],
    ['IgxIconModule', 'icon'],
    ['IgxInputGroupComponent', 'input-group'],
    ['IgxInputGroupModule', 'input-group'],
    ['IgxInputDirective', 'input-group'], // Breaking change
    ['IgxLabelDirective', 'input-group'], // Breaking change
    ['IgxHintDirective', 'input-group'], // Breaking change
    ['IgxPrefixDirective', 'input-group'], // Breaking change
    ['IgxSuffixDirective', 'input-group'], // Breaking change
    ['IgxListComponent', 'list'],
    ['IgxListModule', 'list'],
    ['IgxNavbarComponent', 'navbar'],
    ['IgxNavbarModule', 'navbar'],
    ['IgxNavigationDrawerComponent', 'navigation-drawer'],
    ['IgxNavigationDrawerModule', 'navigation-drawer'],
    ['IgxPaginatorComponent', 'paginator'],
    ['IgxPaginatorModule', 'paginator'],
    ['IgxCircularProgressBarComponent', 'progressbar'],
    ['IgxLinearProgressBarComponent', 'progressbar'],
    ['IgxProgressBarModule', 'progressbar'],
    ['IgxQueryBuilderComponent', 'query-builder'],
    ['IgxQueryBuilderModule', 'query-builder'],
    ['IgxRadioComponent', 'radio'],
    ['IgxRadioModule', 'radio'],
    ['IgxRadioGroupDirective', 'radio'], // Breaking change
    ['IgxSelectComponent', 'select'],
    ['IgxSelectModule', 'select'],
    ['IgxSimpleComboComponent', 'simple-combo'],
    ['IgxSimpleComboModule', 'simple-combo'],
    ['IgxSliderComponent', 'slider'],
    ['IgxSliderModule', 'slider'],
    ['IgxSnackbarComponent', 'snackbar'],
    ['IgxSnackbarModule', 'snackbar'],
    ['IgxSplitterComponent', 'splitter'],
    ['IgxSplitterModule', 'splitter'],
    ['IgxStepperComponent', 'stepper'],
    ['IgxStepperModule', 'stepper'],
    ['IgxSwitchComponent', 'switch'],
    ['IgxSwitchModule', 'switch'],
    ['IgxTabsComponent', 'tabs'],
    ['IgxTabsModule', 'tabs'],
    ['IgxTimePickerComponent', 'time-picker'],
    ['IgxTimePickerModule', 'time-picker'],
    ['IgxToastComponent', 'toast'],
    ['IgxToastModule', 'toast'],
    ['IgxTreeComponent', 'tree'],
    ['IgxTreeModule', 'tree'],
]);

// Core exports that stay in core
const CORE_EXPORTS = new Set([
    'DisplayDensity',
    'Size',
    'OverlaySettings',
    'PositionSettings',
    'ConnectedPositioningStrategy',
    'AbsoluteScrollStrategy',
    'CancelableEventArgs',
    'IBaseEventArgs',
]);

function migrateImportDeclaration(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): { start: number, end: number, replacement: string } | null {
    const moduleSpecifier = node.moduleSpecifier;
    if (!ts.isStringLiteral(moduleSpecifier)) {
        return null;
    }

    const importPath = moduleSpecifier.text;
    
    // Only process igniteui-angular imports (not already using entry points)
    if (importPath !== 'igniteui-angular') {
        return null;
    }

    const importClause = node.importClause;
    if (!importClause || !importClause.namedBindings) {
        return null;
    }

    if (!ts.isNamedImports(importClause.namedBindings)) {
        return null;
    }

    // Group imports by entry point
    const entryPointGroups = new Map<string, string[]>();
    
    for (const element of importClause.namedBindings.elements) {
        const name = element.name.text;
        const alias = element.propertyName?.text;
        const importName = alias || name;
        const fullImport = alias ? `${alias} as ${name}` : name;

        // Determine target entry point
        let targetEntryPoint = 'core'; // Default to core
        
        if (ENTRY_POINT_MAP.has(importName)) {
            targetEntryPoint = ENTRY_POINT_MAP.get(importName)!;
        }

        if (!entryPointGroups.has(targetEntryPoint)) {
            entryPointGroups.set(targetEntryPoint, []);
        }
        entryPointGroups.get(targetEntryPoint)!.push(fullImport);
    }

    // Generate new import statements
    const newImports: string[] = [];
    for (const [entryPoint, imports] of entryPointGroups) {
        const sortedImports = imports.sort();
        newImports.push(`import { ${sortedImports.join(', ')} } from 'igniteui-angular/${entryPoint}';`);
    }

    return {
        start: node.getStart(sourceFile),
        end: node.getEnd(),
        replacement: newImports.join('\n')
    };
}

function migrateFile(filePath: string, content: string): string {
    const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
    );

    const changes: { start: number, end: number, replacement: string }[] = [];

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            const change = migrateImportDeclaration(node, sourceFile);
            if (change) {
                changes.push(change);
            }
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Apply changes in reverse order to maintain positions
    changes.sort((a, b) => b.start - a.start);
    
    let result = content;
    for (const change of changes) {
        result = result.substring(0, change.start) + change.replacement + result.substring(change.end);
    }

    return result;
}

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    context.logger.info('Migrating imports to new entry points...');

    const visit: FileVisitor = (filePath) => {
        // Only process TypeScript files
        if (!filePath.endsWith('.ts')) {
            return;
        }

        // Skip node_modules and dist
        if (filePath.includes('node_modules') || filePath.includes('dist')) {
            return;
        }

        const content = host.read(filePath);
        if (!content) {
            return;
        }

        const originalContent = content.toString();
        
        // Check if file has igniteui-angular imports
        if (!originalContent.includes("from 'igniteui-angular'") && !originalContent.includes('from "igniteui-angular"')) {
            return;
        }

        const migratedContent = migrateFile(filePath, originalContent);
        
        if (migratedContent !== originalContent) {
            host.overwrite(filePath, migratedContent);
            context.logger.info(`  ✓ Migrated ${filePath}`);
        }
    };

    host.visit(visit);
    
    context.logger.info('Migration complete!');
    context.logger.info('Breaking changes:');
    context.logger.info('  - Input directives moved to igniteui-angular/input-group');
    context.logger.info('  - IgxAutocompleteDirective moved to igniteui-angular/drop-down');
    context.logger.info('  - IgxRadioGroupDirective moved to igniteui-angular/radio');
};
