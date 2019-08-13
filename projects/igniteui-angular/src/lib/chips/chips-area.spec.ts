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
import { IgxPrefixModule } from '../directives/prefix/prefix.directive';
import { IgxSuffixModule } from '../directives/suffix/suffix.directive';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { UIInteractions} from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';

@Component({
    template: `
        <igx-chips-area #chipsArea class="customClass">
            <igx-chip #chipElem *ngFor="let chip of chipList"
            [id]="chip.id" [draggable]="chip.draggable" [removable]="chip.removable" [selectable]="chip.selectable">
                <igx-icon igxPrefix fontSet="material">drag_indicator</igx-icon>
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipComponent {

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: false },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true }
    ];

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true  })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;
}

@Component({
    template: `
        <igx-chips-area #chipsArea>
            <igx-chip #chipElem [id]="1" [draggable]="true" [removable]="true" [selectable]="true" [selected]="true">
                <span #label [class]="'igx-chip__text'">first chip</span>
            </igx-chip>
            <igx-chip #chipElem [id]="2" [draggable]="false" [selectable]="false" [selected]="true">
                <span #label [class]="'igx-chip__text'">second chip</span>
            </igx-chip>
            <igx-chip #chipElem [id]="3" [draggable]="true" [removable]="true" [selectable]="true" [selected]="false">
                <span #label [class]="'igx-chip__text'">third chip</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipSelectComponent extends TestChipComponent {
}

@Component({
    template:
    `
        <igx-chips-area #chipsArea (onReorder)="chipsOrderChanged($event)"
            (onMoveEnd)="chipMovingEnded()" (onSelection)="onChipsSelected($event)">
            <igx-chip *ngFor="let chip of chipList" [id]="chip.id" [draggable]="true"
                [removable]="true" [selectable]="true" (onRemove)="chipRemoved($event)">
                <igx-icon igxPrefix fontSet="material">drag_indicator</igx-icon>
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
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

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true  })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;

    chipsOrderChanged(event) {
        const newChipList = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const chipItem = this.chipList.filter((item) => {
                return item.id === event.chipsArray[i].id;
            })[0];
            newChipList.push(chipItem);
        }
        this.chipList = newChipList;
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
    configureTestSuite();
    const CHIP_REMOVE_BUTTON = 'igx-chip__remove';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestChipComponent,
                TestChipReorderComponent,
                TestChipSelectComponent
            ],
            imports: [FormsModule, IgxIconModule, IgxChipsModule, IgxPrefixModule, IgxSuffixModule]
        }).compileComponents();
    }));

    it('should add chips when adding data items ', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipAreaComponent = fix.componentInstance;

        expect(chipArea[0].nativeElement.className).toEqual('igx-chip-area customClass');
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

        UIInteractions.simulatePointerEvent('pointerdown', firstChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', firstChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const dragDir = firstChip.dragDirective.ghostElement;

            expect(dragDir).toBeUndefined();
        });
    }));

    it('should be able to drag when chip is draggable', async(() => {
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

        UIInteractions.simulatePointerEvent('pointerdown', secondChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', secondChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent(
                'pointermove',
                secondChip.dragDirective.ghostElement,
                startingX + xDragDifference,
                startingY + yDragDifference
            );

            setTimeout(() => {
                const afterDragTop = secondChip.dragDirective.ghostElement.getBoundingClientRect().top;
                const afterDragLeft = secondChip.dragDirective.ghostElement.getBoundingClientRect().left;
                expect(afterDragTop - startingTop).toEqual(yDragDifference);
                expect(afterDragLeft - startingLeft).toEqual(xDragDifference);
            }, 100);
        });
    }));

    it('chip reorder should fire correctly when element is dragged and dropped to the left', async(() => {
        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));

        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChip = chipComponents[0].componentInstance;
        const secondChip = chipComponents[1].componentInstance;

        firstChip.animateOnRelease = false;
        secondChip.animateOnRelease = false;

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

        UIInteractions.simulatePointerEvent('pointerdown', firstChipElem, firstChipX, firstChipY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', firstChipElem, firstChipX + 10, firstChipY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', firstChip.dragDirective.ghostElement, secondChipX, secondChipY);
            fix.detectChanges();

            return fix.whenRenderingDone();
        }).then(() => {
            UIInteractions.simulatePointerEvent('pointerup', firstChip.dragDirective.ghostElement, secondChipX, secondChipY);
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

    it('chip reorder should fire correctly when element is dragged and dropped to the right', async(() => {
        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));

        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChip = chipComponents[0].componentInstance;
        const secondChip = chipComponents[1].componentInstance;

        firstChip.animateOnRelease = false;
        secondChip.animateOnRelease = false;

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

        UIInteractions.simulatePointerEvent('pointerdown', secondChipElem, secondChipX, secondChipY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', secondChipElem, secondChipX + 10, secondChipY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', secondChip.dragDirective.ghostElement, firstChipX, firstChipY);
            fix.detectChanges();

            return fix.whenRenderingDone();
        }).then(() => {
            UIInteractions.simulatePointerEvent('pointerup', secondChip.dragDirective.ghostElement, firstChipX, firstChipY);
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

        firstChipComp.chipArea.nativeElement.click();

        fix.detectChanges();
        expect(firstChipComp.onClick.emit).toHaveBeenCalled();
    });

    it('should fire onSelection event', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const secondChipComp = fix.componentInstance.chips.toArray()[1];
        const chipAreaComp = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent))[0].componentInstance;
        spyOn(chipAreaComp.onSelection, 'emit');

        secondChipComp.chipArea.nativeElement.focus();
        fix.detectChanges();

        const keyEvent = new KeyboardEvent('keydown', {
            'key': ' '
        });
        secondChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();

        expect(chipAreaComp.onSelection.emit).toHaveBeenCalledWith({
            originalEvent: keyEvent,
            owner: chipAreaComp,
            newSelection: [secondChipComp]
        });

        let chipsSelectionStates = fix.componentInstance.chips.toArray().filter(c => c.selected);
        expect(chipsSelectionStates.length).toEqual(1);
        expect(secondChipComp.selected).toBeTruthy();

        secondChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();

        expect(chipAreaComp.onSelection.emit).toHaveBeenCalledWith({
            originalEvent: keyEvent,
            owner: chipAreaComp,
            newSelection: []
        });

        chipsSelectionStates = fix.componentInstance.chips.toArray().filter(c => c.selected);
        expect(chipsSelectionStates.length).toEqual(0);
        expect(secondChipComp.selected).not.toBeTruthy();
    });

    it('should be able to have multiple chips selected', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipAreaComp = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent))[0].componentInstance;

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

        const secondChipComp = fix.componentInstance.chips.toArray()[1];
        const thirdChipComp = fix.componentInstance.chips.toArray()[2];

        expect(chipAreaComp.onSelection.emit).toHaveBeenCalledWith({
            originalEvent: null,
            owner: chipAreaComp,
            newSelection: [secondChipComp, thirdChipComp]
        });
    });

    it('should be able to select chip using input property', () => {
        const fix = TestBed.createComponent(TestChipSelectComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[0];
        const secondChipComp = fix.componentInstance.chips.toArray()[1];
        const thirdChipComp = fix.componentInstance.chips.toArray()[2];

        expect(firstChipComp.selected).toBe(true);
        expect(secondChipComp.selected).toBe(true);
        expect(thirdChipComp.selected).toBe(false);
    });

    it('should be able to select chip using api when selectable is set to false', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const selectedChip = fix.componentInstance.chipsArea.chipsList.toArray()[0];
        const unselectedChip = fix.componentInstance.chipsArea.chipsList.toArray()[1];
        selectedChip.selected = true;
        fix.detectChanges();

        const selectedChipIconContainer = selectedChip.elementRef.nativeElement.children[0].children[0];
        const unselectedChipIconContainer = unselectedChip.elementRef.nativeElement.children[0].children[0];
        expect(selectedChip.selected).toBe(true);
        expect(selectedChipIconContainer.children.length).toEqual(1);
        expect(selectedChipIconContainer.children[0].tagName).toEqual('IGX-ICON');
        // expect(selectedChip.elementRef.nativeElement.children[0].children[0].offsetWidth).not.toEqual(0);
        expect(selectedChip.elementRef.nativeElement.children[0].children[0].className).toEqual('igx-chip__select');
        expect(selectedChip.elementRef.nativeElement.children[0].children[0].className).not.toEqual('igx-chip__select--hidden');
        expect(unselectedChipIconContainer.children.length).toEqual(1);
        expect(unselectedChipIconContainer.children[0].tagName).toEqual('IGX-ICON');
        expect(unselectedChip.elementRef.nativeElement.children[0].children[0].offsetWidth).toEqual(0);
    });

    it('should focus on chip correctly', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[0];
        const secondChipComp = fix.componentInstance.chips.toArray()[1];

        firstChipComp.chipArea.nativeElement.focus();

        expect(document.activeElement).toBe(firstChipComp.chipArea.nativeElement);

        secondChipComp.chipArea.nativeElement.focus();

        expect(document.activeElement).toBe(secondChipComp.chipArea.nativeElement);
    });

    it('should focus on previous and next chips after arrows are pressed', () => {
        const leftKey = new KeyboardEvent('keydown', {
            'key': 'ArrowLeft'
        });
        const rightKey = new KeyboardEvent('keydown', {
            'key': 'ArrowRight'
        });

        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[0];
        const secondChipComp = fix.componentInstance.chips.toArray()[1];

        firstChipComp.chipArea.nativeElement.focus();

        fix.detectChanges();

        expect(document.activeElement).toBe(firstChipComp.chipArea.nativeElement);

        firstChipComp.chipArea.nativeElement.dispatchEvent(rightKey);
        fix.detectChanges();
        expect(document.activeElement).toBe(secondChipComp.chipArea.nativeElement);

        secondChipComp.chipArea.nativeElement.dispatchEvent(leftKey);
        fix.detectChanges();
        expect(document.activeElement).toBe(firstChipComp.chipArea.nativeElement);
    });

    it('should reorder chips when shift + leftarrow and shift + rightarrow is pressed', async(() => {
        const leftKey = new KeyboardEvent('keydown', {
            'key': 'ArrowLeft',
            shiftKey: true
        });
        const rightKey = new KeyboardEvent('keydown', {
            'key': 'ArrowRight',
            shiftKey: true
        });

        let firstChipLeft;
        let secondChipLeft;
        let firstChipAreaElem;
        let secondChipAreaElem;

        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();

        fix.whenStable().then(() => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            firstChipAreaElem = chipComponents[0].componentInstance.chipArea.nativeElement;
            secondChipAreaElem = chipComponents[1].componentInstance.chipArea.nativeElement;

            firstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            secondChipLeft = secondChipAreaElem.getBoundingClientRect().left;

            firstChipAreaElem.focus();
            fix.detectChanges();
            expect(document.activeElement).toBe(firstChipAreaElem);

            firstChipAreaElem.dispatchEvent(rightKey);
            fix.detectChanges();

            let newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            let newSecondChipLeft = secondChipAreaElem.getBoundingClientRect().left;

            expect(firstChipLeft).toBeLessThan(newFirstChipLeft);
            expect(newSecondChipLeft).toBeLessThan(secondChipLeft);

            firstChipAreaElem.focus();

            firstChipAreaElem.dispatchEvent(leftKey);
            fix.detectChanges();

            newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            newSecondChipLeft = secondChipAreaElem.getBoundingClientRect().left;

            expect(firstChipLeft).toEqual(newFirstChipLeft);
            expect(newSecondChipLeft).toEqual(secondChipLeft);
        });
    }));

    it('should reorder chips when shift + leftarrow is pressed and shift + rightarrow is pressed twice', async(() => {
        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();

        const leftKey = new KeyboardEvent('keydown', {
            'key': 'ArrowLeft',
            shiftKey: true
        });
        const rightKey = new KeyboardEvent('keydown', {
            'key': 'ArrowRight',
            shiftKey: true
        });
        const chipAreaComponent = fix.componentInstance.chipsArea;
        const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const targetChip = chipComponents[2].componentInstance;
        const targetChipElem = targetChip.chipArea.nativeElement;

        targetChipElem.focus();
        fix.detectChanges();

        expect(document.activeElement).toBe(targetChipElem);
        expect(chipAreaComponent.chipsList.toArray()[2].id).toEqual('Town');
        expect(chipAreaComponent.chipsList.toArray()[3].id).toEqual('FirstName');

        document.activeElement.dispatchEvent(rightKey);
        fix.detectChanges();

        fix.whenStable().then(() => {
            expect(document.activeElement).toBe(targetChipElem);
            expect(chipAreaComponent.chipsList.toArray()[2].id).toEqual('FirstName');
            expect(chipAreaComponent.chipsList.toArray()[3].id).toEqual('Town');

            document.activeElement.dispatchEvent(leftKey);
            fix.detectChanges();

            return fix.whenStable();
        }).then(() => {
            expect(document.activeElement).toBe(targetChipElem);
            expect(chipAreaComponent.chipsList.toArray()[2].id).toEqual('Town');
            expect(chipAreaComponent.chipsList.toArray()[3].id).toEqual('FirstName');

            document.activeElement.dispatchEvent(leftKey);
            fix.detectChanges();

            return fix.whenStable();
        }).then(() => {
            expect(document.activeElement).toBe(targetChipElem);
            expect(chipAreaComponent.chipsList.toArray()[2].id).toEqual('City');
            expect(chipAreaComponent.chipsList.toArray()[3].id).toEqual('FirstName');
        });
    }));

    it('should not reorder chips for shift + leftarrow and shift + rightarrow when the chip is going out of bounce', async(() => {
        const leftKey = new KeyboardEvent('keydown', {
            'key': 'ArrowLeft',
            shiftKey: true
        });
        const rightKey = new KeyboardEvent('keydown', {
            'key': 'ArrowRight',
            shiftKey: true
        });

        let firstChipLeft;
        let lastChipLeft;
        let firstChipAreaElem;
        let lastChipAreaElem;

        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();

        fix.whenStable().then(() => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            firstChipAreaElem = chipComponents[0].componentInstance.chipArea.nativeElement;
            lastChipAreaElem = chipComponents[chipComponents.length - 1].componentInstance.chipArea.nativeElement;

            firstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            lastChipLeft = lastChipAreaElem.getBoundingClientRect().left;

            firstChipAreaElem.focus();
            fix.detectChanges();
            expect(document.activeElement).toBe(firstChipAreaElem);

            firstChipAreaElem.dispatchEvent(leftKey);
            lastChipAreaElem.dispatchEvent(rightKey);
            fix.detectChanges();

            const newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            const newlastChipLeft = lastChipAreaElem.getBoundingClientRect().left;

            expect(firstChipLeft).toEqual(newFirstChipLeft);
            expect(newlastChipLeft).toEqual(lastChipLeft);
        });
    }));

    it('should delete chip when delete button is pressed and chip is removable', () => {
        const deleteKey = new KeyboardEvent('keydown', {
            'key': 'Delete'
        });

        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();
        let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        expect(chipComponents.length).toEqual(4);

        const firstChipComp = chipComponents[0].componentInstance;

        firstChipComp.chipArea.nativeElement.focus();

        expect(document.activeElement).toBe(firstChipComp.chipArea.nativeElement);
        firstChipComp.chipArea.nativeElement.dispatchEvent(deleteKey);
        fix.detectChanges();

        chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        expect(chipComponents.length).toEqual(3);
    });

    it('should delete chip when delete button is clicked', () => {
        const fix = TestBed.createComponent(TestChipReorderComponent);
        fix.detectChanges();

        let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        expect(chipComponents.length).toEqual(4);

        const deleteButtonElement = fix.debugElement.queryAll(By.css('.' + CHIP_REMOVE_BUTTON))[0];
        deleteButtonElement.nativeElement.click();

        fix.detectChanges();

        chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        expect(chipComponents.length).toEqual(3);
    });

    it('chip should persist selected state when it is dragged and dropped', async(() => {
        const spaceKeyEvent = new KeyboardEvent('keydown', {
            'key': ' '
        });
        const xDragDifference = 200;
        const yDragDifference = 100;
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipComponents = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const secondChip = chipComponents[1].componentInstance;
        const secondChipElem = secondChip.chipArea.nativeElement;

        secondChip.animateOnRelease = false;
        secondChip.chipArea.nativeElement.dispatchEvent(spaceKeyEvent);

        const startingTop = secondChipElem.getBoundingClientRect().top;
        const startingLeft = secondChipElem.getBoundingClientRect().left;
        const startingBottom = secondChipElem.getBoundingClientRect().bottom;
        const startingRight = secondChipElem.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        expect(secondChip.selected).toBeTruthy();

        UIInteractions.simulatePointerEvent('pointerdown', secondChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            UIInteractions.simulatePointerEvent('pointermove', secondChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent(
                'pointermove',
                secondChip.dragDirective.ghostElement,
                 startingX + xDragDifference,
                  startingY + yDragDifference
            );

            expect(secondChip.selected).toBeTruthy();

            UIInteractions.simulatePointerEvent(
                'pointerup',
                secondChip.dragDirective.ghostElement,
                startingX + xDragDifference,
                startingY + yDragDifference
            );
            fix.detectChanges();
            return fix.whenStable();
        })
        .then(() => {
            expect(secondChip.selected).toBeTruthy();

            const firstChip = chipComponents[0].componentInstance;
            expect(firstChip.selected).not.toBeTruthy();
        });
    }));

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

    it('should select/deselect a chip by clicking on out and emit onSelection event', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipAreaComp = fix.componentInstance.chipsArea;
        const secondChipComp = fix.componentInstance.chips.toArray()[1];

        spyOn(chipAreaComp.onSelection, 'emit');
        fix.detectChanges();

        secondChipComp.chipArea.nativeElement.click();
        fix.detectChanges();

        expect(chipAreaComp.onSelection.emit).toHaveBeenCalledWith({
            originalEvent: null,
            owner: chipAreaComp,
            newSelection: [secondChipComp]
        });

        secondChipComp.chipArea.nativeElement.click();
        fix.detectChanges();

        expect(chipAreaComp.onSelection.emit).toHaveBeenCalledWith({
            originalEvent: null,
            owner: chipAreaComp,
            newSelection: []
        });
    });

    it('should emit onSelection for the chipArea event when there are initially selected chips through their inputs', () => {
        const fix = TestBed.createComponent(TestChipSelectComponent);

        const chipAreaComp = fix.componentInstance.chipsArea;
        spyOn(chipAreaComp.onSelection, 'emit');

        fix.detectChanges();

        const secondChipComp = fix.componentInstance.chips.toArray();

        expect(chipAreaComp['selectedChips']).toEqual([secondChipComp[0], secondChipComp[1]]);
        expect(chipAreaComp.onSelection.emit).toHaveBeenCalledWith({
            originalEvent: null,
            owner: chipAreaComp,
            newSelection: [secondChipComp[0], secondChipComp[1]]
        });
    });
});
