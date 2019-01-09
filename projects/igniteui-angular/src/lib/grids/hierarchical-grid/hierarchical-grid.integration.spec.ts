import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { Component, ViewChild } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridGroupByRowComponent } from '../grid';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';

describe('IgxHierarchicalGrid Integration', () => {
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
    // MCH
    it('should allow declaring column groups.', async () => {
        const expectedColumnGroups = 1;
        const expectedLevel = 1;

        expect(hierarchicalGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
        expect(hierarchicalGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(4);

        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

        expect(childGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
        expect(childGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(8);
    });
    // Selection
    it('should allow only one cell to be selected in the whole hierarchical grid.', (async () => {
        hierarchicalGrid.height = '500px';
        hierarchicalGrid.reflow();
        fixture.detectChanges();

        let firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        expect(firstRow.expanded).toBeTruthy();

        let fCell = firstRow.cells.toArray()[0];

        // select parent cell
        fCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        expect(fCell.selected).toBeTruthy();

        const childGrid =  hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const firstChildRow = childGrid.dataRowList.toArray()[0];
        const fChildCell =  firstChildRow.cells.toArray()[0];

        // select child cell
        fChildCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();

        expect(fChildCell.selected).toBeTruthy();
        expect(fCell.selected).toBeFalsy();

        // select parent cell
        firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        fCell = firstRow.cells.toArray()[0];
        fCell.nativeElement.focus();
        await wait(100);
        fixture.detectChanges();
        expect(fChildCell.selected).toBeFalsy();
        expect(fCell.selected).toBeTruthy();
    }));

    // Sorting
    it('should display correct child data for expanded row after sorting.', (async () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // expand 1st row
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        hierarchicalGrid.sort({
            fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
        });
        fixture.detectChanges();

        hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        fixture.detectChanges();
        hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        fixture.detectChanges();

        const childGrid =  hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(childGrid.data).toBe(fixture.componentInstance.data[0]['childData']);
        expect(fChildCell.value).toBe('00');
    }));

    it('should allow sorting via headers in child grids', () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // expand 1st row
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        // enable sorting
        const childGrid =  hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        childGrid.columnList.toArray()[0].sortable = true;
        fixture.detectChanges();

        const childHeaders = fixture.debugElement.query(By.css('igx-child-grid-row')).queryAll(By.css('igx-grid-header'));
        childHeaders[0].nativeElement.click();
        fixture.detectChanges();
        childHeaders[0].nativeElement.click();
        fixture.detectChanges();

        const fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(fChildCell.value).toBe('09');
        const icon = childHeaders[0].query(By.css('.sort-icon'));
        expect(icon).not.toBeNull();
        expect(icon.nativeElement.textContent.toLowerCase()).toBe('arrow_downward');
    });

    // GroupBy

    it('Data should be rendered correctly when children are expanded', () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // expand 1st row
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        hierarchicalGrid.groupBy({
            fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
        });
        fixture.detectChanges();
        let rows = hierarchicalGrid.rowList.toArray();
        expect(rows[0] instanceof IgxGridGroupByRowComponent).toBeTruthy();
        expect(rows[1] instanceof IgxHierarchicalRowComponent).toBeTruthy();
        expect(rows[2] instanceof IgxChildGridRowComponent).toBeTruthy();

        hierarchicalGrid.clearGrouping('ID');
        hierarchicalGrid.cdr.detectChanges();
        fixture.detectChanges();
        rows = hierarchicalGrid.rowList.toArray();
        expect(rows[0] instanceof IgxHierarchicalRowComponent).toBeTruthy();
        expect(rows[1] instanceof IgxChildGridRowComponent).toBeTruthy();
        expect(rows[2] instanceof IgxHierarchicalRowComponent).toBeTruthy();
    });

    it('child grids data should be correct after grouping in parent grid.',  (async () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // expand 1st row
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        const sRow = hierarchicalGrid.dataRowList.toArray()[1];
        // expand 2nd row
        sRow.nativeElement.children[0].click();
        fixture.detectChanges();

        hierarchicalGrid.groupBy({
            fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
        });
        fixture.detectChanges();

        hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        fixture.detectChanges();
        hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        fixture.detectChanges();
        const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
        const childGrid1 = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
        const childGrid2 = childGrids[1].query(By.css('igx-hierarchical-grid')).componentInstance;

        expect(childGrid1.data).toBe(fixture.componentInstance.data[1]['childData']);
        expect(childGrid2.data).toBe(fixture.componentInstance.data[0]['childData']);
    }));

    it('virtualization should work as expected when scrolling in grid with expanded children and grouped columns.',  (async () => {
        // expand 1st row
        hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
        fixture.detectChanges();
        // expand 2nd row
        hierarchicalGrid.dataRowList.toArray()[1].nativeElement.children[0].click();
        fixture.detectChanges();

        hierarchicalGrid.groupBy({
            fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
        });
        fixture.detectChanges();

        hierarchicalGrid.verticalScrollContainer.scrollTo(5);
        await wait(100);
        fixture.detectChanges();

        const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
        const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
        expect(childGrid.data).toBe(fixture.componentInstance.data[1]['childData']);

    }));

    // Filtering
    it('should enable filter-row for root and child grids', (async () => {
        let filteringCells = fixture.debugElement.queryAll(By.css('igx-grid-filtering-cell'));

        expect(filteringCells.length).toEqual(3);
        filteringCells[0].query(By.css('igx-chip')).nativeElement.click();
        fixture.detectChanges();
        expect(document.querySelectorAll('igx-grid-filtering-row').length).toEqual(1);

        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        filteringCells = fixture.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
        expect(filteringCells.length).toEqual(6);
        filteringCells[3].query(By.css('igx-chip')).nativeElement.click();
        fixture.detectChanges();
        expect(document.querySelectorAll('igx-grid-filtering-row').length).toEqual(2);
    }));

    it('should not lose child grid states after filtering in parent grid.', () => {
        // expand 1st row
        hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
        fixture.detectChanges();
        const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
        let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
        let fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        fChildCell.nativeElement.focus({preventScroll: true});
        fixture.detectChanges();
        expect(fChildCell.selected).toBe(true);
        hierarchicalGrid.filter('ID', '0', IgxStringFilteringOperand.instance().condition('contains'), true);
        fixture.detectChanges();
        const rows = hierarchicalGrid.rowList.toArray();
        expect(rows[0].expanded).toBe(true);
        expect(rows[0] instanceof IgxHierarchicalRowComponent).toBeTruthy();
        expect(rows[1] instanceof IgxChildGridRowComponent).toBeTruthy();

        childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
        fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
        expect(fChildCell.selected).toBe(true);
    });
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true"
     [height]="'400px'" [width]="'700px'" #hierarchicalGrid primaryKey="ID">
        <igx-column field="ID" [groupable]='true' ></igx-column>
        <igx-column-group header="Information">
                <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                <igx-column field="ProductName" [groupable]='true' hasSummary='true'></igx-column>
        </igx-column-group>
        <igx-row-island [key]="'childData'" #rowIsland [allowFiltering]="true">
            <igx-column field="ID" [groupable]='true' ></igx-column>
            <igx-column-group header="Information">
                    <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                    <igx-column field="ProductName" [groupable]='true'></igx-column>
            </igx-column-group>
            <igx-row-island [key]="'childData'" #rowIsland2 >
                <igx-column field="ID" [groupable]='true' ></igx-column>
                <igx-column-group header="Information">
                        <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                        <igx-column field="ProductName" [groupable]='true' hasSummary='true'></igx-column>
                </igx-column-group>
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
        this.data = this.generateData(40, 3);
    }
    generateData(count: number, level: number, parendID?) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
           if (level > 0 ) {
                children = this.generateData(count / 2 , currLevel - 1, rowID);
           }
           prods.push({
            ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
            'Col2': i, 'Col3': i, childData: children, childData2: children });
        }
        return prods;
    }
}
