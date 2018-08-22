import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon';
import { IgxCollapsibleComponent, IgxCollapsibleDescriptionDirective, IgxCollapsibleTitleDirective,
     IgxCollapsibleBodyDirective } from './collapsible.component';
import { IgxCollapsibleHeaderComponent } from './collapsible-header.component';


@NgModule({
  declarations: [
    IgxCollapsibleComponent,
    IgxCollapsibleHeaderComponent,
    IgxCollapsibleDescriptionDirective,
    IgxCollapsibleTitleDirective,
    IgxCollapsibleBodyDirective

  ],
  entryComponents: [
  ],
  exports: [
    IgxCollapsibleComponent,
    IgxCollapsibleHeaderComponent,
    IgxCollapsibleDescriptionDirective,
    IgxCollapsibleTitleDirective,
    IgxCollapsibleBodyDirective
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
    public static forRoot() {
        return {
            ngModule: IgxCollapsibleModule
        };
    }
}
