import { Directive, Inject } from '@angular/core';
import { ColumnType } from '../common/grid.interface';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { IgxColumnActionsComponent } from './column-actions.component';

@Directive({
    selector: '[igxColumnPinning]',
    standalone: true
})
export class IgxColumnPinningDirective extends IgxColumnActionsBaseDirective {

    constructor(
        @Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent
    ) {
        super();
        columnActions.actionsDirective = this;
    }

    /**
     * @hidden @internal
     */
    public get checkAllLabel(): string {
        return this.columnActions.grid?.resourceStrings.igx_grid_pinning_check_all_label ?? 'Pin All';
    }

    /**
     * @hidden @internal
     */
    public get uncheckAllLabel(): string {
        return this.columnActions.grid?.resourceStrings.igx_grid_pinning_uncheck_all_label ?? 'Unpin All';
    }
    /**
     * @hidden @internal
     */
    public checkAll() {
        this.columnActions.filteredColumns.forEach(c => c.pinned = true);
    }

    /**
     * @hidden @internal
     */
    public uncheckAll() {
        this.columnActions.filteredColumns.forEach(c => c.pinned = false);
    }

    /**
     * @hidden @internal
     */
    public actionEnabledColumnsFilter = (c: ColumnType) => !c.disablePinning && !c.level;

    /**
     * @hidden @internal
     */
    public columnChecked(column: ColumnType): boolean {
        return column.pinned;
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(column: ColumnType) {
        column.pinned = !column.pinned;
    }

    public get allUnchecked() {
        return !this.columnActions.filteredColumns.some(col => !this.columnChecked(col));
    }

    public get allChecked() {
        return !this.columnActions.filteredColumns.some(col => this.columnChecked(col));
    }
}
