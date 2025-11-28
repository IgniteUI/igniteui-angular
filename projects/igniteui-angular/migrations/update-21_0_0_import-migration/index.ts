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
    // ['IgxOverlayService', 'core'],
    // ['IgxNavigationService', 'core'],
    // ['DisplayDensity', 'core'],
    // ['DisplayDensityToken', 'core'],
    // ['DisplayDensityBase', 'core'],
    // ['IDisplayDensityOptions', 'core'],
    // ['OverlaySettings', 'core'],
    // ['PositionSettings', 'core'],
    // ['ScrollStrategy', 'core'],
    // ['GlobalPositionStrategy', 'core'],
    // ['AutoPositionStrategy', 'core'],
    // ['ConnectedPositioningStrategy', 'core'],
    // ['ElasticPositionStrategy', 'core'],
    // ['AbsoluteScrollStrategy', 'core'],
    // ['BlockScrollStrategy', 'core'],
    // ['CloseScrollStrategy', 'core'],
    // ['NoOpScrollStrategy', 'core'],
    // ['HorizontalAlignment', 'core'],
    // ['VerticalAlignment', 'core'],
    // ['PositionStrategy', 'core'],
    // ['OverlayEventArgs', 'core'],
    // ['OverlayCancelableEventArgs', 'core'],
    // ['OverlayClosingEventArgs', 'core'],
    // ['OverlayAnimationEventArgs', 'core'],
    // ['Size', 'core'],
    // ['OffsetMode', 'core'],
    // ['ConnectedFit', 'core'],
    // ['IFilteringExpressionsTree', 'core'],
    // ['IFilteringExpression', 'core'],
    // ['FilteringLogic', 'core'],
    // ['IFilteringOperation', 'core'],
    // ['ISortingExpression', 'core'],
    // ['SortingDirection', 'core'],
    // ['IGroupingExpression', 'core'],
    // ['IGroupByExpandState', 'core'],
    // ['IPagingState', 'core'],
    // ['PagingError', 'core'],
    // ['DataUtil', 'core'],
    // ['DatePart', 'core'],
    // ['DatePartInfo', 'core'],
    // ['DatePickerUtil', 'core'],
    // ['IBaseCancelableBrowserEventArgs', 'core'],
    // ['IBaseCancelableEventArgs', 'core'],
    // ['IBaseEventArgs', 'core'],
    // ['ICancelableBrowserEventArgs', 'core'],
    // ['ICancelableEventArgs', 'core'],
    // ['PlatformUtil', 'core'],
    // ['Transaction', 'core'],
    // ['TransactionType', 'core'],
    // ['IgxTransactionService', 'core'],
    // ['State', 'core'],

    // Accordion
    ['IgxAccordionComponent', 'accordion'],
    ['IgxAccordionModule', 'accordion'],
    ['IGX_ACCORDION_DIRECTIVES', 'accordion'],
    ['IAccordionEventArgs', 'accordion'],
    ['IAccordionCancelableEventArgs', 'accordion'],

    // Action Strip
    ['IgxActionStripComponent', 'action-strip'],
    ['IgxActionStripModule', 'action-strip'],
    ['IGX_ACTION_STRIP_DIRECTIVES', 'action-strip'],
    ['IgxActionStripMenuItemDirective', 'action-strip'],

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
    ['IGX_BANNER_DIRECTIVES', 'banner'],
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
    ['IGX_BUTTON_GROUP_DIRECTIVES', 'button-group'],
    ['IgxButtonDirective', 'button-group'],
    ['IgxIconButtonDirective', 'button-group'],
    ['IButtonGroupEventArgs', 'button-group'],
    ['ButtonGroupAlignment', 'button-group'],

    // Calendar
    ['IgxCalendarComponent', 'calendar'],
    ['IgxCalendarModule', 'calendar'],
    ['IGX_CALENDAR_DIRECTIVES', 'calendar'],
    ['IgxDaysViewComponent', 'calendar'],
    ['IgxMonthsViewComponent', 'calendar'],
    ['IgxYearsViewComponent', 'calendar'],
    ['IgxMonthPickerComponent', 'calendar'],
    ['CalendarSelection', 'calendar'],
    ['ICalendarDate', 'calendar'],
    ['ICalendarViewChangingEventArgs', 'calendar'],
    ['WeekDays', 'calendar'],
    ['IFormattingOptions', 'calendar'],
    ['IgxCalendarView', 'calendar'],
    ['IgxCalendarHeaderTemplateDirective', 'calendar'],
    ['IgxCalendarSubheaderTemplateDirective', 'calendar'],
    ['IViewDateChangeEventArgs', 'calendar'],

    // Card
    ['IgxCardComponent', 'card'],
    ['IgxCardModule', 'card'],
    ['IGX_CARD_DIRECTIVES', 'card'],
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
    ['IGX_CAROUSEL_DIRECTIVES', 'carousel'],
    ['IgxSlideComponent', 'carousel'],
    ['CarouselAnimationDirection', 'carousel'], // Renamed from Direction
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
    ['IGX_CHIPS_DIRECTIVES', 'chips'],
    ['IgxChipComponent', 'chips'],
    ['IgxChipsAreaComponent', 'chips'],
    ['IBaseChipEventArgs', 'chips'],
    ['IChipClickEventArgs', 'chips'],
    ['IChipKeyDownEventArgs', 'chips'],
    ['IChipEnterDragAreaEventArgs', 'chips'],
    ['IChipSelectEventArgs', 'chips'],
    ['IChipsAreaReorderEventArgs', 'chips'],

    // Combo
    ['IgxComboComponent', 'combo'],
    ['IgxComboModule', 'combo'],
    ['IGX_COMBO_DIRECTIVES', 'combo'],
    ['IComboSelectionChangingEventArgs', 'combo'],
    ['IComboItemAdditionEvent', 'combo'],
    ['IComboSearchInputEventArgs', 'combo'],
    ['IgxComboState', 'combo'],
    ['IgxComboClearIconDirective', 'combo'],
    ['IgxComboItemDirective', 'combo'],
    ['IgxComboAddItemDirective', 'combo'],
    ['IgxComboEmptyDirective', 'combo'],
    ['IgxComboFooterDirective', 'combo'],
    ['IgxComboHeaderDirective', 'combo'],
    ['IgxComboHeaderItemDirective', 'combo'],
    ['IgxComboToggleIconDirective', 'combo'],

    // Date and Date Range Picker
    ['IgxDatePickerComponent', 'date-picker'],
    ['IgxDatePickerModule', 'date-picker'],
    ['IGX_DATE_PICKER_DIRECTIVES', 'date-picker'],
    ['IGX_DATE_RANGE_PICKER_DIRECTIVES', 'date-picker'],
    ['InteractionMode', 'date-picker'],
    ['IDatePickerCancelEventArgs', 'date-picker'],
    ['IDatePickerDisabledDateEventArgs', 'date-picker'],
    ['IDatePickerValidationFailedEventArgs', 'date-picker'],
    ['IgxDateRangePickerComponent', 'date-picker'],
    ['IgxDateRangePickerModule', 'date-picker'],
    ['DateRangeDescriptor', 'date-picker'],
    ['IDateRangePickerCancelEventArgs', 'date-picker'],
    ['IgxDateRangeEndComponent', 'date-picker'],
    ['IgxDateRangeStartComponent', 'date-picker'],

    // Dialog
    ['IgxDialogComponent', 'dialog'],
    ['IgxDialogModule', 'dialog'],
    ['IGX_DIALOG_DIRECTIVES', 'dialog'],
    ['IgxDialogActionsDirective', 'dialog'],
    ['IgxDialogTitleDirective', 'dialog'],
    ['IDialogEventArgs', 'dialog'],
    ['IDialogCancelEventArgs', 'dialog'],

    // Drop Down
    ['IgxDropDownComponent', 'drop-down'],
    ['IgxDropDownModule', 'drop-down'],
    ['IGX_DROP_DOWN_DIRECTIVES', 'drop-down'],
    ['IgxDropDownItemComponent', 'drop-down'],
    ['IgxDropDownGroupComponent', 'drop-down'],
    ['IgxDropDownItemBaseDirective', 'drop-down'],
    ['IgxAutocompleteDirective', 'drop-down'], // Breaking change - moved from directives
    ['ISelectionEventArgs', 'drop-down'],
    ['IDropDownNavigationDirective', 'drop-down'],
    ['IgxDropDownItemNavigationDirective', 'drop-down'],
    ['IgxAutocompleteModule', 'drop-down'],

    // Expansion Panel
    ['IgxExpansionPanelComponent', 'expansion-panel'],
    ['IgxExpansionPanelModule', 'expansion-panel'],
    ['IGX_EXPANSION_PANEL_DIRECTIVES', 'expansion-panel'],
    ['IgxExpansionPanelBase', 'expansion-panel'],
    ['IExpansionPanelEventArgs', 'expansion-panel'],
    ['IExpansionPanelCancelableEventArgs', 'expansion-panel'],
    ['IgxExpansionPanelHeaderComponent', 'expansion-panel'],
    ['IgxExpansionPanelBodyComponent', 'expansion-panel'],
    ['IgxExpansionPanelTitleDirective', 'expansion-panel'],
    ['IgxExpansionPanelDescriptionDirective', 'expansion-panel'],
    ['IgxExpansionPanelIconDirective', 'expansion-panel'],
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
    ['IGX_GRID_DIRECTIVES', 'grids/grid'],
    ['IgxTreeGridComponent', 'grids/tree-grid'],
    ['IGX_TREE_GRID_DIRECTIVES', 'grids/tree-grid'],
    ['IgxHierarchicalGridComponent', 'grids/hierarchical-grid'],
    ['IGX_HIERARCHICAL_GRID_DIRECTIVES', 'grids/hierarchical-grid'],
    ['IgxPivotGridComponent', 'grids/pivot-grid'],
    ['IGX_PIVOT_GRID_DIRECTIVES', 'grids/pivot-grid'],
    ['IgxPivotDataSelectorComponent', 'grids/pivot-grid'],
    ['IgxRowIslandComponent', 'grids/hierarchical-grid'],
    ['IgxGridModule', 'grids/grid'],
    ['IgxTreeGridModule', 'grids/tree-grid'],
    ['IgxHierarchicalGridModule', 'grids/hierarchical-grid'],
    ['IgxPivotGridModule', 'grids/pivot-grid'],
    ['IgxColumnComponent', 'grids/core'],
    ['IgxColumnGroupComponent', 'grids/core'],
    ['IgxCollapsibleIndicatorTemplateDirective', 'grids/core'],
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
    ['GridSummaryPosition', 'grids/core'],
    ['RowPinningPosition', 'grids/core'],
    ['GridInstanceType', 'grids/core'],
    ['IgxSummaryOperand', 'grids/core'],
    ['IgxNumberSummaryOperand', 'grids/core'],
    ['IgxDateSummaryOperand', 'grids/core'],
    ['IgxSummaryTemplateDirective', 'grids/core'],
    ['IgxCellTemplateDirective', 'grids/core'],
    ['IgxCellHeaderTemplateDirective', 'grids/core'],
    ['IgxFilterCellTemplateDirective', 'grids/core'],
    ['IGridFormGroupCreatedEventArgs', 'grids/core'],
    ['IgxCellValidationErrorDirective', 'grids/core'],
    ['IgxColumnMaxValidatorDirective', 'grids/core'],
    ['IgxColumnMinValidatorDirective', 'grids/core'],
    ['IgxColumnEmailValidatorDirective', 'grids/core'],
    ['IgxColumnMinLengthValidatorDirective', 'grids/core'],
    ['IgxColumnMaxLengthValidatorDirective', 'grids/core'],
    ['IgxColumnPatternValidatorDirective', 'grids/core'],
    ['IgxColumnRequiredValidatorDirective', 'grids/core'],
    ['CellType', 'grids/core'],
    ['IPinningConfig', 'grids/core'],
    ['RowType', 'grids/core'],
    ['IgxCellEditorTemplateDirective', 'grids/core'],
    ['IGridToolbarExportEventArgs', 'grids/core'],
    ['SortingIndexFilteringStrategy', 'grids/core'],
    ['IgxHeadSelectorDirective', 'grids/core'],
    ['IgxRowSelectorDirective', 'grids/core'],
    ['GridFeatures', 'grids/core'],
    ['IGridState', 'grids/core'],
    ['IGridStateOptions', 'grids/core'],
    ['IgxGridStateDirective', 'grids/core'],
    ['IgxRowEditActionsDirective', 'grids/core'],
    ['IgxRowEditTabStopDirective', 'grids/core'],
    ['IgxRowEditTextDirective', 'grids/core'],
    ['IgxRowAddTextDirective', 'grids/core'],
    ['GridPagingMode', 'grids/core'],
    ['IgxAdvancedFilteringDialogComponent', 'grids/core'],
    ['IgxExcelStyleColumnOperationsTemplateDirective', 'grids/core'],
    ['IgxExcelStyleFilterOperationsTemplateDirective', 'grids/core'],
    ['IgxExcelStyleLoadingValuesTemplateDirective', 'grids/core'],
    ['IgxExcelStyleHeaderComponent', 'grids/core'],
    ['IgxExcelStyleHeaderIconDirective', 'grids/core'],
    ['IgxExcelStyleSearchComponent', 'grids/core'],
    ['IgxExcelStyleSortingComponent', 'grids/core'],
    ['IgxExcelStylePinningComponent', 'grids/core'],
    ['IgxGridExcelStyleFilteringComponent', 'grids/core'],
    ['IgxExcelTextDirective', 'grids/core'],
    ['IgxCSVTextDirective', 'grids/core'],
    ['GridCellMergeMode', 'grids/core'],
    ['IActiveNodeChangeEventArgs', 'grids/core'],
    ['IPivotAggregator', 'grids/core'],
    ['PivotAggregation', 'grids/core'],
    ['PivotAggregationType', 'grids/core'],
    ['PivotRowLayoutType', 'grids/core'],
    ['IPivotConfiguration', 'grids/core'],
    ['IPivotDimension', 'grids/core'],
    ['IPivotDimensionData', 'grids/core'],
    ['IPivotValue', 'grids/core'],
    ['IgxPivotDateDimension', 'grids/core'],
    ['IgxPivotAggregate', 'grids/core'],
    ['IgxPivotNumericAggregate', 'grids/core'],
    ['IgxPivotDateAggregate', 'grids/core'],
    ['IgxPivotTimeAggregate', 'grids/core'],
    ['IPivotUISettings', 'grids/core'],
    ['PivotSummaryPosition', 'grids/core'],
    ['NoopPivotDimensionsStrategy', 'grids/core'],
    ['IgxGridToolbarDirective', 'grids/core'],
    ['IgxGroupByRowTemplateDirective', 'grids/core'],
    ['IgxGridDetailTemplateDirective', 'grids/core'],
    ['GridType', 'grids/core'],
    ['IGX_GRID_BASE', 'grids/core'],
    ['IColumnSelectionEventArgs', 'grids/core'],
    ['IgxDragIndicatorIconDirective', 'grids/core'],
    ['IgxRowDragGhostDirective', 'grids/core'],
    ['IgxGridFooterComponent', 'grids/core'],
    ['IgxColumnLayoutComponent', 'grids/core'],
    ['IgxExporterEvent', 'grids/core'],
    ['IGridEditDoneEventArgs', 'grids/core'],
    ['IgxGridRow', 'grids/core'],
    ['IgxGridEditingActions', 'grids/core'], // Grid actions moved to grids
    ['IgxGridPinningActions', 'grids/core'], // Grid actions moved to grids
    ['IgxGridActionButtonComponent', 'grids/core'], // Grid actions moved to grids
    ['IgxGridActionsBaseDirective', 'grids/core'], // Grid actions moved to grids
    ['IgxGridEditingActionsComponent', 'grids/core'], // Grid actions moved to grids
    ['IgxGridPinningActionsComponent', 'grids/core'], // Grid actions moved to grids
    ['IgxColumnActionsComponent', 'grids/core'],
    ['IgxColumnHidingDirective', 'grids/core'],
    ['IgxColumnPinningDirective', 'grids/core'],
    ['IgxTreeGridGroupByAreaComponent', 'grids/tree-grid'],
    ['ITreeGridAggregation', 'grids/tree-grid'],
    ['IgxGroupedTreeGridSorting', 'grids/tree-grid'],
    ['IgxTreeGridGroupingPipe', 'grids/tree-grid'],
    ['IGridCreatedEventArgs', 'grids/hierarchical-grid'],

    // Exporter services and types (moved from core to grids/core in 21.0.0)
    ['IgxBaseExporter', 'grids/core'],
    ['IgxExporterOptionsBase', 'grids/core'],
    ['ExportUtilities', 'grids/core'],
    ['ExportRecordType', 'grids/core'],
    ['ExportHeaderType', 'grids/core'],
    ['IExportRecord', 'grids/core'],
    ['IColumnList', 'grids/core'],
    ['IColumnInfo', 'grids/core'],
    ['IRowExportingEventArgs', 'grids/core'],
    ['IColumnExportingEventArgs', 'grids/core'],
    ['DEFAULT_OWNER', 'grids/core'],
    ['GRID_ROOT_SUMMARY', 'grids/core'],
    ['GRID_PARENT', 'grids/core'],
    ['GRID_LEVEL_COL', 'grids/core'],
    // CSV Exporter
    ['IgxCsvExporterService', 'grids/core'],
    ['IgxCsvExporterOptions', 'grids/core'],
    ['ICsvExportEndedEventArgs', 'grids/core'],
    ['CsvFileTypes', 'grids/core'],
    ['CharSeparatedValueData', 'grids/core'],
    // Excel Exporter
    ['IgxExcelExporterService', 'grids/core'],
    ['IgxExcelExporterOptions', 'grids/core'],
    ['IExcelExportEndedEventArgs', 'grids/core'],
    ['ExcelFolderTypes', 'grids/core'],
    ['ExcelFileTypes', 'grids/core'],
    ['IExcelFile', 'grids/core'],
    ['IExcelFolder', 'grids/core'],
    ['ExcelStrings', 'grids/core'],
    ['ExcelElementsFactory', 'grids/core'],
    ['WorksheetData', 'grids/core'],
    ['WorksheetDataDictionary', 'grids/core'],
    ['RootExcelFolder', 'grids/core'],
    ['RootRelsExcelFolder', 'grids/core'],
    ['DocPropsExcelFolder', 'grids/core'],
    ['XLExcelFolder', 'grids/core'],
    ['XLRelsExcelFolder', 'grids/core'],
    ['ThemeExcelFolder', 'grids/core'],
    ['WorksheetsExcelFolder', 'grids/core'],
    ['TablesExcelFolder', 'grids/core'],
    ['WorksheetsRelsExcelFolder', 'grids/core'],
    ['RootRelsFile', 'grids/core'],
    ['AppFile', 'grids/core'],
    ['CoreFile', 'grids/core'],
    ['WorkbookRelsFile', 'grids/core'],
    ['ThemeFile', 'grids/core'],
    ['WorksheetFile', 'grids/core'],
    ['StyleFile', 'grids/core'],
    ['WorkbookFile', 'grids/core'],
    ['ContentTypesFile', 'grids/core'],
    ['SharedStringsFile', 'grids/core'],
    ['TablesFile', 'grids/core'],
    ['WorksheetRelsFile', 'grids/core'],
    // PDF Exporter
    ['IgxPdfExporterService', 'grids/core'],
    ['IgxPdfExporterOptions', 'grids/core'],
    ['IPdfExportEndedEventArgs', 'grids/core'],

    // Icon
    ['IgxIconComponent', 'icon'],
    ['IgxIconModule', 'icon'],
    ['IgxIconService', 'icon'],
    ['IconMeta', 'icon'],

    // Input Group
    ['IgxInputGroupComponent', 'input-group'],
    ['IgxInputGroupModule', 'input-group'],
    ['IGX_INPUT_GROUP_DIRECTIVES', 'input-group'],
    ['IgxInputDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxLabelDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxHintDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxPrefixDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxSuffixDirective', 'input-group'], // Breaking change - moved from directives
    ['IgxInputState', 'input-group'],
    ['IgxInputGroupType', 'input-group'],
    ['IGX_INPUT_GROUP_TYPE', 'input-group'],

    // List
    ['IgxListComponent', 'list'],
    ['IgxListModule', 'list'],
    ['IGX_LIST_DIRECTIVES', 'list'],
    ['IgxListItemComponent', 'list'],
    ['IgxListHeaderComponent', 'list'],
    ['IListItemClickEventArgs', 'list'],
    ['IgxListPanState', 'list'],
    ['IgxEmptyListTemplateDirective', 'list'],
    ['IgxListLineDirective', 'list'],
    ['IgxListLineSubTitleDirective', 'list'],
    ['IgxListLineTitleDirective', 'list'],
    ['IgxDataLoadingTemplateDirective', 'list'],
    ['IgxListActionDirective', 'list'],
    ['IgxListThumbnailDirective', 'list'],
    ['IgxListItemLeftPanningTemplateDirective', 'list'],
    ['IgxListItemRightPanningTemplateDirective', 'list'],

    // Navbar
    ['IgxNavbarComponent', 'navbar'],
    ['IgxNavbarModule', 'navbar'],
    ['IGX_NAVBAR_DIRECTIVES', 'navbar'],
    ['IgxNavbarActionDirective', 'navbar'],
    ['IgxNavbarTitleDirective', 'navbar'],

    // Navigation Drawer
    ['IgxNavigationDrawerComponent', 'navigation-drawer'],
    ['IgxNavigationDrawerModule', 'navigation-drawer'],
    ['IGX_NAVIGATION_DRAWER_DIRECTIVES', 'navigation-drawer'],
    ['IgxNavigationDrawerItemComponent', 'navigation-drawer'],
    ['INavigationDrawerEventArgs', 'navigation-drawer'],
    ['IgxNavDrawerMode', 'navigation-drawer'],
    ['IgxNavDrawerItemDirective', 'navigation-drawer'],
    ['IgxNavDrawerTemplateDirective', 'navigation-drawer'],
    ['IgxNavDrawerMiniTemplateDirective', 'navigation-drawer'],

    // Paginator
    ['IgxPaginatorComponent', 'paginator'],
    ['IGX_PAGINATOR_DIRECTIVES', 'paginator'],
    ['IgxPaginatorDirective', 'paginator'],
    ['IgxPageNavigationComponent', 'paginator'],
    ['IgxPageSizeSelectorComponent', 'paginator'],
    ['IgxPaginatorContentDirective', 'paginator'],
    ['IgxPaginatorModule', 'paginator'],
    ['IPageEventArgs', 'paginator'],
    ['IPageCancelableEventArgs', 'paginator'],

    // Progressbar
    ['IgxCircularProgressBarComponent', 'progressbar'],
    ['IgxLinearProgressBarComponent', 'progressbar'],
    ['IgxProgressBarModule', 'progressbar'],
    ['IGX_PROGRESS_BAR_DIRECTIVES', 'progressbar'],
    ['IgxProgressType', 'progressbar'],
    ['IgxTextAlign', 'progressbar'],
    ['IgxProgressBarGradientMode', 'progressbar'],
    ['IgxProgressBarGradientDirective', 'progressbar'],

    // Query Builder
    ['IgxQueryBuilderComponent', 'query-builder'],
    ['IgxQueryBuilderModule', 'query-builder'],
    ['IGX_QUERY_BUILDER_DIRECTIVES', 'query-builder'],
    ['IExpressionGroup', 'query-builder'],
    ['IgxQueryBuilderHeaderComponent', 'query-builder'],
    ['IgxQueryBuilderSearchValueTemplateDirective', 'query-builder'],

    // Radio
    ['IgxRadioComponent', 'radio'],
    ['IgxRadioModule', 'radio'],
    ['IGX_RADIO_GROUP_DIRECTIVES', 'radio'],
    ['RadioGroupAlignment', 'radio'],
    ['IgxRadioGroupDirective', 'radio'],

    // Select
    ['IgxSelectComponent', 'select'],
    ['IgxSelectModule', 'select'],
    ['IGX_SELECT_DIRECTIVES', 'select'],
    ['IgxSelectItemComponent', 'select'],
    ['IgxSelectHeaderDirective', 'select'],
    ['IgxSelectFooterDirective', 'select'],
    ['IgxSelectToggleIconDirective', 'select'],
    ['ISelectionChangedEventArgs', 'select'],
    ['IgxSelectGroupComponent', 'select'],

    // Simple Combo
    ['IgxSimpleComboComponent', 'simple-combo'],
    ['IGX_SIMPLE_COMBO_DIRECTIVES', 'simple-combo'],
    ['ISimpleComboSelectionChangingEventArgs', 'simple-combo'],
    ['IgxSimpleComboModule', 'simple-combo'],

    // Slider
    ['IgxSliderComponent', 'slider'],
    ['IgxSliderModule', 'slider'],
    ['IGX_SLIDER_DIRECTIVES', 'slider'],
    ['ISliderValueChangeEventArgs', 'slider'],
    ['IRangeSliderValue', 'slider'],
    ['SliderType', 'slider'],
    ['IgxSliderType', 'slider'],
    ['TickLabelsOrientation', 'slider'],
    ['TicksOrientation', 'slider'],
    ['IgxTickLabelTemplateDirective', 'slider'],
    ['IgxThumbToTemplateDirective', 'slider'],
    ['IgxThumbFromTemplateDirective', 'slider'],

    // Snackbar
    ['IgxSnackbarComponent', 'snackbar'],
    ['IgxSnackbarModule', 'snackbar'],

    // Splitter
    ['IgxSplitterComponent', 'splitter'],
    ['IgxSplitterModule', 'splitter'],
    ['IGX_SPLITTER_DIRECTIVES', 'splitter'],
    ['IgxSplitterPaneComponent', 'splitter'],
    ['ISplitterEventArgs', 'splitter'],
    ['SplitterType', 'splitter'],

    // Stepper
    ['IgxStepperComponent', 'stepper'],
    ['IgxStepperModule', 'stepper'],
    ['IGX_STEPPER_DIRECTIVES', 'stepper'],
    ['IgxStepComponent', 'stepper'],
    ['IStepChangingEventArgs', 'stepper'],
    ['IStepChangedEventArgs', 'stepper'],
    ['IgxStepperOrientation', 'stepper'],
    ['IgxStepType', 'stepper'],
    ['IgxStepActiveIndicatorDirective', 'stepper'],
    ['IgxStepCompletedIndicatorDirective', 'stepper'],
    ['IgxStepContentDirective', 'stepper'],
    ['IgxStepTitleDirective', 'stepper'],
    ['IgxStepSubtitleDirective', 'stepper'],
    ['IgxStepInvalidIndicatorDirective', 'stepper'],
    ['IgxStepIndicatorDirective', 'stepper'],
    ['IgxStepperTitlePosition', 'stepper'],

    // Switch
    ['IgxSwitchComponent', 'switch'],
    ['IgxSwitchModule', 'switch'],

    // Tabs
    ['IgxTabsComponent', 'tabs'],
    ['IgxTabsModule', 'tabs'],
    ['IGX_TABS_DIRECTIVES', 'tabs'],
    ['IgxTabItemComponent', 'tabs'],
    ['IgxTabHeaderComponent', 'tabs'],
    ['IgxTabContentComponent', 'tabs'],
    ['IgxTabsGroupComponent', 'tabs'],
    ['ITabsSelectedItemChangeEventArgs', 'tabs'],
    ['IgxTabsType', 'tabs'],
    ['IgxTabHeaderIconDirective', 'tabs'],
    ['IgxTabHeaderLabelDirective', 'tabs'],

    // Time Picker
    ['IgxTimePickerComponent', 'time-picker'],
    ['IgxTimePickerModule', 'time-picker'],
    ['IGX_TIME_PICKER_DIRECTIVES', 'time-picker'],
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
    ['IGX_TREE_DIRECTIVES', 'tree'],
    ['IgxTreeNodeComponent', 'tree'],
    ['ITreeNodeSelectionEvent', 'tree'],
    ['ITreeNodeTogglingEventArgs', 'tree'],
    ['IgxTreeSelectionType', 'tree'],
    ['IgxTreeNodeLinkDirective', 'tree'],

    // Directives (re-exports from other entry points)
    ['IgxForOfDirective', 'directives'],
    ['IForOfState', 'directives'],
    ['IgxForOfModule', 'directives'],
    ['IgxTemplateOutletDirective', 'directives'],
    ['IgxTextSelectionDirective', 'directives'],
    ['IgxTextSelectionModule', 'directives'],
    ['IgxTextHighlightDirective', 'directives'],
    ['IgxTextHighlightModule', 'directives'],
    ['IgxDateTimeEditorDirective', 'directives'],
    ['IgxMaskDirective', 'directives'],
    ['IgxMaskModule', 'directives'],
    ['IgxDividerDirective', 'directives'],
    ['IgxDividerModule', 'directives'],
    ['IgxFilterDirective', 'directives'],
    ['IgxButtonDirective', 'directives'],
    ['IgxButtonModule', 'directives'],
    ['IgxIconButtonDirective', 'directives'],
    ['IgxToggleActionDirective', 'directives'],
    ['IgxLayoutDirective', 'directives'],
    ['IgxLayoutModule', 'directives'],
    ['IgxFlexDirective', 'directives'],
    ['IgxFocusDirective', 'directives'],
    ['IgxFocusModule', 'directives'],
    ['IgxTooltipDirective', 'directives'],
    ['IgxTooltipTargetDirective', 'directives'],
    ['TooltipPositionStrategy', 'directives'],
    ['IgxTooltipModule', 'directives'],
    ['IgxRippleDirective', 'directives'],
    ['IgxRippleModule', 'directives'],
    ['IDropDroppedEventArgs', 'directives'],
    ['IDragGhostCreatedEventArgs', 'directives'],
    ['IDragStartEventArgs', 'directives'],
    ['IDragBaseEventArgs', 'directives'],
    ['IDropBaseEventArgs', 'directives'],
    ['IDragMoveEventArgs', 'directives'],
    ['IgxDragDirective', 'directives'],
    ['IgxDragHandleDirective', 'directives'],
    ['IgxDragLocation', 'directives'],
    ['IgxDropDirective', 'directives'],
    ['IgxDragDropModule', 'directives'],
    ['IGX_DRAG_DROP_DIRECTIVES', 'directives'],
    ['IgxFocusTrapDirective', 'directives'],
    ['IgxToggleDirective', 'directives'],
    ['IgxToggleModule', 'directives'],
    ['IgxFilterOptions', 'directives'],
    ['IgxFilterPipe', 'directives'],
    ['IgxFilterModule', 'directives'],
    ['IgcFormControlDirective', 'directives'],
    ['IgxTextHighlightService', 'directives']
]);

// Type renames (old name -> new name and entry point)
const TYPE_RENAMES = new Map<string, { newName: string, entryPoint: string }>([
    ['Direction', { newName: 'CarouselAnimationDirection', entryPoint: 'carousel' }],
    ['IgxColumPatternValidatorDirective', { newName: 'IgxColumnPatternValidatorDirective', entryPoint: 'grids/core' }],
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
        context.logger.info('  - Exporter services (CSV, Excel, PDF) moved to igniteui-angular/grids/core');
        context.logger.info('Type renames:');
        context.logger.info('  - Direction → CarouselAnimationDirection');
    };
}
