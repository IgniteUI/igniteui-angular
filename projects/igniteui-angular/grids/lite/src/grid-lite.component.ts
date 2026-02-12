import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, input, model, OnDestroy, OnInit, output, viewChild, ViewEncapsulation } from '@angular/core';
import { DataPipelineConfiguration, FilterExpression, GridLiteSortingOptions, IgcGridLite, Keys, SortingExpression } from 'igniteui-grid-lite';
import { IgxGridLiteColumnConfiguration } from './grid-lite-column.component';

export type IgxGridLiteSortingOptions = GridLiteSortingOptions;
export type IgxGridLiteDataPipelineConfiguration<T extends object = any> = DataPipelineConfiguration<T>;
export type IgxGridLiteSortingExpression<T extends object = any> = SortingExpression<T>;
export type IgxGridLiteFilteringExpression<T extends object = any> = FilterExpression<T>;

@Component({
    selector: 'igx-grid-lite',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    styles: `igx-grid-lite { display: contents; }`,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './grid-lite.component.html'
})

export class IgxGridLiteComponent<T extends object = any> implements OnInit, AfterViewInit, OnDestroy {

    //#region Internal state

    private readonly gridRef = viewChild.required<ElementRef<IgcGridLite<T>>>('grid');
    private readonly elem = inject<ElementRef<HTMLElement>>(ElementRef);
    private observer!: MutationObserver;

    //#endregion

    //#region Inputs

    /** The data source for the grid. */
    public readonly data = input<any>([]);

    /**
     * Whether the grid will try to "resolve" its column configuration based on the passed
     * data source.
     *
     * @remarks
     * This property is ignored if any existing column configuration already exists in the grid.
     */
    public readonly autoGenerate = input(false, { transform: booleanAttribute });;

    /** Sort configuration property for the grid. */
    public readonly sortingOptions = input<IgxGridLiteSortingOptions>({
        mode: 'multiple'
    });

    /**
     * Configuration object which controls remote data operations for the grid.
     */
    public readonly dataPipelineConfiguration = input<IgxGridLiteDataPipelineConfiguration>();

    /**
     * The sort state for the grid.
     *
     * @remarks
     * This is a two-way bindable property. It will be updated when sort operations
     * complete through the UI.
     */
    public readonly sortingExpressions = model<IgxGridLiteSortingExpression<T>[]>([]);

    /**
     * The filter state for the grid.
     *
     * @remarks
     * This is a two-way bindable property. It will be updated when filter operations
     * complete through the UI.
     */
    public readonly filteringExpressions = model<IgxGridLiteFilteringExpression<T>[]>([]);

    //#endregion

    //#region Events

    /**
     * Emitted when sorting is initiated through the UI.
     * Returns the sort expression which will be used for the operation.
     *
     * @remarks
     * The event is cancellable which prevents the operation from being applied.
     * The expression can be modified prior to the operation running.
     *
     * @event
     */
    public readonly sorting = output<CustomEvent<IgxGridLiteSortingExpression<T>>>();

    /**
     * Emitted when a sort operation initiated through the UI has completed.
     * Returns the sort expression used for the operation.
     *
     * @event
     */
    public readonly sorted = output<CustomEvent<IgxGridLiteSortingExpression<T>>>();

    /**
     * Emitted when filtering is initiated through the UI.
     *
     * @remarks
     * The event is cancellable which prevents the operation from being applied.
     * The expression can be modified prior to the operation running.
     *
     * @event
     */
    public readonly filtering = output<CustomEvent<IgxGridLiteFilteringExpression<T>>>();

    /**
     * Emitted when a filter operation initiated through the UI has completed.
     * Returns the filter state for the affected column.
     *
     * @event
     */
    public readonly filtered = output<CustomEvent<IgxGridLiteFilteringExpression<T>>>();

    //#endregion

    //#region Getters / Setters

    /**
     * Get the column configuration of the grid.
     */
    public get columns(): IgxGridLiteColumnConfiguration<T>[] {
        return this.gridRef()?.nativeElement.columns ?? [];
    }

    /**
     * Returns the collection of rendered row elements in the grid.
     *
     * @remarks
     * Since the grid has virtualization, this property returns only the currently rendered
     * chunk of elements in the DOM.
     */
    public get rows() {
        return this.gridRef()?.nativeElement.rows ?? [];
    }

