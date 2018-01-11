import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    QueryList,
    ViewChildren,
    Injector
} from "@angular/core";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridComponent } from "./grid.component";

import {VirtualVericalItemComponent} from "../virtual-container/virtual.vertical.item.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "igx-grid-row",
    templateUrl: "./row.component.html",
    preserveWhitespaces: false,
    styles:[`
    tr{    
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    background: inherit;
    -webkit-transition: background 0.2s ease;
    transition: background 0.2s ease;
    
    }
`]
})
export class IgxGridRowComponent implements VirtualVericalItemComponent{

    @Input()
    @HostBinding("style.height")
    height:number;

    @Input()
    public rowData: any[];

    @Input()
    public index: number;

    @Input()
    public gridID: string;

    @ViewChildren(forwardRef(() => IgxGridCellComponent), { read: IgxGridCellComponent })
    public cells: QueryList<IgxGridCellComponent>;

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

    @HostBinding("style.display")
    get shouldDisplay() {        
        return Number(this.height) === 0 ? "none": "";
    }
     

    set focused(val: boolean) {
        this.isFocused = val;
    }

    get columns(): IgxColumnComponent[] {
        return this._columns;
    }
    set columns(val){
        this._columns = val;
    }

    public grid:IgxGridComponent;

    protected defaultCssClass = "igx-grid__tr";
    protected isFocused = false;
    protected _columns = this.grid ? this.grid.visibleColumns:null;

    constructor(private gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private inj:Injector) {
        let parentComponent = this.inj.get(IgxGridComponent);
        this.grid = parentComponent;
        this.gridID = this.grid.id;
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
}
