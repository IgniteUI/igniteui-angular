import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick, flush, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import {
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxStringFilteringOperand,
    IgxDateTimeFilteringOperand,
    IgxTimeFilteringOperand
} from '../../data-operations/filtering-condition';
import { IgxDatePickerComponent } from '../../date-picker/date-picker.component';
import { IgxGridFilteringCellComponent } from '../filtering/base/grid-filtering-cell.component';
import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxGridFilteringRowComponent } from '../filtering/base/grid-filtering-row.component';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { IgxBadgeComponent } from '../../badge/badge.component';
import { IgxIconComponent } from '../../icon/icon.component';
import { DefaultSortingStrategy, SortingDirection } from '../../data-operations/sorting-strategy';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { igxI18N } from '../../core/i18n/resources';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeBg from '@angular/common/locales/bg';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { IgxChipComponent } from '../../chips/chip.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent,
    IgxGridFilteringScrollComponent,
    IgxGridFilteringMCHComponent,
    IgxGridFilteringTemplateComponent,
    IgxGridFilteringESFEmptyTemplatesComponent,
    IgxGridFilteringESFTemplatesComponent,
    IgxGridFilteringESFLoadOnDemandComponent,
    CustomFilteringStrategyComponent,
    IgxGridExternalESFComponent,
    IgxGridExternalESFTemplateComponent,
    IgxGridDatesFilteringComponent,
    LoadOnDemandFilterStrategy,
    IgxGridFilteringNumericComponent
} from '../../test-utils/grid-samples.spec';
import { GridSelectionMode, FilterMode, Size } from '../common/enums';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';
import { FilteringStrategy, FormattedValuesFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxInputGroupComponent } from '../../input-group/public_api';
import { formatDate, getComponentSize } from '../../core/utils';
import { IgxCalendarComponent } from '../../calendar/calendar.component';
import { GridResourceStringsEN } from '../../core/i18n/grid-resources';
import { setElementSize } from '../../test-utils/helper-utils.spec';
import { IgxDateTimeEditorDirective } from '../../directives/date-time-editor/date-time-editor.directive';
import { IgxTimePickerComponent } from '../../time-picker/time-picker.component';

const DEBOUNCE_TIME = 30;
const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CELL = 'igx-grid-filtering-cell';
const GRID_RESIZE_CLASS = '.igx-grid-th__resize-line';

