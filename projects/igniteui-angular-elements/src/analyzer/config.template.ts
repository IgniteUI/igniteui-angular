import {
    IgxPivotDataSelectorComponent,
    IgxPivotGridComponent
} from '../../../igniteui-angular/src/public_api';
import { IgxGridElementsComponent } from '../lib/grids/grid.component';
import { IgxHierarchicalGridElementsComponent } from '../lib/grids/hierarchical-grid.component';
import { IgxTreeGridElementsComponent } from '../lib/grids/tree-grid.component';

export const registerComponents = [
    IgxGridElementsComponent,
    IgxHierarchicalGridElementsComponent,
    IgxTreeGridElementsComponent,
    IgxPivotGridComponent,
    IgxPivotDataSelectorComponent
];
