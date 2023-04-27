import { IgxCSVTextDirective, IgxExcelTextDirective, IgxGridToolbarActionsComponent, IgxGridToolbarDirective, IgxGridToolbarTitleComponent } from './common';
import { IgxGridToolbarAdvancedFilteringComponent } from './grid-toolbar-advanced-filtering.component';
import { IgxGridToolbarExporterComponent } from './grid-toolbar-exporter.component';
import { IgxGridToolbarHidingComponent } from './grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from './grid-toolbar-pinning.component';
import { IgxGridToolbarComponent } from './grid-toolbar.component';

/* NOTE: Grid toolbar directives collection for ease-of-use import in standalone components scenario */
export const IGX_GRID_TOOLBAR_DIRECTIVES = [
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
] as const;
