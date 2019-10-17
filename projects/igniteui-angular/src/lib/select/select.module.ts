import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxIconModule } from '../icon/index';
import { IgxDropDownModule } from './../drop-down/index';
import { IgxToggleModule } from './../directives/toggle/toggle.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxButtonModule } from '../directives/button/button.directive';

import { IgxSelectComponent, IgxSelectToggleIconDirective, IgxSelectHeaderDirective, IgxSelectFooterDirective } from './select.component';
import { IgxSelectItemComponent } from './select-item.component';
import { IgxSelectItemNavigationDirective } from './select-navigation.directive';
import { IgxSelectGroupComponent } from './select-group.component';

/** @hidden */
@NgModule({
    declarations: [IgxSelectComponent, IgxSelectItemComponent, IgxSelectItemNavigationDirective,
        IgxSelectToggleIconDirective, IgxSelectGroupComponent, IgxSelectHeaderDirective,
        IgxSelectFooterDirective],
    exports: [IgxSelectComponent, IgxSelectItemComponent, IgxSelectItemNavigationDirective,
         IgxSelectToggleIconDirective, IgxSelectGroupComponent, IgxSelectHeaderDirective,
         IgxSelectFooterDirective],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxToggleModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
    providers: []
})
export class IgxSelectModule { }
