import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    DoCheck,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { IgxSelectionAPIService } from "../core/selection";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";
import { IgxGridComponent } from "./grid.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-row",
    templateUrl: "./row.component.html"
})
export class IgxGridRowComponent implements IGridBus, OnInit, OnDestroy, DoCheck {

    @Input()
    public rowData: any[];

    @Input()
    public index: number;

    @Input()
    public primaryValue: any;

    @Input()
    public gridID: string;

    @ViewChild("igxDirRef", { read: IgxForOfDirective })
    public virtDirRow: IgxForOfDirective<any>;

    @ViewChildren(forwardRef(() => IgxGridCellComponent), { read: IgxGridCellComponent })
    public cells: QueryList<IgxGridCellComponent>;

    @HostBinding("style.height.px")
    get rowHeight() {
        return this.grid.rowHeight;
    }
    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("attr.role")
    public role = "row";

    @HostBinding("class")
    get styleClasses(): string {
        return `${this.defaultCssClass} ${this.index % 2 ? this.grid.evenRowCSS : this.grid.oddRowCSS}`;
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-grid__tr--selected")
    get focused(): boolean {
        return this.isFocused;
    }

    set focused(val: boolean) {
        this.isFocused = val;
    }

    get columns(): IgxColumnComponent[] {
        return this.grid.visibleColumns;
    }

    get pinnedColumns(): IgxColumnComponent[] {
        return this.grid.pinnedColumns;
    }

    get unpinnedColumns(): IgxColumnComponent[] {
        return this.grid.unpinnedColumns;
    }

    public get rowSelectable() {
        return this.grid.rowSelectable;
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-grid__tr--selected")
    public isSelected: boolean;

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    private get _rowID() {
        // A row in the grid is identified either by:
        // primaryKey data value,
        // or if the primaryKey is omitted, then the whole rowData is used instead.
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? this.rowData[primaryKey] : this.rowData;
    }

    get nativeElement() {
        return this.element.nativeElement;
    }

    protected defaultCssClass = "igx-grid__tr";
    protected _rowSelection = false;
    protected isFocused = false;
    protected chunkLoaded$;

    constructor(public gridAPI: IgxGridAPIService,
                private selectionAPI: IgxSelectionAPIService,
                private element: ElementRef,
                public cdr: ChangeDetectorRef) {}

    @autoWire(true)
    public ngOnInit() {
        this.chunkLoaded$ = this.virtDirRow.onChunkLoad.subscribe(() => {
            if (this.grid.cellInEditMode) {
                this.grid.cellInEditMode.inEditMode = false;
            }
            this.grid.headerContainer.dc.instance._viewContainer.element.nativeElement.style.left = "0px";
        });
    }

    public ngOnDestroy() {
        if (this.chunkLoaded$) {
            this.chunkLoaded$.unsubscribe();
        }
    }

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.isFocused = true;

        // TODO: Emit selection event
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.isFocused = false;

        // TODO: Emit de-selection event
    }

    public onCheckboxClick(event) {
        if (event.checked) {
            this.select();
        } else {
            this.deselect();
        }
        this.grid.onRowSelection.emit(this);
    }

    public ngDoCheck() {
        if (this.rowSelectable) {
            this.isSelected = this.grid.allRowsSelected ? true : this.selectionAPI.is_item_selected(this.gridID, this._rowID);
            this.cdr.markForCheck();
        } else {
            this.isSelected = this.selectionAPI.is_item_selected(this.gridID, this._rowID);
        }
    }

    public select() {
        if (this.rowSelectable) {
            this.selectionAPI.select_item(this.gridID, this._rowID);
            this.grid.allRowsSelected = this.selectionAPI.are_all_selected(this.gridID, this.grid.data);
            this.grid.headerCheckbox.indeterminate = this.grid.allRowsSelected ? false : true;
        }
    }

    public deselect() {
        if (this.rowSelectable) {
            this.selectionAPI.deselect_item(this.gridID, this._rowID);
            this.grid.allRowsSelected = false;
            this.grid.headerCheckbox.indeterminate = !this.selectionAPI.are_none_selected(this.gridID);
        }
    }
}
