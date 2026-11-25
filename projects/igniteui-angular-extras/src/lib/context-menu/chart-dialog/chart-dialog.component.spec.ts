import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { IgxChartMenuComponent } from './chart-dialog.component';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
            const clearSpy = vi.fn();
            const factorySpy = vi.fn();
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
            expect(component.fullScreen).toBe(true);
        });

        it('should toggle fullScreen from true to false', () => {
            component.fullScreen = true;
            component.toggleFullScreen();
            expect(component.fullScreen).toBe(false);
        });
    });

    describe('createChart guards', () => {
        it('should return early when chartType is falsy', () => {
            const factorySpy = vi.fn();
            component.chartDirective = { chartFactory: factorySpy };
            component.chartArea = { clear: () => {} } as any;

            component.createChart(null);

            expect(factorySpy).not.toHaveBeenCalled();
            expect(component.title).toBeUndefined();
        });

        it('should return early when chartDirective is not set', () => {
            component.chartDirective = undefined;
            component.chartArea = { clear: vi.fn() } as any;

            component.createChart('Pie');

            expect((component.chartArea as any).clear).not.toHaveBeenCalled();
        });

        it('should return early when chartArea is not set', () => {
            const factorySpy = vi.fn();
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
            expect(component.isConfigAreaExpanded).toBe(false);
        });
    });

    describe('ngAfterViewInit', () => {
        it('should create a ResizeObserver and call createChart when currentChartType and chartDirective are set', () => {
            const factorySpy = vi.fn();
            component.chartDirective = { chartFactory: factorySpy };
            component.chartArea = { clear: () => {} } as any;
            component.currentChartType = 'Pie';

            component.ngAfterViewInit();

            expect(factorySpy).toHaveBeenCalledWith('Pie', component.chartArea);
        });

        it('should not call createChart when currentChartType is not set', () => {
            const factorySpy = vi.fn();
            component.chartDirective = { chartFactory: factorySpy };
            component.chartArea = { clear: () => {} } as any;
            component.currentChartType = undefined;

            component.ngAfterViewInit();

            expect(factorySpy).not.toHaveBeenCalled();
        });

        it('should not call createChart when chartDirective is not set', () => {
            component.chartDirective = undefined;
            component.currentChartType = 'Pie';

            expect(() => component.ngAfterViewInit()).not.toThrow();
        });
    });

    describe('ngOnDestroy', () => {
        it('should disconnect the contentObserver if it exists', () => {
            component.ngAfterViewInit();
            const observer = (component as any).contentObserver;
            const disconnectSpy = vi.spyOn(observer, 'disconnect');

            component.ngOnDestroy();

            expect(disconnectSpy).toHaveBeenCalled();
        });

        it('should complete the chartDialogResizeNotify subject', () => {
            const completeSpy = vi.spyOn(component.chartDialogResizeNotify, 'complete');

            component.ngOnDestroy();

            expect(completeSpy).toHaveBeenCalled();
        });

        it('should not throw when contentObserver is not set', () => {
            (component as any).contentObserver = undefined;

            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });

    describe('createChart title formatting', () => {
        beforeEach(() => {
            component.chartDirective = { chartFactory: () => {} };
            component.chartArea = { clear: () => {} } as any;
        });

        it('should replace only the first comma with a space for two-word types', () => {
            component.createChart('ColumnGrouped');
            expect(component.title).toBe('Column Grouped');
        });

        it('should handle chart types with numbers like Column100Stacked', () => {
            component.createChart('Column100Stacked');
            // split on uppercase: 'Column100','Stacked' → 'Column100 Stacked'
            expect(component.title).toBe('Column100 Stacked');
        });

        it('should handle single-word chart types', () => {
            component.createChart('Pie');
            expect(component.title).toBe('Pie');
        });

        it('should handle three-word chart types like ScatterBubbleChart', () => {
            component.createChart('ScatterBubbleChart');
            // 'Scatter,Bubble,Chart'.replace(',', ' ') → 'Scatter Bubble,Chart'
            expect(component.title).toBe('Scatter Bubble,Chart');
        });
    });

    describe('images', () => {
        it('should initialize images from charts module', () => {
            expect(component.images).toBeDefined();
        });
    });
});

