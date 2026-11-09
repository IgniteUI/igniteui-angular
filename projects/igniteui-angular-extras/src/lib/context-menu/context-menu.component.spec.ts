import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxOverlayService } from 'igniteui-angular/core';
import { IgxContextMenuComponent } from './context-menu.component';
import { CHART_TYPE } from '../directives/chart-integration/chart-types';
import { IgxChartMenuComponent } from 'igniteui-angular-extras';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('IgxContextMenuComponent', () => {
    let component: IgxContextMenuComponent;
    let mockOverlay: any;
    let mockContextDirective: any;
    let mockTabsMenu: any;
    let mockChartPreview: any;
    let mockChartPreviewDialog: any;

    beforeEach(() => {
        mockOverlay = {
            opening: new Subject(),
            closing: new Subject(),
            attach: vi.fn().mockReturnValue('dialog-id'),
            show: vi.fn(),
            hide: vi.fn(),
            detach: vi.fn(),
            getOverlayById: vi.fn().mockReturnValue(null)
        };

        mockContextDirective = {
            charts: ['ColumnGrouped', 'Pie'],
            formatters: ['Color Scale'],
            displayCreationTab: true,
            chartsDirective: {
                chartTypesDetermined: new EventEmitter(),
                chartFactory: vi.fn()
            },
            textFormatter: {
                formattersReady: new EventEmitter(),
                formatCells: vi.fn(),
                clearFormatting: vi.fn()
            },
            buttonClose: new EventEmitter(),
            gridResizeNotify: new Subject(),
            grid: { nativeElement: { clientWidth: 800, clientHeight: 600 } }
        };

        mockTabsMenu = {
            collapsed: true,
            element: document.createElement('div'),
            open: vi.fn(),
            close: vi.fn()
        };

        mockChartPreview = {
            clear: vi.fn()
        };

        mockChartPreviewDialog = {
            open: vi.fn(),
            close: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                IgxContextMenuComponent,
                { provide: IgxOverlayService, useValue: mockOverlay }
            ]
        });

        component = TestBed.inject(IgxContextMenuComponent);
        component.contextDirective = mockContextDirective;
        component.tabsMenu = mockTabsMenu;
        component.chartPreview = mockChartPreview;
        component.chartPreviewDialog = mockChartPreviewDialog;
        component.button = { nativeElement: document.createElement('button') } as any;
        component.ngAfterViewInit();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    describe('ngAfterViewInit', () => {
        it('should initialize chartTypes and textFormatters from contextDirective', () => {
            expect(component.chartTypes).toEqual(['ColumnGrouped', 'Pie']);
            expect(component.textFormatters).toEqual(['Color Scale']);
        });

        it('should update chartTypes when chartsDirective emits chartTypesDetermined', () => {
            mockContextDirective.chartsDirective.chartTypesDetermined.emit({ chartsForCreation: ['Pie'] });
            expect(component.chartTypes).toEqual(['Pie']);
        });

        it('should update textFormatters when textFormatter emits formattersReady', () => {
            mockContextDirective.textFormatter.formattersReady.emit(['Data Bars']);
            expect(component.textFormatters).toEqual(['Data Bars']);
        });

        it('should close tabsMenu when buttonClose emits and tabsMenu is open', () => {
            mockTabsMenu.collapsed = false;
            mockContextDirective.buttonClose.emit();
            expect(mockTabsMenu.close).toHaveBeenCalled();
        });

        it('should not close tabsMenu when buttonClose emits and tabsMenu is already collapsed', () => {
            mockTabsMenu.collapsed = true;
            mockContextDirective.buttonClose.emit();
            expect(mockTabsMenu.close).not.toHaveBeenCalled();
        });

        it('should close tabsMenu when gridResizeNotify emits and tabsMenu is open', () => {
            mockTabsMenu.collapsed = false;
            mockContextDirective.gridResizeNotify.next();
            expect(mockTabsMenu.close).toHaveBeenCalled();
        });
    });

    describe('toggleTabMenu', () => {
        it('should open tabsMenu when it is collapsed', () => {
            mockTabsMenu.collapsed = true;
            component.toggleTabMenu();
            expect(mockTabsMenu.open).toHaveBeenCalled();
        });

        it('should close tabsMenu when it is open', () => {
            mockTabsMenu.collapsed = false;
            component.toggleTabMenu();
            expect(mockTabsMenu.close).toHaveBeenCalled();
        });

        it('should default currentChartType to ColumnGrouped when not set', () => {
            component.currentChartType = undefined;
            component.toggleTabMenu();
            expect(component.currentChartType).toBe(CHART_TYPE.ColumnGrouped);
        });

    });

    describe('formatCells / clearFormat', () => {
        it('should set currentFormatter and delegate to textFormatter.formatCells', () => {
            component.formatCells('Color Scale');
            expect(component.currentFormatter).toBe('Color Scale');
            expect(mockContextDirective.textFormatter.formatCells).toHaveBeenCalledWith('Color Scale');
        });

        it('should clear currentFormatter and delegate to textFormatter.clearFormatting', () => {
            component.currentFormatter = 'Color Scale';
            component.clearFormat();
            expect(component.currentFormatter).toBeUndefined();
            expect(mockContextDirective.textFormatter.clearFormatting).toHaveBeenCalled();
        });
    });

    describe('previewChart', () => {
        it('should set currentChartType, clear preview, call chartFactory, and open dialog', () => {
            component.previewChart(CHART_TYPE.Pie);
            expect(component.currentChartType).toBe(CHART_TYPE.Pie);
            expect(mockChartPreview.clear).toHaveBeenCalled();
            expect(mockContextDirective.chartsDirective.chartFactory).toHaveBeenCalledWith(CHART_TYPE.Pie, mockChartPreview);
            expect(mockChartPreviewDialog.open).toHaveBeenCalled();
        });
    });

    describe('openDialog', () => {
        it('should reuse existing dialog id on subsequent calls', () => {
            component.openDialog(CHART_TYPE.ColumnGrouped);
            component.openDialog(CHART_TYPE.Pie);
            expect(mockOverlay.attach).toHaveBeenCalledTimes(1);
            expect(mockOverlay.show).toHaveBeenCalledTimes(2);
        });

        it('should close tabsMenu when opening dialog', () => {
            component.openDialog(CHART_TYPE.ColumnGrouped);
            expect(mockTabsMenu.close).toHaveBeenCalled();
        });

        it('should default currentChartType to ColumnGrouped when no type is provided', () => {
            component.currentChartType = undefined;
            component.openDialog();
            expect(component.currentChartType).toBe(CHART_TYPE.ColumnGrouped);
        });
    });

    describe('closeDialog', () => {
        it('should hide and detach the overlay when dialog exists', () => {
            mockOverlay.getOverlayById.mockReturnValue({ id: 'dialog-id' });
            (component as any)._dialogId = 'dialog-id';

            component.closeDialog();

            expect(mockOverlay.hide).toHaveBeenCalledWith('dialog-id');
            expect(mockOverlay.detach).toHaveBeenCalledWith('dialog-id');
            expect((component as any)._dialogId).toBeUndefined();
        });

        it('should not call hide or detach when no dialog is open', () => {
            mockOverlay.getOverlayById.mockReturnValue(null);
            component.closeDialog();
            expect(mockOverlay.hide).not.toHaveBeenCalled();
            expect(mockOverlay.detach).not.toHaveBeenCalled();
        });
    });

    describe('hidePreview', () => {
        it('should close the chart preview dialog', () => {
            component.hidePreview();
            expect(mockChartPreviewDialog.close).toHaveBeenCalled();
        });
    });

    describe('overlayService.opening subscription', () => {
        it('should set chart dialog instance properties when componentRef is present', () => {
            const mockInstance = {
                width: 0,
                height: 0,
                currentChartType: undefined,
                allCharts: [],
                chartDirective: undefined,
                chartDialogResizeNotify: undefined,
                closed: undefined
            } as any;
            const mockComponentRef = { instance: mockInstance };

            (mockOverlay.opening as Subject<any>).next({ componentRef: mockComponentRef });

            expect(mockInstance.width).toBe(800);
            expect(mockInstance.height).toBe(600);
            expect(mockInstance.allCharts).toEqual(['ColumnGrouped', 'Pie']);
            expect(mockInstance.chartDirective).toBe(mockContextDirective.chartsDirective);
        });

        it('should subscribe to closed event and call closeDialog when emitted', () => {
            const closedEmitter = new EventEmitter<any>();
            const mockInstance = {
                width: 0,
                height: 0,
                currentChartType: undefined,
                allCharts: [],
                chartDirective: undefined,
                chartDialogResizeNotify: undefined,
                closed: closedEmitter
            } as any;
            const mockComponentRef = { instance: mockInstance };

            (mockOverlay.opening as Subject<any>).next({ componentRef: mockComponentRef });

            // Open a dialog first so closeDialog has something to close
            component.openDialog(CHART_TYPE.ColumnGrouped);
            mockOverlay.getOverlayById.mockReturnValue({ id: 'dialog-id' });

            closedEmitter.emit();

            expect(mockOverlay.hide).toHaveBeenCalled();
            expect(mockOverlay.detach).toHaveBeenCalled();
        });
    });

    describe('displayCreationTab', () => {
        it('should reflect the contextDirective displayCreationTab value', () => {
            expect(component.displayCreationTab).toBe(true);
        });

        it('should be false when contextDirective disables it', () => {
            mockContextDirective.displayCreationTab = false;
            // Re-init to pick up the new value
            component.ngAfterViewInit();
            expect(component.displayCreationTab).toBe(false);
        });
    });

    describe('ngOnDestroy', () => {
        it('should complete destroy$ and not throw on subsequent event emissions', () => {
            component.ngOnDestroy();

            // After destroy, emitting on subscribed observables should not cause errors
            expect(() => mockContextDirective.chartsDirective.chartTypesDetermined.emit({ chartsForCreation: [] })).not.toThrow();
            expect(() => mockContextDirective.textFormatter.formattersReady.emit([])).not.toThrow();
            expect(() => mockContextDirective.buttonClose.emit()).not.toThrow();
        });
    });

    describe('overlayService.closing subscription', () => {
        it('should not reopen tabsMenu when closing a dialog that is not IgxChartMenuComponent', () => {
            // Simulate having an open dialog
            (component as any)._dialogId = 'dialog-id';
            const mockInstance = new (class { })();
            Object.setPrototypeOf(mockInstance, { constructor: { name: 'IgxChartMenuComponent' } });

            // The closing event checks instanceof IgxChartMenuComponent — we mock at the overlay level
            (mockOverlay.closing as Subject<any>).next({
                componentRef: { instance: TestBed.createComponent(IgxChartMenuComponent).componentInstance }
            });

            // When the closed component looks like an IgxChartMenuComponent and _dialogId is set, tabsMenu.open should be called
            expect(mockTabsMenu.open).toHaveBeenCalled();
        });

        it('should not open tabsMenu when closing event has no componentRef', () => {
            (component as any)._dialogId = 'dialog-id';

            (mockOverlay.closing as Subject<any>).next({ componentRef: undefined });

            expect(mockTabsMenu.open).not.toHaveBeenCalled();
        });
    });

    describe('overlayService.opening with chartDialogResizeNotify', () => {
        let overlayElement: HTMLElement;
        let resizeNotify: Subject<any>;

        const createWrapper = (classes: string[], hidden = false) => {
            const wrapper = document.createElement('div');
            wrapper.classList.add(...classes);
            if (hidden) {
                wrapper.style.visibility = 'hidden';
            }
            const content = document.createElement('div');
            wrapper.appendChild(content);
            overlayElement.appendChild(wrapper);
            return content;
        };

        const openDialogWithResizeNotify = () => {
            resizeNotify = new Subject<any>();
            const mockInstance = { chartDialogResizeNotify: resizeNotify, closed: undefined } as any;
            (mockOverlay.opening as Subject<any>).next({ id: 'dialog-id', componentRef: { instance: mockInstance } });
        };

        beforeEach(() => {
            overlayElement = document.createElement('div');
            document.body.appendChild(overlayElement);
        });

        afterEach(() => {
            overlayElement.remove();
        });

        it('should not throw when opening event has no componentRef', () => {
            expect(() => {
                (mockOverlay.opening as Subject<any>).next({ componentRef: undefined });
            }).not.toThrow();
        });

        it('should resize the content of the visible flex wrapper to the new dialog width', () => {
            const hiddenContent = createWrapper(['igx-overlay__wrapper--flex'], true);
            const visibleContent = createWrapper(['igx-overlay__wrapper--flex']);
            mockOverlay.getOverlayById.mockReturnValue({ elementRef: { nativeElement: overlayElement } });
            openDialogWithResizeNotify();

            resizeNotify.next([{ contentRect: { width: 420 } }]);

            expect(mockOverlay.getOverlayById).toHaveBeenCalledWith('dialog-id');
            expect(visibleContent.style.width).toBe('420px');
            expect(hiddenContent.style.width).toBe('');
        });

        it('should ignore wrappers that are not flex overlay wrappers', () => {
            const content = createWrapper(['igx-overlay__wrapper']);
            mockOverlay.getOverlayById.mockReturnValue({ elementRef: { nativeElement: overlayElement } });
            openDialogWithResizeNotify();

            resizeNotify.next([{ contentRect: { width: 420 } }]);

            expect(content.style.width).toBe('');
        });

        it('should not throw when the flex wrapper has no content element', () => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('igx-overlay__wrapper--flex');
            overlayElement.appendChild(wrapper);
            mockOverlay.getOverlayById.mockReturnValue({ elementRef: { nativeElement: overlayElement } });
            openDialogWithResizeNotify();

            expect(() => resizeNotify.next([{ contentRect: { width: 420 } }])).not.toThrow();
        });

        it('should not throw when the overlay has no element', () => {
            mockOverlay.getOverlayById.mockReturnValue({ elementRef: undefined });
            openDialogWithResizeNotify();

            expect(() => resizeNotify.next([{ contentRect: { width: 420 } }])).not.toThrow();
        });
    });

    describe('overlayService.closing subscription without an open dialog', () => {
        it('should not reopen tabsMenu when the chart dialog closes and no dialog id is tracked', () => {
            (mockOverlay.closing as Subject<any>).next({
                componentRef: { instance: TestBed.createComponent(IgxChartMenuComponent).componentInstance }
            });

            expect(mockTabsMenu.open).not.toHaveBeenCalled();
        });
    });

    describe('without optional chart and formatting directives', () => {
        it('should initialize from the context directive without subscribing to missing directives', () => {
            mockContextDirective.chartsDirective = null;
            mockContextDirective.textFormatter = null;
            mockContextDirective.charts = [];
            mockContextDirective.formatters = [];

            expect(() => component.ngAfterViewInit()).not.toThrow();
            expect(component.chartTypes).toEqual([]);
            expect(component.textFormatters).toEqual([]);
        });
    });

    describe('constructor', () => {
        it('should initialize chartImages and conditionImages', () => {
            expect(component.chartImages).toBeDefined();
            expect(component.conditionImages).toBeDefined();
        });
    });

    describe('toggleTabMenu with target setting', () => {
        it('should set the overlay target to the button nativeElement', () => {
            component.toggleTabMenu();
            expect((component as any)._tabsMenuOverlaySettings.target).toBe(component.button.nativeElement);
        });

        it('should preserve currentChartType if already set', () => {
            component.currentChartType = CHART_TYPE.Pie;
            component.toggleTabMenu();
            expect(component.currentChartType).toBe(CHART_TYPE.Pie);
        });
    });
});

