import { NgModule } from '@angular/core';
import { IgxGridSharedModules } from '../common/shared.module';
import { IgxColumnActionsModule } from '../column-actions/column-actions.module';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridToolbarAdvancedFilteringComponent } from './grid-toolbar-advanced-filtering.component';
import { IgxGridToolbarExporterComponent } from './grid-toolbar-exporter.component';
import { IgxGridToolbarHidingComponent } from './grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from './grid-toolbar-pinning.component';
import {
    IgxCSVTextDirective,
    IgxExcelTextDirective,
    IgxGridToolbarActionsDirective,
    IgxGridToolbarDirective,
    IgxGridToolbarTitleDirective
} from './common';
export * from './grid-toolbar.component';
export * from './common';
export * from './grid-toolbar-advanced-filtering.component';
export * from './grid-toolbar-exporter.component';
export * from './grid-toolbar-hiding.component';
export * from './grid-toolbar-pinning.component';


@NgModule({
    declarations: [
        IgxCSVTextDirective,
        IgxExcelTextDirective,
        IgxGridToolbarActionsDirective,
        IgxGridToolbarAdvancedFilteringComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarExporterComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarTitleDirective,
        IgxGridToolbarDirective
    ],
    imports: [
        IgxColumnActionsModule,
        IgxGridSharedModules
    ],
    exports: [
        IgxCSVTextDirective,
        IgxExcelTextDirective,
        IgxGridToolbarActionsDirective,
        IgxGridToolbarAdvancedFilteringComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarExporterComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarTitleDirective,
        IgxGridToolbarDirective
    ]
})
export class IgxGridToolbarModule { }
