import { NgModule } from '@angular/core';
// tslint:disable-next-line: max-line-length
import { IgxButtonModule, IgxDividerModule, IgxGridModule, IgxTabsModule, IgxToggleModule, IgxIconModule } from 'igniteui-angular';
import { IgxBarSeriesModule, IgxCategoryChartModule, IgxCategoryXAxisModule,
    IgxDataChartCategoryModule, IgxDataChartComponent, IgxDataChartCoreModule,
    IgxDataChartInteractivityModule, IgxDataChartScatterModule, IgxDataChartStackedModule,
    IgxItemLegendComponent, IgxItemLegendModule, IgxLegendComponent, IgxLegendModule,
    IgxNumericXAxisModule, IgxNumericYAxisModule, IgxPieChartComponent } from 'igniteui-angular-charts';
import { IgxPieChartModule } from 'igniteui-angular-charts/';
import { IgxChartMenuComponent } from './context-menu/chart-dialog/chart-dialog.component';
import { IgxContextMenuComponent } from './context-menu/context-menu.component';
import { IgxContextMenuDirective } from './context-menu/igx-context-menu.directive';
import { IgxChartIntegrationDirective } from './directives/chart-integration/chart-integration.directive';
import { IgxConditionalFormattingDirective } from './directives/conditional-formatting/conditional-formatting.directive';
import { SvgPipe } from './pipes/svg.pipe';



@NgModule({
  declarations: [
      IgxConditionalFormattingDirective,
      IgxChartIntegrationDirective,
      IgxContextMenuDirective,
      IgxContextMenuComponent,
      IgxChartMenuComponent,
      SvgPipe
  ],
  imports: [
      IgxButtonModule,
      IgxDividerModule,
      IgxGridModule,
      IgxTabsModule,
      IgxToggleModule,
      IgxDataChartCategoryModule,
      IgxDataChartCoreModule,
      IgxLegendModule,
      IgxDataChartInteractivityModule,
      IgxNumericXAxisModule,
      IgxNumericYAxisModule,
      IgxCategoryXAxisModule,
      IgxItemLegendModule,
      IgxPieChartModule,
      IgxDataChartStackedModule,
      IgxDividerModule,
      IgxDataChartScatterModule,
      IgxBarSeriesModule,
      IgxIconModule,
      IgxCategoryChartModule
  ],
  entryComponents: [
      IgxDataChartComponent,
      IgxItemLegendComponent,
      IgxLegendComponent,
      IgxPieChartComponent,
      IgxContextMenuComponent,
      IgxChartMenuComponent
  ],
  exports: [
    IgxConditionalFormattingDirective,
    IgxChartIntegrationDirective,
    IgxContextMenuDirective
  ]
})
export class IgxExtrasModule { }
