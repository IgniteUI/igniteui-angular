import { SortingDirection } from "../data-operations/sorting-expression.interface";
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

// interfaces

export interface IgxColumnFilteredEvent {
    value: string;
    column: IgxColumnComponent;
}

export interface IgxColumnSortedEvent {
    column: IgxColumnComponent;
    direction: any;
}

// enums

export enum SortDirection {
    none,
    asc,
    desc
};

// directives

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
    selector: "[igxFooter]"
})
export class IgxCellFooterTemplateDirective {

    constructor(public template: TemplateRef<any>) {}
}

@Directive({
    selector: "[igxColumnSorting]",
})
export class IgxColumnSortingDirective {
    @Input("igxColumnSorting") public column: IgxColumnComponent;
    @Output() protected onSort = new EventEmitter<IgxColumnSortedEvent>();
    public direction: SortingDirection;

    @HostBinding("class.asc")
    get asc(): boolean {
        return this.direction === SortingDirection.Asc;
    }

    @HostBinding("class.desc")
    get desc(): boolean {
        return this.direction === SortingDirection.Desc;
    }


    @HostListener("click", ["$event"])
    protected onClick(event: Event): void {
        if (this.column.sortable) {
            this.direction = this.direction === SortingDirection.Asc ? SortingDirection.Desc : SortingDirection.Asc;
            this.onSort.emit({
                column: this.column,
                direction: this.direction
            });
        }
    }
}

// components

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
    public ngOnInit(): void {
        this.viewContainer.createEmbeddedView(this.column.bodyTemplate, {
            "$implicit": this.column,
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

    public ngOnInit(): void {
        this.viewContainer.createEmbeddedView(this.column.headerTemplate, {
            "$implicit": this.column,
            colIndex: this.colIndex
        });
    }
}

@Component({
    moduleId: module.id,
    selector: "igx-cell-footer",
    template: ``
})
export class IgxCellFooterComponent {

    @Input() public column: IgxColumnComponent;
    @Input() public colIndex: number;

    constructor(public viewContainer: ViewContainerRef) {}

    public ngOnInit(): void {
        this.viewContainer.createEmbeddedView(this.column.footerTemplate, {
            "$implicit": this.column,
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
    @Output() protected onFilter = new EventEmitter<IgxColumnFilteredEvent>();

    protected filterData(event: any): void {
        this.onFilter.emit({
            column: this.column,
            value: event.target.value,
        });
    }

    public show(): void {
        this.hidden = false;
    }

    public hide(): void {
        this.hidden = true;
    }

    public toggle(): void {
        this.hidden = !this.hidden;
    }
}
