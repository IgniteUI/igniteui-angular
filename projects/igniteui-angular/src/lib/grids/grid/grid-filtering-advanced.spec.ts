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
    IgxGridAdvancedFilteringDynamicColumnsComponent
} from '../../test-utils/grid-samples.spec';
import { FormattedValuesFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxHierGridExternalAdvancedFilteringComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { IgxHierarchicalGridComponent } from '../hierarchical-grid/public_api';
import { IFilteringEventArgs } from '../public_api';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { QueryBuilderFunctions } from '../../query-builder/query-builder-functions.spec';
import { By } from '@angular/platform-browser';
import { IgxDateTimeEditorDirective } from '../../directives/date-time-editor/date-time-editor.directive';
import { QueryBuilderSelectors } from '../../query-builder/query-builder.common';

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

            // Verfiy there is a root group with 'And' operator line and 2 children.
            const rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
            expect(rootGroup).not.toBeNull();
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'and');
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup as HTMLElement).length).toBe(2);

            // Verify the contnet of the first child (expression) of the root group.
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
            expect((dropdownItems[0] as HTMLElement).innerText).toBe('HeaderID');
            expect((dropdownItems[1] as HTMLElement).innerText).toBe('ProductName');
            expect((dropdownItems[2] as HTMLElement).innerText).toBe('Another Field');
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
                { fieldName: 'ID', header: 'ID', width: '200px', type: 'string' },
                { fieldName: 'CompanyName', header: 'Company Name', width: '200px', type: 'string' },
                { fieldName: 'ContactName', header: 'Contact Name', width: '200px', type: 'string' },
                { fieldName: 'ContactTitle', header: 'Contact Title', width: '200px', type: 'string' },
                { fieldName: 'City', header: 'City', width: '200px', type: 'string' },
                { fieldName: 'Country', header: 'Country', width: '200px', type: 'string' },
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

    describe('Localization - ', () => {
        it('Should correctly change resource strings for Advanced Filtering dialog.', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
            const grid: IgxGridComponent = fix.componentInstance.grid;
            grid.resourceStrings = Object.assign({}, grid.resourceStrings, {
                igx_grid_filter_operator_and: 'My and',
                igx_grid_filter_operator_or: 'My or',
                igx_grid_advanced_filter_title: 'My advanced filter',
                igx_grid_advanced_filter_end_group: 'My end group',
                igx_grid_advanced_filter_create_and_group: 'My create and group',
                igx_grid_advanced_filter_and_label: 'My and',
                igx_grid_advanced_filter_or_label: 'My or',
                igx_grid_advanced_filter_add_condition_root: 'My condition',
                igx_grid_advanced_filter_add_group_root: 'My group',
                igx_grid_advanced_filter_ungroup: 'My ungroup',
                igx_grid_advanced_filter_delete_filters: 'My delete filters'
            });
            fix.detectChanges();

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fix.detectChanges();

            expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fix).trim()).toBe('My advanced filter');
            expect(QueryBuilderFunctions.getQueryBuilderInitialAddConditionBtn(fix).querySelector('span').innerText)
                .toBe('My condition');

            QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
            tick(100);
            fix.detectChanges();

            
            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            
            let input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'angular', fix); // Type filter value.
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();
            expect((QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[0] as HTMLElement).querySelector('span').innerText)
                .toBe('My condition');
            expect((QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[1] as HTMLElement).querySelector('span').innerText)
                .toBe('My group');
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
            const expectedValues = ['ID', 'ProductName', 'Downloads', 'Released', 'ReleaseDate', 'Another Field', 'DateTimeCreated'];
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
