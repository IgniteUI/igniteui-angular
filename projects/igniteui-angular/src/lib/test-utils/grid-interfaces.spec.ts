
/* Add to template: (selected)="cellSelected($event)" */
export interface IGridSelection {
    cellSelected(event);
}

/* Add to template: (onCellClick)="cellClick($event)" */
export interface IGridCellClick {
    cellClick(evt): void;
}

/* Add to template: (doubleClick)="doubleClick($event)" */
export interface IGridCellDoubleClick {
    doubleClick(evt): void;
}

/* Add to template: (contextMenu)="cellRightClick($event)" */
export interface IGridContextMenu {
    cellRightClick(evt): void;
}

/* Add to template: ` (columnInit)="columnInit($event)"` */
export interface IGridColumnInit {
    columnInit(column): void;
}

/* Add to template: `(rowAdded)="rowAdded($event)"
                    (rowDeleted)="rowDeleted($event)"` */
export interface IGridRowEvents {
    rowAdded(event): void;
    rowDeleted(event): void;
}

/* Add to template: `(columnPin)="columnPinning($event)"` */
export interface IGridColumnPinning {
    columnPinning(event): void;
}

/* Add to template: ` (onEditDone)="editDone($event)"` */
export interface IEditDone {
    editDone(event): void;
}

/* Add to template: ` (rowSelectionChange)="rowSelectionChange($event)"` */
export interface IGridRowSelectionChange {
    rowSelectionChange(event): void;
}

/* Add to template: ` (columnResized)="columnResized($event)"` */
export interface IColumnResized {
    columnResized(event): void;
}
