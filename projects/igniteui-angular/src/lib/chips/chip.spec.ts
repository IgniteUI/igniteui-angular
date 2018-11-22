import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
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
import { IgxPrefixDirective } from './../directives/prefix/prefix.directive';
import { IgxLabelDirective } from './../directives/label/label.directive';
import { IgxSuffixDirective } from './../directives/suffix/suffix.directive';
import { DisplayDensity } from '../core/displayDensity';
import { UIInteractions} from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';

@Component({
    template: `
        <igx-chips-area #chipsArea>
            <igx-chip #chipElem *ngFor="let chip of chipList"
            [id]="chip.id" [draggable]="chip.draggable"
            [removable]="chip.removable" [selectable]="chip.selectable"
            [displayDensity]="chip.density" (onRemove)="chipRemoved($event)">
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
                <igx-icon igxPrefix fontSet="material">drag_indicator</igx-icon>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipComponent {

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: true },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true, density: 'comfortable' },
        { id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true, density: 'compact' },
        { id: 'FirstName', text: 'First Name', removable: true , selectable: true, draggable: true, density: 'cosy' }
    ];

    constructor(public cdr: ChangeDetectorRef) { }

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent})
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent})
    public chips: QueryList<IgxChipComponent>;

    chipRemoved(event) {
        this.chipList = this.chipList.filter((item) => {
            return item.id !== event.owner.id;
        });
        this.cdr.detectChanges();
    }
}

@Component({
    template: `
        <igx-chips-area>
            <igx-chip *ngFor="let chip of chipList">
                <span igxLabel>label</span>
                <span igxSuffix>suf</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipsLabelAndSuffixComponent {

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
    configureTestSuite();
    const CHIP = 'igx-chip';
    const CHIP_ITEM = 'igx-chip__item';
    const CHIP_PREFIX = 'igx-chip__prefix';
    const CHIP_REMOVE_BUTTON = 'igx-chip__remove';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestChipComponent,
                TestChipsLabelAndSuffixComponent,
                IgxLabelDirective
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
        const chipRemoveButton = chipElems[1].queryAll(By.css('.' + CHIP_REMOVE_BUTTON))[0];

        // For this second chip there are 3 elements. The prefix, content span and the remove button icon .
        expect(chipElems[1].nativeElement.children[0].children.length).toEqual(4);
        expect(chipRemoveButton).toBeTruthy();
    });

    it('should not trigger onRemove event when a chip is focused and delete button is pressed when not removable', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[0];
        spyOn(firstChipComp.onRemove, 'emit');
        firstChipComp.chipArea.nativeElement.focus();

        const focusedElems = firstChipComp.elementRef.nativeElement.querySelectorAll(':focus');
        expect(focusedElems.length).toEqual(1);
        expect(focusedElems[0].className).toEqual(CHIP_ITEM);

        const keyEvent = new KeyboardEvent('keydown', {
            'key': 'Delete'
        });
        firstChipComp.elementRef.nativeElement.dispatchEvent(keyEvent);
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
        expect(focusedElems[0].className).toEqual(CHIP_ITEM);

        const keyEvent = new KeyboardEvent('keydown', {
            'key': 'Delete'
        });
        secondChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();

        expect(secondChipComp.onRemove.emit).toHaveBeenCalled();
    });

    it('should set text in chips correctly', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChipTextElement = chipElements[0].queryAllNodes(By.css('.igx-chip__text'));
        const firstChipText = firstChipTextElement[0].nativeNode.innerHTML;

        expect(firstChipText).toContain('Country');

        const secondChipTextElement = chipElements[1].queryAllNodes(By.css('.igx-chip__text'));
        const secondChipText = secondChipTextElement[0].nativeNode.innerHTML;

        expect(secondChipText).toContain('City');
    });

    it('should set chips label correctly', () => {
        const fix = TestBed.createComponent(TestChipsLabelAndSuffixComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChipLabel = chipElements[0].queryAll(By.directive(IgxLabelDirective));
        const firstChipLabelText = firstChipLabel[0].nativeElement.innerHTML;

        expect(firstChipLabelText).toEqual('label');
    });

    it('should set chips prefix correctly', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChipPrefix = chipElements[0].queryAll(By.directive(IgxPrefixDirective));
        const firstChipIconName = firstChipPrefix[0].nativeElement.textContent;

        expect(firstChipIconName).toContain('drag_indicator');
    });

    it('should set chips suffix correctly', () => {
        const fix = TestBed.createComponent(TestChipsLabelAndSuffixComponent);
        fix.detectChanges();

        const chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
        const firstChipSuffix = chipElements[0].queryAll(By.directive(IgxSuffixDirective));
        const firstChipSuffixText = firstChipSuffix[0].nativeElement.innerHTML;

        expect(firstChipSuffixText).toEqual('suf');
    });

   it('should make chip comfortable when density is not set', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const firstComponent = components[0];

        const isFirstChipComfortable = firstComponent.componentInstance.isComfortable();
        expect(isFirstChipComfortable).toEqual(true);

        // Assert default css class is applied
        const comfortableComponents = fix.debugElement.queryAll(By.css('.igx-chip'));

        expect(comfortableComponents.length).toEqual(2);
        expect(comfortableComponents[0].nativeElement).toBe(firstComponent.nativeElement);
    });

    it('should make chip comfortable when density is set to comfortable', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const secondComponent = components[1];

        expect(secondComponent.componentInstance.displayDensity).toEqual(DisplayDensity.comfortable);

        // Assert default css class is applied
        const comfortableComponents = fix.debugElement.queryAll(By.css('.igx-chip'));

        expect(comfortableComponents.length).toEqual(2);
        expect(comfortableComponents[1].nativeElement).toBe(secondComponent.nativeElement);
    });

    it('should make chip compact when density is set to compact', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const thirdComponent = components[2];

        expect(thirdComponent.componentInstance.displayDensity).toEqual(DisplayDensity.compact);

        // Assert compact css class is added
        const compactComponents = fix.debugElement.queryAll(By.css('.igx-chip--compact'));

        expect(compactComponents.length).toEqual(1);
        expect(compactComponents[0].nativeElement).toBe(thirdComponent.nativeElement);
    });

    it('should make chip cosy when density is set to cosy', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const fourthComponent = components[3];

        expect(fourthComponent.componentInstance.displayDensity).toEqual(DisplayDensity.cosy);

        // Assert cosy css class is added
        const cosyComponents = fix.debugElement.queryAll(By.css('.igx-chip--cosy'));

        expect(cosyComponents.length).toEqual(1);
        expect(cosyComponents[0].nativeElement).toBe(fourthComponent.nativeElement);
    });

    it('should set correctly color of chip when color is set through code', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();
        const chipColor = 'rgb(255, 0, 0)';

        const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        const firstComponent = components[0];
        const chipAreaElem = firstComponent.queryAll(By.css('.igx-chip__item'))[0];

        firstComponent.componentInstance.color = chipColor;

        expect(chipAreaElem.nativeElement.style.backgroundColor).toEqual(chipColor);
        expect(firstComponent.componentInstance.color).toEqual(chipColor);
    });

    it('should delete chip when space button is pressed after chip delete button is focused', () => {
        const spaceKeyEvent = new KeyboardEvent('keydown', {
            'key': ' '
        });

        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        expect(chipComponents.length).toEqual(4);

        const deleteButtonElement = fix.debugElement.queryAll(By.css('.' + CHIP_REMOVE_BUTTON))[0];
        deleteButtonElement.nativeElement.focus();

        // Removes chip with id City, because country chip is unremovable
        deleteButtonElement.nativeElement.dispatchEvent(spaceKeyEvent);
        fix.detectChanges();

        chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        expect(chipComponents.length).toEqual(3);

        const chipComponentsIds = fix.componentInstance.chipList.map(c => c.id);

        expect(chipComponentsIds.length).toEqual(3);
        expect(chipComponentsIds).not.toContain('City');
    });

    it('should delete chip when enter button is pressed after chip delete button is focused', () => {
        const enterKeyEvent = new KeyboardEvent('keydown', {
            'key': 'Enter'
        });

        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();
        let chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));

        expect(chipComponents.length).toEqual(4);

        const deleteButtonElement = fix.debugElement.queryAll(By.css('.' + CHIP_REMOVE_BUTTON))[0];
        deleteButtonElement.nativeElement.focus();

        // Removes chip with id City, because country chip is unremovable
        deleteButtonElement.nativeElement.dispatchEvent(enterKeyEvent);
        fix.detectChanges();

        chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        expect(chipComponents.length).toEqual(3);

        const chipComponentsIds = fix.componentInstance.chipList.map(c => c.id);

        expect(chipComponentsIds.length).toEqual(3);
        expect(chipComponentsIds).not.toContain('City');
    });

    it('should affect the dragGhost density when chip has it set to compact', (done) => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const thirdChip = fix.componentInstance.chips.toArray()[2];
        const thirdChipElem = thirdChip.chipArea.nativeElement;

        const startingTop = thirdChipElem.getBoundingClientRect().top;
        const startingLeft = thirdChipElem.getBoundingClientRect().left;
        const startingBottom = thirdChipElem.getBoundingClientRect().bottom;
        const startingRight = thirdChipElem.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        UIInteractions.simulatePointerEvent('pointerdown', thirdChipElem, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', thirdChipElem, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(thirdChip.dragDir['_dragGhost'].className).toEqual('igx-chip__item igx-chip__ghost--compact');

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', thirdChip.dragDir['_dragGhost'], startingX + 10, startingY + 10);

            done();
        });
    });

    it('should fire onSelection event when selectable is true', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const secondChipComp = fix.componentInstance.chips.toArray()[1];

        spyOn(secondChipComp.onSelection, 'emit');
        secondChipComp.chipArea.nativeElement.focus();

        const keyEvent = new KeyboardEvent('keydown', {
            'key': ' '
        });
        secondChipComp.chipArea.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();
        expect(secondChipComp.onSelection.emit).toHaveBeenCalled();
    });

    it('should not fire onSelection event when selectable is false', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const firstChipComp = fix.componentInstance.chips.toArray()[0];

        spyOn(firstChipComp.onSelection, 'emit');
        firstChipComp.elementRef.nativeElement.focus();

        const keyEvent = new KeyboardEvent('keydown', {
            'key': ' '
        });
        firstChipComp.elementRef.nativeElement.dispatchEvent(keyEvent);
        fix.detectChanges();
        expect(firstChipComp.onSelection.emit).toHaveBeenCalledTimes(0);
    });

    it('should not fire onSelection event when the remove button is clicked', () => {
        const fix = TestBed.createComponent(TestChipComponent);
        fix.detectChanges();

        const secondChipComp = fix.componentInstance.chips.toArray()[1];

        spyOn(secondChipComp.onSelection, 'emit');

        const chipRemoveButton = secondChipComp.elementRef.nativeElement.querySelectorAll('.' + CHIP_REMOVE_BUTTON)[0];
        const removeBtnTop = chipRemoveButton.getBoundingClientRect().top;
        const removeBtnLeft = chipRemoveButton.getBoundingClientRect().left;

        UIInteractions.simulatePointerEvent('pointerdown', chipRemoveButton, removeBtnLeft, removeBtnTop);
        fix.detectChanges();
        UIInteractions.simulatePointerEvent('pointerup', chipRemoveButton, removeBtnLeft, removeBtnTop);
        fix.detectChanges();

        expect(secondChipComp.onSelection.emit).not.toHaveBeenCalled();
    });
});
