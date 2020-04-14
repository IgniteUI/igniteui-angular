import { Component, Input, AfterViewInit } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';

@Component({
    selector: 'igx-grid-pinning-actions',
    templateUrl: 'grid-pinning-actions.component.html'
})

export class IgxGridPinningActionsComponent extends IgxGridActionsBaseDirective implements AfterViewInit {
    get pinned() {
        return this.context &&
            (this.context.pinned || this.context.row && this.context.row.pinned);
    }

    pin() {
        const row = this.context.row ? this.context.row : this.context;
        this.grid.pinRow(row.rowID);
    }

    unpin() {
        const row = this.context.row ? this.context.row : this.context;
        this.grid.unpinRow(row.rowID);
    }

    ngAfterViewInit() {
        if (this.grid) {
            this.grid.filteringService.registerSVGIcons();
        }
    }
}
