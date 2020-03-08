import { DebugElement } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxStringFilteringOperand
} from '../../data-operations/filtering-condition';
import { IgxDatePickerComponent } from '../../date-picker/date-picker.component';
import { IgxGridFilteringCellComponent } from '../filtering/base/grid-filtering-cell.component';
import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxGridFilteringRowComponent } from '../filtering/base/grid-filtering-row.component';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { IgxBadgeComponent } from '../../badge/badge.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { changei18n, getCurrentResourceStrings } from '../../core/i18n/resources';
import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { IgxChipComponent } from '../../chips/chip.component';
import { IgxGridExcelStyleFilteringModule } from '../filtering/excel-style/grid.excel-style-filtering.module';
import { DisplayDensity } from '../../core/density';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent,
    IgxGridFilteringScrollComponent,
    IgxGridFilteringMCHComponent,
    IgxGridFilteringTemplateComponent,
    IgxGridFilteringESFTemplatesComponent,
    IgxGridFilteringESFLoadOnDemandComponent,
    CustomFilteringStrategyComponent,
    IgxGridExternalESFComponent
} from '../../test-utils/grid-samples.spec';
import { GridSelectionMode, FilterMode } from '../common/enums';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';

const DEBOUNCETIME = 30;
const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CELL = 'igx-grid-filtering-cell';

