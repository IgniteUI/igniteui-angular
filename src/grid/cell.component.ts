import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import { take } from "rxjs/operators";
import { KEYCODES } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-cell",
    templateUrl: "./cell.component.html"
})
export class IgxGridCellComponent implements IGridBus, OnInit {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: any;

    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    public value: any;

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

    get nativeElement(): any {
        return this.element.nativeElement;
    }

    get inEditMode(): boolean {
        return this._inEditMode;
    }

    @autoWire(true)
    set inEditMode(value: boolean) {
        this._inEditMode = value;
        if (this._inEditMode) {
            this.grid.cellInEditMode = this;
        }
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
        return this.column.width;
    }

    @HostBinding("class.igx-grid__td--editing")
    get editModeCSS() {
        return this._inEditMode;
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-grid__td--selected")
    @autoWire(true)
    get focused(): boolean {
        return this.isFocused || this.isSelected;
    }

    set focused(val: boolean) {
        this.isFocused = val;
    }

    @HostBinding("class.igx-grid__td--number")
    get applyNumberCSSClass() {
        return this.column.dataType === DataType.Number;
    }

    @HostBinding("class.igx-grid__th--pinned-start")
    get isPinned() {
        return this.column.pinned;
    }

    @HostBinding("class.igx-grid__th--pinned-start-last")
    get isLastPinned() {
        const pinnedCols = this.grid.pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    get selected() {
        return this.isSelected;
    }

    @autoWire(true)
    set selected(val: boolean) {
        this.isSelected = val;
    }

    @ViewChild("defaultCell", { read: TemplateRef })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild("inlineEditor", { read: TemplateRef })
    protected inlineEditorTemplate: TemplateRef<any>;

    protected defaultCssClass = "igx-grid__td";
    protected isFocused = false;
    protected isSelected = false;
    protected _inEditMode = false;

    constructor(
        public gridAPI: IgxGridAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef) { }

    @autoWire(true)
    public ngOnInit() {
    }

    @autoWire(true)
    public update(val: any) {
        this.grid.onEditDone.emit({ currentValue: this.value, newValue: val });
        this.value = val;
        this.gridAPI.update(this.gridID, this);
    }

    @HostListener("dblclick", ["$event"])
    public onDoubleClick(event) {
        if (this.column.editable) {
            this.inEditMode = true;
        }
    }

    @HostListener("focus", ["$event"])
    @autoWire()
    public onFocus(event) {
        this.isFocused = true;
        this.isSelected = true;
        this.row.focused = true;
        if (this.grid.cellInEditMode && this.grid.cellInEditMode !== this) {
            this.grid.cellInEditMode.inEditMode = false;
            this.grid.cellInEditMode = null;
        }
        this.grid.onSelection.emit(this);
    }

    @HostListener("blur", ["$event"])
    @autoWire()
    public onBlur(event) {
        this.isFocused = false;
        this.isSelected = false;
        this.row.focused = false;
    }

    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event) {
        event.preventDefault();
        const visibleColumns = this.grid.visibleColumns;
        const rowIndex = this.rowIndex;
        const visibleColumnIndex = this.visibleColumnIndex - 1;

        if (visibleColumnIndex >= 0) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, visibleColumnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex - 1;
            const horVirtScroll =  this.grid.parentVirtDir.getHorizontalScroll();
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
                this.row.virtDirRow.onChunkLoad.pipe(take(1)).subscribe({
                    next: (e: any) => {
                        this.row.cdr.detectChanges();
                        const currTarget = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, visibleColumnIndex);
                        if (currTarget) {
                            currTarget.nativeElement.focus();
                        } else {
                            this.row.cells.first.nativeElement.focus();
                        }
                    }
                });
            }
        }
    }

    @HostListener("keydown.control.arrowleft")
    public onKeydownCtrlArrowLeft() {
        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.first.visibleColumnIndex);

        if (target) {
            target.nativeElement.focus();
        }
    }

    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event) {
        event.preventDefault();
        const visibleColumns = this.grid.visibleColumns;
        const rowIndex = this.rowIndex;
        const visibleColumnIndex = this.visibleColumnIndex + 1;

        if (visibleColumnIndex > -1 && visibleColumnIndex <= visibleColumns.length - 1) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, visibleColumnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex + 1;
            const horVirtScroll =  this.grid.parentVirtDir.getHorizontalScroll();
            const virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10);
            let bVirtSubscribe = true;

            if (!horVirtScroll && !target) {
                return;
            }

            if (target) {
                const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                const targetStartLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                const targetEndLeftOffset = target.nativeElement.offsetLeft +
                                            parseInt(visibleColumns[visibleColumnIndex].width, 10) +
                                            containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset > virtContainerSize) {
                    // Target cell is partially visible (right part of it is cut). Scroll to it so it is fully visible then focus.
                    horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
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
                this.row.virtDirRow.onChunkLoad.pipe(take(1)).subscribe({
                    next: (e: any) => {
                        this.row.cdr.detectChanges();
                        const currTarget = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, visibleColumnIndex);
                        if (currTarget) {
                            currTarget.nativeElement.focus();
                        } else {
                            this.row.cells.last.nativeElement.focus();
                        }
                    }
                });
            }
        }
    }

    @HostListener("keydown.control.arrowright")
    public onKeydownCtrlArrowRight() {
        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.last.visibleColumnIndex);

        if (target) {
            target.nativeElement.focus();
        }
    }

    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event) {
        event.preventDefault();
        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex - 1, this.visibleColumnIndex);
        if (target) {
            target.nativeElement.focus();
        } else {
            this.row.grid.verticalScrollContainer.scrollPrev();
        }
    }

    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event) {
        event.preventDefault();
        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex + 1, this.visibleColumnIndex);
        const verticalScroll = this.row.grid.verticalScrollContainer.getVerticalScroll();
        if (!verticalScroll) {
            return;
        }

        if (target) {
            const containerHeight = this.grid.calcHeight;
            const containerTopOffset = parseInt(this.row.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const targetEndTopOffset = target.row.element.nativeElement.offsetTop + this.grid.rowHeight + containerTopOffset;
            if (targetEndTopOffset > containerHeight) {
                verticalScroll.scrollTop += targetEndTopOffset - containerHeight;
                this.row.grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe({
                    next: (e: any) => {
                        target.nativeElement.focus();
                        this.row.cdr.detectChanges();
                    }
                });
            } else {
                target.nativeElement.focus();
            }
        } else {
            verticalScroll.scrollTop += this.grid.rowHeight;
        }
    }

    @HostListener("keydown.enter")
    @HostListener("keydown.f2")
    public onKeydownEnterEditMode() {
        if (this.column.editable) {
            this.inEditMode = !this.inEditMode;
        }
    }

    @HostListener("keydown.escape")
    public onKeydownExitEditMode() {
        this.inEditMode = false;
    }
}
