import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxBottomNavHeaderComponent } from './bottom-nav-header.component';
import { IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective } from './bottom-nav.directives';
import { IgxBottomNavItemComponent } from './bottom-nav-item.component';
import { IgxBottomNavContentComponent } from './bottom-nav-content.component';
import { IgxBottomNavComponent } from './bottom-nav.component';

/** @hidden */
@NgModule({
    declarations: [
        IgxBottomNavComponent,
        IgxBottomNavItemComponent,
        IgxBottomNavHeaderComponent,
        IgxBottomNavContentComponent,
        IgxBottomNavHeaderLabelDirective,
        IgxBottomNavHeaderIconDirective
    ],
    exports:  [
        IgxBottomNavComponent,
        IgxBottomNavItemComponent,
        IgxBottomNavHeaderComponent,
        IgxBottomNavContentComponent,
        IgxBottomNavHeaderLabelDirective,
        IgxBottomNavHeaderIconDirective
    ],
    imports: [CommonModule, IgxIconModule, IgxRippleModule]
})
export class IgxBottomNavModule {
}
