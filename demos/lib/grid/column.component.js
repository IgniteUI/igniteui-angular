import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Input } from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { IgxTextHighlightDirective } from "../directives/text-highlight/text-highlight.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand } from "./grid-summary";
import { IgxCellEditorTemplateDirective, IgxCellFooterTemplateDirective, IgxCellHeaderTemplateDirective, IgxCellTemplateDirective } from "./grid.common";
var IgxColumnComponent = (function () {
    function IgxColumnComponent(gridAPI, cdr) {
        this.gridAPI = gridAPI;
        this.cdr = cdr;
        this.header = "";
        this.sortable = false;
        this.groupable = false;
        this.editable = false;
        this.filterable = false;
        this.resizable = false;
        this.hasSummary = false;
        this.movable = false;
        this.minWidth = this.defaultMinWidth;
        this.headerClasses = "";
        this.cellClasses = "";
        this.filteringIgnoreCase = true;
        this.sortingIgnoreCase = true;
        this.dataType = DataType.String;
        this.pinned = false;
        this._summaries = null;
        this._hidden = false;
        this._defaultMinWidth = "88";
    }
    Object.defineProperty(IgxColumnComponent.prototype, "hidden", {
        get: function () {
            return this._hidden;
        },
        set: function (value) {
            if (this._hidden !== value) {
                this._hidden = value;
                this.check();
                if (this.grid) {
                    var activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.grid.id);
                    var oldIndex = activeInfo.columnIndex;
                    if (this.grid.lastSearchInfo.searchText) {
                        if (this.index <= oldIndex) {
                            var newIndex = this.hidden ? oldIndex - 1 : oldIndex + 1;
                            this.updateHighlights(oldIndex, newIndex);
                        }
                        else if (oldIndex === -1 && !this.hidden) {
                            this.grid.refreshSearch();
                        }
                    }
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (value) {
            if (this._index !== value) {
                this._index = value;
                this.check();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "summaries", {
        get: function () {
            return this._summaries;
        },
        set: function (classRef) {
            this._summaries = new classRef();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "defaultMinWidth", {
        get: function () {
            return this._defaultMinWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "grid", {
        get: function () {
            return this.gridAPI.get(this.gridID);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "bodyTemplate", {
        get: function () {
            return this._bodyTemplate;
        },
        set: function (template) {
            this._bodyTemplate = template;
            this.grid.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "headerTemplate", {
        get: function () {
            return this._headerTemplate;
        },
        set: function (template) {
            this._headerTemplate = template;
            this.grid.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "footerTemplate", {
        get: function () {
            return this._headerTemplate;
        },
        set: function (template) {
            this._footerTemplate = template;
            this.grid.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "inlineEditorTemplate", {
        get: function () {
            return this._inlineEditorTemplate;
        },
        set: function (template) {
            this._inlineEditorTemplate = template;
            this.grid.markForCheck();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "cells", {
        get: function () {
            var _this = this;
            return this.grid.rowList.map(function (row) { return row.cells.filter(function (cell) { return cell.columnIndex === _this.index; }); })
                .reduce(function (a, b) { return a.concat(b); }, []);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxColumnComponent.prototype, "visibleIndex", {
        get: function () {
            var grid = this.gridAPI.get(this.gridID);
            var vIndex = -1;
            if (!this.pinned) {
                var indexInCollection = grid.unpinnedColumns.indexOf(this);
                vIndex = indexInCollection === -1 ? -1 : grid.pinnedColumns.length + indexInCollection;
            }
            else {
                vIndex = grid.pinnedColumns.indexOf(this);
            }
            return vIndex;
        },
        enumerable: true,
        configurable: true
    });
    IgxColumnComponent.prototype.ngAfterContentInit = function () {
        if (this.cellTemplate) {
            this._bodyTemplate = this.cellTemplate.template;
        }
        if (this.headTemplate) {
            this._headerTemplate = this.headTemplate.template;
        }
        if (this.footTemplate) {
            this._footerTemplate = this.footTemplate.template;
        }
        if (this.editorTemplate) {
            this._inlineEditorTemplate = this.editorTemplate.template;
        }
        if (!this.summaries) {
            switch (this.dataType) {
                case DataType.String:
                case DataType.Boolean:
                    this.summaries = IgxSummaryOperand;
                    break;
                case DataType.Number:
                    this.summaries = IgxNumberSummaryOperand;
                    break;
                case DataType.Date:
                    this.summaries = IgxDateSummaryOperand;
                    break;
            }
        }
    };
    IgxColumnComponent.prototype.pin = function () {
        return this.gridAPI.get(this.gridID).pinColumn(this.field);
    };
    IgxColumnComponent.prototype.unpin = function () {
        return this.gridAPI.get(this.gridID).unpinColumn(this.field);
    };
    IgxColumnComponent.prototype.updateHighlights = function (oldIndex, newIndex) {
        var activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.grid.id);
        if (activeInfo.columnIndex === oldIndex) {
            IgxTextHighlightDirective.setActiveHighlight(this.grid.id, newIndex, activeInfo.rowIndex, activeInfo.index, activeInfo.page);
            this.grid.refreshSearch(true);
        }
    };
    IgxColumnComponent.prototype.check = function () {
        if (this.grid) {
            this.grid.markForCheck();
        }
    };
    IgxColumnComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-column",
                    template: ""
                },] },
    ];
    IgxColumnComponent.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
        { type: ChangeDetectorRef, },
    ]; };
    IgxColumnComponent.propDecorators = {
        "field": [{ type: Input },],
        "header": [{ type: Input },],
        "sortable": [{ type: Input },],
        "groupable": [{ type: Input },],
        "editable": [{ type: Input },],
        "filterable": [{ type: Input },],
        "resizable": [{ type: Input },],
        "hasSummary": [{ type: Input },],
        "hidden": [{ type: Input },],
        "movable": [{ type: Input },],
        "width": [{ type: Input },],
        "maxWidth": [{ type: Input },],
        "minWidth": [{ type: Input },],
        "headerClasses": [{ type: Input },],
        "cellClasses": [{ type: Input },],
        "index": [{ type: Input },],
        "formatter": [{ type: Input },],
        "filteringCondition": [{ type: Input },],
        "filteringIgnoreCase": [{ type: Input },],
        "sortingIgnoreCase": [{ type: Input },],
        "dataType": [{ type: Input },],
        "pinned": [{ type: Input },],
        "summaries": [{ type: Input },],
        "cellTemplate": [{ type: ContentChild, args: [IgxCellTemplateDirective, { read: IgxCellTemplateDirective },] },],
        "headTemplate": [{ type: ContentChild, args: [IgxCellHeaderTemplateDirective, { read: IgxCellHeaderTemplateDirective },] },],
        "footTemplate": [{ type: ContentChild, args: [IgxCellFooterTemplateDirective, { read: IgxCellFooterTemplateDirective },] },],
        "editorTemplate": [{ type: ContentChild, args: [IgxCellEditorTemplateDirective, { read: IgxCellEditorTemplateDirective },] },],
    };
    return IgxColumnComponent;
}());
export { IgxColumnComponent };
