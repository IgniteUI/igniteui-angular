import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxChipComponent } from '../chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxPrefixDirective } from 'igniteui-angular/input-group';
import { UIInteractions, wait } from 'igniteui-angular/test-utils/ui-interactions.spec';
import { describe, it, expect, beforeEach, vi } from 'vitest';


@Component({
    template: `
        <igx-chips-area #chipsArea class="customClass">
            @for (chip of chipList; track chip.id) {
                <igx-chip #chipElem
                    [id]="chip.id" [draggable]="chip.draggable" [removable]="chip.removable" [selectable]="chip.selectable">
                    <igx-icon igxPrefix>drag_indicator</igx-icon>
                    <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
                </igx-chip>
            }
        </igx-chips-area>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxChipsAreaComponent, IgxChipComponent, IgxIconComponent, IgxPrefixDirective]
})
class TestChipComponent {
    public cdr = inject(ChangeDetectorRef);

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent })
    public chips: QueryList<IgxChipComponent>;

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: false },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true }
    ];
}

@Component({
    template: `
        <igx-chips-area #chipsArea>
            <igx-chip #chipElem [id]="'1'" [draggable]="true" [removable]="true" [selectable]="true" [selected]="true">
                <span #label [class]="'igx-chip__text'">first chip</span>
            </igx-chip>
            <igx-chip #chipElem [id]="'2'" [draggable]="false" [selectable]="false" [selected]="true">
                <span #label [class]="'igx-chip__text'">second chip</span>
            </igx-chip>
            <igx-chip #chipElem [id]="'3'" [draggable]="true" [removable]="true" [selectable]="true" [selected]="false">
                <span #label [class]="'igx-chip__text'">third chip</span>
            </igx-chip>
        </igx-chips-area>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxChipsAreaComponent, IgxChipComponent]
})
class TestChipSelectComponent extends TestChipComponent {
}

