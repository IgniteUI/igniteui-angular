import { Component, HostBinding } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';
import { pinLeft, unpinLeft, jumpDown, jumpUp } from '@igniteui/material-icons-extended';
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
    get pinned(): boolean {
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        if (context && !this.iconsRendered) {
            this.registerSVGIcons();
            this.iconsRendered = true;
        }
        return context && context.pinned;
    }

    /**
     * Getter to know if the row is in pinned and ghost
     * @hidden
     * @internal
     */
    get inPinnedArea(): boolean {
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        return this.pinned && !context.disabled;
    }

    /**
     * Getter to know if the row pinning is set to top or bottom
     * @hidden
     * @internal
     */
    get pinnedTop(): boolean {
        if (!this.isRow(this.strip.context)) {
            return;
        }
        return this.strip.context.grid.isRowPinningToTop;
    }

    /**
     * Pin the row according to the context.
     * @example
     * ```typescript
     * this.gridPinningActions.pin();
     * ```
     */
    public pin(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const row = this.strip.context;
        const grid = row.grid;
        grid.pinRow(row.rowID);
        this.strip.hide();
    }

    /**
     * Unpin the row according to the context.
     * @example
     * ```typescript
     * this.gridPinningActions.unpin();
     * ```
     */
    public unpin(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const row = this.strip.context;
        const grid = row.grid;
        grid.unpinRow(row.rowID);
        this.strip.hide();
    }

    public scrollToRow(event) {
        if (event) {
            event.stopPropagation();
        }
        const context = this.strip.context;
        const grid = context.grid;
        grid.scrollTo(context.rowData, 0);
        this.strip.hide();
    }

    private registerSVGIcons(): void {
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        const grid = context.grid;
        if (grid) {
            this.iconService.addSvgIconFromText(pinLeft.name, pinLeft.value, 'imx-icons');
            this.iconService.addSvgIconFromText(unpinLeft.name, unpinLeft.value, 'imx-icons');
            this.iconService.addSvgIconFromText(jumpDown.name, jumpDown.value, 'imx-icons');
            this.iconService.addSvgIconFromText(jumpUp.name, jumpDown.value, 'imx-icons');
        }
    }
}
