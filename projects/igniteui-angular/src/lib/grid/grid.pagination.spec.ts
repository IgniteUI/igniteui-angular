import { async, TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridModule } from './index';
import { ReorderedColumnsComponent,  PagingAndEditingComponent, GridIDNameJobTitleComponent } from '../test-utils/grid-samples.spec';
import { PagingComponent } from '../test-utils/grid-base-components.spec';
import { IgxGridComponent } from './grid.component';

describe('IgxGrid - Grid Paging', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ReorderedColumnsComponent,
                PagingComponent,
                PagingAndEditingComponent,
                GridIDNameJobTitleComponent
            ],
            imports: [IgxGridModule.forRoot()]
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

    it('should paginate data API', fakeAsync(() => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.paging = true;
        grid.perPage = 3;
        fix.detectChanges();

        // Goto page 3 through API and listen for event
        spyOn(grid.onPagingDone, 'emit');
        grid.paginate(2);

        tick();
        fix.detectChanges();
        expect(grid.onPagingDone.emit).toHaveBeenCalled();
        verifyGridPager(fix, 3, '7', '3 of 4', []);
    }));

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

        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');

        // Change page size
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
        expect(gridElement.querySelector('.igx-paginator')).toBeNull();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(0);
    });

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
