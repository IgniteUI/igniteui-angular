import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { IgxGridComponent, IgxDateSummaryOperand, IgxSummaryResult, IgxColumnComponent,
    IFilteringExpressionsTree, FilteringStrategy } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';
import { data } from '../shared/data';
import { Observable } from 'rxjs';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

const ORDERS_URl = 'https://services.odata.org/V4/Northwind/Northwind.svc/Orders';

@Component({
    selector: 'app-grid-formatting',
    templateUrl: 'grid-formatting.component.html'
})
export class GridFormattingComponent implements OnInit, AfterViewInit {

    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public gridLocal: IgxGridComponent;
    @ViewChild('grid2', { read: IgxGridComponent, static: true })
    public gridRemote: IgxGridComponent;
    @ViewChild('treeGrid', { read: IgxGridComponent, static: true })
    public treeGrid: IgxGridComponent;
    public localData: any[];
    public remoteData: Observable<any[]>;
    public treeData: any[];
    public treeGridColumns: any[];

    public options = {
        timezone: '+0430',
        format: 'longTime',
        digitsInfo: '1.3-4'
    };

    public options2 = {
        timezone: 'UTC',
        format: 'mediumDate',
        digitsInfo: '1.0-2'
    };
    public formatOptions = this.options2;
    public earliest = EarliestSummary;

    constructor(private remoteService: RemoteService) {
        this.localData = data;
    }

    public ngOnInit() {
        this.remoteData = this.remoteService.remoteData;
        this.treeGridColumns = [
            { field: 'ID', width: 150, resizable: true, movable: true, pinned: true },
            { field: 'CompanyName', width: 150, resizable: true, movable: true },
            { field: 'ContactName', width: 150, resizable: true, movable: true },
            { field: 'OrderDate', dataType: 'date', width: 150, groupable: true, movable: true },
            { field: 'ContactTitle', width: 150, resizable: true, movable: true },
            { field: 'Address', width: 150, resizable: true, movable: true },
            { field: 'City', width: 150, resizable: true, movable: true },
            { field: 'Region', width: 150, resizable: true, movable: true },
            { field: 'PostalCode', width: 150, resizable: true, movable: true },
            { field: 'Phone', width: 150, resizable: true, movable: true },
            { field: 'Fax', width: 150, resizable: true, movable: true }
        ];
        this.treeData = HIERARCHICAL_SAMPLE_DATA.slice(0).map((el, index) => {
            const obj = el as any;
            obj.OrderDate = new Date(2020, index, index).toISOString();
            let child = obj;
            while (child.ChildCompanies) {
                child.ChildCompanies.forEach((elem, ind) => {
                    elem.OrderDate = new Date(2020, index + ind, index + ind).toISOString();
                });
                child = child.ChildCompanies;
            }
            return obj;
        });
    }

    public ngAfterViewInit() {
        this.remoteService.getOrdersData(ORDERS_URl);
    }

    public changeFormatOptions() {
        if (this.formatOptions === this.options) {
            this.formatOptions = this.options2;
        } else {
            this.formatOptions = this.options;
        }
    }

    public addFormatter() {
        this.gridLocal.getColumnByName('OrderDate').formatter = this.formatter;
        this.gridRemote.getColumnByName('OrderDate').formatter = this.formatter;
    }

    public formatter(value: any): string {
        const pipe = new DatePipe('fr-FR');
        value = value !== null && value !== undefined && value !== '' ? pipe.transform(value, 'mediumDate') : 'No value!';
        return value;
    }

    public columnValuesStrategy = (column: IgxColumnComponent,
        columnExprTree: IFilteringExpressionsTree,
        done: (uniqueValues: any[]) => void) => {
        // Get specific column data.
        this.getColumnData(column, columnExprTree, uniqueValues => done(uniqueValues));
    };

    public getColumnData(column: IgxColumnComponent,
        columnExprTree: IFilteringExpressionsTree,
        done: (colVals: any[]) => void) {
        setTimeout(() => {
            let columnValues = [];
            const filtered = CustomFilteringStrategy.instance().filter(column.grid.data, columnExprTree, null, column.grid);
            columnValues = filtered.map(record => record[column.field]);
            done(columnValues);
            return;
        }, 1000);
    }
}

class EarliestSummary extends IgxDateSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'earliest') {
                const date = obj.summaryResult ? new Date(obj.summaryResult) : undefined;
                obj.summaryResult = date ? new Intl.DateTimeFormat('en-US').format(date) : undefined;
                return obj;
            }
        });
        return result;
    }
}

class CustomFilteringStrategy extends FilteringStrategy {
    public filter(dataa, expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree: IFilteringExpressionsTree, grid): any[] {
        const res = super.filter(dataa, expressionsTree, advancedExpressionsTree, grid);
        return res;
    }
}
