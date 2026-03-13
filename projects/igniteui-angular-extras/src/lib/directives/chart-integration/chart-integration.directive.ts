import {
    ComponentRef, Directive,
    EventEmitter, Input, Output, Type, ViewContainerRef
} from '@angular/core';
import {
    IgxAreaSeriesComponent, IgxBarSeriesComponent, IgxBubbleSeriesComponent, IgxColumnSeriesComponent,
    IgxDataChartComponent, IgxItemLegendComponent, IgxLegendComponent, IgxLineSeriesComponent, IgxPieChartComponent,
    IgxScatterLineSeriesComponent, IgxScatterSeriesComponent, IgxSizeScaleComponent, IgxStacked100AreaSeriesComponent,
    IgxStacked100BarSeriesComponent, IgxStacked100ColumnSeriesComponent, IgxStacked100LineSeriesComponent,
    IgxStackedAreaSeriesComponent, IgxStackedBarSeriesComponent, IgxStackedColumnSeriesComponent,
    IgxStackedLineSeriesComponent
} from 'igniteui-angular-charts';
import { CHART_TYPE, OPTIONS_TYPE } from './chart-types';
import {
    ChartInitializer, IChartComponentOptions, IgxDataChartInitializer,
    IgxPieChartInitializer, IgxStackedDataChartInitializer, IOptions
} from './initializers';

export interface IDeterminedChartTypesArgs {
    chartsAvailability: Map<CHART_TYPE, boolean>;
    chartsForCreation: CHART_TYPE[];
}

@Directive({
    selector: '[igxChartIntegration]',
})
export class IgxChartIntegrationDirective {
    @Input()
    public get chartData() {
        return this._chartData;
    }

    public set chartData(selectedData: any[]) {
        const charts = new Set(this._dataChartTypes);
        const dataModel = selectedData.length ? selectedData[0] : {};
        this._labelMemberPaths = Object.keys(dataModel).filter(key => typeof dataModel[key] === 'string');
        this._valueMemberPaths = Object.keys(dataModel).filter(key => typeof dataModel[key] === 'number');
        this._chartData = selectedData.map((dataRecord, index) => this.addIndexMemberPath(dataRecord, index + 1));
        const args: IDeterminedChartTypesArgs = {
            chartsAvailability: new Map<CHART_TYPE, boolean>(),
            chartsForCreation: []
        };

        if (selectedData.length === 0 || this._valueMemberPaths.length === 0) {
            this.chartTypesDetermined.emit(args);
            return;
        }
        if (selectedData.length === 1) {
            charts.forEach((chart, _, set) => {
                const isColumnChart = chart.indexOf('Column') !== -1;
                const isBarChart = chart.indexOf('Bar') !== -1;
                const isPieChart = chart.indexOf('Pie') !== -1;
                if (!(isColumnChart || isBarChart || isPieChart)) {
                    set.delete(chart);
                }
            });
        }
        // Config pie chart
        const cannotCreatePieChart = selectedData.some(record => record[this._valueMemberPaths[0]] <= 0);
        if (cannotCreatePieChart) {
            charts.delete(CHART_TYPE.Pie);
        }
        // Config scatter chart member paths
        const canCreateScatterChart = this._valueMemberPaths.length >= 2;
        const canCreateBubbleChart = this._valueMemberPaths.length >= 3;
        if (!canCreateScatterChart) {
            charts.delete(CHART_TYPE.ScatterBubble);
            charts.delete(CHART_TYPE.ScatterLine);
            charts.delete(CHART_TYPE.ScatterPoint);
        }
        if (!canCreateBubbleChart) {
            charts.delete(CHART_TYPE.ScatterBubble);
        }

        args.chartsAvailability = this.chartTypesAvailability;
        args.chartsForCreation = [...charts];
        this.chartTypesDetermined.emit(args);
    }

    @Output()
    public chartTypesDetermined = new EventEmitter<IDeterminedChartTypesArgs>();

    @Output()
    public chartCreationDone = new EventEmitter<any>();

    @Input()
    public useLegend = true;

    @Input()
    public defaultLabelMemberPath: string = undefined;

