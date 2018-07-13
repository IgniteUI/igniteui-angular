import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cloneArray } from '../core/utils';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon/index';
import { IgxConnectorDirective } from './connector.directive';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { IgxDragDropModule } from '../directives/dragdrop/dragdrop.directive';

@NgModule({
  declarations: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxConnectorDirective
  ],
  entryComponents: [
  ],
  exports: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxConnectorDirective
  ],
  imports: [
    CommonModule,
    IgxRippleModule,
    IgxIconModule,
    IgxButtonModule,
    IgxAvatarModule,
    IgxDragDropModule
  ]
})
export class IgxChipsModule {
    public static forRoot() {
        return {
            ngModule: IgxChipsModule
        };
    }
}
