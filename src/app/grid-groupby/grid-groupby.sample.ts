import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DefaultSortingStrategy, GridSummaryCalculationMode, GridSummaryPosition, GroupMemberCountSortingStrategy, IRowSelectionEventArgs, ISortingExpression, ISortingOptions, IgxButtonDirective, IgxButtonGroupComponent, IgxColumnComponent, IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective, IgxGridComponent, IgxSwitchComponent, IgxToggleActionDirective, SortingDirection } from 'igniteui-angular';

@Component({
    selector: 'app-grid-sample',
    styleUrls: ['grid-groupby.sample.scss'],
    templateUrl: 'grid-groupby.sample.html',
    imports: [IgxSwitchComponent, FormsModule, IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, NgFor, IgxDropDownItemComponent, IgxButtonGroupComponent, IgxGridComponent, IgxColumnComponent]
})
export class GridGroupBySampleComponent implements OnInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    public data: Array<any>;
    public data2: any[] = [];
    public hideGroupedColumns = false;
    public expState = [];
    public columns: Array<any>;
    public groupingExpressions: Array<ISortingExpression>;
    public perfGrpExpr = [{ fieldName: 'FIELD', dir: SortingDirection.Asc }];
    public summaryMode: GridSummaryCalculationMode = GridSummaryCalculationMode.rootLevelOnly;
    public summaryModes = [];
    public selectionModes: any[];
    public position: GridSummaryPosition = GridSummaryPosition.top;
    public sortingOp: ISortingOptions = { mode: 'multiple' };

    protected size = 'medium';

    constructor() { }

    public ngOnInit(): void {
        for (let i = 0; i < 2500; i++) {
            this.data2.push(...Array(10).fill({ STATUS: 'A', FIELD: 'some text' }));
            this.data2.push(...Array(10).fill({ STATUS: 'B', FIELD: 'some text' }));
            this.data2.push(...Array(10).fill({ STATUS: 'C', FIELD: 'some text' }));
            this.data2.push(...Array(10).fill({ STATUS: 'D', FIELD: 'some text' }));
        }
        this.data2 = this.data2.map((rec, index) => ({ ...rec, ID: index }));
        this.columns = [
            { dataType: 'string', field: 'ID', width: 100, hidden: true },
            { dataType: 'string', field: 'CompanyName', width: 300, groupable: true },
            { dataType: 'number', field: 'Salary', width: 200, pinned: true },
            { dataType: 'string', field: 'ContactTitle', width: 200, pinned: true, groupable: true },
            { dataType: 'string', field: 'Address', width: 300, groupable: true },
            { dataType: 'string', field: 'Country', width: 150, groupable: true },
            { dataType: 'string', field: 'City', width: 150, groupable: true },
            { dataType: 'string', field: 'Region', width: 150, groupable: true },
            { dataType: 'string', field: 'PostalCode', width: 150, groupable: true },
            { dataType: 'string', field: 'Phone', width: 150, groupable: true },
            { dataType: 'string', field: 'Fax', width: 150, groupable: true }
        ];
        this.selectionModes = ['multiple', 'single', 'none'];
        this.grid1.rowSelection = this.selectionModes[0];
        this.hideGroupedColumns = true;
        this.summaryModes = [
            { label: 'rootLevelOnly', selected: this.summaryMode === 'rootLevelOnly', togglable: true },
            { label: 'childLevelsOnly', selected: this.summaryMode === 'childLevelsOnly', togglable: true },
            { label: 'rootAndChildLevels', selected: this.summaryMode === 'rootAndChildLevels', togglable: true }
        ];

        this.data = [
            { Salary: 10000, ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
            { Salary: 2000, ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', Region: null, PostalCode: '05021', Country: 'Mexico', Phone: '(5) 555-4729', Fax: '(5) 555-3745' },
            { Salary: 2000, ID: 'ANTON', CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner', Address: 'Mataderos 2312', City: 'México D.F.', Region: null, PostalCode: '05023', Country: 'Mexico', Phone: '(5) 555-3932', Fax: null },
            { Salary: 3000, ID: 'AROUT', CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative', Address: '120 Hanover Sq.', City: 'London', Region: null, PostalCode: 'WA1 1DP', Country: 'UK', Phone: '(171) 555-7788', Fax: '(171) 555-6750' },
            { Salary: 1000, ID: 'BERGS', CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator', Address: 'Berguvsvägen 8', City: 'Luleå', Region: null, PostalCode: 'S-958 22', Country: 'Sweden', Phone: '0921-12 34 65', Fax: '0921-12 34 67' },
            { Salary: 800, ID: 'BLAUS', CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative', Address: 'Forsterstr. 57', City: 'Mannheim', Region: null, PostalCode: '68306', Country: 'Germany', Phone: '0621-08460', Fax: '0621-08924' },
            { Salary: 900, ID: 'BLONP', CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager', Address: '24, place Kléber', City: 'Strasbourg', Region: null, PostalCode: '67000', Country: 'France', Phone: '88.60.15.31', Fax: '88.60.15.32' },
            { Salary: 9000, ID: 'BOLID', CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner', Address: 'C/ Araquil, 67', City: 'Madrid', Region: null, PostalCode: '28023', Country: 'Spain', Phone: '(91) 555 22 82', Fax: '(91) 555 91 99' },
            { Salary: 3300, ID: 'BONAP', CompanyName: 'Bon app\'s', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner', Address: '12, rue des Bouchers', City: 'Marseille', Region: null, PostalCode: '13008', Country: 'France', Phone: '91.24.45.40', Fax: '91.24.45.41' },
            { Salary: 2500, ID: 'BOTTM', CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager', Address: '23 Tsawassen Blvd.', City: 'Tsawassen', Region: 'BC', PostalCode: 'T2F 8M4', Country: 'Canada', Phone: '(604) 555-4729', Fax: '(604) 555-3745' },
            { Salary: 4700, ID: 'BSBEV', CompanyName: 'B\'s Beverages', ContactName: 'Victoria Ashworth', ContactTitle: 'Sales Representative', Address: 'Fauntleroy Circus', City: 'London', Region: null, PostalCode: 'EC2 5NT', Country: 'UK', Phone: '(171) 555-1212', Fax: null },
            { Salary: 4100, ID: 'CACTU', CompanyName: 'Cactus Comidas para llevar', ContactName: 'Patricio Simpson', ContactTitle: 'Sales Agent', Address: 'Cerrito 333', City: 'Buenos Aires', Region: null, PostalCode: '1010', Country: 'Argentina', Phone: '(1) 135-5555', Fax: '(1) 135-4892' },
            { Salary: 2400, ID: 'CENTC', CompanyName: 'Centro comercial Moctezuma', ContactName: 'Francisco Chang', ContactTitle: 'Marketing Manager', Address: 'Sierras de Granada 9993', City: 'México D.F.', Region: null, PostalCode: '05022', Country: 'Mexico', Phone: '(5) 555-3392', Fax: '(5) 555-7293' },
            { Salary: 3700, ID: 'CHOPS', CompanyName: 'Chop-suey Chinese', ContactName: 'Yang Wang', ContactTitle: 'Owner', Address: 'Hauptstr. 29', City: 'Bern', Region: null, PostalCode: '3012', Country: 'Switzerland', Phone: '0452-076545', Fax: null },
            { Salary: 1600, ID: 'COMMI', CompanyName: 'Comércio Mineiro', ContactName: 'Pedro Afonso', ContactTitle: 'Sales Associate', Address: 'Av. dos Lusíadas, 23', City: 'Sao Paulo', Region: 'SP', PostalCode: '05432-043', Country: 'Brazil', Phone: '(11) 555-7647', Fax: null },
            { Salary: 1800, ID: 'CONSH', CompanyName: 'Consolidated Holdings', ContactName: 'Elizabeth Brown', ContactTitle: 'Sales Representative', Address: 'Berkeley Gardens 12 Brewery', City: 'London', Region: null, PostalCode: 'WX1 6LT', Country: 'UK', Phone: '(171) 555-2282', Fax: '(171) 555-9199' },
            { Salary: 1000, ID: 'DRACD', CompanyName: 'Drachenblut Delikatessen', ContactName: 'Sven Ottlieb', ContactTitle: 'Order Administrator', Address: 'Walserweg 21', City: 'Aachen', Region: null, PostalCode: '52066', Country: 'Germany', Phone: '0241-039123', Fax: '0241-059428' },
            { Salary: 3900, ID: 'DUMON', CompanyName: 'Du monde entier', ContactName: 'Janine Labrune', ContactTitle: 'Owner', Address: '67, rue des Cinquante Otages', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.67.88.88', Fax: '40.67.89.89' },
            { Salary: 5000, ID: 'EASTC', CompanyName: 'Eastern Connection', ContactName: 'Ann Devon', ContactTitle: 'Sales Agent', Address: '35 King George', City: 'London', Region: null, PostalCode: 'WX3 6FW', Country: 'UK', Phone: '(171) 555-0297', Fax: '(171) 555-3373' },
            { Salary: 5700, ID: 'ERNSH', CompanyName: 'Ernst Handel', ContactName: 'Roland Mendel', ContactTitle: 'Sales Manager', Address: 'Kirchgasse 6', City: 'Graz', Region: null, PostalCode: '8010', Country: 'Austria', Phone: '7675-3425', Fax: '7675-3426' },
            { Salary: 4400, ID: 'FAMIA', CompanyName: 'Familia Arquibaldo', ContactName: 'Aria Cruz', ContactTitle: 'Marketing Assistant', Address: 'Rua Orós, 92', City: 'Sao Paulo', Region: 'SP', PostalCode: '05442-030', Country: 'Brazil', Phone: '(11) 555-9857', Fax: null },
            { Salary: 3300, ID: 'FISSA', CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.', ContactName: 'Diego Roel', ContactTitle: 'Accounting Manager', Address: 'C/ Moralzarzal, 86', City: 'Madrid', Region: null, PostalCode: '28034', Country: 'Spain', Phone: '(91) 555 94 44', Fax: '(91) 555 55 93' },
            { Salary: 2200, ID: 'FOLIG', CompanyName: 'Folies gourmandes', ContactName: 'Martine Rancé', ContactTitle: 'Assistant Sales Agent', Address: '184, chaussée de Tournai', City: 'Lille', Region: null, PostalCode: '59000', Country: 'France', Phone: '20.16.10.16', Fax: '20.16.10.17' },
            { Salary: 1100, ID: 'FOLKO', CompanyName: 'Folk och fä HB', ContactName: 'Maria Larsson', ContactTitle: 'Owner', Address: 'Åkergatan 24', City: 'Bräcke', Region: null, PostalCode: 'S-844 67', Country: 'Sweden', Phone: '0695-34 67 21', Fax: null },
            { Salary: 2480, ID: 'FRANK', CompanyName: 'Frankenversand', ContactName: 'Peter Franken', ContactTitle: 'Marketing Manager', Address: 'Berliner Platz 43', City: 'München', Region: null, PostalCode: '80805', Country: 'Germany', Phone: '089-0877310', Fax: '089-0877451' },
            { Salary: 6600, ID: 'FRANR', CompanyName: 'France restauration', ContactName: 'Carine Schmitt', ContactTitle: 'Marketing Manager', Address: '54, rue Royale', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.32.21.21', Fax: '40.32.21.20' },
            { Salary: 4900, ID: 'FRANS', CompanyName: 'Franchi S.p.A.', ContactName: 'Paolo Accorti', ContactTitle: 'Sales Representative', Address: 'Via Monte Bianco 34', City: 'Torino', Region: null, PostalCode: '10100', Country: 'Italy', Phone: '011-4988260', Fax: '011-4988261' }
        ];
    }

    public groupBy(name: string) {
        const expressions = this.grid1.groupingExpressions;
        for (const gr of expressions) {
            if (gr.fieldName === name) {
                this.grid1.clearGrouping(name);
                return;
            }
        }
        this.grid1.groupBy({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance() });
    }

    public sortByGroup() {
        const expressions = this.grid1.groupingExpressions;
        if (expressions.length) {
            const fieldName = expressions[0].fieldName;
            const dir = expressions[0].dir === SortingDirection.Asc ? SortingDirection.Desc : SortingDirection.Asc;
            this.grid1.groupBy({ fieldName, dir, ignoreCase: false, strategy: GroupMemberCountSortingStrategy.instance() });
        }
    }

    public toggleGroupedVisibility(event) {
        this.grid1.hideGroupedColumns = !event.checked;
    }

    public toggleSummaryPosition() {
        this.position = this.position === GridSummaryPosition.top ? GridSummaryPosition.bottom : GridSummaryPosition.top;
    }
    public toggleDensity() {
        switch (this.size) {
            case "large": this.size = "small"; break;
            case "small": this.size = "medium"; break;
            case "medium": this.size = "large"; break;
        }
    }
    public onRowSelection(event) {
        this.grid1.rowSelection = event.newSelection.element.nativeElement.textContent.trim();
    }
    public getRowsList() {
        console.log(this.grid1.rowList);
    }

    public getState() {
        console.log(JSON.stringify(this.expState));
        console.log(JSON.stringify(this.groupingExpressions));
    }

    public groupingDoneHandler(event) {
        console.log('groupingDone: ');
        console.log(event);
    }
    public getData(item) {
        console.log(item);
    }

    public groupMultiple() {
        const expr = [
            { fieldName: 'ContactTitle', dir: 1, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
            { fieldName: 'Address', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
            { fieldName: 'Country', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() }
        ];
        this.grid1.groupBy(expr);
    }

    public ungroupMultiple() {
        this.grid1.clearGrouping(['Address', 'Country']);
    }

    public groupUngroupMultiple() {
        const expr = [
            { fieldName: 'ContactTitle', dir: 1, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
            { fieldName: 'Address', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance() },
        ];
        this.grid1.groupingExpressions = expr;
    }

    public selectSummaryMode(event) {
        this.summaryMode = this.summaryModes[event.index].label;
    }

    public hideGroupableRow() {
        this.grid1.showGroupArea = !this.grid1.showGroupArea;
        this.grid1.cdr.detectChanges();
    }

    public rowSelectionChanged(e: IRowSelectionEventArgs) {
        console.log(e);
    }
}