describe('IgxGrid - Filtering Row UI actions #grid', () => {
    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent,
                IgxGridFilteringScrollComponent,
                IgxGridFilteringMCHComponent,
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
        let fix: ComponentFixture<any>;
        let grid: IgxGridComponent;
        const cal = SampleTestData.timeGenerator;
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
            tick(DEBOUNCETIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            UIInteractions.triggerEventHandlerKeyDown(' ', prefix);
            tick(DEBOUNCETIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);

            UIInteractions.triggerEventHandlerKeyDown('Enter', input);
            tick(DEBOUNCETIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            UIInteractions.triggerEventHandlerKeyDown('Tab', prefix);
            tick(DEBOUNCETIME);
            fix.detectChanges();
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);

            UIInteractions.triggerEventHandlerKeyDown(' ', input);
            tick(DEBOUNCETIME);
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

            const currentDay = calendar.querySelector('.igx-calendar__date--current');

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

            calendar.querySelector('.igx-calendar__date--current');
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

        it('Should emit onFilteringDone when we clicked reset', fakeAsync(() => {
            const filterVal = 'search';
            const columnName = 'ProductName';

            grid.filter(columnName, filterVal, IgxStringFilteringOperand.instance().condition('contains'));
            tick(100);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, columnName);
            spyOn(grid.onFilteringDone, 'emit');

            GridFunctions.resetFilterRow(fix);

            expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(null);
            expect(grid.onFilteringDone.emit).toHaveBeenCalledTimes(1);
            const filterUiRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const reset = filterUiRow.queryAll(By.css('button'))[0];
            expect(reset.nativeElement.classList.contains('igx-button--disabled')).toEqual(true);
        }));

        it('Should emit onFilteringDone when clear the input of filteringUI', fakeAsync(() => {
            const columnName = 'ProductName';
            const filterValue = 'search';
            grid.filter(columnName, filterValue, IgxStringFilteringOperand.instance().condition('contains'));
            tick(100);
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, columnName);

            spyOn(grid.onFilteringDone, 'emit');

            grid.filteringRow.onClearClick();
            tick(100);
            fix.detectChanges();

            expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(null);
        }));

        it('Removing second condition removes the And/Or button', fakeAsync(() => {
            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'g',
                condition: IgxStringFilteringOperand.instance().condition('contains')
            };
            const expression1 = {
                fieldName: 'ProductName',
                searchVal: 'I',
                condition: IgxStringFilteringOperand.instance().condition('contains')
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
            const headerOfTypeNumber = gridheaders.find(gh => gh.nativeElement.classList.contains('igx-grid__th--number'));
            const filterCellsForTypeNumber = headerOfTypeNumber.parent.query(By.css(FILTER_UI_CELL));
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

        it('Should complete the filter when clicking the focusing out the input', fakeAsync(() => {
            const filterValue = 'an';
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            GridFunctions.typeValueInFilterRowInput(filterValue, fix);

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            const filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeTruthy();

            grid.nativeElement.focus();
            grid.filteringRow.onInputGroupFocusout();
            tick(100);
            fix.detectChanges();

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

            GridFunctions.clickFilterCellChip(fix, 'Downloads');

            const columnProductName = GridFunctions.getColumnHeader('ProductName', fix);
            columnProductName.triggerEventHandler('click', { stopPropagation: <any>((e: any) => { }) });
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
                expect(filteringCells.length).toBe(6);
                expect(filteringChips.length).toBe(5);

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
                    condition: IgxStringFilteringOperand.instance().condition('startsWith')
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

        it('should update UI when chip is removed from header cell.', fakeAsync(() => {
            grid.filter('ProductName', 'I', IgxStringFilteringOperand.instance().condition('startsWith'));
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(2);

            const filteringCells = GridFunctions.getFilteringCells(fix);
            const stringCellChip = filteringCells[1].query(By.css('igx-chip'));

            // remove chip
            ControlsFunction.clickChipRemoveButton(stringCellChip.nativeElement);
            fix.detectChanges();

            expect(grid.rowList.length).toEqual(8);
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
            grid.columns[1].width = '200px';
            fix.detectChanges();

            const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            const expression = {
                fieldName: 'ProductName',
                searchVal: 'Ignite',
                condition: IgxStringFilteringOperand.instance().condition('startsWith')
            };
            const expression1 = {
                fieldName: 'ProductName',
                searchVal: 'for',
                condition: IgxStringFilteringOperand.instance().condition('contains')
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

        it('Should close FilterRow when Escape is pressed.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            let filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));

            grid.filteringRow.onEscKeydown(UIInteractions.escapeEvent);
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
            const close = editingBtns.queryAll(By.css('button'))[1];

            expect(close.nativeElement.innerText).toBe('Close');
            expect(reset.nativeElement.innerText).toBe('Reset');
        }));

        it('Should correctly change resource strings for filter row using Changei18n.', fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            const strings = getCurrentResourceStrings();
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

            expect(close.nativeElement.innerText).toBe('My close');
            expect(reset.nativeElement.innerText).toBe('Reset');

            changei18n({
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

            expect(close.nativeElement.innerText).toBe('My close');
            expect(reset.nativeElement.innerText).toBe('Reset');
        }));

        it('should correctly apply locale to datePicker.', fakeAsync(() => {
            registerLocaleData(localeDE);
            fix.detectChanges();

            grid.locale = 'de-DE';
            tick(300);
            fix.detectChanges();

            const initialChips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const dateCellChip = initialChips[3].nativeElement;

            dateCellChip.click();
            fix.detectChanges();

            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));
            input.triggerEventHandler('click', null);
            tick();
            fix.detectChanges();

            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            const calendar = outlet.getElementsByClassName('igx-calendar')[0];

            const sundayLabel = calendar.querySelectorAll('.igx-calendar__label')[0].innerHTML;

            expect(sundayLabel.trim()).toEqual('So');
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

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', {});
            tick(100);
            fix.detectChanges();

            // Verify dropdown is opened
            GridFunctions.verifyFilteringDropDownIsOpened(fix);

            // Click prefix again to close conditions dropdown
            prefix.triggerEventHandler('click', {});
            tick(100);
            fix.detectChanges();

            // Verify dropdown is closed
            GridFunctions.verifyFilteringDropDownIsOpened(fix, false);
        }));

        it('should close \'conditions dropdown\' when navigate with Tab key', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            const prefix = GridFunctions.getFilterRowPrefix(fix);

            // Click prefix to open conditions dropdown
            prefix.triggerEventHandler('click', {});
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
            tick(DEBOUNCETIME);
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
            tick(DEBOUNCETIME);
            fix.detectChanges();

            filterChip = filterUIRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeNull();
            expect(grid.rowList.length).toEqual(8);
            verifyFilterRowUI(input, close, reset);
        }));

        it('Should commit the input and new chip after picking date from calendar for filtering.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ReleaseDate');

            // Click input to open calendar.
            const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
            const input = filteringRow.query(By.directive(IgxInputDirective));
            input.triggerEventHandler('click', null);
            tick(100);
            fix.detectChanges();

            // Click the today date.
            const outlet = document.getElementsByClassName('igx-grid__outlet')[0];
            const calendar = outlet.getElementsByClassName('igx-calendar')[0];
            const todayDayItem = calendar.querySelector('.igx-calendar__date--current');
            (<HTMLElement>todayDayItem).click();
            tick(200);
            fix.detectChanges();

            // Verify the chip and input are committed.
            const filterChip = filteringRow.query(By.directive(IgxChipComponent));
            expect(filterChip).toBeTruthy();
            expect(filterChip.componentInstance.selected).toBeFalsy();
            expect(input.nativeElement.value).toEqual('');
        }));

        it('Should navigate keyboard focus correctly between the filter row and the grid cells.', fakeAsync(() => {
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

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
                { fieldName: 'ProductName', searchVal: 'z', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'g', condition: IgxStringFilteringOperand.instance().condition('contains') }
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
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'z', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'g', condition: IgxStringFilteringOperand.instance().condition('contains') }
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

            GridFunctions.closeFilterRow(fix);
            tick(100);

            // Verify 'ReleaseDate' filter chip is fully visible.
            chip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0].nativeElement;
            chipRect = chip.getBoundingClientRect();
            gridRect = grid.nativeElement.getBoundingClientRect();
            expect(chipRect.left > gridRect.left && chipRect.right < gridRect.right).toBe(true,
                'chip should be fully visible and within grid');
        }));

        it('Verify condition chips are scrolled into/(out of) view by using arrow buttons.', (async () => {
            grid.width = '700px';
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains') }
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

        it('Should open filterRow for respective column when pressing \'Enter\' on its filterCell chip.', fakeAsync(() => {
            // Verify filterRow is not opened.
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).toBeNull();

            const filterCellChip = GridFunctions.getFilterChipsForColumn('ReleaseDate', fix)[0];
            UIInteractions.triggerEventHandlerKeyDown('Enter', filterCellChip);
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
            UIInteractions.triggerKeyDownEvtUponElem('Tab', filterCellChip.nativeElement, true);
            tick(200);
            fix.detectChanges();

            const firstRow = GridFunctions.getGridDataRows(fix)[0];
            const firstCell: any = Array.from(firstRow.querySelectorAll('igx-grid-cell'))[0];
            expect(document.activeElement).toBe(firstCell);
        }));

        it('Should remove first condition chip when click \'clear\' button and focus \'more\' icon.', fakeAsync(() => {
            grid.getColumnByName('ProductName').width = '160px';
            tick(DEBOUNCETIME);
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains') }
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
            const moreIcon = GridFunctions.getFilterIndicatorForColumn('ProductName', fix);
            expect(document.activeElement).toBe(moreIcon[0].nativeElement);

            // Verify new chip text.
            filterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
            expect(GridFunctions.getChipText(filterCellChip)).toBe('e');
        }));

        it('Should focus \'more\' icon when close filter row.', fakeAsync(() => {
            grid.getColumnByName('ProductName').width = '80px';
            tick(DEBOUNCETIME);
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            // Click more icon
            let moreIcon = GridFunctions.getFilterIndicatorForColumn('ProductName', fix)[0];
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
            tick(DEBOUNCETIME);

            moreIcon = GridFunctions.getFilterIndicatorForColumn('ProductName', fix)[0];
            expect(document.activeElement).toBe(moreIcon.nativeElement);
        }));

        it('Should update active element when click \'clear\' button of last chip and there is no \`more\` icon.', fakeAsync(() => {
            grid.getColumnByName('ProductName').width = '350px';
            tick(DEBOUNCETIME);
            fix.detectChanges();

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains') }
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
            tick(DEBOUNCETIME);
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
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains') }
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
            expect(() => { filterUIRow.componentInstance.onChipRemoved(null, chipToRemove); })
                .not.toThrowError(/\'id\' of undefined/);
            fix.detectChanges();
            await wait(500);
            fix.detectChanges();

            chipToRemove = filterUIRow.componentInstance.expressionsList[2];
            expect(() => { filterUIRow.componentInstance.onChipRemoved(null, chipToRemove); })
                .not.toThrowError(/\'id\' of undefined/);
            fix.detectChanges();
            await wait(100);
        }));

        it('should scroll correct chip in view when one is deleted', async () => {
            grid.width = '800px';
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'a', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'e', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickFilterCellChip(fix, 'ProductName');
            await wait(DEBOUNCETIME);

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
            tick(DEBOUNCETIME);

            // Change filterMode to 'excelStyleFilter`
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();

            // Verify the the filterRow is closed.
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).toBeNull('filterRow is visible');

            // Verify the ESF icons are visible.
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const thead = gridNativeElement.querySelector('.igx-grid__thead-wrapper');
            const filterIcons = thead.querySelectorAll('.igx-excel-filter__icon');
            expect(filterIcons.length).toEqual(4, 'incorrect esf filter icons count');

            // Verify the condition was submitted.
            const header = GridFunctions.getColumnHeader('ProductName', fix);
            const activeFilterIcon = header.nativeElement.querySelector('.igx-excel-filter__icon--filtered');
            expect(activeFilterIcon).toBeDefined('no active filter icon was found');
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
            () => {
                grid.filter('ProductName', 'Angular', IgxStringFilteringOperand.instance().condition('contains'));
                fix.detectChanges();

                // swap columns
                const stringCol = grid.getColumnByName('ProductName');
                const numberCol = grid.getColumnByName('Downloads');
                grid.moveColumn(stringCol, numberCol);
                fix.detectChanges();

                // check UI in filter cell is correct after moving
                const filteringCells = GridFunctions.getFilteringCells(fix);

                expect(GridFunctions.getChipText(filteringCells[2])).toEqual('Angular');
                expect(GridFunctions.getChipText(filteringCells[1])).toEqual('Filter');
            });

        // Filtering + Hiding
        it('should not display filter cell for hidden columns and chips should show under correct column.', fakeAsync(() => {
            grid.filter('ProductName', 'Angular', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            let filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(6);

            // hide column
            grid.getColumnByName('ID').hidden = true;
            fix.detectChanges();

            filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(5);
            expect(GridFunctions.getChipText(filteringCells[0])).toEqual('Angular');

            grid.getColumnByName('ProductName').hidden = true;
            fix.detectChanges();

            filteringCells = GridFunctions.getFilteringCells(fix);
            expect(filteringCells.length).toEqual(4);

            for (let i = 0; i < filteringCells.length; i++) {
                expect(GridFunctions.getChipText(filteringCells[i])).toEqual('Filter');
            }
        }));

        it('Should close filter row when hide the current column', fakeAsync(() => {
            pending('This issue is failing because of bug #');
            GridFunctions.clickFilterCellChip(fix, 'ProductName');

            // Check that the filterRow is opened
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            expect(filterUIRow).not.toBeNull();

            // Add first chip.
            GridFunctions.typeValueInFilterRowInput('a', fix);
            tick(100);

            grid.getColumnByName('ProductName').hidden = true;
            fix.detectChanges();
            tick(100);

            // Check that the filterRow is closed
            expect(fix.debugElement.query(By.css(FILTER_UI_ROW))).toBeNull();
            expect(grid.rowList.length).toBe(8);
        }));

        it('Should keep existing column filter after hiding another column.', fakeAsync(() => {
            // Add initial filtering conditions
            const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            const columnsFilteringTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
            columnsFilteringTree.filteringOperands = [
                { fieldName: 'ProductName', searchVal: 'x', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'y', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'i', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'g', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'n', condition: IgxStringFilteringOperand.instance().condition('contains') }
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
            const column = grid.columns.find((c) => c.field === 'Released');
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
        it('should position filter row correctly when grid has column groups.', fakeAsync(/** showHideArrowButtons rAF */() => {
            const thead = fix.debugElement.query(By.css('.igx-grid__thead-wrapper')).nativeElement;

            const filteringCells = GridFunctions.getFilteringCells(fix);
            const cellElem = filteringCells[0].nativeElement;
            expect(cellElem.offsetParent.offsetHeight + cellElem.offsetHeight).toBeCloseTo(thead.clientHeight, 10);

            GridFunctions.clickFilterCellChip(fix, 'ID');

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
                let filteringCells = GridFunctions.getFilteringCells(fix);
                expect(filteringCells.length).toEqual(6);

                const groupCol = grid.getColumnByName('General');
                groupCol.hidden = true;
                fix.detectChanges();

                filteringCells = GridFunctions.getFilteringCells(fix);
                expect(filteringCells.length).toEqual(1);

                GridFunctions.clickFilterCellChip(fix, 'AnotherField');
                fix.detectChanges();

                // check if it is positioned at the bottom of the thead.
                const thead = fix.debugElement.query(By.css('.igx-grid__thead-wrapper')).nativeElement;
                const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
                const frElem = filteringRow.nativeElement;
                expect(frElem.offsetTop + frElem.clientHeight).toEqual(thead.clientHeight);

                GridFunctions.closeFilterRow(fix);

                groupCol.hidden = false;
                fix.detectChanges();

                filteringCells = GridFunctions.getFilteringCells(fix);
                expect(filteringCells.length).toEqual(6);

                expect(GridFunctions.getChipText(filteringCells[1])).toEqual('Ignite');
            }));

        it('Should size grid correctly if enable/disable filtering in run time - MCH.', fakeAsync(() => {
            const head = grid.nativeElement.querySelector('.igx-grid__thead');
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
            grid.headerContainer.getScroll().scrollLeft = 300;
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
        let fix;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringTemplateComponent);
            fix.detectChanges();
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

describe('IgxGrid - Filtering actions - Excel style filtering #grid', () => {
    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridFilteringComponent,
                IgxGridFilteringESFTemplatesComponent,
                IgxGridFilteringESFLoadOnDemandComponent,
                IgxGridFilteringMCHComponent,
                IgxGridExternalESFComponent
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
        let fix: ComponentFixture<IgxGridFilteringComponent>;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.filterMode = FilterMode.excelStyleFilter;
            fix.detectChanges();
        }));

        it('Should sort the grid properly, when clicking Ascending button.', fakeAsync(() => {
            grid.columns[2].sortable = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const sortAsc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[0];

            UIInteractions.simulateClickEvent(sortAsc);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);
            ControlsFunction.verifyButtonIsSelected(sortAsc);

            UIInteractions.simulateClickEvent(sortAsc);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);
            ControlsFunction.verifyButtonIsSelected(sortAsc, false);
        }));

        it('Should sort the grid properly, when clicking Descending button.', fakeAsync(() => {
            grid.columns[2].sortable = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const sortDesc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[1];

            UIInteractions.simulateClickEvent(sortDesc);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Desc);
            ControlsFunction.verifyButtonIsSelected(sortDesc);

            UIInteractions.simulateClickEvent(sortDesc);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);
            ControlsFunction.verifyButtonIsSelected(sortDesc, false);
        }));

        it('Should (sort ASC)/(sort DESC) when clicking the respective sort button.', fakeAsync(() => {
            grid.columns[2].sortable = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const sortAsc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[0];
            const sortDesc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[1];

            UIInteractions.simulateClickEvent(sortDesc);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Desc);
            ControlsFunction.verifyButtonIsSelected(sortDesc);

            UIInteractions.simulateClickEvent(sortAsc);
            tick(DEBOUNCETIME);
            fix.detectChanges();

            expect(grid.sortingExpressions[0].fieldName).toEqual('Downloads');
            expect(grid.sortingExpressions[0].dir).toEqual(SortingDirection.Asc);
            ControlsFunction.verifyButtonIsSelected(sortAsc);
            ControlsFunction.verifyButtonIsSelected(sortDesc, false);
        }));

        it('Should toggle correct Ascending/Descending button on opening when sorting is applied.', fakeAsync(() => {
            grid.columns[2].sortable = true;
            grid.sortingExpressions.push({ dir: SortingDirection.Asc, fieldName: 'Downloads' });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const sortAsc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[0];
            const sortDesc = GridFunctions.getExcelStyleFilteringSortButtons(fix)[1];

            ControlsFunction.verifyButtonIsSelected(sortAsc);
            ControlsFunction.verifyButtonIsSelected(sortDesc, false);
        }));

        it('Should move column left/right when clicking buttons.', fakeAsync(() => {
            grid.columns[2].movable = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            const moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveLeft.click();
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

            const columnToPin = grid.columns[grid.columns.length - 2];
            columnToPin.pinned = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(1);

            const columnToMove = grid.unpinnedColumns[grid.unpinnedColumns.length - 1];
            columnToMove.movable = true;

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, columnToMove.field);

            const moveLeft = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[0];
            const moveRight = GridFunctions.getExcelStyleFilteringMoveButtons(fix)[1];

            moveRight.click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(2);

            expect(grid.pinnedColumns[0].field).toBe(columnToMove.field);
            expect(grid.pinnedColumns[1].field).toBe(columnToPin.field);

            moveRight.click();
            fix.detectChanges();

            expect(grid.pinnedColumns[0].field).toBe(columnToPin.field);
            expect(grid.pinnedColumns[1].field).toBe(columnToMove.field);

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
            grid.columns[2].pinned = true;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            GridFunctions.getExcelFilteringUnpinContainer(fix).click();
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toEqual(0);
        }));

        it('Should hide column when click on button.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            spyOn(grid.onColumnVisibilityChanged, 'emit');
            GridFunctions.getExcelFilteringHideContainer(fix).click();
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

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            expect(grid.filteredData.length).toEqual(1);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

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

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

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

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            expect(grid.filteredData.length).toEqual(2);

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

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

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');

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
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
            ];
            gridFilteringExpressionsTree.filteringOperands.push(columnsFilteringTree);
            grid.filteringExpressionsTree = gridFilteringExpressionsTree;
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');

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
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('lessThan') }
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
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
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
                { fieldName: 'ProductName', searchVal: 'Angular', condition: IgxStringFilteringOperand.instance().condition('contains') },
                { fieldName: 'ProductName', searchVal: 'Ignite', condition: IgxStringFilteringOperand.instance().condition('contains') }
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

        it('Should update filter icon when dialog is closed and the filter has been changed.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = excelMenu.querySelectorAll('.igx-checkbox__composite');

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

            // select second expression's operator
            GridFunctions.setOperatorESF(fix, 1, 1);

            // set second expression's value
            GridFunctions.setInputValueESF(fix, 1, 20);

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
                { fieldName: 'Downloads', searchVal: 254, condition: IgxNumberFilteringOperand.instance().condition('equals') },
                { fieldName: 'Downloads', searchVal: 20, condition: IgxNumberFilteringOperand.instance().condition('equals') }
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
            grid.displayDensity = DisplayDensity.cosy;
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
            grid.displayDensity = DisplayDensity.compact;
            tick(200);
            fix.detectChanges();

            const column = grid.columns.find((col) => col.field === 'ProductName');
            GridFunctions.verifyColumnIsHidden(column, false, 6);

            // Open excel style filtering component and hide 'ProductName' column through header icon
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickHideIconInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            // Verify Excel menu is closed
            expect(GridFunctions.getExcelStyleFilteringComponent(fix)).toBeNull();
            GridFunctions.verifyColumnIsHidden(column, true, 5);
        }));

        it('Should move pinned column correctly by using move buttons', fakeAsync(() => {
            const productNameCol = grid.getColumnByName('ProductName');
            const idCol = grid.getColumnByName('ID');
            productNameCol.movable = true;
            productNameCol.pinned = true;
            idCol.movable = true;
            idCol.pinned = true;
            fix.detectChanges();

            expect(productNameCol.pinned).toBe(true);

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

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
            ControlsFunction.verifyButtonIsDisabled(moveComponent.querySelectorAll('button')[0]);

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
            const productNameCol = grid.getColumnByName('ProductName');
            const downloadsCol = grid.getColumnByName('Downloads');
            productNameCol.movable = true;
            productNameCol.pinned = true;
            downloadsCol.movable = true;
            fix.detectChanges();
            expect(GridFunctions.getColumnHeaderByIndex(fix, 0).innerText).toBe('ProductName');
            expect(GridFunctions.getColumnHeaderByIndex(fix, 2).innerText).toBe('Downloads');
            expect(downloadsCol.pinned).toBe(false);

            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

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
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');

            // Type string in search box.
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.sendInputElementValue(inputNativeElement, 'ignite', fix);
            tick(100);
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(3, 'incorrect rendered list items count');

            // Clear filtering of ESF search.
            const clearIcon: any = Array.from(searchComponent.querySelectorAll('igx-icon'))
                .find((icon: any) => icon.innerText === 'clear');
            clearIcon.click();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6, 'incorrect rendered list items count');
            tick(100);
        }));

        it('Should enable/disable the apply button correctly.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            // Verify there are filtered-in results and that apply button is enabled.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            let applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix) as HTMLElement;
            expect(listItems.length).toBe(6, 'ESF search result should NOT be empty');
            ControlsFunction.verifyButtonIsDisabled(applyButton, false);

            // Verify the apply button is disabled when all items are unchecked (when unchecking 'Select All').
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkbox[0].click(); // Select All
            tick();
            fix.detectChanges();
            applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix);
            ControlsFunction.verifyButtonIsDisabled(applyButton);
        }));

        it('display density is properly applied on the excel style filtering component', fakeAsync(() => {
            const column = grid.columns.find((c) => c.field === 'ProductName');
            column.sortable = true;
            column.movable = true;
            fix.detectChanges();

            // Open excel style filtering component and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            verifyExcelStyleFilteringDisplayDensity(fix, DisplayDensity.comfortable);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.compact;
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilteringDisplayDensity(fix, DisplayDensity.compact);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.cosy;
            tick(200);
            fix.detectChanges();

            // Open excel style filtering component and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilteringDisplayDensity(fix, DisplayDensity.cosy);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
        }));

        it('display density is properly applied on the excel style custom filtering dialog', fakeAsync(() => {
            const column = grid.columns.find((c) => c.field === 'ProductName');
            column.sortable = true;
            column.movable = true;
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterDisplayDensity(fix, DisplayDensity.comfortable);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            grid.displayDensity = DisplayDensity.cosy;
            tick(200);
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterDisplayDensity(fix, DisplayDensity.cosy);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            grid.displayDensity = DisplayDensity.compact;
            tick(200);
            fix.detectChanges();

            // Open excel style custom filtering dialog and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);

            verifyExcelCustomFilterDisplayDensity(fix, DisplayDensity.compact);
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);
        }));

        it('display density is properly applied on the excel style cascade dropdown', fakeAsync(() => {
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;

            // Open excel style cascade operators dropdown and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            verifyGridSubmenuDisplayDensity(gridNativeElement, DisplayDensity.comfortable);

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.cosy;
            tick(200);
            fix.detectChanges();

            // Open excel style cascade operators dropdown and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            verifyGridSubmenuDisplayDensity(gridNativeElement, DisplayDensity.cosy);

            GridFunctions.clickCancelExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.compact;
            tick(200);
            fix.detectChanges();

            // Open excel style cascade operators dropdown and verify its display density
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            verifyGridSubmenuDisplayDensity(gridNativeElement, DisplayDensity.compact);
        }));

        it('display density is properly applied on the excel custom dialog\'s default expression dropdown',
            fakeAsync(() => {
                const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;

                // Open excel style custom filtering dialog.
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its display density.
                let conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();

                verifyGridSubmenuDisplayDensity(gridNativeElement, DisplayDensity.comfortable);
                GridFunctions.clickCancelExcelStyleCustomFiltering(fix);
                tick(100);
                fix.detectChanges();

                // Change display density
                grid.displayDensity = DisplayDensity.cosy;
                tick(200);
                fix.detectChanges();

                // Open excel style custom filtering dialog.
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its display density.
                conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();

                verifyGridSubmenuDisplayDensity(gridNativeElement, DisplayDensity.cosy);
            }));

        it('display density is properly applied on the excel custom dialog\'s date expression dropdown',
            fakeAsync(() => {
                const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its display density.
                let conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0, true);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();

                verifyGridSubmenuDisplayDensity(gridNativeElement, DisplayDensity.comfortable);

                GridFunctions.clickCancelExcelStyleCustomFiltering(fix);
                tick(100);
                fix.detectChanges();

                // Change display density
                grid.displayDensity = DisplayDensity.cosy;
                tick(200);
                fix.detectChanges();

                // Open excel style custom filtering dialog.
                GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

                GridFunctions.clickExcelFilterCascadeButton(fix);
                fix.detectChanges();
                GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
                tick(200);

                // Click the left input to open the operators dropdown and verify its display density.
                conditionsInput = GridFunctions.getExcelFilteringDDInput(fix, 0, true);
                conditionsInput.click();
                tick(100);
                fix.detectChanges();
                verifyGridSubmenuDisplayDensity(gridNativeElement, DisplayDensity.cosy);
            }));

        it('Should include \'false\' value in results when searching.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Released');

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.sendInputElementValue(inputNativeElement, 'false', fix);
            tick(100);
            fix.detectChanges();

            // Verify that the first item is 'Select All' and the second item is 'false'.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(2, 'incorrect rendered list items count');
            expect(listItems[0].innerText).toBe('Select All');
            expect(listItems[1].innerText).toBe('false');
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
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
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
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const displayContainer = searchComponent.querySelector('igx-display-container');
            const scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            scrollbar.scrollTop = (<HTMLElement>displayContainer).getBoundingClientRect().height / 2;
            await wait(200);
            fix.detectChanges();

            // Type string in search box
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.sendInputElementValue(inputNativeElement, 'sale', fix);
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
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, excelMenu);
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6);

            UIInteractions.sendInputElementValue(input, 'a', fix);
            tick(100);
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(4);

            UIInteractions.sendInputElementValue(input, 'al', fix);
            tick(100);
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(0);
        }));

        it('Column formatter should skip the \'SelectAll\' list item', fakeAsync(() => {
            grid.columns[4].formatter = (val: Date) => {
                return new Intl.DateTimeFormat('bg-BG').format(val);
            };
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
            fix.detectChanges();


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

        it('should not display search scrollbar when not needed for the current display density', (async () => {
            grid.getCellByColumn(3, 'ProductName').update('Test');
            fix.detectChanges();

            // Verify scrollbar is visible for 'comfortable'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix)).toBe(true, 'excel search scrollbar should be visible');
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.cosy;
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'cosy'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix)).toBe(false, 'excel search scrollbar should NOT be visible');
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            grid.displayDensity = DisplayDensity.compact;
            await wait(100);
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'compact'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix)).toBe(false, 'excel search scrollbar should NOT be visible');
        }));

        it('Should cascade filter the available filter options.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            tick(100);
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', '0', '20', '100', '127', '254', '702'],
                [true, true, true, true, true, true, true, true]);

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
                ['Select All', '(Blanks)', 'false', 'true'],
                [true, true, true, true]);

            toggleExcelStyleFilteringItems(fix, true, 3);

            expect(grid.rowList.length).toBe(5);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            tick(100);
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', 'false', 'true'],
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
                ['Select All', '(Blanks)', 'false', 'true'],
                [null, true, true, false]);

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

        it('Should display the ESF based on the filterIcon within the grid', async () => {
            // Test prerequisites
            grid.width = '800px';
            for (const column of grid.columns) {
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

        it('Should select the button operator in custom expression when pressing \'Enter\' on it.', fakeAsync(() => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

            const andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            const orButton = GridFunctions.getExcelCustomFilteringExpressionOrButton(fix);

            // Verify 'and' is selected.
            ControlsFunction.verifyButtonIsSelected(andButton);
            ControlsFunction.verifyButtonIsSelected(orButton, false);

            // Press 'Enter' on 'or' button and verify it gets selected.
            UIInteractions.triggerKeyDownEvtUponElem('Enter', orButton, true);
            fix.detectChanges();

            ControlsFunction.verifyButtonIsSelected(andButton, false);
            ControlsFunction.verifyButtonIsSelected(orButton);

            // Press 'Enter' on 'and' button and verify it gets selected.
            UIInteractions.triggerKeyDownEvtUponElem('Enter', andButton, true);
            fix.detectChanges();

            ControlsFunction.verifyButtonIsSelected(andButton);
            ControlsFunction.verifyButtonIsSelected(orButton, false);
        }));

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

            // Verify datePicker mode is dropdown
            expect(datePicker.attributes['mode'].value).toBe('dropdown');
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
            tick(100);
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            tick(200);

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

            // Verify the results are with 'today' date.
            const cellValue = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(new Date(cellValue.innerText).toDateString()).toMatch(new Date().toDateString());
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
            selectAllCbInput.click();
            fix.detectChanges();

            // Verify all visible data list items are unchecked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement, false);
            }

            // Click 'Select All' checkbox.
            selectAllCbInput = visibleListItems[0];
            selectAllCbInput.click();
            fix.detectChanges();

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement);
            }
        }));

        it('Should correctly update all \'SelectAll\' checkbox when not a single item is checked.', fakeAsync(() => {
            GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Released');

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
        }));

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
                expect(GridFunctions.getExcelFilteringSortComponent(fix, excelMenu)).toBeNull();

                // Verify custom hiding template is used.
                expect(excelMenu.querySelector('.esf-custom-hiding')).not.toBeNull();
                expect(GridFunctions.getExcelFilteringHideContainer(fix, excelMenu)).toBeNull();

                // Verify custom moving template is used.
                expect(excelMenu.querySelector('.esf-custom-moving')).not.toBeNull();
                expect(GridFunctions.getExcelFilteringMoveComponent(fix, excelMenu)).toBeNull();

                // Verify custom pinning template is used.
                expect(excelMenu.querySelector('.esf-custom-pinning')).not.toBeNull();
                expect(GridFunctions.getExcelFilteringPinContainer(fix, excelMenu)).toBeNull();
                expect(GridFunctions.getExcelFilteringUnpinContainer(fix, excelMenu)).toBeNull();
            }
        }));
    });

    describe('Load values on demand', () => {
        let fix;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridFilteringESFLoadOnDemandComponent);
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
                const col = grid.columns.find((c) => c.field === columnField);
                col.width = '100px';
            });
            fix.detectChanges();
            // Make 'AnotherField' column movable.
            const column = grid.columns.find((c) => c.field === 'AnotherField');
            column.movable = true;
            fix.detectChanges();

            // Pin the 'General Information' group by pinning its child 'ProductName' column.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickPinIconInExcelStyleFiltering(fix, false);
            tick(200);
            fix.detectChanges();

            // Verify 'AnotherField' column is not pinned.
            GridFunctions.verifyColumnIsPinned(column, false, 7);

            // Try to pin the 'AnotherField' column by moving it to the left.
            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            tick(100);
            fix.detectChanges();
            GridFunctions.clickMoveLeftInExcelStyleFiltering(fix);
            tick(200);
            fix.detectChanges();

            // Verify 'AnotherField' column is successfully pinned next to the column group.
            GridFunctions.verifyColumnIsPinned(column, true, 8);
        }));
    });

    describe('External Excel Style Filtering', () => {
        let fix, grid;
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
            expect(grid.columns[1].hidden).toBeTruthy();
        }));
    });
});

