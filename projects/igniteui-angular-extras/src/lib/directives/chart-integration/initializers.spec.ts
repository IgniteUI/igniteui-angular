import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    IgxPieChartInitializer,
    IgxDataChartInitializer,
    IgxStackedDataChartInitializer,
    IChartComponentOptions
} from './initializers';
import {
    IgxBarSeriesComponent,
    IgxColumnSeriesComponent,
    IgxScatterSeriesComponent,
    IgxBubbleSeriesComponent,
    IgxScatterLineSeriesComponent,
    IgxStackedColumnSeriesComponent,
    IgxStackedBarSeriesComponent,
    IgxStacked100BarSeriesComponent,
    IgxDataChartComponent,
    IgxDataChartCoreModule,
    IgxDataChartCategoryModule,
    IgxDataChartStackedModule,
    IgxCategoryXAxisModule,
    IgxCategoryYAxisModule,
    IgxNumericXAxisModule,
    IgxNumericYAxisModule
} from 'igniteui-angular-charts';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Helper to create a mock chart with series and axes arrays
function createMockDataChart() {
    return {
        series: { count: 0, clear: vi.fn(), add: vi.fn() },
        axes: { count: 0, clear: vi.fn(), add: vi.fn() }
    };
}

describe('ChartInitializer.applyOptions', () => {
    let initializer: IgxPieChartInitializer;

    beforeEach(() => {
        initializer = new IgxPieChartInitializer();
    });

    it('should set simple properties on the target', () => {
        const target = { width: '', height: '' } as any;
        initializer.applyOptions(target, { width: '100%', height: '50%' });
        expect(target.width).toBe('100%');
        expect(target.height).toBe('50%');
    });

    it('should subscribe to EventEmitter properties instead of overwriting', () => {
        const emitter = new EventEmitter<string>();
        const target = { onReady: emitter } as any;
        const callback = vi.fn();

        initializer.applyOptions(target, { onReady: callback });

        // The EventEmitter should still be intact, and callback should be subscribed
        emitter.emit('test');
        expect(callback).toHaveBeenCalledWith('test');
    });

    it('should handle null options gracefully', () => {
        const target = { width: '50%' } as any;
        expect(() => initializer.applyOptions(target, null)).not.toThrow();
        expect(target.width).toBe('50%');
    });

    it('should handle undefined options gracefully', () => {
        const target = { width: '50%' } as any;
        expect(() => initializer.applyOptions(target, undefined)).not.toThrow();
        expect(target.width).toBe('50%');
    });
});

describe('IgxPieChartInitializer', () => {
    let initializer: IgxPieChartInitializer;

    beforeEach(() => {
        initializer = new IgxPieChartInitializer();
    });

    it('should apply chart options to the pie chart instance', () => {
        const chart = { width: '', dataSource: null } as any;
        const options: IChartComponentOptions = {
            chartOptions: { width: '85%', dataSource: [1, 2, 3] }
        };

        const result = initializer.initChart(chart, options);

        expect(result.width).toBe('85%');
        expect(result.dataSource).toEqual([1, 2, 3]);
    });

    it('should return the same chart instance', () => {
        const chart = {} as any;
        const result = initializer.initChart(chart, { chartOptions: {} });
        expect(result).toBe(chart);
    });
});

describe('IgxDataChartInitializer', () => {
    it('should create category X / numeric Y axes for column series', () => {
        const init = new IgxDataChartInitializer(IgxColumnSeriesComponent);
        // xAxis and yAxis are created in constructor
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should create numeric X / category Y axes for bar series', () => {
        const init = new IgxDataChartInitializer(IgxBarSeriesComponent);
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should create numeric X / numeric Y axes for scatter series', () => {
        const init = new IgxDataChartInitializer(IgxScatterSeriesComponent);
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should create numeric X / numeric Y axes for bubble series', () => {
        const init = new IgxDataChartInitializer(IgxBubbleSeriesComponent);
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should create numeric X / numeric Y axes for scatter line series', () => {
        const init = new IgxDataChartInitializer(IgxScatterLineSeriesComponent);
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should clear existing series and axes before initializing', () => {
        const init = new IgxDataChartInitializer(IgxColumnSeriesComponent);
        const chart = createMockDataChart();
        chart.series.count = 2;
        chart.axes.count = 2;

        const options: IChartComponentOptions = {
            chartOptions: {},
            seriesOptions: [{ valueMemberPath: 'val', title: 'Value' }],
            xAxisOptions: {},
            yAxisOptions: {}
        };

        init.initChart(chart as any, options);

        expect(chart.series.clear).toHaveBeenCalled();
        expect(chart.axes.clear).toHaveBeenCalled();
    });

    it('should add a series for each entry in seriesOptions', () => {
        const init = new IgxDataChartInitializer(IgxColumnSeriesComponent);
        const chart = createMockDataChart();

        const options: IChartComponentOptions = {
            chartOptions: {},
            seriesOptions: [
                { valueMemberPath: 'val1', title: 'V1' },
                { valueMemberPath: 'val2', title: 'V2' }
            ],
            xAxisOptions: {},
            yAxisOptions: {}
        };

        init.initChart(chart as any, options);

        expect(chart.series.add).toHaveBeenCalledTimes(2);
    });

    it('should add x and y axes to the chart', () => {
        const init = new IgxDataChartInitializer(IgxColumnSeriesComponent);
        const chart = createMockDataChart();

        const options: IChartComponentOptions = {
            chartOptions: {},
            seriesOptions: [{ valueMemberPath: 'val', title: 'Value' }],
            xAxisOptions: {},
            yAxisOptions: {}
        };

        init.initChart(chart as any, options);

        expect(chart.axes.add).toHaveBeenCalledTimes(2);
    });

    it('should return the chart instance', () => {
        const init = new IgxDataChartInitializer(IgxColumnSeriesComponent);
        const chart = createMockDataChart();

        const options: IChartComponentOptions = {
            chartOptions: {},
            seriesOptions: [{ valueMemberPath: 'val', title: 'Value' }],
            xAxisOptions: {},
            yAxisOptions: {}
        };

        const result = init.initChart(chart as any, options);
        expect(result).toBe(chart as any);
    });
});

