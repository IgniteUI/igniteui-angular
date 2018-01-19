import { ChangeDetectorRef } from '@angular/core';

export interface VirtualRow {
    width: number;
    height: number;
    rowData: any;
    defaultOptions: any;
    cells: Array<any>;
    changeDet: ChangeDetectorRef;
}