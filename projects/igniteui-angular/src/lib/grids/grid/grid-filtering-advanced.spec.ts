import { fakeAsync, TestBed, tick, flush, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand
} from '../../data-operations/filtering-condition';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import {
    IgxGridAdvancedFilteringColumnGroupComponent,
    IgxGridAdvancedFilteringComponent,
    IgxGridExternalAdvancedFilteringComponent,
    IgxGridAdvancedFilteringBindingComponent,
    IgxGridAdvancedFilteringOverlaySettingsComponent,
    IgxGridAdvancedFilteringDynamicColumnsComponent
} from '../../test-utils/grid-samples.spec';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';
import { FormattedValuesFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxHierGridExternalAdvancedFilteringComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { IgxHierarchicalGridComponent } from '../hierarchical-grid/public_api';
import { IFilteringEventArgs } from '../public_api';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

const ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS = 'igx-filter-tree__line--and';
const ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS = 'igx-filter-tree__line--or';
const ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS = 'igx-filter-tree__expression-item';

describe('IgxGrid - Advanced Filtering #grid - ', () => {
    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridAdvancedFilteringColumnGroupComponent,
                IgxGridAdvancedFilteringComponent,
                IgxGridExternalAdvancedFilteringComponent,
                IgxGridAdvancedFilteringBindingComponent,
                IgxHierGridExternalAdvancedFilteringComponent,
                IgxGridAdvancedFilteringDynamicColumnsComponent
            ]
        });
    }));

    describe('General tests - ', () => {
        let fix: ComponentFixture<IgxGridAdvancedFilteringComponent>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
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
            grid.openAdvancedFilteringDialog();
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
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // TO DO: Refactor

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

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
            UIInteractions.clickAndSendInputElementValue(input, 'some non-existing value', fix); // Type filter value.
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

        it('Should add a new group through initial adding button and filter by it.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            verifyEditModeExpressionInputStates(fix, true, false, false, false);

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            verifyEditModeExpressionInputStates(fix, true, true, false, false);

            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            verifyEditModeExpressionInputStates(fix, true, true, true, false);

            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.
            tick();
            fix.detectChanges();
            verifyEditModeExpressionInputStates(fix, true, true, true, true);

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

        it('Should update the Advanced Filtering button in toolbar when (filtering)/(clear filtering).',
            fakeAsync(() => {
                // Verify that the advanced filtering button indicates there are no filters.
                let advFilterBtn = GridFunctions.getAdvancedFilteringButton(fix);
                expect(Array.from(advFilterBtn.children).some(c => (c as any).classList.contains('igx-adv-filter--column-number')))
                    .toBe(false, 'Button indicates there is active filtering.');

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // TO DO: Refactor

                // Click the initial 'Add And Group' button.
                GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
                tick(100);
                fix.detectChanges();

                // Populate edit inputs.
                selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
                selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
                const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
                UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.
                // Commit the populated expression.
                GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
                fix.detectChanges();

                // Apply the filters.
                GridFunctions.clickAdvancedFilteringApplyButton(fix);
                fix.detectChanges();

                // Verify that the advanced filtering button indicates there are filters.
                advFilterBtn = GridFunctions.getAdvancedFilteringButton(fix);
                expect(Array.from(advFilterBtn.children).some(c => (c as any).classList.contains('igx-adv-filter--column-number')))
                    .toBe(true, 'Button indicates there is no active filtering.');

                // Open Advanced Filtering dialog.
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Clear the filters.
                GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
                fix.detectChanges();

                // Close the dialog.
                GridFunctions.clickAdvancedFilteringApplyButton(fix);
                fix.detectChanges();

                // Verify that the advanced filtering button indicates there are no filters.
                advFilterBtn = GridFunctions.getAdvancedFilteringButton(fix);
                expect(Array.from(advFilterBtn.children).some(c => (c as any).classList.contains('igx-adv-filter--column-number')))
                    .toBe(false, 'Button indicates there is active filtering.');
            }));

        it('The Clear/Cancel/Apply buttons type should be set to "button"', () => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Get Clear/Cancel/Apply buttons types.
            const clearButtonType = GridFunctions.getAdvancedFilteringClearFilterButton(fix).getAttributeNode('type').value;
            const cancelButtonType = GridFunctions.getAdvancedFilteringCancelButton(fix).getAttributeNode('type').value;
            const applyButtonType = GridFunctions.getAdvancedFilteringApplyButton(fix).getAttributeNode('type').value;

            const expectedButtonType = 'button';

            // Verify buttons type is set to "button".
            expect(clearButtonType).toBe(expectedButtonType, 'Clear button type is not "button"');
            expect(cancelButtonType).toBe(expectedButtonType, 'Cancel button type is not "button"');
            expect(applyButtonType).toBe(expectedButtonType, 'Apply button type is not "button"');
        });

        it('Should emit the filtering event when applying filters.', fakeAsync(() => {
            spyOn(grid.filtering, 'emit');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Ensure that filtering event was emitted with expected arguments
            expect(grid.filtering.emit).toHaveBeenCalledWith(jasmine.objectContaining({
                owner: grid,
                filteringExpressions: grid.advancedFilteringExpressionsTree,
                cancel: false
            }));
        }));

        it('Should cancel filtering if cancel is set to true.', fakeAsync(() => {
            spyOn(grid.filtering, 'emit').and.callFake((args: IFilteringEventArgs) => {
                args.cancel = true;
            });

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Ensure that cancel flag is true
            expect(grid.filtering.emit).toHaveBeenCalled();
            const emittedArgs: IFilteringEventArgs = (grid.filtering.emit as jasmine.Spy).calls.mostRecent().args[0];
            expect(emittedArgs.cancel).toBeTrue();

            // Ensure that grid.filteredData is null
            expect(grid.filteredData).toEqual(null);
        }));

        it('Should emit the filteringDone event when applying filters.', fakeAsync(() => {
            spyOn(grid.filteringDone, 'emit');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            expect(grid.filteringDone.emit).toHaveBeenCalledWith(grid.advancedFilteringExpressionsTree);
            expect(grid.nativeElement.querySelector('.igx-adv-filter--column-number').textContent).toContain('1');
        }));

        it('Applying/Clearing filter through the API should correctly update the UI and correctly show number of filtered columns', fakeAsync(() => {
            grid.height = '800px';
            fix.detectChanges();
            tick(50);

            // Verify the initial state of the grid and that no filters are present.
            expect(grid.filteredData).toBeNull();
            expect(grid.nativeElement.querySelector('.igx-adv-filter--column-number')).toBeNull();

            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                field: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                field: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                field: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify the state of the grid after filtering.
            expect(grid.filteredData.length).toBe(2);
            expect(grid.nativeElement.querySelector('.igx-adv-filter--column-number').textContent).toContain('(2)');
            expect(GridFunctions.getExcelFilterIconFiltered(fix, 'ProductName')).toBeDefined();
            expect(GridFunctions.getExcelFilterIconFiltered(fix, 'Downloads')).toBeDefined();

            // Clear filters through API.
            grid.advancedFilteringExpressionsTree = null;
            fix.detectChanges();

            // Verify there are not filters present and that the default text is shown.
            expect(grid.advancedFilteringExpressionsTree).toBeNull();
            expect(grid.nativeElement.querySelector('.igx-adv-filter--column-number')).toBeNull();
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
                field: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                field: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                field: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
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
            grid.openAdvancedFilteringDialog();
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
            grid.openAdvancedFilteringDialog();
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
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

            // Add a root 'and' group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '100', fix); // Type filter value.
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
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.
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
            UIInteractions.clickAndSendInputElementValue(input, 'script', fix); // Type filter value.
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
            grid.openAdvancedFilteringDialog();
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

        it('Should apply filters on Apply button click without prior Commit button click', fakeAsync(() => {
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the filter results.
            expect(grid.filteredData.length).toEqual(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');
        }));

        it('Should close the dialog on Apply button click if not all expression inputs are set', fakeAsync(() => {
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the dialog is closed an no records are filtered
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            expect(grid.filteredData).toBe(null);

            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.

            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            expect(grid.filteredData).toBe(null);

            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.

            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            expect(grid.filteredData).toBe(null);
        }));

        it('Column dropdown should contain only filterable columns.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Make the 'Downloads', 'Released' and 'ReleaseDate' columns non-filterable.
            grid.getColumnByName('Downloads').filterable = false;
            grid.getColumnByName('Released').filterable = false;
            grid.getColumnByName('ReleaseDate').filterable = false;
            grid.cdr.detectChanges();
            tick(100);

            // TO DO: Refactor
            // Click the initial 'Add and Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify that only filterable columns are present.
            GridFunctions.clickAdvancedFilteringColumnSelect(fix);
            fix.detectChanges();
            const dropdownItems = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix);
            expect(dropdownItems.length).toBe(3);
            expect(dropdownItems[0].innerText).toBe('HeaderID');
            expect(dropdownItems[1].innerText).toBe('ProductName');
            expect(dropdownItems[2].innerText).toBe('Another Field');
        }));

        it('Should scroll the adding buttons into view when the add icon of a chip is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    field: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals'
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`)[9];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the add icon to display the adding buttons.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [9]);
            fix.detectChanges();
            tick(50);

            // Verify the adding buttons are in view.
            const addingButtons = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0);
            for (const addingButton of addingButtons) {
                verifyElementIsInExpressionsContainerView(fix, addingButton);
            }
        }));

        it('Should scroll the newly added expression into view when the respective add button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    field: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals'
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the previous to last visible expression chip.
            const expressionItem = fix.nativeElement.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`)[8];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the add icon to display the adding buttons.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipAddIcon(fix, [8]);
            tick(50);

            // Click the 'add condition' button.
            const addCondButton = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            addCondButton.click();
            fix.detectChanges();

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, GridFunctions.getAdvancedFilteringEditModeContainer(fix));
        }));

        it('Should scroll to the expression when entering its edit mode.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    field: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals'
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`)[9];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the edit icon to enter edit mode of the expression.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipEditIcon(fix, [9]);
            tick(50);

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, GridFunctions.getAdvancedFilteringEditModeContainer(fix));
        }));

        it('Should keep the context menu in view when scrolling the expressions container.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 20; index++) {
                tree.filteringOperands.push({
                    field: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals'
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Select the first two chips.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
            fix.detectChanges();

            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1]);
            tick(200); // Await click timeout
            fix.detectChanges();

            // Scroll to the bottom.
            exprContainer.scrollTop = exprContainer.scrollHeight;

            // Verify that the context menu is correctly repositioned and in view.
            const contextMenu = GridFunctions.getAdvancedFilteringContextMenu(fix);
            verifyElementIsInExpressionsContainerView(fix, contextMenu);
        }));

        it('Should clear all conditions and groups when the \'clear filter\' button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                field: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                field: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                field: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // TO DO: Refactor

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
                    field: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                    conditionName: 'greaterThan'
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    field: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    conditionName: 'contains',
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    field: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    conditionName: 'contains',
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
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // TO DO: Refactor

                // Verify the content of the first expression in the inner 'or' group.
                verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');

                // Edit the first expression in the inner 'or' group.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 0], true); // Double-click the chip
                tick(200);
                fix.detectChanges();
                const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
                UIInteractions.clickAndSendInputElementValue(input, 'a', fix); // Type filter value.

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
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify the content of the first expression in the inner 'or' group.
                verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'a');
            }));

        it('Should not keep changes over edited conditions and groups inside AF dialog when canceling and opening it again.',
            fakeAsync(() => {
                // Apply advanced filter through API.
                const tree = new FilteringExpressionsTree(FilteringLogic.And);
                tree.filteringOperands.push({
                    field: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                    conditionName: 'greaterThan'
                });
                const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
                orTree.filteringOperands.push({
                    field: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    conditionName: 'contains',
                    ignoreCase: true
                });
                orTree.filteringOperands.push({
                    field: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                    conditionName: 'contains',
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
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // TO DO: Refactor

                // Verify the content of the first expression in the inner 'or' group.
                verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');

                // Edit the first expression in the inner 'or' group.
                GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1, 0], true); // Double-click the chip
                tick(200);
                fix.detectChanges();
                const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
                UIInteractions.clickAndSendInputElementValue(input, 'a', fix); // Type filter value.

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
                grid.openAdvancedFilteringDialog();
                fix.detectChanges();

                // Verify the content of the first expression in the inner 'or' group.
                verifyExpressionChipContent(fix, [1, 0], 'ProductName', 'Contains', 'angular');
            }));

        it('Should not close the AF dialog when clicking outside of it.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify that the Advanced Filtering dialog is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull('Advanced Filtering dialog is not opened.');

            grid.nativeElement.click();
            tick(200);
            fix.detectChanges();

            // Verify that the Advanced Filtering dialog remains opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull('Advanced Filtering dialog is not opened.');
        }));

        it('Should open the operator dropdown below its respective input-group.', fakeAsync(() => {
            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Add root group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Add a new expression
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'script', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add another expression to root group.
            const btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            btn.click();
            tick(100);
            fix.detectChanges();

            // Populate column input.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.

            // Open the dropdown.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            tick(50);
            fix.detectChanges();
            expect(GridFunctions.getAdvancedFilteringSelectDropdown(fix)).not.toBeNull('dropdown is not opened');

            // Close the dropdown.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            tick(50);
            fix.detectChanges();
            expect(GridFunctions.getAdvancedFilteringSelectDropdown(fix)).toBeNull('dropdown is opened');

            // Open the operator dropdown again.
            GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
            tick(50);
            fix.detectChanges();

            // Verify the operator dropdown is positioned below its respective input-group.
            const dropdown: HTMLElement = GridFunctions.getAdvancedFilteringSelectDropdown(fix);
            expect(GridFunctions.getAdvancedFilteringSelectDropdown(fix)).not.toBeNull('dropdown is not opened');

            const dropdownRect = dropdown.getBoundingClientRect();
            const inputGroup: HTMLElement = GridFunctions.getAdvancedFilteringOperatorSelect(fix).querySelector('igx-input-group');
            const inputGroupRect = inputGroup.getBoundingClientRect();
            const delta = 2;
            expect(Math.abs(dropdownRect.top - inputGroupRect.bottom) < delta).toBe(true,
                'incorrect vertical position of operator dropdown');
            expect(Math.abs(dropdownRect.left - inputGroupRect.left) < delta).toBe(true,
                'incorrect horizontal position of operator dropdown');
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

            grid.openAdvancedFilteringDialog();
            tick(200);
            fix.detectChanges();

            // TO DO: Refactor
            // Add root group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Add a new expression
            selectColumnInEditModeExpression(fix, 2); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(3, 'Wrong filtered rows count');
        }));

        it('Should filter by cells formatted data when using FormattedValuesFilteringStrategy with rowData', fakeAsync(() => {
            const formattedStrategy = new FormattedValuesFilteringStrategy(['ProductName']);
            grid.filterStrategy = formattedStrategy;
            const anotherFieldFormatter = (value: any, rowData: any) => rowData.ID + ':' + value;
            grid.columnList.get(1).formatter = anotherFieldFormatter;
            fix.detectChanges();

            grid.openAdvancedFilteringDialog();
            tick(200);
            fix.detectChanges();

            // TO DO: Refactor

            // Add root group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Add a new expression
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1:', fix); // Type filter value.

            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(1, 'Wrong filtered rows count');
        }));

        it('should handle advanced filtering correctly when grid columns and data are dynamically changed', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxGridAdvancedFilteringDynamicColumnsComponent);
            grid = fixture.componentInstance.grid;
            fixture.detectChanges();

            expect(grid.filteredData).toBeNull();
            expect(grid.rowList.length).toBe(8);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('NetAdvantage');

            // Open Advanced Filtering dialog
            GridFunctions.clickAdvancedFilteringButton(fixture);
            fixture.detectChanges();
            // TO DO: Refactor

            // Click the initial 'Add And Group' button
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fixture, 0);
            tick(100);
            fixture.detectChanges();

            // Populate edit inputs
            selectColumnInEditModeExpression(fixture, 1);
            selectOperatorInEditModeExpression(fixture, 2);
            const input = GridFunctions.getAdvancedFilteringValueInput(fixture).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fixture);

            // Commit the populated expression
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fixture);
            fixture.detectChanges();

            // Apply the filters
            GridFunctions.clickAdvancedFilteringApplyButton(fixture);
            fixture.detectChanges();

            // Verify the filter results
            expect(grid.filteredData.length).toEqual(2);
            expect(grid.rowList.length).toBe(2);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
            expect(GridFunctions.getCurrentCellFromGrid(grid, 1, 1).value).toBe('Ignite UI for Angular');

            // Change the grid's columns collection
            fixture.componentInstance.columns = [
                { field: 'ID', header: 'ID', width: '200px', type: 'string' },
                { field: 'CompanyName', header: 'Company Name', width: '200px', type: 'string' },
                { field: 'ContactName', header: 'Contact Name', width: '200px', type: 'string' },
                { field: 'ContactTitle', header: 'Contact Title', width: '200px', type: 'string' },
                { field: 'City', header: 'City', width: '200px', type: 'string' },
                { field: 'Country', header: 'Country', width: '200px', type: 'string' },
            ];
            fixture.detectChanges();
            flush();

            // Change the grid's data collection
            grid.data = SampleTestData.contactInfoDataFull();
            fixture.detectChanges();
            flush();

            // Spy for error messages in the console
            const consoleSpy = spyOn(console, 'error');

            // Open Advanced Filtering dialog
            GridFunctions.clickAdvancedFilteringButton(fixture);
            fixture.detectChanges();
            flush();

            // Verify the filters are cleared
            expect(grid.filteredData).toEqual([]);
            expect(grid.rowList.length).toBe(0);

            // Check for error messages in the console
            expect(consoleSpy).not.toHaveBeenCalled();
        }));

        describe('Context Menu - ', () => {
            it('Ungroup button of the root group\'s context menu should be disabled.',
                fakeAsync(() => {
                    // Apply advanced filter through API.
                    const tree = new FilteringExpressionsTree(FilteringLogic.And);
                    tree.filteringOperands.push({
                        field: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                        conditionName: 'greaterThan'
                    });
                    grid.advancedFilteringExpressionsTree = tree;
                    fix.detectChanges();

                    // Open Advanced Filtering dialog.
                    grid.openAdvancedFilteringDialog();
                    fix.detectChanges();

                    // Click root group's operator line.
                    const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
                    rootOperatorLine.click();
                    tick(200);
                    fix.detectChanges();

                    // Verify the ungroup button is disabled.
                    const ungroupButton = GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[3];
                    ControlsFunction.verifyButtonIsDisabled(ungroupButton);
                }));
        });
    });

    describe('Localization - ', () => {
        it('Should correctly change resource strings for Advanced Filtering dialog.', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
            const grid: IgxGridComponent = fix.componentInstance.grid;
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
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            expect(GridFunctions.getAdvancedFilteringHeaderText(fix)).toBe('My advanced filter');
            expect(GridFunctions.getAdvancedFilteringHeaderLegendItemAnd(fix).innerText).toBe('My and');
            expect(GridFunctions.getAdvancedFilteringHeaderLegendItemOr(fix).innerText).toBe('My or');
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[0].querySelector('span').innerText)
                .toBe('My and group');
            expect(GridFunctions.getAdvancedFilteringInitialAddGroupButtons(fix)[1].querySelector('span').innerText)
                .toBe('My or group');
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix).innerText).toBe('My initial text');

            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
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
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            const rootOperatorLine = GridFunctions.getAdvancedFilteringTreeRootGroupOperatorLine(fix);
            rootOperatorLine.click();
            fix.detectChanges();

            const buttonGroupItems = GridFunctions.sortNativeElementsHorizontally(
                Array.from(GridFunctions.getAdvancedFilteringContextMenuButtonGroup(fix)
                    .querySelectorAll('.igx-button-group__item-content')));
            expect(buttonGroupItems[0].textContent).toBe('My and');
            expect(buttonGroupItems[1].textContent).toBe('My or');
            expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[3].querySelector('span').innerText)
                .toBe('My ungroup');
            expect(GridFunctions.getAdvancedFilteringContextMenuButtons(fix)[4].querySelector('span').innerText)
                .toBe('My delete');

            // Close context menu.
            GridFunctions.clickAdvancedFilteringContextMenuCloseButton(fix);
            fix.detectChanges();

            // Add another expression to root group.
            let btn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            btn.click();
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.

            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'script', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Select two chips.
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [0]);
            GridFunctions.clickAdvancedFilteringTreeExpressionChip(fix, [1]);
            tick(200);
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
    });

    describe('Column groups - ', () => {
        let fix; let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridAdvancedFilteringColumnGroupComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should not display column groups in advanced filtering dialog.', fakeAsync(() => {
            // Open dialog through API.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add And Group' button.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify that there are no column groups present.
            GridFunctions.clickAdvancedFilteringColumnSelect(fix);
            fix.detectChanges();
            const dropdownValues = GridFunctions.getAdvancedFilteringSelectDropdownItems(fix).map((x: any) => x.innerText);
            const expectedValues = ['ID', 'ProductName', 'Downloads', 'Released', 'ReleaseDate', 'Another Field', 'DateTimeCreated'];
            expect(expectedValues).toEqual(dropdownValues);
        }));

        it('Should correctly focus the search value input when editing the filtering expression', fakeAsync(() => {
            // Open dialog through API.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            //Create dateTime filtering expression
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                field: 'DateTimeCreated', searchVal: '11/11/2000 10:11:11 AM', conditionName: 'equals', condition: IgxStringFilteringOperand.instance().condition('equals')
            });

            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${ADVANCED_FILTERING_EXPRESSION_ITEM_CLASS}`)[0];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the edit icon to enter edit mode of the expression.
            GridFunctions.clickAdvancedFilteringTreeExpressionChipEditIcon(fix, [0]);
            tick();
            fix.detectChanges();

            //Check for the active element
            const searchValueInput = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            expect(document.activeElement).toBe(searchValueInput, 'The input should be the active element.');
        }));
    });

    describe('External - ', () => {
        let fix; let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridExternalAdvancedFilteringComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should allow hosting Advanced Filtering dialog outside of the grid.', fakeAsync(() => {
            // Add a root 'and' group.
            GridFunctions.clickAdvancedFilteringInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            let input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '100', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Add new expression to the root group.
            const addExpressionBtn = GridFunctions.getAdvancedFilteringTreeRootGroupButtons(fix, 0)[0];
            addExpressionBtn.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = GridFunctions.getAdvancedFilteringValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ignite', fix); // Type filter value.
            // Commit the populated expression.
            GridFunctions.clickAdvancedFilteringExpressionCommitButton(fix);
            fix.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify the state of the grid after the filtering.
            expect(grid.advancedFilteringExpressionsTree).toBeTruthy();
            expect(grid.filteredData.length).toBe(1);
            expect(grid.rowList.length).toBe(1);
            expect(GridFunctions.getCurrentCellFromGrid(grid, 0, 1).value).toBe('Ignite UI for JavaScript');
        }));

        it('Should allow hosting Advanced Filtering dialog outside of the hierarchical grid without any console errors.', fakeAsync(() => {
            fix = TestBed.createComponent(IgxHierGridExternalAdvancedFilteringComponent);
            const hgrid: IgxHierarchicalGridComponent = fix.componentInstance.hgrid;
            fix.detectChanges();
            spyOn(console, 'error');

            const advFilterDialog = fix.nativeElement.querySelector('.igx-advanced-filter');
            const applyFilterButton: any = Array.from(advFilterDialog.querySelectorAll('button'))
                .find((b: any) => b.innerText.toLowerCase() === 'apply');

            applyFilterButton.click();
            tick(100);
            fix.detectChanges();

            UIInteractions.simulatePointerEvent('pointerenter',
                hgrid.nativeElement.querySelectorAll('igx-hierarchical-grid-cell')[0], 5, 5);
            fix.detectChanges();

            expect(console.error).not.toHaveBeenCalled();
        }));

    });

    describe('Expression tree bindings - ', () => {
        let fix; let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridAdvancedFilteringBindingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('should correctly filter with \'advancedFilteringExpressionsTree\' binding', fakeAsync(() => {
            // Verify initially filtered in Advanced Filtering - 'Downloads > 200'
            expect(grid.filteredData.length).toEqual(3);
            expect(grid.rowList.length).toBe(3);

            // Verify filtering expressions tree binding state
            expect(grid.advancedFilteringExpressionsTree).toBe(fix.componentInstance.filterTree);

            // Clear filter
            grid.advancedFilteringExpressionsTree = null;
            fix.detectChanges();

            // Verify filtering expressions tree binding state
            expect(grid.advancedFilteringExpressionsTree).toBe(fix.componentInstance.filterTree);

            // Verify no filtered data
            expect(grid.filteredData).toBe(null);
            expect(grid.rowList.length).toBe(8);
        }));

        it('should correctly set filteredData if advancedFilteringExpressionsTree is empty', fakeAsync(() => {
            // Verify filtering expressions tree binding state
            expect(grid.advancedFilteringExpressionsTree).toBe(fix.componentInstance.filterTree);

            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands = [];

            // Clear filter
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Verify filtering expressions tree binding state
            expect(grid.advancedFilteringExpressionsTree).toBe(tree);

            // Verify no filtered data
            expect(grid.filteredData).toBe(null);
        }));
    });

    describe('Overlay settings - ', () => {
        it('Should respect the overlay settings set in the component.', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridAdvancedFilteringOverlaySettingsComponent);
            const grid: IgxGridComponent = fix.componentInstance.grid;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify context menu is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();

            // Press 'Escape' on the context menu.
            UIInteractions.triggerKeyDownEvtUponElem('Escape', GridFunctions.getRowEditingOverlay(fix));
            tick();
            fix.detectChanges();

            // Verify context menu is opened.
            expect(GridFunctions.getAdvancedFilteringComponent(fix)).not.toBeNull();
        }));
    });
});

