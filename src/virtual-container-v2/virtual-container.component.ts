import { Component, Renderer, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { VerticalChunkComponent } from './vertical-chunk.component';

@Component({
  selector: 'virtual-container',
  styleUrls: ['./virtual-container.component.css'],
  template:
    `<div #mainContainer class="mainContainer" [ngStyle]="{width: containerWidth, height: containerHeight}" >
      <div #displayContainer class="displayContainer" [ngStyle]="{width: containerWidth, height:containerHeight}" (mousemove)="onMouseMoveContent($event)" (wheel)="onWheelContent($event)">
        <vertical-chunk #previousChunk class="previousChunk"
          [rowComponent]="rowComponent"
          [cellComponent]="cellComponent"
          [rowDefaults]="rowDefaults"
          [cellDefaults]="cellDefaults"
          [maxRowWidth]="maxRowWidth">
        </vertical-chunk>
        <vertical-chunk #currentChunk class="currentChunk"
          [rowComponent]="rowComponent"
          [cellComponent]="cellComponent"
          [rowDefaults]="rowDefaults"
          [cellDefaults]="cellDefaults"
          [maxRowWidth]="maxRowWidth">
        </vertical-chunk>
        <vertical-chunk #nextChunk class="nextChunk" 
          [rowComponent]="rowComponent"
          [cellComponent]="cellComponent"
          [rowDefaults]="rowDefaults"
          [cellDefaults]="cellDefaults"
          [maxRowWidth]="maxRowWidth">
        </vertical-chunk>
        <div *ngIf="enableScrollbars" [ngStyle]="{width: '10000px', height: '10000px'}"></div>
      </div>
      <div #scrollContainer class="scrollContainer" [ngStyle]="{width: containerWidth, height: containerHeight, overflow: enableScrollbars ? 'auto' : 'hidden'}" (scroll)="onScroll($event)" (mousemove)="onMouseMoveScroll($event)">
        <div class="scrollInner" [ngStyle]="{width: contentWidth + 'px', height: contentHeight + 'px'}" ></div>
      </div>
    </div>`
})
export class VirtualContainerComponent implements OnInit {
  @Input() containerWidth: string;
  @Input() containerHeight: string;
  @Input() cols: Array<{
    field: string,
    width: string
  }>;
  @Input() data: Array<Object>;
  @Input() horizontalItemWidth: number;
  @Input() verticalItemHeight: number;
  @Input() rowComponent: any;
  @Input() cellComponent: any;
  @Input() rowDefaults: any;
  @Input() cellDefaults: any;
  @Input() enableScrollbars = true;
  @Input() bindScrollTo: ElementRef;

  @Output() virtScroll = new EventEmitter();
  @Output() chunksRendered = new EventEmitter();

  @ViewChild('mainContainer') mainContainer;
  @ViewChild('displayContainer') displayContainer;
  @ViewChild('scrollContainer') scrollContainer;
  @ViewChild('previousChunk') previousChunk: VerticalChunkComponent; 
  @ViewChild('currentChunk') currentChunk: VerticalChunkComponent; 
  @ViewChild('nextChunk') nextChunk: VerticalChunkComponent; 


  private opts: {
    horizontalItemWidth: number,
    verticalItemHeight: number
  };

  private maxRowWidth: number;
  private contentWidth: number;
  private contentHeight: number;
  private lastScrollTop: number;
  private lastScrollLeft: number;
  private lastContentScrollTop: number;

  private currentVChunkIdx: number;
  private currentHChunkIdx: number;
  private _firstLoad = true;

  private vChunks: Array<{
    startIndex: number,
    height: number,
    width: number,
    hChunks: Array<Array<{
        startIndex: number,
        height: number,
        width: number,
        cells: Array<any>,
        cols: Array<any>
      }>>
  }>;

  constructor(private renderer:Renderer) {
    this.opts = {
      horizontalItemWidth :100,
      verticalItemHeight: 25
    };
    this.cols = [];
    this.data = [];
    this.horizontalItemWidth = 100,
    this.verticalItemHeight = 25
    this.contentWidth = 0;
    this.contentHeight = 0;
    this.lastScrollTop = 0
    this.lastScrollLeft = 0;
    this.lastContentScrollTop = 0;

    this.currentVChunkIdx = 1;
    this.currentHChunkIdx = 1;
   }

  ngOnInit() {
    this.calculateTotalSize();
    this.generateChunks();
  }

  ngAfterViewInit() {
    this.updateVerticalChunk(this.previousChunk, this.currentVChunkIdx - 1);
    this.updateVerticalChunk(this.currentChunk, this.currentVChunkIdx);
    this.updateVerticalChunk(this.nextChunk, this.currentVChunkIdx + 1);

    this.updateHorizontalChunks(this.previousChunk, this.currentHChunkIdx);
    this.updateHorizontalChunks(this.currentChunk, this.currentHChunkIdx);
    this.updateHorizontalChunks(this.nextChunk, this.currentHChunkIdx);

    this.displayContainer.nativeElement.style.top = "0px";
    this.displayContainer.nativeElement.style.left = "0px";

    this.chunksRendered.emit({
      rows: this.previousChunk.rows.concat(this.currentChunk.rows).concat(this.nextChunk.rows)
    });
    
    this._firstLoad = false;

    if(!this.bindScrollTo) {
      this.bindScrollTo = this.scrollContainer;
    }
    this.bindScrollTo.nativeElement.addEventListener('scroll', this.onScroll, false);
  }

  calculateTotalSize() {
    for(let i=0; i < this.cols.length; i++) {
      this.contentWidth += parseInt(this.cols[i].width);
    }

    for(let i=0; i < this.data.length; i++) {
      this.contentHeight += this.verticalItemHeight;
    }
  }

  generateChunks() {
    var i, chunkData,
      containerHeight = parseInt(this.containerHeight),
      currentHeight = 0,
      chunkWidth = this.cols.length * this.horizontalItemWidth;

    this.vChunks = [{
      startIndex: 0,
      height: 0,
      width: chunkWidth,
      hChunks: []
    }];

    //Vertical data
    for(i = 0; i < this.data.length; i++) {
      if(currentHeight > containerHeight) {
        this.vChunks.push({
          startIndex: i,
          height: 0,
          width: chunkWidth,
          hChunks: []
        });

        chunkData = this.data.slice(this.vChunks[this.vChunks.length - 2].startIndex, i);
        this.vChunks[this.vChunks.length - 2].height = currentHeight;
        this.vChunks[this.vChunks.length - 2].hChunks = this.getRowsForChunk(chunkData);

        currentHeight = 0;
      }

      currentHeight += this.verticalItemHeight;
    }

    chunkData = this.data.slice(this.vChunks[this.vChunks.length - 1].startIndex, i);
    this.vChunks[this.vChunks.length - 1].height = currentHeight;
    this.vChunks[this.vChunks.length - 1].hChunks = this.getRowsForChunk(chunkData);
  }

  getRowsForChunk(data) {
    var rows = [],
        rowIdx, colIdx, curLength,
        containerWidth = parseInt(this.containerWidth),
        currentWidth = 0;

    for(rowIdx = 0; rowIdx < data.length; rowIdx++) {
      let newRow =  [{
        startIndex: 0,
        height: this.verticalItemHeight,
        width: 0,
        cells: {},
        cols: []
      }];

      this.maxRowWidth = 0;
      for(colIdx = 0; colIdx < this.cols.length; colIdx++) {
        if(currentWidth > containerWidth) {
          newRow.push({
            startIndex: colIdx,
            height: this.verticalItemHeight,
            width: 0,
            cells: {},
            cols: []
          });
  
          curLength = newRow.length;
          newRow[curLength - 2].width = currentWidth;
          newRow[curLength - 2].cells = this.sliceColumns(data[rowIdx], newRow[curLength - 2].startIndex, colIdx);
          newRow[curLength - 2].cols = this.cols.slice( newRow[curLength - 2].startIndex, colIdx);
          if(this.maxRowWidth < 3 * currentWidth) {
            this.maxRowWidth = 3 * currentWidth;
          }
          currentWidth = 0;
        }
  
        currentWidth += parseInt(this.cols[colIdx].width);
      }

      currentWidth = 0;
      newRow[curLength - 1].width = currentWidth;
      newRow[curLength - 1].cells = this.sliceColumns(data[rowIdx], newRow[curLength - 1].startIndex, colIdx);
      newRow[curLength - 1].cols = this.cols.slice( newRow[curLength - 1].startIndex, colIdx);
      
      rows.push(newRow);
    }

    return rows;
  }

  sliceColumns(row, startIndex, endIndex) {
    var slicedCols = {},
        keys = Object.keys(row);

    for(let j = startIndex; j < endIndex; j++) {
      slicedCols[keys[j]] = row[keys[j]];
    }
    
    return slicedCols;
  }

  updateVerticalChunk(chunkRef: VerticalChunkComponent, newChunkIndex) {
    if(newChunkIndex >= this.vChunks.length) {
      return;
    }

    chunkRef.data = this.vChunks[newChunkIndex];
    chunkRef.changeDet.detectChanges();

    if(this._firstLoad) {
      chunkRef.loadNewRowItems();
    } else {
      chunkRef.updateRowItems();
    }
    
    this.updateHorizontalChunks(chunkRef, this.currentHChunkIdx);
  }

  updateHorizontalChunks(chunkRef: VerticalChunkComponent, newCurChunkIndex) {
    chunkRef.updateHorizontalChunk(chunkRef.previousChunks, newCurChunkIndex - 1, true);
    chunkRef.updateHorizontalChunk(chunkRef.currentChunks, newCurChunkIndex, false);
    chunkRef.updateHorizontalChunk(chunkRef.nextChunks, newCurChunkIndex + 1, false);
  }

  onScroll = (event)  =>{
    var newVChunkIndex, newHChunkIndex,
        curScrollTop = event.target.scrollTop,
        curScrollLeft = event.target.scrollLeft,
        vDir = Math.sign(curScrollTop - this.lastScrollTop),
        hDir = Math.sign(curScrollLeft - this.lastScrollLeft);

    this.virtScroll.emit({scrollTop: curScrollTop, scrollLeft: curScrollLeft});

    //Updating vertical chunks
    if(curScrollTop != this.lastScrollTop  &&
      this.currentChunk.data && this.nextChunk.data) {
      let currentHeight = 0;

      for(let i = 0; i < this.vChunks.length; i++) {
        if (vDir > 0 &&
            currentHeight <= curScrollTop &&
            curScrollTop < currentHeight + this.vChunks[i].height &&
            i >= this.currentVChunkIdx) {
          newVChunkIndex = i;
          break;
        } else if (vDir <= 0 && 
            currentHeight - this.vChunks[i].height <= curScrollTop &&
            curScrollTop < currentHeight && 
            i <= this.currentVChunkIdx) {
          newVChunkIndex = i;
          break;
        }

        currentHeight += this.vChunks[i].height;
      }

      if(Math.abs(curScrollTop - this.lastScrollTop) <= this.previousChunk.data.height) {
        let newTop = parseInt(this.displayContainer.nativeElement.style.top) - (curScrollTop - this.lastScrollTop);
        this.displayContainer.nativeElement.style.top =  newTop + "px";
      }

      if(newVChunkIndex && newVChunkIndex !== this.currentVChunkIdx) { 
        this.currentVChunkIdx = newVChunkIndex;

        this.updateVerticalChunk(this.previousChunk, this.currentVChunkIdx - 1);
        this.updateVerticalChunk(this.currentChunk, this.currentVChunkIdx);
        this.updateVerticalChunk(this.nextChunk, this.currentVChunkIdx + 1);        
        this.chunksRendered.emit({
          rows: this.previousChunk.rows.concat(this.previousChunk.rows).concat(this.nextChunk.rows)
        });
        
        this.displayContainer.nativeElement.style.top = (-this.previousChunk.data.height - (curScrollTop - currentHeight)) + "px";
      }
    }

    //Updating horizontal chunks
    if(curScrollLeft != this.lastScrollLeft) {
      let currentWidth = 0;

      for(let i = 0; i < this.previousChunk.data.hChunks[0].length; i++) {
        if (hDir > 0 &&
            currentWidth <= curScrollLeft &&
            curScrollLeft < currentWidth + this.previousChunk.data.hChunks[0][i].width &&
            i >= this.currentHChunkIdx) {
          newHChunkIndex = i;
          break;
        } else if (hDir <= 0 && 
            currentWidth - this.previousChunk.data.hChunks[0][i].width <= curScrollLeft &&
            curScrollLeft < currentWidth && 
            i <= this.currentHChunkIdx) {
          newHChunkIndex = i;
          break;
        }

        currentWidth += this.previousChunk.data.hChunks[0][i].width;
      }

      if(Math.abs(curScrollLeft - this.lastScrollLeft) <= this.previousChunk.data.hChunks[0][0].width) {
        let newLeft = parseInt(this.displayContainer.nativeElement.style.left) - (curScrollLeft - this.lastScrollLeft);
        this.displayContainer.nativeElement.style.left =  newLeft + "px";
      }

      if(newHChunkIndex && newHChunkIndex !== this.currentHChunkIdx) {
        this.currentHChunkIdx = newHChunkIndex;  
        
        this.updateHorizontalChunks(this.previousChunk, this.currentHChunkIdx);
        this.updateHorizontalChunks(this.currentChunk, this.currentHChunkIdx);
        this.updateHorizontalChunks(this.nextChunk, this.currentHChunkIdx);

        this.displayContainer.nativeElement.style.left = (-this.previousChunk.data.hChunks[0][this.currentHChunkIdx-1].width - (curScrollLeft - currentWidth)) + "px";
      }
    }
    
    //Cache data for the next scroll
    this.lastScrollTop = curScrollTop;
    this.lastScrollLeft = curScrollLeft;
  }

  onMouseMoveScroll(event) {
    if (event.layerX < parseInt(this.containerWidth) - 17 && 
        event.layerY < parseInt(this.containerHeight) - 17 &&
        event.offsetX - 2 <= event.layerX && event.layerX <= event.offsetX + 2 &&
        event.offsetY - 2 <= event.layerY && event.layerY <= event.offsetY + 2 &&
        this.scrollContainer.nativeElement.style.pointerEvents !== "none") {
      this.scrollContainer.nativeElement.style.pointerEvents = "none";
    }
  }

  onMouseMoveContent(event) {
    if (/Edge/.test(navigator.userAgent)) {
      if ((event.layerX > parseInt(this.containerWidth) - 17 || 
          event.layerY > parseInt(this.containerHeight) - 17) && 
          this.scrollContainer.nativeElement.style.pointerEvents !== "auto") {
        this.scrollContainer.nativeElement.style.pointerEvents = "auto";
      }
    } else {
      if ((event.layerX + parseInt(this.displayContainer.nativeElement.style.left) > parseInt(this.containerWidth) - 17 || 
          event.layerY + parseInt(this.displayContainer.nativeElement.style.top) > parseInt(this.containerHeight) - 17) && 
          this.scrollContainer.nativeElement.style.pointerEvents !== "auto") {
        this.scrollContainer.nativeElement.style.pointerEvents = "auto";
      }
    }
  }

  onWheelContent(event) {
    var scrollDeltaY;

    if (event.wheelDeltaY) {
      /* Option supported on Chrome, Safari, Opera.
      /* 120 is default for mousewheel on these browsers. Other values are for trackpads */
      scrollDeltaY = -event.wheelDeltaY / 120;
    } else if (event.deltaY) {
      /* For other browsers that don't provide wheelDelta, use the deltaY to determine direction and pass default values. */
      scrollDeltaY = event.deltaY > 0 ? 1 : -1;
    }

    if (/Edge/.test(navigator.userAgent)) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollTop + event.deltaY / 3;
    } else {
      this.smoothWheelScrollY(scrollDeltaY);
    }
    this.scrollContainer.nativeElement.scrollLeft = this.scrollContainer.nativeElement.scrollLeft + event.deltaX;
    
    return false;
  }

  smoothWheelScrollY(deltaY: number) {
    var self = this,
      smoothingStep = 2,
      smoothingDuration = 0.5,
      animationId;

    //We use the formula for parabola y = -3*x*x + 3 to simulate smooth inertia that slows down
    var x = -1;
    function inertiaStep() {
      if (x > 1) {
        cancelAnimationFrame(animationId);
        return;
      }

      let nextY = ((-3 * x * x + 3) * deltaY * 2) * smoothingStep;
      self.scrollContainer.nativeElement.scrollTop = self.scrollContainer.nativeElement.scrollTop + nextY;

      //continue the intertia
      x += 0.08 * (1 / smoothingDuration);
      animationId = requestAnimationFrame(inertiaStep);
    }

    animationId = requestAnimationFrame(inertiaStep);
  }

  gOnDestroy() {
      this.bindScrollTo.nativeElement.removeEventListener('scroll', this.onScroll, false);
  }
}
