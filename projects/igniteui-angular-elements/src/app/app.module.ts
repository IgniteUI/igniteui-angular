
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import {
    IgxActionStripComponent,
    IgxColumnComponent,
    IgxColumnGroupComponent,
    IgxColumnLayoutComponent,
    IgxGridColumnModule,
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
import { IgxCustomNgElementStrategyFactory } from './custom-strategy';
import { GridType } from 'projects/igniteui-angular/src/lib/grids/common/grid.interface';
// import { WrapperComponent } from './wrapper/wrapper.component';
// import { ChildStandaloneComponent } from './wrapper/child-standalone/child-standalone.component';

import { registerConfig } from "../analyzer/elements.config";
import { createIgxCustomElement } from './create-custom-element';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [
  ],
//   bootstrap: []
})
export class AppModule {

  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    // const wrapper = createCustomElement(WrapperComponent, { injector: this.injector });
    // customElements.define("app-wrapper", wrapper);

    // const child = createCustomElement(ChildStandaloneComponent, { injector: this.injector });
    // customElements.define("app-child-standalone", child);

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
    const editingActions = createIgxCustomElement(IgxGridEditingActionsComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-editing-actions", editingActions);
    const pinningActions = createIgxCustomElement(IgxGridPinningActionsComponent, { injector: this.injector, registerConfig });
    customElements.define("igc-grid-pinning-actions", pinningActions);

    /**
     * WARN: createCustomElement default setup is ONLY FOR ROOT ELEMENTS!
     * TODO: MUST be the parent injector!!!!! Otherwise NullInjectorError: No provider for IgxToolbarToken!
     * TODO: In order to provide the parent injector correctly, this can ONLY be registered/initialized
     * after the parent is CREATED - i.e. this should be a custom form of *child def for igc-grid-toolbar*
     * which means custom factory more than likely to handle the component creation process.
     */
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
    }
  }