describe('IgxGrid - Custom Filtering Strategy #grid', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;
    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CustomFilteringStrategyComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });
    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(CustomFilteringStrategyComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
    }));

    it('Should be able to set custom filtering strategy', () => {
        expect(grid.filterStrategy).toBeUndefined();
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();

        expect(grid.filterStrategy).toEqual(fix.componentInstance.strategy);
    });

    it('Should be able to override getFieldValue method', fakeAsync(() => {
        GridFunctions.clickFilterCellChipUI(fix, 'Name'); // Name column contains nested object as a value
        tick(150);
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('ca', fix);
        tick(DEBOUNCETIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCETIME);
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
        tick(DEBOUNCETIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCETIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual(
            [{ ID: 1, Name: { FirstName: 'Casey', LastName: 'Houston' }, JobTitle: 'Vice President', Company: 'Company A' }]);
    }));

    it('Should be able to override findMatchByExpression method', fakeAsync(() => {
        GridFunctions.clickFilterCellChipUI(fix, 'JobTitle'); // Default strategy is case not sensitive
        tick(150);
        fix.detectChanges();

        GridFunctions.typeValueInFilterRowInput('direct', fix);
        tick(DEBOUNCETIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCETIME);
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
        tick(DEBOUNCETIME);
        GridFunctions.submitFilterRowInput(fix);
        tick(DEBOUNCETIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([]);
    }));

    it('should use the custom filtering strategy when filter the grid through API method', fakeAsync(() => {
        grid.filterStrategy = fix.componentInstance.strategy;
        fix.detectChanges();
        grid.filter('Name', 'D', IgxStringFilteringOperand.instance().condition('contains'));
        tick(DEBOUNCETIME);
        fix.detectChanges();

        expect(grid.filteredData).toEqual([
            {
                ID: 7, Name: { FirstName: 'Debra', LastName: 'Morton' },
                JobTitle: 'Associate Software Developer', Company: 'Company B'
            },
            { ID: 10, Name: { FirstName: 'Eduardo', LastName: 'Ramirez' }, JobTitle: 'Manager', Company: 'Company E' }]);
    }));
});

