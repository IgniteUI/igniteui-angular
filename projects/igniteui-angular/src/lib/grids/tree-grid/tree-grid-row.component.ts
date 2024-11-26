import { Component, forwardRef, Input, ViewChildren, QueryList, HostBinding, DoCheck, ChangeDetectionStrategy } from '@angular/core';
import { IgxRowDirective } from '../row.directive';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxGridNotGroupedPipe, IgxGridCellStylesPipe, IgxGridCellStyleClassesPipe, IgxGridDataMapperPipe, IgxGridTransactionStatePipe } from '../common/pipes';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxTreeGridCellComponent } from './tree-cell.component';
import { IgxGridCellComponent } from '../cell.component';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxRowDragDirective } from '../row-drag.directive';
import { NgTemplateOutlet, NgIf, NgClass, NgStyle, NgFor } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-row',
    templateUrl: 'tree-grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxTreeGridRowComponent) }],
    imports: [NgTemplateOutlet, NgIf, IgxRowDragDirective, IgxGridForOfDirective, IgxGridCellComponent, NgClass, NgStyle, IgxTreeGridCellComponent, IgxCheckboxComponent, NgFor, IgxGridNotGroupedPipe, IgxGridCellStylesPipe, IgxGridCellStyleClassesPipe, IgxGridDataMapperPipe, IgxGridTransactionStatePipe]
})
export class IgxTreeGridRowComponent extends IgxRowDirective implements DoCheck {
    @ViewChildren('treeCell')
    protected override _cells: QueryList<any>;

    /**
     * @hidden
     */
    public isLoading: boolean;

    private _treeRow: ITreeGridRecord;

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
            this.data = this._treeRow.data;
        }
    }

    /**
     * Sets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    public override set pinned(value: boolean) {
        if (value) {
            this.grid.pinRow(this.key);
        } else {
            this.grid.unpinRow(this.key);
        }
    }

    /**
     * Gets whether the row is pinned.
     * ```typescript
     * let isPinned = row.pinned;
     * ```
     */
    public override get pinned() {
        return this.grid.isRecordPinned(this._treeRow);
    }

    /**
     * @hidden
     */
    public override get isRoot(): boolean {
        let treeRec = this.treeRow;
        const isPinnedArea = this.pinned && !this.disabled;
        if (isPinnedArea) {
            treeRec = this.grid.unpinnedRecords.find(x => x.data === this.data);
        }
        return treeRec?.level === 0;
    }

    /**
     * @hidden
     */
    public override get hasChildren(): boolean {
        return true;
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
    public override get expanded(): boolean {
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
    public override set expanded(value: boolean) {
        this.grid.gridAPI.set_row_expansion_state(this._treeRow.key, value);
    }

    /**
     * @hidden
     * @internal
     */
    public override get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * @hidden
     */
    public get showIndicator() {
        return this.grid.loadChildrenOnDemand ?
            this.grid.expansionStates.has(this.key) ?
                this.treeRow.children && this.treeRow.children.length :
                this.grid.hasChildrenKey ?
                    this.data[this.grid.hasChildrenKey] :
                    true :
            this.treeRow.children && this.treeRow.children.length;
    }

    /**
     * @hidden
     */
    public get indeterminate(): boolean {
        return this.selectionService.isRowInIndeterminateState(this.key);
    }

    /**
     * @hidden
     */
    public override ngDoCheck() {
        this.isLoading = this.grid.loadChildrenOnDemand ? this.grid.loadingRows.has(this.key) : false;
        super.ngDoCheck();
    }

    /**
     * Spawns the add child row UI for the specific row.
     *
     * @example
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * row.beginAddChild();
     * ```
     * @param rowID
     */
    public beginAddChild() {
        this.grid.crudService.enterAddRowMode(this, true);
    }
}
