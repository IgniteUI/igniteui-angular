import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/index';
import { IgxChipsModule } from './chips.module';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';

@Component({
    template: `
        <igx-chips-area #chipsArea>
            <igx-chip #chipElem *ngFor="let chip of chipList"
            [id]="chip.id" [draggable]="chip.draggable" [removable]="chip.removable" [selectable]="chip.selectable">
                <igx-icon igxPrefix fontSet="material" [name]="'drag_indicator'"></igx-icon>
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
                <igx-icon class="igx-chip__dir-icon" igxConnector fontSet="material" [name]="'forward'"></igx-icon>
            </igx-chip>
        </igx-chips-area>
    `
})
export class TestChipComponent {

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: true },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true },
        { id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true },
        { id: 'FirstName', text: 'First Name', removable: true , selectable: true, draggable: true},
    ];

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent})
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;
}

describe('IgxChip', () => {
    const CHIP_ITEM_AREA = 'igx-chip__item chip-area';
    const CHIP_CONNECTOR = 'igx-chip__connector';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestChipComponent
            ],
            imports: [FormsModule, IgxIconModule, IgxChipsModule]
        }).compileComponents();
    }));

    it('should render chip area and chips inside it', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        expect(chipArea.length).toEqual(1);
        expect(chipArea[0].nativeElement.children.length).toEqual(4);
        expect(chipArea[0].nativeElement.children[0].tagName).toEqual('IGX-CHIP');
    });

    it('should render prefix element inside the chip before the content', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipElems = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        // For this first chip there are 2 elements. The prefix and content span.
        expect(chipElems[0].nativeElement.children[0].children.length).toEqual(2);
        expect(chipElems[0].nativeElement.children[0].children[0].tagName).toEqual('IGX-ICON');
        expect(chipElems[0].nativeElement.children[0].children[0].hasAttribute('igxprefix')).toEqual(true);
    });

    it('should render remove button when enabled after the content inside the chip', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipElems = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        // For this second chip there are 3 elements. The prefix, content span and the remove button icon with igxButton directive.
        expect(chipElems[1].nativeElement.children[0].children.length).toEqual(3);
        expect(chipElems[1].nativeElement.children[0].children[2].tagName).toEqual('IGX-ICON');
        expect(chipElems[1].nativeElement.children[0].children[2].hasAttribute('igxbutton')).toEqual(true);
    });

    it('should render connector after each chip except the last one', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipElems = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        // The first 3 chips after each inner chip area should have a connector rendered.
        expect(chipElems[0].nativeElement.children.length).toEqual(2);
        expect(chipElems[0].nativeElement.children[1].className).toEqual(CHIP_CONNECTOR);
        expect(chipElems[1].nativeElement.children.length).toEqual(2);
        expect(chipElems[1].nativeElement.children[1].className).toEqual(CHIP_CONNECTOR);
        expect(chipElems[2].nativeElement.children.length).toEqual(2);
        expect(chipElems[2].nativeElement.children[1].className).toEqual(CHIP_CONNECTOR);

        // The last 4th chip shouldn't have a connector.
        expect(chipElems[3].nativeElement.children.length).toEqual(1);
    });

    it('should not trigger onRemove event when a chip is focused and delete button is pressed when not removable', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[0];
        spyOn(firstChipComp.onRemove, 'emit');
        firstChipComp.chipArea.nativeElement.focus();

        const focusedElems = firstChipComp.elementRef.nativeElement.querySelectorAll(':focus');
        expect(focusedElems.length).toEqual(1);
        expect(focusedElems[0].className).toEqual(CHIP_ITEM_AREA);

        const keyEvent = new KeyboardEvent('keydown', {
            'key': 'Delete'
        });
        firstChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();

        expect(firstChipComp.onRemove.emit).not.toHaveBeenCalled();
    });

    it('should trigger onRemove event when a chip is focused and delete button is pressed when removable', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const secondChipComp = fix.componentInstance.chips.toArray()[1];
        spyOn(secondChipComp.onRemove, 'emit');
        secondChipComp.chipArea.nativeElement.focus();

        const focusedElems = secondChipComp.elementRef.nativeElement.querySelectorAll(':focus');
        expect(focusedElems.length).toEqual(1);
        expect(focusedElems[0].className).toEqual(CHIP_ITEM_AREA);

        const keyEvent = new KeyboardEvent('keydown', {
            'key': 'Delete'
        });
        secondChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();

        expect(secondChipComp.onRemove.emit).toHaveBeenCalled();
    });
});
