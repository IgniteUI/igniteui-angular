import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cloneArray } from '../core/utils';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxDragDropModule } from '../directives/dragdrop/dragdrop.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon';
import { IgxSuffixConnectorDirective } from './suffixConnector.directive';
import { IgxPrefixConnectorDirective } from './prefixConnector.directive';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';

@NgModule({
  declarations: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxPrefixConnectorDirective,
    IgxSuffixConnectorDirective
  ],
  entryComponents: [
  ],
  exports: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxPrefixConnectorDirective,
    IgxSuffixConnectorDirective
  ],
  imports: [
    CommonModule,
    IgxRippleModule,
    IgxIconModule,
    IgxButtonModule,
    IgxAvatarModule
  ]
})
export class IgxChipsModule {
    public static forRoot() {
        return {
            ngModule: IgxChipsModule
        };
    }
}
