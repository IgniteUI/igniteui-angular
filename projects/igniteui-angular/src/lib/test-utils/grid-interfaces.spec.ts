
/* Add to template: (onSelection)="cellSelected($event)" */
export interface IGridSelection {
    cellSelected(event);
}

/* Add to template: (onCellClick)="cellClick($event)" */
export interface IGridCellClick {
    cellClick(evt): void;
}

/* Add to template: (onDoubleClick)="doubleClick($event)" */
export interface IGridCellDoubleClick {
    doubleClick(evt): void;
}

/* Add to template: (onContextMenu)="cellRightClick($event)" */
export interface IGridContextMenu {
    cellRightClick(evt): void;
}

/* Add to template: ` (onColumnInit)="columnInit($event)"` */
export interface IGridColumnInit {
    columnInit(column): void;
}

/* Add to template: `(onRowAdded)="rowAdded($event)"
                    (onRowDeleted)="rowDeleted($event)"` */
export interface IGridRowEvents {
    rowAdded(event): void;
    rowDeleted(event): void;
}

/* Add to template: `(onColumnPinning)="columnPinning($event)"` */
export interface IGridColumnPinning {
    columnPinning(event): void;
}

/* Add to template: ` (onEditDone)="editDone($event)"` */
export interface IEditDone {
    editDone(event): void;
}

/* Add to template: ` (onRowSelectionChange)="rowSelectionChange($event)"` */
export interface IGridRowSelectionChange {
    rowSelectionChange(event): void;
}

/* Add to template: ` (onColumnResized)="columnResized($event)"` */
export interface IColumnResized {
    columnResized(event): void;
}
