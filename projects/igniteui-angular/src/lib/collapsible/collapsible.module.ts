import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon';
import { IgxCollapsibleComponent } from './collapsible.component';
import { IgxCollapsibleHeaderComponent } from './collapsible-header.component';
import { IgxCollapsibleDescriptionDirective, IgxCollapsibleTitleDirective,
  IgxCollapsibleBodyDirective,
  IgxCollapsibleHeaderDirective,
  IgxCollapsibleButtonDirective } from './collapsible.directives';

@NgModule({
  declarations: [
    IgxCollapsibleComponent,
    IgxCollapsibleHeaderComponent,
    IgxCollapsibleDescriptionDirective,
    IgxCollapsibleTitleDirective,
    IgxCollapsibleBodyDirective,
    IgxCollapsibleButtonDirective,
    IgxCollapsibleHeaderDirective
  ],
  entryComponents: [
  ],
  exports: [
    IgxCollapsibleComponent,
    IgxCollapsibleHeaderComponent,
    IgxCollapsibleDescriptionDirective,
    IgxCollapsibleTitleDirective,
    IgxCollapsibleBodyDirective,
    IgxCollapsibleButtonDirective,
    IgxCollapsibleHeaderDirective
  ],
  imports: [
    CommonModule,
    IgxRippleModule,
    IgxIconModule,
    IgxButtonModule,
    IgxAvatarModule
  ]
})
export class IgxCollapsibleModule {
}
