import { Routes } from '@angular/router';
import { GridComponent } from './grid/grid.component';
import { TreeGridComponent } from './tree-grid/tree-grid.component';

export const routes: Routes = [
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
    }

];
