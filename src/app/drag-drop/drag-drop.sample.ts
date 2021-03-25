import { ChangeDetectorRef, Component, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import {
    OverlaySettings,
    GlobalPositionStrategy,
    NoOpScrollStrategy,
    IgxToggleDirective,
    IgxDragDirective,
    IgxInsertDropStrategy,
    IDragBaseEventArgs,
    IgxDragLocation,
    DragDirection
} from 'igniteui-angular';

@Component({
    selector: 'app-drag-drop-sample',
    templateUrl: './drag-drop.sample.html',
    styleUrls: ['drag-drop.sample.css']
})
export class DragDropSampleComponent {
    @ViewChild('dragNoGhostAnim', { read: IgxDragDirective, static: true })
    public dragNoGhostAnim: IgxDragDirective;

    @ViewChild('dragGhostAnim', { read: IgxDragDirective, static: true })
    public dragGhostAnim: IgxDragDirective;

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

    @ViewChildren('listItem', { read: IgxDragDirective })
    public listNotesDirs: QueryList<IgxDragDirective>;

    public dragDir = DragDirection.BOTH;
    public dropStrategy = IgxInsertDropStrategy;
    public draggedElem = false;
    public customDragged = false;
    public customDraggedAnim = false;
    public customDraggedAnimXY = false;
    public ghostInDropArea = false;
    public friendlyArea = true;
    public draggingElem = false;
    public dragEnteredArea = false;
    public listNotes = [
        { text: 'Avengers: Endgame', dragged: false },
        { text: 'Avatar', dragged: false },
        { text: 'Titanic', dragged: false },
        { text: 'Star Wars: The Force Awakens', dragged: false },
        { text: 'Avengers: Infinity War', dragged: false },
        { text: 'Jurassic World', dragged: false },
        { text: 'The Avengers', dragged: false }
    ];
    public listObserver = null;
    public draggableElems: {value: string; hide?: boolean}[] = [
        { value: 'Suspect 1' },
        { value: 'Suspect 2' },
        { value: 'Suspect 3' },
        { value: 'Suspect 4' }];

    public toggleStartPageX;
    public toggleStartPageY;

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
        const startX = this.startX.nativeElement.value;
        const startY = this.startY.nativeElement.value;
        const startLocation: IgxDragLocation = startX && startY ? new IgxDragLocation(startX, startY) : null ;
        this.dragGhostAnim.transitionToOrigin({
            duration: this.animationDuration.nativeElement.value,
            timingFunction: this.animationFunction.nativeElement.value,
            delay: this.animationDelay.nativeElement.value
        }, startLocation);
    }

    public toLocationGhost() {
        const startX = this.startX.nativeElement.value;
        const startY = this.startY.nativeElement.value;
        const startLocation: IgxDragLocation = startX && startY ? new IgxDragLocation(startX, startY) : null ;

        const endX = this.endX.nativeElement.value;
        const endY = this.endY.nativeElement.value;
        const endLocation: IgxDragLocation = endX && endY ? new IgxDragLocation(endX, endY) : null;

        this.dragGhostAnim.transitionTo(
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
}
