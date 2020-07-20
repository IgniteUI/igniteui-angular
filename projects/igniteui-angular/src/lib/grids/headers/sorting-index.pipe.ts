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
    let sortIndex = sortingExpressions.filter(expression => grid.getColumnByName(expression.fieldName) ?? false)
                                      .findIndex(expression => expression.fieldName === columnField);
    return sortIndex !== -1 ? ++sortIndex : null;
  }

}

