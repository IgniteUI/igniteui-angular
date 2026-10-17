import { DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective, IgxInputGroupComponent } from 'igniteui-angular/input-group';
import { INPUT_DEBOUNCE_TIME } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, wait } from '../../../test-utils/ui-interactions.spec';
import { IgxGridFilteringCellComponent } from 'igniteui-angular/grids/core';
import { IgxGridHeaderComponent } from 'igniteui-angular/grids/core';
import { IgxExcelStyleSearchComponent, IgxGridFilteringRowComponent } from 'igniteui-angular/grids/core';
import { GridFunctions, GridSelectionFunctions } from '../../../test-utils/grid-functions.spec';
import { IgxGridHeaderGroupComponent } from 'igniteui-angular/grids/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeBg from '@angular/common/locales/bg';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent,
    IgxGridFilteringScrollComponent,
    IgxGridFilteringMCHComponent,
    IgxGridFilteringTemplateComponent,
    IgxGridFilteringESFEmptyTemplatesComponent,
    IgxGridFilteringESFTemplatesComponent,
    IgxGridFilteringESFLoadOnDemandComponent,
    IgxGridFilteringESFRemoteChunkComponent,
    CustomFilteringStrategyComponent,
    IgxGridExternalESFComponent,
    IgxGridExternalESFTemplateComponent,
    IgxGridDatesFilteringComponent,
    LoadOnDemandFilterStrategy,
    IgxGridFilteringNumericComponent,
    IgxGridConditionalFilteringComponent
} from '../../../test-utils/grid-samples.spec';
import { GridSelectionMode, FilterMode } from 'igniteui-angular/grids/core';
import { ControlsFunction } from '../../../test-utils/controls-functions.spec';
import { setElementSize } from '../../../test-utils/helper-utils.spec';
import { DefaultSortingStrategy, FilteringExpressionsTree, FilteringLogic, FilteringStrategy, FormattedValuesFilteringStrategy, getComponentSize, GridResourceStringsEN, IFilteringExpression, IFilteringExpressionsTree, IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, changei18n, IgxNumberFilteringOperand, IgxOverlayService, IgxStringFilteringOperand, IgxTimeFilteringOperand, ɵSize, SortingDirection } from 'igniteui-angular/core';
import { firstValueFrom } from 'rxjs';
import { IgxDateTimeEditorDirective } from 'igniteui-angular/directives';
import { IgxTimePickerComponent } from 'igniteui-angular/time-picker';
import { IgxChipComponent, IgxBadgeComponent, IgxDatePickerComponent, IgxCalendarComponent, IgxIconComponent } from 'igniteui-angular';
import { HelperTestFunctions } from '../../../test-utils/calendar-helper-utils';
import { IgxDropDownComponent } from 'igniteui-angular/drop-down';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

const DEBOUNCE_TIME = 30;
const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CELL = 'igx-grid-filtering-cell';
const GRID_RESIZE_CLASS = '.igx-grid-th__resize-line';

