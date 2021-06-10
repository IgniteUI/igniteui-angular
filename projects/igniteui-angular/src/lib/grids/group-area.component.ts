import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild, AfterContentInit } from '@angular/core';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../chips/chips-area.component';
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
export class IgxGroupAreaComponent implements AfterContentInit {
    @Input()
    public grid: IgxGridComponent | IgxTreeGridComponent;

    @Input()
    public get groupingExpressions(): IGroupingExpression[] {
        return this._groupingExpressions;
    }
    public set groupingExpressions(value: IGroupingExpression[]) {
        this._groupingExpressions = value;

        if (this.hideGroupedColumns && this.grid.columnList && this.groupingExpressions) {
            this.applyGroupColsVisibility();
        }

        this.grid.sortingExpressions = value;
        this.groupingExpressionsChange.emit(value);
    }
    @Output()
    public groupingExpressionsChange = new EventEmitter<IGroupingExpression[]>();

    @Input()
    public get hideGroupedColumns() {
        return this._hideGroupedColumns;
    }
    public set hideGroupedColumns(value: boolean) {
        if (value) {
            this._groupingDiffer = this.grid.differs.find(this.groupingExpressions).create();
        } else {
            this._groupingDiffer = null;
        }
        if (this.grid.columnList && this.groupingExpressions) {
            this.setGroupColsVisibility(value);
        }

        this._hideGroupedColumns = value;
    }

    /**
     * @hidden @internal
     */
    @ViewChild('groupArea')
    public groupArea: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultDropArea', { read: TemplateRef, static: true })
    public defaultDropAreaTemplate: TemplateRef<any>;

    /**
     * Gets/Sets the template that will be rendered as a GroupBy drop area.
     *
     * @remarks
     * The tree grid needs to have at least one groupable column in order the GroupBy area to be displayed.
     * @example
     * ```html
     * <igx-group-area [dropAreaTemplate]="dropAreaRef">
     * </igx-group-area>
     * <ng-template #myDropArea>
     *      <span> Custom drop area! </span>
     * </ng-template>
     * ```
     */
    @Input()
    public dropAreaTemplate: TemplateRef<any>;

    /**
     * Gets/Sets the message displayed inside the GroupBy drop area where columns can be dragged on.
     *
     * @remarks
     * The tree grid needs to have at least one groupable column in order the GroupBy area to be displayed.
     * @example
     * ```html
     * <igx-group-area dropAreaMessage="Drop here to group!">
     * </igx-group-area>
     * ```
     */
    @Input()
    public set dropAreaMessage(value: string) {
        this._dropAreaMessage = value;
        this.grid.notifyChanges();
    }
    public get dropAreaMessage(): string {
        return this._dropAreaMessage || this.grid.resourceStrings.igx_grid_groupByArea_message;
    }

    /**
     * Gets if the grid's group by drop area is visible.
     *
     * @example
     * ```typescript
     * const dropVisible = this.groupArea.dropAreaVisible;
     * ```
     */
    public get dropAreaVisible(): boolean {
        return (this.grid.draggedColumn && this.grid.draggedColumn.groupable) ||
            !this.grid.chipsGroupingExpressions.length;
    }

    private _groupingExpressions: IGroupingExpression[] = [];
    private _hideGroupedColumns = false;
    private _groupingDiffer;
    private _dropAreaMessage = null;

    ngAfterContentInit() {
        this.grid.chipsGroupingExpressions = this.groupingExpressions;
    }

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
                const isGrouped = this.grid.chipsGroupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1;
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

        if (this.grid instanceof IgxGridComponent) {
            this.grid.groupingExpansionState = [];
        }

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
        const sortingExpr = this.grid.sortingExpressions;
        const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
        const groupExpr = this.groupingExpressions.find((expr) => expr.fieldName === event.owner.id);
        columnExpr.dir = 3 - columnExpr.dir;
        groupExpr.dir = columnExpr.dir;
        this.groupingExpressions = [...this.grid.chipsGroupingExpressions];
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
        if (this.dropAreaTemplate) {
            return this.dropAreaTemplate;
        } else {
            return this.defaultDropAreaTemplate;
        }
    }

    /**
     * @hidden @internal
     */
    public getGroupAreaHeight(): number {
        return this.groupArea ? this.grid.getComputedHeight(this.groupArea.nativeElement) : 0;
    }

    private setGroupColsVisibility(value) {
        if (this.grid.columnList.length > 0 && !this.grid.hasColumnLayouts) {
            this.groupingExpressions.forEach((expr) => {
                const col = this.grid.getColumnByName(expr.fieldName);
                col.hidden = value;
            });
        }
    }

    private applyGroupColsVisibility() {
        if (this._groupingDiffer && this.grid.columnList && !this.grid.hasColumnLayouts) {
            const changes = this._groupingDiffer.diff(this.groupingExpressions);
            if (changes && this.grid.columnList.length > 0) {
                changes.forEachAddedItem((rec) => {
                    const col = this.grid.getColumnByName(rec.item.fieldName);
                    col.hidden = true;
                });
                changes.forEachRemovedItem((rec) => {
                    const col = this.grid.getColumnByName(rec.item.fieldName);
                    col.hidden = false;
                });
            }
        }
        this.grid.ngDoCheck();
    }
}
