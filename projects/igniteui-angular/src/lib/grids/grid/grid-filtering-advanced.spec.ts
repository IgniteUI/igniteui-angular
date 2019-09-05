import { DebugElement } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { changei18n, getCurrentResourceStrings } from '../../core/i18n/resources';
import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { IgxChipComponent } from '../../chips/chip.component';
import { DisplayDensity } from '../../core/density';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent, IgxGridAdvancedFilteringComponent
} from '../../test-utils/grid-samples.spec';
import { HelperUtils, resizeObserverIgnoreError } from '../../test-utils/helper-utils.spec';

const ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS = 'igx-filter-tree__line--and';
const ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS = 'igx-filter-tree__line--or';

describe('IgxGrid - Advanced Filtering', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridAdvancedFilteringComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('', () => {
        let fix, grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            resizeObserverIgnoreError();
            fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should show/hide Advanced Filtering button in toolbar based on respective input.', fakeAsync(() => {
            // Verify Advanced Filtering button in toolbar is visible.
            let advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterButton !== null && advFilterButton !== undefined).toBe(true, 'Adv.Filter button is not visible.');

            grid.allowAdvancedFiltering = false;
            fix.detectChanges();

            // Verify Advanced Filtering button in toolbar is not visible.
            advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterButton !== null && advFilterButton !== undefined).toBe(false, 'Adv.Filter button is visible.');

            grid.allowAdvancedFiltering = true;
            fix.detectChanges();

            // Verify Advanced Filtering button in toolbar is visible.
            advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
            expect(advFilterButton !== null && advFilterButton !== undefined).toBe(true, 'Adv.Filter button is not visible.');
        }));

        it('Should correctly initialize the Advanced Filtering dialog.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify AF dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();

            // Verify there are not filters present and that the default text is shown.
            expect(grid.advancedFilteringExpressionsTree).toBeUndefined();
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).not.toBeNull();

            // Close Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            tick(200);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
        }));

        it('Should open/close Advanced Filtering dialog through API.', fakeAsync(() => {
            // Open dialog through API.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify AF dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();

            // Close dialog through API.
            grid.closeAdvancedFilteringDialog(false);
            tick(100);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
        }));

        it('Should close Advanced Filtering dialog through API by respecting \'applyChanges\' argument.', fakeAsync(() => {
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'ign'); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Close dialog through API.
            grid.closeAdvancedFilteringDialog(true);
            tick(100);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            // Verify the filter changes are applied.
            expect(grid.filteredData.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');

            // Open the dialog again.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Double-click the existing chip to enter edit mode.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0], true);
            tick(50);
            fix.detectChanges();
            // Edit the filter value.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'some non-existing value'); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Close dialog through API.
            grid.closeAdvancedFilteringDialog(false);
            tick(100);
            fix.detectChanges();

            // Verify AF dialog is closed.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            // Verify the filter changes are NOT applied.
            expect(grid.filteredData.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Should show/hide initial adding buttons depending on the existence of groups.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify that the initial buttons are visible.
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(2);

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Verify that the initial buttons are not visible.
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(0);

            // Discard the new group and verify that the initial buttons are visible.
            GridFunctions.clickAdvancedFilteringExpressionCloseButton(fix);
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(2);

            // Click the initial 'Add Or Group' button.
            const addOrGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[1];
            addOrGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Verify that the initial buttons are not visible.
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(0);
        }));

        it('Should correctly initialize a newly added \'And\' group.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            const group = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group).length).toBe(0, 'The group has children.');

            // Verify the operator line of the root group is an 'And' line.
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix), 'and');

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            verifyEditModeExpressionInputStates(fix, true, false, false);

            // Verify the edit inputs are empty.
            verifyEditModeExpressionInputValues(fix, '', '', '');

            // Verify commit expression button is disabled.
            const commitButton = GridFunctions.getAdvancedFilteringExpressionCommitButton(fix);
            expect(commitButton.classList.contains('igx-button--disabled')).toBe(true);
            // Verify close expression button is enabled.
            const closeButton = GridFunctions.getAdvancedFilteringExpressionCloseButton(fix);
            expect(closeButton.classList.contains('igx-button--disabled')).toBe(false);

            // Verify adding buttons are disabled.
            const buttons = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                expect(button.classList.contains('igx-button--disabled')).toBe(true);
            }
        }));

        it('Should correctly initialize a newly added \'Or\' group.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add Or Group' button.
            const addOrGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[1];
            addOrGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            const group = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group).length).toBe(0, 'The group has children.');

            // Verify the operator line of the root group is an 'Or' line.
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix), 'or');

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            verifyEditModeExpressionInputStates(fix, true, false, false);

            // Verify the edit inputs are empty.
            verifyEditModeExpressionInputValues(fix, '', '', '');

            // Verify commit expression button is disabled.
            const commitButton = GridFunctions.getAdvancedFilteringExpressionCommitButton(fix);
            expect(commitButton.classList.contains('igx-button--disabled')).toBe(true);
            // Verify close expression button is enabled.
            const closeButton = GridFunctions.getAdvancedFilteringExpressionCloseButton(fix);
            expect(closeButton.classList.contains('igx-button--disabled')).toBe(false);

            // Verify adding buttons are disabled.
            const buttons = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                expect(button.classList.contains('igx-button--disabled')).toBe(true);
            }
        }));

        it('Should add a new group through initial adding button and filter by it.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Verify commit button is disabled.
            let commitButton = GridFunctions.getAdvancedFilteringExpressionCommitButton(fix);
            expect(commitButton.classList.contains('igx-button--disabled')).toBe(true);

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            verifyEditModeExpressionInputStates(fix, true, false, false);

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            verifyEditModeExpressionInputStates(fix, true, true, false);

            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            verifyEditModeExpressionInputStates(fix, true, true, true);

            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'ign'); // Type filter value.

            // Verify commit button is now enabled.
            commitButton = GridFunctions.getAdvancedFilteringExpressionCommitButton(fix);
            expect(commitButton.classList.contains('igx-button--disabled')).toBe(false);

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Verify the new expression has been added to the group.
            const group = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(GridFunctions.getAdvancedFilteringTreeChildExpressions(group).length).toBe(1, 'Incorrect children count.');

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Should correctly filter by a \'string\' column through UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'ign'); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Should correctly filter by a \'number\' column through UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, '20'); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(5);
            expect(grid.rowList.length).toBe(5);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');
        }));

        it('Should correctly filter by a \'boolean\' column through UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 3); // Select 'Released' column.
            selectOperatorInEditModeExpression(fix, 1); // Select 'True' operator.
            verifyEditModeExpressionInputStates(fix, true, true, false); // Third input should be disabled for unary operators.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(3);
            expect(grid.rowList.length).toBe(3);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('NetAdvantage');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe(null);
        }));

        it('Should correctly filter by a \'date\' column through UI with unary operator.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 4); // Select 'ReleaseDate' column.
            selectOperatorInEditModeExpression(fix, 9); // Select 'This Year' operator.
            verifyEditModeExpressionInputStates(fix, true, true, false); // Third input should be disabled for unary operators.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix, true);
            input.click();
            fix.detectChanges();

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(6);
            expect(grid.rowList.length).toBe(6);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');
        }));

        it('Should correctly filter by a \'date\' column through UI with value from calendar.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 4); // Select 'ReleaseDate' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Equals' operator.
            verifyEditModeExpressionInputStates(fix, true, true, true);
            const input = GridFunctions.getAdvancedFilteringValueInput(fix, true);
            input.click();
            fix.detectChanges();

            // Click on 'today' item in calendar.
            const calendar = GridFunctions.getAdvancedFilteringCalendar(fix);
            const todayItem = calendar.querySelector('.igx-calendar__date--current');
            todayItem.click();
            tick(100);
            fix.detectChanges();

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(1);
            expect(grid.rowList.length).toBe(1);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 0).value.toString()).toBe('8');
        }));

        it('Should emit the onFilteringDone event when applying filters.', fakeAsync(() => {
            spyOn(grid.onFilteringDone, 'emit');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'ign'); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            expect(grid.onFilteringDone.emit).toHaveBeenCalledWith(grid.advancedFilteringExpressionsTree);
        }));

        it('Applying/Clearing filter through the API should correctly update the UI.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify the initial state of the grid and that no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify the state of the grid after filtering.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verfiy there is a root group with 'And' operator line and 2 children.
            const rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
            expect(rootGroup).not.toBeNull();
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix), 'and');
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(rootGroup).length).toBe(2);

            // Verify the contnet of the first child (expression) of the root group.
            verifyExpressionChipContent(fix, [0], 'Downloads', 'Greater Than', '100');

            // Verify the content of the second child (group) of the root group.
            const group = GridFunctions.getAdvancedFilteringTreeItem(fix, [1]);
            expect(GridFunctions.getAdvancedFilteringTreeChildItems(group, false).length).toBe(2);
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');
            verifyExpressionChipContent(fix, [1, 1], 'ProductName', 'Contains', 'script');
            // Verify the operator line of the child group.
            verifyOperatorLine(GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, [1]), 'or');

            // Close Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            tick(100);
            fix.detectChanges();

            // Clear filters through API.
            grid.advancedFilteringExpressionsTree = null;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify there are not filters present and that the default text is shown.
            expect(grid.advancedFilteringExpressionsTree).toBeNull();
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).not.toBeNull();
        }));

        it('Applying/Clearing filter through the UI should correctly update the API.', fakeAsync(() => {
            // Test prerequisites
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify the initial state of the grid and that no filters are present.
            expect(grid.advancedFilteringExpressionsTree).toBeUndefined();
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Add a root 'and' group.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, '100'); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add a child 'or' group.
            const addOrGroupBtn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2];
            addOrGroupBtn.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'angular'); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add new expression to the child group.
            const addExpressionBtn = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [1], 0)[0];
            addExpressionBtn.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'script'); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the state of the grid after the filtering.
            expect(grid.advancedFilteringExpressionsTree !== null && grid.advancedFilteringExpressionsTree !== undefined).toBe(true);
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            tick(100);
            fix.detectChanges();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify that no filters are present.
            expect(grid.advancedFilteringExpressionsTree).toBeNull();
            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');
        }));

        it('Should discard the newly added group when clicking the \'close\' button of its initial condition.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Verify there is a new group and the initial buttons are not visible.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).not.toBeNull();
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(0);

            // Populate edit inputs
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'ign'); // Type filter value.

            // Discard the populated expression, so the whole new group gets discarded.
            GridFunctions.clickAdvancedFilteringExpressionCloseButton(fix);
            fix.detectChanges();

            // Verify there are no groups in the dialog and the initial buttons are visible.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix).length).toBe(2);
        }));

        it('Column dropdown should contain only filterable columns.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Make the 'Downloads', 'Released' and 'ReleaseDate' columns non-filterable.
            grid.getColumnByName('Downloads').filterable = false;
            grid.getColumnByName('Released').filterable = false;
            grid.getColumnByName('ReleaseDate').filterable = false;
            grid.cdr.detectChanges();
            tick(100);

            // Click the initial 'Add and Group' button.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify that only filterable columns are present.
            GridFunctions.clickAdvancedFilteringColumnSelect(fix);
            fix.detectChanges();
            const dropdownItems = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix);
            expect(dropdownItems.length).toBe(3);
            expect(dropdownItems[0].innerText).toBe('ID');
            expect(dropdownItems[1].innerText).toBe('ProductName');
            expect(dropdownItems[2].innerText).toBe('Another Field');
        }));

        it('Operator dropdown should contain operators based on the column\'s datatype (\'string\' or \'number\').', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Add a new group.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Select 'string' type column ('ProductName').
            selectColumnInEditModeExpression(fix, 1);
            // Open the operator dropdown and verify they are 'string' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            let dropdownValues: string[] = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            let expectedValues = ['Contains', 'Does Not Contain', 'Starts With', 'Ends With', 'Equals',
                                  'Does Not Equal', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            verifyEqualArrays(dropdownValues, expectedValues);

            // Close current dropdown by a random select.
            GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, 0);
            tick();
            fix.detectChanges();

            // Select 'number' type column ('Downloads').
            selectColumnInEditModeExpression(fix, 2);
            // Open the operator dropdown and verify they are 'number' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            dropdownValues = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            expectedValues = ['Equals', 'Does Not Equal', 'Greater Than', 'Less Than', 'Greater Than Or Equal To',
                              'Less Than Or Equal To', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            verifyEqualArrays(dropdownValues, expectedValues);
        }));

        it('Operator dropdown should contain operators based on the column\'s datatype (\'date\' or \'boolean\').', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Add a new group.
            const addAndGroupButton = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
            addAndGroupButton.click();
            tick(100);
            fix.detectChanges();

            // Select 'date' type column ('ReleaseDate').
            selectColumnInEditModeExpression(fix, 4);
            // Open the operator dropdown and verify they are 'date' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            let dropdownValues: string[] = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            let expectedValues = ['Equals', 'Does Not Equal', 'Before', 'After', 'Today', 'Yesterday',
                                  'This Month', 'Last Month', 'Next Month', 'This Year', 'Last Year',
                                  'Next Year', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            verifyEqualArrays(dropdownValues, expectedValues);

            // Close current dropdown by a random select.
            GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, 0);
            tick();
            fix.detectChanges();

            // Select 'boolean' type column ('Released').
            selectColumnInEditModeExpression(fix, 3);
            // Open the operator dropdown and verify they are 'boolean' specific.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            fix.detectChanges();
            dropdownValues = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            expectedValues = ['All', 'True', 'False', 'Empty', 'Not Empty', 'Null', 'Not Null'];
            verifyEqualArrays(dropdownValues, expectedValues);
        }));

        it('Should not commit and close currently edited condition when the \'close\' button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            verifyExpressionChipContent(fix, [0], 'Downloads', 'Greater Than', '100');

            // Edit the first expression in the inner 'or' group.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0], true); // Double-click the chip
            tick(200);
            fix.detectChanges();
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, '500'); // Type filter value.

            // Verify the edit mode container is visible.
            expect(GridFunctions.getAdvancedFilteringEditModeContainer(fix)).not.toBeNull();

            // Close the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCloseButton(fix);
            fix.detectChanges();

            // Verify the edit mode container is no longer visible.
            expect(GridFunctions.getAdvancedFilteringEditModeContainer(fix)).toBeNull();

            verifyExpressionChipContent(fix, [0], 'Downloads', 'Greater Than', '100');
        }));

        it('Should scroll the adding buttons into view when the add icon of a chip is clicked.', (async () => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals')
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            await wait(50);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            exprContainer.scrollTop = 0;
            fix.detectChanges();
            await wait(50);

            // Select the last visible expression chip.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [9]);
            await wait(200);
            fix.detectChanges();
            // Click the add icon to display the adding buttons.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [9]);
            await wait(50);
            fix.detectChanges();

            // Verify the adding buttons are in view.
            const addingButtons = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0);
            for (const addingButton of addingButtons) {
                verifyElementIsInExpressionsContainerView(fix, addingButton);
            }
        }));

        it('Should scroll the newly added expression into view when the respective add button is clicked.', (async () => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals')
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            await wait(50);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            exprContainer.scrollTop = 0;
            fix.detectChanges();
            await wait(50);

            // Select the previous to last visible expression chip.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [8]);
            await wait(200);
            fix.detectChanges();
            // Click the add icon to display the adding buttons.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [8]);
            await wait(50);
            fix.detectChanges();
            // Click the 'add condition' button.
            const addCondButton = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            addCondButton.click();
            fix.detectChanges();

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, GridFunctions.getAdvancedFilteringEditModeContainer(fix));
        }));

        it('Should scroll to the expression when entering its edit mode.', (async () => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals')
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            await wait(50);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            exprContainer.scrollTop = 0;
            fix.detectChanges();
            await wait(50);

            // Select the last visible expression chip.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [9]);
            await wait(200);
            fix.detectChanges();
            // Click the edit icon to enter edit mode of the expression.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipEditIcon(fix, [9]);
            await wait(50);
            fix.detectChanges();

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, GridFunctions.getAdvancedFilteringEditModeContainer(fix));
        }));

        it('Should clear all conditions and groups when the \'clear filter\' button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify there are filters in the dialog.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).not.toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).toBeNull();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify there are no filters in the dialog.
            expect(GridFunctions.getAdvancedFilteringTreeRootGroup(fix)).toBeNull();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).not.toBeNull();
        }));

        it('Should keep edited conditions and groups inside AF dialog when applying and opening it again.',
        fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify the current filter state.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');

            // Edit the first expression in the inner 'or' group.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 0], true); // Double-click the chip
            tick(200);
            fix.detectChanges();
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'a'); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the new current filter state.
            expect(grid.filteredData.length).toBe(3);
            expect(grid.rowList.length).toBe(3);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'a');
        }));

        it('Should not keep changes over edited conditions and groups inside AF dialog when canceling and opening it again.',
        fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify the current filter state.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');

            // Edit the first expression in the inner 'or' group.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 0], true); // Double-click the chip
            tick(200);
            fix.detectChanges();
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            sendInputNativeElement(fix, input, 'a'); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Cancel the filters.
            GridFunctions.clickAdvancedFilteringCancelButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the new filter state remains unchanged.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Some other item with Script');

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify the content of the first expression in the inner 'or' group.
            verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');
        }));

        it('Should not close the AF dialog when clicking outside of it.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Verify that the Advanced Filtering dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull('Advanced Filtering dialog is not opened.');

            grid.nativeElement.click();
            tick(200);
            fix.detectChanges();

            // Verify that the Advanced Filtering dialog remains opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull('Advanced Filtering dialog is not opened.');
        }));

        describe('Localization', () => {
            it('Should correctly change resource strings for Advanced Filtering dialog.', fakeAsync(() => {
                fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
                grid = fix.componentInstance.grid;
                grid.resourceStrings = Object.assign({}, grid.resourceStrings, {
                    igx_grid_filter_operator_and: 'My and',
                    igx_grid_filter_operator_or: 'My or',
                    igx_grid_advanced_filter_title: 'My advanced filter',
                    igx_grid_advanced_filter_and_group: 'My and group',
                    igx_grid_advanced_filter_or_group: 'My or group',
                    igx_grid_advanced_filter_end_group: 'My end group',
                    igx_grid_advanced_filter_create_and_group: 'My create and group',
                    igx_grid_advanced_filter_create_or_group: 'My create or group',
                    igx_grid_advanced_filter_and_label: 'My and',
                    igx_grid_advanced_filter_or_label: 'My or',
                    igx_grid_advanced_filter_add_condition: 'My condition',
                    igx_grid_advanced_filter_ungroup: 'My ungroup',
                    igx_grid_advanced_filter_delete: 'My delete',
                    igx_grid_advanced_filter_delete_filters: 'My delete filters',
                    igx_grid_advanced_filter_initial_text: 'My initial text'
                });
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                GridFunctions.clickAdvancedFilteringButton(fix);
                fix.detectChanges();

                expect(GridFunctions.getAdvancedFilteringHeaderText(fix)).toBe('My advanced filter');
                expect(GridFunctions.getAdvancedFilteringHeaderLegendItemAnd(fix).innerText).toBe('My and');
                expect(GridFunctions.getAdvancedFilteringHeaderLegendItemOr(fix).innerText).toBe('My or');
                expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0].querySelector('span').innerText)
                    .toBe('My and group');
                expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[1].querySelector('span').innerText)
                    .toBe('My or group');
                expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix).innerText).toBe('My initial text');

                const initialAddAndGroupBtn = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
                initialAddAndGroupBtn.click();
                tick(100);
                fix.detectChanges();

                expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0].querySelector('span').innerText)
                    .toBe('My condition');
                expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[1].querySelector('span').innerText)
                    .toBe('My and group');
                expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2].querySelector('span').innerText)
                    .toBe('My or group');

                // Populate edit inputs.
                selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
                selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
                let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
                sendInputNativeElement(fix, input, 'angular'); // Type filter value.
                // Commit the populated expression.
                GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
                fix.detectChanges();

                const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                rootOperatorLine.click();
                tick(200);
                fix.detectChanges();

                const buttonGroupItems = GridFunctions.sortNativeElementsHorizontally(
                    Array.from(GridFunctions.getAdvancedFilteringContextMenuButtonGroup(fix)
                                            .querySelectorAll('.igx-button-group__item-content')));
                expect(buttonGroupItems[0].textContent).toBe('My and');
                expect(buttonGroupItems[1].textContent).toBe('My or');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[1].querySelector('span').innerText)
                    .toBe('My ungroup');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[2].querySelector('span').innerText)
                    .toBe('My delete');

                // Close context menu.
                GridFunctions.clickAdvancedFilteringContextMenuCloseButton(fix);
                tick(100);
                fix.detectChanges();

                // Add another expression to root group.
                let btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
                btn.click();
                tick(100);
                fix.detectChanges();
                // Populate edit inputs.
                selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
                selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
                input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
                sendInputNativeElement(fix, input, 'script'); // Type filter value.
                // Commit the populated expression.
                GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
                fix.detectChanges();

                // Select two chips.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
                tick(500);
                fix.detectChanges();
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1]);
                tick(500);
                fix.detectChanges();

                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[1].innerText).toBe('My create and group');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[2].innerText).toBe('My create or group');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[3].innerText).toBe('My delete filters');

                // Close context menu.
                GridFunctions.clickAdvancedFilteringContextMenuCloseButton(fix);
                tick(100);
                fix.detectChanges();

                // Add an 'or' group to root group.
                btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2];
                btn.click();
                tick(100);
                fix.detectChanges();

                const endGroupButton = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [2], 0)[3];
                expect(endGroupButton.querySelector('span').innerText).toBe('My end group');
            }));

            it('Should correctly change resource strings for Advanced Filtering dialog by using Changei18n.', fakeAsync(() => {
                fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
                grid = fix.componentInstance.grid;
                const strings = getCurrentResourceStrings();
                strings.igx_grid_filter_operator_and = 'My and';
                strings.igx_grid_filter_operator_or = 'My or';
                strings.igx_grid_advanced_filter_title = 'My advanced filter';
                strings.igx_grid_advanced_filter_and_group = 'My and group';
                strings.igx_grid_advanced_filter_or_group = 'My or group';
                strings.igx_grid_advanced_filter_end_group = 'My end group';
                strings.igx_grid_advanced_filter_create_and_group = 'My create and group';
                strings.igx_grid_advanced_filter_create_or_group = 'My create or group';
                strings.igx_grid_advanced_filter_and_label = 'My and';
                strings.igx_grid_advanced_filter_or_label = 'My or';
                strings.igx_grid_advanced_filter_add_condition = 'My condition';
                strings.igx_grid_advanced_filter_ungroup = 'My ungroup';
                strings.igx_grid_advanced_filter_delete = 'My delete';
                strings.igx_grid_advanced_filter_delete_filters = 'My delete filters';
                strings.igx_grid_advanced_filter_initial_text = 'My initial text';
                changei18n(strings);
                fix.detectChanges();

                // Open Advanced Filtering dialog.
                GridFunctions.clickAdvancedFilteringButton(fix);
                fix.detectChanges();

                expect(GridFunctions.getAdvancedFilteringHeaderText(fix)).toBe('My advanced filter');
                expect(GridFunctions.getAdvancedFilteringHeaderLegendItemAnd(fix).innerText).toBe('My and');
                expect(GridFunctions.getAdvancedFilteringHeaderLegendItemOr(fix).innerText).toBe('My or');
                expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0].querySelector('span').innerText)
                    .toBe('My and group');
                expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[1].querySelector('span').innerText)
                    .toBe('My or group');
                expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix).innerText).toBe('My initial text');

                const initialAddAndGroupBtn = GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0];
                initialAddAndGroupBtn.click();
                tick(100);
                fix.detectChanges();

                expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0].querySelector('span').innerText)
                    .toBe('My condition');
                expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[1].querySelector('span').innerText)
                    .toBe('My and group');
                expect(GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2].querySelector('span').innerText)
                    .toBe('My or group');

                // Populate edit inputs.
                selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
                selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
                let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
                sendInputNativeElement(fix, input, 'angular'); // Type filter value.
                // Commit the populated expression.
                GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
                fix.detectChanges();

                const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                rootOperatorLine.click();
                tick(200);
                fix.detectChanges();

                const buttonGroupItems = GridFunctions.sortNativeElementsHorizontally(
                    Array.from(GridFunctions.getAdvancedFilteringContextMenuButtonGroup(fix)
                                            .querySelectorAll('.igx-button-group__item-content')));
                expect(buttonGroupItems[0].textContent).toBe('My and');
                expect(buttonGroupItems[1].textContent).toBe('My or');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[1].querySelector('span').innerText)
                    .toBe('My ungroup');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[2].querySelector('span').innerText)
                    .toBe('My delete');

                // Close context menu.
                GridFunctions.clickAdvancedFilteringContextMenuCloseButton(fix);
                tick(100);
                fix.detectChanges();

                // Add another expression to root group.
                let btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
                btn.click();
                tick(100);
                fix.detectChanges();
                // Populate edit inputs.
                selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
                selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
                input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
                sendInputNativeElement(fix, input, 'script'); // Type filter value.
                // Commit the populated expression.
                GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
                fix.detectChanges();

                // Select two chips.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
                tick(500);
                fix.detectChanges();
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1]);
                tick(500);
                fix.detectChanges();

                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[1].innerText).toBe('My create and group');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[2].innerText).toBe('My create or group');
                expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[3].innerText).toBe('My delete filters');

                // Close context menu.
                GridFunctions.clickAdvancedFilteringContextMenuCloseButton(fix);
                tick(100);
                fix.detectChanges();

                // Add an 'or' group to root group.
                btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[2];
                btn.click();
                tick(100);
                fix.detectChanges();

                const endGroupButton = GridFunctions.getAdvancedFilteringTreeGroupButtons(fix, [2], 0)[3];
                expect(endGroupButton.querySelector('span').innerText).toBe('My end group');

                // Revert strings.
                changei18n({
                    igx_grid_filter_operator_and: 'And',
                    igx_grid_filter_operator_or: 'Or',
                    igx_grid_advanced_filter_title: 'Advanced Filtering',
                    igx_grid_advanced_filter_and_group: '"And" Group',
                    igx_grid_advanced_filter_or_group: '"Or" Group',
                    igx_grid_advanced_filter_end_group: 'End Group',
                    igx_grid_advanced_filter_create_and_group: 'Create "And" Group',
                    igx_grid_advanced_filter_create_or_group: 'Create "Or" Group',
                    igx_grid_advanced_filter_and_label: 'and',
                    igx_grid_advanced_filter_or_label: 'or',
                    igx_grid_advanced_filter_add_condition: 'Condition',
                    igx_grid_advanced_filter_ungroup: 'Ungroup',
                    igx_grid_advanced_filter_delete: 'Delete',
                    igx_grid_advanced_filter_delete_filters: 'Delete filters',
                    igx_grid_advanced_filter_initial_text: 'Start with creating a group of conditions linked with "And" or "Or"'
                });
            }));
        });
    });
});

