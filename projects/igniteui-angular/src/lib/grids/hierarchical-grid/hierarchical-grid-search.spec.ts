
import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { ViewChild, Component } from '@angular/core';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';


const HIGHLIGHT_CLASS = 'igx-highlight';
const ACTIVE_CLASS = 'igx-highlight__active';

describe('IgxHierarchicalGrid Search - ', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridSearchTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridSearchTestBaseComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
    }));

    function checkHightLights(count: number, activeIndex: number) {
        const activeHighlight = fixture.nativeElement.querySelector('.' + ACTIVE_CLASS);
        const highlights = fixture.nativeElement.querySelectorAll('.' + HIGHLIGHT_CLASS);
        expect(highlights.length).toBe(count);
        if (Number.isInteger(activeIndex)) {
            expect(activeHighlight).toBe(highlights[activeIndex]);
        } else {
            expect(activeHighlight).toBeNull();
        }
    }

    // Basic
    it('should highlight all cells in parent and in existing children.',  async () => {
        // expand parent row
        (hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        // expand child row
        (childGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();
        // apply search
        const count = hierarchicalGrid.findNext('A0');
        await wait(30);
        fixture.detectChanges();
        expect(count).toBe(3);
        checkHightLights(3, 0);
    });
    it('should highlight all cells in parent and in children when they get created.', async () => {
        // apply search
        const count = hierarchicalGrid.findNext('A0');
        await wait(30);
        fixture.detectChanges();
        expect(count).toBe(1);
        checkHightLights(1, 0);

         // expand parent row
         (hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
         await wait(30);
         fixture.detectChanges();

        checkHightLights(2, 0);
    });
    it('should honor the visible rows order when moving active highlight.', async () => {
        hierarchicalGrid.height = '500px';
        fixture.detectChanges();
        // expand parent row
        (hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        // expand child row
        (childGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();
        // apply search
        const count = hierarchicalGrid.findNext('A0');
        await wait(30);
        fixture.detectChanges();
        expect(count).toBe(3);
        checkHightLights(3, 0);

        hierarchicalGrid.findNext('A0');
        await wait(30);
        fixture.detectChanges();
        checkHightLights(3, 1);

        hierarchicalGrid.findNext('A0');
        await wait(30);
        fixture.detectChanges();

        checkHightLights(3, 2);

        hierarchicalGrid.findPrev('A0');
        await wait(30);
        fixture.detectChanges();
        checkHightLights(3, 1);

        hierarchicalGrid.findPrev('A0');
        await wait(30);
        fixture.detectChanges();
        checkHightLights(3, 0);

    });
    it('clearSearch should remove higlights from parent and child grids.', async () => {
         // expand parent row
         (hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
         await wait(30);
         fixture.detectChanges();
         const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
         // expand child row
         (childGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
         await wait(30);
         fixture.detectChanges();
         // apply search
         const count = hierarchicalGrid.findNext('A0');
         await wait(30);
         fixture.detectChanges();
         expect(count).toBe(3);
         checkHightLights(3, 0);

         hierarchicalGrid.clearSearch();
         await wait(30);
         fixture.detectChanges();
         checkHightLights(0, null);
    });
    it('should scroll to cell with active highlight in child grid, if child is not in view', async () => {
        // expand parent row
        (hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        // expand child row
        (childGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();
        // apply search
        const count = hierarchicalGrid.findNext('A3');
        await wait(30);
        fixture.detectChanges();
        expect(count).toBe(2);
        checkHightLights(2, 0);

        // check child grid is scrolled down
        expect(childGrid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(0);

        // check highlight is in correct cell
        const cell = childGrid.getCellByColumn(4, 'ProductName');
        const cellHighlight = cell.nativeElement.querySelector('.' + ACTIVE_CLASS);
        expect(cellHighlight).not.toBe(null);

        // check if cell is fully in view
        expect(cell.nativeElement.getBoundingClientRect().bottom)
        .toBeLessThanOrEqual(hierarchicalGrid.nativeElement.getBoundingClientRect().bottom);
    });

    it('should expand parent row and scroll child in view when active highligh moves to child grid in collapsed grid.', async () => {
        // expand parent row
        (hierarchicalGrid.getRowByIndex(3) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        // expand child row
        (childGrid.getRowByIndex(3) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();

        // collapse parent row
        (hierarchicalGrid.getRowByIndex(3) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();

         // apply search
         const count = hierarchicalGrid.findNext('A3');
         await wait(30);
         fixture.detectChanges();

         // 3 total
         expect(count).toBe(3);
         // 1 in DOM
         checkHightLights(1, 0);

         hierarchicalGrid.findPrev('A3');
         await wait(30);
         fixture.detectChanges();

         // parent should be expanded
         expect(hierarchicalGrid.isExpanded(hierarchicalGrid.data[3])).toBeTruthy();
         // child should be scrolled
         expect(childGrid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(0);
         // check correct cell is active
         const nestedChild = childGrid.hgridAPI.getChildGrids(false)[0];
         const cell = nestedChild.getCellByColumn(3, 'ProductName');
         const cellHighlight = cell.nativeElement.querySelector('.' + ACTIVE_CLASS);
         expect(cellHighlight).not.toBe(null);
        // check if cell is fully in view
        expect(cell.nativeElement.getBoundingClientRect().bottom)
        .toBeLessThanOrEqual(hierarchicalGrid.nativeElement.getBoundingClientRect().bottom);
    });

    it('should order matchInfoCache correctly when there are results in child and in parent.', async () => {
        // expand parent row
        (hierarchicalGrid.getRowByIndex(1) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();

        let count = hierarchicalGrid.findNext('A0');
        await wait(30);
        fixture.detectChanges();

        expect(count).toBe(2);

        const childData = fixture.componentInstance.data[1].childData;
        const parentData = fixture.componentInstance.data;

        // first result is 1st parent rec
        expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[0].row.ID).toEqual(parentData[0].ID);
        // second 1st child rec
        expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[1].row.ID).toEqual(childData[0].ID);

        count = hierarchicalGrid.findNext('A1');
        await wait(30);
        fixture.detectChanges();
        expect(count).toBe(16);
        const childGridInfo = hierarchicalGrid.hgridAPI.getChildGrids(false)[0].lastSearchInfo.matchInfoCache;

        // first result is 2nd parent rec
        expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[0].row.ID).toEqual(parentData[1].ID);
         // next results should be from child grid
         expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[1].row.ID).toEqual(childData[1].ID);
         for (let i = 0; i < childGridInfo.length; i++) {
            expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[1 + i].row.ID).toEqual(childGridInfo[i].row.ID);
         }
         // next should be again from parent grid
         expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[6].row.ID).toEqual(parentData[10].ID);

        count = hierarchicalGrid.findNext('A2');
        await wait(30);
        fixture.detectChanges();
        expect(count).toBe(2);

        // first result is 3rd child rec
        expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[0].row.ID).toEqual(childData[2].ID);
        // next should be from parent
        expect(hierarchicalGrid.lastSearchInfo.matchInfoCache[1].row.ID).toEqual(parentData[2].ID);
    });

    it('should order matchInfoCache correctly when there are multiple results in parent row.', async () => {
        hierarchicalGrid.height = '500px';
        fixture.detectChanges();

         // expand parent row
         (hierarchicalGrid.getRowByIndex(2) as IgxHierarchicalRowComponent).toggle();
         await wait(30);
         fixture.detectChanges();

        const count = hierarchicalGrid.findNext('2');
        await wait(30);
        fixture.detectChanges();
        expect(count).toBe(16);

        const parentData = fixture.componentInstance.data;
        const childData = fixture.componentInstance.data[2].childData;
        const results = hierarchicalGrid.lastSearchInfo.matchInfoCache;

        // fist two should be from parent
        expect(results[0].row.ID).toEqual(parentData[2].ID);
        expect(results[1].row.ID).toEqual(parentData[2].ID);

        // next should be in child
        expect(results[2].row.ID).toEqual(childData[0].ID);

    });

    it('should order matchInfoCache correctly when there are results in children and in parents.', async () => {
        hierarchicalGrid.data = fixture.componentInstance.generateDataUneven(5, 2);
        hierarchicalGrid.cdr.detectChanges();
        hierarchicalGrid.height = null;
        hierarchicalGrid.cdr.detectChanges();

        // all expanded
        hierarchicalGrid.expandChildren = true;
        await wait(30);
        hierarchicalGrid.cdr.detectChanges();

        const count = hierarchicalGrid.findNext('A');
        await wait(30);
        fixture.detectChanges();
        const childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
        const childDataCount = childGrids.map((child) => child.data.length).reduce((acc, val) => acc + val);
        // all recs should be in result
        expect(count).toBe(childDataCount + hierarchicalGrid.data.length);

        // order should be as they appear in DOM
        const results = hierarchicalGrid.lastSearchInfo.matchInfoCache;
        expect(results[0].row).toBe(hierarchicalGrid.data[0]);
        expect(results[1].row).toBe(hierarchicalGrid.data[0].childData[0]);
        expect(results[2].row).toBe(hierarchicalGrid.data[0].childData[1]);
        expect(results[3].row).toBe(hierarchicalGrid.data[1]);
        expect(results[4].row).toBe(hierarchicalGrid.data[1].childData[0]);
        expect(results[5].row).toBe(hierarchicalGrid.data[1].childData[1]);
        expect(results[6].row).toBe(hierarchicalGrid.data[1].childData[2]);
        expect(results[7].row).toBe(hierarchicalGrid.data[1].childData[3]);
        expect(results[8].row).toBe(hierarchicalGrid.data[2]);
        expect(results[9].row).toBe(hierarchicalGrid.data[2].childData[0]);
        expect(results[10].row).toBe(hierarchicalGrid.data[2].childData[1]);
        expect(results[11].row).toBe(hierarchicalGrid.data[3]);
    });

    it('should scroll to active cell inside 3rd level nested child grid', async () => {
        hierarchicalGrid.data = fixture.componentInstance.generateDataUneven(10, 3);
        hierarchicalGrid.cdr.detectChanges();

        // scroll to 7
        hierarchicalGrid.verticalScrollContainer.scrollTo(7);
        await wait(30);
        hierarchicalGrid.cdr.detectChanges();

        const row = hierarchicalGrid.getRowByIndex(7);
        (row as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        hierarchicalGrid.cdr.detectChanges();

        const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        (child.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        child.cdr.detectChanges();

        const subChild = child.hgridAPI.getChildGrids(false)[0];
        (subChild.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        subChild.cdr.detectChanges();

        // scroll to top
        hierarchicalGrid.verticalScrollContainer.scrollTo(0);
        await wait(30);
        hierarchicalGrid.cdr.detectChanges();

        const count = hierarchicalGrid.findNext('701');
        await wait(30);
        fixture.detectChanges();

        expect(count).toBe(1);

        // check if cell has active class
        const cell = subChild.getCellByColumn(1, 'ID');
        const cellHighlight = cell.nativeElement.querySelector('.' + ACTIVE_CLASS);
        expect(cellHighlight).not.toBe(null);
       // check if cell is fully in view
       expect(cell.nativeElement.getBoundingClientRect().bottom)
       .toBeLessThanOrEqual(hierarchicalGrid.nativeElement.getBoundingClientRect().bottom);
    });

    it('should scroll multiple grids when active hightlight cell is in nested child outside its parent grids viewports.', async () => {
        // scroll to 7
        hierarchicalGrid.verticalScrollContainer.scrollTo(7);
        await wait(30);
        hierarchicalGrid.cdr.detectChanges();

        const row = hierarchicalGrid.getRowByIndex(7);
        (row as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        hierarchicalGrid.cdr.detectChanges();

        const child = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        (child.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        child.cdr.detectChanges();

        const subChild = child.hgridAPI.getChildGrids(false)[0];
        (subChild.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        subChild.cdr.detectChanges();

        // scroll parent back to top
        hierarchicalGrid.verticalScrollContainer.scrollTo(0);
        await wait(30);
        hierarchicalGrid.cdr.detectChanges();

        // the 2 parent grids should scroll so that nested child grid cell is in view.
        const count = hierarchicalGrid.findNext('704');
        await wait(30);
        fixture.detectChanges();

        expect(count).toBe(1);

        // check root grid scrolled down
        let scrTop = hierarchicalGrid.verticalScrollContainer.getScrollForIndex(8);
        expect(hierarchicalGrid.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(scrTop);

        // check child grid scrolled down
        scrTop = child.verticalScrollContainer.getScrollForIndex(1);
        expect(child.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(scrTop);

        // check if cell has active class
        const cell = subChild.getCellByColumn(4, 'ID');
        const cellHighlight = cell.nativeElement.querySelector('.' + ACTIVE_CLASS);
        expect(cellHighlight).not.toBe(null);
       // check if cell is fully in view
       expect(cell.nativeElement.getBoundingClientRect().bottom)
       .toBeLessThanOrEqual(hierarchicalGrid.nativeElement.getBoundingClientRect().bottom);
    });

    // Integration - Paging
    it('should change page and scoll to the cell in with active highlight when there are expanded records.',  async () => {
        hierarchicalGrid.paging = true;
        hierarchicalGrid.perPage = 10;
        await wait(30);
        fixture.detectChanges();

        // expand parent row
        (hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).toggle();
        await wait(30);
        fixture.detectChanges();

        // result is in parent on next page
        const count = hierarchicalGrid.findNext('A17');
        await wait(30);
        fixture.detectChanges();

        expect(count).toBe(1);

        // check page is changed
        expect(hierarchicalGrid.page).toBe(1);

        // check target cell has the active highlight
        const cell = hierarchicalGrid.getCellByColumn(7, 'ProductName');
        const cellHighlight = cell.nativeElement.querySelector('.' + ACTIVE_CLASS);
         expect(cellHighlight).not.toBe(null);
        // check if cell is fully in view
        expect(cell.nativeElement.getBoundingClientRect().bottom)
        .toBeLessThanOrEqual(hierarchicalGrid.nativeElement.getBoundingClientRect().bottom);

        // result is in a child grid on prev page
        hierarchicalGrid.findPrev('A3');
        await wait(30);
        fixture.detectChanges();

         // check page is changed
         expect(hierarchicalGrid.page).toBe(0);

        // check child cell has active highlight
        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell = childGrid.getCellByColumn(3, 'ProductName');
        const childCellHighlight = childCell.nativeElement.querySelector('.' + ACTIVE_CLASS);
        expect(childCellHighlight).not.toBe(null);
       // check if cell is fully in view
       expect(childCell.nativeElement.getBoundingClientRect().bottom)
       .toBeLessThanOrEqual(hierarchicalGrid.nativeElement.getBoundingClientRect().bottom);
    });
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
     [autoGenerate]="false" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
     <igx-column field="ID"></igx-column>
     <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland  [height]="'300px'">
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
            <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland2 >
                <igx-column field="ID"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridSearchTestBaseComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent }) public rowIsland2: IgxRowIslandComponent;

    constructor() {
        // 3 level hierarchy
        this.data = this.generateDataUneven(20, 3);
    }
    generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0 ) {
               // Have child grids for row with even id less rows by not multiplying by 2
               children = this.generateDataUneven((i % 2 + 1) * Math.round(count / 3) , currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
                'Col2': i, 'Col3': i, childData: children, childData2: children });
        }
        return prods;
    }
}
