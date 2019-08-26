import {
    Component,
    ContentChildren,
    ChangeDetectorRef,
    EventEmitter,
    HostBinding,
    Input,
    IterableDiffer,
    IterableDiffers,
    Output,
    QueryList,
    DoCheck,
    AfterViewInit,
    OnDestroy,
    ElementRef
} from '@angular/core';
import {
    IgxChipComponent,
    IChipSelectEventArgs,
    IChipKeyDownEventArgs,
    IChipEnterDragAreaEventArgs,
    IBaseChipEventArgs
} from './chip.component';
import { IDropBaseEventArgs } from '../directives/drag-drop/drag-drop.directive';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';

export interface IBaseChipsAreaEventArgs {
    originalEvent: PointerEvent | MouseEvent | TouchEvent | KeyboardEvent | IDropBaseEventArgs;
    owner: IgxChipsAreaComponent;
}

export interface IChipsAreaReorderEventArgs extends IBaseChipsAreaEventArgs {
    chipsArray: IgxChipComponent[];
}

export interface IChipsAreaSelectEventArgs extends IBaseChipsAreaEventArgs {
    newSelection: IgxChipComponent[];
}

@Component({
    selector: 'igx-chips-area',
    templateUrl: 'chips-area.component.html',
})
export class IgxChipsAreaComponent implements DoCheck, AfterViewInit, OnDestroy {

    /**
     * @hidden
     */
    @Input()
    public class = '';

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    get hostClass() {
        const classes = ['igx-chip-area'];
        classes.push(this.class);

        return classes.join(' ');
    }

    /**
     * An @Input property that sets the width of the `IgxChipsAreaComponent`.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="chipsOrderChanged($event)"></igx-chips-area>
     * ```
     */
    @HostBinding('style.width.px')
    @Input()
    public width: number;

    /**
     * An @Input property that sets the height of the `IgxChipsAreaComponent`.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="chipsOrderChanged($event)"></igx-chips-area>
     * ```
     */
    @HostBinding('style.height.px')
    @Input()
    public height: number;

