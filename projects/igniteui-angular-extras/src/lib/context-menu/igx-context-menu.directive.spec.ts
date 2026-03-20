import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxOverlayService } from 'igniteui-angular/core';
import { IgxChartIntegrationDirective } from '../directives/chart-integration/chart-integration.directive';
import { IgxConditionalFormattingDirective } from '../directives/conditional-formatting/conditional-formatting.directive';
import { IgxContextMenuDirective } from './igx-context-menu.directive';

describe('IgxContextMenuDirective', () => {
    let directive: IgxContextMenuDirective;
    let mockGrid: any;
    let mockOverlay: any;
    let mockChartsDirective: any;
    let mockTextFormatter: any;

    beforeEach(() => {
        mockGrid = {
            rangeSelected: new Subject(),
            columnSelectionChanging: new Subject(),
            selected: new Subject(),
            groupingDone: new Subject(),
            filteringDone: new Subject(),
            columnResized: new Subject(),
            columnVisibilityChanged: new Subject(),
            verticalScrollContainer: { chunkLoad: new Subject() },
            parentVirtDir: { chunkLoad: new Subject() },
            getSelectedData: jasmine.createSpy('getSelectedData').and.returnValue([]),
            getSelectedColumnsData: jasmine.createSpy('getSelectedColumnsData').and.returnValue([]),
            getSelectedRanges: jasmine.createSpy('getSelectedRanges').and.returnValue([]),
            selectedColumns: jasmine.createSpy('selectedColumns').and.returnValue([]),
            selectedCells: [],
            clearCellSelection: jasmine.createSpy('clearCellSelection'),
            nativeElement: document.createElement('div'),
            navigation: {
                isColumnFullyVisible: jasmine.createSpy('isColumnFullyVisible').and.returnValue(true),
                shouldPerformVerticalScroll: jasmine.createSpy('shouldPerformVerticalScroll').and.returnValue(false)
            },
            visibleColumns: [{ field: 'val' }],
            gridAPI: {
                get_cell_by_index: jasmine.createSpy('get_cell_by_index').and.returnValue(null)
            }
        };

        mockOverlay = {
            opening: new Subject(),
            attach: jasmine.createSpy('attach').and.returnValue('overlay-id'),
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide'),
            reposition: jasmine.createSpy('reposition'),
            getOverlayById: jasmine.createSpy('getOverlayById').and.returnValue(null)
        };

        mockChartsDirective = {
            chartTypesDetermined: new EventEmitter(),
            chartData: undefined
        };

        mockTextFormatter = {
            formattersReady: new EventEmitter()
        };

        TestBed.configureTestingModule({
            providers: [
                IgxContextMenuDirective,
                { provide: IgxGridComponent, useValue: mockGrid },
                { provide: IgxOverlayService, useValue: mockOverlay },
                { provide: IgxChartIntegrationDirective, useValue: mockChartsDirective },
                { provide: IgxConditionalFormattingDirective, useValue: mockTextFormatter }
            ]
        });

        directive = TestBed.inject(IgxContextMenuDirective);
        directive.ngOnInit();
        directive.ngAfterViewInit();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    describe('formatter and chart updates', () => {
        it('should update formatters when textFormatter emits formattersReady', () => {
            const names = ['Color Scale', 'Data Bars'];
            mockTextFormatter.formattersReady.emit(names);
            expect(directive.formatters).toEqual(names);
        });

        it('should update charts when chartsDirective emits chartTypesDetermined', () => {
            const chartsForCreation = ['Pie', 'ColumnGrouped'];
            mockChartsDirective.chartTypesDetermined.emit({ chartsForCreation });
            expect(directive.charts).toEqual(chartsForCreation);
        });
    });

    describe('range selection', () => {
        it('should set chartsDirective.chartData to selected data for a single range', fakeAsync(() => {
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 }]);
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 20 }]);

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockChartsDirective.chartData).toEqual([{ val: 10 }, { val: 20 }]);
        }));

        it('should set chartsDirective.chartData to empty array when multiple ranges are selected', fakeAsync(() => {
            mockGrid.getSelectedRanges.and.returnValue([
                { rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 },
                { rowStart: 2, rowEnd: 3, columnStart: 0, columnEnd: 0 }
            ]);

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockChartsDirective.chartData).toEqual([]);
        }));

        it('should emit buttonClose when not collapsed and a new range is selected', fakeAsync(() => {
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(closedEmitted).toBeTrue();
        }));

        it('should show the overlay button when a valid cell is found within the range', fakeAsync(() => {
            const mockCell = {
                row: { key: 0 },
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 }]);

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockOverlay.attach).toHaveBeenCalled();
            expect(mockOverlay.show).toHaveBeenCalledWith('overlay-id');
        }));

        it('should reposition the overlay when already visible and a new range is selected', fakeAsync(() => {
            const mockCell = {
                row: { key: 0 },
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 }]);
            mockOverlay.getOverlayById.and.returnValue({ settings: { positionStrategy: null } });

            // First selection — show
            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            // Second selection — reposition
            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockOverlay.reposition).toHaveBeenCalledWith('overlay-id');
        }));

        it('should close the overlay when the cell is outside the selected range', fakeAsync(() => {
            const mockCell = {
                row: { key: 5 },   // outside rowStart:0 rowEnd:1
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockOverlay.hide).toHaveBeenCalledWith('some-id');
        }));

        it('should close the overlay when the cell column is outside the selected range', fakeAsync(() => {
            const mockCell = {
                row: { key: 0 },
                column: { index: 5 },   // index - 1 = 4, outside columnEnd:0
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockOverlay.hide).toHaveBeenCalledWith('some-id');
        }));
    });

    describe('column selection', () => {
        it('should clear cell selection and update chartsDirective.chartData', fakeAsync(() => {
            mockGrid.getSelectedColumnsData.and.returnValue([{ col: 'A' }]);

            mockGrid.columnSelectionChanging.next({ newSelection: ['col1'], oldSelection: [] });
            tick(100);

            expect(mockGrid.clearCellSelection).toHaveBeenCalled();
            expect(mockChartsDirective.chartData).toEqual([{ col: 'A' }]);
        }));

        it('should close and emit buttonClose when not collapsed and column selection changes', fakeAsync(() => {
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.columnSelectionChanging.next({ newSelection: ['col1'], oldSelection: ['col0'] });
            tick(100);

            expect(closedEmitted).toBeTrue();
            expect(mockOverlay.hide).toHaveBeenCalledWith('some-id');
        }));
    });

    describe('scroll, filter, and column resize events', () => {
        beforeEach(() => {
            (directive as any)._range = { rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 };
        });

        it('should emit buttonClose on vertical scroll chunkLoad', () => {
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.verticalScrollContainer.chunkLoad.next();

            expect(closedEmitted).toBeTrue();
        });

        it('should emit buttonClose on horizontal scroll chunkLoad', () => {
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.parentVirtDir.chunkLoad.next();

            expect(closedEmitted).toBeTrue();
        });

        it('should emit buttonClose on filteringDone', () => {
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.filteringDone.next();

            expect(closedEmitted).toBeTrue();
        });

        it('should emit buttonClose on columnResized', () => {
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.columnResized.next();

            expect(closedEmitted).toBeTrue();
        });

        it('should emit buttonClose on columnVisibilityChanged after debounce', fakeAsync(() => {
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.columnVisibilityChanged.next();
            expect(closedEmitted).toBeFalse();

            tick(200);
            expect(closedEmitted).toBeTrue();
        }));

        it('should not emit buttonClose when no range is set', () => {
            (directive as any)._range = undefined;
            let closedEmitted = false;
            directive.buttonClose.subscribe(() => closedEmitted = true);

            mockGrid.filteringDone.next();

            expect(closedEmitted).toBeFalse();
        });
    });

    describe('selected and groupingDone events', () => {
        it('should clear range and close on groupingDone with expressions', () => {
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';
            (directive as any)._range = { rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 };
            mockGrid.selectedCells = [];

            mockGrid.groupingDone.next({ expressions: [{}] });

            expect((directive as any)._range).toBeUndefined();
            expect(mockOverlay.hide).toHaveBeenCalledWith('some-id');
        });

        it('should clear range and close when fewer than 2 cells are selected', () => {
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';
            (directive as any)._range = { rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 };
            mockGrid.selectedCells = [{}];

            mockGrid.selected.next({});

            expect((directive as any)._range).toBeUndefined();
            expect(mockOverlay.hide).toHaveBeenCalledWith('some-id');
        });

        it('should not close when 2 or more cells are selected without expressions', () => {
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';
            (directive as any)._range = { rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 };
            mockGrid.selectedCells = [{}, {}];

            mockGrid.selected.next({});

            expect((directive as any)._range).toBeDefined();
            expect(mockOverlay.hide).not.toHaveBeenCalled();
        });
    });

    describe('gridResizeNotify', () => {
        it('should reposition the overlay button when resized with an active overlay', () => {
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';
            (directive as any)._range = { rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 };
            const mockCell = {
                row: { key: 0 },
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            mockOverlay.getOverlayById.and.returnValue({ settings: { positionStrategy: null } });

            directive.gridResizeNotify.next();

            expect(mockOverlay.reposition).toHaveBeenCalledWith('some-id');
        });

        it('should not render the button when collapsed', () => {
            directive.gridResizeNotify.next();

            expect(mockGrid.gridAPI.get_cell_by_index).not.toHaveBeenCalled();
        });
    });

    describe('show and close guards', () => {
        it('should not re-attach or re-show when already visible', fakeAsync(() => {
            const mockCell = {
                row: { key: 0 },
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 }]);

            // First selection — triggers show()
            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockOverlay.attach).toHaveBeenCalledTimes(1);
            expect(mockOverlay.show).toHaveBeenCalledTimes(1);

            // Second selection — should reposition, not re-show
            mockOverlay.getOverlayById.and.returnValue({ settings: { positionStrategy: null } });
            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockOverlay.attach).toHaveBeenCalledTimes(1);
            expect(mockOverlay.show).toHaveBeenCalledTimes(1);
            expect(mockOverlay.reposition).toHaveBeenCalledWith('overlay-id');
        }));

        it('should reset _id to undefined after close', fakeAsync(() => {
            const mockCell = {
                row: { key: 0 },
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 }]);

            // Show the overlay
            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect((directive as any)._collapsed).toBeFalse();
            expect((directive as any)._id).toBe('overlay-id');

            // Destroy triggers close()
            directive.ngOnDestroy();

            expect((directive as any)._collapsed).toBeTrue();
            expect((directive as any)._id).toBeUndefined();
        }));
    });

    describe('renderButton edge cases', () => {
        it('should not render when _range is null', fakeAsync(() => {
            (directive as any)._range = null;
            mockGrid.rangeSelected.next(null);
            tick(200);

            // renderButton early-returns if !this._range
            expect(mockOverlay.attach).not.toHaveBeenCalled();
        }));

        it('should walk back column index when column is not fully visible', fakeAsync(() => {
            mockGrid.navigation.isColumnFullyVisible.and.callFake((idx) => idx < 1);
            const mockCell = {
                row: { key: 0 },
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 0, columnStart: 0, columnEnd: 2 }]);

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 0, columnStart: 0, columnEnd: 2 });
            tick(200);

            expect(mockGrid.navigation.isColumnFullyVisible).toHaveBeenCalled();
        }));

        it('should walk back row index when vertical scroll is needed', fakeAsync(() => {
            mockGrid.navigation.shouldPerformVerticalScroll.and.callFake((idx) => idx > 0);
            const mockCell = {
                row: { key: 0 },
                column: { index: 1 },
                nativeElement: document.createElement('div')
            };
            mockGrid.gridAPI.get_cell_by_index.and.returnValue(mockCell);
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 2, columnStart: 0, columnEnd: 0 }]);

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 2, columnStart: 0, columnEnd: 0 });
            tick(200);

            expect(mockGrid.navigation.shouldPerformVerticalScroll).toHaveBeenCalled();
        }));

        it('should close when visibleColumns does not contain the column at the resolved index', fakeAsync(() => {
            mockGrid.visibleColumns = []; // empty — no column at any index
            (directive as any)._collapsed = false;
            (directive as any)._id = 'some-id';

            mockGrid.rangeSelected.next({ rowStart: 0, rowEnd: 0, columnStart: 0, columnEnd: 0 });
            tick(200);

            // get_cell_by_index called with empty field, returns null → close()
            expect(mockOverlay.hide).toHaveBeenCalledWith('some-id');
        }));
    });
});
