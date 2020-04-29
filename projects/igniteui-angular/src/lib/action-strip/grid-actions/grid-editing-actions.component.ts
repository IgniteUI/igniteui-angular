import { Component, HostBinding } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';

@Component({
    selector: 'igx-grid-editing-actions',
    templateUrl: 'grid-editing-actions.component.html',
    providers: [{ provide: IgxGridActionsBaseDirective, useExisting: IgxGridEditingActionsComponent }]
})

export class IgxGridEditingActionsComponent extends IgxGridActionsBaseDirective {
    /**
     * Host `class.igx-action-strip` binding.
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-action-strip__editing-actions')
    public cssClass = 'igx-action-strip__editing-actions';

    /**
     * Enter row or cell edit mode depending the grid rowEditable option
     * @example
     * ```typescript
     * this.gridEditingActions.startEdit();
     * ```
     */
    public startEdit(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const row = this.strip.context;
        const firstEditable = row.cells.filter(cell => cell.editable)[0];
        const grid = row.grid;
        // be sure row is in view
        if (grid.rowList.filter(r => r === row).length !== 0) {
            grid.crudService.begin(firstEditable);
        }
    }

    /**
     * Delete a row according to the context
     * @example
     * ```typescript
     * this.gridEditingActions.deleteRow();
     * ```
     */
    public deleteRow(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        const grid = context.grid;
        grid.deleteRow(context.rowID);
    }

    /**
     * Getter if the row is disabled
     * @hidden
     * @internal
     */
    get disabled(): boolean {
        if (!this.isRow(this.strip.context)) {
            return;
        }
        return this.strip.context.disabled;
    }
}
