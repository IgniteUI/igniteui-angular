import { Component, OnInit, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { ButtonGroupAlignment, IgxButtonGroupComponent, IgxButtonGroupModule } from './buttonGroup.component';
import { IgxButtonModule } from '../directives/button/button.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
        this.type = obj.type || 'raised';
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
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitButtonGroupComponent,
                InitButtonGroupWithValuesComponent,
                TemplatedButtonGroupComponent
            ],
            imports: [
                IgxButtonGroupModule,
                IgxButtonModule,
                NoopAnimationsModule
            ]
        })
        .compileComponents();
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
        expect(buttongroup.multiSelection).toBeFalsy();
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
        expect(buttongroup.multiSelection).toBeTruthy();
        expect(buttongroup.itemContentCssClass).toEqual('customContentStyle');
        expect(buttongroup.selectedIndexes.length).toEqual(0);
        expect(buttongroup.selectedButtons.length).toEqual(0);
    });

   it('Button Group single selection', () => {
        const fixture = TestBed.createComponent(InitButtonGroupComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;

        buttongroup.selectButton(0);
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(0);

        buttongroup.selectButton(2);
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(2);
    });

   it('Button Group multiple selection', () => {
        const fixture = TestBed.createComponent(InitButtonGroupWithValuesComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        expect(buttongroup.multiSelection).toBeTruthy();
        buttongroup.selectButton(1);
        expect(buttongroup.selectedButtons.length).toBe(1);
        buttongroup.selectButton(2);
        expect(buttongroup.selectedButtons.length).toBe(2);
        buttongroup.deselectButton(2);
        buttongroup.deselectButton(1);
        expect(buttongroup.selectedButtons.length).toBe(0);
        buttongroup.selectButton(0);
        buttongroup.selectButton(3);
        // Button 3 is disabled, so it isn't selected
        expect(buttongroup.selectedButtons.length).toBe(1);
    });

    it('Button Group - templated buttons with multiple selection', () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        expect(buttongroup.buttons.length).toBe(4);

        expect(buttongroup.multiSelection).toBeTruthy();
        buttongroup.selectButton(1);
        expect(buttongroup.selectedButtons.length).toBe(1);
        buttongroup.selectButton(2);
        expect(buttongroup.selectedButtons.length).toBe(2);
        buttongroup.deselectButton(1);
        buttongroup.deselectButton(2);
        expect(buttongroup.selectedButtons.length).toBe(0);
        buttongroup.selectButton(0);
        buttongroup.selectButton(3);
        // Button 3 is disabled, so it isn't selected
        expect(buttongroup.selectedButtons.length).toBe(1);
    });

    it('Button Group - templated buttons with single selection', () => {
        const fixture = TestBed.createComponent(TemplatedButtonGroupComponent);
        fixture.componentInstance.multiselection = false;
        fixture.detectChanges();

        const buttongroup = fixture.componentInstance.buttonGroup;
        expect(buttongroup.buttons.length).toBe(4);
        expect(buttongroup.multiSelection).toBeFalsy();

        buttongroup.selectButton(1);
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(1);

        buttongroup.selectButton(2);
        expect(buttongroup.selectedButtons.length).toBe(1);
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(2);

        buttongroup.deselectButton(2);
        expect(buttongroup.selectedButtons.length).toBe(0);

        buttongroup.selectButton(0);
        buttongroup.selectButton(2);
        buttongroup.selectButton(3);
        expect(buttongroup.selectedButtons.length).toBe(1);
        // Button 3 is disabled, so it isn't selected
        expect(buttongroup.buttons.indexOf(buttongroup.selectedButtons[0])).toBe(2);
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

});

@Component({ template: `<igx-buttongroup [values]="buttons"></igx-buttongroup>` })
class InitButtonGroupComponent implements OnInit {
    @ViewChild(IgxButtonGroupComponent) public buttonGroup: IgxButtonGroupComponent;

    private buttons: Button[];

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

@Component({ template: `<igx-buttongroup multiSelection="true" itemContentCssClass="customContentStyle"
                            [values]="cities" [alignment]="alignment">
                        </igx-buttongroup>` })
class InitButtonGroupWithValuesComponent implements OnInit {
    @ViewChild(IgxButtonGroupComponent) public buttonGroup: IgxButtonGroupComponent;

    private cities: Button[];

    private alignment = ButtonGroupAlignment.vertical;

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

@Component({ template: `<igx-buttongroup multiSelection="true" itemContentCssClass="customContentStyle"
                            [values]="buttons" [alignment]="alignment">
                        </igx-buttongroup>` })
class ButtonGroupWithValuesComponent implements OnInit {
    @ViewChild(IgxButtonGroupComponent) public buttonGroup: IgxButtonGroupComponent;

    private buttons: Button[];

    private alignment = ButtonGroupAlignment.vertical;

    constructor() {}

    public ngOnInit(): void {

        this.buttons = [
            new Button({
                disabled: false,
                label: 'Euro',
                selected: false,
                type: 'raised'
            }),
            new Button({
                label: 'British Pound',
                selected: false,
                type: 'raised'
            }),
            new Button({
                label: 'US Dollar',
                selected: false,
                type: 'raised'
            })
        ];
    }
}

@Component({ template: `<igx-buttongroup [multiSelection]="multiselection" [alignment]="alignment">
                            <button igxButton>Sofia</button>
                            <button igxButton>London</button>
                            <button igxButton>New York</button>
                            <button igxButton [disabled]="'true'">Tokio</button>
                        </igx-buttongroup>` })
class TemplatedButtonGroupComponent {
    @ViewChild(IgxButtonGroupComponent) public buttonGroup: IgxButtonGroupComponent;

    private alignment = ButtonGroupAlignment.vertical;
    public multiselection = true;
}
