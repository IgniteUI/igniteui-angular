import { ChangeDetectionStrategy, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxRadioGroupDirective, RadioGroupAlignment } from './radio-group.directive';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormBuilder, FormGroup, FormControl } from '@angular/forms';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IgxRadioComponent } from '../../radio/radio.component';

import { describe, it, expect, beforeEach, vi } from 'vitest';
describe('IgxRadioGroupDirective', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                RadioGroupComponent,
                RadioGroupOnPushComponent,
                RadioGroupSimpleComponent,
                RadioGroupWithModelComponent,
                RadioGroupRequiredComponent,
                RadioGroupReactiveFormsComponent,
                RadioGroupDeepProjectionComponent,
                RadioGroupTestComponent,
                DynamicRadioGroupComponent,
                RadioGroupVerticalComponent
            ]
        })
        .compileComponents();
    }));

    it('Properly initialize the radio group buttons\' properties.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons).toBeDefined();
        expect(radioInstance.radioButtons.length).toEqual(3);

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        const allButtonsWithGroupName = radioInstance.radioButtons.filter((btn) => btn.name === radioInstance.name);
        expect(allButtonsWithGroupName.length).toEqual(radioInstance.radioButtons.length);

        const buttonWithGroupValue = radioInstance.radioButtons.find((btn) => btn.value === radioInstance.value);
        expect(buttonWithGroupValue).toBeDefined();
        expect(buttonWithGroupValue).toEqual(radioInstance.selected);
    }));

    it('Properly initializes FormControlValue with OnPush change detection strategy', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupOnPushComponent);
        const radioInstance = fixture.componentInstance.radio;

        fixture.detectChanges();
        tick();

        expect(radioInstance.checked).toBeTruthy();
    }));

    it('Setting radioGroup\'s properties should affect all radio buttons.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons).toBeDefined();

        // name
        radioInstance.name = 'newGroupName';
        fixture.detectChanges();
        tick();

        const allButtonsWithNewName = radioInstance.radioButtons.filter((btn) => btn.name === 'newGroupName');
        expect(allButtonsWithNewName.length).toEqual(radioInstance.radioButtons.length);

        // required
        radioInstance.required = true;
        fixture.detectChanges();
        tick();

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        // invalid
        radioInstance.invalid = true;
        fixture.detectChanges();

        const allInvalidButtons = radioInstance.radioButtons.filter((btn) => btn.invalid);
        expect(allInvalidButtons.length).toEqual(radioInstance.radioButtons.length);
    }));

    it('Set value should change selected property', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual('Baz');

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        vi.spyOn(radioInstance.change, 'emit');

        radioInstance.value = 'Foo';
        fixture.detectChanges();

        expect(radioInstance.value).toEqual('Foo');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).not.toHaveBeenCalled();
    }));

    it('Set selected property should change value', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual('Baz');

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        vi.spyOn(radioInstance.change, 'emit');

        radioInstance.selected = radioInstance.radioButtons.first;
        fixture.detectChanges();

        expect(radioInstance.value).toEqual('Foo');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).not.toHaveBeenCalled();
    }));

    it('Clicking on a radio button should update the model.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        radioInstance.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    }));

    it('Updating the model should select a radio button.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        fixture.componentInstance.personBob.favoriteSeason = 'Winter';
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    }));

    it('Properly update the model when radio group is hosted in Reactive forms.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);

        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.personForm).toBeDefined();
        expect(fixture.componentInstance.model).toBeDefined();
        expect(fixture.componentInstance.newModel).toBeUndefined();

        fixture.componentInstance.personForm.patchValue({ favoriteSeason: fixture.componentInstance.seasons[0] });
        fixture.componentInstance.updateModel();
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.newModel).toBeDefined();
        expect(fixture.componentInstance.newModel.name).toEqual(fixture.componentInstance.model.name);
        expect(fixture.componentInstance.newModel.favoriteSeason).toEqual(fixture.componentInstance.seasons[0]);
    }));

    it('Properly initialize selection when value is falsy in deep content projection', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.value).toEqual(0);
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
    }));

    it('Properly rebind dynamically added components', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        const radioInstance = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        fixture.componentInstance.choices = [ 0, 1, 4, 7 ];
        fixture.detectChanges();
        tick();

        radioInstance.radioButtons.last.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual(7);
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);
    }));

    it('Updates checked radio button correctly', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
        expect(radioGroup.radioButtons.last.checked).toEqual(false);

        radioGroup.radioButtons.last.select();
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.first.checked).toEqual(false);
        expect(radioGroup.radioButtons.last.checked).toEqual(true);
    }));

    it('Should update styles correctly when required radio group\'s value is set.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
        expect(radioGroup.selected).toBeUndefined;
        expect(radioGroup.invalid).toBe(false);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);
        dispatchRadioEvent('blur', domRadio, fixture);
        fixture.detectChanges();
        tick();

        expect(radioGroup.invalid).toBe(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(true);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        tick();

        expect(domRadio.classList.contains('igx-radio--checked')).toBe(true);
        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
    }));

    it('Should select radio button when added programmatically after group value is set', (() => {
        const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
        const component = fixture.componentInstance;
        const radioGroup = component.radioGroup;

        // Simulate AppBuilder configurator setting value before radio buttons exist
        radioGroup.value = 'option2';

        // Verify no radio buttons exist yet
        expect(radioGroup.radioButtons.length).toBe(0);
        expect(radioGroup.selected).toBeNull();

        fixture.detectChanges();

        component.addRadioButton('option1', 'Option 1');
        component.addRadioButton('option2', 'Option 2');
        component.addRadioButton('option3', 'Option 3');

        fixture.detectChanges();

        // Radio button with value 'option2' should be selected
        expect(radioGroup.value).toBe('option2');
        expect(radioGroup.selected).toBeDefined();
        expect(radioGroup.selected.value).toBe('option2');
        expect(radioGroup.selected.checked).toBe(true);

        // Verify only one radio button is selected
        const checkedButtons = radioGroup.radioButtons.filter(btn => btn.checked);
        expect(checkedButtons.length).toBe(1);
        expect(checkedButtons[0].value).toBe('option2');
    }));

    describe('Required input', () => {
        it('Should propagate required property to all child radio buttons when set to true', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            // RadioGroupComponent already has required="true"
            expect(radioGroup.required).toBe(true);

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(true);
            });
        }));

        it('Should propagate required property to all child radio buttons when set to false', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            expect(radioGroup.required).toBe(false);

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(false);
            });
        }));

        it('Should update all child radio buttons when required property changes', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            // Initially not required
            expect(radioGroup.required).toBe(false);
            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(false);
            });

            // Set to required
            radioGroup.required = true;
            fixture.detectChanges();
            tick();

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(true);
            });

            // Set back to not required
            radioGroup.required = false;
            fixture.detectChanges();
            tick();

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(false);
            });
        }));

        it('Should propagate required to dynamically added radio buttons', fakeAsync(() => {
            const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
            const component = fixture.componentInstance;
            const radioGroup = component.radioGroup;

            radioGroup.required = true;
            fixture.detectChanges();
            tick();

            component.addRadioButton('option1', 'Option 1');
            component.addRadioButton('option2', 'Option 2');
            fixture.detectChanges();
            tick();

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(true);
            });
        }));
    });

    describe('Keyboard navigation', () => {
        it('Should navigate to next radio button with ArrowDown key', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(firstButton);

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.toArray()[1]);
            expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);
        }));

        it('Should navigate to previous radio button with ArrowUp key', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const secondButton = radioGroup.radioButtons.toArray()[1];
            secondButton.select();
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(secondButton);

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        }));

        it('Should navigate to next radio button with ArrowRight key in LTR', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.toArray()[1]);
            expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);
        }));

        it('Should navigate to previous radio button with ArrowLeft key in LTR', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const secondButton = radioGroup.radioButtons.toArray()[1];
            secondButton.select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        }));

        it('Should wrap around to last button when pressing ArrowUp on first button', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.last);
            expect(radioGroup.radioButtons.last.checked).toBe(true);
        }));

        it('Should wrap around to first button when pressing ArrowDown on last button', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const lastButton = radioGroup.radioButtons.last;
            lastButton.select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        }));

        it('Should skip disabled buttons when navigating with arrow keys', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            // Disable the second button
            const buttons = radioGroup.radioButtons.toArray();
            buttons[1].disabled = true;
            fixture.detectChanges();
            tick();

            // Select first button and navigate down
            buttons[0].select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            // Should skip the disabled second button and select the third
            expect(radioGroup.selected).toBe(buttons[2]);
            expect(buttons[2].checked).toBe(true);
        }));

        it('Should set focus on selected radio button during keyboard navigation', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            tick();

            vi.spyOn(radioGroup.radioButtons.toArray()[1].nativeElement, 'focus');

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.radioButtons.toArray()[1].nativeElement.focus).toHaveBeenCalled();
        }));

        it('Should deselect previous button and blur it when navigating', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            firstButton.focused = true;
            fixture.detectChanges();
            tick();

            vi.spyOn(firstButton.nativeElement, 'blur');

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(firstButton.checked).toBe(false);
            expect(firstButton.nativeElement.blur).toHaveBeenCalled();
        }));

        it('Should prevent default behavior when navigating with arrow keys', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            radioGroup.radioButtons.first.select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
            vi.spyOn(event, 'preventDefault');

            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(event.preventDefault).toHaveBeenCalled();
        }));

        it('Should update tab index to 0 on checked button and -1 on others', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const buttons = radioGroup.radioButtons.toArray();
            buttons[1].select();
            fixture.detectChanges();
            tick();

            expect(buttons[1].nativeElement.tabIndex).toBe(0);
            expect(buttons[0].nativeElement.tabIndex).toBe(-1);
            expect(buttons[2].nativeElement.tabIndex).toBe(-1);
        }));
    });

    describe('Alignment', () => {
        it('Should have horizontal alignment by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;

            expect(radioGroup.alignment).toBe('horizontal');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(false);
        }));

        it('Should apply vertical CSS class when alignment is set to vertical', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            radioGroup.alignment = 'vertical';
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;

            expect(radioGroup.alignment).toBe('vertical');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(true);
        }));

        it('Should remove vertical CSS class when alignment is changed back to horizontal', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            radioGroup.alignment = 'vertical';
            fixture.detectChanges();
            tick();

            let groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(true);

            radioGroup.alignment = 'horizontal';
            fixture.detectChanges();
            tick();

            groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            expect(radioGroup.alignment).toBe('horizontal');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(false);
        }));

        it('Should initialize with vertical alignment when set in template', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupVerticalComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;

            expect(radioGroup.alignment).toBe('vertical');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(true);
        }));

        it('Should accept RadioGroupAlignment enum values', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            radioGroup.alignment = RadioGroupAlignment.vertical;
            fixture.detectChanges();
            tick();

            expect(radioGroup.alignment).toBe('vertical');

            radioGroup.alignment = RadioGroupAlignment.horizontal;
            fixture.detectChanges();
            tick();

            expect(radioGroup.alignment).toBe('horizontal');
        }));
    });
});

