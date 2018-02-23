import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import { KEYCODES } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-cell",
    templateUrl: "./cell.component.html"
})
export class IgxGridCellComponent {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: any;

    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    public value: any;

    @Input()
    set isDirty(value: boolean) {
        if (value) {
           this.clearState();
        }
        value = false;
    }
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

    get nativeElement(): any {
        return this.element.nativeElement;
    }

    get inEditMode(): boolean {
        return this._inEditMode;
    }

    set inEditMode(value: boolean) {
        this._inEditMode = value;
        if (this._inEditMode) {
            this.grid.cellInEditMode = this;
        }
        this.cdr.markForCheck();
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
    get focused(): boolean {
        return this.isFocused || this.isSelected;
    }

    set focused(val: boolean) {
        this.isFocused = val;
        this.cdr.markForCheck();
    }

    @HostBinding("class.igx-grid__td--number")
    get applyNumberCSSClass() {
        return this.column.dataType === DataType.Number;
    }

    get selected() {
        return this.isSelected;
    }

    set selected(val: boolean) {
        this.isSelected = val;
        this.cdr.markForCheck();
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
        private gridAPI: IgxGridAPIService,
        private cdr: ChangeDetectorRef,
        private element: ElementRef) { }

    public update(val: any) {
        this.grid.onEditDone.emit({ currentValue: this.value, newValue: val });
        this.value = val;
        this.gridAPI.update(this.gridID, this);
        this.cdr.markForCheck();
    }

    @HostListener("dblclick", ["$event"])
    public onDoubleClick(event) {
        if (this.column.editable) {
            this._inEditMode = true;
            this.grid.cellInEditMode = this;
        }
    }

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.isFocused = true;
        this.isSelected = true;
        this.row.focused = true;
        if (this.grid.cellInEditMode && this.grid.cellInEditMode !== this) {
            this.grid.cellInEditMode.inEditMode = false;
            this.grid.cellInEditMode = null;
        }
        this.grid.onSelection.emit(this);
        this.syncRows();

        // M.K.Force check when isFocused/isSelected prop values in order to ensure HostBinding is updated accordingly.
        this.grid.cdr.detectChanges();
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.isFocused = false;
        this.isSelected = false;
        this.row.focused = false;

        // M.K.Force check when isFocused/isSelected prop values in order to ensure HostBinding is updated accordingly.
        this.grid.cdr.detectChanges();
    }

    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event) {
        event.preventDefault();
        const visibleColumns = this.grid.visibleColumns;
        const rowIndex = this.rowIndex;
        let columnIndex = this.columnIndex;
        const rv = visibleColumns.findIndex((col) => col.index === columnIndex);

        if (rv > 0) {
            columnIndex = visibleColumns[rv - 1].index;

            const target = this.gridAPI.get_cell_by_index(this.gridID, rowIndex, columnIndex);

            if (target) {
                target.nativeElement.focus();
                this.syncRows();
            } else {
                this.row.virtDirRow.scrollPrev();
                this.row.virtDirRow.onChunkLoad.first().subscribe({
                    next: (e: any) => {
                        this.row.cdr.detectChanges();
                        const currTarget = this.gridAPI.get_cell_by_index(this.gridID, rowIndex, columnIndex);
                        if (currTarget) {
                            currTarget.nativeElement.focus();
                        } else {
                            this.row.cells.first.nativeElement.focus();
                        }
                        setTimeout(() => {
                            this.syncRows();
                        });
                    }
                });
            }
        }
    }

    @HostListener("keydown.control.arrowleft")
    public onKeydownCtrlArrowLeft() {
        const target = this.gridAPI.get_cell_by_index(this.gridID, this.rowIndex, this.row.cells.first.columnIndex);

        if (target) {
            target.nativeElement.focus();
            this.syncRows();
        }
    }

    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event) {
        event.preventDefault();
        const visibleColumns = this.grid.visibleColumns;
        const rowIndex = this.rowIndex;
        let columnIndex = this.columnIndex;
        const rv = visibleColumns.findIndex((col) => col.index === columnIndex);

        if (rv > -1 && rv < visibleColumns.length - 1) {
            columnIndex = visibleColumns[rv + 1].index;

            const target = this.gridAPI.get_cell_by_index(this.gridID, rowIndex, columnIndex);

            if (target) {
                target.nativeElement.focus();
                this.syncRows();
            } else {
                this.row.virtDirRow.scrollNext();
                this.row.virtDirRow.onChunkLoad.first().subscribe({
                    next: (e: any) => {
                        this.row.cdr.detectChanges();
                        const currTarget = this.gridAPI.get_cell_by_index(this.gridID, rowIndex, columnIndex);
                        if (currTarget) {
                            currTarget.nativeElement.focus();
                        } else {
                            this.row.cells.last.nativeElement.focus();
                        }
                        setTimeout(() => {
                            this.syncRows();
                        });
                    }
                });
            }
        }
    }

    @HostListener("keydown.control.arrowright")
    public onKeydownCtrlArrowRight() {
        const target = this.gridAPI.get_cell_by_index(this.gridID, this.rowIndex, this.row.cells.last.columnIndex);

        if (target) {
            target.nativeElement.focus();
            this.syncRows();
        }
    }

    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event) {
        event.preventDefault();
        const target = this.gridAPI.get_cell_by_index(this.gridID, this.rowIndex - 1, this.columnIndex);
        if (target) {
            target.nativeElement.focus();
        } else {
            this.row.grid.parentVirtDir.scrollPrev();
        }
    }

    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event) {
        event.preventDefault();
        const target = this.gridAPI.get_cell_by_index(this.gridID, this.rowIndex + 1, this.columnIndex);
        if (target) {
            target.nativeElement.focus();
        } else {
            this.row.grid.parentVirtDir.scrollNext();
        }
    }

    @HostListener("keydown.enter")
    @HostListener("keydown.f2")
    public onKeydownEnterEditMode() {
        if (this.column.editable) {
            this._inEditMode = !this._inEditMode;
            this.grid.cellInEditMode = this;
        }
    }

    @HostListener("keydown.escape")
    public onKeydownExitEditMode() {
        this._inEditMode = false;
    }

    syncRows() {
        this.grid.markForCheck();
        const scrLeft = this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.scrollLeft;
        this.grid.headerContainer.dc.instance._viewContainer.element.nativeElement.style.left = (-scrLeft) + "px";
        this.row.grid.rowList.map((row) => {
            const elem = row.virtDirRow.dc.instance._viewContainer.element.nativeElement;
            elem.scrollLeft = scrLeft;
        });
    }

    private clearState() {
        this._inEditMode = false;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }
}
