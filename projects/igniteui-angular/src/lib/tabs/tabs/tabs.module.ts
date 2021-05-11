import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxTabHeaderComponent } from './tab-header.component';
import { IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective } from './tabs.directives';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabContentComponent } from './tab-content.component';
import { IgxTabsComponent } from './tabs.component';
import { IgxPrefixModule } from '../../directives/prefix/prefix.directive';
import { IgxSuffixModule } from '../../directives/suffix/suffix.directive';

/** @hidden */
@NgModule({
    declarations: [
        IgxTabsComponent,
        IgxTabItemComponent,
        IgxTabHeaderComponent,
        IgxTabContentComponent,
        IgxTabHeaderLabelDirective,
        IgxTabHeaderIconDirective
    ],
    exports:  [
        IgxTabsComponent,
        IgxTabItemComponent,
        IgxTabHeaderComponent,
        IgxTabContentComponent,
        IgxTabHeaderLabelDirective,
        IgxTabHeaderIconDirective,
        IgxPrefixModule,
        IgxSuffixModule
    ],
    imports: [CommonModule, IgxIconModule, IgxRippleModule, IgxPrefixModule, IgxSuffixModule]
})
export class IgxTabsModule {
}
