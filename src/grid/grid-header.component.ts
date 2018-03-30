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
    OnInit,
    ViewChild
} from "@angular/core";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { RestrictDrag } from "../directives/dragdrop/dragdrop.directive";
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

    public cursor = null;
    public show = false;
    public resizerHeight;
    public dragDirection: RestrictDrag = RestrictDrag.HORIZONTALLY;

    protected sortDirection = SortingDirection.None;
    private _startResizePos;
    private _pinnedWidth;

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

    get restrictResizeMin(): number {
        return parseInt(this.column.minWidth, 10) - this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    get restrictResizeMax(): number {
        const actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

        if (this.column.pinned) {
            const maxWidth = this._pinnedWidth = this.grid.calcPinnedContainerMaxWidth - this.grid.pinnedWidth + actualWidth;

            if (this.column.maxWidth && parseInt(this.column.maxWidth, 10) < maxWidth) {
                this._pinnedWidth = this.column.maxWidth;
                return parseInt(this.column.maxWidth, 10) - actualWidth;
            } else {
                return maxWidth - actualWidth;
            }
        } else {
            if (this.column.maxWidth) {
                return parseInt(this.column.maxWidth, 10) - actualWidth;
            } else {
                return Number.MAX_SAFE_INTEGER;
            }
        }
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get isPinned() {
        return this.column.pinned;
    }

    @HostBinding("class.igx-grid__th--pinned-start")
    get isLastPinned() {
        const pinnedCols = this.grid.pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
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
            this.show = true;
            this.resizerHeight = this.grid.calcResizerHeight;
        } else {
            this.cursor = null;
        }
    }

    public onResizeAreaDblClick() {
        if (this.column.resizable) {
            const currentColWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

            const range = this.column.grid.document.createRange();
            const valToPxls = (referenceNode) => {
                range.selectNodeContents(referenceNode);
                return  range.getBoundingClientRect().width;
            };

            const cellsContentWidths = this.column.bodyTemplate ?
                    Array.from(this.column.cells[0].nativeElement.children).map((child) => valToPxls(child)) :
                    this.column.cells.map((cell) => valToPxls(cell.nativeElement));

            const largestCell = Math.max(...cellsContentWidths);

            const index = cellsContentWidths.indexOf(largestCell);
            const cellEl = this.column.cells[index].nativeElement;
            const cellStyle = this.grid.document.defaultView.getComputedStyle(cellEl);
            const padding = parseInt(cellStyle.paddingLeft, 10) + parseInt(cellStyle.paddingRight, 10);

            if (this.column.pinned) {
                const newPinnedWidth  = this.grid.pinnedWidth - this.elementRef.nativeElement.getBoundingClientRect().width +
                    largestCell + padding;

                if (newPinnedWidth <= this.grid.calcPinnedContainerMaxWidth) {
                    this.column.width = (largestCell + padding).toString();
                }
            } else {
                this.column.width = (largestCell + padding).toString();
            }

            this.grid.markForCheck();
            this.grid.onColumnResized.emit({column: this.column, prevWidth: currentColWidth, newWidth: this.column.width});
        }
    }

    public startResizing(event) {
        this._startResizePos = event.clientX;
    }

    public resize(event) {

        this.show = false;
        const diff = event.clientX - this._startResizePos;

        if (this.column.resizable) {
            let currentColWidth = parseInt(this.column.width, 10);
            const colMinWidth = parseInt(this.column.minWidth, 10);

            const colMaxWidth = this.column.pinned ? this._pinnedWidth : parseInt(this.column.maxWidth, 10);

            const actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

            currentColWidth = (currentColWidth < actualWidth) ? actualWidth : currentColWidth;

            if (currentColWidth + diff < colMinWidth) {
                this.column.width = colMinWidth + "px";
            } else if (colMaxWidth && (currentColWidth + diff > colMaxWidth)) {
                this.column.width = colMaxWidth + "px";
            } else {
                this.column.width = currentColWidth + diff + "px";
            }

            this.grid.markForCheck();

            if (currentColWidth.toString() !== this.column.width) {
                this.grid.onColumnResized.emit({column: this.column, prevWidth: currentColWidth.toString(), newWidth: this.column.width});
            }
        }
    }
}
