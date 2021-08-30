import { Pipe, PipeTransform } from '@angular/core';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';

@Pipe({
  name: 'sortingIndex',
  pure: true
})
export class SortingIndexPipe implements PipeTransform {
    public transform(columnField: string, sortingExpressions: ISortingExpression[]): number {
        let sortIndex = sortingExpressions.findIndex(expression => expression.fieldName === columnField);
        return sortIndex !== -1 ? ++sortIndex : null;
    }
}