function selectColumnInEditModeExpression(fix, dropdownItemIndex: number) {
    GridFunctions.clickAdvancedFilteringColumnSelect(fix);
    fix.detectChanges();
    GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, dropdownItemIndex);
    tick();
    fix.detectChanges();
}

function selectOperatorInEditModeExpression(fix, dropdownItemIndex: number) {
    GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
    fix.detectChanges();
    GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, dropdownItemIndex);
    tick();
    fix.detectChanges();
}

function sendInputNativeElement(fix, nativeElement, text) {
    nativeElement.value = text;
    nativeElement.dispatchEvent(new Event('keydown'));
    nativeElement.dispatchEvent(new Event('input'));
    nativeElement.dispatchEvent(new Event('keyup'));
    fix.detectChanges();
}

/**
* Verifies the type of the operator line ('and' or 'or').
* (NOTE: The 'operator' argument must be a string with a value that is either 'and' or 'or'.)
*/
function verifyOperatorLine(operatorLine: HTMLElement, operator: string) {
    expect(operator === 'and' || operator === 'or').toBe(true, 'operator must be \'and\' or \'or\'');

    if (operator === 'and') {
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS)).toBe(true, 'incorrect operator line');
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS)).toBe(false, 'incorrect operator line');
    } else {
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS)).toBe(false, 'incorrect operator line');
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS)).toBe(true, 'incorrect operator line');
    }
}

