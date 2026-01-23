import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, Directive, effect, EmbeddedViewRef, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ColumnConfiguration, ColumnSortConfiguration, IgcCellContext, IgcHeaderContext, Keys } from 'igniteui-grid-lite';

/** Configuration object for grid columns. */
export type IgxColumnConfiguration<T extends object = any> = ColumnConfiguration<T>;

/** Possible data types of a column. */
type ColumnDataType = 'string' | 'number' | 'boolean';

@Component({
    selector: 'igx-grid-lite-column',
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './grid-lite-column.component.html'
})
export class IgxGridLiteColumnComponent<T extends object> {

    //#region Internal state

    private readonly _view = inject(ViewContainerRef);

    /** Reference to the embedded view for the header template and its template function. */
    private headerViewRef?: EmbeddedViewRef<IgxHeaderTemplateContext<T>>;
    protected headerTemplateFunc?: (ctx: IgcHeaderContext<T>) => Node[];

    /** Reference to the embedded view for the cell template and its template function. */
    private cellViewRefs? = new Map<T, EmbeddedViewRef<IgxCellTemplateContext<T>>>();
    protected cellTemplateFunc?: (ctx: IgcCellContext<T>) => Node[];

    //#endregion

    //#region Inputs

    /** The field from the data for this column. */
    public readonly field = input<Keys<T>>();

    /** The data type of the column's values. */
    public readonly dataType = input<ColumnDataType>('string');

    /** The header text of the column. */
    public readonly header = input<string>();

    /** The width of the column. */
    public readonly width = input<string>();

    /** Indicates whether the column is hidden. */
    public readonly hidden = input<boolean>(false);

    /** Indicates whether the column is resizable. */
    public readonly resizable = input<boolean>(false);

    /** Indicates whether the column is sortable. */
    public readonly sortable = input<boolean>(false);

    /** Whether sort operations will be case sensitive. */
    public readonly sortingCaseSensitive = input<boolean>(false);

    /** Sort configuration for the column (e.g., custom comparer). */
    public readonly sortConfiguration = input<ColumnSortConfiguration<T>>();

    /** Indicates whether the column is filterable. */
    public readonly filterable = input<boolean>(false);

    /** Whether filter operations will be case sensitive. */
    public readonly filteringCaseSensitive = input<boolean>(false);

    /** Custom header template for the column. */
    public readonly headerTemplate = input<TemplateRef<IgxHeaderTemplateContext<T>>>();

    /** Custom cell template for the column. */
    public readonly cellTemplate = input<TemplateRef<IgxCellTemplateContext<T>>>();

    //#endregion

    constructor() {
        effect((onCleanup) => {
            const template = this.headerTemplate();
            if (template) {
                this.headerTemplateFunc = (ctx: IgcHeaderContext<T>) => {
                    if (!this.headerViewRef) {
                        const { column, ...rest } = ctx;
                        const angularContext = {
                            ...rest,
                            $implicit: column
                        }
                        this.headerViewRef = this._view.createEmbeddedView(template, angularContext);
                    }
                    return this.headerViewRef.rootNodes;
                };
            }
            onCleanup(() => {
                if (this.headerViewRef) {
                    this.headerViewRef.destroy();
                    this.headerViewRef = undefined;
                }
            })
        });

        effect((onCleanup) => {
            const template = this.cellTemplate();
            if (template) {
                this.cellTemplateFunc = (ctx: IgcCellContext<T>) => {
                    const oldViewRef = this.cellViewRefs.get(ctx.row.data);
                    const { value, ...restContext } = ctx;
                    const angularContext = {
                        ...restContext,
                        $implicit: value,
                    } as IgxCellTemplateContext<T>;
                    if (!oldViewRef) {
                        const newViewRef = this._view.createEmbeddedView(template, angularContext);
                        this.cellViewRefs.set(ctx.row.data, newViewRef);
                        return newViewRef.rootNodes;
                    }
                    oldViewRef.context = angularContext;
                    return oldViewRef.rootNodes;
                };
            }
            onCleanup(() => {
                this.cellViewRefs.forEach((viewRef) => {
                    viewRef.destroy();
                });
                this.cellViewRefs?.clear();
            });
        });
    }
}

/**
 * Context provided to the header template.
 */
export type IgxHeaderTemplateContext<T extends object> = Omit<IgcHeaderContext<T>, 'column'> & {
    /**
     * The current configuration for the column.
     */
    $implicit: IgcHeaderContext<T>['column'];
}

/**
 * Context provided to the header template.
 */
export type IgxCellTemplateContext<T extends object> = Omit<IgcCellContext<T>, 'value'> & {
    /**
     * The value from the data source for this cell.
     */
    $implicit: IgcCellContext<T>['value'];
};



/**
 * Directive providing type information for header template contexts.
 * Use this directive on ng-template elements that render header templates.
 *
 * @example
 * ```html
 * <ng-template igxHeaderTemplate let-column>
 *   <div>{{column.header}}</div>
 * </ng-template>
 * ```
 */
@Directive({ selector: '[igxHeaderTemplate]' })
export class IgxHeaderTemplateDirective<T extends object = any> {

    public static ngTemplateContextGuard<T extends object>(_: IgxHeaderTemplateDirective<T>, ctx: any): ctx is IgxHeaderTemplateContext<T> {
        return true;
    }
}

/**
 * Directive providing type information for cell template contexts.
 * Use this directive on ng-template elements that render cell templates.
 *
 * @example
 * ```html
 * <ng-template igxCellTemplate let-value let-column="column" let-rowIndex="rowIndex" let-data="data">
 *   <div>{{value}}</div>
 * </ng-template>
 * ```
 */
@Directive({ selector: '[igxCellTemplate]' })
export class IgxCellTemplateDirective<T extends object> {

    public static ngTemplateContextGuard<T extends object>(_: IgxCellTemplateDirective<T>, ctx: unknown): ctx is IgxCellTemplateContext<T> {
        return true;
    }
}
