import { Injectable } from '@angular/core';
import { first, takeUntil } from 'rxjs/operators';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { DimensionValuesFilteringStrategy } from '../../data-operations/pivot-strategy';
import { ColumnType } from '../common/grid.interface';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { PivotUtil } from './pivot-util';

@Injectable()
export class IgxPivotFilteringService extends IgxFilteringService {
    private filtersESFId;

    public override clearFilter(field: string): void {
        this.clear_filter(field);
    }

    public override clear_filter(fieldName: string) {
        super.clear_filter(fieldName);
        const grid = this.grid as IgxPivotGridComponent;
        const allDimensions = grid.allDimensions;
        const allDimensionsFlat = PivotUtil.flatten(allDimensions);
        const dim = allDimensionsFlat.find(x => x.memberName === fieldName);
        dim.filter = undefined;
        grid.filteringPipeTrigger++;
        if (allDimensions.indexOf(dim) !== -1) {
            // update columns
            (grid as any).setupColumns();
        }
    }
    protected override filter_internal(fieldName: string, term, conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean) {
        super.filter_internal(fieldName, term, conditionOrExpressionsTree, ignoreCase);
        const grid = this.grid as IgxPivotGridComponent;
        const config = grid.pivotConfiguration;
        const allDimensions = PivotUtil.flatten(config.rows.concat(config.columns).concat(config.filters).filter(x => x !== null && x !== undefined));
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        const dim = enabledDimensions.find(x => x.memberName === fieldName || x.member === fieldName);
        const filteringTree = dim.filter || new FilteringExpressionsTree(FilteringLogic.And);
        const fieldFilterIndex = filteringTree.findIndex(fieldName);
        if (fieldFilterIndex > -1) {
            filteringTree.filteringOperands.splice(fieldFilterIndex, 1);
        }

        this.prepare_filtering_expression(filteringTree, fieldName, term, conditionOrExpressionsTree, ignoreCase, fieldFilterIndex);
        dim.filter = filteringTree;
        grid.filteringPipeTrigger++;
        grid.filterStrategy = grid.filterStrategy ?? new DimensionValuesFilteringStrategy();
        if (allDimensions.indexOf(dim) !== -1) {
            // update columns
            (grid as any).setupColumns();
        }
    }

    public toggleFiltersESF(dropdown: any, element: HTMLElement, column: ColumnType, shouldReattach: boolean) {
        const filterIcon = column.filteringExpressionsTree ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
        const filterIconTarget = element.querySelector(`.${filterIcon}`) as HTMLElement || element;

        const { id, ref } = (this.grid as IgxPivotGridComponent).createFilterESF(dropdown, column, {
            ...this._filterMenuOverlaySettings,
            ...{ target: filterIconTarget }
        }, shouldReattach);

        this.filtersESFId = id;

        if (shouldReattach) {
            this._overlayService.opening
                .pipe(
                    first(overlay => overlay.id === id),
                    takeUntil(this.destroy$)
                )
                .subscribe(() => this.lastActiveNode = this.grid.navigation.activeNode);

            this._overlayService.closed
                .pipe(
                    first(overlay => overlay.id === id),
                    takeUntil(this.destroy$)
                )
                .subscribe(() => {
                    this._overlayService.detach(id);
                    ref?.destroy();
                    this.grid.navigation.activeNode = this.lastActiveNode;
                    this.grid.theadRow.nativeElement.focus();
                });

            this.grid.columnPinned.pipe(first()).subscribe(() => ref?.destroy());
            this._overlayService.show(id);
        }
    }

    public hideESF() {
        this._overlayService.hide(this.filtersESFId);
    }
}
