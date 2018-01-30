import { ChangeDetectionStrategy, Component, DoCheck, HostBinding, HostListener, Input } from "@angular/core";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-header",
    templateUrl: "./grid-header.component.html",
    styles:[
        ` 
        :host.last-fixed {
            border-right: 1px solid #666;
            }
    `
    ]
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

    @HostBinding("style.width")
    @HostBinding("style.min-width")
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

    @HostBinding("attr.role")
    public hostRole = "columnheader";

    protected sortDirection = SortingDirection.None;

    constructor(private gridAPI: IgxGridAPIService) { }

    public ngDoCheck() {
        this.getSortDirection();
    }

    @HostListener("click", ["$event"])
    public onClick(event) {
        event.stopPropagation();
        if (this.column.sortable) {
            this.sortDirection = ++this.sortDirection > SortingDirection.Desc ? SortingDirection.None
                : this.sortDirection;
            this.gridAPI.sort(this.gridID, this.column.field, this.sortDirection);
        }
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    @HostBinding("class.fixed")
    get isFixed() {
        return this.column.fixed;
    }

    @HostBinding("class.last-fixed")
    get isLastFixed() {
        var fixedCols = this.grid.fixedColumns;
        return fixedCols.indexOf(this.column) === fixedCols.length - 1;
    }

    protected getSortDirection() {
        const expr = this.gridAPI.get(this.gridID).sortingExpressions.find((x) => x.fieldName === this.column.field);
        if (expr) {
            this.sortDirection = expr.dir;
        }
    }
}
