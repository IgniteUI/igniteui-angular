import { Pipe, PipeTransform } from '@angular/core';
import { ColumnType, ISortingExpression } from 'igniteui-angular/core';


@Pipe({
    name: 'sortingIndex',
    standalone: true
})
export class SortingIndexPipe implements PipeTransform {
    public transform(columnField: string, sortingExpressions: ISortingExpression[]): number {
        let sortIndex = sortingExpressions.findIndex(expression => expression.fieldName === columnField);
        return sortIndex !== -1 ? ++sortIndex : null;
    }
}

@Pipe({
    name: 'igxHeaderGroupStyle',
    standalone: true
})
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
