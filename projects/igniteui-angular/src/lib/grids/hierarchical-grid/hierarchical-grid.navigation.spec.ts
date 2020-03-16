import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { Component, ViewChild} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxRowIslandComponent } from './row-island.component';
import { By } from '@angular/platform-browser';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { setupHierarchicalGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxSummaryCellComponent } from '../summaries/summary-cell.component';

const DEBOUNCE_TIME = 30;
const CHIP_ITEM_CLASS = '.igx-chip__item';
const FILTER_CELL_CLASS = '.igx-grid__filtering-cell';

describe('IgxHierarchicalGrid Basic Navigation #hGrid', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
        setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
    }));

    // simple tests
    it('should allow navigating down from parent row into child grid.', () => {
        fixture.componentInstance.rowIsland.height = '350px';
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const fCell = hierarchicalGrid.getCellByKey(0, 'ID');
        fCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(fCell, 'ArrowDown');
        fixture.detectChanges();

        const sCell = childGrid.getCellByKey(0, 'ID');
        expect(sCell.selected).toBe(true);
        expect(sCell.focused).toBe(true);
    });

    it('should allow navigating up from child row into parent grid.', () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.getCellByKey(0, 'ID');
        childFirstCell.onFocus(null);
        childGrid.cdr.detectChanges();

        GridFunctions.simulateCellKeydown(childFirstCell, 'ArrowUp');
        fixture.detectChanges();

        const parentFirstCell = hierarchicalGrid.getCellByKey(0, 'ID');
        expect(parentFirstCell.selected).toBe(true);
        expect(parentFirstCell.focused).toBe(true);
    });

    it('should allow navigating down in child grid when child grid selected cell moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell = childGrid.getCellByKey(7, 'ID');
        childCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childCell, 'ArrowDown');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // parent should scroll down so that cell in child is in view.
        expect(getScrollTop(hierarchicalGrid)).toBeGreaterThanOrEqual(childGrid.rowHeight);
    }));

    it('should allow navigating up in child grid when child grid selected cell moves outside the parent view port.',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.getCellByKey(2, 'ID');
        childCell.onFocus(null);
        fixture.detectChanges();
        const prevScrTop = getScrollTop(hierarchicalGrid);

        GridFunctions.simulateCellKeydown(childCell, 'ArrowUp');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        // parent should scroll up so that cell in child is in view.
        const currScrTop = getScrollTop(hierarchicalGrid);
        expect(prevScrTop - currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight);
    }));

    it('should allow navigation with Tab from parent into child.', (async () => {
        // scroll to last column
        const horizontalScrDir = hierarchicalGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const lastCell = hierarchicalGrid.getCellByKey(0, 'childData2');
        lastCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(lastCell, 'Tab');
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.getCellByKey(0, 'ID');
        expect(childFirstCell.selected).toBe(true);
        expect(childFirstCell.focused).toBe(true);
    }));

    it('should allow navigation with Shift+Tab from child into parent grid.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.getCellByKey(0, 'ID');

        childFirstCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childFirstCell, 'Tab', false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const lastCell = hierarchicalGrid.getCellByKey(0, 'childData2');
        expect(lastCell.selected).toBe(true);
        expect(lastCell.focused).toBe(true);
    }));

    it('should allow navigation with Tab from child into parent row.',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childLastCell =  childGrid.getCellByColumn(9, 'childData2');
        childLastCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childLastCell, 'Tab');
        fixture.detectChanges();

        const nextCell = hierarchicalGrid.getCellByKey(1, 'ID');
        expect(nextCell.selected).toBe(true);
        expect(nextCell.focused).toBe(true);
    }));

    it('should allow navigation with Shift+Tab from parent into child grid.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.getCellByKey(1, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'Tab', false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // last cell in child should be focused
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastCell =  childGrid.getCellByColumn(9, 'childData2');

        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
    }));

    it('should include summary rows in tab sequence.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        childGrid.getColumnByName('ID').hasSummary = true;
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.getCellByKey(1, 'ID');
        GridFunctions.simulateCellKeydown(parentCell, 'Tab', false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const summaryCells = fixture.debugElement.queryAll(By.directive(IgxSummaryCellComponent));
        const lastSummaryCell = summaryCells[summaryCells.length - 1];
        expect(document.activeElement).toBe(lastSummaryCell.nativeElement);

        UIInteractions.triggerEventHandlerKeyDownWithBlur('Tab', lastSummaryCell);
        fixture.detectChanges();

        expect(parentCell.selected).toBe(true);
        expect(parentCell.focused).toBe(true);
    }));

    it('should allow navigating to end in child grid when child grid target row moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.getCellByKey(0, 'ID');
        childCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childCell, 'End', false, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childLastCell =  childGrid.getCellByColumn(9, 'childData2');
        // correct cell should be focused
        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
        expect(childLastCell.columnIndex).toBe(6);
        expect(childLastCell.rowIndex).toBe(9);

        // parent should be scrolled down
        const currScrTop = getScrollTop(hierarchicalGrid);
        expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 2);
    }));

    it('should allow navigating to start in child grid when child grid target row moves outside the parent view port.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

        const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childLastCell =  childGrid.getCellByKey(9, 'Col1');
        childLastCell.nativeElement.focus();
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childLastCell, 'Home', false, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const rowCells = childGrid.dataRowList.toArray()[0].cells.toArray();
        const childCell =  GridFunctions.sortDebugElementsHorizontally(rowCells)[0];
        expect(childCell.selected).toBe(true);
        expect(childCell.focused).toBe(true);
        expect(childCell.columnIndex).toBe(0);
        expect(childCell.rowIndex).toBe(0);

        const currScrTop = getScrollTop(hierarchicalGrid);
        const childGridOffset = childGrid.nativeElement.offsetTop;
        expect(currScrTop).toBeLessThanOrEqual(childGrid.rowHeight + 1 + childGridOffset);
    }));

    it('should allow navigating to bottom in child grid when child grid target row moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.getCellByKey(0, 'ID');

        childCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childCell, 'ArrowDown', false, false, true);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childLastRowCell =  childGrid.getCellByKey(9, 'ID');
        expect(childLastRowCell.selected).toBe(true);
        expect(childLastRowCell.columnIndex).toBe(0);
        expect(childLastRowCell.rowIndex).toBe(9);

        const currScrTop = getScrollTop(hierarchicalGrid);
        expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 2);
    }));

    it('should not lose focus when pressing Ctrl+ArrowDown is pressed at the bottom row(expended) in a child grid.', () => {
        fixture.componentInstance.rowIsland.height = '400px';
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        childGrid.data = childGrid.data.slice(0, 5);
        fixture.detectChanges();

        childGrid.getRowByIndex(4).toggle();
        fixture.detectChanges();

        const childCell =  childGrid.getCellByKey(4, 'ID');
        childCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childCell, 'ArrowDown', false, false, true);
        fixture.detectChanges();

        const childLastRowCell =  childGrid.getCellByKey(4, 'ID');
        expect(childLastRowCell.selected).toBe(true);
        expect(childLastRowCell.columnIndex).toBe(0);
        expect(childLastRowCell.rowIndex).toBe(4);
        expect(document.activeElement).toEqual(childLastRowCell.nativeElement);

        const currScrTop = getScrollTop(hierarchicalGrid);
        expect(currScrTop).toEqual(0);
    });

    it('should allow navigating to top in child grid when child grid target row moves outside the parent view port.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastRowCell =  childGrid.getCellByKey(9, 'ID');

        childLastRowCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(childLastRowCell, 'ArrowUp', false, false, true);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        const childFirstRowCell =  childGrid.getCellByKey(0, 'ID');
        expect(childFirstRowCell.selected).toBe(true);
        expect(childFirstRowCell.columnIndex).toBe(0);
        expect(childFirstRowCell.rowIndex).toBe(0);

        const currScrTop = getScrollTop(hierarchicalGrid);
        const childGridOffset = childGrid.nativeElement.offsetTop;
        expect(currScrTop).toBeLessThanOrEqual(childGrid.rowHeight + 1 + childGridOffset);
    }));

    it('should scroll top of child grid into view when pressing Ctrl + Arrow Up when cell is selected in it.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(7);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[3];
        const childLastRowCell =  childGrid.getCellByKey(9, 'ID');
        GridFunctions.simulateCellKeydown(childLastRowCell, 'ArrowUp', false, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const childFirstRowCell =  childGrid.getCellByKey(0, 'ID');
        expect(childFirstRowCell.selected).toBe(true);
        expect(childFirstRowCell.columnIndex).toBe(0);
        expect(childFirstRowCell.rowIndex).toBe(0);

        const currScrTop = getScrollTop(hierarchicalGrid);
        expect(currScrTop).toBeGreaterThanOrEqual(2000);
    }));

    it('when navigating down from parent into child should scroll child grid to top and start navigation from first row.', (async () => {
        const ri = fixture.componentInstance.rowIsland;
        ri.height = '200px';
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        childGrid.verticalScrollContainer.scrollTo(9);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        let currScrTop = getScrollTop(childGrid);
        expect(currScrTop).toBeGreaterThan(0);

        const fCell = hierarchicalGrid.getCellByKey(0, 'ID');
        fCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(fCell, 'ArrowDown');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const childFirstCell =  childGrid.getCellByKey(0, 'ID');

        expect(childFirstCell.selected).toBe(true);
        expect(childFirstCell.focused).toBe(true);
        expect(childFirstCell.rowIndex).toBe(0);

        currScrTop = getScrollTop(childGrid);
        expect(currScrTop).toBeLessThanOrEqual(10);
    }));

    it('when navigating up from parent into child should scroll child grid to bottom and start navigation from last row.', (async () => {
        const ri = fixture.componentInstance.rowIsland;
        ri.height = '200px';
        await wait();
        fixture.detectChanges();

        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.getCellByKey(1, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'ArrowUp');
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const vertScr = childGrid.verticalScrollContainer.getScroll();
        const currScrTop = vertScr.scrollTop;
        // should be scrolled to bottom
        expect(currScrTop).toBe(vertScr.scrollHeight - vertScr.clientHeight);
    }));

    it('should horizontally scroll first cell in view when navigating from parent into child with Tab', (async () => {
        const horizontalScrDir = hierarchicalGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childHorizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        childHorizontalScrDir.scrollTo(7);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const lastParentCell = hierarchicalGrid.getCellByKey(0, 'childData2');
        lastParentCell.onFocus(null);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('Tab', lastParentCell.nativeElement, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const firstChildCell = childGrid.getCellByColumn(0, 'ID');
        expect(firstChildCell.selected).toBe(true);
        expect(firstChildCell.focused).toBe(true);
        expect(firstChildCell.rowIndex).toBe(0);
        expect(firstChildCell.columnIndex).toBe(0);
    }));

    it('should horizontally scroll last cell in view when navigating from parent into child with Shift+Tab',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell =  hierarchicalGrid.getCellByKey(1, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'Tab', false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastRowCell =  childGrid.getCellByKey(9, 'childData2');

        expect(childLastRowCell.selected).toBe(true);
        expect(childLastRowCell.focused).toBe(true);
        expect(childLastRowCell.rowIndex).toBe(9);
        expect(childLastRowCell.columnIndex).toBe(6);
    }));

    it('should move focus to last data cell in grid when ctrl+end is used.', (async () => {
        const parentCell = hierarchicalGrid.getCellByKey(0, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'End', false, false, true);
        await wait(200);
        fixture.detectChanges();
        await wait(200);
        fixture.detectChanges();

        const lastDataCell = hierarchicalGrid.getCellByKey(19, 'childData2');
        expect(lastDataCell.selected).toBe(true);
        expect(lastDataCell.focused).toBe(true);
        expect(lastDataCell.rowIndex).toBe(38);
        expect(lastDataCell.columnIndex).toBe(6);
    }));

    it('if next child cell is not in view should scroll parent so that it is in view.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(4);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.getCellByKey(2, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        const prevScroll = getScrollTop(hierarchicalGrid);
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowDown');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        expect(getScrollTop(hierarchicalGrid) - prevScroll).toBeGreaterThanOrEqual(100);
    }));

    it('should expand/collapse hierarchical row using ALT+Arrow Right/ALT+Arrow Left.', () => {
        const parentRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
        expect(parentRow.expanded).toBe(true);
        let parentCell = parentRow.cells.toArray()[0];
        parentCell.onFocus(null);
        fixture.detectChanges();

        // collapse
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowLeft', true);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(false);

        // expand
        parentCell = parentRow.cells.toArray()[0];
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowRight', true);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(true);
    });

    it('should retain focused cell when expand/collapse hierarchical row using ALT+Arrow Right/ALT+Arrow Left.', (async () => {
        // scroll to last row
        const lastDataIndex = hierarchicalGrid.dataView.length - 2;
        hierarchicalGrid.verticalScrollContainer.scrollTo(lastDataIndex);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        hierarchicalGrid.verticalScrollContainer.scrollTo(lastDataIndex);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        let parentCell = hierarchicalGrid.getCellByColumn(38, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();
         // collapse
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowLeft', true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        parentCell = hierarchicalGrid.getCellByColumn(38, 'ID');
        expect(parentCell.selected).toBeTruthy();

        // expand
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowRight', true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        parentCell = hierarchicalGrid.getCellByColumn(38, 'ID');
        expect(parentCell.selected).toBeTruthy();
    }));

    it('should expand/collapse hierarchical row using ALT+Arrow Down/ALT+Arrow Up.', () => {
        const parentRow = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        expect(parentRow.expanded).toBe(true);
        let parentCell = parentRow.cells.toArray()[0];
        parentCell.onFocus(null);
        fixture.detectChanges();

        // collapse
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowUp', true);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(false);

        // expand
        parentCell = parentRow.cells.toArray()[0];
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowDown', true);
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(true);
    });

    it('should skip child grids that have no data when navigating up/down', (async () => {
        // set first child to not have data
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        child1.data = [];
        fixture.detectChanges();

        const parentRow = hierarchicalGrid.dataRowList.toArray()[0];
        const parentCell = parentRow.cells.toArray()[0];
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'ArrowDown');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // second data row in parent should be focused
        const parentRow2 = hierarchicalGrid.getRowByIndex(2);
        const parentCell2 = parentRow2.cells.toArray()[0];

        expect(parentCell2.selected).toBeTruthy();
        expect(parentCell2.focused).toBeTruthy();

        GridFunctions.simulateCellKeydown(parentCell2, 'ArrowUp');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // first data row in parent should be focused
        expect(parentCell.selected).toBeTruthy();
        expect(parentCell.focused).toBeTruthy();
    }));

    it('should skip nested child grids that have no data when navigating up/down', (async () => {
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        child1.height = '150px';
        fixture.detectChanges();

        const row = child1.getRowByIndex(0) as IgxHierarchicalRowComponent;
        row.toggle();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        //  set nested child to not have data
        const subChild = child1.hgridAPI.getChildGrids(false)[0];
        subChild.data = [];
        fixture.detectChanges();

        const fchildRowCell = row.cells.toArray()[0];
        GridFunctions.simulateCellKeydown(fchildRowCell, 'ArrowDown');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        // second child row should be in view
        const sChildRowCell = child1.getRowByIndex(2).cells.toArray()[0];
        expect(sChildRowCell.selected).toBeTruthy();
        expect(sChildRowCell.focused).toBeTruthy();

        expect(getScrollTop(child1)).toBeGreaterThanOrEqual(150);

        GridFunctions.simulateCellKeydown(sChildRowCell, 'ArrowUp');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(fchildRowCell.selected).toBeTruthy();
        expect(fchildRowCell.focused).toBeTruthy();
        expect(getScrollTop(child1)).toBe(0);
    }));

    it('should move focus to/from filter chip when navigat with Tab/Shift+Tab from parent to child that has filtering. ', (async () => {
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        child1.allowFiltering = true;
        fixture.detectChanges();

        const horizontalScrDir = hierarchicalGrid.getRowByIndex(0).virtDirRow;
        horizontalScrDir.scrollTo(6);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const lastParentCell = hierarchicalGrid.getCellByColumn(0, 'childData2');
        lastParentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(lastParentCell, 'Tab');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const filterItem = fixture.debugElement.query(By.css(CHIP_ITEM_CLASS));
        const firstFilterItem =  filterItem.nativeElement;
        expect(document.activeElement === firstFilterItem).toBeTruthy();

        UIInteractions.triggerKeyDownEvtUponElem('Tab', firstFilterItem.closest(FILTER_CELL_CLASS), true, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        expect(lastParentCell.selected).toBeTruthy();
        expect(lastParentCell.focused).toBeTruthy();
    }));

    it('should navigate inside summary row with Ctrl + Arrow Right/ Ctrl + Arrow Left', (async () => {
        const col = hierarchicalGrid.getColumnByName('ID');
        col.hasSummary = true;
        fixture.detectChanges();

        const summaryCells = hierarchicalGrid.summariesRowList.toArray()[0].summaryCells.toArray();

        const firstCell =  summaryCells[0];
        firstCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(firstCell, 'ArrowRight', false, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const lastCell = summaryCells.find((s) => s.column.field === 'childData2');
        expect(lastCell.focused).toBeTruthy();

        GridFunctions.simulateCellKeydown(lastCell, 'ArrowLeft', false, false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(firstCell.focused).toBeTruthy();
    }));

    it('should navigate to Cancel button when there is row in edit mode', async () => {
        hierarchicalGrid.columnList.forEach((c) => {
            if (c.field !== hierarchicalGrid.primaryKey) {
                c.editable = true; }});
        fixture.detectChanges();

        hierarchicalGrid.rowEditable = true;
        fixture.detectChanges();

        expect(hierarchicalGrid.rowEditable).toBe(true);
        const cellID = hierarchicalGrid.getCellByColumn(0, 'ID');
        GridFunctions.simulateCellKeydown(cellID, 'End');
        await wait();
        fixture.detectChanges();

        const cell = hierarchicalGrid.getCellByColumn(0, 'childData2');
        GridFunctions.simulateCellKeydown(cell, 'Enter');
        await wait();
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(cell, 'Tab');
        await wait();
        fixture.detectChanges();
        const activeEl = document.activeElement;
        expect(activeEl.innerHTML).toEqual('Cancel');

        UIInteractions.triggerKeyDownEvtUponElem('tab', activeEl, true, false, true);
        await wait();
        fixture.detectChanges();

       expect(document.activeElement.tagName.toLowerCase()).toBe('igx-hierarchical-grid-cell');
    });

    it('should navigate to row edit button "Done" on shift + tab', async () => {
        hierarchicalGrid.columnList.forEach((c) => {
            if (c.field !== hierarchicalGrid.primaryKey) {
                c.editable = true; }});
        hierarchicalGrid.rowEditable = true;
        hierarchicalGrid.getColumnByName('ID').hidden = true;
        fixture.detectChanges();

        expect(hierarchicalGrid.rowEditable).toBe(true);
        hierarchicalGrid.navigateTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const cell = hierarchicalGrid.getCellByColumn(2, 'ChildLevels');
        cell.nativeElement.focus();
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(cell, 'Enter');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(cell, 'Tab', false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const activeEl = document.activeElement;
        expect(activeEl.innerHTML).toEqual('Done');

        UIInteractions.triggerKeyDownEvtUponElem('Tab', activeEl, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

       expect(document.activeElement.tagName.toLowerCase()).toBe('igx-hierarchical-grid-cell');
    });
});

describe('IgxHierarchicalGrid Complex Navigation #hGrid', () => {
        configureTestSuite();
        let fixture;
        let hierarchicalGrid: IgxHierarchicalGridComponent;
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxHierarchicalGridTestComplexComponent
                ],
                imports: [
                    NoopAnimationsModule, IgxHierarchicalGridModule]
            }).compileComponents();
        }));

        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestComplexComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
        }));

        // complex tests
        it('in case prev cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', (async () => {
            // scroll parent so that child top is not in view
            hierarchicalGrid.verticalScrollContainer.addScrollTop(300);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const nestedChild = child.hgridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.getCellByKey(1, 'ID');
            let oldScrTop = getScrollTop(hierarchicalGrid);

            nestedChildCell.onFocus(null);
            fixture.detectChanges();

            // navigate up
            GridFunctions.simulateCellKeydown(nestedChildCell, 'ArrowUp');
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            let nextCell =  nestedChild.getCellByKey(0, 'ID');
            let currScrTop = getScrollTop(hierarchicalGrid);
            const elemHeight = nestedChildCell.row.nativeElement.offsetHeight;
            // check if parent of parent has been scroll up so that the focused cell is in view
            expect(oldScrTop - currScrTop).toEqual(elemHeight);
            oldScrTop = currScrTop;

            expect(nextCell.selected).toBe(true);
            expect(nextCell.focused).toBe(true);
            expect(nextCell.rowIndex).toBe(0);

            // navigate up into parent
            GridFunctions.simulateCellKeydown(nextCell, 'ArrowUp');
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            nextCell =  child.getCellByKey(0, 'ID');
            currScrTop = getScrollTop(hierarchicalGrid);
            expect(oldScrTop - currScrTop).toBeGreaterThanOrEqual(100);

            expect(nextCell.selected).toBe(true);
            expect(nextCell.focused).toBe(true);
            expect(nextCell.rowIndex).toBe(0);
        }));

        it('in case next cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', (async () => {
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const nestedChild = child.hgridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.getCellByKey(1, 'ID');
             // navigate down in nested child
            nestedChildCell.onFocus(null);
            fixture.detectChanges();

            GridFunctions.simulateCellKeydown(nestedChildCell, 'ArrowDown');
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            // check if parent has scrolled down to show focused cell.
            expect(getScrollTop(child)).toBe(nestedChildCell.row.nativeElement.offsetHeight);
            const nextCell = nestedChild.getCellByKey(2, 'ID');

            expect(nextCell.selected).toBe(true);
            expect(nextCell.focused).toBe(true);
            expect(nextCell.rowIndex).toBe(2);
        }));

        it('should allow navigating up from parent into nested child grid', (async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const lastIndex =  child.dataView.length - 1;
            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();
            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const parentCell = hierarchicalGrid.getCellByColumn(2, 'ID');
            parentCell.onFocus(null);
            fixture.detectChanges();

            GridFunctions.simulateCellKeydown(parentCell, 'ArrowUp');
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const nestedChild = child.hgridAPI.getChildGrids(false)[5];
            const lastCell = nestedChild.getCellByColumn(4, 'ID');
            expect(lastCell.selected).toBe(true);
            expect(lastCell.focused).toBe(true);
            expect(lastCell.rowIndex).toBe(4);
        }));

        it('should navigate to the first cell of next row using Tab from last cell in the row above', (async () => {
            hierarchicalGrid.expandChildren = false;
            hierarchicalGrid.width = '1000px';
            fixture.componentInstance.rowIsland.height = '350px';
            fixture.detectChanges();

            const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            row.toggle();
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const cell = hierarchicalGrid.getCellByColumn(2, 'childData2');
            cell.onFocus(null);
            fixture.detectChanges();

            GridFunctions.simulateCellKeydown(cell, 'Tab');
            await wait(DEBOUNCE_TIME);
            fixture.detectChanges();

            const currentCell = hierarchicalGrid.getCellByColumn(3, 'ID');
            expect(currentCell.focused).toBe(true);
            expect(currentCell.rowIndex).toBe(3);
        }));
});

