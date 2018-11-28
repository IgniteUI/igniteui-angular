import { Component, ViewChild } from '@angular/core';
import { data } from './data';

import { IgxGridComponent, Transaction, IgxToggleDirective } from 'igniteui-angular';

@Component({
    selector: 'app-grid-row-edit',
    styleUrls: [`grid-row-edit-sample.component.css`],
    templateUrl: 'grid-row-edit-sample.component.html'
})
export class GridRowEditSampleComponent {
    public console = window.console;
    private addProductId: number;
    private pinFlag = false;
    private hideFlag = false;
    private summaryFlag = true;
    private customTemplate = false;
    private update_value;
    private update_row;
    private update_column;
    private cssRed = `color: #aa2222;`;
    private cssGreen = `color: #22aa22;`;
    private cssBlue = `color: #2222aa;`;
    private cssBig = `font-size: 16px; font-weight: 800;`;
    public events = {
        cell: {
            done: true,
            enter: true,
            cancel: true
        },
        row: {
            done: true,
            enter: true,
            cancel: true
        }
    };
    public cancel = {
        cell: {
            done: false,
            enter: false,
            cancel: false
        },
        row: {
            done: false,
            enter: false,
            cancel: false
        }
    };
    public currentActiveGrid: {
        id: string,
        transactions: any[]
    } = {
            id: '',
            transactions: []
        };
    data: any[];
    performanceData: any[] = [];
    columns;
    @ViewChild('gridRowEdit', { read: IgxGridComponent }) public gridRowEdit: IgxGridComponent;
    @ViewChild('gridRowEditTransaction', { read: IgxGridComponent }) public gridRowEditTransaction: IgxGridComponent;
    @ViewChild('grid', { read: IgxGridComponent }) public grid: IgxGridComponent;
    @ViewChild('gridTransaction', { read: IgxGridComponent }) public gridTransaction: IgxGridComponent;
    @ViewChild('gridPerformance', { read: IgxGridComponent }) public gridPerformance: IgxGridComponent;
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;

    constructor() {
        const enhancedData = data.map((e, i) => Object.assign(e, {
            UnitPrice2: this.getRandomInt(10, 1000),
            UnitsInStock2: this.getRandomInt(1, 100),
            UnitsOnOrder2: this.getRandomInt(1, 20),
            ReorderLevel2: this.getRandomInt(10, 20),
            Discontinued2: this.getRandomInt(1, 10) % 2 === 0
        }));
        const doubleData = [...enhancedData].map(e => Object.assign({}, e, { ProductID: e.ProductID + 1000 }));
        console.log(enhancedData, doubleData);
        this.data = [...enhancedData, ...doubleData];
        this.addProductId = this.data.length + 1;
        this.generatePerformanceData(10000, 100);
    }

    public addRow(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.addRow(this.generateRow());
    }

    public deleteRow(event, gridID, rowID) {
        event.stopPropagation();
        this.getGridById(gridID).deleteRow(rowID);
        this.refreshAll();
    }

    public undo(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.transactions.undo();
    }

    public redo(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.transactions.redo();
    }

    public openCommitDialog(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        this.currentActiveGrid = {
            id: gridID,
            transactions: (<Transaction[]>currentGrid.transactions.getTransactionLog()).map(e => {
                return `ID: ${e.id}, newValue: ${JSON.stringify(e.newValue)}, type: ${e.type}`;
            })
        };
        this.toggle.open();
    }

    public commit(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.transactions.commit(this.data);
        this.toggle.close();
    }

    public discard(gridID) {
        const currentGrid: IgxGridComponent = this.getGridById(gridID);
        currentGrid.transactions.clear();
        this.toggle.close();
    }

    private getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getGridById(gridID): IgxGridComponent {
        switch (gridID) {
            case 'grid':
                return this.grid;
            case 'gridRowEdit':
                return this.gridRowEdit;
            case 'gridTransaction':
                return this.gridTransaction;
            case 'gridRowEditTransaction':
                return this.gridRowEditTransaction;
        }

        return null;
    }

    rowEditEnter(evt) {
        if (this.events.row.enter) {
            console.log('%cRow' + '%c Edit ENTER', this.cssBig, this.cssBlue);
            console.log(evt);
        }
        evt.cancel = this.cancel.row.enter;
    }
    rowEditDone(evt) {
        if (this.events.row.done) {
            console.log('%cRow' + '%c Edit DONE', this.cssBig, this.cssGreen);
            console.log(evt);
        }
        evt.cancel = this.cancel.row.done;
    }

    rowEditCancel(evt) {
        if (this.events.row.cancel) {
            console.log('%cRow' + '%c Edit CANCEL', this.cssBig, this.cssRed);
            console.log(evt);
        }
        evt.cancel = this.cancel.row.cancel;
    }

    cellEnterEditMode(evt) {
        if (this.events.cell.enter) {
            console.log('%cCell' + '%c Edit ENTER', this.cssBig, this.cssBlue);
            console.log(evt);
        }
        evt.cancel = this.cancel.cell.enter;
    }
    cellEditDone(evt) {
        if (this.events.cell.done) {
            console.log('%cCell' + '%c Edit DONE', this.cssBig, this.cssGreen);
            console.log(evt);
        }
        evt.cancel = this.cancel.cell.done;
    }

    cellEditCancel(evt) {
        if (this.events.cell.cancel) {
            console.log('%cCell' + '%c Edit CANCEL', this.cssBig, this.cssRed);
            console.log(evt);
        }
        evt.cancel = this.cancel.cell.cancel;
    }

    private generatePerformanceData(rowsCount: number = 100000, colsCount: number = 300) {
        const cols = [];
        cols.push({
            field: 'ID',
            width: 90
        });
        for (let col = 0; col < colsCount - 1; col++) {
            cols.push({
                field: (col + 1).toString(),
                width: (Math.random() * 80) + 90
            });
        }

        this.columns = cols;

        const rowData = {};
        for (let col = 0; col < cols.length; col++) {
            const colData = cols[col].field;
            rowData[colData] = col;
        }

        for (let row = 0; row < rowsCount; row++) {
            const newObj = Object.assign({}, rowData);
            newObj['ID'] = row + 1;
            this.performanceData.push(newObj);
        }
    }

    updateCell(value: any, row: any, column: string): void {
        row = parseInt(row, 10); // primaryKey is type number
        this.gridRowEditTransaction.updateCell(value, row, column);
    }

    update(grid: IgxGridComponent) {
        const editRowValue = this.generateRow();
        editRowValue.ProductID = 3;
        this.getGridById(grid).updateRow(editRowValue, 3);
    }

    refreshAll() {
        this.gridRowEditTransaction.markForCheck();
    }

    private generateRow() {
        return {
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
                .toISOString().slice(0, 10),
            UnitPrice2: this.getRandomInt(10, 1000),
            UnitsInStock2: this.getRandomInt(1, 100),
            UnitsOnOrder2: this.getRandomInt(1, 20),
            ReorderLevel2: this.getRandomInt(10, 20),
            Discontinued2: this.getRandomInt(1, 10) % 2 === 0,
            OrderDate2: new Date(this.getRandomInt(2000, 2050), this.getRandomInt(0, 11), this.getRandomInt(1, 25))
                .toISOString().slice(0, 10)
        };
    }
}

