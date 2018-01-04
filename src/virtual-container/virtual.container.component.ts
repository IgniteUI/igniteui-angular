import { Component, Input, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { VirtualRowHost } from './virtual.row.host.directive';
import { VirtualVericalItemComponent } from './virtual.vertical.item.component';

@Component({
  selector: 'igx-virtual-container',
  template: `
                <ng-template virtual-row-host>
                </ng-template>
            `
})
export class VirtualContainerComponent implements AfterViewInit, OnDestroy, OnInit {
@Input() options: any;
startVertIndex:number;
endVertIndex:number;

startHorIndex:number;
endHorIndex:number;

height:number;
width:number;
totalRowCount:number;

topPortionHeight:any;
bottomPortionHeight:any
emptyVertItemTop:any;
emptyVertItemBottom:any;
visibleVerticalItemsCount:number; 
visibleHorizontalItemsCount:number;
prevScrTop:number;
prevScrLeft:number;
currColumns:number;

constructor(private componentFactoryResolver: ComponentFactoryResolver, private elemRef: ElementRef) { }

@ViewChild(VirtualRowHost) rowsHost: VirtualRowHost;
 ngOnInit() {
     this.attachEventHandlers();
 }
  ngAfterViewInit() {
      this.totalRowCount = this.options.data.length;
      this.width = this.options.width;
      var containerElem = this.elemRef.nativeElement.parentElement;
      this.prevScrTop = 0;
      this.prevScrLeft = 0;

      this.visibleVerticalItemsCount = (containerElem.clientHeight/this.options.verticalItemHeight) * 2;
      this.visibleHorizontalItemsCount = (containerElem.clientWidth/this.options.horizontalItemWidth) * 2;

      this.startVertIndex = 0;
      this.endVertIndex =  this.startVertIndex + this.visibleVerticalItemsCount;   

      this.startHorIndex = 0;
      this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;      

      this.loadItems(this.startVertIndex, this.endVertIndex);
  }
   ngOnDestroy() {
   }
   attachEventHandlers(){
       var containerElem = this.elemRef.nativeElement.parentElement;
       var that = this;
        containerElem.addEventListener('scroll', function(){
            that.scroll.apply(that);
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
       this.startVertIndex = this.startVertIndex + this.visibleVerticalItemsCount/2;
       this.endVertIndex = this.startVertIndex + this.visibleVerticalItemsCount;
       this.loadItems(this.startVertIndex, this.endVertIndex);
   }

    loadPreviousVerticalChunk(){
       this.startVertIndex = this.startVertIndex - this.visibleVerticalItemsCount/2;
       this.endVertIndex = this.startVertIndex + this.visibleVerticalItemsCount;
       this.loadItems(this.startVertIndex, this.endVertIndex);
   }

   loadVerticalChunkAt(percentage){
        this.startVertIndex = parseInt((this.totalRowCount * percentage/100).toFixed(0));
        this.endVertIndex = this.startVertIndex + this.visibleVerticalItemsCount;
        this.loadItems(this.startVertIndex, this.endVertIndex);
   }
   
   loadHorizontalChunkAt(percentage){
       var start = parseInt((this.options.columns.length * percentage/100).toFixed(0))
       this.startHorIndex = start > 0 ? start : 0;
       this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;
        //console.log("Start:" +this.startHorIndex + ", End: "+ this.endHorIndex );
        this.loadItems(this.startVertIndex, this.endVertIndex);
   }

    loadNextHorizontalChunk(){
        this.startHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount/2;
        this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;
        //console.log("Start:" +this.startHorIndex + ", End: "+ this.endHorIndex );
        this.loadItems(this.startVertIndex, this.endVertIndex);
    }

    loadPrevHorizontalChunk(){
        var start = this.startHorIndex - this.visibleHorizontalItemsCount/2;
        this.startHorIndex = start > 0 ? start : 0;
        this.endHorIndex = this.startHorIndex + this.visibleHorizontalItemsCount;
        //console.log("Start:" +this.startHorIndex + ", End: "+ this.endHorIndex );
        this.loadItems(this.startVertIndex, this.endVertIndex);
    }
   
   loadItems(start, end){
       this.topPortionHeight = this.startVertIndex * this.options.verticalItemHeight;
       this.bottomPortionHeight = (this.totalRowCount - end) * this.options.verticalItemHeight;

       //splice data
       var data = this.options.data.slice(start, end);
       this.currColumns = this.options.columns.slice(this.startHorIndex, this.endHorIndex);

       var rowComponent = this.options.rowComponent;
       let componentFactory = this.componentFactoryResolver.resolveComponentFactory(rowComponent);

       //clear container
       let viewContainerRef = this.rowsHost.viewContainerRef;
       viewContainerRef.clear();

       
       //populate with empty horizontal items start/end with large widths
       this.populateEmptyHorizontalItems(this.currColumns);

       //console.log("Cols:" + JSON.stringify(this.currColumns) );
       //create empty vertical items top/bottom with large height
       let emptyVertItemTopRef = viewContainerRef.createComponent(componentFactory); 
       (<VirtualVericalItemComponent>emptyVertItemTopRef.instance).rowData = [];
        (<VirtualVericalItemComponent>emptyVertItemTopRef.instance).columns = this.currColumns;
         (<VirtualVericalItemComponent>emptyVertItemTopRef.instance).height = this.topPortionHeight;
          emptyVertItemTopRef.changeDetectorRef.detectChanges();
          this.emptyVertItemTop = emptyVertItemTopRef;
        for(var i = 0; i < data.length; i++){
            let componentRef = viewContainerRef.createComponent(componentFactory);  
            (<VirtualVericalItemComponent>componentRef.instance).rowData = data[i];
            (<VirtualVericalItemComponent>componentRef.instance).columns = this.currColumns;
            (<VirtualVericalItemComponent>componentRef.instance).height = this.options.verticalItemHeight;
            componentRef.changeDetectorRef.detectChanges();
        }

         let emptyVertItemBottomRef = viewContainerRef.createComponent(componentFactory);
        (<VirtualVericalItemComponent>emptyVertItemBottomRef.instance).rowData = [];
        (<VirtualVericalItemComponent>emptyVertItemBottomRef.instance).columns = this.currColumns;
        (<VirtualVericalItemComponent>emptyVertItemBottomRef.instance).height =  this.bottomPortionHeight;
        emptyVertItemBottomRef.changeDetectorRef.detectChanges();
        this.emptyVertItemBottom = emptyVertItemBottomRef;
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
