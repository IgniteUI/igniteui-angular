import { Component, ViewChild } from '@angular/core';
import { data, dataWithoutPK } from './data';

import {
    IgxGridComponent, IgxButtonGroupComponent
} from 'igniteui-angular';
@Component({
    selector: 'app-grid-cellediting',
    templateUrl: 'grid-cellEditing.component.html'
})
export class GridCellEditingComponent {

    orderDateHidden = false;
    @ViewChild('grid1', { read: IgxGridComponent })
    public gridWithPK: IgxGridComponent;
    @ViewChild('grid', { read: IgxGridComponent })
    public gridWithoutPK: IgxGridComponent;
    @ViewChild(IgxButtonGroupComponent) public buttonGroup: IgxButtonGroupComponent;
    data: any;
    dataWithoutPK: any;
    public density = 'compact';
    public displayDensities;
    private subscribtion;

    constructor() {
        const date = new Date();
        this.data = data;
        this.dataWithoutPK = dataWithoutPK;
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];
    }

    public addRow() {
        this.gridWithPK.addRow({
            ProductID: 21,
            ProductName: 'Sir Rodneys Marmalade',
            SupplierID: 8,
            CategoryID: 3,
            QuantityPerUnit: undefined,
            UnitPrice: undefined,
            UnitsInStock: 999,
            UnitsOnOrder: 0,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date('1905-03-17')
        });
    }

    enDisSummaries() {
        if (this.gridWithPK.getColumnByName('ReorderLevel').hasSummary) {
            this.gridWithPK.disableSummaries([{ fieldName: 'ReorderLevel' }]);
        } else {
            this.gridWithPK.enableSummaries([{ fieldName: 'ReorderLevel' }]);
        }
    }

    public deleteRow(event, rowID) {
        event.stopPropagation();
        const row = this.gridWithPK.getRowByKey(rowID);
        this.gridWithPK.deleteRow(rowID);
    }
    public updateCell() {
        this.gridWithPK.updateCell('Updated', 1, 'ProductName');
    }

    public updateRow(rowID) {
        this.gridWithPK.updateRow({
            ProductID: rowID + 96,
            ProductName: 'UpdatedRow',
            SupplierID: 8,
            CategoryID: 3,
            QuantityPerUnit: undefined,
            UnitPrice: undefined,
            UnitsInStock: -99 + rowID,
            UnitsOnOrder: 0 + rowID,
            ReorderLevel: -12 + rowID,
            Discontinued: false,
            OrderDate: new Date('2005-03-17')
        }, rowID);
    }
    pin() {
        for (const name of ['UnitsInStock', 'Discontinued']) {
            if (this.gridWithPK.getColumnByName(name).pinned) {
                this.gridWithPK.unpinColumn(name);
            } else {
                this.gridWithPK.pinColumn(name);
            }
        }
    }

    hideColumn() {
        this.orderDateHidden = !this.orderDateHidden;
    }

    public updRecord() {
        const newData = 'UPDATED';
        const selectedCell = this.gridWithPK.selectedCells[0];
        if (selectedCell) {
            selectedCell.update(newData);
        }
    }

    deleteRowbyIndex(index) {
        const row = this.gridWithoutPK.getRowByIndex(index);
        row.delete();
    }
    updateRowbyIndex(index) {
        const row = this.gridWithoutPK.getRowByIndex(index);
        row.update({
            ProductID: index + 53,
            ProductName: 'UpdatedRow',
            SupplierID: 8,
            CategoryID: 3,
            QuantityPerUnit: undefined,
            UnitPrice: undefined,
            UnitsInStock: -99 + index,
            UnitsOnOrder: 0 + index,
            ReorderLevel: -12 + index,
            Discontinued: false,
            OrderDate: new Date('2005-03-17')
        });
    }
    moveColumns() {
        const column = this.gridWithoutPK.getColumnByName('ProductName');
        const secColumn = this.gridWithoutPK.getColumnByName('OrderDate');
        this.gridWithoutPK.moveColumn(column, secColumn);
    }
    updateSelectedCell() {
        let newValue;
        const selectedCell = this.gridWithoutPK.selectedCells[0];
        console.log(selectedCell.column.dataType);
        switch (selectedCell.column.dataType) {
            case 'string': newValue = 'UpdatedCell'; break;
            case 'number': newValue = 0; break;
            case 'boolean': newValue = false; break;
            case 'date': newValue = new Date('2027-07-31'); break;
        }
        selectedCell.update(newValue);
    }

    updateSpecificRow() {
        this.gridWithPK.updateRow({
            ProductID: 225 + 96,
            ProductName: 'UpdatedRow',
            SupplierID: 8,
            CategoryID: 3,
            QuantityPerUnit: undefined,
            UnitPrice: undefined,
            UnitsInStock: -99 + 225,
            UnitsOnOrder: 0 + 225,
            ReorderLevel: -12 + 225,
            Discontinued: false,
            OrderDate: new Date('2005-03-17')
        }, 1);
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    changeFocus(event) {
        console.log(event);
        const cell = event.cell;
        const target = event.event.target.tagName.toLowerCase() === 'igx-grid-cell';
        if (cell && cell.inEditMode && target) {
            let focusTarget;
            if (cell.column.dataType === 'date') {
                event.cancel = true;
                focusTarget  = cell.nativeElement.querySelector('input');
            } else if (cell.column.dataType === 'boolean') {
                event.cancel = true;
                focusTarget  = cell.nativeElement.querySelector('.igx-checkbox__input');
            }
            console.log(cell.nativeElement, focusTarget);
            if (focusTarget) { focusTarget.focus(); }
            console.log(document.activeElement);
        }
    }
}
