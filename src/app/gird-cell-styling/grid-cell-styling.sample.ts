import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent, IgxGridRowComponent, IgxColumnComponent } from 'igniteui-angular';

@Component({
    providers: [],
    selector: 'app-grid-cell-styling.sample',
    styleUrls: ['grid-cell-styling.sample.scss'],
    templateUrl: 'grid-cell-styling.sample.html',
})

export class GridCellStylingSampleComponent implements OnInit {

    public data: Array<any>;
    public columns: Array<any>;

    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    condition = (rowData: any): boolean => {
        return rowData[this.grid1.primaryKey] === 'BLONP';
    }

    condition1 = (rowData: any, columnKey: any): boolean => {
        return rowData[columnKey] === 'ALFKI' || rowData[columnKey] === 'ANTON';
    }
    condition2 = (rowData: any, columnKey: any): boolean => {
        return rowData[columnKey] === 'BERGS' || rowData[columnKey] === 'ANATR';
    }
    condition3 = (rowData: any, columnKey: any) => {
        return rowData[columnKey] === 'FRANS' || rowData[columnKey] === 'BLONP';
    }

    condition4 = (rowData: any, columnKey: any): boolean => {
        return rowData[columnKey] > 0 && rowData[columnKey] <= 3;
    }
    condition5 = (rowData: any, columnKey: any): boolean => {
        return rowData[columnKey] > 3 && rowData[columnKey] <= 6;
    }
    condition6 = (rowData: any, columnKey: any): boolean => {
        return rowData[columnKey] > 6;
    }


    cellClasses1 = {
        'test1': this.condition1,
        'test2': this.condition2,
        'test3': this.condition3
    };