    @Input()
    public set scatterChartYAxisValueMemberPath(path: string) {
        this._scatterChartYAxisValueMemberPath = path;
    }

    public get scatterChartYAxisValueMemberPath() {
        return this._scatterChartYAxisValueMemberPath &&
            this._valueMemberPaths.indexOf(this._scatterChartYAxisValueMemberPath) !== -1 ?
            this._scatterChartYAxisValueMemberPath : this._valueMemberPaths[0];
    }

    @Input()
    public set bubbleChartRadiusMemberPath(path: string) {
        this._bubbleChartRadiusMemberPath = path;
    }

    public get bubbleChartRadiusMemberPath() {
        return this._bubbleChartRadiusMemberPath &&
            this._valueMemberPaths.indexOf(this._bubbleChartRadiusMemberPath) !== -1 ?
            this._bubbleChartRadiusMemberPath : this._valueMemberPaths[1];
    }

    private chartTypesAvailability = new Map<CHART_TYPE, boolean>();
    private customChartComponentOptions = new Map<CHART_TYPE, IChartComponentOptions>();
    private dataCharts = new Map<string, Type<any>>();
    private _scatterChartYAxisValueMemberPath = undefined;
    private _bubbleChartRadiusMemberPath = undefined;
    private _valueMemberPaths = [];
    private _labelMemberPaths = [];
    private _chartData: any[];
    private _sizeScale = new IgxSizeScaleComponent();
    private _dataChartTypes = new Set<CHART_TYPE>();
    private get _labelMemberPath(): string {
        return this.defaultLabelMemberPath && this._chartData.some(r => r[this.defaultLabelMemberPath] !== undefined) ?
            this.defaultLabelMemberPath : this._labelMemberPaths.length > 0 ? this._labelMemberPaths[0] : 'Index';
    }

    private get pieChartOptions(): IOptions {
        return {
            width: '85%',
            height: '75%',
            dataSource: this.chartData,
            valueMemberPath: this._valueMemberPaths[0],
            legendLabelMemberPath: this._labelMemberPath,
            labelMemberPath: this._labelMemberPath,
        };
    }

    private dataChartSeriesOptionsModel: IOptions = {
        isHighlightingEnabled: true,
        areaFillOpacity: .4,
        markerType: 3,
        showDefaultTooltip: true
    };

    private scatterChartSeriesOptionsModel: IOptions = {
        markerType: 3,
        showDefaultTooltip: true
    };

    private bubbleChartSeriesOptionsModel: IOptions = {
        radiusScale: this._sizeScale
    };

    private get dataChartOptions(): IOptions {
        return {
            width: '100%',
            height: '85%',
            autoMarginWidth: 50,
            isVerticalZoomEnabled: true,
            isHorizontalZoomEnabled: true,
            dataSource: this.chartData
        };
    }

    constructor() {
        this.dataCharts.set(CHART_TYPE.ColumnGrouped, IgxColumnSeriesComponent);
        this.dataCharts.set(CHART_TYPE.AreaGrouped, IgxAreaSeriesComponent);
        this.dataCharts.set(CHART_TYPE.LineGrouped, IgxLineSeriesComponent);
        this.dataCharts.set(CHART_TYPE.BarGrouped, IgxBarSeriesComponent);

        this.dataCharts.set(CHART_TYPE.ColumnStacked, IgxStackedColumnSeriesComponent);
        this.dataCharts.set(CHART_TYPE.AreaStacked, IgxStackedAreaSeriesComponent);
        this.dataCharts.set(CHART_TYPE.LineStacked, IgxStackedLineSeriesComponent);
        this.dataCharts.set(CHART_TYPE.BarStacked, IgxStackedBarSeriesComponent);

        this.dataCharts.set(CHART_TYPE.Column100Stacked, IgxStacked100ColumnSeriesComponent);
        this.dataCharts.set(CHART_TYPE.Area100Stacked, IgxStacked100AreaSeriesComponent);
        this.dataCharts.set(CHART_TYPE.Line100Stacked, IgxStacked100LineSeriesComponent);
        this.dataCharts.set(CHART_TYPE.Bar100Stacked, IgxStacked100BarSeriesComponent);

        this.dataCharts.set(CHART_TYPE.ScatterPoint, IgxScatterSeriesComponent);
        this.dataCharts.set(CHART_TYPE.ScatterBubble, IgxBubbleSeriesComponent);
        this.dataCharts.set(CHART_TYPE.ScatterLine, IgxScatterLineSeriesComponent);

        this.dataCharts.set(CHART_TYPE.Pie, IgxPieChartComponent);
        const iterable = this.dataCharts.keys();
        for (let head = iterable.next().value; head !== undefined; head = iterable.next().value) {
            this._dataChartTypes.add(head);
            this.chartTypesAvailability.set(head, true);
            this.customChartComponentOptions.set(head, {});
        }
    }

