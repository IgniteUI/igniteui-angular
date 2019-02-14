import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    forwardRef,
    ElementRef,
    ChangeDetectorRef,
    ViewChildren,
    QueryList,
    ViewChild
} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowComponent } from '../grid';
import { IgxHierarchicalSelectionAPIService } from './selection';
import { GridBaseAPIService } from '.././api.service';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';
import { IgxGridCRUDService, IgxGridSelectionService } from '../../core/grid-selection';

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
    @ViewChildren(forwardRef(() => IgxHierarchicalGridCellComponent), { read: IgxHierarchicalGridCellComponent })
    public cells: QueryList<IgxHierarchicalGridCellComponent>;

    @ViewChild('expander', { read: ElementRef })
    public expander: ElementRef;

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
    @HostBinding('class.igx-grid__tr--expanded')
    public get expanded() {
        return this.grid.isExpanded(this.rowData);
    }

    public get hasChildren() {
        return  !!this.grid.childLayoutKeys.length;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-grid__tr--highlighted')
    public get highlighted() {
        return this.grid && this.grid.highlightedRowID === this.rowID;
    }

    /**
     * Toggles the hierarchical row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        const grid = this.gridAPI.grid;
        const state = this.gridAPI.grid.hierarchicalState;
        if (!this.expanded) {
            state.push({ rowID: this.rowID });
            grid.hierarchicalState = [...state];
        } else {
            grid.hierarchicalState = state.filter(v => {
                return v.rowID !== this.rowID;
            });
        }
        grid.cdr.detectChanges();
        requestAnimationFrame(() => {
            grid.reflow();
        });
    }

    constructor(public gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>,
        public crudService: IgxGridCRUDService,
        public selectionService: IgxGridSelectionService,
        private hselection: IgxHierarchicalSelectionAPIService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) {
            super(gridAPI, crudService, selectionService, hselection, element, cdr);
        }
}
