import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { Component, ViewChild } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { wait } from '../../test-utils/ui-interactions.spec';
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand } from 'igniteui-angular';

describe('IgxHierarchicalGrid Virtualization', () => {
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

    it('should retain expansion state when scrolling.', async () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        expect(firstRow.expanded).toBeTruthy();
        const verticalScroll = fixture.componentInstance.hgrid.verticalScrollContainer;
        const elem = verticalScroll['vh'].instance.elementRef.nativeElement;

        // scroll down
        elem.scrollTop = 1000;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();
        expect(firstRow.expanded).toBeFalsy();

        // scroll to top
        elem.scrollTop = 0;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();
        expect(firstRow.expanded).toBeTruthy();
    });

    it('Should retain child scroll position when expanding and collapsing through rows', async () => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const verticalScroll = childGrid.verticalScrollContainer;
        const elem = verticalScroll['vh'].instance.elementRef.nativeElement;

        // scroll down
        elem.scrollTop = 400;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();

        // collapse and expand the row
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        await wait();
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();
        await wait();

        expect(elem.scrollTop).toBe(400);
    });

    it('Should retain child grid states (scroll position, selection, filtering, paging etc.) when scrolling', async() => {
        const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
        // first child of the row should expand indicator
        firstRow.nativeElement.children[0].click();
        fixture.detectChanges();

        const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
        const childCell =  childGrid.dataRowList.toArray()[4].cells.toArray()[0];
        childCell.nativeElement.focus();
        await wait(10);

        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const expression = {
            fieldName: 'ProductName',
            searchVal: 'Product: A4',
            condition: IgxStringFilteringOperand.instance().condition('startsWith')
        };
        filteringExpressionsTree.filteringOperands.push(expression);
        childGrid.filter('ProductName', null, filteringExpressionsTree);
        await wait();
        fixture.detectChanges();
        expect(childGrid.rowList.length).toEqual(1);
        expect(childGrid.rowList.toArray()[0].cells.toArray()[0].selected).toBeTruthy();

        const verticalScroll = fixture.componentInstance.hgrid.verticalScrollContainer;
        const elem = verticalScroll['vh'].instance.elementRef.nativeElement;
        // scroll down
        elem.scrollTop = 1000;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();

        // scroll to top
        elem.scrollTop = 0;
        fixture.detectChanges();
        fixture.componentRef.hostView.detectChanges();
        await wait();

        expect(childGrid.rowList.length).toEqual(1);
        expect(childGrid.rowList.toArray()[0].cells.toArray()[0].selected).toBeTruthy();
    });
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true"
     [autoGenerate]="true" [height]="'400px'" [width]="'500px'" #hierarchicalGrid primaryKey="ID">
        <igx-row-island [key]="'childData'" [autoGenerate]="true" [allowFiltering]="true" #rowIsland>
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
        this.data = this.generateData(40, 3);
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
