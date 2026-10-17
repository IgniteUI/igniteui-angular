import type {
    FileVisitor,
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { IG_PACKAGE_NAME, IG_LICENSED_PACKAGE_NAME, igNamedImportFilter } from '../common/tsUtils';

const version = '21.1.0';

// Entry point mapping for moved exports in 21.1.0
const ENTRY_POINT_MAP = new Map<string, string>([
    // IgxGridGroupByAreaComponent moved from grids/core to grids/grid
    ['IgxGridGroupByAreaComponent', 'grids/grid']
]);

interface ImportSpecifierInfo {
    /** Imported symbol name, used for sorting. */
    key: string;
    /** Rendered specifier text, including any inline `type` modifier and alias. */
    text: string;
}

/** Sorts specifiers alphabetically by their imported symbol name. */
const sortByName = (a: ImportSpecifierInfo, b: ImportSpecifierInfo) =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0;

function migrateImportDeclaration(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): { start: number, end: number, replacement: string } | null {
    if (!igNamedImportFilter(node)) {
        return null;
    }

    const importPath = node.moduleSpecifier.text;
    const namedBindings = node.importClause.namedBindings;

    // Only process grids/core imports for this migration
    if (importPath !== `${IG_PACKAGE_NAME}/grids/core` && importPath !== `${IG_LICENSED_PACKAGE_NAME}/grids/core`) {
        return null;
    }

    // Group imports by entry point
    const entryPointGroups = new Map<string, ImportSpecifierInfo[]>();
    const remainingInCore: ImportSpecifierInfo[] = [];

    // `import type { ... }` applies to the whole declaration, so it carries over to every generated import.
    // `phaseModifier` is TS 5.9+; the deprecated `isTypeOnly` keeps this working when an older workspace TS resolves at runtime.
    const isTypeOnly = node.importClause.phaseModifier === ts.SyntaxKind.TypeKeyword || node.importClause.isTypeOnly;
    const typeModifier = isTypeOnly ? 'type ' : '';

    for (const element of namedBindings.elements) {
        const name = element.name.text;
        const alias = element.propertyName?.text;
        const importName = alias || name;

        // Per-specifier modifier, e.g. `import { type CellType, IgxColumnComponent }`
        const typePrefix = element.isTypeOnly ? 'type ' : '';
        const specifier = alias ? `${importName} as ${name}` : importName;
        const fullImport = { key: importName, text: `${typePrefix}${specifier}` };

        // Check if this import needs to be moved
        if (ENTRY_POINT_MAP.has(importName)) {
            const targetEntryPoint = ENTRY_POINT_MAP.get(importName)!;
            if (!entryPointGroups.has(targetEntryPoint)) {
                entryPointGroups.set(targetEntryPoint, []);
            }
            entryPointGroups.get(targetEntryPoint)!.push(fullImport);
        } else {
            // Keep in grids/core
            remainingInCore.push(fullImport);
        }
    }

    // If nothing changed, return null
    if (entryPointGroups.size === 0) {
        return null;
    }

    // Generate new import statements
    const newImports: string[] = [];
    
    // Add remaining grids/core imports first
    if (remainingInCore.length > 0) {
        const sortedImports = remainingInCore.sort(sortByName).map(specifier => specifier.text);
        newImports.push(`import ${typeModifier}{ ${sortedImports.join(', ')} } from '${importPath}';`);
    }
    
    // Add moved imports
    for (const [entryPoint, imports] of entryPointGroups) {
        const sortedImports = imports.sort(sortByName).map(specifier => specifier.text);
        const basePackage = importPath.replace('/grids/core', '');
        newImports.push(`import ${typeModifier}{ ${sortedImports.join(', ')} } from '${basePackage}/${entryPoint}';`);
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

export default function migrate(): Rule {
    return async (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying optional import migration for Ignite UI for Angular to version ${version}`);
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

            // Check if file has grids/core imports
            if (!originalContent.includes(`from '${IG_PACKAGE_NAME}/grids/core'`) && !originalContent.includes(`from "${IG_PACKAGE_NAME}/grids/core"`) &&
                !originalContent.includes(`from '${IG_LICENSED_PACKAGE_NAME}/grids/core'`) && !originalContent.includes(`from "${IG_LICENSED_PACKAGE_NAME}/grids/core"`)) {
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
        context.logger.info('  - IgxGridGroupByAreaComponent moved from igniteui-angular/grids/core to igniteui-angular/grids/grid');
    };
}