@Component({
    template: `
    <igx-radio-group #radioGroup>
        <igx-radio [checked]="true">Option 1</igx-radio>
        <igx-radio>Option 2</igx-radio>
    </igx-radio-group>
`,
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
})
class RadioGroupSimpleComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
}

@Component({
    template: `<igx-radio-group #radioGroup name="radioGroup" value="Baz" required="true">
        @for (item of ['Foo', 'Bar', 'Baz']; track item) {
            <igx-radio value="{{item}}">
                {{item}}
            </igx-radio>
        }
    </igx-radio-group>
    `,
    imports: [IgxRadioComponent, IgxRadioGroupDirective]
})
class RadioGroupComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
}

@Component({
    template: `<igx-radio-group #radioGroup name="radioGroup" required>
        @for (item of ['Foo', 'Bar', 'Baz']; track item) {
            <igx-radio value="{{item}}">
                {{item}}
            </igx-radio>
        }
    </igx-radio-group>
    `,
    imports: [IgxRadioComponent, IgxRadioGroupDirective]
})
class RadioGroupRequiredComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
}

interface Person {
    name: string;
    favoriteSeason: string;
}

@Component({
    template: `
<form [formGroup]="form">
    <igx-radio-group formControlName="radio">
        <igx-radio #checkedRadio value="value1">value1</igx-radio>
        <igx-radio value="value2">value2</igx-radio>
        <igx-radio value="value3">value3</igx-radio>
    </igx-radio-group>
</form>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class RadioGroupOnPushComponent {
    @ViewChild('checkedRadio', { read: IgxRadioComponent, static: true })
    public radio: IgxRadioComponent;

    public form = new FormGroup({
        radio: new FormControl('value1'),
    });
}

@Component({
    template: ` <igx-radio-group #radioGroupSeasons name="radioGroupSeasons" [(ngModel)]="personBob.favoriteSeason">
        @for (item of seasons; track item) {
            <igx-radio value="{{item}}">
                {{item}}
            </igx-radio>
        }
    </igx-radio-group>
    `,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, FormsModule]
})
class RadioGroupWithModelComponent {
    @ViewChild('radioGroupSeasons', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    public personBob: Person = { name: 'Bob', favoriteSeason: 'Summer' };
}

@Component({
    template: `
<form [formGroup]="personForm">
    <igx-radio-group formControlName="favoriteSeason" name="radioGroupReactive">
        @for (item of seasons; track item) {
            <igx-radio value="{{item}}">
                {{item}}
            </igx-radio>
        }
    </igx-radio-group>
</form>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupReactiveFormsComponent {
    private _formBuilder = inject(UntypedFormBuilder);

    public seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    public newModel: Person;
    public model: Person = { name: 'Kirk', favoriteSeason: this.seasons[1] };
    public personForm: UntypedFormGroup;

    constructor() {
        this._createForm();
    }

    public updateModel() {
        const formModel = this.personForm.value;

        this.newModel = {
            name: formModel.name as string,
            favoriteSeason: formModel.favoriteSeason as string
        };
    }

    private _createForm() {
        // create form
        this.personForm = this._formBuilder.group({
            name: '',
            favoriteSeason: ''
        });

        // simulate model loading from service
        this.personForm.setValue({
            name: this.model.name,
            favoriteSeason: this.model.favoriteSeason
        });
    }
}

@Component({
    template: `
        <form [formGroup]="group1">
            <igx-radio-group formControlName="favouriteChoice" name="radioGroupReactive">
                @for (choice of choices; track choice) {
                    <div>
                        <p><igx-radio [value]="choice">{{ choice }}</igx-radio></p>
                    </div>
                }
            </igx-radio-group>
        </form>
    `,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupDeepProjectionComponent {
    private _builder = inject(UntypedFormBuilder);


    @ViewChild(IgxRadioGroupDirective, { static: true })
    public radioGroup: IgxRadioGroupDirective;

    public choices = [0, 1, 2];
    public group1: UntypedFormGroup;

    constructor() {
        this._createForm();
    }

    private _createForm() {
        this.group1 = this._builder.group({
            favouriteChoice: 0
        });
    }
}

@Component({
  template: `
    <igx-radio-group
        [alignment]="alignment"
        [required]="required"
        [value]="value"
        (change)="handleChange($event)"
        >
        <ng-container #radioContainer></ng-container>
    </igx-radio-group>
  `,
  imports: [IgxRadioGroupDirective]
})

class RadioGroupTestComponent implements OnInit {
    @ViewChild('radioContainer', { read: ViewContainerRef, static: true })
    public container!: ViewContainerRef;

    public alignment = RadioGroupAlignment.horizontal;
    public required = false;
    public value: any;

    public radios: { label: string; value: any }[] = [];

    public handleChange(args: any) {
        this.value = args.value;
    }

    public ngOnInit(): void {
        this.container.clear();
        this.radios.forEach((option) => {
            const componentRef: ComponentRef<IgxRadioComponent> =
            this.container.createComponent(IgxRadioComponent);

            componentRef.instance.placeholderLabel.nativeElement.textContent =
            option.label;
            componentRef.instance.value = option.value;
        });
    }
}

@Component({
    template: `
        <igx-radio-group #radioGroup>
            <ng-container #radioContainer></ng-container>
        </igx-radio-group>
    `,
    imports: [IgxRadioGroupDirective]
})
class DynamicRadioGroupComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;

    @ViewChild('radioContainer', { read: ViewContainerRef, static: true })
    public radioContainer: ViewContainerRef;

    /**
     * Simulates how AppBuilder adds radio buttons programmatically
     * via ViewContainerRef.createComponent()
     */
    public addRadioButton(value: string, label: string): void {
        const componentRef = this.radioContainer.createComponent(IgxRadioComponent);
        componentRef.instance.value = value;
        componentRef.instance.placeholderLabel.nativeElement.textContent = label;
        componentRef.changeDetectorRef.detectChanges();
    }
}

@Component({
    template: `
    <igx-radio-group #radioGroup alignment="vertical">
        <igx-radio value="option1">Option 1</igx-radio>
        <igx-radio value="option2">Option 2</igx-radio>
        <igx-radio value="option3">Option 3</igx-radio>
    </igx-radio-group>
`,
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
})
class RadioGroupVerticalComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
}

const dispatchRadioEvent = (eventName, radioNativeElement, fixture) => {
    radioNativeElement.dispatchEvent(new Event(eventName));
    fixture.detectChanges();
};
