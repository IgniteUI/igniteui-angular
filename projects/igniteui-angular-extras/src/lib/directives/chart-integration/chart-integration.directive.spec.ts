import { CHART_TYPE } from './chart-types';
import { IgxChartIntegrationDirective, IDeterminedChartTypesArgs } from './chart-integration.directive';

describe('IgxChartIntegrationDirective', () => {
    let directive: IgxChartIntegrationDirective;

    beforeEach(() => {
        directive = new IgxChartIntegrationDirective();
    });

    describe('chartData setter', () => {
        it('should exclude Pie chart when data contains non-positive values', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [
                { name: 'A', value: -10 },
                { name: 'B', value: 20 }
            ];

            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.Pie);
            // Other chart types should still be available
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ColumnGrouped);
        });

        it('should require 2+ numeric columns for scatter and 3+ for bubble', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            // 1 numeric column — no scatter/bubble
            directive.chartData = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.ScatterPoint);
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.ScatterBubble);

            // 2 numeric columns — scatter yes, bubble no
            directive.chartData = [{ name: 'A', x: 10, y: 20 }, { name: 'B', x: 30, y: 40 }];
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ScatterPoint);
            expect(emittedArgs.chartsForCreation).not.toContain(CHART_TYPE.ScatterBubble);

            // 3 numeric columns — bubble yes
            directive.chartData = [{ name: 'A', x: 10, y: 20, z: 5 }, { name: 'B', x: 30, y: 40, z: 8 }];
            expect(emittedArgs.chartsForCreation).toContain(CHART_TYPE.ScatterBubble);
        });

        it('should limit to Column, Bar and Pie for single-row data', () => {
            let emittedArgs: IDeterminedChartTypesArgs;
            directive.chartTypesDetermined.subscribe((args) => emittedArgs = args);

            directive.chartData = [{ name: 'A', value: 10 }];

            const types = emittedArgs.chartsForCreation;
            expect(types).toContain(CHART_TYPE.Pie);
            expect(types).toContain(CHART_TYPE.ColumnGrouped);
            expect(types).toContain(CHART_TYPE.BarGrouped);
            expect(types).not.toContain(CHART_TYPE.LineGrouped);
            expect(types).not.toContain(CHART_TYPE.AreaGrouped);
        });
    });
});
