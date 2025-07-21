import { Routes } from '@angular/router';
import { GridComponent } from './grid/grid.component';

export const routes: Routes = [
    {
        path: "grid-100k",
        component: GridComponent,
        data: { rows: 100_000 }
    },
    {
        path: "grid-1m",
        component: GridComponent,
        data: { rows: 1_000_000 }
    },
    {
        path: "",
        pathMatch: 'full',
        component: GridComponent,
        data: { rows: 1000 }
    }
];
