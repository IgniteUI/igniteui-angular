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
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridComponent } from "./grid.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-row",
    templateUrl: "./row.component.html"
})
export class IgxGridRowComponent implements OnInit {

    @Input()
    public rowData: any[];

    @Input()
    public index: number;

    @Input()
    public gridID: string;

    @Input()
    set isDirty(value: boolean) {
        if (value) {
           this.clearState();
        }
    }

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

    get pinnedStartColumns(): IgxColumnComponent[] {
        return this.grid.pinnedStartColumns;
    }

    get pinnedEndColumns(): IgxColumnComponent[] {
        return this.grid.pinnedEndColumns;
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

    constructor(private gridAPI: IgxGridAPIService,
                private element: ElementRef,
                public cdr: ChangeDetectorRef) {}

    public ngOnInit() {
        this.virtDirRow.onChunkLoad.subscribe({
            next: (event: any) => {
                this.grid.headerContainer.dc.instance._viewContainer.element.nativeElement.style.left = "0px";
            }
        });
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

    private clearState() {
        this.cdr.detectChanges();
        if (this.cells) {
            this.cells.map((cell) => cell.isDirty = true);
        }
    }
}
