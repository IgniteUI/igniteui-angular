import { IgxGridCellComponent } from '../cell.component';
import { ChangeDetectorRef, ElementRef, ChangeDetectionStrategy, Component, OnInit, NgZone, Inject } from '@angular/core';
import { IgxGridSelectionService } from '../selection/selection.service';
import { HammerGesturesManager } from '../../core/touch';
import { PlatformUtil } from '../../core/utils';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { IgxOverlayService } from '../../services/public_api';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-hierarchical-grid-cell',
    templateUrl: '../cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxHierarchicalGridCellComponent extends IgxGridCellComponent implements OnInit {
    // protected hSelection;
    protected _rootGrid;

    constructor(
        selectionService: IgxGridSelectionService,
        @Inject(IGX_GRID_BASE) grid: GridType,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        cdr: ChangeDetectorRef,
        helement: ElementRef<HTMLElement>,
        zone: NgZone,
        touchManager: HammerGesturesManager,
        platformUtil: PlatformUtil
    ) {
        super(selectionService, grid, overlayService, cdr, helement, zone, touchManager, platformUtil);
    }

    public override ngOnInit() {
        super.ngOnInit();
        this._rootGrid = this._getRootGrid();
    }

    /**
     * @hidden
     * @internal
     */
    public override activate(event: FocusEvent) {
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

            const parentRowID = parentGrid.gridAPI.getParentRowId(childGrid);
            parentGrid.highlightedRowID = parentRowID;
        }
        this.grid.navigation.activeNode.gridID = this.gridID;
        super.activate(event);
    }

    private _getRootGrid() {
        let currGrid = this.grid;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
        }
        return currGrid;
    }

    // TODO: Extend the new selection service to avoid complete traversal
    private _clearAllHighlights() {
        [this._rootGrid, ...this._rootGrid.getChildGrids(true)].forEach(grid => {
            if (grid !== this.grid && grid.navigation.activeNode) {
                grid.navigation.clearActivation();
                grid.selectionService.initKeyboardState();
                grid.selectionService.clear();
            }

            grid.selectionService.activeElement = null;
            grid.nativeElement.classList.remove('igx-grid__tr--highlighted');
            grid.highlightedRowID = null;
            grid.cdr.markForCheck();
        });
    }
}
