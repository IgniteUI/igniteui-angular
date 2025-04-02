import { expect, vi } from 'vitest';
import { Component, OnInit, viewChild } from '@angular/core';
import { TestBed, fakeAsync, flushMicrotasks, waitForAsync } from '@angular/core/testing';
import { ButtonGroupAlignment, IgxButtonGroupComponent } from './buttonGroup.component';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxRadioGroupDirective } from '../directives/radio/radio-group.directive';
import { IgxRadioComponent } from '../radio/radio.component';

interface IButton {
    type?: string;
    ripple?: string;
    label?: string;
    disabled?: boolean;
    togglable?: boolean;
    selected?: boolean;
    color?: string;
    bgcolor?: string;
    icon?: string;
}

class Button {
    private type: string;
    private ripple: string;
    private label: string;
    private disabled: boolean;
    private togglable: boolean;
    private selected: boolean;
    private color: string;
    private bgcolor: string;
    private icon: string;

    constructor(obj?: IButton) {
        this.type = obj.type || 'contained';
        this.ripple = obj.ripple || 'orange';
        this.label = obj.label || 'Button label';
        this.selected = obj.selected || false;
        this.togglable = obj.togglable && true;
        this.disabled = obj.disabled || false;
        this.color = obj.color || '#484848';
        this.bgcolor = obj.bgcolor || 'white';
        this.icon = obj.icon || '';
    }
}


