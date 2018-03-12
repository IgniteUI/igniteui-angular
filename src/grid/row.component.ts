import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
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
export class IgxGridRowComponent implements IGridBus, OnInit, OnDestroy {

    @Input()
    public rowData: any[];

    @Input()
    public index: number;

    @Input()
    public gridID: string;

    @ViewChild("igxDirRef", { read: IgxForOfDirective })
    public virtDirRow: IgxForOfDirective<any>;

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

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    get nativeElement() {
        return this.element.nativeElement;
    }

    protected defaultCssClass = "igx-grid__tr";
    protected isFocused = false;
    protected chunkLoaded$;

    constructor(public gridAPI: IgxGridAPIService,
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
}
