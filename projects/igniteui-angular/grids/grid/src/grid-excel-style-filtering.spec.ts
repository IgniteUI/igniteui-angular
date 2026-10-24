// Excel style filtering: column actions, custom dialog basics, sizing and search list.
import { DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxExcelStyleSearchComponent, GridSelectionMode, FilterMode } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, frames, nextFrame, wait } from '../../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { SCROLL_FRAMES, verifyFilteringExpression } from '../../../test-utils/grid-filtering-functions.spec';
import {
    IgxGridFilteringComponent,
    IgxGridFilteringMCHComponent,
    IgxGridFilteringESFEmptyTemplatesComponent,
    IgxGridFilteringESFTemplatesComponent,
    IgxGridFilteringESFSizingComponent,
    IgxGridFilteringESFLoadOnDemandComponent,
    IgxGridFilteringESFRemoteChunkComponent,
    IgxGridExternalESFComponent,
    IgxGridExternalESFTemplateComponent
} from '../../../test-utils/grid-samples.spec';
import { ControlsFunction } from '../../../test-utils/controls-functions.spec';
import { setElementSize } from '../../../test-utils/helper-utils.spec';
import {
    ExpressionsTreeUtil,
    FilteringExpressionsTree,
    FilteringLogic,
    getComponentSize,
    IFilteringExpression,
    IFilteringExpressionsTree,
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand,
    ɵSize,
    SortingDirection
} from 'igniteui-angular/core';
import { IgxIconComponent } from 'igniteui-angular';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('IgxGrid - Filtering actions - Excel style filtering #grid', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridFilteringComponent,
                IgxGridFilteringESFEmptyTemplatesComponent,
                IgxGridFilteringESFTemplatesComponent,
                IgxGridFilteringESFSizingComponent,
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
            await nextFrame();

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
            await nextFrame();
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
            await nextFrame();
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
            await nextFrame();
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

            const operands = (ExpressionsTreeUtil.find(grid.filteringExpressionsTree, 'ReleaseTime') as IFilteringExpressionsTree).filteringOperands as IFilteringExpression[];
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

            const operands = (ExpressionsTreeUtil.find(grid.filteringExpressionsTree, 'ReleaseTime') as IFilteringExpressionsTree).filteringOperands as IFilteringExpression[];
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
            await nextFrame();
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);

            // Type string in search box.
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'ignite', fix);
            fix.detectChanges();
            await nextFrame();

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
            await nextFrame();

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
            await nextFrame();

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
            await nextFrame();
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            // Type 1,000 in search box.
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '1,000', fix);
            fix.detectChanges();
            await nextFrame();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(3);

            // Type non-numerical symbol in search box.
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'a', fix);
            fix.detectChanges();
            await nextFrame();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(inputNativeElement.value, 'incorrect rendered list items count').toBe('');
            expect(listItems.length, 'incorrect rendered list items count').toBe(9);
        });

        it('Should match numeric column values when searching without locale-specific formatting characters.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Downloads');
            fix.detectChanges();
            await nextFrame();
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            // Type 1000 (without thousands separator) in search box.
            // The value 1000 is displayed as "1,000" in the ESF list due to locale formatting.
            // Searching "1000" should still match the "1,000" entry.
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '1000', fix);
            fix.detectChanges();
            await nextFrame();

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            // Expect 3 items: Select All + Add to current filter + the matched "1,000" item
            expect(listItems.length, 'searching plain number should match locale-formatted label').toBe(3);
        });

        it('Should enable/disable the apply button correctly.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await nextFrame();
            // Verify there are filtered-in results and that apply button is enabled.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            let applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix) as HTMLElement;
            expect(listItems.length, 'ESF search result should NOT be empty').toBe(6);
            ControlsFunction.verifyButtonIsDisabled(applyButton, false);

            // Verify the apply button is disabled when all items are unchecked (when unchecking 'Select All').
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkbox[0].click(); // Select All
            fix.detectChanges();
            await nextFrame();
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
            await nextFrame();
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
            await nextFrame();
            fix.detectChanges();

            // Open excel style filtering component
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await nextFrame();
            fix.detectChanges();

            // Scroll the search list to the bottom.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            scrollbar.scrollTop = 3000;
            await frames(SCROLL_FRAMES);
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
    });
});

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