    /**
     * Returns the state of the data source after sort/filter operations
     * have been applied.
     */
    public get dataView(): ReadonlyArray<T> {
        return this.gridRef()?.nativeElement.dataView ?? [];
    }

    //#endregion

    constructor() {
        // D.P. Temporary guarded assign instead of binding to prevent WC issue with setter logic re-doing sort/filter
        effect(() => {
            const grid = this.gridRef()?.nativeElement
            if (!grid) return;
            const newValue = this.filteringExpressions();
            if (new Set(newValue).symmetricDifference(new Set(grid.filterExpressions)).size !== 0) {
                grid.clearFilter();
                grid.filterExpressions = newValue;
            }
        });
        effect(() => {
            const grid = this.gridRef()?.nativeElement
            if (!grid) return;
            const newValue = this.sortingExpressions();
            if (new Set(newValue).symmetricDifference(new Set(grid.sortingExpressions)).size !== 0) {
                grid.clearSort();
                grid.sortingExpressions = newValue;
            }
        });

    }

    /**
     * @hidden @internal
     */
    public ngOnInit(): void {
        IgcGridLite.register();
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        const host = this.elem.nativeElement;
        const child = this.gridRef().nativeElement;

        for (const attr of Array.from(host.attributes)) {
            child.setAttribute(attr.name, host.getAttribute(attr.name));
        }

        if (typeof MutationObserver === 'undefined') return;

        this.observer = new MutationObserver((records) => {
            for (const record of records) {
                const value = host.getAttribute(record.attributeName);

                if (value === null) {
                    child.removeAttribute(record.attributeName);
                } else {
                    child.setAttribute(record.attributeName, value);
                }
            }
        });
        this.observer.observe(host, { attributes: true });
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.observer?.disconnect();
    }

    //#region Public API

    /**
     * Performs a filter operation in the grid based on the passed expression(s).
     */
    public filter(config: IgxGridLiteFilteringExpression | IgxGridLiteFilteringExpression[]): void {
        this.gridRef()?.nativeElement.filter(config as FilterExpression<T> | FilterExpression<T>[]);
    }

    /**
     * Performs a sort operation in the grid based on the passed expression(s).
     */
    public sort(expressions: IgxGridLiteSortingExpression<T> | IgxGridLiteSortingExpression<T>[]) {
        this.gridRef()?.nativeElement.sort(expressions);
    }

    /**
     * Resets the current sort state of the control.
     */
    public clearSort(key?: Keys<T>): void {
        this.gridRef()?.nativeElement.clearSort(key);
    }

    /**
     * Resets the current filter state of the control.
     */
    public clearFilter(key?: Keys<T>): void {
        this.gridRef()?.nativeElement.clearFilter(key);
    }

    /**
     * Navigates to a position in the grid based on provided row index and column field.
     * @param row The row index to navigate to
     * @param column The column field to navigate to, if any
     * @param activate Optionally also activate the navigated cell
     */
    public async navigateTo(row: number, column?: Keys<T>, activate = false) {
        await this.gridRef()?.nativeElement.navigateTo(row, column, activate);
    }

    /**
     * Returns a {@link IgxGridLiteColumnConfiguration} for a given column.
     */
    public getColumn(id: Keys<T> | number): IgxGridLiteColumnConfiguration<T> | undefined {
        return this.gridRef()?.nativeElement.getColumn(id);
    }

    //#endregion

    //#region Event handlers

    protected onSorting(event: CustomEvent<SortingExpression<T>>): void {
        event.stopPropagation();
        this.sorting.emit(event);
    }

    protected onSorted(event: CustomEvent<SortingExpression<T>>): void {
        this.sortingExpressions.set(this.gridRef()?.nativeElement.sortingExpressions ?? []);
        event.stopPropagation();
        this.sorted.emit(event);
    }

    protected onFiltering(event: CustomEvent<FilterExpression<T>>): void {
        event.stopPropagation();
        this.filtering.emit(event);
    }

    protected onFiltered(event: CustomEvent<FilterExpression<T>>): void {
        this.filteringExpressions.set(this.gridRef()?.nativeElement.filterExpressions ?? []);
        event.stopPropagation();
        this.filtered.emit(event);
    }

    //#endregion

}
