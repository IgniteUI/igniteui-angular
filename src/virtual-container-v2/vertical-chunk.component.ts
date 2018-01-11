import { Component, OnInit, Input, ChangeDetectorRef, ViewChildren, HostBinding, QueryList, ElementRef } from '@angular/core';
import { HorizontalChunkComponent } from './horizontal-chunk.component';

@Component({
  selector: 'vertical-chunk',
  styleUrls: ['./vertical-chunk.component.css'],
  template: 
  `<ng-container *ngIf="show && data">
    <tr *ngFor="let chunk of data.hChunks" [ngStyle]="{width: data.width + 'px', height: '25px'}">
      <horizontal-chunk #previousChunk class="previousChunk"></horizontal-chunk>
      <horizontal-chunk #currentChunk class="currentChunk"></horizontal-chunk>
      <horizontal-chunk #nextChunk class="nextChunk"></horizontal-chunk>
    </tr>
  </ng-container>`
})
export class VerticalChunkComponent implements OnInit {
  @Input() show: boolean;
  @Input() data: {
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
  };

  @ViewChildren('previousChunk') previousChunks: QueryList<HorizontalChunkComponent>; 
  @ViewChildren('currentChunk') currentChunks: QueryList<HorizontalChunkComponent>; 
  @ViewChildren('nextChunk') nextChunks: QueryList<HorizontalChunkComponent>; 

  constructor(public changeDet:ChangeDetectorRef, public element:ElementRef) {
    this.show = false;
  }

  ngOnInit() {
  }

  updateHorizontalChunk(chunkRefs: QueryList<HorizontalChunkComponent>, newChunkIndex) {
    var refsArray = chunkRefs.toArray();

    if(newChunkIndex == -1) {
      for(let i=0; i < refsArray.length; i++) {
        refsArray[i].show = false;
        refsArray[i].data = undefined;
        refsArray[i].changeDet.detectChanges();
      }
    } else {
      for(let i=0; i < refsArray.length; i++) {
        refsArray[i].show = true;
        refsArray[i].data = this.data.hChunks[i][newChunkIndex];
        refsArray[i].changeDet.detectChanges();
      }
    }
  }
}
