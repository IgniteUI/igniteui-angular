import { Component, ViewChild, DebugElement } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../../calendar/calendar';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import {
    IgxFilteringOperand, IgxStringFilteringOperand,
    FilteringExpressionsTree, FilteringLogic, IgxChipComponent
} from '../../../public_api';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxNumberFilteringOperand, IgxDateFilteringOperand, IgxBooleanFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxDatePickerComponent } from '../../date-picker/date-picker.component';
import { IgxGridFilteringCellComponent } from '../filtering/grid-filtering-cell.component';
import { IgxGridHeaderComponent } from '../grid-header.component';
import { IgxGridFilteringRowComponent } from '../filtering/grid-filtering-row.component';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxBadgeComponent } from '../../badge/badge.component';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridHeaderGroupComponent } from '../grid-header-group.component';
import { changei18n, getCurrentResourceStrings } from '../../core/i18n/resources';

const FILTER_UI_ROW = 'igx-grid-filtering-row';

describe('IgxGrid - Filtering actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                NoopAnimationsModule,
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
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        let input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        // iterate over not unary conditions when input is empty
        // starts with
        verifyFilterUIPosition(filterUIRow, grid);

        ddItems[2].click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // ends with
        ddItems[3].click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // does not contain
        ddItems[1].click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // equals
        ddItems[0].click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // does not equal
        ddItems[5].click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // empty
        ddItems[6].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(4);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        GridFunctions.removeFilterChipByIndex(0, filterUIRow);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // not empty
        ddItems[7].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(4);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        GridFunctions.removeFilterChipByIndex(0, filterUIRow);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // iterate over unary conditions
        // null
        ddItems[8].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        GridFunctions.removeFilterChipByIndex(0, filterUIRow);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // not null
        ddItems[9].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(5);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // changing from unary to not unary condition when input is empty - filtering should keep its state
        // contains
        ddItems[0].click();
        tick(100);
        fix.detectChanges();

        input = filterUIRow.query(By.directive(IgxInputDirective));
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
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        // iterate over not unary conditions and fill the input
        // contains
        sendInput(input, 'Ignite', fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // starts with
        ddItems[2].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, 'Net', fix);
        tick();
        fix.detectChanges();

        verifyFilterUIPosition(filterUIRow, grid);
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);
        expect(grid.getCellByColumn(0, 'ProductName').value).toMatch('NetAdvantage');
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // ends with
        ddItems[3].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, 'script', fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // does not contain
        ddItems[1].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(6);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // use reset button
        reset.nativeElement.click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // equals
        ddItems[4].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, 'NetAdvantage', fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // equals
        ddItems[4].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, ' ', fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(0);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        const emptyTemplate = fix.debugElement.query(By.css('span.igx-grid__tbody-message'));
        expect(emptyTemplate.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // does not equal
        ddItems[5].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, 'NetAdvantage', fix);
        tick();
        fix.detectChanges();

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
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[2].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        let input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        verifyFilterUIPosition(filterUIRow, grid);

        // iterate over not unary conditions and fill the input
        // equals
        sendInput(input, 0, fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(0);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        let clear = filterUIRow.query(By.css('igx-suffix'));
        expect(clear.nativeElement.offsetHeight).toBeGreaterThan(0);

        // clear input value
        GridFunctions.removeFilterChipByIndex(0, filterUIRow);
        tick();
        fix.detectChanges();

        // iterate over not unary conditions when input is empty
        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // does not equal
        ddItems[1].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // greater than
        ddItems[2].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // iterate over unary conditions
        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // empty
        ddItems[6].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // not empty
        ddItems[7].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // null
        ddItems[8].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // not null
        ddItems[9].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // changing from unary to not unary condition when input is empty - filtering should keep its state
        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // equals - filter should keep its state and not be reset
        ddItems[0].click();
        tick(100);
        fix.detectChanges();

        input = filterUIRow.query(By.directive(IgxInputDirective));
        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        // input is empty but there is filtering applied, so reset button should be active !
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // iterate over not unary conditions and fill the input
        // equals
        sendInput(input, 100, fix);
        tick();
        fix.detectChanges();

        clear = filterUIRow.query(By.css('igx-suffix'));
        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'Downloads').value).toEqual(100);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(clear.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // does not equal
        ddItems[1].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // greater than
        ddItems[2].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, 300, fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // use reset button
        reset.nativeElement.click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(filterIcon.componentInstance.iconName).toMatch('equals');

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // less than
        ddItems[3].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, 100, fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        expect(filterIcon.componentInstance.iconName).toMatch('less_than');

        GridFunctions.removeFilterChipByIndex(0, filterUIRow);
        clear.nativeElement.click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeTruthy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
        // revert to the default after
        expect(filterIcon.componentInstance.iconName).toMatch('equals');

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // greater than or equal to
        ddItems[4].click();
        tick(100);
        fix.detectChanges();

        sendInput(input, 254, fix);
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);

        // open dropdown
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // less than or equal to
        ddItems[5].click();
        tick(100);
        fix.detectChanges();

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
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[3].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;

        verifyFilterUIPosition(filterUIRow, grid);

        // false condition
        ddItems[2].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, 'Released').value).toBeFalsy();
        expect(grid.getCellByColumn(1, 'Released').value).toBeFalsy();
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // true condition
        ddItems[1].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // (all) condition
        ddItems[0].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // empty condition
        ddItems[3].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        expect(grid.getCellByColumn(0, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(1, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(2, 'Released').value).toEqual(undefined);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // not empty condition
        ddItems[4].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(5);
        expect(grid.getCellByColumn(0, 'Released').value).toBe(false);
        expect(grid.getCellByColumn(1, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(2, 'Released').value).toBe(true);
        expect(grid.getCellByColumn(3, 'Released').value).toMatch('');
        expect(grid.getCellByColumn(4, 'Released').value).toBe(true);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // null condition
        ddItems[5].click();
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        expect(grid.getCellByColumn(0, 'Released').value).toEqual(null);
        expect(grid.getCellByColumn(1, 'Released').value).toEqual(null);
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        // not null condition
        ddItems[6].click();
        tick(100);
        fix.detectChanges();

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
    it('UI - should correctly filter date column by \'today\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        verifyFilterUIPosition(filterUIRow, grid);

        GridFunctions.selectFilteringCondition('Today', ddList);
        tick(100);
        fix.detectChanges();

        // only one record is populated with 'today' date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    }));

    it('UI - should correctly filter date column by \'yesterday\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        verifyFilterUIPosition(filterUIRow, grid);

        GridFunctions.selectFilteringCondition('Yesterday', ddList);
        tick(100);
        fix.detectChanges();

        // only one record is populated with (today - 1 day)  date, this is why rows must be 1
        expect(grid.rowList.length).toEqual(1);
    }));

    it('UI - should correctly filter date column by \'this month\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        verifyFilterUIPosition(filterIcon, grid);
        GridFunctions.selectFilteringCondition('This Month', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[5]);
    }));

    it('UI - should correctly filter date column by \'next month\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Next Month', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[1]);
    }));

    it('UI - should correctly filter date column by \'last month\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Last Month', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[0]);
    }));

    it('UI - should correctly filter date column by \'empty\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Empty', ddList);
        tick(100);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2);
    }));

    it('UI - should correctly filter date column by \'notEmpty\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Not Empty', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(6);
    }));

    it('UI - should correctly filter date column by \'null\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Null', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
    }));

    it('UI - should correctly filter date column by \'notNull\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Not Null', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    }));

    it('UI - should correctly filter date column by \'thisYear\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.nativeElement.click();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('This Year', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[2]);
    }));

    it('UI - should correctly filter date column by \'lastYear\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Last Year', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[4]);
    }));

    it('UI - should correctly filter date column by \'nextYear\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const cal = fix.componentInstance.timeGenerator;
        const today = fix.componentInstance.today;

        // Fill expected results based on the current date
        fillExpectedResults(grid, cal, today);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();
        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Next Year', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(expectedResults[3]);
    }));

    it('UI - should correctly filter date column by \'equals\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();

        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Equals', ddList);

        input.nativeElement.click();
        tick();
        fix.detectChanges();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        flush();
        fix.detectChanges();

        input.nativeElement.dispatchEvent(new Event('change'));
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
    }));

    it('UI - should correctly filter date column by \'doesNotEqual\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Does Not Equal', ddList);

        input.nativeElement.click();
        tick();
        fix.detectChanges();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        flush();
        fix.detectChanges();

        input.nativeElement.dispatchEvent(new Event('change'));
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    }));

    it('UI - should correctly filter date column by \'after\' filtering conditions', async() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        fix.detectChanges();
        await wait();

        verifyFilterUIPosition(filterIcon, grid);

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const ddItems = ddList.nativeElement.children;
        let i;
        for (i = 0; i < ddItems.length; i++) {
            if (ddItems[i].textContent === 'After') {
                ddItems[i].click();
                await wait(100);
                return;
            }
        }

        input.nativeElement.click();
        fix.detectChanges();
        await wait(100);

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        fix.detectChanges();
        await wait();

        input.nativeElement.dispatchEvent(new Event('change'));
        fix.detectChanges();
        await wait();

        expect(grid.rowList.length).toEqual(3);
    });

    it('UI - should correctly filter date column by \'before\' filtering conditions', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        verifyFilterUIPosition(filterIcon, grid);
        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        GridFunctions.selectFilteringCondition('Before', ddList);

        input.nativeElement.click();
        tick();
        fix.detectChanges();

        const calendar = fix.debugElement.query(By.css('igx-calendar'));
        const currentDay = calendar.query(By.css('span.igx-calendar__date--current'));
        currentDay.nativeElement.click();
        flush();
        fix.detectChanges();

        input.nativeElement.dispatchEvent(new Event('change'));
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
    }));

    it('Should correctly select month from month view datepicker/calendar component', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        input.nativeElement.click();
        tick();
        fix.detectChanges();

        let calendar = fix.debugElement.query(By.css('igx-calendar'));
        const monthView = calendar.queryAll(By.css('.igx-calendar-picker__date'))[0];
        monthView.nativeElement.click();
        tick();
        fix.detectChanges();

        const firstMonth = calendar.queryAll(By.css('.igx-calendar__month'))[0];
        firstMonth.nativeElement.click();
        tick();
        fix.detectChanges();

        calendar = fix.debugElement.query(By.css('igx-calendar'));
        const month = calendar.queryAll(By.css('.igx-calendar-picker__date'))[0];

        expect(month.nativeElement.textContent.trim()).toEqual('Jan');
    }));

    it('Should correctly select year from year view datepicker/calendar component', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        input.nativeElement.click();
        tick();
        fix.detectChanges();

        let calendar = fix.debugElement.query(By.css('igx-calendar'));
        const monthView = calendar.queryAll(By.css('.igx-calendar-picker__date'))[1];
        monthView.nativeElement.click();
        tick();
        fix.detectChanges();

        const firstMonth = calendar.queryAll(By.css('.igx-calendar__year'))[0];
        firstMonth.nativeElement.click();
        tick();
        fix.detectChanges();

        calendar = fix.debugElement.query(By.css('igx-calendar'));
        const month = calendar.queryAll(By.css('.igx-calendar-picker__date'))[1];

        const today = new Date(Date.now());

        const expectedResult = today.getFullYear() - 3;
        expect(month.nativeElement.textContent.trim()).toEqual(expectedResult.toString());
    }));

    // UI tests custom column
    it('UI tests on custom column', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[5].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        const reset = filterUIRow.queryAll(By.css('button'))[0];
        const close = filterUIRow.queryAll(By.css('button'))[1];

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        sendInput(input, 'a', fix);
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        // false condition
        GridFunctions.selectFilteringCondition('False', ddList);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(grid.getCellByColumn(0, 'AnotherField').value).toMatch('custom');
        expect(close.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
        expect(reset.nativeElement.classList.contains('igx-button--disabled')).toBeFalsy();
    }));

    it('Should emit onFilteringDone when we clicked reset', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filterVal = 'search';
        const columnName = 'ProductName';

        grid.filter(columnName, filterVal, IgxStringFilteringOperand.instance().condition('contains'));
        tick(100);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const idCellChips = filteringCells[1].queryAll(By.css('igx-chip'));
        expect(idCellChips.length).toBe(1);
        spyOn(grid.onFilteringDone, 'emit');

        idCellChips[0].nativeElement.click();
        tick();
        fix.detectChanges();

        const filterUiRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const reset = filterUiRow.queryAll(By.css('button'))[0];
        const input = filterUiRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterVal, fix);

        reset.nativeElement.dispatchEvent(new MouseEvent('click'));
        tick(100);
        fix.detectChanges();

        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(null);
    }));

    it('Should apply And/Or button when adding more than expression', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        UIInteractions.clickElement(filterIcon);
        tick();
        fix.detectChanges();

        // apply two filters for And/Or button
        GridFunctions.filterBy('Starts With', 'I', fix);
        GridFunctions.filterBy('Ends With', 'f', fix);

        const andButton = fix.debugElement.queryAll(By.css('#operand'));

        tick(100);
        fix.detectChanges();

        expect(andButton.length).toEqual(1);

        discardPeriodicTasks();
    }));

    it('Removing second condition removes the And/Or button', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

        expect(grid.rowList.length).toEqual(8);

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        verifyFilterUIPosition(filterUIRow, grid);

        GridFunctions.filterBy('Contains', 'I', fix);
        tick(100);
        fix.detectChanges();

        GridFunctions.filterBy('Contains', 'g', fix);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
        let andButton = fix.debugElement.queryAll(By.css('#operand'));
        expect(andButton.length).toEqual(1);

        // remove the second chip
        const secondChip = filterUIRow.queryAll(By.css('igx-chip'))[1];
        secondChip.query(By.css('div.igx-chip__remove')).nativeElement.click();
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(3);
        andButton = fix.debugElement.queryAll(By.css('#operand'));
        expect(andButton.length).toEqual(0);
    }));

    it('Should emit onFilteringDone when clear the input of filteringUI', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const columnName = 'ProductName';
        const filterValue = 'search';
        grid.filter(columnName, filterValue, IgxStringFilteringOperand.instance().condition('contains'));
        tick(100);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const inputGroup = filterUIRow.query(By.css('igx-input-group'));
        const clearSuffix = inputGroup.query(By.css('igx-suffix'));

        spyOn(grid.onFilteringDone, 'emit');

        clearSuffix.nativeElement.dispatchEvent(new MouseEvent('click'));
        GridFunctions.simulateKeyboardEvent(input, 'keydown', 'Enter');
        tick(100);
        fix.detectChanges();

        const columnFilteringExpressionsTree = grid.filteringExpressionsTree.find(columnName);
        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(columnFilteringExpressionsTree);
    }));

    it('When filter column with value 0 and dataType number, filtering chip should be applied', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridheaders = fix.debugElement.queryAll(By.css('igx-grid-header'));
        const headerOfTypeNumber = gridheaders.find(gh => gh.nativeElement.classList.contains('igx-grid__th--number'));
        const filterCellsForTypeNumber = headerOfTypeNumber.parent.query(By.css('igx-grid-filtering-cell'));
        filterCellsForTypeNumber.query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();

        const filterUiRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUiRow.query(By.css('igx-icon'));
        const input = filterUiRow.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        tick();
        fix.detectChanges();

        sendInput(input, 0, fix);
        tick();
        fix.detectChanges();

        grid.nativeElement.click();
        tick();
        fix.detectChanges();

        filterUiRow.queryAll(By.css('button'))[1].nativeElement.click();
        tick();
        fix.detectChanges();
        expect(filterCellsForTypeNumber.queryAll(By.css('.igx-filtering-chips')).length).toBe(1);
    }));

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

        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();

        const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_ROW))[0];
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));

        filterIcon.nativeElement.click();
        tick(100);
        fix.detectChanges();

        verifyFilterUIPosition(filterUIContainer, grid);

        const selectedItem = filterUIContainer.query(By.css('.igx-drop-down__item--selected'));
        expect(selectedItem.nativeElement.textContent).toMatch('Starts With');
        expect(input.nativeElement.value).toMatch('Ignite');
    }));
});

