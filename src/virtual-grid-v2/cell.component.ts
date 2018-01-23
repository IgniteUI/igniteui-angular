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
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { VirtualCell } from '../virtual-container-v2/virtual-cell.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "igx-grid-cell",
    templateUrl: "./cell.component.html",
    preserveWhitespaces: false
})
export class IgxGridCellComponent implements VirtualCell {
    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: any;

    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    set defaultOptions(val: any) {

    }

    @Input()
    get value(): any {
        return this._value;
    }

    @HostBinding("style.height.px")
    public height: number;

    @HostBinding("style.width.px")
    public width: number;
    
    @HostBinding("style.display")
    public displayStyle = "flex";
    
    set value(val: any) {
        this._value = val;
        //this.gridAPI.update(this.gridID, this);
        this.changeDet.markForCheck();
    }

    get formatter(): (value: any) => any {
        if(this.column) {
            return this.column.formatter;
        } else {
            return undefined;
        }
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
        if(this.column) {
            return !this.column.editable;
        } else {
            return true;
        }
    }

    @HostBinding("attr.aria-describedby")
    get describedby(): string {
        if(this.row && this.column) {
            return `${this.row.gridID}-${this.column.field}`;
        }
        return '';
    }

    @HostBinding("class")
    get styleClasses(): string {
        if(this.column) {
            return `${this.defaultCssClass} ${this.column.cellClasses}`;
        }
        return '';
        
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-grid__td--selected")
    get focused(): boolean {
        return this.isFocused || this.isSelected;
    }

    set focused(val: boolean) {
        this.isFocused = val;
        this.changeDet.markForCheck();
    }

    @HostBinding("class.igx-grid__td--number")
    get applyNumberCSSClass() {
        if(this.column) {
            return this.column.dataType === DataType.Number;
        }
        return false;
    }

    get selected() {
        return this.isSelected;
    }

    set selected(val: boolean) {
        this.isSelected = val;
        this.changeDet.markForCheck();
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

    constructor(public changeDet: ChangeDetectorRef,
                private gridAPI: IgxGridAPIService,                
                private element: ElementRef) {}

    @HostListener("dblclick", ["$event"])
    public onDoubleClick(event) {
        if (this.column.editable) {
            this._inEditMode = true;
        }
    }

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.isFocused = true;
        this.isSelected = true;
        this.grid.onSelection.emit(this);
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.isFocused = false;
        this.isSelected = false;
    }

    @HostListener("keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {

        const visibleColumns = this.grid.visibleColumns;
        let ri = this.rowIndex;
        let ci = this.columnIndex;
        let rv;
        let target;

        if (event.key === "Enter" && this.column.editable) {
            this._inEditMode = !this._inEditMode;
            return;
        } else if (event.key === "Escape") {
            this._inEditMode = false;
            return;
        }

        switch (event.keyCode) {
            case 37:
                rv = visibleColumns.findIndex((col) => col.index === ci);
                if (rv > 0) {
                    ci = visibleColumns[rv - 1].index;
                }
                break;
            case 38:
                ri = this.rowIndex - 1;
                break;
            case 39:
                rv = visibleColumns.findIndex((col) => col.index === ci);
                if (rv > -1 && rv < visibleColumns.length) {
                    ci = visibleColumns[rv + 1].index;
                }
                break;
            case 40:
                ri = this.rowIndex + 1;
                break;
        }

        target = this.gridAPI.get_cell_by_index(this.gridID, ri, ci);
        if (target) {
            target.nativeElement.focus();
        }
    }
}
