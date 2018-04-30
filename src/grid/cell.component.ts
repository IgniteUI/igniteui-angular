import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { take } from "rxjs/operators";
import { IgxSelectionAPIService } from "../core/selection";
import { KEYCODES } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { IgxTextHighlightDirective } from "../directives/text-highlight/text-highlight.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";
import { IGridCellEventArgs, IGridEditEventArgs } from "./grid.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-cell",
    templateUrl: "./cell.component.html"
})
export class IgxGridCellComponent implements IGridBus, OnInit, OnDestroy {
    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: any;

    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    public value: any;

    public highlightClass = "igx-highlight";
    public activeHighlightClass = "igx-highlight__active";

    get formatter(): (value: any) => any {
        return this.column.formatter;
    }

    get context(): any {
        return {
            $implicit: this.value,
            cell: this
        };
    }

    get template(): TemplateRef<any> {
        if (this.inEditMode) {
            const inlineEditorTemplate = this.column.inlineEditorTemplate;
            return inlineEditorTemplate ? inlineEditorTemplate : this.inlineEditorTemplate;
        }
        if (this.cellTemplate) {
            return this.cellTemplate;
        }
        return this.defaultCellTemplate;
    }

    get gridID(): any {
        return this.row.gridID;
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get rowIndex(): number {
        return this.row.index;
    }

    get columnIndex(): number {
        return this.column.index;
    }

    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    get unpinnedColumnIndex(): number {
        return this.grid.unpinnedColumns.indexOf(this.column);
    }

    public get cellID() {
        const primaryKey = this.grid.primaryKey;
        const rowID = primaryKey ? this.row.rowData[primaryKey] : this.row.rowData;
        return { rowID, columnID: this.columnIndex, rowIndex: this.rowIndex };
    }

    get nativeElement(): any {
        return this.element.nativeElement;
    }

    get inEditMode(): boolean {
        return this._inEditMode;
    }

    @autoWire(true)
    set inEditMode(value: boolean) {
        const originalValue = this._inEditMode;

        if (value && this.highlight && !this._inEditMode) {
            this.highlight.store();
        }

        this._inEditMode = value;

        if (this._inEditMode) {
            this.grid.cellInEditMode = this;
        } else if (!originalValue){
            this.grid.cellInEditMode = null;
        }
    }

    get callback() {
        return () => {
            setTimeout(() => {
                if (this.highlight && this.inEditMode === false) {
                    this.highlight.restore();
                }
            });
        };
    }

    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("attr.role")
    public role = "gridcell";

    @HostBinding("attr.aria-readonly")
    get readonly(): boolean {
        return !this.column.editable;
    }

    @HostBinding("attr.aria-describedby")
    get describedby(): string {
        return `${this.row.gridID}_${this.column.field}`;
    }

    @HostBinding("class")
    get styleClasses(): string {
        return `${this.defaultCssClass} ${this.column.cellClasses}`;
    }

    @HostBinding("style.min-width")
    @HostBinding("style.flex-basis")
    @HostBinding("class.igx-grid__td--fw")
    get width() {
        const hasVerticalScroll = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        return this.isLastUnpinned && hasVerticalScroll && !!this.column.width ?
            (parseInt(this.column.width, 10) - 18) + "px" : this.column.width;
    }

    @HostBinding("class.igx-grid__td--editing")
    get editModeCSS() {
        return this._inEditMode;
    }

    @autoWire(true)
    get focused(): boolean {
        return this.isFocused;
    }

    set focused(val: boolean) {
        this.isFocused = val;
    }

    @HostBinding("class.igx-grid__td--number")
    get applyNumberCSSClass() {
        return this.column.dataType === DataType.Number;
    }

    @HostBinding("class.igx-grid__th--pinned")
    get isPinned() {
        return this.column.pinned;
    }

    @HostBinding("class.igx-grid__th--pinned-last")
    get isLastPinned() {
        const pinnedCols = this.grid.pinnedColumns;
        return pinnedCols[pinnedCols.length - 1] === this.column;
    }

    get isLastUnpinned() {
        const unpinnedColumns = this.grid.unpinnedColumns;
        return unpinnedColumns[unpinnedColumns.length - 1] === this.column;
    }

    get selected() {
        return this.isSelected = this.isCellSelected();
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-grid__td--selected")
    @autoWire(true)
    set selected(val: boolean) {
        this.isSelected = val;
    }

    @ViewChild("defaultCell", { read: TemplateRef })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild("inlineEditor", { read: TemplateRef })
    protected inlineEditorTemplate: TemplateRef<any>;

    @ViewChild(forwardRef(() => IgxTextHighlightDirective), { read: IgxTextHighlightDirective })
    private highlight: IgxTextHighlightDirective;

    protected defaultCssClass = "igx-grid__td";
    protected isFocused = false;
    protected isSelected = false;
    protected _inEditMode = false;
    protected chunkLoadedHor;
    protected chunkLoadedVer;
    private cellSelectionID: string;

    constructor(
        public gridAPI: IgxGridAPIService,
        public selectionApi: IgxSelectionAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef) { }

    private _updateCellSelectionStatus() {
        this._clearCellSelection();
        this.selectionApi.set_selection(this.cellSelectionID, this.selectionApi.select_item(this.cellSelectionID, this.cellID));
    }

    private _clearCellSelection() {
        const cell = this._getLastSelectedCell();
        if (cell) {
            cell.selected = false;
            cell.focused = false;
        }
        this.selectionApi.set_selection(this.cellSelectionID, []);
    }

    private _getLastSelectedCell() {
        const selection = this.selectionApi.get_selection(this.cellSelectionID);
        if (selection && selection.length > 0) {
            const cellID = selection[0];
            return this.gridAPI.get_cell_by_index(this.gridID, cellID.rowIndex, cellID.columnID);
        }
    }

    public isCellSelected() {
        const selection = this.selectionApi.get_selection(this.cellSelectionID);
        if (selection) {
            const selectedCellID = selection[0];
            return this.cellID.rowID === selectedCellID.rowID &&
                this.cellID.columnID === selectedCellID.columnID;
        }
        return false;
    }

    @autoWire(true)
    public ngOnInit() {
        this.cellSelectionID = this.gridID + "-cells";
        this.chunkLoadedHor = this.row.virtDirRow.onChunkLoad.subscribe(
            () => {
                if (!this.selected) {
                    this.nativeElement.blur();
                }
                this.cdr.markForCheck();
            });
        this.chunkLoadedVer = this.grid.verticalScrollContainer.onChunkLoad.subscribe(
            () => {
                if (!this.selected) {
                    this.nativeElement.blur();
                }
                this.cdr.markForCheck();
            });
    }

    public ngOnDestroy() {
        if (this.chunkLoadedHor) {
            this.chunkLoadedHor.unsubscribe();
        }
        if (this.chunkLoadedVer) {
            this.chunkLoadedVer.unsubscribe();
        }
    }

    @autoWire(true)
    public update(val: any) {
        const args: IGridEditEventArgs = { row: this.row, cell: this, currentValue: this.value, newValue: val };
        this.grid.onEditDone.emit(args);
        this.value = args.newValue;
        this.gridAPI.update(this.gridID, this);
    }

    private subscribeNext(virtualContainer: any, callback: (elem?) => void) {
        virtualContainer.onChunkLoad.pipe(take(1)).subscribe({
            next: (e: any) => {
                callback(e);
            }
        });
    }

    private _focusNextCell(rowIndex: number, columnIndex: number, dir?: string) {
        const virtualDir = dir !== undefined ? this.row.virtDirRow : this.row.grid.verticalScrollContainer;
        this.subscribeNext(virtualDir, () => {
            let target;
            target = this.gridAPI.get_cell_by_visible_index(
                this.gridID,
                rowIndex,
                columnIndex);
            if (!target) {
                if (dir) {
                    target = dir === "left" ? this.row.cells.first : this.row.cells.last;
                } else {
                    target = this.gridAPI.get_cell_by_visible_index(
                        this.gridID,
                        this.rowIndex,
                        this.visibleColumnIndex
                    );
                }
            }
            target.nativeElement.focus();
        });
    }

    @HostListener("dblclick", ["$event"])
    public onDoubleClick(event) {
        if (this.column.editable) {
            this.inEditMode = true;
        }
    }

    @HostListener("click", ["$event"])
    public onClick(event) {
        this.grid.onCellClick.emit({
            cell: this,
            event
        });
    }

    @HostListener("contextmenu", ["$event"])
    public onContextMenu(event) {
        this.grid.onContextMenu.emit({
            cell: this,
            event
        });
    }

    @HostListener("focus", ["$event"])
    @autoWire()
    public onFocus(event) {
        this.isFocused = true;
        this.selected = true;
        this._updateCellSelectionStatus();
        this.row.focused = true;
        if (this.grid.cellInEditMode && this.grid.cellInEditMode !== this) {
            this.grid.cellInEditMode.inEditMode = false;
        }

        this.grid.onSelection.emit({
            cell: this,
            event
        });
    }

    @HostListener("blur", ["$event"])
    @autoWire()
    public onBlur(event) {
        this.isFocused = false;
        this.row.focused = false;
    }

    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event) {
        if (this.inEditMode) {
            return;
        }

        event.preventDefault();
        const rowIndex = this.rowIndex;
        const columnIndex = this.visibleColumnIndex - 1;

        if (columnIndex >= 0) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex - 1;
            const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            let bVirtSubscribe = true;

            if (!horVirtScroll && !target) {
                return;
            }

            if (target) {
                const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                const targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset < 0) {
                    // Target cell is not pinned and is partialy visible (left part is cut). Scroll so it is fully visible and then focus.
                    horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex);
                } else {
                    // Target cell is fully visible. Just focus it.
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            } else {
                if (!this.column.pinned) {
                    this.row.virtDirRow.scrollPrev();
                } else {
                    this.row.virtDirRow.scrollTo(this.grid.unpinnedColumns.length - 1);
                }
            }

            /**
             * Determine if we need to subscribe, otherwise if we use navigation and don't scroll, it will bind n-times times.
             * If we scroll the virtual container above, we need to subscribe to onChunkLoad.
             * We do this because it takes time to detect change in scrollLeft of an element
             */
            if (bVirtSubscribe) {
                this._focusNextCell(this.rowIndex, columnIndex, "left");
            }
        }
    }

    @HostListener("keydown.control.arrowleft")
    public onKeydownCtrlArrowLeft() {
        if (this.inEditMode) {
            return;
        }

        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.first.visibleColumnIndex);
        const columnIndex = target.visibleColumnIndex;
        if (target) {
            const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            const targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;

            if (!target.isPinned && targetEndLeftOffset < 0) {
                // Target cell is not pinned and is partialy visible (left part is cut). Scroll so it is fully visible and then focus.
                const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex);

                this._focusNextCell(this.rowIndex, columnIndex, "left");
            } else {
                target.nativeElement.focus();
            }
        }
    }

    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event) {
        if (this.inEditMode) {
            return;
        }

        event.preventDefault();
        const visibleColumns = this.grid.visibleColumns;
        const rowIndex = this.rowIndex;
        const columnIndex = this.visibleColumnIndex + 1;

        if (columnIndex > -1 && columnIndex <= visibleColumns.length - 1) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex + 1;
            const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            const verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;

            // We take into consideration the vertical scroll width sinse it is not calculated in the container inside the row
            const virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            let bVirtSubscribe = true;

            if (!horVirtScroll && !target) {
                return;
            }

            if (target) {
                const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                const targetStartLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                const targetEndLeftOffset = target.nativeElement.offsetLeft +
                    parseInt(visibleColumns[columnIndex].width, 10) +
                    containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset > virtContainerSize) {
                    // Target cell is partially visible (right part of it is cut). Scroll to it so it is fully visible then focus.
                    const oldScrollLeft = horVirtScroll.scrollLeft;
                    const targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
                    horVirtScroll.scrollLeft = targetScrollLeft;

                    if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                        // There is nowhere to scroll more. Don't subscribe since there won't be triggered event.
                        target.nativeElement.focus();
                        bVirtSubscribe = false;
                    }
                } else if (!target.isPinned && targetStartLeftOffset < 0) {
                    // Target cell is partially visible (left part of it is cut). Happens when going from pinned to unpinned area.
                    horVirtScroll.scrollLeft = 0;
                } else {
                    // Target cell is fully visible. Just focus it.
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            } else {
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
            }

            /**
             * Determine if we need to subscribe, otherwise if we use navigation and don't scroll, it will bind n-times.
             * If we scroll the virtual container above, we need to subscribe to onChunkLoad.
             * We do this because it takes time to detect change in scrollLeft of an element
             */
            if (bVirtSubscribe) {
                this._focusNextCell(this.rowIndex, columnIndex, "right");
            }
        }
    }

    @HostListener("keydown.control.arrowright")
    public onKeydownCtrlArrowRight() {
        if (this.inEditMode) {
            return;
        }

        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.last.visibleColumnIndex);
        const columnIndex = target.visibleColumnIndex;
        if (target) {
            const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            const targetEndLeftOffset = target.nativeElement.offsetLeft + parseInt(target.column.width, 10) + containerLeftOffset;
            const verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;

            // We take into consideration the vertical scroll width sinse it is not calculated in the container inside the row
            const virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            if (targetEndLeftOffset > virtContainerSize) {
                // Target cell is partially visible (right part of it is cut). Scroll to it so it is fully visible then focus.
                const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                const oldScrollLeft = horVirtScroll.scrollLeft;
                const targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex + 1) - virtContainerSize;
                horVirtScroll.scrollLeft = targetScrollLeft;

                if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                    // There is nowhere to scroll more. Don't subscribe since there won't be triggered event.
                    target.nativeElement.focus();
                } else {
                    this._focusNextCell(this.rowIndex, columnIndex, "right");
                }
            } else {
                target.nativeElement.focus();
            }
        }
    }

    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event) {
        if (this.inEditMode) {
            return;
        }

        event.preventDefault();
        const lastCell = this._getLastSelectedCell();
        const rowIndex = lastCell ? lastCell.rowIndex - 1 : this.grid.rowList.last.index;
        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, this.visibleColumnIndex);
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();

        if (!verticalScroll && !target) {
            return;
        }

        if (target) {
            const containerTopOffset =
                parseInt(this.row.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            if (this.grid.rowHeight > -containerTopOffset // not the entire row is visible, due to grid offset
                && verticalScroll.scrollTop // the scrollbar is not at the first item
                && target.row.element.nativeElement.offsetTop < this.grid.rowHeight) { // the target is in the first row

                this.grid.verticalScrollContainer.addScrollTop(-this.grid.rowHeight);
                this._focusNextCell(rowIndex, this.visibleColumnIndex);
            }
            target.nativeElement.focus();
        } else {
            const scrollOffset =
                -parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const scrollAmount = this.grid.rowHeight + scrollOffset;
            this.grid.verticalScrollContainer.addScrollTop(-scrollAmount);
            this._focusNextCell(this.rowIndex, this.visibleColumnIndex);
        }
    }

    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event) {
        if (this.inEditMode) {
            return;
        }

        event.preventDefault();
        const lastCell = this._getLastSelectedCell();
        const rowIndex = lastCell ? lastCell.rowIndex + 1 : this.grid.rowList.first.index;
        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, this.visibleColumnIndex);
        const verticalScroll = this.row.grid.verticalScrollContainer.getVerticalScroll();
        if (!verticalScroll && !target) {
            return;
        }

        if (target) {
            const containerHeight = this.grid.calcHeight ?
                Math.ceil(this.grid.calcHeight) :
                null; // null when there is no vertical virtualization
            const containerTopOffset =
                parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const targetEndTopOffset = target.row.element.nativeElement.offsetTop + this.grid.rowHeight + containerTopOffset;
            if (containerHeight && targetEndTopOffset > containerHeight) {
                const scrollAmount = targetEndTopOffset - containerHeight;
                this.grid.verticalScrollContainer.addScrollTop(scrollAmount);

                this._focusNextCell(rowIndex, this.visibleColumnIndex);
            } else {
                target.nativeElement.focus();
            }
        } else {
            const containerHeight = this.grid.calcHeight;
            const contentHeight = this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.offsetHeight;
            const scrollOffset = parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const lastRowOffset = contentHeight + scrollOffset - this.grid.calcHeight;
            const scrollAmount = this.grid.rowHeight + lastRowOffset;
            this.grid.verticalScrollContainer.addScrollTop(scrollAmount);
            this._focusNextCell(this.rowIndex, this.visibleColumnIndex);
        }
    }

    @HostListener("keydown.enter")
    @HostListener("keydown.f2")
    public onKeydownEnterEditMode() {
        if (this.column.editable) {
            this.inEditMode = !this.inEditMode;
            this.nativeElement.focus();
        }
    }

    @HostListener("keydown.escape")
    public onKeydownExitEditMode() {
        this.inEditMode = false;
        this.nativeElement.focus();
    }

    public highlightText(text: string, caseSensitive?: boolean): number {
        return this.highlight ? this.highlight.highlight(text, caseSensitive) : 0;
    }

    public clearHighlight() {
        if (this.highlight) {
            this.highlight.clearHighlight();
        }
    }

    // public activate(highlightIndex: number) {
    //     if (this.highlight) {
    //         this.highlight.activate(highlightIndex);
    //     }
    // }
}
