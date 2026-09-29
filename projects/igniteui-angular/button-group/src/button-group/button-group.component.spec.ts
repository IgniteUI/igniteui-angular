import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { TestBed, fakeAsync, flushMicrotasks, waitForAsync } from '@angular/core/testing';
import { ButtonGroupAlignment, IButtonGroupButton, IButtonGroupEventArgs, IgxButtonGroupComponent } from './button-group.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxButtonDirective } from '../../../directives/src/directives/button/button.directive';
import { IgxRadioComponent } from '../../../radio/src/radio/radio.component';
import { UIInteractions, wait } from 'igniteui-angular/test-utils/ui-interactions.spec';
import { IgxRadioGroupDirective } from 'igniteui-angular/radio';

describe('IgxButtonGroup', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                InitButtonGroupComponent,
                InitButtonGroupWithValuesComponent,
                TemplatedButtonGroupComponent,
                TemplatedButtonGroupDesplayDensityComponent,
                ButtonGroupWithSelectedButtonComponent,
                ButtonGroupButtonWithBoundSelectedOutputComponent,
            ]
        }).compileComponents();
    }));

   it('should initialize buttonGroup with default values', () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const buttongroup = fixture.componentInstance.buttonGroup;

        expect(instance.buttonGroup).toBeDefined();
        expect(buttongroup instanceof IgxButtonGroupComponent).toBe(true);
        expect(instance.buttonGroup.id).toContain('igx-buttongroup-');
        expect(buttongroup.disabled).toBeFalsy();
        expect(buttongroup.alignment).toBe(ButtonGroupAlignment.horizontal);
        expect(buttongroup.selectionMode).toBe('single');
        expect(buttongroup.itemContentCssClass).toBeUndefined();
        expect(buttongroup.selectedIndexes.length).toEqual(1);
        expect(buttongroup.selectedButtons.length).toEqual(1);
    });

   it('should initialize buttonGroup with passed values', () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const buttongroup = fixture.componentInstance.buttonGroup;

        expect(instance.buttonGroup).toBeDefined();
        expect(buttongroup instanceof IgxButtonGroupComponent).toBe(true);
        expect(buttongroup.disabled).toBeFalsy();
        expect(buttongroup.alignment).toBe(ButtonGroupAlignment.vertical);
        expect(buttongroup.selectionMode).toBe('multi');
        expect(buttongroup.itemContentCssClass).toEqual('customContentStyle');
        expect(buttongroup.selectedIndexes.length).toEqual(0);
        expect(buttongroup.selectedButtons.length).toEqual(0);
    });

    it('should fire the selected event when a button is selected by user interaction, not on initial or programmatic selection', () => {
        const fixture = TestBed.createComponent(ButtonGroupWithSelectedButtonComponent);
        fixture.detectChanges();

        const btnGroupInstance = fixture.componentInstance.buttonGroup;
        spyOn(btnGroupInstance.selected, 'emit');

        btnGroupInstance.ngAfterViewInit();
        fixture.detectChanges();

        expect(btnGroupInstance.selected.emit).not.toHaveBeenCalled();

        btnGroupInstance.buttons[1].selected = true;
        fixture.detectChanges();

        expect(btnGroupInstance.selected.emit).not.toHaveBeenCalled();

        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        // The first button is already selected, so it should not fire the selected event, but the deselected one.
        expect(btnGroupInstance.selected.emit).not.toHaveBeenCalled();

        const unselectedButton = fixture.debugElement.nativeElement.querySelector('#unselected');
        unselectedButton.click();
        expect(btnGroupInstance.selected.emit).toHaveBeenCalled();
    });

    it('should fire the deselected event when a button is deselected by user interaction, not on programmatic deselection', () => {
        const fixture = TestBed.createComponent(ButtonGroupWithSelectedButtonComponent);
        fixture.detectChanges();

        const btnGroupInstance = fixture.componentInstance.buttonGroup;
        btnGroupInstance.buttons[0].selected = true;
        btnGroupInstance.buttons[1].selected = true;
        spyOn(btnGroupInstance.deselected, 'emit');

        btnGroupInstance.ngAfterViewInit();
        fixture.detectChanges();

        expect(btnGroupInstance.deselected.emit).not.toHaveBeenCalled();

        btnGroupInstance.buttons[1].selected = false;
        fixture.detectChanges();

        expect(btnGroupInstance.deselected.emit).not.toHaveBeenCalled();

        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();

        expect(btnGroupInstance.deselected.emit).toHaveBeenCalled();
    });

    it('should should reset its current selection state on selectionMode runtime change', async () => {
        const fixture = TestBed.createComponent(ButtonGroupWithSelectedButtonComponent);

        await wait();
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup;

        buttonGroup.selectionMode = 'multi';

        await wait();
        fixture.detectChanges();

        buttonGroup.selectButton(0);
        buttonGroup.selectButton(1);
        buttonGroup.selectButton(2);

        await wait();
        fixture.detectChanges();

        expect(buttonGroup.selectedButtons.length).toBe(3);


        buttonGroup.selectionMode = 'single';

        await wait();
        fixture.detectChanges();

        expect(buttonGroup.selectedButtons.length).toBe(0);
    });

   it('Button Group single selection', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);

        await wait();
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;

        buttongroup.selectButton(0);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(0);

        buttongroup.selectButton(2);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(2);
    });

    it('Button Group single required selection', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        await wait();
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        buttongroup.selectionMode = 'singleRequired';
        await wait();
        spyOn(buttongroup.deselected, 'emit');

        buttongroup.selectButton(0);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(0);

        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        await wait();

        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(0);
        expect(buttongroup.deselected.emit).not.toHaveBeenCalled();
    });

   it('Button Group multiple selection', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        await wait();
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        expect(buttongroup.selectionMode).toBe('multi');

        buttongroup.selectButton(1);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);

        buttongroup.selectButton(2);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(2);

        buttongroup.deselectButton(2);
        buttongroup.deselectButton(1);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(0);

        buttongroup.selectButton(0);
        buttongroup.selectButton(3);
        await wait();
        // Button 3 is disabled, but it can be selected
        expect(buttongroup.selectedButtons.length).toBe(2);
    });

    it('Button Group multiple selection with mouse click', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        await wait();
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        expect(buttongroup.selectionMode).toBe('multi');

        UIInteractions.simulateClickEvent(buttongroup.buttons[0].nativeElement);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);

        UIInteractions.simulateClickEvent(buttongroup.buttons[1].nativeElement);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(2);

        UIInteractions.simulateClickEvent(buttongroup.buttons[0].nativeElement);
        UIInteractions.simulateClickEvent(buttongroup.buttons[1].nativeElement);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(0);

        buttongroup.buttons[0].nativeElement.click();
        buttongroup.buttons[3].nativeElement.click();
        await wait();
        // Button 3 is disabled, and it should not be selected with mouse click
        expect(buttongroup.selectedButtons.length).toBe(1);
    });

    it('Button Group - templated buttons with multiple selection', async () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        await wait();
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        expect(buttongroup.buttons.length).toBe(4);
        expect(buttongroup.selectionMode).toBe('multi');

        buttongroup.selectButton(1);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);

        buttongroup.selectButton(2);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(2);

        buttongroup.deselectButton(1);
        buttongroup.deselectButton(2);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(0);

        buttongroup.selectButton(0);
        buttongroup.selectButton(3);
        await wait();
        // It should be possible to select disabled buttons
        expect(buttongroup.selectedButtons.length).toBe(2);

        buttongroup.deselectButton(3);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);
    });

    it('Button Group - templated buttons with single selection', async () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        await wait();
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        buttongroup.selectionMode = 'single';
        await wait();
        expect(buttongroup.buttons.length).toBe(4);
        expect(buttongroup.selectionMode).toBe('single');

        buttongroup.selectButton(1);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(1);

        buttongroup.selectButton(2);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(2);

        buttongroup.deselectButton(2);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(0);

        buttongroup.selectButton(0);
        buttongroup.selectButton(2);
        buttongroup.selectButton(3);
        await wait();
        expect(buttongroup.selectedButtons.length).toBe(1);
        // Button 3 is disabled, but it can be selected
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(3);
    });

    it('Button Group - selection handles wrong indexes gracefully', () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        let error = '';

        try {
            buttongroup.selectButton(-1);
            buttongroup.selectButton(3000);

            buttongroup.deselectButton(-1);
            buttongroup.deselectButton(3000);
        } catch (ex) {
            error = ex.message;
        }

        expect(error).toBe('');
    });

    it('Button Group - should support tab navigation', () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        const groupChildren = buttongroup.buttons;

        for (let i = 0; i < groupChildren.length; i++) {
            const button = groupChildren[i].nativeElement as HTMLButtonElement;
            expect(button.tagName).toBe('BUTTON');

            if (i < groupChildren.length - 1) {
                expect(button.disabled).toBe(false);
            } else {
                expect(button.disabled).toBe(true);
            }
        }
    });

    it('should style the corresponding button as deselected when the value bound to the selected input changes', fakeAsync(() => {
        const fixture = TestBed.createComponent(ButtonGroupButtonWithBoundSelectedOutputComponent);
        fixture.detectChanges();

        const btnGroupInstance = fixture.componentInstance.buttonGroup;

        expect(btnGroupInstance.selectedButtons.length).toBe(1);
        expect(btnGroupInstance.buttons[1].selected).toBe(true);

        fixture.componentInstance.selectedValue = 100;
        flushMicrotasks();
        fixture.detectChanges();

        btnGroupInstance.buttons.forEach((button) => {
            expect(button.selected).toBe(false);
        });
    }));

    it('should correctly change the selection state of a button group and styling of its buttons when bound to another component\'s selection', async () => {
        const fixture = TestBed.createComponent(ButtonGroupSelectionBoundToAnotherComponent);
        fixture.detectChanges();

        const radioGroup = fixture.componentInstance.radioGroup;
        const buttonGroup = fixture.componentInstance.buttonGroup;
        expect(radioGroup.radioButtons.last.checked).toBe(true);
        expect(buttonGroup.buttons[1].selected).toBe(true);
        expect(buttonGroup.buttons[1].nativeElement.classList.contains('igx-button-group__item--selected')).toBe(true);

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        await wait();

        expect(radioGroup.radioButtons.first.checked).toBe(true);
        expect(buttonGroup.buttons[0].selected).toBe(true);
        expect(buttonGroup.buttons[0].nativeElement.classList.contains('igx-button-group__item--selected')).toBe(true);
        expect(buttonGroup.buttons[1].selected).toBe(false);
        expect(buttonGroup.buttons[1].nativeElement.classList.contains('igx-button-group__item--selected')).toBe(false);

        radioGroup.radioButtons.last.select();
        fixture.detectChanges();
        await wait();

        expect(radioGroup.radioButtons.last.checked).toBe(true);
        expect(buttonGroup.buttons[1].selected).toBe(true);
        expect(buttonGroup.buttons[1].nativeElement.classList.contains('igx-button-group__item--selected')).toBe(true);
        expect(buttonGroup.buttons[0].selected).toBe(false);
        expect(buttonGroup.buttons[0].nativeElement.classList.contains('igx-button-group__item--selected')).toBe(false);
    });

    it('should emit selected event only once per selection', async() => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();
        await wait();

        const buttonGroup = fixture.componentInstance.buttonGroup;

        spyOn(buttonGroup.selected, 'emit').and.callThrough();

        buttonGroup.selectButton(0);
        await wait();
        fixture.detectChanges();

        const buttons = fixture.nativeElement.querySelectorAll('button');
        buttons[1].click();
        await wait();
        fixture.detectChanges();

        expect(buttonGroup.selected.emit).toHaveBeenCalledTimes(1);

        buttons[0].click();
        await wait();
        fixture.detectChanges();

        expect(buttonGroup.selected.emit).toHaveBeenCalledTimes(2);
    });

    it('should deselect the previously selected button only once in single selection mode', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();
        await wait();

        const buttonGroup = fixture.componentInstance.buttonGroup;
        buttonGroup.selectButton(0);
        await wait();

        spyOn(buttonGroup, 'updateDeselected').and.callThrough();

        // Assert synchronously, before the mutation observer re-syncs the state.
        buttonGroup.selectButton(2);
        expect(buttonGroup.updateDeselected).toHaveBeenCalledOnceWith(0);
    });

    describe('Rendering', () => {
        it('should apply the host bindings', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const host: HTMLElement = fixture.nativeElement.querySelector('igx-buttongroup');

            expect(fixture.componentInstance.buttonGroup.id).toBe('custom-button-group');
            expect(host.getAttribute('id')).toBe('custom-button-group');
            expect(host.getAttribute('role')).toBe('group');
            expect(host.classList).toContain('igx-button-group');
            expect(host.classList).not.toContain('igx-button-group--vertical');
            expect(host.style.zIndex).toBe('0');
        });

        it('should generate a unique id for each instance when one is not provided', () => {
            const first = TestBed.createComponent(InitButtonGroupComponent);
            first.detectChanges();
            const second = TestBed.createComponent(InitButtonGroupComponent);
            second.detectChanges();

            const firstId = first.componentInstance.buttonGroup.id;
            const secondId = second.componentInstance.buttonGroup.id;

            expect(firstId).toMatch(/^igx-buttongroup-\d+$/);
            expect(secondId).toMatch(/^igx-buttongroup-\d+$/);
            expect(secondId).not.toBe(firstId);
            expect(first.nativeElement.querySelector('igx-buttongroup').getAttribute('id')).toBe(firstId);
        });

        it('should toggle the vertical class when the alignment changes', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const host: HTMLElement = fixture.nativeElement.querySelector('igx-buttongroup');

            expect(buttonGroup.alignment).toBe(ButtonGroupAlignment.horizontal);
            expect(buttonGroup.isVertical).toBe(false);

            fixture.componentInstance.alignment = ButtonGroupAlignment.vertical;
            fixture.detectChanges();

            expect(buttonGroup.alignment).toBe(ButtonGroupAlignment.vertical);
            expect(buttonGroup.isVertical).toBe(true);
            expect(host.classList).toContain('igx-button-group--vertical');

            fixture.componentInstance.alignment = ButtonGroupAlignment.horizontal;
            fixture.detectChanges();

            expect(buttonGroup.alignment).toBe(ButtonGroupAlignment.horizontal);
            expect(buttonGroup.isVertical).toBe(false);
            expect(host.classList).not.toContain('igx-button-group--vertical');
        });

        it('should render a button for each item in values', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const values = fixture.componentInstance.buttonGroup.values;
            const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));

            expect(buttons.length).toBe(3);
            buttons.forEach((button, i) => {
                const content = button.querySelector('.igx-button-group__item-content');

                expect(button.getAttribute('type')).toBe('button');
                expect(button.classList).toContain(ITEM_CLASS);
                expect(button.getAttribute('aria-label')).toBe(values[i].label);
                expect(content.classList).toContain('custom-content');
                expect(content.querySelector('.igx-button-group__button-text').textContent.trim()).toBe(values[i].label);
            });

            expect(buttons[0].querySelector('igx-icon').textContent.trim()).toBe('format_bold');
            expect(buttons[1].querySelector('igx-icon').textContent.trim()).toBe('format_italic');
            expect(buttons[2].querySelector('igx-icon')).toBeNull();

            expect(buttons[0].getAttribute('data-togglable')).toBe('true');
            expect(buttons[1].getAttribute('data-togglable')).toBeNull();

            expect(buttons[0].disabled).toBe(false);
            expect(buttons[2].disabled).toBe(true);
        });

        it('should keep the previous itemContentCssClass when set to a falsy value', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            expect(buttonGroup.itemContentCssClass).toBe('custom-content');

            fixture.componentInstance.contentClass = '';
            fixture.detectChanges();

            expect(buttonGroup.itemContentCssClass).toBe('custom-content');
            const content = fixture.nativeElement.querySelector('.igx-button-group__item-content');
            expect(content.classList).toContain('custom-content');

            fixture.componentInstance.contentClass = 'other-content';
            fixture.detectChanges();

            expect(buttonGroup.itemContentCssClass).toBe('other-content');
            expect(content.classList).toContain('other-content');
            expect(content.classList).not.toContain('custom-content');
        });
    });

    describe('Selection', () => {
        it('should reflect the selection state in aria-pressed, CSS classes and values', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const [first, second] = buttonGroup.buttons.map(b => b.nativeElement);

            expect(buttonGroup.selectedIndexes).toEqual([1]);
            expect(second.getAttribute('aria-pressed')).toBe('true');
            expect(second.classList).toContain(SELECTED_CLASS);

            buttonGroup.selectButton(0);

            expect(buttonGroup.selectedIndexes).toEqual([0]);
            expect(buttonGroup.buttons[0].selected).toBe(true);
            expect(buttonGroup.values[0].selected).toBe(true);
            expect(first.getAttribute('aria-pressed')).toBe('true');
            expect(first.classList).toContain(SELECTED_CLASS);

            expect(buttonGroup.buttons[1].selected).toBe(false);
            expect(buttonGroup.values[1].selected).toBe(false);
            expect(second.getAttribute('aria-pressed')).toBe('false');
            expect(second.classList).not.toContain(SELECTED_CLASS);

            buttonGroup.deselectButton(0);

            expect(buttonGroup.selectedIndexes).toEqual([]);
            expect(buttonGroup.buttons[0].selected).toBe(false);
            expect(buttonGroup.values[0].selected).toBe(false);
            expect(first.getAttribute('aria-pressed')).toBe('false');
            expect(first.classList).not.toContain(SELECTED_CLASS);
        });

        it('should not duplicate indexes when re-selecting a button or deselecting a non-selected one', () => {
            const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;

            buttonGroup.selectButton(0);
            buttonGroup.selectButton(0);
            expect(buttonGroup.selectedIndexes).toEqual([0]);

            buttonGroup.deselectButton(1);
            expect(buttonGroup.selectedIndexes).toEqual([0]);
            expect(buttonGroup.buttons[1].nativeElement.getAttribute('aria-pressed')).toBe('false');
        });

        it('should emit deselected for the previous and selected for the clicked button in single selection mode', () => {
            const fixture = TestBed.createComponent(InitButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const events = trackEvents(buttonGroup);

            buttonGroup.buttons[0].nativeElement.click();

            expect(events.length).toBe(2);
            expectEvent(events[0], 'deselected', buttonGroup, 1);
            expectEvent(events[1], 'selected', buttonGroup, 0);
            expect(buttonGroup.selectedIndexes).toEqual([0]);
            expect(buttonGroup.buttons[1].selected).toBe(false);
        });

        it('should deselect the selected button on click in single selection mode', () => {
            const fixture = TestBed.createComponent(InitButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const events = trackEvents(buttonGroup);

            buttonGroup.buttons[1].nativeElement.click();

            expect(events.length).toBe(1);
            expectEvent(events[0], 'deselected', buttonGroup, 1);
            expect(buttonGroup.selectedIndexes).toEqual([]);
            expect(buttonGroup.selectedButtons).toEqual([]);
        });

        it('should switch the selection on click but never deselect in singleRequired selection mode', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.componentInstance.selectionMode = 'singleRequired';
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const events = trackEvents(buttonGroup);

            expect(buttonGroup.selectionMode).toBe('singleRequired');
            expect(buttonGroup.selectedIndexes).toEqual([1]);

            buttonGroup.buttons[0].nativeElement.click();

            expect(events.length).toBe(2);
            expectEvent(events[0], 'deselected', buttonGroup, 1);
            expectEvent(events[1], 'selected', buttonGroup, 0);
            expect(buttonGroup.selectedIndexes).toEqual([0]);

            buttonGroup.buttons[0].nativeElement.click();

            expect(events.length).toBe(2);
            expect(buttonGroup.selectedIndexes).toEqual([0]);
            expect(buttonGroup.buttons[0].selected).toBe(true);
        });

        it('should not deselect other buttons on click in multi selection mode', () => {
            const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const events = trackEvents(buttonGroup);

            buttonGroup.buttons[0].nativeElement.click();
            buttonGroup.buttons[1].nativeElement.click();

            expect(events.length).toBe(2);
            expectEvent(events[0], 'selected', buttonGroup, 0);
            expectEvent(events[1], 'selected', buttonGroup, 1);
            expect(buttonGroup.selectedIndexes).toEqual([0, 1]);

            buttonGroup.buttons[0].nativeElement.click();

            expect(events.length).toBe(3);
            expectEvent(events[2], 'deselected', buttonGroup, 0);
            expect(buttonGroup.selectedIndexes).toEqual([1]);
        });

        it('should keep the selection when selectionMode is set to its current value', () => {
            const fixture = TestBed.createComponent(InitButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            expect(buttonGroup.selectedIndexes).toEqual([1]);

            buttonGroup.selectionMode = 'single';

            expect(buttonGroup.selectedIndexes).toEqual([1]);
            expect(buttonGroup.buttons[1].selected).toBe(true);
        });

        it('should clear the selection state of the values when selectionMode changes', () => {
            const fixture = TestBed.createComponent(InitButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const selectedButton = buttonGroup.buttons[1].nativeElement;
            expect(buttonGroup.values[1].selected).toBe(true);

            buttonGroup.selectionMode = 'multi';

            expect(buttonGroup.selectionMode).toBe('multi');
            expect(buttonGroup.selectedIndexes).toEqual([]);
            expect(buttonGroup.values.every(v => !v.selected)).toBe(true);
            expect(selectedButton.getAttribute('aria-pressed')).toBe('false');
            expect(selectedButton.classList).not.toContain(SELECTED_CLASS);
        });

        it('should sync the selection when a value is marked as selected', async () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            spyOn(buttonGroup.selected, 'emit');

            buttonGroup.values[0].selected = true;
            fixture.detectChanges();
            await wait();
            fixture.detectChanges();

            expect(buttonGroup.selectedIndexes).toEqual([0]);
            expect(buttonGroup.buttons[0].nativeElement.getAttribute('aria-pressed')).toBe('true');
            expect(buttonGroup.buttons[1].selected).toBe(false);
            expect(buttonGroup.values[1].selected).toBe(false);
            expect(buttonGroup.buttons[1].nativeElement.getAttribute('aria-pressed')).toBe('false');
            expect(buttonGroup.selected.emit).not.toHaveBeenCalled();
        });

        it('should list value-based buttons before projected buttons', () => {
            const fixture = TestBed.createComponent(MixedButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const labels = buttonGroup.buttons.map(b => b.nativeElement.textContent.trim());

            expect(labels).toEqual(['Value 0', 'Value 1', 'Projected']);

            buttonGroup.selectButton(2);

            expect(buttonGroup.selectedButtons).toEqual([buttonGroup.buttons[2]]);
            expect(buttonGroup.values.every(v => !v.selected)).toBe(true);

            buttonGroup.selectButton(0);

            expect(buttonGroup.selectedButtons).toEqual([buttonGroup.buttons[0]]);
            expect(buttonGroup.values[0].selected).toBe(true);
            expect(buttonGroup.buttons[2].selected).toBe(false);
        });
    });

    describe('Disabled state', () => {
        it('should disable all value-based buttons when initially disabled', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            spyOn(buttonGroup.selected, 'emit');

            expect(buttonGroup.disabled).toBe(true);
            buttonGroup.buttons.forEach(button => {
                expect(button.disabled).toBe(true);
                expect(button.nativeElement.hasAttribute('disabled')).toBe(true);
            });

            buttonGroup.buttons[0].nativeElement.click();

            expect(buttonGroup.selected.emit).not.toHaveBeenCalled();
            expect(buttonGroup.selectedIndexes).toEqual([1]);
        });

        it('should disable all projected buttons when initially disabled', () => {
            const fixture = TestBed.createComponent(TemplatedDisabledButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            spyOn(buttonGroup.selected, 'emit');

            expect(buttonGroup.buttons.length).toBe(2);
            buttonGroup.buttons.forEach(button => {
                expect(button.disabled).toBe(true);
                expect(button.nativeElement.hasAttribute('disabled')).toBe(true);
            });

            buttonGroup.buttons[0].nativeElement.click();

            expect(buttonGroup.selected.emit).not.toHaveBeenCalled();
            expect(buttonGroup.selectedIndexes).toEqual([]);
        });

        it('should disable and enable value-based buttons at runtime', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            const buttons = buttonGroup.buttons;
            expect(buttons.map(b => b.disabled)).toEqual([false, false, true]);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(buttonGroup.disabled).toBe(true);
            expect(buttons.map(b => b.disabled)).toEqual([true, true, true]);

            fixture.componentInstance.disabled = false;
            fixture.detectChanges();

            expect(buttonGroup.disabled).toBe(false);
            expect(buttons[0].disabled).toBe(false);
            expect(buttons[1].disabled).toBe(false);
            expect(buttons[0].nativeElement.hasAttribute('disabled')).toBe(false);
            buttons[0].nativeElement.click();
            expect(buttonGroup.selectedIndexes).toEqual([0]);
        });

        it('should disable and enable projected buttons at runtime', () => {
            const fixture = TestBed.createComponent(TemplatedDisabledButtonGroupComponent);
            fixture.componentInstance.disabled = false;
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            expect(buttonGroup.buttons.every(b => !b.disabled)).toBe(true);

            buttonGroup.disabled = true;
            fixture.detectChanges();

            expect(buttonGroup.buttons.every(b => b.disabled)).toBe(true);
            expect(buttonGroup.buttons.every(b => b.nativeElement.hasAttribute('disabled'))).toBe(true);

            buttonGroup.disabled = false;
            fixture.detectChanges();

            expect(buttonGroup.buttons.every(b => !b.disabled)).toBe(true);
            expect(buttonGroup.buttons.every(b => !b.nativeElement.hasAttribute('disabled'))).toBe(true);
        });
    });

    describe('Dynamic buttons', () => {
        it('should re-initialize the buttons when the values change', () => {
            const fixture = TestBed.createComponent(ConfigurableButtonGroupComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            expect(buttonGroup.selectedIndexes).toEqual([1]);

            fixture.componentInstance.buttons = [
                { label: 'First' },
                { label: 'Second' },
                { label: 'Third', selected: true }
            ];
            fixture.detectChanges();

            expect(buttonGroup.buttons.length).toBe(3);
            buttonGroup.buttons.forEach(button => expect(button.nativeElement.classList).toContain(ITEM_CLASS));
            expect(buttonGroup.selectedIndexes).toEqual([2]);
            expect(buttonGroup.buttons[2].nativeElement.getAttribute('aria-pressed')).toBe('true');

            const events = trackEvents(buttonGroup);
            buttonGroup.buttons[0].nativeElement.click();

            expect(events.length).toBe(2);
            expectEvent(events[0], 'deselected', buttonGroup, 2);
            expectEvent(events[1], 'selected', buttonGroup, 0);
            expect(fixture.componentInstance.buttons[0].selected).toBe(true);
        });

        it('should initialize projected buttons added at runtime', () => {
            const fixture = TestBed.createComponent(ButtonGroupButtonWithBoundSelectedOutputComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            expect(buttonGroup.buttons.length).toBe(3);

            fixture.componentInstance.items.push({ key: 3, value: 'Button 4' });
            fixture.detectChanges();

            expect(buttonGroup.buttons.length).toBe(4);
            expect(buttonGroup.buttons[3].nativeElement.classList).toContain(ITEM_CLASS);
            expect(buttonGroup.selectedIndexes).toEqual([1]);

            const events = trackEvents(buttonGroup);

            // Previously initialized buttons should not keep their old click subscriptions.
            buttonGroup.buttons[0].nativeElement.click();
            expect(events.length).toBe(2);
            expectEvent(events[0], 'deselected', buttonGroup, 1);
            expectEvent(events[1], 'selected', buttonGroup, 0);

            buttonGroup.buttons[3].nativeElement.click();
            expect(events.length).toBe(4);
            expectEvent(events[2], 'deselected', buttonGroup, 0);
            expectEvent(events[3], 'selected', buttonGroup, 3);
            expect(buttonGroup.selectedIndexes).toEqual([3]);
        });

        it('should update the selection when the selected projected button is removed', () => {
            const fixture = TestBed.createComponent(ButtonGroupButtonWithBoundSelectedOutputComponent);
            fixture.detectChanges();

            const buttonGroup = fixture.componentInstance.buttonGroup;
            expect(buttonGroup.selectedIndexes).toEqual([1]);

            fixture.componentInstance.items.splice(1, 1);
            fixture.detectChanges();

            expect(buttonGroup.buttons.length).toBe(2);
            expect(buttonGroup.selectedIndexes).toEqual([]);
            expect(buttonGroup.selectedButtons).toEqual([]);
        });
    });

    it('should stop handling button clicks and disconnect the mutation observer on destroy', () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup;
        const button = buttonGroup.buttons[0];
        const clickSpy = spyOn(buttonGroup, '_clickHandler');

        button.buttonClick.emit(new MouseEvent('click'));
        expect(clickSpy).toHaveBeenCalledOnceWith(0);
        clickSpy.calls.reset();

        const disconnectSpy = spyOn(MutationObserver.prototype, 'disconnect').and.callThrough();
        fixture.destroy();

        expect(disconnectSpy).toHaveBeenCalled();

        button.buttonClick.emit(new MouseEvent('click'));
        expect(clickSpy).not.toHaveBeenCalled();
    });
});

