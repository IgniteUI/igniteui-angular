import {
    Component,
    Directive,
    EmbeddedViewRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
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

// directives

@Directive({
    selector: "[igxCell]"
})
export class IgxCellTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: "[igxHeader]"
})
export class IgxCellHeaderTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

}

@Directive({
    selector: "[igxFooter]"
})
export class IgxCellFooterTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: "[igxColumnSorting]"
})
export class IgxColumnSortingDirective {
    @Input("igxColumnSorting") public column: IgxColumnComponent;
    @Input() public sortDirection: SortingDirection = SortingDirection.None;
    @Output() protected onSort = new EventEmitter<IgxColumnSortedEvent>();

    @HostBinding("class.off")
    get off(): boolean {
        return this.sortDirection === SortingDirection.None;
    }

    @HostBinding("class.asc")
    get asc(): boolean {
        return this.sortDirection === SortingDirection.Asc;
    }

    @HostBinding("class.desc")
    get desc(): boolean {
        return this.sortDirection === SortingDirection.Desc;
    }

    @HostListener("click", ["$event"])
    protected onClick(event: Event): void {
        if (this.column.sortable) {
            this.sortDirection = ++this.sortDirection > SortingDirection.Desc ? SortingDirection.None
                : this.sortDirection;
            this.onSort.emit({
                column: this.column,
                direction: this.sortDirection
            });
        }
    }
}

// components

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "igx-cell-body",
    template: ``
})
export class IgxCellBodyComponent implements OnInit, OnDestroy {

    @Input() public column: IgxColumnComponent;
    @Input() public item: any;
    @Input() public rowIndex: number;
    @Input() public row: any;
    protected view: EmbeddedViewRef<any>;

    constructor(public viewContainer: ViewContainerRef) { }
    public ngOnInit(): void {
        this.view = this.viewContainer.createEmbeddedView(this.column.bodyTemplate, this);
    }

    public ngOnDestroy(): void {
        this.view.destroy();
    }
}

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "igx-cell-header",
    template: ``
})
export class IgxCellHeaderComponent implements OnInit, OnDestroy {

    @Input() public column: IgxColumnComponent;
    @Input() public colIndex: number;
    protected view: EmbeddedViewRef<any>;

    constructor(public viewContainer: ViewContainerRef) { }

    public ngOnInit(): void {
        this.view = this.viewContainer.createEmbeddedView(this.column.headerTemplate, this);
    }

    public ngOnDestroy(): void {
        this.view.destroy();
    }
}

@Component({
    selector: "igx-cell-footer",
    template: ``
})
export class IgxCellFooterComponent implements OnInit, OnDestroy {

    @Input() public column: IgxColumnComponent;
    @Input() public colIndex: number;
    protected view: EmbeddedViewRef<any>;

    constructor(public viewContainer: ViewContainerRef) { }

    public ngOnInit(): void {
        this.view = this.viewContainer.createEmbeddedView(this.column.footerTemplate, this);
    }

    public ngOnDestroy(): void {
        this.view.destroy();
    }
}

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "igx-col-filter",
    styleUrls: ["./column-filtering.component.scss"],
    templateUrl: "column-filtering.component.html"
})
export class IgxColumnFilteringComponent {

    @Input() public column: IgxColumnComponent;
    @Input() public value: string;
    @Input() public hidden: boolean = true;
    @Output() protected onFilter = new EventEmitter<IgxColumnFilteredEvent>();

    public show(): void {
        this.hidden = false;
    }

    public hide(): void {
        this.hidden = true;
    }

    public toggle(): void {
        this.hidden = !this.hidden;
    }

    protected filterData(event: any): void {
        this.onFilter.emit({
            column: this.column,
            value: event.target.value
        });
    }
}
