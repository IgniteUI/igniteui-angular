import { Component, ViewChild } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../calendar/calendar';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxFilteringOperand, IgxStringFilteringOperand, FilteringExpressionsTree, FilteringLogic } from '../../public_api';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';

const FILTER_UI_CONTAINER = 'igx-grid-filter';

describe('IgxGrid - Filtering actions', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule.forRoot()]
        })
            .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    // UI tests string column, empty input
    it('UI tests on string column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css(FILTER_UI_CONTAINER));
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        let input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css('select'));
        const options = select.nativeElement.options;
        const reset = filterUIContainer.queryAll(By.css('button'))[0];
        const close = filterUIContainer.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        // iterate over not unary conditions when input is empty
        // starts with
        verifyFilterUIPosition(filterUIContainer, grid);

        options[1].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // ends with
        options[2].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // does not contain
        options[3].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // equals
        options[4].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // does not equal
        options[5].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // empty
        options[6].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(4);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // not empty
        options[7].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(4);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // iterate over unary conditions
        // null
        options[8].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // not null
        options[9].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(5);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // changing from unary to not unary condition when input is empty - filtering should keep its state
        // contains
        options[0].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        input = filterUIContainer.query(By.directive(IgxInputDirective));
        expect(grid.rowList.length).toEqual(5);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        // input is empty but there is filtering applied, so reset button should be active !
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
    }));

    // UI tests string column with value in input
    it('UI tests on string column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.query(By.css(FILTER_UI_CONTAINER));
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css('select'));
        const options = select.nativeElement.options;
        const reset = filterUIContainer.queryAll(By.css('button'))[0];
        const close = filterUIContainer.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        // iterate over not unary conditions and fill the input
        // contains
        sendInput(input, 'Ignite', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // starts with
        options[2].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, 'Net', fix);
        fix.detectChanges();
        tick();

        verifyFilterUIPosition(filterUIContainer, grid);
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);
        expect(grid.getCellByColumn(0, 'ProductName').value).toMatch('NetAdvantage');
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // ends with
        options[3].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, 'script', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // does not contain
        options[1].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(6);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // use reset button
        reset.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // equals
        options[4].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, 'NetAdvantage', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // equals
        options[4].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, ' ', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(0);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        const emptyTemplate = fix.debugElement.query(By.css('span.igx-grid__tbody-message'));
        expect(emptyTemplate.nativeElement.offsetHeight).toBeGreaterThan(0);

        // does not equal
        options[5].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, 'NetAdvantage', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
    }));

    // UI tests number column
    it('UI tests on number column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[1];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        let input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css('select'));
        const options = select.nativeElement.options;
        const reset = filterUIContainer.queryAll(By.css('button'))[0];
        const close = filterUIContainer.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterUIContainer, grid);

        // iterate over not unary conditions and fill the input
        // equals
        sendInput(input, 0, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(0);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        let clear = filterUIContainer.query(By.css('igx-suffix'));
        expect(clear.nativeElement.offsetHeight).toBeGreaterThan(0);

        // clear input value
        input.nativeElement.value = '';
        input.nativeElement.dispatchEvent(new Event('input'));
        fix.detectChanges();
        tick();

        // iterate over not unary conditions when input is empty
        // does not equal
        options[1].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // greater than
        options[2].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // iterate over unary conditions
        // null
        options[6].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // not null
        options[7].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // empty
        options[8].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // not empty
        options[9].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toEqual(0);

        // changing from unary to not unary condition when input is empty - filtering should keep its state
        // equals - filter should keep its state and not be reset
        options[0].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        input = filterUIContainer.query(By.directive(IgxInputDirective));
        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        // input is empty but there is filtering applied, so reset button should be active !
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // iterate over not unary conditions and fill the input
        // equals
        sendInput(input, 100, fix);
        fix.detectChanges();
        tick();

        clear = filterUIContainer.query(By.css('igx-suffix'));
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(100);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(clear.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // does not equal
        options[1].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // greater than
        options[2].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, 300, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // use reset button
        reset.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(select.nativeElement.value).toMatch('equals');

        // less than
        options[3].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, 100, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        clear = filterUIContainer.query(By.css('igx-suffix'));
        clear.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(select.nativeElement.value).toMatch('lessThan');

        // greater than or equal to
        options[4].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        sendInput(input, 254, fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // less than or equal to
        options[5].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(6);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
    }));

    // UI tests boolean column
    it('UI tests on boolean column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[2];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const select = filterUIContainer.query(By.css('select'));
        const options = select.nativeElement.options;
        const reset = filterUIContainer.queryAll(By.css('button'))[0];
        const close = filterUIContainer.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterUIContainer, grid);

        // false condition
        options[2].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, 'Released').value).toBeFalsy();
        expect(grid.getCellByColumn(1, 'Released').value).toBeFalsy();
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // true condition
        options[1].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // (all) condition
        options[0].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();

        // empty condition
        options[3].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(1, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(2, 'Released').value).toEqual(undefined);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // not empty condition
        options[4].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(5);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(false);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(3, 'Released').value).toMatch('');
        expect(grid.getCellByColumn(4, 'Released').value).toBe(true);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // null condition
        options[5].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(1, 'Released').value).toEqual(null);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        // not null condition
        options[6].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(6);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(false);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(3, 'Released').value).toMatch('');
        expect(grid.getCellByColumn(4, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(5, 'Released').value).toBe(undefined);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
    }));

    // UI tests date column
    it('UI - should correctly filter date column by \'today\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const select = filterUIContainer.query(By.css('select'));

        filterUIContainer.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterUIContainer, grid);
        select.nativeElement.value = 'today';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        // only one record is populated with 'today' date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    });

    it('UI - should correctly filter date column by \'yesterday\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const select = filterUIContainer.query(By.css('select'));

        filterUIContainer.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterUIContainer, grid);

        select.nativeElement.value = 'yesterday';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        // only one record is populated with (today - 1 day)  date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    });

    it('UI - should correctly filter date column by \'this month\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'thisMonth';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[5]);
    });

    it('UI - should correctly filter date column by \'next month\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];

        const select = filterIcon.query(By.css('select'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'nextMonth';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[1]);
    });

    it('UI - should correctly filter date column by \'last month\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'lastMonth';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[0]);
    });

    it('UI - should correctly filter date column by \'empty\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'empty';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
    });

    it('UI - should correctly filter date column by \'notEmpty\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'notEmpty';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(6);
    });

    it('UI - should correctly filter date column by \'null\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'null';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
    });

    it('UI - should correctly filter date column by \'notNull\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'notNull';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    });

    it('UI - should correctly filter date column by \'thisYear\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'thisYear';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[2]);
    });

    it('UI - should correctly filter date column by \'lastYear\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'lastYear';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[4]);
    });

    it('UI - should correctly filter date column by \'nextYear\' filtering conditions', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'nextYear';
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[3]);
    });

    it('UI - should correctly filter date column by \'equals\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'equals';
        select.nativeElement.dispatchEvent(new Event('change'));
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
    }));

    it('UI - should correctly filter date column by \'doesNotEqual\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        fix.detectChanges();
        select.nativeElement.value = 'doesNotEqual';
        select.nativeElement.dispatchEvent(new Event('change'));
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(7);
    }));

    it('UI - should correctly filter date column by \'after\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'after';
        select.nativeElement.dispatchEvent(new Event('change'));
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
    }));

    it('UI - should correctly filter date column by \'before\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const select = filterIcon.query(By.css('select'));
        const input = filterIcon.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterIcon, grid);
        select.nativeElement.value = 'before';
        select.nativeElement.dispatchEvent(new Event('change'));
        input.nativeElement.click();
        fix.detectChanges();
        tick();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
    }));

    it('Should correctly select month from month view datepicker/calendar component', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const input = filterIcon.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        input.nativeElement.click();
        fix.detectChanges();
        tick();

        let calendar = fix.debugElement.query(By.css('igx-calendar'));
        const monthView = calendar.queryAll(By.css('.date__el'))[0];
        monthView.nativeElement.click();
        fix.detectChanges();
        tick();

        const firstMonth = calendar.queryAll(By.css('.igx-calendar__month'))[0];
        firstMonth.nativeElement.click();
        fix.detectChanges();
        tick();

        calendar = fix.debugElement.query(By.css('igx-calendar'));
        const month = calendar.queryAll(By.css('.date__el'))[0];

        expect(month.nativeElement.textContent.trim()).toEqual('Jan');
    }));

    it('Should correctly select year from year view datepicker/calendar component', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filterIcon = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[3];
        const input = filterIcon.query(By.directive(IgxInputDirective));

        filterIcon.triggerEventHandler('mousedown', null);
        fix.detectChanges();
        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        input.nativeElement.click();
        fix.detectChanges();
        tick();

        let calendar = fix.debugElement.query(By.css('igx-calendar'));
        const monthView = calendar.queryAll(By.css('.date__el'))[1];
        monthView.nativeElement.click();
        fix.detectChanges();
        tick();

        const firstMonth = calendar.queryAll(By.css('.igx-calendar__year'))[0];
        firstMonth.nativeElement.click();
        fix.detectChanges();
        tick();

        calendar = fix.debugElement.query(By.css('igx-calendar'));
        const month = calendar.queryAll(By.css('.date__el'))[1];

        const today = new Date(Date.now());

        const expectedResult = today.getFullYear() - 3;
        expect(month.nativeElement.textContent.trim()).toEqual(expectedResult.toString());
    }));

    // UI tests custom column
    xit('UI tests on custom column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[4];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css('select'));
        const options = select.nativeElement.options;
        const reset = filterUIContainer.queryAll(By.css('button'))[0];
        const close = filterUIContainer.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterUIContainer, grid);

        sendInput(input, 'a', fix);
        fix.detectChanges();
        tick();

        // false condition
        options[0].selected = true;
        select.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'AnotherField').value).toMatch('custom');
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
    }));

    it('Should emit onFilteringDone when we clicked reset', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filterUiContainer = fix.debugElement.query(By.css(FILTER_UI_CONTAINER));
        const grid = fix.componentInstance.grid;
        const filterVal = 'search';
        const columnName = 'ProductName';

        grid.filter(columnName, filterVal, IgxStringFilteringOperand.instance().condition('contains'));
        fix.detectChanges();

        spyOn(grid.onFilteringDone, 'emit');

        const reset = filterUiContainer.queryAll(By.css('button'))[0];
        const input = filterUiContainer.query(By.directive(IgxInputDirective));
        sendInput(input, filterVal, fix);

        reset.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();

        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(null);
    });

    it('Clicking And/Or button shows second select and input for adding second condition', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const andButton = fix.debugElement.queryAll(By.directive(IgxButtonDirective))[0];

        UIInteractions.clickElement(filterIcon);
        tick(50);
        fix.detectChanges();

        UIInteractions.clickElement(andButton);
        tick(50);
        fix.detectChanges();

        const secondExpr = fix.debugElement.queryAll(By.css('igx-grid-filter-expression'))[1];
        expect(secondExpr.attributes['name']).toEqual('secondExpr');

        discardPeriodicTasks();
    }));

    it('Unselecting And/Or hides second condition UI and removes the second filter expression', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const andButton = fix.debugElement.queryAll(By.directive(IgxButtonDirective))[0];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterUIContainer, grid);

        sendInput(input, 'I', fix);
        fix.detectChanges();
        tick();

        andButton.nativeElement.click();
        fix.detectChanges();
        tick();

        const input1 = filterUIContainer.queryAll(By.directive(IgxInputDirective))[1];
        sendInput(input1, 'g', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(2);

        andButton.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
    }));

    it('Should emit onFilteringDone when clear the input of filteringUI', () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const columnName = 'ProductName';
        const filterValue = 'search';
        grid.filter(columnName, filterValue, IgxStringFilteringOperand.instance().condition('contains'));
        fix.detectChanges();

        const filteringUIContainer = fix.debugElement.query(By.css(FILTER_UI_CONTAINER));
        const input = filteringUIContainer.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const inputGroup = filteringUIContainer.query(By.css('igx-input-group'));
        const clearSuffix = inputGroup.query(By.css('igx-suffix'));

        spyOn(grid.onFilteringDone, 'emit');

        clearSuffix.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();

        const columnFilteringExpressionsTree = grid.filteringExpressionsTree.find(columnName);
        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(columnFilteringExpressionsTree);
    });

    it('When filter column with value 0 and dataType number, filtering icon class indicator should be applied', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridheaders = fix.debugElement.queryAll(By.css('igx-grid-header'));
        const headerOfTypeNumber = gridheaders.find(gh => gh.nativeElement.classList.contains('igx-grid__th--number'));
        const filterUiContainer = headerOfTypeNumber.query(By.css(FILTER_UI_CONTAINER));
        const filterIcon = filterUiContainer.query(By.css('igx-icon'));
        const gridFilteringToggle = filterUiContainer.query(By.css('.igx-filtering__toggle'));
        const input = filterUiContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick();
        fix.detectChanges();

        sendInput(input, 0, fix);
        fix.detectChanges();
        tick();
        fix.detectChanges();

        grid.nativeElement.click();
        fix.detectChanges();
        tick();
        fix.detectChanges();

        expect(gridFilteringToggle.nativeElement.classList.contains('igx-filtering__toggle--filtered')).toBeTruthy();
    }));

    it('Choose only second unary condition should filter the grid', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const andButton = fix.debugElement.queryAll(By.directive(IgxButtonDirective))[0];

        expect(grid.rowList.length).toEqual(8);

        UIInteractions.clickElement(filterIcon);
        tick(50);
        fix.detectChanges();

        verifyFilterUIPosition(filterUIContainer, grid);

        UIInteractions.clickElement(andButton);
        tick(50);
        fix.detectChanges();

        const input = filterUIContainer.queryAll(By.directive(IgxInputDirective))[1];
        sendInput(input, 'g', fix);
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(3);
        andButton.nativeElement.click();
        fix.detectChanges();
        tick();

        expect(grid.rowList.length).toEqual(8);

        discardPeriodicTasks();
    }));

    it('Should display populated filter dialog without redrawing it', async () => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.width = '400px';
        grid.getColumnByName('ID').width = '50px';

        // filter the ProductName by two conditions
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression = {
            fieldName: 'ProductName',
            searchVal: 'Ignite',
            condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };
        const expression1 = {
            fieldName: 'ProductName',
            searchVal: 'Angular',
            condition: IgxStringFilteringOperand.instance().condition('contains')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        filteringExpressionsTree.filteringOperands.push(expression1);
        grid.filter('ProductName', null, filteringExpressionsTree);

        fix.detectChanges();

        // scroll horizontally to the right, so ProductName column is out of view
        const horScroll = grid.parentVirtDir.getHorizontalScroll();
        horScroll.scrollLeft = 1000;
        await wait(100);
        fix.detectChanges();

        // scroll horizontally to the left, so ProductName is back in view
        horScroll.scrollLeft = 0;
        await wait(100);
        fix.detectChanges();

        // click filter icon
        const filterButton = fix.debugElement.queryAll(By.css('igx-grid-filter'))[0];
        const filterIcon = filterButton.query(By.css('igx-icon'));
        filterIcon.triggerEventHandler('mousedown', null);
        filterIcon.nativeElement.click();
        await wait(100);
        fix.detectChanges();

        // await fix.whenStable();

        const filterUI = fix.debugElement.query(By.css('.igx-filtering__options'));
        // verify 'And' button is selected
        const buttonGroup = filterUI.query(By.css('igx-buttongroup'));
        const buttons = buttonGroup.queryAll(By.css('.igx-button-group__item'));
        const andButton = buttons.filter((btn) => btn.nativeElement.textContent === 'And')[0];
        expect(andButton).not.toBeNull();
        expect(andButton).toBeDefined();
        expect(andButton.nativeElement.classList.contains('igx-button-group__item--selected'))
            .toBeTruthy('AndButton is not selected');

        // verify both filter expression components are present
        const filterExpressions = filterUI.queryAll(By.css('igx-grid-filter-expression'));
        expect(filterExpressions).not.toBeNull();
        expect(filterExpressions).toBeDefined();
        expect(filterExpressions.length).toBe(2, 'not all filter-expression components are visible');
    });

    it('Should correctly create FilteringExpressionsTree and populate filterUI.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression = {
            fieldName: 'ProductName',
            searchVal: 'Ignite',
            condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };

        filteringExpressionsTree.filteringOperands.push(expression);
        grid.filteringExpressionsTree = filteringExpressionsTree;

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);

        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_CONTAINER))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const select = filterUIContainer.query(By.css('select'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        tick(100);

        verifyFilterUIPosition(filterUIContainer, grid);

        expect(select.nativeElement.value).toMatch('startsWith');
        expect(input.nativeElement.value).toMatch('Ignite');
    }));
});

