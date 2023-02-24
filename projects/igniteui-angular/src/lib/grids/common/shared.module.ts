import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';





import { IgxToggleModule } from '../../directives/toggle/toggle.directive';










import { IgxSelectModule } from '../../select/select.module';
import { IgxDropDownModule } from '../../drop-down/public_api';



import { IgxTimePickerModule } from '../../time-picker/time-picker.component';



@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    IgxToggleModule,
    IgxDropDownModule,
    IgxSelectModule,
    IgxTimePickerModule
],
    exports: [
    CommonModule,
    FormsModule,
    IgxToggleModule,
    IgxDropDownModule,
    IgxSelectModule,
    IgxTimePickerModule
]
})
export class IgxGridSharedModules {}
