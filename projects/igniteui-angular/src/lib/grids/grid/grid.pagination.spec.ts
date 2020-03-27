import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridModule } from './index';
import {
    GridWithUndefinedDataComponent, PagingAndEditingComponent
} from '../../test-utils/grid-samples.spec';
import { PagingComponent } from '../../test-utils/grid-base-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';
import { DebugElement } from '@angular/core';

describe('IgxGrid - Grid Paging #grid', () => {
    configureTestSuite();

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PagingComponent,
                PagingAndEditingComponent,
                GridWithUndefinedDataComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    let fix;
    let grid;

    describe('General', () => {

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(PagingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        afterAll(fakeAsync(() => {
            fix = undefined;
            grid = undefined;
        }));

        it('should paginate data UI', () => {

            expect(grid.paging).toBeTruthy();
            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);

            // Go to next page
            GridFunctions.navigateToNextPage(grid.nativeElement);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '4', '2\xA0of\xA04', [false, false, false, false]);

            // Go to last page
            GridFunctions.navigateToLastPage(grid.nativeElement);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 1, '10', '4\xA0of\xA04', [false, false, true, true]);

            // Go to previous page
            GridFunctions.navigateToPrevPage(grid.nativeElement);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '7', '3\xA0of\xA04', [false, false, false, false]);

            // Go to first page
            GridFunctions.navigateToFirstPage(grid.nativeElement);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);
        });

        it('should paginate data API', () => {

         // Goto page 3 through API and listen for event
            spyOn(grid.onPagingDone, 'emit');
            grid.paginate(2);

            fix.detectChanges();

            expect(grid.onPagingDone.emit).toHaveBeenCalled();
            GridFunctions.verifyGridPager(fix, 3, '7', '3\xA0of\xA04', []);

            // Go to next page
            grid.nextPage();
            fix.detectChanges();

            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
            expect(grid.isLastPage).toBe(true);
            GridFunctions.verifyGridPager(fix, 1, '10', '4\xA0of\xA04', []);

            // Go to next page when last page is selected
            grid.nextPage();
            fix.detectChanges();

            expect(grid.isLastPage).toBe(true);
            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
            GridFunctions.verifyGridPager(fix, 1, '10', '4\xA0of\xA04', []);

            // Go to previous page
            grid.previousPage();
            fix.detectChanges();

            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(3);
            GridFunctions.verifyGridPager(fix, 3, '7', '3\xA0of\xA04', []);
            expect(grid.isLastPage).toBe(false);
            expect(grid.isFirstPage).toBe(false);

            // Go to first page
            grid.paginate(0);
            fix.detectChanges();

            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
            expect(grid.isFirstPage).toBe(true);

            // Go to previous page when first page is selected
            grid.previousPage();
            fix.detectChanges();

            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
            expect(grid.isFirstPage).toBe(true);

            // Go to negative page number
            grid.paginate(-3);
            fix.detectChanges();

            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
        });

        it('change paging settings UI', () => {

            expect(grid.paging).toBeTruthy();
            expect(grid.perPage).toEqual(3, 'Invalid page size');

            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);

            // Change page size
            GridFunctions.clickOnPageSelectElement(fix);
            fix.detectChanges();
            ControlsFunction.clickDropDownItem(fix, 2);

            expect(grid.paging).toBeTruthy();
            expect(grid.perPage).toEqual(10, 'Invalid page size');
            GridFunctions.verifyGridPager(fix, 10, '1', '1\xA0of\xA01', []);
        });

        it('change paging settings API', () => {

            // Change page size
            grid.perPage = 2;
            fix.detectChanges();

            expect(grid.paging).toBeTruthy();
            expect(grid.perPage).toEqual(2, 'Invalid page size');
            GridFunctions.verifyGridPager(fix, 2, '1', '1\xA0of\xA05', []);

            // Turn off paging
            grid.paging = false;
            fix.detectChanges();

            expect(grid.paging).toBeFalsy();
            expect(grid.perPage).toEqual(2, 'Invalid page size after paging was turned off');
            GridFunctions.verifyGridPager(fix, 10, '1', null, []);
            expect(GridFunctions.getGridPaginator(grid)).toBeNull();
            expect(grid.nativeElement.querySelectorAll('.igx-paginator > select').length).toEqual(0);
        });

        it('change paging pages per page API', (async () => {

            grid.height = '300px';
            grid.perPage = 2;
            await wait();
            fix.detectChanges();

            grid.page = 1;
            await wait();
            fix.detectChanges();

            expect(grid.paging).toBeTruthy();
            expect(grid.perPage).toEqual(2, 'Invalid page size');
            GridFunctions.verifyGridPager(fix, 2, '3', '2\xA0of\xA05', []);

            // Change page size to be 5
            spyOn(grid.onPagingDone, 'emit');
            grid.perPage = 5;
            await wait();
            fix.detectChanges();
            let vScrollBar = grid.verticalScrollContainer.getScroll();
            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(1);
            GridFunctions.verifyGridPager(fix, 5, '1', '1\xA0of\xA02', [true, true, false, false]);
            expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(250);
            expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(255);

            // Change page size to be 33
            grid.perPage = 33;
            await wait();
            fix.detectChanges();
            vScrollBar = grid.verticalScrollContainer.getScroll();
            // onPagingDone should be emitted only if we have a change in the page number
            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(1);
            GridFunctions.verifyGridPager(fix, 5, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(500);
            expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(510);

            // Change page size to be negative
            grid.perPage = -7;
            await wait();
            fix.detectChanges();
            expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(1);
            GridFunctions.verifyGridPager(fix, 5, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(500);
            expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(510);
        }));

        it('activate/deactivate paging', () => {

            let paginator = GridFunctions.getGridPaginator(grid);
            expect(paginator).toBeDefined();

            grid.paging = !grid.paging;
            fix.detectChanges();

            paginator = GridFunctions.getGridPaginator(grid);
            expect(paginator).toBeNull();

            grid.paging = !grid.paging;
            fix.detectChanges();

            paginator = GridFunctions.getGridPaginator(grid);
            expect(paginator).not.toBeNull();
        });

        it('should change not leave prev page data after scorlling', (async () => {

            fix.componentInstance.perPage = 5;
            fix.componentInstance.data = fix.componentInstance.data.slice(0, 7);
            grid.height = '300px';
            fix.detectChanges();

            fix.componentInstance.scrollTop(25);

            fix.detectChanges();
            await wait(100);
            grid.paginate(1);

            fix.detectChanges();
            await wait(100);
            grid.paginate(0);

            fix.detectChanges();
            await wait(100);
            expect(grid.rowList.first._rowData).toEqual(grid.data[0]);
        }));

        it('should work correct with filtering', () => {

            grid.getColumnByName('ID').filterable = true;
            fix.detectChanges();

            // Filter column
            grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '2', '1\xA0of\xA03', [true, true, false, false]);

            // Filter column
            grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('equals'));
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 1, '1', '1\xA0of\xA01', [true, true, true, true]);

            // Reset filters
            grid.clearFilter('ID');
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);
        });

        it('should work correct with crud operations', () => {

            grid.primaryKey = 'ID';
            fix.detectChanges();

            // Delete first row
            grid.deleteRow(1);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '2', '1\xA0of\xA03', [true, true, false, false]);
            expect(grid.totalPages).toBe(3);

            // Delete all rows on first page
            grid.deleteRow(2);
            grid.deleteRow(3);
            grid.deleteRow(4);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '5', '1\xA0of\xA02', []);
            expect(grid.totalPages).toBe(2);

            // Delete all rows on first page
            grid.deleteRow(5);
            grid.deleteRow(6);
            grid.deleteRow(7);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '8', '1\xA0of\xA01', [true, true, true, true]);
            expect(grid.totalPages).toBe(1);

            // Add new row
            grid.addRow({ ID: 1, Name: 'Test Name', JobTitle: 'Test Job Title' });
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '8', '1\xA0of\xA02', [true, true, false, false]);
            expect(grid.totalPages).toBe(2);

            grid.nextPage();
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 1, '1', '2\xA0of\xA02', []);

            // Add new rows on second page
            grid.addRow({ ID: 2, Name: 'Test Name', JobTitle: 'Test Job Title' });
            grid.addRow({ ID: 3, Name: 'Test Name', JobTitle: 'Test Job Title' });
            grid.addRow({ ID: 4, Name: 'Test Name', JobTitle: 'Test Job Title' });
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '1', '2\xA0of\xA03', [false, false, false, false]);
            expect(grid.totalPages).toBe(3);

            // Go to last page and delete the row
            grid.nextPage();
            fix.detectChanges();
            grid.deleteRow(4);
            fix.detectChanges();
            GridFunctions.verifyGridPager(fix, 3, '1', '2\xA0of\xA02', [false, false, true, true]);
        });

        it('should not throw when initialized in a grid with % height', () => {

            grid.paging = true;
            expect(() => {
                fix.detectChanges();
            }).not.toThrow();
        });

        it('"paginate" method should paginate correctly', () => {
            GridFunctions.testPagingAPI(fix, grid, (pageIndex) => grid.paginate(pageIndex));
        });

        it('"page" property should paginate correctly', () => {
            GridFunctions.testPagingAPI(fix, grid, (pageIndex) => grid.page = pageIndex);
        });

        it('should hide paginator when there is no data or all records are filtered out.', () => {

            GridFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);

            // Filter out all records
            grid.filter('ID', 1000, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            expect(GridFunctions.getGridPaginator(grid)).toBeNull();

            grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            expect(GridFunctions.getGridPaginator(grid)).not.toBeNull();

            grid.data = null;
            fix.detectChanges();
            expect(GridFunctions.getGridPaginator(grid)).toBeNull();

            grid.data = fix.componentInstance.data;
            fix.detectChanges();
            expect(GridFunctions.getGridPaginator(grid)).not.toBeNull();
        });
    });

    it('change paging with button', () => {

        fix = TestBed.createComponent(PagingAndEditingComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;

        const nextBtn: DebugElement = fix.debugElement.query(By.css('#nextPageBtn'));
        const prevBtn: DebugElement = fix.debugElement.query(By.css('#prevPageBtn'));
        const idxPageBtn: DebugElement = fix.debugElement.query(By.css('#idxPageBtn'));

        expect(nextBtn.nativeElement).toBeTruthy();
        expect(nextBtn.nativeElement).toBeTruthy();
        expect(nextBtn.nativeElement).toBeTruthy();

        expect(grid.paging).toBeTruthy();
        expect(grid.page).toEqual(0);
        expect(grid.perPage).toMatch('4', 'Invalid page size');
        GridFunctions.verifyGridPager(fix, 4, '1', '1\xA0of\xA03', []);

        // Next page button click
        GridFunctions.clickOnPaginatorButton(nextBtn);
        fix.detectChanges();

        expect(grid.page).toEqual(1, 'Invalid page index');
        GridFunctions.verifyGridPager(fix, 4, '5', '2\xA0of\xA03', []);

        // Previous page button click
        GridFunctions.clickOnPaginatorButton(prevBtn);
        fix.detectChanges();

        expect(grid.page).toEqual(0, 'Invalid page index');
        GridFunctions.verifyGridPager(fix, 4, '1', '1\xA0of\xA03', []);

        // Go to 3rd page button click
        GridFunctions.clickOnPaginatorButton(idxPageBtn);
        fix.detectChanges();

        expect(grid.page).toEqual(2, 'Invalid page index');
        GridFunctions.verifyGridPager(fix, 2, '9', '3\xA0of\xA03', []);
    });

    it('should not throw error when data is undefined', fakeAsync(() => {

        let errorMessage = '';
        fix = TestBed.createComponent(GridWithUndefinedDataComponent);
        try {
            fix.detectChanges();
        } catch (ex) {
            errorMessage = ex.message;
        }
        expect(errorMessage).toBe('');
        grid = fix.componentInstance.grid;
        let paginator = GridFunctions.getGridPaginator(grid);
        expect(paginator).toBeNull();
        expect(grid.rowList.length).toBe(0);
        tick(305);
        fix.detectChanges();

        paginator = GridFunctions.getGridPaginator(grid);
        expect(paginator).toBeDefined();
        expect(grid.rowList.length).toBe(5);
    }));
});

