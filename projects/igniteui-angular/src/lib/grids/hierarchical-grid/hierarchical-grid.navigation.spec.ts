import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, Injectable,
    OnInit, ViewChild, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxRowIslandComponent } from './row-island.component';

describe('IgxHierarchicalGrid Basic Navigation', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeEach(async(() => {
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
    }));

    // simple tests
    it('should allow navigating down from parent row into child grid.', () => {
        const fCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0].nativeElement;
        fCell.focus();
        fixture.detectChanges();
        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowDown',
            key: 'ArrowDown'
        });
        fCell.dispatchEvent(keyboardEvent);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];

        expect(childFirstCell.selected).toBe(true);
        expect(childFirstCell.focused).toBe(true);
    });

    it('should allow navigating up from child row into parent grid.', () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        childFirstCell.nativeElement.focus();
        childGrid.cdr.detectChanges();

        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowUp',
            key: 'ArrowUp'
        });
        childFirstCell.nativeElement.dispatchEvent(keyboardEvent);
        fixture.detectChanges();

        const parentFirstCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(parentFirstCell.selected).toBe(true);
        expect(parentFirstCell.focused).toBe(true);
    });

    it('should allow navigating down in child grid when child grid selected cell moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[3].cells.toArray()[0];
        childCell.nativeElement.focus();
        fixture.detectChanges();
        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowDown',
            key: 'ArrowDown'
        });
        childCell.nativeElement.dispatchEvent(keyboardEvent);
        await wait(100);
        fixture.detectChanges();
        // parent should scroll down so that cell in child is in view.
        expect(hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop)
        .toBeGreaterThanOrEqual(childGrid.rowHeight);
    }));

    it('should allow navigating up in child grid when child grid selected cell moves outside the parent view port.',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
        childCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();
        const prevScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;

        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowUp',
            key: 'ArrowUp'
        });
        childCell.nativeElement.dispatchEvent(keyboardEvent);
        await wait(100);
        fixture.detectChanges();
        // parent should scroll up so that cell in child is in view.
        const currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(prevScrTop - currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight);
    }));

    it('should allow navigation with Tab from parent into child.', (async () => {
        // scroll to last column
        const horizontalScrDir = hierarchicalGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        await wait(100);
        fixture.detectChanges();
        const lastCell = hierarchicalGrid.getCellByKey(0, 'childData2');
        lastCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('Tab', lastCell.nativeElement, true);

        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];

        expect(childFirstCell.selected).toBe(true);
        expect(childFirstCell.focused).toBe(true);
    }));

    it('should allow navigation with Shift+Tab from child into parent grid.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        childFirstCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        childFirstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(100);
        fixture.detectChanges();
        const lastCell = hierarchicalGrid.getCellByKey(0, 'childData2');
        expect(lastCell.selected).toBe(true);
        expect(lastCell.focused).toBe(true);
    }));

    it('should allow navigation with Tab from child into parent row.',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        await wait(100);
        fixture.detectChanges();

        const childLastCell =  childGrid.getCellByColumn(9, 'childData2');
        childLastCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('Tab', childLastCell.nativeElement, true);
        await wait(100);
        fixture.detectChanges();
        const nextCell = hierarchicalGrid.getCellByKey(1, 'ID');
        expect(nextCell.selected).toBe(true);
        expect(nextCell.focused).toBe(true);


    }));

    it('should allow navigation with Shift+Tab from parent into child grid.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.getCellByKey(1, 'ID');
        parentCell.nativeElement.focus();

        await wait(100);
        fixture.detectChanges();

        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));

        await wait(100);
        fixture.detectChanges();

        // last cell in child should be focused
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastCell =  childGrid.getCellByColumn(9, 'childData2');

        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
    }));

    it('should allow navigating to end in child grid when child grid target row moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        childCell.nativeElement.focus();
        fixture.detectChanges();
        childCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }));
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        await wait(100);
        const childLastCell =  childGrid.getCellByColumn(9, 'childData2');
        // correct cell should be focused
        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
        expect(childLastCell.columnIndex).toBe(6);
        expect(childLastCell.rowIndex).toBe(9);

        // parent should be scrolled down
        const currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 5);
    }));

    it('should allow navigating to start in child grid when child grid target row moves outside the parent view port.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

        const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        const childLastCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[3];
        childLastCell.nativeElement.focus();
        fixture.detectChanges();
        childLastCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true }));
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        await wait(100);
        const childCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(childCell.selected).toBe(true);
        expect(childCell.focused).toBe(true);
        expect(childCell.columnIndex).toBe(0);
        expect(childCell.rowIndex).toBe(0);

        const currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(currScrTop).toBeLessThanOrEqual(childGrid.rowHeight + 1);
    }));

    it('should allow navigating to bottom in child grid when child grid target row moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        childCell.nativeElement.focus();
        fixture.detectChanges();
        childCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true }));
        fixture.detectChanges();
        await wait(1000);
        fixture.detectChanges();
        const childLastRowCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[0];
        expect(childLastRowCell.selected).toBe(true);
        expect(childLastRowCell.columnIndex).toBe(0);
        expect(childLastRowCell.rowIndex).toBe(9);

        const currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 5);
    }));

    it('should allow navigating to top in child grid when child grid target row moves outside the parent view port.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastRowCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[0];
        childLastRowCell.nativeElement.focus();
        fixture.detectChanges();
        childLastRowCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true }));
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        const childFirstRowCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(childFirstRowCell.selected).toBe(true);
        expect(childFirstRowCell.columnIndex).toBe(0);
        expect(childFirstRowCell.rowIndex).toBe(0);

        const currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(currScrTop).toBeLessThanOrEqual(childGrid.rowHeight + 1);
    }));

    it('when navigating down from parent into child should scroll child grid to top and start navigation from first row.', (async () => {
        const ri = fixture.componentInstance.rowIsland;
        ri.height = '200px';
        ri.cdr.detectChanges();
        await wait(100);
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        childGrid.verticalScrollContainer.scrollTo(9);
        await wait(100);
        fixture.detectChanges();
        let currScrTop = childGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(currScrTop).toBeGreaterThan(0);

        const fCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0].nativeElement;
        fCell.focus();
        fixture.detectChanges();
        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowDown',
            key: 'ArrowDown'
        });
        fCell.dispatchEvent(keyboardEvent);
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];

        expect(childFirstCell.selected).toBe(true);
        expect(childFirstCell.focused).toBe(true);
        expect(childFirstCell.rowIndex).toBe(0);

        currScrTop = childGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(currScrTop).toBeLessThanOrEqual(10);
    }));

    it('when navigating up from parent into child should scroll child grid to bottom and start navigation from last row.', (async () => {
        const ri = fixture.componentInstance.rowIsland;
        ri.height = '200px';
        ri.cdr.detectChanges();
        hierarchicalGrid.cdr.detectChanges();
        fixture.detectChanges();
        await wait(100);
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        hierarchicalGrid.cdr.detectChanges();
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.dataRowList.toArray()[1].cells.toArray()[0];
        parentCell.nativeElement.focus();
        fixture.detectChanges();
        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowUp',
            key: 'ArrowUp'
        });
        parentCell.dispatchEvent(keyboardEvent);
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        await wait(100);

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const vertScr = childGrid.verticalScrollContainer.getVerticalScroll();
        const currScrTop = vertScr.scrollTop;
        // should be scrolled to bottom
        expect(currScrTop).toBe(vertScr.scrollHeight - vertScr.clientHeight);

    }));

    it('should horizontally scroll first cell in view when navigating from parent into child with Tab', (async () => {
        const horizontalScrDir = hierarchicalGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(6);

        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childHorizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        childHorizontalScrDir.scrollTo(7);

        await wait(100);
        fixture.detectChanges();

        const lastParentCell = hierarchicalGrid.getCellByKey(0, 'childData2');
        lastParentCell.nativeElement.focus();
        fixture.detectChanges();
        UIInteractions.triggerKeyDownEvtUponElem('Tab', lastParentCell.nativeElement, true);
        await wait(100);
        fixture.detectChanges();

        const firstChildCell = childGrid.getCellByColumn(0, 'ID');
        expect(firstChildCell.selected).toBe(true);
        expect(firstChildCell.focused).toBe(true);
        expect(firstChildCell.rowIndex).toBe(0);
        expect(firstChildCell.columnIndex).toBe(0);

    }));

    it('should horizontally scroll last cell in view when navigating from parent into child with Shift+Tab',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();
        const parentCell =  hierarchicalGrid.getCellByKey(1, 'ID');
        parentCell.nativeElement.focus();

        await wait(100);
        fixture.detectChanges();

        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childLastRowCell =  childGrid.getCellByColumn(9, 'childData2');

        expect(childLastRowCell.selected).toBe(true);
        expect(childLastRowCell.focused).toBe(true);
        expect(childLastRowCell.rowIndex).toBe(9);
        expect(childLastRowCell.columnIndex).toBe(6);
    }));

    it('should move focus to last data cell in grid when ctrl+end is used.', (async () => {
        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        parentCell.nativeElement.focus();

        await wait(100);
        fixture.detectChanges();

        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }));
        await wait(1000);
        fixture.detectChanges();

        const lastDataCell = hierarchicalGrid.getCellByKey(19, 'childData2');
        expect(lastDataCell.selected).toBe(true);
        expect(lastDataCell.focused).toBe(true);
        expect(lastDataCell.rowIndex).toBe(38);
        expect(lastDataCell.columnIndex).toBe(6);
    }));
    it('if next child cell is not in view should scroll parent so that it is in view.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(4);
        await wait(100);
        fixture.detectChanges();
        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        parentCell.nativeElement.focus();
        fixture.detectChanges();
        const prevScroll = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        await wait(100);
        fixture.detectChanges();
        expect(  hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop - prevScroll).toBeGreaterThanOrEqual(100);
    }));

    it('should expand/collapse hierarchical row using ALT+Arrow Right/ALT+Arrow Left.', () => {
        const parentRow = hierarchicalGrid.dataRowList.toArray()[0];
        expect(parentRow.expanded).toBe(true);
        let parentCell = parentRow.cells.toArray()[0];
        parentCell.nativeElement.focus();
        fixture.detectChanges();
        // collapse
        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(false);
        // expand
        parentCell = parentRow.cells.toArray()[0];
        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
        fixture.detectChanges();
        expect(parentRow.expanded).toBe(true);
    });
});


