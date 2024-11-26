import { Component, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { data, dataWithoutPK } from '../shared/data';
import { IColumnPipeArgs, IgxButtonDirective, IgxCardComponent, IgxCardContentDirective, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCellTemplateDirective, IgxColumnComponent, IgxGridComponent, IgxInputDirective, IgxInputGroupComponent, IgxLabelDirective, IgxPaginatorComponent, IgxSelectComponent, IgxSelectItemComponent, IgxStringFilteringOperand } from 'igniteui-angular';

 @Component({
    providers: [],
    selector: 'app-grid-percantge-widths.sample',
    templateUrl: 'grid-percantge-widths.sample.html',
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective, IgxPaginatorComponent, IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective, IgxInputGroupComponent, IgxLabelDirective, FormsModule, IgxInputDirective, IgxSelectComponent, NgFor, IgxSelectItemComponent, IgxButtonDirective, NgIf, CurrencyPipe, DatePipe]
})
 export class GridColumnPercentageWidthsSampleComponent implements OnInit {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;
    public data: Array<any>;
    public data1: Array<any>;
    public leadingDigits = 1;
    public trailingDigitsMin = 0;
    public trailingDigitsMax = 2;
    public currencyCode = '';
    public pipeArgs: IColumnPipeArgs = {
        digitsInfo: `${this.leadingDigits}.${this.trailingDigitsMin}-${this.trailingDigitsMax}`,
        currencyCode: this.currencyCode,
        display: 'symbol'
    };
    public currencies = ['', 'USD', 'EUR', 'JPY', 'GBP'];
    public locales = ['en', 'fr-FR', 'ja', 'bg'];
    public locale = 'en';

    public ngOnInit(): void {
        this.data1 = data;
        this.data = dataWithoutPK;
    }

    public changePipeArgs() {
        this.pipeArgs = {
            digitsInfo: `${this.leadingDigits}.${this.trailingDigitsMin}-${this.trailingDigitsMax}`,
            currencyCode: this.currencyCode,
            display: 'symbol'
        };
    }

    public formatDate(val: Date) {
        return new Intl.DateTimeFormat('en-US').format(val);
    }

    public formatCurrency(val: string) {
        return parseInt(val, 10).toFixed(2);
    }

    public filter(term) {
        this.grid1.filter('ProductName', term, IgxStringFilteringOperand.instance().condition('contains'));
    }
}
