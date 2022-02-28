import { DefaultPivotSortingStrategy } from '../../data-operations/pivot-sort-strategy';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-strategy';
import { IPivotDimension } from './pivot-grid.interface';
import { PivotUtil } from './pivot-util';

export class PivotSortUtil {
    public static generateDimensionSortingExpressions(dimensions: IPivotDimension[]): ISortingExpression[] {
        const expressions: ISortingExpression[] = [];
        PivotUtil.flatten(dimensions).forEach(x => {
            if (x.sortDirection) {
                expressions.push({
                    dir: x.sortDirection,
                    fieldName: x.memberName,
                    strategy: DefaultPivotSortingStrategy.instance()
                });
            } else {
                expressions.push({
                    dir: SortingDirection.None,
                    fieldName: x.memberName,
                    strategy: DefaultPivotSortingStrategy.instance()
                });
            }
        });
        return expressions;
    }
}