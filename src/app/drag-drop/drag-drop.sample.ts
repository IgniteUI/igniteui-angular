import { ChangeDetectorRef, Component, ViewChild, ElementRef } from '@angular/core';
import {
    OverlaySettings,
    GlobalPositionStrategy,
    NoOpScrollStrategy,
    IgxToggleDirective,
    IgxDragDirective,
    IgxInsertDropStrategy,
    IDragBaseEventArgs,
    IgxDragLocation
} from 'igniteui-angular';

@Component({
    selector: 'app-drag-drop-sample',
    templateUrl: './drag-drop.sample.html',
    styleUrls: ['drag-drop.sample.css']
})
export class DragDropSampleComponent {

    public dropStrategy = IgxInsertDropStrategy;
    public draggedElem = false;
    public customDragged = false;
    public customDraggedAnim = false;
    public customDraggedAnimXY = false;
    public ghostInDropArea = false;
    public friendlyArea = true;
    public draggingElem = false;
    public dragEnteredArea = false;
    public draggableElems = ['Suspect 1', 'Suspect 2', 'Suspect 3', 'Suspect 4'];

    public toggleStartPageX;
    public toggleStartPageY;
    private overlaySettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    @ViewChild('dragNoGhostAnim', { read: IgxDragDirective, static: true })
    public dragNoGhostAnim: IgxDragDirective;

    @ViewChild('dragGhostAnim', { read: IgxDragDirective, static: true })
    public dragGhostAnim: IgxDragDirective;

    @ViewChild('animationDuration', { static: false })
    public animationDuration: ElementRef;

    @ViewChild('animationDelay', { static: false })
    public animationDelay: ElementRef;

    @ViewChild('animationFunction', { static: false })
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

    public dragGhostAnimXY(event) {

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

    public dragClick(event) {
        console.log(event);
    }
}
