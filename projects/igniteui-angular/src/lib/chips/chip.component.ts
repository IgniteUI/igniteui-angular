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
import { IgxDragDirective } from '../directives/dragdrop/dragdrop.directive';
import { IgxDensityEnabledComponent } from '../core/density';

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
export class IgxChipComponent extends IgxDensityEnabledComponent {

    @Input()
    public id;

    @Input()
    public draggable = true;

    @Input()
    public removable = true;

    @HostBinding('class.igx-chip')
    public cssClass = 'igx-chip';

    @Input()
    public set color(newColor) {
        this.chipArea.nativeElement.style.backgroundColor = newColor;
    }

    public get color() {
        return this.chipArea.nativeElement.style.backgroundColor;
    }

    @Output()
    public onDragEnter = new EventEmitter<any>();

    @Output()
    public onMoveStart = new EventEmitter<any>();

    @Output()
    public onMoveEnd = new EventEmitter<any>();

    @Output()
    public onRemove = new EventEmitter<any>();

    @Output()
    public onClick = new EventEmitter<any>();

    @ViewChild('chipArea', { read: ElementRef })
    public chipArea: ElementRef;

    @ViewChild('chipArea', { read: IgxDragDirective })
    public dragDir: IgxDragDirective;

    public get isLastChip() {
        return !this.elementRef.nativeElement.nextElementSibling;
    }

    public areaMovingPerforming = false;

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef) {
        super();
    }

    protected get hostClassPrefix() {
        return 'igx-chip';
    }

    public onChipRemove() {
        this.onRemove.emit({
            owner: this
        });
    }

    // -----------------------------
    // Start chip igxDrag behaviour
    public onChipDragStart(event) {
        this.onMoveStart.emit({
            owner: this
        });
        event.cancel = !this.draggable;
    }

    public onChipDragEnd(event) {
        this.dragDir.dropFinished();
    }

    public onChipMoveEnd(event) {
        // moveEnd is triggered after return animation has finished. This happen when we drag and release the chip.
        this.onMoveEnd.emit({
            owner: this
        });
    }

    public onChipDragClicked() {
        this.onClick.emit({
            owner: this
        });
    }
    // End chip igxDrag behaviour

    // -----------------------------
    // Start chip igxDrop behaviour
    public onChipDragEnterHandler(event) {
        if (this.dragDir === event.drag) {
            return;
        }

        const eventArgs = {
            targetChip: this,
            dragChip: event.dragData.chip,
            detail: event
        };
        this.onDragEnter.emit(eventArgs);
    }

    public onChipDrop(event) {
        // Cancel the default drop logic
        event.cancel = true;
    }
    // End chip igxDrop behaviour
}
