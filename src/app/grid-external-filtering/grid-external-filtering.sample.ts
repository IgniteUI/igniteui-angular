import { Component, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef, HostBinding } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterMode, FilteringExpressionsTree, FilteringLogic, GridSelectionMode, IChangeCheckboxEventArgs, IgxAdvancedFilteringDialogComponent, IgxButtonDirective, IgxButtonGroupComponent, IgxCSVTextDirective, IgxCheckboxComponent, IgxColumnComponent, IgxExcelTextDirective, IgxFlexDirective, IgxGridComponent, IgxGridExcelStyleFilteringComponent, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarExporterComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxLabelDirective, IgxLayoutDirective, IgxSelectComponent, IgxSelectItemComponent, IgxStringFilteringOperand } from 'igniteui-angular';


@Component({
    providers: [],
    selector: 'app-grid-external-filtering-sample',
    styleUrls: ['grid-external-filtering.sample.scss'],
    templateUrl: 'grid-external-filtering.sample.html',
    imports: [IgxFlexDirective, IgxLayoutDirective, IgxButtonGroupComponent, IgxSelectComponent, IgxLabelDirective, NgFor, IgxSelectItemComponent, IgxGridExcelStyleFilteringComponent, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, IgxColumnComponent, IgxAdvancedFilteringDialogComponent, IgxCheckboxComponent, FormsModule, IgxButtonDirective]
})
export class GridExternalFilteringComponent implements OnInit, AfterViewInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true })
    public grid1: IgxGridComponent;

    @ViewChild('applyChangesCheckbox', { static: true })
    public applyChangesCheckbox: IgxCheckboxComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public sizes;
    public filterModes;
    public size = 'large';
    public selectionMode;

    constructor(private cdr: ChangeDetectorRef) {
    }

    public ngAfterViewInit(): void {
        const tree = new FilteringExpressionsTree(FilteringLogic.And);
        tree.filteringOperands.push({
            fieldName: 'ID',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'a',
            ignoreCase: true
        });
        const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
        orTree.filteringOperands.push({
            fieldName: 'ID',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'b',
            ignoreCase: true
        });
        orTree.filteringOperands.push({
            fieldName: 'CompanyName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'c',
            ignoreCase: true
        });
        tree.filteringOperands.push(orTree);
        tree.filteringOperands.push({
            fieldName: 'CompanyName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'd',
            ignoreCase: true
        });

        this.grid1.advancedFilteringExpressionsTree = tree;
        this.cdr.detectChanges();
    }

    public ngOnInit(): void {
        this.sizes = [
            { label: 'large', selected: this.size === 'large', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'small', selected: this.size === 'small', togglable: true }
        ];

        this.filterModes = [
            {
                label: 'Filter Row',
                value: FilterMode.quickFilter,
                selected: false,
                togglable: true },
            {
                label: 'Excel Style',
                value: FilterMode.excelStyleFilter,
                selected: true,
                togglable: true
            }
        ];

        this.columns = [
            { field: 'ID', width: 80, resizable: true, type: 'string' },
            { field: 'CompanyName', width: 150, resizable: true, type: 'string'},
            { field: 'ContactName', width: 150, resizable: true, type: 'string' },
            { field: 'Employees', width: 150, resizable: true, type: 'number' },
            { field: 'ContactTitle', width: 150, resizable: true, type: 'string' },
            { field: 'DateCreated', width: 150, resizable: true, type: 'date' },
            { field: 'Address', width: 150, resizable: true, type: 'string' },
            { field: 'City', width: 150, resizable: true, type: 'string' },
            { field: 'Region', width: 150, resizable: true, type: 'string' },
            { field: 'PostalCode', width: 150, resizable: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, type: 'string' },
            { field: 'Fax', width: 150, resizable: true, type: 'string' },
            { field: 'Contract', width: 150, resizable: true, type: 'boolean' }
        ];
        this.data = [
            {
                ID: 'ALFKI',
                CompanyName: 'Alfreds Futterkiste',
                ContactName: 'Maria Anders',
                ContactTitle: 'Sales Representative',
                Address: 'Obere Str. 57',
                City: 'Berlin', Region: null,
                PostalCode: '12209',
                Country: 'Germany',
                Phone: '030-0074321',
                Fax: '030-0076545',
                Employees: 68,
                DateCreated: new Date(2018, 8, 17),
                Contract: true
            },
            {
                ID: 'ANATR',
                CompanyName: 'Ana Trujillo Emparedados y helados',
                ContactName: 'Ana Trujillo',
                ContactTitle: 'Owner',
                Address: 'Avda. de la Constitución 2222',
                City: 'México D.F.',
                Region: null,
                PostalCode: '05021',
                Country: 'Mexico',
                Phone: '(5) 555-4729',
                Fax: '(5) 555-3745',
                Employees: 47,
                DateCreated: new Date(2015, 10, 1),
                Contract: true
            },
            {
                ID: 'ANTON',
                CompanyName: 'Antonio Moreno Taquería',
                ContactName: 'Antonio Moreno',
                ContactTitle: 'Owner',
                Address: 'Mataderos 2312',
                City: 'México D.F.',
                Region: null,
                PostalCode: '05023',
                Country: 'Mexico',
                Phone: '(5) 555-3932',
                Fax: null,
                Employees: 16,
                DateCreated: new Date(2016, 5, 5),
                Contract: false
            },
            {
                ID: 'AROUT',
                CompanyName: 'Around the Horn',
                ContactName: 'Thomas Hardy',
                ContactTitle: 'Sales Representative',
                Address: '120 Hanover Sq.',
                City: 'London',
                Region: null,
                PostalCode: 'WA1 1DP',
                Country: 'UK',
                Phone: '(171) 555-7788',
                Fax: '(171) 555-6750',
                Employees: 71,
                DateCreated: new Date(2010, 2, 15),
                Contract: false
            },
            {
                ID: 'BERGS',
                CompanyName: 'Berglunds snabbköp',
                ContactName: 'Christina Berglund',
                ContactTitle: 'Order Administrator',
                Address: 'Berguvsvägen 8',
                City: 'Luleå',
                Region: null,
                PostalCode: 'S-958 22',
                Country: 'Sweden',
                Phone: '0921-12 34 65',
                Fax: '0921-12 34 67',
                Employees: 213,
                DateCreated: new Date(2015, 2, 5),
                Contract: true
            },
            {
                ID: 'BLAUS',
                CompanyName: 'Blauer See Delikatessen',
                ContactName: 'Hanna Moos',
                ContactTitle: 'Sales Representative',
                Address: 'Forsterstr. 57',
                City: 'Mannheim',
                Region: null,
                PostalCode: '68306',
                Country: 'Germany',
                Phone: '0621-08460',
                Fax: '0621-08924',
                Employees: 347,
                DateCreated: new Date(2016, 7, 1),
                Contract: true
            },
            {
                ID: 'BLONP',
                CompanyName: 'Blondesddsl père et fils',
                ContactName: 'Frédérique Citeaux',
                ContactTitle: 'Marketing Manager',
                Address: '24, place Kléber',
                City: 'Strasbourg',
                Region: null,
                PostalCode: '67000',
                Country: 'France',
                Phone: '88.60.15.31',
                Fax: '88.60.15.32',
                Employees: 34,
                DateCreated: new Date(2016, 10, 5),
                Contract: true
            },
            {
                ID: 'BOLID',
                CompanyName: 'Bólido Comidas preparadas',
                ContactName: 'Martín Sommer',
                ContactTitle: 'Owner',
                Address: 'C/ Araquil, 67',
                City: 'Madrid',
                Region: null,
                PostalCode: '28023',
                Country: 'Spain',
                Phone: '(91) 555 22 82',
                Fax: '(91) 555 91 99',
                Employees: 54,
                DateCreated: new Date(2016, 4, 20),
                Contract: true
            },
            {
                ID: 'BONAP',
                CompanyName: 'Bon app',
                ContactName: 'Laurence Lebihan',
                ContactTitle: 'Owner',
                Address: '12, rue des Bouchers',
                City: 'Marseille',
                Region: null,
                PostalCode: '13008',
                Country: 'France',
                Phone: '91.24.45.40',
                Fax: '91.24.45.41',
                Employees: 68,
                DateCreated: new Date(2018, 3, 5),
                Contract: false
            },
            {
                ID: 'BOTTM',
                CompanyName: 'Bottom-Dollar Markets',
                ContactName: 'Elizabeth Lincoln',
                ContactTitle: 'Accounting Manager',
                Address: '23 Tsawassen Blvd.',
                City: 'Tsawassen',
                Region: 'BC',
                PostalCode: 'T2F 8M4',
                Country: 'Canada',
                Phone: '(604) 555-4729',
                Fax: '(604) 555-3745',
                Employees: 107,
                DateCreated: new Date(2017, 6, 10),
                Contract: true
            },
            {
                ID: 'BSBEV',
                CompanyName: 'Beverages',
                ContactName: 'Victoria Ashworth',
                ContactTitle: 'Sales Representative',
                Address: 'Fauntleroy Circus',
                City: 'London',
                Region: null,
                PostalCode: 'EC2 5NT',
                Country: 'UK',
                Phone: '(171) 555-1212',
                Fax: null,
                Employees: 197,
                DateCreated: new Date(2017, 10, 4),
                Contract: true
            },
            {
                ID: 'CACTU',
                CompanyName:
                'Cactus Comidas para llevar',
                ContactName: 'Patricio Simpson',
                ContactTitle: 'Sales Agent',
                Address: 'Cerrito 333',
                City: 'Buenos Aires',
                Region: null,
                PostalCode: '1010',
                Country: 'Argentina',
                Phone: '(1) 135-5555',
                Fax: '(1) 135-4892',
                Employees: 33,
                DateCreated: new Date(2014, 5, 12),
                Contract: false
            },
            {
                ID: 'CENTC',
                CompanyName: 'Centro comercial Moctezuma',
                ContactName: 'Francisco Chang',
                ContactTitle: 'Marketing Manager',
                Address: 'Sierras de Granada 9993',
                City: 'México D.F.',
                Region: null,
                PostalCode: '05022',
                Country: 'Mexico',
                Phone: '(5) 555-3392',
                Fax: '(5) 555-7293',
                Employees: 18,
                DateCreated: new Date(2015, 6, 27),
                Contract: true
            },
            {
                ID: 'CHOPS',
                CompanyName: 'Chop-suey Chinese',
                ContactName: 'Yang Wang',
                ContactTitle: 'Owner',
                Address: 'Hauptstr. 29',
                City: 'Bern',
                Region: null,
                PostalCode: '3012',
                Country: 'Switzerland',
                Phone: '0452-076545',
                Fax: null,
                Employees: 380,
                DateCreated: new Date(2011, 8, 6),
                Contract: true
            },
            {
                ID: 'COMMI',
                CompanyName: 'Comércio Mineiro',
                ContactName: 'Pedro Afonso',
                ContactTitle: 'Sales Associate',
                Address: 'Av. dos Lusíadas, 23',
                City: 'Sao Paulo', Region: 'SP',
                PostalCode: '05432-043',
                Country: 'Brazil',
                Phone: '(11) 555-7647',
                Fax: null,
                Employees: 137,
                DateCreated: new Date(2012, 6, 10),
                Contract: false
            },
            {
                ID: 'CONSH',
                CompanyName: 'Consolidated Holdings',
                ContactName: 'Elizabeth Brown',
                ContactTitle: 'Sales Representative',
                Address: 'Berkeley Gardens 12 Brewery',
                City: 'London',
                Region: null,
                PostalCode: 'WX1 6LT',
                Country: 'UK',
                Phone: '(171) 555-2282',
                Fax: '(171) 555-9199',
                Employees: 150,
                DateCreated: new Date(2012, 6, 10),
                Contract: false
            },
            {
                ID: 'DRACD',
                CompanyName: 'Drachenblut Delikatessen',
                ContactName: 'Sven Ottlieb',
                ContactTitle: 'Order Administrator',
                Address: 'Walserweg 21',
                City: 'Aachen',
                Region: null,
                PostalCode: '52066',
                Country: 'Germany',
                Phone: '0241-039123',
                Fax: '0241-059428',
                Employees: 265,
                DateCreated: new Date(2014, 9, 11),
                Contract: true
            },
            {
                ID: 'DUMON',
                CompanyName: 'Du monde entier',
                ContactName: 'Janine Labrune',
                ContactTitle: 'Owner',
                Address: '67, rue des Cinquante Otages',
                City: 'Nantes',
                Region: null,
                PostalCode: '44000',
                Country: 'France',
                Phone: '40.67.88.88',
                Fax: '40.67.89.89',
                Employees: 24,
                DateCreated: new Date(2015, 8, 4),
                Contract: true
            },
            {
                ID: 'EASTC',
                CompanyName: 'Eastern Connection',
                ContactName: 'Ann Devon',
                ContactTitle: 'Sales Agent',
                Address: '35 King George',
                City: 'London',
                Region: null,
                PostalCode: 'WX3 6FW',
                Country: 'UK',
                Phone: '(171) 555-0297',
                Fax: '(171) 555-3373',
                Employees: 123,
                DateCreated: new Date(2013, 4, 18),
                Contract: false
            },
            {
                ID: 'ERNSH',
                CompanyName:
                'Ernst Handel',
                ContactName: 'Roland Mendel',
                ContactTitle: 'Sales Manager',
                Address: 'Kirchgasse 6',
                City: 'Graz',
                Region: null,
                PostalCode: '8010',
                Country: 'Austria',
                Phone: '7675-3425',
                Fax: '7675-3426',
                Employees: 9,
                DateCreated: new Date(2013, 7, 9),
                Contract: true
            },
            {
                ID: 'FAMIA',
                CompanyName: 'Familia Arquibaldo',
                ContactName: 'Aria Cruz',
                ContactTitle: 'Marketing Assistant',
                Address: 'Rua Orós, 92',
                City: 'Sao Paulo',
                Region: 'SP',
                PostalCode: '05442-030',
                Country: 'Brazil',
                Phone: '(11) 555-9857',
                Fax: null,
                Employees: 67,
                DateCreated: new Date(2015, 6, 17),
                Contract: true
            },
            {
                ID: 'FISSA',
                CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.',
                ContactName: 'Diego Roel',
                ContactTitle: 'Accounting Manager',
                Address: 'C/ Moralzarzal, 86',
                City: 'Madrid',
                Region: null,
                PostalCode: '28034',
                Country: 'Spain',
                Phone: '(91) 555 94 44',
                Fax: '(91) 555 55 93',
                Employees: 87,
                DateCreated: new Date(2017, 3, 15),
                Contract: false
            },
            {
                ID: 'FOLIG',
                CompanyName: 'Folies gourmandes',
                ContactName: 'Martine Rancé',
                ContactTitle: 'Assistant Sales Agent',
                Address: '184, chaussée de Tournai',
                City: 'Lille',
                Region: null,
                PostalCode: '59000',
                Country: 'France',
                Phone: '20.16.10.16',
                Fax: '20.16.10.17',
                Employees: 37,
                DateCreated: new Date(2014, 5, 14),
                Contract: false
            },
            {
                ID: 'FOLKO',
                CompanyName: 'Folk och fä HB',
                ContactName: 'Maria Larsson',
                ContactTitle: 'Owner',
                Address: 'Åkergatan 24',
                City: 'Bräcke',
                Region: null,
                PostalCode: 'S-844 67',
                Country: 'Sweden',
                Phone: '0695-34 67 21',
                Fax: null,
                Employees: 42,
                DateCreated: new Date(2011, 3, 21),
                Contract: true
            },
            {
                ID: 'FRANK',
                CompanyName: 'Frankenversand',
                ContactName: 'Peter Franken',
                ContactTitle: 'Marketing Manager',
                Address: 'Berliner Platz 43',
                City: 'München',
                Region: null,
                PostalCode: '80805',
                Country: 'Germany',
                Phone: '089-0877310',
                Fax: '089-0877451',
                Employees: 17,
                DateCreated: new Date(2010, 7, 24),
                Contract: true
            },
            {
                ID: 'FRANR',
                CompanyName: 'France restauration',
                ContactName: 'Carine Schmitt',
                ContactTitle: 'Marketing Manager',
                Address: '54, rue Royale',
                City: 'Nantes',
                Region: null,
                PostalCode: '44000',
                Country: 'France',
                Phone: '40.32.21.21',
                Fax: '40.32.21.20',
                Employees: 20,
                DateCreated: new Date(2011, 7, 14),
                Contract: true
            },
            {
                ID: 'FRANS',
                CompanyName: 'Franchi S.p.A.',
                ContactName: 'Paolo Accorti',
                ContactTitle: 'Sales Representative',
                Address: 'Via Monte Bianco 34',
                City: 'Torino', Region: null,
                PostalCode: '10100',
                Country: 'Italy',
                Phone: '011-4988260',
                Fax: '011-4988261',
                Employees: 5,
                DateCreated: new Date(2012, 8, 3),
                Contract: false
            }
        ];
        this.selectionMode = GridSelectionMode.multiple;
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }

    public selectFilterMode(event) {
        const filterMode = this.filterModes[event.index].value as FilterMode;
        if (filterMode !== this.grid1.filterMode) {
            this.grid1.filterMode = filterMode;
            this.grid1.reflow();
        }
    }

    public openAdvancedFiltering() {
        this.grid1.openAdvancedFilteringDialog();
    }

    public closeAdvancedFiltering() {
        this.grid1.closeAdvancedFilteringDialog(this.applyChangesCheckbox.checked);
    }

    public clearAdvancedFiltering() {
        this.grid1.advancedFilteringExpressionsTree = null;
    }

    public onAllowFilteringChanged(event: IChangeCheckboxEventArgs) {
        this.grid1.allowFiltering = event.checked;
        this.grid1.reflow();
    }
}
