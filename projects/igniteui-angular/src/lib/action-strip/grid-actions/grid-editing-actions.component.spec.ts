import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { IgxIconModule } from '../../icon/public_api';
import { IgxGridModule, IgxGridComponent } from '../../grids/grid/public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IgxActionStripModule } from '../action-strip.module';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxHierarchicalGridActionStripComponent } from '../../test-utils/hierarchical-grid-components.spec';
import {
    IgxHierarchicalRowComponent,
    IgxHierarchicalGridComponent,
    IgxHierarchicalGridModule
} from '../../grids/hierarchical-grid/public_api';

describe('igxGridEditingActions #grid ', () => {
    let fixture;
    let actionStrip: IgxActionStripComponent;
    let grid: IgxGridComponent;
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxActionStripTestingComponent,
                IgxActionStripPinEditComponent,
                IgxActionStripEditMenuComponent,
                IgxHierarchicalGridActionStripComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxActionStripModule,
                IgxGridModule,
                IgxHierarchicalGridModule,
                IgxIconModule
            ]
        }).compileComponents();
    }));



    describe('Base ', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxActionStripTestingComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            grid = fixture.componentInstance.grid;
        }));

        it('should allow editing and deleting row', () => {
            let deleteIcon;
            actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            const editIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[0];
            expect(editIcon.nativeElement.innerText).toBe('edit');
            editIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            expect(grid.gridAPI.crudService.rowInEditMode).not.toBeNull();
            expect(grid.rowList.first.inEditMode).toBe(true);

            expect(grid.rowList.first.rowData['ID']).toBe('ALFKI');
            const dataLenght = grid.dataLength;
            actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            deleteIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            // grid actions should not showing when the row is in edit mode #
            expect(deleteIcon).toBeUndefined();
            grid.gridAPI.crudService.endEdit();
            actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            deleteIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            expect(deleteIcon.nativeElement.innerText).toBe('delete');
            deleteIcon.parent.triggerEventHandler('click', new Event('click'));
            actionStrip.hide();
            fixture.detectChanges();
            expect(grid.rowList.first.rowData['ID']).toBe('ANATR');
            expect(dataLenght - 1).toBe(grid.dataLength);
        });

        it('should focus the first cell when editing mode is cell', () => {
            fixture.detectChanges();
            grid.selectRange({rowStart: 0, rowEnd: 0, columnStart: 'ContactName', columnEnd: 'ContactName'});
            fixture.detectChanges();
            grid.actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            const editIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[0];
            expect(editIcon.nativeElement.innerText).toBe('edit');
            editIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            // first cell of the row should be the active one, excluding ID as primaryKey
            expect(grid.selectionService.activeElement.column).toBe(1);
            expect(grid.selectionService.activeElement.row).toBe(0);
        });
    });

    describe('Menu ', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxActionStripEditMenuComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            grid = fixture.componentInstance.grid;
        }));
        it('should allow editing and deleting row via menu', async () => {
            const row = grid.rowList.toArray()[0];
            actionStrip.show(row);
            fixture.detectChanges();

            actionStrip.menu.open();
            fixture.detectChanges();
            expect(actionStrip.menu.items.length).toBe(2);
            const editMenuItem = actionStrip.menu.items[0];

            // select edit
            actionStrip.menu.selectItem(editMenuItem);
            fixture.detectChanges();

            expect(row.inEditMode).toBeTrue();

            grid.gridAPI.crudService.endEdit();
            fixture.detectChanges();
            actionStrip.menu.open();
            fixture.detectChanges();
            const deleteMenuItem = actionStrip.menu.items[1];

            // select delete
            actionStrip.menu.selectItem(deleteMenuItem);
            fixture.detectChanges();

            expect(grid.rowList.first.rowData['ID']).toBe('ANATR');
        });
    });

    describe('integration with pinning actions ', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxActionStripPinEditComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            grid = fixture.componentInstance.grid;
        }));
        it('should remove editing actions on disabled rows', () => {
            grid.rowList.first.pin();
            fixture.detectChanges();
            actionStrip.show(grid.rowList.toArray()[1]);
            fixture.detectChanges();
            const editingIcons = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions button`));
            const pinningIcons = fixture.debugElement.queryAll(By.css(`igx-grid-pinning-actions button`));
            expect(editingIcons.length).toBe(0);
            expect(pinningIcons.length).toBe(1);
            expect(pinningIcons[0].nativeElement.className.indexOf('igx-button--disabled') === -1).toBeTruthy();
        });
    });

    describe('auto show/hide', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxActionStripPinEditComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            grid = fixture.componentInstance.grid;
        }));
        it('should auto-show on mouse enter of row.', () => {
            const row = grid.getRowByIndex(0);
            const rowElem = row.nativeElement;
            UIInteractions.simulateMouseEvent('mouseenter', rowElem, 0, 0);
            fixture.detectChanges();

            expect(actionStrip.context).toBe(row);
            expect(actionStrip.hidden).toBeFalse();
        });
        it('should auto-hide on mouse leave of grid.', () => {
            const row = grid.getRowByIndex(0);
            actionStrip.show(row);
            fixture.detectChanges();

            expect(actionStrip.hidden).toBeFalse();
            UIInteractions.simulateMouseEvent('mouseleave', grid.nativeElement, 0, 0);
            fixture.detectChanges();

            expect(actionStrip.hidden).toBeTrue();
        });
    });

    describe('auto show/hide in HierarchicalGrid', () => {
        let actionStripRoot; let actionStripChild; let hierarchicalGrid: IgxHierarchicalGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridActionStripComponent);
            fixture.detectChanges();
            actionStripRoot = fixture.componentInstance.actionStripRoot;
            actionStripChild = fixture.componentInstance.actionStripChild;
            hierarchicalGrid = fixture.componentInstance.hgrid;
        }));

        it('should auto-show root actionStrip on mouse enter of root row.', () => {
            const row = hierarchicalGrid.getRowByIndex(0);
            const rowElem = row.nativeElement;
            UIInteractions.simulateMouseEvent('mouseenter', rowElem, 0, 0);
            fixture.detectChanges();

            expect(actionStripRoot.context).toBe(row);
            expect(actionStripRoot.hidden).toBeFalse();
            expect(actionStripChild.context).toBeUndefined();
        });

        it('should auto-show row island actionStrip on mouse enter of child row.', () => {
            const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            row.toggle();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[1];

            const childRow = childGrid.getRowByIndex(0);
            const rowElem = childRow.nativeElement;
            UIInteractions.simulateMouseEvent('mouseenter', rowElem, 0, 0);
            fixture.detectChanges();

            expect(actionStripChild.context).toBe(childRow);
            expect(actionStripChild.hidden).toBeFalse();

            expect(actionStripRoot.context).toBeUndefined();
        });

        it('should auto-hide all actionStrip on mouse leave of root grid.', () => {
            const row = hierarchicalGrid.getRowByIndex(0) as IgxHierarchicalRowComponent;
            row.toggle();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const childRow = childGrid.getRowByIndex(0);

            actionStripRoot.show(row);
            actionStripChild.show(childRow);
            fixture.detectChanges();

            UIInteractions.simulateMouseEvent('mouseleave', hierarchicalGrid.nativeElement, 0, 0);
            fixture.detectChanges();

            expect(actionStripRoot.hidden).toBeTrue();
            expect(actionStripChild.hidden).toBeTrue();
        });
    });
});

@Component({
    template: `
<igx-grid #grid [data]="data" [width]="'800px'" [height]="'500px'"
    [rowEditable]="true" [primaryKey]="'ID'">
    <igx-column *ngFor="let c of columns" [sortable]="true" [field]="c.field" [header]="c.field"
        [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
    </igx-column>

    <igx-action-strip #actionStrip>
        <igx-grid-editing-actions></igx-grid-editing-actions>
    </igx-action-strip>
</igx-grid>
`
})
class IgxActionStripTestingComponent implements OnInit {
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;

    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    private data: any[];
    private columns: any[];

    public ngOnInit() {

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
            /* eslint-disable max-len */
            { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
            { ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', Region: null, PostalCode: '05021', Country: 'Mexico', Phone: '(5) 555-4729', Fax: '(5) 555-3745' },
            { ID: 'ANTON', CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner', Address: 'Mataderos 2312', City: 'México D.F.', Region: null, PostalCode: '05023', Country: 'Mexico', Phone: '(5) 555-3932', Fax: null },
            { ID: 'AROUT', CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative', Address: '120 Hanover Sq.', City: 'London', Region: null, PostalCode: 'WA1 1DP', Country: 'UK', Phone: '(171) 555-7788', Fax: '(171) 555-6750' },
            { ID: 'BERGS', CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator', Address: 'Berguvsvägen 8', City: 'Luleå', Region: null, PostalCode: 'S-958 22', Country: 'Sweden', Phone: '0921-12 34 65', Fax: '0921-12 34 67' },
            { ID: 'BLAUS', CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative', Address: 'Forsterstr. 57', City: 'Mannheim', Region: null, PostalCode: '68306', Country: 'Germany', Phone: '0621-08460', Fax: '0621-08924' },
            { ID: 'BLONP', CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager', Address: '24, place Kléber', City: 'Strasbourg', Region: null, PostalCode: '67000', Country: 'France', Phone: '88.60.15.31', Fax: '88.60.15.32' },
            { ID: 'BOLID', CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner', Address: 'C/ Araquil, 67', City: 'Madrid', Region: null, PostalCode: '28023', Country: 'Spain', Phone: '(91) 555 22 82', Fax: '(91) 555 91 99' },
            { ID: 'BONAP', CompanyName: 'Bon app\'', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner', Address: '12, rue des Bouchers', City: 'Marseille', Region: null, PostalCode: '13008', Country: 'France', Phone: '91.24.45.40', Fax: '91.24.45.41' },
            { ID: 'BOTTM', CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager', Address: '23 Tsawassen Blvd.', City: 'Tsawassen', Region: 'BC', PostalCode: 'T2F 8M4', Country: 'Canada', Phone: '(604) 555-4729', Fax: '(604) 555-3745' },
            { ID: 'BSBEV', CompanyName: 'B\'s Beverages', ContactName: 'Victoria Ashworth', ContactTitle: 'Sales Representative', Address: 'Fauntleroy Circus', City: 'London', Region: null, PostalCode: 'EC2 5NT', Country: 'UK', Phone: '(171) 555-1212', Fax: null },
            { ID: 'CACTU', CompanyName: 'Cactus Comidas para llevar', ContactName: 'Patricio Simpson', ContactTitle: 'Sales Agent', Address: 'Cerrito 333', City: 'Buenos Aires', Region: null, PostalCode: '1010', Country: 'Argentina', Phone: '(1) 135-5555', Fax: '(1) 135-4892' },
            { ID: 'CENTC', CompanyName: 'Centro comercial Moctezuma', ContactName: 'Francisco Chang', ContactTitle: 'Marketing Manager', Address: 'Sierras de Granada 9993', City: 'México D.F.', Region: null, PostalCode: '05022', Country: 'Mexico', Phone: '(5) 555-3392', Fax: '(5) 555-7293' },
            { ID: 'CHOPS', CompanyName: 'Chop-suey Chinese', ContactName: 'Yang Wang', ContactTitle: 'Owner', Address: 'Hauptstr. 29', City: 'Bern', Region: null, PostalCode: '3012', Country: 'Switzerland', Phone: '0452-076545', Fax: null },
            { ID: 'COMMI', CompanyName: 'Comércio Mineiro', ContactName: 'Pedro Afonso', ContactTitle: 'Sales Associate', Address: 'Av. dos Lusíadas, 23', City: 'Sao Paulo', Region: 'SP', PostalCode: '05432-043', Country: 'Brazil', Phone: '(11) 555-7647', Fax: null },
            { ID: 'CONSH', CompanyName: 'Consolidated Holdings', ContactName: 'Elizabeth Brown', ContactTitle: 'Sales Representative', Address: 'Berkeley Gardens 12 Brewery', City: 'London', Region: null, PostalCode: 'WX1 6LT', Country: 'UK', Phone: '(171) 555-2282', Fax: '(171) 555-9199' },
            { ID: 'DRACD', CompanyName: 'Drachenblut Delikatessen', ContactName: 'Sven Ottlieb', ContactTitle: 'Order Administrator', Address: 'Walserweg 21', City: 'Aachen', Region: null, PostalCode: '52066', Country: 'Germany', Phone: '0241-039123', Fax: '0241-059428' },
            { ID: 'DUMON', CompanyName: 'Du monde entier', ContactName: 'Janine Labrune', ContactTitle: 'Owner', Address: '67, rue des Cinquante Otages', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.67.88.88', Fax: '40.67.89.89' },
            { ID: 'EASTC', CompanyName: 'Eastern Connection', ContactName: 'Ann Devon', ContactTitle: 'Sales Agent', Address: '35 King George', City: 'London', Region: null, PostalCode: 'WX3 6FW', Country: 'UK', Phone: '(171) 555-0297', Fax: '(171) 555-3373' },
            { ID: 'ERNSH', CompanyName: 'Ernst Handel', ContactName: 'Roland Mendel', ContactTitle: 'Sales Manager', Address: 'Kirchgasse 6', City: 'Graz', Region: null, PostalCode: '8010', Country: 'Austria', Phone: '7675-3425', Fax: '7675-3426' },
            { ID: 'FAMIA', CompanyName: 'Familia Arquibaldo', ContactName: 'Aria Cruz', ContactTitle: 'Marketing Assistant', Address: 'Rua Orós, 92', City: 'Sao Paulo', Region: 'SP', PostalCode: '05442-030', Country: 'Brazil', Phone: '(11) 555-9857', Fax: null },
            { ID: 'FISSA', CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.', ContactName: 'Diego Roel', ContactTitle: 'Accounting Manager', Address: 'C/ Moralzarzal, 86', City: 'Madrid', Region: null, PostalCode: '28034', Country: 'Spain', Phone: '(91) 555 94 44', Fax: '(91) 555 55 93' },
            { ID: 'FOLIG', CompanyName: 'Folies gourmandes', ContactName: 'Martine Rancé', ContactTitle: 'Assistant Sales Agent', Address: '184, chaussée de Tournai', City: 'Lille', Region: null, PostalCode: '59000', Country: 'France', Phone: '20.16.10.16', Fax: '20.16.10.17' },
            { ID: 'FOLKO', CompanyName: 'Folk och fä HB', ContactName: 'Maria Larsson', ContactTitle: 'Owner', Address: 'Åkergatan 24', City: 'Bräcke', Region: null, PostalCode: 'S-844 67', Country: 'Sweden', Phone: '0695-34 67 21', Fax: null },
            { ID: 'FRANK', CompanyName: 'Frankenversand', ContactName: 'Peter Franken', ContactTitle: 'Marketing Manager', Address: 'Berliner Platz 43', City: 'München', Region: null, PostalCode: '80805', Country: 'Germany', Phone: '089-0877310', Fax: '089-0877451' },
            { ID: 'FRANR', CompanyName: 'France restauration', ContactName: 'Carine Schmitt', ContactTitle: 'Marketing Manager', Address: '54, rue Royale', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.32.21.21', Fax: '40.32.21.20' },
            { ID: 'FRANS', CompanyName: 'Franchi S.p.A.', ContactName: 'Paolo Accorti', ContactTitle: 'Sales Representative', Address: 'Via Monte Bianco 34', City: 'Torino', Region: null, PostalCode: '10100', Country: 'Italy', Phone: '011-4988260', Fax: '011-4988261' }
        ];
        /* eslint-enable max-len */
    }
}

@Component({
    template: `
<igx-grid #grid [data]="data" [width]="'800px'" [height]="'500px'"
    [rowEditable]="true" [primaryKey]="'ID'">
    <igx-column *ngFor="let c of columns" [sortable]="true" [field]="c.field" [header]="c.field"
        [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
    </igx-column>

    <igx-action-strip #actionStrip>
        <igx-grid-pinning-actions></igx-grid-pinning-actions>
        <igx-grid-editing-actions></igx-grid-editing-actions>
    </igx-action-strip>
</igx-grid>
`
})
class IgxActionStripPinEditComponent extends IgxActionStripTestingComponent {
}

@Component({
    template: `
<igx-grid #grid [data]="data" [width]="'800px'" [height]="'500px'"
    [rowEditable]="true" [primaryKey]="'ID'">
    <igx-column *ngFor="let c of columns" [sortable]="true" [field]="c.field" [header]="c.field"
        [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
    </igx-column>

    <igx-action-strip #actionStrip>
        <igx-grid-editing-actions [asMenuItems]='true'></igx-grid-editing-actions>
    </igx-action-strip>
</igx-grid>
`
})
class IgxActionStripEditMenuComponent extends IgxActionStripTestingComponent {
}
