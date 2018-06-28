import { ChipsSampleComponent } from './../../../../../src/app/chips/chips.sample';
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
import { take } from 'rxjs/operators';

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
class TestChipComponent {

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: false },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true }
    ];

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent})
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;
}

@Component({
    template:
    `
        <igx-chips-area #chipsArea (onReorder)="chipsOrderChanged($event)"
            (onMoveEnd)="chipMovingEnded()" (onSelection)="onChipsSelected($event)">
            <igx-chip *ngFor="let chip of chipList" [id]="chip.id" [draggable]="true"
                [removable]="true" [selectable]="true" (onRemove)="chipRemoved($event)">
                <igx-icon igxPrefix fontSet="material" [name]="'drag_indicator'"></igx-icon>
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
                <igx-icon class="igx-chip__dir-icon" igxConnector fontSet="material" [name]="'forward'"></igx-icon>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipReorderComponent {

    public chipList = [
        { id: 'Country', text: 'Country' },
        { id: 'City', text: 'City' },
        { id: 'Town', text: 'Town' },
        { id: 'FirstName', text: 'First Name' },
    ];

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent})
    public chipsArea: IgxChipsAreaComponent;

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
        this.chipsArea.cdr.detectChanges();
    }

    selectChip(chipId) {
        const chipToSelect = this.chipsArea.chipsList.toArray().find((chip) => {
            return chip.id === chipId;
        });
        chipToSelect.selected = true;
    }

    onChipsSelected(event) {
        console.log(event.newSelection);
    }
}

describe('IgxChipsArea', () => {
    const CHIP_ITEM_AREA = 'igx-chip__item chip-area';
    const CHIP_CONNECTOR = 'igx-chip__connecto';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestChipComponent,
                TestChipReorderComponent
            ],
            imports: [FormsModule, IgxIconModule, IgxChipsModule]
        }).compileComponents();
    }));

    function simulatePointerEvent(eventName: string, element, x, y) {
        const options: PointerEventInit = {
            view: window,
            bubbles: true,
            cancelable: true,
            pointerId: 1
        };
        const pointerEvent = new PointerEvent(eventName, options);
        Object.defineProperty(pointerEvent, 'pageX', { value: x, enumerable: true });
        Object.defineProperty(pointerEvent, 'pageY', { value: y, enumerable: true });
        return new Promise((resolve, reject) => {
            element.dispatchEvent(pointerEvent);
            resolve();
        });
    }

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

    it('should not be able to drag and drop when chip is not draggable', async(() => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChip = chipComponents[0].componentInstance;
        const firstChipElem = firstChip.chipArea.nativeElement;

        const startingTop = firstChipElem.getBoundingClientRect().top;
        const startingLeft = firstChipElem.getBoundingClientRect().left;
        const startingBottom = firstChipElem.getBoundingClientRect().bottom;
        const startingRight = firstChipElem.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        simulatePointerEvent('pointerdown', firstChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', firstChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const dragDir = firstChip.dragDir['_dragGhost'];

            expect(dragDir).toBeUndefined();
        });
    }));

    it('should be able to drag and drop when chip is draggable', async(() => {
        const xDragDifference = 200;
        const yDragDifference = 100;
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const secondChip = chipComponents[1].componentInstance;
        const secondChipElem = secondChip.chipArea.nativeElement;

        const startingTop = secondChipElem.getBoundingClientRect().top;
        const startingLeft = secondChipElem.getBoundingClientRect().left;
        const startingBottom = secondChipElem.getBoundingClientRect().bottom;
        const startingRight = secondChipElem.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        simulatePointerEvent('pointerdown', secondChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', secondChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', secondChip.dragDir['_dragGhost'], startingX + xDragDifference, startingY + yDragDifference);

            setTimeout(() => {
                const afterDragTop = secondChip.dragDir['_dragGhost'].getBoundingClientRect().top;
                const afterDragLeft = secondChip.dragDir['_dragGhost'].getBoundingClientRect().left;
                expect(afterDragTop - startingTop).toEqual(yDragDifference);
                expect(afterDragLeft - startingLeft).toEqual(xDragDifference);
            });
        });
    }));

    it('all suffix conectors should be invisible when chip is dragged', async(() => {
        const xDragDifference = 200;
        const yDragDifference = 100;
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const secondChip = chipComponents[1].componentInstance;
        const secondChipElem = secondChip.chipArea.nativeElement;

        const startingTop = secondChipElem.getBoundingClientRect().top;
        const startingLeft = secondChipElem.getBoundingClientRect().left;
        const startingBottom = secondChipElem.getBoundingClientRect().bottom;
        const startingRight = secondChipElem.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        simulatePointerEvent('pointerdown', secondChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', secondChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', secondChip.dragDir['_dragGhost'], startingX + xDragDifference, startingY + yDragDifference);
            fix.detectChanges();

            setTimeout(() => {
                expect(secondChipElem.style.visibility).toEqual('hidden');
            });
        });

    }));

    it('all suffix conectors should be visible after chip is dropped', async(() => {
        const xDragDifference = 200;
        const yDragDifference = 100;
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const secondChip = chipComponents[1].componentInstance;
        secondChip.dragDir.animateOnRelease = false;
        const secondChipElem = secondChip.chipArea.nativeElement;

        const startingTop = secondChipElem.getBoundingClientRect().top;
        const startingLeft = secondChipElem.getBoundingClientRect().left;
        const startingBottom = secondChipElem.getBoundingClientRect().bottom;
        const startingRight = secondChipElem.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        simulatePointerEvent('pointerdown', secondChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', secondChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', secondChip.dragDir['_dragGhost'], startingX + xDragDifference, startingY + yDragDifference);
            fix.detectChanges();

            return fix.whenRenderingDone();
        }).then(() => {
            expect(secondChipElem.style.visibility).toEqual('hidden');
            simulatePointerEvent('pointerup', secondChip.dragDir['_dragGhost'], startingX + xDragDifference, startingY + yDragDifference);
            return fix.whenRenderingDone();
        }).then(() => {
            expect(secondChipElem.style.visibility).toEqual('visible');
        });
    }));

    it('chip reorder should fire correctly', async(() => {
        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));

        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChip = chipComponents[0].componentInstance;
        const secondChip = chipComponents[1].componentInstance;

        firstChip.dragDir.animateOnRelease = false;
        secondChip.dragDir.animateOnRelease = false;

        const firstChipElem = firstChip.chipArea.nativeElement;
        const secondChipElem = secondChip.chipArea.nativeElement;

        const firstChipTop = firstChipElem.getBoundingClientRect().top;
        const firstChipLeft = firstChipElem.getBoundingClientRect().left;
        const firstChipBottom = firstChipElem.getBoundingClientRect().bottom;
        const firstChipRight = firstChipElem.getBoundingClientRect().right;

        const firstChipX = (firstChipLeft + firstChipRight) / 2;
        const firstChipY = (firstChipTop + firstChipBottom) / 2;

        const secondChipTop = secondChipElem.getBoundingClientRect().top;
        const secondChipLeft = secondChipElem.getBoundingClientRect().left;
        const secondChipBottom = secondChipElem.getBoundingClientRect().bottom;
        const secondChipRight = secondChipElem.getBoundingClientRect().right;

        const secondChipX = (secondChipLeft + secondChipRight) / 2;
        const secondChipY = (secondChipTop + secondChipBottom) / 2;

        simulatePointerEvent('pointerdown', firstChipElem, firstChipX, firstChipY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', firstChipElem, firstChipX + 10, firstChipY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            simulatePointerEvent('pointermove', firstChip.dragDir['_dragGhost'], secondChipX, secondChipY);
            fix.detectChanges();

            return fix.whenRenderingDone();
        }).then(() => {
            simulatePointerEvent('pointerup', firstChip.dragDir['_dragGhost'], secondChipX, secondChipY);
            return fix.whenRenderingDone();
        }).then(() => {
            setTimeout(() => {
                const afterDropSecondChipLeft = secondChipElem.getBoundingClientRect().left;
                expect(afterDropSecondChipLeft).toEqual(firstChipLeft);

                const afterDropFirstChipLeft = firstChipElem.getBoundingClientRect().left;
                expect(afterDropFirstChipLeft).not.toEqual(firstChipLeft);
            });
        });
    }));

    it('should fire onClick event', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[1];
        spyOn(firstChipComp.onClick, 'emit');

        firstChipComp.chipArea.nativeElement.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1}));
        firstChipComp.chipArea.nativeElement.dispatchEvent(new PointerEvent('pointerup'));

        fix.detectChanges();
        expect(firstChipComp.onClick.emit).toHaveBeenCalled();
    });

    it('should fire onSelection event', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[1];

        spyOn( firstChipComp.onSelection, 'emit');
        firstChipComp.chipArea.nativeElement.focus();

        const keyEvent = new KeyboardEvent('keydown', {
            'key': ' '
        });
        firstChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();
        expect(firstChipComp.onSelection.emit).toHaveBeenCalled();
    });

    it('should be able to have multiple chips selected', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();
        let selChips = 0;
        const chipAreaComponent = fix.componentInstance;

        chipAreaComponent.chipList.push({ id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true });
        fix.detectChanges();

        spyOn(chipAreaComponent.chipsArea.onSelection, `emit`).and.callFake(function() {
            selChips++;
        });
        chipAreaComponent.chipsArea.chipsList.toArray()[1].selected = true;
        fix.detectChanges();
        chipAreaComponent.chipsArea.chipsList.toArray()[2].selected = true;
        fix.detectChanges();
        expect(selChips).toEqual(2);
    });
});
