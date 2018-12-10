import { Component, forwardRef, Input, ViewChildren, QueryList, HostBinding, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxRowComponent } from '../row.component';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { State, TransactionType } from '../../services';
import { GridBaseAPIService } from '../api.service';
import { IgxSelectionAPIService } from '../../core/selection';

@Component({
    selector: 'igx-tree-grid-row',
    templateUrl: 'tree-grid-row.component.html',
    providers: [{ provide: IgxRowComponent, useExisting: forwardRef(() => IgxTreeGridRowComponent) }]
})
export class IgxTreeGridRowComponent extends IgxRowComponent<IgxTreeGridComponent> {
    constructor(
        public gridAPI: GridBaseAPIService<IgxTreeGridComponent>,
        selection: IgxSelectionAPIService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) {
            // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(gridAPI, selection, element, cdr);
    }
    private _treeRow: ITreeGridRecord;

    /**
     * The rendered cells in the row component.
     *
     * ```typescript
     * const row = this.grid.getRowByKey(1);
     * const cells = row.cells;
     * ```
     */
    @ViewChildren('treeCell')
    public cells: QueryList<any>;

    /**
     * The `ITreeGridRecord` passed to the row component.
     *
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * const treeRow = row.treeRow;
     * ```
     */
    @Input()
    public get treeRow(): ITreeGridRecord {
        return this._treeRow;
    }
    public set treeRow(value: ITreeGridRecord) {
        if (this._treeRow !== value) {
            this._treeRow = value;
            this.rowData = this._treeRow.data;
        }
    }

    /**
     * Returns a value indicating whether the row component is expanded.
     *
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * const expanded = row.expanded;
     * ```
     */
    @HostBinding('attr.aria-expanded')
    get expanded(): boolean {
        return this._treeRow.expanded;
    }

    /**
     * Sets a value indicating whether the row component is expanded.
     *
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * row.expanded = true;
     * ```
     */
    set expanded(value: boolean) {
        (this.gridAPI as IgxTreeGridAPIService).trigger_row_expansion_toggle(this.gridID, this._treeRow, value);
    }

    /**
     * @hidden
     */
    protected resolveClasses(): string {
        const classes = super.resolveClasses();
        const filteredClass = this.treeRow.isFilteredOutParent ? 'igx-grid__tr--filtered' : '';
        return `${classes} ${filteredClass}`;
    }

    /** @hidden */
    public get deleted(): boolean {
        return this.hasDeletedParent() || super.isRowDeleted();
    }

    /**
     * Checks if any of its parent rows are in deleted state
     * @returns whether any of its parent rows are in deleted state
     */
    private hasDeletedParent(): boolean {
        if ((this.grid.cascadeOnDelete && this.grid.foreignKey) || this.grid.childDataKey) {
            let node = this.grid.records.get(this.rowID);
            while (node) {
                const state: State = this.grid.transactions.getState(node.rowID);
                if (state && state.type === TransactionType.DELETE) {
                    return true;
                }
                node = node.parent;
            }
        }
        return false;
    }
}
