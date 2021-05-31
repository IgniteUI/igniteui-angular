import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../chips/chips-area.component';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IgxGridComponent } from './grid/grid.component';
import { IgxTreeGridComponent } from './tree-grid/tree-grid.component';


/**
 * Provides a pre-configured column grouping component for the grid.
 *
 * @example
 * ```html
 *  <igx-grid-grouping></igx-grid-grouping>
 * ```
 */
@Component({
    selector: 'igx-grid-grouping',
    templateUrl: './grid-grouping.component.html'
})
export class IgxGridGroupingComponent {
    @Input()
    public grid: IgxGridComponent | IgxTreeGridComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('groupArea')
    public groupArea: ElementRef;

    /**
     * @hidden @internal
     */
    public chipsOrderChanged(event: IChipsAreaReorderEventArgs) {
        const newGrouping = [];
        for (const chip of event.chipsArray) {
            const expr = this.grid.groupingExpressions.filter((item) => item.fieldName === chip.id)[0];

            if (!this.grid.getColumnByName(expr.fieldName).groupable) {
                // disallow changing order if there are columns with groupable: false
                return;
            }
            newGrouping.push(expr);
        }
        this.grid.groupingExpansionState = [];
        this.grid.chipsGroupingExpressions = newGrouping;

        if (event.originalEvent instanceof KeyboardEvent) {
            // When reordered using keyboard navigation, we don't have `onMoveEnd` event.
            this.grid.groupingExpressions = this.grid.chipsGroupingExpressions;
        }
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public chipsMovingEnded() {
        this.grid.groupingExpressions = this.grid.chipsGroupingExpressions;
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public getGroupByChipTitle(expression: IGroupingExpression): string {
        const column = this.grid.getColumnByName(expression.fieldName);
        return (column && column.header) || expression.fieldName;
    }

    /**
     * @hidden @internal
     */
    public getColumnGroupable(fieldName: string): boolean {
        const column = this.grid.getColumnByName(fieldName);
        return column && column.groupable;
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
        this.grid.clearGrouping(event.owner.id);
    }

    /**
     * @hidden @internal
     */
    public onChipClicked(event: IChipClickEventArgs) {
        const sortingExpr = this.grid.sortingExpressions;
        const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
        const groupExpr = this.grid.groupingExpressions.find((expr) => expr.fieldName === event.owner.id);
        columnExpr.dir = 3 - columnExpr.dir;
        groupExpr.dir = columnExpr.dir;
        this.grid.sort(columnExpr);
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public get dropAreaTemplateResolved(): TemplateRef<any> {
        if (this.grid.dropAreaTemplate) {
            return this.grid.dropAreaTemplate;
        } else {
            return this.grid.defaultDropAreaTemplate;
        }
    }

    /**
     * @hidden @internal
     */
    public getGroupAreaHeight(): number {
        return this.groupArea ? this.grid.getComputedHeight(this.groupArea.nativeElement) : 0;
    }






}
