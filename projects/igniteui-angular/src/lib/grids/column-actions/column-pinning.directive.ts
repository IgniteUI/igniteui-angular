import { Directive, Inject } from '@angular/core';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';
import { IgxColumnComponent } from '../public_api';
import { IgxColumnActionsComponent } from './column-actions.component';

@Directive({
    selector: '[igxColumnPinning]'
})
export class IgxColumnPinningDirective extends IgxColumnActionsBaseDirective {

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
    public checkAllLabel = this.gridAPI.grid ? this.gridAPI.grid.resourceStrings.igx_grid_pinning_check_all_label : 'Pin All';

    /**
     * @hidden @internal
     */
    public uncheckAllLabel = this.gridAPI.grid ? this.gridAPI.grid.resourceStrings.igx_grid_pinning_uncheck_all_label : 'Unpin All';

    /**
     * @hidden @internal
     */
    public trackByFunction = (index: number, item: IgxColumnComponent) => item.pinned;

    /**
     * @hidden @internal
     */
    public checkAll() {
        this.gridAPI.grid.columns.forEach(c => c.pinned = true);
    }

    /**
     * @hidden @internal
     */
    public uncheckAll() {
        this.gridAPI.grid.columns.forEach(c => c.pinned = false);
    }

    /**
     * @hidden @internal
     */
    public actionEnabledColumnsFilter = c => !c.disablePinning;

    /**
     * @hidden @internal
     */
    public columnChecked(column: IgxColumnComponent): boolean {
        return column.pinned;
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(column: IgxColumnComponent) {
        column.pinned = !column.pinned;
    }
}