describe('IgxStackedDataChartInitializer', () => {
    it('should create category X / numeric Y axes for stacked column series', () => {
        const init = new IgxStackedDataChartInitializer(IgxStackedColumnSeriesComponent);
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should create numeric X / category Y axes for stacked bar series', () => {
        const init = new IgxStackedDataChartInitializer(IgxStackedBarSeriesComponent);
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should create numeric X / category Y axes for stacked 100 bar series', () => {
        const init = new IgxStackedDataChartInitializer(IgxStacked100BarSeriesComponent);
        expect((init as any).xAxis).toBeDefined();
        expect((init as any).yAxis).toBeDefined();
    });

    it('should store the seriesType', () => {
        const init = new IgxStackedDataChartInitializer(IgxStackedColumnSeriesComponent);
        expect(init.seriesType).toBe(IgxStackedColumnSeriesComponent);
    });

    it('should store the seriesType for bar', () => {
        const init = new IgxStackedDataChartInitializer(IgxStackedBarSeriesComponent);
        expect(init.seriesType).toBe(IgxStackedBarSeriesComponent);
    });

    describe('initChart', () => {
        const stackedOptions = (): IChartComponentOptions => ({
            chartOptions: { width: '100%' },
            stackedFragmentOptions: [
                { valueMemberPath: 'val1', title: 'V1' },
                { valueMemberPath: 'val2', title: 'V2' }
            ] as any,
            xAxisOptions: { label: 'name' },
            yAxisOptions: { labelExtent: 40 }
        });

        let chart: IgxDataChartComponent;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    IgxDataChartCoreModule, IgxDataChartCategoryModule, IgxDataChartStackedModule,
                    IgxCategoryXAxisModule, IgxCategoryYAxisModule, IgxNumericXAxisModule, IgxNumericYAxisModule
                ]
            });
            chart = TestBed.createComponent(IgxDataChartComponent).componentInstance;
        });

        afterEach(() => {
            TestBed.resetTestingModule();
        });

        it('should add a single stacked series with one fragment per fragment option', () => {
            const init = new IgxStackedDataChartInitializer(IgxStackedColumnSeriesComponent);

            init.initChart(chart, stackedOptions());

            expect(chart.series.count).toBe(1);
            const series = chart.series.item(0) as IgxStackedColumnSeriesComponent;
            expect(series).toBeInstanceOf(IgxStackedColumnSeriesComponent);
            expect(series.series.count).toBe(2);
            expect(series.series.item(0).valueMemberPath).toBe('val1');
            expect(series.series.item(0).title).toBe('V1');
            expect(series.series.item(1).valueMemberPath).toBe('val2');
        });

        it('should bind the series to the initializer axes and add them to the chart', () => {
            const init = new IgxStackedDataChartInitializer(IgxStackedColumnSeriesComponent);

            init.initChart(chart, stackedOptions());

            const series = chart.series.item(0) as IgxStackedColumnSeriesComponent;
            expect(series.xAxis).toBe((init as any).xAxis);
            expect(series.yAxis).toBe((init as any).yAxis);
            expect(chart.axes.count).toBe(2);
            expect(chart.axes.item(0)).toBe((init as any).xAxis);
            expect(chart.axes.item(1)).toBe((init as any).yAxis);
            expect((init as any).xAxis.label).toBe('name');
            expect((init as any).yAxis.labelExtent).toBe(40);
        });

        it('should apply chart options and return the same chart instance', () => {
            const init = new IgxStackedDataChartInitializer(IgxStackedBarSeriesComponent);

            const result = init.initChart(chart, stackedOptions());

            expect(result).toBe(chart);
            expect(chart.width).toBe('100%');
        });

        it('should replace existing series and axes when re-initializing a chart', () => {
            new IgxStackedDataChartInitializer(IgxStackedColumnSeriesComponent).initChart(chart, stackedOptions());
            const init = new IgxStackedDataChartInitializer(IgxStackedBarSeriesComponent);

            init.initChart(chart, stackedOptions());

            expect(chart.series.count).toBe(1);
            expect(chart.series.item(0)).toBeInstanceOf(IgxStackedBarSeriesComponent);
            expect(chart.axes.count).toBe(2);
            expect(chart.axes.item(0)).toBe((init as any).xAxis);
        });
    });
});
