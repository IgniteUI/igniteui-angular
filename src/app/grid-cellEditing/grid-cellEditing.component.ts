import { Component, HostBinding, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    GridSelectionMode,
    IGX_SELECT_DIRECTIVES,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxCellEditorTemplateDirective,
    IgxCellTemplateDirective,
    IgxColumnComponent,
    IgxColumnRequiredValidatorDirective,
    IgxDateSummaryOperand,
    IgxGridComponent,
    IgxPaginatorComponent,
    IgxSummaryResult,
    IgxSwitchComponent,
} from 'igniteui-angular';

import { data, dataWithoutPK } from '../shared/data';

@Component({
    selector: 'app-grid-cellediting',
    templateUrl: 'grid-cellEditing.component.html',
    styleUrl: 'grid-cellEditing.component.scss',
    imports: [
        FormsModule,
        IGX_SELECT_DIRECTIVES,
        IgxButtonDirective,
        IgxButtonGroupComponent,
        IgxCellEditorTemplateDirective,
        IgxCellTemplateDirective,
        IgxColumnComponent,
        IgxColumnRequiredValidatorDirective,
        IgxGridComponent,
        IgxPaginatorComponent,
        IgxSwitchComponent,
    ]
})
export class GridCellEditingComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    private gridWithPK: IgxGridComponent;
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    private gridWithoutPK: IgxGridComponent;

    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }

    public orderDateHidden = false;
    public data: any;
    public dataWithoutPK: any;
    public size : "large" | "medium" | "small" = "small";
    public selectionModes = ['none', 'single', 'multiple'];
    public sizes;
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

    public groupable = false;
    public exitEditOnBlur = false;
    public pname = 'ProductName';
    public selectionMode;
    public earliest = EarliestSummary;

    constructor() {
        this.data = data;
        this.dataWithoutPK = dataWithoutPK;
        this.sizes = [
            { label: 'large', selected: this.size === "large", togglable: true },
            { label: 'medium', selected: this.size === "medium", togglable: true },
            { label: 'small', selected: this.size === "small", togglable: true }
        ];
        this.selectionMode = GridSelectionMode.multiple;
    }



    public cellEdit(evt) {
        if (!evt.valid) {
            evt.cancel = true;
        }
    }

    public rowEdit(evt) {
        if (!evt.valid) {
            evt.cancel = true;
        }
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
        this.size = this.sizes[event.index].label;
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

    public handleFocusOut = (event: FocusEvent) => {
        if (!this.exitEditOnBlur) return;

        if (!event.relatedTarget || !this.gridWithPK.nativeElement.contains(event.relatedTarget as Node)) {
          this.gridWithPK.endEdit(true);
          this.gridWithPK.clearCellSelection();
        }
    }
}

class EarliestSummary extends IgxDateSummaryOperand {
    constructor() {
        super();
    }

    public override operate(summaries?: any[]): IgxSummaryResult[] {
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

