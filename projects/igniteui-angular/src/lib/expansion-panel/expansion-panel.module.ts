import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon/index';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IgxExpansionPanelDescriptionDirective, IgxExpansionPanelTitleDirective,
  IgxExpansionPanelBodyDirective,
  IgxExpansionPanelHeaderDirective,
  IgxExpansionPanelIconDirective } from './expansion-panel.directives';

@NgModule({
  declarations: [
    IgxExpansionPanelComponent,
    IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelHeaderDirective,
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelBodyDirective,
    IgxExpansionPanelIconDirective
  ],
  entryComponents: [
  ],
  exports: [
    IgxExpansionPanelComponent,
    IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelBodyDirective,
    IgxExpansionPanelIconDirective,
    IgxExpansionPanelHeaderDirective
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
