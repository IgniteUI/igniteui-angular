import { Pipe, PipeTransform } from '@angular/core';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxGridHeaderComponent } from './grid-header.component';

@Pipe({
  name: 'sortingIndex',
  pure: true
})
export class SortingIndexPipe implements PipeTransform {

  constructor(private igxHeader: IgxGridHeaderComponent) {}
  transform(columnField: string, sortingExpressions: ISortingExpression[]): number {
    const grid = this.igxHeader.grid;
    const index = sortingExpressions.filter(expression => grid.getColumnByName(expression.fieldName) ?? false)
                                    .findIndex(expression => expression.fieldName === columnField) + 1;
    return index;
  }

}

@Pipe({
  name: 'hasSortingIndex',
  pure: true
})
export class HasSortingIndexPipe implements PipeTransform {
  transform(columnField: string, sortingExpressions: ISortingExpression[]): boolean {
    return sortingExpressions.some(expression => expression.fieldName === columnField);
  }

}