describe('IgxGrid - Filtering Row UI actions #grid', () => {

    registerLocaleData(localeDe);
    registerLocaleData(localeFr);
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridFilteringComponent,
                IgxGridFilteringScrollComponent,
                IgxGridFilteringMCHComponent,
                IgxGridFilteringTemplateComponent,
                IgxGridDatesFilteringComponent,
                IgxGridFilteringNumericComponent
            ]
        }).compileComponents();
    });

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        const today = SampleTestData.today;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                providers: [{ provide: INPUT_DEBOUNCE_TIME, useValue: 0 }]
            });
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        // UI tests string column, empty input
        it('UI tests on string column changing conditions', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));

            expect(grid.rowList.length).toEqual(8);

            // iterate over not unary conditions when input is empty
            // starts with
            await GridFunctions.openFilterDDAndSelectCondition(fix, 2);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // does not contain
            await GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // iterate over unary conditions
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);

            await GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);
        });

        // UI tests string column with value in input
        it('UI tests on string column', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            expect(grid.rowList.length).toEqual(8);

            // iterate over not unary conditions and fill the input
            // starts with
            await GridFunctions.openFilterDDAndSelectCondition(fix, 2);
            GridFunctions.typeValueInFilterRowInput('Net', fix, input);
            await fix.whenStable();
            fix.detectChanges();


            let operands =
                (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                    .filteringOperands as IFilteringExpression[];
            verifyFilteringExpression(operands[0], 'ProductName', 'startsWith', 'Net');
            verifyFilterUIPosition(filterUIRow, grid);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);

            // ends with
            await GridFunctions.openFilterDDAndSelectCondition(fix, 3);
            GridFunctions.typeValueInFilterRowInput('script', fix, input);
            await fix.whenStable();
            fix.detectChanges();

            operands =
                (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                    .filteringOperands as IFilteringExpression[];
            verifyFilteringExpression(operands[0], 'ProductName', 'endsWith', 'script');
            expect(grid.rowList.length).toEqual(2);
            verifyFilterRowUI(input, close, reset, false);

            // does not contain
            await GridFunctions.openFilterDDAndSelectCondition(fix, 1);
            GridFunctions.typeValueInFilterRowInput('script', fix, input);
            await fix.whenStable();
            fix.detectChanges();

            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(6);
        });

        // UI tests number column
        it('UI tests on number column changing conditions', async () => {
            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            let input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // does not equal
            await GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // greater than
            await GridFunctions.openFilterDDAndSelectCondition(fix, 2);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // iterate over unary conditions
            // empty
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            expect(grid.rowList.length).toEqual(1);
            verifyFilterRowUI(input, close, reset, false);

            // not empty
            await GridFunctions.openFilterDDAndSelectCondition(fix, 7);

            expect(grid.rowList.length).toEqual(7);
            verifyFilterRowUI(input, close, reset, false);

            // changing from unary to not unary condition when input is empty - filtering should keep its state
            // open dropdown
            await GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            input = filterUIRow.query(By.directive(IgxInputDirective));
            expect(grid.rowList.length).toEqual(7);
            verifyFilterRowUI(input, close, reset, false);
        });

        it('UI tests on number column', async () => {
            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            // iterate over not unary conditions and fill the input
            // does not equal
            await GridFunctions.openFilterDDAndSelectCondition(fix, 1);
            GridFunctions.typeValueInFilterRowInput(100, fix, input);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(7);
            verifyFilterRowUI(input, close, reset, false);

            // less than
            await GridFunctions.openFilterDDAndSelectCondition(fix, 3);
            expect(grid.rowList.length).toEqual(3);
            verifyFilterRowUI(input, close, reset, false);

            // greater than or equal to
            await GridFunctions.openFilterDDAndSelectCondition(fix, 4);
            GridFunctions.typeValueInFilterRowInput(254, fix, input);
            await fix.whenStable();
            fix.detectChanges();


            expect(grid.rowList.length).toEqual(3);
            verifyFilterRowUI(input, close, reset, false);
        });

        // UI tests boolean column
        it('UI tests on boolean column', async () => {
            GridFunctions.clickFilterCellChip(fix, 'Released');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            await fix.whenStable();

            expect(grid.rowList.length).toEqual(8);

            verifyFilterUIPosition(filterUIRow, grid);

            // false condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 2);

            expect(grid.rowList.length).toEqual(2);
            verifyFilterRowUI(input, close, reset, false);

            // true condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(grid.rowList.length).toEqual(3);
            verifyFilterRowUI(input, close, reset, false);

            // (all) condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset, false);

            // not null condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            expect(grid.rowList.length).toEqual(6);
            verifyFilterRowUI(input, close, reset, false);
        });

        it('UI tests on boolean column open dropdown', async () => {
            GridFunctions.clickFilterCellChip(fix, 'Released');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const prefix = GridFunctions.getFilterRowPrefix(fix);

            input.triggerEventHandler('click', null);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            UIInteractions.triggerEventHandlerKeyDown(' ', prefix);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);

            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            UIInteractions.triggerEventHandlerKeyDown('Tab', prefix);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);

            UIInteractions.triggerEventHandlerKeyDown(' ', input);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);
        });

        // UI tests date column
        it('UI - should correctly filter date column', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const expectedResults = GridFunctions.createDateFilterConditions(grid, today);

            // Today condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 4);

            expect(grid.rowList.length).toEqual(1);
            verifyFilterRowUI(input, close, reset, false);
            verifyFilterUIPosition(filterUIRow, grid);

            expect(grid.rowList.length).toEqual(1);

            // This Month condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[5]);

            // Last Month condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 7);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[0]);

            // Empty condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 12);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(2);
        });

        it('UI - should correctly filter date column by \'equals\' filtering conditions', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            // Select the 'Equals' condition.
            await GridFunctions.openFilterDDAndSelectCondition(fix, 0);
            expect(grid.filteringRow.expression.condition.name).toBe('equals');

            // Open the date picker and pick today's date from the calendar.
            const calendar = await openFilterRowDatePicker(fix);
            const currentDay = calendar.querySelector('.igx-day-item--current');
            expect(currentDay).not.toBeNull();
            UIInteractions.simulateClickAndSelectEvent(currentDay.firstChild);
            await fix.whenStable();
            fix.detectChanges();

            // Only the record released today matches.
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'ID').value).toBe(8);
            const expr = (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                .filteringOperands[0] as IFilteringExpression;
            expect(expr.condition.name).toBe('equals');
            expect((expr.searchVal as Date).toDateString()).toBe(today.toDateString());

            // The new condition is shown as a chip in the filter row.
            const chips = fix.debugElement.query(By.css(FILTER_UI_ROW)).queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toBe(1);
        });

        it('Should correctly select month from month view datepicker/calendar component', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const calendar = await openFilterRowDatePicker(fix);
            const calendarCmp = fix.debugElement.query(By.directive(IgxCalendarComponent)).componentInstance as IgxCalendarComponent;
            expect(calendarCmp.activeView).toBe('month');

            // Open the months view from the month label in the calendar header.
            const monthPicker = calendar.querySelectorAll('.igx-calendar-picker__date')[0];
            monthPicker.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();
            expect(calendarCmp.activeView).toBe('year');

            const months = calendar.querySelectorAll('igx-months-view .igx-calendar-view-item');
            expect(months.length).toBe(12);
            // Pick a month different from the current one.
            const monthIndex = today.getMonth() === 0 ? 1 : 0;
            const monthText = (months[monthIndex] as HTMLElement).textContent.trim();
            months[monthIndex].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();

            // The calendar goes back to the days view, showing the selected month.
            expect(calendarCmp.activeView).toBe('month');
            expect(calendarCmp.viewDate.getMonth()).toBe(monthIndex);
            expect(calendarCmp.viewDate.getFullYear()).toBe(today.getFullYear());
            const monthLabel = calendar.querySelectorAll('.igx-calendar-picker__date')[0];
            expect(monthLabel.textContent.trim()).toEqual(monthText);
            // Navigating the calendar does not filter the grid.
            expect(grid.rowList.length).toEqual(8);
        });

        it('Should correctly select year from year view datepicker/calendar component', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const calendar = await openFilterRowDatePicker(fix);
            const calendarCmp = fix.debugElement.query(By.directive(IgxCalendarComponent)).componentInstance as IgxCalendarComponent;

            // Open the years view from the year label in the calendar header.
            const yearPicker = calendar.querySelectorAll('.igx-calendar-picker__date')[1];
            expect(yearPicker.textContent.trim()).toEqual(today.getFullYear().toString());
            yearPicker.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();
            expect(calendarCmp.activeView).toBe('decade');

            const years = calendar.querySelectorAll('igx-years-view .igx-calendar-view-item');
            expect(years.length).toBeGreaterThan(1);
            // Pick a year different from the current one.
            const firstYear = years[0].textContent.trim() === today.getFullYear().toString() ? years[1] : years[0];
            const expectedYear = firstYear.textContent.trim();
            firstYear.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();

            // The calendar switches to the months view of the selected year.
            expect(calendarCmp.activeView).toBe('year');
            expect(calendarCmp.viewDate.getFullYear().toString()).toBe(expectedYear);
            const yearLabel = calendar.querySelector('.igx-calendar-picker__date');
            expect(yearLabel.textContent.trim()).toEqual(expectedYear);
            // Navigating the calendar does not filter the grid.
            expect(grid.rowList.length).toEqual(8);
        });

        it('Time/DateTime: Should set editorOptions.dateTimeFormat as inputFormat to the quick filter editor', async () => {
            const releaseDateTimeCol = grid.getColumnByName('ReleaseDateTime');
            const releaseTimeCol = grid.getColumnByName('ReleaseTime');
            releaseDateTimeCol.editorOptions = {
                dateTimeFormat: 'dd-MM-yyyy'
            };
            releaseDateTimeCol.pipeArgs = {
                format: 'yyyy-dd-MM'
            };

            releaseTimeCol.editorOptions = {
                dateTimeFormat: 'hh:mm'
            };
            releaseTimeCol.pipeArgs = {
                format: 'longTime'
            };
            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDateTime');

            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            let inputDirectiveInstance = filterUIRow.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(inputDirectiveInstance.inputFormat).toMatch('dd-MM-yyyy');
            expect(inputDirectiveInstance.displayFormat).toMatch('yyyy-dd-MM');

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseTime');
            await fix.whenStable();
            fix.detectChanges();

            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            inputDirectiveInstance = filterUIRow.query(By.directive(IgxTimePickerComponent)).componentInstance;
            expect(inputDirectiveInstance.inputFormat).toMatch('hh:mm');
            expect(inputDirectiveInstance.displayFormat).toMatch('longTime');
        });

        it('Time/DateTime: Should set pipeArgs.format as inputFormat to the quick filter editor if numeric and editorOptions.dateTimeFormat not set', async () => {
            const releaseDateTimeCol = grid.getColumnByName('ReleaseDateTime');
            const releaseTimeCol = grid.getColumnByName('ReleaseTime');

            releaseDateTimeCol.pipeArgs = {
                format: 'yyyy--dd--MM'
            };

            releaseTimeCol.pipeArgs = {
                format: 'shortTime'
            };
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();

            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            let dateTimeEditor = filterUIRow.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat).toMatch('yyyy--dd--MM');
            expect(dateTimeEditor.displayFormat).toMatch('yyyy--dd--MM');

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseTime');
            await fix.whenStable();
            fix.detectChanges();

            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            dateTimeEditor = filterUIRow.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            // since 'shortTime' is numeric, input format will include its numeric parts
            expect(dateTimeEditor.inputFormat.normalize('NFKC')).toMatch('hh:mm tt');
            expect(dateTimeEditor.displayFormat).toMatch('shortTime');
        });


        // UI tests custom column
        it('UI tests on custom column', async () => {
            GridFunctions.clickFilterCellChip(fix, 'AnotherField');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            GridFunctions.typeValueInFilterRowInput('a', fix, input);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'AnotherField').value).toMatch('custom');
            verifyFilterRowUI(input, close, reset, false);
        });

        it('Removing second condition removes the And/Or button', async () => {
            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'g',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains'
            };
            const expression1 = {
                fieldName: 'ProductName',
                searchVal: 'I',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains'
            };
            filteringExpressionsTree.filteringOperands.push(expression);
            filteringExpressionsTree.filteringOperands.push(expression1);
            grid.filter('ProductName', null, filteringExpressionsTree);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            verifyFilterUIPosition(filterUIRow, grid);

            expect(grid.rowList.length).toEqual(2);
            let andButton = fix.debugElement.queryAll(By.css('#operand'));
            expect(andButton.length).toEqual(1);

            // remove the second chip
            const secondChip = filterUIRow.queryAll(By.css('igx-chip'))[1];
            ControlsFunction.clickChipRemoveButton(secondChip.nativeElement);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(3);
            andButton = fix.debugElement.queryAll(By.css('#operand'));
            expect(andButton.length).toEqual(0);
        });

        it('When filter column with value 0 and dataType number, filtering chip should be applied', async () => {
            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            GridFunctions.typeValueInFilterRowInput(0, fix);

            GridFunctions.closeFilterRow(fix);

            const gridheaders = fix.debugElement.queryAll(By.css('igx-grid-header'));
            const headerOfTypeNumber = gridheaders.find(gh => gh.nativeElement.classList.contains('igx-grid-th--number'));
            const filterCellsForTypeNumber = headerOfTypeNumber.parent.query(By.css(FILTER_UI_CELL));
            expect(filterCellsForTypeNumber.queryAll(By.css('.igx-filtering-chips')).length).toBe(1);
        });

        it('Should correctly create FilteringExpressionsTree and populate filterUI.', async () => {
            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'Ignite',
                condition: IgxStringFilteringOperand.instance().condition('startsWith'),
                conditionName: 'startsWith'
            };

            filteringExpressionsTree.filteringOperands.push(expression);
            grid.filteringExpressionsTree = filteringExpressionsTree;

            fix.detectChanges();

            expect(grid.rowList.length).toEqual(2);

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            GridFunctions.openFilterDD(fix.debugElement);
            fix.detectChanges();

            const filterUIContainer = fix.debugElement.queryAll(By.css(FILTER_UI_ROW))[0];
            const input = filterUIContainer.query(By.directive(IgxInputDirective));

            expect(ControlsFunction.getDropDownSelectedItem(filterUIContainer).nativeElement.textContent).toMatch('Starts With');
            expect(input.nativeElement.value).toMatch('Ignite');
        });

        it('Should complete the filter when clicking the commit icon', async () => {
            const filterValue = 'an';
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            GridFunctions.typeValueInFilterRowInput(filterValue, fix);
            await fix.whenStable();
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            // Click the commit icon (the filtering row is OnPush, so its view is refreshed by the click handler)
            const commitIcon = filterUIRow.query(By.css('igx-suffix igx-icon[name="confirm"]'));
            expect(commitIcon).toBeTruthy();
            commitIcon.nativeElement.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(filterChip.componentInstance.selected).toBeFalsy();
        });

        it('Should complete the filter when focusing out of the input', async () => {
            const filterValue = 'an';
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await fix.whenStable(); // onConditionsChanged rAF

            GridFunctions.typeValueInFilterRowInput(filterValue, fix);
            await fix.whenStable();
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            grid.nativeElement.focus();
            await fix.whenStable();
            fix.detectChanges();

            expect(filterChip.componentInstance.selected).toBeFalsy();
        });

        it('UI - should use dropdown mode for the date picker', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const datePicker = filterUIRow.query(By.css('igx-date-picker'));
            expect(datePicker.componentInstance.mode).toBe('dropdown');
        });

        it('Should not select all filter chips when switching columns', async () => {
            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'Ignite',
                condition: IgxStringFilteringOperand.instance().condition('startsWith'),
                conditionName: 'startsWith'
            };
            const expression1 = {
                fieldName: 'ProductName',
                searchVal: 'Angular',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains'
            };
            filteringExpressionsTree.filteringOperands.push(expression);
            filteringExpressionsTree.filteringOperands.push(expression1);
            grid.filter('ProductName', null, filteringExpressionsTree);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            const columnProductName = GridFunctions.getColumnHeader('ProductName', fix);
            columnProductName.triggerEventHandler('click', { stopPropagation: () => { } });
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const filterChips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            expect(filterChips.length).toEqual(2);
            expect(filterChips[0].componentInstance.selected).toBeFalsy();
            expect(filterChips[1].componentInstance.selected).toBeFalsy();
            expect(input.nativeElement.value).toMatch('');
        });

        it('should render Filter chip for filterable columns and render empty cell for a column when filterable is set to false', async () => {
            grid.width = '1500px';
            fix.detectChanges();

            const filteringCells = GridFunctions.getFilteringCells(fix);
            const filteringChips = GridFunctions.getFilteringChips(fix);
            expect(filteringCells.length).toBe(8);
            expect(filteringChips.length).toBe(7);

            let idCellChips = GridFunctions.getFilteringChipPerIndex(fix, 0);
            expect(idCellChips.length).toBe(0);

            grid.getColumnByName('ID').filterable = true;
            fix.detectChanges();
            // await fix.whenStable();

            idCellChips = GridFunctions.getFilteringChipPerIndex(fix, 0);
            expect(idCellChips.length).toBe(1);
        });

        it('should render correct input and dropdown in filter row for different column types', async () => {
            const columnsByType: [string, string][] = [
                ['ProductName', 'string'],
                ['Downloads', 'number'],
                ['ReleaseDate', 'date'],
                ['Released', 'bool'],
                ['ReleaseDateTime', 'dateTime'],
                ['ReleaseTime', 'time']
            ];

            for (const [field, type] of columnsByType) {
                // open the filter row for the column by clicking its filter cell chip
                GridFunctions.clickFilterCellChipUI(fix, field);
                await fix.whenStable();
                fix.detectChanges();

                expect(grid.filteringRow, `filter row is not opened for ${field}`).toBeDefined();
                expect(grid.filteringRow.column.field).toBe(field);
                await checkUIForType(type, fix);

                // close the filter row through its 'close' button
                GridFunctions.getFilterRowCloseButton(fix).nativeElement.click();
                await fix.whenStable();
                fix.detectChanges();
                expect(fix.debugElement.query(By.css(FILTER_UI_ROW)), `filter row is not closed for ${field}`).toBeNull();
            }
        });

        it('should apply  multiple conditions to grid immediately while the filter row is still open', async () => {
            const getRowChips = () => fix.debugElement.query(By.css(FILTER_UI_ROW)).queryAll(By.directive(IgxChipComponent));
            const resetAndClose = async () => {
                const buttons = fix.debugElement.query(By.css(FILTER_UI_ROW)).queryAll(By.css('button'));
                // 'Reset' button clears all conditions of the column
                buttons[buttons.length - 2].nativeElement.click();
                await fix.whenStable();
                fix.detectChanges();
                expect(grid.rowList.length).toEqual(8);
                expect(getRowChips().length).toBe(0);
                // 'Close' button
                buttons[buttons.length - 1].nativeElement.click();
                await fix.whenStable();
                fix.detectChanges();
                expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).toBeNull();
            };

            // string column
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            await fix.whenStable();

            await selectFilterRowCondition(fix, 'Starts With');
            await typeFilterRowValue(fix, 'I');
            expect(grid.rowList.length).toEqual(2);
            commitFilterRowInput(fix);
            await selectFilterRowCondition(fix, 'Ends With');
            await typeFilterRowValue(fix, 'r');
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'ProductName').value).toBe('Ignite UI for Angular');
            expect(getRowChips().length).toBe(2);
            await resetAndClose();

            // number column
            GridFunctions.clickFilterCellChipUI(fix, 'Downloads');
            await fix.whenStable();

            await selectFilterRowCondition(fix, 'Less Than');
            await typeFilterRowValue(fix, '100');
            // 20, 0 and null
            expect(grid.rowList.length).toEqual(3);
            commitFilterRowInput(fix);
            await selectFilterRowCondition(fix, 'Greater Than');
            await typeFilterRowValue(fix, '10');
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'Downloads').value).toBe(20);
            expect(getRowChips().length).toBe(2);
            await resetAndClose();

            // boolean column - unary conditions are applied as soon as they are selected
            GridFunctions.clickFilterCellChipUI(fix, 'Released');
            await fix.whenStable();

            await selectFilterRowCondition(fix, 'False');
            expect(grid.rowList.length).toEqual(2);
            expect(getRowChips().length).toBe(1);
            // selecting another condition while the chip is still selected (edited) changes its condition
            await selectFilterRowCondition(fix, 'Empty');
            // null, null and undefined
            expect(grid.rowList.length).toEqual(3);
            expect(getRowChips().length).toBe(1);
            await resetAndClose();

            // date column
            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDate');
            await fix.whenStable();

            await selectFilterRowCondition(fix, 'Today');
            expect(grid.rowList.length).toEqual(1);
            commitFilterRowInput(fix);
            await selectFilterRowCondition(fix, 'Null');
            // 'Today' AND 'Null'
            expect(grid.rowList.length).toEqual(0);
            expect(getRowChips().length).toBe(2);
            // the filter row is still open
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).not.toBeNull();
        });

        it('should render navigation arrows in the filtering row when chips don\'t fit.', async () => {
            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            for (let i = 0; i < 10; i++) {
                const expression = {
                    fieldName: 'ProductName',
                    searchVal: 'I',
                    condition: IgxStringFilteringOperand.instance().condition('startsWith'),
                    conditionName: 'startsWith'
                };
                filteringExpressionsTree.filteringOperands.push(expression);
            }
            grid.filter('ProductName', null, filteringExpressionsTree);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).not.toBe(null);
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).not.toBe(null);
        });

        it('should update UI when chip is removed from filter row.', async () => {
            grid.filter('ProductName', 'I', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(2);

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // remove from row
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            GridFunctions.removeFilterChipByIndex(0, filterUIRow);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(8);
        });

        it('should not render chip in header if condition that requires value is applied and then value is cleared in filter row.', async () => {
            grid.filter('ProductName', 'I', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            const clearButton = GridFunctions.getFilterRowInputClearIcon(fix);
            clearButton.triggerEventHandler('click', null);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.closeFilterRow(fix);
            await fix.whenStable();
            fix.detectChanges();

            // check no condition is applied
            expect(grid.rowList.length).toEqual(8);

            const filteringChips = GridFunctions.getFilteringChips(fix);
            expect(GridFunctions.getChipText(filteringChips[1])).toEqual('Filter');
        });

        it('should reset the filter chips area when changing grid width', async () => {
            grid.width = '300px';
            fix.detectChanges();
            await fix.whenStable();

            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression1 = {
                fieldName: 'ProductName',
                searchVal: 'Ignite',
                condition: IgxStringFilteringOperand.instance().condition('startsWith'),
                conditionName: 'startsWith'
            };

            const expression2 = {
                fieldName: 'ProductName',
                searchVal: 'test',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains'
            };

            filteringExpressionsTree.filteringOperands.push(expression1);
            filteringExpressionsTree.filteringOperands.push(expression2);
            grid.filter('ProductName', null, filteringExpressionsTree);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).not.toBeNull();
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).not.toBeNull();

            grid.width = '900px';
            fix.detectChanges();
            await fix.whenStable();

            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).toBeNull();
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).toBeNull();
        });

        it('Should correctly update filtering row rendered when changing current column by clicking on a header.', async () => {
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteringRow.column.field).toBe('ProductName');
            await checkUIForType('string', fix);

            const columnsByType: [string, string][] = [
                ['Downloads', 'number'],
                ['Released', 'bool'],
                ['ReleaseDate', 'date']
            ];
            for (const [field, type] of columnsByType) {
                // click on the column header while the filter row is opened
                GridFunctions.getColumnHeader(field, fix).nativeElement.click();
                await fix.whenStable();
                fix.detectChanges();

                // the filter row stays opened and switches to the clicked column
                expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).not.toBeNull();
                expect(grid.filteringRow.column.field).toBe(field);
                expect(document.activeElement).toBe(grid.theadRow.nativeElement);
                await checkUIForType(type, fix);
            }
        });

        it('Should correctly render read-only input when selecting read-only condition and should create a chip.', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            GridFunctions.openFilterDD(fix.debugElement);
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list-scroll'));
            const input = filteringRow.query(By.directive(IgxInputDirective));

            await GridFunctions.selectFilteringCondition('Empty', dropdownList);
            fix.detectChanges();

            const chips = filteringRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toEqual(1);
            expect(chips[0].componentInstance.selected).toBeTruthy();
            expect(GridFunctions.getChipText(chips[0])).toEqual('Empty');
            expect(input.properties.readOnly).toBeTruthy();
        });

        it('should correctly filter negative values', async () => {
            fix = TestBed.createComponent(IgxGridFilteringNumericComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;

            GridFunctions.clickFilterCellChip(fix, 'Number');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));

            // Set input and confirm
            GridFunctions.typeValueInFilterRowInput('-1', fix);
            await fix.whenStable();
            fix.detectChanges();

            expect(input.componentInstance.value).toEqual('-1');
            expect(grid.rowList.length).toEqual(1);

            GridFunctions.typeValueInFilterRowInput('0', fix);
            await fix.whenStable();
            fix.detectChanges();

            expect(input.componentInstance.value).toEqual('0');
            expect(grid.rowList.length).toEqual(0);

            GridFunctions.typeValueInFilterRowInput('-0.5', fix);
            await fix.whenStable();
            fix.detectChanges();

            expect(input.componentInstance.value).toEqual('-0.5');
            expect(grid.rowList.length).toEqual(1);

            GridFunctions.typeValueInFilterRowInput('', fix);
            await fix.whenStable();
            fix.detectChanges();

            expect(input.componentInstance.value).toEqual(null);
            expect(grid.rowList.length).toEqual(3);
        });

        it('Should focus input .', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Open dropdown
            GridFunctions.openFilterDD(fix.debugElement);
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list-scroll'));
            const input = filteringRow.query(By.directive(IgxInputDirective));

            // Select condition with input
            await GridFunctions.selectFilteringCondition('Contains', dropdownList);

            // Check focus is kept
            expect(document.activeElement).toEqual(input.nativeElement);

            // Set input and confirm
            GridFunctions.typeValueInFilterRowInput('a', fix, input);
            await fix.whenStable();
            fix.detectChanges();

            // Check a chip is created after input and is marked as selected.
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();
            expect(input.componentInstance.value).toEqual('a');

            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
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
        });

        it('should update UI when filtering via the API.', async () => {
            grid.width = '1600px';
            grid.columnList.get(1).width = '400px';
            fix.detectChanges();

            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'Ignite',
                condition: IgxStringFilteringOperand.instance().condition('startsWith'),
                conditionName: 'startsWith'
            };
            const expression1 = {
                fieldName: 'ProductName',
                searchVal: 'Angular',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains'
            };
            filteringExpressionsTree.filteringOperands.push(expression);
            filteringExpressionsTree.filteringOperands.push(expression1);
            grid.filter('ProductName', null, filteringExpressionsTree);
            grid.filter('Released', true, IgxBooleanFilteringOperand.instance().condition('false'));
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(0);
            const filteringCells = GridFunctions.getFilteringCells(fix);
            const stringCellChips = filteringCells[1].queryAll(By.css('igx-chip'));
            const boolCellChips = filteringCells[3].queryAll(By.css('igx-chip'));
            const strConnector = filteringCells[1].query(By.css('.igx-filtering-chips__connector'));

            expect(strConnector.nativeElement.textContent.trim()).toBe('And');
            expect(stringCellChips.length).toBe(2);
            expect(boolCellChips.length).toBe(1);

            expect(GridFunctions.getChipText(stringCellChips[0])).toBe('Ignite');
            expect(GridFunctions.getChipText(stringCellChips[1])).toBe('Angular');
            expect(GridFunctions.getChipText(boolCellChips[0])).toBe('False');
        });

        it('should display view more icon in filter cell if chips don\'t fit in the cell.', async () => {
            grid.columnList.get(1).width = '200px';
            fix.detectChanges();

            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'Ignite',
                condition: IgxStringFilteringOperand.instance().condition('startsWith'),
                conditionName: 'startsWith'
            };
            const expression1 = {
                fieldName: 'ProductName',
                searchVal: 'for',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains'
            };
            filteringExpressionsTree.filteringOperands.push(expression);
            filteringExpressionsTree.filteringOperands.push(expression1);
            grid.filter('ProductName', null, filteringExpressionsTree);
            fix.detectChanges();

            // check 1 chip and view more icon is displayed.
            const chips = GridFunctions.getFilterChipsForColumn('ProductName', fix);
            expect(chips.length).toEqual(1);
            const fcIndicator = GridFunctions.getFilterIndicatorForColumn('ProductName', fix);

            const indicatorBadge = fcIndicator[0].query(By.directive(IgxBadgeComponent));
            expect(indicatorBadge).toBeTruthy();
            expect(indicatorBadge.nativeElement.innerText.trim()).toEqual('1');
        });

        it('should select chip when open it from filter cell', async () => {
            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();
            expect(input.componentInstance.value).toEqual('Ignite');

        });

        it('Should allow setting filtering conditions through filteringExpressionsTree.', async () => {
            grid.columnList.get(1).width = '200px';
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'o', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
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
        });

        it('Should close FilterRow when Escape is pressed.', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));

            UIInteractions.triggerKeyDownEvtUponElem('Escape', filteringRow.nativeElement, true);
            await fix.whenStable();
            fix.detectChanges();

            filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeNull();
        });

        it('Should correctly load default resource strings for filter row', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeDefined();

            const editingBtns = filteringRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
            const reset = editingBtns.queryAll(By.css('button'))[0];

            expect(reset.nativeElement.childNodes[1].textContent.trim()).toBe('Reset');
        });

        it('Should correctly change resource strings for filter row using Changei18n.', async () => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            const strings = Object.assign({}, GridResourceStringsEN);
            strings.igx_grid_filter = 'My filter';
            strings.igx_grid_filter_row_close = 'My close';
            changei18n(strings);
            fix.detectChanges();

            const initialChips = GridFunctions.getFilteringChips(fix);
            expect(GridFunctions.getChipText(initialChips[0])).toBe('My filter');

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeDefined();

            const editingBtns = filteringRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
            const reset = editingBtns.queryAll(By.css('button'))[0];
            const close = editingBtns.queryAll(By.css('button'))[1];

            expect(close.nativeElement.childNodes[1].textContent.trim()).toBe('My close');
            expect(reset.nativeElement.childNodes[1].textContent.trim()).toBe('Reset');

            changei18n({
                igx_grid_filter: 'Filter',
                igx_grid_filter_row_close: 'Close'
            });
        });

        it('Should correctly change resource strings for filter row.', async () => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            grid = fix.componentInstance.grid;
            grid.resourceStrings = Object.assign({}, grid.resourceStrings, {
                igx_grid_filter: 'My filter',
                igx_grid_filter_row_close: 'My close'
            });
            fix.detectChanges();

            const initialChips = GridFunctions.getFilteringChips(fix);
            expect(GridFunctions.getChipText(initialChips[0])).toBe('My filter');

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeDefined();

            const editingBtns = filteringRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
            const reset = editingBtns.queryAll(By.css('button'))[0];
            const close = editingBtns.queryAll(By.css('button'))[1];

            expect(close.nativeElement.childNodes[1].textContent.trim()).toBe('My close');
            expect(reset.nativeElement.childNodes[1].textContent.trim()).toBe('Reset');
        });

        it('should correctly apply locale to datePicker.', async () => {
            fix.detectChanges();

            grid.locale = 'de-DE';
            await fix.whenStable();
            fix.detectChanges();

            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const dateCellChip = initialChips[3].nativeElement;

            dateCellChip.click();
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const datePicker = filteringRow.query(By.directive(IgxDatePickerComponent));
            datePicker.componentInstance.getEditElement().click();
            await fix.whenStable();
            fix.detectChanges();

            const calendar = document.getElementsByClassName('igx-calendar')[0];
            const sundayLabel = calendar.querySelectorAll('.igx-days-row__label')[0].textContent;

            expect(sundayLabel.trim()).toEqual('Mo');
        });

        it('Should size grid correctly if enable/disable filtering in run time.', async () => {
            const head = grid.theadRow.nativeElement;
            const body = grid.nativeElement.querySelector('.igx-grid__tbody');

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

            fix.componentInstance.activateFiltering(false);
            fix.detectChanges();

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

            fix.componentInstance.activateFiltering(true);
            fix.detectChanges();

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);
        });

        it('Should remove FilterRow, when allowFiltering is set to false.', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeDefined();

            grid.allowFiltering = false;
            fix.detectChanges();

            filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeNull();
        });

        it('should open \'conditions dropdown\' on prefix click and should close it on second click.', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const prefix = GridFunctions.getFilterRowPrefix(fix);
            const event = {
                currentTarget: prefix.nativeElement,
                preventDefault: () => { },
                stopPropagation: () => { }
            };

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', event);
            await fix.whenStable();
            fix.detectChanges();

            // Verify dropdown is opened
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            // Click prefix again to close conditions dropdown
            prefix.triggerEventHandler('click', event);
            await fix.whenStable();
            fix.detectChanges();

            // Verify dropdown is closed
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);
        });

        it('should close \'conditions dropdown\' when navigate with Tab key', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const prefix = GridFunctions.getFilterRowPrefix(fix);
            const event = {
                currentTarget: prefix.nativeElement,
                preventDefault: () => { },
                stopPropagation: () => { }
            };

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', event);
            await fix.whenStable();
            fix.detectChanges();

            // Verify dropdown is opened
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            // Press Tab key
            UIInteractions.triggerKeyDownEvtUponElem('Tab', prefix.nativeElement, true);
            await fix.whenStable();
            fix.detectChanges();

            // Verify dropdown is closed
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);
        });

        it('should open \'conditions dropdown\' when press Alt+KyeDown on the input', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', input, true);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);
        });

        it('should close filter row on Escape key pressed on the input', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));

            UIInteractions.triggerEventHandlerKeyDown('Escape', input);
            await fix.whenStable();
            fix.detectChanges();

            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).toBeNull();
            expect(grid.filteringService.isFilterRowVisible).toBeFalsy();
        });

        it('should open \'conditions dropdown\' when Enter is pressed on the prefix', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const prefix = GridFunctions.getFilterRowPrefix(fix);
            prefix.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: 'Enter' }));
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.verifyFilteringDropDownIsOpened(fix);
        });

        it('should not commit the input on Enter while a composition (IME) is in progress', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            GridFunctions.typeValueInFilterRowInput('Ignite', fix, input);
            await fix.whenStable();
            fix.detectChanges();

            const pendingExpression = grid.filteringRow.expression;
            expect(pendingExpression.searchVal).toBe('Ignite');

            input.triggerEventHandler('compositionstart', {});
            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
            await fix.whenStable();
            fix.detectChanges();
            // the input is not committed, so the same expression is still being edited
            expect(grid.filteringRow.expression).toBe(pendingExpression);

            input.triggerEventHandler('compositionend', {});
            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
            await fix.whenStable();
            fix.detectChanges();
            expect(grid.filteringRow.expression).not.toBe(pendingExpression);
            expect(grid.filteringService.getExpressions('ProductName')[0].expression.searchVal).toBe('Ignite');
        });

        it('should remove the condition without a value and restore the data when the filter row is closed', async () => {
            const allRowsCount = grid.rowList.length;
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // apply a unary condition and then switch it to a condition that requires a value
            GridFunctions.openFilterDD(fix.debugElement);
            await fix.whenStable();
            fix.detectChanges();
            await GridFunctions.selectFilteringCondition('Empty', fix.debugElement.query(By.css('div.igx-drop-down__list-scroll')));
            await fix.whenStable();
            fix.detectChanges();
            expect(grid.rowList.length).toBeLessThan(allRowsCount);

            GridFunctions.openFilterDD(fix.debugElement);
            await fix.whenStable();
            fix.detectChanges();
            await GridFunctions.selectFilteringCondition('Contains', fix.debugElement.query(By.css('div.igx-drop-down__list-scroll')));
            await fix.whenStable();
            fix.detectChanges();
            const expressions = grid.filteringService.getExpressions('ProductName');
            expect(expressions.length).toBe(1);
            expect(expressions[0].expression.searchVal).toBeNull();

            GridFunctions.closeFilterRow(fix);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteringService.isFilterRowVisible).toBe(false);
            expect(grid.filteringService.getExpressions('ProductName').length).toBe(0);
            expect(grid.filteringExpressionsTree.find('ProductName')).toBeFalsy();
            expect(grid.rowList.length).toBe(allRowsCount);
        });

        it('Should not commit the input when null value is added', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));

            expect(grid.rowList.length).toEqual(8);

            // select unary conditions
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            let filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();
            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);

            // select not unary conditions
            await GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();
            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);

            // submit the input with empty value
            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
            await fix.whenStable();
            fix.detectChanges();

            filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeNull();
            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);
        });

        it('Should navigate keyboard focus correctly between the filter row and the grid cells.', async () => {
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            const tbody = grid.tbody.nativeElement as HTMLElement;
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective)).nativeElement;
            const closeButton = GridFunctions.getFilterRowCloseButton(fix).nativeElement;
            const resetButton = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons')).queryAll(By.css('button'))[0].nativeElement;
            // there is no condition yet, so the 'Reset' button is disabled and is not a tab stop
            expect(resetButton.disabled).toBe(true);

            // click a cell - the focus goes to the grid body and the cell becomes active
            const cell = grid.gridAPI.get_cell_by_index(0, 'ID');
            await userEvent.click(cell.nativeElement);
            await fix.whenStable();
            fix.detectChanges();
            expect(document.activeElement).toBe(tbody);
            expect(cell.active).toBe(true);

            // Shift + Tab from the grid body goes to the last focusable element of the filter row
            await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
            fix.detectChanges();
            expect(document.activeElement).toBe(closeButton);

            // Shift + Tab once more skips the disabled 'Reset' button and goes to the filter row input
            await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
            fix.detectChanges();
            expect(document.activeElement).toBe(input);

            // Tab goes back to the 'Close' button and then to the grid body
            await userEvent.keyboard('{Tab}');
            fix.detectChanges();
            expect(document.activeElement).toBe(closeButton);

            await userEvent.keyboard('{Tab}');
            await fix.whenStable();
            fix.detectChanges();
            expect(document.activeElement).toBe(tbody);
            // the previously active cell is still active and the filter row is still opened
            expect(grid.navigation.activeNode.row).toBe(0);
            expect(grid.navigation.activeNode.column).toBe(cell.column.visibleIndex);
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).not.toBeNull();
        });

        it('should hide chip arrows when the grid is narrow and column is not filtered', async () => {
            grid.width = '400px';
            await fix.whenStable();
            fix.detectChanges();

            // Click string filter chip to show filter row.
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            await fix.whenStable();

            // Verify arrows and chip area are not visible because there is no active filtering for the column.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const chipArea = filteringRow.query(By.css('igx-chip-area'));
            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).toBeNull();
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).toBeNull();
            expect(chipArea, 'chipArea is present').toBeNull();
        });

        it('Should remove first chip and filter by the remaining ones.', async () => {
            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'z', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'g', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(0);
            const filterIndicator = GridFunctions.getFilterIndicatorForColumn('ProductName', fix)[0];
            filterIndicator.nativeElement.click();
            fix.detectChanges();
            await fix.whenStable();

            // remove first chip
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            GridFunctions.removeFilterChipByIndex(0, filteringRow);
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(3);
            expect(filteringRow.queryAll(By.css('igx-chip')).length).toEqual(2);
        });

        it('Should remove middle chip and filter by the remaining ones.', async () => {
            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'z', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'g', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(0);
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await fix.whenStable();

            // remove middle chip
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            GridFunctions.removeFilterChipByIndex(1, filteringRow);
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(3);
            expect(filteringRow.queryAll(By.css('igx-chip')).length).toEqual(2);
        });

        it('Verify filter cell chip is scrolled into view on click.', async () => {
            grid.width = '470px';
            await wait(100);
            fix.detectChanges();
            GridFunctions.getGridHeader(grid).nativeElement.focus(); //
            fix.detectChanges();

            // Verify 'ReleaseDate' filter chip is not fully visible.
            let chip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0].nativeElement;
            let chipRect = chip.getBoundingClientRect();
            let gridRect = grid.nativeElement.getBoundingClientRect();
            expect(chipRect.right > gridRect.right, 'chip should not be fully visible and thus not within grid').toBe(true);

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDate');
            await wait(100);
            fix.detectChanges();

            grid.filteringRow.close();
            await wait();
            fix.detectChanges();

            // Verify 'ReleaseDate' filter chip is fully visible.
            chip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0].nativeElement;
            chipRect = chip.getBoundingClientRect();
            gridRect = grid.nativeElement.getBoundingClientRect();
            expect(chipRect.left > gridRect.left && chipRect.right < gridRect.right, 'chip should be fully visible and within grid').toBe(true);
        });

        it('Verify condition chips are scrolled into/(out of) view by using arrow buttons.', async () => {
            grid.width = '700px';
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await wait(150);
            fix.detectChanges();

            verifyMultipleChipsVisibility(fix, [true, false, false]);

            // Press right until the second chip is fully scrolled into view. A fixed number of
            // presses is brittle — how far each press scrolls depends on chip widths/font metrics,
            // so the second chip can land a few px short of full visibility in some environments.
            for (let i = 0; i < 6 && !isChipFullyVisible(fix, 1); i++) {
                grid.filteringRow.scrollChipsOnArrowPress('right');
                await wait(150);
                fix.detectChanges();
            }

            verifyChipVisibility(fix, 0, false);
            verifyChipVisibility(fix, 1, true);

            // Press left until the first chip is fully scrolled back into view.
            for (let i = 0; i < 6 && !isChipFullyVisible(fix, 0); i++) {
                grid.filteringRow.scrollChipsOnArrowPress('left');
                await wait(150);
                fix.detectChanges();
            }

            verifyChipVisibility(fix, 0, true);
        });

        it('Should navigate from left arrow button to first condition chip Tab.', async () => {
            grid.width = '700px';
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await wait(16);
            fix.detectChanges();
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            fix.detectChanges();
            // Add second chip.
            GridFunctions.typeValueInFilterRowInput('e', fix);
            await wait(16);
            fix.detectChanges();
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            fix.detectChanges();
            // Add third chip.
            GridFunctions.typeValueInFilterRowInput('i', fix);
            await wait(16);
            fix.detectChanges();
            GridFunctions.submitFilterRowInput(fix);
            await wait(100);
            fix.detectChanges();

            // Verify first chip is not in view.
            verifyChipVisibility(fix, 0, false);

            const leftArrowButton = GridFunctions.getFilterRowLeftArrowButton(fix).nativeElement;
            leftArrowButton.focus();
            await wait(16);
            fix.detectChanges();
            leftArrowButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
            fix.detectChanges();
            await wait(100);

            // Verify first chip is in view.
            verifyChipVisibility(fix, 0, true);
        });

        it('Should toggle the selection of a condition chip when using \'Enter\' key.', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Add chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await fix.whenStable();
            GridFunctions.submitFilterRowInput(fix);
            await fix.whenStable();

            // Verify chip is not selected.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeFalsy();

            filterChip.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            await fix.whenStable();
            fix.detectChanges();

            // Verify chip is selected.
            expect(filterChip.componentInstance.selected).toBeTruthy();

            filterChip.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            fix.detectChanges();
            await fix.whenStable();

            // Verify chip is not selected.
            expect(filterChip.componentInstance.selected).toBeFalsy();
        });

        it('Should commit the value in the input when pressing \'Enter\' on commit icon in input.', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Type 'ang' in the filter row input.
            GridFunctions.typeValueInFilterRowInput('ang', fix);
            await fix.whenStable();
            fix.detectChanges();

            // Verify chip is selected (in edit mode).
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            // Press 'Enter' on the commit icon.
            const inputCommitIcon = GridFunctions.getFilterRowInputCommitIcon(fix);
            UIInteractions.triggerEventHandlerKeyDown('Enter', inputCommitIcon);
            await fix.whenStable();
            fix.detectChanges();

            // Verify chip is not selected (it is committed).
            expect(filterChip.componentInstance.selected).toBeFalsy();
        });

        it('Should clear the value in the input when pressing \'Enter\' on clear icon in input.', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Type 'ang' in the filter row input.
            GridFunctions.typeValueInFilterRowInput('ang', fix);
            await fix.whenStable();
            fix.detectChanges();

            // Verify chip is selected (in edit mode).
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            // Press 'Enter' on the clear icon.
            const inputClearIcon = GridFunctions.getFilterRowInputClearIcon(fix);
            UIInteractions.triggerEventHandlerKeyDown('Enter', inputClearIcon);
            await fix.whenStable();
            fix.detectChanges();

            // Verify there are no chips since we cleared the input.
            const conditionChips = filteringRow.queryAll(By.directive(IgxChipComponent));
            expect(conditionChips.length).toBe(0);
        });

        it(`Should open/close filterRow for respective column when pressing 'ctrl + shift + l' on its filterCell chip.`, async () => {
            // Verify filterRow is not opened.
            let filterUIRow = grid.theadRow.filterRow;
            expect(filterUIRow).toBeUndefined();

            const releaseDateColumn = GridFunctions.getColumnHeader('ReleaseDate', fix);
            UIInteractions.simulateClickAndSelectEvent(releaseDateColumn);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('l', releaseDateColumn.nativeElement, true, false, true, true);
            await fix.whenStable();
            fix.detectChanges();

            // Verify filterRow is opened for the 'ReleaseDate' column.
            filterUIRow = grid.theadRow.filterRow;
            expect(filterUIRow).toBeDefined();
            const headerGroupsFiltering = grid.headerGroupsList.filter(group => group.isFiltered);
            expect(headerGroupsFiltering.length).toBe(1);
            expect(headerGroupsFiltering[0].column.field).toMatch('ReleaseDate');

            UIInteractions.triggerKeyDownEvtUponElem('l', filterUIRow.nativeElement, true, false, true, true);
            await fix.whenStable();
            fix.detectChanges();

            filterUIRow = grid.theadRow.filterRow;
            expect(filterUIRow).toBeUndefined();
        });

        it('Should navigate to first cell of grid when pressing \'Tab\' on the last filterCell chip.', async () => {
            const lastColumn = grid.getColumnByName('AnotherField');
            const filterCellChip = GridFunctions.getFilterChipsForColumn('AnotherField', fix)[0];
            // filter cell chips are not tab stops - the keyboard navigation in the header is handled by the header row
            expect(filterCellChip.componentInstance.tabIndex).toBe(-1);

            // focus the header row and navigate to the last column (the one with the last filter cell chip)
            const thead = grid.theadRow.nativeElement as HTMLElement;
            thead.focus();
            await fix.whenStable();
            fix.detectChanges();
            expect(document.activeElement).toBe(thead);
            await userEvent.keyboard('{End}');
            await fix.whenStable();
            fix.detectChanges();
            expect(grid.navigation.activeNode.row).toBe(-1);
            expect(grid.navigation.activeNode.column).toBe(lastColumn.visibleIndex);

            // Tab moves the focus to the grid body and activates the cell in the first row
            // of the column that was active in the header
            await userEvent.keyboard('{Tab}');
            await fix.whenStable();
            fix.detectChanges();

            expect(document.activeElement).toBe(grid.tbody.nativeElement);
            const firstRowCell = grid.gridAPI.get_cell_by_index(0, 'AnotherField');
            expect(grid.navigation.activeNode.row).toBe(0);
            expect(grid.navigation.activeNode.column).toBe(lastColumn.visibleIndex);
            expect(firstRowCell.active).toBe(true);
            expect(firstRowCell.nativeElement.classList).toContain('igx-grid__td--active');
        });

        it(`Should remove first condition chip when click 'clear' button and focus 'more' icon.`, async () => {
            grid.getColumnByName('ProductName').width = '200px';
            await fix.whenStable();
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            // Verify active chip and its text.
            let filterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
            expect(GridFunctions.getChipText(filterCellChip)).toBe('a');

            // Remove active chip.
            ControlsFunction.clickChipRemoveButton(filterCellChip.nativeElement);
            await fix.whenStable();
            fix.detectChanges();

            const header = GridFunctions.getGridHeader(grid);
            expect(document.activeElement).toBe(header.nativeElement);

            // Verify new chip text.
            filterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
            expect(GridFunctions.getChipText(filterCellChip)).toBe('e');
        });

        it(`Should focus 'grid header' when close filter row.`, async () => {
            grid.getColumnByName('ProductName').width = '80px';
            await fix.whenStable();
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            // Click more icon
            const moreIcon = GridFunctions.getFilterIndicatorForColumn('ProductName', fix)[0];
            moreIcon.triggerEventHandler('click', null);
            await fix.whenStable();
            fix.detectChanges();

            // verify first chip is selected
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            // close filter row
            GridFunctions.closeFilterRow(fix);
            await fix.whenStable();

            const header = GridFunctions.getGridHeader(grid);
            expect(document.activeElement).toEqual(header.nativeElement);
        });

        it('Should update active element when click \'clear\' button of last chip and there is no \'more\' icon.', async () => {
            grid.getColumnByName('ProductName').width = '350px';
            await fix.whenStable();
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();
            await fix.whenStable();
            fix.detectChanges();
            expect(grid.rowList.length).toBe(2);

            // Verify chips count and that the 'more' icon is hidden as all chips fit.
            expect(GridFunctions.getFilterChipsForColumn('ProductName', fix).length, 'incorrect chips count').toBe(3);
            const filterCell = GridFunctions.getFilterCell(fix, 'ProductName').nativeElement as HTMLElement;
            expect(filterCell.querySelector('.igx-grid__filtering-cell-indicator--hidden')).not.toBeNull();

            // Verify last chip text.
            let lastFilterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[2];
            expect(GridFunctions.getChipText(lastFilterCellChip)).toBe('i');

            // Remove the last chip.
            ControlsFunction.clickChipRemoveButton(lastFilterCellChip.nativeElement);
            await fix.whenStable();
            fix.detectChanges();

            // Verify chips count and the new last chip text.
            expect(GridFunctions.getFilterChipsForColumn('ProductName', fix).length, 'incorrect chips count').toBe(2);
            lastFilterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[1];
            expect(GridFunctions.getChipText(lastFilterCellChip)).toBe('e');
            expect(filterCell.querySelector('.igx-grid__filtering-cell-indicator--hidden')).not.toBeNull();
            // The grid is filtered by the remaining conditions.
            expect(grid.rowList.length).toBe(3);

            // Filter cell chips are not focusable (keyboard navigation in the header goes through the header row),
            // so the focus is moved to the grid header row.
            expect(document.activeElement).toBe(GridFunctions.getGridHeader(grid).nativeElement);
        });

        it('Should open filterRow when clicking \'more\' icon', async () => {
            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            // Click 'more' icon
            const filterCell = GridFunctions.getFilterCell(fix, 'ProductName');
            const moreIcon: any = Array.from(filterCell.queryAll(By.css('igx-icon')))
                .find((ic: any) => ic.nativeElement.innerText === 'filter_list');
            moreIcon.nativeElement.click();
            await fix.whenStable();
            fix.detectChanges();

            // Verify filterRow is opened.
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).not.toBeNull();

            // Verify first chip is selected (in edit mode).
            const chipDiv = GridFunctions.getFilterConditionChip(fix, 0).querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected'), 'chip is not selected').toBe(true);
        });

        it('Should not throw error when deleting the last chip', async () => {
            grid.width = '700px';
            fix.detectChanges();
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            await fix.whenStable();

            // Add four 'contains' conditions - their chips do not fit in the filter row.
            for (const value of ['a', 'e', 'i', 'o']) {
                await typeFilterRowValue(fix, value);
                commitFilterRowInput(fix);
                // the chips area is scrolled in a requestAnimationFrame
                await nextFrame();
                await fix.whenStable();
                fix.detectChanges();
            }
            await nextFrame();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const getChips = () => filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(getChips().length).toBe(4);
            // the chips area is scrolled to the last added chip in a requestAnimationFrame,
            // which can run late on a slow machine
            await vi.waitFor(() => {
                fix.detectChanges();
                verifyMultipleChipsVisibility(fix, [false, false, false, true]);
            });
            expect(GridFunctions.getFilterRowLeftArrowButton(fix), 'Left scroll arrow should be visible').not.toBeNull();
            expect(GridFunctions.getFilterRowRightArrowButton(fix), 'Right scroll arrow should be visible').not.toBeNull();
            expect(grid.rowList.length).toBe(2);

            const errorSpy = vi.spyOn(console, 'error');
            const onChipRemovedSpy = vi.spyOn(grid.filteringRow, 'onChipRemoved');

            // Remove the last chip (the only visible one) through its remove button.
            ControlsFunction.clickChipRemoveButton(getChips()[3].nativeElement);
            fix.detectChanges();
            await nextFrame();
            await fix.whenStable();
            fix.detectChanges();

            expect(onChipRemovedSpy).toHaveBeenCalledTimes(1);
            expect(onChipRemovedSpy.mock.results[0].type).toBe('return');
            expect(getChips().length).toBe(3);
            expect(GridFunctions.getChipText(getChips()[2])).toBe('i');
            // 'a', 'e' and 'i'
            expect(grid.rowList.length).toBe(2);

            // Remove the new last chip.
            ControlsFunction.clickChipRemoveButton(getChips()[2].nativeElement);
            fix.detectChanges();
            await nextFrame();
            await fix.whenStable();
            fix.detectChanges();

            expect(onChipRemovedSpy).toHaveBeenCalledTimes(2);
            expect(onChipRemovedSpy.mock.results[1].type).toBe('return');
            expect(getChips().length).toBe(2);
            expect(GridFunctions.getChipText(getChips()[1])).toBe('e');
            // 'a' and 'e'
            expect(grid.rowList.length).toBe(3);
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should scroll correct chip in view when one is deleted', async () => {
            grid.width = '840px';
            fix.detectChanges();
            await wait(DEBOUNCE_TIME);

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await wait(300);

            // NOTE: This test is very sensitive to the width of the grid and the chips.
            // The themed filter-row layout leaves a ~19px wider visible chip area than the
            // unthemed baseline, so the second chip is also fully visible initially.
            verifyMultipleChipsVisibility(fix, [true, true, false, false]);

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            GridFunctions.removeFilterChipByIndex(1, filterUIRow);
            // wait for chip to be scrolled in view
            fix.detectChanges();
            await wait(300);

            verifyMultipleChipsVisibility(fix, [true, true, false]);
            let chips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toBe(3);

            GridFunctions.removeFilterChipByIndex(0, filterUIRow);
            // wait for chip to be scrolled in view
            fix.detectChanges();
            await wait(300);
            fix.detectChanges();

            verifyMultipleChipsVisibility(fix, [true, true]);
            chips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toBe(2);
        });

        it('Unary conditions should be committable', async () => {
            grid.height = '700px';
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Check that the filterRow is opened
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            // Select Empty condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            const chip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(chip.componentInstance.selected).toBeTruthy();
            grid.nativeElement.focus();
            grid.filteringRow.onInputGroupFocusout();
            fix.detectChanges();
            await fix.whenStable();
            expect(chip.componentInstance.selected).toBeFalsy();

            GridFunctions.clickChip(chip);
            fix.detectChanges();
            await fix.whenStable();
            expect(chip.componentInstance.selected).toBeTruthy();
        });

        it('Should close filterRow when changing filterMode from \'quickFilter\' to \'excelStyleFilter\'', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Add a condition chip without submitting it.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await fix.whenStable();

            // Change filterMode to 'excelStyleFilter`
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();

            // Verify the the filterRow is closed.
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow, 'filterRow is visible').toBeNull();

            // Verify the ESF icons are visible.
            const thead = grid.theadRow.nativeElement;
            const filterIcons = thead.querySelectorAll('.igx-excel-filter__icon');
            expect(filterIcons.length, 'incorrect esf filter icons count').toEqual(6);

            // Verify the condition was submitted.
            const header = GridFunctions.getColumnHeader('ProductName', fix);
            const activeFilterIcon = header.nativeElement.querySelector('.igx-excel-filter__icon--filtered');
            expect(activeFilterIcon, 'no active filter icon was found').toBeDefined();
        });

        it('Should clear non-unary conditions with null searchVal when close', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            GridFunctions.openFilterDD(fix.debugElement);
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down.igx-toggle'));
            await GridFunctions.selectFilteringCondition('Empty', dropdownList);
            fix.detectChanges();
            GridFunctions.openFilterDD(fix.debugElement);
            await GridFunctions.selectFilteringCondition('Contains', dropdownList);
            fix.detectChanges();
            GridFunctions.closeFilterRow(fix);

            const headerChip = GridFunctions.getFilterChipsForColumn('ProductName', fix);
            expect(headerChip.length).toBe(1);
        });

        it('Should commit the input and new chip after focus out and should edit chip without creating new one.', async () => {
            // Click date filter chip to show filter row.
            const dateFilterCellChip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0];
            dateFilterCellChip.nativeElement.click();
            await fix.whenStable();
            fix.detectChanges();

            // Click input to open calendar.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const inputDebugElement = filteringRow.query(By.directive(IgxInputDirective));
            const input = inputDebugElement.nativeElement;
            input.click();
            await fix.whenStable();
            fix.detectChanges();

            // Click the today date.
            let calendar = document.getElementsByClassName('igx-calendar')[0];
            const todayDayItem: HTMLElement = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayDayItem.firstChild);
            grid.filteringRow.onInputGroupFocusout();
            await fix.whenStable();
            fix.detectChanges();

            // Verify the newly added chip is selected.
            const chip = GridFunctions.getFilterConditionChip(fix, 0);
            const chipDiv = chip.querySelector('.igx-chip__item');

            expect(chipDiv.classList.contains('igx-chip__item--selected'), 'initial chip is committed').toBe(true);

            // Focus out
            grid.nativeElement.focus();
            grid.filteringRow.onInputGroupFocusout();
            await fix.whenStable();
            fix.detectChanges();

            expect(chipDiv.classList.contains('igx-chip__item--selected'), 'initial chip is not committed').toBe(false);
            expect(input.value, 'initial input value is present and not committed').toBe('');

            chip.click();
            await fix.whenStable();
            fix.detectChanges();

            // Open calendar
            input.click();
            await fix.whenStable();
            fix.detectChanges();

            calendar = document.getElementsByClassName('igx-calendar')[0];

            // View years
            const yearView: HTMLElement = calendar.querySelectorAll('.igx-calendar-picker__date')[1] as HTMLElement;
            yearView.dispatchEvent(new Event('mousedown'));
            await fix.whenStable();
            fix.detectChanges();

            // Select the first year
            const firstYear: HTMLElement = calendar.querySelectorAll('.igx-calendar-view-item')[0] as HTMLElement;
            firstYear.dispatchEvent(new Event('mousedown'));
            await fix.whenStable();
            fix.detectChanges();

            // Select the first month
            const firstMonth: HTMLElement = calendar.querySelectorAll('.igx-calendar-view-item')[0] as HTMLElement;
            firstMonth.dispatchEvent(new Event('mousedown'));
            await fix.whenStable();
            fix.detectChanges();

            // Select the first day
            const firstDayItem: HTMLElement = calendar.querySelector('.igx-day-item:not(.igx-day-item--inactive)');

            UIInteractions.simulateClickAndSelectEvent(firstDayItem.firstChild);
            grid.filteringRow.onInputGroupFocusout();
            await fix.whenStable();
            fix.detectChanges();

            expect(chipDiv.classList.contains('igx-chip__item--selected'), 'chip is committed').toBe(true);

            // Focus out
            grid.nativeElement.focus();
            grid.filteringRow.onInputGroupFocusout();
            await fix.whenStable();
            fix.detectChanges();
            expect(chipDiv.classList.contains('igx-chip__item--selected'), 'chip is selected').toBe(false);

            // Check if we still have only one committed chip
            const chipsLength = GridFunctions.getAllFilterConditionChips(fix).length;

            expect(chipsLength, 'there is more than one chip').toBe(1);
            expect(chipDiv.classList.contains('igx-chip__item--selected'), 'chip is not committed').toBe(false);
            expect(input.value, 'input value is present and not committed').toBe('');
        });

        it('should not retain expression values in cell filter after calling grid clearFilter() method.', async () => {
            // Click on 'ProductName' filter chip
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            // Enter expression
            GridFunctions.typeValueInFilterRowInput('NetAdvantage', fix);
            await fix.whenStable();
            GridFunctions.closeFilterRow(fix);
            fix.detectChanges();

            // Verify filtered data
            expect(grid.filteredData.length).toEqual(1);

            // Clear filters of all columns
            grid.clearFilter();
            fix.detectChanges();

            // Verify filtered data
            expect(grid.filteredData).toBeNull();

            // Click on 'ProductName' filter chip
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            // Verify there are no chips since we cleared all filters
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const conditionChips = filteringRow.queryAll(By.directive(IgxChipComponent));
            expect(conditionChips.length).toBe(0);

            // Verify filtered data
            expect(grid.filteredData).toBeNull();
        });

        it('should not reset expression when input is cleared', async () => {
            grid.filter('ProductName', 'I', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            grid.filteringRow.onClearClick();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('startsWith');
        });

        it('should reset expression when the condition is unary', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // iterate over unary conditions
            // empty
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            expect(grid.filteringRow.expression.condition.name).toEqual('empty');

            const filterUIRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const reset = filterUIRow.queryAll(By.css('button'))[0];

            reset.triggerEventHandler('click', null);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('contains');
        });

        it('should reset expression to selected unary condition', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent));

            // Equals condition
            datePicker.triggerEventHandler('click', null);
            await fix.whenStable();
            fix.detectChanges();

            const currentDay = document.querySelector('.igx-day-item--current');

            UIInteractions.simulateClickAndSelectEvent(currentDay.firstChild);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('equals');
            expect(grid.rowList.length).toEqual(1);

            // This Month condition
            const expectedResults = GridFunctions.createDateFilterConditions(grid, today);
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('thisMonth');
            expect(grid.rowList.length).toEqual(expectedResults[5]);

            const conditionChips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(conditionChips.length).toBe(1);
        });

        it('Should filter by cells formatted data when using FormattedValuesFilteringStrategy', async () => {
            const formattedStrategy = new FormattedValuesFilteringStrategy(['Downloads']);
            grid.filterStrategy = formattedStrategy;
            const downloadsFormatter = (val: number): number => {
                if (!val || val > 0 && val < 100) {
                    return 1;
                } else if (val >= 100 && val < 500) {
                    return 2;
                } else {
                    return 3;
                }
            };
            grid.columnList.get(2).formatter = downloadsFormatter;
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'Downloads');
            fix.detectChanges();

            GridFunctions.typeValueInFilterRowInput('3', fix);
            await fix.whenStable();
            GridFunctions.closeFilterRow(fix);
            fix.detectChanges();

            // const cells = GridFunctions.getColumnCells(fix, 'Downloads');
            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(2);
        });

        it('Should filter by cells formatted data when using FormattedValuesFilteringStrategy with rowData', async () => {
            const formattedStrategy = new FormattedValuesFilteringStrategy(['ProductName']);
            grid.filterStrategy = formattedStrategy;
            const anotherFieldFormatter = (value: any, rowData: any) => rowData.ID + ':' + value;
            grid.columnList.get(1).formatter = anotherFieldFormatter;
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            GridFunctions.typeValueInFilterRowInput('1:', fix);
            await fix.whenStable();
            GridFunctions.closeFilterRow(fix);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(1);
        });

        it('Should remove pending chip via its close button #9333', async () => {
            GridFunctions.clickFilterCellChipUI(fix, 'Downloads');
            fix.detectChanges();

            GridFunctions.typeValueInFilterRowInput('3', fix);
            await fix.whenStable();
            const inputGroup = fix.debugElement.query(By.directive(IgxInputGroupComponent));
            const filterRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const pendingChip = filterRow.queryAll(By.directive(IgxChipComponent))[0];
            const chipCloseButton = pendingChip.query(By.css('div.igx-chip__remove')).nativeElement;

            chipCloseButton.dispatchEvent(new Event('mousedown'));
            inputGroup.nativeElement.dispatchEvent(new Event('focusout'));
            chipCloseButton.dispatchEvent(new Event('mouseup'));
            chipCloseButton.dispatchEvent(new Event('click'));
            await fix.whenStable();
            fix.detectChanges();

            const chips = filterRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length, 'No chips should be present').toEqual(0);
        });

        it('Should not throw error when pressing Backspace in empty dateTime filter.', async () => {
            vi.spyOn(console, 'error');

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            GridFunctions.typeValueInFilterRowInput('', fix, input);
            await fix.whenStable();
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Backspace', input);
            fix.detectChanges();

            expect(console.error).not.toHaveBeenCalled();
        });

        it('Should not throw error when pressing Arrow keys in filter when focus is outside of input.', async () => {
            vi.spyOn(console, 'error');

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            const prefix = GridFunctions.getFilterRowPrefix(fix).nativeElement;
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', prefix);
            fix.detectChanges();

            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe('Integration scenarios', () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                providers: [{ provide: INPUT_DEBOUNCE_TIME, useValue: 0 }]
            });
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        // Filtering + Row Selectors
        it('should display the Row Selector header checkbox above the filter row.', async () => {
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const frElem = filteringRow.nativeElement;
            const chkBoxElem = GridSelectionFunctions.getRowCheckboxInput(GridSelectionFunctions.getHeaderRow(fix));
            expect(frElem.offsetTop).toBeGreaterThanOrEqual(chkBoxElem.offsetTop + chkBoxElem.clientHeight);
        });

        // Filtering + Moving
        it('should move chip under the correct column when column is moved and filter row should open for correct column.', async () => {
            grid.filter('ProductName', 'Angular', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            // swap columns
            const stringCol = grid.getColumnByName('ProductName');
            const numberCol = grid.getColumnByName('Downloads');
            grid.moveColumn(stringCol, numberCol);
            await fix.whenStable();
            fix.detectChanges();

            // check UI in filter cell is correct after moving
            const filteringCells = GridFunctions.getFilteringCells(fix);

            expect(GridFunctions.getChipText(filteringCells[2])).toEqual('Angular');
            expect(GridFunctions.getChipText(filteringCells[1])).toEqual('Filter');
        });

        // Filtering + Hiding
        it('should not display filter cell for hidden columns and chips should show under correct column.', async () => {
            grid.filter('ProductName', 'Angular', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            let filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(8);

            // hide column
            grid.getColumnByName('ID').hidden = true;
            fix.detectChanges();

            filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(7);
            expect(GridFunctions.getChipText(filteringCells[0])).toEqual('Angular');

            grid.getColumnByName('ProductName').hidden = true;
            fix.detectChanges();

            filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(6);

            for (const filterCell of filteringCells) {
                expect(GridFunctions.getChipText(filterCell)).toEqual('Filter');
            }
        });

        it('Should close filter row when hide the current column', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Check that the filterRow is opened
            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).not.toBeNull();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            await fix.whenStable();
            fix.detectChanges();

            grid.getColumnByName('ProductName').hidden = true;
            await fix.whenStable();
            fix.detectChanges();

            // Check that the filterRow is closed
            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).toBeNull();
            expect(grid.rowList.length, 'filter is not applied').toBe(3);
        });

        it('Should keep existing column filter after hiding another column.', async () => {
            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'x', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'y', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'g', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            // Open filter row for 'ProductName' column and add 4 condition chips.
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            // Change second operator to 'Or' and verify the results.
            GridFunctions.clickChipOperator(fix, 1);
            fix.detectChanges();
            GridFunctions.clickChipOperatorValue(fix, 'Or');
            await fix.whenStable();
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');

            // Hide another column and verify the filtering results remain the same.
            const column = grid.columnList.find((c) => c.field === 'Released');
            column.hidden = true;
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        });

        // Filtering + Grouping
        it('should display the header expand/collapse icon for groupby above the filter row.', async () => {
            grid.getColumnByName('ProductName').groupable = true;
            grid.groupBy({
                fieldName: 'ProductName',
                dir: SortingDirection.Asc,
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const frElem = filteringRow.nativeElement;
            const expandBtn = fix.debugElement.query(By.css('.igx-grid__group-expand-btn'));
            const expandBtnElem = expandBtn.nativeElement;
            expect(frElem.offsetTop).toBeGreaterThanOrEqual(expandBtnElem.offsetTop + expandBtnElem.clientHeight);
        });

        // Filtering + Pinning
        it('should position chips correctly after pinning column.', () => {
            grid.filter('ProductName', 'Angular', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            grid.getColumnByName('ProductName').pinned = true;
            fix.detectChanges();

            // check chips is under correct column
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const stringCellChip = filteringCells[0].query(By.css('igx-chip'));
            expect(GridFunctions.getChipText(stringCellChip)).toEqual('Angular');
        });

        it('Should display view more indicator when column is resized so not all filters are visible.', async () => {
            grid.columnList.get(1).width = '250px';
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'o', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
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
            // The resize handle debounces mousedown before showing the resizer
            await wait(250);
            fix.detectChanges();
            const resizer = fix.debugElement.queryAll(By.css(GRID_RESIZE_CLASS))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 150, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 150, 5);
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
        });

        it('Should correctly resize the current column that filtering the row is rendered for.', async () => {
            grid.columnList.get(1).width = '250px';
            fix.detectChanges();

            // Enable resizing
            grid.columnList.forEach(col => col.resizable = true);
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
            // The resize handle debounces mousedown before showing the resizer
            await wait(250);
            fix.detectChanges();
            const resizer = fix.debugElement.queryAll(By.css(GRID_RESIZE_CLASS))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 100, 5);
            fix.detectChanges();

            filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeTruthy();
            expect(headers[1].nativeElement.offsetWidth).toEqual(150);
        });

        // Filtering + Resizing
        it('Should correctly render all filtering chips when column is resized so all filter are visible.', async () => {
            grid.columnList.get(2).width = '100px';
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 25, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'), conditionName: 'greaterThan' },
                { fieldName: 'Downloads', searchVal: 200, condition: IgxNumberFilteringOperand.instance().condition('lessThan'), conditionName: 'lessThan' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            // Enable resizing
            grid.columnList.forEach(col => col.resizable = true);
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
            // The resize handle debounces mousedown before showing the resizer
            await wait(250);
            fix.detectChanges();
            const resizer = fix.debugElement.queryAll(By.css(GRID_RESIZE_CLASS))[0].nativeElement;
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
        });

        it('UI focusing grid\'s body content does not throw a console error after filtering. (issue 8930)', async () => {
            vi.spyOn(console, 'error');
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            await GridFunctions.applyFilter('Jav', fix);
            await fix.whenStable();
            fix.detectChanges();

            await GridFunctions.applyFilter('xy', fix);
            await fix.whenStable();
            fix.detectChanges();

            const tBodyContent = GridFunctions.getGridContent(fix);
            tBodyContent.triggerEventHandler('focus', null);

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            GridFunctions.removeFilterChipByIndex(1, filterUIRow);
            await fix.whenStable();
            fix.detectChanges();

            tBodyContent.triggerEventHandler('focus', null);
            await fix.whenStable();
            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        // Filtering + Column Groups
        it('should size correctly the header based on grid size.', async () => {
            setElementSize(grid.nativeElement, ɵSize.Large);
            fix.detectChanges();

            const thead = GridFunctions.getGridHeader(grid).nativeElement;
            expect(thead.getBoundingClientRect().height).toBeCloseTo(grid.defaultRowHeight * 4 + 1, 0);

            setElementSize(grid.nativeElement, ɵSize.Medium);
            fix.detectChanges();
            await wait(100); // needed because the resize observer handler for --ig-size is called inside an angular zone
            fix.detectChanges();
            expect(thead.getBoundingClientRect().height).toBeCloseTo(grid.defaultRowHeight * 4 + 1, 0);

            setElementSize(grid.nativeElement, ɵSize.Small);
            fix.detectChanges();
            await wait(100); // needed because the resize observer handler for --ig-size is called inside an angular zone
            fix.detectChanges();
            expect(thead.getBoundingClientRect().height).toBeCloseTo(grid.defaultRowHeight * 4 + 1, 0);

        });

        it('should position filter row correctly when grid has column groups.', async () => {
            const thead = GridFunctions.getGridHeader(grid).nativeElement;

            const filteringCells = GridFunctions.getFilteringCells(fix);
            const cellElem = filteringCells[0].nativeElement;
            expect(cellElem.offsetParent.offsetHeight + cellElem.offsetHeight + 1).toBeCloseTo(thead.clientHeight, 10);

            GridFunctions.clickFilterCellChip(fix, 'ID');

            // check if it is positioned at the bottom of the thead.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const frElem = filteringRow.nativeElement;
            expect(frElem.offsetTop + frElem.clientHeight + 1).toEqual(thead.clientHeight);
        });

        it('should position filter row and chips correctly when grid has column groups and one is hidden.', async () => {
            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'Ignite',
                condition: IgxStringFilteringOperand.instance().condition('startsWith'),
                conditionName: 'startsWith'
            };
            filteringExpressionsTree.filteringOperands.push(expression);
            grid.filteringExpressionsTree = filteringExpressionsTree;
            fix.detectChanges();
            let filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(6);

            const groupCol = grid.getColumnByName('General');
            groupCol.hidden = true;
            fix.detectChanges();

            filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(1);

            GridFunctions.clickFilterCellChip(fix, 'AnotherField');
            fix.detectChanges();
            grid.cdr.detectChanges();

            // check if it is positioned at the bottom of the thead.
            const theadWrapper = grid.theadRow.nativeElement.firstElementChild;
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const frElem = filteringRow.nativeElement;
            expect(frElem.offsetTop + frElem.clientHeight).toEqual(theadWrapper.clientHeight);

            GridFunctions.closeFilterRow(fix);

            groupCol.hidden = false;
            fix.detectChanges();

            filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(6);

            expect(GridFunctions.getChipText(filteringCells[1])).toEqual('Ignite');
        });

        it('Should size grid correctly if enable/disable filtering in run time - MCH.', async () => {
            const head = grid.theadRow.nativeElement;
            const body = grid.nativeElement.querySelector('.igx-grid__tbody');

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

            grid.allowFiltering = false;
            fix.detectChanges();

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

            grid.allowFiltering = false;
            fix.detectChanges();

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);
        });
    });

    describe(null, () => {
        let fix;
        let grid;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridFilteringScrollComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        });

        it('Should correctly update empty filter cells when scrolling horizontally.', async () => {
            let emptyFilterCells = fix.debugElement.queryAll(By.directive(IgxGridFilteringCellComponent))
                .filter((cell) => cell.nativeElement.children.length === 0);
            expect(emptyFilterCells.length).toEqual(1);

            let emptyFilterHeader = emptyFilterCells[0].parent.query(By.directive(IgxGridHeaderComponent));
            expect(emptyFilterHeader.componentInstance.column.field).toEqual('Downloads');

            // Scroll to the right
            grid.headerContainer.getScroll().scrollLeft = 300;
            await wait();
            fix.detectChanges();

            emptyFilterCells = fix.debugElement.queryAll(By.directive(IgxGridFilteringCellComponent))
                .filter((cell) => cell.nativeElement.children.length === 0);
            expect(emptyFilterCells.length).toEqual(1);

            emptyFilterHeader = emptyFilterCells[0].parent.query(By.directive(IgxGridHeaderComponent));
            expect(emptyFilterHeader.componentInstance.column.field).toEqual('Downloads');
        });
    });

    describe(null, () => {
        let fix;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridFilteringTemplateComponent);
            fix.detectChanges();
        });

        it('Should render custom filter template instead of default one.', async () => {
            // Verify default filter template is not present.
            expect(GridFunctions.getFilterCell(fix, 'ProductName').query(By.css('.igx-filtering-chips')), '\'ProductName\' default filter chips area template was found.').toBeNull();
            expect(GridFunctions.getFilterCell(fix, 'Downloads').query(By.css('.igx-filtering-chips')), '\'Downloads\' default filter chips area template was found.').toBeNull();
            expect(GridFunctions.getFilterCell(fix, 'Released').query(By.css('.igx-filtering-chips')), '\'Released\' default filter chips area template was found.').toBeNull();
            expect(GridFunctions.getFilterCell(fix, 'ReleaseDate').query(By.css('.igx-filtering-chips')), '\'ReleaseDate\' default filter chips area template was found.').toBeNull();

            // Verify the custom filter template is present.
            expect(GridFunctions.getFilterCell(fix, 'ProductName').query(By.css('.custom-filter')), '\'ProductName\' customer filter template was not found.').not.toBeNull();
            expect(GridFunctions.getFilterCell(fix, 'Downloads').query(By.css('.custom-filter')), '\'Downloads\' customer filter template was not found.').not.toBeNull();
            expect(GridFunctions.getFilterCell(fix, 'Released').query(By.css('.custom-filter')), '\'Released\' customer filter template was not found.').not.toBeNull();
            expect(GridFunctions.getFilterCell(fix, 'ReleaseDate').query(By.css('.custom-filter')), '\'ReleaseDate\' customer filter template was not found.').not.toBeNull();
        });

        it('Should close default filter template when clicking on a column with custom one.', async () => {
            // Click on a column with default filter
            GridFunctions.clickFilterCellChip(fix, 'Licensed');
            fix.detectChanges();

            // Verify filter row is visible
            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).not.toBeNull();

            // Click on a column with custom filter
            const header = GridFunctions.getColumnHeaderTitleByIndex(fix, 1);
            header.click();
            fix.detectChanges();

            // Expect the filter row is closed
            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow, 'Default filter template was found on a column with custom filtering.').toBeNull();
        });

        it('Should not prevent mousedown event when target is within the filter cell template', async () => {
            const filterCell = GridFunctions.getFilterCell(fix, 'ProductName');
            const input = filterCell.query(By.css('input')).nativeElement;

            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
            const preventDefaultSpy = vi.spyOn(mousedownEvent, 'preventDefault');
            input.dispatchEvent(mousedownEvent, { bubbles: true });
            fix.detectChanges();

            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });

        it('Should prevent mousedown event when target is filter cell or its parent elements', async () => {
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const firstCell = filteringCells[0].nativeElement;

            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
            const preventDefaultSpy = vi.spyOn(mousedownEvent, 'preventDefault');
            firstCell.dispatchEvent(mousedownEvent);
            fix.detectChanges();

            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        const today = SampleTestData.today;

        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridDatesFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        // UI tests date column // date values are ISO 8601 strings
        it('UI - should correctly filter ISO 8601 date column', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const expectedResults = GridFunctions.createDateFilterConditions(grid, today);

            // Today condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 4);

            expect(grid.rowList.length).toEqual(1);
            verifyFilterRowUI(input, close, reset, false);
            verifyFilterUIPosition(filterUIRow, grid);

            expect(grid.rowList.length).toEqual(1);

            // This Month condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[5]);

            // Last Month condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 7);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[0]);

            // Empty condition
            await GridFunctions.openFilterDDAndSelectCondition(fix, 12);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(2);
        });

        it('UI - should correctly filter ISO 8601 date column by \'equals\' filtering conditions', async () => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.css('.igx-date-picker__input-date'));
            const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent));

            await GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            datePicker.triggerEventHandler('click', null);
            await fix.whenStable();
            fix.detectChanges();

            const calendar = document.getElementsByClassName('igx-calendar')[0];
            const currentDay = calendar.querySelector('.igx-day-item--current');

            UIInteractions.simulateClickAndSelectEvent(currentDay.firstChild);

            await fix.whenStable();
            fix.detectChanges();
            input.triggerEventHandler('change', null);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(1);
        });

    });

    describe('Filtering events', () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;

        const cal = SampleTestData.timeGenerator;
        const today = SampleTestData.today;

        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridDatesFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;

            vi.spyOn(grid.filtering, 'emit');
            vi.spyOn(grid.filteringDone, 'emit');
        });

        it('Should emit filteringDone when we clicked reset - Date column type', async () => {
            await emitFilteringDoneOnResetClick(fix, grid, cal.timedelta(today, 'day', 15), 'ReleaseDate', IgxDateFilteringOperand.instance().condition('equals'));
        });

        it('Should emit filteringDone when we clicked reset - String column type', async () => {
            await emitFilteringDoneOnResetClick(fix, grid, 'search', 'ProductName', IgxStringFilteringOperand.instance().condition('contains'));
        });

        it('Should emit filteringDone when we clicked reset - Number column type', async () => {
            await emitFilteringDoneOnResetClick(fix, grid, 100, 'Downloads', IgxNumberFilteringOperand.instance().condition('equals'));
        });

        it('Should emit filteringDone when we clicked reset - Currency column type', async () => {
            await emitFilteringDoneOnResetClick(fix, grid, 100000, 'Revenue', IgxNumberFilteringOperand.instance().condition('equals'));
        });

        it('Should emit filteringDone when we clicked reset - DateTime column type', async () => {
            await emitFilteringDoneOnResetClick(fix, grid, cal.timedelta(today, 'hour', 1), 'ReleaseTime', IgxDateTimeFilteringOperand.instance().condition('equals'));
        });

        it('Should emit filteringDone when clear the input of filteringUI - Date column type', async () => {
            await emitFilteringDoneOnInputClear(fix, grid, cal.timedelta(today, 'day', 15), 'ReleaseDate', IgxDateFilteringOperand.instance().condition('equals'));
        });

        it('Should emit filteringDone when clear the input of filteringUI - String column type', async () => {
            await emitFilteringDoneOnInputClear(fix, grid, 'search', 'ProductName', IgxStringFilteringOperand.instance().condition('contains'));
        });

        it('Should emit filteringDone when clear the input of filteringUI - Number column type', async () => {
            await emitFilteringDoneOnInputClear(fix, grid, 3, 'Downloads', IgxNumberFilteringOperand.instance().condition('equals'));
        });

        it('Should emit filteringDone when clear the input of filteringUI - Currency column type', async () => {
            await emitFilteringDoneOnInputClear(fix, grid, 100000, 'Revenue', IgxNumberFilteringOperand.instance().condition('equals'));
        });

        it('Should emit filteringDone when clear the input of filteringUI - DateTime column type', async () => {
            await emitFilteringDoneOnInputClear(fix, grid, cal.timedelta(today, 'hour', 1), 'ReleaseTime', IgxDateTimeFilteringOperand.instance().condition('equals'));
        });

        it('should update UI when chip is removed from header cell - Date column type.', async () => {
            await verifyRemoveChipFromHeader(fix, grid, cal.timedelta(today, 'day', 15), 'ReleaseDate', IgxDateFilteringOperand.instance().condition('equals'), 1, 4);
        });

        it('should update UI when chip is removed from header cell - String column type.', async () => {
            await verifyRemoveChipFromHeader(fix, grid, 'I', 'ProductName', IgxStringFilteringOperand.instance().condition('startsWith'), 2, 1);
        });

        it('should update UI when chip is removed from header cell - Number column type.', async () => {
            await verifyRemoveChipFromHeader(fix, grid, 100, 'Downloads', IgxNumberFilteringOperand.instance().condition('equals'), 1, 2);
        });

        it('should update UI when chip is removed from header cell - Currency column type.', async () => {
            await verifyRemoveChipFromHeader(fix, grid, 100000, 'Revenue', IgxNumberFilteringOperand.instance().condition('equals'), 1, 7);
        });

        it('should update UI when chip is removed from header cell - Boolean column type.', async () => {
            await verifyRemoveChipFromHeader(fix, grid, true, 'Released', IgxBooleanFilteringOperand.instance().condition('true'), 3, 3);
        });

        it('should update UI when chip is removed from header cell - DateTime column type.', async () => {
            await verifyRemoveChipFromHeader(fix, grid, cal.timedelta(today, 'hour', 1), 'ReleaseTime', IgxDateTimeFilteringOperand.instance().condition('equals'), 3, 6);
        });

        it('should emit filteringDone after chip is close from filtering row - Date column type', async () => {
            await closeChipFromFilteringUIRow(fix, grid, 'ReleaseDate', 4);
        });

        it('should emit filteringDone after chip is close from filtering row - String column type', async () => {
            await closeChipFromFilteringUIRow(fix, grid, 'ProductName', 9);
        });

        it('should emit filteringDone after chip is close from filtering row - Number column type', async () => {
            await closeChipFromFilteringUIRow(fix, grid, 'Downloads', 7);
        });

        it('should emit filteringDone after chip is close from filtering row - Currency column type', async () => {
            await closeChipFromFilteringUIRow(fix, grid, 'Revenue', 7);
        });

        it('should emit filteringDone after chip is close from filtering row - Boolean column type', async () => {
            await closeChipFromFilteringUIRow(fix, grid, 'Released', 1);
        });

        it('should emit filteringDone after chip is close from filtering row - DateTime column type', async () => {
            await closeChipFromFilteringUIRow(fix, grid, 'ReleaseTime', 4);
        });
    });
});