export class CustomFilter extends IgxFilteringOperand {
    private static _instance: CustomFilter;

    private constructor () {
        super();
        this.operations = [{
            name: 'custom',
            isUnary: false,
            logic: (target: string): boolean => {
                return target === 'custom';
            }
        }];
    }

    public static instance(): CustomFilter {
        return this._instance || (this._instance = new this());
    }
}


@Component({
    template: `<igx-grid [data]="data" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            [filterable]="true" dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Anogther Field'" [filterable]="true"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public customFilter = CustomFilter;

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 15),
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null,
            AnotherField: 'a'
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', -1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: false,
            AnotherField: 'a'
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 1),
            Released: null,
            AnotherField: 'a'
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', 1),
            Released: true,
            AnotherField: 'a'
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: undefined,
            AnotherField: 'custom'
        }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

const expectedResults = [];

function sendInput(element, text, fix) {
    element.nativeElement.value = text;
    element.nativeElement.dispatchEvent(new Event('input'));
    fix.detectChanges();
}

function verifyFilterUIPosition(filterUIContainer, grid) {
    const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
        filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
    expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
}

// Fill expected results for 'date' filtering conditions based on the current date
function fillExpectedResults(grid: IgxGridComponent, calendar: Calendar, today) {
    // day + 15
    const dateItem0 = generateICalendarDate(grid.data[0].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month - 1
    const dateItem1 = generateICalendarDate(grid.data[1].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day - 1
    const dateItem3 = generateICalendarDate(grid.data[3].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // day + 1
    const dateItem5 = generateICalendarDate(grid.data[5].ReleaseDate,
        today.getFullYear(), today.getMonth());
    // month + 1
    const dateItem6 = generateICalendarDate(grid.data[6].ReleaseDate,
        today.getFullYear(), today.getMonth());

    let thisMonthCountItems = 1;
    let nextMonthCountItems = 1;
    let lastMonthCountItems = 1;
    let thisYearCountItems = 6;
    let nextYearCountItems = 0;
    let lastYearCountItems = 0;

    // LastMonth filter
    if (dateItem3.isPrevMonth) {
        lastMonthCountItems++;
    }
    expectedResults[0] = lastMonthCountItems;

    // thisMonth filter
    if (dateItem0.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem3.isCurrentMonth) {
        thisMonthCountItems++;
    }

    if (dateItem5.isCurrentMonth) {
        thisMonthCountItems++;
    }

    // NextMonth filter
    if (dateItem0.isNextMonth) {
        nextMonthCountItems++;
    }

    if (dateItem5.isNextMonth) {
        nextMonthCountItems++;
    }
    expectedResults[1] = nextMonthCountItems;

    // ThisYear, NextYear, PreviousYear filter

    // day + 15
    if (!dateItem0.isThisYear) {
        thisYearCountItems--;
    } else if (dateItem0.isNextYear) {
        nextYearCountItems++;
    }

    // month - 1
    if (!dateItem1.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem1.isLastYear) {
        lastYearCountItems++;
    }

    // day - 1
    if (!dateItem3.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem3.isLastYear) {
        lastYearCountItems++;
    }

    // day + 1
    if (!dateItem5.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem5.isNextYear) {
        nextYearCountItems++;
    }

    // month + 1
    if (!dateItem6.isThisYear) {
        thisYearCountItems--;
    }

    if (dateItem6.isNextYear) {
        nextYearCountItems++;
    }

    // ThisYear filter result
    expectedResults[2] = thisYearCountItems;

    // NextYear filter result
    expectedResults[3] = nextYearCountItems;

    // PreviousYear filter result
    expectedResults[4] = lastYearCountItems;

    // ThisMonth filter result
    expectedResults[5] = thisMonthCountItems;
}

function generateICalendarDate(date: Date, year: number, month: number) {
    return {
        date,
        isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
        isLastYear: isLastYear(date, year),
        isNextMonth: isNextMonth(date, year, month),
        isNextYear: isNextYear(date, year),
        isPrevMonth: isPreviousMonth(date, year, month),
        isThisYear: isThisYear(date, year)
    };
}

function isPreviousMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() < month;
    }
    return date.getFullYear() < year;
}

function isNextMonth(date: Date, year: number, month: number): boolean {
    if (date.getFullYear() === year) {
        return date.getMonth() > month;
    }
    return date.getFullYear() > year;
}

function isThisYear(date: Date, year: number): boolean {
    return date.getFullYear() === year;
}

function isLastYear(date: Date, year: number): boolean {
    return date.getFullYear() < year;
}

function isNextYear(date: Date, year: number): boolean {
    return date.getFullYear() > year;
}
