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
    ViewChildren
} from "@angular/core";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxVirtGridComponent } from "./grid.component";
import { VirtualRow } from '../virtual-container-v2/virtual-row.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "igx-grid-row",
    templateUrl: "./row.component.html",
    preserveWhitespaces: false
})
export class IgxGridRowComponent implements VirtualRow {
    @Input()
    public rowData: any[];

    @Input()
    set defaultOptions(val: any) {
        this.gridID = val.gridID;
        
    }

    @Input()
    public index: number;

    @Input()
    public gridID: string;
    
    @Input()
    public cells: Array<any>;
    
    @HostBinding("style.width.px")
    public width: number;

    @HostBinding("style.height.px")
    public height: number;

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

    get grid(): IgxVirtGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    protected defaultCssClass = "igx-grid__tr";
    protected isFocused = false;

    constructor(private gridAPI: IgxGridAPIService, public changeDet: ChangeDetectorRef) {}

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
