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
export class IgxChipsAreaComponent implements AfterViewInit, DoCheck {
    @HostBinding('style.width.px')
    @Input()
    public width: number;

    @HostBinding('style.height.px')
    @Input()
    public height: number;

    @Output()
    public onChipsOrderChange = new EventEmitter<any>();

    @Output()
    public onChipsMoveStart = new EventEmitter<any>();

    @Output()
    public onChipsMoveEnd = new EventEmitter<any>();

    @ContentChildren(IgxChipComponent)
    chipsList: QueryList<IgxChipComponent>;

    private modifiedChipsArray: IgxChipComponent[];
    private _differ: IterableDiffer<IgxChipComponent> | null = null;

    constructor(public cdr: ChangeDetectorRef,
                private _iterableDiffers: IterableDiffers) {
        this._differ = this._iterableDiffers.find([]).create(null);
    }

    ngAfterViewInit() {
        this.modifiedChipsArray = this.chipsList.toArray();
        this.chipsList.forEach((chip) => {
            chip.onMoveStart.subscribe(() => {
                this.onChipMoveStart();
            });
            chip.onMoveEnd.subscribe(() => {
                this.onChipMoveEnd();
            });
            chip.onDragEnter.subscribe((args) => {
                this.onChipDragEnter(args);
            });
        });
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
                });
            }
        }
    }

    onChipMoveStart() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = true;
            chip.cdr.detectChanges();
        });
        this.onChipsMoveStart.emit();
    }

    onChipMoveEnd() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = false;
            chip.cdr.detectChanges();
        });
        this.onChipsMoveEnd.emit();
    }

    onChipDragEnter(event) {
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
        const eventData = {
            chipsArray: this.modifiedChipsArray
        };
        this.onChipsOrderChange.emit(eventData);
    }

    positionChipAtIndex(chipIndex, targetIndex, shiftRestLeft) {
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
    }
}