describe('IgxGrid - Filtering Row UI actions #grid', () => {

    registerLocaleData(localeDe);
    registerLocaleData(localeFr);
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
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
    }));

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        const today = SampleTestData.today;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        // UI tests string column, empty input
        it('UI tests on string column changing conditions', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));

            expect(grid.rowList.length).toEqual(8);

            // iterate over not unary conditions when input is empty
            // starts with
            GridFunctions.openFilterDDAndSelectCondition(fix, 2);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // does not contain
            GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // iterate over unary conditions
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);

            GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);
        }));

        // UI tests string column with value in input
        it('UI tests on string column', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            expect(grid.rowList.length).toEqual(8);

            // iterate over not unary conditions and fill the input
            // starts with
            GridFunctions.openFilterDDAndSelectCondition(fix, 2);
            GridFunctions.typeValueInFilterRowInput('Net', fix, input);
            tick();
            fix.detectChanges();

            verifyFilterUIPosition(filterUIRow, grid);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(2);

            // ends with
            GridFunctions.openFilterDDAndSelectCondition(fix, 3);
            GridFunctions.typeValueInFilterRowInput('script', fix, input);

            expect(grid.rowList.length).toEqual(2);
            verifyFilterRowUI(input, close, reset, false);

            // does not contain
            GridFunctions.openFilterDDAndSelectCondition(fix, 1);
            GridFunctions.typeValueInFilterRowInput('script', fix, input);

            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(6);
        }));

        // UI tests number column
        it('UI tests on number column changing conditions', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            let input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // does not equal
            GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // greater than
            GridFunctions.openFilterDDAndSelectCondition(fix, 2);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);

            // iterate over unary conditions
            // empty
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            expect(grid.rowList.length).toEqual(1);
            verifyFilterRowUI(input, close, reset, false);

            // not empty
            GridFunctions.openFilterDDAndSelectCondition(fix, 7);

            expect(grid.rowList.length).toEqual(7);
            verifyFilterRowUI(input, close, reset, false);

            // changing from unary to not unary condition when input is empty - filtering should keep its state
            // open dropdown
            GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            input = filterUIRow.query(By.directive(IgxInputDirective));
            expect(grid.rowList.length).toEqual(7);
            verifyFilterRowUI(input, close, reset, false);
        }));

        it('UI tests on number column', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            // iterate over not unary conditions and fill the input
            // does not equal
            GridFunctions.openFilterDDAndSelectCondition(fix, 1);
            GridFunctions.typeValueInFilterRowInput(100, fix, input);

            expect(grid.rowList.length).toEqual(7);
            verifyFilterRowUI(input, close, reset, false);

            // less than
            GridFunctions.openFilterDDAndSelectCondition(fix, 3);
            expect(grid.rowList.length).toEqual(3);
            verifyFilterRowUI(input, close, reset, false);

            // greater than or equal to
            GridFunctions.openFilterDDAndSelectCondition(fix, 4);
            GridFunctions.typeValueInFilterRowInput(254, fix, input);

            expect(grid.rowList.length).toEqual(3);
            verifyFilterRowUI(input, close, reset, false);
        }));

        // UI tests boolean column
        it('UI tests on boolean column', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'Released');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            tick();

            expect(grid.rowList.length).toEqual(8);

            verifyFilterUIPosition(filterUIRow, grid);

            // false condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 2);

            expect(grid.rowList.length).toEqual(2);
            verifyFilterRowUI(input, close, reset, false);

            // true condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(grid.rowList.length).toEqual(3);
            verifyFilterRowUI(input, close, reset, false);

            // (all) condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset, false);

            // not null condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            expect(grid.rowList.length).toEqual(6);
            verifyFilterRowUI(input, close, reset, false);
        }));

        it('UI tests on boolean column open dropdown', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'Released');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const prefix = GridFunctions.getFilterRowPrefix(fix);

            input.triggerEventHandler('click', null);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            UIInteractions.triggerEventHandlerKeyDown(' ', prefix);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);

            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            UIInteractions.triggerEventHandlerKeyDown('Tab', prefix);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);

            UIInteractions.triggerEventHandlerKeyDown(' ', input);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);
        }));

        // UI tests date column
        it('UI - should correctly filter date column', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const expectedResults = GridFunctions.createDateFilterConditions(grid, today);

            // Today condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 4);

            expect(grid.rowList.length).toEqual(1);
            verifyFilterRowUI(input, close, reset, false);
            verifyFilterUIPosition(filterUIRow, grid);

            expect(grid.rowList.length).toEqual(1);

            // This Month condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[5]);

            // Last Month condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 7);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[0]);

            // Empty condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 12);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(2);
        }));

        it('UI - should correctly filter date column by \'equals\' filtering conditions', fakeAsync(() => {
            pending('This should be tested in the e2e test');
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));

            GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            input.triggerEventHandler('click', null);
            tick();
            fix.detectChanges();

            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            const calendar = outlet.getElementsByClassName('igx-calendar')[0];

            const currentDay = calendar.querySelector('.igx-days-view__date--current');

            currentDay.dispatchEvent(new Event('click'));

            flush();
            fix.detectChanges();
            input.triggerEventHandler('change', null);
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(1);
        }));

        it('Should correctly select month from month view datepicker/calendar component', fakeAsync(() => {
            pending('This should be tested in the e2e test');
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

            calendar.querySelector('.igx-days-view__date--current');
            const monthView = calendar.querySelector('.igx-calendar-picker__date');

            monthView.dispatchEvent(new Event('click'));
            tick();
            fix.detectChanges();

            const firstMonth = calendar.querySelector('.igx-calendar__month');
            const firstMonthText = (firstMonth as HTMLElement).innerText;
            firstMonth.dispatchEvent(new Event('click'));
            tick();
            fix.detectChanges();

            calendar = outlet.getElementsByClassName('igx-calendar')[0];
            const month = calendar.querySelector('.igx-calendar-picker__date');

            expect(month.innerHTML.trim()).toEqual(firstMonthText);
        }));

        it('Should correctly select year from year view datepicker/calendar component', fakeAsync(() => {
            pending('This should be tested in the e2e test');
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

        it('Time/DateTime: Should set editorOptions.dateTimeFormat as inputFormat to the quick filter editor', fakeAsync(() => {
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
            let inputDirectiveInstance  = filterUIRow.query(By.directive(IgxDateTimeEditorDirective))
                                                            .injector.get(IgxDateTimeEditorDirective);
            expect(inputDirectiveInstance.inputFormat).toMatch('dd-MM-yyyy');
            expect(inputDirectiveInstance.displayFormat).toMatch('yyyy-dd-MM');

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseTime');
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            inputDirectiveInstance = filterUIRow.query(By.directive(IgxTimePickerComponent)).componentInstance;
            expect(inputDirectiveInstance.inputFormat).toMatch('hh:mm');
            expect(inputDirectiveInstance.displayFormat).toMatch('longTime');
        }));

        it('Time/DateTime: Should set pipeArgs.format as inputFormat to the quick filter editor if numeric and editorOptions.dateTimeFormat not set', fakeAsync(() => {
            const releaseDateTimeCol = grid.getColumnByName('ReleaseDateTime');
            const releaseTimeCol = grid.getColumnByName('ReleaseTime');

            releaseDateTimeCol.pipeArgs = {
                format: 'yyyy--dd--MM'
            };

            releaseTimeCol.pipeArgs = {
                format: 'shortTime'
            };
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDateTime');
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            let dateTimeEditor  = filterUIRow.query(By.directive(IgxDateTimeEditorDirective))
                                                            .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat).toMatch('yyyy--dd--MM');
            expect(dateTimeEditor.displayFormat).toMatch('yyyy--dd--MM');

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseTime');
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            dateTimeEditor = filterUIRow.query(By.directive(IgxDateTimeEditorDirective))
                                                .injector.get(IgxDateTimeEditorDirective);
            // since 'shortTime' is numeric, input format will include its numeric parts
            expect(dateTimeEditor.inputFormat.normalize('NFKC')).toMatch('hh:mm tt');
            expect(dateTimeEditor.displayFormat).toMatch('shortTime');
        }));


        // UI tests custom column
        it('UI tests on custom column', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'AnotherField');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];

            GridFunctions.typeValueInFilterRowInput('a', fix, input);

            expect(grid.rowList.length).toEqual(1);
            expect(grid.getCellByColumn(0, 'AnotherField').value).toMatch('custom');
            verifyFilterRowUI(input, close, reset, false);
        }));

        it('Removing second condition removes the And/Or button', fakeAsync(() => {
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
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(3);
            andButton = fix.debugElement.queryAll(By.css('#operand'));
            expect(andButton.length).toEqual(0);
        }));

        it('When filter column with value 0 and dataType number, filtering chip should be applied', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            GridFunctions.typeValueInFilterRowInput(0, fix);

            GridFunctions.closeFilterRow(fix);

            const gridheaders = fix.debugElement.queryAll(By.css('igx-grid-header'));
            const headerOfTypeNumber = gridheaders.find(gh => gh.nativeElement.classList.contains('igx-grid-th--number'));
            const filterCellsForTypeNumber = headerOfTypeNumber.parent.query(By.css(FILTER_UI_CELL));
            expect(filterCellsForTypeNumber.queryAll(By.css('.igx-filtering-chips')).length).toBe(1);
        }));

        it('Should correctly create FilteringExpressionsTree and populate filterUI.', fakeAsync(() => {
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
        }));

        it('Should complete the filter when clicking the commit icon', fakeAsync(() => {
            const filterValue = 'an';
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            GridFunctions.typeValueInFilterRowInput(filterValue, fix);

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            grid.filteringRow.onCommitClick();
            tick(100);
            fix.detectChanges();

            expect(filterChip.componentInstance.selected).toBeFalsy();
        }));

        it('Should complete the filter when focusing out of the input', fakeAsync(() => {
            const filterValue = 'an';
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            tick(16); // onConditionsChanged rAF

            GridFunctions.typeValueInFilterRowInput(filterValue, fix);

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            grid.nativeElement.focus();
            fix.detectChanges();
            tick(100);

            expect(filterChip.componentInstance.selected).toBeFalsy();
        }));

        it('UI - should use dropdown mode for the date picker', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const datePicker = filterUIRow.query(By.css('igx-date-picker'));
            expect(datePicker.componentInstance.mode).toBe('dropdown');
        }));

        it('Should not select all filter chips when switching columns', fakeAsync(() => {
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
        }));

        it('should render Filter chip for filterable columns and render empty cell for a column when filterable is set to false',
            fakeAsync(() => {
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
                // tick(100);

                idCellChips = GridFunctions.getFilteringChipPerIndex(fix, 0);
                expect(idCellChips.length).toBe(1);
            }));

        it('should render correct input and dropdown in filter row for different column types',
            fakeAsync(/** showHideArrowButtons rAF */() => {
                pending('This should be tested in the e2e test');
                const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
                const stringCellChip = filteringCells[1].query(By.css('igx-chip'));
                const numberCellChip = filteringCells[2].query(By.css('igx-chip'));
                const boolCellChip = filteringCells[3].query(By.css('igx-chip'));
                const dateCellChip = filteringCells[4].query(By.css('igx-chip'));
                // open for string
                stringCellChip.triggerEventHandler('click', null);
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
            pending('This should be tested in the e2e test');
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
            tick(500);
            fix.detectChanges();

            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).not.toBe(null);
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).not.toBe(null);
        }));

        it('should update UI when chip is removed from filter row.', fakeAsync(() => {
            grid.filter('ProductName', 'I', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(2);

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // remove from row
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            GridFunctions.removeFilterChipByIndex(0, filterUIRow);
            tick(100);
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(8);
        }));

        it('should not render chip in header if condition that requires value is applied and then value is cleared in filter row.',
            fakeAsync(() => {
                grid.filter('ProductName', 'I', IgxStringFilteringOperand.instance().condition('startsWith'));
                fix.detectChanges();

                GridFunctions.clickFilterCellChip(fix, 'ProductName');
                tick(100);
                fix.detectChanges();

                const clearButton = GridFunctions.getFilterRowInputClearIcon(fix);
                clearButton.triggerEventHandler('click', null);
                tick(100);
                fix.detectChanges();

                GridFunctions.closeFilterRow(fix);
                tick(100);
                fix.detectChanges();

                // check no condition is applied
                expect(grid.rowList.length).toEqual(8);

                const filteringChips = GridFunctions.getFilteringChips(fix);
                expect(GridFunctions.getChipText(filteringChips[1])).toEqual('Filter');
            }));

        it('should reset the filter chips area when changing grid width', fakeAsync(() => {
            grid.width = '300px';
            fix.detectChanges();
            tick(100);

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
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).not.toBeNull();
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).not.toBeNull();

            grid.width = '900px';
            fix.detectChanges();
            tick(200);

            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).toBeNull();
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).toBeNull();
        }));

        it('Should correctly update filtering row rendered when changing current column by clicking on a header.', fakeAsync(() => {
            pending('This should be tested in the e2e test');
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
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            GridFunctions.openFilterDD(fix.debugElement);
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list-scroll'));
            const input = filteringRow.query(By.directive(IgxInputDirective));

            GridFunctions.selectFilteringCondition('Empty', dropdownList);
            fix.detectChanges();

            const chips = filteringRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toEqual(1);
            expect(chips[0].componentInstance.selected).toBeTruthy();
            expect(GridFunctions.getChipText(chips[0])).toEqual('Empty');
            expect(input.properties.readOnly).toBeTruthy();
        }));

        it('should correctly filter negative values', fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringNumericComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;

            GridFunctions.clickFilterCellChip(fix, 'Number');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));

            // Set input and confirm
            GridFunctions.typeValueInFilterRowInput('-1', fix);

            expect(input.componentInstance.value).toEqual('-1');
            expect(grid.rowList.length).toEqual(1);

            GridFunctions.typeValueInFilterRowInput('0', fix);

            expect(input.componentInstance.value).toEqual('0');
            expect(grid.rowList.length).toEqual(0);

            GridFunctions.typeValueInFilterRowInput('-0.5', fix);

            expect(input.componentInstance.value).toEqual('-0.5');
            expect(grid.rowList.length).toEqual(1);

            GridFunctions.typeValueInFilterRowInput('', fix);

            expect(input.componentInstance.value).toEqual(null);
            expect(grid.rowList.length).toEqual(3);
        }));

        it('Should focus input .', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Open dropdown
            GridFunctions.openFilterDD(fix.debugElement);
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list-scroll'));
            const input = filteringRow.query(By.directive(IgxInputDirective));

            // Select condition with input
            GridFunctions.selectFilteringCondition('Contains', dropdownList);

            // Check focus is kept
            expect(document.activeElement).toEqual(input.nativeElement);

            // Set input and confirm
            GridFunctions.typeValueInFilterRowInput('a', fix, input);

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
        }));

        it('should update UI when filtering via the API.', fakeAsync(() => {
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
        }));

        it('should display view more icon in filter cell if chips don\'t fit in the cell.', fakeAsync(() => {
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
        }));

        it('should select chip when open it from filter cell', fakeAsync(() => {
            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            tick(100);
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();
            expect(input.componentInstance.value).toEqual('Ignite');

        }));

        it('Should allow setting filtering conditions through filteringExpressionsTree.', fakeAsync(() => {
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
        }));

        it('Should close FilterRow when Escape is pressed.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));

            UIInteractions.triggerKeyDownEvtUponElem('Escape', filteringRow.nativeElement, true);
            tick(100);
            fix.detectChanges();

            filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeNull();
        }));

        it('Should correctly load default resource strings for filter row', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeDefined();

            const editingBtns = filteringRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
            const reset = editingBtns.queryAll(By.css('button'))[0];

            expect(reset.nativeElement.childNodes[1].textContent.trim()).toBe('Reset');
        }));

        it('Should correctly change resource strings for filter row using Changei18n.', fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            const strings = GridResourceStringsEN;
            strings.igx_grid_filter = 'My filter';
            strings.igx_grid_filter_row_close = 'My close';
            igxI18N.instance().changei18n(strings);
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

            igxI18N.instance().changei18n({
                igx_grid_filter: 'Filter',
                igx_grid_filter_row_close: 'Close'
            });
        }));

        it('Should correctly change resource strings for filter row.', fakeAsync(() => {
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
        }));

        it('should correctly apply locale to datePicker.', fakeAsync(() => {
            fix.detectChanges();

            grid.locale = 'de-DE';
            tick(300);
            fix.detectChanges();

            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const dateCellChip = initialChips[3].nativeElement;

            dateCellChip.click();
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const datePicker = filteringRow.query(By.directive(IgxDatePickerComponent));
            datePicker.componentInstance.getEditElement().click();
            tick();
            fix.detectChanges();

            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            const calendar = outlet.getElementsByClassName('igx-calendar')[0];

            const sundayLabel = calendar.querySelectorAll('.igx-days-view__label')[0].textContent;

            expect(sundayLabel.trim()).toEqual('Mo');
        }));

        it('Should size grid correctly if enable/disable filtering in run time.', fakeAsync(() => {
            const head = grid.theadRow.nativeElement;
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
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeDefined();

            grid.allowFiltering = false;
            fix.detectChanges();

            filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            expect(filteringRow).toBeNull();
        }));

        it('should open \'conditions dropdown\' on prefix click and should close it on second click.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const prefix = GridFunctions.getFilterRowPrefix(fix);
            const event = {
                currentTarget: prefix.nativeElement,
                preventDefault: () => { },
                stopPropagation: () => { }
            };

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', event);
            tick(100);
            fix.detectChanges();

            // Verify dropdown is opened
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            // Click prefix again to close conditions dropdown
            prefix.triggerEventHandler('click', event);
            tick(100);
            fix.detectChanges();

            // Verify dropdown is closed
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);
        }));

        it('should close \'conditions dropdown\' when navigate with Tab key', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const prefix = GridFunctions.getFilterRowPrefix(fix);
            const event = {
                currentTarget: prefix.nativeElement,
                preventDefault: () => { },
                stopPropagation: () => { }
            };

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', event);
            tick(100);
            fix.detectChanges();

            // Verify dropdown is opened
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            // Press Tab key
            UIInteractions.triggerKeyDownEvtUponElem('Tab', prefix.nativeElement, true);
            tick(100);
            fix.detectChanges();

            // Verify dropdown is closed
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);
        }));

        it('should open \'conditions dropdown\' when press Alt+KyeDown on the input', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', input, true);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);
        }));

        it('should close filter row on Escape key pressed on the input', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));

            UIInteractions.triggerEventHandlerKeyDown('Escape', input);
            tick(100);
            fix.detectChanges();

            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).toBeNull();
            expect(grid.filteringService.isFilterRowVisible).toBeFalsy();
        }));

        it('Should not commit the input when null value is added', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));

            expect(grid.rowList.length).toEqual(8);

            // select unary conditions
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            let filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();
            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);

            // select not unary conditions
            GridFunctions.openFilterDDAndSelectCondition(fix, 1);

            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();
            expect(grid.rowList.length).toEqual(4);
            verifyFilterRowUI(input, close, reset, false);

            // submit the input with empty value
            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeNull();
            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);
        }));

        it('Should navigate keyboard focus correctly between the filter row and the grid cells.', fakeAsync(() => {
            pending(`The test needs refactoring. The dispatchEvent doesn't focus elements with tabindex over them.
                Also, the focus is now persistent over the tbody element`);
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const cell = grid.gridAPI.get_cell_by_index(0, 'ID');
            UIInteractions.simulateClickAndSelectEvent(cell);
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
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            tick(200);

            // Verify arrows and chip area are not visible because there is no active filtering for the column.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const chipArea = filteringRow.query(By.css('igx-chip-area'));
            expect(GridFunctions.getFilterRowLeftArrowButton(fix)).toBeNull();
            expect(GridFunctions.getFilterRowRightArrowButton(fix)).toBeNull();
            expect(chipArea).toBeNull('chipArea is present');
        }));

        it('Should remove first chip and filter by the remaining ones.', fakeAsync(() => {
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
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            tick(200);

            // remove first chip
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            GridFunctions.removeFilterChipByIndex(0, filteringRow);
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(3);
            expect(filteringRow.queryAll(By.css('igx-chip')).length).toEqual(2);
        }));

        it('Should remove middle chip and filter by the remaining ones.', fakeAsync(() => {
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
            tick(200);

            // remove middle chip
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            GridFunctions.removeFilterChipByIndex(1, filteringRow);
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(3);
            expect(filteringRow.queryAll(By.css('igx-chip')).length).toEqual(2);
        }));

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
            expect(chipRect.right > gridRect.right).toBe(true,
                'chip should not be fully visible and thus not within grid');

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
            expect(chipRect.left > gridRect.left && chipRect.right < gridRect.right).toBe(true,
                'chip should be fully visible and within grid');
        });

        it('Verify condition chips are scrolled into/(out of) view by using arrow buttons.', (async () => {
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

            grid.filteringRow.scrollChipsOnArrowPress('right');
            await wait(150);
            fix.detectChanges();
            grid.filteringRow.scrollChipsOnArrowPress('right');
            await wait(150);

            fix.detectChanges();
            verifyMultipleChipsVisibility(fix, [false, true, false]);

            grid.filteringRow.scrollChipsOnArrowPress('left');
            await wait(150);
            fix.detectChanges();
            grid.filteringRow.scrollChipsOnArrowPress('left');
            await wait(150);
            fix.detectChanges();
            verifyMultipleChipsVisibility(fix, [true, false, false]);
        }));

        it('Should navigate from left arrow button to first condition chip Tab.', (async () => {
            grid.width = '700px';
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

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
        }));

        it('Should toggle the selection of a condition chip when using \'Enter\' key.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Add chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            tick(100);
            GridFunctions.submitFilterRowInput(fix);
            tick(100);

            // Verify chip is not selected.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeFalsy();

            filterChip.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick(100);
            fix.detectChanges();

            // Verify chip is selected.
            expect(filterChip.componentInstance.selected).toBeTruthy();

            filterChip.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            fix.detectChanges();
            tick(100);

            // Verify chip is not selected.
            expect(filterChip.componentInstance.selected).toBeFalsy();
        }));

        it('Should commit the value in the input when pressing \'Enter\' on commit icon in input.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Type 'ang' in the filter row input.
            GridFunctions.typeValueInFilterRowInput('ang', fix);

            // Verify chip is selected (in edit mode).
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            // Press 'Enter' on the commit icon.
            const inputCommitIcon = GridFunctions.getFilterRowInputCommitIcon(fix);
            UIInteractions.triggerEventHandlerKeyDown('Enter', inputCommitIcon);
            tick(200);
            fix.detectChanges();

            // Verify chip is not selected (it is committed).
            expect(filterChip.componentInstance.selected).toBeFalsy();
        }));

        it('Should clear the value in the input when pressing \'Enter\' on clear icon in input.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Type 'ang' in the filter row input.
            GridFunctions.typeValueInFilterRowInput('ang', fix);

            // Verify chip is selected (in edit mode).
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            // Press 'Enter' on the clear icon.
            const inputClearIcon = GridFunctions.getFilterRowInputClearIcon(fix);
            UIInteractions.triggerEventHandlerKeyDown('Enter', inputClearIcon);
            tick(200);
            fix.detectChanges();

            // Verify there are no chips since we cleared the input.
            const conditionChips = filteringRow.queryAll(By.directive(IgxChipComponent));
            expect(conditionChips.length).toBe(0);
        }));

        it(`Should open/close filterRow for respective column when pressing 'ctrl + shift + l' on its filterCell chip.`,
            fakeAsync(() => {
                // Verify filterRow is not opened.
                let filterUIRow = grid.theadRow.filterRow;
                expect(filterUIRow).toBeUndefined();

                const releaseDateColumn = GridFunctions.getColumnHeader('ReleaseDate', fix);
                UIInteractions.simulateClickAndSelectEvent(releaseDateColumn);
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('l', releaseDateColumn.nativeElement, true, false, true, true);
                tick(200);
                fix.detectChanges();

                // Verify filterRow is opened for the 'ReleaseDate' column.
                filterUIRow = grid.theadRow.filterRow;
                expect(filterUIRow).toBeDefined();
                const headerGroupsFiltering = grid.headerGroupsList.filter(group => group.isFiltered);
                expect(headerGroupsFiltering.length).toBe(1);
                expect(headerGroupsFiltering[0].column.field).toMatch('ReleaseDate');

                UIInteractions.triggerKeyDownEvtUponElem('l', filterUIRow.nativeElement, true, false, true, true);
                tick(200);
                fix.detectChanges();

                filterUIRow = grid.theadRow.filterRow;
                expect(filterUIRow).toBeUndefined();
        }));

        it('Should navigate to first cell of grid when pressing \'Tab\' on the last filterCell chip.', fakeAsync(() => {
            pending('Should be fixed with headers navigation');
            const filterCellChip = GridFunctions.getFilterChipsForColumn('AnotherField', fix)[0];
            UIInteractions.triggerKeyDownEvtUponElem('Tab', filterCellChip.nativeElement, true);
            tick(200);
            fix.detectChanges();

            const firstCell: any = GridFunctions.getRowCells(fix, 0)[0].nativeElement;
            expect(document.activeElement).toBe(firstCell);
        }));

        it(`Should remove first condition chip when click 'clear' button and focus 'more' icon.`, fakeAsync(() => {
            grid.getColumnByName('ProductName').width = '200px';
            tick(DEBOUNCE_TIME);
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
            tick(50);
            fix.detectChanges();

            const header = GridFunctions.getGridHeader(grid);
            expect(document.activeElement).toBe(header.nativeElement);

            // Verify new chip text.
            filterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
            expect(GridFunctions.getChipText(filterCellChip)).toBe('e');
        }));

        it(`Should focus 'grid header' when close filter row.`, fakeAsync(() => {
            grid.getColumnByName('ProductName').width = '80px';
            tick(DEBOUNCE_TIME);
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
            tick(100);
            fix.detectChanges();

            // verify first chip is selected
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            // close filter row
            GridFunctions.closeFilterRow(fix);
            tick(DEBOUNCE_TIME);

            const header = GridFunctions.getGridHeader(grid);
            expect(document.activeElement).toEqual(header.nativeElement);
        }));

        it('Should update active element when click \'clear\' button of last chip and there is no \'more\' icon.', fakeAsync(() => {
            pending('This this is not valid anymore, so we should probably dellete it.');
            grid.getColumnByName('ProductName').width = '350px';
            tick(DEBOUNCE_TIME);
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

            // Verify chips count.
            expect(GridFunctions.getFilterChipsForColumn('ProductName', fix).length).toBe(3, 'incorrect chips count');

            // Verify last chip text.
            let lastFilterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[2];
            expect(GridFunctions.getChipText(lastFilterCellChip)).toBe('i');
            // Remove last chip.
            // Remove active chip.
            ControlsFunction.clickChipRemoveButton(lastFilterCellChip.nativeElement);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            // Verify chips count.
            expect(GridFunctions.getFilterChipsForColumn('ProductName', fix).length).toBe(2, 'incorrect chips count');
            // Verify new last chip text.
            lastFilterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[1];
            expect(GridFunctions.getChipText(lastFilterCellChip)).toBe('e');

            // Verify that 'clear' icon div of the new last chip is now active.

            const clearIconDiv = ControlsFunction.getChipRemoveButton(lastFilterCellChip.nativeElement);
            expect(document.activeElement).toBe(clearIconDiv);
        }));

        it('Should open filterRow when clicking \'more\' icon', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();

            // Verify filterRow is opened.
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).not.toBeNull();

            // Verify first chip is selected (in edit mode).
            const chipDiv = GridFunctions.getFilterConditionChip(fix, 0).querySelector('.igx-chip__item');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(true, 'chip is not selected');
        }));

        it('Should not throw error when deleting the last chip', (async () => {
            pending('This should be tested in the e2e test');
            grid.width = '700px';
            fix.detectChanges();
            await wait(100);

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

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
            // Add fourth chip.
            GridFunctions.typeValueInFilterRowInput('o', fix);
            await wait(16);
            GridFunctions.submitFilterRowInput(fix);
            await wait(200);

            verifyMultipleChipsVisibility(fix, [false, false, false, true]);
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const chips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toBe(4);

            const leftArrowButton = GridFunctions.getFilterRowLeftArrowButton(fix).nativeElement;
            expect(leftArrowButton).toBeTruthy('Left scroll arrow should be visible');

            const rightArrowButton = GridFunctions.getFilterRowRightArrowButton(fix).nativeElement;
            expect(rightArrowButton).toBeTruthy('Right scroll arrow should be visible');
            expect(grid.rowList.length).toBe(2);

            let chipToRemove = filterUIRow.componentInstance.expressionsList[3];
            expect(() => {
                filterUIRow.componentInstance.onChipRemoved(null, chipToRemove);
            })
                .not.toThrowError(/'id' of undefined/);
            fix.detectChanges();
            await wait(500);
            fix.detectChanges();

            chipToRemove = filterUIRow.componentInstance.expressionsList[2];
            expect(() => {
                filterUIRow.componentInstance.onChipRemoved(null, chipToRemove);
            })
                .not.toThrowError(/'id' of undefined/);
            fix.detectChanges();
            await wait(100);
        }));

        it('should scroll correct chip in view when one is deleted', async () => {
            grid.width = '800px';
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

        it('Unary conditions should be committable', fakeAsync(() => {
            grid.height = '700px';
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Check that the filterRow is opened
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            // Select Empty condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);

            const chip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(chip.componentInstance.selected).toBeTruthy();
            grid.nativeElement.focus();
            grid.filteringRow.onInputGroupFocusout();
            fix.detectChanges();
            tick(100);
            expect(chip.componentInstance.selected).toBeFalsy();

            GridFunctions.clickChip(chip);
            fix.detectChanges();
            tick(100);
            expect(chip.componentInstance.selected).toBeTruthy();
        }));

        it('Should close filterRow when changing filterMode from \'quickFilter\' to \'excelStyleFilter\'', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Add a condition chip without submitting it.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            tick(DEBOUNCE_TIME);

            // Change filterMode to 'excelStyleFilter`
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();

            // Verify the the filterRow is closed.
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).toBeNull('filterRow is visible');

            // Verify the ESF icons are visible.
            const thead = grid.theadRow.nativeElement;
            const filterIcons = thead.querySelectorAll('.igx-excel-filter__icon');
            expect(filterIcons.length).toEqual(6, 'incorrect esf filter icons count');

            // Verify the condition was submitted.
            const header = GridFunctions.getColumnHeader('ProductName', fix);
            const activeFilterIcon = header.nativeElement.querySelector('.igx-excel-filter__icon--filtered');
            expect(activeFilterIcon).toBeDefined('no active filter icon was found');
        }));

        it('Should clear non-unary conditions with null searchVal when close', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            fix.detectChanges();

            GridFunctions.openFilterDD(fix.debugElement);
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
            GridFunctions.selectFilteringCondition('Empty', dropdownList);
            fix.detectChanges();
            GridFunctions.openFilterDD(fix.debugElement);
            GridFunctions.selectFilteringCondition('Contains', dropdownList);
            fix.detectChanges();
            GridFunctions.closeFilterRow(fix);

            const headerChip = GridFunctions.getFilterChipsForColumn('ProductName', fix);
            expect(headerChip.length).toBe(1);
        }));

        it('Should commit the input and new chip after focus out and should edit chip without creating new one.', fakeAsync(() => {
            // Click date filter chip to show filter row.
            const dateFilterCellChip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0];
            dateFilterCellChip.nativeElement.click();
            tick(100);
            fix.detectChanges();

            // Click input to open calendar.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const inputDebugElement = filteringRow.query(By.directive(IgxInputDirective));
            const input = inputDebugElement.nativeElement;
            input.click();
            tick(100);
            fix.detectChanges();

            // Click the today date.
            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            let calendar = outlet.getElementsByClassName('igx-calendar')[0];
            const todayDayItem: HTMLElement = calendar.querySelector('.igx-days-view__date--current');
            UIInteractions.simulateClickAndSelectEvent(todayDayItem.firstChild);
            grid.filteringRow.onInputGroupFocusout();
            tick(100);
            fix.detectChanges();

            // Verify the newly added chip is selected.
            const chip = GridFunctions.getFilterConditionChip(fix, 0);
            const chipDiv = chip.querySelector('.igx-chip__item');

            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(true, 'initial chip is committed');

            // Focus out
            grid.nativeElement.focus();
            grid.filteringRow.onInputGroupFocusout();
            tick(200);
            fix.detectChanges();

            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(false, 'initial chip is not committed');
            expect(input.value).toBe('', 'initial input value is present and not committed');

            chip.click();
            tick(200);
            fix.detectChanges();

            // Open calendar
            input.click();
            tick(100);
            fix.detectChanges();

            calendar = outlet.getElementsByClassName('igx-calendar')[0];

            // View years
            const yearView: HTMLElement = calendar.querySelectorAll('.igx-calendar-picker__date')[1] as HTMLElement;
            yearView.dispatchEvent(new Event('mousedown'));
            tick(100);
            fix.detectChanges();

            // Select the first year
            const firstYear: HTMLElement = calendar.querySelectorAll('.igx-calendar-view__item')[0] as HTMLElement;
            firstYear.dispatchEvent(new Event('mousedown'));
            tick(100);
            fix.detectChanges();

            // Select the first month
            const firstMonth: HTMLElement = calendar.querySelectorAll('.igx-calendar-view__item')[0] as HTMLElement;
            firstMonth.dispatchEvent(new Event('mousedown'));
            tick(100);
            fix.detectChanges();

            // Select the first day
            const firstDayItem: HTMLElement = calendar.querySelector('.igx-days-view__date:not(.igx-days-view__date--inactive)');

            UIInteractions.simulateClickAndSelectEvent(firstDayItem.firstChild);
            grid.filteringRow.onInputGroupFocusout();
            tick(200);
            fix.detectChanges();

            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(true, 'chip is committed');

            // Focus out
            grid.nativeElement.focus();
            grid.filteringRow.onInputGroupFocusout();
            tick(200);
            fix.detectChanges();
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(false, 'chip is selected');

            // Check if we still have only one committed chip
            const chipsLength = GridFunctions.getAllFilterConditionChips(fix).length;

            expect(chipsLength).toBe(1, 'there is more than one chip');
            expect(chipDiv.classList.contains('igx-chip__item--selected')).toBe(false, 'chip is not committed');
            expect(input.value).toBe('', 'input value is present and not committed');
        }));

        it('should not retain expression values in cell filter after calling grid clearFilter() method.', fakeAsync(() => {
            // Click on 'ProductName' filter chip
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            // Enter expression
            GridFunctions.typeValueInFilterRowInput('NetAdvantage', fix);
            tick(DEBOUNCE_TIME);
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
        }));

        it('should not reset expression when input is cleared', fakeAsync(() => {
            grid.filter('ProductName', 'I', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            grid.filteringRow.onClearClick();
            tick(100);
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('startsWith');
        }));

        it('should reset expression when the condition is unary', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // iterate over unary conditions
            // empty
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            expect(grid.filteringRow.expression.condition.name).toEqual('empty');

            const filterUIRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const reset = filterUIRow.queryAll(By.css('button'))[0];

            reset.triggerEventHandler('click', null);
            tick(100);
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('contains');
        }));

        it('should reset expression to selected unary condition', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent));

            // Equals condition
            datePicker.triggerEventHandler('click', null);
            tick();
            fix.detectChanges();

            const currentDay = document.querySelector('.igx-days-view__date--current');

            UIInteractions.simulateClickAndSelectEvent(currentDay.firstChild);
            tick();
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('equals');
            expect(grid.rowList.length).toEqual(1);

            // This Month condition
            const expectedResults = GridFunctions.createDateFilterConditions(grid, today);
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            tick();
            fix.detectChanges();

            expect(grid.filteringRow.expression.condition.name).toEqual('thisMonth');
            expect(grid.rowList.length).toEqual(expectedResults[5]);

            const conditionChips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(conditionChips.length).toBe(1);
        }));

        it('Should filter by cells formatted data when using FormattedValuesFilteringStrategy', fakeAsync(() => {
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
            tick(DEBOUNCE_TIME);
            GridFunctions.closeFilterRow(fix);
            fix.detectChanges();

            // const cells = GridFunctions.getColumnCells(fix, 'Downloads');
            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(2);
        }));

        it('Should filter by cells formatted data when using FormattedValuesFilteringStrategy with rowData', fakeAsync(() => {
            const formattedStrategy = new FormattedValuesFilteringStrategy(['ProductName']);
            grid.filterStrategy = formattedStrategy;
            const anotherFieldFormatter = (value: any, rowData: any) => rowData.ID + ':' + value;
            grid.columnList.get(1).formatter = anotherFieldFormatter;
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            GridFunctions.typeValueInFilterRowInput('1:', fix);
            tick(DEBOUNCE_TIME);
            GridFunctions.closeFilterRow(fix);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(1);
        }));

        it('Should remove pending chip via its close button #9333', fakeAsync(() => {
            GridFunctions.clickFilterCellChipUI(fix, 'Downloads');
            fix.detectChanges();

            GridFunctions.typeValueInFilterRowInput('3', fix);
            tick(DEBOUNCE_TIME);
            const inputGroup = fix.debugElement.query(By.directive(IgxInputGroupComponent));
            const filterRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const pendingChip = filterRow.queryAll(By.directive(IgxChipComponent))[0];
            const chipCloseButton = pendingChip.query(By.css('div.igx-chip__remove')).nativeElement;

            chipCloseButton.dispatchEvent(new Event('mousedown'));
            inputGroup.nativeElement.dispatchEvent(new Event('focusout'));
            chipCloseButton.dispatchEvent(new Event('mouseup'));
            chipCloseButton.dispatchEvent(new Event('click'));
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            const chips = filterRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toEqual(0, 'No chips should be present');
        }));

        it('Should not throw error when pressing Backspace in empty dateTime filter.', fakeAsync(() => {
            spyOn(console, 'error');

            GridFunctions.clickFilterCellChipUI(fix, 'ReleaseDateTime');
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            GridFunctions.typeValueInFilterRowInput('', fix, input);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Backspace', input);
            fix.detectChanges();

            expect(console.error).not.toHaveBeenCalled();
        }));

        it('Should not throw error when pressing Arrow keys in filter when focus is outside of input.', fakeAsync(() => {
            spyOn(console, 'error');

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            const prefix = GridFunctions.getFilterRowPrefix(fix).nativeElement;
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight' , prefix);
            fix.detectChanges();

            expect(console.error).not.toHaveBeenCalled();
        }));
    });

    describe('Integration scenarios', () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        // Filtering + Row Selectors
        it('should display the Row Selector header checkbox above the filter row.', fakeAsync(() => {
            grid.rowSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const frElem = filteringRow.nativeElement;
            const chkBoxElem = GridSelectionFunctions.getRowCheckboxInput(GridSelectionFunctions.getHeaderRow(fix));
            expect(frElem.offsetTop).toBeGreaterThanOrEqual(chkBoxElem.offsetTop + chkBoxElem.clientHeight);
        }));

        // Filtering + Moving
        it('should move chip under the correct column when column is moved and filter row should open for correct column.',
            fakeAsync(() => {
                grid.filter('ProductName', 'Angular', IgxStringFilteringOperand.instance().condition('contains'));
                fix.detectChanges();

                // swap columns
                const stringCol = grid.getColumnByName('ProductName');
                const numberCol = grid.getColumnByName('Downloads');
                grid.moveColumn(stringCol, numberCol);
                tick();
                fix.detectChanges();

                // check UI in filter cell is correct after moving
                const filteringCells = GridFunctions.getFilteringCells(fix);

                expect(GridFunctions.getChipText(filteringCells[2])).toEqual('Angular');
                expect(GridFunctions.getChipText(filteringCells[1])).toEqual('Filter');
            }));

        // Filtering + Hiding
        it('should not display filter cell for hidden columns and chips should show under correct column.', fakeAsync(() => {
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
        }));

        it('Should close filter row when hide the current column', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Check that the filterRow is opened
            let filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).not.toBeNull();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            tick(100);

            grid.getColumnByName('ProductName').hidden = true;
            tick(100);
            fix.detectChanges();

            // Check that the filterRow is closed
            filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).toBeNull();
            expect(grid.rowList.length).toBe(3, 'filter is not applied');
        }));

        it('Should keep existing column filter after hiding another column.', fakeAsync(() => {
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
            tick(200);
            fix.detectChanges();

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
            const column = grid.columnList.find((c) => c.field === 'Released');
            column.hidden = true;
            fix.detectChanges();
            expect(grid.rowList.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
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

            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const frElem = filteringRow.nativeElement;
            const expandBtn = fix.debugElement.query(By.css('.igx-grid__group-expand-btn'));
            const expandBtnElem = expandBtn.nativeElement;
            expect(frElem.offsetTop).toBeGreaterThanOrEqual(expandBtnElem.offsetTop + expandBtnElem.clientHeight);
        }));

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

        it('Should display view more indicator when column is resized so not all filters are visible.', fakeAsync(() => {
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
            tick(200);
            const resizer = fix.debugElement.queryAll(By.css(GRID_RESIZE_CLASS))[0].nativeElement;
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

        it('Should correctly resize the current column that filtering the row is rendered for.', fakeAsync(() => {
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
            tick(200);
            const resizer = fix.debugElement.queryAll(By.css(GRID_RESIZE_CLASS))[0].nativeElement;
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
            tick(200);
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
        }));

        it('UI focusing grid\'s body content does not throw a console error after filtering. (issue 8930)', fakeAsync(() => {
            spyOn(console, 'error');
            GridFunctions.clickFilterCellChipUI(fix, 'ProductName');
            fix.detectChanges();

            GridFunctions.applyFilter('Jav', fix);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            GridFunctions.applyFilter('xy', fix);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            const tBodyContent = GridFunctions.getGridContent(fix);
            tBodyContent.triggerEventHandler('focus', null);

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            GridFunctions.removeFilterChipByIndex(1, filterUIRow);
            tick();
            fix.detectChanges();

            tBodyContent.triggerEventHandler('focus', null);
            tick();
            expect(console.error).not.toHaveBeenCalled();
        }));
    });

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        // Filtering + Column Groups
        it('should size correctly the header based on grid size.', async () => {
            setElementSize(grid.nativeElement, Size.Large);
            fix.detectChanges();

            const thead = GridFunctions.getGridHeader(grid).nativeElement;
            expect(thead.getBoundingClientRect().height).toEqual(grid.defaultRowHeight * 4 + 1);

            setElementSize(grid.nativeElement, Size.Medium);
            fix.detectChanges();
            await wait(100); // needed because the resize observer handler for --ig-size is called inside an angular zone
            fix.detectChanges();
            expect(thead.getBoundingClientRect().height).toEqual(grid.defaultRowHeight * 4 + 1);

            setElementSize(grid.nativeElement, Size.Small);
            fix.detectChanges();
            await wait(100); // needed because the resize observer handler for --ig-size is called inside an angular zone
            fix.detectChanges();
            expect(thead.getBoundingClientRect().height).toEqual(grid.defaultRowHeight * 4 + 1);

        });

        it('should position filter row correctly when grid has column groups.', fakeAsync(() => {
            const thead = GridFunctions.getGridHeader(grid).nativeElement;

            const filteringCells = GridFunctions.getFilteringCells(fix);
            const cellElem = filteringCells[0].nativeElement;
            expect(cellElem.offsetParent.offsetHeight + cellElem.offsetHeight + 1).toBeCloseTo(thead.clientHeight, 10);

            GridFunctions.clickFilterCellChip(fix, 'ID');

            // check if it is positioned at the bottom of the thead.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const frElem = filteringRow.nativeElement;
            expect(frElem.offsetTop + frElem.clientHeight + 1).toEqual(thead.clientHeight);
        }));

        it('should position filter row and chips correctly when grid has column groups and one is hidden.',
            fakeAsync(() => {
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
            }));

        it('Should size grid correctly if enable/disable filtering in run time - MCH.', fakeAsync(() => {
            const head = grid.theadRow.nativeElement;
            const body = grid.nativeElement.querySelector('.igx-grid__tbody');

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

            grid.allowFiltering = false;
            fix.detectChanges();

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);

            grid.allowFiltering = false;
            fix.detectChanges();

            expect(head.getBoundingClientRect().bottom).toEqual(body.getBoundingClientRect().top);
        }));
    });

    describe(null, () => {
        let fix; let grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringScrollComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

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
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringTemplateComponent);
            fix.detectChanges();
        }));

        it('Should render custom filter template instead of default one.', fakeAsync(() => {
            // Verify default filter template is not present.
            expect(GridFunctions.getFilterCell(fix, 'ProductName').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\'ProductName\' default filter chips area template was found.');
            expect(GridFunctions.getFilterCell(fix, 'Downloads').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\'Downloads\' default filter chips area template was found.');
            expect(GridFunctions.getFilterCell(fix, 'Released').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\'Released\' default filter chips area template was found.');
            expect(GridFunctions.getFilterCell(fix, 'ReleaseDate').query(By.css('.igx-filtering-chips'))).toBeNull(
                '\'ReleaseDate\' default filter chips area template was found.');

            // Verify the custom filter template is present.
            expect(GridFunctions.getFilterCell(fix, 'ProductName').query(By.css('.custom-filter'))).not.toBeNull(
                '\'ProductName\' customer filter template was not found.');
            expect(GridFunctions.getFilterCell(fix, 'Downloads').query(By.css('.custom-filter'))).not.toBeNull(
                '\'Downloads\' customer filter template was not found.');
            expect(GridFunctions.getFilterCell(fix, 'Released').query(By.css('.custom-filter'))).not.toBeNull(
                '\'Released\' customer filter template was not found.');
            expect(GridFunctions.getFilterCell(fix, 'ReleaseDate').query(By.css('.custom-filter'))).not.toBeNull(
                '\'ReleaseDate\' customer filter template was not found.');
        }));

        it('Should close default filter template when clicking on a column with custom one.', fakeAsync(() => {
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
            expect(filterUIRow).toBeNull('Default filter template was found on a column with custom filtering.');
        }));

        it('Should not prevent mousedown event when target is within the filter cell template', fakeAsync(() => {
            const filterCell = GridFunctions.getFilterCell(fix, 'ProductName');
            const input = filterCell.query(By.css('input')).nativeElement;

            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
            const preventDefaultSpy = spyOn(mousedownEvent, 'preventDefault');
            input.dispatchEvent(mousedownEvent, { bubbles: true });
            fix.detectChanges();

            expect(preventDefaultSpy).not.toHaveBeenCalled();
        }));

        it('Should prevent mousedown event when target is filter cell or its parent elements', fakeAsync(() => {
            const filteringCells = fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
            const firstCell = filteringCells[0].nativeElement;

            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
            const preventDefaultSpy = spyOn(mousedownEvent, 'preventDefault');
            firstCell.dispatchEvent(mousedownEvent);
            fix.detectChanges();

            expect(preventDefaultSpy).toHaveBeenCalled();
        }));
    });

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        const today = SampleTestData.today;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridDatesFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        // UI tests date column // date values are ISO 8601 strings
        it('UI - should correctly filter ISO 8601 date column', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUIRow.queryAll(By.css('button'))[0];
            const close = filterUIRow.queryAll(By.css('button'))[1];
            const input = filterUIRow.query(By.directive(IgxInputDirective));
            const expectedResults = GridFunctions.createDateFilterConditions(grid, today);

            // Today condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 4);

            expect(grid.rowList.length).toEqual(1);
            verifyFilterRowUI(input, close, reset, false);
            verifyFilterUIPosition(filterUIRow, grid);

            expect(grid.rowList.length).toEqual(1);

            // This Month condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 6);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[5]);

            // Last Month condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 7);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(expectedResults[0]);

            // Empty condition
            GridFunctions.openFilterDDAndSelectCondition(fix, 12);
            verifyFilterRowUI(input, close, reset, false);
            expect(grid.rowList.length).toEqual(2);
        }));

        it('UI - should correctly filter ISO 8601 date column by \'equals\' filtering conditions', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const input = filterUIRow.query(By.css('.igx-date-picker__input-date'));
            const datePicker = filterUIRow.query(By.directive(IgxDatePickerComponent));

            GridFunctions.openFilterDDAndSelectCondition(fix, 0);

            datePicker.triggerEventHandler('click', null);
            tick();
            fix.detectChanges();

            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            const calendar = outlet.getElementsByClassName('igx-calendar')[0];

            const currentDay = calendar.querySelector('.igx-days-view__date--current');

            UIInteractions.simulateClickAndSelectEvent(currentDay.firstChild);

            flush();
            fix.detectChanges();
            input.triggerEventHandler('change', null);
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(1);
        }));

    });

    describe('Filtering events', () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;

        const cal = SampleTestData.timeGenerator;
        const today = SampleTestData.today;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridDatesFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;

            spyOn(grid.filtering, 'emit');
            spyOn(grid.filteringDone, 'emit');
        }));

        it('Should emit filteringDone when we clicked reset - Date column type', fakeAsync(() => {
            emitFilteringDoneOnResetClick(
                fix,
                grid,
                cal.timedelta(today, 'day', 15),
                'ReleaseDate',
                IgxDateFilteringOperand.instance().condition('equals')
            );
        }));

        it('Should emit filteringDone when we clicked reset - String column type', fakeAsync(() => {
            emitFilteringDoneOnResetClick(
                fix,
                grid,
                'search',
                'ProductName',
                IgxStringFilteringOperand.instance().condition('contains')
            );
        }));

        it('Should emit filteringDone when we clicked reset - Number column type', fakeAsync(() => {
            emitFilteringDoneOnResetClick(
                fix,
                grid,
                100,
                'Downloads',
                IgxNumberFilteringOperand.instance().condition('equals')
            );
        }));

        it('Should emit filteringDone when we clicked reset - Currency column type', fakeAsync(() => {
            emitFilteringDoneOnResetClick(
                fix,
                grid,
                100000,
                'Revenue',
                IgxNumberFilteringOperand.instance().condition('equals')
            );
        }));

        it('Should emit filteringDone when we clicked reset - DateTime column type', fakeAsync(() => {
            emitFilteringDoneOnResetClick(
                fix,
                grid,
                cal.timedelta(today, 'hour', 1),
                'ReleaseTime',
                IgxDateTimeFilteringOperand.instance().condition('equals')
            );
        }));

        it('Should emit filteringDone when clear the input of filteringUI - Date column type', fakeAsync(() => {
            emitFilteringDoneOnInputClear(
                fix,
                grid,
                cal.timedelta(today, 'day', 15),
                'ReleaseDate',
                IgxDateFilteringOperand.instance().condition('equals')
            );
        }));

        it('Should emit filteringDone when clear the input of filteringUI - String column type', fakeAsync(() => {
            emitFilteringDoneOnInputClear(
                fix,
                grid,
                'search',
                'ProductName',
                IgxStringFilteringOperand.instance().condition('contains')
            );
        }));

        it('Should emit filteringDone when clear the input of filteringUI - Number column type', fakeAsync(() => {
            emitFilteringDoneOnInputClear(
                fix,
                grid,
                3,
                'Downloads',
                IgxNumberFilteringOperand.instance().condition('equals')
            );
        }));

        it('Should emit filteringDone when clear the input of filteringUI - Currency column type', fakeAsync(() => {
            emitFilteringDoneOnInputClear(
                fix,
                grid,
                100000,
                'Revenue',
                IgxNumberFilteringOperand.instance().condition('equals')
            );
        }));

        it('Should emit filteringDone when clear the input of filteringUI - DateTime column type', fakeAsync(() => {
            emitFilteringDoneOnInputClear(
                fix,
                grid,
                cal.timedelta(today, 'hour', 1),
                'ReleaseTime',
                IgxDateTimeFilteringOperand.instance().condition('equals')
            );
        }));

        it('should update UI when chip is removed from header cell - Date column type.', fakeAsync(() => {
            verifyRemoveChipFromHeader(
                fix,
                grid,
                cal.timedelta(today, 'day', 15),
                'ReleaseDate',
                IgxDateFilteringOperand.instance().condition('equals'),
                1,
                4
            );
        }));

        it('should update UI when chip is removed from header cell - String column type.', fakeAsync(() => {
            verifyRemoveChipFromHeader(
                fix,
                grid,
                'I',
                'ProductName',
                IgxStringFilteringOperand.instance().condition('startsWith'),
                2,
                1
            );
        }));

        it('should update UI when chip is removed from header cell - Number column type.', fakeAsync(() => {
            verifyRemoveChipFromHeader(
                fix,
                grid,
                100,
                'Downloads',
                IgxNumberFilteringOperand.instance().condition('equals'),
                1,
                2
            );
        }));

        it('should update UI when chip is removed from header cell - Currency column type.', fakeAsync(() => {
            verifyRemoveChipFromHeader(
                fix,
                grid,
                100000,
                'Revenue',
                IgxNumberFilteringOperand.instance().condition('equals'),
                1,
                7
            );
        }));

        it('should update UI when chip is removed from header cell - Boolean column type.', fakeAsync(() => {
            verifyRemoveChipFromHeader(
                fix,
                grid,
                true,
                'Released',
                IgxBooleanFilteringOperand.instance().condition('true'),
                3,
                3
            );
        }));

        it('should update UI when chip is removed from header cell - DateTime column type.', fakeAsync(() => {
            verifyRemoveChipFromHeader(
                fix,
                grid,
                cal.timedelta(today, 'hour', 1),
                'ReleaseTime',
                IgxDateTimeFilteringOperand.instance().condition('equals'),
                3,
                6
            );
        }));

        it('should emit filteringDone after chip is close from filtering row - Date column type', fakeAsync(() => {
            closeChipFromFilteringUIRow(fix, grid, 'ReleaseDate', 4);
        }));

        it('should emit filteringDone after chip is close from filtering row - String column type', fakeAsync(() => {
            closeChipFromFilteringUIRow(fix, grid, 'ProductName', 9);
        }));

        it('should emit filteringDone after chip is close from filtering row - Number column type', fakeAsync(() => {
            closeChipFromFilteringUIRow(fix, grid, 'Downloads', 7);
        }));

        it('should emit filteringDone after chip is close from filtering row - Currency column type', fakeAsync(() => {
            closeChipFromFilteringUIRow(fix, grid, 'Revenue', 7);
        }));

        it('should emit filteringDone after chip is close from filtering row - Boolean column type', fakeAsync(() => {
            closeChipFromFilteringUIRow(fix, grid, 'Released', 1);
        }));

        it('should emit filteringDone after chip is close from filtering row - DateTime column type', fakeAsync(() => {
            closeChipFromFilteringUIRow(fix, grid, 'ReleaseTime', 4);
        }));
    });
});

