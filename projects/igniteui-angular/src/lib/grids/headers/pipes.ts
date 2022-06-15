import { Pipe, PipeTransform } from '@angular/core';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { ColumnType } from '../common/grid.interface';


@Pipe({ name: 'sortingIndex' })
export class SortingIndexPipe implements PipeTransform {
    public transform(columnField: string, sortingExpressions: ISortingExpression[]): number {
        let sortIndex = sortingExpressions.findIndex(expression => expression.fieldName === columnField);
        return sortIndex !== -1 ? ++sortIndex : null;
    }
}

@Pipe({ name: 'igxHeaderGroupWidth' })
export class IgxHeaderGroupWidthPipe implements PipeTransform {

    public transform(width: any, minWidth: any, hasLayout: boolean) {
        const isFitContent = width === 'fit-content';
        const isPercentage = typeof width === 'string' && width.indexOf('%') !== -1;
        return hasLayout ? '' : isFitContent || isPercentage ? width : `${Math.max(parseFloat(width), minWidth)}px`;
    }
}


@Pipe({ name: 'igxHeaderGroupStyle' })
export class IgxHeaderGroupStylePipe implements PipeTransform {

    public transform(styles: { [prop: string]: any }, column: ColumnType, _: number): { [prop: string]: any } {
        const css = {};

        if (!styles) {
            return css;
        }

        for (const prop of Object.keys(styles)) {
            const res = styles[prop];
            css[prop] = typeof res === 'function' ? res(column) : res;
        }

        return css;
    }
}
