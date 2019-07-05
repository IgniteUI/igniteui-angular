import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    Component,
    Input,
    Output,
    OnInit,
    OnChanges,
    NgModule,
    Optional,
    Inject,
    EventEmitter,
    HostBinding,
    SimpleChanges
} from '@angular/core';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase, DisplayDensity } from '../core/displayDensity';
import { IgxSelectModule } from '../select/index';
import { IgxIconModule } from '../icon/index';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';


@Component({
    selector: 'igx-paginator',
    templateUrl: 'paginator.component.html',
})
export class IgxPaginatorComponent extends DisplayDensityBase implements OnInit, OnChanges {
    /**
     * @hidden
     */
    public totalPages: number;

    /**
     * @hidden
     */
    @HostBinding('class') get classes(): string {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-grid-paginator--cosy';
            case DisplayDensity.compact:
                return 'igx-grid-paginator--compact';
            default:
                return 'igx-grid-paginator';
        }
    }

    /**
     * @hidden
     */
    @Input()
    public page = 0;
    /**
    * An @Input property that sets the total records.
    * ```typescript
    * let totalRecords = this.paginator.totalRecords;
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public totalRecords: number;

    /**
    * An @Input property that sets cusom options in the select of the paginator
    * ```typescript
    * let options = this.paginator.selectOptions;
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public selectOptions = [5, 10, 15, 25, 50, 100, 500];

    /**
    * An @Input property, sets number of visible items per page in the `IgxPaginatorComponent`.
    * The default is 15.
    * ```typescript
    * let itemsPerPage = this.paginator.perPage;
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public perPage = 15;

    /**
    * An @Input property, sets number of label of the select.
    * The default is 'Items per page' localized string.
    * ```html
    * <igx-paginator label="My custom label"></igx-paginator>
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public selectLabel = CurrentResourceStrings.GridResStrings.igx_grid_paginator_label;

    /**
     *An event that is emitted when the select in the `IgxPaginatorComponent` changes value.
    */
    @Output()
    public selectChange = new EventEmitter<number>();
    /**
     *An event that is emitted when the paginating is used.
    */
    @Output()
    public pageChange = new EventEmitter<number>();

    constructor(@Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }

    /**
     * Returns if the current page is the last page.
     * ```typescript
     * const lastPage = this.paginator.isLastPage;
     * ```
     */
    get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    /**
     * Returns if the current page is the first page.
     * ```typescript
     * const lastPage = this.paginator.isFirstPage;
     * ```
     */
    get isFirstPage(): boolean {
        return this.page === 0;
    }
    /**
     * @hidden
     */
    public ngOnInit(): void {
        this.perPage = parseInt(this.perPage.toString(), 10);
        this.selectOptions = this.sortUniqueOptions(this.selectOptions, this.perPage);
        this.totalPages = Math.ceil(this.totalRecords / this.perPage);
    }
    /**
     * @hidden
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.perPage) {
            this.perPage = changes.perPage.currentValue;
            this.selectOptions = this.sortUniqueOptions(this.selectOptions, this.perPage);
            this.totalPages = Math.ceil(this.totalRecords / this.perPage);
        }
        if (changes.page) {
            this.page = changes.page.currentValue;
        }
        if (changes.totalRecords) {
            this.totalRecords = changes.totalRecords.currentValue;
            this.totalPages = Math.ceil(this.totalRecords / this.perPage);
        }
    }
     /**
     * Executes on change of select in  `IgxPaginatorComponent`.
     * ```typescript
     * this.paginator.handleChange();
     * ```
	 * @memberof IgxPaginatorComponent
     */
    public handleChange(): void {
        this.selectChange.emit(this.perPage);
        this.page = 0;
        this.totalPages = Math.ceil(this.totalRecords / this.perPage);
    }

    private sortUniqueOptions(values: Array<number>, newOption: number): number[] {
        return Array.from(new Set([...values, newOption])).sort((a, b) => a - b);
    }
    /**
     * Set the the class of the `igx-select` dependant on the current display density.
     * ```typescript
     * this.paginator.handleChange();
     * ```
	 * @memberof IgxPaginatorComponent
     */
    public paginatorSelectDisplayDensity(): string {
        if (this.displayDensity === DisplayDensity.comfortable) {
            return DisplayDensity.cosy;
        }
        return DisplayDensity.compact;
    }
    /**
     * Goes to the next page of the `IgxPaginatorComponent`, if the paginator is not already at the last page.
     * ```typescript
     * this.paginator.nextPage();
     * ```
	 * @memberof IgxPaginatorComponent
     */
    public nextPage(): void {
        if (!this.isLastPage) {
            this.page += 1;
        }
        this.pageChange.emit(this.page);
    }
    /**
     * Goes to the previous page of the `IgxPaginatorComponent`, if the paginator is not already at the first page.
     * ```typescript
     * this.paginator.previousPage();
     * ```
	 * @memberof IgxPaginatorComponent
     */
    public previousPage(): void {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
        this.pageChange.emit(this.page);
    }
    /**
     * Goes to the desired page index.
     * ```typescript
     * this.pagiantor.paginate(1);
     * ```
     * @param val
     * @memberof IgxPaginatorComponent
     */
    public paginate(val: number): void {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }

        this.page = val;
        this.pageChange.emit(this.page);
    }
}

@NgModule({
    declarations: [IgxPaginatorComponent],
    exports: [IgxPaginatorComponent],
    imports: [CommonModule, IgxSelectModule, FormsModule, IgxIconModule, IgxButtonModule, IgxRippleModule]
})
export class IgxPaginatorModule { }
