import { Component } from '@angular/core';
import { IgxGridTransaction, IgxTransactionService } from 'igniteui-angular';

@Component({
    selector: 'app-grid-with-transactions',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
})
export class GridWithTransactionsComponent { }
