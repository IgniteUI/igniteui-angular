import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridModule } from './index';
import {
    ReorderedColumnsComponent,
    PagingAndEditingComponent,
    GridIDNameJobTitleComponent,
    GridWithUndefinedDataComponent
} from '../../test-utils/grid-samples.spec';
import { PagingComponent } from '../../test-utils/grid-base-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { GridFunctions, GridPagingFunctions } from '../../test-utils/grid-functions.spec';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';

fdescribe('IgxGrid - Grid Paging #grid', () => {
    configureTestSuite();

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ReorderedColumnsComponent,
                PagingComponent,
                PagingAndEditingComponent,
                GridIDNameJobTitleComponent,
                GridWithUndefinedDataComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    it('should paginate data UI', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        const pagingButtons = GridFunctions.getPagingButtons(gridElement);

        expect(grid.paging).toBeTruthy();

        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);

        // Go to next page
        pagingButtons[2].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '4', '2\xA0of\xA04', [false, false, false, false]);

        // Go to last page
        pagingButtons[3].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 1, '10', '4\xA0of\xA04', [false, false, true, true]);

        // Go to previous page
        pagingButtons[1].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '7', '3\xA0of\xA04', [false, false, false, false]);

        // Go to first page
        pagingButtons[0].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);
    }));

    it('should paginate data API', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();

        // Goto page 3 through API and listen for event
        const grid = fix.componentInstance.grid;
        grid.paging = true;
        grid.perPage = 3;
        fix.detectChanges();
        tick(16);

        spyOn(grid.onPagingDone, 'emit');
        grid.paginate(2);

        fix.detectChanges();
        tick(16);

        expect(grid.onPagingDone.emit).toHaveBeenCalled();
        GridPagingFunctions.verifyGridPager(fix, 3, '7', '3\xA0of\xA04', []);

        // Go to next page
        grid.nextPage();
        fix.detectChanges();
        tick(16);

        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
        expect(grid.isLastPage).toBe(true);
        GridPagingFunctions.verifyGridPager(fix, 1, '10', '4\xA0of\xA04', []);

        // Go to next page when last page is selected
        grid.nextPage();
        fix.detectChanges();
        tick(16);

        expect(grid.isLastPage).toBe(true);
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
        GridPagingFunctions.verifyGridPager(fix, 1, '10', '4\xA0of\xA04', []);

        // Go to previous page
        grid.previousPage();
        fix.detectChanges();
        tick(16);

        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(3);
        GridPagingFunctions.verifyGridPager(fix, 3, '7', '3\xA0of\xA04', []);
        expect(grid.isLastPage).toBe(false);
        expect(grid.isFirstPage).toBe(false);

        // Go to first page
        grid.paginate(0);
        fix.detectChanges();
        tick(16);

        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
        expect(grid.isFirstPage).toBe(true);

        // Go to previous page when first page is selected
        grid.previousPage();
        fix.detectChanges();
        tick(16);

        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
        expect(grid.isFirstPage).toBe(true);

        // Go to negative page number
        grid.paginate(-3);
        fix.detectChanges();
        tick(16);

        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);
    }));

    it('change paging settings UI', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(3, 'Invalid page size');

        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', []);

        // Change page size
        const select = fix.debugElement.query(By.css('igx-select')).nativeElement;
        select.click();
        fix.detectChanges();
        ControlsFunction.clickDropDownItem(fix, 2);
        tick();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(10, 'Invalid page size');
        GridPagingFunctions.verifyGridPager(fix, 10, '1', '1\xA0of\xA01', []);
    }));

    it('change paging settings API', fakeAsync(() => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();
        // Change page size
        const grid = fix.componentInstance.grid;
        grid.paging = true;
        grid.perPage = 2;
        fix.detectChanges();
        tick(16);

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(2, 'Invalid page size');
        GridPagingFunctions.verifyGridPager(fix, 2, '1', '1\xA0of\xA05', []);

        // Turn off paging
        grid.paging = false;
        fix.detectChanges();
        tick(16);

        expect(grid.paging).toBeFalsy();
        expect(grid.perPage).toEqual(2, 'Invalid page size after paging was turned off');
        GridPagingFunctions.verifyGridPager(fix, 10, '1', null, []);
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        expect(gridElement.querySelector('.igx-paginator')).toBeNull();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(0);
    }));

    it('change paging pages per page API', (async () => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.height = '300px';
        grid.paging = true;
        grid.perPage = 2;
        await wait();
        fix.detectChanges();

        grid.page = 1;
        await wait();
        fix.detectChanges();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(2, 'Invalid page size');
        GridPagingFunctions.verifyGridPager(fix, 2, '3', '2\xA0of\xA05', []);

        // Change page size to be 5
        spyOn(grid.onPagingDone, 'emit');
        grid.perPage = 5;
        await wait();
        fix.detectChanges();
        let vScrollBar = grid.verticalScrollContainer.getScroll();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(1);
        GridPagingFunctions.verifyGridPager(fix, 5, '1', '1\xA0of\xA02', [true, true, false, false]);
        expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(250);
        expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(255);

        // Change page size to be 33
        grid.perPage = 33;
        await wait();
        fix.detectChanges();
        vScrollBar = grid.verticalScrollContainer.getScroll();
        // onPagingDone should be emitted only if we have a change in the page number
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(1);
        GridPagingFunctions.verifyGridPager(fix, 5, '1', '1\xA0of\xA01', [true, true, true, true]);
        expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(500);
        expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(510);

        // Change page size to be negative
        grid.perPage = -7;
        await wait();
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(1);
        GridPagingFunctions.verifyGridPager(fix, 5, '1', '1\xA0of\xA01', [true, true, true, true]);
        expect(vScrollBar.scrollHeight).toBeGreaterThanOrEqual(500);
        expect(vScrollBar.scrollHeight).toBeLessThanOrEqual(510);
    }));

    it('change paging with button', () => {
        const fix = TestBed.createComponent(PagingAndEditingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const nextBtn: HTMLElement = fix.nativeElement.querySelector('#nextPageBtn');
        const prevBtn: HTMLElement = fix.nativeElement.querySelector('#prevPageBtn');
        const idxPageBtn: HTMLElement = fix.nativeElement.querySelector('#idxPageBtn');

        expect(nextBtn).toBeTruthy();
        expect(prevBtn).toBeTruthy();
        expect(idxPageBtn).toBeTruthy();

        expect(grid.paging).toBeTruthy();
        expect(grid.page).toEqual(0);
        expect(grid.perPage).toMatch('4', 'Invalid page size');
        GridPagingFunctions.verifyGridPager(fix, 4, '1', '1\xA0of\xA03', []);

        // Next page button click
        nextBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(1, 'Invalid page index');
        GridPagingFunctions.verifyGridPager(fix, 4, '5', '2\xA0of\xA03', []);

        // Previous page button click
        prevBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(0, 'Invalid page index');
        GridPagingFunctions.verifyGridPager(fix, 4, '1', '1\xA0of\xA03', []);

        // Go to 3rd page button click
        idxPageBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(2, 'Invalid page index');
        GridPagingFunctions.verifyGridPager(fix, 2, '9', '3\xA0of\xA03', []);
    });

    it('activate/deactivate paging', fakeAsync(() => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        let paginator = GridPagingFunctions.getGridPaginator(grid)
        expect(paginator).toBeNull();

        grid.paging = !grid.paging;
        fix.detectChanges();
        tick(16);

        paginator = GridPagingFunctions.getGridPaginator(grid)
        expect(paginator !== null).toBeTruthy();

        grid.paging = !grid.paging;
        fix.detectChanges();
        tick(16);
        paginator = GridPagingFunctions.getGridPaginator(grid)
        expect(paginator).toBeNull();
    }));

    it('should change not leave prev page data after scorlling', (async () => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.componentInstance.perPage = 5;
        fix.componentInstance.grid.height = '300px';
        fix.componentInstance.data = fix.componentInstance.data.slice(0, 7);
        fix.detectChanges();

        fix.componentInstance.scrollTop(25);
        fix.detectChanges();
        await wait(100);
        fix.componentInstance.grid.paginate(1);
        fix.detectChanges();
        await wait(100);
        fix.componentInstance.grid.paginate(0);
        fix.detectChanges();
        await wait(100);
        expect(fix.componentInstance.grid.rowList.first._rowData).toEqual(fix.componentInstance.grid.data[0]);
    }));

    it('should work correct with filtering', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.getColumnByName('ID').filterable = true;

        tick();
        fix.detectChanges();

        // Filter column
        grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('greaterThan'));
        tick();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '2', '1\xA0of\xA03', [true, true, false, false]);

        // Filter column
        grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('equals'));
        tick();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 1, '1', '1\xA0of\xA01', [true, true, true, true]);

        // Reset filters
        grid.clearFilter('ID');
        tick();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);
    }));

    it('should work correct with crud operations', () => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();

        // Set primary key
        const grid = fix.componentInstance.grid;
        grid.primaryKey = 'ID';
        fix.detectChanges();

        // Delete first row
        grid.deleteRow(1);
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '2', '1\xA0of\xA03', [true, true, false, false]);
        expect(grid.totalPages).toBe(3);

        // Delete all rows on first page
        grid.deleteRow(2);
        grid.deleteRow(3);
        grid.deleteRow(4);
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '5', '1\xA0of\xA02', []);
        expect(grid.totalPages).toBe(2);

        // Delete all rows on first page
        grid.deleteRow(5);
        grid.deleteRow(6);
        grid.deleteRow(7);
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '8', '1\xA0of\xA01', [true, true, true, true]);
        expect(grid.totalPages).toBe(1);

        // Add new row
        grid.addRow({ ID: 1, Name: 'Test Name', JobTitle: 'Test Job Title' });
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '8', '1\xA0of\xA02', [true, true, false, false]);
        expect(grid.totalPages).toBe(2);

        grid.nextPage();
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 1, '1', '2\xA0of\xA02', []);

        // Add new rows on second page
        grid.addRow({ ID: 2, Name: 'Test Name', JobTitle: 'Test Job Title' });
        grid.addRow({ ID: 3, Name: 'Test Name', JobTitle: 'Test Job Title' });
        grid.addRow({ ID: 4, Name: 'Test Name', JobTitle: 'Test Job Title' });
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '2\xA0of\xA03', [false, false, false, false]);
        expect(grid.totalPages).toBe(3);

        // Go to last page and delete the row
        grid.nextPage();
        fix.detectChanges();
        grid.deleteRow(4);
        fix.detectChanges();
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '2\xA0of\xA02', [false, false, true, true]);
    });

    it('should not throw when initialized in a grid with % height', () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        const grid = fix.componentInstance.grid;
        grid.paging = true;
        expect(() => {
            fix.detectChanges();
        }).not.toThrow();
    });

    it('"paginate" method should paginate correctly', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        GridPagingFunctions.testPagingAPI(fix, grid, (pageIndex) => grid.paginate(pageIndex));
    }));

    it('"page" property should paginate correctly', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        GridPagingFunctions.testPagingAPI(fix, grid, (pageIndex) => grid.page = pageIndex);
    }));

    it('should hide paginator when there is no data or all records are filtered out.', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        tick(16);
        GridPagingFunctions.verifyGridPager(fix, 3, '1', '1\xA0of\xA04', [true, true, false, false]);

        // Filter out all records
        grid.filter('ID', 1000, IgxNumberFilteringOperand.instance().condition('greaterThan'));
        tick();
        fix.detectChanges();

        expect(GridPagingFunctions.getGridPaginator(grid)).toBeNull();

        grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('greaterThan'));
        tick();
        fix.detectChanges();
        expect(GridPagingFunctions.getGridPaginator(grid)).not.toBeNull();

        grid.data = null;
        tick();
        fix.detectChanges();
        expect(GridPagingFunctions.getGridPaginator(grid)).toBeNull();

        grid.data = fix.componentInstance.data;
        tick();
        fix.detectChanges();
        expect(GridPagingFunctions.getGridPaginator(grid)).not.toBeNull();
    }));

    it('should not throw error when data is undefined', fakeAsync(() => {
        let errorMessage = '';
        const fix = TestBed.createComponent(GridWithUndefinedDataComponent);
        try {
            fix.detectChanges();
        } catch (ex) {
            errorMessage = ex.message;
        }
        expect(errorMessage).toBe('');
        const grid = fix.componentInstance.grid;
        let paginator = GridPagingFunctions.getGridPaginator(grid);
        expect(paginator).toBeNull();
        expect(grid.rowList.length).toBe(0);
        tick(305);
        fix.detectChanges();

        paginator = GridPagingFunctions.getGridPaginator(grid);
        expect(paginator).toBeDefined();
        expect(grid.rowList.length).toBe(5);
    }));
});

