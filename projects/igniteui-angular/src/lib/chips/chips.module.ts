import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon/index';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { IgxDragDropModule } from '../directives/drag-drop/drag-drop.directive';
import { IgxPrefixModule, IgxPrefixDirective} from '../directives/prefix/prefix.directive';
import { IgxSuffixModule, IgxSuffixDirective } from '../directives/suffix/suffix.directive';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxChipsAreaComponent,
    IgxChipComponent
  ],
  exports: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxPrefixDirective,
    IgxSuffixDirective
  ],
  imports: [
    CommonModule,
    IgxRippleModule,
    IgxIconModule,
    IgxButtonModule,
    IgxAvatarModule,
    IgxDragDropModule,
    IgxPrefixModule,
    IgxSuffixModule
  ]
})
export class IgxChipsModule { }
