import { Component, Input } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';

@Component({
    selector: 'igx-grid-editing-actions',
    templateUrl: 'grid-editing-actions.component.html'
})

export class IgxGridEditingActionsComponent extends IgxGridActionsBaseDirective {
    startEdit() {
        const firstEditable = this.context.cells ?
            this.context.cells.filter(cell => cell.editable)[0] : this.context;
            this.grid.crudService.begin(firstEditable);
        firstEditable.focused = true;
    }

    deleteRow() {
        const row = this.context.row ? this.context.row : this.context;
        this.grid.deleteRow(row.rowID);
    }
}
