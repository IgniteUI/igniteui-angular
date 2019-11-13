import { Component, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait} from '../../test-utils/ui-interactions.spec';
import { IgxGridModule } from './index';
import { IgxGridComponent } from './grid.component';
import { IgxGridRowComponent } from './grid-row.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridExpandableCellComponent } from './expandable-cell.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxInputGroupComponent } from '../../input-group';

const COLLAPSED_ICON_NAME = 'chevron_right';
const EXPANDED_ICON_NAME = 'expand_more';
const DEBOUNCETIME = 30;

describe('IgxGrid Master Detail #grid', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;

    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridMasterDetailComponent,
                AllExpandedGridMasterDetailComponent,
                MRLMasterDetailComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('Basic', () => {
        beforeEach(async(() => {
            fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should render an expand icon for all rows', () => {
            const expandIcons = grid.rowList.map((row) => {
                const icon = row.element.nativeElement.querySelector('igx-icon');
                if (icon.innerText === 'chevron_right') {
                    return icon;
                }
                return null;
            }).filter(icon => icon !== null);
            expect(grid.rowList.length).toEqual(expandIcons.length);
        });

        it('Should correctly expand a basic detail view, update expansionStates and the context provided should be correct', (async() => {
            await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);

            const firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(grid.rowList.first.rowID)).toBeTruthy();
            expect(firstRowIcon.innerText).toEqual(EXPANDED_ICON_NAME);
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
        }));

        it('Should render a detail view with dynamic elements and they should be clickable/focusable.', (async() => {
            await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);

            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            const checkboxElem = firstRowDetail.querySelector('igx-checkbox');
            const checkboxPos = checkboxElem.getBoundingClientRect();
            const inputElem = firstRowDetail.querySelector('.igxInputGroup');
            const inputElemPos = inputElem.getBoundingClientRect();

            const tracedCheckbox: any =
                document.elementFromPoint(checkboxPos.left + checkboxPos.height / 2, checkboxPos.top + checkboxPos.height / 2);
            const tracedInput: any =
                document.elementFromPoint(inputElemPos.left + inputElemPos.height / 2, inputElemPos.top + inputElemPos.height / 2);

            checkboxElem.querySelector('.igx-checkbox__input').click();
            fix.detectChanges();

            expect(checkboxElem.contains(tracedCheckbox)).toBeTruthy();
            expect(checkboxElem.firstElementChild.getAttribute('aria-checked')).toEqual('true');

            UIInteractions.clickElement(inputElem);
            fix.detectChanges();

            expect(inputElem.contains(tracedInput)).toBeTruthy();
            expect(document.activeElement).toEqual(tracedInput);
        }));

        it(`Should persist state of rendered templates, such as expansion state of expansion panel,
            checkbox state, etc. after scrolling them in and out of view.`, (async() => {
            await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);

            let firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            let checkboxElem = firstRowDetail.querySelector('igx-checkbox');
            let inputGroup = fix.debugElement.query(By.directive(IgxInputGroupComponent)).componentInstance;

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.checked).toBeFalsy();
            expect(inputGroup.input.value).toEqual('');
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');

            inputGroup.input.value = 'Test value';
            checkboxElem.firstElementChild.click();
            fix.detectChanges();

            grid.navigateTo(20);
            await wait(200);
            fix.detectChanges();

            expect(grid.rowList.first.rowID).toEqual('CENTC');

            grid.navigateTo(0);
            await wait(200);
            fix.detectChanges();

            firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            checkboxElem = firstRowDetail.querySelector('igx-checkbox');
            inputGroup = fix.debugElement.query(By.directive(IgxInputGroupComponent)).componentInstance;

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.firstElementChild.getAttribute('aria-checked')).toEqual('true');
            expect(inputGroup.input.value).toEqual('Test value');
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
        }));

        it(`Should persist state of rendered templates, such as expansion state of expansion panel,
            checkbox state, etc. after scrolling them in and out of view.`, (async() => {
            await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);

            let firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            let checkboxElem = firstRowDetail.querySelector('igx-checkbox');
            let inputGroup = fix.debugElement.query(By.directive(IgxInputGroupComponent)).componentInstance;

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.checked).toBeFalsy();
            expect(inputGroup.input.value).toEqual('');
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');

            inputGroup.input.value = 'Test value';
            checkboxElem.firstElementChild.click();
            fix.detectChanges();

            await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);
            fix.detectChanges();

            await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);
            fix.detectChanges();

            firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            checkboxElem = firstRowDetail.querySelector('igx-checkbox');
            inputGroup = fix.debugElement.query(By.directive(IgxInputGroupComponent)).componentInstance;

            expect(grid.rowList.first.rowID).toEqual('ALFKI');
            expect(checkboxElem.firstElementChild.getAttribute('aria-checked')).toEqual('true');
            expect(inputGroup.input.value).toEqual('Test value');
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
        }));

        it(`Should persist state of rendered templates, such as expansion state of expansion panel,
            checkbox state, etc. after scrolling them in and out of view.`, (async() => {

            const verticalScrollbar = grid.verticalScrollContainer.getScroll();
            const verticalSrollHeight = verticalScrollbar.firstChild.offsetHeight;

            grid.navigateTo(26);
            await wait(200);
            fix.detectChanges();

            await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.last, DEBOUNCETIME);
            await wait();
            fix.detectChanges();

            const lastRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.last);
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.last.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(grid.rowList.last.rowID)).toBeTruthy();
            expect(lastRowDetail.querySelector('.addressArea').innerText).toEqual('Via Monte Bianco 34');
            expect(verticalSrollHeight + lastRowDetail.offsetHeight).toEqual(verticalScrollbar.firstChild.offsetHeight);
        }));

        it('Should update view when setting a new expansionState object.', (async() => {
            const newExpanded = new Map<any, boolean>();
            newExpanded.set('ALFKI', true);
            newExpanded.set('ANTON', true);
            newExpanded.set('AROUT', true);

            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length);

            grid.expansionStates = newExpanded;
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const gridRows = grid.rowList.toArray();
            const firstDetail = GridFunctions.getMasterRowDetail(gridRows[0]);
            const secondDetail = GridFunctions.getMasterRowDetail(gridRows[2]);
            const thirdDetail = GridFunctions.getMasterRowDetail(gridRows[3]);
            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length + 3);
            expect(firstDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
            expect(secondDetail.querySelector('.addressArea').innerText).toEqual('Mataderos 2312');
            expect(thirdDetail.querySelector('.addressArea').innerText).toEqual('120 Hanover Sq.');
        }));

        it('Should update rendered detail templates after grid data is changed.', (async() => {
            const newExpanded = new Map<any, boolean>();
            newExpanded.set('ALFKI', true);
            newExpanded.set('ANTON', true);
            newExpanded.set('AROUT', true);

            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length);

            grid.expansionStates = newExpanded;
            fix.detectChanges();

            const newData = [...grid.data].slice(0, 4);
            newData.splice(1, 1);

            grid.data = newData;
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const gridRows = grid.rowList.toArray();
            const firstDetail = GridFunctions.getMasterRowDetail(gridRows[0]);
            const secondDetail = GridFunctions.getMasterRowDetail(gridRows[1]);
            const thirdDetail = GridFunctions.getMasterRowDetail(gridRows[2]);
            expect(grid.tbody.nativeElement.firstElementChild.children.length).toEqual(grid.rowList.length + 3);
            expect(firstDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
            expect(secondDetail.querySelector('.addressArea').innerText).toEqual('Mataderos 2312');
            expect(thirdDetail.querySelector('.addressArea').innerText).toEqual('120 Hanover Sq.');
        }));

        it('Should expand and collapse a row in view by using the expand(rowID) and collapse(rowID) methods.', () => {
            grid.expand(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            let firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.rowList.toArray()[0].expanded).toBeTruthy();
            expect(firstRowIcon.innerText).toEqual(EXPANDED_ICON_NAME);
            grid.collapse(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(grid.rowList.toArray()[0].expanded).toBeFalsy();
            expect(firstRowIcon.innerText).toEqual(COLLAPSED_ICON_NAME);
        });

        it('Should expand a row out of view by using the collapse() method and update expansionStates.', () => {
            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;
            grid.expand(lastDataRecID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.get(lastDataRecID)).toBeTruthy();
        });

        it('Should collapse a row out of view by using the collapse() method and update expansionStates.', () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            fix.detectChanges();
            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;
            grid.collapse(lastDataRecID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(fix.componentInstance.data.length);
            expect(grid.expansionStates.get(lastDataRecID)).toBeFalsy();
        });

        it('Should toggle a row expand state by using the toggleRow(rowID) method.', () => {
            grid.toggleRow(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.rowList.toArray()[0].expanded).toBeTruthy();
            grid.toggleRow(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(grid.rowList.toArray()[0].expanded).toBeFalsy();
        });

        it('Should expand all rows using the expandAll() method and the expansion state should be updated.', () => {
            grid.expandAll();
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(fix.componentInstance.data.length);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });
        });

        it('Should collapse all rows using the collapseAll() method and the expansion state should be updated.', () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            fix.detectChanges();
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });
            grid.collapseAll();
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(0);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeFalsy();
            });
        });
    });

    describe('Keyboard Navigation ', () => {
        beforeEach(async(() => {
            fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should navigate down through a detail view by focusing the whole row and continuing onto the next with arrow down.',
        async() => {
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            expect(document.activeElement).toBe(firstRowDetail);
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstRowDetail, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(grid.getCellByColumn(2, 'ContactName').selected).toBeTruthy();
        });

        it('Should navigate down through a detail view partially out of view by scrolling it so it becomes fully visible.', async() => {
            const row = grid.getRowByIndex(4) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(4, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate down through a detail view completely out of view by scrolling to it.', async() => {
            grid.navigateTo(6, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(6) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(6, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate up through a detail view by focusing the whole row and continuing onto the next with arrow up.', async() => {
            const prevRow = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(prevRow);
            expect(document.activeElement).toBe(detailRow);
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', detailRow, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(prevRow.cells.toArray()[0].selected).toBeTruthy();
        });

        it('Should navigate up through a detail view partially out of view by scrolling it so it becomes fully visible.', async() => {
            grid.verticalScrollContainer.addScrollTop(90);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(2);
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = row.element.nativeElement.previousElementSibling;
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate up through a detail view completely out of view by scrolling to it.', async() => {
            grid.verticalScrollContainer.addScrollTop(170);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(2);
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = row.element.nativeElement.previousElementSibling;
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it(`Should focus detail row first, then continue to the focusable elements in
         it and continue onto the next row when using Tab.`, async() => {
            const row = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(0, 'CompanyName');
            UIInteractions.triggerKeyDownEvtUponElem('tab', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(document.activeElement).toBe(detailRow);
            const lastTabbable = detailRow.querySelector('input[name="Comment"]');
            UIInteractions.triggerKeyDownEvtUponElem('tab', lastTabbable, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(document.activeElement).toBe(grid.getCellByColumn(2, 'ContactName').nativeElement);
         });

         it(`Should focus the last focusable element in detail first
         and go in reverse order of all elements when tabbing through detail view using Shift+Tab.`, async() => {
            const prevRow = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('tab', targetCellElement, true, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(prevRow);
            const lastTabbable = detailRow.querySelector('input[name="Comment"]');
            expect(document.activeElement).toBe(lastTabbable);
            UIInteractions.triggerKeyDownEvtUponElem('tab', detailRow, true, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(document.activeElement).toBe(grid.getCellByColumn(0, 'CompanyName').nativeElement);
         });

         it('Should expand and collapse using Alt + Right/Down and Alt + Left/Up without losing focus on current row.', async() => {
            const row = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.clickElement(targetCellElement);
            fix.detectChanges();
            expect(targetCellElement.focused).toBeTruthy();
            // collapse with alt + arrowup
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true, true, false);
            fix.detectChanges();
            expect(row.expanded).toBeFalsy();
            expect(targetCellElement.focused).toBeTruthy();

            // expand with alt + arrowdown
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true, true, false);
            fix.detectChanges();
            expect(row.expanded).toBeTruthy();
            expect(targetCellElement.focused).toBeTruthy();

             // collapse with alt + arrowleft
             UIInteractions.triggerKeyDownEvtUponElem('arrowleft', targetCellElement, true, true, false);
             fix.detectChanges();
             expect(row.expanded).toBeFalsy();
             expect(targetCellElement.focused).toBeTruthy();

            // expand with alt + arrowright
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', targetCellElement, true, true, false);
            fix.detectChanges();
            expect(row.expanded).toBeTruthy();
            expect(targetCellElement.focused).toBeTruthy();
         });

        it(`Should expand and collapse using Alt + Right/Down and Alt + Left/Up
            at the bottom of the grid without losing focus.`, async() => {
            // navigate to last
            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(52) as IgxGridRowComponent;
            let targetCellElement = grid.getCellByColumn(52, 'ContactName');
            UIInteractions.clickElement(targetCellElement);
            fix.detectChanges();
            expect(targetCellElement.focused).toBeTruthy();

            // collapse with alt + arrowup
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true, true, false);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            expect(row.expanded).toBeFalsy();
            targetCellElement = grid.getCellByColumn(52, 'ContactName');
            expect(targetCellElement.focused).toBeTruthy();

            // expand with alt + arrowdown
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true, true, false);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            expect(row.expanded).toBeTruthy();
            targetCellElement = grid.getCellByColumn(52, 'ContactName');
            expect(targetCellElement.focused).toBeTruthy();
        });

        it('Should navigate to the correct row/cell when using the navigateTo method in a grid with expanded detail views.', async() => {
            grid.navigateTo(20, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            let row = grid.getRowByIndex(20) as IgxGridRowComponent;
            expect(row).not.toBeNull();
            expect(GridFunctions.elementInGridView(grid, row.nativeElement)).toBeTruthy();
            grid.navigateTo(21, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            row = grid.getRowByIndex(20) as IgxGridRowComponent;
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();

         });

         it('Should navigate to the last data cell in the grid using Ctrl + End.', async() => {
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('end', targetCellElement, true, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const lastRow = grid.getRowByIndex(52);
            expect(lastRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, lastRow.nativeElement)).toBeTruthy();
            expect(document.activeElement).toBe(lastRow.cells.last.nativeElement);
         });

         it('Should navigate to the first data cell in the grid using Ctrl + Home.', async() => {
            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const targetCellElement = grid.getCellByColumn(52, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('home', targetCellElement, true, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const fRow = grid.getRowByIndex(0);
            expect(fRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, fRow.nativeElement)).toBeTruthy();
            expect(document.activeElement).toBe(fRow.cells.first.nativeElement);
         });

         it('Should navigate to the last data row using Ctrl + ArrowDown when all rows are expanded.', async() => {
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const lastRow = grid.getRowByIndex(52);
            expect(lastRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, lastRow.nativeElement)).toBeTruthy();
            expect(document.activeElement).toBe(lastRow.cells.first.nativeElement);
         });

         it('Should navigate to the first data row using Ctrl + ArrowUp when all rows are expanded.', async() => {
            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const targetCellElement = grid.getCellByColumn(52, 'CompanyName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true, false, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            const fRow = grid.getRowByIndex(0);
            expect(fRow).not.toBeUndefined();
            expect(GridFunctions.elementInGridView(grid, fRow.nativeElement)).toBeTruthy();
            expect(document.activeElement).toBe(fRow.cells.last.nativeElement);
         });

         it(`Should navigate to the first/last row when using Ctrl+ArrowUp/ArrowDown
                and focus is on the detail row container.`, async() => {
                    let detailRow = GridFunctions.getMasterRowDetail(grid.rowList.first);
                    UIInteractions.triggerKeyDownEvtUponElem('arrowdown', detailRow, true, false, false, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                    let row = grid.getRowByIndex(52) as IgxGridRowComponent;
                    expect(row).not.toBeUndefined();
                    expect(GridFunctions.elementInGridView(grid, row.nativeElement)).toBeTruthy();
                    expect(document.activeElement).toBe(row.cells.first.nativeElement);
                    detailRow = GridFunctions.getMasterRowDetail(row);
                    UIInteractions.triggerKeyDownEvtUponElem('arrowup', detailRow, true, false, false, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                    row = grid.getRowByIndex(0) as IgxGridRowComponent;
                    expect(row).not.toBeUndefined();
                    expect(GridFunctions.elementInGridView(grid, row.nativeElement)).toBeTruthy();
                    expect(document.activeElement).toBe(row.cells.first.nativeElement);
            });
        it('Should not navigate if keydown is done on an element inside the details template.', async() => {
            const detailRow = GridFunctions.getMasterRowDetail(grid.rowList.first);
            const input = detailRow.querySelector('input[name="Comment"]');
            input.focus();
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', input, true, false, false, false);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(document.activeElement).toBe(input);
        });
    });

    describe('Integration', () => {
        describe('Paging', () => {
            it('Should not take into account expanded detail views as additional records.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                fix.componentInstance.paging = true;
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                const initialTotalRecords = grid.pagingState.metadata.countRecords;
                grid.expand(fix.componentInstance.data[0].ID);
                fix.detectChanges();
                expect(grid.pagingState.metadata.countRecords).toEqual(initialTotalRecords);
            });

            it('Should persist template state after paging to a page with fewer records and paging back.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                fix.componentInstance.paging = true;
                fix.componentInstance.perPage = 5;
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.expand(fix.componentInstance.data[4].ID);
                fix.detectChanges();
                // click the template checkbox
                let checkbox = fix.debugElement.query(By.css('.igx-checkbox__input'));
                checkbox.nativeElement.click();
                fix.detectChanges();
                // go to last page that doesn't contain this view
                grid.page = grid.pagingState.metadata.countPages - 1;
                fix.detectChanges();
                // go back to first page
                grid.page = 0;
                fix.detectChanges();
                // check checkbox state
                checkbox = fix.debugElement.query(By.css('.igx-checkbox__input'));
                expect(checkbox.nativeElement.attributes['aria-checked'].value).toEqual('true');
            });
        });

        describe('Hiding', () => {
            it('Should set the expand/collapse icon to the new first visible column when hiding the first column.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.columnList.first.hidden = true;
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });
        });

        describe('Pinning', () => {
            it('Should keep/move the expand/collapse icon to the correct column when pinning the first column or another one.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.columnList.last.pin();
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
                grid.pinnedColumns[0].unpin();
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });

            it('Should render detail view correctly when expanding a master row and there are pinned columns.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.columnList.last.pin();
                grid.expand(fix.componentInstance.data[0].ID);
                fix.detectChanges();
                const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);

                expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
                expect(firstRowDetail.querySelector('.igx-grid__hierarchical-indent')).toBeDefined();
            });
        });

        describe('Column Moving', () => {
            it('Should keep the expand/collapse icon in the first column, even when moving a column in first place.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.moveColumn(grid.columnList.last, grid.columnList.first);
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });
            it('Should keep the expand/collapse icon in the first column, even when moving a column out of first place.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.moveColumn(grid.columnList.first, grid.columnList.last);
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });
        });

        describe('Search', () => {
            beforeEach(async(() => {
                fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
            }));
            it('Should scroll to the correct parent rows when searching in a grid with expanded detail views.', async() => {
                grid.findNext('Paolo');
                await wait(DEBOUNCETIME);
                fix.detectChanges();
                let row = grid.getRowByIndex(52);
                expect(row).not.toBeNull();
                GridFunctions.elementInGridView(grid, row.nativeElement);
                grid.findPrev('Maria');
                await wait(DEBOUNCETIME);
                fix.detectChanges();

                row = grid.getRowByIndex(0);
                expect(row).not.toBeNull();
                GridFunctions.elementInGridView(grid, row.nativeElement);
            });

            describe('Updating', () => {
                beforeEach(async(() => {
                    fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                    fix.detectChanges();
                    grid = fix.componentInstance.grid;
                }));
                it('Should remove expanded detail view after deleting its parent row.', async() => {
                    let detailViews = fix.debugElement.queryAll(By.css('div[detail="true"]'));
                    expect(detailViews[0].context.index).toBe(1);
                    grid.deleteRow('ALFKI');
                    fix.detectChanges();
                    const row = grid.getRowByKey('ALFKI');
                    expect(row).toBeUndefined();
                    detailViews = fix.debugElement.queryAll(By.css('div[detail="true"]'));
                    expect(detailViews[0].context.index).toBe(3);
                });

                it('Should be able to expand detail view of newly added row.', async() => {
                    grid.addRow({ 'ID': '123', 'CompanyName': 'Test', 'ContactName': 'Test', 'Address': 'Test Address'});
                    fix.detectChanges();
                    // scroll to bottom
                    grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                    // check row can be expanded
                    const lastRow = grid.rowList.last;
                    await GridFunctions.toggleMasterRowByClick(fix, lastRow, DEBOUNCETIME);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();
                    expect(lastRow.expanded).toBeTruthy();
                    const lastRowDetail =  GridFunctions.getMasterRowDetail( grid.rowList.last);
                    expect(lastRowDetail.querySelector('.addressArea').innerText).toEqual('Test Address');
                });

            });

            describe('Sorting', () => {
                beforeEach(async(() => {
                    fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                    fix.detectChanges();
                    grid = fix.componentInstance.grid;
                }));

                it('Should rearrange detail views to their correct parents after sorting.', () => {
                    grid.sort({fieldName: 'ContactName', dir: SortingDirection.Desc, ignoreCase: true});
                    fix.detectChanges();

                    let row = grid.rowList.first;
                    let detailRow = GridFunctions.getMasterRowDetail(row);

                    expect(row.rowData['ContactName']).toBe('Yang Wang');
                    expect(detailRow.querySelector('.addressArea').innerText).toEqual(row.rowData['Address']);


                    row = grid.rowList.toArray()[1];
                    detailRow = GridFunctions.getMasterRowDetail(row);
                    expect(row.rowData['ContactName']).toBe('Victoria Ashworth');
                    expect(detailRow.querySelector('.addressArea').innerText).toEqual(row.rowData['Address']);
                });
            });


            describe('Filtering', () => {
                beforeEach(async(() => {
                    fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
                    fix.detectChanges();
                    grid = fix.componentInstance.grid;
                }));

                it('Should persist template state after filtering out the whole data and removing the filter.', () => {
                    let checkbox = fix.debugElement.query(By.css('.igx-checkbox__input'));
                    checkbox.nativeElement.click();
                    fix.detectChanges();
                    // check checkbox state
                    checkbox = fix.debugElement.query(By.css('.igx-checkbox__input'));
                    expect(checkbox.nativeElement.attributes['aria-checked'].value).toEqual('true');
                    grid.filter('ContactName', 'NonExistingName',
                            IgxStringFilteringOperand.instance().condition('equals'), true);
                    fix.detectChanges();
                    expect(grid.rowList.length).toBe(0);
                    grid.clearFilter();
                    fix.detectChanges();
                    // check checkbox state is persisted.
                    checkbox = fix.debugElement.query(By.css('.igx-checkbox__input'));
                    expect(checkbox.nativeElement.attributes['aria-checked'].value).toEqual('true');
                });
            });

            describe('Multi-row layout', () => {
                beforeEach(async(() => {
                    fix = TestBed.createComponent(MRLMasterDetailComponent);
                    fix.detectChanges();
                    grid = fix.componentInstance.grid;
                }));

                it('Should render expand/collapse icon in the column with visible index 0.', async() => {
                    const cell = grid.getCellByKey('ALFKI', 'CompanyName');
                    expect(cell instanceof IgxGridExpandableCellComponent).toBeTruthy();
                    let icon = cell.nativeElement.querySelector('igx-icon');
                    expect(icon.textContent).toEqual(COLLAPSED_ICON_NAME);
                    await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);
                    fix.detectChanges();
                    icon = cell.nativeElement.querySelector('igx-icon');
                    expect(icon.textContent).toEqual(EXPANDED_ICON_NAME);
                    const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
                    expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
                });

                it('Should expand detail view without breaking multi-row layout.', async() => {
                    await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);
                    fix.detectChanges();

                    // check row order
                    const rows = fix.debugElement.queryAll(By.css('igx-grid-row'));
                    const detailViews = fix.debugElement.queryAll(By.css('div[detail="true"]'));
                    expect(detailViews.length).toBe(1);

                    expect(rows[0].context.index).toBe(0);
                    expect(detailViews[0].context.index).toBe(1);
                    expect(rows[1].context.index).toBe(2);
                });

                it(`Should navigate down through a detail view by focusing the whole row and continuing
                onto the next with arrow down in multi-row layout grid.`, async() => {
                    await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);
                    fix.detectChanges();

                    let targetCellElement = grid.getCellByColumn(0, 'ContactName');
                    UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    targetCellElement = grid.getCellByColumn(0, 'Address');
                    expect(targetCellElement.focused).toBeTruthy();

                    UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
                    expect(document.activeElement).toBe(firstRowDetail);

                    UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstRowDetail, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    targetCellElement = grid.getCellByColumn(2, 'CompanyName');
                    expect(targetCellElement.focused).toBeTruthy();
                });

                it(`Should navigate up through a detail view by
                 focusing the whole row and continuing onto the next with arrow up in multi-row layout grid.`, async() => {
                    await GridFunctions.toggleMasterRowByClick(fix, grid.rowList.first, DEBOUNCETIME);
                    fix.detectChanges();

                    let targetCellElement = grid.getCellByColumn(2, 'ContactName');
                    UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    targetCellElement = grid.getCellByColumn(2, 'CompanyName');
                    expect(targetCellElement.focused).toBeTruthy();

                    UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
                    expect(document.activeElement).toBe(firstRowDetail);

                    UIInteractions.triggerKeyDownEvtUponElem('arrowup', firstRowDetail, true);
                    await wait(DEBOUNCETIME);
                    fix.detectChanges();

                    targetCellElement = grid.getCellByColumn(0, 'Address');
                    expect(targetCellElement.focused).toBeTruthy();
                });
            });
        });
    });
});

