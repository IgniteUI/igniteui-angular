// Excel style filtering: search list keyboard, templates, load on demand, external ESF; custom strategy.
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { INPUT_DEBOUNCE_TIME, GridSelectionMode, FilterMode } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, nextFrame, wait } from '../../../test-utils/ui-interactions.spec';
import { GridFunctions, GridSelectionFunctions } from '../../../test-utils/grid-functions.spec';
import { verifyExcelStyleFilterAvailableOptions, toggleExcelStyleFilteringItems } from '../../../test-utils/grid-filtering-functions.spec';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent,
    IgxGridFilteringMCHComponent,
    IgxGridFilteringESFEmptyTemplatesComponent,
    IgxGridFilteringESFTemplatesComponent,
    IgxGridFilteringESFSizingComponent,
    IgxGridFilteringESFLoadOnDemandComponent,
    IgxGridFilteringESFRemoteChunkComponent,
    CustomFilteringStrategyComponent,
    IgxGridExternalESFComponent,
    IgxGridExternalESFTemplateComponent,
    LoadOnDemandFilterStrategy,
    IgxGridConditionalFilteringComponent
} from '../../../test-utils/grid-samples.spec';
import { ControlsFunction } from '../../../test-utils/controls-functions.spec';
import { setElementSize } from '../../../test-utils/helper-utils.spec';
import {
    FilteringStrategy,
    FormattedValuesFilteringStrategy,
    IFilteringExpression,
    IFilteringExpressionsTree,
    IgxOverlayService,
    IgxStringFilteringOperand,
    ɵSize,
    SortingDirection
} from 'igniteui-angular/core';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('IgxGrid - Filtering actions - Excel style filtering #grid', () => {

    registerLocaleData(localeFr);
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
            await nextFrame();
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'script', fix);
            await nextFrame();
            fix.detectChanges();

            let items = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(items.length).toBe(0);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'web', fix);
            await nextFrame();
            fix.detectChanges();
            items = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(items.length).toBe(3);
            verifyExcelStyleFilterAvailableOptions(fix, ['Select all search results', 'Add current selection to filter', 'Web'], [true, false, true]);

            inputNativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await nextFrame();
            fix.detectChanges();
            const cellValues = GridFunctions.getColumnCells(fix, 'ProductName').map(c => c.nativeElement.innerText).sort();
            expect(cellValues).toEqual(['Web', 'Web']);
        });

        it('Should display the default True and False resource strings in the search list for boolean column.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Released');
            fix.detectChanges();
            await nextFrame();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);

            expect(listItems.length, 'incorrect rendered list items count').toBe(4);
            expect(listItems[2].innerText, 'incorrect list item label').toBe('False');
            expect(listItems[3].innerText, 'incorrect list item label').toBe('True');

            const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            checkboxes[3].click();
            fix.detectChanges();
            await nextFrame();

            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();
            await nextFrame();

            expect(grid.filteredData.length).toEqual(5);
        });

        it('Should display the custom resource strings when specified in the search list for boolean column.', async () => {
            grid.resourceStrings.igx_grid_filter_false = 'No';
            grid.resourceStrings.igx_grid_filter_true = 'Yes';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Released');
            fix.detectChanges();
            await nextFrame();

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
            await nextFrame();
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
            await nextFrame();
            fix.detectChanges();

            const list = GridFunctions.getExcelStyleSearchComponent(fix).querySelector('igx-list') as HTMLElement;
            const loadingIndicator = GridFunctions.getExcelFilteringLoadingIndicator(fix) as HTMLElement;
            expect(loadingIndicator, 'esf loading indicator is not visible').not.toBeNull();

            const listBox = list.getBoundingClientRect();
            const loadingBox = loadingIndicator.getBoundingClientRect();
            expect(listBox.height).toBeGreaterThan(loadingBox.height);
            expect(Math.abs((loadingBox.top + loadingBox.bottom) / 2 - (listBox.top + listBox.bottom) / 2))
                .toBeLessThanOrEqual(1);

            await waitForESFValuesToLoad(fix);
        });

        it('Should center the no matches message in the value list', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await waitForESFValuesToLoad(fix);

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
            await nextFrame();
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
            await nextFrame();
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
            await nextFrame();
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
            await nextFrame();
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

    describe('Excel Style Filtering sizing in an external outlet', () => {
        [
            { size: ɵSize.Small, spacing: '4px', minHeight: '330px', maxHeight: '405px' },
            { size: ɵSize.Medium, spacing: '8px', minHeight: '465px', maxHeight: '565px' },
            { size: ɵSize.Large, spacing: '16px', minHeight: '645px', maxHeight: '775px' }
        ].forEach(({ size, spacing, minHeight, maxHeight }) => {
            it(`should preserve spacing and height constraints at size ${size}`, async () => {
                const fix = TestBed.createComponent(IgxGridFilteringESFSizingComponent);
                setElementSize(fix.nativeElement, size);
                fix.detectChanges();
                const grid = fix.componentInstance.grid;
                await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

                const menu = GridFunctions.getExcelStyleFilteringComponent(fix) as HTMLElement;
                expect(grid.nativeElement.contains(menu)).toBe(false);
                expect(grid.outlet.nativeElement.contains(menu)).toBe(true);

                // Setting either bound removes the default sizing class. Clearing both restores it.
                [
                    { min: undefined, max: undefined },
                    { min: '350px', max: undefined },
                    { min: undefined, max: '500px' },
                    { min: '350px', max: '500px' },
                    { min: undefined, max: undefined }
                ].forEach(({ min, max }) => {
                    fix.componentInstance.minHeight.set(min);
                    fix.componentInstance.maxHeight.set(max);
                    fix.detectChanges();

                    verifyExcelStyleFilteringSpacing(menu, spacing);
                    const defaults = !min && !max;
                    expect(getComputedStyle(menu).minHeight).toBe(min ?? (defaults ? minHeight : '0px'));
                    expect(getComputedStyle(menu).maxHeight).toBe(max ?? (defaults ? maxHeight : 'none'));
                });
            });
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

        [
            { min: undefined, max: undefined },
            { min: '350px', max: undefined },
            { min: undefined, max: '500px' },
            { min: '350px', max: '500px' }
        ].forEach(({ min, max }) => {
            it(`should update standalone menu spacing with minHeight=${min} and maxHeight=${max}`, async () => {
                const esf = fix.componentInstance.esf;
                esf.minHeight = min;
                esf.maxHeight = max;
                esf.cdr.detectChanges();
                const menu = GridFunctions.getExcelStyleFilteringComponent(fix) as HTMLElement;
                expect(grid.nativeElement.contains(menu)).toBe(false);

                // Change density on the same rendered menu, without a sizable grid ancestor.
                for (const { size, spacing } of [
                    { size: ɵSize.Small, spacing: '4px' },
                    { size: ɵSize.Medium, spacing: '8px' },
                    { size: ɵSize.Large, spacing: '16px' }
                ]) {
                    setElementSize(fix.nativeElement, size);
                    await nextFrame();
                    fix.detectChanges();
                    verifyExcelStyleFilteringSpacing(menu, spacing);
                }
            });
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
            await nextFrame();
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
            await nextFrame();

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

const verifyExcelStyleFilteringSpacing = (menu: HTMLElement, expectedSpacing: string) => {
    const header = menu.querySelector('.igx-excel-filter__menu-header');
    const main = menu.querySelector('.igx-excel-filter__menu-main');
    expect(getComputedStyle(header).padding).toBe(expectedSpacing);
    expect(getComputedStyle(main).padding).toBe(expectedSpacing);
    expect(getComputedStyle(main).gap).toBe(expectedSpacing);
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
