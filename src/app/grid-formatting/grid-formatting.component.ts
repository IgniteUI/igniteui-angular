import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { registerLocaleData, DatePipe } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

import { IgxGridComponent, IgxDateSummaryOperand, IgxSummaryResult, IgxColumnComponent, IFilteringExpressionsTree, FilteringStrategy } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';
import { data } from '../grid-cellEditing/data';
import { Observable } from 'rxjs';
import { GridESFLoadOnDemandService } from '../grid-esf-load-on-demand/grid-esf-load-on-demand.service';

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

    private _filteringStrategy = new FilteringStrategy();
    public localData: any[];
    public remoteData: Observable<any[]>;

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
    }

    public getColumnData(column: IgxColumnComponent,
        columnExprTree: IFilteringExpressionsTree,
        done: (colVals: any[]) => void) {
        setTimeout(() => {
            let columnValues = [];
            if (column.field === 'RequiredDate') {
                columnValues = this.gridRemote.data.map(rec => rec[column.field]);
                done(columnValues);
                return;
            }
            if (column.field === 'OrderDate2') {
                columnValues = this.gridLocal.data.map(rec => rec[column.field]);
                done(columnValues);
                return;
            }
            const filteredData = this._filteringStrategy.filter(this.gridRemote.data, columnExprTree);
            columnValues = filteredData.map(record => record[column.field]);
            done(columnValues);
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

