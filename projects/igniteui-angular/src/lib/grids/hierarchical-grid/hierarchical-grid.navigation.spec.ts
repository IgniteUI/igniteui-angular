import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, ViewChild, DebugElement} from '@angular/core';
import { IgxChildGridRowComponent, IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions, waitForSelectionChange } from '../../test-utils/ui-interactions.spec';
import { IgxRowIslandComponent } from './row-island.component';
import { By } from '@angular/platform-browser';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { clearGridSubs, setupHierarchicalGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridCellComponent } from '../cell.component';
import { IGridCellEventArgs, IgxColumnComponent, IPathSegment } from '../public_api';
import { IgxHierarchicalGridNavigationService } from './hierarchical-grid-navigation.service';

const DEBOUNCE_TIME = 50;
const GRID_CONTENT_CLASS = '.igx-grid__tbody-content';
const GRID_FOOTER_CLASS = '.igx-grid__tfoot';

describe('IgxHierarchicalGrid Navigation', () => {
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let baseHGridContent: DebugElement;
    const defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridTestComplexComponent,
                IgxHierarchicalGridMultiLayoutComponent,
                IgxHierarchicalGridSmallerChildComponent
            ]
        }).compileComponents();
        jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout * 2;
    }));

    afterAll(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout);

    describe('IgxHierarchicalGrid Basic Navigation #hGrid', () => {

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
            baseHGridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
        }));

        afterEach(() => {
            clearGridSubs();
        });

        // simple tests
        it('should allow navigating down from parent row into child grid.', async () => {
            hierarchicalGrid.expandChildren = false;
            hierarchicalGrid.height = '600px';
            hierarchicalGrid.width = '800px';
            fixture.componentInstance.rowIsland.height = '350px';
            fixture.detectChanges();
            await wait();

            // expand row
            const row1 = hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();
            await wait();

            // activate cell
            const fCell = hierarchicalGrid.dataRowList.first.cells.first;
            GridFunctions.focusCell(fixture, fCell);

            // arrow down
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
            fixture.detectChanges();

            // verify selection in child.
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.value).toEqual(0);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('should allow navigating up from child row into parent grid.', () => {
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childFirstCell =  childGrid.dataRowList.first.cells.first;
            GridFunctions.focusCell(fixture, childFirstCell);

            // arrow up in child
            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
            fixture.detectChanges();

            // verify selection in parent.
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.value).toEqual(0);
            expect(selectedCell.column.field).toMatch('ID');
        });

        it('should allow navigating down in child grid when child grid selected cell moves outside the parent view port.', async () => {
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childCell =  childGrid.dataRowList.toArray()[3].cells.first;
            GridFunctions.focusCell(fixture, childCell);

            // arrow down in child
            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
            fixture.detectChanges();
            await wait();
            // parent should scroll down so that cell in child is in view.
            const selectedCell = fixture.componentInstance.selectedCell;
            const selectedCellElem = childGrid.gridAPI.get_cell_by_index(selectedCell.row.index, selectedCell.column.field) as IgxGridCellComponent;
            const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
            const rowOffsets = selectedCellElem.intRow.nativeElement.getBoundingClientRect();
            expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
        });

        it('should allow navigating up in child grid when child grid selected cell moves outside the parent view port.',  async () => {
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childCell =  childGrid.dataRowList.toArray()[4].cells.first;
            GridFunctions.focusCell(fixture, childCell);

            const prevScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);
            // parent should scroll up so that cell in child is in view.
            const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(prevScrTop - currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight);
        });

        it('should allow navigating to end in child grid when child grid target row moves outside the parent view port.', async () => {
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
            GridFunctions.focusCell(fixture, childCell);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('end', childGridContent, false, false, true);
            fixture.detectChanges();
            await wait();

            // verify selection in child.
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toEqual(9);
            expect(selectedCell.column.field).toMatch('childData2');

            // parent should be scrolled down
            const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 5);
        });

        it('should allow navigating to start in child grid when child grid target row moves outside the parent view port.', async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            fixture.detectChanges();
            await wait();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
            horizontalScrDir.scrollTo(6);
            fixture.detectChanges();
            await wait();

            const childLastCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[3];
            GridFunctions.focusCell(fixture, childLastCell);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('home', childGridContent, false, false, true);
            await wait(DEBOUNCE_TIME * 3);
            fixture.detectChanges();

            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.value).toEqual(0);
            expect(selectedCell.column.index).toBe(0);
            expect(selectedCell.row.index).toBe(0);

            // check if child row is in view of parent.
            const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
            const rowElem = childGrid.gridAPI.get_row_by_index(selectedCell.row.index);
            const rowOffsets = rowElem.nativeElement.getBoundingClientRect();
            expect(rowOffsets.top).toBeGreaterThanOrEqual(gridOffsets.top);
            expect(rowOffsets.bottom).toBeLessThanOrEqual(gridOffsets.bottom);
        });

        it('should allow navigating to bottom in child grid when child grid target row moves outside the parent view port.', async () => {
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childCell =  childGrid.dataRowList.first.cells.first;
            GridFunctions.focusCell(fixture, childCell);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, true);
            // wait for parent grid to complete scroll to child cell.
            await wait();
            fixture.detectChanges();

            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.value).toBe(9);
            expect(selectedCell.column.index).toBe(0);
            expect(selectedCell.row.index).toBe(9);

            const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 5);
        });

        it('should not lose activation when pressing Ctrl+ArrowDown is pressed at the bottom row(expended) in a child grid.', async () => {
            hierarchicalGrid.height = '600px';
            hierarchicalGrid.width = '800px';
            fixture.componentInstance.rowIsland.height = '400px';
            fixture.detectChanges();
            await wait();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            childGrid.data = childGrid.data.slice(0, 5);
            fixture.detectChanges();

            childGrid.dataRowList.toArray()[4].expander.nativeElement.click();
            fixture.detectChanges();
            await wait();

            const childCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
            GridFunctions.focusCell(fixture, childCell);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, true);
            await wait();
            fixture.detectChanges();

            const childLastRowCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(childLastRowCell.row.index);
            expect(selectedCell.column.visibleIndex).toBe(childLastRowCell.column.visibleIndex);
            expect(selectedCell.column.index).toBe(childLastRowCell.column.index);
            expect(selectedCell.value).toBe(childLastRowCell.value);

            const currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrTop).toEqual(0);
        });

        it('should allow navigating to top in child grid when child grid target row moves outside the parent view port.', async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childLastRowCell =  childGrid.dataRowList.toArray()[9].cells.first;
            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            GridFunctions.focusCell(fixture, childLastRowCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const childFirstRowCell =  childGrid.dataRowList.first.cells.first;
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(childFirstRowCell.row.index);
            expect(selectedCell.column.visibleIndex).toBe(childFirstRowCell.column.visibleIndex);
            expect(selectedCell.column.index).toBe(childFirstRowCell.column.index);
            expect(selectedCell.value).toBe(childFirstRowCell.value);

           // check if child row is in view of parent.
           const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
           const selectedCellElem = childGrid.gridAPI.get_cell_by_index(selectedCell.row.index, selectedCell.column.field) as IgxGridCellComponent;
           const rowOffsets = selectedCellElem.intRow.nativeElement.getBoundingClientRect();
           expect(rowOffsets.top).toBeGreaterThanOrEqual(gridOffsets.top);
           expect(rowOffsets.bottom).toBeLessThanOrEqual(gridOffsets.bottom);
        });

        it('should scroll top of child grid into view when pressing Ctrl + Arrow Up when cell is selected in it.', async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childLastRowCell =  childGrid.dataRowList.toArray()[9].cells.first;
            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            GridFunctions.focusCell(fixture, childLastRowCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const childFirstRowCell =  childGrid.dataRowList.first.cells.first;
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(childFirstRowCell.row.index);
            expect(selectedCell.column.visibleIndex).toBe(childFirstRowCell.column.visibleIndex);
            expect(selectedCell.column.index).toBe(childFirstRowCell.column.index);
            expect(selectedCell.value).toBe(childFirstRowCell.value);

            // check if child row is in view of parent.
            const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
            const rowElem = childGrid.gridAPI.get_row_by_index(selectedCell.row.index);
            const rowOffsets = rowElem.nativeElement.getBoundingClientRect();
            expect(rowOffsets.top).toBeGreaterThanOrEqual(gridOffsets.top);
            expect(rowOffsets.bottom).toBeLessThanOrEqual(gridOffsets.bottom);
        });

        it('when navigating down from parent into child should scroll child grid to top and start navigation from first row.', async () => {
            const ri = fixture.componentInstance.rowIsland;
            ri.height = '200px';
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            childGrid.verticalScrollContainer.scrollTo(9);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            let currScrTop = childGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrTop).toBeGreaterThan(0);

            const fCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
            GridFunctions.focusCell(fixture, fCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(childFirstCell.row.index);
            expect(selectedCell.column.index).toBe(childFirstCell.column.index);
            currScrTop = childGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(currScrTop).toBe(0);
        });

        it('when navigating up from parent into child should scroll child grid to bottom and start navigation from last row.', async () => {
            const ri = fixture.componentInstance.rowIsland;
            ri.height = '200px';
            fixture.detectChanges();
            await wait();
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            fixture.detectChanges();
            await wait();

            const parentCell = hierarchicalGrid.gridAPI.get_cell_by_key(1, 'ID');
            GridFunctions.focusCell(fixture, parentCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);
            fixture.detectChanges();
            await wait();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const vertScr = childGrid.verticalScrollContainer.getScroll();
            const currScrTop = vertScr.scrollTop;
            // should be scrolled to bottom
            expect(currScrTop).toBe(vertScr.scrollHeight - vertScr.clientHeight);
        });

        it('should move activation to last data cell in grid when ctrl+end is used.', async () => {
            const parentCell = hierarchicalGrid.dataRowList.first.cells.first;
            GridFunctions.focusCell(fixture, parentCell);

            UIInteractions.triggerEventHandlerKeyDown('end', baseHGridContent, false, false, true);
            fixture.detectChanges();
            await waitForSelectionChange(hierarchicalGrid);

            const lastDataCell = hierarchicalGrid.getCellByKey(19, 'childData2');
            const selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(lastDataCell.row.index);
            expect(selectedCell.column.index).toBe(lastDataCell.column.index);
        });

        it('if next child cell is not in view should scroll parent so that it is in view.', async () => {
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            hierarchicalGrid.verticalScrollContainer.scrollTo(4);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
            GridFunctions.focusCell(fixture, parentCell);

            const prevScroll = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
            fixture.detectChanges();
            await wait();

            // check if selected row is in view of parent.
            const gridOffsets = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect();
            const rowElem = hierarchicalGrid.gridAPI.get_row_by_index(parentCell.row.index);
            const rowOffsets = rowElem.nativeElement.getBoundingClientRect();
            expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
            expect(hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop - prevScroll).toBeGreaterThanOrEqual(100);
        });

        it('should expand/collapse hierarchical row using ALT+Arrow Right/ALT+Arrow Left.', async () => {
            const parentRow = hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent;
            expect(parentRow.expanded).toBe(true);
            const parentCell = parentRow.cells.first;
            GridFunctions.focusCell(fixture, parentCell);

            // collapse
            UIInteractions.triggerEventHandlerKeyDown('arrowleft', baseHGridContent, true, false, false);
            fixture.detectChanges();
            await wait();

            expect(parentRow.expanded).toBe(false);
            // expand
            UIInteractions.triggerEventHandlerKeyDown('arrowright', baseHGridContent, true, false, false);
            await wait();
            fixture.detectChanges();
            expect(parentRow.expanded).toBe(true);
        });

        it('should retain active cell when expand/collapse hierarchical row using ALT+Arrow Right/ALT+Arrow Left.', async () => {
            // scroll to last row
            const lastDataIndex = hierarchicalGrid.dataView.length - 2;
            hierarchicalGrid.verticalScrollContainer.scrollTo(lastDataIndex);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            hierarchicalGrid.verticalScrollContainer.scrollTo(lastDataIndex);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            let parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(38, 'ID');
            GridFunctions.focusCell(fixture, parentCell);

             // collapse
            UIInteractions.triggerEventHandlerKeyDown('arrowleft', baseHGridContent, true, false, false);
            fixture.detectChanges();
            await wait();

            parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(38, 'ID');
            expect(parentCell.active).toBeTruthy();

            // expand
            UIInteractions.triggerEventHandlerKeyDown('arrowright', baseHGridContent, true, false, false);
            fixture.detectChanges();
            await wait();

            parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(38, 'ID');
            expect(parentCell.active).toBeTruthy();
        });

        it('should expand/collapse hierarchical row using ALT+Arrow Down/ALT+Arrow Up.', async () => {
            const parentRow = hierarchicalGrid.dataRowList.first as IgxHierarchicalRowComponent;
            expect(parentRow.expanded).toBe(true);
            let parentCell = parentRow.cells.first;
            GridFunctions.focusCell(fixture, parentCell);

            // collapse
            UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, true, false, false);
            fixture.detectChanges();
            await wait();

            expect(parentRow.expanded).toBe(false);
            // expand
            parentCell = parentRow.cells.first;
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, true, false, false);
            fixture.detectChanges();
            await wait();

            expect(parentRow.expanded).toBe(true);
        });

        it('should skip child grids that have no data when navigating up/down', async () => {
            // set first child to not have data
            const child1 = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            child1.data = [];
            fixture.detectChanges();
            await wait();

            const parentRow = hierarchicalGrid.dataRowList.first;
            const parentCell = parentRow.cells.first;
            GridFunctions.focusCell(fixture, parentCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
            fixture.detectChanges();
            await wait();

            // second data row in parent should be focused
            const parentRow2 = hierarchicalGrid.getRowByIndex(2);
            const parentCell2 = parentRow2.cells[0];

            let selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(parentCell2.row.index);
            expect(selectedCell.column.index).toBe(parentCell2.column.index);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);
            fixture.detectChanges();
            await wait();

            // first data row in parent should be selected
            selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(parentCell.row.index);
            expect(parentCell.selected).toBeTruthy();
        });

        it('should skip nested child grids that have no data when navigating up/down', async () => {
            const child1 = hierarchicalGrid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
            child1.height = '150px';
            await wait();
            fixture.detectChanges();
            const row = child1.dataRowList.first as IgxHierarchicalRowComponent;
            row.toggle();
            await wait();
            fixture.detectChanges();
            //  set nested child to not have data
            const subChild = child1.gridAPI.getChildGrids(false)[0];
            subChild.data = [];
            subChild.cdr.detectChanges();
            fixture.detectChanges();
            await wait();

            const fchildRowCell = row.cells.first;
            GridFunctions.focusCell(fixture, fchildRowCell);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            // second child row should be in view
            const sChildRowCell = child1.getRowByIndex(2).cells[0];
            let selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.value).toBe(sChildRowCell.value);

            expect(child1.verticalScrollContainer.getScroll().scrollTop).toBeGreaterThanOrEqual(150);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            selectedCell = fixture.componentInstance.selectedCell;
            expect(selectedCell.row.index).toBe(0);
            expect(child1.verticalScrollContainer.getScroll().scrollTop).toBe(0);
        });

        it('should navigate inside summary row with Ctrl + Arrow Right/ Ctrl + Arrow Left', async () => {
            const col = hierarchicalGrid.getColumnByName('ID');
            col.hasSummary = true;
            fixture.detectChanges();

            let summaryCells = hierarchicalGrid.summariesRowList.toArray()[0].summaryCells.toArray();

            const firstCell =  summaryCells[0];
            GridFunctions.focusCell(fixture, firstCell);

            const footerContent = fixture.debugElement.queryAll(By.css(GRID_FOOTER_CLASS))[2].children[0];
            UIInteractions.triggerEventHandlerKeyDown('arrowright', footerContent, false, false, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            summaryCells = hierarchicalGrid.summariesRowList.toArray()[0].summaryCells.toArray();
            const lastCell = summaryCells.find((s) => s.column.field === 'childData2');
            expect(lastCell.active).toBeTruthy();

            UIInteractions.triggerEventHandlerKeyDown('arrowleft', footerContent, false, false, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            summaryCells = hierarchicalGrid.summariesRowList.toArray()[0].summaryCells.toArray();
            const fCell = summaryCells.find((s) => s.column.field === 'ID');
            expect(fCell.active).toBeTruthy();
        });

        it('should navigate to Cancel button when there is row in edit mode', async () => {
            hierarchicalGrid.columnList.forEach((c) => {
                if (c.field !== hierarchicalGrid.primaryKey) {
                    c.editable = true;
                }
            });

            hierarchicalGrid.rowEditable = true;
            fixture.detectChanges();
            await wait();

            const cellElem = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'ID');
            GridFunctions.focusCell(fixture, cellElem);

            UIInteractions.triggerEventHandlerKeyDown('end', baseHGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const cell = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'childData2');
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const activeEl = document.activeElement;
            expect(activeEl.innerHTML).toEqual('Cancel');

            UIInteractions.triggerKeyDownEvtUponElem('tab', activeEl, true, false, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

           expect(document.activeElement.tagName.toLowerCase()).toBe('input');
        });

        it('should navigate to row edit button "Done" on shift + tab', async () => {
            hierarchicalGrid.columnList.forEach((c) => {
                if (c.field !== hierarchicalGrid.primaryKey) {
                    c.editable = true;
                }
            });
            hierarchicalGrid.rowEditable = true;
            fixture.detectChanges();
            await wait();

            hierarchicalGrid.getColumnByName('ID').hidden = true;
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            hierarchicalGrid.navigateTo(2);
            await wait();

            const cell = hierarchicalGrid.gridAPI.get_cell_by_index(2, 'ChildLevels');
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            await wait();

            UIInteractions.triggerKeyDownEvtUponElem('tab', cell.nativeElement, true, false, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const activeEl = document.activeElement;
            expect(activeEl.innerHTML).toEqual('Done');

            UIInteractions.triggerKeyDownEvtUponElem('tab', activeEl, true);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

           expect(document.activeElement.tagName.toLowerCase()).toBe('input');
        });
    });


    describe('IgxHierarchicalGrid Complex Navigation #hGrid', () => {

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestComplexComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
            baseHGridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
        }));

        afterEach(() => {
            clearGridSubs();
        });

        // complex tests
        it('in case prev cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', async () => {
            // scroll parent so that child top is not in view
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            hierarchicalGrid.verticalScrollContainer.addScrollTop(300);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const child = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const nestedChild = child.gridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.dataRowList.toArray()[1].cells.toArray()[0];

            GridFunctions.focusCell(fixture, nestedChildCell);
            let oldScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            fixture.detectChanges();

            // navigate up
            const nestedChildGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];
            UIInteractions.triggerEventHandlerKeyDown('arrowup', nestedChildGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            let nextCell =  nestedChild.dataRowList.toArray()[0].cells.toArray()[0];
            let currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            const elemHeight = nestedChildCell.intRow.nativeElement.clientHeight;
            // check if parent of parent has been scroll up so that the focused cell is in view
            expect(oldScrTop - currScrTop).toEqual(elemHeight);
            oldScrTop = currScrTop;

            expect(nextCell.selected).toBe(true);
            expect(nextCell.active).toBe(true);
            expect(nextCell.rowIndex).toBe(0);

            // navigate up into parent
            UIInteractions.triggerEventHandlerKeyDown('arrowup', nestedChildGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            nextCell =  child.dataRowList.toArray()[0].cells.toArray()[0];
            currScrTop = hierarchicalGrid.verticalScrollContainer.getScroll().scrollTop;
            expect(oldScrTop - currScrTop).toBeGreaterThanOrEqual(100);

            expect(nextCell.selected).toBe(true);
            expect(nextCell.active).toBe(true);
            expect(nextCell.rowIndex).toBe(0);
        });

        it('in case next cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', async () => {
            const child = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const nestedChild = child.gridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.dataRowList.toArray()[1].cells.toArray()[0];

            // navigate down in nested child
            GridFunctions.focusCell(fixture, nestedChildCell);

            const nestedChildGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', nestedChildGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            // check if parent has scrolled down to show focused cell.
            expect(child.verticalScrollContainer.getScroll().scrollTop).toBe(nestedChildCell.intRow.nativeElement.clientHeight);
            const nextCell = nestedChild.dataRowList.toArray()[2].cells.toArray()[0];

            expect(nextCell.selected).toBe(true);
            expect(nextCell.active).toBe(true);
            expect(nextCell.rowIndex).toBe(2);
        });

        it('should allow navigating up from parent into nested child grid', async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            await wait();
            fixture.detectChanges();

            const child = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const lastIndex =  child.dataView.length - 1;
            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait();
            fixture.detectChanges();

            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait();
            fixture.detectChanges();

            const parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(2, 'ID');
            GridFunctions.focusCell(fixture, parentCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent , false, false, false);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const nestedChild = child.gridAPI.getChildGrids(false)[5];
            const lastCell = nestedChild.gridAPI.get_cell_by_index(4, 'ID');
            expect(lastCell.selected).toBe(true);
            expect(lastCell.active).toBe(true);
            expect(lastCell.row.index).toBe(4);
        });
    });

    describe('IgxHierarchicalGrid sibling row islands Navigation #hGrid', () => {

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridMultiLayoutComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
            baseHGridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
        }));

        afterEach(() => {
            clearGridSubs();
        });

        it('should allow navigating up between sibling child grids.', async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            fixture.detectChanges();
            await wait();

            const child1 = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const child2 = hierarchicalGrid.gridAPI.getChildGrids(false)[5];

            const child2Cell = child2.dataRowList.first.cells.first;
            GridFunctions.focusCell(fixture, child2Cell);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];
            UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const lastCellPrevRI = child1.dataRowList.last.cells.first;

            expect(lastCellPrevRI.active).toBe(true);
            expect(lastCellPrevRI.selected).toBe(true);
            expect(lastCellPrevRI.rowIndex).toBe(9);
        });

        it('should allow navigating down between sibling child grids.', async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const child1 = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const child2 = hierarchicalGrid.gridAPI.getChildGrids(false)[5];

            child1.verticalScrollContainer.scrollTo(child1.dataView.length - 1);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const child2Cell = child2.dataRowList.toArray()[0].cells.toArray()[0];
            const lastCellPrevRI = child1.dataRowList.last.cells.toArray()[0];
            GridFunctions.focusCell(fixture, lastCellPrevRI);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            expect(child2Cell.selected).toBe(true);
            expect(child2Cell.active).toBe(true);
        });

        it('should navigate up from parent row to the correct child sibling.', async () => {
            const parentCell = hierarchicalGrid.dataRowList.toArray()[1].cells.first;
            GridFunctions.focusCell(fixture, parentCell);

            // Arrow Up into prev child grid
            UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const child2 = hierarchicalGrid.gridAPI.getChildGrids(false)[5];

            const child2Cell = child2.dataRowList.last.cells.first;
            expect(child2Cell.selected).toBe(true);
            expect(child2Cell.active).toBe(true);
            expect(child2Cell.rowIndex).toBe(9);
        });

        it('should navigate down from parent row to the correct child sibling.', async () => {
            const parentCell = hierarchicalGrid.dataRowList.first.cells.first;
            GridFunctions.focusCell(fixture, parentCell);

            // Arrow down into next child grid
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            const child1 = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const child1Cell = child1.dataRowList.toArray()[0].cells.toArray()[0];
            expect(child1Cell.selected).toBe(true);
            expect(child1Cell.active).toBe(true);
            expect(child1Cell.rowIndex).toBe(0);
        });

        it('should navigate to last cell in previous child using Arrow Up from last cell of sibling with more columns', async () => {
            const childGrid2 = hierarchicalGrid.gridAPI.getChildGrids(false)[5];

            childGrid2.dataRowList.first.virtDirRow.scrollTo(7);
            fixture.detectChanges();
            await wait();

            const child2LastCell = childGrid2.dataRowList.first.cells.first;
            GridFunctions.focusCell(fixture, child2LastCell);

            const childGridContent = fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[2];
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            let childLastCell = childGrid.selectedCells;
            expect(childLastCell.length).toBe(0);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', childGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME * 2);

            childLastCell = childGrid.selectedCells;
            expect(childLastCell.length).toBe(1);
            expect(childLastCell[0].active).toBeTruthy();
        });
    });

    describe('IgxHierarchicalGrid Smaller Child Navigation #hGrid', () => {

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridSmallerChildComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
            baseHGridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
        }));

        afterEach(() => {
            clearGridSubs();
        });

        it('should navigate to last cell in next row for child grid using Arrow Down from last cell of parent with more columns', async () => {
            const parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'Col2');
            GridFunctions.focusCell(fixture, parentCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowdown', baseHGridContent, false, false, false);

            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            // last cell in child should be focused
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childLastCell =  childGrid.gridAPI.get_cell_by_index(0, 'Col1');

            expect(childLastCell.selected).toBe(true);
            expect(childLastCell.active).toBe(true);
        });

        it('should navigate to last cell in next row for child grid using Arrow Up from last cell of parent with more columns', async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            fixture.detectChanges();
            await wait();

            const parentCell = hierarchicalGrid.gridAPI.get_cell_by_index(2, 'Col2');
            GridFunctions.focusCell(fixture, parentCell);

            UIInteractions.triggerEventHandlerKeyDown('arrowup', baseHGridContent, false, false, false);

            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);

            // last cell in child should be focused
            const childGrids =  fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            const childGrid = childGrids[1].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;
            const childLastCell =  childGrid.gridAPI.get_cell_by_index(9, 'ProductName');

            expect(childLastCell.selected).toBe(true);
            expect(childLastCell.active).toBe(true);
        });

        it('should navigate to last cell in next child using Arrow Down from last cell of previous child with more columns', async () => {
            const childGrids =  fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            const firstChildGrid = childGrids[0].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;
            const secondChildGrid = childGrids[1].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;

            firstChildGrid.verticalScrollContainer.scrollTo(9);
            fixture.detectChanges();
            await wait();

            const firstChildCell =  firstChildGrid.gridAPI.get_cell_by_index(9, 'Col1');
            GridFunctions.focusCell(fixture, firstChildCell);

            const childGridContent =  fixture.debugElement.queryAll(By.css(GRID_CONTENT_CLASS))[1];
            UIInteractions.triggerEventHandlerKeyDown('arrowdown', childGridContent, false, false, false);
            fixture.detectChanges();
            await wait(DEBOUNCE_TIME);


            const secondChildCell =  secondChildGrid.gridAPI.get_cell_by_index(0, 'ProductName');
            expect(secondChildCell.selected).toBe(true);
            expect(secondChildCell.active).toBe(true);
        });
    });

    describe('IgxHierarchicalGrid Navigation API #hGrid', () => {
        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridMultiLayoutComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
            baseHGridContent = GridFunctions.getGridContent(fixture);
            GridFunctions.focusFirstCell(fixture, hierarchicalGrid);
        }));

        afterEach(() => {
            clearGridSubs();
        });

        it('should navigate to exact child grid with navigateToChildGrid.', (done) => {
            hierarchicalGrid.primaryKey = 'ID';
            hierarchicalGrid.expandChildren = false;
            fixture.detectChanges();
            const path: IPathSegment = {
                rowKey: 10,
                rowIslandKey: 'childData2',
                rowID: 10
            };
            hierarchicalGrid.navigation.navigateToChildGrid([path], () => {
                fixture.detectChanges();
                const childGrid =  hierarchicalGrid.gridAPI.getChildGrid([path]).nativeElement;
                expect(childGrid).not.toBe(undefined);

                const parentBottom = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect().bottom;
                const parentTop = hierarchicalGrid.tbody.nativeElement.getBoundingClientRect().top;
                // check it's in view within its parent
                expect(childGrid.getBoundingClientRect().bottom <= parentBottom && childGrid.getBoundingClientRect().top >= parentTop);
                done();
            });
        });
        it('should navigate to exact nested child grid with navigateToChildGrid.', (done) => {
            hierarchicalGrid.expandChildren = false;
            hierarchicalGrid.primaryKey = 'ID';
            hierarchicalGrid.childLayoutList.toArray()[0].primaryKey = 'ID';
            fixture.detectChanges();
            const targetRoot: IPathSegment = {
                rowKey: 10,
                rowIslandKey: 'childData',
                rowID: 10
            };
            const targetNested: IPathSegment = {
                rowKey: 5,
                rowIslandKey: 'childData2',
                rowID: 5
            };

            hierarchicalGrid.navigation.navigateToChildGrid([targetRoot, targetNested], () => {
                fixture.detectChanges();
                const childGrid =  hierarchicalGrid.gridAPI.getChildGrid([targetRoot]).nativeElement;
                expect(childGrid).not.toBe(undefined);
                const childGridNested =  hierarchicalGrid.gridAPI.getChildGrid([targetRoot, targetNested]).nativeElement;
                expect(childGridNested).not.toBe(undefined);

                const parentBottom = childGrid.getBoundingClientRect().bottom;
                const parentTop = childGrid.getBoundingClientRect().top;
                // check it's in view within its parent
                expect(childGridNested.getBoundingClientRect().bottom <= parentBottom && childGridNested.getBoundingClientRect().top >= parentTop);
                done();
            });
        });
    });
});


