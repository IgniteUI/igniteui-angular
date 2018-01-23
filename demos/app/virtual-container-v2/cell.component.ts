import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { VirtualCell } from '../../lib/main';

@Component({
  selector: 'cell',
  styleUrls: ['./cell.component.css'],
  template: 
    `<div class="cellStyle" [ngStyle]="{width: width ? width + 'px': 'auto'}">
        {{value}}
    </div>`
})
export class CellComponent implements OnInit, VirtualCell {
    @Input() width: number;
    @Input() height: number;
    @Input() value: any;
    @Input() defaultOptions: any;

    public row: any;
    constructor(public changeDet:ChangeDetectorRef) {
    }

    ngOnInit() {
    }
}