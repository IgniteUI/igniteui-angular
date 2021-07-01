import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { IgxAccordionComponent } from './accordion.component';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxAccordionComponent
    ],
    imports: [
        IgxExpansionPanelModule,
        CommonModule,
    ],
    exports: [
        IgxAccordionComponent,
        IgxExpansionPanelModule
    ]
})
export class IgxAccordionModule {
}
