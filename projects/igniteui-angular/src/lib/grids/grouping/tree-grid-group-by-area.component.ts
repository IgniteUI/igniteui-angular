import {
    AfterContentInit,
    Component,
    ElementRef,
    Input,
    IterableDiffer,
    IterableDiffers,
    OnDestroy,
    booleanAttribute,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IChipsAreaReorderEventArgs } from '../../chips/public_api';
import { PlatformUtil } from '../../core/utils';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { IgxGroupByAreaDirective, IgxGroupByMetaPipe } from './group-by-area.directive';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IgxGroupAreaDropDirective } from '../grid.directives';
import { IgxSuffixDirective } from '../../directives/suffix/suffix.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxChipComponent } from '../../chips/chip.component';
import { NgFor, NgTemplateOutlet } from '@angular/common';
import { IgxChipsAreaComponent } from '../../chips/chips-area.component';

/**
 * An internal component representing the group-by drop area for the igx-grid component.
 *
 * @hidden @internal
 */
@Component({
    selector: 'igx-tree-grid-group-by-area',
    templateUrl: 'group-by-area.component.html',
    providers: [{ provide: IgxGroupByAreaDirective, useExisting: IgxTreeGridGroupByAreaComponent }],
    imports: [IgxChipsAreaComponent, NgFor, IgxChipComponent, IgxIconComponent, IgxSuffixDirective, IgxGroupAreaDropDirective, IgxDropDirective, NgTemplateOutlet, IgxGroupByMetaPipe]
})
export class IgxTreeGridGroupByAreaComponent extends IgxGroupByAreaDirective implements AfterContentInit, OnDestroy {
    @Input({ transform: booleanAttribute })
    public get hideGroupedColumns() {
        return this._hideGroupedColumns;
    }

    public set hideGroupedColumns(value: boolean) {
        if (this.grid?.columns && this.expressions) {
            this.setColumnsVisibility(value);
        }

        this._hideGroupedColumns = value;
    }

    private _hideGroupedColumns = false;
    private groupingDiffer: IterableDiffer<IGroupingExpression>;
    private destroy$ = new Subject<any>();

    constructor(private differs: IterableDiffers, ref: ElementRef<HTMLElement>, platform: PlatformUtil) {
        super(ref, platform);
    }

    public ngAfterContentInit(): void {
        if (this.grid.columns && this.expressions) {
            this.groupingDiffer = this.differs.find(this.expressions).create();
            this.updateColumnsVisibility();
        }

        this.grid.sortingExpressionsChange.pipe(takeUntil(this.destroy$)).subscribe((sortingExpressions: ISortingExpression[]) => {
            if (!this.expressions || !this.expressions.length) {
                return;
            }

            let changed = false;

            sortingExpressions.forEach((sortExpr: ISortingExpression) => {
                const fieldName = sortExpr.fieldName;
                const groupingExpr = this.expressions.find(ex => ex.fieldName === fieldName);
                if (groupingExpr && groupingExpr.dir !== sortExpr.dir) {
                    groupingExpr.dir = sortExpr.dir;
                    changed = true;
                }
            });

            if (changed) {
                this.expressions = [...this.expressions];
            }
        });
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public handleReorder(event: IChipsAreaReorderEventArgs) {
        const { chipsArray, originalEvent } = event;
        const newExpressions = this.getReorderedExpressions(chipsArray);

        this.chipExpressions = newExpressions;

        // When reordered using keyboard navigation, we don't have `onMoveEnd` event.
        if (originalEvent instanceof KeyboardEvent) {
            this.expressions = newExpressions;
        }
    }

    public handleMoveEnd() {
        this.expressions = this.chipExpressions;
    }

    public groupBy(expression: IGroupingExpression) {
        this.expressions.push(expression);
        this.expressions = [...this.expressions];
    }

    public clearGrouping(name: string) {
        this.expressions = this.expressions.filter(item => item.fieldName !== name);
        this.grid.sortingExpressions = this.grid.sortingExpressions.filter(item => item.fieldName !== name);
        this.grid.notifyChanges(true);
    }

    protected override expressionsChanged() {
        this.updateColumnsVisibility();
    }

    private updateColumnsVisibility() {
        if (this.groupingDiffer && this.grid.columns && !this.grid.hasColumnLayouts) {
            const changes = this.groupingDiffer.diff(this.expressions);
            if (changes && this.grid.columns.length > 0) {
                changes.forEachAddedItem((rec) => {
                    const col = this.grid.getColumnByName(rec.item.fieldName);
                    col.hidden = this.hideGroupedColumns;
                });
                changes.forEachRemovedItem((rec) => {
                    const col = this.grid.getColumnByName(rec.item.fieldName);
                    col.hidden = false;
                });
            }
        }
    }

    private setColumnsVisibility(value) {
        if (this.grid.columns.length > 0 && !this.grid.hasColumnLayouts) {
            this.expressions.forEach((expr) => {
                const col = this.grid.getColumnByName(expr.fieldName);
                col.hidden = value;
            });
        }
    }
}

