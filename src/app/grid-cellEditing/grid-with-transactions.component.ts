import { Component } from '@angular/core';
import { IgxGridTransaction, IgxTransactionBaseService } from 'igniteui-angular';


@Component({
    selector: 'app-grid-with-transaction',
    templateUrl: 'grid-with-transactions.component.html',
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionBaseService }]
})
export class GridWithTransactionsComponent {

}
