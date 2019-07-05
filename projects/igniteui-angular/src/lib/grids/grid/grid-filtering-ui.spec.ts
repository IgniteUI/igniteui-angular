import { DebugElement } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../../calendar/calendar';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxStringFilteringOperand
} from '../../data-operations/filtering-condition';
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
import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
import { FilterMode } from '../tree-grid';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { IgxChipComponent } from '../../chips/chip.component';
import { IgxGridExcelStyleFilteringModule } from '../filtering/excel-style/grid.excel-style-filtering.module';
import { DisplayDensity } from '../../core/density';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent,
    IgxGridFilteringScrollComponent,
    IgxGridFilteringMCHComponent,
    IgxTestExcelFilteringDatePickerComponent,
    IgxGridFilteringTemplateComponent,
    IgxGridFilteringESFTemplatesComponent
} from '../../test-utils/grid-samples.spec';

const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CELL = 'igx-grid-filtering-cell';
const FILTER_UI_SCROLL_START_CLASS = '.igx-grid__filtering-row-scroll-start';
const FILTER_UI_SCROLL_END_CLASS = '.igx-grid__filtering-row-scroll-end';

describe('IgxGrid - Filtering actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        })
            .compileComponents();
    }));

    let fix, grid;
    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    const cal = SampleTestData.timeGenerator;
    const today = SampleTestData.today;

    // UI tests string column, empty input
    it('UI tests on string column', fakeAsync(() => {
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        let suffix = filterUIRow.query(By.css('igx-suffix'));
        let clear = suffix.queryAll(By.css('igx-icon'))[1];
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

        suffix = filterUIRow.query(By.css('igx-suffix'));
        clear = suffix.queryAll(By.css('igx-icon'))[1];
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));

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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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

        const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
        const calendar = outlet.getElementsByClassName('igx-calendar')[0];

        const currentDay = calendar.querySelector('.igx-calendar__date--current');

        currentDay.dispatchEvent(new Event('click'));

        flush();
        fix.detectChanges();

        input.nativeElement.dispatchEvent(new Event('change'));
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
    }));

    it('UI - should correctly filter date column by \'doesNotEqual\' filtering conditions', fakeAsync(() => {
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        tick(100);
        fix.detectChanges();

        const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
        const calendar = outlet.getElementsByClassName('igx-calendar')[0];

        const currentDay = calendar.querySelector('.igx-calendar__date--current');

        currentDay.dispatchEvent(new Event('click'));
        flush();
        fix.detectChanges();

        input.nativeElement.dispatchEvent(new Event('change'));
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(7);
    }));

    it('UI - should correctly filter date column by \'after\' filtering conditions', async () => {
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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

        const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
        const calendar = outlet.getElementsByClassName('igx-calendar')[0];

        const currentDay = calendar.querySelector('.igx-calendar__date--current');

        currentDay.dispatchEvent(new Event('click'));
        flush();
        fix.detectChanges();

        input.nativeElement.dispatchEvent(new Event('change'));
        tick();
        fix.detectChanges();

        expect(grid.rowList.length).toEqual(2);
    }));

    it('Should correctly select month from month view datepicker/calendar component', fakeAsync(() => {
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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

        const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
        let calendar = outlet.getElementsByClassName('igx-calendar')[0];

        calendar.querySelector('.igx-calendar__date--current');
        const monthView = calendar.querySelector('.igx-calendar-picker__date');

        monthView.dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();

        const firstMonth = calendar.querySelector('.igx-calendar__month');
        firstMonth.dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();

        calendar = outlet.getElementsByClassName('igx-calendar')[0];
        const month = calendar.querySelector('.igx-calendar-picker__date');

        expect(month.innerHTML.trim()).toEqual('Jan');
    }));

    it('Should correctly select year from year view datepicker/calendar component', fakeAsync(() => {
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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

        const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
        let calendar = outlet.getElementsByClassName('igx-calendar')[0];

        const monthView = calendar.querySelectorAll('.igx-calendar-picker__date')[1];
        monthView.dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();

        const firstMonth = calendar.querySelectorAll('.igx-calendar__year')[0];
        firstMonth.dispatchEvent(new Event('click'));
        tick();
        fix.detectChanges();

        calendar = outlet.getElementsByClassName('igx-calendar')[0];
        const month = calendar.querySelectorAll('.igx-calendar-picker__date')[1];

        const expectedResult = today.getFullYear() - 3;
        expect(month.innerHTML.trim()).toEqual(expectedResult.toString());
    }));

    // UI tests custom column
    it('UI tests on custom column', fakeAsync(() => {
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filterVal = 'search';
        const columnName = 'ProductName';

        grid.filter(columnName, filterVal, IgxStringFilteringOperand.instance().condition('contains'));
        tick(100);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
        const columnName = 'ProductName';
        const filterValue = 'search';
        grid.filter(columnName, filterValue, IgxStringFilteringOperand.instance().condition('contains'));
        tick(100);
        fix.detectChanges();

        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const inputGroup = filterUIRow.query(By.css('igx-input-group'));
        const suffix = inputGroup.query(By.css('igx-suffix'));
        const clearIcon = suffix.queryAll(By.css('igx-icon'))[1];

        spyOn(grid.onFilteringDone, 'emit');

        clearIcon.nativeElement.dispatchEvent(new MouseEvent('click'));
        GridFunctions.simulateKeyboardEvent(input, 'keydown', 'Enter');
        tick(100);
        fix.detectChanges();

        const columnFilteringExpressionsTree = grid.filteringExpressionsTree.find(columnName);
        expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(columnFilteringExpressionsTree);
    }));

    it('When filter column with value 0 and dataType number, filtering chip should be applied', fakeAsync(() => {
        const gridheaders = fix.debugElement.queryAll(By.css('igx-grid-header'));
        const headerOfTypeNumber = gridheaders.find(gh => gh.nativeElement.classList.contains('igx-grid__th--number'));
        const filterCellsForTypeNumber = headerOfTypeNumber.parent.query(By.css(FILTER_UI_CELL));
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

        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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

    it('Should complete the filter when clicking the commit icon', fakeAsync(() => {
        const filterValue = 'an';
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        tick();
        fix.detectChanges();
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const inputGroup = filterUIRow.query(By.css('igx-input-group'));
        const suffix = inputGroup.query(By.css('igx-suffix'));
        const commitIcon = suffix.queryAll(By.css('igx-icon'))[0];
        const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
        expect(filterChip).toBeTruthy();
        expect(filterChip.componentInstance.selected).toBeTruthy();

        commitIcon.nativeElement.dispatchEvent(new MouseEvent('click'));
        tick(100);
        fix.detectChanges();

        expect(filterChip.componentInstance.selected).toBeFalsy();
    }));

    it('Should complete the filter when clicking the focusing out the input', async () => {
        const filterValue = 'an';
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const inputGroup = filterUIRow.query(By.css('igx-input-group'));
        const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
        const editingButtons = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const reset = editingButtons.queryAll(By.css('button'))[0];
        expect(filterChip).toBeTruthy();
        expect(filterChip.componentInstance.selected).toBeTruthy();

        reset.nativeElement.focus();
        inputGroup.nativeElement.dispatchEvent(new FocusEvent('focusout'));
        fix.detectChanges();
        await wait(16);

        expect(filterChip.componentInstance.selected).toBeFalsy();
    });

    it('UI - should use dropdown mode for the date picker', fakeAsync(() => {
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[4].query(By.css('igx-chip')).nativeElement.click();
        tick(100);
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const datePicker = filterUIRow.query(By.css('igx-date-picker'));
        expect(datePicker.componentInstance.mode).toBe('dropdown');
    }));

    it('Should commit the filter when click on filter chip', async () => {
        const filterValue = 'a';
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
        expect(filterChip).toBeTruthy();
        expect(filterChip.componentInstance.selected).toBeTruthy();

        filterChip.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();
        await wait(16);
        expect(filterChip.componentInstance.selected).toBeFalsy();

        filterChip.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();
        await wait(16);
        expect(filterChip.componentInstance.selected).toBeTruthy();

        filterChip.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();
        await wait(16);
        expect(filterChip.componentInstance.selected).toBeFalsy();
    });

    it('Should not select all filter chips when switching columns', async () => {
        let filterValue = 'a';
        const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
        filteringCells[1].query(By.css('igx-chip')).nativeElement.click();
        fix.detectChanges();

        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        sendInput(input, filterValue, fix);

        const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
        expect(filterChip).toBeTruthy();
        expect(filterChip.componentInstance.selected).toBeTruthy();

        filterChip.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();
        await wait(16);
        expect(filterChip.componentInstance.selected).toBeFalsy();

        filterValue = 'c';
        sendInput(input, filterValue, fix);
        fix.detectChanges();
        await wait(16);

        let filterChips = filterUIRow.queryAll(By.directive(IgxChipComponent));
        expect(filterChips[1]).toBeTruthy();
        expect(filterChips[1].componentInstance.selected).toBeTruthy();

        GridFunctions.simulateKeyboardEvent(input, 'keydown', 'Enter');
        fix.detectChanges();
        await wait(16);
        expect(filterChips[1].componentInstance.selected).toBeFalsy();

        let selectedColumn = GridFunctions.getColumnHeader('Downloads', fix);
        selectedColumn.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();
        await wait(16);

        selectedColumn = GridFunctions.getColumnHeader('ProductName', fix);
        selectedColumn.nativeElement.dispatchEvent(new MouseEvent('click'));
        fix.detectChanges();
        await wait(16);

        filterChips = filterUIRow.queryAll(By.directive(IgxChipComponent));
        expect(filterChips[0].componentInstance.selected).toBeFalsy();
        expect(filterChips[1].componentInstance.selected).toBeFalsy();
    });
});

describe('IgxGrid - Filtering Row UI actions', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent,
                IgxGridFilteringScrollComponent,
                IgxGridFilteringMCHComponent,
                IgxTestExcelFilteringDatePickerComponent,
                IgxGridFilteringTemplateComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxGridExcelStyleFilteringModule
            ]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe(null, () => {
        let fix, grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('should render Filter chip for filterable columns and render empty cell for a column when filterable is set to false',
            fakeAsync(() => {
                grid.width = '1500px';
                fix.detectChanges();

                const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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

        it('should render correct input and dropdown in filter row for different column types',
            fakeAsync(/** showHideArrowButtons rAF */() => {
                const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
                fix.detectChanges();

                // open for number
                numberCellChip.nativeElement.click();
                fix.detectChanges();
                checkUIForType('number', fix.debugElement);

                // close
                filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
                close = filterUIRow.queryAll(By.css('button'))[1];
                close.nativeElement.click();
                fix.detectChanges();

                // open for date
                dateCellChip.nativeElement.click();
                fix.detectChanges();
                checkUIForType('date', fix.debugElement);

                // close
                filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
                close = filterUIRow.queryAll(By.css('button'))[1];
                close.nativeElement.click();
                fix.detectChanges();

                // open for bool
                boolCellChip.nativeElement.click();
                fix.detectChanges();
                checkUIForType('bool', fix.debugElement);

                // close
                filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
                close = filterUIRow.queryAll(By.css('button'))[1];
                close.nativeElement.click();
                fix.detectChanges();
            }));

        it('should apply  multiple conditions to grid immediately while the filter row is still open', fakeAsync(() => {
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
            const numberCellChip = filteringCells[2].query(By.css('igx-chip'));
            const boolCellChip = filteringCells[3].query(By.css('igx-chip'));
            const dateCellChip = filteringCells[4].query(By.css('igx-chip'));
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
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // open for string
            stringCellChip.nativeElement.click();
            fix.detectChanges();

            for (let i = 0; i < 10; i++) {
                GridFunctions.filterBy('Starts With', 'I', fix);
            }
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const startArrow = filterUIRow.query(By.css(FILTER_UI_SCROLL_START_CLASS));
            const endArrow = filterUIRow.query(By.css(FILTER_UI_SCROLL_END_CLASS));

            expect(startArrow).not.toBe(null);
            expect(endArrow).not.toBe(null);
        }));

        it('should update UI when chip is removed from header cell.', fakeAsync(() => {
            let filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            let stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // filter string col
            stringCellChip.nativeElement.click();
            fix.detectChanges();

            GridFunctions.filterBy('Starts With', 'I', fix);
            expect(grid.rowList.length).toEqual(2);

            GridFunctions.closeFilterRow(fix);

            filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // remove chip
            const removeButton = stringCellChip.query(By.css('div.igx-chip__remove'));
            removeButton.nativeElement.click();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(8);
        }));

        it('should update UI when chip is removed from filter row.', fakeAsync(() => {
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

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
                let filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

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
                for (i = 0; i < ddItems.length; i++) {
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

                filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                const stringCellText = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
                expect(stringCellText.nativeElement.textContent).toBe('Filter');
            }));

            it('should reset the filter chips area when changing grid width', (async() => {
                grid.width = '300px';
                fix.detectChanges();
                await wait(30);

                const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
                const expression1 = {
                    fieldName: 'ProductName',
                    searchVal: 'Ignite',
                    condition: IgxStringFilteringOperand.instance().condition('startsWith')
                };

                const expression2 = {
                    fieldName: 'ProductName',
                    searchVal: 'test',
                    condition: IgxStringFilteringOperand.instance().condition('contains')
                };

                filteringExpressionsTree.filteringOperands.push(expression1);
                filteringExpressionsTree.filteringOperands.push(expression2);
                grid.filter('ProductName', null, filteringExpressionsTree);

                fix.detectChanges();
                await wait();

                const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                const stringCellChip = filteringCells[1].query(By.css('igx-icon'));
                stringCellChip.nativeElement.click();
                fix.detectChanges();
                await wait();

                let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
                let startArrow = filterUIRow.query(By.css(FILTER_UI_SCROLL_START_CLASS));
                let endArrow = filterUIRow.query(By.css(FILTER_UI_SCROLL_END_CLASS));

                expect(startArrow).not.toBeNull();
                expect(endArrow).not.toBeNull();

                grid.width = '900px';
                fix.detectChanges();
                await wait(300);

                filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
                startArrow = filterUIRow.query(By.css(FILTER_UI_SCROLL_START_CLASS));
                endArrow = filterUIRow.query(By.css(FILTER_UI_SCROLL_END_CLASS));
                expect(startArrow).toBeNull();
                expect(endArrow).toBeNull();
            }));

        it('Should correctly update filtering row rendered when changing current column by clicking on a header.', fakeAsync(() => {
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
            grid.width = '1600px';
            grid.columns[1].width = '400px';
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

            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
            grid.columns[1].width = '200px';
            fix.detectChanges();

            let filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));

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
            filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const fcIndicator = filteringCells[1].query(By.css('.igx-grid__filtering-cell-indicator'));
            expect(fcIndicator).not.toBe(null);
            const badge = fcIndicator.query(By.directive(IgxBadgeComponent));
            expect(badge.componentInstance.value).toBe(1);
        }));

        it('Should allow setting filtering conditions through filteringExpressionsTree.', fakeAsync(() => {
            grid.columns[1].width = '150px';
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
            grid.rowSelectable = true;
            fix.detectChanges();

            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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

        // Filtering + Moving
        it('should move chip under the correct column when column is moved and filter row should open for correct column.',
            fakeAsync(() => {
                let filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                let stringCellChip = filteringCells[1].query(By.css('igx-chip'));

                // filter string col
                stringCellChip.nativeElement.click();
                fix.detectChanges();

                GridFunctions.filterBy('Contains', 'Angular', fix);
                GridFunctions.closeFilterRow(fix);

                filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                let stringCellChipText = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
                expect(stringCellChipText.nativeElement.textContent.trim()).toEqual('Angular');

                // swap columns
                const stringCol = grid.getColumnByName('ProductName');
                const numberCol = grid.getColumnByName('Downloads');
                grid.moveColumn(stringCol, numberCol);
                fix.detectChanges();

                // check UI in filter cell is correct after moving
                filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
            let filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            let stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // filter string col
            stringCellChip.nativeElement.click();
            fix.detectChanges();

            GridFunctions.filterBy('Contains', 'Angular', fix);
            GridFunctions.closeFilterRow(fix);

            filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            expect(filteringCells.length).toEqual(6);

            // hide column
            grid.getColumnByName('ID').hidden = true;
            fix.detectChanges();

            filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            expect(filteringCells.length).toEqual(5);
            stringCellChip = filteringCells[0].query(By.css('igx-chip'));
            expect(stringCellChip).not.toBeNull();
            if (stringCellChip) {
                const text = stringCellChip.query(By.css('.igx-chip__content'));
                expect(text.nativeElement.textContent.trim()).toEqual('Angular');
            }

            grid.getColumnByName('ProductName').hidden = true;
            fix.detectChanges();

            filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            expect(filteringCells.length).toEqual(4);

            for (let i = 0; i < filteringCells.length; i++) {
                const cell = filteringCells[i];
                const chipTxt = cell.query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
                expect(chipTxt.nativeElement.textContent.trim()).toEqual('Filter');
            }
        }));

        // Filtering + Grouping
        it('should display the header expand/collapse icon for groupby above the filter row.', fakeAsync(() => {
            grid.getColumnByName('ProductName').groupable = true;
            grid.groupBy({
                fieldName: 'ProductName',
                dir: SortingDirection.Asc,
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
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
            let filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            let stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // filter string col
            stringCellChip.nativeElement.click();
            fix.detectChanges();

            GridFunctions.filterBy('Contains', 'Angular', fix);
            GridFunctions.closeFilterRow(fix);

            grid.getColumnByName('ProductName').pinned = true;
            fix.detectChanges();

            // check chips is under correct column
            filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            stringCellChip = filteringCells[0].query(By.css('igx-chip'));
            const text = stringCellChip.query(By.css('.igx-chip__content')).nativeElement.textContent;
            expect(text.trim()).toEqual('Angular');
        }));

        // Filtering + Resizing
        it('Should display view more indicator when column is resized so not all filters are visible.', fakeAsync(() => {
            grid.columns[1].width = '250px';
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
            grid.cdr.detectChanges();

            // Make 'ProductName' column smaller
            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[1].children[2].nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
            tick(200);
            const resizer = fix.debugElement.queryAll(By.css('.igx-grid__th-resize-line'))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
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
            grid.columns[1].width = '250px';
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
            tick(200);
            const resizer = fix.debugElement.queryAll(By.css('.igx-grid__th-resize-line'))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
            fix.detectChanges();

            filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeTruthy();
            expect(headers[1].nativeElement.offsetWidth).toEqual(150);
        }));

        // Filtering + Resizing
        it('Should correctly render all filtering chips when column is resized so all filter are visible.', fakeAsync(() => {
            grid.columns[2].width = '100px';
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
            grid.cdr.detectChanges();

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
            tick(200);
            const resizer = fix.debugElement.queryAll(By.css('.igx-grid__th-resize-line'))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
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

        it('Should size grid correctly if enable/disable filtering in run time.', fakeAsync(() => {
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

        it('should open \'conditions dropdown\' on prefix click and should close it on second click.', fakeAsync(() => {
            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const stringCellChip = initialChips[0].nativeElement;

            // Click filter chip to show filter row
            stringCellChip.click();
            tick(100);
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const inputgroup = filterUIRow.query(By.css('igx-input-group'));
            const prefix = inputgroup.query(By.css('igx-prefix'));

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', {});
            tick(100);
            fix.detectChanges();

            // Verify dropdown is opened
            let dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
            expect(dropdownList).not.toBeNull();

            // Click prefix again to close conditions dropdown
            prefix.triggerEventHandler('click', {});
            tick(100);
            fix.detectChanges();

            // Verify dropdown is closed
            dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
            expect(dropdownList).toBeNull();
        }));

        it('should close \'conditions dropdown\' when navigate with Tab key', fakeAsync(() => {
            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const stringCellChip = initialChips[0].nativeElement;

            // Click filter chip to show filter row
            stringCellChip.click();
            tick(100);
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const inputgroup = filterUIRow.query(By.css('igx-input-group'));
            const prefix = inputgroup.query(By.css('igx-prefix'));

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', {});
            tick(100);
            fix.detectChanges();

            // Verify dropdown is opened
            let dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
            expect(dropdownList).not.toBeNull();

            // Press Tab key
            UIInteractions.triggerKeyDownEvtUponElem('Tab', prefix.nativeElement, true);
            tick(100);
            fix.detectChanges();

            // Verify dropdown is closed
            dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
            expect(dropdownList).toBeNull();
        }));

        it('Should commit the input and new chip after picking date from calendar for filtering.', fakeAsync(() => {
            // Click date filter chip to show filter row.
            const filterCells = fix.debugElement.queryAll(By.directive(IgxGridFilteringCellComponent));
            const dateFilterCell = filterCells.find((fc) => fc.componentInstance.column.field === 'ReleaseDate');
            const dateFilterCellChip = dateFilterCell.query(By.directive(IgxChipComponent));
            dateFilterCellChip.nativeElement.click();
            tick(100);
            fix.detectChanges();

            // Click input to open calendar.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));
            input.nativeElement.click();
            tick(100);
            fix.detectChanges();

            // Click the today date.
            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            const calendar = outlet.getElementsByClassName('igx-calendar')[0];
            const todayDayItem = calendar.querySelector('.igx-calendar__date--current');
            (<HTMLElement>todayDayItem).click();
            tick(100);
            fix.detectChanges();

            // Verify the chip and input are committed.
            const activeFiltersArea = filteringRow.query(By.css('.igx-grid__filtering-row-main'));
            const activeFilterChip = activeFiltersArea.query(By.directive(IgxChipComponent));
            expect((<IgxChipComponent>activeFilterChip.componentInstance).selected).toBe(false, 'chip is not committed');
            expect((<IgxInputDirective>input.componentInstance).value).toBeNull('input value is present and not committed');
        }));

        it('Should correctly change resource strings for filter row.', fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            grid = fix.componentInstance.grid;
            grid.resourceStrings = Object.assign({}, grid.resourceStrings, {
                igx_grid_filter: 'My filter',
                igx_grid_filter_row_close: 'My close'
            });
            fix.detectChanges();

            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const stringCellChip = initialChips[0].nativeElement;

            expect(stringCellChip.children[0].children[2].innerText).toBe('My filter');

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

        it('Should correctly change resource strings for filter row using Changei18n.', fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            const strings = getCurrentResourceStrings();
            strings.igx_grid_filter = 'My filter';
            strings.igx_grid_filter_row_close = 'My close';
            changei18n(strings);
            fix.detectChanges();

            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const stringCellChip = initialChips[0].nativeElement;

            expect(stringCellChip.children[0].children[2].innerText).toBe('My filter');

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

        it('Should navigate keyboard focus correctly between the filter row and the grid cells.', fakeAsync(() => {
            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const stringCellChip = initialChips[0].nativeElement;

            stringCellChip.click();
            fix.detectChanges();

            const cell = grid.getCellByColumn(0, 'ID');
            cell.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const closeButton = filterUIRow.queryAll(By.css('button'))[1];
            expect(document.activeElement).toBe(closeButton.nativeElement);

            filterUIRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
            fix.detectChanges();
            tick();
            expect(document.activeElement).toBe(cell.nativeElement);
        }));

        it('should hide chip arrows when the grid is narrow and column is not filtered', fakeAsync(() => {
            grid.width = '400px';
            tick(200);
            fix.detectChanges();

            // Click string filter chip to show filter row.
            const filterCells = fix.debugElement.queryAll(By.directive(IgxGridFilteringCellComponent));
            const stringFilterCell = filterCells.find((fc) => fc.componentInstance.column.field === 'ProductName');
            const stringFilterCellChip = stringFilterCell.query(By.directive(IgxChipComponent));
            stringFilterCellChip.nativeElement.click();
            fix.detectChanges();
            tick(200);

            // Verify arrows and chip area are not visible because there is no active filtering for the column.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const leftArrowButton = filteringRow.query(By.css(FILTER_UI_SCROLL_START_CLASS));
            const rightArrowButton = filteringRow.query(By.css(FILTER_UI_SCROLL_END_CLASS));
            const chipArea = filteringRow.query(By.css('igx-chip-area'));
            expect(leftArrowButton).toBeNull('leftArrowButton is present');
            expect(rightArrowButton).toBeNull('rightArrowButton is present');
            expect(chipArea).toBeNull('chipArea is present');
        }));

        it('Should remove first chip and filter by the remaining ones.', fakeAsync(() => {
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // filter string col
            stringCellChip.nativeElement.click();
            fix.detectChanges();

            GridFunctions.filterBy('Contains', 'z', fix);
            GridFunctions.filterBy('Contains', 'n', fix);
            GridFunctions.filterBy('Contains', 'g', fix);
            expect(grid.rowList.length).toEqual(0);

            // remove first chip
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            GridFunctions.removeFilterChipByIndex(0, filteringRow);
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(3);
            GridFunctions.closeFilterRow(fix);
        }));

        it('Should remove middle chip and filter by the remaining ones.', fakeAsync(() => {
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // filter string col
            stringCellChip.nativeElement.click();
            fix.detectChanges();

            GridFunctions.filterBy('Contains', 'n', fix);
            GridFunctions.filterBy('Contains', 'z', fix);
            GridFunctions.filterBy('Contains', 'g', fix);
            expect(grid.rowList.length).toEqual(0);

            // remove middle chip
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            GridFunctions.removeFilterChipByIndex(1, filteringRow);
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(3);
            GridFunctions.closeFilterRow(fix);
        }));

        it('Should keep existing column filter after hiding another column.', fakeAsync(() => {
            // Open filter row for 'ProductName' column and add 4 condition chips.
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.filterBy('Contains', 'x', fix);
            GridFunctions.filterBy('Contains', 'y', fix);
            GridFunctions.filterBy('Contains', 'i', fix);
            GridFunctions.filterBy('Contains', 'g', fix);
            GridFunctions.filterBy('Contains', 'n', fix);

            // Change second operator to 'Or' and verify the results.
            GridFunctions.clickChipOperator(fix, 1);
            fix.detectChanges();
            GridFunctions.clickChipOperatorValue(fix, 'Or');
            tick(100);
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');

            // Hide another column and verify the filtering results remain the same.
            const column = grid.columns.find((c) => c.field === 'Released');
            column.hidden = true;
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Verify filter cell chip is scrolled into view on click.', fakeAsync(() => {
            grid.width = '470px';
            tick(100);
            fix.detectChanges();

            // Verify 'ReleaseDate' filter chip is not fully visible.
            let chip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0].nativeElement;
            let chipRect = chip.getBoundingClientRect();
            let gridRect = grid.nativeElement.getBoundingClientRect();
            expect(chipRect.right > gridRect.right).toBe(true,
                'chip should not be fully visible and thus not within grid');

            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();

            GridFunctions.closeFilterRow(fix);
            tick(100);
            fix.detectChanges();

            // Verify 'ReleaseDate' filter chip is fully visible.
            chip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0].nativeElement;
            chipRect = chip.getBoundingClientRect();
            gridRect = grid.nativeElement.getBoundingClientRect();
            expect(chipRect.left > gridRect.left && chipRect.right < gridRect.right).toBe(true,
                'chip should be fully visible and within grid');
        }));

        it('Verify condition chips are scrolled into/(out of) view by using arrow buttons.', (async () => {
            grid.width = '700px';
            await wait(100);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add second chip.
            GridFunctions.typeValueInFilterRowInput('e', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add third chip.
            GridFunctions.typeValueInFilterRowInput('i', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);

            verifyMultipleChipsVisibility(fix, [false, false, true]);

            // Click left arrow 2 times.
            const leftArrowButton = GridFunctions.getFilterRowLeftArrowButton(fix).nativeElement;
            leftArrowButton.click();
            await wait(300);
            leftArrowButton.click();
            await wait(300);
            verifyMultipleChipsVisibility(fix, [false, true, false]);

            // Click left arrow 2 times.
            leftArrowButton.click();
            await wait(300);
            leftArrowButton.click();
            await wait(300);
            verifyMultipleChipsVisibility(fix, [true, false, false]);

            // Click right arrow 2 times.
            const rightArrowButton = GridFunctions.getFilterRowRightArrowButton(fix).nativeElement;
            rightArrowButton.click();
            await wait(300);
            rightArrowButton.click();
            await wait(300);
            verifyMultipleChipsVisibility(fix, [false, true, false]);

            // Click right arrow 2 times.
            rightArrowButton.click();
            await wait(300);
            rightArrowButton.click();
            await wait(300);
            verifyMultipleChipsVisibility(fix, [false, false, true]);
        }));

        it('Should navigate from left arrow button to first condition chip Tab.', (async () => {
            grid.width = '700px';
            await wait(100);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add second chip.
            GridFunctions.typeValueInFilterRowInput('e', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add third chip.
            GridFunctions.typeValueInFilterRowInput('i', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);

            // Verify first chip is not in view.
            verifyChipVisibility(fix, 0, false);

            const leftArrowButton = GridFunctions.getFilterRowLeftArrowButton(fix).nativeElement;
            leftArrowButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
            await wait(300);

            // Verify first chip is in view.
            verifyChipVisibility(fix, 0, true);
        }));

        it('Should toggle the selection of a condition chip when using \'Enter\' key.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Add chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            tick(100);
            GridFunctions.submitFilterRowInput(fix);
            tick(100);

            // Verify chip is not selected.
            let chip = GridFunctions.getFilterConditionChip(fix, 0);
            let chipDiv = chip.querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(false, 'chip is selected');

            chip.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick(100);
            fix.detectChanges();

            // Verify chip is selected.
            chip = GridFunctions.getFilterConditionChip(fix, 0);
            chipDiv = chip.querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(true, 'chip is not selected');

            chip.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick(100);
            fix.detectChanges();

            // Verify chip is not selected.
            chip = GridFunctions.getFilterConditionChip(fix, 0);
            chipDiv = chip.querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(false, 'chip is selected');
        }));

        it('Should commit the value in the input when pressing \'Enter\' on commit icon in input.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Type 'ang' in the filter row input.
            GridFunctions.typeValueInFilterRowInput('ang', fix);

            // Verify chip is selected (in edit mode).
            let chipDiv = GridFunctions.getFilterConditionChip(fix, 0).querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(true, 'chip is not selected');

            // Press 'Enter' on the commit icon.
            const inputCommitIcon = GridFunctions.getFilterRowInputCommitIcon(fix);
            inputCommitIcon.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick(200);
            fix.detectChanges();

            // Verify chip is not selected (it is committed).
            chipDiv = GridFunctions.getFilterConditionChip(fix, 0).querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(false, 'chip is selected');
        }));

        it('Should clear the value in the input when pressing \'Enter\' on clear icon in input.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Type 'ang' in the filter row input.
            GridFunctions.typeValueInFilterRowInput('ang', fix);

            // Verify chip is selected (in edit mode).
            const chipDiv = GridFunctions.getFilterConditionChip(fix, 0).querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(true, 'chip is not selected');

            // Press 'Enter' on the clear icon.
            const inputClearIcon = GridFunctions.getFilterRowInputClearIcon(fix);
            inputClearIcon.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick(200);
            fix.detectChanges();

            // Verify there are no chips since we cleared the input.
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const conditionChips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(conditionChips.length).toBe(0);
        }));

        it('Should open filterRow for respective column when pressing \'Enter\' on its filterCell chip.', fakeAsync(() => {
            // Verify filterRow is not opened.
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).toBeNull();

            const filterCellChip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0];
            filterCellChip.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick(200);
            fix.detectChanges();

            // Verify filterRow is opened for the 'ReleaseDate' column.
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).not.toBeNull();
            const headerGroups = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerGroupsFiltering = headerGroups.filter(
                (hg) => hg.nativeElement.classList.contains('igx-grid__th--filtering'));
            expect(headerGroupsFiltering.length).toBe(1);
            expect(headerGroupsFiltering[0].componentInstance.column.field).toBe('ReleaseDate');
        }));

        it('Should navigate to first cell of grid when pressing \'Tab\' on the last filterCell chip.', fakeAsync(() => {
            const filterCellChip = GridFunctions.getFilterChipsForColumn('AnotherField', fix)[0];
            filterCellChip.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            tick(200);
            fix.detectChanges();

            const firstRow = GridFunctions.getGridDataRows(fix)[0];
            const firstCell: any = Array.from(firstRow.querySelectorAll('igx-grid-cell'))[0];
            expect(document.activeElement).toBe(firstCell);
        }));

        it('Should remove first condition chip when click \'clear\' button and focus \'more\' icon.', (async () => {
            grid.width = '700px';
            grid.columns.find((c) => c.field === 'ProductName').width = '160px';
            await wait(100);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add second chip.
            GridFunctions.typeValueInFilterRowInput('e', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add third chip.
            GridFunctions.typeValueInFilterRowInput('i', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);

            // Close filterRow
            GridFunctions.closeFilterRow(fix);
            await wait(100);

            // Verify active chip and its text.
            let filterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
            const chipDiv = filterCellChip.nativeElement.querySelector('.igx-chip__item');
            expect(document.activeElement).toBe(chipDiv);
            expect(GridFunctions.getChipText(filterCellChip)).toBe('a');

            // Remove active chip.
            const clearIcon: any = Array.from(filterCellChip.queryAll(By.css('igx-icon')))
                .find((ic) => ic.nativeElement.innerText === 'cancel');
            clearIcon.nativeElement.click();
            await wait(100);
            fix.detectChanges();

            // Verify that 'more' icon is now active.
            const filterCell = GridFunctions.getFilterCell(fix, 'ProductName');
            const moreIconDiv: any = filterCell.query(By.css('.igx-grid__filtering-cell-indicator'));
            expect(document.activeElement).toBe(moreIconDiv.nativeElement);

            // Verify new chip text.
            filterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
            expect(GridFunctions.getChipText(filterCellChip)).toBe('e');
        }));

        it('Should update active element when click \'clear\' button of last chip and there is no \`more\` icon.', (async () => {
            grid.columns.find((c) => c.field === 'ProductName').width = '350px';
            await wait(100);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add second chip.
            GridFunctions.typeValueInFilterRowInput('e', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add third chip.
            GridFunctions.typeValueInFilterRowInput('i', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);

            // Close filterRow
            GridFunctions.closeFilterRow(fix);
            await wait(100);

            // Verify first chip is active and its text.
            const filterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
            const chipDiv = filterCellChip.nativeElement.querySelector('.igx-chip__item');
            expect(document.activeElement).toBe(chipDiv);
            expect(GridFunctions.getChipText(filterCellChip)).toBe('a');
            // Verify chips count.
            expect(GridFunctions.getFilterChipsForColumn('ProductName', fix).length).toBe(3, 'incorrect chips count');

            // Verify last chip text.
            let lastFilterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[2];
            expect(GridFunctions.getChipText(lastFilterCellChip)).toBe('i');
            // Remove last chip.
            const clearIcon: any = Array.from(lastFilterCellChip.queryAll(By.css('igx-icon')))
                .find((ic) => ic.nativeElement.innerText === 'cancel');
            clearIcon.nativeElement.click();
            await wait(100);
            fix.detectChanges();

            // Verify chips count.
            expect(GridFunctions.getFilterChipsForColumn('ProductName', fix).length).toBe(2, 'incorrect chips count');
            // Verify new last chip text.
            lastFilterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[1];
            expect(GridFunctions.getChipText(lastFilterCellChip)).toBe('e');

            // Verify that 'clear' icon div of the new last chip is now active.
            const clearIconDiv = lastFilterCellChip.query(By.css('.igx-chip__remove'));
            expect(document.activeElement).toBe(clearIconDiv.nativeElement);
        }));

        it('Should open filterRow when clicking \'more\' icon', (async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            // Add second chip.
            GridFunctions.typeValueInFilterRowInput('e', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);

            // Close filterRow
            GridFunctions.closeFilterRow(fix);
            await wait(100);

            // Verify filterRow is not opened.
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).toBeNull();

            // Click 'more' icon
            const filterCell = GridFunctions.getFilterCell(fix, 'ProductName');
            const moreIcon: any = Array.from(filterCell.queryAll(By.css('igx-icon')))
                .find((ic: any) => ic.nativeElement.innerText === 'filter_list');
            moreIcon.nativeElement.click();
            await wait(16);
            fix.detectChanges();

            // Verify filterRow is opened.
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).not.toBeNull();

            // Verify first chip is selected (in edit mode).
            const chipDiv = GridFunctions.getFilterConditionChip(fix, 0).querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(true, 'chip is not selected');
        }));
    });

    describe(null, () => {
        let fix, grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        // Filtering + Column Groups
        it('should position filter row correctly when grid has column groups.', fakeAsync(() => {
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const idCellChip = filteringCells[0].query(By.css('igx-chip'));
            const thead = fix.debugElement.query(By.css('.igx-grid__thead-wrapper')).nativeElement;

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

        it('should position filter row and chips correctly when grid has column groups and one is hidden.',
            fakeAsync(/** showHideArrowButtons rAF */() => {
                const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
                const expression = {
                    fieldName: 'ProductName',
                    searchVal: 'Ignite',
                    condition: IgxStringFilteringOperand.instance().condition('startsWith')
                };
                filteringExpressionsTree.filteringOperands.push(expression);
                grid.filteringExpressionsTree = filteringExpressionsTree;
                fix.detectChanges();
                let filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                expect(filteringCells.length).toEqual(6);

                const groupCol = grid.getColumnByName('General');
                groupCol.hidden = true;
                fix.detectChanges();

                filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                expect(filteringCells.length).toEqual(1);

                const chip = filteringCells[0].query(By.css('igx-chip'));
                chip.nativeElement.click();
                fix.detectChanges();

                // check if it is positioned at the bottom of the thead.
                const thead = fix.debugElement.query(By.css('.igx-grid__thead-wrapper')).nativeElement;
                const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
                const frElem = filteringRow.nativeElement;
                expect(frElem.offsetTop + frElem.clientHeight).toEqual(thead.clientHeight);

                GridFunctions.closeFilterRow(fix);

                groupCol.hidden = false;
                fix.detectChanges();

                filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                expect(filteringCells.length).toEqual(6);

                const prodNameChipContent = filteringCells[1].query(By.css('igx-chip')).query(By.css('.igx-chip__content'));
                expect(prodNameChipContent.nativeElement.textContent.trim()).toEqual('Ignite');
            }));

        it('Should size grid correctly if enable/disable filtering in run time - MCH.', fakeAsync(() => {
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

        it('should correctly apply locale to datePicker.', fakeAsync(() => {
            registerLocaleData(localeDE);
            fix.detectChanges();

            grid.locale = 'de-DE';

            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const dateCellChip = initialChips[3].nativeElement;

            dateCellChip.click();
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));

            input.nativeElement.click();
            tick();
            fix.detectChanges();

            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            const calendar = outlet.getElementsByClassName('igx-calendar')[0];

            const sundayLabel = calendar.querySelectorAll('.igx-calendar__label')[0].innerHTML;

            expect(sundayLabel.trim()).toEqual('So');
        }));
    });

    describe(null, () => {
        let fix, grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringScrollComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should correctly update empty filter cells when scrolling horizontally.', async () => {
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
    });

    describe(null, () => {
        let fix, grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringTemplateComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should render custom filter template instead of default one.', fakeAsync(() => {
            // Verify default filter template is not present.
            expect(GridFunctions.getFilterCell(fix, 'ProductName').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\`ProductName\` default filter chips area template was found.');
            expect(GridFunctions.getFilterCell(fix, 'Downloads').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\`Downloads\` default filter chips area template was found.');
            expect(GridFunctions.getFilterCell(fix, 'Released').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\`Released\` default filter chips area template was found.');
            expect(GridFunctions.getFilterCell(fix, 'ReleaseDate').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\`ReleaseDate\` default filter chips area template was found.');

            // Verify the custom filter template is present.
            expect(GridFunctions.getFilterCell(fix, 'ProductName').query(By.css('.custom-filter'))).not.toBeNull(
                '\`ProductName\` customer filter tempalte was not found.');
            expect(GridFunctions.getFilterCell(fix, 'Downloads').query(By.css('.custom-filter'))).not.toBeNull(
                '\`Downloads\` customer filter tempalte was not found.');
            expect(GridFunctions.getFilterCell(fix, 'Released').query(By.css('.custom-filter'))).not.toBeNull(
                '\`Released\` customer filter tempalte was not found.');
            expect(GridFunctions.getFilterCell(fix, 'ReleaseDate').query(By.css('.custom-filter'))).not.toBeNull(
                '\`ReleaseDate\` customer filter tempalte was not found.');
        }));
    });
});

describe('IgxGrid - Filtering actions - Excel style filtering', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent,
                IgxTestExcelFilteringDatePickerComponent,
                IgxGridFilteringESFTemplatesComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxGridExcelStyleFilteringModule]
        })
            .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe(null, () => {
        let fix, grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            grid = fix.componentInstance.grid;
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        }));

        it('Should sort the grid properly, when clicking Ascending/Descending buttons.', fakeAsync(() => {
            grid.columns[2].sortable = true;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const sortComponent = excelMenu.querySelector('.igx-excel-filter__sort');

            const sortAsc = sortComponent.lastElementChild.children[0].children[0];
            sortAsc.click();
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);
        }));

        it('Should toggle correct Ascending/Descending button on opening when sorting is applied.', fakeAsync(() => {
            grid.columns[2].sortable = true;
            grid.sortingExpressions.push({ dir: SortingDirection.Asc, fieldName: 'Downloads' });
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const sortComponent = excelMenu.querySelector('.igx-excel-filter__sort');

            const sortAsc = sortComponent.lastElementChild.children[0].children[0];
            const sortDesc = sortComponent.lastElementChild.children[0].children[1];

            expect(sortAsc).toHaveClass('igx-button-group__item--selected');
            expect(sortDesc).not.toHaveClass('igx-button-group__item--selected');
        }));

        it('Should move column left/right when clicking buttons.', fakeAsync(() => {
            grid.columns[2].movable = true;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const moveComponent = excelMenu.querySelector('.igx-excel-filter__move');

            const moveLeft = moveComponent.lastElementChild.children[0];
            const moveRight = moveComponent.lastElementChild.children[1];

            moveLeft.click();
            fix.detectChanges();

            expect(grid.columns[2].field).toBe('ProductName');
            expect(grid.columns[1].field).toBe('Downloads');

            moveLeft.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[1].field).toBe('ID');
            expect(grid.columns[0].field).toBe('Downloads');
            expect(moveLeft).toHaveClass('igx-button--disabled');

            moveRight.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[0].field).toBe('ID');
            expect(grid.columns[1].field).toBe('Downloads');
            expect(moveLeft).not.toHaveClass('igx-button--disabled');
        }));

        it('Should pin column when clicking buttons.', fakeAsync(() => {
            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const pinComponent = excelMenu.querySelector('.igx-excel-filter__actions-pin');

            pinComponent.click();
            fix.detectChanges();

            expect(grid.pinnedColumns[0].field).toEqual('Downloads');
        }));

        it('Should unpin column when clicking buttons.', fakeAsync(() => {
            grid.columns[2].pinned = true;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[0].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const unpinComponent = excelMenu.querySelector('.igx-excel-filter__actions-unpin');

            unpinComponent.click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
        }));

        it('Should hide column when click on button.', fakeAsync(() => {
            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;
            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const hideComponent = excelMenu.querySelector('.igx-excel-filter__actions-hide');

            spyOn(grid.onColumnVisibilityChanged, 'emit');
            hideComponent.click();
            fix.detectChanges();

            expect(grid.onColumnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(grid.columns[2].hidden).toBeTruthy();
        }));

        it('Should not select values in list if two values with And operator are entered.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const checkbox: any[] = Array.from(excelMenu.querySelectorAll('.igx-checkbox__input'));

            expect(checkbox.map(c => c.checked)).toEqual([false, false, false, false, false, false, false, false]);
        }));

        it('Should not select values in list if two values with Or operator are entered and contains operand.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'Ignite', condition: IgxStringFilteringOperand.instance().condition('contains') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[1].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const checkbox: any[] = Array.from(excelMenu.querySelectorAll('.igx-checkbox__input'));

            expect(checkbox.map(c => c.checked)).toEqual([false, false, false, false, false, false]);
        }));

        it('Should select values in list if two values with Or operator are entered and they are in the list below.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const checkbox: any[] = Array.from(excelMenu.querySelectorAll('.igx-checkbox__input'));

            expect(checkbox.map(c => c.checked)).toEqual([true, false, false, true, false, false, true, false]);
            expect(checkbox.map(c => c.indeterminate)).toEqual([true, false, false, false, false, false, false, false]);
        }));

        it('Should change filter when changing And/Or operator.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const customFilterComponent = excelMenu.querySelector('.igx-excel-filter__actions-filter');
            customFilterComponent.click();
            fix.detectChanges();

            const subMenu = grid.nativeElement.querySelector('.igx-drop-down__list');
            const customItem = subMenu.children[0].children[10];

            customItem.click();
            fix.detectChanges();

            const customMenu = grid.nativeElement.querySelector('.igx-excel-filter__secondary');

            const andButton = customMenu.querySelector('.igx-button--flat', '.igx-button-group__item');
            andButton.click();
            fix.detectChanges();

            const applyButton = customMenu.querySelector('.igx-button--raised');
            applyButton.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(0);
        }));

        it('Should change filter when changing operator.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const customFilterComponent = excelMenu.querySelector('.igx-excel-filter__actions-filter');

            customFilterComponent.click();
            fix.detectChanges();

            const subMenu = grid.nativeElement.querySelector('.igx-drop-down__list');
            const customItem = subMenu.children[0].children[10];

            customItem.click();
            fix.detectChanges();

            const customMenu = grid.nativeElement.querySelector('.igx-excel-filter__secondary');

            // select second expression's operator
            GridFunctions.setOperatorESF(customMenu, grid, 1, 2, fix);

            const applyButton = customMenu.querySelector('.igx-button--raised');
            applyButton.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(5);
        }));

        it('Should populate custom filter dialog.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const customFilterComponent = excelMenu.querySelector('.igx-excel-filter__actions-filter');

            customFilterComponent.click();
            fix.detectChanges();

            const subMenu = grid.nativeElement.querySelector('.igx-drop-down__list');
            const customItem = subMenu.children[0].children[10];

            customItem.click();
            fix.detectChanges();

            const customMenu = grid.nativeElement.querySelector('.igx-excel-filter__secondary');

            const firstValue =
                customMenu.children[1].children[0].children[2].querySelector('.igx-input-group__bundle-main').children[0].value;
            const secondValue =
                customMenu.children[1].children[1].children[2].querySelector('.igx-input-group__bundle-main').children[0].value;

            expect(firstValue).toEqual('254');
            expect(secondValue).toEqual('20');
        }));

        it('Should display friendly conditions\' names in custom filter dialog.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                {
                    fieldName: 'ProductName', searchVal: 'Ignite',
                    condition: IgxStringFilteringOperand.instance().condition('doesNotContain')
                }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[1].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const customFilterComponent = excelMenu.querySelector('.igx-excel-filter__actions-filter');

            customFilterComponent.click();
            fix.detectChanges();

            const subMenu = grid.nativeElement.querySelector('.igx-drop-down__list');
            const customItem = subMenu.children[0].children[1];

            customItem.click();
            fix.detectChanges();

            const customMenu = grid.nativeElement.querySelector('.igx-excel-filter__secondary');
            const firstValue =
                customMenu.children[1].children[0].children[1].querySelector('.igx-input-group__bundle-main').children[0].value;

            expect(firstValue).toMatch('Does Not Contain');
        }));

        it('Should clear the filter when click Clear filter item.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const clearFilter = excelMenu.querySelector('.igx-excel-filter__actions-clear');

            clearFilter.click();
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
        }));

        it('Should update filter icon when dialog is closed and the filter has been changed.', fakeAsync(() => {
            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            let filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const checkbox = excelMenu.querySelectorAll('.igx-checkbox__composite');

            checkbox[0].click();
            tick();
            fix.detectChanges();

            checkbox[2].click();
            tick();
            fix.detectChanges();

            const applyButton = excelMenu.querySelector('.igx-button--raised');
            applyButton.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(1);

            filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            expect(filterIcon).toBeNull();

            filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            expect(filterIcon).toBeDefined();
        }));

        it('Should filter grid via custom dialog.', fakeAsync(() => {
            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const customFilterComponent = excelMenu.querySelector('.igx-excel-filter__actions-filter');

            customFilterComponent.click();
            fix.detectChanges();

            const subMenu = grid.nativeElement.querySelector('.igx-drop-down__list');
            const equalsItem = subMenu.children[0].children[0];

            equalsItem.click();
            tick();
            fix.detectChanges();

            const customMenu = grid.nativeElement.querySelector('.igx-excel-filter__secondary');

            // set first expression's value
            GridFunctions.setInputValueESF(customMenu, 0, 0, fix);

            // select second expression's operator
            GridFunctions.setOperatorESF(customMenu, grid, 1, 1, fix);

            // set second expression's value
            GridFunctions.setInputValueESF(customMenu, 1, 20, fix);

            const applyButton = customMenu.querySelector('.igx-button--raised');
            applyButton.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(1);
        }));

        it('Should filter grid via custom dialog - 3 expressions.', fakeAsync(() => {
            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[3].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const customFilterComponent = excelMenu.querySelector('.igx-excel-filter__actions-filter');

            customFilterComponent.click();
            fix.detectChanges();

            const subMenu = grid.nativeElement.querySelector('.igx-drop-down__list');
            const allItem = subMenu.children[0].children[0];

            allItem.click();
            tick();
            fix.detectChanges();

            const customMenu = grid.nativeElement.querySelector('.igx-excel-filter__secondary');

            // select second expression's operator
            GridFunctions.setOperatorESF(customMenu, grid, 1, 1, fix);

            const addButton = customMenu.querySelector('.igx-excel-filter__add-filter');
            addButton.click();
            fix.detectChanges();

            // select third expression's operator
            GridFunctions.setOperatorESF(customMenu, grid, 2, 4, fix);

            const applyButton = customMenu.querySelector('.igx-button--raised');
            applyButton.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(3);
        }));

        it('Should clear filter from custom dialog.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[2].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
            filterIcon.click();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const customFilterComponent = excelMenu.querySelector('.igx-excel-filter__actions-filter');

            customFilterComponent.click();
            fix.detectChanges();

            const subMenu = grid.nativeElement.querySelector('.igx-drop-down__list');
            const customItem = subMenu.children[0].children[10];

            customItem.click();
            fix.detectChanges();

            const customMenu = grid.nativeElement.querySelector('.igx-excel-filter__secondary');

            const removeButton = customMenu.querySelector('.igx-button--icon');
            removeButton.click();
            fix.detectChanges();

            const footerButtons = customMenu.querySelector('.igx-excel-filter__secondary-footer');
            const clearButton = footerButtons.children[0];
            clearButton.click();
            fix.detectChanges();

            const applyButton = customMenu.querySelector('.igx-button--raised');
            applyButton.click();
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
        }));

        it('Should pin/unpin column when clicking pin/unpin icon in header', fakeAsync(() => {
            grid.displayDensity = DisplayDensity.cosy;
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and pin 'ProductName' column through header icon
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickPinIconInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            const column = grid.columns.find((col) => col.field === 'ProductName');
            GridFunctions.verifyColumnIsPinned(column, true, 1);

            // Open excel style filtering component and UNpin 'ProductName' column through header icon
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickPinIconInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            GridFunctions.verifyColumnIsPinned(column, false, 0);
        }));

        it('Should hide column when clicking hide icon in header', fakeAsync(() => {
            grid.displayDensity = DisplayDensity.compact;
            tick(200);
            fix.detectChanges();

            const column = grid.columns.find((col) => col.field === 'ProductName');
            GridFunctions.verifyColumnIsHidden(column, false, 6);

            // Open excel style filtering component and hide 'ProductName' column through header icon
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickHideIconInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(column, true, 5);
        }));

        it('Should move pinned column correctly by using move buttons', fakeAsync(() => {
            const productNameCol = grid.columns.find((col) => col.field === 'ProductName');
            productNameCol.movable = true;
            productNameCol.pinned = true;
            fix.detectChanges();

            const idCol = grid.columns.find((col) => col.field === 'ID');
            idCol.movable = true;
            idCol.pinned = true;
            fix.detectChanges();

            expect(GridFunctions.getColumnHeaderByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderByIndex(fix, 1).innerText).toBe('ID');
            expect(productNameCol.pinned).toBe(true);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();

            // Move 'ProductName' one step to the right. (should move)
            GridFunctions.clickMoveRightInExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderByIndex(fix, 0).innerText).toBe('ID');
            expect(GridFunctions.getColumnHeaderByIndex(fix, 1).innerText).toBe('ProductName');
            expect(productNameCol.pinned).toBe(true);

            // Move 'ProductName' one step to the left. (should move)
            GridFunctions.clickMoveLeftInExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderByIndex(fix, 1).innerText).toBe('ID');
            expect(productNameCol.pinned).toBe(true);

            // Try move 'ProductName' one step to the left. (Button should be disabled since it's already first)
            const moveComponent = GridFunctions.getExcelFilteringMoveComponent(fix);
            const btnMoveLeft: any = moveComponent.querySelectorAll('button')[0];
            expect(btnMoveLeft.classList.contains('igx-button--disabled')).toBe(true);

            // Move 'ProductName' two steps to the right. (should move)
            GridFunctions.clickMoveRightInExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickMoveRightInExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderByIndex(fix, 0).innerText).toBe('ID');
            expect(GridFunctions.getColumnHeaderByIndex(fix, 1).innerText).toBe('ProductName');
            expect(productNameCol.pinned).toBe(false);
        }));

        it('Should move unpinned column correctly by using move buttons', fakeAsync(() => {
            const productNameCol = grid.columns.find((col) => col.field === 'ProductName');
            productNameCol.movable = true;
            productNameCol.pinned = true;
            fix.detectChanges();

            const downloadsCol = grid.columns.find((col) => col.field === 'Downloads');
            downloadsCol.movable = true;
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderByIndex(fix, 2).innerText).toBe('Downloads');
            expect(downloadsCol.pinned).toBe(false);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();

            GridFunctions.clickMoveLeftInExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickMoveLeftInExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getColumnHeaderByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderByIndex(fix, 1).innerText).toBe('Downloads');
            expect(downloadsCol.pinned).toBe(true);
        }));

        it('Should filter and clear the excel search component correctly', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = searchComponent.querySelectorAll('igx-list-item');
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');

            // Type string in search box.
            const inputNativeElement = searchComponent.querySelector('.igx-input-group__input');
            sendInputNativeElement(inputNativeElement, 'ignite', fix);
            tick(100);
            fix.detectChanges();

            listItems = searchComponent.querySelectorAll('igx-list-item');
            expect(listItems.length).toBe(3, 'incorrect rendered list items count');

            // Clear filtering of ESF search.
            const clearIcon: any = Array.from(searchComponent.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'clear');
            clearIcon.click();
            fix.detectChanges();

            listItems = searchComponent.querySelectorAll('igx-list-item');
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
            tick(100);
        }));

        it('display density is properly applied on the excel style filtering component', fakeAsync(() => {
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const column = grid.columns.find((c) => c.field === 'ProductName');
            column.sortable = true;
            column.movable = true;
            fix.detectChanges();

            // Open excel style filtering component and verify its display density
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            verifyExcelStyleFilteringDisplayDensity(gridNativeElement, DisplayDensity.comfortable);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.compact;
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and verify its display density
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            verifyExcelStyleFilteringDisplayDensity(gridNativeElement, DisplayDensity.compact);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.cosy;
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and verify its display density
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            verifyExcelStyleFilteringDisplayDensity(gridNativeElement, DisplayDensity.cosy);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
        }));

        it('display density is properly applied on the excel style custom filtering dialog', fakeAsync(() => {
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const column = grid.columns.find((c) => c.field === 'ProductName');
            column.sortable = true;
            column.movable = true;
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its display density
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            fix.detectChanges();
            verifyExcelCustomFilterDisplayDensity(gridNativeElement, DisplayDensity.comfortable);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.cosy;
            tick(200);
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its display density
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            fix.detectChanges();
            verifyExcelCustomFilterDisplayDensity(gridNativeElement, DisplayDensity.cosy);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.compact;
            tick(200);
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its display density
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            fix.detectChanges();
            verifyExcelCustomFilterDisplayDensity(gridNativeElement, DisplayDensity.compact);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
            fix.detectChanges();
        }));

        it('should scroll items in search list correctly', (async () => {
            // Add additional rows as prerequisite for the test
            for (let index = 0; index < 30; index++) {
                const newRow = {
                    Downloads: index,
                    ID: index + 100,
                    ProductName: 'New Product ' + index,
                    ReleaseDate: new Date(),
                    Released: false,
                    AnotherField: 'z'
                };
                grid.addRow(newRow);
            }
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.compact;
            await wait(100);
            fix.detectChanges();

            // Open excel style filtering component
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(16);
            fix.detectChanges();

            // Scroll the search list to the bottom.
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
            const searchComponent = excelMenu.querySelector('.igx-excel-filter__menu-main');
            const scrollbar = searchComponent.querySelector('igx-virtual-helper');
            scrollbar.scrollTop = 3000;
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar's scrollTop.
            expect(scrollbar.scrollTop >= 610 && scrollbar.scrollTop <= 615).toBe(true,
                'search scrollbar has incorrect scrollTop');
            // Verify display container height.
            const displayContainer = searchComponent.querySelector('igx-display-container');
            const displayContainerRect = displayContainer.getBoundingClientRect();
            expect(displayContainerRect.height).toBe(288, 'incorrect search display container height');
            // Verify rendered list items count.
            const listItems = displayContainer.querySelectorAll('igx-list-item');
            expect(listItems.length).toBe(12, 'incorrect rendered list items count');
        }));

        it('should correctly display all items in search list after filtering it', (async () => {
            // Add additional rows as prerequisite for the test
            for (let index = 0; index < 4; index++) {
                const newRow = {
                    Downloads: index,
                    ID: index + 100,
                    ProductName: 'New Sales Product ' + index,
                    ReleaseDate: new Date(),
                    Released: false,
                    AnotherField: 'z'
                };
                grid.addRow(newRow);
            }
            fix.detectChanges();

            // Open excel style filtering component
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(200);
            fix.detectChanges();

            // Scroll the search list to the middle.
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
            const searchComponent = excelMenu.querySelector('.igx-excel-filter__menu-main');
            const displayContainer = searchComponent.querySelector('igx-display-container');
            const scrollbar = searchComponent.querySelector('igx-virtual-helper');
            scrollbar.scrollTop = (<HTMLElement>displayContainer).getBoundingClientRect().height / 2;
            await wait(200);
            fix.detectChanges();

            // Type string in search box
            const inputNativeElement = searchComponent.querySelector('.igx-input-group__input');
            sendInputNativeElement(inputNativeElement, 'sale', fix);
            await wait(200);
            fix.detectChanges();

            // Verify the display container is within the bounds of the list
            const displayContainerRect = displayContainer.getBoundingClientRect();
            const listNativeElement = searchComponent.querySelector('.igx-list');
            const listRect = listNativeElement.getBoundingClientRect();
            expect(displayContainerRect.top >= listRect.top).toBe(true, 'displayContainer starts above list');
            expect(displayContainerRect.bottom <= listRect.bottom).toBe(true, 'displayContainer ends below list');
        }));

        it('Should not treat \'Select All\' as a search result.', fakeAsync(() => {
            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[1].children[0].nativeElement;
            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const searchComponent = excelMenu.querySelector('.igx-excel-filter__menu-main');
            const input = searchComponent.querySelector('.igx-input-group__input');
            let checkBoxes = excelMenu.querySelectorAll('.igx-checkbox');
            expect(checkBoxes.length).toBe(6);

            sendInputNativeElement(input, 'a', fix);
            tick(100);
            checkBoxes = excelMenu.querySelectorAll('.igx-checkbox');
            expect(checkBoxes.length).toBe(4);

            sendInputNativeElement(input, 'al', fix);
            tick(100);
            checkBoxes = excelMenu.querySelectorAll('.igx-checkbox');
            expect(checkBoxes.length).toBe(0);
        }));

        it('Column formatter should skip the \'SelectAll\' list item', fakeAsync(() => {
            grid.columns[4].formatter = (val: Date) => {
                return new Intl.DateTimeFormat('bg-BG').format(val);
            };
            grid.cdr.detectChanges();

            // Open excel style filtering component
            try {
                GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
                fix.detectChanges();
            } catch (ex) { expect(ex).toBeNull(); }
        }));

        it('should keep newly added filter expression in view', fakeAsync(() => {
            // Open excel style custom filter dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            // Click 'Add Filter' button.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            tick(200);
            fix.detectChanges();

            // Verify last expression is currently in view inside the expressions container.
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const customFilterMenu = gridNativeElement.querySelector('.igx-excel-filter__secondary');
            const expressionsContainer = customFilterMenu.querySelector('.igx-excel-filter__secondary-main');
            const expressions = GridFunctions.sortNativeElementsVertically(
                Array.from(expressionsContainer.querySelectorAll('.igx-excel-filter__condition')));
            const lastExpression = expressions[expressions.length - 1];
            const lastExpressionRect = lastExpression.getBoundingClientRect();
            const expressionsContainerRect = expressionsContainer.getBoundingClientRect();
            expect(lastExpressionRect.top >= expressionsContainerRect.top).toBe(true,
                'lastExpression starts above expressionsContainer');
            expect(lastExpressionRect.bottom <= expressionsContainerRect.bottom).toBe(true,
                'lastExpression ends below expressionsContainer');

            // Verify addFilter button is currently in view beneath the last expression.
            const addFilterButton = customFilterMenu.querySelector('.igx-excel-filter__add-filter');
            const addFilterButtonRect = addFilterButton.getBoundingClientRect();
            expect(addFilterButtonRect.top >= lastExpressionRect.bottom).toBe(true,
                'addFilterButton overlaps lastExpression');
            expect(addFilterButtonRect.bottom <= expressionsContainerRect.bottom).toBe(true,
                'addFilterButton ends below expressionsContainer');

            // Close excel style custom filtering dialog.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
            fix.detectChanges();
        }));

        it('Should generate "equals" conditions when selecting two values.', fakeAsync(() => {
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[1].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const checkbox = excelMenu.querySelectorAll('.igx-checkbox__input');
            const applyButton = excelMenu.querySelector('.igx-button--raised');

            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            tick();
            fix.detectChanges();

            applyButton.click();
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(2);
            const operands = grid.filteringExpressionsTree.filteringOperands[0].filteringOperands;
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'equals', 'Ignite UI for Angular');
            verifyFilteringExpression(operands[1], 'ProductName', 'equals', 'Ignite UI for JavaScript');
        }));

        it('Should generate "in" condition when selecting more than two values.', fakeAsync(() => {
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[1].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const checkbox = excelMenu.querySelectorAll('.igx-checkbox__input');
            const applyButton = excelMenu.querySelector('.igx-button--raised');

            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            checkbox[4].click(); // NetAdvantage
            tick();
            fix.detectChanges();

            applyButton.click();
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(3);
            const operands = grid.filteringExpressionsTree.filteringOperands[0].filteringOperands;
            expect(operands.length).toBe(1);
            verifyFilteringExpression(operands[0], 'ProductName', 'in',
                new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage']));
        }));

        it('Should generate "in" and "empty" conditions when selecting more than two values including (Blanks).', fakeAsync(() => {
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
            const headerResArea = headers[1].children[0].nativeElement;

            const filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
            filterIcon.click();
            fix.detectChanges();

            const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
            const checkbox = excelMenu.querySelectorAll('.igx-checkbox__input');
            const applyButton = excelMenu.querySelector('.igx-button--raised');

            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();

            checkbox[1].click(); // (Blanks)
            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            tick();
            fix.detectChanges();

            applyButton.click();
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(6);
            const operands = grid.filteringExpressionsTree.filteringOperands[0].filteringOperands;
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'in',
                new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript']));
            verifyFilteringExpression(operands[1], 'ProductName', 'empty', null);
        }));

        it('should not display search scrollbar when not needed for the current display density', (async () => {

            grid.getCellByColumn(3, 'ProductName').update('Test');
            fix.detectChanges();
            // Verify scrollbar is visible for 'comfortable'.

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(16);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix)).toBe(true, 'excel search scrollbar should be visible');
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.cosy;
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'cosy'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(16);
            fix.detectChanges();
            expect(isExcelSearchScrollBarVisible(fix)).toBe(false, 'excel search scrollbar should NOT be visible');
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.compact;
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'compact'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(16);
            fix.detectChanges();
            expect(isExcelSearchScrollBarVisible(fix)).toBe(false, 'excel search scrollbar should NOT be visible');
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
        }));

        it('Should cascade filter the available filter options.', fakeAsync(() => {
            fix.detectChanges();

            openExcelMenu(fix, 2);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '(Blanks)', '0', '20', '100', '127', '254', '702'],
                [true, true, true, true, true, true, true, true]);

            openExcelMenu(fix, 1);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                    'NetAdvantage', 'Some other item with Script'],
                [true, true, true, true, true, true]);

            openExcelMenu(fix, 3);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '(Blanks)', 'false', 'true'],
                [true, true, true, true]);

            toggleExcelStyleFilteringItems(fix, grid, true, 3);

            expect(grid.rowList.length).toBe(5);

            openExcelMenu(fix, 3);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '(Blanks)', 'false', 'true'],
                [null, true, true, false]);

            openExcelMenu(fix, 2);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '20', '100', '254', '702', '1,000'],
                [true, true, true, true, true, true]);

            openExcelMenu(fix, 1);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'],
                [true, true, true, true, true]);

            toggleExcelStyleFilteringItems(fix, grid, false, 0);
            toggleExcelStyleFilteringItems(fix, grid, true, 2, 3);

            expect(grid.rowList.length).toBe(2);

            openExcelMenu(fix, 3);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '(Blanks)', 'false', 'true'],
                [null, true, true, false]);

            openExcelMenu(fix, 1);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'],
                [null, false, true, true, false]);

            openExcelMenu(fix, 2);
            verifyExcelStyleFilterAvailableOptions(grid,
                ['Select All', '20', '254'],
                [true, true, true]);
        }));

        it('Should display the ESF based on the filterIcon within the grid', async () => {
            // Test prerequisites
            grid.width = '800px';
            fix.detectChanges();
            for (const column of grid.columns) {
                column.width = '300px';
            }
            grid.cdr.detectChanges();
            await wait(16);

            // Scroll a bit to the right, so the ProductName column is not fully visible.
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 500;
            await wait(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();

            // Verify that the left, top and right borders of the ESF are within the grid.
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const gridRect = gridNativeElement.getBoundingClientRect();
            const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
            const excelMenuRect = excelMenu.getBoundingClientRect();
            expect(excelMenuRect.left >= gridRect.left).toBe(true, 'ESF spans outside the grid on the left');
            expect(excelMenuRect.top >= gridRect.top).toBe(true, 'ESF spans outside the grid on the top');
            expect(excelMenuRect.right <= gridRect.right).toBe(true, 'ESF spans outside the grid on the right');
        });

        it('Should sort/unsort when clicking the sort ASC button.', async () => {
            const column = grid.columns.find((c) => c.field === 'Downloads');
            column.sortable = true;
            fix.detectChanges();

            // Verify data is not sorted initially.
            let cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('254');
            expect(cells[7].innerText).toBe('1,000');

            // Click 'sort asc' button in ESF.
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await wait(100);
            fix.detectChanges();
            GridFunctions.clickSortAscInExcelStyleFiltering(fix);
            await wait(100);
            fix.detectChanges();

            // Verify data is sorted in ascending order.
            cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('');
            expect(cells[1].innerText).toBe('0');
            expect(cells[7].innerText).toBe('1,000');

            // Click 'sort asc' button in ESF.
            GridFunctions.clickSortAscInExcelStyleFiltering(fix);
            await wait(100);
            fix.detectChanges();

            // Verify data is not sorted.
            cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('254');
            expect(cells[7].innerText).toBe('1,000');
        });

        it('Should sort/unsort when clicking the sort DESC button.', async () => {
            const column = grid.columns.find((c) => c.field === 'Downloads');
            column.sortable = true;
            fix.detectChanges();

            // Verify data is not sorted initially.
            let cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('254');
            expect(cells[7].innerText).toBe('1,000');

            // Click 'sort desc' button in ESF.
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await wait(100);
            fix.detectChanges();
            GridFunctions.clickSortDescInExcelStyleFiltering(fix);
            await wait(100);
            fix.detectChanges();

            // Verify data is sorted in descending order.
            cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('1,000');
            expect(cells[1].innerText).toBe('702');
            expect(cells[7].innerText).toBe('');

            // Click 'sort desc' button in ESF.
            GridFunctions.clickSortDescInExcelStyleFiltering(fix);
            await wait(100);
            fix.detectChanges();

            // Verify data is not sorted.
            cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('254');
            expect(cells[7].innerText).toBe('1,000');
        });

        it('Should (sort ASC)/(sort DESC) when clicking the respective sort button.', async () => {
            const column = grid.columns.find((c) => c.field === 'Downloads');
            column.sortable = true;
            fix.detectChanges();

            // Verify data is not sorted initially.
            let cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('254');
            expect(cells[7].innerText).toBe('1,000');

            // Click 'sort desc' button in ESF.
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await wait(100);
            fix.detectChanges();
            GridFunctions.clickSortDescInExcelStyleFiltering(fix);
            await wait(100);
            fix.detectChanges();

            // Verify data is sorted in descending order.
            cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('1,000');
            expect(cells[1].innerText).toBe('702');
            expect(cells[7].innerText).toBe('');

            // Click 'sort asc' button in ESF.
            GridFunctions.clickSortAscInExcelStyleFiltering(fix);
            await wait(100);
            fix.detectChanges();

            // Verify data is sorted in ascending order.
            cells = GridFunctions.sortNativeElementsVertically(
                GridFunctions.getColumnCells(fix, 'Downloads').map((c) => c.nativeElement));
            expect(cells[0].innerText).toBe('');
            expect(cells[1].innerText).toBe('0');
            expect(cells[7].innerText).toBe('1,000');
        });

        it('Should add/remove expressions in custom filter dialog through UI correctly.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            // Verify expressions count.
            let expressions = Array.from(GridFunctions.getExcelCustomFilteringDefaultExpressions(fix));
            expect(expressions.length).toBe(2);

            // Add two new expressions.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            tick(100);
            fix.detectChanges();

            // Verify expressions count.
            expressions = Array.from(GridFunctions.getExcelCustomFilteringDefaultExpressions(fix));
            expect(expressions.length).toBe(4);

            // Remove last expression by clicking its remove icon.
            let expr: any = expressions[3];
            let removeIcon: any = Array.from(expr.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'cancel');
            removeIcon.click();
            fix.detectChanges();

            // Verify expressions count.
            expressions = Array.from(GridFunctions.getExcelCustomFilteringDefaultExpressions(fix));
            expect(expressions.length).toBe(3);

            // Remove second expression by clicking its remove icon.
            expr = expressions[1];
            removeIcon = Array.from(expr.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'cancel');
            removeIcon.click();
            fix.detectChanges();

            // Verify expressions count.
            expressions = Array.from(GridFunctions.getExcelCustomFilteringDefaultExpressions(fix));
            expect(expressions.length).toBe(2);
        }));

        it('Should keep selected operator of custom expression the same when clicking it.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            // Verify 'And' button is selected on first expression.
            const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[0];
            let andButton: any = Array.from(expr.querySelectorAll('.igx-button-group__item'))
                .find((b: any) => b.innerText === 'And');
            expect(andButton.classList.contains('igx-button-group__item--selected')).toBe(true);

            // Click the 'And' button.
            andButton.click();
            tick(100);
            fix.detectChanges();

            // Verify that selected button remains the same.
            const buttons = Array.from(expr.querySelectorAll('.igx-button-group__item'));
            andButton = buttons.find((b: any) => b.innerText === 'And');
            expect(andButton.classList.contains('igx-button-group__item--selected')).toBe(true);

            const orButton: any = buttons.find((b: any) => b.innerText === 'Or');
            expect(orButton.classList.contains('igx-button-group__item--selected')).toBe(false);
        }));

        it('Should select the button operator in custom expression when pressing \'Enter\' on it.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[0];
            const buttons = Array.from(expr.querySelectorAll('.igx-button-group__item'));
            const andButton: any = buttons.find((b: any) => b.innerText === 'And');
            const orButton: any = buttons.find((b: any) => b.innerText === 'Or');

            // Verify 'and' is selected.
            expect(andButton.classList.contains('igx-button-group__item--selected')).toBe(true);
            expect(orButton.classList.contains('igx-button-group__item--selected')).toBe(false);

            // Press 'Enter' on 'or' button and verify it gets selected.
            orButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fix.detectChanges();
            expect(andButton.classList.contains('igx-button-group__item--selected')).toBe(false);
            expect(orButton.classList.contains('igx-button-group__item--selected')).toBe(true);

            // Press 'Enter' on 'and' button and verify it gets selected.
            andButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fix.detectChanges();
            expect(andButton.classList.contains('igx-button-group__item--selected')).toBe(true);
            expect(orButton.classList.contains('igx-button-group__item--selected')).toBe(false);
        }));

        it('Should open conditions dropdown of custom expression with \'Alt + Arrow Down\'.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[0];
            const inputs = GridFunctions.sortNativeElementsHorizontally(Array.from(expr.querySelectorAll('input')));
            const conditionsInput = inputs[0];

            // Dropdown should be hidden.
            let operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).not.toBeNull();

            // Press 'Alt + Arrow Down' to open operators dropdown.
            conditionsInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }));
            tick(100);
            fix.detectChanges();

            // Dropdown should be visible.
            operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).toBeNull();

            // Click-off to close dropdown.
            expr.click();
            tick(100);
            fix.detectChanges();

            // Dropdown should be hidden.
            operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).not.toBeNull();
        }));

        it('Should open calendar when clicking date-picker of custom expression.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const datePickerInput = datePicker.querySelector('input');

            // Verify calendar is not opened.
            let calendar = document.querySelector('igx-calendar');
            expect(calendar).toBeNull();

            // Click date picker input to open calendar.
            datePickerInput.dispatchEvent(new MouseEvent('click'));
            tick(200);
            fix.detectChanges();

            // Verify calendar is opened.
            calendar = document.querySelector('igx-calendar');
            expect(calendar).not.toBeNull();

            // Click-off to close calendar.
            expr.click();
            tick(100);
            fix.detectChanges();

            // Verify calendar is opened.
            calendar = document.querySelector('igx-calendar');
            expect(calendar).toBeNull();
        }));

        it('Should filter grid through custom date filter dialog.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const datePickerInput = datePicker.querySelector('input');

            // Click date picker input to open calendar.
            datePickerInput.dispatchEvent(new MouseEvent('click'));
            tick(100);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-calendar__date--current');
            (todayItem as HTMLElement).click();
            tick(100);
            fix.detectChanges();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
            fix.detectChanges();

            // Verify the results are with 'today' date.
            const cellValue = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(new Date(cellValue.innerText).toDateString()).toMatch(new Date().toDateString());
            expect(grid.filteredData.length).toEqual(1);
        }));

        it('Should correctly update \'SelectAll\' based on checkboxes.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const visibleListItems = GridFunctions.sortNativeElementsVertically(
                Array.from(searchComponent.querySelectorAll('igx-list-item')));
            const thirdListItem = visibleListItems[2];
            const thirdItemCbInput = thirdListItem.querySelector('.igx-checkbox__input');

            // Verify 'Select All' checkbox is not indeterminate.
            let selectAllCheckbox = visibleListItems[0].querySelector('igx-checkbox');
            expect(selectAllCheckbox.classList.contains('igx-checkbox--indeterminate')).toBe(false);

            // Uncheck third list item.
            thirdItemCbInput.click();
            tick(100);
            fix.detectChanges();

            // Verify 'Select All' checkbox is indeterminate.
            selectAllCheckbox = visibleListItems[0].querySelector('igx-checkbox');
            expect(selectAllCheckbox.classList.contains('igx-checkbox--indeterminate')).toBe(true);

            // Check third list item again.
            thirdItemCbInput.click();
            tick(100);
            fix.detectChanges();

            // Verify 'Select All' checkbox is not indeterminate.
            selectAllCheckbox = visibleListItems[0].querySelector('igx-checkbox');
            expect(selectAllCheckbox.classList.contains('igx-checkbox--indeterminate')).toBe(false);
        }));

        it('Should correctly update all items based on \'SelectAll\' checkbox.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const visibleListItems = GridFunctions.sortNativeElementsVertically(
                Array.from(searchComponent.querySelectorAll('igx-list-item')));
            const dataListItems = Array.from(visibleListItems).slice(1, visibleListItems.length);

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                const dataListItemCheckbox = (dataListItem as any).querySelector('igx-checkbox');
                expect(dataListItemCheckbox.classList.contains('igx-checkbox--checked')).toBe(true);
            }

            // Click 'Select All' checkbox.
            let selectAllCbInput = visibleListItems[0].querySelector('.igx-checkbox__input');
            selectAllCbInput.click();
            fix.detectChanges();

            // Verify all visible data list items are unchecked.
            for (const dataListItem of dataListItems) {
                const dataListItemCheckbox = (dataListItem as any).querySelector('igx-checkbox');
                expect(dataListItemCheckbox.classList.contains('igx-checkbox--checked')).toBe(false);
            }

            // Click 'Select All' checkbox.
            selectAllCbInput = visibleListItems[0].querySelector('.igx-checkbox__input');
            selectAllCbInput.click();
            fix.detectChanges();

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                const dataListItemCheckbox = (dataListItem as any).querySelector('igx-checkbox');
                expect(dataListItemCheckbox.classList.contains('igx-checkbox--checked')).toBe(true);
            }
        }));

        it('Should correctly update all \'SelectAll\' checkbox when not a single item is checked.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            tick(100);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const visibleListItems = GridFunctions.sortNativeElementsVertically(
                Array.from(searchComponent.querySelectorAll('igx-list-item')));
            expect(searchComponent.querySelectorAll('.igx-checkbox').length).toBe(4);

            // Verify 'Select All' checkbox is checked.
            let selectAllCheckbox = visibleListItems[0].querySelector('igx-checkbox');
            expect(selectAllCheckbox.classList.contains('igx-checkbox--checked')).toBe(true);

            // Uncheck second, third and fourth list items.
            const secondListItemCbInput = visibleListItems[1].querySelector('.igx-checkbox__input');
            const thirdListItemCbInput = visibleListItems[2].querySelector('.igx-checkbox__input');
            const fourthListItemCbInput = visibleListItems[3].querySelector('.igx-checkbox__input');
            secondListItemCbInput.click();
            fix.detectChanges();
            thirdListItemCbInput.click();
            fix.detectChanges();
            fourthListItemCbInput.click();
            fix.detectChanges();

            // Verify 'Select All' checkbox is unchecked.
            selectAllCheckbox = visibleListItems[0].querySelector('igx-checkbox');
            expect(selectAllCheckbox.classList.contains('igx-checkbox--checked')).toBe(false);
        }));

        it('Should open custom filter dropdown when pressing \'Enter\' on custom filter cascade button.', (async () => {
            grid.width = '700px';
            await wait(16);
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await wait(100);
            fix.detectChanges();

            const excelMenuParent = grid.nativeElement.querySelector('igx-grid-excel-style-filtering');
            const cascadeButton = excelMenuParent.querySelector('.igx-excel-filter__actions-filter');

            // Verify that custom filter dropdown (the submenu) is not visible.
            let subMenu = excelMenuParent.querySelector('.igx-drop-down__list.igx-toggle--hidden');
            expect(subMenu).not.toBeNull();

            cascadeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await wait(16);
            fix.detectChanges();

            // Verify that custom filter dropdown (the submenu) is visible.
            subMenu = excelMenuParent.querySelector('.igx-drop-down__list.igx-toggle--hidden');
            expect(subMenu).toBeNull();
        }));

        it('Should close ESF when pressing \'Escape\'.', fakeAsync(() => {
            // Verify ESF is not visible.
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            tick(100);
            fix.detectChanges();

            // Verify ESF is visible.
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();

            excelMenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            tick(100);
            fix.detectChanges();

            // Verify ESF is not visible.
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();
        }));

        it('Should clear filter when pressing \'Enter\' on the clear filter button in ESF.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);
            fix.detectChanges();

            // Add filter condition through ESF custom filter dialog.
            const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[0];
            const inputs = GridFunctions.sortNativeElementsHorizontally(Array.from(expr.querySelectorAll('input')));
            const filterValueInput = inputs[1];
            sendInputNativeElement(filterValueInput, 'ign', fix);

            // Apply filtering from custom dialog.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
            tick(200);
            fix.detectChanges();

            // Verify filter results.
            expect(grid.filteredData.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();

            // Press 'Enter' on the 'Clear Filter' button.
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const clearFilterContainer = excelMenu.querySelector('.igx-excel-filter__actions-clear');
            clearFilterContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick(100);
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
        }));
    });

    describe(null, () => {
        let fix, grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringESFTemplatesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should use custom templates for ESF components instead of default ones.', fakeAsync(() => {
            const filterableColumns = grid.columns.filter((c) => c.filterable === true);
            for (const column of filterableColumns) {
                // Open ESF.
                GridFunctions.clickExcelFilterIcon(fix, column.field);
                tick(100);
                fix.detectChanges();

                const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
                // Verify custom sorting template is used.
                expect(excelMenu.querySelector('.esf-custom-sorting')).not.toBeNull();
                expect(GridFunctions.getExcelFilteringSortComponent(fix)).toBeNull();

                // Verify custom hiding template is used.
                expect(excelMenu.querySelector('.esf-custom-hiding')).not.toBeNull();
                expect(GridFunctions.getExcelFilteringHideContainer(fix)).toBeNull();

                // Verify custom moving template is used.
                expect(excelMenu.querySelector('.esf-custom-moving')).not.toBeNull();
                expect(GridFunctions.getExcelFilteringMoveComponent(fix)).toBeNull();

                // Verify custom pinning template is used.
                expect(excelMenu.querySelector('.esf-custom-pinning')).not.toBeNull();
                expect(GridFunctions.getExcelFilteringPinContainer(fix)).toBeNull();
                expect(GridFunctions.getExcelFilteringUnpinContainer(fix)).toBeNull();

                // Close ESF.
                GridFunctions.clickCancelExcelStyleFiltering(fix);
                tick(100);
                fix.detectChanges();
            }
        }));
    });

    describe(null, () => {
        let fix, grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxTestExcelFilteringDatePickerComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should use dropdown mode for the datePicker.', fakeAsync(() => {
            const dateExpression = fix.debugElement.query(By.css('igx-excel-style-date-expression'));
            const datePicker = dateExpression.query(By.css('igx-date-picker'));
            expect(datePicker.componentInstance.mode).toBe('dropdown');
            // templateDropDownTarget is no longer available
            // expect(datePicker.componentInstance.templateDropDownTarget).toBeTruthy();
        }));
    });
});

const expectedResults = [];

function sendInput(element, text, fix) {
    element.nativeElement.value = text;
    element.nativeElement.dispatchEvent(new Event('keydown'));
    element.nativeElement.dispatchEvent(new Event('input'));
    element.nativeElement.dispatchEvent(new Event('keyup'));
    fix.detectChanges();
}

function sendInputNativeElement(nativeElement, text, fix) {
    nativeElement.value = text;
    nativeElement.dispatchEvent(new Event('keydown'));
    nativeElement.dispatchEvent(new Event('input'));
    nativeElement.dispatchEvent(new Event('keyup'));
    fix.detectChanges();
}

function verifyFilterUIPosition(filterUIContainer, grid) {
    const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
        filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
    expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
}

function isExcelSearchScrollBarVisible(fix) {
    const searchScrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
    return searchScrollbar.offsetHeight < searchScrollbar.children[0].offsetHeight;
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
    }

    if (dateItem0.isNextYear) {
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

function verifyExcelStyleFilteringDisplayDensity(gridNativeElement: HTMLElement, expectedDisplayDensity: DisplayDensity) {
    // Get excel style dialog
    const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');

    // Verify display density of search input and list.
    const excelSearch = excelMenu.querySelector('igx-excel-style-search');
    const inputGroup = excelSearch.querySelector('igx-input-group');
    const list = excelSearch.querySelector('igx-list');
    expect(inputGroup.classList.contains(getInputGroupDensityClass(expectedDisplayDensity))).toBe(true,
        'incorrect inputGroup density');
    expect(list.classList.contains(getListDensityClass(expectedDisplayDensity))).toBe(true,
        'incorrect list density');

    // Verify display density of all flat and raised buttons in excel stlye dialog.
    const flatButtons = excelMenu.querySelectorAll('.igx-button--flat');
    const raisedButtons = excelMenu.querySelectorAll('.igx-button--raised');
    const buttons = Array.from(flatButtons).concat(Array.from(raisedButtons));
    buttons.forEach((button) => {
        if (expectedDisplayDensity === DisplayDensity.comfortable) {
            // If expected display density is comfortable, then button should not have 'compact' and 'cosy' classes.
            expect(button.classList.contains(getButtonDensityClass(DisplayDensity.compact))).toBe(false,
                'incorrect button density');
            expect(button.classList.contains(getButtonDensityClass(DisplayDensity.cosy))).toBe(false,
                'incorrect button density');
        } else {
            expect(button.classList.contains(getButtonDensityClass(expectedDisplayDensity))).toBe(true,
                'incorrect button density');
        }
    });

    // Verify column pinning and column hiding elements in header area and actions area
    // are shown based on the expected display density.
    verifyPinningHidingDisplayDensity(gridNativeElement, expectedDisplayDensity);
    // Verify column sorting and column moving buttons are positioned either on right of their
    // respective header or under it, based on the expected display density.
    verifySortMoveDisplayDensity(gridNativeElement, expectedDisplayDensity);
}

function verifyPinningHidingDisplayDensity(gridNativeElement: HTMLElement, expectedDisplayDensity: DisplayDensity) {
    // Get excel style dialog
    const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');

    // Get column pinning and column hiding icons from header (if present at all)
    const headerArea = excelMenu.querySelector('.igx-excel-filter__menu-header');
    const headerTitle = excelMenu.querySelector('h4');
    const headerIcons = Array.from(headerArea.querySelectorAll('.igx-button--icon'));
    const headerAreaPinIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="pin"') !== -1);
    const headerAreaUnpinIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="unpin"') !== -1);
    const headerAreaColumnHidingIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerText === 'visibility_off');

    // Get column pinning and column hiding icons from actionsArea (if present at all)
    const actionsArea = excelMenu.querySelector('.igx-excel-filter__actions');
    const actionsAreaPinIcon = actionsArea.querySelector('.igx-excel-filter__actions-pin');
    const actionsAreaUnpinIcon = actionsArea.querySelector('.igx-excel-filter__actions-unpin');
    const actionsAreaColumnHidingIcon = actionsArea.querySelector('.igx-excel-filter__actions-hide');

    if (expectedDisplayDensity === DisplayDensity.comfortable) {
        // Verify icons in header are not present.
        expect(headerAreaPinIcon === null || headerAreaPinIcon === undefined).toBe(true,
            'headerArea pin icon is present');
        expect(headerAreaUnpinIcon === null || headerAreaUnpinIcon === undefined).toBe(true,
            'headerArea unpin icon is present');
        expect(headerAreaColumnHidingIcon === null || headerAreaColumnHidingIcon === undefined).toBe(true,
            'headerArea column hiding icon is present');
        // Verify icons in actions area are present.
        expect((actionsAreaPinIcon !== null) || (actionsAreaUnpinIcon !== null)).toBe(true,
            'actionsArea pin/unpin icon is  NOT present');
        expect(actionsAreaColumnHidingIcon).not.toBeNull('actionsArea column hiding icon is  NOT present');
    } else {
        // Verify icons in header are present.
        expect((headerAreaPinIcon !== null) || (headerAreaUnpinIcon !== null)).toBe(true,
            'headerArea pin/unpin icon is  NOT present');
        expect(headerAreaColumnHidingIcon).not.toBeNull('headerArea column hiding icon is  NOT present');
        // Verify icons in actions area are not present.
        expect(actionsAreaPinIcon).toBeNull('actionsArea pin icon is present');
        expect(actionsAreaUnpinIcon).toBeNull('actionsArea unpin icon is present');
        expect(actionsAreaColumnHidingIcon).toBeNull('headerArea column hiding icon is present');
        // Verify icons are on right of the title
        const headerTitleRect = headerTitle.getBoundingClientRect();
        const pinUnpinIconRect = ((headerAreaPinIcon !== null) ? headerAreaPinIcon : headerAreaUnpinIcon).getBoundingClientRect();
        const columnHidingRect = headerAreaColumnHidingIcon.getBoundingClientRect();

        expect(pinUnpinIconRect.left >= headerTitleRect.right).toBe(true,
            'pinUnpin icon is NOT on the right of top header');
        expect(columnHidingRect.left > headerTitleRect.right).toBe(true,
            'columnHiding icon is NOT on the right of top header');
    }
}

function verifySortMoveDisplayDensity(gridNativeElement: HTMLElement, expectedDisplayDensity: DisplayDensity) {
    // Get excel style dialog.
    const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');

    // Get container of sort component and its header and buttons.
    const sortContainer = excelMenu.querySelector('.igx-excel-filter__sort');
    const sortHeaderRect = sortContainer.querySelector('header').getBoundingClientRect();
    const sortButtons = sortContainer.querySelectorAll('.igx-button--flat');

    // Get container of move component and its header and buttons.
    const moveContainer = excelMenu.querySelector('.igx-excel-filter__move');
    const moveHeaderRect = moveContainer.querySelector('header').getBoundingClientRect();
    const moveButtons = moveContainer.querySelectorAll('.igx-button--flat');

    const isCompact = expectedDisplayDensity === DisplayDensity.compact;
    // Verify sort buttons are on right of the sort title if density is 'compact'
    // or that they are under the sort title if density is not 'compact'.
    expect(sortHeaderRect.right <= sortButtons[0].getBoundingClientRect().left).toBe(isCompact,
        'incorrect sort button horizontal position based on the sort title');
    expect(sortHeaderRect.right <= sortButtons[1].getBoundingClientRect().left).toBe(isCompact,
        'incorrect sort button horizontal position based on the sort title');
    expect(sortHeaderRect.bottom <= sortButtons[0].getBoundingClientRect().top).toBe(!isCompact,
        'incorrect sort button vertical position based on the sort title');
    expect(sortHeaderRect.bottom <= sortButtons[1].getBoundingClientRect().top).toBe(!isCompact,
        'incorrect sort button vertical position based on the sort title');
    // Verify move buttons are on right of the move title if density is 'compact'
    // or that they are under the sort title if density is not 'compact'.
    expect(moveHeaderRect.right < moveButtons[0].getBoundingClientRect().left).toBe(isCompact,
        'incorrect move button horizontal position based on the sort title');
    expect(moveHeaderRect.right < moveButtons[1].getBoundingClientRect().left).toBe(isCompact,
        'incorrect move button horizontal position based on the sort title');
    expect(moveHeaderRect.bottom <= moveButtons[0].getBoundingClientRect().top).toBe(!isCompact,
        'incorrect move button vertical position based on the sort title');
    expect(moveHeaderRect.bottom <= moveButtons[1].getBoundingClientRect().top).toBe(!isCompact,
        'incorrect move button vertical position based on the sort title');
}

function verifyExcelCustomFilterDisplayDensity(gridNativeElement: HTMLElement, expectedDisplayDensity: DisplayDensity) {
    // Excel style filtering custom filter dialog
    const customFilterMenu = gridNativeElement.querySelector('.igx-excel-filter__secondary');

    // Verify display density of all flat and raised buttons in custom filter dialog.
    const flatButtons = customFilterMenu.querySelectorAll('.igx-button--flat');
    const raisedButtons = customFilterMenu.querySelectorAll('.igx-button--raised');
    const buttons = Array.from(flatButtons).concat(Array.from(raisedButtons));
    buttons.forEach((button) => {
        if (expectedDisplayDensity === DisplayDensity.comfortable) {
            // If expected display density is comfortable, then button should not have 'compact' and 'cosy' classes.
            expect(button.classList.contains(getButtonDensityClass(DisplayDensity.compact))).toBe(false,
                'incorrect button density in custom filter dialog');
            expect(button.classList.contains(getButtonDensityClass(DisplayDensity.cosy))).toBe(false,
                'incorrect button density in custom filter dialog');
        } else {
            expect(button.classList.contains(getButtonDensityClass(expectedDisplayDensity))).toBe(true,
                'incorrect button density in custom filter dialog');
        }
    });

    // Verify display density of all input groups in custom filter dialog.
    const inputGroups = customFilterMenu.querySelectorAll('igx-input-group');
    inputGroups.forEach((inputGroup) => {
        expect(inputGroup.classList.contains(getInputGroupDensityClass(expectedDisplayDensity))).toBe(true,
            'incorrect inputGroup density in custom filter dialog');
    });
}

function getListDensityClass(displayDensity: DisplayDensity) {
    let densityClass;
    switch (displayDensity) {
        case DisplayDensity.compact: densityClass = 'igx-list--compact'; break;
        case DisplayDensity.cosy: densityClass = 'igx-list--cosy'; break;
        default: densityClass = 'igx-list'; break;
    }
    return densityClass;
}

function getInputGroupDensityClass(displayDensity: DisplayDensity) {
    let densityClass;
    switch (displayDensity) {
        case DisplayDensity.compact: densityClass = 'igx-input-group--compact'; break;
        case DisplayDensity.cosy: densityClass = 'igx-input-group--cosy'; break;
        default: densityClass = 'igx-input-group--comfortable'; break;
    }
    return densityClass;
}

/**
 * Gets the corresponding class that a flat/raised/outlined button
 * has added to it additionally based on displayDensity input.
*/
function getButtonDensityClass(displayDensity: DisplayDensity) {
    let densityClass;
    switch (displayDensity) {
        case DisplayDensity.compact: densityClass = 'igx-button--compact'; break;
        case DisplayDensity.cosy: densityClass = 'igx-button--cosy'; break;
        default: densityClass = ''; break;
    }
    return densityClass;
}

function verifyFilteringExpression(operand: IFilteringExpression, fieldName: string, conditionName: string, searchVal: any) {
    expect(operand.fieldName).toBe(fieldName);
    expect(operand.condition.name).toBe(conditionName);
    expect(operand.searchVal).toEqual(searchVal);
}

function verifyExcelStyleFilterAvailableOptions(grid, labels: string[], checked: boolean[]) {
    const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
    const labelElements: any[] = Array.from(excelMenu.querySelectorAll('.igx-checkbox__label'));
    const checkboxElements: any[] = Array.from(excelMenu.querySelectorAll('.igx-checkbox__input'));

    expect(labelElements.map(c => c.innerText)).toEqual(labels);
    expect(checkboxElements.map(c => c.indeterminate ? null : c.checked)).toEqual(checked);
}

function openExcelMenu(fix, columnIndex: number) {
    const headers: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
    const headerResArea = headers[columnIndex].children[0].nativeElement;

    let filterIcon = headerResArea.querySelector('.igx-excel-filter__icon');
    if (!filterIcon) {
        filterIcon = headerResArea.querySelector('.igx-excel-filter__icon--filtered');
    }
    filterIcon.click();
    tick();
    fix.detectChanges();
}

function toggleExcelStyleFilteringItems(fix, grid, shouldApply: boolean, ...itemIndices: number[]) {
    const excelMenu = grid.nativeElement.querySelector('.igx-excel-filter__menu');
    const checkbox = excelMenu.querySelectorAll('.igx-checkbox__input');

    for (const index of itemIndices) {
        checkbox[index].click();
    }
    tick();
    fix.detectChanges();

    if (shouldApply) {
        const applyButton = excelMenu.querySelector('.igx-button--raised');
        applyButton.click();
        tick();
        fix.detectChanges();
    }
}

/**
 * Verfiy multiple condition chips on their respective indices (asc order left to right)
 * are whether fully visible or not.
*/
function verifyMultipleChipsVisibility(fix, expectedVisibilities: boolean[]) {
    for (let index = 0; index < expectedVisibilities.length; index++) {
        verifyChipVisibility(fix, index, expectedVisibilities[index]);
    }
}

/**
 * Verfiy that the condition chip on the respective index (asc order left to right)
 * is whether fully visible or not.
*/
function verifyChipVisibility(fix, index: number, shouldBeFullyVisible: boolean) {
    const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
    const visibleChipArea = filteringRow.query(By.css('.igx-grid__filtering-row-main'));
    const visibleChipAreaRect = visibleChipArea.nativeElement.getBoundingClientRect();

    const chip = GridFunctions.getFilterConditionChip(fix, index);
    const chipRect = chip.getBoundingClientRect();

    expect(chipRect.left >= visibleChipAreaRect.left && chipRect.right <= visibleChipAreaRect.right)
        .toBe(shouldBeFullyVisible, 'chip[' + index + '] visibility is incorrect');
}
