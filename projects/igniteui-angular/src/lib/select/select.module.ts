import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxIconModule } from '../icon/public_api';
import { IgxDropDownModule } from '../drop-down/public_api';
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
    declarations: [
        IgxSelectComponent,
        IgxSelectFooterDirective,
        IgxSelectGroupComponent,
        IgxSelectHeaderDirective,
        IgxSelectItemComponent,
        IgxSelectItemNavigationDirective,
        IgxSelectToggleIconDirective
    ],
    exports: [
        IgxSelectComponent,
        IgxSelectFooterDirective,
        IgxSelectGroupComponent,
        IgxSelectHeaderDirective,
        IgxSelectItemComponent,
        IgxSelectItemNavigationDirective,
        IgxSelectToggleIconDirective,
        IgxInputGroupModule
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxButtonModule,
        IgxDropDownModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxRippleModule,
        IgxToggleModule,
        ReactiveFormsModule
    ],
    providers: []
})
export class IgxSelectModule { }
