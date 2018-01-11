import { Component, Renderer, OnInit, Input, ViewChild } from '@angular/core';
import { VerticalChunkComponent } from './vertical-chunk.component';

@Component({
  selector: 'virtual-container',
  styleUrls: ['./virtual-container.component.css'],
  template:
    `<div #mainContainer class="mainContainer" [ngStyle]="{width: containerWidth, height: containerHeight}" >
      <div #displayContainer class="displayContainer" [ngStyle]="{width: containerWidth, height: containerHeight}" (mousedown)="mouseDown($event)" (mouseup)="mouseUp($event)" (click)="clickContent($event)">
        <table >
          <tbody>
            <vertical-chunk #previousChunk class="previousChunk"></vertical-chunk>
            <vertical-chunk #currentChunk class="currentChunk"></vertical-chunk>
            <vertical-chunk #nextChunk class="nextChunk"></vertical-chunk>
          </tbody>
        </table>
      </div>
      <div #scrollContainer class="scrollContainer" [ngStyle]="{width: containerWidth, height: containerHeight}" (scroll)="onScroll($event)" (mousedown)="mouseDownScroll($event)">
        <div class="scrollInner" [ngStyle]="{width: contentWidth + 'px', height: contentHeight + 'px'}" ></div>
      </div>
    </div>`
})
export class VirtualContainerComponent implements OnInit {
  @Input() containerWidth: string;
  @Input() containerHeight: string;

  @ViewChild('mainContainer') mainContainer;
  @ViewChild('displayContainer') displayContainer;
  @ViewChild('scrollContainer') scrollContainer;
  @ViewChild('previousChunk') previousChunk: VerticalChunkComponent; 
  @ViewChild('currentChunk') currentChunk: VerticalChunkComponent; 
  @ViewChild('nextChunk') nextChunk: VerticalChunkComponent; 

  private cols: Array<{
    field: string,
    width: number
  }>;
  private data: Array<Object>;
  private opts: {
    horizontalItemWidth: number,
    verticalItemHeight: number
  };

  private contentWidth: number;
  private contentHeight: number;
  private lastScrollTop: number;
  private lastScrollLeft: number;

  private currentVChunkIdx: number;
  private currentHChunkIdx: number;

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
    this.contentWidth = 0;
    this.contentHeight = 0;
    this.lastScrollTop = 0
    this.lastScrollLeft = 0;

    this.currentVChunkIdx = 0;
    this.currentHChunkIdx = 0;

