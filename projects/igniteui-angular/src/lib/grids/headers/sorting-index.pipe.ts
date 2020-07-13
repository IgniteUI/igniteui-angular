import { Pipe, PipeTransform } from '@angular/core';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxColumnComponent } from '../public_api';

@Pipe({
  name: 'sortingIndex'
})
export class SortingIndexPipe implements PipeTransform {

  transform(value: IgxColumnComponent, sortingExpressions: ISortingExpression[]): number {
    const index = sortingExpressions.findIndex(expression => expression.fieldName === value.field) + 1;
    value.sortingIndex = index;
    return index;
  }

}

@Pipe({
  name: 'hasSortingIndex'
})
export class HasSortingIndexPipe implements PipeTransform {
  transform(value: IgxColumnComponent, sortingExpressions: ISortingExpression[]): boolean {
    const isColumnSorted = sortingExpressions.some(expression => expression.fieldName === value.field);
    if (!isColumnSorted) {
       value.hasSortingIndex = false;
       value.sortingIndex = null;
    }
    value.grid.notifyChanges();
    return isColumnSorted;
  }

}

