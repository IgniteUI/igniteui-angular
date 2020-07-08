import { Directive } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';

@Directive()
export abstract class IgxColumnActionsBaseDirective {

    public abstract uncheckAll();

    public abstract checkAll();

    public abstract actionEnabledColumnsFilter: (
        value: IgxColumnComponent,
        index: number,
        array: IgxColumnComponent[]
    ) => boolean;
}