
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import {
    IgxColumnComponent,
    IgxGridColumnModule,
    IgxGridComponent,
    IgxGridModule,
    IgxGridToolbarComponent,
    IgxGridToolbarHidingComponent,
    IgxHierarchicalGridComponent,
    IgxPaginatorComponent,
    IgxPivotGridComponent,
    IgxTreeGridComponent
} from 'igniteui-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { WrapperComponent } from './wrapper/wrapper.component';
// import { ChildStandaloneComponent } from './wrapper/child-standalone/child-standalone.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [
  ]
})
export class AppModule {

  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    // const wrapper = createCustomElement(WrapperComponent, { injector: this.injector });
    // customElements.define("app-wrapper", wrapper);

    // const child = createCustomElement(ChildStandaloneComponent, { injector: this.injector });
    // customElements.define("app-child-standalone", child);

    const grid = createCustomElement<IgxGridComponent>(IgxGridComponent, { injector: this.injector });
    customElements.define("igx-grid", grid);

    const treegrid = createCustomElement(IgxTreeGridComponent, { injector: this.injector });
    customElements.define("igx-tree-grid", treegrid);

    // const hgrid = createCustomElement(IgxHierarchicalGridComponent, { injector: this.injector });
    // customElements.define("igx-hierarchical-grid", hgrid);

    const pivot = createCustomElement(IgxPivotGridComponent, { injector: this.injector });
    customElements.define("igx-pivot-grid", pivot);

    const pager = createCustomElement(IgxPaginatorComponent, { injector: this.injector });
    customElements.define("igx-paginator", pager);

    const toolbar = createCustomElement(IgxGridToolbarComponent, { injector: this.injector });
    customElements.define("igx-grid-toolbar", toolbar);

    // const toolbarActions = createCustomElement(IgxGridToolbarActionsDirective, { injector: this.injector });
    // customElements.define("igx-grid-toolbar-actions", toolbarActions);

    // const toolbarHiding = createCustomElement(IgxGridToolbarHidingComponent, { injector: this.injector });
    // customElements.define("igx-grid-toolbar-hiding", toolbarHiding);

    // const column = createCustomElement(IgxColumnComponent, { injector: this.injector });
    // customElements.define("igx-column", column);
  }

}
