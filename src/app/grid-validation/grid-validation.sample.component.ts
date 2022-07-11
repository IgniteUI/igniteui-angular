import { Component, ViewChild } from '@angular/core';
import { data } from '../shared/data';

import { IgxGridComponent, IgxTransactionService } from 'igniteui-angular';
import { FormGroup } from '@angular/forms';

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
        const invalidTransactions = this.gridWithTransaction.transactions.getTransactionLog().filter(x => x.validity.some(x => x.valid === false));
        if (invalidTransactions.length > 0) {
           if (confirm('There are invalid values about to be submitted. Do you want to continue')) {
            this.gridWithTransaction.transactions.commit(this.transactionData);
           }
        } else {
            this.gridWithTransaction.transactions.commit(this.transactionData);
        }
    }

    public cellEdit(evt) {
        // can cancel if there are validation errors
        if (!evt.isValid && !this.rowEditNoTransactions) {
            evt.cancel = true;
        }
    }

    public formCreateHandler(formGr: FormGroup) {
        // can add validators here 
        //    const prodName = formGr.get('ProductName');
        //    prodName.addValidators(forbiddenNameValidator(/bob/i));
    }
}

