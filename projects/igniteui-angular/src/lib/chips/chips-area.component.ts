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
    DoCheck
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
import { IgxSuffixConnectorDirective } from './suffixConnector.directive';
import { IgxPrefixConnectorDirective } from './prefixConnector.directive';

@Component({
    selector: 'igx-chips-area',
    templateUrl: 'chips-area.component.html'
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
    public onChipsMoveEnd = new EventEmitter<any>();

    @Output()
    public onChipsInteractionEnd = new EventEmitter<any>();

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
            chip.onOutOfAreaLeft.subscribe((chipRef) => {
                this.onChipOutOfAreaLeft(chipRef);
            });
            chip.onOutOfAreaRight.subscribe((chipRef) => {
                this.onChipOutOfAreaRight(chipRef);
            });
            chip.onMoveStart.subscribe(() => {
                this.onChipMoveStart();
            });
            chip.onMoveEnd.subscribe(() => {
                this.onChipMoveEnd();
            });
            chip.onInteractionStart.subscribe(() => {
                this.onChipInteractionStart();
            });
            chip.onInteractionEnd.subscribe(() => {
                this.onChipInteractionEnd();
            });
        });
    }

    public ngDoCheck(): void {
        if (this.chipsList) {
            const changes = this._differ.diff(this.chipsList.toArray());
            if (changes) {
                changes.forEachAddedItem((addedChip) => {
                    addedChip.item.onOutOfAreaLeft.subscribe((chipRef) => {
                        this.onChipOutOfAreaLeft(chipRef);
                    });
                    addedChip.item.onOutOfAreaRight.subscribe((chipRef) => {
                        this.onChipOutOfAreaRight(chipRef);
                    });
                    addedChip.item.onMoveStart.subscribe(() => {
                        this.onChipMoveStart();
                    });
                    addedChip.item.onMoveEnd.subscribe(() => {
                        this.onChipMoveEnd();
                    });
                    addedChip.item.onInteractionStart.subscribe(() => {
                        this.onChipInteractionStart();
                    });
                    addedChip.item.onInteractionEnd.subscribe(() => {
                        this.onChipInteractionEnd();
                    });
                });
            }
        }
    }

    shiftChipLeft(chipIndex: number) {
        const chipsArray = this.chipsList.toArray();
        const result: IgxChipComponent[] = [];
        for (let i = 0; i < chipsArray.length; i++) {
            if ( i < chipIndex - 1 || chipIndex < i) {
                result.push(chipsArray[i]);
            } else if (i === chipIndex - 1) {
                result.push(chipsArray[chipIndex]);
            } else if (i === chipIndex) {
                result.push(chipsArray[chipIndex - 1]);
            }
        }
        this.modifiedChipsArray = result;
    }

    shiftChipRight(chipIndex: number) {
        const chipsArray = this.chipsList.toArray();
        const result: IgxChipComponent[] = [];
        for (let i = 0; i < chipsArray.length; i++) {
            if (i < chipIndex || chipIndex + 1 < i) {
                result.push(chipsArray[i]);
            } else if (i === chipIndex) {
                result.push(chipsArray[chipIndex + 1]);
            } else if (i === chipIndex + 1) {
                result.push(chipsArray[chipIndex]);
            }
        }
        this.modifiedChipsArray = result;
    }

    onChipOutOfAreaLeft(chipData) {
        const chipIndex = this.chipsList.toArray().indexOf(chipData.owner);
        if (chipIndex === 0) {
            return;
        }

        this.shiftChipLeft(chipIndex);
        const eventData = {
            chipsArray: this.modifiedChipsArray,
            isValid: false
        };
        this.onChipsOrderChange.emit(eventData);
        chipData.isValid = eventData.isValid;
    }

    onChipOutOfAreaRight(chipData) {
        const chipIndex = this.chipsList.toArray().indexOf(chipData.owner);
        if (chipIndex === this.chipsList.toArray().length - 1) {
            return;
        }

        this.shiftChipRight(chipIndex);
        const eventData = {
            chipsArray: this.modifiedChipsArray,
            isValid: false
        };
        this.onChipsOrderChange.emit(eventData);
        chipData.isValid = eventData.isValid;
    }

    onChipMoveStart() {
    }

    onChipMoveEnd() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = false;
        });

        this.onChipsMoveEnd.emit();
    }

    onChipInteractionStart() {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = true;
        });
    }

    onChipInteractionEnd() {
        this.onChipsInteractionEnd.emit();
    }
}
