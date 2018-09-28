import { Component, ViewChild } from '@angular/core';
import { data } from './data';

import { IgxGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-row-edit',
    styles: [
        `.grid-row-edit-wrapper {
            flex-flow: row wrap;
            padding: 50px;
    }`
    ],
    templateUrl: 'grid-row-edit-sample.component.html'
})
export class GridRowEditSampleComponent {
    private addProductId: number;
    data: any[];
    @ViewChild('gridRoEdit', { read: IgxGridComponent }) public gridRowEdit: IgxGridComponent;
    @ViewChild('gridRowEditTransaction', { read: IgxGridComponent }) public gridRowEditTransaction: IgxGridComponent;

    constructor() {
        this.data = data;
        this.addProductId = this.data.length + 1;
    }

    public addRow() {
        this.gridRowEditTransaction.addRow({
            ProductID: this.addProductId++,
            ProductName: 'Product with index ' + this.getRandomInt(0, 20),
            SupplierID: this.getRandomInt(1, 20),
            CategoryID: this.getRandomInt(1, 10),
            QuantityPerUnit: (this.getRandomInt(1, 10) * 10).toString() + ' pcs.',
            UnitPrice: this.getRandomInt(10, 1000),
            UnitsInStock: this.getRandomInt(1, 100),
            UnitsOnOrder: this.getRandomInt(1, 20),
            ReorderLevel: this.getRandomInt(10, 20),
            Discontinued: this.getRandomInt(1, 10) % 2 === 0,
            OrderDate: new Date(this.getRandomInt(2000, 2050), this.getRandomInt(0, 11), this.getRandomInt(1, 25))
                .toISOString().slice(0, 10)
        });
    }

    public deleteRow(event, rowID) {
        event.stopPropagation();
        this.gridRowEditTransaction.deleteRow(rowID);
    }

    public undo() {
        this.gridRowEditTransaction.transactions.undo();
        (<any>this.gridRowEditTransaction)._pipeTrigger++;
        (<any>this.gridRowEditTransaction).cdr.markForCheck();
    }

    public redo() {
        this.gridRowEditTransaction.transactions.redo();
        (<any>this.gridRowEditTransaction)._pipeTrigger++;
        (<any>this.gridRowEditTransaction).cdr.markForCheck();
    }

    private getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
