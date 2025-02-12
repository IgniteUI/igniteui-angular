import { Component, HostBinding, Input, booleanAttribute } from '@angular/core';
import { IgxGridActionsBaseDirective } from './grid-actions-base.directive';
import { showMessage } from '../../core/utils';
import { addRow, addChild } from '@igniteui/material-icons-extended';
import { IgxGridActionButtonComponent } from './grid-action-button.component';
import { NgIf } from '@angular/common';


/* blazorElement */
/* wcElementTag: igc-grid-editing-actions */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/**
 * Grid Editing Actions for the Action Strip
 *
 * @igxParent IgxActionStripComponent
 */
@Component({
    selector: 'igx-grid-editing-actions',
    templateUrl: 'grid-editing-actions.component.html',
    providers: [{ provide: IgxGridActionsBaseDirective, useExisting: IgxGridEditingActionsComponent }],
    imports: [NgIf, IgxGridActionButtonComponent]
})

export class IgxGridEditingActionsComponent extends IgxGridActionsBaseDirective {

    /**
     * Host `class.igx-action-strip` binding.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-action-strip__editing-actions')
    public cssClass = 'igx-action-strip__editing-actions';

    /**
     * An input to enable/disable action strip row adding button
     */
    @Input({ transform: booleanAttribute })
    public set addRow(value: boolean) {
        this._addRow = value;
    }
    public get addRow(): boolean {
        if (!this.iconsRendered) {
            this.registerIcons();
            this.iconsRendered = true;
        }
        return this._addRow;
    }

    /**
     * An input to enable/disable action strip row editing button
     */
    @Input({ transform: booleanAttribute })
    public editRow = true;

    /**
    * An input to enable/disable action strip row deleting button
    */
    @Input({ transform: booleanAttribute })
    public deleteRow = true;

    /**
     * Getter if the row is disabled
     *
     * @hidden
     * @internal
     */
    public get disabled(): boolean {
        if (!this.isRow(this.strip.context)) {
            return;
        }
        return this.strip.context.disabled;
    }

    /**
     * Getter if the row is root.
     *
     * @hidden
     * @internal
     */
    public get isRootRow(): boolean {
        if (!this.isRow(this.strip.context)) {
            return false;
        }
        return this.strip.context.isRoot;
    }

    public get hasChildren(): boolean {
        if (!this.isRow(this.strip.context)) {
            return false;
        }
        return this.strip.context.hasChildren;
    }

    /**
     * An input to enable/disable action strip child row adding button
     */
    @Input({ transform: booleanAttribute })
    public addChild = false;

    private isMessageShown = false;
    private _addRow = false;
    private iconsRendered = false;

    /**
     * Enter row or cell edit mode depending the grid rowEditable option
     *
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
            grid.gridAPI.crudService.enterEditMode(firstEditable, event);
            if (!grid.gridAPI.crudService.nonEditable) {
                firstEditable.activate(event);
            }
        }
        this.strip.hide();
    }

    /** @hidden @internal **/
    public deleteRowHandler(event?): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        const grid = context.grid;
        grid.deleteRow(context.key);

        this.strip.hide();
    }

    /** @hidden @internal **/
    public addRowHandler(event?, asChild?: boolean): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isRow(this.strip.context)) {
            return;
        }
        const context = this.strip.context;
        const grid = context.grid;
        if (!grid.rowEditable) {
            console.warn('The grid must use row edit mode to perform row adding! Please set rowEditable to true.');
            return;
        }
        grid.gridAPI.crudService.enterAddRowMode(context, asChild, event);
        this.strip.hide();
    }

    /**
     * @hidden
     * @internal
     */
    private registerIcons() {
        this.iconService.addSvgIconFromText(addRow.name, addRow.value, 'imx-icons', true,);
        this.iconService.addSvgIconFromText(addChild.name, addChild.value, 'imx-icons', true);
    }
}