function verifyFilterRowUI(input, closeButton, resetButton, buttonResetDisabled = true) {
    ControlsFunction.verifyButtonIsDisabled(closeButton.nativeElement, false);
    ControlsFunction.verifyButtonIsDisabled(resetButton.nativeElement, buttonResetDisabled);
    expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
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

function checkUIForType(type: string, elem: DebugElement) {
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
}

function verifyExcelStyleFilteringDisplayDensity(fix: ComponentFixture<any>, expectedDisplayDensity: DisplayDensity) {
    // Get excel style dialog
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

    // Verify display density of search input and list.
    const excelSearch = excelMenu.querySelector('igx-excel-style-search');
    const inputGroup = excelSearch.querySelector('igx-input-group');
    const list = excelSearch.querySelector('igx-list');
    expect(inputGroup.classList.contains(getInputGroupDensityClass(expectedDisplayDensity))).toBe(true,
        'incorrect inputGroup density');
    expect(list.classList.contains(getListDensityClass(expectedDisplayDensity))).toBe(true,
        'incorrect list density');

    // Verify display density of all flat and raised buttons in excel stlye dialog.
    const flatButtons: HTMLElement[] = excelMenu.querySelectorAll('.igx-button--flat');
    const raisedButtons: HTMLElement[] = excelMenu.querySelectorAll('.igx-button--raised');
    const buttons: HTMLElement[] = Array.from(flatButtons).concat(Array.from(raisedButtons));
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
    verifyPinningHidingDisplayDensity(fix, expectedDisplayDensity);
    // Verify column sorting and column moving buttons are positioned either on right of their
    // respective header or under it, based on the expected display density.
    verifySortMoveDisplayDensity(fix, expectedDisplayDensity);
}

function verifyPinningHidingDisplayDensity(fix: ComponentFixture<any>, expectedDisplayDensity: DisplayDensity) {
    // Get excel style dialog
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);

    // Get column pinning and column hiding icons from header (if present at all)
    const headerTitle = excelMenu.querySelector('h4');
    const headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix, excelMenu);
    const headerAreaPinIcon: HTMLElement =
        headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="pin"') !== -1) as HTMLElement;
    const headerAreaUnpinIcon: HTMLElement
        = headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="unpin"') !== -1) as HTMLElement;
    const headerAreaColumnHidingIcon: HTMLElement =
        headerIcons.find((buttonIcon: any) => buttonIcon.innerText === 'visibility_off') as HTMLElement;

    // Get column pinning and column hiding icons from actionsArea (if present at all)
    const actionsPinArea = GridFunctions.getExcelFilteringPinContainer(fix, excelMenu);
    const actionsAreaColumnHidingIcon = GridFunctions.getExcelFilteringHideContainer(fix, excelMenu);

    if (expectedDisplayDensity === DisplayDensity.comfortable) {
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
}

