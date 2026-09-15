import { Routes } from '@angular/router';
import { GridComponent } from './grid/grid.component';
import { TreeGridComponent } from './tree-grid/tree-grid.component';
import { PivotGridComponent } from './pivot-grid/pivot-grid.component';
import { HierarchicalGridComponent } from './hierarchical-grid/hierarchical-grid.component';
import { ComboGridComponent } from './combo-grid/combo-grid.component';

export const routes: Routes = [
    {
        path: "combo-grid-1m",
        title: "Combo & Grid 1M records",
        component: ComboGridComponent,
        data: { rows: 1_000_000 }
    },
    {
        path: "pivot-grid",
        title: "Pivot Grid",
        component: PivotGridComponent
    },
    {
        path: "tree-grid-1m",
        title: "Tree Grid 1M records",
        component: TreeGridComponent,
        data: { rows: 1_000_000 }
    },
    {
        path: "tree-grid-100k",
        title: "Tree Grid 100k records",
        component: TreeGridComponent,
        data: { rows: 100_000 }
    },
    {
        path: "tree-grid",
        title: "Tree Grid 1k records",
        component: TreeGridComponent,
        data: { rows: 1000 }
    },
    {
        path: "grid-1m",
        title: "Grid 1M records",
        component: GridComponent,
        data: { rows: 1_000_000 }
    },
    {
        path: "grid-100k",
        title: "Grid 100k records",
        component: GridComponent,
        data: { rows: 100_000 }
    },
    {
        path: "",
        title: "Grid 1k records",
        pathMatch: 'full',
        component: GridComponent,
        data: { rows: 1000 }
    },
    {
        path: "hierarchical-grid-100k",
        title: "Hierarchical Grid 100k records",
        component: HierarchicalGridComponent,
        data: { rows: 100_000 }
    },

];
