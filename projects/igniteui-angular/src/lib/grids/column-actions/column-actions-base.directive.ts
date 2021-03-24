import { Directive } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';

@Directive()
export abstract class IgxColumnActionsBaseDirective {

    /** @hidden @internal */
    public actionEnabledColumnsFilter: (
        value: IgxColumnComponent,
        index: number,
        array: IgxColumnComponent[]
    ) => boolean;

    /**
     * @hidden @internal
     */
    public abstract get checkAllLabel(): string;

    /**
     * @hidden @internal
     */
    public abstract get uncheckAllLabel(): string;

    /** @hidden @internal */
    public abstract columnChecked(column: IgxColumnComponent): boolean;

    /** @hidden @internal */
    public abstract toggleColumn(column: IgxColumnComponent): void;

    /** @hidden @internal */
    public abstract uncheckAll(): void;

    /** @hidden @internal */
    public abstract checkAll(): void;

    /** @hidden @internal */
    public abstract get allChecked(): boolean;

    /** @hidden @internal */
    public abstract get allUnchecked(): boolean;
}
