import { booleanAttribute, ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, input, model, OnInit } from '@angular/core';
import { DataPipelineConfiguration, FilterExpression, GridLiteSortingOptions, IgcGridLite, Keys, NavigateToOptions, SortingExpression } from 'igniteui-grid-lite';
import { IgxGridLiteColumnConfiguration } from './grid-lite-column.component';

export type IgxGridLiteSortingOptions = GridLiteSortingOptions;
export type IgxGridLiteDataPipelineConfiguration<T extends object = any> = DataPipelineConfiguration<T>;
export type IgxGridLiteSortingExpression<T extends object = any> = SortingExpression<T>;
export type IgxGridLiteFilteringExpression<T extends object = any> = FilterExpression<T>;
export type IgxGridLiteNavigateToOptions<T extends object = any> = NavigateToOptions<T>;

/**
 * The fields a sort or filter expression can carry. Both shapes go through the same comparison,
 * which only has to answer whether the grid already represents a bound expression.
 */
interface ExpressionFields {
    key?: unknown;
    direction?: unknown;
    condition?: unknown;
    searchTerm?: unknown;
    criteria?: unknown;
    caseSensitive?: unknown;
    comparer?: unknown;
}

/** A condition is either the name the caller wrote or the operand the grid resolved it to. */
function conditionName(condition: unknown): unknown {
    return typeof condition === 'string' ? condition : (condition as { name?: string })?.name;
}

/**
 * Whether the grid already represents `incoming`.
 *
 * The comparison is deliberately asymmetric. `caseSensitive` and `comparer` are documented as
 * resolved from the column configuration when the caller omits them, `criteria` defaults to
 * `'and'`, and a `condition` is resolved from its name into an operand object, so a field the
 * caller left out cannot disagree with whatever the grid derived for it.
 */
function matchesExpression(incoming: ExpressionFields, current: ExpressionFields): boolean {
    if (incoming.key !== current.key) return false;
    if (incoming.direction !== current.direction) return false;
    if (conditionName(incoming.condition) !== conditionName(current.condition)) return false;
    if (incoming.searchTerm !== current.searchTerm) return false;
    if (incoming.criteria !== undefined && incoming.criteria !== current.criteria) return false;
    if (incoming.caseSensitive !== undefined && incoming.caseSensitive !== current.caseSensitive) return false;
    if (incoming.comparer !== undefined && incoming.comparer !== current.comparer) return false;
    return true;
}

/**
 * Whether the grid state in `current` already satisfies the bound `incoming` expressions.
 *
 * The grid hands back fresh copies of its expressions on every read, so the comparison has to be
 * by value. It cannot be a structural deep equality check, which reports a difference for every
 * field the grid resolved on the caller's behalf. `current` is `undefined` until the element
 * upgrades, and a binding can make `incoming` nullish, so both default to an empty list.
 */
function matchesExpressions(
    incoming: readonly ExpressionFields[] = [],
    current: readonly ExpressionFields[] = []
): boolean {
    return incoming.length === current.length
        && incoming.every((expression, index) => matchesExpression(expression, current[index]));
}


class IgxGridLite<T extends object = any> extends IgcGridLite<T> {
    public static override get tagName() {
        return 'igx-grid-lite' as any;
    }
    public static override register(): void {
        // still call super for child components:
        super.register();

        if (!customElements.get(IgxGridLite.tagName)) {
            customElements.define(IgxGridLite.tagName, IgxGridLite);
        }
    }
}

/**
 * The Grid Lite is a web component for displaying data in a tabular format quick and easy.
 *
 * Out of the box it provides row virtualization, sort and filter operations (client and server side),
 * the ability to template cells and headers and column hiding.
 *
 * @fires sorting - Emitted when sorting is initiated through the UI.
 * @fires sorted - Emitted when a sort operation initiated through the UI has completed.
 * @fires filtering - Emitted when filtering is initiated through the UI.
 * @fires filtered - Emitted when a filter operation initiated through the UI has completed.
 *
 * @developerPreview 21.1.0
 */
@Component({
    selector: 'igx-grid-lite',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    host: {
        '[data]': "data()",
        '[autoGenerate]': "autoGenerate()",
        '[sortingOptions]': "sortingOptions()",
        '[dataPipelineConfiguration]': "dataPipelineConfiguration()",
        '(sorted)': "onSorted($any($event))",
        '(filtered)': "onFiltered($any($event))",
        'adopt-root-styles': '',
    },
    template: `<ng-content></ng-content>`
})

export class IgxGridLiteComponent<T extends object = any> implements OnInit {

    //#region Internal state

    private readonly gridRef = inject(ElementRef) as ElementRef<IgxGridLite<T>>;

    //#endregion

    //#region Inputs

    /** The data source for the grid. */
    public readonly data = input<T[]>([]);

    /**
     * Whether the grid will try to "resolve" its column configuration based on the passed
     * data source.
     *
     * @remarks
     * This property is ignored if any existing column configuration already exists in the grid.
     */
    public readonly autoGenerate = input(false, { transform: booleanAttribute });

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

