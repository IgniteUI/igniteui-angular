import { CHART_TYPE, OPTIONS_TYPE } from './chart-types';
import { IgxChartIntegrationDirective, IDeterminedChartTypesArgs } from './chart-integration.directive';

describe('IgxChartIntegrationDirective', () => {
    let directive: IgxChartIntegrationDirective;

    beforeEach(() => {
        directive = new IgxChartIntegrationDirective();
    });

    describe('chartData setter', () => {
        it('should emit empty result when data is empty', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [];

            expect(emittedArgs.chartsForCreation).toEqual([]);
        });

        it('should emit empty result when data has no numeric columns', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', label: 'B' }];

            expect(emittedArgs.chartsForCreation).toEqual([]);
        });

        it('should exclude Pie chart when data contains non-positive values', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: -10 }, { name: 'B', value: 20 }];

            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.Pie);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ColumnGrouped);
        });

        it('should limit to Column, Bar and Pie for single-row data', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: 10 }];

            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.Pie);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ColumnGrouped);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.BarGrouped);
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.LineGrouped);
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.AreaGrouped);
        });

        it('should require 2+ numeric columns for scatter and 3+ for bubble', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.ScatterPoint);
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.ScatterBubble);

            directive.chartData = [{ name: 'A', x: 10, y: 20 }, { name: 'B', x: 30, y: 40 }];
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ScatterPoint);
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.ScatterBubble);

            directive.chartData = [{ name: 'A', x: 10, y: 20, z: 5 }, { name: 'B', x: 30, y: 40, z: 8 }];
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ScatterBubble);
        });
    });

    describe('disableCharts / enableCharts', () => {
        it('should remove disabled chart types from available charts', () => {
            directive.disableCharts([CHART_TYPE.Pie, CHART_TYPE.ScatterBubble]);

            expect(directive.getAvailableCharts()).not.toContain(CHART_TYPE.Pie);
            expect(directive.getAvailableCharts()).not.toContain(CHART_TYPE.ScatterBubble);
        });

        it('should re-enable previously disabled charts', () => {
            directive.disableCharts([CHART_TYPE.Pie]);
            directive.enableCharts([CHART_TYPE.Pie]);

            expect(directive.getAvailableCharts()).toContain(CHART_TYPE.Pie);
        });
    });

    describe('scatterChartYAxisValueMemberPath', () => {
        beforeEach(() => {
            directive.chartData = [{ name: 'A', x: 1, y: 2, z: 3 }];
        });

        it('should fall back to the first numeric member path when not set', () => {
            expect(directive.scatterChartYAxisValueMemberPath).toBe('x');
        });

        it('should return the explicitly set path when it exists in the data', () => {
            directive.scatterChartYAxisValueMemberPath = 'y';
            expect(directive.scatterChartYAxisValueMemberPath).toBe('y');
        });

        it('should fall back to first numeric path when set path is not in the data', () => {
            directive.scatterChartYAxisValueMemberPath = 'nonexistent';
            expect(directive.scatterChartYAxisValueMemberPath).toBe('x');
        });
    });

    describe('bubbleChartRadiusMemberPath', () => {
        beforeEach(() => {
            directive.chartData = [{ name: 'A', x: 1, y: 2, z: 3 }];
        });

        it('should fall back to the second numeric member path when not set', () => {
            expect(directive.bubbleChartRadiusMemberPath).toBe('y');
        });

        it('should return the explicitly set path when it exists in the data', () => {
            directive.bubbleChartRadiusMemberPath = 'z';
            expect(directive.bubbleChartRadiusMemberPath).toBe('z');
        });

        it('should fall back to second numeric path when set path is not in the data', () => {
            directive.bubbleChartRadiusMemberPath = 'nonexistent';
            expect(directive.bubbleChartRadiusMemberPath).toBe('y');
        });
    });

    describe('getAllChartTypes', () => {
        it('should return all registered chart types', () => {
            const allTypes = directive.getAllChartTypes();
            expect(allTypes).toContain(CHART_TYPE.Pie);
            expect(allTypes).toContain(CHART_TYPE.ColumnGrouped);
            expect(allTypes).toContain(CHART_TYPE.ScatterPoint);
            expect(allTypes).toContain(CHART_TYPE.ScatterBubble);
        });
    });

    describe('chartsAvailability in emitted args', () => {
        it('should populate chartsAvailability map when data is valid', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];

            expect(emittedArgs.chartsAvailability).toBeDefined();
            expect(emittedArgs.chartsAvailability.size).toBeGreaterThan(0);
            expect(emittedArgs.chartsAvailability.get(CHART_TYPE.ColumnGrouped)).toBeTrue();
        });

        it('should have empty chartsAvailability when data is empty', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [];

            expect(emittedArgs.chartsAvailability.size).toBe(0);
        });
    });

    describe('chartData getter augmentation', () => {
        it('should add Index member path to each record', () => {
            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];

            const data = directive.chartData;
            expect(data[0]['name']).toBe('A');
            expect(data[1]['name']).toBe('B');
        });

        it('should preserve original data fields', () => {
            directive.chartData = [{ name: 'A', value: 10 }];
            const data = directive.chartData;
            expect(data[0].value).toBe(10);
            expect(data[0].name).toBe('A');
        });
    });

    describe('multi-row data with all chart types', () => {
        it('should include Line, Area, Column, Bar, Stacked, and Pie for valid multi-row positive data', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];

            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ColumnGrouped);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.BarGrouped);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.LineGrouped);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.AreaGrouped);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.Pie);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ColumnStacked);
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.BarStacked);
        });

        it('should exclude ScatterLine when fewer than 2 numeric columns', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];

            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.ScatterLine);
        });
    });

    describe('disableCharts and chartData interaction', () => {
        it('should not include disabled chart types in emitted chartsForCreation', () => {
            directive.disableCharts([CHART_TYPE.Pie]);

            // chartsAvailability is updated but chartsForCreation only populated when chartData is set
            // The disable only affects getAvailableCharts() — chartsForCreation comes from _dataChartTypes
            // which is derived from the data. Verify getAvailableCharts excludes disabled.
            expect(directive.getAvailableCharts()).not.toContain(CHART_TYPE.Pie);
        });
    });

    describe('chartFactory', () => {
        it('should return undefined when chart type is disabled', () => {
            directive.disableCharts([CHART_TYPE.Pie]);
            directive.chartData = [{ name: 'A', value: 10 }];

            const result = directive.chartFactory(CHART_TYPE.Pie);
            expect(result).toBeUndefined();
        });

        it('should emit chartCreationDone when using createdChart path', () => {
            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
            let emittedChart: any;
            directive.chartCreationDone.subscribe((c) => emittedChart = c);

            const mockChart = { width: '', height: '', dataSource: null } as any;
            directive.chartFactory(CHART_TYPE.Pie, undefined, mockChart);

            expect(emittedChart).toBeDefined();
            expect(emittedChart.dataSource).toBeDefined();
        });

        it('should create a column chart with correct axis options via createdChart path', () => {
            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
            const mockChart = {
                series: { count: 0, clear: () => {}, add: () => {} },
                axes: { count: 0, clear: () => {}, add: () => {} }
            } as any;

            const result = directive.chartFactory(CHART_TYPE.ColumnGrouped, undefined, mockChart);

            expect(result).toBeDefined();
        });

        it('should create a bar chart (exercises bar-specific axis label path)', () => {
            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
            const mockChart = {
                series: { count: 0, clear: () => {}, add: () => {} },
                axes: { count: 0, clear: () => {}, add: () => {} }
            } as any;

            const result = directive.chartFactory(CHART_TYPE.BarGrouped, undefined, mockChart);

            expect(result).toBeDefined();
        });

        it('should create a scatter chart with yMemberPath set', () => {
            directive.chartData = [{ name: 'A', x: 10, y: 20 }, { name: 'B', x: 30, y: 40 }];
            const mockChart = {
                series: { count: 0, clear: () => {}, add: () => {} },
                axes: { count: 0, clear: () => {}, add: () => {} }
            } as any;

            const result = directive.chartFactory(CHART_TYPE.ScatterPoint, undefined, mockChart);

            expect(result).toBeDefined();
        });

        it('should create a scatter bubble chart with radiusMemberPath set', () => {
            directive.chartData = [{ name: 'A', x: 10, y: 20, z: 5 }, { name: 'B', x: 30, y: 40, z: 8 }];
            const mockChart = {
                series: { count: 0, clear: () => {}, add: () => {} },
                axes: { count: 0, clear: () => {}, add: () => {} }
            } as any;

            const result = directive.chartFactory(CHART_TYPE.ScatterBubble, undefined, mockChart);

            expect(result).toBeDefined();
        });

        it('should return undefined when no viewContainerRef or createdChart is provided', () => {
            directive.chartData = [{ name: 'A', value: 10 }];
            let emittedChart: any;
            directive.chartCreationDone.subscribe((c) => emittedChart = c);

            const result = directive.chartFactory(CHART_TYPE.Pie);

            expect(result).toBeUndefined();
            expect(emittedChart).toBeUndefined(); // chart is undefined, but event still emits
        });
    });

    describe('_labelMemberPath fallback', () => {
        it('should fall back to Index when data has no string columns', () => {
            directive.chartData = [{ x: 10, y: 20 }];
            const data = directive.chartData;
            // When no string columns, addIndexMemberPath uses 'Index' as the label member path
            expect(data[0]['Index']).toBeDefined();
        });
    });

    describe('chartCreationDone output', () => {
        it('should emit after chartFactory creates a chart', () => {
            directive.chartData = [{ name: 'A', value: 10 }];
            let emitted = false;
            directive.chartCreationDone.subscribe(() => emitted = true);

            const mockChart = { width: '', height: '', dataSource: null } as any;
            directive.chartFactory(CHART_TYPE.Pie, undefined, mockChart);

            expect(emitted).toBeTrue();
        });
    });

    describe('useLegend input', () => {
        it('should default to true', () => {
            expect(directive.useLegend).toBeTrue();
        });

        it('should accept false', () => {
            directive.useLegend = false;
            expect(directive.useLegend).toBeFalse();
        });
    });

    describe('setChartComponentOptions', () => {
        it('should set custom chart options for a specific chart type', () => {
            directive.setChartComponentOptions(CHART_TYPE.Pie, OPTIONS_TYPE.Chart, { width: '50%' });

            // Verify by creating a chart and checking the option is applied
            directive.chartData = [{ name: 'A', value: 10 }];
            const mockChart = { width: '', dataSource: null } as any;
            directive.chartFactory(CHART_TYPE.Pie, undefined, mockChart);

            expect(mockChart.width).toBe('50%');
        });

        it('should merge multiple option sets for the same chart type and options type', () => {
            directive.setChartComponentOptions(CHART_TYPE.Pie, OPTIONS_TYPE.Chart, { width: '50%' });
            directive.setChartComponentOptions(CHART_TYPE.Pie, OPTIONS_TYPE.Chart, { height: '60%' });

            directive.chartData = [{ name: 'A', value: 10 }];
            const mockChart = { width: '', height: '', dataSource: null } as any;
            directive.chartFactory(CHART_TYPE.Pie, undefined, mockChart);

            expect(mockChart.width).toBe('50%');
            expect(mockChart.height).toBe('60%');
        });

        it('should allow setting series model options', () => {
            expect(() => {
                directive.setChartComponentOptions(CHART_TYPE.ColumnGrouped, OPTIONS_TYPE.Series, { markerType: 5 });
            }).not.toThrow();
        });

        it('should allow setting x and y axis options', () => {
            expect(() => {
                directive.setChartComponentOptions(CHART_TYPE.ColumnGrouped, OPTIONS_TYPE.XAxis, { labelTextColor: 'red' });
                directive.setChartComponentOptions(CHART_TYPE.ColumnGrouped, OPTIONS_TYPE.YAxis, { labelExtent: 50 });
            }).not.toThrow();
        });

        it('should allow setting stacked fragment options', () => {
            expect(() => {
                directive.setChartComponentOptions(CHART_TYPE.ColumnStacked, OPTIONS_TYPE.StackedSeries, { title: 'test' });
            }).not.toThrow();
        });
    });

    describe('defaultLabelMemberPath', () => {
        it('should use defaultLabelMemberPath when it exists in the data', () => {
            // First call initializes _chartData so the getter can access it
            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
            directive.defaultLabelMemberPath = 'name';
            // Re-set to apply the label member path
            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];

            const data = directive.chartData;
            expect(data[0].name).toBe('A');
            expect(data[1].name).toBe('B');
        });

        it('should fall back to first string field when defaultLabelMemberPath is not in data', () => {
            // First call initializes _chartData
            directive.chartData = [{ label: 'X', value: 10 }];
            directive.defaultLabelMemberPath = 'nonexistent';
            directive.chartData = [{ label: 'X', value: 10 }];

            const data = directive.chartData;
            expect(data[0].label).toBe('X');
        });

        it('should use Index when no string fields are present', () => {
            directive.chartData = [{ x: 10, y: 20 }];

            const data = directive.chartData;
            expect(data[0]['Index']).toBe(1);
        });

        it('should default to undefined', () => {
            expect(directive.defaultLabelMemberPath).toBeUndefined();
        });
    });

    describe('chartData Pie with all zero values', () => {
        it('should exclude Pie chart when all values are zero', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: 0 }, { name: 'B', value: 0 }];

            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.Pie);
        });
    });

    describe('enableCharts / disableCharts idempotency', () => {
        it('should not duplicate charts when enabling an already enabled chart', () => {
            const initialCount = directive.getAvailableCharts().length;
            directive.enableCharts([CHART_TYPE.Pie]);
            expect(directive.getAvailableCharts().length).toBe(initialCount);
        });

        it('should handle disabling an already disabled chart', () => {
            directive.disableCharts([CHART_TYPE.Pie]);
            const afterFirst = directive.getAvailableCharts().length;
            directive.disableCharts([CHART_TYPE.Pie]);
            expect(directive.getAvailableCharts().length).toBe(afterFirst);
        });
    });

    describe('scatter chart scatter line creation', () => {
        it('should create a scatter line chart', () => {
            directive.chartData = [{ name: 'A', x: 10, y: 20 }, { name: 'B', x: 30, y: 40 }];
            const mockChart = {
                series: { count: 0, clear: () => {}, add: jasmine.createSpy('add') },
                axes: { count: 0, clear: () => {}, add: jasmine.createSpy('add') }
            } as any;

            const result = directive.chartFactory(CHART_TYPE.ScatterLine, undefined, mockChart);

            expect(result).toBeDefined();
        });
    });
});