describe('IgxGrid - Filtering actions - Excel style filtering #grid', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridFilteringComponent,
                IgxGridFilteringESFEmptyTemplatesComponent,
                IgxGridFilteringESFTemplatesComponent,
                IgxGridFilteringESFLoadOnDemandComponent,
                IgxGridFilteringESFRemoteChunkComponent,
                IgxGridFilteringMCHComponent,
                IgxGridExternalESFComponent,
                IgxGridExternalESFTemplateComponent
            ]
        }).compileComponents();
    });

    describe(null, () => {
        let fix: ComponentFixture<IgxGridFilteringComponent>;
        let grid: IgxGridComponent;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        });

        it('Should sort the grid properly, when clicking Ascending button.', async () => {
            grid.columnList.get(2).sortable = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            fix.detectChanges();
            await wait(100);

            const sortAsc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[0];

            sortAsc.click();
            await wait();
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);
            ControlsFunction.verifyButtonIsSelected(sortAsc);

            sortAsc.click();
            await wait();
            fix.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);
            ControlsFunction.verifyButtonIsSelected(sortAsc, false);
        });

        it('Should sort the grid properly, when clicking Descending button.', async () => {
            grid.columnList.get(2).sortable = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            await wait(100);
            fix.detectChanges();

            const sortDesc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[1];

            sortDesc.click();
            await wait();
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Desc);
            ControlsFunction.verifyButtonIsSelected(sortDesc);

            sortDesc.click();
            await wait();
            fix.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);
            ControlsFunction.verifyButtonIsSelected(sortDesc, false);
        });

        it('Should (sort ASC)/(sort DESC) when clicking the respective sort button.', async () => {
            grid.columnList.get(2).sortable = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            await wait(100);
            fix.detectChanges();

            const sortAsc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[0];
            const sortDesc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[1];

            sortDesc.click();
            await wait();
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Desc);
            ControlsFunction.verifyButtonIsSelected(sortDesc);

            sortAsc.click();
            await wait();
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);
            ControlsFunction.verifyButtonIsSelected(sortAsc);
            ControlsFunction.verifyButtonIsSelected(sortDesc, false);
        });

        it('Should toggle correct Ascending/Descending button on opening when sorting is applied.', async () => {
            grid.columnList.get(2).sortable = true;
            grid.sortingExpressions.push({ dir: SortingDirection.Asc, fieldName: 'Downloads' });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            await wait(100);
            fix.detectChanges();

            const sortAsc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[0];
            const sortDesc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[1];

            ControlsFunction.verifyButtonIsSelected(sortAsc);
            ControlsFunction.verifyButtonIsSelected(sortDesc, false);
        });

        it('Should move column left/right when clicking buttons.', async () => {
            grid.moving = true;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            const moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveLeft.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.columns[2].field).toBe('ProductName');
            expect(grid.columns[1].field).toBe('Downloads');

            moveLeft.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.columns[1].field).toBe('ID');
            expect(grid.columns[0].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft);

            moveRight.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.columns[0].field).toBe('ID');
            expect(grid.columns[1].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft, false);
        });

        it('Should right pin and unpin column after moving it left/right when clicking buttons.', async () => {
            grid.pinning.columns = 1;

            const columnToPin = grid.columnList.get(grid.columnList.length - 2);
            columnToPin.pinned = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(1);

            const columnToMove = grid.unpinnedColumns[grid.unpinnedColumns.length - 1];
            grid.moving = true;

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, columnToMove.field);

            let moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            let moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveRight.click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(2);

            expect(grid.pinnedColumns[0].field).toBe(columnToMove.field);
            expect(grid.pinnedColumns[1].field).toBe(columnToPin.field);

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, columnToMove.field);
            moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];
            moveRight.click();
            fix.detectChanges();

            expect(grid.pinnedColumns[0].field).toBe(columnToPin.field);
            expect(grid.pinnedColumns[1].field).toBe(columnToMove.field);

            moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            moveLeft.click();
            fix.detectChanges();

            moveLeft.click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(1);
            expect(grid.pinnedColumns[0].field).toBe(columnToPin.field);

            await fix.whenStable();
        });

        it('Should pin column when clicking buttons.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.getExcelFilteringPinContainer(fix).click();
            fix.detectChanges();

            expect(grid.pinnedColumns[0].field).toEqual('Downloads');
        });

        it('Should unpin column when clicking buttons.', async () => {
            grid.columnList.get(2).pinned = true;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.getExcelFilteringUnpinContainer(fix).click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
        });

        it('Should hide column when click on button.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            vi.spyOn(grid.columnVisibilityChanged, 'emit');
            vi.spyOn(grid.columnVisibilityChanging, 'emit');
            GridFunctions.getExcelFilteringHideContainer(fix).click();
            fix.detectChanges();

            const args = { column: grid.getColumnByName('Downloads'), newValue: true };
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledWith({ ...args, cancel: false });
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledWith(args);

            GridFunctions.verifyColumnIsHidden(grid.columnList.get(2), true, 7);
        });

        it('Should not select values in list if two values with And operator are entered.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());
        });

        it('Should show the previously entered filter value when reopen esf dialog from the applied filter operand', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            const ddItem = fix.nativeElement.querySelector('.igx-drop-down__item--selected');
            expect(ddItem).toBeDefined();
            expect(ddItem.outerText.toLowerCase()).toMatch('contains');

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();
            fix.detectChanges();

            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toEqual('Angular');
        });

        it('Should Not show the previously entered filter value when reopen esf dialog from other filterOperand', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            const ddItem = fix.nativeElement.querySelector('.igx-drop-down__item--selected');
            expect(ddItem).toBeDefined();
            expect(ddItem.outerText.toLowerCase()).toMatch('contains');

            GridFunctions.clickOperatorFromCascadeMenu(fix, 1);
            await fix.whenStable();
            fix.detectChanges();

            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toEqual('');
        });

        it('Should not select values in list if two values with Or operator are entered and contains operand.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'Ignite', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(2)');
            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            const ddItem = fix.nativeElement.querySelector('.igx-drop-down__item--selected');
            expect(ddItem).toBeDefined();
            expect(ddItem.querySelector('.igx-grid__filtering-dropdown-text').textContent).toMatch('Custom filter...');
        });

        it('Should select values in list if two values with Or operator are entered and they are in the list below.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

            fix.detectChanges();

            expect(checkboxes[0].checked && checkboxes[0].indeterminate).toBeTruthy();
            expect(!checkboxes[1].checked && !checkboxes[1].indeterminate).toBeTruthy();
            expect(!checkboxes[2].checked && !checkboxes[2].indeterminate).toBeTruthy();
            expect(checkboxes[3].checked && !checkboxes[3].indeterminate).toBeTruthy();
        });

        it('Should change filter when changing And/Or operator.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            await fix.whenStable();

            const andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            andButton.click();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(0);
        });

        it('Should change filter when changing operator.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            await fix.whenStable();

            // select second expression's operator
            await GridFunctions.setOperatorESF(fix, 1, 2);

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(5);
        });

        it('Should not be able to exit custom dialog when press tab on apply button', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const applyButton = GridFunctions.getApplyExcelStyleCustomFiltering(fix);
            applyButton.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(applyButton);

            UIInteractions.triggerKeyDownEvtUponElem('Tab', applyButton, true);
            fix.detectChanges();

            expect(document.activeElement).toBe(applyButton);
        });

        it('Should populate custom filter dialog.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('lessThan'), conditionName: 'lessThan' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            await fix.whenStable();

            // Verify inputs values
            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toEqual('254');
            expect(GridFunctions.getExcelFilteringInput(fix, 1).value).toEqual('20');

            // Verify Drop Down values
            expect(GridFunctions.getExcelFilteringDDInput(fix, 0).value).toEqual('Equals');
            expect(GridFunctions.getExcelFilteringDDInput(fix, 1).value).toEqual('Less Than');
        });

        it('Should display friendly conditions\' names in custom filter dialog.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 1);
            await fix.whenStable();

            const firstValue = GridFunctions.getExcelFilteringDDInput(fix, 0).value;

            expect(firstValue).toMatch('Does Not Contain');
        });

        it('Should clear the filter when click Clear filter item.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickClearFilterInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
        });

        it('Should clear filter when pressing \'Enter\' on the clear filter button in ESF.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'Ignite', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.filteredData.length).toEqual(2);

            const clearFilterButton = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            clearFilterButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
        });

        it('Should set the \'aria-disabled\' attribute for the ESF dialog clear filter button element with role=\'menuitem\'.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            expect(grid.filteredData).toBeNull();
            let clearFilterButtonMenuItemRole = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            expect(clearFilterButtonMenuItemRole.getAttribute('aria-disabled')).toBe('true');

            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'Ignite', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            expect(grid.filteredData.length).toEqual(2);
            clearFilterButtonMenuItemRole = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            expect(clearFilterButtonMenuItemRole.getAttribute('aria-disabled')).toBe('false');

            const clearFilterButton = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            clearFilterButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
            clearFilterButtonMenuItemRole = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            expect(clearFilterButtonMenuItemRole.getAttribute('aria-disabled')).toBe('true');
        });

        it('Should filter a time column by a single selected value with the \'at\' condition.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseTime');
            const search = fix.debugElement.query(By.directive(IgxExcelStyleSearchComponent)).componentInstance as IgxExcelStyleSearchComponent;
            const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const valueIndex = search.displayedListData.findIndex((item, i) => i > 0 && item.value !== null && item.value !== undefined);
            const selectedTime: Date = search.displayedListData[valueIndex].value;

            // deselect all and select a single value
            checkboxes[0].click();
            await fix.whenStable();
            fix.detectChanges();
            checkboxes[valueIndex].click();
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            const operands = (grid.filteringExpressionsTree.find('ReleaseTime') as IFilteringExpressionsTree).filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(1);
            expect(operands[0].conditionName).toBe('at');
            expect(grid.filteredData.length).toBeGreaterThan(0);
            grid.filteredData.forEach(r => expect(r.ReleaseTime.toLocaleTimeString()).toBe(selectedTime.toLocaleTimeString()));
        });

        it('Should filter a time column by the selected values with the \'in\' condition when many values are selected.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseTime');
            const search = fix.debugElement.query(By.directive(IgxExcelStyleSearchComponent)).componentInstance as IgxExcelStyleSearchComponent;
            const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const valueIndex = search.displayedListData.findIndex((item, i) => i > 0 && item.value !== null && item.value !== undefined);
            const deselectedTime: Date = search.displayedListData[valueIndex].value;

            // deselect a single value and keep the rest selected
            checkboxes[valueIndex].click();
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            const operands = (grid.filteringExpressionsTree.find('ReleaseTime') as IFilteringExpressionsTree).filteringOperands as IFilteringExpression[];
            const inOperand = operands.find(o => o.conditionName === 'in');
            expect(inOperand).toBeDefined();
            expect((inOperand.searchVal as Set<string>).has(deselectedTime.toLocaleTimeString())).toBe(false);
            expect(grid.filteredData.length).toBeGreaterThan(0);
            expect(grid.filteredData.some(r => r.ReleaseTime?.toLocaleTimeString() === deselectedTime.toLocaleTimeString())).toBe(false);
        });

        it('Should update filter icon when dialog is closed and the filter has been changed.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);

            checkbox[0].click();
            await fix.whenStable();
            fix.detectChanges();

            checkbox[2].click();
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(1);

            let filterIcon = GridFunctions.getExcelFilterIcon(fix, 'Downloads');
            expect(filterIcon).toBeNull();

            filterIcon = GridFunctions.getExcelFilterIconFiltered(fix, 'Downloads');
            expect(filterIcon).toBeDefined();
        });

        it('Should keep conditionName in sync when changing condition in ESF custom dialog.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Open custom dialog with 'contains' condition (index 0 in cascade menu for string column)
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // set first expression's value
            GridFunctions.setInputValueESF(fix, 0, 'Net');
            await fix.whenStable();

            // change first expression's operator from 'contains' to 'startsWith' (index 2 for string column)
            await GridFunctions.setOperatorESF(fix, 0, 2);
            await fix.whenStable();

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const operands =
                (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                    .filteringOperands as IFilteringExpression[];
            verifyFilteringExpression(operands[0], 'ProductName', 'startsWith', 'Net');
        });

        it('Should filter grid via custom dialog.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // set first expression's value
            GridFunctions.setInputValueESF(fix, 0, 0);
            await fix.whenStable();

            // select second expression's operator
            await GridFunctions.setOperatorESF(fix, 1, 1);
            await fix.whenStable();

            // set second expression's value
            GridFunctions.setInputValueESF(fix, 1, 20);
            await fix.whenStable();

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should filter grid via custom dialog - 3 expressions.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Released');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // select second expression's operator
            await GridFunctions.setOperatorESF(fix, 1, 1);

            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            fix.detectChanges();

            // select third expression's operator
            await GridFunctions.setOperatorESF(fix, 2, 4);

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(3);
        });

        it('Should clear filter from custom dialog.', async () => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            await fix.whenStable();

            GridFunctions.clickClearFilterExcelStyleCustomFiltering(fix);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData).toBeNull();
        });

        it('Should pin/unpin column when clicking pin/unpin icon in header', async () => {
            setElementSize(grid.nativeElement, ɵSize.Medium);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style filtering component and pin 'ProductName' column through header icon
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickPinIconInExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();
            // Verify Excel menu is closed
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();
            const column = grid.getColumnByName('ProductName');
            GridFunctions.verifyColumnIsPinned(column, true, 1);

            // Open excel style filtering component and UNpin 'ProductName' column through header icon
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickPinIconInExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.verifyColumnIsPinned(column, false, 0);
        });

        it('Should hide column when clicking hide icon in header', async () => {
            setElementSize(grid.nativeElement, ɵSize.Small);
            await fix.whenStable();
            fix.detectChanges();
            vi.spyOn(grid.columnVisibilityChanging, 'emit');
            vi.spyOn(grid.columnVisibilityChanged, 'emit');

            const column = grid.columnList.find((col) => col.field === 'ProductName');
            GridFunctions.verifyColumnIsHidden(column, false, 8);

            // Open excel style filtering component and hide 'ProductName' column through header icon
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            GridFunctions.clickHideIconInExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Verify Excel menu is closed
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();
            const args = { column, newValue: true };
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledWith({ ...args, cancel: false });
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledWith(args);
        });

        it('Should move pinned column correctly by using move buttons', async () => {
            grid.moving = true;
            const productNameCol = grid.getColumnByName('ProductName');
            const idCol = grid.getColumnByName('ID');
            productNameCol.pinned = true;
            idCol.pinned = true;
            fix.detectChanges();

            expect(productNameCol.pinned).toBe(true);

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            // Move 'ProductName' one step to the right. (should move)
            let moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];
            UIInteractions.simulateClickEvent(moveRight);
            await fix.whenStable();
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ID');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 1).innerText).toBe('ProductName');
            expect(productNameCol.pinned).toBe(true);

            // Move 'ProductName' one step to the left. (should move)
            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            UIInteractions.simulateClickEvent(moveLeft);
            await fix.whenStable();
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 1).innerText).toBe('ID');
            expect(productNameCol.pinned).toBe(true);

            // Try move 'ProductName' one step to the left. (Button should be disabled since it's already first)
            const moveComponent = GridFunctions.getExcelFilteringMoveComponent(fix);
            ControlsFunction.verifyButtonIsDisabled(moveComponent.querySelectorAll('button')[0]);

            // Move 'ProductName' two steps to the right. (should move)
            moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];
            UIInteractions.simulateClickEvent(moveRight);
            await fix.whenStable();
            fix.detectChanges();
            UIInteractions.simulateClickEvent(moveRight);
            await fix.whenStable();
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ID');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 1).innerText).toBe('ProductName');
            expect(productNameCol.pinned).toBe(false);
        });

        it('Should move unpinned column correctly by using move buttons', async () => {
            grid.moving = true;
            const productNameCol = grid.getColumnByName('ProductName');
            const downloadsCol = grid.getColumnByName('Downloads');
            productNameCol.pinned = true;
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 2).innerText).toBe('Downloads');
            expect(downloadsCol.pinned).toBe(false);

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            UIInteractions.simulateClickEvent(moveLeft);
            await fix.whenStable();
            fix.detectChanges();
            UIInteractions.simulateClickEvent(moveLeft);
            await fix.whenStable();
            fix.detectChanges();

            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 1).innerText).toBe('Downloads');
            expect(downloadsCol.pinned).toBe(true);
        });

        it('Should filter and clear the excel search component correctly', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await wait(100);
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);

            // Type string in search box.
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'ignite', fix);
            fix.detectChanges();
            await wait(100);

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(4);

            // Clear filtering of ESF search.
            const clearIcon: any = Array.from(searchComponent.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'clear');
            clearIcon.click();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);
        });

        it('Should use the list content height for the virtual container size', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await wait(100);

            const searchComponent = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            const listElement = searchComponent.list.element.nativeElement;
            listElement.style.border = '1px solid transparent';
            await searchComponent.virtualScroll.layoutComplete;
            fix.detectChanges();

            const scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix) as HTMLElement;
            expect(listElement.offsetHeight).toBeGreaterThan(listElement.clientHeight);
            // The virtual scroll takes the height the list has left for it, borders excluded.
            expect(scroller.clientHeight).toBe(listElement.clientHeight);
        });

        it('Should size the scrollable extent from the rendered row height', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await wait(100);

            const searchComponent = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await searchComponent.virtualScroll.layoutComplete;
            fix.detectChanges();

            const rows = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            const rowHeight = rows[0].getBoundingClientRect().height;
            const track = GridFunctions.getExcelStyleSearchComponent(fix)
                .querySelector('.igx-virtual-scroll__track') as HTMLElement;

            // Few enough values that the list renders all of them, so the extent is their
            // measured height. A virtualized collection keeps the estimate for the rest.
            expect(rowHeight).toBeGreaterThan(0);
            expect(Number.parseFloat(track.style.height))
                .toBeCloseTo(searchComponent.displayedListData.length * rowHeight, 0);
        });

        it('Should allow to input commas in excel search component input field when column dataType is number.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            fix.detectChanges();
            await wait(100);
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            // Type 1,000 in search box.
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '1,000', fix);
            fix.detectChanges();
            await wait(100);

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(3);

            // Type non-numerical symbol in search box.
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'a', fix);
            fix.detectChanges();
            await wait(100);

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(inputNativeElement.value, 'incorrect rendered list items count').toBe('');
            expect(listItems.length, 'incorrect rendered list items count').toBe(9);
        });

        it('Should match numeric column values when searching without locale-specific formatting characters.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            fix.detectChanges();
            await wait(100);
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            // Type 1000 (without thousands separator) in search box.
            // The value 1000 is displayed as "1,000" in the ESF list due to locale formatting.
            // Searching "1000" should still match the "1,000" entry.
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '1000', fix);
            fix.detectChanges();
            await wait(100);

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            // Expect 3 items: Select All + Add to current filter + the matched "1,000" item
            expect(listItems.length, 'searching plain number should match locale-formatted label').toBe(3);
        });

        it('Should enable/disable the apply button correctly.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await wait(100);
            // Verify there are filtered-in results and that apply button is enabled.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            let applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix) as HTMLElement;
            expect(listItems.length, 'ESF search result should NOT be empty').toBe(6);
            ControlsFunction.verifyButtonIsDisabled(applyButton, false);

            // Verify the apply button is disabled when all items are unchecked (when unchecking 'Select All').
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkbox[0].click(); // Select All
            fix.detectChanges();
            await wait(100);
            applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix);
            ControlsFunction.verifyButtonIsDisabled(applyButton);
        });

        it('size is properly applied on the excel style filtering component', async () => {
            const column = grid.columnList.find((c) => c.field === 'ProductName');
            column.sortable = true;
            grid.moving = true;
            fix.detectChanges();

            // Open excel style filtering component and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            verifyExcelStyleFilteringSize(fix, ɵSize.Large);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Small);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style filtering component and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilteringSize(fix, ɵSize.Small);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Medium);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style filtering component and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilteringSize(fix, ɵSize.Medium);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
        });

        it('size is properly applied on the column selection container', async () => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            let columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            let headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);

            expect(columnSelectionContainer).not.toBeNull();
            expect(headerIcons.length).toEqual(0);

            setElementSize(grid.nativeElement, ɵSize.Small);
            fix.detectChanges();

            columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);
            const columnSelectionIcon = headerIcons.find((bi: any) => bi.innerText === 'done');

            expect(columnSelectionContainer.tagName).toEqual('DIV');
            expect(columnSelectionIcon).not.toBeNull();

        });

        it('size is properly applied on the excel style custom filtering dialog', async () => {
            const column = grid.columnList.find((c) => c.field === 'ProductName');
            column.sortable = true;
            grid.moving = true;
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its size
            setElementSize(grid.nativeElement, ɵSize.Large);
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterSize(fix, ɵSize.Large);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            setElementSize(grid.nativeElement, ɵSize.Medium);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterSize(fix, ɵSize.Medium);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            setElementSize(grid.nativeElement, ɵSize.Small);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterSize(fix, ɵSize.Small);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
        });

        it('size is properly applied on the excel style cascade dropdown', async () => {
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;

            // Open excel style cascade operators dropdown and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            verifyGridSubmenuSize(gridNativeElement, ɵSize.Large);

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Medium);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style cascade operators dropdown and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            verifyGridSubmenuSize(gridNativeElement, ɵSize.Medium);

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Small);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style cascade operators dropdown and verify its size
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            verifyGridSubmenuSize(gridNativeElement, ɵSize.Small);
        });

        it('size is properly applied on the excel custom dialog\'s default expression dropdown', async () => {
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;

            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Click the left input to open the operators dropdown and verify its size.
            let conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0);
            conditionsInput.click();
            await fix.whenStable();
            fix.detectChanges();

            verifyGridSubmenuSize(gridNativeElement, ɵSize.Large);
            GridFunctions.clickCancelExcelStyleCustomFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Change size
            setElementSize(grid.nativeElement, ɵSize.Medium);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Click the left input to open the operators dropdown and verify its size.
            conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0);
            conditionsInput.click();
            await fix.whenStable();
            fix.detectChanges();

            verifyGridSubmenuSize(gridNativeElement, ɵSize.Medium);
        });

        it('size is properly applied on the excel custom dialog\'s date expression dropdown', async () => {
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Click the left input to open the operators dropdown and verify its size.
            let conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0, true);
            conditionsInput.click();
            await fix.whenStable();
            fix.detectChanges();

            verifyGridSubmenuSize(gridNativeElement, ɵSize.Large);

            GridFunctions.clickCancelExcelStyleCustomFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Change size
            setElementSize(grid.nativeElement, ɵSize.Medium);
            await fix.whenStable();
            fix.detectChanges();

            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Click the left input to open the operators dropdown and verify its size.
            conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0, true);
            conditionsInput.click();
            await fix.whenStable();
            fix.detectChanges();
            verifyGridSubmenuSize(gridNativeElement, ɵSize.Medium);
        });

        it('Should include \'false\' value in results when searching.', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Released');

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'false', fix);
            await fix.whenStable();
            fix.detectChanges();

            // Verify that the first item is 'Select All' and the third item is 'false'.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(3);
            expect(listItems[0].innerText).toBe('Select all search results');
            expect(listItems[2].innerText).toBe('False');
        });

        it('should render the search list in the pass that delivers its values', async () => {
            // Opened directly: the shared helper settles before it returns.
            const event = { stopPropagation: () => { }, preventDefault: () => { } } as any;
            grid.getColumnByName('ProductName').headerCell.onFilteringIconClick(event);
            fix.detectChanges();

            // The menu is up and measurable, but the column values are still being collected.
            const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeTruthy();
            expect(search.displayedListData.length).toBe(0);
            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBe(0);

            // The values arrive and render in the same pass - no extra pass to measure the viewport.
            await wait();
            fix.detectChanges();

            expect(search.displayedListData.length).toBeGreaterThan(0);
            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length)
                .toBe(search.displayedListData.length);
        });

        it('should go through an empty result and back without an expression error', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            // The list telling its wrapper it is empty, and then that it is not, has to
            // settle within one pass; NG0100 would fail this test on its own.
            UIInteractions.clickAndSendInputElementValue(input, 'nothing matches this', fix);
            await fix.whenStable();
            fix.detectChanges();
            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBe(0);

            UIInteractions.clickAndSendInputElementValue(input, '', fix);
            await fix.whenStable();
            fix.detectChanges();
            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBeGreaterThan(0);
        });

        it('should stop naming a row once the list has none left', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();

            const searchComponent = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await searchComponent.virtualScroll.layoutComplete;
            fix.detectChanges();

            const searchElement = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchElement.querySelector('igx-list') as HTMLElement;
            list.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(list);

            const named = list.getAttribute('aria-activedescendant');
            expect(named).toBeTruthy();
            expect(searchElement.querySelector(`#${named}`)).toBeTruthy();

            // Filtering to nothing takes every row away while the list still has focus.
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchElement);
            UIInteractions.clickAndSendInputElementValue(input, 'nothing matches this', fix);
            fix.detectChanges();
            await searchComponent.virtualScroll.layoutComplete;
            fix.detectChanges();

            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBe(0);

            // The rows went away underneath a list that still holds focus.
            expect(document.activeElement).toBe(list);

            const left = list.getAttribute('aria-activedescendant');
            expect(left).toBeFalsy();
            expect(left ? searchElement.querySelector(`#${left}`) : null).toBeNull();
        });

        it('should name the keyboard focused row after an empty search is cleared', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();

            const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            // From here real events detect their own changes, the way an application does.
            fix.autoDetectChanges();
            const settle = async () => {
                await fix.whenStable();
                await search.virtualScroll.layoutComplete;
                await fix.whenStable();
            };

            const searchElement = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = search.list.element.nativeElement as HTMLElement;
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchElement);

            // Search for something no row matches, then take the search back out.
            const searchAndClear = async () => {
                input.value = 'nothing matches this';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                await settle();

                expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBe(0);

                input.value = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                await settle();

                expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBeGreaterThan(0);
            };

            // An empty list is a different height, so the first round resizes the viewport.
            // The second brings rows back to a window already reported.
            await searchAndClear();
            await searchAndClear();

            list.focus();
            await settle();

            expect(document.activeElement).toBe(list);

            list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();

            // The named row has to be the one the focus is drawn on.
            const named = list.getAttribute('aria-activedescendant');
            expect(named).toBeTruthy();
            expect(searchElement.querySelector(`#${named}`)).toBeTruthy();
            expect(list.querySelector('.igx-list__item-base--active')?.id).toBe(named);
        });

        it('should keep the rendered rows when the size changes', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            const before = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            const beforeHeight = before[0].getBoundingClientRect().height;

            setElementSize(grid.nativeElement, ɵSize.Small);
            await wait(100);
            fix.detectChanges();

            const after = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(after.length).toBeGreaterThan(0);
            expect(after[0].getBoundingClientRect().height).toBeLessThan(beforeHeight);
        });

        it('should scroll items in search list correctly', async () => {
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

            setElementSize(grid.nativeElement, ɵSize.Small);
            await wait(100);
            fix.detectChanges();

            // Open excel style filtering component
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(100);
            fix.detectChanges();

            // Scroll the search list to the bottom.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            scrollbar.scrollTop = 3000;
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar's scrollTop.
            expect(scrollbar.scrollTop >= 740 && scrollbar.scrollTop <= 800,
                'search scrollbar has incorrect scrollTop: ' + scrollbar.scrollTop).toBe(true);
            // Verify the rendered window covers the viewport.
            const displayContainer = searchComponent.querySelector('.igx-virtual-scroll__content');
            const displayContainerRect = displayContainer.getBoundingClientRect();
            const listHeight = searchComponent.querySelector('igx-list').getBoundingClientRect().height;
            const itemHeight = displayContainer.querySelector('igx-list-item').getBoundingClientRect().height;
            // Verify rendered list items count: the visible rows plus the over-scan buffer
            // on each side, which is 2 items by default.
            const listItems = displayContainer.querySelectorAll('igx-list-item');
            const visibleItems = Math.ceil(listHeight / itemHeight);
            expect(listItems.length, 'too few rendered list items').toBeGreaterThanOrEqual(visibleItems);
            expect(listItems.length, 'too many rendered list items').toBeLessThanOrEqual(visibleItems + 5);
            expect(displayContainerRect.height).toBeGreaterThanOrEqual(listHeight);
            expect(displayContainerRect.height).toBeLessThanOrEqual(listItems.length * itemHeight);
        });

        it('should focus the first row the viewport shows, not the over-scanned one', async () => {
            for (let index = 0; index < 30; index++) {
                grid.addRow({
                    Downloads: index, ID: index + 100, ProductName: 'New Product ' + index,
                    ReleaseDate: new Date(), Released: false, AnotherField: 'z'
                });
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            await fix.whenStable();

            const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);

            // Half a row down, so the first row on screen is cut by the viewport edge.
            const rowHeight = GridFunctions.getExcelStyleSearchComponentListItems(fix)[0]
                .getBoundingClientRect().height;
            scroller.scrollTop = rowHeight * 10 + rowHeight / 2;
            scroller.dispatchEvent(new Event('scroll'));
            fix.detectChanges();
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            const list = searchComponent.querySelector('igx-list') as HTMLElement;
            list.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(list);

            // The window reaches above the viewport, so this must be the first row on screen.
            const named = list.getAttribute('aria-activedescendant');
            const focused = searchComponent.querySelector(`#${named}`) as HTMLElement;
            expect(focused).toBeTruthy();

            const viewportTop = scroller.getBoundingClientRect().top;
            const focusedBox = focused.getBoundingClientRect();

            // Cut by the top edge rather than below it: a partial row still counts as shown.
            expect(focusedBox.bottom).toBeGreaterThan(viewportTop);
            expect(focusedBox.top).toBeLessThan(viewportTop);

            // Nothing above it reaches the viewport, so it is the first that does.
            const rows = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            const above = rows.slice(0, rows.indexOf(focused));
            expect(above.length).toBeGreaterThan(0);
            for (const row of above) {
                expect(row.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewportTop + 1);
            }
        });

        it('should never name a row that is not rendered', async () => {
            for (let index = 0; index < 30; index++) {
                grid.addRow({
                    Downloads: index, ID: index + 100, ProductName: 'New Product ' + index,
                    ReleaseDate: new Date(), Released: false, AnotherField: 'z'
                });
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            await fix.whenStable();

            const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchComponent.querySelector('igx-list') as HTMLElement;
            list.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            const focusedFirst = list.getAttribute('aria-activedescendant');
            expect(focusedFirst).toBeTruthy();

            // Scrolling recycles the wrappers, so the element the listbox names is taken away
            // underneath it.
            const scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            scroller.scrollTop = 3000;
            scroller.dispatchEvent(new Event('scroll'));
            fix.detectChanges();
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            expect(searchComponent.querySelector(`#${focusedFirst}`)).toBeNull();
            expect(list.getAttribute('aria-activedescendant')).toBeFalsy();
        });

        it('should correctly display all items in search list after filtering it', async () => {
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
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const displayContainer = searchComponent.querySelector('.igx-virtual-scroll__content') as HTMLElement;
            const scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            scrollbar.scrollTop = displayContainer.getBoundingClientRect().height / 2;
            await wait(200);
            fix.detectChanges();
            await wait(100);

            // Type string in search box
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'sale', fix);
            await wait(200);
            fix.detectChanges();

            // Verify the display container is within the bounds of the list
            const displayContainerRect = displayContainer.getBoundingClientRect();
            const listNativeElement = searchComponent.querySelector('.igx-list');
            const listRect = listNativeElement.getBoundingClientRect();
            expect(displayContainerRect.top >= listRect.top, 'displayContainer starts above list').toBe(true);
            expect(displayContainerRect.bottom <= listRect.bottom, 'displayContainer ends below list').toBe(true);
        });

        it('Should not treat \'Select All\' as a search result.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await wait(100);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, excelMenu);
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6);

            UIInteractions.clickAndSendInputElementValue(input, 'a', fix);
            await wait(100);
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(5);

            UIInteractions.clickAndSendInputElementValue(input, 'al', fix);
            await wait(100);
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(0);
        });

        it('Column formatter should skip the \'SelectAll\' list item', async () => {
            grid.columnList.get(4).formatter = (val: Date) => new Intl.DateTimeFormat('bg-BG').format(val);
            grid.cdr.detectChanges();

            // Open excel style filtering component
            try {
                await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');
            } catch (ex) {
                expect(ex).toBeNull();
            }

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[0].innerText).toBe('Select All');
        });

        it('should keep newly added filter expression in view', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Click 'Add Filter' button.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            await fix.whenStable();

            // Verify last expression is currently in view inside the expressions container.
            const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
            const expressionsContainer = customFilterMenu.querySelector('.igx-excel-filter__secondary-main');
            const expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
            const lastExpression = expressions[expressions.length - 1];
            const lastExpressionRect = lastExpression.getBoundingClientRect();
            const expressionsContainerRect = expressionsContainer.getBoundingClientRect();
            expect(lastExpressionRect.top >= expressionsContainerRect.top, 'lastExpression starts above expressionsContainer').toBe(true);
            expect(lastExpressionRect.bottom <= expressionsContainerRect.bottom, 'lastExpression ends below expressionsContainer').toBe(true);

            // Verify addFilter button is currently in view beneath the last expression.
            const addFilterButton = GridFunctions.getAddFilterExcelStyleCustomFiltering(fix);
            const addFilterButtonRect = addFilterButton.getBoundingClientRect();
            expect(addFilterButtonRect.top >= lastExpressionRect.bottom, 'addFilterButton overlaps lastExpression').toBe(true);
            expect(addFilterButtonRect.bottom <= expressionsContainerRect.bottom, 'addFilterButton ends below expressionsContainer').toBe(true);
        });

        it('Should generate "equals" conditions when selecting two values.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(2);
            const operands = (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'equals', 'Ignite UI for Angular');
            verifyFilteringExpression(operands[1], 'ProductName', 'equals', 'Ignite UI for JavaScript');
        });

        it('Should generate "in" condition when selecting more than two values.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            checkbox[4].click(); // NetAdvantage
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(3);
            const operands = (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(1);
            verifyFilteringExpression(operands[0], 'ProductName', 'in', new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage']));
        });

        it('Should not throw error when selecting more than two values and column dataType is date.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[2].click();
            checkbox[3].click();
            checkbox[4].click();
            checkbox[6].click();
            await fix.whenStable();
            fix.detectChanges();

            expect(() => {
                GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            }).not.toThrowError();
        });

        it('Should generate "in" and "empty" conditions when selecting more than two values including (Blanks).', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[1].click(); // (Blanks)
            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(6);
            const operands = (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'in', new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript']));
            verifyFilteringExpression(operands[1], 'ProductName', 'empty', null);
        });

        it('should not display search scrollbar when not needed for the current size', async () => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.getCellByColumn(3, 'ProductName').update('Test');
            fix.detectChanges();

            // Verify scrollbar is visible for 'comfortable'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix), 'excel search scrollbar should be visible').toBe(true);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Medium);
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'cosy'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix), 'excel search scrollbar should NOT be visible').toBe(false);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Small);
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'compact'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix), 'excel search scrollbar should NOT be visible').toBe(false);
        });

        it('Should cascade filter the available filter options.', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', '0', '20', '100', '127', '254', '702', '1,000'],
                [true, true, true, true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', 'Some other item with Script'], [true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'False', 'True'], [true, true, true, true]);

            await toggleExcelStyleFilteringItems(fix, true, 3);

            expect(grid.rowList.length).toBe(5);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'False', 'True'], [null, true, true, false]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '100', '254', '702', '1,000'], [true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'], [true, true, true, true, true]);

            await toggleExcelStyleFilteringItems(fix, false, 0);
            await toggleExcelStyleFilteringItems(fix, true, 2, 3);

            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'False'], [true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'], [null, false, true, true, false]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '254'], [true, true, true]);
        });

        it('Should correctly modify existing filters.', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', 'Some other item with Script'], [true, true, true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1, 5);
            expect(grid.rowList.length).toBe(3);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 2);
            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'], [true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [null, true, false, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1, 2, 3);
            expect(grid.rowList.length).toBe(1);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [null, false, true, false]);
        });

        it('Should correctly modify the first one of the existing filters.', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', 'Some other item with Script'], [true, true, true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1, 5);
            expect(grid.rowList.length).toBe(3);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 2);
            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'], [true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1);
            expect(grid.rowList.length).toBe(1);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '254'], [true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'], [null, false, true]);
        });

        it('Should display the ESF based on the filterIcon within the grid', async () => {
            // Test prerequisites
            grid.width = '800px';
            for (const column of grid.columnList) {
                column.width = '300px';
            }
            await wait(16);
            fix.detectChanges();

            // Scroll a bit to the right, so the ProductName column is not fully visible.
            GridFunctions.scrollLeft(grid, 500);
            await wait(100);
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();

            // Verify that the left, top and right borders of the ESF are within the grid.
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const gridRect = gridNativeElement.getBoundingClientRect();
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const excelMenuRect = excelMenu.getBoundingClientRect();
            expect(excelMenuRect.left >= gridRect.left, 'ESF spans outside the grid on the left').toBe(true);
            expect(excelMenuRect.top >= gridRect.top, 'ESF spans outside the grid on the top').toBe(true);
            expect(excelMenuRect.right <= gridRect.right, 'ESF spans outside the grid on the right').toBe(true);
        });

        it('Should add/remove expressions in custom filter dialog through UI correctly.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Verify expressions count.
            let expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
            expect(expressions.length).toBe(2);

            // Add two new expressions.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Verify expressions count.
            expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
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
            expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
            expect(expressions.length).toBe(2);
        });

        it('Should keep selected operator of custom expression the same when clicking it.', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Verify 'And' button is selected on first expression.
            let andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            ControlsFunction.verifyButtonIsSelected(andButton);

            // Click the 'And' button.
            andButton.click();
            await fix.whenStable();
            fix.detectChanges();

            // Verify that selected button remains the same.
            andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            ControlsFunction.verifyButtonIsSelected(andButton);

            const orButton = GridFunctions.getExcelCustomFilteringExpressionOrButton(fix);
            ControlsFunction.verifyButtonIsSelected(orButton, false);
        });

        it('Should select the button operator in custom expression when pressing \'Enter\' on it.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await wait(200);

            const andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            const orButton = GridFunctions.getExcelCustomFilteringExpressionOrButton(fix);

            // Verify 'and' is selected.
            ControlsFunction.verifyButtonIsSelected(andButton);
            ControlsFunction.verifyButtonIsSelected(orButton, false);

            // Press 'Enter' on 'or' button and verify it gets selected.
            UIInteractions.triggerKeyDownEvtUponElem('Enter', orButton, true);
            await wait();
            fix.detectChanges();

            ControlsFunction.verifyButtonIsSelected(andButton, false);
            ControlsFunction.verifyButtonIsSelected(orButton);

            // Press 'Enter' on 'and' button and verify it gets selected.
            UIInteractions.triggerKeyDownEvtUponElem('Enter', andButton, true);
            await wait();
            fix.detectChanges();

            ControlsFunction.verifyButtonIsSelected(andButton);
            ControlsFunction.verifyButtonIsSelected(orButton, false);
        });

        it('Should open conditions dropdown of custom expression with \'Alt + Arrow Down\'.', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[0];
            const conditionsInput = GridFunctions.getExcelFilteringDDInput(fix);

            // Dropdown should be hidden.
            let operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).not.toBeNull();

            // Press 'Alt + Arrow Down' to open operators dropdown.
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', conditionsInput, true, true);
            await fix.whenStable();
            fix.detectChanges();

            // Dropdown should be visible.
            operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).toBeNull();

            // Click-off to close dropdown.
            expr.click();
            await fix.whenStable();
            fix.detectChanges();

            // Dropdown should be hidden.
            operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).not.toBeNull();
        });

        it('Should open calendar when clicking date-picker of custom expression.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');

            // Verify calendar is not opened.
            let calendar = expr.querySelector('igx-calendar');
            expect(calendar).toBeNull();

            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();
            expect(datePicker).not.toBeNull();

            // Verify calendar is opened.
            calendar = grid.nativeElement.querySelector('igx-calendar');
            expect(calendar).not.toBeNull();

            // Click-off to close calendar.
            expr.click();
            await fix.whenStable();
            fix.detectChanges();

            // Verify calendar is not opened.
            calendar = fix.debugElement.query(By.directive(IgxCalendarComponent));
            expect(calendar).toBeNull();
        });

        it('Should filter grid through custom date filter dialog.', async () => {
            const column = grid.getColumnByName('ReleaseDate');
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).not.toContain('(');
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should properly scroll to prev/next period in custom date filter dialog.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Reopen calender and click previous month button.
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            const prevMonthButton = fix.debugElement.queryAll(By.css(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS))[0].nativeElement;
            prevMonthButton.focus();
            UIInteractions.simulateMouseEvent("mousedown", prevMonthButton, 0, 0);
            await fix.whenStable();
            UIInteractions.simulateMouseEvent("mouseup", prevMonthButton, 0, 0);
            fix.detectChanges();

            // Verify the calendar is scrolled to previous month.
            const headerLabel = document.querySelector('igx-calendar').querySelector('.igx-calendar-picker__date') as HTMLElement;
            const today = new Date();
            const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const monthName = prevMonth.toLocaleString('default', { month: 'short' });
            expect(headerLabel.innerText.trim()).toMatch(`${monthName}`);
        });

        it('Should take pipeArgs weekStart property as calendar\'s default.', async () => {
            const column = grid.getColumnByName('ReleaseDate');

            column.pipeArgs = {
                digitsInfo: '3.4-4',
                currencyCode: 'USD',
                display: 'symbol-narrow',
                weekStart: 5,
            };
            fix.detectChanges();

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Get Calendar component.
            const calendar = document.querySelector('igx-calendar');

            const daysOfWeek = calendar.querySelector('.igx-days-row');
            const weekStart = daysOfWeek.firstElementChild as HTMLSpanElement;

            expect(weekStart.innerText).toMatch('Fri');
        });

        it('Should filter grid with ISO 8601 dates through custom date filter dialog', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();
            const column = grid.getColumnByName('ReleaseDate');

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should filter grid with milliseconds dates through custom date filter dialog', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();
            const column = grid.getColumnByName('ReleaseDate');

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('DateTime: Should use editorOptions.dateTimeFormat as inputFormat to the filter editor in the custom filtering dialog', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });
            const column = grid.getColumnByName('ReleaseDateTime');
            column.editorOptions = {
                dateTimeFormat: 'dd-MM-yyyy HH:mm aaaaa'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditor = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat).toMatch(column.editorOptions.dateTimeFormat);
            expect(dateTimeEditor.displayFormat).toMatch(column.pipeArgs.format);
        });

        it('DateTime: Should use pipeArgs.format as inputFormat to the filter editor in the custom filtering dialog if editorOptions.dateTimeFormat not set', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });
            const column = grid.getColumnByName('ReleaseDateTime');
            column.pipeArgs = {
                format: 'dd-MM-yyyy'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat.normalize('NFKC')).toMatch('dd-MM-yyyy');
            expect(dateTimeEditorDirective.displayFormat.normalize('NFKC')).toMatch('dd-MM-yyyy');
        });

        it('DateTime: custom filtering dialog input locale should be set as the grid locale', async () => {
            registerLocaleData(localeBg, 'bg');
            grid.locale = 'bg';
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.locale).toMatch(grid.locale);
        });

        it('Time: Should use editorOptions.dateTimeFormat as inputFormat to the filter editor in the custom filtering dialog', async () => {
            const column = grid.getColumnByName('ReleaseTime');
            column.editorOptions = {
                dateTimeFormat: 'HH:mm'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat).toMatch(column.editorOptions.dateTimeFormat);
            expect(dateTimeEditorDirective.displayFormat).toMatch(column.pipeArgs.format);
        });

        it('Time: Should use pipeArgs.format as inputFormat to the filter editor in the custom filtering dialog if editorOptions.dateTimeFormat not set', async () => {
            const column = grid.getColumnByName('ReleaseTime');
            column.pipeArgs = {
                format: 'HH:mm'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat).toMatch(column.pipeArgs.format);
            expect(dateTimeEditorDirective.displayFormat).toMatch(column.pipeArgs.format);
        });
        it('Should filter grid through custom date filter dialog when using pipeArgs for the column', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });

            const formatOptions = {
                timezone: 'utc',
            };
            const column = grid.getColumnByName('ReleaseDate');
            column.pipeArgs = formatOptions;
            fix.detectChanges();

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should filter grid through custom date filter dialog when using pipeArgs and formatter for the column', async () => {
            const pipe = new DatePipe('fr-FR');
            const formatOptions = {
                timezone: 'utc',
                format: 'longDate'
            };
            const column = grid.getColumnByName('ReleaseDate');
            column.pipeArgs = formatOptions;
            grid.getColumnByName('ReleaseDate').formatter = ((value: any) => {
                const val = value !== null && value !== undefined && value !== '' ? pipe.transform(value, 'longDate') : 'No value!';
                return val;
            });
            fix.detectChanges();

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();
            await fix.whenStable(); // calendar animationDone timeout

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const cellText = column.formatter(filteredDate, null);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should correctly update \'SelectAll\' based on checkboxes.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const visibleListItems = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const thirdItemCbInput = visibleListItems[2];

            // Verify 'Select All' checkbox is not indeterminate.
            const selectAllCheckbox = visibleListItems[0];
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement);

            // Uncheck third list item.
            UIInteractions.simulateClickEvent(thirdItemCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify 'Select All' checkbox is indeterminate.
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement, true, true);

            // Check third list item again.
            UIInteractions.simulateClickEvent(thirdItemCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify 'Select All' checkbox is not indeterminate.
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement);
        });

        it('Should correctly update all items based on \'SelectAll\' checkbox.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const visibleListItems = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const dataListItems = visibleListItems.slice(1, visibleListItems.length);

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement);
            }

            // Click 'Select All' checkbox.
            let selectAllCbInput = visibleListItems[0];
            UIInteractions.simulateClickEvent(selectAllCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify all visible data list items are unchecked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement, false);
            }

            // Click 'Select All' checkbox.
            selectAllCbInput = visibleListItems[0];
            UIInteractions.simulateClickEvent(selectAllCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement);
            }
        });

        it('Should correctly update all \'SelectAll\' checkbox when not a single item is checked.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Released');
            fix.detectChanges();
            await wait(100);

            const visibleListItems = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            expect(visibleListItems.length).toBe(4);

            // Verify 'Select All' checkbox is checked.
            ControlsFunction.verifyCheckboxState(visibleListItems[0].parentElement);


            // Uncheck second, third and fourth list items.
            const secondListItemCbInput = visibleListItems[1];
            const thirdListItemCbInput = visibleListItems[2];
            const fourthListItemCbInput = visibleListItems[3];
            secondListItemCbInput.click();
            fix.detectChanges();
            thirdListItemCbInput.click();
            fix.detectChanges();
            fourthListItemCbInput.click();
            fix.detectChanges();

            // Verify 'Select All' checkbox is unchecked.
            ControlsFunction.verifyCheckboxState(visibleListItems[0].parentElement, false);
        });

        it('Should open custom filter dropdown when pressing \'Enter\' on custom filter cascade button.', async () => {
            grid.width = '700px';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await fix.whenStable();
            fix.detectChanges();

            const cascadeButton = GridFunctions.getExcelFilterCascadeButton(fix);

            // Verify that custom filter dropdown (the submenu) is not visible.
            let subMenu = fix.nativeElement.querySelector('.igx-drop-down.igx-toggle--hidden');
            expect(subMenu).not.toBeNull();

            cascadeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();


            // Verify that custom filter dropdown (the submenu) is visible.
            subMenu = fix.nativeElement.querySelector('.igx-drop-down.igx-toggle--hidden');
            expect(subMenu).toBeNull();
        });

        it('Should close ESF when pressing \'Escape\'.', async () => {
            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            // Verify ESF is not visible.
            expect(excelMenu).toBeNull();

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();

            // Verify ESF is visible.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();

            excelMenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();

            // Verify ESF is not visible.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();
        });

        it('Should open/close ESF menu for respective column when pressing \'ctrl + shift + l\' on its filterCell chip.', async () => {
            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            // Verify ESF is not visible.
            expect(excelMenu).toBeNull();

            const downloadsColumn = GridFunctions.getColumnHeader('Downloads', fix);
            UIInteractions.simulateClickAndSelectEvent(downloadsColumn);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('l', downloadsColumn.nativeElement, true, false, true, true);
            await fix.whenStable();
            fix.detectChanges();

            // Verify ESF menu is opened for the 'Downloads' column.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();

            // Press the combination again.
            UIInteractions.triggerKeyDownEvtUponElem('l', excelMenu, true, false, true, true);
            await fix.whenStable();
            fix.detectChanges();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();
        });

        it('Should filter ISO 8601 dates for date column ignoring the time portion - issue #14643', async () => {
            // Add hours part to the ReleaseDate so some records differ only by the time portion
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;

                if (rec.ReleaseDate) {
                    const date = new Date(rec.ReleaseDate);
                    date.setHours(date.getHours() + Math.floor(Math.random() * 24));
                    newRec.ReleaseDate = date.toISOString();
                } else {
                    newRec.ReleaseDate = null;
                }

                return newRec;
            });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu)[1];

            checkbox.click();
            await fix.whenStable();
            fix.detectChanges();

            const applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix);
            applyButton.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(applyButton);

            UIInteractions.simulateClickEvent(applyButton);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            const cell1 = GridFunctions.getRowCells(fix, 0)[4].nativeElement;
            const cell2 = GridFunctions.getRowCells(fix, 3)[4].nativeElement;
            expect(cell1.textContent.toString()).toEqual(cell2.textContent.toString());
            expect(rows.length, 'incorrect number of rows').toBe(6);

            //Check if checkboxes have correct state on ESF menu reopening
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix));
            expect(checkboxes[0].indeterminate).toBe(true);
            expect(checkboxes[1].checked).toBe(false);
            const listItemsCheckboxes = checkboxes.slice(2, checkboxes.length - 1);
            for (const checkboxItem of listItemsCheckboxes) {
                ControlsFunction.verifyCheckboxState(checkboxItem.parentElement);
            }
        });

        it('Should filter date by input string', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
        });

        it('Should filter ISO 8601 date by input string', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
        });

        it('Should filter milliseconds date by input string', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
        });

        it('Should ignore duplicate records when column\'s filteringIgnoreCase is true', async () => {
            const column = grid.getColumnByName('AnotherField');
            expect(column.filteringIgnoreCase).toBe(true);

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await fix.whenStable();
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'a', 'Custom'], [true, true, true]);
        });

        it('Should not ignore duplicate records when column\'s filteringIgnoreCase is false', async () => {
            const column = grid.getColumnByName('AnotherField');
            column.filteringIgnoreCase = false;
            expect(column.filteringIgnoreCase).toBe(false);

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await fix.whenStable();
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'a', 'Custom', 'custoM', 'custom'], [true, true, true, true, true]);
        });

        it('Should display "Add to current filter selection" button on typing in input', async () => {
            // Open excel style filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            await fix.whenStable();
            fix.detectChanges();

            // Verify that the second item is 'Add to current filter selection'.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);
            expect(listItems[1].innerText).toBe('Add current selection to filter');
        });

        it('Should filter grid the same way as in Excel', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            await fix.whenStable();
            fix.detectChanges();

            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Get the results and verify that they match the list items.
            let gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(4);
            expect(gridCellValues).toEqual(listItems);

            // Open excel style custom filtering dialog again.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '5', fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Get the results and verify that they match the list items.
            gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(1);
            expect(gridCellValues).toEqual(listItems);
        });

        it('Should filter grid correctly with case insensitive duplicates', async () => {
            grid.data = SampleTestData.excelFilteringDataDuplicateValues();
            fix.detectChanges();
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'AnotherField');

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'cust', fix);
            await fix.whenStable();
            fix.detectChanges();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Get the results and verify their count.
            const gridCellValues = GridFunctions.getColumnCells(fix, 'AnotherField')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(5);
        });

        it('Should disable the apply button when there are no results.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix) as HTMLElement;
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '3', fix);
            await fix.whenStable();
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(applyButton);
        });

        it('Should be able to navigate inside the search list items', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchComponent.querySelector('igx-list');
            list.dispatchEvent(new Event('focus'));
            await fix.whenStable();
            fix.detectChanges();
            const listItems = list.querySelectorAll('igx-list-item');

            // we expect only the first list item to be active when the list is focused
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBe(true);
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBe(false);

            // on arrow down the second item should be active
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBe(false);
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBe(true);

            // on arrow up the first item should be active again
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBe(true);
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBe(false);

            // on home the first item should be active
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', list, true);
            fix.detectChanges();
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBe(true);
            UIInteractions.triggerKeyDownEvtUponElem('home', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBe(true);

            // on space key on the first item (select all) all the checkbox should deselect
            let checkboxes = list.querySelectorAll('igx-checkbox');
            let checkboxesStatus = Array.from(checkboxes).map((checkbox: Element) => checkbox.querySelector('input').checked);
            checkboxesStatus.forEach(status => {
                expect(status).toBe(true);
            });
            UIInteractions.triggerKeyDownEvtUponElem('space', list, true);
            fix.detectChanges();
            checkboxes = list.querySelectorAll('igx-checkbox');
            checkboxesStatus = Array.from(checkboxes).map((checkbox: Element) => checkbox.querySelector('input').checked);
            checkboxesStatus.forEach(status => {
                expect(status).toBe(false);
            });
        });

        it('Should move to the last search list item on End and stay on it on arrowDown', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchComponent.querySelector('igx-list');
            list.dispatchEvent(new Event('focus'));
            await fix.whenStable();
            fix.detectChanges();
            const listItems = list.querySelectorAll('igx-list-item');
            const lastItem = listItems[listItems.length - 1];

            UIInteractions.triggerKeyDownEvtUponElem('end', list, true);
            fix.detectChanges();
            expect(lastItem.classList.contains('igx-list__item-base--active')).toBe(true);
            expect(listItems[0].classList.contains('igx-list__item-base--active')).toBe(false);

            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', list, true);
            fix.detectChanges();
            expect(lastItem.classList.contains('igx-list__item-base--active')).toBe(true);
            expect(list.querySelectorAll('.igx-list__item-base--active').length).toBe(1);
        });

        it('Should not lose focus with arrowUp/arrowDown when navigating inside search list', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchComponent.querySelector('igx-list');
            list.dispatchEvent(new Event('focus'));
            await fix.whenStable();
            fix.detectChanges();
            const listItems = list.querySelectorAll('igx-list-item');

            // we expect only the first list item to be active when the list is focused
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBe(true);
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBe(false);

            // on arrow up the focus should stay on the first element and not on the search input
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBe(true);
        });

        it('Should add list items to current filtered items when "Add to current filter selection" is selected.', async () => {
            const totalListItems = [];

            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '5', fix);
            fix.detectChanges();
            await fix.whenStable();

            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText);

            listItems.forEach(c => totalListItems.push(c));

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
            await fix.whenStable();

            // Get the results and verify that they match the list items.
            let gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText);

            expect(gridCellValues.length).toEqual(1);
            expect(gridCellValues).toEqual(totalListItems);

            // Open excel style custom filtering dialog again.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '7', fix);
            fix.detectChanges();
            await fix.whenStable();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText);

            listItems.forEach(c => totalListItems.push(c));
            totalListItems.sort();

            // Select 'Add to current filter selection'.
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkbox[1].click();
            fix.detectChanges();
            await fix.whenStable();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
            await fix.whenStable();

            // Get the results and verify that they match the list items.
            gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(3);
            expect(gridCellValues).toEqual(totalListItems);

            // Open excel style custom filtering dialog again.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            fix.detectChanges();
            await fix.whenStable();

            // Get checkboxes and verify 'Select All' is indeterminate.
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            expect(checkboxes[0].indeterminate).toBe(true);
        });

        it('Should enable the `Apply` button & filter properly when "Add to current filter selection" is the only selected option.', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '5', fix);
            fix.detectChanges();
            await fix.whenStable();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            expect(checkboxes.length).toBe(3);
            checkboxes[0].click(); // Uncheck 'Select All'
            checkboxes[1].click(); // Check 'Add to current filter selection'
            fix.detectChanges();
            await fix.whenStable();

            // Click 'apply' button to apply filter.
            const applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix, excelMenu);
            expect(applyButton.disabled).toBe(false);
            applyButton.click();
            fix.detectChanges();
            await fix.whenStable();

            // Get the results and verify that they match the list items.
            const gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads');

            // Record with '254' downloads is filtered out.
            expect(gridCellValues.length).toEqual(7);
        });

        it('Should commit and close ESF on pressing \'Enter\'', async () => {
            // Open excel style filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

            // Verify ESF is visible.
            expect(excelMenu).not.toBeNull();

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            await fix.whenStable();
            fix.detectChanges();

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Press 'Enter'
            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();

            const gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            // Verify that excel style filtering dialog is closed and data is filtered.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();
            expect(gridCellValues.length).toEqual(4);
            expect(gridCellValues).toEqual(listItems);
        });

        it('Should clear input if there is text and \'Escape\' is pressed.', async () => {
            // Open excel style filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

            // Verify ESF is visible.
            expect(excelMenu).not.toBeNull();

            // Verify that the dialog is closed on pressing Escape.
            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fix.detectChanges();
            await fix.whenStable();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();

            // Open excel style filtering dialog again and type in the input.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);

            // Press Escape again and verify that ESF menu is still visible and the input is empty
            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            fix.detectChanges();
            await fix.whenStable();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();
            expect(inputNativeElement.value, 'input isn\'t cleared correctly').toBe('');
        });

        it('Should clear search criteria when selecting clear column filters option.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            let checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            fix.detectChanges();

            checkboxes[0].click();
            await fix.whenStable();
            fix.detectChanges();

            checkboxes[2].click();
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();
            expect(grid.filteredData.length).toEqual(1);

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            await fix.whenStable();

            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'Net', fix);

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(3);

            GridFunctions.clickClearFilterInExcelStyleFiltering(fix);
            await fix.whenStable();
            expect(grid.filteredData).toBeNull();

            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            expect(inputNativeElement.value, 'search criteria is not cleared').toBe('');

            checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const listItemsCheckboxes = checkboxes.slice(1, checkboxes.length);
            for (const checkbox of listItemsCheckboxes) {
                ControlsFunction.verifyCheckboxState(checkbox.parentElement);
            }
        });

        it('Should filter cell by its formatted data when using FormattedValueFilteringStrategy', async () => {
            const formattedFilterStrategy = new FormattedValuesFilteringStrategy();
            grid.filterStrategy = formattedFilterStrategy;
            const productNameFormatter = (value: string): string => {
                const val = value ? value.toLowerCase() : '';
                if (val.includes('script')) {
                    return 'Web';
                } else if (val.includes('netadvantage')) {
                    return 'Desktop';
                } else {
                    return 'Other';
                }
            };
            grid.columnList.get(1).formatter = productNameFormatter;

            GridFunctions.clickExcelFilterIcon(fix, grid.columnList.get(1).field);
            await wait(200);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'script', fix);
            await wait(100);
            fix.detectChanges();

            let items = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(items.length).toBe(0);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'web', fix);
            await wait(100);
            fix.detectChanges();
            items = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(items.length).toBe(3);
            verifyExcelStyleFilterAvailableOptions(fix, ['Select all search results', 'Add current selection to filter', 'Web'], [true, false, true]);

            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await wait(100);
            fix.detectChanges();
            const cellValues = GridFunctions.getColumnCells(fix, 'ProductName').map(c => c.nativeElement.innerText).sort();
            expect(cellValues).toEqual(['Web', 'Web']);
        });

        it('Should display the default True and False resource strings in the search list for boolean column.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Released');
            fix.detectChanges();
            await wait(100);

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);

            expect(listItems.length, 'incorrect rendered list items count').toBe(4);
            expect(listItems[2].innerText, 'incorrect list item label').toBe('False');
            expect(listItems[3].innerText, 'incorrect list item label').toBe('True');

            const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkboxes[3].click();
            fix.detectChanges();
            await wait(100);

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
            await wait(100);

            expect(grid.filteredData.length).toEqual(5);
        });

        it('Should display the custom resource strings when specified in the search list for boolean column.', async () => {
            grid.resourceStrings.igx_grid_filter_false = 'No';
            grid.resourceStrings.igx_grid_filter_true = 'Yes';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Released');
            fix.detectChanges();
            await wait(100);

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);

            expect(listItems.length, 'incorrect rendered list items count').toBe(4);
            expect(listItems[2].innerText, 'incorrect list item label').toBe('No');
            expect(listItems[3].innerText, 'incorrect list item label').toBe('Yes');
        });

        it('Should sort items in excel style search correctly', async () => {
            const data = [
                {
                    Downloads: 254,
                    ID: 1,
                    ProductName: 'Ignite UI for JavaScript',
                    ReleaseDate: null,
                    ReleaseDateTime: null,
                    ReleaseTime: new Date(2010, 4, 27, 23, 0, 0),
                    Released: false,
                    AnotherField: 'BWord',
                    Revenue: 60000
                },
                {
                    Downloads: 127,
                    ID: 2,
                    ProductName: 'NetAdvantage',
                    ReleaseDate: null,
                    ReleaseDateTime: null,
                    ReleaseTime: new Date(2021, 4, 27, 1, 0, 0),
                    Released: true,
                    AnotherField: 'bWord',
                    Revenue: 50000
                },
                {
                    Downloads: 20,
                    ID: 3,
                    ProductName: 'Ignite UI for Angular',
                    ReleaseDate: null,
                    ReleaseDateTime: null,
                    ReleaseTime: new Date(2015, 4, 27, 12, 0, 0),
                    Released: null,
                    AnotherField: 'aWord',
                    Revenue: 100000
                }
            ];
            fix.componentInstance.data = data;
            fix.detectChanges();

            // Open excel style custom filtering dialog for string column
            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await fix.whenStable();
            fix.detectChanges();

            // Verify items order is case INsensitive
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'aWord', 'BWord'], [true, true, true]);

            // Open excel style custom filtering dialog for time column
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            await fix.whenStable();
            fix.detectChanges();

            // Verify items order is based only on time and not date
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '1:00:00 AM', '12:00:00 PM', '11:00:00 PM'], [true, true, true, true]);
        });

        it('should clear all filters in the custom dialog when clicking "Clear Filter" button', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 5);
            await fix.whenStable();
            fix.detectChanges();

            const expressions = GridFunctions.getExcelCustomFilteringDateExpressions(fix);
            const lastExpression = expressions[expressions.length - 1];
            (lastExpression.querySelector('igx-select').querySelector('igx-input-group') as HTMLElement).click();
            await fix.whenStable();
            fix.detectChanges();
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down.igx-toggle'));

            const todayItem = dropdownList.children[0].children.find(item => item.nativeElement?.innerText === 'Today');
            todayItem.nativeElement.click();
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickClearFilterExcelStyleCustomFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.getExcelCustomFilteringDateExpressions(fix).forEach(expr => {
                const input = expr.children[0].querySelector('input');
                expect(input.value).toBe('');
            });
        });

        it('should correctly filter negative decimal values in Excel Style filtering', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 2);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.setInputValueESF(fix, 0, '-1');
            await fix.whenStable();
            fix.detectChanges();
            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toBe('-1');

            const applyButton = GridFunctions.getApplyExcelStyleCustomFiltering(fix);
            applyButton.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteredData.length).toBe(8);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 2);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.setInputValueESF(fix, 0, '-0.1');
            await fix.whenStable();
            fix.detectChanges();
            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toBe('-0.1');

            applyButton.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.filteredData.length).toBe(8);
        });
    });

    describe('Templates: ', () => {
        let fix;
        let grid;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridFilteringESFTemplatesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        it('Should use custom templates for ESF components instead of default ones.', async () => {
            fix = TestBed.createComponent(IgxGridFilteringESFEmptyTemplatesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;

            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            const filterableColumns = grid.columnList.filter((c) => c.filterable === true);
            for (const column of filterableColumns) {
                // Open ESF.
                GridFunctions.clickExcelFilterIcon(fix, column.field);
                await fix.whenStable();
                fix.detectChanges();
                const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

                // Verify custom column operations template is used.
                expect(excelMenu.querySelector('igx-excel-style-column-operations')).not.toBeNull();

                // Verify custom filter operations template is used.
                expect(excelMenu.querySelector('igx-excel-style-filter-operations')).not.toBeNull();

                // Verify components in default ESF column operations template are not present.
                expect(GridFunctions.getExcelFilteringHeaderComponent(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringSortComponent(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringMoveComponent(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringPinComponent(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringHideComponent(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringColumnSelectionComponent(fix, excelMenu)).toBeNull();

                // Verify components in default ESF filter operations template are not present.
                expect(GridFunctions.getExcelFilteringClearFiltersComponent(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringConditionalFilterComponent(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringSearchComponent(fix, excelMenu)).toBeNull();
            }
        });

        it('Should show the list from the top when reopened after scrolling it to the bottom', async () => {
            // Enough values for the list to scroll.
            for (let index = 0; index < 50; index++) {
                grid.addRow({
                    Downloads: index, ID: index + 100, ProductName: 'New Product ' + index,
                    ReleaseDate: new Date(), Released: false, AnotherField: 'z'
                });
            }
            fix.detectChanges();

            const overlay = TestBed.inject(IgxOverlayService);
            // Resolves once the menu is shown and its values are loaded.
            const openProductName = () => {
                const opened = Promise.all([
                    firstValueFrom(overlay.opened),
                    firstValueFrom(grid.excelStyleFilteringComponent.listDataLoaded)
                ]);
                GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
                return opened;
            };

            await openProductName();
            fix.detectChanges();
            let search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            let scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix) as HTMLElement;
            scroller.scrollTop = scroller.scrollHeight;
            scroller.dispatchEvent(new Event('scroll'));
            fix.detectChanges();
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();
            expect(scroller.scrollTop).toBeGreaterThan(0);

            const closed = firstValueFrom(overlay.closed);
            GridFunctions.clickCancelExcelStyleFiltering(fix);
            await closed;
            fix.detectChanges();

            await openProductName();
            fix.detectChanges();
            search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix) as HTMLElement;
            const viewport = scroller.getBoundingClientRect();
            const first = GridFunctions.getExcelStyleSearchComponentListItems(fix)[0];
            const firstBox = first.getBoundingClientRect();

            // "(Select All)" is rendered first and sits at the top of the viewport.
            expect(scroller.scrollTop).toBe(0);
            expect(first.innerText).toContain(grid.resourceStrings.igx_grid_excel_select_all);
            expect(firstBox.top).toBeGreaterThanOrEqual(viewport.top - 1);
            expect(firstBox.bottom).toBeLessThanOrEqual(viewport.bottom + 1);
        });

        it('Should filter and clear the excel search component correctly from template', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);

            // Type string in search box.
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'ignite', fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(4);

            // Clear filtering of ESF search.
            const clearIcon: any = Array.from(searchComponent.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'clear');
            clearIcon.click();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);
            await fix.whenStable();
        });

        it('Should move column left/right when clicking buttons from template', async () => {
            grid.moving = true;
            fix.detectChanges();

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            const moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveLeft.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.columns[2].field).toBe('ProductName');
            expect(grid.columns[1].field).toBe('Downloads');

            moveLeft.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.columns[1].field).toBe('ID');
            expect(grid.columns[0].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft);

            moveRight.click();
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.columns[0].field).toBe('ID');
            expect(grid.columns[1].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft, false);
        });

        it('should select/deselect column in external ESF template when interact with the column selection item through esf menu', () => {
            fix = TestBed.createComponent(IgxGridExternalESFTemplateComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();

            // Test in single multiple mode
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            vi.spyOn(grid.columnSelectionChanging, 'emit');
            const column = grid.getColumnByName('Downloads');
            fix.componentInstance.esf.column = column;
            fix.detectChanges();

            GridFunctions.clickColumnSelectionInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.columnSelectionChanging.emit).toHaveBeenCalledTimes(1);
            GridSelectionFunctions.verifyColumnAndCellsSelected(column, true);

            GridFunctions.clickColumnSelectionInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.columnSelectionChanging.emit).toHaveBeenCalledTimes(2);
            GridSelectionFunctions.verifyColumnAndCellsSelected(column, false);

            // Test in single selection mode
            grid.columnSelection = GridSelectionMode.single;
            fix.detectChanges();

            grid.selectColumns(['ID']);
            fix.detectChanges();

            const columnId = grid.getColumnByName('ID');
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnId);

            GridFunctions.clickColumnSelectionInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.columnSelectionChanging.emit).toHaveBeenCalledTimes(3);
            GridSelectionFunctions.verifyColumnAndCellsSelected(column, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnId, false);

        });

        it('Should reset esf menu with templates on column change', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            await fix.whenStable();

            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 20, fix);

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(3);

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            await fix.whenStable();

            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            expect(inputNativeElement.value, 'input value didn\'t reset').toBe('');
        });

        it('Should reset blank items on column change.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            await fix.whenStable();

            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[1].innerText).toBe('(Blanks)');

            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'AnotherField');
            await fix.whenStable();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[1].innerText).not.toBe('(Blanks)');
        });

        it('Should use custom excel style filter icon instead of default one.', async () => {
            const header = GridFunctions.getColumnHeader('AnotherField', fix);
            fix.detectChanges();
            const icon = GridFunctions.getHeaderFilterIcon(header);
            fix.detectChanges();
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('filter_alt');
        });

        it('should allow setting excel style filter icon via Input.', () => {
            grid.excelStyleHeaderIconTemplate = fix.componentInstance.customExcelHeaderIcon;
            fix.detectChanges();
            const header = GridFunctions.getColumnHeader('AnotherField', fix);
            fix.detectChanges();
            const icon = GridFunctions.getHeaderFilterIcon(header);
            fix.detectChanges();
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('search');
        });

        it('Should reset list scroll position on filtered column change.', async () => {
            // Add additional rows as prerequisite for the test
            for (let index = 0; index < 10; index++) {
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

            // Select column
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait();
            fix.detectChanges();

            // Scroll the search list to the bottom.
            let scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            expect(scrollbar.scrollTop).toBe(0);
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[0].innerText).toBe('Select All');

            scrollbar.scrollTop = 3000;
            await wait();
            fix.detectChanges();
            expect(listItems[0].innerText).not.toBe('Select All');
            expect(scrollbar.scrollTop).toBeGreaterThan(300);

            // Select another column
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await wait();
            fix.detectChanges();

            // Update scrollbar
            scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            expect(scrollbar.scrollTop, 'search scrollbar did not reset').toBe(0);
        });
    });

    describe('Load values on demand', () => {
        let fix;
        let grid: IgxGridComponent;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridFilteringESFLoadOnDemandComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        });

        it('Verify unique values are loaded correctly in ESF search component.', async () => {
            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(16);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is not visible').not.toBeNull();

            // Wait for items to load.
            await waitForESFValuesToLoad(fix);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Should center the loading indicator in the value list while values load', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(400);
            fix.detectChanges();

            const list = GridFunctions.getExcelStyleSearchComponent(fix).querySelector('igx-list') as HTMLElement;
            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix) as HTMLElement;
            expect(loadingIndicator, 'esf loading indicator is not visible').not.toBeNull();

            const listBox = list.getBoundingClientRect();
            const loadingBox = loadingIndicator.getBoundingClientRect();
            expect(listBox.height).toBeGreaterThan(loadingBox.height);
            expect(Math.abs((loadingBox.top + loadingBox.bottom) / 2 - (listBox.top + listBox.bottom) / 2))
                .toBeLessThanOrEqual(1);

            await wait(650);
        });

        it('Should center the no matches message in the value list', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(1050);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(input, 'no such product', fix);
            await fix.whenStable();
            fix.detectChanges();

            const list = searchComponent.querySelector('igx-list') as HTMLElement;
            const message = searchComponent.querySelector('.igx-excel-filter__empty') as HTMLElement;
            expect(message, 'no matches message is not visible').not.toBeNull();

            const listBox = list.getBoundingClientRect();
            const messageBox = message.getBoundingClientRect();
            expect(Math.abs((messageBox.top + messageBox.bottom) / 2 - (listBox.top + listBox.bottom) / 2))
                .toBeLessThanOrEqual(1);
        });

        it('Verify unique values are loaded correctly in ESF search component when using filtering strategy.', async () => {
            grid.uniqueColumnValuesStrategy = undefined;
            grid.filterStrategy = new LoadOnDemandFilterStrategy();
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(16);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is not visible').not.toBeNull();

            // Wait for items to load.
            await waitForESFValuesToLoad(fix);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Verify unique date values are loaded correctly in ESF search component.', async () => {
            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await wait(16);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is not visible').not.toBeNull();

            // Wait for items to load.
            await waitForESFValuesToLoad(fix);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(8);
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Verify unique ISO 8601 date values are loaded correctly in ESF search component.', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await wait(16);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is not visible').not.toBeNull();

            // Wait for items to load.
            await waitForESFValuesToLoad(fix);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(8);
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Verify unique milliseconds date values are loaded correctly in ESF search component.', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await wait(16);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is not visible').not.toBeNull();

            // Wait for items to load.
            await waitForESFValuesToLoad(fix);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(8);
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Verify date values are displayed in correct format according to column pipeArgs', async () => {
            const downloads = ['Select All', '(Blanks)', '0,00', '20,00', '100,00', '127,00', '254,00', '702,00', '1 000,00'];
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            const dates = fix.componentInstance.data.filter(el => el.ReleaseDate).map(el => new Date(el.ReleaseDate)).sort((a, b) => a - b);
            grid.locale = 'fr-FR';
            const datePipe = new DatePipe(grid.locale);
            const formatOptions = {
                format: 'longDate',
                digitsInfo: '1.2-2'
            };
            grid.getColumnByName('ReleaseDate').pipeArgs = formatOptions;
            grid.getColumnByName('Downloads').pipeArgs = formatOptions;
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await waitForESFValuesToLoad(fix);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(8);

            for (let i = 2; i < listItems.length; i++) {
                const label = datePipe.transform(dates[i - 2], formatOptions.format);
                expect(listItems[i].innerText).toBe(label);
            }

            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await waitForESFValuesToLoad(fix);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            // All values render: the list is no longer measured beside the loading indicator.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(downloads.length);

            listItems.forEach((item, ind) => {
                expect(item.innerText).toBe(downloads[ind]);
            });
        });

        it('Verify date values are displayed in correct format according to column formatter', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            grid.locale = 'fr-FR';
            const datePipe = new DatePipe(grid.locale);
            grid.getColumnByName('ReleaseDate').formatter = ((value: any) => {
                const pipe = new DatePipe('fr-FR');
                const val = value !== null && value !== undefined && value !== '' ? pipe.transform(value, 'longDate') : 'No value!';
                return val;
            });

            const dates = fix.componentInstance.data.map(el => new Date(el.ReleaseDate)).sort((a, b) => a - b);
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await waitForESFValuesToLoad(fix);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(8);

            expect(listItems[1].innerText).toBe('(Blanks)');
            for (let i = 2; i < listItems.length; i++) {
                const date = dates[i];
                const label = date !== null && date !== undefined && date !== '' ? datePipe.transform(date, 'longDate') : 'No value!';
                expect(listItems[i].innerText).toBe(label);
            }

            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Verify date values are displayed in correct format according to column formatter after filtering', async () => {
            grid.locale = 'fr-FR';
            const datePipe = new DatePipe(grid.locale);
            grid.getColumnByName('ReleaseDate').formatter = ((value: any) => {
                const pipe = new DatePipe('fr-FR');
                const val = value !== null && value !== undefined && value !== '' ? pipe.transform(value, 'longDate') : 'No value!';
                return val;
            });

            const dates = fix.componentInstance.data.filter(d => d.ReleaseDate !== null && d.ReleaseDate !== undefined)
                .map(el => new Date(el.ReleaseDate)).sort((a, b) => a - b);
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await waitForESFValuesToLoad(fix);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(8);

            const checkboxElements = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkboxElements[2].click();
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await waitForESFValuesToLoad(fix);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(8);

            expect(listItems[1].innerText).toBe('(Blanks)');
            for (let i = 2; i < listItems.length; i++) {
                const date = dates[i - 2];
                const label = date !== null && date !== undefined && date !== '' ? datePipe.transform(date, 'longDate') : 'No value!';
                expect(listItems[i].innerText).toBe(label);
            }

            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Done callback should be executed only once per column', async () => {
            const compInstance = fix.componentInstance as IgxGridFilteringESFLoadOnDemandComponent;
            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await waitForESFValuesToLoad(fix);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            expect(compInstance.doneCallbackCounter, 'Incorrect done callback execution count').toBe(1);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await waitForESFValuesToLoad(fix);
            fix.detectChanges();
            expect(compInstance.doneCallbackCounter, 'Incorrect done callback execution count').toBe(2);
            // All 9 values render: the list is no longer measured beside the loading indicator.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length, 'incorrect rendered list items count').toBe(9);
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator, 'esf loading indicator is visible').toBeNull();
        });

        it('Should not execute done callback for null column', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();

            expect(async () => {
                GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
                await fix.whenStable();
            }).not.toThrowError(/'dataType' of null/);
        });

        it('Should preserve selected string values from full remote set when grid data is chunked', async () => {
            const remoteFix = TestBed.createComponent(IgxGridFilteringESFRemoteChunkComponent);
            const remoteGrid = remoteFix.componentInstance.grid;
            remoteFix.detectChanges();

            // Mark the grid as remote so ESF does not derive selected values from the current data chunk.
            remoteGrid.totalItemCount = remoteFix.componentInstance.fullData.length;

            GridFunctions.clickExcelFilterIcon(remoteFix, 'ProductName');
            await remoteFix.whenStable();
            remoteFix.detectChanges();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(remoteFix);
            const labelElements: any[] = Array.from(GridFunctions.getExcelStyleSearchComponentListItems(remoteFix, excelMenu));
            const checkboxElements: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(remoteFix, excelMenu));

            const uncheckLabel = 'Alpha';
            const uncheckIndex = labelElements.findIndex(el => el.innerText === uncheckLabel);
            expect(uncheckIndex).toBeGreaterThan(0);

            checkboxElements[uncheckIndex].click();
            remoteFix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(remoteFix, excelMenu, 'igx-grid');
            remoteFix.detectChanges();

            const tree = remoteGrid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree;
            const operand = tree.filteringOperands[0] as IFilteringExpression;

            const selectedValues = Array.from((operand.searchVal as Set<string>).values());
            expect(selectedValues).toEqual(expect.arrayContaining(['beta', 'Gamma', 'DELTA']));
            expect(selectedValues).not.toContain('Alpha');
        });
    });

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
            grid = fix.componentInstance.grid;
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        });

        it('Should pin column next to already pinned group by moving it to the left.', async () => {
            // Test prerequisites
            grid.width = '1000px';
            fix.detectChanges();
            await fix.whenStable();
            // Adjust column widths, so their group can be pinned.
            const columnFields = ['ID', 'ProductName', 'Downloads', 'Released', 'ReleaseDate', 'AnotherField'];
            columnFields.forEach((columnField) => {
                const col = grid.columnList.find((c) => c.field === columnField);
                col.width = '100px';
            });
            fix.detectChanges();
            // Make 'AnotherField' column movable.
            const column = grid.columns.find((c) => c.field === 'AnotherField');
            grid.moving = true;
            fix.detectChanges();

            // Pin the 'General Information' group by pinning its child 'ProductName' column.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickPinIconInExcelStyleFiltering(fix, false);
            await fix.whenStable();
            fix.detectChanges();

            // Verify 'AnotherField' column is not pinned.
            GridFunctions.verifyColumnIsPinned(column, false, 7);

            // Try to pin the 'AnotherField' column by moving it to the left.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'AnotherField');
            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            UIInteractions.simulateClickEvent(moveLeft);
            await fix.whenStable();
            fix.detectChanges();

            // Verify 'AnotherField' column is successfully pinned next to the column group.
            GridFunctions.verifyColumnIsPinned(column, true, 8);
        });
    });

    describe('External Excel Style Filtering', () => {
        let fix;
        let grid;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridExternalESFComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        });

        it('Should allow hosting Excel Style filtering component outside of the grid.', async () => {
            // sort
            GridFunctions.clickSortAscInExcelStyleFiltering(fix);
            fix.detectChanges();
            expect(grid.sortingExpressions[0].fieldName).toEqual('ProductName');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);

            // pin
            GridFunctions.clickPinIconInExcelStyleFiltering(fix, false);
            fix.detectChanges();
            expect(grid.pinnedColumns[0].field).toEqual('ProductName');

            // filter
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular',
                'Ignite UI for JavaScript', 'NetAdvantage', 'Some other item with Script'], [true, true, true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1, 4);
            expect(grid.rowList.length).toBe(3);

            // hide
            GridFunctions.clickHideIconInExcelStyleFiltering(fix, false);
            fix.detectChanges();
            expect(grid.columnList.get(1).hidden).toBeTruthy();
        });

        it('Should open the next column at the top after a search with no matches hid the scrolled list', async () => {
            // Enough values in both columns for the list to scroll.
            for (let index = 0; index < 50; index++) {
                grid.addRow({
                    Downloads: index, ID: index + 100, ProductName: 'New Product ' + index,
                    ReleaseDate: new Date(), Released: false, AnotherField: 'Another ' + index
                });
            }
            fix.detectChanges();
            const esf = fix.componentInstance.esf;
            let loaded = firstValueFrom(esf.listDataLoaded);
            esf.column = grid.getColumnByName('ProductName');
            await loaded;
            fix.detectChanges();

            const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();
            const scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix) as HTMLElement;
            scroller.scrollTop = scroller.scrollHeight;
            scroller.dispatchEvent(new Event('scroll'));
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();
            expect(scroller.scrollTop).toBeGreaterThan(0);

            // No matches empties the list and hides its viewport.
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix);
            UIInteractions.clickAndSendInputElementValue(input, 'no such value', fix);
            await wait(100);
            fix.detectChanges();
            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBe(0);

            loaded = firstValueFrom(esf.listDataLoaded);
            esf.column = grid.getColumnByName('AnotherField');
            await loaded;
            fix.detectChanges();
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            const first = GridFunctions.getExcelStyleSearchComponentListItems(fix)[0];
            expect(scroller.scrollTop).toBe(0);
            expect(first.innerText).toContain(grid.resourceStrings.igx_grid_excel_select_all);
        });

        it('Column selection button should be visible/hidden when column is selectable/not selectable', async () => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            let columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            expect(columnSelectionContainer).toBeNull();

            const esf = fix.componentInstance.esf;
            esf.column = grid.getColumnByName('Downloads');
            await fix.whenStable();
            fix.detectChanges();

            columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            expect(columnSelectionContainer).not.toBeNull();

            grid.columnSelection = GridSelectionMode.none;
            fix.detectChanges();
            fix.componentInstance.esf.cdr.detectChanges();

            columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            expect(columnSelectionContainer).toBeNull();
        });

        it('should select/deselect column when interact with the column selection item through esf menu', async () => {
            // Test in single multiple mode
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            vi.spyOn(grid.columnSelectionChanging, 'emit');
            const column = grid.getColumnByName('Downloads');
            fix.componentInstance.esf.column = column;
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickColumnSelectionInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.columnSelectionChanging.emit).toHaveBeenCalledTimes(1);
            GridSelectionFunctions.verifyColumnAndCellsSelected(column, true);

            GridFunctions.clickColumnSelectionInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.columnSelectionChanging.emit).toHaveBeenCalledTimes(2);
            GridSelectionFunctions.verifyColumnAndCellsSelected(column, false);

            // Test in single selection mode
            grid.columnSelection = GridSelectionMode.single;
            fix.detectChanges();

            grid.selectColumns(['ID']);
            fix.detectChanges();

            const columnId = grid.getColumnByName('ID');
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnId);

            GridFunctions.clickColumnSelectionInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.columnSelectionChanging.emit).toHaveBeenCalledTimes(3);
            GridSelectionFunctions.verifyColumnAndCellsSelected(column, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(columnId, false);

        });

        it('should discard filters through esf menu properly on cancel button click', async () => {
            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            expect(fix.debugElement.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(2);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();
            fix.detectChanges();
            await GridFunctions.setOperatorESF(fix, 1, 0);
            GridFunctions.setInputValueESF(fix, 1, 'Angular');
            GridFunctions.clickCancelExcelStyleCustomFiltering(fix);

            expect(fix.debugElement.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(2);
        });

    });

    describe('IgxGrid - Conditional Filter', () => {
        let fix: ComponentFixture<IgxGridConditionalFilteringComponent>;
        let grid: IgxGridComponent;
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxGridConditionalFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        });

        it('Should not throw console error on opening the drop-down.', async () => {
            vi.spyOn(console, 'error');
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            fix.detectChanges();
            await wait(100);

            expect(console.error).not.toHaveBeenCalled();
        });
    });
});

