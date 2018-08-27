import { Component, ViewChild, ViewChildren, ChangeDetectorRef, ElementRef } from '@angular/core';
import { IgxChipsAreaComponent, IgxChipComponent } from 'igniteui-angular';
import { IChipSelectEventArgs } from 'projects/igniteui-angular/src/lib/chips';

@Component({
    selector: 'app-chips-sample',
    styleUrls: ['chips.sample.css', '../app.component.css'],
    templateUrl: 'chips.sample.html'
})
export class ChipsSampleComponent {
    public chipList = [
        { id: 'Country', text: 'Country' },
        { id: 'City', text: 'City' },
        { id: 'Town', text: 'Town' },
        { id: 'FirstName', text: 'First Name' },
    ];

    public chipListTo = [
        { id: '1', text: 'Allen' },
        { id: '2', text: 'George' },
        { id: '3', text: 'Jason' },
        { id: '4', text: 'Dean' },
    ];

    public chipListCc = [];

    public draggingElem = false;
    public dragEnteredArea = false;

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent})
    public chipsArea: IgxChipsAreaComponent;

    @ViewChild('chipsAreaTo', { read: IgxChipsAreaComponent})
    public chipsAreaTo: IgxChipsAreaComponent;

    @ViewChild('chipsAreaCc', { read: IgxChipsAreaComponent})
    public chipsAreaCc: IgxChipsAreaComponent;

    @ViewChild('dropTo', { read: ElementRef})
    public dropTo: ElementRef;

    @ViewChild('dropCc', { read: ElementRef})
    public dropCc: ElementRef;

    constructor(public cdr: ChangeDetectorRef) { }

    chipsOrderChanged(event) {
        const newChipList = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const chipItem = this.chipList.filter((item) => {
                return item.id === event.chipsArray[i].id;
            })[0];
            newChipList.push(chipItem);
        }
        this.chipList = newChipList;
        event.isValid = true;
    }

    chipMovingEnded() {
    }

    chipRemoved(event) {
        this.chipList = this.chipList.filter((item) => {
            return item.id !== event.owner.id;
        });
        this.cdr.detectChanges();
    }

    selectChip(chipId) {
        const chipToSelect = this.chipsArea.chipsList.toArray().find((chip) => {
            return chip.id === chipId;
        });
        chipToSelect.selected = true;
    }

    onChipsSelected(event: IChipSelectEventArgs) {
        console.log(event.selected);
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
        event.isValid = true;
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
        event.isValid = true;
    }

    public onDragEnterCc() {
        this.dragEnteredArea = true;
    }

    public onDragLeaveCc() {
        this.dragEnteredArea = false;
    }

    public onDropCc(event){
        
        event.cancel = true;

        let chipSwapEl = this.chipListTo.find(val=> val.text === event.drag.element.nativeElement.parentElement.children[0].textContent);
        this.chipListCc.push(chipSwapEl);

        this.chipsAreaCc.cdr.detectChanges();

        this.chipListTo = this.chipListTo.filter(item => {
            return item.text !== chipSwapEl.text;
        });

        this.chipsAreaTo.cdr.detectChanges();
        this.dropCc.nativeElement.style.visibility = "hidden"
    }

    public onDropTo(event){
        
        event.cancel = true;

        let chipSwapEl = this.chipListCc.find(val=> val.text === event.drag.element.nativeElement.parentElement.children[0].textContent);
        this.chipListTo.push(chipSwapEl);

        this.chipsAreaTo.cdr.detectChanges();

        this.chipListCc = this.chipListCc.filter(item => {
            return item.text !== chipSwapEl.text;
        });

        this.chipsAreaCc.cdr.detectChanges();
        this.dropTo.nativeElement.style.visibility = "hidden";
    }

    onMoveStartTo(){
        this.dropCc.nativeElement.style.visibility = "visible";
        this.dropCc.nativeElement.textContent = "You can drop me here!";
        this.dropTo.nativeElement.style.visibility = "hidden";
    }

    onMoveStartCc(){
        this.dropTo.nativeElement.style.visibility = "visible";
        this.dropTo.nativeElement.textContent = "You can drop me here!";
        this.dropCc.nativeElement.style.visibility = "hidden";
    }

    moveEndedTo(){
        this.dropTo.nativeElement.style.visibility = "hidden";
        this.dropCc.nativeElement.style.visibility = "hidden";
    }

    moveEndedCc(){
        this.dropTo.nativeElement.style.visibility = "hidden";
        this.dropCc.nativeElement.style.visibility = "hidden";
    }
}