describe('IgxGrid - Filtering actions - Excel style filtering #grid', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridFilteringComponent,
                IgxGridFilteringESFEmptyTemplatesComponent,
                IgxGridFilteringESFTemplatesComponent,
                IgxGridFilteringESFLoadOnDemandComponent,
                IgxGridFilteringMCHComponent,
                IgxGridExternalESFComponent,
                IgxGridExternalESFTemplateComponent
            ]
        }).compileComponents();
    }));

    describe(null, () => {
        let fix: ComponentFixture<IgxGridFilteringComponent>;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        }));

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

        it('Should move column left/right when clicking buttons.', fakeAsync(() => {
            grid.moving = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            const moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveLeft.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[2].field).toBe('ProductName');
            expect(grid.columns[1].field).toBe('Downloads');

            moveLeft.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[1].field).toBe('ID');
            expect(grid.columns[0].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft);

            moveRight.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[0].field).toBe('ID');
            expect(grid.columns[1].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft, false);
        }));

        it('Should right pin and unpin column after moving it left/right when clicking buttons.', fakeAsync(() => {
            grid.pinning.columns = 1;

            const columnToPin = grid.columnList.get(grid.columnList.length - 2);
            columnToPin.pinned = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(1);

            const columnToMove = grid.unpinnedColumns[grid.unpinnedColumns.length - 1];
            grid.moving = true;

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, columnToMove.field);

            let moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            let moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveRight.click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(2);

            expect(grid.pinnedColumns[0].field).toBe(columnToMove.field);
            expect(grid.pinnedColumns[1].field).toBe(columnToPin.field);

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, columnToMove.field);
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
        }));

        it('Should pin column when clicking buttons.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.getExcelFilteringPinContainer(fix).click();
            fix.detectChanges();

            expect(grid.pinnedColumns[0].field).toEqual('Downloads');
        }));

        it('Should unpin column when clicking buttons.', fakeAsync(() => {
            grid.columnList.get(2).pinned = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.getExcelFilteringUnpinContainer(fix).click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
        }));

        it('Should hide column when click on button.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            spyOn(grid.columnVisibilityChanged, 'emit');
            spyOn(grid.columnVisibilityChanging, 'emit');
            GridFunctions.getExcelFilteringHideContainer(fix).click();
            fix.detectChanges();

            const args = { column: grid.getColumnByName('Downloads'), newValue: true };
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledWith({ ...args, cancel: false });
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledWith(args);

            GridFunctions.verifyColumnIsHidden(grid.columnList.get(2), true, 7);
        }));

        it('Should not select values in list if two values with And operator are entered.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());
        }));

        it('Should show the previously entered filter value when reopen esf dialog from the applied filter operand', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick(100);
            fix.detectChanges();

            const ddItem = fix.nativeElement.querySelector('.igx-drop-down__item--selected');
            expect(ddItem).toBeDefined();
            expect(ddItem.outerText.toLowerCase()).toMatch('contains');

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toEqual('Angular');
        }));

        it('Should Not show the previously entered filter value when reopen esf dialog from other filterOperand', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick(100);
            fix.detectChanges();

            const ddItem = fix.nativeElement.querySelector('.igx-drop-down__item--selected');
            expect(ddItem).toBeDefined();
            expect(ddItem.outerText.toLowerCase()).toMatch('contains');

            GridFunctions.clickOperatorFromCascadeMenu(fix, 1);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toEqual('');
        }));

        it('Should not select values in list if two values with Or operator are entered and contains operand.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'Ignite', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(2)');
            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            checkboxes.forEach(c => expect(c.checked).toBeFalsy());

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick(30);
            fix.detectChanges();

            const ddItem = fix.nativeElement.querySelector('.igx-drop-down__item--selected');
            expect(ddItem).toBeDefined();
            expect(ddItem.querySelector('.igx-grid__filtering-dropdown-text').textContent).toMatch('Custom filter...');
        }));

        it('Should select values in list if two values with Or operator are entered and they are in the list below.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

            fix.detectChanges();

            expect(checkboxes[0].checked && checkboxes[0].indeterminate).toBeTruthy();
            expect(!checkboxes[1].checked && !checkboxes[1].indeterminate).toBeTruthy();
            expect(!checkboxes[2].checked && !checkboxes[2].indeterminate).toBeTruthy();
            expect(checkboxes[3].checked && !checkboxes[3].indeterminate).toBeTruthy();
        }));

        it('Should change filter when changing And/Or operator.', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            tick(100);

            const andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            andButton.click();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(0);
        }));

        it('Should change filter when changing operator.', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(2);

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            tick();

            // select second expression's operator
            GridFunctions.setOperatorESF(fix, 1, 2);

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(5);
        }));

        it('Should not be able to exit custom dialog when press tab on apply button', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick();

            const applyButton = GridFunctions.getApplyExcelStyleCustomFiltering(fix);
            applyButton.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(applyButton);

            UIInteractions.triggerKeyDownEvtUponElem('Tab', applyButton, true);
            fix.detectChanges();

            expect(document.activeElement).toBe(applyButton);
        }));

        it('Should populate custom filter dialog.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('lessThan'), conditionName: 'lessThan' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            tick();

            // Verify inputs values
            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toEqual('254');
            expect(GridFunctions.getExcelFilteringInput(fix, 1).value).toEqual('20');

            // Verify Drop Down values
            expect(GridFunctions.getExcelFilteringDDInput(fix, 0).value).toEqual('Equals');
            expect(GridFunctions.getExcelFilteringDDInput(fix, 1).value).toEqual('Less Than');
        }));

        it('Should display friendly conditions\' names in custom filter dialog.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 1);
            tick(100);

            const firstValue = GridFunctions.getExcelFilteringDDInput(fix, 0).value;

            expect(firstValue).toMatch('Does Not Contain');
        }));

        it('Should clear the filter when click Clear filter item.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickClearFilterInExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
        }));

        it('Should clear filter when pressing \'Enter\' on the clear filter button in ESF.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' },
                { fieldName: 'ProductName', searchVal: 'Ignite', condition: IgxStringFilteringOperand.instance().condition('contains'), conditionName: 'contains' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.filteredData.length).toEqual(2);

            const clearFilterButton = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            clearFilterButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick(100);
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
        }));

        it('Should set the \'aria-disabled\' attribute for the ESF dialog clear filter button element with role=\'menuitem\'.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
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

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            expect(grid.filteredData.length).toEqual(2);
            clearFilterButtonMenuItemRole = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            expect(clearFilterButtonMenuItemRole.getAttribute('aria-disabled')).toBe('false');

            const clearFilterButton = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            clearFilterButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick(100);
            fix.detectChanges();

            expect(grid.filteredData).toBeNull();
            clearFilterButtonMenuItemRole = GridFunctions.getClearFilterInExcelStyleFiltering(fix);
            expect(clearFilterButtonMenuItemRole.getAttribute('aria-disabled')).toBe('true');
        }));

        it('Should update filter icon when dialog is closed and the filter has been changed.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);

            checkbox[0].click();
            tick();
            fix.detectChanges();

            checkbox[2].click();
            tick();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            expect(grid.filteredData.length).toEqual(1);

            let filterIcon = GridFunctions.getExcelFilterIcon(fix, 'Downloads');
            expect(filterIcon).toBeNull();

            filterIcon = GridFunctions.getExcelFilterIconFiltered(fix, 'Downloads');
            expect(filterIcon).toBeDefined();
        }));

        it('Should filter grid via custom dialog.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(100);

            // set first expression's value
            GridFunctions.setInputValueESF(fix, 0, 0);
            tick(100);

            // select second expression's operator
            GridFunctions.setOperatorESF(fix, 1, 1);
            tick(100);

            // set second expression's value
            GridFunctions.setInputValueESF(fix, 1, 20);
            tick(100);

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(1);
        }));

        it('Should filter grid via custom dialog - 3 expressions.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Released');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(100);

            // select second expression's operator
            GridFunctions.setOperatorESF(fix, 1, 1);

            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            fix.detectChanges();

            // select third expression's operator
            GridFunctions.setOperatorESF(fix, 2, 4);

            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData.length).toEqual(3);
        }));

        it('Should clear filter from custom dialog.', fakeAsync(() => {
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.Or, 'Downloads');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals' }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 10);
            tick(100);

            GridFunctions.clickClearFilterExcelStyleCustomFiltering(fix);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            expect(grid.filteredData).toBeNull();
        }));

        it('Should pin/unpin column when clicking pin/unpin icon in header', fakeAsync(() => {
            setElementSize(grid.nativeElement, Size.Medium);
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and pin 'ProductName' column through header icon
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickPinIconInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();
            // Verify Excel menu is closed
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();
            const column = grid.getColumnByName('ProductName');
            GridFunctions.verifyColumnIsPinned(column, true, 1);

            // Open excel style filtering component and UNpin 'ProductName' column through header icon
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickPinIconInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            GridFunctions.verifyColumnIsPinned(column, false, 0);
        }));

        it('Should hide column when clicking hide icon in header', fakeAsync(() => {
            setElementSize(grid.nativeElement, Size.Small);
            tick(200);
            fix.detectChanges();
            spyOn(grid.columnVisibilityChanging, 'emit');
            spyOn(grid.columnVisibilityChanged, 'emit');

            const column = grid.columnList.find((col) => col.field === 'ProductName');
            GridFunctions.verifyColumnIsHidden(column, false, 8);

            // Open excel style filtering component and hide 'ProductName' column through header icon
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            GridFunctions.clickHideIconInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            // Verify Excel menu is closed
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();
            const args = { column, newValue: true };
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanging.emit).toHaveBeenCalledWith({ ...args, cancel: false });
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnVisibilityChanged.emit).toHaveBeenCalledWith(args);
        }));

        it('Should move pinned column correctly by using move buttons', fakeAsync(() => {
            grid.moving = true;
            const productNameCol = grid.getColumnByName('ProductName');
            const idCol = grid.getColumnByName('ID');
            productNameCol.pinned = true;
            idCol.pinned = true;
            fix.detectChanges();

            expect(productNameCol.pinned).toBe(true);

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            // Move 'ProductName' one step to the right. (should move)
            let moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];
            UIInteractions.simulateClickEvent(moveRight);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ID');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 1).innerText).toBe('ProductName');
            expect(productNameCol.pinned).toBe(true);

            // Move 'ProductName' one step to the left. (should move)
            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            UIInteractions.simulateClickEvent(moveLeft);
            tick(DEBOUNCE_TIME);
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
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            UIInteractions.simulateClickEvent(moveRight);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ID');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 1).innerText).toBe('ProductName');
            expect(productNameCol.pinned).toBe(false);
        }));

        it('Should move unpinned column correctly by using move buttons', fakeAsync(() => {
            grid.moving = true;
            const productNameCol = grid.getColumnByName('ProductName');
            const downloadsCol = grid.getColumnByName('Downloads');
            productNameCol.pinned = true;
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 2).innerText).toBe('Downloads');
            expect(downloadsCol.pinned).toBe(false);

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            UIInteractions.simulateClickEvent(moveLeft);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            UIInteractions.simulateClickEvent(moveLeft);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderTitleByIndex(fix, 1).innerText).toBe('Downloads');
            expect(downloadsCol.pinned).toBe(true);
        }));

        it('Should filter and clear the excel search component correctly', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await wait(100);
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');

            // Type string in search box.
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'ignite', fix);
            fix.detectChanges();
            await wait(100);

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(4, 'incorrect rendered list items count');

            // Clear filtering of ESF search.
            const clearIcon: any = Array.from(searchComponent.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'clear');
            clearIcon.click();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
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
            expect(listItems.length).toBe(3, 'incorrect rendered list items count');

            // Type non-numerical symbol in search box.
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'a', fix);
            fix.detectChanges();
            await wait(100);

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(inputNativeElement.value).toBe('', 'incorrect rendered list items count');
            expect(listItems.length).toBe(8, 'incorrect rendered list items count');
        });

        it('Should enable/disable the apply button correctly.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await wait(100);
            // Verify there are filtered-in results and that apply button is enabled.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            let applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix) as HTMLElement;
            expect(listItems.length).toBe(6, 'ESF search result should NOT be empty');
            ControlsFunction.verifyButtonIsDisabled(applyButton, false);

            // Verify the apply button is disabled when all items are unchecked (when unchecking 'Select All').
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkbox[0].click(); // Select All
            fix.detectChanges();
            await wait(100);
            applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix);
            ControlsFunction.verifyButtonIsDisabled(applyButton);
        });

        it('size is properly applied on the excel style filtering component', fakeAsync(() => {
            const column = grid.columnList.find((c) => c.field === 'ProductName');
            column.sortable = true;
            grid.moving = true;
            fix.detectChanges();

            // Open excel style filtering component and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            verifyExcelStyleFilteringSize(fix, Size.Large);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, Size.Small);
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilteringSize(fix, Size.Small);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, Size.Medium);
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilteringSize(fix, Size.Medium);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
        }));

        it('size is properly applied on the column selection container', fakeAsync(() => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            tick(100);
            fix.detectChanges();

            let columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            let headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);

            expect(columnSelectionContainer).not.toBeNull();
            expect(headerIcons.length).toEqual(0);

            setElementSize(grid.nativeElement, Size.Small);
            fix.detectChanges();

            columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);
            const columnSelectionIcon = headerIcons.find((bi: any) => bi.innerText === 'done');

            expect(columnSelectionContainer.tagName).toEqual('DIV');
            expect(columnSelectionIcon).not.toBeNull();

        }));

        it('size is properly applied on the excel style custom filtering dialog', fakeAsync(() => {
            const column = grid.columnList.find((c) => c.field === 'ProductName');
            column.sortable = true;
            grid.moving = true;
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterSize(fix, Size.Large);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            setElementSize(grid.nativeElement, Size.Medium);
            tick(200);
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterSize(fix, Size.Medium);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            setElementSize(grid.nativeElement, Size.Small);
            tick(200);
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterSize(fix, Size.Small);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
        }));

        it('size is properly applied on the excel style cascade dropdown', fakeAsync(() => {
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;

            // Open excel style cascade operators dropdown and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            verifyGridSubmenuSize(gridNativeElement, Size.Large);

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            tick();
            fix.detectChanges();

            setElementSize(grid.nativeElement, Size.Medium);
            tick(200);
            fix.detectChanges();

            // Open excel style cascade operators dropdown and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            verifyGridSubmenuSize(gridNativeElement, Size.Medium);

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, Size.Small);
            tick(200);
            fix.detectChanges();

            // Open excel style cascade operators dropdown and verify its size
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            verifyGridSubmenuSize(gridNativeElement, Size.Small);
        }));

        it('size is properly applied on the excel custom dialog\'s default expression dropdown',
            fakeAsync(() => {
                const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;

                // Open excel style custom filtering dialog.
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its size.
                let conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();

                verifyGridSubmenuSize(gridNativeElement, Size.Large);
                GridFunctions.clickCancelExcelStyleCustomFiltering(fix);
                tick(100);
                fix.detectChanges();

                // Change size
                setElementSize(grid.nativeElement, Size.Medium);
                tick(200);
                fix.detectChanges();

                // Open excel style custom filtering dialog.
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its size.
                conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();

                verifyGridSubmenuSize(gridNativeElement, Size.Medium);
            }));

        it('size is properly applied on the excel custom dialog\'s date expression dropdown',
            fakeAsync(() => {
                const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its size.
                let conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0, true);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();

                verifyGridSubmenuSize(gridNativeElement, Size.Large);

                GridFunctions.clickCancelExcelStyleCustomFiltering(fix);
                tick(100);
                fix.detectChanges();

                // Change size
                setElementSize(grid.nativeElement, Size.Medium);
                tick(200);
                fix.detectChanges();

                // Open excel style custom filtering dialog.
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its size.
                conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0, true);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();
                verifyGridSubmenuSize(gridNativeElement, Size.Medium);
            }));

        it('Should include \'false\' value in results when searching.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Released');

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'false', fix);
            tick(100);
            fix.detectChanges();

            // Verify that the first item is 'Select All' and the third item is 'false'.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(3, 'incorrect rendered list items count');
            expect(listItems[0].innerText).toBe('Select all search results');
            expect(listItems[2].innerText).toBe('False');
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

            setElementSize(grid.nativeElement, Size.Small);
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
            expect(scrollbar.scrollTop >= 660 && scrollbar.scrollTop <= 700).toBe(true,
                'search scrollbar has incorrect scrollTop: ' + scrollbar.scrollTop);
            // Verify display container height.
            const displayContainer = searchComponent.querySelector('igx-display-container');
            const displayContainerRect = displayContainer.getBoundingClientRect();
            const listHeight = searchComponent.querySelector('igx-list').getBoundingClientRect().height;
            const itemHeight = displayContainer.querySelector('igx-list-item').getBoundingClientRect().height;
            expect(displayContainerRect.height > listHeight + itemHeight && displayContainerRect.height < listHeight + (itemHeight * 2)).toBe(true, 'incorrect search display container height');
            // Verify rendered list items count.
            const listItems = displayContainer.querySelectorAll('igx-list-item');
            expect(listItems.length).toBe(Math.ceil(listHeight / itemHeight ) + 1, 'incorrect rendered list items count');
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
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const displayContainer = searchComponent.querySelector('igx-display-container') as HTMLElement;
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
            expect(displayContainerRect.top >= listRect.top).toBe(true, 'displayContainer starts above list');
            expect(displayContainerRect.bottom <= listRect.bottom).toBe(true, 'displayContainer ends below list');
        }));

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

        it('Column formatter should skip the \'SelectAll\' list item', fakeAsync(() => {
            grid.columnList.get(4).formatter = (val: Date) => new Intl.DateTimeFormat('bg-BG').format(val);
            grid.cdr.detectChanges();

            // Open excel style filtering component
            try {
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');
            } catch (ex) {
                expect(ex).toBeNull();
            }

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[0].innerText).toBe('Select All');
        }));

        it('should keep newly added filter expression in view', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            // Click 'Add Filter' button.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            tick(200);

            // Verify last expression is currently in view inside the expressions container.
            const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
            const expressionsContainer = customFilterMenu.querySelector('.igx-excel-filter__secondary-main');
            const expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
            const lastExpression = expressions[expressions.length - 1];
            const lastExpressionRect = lastExpression.getBoundingClientRect();
            const expressionsContainerRect = expressionsContainer.getBoundingClientRect();
            expect(lastExpressionRect.top >= expressionsContainerRect.top).toBe(true,
                'lastExpression starts above expressionsContainer');
            expect(lastExpressionRect.bottom <= expressionsContainerRect.bottom).toBe(true,
                'lastExpression ends below expressionsContainer');

            // Verify addFilter button is currently in view beneath the last expression.
            const addFilterButton = GridFunctions.getAddFilterExcelStyleCustomFiltering(fix);
            const addFilterButtonRect = addFilterButton.getBoundingClientRect();
            expect(addFilterButtonRect.top >= lastExpressionRect.bottom).toBe(true,
                'addFilterButton overlaps lastExpression');
            expect(addFilterButtonRect.bottom <= expressionsContainerRect.bottom).toBe(true,
                'addFilterButton ends below expressionsContainer');
        }));

        it('Should generate "equals" conditions when selecting two values.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            tick();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(2);
            const operands =
                (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                    .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'equals', 'Ignite UI for Angular');
            verifyFilteringExpression(operands[1], 'ProductName', 'equals', 'Ignite UI for JavaScript');
        }));

        it('Should generate "in" condition when selecting more than two values.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            checkbox[4].click(); // NetAdvantage
            tick();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(3);
            const operands =
                (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                    .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(1);
            verifyFilteringExpression(operands[0], 'ProductName', 'in',
                new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage']));
        }));

        it('Should not throw error when selecting more than two values and column dataType is date.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();

            checkbox[2].click();
            checkbox[3].click();
            checkbox[4].click();
            checkbox[6].click();
            tick();
            fix.detectChanges();

            expect(() => {
                GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            }).not.toThrowError();
        }));

        it('Should generate "in" and "empty" conditions when selecting more than two values including (Blanks).', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();

            checkbox[1].click(); // (Blanks)
            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            tick();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            tick();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(6);
            const operands =
                (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                    .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'in',
                new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript']));
            verifyFilteringExpression(operands[1], 'ProductName', 'empty', null);
        }));

        it('should not display search scrollbar when not needed for the current size', (async () => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.getCellByColumn(3, 'ProductName').update('Test');
            fix.detectChanges();

            // Verify scrollbar is visible for 'comfortable'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix)).toBe(true, 'excel search scrollbar should be visible');
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, Size.Medium);
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'cosy'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix)).toBe(false, 'excel search scrollbar should NOT be visible');
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, Size.Small);
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'compact'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCE_TIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix)).toBe(false, 'excel search scrollbar should NOT be visible');
        }));

        it('Should cascade filter the available filter options.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', '0', '20', '100', '127', '254'],
                [true, true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                    'NetAdvantage', 'Some other item with Script'],
                [true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'False', 'True'],
                [true, true, true, true]);

            toggleExcelStyleFilteringItems(fix, true, 3);

            expect(grid.rowList.length).toBe(5);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'False', 'True'],
                [null, true, true, false]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '20', '100', '254', '702', '1,000'],
                [true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'],
                [true, true, true, true, true]);

            toggleExcelStyleFilteringItems(fix, false, 0);
            toggleExcelStyleFilteringItems(fix, true, 2, 3);

            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'False'],
                [true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'],
                [null, false, true, true, false]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '20', '254'],
                [true, true, true]);
        }));

        it('Should correctly modify existing filters.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                    'NetAdvantage', 'Some other item with Script'],
                [true, true, true, true, true, true]);
            toggleExcelStyleFilteringItems(fix, true, 1, 5);
            expect(grid.rowList.length).toBe(3);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '20', '127', '254'],
                [true, true, true, true]);
            toggleExcelStyleFilteringItems(fix, true, 2);
            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'],
                [true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '20', '127', '254'],
                [null, true, false, true]);
            toggleExcelStyleFilteringItems(fix, true, 1, 2, 3);
            expect(grid.rowList.length).toBe(1);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '20', '127', '254'],
                [null, false, true, false]);
        }));

        it('Should correctly modify the first one of the existing filters.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                    'NetAdvantage', 'Some other item with Script'],
                [true, true, true, true, true, true]);
            toggleExcelStyleFilteringItems(fix, true, 1, 5);
            expect(grid.rowList.length).toBe(3);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '20', '127', '254'],
                [true, true, true, true]);
            toggleExcelStyleFilteringItems(fix, true, 2);
            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'],
                [true, true, true]);
            toggleExcelStyleFilteringItems(fix, true, 1);
            expect(grid.rowList.length).toBe(1);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '254'],
                [true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'],
                [null, false, true]);
        }));

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
            expect(excelMenuRect.left >= gridRect.left).toBe(true, 'ESF spans outside the grid on the left');
            expect(excelMenuRect.top >= gridRect.top).toBe(true, 'ESF spans outside the grid on the top');
            expect(excelMenuRect.right <= gridRect.right).toBe(true, 'ESF spans outside the grid on the right');
        });

        it('Should add/remove expressions in custom filter dialog through UI correctly.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            // Verify expressions count.
            let expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
            expect(expressions.length).toBe(2);

            // Add two new expressions.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            tick(100);
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
        }));

        it('Should keep selected operator of custom expression the same when clicking it.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            // Verify 'And' button is selected on first expression.
            let andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            ControlsFunction.verifyButtonIsSelected(andButton);

            // Click the 'And' button.
            andButton.click();
            tick(100);
            fix.detectChanges();

            // Verify that selected button remains the same.
            andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            ControlsFunction.verifyButtonIsSelected(andButton);

            const orButton = GridFunctions.getExcelCustomFilteringExpressionOrButton(fix);
            ControlsFunction.verifyButtonIsSelected(orButton, false);
        }));

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

        it('Should open conditions dropdown of custom expression with \'Alt + Arrow Down\'.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[0];
            const conditionsInput = GridFunctions.getExcelFilteringDDInput(fix);

            // Dropdown should be hidden.
            let operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).not.toBeNull();

            // Press 'Alt + Arrow Down' to open operators dropdown.
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', conditionsInput, true, true);
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
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

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
            tick(100);
            fix.detectChanges();

            // Verify calendar is not opened.
            calendar = fix.debugElement.query(By.directive(IgxCalendarComponent));
            expect(calendar).toBeNull();
        }));

        it('Should filter grid through custom date filter dialog.', fakeAsync(() => {
            const column = grid.getColumnByName('ReleaseDate');
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).not.toContain('(');
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-days-view__date--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            tick(100);
            fix.detectChanges();
            flush();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const inputText = formatDate(filteredDate, column.pipeArgs.format, grid.locale);
            expect((input as HTMLInputElement).value).toMatch(inputText);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        }));

        it('Should take pipeArgs weekStart property as calendar\'s default.', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Get Calendar component.
            const calendar = document.querySelector('igx-calendar');

            const daysOfWeek = calendar.querySelector('.igx-days-view__row');
            const weekStart = daysOfWeek.firstElementChild as HTMLSpanElement;

            expect(weekStart.innerText).toMatch('Fri');
        }));

        it('Should filter grid with ISO 8601 dates through custom date filter dialog', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();
            const column = grid.getColumnByName('ReleaseDate');

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-days-view__date--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            tick(100);
            fix.detectChanges();
            flush();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const inputText = formatDate(filteredDate, column.pipeArgs.format, grid.locale);
            expect((input as HTMLInputElement).value).toMatch(inputText);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        }));

        it('Should filter grid with milliseconds dates through custom date filter dialog', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();
            const column = grid.getColumnByName('ReleaseDate');

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-days-view__date--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            tick(100);
            fix.detectChanges();
            flush();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const inputText = formatDate(filteredDate, column.pipeArgs.format, grid.locale);
            expect((input as HTMLInputElement).value).toMatch(inputText);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        }));

        it('DateTime: Should use editorOptions.dateTimeFormat as inputFormat to the filter editor in the custom filtering dialog', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });
            const column = grid.getColumnByName('ReleaseDateTime');
            column.editorOptions = {
                dateTimeFormat: 'dd-MM-yyyy HH:mm aaaaa'
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const dateTimeEditor = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                                    .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat).toMatch(column.editorOptions.dateTimeFormat);
            expect(dateTimeEditor.displayFormat).toMatch(column.pipeArgs.format);
        }));

        it('DateTime: Should use pipeArgs.format as inputFormat to the filter editor in the custom filtering dialog if editorOptions.dateTimeFormat not set', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });
            const column = grid.getColumnByName('ReleaseDateTime');
            column.pipeArgs = {
                format: 'dd-MM-yyyy'
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                                                            .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat.normalize('NFKC')).toMatch('dd-MM-yyyy');
            expect(dateTimeEditorDirective.displayFormat.normalize('NFKC')).toMatch('dd-MM-yyyy');
        }));

        it('DateTime: custom filtering dialog input locale should be set as the grid locale', fakeAsync(() => {
            registerLocaleData(localeBg, 'bg');
            grid.locale = 'bg';
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                                            .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.locale).toMatch(grid.locale);
        }));

        it('Time: Should use editorOptions.dateTimeFormat as inputFormat to the filter editor in the custom filtering dialog', fakeAsync(() => {
            const column = grid.getColumnByName('ReleaseTime');
            column.editorOptions = {
                dateTimeFormat: 'HH:mm'
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                                            .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat).toMatch(column.editorOptions.dateTimeFormat);
            expect(dateTimeEditorDirective.displayFormat).toMatch(column.pipeArgs.format);
        }));

        it('Time: Should use pipeArgs.format as inputFormat to the filter editor in the custom filtering dialog if editorOptions.dateTimeFormat not set', fakeAsync(() => {
            const column = grid.getColumnByName('ReleaseTime');
            column.pipeArgs = {
                format: 'HH:mm'
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                                            .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat).toMatch(column.pipeArgs.format);
            expect(dateTimeEditorDirective.displayFormat).toMatch(column.pipeArgs.format);
        }));
        it('Should filter grid through custom date filter dialog when using pipeArgs for the column', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-days-view__date--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            tick(100);
            fix.detectChanges();
            flush();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const inputText = formatDate(filteredDate, column.pipeArgs.format, grid.locale);
            expect((input as HTMLInputElement).value).toMatch(inputText);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        }));

        it('Should filter grid through custom date filter dialog when using pipeArgs and formatter for the column', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();
            tick(350); // calendar animationDone timeout

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-days-view__date--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            tick();
            fix.detectChanges();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const inputText = column.formatter(filteredDate, null);
            expect((input as HTMLInputElement).value).toMatch(inputText);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const cellText = column.formatter(filteredDate, null);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        }));

        it('Should correctly update \'SelectAll\' based on checkboxes.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const visibleListItems = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const thirdItemCbInput = visibleListItems[2];

            // Verify 'Select All' checkbox is not indeterminate.
            const selectAllCheckbox = visibleListItems[0];
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement);

            // Uncheck third list item.
            UIInteractions.simulateClickEvent(thirdItemCbInput);
            tick(100);
            fix.detectChanges();

            // Verify 'Select All' checkbox is indeterminate.
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement, true, true);

            // Check third list item again.
            UIInteractions.simulateClickEvent(thirdItemCbInput);
            tick(100);
            fix.detectChanges();

            // Verify 'Select All' checkbox is not indeterminate.
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement);
        }));

        it('Should correctly update all items based on \'SelectAll\' checkbox.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const visibleListItems = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const dataListItems = visibleListItems.slice(1, visibleListItems.length);

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement);
            }

            // Click 'Select All' checkbox.
            let selectAllCbInput = visibleListItems[0];
            UIInteractions.simulateClickEvent(selectAllCbInput);
            tick(100);
            fix.detectChanges();

            // Verify all visible data list items are unchecked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement, false);
            }

            // Click 'Select All' checkbox.
            selectAllCbInput = visibleListItems[0];
            UIInteractions.simulateClickEvent(selectAllCbInput);
            tick(100);
            fix.detectChanges();

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement);
            }
        }));

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

        it('Should open custom filter dropdown when pressing \'Enter\' on custom filter cascade button.', fakeAsync(() => {
            grid.width = '700px';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            tick(100);
            fix.detectChanges();

            const cascadeButton = GridFunctions.getExcelFilterCascadeButton(fix);

            // Verify that custom filter dropdown (the submenu) is not visible.
            let subMenu = fix.nativeElement.querySelector('.igx-drop-down__list.igx-toggle--hidden');
            expect(subMenu).not.toBeNull();

            cascadeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick(100);
            fix.detectChanges();


            // Verify that custom filter dropdown (the submenu) is visible.
            subMenu = fix.nativeElement.querySelector('.igx-drop-down__list.igx-toggle--hidden');
            expect(subMenu).toBeNull();
        }));

        it('Should close ESF when pressing \'Escape\'.', fakeAsync(() => {
            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            // Verify ESF is not visible.
            expect(excelMenu).toBeNull();

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            tick(100);
            fix.detectChanges();

            // Verify ESF is visible.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();

            excelMenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            tick(100);
            fix.detectChanges();

            // Verify ESF is not visible.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();
        }));

        it('Should open/close ESF menu for respective column when pressing \'ctrl + shift + l\' on its filterCell chip.',
            fakeAsync(() => {
                let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
                // Verify ESF is not visible.
                expect(excelMenu).toBeNull();

                const downloadsColumn = GridFunctions.getColumnHeader('Downloads', fix);
                UIInteractions.simulateClickAndSelectEvent(downloadsColumn);
                fix.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('l', downloadsColumn.nativeElement, true, false, true, true);
                tick(200);
                fix.detectChanges();

                // Verify ESF menu is opened for the 'Downloads' column.
                excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
                expect(excelMenu).not.toBeNull();

                // Press the combination again.
                UIInteractions.triggerKeyDownEvtUponElem('l', excelMenu, true, false, true, true);
                tick(200);
                fix.detectChanges();

                excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
                expect(excelMenu).toBeNull();
            }));

        it('Should filter ISO 8601 dates for date column ignoring the time portion - issue #14643', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu)[1];

            checkbox.click();
            tick();
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
            expect(rows.length).toBe(6, 'incorrect number of rows');

            //Check if checkboxes have correct state on ESF menu reopening
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();

            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix));
            expect(checkboxes[0].indeterminate).toBeTrue();
            expect(checkboxes[1].checked).toBeFalse();
            const listItemsCheckboxes = checkboxes.slice(2, checkboxes.length-1);
            for (const checkboxItem of listItemsCheckboxes) {
                ControlsFunction.verifyCheckboxState(checkboxItem.parentElement);
            }
        }));

        it('Should filter date by input string', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
        }));

        it('Should filter ISO 8601 date by input string', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
        }));

        it('Should filter milliseconds date by input string', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
        }));

        it('Should ignore duplicate records when column\'s filteringIgnoreCase is true', fakeAsync(() => {
            const column = grid.getColumnByName('AnotherField');
            expect(column.filteringIgnoreCase).toBeTrue();

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            tick(100);
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', 'a', 'Custom'],
                [true, true, true]);
        }));

        it('Should not ignore duplicate records when column\'s filteringIgnoreCase is false', fakeAsync(() => {
            const column = grid.getColumnByName('AnotherField');
            column.filteringIgnoreCase = false;
            expect(column.filteringIgnoreCase).toBeFalse();

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            tick(100);
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', 'a', 'Custom', 'custoM', 'custom'],
                [true, true, true, true, true]);
        }));

        it('Should display "Add to current filter selection" button on typing in input', fakeAsync(() => {
            // Open excel style filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            tick(100);
            fix.detectChanges();

            // Verify that the second item is 'Add to current filter selection'.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
            expect(listItems[1].innerText).toBe('Add current selection to filter');
        }));

        it('Should filter grid the same way as in Excel', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            tick(100);
            fix.detectChanges();

            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();

            // Get the results and verify that they match the list items.
            let gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(4);
            expect(gridCellValues).toEqual(listItems);

            // Open excel style custom filtering dialog again.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '5', fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();

            // Get the results and verify that they match the list items.
            gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(1);
            expect(gridCellValues).toEqual(listItems);
        }));

        it('Should filter grid correctly with case insensitive duplicates', fakeAsync(() => {
            grid.data = SampleTestData.excelFilteringDataDuplicateValues();
            fix.detectChanges();
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'AnotherField');

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'cust', fix);
            tick(100);
            fix.detectChanges();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            tick(100);
            fix.detectChanges();

            // Get the results and verify their count.
            const gridCellValues = GridFunctions.getColumnCells(fix, 'AnotherField')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(5);
        }));

        it('Should disable the apply button when there are no results.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix) as HTMLElement;
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '3', fix);
            tick(100);
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(applyButton);
        }));

        it('Should be able to navigate inside the search list items', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchComponent.querySelector('igx-list');
            list.dispatchEvent(new Event('focus'));
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            const listItems = list.querySelectorAll('igx-list-item');

            // we expect only the first list item to be active when the list is focused
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBeTrue();
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBeFalse();

            // on arrow down the second item should be active
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBeFalse();
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBeTrue();

            // on arrow up the first item should be active again
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBeTrue();
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBeFalse();

            // on home the first item should be active
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', list, true);
            fix.detectChanges();
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBeTrue();
            UIInteractions.triggerKeyDownEvtUponElem('home', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBeTrue();

            // on space key on the first item (select all) all the checkbox should deselect
            let checkboxes = list.querySelectorAll('igx-checkbox');
            let checkboxesStatus = Array.from(checkboxes).map((checkbox: Element) => checkbox.querySelector('input').checked);
            checkboxesStatus.forEach(status => {
                expect(status).toBeTrue();
            });
            UIInteractions.triggerKeyDownEvtUponElem('space', list, true);
            fix.detectChanges();
            checkboxes = list.querySelectorAll('igx-checkbox');
            checkboxesStatus = Array.from(checkboxes).map((checkbox: Element) => checkbox.querySelector('input').checked);
            checkboxesStatus.forEach(status => {
                expect(status).toBeFalse();
            });
        }));

        it('Should not lose focus with arrowUp/arrowDown when navigating inside search list', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchComponent.querySelector('igx-list');
            list.dispatchEvent(new Event('focus'));
            tick(DEBOUNCE_TIME);
            fix.detectChanges();
            const listItems = list.querySelectorAll('igx-list-item');

            // we expect only the first list item to be active when the list is focused
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBeTrue();
            expect(listItems[1].classList.contains("igx-list__item-base--active")).toBeFalse();

            // on arrow up the focus should stay on the first element and not on the search input
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', list, true);
            fix.detectChanges();
            expect(listItems[0].classList.contains("igx-list__item-base--active")).toBeTrue();
        }));

        it('Should add list items to current filtered items when "Add to current filter selection" is selected.', fakeAsync(() => {
            const totalListItems = [];

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '5', fix);
            fix.detectChanges();
            tick();

            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText);

            listItems.forEach(c => totalListItems.push(c));

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
            tick();

            // Get the results and verify that they match the list items.
            let gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText);

            expect(gridCellValues.length).toEqual(1);
            expect(gridCellValues).toEqual(totalListItems);

            // Open excel style custom filtering dialog again.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '7', fix);
            fix.detectChanges();
            tick();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText);

            listItems.forEach(c => totalListItems.push(c));
            totalListItems.sort();

            // Select 'Add to current filter selection'.
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkbox[1].click();
            fix.detectChanges();
            tick();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
            tick();

            // Get the results and verify that they match the list items.
            gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(3);
            expect(gridCellValues).toEqual(totalListItems);

            // Open excel style custom filtering dialog again.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            fix.detectChanges();
            tick();

            // Get checkboxes and verify 'Select All' is indeterminate.
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));
            expect(checkboxes[0].indeterminate).toBeTrue();
        }));

        it('Should commit and close ESF on pressing \'Enter\'', fakeAsync(() => {
            // Open excel style filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

            // Verify ESF is visible.
            expect(excelMenu).not.toBeNull();

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            tick(100);
            fix.detectChanges();

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Press 'Enter'
            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick(100);
            fix.detectChanges();

            const gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            // Verify that excel style filtering dialog is closed and data is filtered.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();
            expect(gridCellValues.length).toEqual(4);
            expect(gridCellValues).toEqual(listItems);
        }));

        it('Should clear input if there is text and \'Escape\' is pressed.', fakeAsync(() => {
            // Open excel style filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

            // Verify ESF is visible.
            expect(excelMenu).not.toBeNull();

            // Verify that the dialog is closed on pressing Escape.
            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fix.detectChanges();
            flush();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();

            // Open excel style filtering dialog again and type in the input.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);

            // Press Escape again and verify that ESF menu is still visible and the input is empty
            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            fix.detectChanges();
            flush();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();
            expect(inputNativeElement.value).toBe('', 'input isn\'t cleared correctly');
        }));

        it('Should clear search criteria when selecting clear column filters option.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            let checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            fix.detectChanges();

            checkboxes[0].click();
            tick();
            fix.detectChanges();

            checkboxes[2].click();
            tick();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            tick();
            fix.detectChanges();
            expect(grid.filteredData.length).toEqual(1);

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            flush();

            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'Net', fix);

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(3, 'incorrect rendered list items count');

            GridFunctions.clickClearFilterInExcelStyleFiltering(fix);
            flush();
            expect(grid.filteredData).toBeNull();

            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            expect(inputNativeElement.value).toBe('', 'search criteria is not cleared');

            checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const listItemsCheckboxes = checkboxes.slice(1, checkboxes.length);
            for (const checkbox of listItemsCheckboxes) {
                ControlsFunction.verifyCheckboxState(checkbox.parentElement);
            }
        }));

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
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select all search results', 'Add current selection to filter', 'Web'],
                [true, false, true]);

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

            expect(listItems.length).toBe(4, 'incorrect rendered list items count');
            expect(listItems[2].innerText).toBe('False', 'incorrect list item label');
            expect(listItems[3].innerText).toBe('True', 'incorrect list item label');

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

            expect(listItems.length).toBe(4, 'incorrect rendered list items count');
            expect(listItems[2].innerText).toBe('No', 'incorrect list item label');
            expect(listItems[3].innerText).toBe('Yes', 'incorrect list item label');
        });

        it('Should sort items in excel style search correctly', fakeAsync(() => {
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
            tick(100);
            fix.detectChanges();

            // Verify items order is case INsensitive
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', 'aWord', 'BWord'],
                [true, true, true]);

            // Open excel style custom filtering dialog for time column
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            tick(100);
            fix.detectChanges();

            // Verify items order is based only on time and not date
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '1:00:00 AM', '12:00:00 PM', '11:00:00 PM'],
                [true, true, true, true]);
        }));

        it('should clear all filters in the custom dialog when clicking "Clear Filter" button', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(100);
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 5);
            tick();
            fix.detectChanges();

            const expressions = GridFunctions.getExcelCustomFilteringDateExpressions(fix);
            const lastExpression = expressions[expressions.length - 1];
            (lastExpression.querySelector('igx-select').querySelector('igx-input-group') as HTMLElement).click();
            tick();
            fix.detectChanges();
            const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));

            const todayItem = dropdownList.children[0].children.find(item => item.nativeElement?.innerText === 'Today');
            todayItem.nativeElement.click();
            tick();
            fix.detectChanges();

            GridFunctions.clickClearFilterExcelStyleCustomFiltering(fix);
            tick();
            fix.detectChanges();

            GridFunctions.getExcelCustomFilteringDateExpressions(fix).forEach(expr => {
                const input = expr.children[0].querySelector('input');
                expect(input.value).toBe('');
            });
        }));

        it('should correctly filter negative decimal values in Excel Style filtering', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 2);
            tick();
            fix.detectChanges();

            GridFunctions.setInputValueESF(fix, 0, '-1');
            tick(100);
            fix.detectChanges();
            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toBe('-1');

            const applyButton = GridFunctions.getApplyExcelStyleCustomFiltering(fix);
            applyButton.click();
            tick(100);
            fix.detectChanges();

            expect(grid.filteredData.length).toBe(8);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 2);
            tick();
            fix.detectChanges();

            GridFunctions.setInputValueESF(fix, 0, '-0.1');
            tick(100);
            fix.detectChanges();
            expect(GridFunctions.getExcelFilteringInput(fix, 0).value).toBe('-0.1');

            applyButton.click();
            tick(100);
            fix.detectChanges();

            expect(grid.filteredData.length).toBe(8);
        }));
    });

    describe('Templates: ', () => {
        let fix; let grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringESFTemplatesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should use custom templates for ESF components instead of default ones.', fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringESFEmptyTemplatesComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;

            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            const filterableColumns = grid.columnList.filter((c) => c.filterable === true);
            for (const column of filterableColumns) {
                // Open ESF.
                GridFunctions.clickExcelFilterIcon(fix, column.field);
                tick(100);
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
        }));

        it('Should filter and clear the excel search component correctly from template', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');

            // Type string in search box.
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'ignite', fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(4, 'incorrect rendered list items count');

            // Clear filtering of ESF search.
            const clearIcon: any = Array.from(searchComponent.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'clear');
            clearIcon.click();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
            tick(100);
        }));

        it('Should move column left/right when clicking buttons from template', fakeAsync(() => {
            grid.moving = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            const moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveLeft.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[2].field).toBe('ProductName');
            expect(grid.columns[1].field).toBe('Downloads');

            moveLeft.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[1].field).toBe('ID');
            expect(grid.columns[0].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft);

            moveRight.click();
            tick();
            fix.detectChanges();

            expect(grid.columns[0].field).toBe('ID');
            expect(grid.columns[1].field).toBe('Downloads');
            ControlsFunction.verifyButtonIsDisabled(moveLeft, false);
        }));

        it('should select/deselect column in external ESF template when interact with the column selection item through esf menu', () => {
            fix = TestBed.createComponent(IgxGridExternalESFTemplateComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();

            // Test in single multiple mode
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            spyOn(grid.columnSelectionChanging, 'emit');
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

        it('Should reset esf menu with templates on column change', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            flush();

            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 20, fix);

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(3, 'incorrect rendered list items count');

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            flush();

            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix);
            expect(inputNativeElement.value).toBe('', 'input value didn\'t reset');
        }));

        it('Should reset blank items on column change.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            flush();

            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[1].innerText).toBe('(Blanks)');

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'AnotherField');
            flush();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[1].innerText).not.toBe('(Blanks)');
        }));

        it('Should use custom excel style filter icon instead of default one.', fakeAsync(() => {
            const header = GridFunctions.getColumnHeader('AnotherField', fix);
            fix.detectChanges();
            const icon = GridFunctions.getHeaderFilterIcon(header);
            fix.detectChanges();
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('filter_alt');
        }));

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
            scrollbar.scrollTop = 3000;
            await wait();
            fix.detectChanges();

            // Select another column
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await wait();
            fix.detectChanges();

            // Update scrollbar
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            await wait();
            fix.detectChanges();

            // Get the display container and its parent and verify that the display container is at start
            const displayContainer = searchComponent.querySelector('igx-display-container');
            const displayContainerRect = displayContainer.getBoundingClientRect();
            const parentContainerRect = displayContainer.parentElement.getBoundingClientRect();

            expect(displayContainerRect.top - parentContainerRect.top <= 1).toBe(true, 'search scrollbar did not reset');
        });
    });

    describe('Load values on demand', () => {
        let fix;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringESFLoadOnDemandComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Verify unique values are loaded correctly in ESF search component.', fakeAsync(() => {
            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(400);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).not.toBeNull('esf loading indicator is not visible');

            // Wait for items to load.
            tick(650);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Verify unique values are loaded correctly in ESF search component when using filtering strategy.', fakeAsync(() => {
            grid.uniqueColumnValuesStrategy = undefined;
            grid.filterStrategy = new LoadOnDemandFilterStrategy();
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(400);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).not.toBeNull('esf loading indicator is not visible');

            // Wait for items to load.
            tick(650);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Verify unique date values are loaded correctly in ESF search component.', fakeAsync(() => {
            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(400);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).not.toBeNull('esf loading indicator is not visible');

            // Wait for items to load.
            tick(650);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Verify unique ISO 8601 date values are loaded correctly in ESF search component.', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(400);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).not.toBeNull('esf loading indicator is not visible');

            // Wait for items to load.
            tick(650);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Verify unique milliseconds date values are loaded correctly in ESF search component.', fakeAsync(() => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(400);
            fix.detectChanges();

            // Verify items in search have not loaded yet and that the loading indicator is visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(0, 'incorrect rendered list items count');
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).not.toBeNull('esf loading indicator is not visible');

            // Wait for items to load.
            tick(650);

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Verify date values are displayed in correct format according to column pipeArgs', fakeAsync(() => {
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
            tick(1050);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');

            for (let i = 2; i < listItems.length; i++) {
                const label = datePipe.transform(dates[i - 2], formatOptions.format);
                expect(listItems[i].innerText).toBe(label);
            }

            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(1050);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');

            listItems.forEach((item, ind) => {
                expect(item.innerText).toBe(downloads[ind]);
            });
        }));

        it('Verify date values are displayed in correct format according to column formatter', fakeAsync(() => {
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
            tick(1050);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');

            expect(listItems[1].innerText).toBe('(Blanks)');
            for (let i = 2; i < listItems.length; i++) {
                const date = dates[i];
                const label = date !== null && date !== undefined && date !== '' ? datePipe.transform(date, 'longDate') : 'No value!';
                expect(listItems[i].innerText).toBe(label);
            }

            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Verify date values are displayed in correct format according to column formatter after filtering', fakeAsync(() => {
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
            tick(1050);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');

            const checkboxElements = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkboxElements[2].click();
            tick();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            tick(1050);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');

            expect(listItems[1].innerText).toBe('(Blanks)');
            for (let i = 2; i < listItems.length; i++) {
                const date = dates[i - 2];
                const label = date !== null && date !== undefined && date !== '' ? datePipe.transform(date, 'longDate') : 'No value!';
                expect(listItems[i].innerText).toBe(label);
            }

            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Done callback should be executed only once per column', fakeAsync(() => {
            const compInstance = fix.componentInstance as IgxGridFilteringESFLoadOnDemandComponent;
            // Open excel style custom filtering dialog and wait a bit.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(1000);
            fix.detectChanges();

            // Verify items in search have loaded and that the loading indicator is not visible.
            expect(compInstance.doneCallbackCounter).toBe(1, 'Incorrect done callback execution count');
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
            let loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(1000);
            fix.detectChanges();
            expect(compInstance.doneCallbackCounter).toBe(2, 'Incorrect done callback execution count');
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems.length).toBe(7, 'incorrect rendered list items count');
            loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix);
            expect(loadingIndicator).toBeNull('esf loading indicator is visible');
        }));

        it('Should not execute done callback for null column', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();

            expect(() => {
                GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
                tick(2000);
            }).not.toThrowError(/'dataType' of null/);
        }));
    });

    describe(null, () => {
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringMCHComponent);
            grid = fix.componentInstance.grid;
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        }));

        it('Should pin column next to already pinned group by moving it to the left.', fakeAsync(() => {
            // Test prerequisites
            grid.width = '1000px';
            fix.detectChanges();
            tick(100);
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
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickPinIconInExcelStyleFiltering(fix, false);
            tick(200);
            fix.detectChanges();

            // Verify 'AnotherField' column is not pinned.
            GridFunctions.verifyColumnIsPinned(column, false, 7);

            // Try to pin the 'AnotherField' column by moving it to the left.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'AnotherField');
            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            UIInteractions.simulateClickEvent(moveLeft);
            tick(DEBOUNCE_TIME);
            fix.detectChanges();

            // Verify 'AnotherField' column is successfully pinned next to the column group.
            GridFunctions.verifyColumnIsPinned(column, true, 8);
        }));
    });

    describe('External Excel Style Filtering', () => {
        let fix; let grid;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridExternalESFComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should allow hosting Excel Style filtering component outside of the grid.', fakeAsync(() => {
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
                'Ignite UI for JavaScript', 'NetAdvantage', 'Some other item with Script'],
                [true, true, true, true, true, true]);
            toggleExcelStyleFilteringItems(fix, true, 1, 4);
            expect(grid.rowList.length).toBe(3);

            // hide
            GridFunctions.clickHideIconInExcelStyleFiltering(fix, false);
            fix.detectChanges();
            expect(grid.columnList.get(1).hidden).toBeTruthy();
        }));

        it('Column selection button should be visible/hidden when column is selectable/not selectable', fakeAsync(() => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            let columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            expect(columnSelectionContainer).toBeNull();

            const esf = fix.componentInstance.esf;
            esf.column = grid.getColumnByName('Downloads');
            tick();
            fix.detectChanges();

            columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            expect(columnSelectionContainer).not.toBeNull();

            grid.columnSelection = GridSelectionMode.none;
            fix.detectChanges();
            fix.componentInstance.esf.cdr.detectChanges();

            columnSelectionContainer = GridFunctions.getExcelFilteringColumnSelectionContainer(fix);
            expect(columnSelectionContainer).toBeNull();
        }));

        it('should select/deselect column when interact with the column selection item through esf menu', fakeAsync(() => {
            // Test in single multiple mode
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            spyOn(grid.columnSelectionChanging, 'emit');
            const column = grid.getColumnByName('Downloads');
            fix.componentInstance.esf.column = column;
            tick();
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

        }));

        it('should discard filters through esf menu properly on cancel button click', fakeAsync(() => {
            grid.filter('ProductName', 'Ignite', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            expect(fix.debugElement.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(2);
            tick(200);
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            tick();
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(100);
            fix.detectChanges();
            GridFunctions.setOperatorESF(fix, 1, 0);
            GridFunctions.setInputValueESF(fix, 1, 'Angular');
            GridFunctions.clickCancelExcelStyleCustomFiltering(fix);

            expect(fix.debugElement.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).toContain('(1)');
            expect(grid.filteredData.length).toEqual(2);
        }));

    });
});

