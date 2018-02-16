import { ChangeDetectionStrategy, Component, DoCheck, HostBinding, HostListener, Input } from "@angular/core";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-header",
    styles: [
        `
        :host.last-fixed {
            border-right: 1px solid #666;
            }
        :host.first-fixed {
            border-left: 1px solid #666;
        }
    `
    ],
    templateUrl: "./grid-header.component.html"
})
export class IgxGridHeaderComponent implements DoCheck {

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

    constructor(private gridAPI: IgxGridAPIService) { }

    public ngDoCheck() {
        this.getSortDirection();
    }

    @HostListener("click", ["$event"])
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

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    @HostBinding("class.fixed")
    get isFixed() {
        return this.column.pinnedToLeft || this.column.pinnedToRight;
    }

    @HostBinding("class.last-fixed")
    get isLastFixed() {
        const pinnedCols = this.grid.pinnedLeftColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    @HostBinding("class.first-fixed")
    get isFirstFixed() {
        const pinnedCols = this.grid.pinnedRightColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === 0;
        }
    }

    protected getSortDirection() {
        const expr = this.gridAPI.get(this.gridID).sortingExpressions.find((x) => x.fieldName === this.column.field);
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
    }
}
