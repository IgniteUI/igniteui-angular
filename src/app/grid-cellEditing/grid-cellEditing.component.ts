import { Component, ViewChild } from '@angular/core';
import { data, dataWithoutPK } from '../shared/data';

import {
    IgxGridComponent, GridSelectionMode, IgxDateSummaryOperand, IgxSummaryResult
} from 'igniteui-angular';
@Component({
    selector: 'app-grid-cellediting',
    templateUrl: 'grid-cellEditing.component.html'
})
export class GridCellEditingComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    private gridWithPK: IgxGridComponent;
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    private gridWithoutPK: IgxGridComponent;

    public orderDateHidden = false;
    public data: any;
    public dataWithoutPK: any;
    public density = 'compact';
    public displayDensities;
    public options = {
        timezone: '+0430',
        format: 'longTime',
        digitsInfo: '1.3-4'
    };
    public options2 = {
        timezone: 'UTC',
        format: 'mediumDate',
        digitsInfo: '1.0-2'
    };
    public formatOptions = this.options;

    public kk = false;
    public pname = 'ProductName';
    public selectionMode;
    public earliest = EarliestSummary;

    constructor() {
        this.data = data;
        this.dataWithoutPK = dataWithoutPK;
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];
        this.selectionMode = GridSelectionMode.multiple;
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

    public changeFormatOptions() {
        if (this.formatOptions === this.options) {
            this.formatOptions = this.options2;
        } else {
            this.formatOptions = this.options;
        }
    }

    public enDisSummaries() {
        if (this.gridWithPK.getColumnByName('ReorderLevel').hasSummary) {
            this.gridWithPK.disableSummaries([{ fieldName: 'ReorderLevel' }]);
        } else {
            this.gridWithPK.enableSummaries([{ fieldName: 'ReorderLevel' }]);
        }
    }

    public deleteRow(event, rowID) {
        event.stopPropagation();
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
    public pin() {
        for (const name of ['UnitsInStock', 'Discontinued']) {
            if (this.gridWithPK.getColumnByName(name).pinned) {
                this.gridWithPK.unpinColumn(name);
            } else {
                this.gridWithPK.pinColumn(name);
            }
        }
    }

    public hideColumn() {
        this.orderDateHidden = !this.orderDateHidden;
    }

    public updRecord() {
        const newData = 'UPDATED';
        const selectedCell = this.gridWithPK.selectedCells[0];
        if (selectedCell) {
            selectedCell.update(newData);
        }
    }

    public deleteRowbyIndex(index) {
        const row = this.gridWithoutPK.getRowByIndex(index);
        row.delete();
    }
    public updateRowbyIndex(index) {
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
    public moveColumns() {
        const column = this.gridWithoutPK.getColumnByName('ProductName');
        const secColumn = this.gridWithoutPK.getColumnByName('OrderDate');
        this.gridWithoutPK.moveColumn(column, secColumn);
    }
    public updateSelectedCell() {
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

    public updateSpecificRow() {
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

    public customKeydown(args) {
        const target = args.target;
        const type = args.targetType;
        if (type === 'dataCell'  && target.editMode && args.event.key.toLowerCase() === 'tab') {
            args.event.preventDefault();
            if (target.column.dataType === 'number' && target.editValue < 10) {
                args.cancel = true;
                alert('The value should be bigger than 10');
                return;
            }
            const cell = args.event.shiftKey ?
                this.gridWithPK.getPreviousCell(target.rowIndex, target.visibleColumnIndex, (col) => col.editable) :
                this.gridWithPK.getNextCell(target.rowIndex, target.visibleColumnIndex, (col) => col.editable);
            this.gridWithPK.navigateTo(cell.rowIndex, cell.visibleColumnIndex, (obj) => obj.target.nativeElement.focus());
        } else if (type === 'dataCell'  && args.event.key.toLowerCase() === 'enter') {
            args.cancel = true;
            this.gridWithPK.navigateTo(target.rowIndex + 1, target.visibleColumnIndex, (obj) => obj.target.nativeElement.focus());
        }
    }
}

class EarliestSummary extends IgxDateSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'earliest') {
                const date = obj.summaryResult ? new Date(obj.summaryResult) : undefined;
                obj.summaryResult = date ? new Intl.DateTimeFormat('en-US').format(date) : undefined;
                return obj;
            }
        });
        return result;
    }
}

