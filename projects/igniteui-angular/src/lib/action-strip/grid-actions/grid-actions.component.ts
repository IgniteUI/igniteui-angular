import { Component, Input, ViewChild } from '@angular/core';
import { IgxDropDownComponent } from '../../drop-down';

@Component({
    selector: 'igx-grid-actions',
    templateUrl: 'grid-actions.component.html'
})

export class IgxGridActionsComponent {
    /**
     * An @Input property that set an instance of the grid for which to display the actions.
     * ```html
     *  <igx-grid-actions [grid]="grid1"></igx-grid-actions>
     * ```
     */
    @Input() grid;

    @Input() context;

    @ViewChild('dropdown', { static: true }) public dropdown: IgxDropDownComponent;

    public items;

    private _unpinnedItems = [
        { field: 'Cell', header: true },
        { field: 'Copy', disableForContext: 'IgxGridRowComponent' },
        { field: 'Paste', disableForContext: 'IgxGridRowComponent' },
        { field: 'Edit', disableForContext: 'IgxGridRowComponent' },
        { field: 'Row', header: true },
        { field: 'Edit' },
        { field: 'Delete' },
        { field: 'Pin' }
    ];

    private _pinnedItems = [
        { field: 'Cell', header: true },
        { field: 'Copy', disableForContext: 'IgxGridRowComponent' },
        { field: 'Paste', disableForContext: 'IgxGridRowComponent' },
        { field: 'Edit', disableForContext: 'IgxGridRowComponent' },
        { field: 'Row', header: true },
        { field: 'Edit' },
        { field: 'Delete' },
        { field: 'Unpin' }
    ];

    private _clipboard;

    public onSelection(event) {
        // TODO if the context is row
        // TODO use values(or indexes), as innerText wont work with translations
        const option = event.newSelection.element.nativeElement.innerText;
        const row = this.context.row ? this.context.row : this.context;
        switch (option) {
            case 'Edit' :
                const firstEditable = this.context.cells ?
                this.context.cells.filter(cell => cell.editable)[0] : this.context;
                this.grid.crudService.begin(firstEditable);
                firstEditable.focused = true;
                this.grid.notifyChanges();
                break;
            case 'Delete' :
                this.grid.deleteRow(row.rowID);
                break;
            case 'Pin' :
                this.grid.pinRow(row.rowID);
                break;
            case 'Unpin' :
                this.grid.unpinRow(row.rowID);
                break;
            case 'Copy' :
                this._clipboard = this.context.value;
                break;
            case 'Paste' :
                if (this._clipboard) {
                    this.context.value = this._clipboard;
                    this.grid.reflow();
                }
                break;
            }
    }

    onOpen () {
        this.items = this.context.pinned ?
            this._pinnedItems : this._unpinnedItems;

        this.items = this.items.map(item => {
            item['disabled'] = this.context.constructor.name === item.disableForContext;
            return item;
        });
    }

}
