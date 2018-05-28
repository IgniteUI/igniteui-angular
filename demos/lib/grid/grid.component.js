import { DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ContentChild, ContentChildren, ElementRef, EventEmitter, HostBinding, Inject, Input, IterableDiffers, NgZone, Output, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from "@angular/core";
import { of, Subject } from "rxjs";
import { debounceTime, delay, merge, repeat, take, takeUntil } from "rxjs/operators";
import { IgxSelectionAPIService } from "../core/selection";
import { cloneArray } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { FilteringLogic } from "../data-operations/filtering-expression.interface";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxTextHighlightDirective } from "../directives/text-highlight/text-highlight.directive";
import { IgxCheckboxComponent } from "./../checkbox/checkbox.component";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { IgxGroupByRowTemplateDirective } from "./grid.common";
import { IgxGridSortingPipe } from "./grid.pipes";
import { IgxGridGroupByRowComponent } from "./groupby-row.component";
import { IgxGridRowComponent } from "./row.component";
var NEXT_ID = 0;
var DEBOUNCE_TIME = 16;
var DEFAULT_SUMMARY_HEIGHT = 36.36;
var MINIMUM_COLUMN_WIDTH = 136;
var IgxGridComponent = (function () {
    function IgxGridComponent(gridAPI, selectionAPI, elementRef, zone, document, cdr, resolver, differs, viewRef) {
        var _this = this;
        this.gridAPI = gridAPI;
        this.selectionAPI = selectionAPI;
        this.elementRef = elementRef;
        this.zone = zone;
        this.document = document;
        this.cdr = cdr;
        this.resolver = resolver;
        this.differs = differs;
        this.viewRef = viewRef;
        this.data = [];
        this.autoGenerate = false;
        this.id = "igx-grid-" + NEXT_ID++;
        this.filteringLogic = FilteringLogic.And;
        this.groupByIndentation = 30;
        this.groupByDefaultExpanded = true;
        this.evenRowCSS = "";
        this.oddRowCSS = "";
        this.rowHeight = 50;
        this.columnWidth = null;
        this.emptyGridMessage = "No records found.";
        this.onCellClick = new EventEmitter();
        this.onSelection = new EventEmitter();
        this.onRowSelectionChange = new EventEmitter();
        this.onColumnPinning = new EventEmitter();
        this.onEditDone = new EventEmitter();
        this.onColumnInit = new EventEmitter();
        this.onSortingDone = new EventEmitter();
        this.onFilteringDone = new EventEmitter();
        this.onPagingDone = new EventEmitter();
        this.onRowAdded = new EventEmitter();
        this.onRowDeleted = new EventEmitter();
        this.onGroupingDone = new EventEmitter();
        this.onDataPreLoad = new EventEmitter();
        this.onColumnResized = new EventEmitter();
        this.onContextMenu = new EventEmitter();
        this.onDoubleClick = new EventEmitter();
        this.tabindex = 0;
        this.hostClass = "igx-grid";
        this.hostRole = "grid";
        this.eventBus = new Subject();
        this.allRowsSelected = false;
        this.lastSearchInfo = {
            searchText: "",
            caseSensitive: false,
            activeMatchIndex: 0,
            matchInfoCache: []
        };
        this.destroy$ = new Subject();
        this._perPage = 15;
        this._page = 0;
        this._paging = false;
        this._rowSelection = false;
        this._pipeTrigger = 0;
        this._columns = [];
        this._pinnedColumns = [];
        this._unpinnedColumns = [];
        this._filteringLogic = FilteringLogic.And;
        this._filteringExpressions = [];
        this._sortingExpressions = [];
        this._groupingExpressions = [];
        this._groupingExpandState = [];
        this._filteredData = null;
        this._height = "100%";
        this._width = "100%";
        this.resizeHandler = function () {
            _this.calculateGridSizes();
            _this.zone.run(function () { return _this.markForCheck(); });
        };
    }
    Object.defineProperty(IgxGridComponent.prototype, "filteringExpressions", {
        get: function () {
            return this._filteringExpressions;
        },
        set: function (value) {
            this._filteringExpressions = cloneArray(value);
            this.cdr.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "filteredData", {
        get: function () {
            return this._filteredData;
        },
        set: function (value) {
            var highlightedItem = this.findHiglightedItem();
            this._filteredData = value;
            if (this.rowSelectable) {
                this.updateHeaderChecboxStatusOnFilter(this._filteredData);
            }
            if (highlightedItem !== null) {
                this.restoreHighlight(highlightedItem);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "groupingExpressions", {
        get: function () {
            return this._groupingExpressions;
        },
        set: function (value) {
            this._groupingExpressions = cloneArray(value);
            this._applyGrouping();
            this.cdr.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "groupingExpansionState", {
        get: function () {
            return this._groupingExpandState;
        },
        set: function (value) {
            this._groupingExpandState = cloneArray(value);
            this.cdr.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "paging", {
        get: function () {
            return this._paging;
        },
        set: function (value) {
            this._paging = value;
            this._pipeTrigger++;
            this.cdr.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "page", {
        get: function () {
            return this._page;
        },
        set: function (val) {
            if (val < 0) {
                return;
            }
            this.onPagingDone.emit({ previous: this._page, current: val });
            this._page = val;
            this.cdr.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "perPage", {
        get: function () {
            return this._perPage;
        },
        set: function (val) {
            if (val < 0) {
                return;
            }
            var rowIndex = -1;
            var activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
            if (this.lastSearchInfo.searchText !== "") {
                rowIndex = (activeInfo.page * this._perPage) + activeInfo.rowIndex;
            }
            this._perPage = val;
            this.page = 0;
            if (this.lastSearchInfo.searchText !== "") {
                var newRowIndex = rowIndex % this._perPage;
                var newPage = Math.floor(rowIndex / this._perPage);
                IgxTextHighlightDirective.setActiveHighlight(this.id, activeInfo.columnIndex, newRowIndex, activeInfo.index, newPage);
                this.rebuildMatchCache();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "rowSelectable", {
        get: function () {
            return this._rowSelection;
        },
        set: function (val) {
            this._rowSelection = val;
            if (this.gridAPI.get(this.id)) {
                this.allRowsSelected = false;
                this.deselectAllRows();
                this.markForCheck();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            var _this = this;
            if (this._height !== value) {
                this._height = value;
                requestAnimationFrame(function () {
                    _this.calculateGridHeight();
                    _this.cdr.markForCheck();
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            var _this = this;
            if (this._width !== value) {
                this._width = value;
                requestAnimationFrame(function () {
                    _this.calculateGridWidth();
                    _this.cdr.markForCheck();
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "headerWidth", {
        get: function () {
            return parseInt(this._width, 10) - 17;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "pipeTrigger", {
        get: function () {
            return this._pipeTrigger;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "sortingExpressions", {
        get: function () {
            return this._sortingExpressions;
        },
        set: function (value) {
            var highlightedItem = this.findHiglightedItem();
            this._sortingExpressions = cloneArray(value);
            this.cdr.markForCheck();
            if (highlightedItem !== null) {
                this.restoreHighlight(highlightedItem);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "virtualizationState", {
        get: function () {
            return this.verticalScrollContainer.state;
        },
        set: function (state) {
            this.verticalScrollContainer.state = state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "totalItemCount", {
        get: function () {
            return this.verticalScrollContainer.totalItemCount;
        },
        set: function (count) {
            this.verticalScrollContainer.totalItemCount = count;
            this.cdr.detectChanges();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "calcGroupByWidth", {
        get: function () {
            return this.groupingExpressions.length * this.groupByIndentation;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridComponent.prototype.ngOnInit = function () {
        this.gridAPI.register(this);
        this.setEventBusSubscription();
        this.setVerticalScrollSubscription();
        this.columnListDiffer = this.differs.find([]).create(null);
        this.calcWidth = this._width && this._width.indexOf("%") === -1 ? parseInt(this._width, 10) : 0;
        this.calcHeight = 0;
        this.calcRowCheckboxWidth = 0;
    };
    IgxGridComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        if (this.autoGenerate) {
            this.autogenerateColumns();
        }
        if (this.groupTemplate) {
            this._groupRowTemplate = this.groupTemplate.template;
        }
        this.initColumns(this.columnList, function (col) { return _this.onColumnInit.emit(col); });
        this.columnListDiffer.diff(this.columnList);
        this.clearSummaryCache();
        this.tfootHeight = this.calcMaxSummaryHeight();
        this._derivePossibleHeight();
        this.markForCheck();
        this.columnList.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe(function (change) {
            var diff = _this.columnListDiffer.diff(change);
            if (diff) {
                _this.initColumns(_this.columnList);
                diff.forEachAddedItem(function (record) {
                    _this.clearSummaryCache();
                    _this.calculateGridSizes();
                    _this.onColumnInit.emit(record.item);
                });
                diff.forEachRemovedItem(function (record) {
                    _this.clearSummaryCache();
                    _this.calculateGridSizes();
                    _this.gridAPI.clear_filter(_this.id, record.item.field);
                    _this.gridAPI.clear_sort(_this.id, record.item.field);
                });
            }
            _this.markForCheck();
        });
    };
    IgxGridComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            _this.document.defaultView.addEventListener("resize", _this.resizeHandler);
        });
        this._derivePossibleWidth();
        this.calculateGridSizes();
    };
    IgxGridComponent.prototype.ngOnDestroy = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () { return _this.document.defaultView.removeEventListener("resize", _this.resizeHandler); });
        this.destroy$.next(true);
        this.destroy$.complete();
    };
    IgxGridComponent.prototype.dataLoading = function (event) {
        this.onDataPreLoad.emit(event);
    };
    Object.defineProperty(IgxGridComponent.prototype, "nativeElement", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "groupRowTemplate", {
        get: function () {
            return this._groupRowTemplate;
        },
        set: function (template) {
            this._groupRowTemplate = template;
            this.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "groupAreaTemplate", {
        get: function () {
            return this._groupAreaTemplate;
        },
        set: function (template) {
            this._groupAreaTemplate = template;
            this.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "calcResizerHeight", {
        get: function () {
            if (this.hasSummarizedColumns) {
                return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight +
                    this.tfoot.nativeElement.clientHeight;
            }
            return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "calcPinnedContainerMaxWidth", {
        get: function () {
            return (this.calcWidth * 80) / 100;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "unpinnedAreaMinWidth", {
        get: function () {
            return (this.calcWidth * 20) / 100;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "pinnedWidth", {
        get: function () {
            return this.getPinnedWidth();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "unpinnedWidth", {
        get: function () {
            return this.getUnpinnedWidth();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "summariesMargin", {
        get: function () {
            return this.rowSelectable ? this.calcRowCheckboxWidth : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "pinnedColumns", {
        get: function () {
            return this._pinnedColumns.filter(function (col) { return !col.hidden; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "unpinnedColumns", {
        get: function () {
            return this._unpinnedColumns.filter(function (col) { return !col.hidden; }).sort(function (col1, col2) { return col1.index - col2.index; });
        },
        enumerable: true,
        configurable: true
    });
    IgxGridComponent.prototype.getColumnByName = function (name) {
        return this.columnList.find(function (col) { return col.field === name; });
    };
    IgxGridComponent.prototype.getRowByIndex = function (index) {
        return this.gridAPI.get_row_by_index(this.id, index);
    };
    IgxGridComponent.prototype.getRowByKey = function (keyValue) {
        return this.gridAPI.get_row_by_key(this.id, keyValue);
    };
    Object.defineProperty(IgxGridComponent.prototype, "visibleColumns", {
        get: function () {
            return this.columnList.filter(function (col) { return !col.hidden; });
        },
        enumerable: true,
        configurable: true
    });
    IgxGridComponent.prototype.getCellByColumn = function (rowSelector, columnField) {
        return this.gridAPI.get_cell_by_field(this.id, rowSelector, columnField);
    };
    Object.defineProperty(IgxGridComponent.prototype, "totalPages", {
        get: function () {
            if (this.pagingState) {
                return this.pagingState.metadata.countPages;
            }
            return -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "totalRecords", {
        get: function () {
            if (this.pagingState) {
                return this.pagingState.metadata.countRecords;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "isFirstPage", {
        get: function () {
            return this.page === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "isLastPage", {
        get: function () {
            return this.page + 1 >= this.totalPages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "totalWidth", {
        get: function () {
            var cols = this.visibleColumns;
            var totalWidth = 0;
            var i = 0;
            for (i; i < cols.length; i++) {
                totalWidth += parseInt(cols[i].width, 10) || 0;
            }
            return totalWidth;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridComponent.prototype.nextPage = function () {
        if (!this.isLastPage) {
            this.page += 1;
        }
    };
    IgxGridComponent.prototype.previousPage = function () {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
    };
    IgxGridComponent.prototype.paginate = function (val) {
        if (val < 0) {
            return;
        }
        this.page = val;
    };
    IgxGridComponent.prototype.markForCheck = function () {
        if (this.rowList) {
            this.rowList.forEach(function (row) { return row.cdr.markForCheck(); });
        }
        this.cdr.detectChanges();
    };
    IgxGridComponent.prototype.addRow = function (data) {
        this.data.push(data);
        this.onRowAdded.emit({ data: data });
        this._pipeTrigger++;
        this.cdr.markForCheck();
        this.refreshSearch();
    };
    IgxGridComponent.prototype.deleteRow = function (rowSelector) {
        var row = this.gridAPI.get_row_by_key(this.id, rowSelector);
        if (row) {
            var index = this.data.indexOf(row.rowData);
            if (this.rowSelectable === true) {
                this.deselectRows([row.rowID]);
            }
            this.data.splice(index, 1);
            this.onRowDeleted.emit({ data: row.rowData });
            this._pipeTrigger++;
            this.cdr.markForCheck();
            this.refreshSearch();
        }
    };
    IgxGridComponent.prototype.updateCell = function (value, rowSelector, column) {
        var cell = this.gridAPI.get_cell_by_field(this.id, rowSelector, column);
        if (cell) {
            cell.update(value);
            this.cdr.detectChanges();
            this._pipeTrigger++;
        }
    };
    IgxGridComponent.prototype.updateRow = function (value, rowSelector) {
        var row = this.gridAPI.get_row_by_key(this.id, rowSelector);
        if (row) {
            if (this.primaryKey !== undefined && this.primaryKey !== null) {
                value[this.primaryKey] = row.rowData[this.primaryKey];
            }
            this.gridAPI.update_row(value, this.id, row);
            this._pipeTrigger++;
            this.cdr.markForCheck();
        }
    };
    IgxGridComponent.prototype.sort = function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._sortMultiple(rest[0]);
        }
        else {
            this._sort(rest[0], rest[1], rest[2]);
        }
    };
    IgxGridComponent.prototype.groupBy = function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._groupByMultiple(rest[0]);
        }
        else {
            this._groupBy(rest[0], rest[1], rest[2]);
        }
        this.calculateGridSizes();
    };
    IgxGridComponent.prototype.isExpandedGroup = function (group) {
        var state = this._getStateForGroupRow(group);
        return state ? state.expanded : this.groupByDefaultExpanded;
    };
    IgxGridComponent.prototype.toggleGroup = function (groupRow) {
        this._toggleGroup(groupRow);
    };
    IgxGridComponent.prototype.isGroupByRecord = function (record) {
        return record.records && record.records.length;
    };
    IgxGridComponent.prototype.filter = function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._filterMultiple(rest[0]);
        }
        else {
            this._filter(rest[0], rest[1], rest[2], rest[3]);
        }
    };
    IgxGridComponent.prototype.filterGlobal = function (value, condition, ignoreCase) {
        this.gridAPI.filter_global(this.id, value, condition, ignoreCase);
    };
    IgxGridComponent.prototype.enableSummaries = function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._multipleSummaries(rest[0], true);
        }
        else {
            this._summaries(rest[0], true, rest[1]);
        }
        this.tfootHeight = 0;
        this.markForCheck();
        this.calculateGridHeight();
        this.cdr.detectChanges();
    };
    IgxGridComponent.prototype.disableSummaries = function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._disableMultipleSummaries(rest[0], false);
        }
        else {
            this._summaries(rest[0], false);
        }
        this.tfootHeight = 0;
        this.markForCheck();
        this.calculateGridHeight();
        this.cdr.detectChanges();
    };
    IgxGridComponent.prototype.clearFilter = function (name) {
        if (!name) {
            this.filteringExpressions = [];
            this.filteredData = null;
            return;
        }
        if (!this.gridAPI.get_column_by_name(this.id, name)) {
            return;
        }
        this.clearSummaryCache();
        this.gridAPI.clear_filter(this.id, name);
    };
    IgxGridComponent.prototype.clearSort = function (name) {
        if (!name) {
            this.sortingExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(this.id, name)) {
            return;
        }
        this.gridAPI.clear_sort(this.id, name);
    };
    IgxGridComponent.prototype.clearSummaryCache = function () {
        this.gridAPI.remove_summary(this.id);
    };
    IgxGridComponent.prototype.pinColumn = function (columnName) {
        var col = this.getColumnByName(columnName);
        var colWidth = parseInt(col.width, 10);
        if (col.pinned) {
            return false;
        }
        if (this.getUnpinnedWidth(true) - colWidth < this.unpinnedAreaMinWidth) {
            return false;
        }
        var oldIndex = col.visibleIndex;
        col.pinned = true;
        var index = this._pinnedColumns.length;
        var args = { column: col, insertAtIndex: index };
        this.onColumnPinning.emit(args);
        if (this._pinnedColumns.indexOf(col) === -1) {
            this._pinnedColumns.splice(args.insertAtIndex, 0, col);
            if (this._unpinnedColumns.indexOf(col) !== -1) {
                this._unpinnedColumns.splice(this._unpinnedColumns.indexOf(col), 1);
            }
        }
        this.markForCheck();
        var newIndex = col.visibleIndex;
        col.updateHighlights(oldIndex, newIndex);
        return true;
    };
    IgxGridComponent.prototype.unpinColumn = function (columnName) {
        var col = this.getColumnByName(columnName);
        if (!col.pinned) {
            return false;
        }
        var oldIndex = col.visibleIndex;
        col.pinned = false;
        this._unpinnedColumns.splice(col.index, 0, col);
        if (this._pinnedColumns.indexOf(col) !== -1) {
            this._pinnedColumns.splice(this._pinnedColumns.indexOf(col), 1);
        }
        this.markForCheck();
        var newIndex = col.visibleIndex;
        col.updateHighlights(oldIndex, newIndex);
        return true;
    };
    IgxGridComponent.prototype.reflow = function () {
        this.calculateGridSizes();
    };
    IgxGridComponent.prototype.findNext = function (text, caseSensitive) {
        return this.find(text, 1, caseSensitive);
    };
    IgxGridComponent.prototype.findPrev = function (text, caseSensitive) {
        return this.find(text, -1, caseSensitive);
    };
    IgxGridComponent.prototype.refreshSearch = function (updateActiveInfo) {
        var _this = this;
        if (this.lastSearchInfo.searchText) {
            this.rebuildMatchCache();
            if (updateActiveInfo) {
                var activeInfo_1 = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
                this.lastSearchInfo.matchInfoCache.forEach(function (match, i) {
                    if (match.column === activeInfo_1.columnIndex &&
                        match.row === activeInfo_1.rowIndex &&
                        match.index === activeInfo_1.index &&
                        match.page === activeInfo_1.page) {
                        _this.lastSearchInfo.activeMatchIndex = i;
                    }
                });
            }
            return this.find(this.lastSearchInfo.searchText, 0, this.lastSearchInfo.caseSensitive, false);
        }
        else {
            return 0;
        }
    };
    IgxGridComponent.prototype.clearSearch = function () {
        this.lastSearchInfo = {
            searchText: "",
            caseSensitive: false,
            activeMatchIndex: 0,
            matchInfoCache: []
        };
        this.rowList.forEach(function (row) {
            row.cells.forEach(function (c) {
                c.clearHighlight();
            });
        });
    };
    Object.defineProperty(IgxGridComponent.prototype, "hasGroupableColumns", {
        get: function () {
            return this.columnList.some(function (col) { return col.groupable; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "hasSortableColumns", {
        get: function () {
            return this.columnList.some(function (col) { return col.sortable; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "hasEditableColumns", {
        get: function () {
            return this.columnList.some(function (col) { return col.editable; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "hasFilterableColumns", {
        get: function () {
            return this.columnList.some(function (col) { return col.filterable; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "hasSummarizedColumns", {
        get: function () {
            return this.columnList.some(function (col) { return col.hasSummary; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "selectedCells", {
        get: function () {
            if (this.rowList) {
                return this.rowList.map(function (row) { return row.cells.filter(function (cell) { return cell.selected; }); })
                    .reduce(function (a, b) { return a.concat(b); }, []);
            }
            return [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "rowBasedHeight", {
        get: function () {
            if (this.data && this.data.length) {
                return this.data.length * this.rowHeight;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridComponent.prototype._derivePossibleHeight = function () {
        if ((this._height && this._height.indexOf("%") === -1) || !this._height) {
            return;
        }
        if (!this.nativeElement.parentNode.clientHeight) {
            var viewPortHeight = screen.height;
            this._height = this.rowBasedHeight <= viewPortHeight ? null : viewPortHeight.toString();
        }
        else {
            var parentHeight = this.nativeElement.parentNode.getBoundingClientRect().height;
            this._height = this.rowBasedHeight <= parentHeight ? null : this._height;
        }
        this.calculateGridHeight();
        this.cdr.detectChanges();
    };
    IgxGridComponent.prototype._derivePossibleWidth = function () {
        if (!this.columnWidth) {
            this.columnWidth = this.getPossibleColumnWidth();
            this.initColumns(this.columnList);
        }
        this.calculateGridWidth();
    };
    IgxGridComponent.prototype.calculateGridHeight = function () {
        var computed = this.document.defaultView.getComputedStyle(this.nativeElement);
        if (!this._height) {
            this.calcHeight = null;
            if (this.hasSummarizedColumns && !this.tfootHeight) {
                this.tfootHeight = this.tfoot.nativeElement.firstElementChild ?
                    this.calcMaxSummaryHeight() : 0;
            }
            return;
        }
        if (this._height && this._height.indexOf("%") !== -1) {
            var pagingHeight = 0;
            var groupAreaHeight = 0;
            if (this.paging) {
                pagingHeight = this.paginator.nativeElement.firstElementChild ?
                    this.paginator.nativeElement.clientHeight : 0;
            }
            if (!this.tfootHeight) {
                this.tfootHeight = this.tfoot.nativeElement.firstElementChild ?
                    this.calcMaxSummaryHeight() : 0;
            }
            if (this.groupArea) {
                groupAreaHeight = this.groupArea.nativeElement.offsetHeight;
            }
            this.calcHeight = parseInt(computed.getPropertyValue("height"), 10) -
                this.theadRow.nativeElement.clientHeight -
                this.tfootHeight - pagingHeight - groupAreaHeight -
                this.scr.nativeElement.clientHeight;
        }
        else {
            var pagingHeight = 0;
            var groupAreaHeight = 0;
            if (this.paging) {
                pagingHeight = this.paginator.nativeElement.firstElementChild ?
                    this.paginator.nativeElement.clientHeight : 0;
            }
            if (!this.tfootHeight) {
                this.tfootHeight = this.tfoot.nativeElement.firstElementChild ?
                    this.calcMaxSummaryHeight() : 0;
            }
            if (this.groupArea) {
                groupAreaHeight = this.groupArea.nativeElement.offsetHeight;
            }
            this.calcHeight = parseInt(this._height, 10) -
                this.theadRow.nativeElement.getBoundingClientRect().height -
                this.tfootHeight - pagingHeight - groupAreaHeight -
                this.scr.nativeElement.clientHeight;
        }
    };
    IgxGridComponent.prototype.getPossibleColumnWidth = function () {
        var computedWidth = parseInt(this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue("width"), 10);
        var maxColumnWidth = Math.max.apply(Math, this.visibleColumns.map(function (col) { return parseInt(col.width, 10); })
            .filter(function (width) { return !isNaN(width); }));
        var sumExistingWidths = this.visibleColumns
            .filter(function (col) { return col.width !== null; })
            .reduce(function (prev, curr) { return prev + parseInt(curr.width, 10); }, 0);
        if (this.rowSelectable) {
            computedWidth -= this.headerCheckboxContainer.nativeElement.clientWidth;
        }
        var visibleColsWithNoWidth = this.visibleColumns.filter(function (col) { return col.width === null; });
        maxColumnWidth = !Number.isFinite(sumExistingWidths) ?
            Math.max(computedWidth / visibleColsWithNoWidth.length, MINIMUM_COLUMN_WIDTH) :
            Math.max((computedWidth - sumExistingWidths) / visibleColsWithNoWidth.length, MINIMUM_COLUMN_WIDTH);
        return maxColumnWidth.toString();
    };
    IgxGridComponent.prototype.calculateGridWidth = function () {
        var computed = this.document.defaultView.getComputedStyle(this.nativeElement);
        if (this._width && this._width.indexOf("%") !== -1) {
            this.calcWidth = parseInt(computed.getPropertyValue("width"), 10);
            return;
        }
        this.calcWidth = parseInt(this._width, 10);
    };
    IgxGridComponent.prototype.calcMaxSummaryHeight = function () {
        var _this = this;
        var maxSummaryLength = 0;
        this.columnList.filter(function (col) { return col.hasSummary; }).forEach(function (column) {
            _this.gridAPI.set_summary_by_column_name(_this.id, column.field);
            var currentLength = _this.gridAPI.get_summaries(_this.id).get(column.field).length;
            if (maxSummaryLength < currentLength) {
                maxSummaryLength = currentLength;
            }
        });
        return maxSummaryLength * (this.tfoot.nativeElement.clientHeight ? this.tfoot.nativeElement.clientHeight : DEFAULT_SUMMARY_HEIGHT);
    };
    IgxGridComponent.prototype.calculateGridSizes = function () {
        this.calculateGridWidth();
        this.cdr.detectChanges();
        this.calculateGridHeight();
        if (this.rowSelectable) {
            this.calcRowCheckboxWidth = this.headerCheckboxContainer.nativeElement.clientWidth;
        }
        this.cdr.detectChanges();
    };
    IgxGridComponent.prototype.getPinnedWidth = function (takeHidden) {
        if (takeHidden === void 0) { takeHidden = false; }
        var fc = takeHidden ? this._pinnedColumns : this.pinnedColumns;
        var sum = 0;
        for (var _i = 0, fc_1 = fc; _i < fc_1.length; _i++) {
            var col = fc_1[_i];
            sum += parseInt(col.width, 10);
        }
        if (this.rowSelectable) {
            sum += this.calcRowCheckboxWidth;
        }
        if (this.groupingExpressions.length > 0) {
            sum += this.calcGroupByWidth;
        }
        return sum;
    };
    IgxGridComponent.prototype.getUnpinnedWidth = function (takeHidden) {
        if (takeHidden === void 0) { takeHidden = false; }
        var width = this._width && this._width.indexOf("%") !== -1 ?
            this.calcWidth :
            parseInt(this._width, 10);
        return width - this.getPinnedWidth(takeHidden);
    };
    IgxGridComponent.prototype._sort = function (name, direction, ignoreCase) {
        if (direction === void 0) { direction = SortingDirection.Asc; }
        if (ignoreCase === void 0) { ignoreCase = true; }
        this.gridAPI.sort(this.id, name, direction, ignoreCase);
    };
    IgxGridComponent.prototype._sortMultiple = function (expressions) {
        this.gridAPI.sort_multiple(this.id, expressions);
    };
    IgxGridComponent.prototype._groupBy = function (name, direction, ignoreCase) {
        if (direction === void 0) { direction = SortingDirection.Asc; }
        if (ignoreCase === void 0) { ignoreCase = true; }
        this.gridAPI.groupBy(this.id, name, direction, ignoreCase);
    };
    IgxGridComponent.prototype._groupByMultiple = function (expressions) {
        this.gridAPI.groupBy_multiple(this.id, expressions);
    };
    IgxGridComponent.prototype._getStateForGroupRow = function (groupRow) {
        return this.gridAPI.groupBy_get_expanded_for_group(this.id, groupRow);
    };
    IgxGridComponent.prototype._toggleGroup = function (groupRow) {
        this.gridAPI.groupBy_toggle_group(this.id, groupRow);
    };
    IgxGridComponent.prototype._applyGrouping = function () {
        this.gridAPI.sort_multiple(this.id, this._groupingExpressions);
    };
    IgxGridComponent.prototype._filter = function (name, value, condition, ignoreCase) {
        var col = this.gridAPI.get_column_by_name(this.id, name);
        if (col) {
            this.gridAPI
                .filter(this.id, name, value, condition || col.filteringCondition, ignoreCase || col.filteringIgnoreCase);
        }
        else {
            this.gridAPI.filter(this.id, name, value, condition, ignoreCase);
        }
    };
    IgxGridComponent.prototype._filterMultiple = function (expressions) {
        this.gridAPI.filter_multiple(this.id, expressions);
    };
    IgxGridComponent.prototype._summaries = function (fieldName, hasSummary, summaryOperand) {
        var column = this.gridAPI.get_column_by_name(this.id, fieldName);
        column.hasSummary = hasSummary;
        if (summaryOperand) {
            column.summaries = summaryOperand;
        }
    };
    IgxGridComponent.prototype._multipleSummaries = function (expressions, hasSummary) {
        var _this = this;
        expressions.forEach(function (element) {
            _this._summaries(element.fieldName, hasSummary, element.customSummary);
        });
    };
    IgxGridComponent.prototype._disableMultipleSummaries = function (expressions, hasSummary) {
        var _this = this;
        expressions.forEach(function (column) { _this._summaries(column, false); });
    };
    IgxGridComponent.prototype.resolveDataTypes = function (rec) {
        if (typeof rec === "number") {
            return DataType.Number;
        }
        else if (typeof rec === "boolean") {
            return DataType.Boolean;
        }
        else if (typeof rec === "object" && rec instanceof Date) {
            return DataType.Date;
        }
        return DataType.String;
    };
    IgxGridComponent.prototype.autogenerateColumns = function () {
        var _this = this;
        var factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        var fields = Object.keys(this.data[0]);
        var columns = [];
        fields.forEach(function (field) {
            var ref = _this.viewRef.createComponent(factory);
            ref.instance.field = field;
            ref.instance.dataType = _this.resolveDataTypes(_this.data[0][field]);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });
        this.columnList.reset(columns);
    };
    IgxGridComponent.prototype.initColumns = function (collection, cb) {
        var _this = this;
        if (cb === void 0) { cb = null; }
        collection.forEach(function (column, index) {
            column.gridID = _this.id;
            column.index = index;
            if (!column.width) {
                column.width = _this.columnWidth;
            }
            if (cb) {
                cb(column);
            }
        });
        this._columns = this.columnList.toArray();
        this._pinnedColumns = this.columnList.filter(function (c) { return c.pinned; });
        this._unpinnedColumns = this.columnList.filter(function (c) { return !c.pinned; });
    };
    IgxGridComponent.prototype.setEventBusSubscription = function () {
        var _this = this;
        this.eventBus.pipe(debounceTime(DEBOUNCE_TIME), takeUntil(this.destroy$)).subscribe(function () { return _this.cdr.detectChanges(); });
    };
    IgxGridComponent.prototype.setVerticalScrollSubscription = function () {
        var _this = this;
        this.verticalScrollContainer.onChunkLoad.pipe(takeUntil(this.destroy$), take(1), merge(of({})), delay(DEBOUNCE_TIME), repeat()).subscribe(function () {
            if (_this.cellInEditMode) {
                _this.cellInEditMode.inEditMode = false;
            }
            _this.eventBus.next();
        });
    };
    IgxGridComponent.prototype.onHeaderCheckboxClick = function (event) {
        this.allRowsSelected = event.checked;
        var newSelection = event.checked ?
            this.filteredData ?
                this.selectionAPI.append_items(this.id, this.selectionAPI.get_all_ids(this._filteredData, this.primaryKey)) :
                this.selectionAPI.get_all_ids(this.data, this.primaryKey) :
            this.filteredData ?
                this.selectionAPI.subtract_items(this.id, this.selectionAPI.get_all_ids(this._filteredData, this.primaryKey)) :
                [];
        this.triggerRowSelectionChange(newSelection, null, event, event.checked);
        this.checkHeaderChecboxStatus(event.checked);
    };
    Object.defineProperty(IgxGridComponent.prototype, "headerCheckboxAriaLabel", {
        get: function () {
            return this._filteringExpressions.length > 0 ?
                this.headerCheckbox && this.headerCheckbox.checked ? "Deselect all filtered" : "Select all filtered" :
                this.headerCheckbox && this.headerCheckbox.checked ? "Deselect all" : "Select all";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridComponent.prototype, "template", {
        get: function () {
            if (this.filteredData && this.filteredData.length === 0) {
                return this.emptyGridTemplate;
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxGridComponent.prototype.checkHeaderChecboxStatus = function (headerStatus) {
        if (headerStatus === undefined) {
            this.allRowsSelected = this.selectionAPI.are_all_selected(this.id, this.data);
            if (this.headerCheckbox) {
                this.headerCheckbox.indeterminate = !this.allRowsSelected && !this.selectionAPI.are_none_selected(this.id);
                if (!this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.checked = this.selectionAPI.are_all_selected(this.id, this.data);
                }
            }
            this.cdr.markForCheck();
        }
        else if (this.headerCheckbox) {
            this.headerCheckbox.checked = headerStatus !== undefined ? headerStatus : false;
        }
    };
    IgxGridComponent.prototype.filteredItemsStatus = function (componentID, filteredData, primaryKey) {
        var currSelection = this.selectionAPI.get_selection(componentID);
        var atLeastOneSelected = false;
        var notAllSelected = false;
        if (currSelection) {
            for (var _i = 0, _a = Object.keys(filteredData); _i < _a.length; _i++) {
                var key = _a[_i];
                var dataItem = primaryKey ? filteredData[key][primaryKey] : filteredData[key];
                if (currSelection.indexOf(dataItem) !== -1) {
                    atLeastOneSelected = true;
                    if (notAllSelected) {
                        return "indeterminate";
                    }
                }
                else {
                    notAllSelected = true;
                    if (atLeastOneSelected) {
                        return "indeterminate";
                    }
                }
            }
        }
        return atLeastOneSelected ? "allSelected" : "noneSelected";
    };
    IgxGridComponent.prototype.updateHeaderChecboxStatusOnFilter = function (data) {
        if (!data) {
            data = this.data;
        }
        switch (this.filteredItemsStatus(this.id, data)) {
            case "allSelected": {
                if (!this.allRowsSelected) {
                    this.allRowsSelected = true;
                }
                if (this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.indeterminate = false;
                }
                break;
            }
            case "noneSelected": {
                if (this.allRowsSelected) {
                    this.allRowsSelected = false;
                }
                if (this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.indeterminate = false;
                }
                break;
            }
            default: {
                if (!this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.indeterminate = true;
                }
                if (this.allRowsSelected) {
                    this.allRowsSelected = false;
                }
                break;
            }
        }
    };
    IgxGridComponent.prototype.selectedRows = function () {
        return this.selectionAPI.get_selection(this.id) || [];
    };
    IgxGridComponent.prototype.selectRows = function (rowIDs, clearCurrentSelection) {
        var newSelection = clearCurrentSelection ? rowIDs : this.selectionAPI.select_items(this.id, rowIDs);
        this.triggerRowSelectionChange(newSelection);
    };
    IgxGridComponent.prototype.deselectRows = function (rowIDs) {
        var newSelection = this.selectionAPI.deselect_items(this.id, rowIDs);
        this.triggerRowSelectionChange(newSelection);
    };
    IgxGridComponent.prototype.selectAllRows = function () {
        this.triggerRowSelectionChange(this.selectionAPI.get_all_ids(this.data, this.primaryKey));
    };
    IgxGridComponent.prototype.deselectAllRows = function () {
        this.triggerRowSelectionChange([]);
    };
    IgxGridComponent.prototype.triggerRowSelectionChange = function (newSelection, row, event, headerStatus) {
        var oldSelection = this.selectionAPI.get_selection(this.id);
        var args = { oldSelection: oldSelection, newSelection: newSelection, row: row, event: event };
        this.onRowSelectionChange.emit(args);
        this.selectionAPI.set_selection(this.id, args.newSelection);
        this.checkHeaderChecboxStatus(headerStatus);
    };
    IgxGridComponent.prototype.navigateDown = function (rowIndex, columnIndex) {
        var row = this.gridAPI.get_row_by_index(this.id, rowIndex);
        var target = row instanceof IgxGridGroupByRowComponent ?
            row.groupContent :
            this.gridAPI.get_cell_by_visible_index(this.id, rowIndex, columnIndex);
        var verticalScroll = this.verticalScrollContainer.getVerticalScroll();
        if (!verticalScroll && !target) {
            return;
        }
        if (target) {
            var containerHeight = this.calcHeight ?
                Math.ceil(this.calcHeight) :
                null;
            var containerTopOffset = parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            var targetEndTopOffset = row.element.nativeElement.offsetTop + this.rowHeight + containerTopOffset;
            if (containerHeight && targetEndTopOffset > containerHeight) {
                var scrollAmount = targetEndTopOffset - containerHeight;
                this.verticalScrollContainer.addScrollTop(scrollAmount);
                this._focusNextCell(rowIndex, columnIndex);
            }
            else {
                target.nativeElement.focus();
            }
        }
        else {
            var containerHeight = this.calcHeight;
            var contentHeight = this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.offsetHeight;
            var scrollOffset = parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            var lastRowOffset = contentHeight + scrollOffset - this.calcHeight;
            var scrollAmount = this.rowHeight + lastRowOffset;
            this.verticalScrollContainer.addScrollTop(scrollAmount);
            this._focusNextCell(rowIndex, columnIndex);
        }
    };
    IgxGridComponent.prototype.navigateUp = function (rowIndex, columnIndex) {
        var row = this.gridAPI.get_row_by_index(this.id, rowIndex);
        var target = row instanceof IgxGridGroupByRowComponent ?
            row.groupContent :
            this.gridAPI.get_cell_by_visible_index(this.id, rowIndex, columnIndex);
        var verticalScroll = this.verticalScrollContainer.getVerticalScroll();
        if (!verticalScroll && !target) {
            return;
        }
        if (target) {
            var containerTopOffset = parseInt(row.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            if (this.rowHeight > -containerTopOffset
                && verticalScroll.scrollTop
                && row.element.nativeElement.offsetTop < this.rowHeight) {
                this.verticalScrollContainer.addScrollTop(-this.rowHeight);
                this._focusNextCell(rowIndex, columnIndex);
            }
            target.nativeElement.focus();
        }
        else {
            var scrollOffset = -parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            var scrollAmount = this.rowHeight + scrollOffset;
            this.verticalScrollContainer.addScrollTop(-scrollAmount);
            this._focusNextCell(rowIndex, columnIndex);
        }
    };
    IgxGridComponent.prototype._focusNextCell = function (rowIndex, columnIndex, dir) {
        var _this = this;
        var row = this.gridAPI.get_row_by_index(this.id, rowIndex);
        var virtualDir = dir !== undefined ? row.virtDirRow : this.verticalScrollContainer;
        this.subscribeNext(virtualDir, function () {
            _this.cdr.detectChanges();
            var target;
            row = _this.gridAPI.get_row_by_index(_this.id, rowIndex);
            target = _this.gridAPI.get_cell_by_visible_index(_this.id, rowIndex, columnIndex);
            if (!target) {
                if (dir) {
                    target = dir === "left" ? row.cells.first : row.cells.last;
                }
                else if (row instanceof IgxGridGroupByRowComponent) {
                    target = row.groupContent;
                }
                else if (row) {
                    target = row.cells.first;
                }
                else {
                    return;
                }
            }
            target.nativeElement.focus();
        });
    };
    IgxGridComponent.prototype.subscribeNext = function (virtualContainer, callback) {
        virtualContainer.onChunkLoad.pipe(take(1)).subscribe({
            next: function (e) {
                callback(e);
            }
        });
    };
    IgxGridComponent.prototype.trackColumnChanges = function (index, col) {
        return col.field + col.width;
    };
    IgxGridComponent.prototype.find = function (text, increment, caseSensitive, scroll) {
        if (!this.rowList) {
            return 0;
        }
        if (this.cellInEditMode) {
            this.cellInEditMode.inEditMode = false;
        }
        if (!text) {
            this.clearSearch();
            return 0;
        }
        var caseSensitiveResolved = caseSensitive ? true : false;
        var rebuildCache = false;
        if (this.lastSearchInfo.searchText !== text || this.lastSearchInfo.caseSensitive !== caseSensitiveResolved) {
            this.lastSearchInfo = {
                searchText: text,
                activeMatchIndex: 0,
                caseSensitive: caseSensitiveResolved,
                matchInfoCache: []
            };
            rebuildCache = true;
        }
        else {
            this.lastSearchInfo.activeMatchIndex += increment;
        }
        if (rebuildCache) {
            this.rowList.forEach(function (row) {
                row.cells.forEach(function (c) {
                    c.highlightText(text, caseSensitiveResolved);
                });
            });
            this.rebuildMatchCache();
        }
        if (this.lastSearchInfo.activeMatchIndex >= this.lastSearchInfo.matchInfoCache.length) {
            this.lastSearchInfo.activeMatchIndex = 0;
        }
        else if (this.lastSearchInfo.activeMatchIndex < 0) {
            this.lastSearchInfo.activeMatchIndex = this.lastSearchInfo.matchInfoCache.length - 1;
        }
        if (this.lastSearchInfo.matchInfoCache.length) {
            var matchInfo = this.lastSearchInfo.matchInfoCache[this.lastSearchInfo.activeMatchIndex];
            var row = this.paging ? matchInfo.row % this.perPage : matchInfo.row;
            IgxTextHighlightDirective.setActiveHighlight(this.id, matchInfo.column, row, matchInfo.index, matchInfo.page);
            if (scroll !== false) {
                this.scrollTo(matchInfo.row, matchInfo.column, matchInfo.page);
            }
        }
        else {
            IgxTextHighlightDirective.setActiveHighlight(this.id, -1, -1, -1, -1);
        }
        return this.lastSearchInfo.matchInfoCache.length;
    };
    Object.defineProperty(IgxGridComponent.prototype, "filteredSortedData", {
        get: function () {
            var data = this.filteredData ? this.filteredData : this.data;
            if (this.sortingExpressions &&
                this.sortingExpressions.length > 0) {
                var sortingPipe = new IgxGridSortingPipe(this.gridAPI);
                data = sortingPipe.transform(data, this.sortingExpressions, this.id, -1);
            }
            return data;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridComponent.prototype.scrollTo = function (row, column, page) {
        if (this.paging) {
            this.page = page;
        }
        this.scrollDirective(this.verticalScrollContainer, row);
        if (this.pinnedColumns.length) {
            if (column >= this.pinnedColumns.length) {
                column -= this.pinnedColumns.length;
                this.scrollDirective(this.rowList.first.virtDirRow, column);
            }
        }
        else {
            this.scrollDirective(this.rowList.first.virtDirRow, column);
        }
    };
    IgxGridComponent.prototype.scrollDirective = function (directive, goal) {
        var state = directive.state;
        var start = state.startIndex;
        var size = state.chunkSize - 1;
        if (start >= goal) {
            directive.scrollTo(goal);
        }
        else if (start + size <= goal) {
            directive.scrollTo(goal - size + 1);
        }
    };
    IgxGridComponent.prototype.rebuildMatchCache = function () {
        var _this = this;
        this.lastSearchInfo.matchInfoCache = [];
        var caseSensitive = this.lastSearchInfo.caseSensitive;
        var searchText = caseSensitive ? this.lastSearchInfo.searchText : this.lastSearchInfo.searchText.toLowerCase();
        var data = this.filteredSortedData;
        var keys = this.visibleColumns.sort(function (c1, c2) { return c1.visibleIndex - c2.visibleIndex; }).map(function (c) { return c.field; });
        data.forEach(function (dataRow, i) {
            var rowIndex = _this.paging ? i % _this.perPage : i;
            keys.forEach(function (key, j) {
                var value = dataRow[key];
                if (value !== undefined && value !== null) {
                    var searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
                    var occurenceIndex = 0;
                    var searchIndex = searchValue.indexOf(searchText);
                    var pageIndex = _this.paging ? Math.floor(i / _this.perPage) : 0;
                    while (searchIndex !== -1) {
                        _this.lastSearchInfo.matchInfoCache.push({
                            row: rowIndex,
                            column: j,
                            page: pageIndex,
                            index: occurenceIndex++
                        });
                        searchValue = searchValue.substring(searchIndex + searchText.length);
                        searchIndex = searchValue.indexOf(searchText);
                    }
                }
            });
        });
    };
    IgxGridComponent.prototype.findHiglightedItem = function () {
        if (this.lastSearchInfo.searchText !== "") {
            var activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
            var activeIndex = (activeInfo.page * this.perPage) + activeInfo.rowIndex;
            var data = this.filteredSortedData;
            return data[activeIndex];
        }
        else {
            return null;
        }
    };
    IgxGridComponent.prototype.restoreHighlight = function (highlightedItem) {
        var _this = this;
        var activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
        var data = this.filteredSortedData;
        var rowIndex = data.indexOf(highlightedItem);
        var page = this.paging ? Math.floor(rowIndex / this.perPage) : 0;
        var row = this.paging ? rowIndex % this.perPage : rowIndex;
        this.rebuildMatchCache();
        if (rowIndex !== -1) {
            IgxTextHighlightDirective.setActiveHighlight(this.id, activeInfo.columnIndex, row, activeInfo.index, page);
            this.lastSearchInfo.matchInfoCache.forEach(function (match, i) {
                if (match.column === activeInfo.columnIndex &&
                    match.row === rowIndex &&
                    match.index === activeInfo.index &&
                    match.page === page) {
                    _this.lastSearchInfo.activeMatchIndex = i;
                }
            });
        }
        else {
            this.lastSearchInfo.activeMatchIndex = 0;
            this.find(this.lastSearchInfo.searchText, 0, this.lastSearchInfo.caseSensitive, false);
        }
    };
    IgxGridComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-grid",
                    template: "<ng-template #defaultPager let-api>         <button [disabled]=\"api.isFirstPage\" (click)=\"api.paginate(0)\" igxButton=\"icon\" igxRipple igxRippleCentered=\"true\">             <igx-icon fontSet=\"material\" name=\"first_page\"></igx-icon>         </button>         <button [disabled]=\"api.isFirstPage\" (click)=\"api.previousPage()\" igxButton=\"icon\" igxRipple igxRippleCentered=\"true\">             <igx-icon fontSet=\"material\" name=\"chevron_left\"></igx-icon>         </button>         <span>{{ api.page + 1 }} of {{ api.totalPages }}</span>         <button [disabled]=\"api.isLastPage\" (click)=\"api.nextPage()\" igxRipple igxRippleCentered=\"true\" igxButton=\"icon\">             <igx-icon fontSet=\"material\" name=\"chevron_right\"></igx-icon>         </button>         <button [disabled]=\"api.isLastPage\" (click)=\"api.paginate(api.totalPages - 1)\" igxButton=\"icon\" igxRipple igxRippleCentered=\"true\">             <igx-icon fontSet=\"material\" name=\"last_page\"></igx-icon>         </button>         <select style=\"margin-left: 1rem;\" (change)=\"api.perPage = $event.target.value\">             <option [value]=\"val\" [selected]=\"api.perPage == val\" *ngFor=\"let val of [5, 10, 15, 25, 50, 100, 500]\">{{ val }}</option>         </select> </ng-template>  <div class=\"igx-grouparea igx-grid__grouparea\" *ngIf=\"groupingExpressions.length > 0 || hasGroupableColumns\" #groupArea>     <span>Drag a column header and drop it here to group by that column</span> </div>  <div class=\"igx-grid__thead\" role=\"rowgroup\" [style.width.px]='calcWidth' #theadRow>     <div class=\"igx-grid__tr\" role=\"row\">         <ng-container *ngIf=\"groupingExpressions.length > 0\">             <div class=\"igx-grid__groupIndentation\" [style.min-width.px]=\"calcGroupByWidth\">             </div>         </ng-container>         <ng-container *ngIf=\"rowSelectable\">             <div class=\"igx-grid__cbx-selection\" #headerCheckboxContainer>                 <igx-checkbox [checked]=\"allRowsSelected\" (change)=\"onHeaderCheckboxClick($event)\" disableRipple=\"true\" [aria-label]=\"headerCheckboxAriaLabel\" #headerCheckbox></igx-checkbox>             </div>         </ng-container>         <ng-container *ngIf=\"pinnedColumns.length > 0\">             <igx-grid-header [gridID]=\"id\" *ngFor=\"let col of pinnedColumns\" [column]=\"col\" [style.min-width.px]=\"col.width\" [style.flex-basis.px]=\"col.width\"></igx-grid-header>         </ng-container>         <ng-template igxFor let-col [igxForOf]=\"unpinnedColumns\" [igxForScrollOrientation]=\"'horizontal'\" [igxForScrollContainer]=\"parentVirtDir\"             [igxForContainerSize]='unpinnedWidth' [igxForTrackBy]='trackColumnChanges' #headerContainer>             <igx-grid-header [gridID]=\"id\" [column]=\"col\" [style.min-width.px]=\"col.width\" [style.flex-basis.px]='col.width'></igx-grid-header>         </ng-template>     </div> </div>  <div class=\"igx-grid__tbody\" role=\"rowgroup\" [style.height.px]='calcHeight' [style.width.px]='calcWidth' #tbody>     <ng-template igxFor let-rowData [igxForOf]=\"data | gridFiltering:filteringExpressions:filteringLogic:id:pipeTrigger     | gridSort:sortingExpressions:id:pipeTrigger     | gridPreGroupBy:groupingExpressions:groupingExpansionState:groupByDefaultExpanded:id:pipeTrigger     | gridPaging:page:perPage:id:pipeTrigger     | gridPostGroupBy:groupingExpressions:groupingExpansionState:groupByDefaultExpanded:id:pipeTrigger\" let-rowIndex=\"index\" [igxForScrollOrientation]=\"'vertical'\"     [igxForContainerSize]='calcHeight' [igxForItemSize]=\"rowHeight\" #verticalScrollContainer (onChunkPreload)=\"dataLoading($event)\">         <ng-container *ngIf=\"isGroupByRecord(rowData); else record_template\">             <igx-grid-groupby-row [gridID]=\"id\" [index]=\"rowIndex\" [groupRow]=\"rowData\" #row>             </igx-grid-groupby-row>         </ng-container>         <ng-template #record_template>             <igx-grid-row [gridID]=\"id\" [index]=\"rowIndex\" [rowData]=\"rowData\" #row>             </igx-grid-row>         </ng-template>     </ng-template>     <ng-container *ngTemplateOutlet=\"template\"></ng-container> </div>   <div class=\"igx-grid__tfoot\" role=\"rowgroup\" [style.width.px]='calcWidth' #tfoot>     <div *ngIf=\"hasSummarizedColumns\" class=\"igx-grid__tr\" [style.height.px]=\"tfootHeight\" [style.marginLeft.px]=\"summariesMargin\" role=\"row\">         <ng-container *ngIf=\"pinnedColumns.length > 0\">             <igx-grid-summary [gridID]=\"id\" *ngFor=\"let col of pinnedColumns\"  [column]=\"col\" [style.min-width.px]=\"col.width\" [style.flex-basis.px]='col.width'></igx-grid-summary>         </ng-container>         <ng-template igxFor let-col [igxForOf]=\"unpinnedColumns\" [igxForScrollOrientation]=\"'horizontal'\" [igxForScrollContainer]=\"parentVirtDir\" [igxForContainerSize]='unpinnedWidth' [igxForTrackBy]='trackColumnChanges' #summaryContainer>             <igx-grid-summary [gridID]=\"id\" [column]=\"col\" [style.min-width.px]=\"col.width\" [style.flex-basis.px]='col.width'></igx-grid-summary>         </ng-template>     </div> </div>  <div class=\"igx-grid__scroll\" [style.height]=\"'18px'\" #scr [hidden]=\"calcWidth - totalWidth >= 0\">     <div class=\"igx-grid__scroll-start\" [style.width.px]='pinnedWidth' [hidden]=\"pinnedWidth === 0\"></div>     <div class=\"igx-grid__scroll-main\" [style.width.px]='unpinnedWidth'>         <ng-template igxFor [igxForOf]='[]' #scrollContainer>         </ng-template>     </div> </div>  <div class=\"igx-paginator igx-grid-paginator\" *ngIf=\"paging\" #paginator>     <ng-container *ngTemplateOutlet=\"paginationTemplate ? paginationTemplate : defaultPager; context: { $implicit: this }\">     </ng-container> </div>  <ng-template #emptyGrid>     <span class=\"igx-grid__tbody-message\">{{emptyGridMessage}}</span> </ng-template>"
                },] },
    ];
    IgxGridComponent.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
        { type: IgxSelectionAPIService, },
        { type: ElementRef, },
        { type: NgZone, },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
        { type: ChangeDetectorRef, },
        { type: ComponentFactoryResolver, },
        { type: IterableDiffers, },
        { type: ViewContainerRef, },
    ]; };
    IgxGridComponent.propDecorators = {
        "data": [{ type: Input },],
        "autoGenerate": [{ type: Input },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "filteringLogic": [{ type: Input },],
        "filteringExpressions": [{ type: Input },],
        "groupByIndentation": [{ type: Input },],
        "groupingExpressions": [{ type: Input },],
        "groupingExpansionState": [{ type: Input },],
        "groupByDefaultExpanded": [{ type: Input },],
        "paging": [{ type: Input },],
        "page": [{ type: Input },],
        "perPage": [{ type: Input },],
        "paginationTemplate": [{ type: Input },],
        "rowSelectable": [{ type: Input },],
        "height": [{ type: HostBinding, args: ["style.height",] }, { type: Input },],
        "width": [{ type: HostBinding, args: ["style.width",] }, { type: Input },],
        "evenRowCSS": [{ type: Input },],
        "oddRowCSS": [{ type: Input },],
        "rowHeight": [{ type: Input },],
        "columnWidth": [{ type: Input },],
        "primaryKey": [{ type: Input },],
        "emptyGridMessage": [{ type: Input },],
        "onCellClick": [{ type: Output },],
        "onSelection": [{ type: Output },],
        "onRowSelectionChange": [{ type: Output },],
        "onColumnPinning": [{ type: Output },],
        "onEditDone": [{ type: Output },],
        "onColumnInit": [{ type: Output },],
        "onSortingDone": [{ type: Output },],
        "onFilteringDone": [{ type: Output },],
        "onPagingDone": [{ type: Output },],
        "onRowAdded": [{ type: Output },],
        "onRowDeleted": [{ type: Output },],
        "onGroupingDone": [{ type: Output },],
        "onDataPreLoad": [{ type: Output },],
        "onColumnResized": [{ type: Output },],
        "onContextMenu": [{ type: Output },],
        "onDoubleClick": [{ type: Output },],
        "columnList": [{ type: ContentChildren, args: [IgxColumnComponent, { read: IgxColumnComponent },] },],
        "groupTemplate": [{ type: ContentChild, args: [IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective },] },],
        "rowList": [{ type: ViewChildren, args: ["row",] },],
        "dataRowList": [{ type: ViewChildren, args: [IgxGridRowComponent, { read: IgxGridRowComponent },] },],
        "groupedRowList": [{ type: ViewChildren, args: [IgxGridGroupByRowComponent, { read: IgxGridGroupByRowComponent },] },],
        "emptyGridTemplate": [{ type: ViewChild, args: ["emptyGrid", { read: TemplateRef },] },],
        "parentVirtDir": [{ type: ViewChild, args: ["scrollContainer", { read: IgxForOfDirective },] },],
        "verticalScrollContainer": [{ type: ViewChild, args: ["verticalScrollContainer", { read: IgxForOfDirective },] },],
        "scr": [{ type: ViewChild, args: ["scr", { read: ElementRef },] },],
        "paginator": [{ type: ViewChild, args: ["paginator", { read: ElementRef },] },],
        "headerContainer": [{ type: ViewChild, args: ["headerContainer", { read: IgxForOfDirective },] },],
        "headerCheckboxContainer": [{ type: ViewChild, args: ["headerCheckboxContainer",] },],
        "headerCheckbox": [{ type: ViewChild, args: ["headerCheckbox", { read: IgxCheckboxComponent },] },],
        "groupArea": [{ type: ViewChild, args: ["groupArea",] },],
        "theadRow": [{ type: ViewChild, args: ["theadRow",] },],
        "tbody": [{ type: ViewChild, args: ["tbody",] },],
        "tfoot": [{ type: ViewChild, args: ["tfoot",] },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "hostClass": [{ type: HostBinding, args: ["attr.class",] },],
        "hostRole": [{ type: HostBinding, args: ["attr.role",] },],
        "sortingExpressions": [{ type: Input },],
    };
    return IgxGridComponent;
}());
export { IgxGridComponent };