const selectColumnInEditModeExpression = (fix, dropdownItemIndex: number) => {
    GridFunctions.clickAdvancedFilteringColumnSelect(fix);
    fix.detectChanges();
    GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, dropdownItemIndex);
    tick();
    fix.detectChanges();
};

const selectOperatorInEditModeExpression = (fix, dropdownItemIndex: number) => {
    GridFunctions.clickAdvancedFilteringOperatorSelect(fix);
    fix.detectChanges();
    GridFunctions.clickAdvancedFilteringSelectDropdownItem(fix, dropdownItemIndex);
    tick();
    fix.detectChanges();
};

/**
 * Verifies the type of the operator line ('and' or 'or').
 * (NOTE: The 'operator' argument must be a string with a value that is either 'and' or 'or'.)
 */
const verifyOperatorLine = (operatorLine: HTMLElement, operator: string) => {
    expect(operator === 'and' || operator === 'or').toBe(true, 'operator must be \'and\' or \'or\'');

    if (operator === 'and') {
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS)).toBe(true, 'incorrect operator line');
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS)).toBe(false, 'incorrect operator line');
    } else {
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_AND_CSS_CLASS)).toBe(false, 'incorrect operator line');
        expect(operatorLine.classList.contains(ADVANCED_FILTERING_OPERATOR_LINE_OR_CSS_CLASS)).toBe(true, 'incorrect operator line');
    }
};

