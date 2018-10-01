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
    @ViewChild('grid', { read: IgxGridComponent }) public grid: IgxGridComponent;
    @ViewChild('gridTransaction', { read: IgxGridComponent }) public gridTransaction: IgxGridComponent;

    constructor() {
        this.data = data;
        this.addProductId = this.data.length + 1;
    }

    public addRow(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.addRow({
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

    public deleteRow(event, gridID, rowID) {
        event.stopPropagation();
        switch (gridID) {
            case 'igx-grid-0':
            case 'igx-grid-2':
                this.data.splice(rowID - 1, 1);
                break;
            case 'igx-grid-1':
                this.gridRowEditTransaction.deleteRow(rowID);
                break;
            case 'igx-grid-3':
                this.gridTransaction.deleteRow(rowID);
                break;
        }
    }

    public undo(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.transactions.undo();
        (<any>currentGrid)._pipeTrigger++;
        (<any>currentGrid).cdr.markForCheck();
    }

    public redo(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.transactions.redo();
        (<any>currentGrid)._pipeTrigger++;
        (<any>currentGrid).cdr.markForCheck();
    }

    private getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getGridById(gridID): IgxGridComponent {
        switch (gridID) {
            case 'igx-grid-1':
                return this.gridRowEditTransaction;
            case 'igx-grid-3':
                return this.gridTransaction;
        }

        return null;
    }
}
