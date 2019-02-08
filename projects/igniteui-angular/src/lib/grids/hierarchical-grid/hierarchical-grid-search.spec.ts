
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
         expect((hierarchicalGrid.getRowByIndex(3) as IgxHierarchicalRowComponent).expanded).toBeTruthy();
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