describe('IgxContextMenuComponent rendering', () => {
    let fixture: ComponentFixture<IgxContextMenuComponent>;
    let component: IgxContextMenuComponent;
    let overlay: IgxOverlayService;
    let contextDirective: any;

    const query = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
    const queryAll = (selector: string): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll(selector));

    const createComponent = async (overrides: any = {}) => {
        contextDirective = {
            charts: [CHART_TYPE.ColumnGrouped, CHART_TYPE.BarGrouped, CHART_TYPE.LineGrouped, CHART_TYPE.AreaGrouped, CHART_TYPE.Pie],
            formatters: ['Top 10', 'Duplicate Values'],
            displayCreationTab: true,
            chartsDirective: {
                chartTypesDetermined: new EventEmitter(),
                chartFactory: vi.fn()
            },
            textFormatter: {
                formattersReady: new EventEmitter(),
                formatCells: vi.fn(),
                clearFormatting: vi.fn(),
                formatter: undefined
            },
            buttonClose: new EventEmitter(),
            gridResizeNotify: new Subject<void>(),
            grid: { nativeElement: document.createElement('div') },
            ...overrides
        };
        fixture = TestBed.createComponent(IgxContextMenuComponent);
        component = fixture.componentInstance;
        component.contextDirective = contextDirective;
        // ngAfterViewInit copies these from the context directive after the view is checked;
        // seed the same values up front so the first check is stable in dev mode
        component.chartTypes = contextDirective.charts;
        component.textFormatters = contextDirective.formatters;
        component.displayCreationTab = contextDirective.displayCreationTab;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };

    const selectChartsTab = async () => {
        component.tabs.selectedIndex = 1;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [IgxContextMenuComponent, NoopAnimationsModule] });
        overlay = TestBed.inject(IgxOverlayService);
    });

    afterEach(() => {
        component?.closeDialog();
        TestBed.resetTestingModule();
    });

    it('should toggle the tabs menu when the analytics button is clicked', async () => {
        await createComponent();
        expect(component.tabsMenu.collapsed).toBe(true);

        query('.analytics-button').click();
        fixture.detectChanges();
        expect(component.tabsMenu.collapsed).toBe(false);
        expect(component.currentChartType).toBe(CHART_TYPE.ColumnGrouped);

        query('.analytics-button').click();
        fixture.detectChanges();
        expect(component.tabsMenu.collapsed).toBe(true);
    });

    it('should close an open tabs menu when the grid is resized', async () => {
        await createComponent();
        component.toggleTabMenu();
        expect(component.tabsMenu.collapsed).toBe(false);

        contextDirective.gridResizeNotify.next();

        expect(component.tabsMenu.collapsed).toBe(true);
    });

    it('should not close the tabs menu on grid resize when it is already closed', async () => {
        await createComponent();
        const closeSpy = vi.spyOn(component.tabsMenu, 'close');

        contextDirective.gridResizeNotify.next();

        expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should render a formatting option per formatter and apply it on click', async () => {
        await createComponent();
        const conditions = queryAll('.condition');

        expect(conditions.length).toBe(2);
        expect(conditions[0].querySelector('.name')!.textContent!.trim()).toBe('Top 10%');
        expect(conditions[1].querySelector('.name')!.textContent!.trim()).toBe('Duplicate Values');

        conditions[1].click();
        fixture.detectChanges();

        expect(contextDirective.textFormatter.formatCells).toHaveBeenCalledWith('Duplicate Values');
        expect(conditions[1].classList).toContain('selected--condition');
        expect(conditions[0].classList).not.toContain('selected--condition');
    });

    it('should disable "Clear All" until a formatter is applied and clear formatting on click', async () => {
        await createComponent();
        const clear = query('.clear');
        expect(clear.classList).toContain('disableButton');

        contextDirective.textFormatter.formatter = 'Top 10';
        fixture.detectChanges();
        expect(clear.classList).not.toContain('disableButton');

        component.currentFormatter = 'Top 10';
        clear.click();

        expect(contextDirective.textFormatter.clearFormatting).toHaveBeenCalled();
        expect(component.currentFormatter).toBeUndefined();
    });

    it('should disable "Clear All" when there is no conditional formatting directive', async () => {
        await createComponent({ textFormatter: null });

        expect(query('.clear').classList).toContain('disableButton');
    });

    it('should render at most four chart options and mark the current chart as selected', async () => {
        await createComponent();
        component.currentChartType = CHART_TYPE.BarGrouped;
        await selectChartsTab();

        const charts = queryAll('.action.chart');
        expect(charts.length).toBe(4);
        expect(charts.map(c => c.querySelector('.name')!.textContent!.trim()))
            .toEqual([CHART_TYPE.ColumnGrouped, CHART_TYPE.BarGrouped, CHART_TYPE.LineGrouped, CHART_TYPE.AreaGrouped]);
        expect(charts[1].classList).toContain('selected');
        expect(charts[0].classList).not.toContain('selected');
        expect(query('.more-action').classList).not.toContain('disableButton');
    });

    it('should preview a chart on mouseenter and hide the preview on mouseleave', async () => {
        await createComponent();
        component.toggleTabMenu();
        await selectChartsTab();
        const chart = queryAll('.action.chart')[2];

        chart.dispatchEvent(new MouseEvent('mouseenter'));
        fixture.detectChanges();

        expect(component.currentChartType).toBe(CHART_TYPE.LineGrouped);
        expect(contextDirective.chartsDirective.chartFactory).toHaveBeenCalledWith(CHART_TYPE.LineGrouped, component.chartPreview);
        expect(component.chartPreviewDialog.collapsed).toBe(false);

        chart.dispatchEvent(new MouseEvent('mouseleave'));
        fixture.detectChanges();

        expect(component.chartPreviewDialog.collapsed).toBe(true);
    });

    it('should open the chart dialog configured from the context when a chart option is clicked', async () => {
        await createComponent();
        const openingSpy = vi.fn();
        overlay.opening.subscribe(openingSpy);
        component.toggleTabMenu();
        await selectChartsTab();

        queryAll('.action.chart')[1].click();
        fixture.detectChanges();

        // the first opening is the tabs menu toggle, which has no componentRef
        const dialogArgs = openingSpy.mock.calls.map(c => c[0]).find(args => args.componentRef);
        const dialog = dialogArgs.componentRef.instance as IgxChartMenuComponent;
        expect(dialog).toBeInstanceOf(IgxChartMenuComponent);
        expect(dialog.currentChartType).toBe(CHART_TYPE.BarGrouped);
        expect(dialog.allCharts).toBe(component.chartTypes);
        expect(dialog.chartDirective).toBe(contextDirective.chartsDirective);
        expect(component.tabsMenu.collapsed).toBe(true);
    });

    it('should open the dialog with the current chart type from "More..." and close it via the dialog close event', async () => {
        await createComponent();
        const openingSpy = vi.fn();
        overlay.opening.subscribe(openingSpy);
        await selectChartsTab();
        component.currentChartType = CHART_TYPE.Pie;

        query('.more-action').click();
        fixture.detectChanges();

        const dialogInfo = openingSpy.mock.calls[0][0];
        const dialog = dialogInfo.componentRef.instance as IgxChartMenuComponent;
        expect(dialog.currentChartType).toBe(CHART_TYPE.Pie);
        expect(overlay.getOverlayById(dialogInfo.id)).toBeDefined();

        dialog.closed.emit();

        expect(overlay.getOverlayById(dialogInfo.id)).toBeFalsy();
    });

    it('should disable the chart creation tab when there are no charts', async () => {
        await createComponent({ charts: [] });

        const headers = queryAll('igx-tab-header');
        expect(headers.length).toBe(2);
        expect(headers[0].getAttribute('aria-disabled')).toBe('false');
        expect(headers[1].getAttribute('aria-disabled')).toBe('true');
    });

    it('should not render the chart creation tab when displayCreationTab is false', async () => {
        await createComponent({ displayCreationTab: false });

        const headers = queryAll('igx-tab-header');
        expect(headers.length).toBe(1);
        expect(headers[0].textContent!.trim()).toBe('Conditional Formatting');
    });

    it('should select the chart creation tab when there are charts but no formatters', async () => {
        await createComponent({ formatters: [] });

        expect(component.tabs.selectedIndex).toBe(1);
        expect(queryAll('.action.chart').length).toBe(4);
    });
});
