import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxBottomNavHeaderComponent } from './bottom-nav-header.component';
import { IgxBottomNavItemComponent } from './bottom-nav-item.component';
import { IgxBottomNavPanelComponent } from './bottom-nav-panel.component';
import { IgxBottomNavNewComponent } from './bottom-nav.component';

/** @hidden */
@NgModule({
    declarations: [
        IgxBottomNavNewComponent,
        IgxBottomNavItemComponent,
        IgxBottomNavHeaderComponent,
        IgxBottomNavPanelComponent
    ],
    exports:  [
        IgxBottomNavNewComponent,
        IgxBottomNavItemComponent,
        IgxBottomNavHeaderComponent,
        IgxBottomNavPanelComponent
    ],
    imports: [CommonModule, IgxIconModule, IgxRippleModule]
})
export class IgxBottomNavNewModule {
}