const verifyExpressionChipContent = (fix, path: number[], columnText: string, operatorText: string, valueText: string) => {
    const chip = GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, path);
    const chipSpans = GridFunctions.sortNativeElementsHorizontally(Array.from(chip.querySelectorAll('span')));
    const columnSpan = chipSpans[0];
    const operatorSpan = chipSpans[1];
    const valueSpan = chipSpans[2];
    expect(columnSpan.textContent.toLowerCase().trim()).toBe(columnText.toLowerCase(), 'incorrect chip column');
    expect(operatorSpan.textContent.toLowerCase().trim()).toBe(operatorText.toLowerCase(), 'incorrect chip operator');
    expect(valueSpan.textContent.toLowerCase().trim()).toBe(valueText.toLowerCase(), 'incorrect chip filter value');
};

const verifyEditModeExpressionInputStates = (fix,
    columnSelectEnabled: boolean,
    operatorSelectEnabled: boolean,
    valueInputEnabled: boolean,
    commitButtonEnabled: boolean) => {
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

    // Verify commit expression button state
    const commitButton = GridFunctions.getAdvancedFilteringExpressionCommitButton(fix);
    ControlsFunction.verifyButtonIsDisabled(commitButton, !commitButtonEnabled);


    // Verify close expression button is enabled.
    const closeButton = GridFunctions.getAdvancedFilteringExpressionCloseButton(fix);
    ControlsFunction.verifyButtonIsDisabled(closeButton, false);
};

const verifyElementIsInExpressionsContainerView = (fix, element: HTMLElement) => {
    const elementRect = element.getBoundingClientRect();
    const exprContainer: HTMLElement = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
    const exprContainerRect = exprContainer.getBoundingClientRect();
    expect(elementRect.top >= exprContainerRect.top).toBe(true, 'top is not in view');
    expect(elementRect.bottom <= exprContainerRect.bottom).toBe(true, 'bottom is not in view');
    expect(elementRect.left >= exprContainerRect.left).toBe(true, 'left is not in view');
    expect(elementRect.right <= exprContainerRect.right).toBe(true, 'right is not in view');
};