    //#region Getters / Setters

    /**
     * Get the column configuration of the grid.
     */
    public get columns(): IgxGridLiteColumnConfiguration<T>[] {
        return this.gridRef.nativeElement.columns ?? [];
    }

    /**
     * Returns the collection of rendered row elements in the grid.
     *
     * @remarks
     * Since the grid has virtualization, this property returns only the currently rendered
     * chunk of elements in the DOM.
     */
    public get rows(): IgcGridLite<T>['rows'] {
        return this.gridRef.nativeElement.rows ?? [];
    }

    /**
     * Returns the state of the data source after sort/filter operations
     * have been applied.
     */
    public get dataView(): ReadonlyArray<T> {
        return this.gridRef.nativeElement.dataView ?? [];
    }

    //#endregion

    constructor() {
        // D.P. Temporary guarded assign instead of binding to prevent WC issue with setter logic re-doing sort/filter
        effect(() => {
            const grid = this.gridRef.nativeElement
            if (!grid) return;
            const newValue = this.filteringExpressions();
            if (!matchesExpressions(newValue, grid.filterExpressions)) {
                grid.clearFilter();
                grid.filterExpressions = newValue ?? [];
            }
        });
        effect(() => {
            const grid = this.gridRef.nativeElement
            if (!grid) return;
            const newValue = this.sortingExpressions();
            if (!matchesExpressions(newValue, grid.sortingExpressions)) {
                grid.clearSort();
                grid.sortingExpressions = newValue ?? [];
            }
        });
    }

    /**
     * @hidden @internal
     */
    public ngOnInit(): void {
        IgxGridLite.register();
    }

    //#region Public API

    /**
     * Performs a filter operation in the grid based on the passed expression(s).
     */
    public filter(config: IgxGridLiteFilteringExpression | IgxGridLiteFilteringExpression[]): void {
        this.gridRef.nativeElement.filter(config as unknown as FilterExpression<T> | FilterExpression<T>[]);
    }

    /**
     * Performs a sort operation in the grid based on the passed expression(s).
     */
    public sort(expressions: IgxGridLiteSortingExpression<T> | IgxGridLiteSortingExpression<T>[]) {
        this.gridRef.nativeElement.sort(expressions);
    }

    /**
     * Resets the current sort state of the control.
     */
    public clearSort(key?: Keys<T>): void {
        this.gridRef.nativeElement.clearSort(key);
    }

    /**
     * Resets the current filter state of the control.
     */
    public clearFilter(key?: Keys<T>): void {
        this.gridRef.nativeElement.clearFilter(key);
    }

    /**
     * Navigates to a position in the grid based on provided row index and column field.
     * @param row The row index to navigate to
     * @param options The column field to navigate to and whether to activate the cell
     * @returns A promise that resolves when navigation completes.
     */
    public navigateTo(row: number, options?: IgxGridLiteNavigateToOptions<T>): Promise<void>;
    /**
     * Navigates to a position in the grid based on provided row index and column field.
     * @param row The row index to navigate to
     * @param column The column field to navigate to, if any
     * @param activate Optionally also activate the navigated cell
     * @deprecated Use `navigateTo(row, options)` instead.
     */
    public navigateTo(row: number, column?: Keys<T>, activate?: boolean): Promise<void>;
    public async navigateTo(row: number, columnOrOptions?: Keys<T> | IgxGridLiteNavigateToOptions<T>, activate?: boolean): Promise<void> {
        await this.gridRef.nativeElement.navigateTo(row, columnOrOptions as Keys<T>, activate);
    }

    /**
     * Returns a {@link IgxGridLiteColumnConfiguration} for a given column.
     */
    public getColumn(id: Keys<T> | number): IgxGridLiteColumnConfiguration<T> | undefined {
        return this.gridRef.nativeElement.getColumn(id);
    }

    //#endregion

    //#region Event handlers

    protected onSorted(_event: CustomEvent<SortingExpression<T>>): void {
        this.sortingExpressions.set(this.gridRef.nativeElement.sortingExpressions ?? []);
    }

    protected onFiltered(_event: CustomEvent<FilterExpression<T>>): void {
        this.filteringExpressions.set(this.gridRef.nativeElement.filterExpressions ?? []);
    }

    //#endregion

}

declare global {
  interface HTMLElementTagNameMap {
    [IgxGridLite.tagName]: IgxGridLite;
  }

    interface HTMLElementEventMap {
        'sorting': CustomEvent<IgxGridLiteSortingExpression<any>>;
        'sorted': CustomEvent<IgxGridLiteSortingExpression<any>>;
        'filtering': CustomEvent<IgxGridLiteFilteringExpression<any>>;
        'filtered': CustomEvent<IgxGridLiteFilteringExpression<any>>;
    }
}

// see https://github.com/ng-packagr/ng-packagr/issues/3233
export {};
