import { IgxGridCellComponent } from '../cell.component';
import { GridBaseAPIService } from '../api.service';
import { ChangeDetectorRef, ElementRef, ChangeDetectionStrategy, Component,
     OnInit, HostListener, NgZone, HostBinding } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxGridSelectionService, IgxGridCRUDService } from '../selection/selection.service';
import { HammerGesturesManager } from '../../core/touch';
import { PlatformUtil } from '../../core/utils';
import { HierarchicalRowType } from './hierarchical-row.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid-cell',
    templateUrl: './hierarchical-cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxHierarchicalGridCellComponent extends IgxGridCellComponent implements OnInit {

    /**
     * @hidden
     */
    public get displayPinnedChip() {
        return this.hierarchicalRow.ghostRow &&
            (!this.grid.visibleColumns[this.visibleColumnIndex - 1] || this.grid.visibleColumns[this.visibleColumnIndex - 1].cellTemplate);
    }

    /**
     * @hidden
     */
    public get hierarchicalRow(): HierarchicalRowType {
        return this.row as HierarchicalRowType;
    }

    /**
     * @hidden
     */
    public get textClasses() {
        return {
            ['igx-grid__td-text']: !this.hierarchicalRow.ghostRow,
            ['igx-grid__td-text--disabled']: this.hierarchicalRow.ghostRow
        };
    }

    // protected hSelection;
    protected _rootGrid;

    constructor(
        protected selectionService: IgxGridSelectionService,
        protected crudService: IgxGridCRUDService,
        public gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>,
        public cdr: ChangeDetectorRef,
        private helement: ElementRef,
        protected zone: NgZone,
        touchManager: HammerGesturesManager,
        protected platformUtil: PlatformUtil
        ) {
            super(selectionService, crudService, gridAPI, cdr, helement, zone, touchManager, platformUtil);
         }

    ngOnInit() {
        super.ngOnInit();
        this._rootGrid = this._getRootGrid();
    }

    private _getRootGrid() {
        let currGrid = this.grid;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
        }
        return currGrid;
    }

    // TODO: Extend the new selection service to avoid complete traversal
    _clearAllHighlights() {
        [this._rootGrid, ...this._rootGrid.getChildGrids(true)].forEach(grid => {
            grid.selectionService.clear();
            grid.selectionService.activeElement = null;
            grid.nativeElement.classList.remove('igx-grid__tr--highlighted');
            grid.highlightedRowID = null;
            grid.cdr.markForCheck();
        });
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('focus', ['$event'])
    onFocus(event) {
        if (this.focused) {
            return;
        }
        this._clearAllHighlights();
        const currentElement = this.grid.nativeElement;
        let parentGrid = this.grid;
        let childGrid;
        // add highligh to the current grid
        if (this._rootGrid.id !== currentElement.id) {
            currentElement.classList.add('igx-grid__tr--highlighted');
        }

        // add highligh to the current grid
        while (this._rootGrid.id !== parentGrid.id) {
            childGrid = parentGrid;
            parentGrid = parentGrid.parent;

            const parentRowID = parentGrid.hgridAPI.getParentRowId(childGrid);
            parentGrid.highlightedRowID = parentRowID;
        }
        super.onFocus(event);
    }

    // TODO: Refactor
    /**
     * @hidden
     * @internal
     */
    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (event.altKey && !this.row.added) {
            const collapse = this.row.expanded && (key === 'left' || key === 'arrowleft' || key === 'up' || key === 'arrowup');
            const expand = !this.row.expanded && (key === 'right' || key === 'arrowright' || key === 'down' || key === 'arrowdown');
            if (collapse) {
                this.gridAPI.set_row_expansion_state(this.row.rowID, false, event);
            } else if (expand) {
                this.gridAPI.set_row_expansion_state(this.row.rowID, true, event);
            }
            return;
        }
        super.dispatchEvent(event);
    }
}
