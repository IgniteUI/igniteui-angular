import { Component, Input, ViewChild } from '@angular/core';
import { IgxDropDownComponent } from '../../drop-down';

@Component({
    selector: 'igx-grid-actions',
    templateUrl: 'grid-actions.component.html'
})

export class IgxGridActionsComponent {
    /**
     * An @Input property that set the visibility of the Action Strip.
     * Could be used to set if the Action Strip will be visible initially.
     * ```html
     *  <igx-action-strip [hidden]="false">
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

    public onSelection(event) {
        // TODO if the context is row
        // TODO use values(or indexes), as innerText wont work with translations
        const option = event.newSelection.element.nativeElement.innerText;
        switch (option) {
            case 'Edit' :
                const firstEditable = this.context.cells.filter(cell => cell.editable)[0];
                this.grid.crudService.begin(firstEditable);
                firstEditable.focused = true;
                this.grid.notifyChanges();
                break;
            case 'Delete' :
                this.grid.deleteRow(this.context.rowID);
                break;
            case 'Pin':
                this.grid.pinRow(this.context.rowID);
                break;
            case 'Unpin':
                this.grid.unpinRow(this.context.rowID);
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
