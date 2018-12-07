import { Component } from '@angular/core';
import { IgxGridTransaction, IgxHierarchicalTransactionService } from 'igniteui-angular';

@Component({
    selector: 'app-tree-grid-with-transactions',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxGridTransaction, useClass: IgxHierarchicalTransactionService }]
})
export class TreeGridWithTransactionsComponent { }
