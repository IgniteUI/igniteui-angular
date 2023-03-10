import { Component, ViewChild, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { IgxSuffixDirective } from '../../../projects/igniteui-angular/src/lib/directives/suffix/suffix.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxFilterCellTemplateDirective } from '../../../projects/igniteui-angular/src/lib/grids/columns/templates.directive';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { GridSelectionMode } from '../../../projects/igniteui-angular/src/lib/grids/common/enums';
import { ColumnType } from '../../../projects/igniteui-angular/src/lib/grids/public_api';
import { GridColumnDataType } from '../../../projects/igniteui-angular/src/lib/data-operations/data-util';
import { IgxDateFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand } from '../../../projects/igniteui-angular/src/lib/data-operations/filtering-condition';

@Component({
    providers: [],
    selector: 'app-grid-filter-template-sample',
    styleUrls: ['grid-filter-template.sample.scss'],
    templateUrl: 'grid-filter-template.sample.html',
    standalone: true,
    imports: [IgxGridComponent, NgFor, IgxColumnComponent, IgxFilterCellTemplateDirective, IgxInputGroupComponent, IgxPrefixDirective, IgxIconComponent, IgxInputDirective, NgIf, IgxSuffixDirective]
})

export class GridFilterTemplateSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public selectionMode;

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: 150, resizable: true, sortable: false, filterable: true, groupable: true, summary: true },
            {
                field: 'CompanyName', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'ContactName', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'ContactTitle', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Address', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'City', width: 150, resizable: true, sortable: false, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Region', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'PostalCode', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Phone', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Fax', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Employees', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: false, type: 'number'
            },
            {
                field: 'DateCreated', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: false, type: 'date'
            },
            {
                field: 'Contract', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'boolean'
            }
        ];
        this.data = [
            {
                ID: 'ALFKI',
                CompanyName: 'Alfreds Futterkiste',
                ContactName: 'Maria Anders',
                ContactTitle: 'Sales Representative',
                Address: 'Obere Str. 57',
                City: 'Berlin', Region: undefined,
                PostalCode: '12209',
                Country: 'Germany',
                Phone: '030-0074321',
                Fax: '030-0076545',
                Employees: 68,
                DateCreated: new Date(2018, 8, 17),
                Contract: null
            },
            {
                ID: 'ANATR',
                CompanyName: 'Ana Trujillo Emparedados y helados',
                ContactName: 'Ana Trujillo',
                ContactTitle: 'Owner',
                Address: 'Avda. de la Constitución 2222',
                City: 'México D.F.',
                Region: '',
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

    public onInput(input: any, column: ColumnType) {
        let operand = null;
        let value = input.value;

        if (value === '') {
            this.grid1.clearFilter(column.field);
            return;
        }

        switch (column.dataType) {
            case GridColumnDataType.Number:
                value = Number.parseInt(value, 10);
                operand = IgxNumberFilteringOperand.instance().condition('equals');
                break;
            case GridColumnDataType.Date:
                value = new Date(value);
                operand = IgxDateFilteringOperand.instance().condition('equals');
                break;
            default:
                operand = IgxStringFilteringOperand.instance().condition('contains');
                break;
        }

        this.grid1.filter(column.field, value, operand, column.filteringIgnoreCase);
    }

    public clearInput(input: any, column: any) {
        input.value = null;
        this.grid1.clearFilter(column.field);
    }

    public onKeyDown(event: KeyboardEvent) {
        event.stopImmediatePropagation();
    }

}
