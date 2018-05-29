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
            position: relative;
            display: inline-flex;
            transition-property: top, left;
            float: left;
            touch-action: none;
        }

        .prefix {
            display: inline-flex;
            margin: 1px;
            margin-right: 5px;
        }

        .chip-area {
            background-color: #f2f2f2;
            display: inline-flex;
            padding-left: 5px;
            padding-right: 5px;
            margin: 5px;
            border-radius: 15px;
            user-select: none;
            cursor: pointer;
        }

        .igx-button--icon {
            width: 1.5rem;
            height: 1.5rem;
            margin: 1px;
            margin-left: 5px;
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

    @Output()
    public onOutOfAreaLeft = new EventEmitter<any>();

    @Output()
    public onOutOfAreaRight = new EventEmitter<any>();

    @Output()
    public onMoveStart = new EventEmitter<any>();

    @Output()
    public onMoveEnd = new EventEmitter<any>();

    @Output()
    public onRemove = new EventEmitter<any>();

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
        this.onMoveStart.emit();
    }

    @HostListener('pointermove', ['$event'])
    public onPointerMove(event) {
        if (this.bInteracting) {
            const emitObject = {
                owner: this,
                isValid: false
            };

            this.bMoved = true;
            this.top += event.clientY - this.oldMouseY;
            this.left += event.clientX - this.oldMouseX;
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
            chip: this
        };
        this.onRemove.emit(eventData);
    }
}
