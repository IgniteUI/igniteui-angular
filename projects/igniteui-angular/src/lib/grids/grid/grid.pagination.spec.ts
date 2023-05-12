import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GridWithUndefinedDataComponent } from '../../test-utils/grid-samples.spec';
import { PagingComponent, RemotePagingComponent } from '../../test-utils/grid-base-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { GridFunctions, PAGER_CLASS } from '../../test-utils/grid-functions.spec';
import { ControlsFunction, BUTTON_DISABLED_CLASS } from '../../test-utils/controls-functions.spec';

const verifyGridPager = (fix, rowsCount, firstCellValue, pagerText, buttonsVisibility) => {
    const grid = fix.componentInstance.grid;

    expect(grid.getCellByColumn(0, 'ID').value).toMatch(firstCellValue);
    expect(grid.rowList.length).toEqual(rowsCount, 'Invalid number of rows initialized');

    if (pagerText != null) {
        expect(grid.nativeElement.querySelector(PAGER_CLASS)).toBeDefined();
        expect(grid.nativeElement.querySelectorAll('igx-select').length).toEqual(1);
        expect(grid.nativeElement.querySelector('.igx-page-nav__text').textContent).toMatch(pagerText);
    }
    if (buttonsVisibility != null && buttonsVisibility.length === 4) {
        const pagingButtons = GridFunctions.getPagingButtons(grid.nativeElement);
        expect(pagingButtons.length).toEqual(4);
        expect(pagingButtons[0].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[0]);
        expect(pagingButtons[1].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[1]);
        expect(pagingButtons[2].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[2]);
        expect(pagingButtons[3].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[3]);
    }
};

