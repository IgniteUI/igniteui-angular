import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../chips/chips-area.component';
import { cloneArray } from '../core/utils';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxColumnComponent } from './columns/column.component';
import { IgxGridComponent } from './grid/grid.component';
import { IgxColumnMovingDragDirective } from './moving/moving.drag.directive';
import { IgxTreeGridComponent } from './tree-grid/tree-grid.component';

/**
 * Provides a pre-configured column grouping component for the tree grid.
 *
 * @example
 * ```html
 *  <igx-group-area></igx-group-area>
 * ```
 */
@Component({
    selector: 'igx-group-area',
    templateUrl: './group-area.component.html'
})
export class IgxGroupAreaComponent {
    private _groupingExpressions: IGroupingExpression[] = [];

    @Input()
    public grid: IgxGridComponent | IgxTreeGridComponent;

    @Input()
    public get groupingExpressions(): IGroupingExpression[] {
        return this._groupingExpressions;
    }
    public set groupingExpressions(value: IGroupingExpression[]) {
        this._groupingExpressions = value;
        this.groupingExpressionsChange.emit(value);
    }

    /**
     * @hidden
     */
    @Output()
    public groupingExpressionsChange = new EventEmitter<IGroupingExpression[]>();

    /**
     * @hidden @internal
     */
    @ViewChild('groupArea')
    public groupArea: ElementRef;

    /**
     * @hidden @internal
     */
    public onDragDrop(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        if (drag instanceof IgxColumnMovingDragDirective) {
            const column: IgxColumnComponent = drag.column;
            if (this.grid.columns.indexOf(column) < 0) {
                return;
            }

            if (this.groupingExpressions) {
                const isGrouped = this.grid.chipsGroupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1
                if (column.groupable && !isGrouped && !column.columnGroup && !!column.field) {
                    const groupingExpression = {
                        fieldName: column.field,
                        dir: SortingDirection.Asc,
                        ignoreCase: column.sortingIgnoreCase,
                        strategy: column.sortStrategy,
                        groupingComparer: column.groupingComparer
                    };

                    // TODO: refactor (?)
                    if (this.grid instanceof IgxGridComponent) {
                        this.grid.groupBy(groupingExpression);
                    } else {
                        this.grid.chipsGroupingExpressions.push(groupingExpression);
                        this.groupingExpressions = [...this.grid.chipsGroupingExpressions];
                    }
                }
            }
        }
    }

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
     }

    /**
     * @hidden @internal
     */
    public onChipRemoved(event: IBaseChipEventArgs) {
        const fieldName = event.owner.id;
        this.grid.chipsGroupingExpressions = this.grid.chipsGroupingExpressions.filter(item => item.fieldName !== fieldName);
        this.groupingExpressions = [...this.grid.chipsGroupingExpressions];
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public onChipClicked(event: IChipClickEventArgs) {
        // TODO: Change sort direction
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
