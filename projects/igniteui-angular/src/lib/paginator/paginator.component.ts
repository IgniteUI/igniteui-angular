import { ChangeDetectorRef, Component, ContentChild, Directive, ElementRef, EventEmitter, Host, HostBinding, Input, Output, forwardRef } from '@angular/core';
import { IPageCancellableEventArgs, IPageEventArgs } from './paginator-interfaces';
import { IPaginatorResourceStrings, PaginatorResourceStringsEN } from '../core/i18n/paginator-resources';
import { OverlaySettings } from '../services/overlay/utilities';
import { IgxSelectItemComponent } from '../select/select-item.component';
import { FormsModule } from '@angular/forms';
import { IgxSelectComponent } from '../select/select.component';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { NgIf, NgFor } from '@angular/common';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { IgxIconButtonDirective } from '../directives/button/icon-button.directive';
import { IgxPaginatorToken } from './token';

@Directive({
    selector: '[igxPaginatorContent],igx-paginator-content',
    standalone: true
})
export class IgxPaginatorContentDirective {
    /**
     * @internal
     * @hidden
     */
    @HostBinding('class.igx-paginator-content')
    public cssClass = 'igx-paginator-content';
}

/* blazorElement */
/* mustUseNGParentAnchor */
/* wcElementTag: igc-paginator */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/* contentParent: GridBaseDirective */
/* contentParent: RowIsland */
/* contentParent: HierarchicalGrid */
/* jsonAPIManageCollectionInMarkup */
/**
 * Paginator component description
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent, *
 */
