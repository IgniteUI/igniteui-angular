import { IgxColumnComponent } from './column.component';


export interface MRLColumnSizeInfo {
    ref: IgxColumnComponent;
    width: number;
    colSpan: number;
    colEnd: number;
    widthSetByUser: boolean;
}

export interface MRLResizeColumnInfo {
    target: IgxColumnComponent;
    spanUsed: number;
}
