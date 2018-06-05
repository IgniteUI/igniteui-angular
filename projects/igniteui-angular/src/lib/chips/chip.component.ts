import {
    Component,
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    Inject,
    NgModule,
    Output,
    Provider,
    ViewChild,
    OnInit,
    AfterContentInit,
    AfterViewInit
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';

@Component({
    selector: 'igx-chip',
    templateUrl: 'chip.component.html',
    styles: [
        `:host {
            display: flex;
            align-items: center;
            position: relative;
            transition-property: top, left;
            touch-action: none;
        }
        `
    ]
})
export class IgxChipComponent {

    @Input()
    public id;

    @Input()
    public removable = true;

    @HostBinding('style.top.px')
    public top = 0;

    @HostBinding('style.left.px')
    public left = 0;

    @HostBinding('style.transitionDuration')
    public transitionTime = '0.5s';

    @HostBinding('style.zIndex')
    public zIndex = 1;

    @Input()
    public set color(newColor) {
        this.chipArea.nativeElement.style.backgroundColor = newColor;
    }

    public get color() {
        return this.chipArea.nativeElement.style.backgroundColor;
    }

    @Output()
    public onOutOfAreaLeft = new EventEmitter<any>();

    @Output()
    public onOutOfAreaRight = new EventEmitter<any>();

    @Output()
    public onMoveStart = new EventEmitter<any>();

    @Output()
    public onMoveEnd = new EventEmitter<any>();

    @Output()
    public onInteractionStart = new EventEmitter<any>();

    @Output()
    public onInteractionEnd = new EventEmitter<any>();

    @Output()
    public onRemove = new EventEmitter<any>();

    @ViewChild('chipArea', { read: ElementRef })
    public chipArea: ElementRef;

    public defaultTransitionTime = '0.5s';
    public areaMovingPerforming = false;

    public get isFirstChip() {
        return !this.elementRef.nativeElement.previousElementSibling;
    }

    public get isLastChip() {
        return !this.elementRef.nativeElement.nextElementSibling;
    }

    private bInteracting = false;
    private bInteracted = false;
    private bMoved = false;
    private oldMouseX = 0;
    private oldMouseY = 0;
    private initialOffsetX = 0;
    private initialOffsetY = 0;
    private outEventEmmited = false;

    constructor(public cdr: ChangeDetectorRef,
                private elementRef: ElementRef) {
    }

    @HostListener('pointerdown', ['$event'])
    public onPointerDown(event) {
        this.elementRef.nativeElement.setPointerCapture(event.pointerId);
        this.bInteracting = true;
        this.bInteracted = true;
        this.oldMouseX = event.clientX;
        this.oldMouseY = event.clientY;
        this.initialOffsetX = event.offsetX;
        this.initialOffsetY = event.offsetY;
        this.transitionTime = '0s'; // transition time with 0s disables transition
        this.zIndex = 10;
        this.onInteractionStart.emit();
    }

    @HostListener('pointermove', ['$event'])
    public onPointerMove(event) {
        if (this.bInteracting) {
            const emitObject = {
                owner: this,
                isValid: false
            };
            if (!this.bMoved) {
                this.onMoveStart.emit();
            }

            const moveY = event.clientY - this.oldMouseY;
            const moveX = event.clientX - this.oldMouseX;
            if (moveX || moveY) {
                this.bMoved = true;
            }

            this.top += moveY;
            this.left += moveX;
            this.oldMouseX = event.clientX;
            this.oldMouseY = event.clientY;

            const curWidth = this.elementRef.nativeElement.offsetWidth;
            if (this.left >= curWidth / 2 && !this.outEventEmmited) {
                this.onOutOfAreaRight.emit(emitObject);
                this.outEventEmmited = true;
                if (emitObject.isValid) {
                    const nextElementWidth = this.elementRef.nativeElement.nextSibling.offsetWidth;
                    this.left = -1 * (nextElementWidth - Math.abs(this.left));
                }
            } else if (this.left <= (-1 * curWidth / 2) && !this.outEventEmmited) {
                this.onOutOfAreaLeft.emit(emitObject);
                this.outEventEmmited = true;
                if (emitObject.isValid) {
                    const prevElementWidth = this.elementRef.nativeElement.previousSibling.offsetWidth;
                    this.left = (prevElementWidth - Math.abs(this.left));
                }
            } else if (this.outEventEmmited && (-1 * curWidth / 2) < this.left && this.left <= curWidth / 2 ) {
                this.outEventEmmited = false;
            }
        }
    }

    @HostListener('pointerup', ['$event'])
    public onPointerUp(event) {
        this.bInteracting = false;
        this.transitionTime = this.defaultTransitionTime;
        this.top = 0;
        this.left = 0;

        this.onInteractionEnd.emit({
            owner: this,
            moved: this.bMoved
        });
        if (!this.bMoved) {
            this.zIndex = 1;
            this.onMoveEnd.emit();
        }
        this.bMoved = false;
    }

    @HostListener('transitionend', ['$event'])
    public onTransitionEnd(event) {
        if (!this.bInteracting && this.bInteracted) {
            // Fire once after the transition animation is complete when releasing the chip from dragging
            this.zIndex = 1;
            this.onMoveEnd.emit();
            this.bInteracted = false;
        }
    }

    public onChipRemove() {
        const eventData = {
            owner: this
        };
        this.onRemove.emit(eventData);
    }
}
