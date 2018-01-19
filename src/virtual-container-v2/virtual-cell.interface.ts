import { ChangeDetectorRef } from '@angular/core';

export interface VirtualCell {
    width: number;
    height: number;
    value: any;
    defaultOptions: any;
    row: any;
    changeDet: ChangeDetectorRef;
}