import { Component, OnInit, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, flushMicrotasks, waitForAsync } from '@angular/core/testing';
import { ButtonGroupAlignment, IgxButtonGroupComponent } from './buttonGroup.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { getComponentSize } from '../core/utils';
import { NgFor } from '@angular/common';

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
    configureTestSuite();
    beforeAll(waitForAsync(() => {
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

        btnGroupInstance.buttons[1].select();
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
        btnGroupInstance.buttons[0].select();
        btnGroupInstance.buttons[1].select();
        spyOn(btnGroupInstance.deselected, 'emit');

        btnGroupInstance.ngAfterViewInit();
        fixture.detectChanges();

        expect(btnGroupInstance.deselected.emit).not.toHaveBeenCalled();

        btnGroupInstance.buttons[1].deselect();
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

    it('Button Group - DisplayDensity property is applied', () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;

        expect(buttongroup.displayDensity).toBe('comfortable');

        buttongroup.displayDensity = 'compact';
        fixture.detectChanges();

        expect(buttongroup.displayDensity).toBe('compact', 'DisplayDensity not set!');
        expect(getComponentSize(buttongroup.buttons[1].nativeElement)).toBe('1', 'Missing density class!');
    });

    it('Button Group - DisplayDensity property is applied to templated buttons', () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupDesplayDensityComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;

        expect(buttongroup.displayDensity).toBe('cosy');

        const groupChildren = buttongroup.buttons;
        // The density class should be applied only to buttons with no DisplayDensity set
        expect(groupChildren[0].displayDensity).toBe('compact');
        expect(getComponentSize(groupChildren[0].element.nativeElement)).toBe('1', 'Missing density class!');
        expect(getComponentSize(groupChildren[1].element.nativeElement)).toBe('2', 'Missing density class!');
    });

    it('Button Group - should support tab navigation', () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        const groupChildren = buttongroup.buttons;

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

});

@Component({
    template: `<igx-buttongroup [values]="buttons"></igx-buttongroup>`,
    standalone: true,
    imports: [ IgxButtonGroupComponent ]
})
class InitButtonGroupComponent implements OnInit {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public buttons: Button[];

    constructor() {}

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
    standalone: true,
    imports: [ IgxButtonGroupComponent ]
})
class InitButtonGroupWithValuesComponent implements OnInit {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public cities: Button[];

    public alignment = ButtonGroupAlignment.vertical;

    constructor() {}

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
    standalone: true,
    imports: [ IgxButtonGroupComponent, IgxButtonDirective ]
})
class TemplatedButtonGroupComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;

    public alignment = ButtonGroupAlignment.vertical;
}

@Component({
    template: `
    <igx-buttongroup [selectionMode]="'multi'" displayDensity="cosy">
        <button igxButton displayDensity="compact">Sofia</button>
        <button igxButton>London</button>
    </igx-buttongroup>
    `,
    standalone: true,
    imports: [ IgxButtonGroupComponent, IgxButtonDirective ]
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
    standalone: true,
    imports: [ IgxButtonGroupComponent, IgxButtonDirective ]
})
class ButtonGroupWithSelectedButtonComponent {
    @ViewChild(IgxButtonGroupComponent, { static: true }) public buttonGroup: IgxButtonGroupComponent;
}

@Component({
    template: `
    <igx-buttongroup>
        <button igxButton *ngFor="let item of items" [selected]="item.key === selectedValue">{{item.value}}</button>
    </igx-buttongroup>
    `,
    standalone: true,
    imports: [ IgxButtonGroupComponent, IgxButtonDirective, NgFor ]
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