@Component({
    template: `
        <igx-grid [data]="data" [width]="width" [height]="height" [primaryKey]="'ID'" [allowFiltering]='true'
        [paging]="paging" [perPage]="perPage" [rowSelectable]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width" [dataType]='c.dataType'
                [hidden]='c.hidden' [sortable]="c.sortable" [movable]='c.movable' [groupable]='c.groupable' [editable]="c.editable"
                [hasSummary]="c.hasSummary" [pinned]='c.pinned'>
            </igx-column>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                    <igx-checkbox [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <igx-input-group class="igxInputGroup">
                        <input igxInput />
                    </igx-input-group>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class DefaultGridMasterDetailComponent {

    public width = '800px';
    public height = '500px';
    public data = SampleTestData.contactInfoDataFull();
    public columns = [
        { field: 'ContactName', width: 400, dataType: 'string' },
        { field: 'CompanyName', width: 400, dataType: 'string' }
    ];
    public paging = false;
    public perPage = 15;
    public rowSelectable = false;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid [data]="data" [expansionStates]='expStates'
         [width]="width" [height]="height" [primaryKey]="'ID'" [paging]="paging" [rowSelectable]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width" [dataType]='c.dataType'
                [hidden]='c.hidden' [sortable]="c.sortable" [movable]='c.movable' [groupable]='c.groupable' [editable]="c.editable"
                [hasSummary]="c.hasSummary" [pinned]='c.pinned'>
            </igx-column>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class AllExpandedGridMasterDetailComponent extends DefaultGridMasterDetailComponent implements OnInit {
    public expStates = new Map<any, boolean>();
    ngOnInit(): void {
        const allExpanded = new Map<any, boolean>();
        this.data.forEach(item => {
            allExpanded.set(item['ID'], true);
        });
        this.expStates = allExpanded;
    }
}

@Component({
    template: `
        <igx-grid [data]="data"
         [width]="width" [height]="height" [primaryKey]="'ID'" [paging]="paging" [rowSelectable]="rowSelectable">
        <igx-column-layout field='group2'>
            <igx-column [rowStart]="1" [colStart]="1" [colEnd]="3" field="CompanyName" [width]="'300px'"></igx-column>
            <igx-column [rowStart]="2" [colStart]="1" field="ContactName" [width]="'100px'"></igx-column>
            <igx-column [rowStart]="2" [colStart]="2" field="ContactTitle" [width]="'200px'"></igx-column>
            <igx-column [rowStart]="3" [colStart]="1" [colEnd]="3" field="Address" [width]="'300px'"></igx-column>
        </igx-column-layout>
        <igx-column-layout>
            <igx-column [rowStart]="1" [colStart]="1" [colEnd]="3" [rowEnd]="3" field="City" [width]="'300px'"></igx-column>
            <igx-column [rowStart]="3" [colStart]="1"  [colEnd]="3" field="Region" [width]='"300px"'></igx-column>
        </igx-column-layout>
        <igx-column-layout field='group1'>
            <igx-column  [rowStart]="1" [colStart]="1" [rowEnd]="4" field="ID"></igx-column>
        </igx-column-layout>
            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class MRLMasterDetailComponent extends DefaultGridMasterDetailComponent {}
