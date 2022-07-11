import { Component, ViewChild } from '@angular/core';
import { data } from '../shared/data';

import { IgxGridComponent, IgxTransactionService } from 'igniteui-angular';

@Component({
    selector: 'app-grid-row-edit',
    styleUrls: [`grid-validation.sample.component.css`],
    templateUrl: 'grid-validation.sample.component.html',
})
export class GridValidationSampleComponent {
    public rowEditWithTransactions = true;
    public rowEditNoTransactions = true;
    public transactionData = JSON.parse(JSON.stringify(data));
    public data = data;
    public columns = [
        { field: 'ProductID' },
        { field: 'ProductName' },
        { field: 'UnitPrice' },
        { field: 'UnitsInStock' }
    ];

    @ViewChild('gridTransactions', {read:  IgxGridComponent })
    public gridWithTransaction: IgxGridComponent;

    public commit() {
        this.gridWithTransaction.transactions.commit(this.transactionData);
    }
}

