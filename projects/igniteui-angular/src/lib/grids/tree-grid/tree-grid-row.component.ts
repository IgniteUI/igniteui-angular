import { Component, forwardRef, Input, ViewChildren, QueryList, ViewChild, HostBinding } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxRowComponent } from '../row.component';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridCellComponent } from './tree-cell.component';
import { IgxGridCellComponent } from '../cell.component';
import { IgxTreeGridAPIService } from './tree-grid-api.service';

@Component({
    selector: 'igx-tree-grid-row',
    templateUrl: 'tree-grid-row.component.html',
    providers: [{provide: IgxRowComponent, useExisting: forwardRef(() => IgxTreeGridRowComponent)}]
})
export class IgxTreeGridRowComponent extends IgxRowComponent<IgxTreeGridComponent> {
    private _treeRow: ITreeGridRecord;

    /**
     * The rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    @ViewChildren('treeCell')
    public cells: QueryList<any>;

    /**
     *  The flat data row passed to the tree grid row component.
     *
     * ```typescript
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

    @HostBinding('attr.aria-expanded')
    get expanded(): boolean {
        return this._treeRow.expanded;
    }

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
}
