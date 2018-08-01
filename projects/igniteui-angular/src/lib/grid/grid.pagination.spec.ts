import { Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { ReorderedColumnsComponent,  PagingAndEditingComponent, GridIDNameJobTitleComponent } from '../test-utils/grid-samples.spec';
import { PagingComponent } from '../test-utils/grid-base-components.spec';

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

        expect(grid.paging).toBeTruthy();
        expect(grid.rowList.length).toEqual(3, 'Invalid number of rows initialized');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(gridElement.querySelector('.igx-paginator')).toBeDefined();

        verifyGridPager(gridElement, '1 of 4', true, true, false, false);
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(1);

        // Go to next page
        gridElement.querySelectorAll('.igx-paginator > button')[2].dispatchEvent(new Event('click'));

        tick();
        fix.detectChanges();

        expect(grid.getCellByColumn(0, 'ID').value).toMatch('4');
        expect(grid.rowList.length).toEqual(3, 'Invalid number of rows initialized');

        verifyGridPager(gridElement, '2 of 4', false, false, false, false);

        // Go to last page
        gridElement.querySelectorAll('.igx-paginator > button')[3].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();

        expect(grid.getCellByColumn(0, 'ID').value).toMatch('10');
        expect(grid.rowList.length).toEqual(1, 'Invalid number of rows initialized');

        verifyGridPager(gridElement, '4 of 4', false, false, true, true);

        // Go to previous page
        gridElement.querySelectorAll('.igx-paginator > button')[1].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();

        expect(grid.getCellByColumn(0, 'ID').value).toMatch('7');
        expect(grid.rowList.length).toEqual(3, 'Invalid number of rows initialized');

        verifyGridPager(gridElement, '3 of 4', false, false, false, false);

        // Go to first page
        gridElement.querySelectorAll('.igx-paginator > button')[0].dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();

        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(grid.rowList.length).toEqual(3, 'Invalid number of rows initialized');

        verifyGridPager(gridElement, '1 of 4', true, true, false, false);
    }));

    function verifyGridPager( gridElement,  pagerText,  firtsPageDisable,  privPageDisabled, nextPageDisabled, lastPageDisabled) {
        const disabled = 'igx-button--disabled';
        const pagingButtons = gridElement.querySelectorAll('.igx-paginator > button');

        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch(pagerText);
        expect(pagingButtons.length).toEqual(4);
        expect(pagingButtons[0].className.includes(disabled)).toBe(firtsPageDisable);
        expect(pagingButtons[1].className.includes(disabled)).toBe(privPageDisabled);
        expect(pagingButtons[2].className.includes(disabled)).toBe(nextPageDisabled);
        expect(pagingButtons[3].className.includes(disabled)).toBe(lastPageDisabled);
    }

    it('should paginate data API', fakeAsync(() => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');

        grid.paging = true;
        grid.perPage = 3;
        // Goto page 3 through API and listen for event
        spyOn(grid.onPagingDone, 'emit');
        grid.paginate(2);

        tick();
        fix.detectChanges();

        expect(grid.onPagingDone.emit).toHaveBeenCalled();
        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch('3 of 4');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('7');
    }));

    it('change paging settings UI', fakeAsync(() => {
        const fix = TestBed.createComponent(PagingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        const disabled = 'igx-button--disabled';

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(3, 'Invalid page size');
        expect(grid.rowList.length).toEqual(3, 'Invalid number of rows initialized');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(gridElement.querySelector('.igx-paginator')).toBeDefined();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(1);

        // Change page size
        const select = fix.debugElement.query(By.css('.igx-paginator > select'));
        select.triggerEventHandler('change', { target: { value: 10 } });

        tick();
        fix.detectChanges();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(10, 'Invalid page size');
        expect(grid.rowList.length).toEqual(10, 'Invalid number of rows initialized');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(gridElement.querySelector('.igx-paginator')).toBeDefined();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(1);
    }));

    it('change paging settings API', () => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        const disabled = 'igx-button--disabled';

        // Change page size
        grid.paging = true;
        grid.perPage = 2;

        fix.detectChanges();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(2, 'Invalid page size');
        expect(grid.rowList.length).toEqual(2, 'Invalid number of rows initialized');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(gridElement.querySelector('.igx-paginator')).toBeDefined();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(1);
        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch('1 of 5');

        // Turn off paging
        grid.paging = false;

        fix.detectChanges();

        expect(grid.paging).toBeFalsy();
        expect(grid.perPage).toEqual(2, 'Invalid page size after paging was turned off');
        expect(grid.rowList.length).toEqual(10, 'Invalid number of rows initialized');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(gridElement.querySelector('.igx-paginator')).toBeNull();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(0);
    });

    it('change paging with button', () => {
        const fix = TestBed.createComponent(PagingAndEditingComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');
        const nextBtn: HTMLElement = fix.nativeElement.querySelector('#nextPageBtn');
        const prevBtn: HTMLElement = fix.nativeElement.querySelector('#prevPageBtn');
        const idxPageBtn: HTMLElement = fix.nativeElement.querySelector('#idxPageBtn');

        expect(nextBtn).toBeTruthy();
        expect(prevBtn).toBeTruthy();
        expect(idxPageBtn).toBeTruthy();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toMatch('4', 'Invalid page size');
        expect(grid.page).toEqual(0);
        expect(grid.rowList.length).toEqual(4, 'Invalid number of rows initialized');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(gridElement.querySelector('.igx-paginator')).toBeDefined();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(1);
        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch('1 of 3');

        // Next page button click
        nextBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(1, 'Invalid page index');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('5');
        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch('2 of 3');

        // Previous page button click
        prevBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(0, 'Invalid page index');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('1');
        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch('1 of 3');

        // Go to 3rd page button click
        idxPageBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(2, 'Invalid page index');
        expect(grid.getCellByColumn(0, 'ID').value).toMatch('9');
        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch('3 of 3');
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
});

