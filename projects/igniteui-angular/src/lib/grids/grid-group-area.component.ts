import { Component } from '@angular/core';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../chips/chips-area.component';
import { IgxGridComponent } from './grid/grid.component';
import { IgxGroupAreaComponent } from './group-area.component';

/**
 * @hidden
 */
@Component({
    selector: 'igx-grid-group-area',
    templateUrl: './group-area.component.html'
})
export class IgxGridGroupAreaComponent extends IgxGroupAreaComponent {
    /**
     * @hidden @internal
     */
    public chipsOrderChanged(event: IChipsAreaReorderEventArgs) {
        const newGrouping = [];
        for (const chip of event.chipsArray) {
            const expr = this.groupingExpressions.filter((item) => item.fieldName === chip.id)[0];

            if (!this.grid.getColumnByName(expr.fieldName).groupable) {
                // disallow changing order if there are columns with groupable: false
                return;
            }
            newGrouping.push(expr);
        }

        // if (this.grid instanceof IgxGridComponent) {
            // this.grid.groupingExpansionState = [];
        // }

        this.grid.chipsGroupingExpressions = newGrouping;

        if (event.originalEvent instanceof KeyboardEvent) {
            // When reordered using keyboard navigation, we don't have `onMoveEnd` event.
            this.groupingExpressions = this.grid.chipsGroupingExpressions;
        }
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public chipsMovingEnded() {
        this.groupingExpressions = this.grid.chipsGroupingExpressions;
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public onChipKeyDown(event: IChipKeyDownEventArgs) {
        if (event.originalEvent.key === ' ' || event.originalEvent.key === 'Spacebar' || event.originalEvent.key === 'Enter') {
            const sortingExpr = this.grid.sortingExpressions;
            const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
            columnExpr.dir = 3 - columnExpr.dir;
            this.grid.sort(columnExpr);
            this.grid.notifyChanges();
        }
    }

    /**
     * @hidden @internal
     */
    public onChipRemoved(event: IBaseChipEventArgs) {
        if (this.grid instanceof IgxGridComponent) {
            this.grid.clearGrouping(event.owner.id);
        }
    }

    /**
     * @hidden @internal
     */
    public onChipClicked(event: IChipClickEventArgs) {
        const sortingExpr = this.grid.sortingExpressions;
        const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
        const groupExpr = this.groupingExpressions.find((expr) => expr.fieldName === event.owner.id);
        columnExpr.dir = 3 - columnExpr.dir;
        groupExpr.dir = columnExpr.dir;
        this.grid.sort(columnExpr);
        this.grid.notifyChanges();
    }
}
