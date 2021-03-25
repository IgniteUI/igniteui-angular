import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { SAMPLE_DATA, HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-cell-styling.sample',
    styleUrls: ['grid-cell-styling.sample.scss'],
    templateUrl: 'grid-cell-styling.sample.html',
})

export class GridCellStylingSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    public data: Array<any>;
    public data2: Array<any>;
    public columns: Array<any>;
    public styles = {
        background: 'linear-gradient(180deg, #dd4c4c 0%, firebrick 100%)',
        color: 'white',
        'text-shadow': '1px 1px 2px rgba(25,25,25,.25)',
        animation: '0.25s ease-in-out forwards alternate popin'
    };

    public cellClasses1 = {
        test1: this.condition1,
        test2: this.condition2,
        test3: this.condition3
    };

    public cellClasses2 = {
        test1: this.condition4,
        test2: this.condition5,
        test3: this.condition6
    };

    public condition(rowData: any): boolean {
        return rowData[this.grid1.primaryKey] === 'BLONP';
    }
    public condition1(rowData: any, columnKey: any): boolean {
        return rowData[columnKey] === 'ALFKI' || rowData[columnKey] === 'ANTON';
    }
    public condition2(rowData: any, columnKey: any): boolean {
        return rowData[columnKey] === 'BERGS' || rowData[columnKey] === 'ANATR';
    }
    public condition3(rowData: any, columnKey: any) {
        return rowData[columnKey] === 'FRANS' || rowData[columnKey] === 'BLONP';
    }
    public condition4(rowData: any, columnKey: any): boolean {
        return rowData[columnKey] > 0 && rowData[columnKey] <= 3;
    }
    public condition5(rowData: any, columnKey: any): boolean {
        return rowData[columnKey] > 3 && rowData[columnKey] <= 6;
    }
    public condition6(rowData: any, columnKey: any): boolean {
        return rowData[columnKey] > 6;
    }

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
        this.data2 = HIERARCHICAL_SAMPLE_DATA.slice(0);
    }

    public indent(event: Event, element: HTMLTextAreaElement) {
        event.preventDefault();
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const value = element.value;
        element.value = `${value.substring(0, start)}  ${value.substring(end)}`;
        element.selectionStart = element.selectionEnd = start + 2;
    }

    public dedent(event: Event, element: HTMLTextAreaElement) {
        event.preventDefault();
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const value = element.value;
        element.value = `${value.substring(0, start)}${value.substring(end)}`;
        element.selectionStart = element.selectionEnd = start - 2;
    }

    public applyCSS() {
        this.columns.forEach(column => column.cellStyles = this.styles);
    }

    public applyCSSClasses() {
        this.columns.forEach(column => column.cellClasses = this.cellClasses1);
    }

    public updateCSS(css: string) {
        this.styles = {...this.styles, ...JSON.parse(css)};
        this.applyCSS();
    }
}
