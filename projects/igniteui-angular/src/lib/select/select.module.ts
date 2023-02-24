import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IgxDropDownModule } from '../drop-down/public_api';
import { IgxToggleModule } from './../directives/toggle/toggle.directive';




import { IgxSelectComponent, IgxSelectToggleIconDirective, IgxSelectHeaderDirective, IgxSelectFooterDirective } from './select.component';
import { IgxSelectItemComponent } from './select-item.component';
import { IgxSelectItemNavigationDirective } from './select-navigation.directive';
import { IgxSelectGroupComponent } from './select-group.component';

/** @hidden */
@NgModule({
    exports: [
    IgxSelectComponent,
    IgxSelectFooterDirective,
    IgxSelectGroupComponent,
    IgxSelectHeaderDirective,
    IgxSelectItemComponent,
    IgxSelectItemNavigationDirective,
    IgxSelectToggleIconDirective
],
    imports: [
    CommonModule,
    FormsModule,
    IgxDropDownModule,
    IgxToggleModule,
    ReactiveFormsModule,
    IgxSelectComponent,
    IgxSelectFooterDirective,
    IgxSelectGroupComponent,
    IgxSelectHeaderDirective,
    IgxSelectItemComponent,
    IgxSelectItemNavigationDirective,
    IgxSelectToggleIconDirective
],
    providers: []
})
export class IgxSelectModule { }
