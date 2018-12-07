import { Component, Injectable, ViewChild, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { IgxTreeGridComponent, IgxExcelExporterService, IgxCsvExporterService,
    IgxCsvExporterOptions, IgxExcelExporterOptions, CsvFileTypes } from 'igniteui-angular';

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['tree-grid.sample.css'],
    templateUrl: 'tree-grid.sample.html'
})

export class TreeGridSampleComponent implements OnInit {

    public data: Array<any>;
    public columns: Array<any>;
    private nextRow = 1;

    @ViewChild('grid1') public grid1: IgxTreeGridComponent;

    public density = '';
    public displayDensities;

    constructor(private excelExporterService: IgxExcelExporterService,
        private csvExporterService: IgxCsvExporterService) {
}
    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];

        this.columns = [
            { field: 'ID', width: 150, resizable: true, movable: true, pinned: true },
            { field: 'CompanyName', width: 150, resizable: true, movable: true },
            { field: 'ContactName', width: 150, resizable: true, movable: true },
            { field: 'ContactTitle', width: 150, resizable: true, movable: true },
            { field: 'Address', width: 150, resizable: true, movable: true },
            { field: 'City', width: 150, resizable: true, movable: true },
            { field: 'Region', width: 150, resizable: true, movable: true },
            { field: 'PostalCode', width: 150, resizable: true, movable: true },
            { field: 'Phone', width: 150, resizable: true, movable: true },
            { field: 'Fax', width: 150, resizable: true, movable: true }
        ];
        this.data = [
            {
                'ID': 'ALFKI',
                'CompanyName': 'Alfreds Futterkiste',
                'ContactName': 'Maria Anders',
                'ContactTitle': 'Sales Representative',
                'Address': 'Obere Str. 57',
                'City': 'Berlin', 'Region': null,
                'PostalCode': '12209',
                'Country': 'Germany',
                'Phone': '030-0074321',
                'Fax': '030-0076545',
                'ChildCompanies': [
                    {
                        'ID': 'ANATR',
                        'CompanyName': 'Ana Trujillo Emparedados y helados',
                        'ContactName': 'Ana Trujillo',
                        'ContactTitle': 'Owner',
                        'Address': 'Avda. de la Constitución 2222',
                        'City': 'México D.F.',
                        'Region': null,
                        'PostalCode': '05021',
                        'Country': 'Mexico',
                        'Phone': '(5) 555-4729',
                        'Fax': '(5) 555-3745',
                        'ChildCompanies': [
                            {
                                'ID': 'AROUT',
                                'CompanyName': 'Around the Horn',
                                'ContactName': 'Thomas Hardy',
                                'ContactTitle': 'Sales Representative',
                                'Address': '120 Hanover Sq.',
                                'City': 'London',
                                'Region': null,
                                'PostalCode': 'WA1 1DP',
                                'Country': 'UK',
                                'Phone': '(171) 555-7788',
                                'Fax': '(171) 555-6750'
                            },
                            {
                                'ID': 'BERGS',
                                'CompanyName': 'Berglunds snabbköp',
                                'ContactName': 'Christina Berglund',
                                'ContactTitle': 'Order Administrator',
                                'Address': 'Berguvsvägen 8',
                                'City': 'Luleå',
                                'Region': null,
                                'PostalCode': 'S-958 22',
                                'Country': 'Sweden',
                                'Phone': '0921-12 34 65',
                                'Fax': '0921-12 34 67'
                            },
                            {
                                'ID': 'BLAUS',
                                'CompanyName': 'Blauer See Delikatessen',
                                'ContactName': 'Hanna Moos',
                                'ContactTitle': 'Sales Representative',
                                'Address': 'Forsterstr. 57',
                                'City': 'Mannheim',
                                'Region': null,
                                'PostalCode': '68306',
                                'Country': 'Germany',
                                'Phone': '0621-08460',
                                'Fax': '0621-08924'
                            },
                            {
                                'ID': 'BLONP',
                                'CompanyName': 'Blondesddsl père et fils',
                                'ContactName': 'Frédérique Citeaux',
                                'ContactTitle': 'Marketing Manager',
                                'Address': '24, place Kléber',
                                'City': 'Strasbourg',
                                'Region': null,
                                'PostalCode': '67000',
                                'Country': 'France',
                                'Phone': '88.60.15.31',
                                'Fax': '88.60.15.32'
                            },
                            {
                                'ID': 'BOLID',
                                'CompanyName': 'Bólido Comidas preparadas',
                                'ContactName': 'Martín Sommer',
                                'ContactTitle': 'Owner',
                                'Address': 'C/ Araquil, 67',
                                'City': 'Madrid',
                                'Region': null,
                                'PostalCode': '28023',
                                'Country': 'Spain',
                                'Phone': '(91) 555 22 82',
                                'Fax': '(91) 555 91 99'
                            },
                            {
                                'ID': 'BONAP',
                                'CompanyName': 'Bon app',
                                'ContactName': 'Laurence Lebihan',
                                'ContactTitle': 'Owner',
                                'Address': '12, rue des Bouchers',
                                'City': 'Marseille',
                                'Region': null,
                                'PostalCode': '13008',
                                'Country': 'France',
                                'Phone': '91.24.45.40',
                                'Fax': '91.24.45.41'
                            },
                            {
                                'ID': 'BOTTM',
                                'CompanyName': 'Bottom-Dollar Markets',
                                'ContactName': 'Elizabeth Lincoln',
                                'ContactTitle': 'Accounting Manager',
                                'Address': '23 Tsawassen Blvd.',
                                'City': 'Tsawassen',
                                'Region': 'BC',
                                'PostalCode': 'T2F 8M4',
                                'Country': 'Canada',
                                'Phone': '(604) 555-4729',
                                'Fax': '(604) 555-3745'
                            },
                            {
                                'ID': 'BSBEV',
                                'CompanyName': 'Beverages',
                                'ContactName': 'Victoria Ashworth',
                                'ContactTitle': 'Sales Representative',
                                'Address': 'Fauntleroy Circus',
                                'City': 'London',
                                'Region': null,
                                'PostalCode': 'EC2 5NT',
                                'Country': 'UK',
                                'Phone': '(171) 555-1212',
                                'Fax': null
                            },
                        ]
                    },
                    {
                        'ID': 'ANTON',
                        'CompanyName': 'Antonio Moreno Taquería',
                        'ContactName': 'Antonio Moreno',
                        'ContactTitle': 'Owner',
                        'Address': 'Mataderos 2312',
                        'City': 'México D.F.',
                        'Region': null,
                        'PostalCode': '05023',
                        'Country': 'Mexico',
                        'Phone': '(5) 555-3932',
                        'Fax': null,
                        'ChildCompanies': [
                            {
                                'ID': 'CACTU',
                                'CompanyName':
                                    'Cactus Comidas para llevar',
                                'ContactName': 'Patricio Simpson',
                                'ContactTitle': 'Sales Agent',
                                'Address': 'Cerrito 333',
                                'City': 'Buenos Aires',
                                'Region': null,
                                'PostalCode': '1010',
                                'Country': 'Argentina',
                                'Phone': '(1) 135-5555',
                                'Fax': '(1) 135-4892'
                            },
                            {
                                'ID': 'CENTC',
                                'CompanyName': 'Centro comercial Moctezuma',
                                'ContactName': 'Francisco Chang',
                                'ContactTitle': 'Marketing Manager',
                                'Address': 'Sierras de Granada 9993',
                                'City': 'México D.F.',
                                'Region': null,
                                'PostalCode': '05022',
                                'Country': 'Mexico',
                                'Phone': '(5) 555-3392',
                                'Fax': '(5) 555-7293'
                            },
                            {
                                'ID': 'CHOPS',
                                'CompanyName': 'Chop-suey Chinese',
                                'ContactName': 'Yang Wang',
                                'ContactTitle': 'Owner',
                                'Address': 'Hauptstr. 29',
                                'City': 'Bern',
                                'Region': null,
                                'PostalCode': '3012',
                                'Country': 'Switzerland',
                                'Phone': '0452-076545',
                                'Fax': null
                            },
                        ]
                    },
                ]
            },
            {
                'ID': 'COMMI',
                'CompanyName': 'Comércio Mineiro',
                'ContactName': 'Pedro Afonso',
                'ContactTitle': 'Sales Associate',
                'Address': 'Av. dos Lusíadas, 23',
                'City': 'Sao Paulo', 'Region': 'SP',
                'PostalCode': '05432-043',
                'Country': 'Brazil',
                'Phone': '(11) 555-7647',
                'Fax': null,
                'ChildCompanies': [
                    {
                        'ID': 'CONSH',
                        'CompanyName': 'Consolidated Holdings',
                        'ContactName': 'Elizabeth Brown',
                        'ContactTitle': 'Sales Representative',
                        'Address': 'Berkeley Gardens 12 Brewery',
                        'City': 'London',
                        'Region': null,
                        'PostalCode': 'WX1 6LT',
                        'Country': 'UK',
                        'Phone': '(171) 555-2282',
                        'Fax': '(171) 555-9199',
                        'ChildCompanies': [
                            {
                                'ID': 'EASTC',
                                'CompanyName': 'Eastern Connection',
                                'ContactName': 'Ann Devon',
                                'ContactTitle': 'Sales Agent',
                                'Address': '35 King George',
                                'City': 'London',
                                'Region': null,
                                'PostalCode': 'WX3 6FW',
                                'Country': 'UK',
                                'Phone': '(171) 555-0297',
                                'Fax': '(171) 555-3373'
                            },
                            {
                                'ID': 'ERNSH',
                                'CompanyName':
                                    'Ernst Handel',
                                'ContactName': 'Roland Mendel',
                                'ContactTitle': 'Sales Manager',
                                'Address': 'Kirchgasse 6',
                                'City': 'Graz',
                                'Region': null,
                                'PostalCode': '8010',
                                'Country': 'Austria',
                                'Phone': '7675-3425',
                                'Fax': '7675-3426'
                            }
                        ]
                    },
                    {
                        'ID': 'DRACD',
                        'CompanyName': 'Drachenblut Delikatessen',
                        'ContactName': 'Sven Ottlieb',
                        'ContactTitle': 'Order Administrator',
                        'Address': 'Walserweg 21',
                        'City': 'Aachen',
                        'Region': null,
                        'PostalCode': '52066',
                        'Country': 'Germany',
                        'Phone': '0241-039123',
                        'Fax': '0241-059428'
                    },
                    {
                        'ID': 'DUMON',
                        'CompanyName': 'Du monde entier',
                        'ContactName': 'Janine Labrune',
                        'ContactTitle': 'Owner',
                        'Address': '67, rue des Cinquante Otages',
                        'City': 'Nantes',
                        'Region': null,
                        'PostalCode': '44000',
                        'Country': 'France',
                        'Phone': '40.67.88.88',
                        'Fax': '40.67.89.89',
                        'ChildCompanies': [
                            {
                                'ID': 'FAMIA',
                                'CompanyName': 'Familia Arquibaldo',
                                'ContactName': 'Aria Cruz',
                                'ContactTitle': 'Marketing Assistant',
                                'Address': 'Rua Orós, 92',
                                'City': 'Sao Paulo',
                                'Region': 'SP',
                                'PostalCode': '05442-030',
                                'Country': 'Brazil',
                                'Phone': '(11) 555-9857',
                                'Fax': null
                            }
                        ]
                    }
                ]
            },
            {
                'ID': 'FISSA',
                'CompanyName': 'FISSA Fabrica Inter. Salchichas S.A.',
                'ContactName': 'Diego Roel',
                'ContactTitle': 'Accounting Manager',
                'Address': 'C/ Moralzarzal, 86',
                'City': 'Madrid',
                'Region': null,
                'PostalCode': '28034',
                'Country': 'Spain',
                'Phone': '(91) 555 94 44',
                'Fax': '(91) 555 55 93',
                'ChildCompanies': [
                    {
                        'ID': 'FOLIG',
                        'CompanyName': 'Folies gourmandes',
                        'ContactName': 'Martine Rancé',
                        'ContactTitle': 'Assistant Sales Agent',
                        'Address': '184, chaussée de Tournai',
                        'City': 'Lille',
                        'Region': null,
                        'PostalCode': '59000',
                        'Country': 'France',
                        'Phone': '20.16.10.16',
                        'Fax': '20.16.10.17'
                    },
                    {
                        'ID': 'FOLKO',
                        'CompanyName': 'Folk och fä HB',
                        'ContactName': 'Maria Larsson',
                        'ContactTitle': 'Owner',
                        'Address': 'Åkergatan 24',
                        'City': 'Bräcke',
                        'Region': null,
                        'PostalCode': 'S-844 67',
                        'Country': 'Sweden',
                        'Phone': '0695-34 67 21',
                        'Fax': null
                    },
                    {
                        'ID': 'FRANK',
                        'CompanyName': 'Frankenversand',
                        'ContactName': 'Peter Franken',
                        'ContactTitle': 'Marketing Manager',
                        'Address': 'Berliner Platz 43',
                        'City': 'München',
                        'Region': null,
                        'PostalCode': '80805',
                        'Country': 'Germany',
                        'Phone': '089-0877310',
                        'Fax': '089-0877451'
                    },
                    {
                        'ID': 'FRANR',
                        'CompanyName': 'France restauration',
                        'ContactName': 'Carine Schmitt',
                        'ContactTitle': 'Marketing Manager',
                        'Address': '54, rue Royale',
                        'City': 'Nantes',
                        'Region': null,
                        'PostalCode': '44000',
                        'Country': 'France',
                        'Phone': '40.32.21.21',
                        'Fax': '40.32.21.20'
                    }
                ]
            },
            {
                'ID': 'FRANS',
                'CompanyName': 'Franchi S.p.A.',
                'ContactName': 'Paolo Accorti',
                'ContactTitle': 'Sales Representative',
                'Address': 'Via Monte Bianco 34',
                'City': 'Torino', 'Region': null,
                'PostalCode': '10100',
                'Country': 'Italy',
                'Phone': '011-4988260',
                'Fax': '011-4988261'
            }
        ];
    }

    public addRow() {
        this.grid1.addRow({
            'ID': `ADD${this.nextRow++}`,
            'CompanyName': 'Around the Horn',
            'ContactName': 'Thomas Hardy',
            'ContactTitle': 'Sales Representative',
            'Address': '120 Hanover Sq.',
            'City': 'London',
            'Region': null,
            'PostalCode': 'WA1 1DP',
            'Country': 'UK',
            'Phone': '(171) 555-7788',
            'Fax': '(171) 555-6750'
        });
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public addChildRow() {
        const selectedRowId = this.grid1.selectedRows()[0];
        this.grid1.addRow (
            {
                'ID': `ADD${this.nextRow++}`,
                'CompanyName': 'Around the Horn',
                'ContactName': 'Thomas Hardy',
                'ContactTitle': 'Sales Representative',
                'Address': '120 Hanover Sq.',
                'City': 'London',
                'Region': null,
                'PostalCode': 'WA1 1DP',
                'Country': 'UK',
                'Phone': '(171) 555-7788',
                'Fax': '(171) 555-6750'
            },
            selectedRowId);
    }

    public deleteRow() {
        this.grid1.deleteRow(this.grid1.selectedRows()[0]);
    }

    public undo() {
        this.grid1.transactions.undo();
    }

    public redo() {
        this.grid1.transactions.redo();
    }

    public commit() {
        this.grid1.transactions.commit(this.data, this.grid1.primaryKey, this.grid1.childDataKey);
    }

    public exportToExcel() {
        this.excelExporterService.export(this.grid1, new IgxExcelExporterOptions('TreeGrid'));
    }

    public exportToCSV() {
        this.csvExporterService.export(this.grid1, new IgxCsvExporterOptions('TreeGrid', CsvFileTypes.CSV));
    }
}
