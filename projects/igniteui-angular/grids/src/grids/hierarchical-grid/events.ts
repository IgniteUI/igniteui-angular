import { IBaseEventArgs } from 'igniteui-angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';


export interface IGridCreatedEventArgs extends IBaseEventArgs {
    owner: IgxRowIslandComponent;
    parentID: any;
    grid: IgxHierarchicalGridComponent;
    parentRowData?: any;
}
