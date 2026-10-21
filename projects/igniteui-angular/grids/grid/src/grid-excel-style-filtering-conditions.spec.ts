// Excel style filtering: generated conditions, custom date dialog, Select All and search input.
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GridSelectionMode, FilterMode } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from './grid.component';
import { UIInteractions, frames, nextFrame, wait } from '../../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import {
    SCROLL_FRAMES,
    verifyFilteringExpression,
    verifyExcelStyleFilterAvailableOptions,
    toggleExcelStyleFilteringItems
} from '../../../test-utils/grid-filtering-functions.spec';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeBg from '@angular/common/locales/bg';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';
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
import { IFilteringExpression, IFilteringExpressionsTree, ɵSize } from 'igniteui-angular/core';
import { IgxDateTimeEditorDirective } from 'igniteui-angular/directives';
import { IgxDatePickerComponent, IgxCalendarComponent } from 'igniteui-angular';
import { HelperTestFunctions } from '../../../test-utils/calendar-helper-utils';
import { describe, it, expect, beforeEach } from 'vitest';

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

        it('should focus the first row the viewport shows, not the over-scanned one', async () => {
            for (let index = 0; index < 30; index++) {
                grid.addRow({
                    Downloads: index, ID: index + 100, ProductName: 'New Product ' + index,
                    ReleaseDate: new Date(), Released: false, AnotherField: 'z'
                });
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            await fix.whenStable();

            const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);

            // Half a row down, so the first row on screen is cut by the viewport edge.
            const rowHeight = GridFunctions.getExcelStyleSearchComponentListItems(fix)[0]
                .getBoundingClientRect().height;
            scroller.scrollTop = rowHeight * 10 + rowHeight / 2;
            scroller.dispatchEvent(new Event('scroll'));
            fix.detectChanges();
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            const list = searchComponent.querySelector('igx-list') as HTMLElement;
            list.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(list);

            // The window reaches above the viewport, so this must be the first row on screen.
            const named = list.getAttribute('aria-activedescendant');
            const focused = searchComponent.querySelector(`#${named}`) as HTMLElement;
            expect(focused).toBeTruthy();

            const viewportTop = scroller.getBoundingClientRect().top;
            const focusedBox = focused.getBoundingClientRect();

            // Cut by the top edge rather than below it: a partial row still counts as shown.
            expect(focusedBox.bottom).toBeGreaterThan(viewportTop);
            expect(focusedBox.top).toBeLessThan(viewportTop);

            // Nothing above it reaches the viewport, so it is the first that does.
            const rows = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            const above = rows.slice(0, rows.indexOf(focused));
            expect(above.length).toBeGreaterThan(0);
            for (const row of above) {
                expect(row.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewportTop + 1);
            }
        });

        it('should never name a row that is not rendered', async () => {
            for (let index = 0; index < 30; index++) {
                grid.addRow({
                    Downloads: index, ID: index + 100, ProductName: 'New Product ' + index,
                    ReleaseDate: new Date(), Released: false, AnotherField: 'z'
                });
            }
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();
            await fix.whenStable();

            const search = fix.debugElement.query(By.css('igx-excel-style-search')).componentInstance;
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const list = searchComponent.querySelector('igx-list') as HTMLElement;
            list.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            const focusedFirst = list.getAttribute('aria-activedescendant');
            expect(focusedFirst).toBeTruthy();

            // Scrolling recycles the wrappers, so the element the listbox names is taken away
            // underneath it.
            const scroller = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            scroller.scrollTop = 3000;
            scroller.dispatchEvent(new Event('scroll'));
            fix.detectChanges();
            await search.virtualScroll.layoutComplete;
            fix.detectChanges();

            expect(searchComponent.querySelector(`#${focusedFirst}`)).toBeNull();
            expect(list.getAttribute('aria-activedescendant')).toBeFalsy();
        });

        it('should correctly display all items in search list after filtering it', async () => {
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
            await nextFrame();
            fix.detectChanges();

            // Scroll the search list to the middle.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const displayContainer = searchComponent.querySelector('.igx-virtual-scroll__content') as HTMLElement;
            const scrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
            scrollbar.scrollTop = displayContainer.getBoundingClientRect().height / 2;
            await frames(SCROLL_FRAMES);
            fix.detectChanges();
            await nextFrame();

            // Type string in search box
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'sale', fix);
            await nextFrame();
            fix.detectChanges();

            // Verify the display container is within the bounds of the list
            const displayContainerRect = displayContainer.getBoundingClientRect();
            const listNativeElement = searchComponent.querySelector('.igx-list');
            const listRect = listNativeElement.getBoundingClientRect();
            expect(displayContainerRect.top >= listRect.top, 'displayContainer starts above list').toBe(true);
            expect(displayContainerRect.bottom <= listRect.bottom, 'displayContainer ends below list').toBe(true);
        });

        it('Should not treat \'Select All\' as a search result.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');
            fix.detectChanges();
            await nextFrame();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, excelMenu);
            const input = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(6);

            UIInteractions.clickAndSendInputElementValue(input, 'a', fix);
            await nextFrame();
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(5);

            UIInteractions.clickAndSendInputElementValue(input, 'al', fix);
            await nextFrame();
            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBe(0);
        });

        it('Column formatter should skip the \'SelectAll\' list item', async () => {
            grid.columnList.get(4).formatter = (val: Date) => new Intl.DateTimeFormat('bg-BG').format(val);
            grid.cdr.detectChanges();

            // Open excel style filtering component
            try {
                await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');
            } catch (ex) {
                expect(ex).toBeNull();
            }

            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix);
            expect(listItems[0].innerText).toBe('Select All');
        });

        it('should keep newly added filter expression in view', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Click 'Add Filter' button.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            await fix.whenStable();

            // Verify last expression is currently in view inside the expressions container.
            const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
            const expressionsContainer = customFilterMenu.querySelector('.igx-excel-filter__secondary-main');
            const expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
            const lastExpression = expressions[expressions.length - 1];
            const lastExpressionRect = lastExpression.getBoundingClientRect();
            const expressionsContainerRect = expressionsContainer.getBoundingClientRect();
            expect(lastExpressionRect.top >= expressionsContainerRect.top, 'lastExpression starts above expressionsContainer').toBe(true);
            expect(lastExpressionRect.bottom <= expressionsContainerRect.bottom, 'lastExpression ends below expressionsContainer').toBe(true);

            // Verify addFilter button is currently in view beneath the last expression.
            const addFilterButton = GridFunctions.getAddFilterExcelStyleCustomFiltering(fix);
            const addFilterButtonRect = addFilterButton.getBoundingClientRect();
            expect(addFilterButtonRect.top >= lastExpressionRect.bottom, 'addFilterButton overlaps lastExpression').toBe(true);
            expect(addFilterButtonRect.bottom <= expressionsContainerRect.bottom, 'addFilterButton ends below expressionsContainer').toBe(true);
        });

        it('Should generate "equals" conditions when selecting two values.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(2);
            const operands = (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'equals', 'Ignite UI for Angular');
            verifyFilteringExpression(operands[1], 'ProductName', 'equals', 'Ignite UI for JavaScript');
        });

        it('Should generate "in" condition when selecting more than two values.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            checkbox[4].click(); // NetAdvantage
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(3);
            const operands = (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(1);
            verifyFilteringExpression(operands[0], 'ProductName', 'in', new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript', 'NetAdvantage']));
        });

        it('Should not throw error when selecting more than two values and column dataType is date.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ReleaseDate');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[2].click();
            checkbox[3].click();
            checkbox[4].click();
            checkbox[6].click();
            await fix.whenStable();
            fix.detectChanges();

            expect(() => {
                GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            }).not.toThrowError();
        });

        it('Should generate "in" and "empty" conditions when selecting more than two values including (Blanks).', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

            checkbox[0].click(); // Select All
            await fix.whenStable();
            fix.detectChanges();

            checkbox[1].click(); // (Blanks)
            checkbox[2].click(); // Ignite UI for Angular
            checkbox[3].click(); // Ignite UI for JavaScript
            await fix.whenStable();
            fix.detectChanges();

            GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
            await fix.whenStable();
            fix.detectChanges();

            expect(grid.rowList.length).toBe(6);
            const operands = (grid.filteringExpressionsTree.filteringOperands[0] as IFilteringExpressionsTree)
                .filteringOperands as IFilteringExpression[];
            expect(operands.length).toBe(2);
            verifyFilteringExpression(operands[0], 'ProductName', 'in', new Set(['Ignite UI for Angular', 'Ignite UI for JavaScript']));
            verifyFilteringExpression(operands[1], 'ProductName', 'empty', null);
        });

        it('should not display search scrollbar when not needed for the current size', async () => {
            grid.columnSelection = GridSelectionMode.multiple;
            fix.detectChanges();

            grid.getCellByColumn(3, 'ProductName').update('Test');
            fix.detectChanges();

            // Verify scrollbar is visible for 'comfortable'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await nextFrame();
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix), 'excel search scrollbar should be visible').toBe(true);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Medium);
            await nextFrame();
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'cosy'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await nextFrame();
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix), 'excel search scrollbar should NOT be visible').toBe(false);
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            fix.detectChanges();

            setElementSize(grid.nativeElement, ɵSize.Small);
            await nextFrame();
            fix.detectChanges();

            // Verify scrollbar is NOT visible for 'compact'.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await nextFrame();
            fix.detectChanges();

            expect(isExcelSearchScrollBarVisible(fix), 'excel search scrollbar should NOT be visible').toBe(false);
        });

        it('Should cascade filter the available filter options.', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix,
                ['Select All', '(Blanks)', '0', '20', '100', '127', '254', '702', '1,000'],
                [true, true, true, true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', 'Some other item with Script'], [true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'False', 'True'], [true, true, true, true]);

            await toggleExcelStyleFilteringItems(fix, true, 3);

            expect(grid.rowList.length).toBe(5);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'False', 'True'], [null, true, true, false]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '100', '254', '702', '1,000'], [true, true, true, true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'], [true, true, true, true, true]);

            await toggleExcelStyleFilteringItems(fix, false, 0);
            await toggleExcelStyleFilteringItems(fix, true, 2, 3);

            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'False'], [true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript', 'Some other item with Script'], [null, false, true, true, false]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '254'], [true, true, true]);
        });

        it('Should correctly modify existing filters.', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', 'Some other item with Script'], [true, true, true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1, 5);
            expect(grid.rowList.length).toBe(3);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 2);
            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'], [true, true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [null, true, false, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1, 2, 3);
            expect(grid.rowList.length).toBe(1);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [null, false, true, false]);
        });

        it('Should correctly modify the first one of the existing filters.', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '(Blanks)', 'Ignite UI for Angular', 'Ignite UI for JavaScript',
                'NetAdvantage', 'Some other item with Script'], [true, true, true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1, 5);
            expect(grid.rowList.length).toBe(3);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '20', '127', '254'], [true, true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 2);
            expect(grid.rowList.length).toBe(2);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'], [true, true, true]);
            await toggleExcelStyleFilteringItems(fix, true, 1);
            expect(grid.rowList.length).toBe(1);

            GridFunctions.clickExcelFilterIcon(fix, 'Downloads');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', '254'], [true, true]);

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'Ignite UI for Angular', 'Ignite UI for JavaScript'], [null, false, true]);
        });

        it('Should display the ESF based on the filterIcon within the grid', async () => {
            // Test prerequisites
            grid.width = '800px';
            for (const column of grid.columnList) {
                column.width = '300px';
            }
            await nextFrame();
            fix.detectChanges();

            // Scroll a bit to the right, so the ProductName column is not fully visible.
            GridFunctions.scrollLeft(grid, 500);
            await frames(SCROLL_FRAMES);
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            fix.detectChanges();

            // Verify that the left, top and right borders of the ESF are within the grid.
            const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
            const gridRect = gridNativeElement.getBoundingClientRect();
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const excelMenuRect = excelMenu.getBoundingClientRect();
            expect(excelMenuRect.left >= gridRect.left, 'ESF spans outside the grid on the left').toBe(true);
            expect(excelMenuRect.top >= gridRect.top, 'ESF spans outside the grid on the top').toBe(true);
            expect(excelMenuRect.right <= gridRect.right, 'ESF spans outside the grid on the right').toBe(true);
        });

        it('Should add/remove expressions in custom filter dialog through UI correctly.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ProductName');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Verify expressions count.
            let expressions = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
            expect(expressions.length).toBe(2);

            // Add two new expressions.
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickAddFilterExcelStyleCustomFiltering(fix);
            await fix.whenStable();
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
        });

        it('Should keep selected operator of custom expression the same when clicking it.', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            // Verify 'And' button is selected on first expression.
            let andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            ControlsFunction.verifyButtonIsSelected(andButton);

            // Click the 'And' button.
            andButton.click();
            await fix.whenStable();
            fix.detectChanges();

            // Verify that selected button remains the same.
            andButton = GridFunctions.getExcelCustomFilteringExpressionAndButton(fix);
            ControlsFunction.verifyButtonIsSelected(andButton);

            const orButton = GridFunctions.getExcelCustomFilteringExpressionOrButton(fix);
            ControlsFunction.verifyButtonIsSelected(orButton, false);
        });

        it('Should select the button operator in custom expression when pressing \'Enter\' on it.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await nextFrame();

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

        it('Should open conditions dropdown of custom expression with \'Alt + Arrow Down\'.', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[0];
            const conditionsInput = GridFunctions.getExcelFilteringDDInput(fix);

            // Dropdown should be hidden.
            let operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).not.toBeNull();

            // Press 'Alt + Arrow Down' to open operators dropdown.
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', conditionsInput, true, true);
            await fix.whenStable();
            fix.detectChanges();

            // Dropdown should be visible.
            operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).toBeNull();

            // Click-off to close dropdown.
            expr.click();
            await fix.whenStable();
            fix.detectChanges();

            // Dropdown should be hidden.
            operatorsDropdownToggle = expr.querySelector('.igx-toggle--hidden');
            expect(operatorsDropdownToggle).not.toBeNull();
        });

        it('Should open calendar when clicking date-picker of custom expression.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

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
            await fix.whenStable();
            fix.detectChanges();

            // Verify calendar is not opened.
            calendar = fix.debugElement.query(By.directive(IgxCalendarComponent));
            expect(calendar).toBeNull();
        });

        it('Should filter grid through custom date filter dialog.', async () => {
            const column = grid.getColumnByName('ReleaseDate');
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            expect(grid.nativeElement.querySelector('.igx-excel-filter__filter-number').textContent).not.toContain('(');
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should properly scroll to prev/next period in custom date filter dialog.', async () => {
            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();

            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Reopen calender and click previous month button.
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            const prevMonthButton = fix.debugElement.queryAll(By.css(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS))[0].nativeElement;
            prevMonthButton.focus();
            UIInteractions.simulateMouseEvent("mousedown", prevMonthButton, 0, 0);
            await fix.whenStable();
            UIInteractions.simulateMouseEvent("mouseup", prevMonthButton, 0, 0);
            fix.detectChanges();

            // Verify the calendar is scrolled to previous month.
            const headerLabel = document.querySelector('igx-calendar').querySelector('.igx-calendar-picker__date') as HTMLElement;
            const today = new Date();
            const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const monthName = prevMonth.toLocaleString('default', { month: 'short' });
            expect(headerLabel.innerText.trim()).toMatch(`${monthName}`);
        });

        it('Should take pipeArgs weekStart property as calendar\'s default.', async () => {
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
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Get Calendar component.
            const calendar = document.querySelector('igx-calendar');

            const daysOfWeek = calendar.querySelector('.igx-days-row');
            const weekStart = daysOfWeek.firstElementChild as HTMLSpanElement;

            expect(weekStart.innerText).toMatch('Fri');
        });

        it('Should filter grid with ISO 8601 dates through custom date filter dialog', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();
            const column = grid.getColumnByName('ReleaseDate');

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should filter grid with milliseconds dates through custom date filter dialog', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();
            const column = grid.getColumnByName('ReleaseDate');

            // Open excel style custom filtering dialog.
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('DateTime: Should use editorOptions.dateTimeFormat as inputFormat to the filter editor in the custom filtering dialog', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });
            const column = grid.getColumnByName('ReleaseDateTime');
            column.editorOptions = {
                dateTimeFormat: 'dd-MM-yyyy HH:mm aaaaa'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditor = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditor.inputFormat).toMatch(column.editorOptions.dateTimeFormat);
            expect(dateTimeEditor.displayFormat).toMatch(column.pipeArgs.format);
        });

        it('DateTime: Should use pipeArgs.format as inputFormat to the filter editor in the custom filtering dialog if editorOptions.dateTimeFormat not set', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });
            const column = grid.getColumnByName('ReleaseDateTime');
            column.pipeArgs = {
                format: 'dd-MM-yyyy'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat.normalize('NFKC')).toMatch('dd-MM-yyyy');
            expect(dateTimeEditorDirective.displayFormat.normalize('NFKC')).toMatch('dd-MM-yyyy');
        });

        it('DateTime: custom filtering dialog input locale should be set as the grid locale', async () => {
            registerLocaleData(localeBg, 'bg');
            grid.locale = 'bg';
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDateTime = rec.ReleaseDateTime ? rec.ReleaseDateTime.toISOString() : null;
                return newRec;
            });

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDateTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.locale).toMatch(grid.locale);
        });

        it('Time: Should use editorOptions.dateTimeFormat as inputFormat to the filter editor in the custom filtering dialog', async () => {
            const column = grid.getColumnByName('ReleaseTime');
            column.editorOptions = {
                dateTimeFormat: 'HH:mm'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat).toMatch(column.editorOptions.dateTimeFormat);
            expect(dateTimeEditorDirective.displayFormat).toMatch(column.pipeArgs.format);
        });

        it('Time: Should use pipeArgs.format as inputFormat to the filter editor in the custom filtering dialog if editorOptions.dateTimeFormat not set', async () => {
            const column = grid.getColumnByName('ReleaseTime');
            column.pipeArgs = {
                format: 'HH:mm'
            };
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseTime');
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const dateTimeEditorDirective = fix.debugElement.query(By.directive(IgxDateTimeEditorDirective))
                .injector.get(IgxDateTimeEditorDirective);
            expect(dateTimeEditorDirective.inputFormat).toMatch(column.pipeArgs.format);
            expect(dateTimeEditorDirective.displayFormat).toMatch(column.pipeArgs.format);
        });
        it('Should filter grid through custom date filter dialog when using pipeArgs for the column', async () => {
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
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();
            await fix.whenStable();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const pipe = new DatePipe(grid.locale);
            const cellText = pipe.transform(filteredDate, column.pipeArgs.format, column.pipeArgs.timezone);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should filter grid through custom date filter dialog when using pipeArgs and formatter for the column', async () => {
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
            await fix.whenStable();
            fix.detectChanges();
            GridFunctions.clickExcelFilterCascadeButton(fix);
            fix.detectChanges();
            GridFunctions.clickOperatorFromCascadeMenu(fix, 0);
            await fix.whenStable();

            const expr = GridFunctions.getExcelCustomFilteringDateExpressions(fix)[0];
            const datePicker = expr.querySelector('igx-date-picker');
            const input = datePicker.querySelector('input');
            UIInteractions.simulateClickEvent(input);
            fix.detectChanges();
            await fix.whenStable(); // calendar animationDone timeout

            // Click today item.
            const calendar = document.querySelector('igx-calendar');
            const todayItem = calendar.querySelector('.igx-day-item--current');
            UIInteractions.simulateClickAndSelectEvent(todayItem.firstChild);
            await fix.whenStable();
            fix.detectChanges();

            // Verify the results are with 'today' date.
            const filteredDate = SampleTestData.today;
            const datePickerDebugEl = fix.debugElement.query(By.directive(IgxDatePickerComponent));
            expect(datePickerDebugEl.componentInstance.value).toEqual(filteredDate);

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleCustomFiltering(fix);

            const cellText = column.formatter(filteredDate, null);
            const cell = GridFunctions.getColumnCells(fix, 'ReleaseDate')[0].nativeElement;
            expect(cell.innerText).toMatch(cellText);
            expect(grid.filteredData.length).toEqual(1);
        });

        it('Should correctly update \'SelectAll\' based on checkboxes.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const visibleListItems = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const thirdItemCbInput = visibleListItems[2];

            // Verify 'Select All' checkbox is not indeterminate.
            const selectAllCheckbox = visibleListItems[0];
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement);

            // Uncheck third list item.
            UIInteractions.simulateClickEvent(thirdItemCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify 'Select All' checkbox is indeterminate.
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement, true, true);

            // Check third list item again.
            UIInteractions.simulateClickEvent(thirdItemCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify 'Select All' checkbox is not indeterminate.
            ControlsFunction.verifyCheckboxState(selectAllCheckbox.parentElement);
        });

        it('Should correctly update all items based on \'SelectAll\' checkbox.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'ProductName');

            const visibleListItems = GridFunctions.getExcelStyleFilteringCheckboxes(fix);
            const dataListItems = visibleListItems.slice(1, visibleListItems.length);

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement);
            }

            // Click 'Select All' checkbox.
            let selectAllCbInput = visibleListItems[0];
            UIInteractions.simulateClickEvent(selectAllCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify all visible data list items are unchecked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement, false);
            }

            // Click 'Select All' checkbox.
            selectAllCbInput = visibleListItems[0];
            UIInteractions.simulateClickEvent(selectAllCbInput);
            await fix.whenStable();
            fix.detectChanges();

            // Verify all visible data list items are checked.
            for (const dataListItem of dataListItems) {
                ControlsFunction.verifyCheckboxState(dataListItem.parentElement);
            }
        });

        it('Should correctly update all \'SelectAll\' checkbox when not a single item is checked.', async () => {
            GridFunctions.clickExcelFilterIconFromCodeAsync(fix, grid, 'Released');
            fix.detectChanges();
            await nextFrame();

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

        it('Should open custom filter dropdown when pressing \'Enter\' on custom filter cascade button.', async () => {
            grid.width = '700px';
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await fix.whenStable();
            fix.detectChanges();

            const cascadeButton = GridFunctions.getExcelFilterCascadeButton(fix);

            // Verify that custom filter dropdown (the submenu) is not visible.
            let subMenu = fix.nativeElement.querySelector('.igx-drop-down.igx-toggle--hidden');
            expect(subMenu).not.toBeNull();

            cascadeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();


            // Verify that custom filter dropdown (the submenu) is visible.
            subMenu = fix.nativeElement.querySelector('.igx-drop-down.igx-toggle--hidden');
            expect(subMenu).toBeNull();
        });

        it('Should close ESF when pressing \'Escape\'.', async () => {
            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            // Verify ESF is not visible.
            expect(excelMenu).toBeNull();

            GridFunctions.clickExcelFilterIcon(fix, 'Released');
            await fix.whenStable();
            fix.detectChanges();

            // Verify ESF is visible.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();

            excelMenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await fix.whenStable();
            fix.detectChanges();

            // Verify ESF is not visible.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();
        });

        it('Should open/close ESF menu for respective column when pressing \'ctrl + shift + l\' on its filterCell chip.', async () => {
            let excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            // Verify ESF is not visible.
            expect(excelMenu).toBeNull();

            const downloadsColumn = GridFunctions.getColumnHeader('Downloads', fix);
            UIInteractions.simulateClickAndSelectEvent(downloadsColumn);
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('l', downloadsColumn.nativeElement, true, false, true, true);
            await fix.whenStable();
            fix.detectChanges();

            // Verify ESF menu is opened for the 'Downloads' column.
            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).not.toBeNull();

            // Press the combination again.
            UIInteractions.triggerKeyDownEvtUponElem('l', excelMenu, true, false, true, true);
            await fix.whenStable();
            fix.detectChanges();

            excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            expect(excelMenu).toBeNull();
        });

        it('Should filter ISO 8601 dates for date column ignoring the time portion - issue #14643', async () => {
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
            await fix.whenStable();
            fix.detectChanges();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
            const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu)[1];

            checkbox.click();
            await fix.whenStable();
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
            expect(rows.length, 'incorrect number of rows').toBe(6);

            //Check if checkboxes have correct state on ESF menu reopening
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix));
            expect(checkboxes[0].indeterminate).toBe(true);
            expect(checkboxes[1].checked).toBe(false);
            const listItemsCheckboxes = checkboxes.slice(2, checkboxes.length - 1);
            for (const checkboxItem of listItemsCheckboxes) {
                ControlsFunction.verifyCheckboxState(checkboxItem.parentElement);
            }
        });

        it('Should filter date by input string', async () => {
            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
        });

        it('Should filter ISO 8601 date by input string', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.toISOString() : null;
                return newRec;
            });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
        });

        it('Should filter milliseconds date by input string', async () => {
            fix.componentInstance.data = SampleTestData.excelFilteringData().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.ReleaseDate = rec.ReleaseDate ? rec.ReleaseDate.getTime() : null;
                return newRec;
            });
            fix.detectChanges();

            GridFunctions.clickExcelFilterIcon(fix, 'ReleaseDate');
            await fix.whenStable();
            fix.detectChanges();

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            const todayDateFull = SampleTestData.today;
            const todayDate = todayDateFull.getDate().toString();
            const dayOfWeek = todayDateFull.toString().substring(0, 3);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, todayDate, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length).toBeGreaterThan(2);
            for (let i = 2; i < listItems.length; i++) {
                expect(listItems[i].textContent.toString().indexOf(todayDate) > -1).toBeTruthy();
            }

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, dayOfWeek, fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(0);
        });

        it('Should ignore duplicate records when column\'s filteringIgnoreCase is true', async () => {
            const column = grid.getColumnByName('AnotherField');
            expect(column.filteringIgnoreCase).toBe(true);

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await fix.whenStable();
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'a', 'Custom'], [true, true, true]);
        });

        it('Should not ignore duplicate records when column\'s filteringIgnoreCase is false', async () => {
            const column = grid.getColumnByName('AnotherField');
            column.filteringIgnoreCase = false;
            expect(column.filteringIgnoreCase).toBe(false);

            GridFunctions.clickExcelFilterIcon(fix, 'AnotherField');
            await fix.whenStable();
            fix.detectChanges();

            verifyExcelStyleFilterAvailableOptions(fix, ['Select All', 'a', 'Custom', 'custoM', 'custom'], [true, true, true, true, true]);
        });

        it('Should display "Add to current filter selection" button on typing in input', async () => {
            // Open excel style filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');
            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            await fix.whenStable();
            fix.detectChanges();

            // Verify that the second item is 'Add to current filter selection'.
            const listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
            expect(listItems.length, 'incorrect rendered list items count').toBe(6);
            expect(listItems[1].innerText).toBe('Add current selection to filter');
        });

        it('Should filter grid the same way as in Excel', async () => {
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            let searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            let inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '2', fix);
            await fix.whenStable();
            fix.detectChanges();

            let listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Get the results and verify that they match the list items.
            let gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(4);
            expect(gridCellValues).toEqual(listItems);

            // Open excel style custom filtering dialog again.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            // Type string in search box.
            searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '5', fix);
            await fix.whenStable();
            fix.detectChanges();

            listItems = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent)
                .splice(2)
                .map(c => c.innerText)
                .sort();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Get the results and verify that they match the list items.
            gridCellValues = GridFunctions.getColumnCells(fix, 'Downloads')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(1);
            expect(gridCellValues).toEqual(listItems);
        });

        it('Should filter grid correctly with case insensitive duplicates', async () => {
            grid.data = SampleTestData.excelFilteringDataDuplicateValues();
            fix.detectChanges();
            // Open excel style custom filtering dialog.
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'AnotherField');

            // Type string in search box.
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'cust', fix);
            await fix.whenStable();
            fix.detectChanges();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fix);
            await fix.whenStable();
            fix.detectChanges();

            // Get the results and verify their count.
            const gridCellValues = GridFunctions.getColumnCells(fix, 'AnotherField')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toEqual(5);
        });

        it('Should disable the apply button when there are no results.', async () => {
            await GridFunctions.clickExcelFilterIconFromCode(fix, grid, 'Downloads');

            const applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix) as HTMLElement;
            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fix, searchComponent);

            UIInteractions.clickAndSendInputElementValue(inputNativeElement, '3', fix);
            await fix.whenStable();
            fix.detectChanges();

            ControlsFunction.verifyButtonIsDisabled(applyButton);
        });
    });
});

const isExcelSearchScrollBarVisible = (fix) => {
    const searchScrollbar = GridFunctions.getExcelStyleSearchComponentScrollbar(fix);
    return searchScrollbar.offsetHeight < searchScrollbar.children[0].offsetHeight;
};
