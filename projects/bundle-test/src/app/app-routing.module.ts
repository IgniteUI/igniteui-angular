import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChipComponent } from './chip/chip.component';

const routes: Routes = [
    { path: '', redirectTo: '/chip', pathMatch: 'full' },
    { path: 'chip', component: ChipComponent },
    // { path: 'form', loadComponent: () => import('./form/form.component').then(m => m.FormComponent) },
    // { path: 'stepper', loadComponent: () => import('./stepper/stepper.component').then(m => m.StepperComponent) },
    // { path: 'grid', loadComponent: () => import('./grid/grid.component').then(m => m.GridComponent) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