function verifyExpressionChipContent(fix, path: number[], columnText: string, operatorText: string, valueText: string) {
    const chip = GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, path);
    // const columnNameContainer = chip.querySelector('.igx-filter-tree__expression-column');
    const chipSpans = GridFunctions.sortNativeElementsHorizontally(Array.from(chip.querySelectorAll('span')));
    const columnSpan = chipSpans[0];
    const operatorSpan = chipSpans[1];
    const valueSpan = chipSpans[2];
    expect(columnSpan.innerText.toLowerCase().trim()).toBe(columnText.toLowerCase(), 'incorrect chip column');
    expect(operatorSpan.innerText.toLowerCase().trim()).toBe(operatorText.toLowerCase(), 'incorrect chip operator');
    expect(valueSpan.innerText.toLowerCase().trim()).toBe(valueText.toLowerCase(), 'incorrect chip filter value');
}

function verifyEditModeExpressionInputStates(fix,
                                             columnSelectEnabled: boolean,
                                             operatorSelectEnabled: boolean,
                                             valueInputEnabled: boolean) {
    // Verify the column select state.
    const columnInputGroup = GridFunctions.getAdvancedFilteringColumnSelect(fix).querySelector('igx-input-group');
    expect(!columnInputGroup.classList.contains('igx-input-group--disabled')).toBe(columnSelectEnabled,
        'incorrect column select state');

    // Verify the operator select state.
    const operatorInputGroup = GridFunctions.getAdvancedFilteringOperatorSelect(fix).querySelector('igx-input-group');
    expect(!operatorInputGroup.classList.contains('igx-input-group--disabled')).toBe(operatorSelectEnabled,
        'incorrect operator select state');

    // Verify the value input state.
    const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
    const valueInputGroup = GridFunctions.sortNativeElementsHorizontally(
        Array.from(editModeContainer.querySelectorAll('igx-input-group')))[2];
    expect(!valueInputGroup.classList.contains('igx-input-group--disabled')).toBe(valueInputEnabled,
        'incorrect value input state');
}

