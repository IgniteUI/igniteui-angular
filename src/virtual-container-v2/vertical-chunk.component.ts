import { Component, ComponentRef, ViewContainerRef, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ViewChildren, HostBinding, QueryList, TemplateRef, ElementRef, ComponentFactoryResolver } from '@angular/core';
import { HorizontalChunkComponent } from './horizontal-chunk.component';
import { VirtualRow } from './virtual-row.interface';

@Component({
  selector: 'vertical-chunk',
  styleUrls: ['./vertical-chunk.component.css'],
  template: 
    `<ng-container *ngTemplateOutlet="customRowTemplate">
    </ng-container>

    <ng-template #customRowTemplate>
    </ng-template>`
})
export class VerticalChunkComponent implements OnInit {
  @Input() rowComponent: any;
  @Input() cellComponent: any;
  @Input() rowDefaults: any;
  @Input() cellDefaults: any;
  @Input() maxRowWidth: any;
  @Input() data: {
    height: number,
    width: number,
    hChunks: Array<Array<{
        startIndex: number,
        height: number,
        width: number,
        cells: Array<any>,
        cols: Array<any>
      }>>
  };

  @Output() onRowsRendered = new EventEmitter();

  @ViewChild('customRowTemplate', {read: ViewContainerRef}) customRowTemplate: ViewContainerRef; 

  public previousChunks: Array<ComponentRef<HorizontalChunkComponent>>;
  public currentChunks: Array<ComponentRef<HorizontalChunkComponent>>;
  public nextChunks: Array<ComponentRef<HorizontalChunkComponent>>;
  public rows: Array<any>;

  private _firstLoad = true;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, public changeDet:ChangeDetectorRef, public element:ElementRef) {
    this.previousChunks = [];
    this.currentChunks = [];
    this.nextChunks = [];
    this.rows = [];
  }

  ngOnInit() {
    
  }

  createRow(rowIndex) {
    var rowComponentFactory = this.componentFactoryResolver.resolveComponentFactory(this.rowComponent);
    var horizontalChunkCF= this.componentFactoryResolver.resolveComponentFactory(HorizontalChunkComponent);
    
    let prevChunk: ComponentRef<HorizontalChunkComponent> = this.customRowTemplate.createComponent(horizontalChunkCF);
    prevChunk.instance.cellComponent = this.cellComponent;
    prevChunk.instance.cellDefaults = this.cellDefaults;
    this.previousChunks.unshift(prevChunk);
    
    let curChunk: ComponentRef<HorizontalChunkComponent> = this.customRowTemplate.createComponent(horizontalChunkCF);
    curChunk.instance.cellComponent = this.cellComponent;
    curChunk.instance.cellDefaults = this.cellDefaults;
    this.currentChunks.unshift(curChunk);

    let nextChunk: ComponentRef<HorizontalChunkComponent> = this.customRowTemplate.createComponent(horizontalChunkCF);
    nextChunk.instance.cellComponent = this.cellComponent;
    nextChunk.instance.cellDefaults = this.cellDefaults;
    this.nextChunks.unshift(nextChunk);

    let newRow = this.customRowTemplate.createComponent(
      rowComponentFactory,
      0,
      undefined,
      [
        [prevChunk.location.nativeElement,
        curChunk.location.nativeElement,
        nextChunk.location.nativeElement]
      ]
    );
    
    (<VirtualRow>newRow.instance).height = this.data.hChunks[rowIndex][0].height;
    (<VirtualRow>newRow.instance).width = this.maxRowWidth;
    (<VirtualRow>newRow.instance).defaultOptions = this.rowDefaults;
    (<VirtualRow>newRow.instance).changeDet.detectChanges();
    newRow.hostView.detectChanges();

    prevChunk.instance.rowRef = newRow;
    curChunk.instance.rowRef = newRow;
    nextChunk.instance.rowRef = newRow;
    this.rows.unshift(newRow);
  }

  loadNewRowItems() {
    this.customRowTemplate.clear();
    
    for(let i = 0; i < this.data.hChunks.length; i++) {
      this.createRow(i);
    }
  }

  updateRowItems() {
    for(let i = 0; i < this.data.hChunks.length; i++) {
      if(i >= this.rows.length) {
        this.createRow(i);
      }
    }

    if (this.rows.length > this.data.hChunks.length) {
      let numToRemove = this.rows.length - this.data.hChunks.length;
      for (let i = 0; i < numToRemove; i++) {
        this.previousChunks.pop().destroy();
        this.currentChunks.pop().destroy();
        this.nextChunks.pop().destroy();
        this.rows.pop().destroy();
      }
    }
  }

  updateHorizontalChunk(chunkRefs: Array<ComponentRef<HorizontalChunkComponent>>, newChunkIndex, clearRow: boolean) {
    var refsArray = chunkRefs;

    if(newChunkIndex == -1) {
      for(let i=0; i < refsArray.length; i++) {
        refsArray[i].instance.show = false;
        refsArray[i].instance.data = undefined;
        refsArray[i].instance.changeDet.detectChanges();
      }
    } else {
      for(let i=0; i < refsArray.length; i++) {
        if(clearRow) {
          refsArray[i].instance.rowRef.cells = [];
        }

        refsArray[i].instance.show = true;
        refsArray[i].instance.data = this.data.hChunks[i][newChunkIndex];
        refsArray[i].instance.changeDet.detectChanges();

        if(this._firstLoad) {
          refsArray[i].instance.loadNewCellItems();
          this._firstLoad = false;
        }  else {
          refsArray[i].instance.updateCellsItems();
        }
        
        refsArray[i].hostView.detectChanges();
      }

      this.onRowsRendered.emit({ rows: this.rows });
    }
  }
}
