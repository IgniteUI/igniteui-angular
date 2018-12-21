import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    forwardRef,
    ElementRef,
    ChangeDetectorRef,
    ViewChildren,
    QueryList
} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowComponent } from '../grid';
import { IgxHierarchicalSelectionAPIService } from './selection';
import { GridBaseAPIService } from '.././api.service';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxHirarchicalGridCellComponent } from './hierarchical-cell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid-row',
    templateUrl: './hierarchical-row.component.html',
    providers: [{ provide: IgxRowComponent, useExisting: forwardRef(() => IgxHierarchicalRowComponent) } ]
})
export class IgxHierarchicalRowComponent extends IgxRowComponent<IgxHierarchicalGridComponent> {

    /**
     * The rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    @ViewChildren(forwardRef(() => IgxHirarchicalGridCellComponent), { read: IgxHirarchicalGridCellComponent })
    public cells: QueryList<IgxHirarchicalGridCellComponent>;
    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

        /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public get expanded() {
        return this.grid.isExpanded(this.rowData);
    }

    public get hasChildren() {
        return  this.grid.childLayoutKeys.length;
    }

    /**
     * Toggles the hierarchical row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        const grid = this.gridAPI.get(this.grid.id);
        const state = this.gridAPI.get(this.grid.id).hierarchicalState;
        if (!this.expanded) {
            state.push({ rowID: this.rowID });
            grid.hierarchicalState = [...state];
        } else {
            grid.hierarchicalState = state.filter(v => {
                return v.rowID !== this.rowID;
            });
        }
    }

    constructor(public gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>,
        private hselection: IgxHierarchicalSelectionAPIService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) {
            super(gridAPI, hselection, element, cdr);
         }
}
