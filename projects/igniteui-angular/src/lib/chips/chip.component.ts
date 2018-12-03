import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
    HostBinding,
    Input,
    Output,
    ViewChild,
    Renderer2,
    TemplateRef,
    Inject,
    Optional
} from '@angular/core';
import { DisplayDensity, IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../core/displayDensity';
import {
    IgxDragDirective,
    IDragBaseEventArgs,
    IDragStartEventArgs,
    IgxDropEnterEventArgs,
    IgxDropEventArgs
} from '../directives/dragdrop/dragdrop.directive';


export interface IBaseChipEventArgs {
    originalEvent: PointerEvent | MouseEvent | TouchEvent | KeyboardEvent | IgxDropEnterEventArgs;
    owner: IgxChipComponent;
}

export interface IChipClickEventArgs extends IBaseChipEventArgs {
    cancel: boolean;
}

export interface IChipKeyDownEventArgs extends IBaseChipEventArgs {
    originalEvent: KeyboardEvent;
    cancel: boolean;
}

export interface IChipEnterDragAreaEventArgs extends IBaseChipEventArgs {
    dragChip: IgxChipComponent;
}

export interface IChipSelectEventArgs extends IBaseChipEventArgs {
    cancel: boolean;
    selected: boolean;
}

let CHIP_ID = 0;

@Component({
    selector: 'igx-chip',
    templateUrl: 'chip.component.html'
})
export class IgxChipComponent extends DisplayDensityBase {

    /**
     * An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-chip [id]="'igx-chip-1'"></igx-chip>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-chip-${CHIP_ID++}`;

    /**
     * An @Input property that stores data related to the chip.
     * ```html
     * <igx-chip [data]="{ value: 'Country' }"></igx-chip>
     * ```
     */
    @Input()
    public data: any;

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
     * An @Input property that overrides the default icon that the chip applies to the remove button.
     * ```html
     * <igx-chip [id]="chip.id" [removable]="true" [removeIcon]="iconTemplate"></igx-chip>
     * <ng-template #iconTemplate><igx-icon>delete</igx-icon></ng-template>
     * ```
     */
    @Input()
    public removeIcon: TemplateRef<any>;

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
     * An @Input property that overrides the default icon that the chip applies when it is selected.
     * ```html
     * <igx-chip [id]="chip.id" [selectable]="true" [selectIcon]="iconTemplate"></igx-chip>
     * <ng-template #iconTemplate><igx-icon>done_outline</igx-icon></ng-template>
     * ```
     */
    @Input()
    public selectIcon: TemplateRef<any>;

    /**
     * @hidden
     */
    @Input()
    public class = '';

    /**
     * An @Input property that defines if the `IgxChipComponent` is disabled. When disabled it restricts user interactions
     * like focusing on click or tab, selection on click or Space, dragging.
     * By default it is set to false.
     * ```html
     * <igx-chip [id]="chip.id" [disabled]="true"></igx-chip>
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * Sets the `IgxChipComponent` selected state.
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [selectable]="true" [selected]="true">
     * ```
     */
    @Input()
    public set selected(newValue: boolean) {
        this.changeSelection(newValue);
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
    public get selected() {
        return this._selected;
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
     * Emits an event when the `IgxChipComponent` moving starts.
     * Returns the moving `IgxChipComponent`.
     * ```typescript
     * moveStarted(event: IBaseChipEventArgs){
     *     let movingChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onMoveStart)="moveStarted($event)">
     * ```
     */
    @Output()
    public onMoveStart = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` moving ends.
     * Returns the moved `IgxChipComponent`.
     * ```typescript
     * moveEnded(event: IBaseChipEventArgs){
     *     let movedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onMoveEnd)="moveEnded($event)">
     * ```
     */
    @Output()
    public onMoveEnd = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` is removed.
     * Returns the removed `IgxChipComponent`.
     * ```typescript
     * remove(event: IBaseChipEventArgs){
     *     let removedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onRemove)="remove($event)">
     * ```
     */
    @Output()
    public onRemove = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` is clicked.
     * Returns the clicked `IgxChipComponent`, whether the event should be canceled.
     * ```typescript
     * chipClick(event: IChipClickEventArgs){
     *     let clickedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onClick)="chipClick($event)">
     * ```
     */
    @Output()
    public onClick = new EventEmitter<IChipClickEventArgs>();

    /**
     * Emits event when the `IgxChipComponent` is selected/deselected.
     * Returns the selected chip reference, whether the event should be canceled, what is the next selection state and
     * when the event is triggered by interaction `originalEvent` is provided, otherwise `originalEvent` is `null`.
     * ```typescript
     * chipSelect(event: IChipSelectEventArgs){
     *     let selectedChip = event.owner;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onSelection)="chipSelect($event)">
     * ```
     */
    @Output()
    public onSelection = new EventEmitter<IChipSelectEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` keyboard navigation is being used.
     * Returns the focused/selected `IgxChipComponent`, whether the event should be canceled,
     * if the `alt`, `shift` or `control` key is pressed and the pressed key name.
     * ```typescript
     * chipKeyDown(event: IChipKeyDownEventArgs){
     *     let keyDown = event.key;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onKeyDown)="chipKeyDown($event)">
     * ```
     */
    @Output()
    public onKeyDown = new EventEmitter<IChipKeyDownEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` has entered the `IgxChipsAreaComponent`.
     * Returns the target `IgxChipComponent`, the drag `IgxChipComponent`, as  well as
     * the original drop event arguments.
     * ```typescript
     * chipEnter(event: IChipEnterDragAreaEventArgs){
     *     let targetChip = event.targetChip;
     * }
     * ```
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onDragEnter)="chipEnter($event)">
     * ```
     */
    @Output()
    public onDragEnter = new EventEmitter<IChipEnterDragAreaEventArgs>();

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    get hostClass(): string {
        const classes = [this.componentDensityClass('igx-chip')];
        classes.push(this.disabled ? 'igx-chip--disabled' : '');
        // The custom classes should be at the end.
        classes.push(this.class);
        return classes.join(' ');
    }

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
    @ViewChild('defaultRemoveIcon', { read: TemplateRef })
    public defaultRemoveIcon: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultSelectIcon', { read: TemplateRef })
    public defaultSelectIcon: TemplateRef<any>;

    /**
     * @hidden
     */
    public get removeButtonTemplate() {
        return this.removeIcon || this.defaultRemoveIcon;
    }

    /**
     * @hidden
     */
    public get selectIconTemplate() {
        return this.selectIcon || this.defaultSelectIcon;
    }

    /**
     * @hidden
     */
    public get ghostClass(): string {
        return this.componentDensityClass('igx-chip__ghost');
    }

    public get chipTabindex() {
        return !this.disabled ? 0 : '';
    }

    protected _selected = false;
    protected _selectedItemClass = 'igx-chip__item--selected';
    protected _movedWhileRemoving = false;

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
            super(_displayDensityOptions);
        }

    /**
     * @hidden
     */
    public selectClass(condition: boolean): object {
        const SELECT_CLASS = 'igx-chip__select';

        return {
            [SELECT_CLASS]: condition,
            [`${SELECT_CLASS}--hidden`]: !condition
        };
    }

    protected changeSelection(newValue: boolean, srcEvent = null) {
        const onSelectArgs: IChipSelectEventArgs = {
            originalEvent: srcEvent,
            owner: this,
            selected: false,
            cancel: false
        };

        if (newValue && !this._selected) {
            onSelectArgs.selected = true;
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
     * @hidden
     */
    public onChipKeyDown(event: KeyboardEvent) {
        const keyDownArgs: IChipKeyDownEventArgs = {
            originalEvent: event,
            owner: this,
            cancel: false
        };

        this.onKeyDown.emit(keyDownArgs);
        if (keyDownArgs.cancel) {
            return;
        }

        if ((event.key === 'Delete' || event.key === 'Del') && this.removable) {
            this.onRemove.emit({
                originalEvent: event,
                owner: this
            });
        }

        if ((event.key === ' ' || event.key === 'Spacebar') && this.selectable && !this.disabled) {
            this.changeSelection(!this.selected, event);
        }

        if (event.key !== 'Tab') {
            event.preventDefault();
        }
    }

    /**
     * @hidden
     */
    public onRemoveBtnKeyDown(event: KeyboardEvent) {
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
            this.onRemove.emit({
                originalEvent: event,
                owner: this
            });

            event.preventDefault();
            event.stopPropagation();
        }
    }

    public onRemoveMouseDown(event: PointerEvent | MouseEvent) {
        event.stopPropagation();
    }

    /**
     * @hidden
     */
    public onRemoveClick(event: MouseEvent | TouchEvent) {
        this.onRemove.emit({
            originalEvent: event,
            owner: this
        });
    }

    /**
     * @hidden
     */
    public onRemoveTouchMove() {
        // We don't remove chip if user starting touch interacting on the remove button moves the chip
        this._movedWhileRemoving = true;
    }

    /**
     * @hidden
     */
    public onRemoveTouchEnd(event: TouchEvent) {
        if (!this._movedWhileRemoving) {
            this.onRemoveClick(event);
        }
        this._movedWhileRemoving = false;
    }

    /**
     * @hidden
     */
    // -----------------------------
    // Start chip igxDrag behaviour
    public onChipDragStart(event: IDragStartEventArgs) {
        this.onMoveStart.emit({
            originalEvent: event.originalEvent,
            owner: this
        });
        event.cancel = !this.draggable || this.disabled;
    }

    /**
     * @hidden
     */
    public onChipDragEnd() {
        this.dragDir.dropFinished();
    }

    /**
     * @hidden
     */
    public onChipMoveEnd(event: IDragBaseEventArgs) {
        // moveEnd is triggered after return animation has finished. This happen when we drag and release the chip.
        this.onMoveEnd.emit({
            originalEvent: event.originalEvent,
            owner: this
        });

        if (this.selected) {
            this.chipArea.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    public onChipDragClicked(event: IDragBaseEventArgs) {
        const clickEventArgs: IChipClickEventArgs = {
            originalEvent: event.originalEvent,
            owner: this,
            cancel: false
        };
        this.onClick.emit(clickEventArgs);

        if (!clickEventArgs.cancel && this.selectable && !this.disabled) {
            this.changeSelection(!this.selected, event.originalEvent);
        }
    }
    // End chip igxDrag behaviour

    /**
     * @hidden
     */
    // -----------------------------
    // Start chip igxDrop behaviour
    public onChipDragEnterHandler(event: IgxDropEnterEventArgs) {
        if (this.dragDir === event.drag || !event.dragData || !event.dragData.chip) {
            return;
        }

        const eventArgs: IChipEnterDragAreaEventArgs = {
            owner: this,
            dragChip: event.dragData.chip,
            originalEvent: event
        };
        this.onDragEnter.emit(eventArgs);
    }

    /**
     * @hidden
     */
    public onChipDrop(event: IgxDropEventArgs) {
        // Cancel the default drop logic
        event.cancel = true;
    }
    // End chip igxDrop behaviour
}
