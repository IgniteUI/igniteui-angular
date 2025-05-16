import { fakeAsync, TestBed, tick, flush, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
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
    IgxGridAdvancedFilteringDynamicColumnsComponent,
    IgxGridAdvancedFilteringSerializedTreeComponent,
    IgxGridAdvancedFilteringWithToolbarComponent
} from '../../test-utils/grid-samples.spec';
import { FormattedValuesFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxHierarchicalGridExportComponent, IgxHierarchicalGridTestBaseComponent, IgxHierGridExternalAdvancedFilteringComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { IgxHierarchicalGridComponent } from '../hierarchical-grid/public_api';
import { IFilteringEventArgs, IgxGridToolbarAdvancedFilteringComponent } from '../public_api';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { QueryBuilderFunctions } from '../../query-builder/query-builder-functions.spec';
import { By } from '@angular/platform-browser';
import { IgxDateTimeEditorDirective } from '../../directives/date-time-editor/date-time-editor.directive';
import { QueryBuilderSelectors } from '../../query-builder/query-builder.common';
import { IgxHGridRemoteOnDemandComponent } from '../hierarchical-grid/hierarchical-grid.spec';
import { IGridResourceStrings } from '../../core/i18n/grid-resources';

describe('IgxGrid - Advanced Filtering #grid - ', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridAdvancedFilteringColumnGroupComponent,
                IgxGridAdvancedFilteringComponent,
                IgxGridExternalAdvancedFilteringComponent,
                IgxGridAdvancedFilteringBindingComponent,
                IgxHierGridExternalAdvancedFilteringComponent,
                IgxGridAdvancedFilteringDynamicColumnsComponent,
                IgxGridAdvancedFilteringWithToolbarComponent,
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridExportComponent,
                IgxHGridRemoteOnDemandComponent
            ]
        }).compileComponents();
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

            const advFilteringDialog = GridFunctions.getAdvancedFilteringComponent(fix);

            // Verify AF dialog is opened.
            expect(advFilteringDialog).not.toBeNull();
            expect(advFilteringDialog.querySelector('igx-query-builder')).not.toBeNull();

            // Verify there are not filters present and that the default text is shown.
            expect(grid.advancedFilteringExpressionsTree).toBeUndefined();
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);

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

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            let input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

            // Click the existing chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
            tick(50);
            fix.detectChanges();
            // Edit the filter value.
            input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'some non-existing value', fix); // Type filter value.
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

        it('Should update the Advanced Filtering button in toolbar when (filtering)/(clear filtering).', fakeAsync(() => {
            // Verify that the advanced filtering button indicates there are no filters.
            let advFilterBtn = GridFunctions.getAdvancedFilteringButton(fix);
            expect(Array.from(advFilterBtn.children).some(c => (c as any).classList.contains('igx-adv-filter--column-number')))
                .toBe(false, 'Button indicates there is active filtering.');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

        it('The Clear/Cancel/Apply buttons type should be set to "button"',  fakeAsync(() => {
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
        }));

        it('Should emit the filtering event when applying filters.', fakeAsync(() => {
            spyOn(grid.filtering, 'emit');

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
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
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
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

            // Verify there is a root group with 'And' operator line and 2 children.
            const rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
            expect(rootGroup).not.toBeNull();
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'and');
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup as HTMLElement).length).toBe(2);

            // Verify the content of the first child (expression) of the root group.
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'Downloads', 'Greater Than', '100');

            // Verify the content of the second child (group) of the root group.
            const group = QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group as HTMLElement, false).length).toBe(2);
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0], 'ProductName', 'Contains', 'angular');
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 1], 'ProductName', 'Contains', 'script');
            // Verify the operator line of the child group.
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeGroupOperatorLine(fix, [0]) as HTMLElement, 'or');

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
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);
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

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'script', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
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

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
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

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.

            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            expect(grid.filteredData).toBe(null);

            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.

            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            expect(GridFunctions.getAdvancedFilteringComponent(fix)).toBeNull();
            expect(grid.filteredData).toBe(null);
        }));

        it('Column dropdown should contain only filterable columns.', fakeAsync(() => {
            // Make the 'Downloads', 'Released' and 'ReleaseDate' columns non-filterable.
            grid.getColumnByName('Downloads').filterable = false;
            grid.getColumnByName('Released').filterable = false;
            grid.getColumnByName('ReleaseDate').filterable = false;
            grid.cdr.detectChanges();
            tick(100);

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[0].nativeElement;

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify that only filterable columns are present.
            QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
            fix.detectChanges();
            const dropdownItems = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement);
            expect(dropdownItems.length).toBe(4);
            expect((dropdownItems[0] as HTMLElement).innerText).toBe('ID');
            expect((dropdownItems[1] as HTMLElement).innerText).toBe('ProductName');
            expect((dropdownItems[2] as HTMLElement).innerText).toBe('AnotherField');
            expect((dropdownItems[3] as HTMLElement).innerText).toBe('ReleaseTime');
        }));

        it('Should scroll the adding buttons into view when the add icon of a chip is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals'
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM}`)[9];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the add icon to display the adding buttons.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipIcon(fix, [9], 'add');
            fix.detectChanges();
            tick(50);

            // Verify the adding buttons are in view.
            const addingButtons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            for (const addingButton of addingButtons) {
                verifyElementIsInExpressionsContainerView(fix, addingButton as HTMLElement);
            }
        }));

        it('Should scroll the newly added expression into view when the respective add button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals'
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the previous to last visible expression chip.
            const expressionItem = fix.nativeElement.querySelectorAll(`.${QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM}`)[9];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the add icon to display the adding buttons.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipIcon(fix, [9], 'add');
            fix.detectChanges();
            tick(50);

            // Click the 'add condition' button.
            const addCondButton = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[0] as HTMLElement;
            addCondButton.click();
            fix.detectChanges();

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false) as HTMLElement);
        }));

        it('Should scroll to the expression when entering its edit mode.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.Or);
            for (let index = 0; index < 30; index++) {
                tree.filteringOperands.push({
                    fieldName: 'Downloads', searchVal: index, condition: IgxNumberFilteringOperand.instance().condition('equals'), conditionName: 'equals'
                });
            }
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            GridFunctions.clickAdvancedFilteringButton(fix);
            fix.detectChanges();

            // Scroll to the top.
            const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix);
            tick(50);
            exprContainer.scrollTop = 0;

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM}`)[9];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the chip to enter edit mode of the expression.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [9]);
            fix.detectChanges();
            tick(50);

            // Verify the edit mode container (the one with the editing inputs) is in view.
            verifyElementIsInExpressionsContainerView(fix, QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false) as HTMLElement);
        }));

        it('Should clear all conditions and groups when the \'clear filter\' button is clicked.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            tree.filteringOperands.push(orTree);
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Verify there are filters in the dialog.
            expect(QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix)).not.toBeNull();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify there are no filters in the dialog.
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);
        }));

        it('Should keep edited conditions and groups inside AF dialog when applying and opening it again.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
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

            // Verify the content of the first expression in the inner 'or' group.
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0], 'ProductName', 'Contains', 'angular');

            // Edit the first expression in the inner 'or' group.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0, 0]); // Click the chip
            tick(200);
            fix.detectChanges();
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0], 'ProductName', 'Contains', 'a');
        }));

        it('Should not keep changes over edited conditions and groups inside AF dialog when canceling and opening it again.', fakeAsync(() => {
            // Apply advanced filter through API.
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Downloads', searchVal: 100, condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan'
            });
            const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'angular', condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                ignoreCase: true
            });
            orTree.filteringOperands.push({
                fieldName: 'ProductName', searchVal: 'script', condition: IgxStringFilteringOperand.instance().condition('contains'),
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

            // Verify the content of the first expression in the inner 'or' group.
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0], 'ProductName', 'Contains', 'angular');

            // Edit the first expression in the inner 'or' group.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0, 0]); // Click the chip
            tick(200);
            fix.detectChanges();
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0], 'ProductName', 'Contains', 'angular');
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

            // Add root group.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Add a new expression
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

            // Add root group.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Add a new expression
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1:', fix); // Type filter value.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            tick(100);
            fix.detectChanges();
            GridFunctions.clickAdvancedFilteringApplyButton(fix);
            tick(100);
            fix.detectChanges();

            const rows = GridFunctions.getRows(fix);
            expect(rows.length).toEqual(1, 'Wrong filtered rows count');
        }));

        it('DateTime: Should set editorOptions.dateTimeFormat prop as inputFormat for the filter value editor', fakeAsync(() => {
            const releaseDateColumn = grid.getColumnByName('ReleaseDate');
            releaseDateColumn.dataType = 'dateTime';
            releaseDateColumn.editorOptions = {
                dateTimeFormat: 'dd-MM-yyyy HH:mm aaaaa'
            }
            fix.detectChanges();

            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[0].nativeElement;
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
            fix.detectChanges();
            const dropdownItems = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement);
            expect((dropdownItems[4] as HTMLElement).innerText).toBe('ReleaseDate');

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 4); // Select 'ReleaseDate' column
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);

            const dateTimeEditor = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat.normalize('NFKC')).toMatch(releaseDateColumn.editorOptions.dateTimeFormat);
            expect(dateTimeEditor.displayFormat.normalize('NFKC')).toMatch(releaseDateColumn.pipeArgs.format);
            expect(dateTimeEditor.locale).toMatch(grid.locale);
        }));

        it('DateTime: Should set pipeArgs.format as inputFormat for the filter editor if numeric and editorOptions.dateTimeFormat not set', fakeAsync(() => {
            const releaseDateColumn = grid.getColumnByName('ReleaseDate');
            releaseDateColumn.dataType = 'dateTime';
            releaseDateColumn.pipeArgs = {
                format: 'dd-MM-yyyy HH:mm aaaaa'
            }
            fix.detectChanges();

            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 4);
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);

            const dateTimeEditor = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat.normalize('NFKC')).toMatch(releaseDateColumn.pipeArgs.format);
            expect(dateTimeEditor.displayFormat.normalize('NFKC')).toMatch(releaseDateColumn.pipeArgs.format);
        }));

        it('Time: Should set editorOptions.dateTimeFormat prop as inputFormat for the filter value editor', fakeAsync(() => {
            const releaseTimeColumn = grid.getColumnByName('ReleaseTime');
            releaseTimeColumn.editorOptions = {
                dateTimeFormat: 'hh:mm'
            }
            fix.detectChanges();

            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 6);
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);

            const dateTimeEditor = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat.normalize('NFKC')).toMatch(releaseTimeColumn.editorOptions.dateTimeFormat);
        }));

        it('Time: Should set pipeArgs.format as inputFormat for the filter editor if numeric and editorOptions.dateTimeFormat not set', fakeAsync(() => {
            const releaseTimeColumn = grid.getColumnByName('ReleaseTime');
            releaseTimeColumn.pipeArgs = {
                format: 'hh:mm'
            }
            fix.detectChanges();

            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 6);
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);

            const dateTimeEditor = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat.normalize('NFKC')).toMatch(releaseTimeColumn.pipeArgs.format);
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

            // Click the initial 'Add Condition' button
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fixture, 0);
            tick(100);
            fixture.detectChanges();

            // Populate edit inputs
            QueryBuilderFunctions.selectColumnInEditModeExpression(fixture, 1);
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fixture, 2);
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fixture).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ign', fixture);

            // Commit the populated expression
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fixture);
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
    });

    describe('Advanced filtering with toolbar', () => {
        let fix: ComponentFixture<IgxGridAdvancedFilteringWithToolbarComponent>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridAdvancedFilteringWithToolbarComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should update toolbar when advancedFilteringExpressionsTreeChange emits a new value', fakeAsync(() => {
            // Set initial filtering expressions tree
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'ProductName',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                searchVal: 'angular',
                ignoreCase: true
            });

            // Apply the initial filtering tree
            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Create a new filtering tree with more filters
            const updatedTree = new FilteringExpressionsTree(FilteringLogic.And);
            updatedTree.filteringOperands.push({
                fieldName: 'Downloads',
                condition: IgxStringFilteringOperand.instance().condition('equals'),
                searchVal: 10,
                ignoreCase: true
            });
            updatedTree.filteringOperands.push({
                fieldName: 'ProductName',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                searchVal: 'angular',
                ignoreCase: true
            });
            updatedTree.filteringOperands.push({
                fieldName: 'Category',
                condition: IgxStringFilteringOperand.instance().condition('equals'),
                searchVal: 'electronics',
                ignoreCase: false
            });

            // Update the filtering expressions tree
            grid.advancedFilteringExpressionsTree = updatedTree;
            fix.detectChanges();

            // Verify the correct number of filters
            const toolbarDebugElement = fix.debugElement.query(By.directive(IgxGridToolbarAdvancedFilteringComponent));
            const toolbarComponent = toolbarDebugElement.componentInstance as IgxGridToolbarAdvancedFilteringComponent;
            const numberOfFilters = (toolbarComponent as any).numberOfColumns;

            expect(grid.advancedFilteringExpressionsTree.filteringOperands.length).toEqual(3);
            expect(numberOfFilters).toEqual(3);
        }));
    })

    describe('Localization - ', () => {
        it('Should correctly change resource strings for Advanced Filtering dialog.', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
            const grid: IgxGridComponent = fix.componentInstance.grid;
            const myResourceStrings: IGridResourceStrings = {
                igx_grid_filter_operator_and: 'My and',
                igx_grid_filter_operator_or: 'My or',
                igx_grid_advanced_filter_title: 'My advanced filter',
                igx_grid_advanced_filter_end_group: 'My end group',
                igx_grid_advanced_filter_create_and_group: 'My create and group',
                igx_grid_advanced_filter_and_label: 'My and',
                igx_grid_advanced_filter_or_label: 'My or',
                igx_grid_advanced_filter_add_condition: 'Add my condition',
                igx_grid_advanced_filter_add_condition_root: 'My condition',
                igx_grid_advanced_filter_add_group_root: 'My group',
                igx_grid_advanced_filter_add_group: 'Add my group',
                igx_grid_advanced_filter_ungroup: 'My ungroup',
                igx_grid_advanced_filter_switch_group: 'My switch to {0}',
                igx_grid_advanced_filter_delete_filters: 'My delete filters'
            };

            grid.resourceStrings = {
                ...grid.resourceStrings,
                ...myResourceStrings
            };

            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'ProductName',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                searchVal: 'angular',
                ignoreCase: true
            });

            grid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fix).trim()).toBe('My advanced filter');
            expect((QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[0] as HTMLElement).querySelector('span').innerText)
                .toBe('My condition');
            expect((QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[1] as HTMLElement).querySelector('span').innerText)
                .toBe('My group');

            QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 0);
            tick(100);
            fix.detectChanges();
            
            const groupDDLItems = QueryBuilderFunctions.getQueryBuilderGroupContextMenuDropDownItems(fix);
            expect(groupDDLItems[0].innerText).toBe('My switch to MY OR');
            expect(groupDDLItems[1].innerText).toBe('My ungroup');

            QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 0);
            tick(100);
            fix.detectChanges();

            // Hover the condition chip to show the add button
            const expressionItem = fix.nativeElement.querySelectorAll(`.${QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM}`)[0];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick();
            fix.detectChanges();

            // Click the add icon to display the adding buttons and verify their content.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipIcon(fix, [0], 'add');
            fix.detectChanges();
            tick(50);

            const addingButtons: any = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            expect(addingButtons[0].innerText).toBe('add\nMy condition');
            expect(addingButtons[1].innerText).toBe('add\nMy group');
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

            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[0].nativeElement;

            // Click the initial 'Add Condition' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open column dropdown and verify that there are no column groups present.
            QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
            fix.detectChanges();
            const dropdownValues = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            const expectedValues = ['ID', 'ProductName', 'Downloads', 'Released', 'ReleaseDate', 'AnotherField', 'DateTimeCreated'];
            expect(expectedValues).toEqual(dropdownValues);
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
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2); // Select 'Downloads' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator.
            let input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '100', fix); // Type filter value.
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            // Add new expression to the root group.
            const addExpressionBtn = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[0] as HTMLElement;
            addExpressionBtn.click();
            tick(100);
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'ignite', fix); // Type filter value.
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
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

    describe('Expression tree rehydration - ', () => {
        let fix: ComponentFixture<IgxGridAdvancedFilteringSerializedTreeComponent>;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxGridAdvancedFilteringSerializedTreeComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('should correctly filter with a deserialized expression tree.', fakeAsync(() => {
            const errorSpy = spyOn(console, 'error');

            expect(errorSpy).not.toHaveBeenCalled();

            // Verify filtered data
            expect(grid.filteredData.length).toEqual(3);
            expect(grid.rowList.length).toBe(3);
        }));

        it('should correctly filter with a declared IFilteringExpressionsTree object.', fakeAsync(() => {
            const errorSpy = spyOn(console, 'error');
            fix.componentInstance.grid.advancedFilteringExpressionsTree = fix.componentInstance.filterTreeObject;
            fix.detectChanges();
            expect(errorSpy).not.toHaveBeenCalled();

            // Verify filtered data
            expect(grid.filteredData.length).toEqual(2);
            expect(grid.rowList.length).toBe(2);
        }));

        it('should correctly filter when binding to a declared IFilteringExpressionsTree object.', fakeAsync(() => {
            const errorSpy = spyOn(console, 'error');
            fix.componentInstance.filterTree = fix.componentInstance.filterTreeObject;
            fix.detectChanges();

            expect(errorSpy).not.toHaveBeenCalled();

            // Verify filtered data
            expect(grid.filteredData.length).toEqual(2);
            expect(grid.rowList.length).toBe(2);
        }));
    });

    describe('Hierarchical grid advanced filtering - ', () => {
        let fix: ComponentFixture<IgxHierarchicalGridTestBaseComponent>;
        let hgrid: IgxHierarchicalGridComponent;

        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
            hgrid = fix.componentInstance.hgrid;
            hgrid.allowAdvancedFiltering = true;
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            hgrid.openAdvancedFilteringDialog();
            fix.detectChanges();

            // Click the initial 'Add Condition' button of the query builder.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();
        }));

        it(`Should have 'In'/'Not-In' operators for fields with chilld entities.`, fakeAsync(() => {
            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'ID' column.

            // Open the operator dropdown and verify they are 'string' specific + 'In'/'Not In'.
            QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix);
            fix.detectChanges();
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[0].nativeElement;
            const dropdownValues: string[] = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            const expectedValues = ['Contains', 'Does Not Contain', 'Starts With', 'Ends With', 'Equals',
                'Does Not Equal', 'Empty', 'Not Empty', 'Null', 'Not Null', 'In', 'Not In'];;
            expect(dropdownValues).toEqual(expectedValues);

            // Close Advanced Filtering dialog.
            hgrid.closeAdvancedFilteringDialog(false);
            tick(200);
            fix.detectChanges();
        }));

        it(`Should NOT have 'In'/'Not-In' operators for fields without chilld entities.`, fakeAsync(() => {
            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'ID' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

            // Select entity in nested level
            QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0, 1);
            // Populate edit inputs on level 1.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 1); // Select 'ID' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 11, 1); // Select 'Not In' operator. 

            // Select entity in nested level
            QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0, 2);
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 2); // Select 'ID' column.
            // Open the operator dropdown and verify they are 'string' specific + 'In'/'Not In'.
            QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix, 2);
            fix.detectChanges();
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[2].nativeElement;
            const dropdownValues: string[] = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            const expectedValues = ['Contains', 'Does Not Contain', 'Starts With', 'Ends With', 'Equals',
                'Does Not Equal', 'Empty', 'Not Empty', 'Null', 'Not Null'];;
            expect(dropdownValues).toEqual(expectedValues);

            // Close Advanced Filtering dialog.
            hgrid.closeAdvancedFilteringDialog(false);
            tick(200);
            fix.detectChanges();                                  
        }));

        it('Should have correct entities depending on the hierarchy level.', fakeAsync(() => {
            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'ID' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

            QueryBuilderFunctions.clickQueryBuilderEntitySelect(fix, 1);
            fix.detectChanges();
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[1].nativeElement;
            const dropdownValues: string[] = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            const expectedValues = ['childData'];
            expect(dropdownValues).toEqual(expectedValues);  
            
            // Close Advanced Filtering dialog.
            hgrid.closeAdvancedFilteringDialog(false);
            tick(200);
            fix.detectChanges(); 
        }));

        it(`Should apply 'In'/'Not-In' operators for each level properly.`, fakeAsync(() => {
            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'ID' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.
            tick(100);
            fix.detectChanges();

            // When there is one entity, it should be selected by default
            const entityInputGroup = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, 1).querySelector('input');
            expect(entityInputGroup.value).toBe('childData');

            const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, 1).querySelector('input');
            expect(fieldInputGroup.value).toBe('ID');

            // Click the initial 'Add Condition' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();
            // Populate edit inputs on level 1.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 1); // Select 'ID' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0, 1); // Select 'Contains' operator. 

            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false, 1).querySelector('input');
            // Type Value
            UIInteractions.clickAndSendInputElementValue(input, '39');
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, 1);
            fix.detectChanges();
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, 0);
            fix.detectChanges();
            // Close Advanced Filtering dialog.
            hgrid.closeAdvancedFilteringDialog(true);
            tick(200);
            fix.detectChanges(); 

            // Veify grid data
            expect(hgrid.filteredData.length).toEqual(5);
            expect(hgrid.rowList.length).toBe(5);
        }));

        it(`Should have correct return fields in the child query when there are multiple child entities.`, fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxHierarchicalGridExportComponent);
            const hierarchicalGrid = fixture.componentInstance.hGrid;
            fixture.componentInstance.shouldDisplayArtist = true;
            hierarchicalGrid.allowAdvancedFiltering = true;
            fixture.detectChanges();

            hierarchicalGrid.openAdvancedFilteringDialog();
            fixture.detectChanges();

            // Click the initial 'Add Condition' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fixture, 0);
            tick(100);
            fixture.detectChanges();
            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fixture, 0); // Select 'Artist' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fixture, 10); // Select 'In' operator.
            tick(100);
            fixture.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fixture, 0, 1);
            tick(100);
            fixture.detectChanges();

            const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fixture, 1).querySelector('input');
            expect(fieldInputGroup.value).toBe('Artist');
        }));

        it('Should correctly apply filtering expressions tree to the hgrid component through API.', fakeAsync(() => {
            // Close Advanced Filtering dialog.
            hgrid.closeAdvancedFilteringDialog(false);
            tick(200);
            fix.detectChanges(); 
            // Spy for error messages in the console
            const consoleSpy = spyOn(console, 'error');
            // Apply advanced filter through API.
            const innerTree = new FilteringExpressionsTree(0, undefined, 'childData', ['ID']);
            innerTree.filteringOperands.push({
                fieldName: 'ID',
                ignoreCase: false,
                conditionName: IgxStringFilteringOperand.instance().condition('contains').name,
                searchVal: '39'
            });
    
            const tree = new FilteringExpressionsTree(0, undefined, 'rootData', ['ID']);
            tree.filteringOperands.push({
                fieldName: 'ID',
                conditionName: IgxStringFilteringOperand.instance().condition('inQuery').name,
                ignoreCase: false,
                searchTree: innerTree
            });

            hgrid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();

            // Check for error messages in the console
            expect(consoleSpy).not.toHaveBeenCalled();
            expect(hgrid.filteredData.length).toBe(5);
        }));

        it('Should correctly apply JSON filtering expressions tree to the hgrid correctly.', fakeAsync(() => {
            // Close Advanced Filtering dialog.
            hgrid.closeAdvancedFilteringDialog(false);
            tick(200);
            fix.detectChanges(); 
            // Spy for error messages in the console
            const consoleSpy = spyOn(console, 'error');

            const innerTree = new FilteringExpressionsTree(0, undefined, 'childData', ['ID']);
            innerTree.filteringOperands.push({
                fieldName: 'ID',
                ignoreCase: false,
                conditionName: IgxStringFilteringOperand.instance().condition('contains').name,
                searchVal: '39'
            });
    
            const tree = new FilteringExpressionsTree(0, undefined, 'rootData', ['ID']);
            tree.filteringOperands.push({
                fieldName: 'ID',
                conditionName: IgxStringFilteringOperand.instance().condition('inQuery').name,
                ignoreCase: false,
                searchTree: innerTree
            });

            hgrid.advancedFilteringExpressionsTree = JSON.parse(JSON.stringify(tree));
            fix.detectChanges();

            // Check for error messages in the console
            expect(consoleSpy).not.toHaveBeenCalled();
            expect(hgrid.filteredData.length).toBe(5);
        }));

        it('Should have proper fields in UI when schema is defined with load on demand.', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxHGridRemoteOnDemandComponent);
            const hierarchicalGrid = fixture.componentInstance.instance;
            hierarchicalGrid.allowAdvancedFiltering = true;
            hierarchicalGrid.schema = [
                {
                    name: 'rootLevel',
                    fields: [
                        { field: 'ID', dataType: 'string' },
                        { field: 'ChildLevels', dataType: 'number' },
                        { field: 'ProductName', dataType: 'string' },
                        { field: 'Col1', dataType: 'number' },
                        { field: 'Col2', dataType: 'number' },
                        { field: 'Col3', dataType: 'number' }
                    ],
                    childEntities: [
                        {
                            name: 'childData',
                            fields: [
                                { field: 'ID', dataType: 'string' },
                                { field: 'ProductName', dataType: 'string' }
                            ],
                            childEntities: [
                                {
                                    name: 'childData2',
                                    fields: [
                                        { field: 'ID', dataType: 'string' },
                                        { field: 'ProductName', dataType: 'string' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
            fixture.detectChanges();

            hierarchicalGrid.openAdvancedFilteringDialog();
            fixture.detectChanges();

            // Click the initial 'Add Condition' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fixture, 0);
            tick(100);
            fixture.detectChanges();
            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fixture, 0); // Select 'ID' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fixture, 10); // Select 'In' operator.
            tick(100);
            fixture.detectChanges();

            const entityInputGroup = QueryBuilderFunctions.getQueryBuilderEntitySelect(fixture, 1).querySelector('input');
            expect(entityInputGroup.value).toBe('childData');

            const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fixture, 1).querySelector('input');
            expect(fieldInputGroup.value).toBe('ID');

            // Verify entities
            QueryBuilderFunctions.clickQueryBuilderEntitySelect(fixture, 1);
            fixture.detectChanges();
            const queryBuilderElement: HTMLElement = fixture.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[1].nativeElement;
            let dropdownValues: string[] = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            let expectedValues = ['childData'];
            expect(dropdownValues).toEqual(expectedValues);

            // Verify return fileds
            QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fixture, 1);
            fixture.detectChanges();
            dropdownValues = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement, 1).map((x: any) => x.innerText);
            expectedValues = ['ID', 'ProductName'];
            expect(dropdownValues).toEqual(expectedValues);
        }));

        it('Should correctly change resource strings for hierarchical Advanced Filtering dialog.', fakeAsync(() => {
            debugger
            hgrid.closeAdvancedFilteringDialog(false);
            tick(200);
            fix.detectChanges(); 
            
            const innerTree = new FilteringExpressionsTree(0, undefined, 'childData', ['ID']);
            innerTree.filteringOperands.push({
                fieldName: 'ID',
                ignoreCase: false,
                conditionName: IgxStringFilteringOperand.instance().condition('contains').name,
                searchVal: '39'
            });
    
            const tree = new FilteringExpressionsTree(0, undefined, 'rootData', ['ID']);
            tree.filteringOperands.push({
                fieldName: 'ID',
                conditionName: IgxStringFilteringOperand.instance().condition('inQuery').name,
                ignoreCase: false,
                searchTree: innerTree
            });

            hgrid.advancedFilteringExpressionsTree = tree;
            
            const myResourceStrings: IGridResourceStrings = {
                igx_grid_filter_operator_and: 'My and',
                igx_grid_filter_operator_or: 'My or',
                igx_grid_advanced_filter_title: 'My advanced filter',
                igx_grid_advanced_filter_end_group: 'My end group',
                igx_grid_advanced_filter_create_and_group: 'My create and group',
                igx_grid_advanced_filter_and_label: 'My and',
                igx_grid_advanced_filter_or_label: 'My or',
                igx_grid_advanced_filter_add_condition: 'Add my condition',
                igx_grid_advanced_filter_add_condition_root: 'My condition',
                igx_grid_advanced_filter_add_group_root: 'My group',
                igx_grid_advanced_filter_add_group: 'Add my group',
                igx_grid_advanced_filter_ungroup: 'My ungroup',
                igx_grid_advanced_filter_switch_group: 'My switch to {0}',
                igx_grid_advanced_filter_delete_filters: 'My delete filters',
                igx_grid_advanced_filter_from_label: 'My from',
                igx_grid_advanced_filter_query_value_placeholder: 'My sub-query results',
            };

            hgrid.resourceStrings = {
                ...hgrid.resourceStrings,
                ...myResourceStrings
            };

            fix.detectChanges();

            // Open Advanced Filtering dialog.
            hgrid.openAdvancedFilteringDialog();
            fix.detectChanges();
            
            // Open up the sub-query
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
            tick(100);
            fix.detectChanges();

            const valueInput: any = QueryBuilderFunctions.getQueryBuilderValueInput(fix);
            expect(valueInput.querySelector('input').placeholder).toBe('My sub-query results');

        }));
    });
});


const verifyElementIsInExpressionsContainerView = (fix, element: HTMLElement) => {
    const elementRect = element.getBoundingClientRect();
    const exprContainer: HTMLElement = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix) as HTMLElement;
    const exprContainerRect = exprContainer.getBoundingClientRect();
    expect(elementRect.top >= exprContainerRect.top).toBe(true, 'top is not in view');
    expect(elementRect.bottom <= exprContainerRect.bottom).toBe(true, 'bottom is not in view');
    expect(elementRect.left >= exprContainerRect.left).toBe(true, 'left is not in view');
    expect(elementRect.right <= exprContainerRect.right).toBe(true, 'right is not in view');
};