describe('IgxGrid - Custom Filtering Strategy #grid', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CustomFilteringStrategyComponent
            ]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(CustomFilteringStrategyComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
    }));

    it('Should be able to set custom filtering strategy', () => {
        expect(grid.filterStrategy).toBeDefined();
        expect(grid.filterStrategy).toBeInstanceOf(FilteringStrategy);
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();

        expect(grid.filterStrategy).toEqual(fix.componentInstance.strategy);
    });

    it('Should be able to override getFieldValue method', fakeAsync(() => {
        GridFunctions.clickFilterCellChipUI(fix, 'Name'); // Name column contains nested object as a value
        tick(150);
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('ca', fix);
        tick(DEBOUNCE_TIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCE_TIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([]);
        GridFunctions.resetFilterRow(fix);
        GridFunctions.closeFilterRow(fix);
        fix.detectChanges();

        // Apply the custom strategy and perform the same filter
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();
        GridFunctions.clickFilterCellChipUI(fix, 'Name'); // Name column contains nested object as a value
        tick(150);
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('ca', fix);
        tick(DEBOUNCE_TIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCE_TIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual(
            [{ ID: 1, Name: { FirstName: 'Casey', LastName: 'Houston' }, JobTitle: 'Vice President', Company: 'Company A' }]);
    }));

    it('Should be able to override findMatchByExpression method', fakeAsync(() => {
        GridFunctions.clickFilterCellChipUI(fix, 'JobTitle'); // Default strategy is case not sensitive
        tick(150);
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('direct', fix);
        tick(DEBOUNCE_TIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCE_TIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([
            { ID: 2, Name: { FirstName: 'Gilberto', LastName: 'Todd' }, JobTitle: 'Director', Company: 'Company C' },
            { ID: 3, Name: { FirstName: 'Tanya', LastName: 'Bennett' }, JobTitle: 'Director', Company: 'Company A' }]);
        GridFunctions.resetFilterRow(fix);
        GridFunctions.closeFilterRow(fix);
        fix.detectChanges();

        // Apply the custom strategy and perform the same filter
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();
        GridFunctions.clickFilterCellChipUI(fix, 'JobTitle');
        tick(150);
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('direct', fix);
        tick(DEBOUNCE_TIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCE_TIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([]);
    }));

    it('should use the custom filtering strategy when filter the grid through API method', fakeAsync(() => {
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();
        grid.filter('Name', 'D', IgxStringFilteringOperand.instance().condition('contains'));
        tick(DEBOUNCE_TIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([
            {
                ID: 7, Name: { FirstName: 'Debra', LastName: 'Morton' },
                JobTitle: 'Associate Software Developer', Company: 'Company B'
            },
            { ID: 10, Name: { FirstName: 'Eduardo', LastName: 'Ramirez' }, JobTitle: 'Manager', Company: 'Company E' }]);
    }));
});

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

const checkUIForType = (type: string, elem: DebugElement) => {
    let expectedConditions;
    let expectedInputType;
    const isReadOnly = type === 'bool' ? true : false;
    switch (type) {
        case 'string':
            expectedConditions = IgxStringFilteringOperand.instance().operations.filter(f => !f.hidden);
            expectedInputType = 'text';
            break;
        case 'number':
            expectedConditions = IgxNumberFilteringOperand.instance().operations.filter(f => !f.hidden);
            expectedInputType = 'number';
            break;
        case 'date':
            expectedConditions = IgxDateFilteringOperand.instance().operations.filter(f => !f.hidden);
            expectedInputType = 'datePicker';
            break;
        case 'bool':
            expectedConditions = IgxBooleanFilteringOperand.instance().operations.filter(f => !f.hidden);
            expectedInputType = 'text';
            break;
        case 'dateTime':
            expectedConditions = IgxDateTimeFilteringOperand.instance().operations.filter(f => !f.hidden);
            expectedInputType = 'text';
            break;
        case 'time':
            expectedConditions = IgxTimeFilteringOperand.instance().operations.filter(f => !f.hidden);
            expectedInputType = 'timePicker';
            break;
    }
    GridFunctions.openFilterDD(elem);
    const ddList = elem.query(By.css('div.igx-drop-down__list-scroll'));
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
};

const verifyExcelStyleFilteringSize = (fix: ComponentFixture<any>, expectedSize: Size) => {
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

const verifyPinningHidingSize = (fix: ComponentFixture<any>, expectedSize: Size) => {
    // Get excel style dialog
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

    // Get column pinning and column hiding icons from header (if present at all)
    const headerTitle = excelMenu.querySelector('h4');
    const headerIcons: DebugElement[] = GridFunctions.getExcelFilteringHeaderIconsDebugElements(fix, excelMenu);
    const headerAreaPinIcon: HTMLElement =
        headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === "pin")?.nativeElement;
    const headerAreaUnpinIcon: HTMLElement
        = headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === "unpin")?.nativeElement;
    const headerAreaColumnHidingIcon: HTMLElement =
        headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === 'hide')?.nativeElement;

    // Get column pinning and column hiding icons from actionsArea (if present at all)
    const actionsPinArea = GridFunctions.getExcelFilteringPinContainer(fix, excelMenu);
    const actionsAreaColumnHidingIcon = GridFunctions.getExcelFilteringHideContainer(fix, excelMenu);

    if (expectedSize === Size.Large) {
        // Verify icons in header are not present.
        expect(headerAreaPinIcon === null || headerAreaPinIcon === undefined).toBe(true,
            'headerArea pin icon is present');
        expect(headerAreaUnpinIcon === null || headerAreaUnpinIcon === undefined).toBe(true,
            'headerArea unpin icon is present');
        expect(headerAreaColumnHidingIcon === null || headerAreaColumnHidingIcon === undefined).toBe(true,
            'headerArea column hiding icon is present');
        // Verify icons in actions area are present.
        expect(actionsPinArea !== null).toBe(true, 'actionsArea pin/unpin icon is  NOT present');
        expect(actionsAreaColumnHidingIcon).not.toBeNull('actionsArea column hiding icon is  NOT present');
    } else {
        // Verify icons in header are present.
        expect((headerAreaPinIcon !== null) || (headerAreaUnpinIcon !== null)).toBe(true,
            'headerArea pin/unpin icon is  NOT present');
        expect(headerAreaColumnHidingIcon).not.toBeNull('headerArea column hiding icon is  NOT present');
        // Verify icons in actions area are not present.
        expect(actionsPinArea).toBeNull('actionsArea pin icon is present');
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
};

const verifySortMoveSize = (fix: ComponentFixture<any>, expectedSize: Size) => {
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

    const isSmall = expectedSize === Size.Small;
    // Verify sort buttons are on right of the sort title if size is 'small'
    // or that they are under the sort title if size is not 'small'.
    expect(sortHeaderRect.right <= sortButtons[0].getBoundingClientRect().left).toBe(isSmall,
        'incorrect sort button horizontal position based on the sort title');
    expect(sortHeaderRect.right <= sortButtons[1].getBoundingClientRect().left).toBe(isSmall,
        'incorrect sort button horizontal position based on the sort title');
    expect(sortHeaderRect.bottom <= sortButtons[0].getBoundingClientRect().top).toBe(!isSmall,
        'incorrect sort button vertical position based on the sort title');
    expect(sortHeaderRect.bottom <= sortButtons[1].getBoundingClientRect().top).toBe(!isSmall,
        'incorrect sort button vertical position based on the sort title');
    // Verify move buttons are on right of the move title if size is 'small'
    // or that they are under the sort title if size is not 'small'.
    expect(moveHeaderRect.right < moveButtons[0].getBoundingClientRect().left).toBe(isSmall,
        'incorrect move button horizontal position based on the sort title');
    expect(moveHeaderRect.right < moveButtons[1].getBoundingClientRect().left).toBe(isSmall,
        'incorrect move button horizontal position based on the sort title');
    expect(moveHeaderRect.bottom <= moveButtons[0].getBoundingClientRect().top).toBe(!isSmall,
        'incorrect move button vertical position based on the sort title');
    expect(moveHeaderRect.bottom <= moveButtons[1].getBoundingClientRect().top).toBe(!isSmall,
        'incorrect move button vertical position based on the sort title');
};

const verifyExcelCustomFilterSize = (fix: ComponentFixture<any>, expectedSize: Size) => {
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
        expect(getComponentSize(inputGroup)).toBe(expectedSize, 'incorrect inputGroup size in custom filter dialog');
    });
};

