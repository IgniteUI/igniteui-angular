import { Component, HostBinding } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';

@Component({
    selector: 'igx-grid-pinning-actions',
    templateUrl: 'grid-pinning-actions.component.html',
    providers: [{ provide: IgxGridActionsBaseDirective, useExisting: IgxGridPinningActionsComponent }]
})

export class IgxGridPinningActionsComponent extends IgxGridActionsBaseDirective {
    /**
     * Host `class.igx-action-strip` binding.
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-action-strip__pining-actions')
    public cssClass = 'igx-action-strip__pining-actions';

    private iconsRendered = false;

    /**
     * Getter to know if the row is pinned
     * @hidden
     * @internal
     */
    get pinned() {
        const context = this.strip.context;
        if (context && !this.iconsRendered) {
            this.renderIcons();
            this.iconsRendered = true;
        }
        return context &&
            (context.pinned || context.row && context.row.pinned);
    }

    /**
     * Pin the row according to the context.
     * @example
     * ```typescript
     * this.gridPinningActions.pin();
     * ```
     */
    public pin(): void {
        const context = this.strip.context;
        const row = context.row ? context.row : context;
        const grid = row.grid;
        grid.pinRow(row.rowID);
    }

    /**
     * Unpin the row according to the context.
     * @example
     * ```typescript
     * this.gridPinningActions.unpin();
     * ```
     */
    public unpin(): void {
        const context = this.strip.context;
        const row = context.row ? context.row : context;
        const grid = row.grid;
        grid.unpinRow(row.rowID);
    }

    private renderIcons() {
        const context = this.strip.context;
        const grid = context.row ? context.row.grid : context.grid;
        if (grid) {
            grid.filteringService.registerSVGIcons();
        }
    }
}