    cellClasses2 = {
        'test1': this.condition4,
        'test2': this.condition5,
        'test3': this.condition6
    };

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: 100, cellClasses: this.cellClasses1 },
            { field: 'CompanyName', width: 200, cellClasses: {'test3' : this.condition} },
            { field: 'ContactName', width: 150, cellClasses: {'test3' : this.condition} },
            { field: 'ContactTitle', width: 150, cellClasses: {'test3' : this.condition} },
            { field: 'Index', width: 150, cellClasses: this.cellClasses2 },
            { field: 'Address', width: 150, cellClasses: {'test3' : this.condition} },
            { field: 'City', width: 150, cellClasses: {'test3' : this.condition} },
            { field: 'Region', width: 150, cellClasses: {'test3' : this.condition} },
            { field: 'PostalCode', width: 150, cellClasses: {'test3' : this.condition} },
            { field: 'Phone', width: 150,  cellClasses: {'test3' : this.condition} },
            { field: 'Fax', width: 150, cellClasses: {'test3' : true } }
        ];
        this.data = [
            {
                'ID': 'ALFKI',
                'CompanyName': 'Alfreds Futterkiste',
                'ContactName': 'Maria Anders',
                'ContactTitle': 'Sales Representative',
                'Index': 1,
                'Address': 'Obere Str. 57',
                'City': 'Berlin', 'Region': null,
                'PostalCode': '12209',
                'Country': 'Germany',
                'Phone': '030-0074321',
                'Fax': '030-0076545'
            },
            {
                'ID': 'ANATR',
                'CompanyName': 'Ana Trujillo Emparedados y helados',
                'ContactName': 'Ana Trujillo',
                'ContactTitle': 'Owner',
                'Index': 2,
                'Address': 'Avda. de la Constitución 2222',
                'City': 'México D.F.',
                'Region': null,
                'PostalCode': '05021',
                'Country': 'Mexico',
                'Phone': '(5) 555-4729',
                'Fax': '(5) 555-3745'
            },
            {
                'ID': 'ANTON',
                'CompanyName': 'Antonio Moreno Taquería',
                'ContactName': 'Antonio Moreno',
                'ContactTitle': 'Owner',
                'Index': 3,
                'Address': 'Mataderos 2312',
                'City': 'México D.F.',
                'Region': null,
                'PostalCode': '05023',
                'Country': 'Mexico',
                'Phone': '(5) 555-3932',
                'Fax': null
            },
            {
                'ID': 'AROUT',
                'CompanyName': 'Around the Horn',
                'ContactName': 'Thomas Hardy',
                'ContactTitle': 'Sales Representative',
                'Index': 4,
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
                'Index': 5,
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
                'Index': 6,
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
                'Index': 7,
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
                'Index': 8,
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
                'Index': 9,
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
                'Index': 10,
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
                'Index': 11,
                'Address': 'Fauntleroy Circus',
                'City': 'London',
                'Region': null,
                'PostalCode': 'EC2 5NT',
                'Country': 'UK',
                'Phone': '(171) 555-1212',
                'Fax': null
            },
            {
                'ID': 'CACTU',
                'CompanyName':
                'Cactus Comidas para llevar',
                'ContactName': 'Patricio Simpson',
                'ContactTitle': 'Sales Agent',
                'Index': 12,
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
                'Index': 13,
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
                'Index': 14,
                'Address': 'Hauptstr. 29',
                'City': 'Bern',
                'Region': null,
                'PostalCode': '3012',
                'Country': 'Switzerland',
                'Phone': '0452-076545',
                'Fax': null
            },
            {
                'ID': 'COMMI',
                'CompanyName': 'Comércio Mineiro',
                'ContactName': 'Pedro Afonso',
                'ContactTitle': 'Sales Associate',
                'Index': 15,
                'Address': 'Av. dos Lusíadas, 23',
                'City': 'Sao Paulo', 'Region': 'SP',
                'PostalCode': '05432-043',
                'Country': 'Brazil',
                'Phone': '(11) 555-7647',
                'Fax': null
            },
            {
                'ID': 'CONSH',
                'CompanyName': 'Consolidated Holdings',
                'ContactName': 'Elizabeth Brown',
                'ContactTitle': 'Sales Representative',
                'Index': 16,
                'Address': 'Berkeley Gardens 12 Brewery',
                'City': 'London',
                'Region': null,
                'PostalCode': 'WX1 6LT',
                'Country': 'UK',
                'Phone': '(171) 555-2282',
                'Fax': '(171) 555-9199'
            },
            {
                'ID': 'DRACD',
                'CompanyName': 'Drachenblut Delikatessen',
                'ContactName': 'Sven Ottlieb',
                'ContactTitle': 'Order Administrator',
                'Index': 17,
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
                'Index': 18,
                'Address': '67, rue des Cinquante Otages',
                'City': 'Nantes',
                'Region': null,
                'PostalCode': '44000',
                'Country': 'France',
                'Phone': '40.67.88.88',
                'Fax': '40.67.89.89'
            },
            {
                'ID': 'EASTC',
                'CompanyName': 'Eastern Connection',
                'ContactName': 'Ann Devon',
                'ContactTitle': 'Sales Agent',
                'Index': 19,
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
                'Index': 20,
                'Address': 'Kirchgasse 6',
                'City': 'Graz',
                'Region': null,
                'PostalCode': '8010',
                'Country': 'Austria',
                'Phone': '7675-3425',
                'Fax': '7675-3426'
            },
            {
                'ID': 'FAMIA',
                'CompanyName': 'Familia Arquibaldo',
                'ContactName': 'Aria Cruz',
                'ContactTitle': 'Marketing Assistant',
                'Index': 21,
                'Address': 'Rua Orós, 92',
                'City': 'Sao Paulo',
                'Region': 'SP',
                'PostalCode': '05442-030',
                'Country': 'Brazil',
                'Phone': '(11) 555-9857',
                'Fax': null
            },
            {
                'ID': 'FISSA',
                'CompanyName': 'FISSA Fabrica Inter. Salchichas S.A.',
                'ContactName': 'Diego Roel',
                'ContactTitle': 'Accounting Manager',
                'Index': 22,
                'Address': 'C/ Moralzarzal, 86',
                'City': 'Madrid',
                'Region': null,
                'PostalCode': '28034',
                'Country': 'Spain',
                'Phone': '(91) 555 94 44',
                'Fax': '(91) 555 55 93'
            },
            {
                'ID': 'FOLIG',
                'CompanyName': 'Folies gourmandes',
                'ContactName': 'Martine Rancé',
                'ContactTitle': 'Assistant Sales Agent',
                'Index': 23,
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
                'Index': 24,
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
                'Index': 25,
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
                'Index': 26,
                'Address': '54, rue Royale',
                'City': 'Nantes',
                'Region': null,
                'PostalCode': '44000',
                'Country': 'France',
                'Phone': '40.32.21.21',
                'Fax': '40.32.21.20'
            },
            {
                'ID': 'FRANS',
                'CompanyName': 'Franchi S.p.A.',
                'ContactName': 'Paolo Accorti',
                'ContactTitle': 'Sales Representative',
                'Index': 27,
                'Address': 'Via Monte Bianco 34',
                'City': 'Torino', 'Region': null,
                'PostalCode': '10100',
                'Country': 'Italy',
                'Phone': '011-4988260',
                'Fax': '011-4988261'
            }
        ];
    }

    toggleColumn(name: string) {
        const col = this.grid1.getColumnByName(name);
        col.pinned ? col.pinned = false : col.pinned = true;
    }
}