const verifyGridSubmenuSize = (gridNativeElement: HTMLElement, expectedSize: Size) => {
    const outlet = gridNativeElement.querySelector('.igx-grid__outlet');
    const dropdowns = Array.from(outlet.querySelectorAll('.igx-drop-down__list'));
    const visibleDropdown: any = dropdowns.find((d) => !d.classList.contains('igx-toggle--hidden'));
    const dropdownItems = visibleDropdown.querySelectorAll('igx-drop-down-item');

    dropdownItems.forEach((dropdownItem) => {
        expect(getComponentSize(dropdownItem)).toBe(expectedSize, 'incorrect dropdown item size');
    });
};

const verifyFilteringExpression = (operand: IFilteringExpression, fieldName: string, conditionName: string, searchVal: any) => {
    expect(operand.fieldName).toBe(fieldName);
    expect(operand.condition.name).toBe(conditionName);
    expect(operand.searchVal).toEqual(searchVal);
};

const verifyExcelStyleFilterAvailableOptions = (fix, labels: string[], checked: boolean[]) => {
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
    const labelElements: any[] = Array.from(GridFunctions.getExcelStyleSearchComponentListItems(fix, excelMenu));
    const checkboxElements: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

    expect(labelElements.length).toBe(labels.length, 'incorrect rendered list items count');
    labels.forEach((l, index) => {
        expect(l).toEqual(labelElements[index].innerText);
    });
    checked.forEach((c, index) => {
        expect(checkboxElements[index].indeterminate ? null : checkboxElements[index].checked).toEqual(c);
    });
};

