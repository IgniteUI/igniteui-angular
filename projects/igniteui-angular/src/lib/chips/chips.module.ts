import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon/index';
import { IgxChipComponent, IgxChipComponentExporterDirective } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { IgxDragDropModule } from '../directives/dragdrop/dragdrop.directive';

@NgModule({
  declarations: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxChipComponentExporterDirective
  ],
  entryComponents: [
  ],
  exports: [
    IgxChipsAreaComponent,
    IgxChipComponent,
    IgxChipComponentExporterDirective
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