describe('IgxHierarchicalGrid Multi-layout Navigation #hGrid', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridMultiLayoutComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridMultiLayoutComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
        setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
    }));

    it('should allow navigating up between sibling child grids.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[4];

        const child2Cell = child2.getCellByKey(0, 'ID');
        GridFunctions.simulateCellKeydown(child2Cell, 'ArrowUp');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const lastCellPrevRI = child1.getCellByKey(9, 'ID');
        expect(lastCellPrevRI.selected).toBe(true);
        expect(lastCellPrevRI.rowIndex).toBe(9);
    }));

    it('should allow navigating down between sibling child grids.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

        child1.verticalScrollContainer.scrollTo(child1.dataView.length - 1);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[4];
        const lastCellPrevRI = child1.getCellByKey(9, 'ID');
        GridFunctions.simulateCellKeydown(lastCellPrevRI, 'ArrowDown');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child2Cell = child2.getCellByKey(0, 'ID');
        expect(child2Cell.selected).toBe(true);
    }));

    it('should allow navigating with Tab between sibling child grids.', (async () => {
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        child1.verticalScrollContainer.scrollTo(child1.dataView.length - 1);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const rowVirt = child1.getRowByIndex(8).virtDirRow;
        rowVirt.scrollTo(rowVirt.igxForOf.length - 1);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // Tab from last cell in 1st child
        const child1Cell = child1.getCellByColumn(9, 'childData');
        GridFunctions.simulateCellKeydown(child1Cell, 'Tab');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[4];
        const child2Cell = child2.getCellByKey(0, 'ID');
        expect(child2Cell.selected).toBe(true);
    }));

    it('should allow navigating with Shift+Tab between sibling child grids.', (async () => {
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[4];

        // Shift + Tab from 2nd child
        const child2Cell = child2.getCellByKey(0, 'ID');
        GridFunctions.simulateCellKeydown(child2Cell, 'Tab', false, true);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child1Cell = child1.getCellByColumn(9, 'childData');
        expect(child1Cell.selected).toBe(true);
        expect(child1Cell.rowIndex).toBe(9);
        expect(child1Cell.columnIndex).toBe(6);
    }));

    it('should navigate up from parent row to the correct child sibling.', (async () => {
        const parentCell = hierarchicalGrid.getCellByKey(1, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        // Arrow Up into prev child grid
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowUp');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[4];
        const child2Cell = child2.getCellByKey(9, 'ID');
        expect(child2Cell.selected).toBe(true);
        expect(child2Cell.focused).toBe(true);
        expect(child2Cell.rowIndex).toBe(9);
    }));

    it('should navigate down from parent row to the correct child sibling.', (async () => {
        const parentCell = hierarchicalGrid.getCellByKey(0, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        // Arrow down into next child grid
        GridFunctions.simulateCellKeydown(parentCell, 'ArrowDown');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child1Cell = child1.getCellByKey(0, 'ID');
        expect(child1Cell.selected).toBe(true);
        expect(child1Cell.focused).toBe(true);
        expect(child1Cell.rowIndex).toBe(0);
    }));

    it('should navigate to last cell in previous child using Arrow Up from last cell of sibling with more columns', (async () => {
        const childGrid2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[4];
        childGrid2.dataRowList.toArray()[0].virtDirRow.scrollTo(7);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const child2LastCell = childGrid2.getCellByKey(0, 'childData2');
        child2LastCell.onFocus(null);
        fixture.detectChanges();

        // Shift + Tab inside 2nd child
        GridFunctions.simulateCellKeydown(child2LastCell, 'ArrowUp');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastCell = childGrid.getCellByKey(9, 'childData');
        expect(childLastCell.selected).toBeTruthy();
        expect(childLastCell.focused).toBeTruthy();
    }));
});

