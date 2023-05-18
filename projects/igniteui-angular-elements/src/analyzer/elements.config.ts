import {
  IgxHierarchicalGridComponent,
  IgxPivotDataSelectorComponent,
  IgxPivotGridComponent,
  IgxRowIslandComponent,
  IgxTreeGridComponent,
} from "../../../igniteui-angular/src/public_api";
import { IgxGridComponent } from "../../../igniteui-angular/src/lib/grids/grid/grid.component";
import { IgxGridToolbarAdvancedFilteringComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-advanced-filtering.component";
import { IgxGridToolbarExporterComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component";
import { IgxGridToolbarHidingComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component";
import { IgxGridToolbarPinningComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component";
import { IgxGridToolbarComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component";
import { IgxPaginatorComponent } from "../../../igniteui-angular/src/lib/paginator/paginator.component";
import { IgxColumnComponent } from "../../../igniteui-angular/src/lib/grids/columns/column.component";
import { IgxColumnGroupComponent } from "../../../igniteui-angular/src/lib/grids/columns/column-group.component";
import { IgxColumnLayoutComponent } from "../../../igniteui-angular/src/lib/grids/columns/column-layout.component";
import { IgxToolbarToken } from "../../../igniteui-angular/src/lib/grids/toolbar/token";
import { IgxActionStripComponent } from "../../../igniteui-angular/src/lib/action-strip/action-strip.component";
import { IgxGridEditingActionsComponent } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-editing-actions.component";
import { IgxGridActionsBaseDirective } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-actions-base.directive";
import { IgxGridPinningActionsComponent } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-pinning-actions.component";
import { IgxGridToolbarTitleComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/common";
import { IgxGridToolbarActionsComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/common";

export const registerComponents = [
  IgxGridComponent,
  IgxHierarchicalGridComponent,
  IgxTreeGridComponent,
  IgxPivotGridComponent,
  IgxPivotDataSelectorComponent,
];

//// WARNING: Code below this line is auto-generated and any modifications will be overwritten
export var registerConfig = [
  {
    component: IgxPaginatorComponent,
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxPivotGridComponent,
    ],
    contentQueries: [],
    methods: ["nextPage", "previousPage", "paginate", "ngDoCheck"],
    numericProps: ["page", "perPage", "totalRecords"],
  },
  {
    component: IgxActionStripComponent,
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxRowIslandComponent,
    ],
    contentQueries: [
      {
        property: "actionButtons",
        childType: IgxGridActionsBaseDirective,
        isQueryList: true,
      },
    ],
    methods: ["show", "hide", "ngDoCheck"],
    boolProps: ["hidden"],
  },
  {
    component: IgxGridEditingActionsComponent,
    parents: [IgxActionStripComponent],
    contentQueries: [],
    methods: ["startEdit", "deleteRowHandler", "addRowHandler"],
    boolProps: ["addRow", "editRow", "deleteRow", "addChild", "asMenuItems"],
    provideAs: IgxGridActionsBaseDirective,
  },
  {
    component: IgxGridPinningActionsComponent,
    parents: [IgxActionStripComponent],
    contentQueries: [],
    methods: ["pin", "unpin", "scrollToRow"],
    boolProps: ["asMenuItems"],
    provideAs: IgxGridActionsBaseDirective,
  },
  {
    component: IgxColumnComponent,
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxPivotGridComponent,
      IgxRowIslandComponent,
      IgxColumnGroupComponent,
      IgxColumnLayoutComponent,
    ],
    contentQueries: [],
    methods: [
      "getInitialChildColumnSizes",
      "getFilledChildColumnSizes",
      "getResizableColUnderEnd",
      "pin",
      "unpin",
      "move",
      "autosize",
    ],
    templateProps: [
      "summaryTemplate",
      "bodyTemplate",
      "headerTemplate",
      "inlineEditorTemplate",
      "errorTemplate",
      "filterCellTemplate",
    ],
    numericProps: ["rowEnd", "colEnd", "rowStart", "colStart"],
    boolProps: [
      "sortable",
      "selectable",
      "groupable",
      "editable",
      "filterable",
      "resizable",
      "autosizeHeader",
      "hasSummary",
      "hidden",
      "disableHiding",
      "disablePinning",
      "movable",
      "filteringIgnoreCase",
      "sortingIgnoreCase",
      "searchable",
      "pinned",
      "visibleWhenCollapsed",
    ],
  },
  {
    component: IgxColumnGroupComponent,
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxColumnGroupComponent,
      IgxRowIslandComponent,
    ],
    contentQueries: [
      {
        property: "children",
        childType: IgxColumnComponent,
        isQueryList: true,
      },
    ],
    methods: [
      "getInitialChildColumnSizes",
      "getFilledChildColumnSizes",
      "getResizableColUnderEnd",
      "pin",
      "unpin",
      "move",
      "autosize",
    ],
    templateProps: [
      "collapsibleIndicatorTemplate",
      "summaryTemplate",
      "headerTemplate",
      "errorTemplate",
      "filterCellTemplate",
    ],
    numericProps: ["rowEnd", "colEnd", "rowStart", "colStart"],
    boolProps: [
      "collapsible",
      "expanded",
      "searchable",
      "hidden",
      "sortable",
      "groupable",
      "editable",
      "filterable",
      "resizable",
      "autosizeHeader",
      "hasSummary",
      "disableHiding",
      "disablePinning",
      "movable",
      "filteringIgnoreCase",
      "sortingIgnoreCase",
      "pinned",
      "visibleWhenCollapsed",
    ],
    provideAs: IgxColumnComponent,
  },
  {
    component: IgxGridToolbarTitleComponent,
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    methods: [],
  },
  {
    component: IgxGridToolbarActionsComponent,
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    methods: [],
  },
  {
    component: IgxGridToolbarComponent,
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxPivotGridComponent,
    ],
    contentQueries: [
      { property: "hasActions", childType: IgxGridToolbarActionsComponent },
    ],
    methods: ["ngDoCheck"],
    boolProps: ["showProgress"],
    provideAs: IgxToolbarToken,
  },
  {
    component: IgxGridComponent,
    parents: [],
    contentQueries: [
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      { property: "actionStrip", childType: IgxActionStripComponent },
      {
        property: "toolbar",
        childType: IgxGridToolbarComponent,
        isQueryList: true,
      },
      {
        property: "paginationComponents",
        childType: IgxPaginatorComponent,
        isQueryList: true,
      },
    ],
    methods: [
      "getCellByColumnVisibleIndex",
      "groupBy",
      "clearGrouping",
      "isExpandedGroup",
      "toggleGroup",
      "selectRowsInGroup",
      "deselectRowsInGroup",
      "fullyExpandGroup",
      "toggleAllGroupRows",
      "getSelectedData",
      "getRowByIndex",
      "getRowByKey",
      "getCellByColumn",
      "getCellByKey",
      "pinRow",
      "unpinRow",
      "isRecordPinnedByIndex",
      "toggleColumnVisibility",
      "expandAll",
      "collapseAll",
      "expandRow",
      "collapseRow",
      "toggleRow",
      "getHeaderGroupWidth",
      "getColumnByName",
      "getColumnByVisibleIndex",
      "recalculateAutoSizes",
      "nextPage",
      "previousPage",
      "moveColumn",
      "paginate",
      "markForCheck",
      "addRow",
      "deleteRow",
      "updateCell",
      "updateRow",
      "getRowData",
      "sort",
      "filter",
      "filterGlobal",
      "enableSummaries",
      "disableSummaries",
      "clearFilter",
      "clearSort",
      "pinColumn",
      "unpinColumn",
      "reflow",
      "findNext",
      "findPrev",
      "refreshSearch",
      "clearSearch",
      "getPinnedWidth",
      "selectRows",
      "deselectRows",
      "selectAllRows",
      "deselectAllRows",
      "clearCellSelection",
      "selectRange",
      "getSelectedRanges",
      "selectedColumns",
      "selectColumns",
      "deselectColumns",
      "deselectAllColumns",
      "selectAllColumns",
      "getSelectedColumnsData",
      "combineSelectedCellAndColumnData",
      "navigateTo",
      "getNextCell",
      "getPreviousCell",
      "openAdvancedFilteringDialog",
      "closeAdvancedFilteringDialog",
      "endEdit",
      "beginAddRowById",
      "beginAddRowByIndex",
    ],
    templateProps: [
      "dropAreaTemplate",
      "detailTemplate",
      "groupByRowSelectorTemplate",
      "groupRowTemplate",
      "emptyGridTemplate",
      "addRowEmptyTemplate",
      "loadingGridTemplate",
      "dragGhostCustomTemplate",
      "rowEditTextTemplate",
      "rowAddTextTemplate",
      "rowEditActionsTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
      "dragIndicatorIconTemplate",
    ],
    numericProps: [
      "snackbarDisplayTime",
      "summaryRowHeight",
      "page",
      "perPage",
      "totalRecords",
    ],
    boolProps: [
      "groupsExpanded",
      "hideGroupedColumns",
      "showGroupArea",
      "autoGenerate",
      "moving",
      "paging",
      "hideRowSelectors",
      "rowDraggable",
      "rowEditable",
      "isLoading",
      "allowFiltering",
      "allowAdvancedFiltering",
      "showSummaryOnCollapse",
      "batchEditing",
      "selectRowOnClick",
    ],
  },
  {
    component: IgxRowIslandComponent,
    parents: [IgxHierarchicalGridComponent, IgxRowIslandComponent],
    contentQueries: [
      {
        property: "children",
        childType: IgxRowIslandComponent,
        isQueryList: true,
      },
      {
        property: "childColumns",
        childType: IgxColumnComponent,
        isQueryList: true,
      },
      {
        property: "actionStrips",
        childType: IgxActionStripComponent,
        isQueryList: true,
      },
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      { property: "actionStrip", childType: IgxActionStripComponent },
    ],
    methods: [
      "isRecordPinnedByIndex",
      "toggleColumnVisibility",
      "expandAll",
      "collapseAll",
      "expandRow",
      "collapseRow",
      "toggleRow",
      "getHeaderGroupWidth",
      "getColumnByName",
      "getColumnByVisibleIndex",
      "recalculateAutoSizes",
      "nextPage",
      "previousPage",
      "moveColumn",
      "paginate",
      "markForCheck",
      "addRow",
      "deleteRow",
      "updateCell",
      "updateRow",
      "getRowData",
      "sort",
      "filter",
      "filterGlobal",
      "enableSummaries",
      "disableSummaries",
      "clearFilter",
      "clearSort",
      "pinColumn",
      "unpinColumn",
      "pinRow",
      "unpinRow",
      "findNext",
      "findPrev",
      "refreshSearch",
      "clearSearch",
      "getPinnedWidth",
      "selectRows",
      "deselectRows",
      "selectAllRows",
      "deselectAllRows",
      "clearCellSelection",
      "selectRange",
      "getSelectedRanges",
      "getSelectedData",
      "selectedColumns",
      "selectColumns",
      "deselectColumns",
      "deselectAllColumns",
      "selectAllColumns",
      "getSelectedColumnsData",
      "combineSelectedCellAndColumnData",
      "navigateTo",
      "getNextCell",
      "getPreviousCell",
      "openAdvancedFilteringDialog",
      "closeAdvancedFilteringDialog",
      "endEdit",
      "beginAddRowById",
      "beginAddRowByIndex",
    ],
    templateProps: [
      "emptyGridTemplate",
      "addRowEmptyTemplate",
      "loadingGridTemplate",
      "dragGhostCustomTemplate",
      "rowEditTextTemplate",
      "rowAddTextTemplate",
      "rowEditActionsTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
      "dragIndicatorIconTemplate",
    ],
    numericProps: [
      "snackbarDisplayTime",
      "summaryRowHeight",
      "page",
      "perPage",
      "totalRecords",
    ],
    boolProps: [
      "expandChildren",
      "showExpandAll",
      "autoGenerate",
      "moving",
      "paging",
      "hideRowSelectors",
      "rowDraggable",
      "rowEditable",
      "isLoading",
      "allowFiltering",
      "allowAdvancedFiltering",
      "showSummaryOnCollapse",
      "selectRowOnClick",
    ],
  },
  {
    component: IgxHierarchicalGridComponent,
    parents: [],
    contentQueries: [
      {
        property: "childLayoutList",
        childType: IgxRowIslandComponent,
        isQueryList: true,
      },
      {
        property: "allLayoutList",
        childType: IgxRowIslandComponent,
        isQueryList: true,
        descendants: true,
      },
      {
        property: "paginatorList",
        childType: IgxPaginatorComponent,
        isQueryList: true,
        descendants: true,
      },
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      { property: "actionStrip", childType: IgxActionStripComponent },
      {
        property: "toolbar",
        childType: IgxGridToolbarComponent,
        isQueryList: true,
      },
      {
        property: "paginationComponents",
        childType: IgxPaginatorComponent,
        isQueryList: true,
      },
    ],
    methods: [
      "getCellByColumnVisibleIndex",
      "getRowByIndex",
      "getRowByKey",
      "getCellByColumn",
      "getCellByKey",
      "pinRow",
      "unpinRow",
      "ngOnDestroy",
      "getDefaultExpandState",
      "onContainerScroll",
      "isRecordPinnedByIndex",
      "toggleColumnVisibility",
      "expandAll",
      "collapseAll",
      "expandRow",
      "collapseRow",
      "toggleRow",
      "getHeaderGroupWidth",
      "getColumnByName",
      "getColumnByVisibleIndex",
      "recalculateAutoSizes",
      "nextPage",
      "previousPage",
      "moveColumn",
      "paginate",
      "markForCheck",
      "addRow",
      "deleteRow",
      "updateCell",
      "updateRow",
      "getRowData",
      "sort",
      "filter",
      "filterGlobal",
      "enableSummaries",
      "disableSummaries",
      "clearFilter",
      "clearSort",
      "pinColumn",
      "unpinColumn",
      "reflow",
      "findNext",
      "findPrev",
      "refreshSearch",
      "clearSearch",
      "getPinnedWidth",
      "selectRows",
      "deselectRows",
      "selectAllRows",
      "deselectAllRows",
      "clearCellSelection",
      "selectRange",
      "getSelectedRanges",
      "getSelectedData",
      "selectedColumns",
      "selectColumns",
      "deselectColumns",
      "deselectAllColumns",
      "selectAllColumns",
      "getSelectedColumnsData",
      "combineSelectedCellAndColumnData",
      "navigateTo",
      "getNextCell",
      "getPreviousCell",
      "openAdvancedFilteringDialog",
      "closeAdvancedFilteringDialog",
      "endEdit",
      "beginAddRowById",
      "beginAddRowByIndex",
    ],
    templateProps: [
      "emptyGridTemplate",
      "addRowEmptyTemplate",
      "loadingGridTemplate",
      "dragGhostCustomTemplate",
      "rowEditTextTemplate",
      "rowAddTextTemplate",
      "rowEditActionsTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
      "dragIndicatorIconTemplate",
    ],
    numericProps: [
      "snackbarDisplayTime",
      "summaryRowHeight",
      "page",
      "perPage",
      "totalRecords",
    ],
    boolProps: [
      "expandChildren",
      "showExpandAll",
      "autoGenerate",
      "moving",
      "paging",
      "hideRowSelectors",
      "rowDraggable",
      "rowEditable",
      "isLoading",
      "allowFiltering",
      "allowAdvancedFiltering",
      "showSummaryOnCollapse",
      "selectRowOnClick",
    ],
  },
  {
    component: IgxPivotGridComponent,
    parents: [],
    contentQueries: [
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      {
        property: "toolbar",
        childType: IgxGridToolbarComponent,
        isQueryList: true,
      },
      {
        property: "paginationComponents",
        childType: IgxPaginatorComponent,
        isQueryList: true,
      },
    ],
    methods: [
      "notifyDimensionChange",
      "toggleColumn",
      "getColumnGroupExpandState",
      "toggleRowGroup",
      "autoSizeRowDimension",
      "insertDimensionAt",
      "moveDimension",
      "removeDimension",
      "toggleDimension",
      "insertValueAt",
      "moveValue",
      "removeValue",
      "toggleValue",
      "sortDimension",
      "filterDimension",
      "toggleRow",
      "getHeaderGroupWidth",
      "getColumnByName",
      "getColumnByVisibleIndex",
      "recalculateAutoSizes",
      "markForCheck",
      "getRowData",
      "sort",
      "filter",
      "filterGlobal",
      "clearFilter",
      "clearSort",
      "reflow",
      "selectRows",
      "deselectRows",
      "selectAllRows",
      "deselectAllRows",
      "clearCellSelection",
      "selectRange",
      "getSelectedRanges",
      "getSelectedData",
      "selectedColumns",
      "selectColumns",
      "deselectColumns",
      "deselectAllColumns",
      "selectAllColumns",
      "getSelectedColumnsData",
      "combineSelectedCellAndColumnData",
      "navigateTo",
    ],
    templateProps: [
      "valueChipTemplate",
      "emptyPivotGridTemplate",
      "emptyGridTemplate",
      "loadingGridTemplate",
      "dragGhostCustomTemplate",
      "rowEditTextTemplate",
      "rowAddTextTemplate",
      "rowEditActionsTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
    ],
    boolProps: [
      "showPivotConfigurationUI",
      "superCompactMode",
      "defaultExpandState",
      "isLoading",
      "selectRowOnClick",
    ],
  },
  {
    component: IgxColumnLayoutComponent,
    parents: [IgxGridComponent],
    contentQueries: [
      {
        property: "children",
        childType: IgxColumnComponent,
        isQueryList: true,
      },
    ],
    methods: [
      "getInitialChildColumnSizes",
      "getFilledChildColumnSizes",
      "getResizableColUnderEnd",
      "pin",
      "unpin",
      "move",
      "autosize",
    ],
    templateProps: [
      "collapsibleIndicatorTemplate",
      "summaryTemplate",
      "headerTemplate",
      "errorTemplate",
      "filterCellTemplate",
    ],
    numericProps: ["rowEnd", "colEnd", "rowStart", "colStart"],
    boolProps: [
      "hidden",
      "collapsible",
      "expanded",
      "searchable",
      "sortable",
      "groupable",
      "editable",
      "filterable",
      "resizable",
      "autosizeHeader",
      "hasSummary",
      "disableHiding",
      "disablePinning",
      "movable",
      "filteringIgnoreCase",
      "sortingIgnoreCase",
      "pinned",
      "visibleWhenCollapsed",
    ],
    provideAs: IgxColumnComponent,
  },
  {
    component: IgxGridToolbarAdvancedFilteringComponent,
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    methods: [],
  },
  {
    component: IgxGridToolbarExporterComponent,
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    methods: ["export", "ngOnDestroy"],
    boolProps: ["exportCSV", "exportExcel"],
  },
  {
    component: IgxGridToolbarHidingComponent,
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    methods: ["checkAll", "uncheckAll", "ngOnDestroy"],
    numericProps: ["indentetion"],
    boolProps: ["hideFilter"],
  },
  {
    component: IgxGridToolbarPinningComponent,
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    methods: ["checkAll", "uncheckAll", "ngOnDestroy"],
    numericProps: ["indentetion"],
    boolProps: ["hideFilter"],
  },
  {
    component: IgxTreeGridComponent,
    parents: [],
    contentQueries: [
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      { property: "actionStrip", childType: IgxActionStripComponent },
      {
        property: "toolbar",
        childType: IgxGridToolbarComponent,
        isQueryList: true,
      },
      {
        property: "paginationComponents",
        childType: IgxPaginatorComponent,
        isQueryList: true,
      },
    ],
    methods: [
      "getCellByColumnVisibleIndex",
      "getDefaultExpandState",
      "expandAll",
      "collapseAll",
      "addRow",
      "beginAddRowByIndex",
      "getSelectedData",
      "getRowByIndex",
      "getRowByKey",
      "getCellByColumn",
      "getCellByKey",
      "pinRow",
      "unpinRow",
      "isRecordPinnedByIndex",
      "toggleColumnVisibility",
      "expandRow",
      "collapseRow",
      "toggleRow",
      "getHeaderGroupWidth",
      "getColumnByName",
      "getColumnByVisibleIndex",
      "recalculateAutoSizes",
      "nextPage",
      "previousPage",
      "moveColumn",
      "paginate",
      "markForCheck",
      "deleteRow",
      "updateCell",
      "updateRow",
      "getRowData",
      "sort",
      "filter",
      "filterGlobal",
      "enableSummaries",
      "disableSummaries",
      "clearFilter",
      "clearSort",
      "pinColumn",
      "unpinColumn",
      "reflow",
      "findNext",
      "findPrev",
      "refreshSearch",
      "clearSearch",
      "getPinnedWidth",
      "selectRows",
      "deselectRows",
      "selectAllRows",
      "deselectAllRows",
      "clearCellSelection",
      "selectRange",
      "getSelectedRanges",
      "selectedColumns",
      "selectColumns",
      "deselectColumns",
      "deselectAllColumns",
      "selectAllColumns",
      "getSelectedColumnsData",
      "combineSelectedCellAndColumnData",
      "navigateTo",
      "getNextCell",
      "getPreviousCell",
      "openAdvancedFilteringDialog",
      "closeAdvancedFilteringDialog",
      "endEdit",
      "beginAddRowById",
    ],
    templateProps: [
      "rowLoadingIndicatorTemplate",
      "emptyGridTemplate",
      "addRowEmptyTemplate",
      "loadingGridTemplate",
      "dragGhostCustomTemplate",
      "rowEditTextTemplate",
      "rowAddTextTemplate",
      "rowEditActionsTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
      "dragIndicatorIconTemplate",
    ],
    numericProps: [
      "expansionDepth",
      "snackbarDisplayTime",
      "summaryRowHeight",
      "page",
      "perPage",
      "totalRecords",
    ],
    boolProps: [
      "cascadeOnDelete",
      "autoGenerate",
      "moving",
      "paging",
      "hideRowSelectors",
      "rowDraggable",
      "rowEditable",
      "isLoading",
      "allowFiltering",
      "allowAdvancedFiltering",
      "showSummaryOnCollapse",
      "batchEditing",
      "selectRowOnClick",
    ],
  },
  {
    component: IgxPivotDataSelectorComponent,
    parents: [],
    contentQueries: [],
    methods: [],
    boolProps: [
      "columnsExpanded",
      "rowsExpanded",
      "filtersExpanded",
      "valuesExpanded",
    ],
  },
];
