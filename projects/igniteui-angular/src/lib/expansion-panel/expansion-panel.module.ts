import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon/public_api';
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
 */
@NgModule({
  declarations: [
    IgxExpansionPanelComponent,
    IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelBodyComponent,
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelIconDirective
  ],
  entryComponents: [
  ],
  exports: [
    IgxExpansionPanelComponent,
    IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelBodyComponent,
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelIconDirective
  ],
  imports: [
    CommonModule,
    IgxRippleModule,
    IgxIconModule,
    IgxButtonModule,
    IgxAvatarModule
  ]
})
export class IgxExpansionPanelModule {
}