describe('IgxGrid - Filtering Row UI actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent,
                IgxGridFilteringScrollComponent,
                IgxGridFilteringMCHComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('should render Filter chip for filterable columns and render empty cell for a column when filterable is set to false',
        fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();

            const grid = fix.componentInstance.grid;
            grid.width = '1500px';
            fix.detectChanges();

            const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
            const filteringChips = fix.debugElement.queryAll(By.css('.igx-filtering-chips'));
            expect(filteringCells.length).toBe(6);
            expect(filteringChips.length).toBe(5);

            let idCellChips = filteringCells[0].queryAll(By.css('.igx-filtering-chips'));
            expect(idCellChips.length).toBe(0);

            grid.getColumnByName('ID').filterable = true;
            fix.detectChanges();
            tick(100);

            idCellChips = filteringCells[0].queryAll(By.css('.igx-filtering-chips'));
            expect(idCellChips.length).toBe(1);
        }));

    it('should render correct input and dropdown in filter row for different column types', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const numberCellChip = filteringCells[2].query(By.css('igx-chip'));
        const boolCellChip = filteringCells[3].query(By.css('igx-chip'));
        const dateCellChip = filteringCells[4].query(By.css('igx-chip'));
        // open for string
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        checkUIForType('string', fix.debugElement);

        // close
        let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        let close = filterUIRow.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        tick(100);
        fix.detectChanges();

        // open for number
        numberCellChip.nativeElement.click();
        fix.detectChanges();
        checkUIForType('number', fix.debugElement);

        // close
        filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        close = filterUIRow.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        tick(100);
        fix.detectChanges();

        // open for date
        dateCellChip.nativeElement.click();
        fix.detectChanges();
        checkUIForType('date', fix.debugElement);

        // close
        filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        close = filterUIRow.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        tick(100);
        fix.detectChanges();

        // open for bool
        boolCellChip.nativeElement.click();
        fix.detectChanges();
        checkUIForType('bool', fix.debugElement);

        // close
        filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        close = filterUIRow.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        tick(100);
        fix.detectChanges();
    }));

    it('should apply  multiple conditions to grid immediately while the filter row is still open', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const numberCellChip = filteringCells[2].query(By.css('igx-chip'));
        const boolCellChip = filteringCells[3].query(By.css('igx-chip'));
        const dateCellChip = filteringCells[4].query(By.css('igx-chip'));
        const grid = fix.componentInstance.grid;

        // open for string
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Starts With', 'I', fix);
        expect(grid.rowList.length).toEqual(2);
        GridFunctions.filterBy('Ends With', 'r', fix);
        expect(grid.rowList.length).toEqual(1);

        // Reset and Close
        GridFunctions.resetFilterRow(fix);
        GridFunctions.closeFilterRow(fix);

        // open for number
        numberCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Less Than', '100', fix);
        expect(grid.rowList.length).toEqual(3);
        GridFunctions.filterBy('Greater Than', '10', fix);
        expect(grid.rowList.length).toEqual(1);

        // Reset and Close
        GridFunctions.resetFilterRow(fix);
        GridFunctions.closeFilterRow(fix);

        // open for bool
        boolCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('False', '', fix);
        expect(grid.rowList.length).toEqual(2);
        GridFunctions.filterBy('Empty', '', fix);
        expect(grid.rowList.length).toEqual(3);

        // Reset and Close
        GridFunctions.resetFilterRow(fix);
        GridFunctions.closeFilterRow(fix);

        // open for date
        dateCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Today', '', fix);
        expect(grid.rowList.length).toEqual(1);
        GridFunctions.filterBy('Null', '', fix);
        expect(grid.rowList.length).toEqual(0);
    }));

    it('should render navigation arrows in the filtering row when chips don\'t fit.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // open for string
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        for (let i = 0; i < 10; i++) {
            GridFunctions.filterBy('Starts With', 'I', fix);
        }
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const startArrow = filterUIRow.query(By.css('.igx-grid__filtering-row-scroll-start'));
        const endArrow = filterUIRow.query(By.css('.igx-grid__filtering-row-scroll-end'));

        expect(startArrow).not.toBe(null);
        expect(endArrow).not.toBe(null);
    }));

    it('should update UI when chip is removed from header cell.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        let stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const grid = fix.componentInstance.grid;

        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Starts With', 'I', fix);
        expect(grid.rowList.length).toEqual(2);

        GridFunctions.closeFilterRow(fix);

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // remove chip
        const removeButton = stringCellChip.query(By.css('div.igx-chip__remove'));
        removeButton.nativeElement.click();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
    }));

    it('should update UI when chip is removed from filter row.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        const grid = fix.componentInstance.grid;

        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Starts With', 'I', fix);
        expect(grid.rowList.length).toEqual(2);

        // remove from row
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        GridFunctions.removeFilterChipByIndex(0, filterUIRow);
        tick(100);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(8);
    }));

    it('should not render chip in header if condition that requires value is applied and then value is cleared in filter row.',
        fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();

            let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
            const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
            const grid = fix.componentInstance.grid;

            // filter string col
            stringCellChip.nativeElement.click();
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));

            // open dropdown
            const filterIcon = filterUIRow.query(By.css('igx-icon'));
            filterIcon.nativeElement.click();
            fix.detectChanges();

            const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
            const ddItems = ddList.nativeElement.children;
            let i;
            for ( i = 0; i < ddItems.length; i++) {
                if (ddItems[i].textContent === 'Starts With') {
                    ddItems[i].click();
                    tick(100);
                    return;
                }
            }

            const input = filterUIRow.query(By.directive(IgxInputDirective));
            input.nativeElement.value = 'I';
            input.nativeElement.dispatchEvent(new Event('input'));
            fix.detectChanges();

            const clearButton = filterUIRow.query(By.css('igx-suffix'));

            clearButton.nativeElement.click();

            tick();
            fix.detectChanges();

            GridFunctions.closeFilterRow(fix);

            // check no condition is applied
            expect(grid.rowList.length).toEqual(8);

            filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
            const stringCellText = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
            expect(stringCellText.nativeElement.textContent).toBe('Filter');
        }));

    it('Should correctly update empty filter cells when scrolling horizontally.', async() => {
        const fix = TestBed.createComponent(IgxGridFilteringScrollComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        let emptyFilterCells = fix.debugElement.queryAll(By.directive(IgxGridFilteringCellComponent)).filter((cell) => {
            return cell.nativeElement.children.length === 0;
        });
        expect(emptyFilterCells.length).toEqual(1);

        let emptyFilterHeader = emptyFilterCells[0].parent.query(By.directive(IgxGridHeaderComponent));
        expect(emptyFilterHeader.componentInstance.column.field).toEqual('Downloads');

        // Scroll to the right
        grid.parentVirtDir.getHorizontalScroll().scrollLeft = 300;
        await wait();
        fix.detectChanges();

        emptyFilterCells = fix.debugElement.queryAll(By.directive(IgxGridFilteringCellComponent)).filter((cell) => {
            return cell.nativeElement.children.length === 0;
        });
        expect(emptyFilterCells.length).toEqual(1);

        emptyFilterHeader = emptyFilterCells[0].parent.query(By.directive(IgxGridHeaderComponent));
        expect(emptyFilterHeader.componentInstance.column.field).toEqual('Downloads');
    });

    it('Should correctly update filtering row rendered when changing current column by clicking on a header.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const headers = fix.debugElement.queryAll(By.directive(IgxGridHeaderComponent));
        const numberHeader = headers[2];
        const boolHeader = headers[3];
        const dateHeader = headers[4];
        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        stringCellChip.click();
        fix.detectChanges();

        checkUIForType('string', fix.debugElement);

        // Click on number column.
        numberHeader.nativeElement.click();
        fix.detectChanges();

        checkUIForType('number', fix.debugElement);

        // Click on boolean column
        boolHeader.nativeElement.click();
        fix.detectChanges();

        checkUIForType('bool', fix.debugElement);

        // Click on date column
        dateHeader.nativeElement.click();
        fix.detectChanges();

        checkUIForType('date', fix.debugElement);
    }));

    it('Should correctly render read-only input when selecting read-only condition and should create a chip.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        stringCellChip.click();
        fix.detectChanges();

        GridFunctions.openFilterDD(fix.debugElement);
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const input = filteringRow.query(By.directive(IgxInputDirective));

        GridFunctions.selectFilteringCondition('Empty', dropdownList);
        fix.detectChanges();

        const chips = filteringRow.queryAll(By.directive(IgxChipComponent));
        expect(chips.length).toEqual(1);
        expect(chips[0].componentInstance.selected).toBeTruthy();
        expect(GridFunctions.getChipText(chips[0])).toEqual('Empty');
        expect(input.properties.readOnly).toBeTruthy();

        expect(grid.rowList.length).toEqual(4);
        grid.rowList.forEach((rowComp) => {
            expect(rowComp.cells.toArray()[1].nativeElement.innerText).toEqual('');
        });
    }));

    it('Should focus input .', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        stringCellChip.click();
        fix.detectChanges();

        // Open dropdown
        GridFunctions.openFilterDD(fix.debugElement);
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        const input = filteringRow.query(By.directive(IgxInputDirective));

        // Select condition with input
        GridFunctions.selectFilteringCondition('Contains', dropdownList);

        // Check focus is kept
        expect(document.activeElement).toEqual(input.nativeElement);

        // Set input and confirm
        sendInput(input, 'a', fix);

        // Check a chip is created after input and is marked as selected.
        const filterChip = filteringRow.query(By.directive(IgxChipComponent));
        expect(filterChip).toBeTruthy();
        expect(filterChip.componentInstance.selected).toBeTruthy();
        expect(input.componentInstance.value).toEqual('a');

        GridFunctions.simulateKeyboardEvent(input, 'keydown', 'Enter');
        fix.detectChanges();

        // Check focus is kept and chips is no longer selected.
        expect(filterChip.componentInstance.selected).toBeFalsy();
        expect(grid.rowList.length).toEqual(3);
        expect(document.activeElement).toEqual(input.nativeElement);
        expect(input.componentInstance.value).toEqual(null);

        GridFunctions.clickChip(filterChip);
        fix.detectChanges();

        expect(document.activeElement).toEqual(input.nativeElement);
        expect(input.componentInstance.value).toEqual('a');
        expect(filterChip.componentInstance.selected).toBeTruthy();

        GridFunctions.filterBy('Starts With', 'S', fix);
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
    }));

    it('Should correctly render reset button and reset initial state of the conditions when clicked.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        let initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        stringCellChip.click();
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const buttons = filteringRow.queryAll(By.directive(IgxButtonDirective));
        const removeButton = buttons[0];

        expect(removeButton.componentInstance.disabled).toBeTruthy();

        GridFunctions.filterBy('Contains', 'o', fix);
        fix.detectChanges();

        let filterRowChips = filteringRow.queryAll(By.directive(IgxChipComponent));
        expect(grid.rowList.length).toEqual(3);
        expect(filterRowChips.length).toEqual(1);
        expect(removeButton.componentInstance.disabled).toBeFalsy();

        GridFunctions.filterBy('Contains', 'a', fix);
        fix.detectChanges();

        filterRowChips = filteringRow.queryAll(By.directive(IgxChipComponent));
        expect(grid.rowList.length).toEqual(2);
        expect(filterRowChips.length).toEqual(2);
        expect(removeButton.componentInstance.disabled).toBeFalsy();

        GridFunctions.resetFilterRow(fix);

        filterRowChips = filteringRow.queryAll(By.directive(IgxChipComponent));
        expect(grid.rowList.length).toEqual(8);
        expect(filterRowChips.length).toEqual(0);
        expect(removeButton.componentInstance.disabled).toBeTruthy();

        GridFunctions.closeFilterRow(fix);

        initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        expect(grid.rowList.length).toEqual(8);
        expect(initialChips.length).toEqual(5);
    }));

    it('should update UI when filtering via the API.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.width = '1600px';
        grid.columnWidth = '400px';
        fix.detectChanges();

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
        grid.filter('Released', true, IgxBooleanFilteringOperand.instance().condition('false'));
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(0);

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChips = filteringCells[1].queryAll(By.css('igx-chip'));
        const boolCellChips = filteringCells[3].queryAll(By.css('igx-chip'));
        const strConnector = filteringCells[1].query(By.css('.igx-filtering-chips__connector'));

        expect(strConnector.nativeElement.textContent.trim()).toBe('And');
        expect(stringCellChips.length).toBe(2);
        expect(boolCellChips.length).toBe(1);

        const stringCellText1 = stringCellChips[0].query(By.css('.igx-chip__content'));
        expect(stringCellText1.nativeElement.textContent.trim()).toBe('Ignite');

        const stringCellText2 = stringCellChips[1].query(By.css('.igx-chip__content'));
        expect(stringCellText2.nativeElement.textContent.trim()).toBe('Angular');

        const boolCellText = boolCellChips[0].query(By.css('.igx-chip__content'));
        expect(boolCellText.nativeElement.textContent.trim()).toBe('False');
    }));

    it('should display view more icon in filter cell if chips don\'t fit in the cell.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.columnWidth = '200px';
        fix.detectChanges();

        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));

        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Starts With', 'IgniteUI', fix);
        GridFunctions.filterBy('Contains', 'for', fix);
        GridFunctions.closeFilterRow(fix);

        // check 1 chip and view more icon is displayed.
        const chips = filteringCells[1].queryAll(By.css('igx-chip'));
        expect(chips.length).toEqual(1);
        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const fcIndicator = filteringCells[1].query(By.css('.igx-grid__filtering-cell-indicator'));
        expect(fcIndicator).not.toBe(null);
        const badge = fcIndicator.query(By.directive(IgxBadgeComponent));
        expect(badge.componentInstance.value).toBe(1);
    }));

    it('Should allow setting filtering conditions through filteringExpressionsTree.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.columnWidth = '150px';
        fix.detectChanges();

        // Add initial filtering conditions
        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        columnsFilteringTree.filteringOperands = [
            { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
            { fieldName: 'ProductName', searchVal: 'o', condition: IgxStringFilteringOperand.instance().condition('contains') }
        ];
        gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        fix.detectChanges();

        const colChips = GridFunctions.getFilterChipsForColumn('ProductName', fix);
        const colOperands = GridFunctions.getFilterOperandsForColumn('ProductName', fix);
        const colIndicator = GridFunctions.getFilterIndicatorForColumn('ProductName', fix);

        expect(grid.rowList.length).toEqual(2);
        expect(colChips.length).toEqual(1);
        expect(GridFunctions.getChipText(colChips[0])).toEqual('a');
        expect(colOperands.length).toEqual(0);

        const indicatorBadge = colIndicator[0].query(By.directive(IgxBadgeComponent));
        expect(indicatorBadge).toBeTruthy();
        expect(indicatorBadge.nativeElement.innerText.trim()).toEqual('1');
    }));

    // Integration scenario

    // Filtering + Row Selectors
    it('should display the Row Selector header checkbox above the filter row.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.rowSelectable = true;
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const frElem = filteringRow.nativeElement;
        const chkBox = fix.debugElement.query(By.css('.igx-grid__cbx-selection')).query(By.directive(IgxCheckboxComponent));
        const chkBoxElem = chkBox.nativeElement;
        expect(frElem.offsetTop).toBeGreaterThanOrEqual(chkBoxElem.offsetTop + chkBoxElem.clientHeight);
    }));

    // Filtering + Column Groups
    it('should position filter row correctly when grid has column groups.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const idCellChip = filteringCells[0].query(By.css('igx-chip'));
        const thead = fix.debugElement.query(By.css('.igx-grid__thead')).nativeElement;

        const cellElem = filteringCells[0].nativeElement;
        expect(cellElem.offsetParent.offsetHeight + cellElem.offsetHeight).toBeCloseTo(thead.clientHeight, 10);

        idCellChip.nativeElement.click();
        // tick();
        fix.detectChanges();

        // check if it is positioned at the bottom of the thead.
        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const frElem = filteringRow.nativeElement;
        expect(frElem.offsetTop + frElem.clientHeight).toEqual(thead.clientHeight);
    }));

    it('should position filter row and chips correctly when grid has column groups and one is hidden.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
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
        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        expect(filteringCells.length).toEqual(6);

        const groupCol = grid.getColumnByName('General');
        groupCol.hidden = true;
        fix.detectChanges();

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        expect(filteringCells.length).toEqual(1);

        const chip = filteringCells[0].query(By.css('igx-chip'));
        chip.nativeElement.click();
        fix.detectChanges();

        // check if it is positioned at the bottom of the thead.
        const thead = fix.debugElement.query(By.css('.igx-grid__thead')).nativeElement;
        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const frElem = filteringRow.nativeElement;
        expect(frElem.offsetTop + frElem.clientHeight).toEqual(thead.clientHeight);

        GridFunctions.closeFilterRow(fix);

        groupCol.hidden = false;
        fix.detectChanges();

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        expect(filteringCells.length).toEqual(6);

        const prodNameChipContent = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
        expect(prodNameChipContent.nativeElement.textContent.trim()).toEqual('Ignite');
    }));

    // Filtering + Moving
    it('should move chip under the correct column when column is moved and filter row should open for correct column.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        let stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Contains', 'Angular', fix);
        GridFunctions.closeFilterRow(fix);

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        let stringCellChipText = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
        expect(stringCellChipText.nativeElement.textContent.trim()).toEqual('Angular');

        // swap columns
        const stringCol = grid.getColumnByName('ProductName');
        const numberCol = grid.getColumnByName('Downloads');
        grid.moveColumn(stringCol, numberCol);
        fix.detectChanges();

        // check UI in filter cell is correct after moving
        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        stringCellChip = filteringCells[2].query(By.css('igx-chip'));
        expect(stringCellChip).not.toBeNull();
        if (stringCellChip) {
            stringCellChipText = filteringCells[2].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
            expect(stringCellChipText.nativeElement.textContent.trim()).toEqual('Angular');
        }
        const numberChip = filteringCells[1].query(By.css('igx-chip'));
        const numberCellChipText = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
        expect(numberCellChipText.nativeElement.textContent.trim()).toEqual('Filter');

        // check if chip opens correct UI after moving
        numberChip.nativeElement.click();
        fix.detectChanges();

        checkUIForType('number', fix.debugElement);
    }));

    // Filtering + Hiding
    it('should not display filter cell for hidden columns and chips should show under correct column.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        let stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Contains', 'Angular', fix);
        GridFunctions.closeFilterRow(fix);

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        expect(filteringCells.length).toEqual(6);

        // hide column
        grid.getColumnByName('ID').hidden = true;
        fix.detectChanges();

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        expect(filteringCells.length).toEqual(5);
        stringCellChip = filteringCells[0].query(By.css('igx-chip'));
        expect(stringCellChip).not.toBeNull();
        if (stringCellChip) {
            const text = stringCellChip.query(By.css('.igx-chip__content'));
            expect(text.nativeElement.textContent.trim()).toEqual('Angular');
        }

        grid.getColumnByName('ProductName').hidden = true;
        fix.detectChanges();

        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        expect(filteringCells.length).toEqual(4);

        for (let i = 0; i < filteringCells.length; i++) {
            const cell = filteringCells[i];
            const chipTxt = cell.query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
            expect(chipTxt.nativeElement.textContent.trim()).toEqual('Filter');
        }
    }));

    // Filtering + Grouping
    it('should display the header expand/collapse icon for groupby above the filter row.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        grid.getColumnByName('ProductName').groupable = true;
        grid.groupBy({
            fieldName: 'ProductName',
            dir: SortingDirection.Asc,
            ignoreCase: false,
            strategy: DefaultSortingStrategy.instance()
        });
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const frElem = filteringRow.nativeElement;
        const expandBtn = fix.debugElement.query(By.css('.igx-grid__group-expand-btn'));
        const expandBtnElem = expandBtn.nativeElement;
        expect(frElem.offsetTop).toBeGreaterThanOrEqual(expandBtnElem.offsetTop + expandBtnElem.clientHeight);
    }));

    // Filtering + Pinning
    it('should position chips correctly after pinning column.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        let filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        let stringCellChip = filteringCells[1].query(By.css('igx-chip'));

        // filter string col
        stringCellChip.nativeElement.click();
        fix.detectChanges();

        GridFunctions.filterBy('Contains', 'Angular', fix);
        GridFunctions.closeFilterRow(fix);

        grid.getColumnByName('ProductName').pinned = true;
        fix.detectChanges();

        // check chips is under correct column
        filteringCells = fix.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        stringCellChip = filteringCells[0].query(By.css('igx-chip'));
        const text = stringCellChip.query(By.css('.igx-chip__content')).nativeElement.textContent;
        expect(text.trim()).toEqual('Angular');
    }));

    // Filtering + Resizing
    it('Should display view more indicator when column is resized so not all filters are visible.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.columnWidth = '250px';
        fix.detectChanges();

        // Add initial filtering conditions
        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        columnsFilteringTree.filteringOperands = [
            { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
            { fieldName: 'ProductName', searchVal: 'o', condition: IgxStringFilteringOperand.instance().condition('contains') }
        ];
        gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        fix.detectChanges();

        let colChips = GridFunctions.getFilterChipsForColumn('ProductName', fix);
        let colOperands = GridFunctions.getFilterOperandsForColumn('ProductName', fix);
        let colIndicator = GridFunctions.getFilterIndicatorForColumn('ProductName', fix);

        expect(colChips.length).toEqual(2);
        expect(colOperands.length).toEqual(1);
        expect(colIndicator.length).toEqual(0);

        // Enable resizing
        fix.componentInstance.resizable = true;
        fix.detectChanges();

        // Make 'ProductName' column smaller
        const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
        const headerResArea = headers[1].children[2].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fix.detectChanges();

        const resizer = headers[1].children[2].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
        tick(100);
        fix.detectChanges();

        colChips = GridFunctions.getFilterChipsForColumn('ProductName', fix);
        colOperands = GridFunctions.getFilterOperandsForColumn('ProductName', fix);
        colIndicator = GridFunctions.getFilterIndicatorForColumn('ProductName', fix);

        expect(colChips.length).toEqual(1);
        expect(GridFunctions.getChipText(colChips[0])).toEqual('a');
        expect(colOperands.length).toEqual(0);
        expect(colIndicator.length).toEqual(1);

        const indicatorBadge = colIndicator[0].query(By.directive(IgxBadgeComponent));
        expect(indicatorBadge).toBeTruthy();
        expect(indicatorBadge.nativeElement.innerText.trim()).toEqual('1');
    }));

    // Filtering + Resizing
    it('Should correctly resize the current column that filtering the row is rendered for.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.columnWidth = '250px';
        fix.detectChanges();

        // Enable resizing
        grid.columns.forEach(col => col.resizable = true);
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;
        stringCellChip.click();
        fix.detectChanges();

        const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
        const headerResArea = headers[1].children[2].nativeElement;
        let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));

        expect(filteringRow).toBeTruthy();
        expect(headers[1].nativeElement.offsetWidth).toEqual(250);

        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
        tick();
        fix.detectChanges();

        const resizer = headers[1].children[2].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
        tick(100);
        fix.detectChanges();

        filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        expect(filteringRow).toBeTruthy();
        expect(headers[1].nativeElement.offsetWidth).toEqual(150);
    }));

    // Filtering + Resizing
    it('Should correctly render all filtering chips when column is resized so all filter are visible.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.columnWidth = '100px';
        fix.detectChanges();

        // Add initial filtering conditions
        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'Downloads');
        columnsFilteringTree.filteringOperands = [
            { fieldName: 'Downloads', searchVal: 25, condition: IgxNumberFilteringOperand.instance().condition('greaterThan') },
            { fieldName: 'Downloads', searchVal: 200, condition: IgxNumberFilteringOperand.instance().condition('lessThan') }
        ];
        gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        fix.detectChanges();

        // Enable resizing
        grid.columns.forEach(col => col.resizable = true);
        fix.detectChanges();

        let colChips = GridFunctions.getFilterChipsForColumn('Downloads', fix);
        let colOperands = GridFunctions.getFilterOperandsForColumn('Downloads', fix);
        let colIndicator = GridFunctions.getFilterIndicatorForColumn('Downloads', fix);

        expect(colChips.length).toEqual(0);
        expect(colOperands.length).toEqual(0);
        expect(colIndicator.length).toEqual(1);

        const indicatorBadge = colIndicator[0].query(By.directive(IgxBadgeComponent));
        expect(indicatorBadge).toBeTruthy();
        expect(indicatorBadge.nativeElement.innerText.trim()).toEqual('2');

        // Make 'Downloads' column bigger
        const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
        const headerResArea = headers[2].children[2].nativeElement;
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick();
        fix.detectChanges();

        const resizer = headers[2].children[2].children[0].nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
        tick();

        UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
        tick(100);
        fix.detectChanges();

        colChips = GridFunctions.getFilterChipsForColumn('Downloads', fix);
        colOperands = GridFunctions.getFilterOperandsForColumn('Downloads', fix);
        colIndicator = GridFunctions.getFilterIndicatorForColumn('Downloads', fix);

        expect(colChips.length).toEqual(2);
        expect(colOperands.length).toEqual(1);
        expect(colOperands[0].nativeElement.innerText).toEqual('AND');
        expect(colIndicator.length).toEqual(0);
    }));

    it('Should close FilterRow when Escape is pressed.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        stringCellChip.click();
        fix.detectChanges();

        let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        expect(filteringRow).toBeDefined();

        GridFunctions.simulateKeyboardEvent(filteringRow, 'keydown', 'Esc');
        fix.detectChanges();

        filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));

        expect(filteringRow).toBeNull();
    }));

    it('Should correctly load default resource strings for filter row', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        stringCellChip.click();
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        expect(filteringRow).toBeDefined();

        const editingBtns = filteringRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const reset = editingBtns.queryAll(By.css('button'))[0];
        const close = editingBtns.queryAll(By.css('button'))[1];

        expect(close.nativeElement.innerText).toBe('Close');
        expect(reset.nativeElement.innerText).toBe('Reset');
    }));

    it('Should correctly change resource strings for filter row', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        grid.resourceStrings = Object.assign({}, grid.resourceStrings, {
            igx_grid_filter: 'My filter',
            igx_grid_filter_row_close: 'My close'
        });
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        expect(stringCellChip.children[0].children[1].innerText).toBe('My filter');

        stringCellChip.click();
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        expect(filteringRow).toBeDefined();

        const editingBtns = filteringRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const reset = editingBtns.queryAll(By.css('button'))[0];
        const close = editingBtns.queryAll(By.css('button'))[1];

        expect(close.nativeElement.innerText).toBe('My close');
        expect(reset.nativeElement.innerText).toBe('Reset');
    }));

    it('Should correctly change resource strings for filter row using Changei18n', fakeAsync(() => {
        const strings = getCurrentResourceStrings();
        strings.igx_grid_filter = 'My filter';
        strings.igx_grid_filter_row_close = 'My close';
        changei18n(strings);
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        expect(stringCellChip.children[0].children[1].innerText).toBe('My filter');

        stringCellChip.click();
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        expect(filteringRow).toBeDefined();

        const editingBtns = filteringRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const reset = editingBtns.queryAll(By.css('button'))[0];
        const close = editingBtns.queryAll(By.css('button'))[1];

        expect(close.nativeElement.innerText).toBe('My close');
        expect(reset.nativeElement.innerText).toBe('Reset');

        changei18n({
            igx_grid_filter: 'Filter',
            igx_grid_filter_row_close: 'Close'
        });
    }));

    it('Should size grid correctly if enable/disable filtering in run time.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const head = grid.nativeElement.querySelector('.igx-grid__thead');
        const body = grid.nativeElement.querySelector('.igx-grid__tbody');

        expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

        fix.componentInstance.activateFiltering(false);
        fix.detectChanges();

        expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

        fix.componentInstance.activateFiltering(true);
        fix.detectChanges();

        expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);
    }));

    it('Should size grid correctly if enable/disable filtering in run time - MCH.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const head = grid.nativeElement.querySelector('.igx-grid__thead');
        const body = grid.nativeElement.querySelector('.igx-grid__tbody');

        expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

        fix.componentInstance.activateFiltering(false);
        fix.detectChanges();

        expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

        fix.componentInstance.activateFiltering(true);
        fix.detectChanges();

        expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);
      }));

    it('Should remove FilterRow, when allowFiltering is set to false.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridFilteringComponent);
        const grid = fix.componentInstance.grid;
        fix.detectChanges();

        const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const stringCellChip = initialChips[0].nativeElement;

        stringCellChip.click();
        fix.detectChanges();

        let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        expect(filteringRow).toBeDefined();

        grid.allowFiltering = false;
        fix.detectChanges();

        filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        expect(filteringRow).toBeNull();
    }));
});

