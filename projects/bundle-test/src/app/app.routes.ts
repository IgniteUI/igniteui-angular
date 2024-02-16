import { Routes } from '@angular/router';
import { ChipComponent } from './chip/chip.component';
import { ButtonGroupComponent } from './button-group/button-group.component';

export const routes: Routes = [
    { path: '', redirectTo: '/chip', pathMatch: 'full' },
    { path: 'chip', component: ChipComponent },
    { path: 'button-group', component: ButtonGroupComponent}
    // { path: 'form', loadComponent: () => import('./form/form.component').then(m => m.FormComponent) },
    // { path: 'stepper', loadComponent: () => import('./stepper/stepper.component').then(m => m.StepperComponent) },
    // { path: 'grid', loadComponent: () => import('./grid/grid.component').then(m => m.GridComponent) }
];
