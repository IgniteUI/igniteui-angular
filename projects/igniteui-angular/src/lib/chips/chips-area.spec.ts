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
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true }
    ];

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent})
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;
}

describe('IgxChipsArea', () => {
    const CHIP_ITEM_AREA = 'igx-chip__item chip-area';
    const CHIP_CONNECTOR = 'igx-chip__connecto';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestChipComponent
            ],
            imports: [FormsModule, IgxIconModule, IgxChipsModule]
        }).compileComponents();
    }));

    it('should add chips when adding data items ', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipAreaComponent = fix.componentInstance;
        expect(chipArea[0].nativeElement.children.length).toEqual(2);

        chipAreaComponent.chipList.push({ id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true });

        fix.detectChanges();

        expect(chipArea[0].nativeElement.children.length).toEqual(3);
    });

    it('should remove chips when removing data items ', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipAreaComponent = fix.componentInstance;
        expect(chipArea[0].nativeElement.children.length).toEqual(2);

        chipAreaComponent.chipList.pop();
        fix.detectChanges();

        expect(chipArea[0].nativeElement.children.length).toEqual(1);
    });

    it('should change data in chips when data item is changed', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipAreaComponent = fix.componentInstance;

        expect(chipArea[0].nativeElement.children[0].innerHTML).toContain('Country');

        chipAreaComponent.chipList[0].text = 'New text';
        fix.detectChanges();

        expect(chipArea[0].nativeElement.children[0].innerHTML).toContain('New text');
    });

    it('should not fire any event of the chip area when attempting deleting of a chip', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipAreaComp = fix.componentInstance.chipsArea;
        const secondChipComp = fix.componentInstance.chips.toArray()[1];

        spyOn(chipAreaComp.onReorder, 'emit');
        spyOn(chipAreaComp.onSelection, 'emit');
        spyOn(chipAreaComp.onMoveStart, 'emit');
        spyOn(chipAreaComp.onMoveEnd, 'emit');
        spyOn(secondChipComp.onRemove, 'emit');

        secondChipComp.chipArea.nativeElement.focus();
        fix.detectChanges();

        const keyEvent = new KeyboardEvent('keydown', {
            'key': 'Delete'
        });
        secondChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();

        expect(secondChipComp.onRemove.emit).toHaveBeenCalled();
        expect(chipAreaComp.onReorder.emit).not.toHaveBeenCalled();
        expect(chipAreaComp.onSelection.emit).not.toHaveBeenCalled();
        expect(chipAreaComp.onMoveStart.emit).not.toHaveBeenCalled();
        expect(chipAreaComp.onMoveEnd.emit).not.toHaveBeenCalled();
    });

    it('should fire only onSelection event for chip area when selecting a chip', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipAreaComp = fix.componentInstance.chipsArea;
        const secondChipComp = fix.componentInstance.chips.toArray()[1];

        spyOn(chipAreaComp.onReorder, 'emit');
        spyOn(chipAreaComp.onSelection, 'emit');
        spyOn(chipAreaComp.onMoveStart, 'emit');
        spyOn(chipAreaComp.onMoveEnd, 'emit');

        secondChipComp.chipArea.nativeElement.focus();
        fix.detectChanges();

        const keyEvent = new KeyboardEvent('keydown', {
            'key': 'Spacebar'
        });
        secondChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();

        expect(chipAreaComp.onSelection.emit).toHaveBeenCalled();
        expect(chipAreaComp.onReorder.emit).not.toHaveBeenCalled();
        expect(chipAreaComp.onMoveStart.emit).not.toHaveBeenCalled();
        expect(chipAreaComp.onMoveEnd.emit).not.toHaveBeenCalled();
    });
});