describe('IgxChartMenuComponent rendering', () => {
    let fixture: ComponentFixture<IgxChartMenuComponent>;
    let component: IgxChartMenuComponent;
    let chartDirective: { chartFactory: ReturnType<typeof vi.fn> };

    const query = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
    const queryAll = (selector: string): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll(selector));
    const headerButtons = () => queryAll('.action-buttons-wrapper button');

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [IgxChartMenuComponent] });
        fixture = TestBed.createComponent(IgxChartMenuComponent);
        component = fixture.componentInstance;
        chartDirective = { chartFactory: vi.fn() };
        component.chartDirective = chartDirective;
        component.allCharts = ['ColumnGrouped', 'ColumnStacked', 'BarGrouped', 'Pie'];
        component.width = 1000;
        component.height = 500;
        fixture.detectChanges();
        component.createChart('ColumnStacked');
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('should create the chart in the chart area and show its title in the header', () => {
        expect(chartDirective.chartFactory).toHaveBeenCalledWith('ColumnStacked', component.chartArea);
        expect(query('.header-text').textContent!.trim()).toBe('Column Stacked Chart');
    });

    it('should bind the host size to 70% of the given dimensions and to 100% in full screen', () => {
        const host: HTMLElement = fixture.nativeElement;
        expect(host.style.width).toBe('700px');
        expect(host.style.height).toBe('350px');

        headerButtons()[0].click();
        fixture.detectChanges();

        expect(component.fullScreen).toBe(true);
        expect(host.style.width).toBe('1000px');
        expect(host.style.height).toBe('500px');
        expect(headerButtons()[0].textContent!.trim()).toBe('fullscreen_exit');

        headerButtons()[0].click();
        fixture.detectChanges();

        expect(component.fullScreen).toBe(false);
        expect(headerButtons()[0].textContent!.trim()).toBe('fullscreen');
    });

    it('should emit closed when the close button is clicked', () => {
        const closedSpy = vi.fn();
        component.closed.subscribe(closedSpy);

        headerButtons()[1].click();

        expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should toggle the chart config area with the chevron button', () => {
        const configArea = query('.chart-config-area');
        const toggleButton = query('.selection-area > div > button');
        expect(configArea.classList).toContain('opened');
        expect(query('.chart-area').classList).not.toContain('expanded');
        expect(toggleButton.textContent!.trim()).toBe('chevron_right');

        toggleButton.click();
        fixture.detectChanges();

        expect(component.isConfigAreaExpanded).toBe(true);
        expect(configArea.classList).toContain('closed');
        expect(configArea.classList).not.toContain('opened');
        expect(query('.chart-area').classList).toContain('expanded');
        expect(toggleButton.textContent!.trim()).toBe('chevron_left');
    });

    it('should render a section only for the main chart types that have available charts', () => {
        const sections = queryAll('.wrapper')
            .filter(w => w.querySelector('.types-section'))
            .map(w => w.firstElementChild!.textContent!.trim());

        expect(sections).toEqual(['Column Chart', 'Bar Chart', 'Pie Chart']);
    });

    it('should render a button per available chart and mark the current one as selected', () => {
        const buttons = queryAll('.types-section-btn');

        expect(buttons.map(b => b.title)).toEqual(['ColumnGrouped', 'ColumnStacked', 'BarGrouped', 'Pie']);
        expect(buttons[1].classList).toContain('selected');
        expect(buttons[0].classList).not.toContain('selected');
    });

    it('should create the chosen chart when a chart type button is clicked', () => {
        const pieButton = queryAll('.types-section-btn').find(b => b.title === 'Pie')!;

        pieButton.click();
        fixture.detectChanges();

        expect(chartDirective.chartFactory).toHaveBeenLastCalledWith('Pie', component.chartArea);
        expect(component.currentChartType).toBe('Pie');
        expect(pieButton.classList).toContain('selected');
        expect(query('.header-text').textContent!.trim()).toBe('Pie Chart');
    });
});
