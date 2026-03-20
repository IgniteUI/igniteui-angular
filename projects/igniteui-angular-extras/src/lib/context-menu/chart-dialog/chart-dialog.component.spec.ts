import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { IgxChartMenuComponent } from './chart-dialog.component';

describe('IgxChartMenuComponent', () => {
    let component: IgxChartMenuComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ElementRef, useValue: { nativeElement: document.createElement('div') } }
            ]
        });
        component = TestBed.runInInjectionContext(() => new IgxChartMenuComponent());
    });

    describe('createChart', () => {
        it('should split PascalCase chart type into readable title', () => {
            component.chartDirective = { chartFactory: () => {} };
            component.chartArea = { clear: () => {} } as any;

            component.createChart('ColumnGrouped');
            expect(component.title).toBe('Column Grouped');

            component.createChart('Column100Stacked');
            expect(component.title).toBe('Column100 Stacked');

            component.createChart('Pie');
            expect(component.title).toBe('Pie');
        });

        it('should clear previous chart and create new one via chartFactory', () => {
            const clearSpy = jasmine.createSpy('clear');
            const factorySpy = jasmine.createSpy('chartFactory');
            component.chartArea = { clear: clearSpy } as any;
            component.chartDirective = { chartFactory: factorySpy };

            component.createChart('Pie');

            expect(clearSpy).toHaveBeenCalled();
            expect(factorySpy).toHaveBeenCalledWith('Pie', component.chartArea);
        });
    });

    describe('hasAvailableChart', () => {
        it('should match chart types by prefix from the available list', () => {
            component.allCharts = ['ColumnGrouped', 'ColumnStacked', 'Column100Stacked', 'BarGrouped', 'Pie'];

            expect(component.hasAvailableChart('Column')).toBe(true);
            expect(component.hasAvailableChart('Bar')).toBe(true);
            expect(component.hasAvailableChart('Pie')).toBe(true);
            expect(component.hasAvailableChart('Scatter')).toBe(false);
            expect(component.hasAvailableChart('Line')).toBe(false);
        });
    });

    describe('fullScreen dimensions', () => {
        it('should scale width and height to 70% when not fullscreen', () => {
            component.width = 1000;
            component.height = 800;
            component.fullScreen = false;

            expect(component.width).toBe(700);
            expect(component.height).toBe(560);
        });

        it('should return full dimensions when fullscreen', () => {
            component.width = 1000;
            component.height = 800;
            component.fullScreen = true;

            expect(component.width).toBe(1000);
            expect(component.height).toBe(800);
        });
    });

    describe('toggleFullScreen', () => {
        it('should toggle fullScreen from false to true', () => {
            component.fullScreen = false;
            component.toggleFullScreen();
            expect(component.fullScreen).toBeTrue();
        });

        it('should toggle fullScreen from true to false', () => {
            component.fullScreen = true;
            component.toggleFullScreen();
            expect(component.fullScreen).toBeFalse();
        });
    });

    describe('createChart guards', () => {
        it('should return early when chartType is falsy', () => {
            const factorySpy = jasmine.createSpy('chartFactory');
            component.chartDirective = { chartFactory: factorySpy };
            component.chartArea = { clear: () => {} } as any;

            component.createChart(null);

            expect(factorySpy).not.toHaveBeenCalled();
            expect(component.title).toBeUndefined();
        });

        it('should return early when chartDirective is not set', () => {
            component.chartDirective = undefined;
            component.chartArea = { clear: jasmine.createSpy('clear') } as any;

            component.createChart('Pie');

            expect((component.chartArea as any).clear).not.toHaveBeenCalled();
        });

        it('should return early when chartArea is not set', () => {
            const factorySpy = jasmine.createSpy('chartFactory');
            component.chartDirective = { chartFactory: factorySpy };
            component.chartArea = undefined;

            component.createChart('Pie');

            expect(factorySpy).not.toHaveBeenCalled();
        });

        it('should set currentChartType correctly', () => {
            component.chartDirective = { chartFactory: () => {} };
            component.chartArea = { clear: () => {} } as any;

            component.createChart('BarGrouped');

            expect(component.currentChartType).toBe('BarGrouped');
        });
    });

    describe('mainChartTypes', () => {
        it('should contain the expected main chart type categories', () => {
            expect(component.mainChartTypes).toEqual(['Column', 'Area', 'Bar', 'Line', 'Scatter', 'Pie']);
        });
    });

    describe('isConfigAreaExpanded', () => {
        it('should default to false', () => {
            expect(component.isConfigAreaExpanded).toBeFalse();
        });
    });
});
