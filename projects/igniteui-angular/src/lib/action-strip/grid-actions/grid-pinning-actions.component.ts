import {AfterViewInit, Component, HostBinding} from '@angular/core';
import {IgxGridActionsBaseDirective} from './grid-actions-base.directive';

@Component({
    selector: 'igx-grid-pinning-actions',
    templateUrl: 'grid-pinning-actions.component.html',
    providers: [{ provide: IgxGridActionsBaseDirective, useExisting: IgxGridPinningActionsComponent }]
})

export class IgxGridPinningActionsComponent extends IgxGridActionsBaseDirective implements AfterViewInit {
    /**
     * Host `class.igx-action-strip` binding.
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-action-strip__pining-actions')
    public cssClass = 'igx-action-strip__pining-actions';

    /**
     * Getter to know if the row is pinned
     * @hidden
     * @internal
     */
    get pinned() {
        return this.context &&
            (this.context.pinned || this.context.row && this.context.row.pinned);
    }

    /**
     * Pin the row according to the context.
     * @example
     * ```typescript
     * this.gridPinningActions.pin();
     * ```
     */
    public pin(): void {
        const row = this.context.row ? this.context.row : this.context;
        this.grid.pinRow(row.rowID);
    }

    /**
     * Unpin the row according to the context.
     * @example
     * ```typescript
     * this.gridPinningActions.unpin();
     * ```
     */
    public unpin(): void {
        const row = this.context.row ? this.context.row : this.context;
        this.grid.unpinRow(row.rowID);
    }

    ngAfterViewInit() {
        if (this.grid) {
            this.grid.filteringService.registerSVGIcons();
        }
    }
}
