import { Component, Input, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy, OnInit, ElementRef, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { VirtualRowHost } from './virtual.row.host.directive';
import { VirtualVericalItemComponent } from './virtual.vertical.item.component';
import { Observable } from "rxjs/Rx";
import {IVirtualizationState} from "./virtualization-state.interface"
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'igx-virtual-container',
  template: `
                <span [style.display]="isLoading ? 'block' : 'none'" [style.top]="top" [style.left]="left" class="loader" >Loading...</span>
                <ng-template virtual-row-host>
                </ng-template>                
            `,
            styles:[
                `.loader
                {
                    position: absolute;
                    background: #ec6f74;
                }`
]
})
export class VirtualContainerComponent implements AfterViewInit, OnDestroy, OnInit, OnChanges {
@Input() public options: any;
@Input()  public data:any;
@Output() loadRemoteChunk = new EventEmitter<IVirtualizationState>();

localChunkData:any;
isLoading:any;
private _localCache:any;
state:IVirtualizationState;

startHorIndex:number;
endHorIndex:number;
top:string;
left:string;

height:number;
width:number;
public totalRowCount:number;

topPortionHeight:any;
bottomPortionHeight:any
emptyVertItemTop:any;
emptyVertItemBottom:any;
visibleVerticalItemsCount:number; 
visibleHorizontalItemsCount:number;
prevScrTop:number;
prevScrLeft:number;
currColumns:number;

initialLoad:boolean;

constructor(private componentFactoryResolver: ComponentFactoryResolver, private elemRef: ElementRef, private ref: ChangeDetectorRef) { }

@ViewChild(VirtualRowHost) rowsHost: VirtualRowHost;
 ngOnInit() {
      this.state ={
          chunkStartIndex:0,
          chunkEndIndex:0
      };
      this.attachEventHandlers();

      this.width = this.options.width;
      var containerElem = this.elemRef.nativeElement.parentElement;
      this.prevScrTop = 0;
      this.prevScrLeft = 0;

      this.visibleVerticalItemsCount = (containerElem.clientHeight/this.options.verticalItemHeight) * 2;
      this.visibleHorizontalItemsCount = (containerElem.clientWidth/this.options.horizontalItemWidth) * 2;

      this.state.chunkStartIndex = 0;
      this.state.chunkEndIndex =  this.state.chunkStartIndex + this.visibleVerticalItemsCount;   

      this.startHorIndex = 0;
      this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;      

      if(this.data instanceof Array){
          this.state.metadata.totalRecordsCount = this.data.length;
      }

    var bounds =  containerElem.getBoundingClientRect();
    var top = bounds.top + bounds.height/2;
    var left =  bounds.left;
    this.top = top + "px";
    this.left = left/2 + "px";
    this.isLoading = true;
    this.ref.detectChanges();
 }
 ngOnChanges(changes: SimpleChanges) {
     if(changes["data"] && this.state){
         this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, false);
     }

 }
 ngDoCheck(){
     if(!this.isLoading){
        var containerElem = this.elemRef.nativeElement.parentElement;
        var scrTop = containerElem.scrollTop;
        var scrLeft = containerElem.scrollLeft;
        if(scrTop !== this.prevScrTop){
            this.scroll();
        }
      }
     
 }
  ngAfterViewInit() {
    this.initialLoad = true;
    this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, false);
    if(this.data instanceof Observable) {
        this.data.subscribe(value => {    
            //this.state.metadata.totalRecordsCount = this.state.metadata ?  this.state.metadata.totalRecordsCount: this.state.metadata.totalRecordsCount;
            this.localChunkData = value;
            this.isLoading = false;
            this.ref.detectChanges();
            this.loadItems(this.state.chunkStartIndex,  this.state.chunkEndIndex, false);        
        });
    }    
  }
   ngOnDestroy() {
   }
   attachEventHandlers(){
       var containerElem = this.elemRef.nativeElement.parentElement;
       var that = this;
        containerElem.addEventListener('scroll', function(evt){         
            if(!that.isLoading){ 
               that.scroll.apply(that);
            }
        });
   }
   scroll(){

      var containerElem = this.elemRef.nativeElement.parentElement;
      var scrTop = containerElem.scrollTop;
      var scrLeft = containerElem.scrollLeft;
      if(scrTop !== this.prevScrTop){
          //Handle vertical scroll
            var top = this.emptyVertItemTop.instance.height;
            var bottom = top + (this.visibleVerticalItemsCount *this.options.verticalItemHeight);    
            if(Math.abs(this.prevScrTop - scrTop) > containerElem.clientHeight){
                //if large scroll then get some page
                //calculate percentage
                var percentage = scrTop/containerElem.scrollHeight *100;
                this.loadVerticalChunkAt(percentage);            
            } else if(scrTop + containerElem.clientHeight > bottom){          
                this.loadNextVerticalChunk();
            } else if(scrTop < top) {
                this.loadPreviousVerticalChunk();
            }
            this.prevScrTop = scrTop;
      }

      if(scrLeft !== this.prevScrLeft){
        //handle horizontal scroll       
        var leftEdge = this.startHorIndex * this.options.horizontalItemWidth;
        var rightEdge = leftEdge + (this.visibleHorizontalItemsCount *this.options.horizontalItemWidth);

         if(Math.abs(this.prevScrLeft - scrLeft) > containerElem.clientWidth){
             //if large scroll then get some page
             //calculate percentage
             var percentage = scrLeft/containerElem.scrollWidth *100;
              this.loadHorizontalChunkAt(percentage);
         } else if(scrLeft + containerElem.clientWidth > rightEdge){
            this.loadNextHorizontalChunk();
        } else if(scrLeft < leftEdge) {
            this.loadPrevHorizontalChunk();
        }
          this.prevScrLeft = scrLeft;
      }

   }

   loadNextVerticalChunk(){
       this.state.chunkStartIndex = this.state.chunkStartIndex + this.visibleVerticalItemsCount/2;
       this.state.chunkEndIndex = this.state.chunkStartIndex + this.visibleVerticalItemsCount;
       this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, false);
   }

    loadPreviousVerticalChunk(){
       this.state.chunkStartIndex = this.state.chunkStartIndex - this.visibleVerticalItemsCount/2;
       this.state.chunkEndIndex = this.state.chunkStartIndex + this.visibleVerticalItemsCount;
       this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, false);
   }

   loadVerticalChunkAt(percentage){
        this.state.chunkStartIndex = parseInt((this.state.metadata.totalRecordsCount * percentage/100).toFixed(0));
        this.state.chunkEndIndex = this.state.chunkStartIndex + this.visibleVerticalItemsCount;
        this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, false);
   }
   
   loadHorizontalChunkAt(percentage){
       var start = parseInt((this.options.columns.length * percentage/100).toFixed(0))
       this.startHorIndex = start > 0 ? start : 0;
       this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;
        //console.log("Start:" +this.startHorIndex + ", End: "+ this.endHorIndex );
        this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, true);
   }

    loadNextHorizontalChunk(){
        this.startHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount/2;
        this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;
        //console.log("Start:" +this.startHorIndex + ", End: "+ this.endHorIndex );
        this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, true);
    }

    loadPrevHorizontalChunk(){
        var start = this.startHorIndex - this.visibleHorizontalItemsCount/2;
        this.startHorIndex = start > 0 ? start : 0;
        this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;
        //console.log("Start:" +this.startHorIndex + ", End: "+ this.endHorIndex );
        this.loadItems(this.state.chunkStartIndex, this.state.chunkEndIndex, true);
    }
   
   loadItems(start, end, isHorizontal){

       var data, that = this;
       if(start === undefined || start === null ){
           return;
       }
       if(start < 0){
           start = 0;
       }
       
       if(!isHorizontal)
       {
            if(this.data instanceof Array) {
               this.state.metadata.totalRecordsCount = this.data.length;
               data = this.data.slice(start, end);
            } else if(this.localChunkData){
                data = this.localChunkData;
                this.localChunkData = null;
            } else {
                if(this.isLoading && !this.initialLoad){        
                    return;
                }
                this.initialLoad = false;
                  //trigger event
                  this.state.chunkStartIndex = start;
                  this.state.chunkEndIndex= end;
                  this.isLoading = true;
                  this.ref.detectChanges();                  

                  this.loadRemoteChunk.emit(this.state);
                  return;
            }
       } else {
           data = this._localCache;
       }
       
       if(data.length === 0){
           return;
       }
       this._localCache = data;
       this.topPortionHeight = this.state.chunkStartIndex * this.options.verticalItemHeight;
       this.bottomPortionHeight = (this.state.metadata.totalRecordsCount -  this.state.chunkEndIndex) * this.options.verticalItemHeight;
      
       this.currColumns = this.options.columns.slice(this.startHorIndex, this.endHorIndex);

       var rowComponent = this.options.rowComponent;
       let componentFactory = this.componentFactoryResolver.resolveComponentFactory(rowComponent);

       //clear container
       let viewContainerRef = this.rowsHost.viewContainerRef;
       viewContainerRef.clear();

       
       //populate with empty horizontal items start/end with large widths
       this.populateEmptyHorizontalItems(this.currColumns);

        
       //create empty vertical items top/bottom with large height
       let emptyVertItemTopRef = viewContainerRef.createComponent(componentFactory); 
       (<VirtualVericalItemComponent>emptyVertItemTopRef.instance).rowData = [];
        (<VirtualVericalItemComponent>emptyVertItemTopRef.instance).columns = this.currColumns;
         (<VirtualVericalItemComponent>emptyVertItemTopRef.instance).height = this.topPortionHeight;
          
          this.emptyVertItemTop = emptyVertItemTopRef;
        for(var i = 0; i < data.length; i++){
            let componentRef = viewContainerRef.createComponent(componentFactory);  
            (<VirtualVericalItemComponent>componentRef.instance).rowData = data[i];
            (<VirtualVericalItemComponent>componentRef.instance).columns = this.currColumns;
            (<VirtualVericalItemComponent>componentRef.instance).height = this.options.verticalItemHeight;
        }

         let emptyVertItemBottomRef = viewContainerRef.createComponent(componentFactory);
        (<VirtualVericalItemComponent>emptyVertItemBottomRef.instance).rowData = [];
        (<VirtualVericalItemComponent>emptyVertItemBottomRef.instance).columns = this.currColumns;
        (<VirtualVericalItemComponent>emptyVertItemBottomRef.instance).height =  this.bottomPortionHeight;
        
        this.emptyVertItemBottom = emptyVertItemBottomRef;
      
        this.ref.detectChanges();
   }

   populateEmptyHorizontalItems(cols){
       for(var i = 0; i< cols.length; i++){
           if( !cols[i].width){
               cols[i].width = this.options.horizontalItemWidth;
           }
       } 
       var startWidth= this.startHorIndex * this.options.horizontalItemWidth;
       var startCol = { field: "emptyStart", width:  startWidth};
       cols.unshift(startCol);

       var endWidth = (this.options.columns.length - this.endHorIndex)* this.options.horizontalItemWidth;
       var endCol = { field: "emptyEnd", width:  endWidth};
       cols.push(endCol);
   }
}
