var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, HostBinding, HostListener, Input, TemplateRef, ViewChild } from "@angular/core";
import { IgxSelectionAPIService } from "../core/selection";
import { DataType } from "../data-operations/data-util";
import { IgxTextHighlightDirective } from "../directives/text-highlight/text-highlight.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { autoWire } from "./grid.common";
var IgxGridCellComponent = (function () {
    function IgxGridCellComponent(gridAPI, selectionApi, cdr, element) {
        this.gridAPI = gridAPI;
        this.selectionApi = selectionApi;
        this.cdr = cdr;
        this.element = element;
        this.highlightClass = "igx-highlight";
        this.activeHighlightClass = "igx-highlight__active";
        this.tabindex = 0;
        this.role = "gridcell";
        this.defaultCssClass = "igx-grid__td";
        this.isFocused = false;
        this.isSelected = false;
        this._inEditMode = false;
    }
    Object.defineProperty(IgxGridCellComponent.prototype, "formatter", {
        get: function () {
            return this.column.formatter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "context", {
        get: function () {
            return {
                $implicit: this.value,
                cell: this
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "template", {
        get: function () {
            if (this.inEditMode) {
                var inlineEditorTemplate = this.column.inlineEditorTemplate;
                return inlineEditorTemplate ? inlineEditorTemplate : this.inlineEditorTemplate;
            }
            if (this.cellTemplate) {
                return this.cellTemplate;
            }
            return this.defaultCellTemplate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "gridID", {
        get: function () {
            return this.row.gridID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "grid", {
        get: function () {
            return this.gridAPI.get(this.gridID);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "rowIndex", {
        get: function () {
            return this.row.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "columnIndex", {
        get: function () {
            return this.column.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "visibleColumnIndex", {
        get: function () {
            return this.column.visibleIndex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "unpinnedColumnIndex", {
        get: function () {
            return this.grid.unpinnedColumns.indexOf(this.column);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "cellID", {
        get: function () {
            var primaryKey = this.grid.primaryKey;
            var rowID = primaryKey ? this.row.rowData[primaryKey] : this.row.rowData;
            return { rowID: rowID, columnID: this.columnIndex, rowIndex: this.rowIndex };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "nativeElement", {
        get: function () {
            return this.element.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "inEditMode", {
        get: function () {
            return this._inEditMode;
        },
        set: function (value) {
            var originalValue = this._inEditMode;
            this._inEditMode = value;
            if (this._inEditMode) {
                this.grid.cellInEditMode = this;
            }
            else if (!originalValue) {
                this.grid.cellInEditMode = null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "readonly", {
        get: function () {
            return !this.column.editable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "cellInEditMode", {
        get: function () {
            return this.inEditMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "describedby", {
        get: function () {
            return this.row.gridID + "_" + this.column.field;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "styleClasses", {
        get: function () {
            return this.defaultCssClass + " " + this.column.cellClasses;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "width", {
        get: function () {
            var hasVerticalScroll = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
            var isPercentageWidth = this.column.width && typeof this.column.width === "string" && this.column.width.indexOf("%") !== -1;
            return this.isLastUnpinned && hasVerticalScroll && !!this.column.width && !isPercentageWidth ?
                (parseInt(this.column.width, 10) - 18) + "px" : this.column.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "editModeCSS", {
        get: function () {
            return this._inEditMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "focused", {
        get: function () {
            return this.isFocused;
        },
        set: function (val) {
            this.isFocused = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "applyNumberCSSClass", {
        get: function () {
            return this.column.dataType === DataType.Number;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "isPinned", {
        get: function () {
            return this.column.pinned;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "isLastPinned", {
        get: function () {
            var pinnedCols = this.grid.pinnedColumns;
            return pinnedCols[pinnedCols.length - 1] === this.column;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "isLastUnpinned", {
        get: function () {
            var unpinnedColumns = this.grid.unpinnedColumns;
            return unpinnedColumns[unpinnedColumns.length - 1] === this.column;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridCellComponent.prototype, "selected", {
        get: function () {
            return this.isSelected = this.isCellSelected();
        },
        set: function (val) {
            this.isSelected = val;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridCellComponent.prototype._updateCellSelectionStatus = function () {
        this._clearCellSelection();
        this.selectionApi.set_selection(this.cellSelectionID, this.selectionApi.select_item(this.cellSelectionID, this.cellID));
    };
    IgxGridCellComponent.prototype._clearCellSelection = function () {
        var cell = this._getLastSelectedCell();
        if (cell) {
            cell.selected = false;
            cell.focused = false;
        }
        this.selectionApi.set_selection(this.cellSelectionID, []);
    };
    IgxGridCellComponent.prototype._getLastSelectedCell = function () {
        var selection = this.selectionApi.get_selection(this.cellSelectionID);
        if (selection && selection.length > 0) {
            var cellID = selection[0];
            return this.gridAPI.get_cell_by_index(this.gridID, cellID.rowIndex, cellID.columnID);
        }
    };
    IgxGridCellComponent.prototype.isCellSelected = function () {
        var selection = this.selectionApi.get_selection(this.cellSelectionID);
        if (selection && selection.length > 0) {
            var selectedCellID = selection[0];
            return this.cellID.rowID === selectedCellID.rowID &&
                this.cellID.columnID === selectedCellID.columnID;
        }
        return false;
    };
    IgxGridCellComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.cellSelectionID = this.gridID + "-cells";
        this.chunkLoadedHor = this.row.virtDirRow.onChunkLoad.subscribe(function () {
            if (!_this.selected) {
                _this.nativeElement.blur();
            }
            _this.cdr.markForCheck();
        });
        this.chunkLoadedVer = this.grid.verticalScrollContainer.onChunkLoad.subscribe(function () {
            if (!_this.selected) {
                _this.nativeElement.blur();
            }
            _this.cdr.markForCheck();
        });
    };
    IgxGridCellComponent.prototype.ngOnDestroy = function () {
        if (this.chunkLoadedHor) {
            this.chunkLoadedHor.unsubscribe();
        }
        if (this.chunkLoadedVer) {
            this.chunkLoadedVer.unsubscribe();
        }
    };
    IgxGridCellComponent.prototype.ngAfterViewInit = function () {
        if (this.highlight && this.grid.lastSearchInfo.searchText) {
            this.highlight.highlight(this.grid.lastSearchInfo.searchText, this.grid.lastSearchInfo.caseSensitive);
            this.highlight.activateIfNecessary();
        }
    };
    IgxGridCellComponent.prototype.update = function (val) {
        var args = { row: this.row, cell: this, currentValue: this.value, newValue: val };
        this.grid.onEditDone.emit(args);
        this.value = args.newValue;
        this.gridAPI.update(this.gridID, this);
        this.grid.refreshSearch();
    };
    IgxGridCellComponent.prototype.onDoubleClick = function (event) {
        if (this.column.editable) {
            this.inEditMode = true;
        }
        this.grid.onDoubleClick.emit({
            cell: this,
            event: event
        });
    };
    IgxGridCellComponent.prototype.onClick = function (event) {
        this.grid.onCellClick.emit({
            cell: this,
            event: event
        });
    };
    IgxGridCellComponent.prototype.onContextMenu = function (event) {
        this.grid.onContextMenu.emit({
            cell: this,
            event: event
        });
    };
    IgxGridCellComponent.prototype.onFocus = function (event) {
        this.isFocused = true;
        this.selected = true;
        this._updateCellSelectionStatus();
        this.row.focused = true;
        if (this.grid.cellInEditMode && this.grid.cellInEditMode !== this) {
            this.grid.cellInEditMode.inEditMode = false;
        }
        this.grid.onSelection.emit({
            cell: this,
            event: event
        });
    };
    IgxGridCellComponent.prototype.onBlur = function (event) {
        this.isFocused = false;
        this.row.focused = false;
    };
    IgxGridCellComponent.prototype.onKeydownArrowLeft = function (event) {
        if (this.inEditMode) {
            return;
        }
        event.preventDefault();
        var rowIndex = this.rowIndex;
        var columnIndex = this.visibleColumnIndex - 1;
        if (columnIndex >= 0) {
            var target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            var targetUnpinnedIndex = this.unpinnedColumnIndex - 1;
            var horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            var bVirtSubscribe = true;
            if (!horVirtScroll && !target) {
                return;
            }
            if (target) {
                var containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                var targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset < 0) {
                    horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex);
                }
                else {
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            }
            else {
                if (!this.column.pinned) {
                    this.row.virtDirRow.scrollPrev();
                }
                else {
                    this.row.virtDirRow.scrollTo(this.grid.unpinnedColumns.length - 1);
                }
            }
            if (bVirtSubscribe) {
                this.grid._focusNextCell(this.rowIndex, columnIndex, "left");
            }
        }
    };
    IgxGridCellComponent.prototype.onKeydownCtrlArrowLeft = function () {
        if (this.inEditMode) {
            return;
        }
        var target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.first.visibleColumnIndex);
        var columnIndex = target.visibleColumnIndex;
        if (target) {
            var containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            var targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
            if (!target.isPinned && targetEndLeftOffset < 0) {
                var horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex);
                this.grid._focusNextCell(this.rowIndex, columnIndex, "left");
            }
            else {
                target.nativeElement.focus();
            }
        }
    };
    IgxGridCellComponent.prototype.onKeydownArrowRight = function (event) {
        if (this.inEditMode) {
            return;
        }
        event.preventDefault();
        var visibleColumns = this.grid.visibleColumns;
        var rowIndex = this.rowIndex;
        var columnIndex = this.visibleColumnIndex + 1;
        if (columnIndex > -1 && columnIndex <= visibleColumns.length - 1) {
            var target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            var targetUnpinnedIndex = this.unpinnedColumnIndex + 1;
            var horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            var verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            var verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;
            var virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            var bVirtSubscribe = true;
            if (!horVirtScroll && !target) {
                return;
            }
            if (target) {
                var containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                var targetStartLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                var targetEndLeftOffset = target.nativeElement.offsetLeft +
                    parseInt(visibleColumns[columnIndex].width, 10) +
                    containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset > virtContainerSize) {
                    var oldScrollLeft = horVirtScroll.scrollLeft;
                    var targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
                    horVirtScroll.scrollLeft = targetScrollLeft;
                    if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                        target.nativeElement.focus();
                        bVirtSubscribe = false;
                    }
                }
                else if (!target.isPinned && targetStartLeftOffset < 0) {
                    horVirtScroll.scrollLeft = 0;
                }
                else {
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            }
            else {
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
            }
            if (bVirtSubscribe) {
                this.grid._focusNextCell(this.rowIndex, columnIndex, "right");
            }
        }
    };
    IgxGridCellComponent.prototype.onKeydownCtrlArrowRight = function () {
        if (this.inEditMode) {
            return;
        }
        var target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.last.visibleColumnIndex);
        var columnIndex = target.visibleColumnIndex;
        if (target) {
            var containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            var targetEndLeftOffset = target.nativeElement.offsetLeft + parseInt(target.column.width, 10) + containerLeftOffset;
            var verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            var verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;
            var virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            if (targetEndLeftOffset > virtContainerSize) {
                var horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                var oldScrollLeft = horVirtScroll.scrollLeft;
                var targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex + 1) - virtContainerSize;
                horVirtScroll.scrollLeft = targetScrollLeft;
                if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                    target.nativeElement.focus();
                }
                else {
                    this.grid._focusNextCell(this.rowIndex, columnIndex, "right");
                }
            }
            else {
                target.nativeElement.focus();
            }
        }
    };
    IgxGridCellComponent.prototype.onKeydownArrowUp = function (event) {
        if (this.inEditMode) {
            return;
        }
        event.preventDefault();
        var lastCell = this._getLastSelectedCell();
        var rowIndex = lastCell ? lastCell.rowIndex - 1 : this.grid.rowList.last.index;
        this._clearCellSelection();
        this.grid.navigateUp(rowIndex, this.visibleColumnIndex);
    };
    IgxGridCellComponent.prototype.onKeydownArrowDown = function (event) {
        if (this.inEditMode) {
            return;
        }
        event.preventDefault();
        var lastCell = this._getLastSelectedCell();
        var rowIndex = lastCell ? lastCell.rowIndex + 1 : this.grid.rowList.first.index;
        this._clearCellSelection();
        this.grid.navigateDown(rowIndex, this.visibleColumnIndex);
    };
    IgxGridCellComponent.prototype.onKeydownEnterEditMode = function () {
        if (this.column.editable) {
            this.inEditMode = !this.inEditMode;
            this.nativeElement.focus();
        }
    };
    IgxGridCellComponent.prototype.onKeydownExitEditMode = function () {
        this.inEditMode = false;
        this.nativeElement.focus();
    };
    IgxGridCellComponent.prototype.highlightText = function (text, caseSensitive) {
        return this.highlight ? this.highlight.highlight(text, caseSensitive) : 0;
    };
    IgxGridCellComponent.prototype.clearHighlight = function () {
        if (this.highlight) {
            this.highlight.clearHighlight();
        }
    };
    IgxGridCellComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-grid-cell",
                    template: "<ng-template #defaultCell igxTextHighlight [cssClass]=\"highlightClass\" [activeCssClass]=\"activeHighlightClass\" [groupName]=\"gridID\"         [value]=\"formatter ? formatter(value) : value\" [row]=\"rowIndex\" [column]=\"this.column.visibleIndex\" [page]=\"this.grid.page\">     <div>{{ formatter ? formatter(value) : value }}</div> </ng-template> <ng-template #inlineEditor let-cell=\"cell\">     <igx-input-group>         <input igxInput [value]=\"value\" [igxFocus]=\"true\" [igxTextSelection]=\"true\" (keydown.enter)=\"cell.update($event.target.value)\">     </igx-input-group> </ng-template> <ng-container *ngTemplateOutlet=\"template; context: context\"> </ng-container>"
                },] },
    ];
    IgxGridCellComponent.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
        { type: IgxSelectionAPIService, },
        { type: ChangeDetectorRef, },
        { type: ElementRef, },
    ]; };
    IgxGridCellComponent.propDecorators = {
        "column": [{ type: Input },],
        "row": [{ type: Input },],
        "cellTemplate": [{ type: Input },],
        "value": [{ type: Input },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "readonly": [{ type: HostBinding, args: ["attr.aria-readonly",] },],
        "cellInEditMode": [{ type: HostBinding, args: ["class.igx_grid__cell--edit",] },],
        "describedby": [{ type: HostBinding, args: ["attr.aria-describedby",] },],
        "styleClasses": [{ type: HostBinding, args: ["class",] },],
        "width": [{ type: HostBinding, args: ["style.min-width",] }, { type: HostBinding, args: ["style.flex-basis",] }, { type: HostBinding, args: ["class.igx-grid__td--fw",] },],
        "editModeCSS": [{ type: HostBinding, args: ["class.igx-grid__td--editing",] },],
        "applyNumberCSSClass": [{ type: HostBinding, args: ["class.igx-grid__td--number",] },],
        "isPinned": [{ type: HostBinding, args: ["class.igx-grid__th--pinned",] },],
        "isLastPinned": [{ type: HostBinding, args: ["class.igx-grid__th--pinned-last",] },],
        "selected": [{ type: HostBinding, args: ["attr.aria-selected",] }, { type: HostBinding, args: ["class.igx-grid__td--selected",] },],
        "defaultCellTemplate": [{ type: ViewChild, args: ["defaultCell", { read: TemplateRef },] },],
        "inlineEditorTemplate": [{ type: ViewChild, args: ["inlineEditor", { read: TemplateRef },] },],
        "highlight": [{ type: ViewChild, args: [forwardRef(function () { return IgxTextHighlightDirective; }), { read: IgxTextHighlightDirective },] },],
        "onDoubleClick": [{ type: HostListener, args: ["dblclick", ["$event"],] },],
        "onClick": [{ type: HostListener, args: ["click", ["$event"],] },],
        "onContextMenu": [{ type: HostListener, args: ["contextmenu", ["$event"],] },],
        "onFocus": [{ type: HostListener, args: ["focus", ["$event"],] },],
        "onBlur": [{ type: HostListener, args: ["blur", ["$event"],] },],
        "onKeydownArrowLeft": [{ type: HostListener, args: ["keydown.arrowleft", ["$event"],] },],
        "onKeydownCtrlArrowLeft": [{ type: HostListener, args: ["keydown.control.arrowleft",] },],
        "onKeydownArrowRight": [{ type: HostListener, args: ["keydown.arrowright", ["$event"],] },],
        "onKeydownCtrlArrowRight": [{ type: HostListener, args: ["keydown.control.arrowright",] },],
        "onKeydownArrowUp": [{ type: HostListener, args: ["keydown.arrowup", ["$event"],] },],
        "onKeydownArrowDown": [{ type: HostListener, args: ["keydown.arrowdown", ["$event"],] },],
        "onKeydownEnterEditMode": [{ type: HostListener, args: ["keydown.enter",] }, { type: HostListener, args: ["keydown.f2",] },],
        "onKeydownExitEditMode": [{ type: HostListener, args: ["keydown.escape",] },],
    };
    __decorate([
        autoWire(true),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], IgxGridCellComponent.prototype, "inEditMode", null);
    __decorate([
        autoWire(true),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], IgxGridCellComponent.prototype, "focused", null);
    __decorate([
        autoWire(true),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], IgxGridCellComponent.prototype, "selected", null);
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], IgxGridCellComponent.prototype, "ngOnInit", null);
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], IgxGridCellComponent.prototype, "update", null);
    __decorate([
        autoWire(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], IgxGridCellComponent.prototype, "onFocus", null);
    __decorate([
        autoWire(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], IgxGridCellComponent.prototype, "onBlur", null);
    return IgxGridCellComponent;
}());
export { IgxGridCellComponent };
