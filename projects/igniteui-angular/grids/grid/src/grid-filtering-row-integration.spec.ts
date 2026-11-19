// Filtering row UI: keyboard interaction, integration scenarios and events.
import { DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective, IgxInputGroupComponent } from 'igniteui-angular/input-group';
import {
    INPUT_DEBOUNCE_TIME,
    IgxGridFilteringCellComponent,
    IgxGridHeaderComponent,
    IgxGridFilteringRowComponent,
    IgxGridHeaderGroupComponent,
    GridSelectionMode,
    FilterMode
} from 'igniteui-angular/grids/core';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, frames, nextFrame, wait } from '../../../test-utils/ui-interactions.spec';
import { GridFunctions, GridSelectionFunctions } from '../../../test-utils/grid-functions.spec';
import {
    FILTER_UI_ROW,
    FILTER_UI_CELL,
    transitionsEnd,
    typeFilterRowValue,
    commitFilterRowInput,
    verifyFilterRowUI,
    verifyFilterUIPosition,
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
import { advance, setElementSize, useFakeClock } from '../../../test-utils/helper-utils.spec';
import {
    ExpressionsTreeUtil,
    DefaultSortingStrategy,
    FilteringExpressionsTree,
    FilteringLogic,
    FormattedValuesFilteringStrategy,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand,
    IgxDateTimeFilteringOperand,
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand,
    ɵSize,
    SortingDirection
} from 'igniteui-angular/core';
import { IgxChipComponent, IgxBadgeComponent, IgxDatePickerComponent } from 'igniteui-angular';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

/** Mousedown debounce of the column resize handle (DEBOUNCE_TIME in resize-handle.directive.ts). */
const RESIZE_HANDLE_DEBOUNCE_TIME = 200;
/** Throttle of the grid's resize observer handler (resizeNotify in grid-base.directive.ts). */
const GRID_RESIZE_THROTTLE_TIME = 40;
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
            // The chips do not fit, so the scroll arrows are shown (in a requestAnimationFrame).
            await vi.waitFor(() => {
                fix.detectChanges();
                expect(GridFunctions.getFilterRowRightArrowButton(fix), 'Right scroll arrow should be visible').not.toBeNull();
            });
            // The chips area scrolls to the newly added chip by itself, but a re-layout of the grid (e.g. a resize
            // on a slower machine) resets that scroll offset. Bring the last chip into view with the scroll arrow if
            // needed: this test is about removing the last chip while the first ones are scrolled out of view.
            // each arrow press scrolls to the next chip area element (chips and the operators between them)
            for (let i = 0; i < 10 && !isChipFullyVisible(fix, 3); i++) {
                GridFunctions.getFilterRowRightArrowButton(fix).nativeElement.click();
                await nextFrame();
                fix.detectChanges();
            }
            verifyChipVisibility(fix, 0, false);
            verifyChipVisibility(fix, 3, true);
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
            await nextFrame();

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
            await nextFrame();
            // The selected chip widens while its check icon slides in.
            await transitionsEnd(fix.debugElement.query(By.css(FILTER_UI_ROW)).nativeElement);

            // NOTE: This test is very sensitive to the width of the grid and the chips.
            // The themed filter-row layout leaves a ~19px wider visible chip area than the
            // unthemed baseline, so the second chip is also fully visible initially.
            verifyMultipleChipsVisibility(fix, [true, true, false, false]);

            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            GridFunctions.removeFilterChipByIndex(1, filterUIRow);
            // wait for chip to be scrolled in view
            fix.detectChanges();
            await nextFrame();

            verifyMultipleChipsVisibility(fix, [true, true, false]);
            let chips = filterUIRow.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toBe(3);

            GridFunctions.removeFilterChipByIndex(0, filterUIRow);
            // wait for chip to be scrolled in view
            fix.detectChanges();
            await nextFrame();
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
            useFakeClock();
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
            // The resize handle debounces mousedown before showing the resizer
            await advance(fix, RESIZE_HANDLE_DEBOUNCE_TIME);
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

            useFakeClock();
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 200, 0);
            // The resize handle debounces mousedown before showing the resizer
            await advance(fix, RESIZE_HANDLE_DEBOUNCE_TIME);
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
            useFakeClock();
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            // The resize handle debounces mousedown before showing the resizer
            await advance(fix, RESIZE_HANDLE_DEBOUNCE_TIME);
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
            useFakeClock();
            setElementSize(grid.nativeElement, ɵSize.Large);
            fix.detectChanges();

            const thead = GridFunctions.getGridHeader(grid).nativeElement;
            expect(thead.getBoundingClientRect().height).toBeCloseTo(grid.defaultRowHeight * 4 + 1, 0);

            setElementSize(grid.nativeElement, ɵSize.Medium);
            fix.detectChanges();
            await gridResized(fix);
            expect(thead.getBoundingClientRect().height).toBeCloseTo(grid.defaultRowHeight * 4 + 1, 0);

            setElementSize(grid.nativeElement, ɵSize.Small);
            fix.detectChanges();
            await gridResized(fix);
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

/**
 * Waits for the grid's resize observer to report a layout change (after layout, so in the 2nd frame)
 * and runs its throttled handler. Needs useFakeClock().
 */
const gridResized = async (fix: ComponentFixture<any>) => {
    await frames(2);
    await advance(fix, GRID_RESIZE_THROTTLE_TIME);
};

const emitFilteringDoneOnResetClick = async (fix, grid, filterVal: any, columnName: string, condition) => {
    await filterGrid(fix, grid, columnName, filterVal, condition);

    const filteringExpressions = ExpressionsTreeUtil.find(grid.filteringExpressionsTree, columnName) as FilteringExpressionsTree;
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

    const filteringExpressions = ExpressionsTreeUtil.find(grid.filteringExpressionsTree, columnName) as FilteringExpressionsTree;
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

    const filteringExpressions = ExpressionsTreeUtil.find(grid.filteringExpressionsTree, columnName) as FilteringExpressionsTree;
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
