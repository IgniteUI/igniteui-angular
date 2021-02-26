import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxTabHeaderNewComponent } from './tab-header.component';
import { IgxTabItemNewComponent } from './tab-item.component';
import { IgxTabPanelNewComponent } from './tab-panel.component';
import { IgxTabsNewComponent } from './tabs.component';

/** @hidden */
@NgModule({
    declarations: [
        IgxTabsNewComponent,
        IgxTabItemNewComponent,
        IgxTabHeaderNewComponent,
        IgxTabPanelNewComponent
    ],
    exports:  [
        IgxTabsNewComponent,
        IgxTabItemNewComponent,
        IgxTabHeaderNewComponent,
        IgxTabPanelNewComponent
    ],
    imports: [CommonModule, IgxIconModule, IgxRippleModule]
})
export class IgxTabsNewModule {
}
