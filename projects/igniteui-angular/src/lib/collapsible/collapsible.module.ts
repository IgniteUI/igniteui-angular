import { IgxCollapsibleComponent } from './collapsible.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon';


@NgModule({
  declarations: [
    IgxCollapsibleComponent
  ],
  entryComponents: [
  ],
  exports: [
    IgxCollapsibleComponent
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
