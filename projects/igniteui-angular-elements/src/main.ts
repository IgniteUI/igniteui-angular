
// V2 TEST:
// import { importProvidersFrom } from '@angular/core';
// import { createApplication } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { IgxColumnComponent, IgxGridComponent } from 'igniteui-angular';
// import { ELEMENTS_TOKEN } from 'igniteui-angular/src/lib/core/utils';
// import { registerConfig } from './analyzer/elements.config';
// import { createIgxCustomElement } from './app/create-custom-element';
// import { IgxIconBroadcastService } from './lib/icon.broadcast.service';
// const providers = [
//     importProvidersFrom(BrowserAnimationsModule),
//     { provide: ELEMENTS_TOKEN, useValue: true },
//     IgxIconBroadcastService
// ]
// createApplication({ providers }).then(({ injector }) => {
//     const grid = createIgxCustomElement<IgxGridComponent>(IgxGridComponent, { injector, registerConfig });
//     customElements.define("igc-grid", grid);
//     const column = createIgxCustomElement<IgxColumnComponent>(IgxColumnComponent, { injector, registerConfig });
//     customElements.define("igc-column", column);
// });

// V3
import * as components from './app/components';
import { defineComponents } from './utils/register';

defineComponents(...Object.values(components));
// defineComponents(
//     components.IgcGridComponent,
//     components.IgcTreeGridComponent,
//     components.IgcHierarchicalGridComponent,
//     components.IgcPivotGridComponent,
//     components.IgcPivotDataSelectorComponent,
//     components.IgcRowIslandComponent,
//     components.IgcColumnGroupComponent,
//     components.IgcColumnLayoutComponent,
//     components.IgcColumnComponent,
//     components.IgcPaginatorComponent,
//     components.IgcGridToolbarComponent,
//     components.IgcActionStripComponent,
//     components.IgcGridStateComponent,
//     components.IgcGridEditingActionsComponent,
//     components.IgcGridPinningActionsComponent,
//     components.IgcGridToolbarTitleComponent,
//     components.IgcGridToolbarActionsComponent,
//     components.IgcGridToolbarHidingComponent,
//     components.IgcGridToolbarPinningComponent,
//     components.IgcGridToolbarExporterComponent,
//     components.IgcGridToolbarAdvancedFilteringComponent,
// );

export * from './app/components';

/** Export Public API */
export * from './public_api';
