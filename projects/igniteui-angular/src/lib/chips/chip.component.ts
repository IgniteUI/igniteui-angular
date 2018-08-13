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
    AfterViewInit,
    Renderer2
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxDragDirective } from '../directives/dragdrop/dragdrop.directive';
import { DisplayDensity } from '../core/utils';

@Component({
    selector: 'igx-chip',
    templateUrl: 'chip.component.html'
})
export class IgxChipComponent implements AfterViewInit {

    /**
     * An @Input property that sets the value of `id` attribute.
     * ```html
     * <igx-chip [id]="'igx-chip-1'"></igx-chip>
     * ```
     */
    @Input()
    public id;

    /**
     * An @Input property that defines if the `IgxChipComponent` can be dragged in order to change it's position.
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true"></igx-chip>
     * ```
     */
    @Input()
    public draggable = false;

    /**
     * An @Input property that defines if the `IgxChipComponent` should render remove button and throw remove events.
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true" [removable]="true"></igx-chip>
     * ```
     */
    @Input()
    public removable = false;

    /**
     * An @Input property that defines if the `IgxChipComponent` can be selected on click or through navigation,
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="chip.id" [draggable]="true" [removable]="true" [selectable]="true"></igx-chip>
     * ```
     */
    @Input()
    public selectable = false;

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    get hostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-chip--cosy';
            case DisplayDensity.compact:
                return 'igx-chip--compact';
            default:
                return 'igx-chip';
        }
    }

    /**
     * An @Input property that defines if the `IgxChipComponent` is disabled.
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="chip.id" [disabled]="true"></igx-chip>
     * ```
     */
    @HostBinding('class.igx-chip--disabled')
    @Input()
    public disabled = false;

    /**
     * Returns the `IgxChipComponent` theme.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     *     ngAfterViewInit(){
     *     let chipTheme = this.chip.displayDensity;
     * }
     * ```
     */
    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    /**
     * An @Input property that sets the `IgxChipComponent` theme.
     * Available options are `compact`, `cosy`, `comfortable`.
     * The default theme is `comfortable`.
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [displayDensity]="'compact'"></igx-chip>
     * ```
     */
    public set displayDensity(val: DisplayDensity | string) {
        switch (val) {
            case 'compact':
                this._displayDensity = DisplayDensity.compact;
                break;
            case 'cosy':
                this._displayDensity = DisplayDensity.cosy;
                break;
            case 'comfortable':
            default:
                this._displayDensity = DisplayDensity.comfortable;
        }
    }

    /**
     * An @Input property that sets the `IgxChipComponent` background color.
     * The `color` property supports string, rgb, hex.
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [color]="'#ff0000'"></igx-chip>
     * ```
     */
    @Input()
    public set color(newColor) {
        this.chipArea.nativeElement.style.backgroundColor = newColor;
    }

    /**
     * Returns the background color of the `IgxChipComponent`.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * ngAfterViewInit(){
     *     let chipColor = this.chip.color;
     * }
     * ```
     */
    public get color() {
        return this.chipArea.nativeElement.style.backgroundColor;
    }

    /**
     * Emits event when the `IgxChipComponent` moving starts.
     * ```typescript
     * moveStarted(){
     *     alert("The moving has started.");
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onMoveStart)="moveStarted()">
     * ```
     */
    @Output()
    public onMoveStart = new EventEmitter<any>();

    /**
     * Emits event when the `IgxChipComponent` moving ends.
     * ```typescript
     * moveEnded(){
     *     alert("The moving has ended.");
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onMoveEnd)="moveEnded()">
     * ```
     */
    @Output()
    public onMoveEnd = new EventEmitter<any>();

    /**
     * Emits event when the `IgxChipComponent` is removed.
     * ```typescript
     * remove(){
     *     alert("The chip has been removed.");
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onRemove)="remove()">
     * ```
     */
    @Output()
    public onRemove = new EventEmitter<any>();

    /**
     * Emits event when the `IgxChipComponent` is clicked.
     * ```typescript
     * chipClick(){
     *     alert("The chip has been clicked.");
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onClick)="chipClick()">
     * ```
     */
    @Output()
    public onClick = new EventEmitter<any>();

    /**
     * Emits event when the `IgxChipComponent` is selected.
     * ```typescript
     * chipSelect(){
     *     alert("The chip has been selected.");
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onSelection)="chipSelect()">
     * ```
     */
    @Output()
    public onSelection = new EventEmitter<any>();

    /**
     * Emits event when the `IgxChipComponent` keyboard navigation is being used.
     * ```typescript
     * chipKeyDown(){
     *     alert("The chip keyboard navigation has been used.");
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onKeyDown)="chipKeyDown()">
     * ```
     */
    @Output()
    public onKeyDown = new EventEmitter<any>();

    /**
     * Emits event when the `IgxChipComponent` has entered the `IgxChipsAreaComponent`.
     * ```typescript
     * chipEnter(){
     *     alert("The chip has entered the chiparea.");
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onDragEnter)="chipEnter()">
     * ```
     */
    @Output()
    public onDragEnter = new EventEmitter<any>();

    /**
     * @hidden
     */
    @ViewChild('chipArea', { read: ElementRef })
    public chipArea: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('chipArea', { read: IgxDragDirective })
    public dragDir: IgxDragDirective;

    /**
     * @hidden
     */
    @ViewChild('removeBtn', { read: ElementRef })
    public removeBtn: ElementRef;

    /**
     * @hidden
     */
    public get ghostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-chip__ghost--cosy';
            case DisplayDensity.compact:
                return 'igx-chip__ghost--compact';
            default:
                return 'igx-chip__ghost';
        }
    }

    /**
     * Returns if the `IgxChipComponent` is selected.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * selectedChip(){
     *     let selectedChip = this.chip.selected;
     * }
     * ```
     */
    @Input()
    public get selected() {
        return this._selected;
    }

    /**
     * Sets the `IgxChipComponent` to be selected.
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [selectable]="true" [selected]="true">
     * ```
     */
    public set selected(newValue: boolean) {
        const onSelectArgs = {
            owner: this,
            nextStatus: false,
            cancel: false
        };
        if (newValue && this.selectable && !this._selected) {
            onSelectArgs.nextStatus = true;
            this.onSelection.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.addClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
            }
        } else if (!newValue && this._selected) {
            this.onSelection.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.removeClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
            }
        }
    }

    /**
     * Returns if the `IgxChipComponent` is the last one among its siblings.
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * ngAfterViewInit(){
     *     let lastChip = this.chip.isLastChip;
     * }
     * ```
     */
    public get isLastChip() {
        return !this.elementRef.nativeElement.nextElementSibling;
    }

    /**
     * @hidden
     */
    public chipTabindex = 0;
    public removeBtnTabindex = 0;
    public areaMovingPerforming = false;

    private _displayDensity = DisplayDensity.comfortable;
    private _selected = false;
    private _dragging = false;
    private _selectedItemClass = 'igx-chip__item--selected';
    private _movedWhileRemoving = false;

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2) { }

    /**
     * @hidden
     */
    ngAfterViewInit() {
        this.chipArea.nativeElement.addEventListener('keydown', (args) => {
            this.onChipKeyDown(args);
        });
        if (this.removable) {
            this.removeBtn.nativeElement.addEventListener('keydown', (args) => {
                this.onRemoveBtnKeyDown(args);
            });
        }
    }

    /**
     * @hidden
     */
    public onChipKeyDown(event) {
        const keyDownArgs = {
            owner: this,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            key: event.key,
            cancel: false
        };

        this.onKeyDown.emit(keyDownArgs);
        if (keyDownArgs.cancel) {
            return;
        }

        if ((event.key === 'Delete' || event.key === 'Del') && this.removable) {
            this.onRemove.emit({
                owner: this
            });
        }

        if ((event.key === ' ' || event.key === 'Spacebar') && this.selectable) {
            this.selected = !this.selected;
        }

        if (event.key !== 'Tab') {
            event.preventDefault();
        }
    }

    /**
     * @hidden
     */
    public onRemoveBtnKeyDown(event) {
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
            this.onRemove.emit({
                owner: this
            });

            event.preventDefault();
        }
    }

    /**
     * @hidden
     */
    public onChipRemove() {
        this.onRemove.emit({
            owner: this
        });
    }

    /**
     * @hidden
     */
    public onChipRemoveMove() {
        // We don't remove chip if user starting touch interacting on the remove button moves the chip
        this._movedWhileRemoving = true;
    }

    /**
     * @hidden
     */
    public onChipRemoveEnd() {
        if (!this._movedWhileRemoving) {
            this.onChipRemove();
        }
        this._movedWhileRemoving = false;
    }

    /**
     * @hidden
     */
    // -----------------------------
    // Start chip igxDrag behaviour
    public onChipDragStart(event) {
        this.onMoveStart.emit({
            owner: this
        });
        event.cancel = !this.draggable;
        this._dragging = true;
    }

    /**
     * @hidden
     */
    public onChipDragEnd(event) {
        this.dragDir.dropFinished();
        this._dragging = false;
    }

    /**
     * @hidden
     */
    public onChipMoveEnd(event) {
        // moveEnd is triggered after return animation has finished. This happen when we drag and release the chip.
        this.onMoveEnd.emit({
            owner: this
        });

        if (this.selected) {
            this.chipArea.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    public onChipDragClicked() {
        const clickEventArgs = {
            owner: this,
            cancel: false
        };
        this.onClick.emit(clickEventArgs);

        if (!clickEventArgs.cancel && this.selectable) {
            this.selected = !this.selected;
        }
    }
    // End chip igxDrag behaviour

    /**
     * @hidden
     */
    // -----------------------------
    // Start chip igxDrop behaviour
    public onChipDragEnterHandler(event) {
        if (this.dragDir === event.drag || !event.dragData || !event.dragData.chip) {
            return;
        }

        const eventArgs = {
            targetChip: this,
            dragChip: event.dragData.chip,
            detail: event
        };
        this.onDragEnter.emit(eventArgs);
    }

    /**
     * @hidden
     */
    public onChipDrop(event) {
        // Cancel the default drop logic
        event.cancel = true;
    }
    // End chip igxDrop behaviour
}