describe('IgxGrid - Excel style filtering zoneless #grid', () => {
    let fix: ComponentFixture<IgxGridFilteringComponent>;
    let grid: IgxGridComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridFilteringComponent
            ],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();
    });

    beforeEach(async () => {
        fix = TestBed.createComponent(IgxGridFilteringComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
        grid.filterMode = FilterMode.excelStyleFilter;
        fix.detectChanges();
        await fix.whenStable();
    });

    // The zone-based copy of this lives in the Excel style filtering suite above. Here no
    // zone reports the work, so every render the assertions read has to have been asked for
    // by the events themselves.
    it('should name the keyboard focused row after an empty search is cleared', async () => {
        GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
        await fix.whenStable();

        const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
        const settle = async () => {
            await fix.whenStable();
            await search.virtualScroll.layoutComplete;
            await fix.whenStable();
        };
        await settle();

        const searchElement = GridFunctions.getExcelStyleSearchComponent(fix);
        const list = search.list.element.nativeElement as HTMLElement;
        const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchElement);

        // Search for something no row matches, then take the search back out.
        const searchAndClear = async () => {
            input.value = 'nothing matches this';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await settle();

            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBe(0);

            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await settle();

            expect(GridFunctions.getExcelStyleSearchComponentListItems(fix).length).toBeGreaterThan(0);
        };

        // An empty list is not the same height as a full one, so the first round leaves the
        // viewport at a size it did not have when the menu opened. The second round is the
        // one that brings the rows back to a window the list has already reported, and so
        // has no reason to report again.
        await searchAndClear();
        await searchAndClear();

        list.focus();
        await settle();

        expect(document.activeElement).toBe(list);

        list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle();

        // The row the keyboard moved to is the one the focus is drawn on, and it is the row
        // the listbox has to name - not merely some name that is not empty.
        const focused = list.querySelector('.igx-list__item-base--active') as HTMLElement;
        expect(focused).toBeTruthy();
        expect(list.getAttribute('aria-activedescendant')).toBe(focused.id);
        expect(searchElement.querySelector(`#${focused.id}`)).toBe(focused);
        expect(focused.getAttribute('role')).toBe('option');
        const viewport = focused.closest('igx-virtual-scroll');
        expect(viewport.getAttribute('role')).toBe('presentation');
        expect(viewport.closest('[role="listbox"]')).toBe(list);
    });
});

