import { Component, OnInit, ViewChild } from '@angular/core';
import {
    IgxGridComponent,
    IgxNumberSummaryOperand,
    IgxSummaryResult,
    IgxColumnComponent,
    IgxButtonDirective
} from 'igniteui-angular';
import { DATA } from './data';

class DiscontinuedSummary {
    public operate(data?: any[], allData = [], fieldName = ''): IgxSummaryResult[] {
        const result = [];
        result.push({
            key: 'products',
            label: 'Products',
            summaryResult: data.length
        });
        result.push({
            key: 'total',
            label: 'Total Items',
            summaryResult: IgxNumberSummaryOperand.sum(data)
        });
        result.push({
            key: 'discontinued',
            label: 'Discontinued Products',
            summaryResult: allData.map(r => r['Discontinued']).filter((rec) =>  rec).length
            });
        result.push({
            key: 'totalDiscontinued',
            label: 'Total Discontinued Items',
            summaryResult: IgxNumberSummaryOperand.sum(allData.filter((rec) =>  rec['Discontinued']).map(r => r[fieldName]))
        });
        return result;
    }
}

@Component({
    selector: 'app-grid-summaries-sample',
    styleUrls: ['./grid-summaries.component.scss'],
    templateUrl: 'grid-summaries.sample.html',
    imports: [IgxGridComponent, IgxColumnComponent, IgxButtonDirective]
})
export class GridSummaryComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    private grid1: IgxGridComponent;

    @ViewChild('grid2', { read: IgxGridComponent, static: true })
    private grid2: IgxGridComponent;

    @ViewChild('grid3', { read: IgxGridComponent, static: true })
    private grid3: IgxGridComponent;

    @ViewChild('grid4', { read: IgxGridComponent, static: true })
    private grid4: IgxGridComponent;

    public discontinuedSummary = DiscontinuedSummary;
    public data;

    constructor() {
        this.data = DATA;
    }

    public changeDefaultSummaries(){
        this.grid2.getColumnByName('UnitsInStock').disabledSummaries = ['count', 'min', 'max', 'average'];
    }

    public changeCustomSummaries(){
        this.grid4.getColumnByName('UnitsInStock').disabledSummaries = ['products', 'discontinued'];
    }
}
