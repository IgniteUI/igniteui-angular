import {
    Component,
    ContentChildren,
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    IterableDiffer,
    IterableDiffers,
    NgModule,
    Output,
    Provider,
    QueryList,
    ViewChild,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    DoCheck,
    ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cloneArray } from '../core/utils';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxChipComponent } from './chip.component';
import { IgxDragDropModule } from '../directives/dragdrop/dragdrop.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon';
import { IgxConnectorDirective } from './connector.directive';

@Component({
    selector: 'igx-chips-area',
    templateUrl: 'chips-area.component.html',
})
export class IgxChipsAreaComponent implements DoCheck {

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    public cssClass = 'igx-chips-area';

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
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` are reordered.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="changedOrder()"></igx-chips-area>
     * ```
     * ```typescript
     * public changedOrder(){
     *      alert("The order has been changed!");
     * }
     * ```
     */
    @Output()
    public onReorder = new EventEmitter<any>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is selected.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onSelection)="selection()"></igx-chips-area>
     * ```
     * ```typescript
     * public selection(){
     *      alert("A chip has been selected!");
     * }
     */
    @Output()
    public onSelection = new EventEmitter<any>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onMoveStart)="moveStart()"></igx-chips-area>
     * ```
     * ```typescript
     * moveStart(){
     *      alert("A chip has started moving!");
     * }
     * ```
     */
    @Output()
    public onMoveStart = new EventEmitter<any>();

    /**
     * Emits an event after an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onMoveEnd)="moveEnd()"></igx-chips-area>
     * ```
     * ```typescript
     * moveEnd(){
     *      alert("A chip has been moved!");
     * }
     * ```
     */
    @Output()
    public onMoveEnd = new EventEmitter<any>();

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

    constructor(public cdr: ChangeDetectorRef,
                private _iterableDiffers: IterableDiffers) {
        this._differ = this._iterableDiffers.find([]).create(null);
    }

    /**
     * @hidden
     */
    public ngDoCheck(): void {
        if (this.chipsList) {
            const changes = this._differ.diff(this.chipsList.toArray());
            if (changes) {
                changes.forEachAddedItem((addedChip) => {
                    addedChip.item.onMoveStart.subscribe(() => {
                        this.onChipMoveStart();
                    });
                    addedChip.item.onMoveEnd.subscribe(() => {
                        this.onChipMoveEnd();
                    });
                    addedChip.item.onDragEnter.subscribe((args) => {
                        this.onChipDragEnter(args);
                    });
                    addedChip.item.onKeyDown.subscribe((args) => {
                        this.onChipKeyDown(args);
                    });
                    if (addedChip.item.selectable) {
                        addedChip.item.onSelection.subscribe((args) => {
                            this.onChipSelectionChange(args);
                        });
                    }
                });
                this.modifiedChipsArray = this.chipsList.toArray();
            }
        }
    }

    /**
     * @hidden
     */
    protected onChipKeyDown(event) {
        let orderChanged = false;
        const chipsArray = this.chipsList.toArray();
        const dragChipIndex = chipsArray.findIndex((el) => el === event.owner);
        if (event.shiftKey === true) {
            if (event.key === 'ArrowLeft' || event.key === 'Left') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex - 1, false);
                if (orderChanged) {
                    // The `modifiedChipsArray` is out of date in the setTimeout sometimes.
                    const chipArray = this.modifiedChipsArray;
                    setTimeout(() => {
                        chipArray[dragChipIndex - 1].chipArea.nativeElement.focus();
                    });
                }
            } else if (event.key === 'ArrowRight' || event.key === 'Right') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex + 1, true);
            }
        } else {
            if ((event.key === 'ArrowLeft' || event.key === 'Left') && dragChipIndex > 0) {
                chipsArray[dragChipIndex - 1].chipArea.nativeElement.focus();
            } else if ((event.key === 'ArrowRight' || event.key === 'Right') && dragChipIndex < chipsArray.length - 1) {
                chipsArray[dragChipIndex + 1].chipArea.nativeElement.focus();
            }
        }
    }

    /**
     * @hidden
     */
    protected onChipMoveStart() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = true;
            chip.cdr.detectChanges();
        });
        this.onMoveStart.emit();
    }

    /**
     * @hidden
     */
    protected onChipMoveEnd() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = false;
            chip.cdr.detectChanges();
        });
        this.onMoveEnd.emit();
    }

    /**
     * @hidden
     */
    protected onChipDragEnter(event) {
        const dropChipRect = event.targetChip.elementRef.nativeElement.getBoundingClientRect();
        const dropChipIndex = this.chipsList.toArray().findIndex((el) => el === event.targetChip);
        const dragChipIndex = this.chipsList.toArray().findIndex((el) => el === event.dragChip);
        if (dragChipIndex < dropChipIndex) {
            // from the left to right
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, true);
        } else {
            // from the right to left
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, false);
        }
    }

    /**
     * @hidden
     */
    protected positionChipAtIndex(chipIndex, targetIndex, shiftRestLeft) {
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

        const eventData = {
            chipsArray: this.modifiedChipsArray
        };
        this.onReorder.emit(eventData);
        return true;
    }

    /**
     * @hidden
     */
    protected onChipSelectionChange(event) {
        if (event.selected) {
            this.selectedChips.push(event.owner);
        } else if (!event.selected) {
            this.selectedChips = this.selectedChips.filter((chip) => {
                return chip.id !== event.owner.id;
            });
        }
        this.onSelection.emit({
            owner: this,
            newSelection: this.selectedChips
        });
    }
}
