import { Directive } from '@angular/core';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';
import { IgxColumnComponent } from '../public_api';

@Directive({
    selector: '[igxColumnPinning]'
})
export class IgxColumnPinningDirective extends IgxColumnActionsBaseDirective {

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        super();
    }

    public checkAll() {
        this.gridAPI.grid.columns.forEach(c => c.hidden = true);
    }

    public uncheckAll() {
        
    }

    public actionEnabledColumnsFilter = c => c.pinnable;

}