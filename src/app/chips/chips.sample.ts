import { Component, ViewChild, ViewChildren, ChangeDetectorRef, ElementRef } from '@angular/core';
import { IgxChipsAreaComponent, IgxChipComponent } from 'igniteui-angular';
import { IChipSelectEventArgs, IChipsAreaReorderEventArgs, IBaseChipEventArgs } from 'projects/igniteui-angular/src/lib/chips';

@Component({
    selector: 'app-chips-sample',
    styleUrls: ['chips.sample.scss', '../app.component.css'],
    templateUrl: 'chips.sample.html'
})
export class ChipsSampleComponent {
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

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChild('chipsAreaTo', { read: IgxChipsAreaComponent, static: true })
    public chipsAreaTo: IgxChipsAreaComponent;

    @ViewChild('chipsAreaCc', { read: IgxChipsAreaComponent, static: true })
    public chipsAreaCc: IgxChipsAreaComponent;

    @ViewChild('dropTo', { read: ElementRef, static: true })
    public dropTo: ElementRef;

    @ViewChild('dropCc', { read: ElementRef, static: true })
    public dropCc: ElementRef;

    constructor(public cdr: ChangeDetectorRef) { }

    chipsOrderChanged(event: IChipsAreaReorderEventArgs) {
        const newChipList = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const chipItem = this.chipList.filter((item) => {
                return item.id === event.chipsArray[i].id;
            })[0];
            newChipList.push(chipItem);
        }
        this.chipList = newChipList;
        this.cdr.detectChanges();
    }

    chipMovingEnded() {
    }

    chipRemoved(event: IBaseChipEventArgs) {
        this.chipList = this.chipList.filter((item) => {
            return item.id !== event.owner.id;
        });
        this.cdr.detectChanges();
    }

    removeChip(chip: IgxChipComponent) {
        chip.elementRef.nativeElement.remove();
    }

    selectChip(chipId) {
        const chipToSelect = this.chipsArea.chipsList.toArray().find((chip) => {
            return chip.id === chipId;
        });
        chipToSelect.selected = true;
    }

    onChipsSelected(event: IChipSelectEventArgs) {
        console.log(event);
    }

    /**
     * Chip Sample 2
     */

    chipsOrderChangedTo(event) {
        const newChipListTo = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const chipItem = this.chipListTo.filter((item) => {
                return item.id === event.chipsArray[i].id;
            })[0];
            newChipListTo.push(chipItem);
        }
        this.chipListTo = newChipListTo;
        this.cdr.detectChanges();
    }

    chipsOrderChangedCc(event) {
        const newChipListCc = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const chipItem = this.chipListCc.filter((item) => {
                return item.id === event.chipsArray[i].id;
            })[0];
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

        this.chipListTo = this.chipListTo.filter(item => {
            return item.text !== chipSwapEl.text;
        });

        this.chipsAreaTo.cdr.detectChanges();
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }

    public onDropTo(event) {
        event.cancel = true;

        const chipSwapEl = this.chipListCc.find(val => val.id === event.drag.data.chip.id);
        this.chipListTo.push(chipSwapEl);

        this.chipsAreaTo.cdr.detectChanges();

        this.chipListCc = this.chipListCc.filter(item => {
            return item.text !== chipSwapEl.text;
        });

        this.chipsAreaCc.cdr.detectChanges();
        this.dropTo.nativeElement.style.visibility = 'hidden';
    }

    onMoveStartTo() {
        this.dropCc.nativeElement.style.visibility = 'visible';
        this.dropCc.nativeElement.textContent = 'You can drop me here!';
        this.dropTo.nativeElement.style.visibility = 'hidden';
    }

    onMoveStartCc() {
        this.dropTo.nativeElement.style.visibility = 'visible';
        this.dropTo.nativeElement.textContent = 'You can drop me here!';
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }

    moveEndedTo() {
        this.dropTo.nativeElement.style.visibility = 'hidden';
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }

    moveEndedCc() {
        this.dropTo.nativeElement.style.visibility = 'hidden';
        this.dropCc.nativeElement.style.visibility = 'hidden';
    }
}