const ITEM_CLASS = 'igx-button-group__item';
const SELECTED_CLASS = 'igx-button-group__item--selected';

interface ButtonGroupEvent {
    type: 'selected' | 'deselected';
    args: IButtonGroupEventArgs;
}

function trackEvents(buttonGroup: IgxButtonGroupComponent): ButtonGroupEvent[] {
    const events: ButtonGroupEvent[] = [];
    buttonGroup.selected.subscribe(args => events.push({ type: 'selected', args }));
    buttonGroup.deselected.subscribe(args => events.push({ type: 'deselected', args }));
    return events;
}

function expectEvent(event: ButtonGroupEvent, type: ButtonGroupEvent['type'], owner: IgxButtonGroupComponent, index: number) {
    expect(event.type).toBe(type);
    expect(event.args.owner).toBe(owner);
    expect(event.args.index).toBe(index);
    expect(event.args.button).toBe(owner.buttons[index]);
}

@Component({
    template: `<igx-buttongroup [values]="buttons"></igx-buttongroup>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent]
})
class InitButtonGroupComponent implements OnInit {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public buttons: IButtonGroupButton[];

    constructor() {}

    public ngOnInit(): void {
        this.buttons = [
            {
                disabled: false,
                label: 'Euro',
                selected: false
            },
            {
                label: 'British Pound',
                selected: true
            },
            {
                label: 'US Dollar',
                selected: false
            }
        ];
    }
}

@Component({
    template: `
    <igx-buttongroup [selectionMode]="'multi'" itemContentCssClass="customContentStyle"
        [values]="cities" [alignment]="alignment">
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent]
})
class InitButtonGroupWithValuesComponent implements OnInit {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public cities: IButtonGroupButton[];

