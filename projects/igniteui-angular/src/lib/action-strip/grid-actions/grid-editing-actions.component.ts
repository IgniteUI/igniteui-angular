import { Component, Input } from '@angular/core';

@Component({
    selector: 'igx-grid-editing-actions',
    templateUrl: 'grid-editing-actions.component.html'
})

export class IgxGridEditingActionsComponent {
    /**
     * An @Input property that set an instance of the grid for which to display the actions.
     * ```html
     *  <igx-grid-pinning-actions [grid]="false"></igx-grid-pinning-actions>
     * ```
     */
    @Input() grid;

    @Input() context;

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
