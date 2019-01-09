import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, Injectable,
    OnInit, ViewChild, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { By } from '@angular/platform-browser';
import { IgxChildGridRowComponent } from './child-grid-row.component';

describe('Basic IgxHierarchicalGrid', () => {
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

    it('should render expansion indicator as the first element of each expandable row.', () => {
        fixture.componentInstance.data = [
            {ID: 0, ProductName: 'Product: A0'},
            {ID: 1, ProductName: 'Product: A1', childData: fixture.componentInstance.generateDataUneven(1, 1)},
            {ID: 2, ProductName: 'Product: A2', childData: fixture.componentInstance.generateDataUneven(1, 1)}
        ];
        fixture.detectChanges();
        const row1 = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        expect(row1.hasChildren).toBe(false);
        const rowElems = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
        expect(rowElems[0].query(By.css('igx-icon.chevron_right'))).toBe(null);
        const row2 = hierarchicalGrid.getRowByIndex(1) as IgxHierarchicalRowComponent;
        expect(row2.hasChildren).toBe(true);
        expect(rowElems[1].query(By.css('igx-icon.chevron_right'))).not.toBe(null);

        const row3 = hierarchicalGrid.getRowByIndex(1) as IgxHierarchicalRowComponent;
        expect(row3.hasChildren).toBe(true);
        expect(rowElems[2].query(By.css('igx-icon.chevron_right'))).not.toBe(null);
    });

    it('should allow expand/collapse rows through the UI', () => {
        const row1 = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        expect(row1.expanded).toBe(false);
        UIInteractions.clickElement(row1.expander);
        fixture.detectChanges();
        expect(row1.expanded).toBe(true);
        expect(hierarchicalGrid.hgridAPI.getChildGrids(false).length).toBe(1);
        expect(hierarchicalGrid.getRowByIndex(1) instanceof IgxChildGridRowComponent).toBe(true);
        UIInteractions.clickElement(row1.expander);
        fixture.detectChanges();
        expect(row1.expanded).toBe(false);
        expect(hierarchicalGrid.getRowByIndex(1) instanceof IgxHierarchicalRowComponent).toBe(true);
    });

    it('should change expand/collapse indicators when state of the row changes', () => {
        const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        const rowElem = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent))[0];
        expect(rowElem.query(By.css('igx-icon.chevron_right'))).not.toBe(null);
        expect(rowElem.query(By.css('igx-icon.expand_more'))).toBe(null);
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();

        expect(rowElem.query(By.css('igx-icon.chevron_right'))).toBe(null);
        expect(rowElem.query(By.css('igx-icon.expand_more'))).not.toBe(null);
    });

    it('should expand/collapse all rows that belongs to a grid via header expand/collapse icon', () => {
        const headerExpanderElem = fixture.debugElement.queryAll(By.css('.igx-grid__header-indentation'))[0];
        let iconTxt = headerExpanderElem.query(By.css('igx-icon')).nativeElement.textContent.toLowerCase();
        expect(iconTxt).toBe('unfold_more');
        UIInteractions.clickElement(headerExpanderElem);
        fixture.detectChanges();
        let rows = hierarchicalGrid.dataRowList.toArray();
        rows.forEach((row) => {
            expect(row.expanded).toBe(true);
        });
        iconTxt = headerExpanderElem.query(By.css('igx-icon')).nativeElement.textContent.toLowerCase();
        expect(iconTxt).toBe('unfold_less');
        expect(hierarchicalGrid.hierarchicalState.length).toEqual(fixture.componentInstance.data.length);

        UIInteractions.clickElement(headerExpanderElem);
        fixture.detectChanges();
        rows = hierarchicalGrid.dataRowList.toArray();
        rows.forEach((row) => {
            expect(row.expanded).toBe(false);
        });
        iconTxt = headerExpanderElem.query(By.css('igx-icon')).nativeElement.textContent.toLowerCase();
        expect(iconTxt).toBe('unfold_more');
        expect(hierarchicalGrid.hierarchicalState.length).toEqual(0);
    });
    it('should allow applying initial expansions state for certain rows through hierarchicalState option', () => {
        // set first row as expanded.
        hierarchicalGrid.hierarchicalState = [{rowID: fixture.componentInstance.data[0]}];
        hierarchicalGrid.cdr.detectChanges();
        const row1 = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        // verify row is expanded
        expect(row1.expanded).toBe(true);
        expect(hierarchicalGrid.hgridAPI.getChildGrids(false).length).toBe(1);
        expect(hierarchicalGrid.getRowByIndex(1) instanceof IgxChildGridRowComponent).toBe(true);
    });

    it('should allow defining more than one nested row islands', () => {
        const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childRow = childGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(childRow.expander);
        fixture.detectChanges();

        // should have 3 level hierarchy
        const allChildren =  hierarchicalGrid.hgridAPI.getChildGrids(true);
        expect(allChildren.length).toBe(2);
        expect(hierarchicalGrid.getRowByIndex(1) instanceof IgxChildGridRowComponent).toBe(true);
        expect(childGrid.getRowByIndex(1) instanceof IgxChildGridRowComponent).toBe(true);
    });

    it('should retain expansion states when scrolling', (async () => {
        const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();
        expect(row.expanded).toBe(true);
        // scroll to bottom
        hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
        await wait(100);
        fixture.detectChanges();
        // scroll to top
        hierarchicalGrid.verticalScrollContainer.scrollTo(0);
        await wait(100);
        fixture.detectChanges();
        expect((hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent).expanded).toBe(true);
    }));

    it('should not show header expand/collapse button if grid has no expandable elements', () => {
        fixture.componentInstance.data = [
            {ID: 0, ProductName: 'Product: A0'}
        ];
        fixture.detectChanges();
        const headerExpanderElem = fixture.debugElement.queryAll(By.css('.igx-grid__header-indentation'))[0];
        const icon = headerExpanderElem.query(By.css('igx-icon'));
        expect(icon).toBeNull();
    });

    it('should render last cell of rows fully visible when columns does not have width specified and without scrollbar', () => {
        const firstRowCell: HTMLElement = hierarchicalGrid.getRowByIndex(0).cells.last.nativeElement;
        const cellLeftOffset = firstRowCell.offsetLeft + firstRowCell.parentElement.offsetLeft + firstRowCell.offsetWidth;
        const gridWidth = hierarchicalGrid.nativeElement.offsetWidth;
        expect(cellLeftOffset).not.toBeGreaterThan(gridWidth);

        const hScroll = hierarchicalGrid.parentVirtDir.getHorizontalScroll();
        expect(hScroll.children[0].offsetWidth).not.toBeGreaterThan(hScroll.offsetWidth);
    });
});

