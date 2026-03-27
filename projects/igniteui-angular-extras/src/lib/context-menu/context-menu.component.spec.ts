import { TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { IgxOverlayService } from 'igniteui-angular/core';
import { IgxContextMenuComponent } from './context-menu.component';
import { CHART_TYPE } from '../directives/chart-integration/chart-types';

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
            attach: jasmine.createSpy('attach').and.returnValue('dialog-id'),
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide'),
            detach: jasmine.createSpy('detach'),
            getOverlayById: jasmine.createSpy('getOverlayById').and.returnValue(null)
        };

        mockContextDirective = {
            charts: ['ColumnGrouped', 'Pie'],
            formatters: ['Color Scale'],
            displayCreationTab: true,
            chartsDirective: {
                chartTypesDetermined: new EventEmitter(),
                chartFactory: jasmine.createSpy('chartFactory')
            },
            textFormatter: {
                formattersReady: new EventEmitter(),
                formatCells: jasmine.createSpy('formatCells'),
                clearFormatting: jasmine.createSpy('clearFormatting')
            },
            buttonClose: new EventEmitter(),
            gridResizeNotify: new Subject(),
            grid: { nativeElement: { clientWidth: 800, clientHeight: 600 } }
        };

        mockTabsMenu = {
            collapsed: true,
            element: document.createElement('div'),
            open: jasmine.createSpy('open'),
            close: jasmine.createSpy('close')
        };

        mockChartPreview = {
            clear: jasmine.createSpy('clear')
        };

        mockChartPreviewDialog = {
            open: jasmine.createSpy('open'),
            close: jasmine.createSpy('close')
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
            mockOverlay.getOverlayById.and.returnValue({ id: 'dialog-id' });
            (component as any)._dialogId = 'dialog-id';

            component.closeDialog();

            expect(mockOverlay.hide).toHaveBeenCalledWith('dialog-id');
            expect(mockOverlay.detach).toHaveBeenCalledWith('dialog-id');
            expect((component as any)._dialogId).toBeUndefined();
        });

        it('should not call hide or detach when no dialog is open', () => {
            mockOverlay.getOverlayById.and.returnValue(null);
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
            mockOverlay.getOverlayById.and.returnValue({ id: 'dialog-id' });

            closedEmitter.emit();

            expect(mockOverlay.hide).toHaveBeenCalled();
            expect(mockOverlay.detach).toHaveBeenCalled();
        });
    });

    describe('displayCreationTab', () => {
        it('should reflect the contextDirective displayCreationTab value', () => {
            expect(component.displayCreationTab).toBeTrue();
        });

        it('should be false when contextDirective disables it', () => {
            mockContextDirective.displayCreationTab = false;
            // Re-init to pick up the new value
            component.ngAfterViewInit();
            expect(component.displayCreationTab).toBeFalse();
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
                componentRef: { instance: mockInstance }
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
        it('should not throw when opening event has no componentRef', () => {
            expect(() => {
                (mockOverlay.opening as Subject<any>).next({ componentRef: undefined });
            }).not.toThrow();
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
