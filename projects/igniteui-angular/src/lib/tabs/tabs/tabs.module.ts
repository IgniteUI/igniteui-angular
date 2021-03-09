import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxTabHeaderComponent } from './tab-header.component';
import {
    IgxLeftButtonStyleDirective, IgxRightButtonStyleDirective, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective
} from './tabs.directives';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabPanelComponent } from './tab-panel.component';
import { IgxTabsComponent } from './tabs.component';

/** @hidden */
@NgModule({
    declarations: [
        IgxTabsComponent,
        IgxTabItemComponent,
        IgxTabHeaderComponent,
        IgxTabPanelComponent,
        IgxTabHeaderLabelDirective,
        IgxTabHeaderIconDirective,
        IgxRightButtonStyleDirective,
        IgxLeftButtonStyleDirective
    ],
    exports:  [
        IgxTabsComponent,
        IgxTabItemComponent,
        IgxTabHeaderComponent,
        IgxTabPanelComponent,
        IgxTabHeaderLabelDirective,
        IgxTabHeaderIconDirective
    ],
    imports: [CommonModule, IgxIconModule, IgxRippleModule]
})
export class IgxTabsModule {
}
