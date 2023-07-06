import { NgModule } from '@angular/core';

import { LazyIconSampleComponent } from './LazyComponent/lazyIcon.sample';
import { LazyIconRoutingModule } from './lazyIcon.routing.module';

@NgModule({
    imports: [
        LazyIconRoutingModule,
        LazyIconSampleComponent
    ]
})
export class LazyIconModule { }