describe('IgxGrid - Custom Filtering Strategy #grid', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CustomFilteringStrategyComponent
            ],
            providers: [{ provide: INPUT_DEBOUNCE_TIME, useValue: 0 }]
        }).compileComponents();
    });

    beforeEach(async () => {
        fix = TestBed.createComponent(CustomFilteringStrategyComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
    });

    it('Should be able to set custom filtering strategy', () => {
        expect(grid.filterStrategy).toBeDefined();
        expect(grid.filterStrategy).toBeInstanceOf(FilteringStrategy);
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();

        expect(grid.filterStrategy).toEqual(fix.componentInstance.strategy);
    });

    it('Should be able to override getFieldValue method', async () => {
        GridFunctions.clickFilterCellChipUI(fix, 'Name'); // Name column contains nested object as a value
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('ca', fix);
        await fix.whenStable();
        fix.detectChanges();
        GridFunctions.submitFilterRowInput(fix);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([]);
        await GridFunctions.resetFilterRow(fix);
        GridFunctions.closeFilterRow(fix);
        fix.detectChanges();

        // Apply the custom strategy and perform the same filter
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();
        GridFunctions.clickFilterCellChipUI(fix, 'Name'); // Name column contains nested object as a value
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('ca', fix);
        await fix.whenStable();
        fix.detectChanges();
        GridFunctions.submitFilterRowInput(fix);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([{ ID: 1, Name: { FirstName: 'Casey', LastName: 'Houston' }, JobTitle: 'Vice President', Company: 'Company A' }]);
    });

    it('Should be able to override findMatchByExpression method', async () => {
        GridFunctions.clickFilterCellChipUI(fix, 'JobTitle'); // Default strategy is case not sensitive
        await fix.whenStable();
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('direct', fix);
        await fix.whenStable();
        GridFunctions.submitFilterRowInput(fix);
        await fix.whenStable();
        fix.detectChanges();

        expect(grid.filteredData).toEqual([
            { ID: 2, Name: { FirstName: 'Gilberto', LastName: 'Todd' }, JobTitle: 'Director', Company: 'Company C' },
            { ID: 3, Name: { FirstName: 'Tanya', LastName: 'Bennett' }, JobTitle: 'Director', Company: 'Company A' }
        ]);
        await GridFunctions.resetFilterRow(fix);
        GridFunctions.closeFilterRow(fix);
        fix.detectChanges();

        // Apply the custom strategy and perform the same filter
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();
        GridFunctions.clickFilterCellChipUI(fix, 'JobTitle');
        await fix.whenStable();
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('direct', fix);
        await fix.whenStable();
        GridFunctions.submitFilterRowInput(fix);
        await fix.whenStable();
        fix.detectChanges();

        expect(grid.filteredData).toEqual([]);
    });

    it('should use the custom filtering strategy when filter the grid through API method', async () => {
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();
        grid.filter('Name', 'D', IgxStringFilteringOperand.instance().condition('contains'));
        await fix.whenStable();
        fix.detectChanges();

        expect(grid.filteredData).toEqual([
            {
                ID: 7, Name: { FirstName: 'Debra', LastName: 'Morton' },
                JobTitle: 'Associate Software Developer', Company: 'Company B'
            },
            { ID: 10, Name: { FirstName: 'Eduardo', LastName: 'Ramirez' }, JobTitle: 'Manager', Company: 'Company E' }
        ]);
    });
});

