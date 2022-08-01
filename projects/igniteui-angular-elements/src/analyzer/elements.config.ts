import { IgxPivotGridComponent } from 'igniteui-angular';
import { IgxGridComponent } from '../../../igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxGridToolbarAdvancedFilteringComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-advanced-filtering.component";
import { IgxGridToolbarExporterComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component";
import { IgxGridToolbarHidingComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component";
import { IgxGridToolbarPinningComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component";
import { IgxGridToolbarComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component";
import { IgxPaginatorComponent } from "../../../igniteui-angular/src/lib/paginator/paginator.component";
// this is a comment
export const registerComponents = [
    IgxGridComponent,
    IgxPivotGridComponent
];
//// WARNING: Code below this line is auto-generated and any modifications will be overwritten
export var registerConfig = [
    { component: IgxGridComponent, parents: [], contentQueries: [{ property: "toolbar", childType: IgxGridToolbarComponent, isQueryList: true }, { property: "paginationComponents", childType: IgxPaginatorComponent, isQueryList: true }] },
    { component: IgxPivotGridComponent, parents: [], contentQueries: [{ property: "toolbar", childType: IgxGridToolbarComponent, isQueryList: true }, { property: "paginationComponents", childType: IgxPaginatorComponent, isQueryList: true }] },
    { component: IgxGridToolbarAdvancedFilteringComponent, parents: [IgxGridToolbarComponent], contentQueries: [] },
    { component: IgxGridToolbarExporterComponent, parents: [IgxGridToolbarComponent], contentQueries: [] },
    { component: IgxGridToolbarHidingComponent, parents: [IgxGridToolbarComponent], contentQueries: [] },
    { component: IgxGridToolbarPinningComponent, parents: [IgxGridToolbarComponent], contentQueries: [] },
    { component: IgxGridToolbarComponent, parents: [IgxGridComponent, IgxPivotGridComponent], contentQueries: [] },
    { component: IgxPaginatorComponent, parents: [IgxGridComponent, IgxPivotGridComponent], contentQueries: [] }
];
