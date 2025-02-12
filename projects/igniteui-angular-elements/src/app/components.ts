import { NgElement, WithProperties } from '@angular/elements';
import {
    IgxActionStripComponent,
    IgxColumnComponent,
    IgxColumnGroupComponent,
    IgxColumnLayoutComponent,
    IgxGridComponent,
    IgxGridEditingActionsComponent,
    IgxGridPinningActionsComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarExporterComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarAdvancedFilteringComponent,
    IgxGridToolbarTitleComponent,
    IgxHierarchicalGridComponent,
    IgxPaginatorComponent,
    IgxPivotGridComponent,
    IgxRowIslandComponent,
    IgxTreeGridComponent,
    IgxPivotDataSelectorComponent
} from 'igniteui-angular';
import { GridType } from 'projects/igniteui-angular/src/lib/grids/common/grid.interface';

import { registerConfig } from "../analyzer/elements.config";
import { createIgxCustomElement, withRegister } from './create-custom-element';
import { IgxGridStateComponent } from '../lib/state.component';
import { IgxIconBroadcastService } from '../lib/icon.broadcast.service';
import { injector } from '../utils/injector-ref';
import { registerComponent } from '../utils/register';

// force-create icon service, TODO: move to initializer or register/define mechanic to avoid side-effect?
const _iconBroadcast: IgxIconBroadcastService = injector.get(IgxIconBroadcastService);

const grid = createIgxCustomElement(IgxGridComponent, { injector, registerConfig });
const IgcGridComponent = withRegister(grid, () => { registerComponent(IgcGridComponent) });

const treeGrid = createIgxCustomElement(IgxTreeGridComponent, { injector, registerConfig });
const IgcTreeGridComponent = withRegister(treeGrid, () => { registerComponent(IgcTreeGridComponent) });

const hGrid = createIgxCustomElement(IgxHierarchicalGridComponent, { injector, registerConfig });
const IgcHierarchicalGridComponent = withRegister(hGrid, () => { registerComponent(IgcHierarchicalGridComponent) });

const pivot = createIgxCustomElement(IgxPivotGridComponent, { injector, registerConfig });
const IgcPivotGridComponent = withRegister(pivot, () => { registerComponent(IgcPivotGridComponent) });

const pivotDataSelector = createIgxCustomElement(IgxPivotDataSelectorComponent, { injector, registerConfig });
const IgcPivotDataSelectorComponent = withRegister(pivotDataSelector, () => { registerComponent(IgcPivotDataSelectorComponent) });

const rowIsland = createIgxCustomElement(IgxRowIslandComponent, { injector, registerConfig });
const IgcRowIslandComponent = withRegister(rowIsland, () => { registerComponent(IgcRowIslandComponent) });

const columnGroup = createIgxCustomElement(IgxColumnGroupComponent, { injector, registerConfig });
const IgcColumnGroupComponent = withRegister(columnGroup, () => { registerComponent(IgcColumnGroupComponent) });

const columnLayout = createIgxCustomElement(IgxColumnLayoutComponent, { injector, registerConfig });
const IgcColumnLayoutComponent = withRegister(columnLayout, () => { registerComponent(IgcColumnLayoutComponent) });

const column = createIgxCustomElement(IgxColumnComponent, { injector, registerConfig });
const IgcColumnComponent = withRegister(column, () => { registerComponent(IgcColumnComponent) });

const paginator = createIgxCustomElement(IgxPaginatorComponent, { injector, registerConfig });
const IgcPaginatorComponent = withRegister(paginator, () => { registerComponent(IgcPaginatorComponent) });

const toolbar = createIgxCustomElement(IgxGridToolbarComponent, { injector, registerConfig });
const IgcGridToolbarComponent = withRegister(toolbar, () => { registerComponent(IgcGridToolbarComponent) });

