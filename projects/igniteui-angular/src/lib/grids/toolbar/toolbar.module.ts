import { NgModule } from '@angular/core';
import { IgxGridSharedModules } from '../common/shared.module';
import { IgxColumnHidingModule } from '../hiding/hiding.module';
import { IgxColumnPinningModule } from '../pinning/pinning.module';
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
    IgxGridToolbarTitleDirective
} from './common';



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
        IgxGridToolbarTitleDirective
    ],
    imports: [
        IgxColumnActionsModule,
        IgxColumnHidingModule,
        IgxColumnPinningModule,
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
        IgxGridToolbarTitleDirective
    ]
})
export class IgxGridToolbarModule {}