export class CustomFilter extends IgxFilteringOperand {
    private static _instance: CustomFilter;

    private constructor() {
        super();
        this.operations = [{
            name: 'custom',
            isUnary: false,
            logic: (target: string): boolean => {
                return target === 'custom';
            },
            iconName: 'custom'
        }];
    }

    public static instance(): CustomFilter {
        return this._instance || (this._instance = new this());
    }
}


@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'" [filterable]="false" [resizable]="resizable"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string" [resizable]="resizable"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number" [resizable]="resizable"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean" [resizable]="resizable"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            dataType="date" [resizable]="resizable">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Anogther Field'"
            dataType="string" [filters]="customFilter" [resizable]="resizable">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringComponent {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public customFilter = CustomFilter;
    public resizable = false;

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

    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
}

@Component({
    template: `<igx-grid [data]="data" height="500px" width="500px" [allowFiltering]="true">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
            dataType="date">
        </igx-column>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringScrollComponent extends IgxGridFilteringComponent { }

@Component({
    template: `<igx-grid [data]="data" height="500px" [allowFiltering]="true">
    <igx-column-group header="General Information" field='General'>
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" dataType="string"></igx-column>
        <igx-column-group header="Details" field='Details'>
            <igx-column [field]="'Downloads'" dataType="number" [filterable]="false"></igx-column>
            <igx-column [field]="'Released'" dataType="boolean"></igx-column>
            <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" headerClasses="header-release-date"
                dataType="date">
            </igx-column>
        </igx-column-group>
    </igx-column-group>
        <igx-column [field]="'AnotherField'" [header]="'Another Field'"
            dataType="string" [filters]="customFilter">
        </igx-column>
    </igx-grid>`
})
export class IgxGridFilteringMCHComponent extends IgxGridFilteringComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public activateFiltering(activate: boolean) {
        this.grid.allowFiltering = activate;
        this.grid.cdr.markForCheck();
    }
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

function checkUIForType(type: string, elem: DebugElement) {
    let expectedConditions;
    let expectedInputType;
    const isReadOnly = type === 'bool' ? true : false;
    switch (type) {
        case 'string':
            expectedConditions = IgxStringFilteringOperand.instance().operations;
            expectedInputType = 'text';
            break;
        case 'number':
            expectedConditions = IgxNumberFilteringOperand.instance().operations;
            expectedInputType = 'number';
            break;
        case 'date':
            expectedConditions = IgxDateFilteringOperand.instance().operations;
            expectedInputType = 'datePicker';
            break;
        case 'bool':
            expectedConditions = IgxBooleanFilteringOperand.instance().operations;
            expectedInputType = 'text';
            break;
    }
    GridFunctions.openFilterDD(elem);
    const ddList = elem.query(By.css('div.igx-drop-down__list.igx-toggle'));
    const ddItems = ddList.nativeElement.children;
    // check drop-down conditions
    for (let i = 0; i < expectedConditions.length; i++) {
        const txt = expectedConditions[i].name.split(/(?=[A-Z])/).join(' ').toLowerCase();
        expect(txt).toEqual(ddItems[i].textContent.toLowerCase());
    }
    // check input is correct type
    const filterUIRow = elem.query(By.css(FILTER_UI_ROW));
    if (expectedInputType !== 'datePicker') {
        const input = filterUIRow.query(By.css('.igx-input-group__input'));
        expect(input.nativeElement.type).toBe(expectedInputType);
        expect(input.nativeElement.attributes.hasOwnProperty('readonly')).toBe(isReadOnly);
    } else {
        const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent));
        expect(datePicker).not.toBe(null);
    }
}