@Component({
    selector: 'igx-paginator',
    templateUrl: 'paginator.component.html',
    imports: [NgIf, forwardRef(() => IgxPageSizeSelectorComponent), forwardRef(() => IgxPageNavigationComponent)],
    providers: [
        { provide: IgxPaginatorToken, useExisting: IgxPaginatorComponent }
    ]
})
// switch IgxPaginatorToken to extends once density is dropped
export class IgxPaginatorComponent implements IgxPaginatorToken {

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxPaginatorContentDirective)
    public customContent: IgxPaginatorContentDirective;

    /**
     * Emitted when `perPage` property value of the paginator is changed.
     *
     * @example
     * ```html
     * <igx-paginator (perPageChange)="onPerPageChange($event)"></igx-paginator>
     * ```
     * ```typescript
     * public onPerPageChange(perPage: number) {
     *   this.perPage = perPage;
     * }
     * ```
     */
    @Output()
    public perPageChange = new EventEmitter<number>();

    /**
     * Emitted after the current page is changed.
     *
     * @example
     * ```html
     * <igx-paginator (pageChange)="onPageChange($event)"></igx-paginator>
     * ```
     * ```typescript
     * public onPageChange(page: number) {
     *   this.currentPage = page;
     * }
     * ```
     */
    @Output()
    public pageChange = new EventEmitter<number>();

    /**
     * Emitted before paging is performed.
     *
     * @remarks
     * Returns an object consisting of the current and next pages.
     * @example
     * ```html
     * <igx-paginator (paging)="pagingHandler($event)"></igx-paginator>
     * ```
     */
    @Output()
    public paging = new EventEmitter<IPageCancellableEventArgs>();

    /**
     * Emitted after paging is performed.
     *
     * @remarks
     * Returns an object consisting of the previous and current pages.
     * @example
     * ```html
     * <igx-paginator (pagingDone)="pagingDone($event)"></igx-paginator>
     * ```
     */
    @Output()
    public pagingDone = new EventEmitter<IPageEventArgs>();

    /**
     * Total pages calculated from totalRecords and perPage
     */
    public totalPages: number;
    protected _page = 0;
    protected _totalRecords: number;
    protected _selectOptions = [5, 10, 15, 25, 50, 100, 500];
    protected _perPage = 15;

    private _resourceStrings = getCurrentResourceStrings(PaginatorResourceStringsEN);
    private _overlaySettings: OverlaySettings = {};
    private defaultSelectValues = [5, 10, 15, 25, 50, 100, 500];

    /** @hidden @internal */
    @HostBinding('class.igx-paginator')
    public cssClass = 'igx-paginator';

    /**
     * Gets/Sets the current page of the paginator.
     * The default is 0.
     * ```typescript
     * let page = this.paginator.page;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get page() {
        return this._page;
    }

    public set page(value: number) {
        if (this._page === value || value < 0 || value > this.totalPages) {
            return;
        }
        const cancelEventArgs: IPageCancellableEventArgs = { current: this._page, next: value, cancel: false };
        const eventArgs: IPageEventArgs = { previous: this._page, current: value };

        this.paging.emit(cancelEventArgs);
        if (cancelEventArgs.cancel) {
            return;
        }
        this._page = value;
        this.pageChange.emit(this._page);

        this.pagingDone.emit(eventArgs);
    }

    /**
     * Gets/Sets the number of visible items per page in the paginator.
     * The default is 15.
     * ```typescript
     * let itemsPerPage = this.paginator.perPage;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get perPage() {
        return this._perPage;
    }

    public set perPage(value: number) {
        if (value < 0 || this.perPage === value) {
            return;
        }
        this._perPage = Number(value);
        this.perPageChange.emit(this._perPage);
        this._selectOptions = this.sortUniqueOptions(this.defaultSelectValues, this._perPage);
        this.totalPages = Math.ceil(this.totalRecords / this._perPage);
        if (this.totalPages !== 0 && this.page >= this.totalPages) {
            this.page = this.totalPages - 1;
        }
    }

    /**
     * Sets the total records.
     * ```typescript
     * let totalRecords = this.paginator.totalRecords;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get totalRecords() {
        return this._totalRecords;
    }

    public set totalRecords(value: number) {
        this._totalRecords = value;
        this.totalPages = Math.ceil(this.totalRecords / this.perPage);
        if (this.page > this.totalPages) {
            this.page = 0;
        }
        this.cdr.detectChanges();
    }

    /**
     * Sets custom options in the select of the paginator
     * ```typescript
     * let options = this.paginator.selectOptions;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get selectOptions() {
        return this._selectOptions;
    }

    public set selectOptions(value: Array<number>) {
        this._selectOptions = this.sortUniqueOptions(value, this._perPage);
        this.defaultSelectValues = [...value];
    }

    /**
     * Sets custom OverlaySettings.
     * ```html
     * <igx-paginator [overlaySettings] = "customOverlaySettings"></igx-paginator>
     * ```
     */
    @Input()
    public get overlaySettings(): OverlaySettings {
        return this._overlaySettings;
    }

    public set overlaySettings(value: OverlaySettings) {
        this._overlaySettings = Object.assign({}, this._overlaySettings, value);
    }

    /* mustSetInCodePlatforms: WebComponents;Blazor;React */
    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IPaginatorResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): IPaginatorResourceStrings {
        return this._resourceStrings;
    }

    constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) { }

    /**
     * Returns if the current page is the last page.
     * ```typescript
     * const lastPage = this.paginator.isLastPage;
     * ```
     */
    public get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    /**
     * Returns if the current page is the first page.
     * ```typescript
     * const lastPage = this.paginator.isFirstPage;
     * ```
     */
    public get isFirstPage(): boolean {
        return this.page === 0;
    }


    /**
     * Returns if the first pager buttons should be disabled
     * @hidden
     * @deprecated in version 18.1.0. Use the `isFirstPage` property instead.
     */
    public get isFirstPageDisabled(): boolean {
        return this.isFirstPage;
    }

    /**
     * Returns if the last pager buttons should be disabled
     * @hidden
     * @deprecated in version 18.1.0. Use the `isLastPage` property instead.
     */
    public get isLastPageDisabled(): boolean {
        return this.isLastPage;
    }

    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * Goes to the next page of the `IgxPaginatorComponent`, if the paginator is not already at the last page.
     * ```typescript
     * this.paginator.nextPage();
     * ```
     *
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
     *
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
     * this.paginator.paginate(1);
     * ```
     *
     * @param val
     * @memberof IgxPaginatorComponent
     */
    public paginate(val: number): void {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }
        this.page = val;
    }

    private sortUniqueOptions(values: Array<number>, newOption: number): number[] {
        return Array.from(new Set([...values, newOption])).sort((a, b) => a - b);
    }
}


@Component({
    selector: 'igx-page-size',
    templateUrl: 'page-size-selector.component.html',
    imports: [IgxSelectComponent, FormsModule, NgFor, IgxSelectItemComponent]
})
export class IgxPageSizeSelectorComponent {
    /**
     * @internal
     * @hidden
     */
    @HostBinding('class.igx-page-size')
    public cssClass = 'igx-page-size';

    constructor(@Host() public paginator: IgxPaginatorComponent) { }
}


@Component({
    selector: 'igx-page-nav',
    templateUrl: 'pager.component.html',
    imports: [IgxRippleDirective, IgxIconComponent, IgxIconButtonDirective]
})
export class IgxPageNavigationComponent {
    /**
     * @internal
     * @hidden
     */
    @HostBinding('class.igx-page-nav')
    public cssClass = 'igx-page-nav';

    /**
     * Sets the `role` attribute of the element.
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'navigation';

    constructor(
        @Host()
        public paginator: IgxPaginatorComponent) { }
}
