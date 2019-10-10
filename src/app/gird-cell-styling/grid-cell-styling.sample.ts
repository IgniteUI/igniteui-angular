import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

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

    styles = {
        'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'color': (_, field) => field === 'ID' ? 'yellow' : 'white',
        'text-shadow': '1px 1px 2px rgba(25,25,25,.25)',
        'animation': '0.5s ease-in-out forwards alternate popin'
    };

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
            { field: 'ID' },
            { field: 'CompanyName' },
            { field: 'ContactName' },
            { field: 'ContactTitle' },
            { field: 'Index' },
            { field: 'Address' },
            { field: 'City' },
            { field: 'Region' },
            { field: 'PostalCode' },
            { field: 'Phone', },
            { field: 'Fax' }
        ];

        this.data = SAMPLE_DATA.slice(0);
    }

    applyCSS() {
        // this.columns.forEach(column => column.cellClasses = null);
        this.columns.forEach(column => column.cellStyles = this.styles);
    }

    applyCSSClasses() {
        this.columns.forEach(column => column.cellClasses = this.cellClasses1);
        // this.columns.forEach(column => column.cellStyles = null);
    }
}