@Component({
    template: `
        <igx-chips-area #chipsArea (reorder)="chipsOrderChanged($event)">
            @for (chip of chipList; track chip.id) {
                <igx-chip #chipElem [id]="chip.id" [draggable]="true"
                    [removable]="true" [selectable]="true" (remove)="chipRemoved($event)">
                    <igx-icon igxPrefix>drag_indicator</igx-icon>
                    <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
                </igx-chip>
            }
        </igx-chips-area>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxChipsAreaComponent, IgxChipComponent, IgxIconComponent, IgxPrefixDirective]
})
class TestChipReorderComponent {
    public cdr = inject(ChangeDetectorRef);

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent })
    public chips: QueryList<IgxChipComponent>;

    public chipList = [
        { id: 'Country', text: 'Country' },
        { id: 'City', text: 'City' },
        { id: 'Town', text: 'Town' },
        { id: 'FirstName', text: 'First Name' },
    ];

    public chipsOrderChanged(event) {
        const newChipList = [];
        for (const chip of event.chipsArray) {
            newChipList.push(this.chipList.find((item) => item.id === chip.id));
        }
        this.chipList = newChipList;
    }

    public chipRemoved(event) {
        this.chipList = this.chipList.filter((item) => item.id !== event.owner.id);
        this.chipsArea.cdr.detectChanges();
    }
}


interface PagePoint {
    pageX: number;
    pageY: number;
}

/** Center of an element in page coordinates (what the drag directive works with). */
const getPageCenter = (element: HTMLElement): PagePoint => {
    const rect = element.getBoundingClientRect();
    return {
        pageX: rect.left + rect.width / 2 + window.scrollX,
        pageY: rect.top + rect.height / 2 + window.scrollY
    };
};

/**
 * The drop target of a drag is found with `document.elementsFromPoint`, which only sees the visible viewport.
 * Test files share one page, so content left by earlier files may push the fixture out of view.
 * Call before measuring positions that a drag relies on.
 */
const ensureFixtureInView = (fixture: ComponentFixture<any>) => {
    (fixture.nativeElement as HTMLElement).scrollIntoView({ block: 'nearest', inline: 'nearest' });
};

/** Ids of the rendered chips, in DOM order. */
const getRenderedChipIds = (fixture: ComponentFixture<any>): string[] =>
    fixture.debugElement.queryAll(By.directive(IgxChipComponent)).map(c => c.componentInstance.id);

/**
 * Presses the chip, moves the pointer past the drag tolerance (so the drag and the ghost start)
 * and then over the center of `target`. The offsets are derived from the actual layout, so the
 * pointer ends up over the target regardless of the chip sizes, fonts or page scroll.
 *
 * @returns The page point the pointer was moved to.
 */
const dragChipOver = (fixture: ComponentFixture<any>, chip: IgxChipComponent, target: HTMLElement | PagePoint): PagePoint => {
    const dragDir = chip.dragDirective;
    ensureFixtureInView(fixture);
    const start = getPageCenter(chip.chipArea.nativeElement);
    const end = target instanceof HTMLElement ? getPageCenter(target) : target;
    const toleranceStep = Math.sign(end.pageX - start.pageX || 1) * (dragDir.dragTolerance + 5);

    dragDir.onPointerDown({ pointerId: 1, pageX: start.pageX, pageY: start.pageY } as PointerEvent);
    fixture.detectChanges();

    dragDir.onPointerMove({ pointerId: 1, pageX: start.pageX + toleranceStep, pageY: start.pageY } as PointerEvent);
    fixture.detectChanges();

    dragDir.onPointerMove({ pointerId: 1, pageX: end.pageX, pageY: end.pageY } as PointerEvent);
    fixture.detectChanges();
    return end;
};

/** Releases the pointer over the given page point and waits for the drop to complete. */
const releaseChip = async (fixture: ComponentFixture<any>, chip: IgxChipComponent, at: PagePoint) => {
    chip.dragDirective.onPointerUp({ pointerId: 1, pageX: at.pageX, pageY: at.pageY } as PointerEvent);
    fixture.detectChanges();
    await vi.waitFor(() => {
        expect(chip.dragDirective.ghostElement).toBeFalsy();
    });
    fixture.detectChanges();
    await fixture.whenStable();
};

describe('IgxChipsArea ', () => {
    const CHIP_REMOVE_BUTTON = 'igx-chip__remove';
    const CHIP_AREA_CLASS = 'igx-chip-area';

    let fix;
    let chipArea: IgxChipsAreaComponent;
    let chipAreaElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TestChipComponent,
                TestChipReorderComponent,
                TestChipSelectComponent
            ]
        }).compileComponents();
    });

    describe('Basic', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
        });

        it('should add chips when adding data items ', () => {
            expect(chipAreaElement.nativeElement.classList).toHaveLength(2);
            expect(Array.from(chipAreaElement.nativeElement.classList)).toEqual(expect.arrayContaining(['customClass', CHIP_AREA_CLASS]));
            expect(chipAreaElement.nativeElement.children.length).toEqual(2);

            fix.componentInstance.chipList.push({ id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true });

            fix.detectChanges();

            expect(chipAreaElement.nativeElement.children.length).toEqual(3);
        });

        it('should remove chips when removing data items ', () => {
            expect(chipAreaElement.nativeElement.children.length).toEqual(2);

            fix.componentInstance.chipList.pop();
            fix.detectChanges();

            expect(chipAreaElement.nativeElement.children.length).toEqual(1);
        });

        it('should change data in chips when data item is changed', () => {
            expect(chipAreaElement.nativeElement.children[0].innerHTML).toContain('Country');

            fix.componentInstance.chipList[0].text = 'New text';
            fix.detectChanges();

            expect(chipAreaElement.nativeElement.children[0].innerHTML).toContain('New text');
        });
    });


    describe('Selection', () => {
        const spaceKeyEvent = new KeyboardEvent('keydown', { key: ' ' });

        it('should be able to select chip using input property', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];
            const thirdChipComp = fix.componentInstance.chips.toArray()[2];

            expect(firstChipComp.selected).toBe(true);
            expect(secondChipComp.selected).toBe(true);
            expect(thirdChipComp.selected).toBe(false);
        });

        it('should emit selectionChange for the chipArea event when there are initially selected chips through their inputs', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            chipArea = fix.componentInstance.chipsArea;

            vi.spyOn(chipArea.selectionChange, 'emit');

            fix.detectChanges();

            const chipComponents = fix.componentInstance.chips.toArray();
            expect(chipArea.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: null,
                owner: chipArea,
                newSelection: [chipComponents[0], chipComponents[1]]
            });
        });

        it('should focus on chip correctly', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];

            firstChipComp.nativeElement.focus();
            expect(document.activeElement).toBe(firstChipComp.nativeElement);

            secondChipComp.nativeElement.focus();
            expect(document.activeElement).toBe(secondChipComp.nativeElement);
        });

        it('should focus on previous and next chips after arrows are pressed', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];

            firstChipComp.nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(firstChipComp.nativeElement);

            const rightKey = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            firstChipComp.onChipKeyDown(rightKey);
            fix.detectChanges();

            expect(document.activeElement).toBe(secondChipComp.nativeElement);

            const leftKey = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            secondChipComp.onChipKeyDown(leftKey);
            fix.detectChanges();

            expect(document.activeElement).toBe(firstChipComp.nativeElement);
        });

        it('should fire selectionChange event', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            fix.componentInstance.cdr.detectChanges();

            const secondChipComp: IgxChipComponent = fix.componentInstance.chips.toArray()[1];
            const chipAreaComp: IgxChipsAreaComponent = fix.debugElement.query(By.directive(IgxChipsAreaComponent)).componentInstance;
            vi.spyOn(chipAreaComp.selectionChange, 'emit');

            secondChipComp.onChipKeyDown(spaceKeyEvent);
            fix.detectChanges();

            expect(chipAreaComp.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: spaceKeyEvent,
                owner: chipAreaComp,
                newSelection: [secondChipComp]
            });

            let chipsSelectionStates = fix.componentInstance.chips.toArray().filter(c => c.selected);
            expect(chipsSelectionStates.length).toEqual(1);
            expect(secondChipComp.selected).toBeTruthy();

            secondChipComp.onChipKeyDown(spaceKeyEvent);
            fix.detectChanges();

            expect(chipAreaComp.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: spaceKeyEvent,
                owner: chipAreaComp,
                newSelection: []
            });

            chipsSelectionStates = fix.componentInstance.chips.toArray().filter(c => c.selected);
            expect(chipsSelectionStates.length).toEqual(0);
            expect(secondChipComp.selected).not.toBeTruthy();
        });

        it('should be able to have multiple chips selected', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            const chipAreaComponent = fix.componentInstance;

            chipAreaComponent.chipList.push({ id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true });
            fix.detectChanges();

            vi.spyOn(chipAreaComponent.chipsArea.selectionChange, `emit`);
            chipAreaComponent.chipsArea.chipsList.toArray()[1].selected = true;
            fix.detectChanges();
            chipAreaComponent.chipsArea.chipsList.toArray()[2].selected = true;
            fix.detectChanges();

            const secondChipComp = fix.componentInstance.chips.toArray()[1];
            const thirdChipComp = fix.componentInstance.chips.toArray()[2];
            expect(chipAreaComponent.chipsArea.selectionChange.emit).toHaveBeenCalledTimes(2);
            expect(chipAreaComponent.chipsArea.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: null,
                owner: chipAreaComponent.chipsArea,
                newSelection: [secondChipComp, thirdChipComp]
            });
        });

        it('should be able to select chip using input property', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            fix.detectChanges();

            const firstChipComp = fix.componentInstance.chips.toArray()[0];
            const secondChipComp = fix.componentInstance.chips.toArray()[1];
            const thirdChipComp = fix.componentInstance.chips.toArray()[2];

            expect(firstChipComp.selected).toBe(true);
            expect(secondChipComp.selected).toBe(true);
            expect(thirdChipComp.selected).toBe(false);
        });

        it('should emit onSelection for the chipArea event when there are initially selected chips through their inputs', () => {
            fix = TestBed.createComponent(TestChipSelectComponent);
            chipArea = fix.componentInstance.chipsArea;

            vi.spyOn(chipArea.selectionChange, 'emit');

            fix.detectChanges();

            const chipComponents = fix.componentInstance.chips.toArray();
            expect(chipArea.selectionChange.emit).toHaveBeenCalledWith({
                originalEvent: null,
                owner: chipArea,
                newSelection: [chipComponents[0], chipComponents[1]]
            });
        });

        it('should be able to select chip using api when selectable is set to false', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            const igxChip = fix.componentInstance.chipsArea.chipsList.toArray()[0];
            const igxChipItem = igxChip.nativeElement.children[0]; // Return igx-chip__item

            igxChip.selected = true;
            fix.detectChanges();

            expect(igxChip.selected).toBe(true);
            expect(igxChipItem.classList.contains(`igx-chip__item--selected`)).toBe(true);
        });

        it('should fire only onSelection event for chip area when selecting a chip using spacebar', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            fix.componentInstance.cdr.detectChanges();

            chipArea = fix.componentInstance.chipsArea;
            const secondChip = fix.componentInstance.chips.toArray()[1];

            vi.spyOn(chipArea.reorder, 'emit');
            vi.spyOn(chipArea.selectionChange, 'emit');
            vi.spyOn(chipArea.moveStart, 'emit');
            vi.spyOn(chipArea.moveEnd, 'emit');


            secondChip.onChipKeyDown(spaceKeyEvent);
            fix.detectChanges();

            expect(chipArea.selectionChange.emit).toHaveBeenCalled();
            expect(chipArea.reorder.emit).not.toHaveBeenCalled();
            expect(chipArea.moveStart.emit).not.toHaveBeenCalled();
            expect(chipArea.moveEnd.emit).not.toHaveBeenCalled();
        });

        it('should select a chip by clicking on it and emit onSelection event', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            chipArea = fix.componentInstance.chipsArea;
            const secondChip = fix.componentInstance.chips.toArray()[1];
            const pointerUpEvt = new PointerEvent('pointerup');

            vi.spyOn(chipArea.selectionChange, 'emit');
            fix.detectChanges();

            secondChip.onChipDragClicked({
                originalEvent: pointerUpEvt,
                owner: secondChip.dragDirective,
                pageX: 0, pageY: 0, startX: 0, startY: 0
            });
            fix.detectChanges();

            expect(chipArea.selectionChange.emit).toHaveBeenCalled();
            expect(chipArea.selectionChange.emit).not.toHaveBeenCalledWith({
                originalEvent: pointerUpEvt,
                owner: chipArea,
                newSelection: [secondChip]
            });
        });

        it('should persist selected state when it is dragged and dropped', async () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            ensureFixtureInView(fix);

            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const firstChip: IgxChipComponent = chipComponents[0].componentInstance;
            const secondChip: IgxChipComponent = chipComponents[1].componentInstance;
            const secondChipItem: HTMLElement = secondChip.chipArea.nativeElement;
            const moveEndSpy = vi.spyOn(secondChip.moveEnd, 'emit');

            secondChip.animateOnRelease = false;
            secondChip.onChipKeyDown(spaceKeyEvent);
            fix.detectChanges();
            expect(secondChip.selected).toBe(true);

            const dropPoint = dragChipOver(fix, secondChip, firstChip.chipArea.nativeElement);
            expect(secondChip.dragDirective.ghostElement).toBeTruthy();
            expect(secondChip.selected).toBe(true);

            await releaseChip(fix, secondChip, dropPoint);

            expect(moveEndSpy).toHaveBeenCalledTimes(1);
            expect(firstChip.selected).toBe(false);
            expect(secondChip.selected).toBe(true);
            expect(secondChipItem.classList.contains('igx-chip__item--selected')).toBe(true);
            // a selected chip gets focused once it is dropped
            expect(document.activeElement).toBe(secondChip.nativeElement);
        });
    });

    describe('Reorder', () => {
        const leftKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true });
        const rightKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true });
        const deleteKeyEvent = new KeyboardEvent('keydown', { key: 'Delete' });

        beforeEach(() => {
            fix = TestBed.createComponent(TestChipReorderComponent);
            fix.detectChanges();
            fix.componentInstance.cdr.detectChanges();
        });

        it('should reorder chips when shift + leftarrow and shift + rightarrow is pressed', async () => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const firstChipAreaElem = chipComponents[0].componentInstance.nativeElement;
            const secondChipAreaElem = chipComponents[1].componentInstance.nativeElement;
            const firstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            const secondChipLeft = secondChipAreaElem.getBoundingClientRect().left;
            expect(getRenderedChipIds(fix)).toEqual(['Country', 'City', 'Town', 'FirstName']);

            firstChipAreaElem.dispatchEvent(rightKeyEvent);
            fix.detectChanges();

            expect(getRenderedChipIds(fix)).toEqual(['City', 'Country', 'Town', 'FirstName']);
            let newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            let newSecondChipLeft = secondChipAreaElem.getBoundingClientRect().left;
            expect(firstChipLeft).toBeLessThan(newFirstChipLeft);
            expect(newSecondChipLeft).toBeLessThan(secondChipLeft);
            // the chips swapped places
            expect(newSecondChipLeft).toBeCloseTo(firstChipLeft, 0);

            firstChipAreaElem.dispatchEvent(leftKeyEvent);
            fix.detectChanges();
            // moving a chip to the left restores its focus asynchronously
            await wait();

            expect(getRenderedChipIds(fix)).toEqual(['Country', 'City', 'Town', 'FirstName']);
            expect(document.activeElement).toBe(firstChipAreaElem);
            newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            newSecondChipLeft = secondChipAreaElem.getBoundingClientRect().left;

            expect(newFirstChipLeft).toBeCloseTo(firstChipLeft, 0);
            expect(newSecondChipLeft).toBeCloseTo(secondChipLeft, 0);
        });

        it('should reorder chips and keeps focus when Shift + Left Arrow is pressed and Shift + Right Arrow is pressed twice', (async () => {
            chipArea = fix.componentInstance.chipsArea;
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const targetChip = chipComponents[2].componentInstance;
            const targetChipElem = targetChip.nativeElement;

            targetChipElem.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(targetChipElem);
            expect(chipArea.chipsList.toArray()[2].id).toEqual('Town');
            expect(chipArea.chipsList.toArray()[3].id).toEqual('FirstName');

            targetChip.onChipKeyDown(rightKeyEvent);
            fix.detectChanges();

            expect(document.activeElement).toBe(targetChipElem);
            expect(chipArea.chipsList.toArray()[2].id).toEqual('FirstName');
            expect(chipArea.chipsList.toArray()[3].id).toEqual('Town');

            targetChip.onChipKeyDown(leftKeyEvent);
            fix.detectChanges();
            await wait();

            expect(document.activeElement).toBe(targetChipElem);
            expect(chipArea.chipsList.toArray()[2].id).toEqual('Town');
            expect(chipArea.chipsList.toArray()[3].id).toEqual('FirstName');

            targetChip.onChipKeyDown(leftKeyEvent);
            fix.detectChanges();
            await wait();

            expect(document.activeElement).toBe(targetChipElem);
            expect(chipArea.chipsList.toArray()[2].id).toEqual('City');
            expect(chipArea.chipsList.toArray()[3].id).toEqual('FirstName');
        }));

        it('should not reorder chips for shift + leftarrow when the chip is going out of bounds', () => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            const firstChipAreaElem = chipComponents[0].componentInstance.chipArea.nativeElement;
            const firstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            firstChipAreaElem.dispatchEvent(leftKeyEvent);
            fix.detectChanges();

            const newFirstChipLeft = firstChipAreaElem.getBoundingClientRect().left;
            expect(firstChipLeft).toEqual(newFirstChipLeft);
        });

        it('should not reorder chips for shift + rightarrow when the chip is going out of bounds', () => {
            const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            const lastChipAreaElem = chipComponents[chipComponents.length - 1].componentInstance.chipArea.nativeElement;
            const lastChipLeft = lastChipAreaElem.getBoundingClientRect().left;
            lastChipAreaElem.dispatchEvent(rightKeyEvent);
            fix.detectChanges();

            const newLastChipLeft = lastChipAreaElem.getBoundingClientRect().left;
            expect(newLastChipLeft).toEqual(lastChipLeft);
        });

        it('should delete chip when delete key is pressed and chip is removable', () => {
            let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            expect(chipComponents.length).toEqual(4);

            const firstChipComp = chipComponents[0].componentInstance;
            firstChipComp.onChipKeyDown(deleteKeyEvent);
            fix.detectChanges();

            chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chipComponents.length).toEqual(3);
        });

        it('should delete chip when delete button is clicked', () => {
            let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chipComponents.length).toEqual(4);

            const deleteButtonElement = fix.debugElement.queryAll(By.css('.' + CHIP_REMOVE_BUTTON))[0];
            deleteButtonElement.nativeElement.click();
            fix.detectChanges();

            chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chipComponents.length).toEqual(3);
        });

        it('should not fire any event of the chip area when attempting deleting of a chip', () => {
            chipArea = fix.componentInstance.chipsArea;
            const secondChip = fix.componentInstance.chips.toArray()[1];

            vi.spyOn(chipArea.reorder, 'emit');
            vi.spyOn(chipArea.selectionChange, 'emit');
            vi.spyOn(chipArea.moveStart, 'emit');
            vi.spyOn(chipArea.moveEnd, 'emit');
            vi.spyOn(secondChip.remove, 'emit');

            secondChip.onChipKeyDown(deleteKeyEvent);
            fix.detectChanges();

            expect(secondChip.remove.emit).toHaveBeenCalled();
            expect(chipArea.reorder.emit).not.toHaveBeenCalled();
            expect(chipArea.selectionChange.emit).not.toHaveBeenCalled();
            expect(chipArea.moveStart.emit).not.toHaveBeenCalled();
            expect(chipArea.moveEnd.emit).not.toHaveBeenCalled();
        });
    });

    describe('Interaction', () => {
        it('should not be able to drag and drop when chip is not draggable', async () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            ensureFixtureInView(fix);

            chipArea = fix.componentInstance.chipsArea;
            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const firstChip: IgxChipComponent = chipComponents[0].componentInstance;
            const secondChip: IgxChipComponent = chipComponents[1].componentInstance;
            const reorderSpy = vi.spyOn(chipArea.reorder, 'emit');

            const dropPoint = dragChipOver(fix, firstChip, secondChip.chipArea.nativeElement);

            expect(firstChip.dragDirective.ghostElement).toBeUndefined();
            expect(firstChip.chipArea.nativeElement.style.visibility).toBe('visible');

            await releaseChip(fix, firstChip, dropPoint);

            expect(reorderSpy).not.toHaveBeenCalled();
            expect(getRenderedChipIds(fix)).toEqual(['Country', 'City']);
        });

        it('should be able to drag when chip is draggable', async () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            ensureFixtureInView(fix);

            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const secondChip: IgxChipComponent = chipComponents[1].componentInstance;
            const secondChipElem: HTMLElement = secondChip.chipArea.nativeElement;
            secondChip.animateOnRelease = false;

            const startingRect = secondChipElem.getBoundingClientRect();
            const startingCenter = getPageCenter(secondChipElem);

            const xDragDifference = 200;
            const yDragDifference = 100;
            const dropPoint = dragChipOver(fix, secondChip, {
                pageX: startingCenter.pageX + xDragDifference,
                pageY: startingCenter.pageY + yDragDifference
            });

            const ghostElement: HTMLElement = secondChip.dragDirective.ghostElement;
            expect(ghostElement).toBeTruthy();
            // the base element is hidden while its ghost is dragged
            expect(secondChipElem.style.visibility).toBe('hidden');

            const afterDragRect = ghostElement.getBoundingClientRect();
            expect(afterDragRect.top - startingRect.top).toBeCloseTo(yDragDifference, 0);
            expect(afterDragRect.left - startingRect.left).toBeCloseTo(xDragDifference, 0);

            await releaseChip(fix, secondChip, dropPoint);

            expect(ghostElement.isConnected).toBe(false);
            expect(secondChipElem.style.visibility).toBe('visible');
        });

        it('should fire correctly reorder event when element is dragged and dropped to the right', async () => {
            fix = TestBed.createComponent(TestChipReorderComponent);
            fix.detectChanges();
            ensureFixtureInView(fix);

            chipArea = fix.componentInstance.chipsArea;
            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));

            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const firstChip: IgxChipComponent = chipComponents[0].componentInstance;
            const secondChip: IgxChipComponent = chipComponents[1].componentInstance;
            const reorderSpy = vi.spyOn(chipArea.reorder, 'emit');

            firstChip.animateOnRelease = false;
            secondChip.animateOnRelease = false;

            const firstChipElem: HTMLElement = firstChip.chipArea.nativeElement;
            const secondChipElem: HTMLElement = secondChip.chipArea.nativeElement;
            expect(getRenderedChipIds(fix)).toEqual(['Country', 'City', 'Town', 'FirstName']);

            const firstChipLeft = firstChipElem.getBoundingClientRect().left;
            const dropPoint = dragChipOver(fix, firstChip, secondChipElem);

            // the chips are reordered as soon as the dragged chip enters the other one
            await vi.waitFor(() => {
                expect(reorderSpy).toHaveBeenCalledTimes(1);
            });
            expect(reorderSpy.mock.calls[0][0].chipsArray.map(c => c.id)).toEqual(['City', 'Country', 'Town', 'FirstName']);
            fix.detectChanges();
            expect(getRenderedChipIds(fix)).toEqual(['City', 'Country', 'Town', 'FirstName']);

            await releaseChip(fix, firstChip, dropPoint);

            expect(reorderSpy).toHaveBeenCalledTimes(1);
            expect(getRenderedChipIds(fix)).toEqual(['City', 'Country', 'Town', 'FirstName']);

            const afterDropSecondChipLeft = secondChipElem.getBoundingClientRect().left;
            expect(afterDropSecondChipLeft).toBeCloseTo(firstChipLeft, 0);

            const afterDropFirstChipLeft = firstChipElem.getBoundingClientRect().left;
            expect(afterDropFirstChipLeft).toBeGreaterThan(firstChipLeft);
        });

        it('should fire correctly reorder event when element is dragged and dropped to the left', async () => {
            fix = TestBed.createComponent(TestChipReorderComponent);
            fix.detectChanges();
            ensureFixtureInView(fix);

            chipArea = fix.componentInstance.chipsArea;
            chipAreaElement = fix.debugElement.query(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement.queryAll(By.directive(IgxChipComponent));
            const firstChip: IgxChipComponent = chipComponents[0].componentInstance;
            const secondChip: IgxChipComponent = chipComponents[1].componentInstance;
            const reorderSpy = vi.spyOn(chipArea.reorder, 'emit');

            firstChip.animateOnRelease = false;
            secondChip.animateOnRelease = false;

            const firstChipElem: HTMLElement = firstChip.chipArea.nativeElement;
            const secondChipElem: HTMLElement = secondChip.chipArea.nativeElement;
            expect(getRenderedChipIds(fix)).toEqual(['Country', 'City', 'Town', 'FirstName']);

            const firstChipLeft = firstChipElem.getBoundingClientRect().left;
            const dropPoint = dragChipOver(fix, secondChip, firstChipElem);

            await vi.waitFor(() => {
                expect(reorderSpy).toHaveBeenCalledTimes(1);
            });
            expect(reorderSpy.mock.calls[0][0].chipsArray.map(c => c.id)).toEqual(['City', 'Country', 'Town', 'FirstName']);
            fix.detectChanges();
            expect(getRenderedChipIds(fix)).toEqual(['City', 'Country', 'Town', 'FirstName']);

            await releaseChip(fix, secondChip, dropPoint);

            expect(reorderSpy).toHaveBeenCalledTimes(1);
            expect(getRenderedChipIds(fix)).toEqual(['City', 'Country', 'Town', 'FirstName']);

            const afterDropSecondChipLeft = secondChipElem.getBoundingClientRect().left;
            expect(afterDropSecondChipLeft).toBeCloseTo(firstChipLeft, 0);

            const afterDropFirstChipLeft = firstChipElem.getBoundingClientRect().left;
            expect(afterDropFirstChipLeft).toBeGreaterThan(firstChipLeft);
        });

        it('should fire chipClick event', () => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();

            const firstChipComp: IgxChipComponent = fix.componentInstance.chips.toArray()[1];
            vi.spyOn(firstChipComp.chipClick, 'emit');

            UIInteractions.clickDragDirective(fix, firstChipComp.dragDirective);

            expect(firstChipComp.chipClick.emit).toHaveBeenCalled();
        });
    });
});
