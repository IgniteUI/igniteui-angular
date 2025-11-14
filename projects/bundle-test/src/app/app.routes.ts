import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/chip', pathMatch: 'full' },
    { path: 'chip', loadComponent: () => import('./chip/chip.component').then(m => m.ChipComponent) },
    { path: 'button-group', loadComponent: () => import('./button-group/button-group.component').then(m => m.ButtonGroupComponent) },
    { path: 'form', loadComponent: () => import('./form/form.component').then(m => m.FormComponent) },
    { path: 'stepper', loadComponent: () => import('./stepper/stepper.component').then(m => m.StepperComponent) },
    { path: 'grid', loadComponent: () => import('./grid/grid.component').then(m => m.GridComponent) },
    { path: 'h-grid', loadComponent: () => import('./h-grid/h-grid.component').then(m => m.HGridComponent) },
    { path: 'pivot-grid', loadComponent: () => import('./pivot-grid/pivot-grid.component').then(m => m.PivotGridComponent) }
];
