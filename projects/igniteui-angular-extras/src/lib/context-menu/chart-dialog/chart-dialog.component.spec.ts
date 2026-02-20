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
});
