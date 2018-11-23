import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LazyIconSampleComponent } from './LazyComponent/lazyIcon.sample';

const routes: Routes = [
    {
        path: '',
        component: LazyIconSampleComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class LazyIconRoutingModule {}