/**
 * Opens the date picker of the filter row (presuming it is shown for a date column)
 * and resolves with the calendar element once the picker overlay is opened.
 */
const openFilterRowDatePicker = async (fix: ComponentFixture<any>): Promise<HTMLElement> => {
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent)).componentInstance as IgxDatePickerComponent;
    const opened = firstValueFrom(datePicker.opened);
    (datePicker.getEditElement() as HTMLElement).click();
    fix.detectChanges();
    await opened;
    await fix.whenStable();
    fix.detectChanges();
    expect(datePicker.collapsed).toBe(false);
    const calendar = document.querySelector('igx-calendar') as HTMLElement;
    expect(calendar, 'calendar is not rendered').not.toBeNull();
    return calendar;
};

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

/**
 * Opens the conditions drop-down of the filter row and selects the condition with the given (translated) text.
 * Waits for the condition change to be applied, as the filter row handles it in a requestAnimationFrame.
 */
const selectFilterRowCondition = async (fix: ComponentFixture<any>, conditionText: string) => {
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const conditionsDropDown = filterUIRow.query(By.directive(IgxDropDownComponent)).componentInstance as IgxDropDownComponent;
    const opened = firstValueFrom(conditionsDropDown.opened);
    (filterUIRow.query(By.css('igx-prefix')).nativeElement as HTMLElement).click();
    fix.detectChanges();
    await opened;
    fix.detectChanges();

    const items: HTMLElement[] = Array.from(conditionsDropDown.scrollContainer.querySelectorAll('.igx-grid__filtering-dropdown-text'));
    const item = items.find(i => i.textContent.trim() === conditionText);
    expect(item, `condition '${conditionText}' is not in the drop-down`).toBeDefined();
    const closed = firstValueFrom(conditionsDropDown.closed);
    item.click();
    fix.detectChanges();
    await closed;
    await nextFrame();
    await nextFrame();
    await fix.whenStable();
    fix.detectChanges();
};

