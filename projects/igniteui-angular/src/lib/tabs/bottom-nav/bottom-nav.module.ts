import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxBottomNavHeaderComponent } from './bottom-nav-header.component';
import { IgxBottomNavItemComponent } from './bottom-nav-item.component';
import { IgxBottomNavPanelComponent } from './bottom-nav-panel.component';
import { IgxBottomNavComponent } from './bottom-nav.component';

/** @hidden */
@NgModule({
    declarations: [
        IgxBottomNavComponent,
        IgxBottomNavItemComponent,
        IgxBottomNavHeaderComponent,
        IgxBottomNavPanelComponent
    ],
    exports:  [
        IgxBottomNavComponent,
        IgxBottomNavItemComponent,
        IgxBottomNavHeaderComponent,
        IgxBottomNavPanelComponent
    ],
    imports: [CommonModule, IgxIconModule, IgxRippleModule]
})
export class IgxBottomNavModule {
}
