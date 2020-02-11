import { Component, ViewChild, Type, DebugElement, NgZone } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridModule, IgxGridCellComponent, IGridCellEventArgs } from './index';
import { IgxGridComponent } from './grid.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { setupGridScrollDetection, TestNgZone } from '../../test-utils/helper-utils.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';
const ROW_CSS_CLASS = '.igx-grid__tr';
const CELL_BLOCK = '.igx-grid__mrl-block';
const focusEvent = new FocusEvent('focus');

describe('IgxGrid Multi Row Layout - Keyboard navigation #grid', () => {
    let fix: ComponentFixture<ColumnLayoutTestComponent>;
    let zone: TestNgZone;

    describe('Without scrolling', () => {
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    ColumnLayoutTestComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
                providers: [{ provide: NgZone, useFactory: () => zone = new TestNgZone() }]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(ColumnLayoutTestComponent);
        });

        describe('General', () => {
            it('should navigate through a single layout with right and left arrow keys', () => {
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                let fourthCell;
                [firstCell, secondCell, thirdCell, fourthCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                // reached the end shouldn't stay on the same cell
                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
            });

            it('should navigate between column layouts with right arrow key', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 1 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                secondCell .triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('should navigate between column layouts with left key', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 1 }
                    ]
                }];
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                thirdCell .triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate down and up to a cell from the same column layout from a cell with bigger col span', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 }
                    ]
                }];
                fix.detectChanges();
                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate down and up to a cell from the same column layout to a cell with bigger col span', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                secondCell .triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate down and up to a cell from the same column layout according to its starting location', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2, colEnd: 4 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 3 }
                    ]
                }];
                fix.detectChanges();
                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                secondCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should allow navigating down to a cell from the next row', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();
                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                thirdCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('should allow navigating down to a cell from the next row with hidden column layout', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();
                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                thirdCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('should retain the focus when the first cell is reached', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                secondCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate up correctly', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 }
                    ]
                }];

                fix.detectChanges();
                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                thirdCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('navigate to right and left with hidden columns', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 }
                    ]
                }];
                fix.detectChanges();
                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                secondCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it(`Tab Navigation should move through each cell from the row once,
            moving through all cells with same rowStart, following the columnStart and column layout order,
            before moving on to the next rowStart.`, () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid =  fix.componentInstance.grid;
                const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];
                // check visible indexes are correct
                expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(0);
                expect(grid.getCellByColumn(0, 'ContactName').visibleColumnIndex).toBe(1);
                expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(2);
                expect(grid.getCellByColumn(0, 'Phone').visibleColumnIndex).toBe(3);
                expect(grid.getCellByColumn(0, 'City').visibleColumnIndex).toBe(4);
                expect(grid.getCellByColumn(0, 'ContactTitle').visibleColumnIndex).toBe(5);
                expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(6);

                // focus 1st
                let cell = grid.getCellByColumn(0, 'ID');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                const dataCols = grid.columns.filter(x => !x.columnLayout);
                // tab thorugh all data cols and check cells are selected/focused.
                for (let i = 1; i < dataCols.length; i++) {
                    GridFunctions.simulateCellKeydown(cell, 'Tab');
                    fix.detectChanges();

                    cell = grid.getCellByColumn(0, order[i]);
                    expect(cell.focused).toBe(true);
                    expect(cell.visibleColumnIndex).toBe(i);
                }
            });

            it(`Shift+Tab Navigation should move through each cell from the row once, moving through all cells with same rowStart,
            following the columnStart and column layout setup order,
            before moving on to the previous cell with smaller rowStart.`, () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid =  fix.componentInstance.grid;

                // focus last
                let cell = grid.getCellByColumn(0, 'PostalCode');
                cell.onFocus(focusEvent);
                fix.detectChanges();
                const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];

                const dataCols = grid.columns.filter(x => !x.columnLayout);
                // shift+tab through all data cols and check cells are selected/focused.
                for (let i = dataCols.length - 2; i >= 0; i--) {
                    GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                    fix.detectChanges();

                    cell = grid.getCellByColumn(0, order[i]);
                    expect(cell.focused).toBe(true);
                    expect(cell.visibleColumnIndex).toBe(i);
                }
            });

            it('Tab/Shift+Tab Navigation should allow moving to next/prev row when at last/first cell.',  () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid =  fix.componentInstance.grid;

                // focus 1st cell in 2nd row
                let cell = grid.getCellByColumn(1, 'ID');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // shift + tab into prev row
                GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                fix.detectChanges();

                cell = grid.getCellByColumn(0, 'PostalCode');
                expect(cell.focused).toBe(true);
                expect(cell.visibleColumnIndex).toBe(6);

                // tab into next row
                GridFunctions.simulateCellKeydown(cell, 'Tab');
                fix.detectChanges();

                cell = grid.getCellByColumn(1, 'ID');
                expect(cell.focused).toBe(true);
                expect(cell.visibleColumnIndex).toBe(0);
            });

            it(`should navigate to the first cell from the layout by pressing Ctrl + Arrow Left key
                and then Arrow Up + Down to same cell`, () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const firstRowCell = rows[1].queryAll(By.css(CELL_CSS_CLASS));
                const lastCell = firstRowCell[firstRowCell.length - 1];

                lastCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(lastCell.componentInstance, 'ArrowLeft', false, false, true);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
            });

            it('should navigate using Arrow Left through bigger cell with same rowStart but bigger row span', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                [thirdCell, secondCell, firstCell ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
            });

            it('should navigate using Arrow Left through bigger cell with smaller rowStart and bigger rowEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                let dummyCell;
                let firstCell;
                let secondCell;
                let thirdCell;
                [
                    thirdCell, secondCell, dummyCell,
                    dummyCell,              firstCell
                ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
            });

            it('should navigate using Arrow Right through bigger cell with same rowStart but bigger row', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                [firstCell, secondCell, thirdCell ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate using Arrow Right through bigger cell with smaller rowStart and bigger rowEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                let dummyCell;
                let firstCell;
                let secondCell;
                let thirdCell;
                [
                    dummyCell, secondCell, thirdCell,
                    firstCell,              dummyCell
                ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate using Arrow Down through cell with same colStart but bigger colEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                let dummyCell;
                let firstCell;
                let secondCell;
                let thirdCell;
                [
                    dummyCell, firstCell, dummyCell,
                    dummyCell,            dummyCell,
                    dummyCell, secondCell           ,
                    dummyCell, thirdCell, dummyCell
                ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it('should navigate using Arrow Down through cell with smaller colStart and bigger colEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                let dummyCell;
                let firstCell;
                let secondCell;
                let thirdCell;
                let fourthCell;
                [
                    dummyCell, fourthCell, dummyCell,
                    dummyCell,              firstCell,
                    dummyCell, secondCell           ,
                    dummyCell, dummyCell, thirdCell
                ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate using Arrow Up through cell with smaller colStart and bigger colEnd', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1 },
                        { field: 'CompanyName', rowStart: 1, colStart: 2, rowEnd: 3 },
                        { field: 'ContactName', rowStart: 1, colStart: 3 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 3, colStart: 1 },
                        { field: 'Address', rowStart: 3, colStart: 2, colEnd: 4 },
                    ]
                }];
                fix.detectChanges();

                let dummyCell;
                let firstCell;
                let secondCell;
                let thirdCell;
                [
                    dummyCell, dummyCell,   dummyCell,
                    dummyCell,              thirdCell,
                    dummyCell, secondCell           ,
                    dummyCell, dummyCell,  firstCell
                ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate correctly by pressing Ctrl + ArrowUp/ArrowDown key', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 }
                    ]
                }];
                fix.detectChanges();

                let firstCell;
                let secondCell;
                let thirdCell;
                [
                    firstCell, secondCell,
                    thirdCell,
                ] = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));

                thirdCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateCellKeydown(thirdCell.componentInstance, 'ArrowDown', false, false, true);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value)
                    .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowUp', false, false, true);
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactTitle);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
            });

            it('should navigate correctly with column group is hidden.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid =  fix.componentInstance.grid;
                // hide second group
                const secondGroup = grid.getColumnByName('group2');
                secondGroup.hidden = true;
                fix.detectChanges();

                // check visible indexes are correct
                expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(0);
                expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(1);
                expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(2);
                // focus last
                let cell = grid.getCellByColumn(0, 'Address');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // shift+tab
                GridFunctions.simulateCellKeydown(cell, 'tab', false, true);
                fix.detectChanges();
                // check correct cell has focus
                cell = grid.getCellByColumn(0, 'ID');
                expect(cell.focused).toBe(true);

                // tab
                GridFunctions.simulateCellKeydown(cell, 'tab');
                fix.detectChanges();
                // check correct cell has focus
                cell = grid.getCellByColumn(0, 'Address');
                expect(cell.focused).toBe(true);

                // arrow left
                GridFunctions.simulateCellKeydown(cell, 'ArrowLeft');
                fix.detectChanges();

                // check correct cell has focus
                cell = grid.getCellByColumn(0, 'ID');
                expect(cell.focused).toBe(true);

                // arrow right
                GridFunctions.simulateCellKeydown(cell, 'ArrowRight');
                fix.detectChanges();

                // check correct cell has focus
                expect(grid.getCellByColumn(0, 'Address').focused).toBe(true);
            });
        });

        describe('GroupBy Integration', () => {
            it('should allow navigation through group rows with arrow keys starting from group row.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                // group by city
                const grid =  fix.componentInstance.grid;
                grid.groupBy({
                    fieldName: 'City',
                    dir: SortingDirection.Asc,
                    ignoreCase: true,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                let groupRow = (<any>grid.getRowByIndex(0)) as IgxGridGroupByRowComponent;

                // arrow down
                GridFunctions.simulateGroupRowKeydown(groupRow, 'ArrowDown');
                fix.detectChanges();

                // check first data cell is focused
                let cell = grid.getCellByColumn(1, 'ID');
                expect(cell.focused).toBe(true);

                // arrow down
                GridFunctions.simulateCellKeydown(cell, 'ArrowDown');
                fix.detectChanges();

                // check next group row is focused
                groupRow = (<any>grid.getRowByIndex(2)) as IgxGridGroupByRowComponent;
                expect(groupRow.focused).toBe(true);

                // arrow up
                GridFunctions.simulateGroupRowKeydown(groupRow, 'ArrowUp');
                fix.detectChanges();
                // check prev cell is focused
                cell = grid.getCellByColumn(1, 'ID');
                expect(cell.focused).toBe(true);

                // arrow up
                GridFunctions.simulateCellKeydown(cell, 'ArrowUp');
                fix.detectChanges();

                // check first group row is focused
                groupRow = (<any>grid.getRowByIndex(0)) as IgxGridGroupByRowComponent;
                expect(groupRow.focused).toBe(true);
            });

            it('should allow navigation through group rows with arrow keys starting from middle of grid row', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];

                fix.detectChanges();
                // group by city
                const grid =  fix.componentInstance.grid;
                grid.height = '700px';
                grid.groupBy({
                    fieldName: 'City',
                    dir: SortingDirection.Asc,
                    ignoreCase: true,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                const firstBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[0].queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   dummyCell               ,
                    dummyCell  , dummyCell  ,
                    firstCell               ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   secondCell               ,
                    dummyCell  , dummyCell  ,
                    dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                // arrow down
                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                // check next group row is focused
                let groupRow = (<any>grid.getRowByIndex(2)) as IgxGridGroupByRowComponent;
                expect(groupRow.focused).toBe(true);

                // arrow down
                GridFunctions.simulateGroupRowKeydown(groupRow, 'ArrowDown');
                fix.detectChanges();

                // check first data cell is focused
                expect(fix.componentInstance.selectedCell.value).toEqual('Maria Anders');
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
                expect(document.activeElement).toEqual(secondCell.nativeElement);

                // arrow up
                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                // check group row is focused
                groupRow = (<any>grid.getRowByIndex(2)) as IgxGridGroupByRowComponent;
                expect(groupRow.focused).toBe(true);

                // arrow up
                GridFunctions.simulateGroupRowKeydown(groupRow, 'ArrowUp');
                fix.detectChanges();

                // check last cell in group 1 layout is focused
                expect(fix.componentInstance.selectedCell.value).toEqual('Order Administrator');
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
                expect(document.activeElement).toEqual(firstCell.nativeElement);
            });

            it('should allow navigation through group rows with Tab/Shift+Tab key', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                // group by city
                const grid =  fix.componentInstance.grid;
                grid.height = '700px';
                grid.groupBy({
                    fieldName: 'City',
                    dir: SortingDirection.Asc,
                    ignoreCase: true,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                const firstBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[0].queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   dummyCell               ,
                    dummyCell  , dummyCell  ,
                    firstCell               ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   secondCell  ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                // Tab
                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'Tab');
                fix.detectChanges();

                // check next group row is focused
                let groupRow = (<any>grid.getRowByIndex(2)) as IgxGridGroupByRowComponent;
                expect(groupRow.focused).toBe(true);

                // Tab
                GridFunctions.simulateGroupRowKeydown(groupRow, 'Tab');
                fix.detectChanges();

                // check first data cell is focused
                expect(fix.componentInstance.selectedCell.value).toEqual('ALFKI');
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
                expect(document.activeElement).toEqual(secondCell.nativeElement);

                // Shift + Tab
                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'Tab', false, true);
                fix.detectChanges();

                // check group row is focused
                groupRow = (<any>grid.getRowByIndex(2)) as IgxGridGroupByRowComponent;
                expect(groupRow.focused).toBe(true);

                // Shift + Tab
                GridFunctions.simulateGroupRowKeydown(groupRow, 'Tab', false, true);
                fix.detectChanges();

                // check last cell in group 1 layout is focused
                expect(fix.componentInstance.selectedCell.value).toEqual('Order Administrator');
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactTitle');
                expect(document.activeElement).toEqual(firstCell.nativeElement);
            });
        });

        describe('Column Moving Integration', () => {
            it('tab navigation should follow correct sequence if a column is moved.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid =  fix.componentInstance.grid;
                // move second group
                const col1 = grid.getColumnByName('group3');
                const col2 = grid.getColumnByName('group1');
                grid.moveColumn(col2, col1);
                fix.detectChanges();

                // check visible indexes are correct
                expect(grid.getCellByColumn(0, 'ContactName').visibleColumnIndex).toBe(0);
                expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(1);
                expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(2);
                expect(grid.getCellByColumn(0, 'Phone').visibleColumnIndex).toBe(3);
                expect(grid.getCellByColumn(0, 'City').visibleColumnIndex).toBe(4);
                expect(grid.getCellByColumn(0, 'ContactTitle').visibleColumnIndex).toBe(5);
                expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(6);
            });
        });

        describe('Pinning integration', () => {
            it('tab navigation should follow correct sequence if a column is pinned runtime.', () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();
                const grid =  fix.componentInstance.grid;
                // hide second group
                const secondGroup = grid.getColumnByName('group2');
                secondGroup.pinned = true;
                fix.detectChanges();

                // check visible indexes are correct
                expect(grid.getCellByColumn(0, 'ContactName').visibleColumnIndex).toBe(0);
                expect(grid.getCellByColumn(0, 'ID').visibleColumnIndex).toBe(1);
                expect(grid.getCellByColumn(0, 'Address').visibleColumnIndex).toBe(2);
                expect(grid.getCellByColumn(0, 'Phone').visibleColumnIndex).toBe(3);
                expect(grid.getCellByColumn(0, 'City').visibleColumnIndex).toBe(4);
                expect(grid.getCellByColumn(0, 'ContactTitle').visibleColumnIndex).toBe(5);
                expect(grid.getCellByColumn(0, 'PostalCode').visibleColumnIndex).toBe(6);
            });

            it('should navigate left from unpinned to pinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
                const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   secondCell
                                            ,
                    dummyCell  , dummyCell ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   dummyCell               ,
                    firstCell  , dummyCell  ,
                    dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowLeft');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
                expect(document.activeElement).toEqual(secondCell.nativeElement);
            });

            it('should navigate down to next row inside pinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   dummyCell               ,
                    firstCell  , dummyCell ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   secondCell               ,
                    dummyCell  , dummyCell ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
                expect(document.activeElement).toEqual(secondCell.nativeElement);
            });

            it('should navigate down to next row inside unpinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   firstCell               ,
                    secondCell  , dummyCell ,
                    firstCell               ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   secondCell               ,
                    dummyCell  , dummyCell  ,
                    dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
                expect(document.activeElement).toEqual(secondCell.nativeElement);
            });

            it('should navigate up to next row inside pinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[0];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[0];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   dummyCell               ,
                    secondCell  , dummyCell ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   firstCell               ,
                    dummyCell  , dummyCell ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Region);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Region');
                expect(document.activeElement).toEqual(secondCell.nativeElement);
            });

            it('should navigate up to next row inside unpinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.queryAll(By.css('igx-grid-row'))[1].queryAll(By.css(CELL_BLOCK))[1];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   dummyCell               ,
                    dummyCell  , dummyCell  ,
                    secondCell              ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   firstCell               ,
                    dummyCell  , dummyCell  ,
                    dummyCell               ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowUp');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');
                expect(document.activeElement).toEqual(secondCell.nativeElement);
            });

            it('should navigate up to next row inside unpinned area when pinning second block in template', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 },
                        ]
                    },
                    {
                        group: 'group2',
                        pinned: true,
                        columns: [
                            { field: 'Col1', rowStart: 1, colStart: 1 },
                            { field: 'Col2', rowStart: 1, colStart: 2 },
                            { field: 'Col3', rowStart: 1, colStart: 3 },
                            { field: 'City', rowStart: 2, colStart: 1, colEnd: 4, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2, colEnd: 4 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '1000px';
                fix.detectChanges();
                const firstBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[2];
                let dummyCell;
                let firstCell;
                let secondCell;
                [   dummyCell               ,
                    dummyCell  , firstCell  ,
                    dummyCell              ] = firstBlock.queryAll(By.css(CELL_CSS_CLASS));
                [   dummyCell,
                    secondCell,
                    dummyCell   ] = secondBlock.queryAll(By.css(CELL_CSS_CLASS));

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');
                expect(document.activeElement).toEqual(secondCell.nativeElement);
            });
        });

        describe('Row Edit integration', () => {
            it('shift+tab navigation should go through edit row buttons when navigating in row edit mode. ', () => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                            { field: 'ContactName', rowStart: 2, colStart: 1, editable: true  },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true  },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true  }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                            { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                            { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                            { field: 'Fax', rowStart: 2, colStart: 1, editable: true  },
                            { field: 'ID', rowStart: 3, colStart: 1, editable: true  }
                        ]
                    }
                ];
                fix.detectChanges();

                const grid = fix.componentInstance.grid;
                grid.primaryKey = 'ID';
                grid.rowEditable = true;
                fix.detectChanges();

                let targetCell = grid.getCellByColumn(0, 'CompanyName');
                targetCell.nativeElement.focus();
                fix.detectChanges();
                targetCell.onKeydownEnterEditMode();
                fix.detectChanges();

                const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
                const doneButtonElement = rowEditingBannerElement.lastElementChild;
                const cancelButtonElement = rowEditingBannerElement.firstElementChild;

                // shift+tab into Done button
                GridFunctions.simulateCellKeydown(targetCell, 'Tab', false, true);
                fix.detectChanges();
                expect(document.activeElement).toEqual(doneButtonElement);

                // shift+ tab into Cancel
                UIInteractions.triggerKeyDownWithBlur('tab', doneButtonElement, true, false, true);
                fix.detectChanges();

                // shift+ tab into last cell
                UIInteractions.triggerKeyDownWithBlur('tab', cancelButtonElement, true, false, true);
                fix.detectChanges();

                targetCell = grid.getCellByColumn(0, 'PostalCode');
                expect(targetCell.focused).toBe(true);
            });
        });
    });


    // Note: Some tests execute await wait() and etc two times, because the grid scrolls two times.
    // This means that we need to wait onChunkLoad event from the igxForOf two times.
    describe('Navigation with scrolling', () => {
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    ColumnLayoutTestComponent
                ],
                imports: [NoopAnimationsModule, IgxGridModule],
                providers: [{ provide: NgZone, useFactory: () => zone = new TestNgZone() }]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(ColumnLayoutTestComponent);
        });

        describe('General', () => {
            it('should allow navigating down with scrolling', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        { field: 'Phone', rowStart: 1, colStart: 1 },
                        { field: 'City', rowStart: 1, colStart: 2 },
                        { field: 'ContactName', rowStart: 2, colStart: 1, colEnd: 3 }
                    ]
                }];
                fix.detectChanges();
                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const penultRowCells = rows[rows.length - 2].queryAll(By.css(CELL_CSS_CLASS));
                const secondCell = penultRowCells[1];
                const rowIndex = parseInt(secondCell.nativeElement.getAttribute('data-rowindex'), 10);

                secondCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowDown');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowDown');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[rowIndex + 1].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');
            });

            it('should navigate to the last cell from the layout by pressing Home/End or Ctrl + ArrowLeft/ArrowRight key', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'end');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'home');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowLeft', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it('should navigate to the last cell from the first/last layout by pressing Ctrl + Home/End key', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'end', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value)
                    .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'home', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it(`should navigate to the last cell from the layout by pressing Home/End or Ctrl + ArrowLeft/ArrowRight key
                    and keep same rowStart from the first selection when last cell spans more rows`, async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                // last cell from first layout
                const lastCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

                lastCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(lastCell.componentInstance, 'end');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'home');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');

                GridFunctions.simulateCellKeydown(lastCell.componentInstance, 'ArrowRight', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateCellKeydown(lastCell.componentInstance, 'ArrowLeft', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Address);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Address');
            });

            it(`should navigate to the last cell from the layout by pressing Home/End and Ctrl key
                and keep same rowStart from the first selection when last cell spans more rows`, async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                // last cell from first layout
                const lastCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

                lastCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(lastCell.componentInstance, 'end', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value)
                    .toEqual(fix.componentInstance.data[fix.componentInstance.data.length - 1].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'home', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it(`should navigate to the last cell from the layout by pressing Ctrl + Arrow Right key
                and then Arrow Down + Up to same cell`, async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowDown');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowUp');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it(`should navigate to the last cell from the layout by pressing Ctrl + Arrow Right key
                and then Arrow Up + Down to same cell`, async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    hidden: true,
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }, {
                    group: 'group4',
                    columns: [
                        { field: 'Country', rowStart: 1, colStart: 1 },
                        { field: 'Phone', rowStart: 1, colStart: 2 },
                        { field: 'Fax', rowStart: 2, colStart: 1, colEnd: 3, rowEnd: 4 }
                    ]
                }];
                fix.detectChanges();
                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const firstCell = rows[2].queryAll(By.css(CELL_CSS_CLASS))[0];

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowUp');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowDown');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[1].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
            });

            it('Tab Navigation should work in grid with horizontal virtualization.',  async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();

                const grid =  fix.componentInstance.grid;
                grid.columnWidth = '300px';
                grid.width = '300px';
                setupGridScrollDetection(fix, grid);
                fix.detectChanges();

                const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];

                // focus 1st
                let cell = grid.getCellByColumn(0, 'ID');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                const dataCols = grid.columns.filter(x => !x.columnLayout);
                // tab thorugh all data cols and check cells are selected/focused.
                for (let i = 1; i < dataCols.length; i++) {
                GridFunctions.simulateCellKeydown(cell, 'Tab');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                cell = grid.getCellByColumn(0, order[i]);
                expect(cell.focused).toBe(true);
                expect(cell.visibleColumnIndex).toBe(i);
            }
            });

            it('Shift+Tab Navigation should work in grid with horizontal virtualization.',  async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                const grid =  fix.componentInstance.grid;
                setupGridScrollDetection(fix, grid);
                grid.columnWidth = '300px';
                grid.width = '300px';
                fix.detectChanges();

                const forOfDir = grid.headerContainer;
                forOfDir.scrollTo(2);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                const dataCols = grid.columns.filter(x => !x.columnLayout);
                const order = ['ID', 'ContactName', 'Address', 'Phone', 'City', 'ContactTitle', 'PostalCode'];
                // focus last
                let cell = grid.getCellByColumn(0, 'PostalCode');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // shift+tab through all data cols and check cells are selected/focused.
                for (let j = dataCols.length - 2; j >= 0; j--) {
                    GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                    await wait(DEBOUNCETIME);
                    zone.simulateOnStable();
                    fix.detectChanges();

                    cell = grid.getCellByColumn(0, order[j]);
                    expect(cell.focused).toBe(true);
                    expect(cell.visibleColumnIndex).toBe(j);
                }
            });

            it('Shift+Tab Navigation should scroll last cell fully in view.',  async () => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }];
                const grid =  fix.componentInstance.grid;
                setupGridScrollDetection(fix, grid);
                grid.columnWidth = '300px';
                grid.width = '300px';
                fix.detectChanges();

                // focus 1st in 2nd row
                const cell = grid.getCellByColumn(1, 'ID');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // shift + tab
                GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                const lastCell = grid.getCellByColumn(0, 'ContactTitle');
                expect(lastCell.focused).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(600);
                // check if cell right edge is visible
                const diff = lastCell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
                expect(diff).toBe(0);
            });

            it('Shift + tab navigation should scroll to the appropriate cell', async() => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1', pinned: true,
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                            { field: 'ContactName', rowStart: 2, colStart: 1, editable: false  },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true  },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true  }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                            { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                            { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                            { field: 'Fax', rowStart: 2, colStart: 1, editable: true  },
                            { field: 'ID', rowStart: 3, colStart: 1, editable: true  }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '500px';
                fix.detectChanges();

                const rows = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
                const firstRowCells = rows[1].queryAll(By.css(CELL_CSS_CLASS));
                const secondRowCells = rows[2].queryAll(By.css(CELL_CSS_CLASS));

                secondRowCells[0].triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondRowCells[0].componentInstance, 'Tab', false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ID);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ID');
                expect(document.activeElement).toEqual(firstRowCells[firstRowCells.length - 1].nativeElement);
            });

            it('should scroll focused cell fully in view when navigating with arrow keys and row is partially visible.', async() => {
                fix.componentInstance.colGroups = [
                {
                    group: 'group1',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                },
                {
                    group: 'group2',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                },
                {
                    group: 'group3',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }];
                const grid = fix.componentInstance.grid;
                grid.height = '400px';
                setupGridScrollDetection(fix, grid);
                fix.detectChanges();

                // focus 3rd row, first cell
                let cell = grid.getCellByColumn(2, 'ContactName');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // arrow down
                GridFunctions.simulateCellKeydown(cell, 'ArrowDown');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                // check next cell is focused and is fully in view
                cell = grid.getCellByColumn(2, 'Phone');
                expect(cell.focused).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50);
                let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
                expect(diff).toBe(0);

                // focus 1st row, 2nd cell
                cell = grid.getCellByColumn(0, 'Phone');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // arrow up
                GridFunctions.simulateCellKeydown(cell, 'ArrowUp');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                // check next cell is focused and is fully in view
                cell = grid.getCellByColumn(0, 'ContactName');
                expect(cell.focused).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBe(0);
                diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
                expect(diff).toBe(0);

                // focus 3rd row, first cell
                cell = grid.getCellByColumn(2, 'ContactName');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // arrow right
                GridFunctions.simulateCellKeydown(cell, 'ArrowRight');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                // check next cell is focused and is fully in view
                cell = grid.getCellByColumn(2, 'Address');
                expect(cell.focused).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50);
                diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
                expect(diff).toBe(0);

                // focus 1st row, Address
                cell = grid.getCellByColumn(0, 'Address');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // arrow left
                GridFunctions.simulateCellKeydown(cell, 'ArrowLeft');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                // check next cell is focused and is fully in view
                cell = grid.getCellByColumn(0, 'ContactName');
                expect(cell.focused).toBe(true);
                expect(grid.verticalScrollContainer.getScroll().scrollTop).toBe(0);
                diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
                expect(diff).toBe(0);
            });

            it('should scroll focused cell fully in view when navigating with arrow keys and column is partially visible.', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 5 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 2, colStart: 3 },
                        { field: 'Country', rowStart: 2, colStart: 4 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 5 }
                    ]
                }];
                const grid =  fix.componentInstance.grid;
                grid.columnWidth = '300px';
                grid.width = '300px';
                setupGridScrollDetection(fix, grid);
                fix.detectChanges();

                // focus 1st row, 2nd row cell
                let cell = grid.getCellByColumn(0, 'Phone');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                // arrow right
                GridFunctions.simulateCellKeydown(cell, 'ArrowRight');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                // check next cell is focused
                cell = grid.getCellByColumn(0, 'City');
                expect(cell.focused).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(300);
                let diff = cell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
                expect(diff).toBe(0);

                // arrow left
                GridFunctions.simulateCellKeydown(cell, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                // check next cell is focused
                cell = grid.getCellByColumn(0, 'Phone');
                expect(cell.focused).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBe(0);
                diff = cell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
                expect(diff).toBe(0);
            });

            it(`should navigate to the last cell from the layout by pressing Ctrl + ArrowLeft/ArrowRight key
            in grid with horizontal virtualization`, async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                const grid =  fix.componentInstance.grid;
                grid.columnWidth = '300px';
                grid.width = '400px';
                setupGridScrollDetection(fix, grid);
                fix.detectChanges();

                let firstCell = grid.getCellByColumn(0, 'ID');

                firstCell.onFocus(focusEvent);
                fix.detectChanges();

                // ctrl+arrow right
                GridFunctions.simulateCellKeydown(firstCell, 'ArrowRight', false, false, true);
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                // check correct cell is focused and is fully in view
                const lastCell =  grid.getCellByColumn(0, 'Address');
                expect(lastCell.focused).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(800);
                let diff = lastCell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
                expect(diff).toBe(0);

                // ctrl+arrow left
                GridFunctions.simulateCellKeydown(lastCell, 'ArrowLeft', false, false, true);
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                // first cell should be focused and is fully in view
                firstCell = grid.getCellByColumn(0, 'ID');
                expect(firstCell.focused).toBe(true);
                expect(grid.headerContainer.getScroll().scrollLeft).toBe(0);
                diff = firstCell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
                expect(diff).toBe(0);
            });
        });

        describe('Pinning', () => {
            it('should navigate from pinned to unpinned area and backwards', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            xit('when navigating from pinned to unpinned area cell should be fully scrolled in view.', async() => {
                pending('This should be tested in the e2e test');
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    // row span 3
                    columns: [
                        { field: 'ID', rowStart: 1, colStart: 1, rowEnd: 4 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        // col span 2
                        { field: 'ContactName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'Phone', rowStart: 2, colStart: 1 },
                        { field: 'City', rowStart: 2, colStart: 2 },
                        // col span 2
                        { field: 'ContactTitle', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group3',
                    columns: [
                        // row span 2
                        { field: 'Address', rowStart: 1, colStart: 1, rowEnd: 3 },
                        { field: 'PostalCode', rowStart: 3, colStart: 1 }
                    ]
                }];
                fix.detectChanges();

                const grid =  fix.componentInstance.grid;
                grid.columnWidth = '300px';
                grid.width = '500px';
                setupGridScrollDetection(fix, grid);
                fix.detectChanges();

                // pin col
                grid.getColumnByName('ID').pinned = true;
                fix.detectChanges();

                // scroll right
                grid.headerContainer.getScroll().scrollLeft = 800;
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                // focus first pinned cell
                const firstCell = grid.getCellByColumn(0, 'ID');

                firstCell.onFocus(focusEvent);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                // arrow right
                GridFunctions.simulateCellKeydown(firstCell, 'ArrowRight');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                // check if first unpinned cell is focused and is in view
                let firstUnpinnedCell = grid.getCellByColumn(0, 'ContactName');
                expect(firstUnpinnedCell.focused).toBe(true);
                let diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
                grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
                expect(diff).toBe(0);

                // arrow left
                GridFunctions.simulateCellKeydown(firstUnpinnedCell, 'ArrowLeft');
                fix.detectChanges();

                expect(firstCell.focused).toBe(true);

                // scroll right
                grid.headerContainer.getScroll().scrollLeft = 800;
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell, 'Tab');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                firstUnpinnedCell = grid.getCellByColumn(0, 'ContactName');
                expect(firstUnpinnedCell.focused).toBe(true);
                diff = firstUnpinnedCell.nativeElement.getBoundingClientRect().left -
                grid.pinnedWidth - grid.tbody.nativeElement.getBoundingClientRect().left;
                expect(diff).toBe(0);
            });

            it('should navigate to unpinned area when the column layout is bigger than the display container', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const firstCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowLeft');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].CompanyName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('CompanyName');
            });

            it('should navigate from pinned to unpinned area and backwards using Home/End', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                fix.detectChanges();
                const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

                secondCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'End');
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'Home');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate from pinned to unpinned area and backwards using Ctrl+Left/Right', async() => {
                fix.componentInstance.colGroups = [{
                    group: 'group1',
                    pinned: true,
                    columns: [
                        { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3 },
                        { field: 'ContactName', rowStart: 2, colStart: 1 },
                        { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                    ]
                }, {
                    group: 'group2',
                    columns: [
                        { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3 },
                        { field: 'Region', rowStart: 3, colStart: 1 },
                        { field: 'PostalCode', rowStart: 3, colStart: 2 }
                    ]
                }];
                fix.detectChanges();
                const secondCell = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

                secondCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowRight', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].City);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('City');

                GridFunctions.simulateCellKeydown(fix.componentInstance.selectedCell, 'ArrowLeft', false, false, true);
                await wait();
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].ContactName);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('ContactName');
            });

            it('should navigate to the last block with one pinned group and unpinned area has scrollbar', async() => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        pinned: true,
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px' },
                            { field: 'ContactName', rowStart: 2, colStart: 1 },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2 },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3 }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px' },
                            { field: 'Region', rowStart: 3, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 2 }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px' },
                            { field: 'Fax', rowStart: 2, colStart: 1 },
                            { field: 'PostalCode', rowStart: 3, colStart: 1 }
                        ]
                    }
                ];
                fix.componentInstance.grid.width = '600px';
                fix.detectChanges();
                const secondBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[1];
                const thirdBlock = fix.debugElement.query(By.css('igx-grid-row')).queryAll(By.css(CELL_BLOCK))[2];

                let secondCell;
                let thirdCell;
                let fourthCell;
                [   secondCell,
                    thirdCell,
                    fourthCell  ] = thirdBlock.queryAll(By.css(CELL_CSS_CLASS));
                const firstCell = secondBlock.queryAll(By.css(CELL_CSS_CLASS))[0];

                fix.componentInstance.grid.headerContainer.getScroll().scrollLeft = 500;
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                firstCell.triggerEventHandler('focus', null);
                fix.detectChanges();

                GridFunctions.simulateCellKeydown(firstCell.componentInstance, 'ArrowRight');
                await wait(DEBOUNCETIME);
                zone.simulateOnStable();
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Phone);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Phone');
                expect(document.activeElement).toEqual(secondCell.nativeElement);

                GridFunctions.simulateCellKeydown(secondCell.componentInstance, 'ArrowDown');
                fix.detectChanges();

                expect(fix.componentInstance.selectedCell.value).toEqual(fix.componentInstance.data[0].Fax);
                expect(fix.componentInstance.selectedCell.column.field).toMatch('Fax');
                expect(document.activeElement).toEqual(thirdCell.nativeElement);
            });
        });

        describe('Row Edit', () => {
            it('tab navigation should should skip non-editable cells when navigating in row edit mode. ', async() => {
                fix.componentInstance.colGroups = [
                    {
                        group: 'group1',
                        columns: [
                            { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, width: '300px', editable: true },
                            { field: 'ContactName', rowStart: 2, colStart: 1, editable: false  },
                            { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true  },
                            { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true  }
                        ]
                    },
                    {
                        group: 'group2',
                        columns: [
                            { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                            { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                            { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                        ]
                    },
                    {
                        group: 'group3',
                        columns: [
                            { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                            { field: 'Fax', rowStart: 2, colStart: 1, editable: true  },
                            { field: 'ID', rowStart: 3, colStart: 1, editable: true  }
                        ]
                    }
                ];
                fix.detectChanges();

                const grid = fix.componentInstance.grid;
                grid.primaryKey = 'ID';
                grid.rowEditable = true;
                fix.detectChanges();

                let cell = grid.getCellByColumn(0, 'CompanyName');
                cell.onFocus(focusEvent);
                fix.detectChanges();

                cell.onKeydownEnterEditMode();
                fix.detectChanges();

                const order = ['CompanyName', 'City', 'Phone', 'ContactTitle'];
                // tab through cols and check order is correct - ContactName should be skipped.
                for (let i = 1; i < order.length; i++) {
                    GridFunctions.simulateCellKeydown(cell, 'Tab');
                    await wait();
                    zone.simulateOnStable();
                    fix.detectChanges();

                    GridFunctions.simulateCellKeydown(cell, 'Tab');
                    await wait();
                    zone.simulateOnStable();
                    fix.detectChanges();

                    cell = grid.getCellByColumn(0, order[i]);
                    expect(cell.editMode).toBe(true);
                }

                // shift+tab through  cols and check order is correct - ContactName should be skipped.
                for (let j = order.length - 2; j >= 0; j--) {
                    GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
                    await wait();
                    zone.simulateOnStable();
                    fix.detectChanges();

                    await wait();
                    zone.simulateOnStable();
                    fix.detectChanges();

                    cell = grid.getCellByColumn(0, order[j]);
                    expect(cell.editMode).toBe(true);
                }
            });
        });
    });
});

