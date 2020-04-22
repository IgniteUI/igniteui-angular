import {Component, HostBinding} from '@angular/core';
import {IgxGridActionsBaseDirective} from './grid-actions-base.directive';

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
    public startEdit(): void {
        const firstEditable = this.context.cells ?
            this.context.cells.filter(cell => cell.editable)[0] : this.context;
        this.grid.crudService.begin(firstEditable);
        firstEditable.focused = true;
    }

    /**
     * Delete a row according to the context
     * @example
     * ```typescript
     * this.gridEditingActions.deleteRow();
     * ```
     */
    deleteRow() {
        const row = this.context.row ? this.context.row : this.context;
        this.grid.deleteRow(row.rowID);
    }
}
