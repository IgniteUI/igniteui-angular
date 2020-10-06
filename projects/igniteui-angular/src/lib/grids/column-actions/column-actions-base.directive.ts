import { Directive } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';

@Directive()
export abstract class IgxColumnActionsBaseDirective {

    /**
     * @hidden @internal
     */
    public actionEnabledColumnsFilter: (
        value: IgxColumnComponent,
        index: number,
        array: IgxColumnComponent[]
    ) => boolean;

    /**
     * @hidden @internal
     */
    public checkAllLabel: string;

    /**
     * @hidden @internal
     */
    public uncheckAllLabel: string;

    /**
     * @hidden @internal
     */
    public trackChanges: Function;

    /**
     * @hidden @internal
     */
    public abstract columnChecked(column: IgxColumnComponent): boolean;

    /**
     * @hidden @internal
     */
    public abstract toggleColumn(column: IgxColumnComponent);

    /**
     * @hidden @internal
     */
    public abstract uncheckAll();

    /**
     * @hidden @internal
     */
    public abstract checkAll();
}
