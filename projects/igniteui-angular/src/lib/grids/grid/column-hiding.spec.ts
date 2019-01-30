
import { DebugElement } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from '../column-hiding-item.directive';
import { IgxColumnHidingComponent, IgxColumnHidingModule } from '../column-hiding.component';
import { IgxGridModule } from './index';
import { IgxGridComponent } from './grid.component';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { ColumnDisplayOrder } from '../column-chooser-base';
import { ColumnHidingTestComponent, ColumnGroupsHidingTestComponent } from '../../test-utils/grid-base-components.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { HelperUtils } from '../../test-utils/helper-utils.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('Column Hiding UI', () => {
    configureTestSuite();
    let fix;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnHidingComponent;
    let columnChooserElement: DebugElement;

    const verifyCheckbox = HelperUtils.verifyCheckbox;
    const getCheckboxInput = HelperUtils.getCheckboxInput;
    const getCheckboxInputs = HelperUtils.getCheckboxInputs;
    const getCheckboxElement = HelperUtils.getCheckboxElement;
    const verifyColumnIsHidden = GridFunctions.verifyColumnIsHidden;
    const getColumnHidingButton = GridFunctions.getColumnHidingButton;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnHidingTestComponent,
                ColumnGroupsHidingTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule,
                IgxColumnHidingModule,
                IgxButtonModule
            ]
        })
            .compileComponents();
    }));

    beforeAll(() => {
        UIInteractions.clearOverlay();
    });

    afterAll(() => {
        UIInteractions.clearOverlay();
    });

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(ColumnHidingTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        });
        afterEach(() => {
            columnChooser.onColumnVisibilityChanged.unsubscribe();
        });

        it('title is initially empty.', () => {
            const title = columnChooserElement.query(By.css('h4'));
            expect(title).toBe(null);
        });

        it('title can be successfully changed.', () => {
            columnChooser.title = 'Show/Hide Columns';
            fix.detectChanges();

            const titleElement = (columnChooserElement.query(By.css('h4')).nativeElement as HTMLHeadingElement);
            expect(columnChooser.title).toBe('Show/Hide Columns');
            expect(titleElement.textContent).toBe('Show/Hide Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');

            columnChooser.title = null;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');
        });

        it('lists all 4 hidable grid columns.', () => {
            const columnItems = columnChooser.columnItems;
            expect(columnItems.length).toBe(5);

            expect(getColumnHidingItems().length).toBe(4);
        });

        it('orders columns according to "columnDisplayOrder".', () => {
            expect(columnChooser.columnDisplayOrder).toBe(ColumnDisplayOrder.DisplayOrder);

            let columnItems = columnChooser.columnItems.map((item) => item.name);
            expect(columnItems.toString()).toBe('ID,ProductName,Downloads,Released,ReleaseDate');

            columnChooser.columnDisplayOrder = ColumnDisplayOrder.Alphabetical;
            fix.detectChanges();

            expect(columnChooser.columnDisplayOrder).toBe(ColumnDisplayOrder.Alphabetical);
            columnItems = columnChooser.columnItems.map((item) => item.name);
            expect(columnItems.toString()).toBe('Downloads,ID,ProductName,Released,ReleaseDate');

            columnChooser.columnDisplayOrder = ColumnDisplayOrder.DisplayOrder;
            fix.detectChanges();
            columnItems = columnChooser.columnItems.map((item) => item.name);
            expect(columnItems.toString()).toBe('ID,ProductName,Downloads,Released,ReleaseDate');
        });

        it('does not show "ProductName" column.', () => {
            const columnName = 'ProductName';
            const colProductName = getColumnChooserItem(columnName);
            expect(colProductName).toBeUndefined();
        });

        it('"hiddenColumnsCount" reflects properly the number of hidden columns.', fakeAsync(() => {
            expect(columnChooser.hiddenColumnsCount).toBe(1);

            grid.columns[2].hidden = false;
            tick();
            expect(columnChooser.hiddenColumnsCount).toBe(0);

            grid.columns[0].hidden = true;
            tick();
            expect(columnChooser.hiddenColumnsCount).toBe(1);

            getCheckboxInput('Released', columnChooserElement, fix).click();
            expect(columnChooser.hiddenColumnsCount).toBe(2);
        }));

        it('reflects changes in columns disabled properly.', () => {
            grid.columns[0].disableHiding = true;
            fix.detectChanges();

            let colProductName = getColumnChooserItem('ID');
            expect(colProductName).toBeUndefined();

            grid.columns[0].disableHiding = false;
            fix.detectChanges();

            colProductName = getColumnChooserItem('ID');
            expect(colProductName).toBeDefined();
            expect(colProductName.disabled).toBe(false);
            verifyCheckbox('ID', false, false, columnChooserElement, fix);
        });

        it('allows hiding a column whose disabled=undefined.', () => {
            grid.columns[3].disableHiding = undefined;
            fix.detectChanges();

            verifyCheckbox('Released', false, false, columnChooserElement, fix);
        });

        it('does not show any items when all columns disabled is true.', () => {
            grid.columns.forEach((col) => col.disableHiding = true);
            fix.detectChanges();

            const checkboxes = getCheckboxInputs(columnChooserElement);

            expect(checkboxes.length).toBe(0);

            expect(getButtonDisabledState('Show All')).toBe(true);
            expect(getButtonDisabledState('Hide All')).toBe(true);
        });

        it('- toggling column checkbox checked state successfully changes the grid column visibility.', fakeAsync(() => {
            const checkbox = getCheckboxInput('ReleaseDate', columnChooserElement, fix);
            verifyCheckbox('ReleaseDate', false, false, columnChooserElement, fix);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsHidden(column, false, 4);

            checkbox.click();
            tick();
            expect(checkbox.checked).toBe(true);
            verifyColumnIsHidden(column, true, 3);

            checkbox.click();
            tick();
            expect(checkbox.checked).toBe(false);
            verifyColumnIsHidden(column, false, 4);
        }));

        it('reflects properly grid column hidden value changes.', fakeAsync(() => {
            const name = 'ReleaseDate';
            verifyCheckbox(name, false, false, columnChooserElement, fix);
            const column = grid.getColumnByName(name);

            column.hidden = true;
            tick();
            fix.detectChanges();

            verifyCheckbox(name, true, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, true, 3);

            column.hidden = false;
            tick();
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, false, 4);

            column.hidden = undefined;
            tick();
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, undefined, 4);

            column.hidden = true;
            tick();
            fix.detectChanges();
            verifyColumnIsHidden(column, true, 3);

            column.hidden = null;
            tick();
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsHidden(column, null, 4);
        }));

        it('enables the column checkbox and "Show All" button after changing disabled of a hidden column.', fakeAsync(() => {
            grid.columns.forEach((col) => col.disableHiding = true);
            const name = 'Downloads';
            grid.getColumnByName(name).disableHiding = false;
            fix.detectChanges();

            let checkbox = getCheckboxInput(name, columnChooserElement, fix);
            verifyCheckbox(name, true, false, columnChooserElement, fix);

            expect(getButtonDisabledState('Show All')).toBe(false);
            expect(getButtonDisabledState('Hide All')).toBe(true);

            checkbox.click();
            tick();
            fix.detectChanges();

            expect(checkbox.checked).toBe(false, 'Checkbox is not unchecked!');

            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All button is not disabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All button is not enabled!');

            checkbox = getCheckboxInput(name, columnChooserElement, fix);

            checkbox.click();
            tick();
            fix.detectChanges();

            expect(checkbox.checked).toBe(true, 'Checkbox is not checked!');

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All button is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(true, 'Hide All button is not disabled!');
        }));

        it('enables the column checkbox and "Hide All" button after changing disabled of a visible column.', fakeAsync(() => {
            grid.columns.forEach((col) => col.disableHiding = true);
            const name = 'Released';
            grid.getColumnByName(name).disableHiding = false;
            fix.detectChanges();

            let checkbox = getCheckboxInput(name, columnChooserElement, fix);
            verifyCheckbox(name, false, false, columnChooserElement, fix);
            expect(getButtonDisabledState('Show All')).toBe(true);
            expect(getButtonDisabledState('Hide All')).toBe(false);

            checkbox.click();
            tick();
            fix.detectChanges();

            expect(checkbox.checked).toBe(true);

            expect(getButtonDisabledState('Show All')).toBe(false);
            expect(getButtonDisabledState('Hide All')).toBe(true);

            checkbox = getCheckboxInput(name, columnChooserElement, fix);

            checkbox.click();
            tick();
            fix.detectChanges();

            expect(checkbox.checked).toBe(false);
            expect(getButtonDisabledState('Show All')).toBe(true);
            expect(getButtonDisabledState('Hide All')).toBe(false);
        }));

        it('- "Hide All" button gets enabled after checking a column when all used to be hidden.', fakeAsync(() => {
            getButtonElement('Hide All').click();
            tick();
            fix.detectChanges();

            expect(getButtonDisabledState('Hide All')).toBe(true);

            getCheckboxInput('ID', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();

            expect(getButtonDisabledState('Hide All')).toBe(false);
        }));

        it('- "Show All" button gets enabled after unchecking a column when all used to be visible.', fakeAsync(() => {
            getButtonElement('Show All').click();
            tick();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(true);

            getCheckboxInput('Released', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(false);
        }));

        it('- "Hide All" button gets disabled after checking the last unchecked column.', fakeAsync(() => {
            expect(getButtonDisabledState('Hide All')).toBe(false);

            getCheckboxInput('ReleaseDate', columnChooserElement, fix).click();
            getCheckboxInput('Released', columnChooserElement, fix).click();
            getCheckboxInput('ID', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();

            expect(getButtonDisabledState('Hide All')).toBe(true);
        }));

        it('- "Show All" button gets disabled after unchecking the last checked column.', fakeAsync(() => {
            expect(getButtonDisabledState('Show All')).toBe(false);
            getCheckboxInput('Downloads', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();
            expect(getButtonDisabledState('Show All')).toBe(true);
        }));

        it('reflects changes in columns headers.', () => {
            const column = grid.getColumnByName('ReleaseDate');
            column.header = 'Release Date';
            fix.detectChanges();

            expect(getColumnChooserItemElement('ReleaseDate')).toBeUndefined();
            expect(getColumnChooserItemElement('Release Date')).toBeDefined();
        });

        it('onColumnVisibilityChanged event is fired on toggling checkboxes.', fakeAsync(() => {
            let currentArgs: IColumnVisibilityChangedEventArgs;
            let counter = 0;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs = args;
            });

            getCheckboxInput('ReleaseDate', columnChooserElement, fix).click();
            tick();
            expect(counter).toBe(1);
            expect(currentArgs.column.field).toBe('ReleaseDate');
            expect(currentArgs.newValue).toBe(true);

            getCheckboxInput('ReleaseDate', columnChooserElement, fix).click();
            tick();
            expect(counter).toBe(2);
            expect(currentArgs.column.field).toBe('ReleaseDate');
            expect(currentArgs.newValue).toBe(false);

            getCheckboxInput('Downloads', columnChooserElement, fix).click();
            tick();
            expect(counter).toBe(3);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(currentArgs.newValue).toBe(false);

            getCheckboxInput('Downloads', columnChooserElement, fix).click();
            tick();
            expect(counter).toBe(4);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(currentArgs.newValue).toBe(true);
        }));

        it('onColumnVisibilityChanged event is fired for each hidable & visible column on pressing "Hide All" button.', fakeAsync(() => {
            const currentArgs: IColumnVisibilityChangedEventArgs[] = [];
            let counter = 0;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs.push(args);
            });

            getButtonElement('Hide All').click();
            tick();
            fix.detectChanges();

            expect(counter).toBe(3);

            expect(currentArgs[0].column.field).toBe('ID');
            expect(currentArgs[0].newValue).toBe(true);

            expect(currentArgs[1].column.field).toBe('Released');
            expect(currentArgs[1].newValue).toBe(true);

            expect(currentArgs[2].column.field).toBe('ReleaseDate');
            expect(currentArgs[2].newValue).toBe(true);
        }));

        it('onColumnVisibilityChanged event is fired for each hidable & hidden column on pressing "Show All" button.', fakeAsync(() => {
            grid.columns[3].hidden = true;
            grid.columns[4].hidden = true;
            tick();
            fix.detectChanges();

            const currentArgs: IColumnVisibilityChangedEventArgs[] = [];
            let counter = 0;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs.push(args);
            });

            getButtonElement('Show All').click();
            tick();
            fix.detectChanges();

            expect(counter).toBe(3);

            expect(currentArgs[0].column.field).toBe('Downloads');
            expect(currentArgs[0].newValue).toBe(false);

            expect(currentArgs[1].column.field).toBe('Released');
            expect(currentArgs[1].newValue).toBe(false);

            expect(currentArgs[2].column.field).toBe('ReleaseDate');
            expect(currentArgs[2].newValue).toBe(false);
        }));

        it('shows a filter textbox with no prompt', () => {
            const filterInput = getFilterInput() ? getFilterInput().nativeElement : undefined;

            expect(filterInput).toBeDefined();
            expect(filterInput.placeholder).toBe('');
            expect(filterInput.textContent).toBe('');
        });

        it('filter prompt can be changed.', () => {
            columnChooser.filterColumnsPrompt = 'Type to filter columns';
            fix.detectChanges();

            const filterInput = getFilterInput() ? getFilterInput().nativeElement : undefined;
            expect(filterInput.placeholder).toBe('Type to filter columns');
            expect(filterInput.textContent).toBe('');

            columnChooser.filterColumnsPrompt = null;
            fix.detectChanges();

            expect(filterInput.placeholder).toBe('');
            expect(filterInput.textContent).toBe('');

            columnChooser.filterColumnsPrompt = undefined;
            fix.detectChanges();

            expect(filterInput.placeholder).toBe('');

            columnChooser.filterColumnsPrompt = '@\#&*';
            fix.detectChanges();

            expect(filterInput.placeholder).toBe('@\#&*');
        });

        it('filters columns on every keystroke in filter input.', (async () => {
            const filterInput = getFilterInput();


            UIInteractions.sendInput(filterInput, 'r');
            await wait();
            expect(columnChooser.columnItems.length).toBe(3);

            UIInteractions.sendInput(filterInput, 're');
            await wait();
            expect(columnChooser.columnItems.length).toBe(2);

            UIInteractions.sendInput(filterInput, 'r');
            await wait();
            expect(columnChooser.columnItems.length).toBe(3);

            UIInteractions.sendInput(filterInput, '');
            await wait();
            expect(columnChooser.columnItems.length).toBe(5);
        }));

        it('filters columns according to the specified filter criteria.', (async () => {
            columnChooser.filterCriteria = 'd';
            await wait();
            fix.detectChanges();

            const filterInput = getFilterInput() ? getFilterInput().nativeElement : undefined;
            expect(filterInput.value).toBe('d');
            expect(columnChooser.columnItems.length).toBe(5);

            columnChooser.filterCriteria += 'a';
            await wait();
            fix.detectChanges();

            expect(filterInput.value).toBe('da');
            expect(columnChooser.columnItems.length).toBe(1);

            columnChooser.filterCriteria = '';
            columnChooser.filterCriteria = 'el';
            await wait();
            fix.detectChanges();

            expect(filterInput.value).toBe('el');
            expect(columnChooser.columnItems.length).toBe(2);

            columnChooser.filterCriteria = '';
            await wait();
            fix.detectChanges();

            expect(filterInput.value).toBe('');
            expect(columnChooser.columnItems.length).toBe(5);
        }));

       it('- Hide All button operates over the filtered in columns only', (async () => {
            grid.columns[1].disableHiding = false;
            columnChooser.filterCriteria = 're';
            fix.detectChanges();
            await wait();

            const btnHideAll = getButtonElement('Hide All');
            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
            expect(columnChooser.columnItems.length).toBe(2);

            btnHideAll.click();
            fix.detectChanges();

            expect(getCheckboxInput('Released', columnChooserElement, fix).checked).toBe(true, 'Released is not checked!');
            expect(getCheckboxInput('ReleaseDate', columnChooserElement, fix).checked)
                .toBe(true, 'ReleaseDate is not checked!');
            expect(getButtonDisabledState('Hide All')).toBe(true, 'Hide All is not disabled!');
            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');

            columnChooser.filterCriteria = 'r';
            fix.detectChanges();

            await wait();
            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');

            expect(getCheckboxInput('ProductName', columnChooserElement, fix).checked)
                .toBe(false, 'ProductName is not unchecked!');

            btnHideAll.click();
            fix.detectChanges();

            columnChooser.filterCriteria = '';
            fix.detectChanges();

            await wait();
            expect(columnChooser.filterCriteria).toBe('', 'Filter criteria is not empty string!');
            expect(getCheckboxInput('ID', columnChooserElement, fix).checked).toBe(false, 'ID is not unchecked!');
            expect(getCheckboxInput('ProductName', columnChooserElement, fix).checked)
                .toBe(true, 'ProductName is not checked!');

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
        }));

        it('- Show All button operates over the filtered in columns only', (async () => {
            grid.columns[1].disableHiding = false;
            columnChooser.hideAllColumns();
            columnChooser.filterCriteria = 're';
            fix.detectChanges();
            await wait();

            const btnShowAll = getButtonElement('Show All');
            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(true, 'Hide All is not disabled!');
            expect(columnChooser.columnItems.length).toBe(2);

            btnShowAll.click();
            fix.detectChanges();

            expect(getCheckboxInput('Released', columnChooserElement, fix).checked)
                .toBe(false, 'Released is not unchecked!');
            expect(getCheckboxInput('ReleaseDate', columnChooserElement, fix).checked)
                .toBe(false, 'ReleaseDate is not unchecked!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');

            columnChooser.filterCriteria = 'r';
            fix.detectChanges();
            await wait();

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');

            expect(getCheckboxInput('ProductName', columnChooserElement, fix).checked)
                .toBe(true, 'ProductName is not checked!');

            btnShowAll.click();
            fix.detectChanges();

            columnChooser.filterCriteria = '';
            fix.detectChanges();
            await wait();

            expect(columnChooser.filterCriteria).toBe('', 'Filter criteria is not empty string!');
            expect(getCheckboxInput('ID', columnChooserElement, fix).checked).toBe(true, 'ID is not checked!');
            expect(getCheckboxInput('ProductName', columnChooserElement, fix).checked)
                .toBe(false, 'ProductName is not unchecked!');

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
        }));

        it('hides the proper columns after filtering and clearing the filter', (async () => {
            const filterInput = getFilterInput();

            UIInteractions.sendInput(filterInput, 'a', fix);
            await wait();

            expect(getButtonDisabledState('Show All')).toBe(false);
            getButtonElement('Show All').click();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');
            expect(grid.columns[2].hidden).toBe(false, 'Downloads column is not hidden!');

            UIInteractions.sendInput(filterInput, '', fix);
            await wait();

            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');
            expect(grid.columns[0].hidden).toBe(false, 'ID column is not shown!');
            getCheckboxInput('ID', columnChooserElement, fix).click();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(grid.columns[0].hidden).toBe(true, 'ID column is not hidden!');
        }));

        it('fires onColumnVisibilityChanged event after filtering and clearing the filter.', (async () => {
            let counter = 0;
            let currentArgs: IColumnVisibilityChangedEventArgs;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs = args;
            });

            const filterInput = getFilterInput();

            UIInteractions.sendInput(filterInput, 'a', fix);
            await wait();
            getCheckboxInput('Downloads', columnChooserElement, fix).click();

            expect(counter).toBe(1);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(grid.columns[2].hidden).toBe(false);

            UIInteractions.sendInput(filterInput, '', fix);
            await wait();

            getCheckboxInput('ID', columnChooserElement, fix).click();

            expect(grid.columns[0].hidden).toBe(true);
            expect(counter).toBe(2);
            expect(currentArgs.column.header).toBe('ID');
        }));

        it('styles are applied.', () => {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
            expect(columnChooserElement.query(By.css('div.igx-column-hiding__columns'))).not.toBe(null);
            expect(columnChooserElement.query(By.css('div.igx-column-hiding__header'))).not.toBe(null);
            expect(columnChooserElement.query(By.css('div.igx-column-hiding__buttons'))).not.toBe(null);
        });

        it('height can be controlled via columnsAreaMaxHeight input.', () => {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
            expect(columnChooser.columnsAreaMaxHeight).toBe('100%');
            expect(columnChooserElement.nativeElement.offsetHeight).toBe(316);

            columnChooser.columnsAreaMaxHeight = '150px';
            fix.detectChanges();
            const columnsAreaDiv = columnChooserElement.query(By.css('div.igx-column-hiding__columns'));
            expect(JSON.stringify(columnsAreaDiv.styles)).toBe('{"max-height":"150px"}');
            expect(columnChooserElement.nativeElement.offsetHeight).toBe(258);
        });

        it('should recalculate heights when enough columns are hidden so that there is no need for horizontal scrollbar.', async () => {
            grid.height = '200px';
            fix.detectChanges();
            grid.reflow();
            await wait(16);
            expect(grid.scr.nativeElement.hidden).toBe(false);
            const gridHeader = fix.debugElement.query(By.css('.igx-grid__thead'));
            const gridScroll = fix.debugElement.query(By.css('.igx-grid__scroll'));
            const gridFooter = fix.debugElement.query(By.css('.igx-grid__tfoot'));
            let expectedHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);

            expect(grid.calcHeight).toEqual(expectedHeight + 1);

            grid.columns[3].hidden = true;
            await wait();
            expect(grid.scr.nativeElement.hidden).toBe(true);

            expectedHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10);

            expect(grid.calcHeight).toEqual(expectedHeight + 1);
        });
    });

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(ColumnGroupsHidingTestComponent);
            fix.detectChanges();
            fix.componentInstance.hasGroupColumns = true;
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            fix.detectChanges();

            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        });

        it('indents columns according to their level.', () => {
            const items = columnChooser.columnItems;

            expect(items.filter((col) => col.calcIndent === 0).length).toBe(3);
            expect(items.filter((col) => col.calcIndent === 30).length).toBe(2);
            expect(items.filter((col) => col.calcIndent === 60).length).toBe(2);

            const columnItems = getColumnHidingItems();

            const margin0 = '{"margin-left":"0px"}';
            const margin1 = '{"margin-left":"30px"}';
            const margin2 = '{"margin-left":"60px"}';
            expect(JSON.stringify(columnItems[0].styles)).toBe(margin0);
            expect(JSON.stringify(columnItems[1].styles)).toBe(margin0);
            expect(JSON.stringify(columnItems[2].styles)).toBe(margin1);
            expect(JSON.stringify(columnItems[3].styles)).toBe(margin1);
            expect(JSON.stringify(columnItems[4].styles)).toBe(margin2);
            expect(JSON.stringify(columnItems[5].styles)).toBe(margin2);
            expect(JSON.stringify(columnItems[6].styles)).toBe(margin0);
        });

        it('checks & hides all children when hiding their parent.', fakeAsync(() => {
            getCheckboxInput('Person Details', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();

            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', true, false, columnChooserElement, fix);

            verifyColumnIsHidden(grid.columns[3], true, 4);
            verifyColumnIsHidden(grid.columns[4], true, 4);
            verifyColumnIsHidden(grid.columns[5], true, 4);

            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);
            verifyCheckbox('General Information', false, false, columnChooserElement, fix);

            getCheckboxInput('Person Details', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();

            verifyColumnIsHidden(grid.columns[3], false, 7);
            verifyColumnIsHidden(grid.columns[4], false, 7);
            verifyColumnIsHidden(grid.columns[5], false, 7);

            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', false, false, columnChooserElement, fix);

            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);
            verifyCheckbox('General Information', false, false, columnChooserElement, fix);
        }));

        it('checks & hides all descendants when hiding top level parent.', fakeAsync(() => {
            getCheckboxInput('General Information', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();

            verifyCheckbox('General Information', true, false, columnChooserElement, fix);
            verifyCheckbox('CompanyName', true, false, columnChooserElement, fix);

            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', true, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', true, false, columnChooserElement, fix);

            verifyCheckbox('Missing', false, false, columnChooserElement, fix);
            verifyCheckbox('ID', false, false, columnChooserElement, fix);

            getCheckboxInput('General Information', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();

            verifyCheckbox('General Information', false, false, columnChooserElement, fix);
            verifyCheckbox('CompanyName', false, false, columnChooserElement, fix);

            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactName', false, false, columnChooserElement, fix);
            verifyCheckbox('ContactTitle', false, false, columnChooserElement, fix);
        }));

        it('checks/unchecks parent when all children are checked/unchecked.', fakeAsync(() => {
            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);

            getCheckboxInput('ContactName', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();
            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
            getCheckboxInput('ContactTitle', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();
            verifyCheckbox('Person Details', true, false, columnChooserElement, fix);

            getCheckboxInput('ContactName', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();
            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);

            getCheckboxInput('ContactTitle', columnChooserElement, fix).click();
            tick();
            fix.detectChanges();
            verifyCheckbox('Person Details', false, false, columnChooserElement, fix);
        }));

        it('filters group columns properly.', () => {
            columnChooser.filterCriteria = 'cont';
            fix.detectChanges();

            expect(columnChooser.columnItems.length).toBe(4);
            expect(getColumnHidingItems().length).toBe(4);

            expect(getCheckboxElement('General Information', columnChooserElement, fix)).toBeTruthy();
            expect(getCheckboxElement('Person Details', columnChooserElement, fix)).toBeTruthy();

            expect(getCheckboxElement('ContactName', columnChooserElement, fix)).toBeTruthy();
            expect(getCheckboxElement('ContactTitle', columnChooserElement, fix)).toBeTruthy();

            columnChooser.filterCriteria = 'pers';
            fix.detectChanges();

            expect(columnChooser.columnItems.length).toBe(2);
            expect(getColumnHidingItems().length).toBe(2);
            expect(getCheckboxElement('General Information', columnChooserElement, fix)).toBeTruthy();
            expect(getCheckboxElement('Person Details', columnChooserElement, fix)).toBeTruthy();

            columnChooser.filterCriteria = 'mi';
            fix.detectChanges();

            expect(columnChooser.columnItems.length).toBe(1);
            expect(getColumnHidingItems().length).toBe(1);
            expect(getCheckboxElement('General Information', columnChooserElement, fix)).toBeFalsy();
            expect(getCheckboxElement('Missing', columnChooserElement, fix)).toBeTruthy();
        });

        it('hides the proper columns when filtering and pressing hide all.', fakeAsync(() => {
            columnChooser.filterCriteria = 'cont';
            fix.detectChanges();

            getButtonElement('Hide All').click();
            tick();
            columnChooser.filterCriteria = '';
            fix.detectChanges();
            for (let i = 1; i < 6; i++) {
                verifyColumnIsHidden(grid.columns[i], true, 2);
            }
        }));
    });

    describe('toolbar button', () => {
        configureTestSuite();
        beforeEach(() => {
            fix = TestBed.createComponent(ColumnHidingTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.showToolbar = true;
            grid.toolbarTitle = 'Grid Toolbar Title';
            grid.hiddenColumnsText = 'Hidden';
            grid.columnHiding = true;
            grid.columns[2].hidden = true;
            fix.componentInstance.showInline = false;
            fix.detectChanges();

            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        });

        it('is shown when columnHiding is true and hidden - when false.', () => {
            expect(grid.toolbar.columnHidingUI).toBeDefined();
            expect(columnChooserElement).toBeDefined();
            expect(getColumnHidingButton(fix)).not.toBe(null);

            grid.columnHiding = false;
            fix.detectChanges();

            expect(grid.toolbar.columnHidingUI).toBeUndefined();
            expect(columnChooserElement).toBe(null);
            expect(getColumnHidingButton(fix)).toBeUndefined();

            grid.columnHiding = undefined;
            fix.detectChanges();

            expect(grid.toolbar.columnHidingUI).toBeUndefined();
            expect(columnChooserElement).toBe(null);
        });

        it('shows the number of hidden columns.', () => {
            const btnText = getColumnHidingButton(fix).innerText.toLowerCase();
            expect(btnText.includes('1') && btnText.includes('hidden')).toBe(true);
            expect(getColumnChooserButtonIcon().innerText.toLowerCase()).toBe('visibility_off');
        });

        it('shows the proper icon when no columns are hidden.', fakeAsync(() => {
            grid.columns[2].hidden = false;
            tick();
            fix.detectChanges();

            const btnText = getColumnHidingButton(fix).innerText.toLowerCase();
            expect(btnText.includes('0') && btnText.includes('hidden')).toBe(true);
            expect(getColumnChooserButtonIcon().innerText.toLowerCase()).toBe('visibility');
        }));
    });

    function getColumnChooserButtonIcon() {
        const button = fix.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');
        return button.query(By.css('igx-icon')).nativeElement;
    }

    function getColumnHidingItems() {
        if (!columnChooserElement) {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        }
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        return checkboxElements;
    }

    function getColumnChooserItem(name: string): IgxColumnHidingItemDirective {
        return columnChooser.hidableColumns.find((col) => col.name === name) as IgxColumnHidingItemDirective;
    }

    function getColumnChooserItemElement(name: string) {
        if (!columnChooserElement) {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        }
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        const item = checkboxElements.find((el) => el.nativeElement.outerText.includes(name));
        return item;
    }

    function getButtonElement(content: string): HTMLButtonElement {
        const buttonElements = columnChooserElement.queryAll(By.css('button'));

        const button = buttonElements.find((el) => (el.nativeElement as HTMLButtonElement).textContent === content);

        return button.nativeElement as HTMLButtonElement;
    }

    function getButtonDisabledState(content: string) {
        const button = getButtonElement(content);
        return button.className.includes('igx-button--disabled');
    }

    function getFilterInput() {
        const inputElement = columnChooserElement.queryAll(By.css('input'))
            .find((el) => (el.nativeElement as HTMLInputElement).type === 'text');

        return inputElement;
    }
});