describe('Method navigateTo', () => {
    let fix: ComponentFixture<ColumnLayoutTestComponent>;

    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayoutTestComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(ColumnLayoutTestComponent);
    });

    it('navigateTo method should work in multi-row layout grid.', async () => {
        fix.componentInstance.colGroups = [
            {
                group: 'group1',
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: false, width: '100px'  },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true, width: '100px'  },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true, width: '100px'  }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true, width: '200px' },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true, width: '200px'  }
                ]
            }
        ];
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.width = '500px';
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        // navigate down to cell in a row that is in the DOM but is not in view (half-visible row)
        let col = grid.getColumnByName('ContactTitle');
        grid.navigateTo(2, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at bottom of grid
        let cell =  grid.getCellByColumn(2, 'ContactTitle');
        expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50);
        let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        // there is 2px border at the bottom now
        expect(diff).toBe(0);

        // navigate up to cell in a row that is in the DOM but is not in view (half-visible row)
        col = grid.getColumnByName('CompanyName');
        grid.navigateTo(0, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at top of grid
        cell =  grid.getCellByColumn(0, 'CompanyName');
        expect(grid.verticalScrollContainer.getScroll().scrollTop).toBe(0);
        diff = cell.nativeElement.getBoundingClientRect().top - grid.tbody.nativeElement.getBoundingClientRect().top;
        expect(diff).toBe(0);
    });

    it('navigateTo method should work in multi-row layout grid when scrolling to bottom.', async () => {
        fix.componentInstance.colGroups = [
            {
                group: 'group1',
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3, editable: true },
                    { field: 'ContactName', rowStart: 2, colStart: 1, editable: false, width: '100px'  },
                    { field: 'ContactTitle', rowStart: 2, colStart: 2, editable: true, width: '100px'  },
                    { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3, editable: true, width: '100px'  }
                ]
            },
            {
                group: 'group2',
                columns: [
                    { field: 'City', rowStart: 1, colStart: 1, colEnd: 3, rowEnd: 3, width: '400px', editable: true  },
                    { field: 'Region', rowStart: 3, colStart: 1, editable: true  },
                    { field: 'PostalCode', rowStart: 3, colStart: 2, editable: true  }
                ]
            },
            {
                group: 'group3',
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1, width: '200px', editable: true  },
                    { field: 'Fax', rowStart: 2, colStart: 1, editable: true, width: '200px' },
                    { field: 'ID', rowStart: 3, colStart: 1, editable: true, width: '200px'  }
                ]
            }
        ];
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.width = '500px';
        setupGridScrollDetection(fix, grid);
        fix.detectChanges();

        // navigate to cell in a row is not in the DOM
        let col = grid.getColumnByName('CompanyName');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at bottom of grid
        let cell =  grid.getCellByColumn(10, 'CompanyName');
        expect(grid.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThan(50 * 10);
        let diff = cell.nativeElement.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom;
        // there is 2px border at the bottom now
        expect(diff).toBe(0);

        // navigate right to cell in column that is in DOM but is not in view
        col = grid.getColumnByName('City');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at right edge of grid
        cell =  grid.getCellByColumn(10, 'City');
        expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(100);
        // check if cell right edge is visible
        diff = cell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
        await wait();
        expect(diff).toBe(0);

        // navigate left to cell in column that is in DOM but is not in view
        col = grid.getColumnByName('CompanyName');
        grid.navigateTo(10, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at left edge of grid
        cell =  grid.getCellByColumn(10, 'CompanyName');
        expect(grid.headerContainer.getScroll().scrollLeft).toBe(0);
        // check if cell right left is visible
        diff = cell.nativeElement.getBoundingClientRect().left - grid.tbody.nativeElement.getBoundingClientRect().left;
        expect(diff).toBe(0);

        // navigate to cell in column that is not in DOM

        col = grid.getColumnByName('ID');
        grid.navigateTo(9, col.visibleIndex);
        await wait(DEBOUNCETIME);
        fix.detectChanges();

        await wait(DEBOUNCETIME);
        fix.detectChanges();

        // cell should be at right edge of grid
        cell =  grid.getCellByColumn(9, 'ID');
        expect(grid.headerContainer.getScroll().scrollLeft).toBeGreaterThan(250);
        // check if cell right right is visible
        diff = cell.nativeElement.getBoundingClientRect().right - grid.tbody.nativeElement.getBoundingClientRect().right;
        expect(diff).toBe(0);
    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px" (onSelection)="cellSelected($event)">
        <igx-column-layout *ngFor='let group of colGroups' [hidden]='group.hidden' [pinned]='group.pinned' [field]='group.group'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field' [editable]='col.editable'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayoutTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    grid: IgxGridComponent;
    public selectedCell: IgxGridCellComponent;
    cols: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1 },
        { field: 'CompanyName', rowStart: 1, colStart: 2 },
        { field: 'ContactName', rowStart: 1, colStart: 3 },
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd: 4 },
    ];
    colGroups: Array<any> = [
        {
            group: 'group1',
            columns: this.cols
        }
    ];
    data = SampleTestData.contactInfoDataFull();

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}
