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
    styles: [
        `:host {
            display: flex;
        }
        `
    ]
})
export class IgxChipsAreaComponent implements DoCheck {

    @HostBinding('style.width.px')
    @Input()
    public width: number;

    @HostBinding('style.height.px')
    @Input()
    public height: number;

    @Output()
    public onReorder = new EventEmitter<any>();

    @Output()
    public onSelection = new EventEmitter<any>();

    @Output()
    public onMoveStart = new EventEmitter<any>();

    @Output()
    public onMoveEnd = new EventEmitter<any>();

    @ContentChildren(IgxChipComponent)
    public chipsList: QueryList<IgxChipComponent>;

    private modifiedChipsArray: IgxChipComponent[];
    private _differ: IterableDiffer<IgxChipComponent> | null = null;
    private selectedChips: IgxChipComponent[] = [];

    constructor(public cdr: ChangeDetectorRef,
                private _iterableDiffers: IterableDiffers) {
        this._differ = this._iterableDiffers.find([]).create(null);
    }

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

    protected onChipKeyDown(event) {
        let orderChanged = false;
        const chipsArray = this.chipsList.toArray();
        const dragChipIndex = chipsArray.findIndex((el) => el === event.owner);

        if (event.shiftKey === true) {
            if (event.code === 'ArrowLeft') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex - 1, false);
                if (orderChanged) {
                    setTimeout(() => {
                        this.modifiedChipsArray[dragChipIndex - 1].chipArea.nativeElement.focus();
                    }, 0);
                }
            } else if (event.code === 'ArrowRight') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex + 1, true);
            }
        } else {
            if (event.code === 'ArrowLeft' && dragChipIndex > 0) {
                chipsArray[dragChipIndex - 1].chipArea.nativeElement.focus();
            } else if (event.code === 'ArrowRight' && dragChipIndex < chipsArray.length - 1) {
                chipsArray[dragChipIndex + 1].chipArea.nativeElement.focus();
            }
        }
        this.onMoveEnd.emit();
    }

    protected onChipMoveStart() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = true;
            chip.cdr.detectChanges();
        });
        this.onMoveStart.emit();
    }

    protected onChipMoveEnd() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = false;
            chip.cdr.detectChanges();
        });
        this.onMoveEnd.emit();
    }

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

    protected onChipSelectionChange(event) {
        if (event.nextStatus) {
            this.selectedChips.push(event.owner);
        } else if (!event.nextStatus) {
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
