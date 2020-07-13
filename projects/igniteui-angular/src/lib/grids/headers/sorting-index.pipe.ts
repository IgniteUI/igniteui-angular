import { Pipe, PipeTransform } from '@angular/core';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxColumnComponent } from '../columns/column.component';

@Pipe({
  name: 'sortingIndex',
  pure: true
})
export class SortingIndexPipe implements PipeTransform {

  transform(value: IgxColumnComponent, sortingExpressions: ISortingExpression[]): number {
    const grid = value.grid;
    const index = sortingExpressions.filter(expression => grid.getColumnByName(expression.fieldName) ?? false)
                                    .findIndex(expression => expression.fieldName === value.field) + 1;
    value.sortingIndex = index;
    return index;
  }

}

@Pipe({
  name: 'hasSortingIndex',
  pure: true
})
export class HasSortingIndexPipe implements PipeTransform {
  transform(value: IgxColumnComponent, sortingExpressions: ISortingExpression[]): boolean {
    const isColumnSorted = sortingExpressions.some(expression => expression.fieldName === value.field);
    if (!isColumnSorted) {
       value.hasSortingIndex = false;
       value.sortingIndex = null;
    } else {
      value.hasSortingIndex = true;
    }
    value.grid.notifyChanges();
    return isColumnSorted;
  }

}