const toggleExcelStyleFilteringItems = (fix, shouldApply: boolean, ...itemIndices: number[]) => {
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
    const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

    for (const index of itemIndices) {
        checkbox[index].click();
    }
    tick();
    fix.detectChanges();

    if (shouldApply) {
        GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
        tick();
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
const verifyChipVisibility = (fix, index: number, shouldBeFullyVisible: boolean) => {
    const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
    const visibleChipArea = filteringRow.query(By.css('.igx-grid__filtering-row-main'));
    const visibleChipAreaRect = visibleChipArea.nativeElement.getBoundingClientRect();

    const chip = GridFunctions.getFilterConditionChip(fix, index);
    const chipRect = chip.getBoundingClientRect();

    expect(chipRect.left >= visibleChipAreaRect.left && chipRect.right <= visibleChipAreaRect.right)
        .toBe(shouldBeFullyVisible, 'chip[' + index + '] visibility is incorrect');
};

const emitFilteringDoneOnResetClick = (fix, grid, filterVal: any, columnName: string, condition) => {
    filterGrid(fix, grid, columnName, filterVal, condition);

    const filteringExpressions = grid.filteringExpressionsTree.find(columnName) as FilteringExpressionsTree;
    verifyEmitFilteringDone(grid, filteringExpressions, 1);

    GridFunctions.clickFilterCellChip(fix, columnName);
    GridFunctions.resetFilterRow(fix);

    const emptyFilter = new FilteringExpressionsTree(null, columnName);
    verifyEmitFilteringDone(grid, emptyFilter, 2);

    const filterUiRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const reset = filterUiRow.queryAll(By.css('button'))[0];
    expect(reset.nativeElement.classList.contains('igx-button--disabled')).toEqual(true);
};

const emitFilteringDoneOnInputClear = (fix, grid, filterVal, columnName, condition) => {
    filterGrid(fix, grid, columnName, filterVal, condition);

    GridFunctions.clickFilterCellChip(fix, columnName);

    grid.filteringRow.onClearClick();
    tick(100);
    fix.detectChanges();

    const emptyFilter = new FilteringExpressionsTree(null, columnName);
    verifyEmitFilteringDone(grid, emptyFilter, 2);
};

const verifyRemoveChipFromHeader = (fix, grid, filterVal, columnName, condition, rowListLength, cellIndex) => {
    filterGrid(fix, grid, columnName, filterVal, condition);

    const filteringExpressions = grid.filteringExpressionsTree.find(columnName) as FilteringExpressionsTree;
    verifyEmitFilteringDone(grid, filteringExpressions, 1);

    const filteringCells = GridFunctions.getFilteringCells(fix);
    const stringCellChip = filteringCells[cellIndex].query(By.css('igx-chip'));

    // remove chip
    ControlsFunction.clickChipRemoveButton(stringCellChip.nativeElement);
    tick(30);
    fix.detectChanges();

    expect(grid.rowList.length).toEqual(8);

    const emptyFilter = new FilteringExpressionsTree(null, columnName);
    verifyEmitFilteringDone(grid, emptyFilter, 2);
};

const closeChipFromFilteringUIRow = (fix, grid, columnName, index) => {
    GridFunctions.clickFilterCellChip(fix, columnName);

    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const close = filterUIRow.queryAll(By.css('button'))[1];

    GridFunctions.openFilterDDAndSelectCondition(fix, index);

    close.triggerEventHandler('click', null);
    tick();
    fix.detectChanges();

    const filteringExpressions = grid.filteringExpressionsTree.find(columnName) as FilteringExpressionsTree;
    verifyEmitFilteringDone(grid, filteringExpressions, 1);
};

const verifyEmitFilteringDone = (grid, filteringExpressions, calledTimes) => {
    const args = { owner: grid, cancel: false, filteringExpressions };
    expect(grid.filtering.emit).toHaveBeenCalledWith(args);
    expect(grid.filtering.emit).toHaveBeenCalledTimes(calledTimes);
    expect(grid.filteringDone.emit).toHaveBeenCalledWith(filteringExpressions);
    expect(grid.filteringDone.emit).toHaveBeenCalledTimes(calledTimes);
};

const filterGrid = (fix, grid, columnName, filterVal, condition) => {
    grid.filter(columnName, filterVal, condition);
    tick(100);
    fix.detectChanges();
};
