import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChipComponent } from './chip/chip.component';

const routes: Routes = [
    { path: '', component: ChipComponent },
    { path: 'chip', component: ChipComponent },
    { path: 'stepper', loadComponent: () => import('./stepper/stepper.component').then(m => m.StepperComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