describe('IgxHierarchicalGrid Complex Navigation', () => {
        configureTestSuite();
        let fixture;
        let hierarchicalGrid: IgxHierarchicalGridComponent;
        beforeEach(async(() => {
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
        }));

        // complex tests
        it('in case prev cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', (async () => {
            // scroll parent so that child top is not in view
            hierarchicalGrid.verticalScrollContainer.addScrollTop(300);
            await wait(100);
            fixture.detectChanges();
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const nestedChild = child.hgridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.dataRowList.toArray()[1].cells.toArray()[0];
            nestedChildCell.nativeElement.focus();
            let oldScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            await wait(100);
            fixture.detectChanges();
            // navigate up
            const keyboardEvent = new KeyboardEvent('keydown', {
                code: 'ArrowUp',
                key: 'ArrowUp'
            });
            nestedChildCell.dispatchEvent(keyboardEvent);
            await wait(100);
            fixture.detectChanges();

            let nextCell =  nestedChild.dataRowList.toArray()[0].cells.toArray()[0];
            let currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            const elemHeight = nestedChildCell.row.nativeElement.offsetHeight;
            // check if parent of parent has been scroll up so that the focused cell is in view
            expect(oldScrTop - currScrTop).toEqual(elemHeight);
            oldScrTop = currScrTop;

            expect(nextCell.selected).toBe(true);
            expect(nextCell.focused).toBe(true);
            expect(nextCell.rowIndex).toBe(0);

            // navigate up into parent
            nextCell.dispatchEvent(keyboardEvent);
            await wait(100);
            fixture.detectChanges();

            nextCell =  child.dataRowList.toArray()[0].cells.toArray()[0];
            currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            expect(oldScrTop - currScrTop).toBeGreaterThanOrEqual(100);

            expect(nextCell.selected).toBe(true);
            expect(nextCell.focused).toBe(true);
            expect(nextCell.rowIndex).toBe(0);

        }));

        it('in case next cell is not in view port should scroll the closest scrollable parent so that cell comes in view.', (async () => {
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const nestedChild = child.hgridAPI.getChildGrids(false)[0];
            const nestedChildCell = nestedChild.dataRowList.toArray()[1].cells.toArray()[0];
             // navigate down in nested child
            nestedChildCell.nativeElement.focus();
            await wait(100);
            fixture.detectChanges();

            const keyboardEvent = new KeyboardEvent('keydown', {
                code: 'ArrowDown',
                key: 'ArrowDown'
            });
            nestedChildCell.dispatchEvent(keyboardEvent);
            await wait(100);
            fixture.detectChanges();
            // check if parent has scrolled down to show focused cell.
            expect(child.verticalScrollContainer.getVerticalScroll().scrollTop).toBe(nestedChildCell.row.nativeElement.offsetHeight);
            const nextCell = nestedChild.dataRowList.toArray()[2].cells.toArray()[0];

            expect(nextCell.selected).toBe(true);
            expect(nextCell.focused).toBe(true);
            expect(nextCell.rowIndex).toBe(2);
        }));

        it('should allow navigating up from parent into nested child grid', (async () => {
            hierarchicalGrid.verticalScrollContainer.scrollTo(2);
            await wait(100);
            fixture.detectChanges();
            const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const lastIndex =  child.verticalScrollContainer.igxForOf.length - 1;
            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait(100);
            fixture.detectChanges();
            child.verticalScrollContainer.scrollTo(lastIndex);
            await wait(100);
            fixture.detectChanges();

            const parentCell = hierarchicalGrid.getCellByColumn(2, 'ID');
            parentCell.nativeElement.focus();
            await wait(100);
            fixture.detectChanges();

            const keyboardEvent = new KeyboardEvent('keydown', {
                code: 'ArrowUp',
                key: 'ArrowUp'
            });
            parentCell.dispatchEvent(keyboardEvent);
            await wait(100);
            fixture.detectChanges();

            const nestedChild = child.hgridAPI.getChildGrids(false)[5];
            const lastCell = nestedChild.getCellByColumn(4, 'ID');
            expect(lastCell.selected).toBe(true);
            expect(lastCell.focused).toBe(true);
            expect(lastCell.rowIndex).toBe(4);

        }));
});

