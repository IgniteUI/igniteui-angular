import { NgModule } from '@angular/core';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IgxExpansionPanelBodyComponent } from './expansion-panel-body.component';
import {
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelIconDirective
} from './expansion-panel.directives';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxExpansionPanelComponent,
        IgxExpansionPanelHeaderComponent,
        IgxExpansionPanelBodyComponent,
        IgxExpansionPanelDescriptionDirective,
        IgxExpansionPanelTitleDirective,
        IgxExpansionPanelIconDirective
    ],
    exports: [
        IgxExpansionPanelComponent,
        IgxExpansionPanelHeaderComponent,
        IgxExpansionPanelBodyComponent,
        IgxExpansionPanelDescriptionDirective,
        IgxExpansionPanelTitleDirective,
        IgxExpansionPanelIconDirective
    ]
})
export class IgxExpansionPanelModule { }