describe('IgxHierarchicalGrid Smaller Child Navigation #hGrid', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridSmallerChildComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        }).compileComponents();
    }));
    beforeEach(async(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridSmallerChildComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
        setupHierarchicalGridScrollDetection(fixture, hierarchicalGrid);
    }));

    it('should navigate to last cell in next row for child grid using Arrow Down from last cell of parent with more columns', () => {
        const parentCell = hierarchicalGrid.getCellByColumn(0, 'Col2');
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'ArrowDown');
        fixture.detectChanges();

        // last cell in child should be focused
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastCell =  childGrid.getCellByColumn(0, 'Col1');
        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
    });

    it('should navigate to last cell in next row for child grid using Arrow Up from last cell of parent with more columns', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.getCellByColumn(2, 'Col2');
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'ArrowUp');
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        // last cell in child should be focused
        const childGrids =  fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
        const childGrid = childGrids[1].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;
        const childLastCell =  childGrid.getCellByColumn(9, 'ProductName');
        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
    }));

    it('should navigate to last cell in previous row for child grid using Shift+Tab from parent with more columns', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(DEBOUNCE_TIME);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.getCellByColumn(2, 'ID');
        parentCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(parentCell, 'Tab', false, true);
        await wait();
        fixture.detectChanges();

        const childGrids =  fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
        const childGrid = childGrids[1].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;
        const childLastCell =  childGrid.getCellByColumn(9, 'ProductName');
        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
    }));

    it('should navigate to last cell in next child using Arrow Down from last cell of previous child with more columns', (async () => {
        const childGrids =  fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
        const firstChildGrid = childGrids[0].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;
        const secondChildGrid = childGrids[1].query(By.directive(IgxHierarchicalGridComponent)).componentInstance;

        firstChildGrid.verticalScrollContainer.scrollTo(9);
        await wait(100);
        fixture.detectChanges();

        const firstChildCell =  firstChildGrid.getCellByColumn(9, 'Col1');
        firstChildCell.onFocus(null);
        fixture.detectChanges();

        GridFunctions.simulateCellKeydown(firstChildCell, 'ArrowDown');
        fixture.detectChanges();

        const secondChildCell =  secondChildGrid.getCellByColumn(0, 'ProductName');
        expect(secondChildCell.selected).toBe(true);
        expect(secondChildCell.focused).toBe(true);
    }));
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
     [autoGenerate]="true" [height]="'600px'" [width]="'800px'" #hierarchicalGrid primaryKey="ID" [expandChildren]='true'>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [height]="null" primaryKey="ID" #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" [height]="null"primaryKey="ID" >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestBaseComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;

    constructor() {
        // 3 level hierarchy
        this.data = this.generateData(20, 3);
    }
    generateData(count: number, level: number) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
           if (level > 0 ) {
               children = this.generateData(count / 2 , currLevel - 1);
           }
           prods.push({
            ID: i, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
            'Col2': i, 'Col3': i, childData: children, childData2: children });
        }
        return prods;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [height]="'400px'" [width]="'500px'" [data]="data" [autoGenerate]="true"
    [expandChildren]='true' primaryKey="ID" #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [expandChildren]='true' [height]="'300px'"primaryKey="ID" #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" [height]="'200px'" primaryKey="ID">
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
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
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="true" [height]="'400px'" [width]="'500px'"
    [expandChildren]='true' primaryKey="ID" #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [height]="'100px'" primaryKey="ID">
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'" primaryKey="ID">
            </igx-row-island>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'" primaryKey="ID">
        </igx-row-island>
    </igx-hierarchical-grid>`
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
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridSmallerChildComponent extends IgxHierarchicalGridTestBaseComponent {}

function getScrollTop(hgrid: IgxHierarchicalGridComponent) {
    return hgrid.verticalScrollContainer.getScroll().scrollTop;
}
