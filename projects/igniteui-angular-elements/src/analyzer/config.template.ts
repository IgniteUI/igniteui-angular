import { IgxQueryBuilderComponent } from '../../../igniteui-angular/query-builder';
import { IgxPivotDataSelectorComponent, IgxPivotGridComponent } from '../../../igniteui-angular/grids/pivot-grid';
import { IgxGridComponent } from '../lib/grids/grid.component';
import { IgxHierarchicalGridComponent } from '../lib/grids/hierarchical-grid.component';
import { IgxTreeGridComponent } from '../lib/grids/tree-grid.component';

export const registerComponents = [
    IgxGridComponent,
    IgxHierarchicalGridComponent,
    IgxTreeGridComponent,
    IgxPivotGridComponent,
    IgxPivotDataSelectorComponent,
    IgxQueryBuilderComponent
];