    this.generateData();
    
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
  }

  generateData() {
    var dummyData = [];
    for(let j = 0; j < 200; j++) {
      this.cols.push({
         field: j.toString(),
         width: this.opts.horizontalItemWidth
      });
    }

    for(let i = 0; i < 10000; i++) {
      let obj = {};
       for(var j = 0; j <  this.cols.length; j++){
         let col = this.cols[j].field;
         obj[col] = 10*i*j;
       }
        dummyData.push(obj);
     }

     this.data = dummyData;
  }

  calculateTotalSize() {
    for(let i=0; i < this.cols.length; i++) {
      this.contentWidth += this.cols[i].width;
    }

    for(let i=0; i < this.data.length; i++) {
      this.contentHeight += this.opts.verticalItemHeight;
    }
  }

  generateChunks() {
    var i, chunkData,
      containerHeight = parseInt(this.containerHeight),
      currentHeight = 0,
      chunkWidth = this.cols.length * this.opts.horizontalItemWidth;

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

      currentHeight += this.opts.verticalItemHeight;
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
        height: this.opts.verticalItemHeight,
        width: 0,
        cells: {},
        cols: []
      }];

      for(colIdx = 0; colIdx < this.cols.length; colIdx++) {
        if(currentWidth > containerWidth) {
          newRow.push({
            startIndex: colIdx,
            height: this.opts.verticalItemHeight,
            width: 0,
            cells: {},
            cols: []
          });
  
          curLength = newRow.length;
          newRow[curLength - 2].width = currentWidth;
          newRow[curLength - 2].cells = this.sliceColumns(data[rowIdx], newRow[curLength - 2].startIndex, colIdx);
          newRow[curLength - 2].cols = this.cols.slice( newRow[curLength - 2].startIndex, colIdx);
  
          currentWidth = 0;
        }
  
        currentWidth += this.cols[colIdx].width;
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
    if(newChunkIndex == -1) {
      chunkRef.show = false;
      chunkRef.data = undefined;
      chunkRef.changeDet.detectChanges();
    } else {
      chunkRef.show = true;
      chunkRef.data = this.vChunks[newChunkIndex];
      chunkRef.changeDet.detectChanges();
      
      this.updateHorizontalChunks(chunkRef, this.currentHChunkIdx);
    }
  }

  updateHorizontalChunks(chunkRef: VerticalChunkComponent, newCurChunkIndex) {
    chunkRef.updateHorizontalChunk(chunkRef.previousChunks , newCurChunkIndex - 1);
    chunkRef.updateHorizontalChunk(chunkRef.currentChunks , newCurChunkIndex);
    chunkRef.updateHorizontalChunk(chunkRef.nextChunks , newCurChunkIndex + 1);
  }

  onScroll(event) {
    var newVChunkIndex, newHChunkIndex,
        curScrollTop = this.scrollContainer.nativeElement.scrollTop,
        curScrollLeft = this.scrollContainer.nativeElement.scrollLeft,
        vDir = Math.sign(curScrollTop - this.lastScrollTop),
        hDir = Math.sign(curScrollLeft - this.lastScrollLeft);

    //Updating vertical chunks
    if(curScrollTop != this.lastScrollTop) {
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

      if(Math.abs(curScrollTop - this.lastScrollTop) <= this.currentChunk.data.height) {
        let newTop = parseInt(this.displayContainer.nativeElement.style.top) - (curScrollTop - this.lastScrollTop);
        this.displayContainer.nativeElement.style.top =  newTop + "px";
      }

      if(newVChunkIndex && newVChunkIndex !== this.currentVChunkIdx) { 
        this.currentVChunkIdx = newVChunkIndex;

        this.updateVerticalChunk(this.previousChunk, this.currentVChunkIdx - 1);
        this.updateVerticalChunk(this.currentChunk, this.currentVChunkIdx);
        this.updateVerticalChunk(this.nextChunk, this.currentVChunkIdx + 1);        

        this.displayContainer.nativeElement.style.top = (-this.currentChunk.data.height - (curScrollTop - currentHeight)) + "px";
      }
    }

    //Updating horizontal chunks
    if(curScrollLeft != this.lastScrollLeft) {
      let currentWidth = 0;

      for(let i = 0; i < this.currentChunk.data.hChunks[0].length; i++) {
        if (hDir > 0 &&
            currentWidth <= curScrollLeft &&
            curScrollLeft < currentWidth + this.currentChunk.data.hChunks[0][i].width &&
            i >= this.currentHChunkIdx) {
          newHChunkIndex = i;
          break;
        } else if (hDir <= 0 && 
            currentWidth - this.currentChunk.data.hChunks[0][i].width <= curScrollLeft &&
            curScrollLeft < currentWidth && 
            i <= this.currentHChunkIdx) {
          newHChunkIndex = i;
          break;
        }

        currentWidth += this.currentChunk.data.hChunks[0][i].width;
      }

      if(Math.abs(curScrollLeft - this.lastScrollLeft) <= this.currentChunk.data.hChunks[0][0].width) {
        let newLeft = parseInt(this.displayContainer.nativeElement.style.left) - (curScrollLeft - this.lastScrollLeft);
        this.displayContainer.nativeElement.style.left =  newLeft + "px";
      }

      if(newHChunkIndex && newHChunkIndex !== this.currentHChunkIdx) {
        this.currentHChunkIdx = newHChunkIndex;  
        
        this.updateHorizontalChunks(this.previousChunk, this.currentHChunkIdx);
        this.updateHorizontalChunks(this.currentChunk, this.currentHChunkIdx);
        this.updateHorizontalChunks(this.nextChunk, this.currentHChunkIdx);

        this.displayContainer.nativeElement.style.left = (-this.currentChunk.data.hChunks[0][0].width - (curScrollLeft - currentWidth)) + "px";
      }
    }
    
    //Cache data for the next scroll
    this.lastScrollTop = curScrollTop;
    this.lastScrollLeft = curScrollLeft;
  }

  mouseDownScroll(event) {
    if (event.offsetX < parseInt(this.containerWidth) - 17 && 
        event.offsetY < parseInt(this.containerHeight) - 17) {
      this.scrollContainer.nativeElement.style.pointerEvents = "none";
      let elementToTrigger = document.elementFromPoint(event.clientX, event.clientY),
          eventData = {
            altKey: event.altKey,
            bubbles: event.bubbles,
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
            ctrlKey: event.ctrlKey,
            sourceCapabilities: event.sourceCapabilities
          };
      
      let mouseDownEvent = new MouseEvent('mousedown', eventData);
      elementToTrigger.dispatchEvent(mouseDownEvent);

      let clickEvent = new MouseEvent('click', eventData);
      elementToTrigger.dispatchEvent(clickEvent);

      event.preventDefault();
    }
  }

  mouseDown(event) {
  }

  clickContent(event) {
    console.log(event.target);
  }

  mouseUp(event) {
    this.scrollContainer.nativeElement.style.pointerEvents = "auto";
  }
}
