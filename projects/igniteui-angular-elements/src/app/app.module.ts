
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GridType } from 'projects/igniteui-angular/src/lib/grids/common/grid.interface';

import { registerConfig } from "../analyzer/elements.config";
import { createIgxCustomElement } from './create-custom-element';
import { IgxGridStateComponent } from '../lib/state.component';
import { ELEMENTS_TOKEN } from 'igniteui-angular/src/lib/core/utils';
import { IgxIconBroadcastService } from '../lib/icon.broadcast.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: ELEMENTS_TOKEN, useValue: true },
    IgxIconBroadcastService
  ],
//   bootstrap: []
})
export class AppModule {

  constructor(private injector: Injector, private _iconBroadcast: IgxIconBroadcastService) {}

  ngDoBootstrap() {

    const grid = createIgxCustomElement<IgxGridComponent>(IgxGridComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid", grid);

    const treegrid = createIgxCustomElement(IgxTreeGridComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-tree-grid", treegrid);

    const hgrid = createIgxCustomElement(IgxHierarchicalGridComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-hierarchical-grid", hgrid);

    const pivot = createIgxCustomElement(IgxPivotGridComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-pivot-grid", pivot);

    const pivotDataSelector = createIgxCustomElement(IgxPivotDataSelectorComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-pivot-data-selector", pivotDataSelector);

    const ri = createIgxCustomElement(IgxRowIslandComponent, { injector: this.injector, registerConfig } );
    customElements.define("igc-row-island", ri);

    const columnGroups = createIgxCustomElement<IgxColumnGroupComponent>(IgxColumnGroupComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-column-group", columnGroups);

    const columnLayout = createIgxCustomElement<IgxColumnLayoutComponent>(IgxColumnLayoutComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-column-layout", columnLayout);

    const column = createIgxCustomElement<IgxColumnComponent>(IgxColumnComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-column", column);

    const pager = createIgxCustomElement(IgxPaginatorComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-paginator", pager);

    const toolbar = createIgxCustomElement(IgxGridToolbarComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-toolbar", toolbar);

    const actionStrip = createIgxCustomElement(IgxActionStripComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-action-strip", actionStrip);

    const statePersistance = createIgxCustomElement(IgxGridStateComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-state", statePersistance);

    const editingActions = createIgxCustomElement(IgxGridEditingActionsComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-editing-actions", editingActions);
    const pinningActions = createIgxCustomElement(IgxGridPinningActionsComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-pinning-actions", pinningActions);

    const toolbarTitle = createIgxCustomElement(IgxGridToolbarTitleComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-toolbar-title", toolbarTitle);

    const toolbarActions = createIgxCustomElement(IgxGridToolbarActionsComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-toolbar-actions", toolbarActions);

    const toolbarHiding = createIgxCustomElement(IgxGridToolbarHidingComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-toolbar-hiding", toolbarHiding);

    const toolbarPinning = createIgxCustomElement(IgxGridToolbarPinningComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-toolbar-pinning", toolbarPinning);

    const toolbarExport = createIgxCustomElement(IgxGridToolbarExporterComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-toolbar-exporter", toolbarExport);

    const toolbarFilter = createIgxCustomElement(IgxGridToolbarAdvancedFilteringComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-toolbar-advanced-filtering", toolbarFilter);
  }

}


// TODO: Custom elements JSON as well

declare global {
    type IgxGridElement = NgElement & WithProperties<GridType>;
    type IgxTreeGridElement = NgElement & WithProperties<IgxTreeGridComponent>;
    interface HTMLElementTagNameMap {
      'igc-grid': NgElement & WithProperties<GridType>;
      'igc-tree-grid': NgElement & WithProperties<IgxTreeGridElement>;
      'igc-paginator': NgElement & WithProperties<IgxPaginatorComponent>;
    }
  }
