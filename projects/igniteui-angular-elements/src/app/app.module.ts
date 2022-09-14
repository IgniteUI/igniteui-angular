
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import {
    IgxColumnComponent,
    IgxGridColumnModule,
    IgxGridComponent,
    IgxGridModule,
    IgxGridToolbarActionsDirective,
    IgxGridToolbarComponent,
    IgxGridToolbarExporterComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxHierarchicalGridComponent,
    IgxPaginatorComponent,
    IgxPivotGridComponent,
    IgxRowIslandComponent,
    IgxTreeGridComponent
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
    customElements.define("igx-grid", grid);
    // const column = createCustomElement<IgxColumnComponent>(IgxColumnComponent, { injector: this.injector });
    // customElements.define("igx-column", column);

    const treegrid = createCustomElement(IgxTreeGridComponent, { injector: this.injector });
    customElements.define("igx-tree-grid", treegrid);

    const hgrid = createIgxCustomElement(IgxHierarchicalGridComponent, { injector: this.injector, registerConfig });
    customElements.define("igx-hierarchical-grid", hgrid);

    const ri = createIgxCustomElement(IgxRowIslandComponent, { injector: this.injector, registerConfig } );
    customElements.define("igx-row-island", ri);

    const pivot = createCustomElement(IgxPivotGridComponent, { injector: this.injector });
    customElements.define("igx-pivot-grid", pivot);

    const pager = createIgxCustomElement(IgxPaginatorComponent, { injector: this.injector, registerConfig });
    customElements.define("igx-paginator", pager);

    const toolbar = createIgxCustomElement(IgxGridToolbarComponent, { injector: this.injector, registerConfig });
    customElements.define("igx-grid-toolbar", toolbar);

    /**
     * WARN: createCustomElement default setup is ONLY FOR ROOT ELEMENTS!
     * TODO: MUST be the parent injector!!!!! Otherwise NullInjectorError: No provider for IgxToolbarToken!
     * TODO: In order to provide the parent injector correctly, this can ONLY be registered/initialized
     * after the parent is CREATED - i.e. this should be a custom form of *child def for igx-grid-toolbar*
     * which means custom factory more than likely to handle the component creation process.
     */
    const toolbarHiding = createIgxCustomElement(IgxGridToolbarHidingComponent, { injector: this.injector, registerConfig });
    customElements.define("igx-grid-toolbar-hiding", toolbarHiding);

    const toolbarPinning = createIgxCustomElement(IgxGridToolbarPinningComponent, { injector: this.injector, registerConfig });
    customElements.define("igx-grid-toolbar-pinning", toolbarPinning);

    const toolbarExport = createIgxCustomElement(IgxGridToolbarExporterComponent, { injector: this.injector, registerConfig });
    customElements.define("igx-grid-toolbar-exporter", toolbarExport);

    // const toolbarActions = createCustomElement(IgxGridToolbarActionsDirective, { injector: this.injector, strategyFactory: new IgxCustomNgElementStrategyFactory(IgxGridToolbarActionsDirective, this.injector) });
    // customElements.define("igx-grid-toolbar-actions", toolbarActions);

    // const column = createCustomElement(IgxColumnComponent, { injector: this.injector });
    // customElements.define("igx-column", column);
  }

}


// TODO: Custom elements JSON as well

declare global {
    type IgxGridElement = NgElement & WithProperties<GridType>;
    type IgxTreeGridElement = NgElement & WithProperties<IgxTreeGridComponent>;
    interface HTMLElementTagNameMap {
      'igx-grid': NgElement & WithProperties<GridType>;
      'igx-tree-grid': NgElement & WithProperties<IgxTreeGridElement>;
    }
  }