    public alignment = ButtonGroupAlignment.vertical;

    constructor() {}

    public ngOnInit(): void {

        this.cities = [
            {
                disabled: false,
                label: 'Sofia',
                selected: false,
                togglable: false
            },
            {
                disabled: false,
                label: 'London',
                selected: false
            },
            {
                disabled: false,
                label: 'New York',
                selected: false
            },
            {
                disabled: true,
                label: 'Tokyo',
                selected: false
            }
        ];
    }
}


@Component({
    template: `
    <igx-buttongroup [selectionMode]="'multi'" [alignment]="alignment">
        <button igxButton>Sofia</button>
        <button igxButton>London</button>
        <button igxButton>New York</button>
        <button igxButton [disabled]="'true'">Tokio</button>
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class TemplatedButtonGroupComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public alignment = ButtonGroupAlignment.vertical;
}

@Component({
    template: `
    <igx-buttongroup [selectionMode]="'multi'">
        <button igxButton>Sofia</button>
        <button igxButton>London</button>
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class TemplatedButtonGroupDesplayDensityComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;
}

@Component({
    template: `
    <igx-buttongroup>
        <button igxButton [selected]="true">Button 0</button>
        <button igxButton id="unselected">Button 1</button>
        <button igxButton>Button 2</button>
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class ButtonGroupWithSelectedButtonComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;
}

@Component({
    template: `
    <igx-buttongroup>
        @for (item of items; track item.key) {
            <button igxButton [selected]="item.key === selectedValue">{{item.value}}</button>
        }
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class ButtonGroupButtonWithBoundSelectedOutputComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public items = [
        { key: 0, value: 'Button 1' },
        { key: 1, value: 'Button 2' },
        { key: 2, value: 'Button 3' },
    ];

    public selectedValue = 1;
}

@Component({
    template: `
    <igx-radio-group #radioGroup name="radioGroup">
        @for (item of ['Foo', 'Bar']; track item) {
            <igx-radio class="radio-sample" value="{{item}}" (change)="onRadioChange($event)" [checked]="selectedValue === item">
                {{ item }}
            </igx-radio>
        }
    </igx-radio-group>

    <igx-buttongroup #buttonGroup style="display: inline-block; margin-bottom: 10px;" selectionMode="singleRequired">
        <button igxButton
            [selected]="isFirstRadioButtonSelected"
        >
            <span>{{'test button 1'}}</span>
        </button>
        <button igxButton
            [selected]="!isFirstRadioButtonSelected"
        >
            <span>{{'test button 2'}}</span>
        </button>
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxRadioGroupDirective, IgxRadioComponent]
})
class ButtonGroupSelectionBoundToAnotherComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
    @ViewChild('buttonGroup', { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public selectedValue = 'Bar';

    public onRadioChange(event: { value: string; }) {
        this.selectedValue = event.value;
    }

    public get isFirstRadioButtonSelected() {
        return this.selectedValue === 'Foo';
    }
}

@Component({
    template: `
    <igx-buttongroup [id]="groupId" [values]="buttons" [disabled]="disabled" [selectionMode]="selectionMode"
        [alignment]="alignment" [itemContentCssClass]="contentClass">
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent]
})
class ConfigurableButtonGroupComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public groupId = 'custom-button-group';
    public disabled = false;
    public selectionMode: 'single' | 'singleRequired' | 'multi' = 'single';
    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.horizontal;
    public contentClass = 'custom-content';
    public buttons: IButtonGroupButton[] = [
        { label: 'Bold', icon: 'format_bold', togglable: true },
        { label: 'Italic', icon: 'format_italic', selected: true },
        { label: 'Underline', disabled: true }
    ];
}

@Component({
    template: `
    <igx-buttongroup [disabled]="disabled">
        <button igxButton>Button 0</button>
        <button igxButton>Button 1</button>
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class TemplatedDisabledButtonGroupComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public disabled = true;
}

@Component({
    template: `
    <igx-buttongroup [values]="buttons">
        <button igxButton>Projected</button>
    </igx-buttongroup>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class MixedButtonGroupComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public buttons: IButtonGroupButton[] = [
        { label: 'Value 0' },
        { label: 'Value 1' }
    ];
}
