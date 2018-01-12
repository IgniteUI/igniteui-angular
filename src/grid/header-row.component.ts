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

import { IgxColumnComponent } from "./column.component";
import { IgxGridComponent } from "./grid.component";
import {VirtualVericalItemComponent} from "../virtual-container/virtual.vertical.item.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "igx-grid-header-row",
    templateUrl: "./header-row.component.html",
    preserveWhitespaces: false
})
export class IgxGridHeaderRowComponent implements VirtualVericalItemComponent {
    public grid:IgxGridComponent;
    public id:any;

    constructor(private inj:Injector) {
        let parentComponent = this.inj.get(IgxGridComponent);
        this.grid = parentComponent;
        this.id = this.grid.id;
    }
    @Input()
    @HostBinding("style.height")
    height:number;

    @Input()
    public rowData: any[];

    @HostBinding("style.display")
    private display = "flex";

    get columns(): IgxColumnComponent[] {
        return this._columns;
    }
    set columns(val){
        this._columns = val;
    }


    protected _columns = this.grid ? this.grid.visibleColumns:null;
}