/**
 * Types a value in the filter row input and waits for the (debounced) value to be applied.
 */
const typeFilterRowValue = async (fix: ComponentFixture<any>, value: string) => {
    GridFunctions.typeValueInFilterRowInput(value, fix);
    await wait();
    await fix.whenStable();
    fix.detectChanges();
};

/**
 * Commits the current filter row condition by pressing 'Enter' in the filter row editor.
 */
const commitFilterRowInput = (fix: ComponentFixture<any>) => {
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const editor = filterUIRow.query(By.directive(IgxInputDirective)).nativeElement as HTMLElement;
    editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fix.detectChanges();
};

const verifyFilterRowUI = (input, closeButton, resetButton, buttonResetDisabled = true) => {
    ControlsFunction.verifyButtonIsDisabled(closeButton.nativeElement, false);
    ControlsFunction.verifyButtonIsDisabled(resetButton.nativeElement, buttonResetDisabled);
    expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
};

const verifyFilterUIPosition = (filterUIContainer, grid) => {
    const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
        filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
    expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
};

const isExcelSearchScrollBarVisible = (fix) => {
    const searchScrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
    return searchScrollbar.offsetHeight < searchScrollbar.children[0].offsetHeight;
};

const checkUIForType = async (type: string, fix: ComponentFixture<any>) => {
    let expectedConditions: string[];
    let expectedInputType;
    const isReadOnly = type === 'bool' ? true : false;
    switch (type) {
        case 'string':
            expectedConditions = IgxStringFilteringOperand.instance().conditionList();
            expectedInputType = 'text';
            break;
        case 'number':
            expectedConditions = IgxNumberFilteringOperand.instance().conditionList();
            expectedInputType = 'number';
            break;
        case 'date':
            expectedConditions = IgxDateFilteringOperand.instance().conditionList();
            expectedInputType = 'datePicker';
            break;
        case 'bool':
            expectedConditions = IgxBooleanFilteringOperand.instance().conditionList();
            expectedInputType = 'text';
            break;
        case 'dateTime':
            expectedConditions = IgxDateTimeFilteringOperand.instance().conditionList();
            expectedInputType = 'text';
            break;
        case 'time':
            expectedConditions = IgxTimeFilteringOperand.instance().conditionList();
            expectedInputType = 'timePicker';
            break;
    }
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const conditionsDropDown = filterUIRow.query(By.directive(IgxDropDownComponent)).componentInstance as IgxDropDownComponent;
    const prefix = filterUIRow.query(By.css('igx-prefix')).nativeElement as HTMLElement;

    // open the conditions drop-down
    const opened = firstValueFrom(conditionsDropDown.opened);
    prefix.click();
    fix.detectChanges();
    await opened;
    fix.detectChanges();

    // check drop-down conditions (count, order and translated text)
    const ddItems: HTMLElement[] = Array.from(conditionsDropDown.scrollContainer.querySelectorAll('.igx-grid__filtering-dropdown-text'));
    expect(ddItems.length).toBe(expectedConditions.length);
    for (let i = 0; i < expectedConditions.length; i++) {
        const txt = GridResourceStringsEN[`igx_grid_filter_${expectedConditions[i]}`];
        expect(txt, `missing resource string for '${expectedConditions[i]}'`).toBeDefined();
        expect(ddItems[i].textContent.trim()).toEqual(txt);
    }

    // close the conditions drop-down
    const closed = firstValueFrom(conditionsDropDown.closed);
    prefix.click();
    fix.detectChanges();
    await closed;
    fix.detectChanges();

    // check input is correct type
    if (expectedInputType === 'text' || expectedInputType === 'number') {
        const input = filterUIRow.query(By.css('.igx-input-group__input'));
        expect(input.nativeElement.type).toBe(expectedInputType);
        expect(input.nativeElement.attributes.hasOwnProperty('readonly')).toBe(isReadOnly);
        expect(filterUIRow.query(By.directive(IgxDatePickerComponent))).toBeNull();
        expect(filterUIRow.query(By.directive(IgxTimePickerComponent))).toBeNull();
    } else if (expectedInputType === 'datePicker') {
        const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent));
        expect(datePicker).not.toBe(null);
    } else {
        const timePicker = filterUIRow.query(By.directive(IgxTimePickerComponent));
        expect(timePicker).not.toBe(null);
    }
};

