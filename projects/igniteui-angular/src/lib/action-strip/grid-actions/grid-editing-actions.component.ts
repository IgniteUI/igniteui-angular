import { Component, HostBinding } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';
import { showMessage } from '../../core/deprecateDecorators';

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

    private isMessageShown = false;

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
        if (!grid.hasEditableColumns) {
            this.isMessageShown = showMessage(
                'The grid should be editable in order to use IgxGridEditingActionsComponent',
                this.isMessageShown);
                return;
        }
        // be sure row is in view
        if (grid.rowList.filter(r => r === row).length !== 0) {
            grid.crudService.begin(firstEditable);
        }
        this.strip.hide();
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
        this.strip.hide();
    }

    public addRow(event?, action?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        const grid = context.grid;
        grid.addNewRowParent = context.rowData[grid.primaryKey];
        grid.addModeState = true;
           grid.verticalScrollContainer.onDataChanged.subscribe(() => {
            if (!grid.addModeState) {
                return;
            }
            grid.cdr.detectChanges();
            const row = grid.getRowByKey(grid.dataLength - 1);
            const cell = row.cells.find((element, index) => index === 1);
            cell.setEditMode(true);
            cell.activate();
            grid.cdr.detectChanges();
        });
        // grid.shouldAddRow = true;
        // grid.cdr.detectChanges();
        // const data = {...context.rowData};
        // Object.keys(data).forEach(key => data[key] = undefined);
        // data[grid.primaryKey] = grid.dataLength;
        // grid.addRow(data, context.rowData[grid.primaryKey]);
        // grid.cdr.detectChanges();
        // const row = grid.getRowByKey(grid.dataLength - 1);
        // const cell = row.cells.find((element, index) => index === 1);
        // cell.setEditMode(true);
        // cell.activate();

        // grid.shouldAddRow = true;
        // grid.cdr.detectChanges();
        // const row = grid.addRowInstance;
        // const firstCell = row.cells.find((element, index) => index === 1);
        // row.rowData = {...context.rowData };
        // Object.keys(row.rowData).forEach(key => row.rowData[key] = undefined);
        // row.rowData[grid.primaryKey] = grid.dataLength;
        // row.index = grid.dataLength;
        // firstCell.setEditMode(true);
        // firstCell.activate();
        // grid.addChildRowIndex = action === 'insertChild' ? context.index : -1;
        // this.strip.hide();
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
