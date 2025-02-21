import {
  IgxGridComponent,
  IgxHierarchicalGridComponent,
  IgxPivotDataSelectorComponent,
  IgxPivotGridComponent,
  IgxTreeGridComponent,
} from "../../../igniteui-angular/src/public_api";
import { IgxPaginatorComponent } from "../../../igniteui-angular/src/lib/paginator/paginator.component";
import { IgxPaginatorToken } from "../../../igniteui-angular/src/lib/paginator/token";
import { IgxActionStripComponent } from "../../../igniteui-angular/src/lib/action-strip/action-strip.component";
import { IgxActionStripToken } from "../../../igniteui-angular/src/lib/action-strip/token";
import { IgxGridEditingActionsComponent } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-editing-actions.component";
import { IgxGridActionsBaseDirective } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-actions-base.directive";
import { IgxGridPinningActionsComponent } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-pinning-actions.component";
import { IgxColumnComponent } from "../../../igniteui-angular/src/lib/grids/columns/column.component";
import { IgxColumnGroupComponent } from "../../../igniteui-angular/src/lib/grids/columns/column-group.component";
import { IgxColumnLayoutComponent } from "../../../igniteui-angular/src/lib/grids/columns/column-layout.component";
import { IgxGridToolbarTitleComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/common";
import { IgxGridToolbarActionsComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/common";
import { IgxGridToolbarAdvancedFilteringComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-advanced-filtering.component";
import { IgxGridToolbarComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component";
import { IgxToolbarToken } from "../../../igniteui-angular/src/lib/grids/toolbar/token";
import { IgxRowIslandComponent } from "../../../igniteui-angular/src/lib/grids/hierarchical-grid/row-island.component";
import { IgxGridToolbarExporterComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component";
import { IgxGridToolbarHidingComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component";
import { IgxGridToolbarPinningComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component";
import { IgxGridStateComponent } from "../lib/state.component";

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
    component: IgxActionStripComponent,
    selector: "igc-action-strip",
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
    additionalProperties: [],
    methods: ["show", "hide"],
    boolProps: ["hidden"],
    provideAs: IgxActionStripToken,
  },
  {
    component: IgxColumnComponent,
    selector: "igc-column",
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
    additionalProperties: [
      { name: "selected", writable: true },
      { name: "index" },
      { name: "visibleIndex" },
      { name: "columnGroup" },
      { name: "columnLayout" },
      { name: "columnLayoutChild" },
      { name: "childColumns" },
      { name: "level" },
      { name: "filteringExpressionsTree" },
      { name: "parent", writable: true },
      { name: "grid", writable: true },
      { name: "topLevelParent" },
    ],
    methods: ["pin", "unpin", "move", "autosize"],
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
      "filteringIgnoreCase",
      "sortingIgnoreCase",
      "searchable",
      "pinned",
      "visibleWhenCollapsed",
    ],
  },
  {
    component: IgxColumnGroupComponent,
    selector: "igc-column-group",
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
    additionalProperties: [
      { name: "selected", writable: true },
      { name: "childColumns" },
      { name: "columnGroup" },
      { name: "columnLayout" },
      { name: "index" },
      { name: "visibleIndex" },
      { name: "columnLayoutChild" },
      { name: "level" },
      { name: "filteringExpressionsTree" },
      { name: "parent", writable: true },
      { name: "grid", writable: true },
      { name: "topLevelParent" },
    ],
    methods: ["pin", "unpin", "move", "autosize"],
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
      "filteringIgnoreCase",
      "sortingIgnoreCase",
      "pinned",
      "visibleWhenCollapsed",
    ],
    provideAs: IgxColumnComponent,
  },
  {
    component: IgxColumnLayoutComponent,
    selector: "igc-column-layout",
    parents: [IgxGridComponent],
    contentQueries: [
      {
        property: "children",
        childType: IgxColumnComponent,
        isQueryList: true,
      },
    ],
    additionalProperties: [
      { name: "columnLayout" },
      { name: "visibleIndex" },
      { name: "selected", writable: true },
      { name: "childColumns" },
      { name: "columnGroup" },
      { name: "index" },
      { name: "columnLayoutChild" },
      { name: "level" },
      { name: "filteringExpressionsTree" },
      { name: "parent", writable: true },
      { name: "grid", writable: true },
      { name: "topLevelParent" },
    ],
    methods: ["pin", "unpin", "move", "autosize"],
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
      "filteringIgnoreCase",
      "sortingIgnoreCase",
      "pinned",
      "visibleWhenCollapsed",
    ],
    provideAs: IgxColumnComponent,
  },
  {
    component: IgxGridComponent,
    selector: "igc-grid",
    parents: [],
    contentQueries: [
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      {
        property: "actionStripComponents",
        childType: IgxActionStripToken,
        isQueryList: true,
      },
      { property: "toolbar", childType: IgxToolbarToken, isQueryList: true },
      {
        property: "paginationComponents",
        childType: IgxPaginatorToken,
        isQueryList: true,
      },
    ],
    additionalProperties: [
      { name: "groupsRecords" },
      { name: "selectedCells" },
      { name: "shouldGenerate", writable: true },
      { name: "rowList" },
      { name: "dataRowList" },
      { name: "hiddenColumnsCount" },
      { name: "pinnedColumnsCount" },
      { name: "transactions" },
      { name: "lastSearchInfo" },
      { name: "filteredData" },
      { name: "filteredSortedData" },
      { name: "validation" },
      { name: "gridAPI" },
      { name: "cdr" },
      { name: "navigation", writable: true },
      { name: "virtualizationState" },
      { name: "nativeElement" },
      { name: "defaultRowHeight" },
      { name: "defaultHeaderGroupMinWidth" },
      { name: "columns" },
      { name: "pinnedColumns" },
      { name: "pinnedRows" },
      { name: "unpinnedColumns" },
      { name: "visibleColumns" },
      { name: "dataView" },
    ],
    methods: [
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
      "moveColumn",
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
      "rowExpandedIndicatorTemplate",
      "rowCollapsedIndicatorTemplate",
      "headerExpandedIndicatorTemplate",
      "headerCollapsedIndicatorTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
      "dragIndicatorIconTemplate",
    ],
    numericProps: [
      "totalItemCount",
      "snackbarDisplayTime",
      "summaryRowHeight",
      "rowHeight",
      "totalRecords",
    ],
    boolProps: [
      "groupsExpanded",
      "hideGroupedColumns",
      "showGroupArea",
      "autoGenerate",
      "moving",
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
    component: IgxGridEditingActionsComponent,
    selector: "igc-grid-editing-actions",
    parents: [IgxActionStripComponent],
    contentQueries: [],
    additionalProperties: [{ name: "hasChildren" }],
    methods: ["startEdit"],
    boolProps: ["addRow", "editRow", "deleteRow", "addChild", "asMenuItems"],
    provideAs: IgxGridActionsBaseDirective,
  },
  {
    component: IgxGridPinningActionsComponent,
    selector: "igc-grid-pinning-actions",
    parents: [IgxActionStripComponent],
    contentQueries: [],
    additionalProperties: [],
    methods: ["pin", "unpin", "scrollToRow"],
    boolProps: ["asMenuItems"],
    provideAs: IgxGridActionsBaseDirective,
  },
  {
    component: IgxGridStateComponent,
    selector: "igc-grid-state",
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxPivotGridComponent,
    ],
    contentQueries: [],
    additionalProperties: [{ name: "grid", writable: true }],
    methods: [
      "applyState",
      "applyStateFromString",
      "getState",
      "getStateAsString",
    ],
  },
  {
    component: IgxGridToolbarActionsComponent,
    selector: "igc-grid-toolbar-actions",
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    additionalProperties: [],
    methods: [],
  },
  {
    component: IgxGridToolbarAdvancedFilteringComponent,
    selector: "igc-grid-toolbar-advanced-filtering",
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    additionalProperties: [],
    methods: ["ngOnInit"],
  },
  {
    component: IgxGridToolbarComponent,
    selector: "igc-grid-toolbar",
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxPivotGridComponent,
    ],
    contentQueries: [
      { property: "hasActions", childType: IgxGridToolbarActionsComponent },
    ],
    additionalProperties: [{ name: "nativeElement" }],
    methods: [],
    boolProps: ["showProgress"],
    provideAs: IgxToolbarToken,
  },
  {
    component: IgxGridToolbarExporterComponent,
    selector: "igc-grid-toolbar-exporter",
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    additionalProperties: [],
    methods: ["export"],
    boolProps: ["exportCSV", "exportExcel"],
  },
  {
    component: IgxGridToolbarHidingComponent,
    selector: "igc-grid-toolbar-hiding",
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    additionalProperties: [],
    methods: ["checkAll", "uncheckAll"],
    numericProps: ["indentetion"],
    boolProps: ["hideFilter"],
  },
  {
    component: IgxGridToolbarPinningComponent,
    selector: "igc-grid-toolbar-pinning",
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    additionalProperties: [],
    methods: ["checkAll", "uncheckAll"],
    numericProps: ["indentetion"],
    boolProps: ["hideFilter"],
  },
  {
    component: IgxGridToolbarTitleComponent,
    selector: "igc-grid-toolbar-title",
    parents: [IgxGridToolbarComponent],
    contentQueries: [],
    additionalProperties: [],
    methods: [],
  },
  {
    component: IgxHierarchicalGridComponent,
    selector: "igc-hierarchical-grid",
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
        childType: IgxPaginatorToken,
        isQueryList: true,
        descendants: true,
      },
      {
        property: "actionStripComponents",
        childType: IgxActionStripToken,
        isQueryList: true,
      },
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      { property: "toolbar", childType: IgxToolbarToken, isQueryList: true },
      {
        property: "paginationComponents",
        childType: IgxPaginatorToken,
        isQueryList: true,
      },
    ],
    additionalProperties: [
      { name: "foreignKey" },
      { name: "selectedCells" },
      { name: "gridAPI", writable: true },
      { name: "navigation", writable: true },
      { name: "shouldGenerate", writable: true },
      { name: "rowList" },
      { name: "dataRowList" },
      { name: "hiddenColumnsCount" },
      { name: "pinnedColumnsCount" },
      { name: "transactions" },
      { name: "lastSearchInfo" },
      { name: "filteredData" },
      { name: "filteredSortedData" },
      { name: "validation" },
      { name: "cdr" },
      { name: "virtualizationState" },
      { name: "nativeElement" },
      { name: "defaultRowHeight" },
      { name: "defaultHeaderGroupMinWidth" },
      { name: "columns" },
      { name: "pinnedColumns" },
      { name: "pinnedRows" },
      { name: "unpinnedColumns" },
      { name: "visibleColumns" },
      { name: "dataView" },
    ],
    methods: [
      "getRowByIndex",
      "getRowByKey",
      "getCellByColumn",
      "getCellByKey",
      "pinRow",
      "unpinRow",
      "getDefaultExpandState",
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
      "moveColumn",
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
      "rowExpandedIndicatorTemplate",
      "rowCollapsedIndicatorTemplate",
      "headerExpandedIndicatorTemplate",
      "headerCollapsedIndicatorTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
      "dragIndicatorIconTemplate",
    ],
    numericProps: [
      "totalItemCount",
      "snackbarDisplayTime",
      "summaryRowHeight",
      "rowHeight",
      "totalRecords",
    ],
    boolProps: [
      "expandChildren",
      "showExpandAll",
      "autoGenerate",
      "moving",
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
    component: IgxPaginatorComponent,
    selector: "igc-paginator",
    parents: [
      IgxGridComponent,
      IgxTreeGridComponent,
      IgxHierarchicalGridComponent,
      IgxPivotGridComponent,
    ],
    contentQueries: [],
    additionalProperties: [
      { name: "totalPages", writable: true },
      { name: "isLastPage" },
      { name: "isFirstPage" },
      { name: "nativeElement" },
    ],
    methods: ["nextPage", "previousPage", "paginate"],
    numericProps: ["page", "perPage", "totalRecords"],
    provideAs: IgxPaginatorToken,
  },
  {
    component: IgxPivotDataSelectorComponent,
    selector: "igc-pivot-data-selector",
    parents: [],
    contentQueries: [],
    additionalProperties: [{ name: "animationSettings", writable: true }],
    methods: [],
    boolProps: [
      "columnsExpanded",
      "rowsExpanded",
      "filtersExpanded",
      "valuesExpanded",
    ],
  },
  {
    component: IgxPivotGridComponent,
    selector: "igc-pivot-grid",
    parents: [],
    contentQueries: [
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      { property: "toolbar", childType: IgxToolbarToken, isQueryList: true },
      {
        property: "paginationComponents",
        childType: IgxPaginatorToken,
        isQueryList: true,
      },
    ],
    additionalProperties: [
      { name: "dimensionsSortingExpressions" },
      { name: "navigation", writable: true },
      { name: "allDimensions" },
      { name: "rowList" },
      { name: "dataRowList" },
      { name: "lastSearchInfo" },
      { name: "filteredData" },
      { name: "filteredSortedData" },
      { name: "validation" },
      { name: "gridAPI" },
      { name: "cdr" },
      { name: "virtualizationState" },
      { name: "nativeElement" },
      { name: "defaultRowHeight" },
      { name: "defaultHeaderGroupMinWidth" },
      { name: "columns" },
      { name: "visibleColumns" },
      { name: "dataView" },
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
      "navigateTo",
    ],
    templateProps: [
      "valueChipTemplate",
      "rowDimensionHeaderTemplate",
      "emptyPivotGridTemplate",
      "emptyGridTemplate",
      "loadingGridTemplate",
      "dragGhostCustomTemplate",
      "rowEditTextTemplate",
      "rowAddTextTemplate",
      "rowEditActionsTemplate",
      "rowExpandedIndicatorTemplate",
      "rowCollapsedIndicatorTemplate",
      "headerExpandedIndicatorTemplate",
      "headerCollapsedIndicatorTemplate",
      "excelStyleHeaderIconTemplate",
      "sortAscendingHeaderIconTemplate",
      "sortDescendingHeaderIconTemplate",
      "sortHeaderIconTemplate",
      "headSelectorTemplate",
      "rowSelectorTemplate",
    ],
    numericProps: ["rowHeight"],
    boolProps: [
      "autoGenerateConfig",
      "superCompactMode",
      "defaultExpandState",
      "isLoading",
      "selectRowOnClick",
    ],
  },
  {
    component: IgxRowIslandComponent,
    selector: "igc-row-island",
    parents: [IgxHierarchicalGridComponent, IgxRowIslandComponent],
    contentQueries: [
      {
        property: "children",
        childType: IgxRowIslandComponent,
        isQueryList: true,
      },
      {
        property: "childLayoutList",
        childType: IgxRowIslandComponent,
        isQueryList: true,
      },
      {
        property: "childColumns",
        childType: IgxColumnComponent,
        isQueryList: true,
      },
      {
        property: "actionStripComponents",
        childType: IgxActionStripToken,
        isQueryList: true,
      },
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
    ],
    additionalProperties: [
      { name: "rowIslandAPI", writable: true },
      { name: "gridAPI", writable: true },
      { name: "navigation", writable: true },
      { name: "shouldGenerate", writable: true },
      { name: "rowList" },
      { name: "dataRowList" },
      { name: "transactions" },
      { name: "validation" },
      { name: "cdr" },
      { name: "nativeElement" },
      { name: "defaultRowHeight" },
      { name: "defaultHeaderGroupMinWidth" },
      { name: "columns" },
      { name: "pinnedRows" },
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
      "moveColumn",
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
      "toolbarTemplate",
      "paginatorTemplate",
      "emptyGridTemplate",
      "addRowEmptyTemplate",
      "loadingGridTemplate",
      "dragGhostCustomTemplate",
      "rowEditTextTemplate",
      "rowAddTextTemplate",
      "rowEditActionsTemplate",
      "rowExpandedIndicatorTemplate",
      "rowCollapsedIndicatorTemplate",
      "headerExpandedIndicatorTemplate",
      "headerCollapsedIndicatorTemplate",
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
      "rowHeight",
      "totalRecords",
    ],
    boolProps: [
      "expandChildren",
      "showExpandAll",
      "autoGenerate",
      "moving",
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
    component: IgxTreeGridComponent,
    selector: "igc-tree-grid",
    parents: [],
    contentQueries: [
      {
        property: "columnList",
        childType: IgxColumnComponent,
        isQueryList: true,
        descendants: true,
      },
      {
        property: "actionStripComponents",
        childType: IgxActionStripToken,
        isQueryList: true,
      },
      { property: "toolbar", childType: IgxToolbarToken, isQueryList: true },
      {
        property: "paginationComponents",
        childType: IgxPaginatorToken,
        isQueryList: true,
      },
    ],
    additionalProperties: [
      { name: "rootRecords", writable: true },
      { name: "records", writable: true },
      { name: "processedRootRecords", writable: true },
      { name: "processedRecords", writable: true },
      { name: "selectedCells" },
      { name: "shouldGenerate", writable: true },
      { name: "rowList" },
      { name: "dataRowList" },
      { name: "hiddenColumnsCount" },
      { name: "pinnedColumnsCount" },
      { name: "lastSearchInfo" },
      { name: "filteredData" },
      { name: "filteredSortedData" },
      { name: "validation" },
      { name: "gridAPI" },
      { name: "cdr" },
      { name: "navigation", writable: true },
      { name: "virtualizationState" },
      { name: "nativeElement" },
      { name: "defaultRowHeight" },
      { name: "defaultHeaderGroupMinWidth" },
      { name: "columns" },
      { name: "pinnedColumns" },
      { name: "pinnedRows" },
      { name: "unpinnedColumns" },
      { name: "visibleColumns" },
      { name: "dataView" },
    ],
    methods: [
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
      "moveColumn",
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
      "rowExpandedIndicatorTemplate",
      "rowCollapsedIndicatorTemplate",
      "headerExpandedIndicatorTemplate",
      "headerCollapsedIndicatorTemplate",
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
      "rowHeight",
      "totalRecords",
    ],
    boolProps: [
      "cascadeOnDelete",
      "autoGenerate",
      "moving",
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
];
