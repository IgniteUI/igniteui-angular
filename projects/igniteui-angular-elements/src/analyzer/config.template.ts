import { IgxHierarchicalGridComponent, IgxPivotDataSelectorComponent, IgxPivotGridComponent, IgxRowIslandComponent, IgxTreeGridComponent } from '../../../igniteui-angular/src/public_api';
import { IgxGridComponent } from '../../../igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxGridToolbarAdvancedFilteringComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-advanced-filtering.component";
import { IgxGridToolbarExporterComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component";
import { IgxGridToolbarHidingComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component";
import { IgxGridToolbarPinningComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component";
import { IgxGridToolbarComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component";
import { IgxPaginatorComponent } from "../../../igniteui-angular/src/lib/paginator/paginator.component";
import { IgxColumnComponent } from "../../../igniteui-angular/src/lib/grids/columns/column.component";
import { IgxColumnGroupComponent } from "../../../igniteui-angular/src/lib/grids/columns/column-group.component";
import { IgxColumnLayoutComponent } from "../../../igniteui-angular/src/lib/grids/columns/column-layout.component";
import { IgxToolbarToken } from "../../../igniteui-angular/src/lib/grids/toolbar/token";
import { IgxActionStripComponent } from "../../../igniteui-angular/src/lib/action-strip/action-strip.component";
import { IgxGridEditingActionsComponent } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-editing-actions.component";
import { IgxGridActionsBaseDirective } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-actions-base.directive";
import { IgxGridPinningActionsComponent } from "../../../igniteui-angular/src/lib/action-strip/grid-actions/grid-pinning-actions.component";
import { IgxGridToolbarTitleComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/common";
import { IgxGridToolbarActionsComponent } from "../../../igniteui-angular/src/lib/grids/toolbar/common";
import { IgxGridStateComponent } from '../../../igniteui-angular/src/lib/grids/state.directive';

export const registerComponents = [
    IgxGridComponent,
    IgxHierarchicalGridComponent,
    IgxTreeGridComponent,
    IgxPivotGridComponent,
    IgxPivotDataSelectorComponent
];
