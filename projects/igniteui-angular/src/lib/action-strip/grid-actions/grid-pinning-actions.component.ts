import { Component, Input } from '@angular/core';

@Component({
    selector: 'igx-grid-pinning-actions',
    templateUrl: 'grid-pinning-actions.component.html'
})

export class IgxGridPinningActionsComponent {
    /**
     * An @Input property that set an instance of the grid for which to display the actions.
     * ```html
     *  <igx-grid-pinning-actions [grid]="false"></igx-grid-pinning-actions>
     * ```
     */
    @Input() grid;

    @Input() context;

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
}
