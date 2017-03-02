import {
    Component,
    Directive,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
    TemplateRef,
    ViewContainerRef
} from "@angular/core";
import { IgxColumnComponent } from "./column.component";

// Interfaces

export interface IFilteredEvent {
    value: string;
    column: IgxColumnComponent;
}

export interface ISortEvent {
    column: IgxColumnComponent;
    direction: any;
}

// Enums

export enum SortDirection {
    none,
    asc,
    desc
};

// Directives

@Directive({
    selector: "[igxCell]"
})
export class IgxCellTemplateDirective {

    constructor(public template: TemplateRef<any>) {}
}

@Directive({
    selector: "[igxHeader]"
})
export class IgxCellHeaderTemplateDirective {

    constructor(public template: TemplateRef<any>) {}

}

@Directive({
    selector: "[igxColumnSorting]",
})
export class IgxColumnSortingDirective {
    @Input("igxColumnSorting") public column: IgxColumnComponent;
    @Output() protected onSort = new EventEmitter<ISortEvent>();
    public direction: SortDirection = SortDirection.none;

    @HostBinding("class.asc")
    get asc(): boolean {
        return this.direction === 1;
    }

    @HostBinding("class.desc")
    get desc(): boolean {
        return this.direction === 2;
    }

    @HostBinding("class.off")
    get off(): boolean {
        return this.direction === 0;
    }

    @HostListener("click", ["$event"])
    protected onClick(event) {
        if (this.column.sortable) {
            this.direction = ++this.direction > SortDirection.desc ? SortDirection.none : this.direction;
            this.onSort.emit(<ISortEvent> {
                column: this.column,
                direction: SortDirection[this.direction]
            });
        }
    }
}

// Components

@Component({
    moduleId: module.id,
    selector: "igx-cell-body",
    template: ``
})
export class IgxCellBodyComponent {

    @Input() public column: IgxColumnComponent;
    @Input() public item: any;
    @Input() public rowIndex: number;
    @Input() public row: any;

    constructor(public viewContainer: ViewContainerRef) {}
    public ngOnInit() {
        let view = this.viewContainer.createEmbeddedView(this.column.bodyTemplate, {
            $implicit: this.column,
            item: this.item,
            row: this.row,
            rowIndex: this.rowIndex,
        });
    }
}

@Component({
    moduleId: module.id,
    selector: "igx-cell-header",
    template: ``
})
export class IgxCellHeaderComponent {

    @Input() public column: IgxColumnComponent;
    @Input() public colIndex: number;

    constructor(public viewContainer: ViewContainerRef) {}

    public ngOnInit() {
        let view = this.viewContainer.createEmbeddedView(this.column.headerTemplate, {
            $implicit: this.column,
            colIndex: this.colIndex
        });
    }
}

@Component({
    moduleId: module.id,
    selector: "igx-col-filter",
    styles: [
        `
        div {
            position: relative;
            max-width: 200px;
        }
        .igx-filter-drop {
            display: block;
            position: absolute;
            left: 3rem;
            top: 0;
            padding: 5px;
            width: 200px;
            background: white;
            border: 2px solid #ccc;
            border-radius: 4px;
            box-shadow: 2px 2px 2px 2px rgba(0,0,0,.25);
        }
        .b-active {
            background: #29b6f6 !important;
            color: #fff;
        }
        `
    ],
    templateUrl: "column-filtering.component.html"
})
export class IgxColumnFilteringComponent {

    @Input() public column: IgxColumnComponent;
    @Input() public value: string;
    @Input() public hidden: boolean = true;
    @Output() protected onFilter = new EventEmitter<IFilteredEvent>();

    protected filterData(event) {
        this.onFilter.emit(<IFilteredEvent> {
            column: this.column,
            value: event.target.value,
        });
    }

    protected toggle(): void {
        this.hidden = !this.hidden;
    }
}
