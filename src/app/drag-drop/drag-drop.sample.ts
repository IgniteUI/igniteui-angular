import { ChangeDetectorRef, Component, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { NgIf, NgClass, NgFor, NgStyle } from '@angular/common';

import { ShadowGridSampleComponent } from './shadow-dom-grid/shadow-grid-sample';
import { DragDirection, GlobalPositionStrategy, IDragBaseEventArgs, IDragStartEventArgs, IDropDroppedEventArgs, IgxButtonDirective, IgxDragDirective, IgxDragHandleDirective, IgxDragIgnoreDirective, IgxDragLocation, IgxDropDirective, IgxIconComponent, IgxInputDirective, IgxInputGroupComponent, IgxInsertDropStrategy, IgxLabelDirective, IgxPrefixDirective, IgxRippleDirective, IgxToggleDirective, NoOpScrollStrategy, OverlaySettings } from 'igniteui-angular';

@Component({
    selector: 'app-drag-drop-sample',
    templateUrl: './drag-drop.sample.html',
    styleUrls: ['drag-drop.sample.scss'],
    imports: [
        NgFor, NgIf, NgStyle, NgClass,
        IgxDragDirective, IgxDragIgnoreDirective, IgxDragHandleDirective, IgxDropDirective,
        IgxIconComponent, IgxButtonDirective, IgxRippleDirective, IgxToggleDirective,
        IgxInputGroupComponent, IgxPrefixDirective, IgxInputDirective, IgxLabelDirective,
        ShadowGridSampleComponent
    ]
})
export class DragDropSampleComponent {
    @ViewChild('dragNoGhostAnim', { read: IgxDragDirective, static: true })
    public dragNoGhostAnim: IgxDragDirective;

    @ViewChild('dragGhostAnim', { read: IgxDragDirective, static: true })
    public dragGhostAnim: IgxDragDirective;

    @ViewChild('dragGhostAnimHost', { read: IgxDragDirective, static: true })
    public dragGhostAnimHost: IgxDragDirective;

    @ViewChild('animationDuration')
    public animationDuration: ElementRef;

    @ViewChild('animationDelay')
    public animationDelay: ElementRef;

    @ViewChild('animationFunction')
    public animationFunction: ElementRef;

    @ViewChild('startX', { static: true })
    public startX: ElementRef;

    @ViewChild('startY', { static: true })
    public startY: ElementRef;

    @ViewChild('endX', { static: true })
    public endX: ElementRef;

    @ViewChild('endY', { static: true })
    public endY: ElementRef;

    @ViewChild('toggleForm', { static: true })
    public toggleForm: IgxToggleDirective;

    @ViewChild('toggleForm', { read: IgxDragDirective, static: true })
    public toggleFormDrag: IgxDragDirective;

    @ViewChild('toggleForm1', { static: true })
    public toggleForm1: IgxToggleDirective;

    @ViewChild('toggleForm', { read: IgxDragDirective, static: true })
    public toggleFormDrag1: IgxDragDirective;

    @ViewChildren('listItem', { read: IgxDragDirective })
    public listNotesDirs: QueryList<IgxDragDirective>;

    public dragDir = DragDirection.BOTH;
    public dropStrategy = IgxInsertDropStrategy;
    public draggedElem = false;
    public customDragged = false;
    public customDraggedScroll = false;
    public customDraggedAnim = false;
    public customDraggedAnimScroll = false;
    public customDraggedAnimXY = false;
    public customDraggedAnimHostXY = false;
    public ghostInDropArea = false;
    public friendlyArea = true;
    public draggingElem = false;
    public dragEnteredArea = false;
    public categoriesNotes = [
        { text: 'Action', dragged: false },
        { text: 'Fantasy', dragged: false },
        { text: 'Drama', dragged: false }
    ];
    public listNotes = [
        { text: 'Avengers: Endgame', category: 'Action', dragged: false },
        { text: 'Avatar', category: 'Fantasy', dragged: false },
        { text: 'Titanic', category: 'Drama', dragged: false },
        { text: 'Star Wars: The Force Awakens', category: 'Fantasy', dragged: false },
        { text: 'Avengers: Infinity War', category: 'Action', dragged: false },
        { text: 'Jurassic World', category: 'Fantasy', dragged: false },
        { text: 'The Avengers', category: 'Action', dragged: false }
    ];
    public listObserver = null;
    public draggableElems: {value: string; hide?: boolean}[] = [
        { value: 'Suspect 1' },
        { value: 'Suspect 2' },
        { value: 'Suspect 3' },
        { value: 'Suspect 4' }];

    public toggleStartPageX;
    public toggleStartPageY;

    // Multi selection row drag
    public sourceRows: any[] = Array.from(Array(10)).map((e, i) => {
        return {name: "Item " + i, selected: false}
    });
    public targetRows: any[] = [];
    public selectedRows: any[] = [];

    /** List drag properties */
    public draggedDir = null;
    public draggedIndex = null;
    public get newDraggedIndex() {
        if (this.draggedIndex === null) {
            return null;
        }

        const listNotesDirsArray = this.listNotesDirs.toArray();
        let firstMovedIndex = null;
        let lastMovedIndex = null;

        for (let i = 0; i < listNotesDirsArray.length; i++) {
            if (firstMovedIndex === null && listNotesDirsArray[i].data.moved) {
                firstMovedIndex = i;
            }
            if (listNotesDirsArray[i].data.moved) {
                lastMovedIndex = i;
            }
        }

        if (firstMovedIndex === null && lastMovedIndex === null) {
            return null;
        }
        return this.draggedIndex < firstMovedIndex ? lastMovedIndex : firstMovedIndex ;
    }

    private overlaySettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    constructor(private cdr: ChangeDetectorRef) {
    }

    public onDragStart() {
        this.draggingElem = true;
        this.cdr.detectChanges();
    }

    public onDragCageEnter() {
        this.dragEnteredArea = true;
    }

    public onDragCageLeave() {
        this.dragEnteredArea = false;
    }

    public onDragEnd(event: IDragBaseEventArgs) {
        this.draggingElem = false;
        this.cdr.detectChanges();
        event.owner.transitionToOrigin();
    }

    public enterCustomOutside(event) {
        if (event.drag.data.id === 'customGhost') {
            this.ghostInDropArea = true;
            this.friendlyArea = true;
        }
    }

    public enterCustomCage(event) {
        if (event.drag.data.id === 'customGhost') {
            this.ghostInDropArea = true;
            this.friendlyArea = false;
        }
    }

    public leaveCustom(event) {
        if (event.drag.data.id === 'customGhost') {
            this.ghostInDropArea = false;
        }
    }

    public openDialog() {
        this.toggleForm.open(this.overlaySettings);

        if (!this.toggleStartPageX && !this.toggleStartPageY) {
            this.toggleStartPageX = this.toggleFormDrag.pageX;
            this.toggleStartPageY = this.toggleFormDrag.pageY;
        }
        this.toggleFormDrag.setLocation(new IgxDragLocation(this.toggleStartPageX, this.toggleStartPageY));
    }

    public openOverlappingDialog() {
        const overlaySettings: OverlaySettings = {
            positionStrategy: new GlobalPositionStrategy(),
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: false
        };
        this.toggleForm1.open(overlaySettings);

        if (!this.toggleStartPageX && !this.toggleStartPageY) {
            this.toggleStartPageX = this.toggleFormDrag.pageX;
            this.toggleStartPageY = this.toggleFormDrag.pageY;
        }
        this.toggleFormDrag.setLocation(new IgxDragLocation(this.toggleStartPageX, this.toggleStartPageY));
    }

    public toOriginNoGhost() {
        const startX = this.startX.nativeElement.value;
        const startY = this.startY.nativeElement.value;
        const startLocation: IgxDragLocation = startX && startY ? new IgxDragLocation(startX, startY) : null ;
        this.dragNoGhostAnim.transitionToOrigin({
            duration: this.animationDuration.nativeElement.value,
            timingFunction: this.animationFunction.nativeElement.value,
            delay: this.animationDelay.nativeElement.value
        }, startLocation);
    }

    public toLocationNoGhost() {
        const startX = this.startX.nativeElement.value;
        const startY = this.startY.nativeElement.value;
        const startLocation: IgxDragLocation = startX && startY ? new IgxDragLocation(startX, startY) : null ;

        const endX = this.endX.nativeElement.value;
        const endY = this.endY.nativeElement.value;
        const endLocation: IgxDragLocation = endX && endY ? new IgxDragLocation(endX, endY) : null;

        this.dragNoGhostAnim.transitionTo(
            endLocation,
            {
                duration: this.animationDuration.nativeElement.value,
                timingFunction: this.animationFunction.nativeElement.value,
                delay: this.animationDelay.nativeElement.value
            },
             startLocation
        );
    }

    public dragGhostAnimOrigin(event) {
        event.owner.transitionToOrigin({
            duration: this.animationDuration.nativeElement.value,
            timingFunction: this.animationFunction.nativeElement.value,
            delay: this.animationDelay.nativeElement.value
        });
    }

    public dragGhostAnimXY() {

    }

    public toOriginGhost() {
        this.toOriginGhostImpl(this.dragGhostAnim);
    }

    public toLocationGhost() {
        this.toLocationGhostImpl(this.dragGhostAnim);
    }

    public toOriginGhostWithHost() {
        this.toOriginGhostImpl(this.dragGhostAnimHost);
    }

    public toLocationGhostWithHost() {
        this.toLocationGhostImpl(this.dragGhostAnimHost);
    }

    public toOriginGhostImpl(dragElem: IgxDragDirective) {
        const startX = this.startX.nativeElement.value;
        const startY = this.startY.nativeElement.value;
        const startLocation: IgxDragLocation = startX && startY ? new IgxDragLocation(startX, startY) : null ;
        dragElem.transitionToOrigin({
            duration: this.animationDuration.nativeElement.value,
            timingFunction: this.animationFunction.nativeElement.value,
            delay: this.animationDelay.nativeElement.value
        }, startLocation);
    }

    public toLocationGhostImpl(dragElem: IgxDragDirective) {
        const startX = this.startX.nativeElement.value;
        const startY = this.startY.nativeElement.value;
        const startLocation: IgxDragLocation = startX && startY ? new IgxDragLocation(startX, startY) : null ;

        const endX = this.endX.nativeElement.value;
        const endY = this.endY.nativeElement.value;
        const endLocation: IgxDragLocation = endX && endY ? new IgxDragLocation(endX, endY) : null;

        dragElem.transitionTo(
            endLocation,
            {
                duration: this.animationDuration.nativeElement.value,
                timingFunction: this.animationFunction.nativeElement.value,
                delay: this.animationDelay.nativeElement.value
            },
             startLocation
        );
    }

    public listItemDragStart(event, item, dragIndex) {
        item.dragged = true;
        this.draggedIndex = dragIndex;
        this.draggedDir = event.owner;
    }

    public listItemDragEnd(event: IDragBaseEventArgs, item) {
        if (this.newDraggedIndex !== null) {
            const moveDown = this.newDraggedIndex > this.draggedIndex;
            const prefix = moveDown ? 1 : -1;

            item.dragged = true;
            const originLocation = event.owner.originLocation;
            event.owner.transitionTo(new IgxDragLocation(
                originLocation.pageX,
                originLocation.pageY + prefix * Math.abs(this.newDraggedIndex - this.draggedIndex) * 68
            ), { duration: this.animationDuration.nativeElement.value });
        } else {
            event.owner.transitionToOrigin({ duration: this.animationDuration.nativeElement.value });
        }
    }

    public litsItemTransitioned(event, item, itemIndex) {
        if (itemIndex === this.draggedIndex && this.newDraggedIndex != null) {
            this.shiftElements(this.draggedIndex, this.newDraggedIndex);
            event.owner.setLocation(event.owner.originLocation);
            this.draggedIndex = null;
            this.draggedDir = null;
        }
        item.dragged = false;
    }

    public listItemEnter(event, itemIndex) {
        const moveDown = this.draggedIndex < itemIndex;
        const listNotesDirsArray = this.listNotesDirs.toArray();

        if (moveDown && !listNotesDirsArray[itemIndex].data.moved) {
            const itemsToMove = listNotesDirsArray.slice(this.draggedIndex + 1, itemIndex + 1);
            itemsToMove.forEach((item, index) => {
                if (!item.data.moved) {
                    const currentLocation = item.location;
                    const previousItemHeight = listNotesDirsArray[this.draggedIndex + index].element.nativeElement.offsetHeight;
                    item.transitionTo(new IgxDragLocation(currentLocation.pageX, currentLocation.pageY - previousItemHeight),
                        { duration: this.animationDuration.nativeElement.value });
                    item.data.moved = true;
                }
            });

            const itemsAbove = listNotesDirsArray.slice(0, this.draggedIndex);
            itemsAbove.forEach((item) => {
                if (item.data.moved) {
                    item.transitionToOrigin({ duration: this.animationDuration.nativeElement.value });
                    item.data.moved = false;
                }
            });
        } else if (moveDown && listNotesDirsArray[itemIndex].data.moved) {
            const restBellow = listNotesDirsArray.slice(itemIndex);
            restBellow.forEach((item) => {
                if (item.data.moved) {
                    item.transitionToOrigin({ duration: this.animationDuration.nativeElement.value });
                    item.data.moved = false;
                }
            });
        } else if (!listNotesDirsArray[itemIndex].data.moved) {
            const itemsToMove = listNotesDirsArray.slice(itemIndex , this.draggedIndex);
            itemsToMove.forEach((item, index) => {
                if (!item.data.moved) {
                    const currentLocation = item.location;
                    const previousItemHeight = listNotesDirsArray[itemIndex + index].element.nativeElement.offsetHeight;
                    item.transitionTo(new IgxDragLocation(currentLocation.pageX, currentLocation.pageY + previousItemHeight),
                        { duration: this.animationDuration.nativeElement.value });
                    item.data.moved = true;
                }
            });

            const itemsBelow = listNotesDirsArray.slice(this.draggedIndex + 1);
            itemsBelow.forEach((item) => {
                if (item.data.moved) {
                    item.transitionToOrigin({ duration: this.animationDuration.nativeElement.value });
                    item.data.moved = false;
                }
            });
        } else {
            const restAbove = listNotesDirsArray.slice(0, itemIndex + 1);
            restAbove.forEach((item) => {
                if (item.data.moved) {
                    item.transitionToOrigin({ duration: this.animationDuration.nativeElement.value });
                    item.data.moved = false;
                }
            });
        }
    }

    public listItemOver(event, itemIndex) {
        const moveDown = itemIndex > this.draggedIndex;
        const itemDragDir = this.listNotesDirs.toArray()[itemIndex];

        if (itemDragDir.animInProgress) {
            return;
        }

        if (itemDragDir.data.moved) {
            itemDragDir.data.moved = false;
            itemDragDir.transitionToOrigin({ duration: this.animationDuration.nativeElement.value });
        } else {
            const currentLocation = itemDragDir.location;
            let nextLocation;
            if (moveDown) {
                nextLocation = -1 * this.listNotesDirs.toArray()[itemIndex - 1].element.nativeElement.offsetHeight;
            } else {
                nextLocation = this.listNotesDirs.toArray()[itemIndex + 1].element.nativeElement.offsetHeight;
            }
            itemDragDir.transitionTo(new IgxDragLocation(currentLocation.pageX, currentLocation.pageY + nextLocation),
                { duration: this.animationDuration.nativeElement.value });
            itemDragDir.data.moved = true;
        }
    }

    public shiftElements(draggedIndex, targetIndex) {
        const movedElem = this.listNotes.splice(draggedIndex, 1);
        this.listNotes.splice(targetIndex, 0, movedElem[0]);

        this.listNotesDirs.forEach((dir) => {
            if (this.listNotes[targetIndex].text !== dir.data.id) {
                dir.setLocation(dir.originLocation);
                dir.data.moved = false;
            }
        });
    }

    public dragClick() {
        console.log('click');
    }

    public onDragMove(e) {
        const deltaX = e.nextPageX - e.pageX;
        const deltaY = e.nextPageY - e.pageY;
        e.cancel = true;
        this.toggleForm.setOffset(deltaX, deltaY);
      }

    public onItemDropped(event: IDropDroppedEventArgs) {
      const dropDivArea: HTMLElement = event.owner.element.nativeElement;
      const draggedEl = event.drag.element.nativeElement;
      dropDivArea.appendChild(draggedEl);
      event.cancel = true;
    }

    public getCategoryMovies(inCategory: string){
        return this.listNotes.filter(item => item.category === inCategory);
    }


    // Multi selection row drag
    public rowClicked(event: MouseEvent): void {
        const target = event.target as Element;
        const clickedCardId = target?.id;
        const index = this.sourceRows.findIndex((item) => item.name === clickedCardId);
        if(index < 0) return;
        this.sourceRows[index].selected = !this.sourceRows[index].selected;
    }

    public dragStartHandler(event: IDragStartEventArgs) {
        const dragItemId = event.owner.element.nativeElement.id;
        if(dragItemId !== undefined){
          const index = this.sourceRows.findIndex((item) => item.name === dragItemId);
          if(index >= 0) this.sourceRows[index].selected = true;
        }

        this.selectedRows = this.sourceRows.filter(item => item.selected).map((item) => {
            return {name: item.name, selected: false}
        });
    }

    public onSelectRowDropped() {
        if(this.selectedRows.length === 0) return;
        this.selectedRows.forEach(clickedCard => {
          const dragItemIndexInFromArray = this.sourceRows.findIndex((item) => item.name === clickedCard.name);
          this.sourceRows.splice(dragItemIndexInFromArray, 1);
        });
        this.targetRows.push(...this.selectedRows);
        console.log(this.targetRows);

        this.selectedRows = [];
    }
}
