import { NgModule } from '@angular/core';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { IgxPrefixDirective} from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
  exports: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxPrefixDirective,
    IgxSuffixDirective
  ],
  imports: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxPrefixDirective,
    IgxSuffixDirective
  ]
})
export class IgxChipsModule { }
