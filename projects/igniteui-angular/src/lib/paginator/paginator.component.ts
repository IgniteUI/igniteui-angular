import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, Output, NgModule, Optional, Inject, EventEmitter, HostBinding } from '@angular/core';
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
export class IgxPaginatorComponent extends DisplayDensityBase {

    /**
     * Total pages calculated from totalRecords and perPage
     */
    public totalPages: number;
    protected _page: number;
    protected _totalRecords: number;
    protected _selectOptions = [5, 10, 15, 25, 50, 100, 500];
    protected _perPage = 15;

    /**
     * @hidden
     */
    @HostBinding('class')
    public get classes(): string {
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
    public get page() {
        return this._page;
    }

    public set page(value: number) {
        this._page = value;
        this.pageChange.emit(this._page);
    }

    /**
   * An @Input property, sets number of visible items per page in the `IgxPaginatorComponent`.
   * The default is 15.
   * ```typescript
   * let itemsPerPage = this.paginator.perPage;
   * ```
   * @memberof IgxPaginatorComponent
   */
    @Input()
    public get perPage() {
        return this._perPage;
    }

    public set perPage(value: number) {
        this._perPage = value;
        this.perPageChange.emit(this._perPage);
        this.totalPages = Math.ceil(this.totalRecords / this._perPage);
    }

    /**
    * An @Input property that sets the total records.
    * ```typescript
    * let totalRecords = this.paginator.totalRecords;
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public get totalRecords() {
        return this._totalRecords;
    }

    public set totalRecords(value: number) {
        this._totalRecords = value;
        this.totalPages = Math.ceil(this.totalRecords / this.perPage);
    }

    /**
    * An @Input property that sets custom options in the select of the paginator
    * ```typescript
    * let options = this.paginator.selectOptions;
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public get selectOptions() {
        return this._selectOptions;
    }

    public set selectOptions(value: Array<number>) {
        this._selectOptions = this.sortUniqueOptions(value, this._perPage);
    }

    /**
    * An @Input property that sets if the pager in the paginator should be enabled.
    * ```html
    * <igx-paginator [pagerEnabled]="true"></igx-paginator>
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public pagerEnabled = true;

    /**
    * An @Input property that sets if the pager in the paginator should be hidden.
    * ```html
    * <igx-paginator [pagerHidden]="true"></igx-paginator>
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public pagerHidden = false;

    /**
    * An @Input property that sets if the dropdown in the paginator should be enabled.
    * ```html
    * <igx-paginator [dropdownEnabled]="true"></igx-paginator>
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public dropdownEnabled = true;

    /**
    * An @Input property that sets if the dropdown in the paginator should be hidden.
    * ```html
    * <igx-paginator [dropdownHidden]="true"></igx-paginator>
    * ```
    * @memberof IgxPaginatorComponent
    */
    @Input()
    public dropdownHidden = false;

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
     *An event that is emitted when the select in the `IgxPaginatorComponent` changes its value.
    */
    @Output()
    public perPageChange = new EventEmitter<number>();
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

    private sortUniqueOptions(values: Array<number>, newOption: number): number[] {
        return Array.from(new Set([...values, newOption])).sort((a, b) => a - b);
    }

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
    }
}

@NgModule({
    declarations: [IgxPaginatorComponent],
    exports: [IgxPaginatorComponent],
    imports: [CommonModule, IgxSelectModule, FormsModule, IgxIconModule, IgxButtonModule, IgxRippleModule]
})
export class IgxPaginatorModule { }
