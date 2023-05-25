import { Directive, Inject } from '@angular/core';
import { ColumnType } from '../common/grid.interface';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { IgxColumnActionsComponent } from './column-actions.component';

@Directive({
    selector: '[igxColumnHiding]',
    standalone: true
})
export class IgxColumnHidingDirective extends IgxColumnActionsBaseDirective {

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
        return this.columnActions.grid?.resourceStrings.igx_grid_hiding_check_all_label ?? 'Show All';
    }

    /**
     * @hidden @internal
     */
    public get uncheckAllLabel(): string {
        return this.columnActions.grid?.resourceStrings.igx_grid_hiding_uncheck_all_label ?? 'Hide All';
    }
    /**
     * @hidden @internal
     */
    public checkAll() {
        this.columnActions.filteredColumns.forEach(c => c.toggleVisibility(false));

    }

    /**
     * @hidden @internal
     */
    public uncheckAll() {
        this.columnActions.filteredColumns.forEach(c => c.toggleVisibility(true));
    }

    /**
     * @hidden @internal
     */
    public actionEnabledColumnsFilter = c => !c.disableHiding;

    /**
     * @hidden @internal
     */
    public columnChecked(column: ColumnType): boolean {
        return !column.hidden;
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(column: ColumnType) {
        column.toggleVisibility();
    }

    public get allChecked() {
        return this.columnActions.filteredColumns.every(col => !this.columnChecked(col));
    }

    public get allUnchecked() {
        return this.columnActions.filteredColumns.every(col => this.columnChecked(col));
    }
}
