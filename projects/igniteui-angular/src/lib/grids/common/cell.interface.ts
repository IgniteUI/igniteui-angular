import { ColumnType } from './column.interface';
import { RowType } from './row.interface';

export interface CellType {
    nativeElement: HTMLElement;
    column: ColumnType;
    row: RowType;
    rowData: any;
    value: any;
    formatter: (value: any) => any;
    gridID: any;
    visibleColumnIndex: any;
    cellID: {
        rowID: any;
        columnID: number;
        rowIndex: number;
    };
    editMode: boolean;
    readonly: boolean;
    width: string;
    selected: boolean;
    editValue: any;
    editable: boolean;
}
