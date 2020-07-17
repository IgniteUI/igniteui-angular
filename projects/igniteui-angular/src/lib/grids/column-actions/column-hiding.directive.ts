import { Directive, Inject } from '@angular/core';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';
import { IgxColumnComponent } from '../public_api';
import { IgxColumnActionsComponent } from './column-actions.component';

@Directive({
    selector: '[igxColumnHiding]'
})
export class IgxColumnHidingDirective extends IgxColumnActionsBaseDirective {

    constructor(
        public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        @Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent
    ) {
        super();
        columnActions.actionsDirective = this;
    }

    /**
     * @hidden @internal
     */
    public checkAllLabel = this.gridAPI.grid ? this.gridAPI.grid.resourceStrings.igx_grid_hiding_check_all_label : 'Hide All';

    /**
     * @hidden @internal
     */
    public uncheckAllLabel = this.gridAPI.grid ? this.gridAPI.grid.resourceStrings.igx_grid_hiding_uncheck_all_label : 'Show All';

    /**
     * @hidden @internal
     */
    public trackByFunction = (index: number, item: IgxColumnComponent) => item.hidden;

    /**
     * @hidden @internal
     */
    public checkAll() {
        this.gridAPI.grid.columns.forEach(c => c.hidden = true);
    }

    /**
     * @hidden @internal
     */
    public uncheckAll() {
        this.gridAPI.grid.columns.forEach(c => c.hidden = false);
    }

    /**
     * @hidden @internal
     */
    public actionEnabledColumnsFilter = c => !c.disableHiding;

    /**
     * @hidden @internal
     */
    public columnChecked(column: IgxColumnComponent): boolean {
        return column.hidden;
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(column: IgxColumnComponent) {
        column.hidden = !column.hidden;
        this.gridAPI.grid.markForCheck();
    }
}
