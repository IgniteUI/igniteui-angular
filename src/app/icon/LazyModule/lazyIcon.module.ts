import { NgModule } from '@angular/core';
import { IgxIconModule } from 'igniteui-angular';
import { LazyIconSampleComponent } from './LazyComponent/lazyIcon.sample';
import { LazyIconRoutingModule } from './lazyIcon.routing.module';

@NgModule({
    declarations: [
        LazyIconSampleComponent
    ],
    imports: [
        IgxIconModule,
        LazyIconRoutingModule
    ]
})
export class LazyIconModule { }