describe('IgxHierarchicalGrid Row Islands', () => {
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

    it('should allow defining row islands on the same level', () => {
        const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();
        const childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
        const childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
        expect(childGrids.length).toBe(2);
        expect(childRows.length).toBe(2);
        const ri1 = fixture.componentInstance.rowIsland1;
        const ri2 = fixture.componentInstance.rowIsland2;
        expect(childRows[0].componentInstance.layout).toBe(ri1);
        expect(childRows[1].componentInstance.layout).toBe(ri2);
    });
    it('should apply the set options on the row island to all of its related child grids.', () => {
        fixture.componentInstance.height = '200px';
        fixture.detectChanges();
        const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();
        const childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
        expect(childGrids[0].height).toBe('200px');
        expect(childGrids[1].height).toBe('200px');
    });

    it('Should apply runtime option changes to all related child grids (both existing and not yet initialized).', () => {
        const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();
        const ri1 = fixture.componentInstance.rowIsland1;
        ri1.rowSelectable = true;
        fixture.detectChanges();

        // check rendered grid
        let childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
        expect(childGrids[0].rowSelectable).toBe(true);
        expect(childGrids[1].rowSelectable).toBe(false);

        // expand new row and check newly generated grid
        const row2 = hierarchicalGrid.getRowByIndex(3) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row2.expander);
        fixture.detectChanges();
        childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);
        expect(childGrids[0].rowSelectable).toBe(true);
        expect(childGrids[1].rowSelectable).toBe(true);
        expect(childGrids[2].rowSelectable).toBe(false);
        expect(childGrids[3].rowSelectable).toBe(false);
    });
    it('should apply column settings applied to the row island to all related child grids.', () => {
        const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();

        const ri1 = fixture.componentInstance.rowIsland1;
        const ri2 = fixture.componentInstance.rowIsland2;

        const childGrids = hierarchicalGrid.hgridAPI.getChildGrids(false);

        const child1Cols = childGrids[0].columnList.toArray();
        const riCols = ri1.columnList.toArray();
        expect(child1Cols.length).toEqual(riCols.length);
        for (let i = 0; i < riCols.length; i++) {
            const col = child1Cols.find((c) => c.key === riCols[i].key);
            expect(col).not.toBeNull();
        }
        const child2Cols = childGrids[1].columnList.toArray();
        const ri2Cols = ri2.columnList.toArray();
        expect(child2Cols.length).toEqual(ri2Cols.length);
        for (let j = 0; j < riCols.length; j++) {
            const col = child2Cols.find((c) => c.key === ri2Cols[j].key);
            expect(col).not.toBeNull();
        }
    });
    it('should allow setting different height/width in px/percent for row islands and grids should be rendered correctly.', () => {
        const ri1 = fixture.componentInstance.rowIsland1;

        // test px
        ri1.height = '200px';
        ri1.width = '200px';

        fixture.detectChanges();

        let row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();
        let childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
        let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

        // check sizes are applied
        expect(childGrid.width).toBe(ri1.width);
        expect(childGrid.height).toBe(ri1.height);
        expect(childGrid.nativeElement.style.height).toBe(ri1.height);
        expect(childGrid.nativeElement.style.width).toBe(ri1.width);
        // check virtualization state
        expect(childGrid.verticalScrollContainer.state.chunkSize).toBe(4);
        expect(childGrid.verticalScrollContainer.getVerticalScroll().scrollHeight).toBe(350);

        let hVirt = childGrid.getRowByIndex(0).virtDirRow;
        expect(hVirt.state.chunkSize).toBe(2);
        expect(hVirt.getHorizontalScroll().scrollWidth).toBe(272);
        // collapse row
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();
        // test %
        ri1.height = '50%';
        ri1.width = '50%';

        fixture.detectChanges();
        row = hierarchicalGrid.getRowByIndex(1) as IgxHierarchicalRowComponent;
        UIInteractions.clickElement(row.expander);
        fixture.detectChanges();


        childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
        childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

         // check sizes are applied
         expect(childGrid.width).toBe(ri1.width);
         expect(childGrid.height).toBe(ri1.height);
         expect(childGrid.nativeElement.style.height).toBe(ri1.height);
         expect(childGrid.nativeElement.style.width).toBe(ri1.width);
         // check virtualization state
         expect(childGrid.verticalScrollContainer.state.chunkSize).toBe(11);
         expect(childGrid.verticalScrollContainer.getVerticalScroll().scrollHeight).toBe(700);
         hVirt = childGrid.getRowByIndex(0).virtDirRow;
         expect(hVirt.getHorizontalScroll().scrollWidth).toBe(272);
    });
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
     [autoGenerate]="false" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
     <igx-column field="ID"></igx-column>
     <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
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

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
    <igx-column field="ID"></igx-column>
    <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" [height]="height" #rowIsland1>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="false" [height]="height" #rowIsland2>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridMultiLayoutComponent extends IgxHierarchicalGridTestBaseComponent {
    public height = '100px';
    @ViewChild('rowIsland1', { read: IgxRowIslandComponent }) public rowIsland1: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent }) public rowIsland2: IgxRowIslandComponent;
}
