import { ISortingExpression, SortingDirection } from 'igniteui-angular/core';
import { IPivotDimension, PivotUtil } from 'igniteui-angular/grids/core';
import { DefaultPivotSortingStrategy } from './pivot-sort-strategy';

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