function verifyEditModeExpressionInputValues(fix,
                                             columnText: string,
                                             operatorText: string,
                                             valueText: string) {
    const columnInput = GridFunctions.getAdvancedFilteringColumnSelect(fix).querySelector('input');
    const operatorInput = GridFunctions.getAdvancedFilteringColumnSelect(fix).querySelector('input');
    const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
    const valueInput = GridFunctions.sortNativeElementsHorizontally(Array.from(editModeContainer.querySelectorAll('input')))[2];
    expect(columnInput.value).toBe(columnText);
    expect(operatorInput.value).toBe(operatorText);
    expect(valueInput.value).toBe(valueText);
}

function verifyElementIsInExpressionsContainerView(fix, element: HTMLElement) {
    const elementRect = element.getBoundingClientRect();
    const exprContainer: HTMLElement = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
    const exprContainerRect = exprContainer.getBoundingClientRect();
    expect(elementRect.top >= exprContainerRect.top).toBe(true, 'top is not in view');
    expect(elementRect.bottom <= exprContainerRect.bottom).toBe(true, 'bottom is not in view');
    expect(elementRect.left >= exprContainerRect.left).toBe(true, 'left is not in view');
    expect(elementRect.right <= exprContainerRect.right).toBe(true, 'right is not in view');
}

function verifyEqualArrays(firstArr: any[], secondArr: any[]) {
    expect(firstArr.length).toEqual(secondArr.length, 'Array lengths mismatch.');
    firstArr = firstArr.sort();
    secondArr = secondArr.sort();
    // Verify sorted arrays have equal respective elements.
    const len = firstArr.length;
    for (let index = 0; index < len; index++) {
        expect(firstArr[index]).toBe(secondArr[index], 'Array element mismatch.');
    }
}
