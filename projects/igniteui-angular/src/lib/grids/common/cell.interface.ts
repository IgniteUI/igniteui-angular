import { ColumnType } from './column.interface';
import { RowType } from './row.interface';

export interface CellType {
    gridID: string;
    column: ColumnType;
    columnIndex: number;
    row: RowType;
    rowData: any;
    rowIndex: number;
    value: any;
    visibleColumnIndex: number;
}
