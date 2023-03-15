import {Component, ViewChild, ChangeDetectorRef, ElementRef, Inject, OnInit} from '@angular/core';
import {
    IgxChipsAreaComponent,
    IgxChipComponent,
    IChipsAreaReorderEventArgs,
    IBaseChipEventArgs,
    IChipsAreaSelectEventArgs,
    DisplayDensity,
    DisplayDensityToken,
    IDisplayDensityOptions, IButtonGroupEventArgs, ButtonGroupAlignment
} from 'igniteui-angular';

import { defineComponents, IgcChipComponent } from 'igniteui-webcomponents';
defineComponents(IgcChipComponent);

interface Selection {
    selected: boolean;
    label: string | DisplayDensity;
}

@Component({
    selector: 'app-chips-sample',
    styleUrls: ['chips.sample.scss', '../app.component.scss'],
    templateUrl: 'chips.sample.html'
})
export class ChipsSampleComponent implements OnInit {
    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true })
    private chipsArea: IgxChipsAreaComponent;

    @ViewChild('chipsAreaTo', { read: IgxChipsAreaComponent, static: true })
    private chipsAreaTo: IgxChipsAreaComponent;

    @ViewChild('chipsAreaCc', { read: IgxChipsAreaComponent, static: true })
    private chipsAreaCc: IgxChipsAreaComponent;

    @ViewChild('dropTo', { read: ElementRef, static: true })
    private dropTo: ElementRef;

    @ViewChild('dropCc', { read: ElementRef, static: true })
    private dropCc: ElementRef;

    public chipList = [
        {
            id: 'Country', text: 'Country',
            disabled: false, icon: 'location_on'
        },
        {
            id: 'City', text: 'City',
            disabled: true, icon: 'location_city'
        },
        {
            id: 'Town', text: 'Town',
            disabled: false, icon: 'store_mall_directory'
        },
        {
            id: 'FirstName', text: 'First Name',
            disabled: false, icon: 'person_pin'
        },
    ];

    public chipTypes = ['default', 'primary', 'info', 'success', 'warning', 'error'];

    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;

    public chipListTo = [
        {
            id: '1',
            text: 'Allen',
            picture: '../../assets/images/avatar/1.jpg'
        },
        {
            id: '2',
            text: 'George',
            picture: '../../assets/images/avatar/2.jpg'
        },
        {
            id: '3',
            text: 'Jessica',
            picture: '../../assets/images/avatar/3.jpg'
        },
        {
            id: '4',
            text: 'Dana',
            picture: '../../assets/images/avatar/4.jpg'
        },
    ];

    public chipListCc = [];

    public draggingElem = false;
    public dragEnteredArea = false;

    public isDisabled = false;

    public isRemovable = false;

    public isSelectable = false;

    public hasSuffix = false;

    public hasPrefix = false;

    public customIcons = false;

    public isDraggable = false;

    public selected: string;

    public isSelected = false;

    public density: DisplayDensity = 'comfortable';

    public displayDensities: Selection[];

    constructor(public cdr: ChangeDetectorRef, @Inject(DisplayDensityToken)
    public displayDensityOptions: IDisplayDensityOptions,) { }

    public selectDensity(event: IButtonGroupEventArgs) {
        this.density = this.displayDensities[event.index].label as DisplayDensity;
    }

    public chipsOrderChanged(event: IChipsAreaReorderEventArgs) {
        const newChipList = [];
        for (const chip of event.chipsArray) {
            const chipItem = this.chipList.filter((item) => item.id === chip.id)[0];
            newChipList.push(chipItem);
        }
        this.chipList = newChipList;
        this.cdr.detectChanges();
    }

    public chipMovingEnded() {
    }

    public chipRemoved(event: IBaseChipEventArgs) {
        this.chipList = this.chipList.filter((item) => item.id !== event.owner.id);
        this.cdr.detectChanges();
    }

    public removeChip(chip: IgxChipComponent) {
        chip.nativeElement.remove();
    }

    public ngOnInit(): void {
        this.displayDensities = [
            {
                label: 'comfortable',
                selected: this.density === 'comfortable',
            },
            {
                label: 'cosy',
                selected: this.density === 'cosy',
            },
            {
                label: 'compact',
                selected: this.density === 'compact',
            },
        ];
    }

    public onChipsSelected(event: IChipsAreaSelectEventArgs) {
        console.log(event);
    }

    /**
     * Chip Sample 2
     */

    public chipsOrderChangedTo(event) {
        const newChipListTo = [];
        for (const chip of event.chipsArray) {
            const chipItem = this.chipListTo.filter((item) => item.id === chip.id)[0];
            newChipListTo.push(chipItem);
        }
        this.chipListTo = newChipListTo;
        this.cdr.detectChanges();
    }

    public chipsOrderChangedCc(event) {
        const newChipListCc = [];
        for (const chip of event.chipsArray) {
            const chipItem = this.chipListCc.filter((item) => item.id === chip.id)[0];
            newChipListCc.push(chipItem);
        }
        this.chipListCc = newChipListCc;
        this.cdr.detectChanges();
    }

    public onDragEnterCc() {
        this.dragEnteredArea = true;
    }

    public onDragLeaveCc() {
        this.dragEnteredArea = false;
    }

    public onDropCc(event) {
        event.cancel = true;

        const chipSwapEl = this.chipListTo.find(val => val.id === event.drag.data.chip.id);
        this.chipListCc.push(chipSwapEl);

        this.chipsAreaCc.cdr.detectChanges();

        this.chipListTo = this.chipListTo.filter(item => item.text !== chipSwapEl.text);

        this.chipsAreaTo.cdr.detectChanges();
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }

    public onDropTo(event) {
        event.cancel = true;

        const chipSwapEl = this.chipListCc.find(val => val.id === event.drag.data.chip.id);
        this.chipListTo.push(chipSwapEl);

        this.chipsAreaTo.cdr.detectChanges();

        this.chipListCc = this.chipListCc.filter(item => item.text !== chipSwapEl.text);

        this.chipsAreaCc.cdr.detectChanges();
        this.dropTo.nativeElement.style.visibility = 'hidden';
    }

    public onMoveStartTo() {
        this.dropCc.nativeElement.style.visibility = 'visible';
        this.dropCc.nativeElement.textContent = 'You can drop me here!';
        this.dropTo.nativeElement.style.visibility = 'hidden';
    }

    public onMoveStartCc() {
        this.dropTo.nativeElement.style.visibility = 'visible';
        this.dropTo.nativeElement.textContent = 'You can drop me here!';
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }

    public moveEndedTo() {
        this.dropTo.nativeElement.style.visibility = 'hidden';
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }

    public moveEndedCc() {
        this.dropTo.nativeElement.style.visibility = 'hidden';
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }
}
