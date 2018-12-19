import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, Injectable,
    OnInit, ViewChild, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxRowIslandComponent } from './row-island.component';

fdescribe('IgxHierarchicalGrid Navigation', () => {
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

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];

        expect(childFirstCell.selected).toBe(true);
        expect(childFirstCell.focused).toBe(true);
    });

    it('should allow navigating up from child row into parent grid.', () => {
        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
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
        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[3].cells.toArray()[0];
        childCell.nativeElement.focus();
        fixture.detectChanges();
        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowDown',
            key: 'ArrowDown'
        });
        childCell.nativeElement.dispatchEvent(keyboardEvent);
        await wait(10);
        fixture.detectChanges();
        // parent should scroll down so that cell in child is in view.
        expect(hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop)
        .toBeGreaterThanOrEqual(childGrid.rowHeight);
    }));

    it('should allow navigating up in child grid when child grid selected cell moves outside the parent view port.',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(10);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
        childCell.nativeElement.focus();
        await wait(10);
        fixture.detectChanges();
        const prevScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;

        const keyboardEvent = new KeyboardEvent('keydown', {
            code: 'ArrowUp',
            key: 'ArrowUp'
        });
        childCell.nativeElement.dispatchEvent(keyboardEvent);
        await wait(10);
        fixture.detectChanges();
        // parent should scroll up so that cell in child is in view.
        const currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(prevScrTop - currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight);
    }));

    it('should allow navigation with Tab from parent into child.', (async () => {
        // scroll to last column
        const horizontalScrDir = hierarchicalGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(7);
        await wait(10);
        fixture.detectChanges();
        const lastCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[4];
        lastCell.nativeElement.focus();
        await wait(10);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('Tab', lastCell.nativeElement, true);

        await wait(10);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];

        expect(childFirstCell.selected).toBe(true);
        expect(childFirstCell.focused).toBe(true);
    }));

    it('should allow navigation with Shift+Tab from child into parent grid.', (async () => {
        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childFirstCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        childFirstCell.nativeElement.focus();
        await wait(10);
        fixture.detectChanges();

        childFirstCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(10);
        fixture.detectChanges();
        const lastCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[4];
        expect(lastCell.selected).toBe(true);
        expect(lastCell.focused).toBe(true);
    }));

    it('should allow navigation with Tab from child into parent row.',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(10);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(7);
        await wait(10);
        fixture.detectChanges();

        const childLastCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[4];
        childLastCell.nativeElement.focus();
        await wait(10);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('Tab', childLastCell.nativeElement, true);
        await wait(10);
        fixture.detectChanges();
        const nextCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(nextCell.selected).toBe(true);
        expect(nextCell.focused).toBe(true);


    }));

    it('should allow navigation with Shift+Tab from parent into child grid.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(10);
        fixture.detectChanges();

        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        parentCell.nativeElement.focus();

        await wait(100);
        fixture.detectChanges();

        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));

        await wait(100);
        fixture.detectChanges();

        // last cell in child should be focused
        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childLastCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[4];

        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
    }));

    it('should allow navigating to end in child grid when child grid target row moves outside the parent view port.', (async () => {
        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        childCell.nativeElement.focus();
        fixture.detectChanges();
        childCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }));
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        await wait(100);
        const childLastCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[4];
        // correct cell should be focused
        expect(childLastCell.selected).toBe(true);
        expect(childLastCell.focused).toBe(true);
        expect(childLastCell.columnIndex).toBe(7);
        expect(childLastCell.rowIndex).toBe(9);

        // parent should be scrolled down
        const currScrTop = hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        expect(currScrTop).toBeGreaterThanOrEqual(childGrid.rowHeight * 5);
    }));

    it('should allow navigating to start in child grid when child grid target row moves outside the parent view port.', (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(10);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];

        const horizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(7);
        fixture.detectChanges();
        await wait(100);
        fixture.detectChanges();
        const childLastCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[4];
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
        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
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
        await wait(10);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
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
        await wait(10);
        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        childGrid.verticalScrollContainer.scrollTo(9);
        await wait(10);
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

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const vertScr = childGrid.verticalScrollContainer.getVerticalScroll();
        const currScrTop = vertScr.scrollTop;
        // should be scrolled to bottom
        expect(currScrTop).toBe(vertScr.scrollHeight - vertScr.clientHeight);

    }));

    it('should horizontally scroll first cell in view when navigating from parent into child with Tab', (async () => {
        const horizontalScrDir = hierarchicalGrid.dataRowList.toArray()[0].virtDirRow;
        horizontalScrDir.scrollTo(7);

        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childHorizontalScrDir = childGrid.dataRowList.toArray()[0].virtDirRow;
        childHorizontalScrDir.scrollTo(7);

        await wait(100);
        fixture.detectChanges();

        const lastParentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[4];
        lastParentCell.nativeElement.focus();
        fixture.detectChanges();
        UIInteractions.triggerKeyDownEvtUponElem('Tab', lastParentCell.nativeElement, true);
        await wait(100);
        fixture.detectChanges();

        const firstChildCell = childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(firstChildCell.selected).toBe(true);
        expect(firstChildCell.focused).toBe(true);
        expect(firstChildCell.rowIndex).toBe(0);
        expect(firstChildCell.columnIndex).toBe(0);

    }));

    it('should horizontally scroll last cell in view when navigating from parent into child with Shift+Tab',  (async () => {
        hierarchicalGrid.verticalScrollContainer.scrollTo(2);
        await wait(100);
        fixture.detectChanges();
        const parentCell = hierarchicalGrid.dataRowList.toArray()[0].cells.toArray()[0];
        parentCell.nativeElement.focus();

        await wait(100);
        fixture.detectChanges();

        parentCell.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        await wait(100);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.getChildGrids(false)[0];
        const childLastRowCell =  childGrid.dataRowList.toArray()[9].cells.toArray()[4];

        expect(childLastRowCell.selected).toBe(true);
        expect(childLastRowCell.focused).toBe(true);
        expect(childLastRowCell.rowIndex).toBe(9);
        expect(childLastRowCell.columnIndex).toBe(7);
    }));
    // complex tests
    it('should allow navigating up/down between sibling child grids.', () => {

    });
    it('in case next cell is not in view port should scroll the closest scrollable parent so that cell comes view.', () => {
    });
    it('should allow navigating from start to end and back using arrow keys when all child levels are expanded.', () => {
    });
    it('should allow navigating from start to end and back using tab/shift+tab keys when all child levels are expanded.', () => {
    });
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="true" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [childrenExpanded]='true' #rowIsland>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2>
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
        this.data = this.generateData(20, 2);
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