describe('IgxHierarchicalGrid Multi-layout Navigation', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeEach(async(() => {
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
    }));
    it('should allow navigating up/down between sibling child grids.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[3];

        const child2Cell = child2.dataRowList.toArray()[0].cells.toArray()[0];
        child2Cell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        let keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowUp',
            key: 'ArrowUp'
        });
        child2Cell.dispatchEvent(keyboardEvent);
        await wait(100);
        fixture.detectChanges();
        const lastCellPrevRI = child1.dataRowList.toArray()[1].cells.toArray()[0];

        expect(lastCellPrevRI.selected).toBe(true);
        expect(lastCellPrevRI.focused).toBe(true);
        expect(lastCellPrevRI.rowIndex).toBe(9);

        keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowDown',
            key: 'ArrowDown'
        });
        lastCellPrevRI.dispatchEvent(keyboardEvent);
        await wait(100);
        fixture.detectChanges();
        expect(child2Cell.selected).toBe(true);
    }));
    it('should allow navigating with Tab/Shift+Tab between sibling child grids.', (async () => {
        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[3];

        const child2Cell = child2.dataRowList.toArray()[0].cells.toArray()[0];
        child2Cell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        // Shift + Tab from 2nd child
        child2Cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(100);
        fixture.detectChanges();

        const child1Cell = child1.getCellByColumn(9, 'childData');

        expect(child1Cell.selected).toBe(true);
        expect(child1Cell.rowIndex).toBe(9);
        expect(child1Cell.columnIndex).toBe(6);

        // Tab from last cell in 1st child
        child1Cell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab'}));
        await wait(100);
        fixture.detectChanges();

        expect(child2Cell.selected).toBe(true);
    }));
    it('should navigate up from parent row to the correct child sibling.', (async () => {
        const parentCell = hierarchicalGrid.dataRowList.toArray()[1].cells.toArray()[0];
        parentCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        // Arrow Up into prev child grid
        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp'}));
        await wait(100);
        fixture.detectChanges();

        const child2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[3];

        const child2Cell = child2.dataRowList.toArray()[1].cells.toArray()[0];
        expect(child2Cell.selected).toBe(true);
        expect(child2Cell.focused).toBe(true);
        expect(child2Cell.rowIndex).toBe(9);
    }));
    it('should navigate down from parent row to the correct child sibling.', (async () => {
        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        parentCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        // Arrow down into next child grid
        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown'}));
        await wait(100);
        fixture.detectChanges();

        const child1 = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const child1Cell = child1.dataRowList.toArray()[0].cells.toArray()[0];
        expect(child1Cell.selected).toBe(true);
        expect(child1Cell.focused).toBe(true);
        expect(child1Cell.rowIndex).toBe(0);
    }));

    it('should navigate to last cell in previous row for child grid using Shift+Tab', (async () => {
        const childGrid2 = hierarchicalGrid.hgridAPI.getChildGrids(false)[3];
        childGrid2.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();

        const child2FirstCell = childGrid2.getCellByColumn(2, 'ID');
        child2FirstCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        // Shift + Tab insdie 2nd child
        child2FirstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(100);
        fixture.detectChanges();

        const child2LastCell = childGrid2.getCellByColumn(1, 'childData2');
        expect(child2LastCell.selected).toBeTruthy();
        expect(child2LastCell.focused).toBeTruthy();
    }));
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
     [autoGenerate]="true" [height]="'400px'" [width]="'500px'" #hierarchicalGrid primaryKey="ID" [expandChildren]='true'>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestBaseComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent }) public rowIsland2: IgxRowIslandComponent;

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
    [expandChildren]='true' #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [expandChildren]='true' [height]="'300px'" #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 [height]="'200px'" >
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
    [expandChildren]='true' #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [height]="'100px'">
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
            </igx-row-island>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="true" [height]="'100px'">
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridMultiLayoutComponent extends IgxHierarchicalGridTestBaseComponent {}
