import { CHART_TYPE } from './chart-types';
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
});