describe('IgxButtonGroup', () => {
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                InitButtonGroupComponent,
                InitButtonGroupWithValuesComponent,
                TemplatedButtonGroupComponent,
                TemplatedButtonGroupDisplayDensityComponent,
                ButtonGroupWithSelectedButtonComponent,
                ButtonGroupButtonWithBoundSelectedOutputComponent,
            ]
        }).compileComponents();
    }));

    afterEach(() => vi.restoreAllMocks())

    it('should initialize buttonGroup with default values', () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const buttonGroup = fixture.componentInstance.buttonGroup();

        expect(instance.buttonGroup).toBeDefined();
        expect(buttonGroup instanceof IgxButtonGroupComponent).toBe(true);
        expect(instance.buttonGroup().id).toContain('igx-buttongroup-');
        expect(buttonGroup.disabled).toBeFalsy();
        expect(buttonGroup.alignment).toBe(ButtonGroupAlignment.horizontal);
        expect(buttonGroup.selectionMode).toBe('single');
        expect(buttonGroup.itemContentCssClass).toBeUndefined();
        expect(buttonGroup.selectedIndexes.length).toEqual(1);
        expect(buttonGroup.selectedButtons.length).toEqual(1);
    });

    it('should initialize buttonGroup with passed values', () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const buttonGroup = fixture.componentInstance.buttonGroup();

        expect(instance.buttonGroup).toBeDefined();
        expect(buttonGroup instanceof IgxButtonGroupComponent).toBe(true);
        expect(buttonGroup.disabled).toBeFalsy();
        expect(buttonGroup.alignment).toBe(ButtonGroupAlignment.vertical);
        expect(buttonGroup.selectionMode).toBe('multi');
        expect(buttonGroup.itemContentCssClass).toEqual('customContentStyle');
        expect(buttonGroup.selectedIndexes.length).toEqual(0);
        expect(buttonGroup.selectedButtons.length).toEqual(0);
    });

    it('should fire the selected event when a button is selected by user interaction, not on initial or programmatic selection', () => {
        const fixture = TestBed.createComponent(ButtonGroupWithSelectedButtonComponent);
        fixture.detectChanges();

        const btnGroupInstance = fixture.componentInstance.buttonGroup();
        const selectedSpy = vi.spyOn(btnGroupInstance.selected, 'emit');

        btnGroupInstance.ngAfterViewInit();
        fixture.detectChanges();

        expect(selectedSpy).not.toHaveBeenCalled();

        btnGroupInstance.buttons[1].select();
        fixture.detectChanges();

        expect(selectedSpy).not.toHaveBeenCalled();

        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        // The first button is already selected, so it should not fire the selected event, but the deselected one.
        expect(selectedSpy).not.toHaveBeenCalled();

        const unselectedButton = fixture.debugElement.nativeElement.querySelector('#unselected');
        unselectedButton.click();
        expect(selectedSpy).toHaveBeenCalled();
    });

    it('should fire the deselected event when a button is deselected by user interaction, not on programmatic deselection', () => {
        const fixture = TestBed.createComponent(ButtonGroupWithSelectedButtonComponent);
        fixture.detectChanges();

        const btnGroupInstance = fixture.componentInstance.buttonGroup();
        btnGroupInstance.buttons[0].select();
        btnGroupInstance.buttons[1].select();
        const deselectedSpy = vi.spyOn(btnGroupInstance.deselected, 'emit');

        btnGroupInstance.ngAfterViewInit();
        fixture.detectChanges();

        expect(deselectedSpy).not.toHaveBeenCalled();

        btnGroupInstance.buttons[1].deselect();
        fixture.detectChanges();

        expect(deselectedSpy).not.toHaveBeenCalled();

        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();

        expect(deselectedSpy).toHaveBeenCalled();
    });

    it('should should reset its current selection state on selectionMode runtime change', async () => {
        const fixture = TestBed.createComponent(ButtonGroupWithSelectedButtonComponent);

        await wait();
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();

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

        const buttonGroup = fixture.componentInstance.buttonGroup();

        buttonGroup.selectButton(0);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);
        expect(buttonGroup.buttons.indexOf(buttonGroup.selectedButtons[0])).toBe(0);

        buttonGroup.selectButton(2);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);
        expect(buttonGroup.buttons.indexOf(buttonGroup.selectedButtons[0])).toBe(2);
    });

    it('Button Group single required selection', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        await wait();
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        buttonGroup.selectionMode = 'singleRequired';
        await wait();

        const deselectedSpy = vi.spyOn(buttonGroup.deselected, 'emit');

        buttonGroup.selectButton(0);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);
        expect(buttonGroup.buttons.indexOf(buttonGroup.selectedButtons[0])).toBe(0);

        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        await wait();

        expect(buttonGroup.selectedButtons.length).toBe(1);
        expect(buttonGroup.buttons.indexOf(buttonGroup.selectedButtons[0])).toBe(0);
        expect(deselectedSpy).not.toHaveBeenCalled();
    });

    it('Button Group multiple selection', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        await wait();
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        expect(buttonGroup.selectionMode).toBe('multi');

        buttonGroup.selectButton(1);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);

        buttonGroup.selectButton(2);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(2);

        buttonGroup.deselectButton(2);
        buttonGroup.deselectButton(1);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(0);

        buttonGroup.selectButton(0);
        buttonGroup.selectButton(3);
        await wait();
        // Button 3 is disabled, but it can be selected
        expect(buttonGroup.selectedButtons.length).toBe(2);
    });

    it('Button Group multiple selection with mouse click', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        await wait();
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        expect(buttonGroup.selectionMode).toBe('multi');

        UIInteractions.simulateClickEvent(buttonGroup.buttons[0].nativeElement);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);

        UIInteractions.simulateClickEvent(buttonGroup.buttons[1].nativeElement);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(2);

        UIInteractions.simulateClickEvent(buttonGroup.buttons[0].nativeElement);
        UIInteractions.simulateClickEvent(buttonGroup.buttons[1].nativeElement);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(0);

        buttonGroup.buttons[0].nativeElement.click();
        buttonGroup.buttons[3].nativeElement.click();
        await wait();
        // Button 3 is disabled, and it should not be selected with mouse click
        expect(buttonGroup.selectedButtons.length).toBe(1);
    });

    it('Button Group - templated buttons with multiple selection', async () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        await wait();
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        expect(buttonGroup.buttons.length).toBe(4);
        expect(buttonGroup.selectionMode).toBe('multi');

        buttonGroup.selectButton(1);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);

        buttonGroup.selectButton(2);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(2);

        buttonGroup.deselectButton(1);
        buttonGroup.deselectButton(2);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(0);

        buttonGroup.selectButton(0);
        buttonGroup.selectButton(3);
        await wait();
        // It should be possible to select disabled buttons
        expect(buttonGroup.selectedButtons.length).toBe(2);

        buttonGroup.deselectButton(3);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);
    });

    it('Button Group - templated buttons with single selection', async () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        await wait();
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        buttonGroup.selectionMode = 'single';
        await wait();
        expect(buttonGroup.buttons.length).toBe(4);
        expect(buttonGroup.selectionMode).toBe('single');

        buttonGroup.selectButton(1);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);
        expect(buttonGroup.buttons.indexOf(buttonGroup.selectedButtons[0])).toBe(1);

        buttonGroup.selectButton(2);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);
        expect(buttonGroup.buttons.indexOf(buttonGroup.selectedButtons[0])).toBe(2);

        buttonGroup.deselectButton(2);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(0);

        buttonGroup.selectButton(0);
        buttonGroup.selectButton(2);
        buttonGroup.selectButton(3);
        await wait();
        expect(buttonGroup.selectedButtons.length).toBe(1);
        // Button 3 is disabled, but it can be selected
        expect(buttonGroup.buttons.indexOf(buttonGroup.selectedButtons[0])).toBe(3);
    });

    it('Button Group - selection handles wrong indexes gracefully', () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        let error = '';

        try {
            buttonGroup.selectButton(-1);
            buttonGroup.selectButton(3000);

            buttonGroup.deselectButton(-1);
            buttonGroup.deselectButton(3000);
        } catch (ex) {
            error = ex.message;
        }

        expect(error).toBe('');
    });

    it('Button Group - should support tab navigation', () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        fixture.detectChanges();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        const groupChildren = buttonGroup.buttons;

        for (let i = 0; i < groupChildren.length; i++) {
            const button = groupChildren[i];
            expect(button.nativeElement.tagName).toBe('BUTTON');

            if (i < groupChildren.length - 1) {
                expect(button.nativeElement.disabled).toBe(false);
            } else {
                expect(button.nativeElement.disabled).toBe(true);
            }
        }
    });

    it('should style the corresponding button as deselected when the value bound to the selected input changes', fakeAsync(() => {
        const fixture = TestBed.createComponent(ButtonGroupButtonWithBoundSelectedOutputComponent);
        fixture.detectChanges();

        const btnGroupInstance = fixture.componentInstance.buttonGroup();

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

        const radioGroup = fixture.componentInstance.radioGroup();
        const buttonGroup = fixture.componentInstance.buttonGroup();
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

    it('should emit selected event only once per selection', async () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();
        await wait();

        const buttonGroup = fixture.componentInstance.buttonGroup();
        const selectedSpy = vi.spyOn(buttonGroup.selected, 'emit');

        buttonGroup.selectButton(0);
        await wait();
        fixture.detectChanges();

        const buttons = fixture.nativeElement.querySelectorAll('button');
        buttons[1].click();
        await wait();
        fixture.detectChanges();

        expect(selectedSpy).toHaveBeenCalledTimes(1);

        buttons[0].click();
        await wait();
        fixture.detectChanges();

        expect(selectedSpy).toHaveBeenCalledTimes(2);
    });
});

