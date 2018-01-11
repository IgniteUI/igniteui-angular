import { Component, OnInit, Input, ChangeDetectorRef, HostBinding } from '@angular/core';

@Component({
  selector: 'horizontal-chunk',
  styleUrls: ['./horizontal-chunk.component.css'],
  template: 
  `<ng-container *ngIf="show && data">
    <td *ngFor="let col of data.cols" [ngStyle]="{width: col.width + 'px'}">{{data.cells[col.field]}}</td>
  </ng-container>`
})
export class HorizontalChunkComponent implements OnInit {
  public show: boolean;
  public data: {
    startIndex: number,
    height: number,
    width: number,
    cells: Array<any>,
    cols: Array<any>
  };

  constructor(public changeDet:ChangeDetectorRef) {
    this.show = false;
   }

  ngOnInit() {
  }
}
