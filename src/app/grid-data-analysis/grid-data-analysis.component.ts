// tslint:disable: max-line-length
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HammerModule } from '@angular/platform-browser';
import { IgxColumnComponent } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxChartIntegrationDirective, CHART_TYPE, OPTIONS_TYPE, IgxContextMenuDirective, IgxConditionalFormattingDirective } from 'igniteui-angular-extras';
import { FinancialData } from 'src/app/data/FinancialData';

@Component({
  selector: 'grid-data-analysis',
  templateUrl: './grid-data-analysis.component.html',
  styleUrls: ['./grid-data-analysis.component.scss'],
  imports: [
    CommonModule,
    IgxGridComponent,
    IgxColumnComponent,
    HammerModule,
    IgxConditionalFormattingDirective,
    IgxChartIntegrationDirective,
    IgxContextMenuDirective
  ],
})
export class GridDataAnalysisComponent implements OnInit, AfterViewInit {

  public data;

  @ViewChild(IgxChartIntegrationDirective, { read: IgxChartIntegrationDirective })
  public chartDirective: IgxChartIntegrationDirective;

  public ngOnInit() {
    this.data = new FinancialData().generateData(1000);
  }

  public ngAfterViewInit() {
    const pieChartOptions = {
      labelsPosition: 4,
      allowSliceExplosion: true,
      sliceClick: (evt) => {
        evt.args.isExploded = !evt.args.isExploded;
      },
      formatLabel: (context) => `${context.percentValue.toFixed(2)}%`
    };
    this.chartDirective.setChartComponentOptions(CHART_TYPE.Pie, OPTIONS_TYPE.Chart, pieChartOptions);
    this.chartDirective.getAvailableCharts()
      .filter(chart => chart.indexOf('Scatter') === -1 ||
        chart.indexOf('Bar') === -1 ||
        chart !== CHART_TYPE.Pie)
      .forEach(chart => this.chartDirective.setChartComponentOptions(chart, OPTIONS_TYPE.XAxis, { labelAngle: 30 }));
  }

  public formatCurrency(value: number) {
    return '$' + value.toFixed(3);
  }

}
