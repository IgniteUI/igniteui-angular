import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { HammerGesturesManager } from '../../core/touch';
import { IgxGridExpandableCellComponent } from '../grid/expandable-cell.component';
import { IgxTreeGridRow } from '../grid-public-row';
import { RowType } from '../common/grid.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxTreeGridCellComponent extends IgxGridExpandableCellComponent {

    /**
     * @hidden
     */
    @Input()
    public level = 0;

    /**
     * @hidden
     */
    @Input()
    public showIndicator = false;

    /**
     * @hidden
     */
    @Input()
    public isLoading: boolean;

    /**
     * Gets the row of the cell.
     * ```typescript
     * let cellRow = this.cell.row;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public override get row(): RowType {
        // TODO: Fix types
        return new IgxTreeGridRow(this.grid as any, this.intRow.index, this.intRow.data);
    }

    /**
     * @hidden
     */
    public override toggle(event: Event) {
        event.stopPropagation();
        this.grid.gridAPI.set_row_expansion_state(this.intRow.key, !this.intRow.expanded, event);
    }

    /**
     * @hidden
     */
    public onLoadingDblClick(event: Event) {
        event.stopPropagation();
    }
}
