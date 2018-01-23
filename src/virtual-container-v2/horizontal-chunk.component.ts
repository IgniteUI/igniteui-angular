import { Component, ComponentFactoryResolver, OnInit, Input, ChangeDetectorRef, HostBinding, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { VirtualCell } from './virtual-cell.interface';

@Component({
  selector: 'horizontal-chunk',
  styleUrls: ['./horizontal-chunk.component.css'],
  template: 
  `<ng-container *ngTemplateOutlet="customCellTemplate">
  </ng-container>

  <ng-template #customCellTemplate>
  </ng-template>`
})
export class HorizontalChunkComponent implements OnInit {
  @Input() cellComponent: any;
  @Input() cellDefaults: any;

  @HostBinding("style.width.px")
  public width = 0;

  public rowRef: any;
  public show: boolean;
  public data: {
    startIndex: number,
    height: number,
    width: number,
    cells: Object,
    cols: Array<any>
  };
  public cells: Array<any>;

  @ViewChild('customCellTemplate', {read: ViewContainerRef}) customCellTemplate: ViewContainerRef; 
  constructor(private componentFactoryResolver: ComponentFactoryResolver, public changeDet:ChangeDetectorRef) {
    this.show = false;
    this.cells = [];
  }

  ngOnInit() {
  }

  createCell(colIndex) {
    var cellComponentFactory = this.componentFactoryResolver.resolveComponentFactory(this.cellComponent);  
    var newCell = this.customCellTemplate.createComponent(cellComponentFactory);
    (<VirtualCell>newCell.instance).height = this.data.height;
    (<VirtualCell>newCell.instance).width = this.data.cols[colIndex].width;
    (<VirtualCell>newCell.instance).row = this.rowRef.instance;
    (<VirtualCell>newCell.instance).defaultOptions = this.cellDefaults;
    (<VirtualCell>newCell.instance).value = this.data.cells[this.data.cols[colIndex].field];
    this.rowRef.cells.push(newCell.instance);
    this.cells.push(newCell);
  }

  loadNewCellItems() {
    this.customCellTemplate.clear();
    
    this.width = this.data.width;
    for(let i = 0; i < this.data.cols.length; i++) {
      this.createCell(i);
    }

    this.rowRef.hostView.detectChanges();
  }

  updateCellsItems() {
    for (let i = 0; i < this.data.cols.length; i++) {
      if(i < this.cells.length) {
        (<VirtualCell>this.cells[i].instance).width = this.data.cols[i].width;
        (<VirtualCell>this.cells[i].instance).value = this.data.cells[this.data.cols[i].field];
      } else {
        this.createCell(i);
      }
    }

    if (this.cells.length > this.data.cols.length) {
      let numToRemove = this.cells.length - this.data.cols.length;
      for (let i = 0; i < numToRemove; i++) {
        let cell = this.cells.pop();
        cell.hostView.destroy();
      }
    }

    this.width = this.data.width;
  }
}
