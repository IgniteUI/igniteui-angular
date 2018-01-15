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
    get value(): any {
        return this._value;
    }

    set value(val: any) {
        this._value = val;
        this.gridAPI.update(this.gridID, this);
        this.cdr.markForCheck();
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
        return `${this.row.gridID}-${this.column.field}`;
    }

    @HostBinding("class")
    get styleClasses(): string {
        return `${this.defaultCssClass} ${this.column.cellClasses}`;
    }

    @HostBinding("style.min-width")
    get width() {
        return this.column.width;
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
    protected _value: any;
    protected _inEditMode = false;

    constructor(private gridAPI: IgxGridAPIService,
                private cdr: ChangeDetectorRef,
                private element: ElementRef) {}

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
        if (this.grid.cellInEditMode && this.grid.cellInEditMode !== this) {
            this.grid.cellInEditMode._inEditMode = false;
            this.grid.cellInEditMode.cdr.markForCheck();
            this.grid.cellInEditMode = null;
        }
        this.grid.onSelection.emit(this);
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.isFocused = false;
        this.isSelected = false;
    }

    @HostListener("keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {

        this.handleKeyboardNavigation(event.keyCode);
        this.handleInlineEditMode(event.keyCode);
    }

    protected handleKeyboardNavigation(keyCode): void {

        const visibleColumns: IgxColumnComponent[] = this.grid.visibleColumns;
        let ri = this.rowIndex;
        let ci = this.columnIndex;
        let rv: number;
        let target: IgxGridCellComponent;

        switch (keyCode) {
            case KEYCODES.LEFT_ARROW:
                rv = visibleColumns.findIndex((col) => col.index === ci);
                if (rv > 0) {
                    ci = visibleColumns[rv - 1].index;
                }
                break;
            case KEYCODES.UP_ARROW:
                ri -= 1;
                break;
            case KEYCODES.RIGHT_ARROW:
                rv = visibleColumns.findIndex((col) => col.index === ci);
                if (rv > -1 && rv < visibleColumns.length - 1) {
                    ci = visibleColumns[rv + 1].index;
                }
                break;
            case KEYCODES.DOWN_ARROW:
                ri += 1;
                break;
            default:
                return;
        }

        target = this.gridAPI.get_cell_by_index(this.gridID, ri, ci);
        if (target) {
            target.nativeElement.focus();
        }
    }

    protected handleInlineEditMode(keyCode) {
        if (keyCode === KEYCODES.ENTER && this.column.editable) {
            this._inEditMode = !this._inEditMode;
            this.grid.cellInEditMode = this;
            return;
        }
        if (keyCode === KEYCODES.ESCAPE) {
            this._inEditMode = false;
        }
    }
}
