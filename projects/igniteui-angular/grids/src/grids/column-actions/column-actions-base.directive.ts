import { Directive } from '@angular/core';
import { ColumnType } from '../common/grid.interface';

@Directive()
export abstract class IgxColumnActionsBaseDirective {

    /** @hidden @internal */
    public abstract actionEnabledColumnsFilter: (
        value: ColumnType,
        index: number,
        array: ColumnType[]
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
    public abstract columnChecked(column: ColumnType): boolean;

    /** @hidden @internal */
    public abstract toggleColumn(column: ColumnType): void;

    /** @hidden @internal */
    public abstract uncheckAll(): void;

    /** @hidden @internal */
    public abstract checkAll(): void;

    /** @hidden @internal */
    public abstract get allChecked(): boolean;

    /** @hidden @internal */
    public abstract get allUnchecked(): boolean;
}