describe('IgxGrid - Grid Paging #grid', () => {
    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, PagingComponent,
                GridWithUndefinedDataComponent,
                RemotePagingComponent]
        });
    }));

    let fix;
    let grid;
    let paginator;

    describe('General', () => {

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(PagingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            paginator = grid.paginator;
        }));

        it('should paginate data UI', () => {
            fix.detectChanges();

            expect(paginator).toBeDefined();
            verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);

            // Go to next page
            GridFunctions.navigateToNextPage(grid.nativeElement);
            fix.detectChanges();
            verifyGridPager(fix, 3, '4', '2\xA0of\xA04', [false, false, false, false]);

            // Go to last page
            GridFunctions.navigateToLastPage(grid.nativeElement);
            fix.detectChanges();
            verifyGridPager(fix, 1, '10', '4\xA0of\xA04', [false, false, true, true]);

            // Go to previous page
            GridFunctions.navigateToPrevPage(grid.nativeElement);
            fix.detectChanges();
            verifyGridPager(fix, 3, '7', '3\xA0of\xA04', [false, false, false, false]);

            // Go to first page
            GridFunctions.navigateToFirstPage(grid.nativeElement);
            fix.detectChanges();
            verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);
        });

        it('should paginate data API', () => {
            fix.detectChanges();

            // Goto page 3 through API and listen for event
            spyOn(paginator.pagingDone, 'emit');
            paginator.paginate(2);

            fix.detectChanges();

            expect(paginator.pagingDone.emit).toHaveBeenCalled();
            verifyGridPager(fix, 3, '7', '3\xA0of\xA04', []);

            // Go to next page
            paginator.nextPage();
            fix.detectChanges();

            expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(2);
            expect(paginator.isLastPage).toBe(true);
            verifyGridPager(fix, 1, '10', '4\xA0of\xA04', []);

            // Go to next page when last page is selected
            paginator.nextPage();
            fix.detectChanges();

            expect(paginator.isLastPage).toBe(true);
            expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(2);
            verifyGridPager(fix, 1, '10', '4\xA0of\xA04', []);

            // Go to previous page
            paginator.previousPage();
            fix.detectChanges();

            expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(3);
            verifyGridPager(fix, 3, '7', '3\xA0of\xA04', []);
            expect(paginator.isLastPage).toBe(false);
            expect(paginator.isFirstPage).toBe(false);

            // Go to first page
            paginator.paginate(0);
            fix.detectChanges();

            expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(4);
            verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
            expect(paginator.isFirstPage).toBe(true);

            // Go to previous page when first page is selected
            paginator.previousPage();
            fix.detectChanges();

            expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(4);
            verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
            expect(paginator.isFirstPage).toBe(true);

            // Go to negative page number
            paginator.paginate(-3);
            fix.detectChanges();

            expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(4);
            verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
        });

        it('should be able to set totalRecords', () => {
            paginator.perPage = 5;
            fix.detectChanges();

            expect(paginator).toBeDefined();
            expect(paginator.perPage).toEqual(5, 'Invalid page size');
            expect(grid.totalRecords).toBe(10);
            verifyGridPager(fix, 5, '1', '1\xA0of\xA02', []);

            grid.totalRecords = 4;
            fix.detectChanges();

            expect(paginator.perPage).toEqual(5, 'Invalid page size');
            expect(grid.totalRecords).toBe(4);
            verifyGridPager(fix, 4, '1', '1\xA0of\xA01', []);
        });


        it('change paging settings UI', () => {
            fix.detectChanges();
            expect(paginator).toBeDefined();
            expect(paginator.perPage).toEqual(3, 'Invalid page size');

            verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);

            // Change page size
            GridFunctions.clickOnPageSelectElement(fix);
            fix.detectChanges();
            ControlsFunction.clickDropDownItem(fix, 2);

            expect(paginator).toBeDefined();
            expect(paginator.perPage).toEqual(10, 'Invalid page size');
            verifyGridPager(fix, 10, '1', '1\xA0of\xA01', []);
        });

        it('change paging settings API', () => {
            fix.detectChanges();
            // Change page size
            paginator.perPage = 2;
            fix.detectChanges();

            expect(paginator).toBeDefined();
            expect(paginator.perPage).toEqual(2, 'Invalid page size');
            verifyGridPager(fix, 2, '1', '1\xA0of\xA05', []);

            // Turn off paging
            fix.componentInstance.paging = false;
            fix.detectChanges();

            expect(grid.paginator).not.toBeDefined();
            verifyGridPager(fix, 10, '1', null, []);
            expect(GridFunctions.getGridPaginator(grid)).toBeNull();
            expect(grid.nativeElement.querySelectorAll('.igx-paginator > select').length).toEqual(0);
        });


        it('change paging pages per page API', (async () => {
            fix.detectChanges();
            grid.height = '300px';
            paginator.perPage = 2;
            await wait();
            fix.detectChanges();

            paginator.page = 1;
            await wait();
            fix.detectChanges();

            expect(grid.paginator).toBeDefined();
            expect(paginator.perPage).toEqual(2, 'Invalid page size');
            verifyGridPager(fix, 2, '3', '2\xA0of\xA05', []);

            // Change page size to be 5
            paginator.perPage = 5;
            await wait();
            fix.detectChanges();

            grid.notifyChanges(true);
            fix.detectChanges();

            let vScrollBar = grid.verticalScrollContainer.getScroll();
            verifyGridPager(fix, 5, '1', '1\xA0of\xA02', [true, true, false, false]);
            expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(250);
            expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(255);

            // Change page size to be 33
            paginator.perPage = 33;
            await wait();
            fix.detectChanges();
            vScrollBar = grid.verticalScrollContainer.getScroll();
            // pagingDone should be emitted only if we have a change in the page number
            verifyGridPager(fix, 5, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(500);
            expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(510);

            // Change page size to be negative
            paginator.perPage = -7;
            await wait();
            fix.detectChanges();
            verifyGridPager(fix, 5, '1', '1\xA0of\xA01', [true, true, true, true]);
            expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(500);
            expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(510);
        }));

        it('activate/deactivate paging', () => {
            let paginatorEl = GridFunctions.getGridPaginator(grid);
            expect(paginatorEl).toBeDefined();

            fix.componentInstance.paging = !fix.componentInstance.paging;
            fix.detectChanges();

            paginatorEl = GridFunctions.getGridPaginator(grid);
            expect(paginatorEl).toBeNull();

            fix.componentInstance.paging = !fix.componentInstance.paging;
            fix.detectChanges();

            paginatorEl = GridFunctions.getGridPaginator(grid);
            expect(paginatorEl).not.toBeNull();
        });

        it('should change not leave prev page data after scorlling', (async () => {
            fix.componentInstance.perPage = 5;
            fix.componentInstance.data = fix.componentInstance.data.slice(0, 7);
            grid.height = '300px';
            fix.detectChanges();

            fix.componentInstance.scrollTop(25);

            fix.detectChanges();
            await wait(100);
            grid.paginator.paginate(1);

            fix.detectChanges();
            await wait(100);
            grid.paginator.paginate(0);

            fix.detectChanges();
            await wait(100);
            expect(grid.rowList.first._data).toEqual(grid.data[0]);
        }));

        it('should work correct with filtering', () => {
            grid.getColumnByName('ID').filterable = true;
            fix.detectChanges();

            // Filter column
            grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            verifyGridPager(fix, 3, '2', '1\xA0of\xA03', [true, true, false, false]);

            // Filter column
            grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('equals'));
            fix.detectChanges();
            verifyGridPager(fix, 1, '1', '1\xA0of\xA01', [true, true, true, true]);

            // Reset filters
            grid.clearFilter('ID');
            fix.detectChanges();
            verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);
        });

        it('should work correct with crud operations', () => {
            grid.primaryKey = 'ID';
            fix.detectChanges();

            // Delete first row
            grid.deleteRow(1);
            fix.detectChanges();
            verifyGridPager(fix, 3, '2', '1\xA0of\xA03', [true, true, false, false]);
            expect(paginator.totalPages).toBe(3);

            // Delete all rows on first page
            grid.deleteRow(2);
            grid.deleteRow(3);
            grid.deleteRow(4);
            fix.detectChanges();
            verifyGridPager(fix, 3, '5', '1\xA0of\xA02', []);
            expect(paginator.totalPages).toBe(2);

            // Delete all rows on first page
            grid.deleteRow(5);
            grid.deleteRow(6);
            grid.deleteRow(7);
            fix.detectChanges();
            verifyGridPager(fix, 3, '8', '1\xA0of\xA01', [true, true, true, true]);
            expect(paginator.totalPages).toBe(1);

            // Add new row
            grid.addRow({ ID: 1, Name: 'Test Name', JobTitle: 'Test Job Title' });
            fix.detectChanges();
            verifyGridPager(fix, 3, '8', '1\xA0of\xA02', [true, true, false, false]);
            expect(paginator.totalPages).toBe(2);

            paginator.nextPage();
            fix.detectChanges();
            verifyGridPager(fix, 1, '1', '2\xA0of\xA02', []);

            // Add new rows on second page
            grid.addRow({ ID: 2, Name: 'Test Name', JobTitle: 'Test Job Title' });
            grid.addRow({ ID: 3, Name: 'Test Name', JobTitle: 'Test Job Title' });
            grid.addRow({ ID: 4, Name: 'Test Name', JobTitle: 'Test Job Title' });
            fix.detectChanges();
            verifyGridPager(fix, 3, '1', '2\xA0of\xA03', [false, false, false, false]);
            expect(paginator.totalPages).toBe(3);

            // Go to last page and delete the row
            paginator.nextPage();
            fix.detectChanges();
            grid.deleteRow(4);
            fix.detectChanges();
            verifyGridPager(fix, 3, '1', '2\xA0of\xA02', [false, false, true, true]);
        });

        it('should not throw when initialized in a grid with % height', () => {
            fix.componentInstance.paging = true;
            expect(() => {
                fix.detectChanges();
            }).not.toThrow();
        });

        it('"paginate" method should paginate correctly', () => {
            const page = (index: number) => paginator.paginate(index);
            let desiredPageIndex = 2;
            page(2);
            fix.detectChanges();

            expect(paginator.page).toBe(desiredPageIndex);

            // non-existent page, should not paginate
            page(-2);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // non-existent page, should not paginate
            page(666);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // first page
            desiredPageIndex = 0;
            page(desiredPageIndex);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // last page
            desiredPageIndex = paginator.totalPages - 1;
            page(desiredPageIndex);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // last page + 1, should not paginate
            page(paginator.totalPages);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);
        });

        it('"page" property should paginate correctly', () => {
            const page = (index: number) => paginator.page = index;
            let desiredPageIndex = 2;
            page(2);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // non-existent page, should not paginate
            page(-2);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // non-existent page, should not paginate
            page(666);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // first page
            desiredPageIndex = 0;
            page(desiredPageIndex);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // last page
            desiredPageIndex = grid.paginator.totalPages - 1;
            page(desiredPageIndex);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);

            // last page + 1, should not paginate
            page(paginator.totalPages);
            fix.detectChanges();
            expect(paginator.page).toBe(desiredPageIndex);
        });
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
        expect(grid.rowList.length).toBe(0);
        tick(16);
        fix.detectChanges();

        expect(grid.rowList.length).toBe(5);
    }));

    it('paginator should show the exact number of pages when "totalRecords" is not set and "pagingMode" is remote', fakeAsync(() => {
        fix = TestBed.createComponent(RemotePagingComponent);
        fix.detectChanges();
        tick();

        grid = fix.componentInstance.grid;
        expect(grid.paginator.totalPages).toBe(4);
    }));

    it('should get correct rowIndex in remote paging', fakeAsync(() => {
        fix = TestBed.createComponent(RemotePagingComponent);
        fix.detectChanges();
        tick();

        grid = fix.componentInstance.grid;
        expect(grid.paginator.totalPages).toBe(4);
        const page = (index: number) => grid.page = index;
        const desiredPageIndex = 2;
        page(2);
        fix.detectChanges();
        tick();
        expect(grid.page).toBe(desiredPageIndex);

        expect(grid.getRowByIndex(0).cells[1].value).toBe('Debra Morton')
        expect(grid.getRowByIndex(0).viewIndex).toBe(6);
    }));
});