function verifySortMoveDisplayDensity(fix: ComponentFixture<any>, expectedDisplayDensity: DisplayDensity) {
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

function verifyExcelCustomFilterDisplayDensity(fix: ComponentFixture<any>, expectedDisplayDensity: DisplayDensity) {
    // Excel style filtering custom filter dialog
    const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);

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

function verifyGridSubmenuDisplayDensity(gridNativeElement: HTMLElement, expectedDisplayDensity: DisplayDensity) {
    const outlet = gridNativeElement.querySelector('.igx-grid__outlet');
    const dropdowns = Array.from(outlet.querySelectorAll('.igx-drop-down__list'));
    const visibleDropdown: any = dropdowns.find((d) => !d.classList.contains('igx-toggle--hidden'));
    const dropdownItems = visibleDropdown.querySelectorAll('igx-drop-down-item');
    dropdownItems.forEach((dropdownItem) => {
        expect(dropdownItem.classList.contains(getDropdownItemDensityClass(expectedDisplayDensity))).toBe(true,
            'incorrect dropdown item density');
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

function getDropdownItemDensityClass(displayDensity: DisplayDensity) {
    let densityClass;
    switch (displayDensity) {
        case DisplayDensity.compact: densityClass = 'igx-drop-down__item--compact'; break;
        case DisplayDensity.cosy: densityClass = 'igx-drop-down__item--cosy'; break;
        default: densityClass = 'igx-drop-down__item'; break;
    }
    return densityClass;
}

function verifyFilteringExpression(operand: IFilteringExpression, fieldName: string, conditionName: string, searchVal: any) {
    expect(operand.fieldName).toBe(fieldName);
    expect(operand.condition.name).toBe(conditionName);
    expect(operand.searchVal).toEqual(searchVal);
}

function verifyExcelStyleFilterAvailableOptions(fix, labels: string[], checked: boolean[]) {
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
    const labelElements: any[] = Array.from(GridFunctions.getExcelStyleSearchComponentListItems(fix, excelMenu));
    const checkboxElements: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

    expect(labelElements.map(c => c.innerText)).toEqual(labels);
    expect(checkboxElements.map(c => c.indeterminate ? null : c.checked)).toEqual(checked);
}

function toggleExcelStyleFilteringItems(fix, shouldApply: boolean, ...itemIndices: number[]) {
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
