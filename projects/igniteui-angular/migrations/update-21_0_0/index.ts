import type {
    FileVisitor,
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import * as ts from 'typescript';

const version = '21.0.0';

// Comprehensive entry point mapping for ALL exports from all 42 entry points
const ENTRY_POINT_MAP = new Map<string, string>([
    // Core - Services, Utilities, Types, Enums
    ['IgxOverlayService', 'core'],
    ['IgxNavigationService', 'core'],
    ['IgxFocusTrapDirective', 'core'],
    ['IgxToggleDirective', 'core'],
    ['IgxRippleDirective', 'core'],
    ['IgxDragDirective', 'core'],
    ['IgxDropDirective', 'core'],
    ['DisplayDensity', 'core'],
    ['DisplayDensityToken', 'core'],
    ['DisplayDensityBase', 'core'],
    ['IDisplayDensityOptions', 'core'],
    ['OverlaySettings', 'core'],
    ['PositionSettings', 'core'],
    ['ScrollStrategy', 'core'],
    ['GlobalPositionStrategy', 'core'],
    ['AutoPositionStrategy', 'core'],
    ['ConnectedPositioningStrategy', 'core'],
    ['ElasticPositionStrategy', 'core'],
    ['AbsoluteScrollStrategy', 'core'],
    ['BlockScrollStrategy', 'core'],
    ['CloseScrollStrategy', 'core'],
    ['NoOpScrollStrategy', 'core'],
    ['HorizontalAlignment', 'core'],
    ['VerticalAlignment', 'core'],
    ['PositionStrategy', 'core'],
    ['OverlayEventArgs', 'core'],
    ['OverlayCancelableEventArgs', 'core'],
    ['OverlayClosingEventArgs', 'core'],
    ['OverlayAnimationEventArgs', 'core'],
    ['ElementDimensions', 'core'], // Renamed from Size
    ['OffsetMode', 'core'],
    ['ConnectedFit', 'core'],
    ['IFilteringExpressionsTree', 'core'],
    ['IFilteringExpression', 'core'],
    ['FilteringLogic', 'core'],
    ['IFilteringOperation', 'core'],
    ['ISortingExpression', 'core'],
    ['SortingDirection', 'core'],
    ['IGroupingExpression', 'core'],
    ['IGroupByExpandState', 'core'],
    ['IPagingState', 'core'],
    ['PagingError', 'core'],
    ['DataUtil', 'core'],
    ['DatePart', 'core'],
    ['DatePartInfo', 'core'],
    ['DatePickerUtil', 'core'],
    ['IBaseCancelableBrowserEventArgs', 'core'],
    ['IBaseCancelableEventArgs', 'core'],
    ['IBaseEventArgs', 'core'],
    ['ICancelableBrowserEventArgs', 'core'],
    ['ICancelableEventArgs', 'core'],
    ['PlatformUtil', 'core'],
    ['Transaction', 'core'],
    ['TransactionType', 'core'],
    ['IgxTransactionService', 'core'],
    ['State', 'core'],

    // Accordion
    ['IgxAccordionComponent', 'accordion'],
    ['IgxAccordionModule', 'accordion'],
    ['IgxExpansionPanelHeaderComponent', 'accordion'],
    ['IgxExpansionPanelBodyComponent', 'accordion'],
    ['IgxExpansionPanelTitleDirective', 'accordion'],
    ['IgxExpansionPanelDescriptionDirective', 'accordion'],
    ['IgxExpansionPanelIconDirective', 'accordion'],
    ['IAccordionEventArgs', 'accordion'],
    ['IAccordionCancelableEventArgs', 'accordion'],

    // Action Strip
    ['IgxActionStripComponent', 'action-strip'],
    ['IgxActionStripModule', 'action-strip'],

    // Avatar
    ['IgxAvatarComponent', 'avatar'],
    ['IgxAvatarModule', 'avatar'],
    ['AvatarType', 'avatar'],
    ['IgxAvatarSize', 'avatar'],
    ['IgxAvatarShape', 'avatar'],

    // Badge
    ['IgxBadgeComponent', 'badge'],
    ['IgxBadgeModule', 'badge'],
    ['BadgeType', 'badge'],
    ['IgxBadgeVariant', 'badge'],

    // Banner
    ['IgxBannerComponent', 'banner'],
    ['IgxBannerModule', 'banner'],
    ['IgxBannerActionsDirective', 'banner'],
    ['IBannerEventArgs', 'banner'],
    ['IBannerCancelEventArgs', 'banner'],

    // Bottom Nav
    ['IgxBottomNavComponent', 'bottom-nav'],
    ['IgxBottomNavModule', 'bottom-nav'],
    ['IgxBottomNavItemComponent', 'bottom-nav'],
    ['IgxBottomNavHeaderComponent', 'bottom-nav'],
    ['IgxBottomNavContentComponent', 'bottom-nav'],
    ['IgxBottomNavHeaderLabelDirective', 'bottom-nav'],
    ['IgxBottomNavHeaderIconDirective', 'bottom-nav'],
    ['IGX_BOTTOM_NAV_DIRECTIVES', 'bottom-nav'],

    // Button Group
    ['IgxButtonGroupComponent', 'button-group'],
    ['IgxButtonGroupModule', 'button-group'],
    ['IgxButtonDirective', 'button-group'],
    ['IgxIconButtonDirective', 'button-group'],
    ['IButtonGroupEventArgs', 'button-group'],

    // Calendar
    ['IgxCalendarComponent', 'calendar'],
    ['IgxCalendarModule', 'calendar'],
    ['IgxDaysViewComponent', 'calendar'],
    ['IgxMonthsViewComponent', 'calendar'],
    ['IgxYearsViewComponent', 'calendar'],
    ['IgxMonthPickerComponent', 'calendar'],
    ['CalendarSelection', 'calendar'],
    ['ICalendarDate', 'calendar'],
    ['ICalendarViewChangingEventArgs', 'calendar'],
    ['WeekDays', 'calendar'],

    // Card
    ['IgxCardComponent', 'card'],
    ['IgxCardModule', 'card'],
    ['IgxCardHeaderComponent', 'card'],
    ['IgxCardMediaDirective', 'card'],
    ['IgxCardContentDirective', 'card'],
    ['IgxCardActionsComponent', 'card'],
    ['IgxCardHeaderTitleDirective', 'card'],
    ['IgxCardHeaderSubtitleDirective', 'card'],
    ['IgxCardThumbnailDirective', 'card'],
    ['IgxCardType', 'card'],

    // Carousel
    ['IgxCarouselComponent', 'carousel'],
    ['IgxCarouselModule', 'carousel'],
    ['IgxSlideComponent', 'carousel'],
    ['IgxCarouselDirection', 'carousel'], // Renamed from Direction
    ['ISlideEventArgs', 'carousel'],
    ['ISlideCarouselBaseEventArgs', 'carousel'],
    ['CarouselAnimationType', 'carousel'],
    ['CarouselIndicatorsOrientation', 'carousel'],

    // Checkbox
    ['IgxCheckboxComponent', 'checkbox'],
    ['IgxCheckboxModule', 'checkbox'],
    ['IChangeCheckboxEventArgs', 'checkbox'],
    ['LabelPosition', 'checkbox'],

    // Chips
    ['IgxChipsComponent', 'chips'],
    ['IgxChipsModule', 'chips'],
    ['IgxChipComponent', 'chips'],
    ['IgxChipsAreaComponent', 'chips'],
    ['IBaseChipEventArgs', 'chips'],
    ['IChipClickEventArgs', 'chips'],
    ['IChipKeyDownEventArgs', 'chips'],
    ['IChipEnterDragAreaEventArgs', 'chips'],
    ['IChipSelectEventArgs', 'chips'],

    // Combo
    ['IgxComboComponent', 'combo'],
    ['IgxComboModule', 'combo'],
    ['IComboSelectionChangingEventArgs', 'combo'],
    ['IComboItemAdditionEvent', 'combo'],
    ['IComboSearchInputEventArgs', 'combo'],
    ['IgxComboState', 'combo'],

    // Date Picker
    ['IgxDatePickerComponent', 'date-picker'],
    ['IgxDatePickerModule', 'date-picker'],
    ['InteractionMode', 'date-picker'],
    ['IDatePickerCancelEventArgs', 'date-picker'],
    ['IDatePickerDisabledDateEventArgs', 'date-picker'],
    ['IDatePickerValidationFailedEventArgs', 'date-picker'],

    // Date Range Picker
    ['IgxDateRangePickerComponent', 'date-range-picker'],
    ['IgxDateRangePickerModule', 'date-range-picker'],
    ['DateRangeType', 'date-range-picker'],
    ['DateRangeDescriptor', 'date-range-picker'],
    ['IDateRangePickerCancelEventArgs', 'date-range-picker'],

    // Dialog
    ['IgxDialogComponent', 'dialog'],
    ['IgxDialogModule', 'dialog'],
    ['IgxDialogActionsDirective', 'dialog'],
    ['IgxDialogTitleDirective', 'dialog'],
    ['IDialogEventArgs', 'dialog'],
    ['IDialogCancelEventArgs', 'dialog'],

    // Drop Down
    ['IgxDropDownComponent', 'drop-down'],
    ['IgxDropDownModule', 'drop-down'],
    ['IgxDropDownItemComponent', 'drop-down'],
    ['IgxDropDownGroupComponent', 'drop-down'],
    ['IgxDropDownItemBaseDirective', 'drop-down'],
    ['IgxAutocompleteDirective', 'drop-down'], // Breaking change - moved from directives
    ['ISelectionEventArgs', 'drop-down'],
    ['IDropDownNavigationDirective', 'drop-down'],

    // Expansion Panel
    ['IgxExpansionPanelComponent', 'expansion-panel'],
    ['IgxExpansionPanelModule', 'expansion-panel'],
    ['IgxExpansionPanelBase', 'expansion-panel'],
    ['IExpansionPanelEventArgs', 'expansion-panel'],
    ['IExpansionPanelCancelableEventArgs', 'expansion-panel'],
    ['ToggleAnimationSettings', 'expansion-panel'],

    // Grids - Components, Services, Types
    // Note: All grid exports are available from 'igniteui-angular/grids'
    // For better tree-shaking, you can use specific grid entry points:
    //   - 'igniteui-angular/grids/core' - Shared grid infrastructure (columns, toolbar, etc.)
    //   - 'igniteui-angular/grids/grid' - Standard grid (IgxGridComponent)
    //   - 'igniteui-angular/grids/tree-grid' - Tree grid (IgxTreeGridComponent)
    //   - 'igniteui-angular/grids/hierarchical-grid' - Hierarchical grid (IgxHierarchicalGridComponent, IgxRowIslandComponent)
    //   - 'igniteui-angular/grids/pivot-grid' - Pivot grid (IgxPivotGridComponent, IgxPivotDataSelectorComponent)
    ['IgxGridComponent', 'grids/grid'],
    ['IgxTreeGridComponent', 'grids/tree-grid'],
    ['IgxHierarchicalGridComponent', 'grids/hierarchical-grid'],
    ['IgxPivotGridComponent', 'grids/pivot-grid'],
    ['IgxPivotDataSelectorComponent', 'grids/pivot-grid'],
    ['IgxRowIslandComponent', 'grids/hierarchical-grid'],
    ['IgxGridModule', 'grids/grid'],
    ['IgxTreeGridModule', 'grids/tree-grid'],
    ['IgxHierarchicalGridModule', 'grids/hierarchical-grid'],
    ['IgxPivotGridModule', 'grids/pivot-grid'],
    ['IgxColumnComponent', 'grids/core'],
    ['IgxColumnGroupComponent', 'grids/core'],
    ['IgxRowDirective', 'grids/core'],
    ['IgxCellComponent', 'grids/core'],
    ['IgxGridCellComponent', 'grids/core'],
    ['IgxGridHeaderComponent', 'grids/core'],
    ['IgxGridToolbarComponent', 'grids/core'],
    ['IgxGridToolbarActionsComponent', 'grids/core'],
    ['IgxGridToolbarAdvancedFilteringComponent', 'grids/core'],
    ['IgxGridToolbarExporterComponent', 'grids/core'],
    ['IgxGridToolbarHidingComponent', 'grids/core'],
    ['IgxGridToolbarPinningComponent', 'grids/core'],
    ['IgxGridToolbarTitleComponent', 'grids/core'],
    ['GridBaseAPIService', 'grids/core'],
    ['IgxGridAPIService', 'grids/grid'],
    ['IgxTreeGridAPIService', 'grids/tree-grid'],
    ['IgxHierarchicalGridAPIService', 'grids/hierarchical-grid'],
    ['IgxGridSelectionService', 'grids/core'],
    ['IgxGridNavigationService', 'grids/core'],
    ['IgxGridCRUDService', 'grids/core'],
    ['IgxGridSummaryService', 'grids/core'],
    ['IgxFilteringService', 'grids/core'],
    ['IGridCellEventArgs', 'grids/core'],
    ['IGridEditEventArgs', 'grids/core'],
    ['IRowDataEventArgs', 'grids/core'],
    ['IRowSelectionEventArgs', 'grids/core'],
    ['ICellPosition', 'grids/core'],
    ['IColumnResizeEventArgs', 'grids/core'],
    ['IColumnMovingEventArgs', 'grids/core'],
    ['IColumnMovingEndEventArgs', 'grids/core'],
    ['IColumnMovingStartEventArgs', 'grids/core'],
    ['IGridKeydownEventArgs', 'grids/core'],
    ['IRowDragEndEventArgs', 'grids/core'],
    ['IRowDragStartEventArgs', 'grids/core'],
    ['GridSelectionMode', 'grids/core'],
    ['FilterMode', 'grids/core'],
    ['GridSummaryCalculationMode', 'grids/core'],
    ['GridSummaryPosition', 'grids/core'],
    ['RowPinningPosition', 'grids/core'],
    ['ColumnPinningPosition', 'grids/core'],
    ['GridInstanceType', 'grids/core'],
    ['Size', 'core'], // Moved to core
    ['SortingIndexFilteringStrategy', 'grids/core'],
    ['IgxGridEditingActions', 'grids/core'], // Grid actions moved to grids
    ['IgxGridPinningActions', 'grids/core'], // Grid actions moved to grids
    ['IgxGridActionButtonComponent', 'grids/core'], // Grid actions moved to grids
    ['IgxGridActionsBaseDirective', 'grids/core'], // Grid actions moved to grids
    ['IgxGridEditingActionsComponent', 'grids/core'], // Grid actions moved to grids
    ['IgxGridPinningActionsComponent', 'grids/core'], // Grid actions moved to grids

    // Icon
    ['IgxIconComponent', 'icon'],
    ['IgxIconModule', 'icon'],
    ['IgxIconService', 'icon'],
    ['IconMeta', 'icon'],

    // Input Group
    ['IgxInputGroupComponent', 'input-group'],
    ['IgxInputGroupModule', 'input-group'],
    ['IgxInputDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxLabelDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxHintDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxPrefixDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxSuffixDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxInputState', 'input-group'],
    ['IgxInputGroupType', 'input-group'],

    // List
    ['IgxListComponent', 'list'],
    ['IgxListModule', 'list'],
    ['IgxListItemComponent', 'list'],
    ['IgxListHeaderComponent', 'list'],
    ['IListItemClickEventArgs', 'list'],
    ['IgxListPanState', 'list'],

    // Navbar
    ['IgxNavbarComponent', 'navbar'],
    ['IgxNavbarModule', 'navbar'],
    ['IgxNavbarActionDirective', 'navbar'],
    ['IgxNavbarTitleDirective', 'navbar'],

    // Navigation Drawer
    ['IgxNavigationDrawerComponent', 'navigation-drawer'],
    ['IgxNavigationDrawerModule', 'navigation-drawer'],
    ['IgxNavigationDrawerItemComponent', 'navigation-drawer'],
    ['INavigationDrawerEventArgs', 'navigation-drawer'],
    ['IgxNavDrawerMode', 'navigation-drawer'],

    // Paginator
    ['IgxPaginatorComponent', 'paginator'],
    ['IgxPaginatorModule', 'paginator'],
    ['IPageEventArgs', 'paginator'],
    ['IPageCancelableEventArgs', 'paginator'],

    // Progressbar
    ['IgxCircularProgressBarComponent', 'progressbar'],
    ['IgxLinearProgressBarComponent', 'progressbar'],
    ['IgxProgressBarModule', 'progressbar'],
    ['IgxProgressType', 'progressbar'],
    ['IgxTextAlign', 'progressbar'],
    ['IgxProgressBarGradientMode', 'progressbar'],

    // Query Builder
    ['IgxQueryBuilderComponent', 'query-builder'],
    ['IgxQueryBuilderModule', 'query-builder'],
    ['IExpressionGroup', 'query-builder'],

    // Radio
    ['IgxRadioComponent', 'radio'],
    ['IgxRadioModule', 'radio'],
    ['IgxRadioGroupDirective', 'radio'], // Breaking change - moved from directives
    ['IChangeRadioEventArgs', 'radio'], // Renamed from IChangeCheckboxEventArgs

    // Select
    ['IgxSelectComponent', 'select'],
    ['IgxSelectModule', 'select'],
    ['IgxSelectItemComponent', 'select'],
    ['IgxSelectHeaderDirective', 'select'],
    ['IgxSelectFooterDirective', 'select'],
    ['IgxSelectToggleIconDirective', 'select'],
    ['ISelectionChangedEventArgs', 'select'],

    // Simple Combo
    ['IgxSimpleComboComponent', 'simple-combo'],
    ['IgxSimpleComboModule', 'simple-combo'],

    // Slider
    ['IgxSliderComponent', 'slider'],
    ['IgxSliderModule', 'slider'],
    ['ISliderValueChangeEventArgs', 'slider'],
    ['IRangeSliderValue', 'slider'],
    ['SliderType', 'slider'],
    ['IgxSliderType', 'slider'],

    // Snackbar
    ['IgxSnackbarComponent', 'snackbar'],
    ['IgxSnackbarModule', 'snackbar'],

    // Splitter
    ['IgxSplitterComponent', 'splitter'],
    ['IgxSplitterModule', 'splitter'],
    ['IgxSplitterPaneComponent', 'splitter'],
    ['ISplitterEventArgs', 'splitter'],
    ['SplitterType', 'splitter'],

    // Stepper
    ['IgxStepperComponent', 'stepper'],
    ['IgxStepperModule', 'stepper'],
    ['IgxStepComponent', 'stepper'],
    ['IStepChangingEventArgs', 'stepper'],
    ['IStepChangedEventArgs', 'stepper'],
    ['IgxStepperOrientation', 'stepper'],
    ['IgxStepType', 'stepper'],

    // Switch
    ['IgxSwitchComponent', 'switch'],
    ['IgxSwitchModule', 'switch'],

    // Tabs
    ['IgxTabsComponent', 'tabs'],
    ['IgxTabsModule', 'tabs'],
    ['IgxTabItemComponent', 'tabs'],
    ['IgxTabHeaderComponent', 'tabs'],
    ['IgxTabContentComponent', 'tabs'],
    ['IgxTabsGroupComponent', 'tabs'],
    ['ITabsSelectedItemChangeEventArgs', 'tabs'],
    ['IgxTabsType', 'tabs'],

    // Time Picker
    ['IgxTimePickerComponent', 'time-picker'],
    ['IgxTimePickerModule', 'time-picker'],
    ['IgxTimePickerActionsDirective', 'time-picker'],
    ['IgxHourItemDirective', 'time-picker'],
    ['IgxMinuteItemDirective', 'time-picker'],
    ['IgxAmPmItemDirective', 'time-picker'],
    ['IgxItemListDirective', 'time-picker'],

    // Toast
    ['IgxToastComponent', 'toast'],
    ['IgxToastModule', 'toast'],
    ['IgxToastPosition', 'toast'],

    // Tree
    ['IgxTreeComponent', 'tree'],
    ['IgxTreeModule', 'tree'],
    ['IgxTreeNodeComponent', 'tree'],
    ['ITreeNodeSelectionEvent', 'tree'],
    ['ITreeNodeTogglingEventArgs', 'tree'],
    ['IgxTreeSelectionType', 'tree'],

    // Directives (re-exports from other entry points)
    ['IgxForOfDirective', 'directives'],
    ['IgxTemplateOutletDirective', 'directives'],
    ['IgxTextSelectionDirective', 'directives'],
    ['IgxTextHighlightDirective', 'directives'],
    ['IgxDateTimeEditorDirective', 'directives'],
    ['IgxMaskDirective', 'directives'],
    ['IgxDividerDirective', 'directives'],
    ['IgxFilterDirective', 'directives'],
    ['IgxButtonDirective', 'directives'],
    ['IgxToggleActionDirective', 'directives'],
    ['IgxLayoutDirective', 'directives'],
    ['IgxFlexDirective', 'directives'],
]);

// Type renames (old name -> new name and entry point)
const TYPE_RENAMES = new Map<string, { newName: string, entryPoint: string }>([
    ['Direction', { newName: 'IgxCarouselDirection', entryPoint: 'carousel' }],
    ['Size', { newName: 'ElementDimensions', entryPoint: 'core' }],
    ['IChangeCheckboxEventArgs', { newName: 'IChangeRadioEventArgs', entryPoint: 'radio' }],
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
        let actualImportName = importName;

        // Check if this is a renamed type
        if (TYPE_RENAMES.has(importName)) {
            const rename = TYPE_RENAMES.get(importName)!;
            actualImportName = rename.newName;
        }

        const fullImport = alias ? `${actualImportName} as ${name}` : actualImportName;

        // Determine target entry point
        let targetEntryPoint = 'core'; // Default to core

        // Check if it's a renamed type first
        if (TYPE_RENAMES.has(importName)) {
            targetEntryPoint = TYPE_RENAMES.get(importName)!.entryPoint;
        } else if (ENTRY_POINT_MAP.has(importName)) {
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

    // Track which old type names are imported in this file
    const importedOldTypes = new Set<string>();

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            const change = migrateImportDeclaration(node, sourceFile);
            if (change) {
                changes.push(change);

                // Track old type names that were imported
                const moduleSpecifier = node.moduleSpecifier;
                if (ts.isStringLiteral(moduleSpecifier) && moduleSpecifier.text === 'igniteui-angular') {
                    const importClause = node.importClause;
                    if (importClause?.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
                        for (const element of importClause.namedBindings.elements) {
                            const importName = element.propertyName?.text || element.name.text;
                            if (TYPE_RENAMES.has(importName)) {
                                importedOldTypes.add(importName);
                            }
                        }
                    }
                }
            }
        } else if (ts.isIdentifier(node) && importedOldTypes.has(node.text)) {
            // Rename type references in the code (but only if not aliased in import)
            const oldName = node.text;
            const rename = TYPE_RENAMES.get(oldName)!;

            // Check if this identifier is part of an import statement
            // We don't want to rename it there as we already handled it
            let isInImport = false;
            let parent = node.parent;
            while (parent) {
                if (ts.isImportDeclaration(parent)) {
                    isInImport = true;
                    break;
                }
                parent = parent.parent;
            }

            if (!isInImport) {
                changes.push({
                    start: node.getStart(sourceFile),
                    end: node.getEnd(),
                    replacement: rename.newName
                });
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

interface MigrationOptions {
    migrateImports?: boolean;
}

export default (options: MigrationOptions = {}): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const shouldMigrateImports = options.migrateImports !== false; // Default to true if not specified

    if (shouldMigrateImports) {
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
        context.logger.info('Type renames:');
        context.logger.info('  - Direction → IgxCarouselDirection');
        context.logger.info('  - Size → ElementDimensions');
        context.logger.info('  - IChangeCheckboxEventArgs → IChangeRadioEventArgs');
    } else {
        context.logger.info('Skipping import migration. You can continue using the main entry point.');
        context.logger.info('Note: The library now supports granular entry points for better tree-shaking.');
        context.logger.info('To migrate later, run: ng update igniteui-angular --migrate-only --from=20.1.0 --to=21.0.0');
    }
};