    public getAllChartTypes() {
        return Array.from(this._dataChartTypes);
    }

    public getAvailableCharts() {
        const res = [];
        this.chartTypesAvailability.forEach((isAvailable, chartType) => {
            if (isAvailable) {
                res.push(chartType);
            }
        });
        return res;
    }

    public disableCharts(types: CHART_TYPE[]) {
        types.forEach(type => {
            if (this.chartTypesAvailability.get(type)) {
                this.chartTypesAvailability.set(type, false);
            }
        });
    }

    public enableCharts(types: CHART_TYPE[]) {
        types.forEach(type => {
            if (!this.chartTypesAvailability.get(type)) {
                this.chartTypesAvailability.set(type, true);
            }
        });
    }

    public chartFactory(type: CHART_TYPE, viewContainerRef?: ViewContainerRef, createdChart?: any) {
        if (!this.chartTypesAvailability.get(type)) {
            return;
        }
        const chartType = this.dataCharts.get(type);
        const options: IChartComponentOptions = this.getChartOptions(type);
        const initializer: ChartInitializer = this.getInitializer(type, chartType);
        let chart;
        if (viewContainerRef) {
            let componentRef: ComponentRef<any>;
            this._sizeScale.maximumValue = 60;
            this._sizeScale.minimumValue = 10;

            if (type === CHART_TYPE.Pie) {
                componentRef = viewContainerRef.createComponent(IgxPieChartComponent);
            } else {
                componentRef = viewContainerRef.createComponent(IgxDataChartComponent);
            }

            if (this.useLegend) {
                const legendType = type === CHART_TYPE.Pie ? IgxItemLegendComponent : IgxLegendComponent;
                const legendComponentRef: ComponentRef<any> = viewContainerRef.createComponent(legendType as any);
                options.chartOptions['legend'] = legendComponentRef.instance;
            }
            chart = initializer.initChart(componentRef.instance, options);
        } else if (createdChart) {
            chart = initializer.initChart(createdChart, options);
        }
        this.chartCreationDone.emit(chart);
        return chart;
    }

    private getInitializer(chartType: CHART_TYPE, componentClassRef): ChartInitializer {
        if (chartType.includes('Pie')) {
            return new IgxPieChartInitializer();
        } else if (chartType.includes('Stacked')) {
            return new IgxStackedDataChartInitializer(componentClassRef);
        } else {
            return new IgxDataChartInitializer(componentClassRef);
        }
    }

    private getChartOptions(type: CHART_TYPE): IChartComponentOptions {
        const chartComponentOptions: IChartComponentOptions = {};
        return type === CHART_TYPE.Pie ? this.addPieChartDataOptions(chartComponentOptions) :
            this.addDataChartDataOptions(type, chartComponentOptions, type.includes('Stacked'));
    }

    private addPieChartDataOptions(chartComponentOptions: IChartComponentOptions) {
        // tslint:disable-next-line: max-line-length
        chartComponentOptions.chartOptions = Object.assign(this.pieChartOptions, this.customChartComponentOptions.get(CHART_TYPE.Pie).chartOptions);
        return chartComponentOptions;
    }

