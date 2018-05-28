import { IgxGridCellComponent } from "../grid/cell.component";
import { IGridCellEventArgs } from "../grid/grid.component";

export interface IGridSelection {
    /* Add to template: (onSelection)="cellSelected($event)" */

    selectedCell: IgxGridCellComponent;
    cellSelected(event: IGridCellEventArgs);
}

export interface IGridCellClick {
    /* Add to template: (onCellClick)="cellClick($event)" */

    clickedCell: IgxGridCellComponent;
    cellClick(evt): void;
}

export interface IGridCellDoubleClick {
    /* Add to template: (onDoubleClick)="doubleClick($event)" */

    clickedCell: IgxGridCellComponent;
    doubleClick(evt): void;
}

export interface IGridContextMenu {
    /* Add to template: (onContextMenu)="cellRightClick($event)" */

    rightClickedCell: IgxGridCellComponent;
    cellRightClick(evt): void;
}