@Component({
    template: `<igx-buttongroup [values]="buttons"></igx-buttongroup>`,
    imports: [IgxButtonGroupComponent]
})
class InitButtonGroupComponent implements OnInit {
    public buttonGroup = viewChild.required(IgxButtonGroupComponent);

    public buttons: Button[];

    constructor() { }

    public ngOnInit(): void {
        this.buttons = [
            new Button({
                disabled: false,
                label: 'Euro',
                selected: false
            }),
            new Button({
                label: 'British Pound',
                selected: true
            }),
            new Button({
                label: 'US Dollar',
                selected: false
            })
        ];
    }
}

@Component({
    template: `
    <igx-buttongroup [selectionMode]="'multi'" itemContentCssClass="customContentStyle"
        [values]="cities" [alignment]="alignment">
    </igx-buttongroup>
    `,
    imports: [IgxButtonGroupComponent]
})
class InitButtonGroupWithValuesComponent implements OnInit {
    public buttonGroup = viewChild.required(IgxButtonGroupComponent);

    public cities: Button[];

    public alignment = ButtonGroupAlignment.vertical;

    constructor() { }

    public ngOnInit(): void {

        this.cities = [
            new Button({
                disabled: false,
                label: 'Sofia',
                selected: false,
                togglable: false
            }),
            new Button({
                disabled: false,
                label: 'London',
                selected: false
            }),
            new Button({
                disabled: false,
                label: 'New York',
                selected: false
            }),
            new Button({
                disabled: true,
                label: 'Tokyo',
                selected: false
            })
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
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class TemplatedButtonGroupComponent {
    public buttonGroup = viewChild.required(IgxButtonGroupComponent);

    public alignment = ButtonGroupAlignment.vertical;
}

@Component({
    template: `
    <igx-buttongroup [selectionMode]="'multi'">
        <button igxButton>Sofia</button>
        <button igxButton>London</button>
    </igx-buttongroup>
    `,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class TemplatedButtonGroupDisplayDensityComponent {
    public buttonGroup = viewChild.required(IgxButtonGroupComponent);
}

@Component({
    template: `
    <igx-buttongroup>
        <button igxButton [selected]="true">Button 0</button>
        <button igxButton id="unselected">Button 1</button>
        <button igxButton>Button 2</button>
    </igx-buttongroup>
    `,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class ButtonGroupWithSelectedButtonComponent {
    public buttonGroup = viewChild.required(IgxButtonGroupComponent);
}

@Component({
    template: `
    <igx-buttongroup>
        @for (item of items; track item.key) {
            <button igxButton [selected]="item.key === selectedValue">{{item.value}}</button>
        }
    </igx-buttongroup>
    `,
    imports: [IgxButtonGroupComponent, IgxButtonDirective]
})
class ButtonGroupButtonWithBoundSelectedOutputComponent {
    public buttonGroup = viewChild.required(IgxButtonGroupComponent);

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
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxRadioGroupDirective, IgxRadioComponent]
})
class ButtonGroupSelectionBoundToAnotherComponent {
    public radioGroup = viewChild.required(IgxRadioGroupDirective);
    public buttonGroup = viewChild.required(IgxButtonGroupComponent);

    public selectedValue = 'Bar';

    public onRadioChange(event: { value: string; }) {
        this.selectedValue = event.value;
    }

    public get isFirstRadioButtonSelected() {
        return this.selectedValue === 'Foo';
    }
}
