import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, async } from '@angular/core/testing';
import { IgxIconModule } from '../../icon';
import { IgxGridModule, IgxGridComponent } from '../../grids/grid';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxActionStripComponent, IgxActionStripModule } from '../../action-strip';
import { IgxGridInteractionModule } from './grid-interaction.directive';
import { IgxTreeGridComponent, IgxTreeGridModule } from '../../grids/tree-grid';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxHierarchicalGridComponent, IgxRowIslandComponent, IgxHierarchicalGridModule, IgxHierarchicalRowComponent } from '../../grids/hierarchical-grid';


describe('igxGridInteractionDirective #grid ', () => {
    let fixture;
    let actionStripElement: ElementRef;
    let actionStrip: IgxActionStripComponent;
    let grid: IgxGridComponent;
    let treegrid: IgxTreeGridComponent;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridInteractionTestComponent,
                IgxTreeGridInteractionTestComponent,
                IgxHierarchicalGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxActionStripModule,
                IgxGridModule,
                IgxTreeGridModule,
                IgxHierarchicalGridModule,
                IgxIconModule,
                IgxGridInteractionModule
            ]
        }).compileComponents();
    }));
    describe("in igxGrid", () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxGridInteractionTestComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            grid = fixture.componentInstance.grid;
            actionStripElement = fixture.componentInstance.actionStripElement;
        });

        it('should show/hide action strip using rowInteractionStart/rowInteractionEnd', () => {
            let pinIcon, unpinIcon;
            const firstCell = fixture.debugElement.query(By.css('igx-grid-cell'));
            UIInteractions.simulateMouseEvent('mouseover', firstCell.nativeElement, 0, 0);
            fixture.detectChanges();
            pinIcon = fixture.debugElement.query(By.css(`igx-icon[name=pin]`));
            unpinIcon = fixture.debugElement.query(By.css(`igx-icon[name=unpin]`));
            expect(actionStripElement.nativeElement.style["display"]).not.toBe('none');
            UIInteractions.simulateMouseEvent('mouseleave', firstCell.nativeElement, 0, 0);
            fixture.detectChanges();
            expect(actionStripElement.nativeElement.style["display"]).toBe('none');
        });
    });

    describe("in igxTreeGrid", () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxTreeGridInteractionTestComponent);
            fixture.detectChanges();
            treegrid = fixture.componentInstance.treeGrid;
        });

        it('should allow row interaction', () => {
            const firstCell = fixture.debugElement.query(By.css('igx-tree-grid-cell'));
            UIInteractions.simulateMouseEvent('mouseover', firstCell.nativeElement, 0, 0);
            fixture.detectChanges();
            expect(fixture.componentInstance.interactionStart).toBe(true);
            UIInteractions.simulateMouseEvent('mouseleave', firstCell.nativeElement, 0, 0);
            fixture.detectChanges();
            expect(fixture.componentInstance.interactionStart).toBe(false);
        });
    });

    describe("in igxHierarchicalGrid", () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should allow row interaction', () => {
            const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const child1Grids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));

            const firstCell = child1Grid.query(By.css('igx-hierarchical-grid-cell'));
            UIInteractions.simulateMouseEvent('mouseover', firstCell.nativeElement, 0, 0);
            fixture.detectChanges();
            expect(fixture.componentInstance.interactionStart).toBe(true);
            UIInteractions.simulateMouseEvent('mouseleave', firstCell.nativeElement, 0, 0);
            fixture.detectChanges();
            expect(fixture.componentInstance.interactionStart).toBe(false);
        });
    });

});

@Component({
    template: `
<igx-grid #grid [data]="data" [width]="'800px'" [height]="'500px'"
    [igxRowInteraction]="{start:['mouseover'], end: ['mouseleave']}"
    (rowInteractionStart)="actionStrip.show($event.row)"
    (rowInteractionEnd)="actionStrip.hide()"
    [rowEditable]="true" [primaryKey]="'ID'">
    <igx-column *ngFor="let c of columns" [sortable]="true" [field]="c.field" [header]="c.field"
        [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
    </igx-column>

    <igx-action-strip #actionStrip>
        <igx-grid-pinning-actions></igx-grid-pinning-actions>
    </igx-action-strip>
</igx-grid>
`
})
class IgxGridInteractionTestComponent implements OnInit {
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;

    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('actionStrip', { read: ElementRef, static: true })
    public actionStripElement: ElementRef;

    data: any[];
    columns: any[];

    ngOnInit() {

        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: false },
            { field: 'ContactTitle', width: '300px', pinned: false },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.data = [
            // tslint:disable:max-line-length
            { 'ID': 'ALFKI', 'CompanyName': 'Alfreds Futterkiste', 'ContactName': 'Maria Anders', 'ContactTitle': 'Sales Representative', 'Address': 'Obere Str. 57', 'City': 'Berlin', 'Region': null, 'PostalCode': '12209', 'Country': 'Germany', 'Phone': '030-0074321', 'Fax': '030-0076545' },
            { 'ID': 'ANATR', 'CompanyName': 'Ana Trujillo Emparedados y helados', 'ContactName': 'Ana Trujillo', 'ContactTitle': 'Owner', 'Address': 'Avda. de la Constitución 2222', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05021', 'Country': 'Mexico', 'Phone': '(5) 555-4729', 'Fax': '(5) 555-3745' },
            { 'ID': 'ANTON', 'CompanyName': 'Antonio Moreno Taquería', 'ContactName': 'Antonio Moreno', 'ContactTitle': 'Owner', 'Address': 'Mataderos 2312', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05023', 'Country': 'Mexico', 'Phone': '(5) 555-3932', 'Fax': null }
        ];
        // tslint:enable:max-line-length
    }
}

@Component({
    template: `
<igx-tree-grid #treeGrid 
[igxRowInteraction]="{start:['mouseover'], end: ['mouseleave']}"
(rowInteractionStart)="interactionStart = true"
(rowInteractionEnd)="interactionStart = false"
[data]="data" primaryKey="employeeID" foreignKey="PID" width="900px" height="800px">
    <igx-column [field]="'employeeID'" dataType="number"></igx-column>
    <igx-column [field]="'firstName'"></igx-column>
    <igx-column [field]="'lastName'"></igx-column>
    <igx-column [field]="'Salary'" dataType="number"></igx-column>
</igx-tree-grid>`
})
class IgxTreeGridInteractionTestComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeScrollingData();
    public interactionStart = false;
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
     [autoGenerate]="false" [height]="'400px'" [width]="width" #hierarchicalGrid>
     <igx-column field="ID"></igx-column>
     <igx-column field="ProductName"></igx-column>
        <igx-row-island
        [igxRowInteraction]="{start:['mouseover'], end: ['mouseleave']}"
        (rowInteractionStart)="interactionStart = true"
        (rowInteractionEnd)="interactionStart = false"
        [key]="'childData'" [autoGenerate]="false" #rowIsland>
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
    public interactionStart = false;
    public width = '500px';
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;

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