const verifyExcelStyleFilteringSize = (fix: ComponentFixture<any>, expectedSize: ɵSize) => {
    // Get excel style dialog
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

    // Verify size of search input and list.
    const excelSearch = excelMenu.querySelector('igx-excel-style-search');
    const inputGroup = excelSearch.querySelector('igx-input-group');
    const list = excelSearch.querySelector('igx-list');
    expect(getComponentSize(inputGroup)).toBe(expectedSize);
    expect(getComponentSize(list)).toBe(expectedSize);

    // Verify size of all flat and contained buttons in excel stlye dialog.
    const flatButtons: HTMLElement[] = excelMenu.querySelectorAll('.igx-button--flat:not(.igx-excel-filter__secondary *):not(.igx-excel-filter__menu-footer)');
    const containedButtons: HTMLElement[] = excelMenu.querySelectorAll('.igx-button--contained:not(.igx-excel-filter__secondary *):not(.igx-excel-filter__menu-footer)');
    const buttons: HTMLElement[] = Array.from(flatButtons).concat(Array.from(containedButtons));
    buttons.forEach((button) => {
        expect(getComponentSize(button)).toBe(expectedSize);
    });

    // Verify column pinning and column hiding elements in header area and actions area
    // are shown based on the expected size.
    verifyPinningHidingSize(fix, expectedSize);
    // Verify column sorting and column moving buttons are positioned either on right of their
    // respective header or under it, based on the expected size.
    verifySortMoveSize(fix, expectedSize);
};

const verifyPinningHidingSize = (fix: ComponentFixture<any>, expectedSize: ɵSize) => {
    // Get excel style dialog
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

    // Get column pinning and column hiding icons from header (if present at all)
    const headerTitle = excelMenu.querySelector('h4');
    const headerIcons: DebugElement[] = GridFunctions.getExcelFilteringHeaderIconsDebugElements(fix, excelMenu);
    const headerAreaPinIcon: HTMLElement = headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === "pin")?.nativeElement;
    const headerAreaUnpinIcon: HTMLElement = headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === "unpin")?.nativeElement;
    const headerAreaColumnHidingIcon: HTMLElement = headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === 'hide')?.nativeElement;

    // Get column pinning and column hiding icons from actionsArea (if present at all)
    const actionsPinArea = GridFunctions.getExcelFilteringPinContainer(fix, excelMenu);
    const actionsAreaColumnHidingIcon = GridFunctions.getExcelFilteringHideContainer(fix, excelMenu);

    if (expectedSize === ɵSize.Large) {
        // Verify icons in header are not present.
        expect(headerAreaPinIcon === null || headerAreaPinIcon === undefined, 'headerArea pin icon is present').toBe(true);
        expect(headerAreaUnpinIcon === null || headerAreaUnpinIcon === undefined, 'headerArea unpin icon is present').toBe(true);
        expect(headerAreaColumnHidingIcon === null || headerAreaColumnHidingIcon === undefined, 'headerArea column hiding icon is present').toBe(true);
        // Verify icons in actions area are present.
        expect(actionsPinArea !== null, 'actionsArea pin/unpin icon is  NOT present').toBe(true);
        expect(actionsAreaColumnHidingIcon, 'actionsArea column hiding icon is  NOT present').not.toBeNull();
    } else {
        // Verify icons in header are present.
        expect((headerAreaPinIcon !== null) || (headerAreaUnpinIcon !== null), 'headerArea pin/unpin icon is  NOT present').toBe(true);
        expect(headerAreaColumnHidingIcon, 'headerArea column hiding icon is  NOT present').not.toBeNull();
        // Verify icons in actions area are not present.
        expect(actionsPinArea, 'actionsArea pin icon is present').toBeNull();
        expect(actionsAreaColumnHidingIcon, 'headerArea column hiding icon is present').toBeNull();
        // Verify icons are on right of the title
        const headerTitleRect = headerTitle.getBoundingClientRect();
        const pinUnpinIconRect = ((headerAreaPinIcon !== null) ? headerAreaPinIcon : headerAreaUnpinIcon).getBoundingClientRect();
        const columnHidingRect = headerAreaColumnHidingIcon.getBoundingClientRect();

        expect(pinUnpinIconRect.left >= headerTitleRect.right, 'pinUnpin icon is NOT on the right of top header').toBe(true);
        expect(columnHidingRect.left > headerTitleRect.right, 'columnHiding icon is NOT on the right of top header').toBe(true);
    }
};

const verifySortMoveSize = (fix: ComponentFixture<any>, expectedSize: ɵSize) => {
    // Get excel style dialog.
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

    // Get container of sort component and its header and buttons.
    const sortContainer = GridFunctions.getExcelStyleFilteringSortContainer(fix, excelMenu);
    const sortHeaderRect = sortContainer.querySelector('header').getBoundingClientRect();
    const sortButtons = GridFunctions.getExcelStyleFilteringSortButtons(fix, excelMenu);

    // Get container of move component and its header and buttons.
    const moveContainer = GridFunctions.getExcelStyleFilteringMoveContainer(fix, excelMenu);
    const moveHeaderRect = moveContainer.querySelector('header').getBoundingClientRect();
    const moveButtons = GridFunctions.getExcelStyleFilteringMoveButtons(fix, excelMenu);

    const isSmall = expectedSize === ɵSize.Small;
    // Verify sort buttons are on right of the sort title if size is 'small'
    // or that they are under the sort title if size is not 'small'.
    expect(sortHeaderRect.right <= sortButtons[0].getBoundingClientRect().left, 'incorrect sort button horizontal position based on the sort title').toBe(isSmall);
    expect(sortHeaderRect.right <= sortButtons[1].getBoundingClientRect().left, 'incorrect sort button horizontal position based on the sort title').toBe(isSmall);
    expect(sortHeaderRect.bottom <= sortButtons[0].getBoundingClientRect().top, 'incorrect sort button vertical position based on the sort title').toBe(!isSmall);
    expect(sortHeaderRect.bottom <= sortButtons[1].getBoundingClientRect().top, 'incorrect sort button vertical position based on the sort title').toBe(!isSmall);
    // Verify move buttons are on right of the move title if size is 'small'
    // or that they are under the sort title if size is not 'small'.
    expect(moveHeaderRect.right < moveButtons[0].getBoundingClientRect().left, 'incorrect move button horizontal position based on the sort title').toBe(isSmall);
    expect(moveHeaderRect.right < moveButtons[1].getBoundingClientRect().left, 'incorrect move button horizontal position based on the sort title').toBe(isSmall);
    expect(moveHeaderRect.bottom <= moveButtons[0].getBoundingClientRect().top, 'incorrect move button vertical position based on the sort title').toBe(!isSmall);
    expect(moveHeaderRect.bottom <= moveButtons[1].getBoundingClientRect().top, 'incorrect move button vertical position based on the sort title').toBe(!isSmall);
};

const verifyExcelCustomFilterSize = (fix: ComponentFixture<any>, expectedSize: ɵSize) => {
    // Excel style filtering custom filter dialog
    const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
    // Main container of custom filter dialog
    const container = customFilterMenu.querySelector('.igx-excel-filter__secondary-main');

    // Verify size of all flat and contained buttons in custom filter dialog.
    const flatButtons = container.querySelectorAll('.igx-button--flat');
    const containedButtons = container.querySelectorAll('.igx-button--contained');
    const buttons = Array.from(flatButtons).concat(Array.from(containedButtons));
    buttons.forEach((button) => {
        expect(getComponentSize(button)).toBe(expectedSize);
    });

    // Verify size of all input groups in custom filter dialog.
    const inputGroups = customFilterMenu.querySelectorAll('igx-input-group');
    inputGroups.forEach((inputGroup) => {
        expect(getComponentSize(inputGroup), 'incorrect inputGroup size in custom filter dialog').toBe(expectedSize);
    });
};

const verifyGridSubmenuSize = (gridNativeElement: HTMLElement, expectedSize: ɵSize) => {
    const outlet = gridNativeElement.querySelector('.igx-grid__outlet');
    const dropdowns = Array.from(outlet.querySelectorAll('.igx-drop-down'));
    const visibleDropdown: any = dropdowns[0];
    const dropdownItems = visibleDropdown.querySelectorAll('igx-drop-down-item');

    dropdownItems.forEach((dropdownItem) => {
        expect(getComponentSize(dropdownItem), 'incorrect dropdown item size').toBe(expectedSize);
    });
};

const verifyFilteringExpression = (operand: IFilteringExpression, fieldName: string, conditionName: string, searchVal: any) => {
    expect(operand.fieldName).toBe(fieldName);
    expect(operand.condition.name).toBe(conditionName);
    expect(operand.conditionName).toBe(conditionName);
    expect(operand.searchVal).toEqual(searchVal);
};

const verifyExcelStyleFilterAvailableOptions = (fix, labels: string[], checked: boolean[]) => {
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
    const labelElements: any[] = Array.from(GridFunctions.getExcelStyleSearchComponentListItems(fix, excelMenu));
    const checkboxElements: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

    expect(labelElements.length, 'incorrect rendered list items count').toBe(labels.length);
    labels.forEach((l, index) => {
        expect(l).toEqual(labelElements[index].innerText.normalize("NFKD"));
    });
    checked.forEach((c, index) => {
        expect(checkboxElements[index].indeterminate ? null : checkboxElements[index].checked).toEqual(c);
    });
};

/**
 * Waits for the Excel style filtering values (loaded on demand) to finish loading.
 */
const waitForESFValuesToLoad = async (fix: ComponentFixture<any>) => {
    await vi.waitFor(() => {
        fix.detectChanges();
        expect(GridFunctions.getExcelStyleFilteringComponent(fix)).not.toBeNull();
        expect(GridFunctions.getExcelFilteringLoadingIndicator(fix)).toBeNull();
    }, { timeout: 5000, interval: 50 });
    fix.detectChanges();
};

const toggleExcelStyleFilteringItems = async (fix, shouldApply: boolean, ...itemIndices: number[]) => {
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
    const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

    for (const index of itemIndices) {
        checkbox[index].click();
    }
    await fix.whenStable();
    fix.detectChanges();

    if (shouldApply) {
        GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
        await fix.whenStable();
        fix.detectChanges();
    }
};

/**
 * Verfiy multiple condition chips on their respective indices (asc order left to right)
 * are whether fully visible or not.
 */
const verifyMultipleChipsVisibility = (fix, expectedVisibilities: boolean[]) => {
    for (let index = 0; index < expectedVisibilities.length; index++) {
        verifyChipVisibility(fix, index, expectedVisibilities[index]);
    }
};

/**
 * Verfiy that the condition chip on the respective index (asc order left to right)
 * is whether fully visible or not.
 */
const isChipFullyVisible = (fix, index: number): boolean => {
    const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
    const visibleChipArea = filteringRow.query(By.css('.igx-grid__filtering-row-main'));
    const visibleChipAreaRect = visibleChipArea.nativeElement.getBoundingClientRect();
    const chipRect = GridFunctions.getFilterConditionChip(fix, index).getBoundingClientRect();
    return chipRect.left >= visibleChipAreaRect.left && chipRect.right <= visibleChipAreaRect.right;
};

const verifyChipVisibility = (fix, index: number, shouldBeFullyVisible: boolean) => {
    expect(isChipFullyVisible(fix, index), 'chip[' + index + '] visibility is incorrect').toBe(shouldBeFullyVisible);
};

const emitFilteringDoneOnResetClick = async (fix, grid, filterVal: any, columnName: string, condition) => {
    await filterGrid(fix, grid, columnName, filterVal, condition);

    const filteringExpressions = grid.filteringExpressionsTree.find(columnName) as FilteringExpressionsTree;
    await verifyEmitFilteringDone(grid, filteringExpressions, 1);

    GridFunctions.clickFilterCellChip(fix, columnName);
    await GridFunctions.resetFilterRow(fix);

    const emptyFilter = new FilteringExpressionsTree(null, columnName);
    await verifyEmitFilteringDone(grid, emptyFilter, 2);

    const filterUiRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const reset = filterUiRow.queryAll(By.css('button'))[0];
    expect(reset.nativeElement.classList.contains('igx-button--disabled')).toEqual(true);
};

const emitFilteringDoneOnInputClear = async (fix, grid, filterVal, columnName, condition) => {
    await filterGrid(fix, grid, columnName, filterVal, condition);

    GridFunctions.clickFilterCellChip(fix, columnName);

    grid.filteringRow.onClearClick();
    await fix.whenStable();
    fix.detectChanges();

    const emptyFilter = new FilteringExpressionsTree(null, columnName);
    await verifyEmitFilteringDone(grid, emptyFilter, 2);
};

const verifyRemoveChipFromHeader = async (fix, grid, filterVal, columnName, condition, _rowListLength, cellIndex) => {
    await filterGrid(fix, grid, columnName, filterVal, condition);

    const filteringExpressions = grid.filteringExpressionsTree.find(columnName) as FilteringExpressionsTree;
    await verifyEmitFilteringDone(grid, filteringExpressions, 1);

    const filteringCells = GridFunctions.getFilteringCells(fix);
    const stringCellChip = filteringCells[cellIndex].query(By.css('igx-chip'));

    // remove chip
    ControlsFunction.clickChipRemoveButton(stringCellChip.nativeElement);
    await fix.whenStable();
    fix.detectChanges();

    expect(grid.rowList.length).toEqual(8);

    const emptyFilter = new FilteringExpressionsTree(null, columnName);
    await verifyEmitFilteringDone(grid, emptyFilter, 2);
};

const closeChipFromFilteringUIRow = async (fix, grid, columnName, index) => {
    GridFunctions.clickFilterCellChip(fix, columnName);

    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const close = filterUIRow.queryAll(By.css('button'))[1];

    await GridFunctions.openFilterDDAndSelectCondition(fix, index);

    close.triggerEventHandler('click', null);
    await fix.whenStable();
    fix.detectChanges();

    const filteringExpressions = grid.filteringExpressionsTree.find(columnName) as FilteringExpressionsTree;
    await verifyEmitFilteringDone(grid, filteringExpressions, 1);
};

const verifyEmitFilteringDone = async (grid, filteringExpressions, calledTimes) => {
    const args = { owner: grid, cancel: false, filteringExpressions };
    expect(grid.filtering.emit).toHaveBeenCalledWith(args);
    expect(grid.filtering.emit).toHaveBeenCalledTimes(calledTimes);
    // filteringDone is emitted in a requestAnimationFrame callback
    await vi.waitFor(() => {
        expect(grid.filteringDone.emit).toHaveBeenCalledWith(filteringExpressions);
        expect(grid.filteringDone.emit).toHaveBeenCalledTimes(calledTimes);
    });
};

const filterGrid = async (fix, grid, columnName, filterVal, condition) => {
    grid.filter(columnName, filterVal, condition);
    await fix.whenStable();
    fix.detectChanges();
};
