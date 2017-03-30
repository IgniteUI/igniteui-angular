import {
    async,
    TestBed
} from '@angular/core/testing';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxButtonGroup, } from './buttonGroup.component';
import { IgxButtonGroupModule, ButtonGroupAlignment } from "./buttonGroup.component";
import { IgxDirectivesModule } from "../../src/modules";
import { IgxButton } from "../button/button.directive";

interface IButton {
    type?: string,
    ripple?: string,
    label?: string,
    disabled?: boolean
    togglable?: boolean,
    selected?: boolean,
    color?: string,
    bgcolor?: string,
    icon?: string
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

describe('IgxButtonGroup', function() {
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ InitButtonGroup, InitButtonGroupWithValues],
            imports: [IgxButtonGroupModule]
        })
        .compileComponents();
    }));

    it('should initialize buttonGroup with default values', () => {
        let fixture = TestBed.createComponent(InitButtonGroup);
        fixture.detectChanges();

        let instance = fixture.componentInstance;
        let buttongroup = fixture.componentInstance.buttonGroup;

        expect(instance.buttonGroup).toBeDefined();
        expect(buttongroup instanceof IgxButtonGroup).toBe(true);
        expect(buttongroup.disabled).toBeFalsy();
        expect(buttongroup.alignment).toBe(ButtonGroupAlignment.horizontal);
        expect(buttongroup.multiSelection).toBeFalsy();
        expect(buttongroup.itemContentCssClass).toBeUndefined();
        expect(buttongroup.selectedIndexes.length).toEqual(0);
        expect(buttongroup.selectedButtons.length).toEqual(0);
    });

    it('should initialize buttonGroup with passed values', () => {
        let fixture = TestBed.createComponent(InitButtonGroupWithValues);
        fixture.detectChanges();

        let instance = fixture.componentInstance;
        let buttongroup = fixture.componentInstance.buttonGroup;

        expect(instance.buttonGroup).toBeDefined();
        expect(buttongroup instanceof IgxButtonGroup).toBe(true);
        expect(buttongroup.disabled).toBeFalsy();
        expect(buttongroup.alignment).toBe(ButtonGroupAlignment.vertical);
        expect(buttongroup.multiSelection).toBeTruthy();
        expect(buttongroup.itemContentCssClass).toEqual("customContentStyle");
        expect(buttongroup.selectedIndexes.length).toEqual(0);
        expect(buttongroup.selectedButtons.length).toEqual(0)
    });

    it('Button Group single selection', () => {
        let fixture = TestBed.createComponent(InitButtonGroup);
        fixture.detectChanges();

        let buttongroup = fixture.componentInstance.buttonGroup;

        buttongroup.selectButton(0);
        expect(buttongroup.selectedButtons.length).toBe(1);
        buttongroup.selectButton(2);
        expect(buttongroup.selectedButtons.length).toBe(1);
    });

    it('Button Group multiple selection', () => {
        let fixture = TestBed.createComponent(InitButtonGroupWithValues);
        fixture.detectChanges();

        let buttongroup = fixture.componentInstance.buttonGroup;
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
        expect(buttongroup.selectedButtons.length).toBe(0);
    });
});


@Component({ template: `<igx-buttongroup [values]="buttons"></igx-buttongroup>` })
class InitButtonGroup{
    @ViewChild(IgxButtonGroup) buttonGroup: IgxButtonGroup;

    constructor() {}

    private buttons: Array<Button>;
        public ngOnInit(): void {

        this.buttons = [
            new Button({
                label: 'Euro',
                selected: false,
                disabled: false
            }),
            new Button({
                label: 'British Pound',
                selected: true,
            }),
            new Button({
                label: 'US Dollar',
                selected: false,
            })
        ]
    }
}

@Component({ template: `<igx-buttongroup multiSelection="true" itemContentCssClass="customContentStyle" [values]="cities" [alignment]="alignment">
                        </igx-buttongroup>` })
class InitButtonGroupWithValues{
    @ViewChild(IgxButtonGroup) buttonGroup: IgxButtonGroup;

    constructor() {}
    
    private cities: Array<Button>;
        public ngOnInit(): void {

        this.cities = [
            new Button({
                label: 'Sofia',
                selected: false,
                togglable: false,
                disabled: false
            }),
            new Button({
                label: 'London',
                selected: false,
                disabled: false
            }),
            new Button({
                label: 'New York',
                selected: false,
                disabled: false
            }),
            new Button({
                label: 'Tokyo',
                selected: false,
                disabled: true
            })
        ]
    }

    private alignment = ButtonGroupAlignment.vertical;
}

@Component({ template: `<igx-buttongroup multiSelection="true" itemContentCssClass="customContentStyle" [values]="buttons" [alignment]="alignment">
                        </igx-buttongroup>` })
class ButtonGroupWithValues{
    @ViewChild(IgxButtonGroup) buttonGroup: IgxButtonGroup;

    constructor() {}
    
    private buttons: Array<Button>;
        public ngOnInit(): void {

        this.buttons = [
            new Button({
                type: 'raised',
                label: 'Euro',
                selected: false,
                disabled: false
            }),
            new Button({
                type: 'raised',
                label: 'British Pound',
                selected: false,
            }),
            new Button({
                type: 'raised',
                label: 'US Dollar',
                selected: false,
            })
        ]
    }

    private alignment = ButtonGroupAlignment.vertical;
}
