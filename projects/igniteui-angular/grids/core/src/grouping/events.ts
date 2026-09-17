import { IBaseEventArgs, ISortingExpression } from 'igniteui-angular/core';
import { IgxColumnComponent } from '../columns/column.component';

export interface IGroupingDoneEventArgs extends IBaseEventArgs {
    expressions: Array<ISortingExpression> | ISortingExpression;
    groupedColumns: Array<IgxColumnComponent> | IgxColumnComponent;
    ungroupedColumns: Array<IgxColumnComponent> | IgxColumnComponent;
}