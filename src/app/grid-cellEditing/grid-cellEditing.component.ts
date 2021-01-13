import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { data, dataWithoutPK } from './data';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

import {
    IgxGridComponent, IgxButtonGroupComponent, GridSelectionMode, IgxDateSummaryOperand, IgxSummaryResult
} from 'igniteui-angular';
import { fromEvent } from 'rxjs';
@Component({
    selector: 'app-grid-cellediting',
    templateUrl: 'grid-cellEditing.component.html'
})
export class GridCellEditingComponent implements AfterViewInit {

    orderDateHidden = false;
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public gridWithPK: IgxGridComponent;
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public gridWithoutPK: IgxGridComponent;
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;
    data: any;
    dataWithoutPK: any;
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

    kk = false;
    pname = 'ProductName';
    private subscribtion;
    public selectionMode;
    public earliest = EarliestSummary;

    private node;
    constructor() {
        const date = new Date();
        this.data = data;
        this.dataWithoutPK = dataWithoutPK;
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];
        this.selectionMode = GridSelectionMode.multiple;
    }

    private subscription;
    private colIdx = 0;
    public ngAfterViewInit() {
        this.node = this.gridWithPK.navigation.activeNode;
        this.subscription = fromEvent(
          this.gridWithPK.tbody.nativeElement,
          'keydown'
        ).subscribe((args: KeyboardEvent) => {
          if (args.key.toLowerCase() === 'tab') {
            if (this.gridWithPK.navigation.activeNode.row !== this.node.row) {
                this.colIdx = 0;
            }

            this.node = this.gridWithPK.navigation.activeNode;
            const columns = this.gridWithPK.columnList.filter(c => !c.columnGroup && c.visibleIndex >= 0);
            const nextCol = args.shiftKey ?
                // columns.reverse().find(c => c.index < this.colIdx).visibleIndex :
                columns.reverse().find(c => c.index < this.colIdx).visibleIndex :
                columns.find(c => c.index > this.colIdx).visibleIndex;
            // const nextCol = columns.find(c => c.index > this.colIdx).visibleIndex;

            const cell = this.gridWithPK.getCellByColumnVisibleIndex(this.node.row, nextCol);
            // const cell = args.shiftKey
            //   ? this.gridWithPK.getPreviousCell(node.row, node.column)
            //   : this.gridWithPK.getNextCell(node.row, node.column);

            // console.log(cell);
            if (
              cell.rowIndex !== this.node.row ||
              cell.visibleColumnIndex !== this.colIdx
            ) {
              args.preventDefault();
              this.gridWithPK.navigateTo(cell.rowIndex, nextCol, obj => {
                this.gridWithPK.clearCellSelection();
                obj.target.activate(args);
                if (obj.target.editable) {
                    this.gridWithPK.crudService.enterEditMode(obj.target);
                }
                this.gridWithPK.cdr.detectChanges();
              });
            }

            this.colIdx = nextCol;
         }
        });
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

    customKeydown(args) {
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
            this.gridWithPK.navigateTo(cell.rowIndex, cell.visibleColumnIndex, (obj) => { obj.target.nativeElement.focus(); });
        } else if (type === 'dataCell'  && args.event.key.toLowerCase() === 'enter') {
            args.cancel = true;
            this.gridWithPK.navigateTo(target.rowIndex + 1, target.visibleColumnIndex, (obj) => { obj.target.nativeElement.focus(); });
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

