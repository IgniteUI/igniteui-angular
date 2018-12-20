import { async, TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridModule } from './index';
import { ReorderedColumnsComponent,  PagingAndEditingComponent, GridIDNameJobTitleComponent } from '../../test-utils/grid-samples.spec';
import { PagingComponent } from '../../test-utils/grid-base-components.spec';
import { IgxNumberFilteringOperand } from '../../../public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait } from '../../test-utils/ui-interactions.spec';

describe('IgxGrid - Grid Paging', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ReorderedColumnsComponent,
                PagingComponent,
                PagingAndEditingComponent,
                GridIDNameJobTitleComponent
            ],
            imports: [IgxGridModule.forRoot(), NoopAnimationsModule]
        }).compileComponents();
    }));

    it('should paginate data UI', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        const pagingButtons = gridElement.querySelectorAll('.igx-paginator > button');

        expect(grid.paging).toBeTruthy();

        verifyGridPager(fix, 3, '1', '1 of 4', [true, true, false, false]);

        // Go to next page
        pagingButtons[2].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        verifyGridPager(fix, 3, '4', '2 of 4', [false, false, false, false]);

        // Go to last page
        pagingButtons[3].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        verifyGridPager(fix, 1, '10', '4 of 4', [false, false, true, true]);

        // Go to previous page
        pagingButtons[1].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        verifyGridPager(fix, 3, '7', '3 of 4', [false, false, false, false]);

        // Go to first page
        pagingButtons[0].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();
        verifyGridPager(fix, 3, '1', '1 of 4', [true, true, false, false]);
    }));

    it('should paginate data API', () => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();

        // Goto page 3 through API and listen for event
        const grid = fix.componentInstance.grid;
        grid.paging = true;
        grid.perPage = 3;
        fix.detectChanges();

        spyOn(grid.onPagingDone, 'emit');
        grid.paginate(2);

        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalled();
        verifyGridPager(fix, 3, '7', '3 of 4', []);

        // Go to next page
        grid.nextPage();
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
        expect(grid.isLastPage).toBe(true);
        verifyGridPager(fix, 1, '10', '4 of 4', []);

        // Go to next page when last page is selected
        grid.nextPage();
        fix.detectChanges();
        expect(grid.isLastPage).toBe(true);
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
        verifyGridPager(fix, 1, '10', '4 of 4', []);

        // Go to previous page
        grid.previousPage();
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(3);
        verifyGridPager(fix, 3, '7', '3 of 4', []);
        expect(grid.isLastPage).toBe(false);
        expect(grid.isFirstPage).toBe(false);

        // Go to first page
        grid.paginate(0);
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
        verifyGridPager(fix, 3, '1', '1 of 4', []);
        expect(grid.isFirstPage).toBe(true);

        // Go to previous page when first page is selected
        grid.previousPage();
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
        verifyGridPager(fix, 3, '1', '1 of 4', []);
        expect(grid.isFirstPage).toBe(true);

        // Go to negative page number
        grid.paginate(-3);
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(4);
        verifyGridPager(fix, 3, '1', '1 of 4', []);
    });

    it('change paging settings UI', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(3, 'Invalid page size');

        verifyGridPager(fix, 3, '1', '1 of 4', []);

        // Change page size
        const select = fix.debugElement.query(By.css('.igx-paginator > select'));
        select.triggerEventHandler('change', { target: { value: 10 } });

        tick();
        fix.detectChanges();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(10, 'Invalid page size');
        verifyGridPager(fix, 10, '1', '1 of 1', []);
    }));

    it('change paging settings API', () => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();

        // Change page size
        const grid = fix.componentInstance.grid;
        grid.paging = true;
        grid.perPage = 2;

        fix.detectChanges();
        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(2, 'Invalid page size');
        verifyGridPager(fix, 2, '1', '1 of 5', []);

        // Turn off paging
        grid.paging = false;

        fix.detectChanges();

        expect(grid.paging).toBeFalsy();
        expect(grid.perPage).toEqual(2, 'Invalid page size after paging was turned off');
        verifyGridPager(fix, 10, '1', null, []);
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        expect(gridElement.querySelector('.igx-paginator')).toBeNull();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(0);
    });

    it('change paging pages per page API', fakeAsync(() => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        const grid = fix.componentInstance.grid;
        grid.paging = true;
        grid.perPage = 2;
        grid.height = '300px';
        tick();
        fix.detectChanges();
        grid.page = 1;
        fix.detectChanges();

        const vScrollBar = grid.verticalScrollContainer.getVerticalScroll();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(2, 'Invalid page size');
        verifyGridPager(fix, 2, '3', '2 of 5', []);

        // Change page size to be 5
        spyOn(grid.onPagingDone, 'emit');
        grid.perPage = 5;
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(1);
        verifyGridPager(fix, 5, '1', '1 of 2', [true, true, false, false]);
        expect(vScrollBar.children[0].style.height).toEqual('250px');

        // Change page size to be 33
        grid.perPage = 33;
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
        verifyGridPager(fix, 5, '1', '1 of 1', [true, true, true, true]);
        expect(vScrollBar.children[0].style.height).toEqual('500px');

        // Change page size to be negative
        grid.perPage = -7;
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalledTimes(2);
        verifyGridPager(fix, 5, '1', '1 of 1', [true, true, true, true]);
        expect(vScrollBar.children[0].style.height).toEqual('500px');
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
        verifyGridPager(fix, 4, '1', '1 of 3', []);

        // Next page button click
        nextBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(1, 'Invalid page index');
        verifyGridPager(fix, 4, '5', '2 of 3', []);

        // Previous page button click
        prevBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(0, 'Invalid page index');
        verifyGridPager(fix, 4, '1', '1 of 3', []);

        // Go to 3rd page button click
        idxPageBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(2, 'Invalid page index');
        verifyGridPager(fix, 2, '9', '3 of 3', []);
    });

    it('activate/deactivate paging', () => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        let paginator = grid.nativeElement.querySelector('.igx-paginator');
        expect(paginator).toBeNull();

        grid.paging = !grid.paging;
        paginator = grid.nativeElement.querySelector('.igx-paginator');
        expect(paginator !== null).toBeTruthy();

        grid.paging = !grid.paging;
        paginator = grid.nativeElement.querySelector('.igx-paginator');
        expect(paginator).toBeNull();
    });

    it('should change not leave prev page data after scorlling', (async () => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.componentInstance.perPage = 5;
        fix.componentInstance.grid.height = '300px';
        fix.componentInstance.data = fix.componentInstance.data.slice(0, 7);
        fix.detectChanges();

        fix.componentInstance.scrollTop(25);
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
        verifyGridPager(fix, 3, '2', '1 of 3', [true, true, false, false]);

        // Filter column
        grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('equals'));
        tick();
        fix.detectChanges();
        verifyGridPager(fix, 1, '1', '1 of 1', [true, true, true, true]);

        // Reset filters
        grid.clearFilter('ID');
        tick();
        fix.detectChanges();
        verifyGridPager(fix, 3, '1', '1 of 4', [true, true, false, false]);
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
        verifyGridPager(fix, 3, '2', '1 of 3', [true, true, false, false]);
        expect(grid.totalPages).toBe(3);

        // Delete all rows on first page
        grid.deleteRow(2);
        grid.deleteRow(3);
        grid.deleteRow(4);
        fix.detectChanges();
        verifyGridPager(fix, 3, '5', '1 of 2', []);
        expect(grid.totalPages).toBe(2);

        // Delete all rows on first page
        grid.deleteRow(5);
        grid.deleteRow(6);
        grid.deleteRow(7);
        fix.detectChanges();
        verifyGridPager(fix, 3, '8', '1 of 1', [true, true, true, true]);
        expect(grid.totalPages).toBe(1);

        // Add new row
        grid.addRow({ID: 1, Name: 'Test Name',  JobTitle: 'Test Job Title'});
        fix.detectChanges();
        verifyGridPager(fix, 3, '8', '1 of 2', [true, true, false, false]);
        expect(grid.totalPages).toBe(2);

        grid.nextPage();
        fix.detectChanges();
        verifyGridPager(fix, 1, '1', '2 of 2', []);

        // Add new rows on second page
        grid.addRow({ID: 2, Name: 'Test Name',  JobTitle: 'Test Job Title'});
        grid.addRow({ID: 3, Name: 'Test Name',  JobTitle: 'Test Job Title'});
        grid.addRow({ID: 4, Name: 'Test Name',  JobTitle: 'Test Job Title'});
        fix.detectChanges();
        verifyGridPager(fix, 3, '1', '2 of 3', [false, false, false, false]);
        expect(grid.totalPages).toBe(3);

        // Go to last page and delete the row
        grid.nextPage();
        fix.detectChanges();
        grid.deleteRow(4);
        fix.detectChanges();
        verifyGridPager(fix, 3, '1', '2 of 2', [false, false, true, true]);
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
        testPagingAPI(fix, grid, (pageIndex) => grid.paginate(pageIndex));
    }));

    it('"page" property should paginate correctly', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        testPagingAPI(fix, grid, (pageIndex) => grid.page = pageIndex);
    }));

    function verifyGridPager( fix, rowsCount, firstCellValue,  pagerText,  buttonsVisibility) {
        const disabled = 'igx-button--disabled';
        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');

        expect(grid.getCellByColumn(0, 'ID').value).toMatch(firstCellValue);
        expect(grid.rowList.length).toEqual(rowsCount, 'Invalid number of rows initialized');

        if ( pagerText != null ) {
            expect(gridElement.querySelector('.igx-paginator')).toBeDefined();
            expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(1);
            expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch(pagerText);
        }
        if ( buttonsVisibility != null && buttonsVisibility.length === 4 ) {
            const pagingButtons = gridElement.querySelectorAll('.igx-paginator > button');
            expect(pagingButtons.length).toEqual(4);
            expect(pagingButtons[0].className.includes(disabled)).toBe(buttonsVisibility[0]);
            expect(pagingButtons[1].className.includes(disabled)).toBe(buttonsVisibility[1]);
            expect(pagingButtons[2].className.includes(disabled)).toBe(buttonsVisibility[2]);
            expect(pagingButtons[3].className.includes(disabled)).toBe(buttonsVisibility[3]);
        }
    }

    type pageFunc = (page: number) => void;

    function testPagingAPI(fix: ComponentFixture<PagingComponent>,
        grid: IgxGridComponent, page: pageFunc) {
        let desiredPageIndex = 2;
        page(desiredPageIndex);
        tick();
        fix.detectChanges();

        expect(grid.page).toBe(desiredPageIndex);

        // non-existent page, should not paginate
        page(-2);
        tick();
        fix.detectChanges();
        expect(grid.page).toBe(desiredPageIndex);

        // non-existent page, should not paginate
        page(666);
        tick();
        fix.detectChanges();
        expect(grid.page).toBe(desiredPageIndex);

        // first page
        desiredPageIndex = 0;
        page(desiredPageIndex);
        tick();
        fix.detectChanges();
        expect(grid.page).toBe(desiredPageIndex);

        // last page
        desiredPageIndex = grid.totalPages - 1;
        page(desiredPageIndex);
        tick();
        fix.detectChanges();
        expect(grid.page).toBe(desiredPageIndex);

        // last page + 1, should not paginate
        page(grid.totalPages);
        tick();
        fix.detectChanges();
        expect(grid.page).toBe(desiredPageIndex);
    }
});

