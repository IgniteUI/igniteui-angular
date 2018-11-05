import { Component } from '@angular/core';
import { IgxGridTransaction, IgxHierarchicalTransactionService } from 'igniteui-angular';

@Component({
    selector: 'app-grid-with-hierarchical-transactions',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxGridTransaction, useClass: IgxHierarchicalTransactionService }]
})
export class HierarchicalTransactionWrapperComponent { }
