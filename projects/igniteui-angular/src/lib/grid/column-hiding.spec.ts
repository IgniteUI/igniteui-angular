
import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, Input, OnInit, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../calendar';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from './column-hiding-item.directive';
import { ColumnDisplayOrder, IgxColumnHidingComponent, IgxColumnHidingModule } from './column-hiding.component';
import { IgxColumnComponent } from './column.component';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';

describe('Column Hiding UI', () => {
    let fix;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnHidingComponent;
    let columnChooserElement: DebugElement;
    const componentTitle = 'Column Hiding UI';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridWithColumnChooserComponent,
                GridColumnHidingComponent,
                GridWithoutColumnChooserComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxGridModule.forRoot(),
                IgxColumnHidingModule
            ]
        })
        .compileComponents();
    }));

    describe('', () => {
        beforeEach(async(() => {
            fix = TestBed.createComponent(GridColumnHidingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        }));

        it ('title is initially empty.', () => {
            const title = (columnChooserElement.query(By.css('h4')).nativeElement as HTMLHeadingElement).textContent;
            expect(title).toBe('');
        });

        it ('title can be successfully changed.', () => {
            columnChooser.title = 'Show/Hide Columns';
            fix.detectChanges();

            const titleElement = (columnChooserElement.query(By.css('h4')).nativeElement as HTMLHeadingElement);
            expect(titleElement.textContent).toBe('Show/Hide Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(titleElement.textContent).toBe('');

            columnChooser.title = null;
            fix.detectChanges();

            expect(titleElement.textContent).toBe('');
        });

        it('lists all 5 grid columns.', () => {
            const columnItems = columnChooser.columnItems;
            expect(columnItems.length).toBe(5);

            expect(getColumnHidingItems().length).toBe(5);
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

        it('shows "ProductName" checkbox unchecked and disabled.', () => {
            const columnName = 'ProductName';
            const colProductName = getColumnChooserItem(columnName);
            expect(colProductName).toBeDefined();
            expect(colProductName.disableHiding).toBe(true);

            const chkProductName = getCheckboxElement(columnName);
            expect(chkProductName).toBeDefined();
            verifyCheckbox(columnName, false, true);
        });

        it('"hiddenColumnsCount" reflects properly the number of hidden columns.', () => {
            expect(columnChooser.hiddenColumnsCount).toBe(1);

            grid.columns[2].hidden = false;
            expect(columnChooser.hiddenColumnsCount).toBe(0);

            grid.columns[0].hidden = true;
            expect(columnChooser.hiddenColumnsCount).toBe(1);

            getCheckboxInput('Released').click();
            expect(columnChooser.hiddenColumnsCount).toBe(2);
        });

        it('reflects changes in columns disableHiding properly.', () => {
            grid.columns[0].disableHiding = true;
            fix.detectChanges();

            const colProductName = getColumnChooserItem('ID');
            expect(colProductName).toBeDefined();
            expect(colProductName.disableHiding).toBe(true);
            verifyCheckbox('ID', false, true);

            grid.columns[0].disableHiding = false;
            fix.detectChanges();

            expect(colProductName.disableHiding).toBe(false);
            verifyCheckbox('ID', false, false);
        });

        it('allows hiding a column whose disableHiding=undefined.', () => {
            grid.columns[3].disableHiding = undefined;
            fix.detectChanges();

            verifyCheckbox('Released', false, false);
        });

        it('shows all items and buttons disabled when all columns disableHiding is true.', () => {
            grid.columns.forEach((col) => col.disableHiding = true);
            fix.detectChanges();

            const checkboxes = getCheckboxInputs();

            expect(checkboxes.filter((chk) => chk.disabled).length).toBe(5);
            expect(checkboxes.filter((chk) => chk.checked).length).toBe(1);
            expect(getCheckboxInput('Downloads').checked).toBe(true);

            expect(getButtonDisabledState('Show All')).toBe(true);
            expect(getButtonDisabledState('Hide All')).toBe(true);
        });

        it('- toggling column checkbox checked state successfully changes the grid column visibility.', () => {
            const checkbox = getCheckboxInput('ReleaseDate');
            verifyCheckbox('ReleaseDate', false, false);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsHidden(column, false, 4);

            checkbox.click();

            expect(checkbox.checked).toBe(true);
            verifyColumnIsHidden(column, true, 3);

            checkbox.click();

            expect(checkbox.checked).toBe(false);
            verifyColumnIsHidden(column, false, 4);
        });

        it('reflects properly grid column hidden value changes.', () => {
            const name = 'ReleaseDate';
            verifyCheckbox(name, false, false);
            const column = grid.getColumnByName(name);

            column.hidden = true;
            fix.detectChanges();

            verifyCheckbox(name, true, false);
            verifyColumnIsHidden(column, true, 3);

            column.hidden = false;
            fix.detectChanges();

            verifyCheckbox(name, false, false);
            verifyColumnIsHidden(column, false, 4);

            column.hidden = undefined;
            fix.detectChanges();

            verifyCheckbox(name, false, false);
            verifyColumnIsHidden(column, undefined, 4);

            column.hidden = true;
            fix.detectChanges();
            verifyColumnIsHidden(column, true, 3);

            column.hidden = null;
            fix.detectChanges();

            verifyCheckbox(name, false, false);
            verifyColumnIsHidden(column, null, 4);
        });

        it('enables the column checkbox and "Show All" button after changing disableHiding of a hidden column.', () => {
            grid.columns.forEach((col) => col.disableHiding = true);
            const name = 'Downloads';
            grid.getColumnByName(name).disableHiding = false;
            fix.detectChanges();

            const checkbox = getCheckboxInput(name);
            verifyCheckbox(name, true, false);

            expect(getButtonDisabledState('Show All')).toBe(false);
            expect(getButtonDisabledState('Hide All')).toBe(true);

            checkbox.click();
            fix.detectChanges();

            expect(checkbox.checked).toBe(false, 'Checkbox is not unchecked!');

            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All button is not disabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All button is not enabled!');

            checkbox.click();
            fix.detectChanges();

            expect(checkbox.checked).toBe(true, 'Checkbox is not checked!');

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All button is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(true, 'Hide All button is not disabled!');
        });

        it('enables the column checkbox and "Hide All" button after changing disableHiding of a visible column.', () => {
            grid.columns.forEach((col) => col.disableHiding = true);
            const name = 'Released';
            grid.getColumnByName(name).disableHiding = false;
            fix.detectChanges();

            const checkbox = getCheckboxInput(name);
            verifyCheckbox(name, false, false);
            expect(getButtonDisabledState('Show All')).toBe(true);
            expect(getButtonDisabledState('Hide All')).toBe(false);

            checkbox.click();
            fix.detectChanges();

            expect(checkbox.checked).toBe(true);

            expect(getButtonDisabledState('Show All')).toBe(false);
            expect(getButtonDisabledState('Hide All')).toBe(true);

            checkbox.click();
            fix.detectChanges();

            expect(checkbox.checked).toBe(false);
            expect(getButtonDisabledState('Show All')).toBe(true);
            expect(getButtonDisabledState('Hide All')).toBe(false);
        });

        it('- "Hide All" button gets enabled after checking a column when all used to be hidden.', () => {
            getButtonElement('Hide All').click();
            fix.detectChanges();

            expect(getButtonDisabledState('Hide All')).toBe(true);

            getCheckboxInput('ID').click();
            fix.detectChanges();

            expect(getButtonDisabledState('Hide All')).toBe(false);
        });

        it('- "Show All" button gets enabled after unchecking a column when all used to be visible.', () => {
            getButtonElement('Show All').click();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(true);

            getCheckboxInput('Released').click();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(false);
        });

        it('- "Hide All" button gets disabled after checking the last unchecked column.', () => {
            expect(getButtonDisabledState('Hide All')).toBe(false);

            getCheckboxInput('ReleaseDate').click();
            getCheckboxInput('Released').click();
            getCheckboxInput('ID').click();
            fix.detectChanges();

            expect(getButtonDisabledState('Hide All')).toBe(true);
        });

        it('- "Show All" button gets disabled after unchecking the last checked column.', () => {
            expect(getButtonDisabledState('Show All')).toBe(false);
            getCheckboxInput('Downloads').click();
            fix.detectChanges();
            expect(getButtonDisabledState('Show All')).toBe(true);
        });

        it('reflects changes in columns headers.', () => {
            const column = grid.getColumnByName('ReleaseDate');
            column.header = 'Release Date';
            fix.detectChanges();

            expect(getColumnChooserItemElement('ReleaseDate')).toBeUndefined();
            expect(getColumnChooserItemElement('Release Date')).toBeDefined();
        });

        it('onColumnVisibilityChanged event is fired on toggling checkboxes.', () => {
            let currentArgs: IColumnVisibilityChangedEventArgs;
            let counter = 0;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs = args;
            });

            getCheckboxInput('ReleaseDate').click();

            expect(counter).toBe(1);
            expect(currentArgs.column.field).toBe('ReleaseDate');
            expect(currentArgs.newValue).toBe(true);

            getCheckboxInput('ReleaseDate').click();

            expect(counter).toBe(2);
            expect(currentArgs.column.field).toBe('ReleaseDate');
            expect(currentArgs.newValue).toBe(false);

            getCheckboxInput('Downloads').click();

            expect(counter).toBe(3);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(currentArgs.newValue).toBe(false);

            getCheckboxInput('Downloads').click();

            expect(counter).toBe(4);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(currentArgs.newValue).toBe(true);

            getCheckboxInput('ProductName').click();

            expect(counter).toBe(4);
        });

        it('onColumnVisibilityChanged event is fired for each hidable & visible column on pressing "Hide All" button.', () => {
            const currentArgs: IColumnVisibilityChangedEventArgs[] = [];
            let counter = 0;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs.push(args);
            });

            getButtonElement('Hide All').click();
            fix.detectChanges();

            expect(counter).toBe(3);

            expect(currentArgs[0].column.field).toBe('ID');
            expect(currentArgs[0].newValue).toBe(true);

            expect(currentArgs[1].column.field).toBe('Released');
            expect(currentArgs[1].newValue).toBe(true);

            expect(currentArgs[2].column.field).toBe('ReleaseDate');
            expect(currentArgs[2].newValue).toBe(true);
        });

        it('onColumnVisibilityChanged event is fired for each hidable & hidden column on pressing "Show All" button.', () => {
            grid.columns[3].hidden = true;
            grid.columns[4].hidden = true;
            fix.detectChanges();

            const currentArgs: IColumnVisibilityChangedEventArgs[] = [];
            let counter = 0;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs.push(args);
            });

            getButtonElement('Show All').click();
            fix.detectChanges();

            expect(counter).toBe(3);

            expect(currentArgs[0].column.field).toBe('Downloads');
            expect(currentArgs[0].newValue).toBe(false);

            expect(currentArgs[1].column.field).toBe('Released');
            expect(currentArgs[1].newValue).toBe(false);

            expect(currentArgs[2].column.field).toBe('ReleaseDate');
            expect(currentArgs[2].newValue).toBe(false);
        });

        it('shows a filter textbox with no prompt', () => {
            const filterInput = getFilterInput();
            expect(filterInput).toBeDefined();
            expect(filterInput.placeholder).toBe('');
            expect(filterInput.textContent).toBe('');
        });

        it('filter prompt can be changed.', () => {
            columnChooser.filterColumnsPrompt = 'Type to filter columns';
            fix.detectChanges();

            const filterInput = getFilterInput();
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

        it('filters columns on every keystroke in filter input.', (done) => {
            const filterInput = getFilterInput();
            sendInput(filterInput, 'r', fix).then(() => {
                expect(columnChooser.columnItems.length).toBe(3);
                sendInput(filterInput, 're', fix).then(() => {
                    expect(columnChooser.columnItems.length).toBe(2);
                    sendInput(filterInput, 'r', fix).then(() => {
                        expect(columnChooser.columnItems.length).toBe(3);
                        sendInput(filterInput, '', fix).then(() => {
                            expect(columnChooser.columnItems.length).toBe(5);
                            done();
                        });
                    });
                });
            });
        });

        it('filters columns according to the specified filter criteria.', fakeAsync(() => {
            columnChooser.filterCriteria = 'd';
            tick();
            fix.detectChanges();

            const filterInput = getFilterInput();
            expect(filterInput.value).toBe('d');
            expect(columnChooser.columnItems.length).toBe(5);

            columnChooser.filterCriteria += 'a';
            tick();
            fix.detectChanges();

            expect(filterInput.value).toBe('da');
            expect(columnChooser.columnItems.length).toBe(1);

            columnChooser.filterCriteria = '';
            columnChooser.filterCriteria = 'el';
            tick();
            fix.detectChanges();

            expect(filterInput.value).toBe('el');
            expect(columnChooser.columnItems.length).toBe(2);

            columnChooser.filterCriteria = '';
            tick();
            fix.detectChanges();

            expect(filterInput.value).toBe('');
            expect(columnChooser.columnItems.length).toBe(5);
        }));

        it('- Hide All button operates over the filtered in columns only', fakeAsync(() => {
            grid.columns[1].disableHiding = false;
            columnChooser.filterCriteria = 're';
            tick();
            fix.detectChanges();

            const btnHideAll = getButtonElement('Hide All');
            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
            expect(columnChooser.columnItems.length).toBe(2);

            btnHideAll.click();
            fix.detectChanges();

            expect(getCheckboxInput('Released').checked).toBe(true, 'Released is not checked!');
            expect(getCheckboxInput('ReleaseDate').checked).toBe(true, 'ReleaseDate is not checked!');
            expect(getButtonDisabledState('Hide All')).toBe(true, 'Hide All is not disabled!');
            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');

            columnChooser.filterCriteria = 'r';
            tick();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');

            expect(getCheckboxInput('ProductName').checked).toBe(false, 'ProductName is not unchecked!');

            btnHideAll.click();
            fix.detectChanges();

            columnChooser.filterCriteria = '';
            tick(100);
            fix.detectChanges();

            expect(columnChooser.filterCriteria).toBe('', 'Filter criteria is not empty string!');
            expect(getCheckboxInput('ID').checked).toBe(false, 'ID is not unchecked!');
            expect(getCheckboxInput('ProductName').checked).toBe(true, 'ProductName is not checked!');

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
        }));

        it('- Show All button operates over the filtered in columns only', fakeAsync(() => {
            grid.columns[1].disableHiding = false;
            columnChooser.hideAllColumns();
            columnChooser.filterCriteria = 're';
            tick();
            fix.detectChanges();

            const btnShowAll = getButtonElement('Show All');
            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(true, 'Hide All is not disabled!');
            expect(columnChooser.columnItems.length).toBe(2);

            btnShowAll.click();
            fix.detectChanges();

            expect(getCheckboxInput('Released').checked).toBe(false, 'Released is not unchecked!');
            expect(getCheckboxInput('ReleaseDate').checked).toBe(false, 'ReleaseDate is not unchecked!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
            expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');

            columnChooser.filterCriteria = 'r';
            tick();
            fix.detectChanges();

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');

            expect(getCheckboxInput('ProductName').checked).toBe(true, 'ProductName is not checked!');

            btnShowAll.click();
            fix.detectChanges();

            columnChooser.filterCriteria = '';
            tick(100);
            fix.detectChanges();

            expect(columnChooser.filterCriteria).toBe('', 'Filter criteria is not empty string!');
            expect(getCheckboxInput('ID').checked).toBe(true, 'ID is not checked!');
            expect(getCheckboxInput('ProductName').checked).toBe(false, 'ProductName is not unchecked!');

            expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
            expect(getButtonDisabledState('Hide All')).toBe(false, 'Hide All is not enabled!');
        }));

        it('hides the proper columns after filtering and clearing the filter', (done) => {
            const filterInput = getFilterInput();

            sendInput(filterInput, 'a', fix).then(() => {
                fix.detectChanges();
                expect(getButtonDisabledState('Show All')).toBe(false);
                getButtonElement('Show All').click();
                fix.detectChanges();

                expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');
                expect(grid.columns[2].hidden).toBe(false, 'Downloads column is not hidden!');

                sendInput(filterInput, '', fix).then(() => {
                    fix.detectChanges();
                    expect(getButtonDisabledState('Show All')).toBe(true, 'Show All is not disabled!');
                    expect(grid.columns[0].hidden).toBe(false, 'ID column is not shown!');
                    getCheckboxInput('ID').click();
                    fix.detectChanges();

                    expect(getButtonDisabledState('Show All')).toBe(false, 'Show All is not enabled!');
                    expect(grid.columns[0].hidden).toBe(true, 'ID column is not hidden!');
                    done();
                });
            });
        });

        it('fires onColumnVisibilityChanged event after filtering and clearing the filter.', (done) => {
            let counter = 0;
            let currentArgs: IColumnVisibilityChangedEventArgs;
            columnChooser.onColumnVisibilityChanged.subscribe((args: IColumnVisibilityChangedEventArgs) => {
                counter++;
                currentArgs = args;
            });

            const filterInput = getFilterInput();

            sendInput(filterInput, 'a', fix).then(() => {
                fix.detectChanges();
                getCheckboxInput('Downloads').click();

                expect(counter).toBe(1);
                expect(currentArgs.column.field).toBe('Downloads');
                expect(grid.columns[2].hidden).toBe(false);

                sendInput(filterInput, '', fix).then(() => {
                    fix.detectChanges();
                    getCheckboxInput('ID').click();

                    expect(grid.columns[0].hidden).toBe(true);
                    expect(counter).toBe(2);
                    expect(currentArgs.column.header).toBe('ID');
                    done();
                });
            });
        });

    });

    describe('toolbar button', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(GridWithoutColumnChooserComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            fix.detectChanges();

            grid.cdr.detectChanges();
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        });

        xit('is not shown by default.', () => {
            columnChooser = grid.columnHidingUI;
            expect(columnChooser).toBeUndefined();
            expect(columnChooserElement).toBe(null);
        });

        xit('is shown when columnHiding is true and hidden - when false.', () => {
            grid.columnHiding = true;
            fix.detectChanges();

            expect(grid.columnHidingUI).toBeDefined();
            expect(columnChooserElement).toBeDefined();
            expect(getColumnChooserButton()).not.toBe(null);

            grid.columnHiding = false;
            fix.detectChanges();

            expect(grid.columnHidingUI).toBeUndefined();
            expect(columnChooserElement).toBe(null);
            expect(getColumnChooserButton()).toBe(null);

            grid.columnHiding = undefined;
            fix.detectChanges();

            expect(grid.columnHidingUI).toBeUndefined();
            expect(columnChooserElement).toBe(null);
        });

        xit('shows the number of hidden columns.', fakeAsync(() => {
            grid.columnHidingUI.togglable = true;
            tick(100);
            fix.detectChanges();

            const button = getColumnChooserButton();
            expect(button.innerText.includes('1 HIDDEN')).toBe(true);
            expect(getColumnChooserButtonIcon().innerText).toBe('VISIBILITY_OFF ');
        }));

        xit('shows the proper icon when no columns are hidden.', fakeAsync(() => {
            grid.columnHidingUI.togglable = true;
            grid.columns[2].hidden = false;
            tick(100);
            fix.detectChanges();

            const button = getColumnChooserButton();
            expect(button.innerText.includes('0 HIDDEN')).toBe(true);
            expect(getColumnChooserButtonIcon().innerText).toBe('VISIBILITY ');
        }));
    });

    function getColumnChooserButton() {
        const button = fix.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnChooser');
        return button ? button.nativeElement : undefined;
    }

    function getColumnChooserButtonIcon() {
        const button = fix.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnChooser');
        return button.query(By.css('igx-icon')).nativeElement;
    }

    function getColumnHidingItems() {
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        const items = [];
        checkboxElements.forEach((el) => {
            if ((el.nativeElement as HTMLElement).outerHTML.includes('igxcolumnhidingitem')) {
                items.push(el);
            }
        });

        return items;
    }

    function getColumnChooserItem(name: string): IgxColumnHidingItemDirective {
        return columnChooser.columnItems.find((col) => col.name === name) as IgxColumnHidingItemDirective;
    }

    function getColumnChooserItemElement(name: string) {
        const item = getColumnHidingItems().find((el) => el.nativeElement.outerText.includes(name));
        return item;
    }

    function getCheckboxElement(name: string) {
        if (!columnChooserElement) {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-hiding'));
        }

        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        const chkProductName = checkboxElements.find((el) =>
            (el.context as IgxCheckboxComponent).placeholderLabel.nativeElement.innerText === name);

        return chkProductName;
    }

    function getCheckboxInputFromElement(checkboxEl: DebugElement): HTMLInputElement {
        return checkboxEl.query(By.css('input')).nativeElement as HTMLInputElement;
    }

    function getCheckboxInput(name: string) {
        const checkboxEl = getCheckboxElement(name);
        const chkInput = checkboxEl.query(By.css('input')).nativeElement as HTMLInputElement;

        return chkInput;
    }

    function getCheckboxInputs(): HTMLInputElement[] {
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        const inputs = [];
        checkboxElements.forEach((el) => {
            inputs.push(el.query(By.css('input')).nativeElement as HTMLInputElement);
        });

        return inputs;
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

        return inputElement ? inputElement.nativeElement as HTMLInputElement : undefined;
    }

    function sendInput(element, text: string, fixture) {
        element.value = text;
        element.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        return fixture.whenStable();
    }

    function verifyColumnIsHidden(column: IgxColumnComponent, isHidden: boolean, visibleColumnsCount: number) {
        expect(column.hidden).toBe(isHidden, 'Hidden is not ' + isHidden);

        const visibleColumns = column.grid.visibleColumns;
        expect(visibleColumns.length).toBe(visibleColumnsCount, 'Unexpected visible columns count!');
        expect(visibleColumns.findIndex((col) => col === column) > -1).toBe(!isHidden, 'Unexpected result for visibleColumns collection!');
    }

    function verifyCheckbox(name: string, isChecked: boolean, isDisabled: boolean) {
        const chkInput = getCheckboxInput(name);
        expect(chkInput.type).toBe('checkbox');
        expect(chkInput.disabled).toBe(isDisabled);
        expect(chkInput.checked).toBe(isChecked);
    }
});

export class GridData {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 15),
            Released: false
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', -1),
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', -1),
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: ''
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 1),
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', 1),
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: false
        }
    ];

}
@Component({
    template: `<div>
    <igx-column-hiding [columns]="grid1.columns" [togglable]="false"></igx-column-hiding>
    <igx-grid #grid1 [data]="data" width="500px" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>
    </div>`
})
export class GridColumnHidingComponent extends GridData implements AfterViewInit {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnHidingComponent) public chooser: IgxColumnHidingComponent;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}

@Component({
    template: `<igx-grid [data]="data" width="500px" height="500px" [columnHiding]="true">
        <igx-column [field]="'ID'" [header]="'ID'" [disableHiding]="false"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>`
})
export class GridWithColumnChooserComponent extends GridData {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnHidingComponent) public chooser: IgxColumnHidingComponent;
}

@Component({
    template: `<igx-grid [data]="data" width="500px" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'" [disableHiding]="true"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>`
})
export class GridWithoutColumnChooserComponent extends GridData {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}
