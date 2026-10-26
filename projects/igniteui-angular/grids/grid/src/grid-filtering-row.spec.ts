// Filtering row UI: column type editors, conditions dropdown and chips.
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from 'igniteui-angular/input-group';
import { INPUT_DEBOUNCE_TIME, IgxGridFilteringRowComponent } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, nextFrame, wait } from '../../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import {
    FILTER_UI_ROW,
    FILTER_UI_CELL,
    transitionsEnd,
    typeFilterRowValue,
    commitFilterRowInput,
    verifyFilterRowUI,
    verifyFilterUIPosition,
    verifyFilteringExpression,
    verifyMultipleChipsVisibility,
    isChipFullyVisible,
    verifyChipVisibility
} from '../../../test-utils/grid-filtering-functions.spec';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent,
    IgxGridFilteringScrollComponent,
    IgxGridFilteringMCHComponent,
    IgxGridFilteringTemplateComponent,
    IgxGridDatesFilteringComponent,
    IgxGridFilteringNumericComponent
} from '../../../test-utils/grid-samples.spec';
import { ControlsFunction } from '../../../test-utils/controls-functions.spec';
import {
    FilteringExpressionsTree,
    FilteringLogic,
    GridResourceStringsEN,
    IFilteringExpression,
    IFilteringExpressionsTree,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand,
    IgxDateTimeFilteringOperand,
    changei18n,
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand,
    IgxTimeFilteringOperand
} from 'igniteui-angular/core';
import { firstValueFrom } from 'rxjs';
import { IgxDateTimeEditorDirective } from 'igniteui-angular/directives';
import { IgxTimePickerComponent } from 'igniteui-angular/time-picker';
import { IgxChipComponent, IgxBadgeComponent, IgxDatePickerComponent, IgxCalendarComponent } from 'igniteui-angular';
import { IgxDropDownComponent } from 'igniteui-angular/drop-down';
import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';

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

        it('should shrink a single long filter chip to the filter cell and ellipsize its label', () => {
            grid.columnList.get(1).width = '150px';
            fix.detectChanges();

            grid.filter('ProductName', 'A very long filtering value that does not fit in the cell',
                IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            const chips = GridFunctions.getFilterChipsForColumn('ProductName', fix);
            expect(chips.length).toEqual(1);

            const filterCell: HTMLElement = GridFunctions.getFilterCell(fix, 'ProductName').nativeElement;
            const chip: HTMLElement = chips[0].nativeElement;
            const content: HTMLElement = chip.querySelector('.igx-chip__content');
            const cellRect = filterCell.getBoundingClientRect();
            const chipRect = chip.getBoundingClientRect();

            // the chip stays inside the cell instead of being clipped by it
            expect(chipRect.width).toBeLessThan(cellRect.width);
            expect(chipRect.right).toBeLessThanOrEqual(cellRect.right);
            // the label is truncated with an ellipsis
            expect(content.scrollWidth).toBeGreaterThan(content.clientWidth);
            expect(getComputedStyle(content).textOverflow).toEqual('ellipsis');

            // the "more filters" indicator is hidden, including its icon
            const indicator: HTMLElement = filterCell.querySelector('.igx-grid__filtering-cell-indicator--hidden');
            expect(indicator).toBeTruthy();
            expect(getComputedStyle(indicator).visibility).toEqual('hidden');
            expect(getComputedStyle(indicator.querySelector('igx-icon')).visibility).toEqual('hidden');
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
            await nextFrame();
            fix.detectChanges();
            GridFunctions.getGridHeader(grid).nativeElement.focus(); //
            fix.detectChanges();

            // Verify 'ReleaseDate' filter chip is not fully visible.
            let chip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0].nativeElement;
            let chipRect = chip.getBoundingClientRect();
            let gridRect = grid.nativeElement.getBoundingClientRect();
            expect(chipRect.right > gridRect.right, 'chip should not be fully visible and thus not within grid').toBe(true);

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDate');
            await nextFrame();
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
            await nextFrame();
            fix.detectChanges();
            // The selected chip widens while its check icon slides in, which shifts the chips to scroll.
            await transitionsEnd(fix.debugElement.query(By.css(FILTER_UI_ROW)).nativeElement);

            verifyMultipleChipsVisibility(fix, [true, false, false]);

            // Press right until the second chip is fully scrolled into view. A fixed number of
            // presses is brittle — how far each press scrolls depends on chip widths/font metrics,
            // so the second chip can land a few px short of full visibility in some environments.
            for (let i = 0; i < 6 && !isChipFullyVisible(fix, 1); i++) {
                grid.filteringRow.scrollChipsOnArrowPress('right');
                await nextFrame();
                fix.detectChanges();
            }

            verifyChipVisibility(fix, 0, false);
            verifyChipVisibility(fix, 1, true);

            // Press left until the first chip is fully scrolled back into view.
            for (let i = 0; i < 6 && !isChipFullyVisible(fix, 0); i++) {
                grid.filteringRow.scrollChipsOnArrowPress('left');
                await nextFrame();
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
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.submitFilterRowInput(fix);
            await nextFrame();
            fix.detectChanges();
            // Add second chip.
            GridFunctions.typeValueInFilterRowInput('e', fix);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.submitFilterRowInput(fix);
            await nextFrame();
            fix.detectChanges();
            // Add third chip.
            GridFunctions.typeValueInFilterRowInput('i', fix);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.submitFilterRowInput(fix);
            await nextFrame();
            fix.detectChanges();

            // Verify first chip is not in view.
            verifyChipVisibility(fix, 0, false);

            const leftArrowButton = GridFunctions.getFilterRowLeftArrowButton(fix).nativeElement;
            leftArrowButton.focus();
            await nextFrame();
            fix.detectChanges();
            leftArrowButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
            fix.detectChanges();
            await nextFrame();

            // Verify first chip is in view.
            verifyChipVisibility(fix, 0, true);
        });
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