const actionStrip = createIgxCustomElement(IgxActionStripComponent, { injector, registerConfig });
const IgcActionStripComponent = withRegister(actionStrip, () => { registerComponent(IgcActionStripComponent) });

const statePersistance = createIgxCustomElement(IgxGridStateComponent, { injector, registerConfig });
const IgcGridStateComponent = withRegister(statePersistance, () => { registerComponent(IgcGridStateComponent) });

const editingActions = createIgxCustomElement(IgxGridEditingActionsComponent, { injector, registerConfig });
const IgcGridEditingActionsComponent = withRegister(editingActions, () => { registerComponent(IgcGridEditingActionsComponent) });
const pinningActions = createIgxCustomElement(IgxGridPinningActionsComponent, { injector, registerConfig });
const IgcGridPinningActionsComponent = withRegister(pinningActions, () => { registerComponent(IgcGridPinningActionsComponent) });

const toolbarTitle = createIgxCustomElement(IgxGridToolbarTitleComponent, { injector, registerConfig });
const IgcGridToolbarTitleComponent = withRegister(toolbarTitle, () => { registerComponent(IgcGridToolbarTitleComponent) });

const toolbarActions = createIgxCustomElement(IgxGridToolbarActionsComponent, { injector, registerConfig });
const IgcGridToolbarActionsComponent = withRegister(toolbarActions, () => { registerComponent(IgcGridToolbarActionsComponent) });

const toolbarHiding = createIgxCustomElement(IgxGridToolbarHidingComponent, { injector, registerConfig });
const IgcGridToolbarHidingComponent = withRegister(toolbarHiding, () => { registerComponent(IgcGridToolbarHidingComponent) });

const toolbarPinning = createIgxCustomElement(IgxGridToolbarPinningComponent, { injector, registerConfig });
const IgcGridToolbarPinningComponent = withRegister(toolbarPinning, () => { registerComponent(IgcGridToolbarPinningComponent) });

const toolbarExport = createIgxCustomElement(IgxGridToolbarExporterComponent, { injector, registerConfig });
const IgcGridToolbarExporterComponent = withRegister(toolbarExport, () => { registerComponent(IgcGridToolbarExporterComponent) });

const toolbarFilter = createIgxCustomElement(IgxGridToolbarAdvancedFilteringComponent, { injector, registerConfig });
const IgcGridToolbarAdvancedFilteringComponent = withRegister(toolbarFilter, () => { registerComponent(IgcGridToolbarAdvancedFilteringComponent) });

export {
    IgcGridComponent,
    IgcTreeGridComponent,
    IgcHierarchicalGridComponent,
    IgcPivotGridComponent,
    IgcPivotDataSelectorComponent,
    IgcRowIslandComponent,
    IgcColumnGroupComponent,
    IgcColumnLayoutComponent,
    IgcColumnComponent,
    IgcPaginatorComponent,
    IgcGridToolbarComponent,
    IgcActionStripComponent,
    IgcGridStateComponent,
    IgcGridEditingActionsComponent,
    IgcGridPinningActionsComponent,
    IgcGridToolbarTitleComponent,
    IgcGridToolbarActionsComponent,
    IgcGridToolbarHidingComponent,
    IgcGridToolbarPinningComponent,
    IgcGridToolbarExporterComponent,
    IgcGridToolbarAdvancedFilteringComponent,
}

// TODO: Custom elements JSON as well
declare global {
    type IgxGridElement = NgElement & WithProperties<GridType>;
    type IgxTreeGridElement = NgElement & WithProperties<IgxTreeGridComponent>;
    interface HTMLElementTagNameMap {
        'igc-grid': NgElement & WithProperties<GridType>;
        'igc-tree-grid': NgElement & WithProperties<IgxTreeGridElement>;
        'igc-paginator': NgElement & WithProperties<IgxPaginatorComponent>;
        'igc-grid-state': NgElement & WithProperties<IgxGridStateComponent>;
    }
}