    /**
     * Emits an event when `IgxChipComponent`s in the `IgxChipsAreaComponent` should be reordered.
     * Returns an array of `IgxChipComponent`s.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="changedOrder($event)"></igx-chips-area>
     * ```
     * ```typescript
     * public changedOrder(event: IChipsAreaReorderEventArgs){
     *      let chips: IgxChipComponent[] = event.chipsArray;
     * }
     * ```
     */
    @Output()
    public onReorder = new EventEmitter<IChipsAreaReorderEventArgs>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is selected/deselected.
     * Fired after the chips area is initialized if there are initially selected chips as well.
     * Returns an array of selected `IgxChipComponent`s and the `IgxChipAreaComponent`.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onSelection)="selection($event)"></igx-chips-area>
     * ```
     * ```typescript
     * public selection(event: IChipsAreaSelectEventArgs){
     *      let selectedChips: IgxChipComponent[] = event.newSelection;
     * }
     */
    @Output()
    public onSelection = new EventEmitter<IChipsAreaSelectEventArgs>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onMoveStart)="moveStart($event)"></igx-chips-area>
     * ```
     * ```typescript
     * moveStart(event: IBaseChipsAreaEventArgs){
     *      let chipArea = event.owner;
     * }
     * ```
     */
    @Output()
    public onMoveStart = new EventEmitter<IBaseChipsAreaEventArgs>();

    /**
     * Emits an event after an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onMoveEnd)="moveEnd($event)"></igx-chips-area>
     * ```
     * ```typescript
     * moveEnd(event: IBaseChipsAreaEventArgs){
     *      let chipArea = event.owner;
     * }
     * ```
     */
    @Output()
    public onMoveEnd = new EventEmitter<IBaseChipsAreaEventArgs>();

    /**
     * Holds the `IgxChipComponent` in the `IgxChipsAreaComponent`.
     * ```typescript
     * ngAfterViewInit(){
     *    let chips = this.chipsArea.chipsList;
     * }
     * ```
     */
    @ContentChildren(IgxChipComponent)
    public chipsList: QueryList<IgxChipComponent>;

    private modifiedChipsArray: IgxChipComponent[];
    private _differ: IterableDiffer<IgxChipComponent> | null = null;
    private selectedChips: IgxChipComponent[] = [];
    protected destroy$ = new Subject<boolean>();

    constructor(public cdr: ChangeDetectorRef, public element: ElementRef,
        private _iterableDiffers: IterableDiffers) {
        this._differ = this._iterableDiffers.find([]).create(null);
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        // If we have initially selected chips through their inputs, we need to get them, because we cannot listen to their events yet.
        if (this.chipsList.length) {
            this.selectedChips = this.chipsList.filter((item: IgxChipComponent) => item.selected);
            if (this.selectedChips.length) {
                this.onSelection.emit({
                    originalEvent: null,
                    newSelection: this.selectedChips,
                    owner: this
                });
            }
        }
    }

    /**
     * @hidden
     */
    public ngDoCheck(): void {
        if (this.chipsList) {
            const changes = this._differ.diff(this.chipsList.toArray());
            if (changes) {
                changes.forEachAddedItem((addedChip) => {
                    addedChip.item.onMoveStart.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipMoveStart(args);
                    });
                    addedChip.item.onMoveEnd.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipMoveEnd(args);
                    });
                    addedChip.item.onDragEnter.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipDragEnter(args);
                    });
                    addedChip.item.onKeyDown.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipKeyDown(args);
                    });
                    if (addedChip.item.selectable) {
                        addedChip.item.onSelection.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                            this.onChipSelectionChange(args);
                        });
                    }
                });
                this.modifiedChipsArray = this.chipsList.toArray();
            }
        }
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     */
    protected onChipKeyDown(event: IChipKeyDownEventArgs) {
        let orderChanged = false;
        const chipsArray = this.chipsList.toArray();
        const dragChipIndex = chipsArray.findIndex((el) => el === event.owner);
        if (event.originalEvent.shiftKey === true) {
            if (event.originalEvent.key === 'ArrowLeft' || event.originalEvent.key === 'Left') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex - 1, false, event.originalEvent);
                if (orderChanged) {
                    setTimeout(() => {
                        this.chipsList.toArray()[dragChipIndex - 1].chipArea.nativeElement.focus();
                    });
                }
            } else if (event.originalEvent.key === 'ArrowRight' || event.originalEvent.key === 'Right') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex + 1, true, event.originalEvent);
            }
        } else {
            if ((event.originalEvent.key === 'ArrowLeft' || event.originalEvent.key === 'Left') && dragChipIndex > 0) {
                chipsArray[dragChipIndex - 1].chipArea.nativeElement.focus();
            } else if ((event.originalEvent.key === 'ArrowRight' || event.originalEvent.key === 'Right') &&
                dragChipIndex < chipsArray.length - 1) {
                chipsArray[dragChipIndex + 1].chipArea.nativeElement.focus();
            }
        }
    }

    /**
     * @hidden
     */
    protected onChipMoveStart(event: IBaseChipEventArgs) {
        this.onMoveStart.emit({
            originalEvent: event.originalEvent,
            owner: this
        });
    }

    /**
     * @hidden
     */
    protected onChipMoveEnd(event: IBaseChipEventArgs) {
        this.onMoveEnd.emit({
            originalEvent: event.originalEvent,
            owner: this
        });
    }

    /**
     * @hidden
     */
    protected onChipDragEnter(event: IChipEnterDragAreaEventArgs) {
        const dropChipRect = event.owner.elementRef.nativeElement.getBoundingClientRect();
        const dropChipIndex = this.chipsList.toArray().findIndex((el) => el === event.owner);
        const dragChipIndex = this.chipsList.toArray().findIndex((el) => el === event.dragChip);
        if (dragChipIndex < dropChipIndex) {
            // from the left to right
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, true, event.originalEvent);
        } else {
            // from the right to left
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, false, event.originalEvent);
        }
    }

    /**
     * @hidden
     */
    protected positionChipAtIndex(chipIndex, targetIndex, shiftRestLeft, originalEvent) {
        if (chipIndex < 0 || this.chipsList.length <= chipIndex ||
            targetIndex < 0 || this.chipsList.length <= targetIndex) {
            return false;
        }

        const chipsArray = this.chipsList.toArray();
        const result: IgxChipComponent[] = [];
        for (let i = 0; i < chipsArray.length; i++) {
            if (shiftRestLeft) {
                if (chipIndex <= i && i < targetIndex) {
                    result.push(chipsArray[i + 1]);
                } else if (i === targetIndex) {
                    result.push(chipsArray[chipIndex]);
                } else {
                    result.push(chipsArray[i]);
                }
            } else {
                if (targetIndex < i && i <= chipIndex) {
                    result.push(chipsArray[i - 1]);
                } else if (i === targetIndex) {
                    result.push(chipsArray[chipIndex]);
                } else {
                    result.push(chipsArray[i]);
                }
            }
        }
        this.modifiedChipsArray = result;

        const eventData: IChipsAreaReorderEventArgs = {
            chipsArray: this.modifiedChipsArray,
            originalEvent: originalEvent,
            owner: this
        };
        this.onReorder.emit(eventData);
        return true;
    }

    /**
     * @hidden
     */
    protected onChipSelectionChange(event: IChipSelectEventArgs) {
        if (event.selected) {
            this.selectedChips.push(event.owner);
        } else if (!event.selected) {
            this.selectedChips = this.selectedChips.filter((chip) => {
                return chip.id !== event.owner.id;
            });
        }
        this.onSelection.emit({
            originalEvent: event.originalEvent,
            newSelection: this.selectedChips,
            owner: this
        });
    }
}