    private addDataChartDataOptions(type: CHART_TYPE, chartComponentOptions: IChartComponentOptions, stacked: boolean) {
        chartComponentOptions.chartOptions = Object.assign(this.dataChartOptions, this.customChartComponentOptions.get(type));
        if (type.indexOf('Scatter') !== -1) {
            this.addScatterChartDataOptions(type, chartComponentOptions);
        } else {
            // tslint:disable-next-line: max-line-length
            chartComponentOptions.seriesModel = Object.assign(this.dataChartSeriesOptionsModel, this.customChartComponentOptions.get(type).seriesModel);
            this.setAxisLabelOption(type, chartComponentOptions);
            const options: IOptions[] = [];
            this._valueMemberPaths.forEach(valueMemberPath => {
                const dataOptions = {
                    title: valueMemberPath,
                    valueMemberPath
                };
                if (stacked) {
                    options.push({ ...dataOptions });
                } else {
                    options.push({ ...dataOptions, ...chartComponentOptions.seriesModel });
                }
            });
            if (stacked) {
                chartComponentOptions.stackedFragmentOptions = options;
            } else {
                chartComponentOptions.seriesOptions = options;
            }
        }
        return chartComponentOptions;
    }

    private addScatterChartDataOptions(scatterChart: CHART_TYPE, chartComponentOptions: IChartComponentOptions) {
        // tslint:disable-next-line: max-line-length
        chartComponentOptions.seriesModel = Object.assign(this.scatterChartSeriesOptionsModel, this.customChartComponentOptions.get(scatterChart).seriesModel);
        chartComponentOptions.seriesModel['yMemberPath'] = this.scatterChartYAxisValueMemberPath;
        if (scatterChart === CHART_TYPE.ScatterBubble) {
            chartComponentOptions.seriesModel = Object.assign(chartComponentOptions.seriesModel, this.bubbleChartSeriesOptionsModel);
            chartComponentOptions.seriesModel['radiusMemberPath'] = this.bubbleChartRadiusMemberPath;
        }

        const model = chartComponentOptions.seriesModel;
        const seriesOptions: IOptions[] = [];
        this._valueMemberPaths.filter(v => !(v === model['yMemberPath'] ||
            v === model['radiusMemberPath'])).forEach(valueMemberPath => {
                const dataOptions = {
                    title: `${model['yMemberPath']} vs ${valueMemberPath}`,
                    xMemberPath: valueMemberPath,
                    labelMemberPath: this._labelMemberPath
                };
                seriesOptions.push({ ...dataOptions, ...model });
            });
        chartComponentOptions.xAxisOptions = Object.assign({
            labelExtent: NaN,
            labelTextColor: null,
        });
        chartComponentOptions.yAxisOptions = Object.assign({
            labelTextColor: null,
            labelExtent: NaN,
        });
        chartComponentOptions.seriesOptions = seriesOptions;
    }

    private addIndexMemberPath(dataRecord, index) {
        dataRecord = { ...{ [this._labelMemberPath]: index }, ...dataRecord };
        return dataRecord;
    }

    private setAxisLabelOption(type: CHART_TYPE, options: IChartComponentOptions) {
        if (type.indexOf('Bar') !== -1) {
            options.yAxisOptions = Object.assign({
                label: this._labelMemberPath,
                labelTextColor: null,
                labelExtent: NaN,
            }, this.customChartComponentOptions.get(type).yAxisOptions);
            options.xAxisOptions = Object.assign({
                labelTextColor: null,
                labelExtent: NaN,
            });
        } else {
            options.xAxisOptions = Object.assign({
                label: this._labelMemberPath,
                labelTextColor: null,
                labelExtent: NaN,
            }, this.customChartComponentOptions.get(type).xAxisOptions);
            options.yAxisOptions = Object.assign({
                labelTextColor: null,
                labelExtent: NaN,
            })
        }
    }

    public setChartComponentOptions(chart: CHART_TYPE, optionsType: OPTIONS_TYPE, options: IOptions) {
        if (!this.customChartComponentOptions.get(chart)[optionsType]) {
            this.customChartComponentOptions.get(chart)[optionsType] = {};
        }
        Object.keys(options).forEach(property => {
            this.customChartComponentOptions.get(chart)[optionsType][property] = options[property];
        });
    }
}
