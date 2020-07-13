import { Directive } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';

@Directive()
export class IgxColumnActionsBaseDirective {

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
    public columnChecked(column: IgxColumnComponent): boolean { return false; }

    /**
     * @hidden @internal
     */
    public checkColumn(column: IgxColumnComponent) { }

    /**
     * @hidden @internal
     */
    public uncheckAll() { }

    /**
     * @hidden @internal
     */
    public checkAll() { }
}
