import { NgModule } from '@angular/core';
import { IgxAccordionComponent } from './accordion.component';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxAccordionComponent,
        IgxExpansionPanelModule
    ],
    exports: [
        IgxAccordionComponent,
        IgxExpansionPanelModule
    ]
})
export class IgxAccordionModule {
}
