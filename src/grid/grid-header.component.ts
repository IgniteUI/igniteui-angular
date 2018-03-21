import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnInit
} from "@angular/core";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-header",
    templateUrl: "./grid-header.component.html"
})
export class IgxGridHeaderComponent implements IGridBus, OnInit, DoCheck {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @HostBinding("class")
    get styleClasses() {
        return `igx-grid__th ${this.column.headerClasses}`;
    }

    @HostBinding("style.min-width")
    @HostBinding("style.flex-basis")
    @HostBinding("class.igx-grid__th--fw")
    get width() {
        return this.column.width;
    }

    @HostBinding("class.asc")
    get ascending() {
        return this.sortDirection === SortingDirection.Asc;
    }

    @HostBinding("class.desc")
    get descending() {
        return this.sortDirection === SortingDirection.Desc;
    }

    @HostBinding("class.igx-grid__th--sorted")
    get sorted() {
        return this.sortDirection !== SortingDirection.None;
    }

    @HostBinding("attr.role")
    public hostRole = "columnheader";

    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("attr.id")
    get headerID() {
        return `${this.gridID}_${this.column.field}`;
    }

    protected sortDirection = SortingDirection.None;
    public cursor = null;

    constructor(public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, public elementRef: ElementRef) { }

    public ngOnInit() {
        this.cdr.markForCheck();
    }

    public ngDoCheck() {
        this.getSortDirection();
    }

    @HostListener("click", ["$event"])
    @autoWire(true)
    public onClick(event) {
        event.stopPropagation();
        if (this.column.sortable) {
            const grid = this.gridAPI.get(this.gridID);

            this.sortDirection = ++this.sortDirection > SortingDirection.Desc ? SortingDirection.None
                : this.sortDirection;
            this.gridAPI.sort(this.gridID, this.column.field, this.sortDirection, this.column.sortingIgnoreCase);
            grid.onSortingDone.emit({
                expression: {
                    dir: this.sortDirection,
                    fieldName: this.column.field,
                    ignoreCase: this.column.sortingIgnoreCase
                }
            });
        }
    }

    protected getSortDirection() {
        const expr = this.gridAPI.get(this.gridID).sortingExpressions.find((x) => x.fieldName === this.column.field);
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
    }

    public onResizeAreaMouseOver() {
        if (this.column.resizable) {
            this.cursor = "col-resize";
        }
    }

    public onResizeAreaMouseDown(event) {
        if (event.button === 0 && this.column.resizable) {
            this.column.grid.resizer.show = true;

            this.column.grid.resizer.column = this.column;
            this.column.grid.resizer.x = event.clientX + 1;
            this.column.grid.resizer.actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;
        } else {
            this.cursor = null;
        }
    }

    public onResizeAreaDblClick() {
        const range = this.column.grid.document.createRange();

        if (this.column.bodyTemplate) {
            const referenceNode = this.column.cells[0].nativeElement;
            range.selectNode(referenceNode);

            this.column.width =  range.getBoundingClientRect().width.toString();

            // var getWidth = (child) => {
            //     return child.getBoundingClientRect().width;
            // };
            // const children = Array.from(this.column.cells[0].nativeElement.children);
            // const widths = children.map((child) => getWidth(child));
            // const largestChild = Math.max(...widths);
            // this.column.width = largestChild.toString();
        } else {
            const valToPxls = (element) => {
                const referenceNode = element.nativeElement;
                range.selectNodeContents(referenceNode);

                return  range.getBoundingClientRect().width;
            };

            const cellsContentWidths = this.column.cells.map((cell) => valToPxls(cell));
            const largestCell = Math.max(...cellsContentWidths);

            const index = cellsContentWidths.indexOf(largestCell);
            const cellEl = this.column.cells[index].nativeElement;
            const cellStyle = this.column.grid.document.defaultView.getComputedStyle(cellEl);
            const padding = parseInt(cellStyle.paddingLeft, 10) + parseInt(cellStyle.paddingRight, 10);

            this.column.width = (largestCell + padding).toString();
        }

        this.column.grid.markForCheck();
        this.column.grid.onColumnResized.emit();
    }
}
