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
    IgxGridToolbarActionsComponent,
    IgxGridToolbarDirective,
    IgxGridToolbarTitleComponent
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
        IgxGridToolbarActionsComponent,
        IgxGridToolbarAdvancedFilteringComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarExporterComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarTitleComponent,
        IgxGridToolbarDirective
    ],
    imports: [
        IgxColumnActionsModule,
        IgxGridSharedModules
    ],
    exports: [
        IgxCSVTextDirective,
        IgxExcelTextDirective,
        IgxGridToolbarActionsComponent,
        IgxGridToolbarAdvancedFilteringComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarExporterComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarTitleComponent,
        IgxGridToolbarDirective
    ]
})
export class IgxGridToolbarModule { }