@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" (selected)="selected($event)"
     [autoGenerate]="true" [height]="'400px'" [width]="'500px'" #hierarchicalGrid primaryKey="ID" [expandChildren]="true">
        <igx-row-island (selected)="selected($event)" [key]="'childData'" [autoGenerate]="true" [height]="null" #rowIsland>
            <igx-row-island (selected)="selected($event)" [key]="'childData'" [autoGenerate]="true" [height]="null" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridTestBaseComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedCell;

    constructor() {
        // 3 level hierarchy
        this.data = this.generateData(20, 3);
    }

    public selected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public generateData(count: number, level: number) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
           if (level > 0 ) {
               children = this.generateData(count / 2 , currLevel - 1);
           }
           prods.push({
            ID: i, ChildLevels: currLevel,  ProductName: 'Product: A' + i, Col1: i,
            Col2: i, Col3: i, childData: children, childData2: children });
        }
        return prods;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [height]="'400px'" [width]="'500px'" [data]="data" [autoGenerate]="true"
    [expandChildren]='true' #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [expandChildren]='true' [height]="'300px'" #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 [height]="'200px'" >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridTestComplexComponent extends IgxHierarchicalGridTestBaseComponent {
    constructor() {
        super();
        // 3 level hierarchy
        this.data = this.generateData(20, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="true" [height]="'500px'" [width]="'500px'"
    [expandChildren]='true' #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [height]="'150px'">
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
            </igx-row-island>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'150px'">
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridMultiLayoutComponent extends IgxHierarchicalGridTestBaseComponent {}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false" [height]="'500px'" [width]="'800px'"
    [expandChildren]='true' #hierarchicalGrid>
        <igx-column field="ID"></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-column field="Col1"></igx-column>
        <igx-column field="Col2"></igx-column>

        <igx-row-island [key]="'childData'" [autoGenerate]="false" [height]="'200px'">
            <igx-column field="ID"></igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
            </igx-row-island>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="false" [height]="'200px'">
            <igx-column field="ID"></igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxRowIslandComponent, IgxColumnComponent]
})
export class IgxHierarchicalGridSmallerChildComponent extends IgxHierarchicalGridTestBaseComponent {}
