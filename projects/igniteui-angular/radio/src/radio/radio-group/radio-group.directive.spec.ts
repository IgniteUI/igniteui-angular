import { ChangeDetectionStrategy, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IgxRadioGroupDirective, RadioGroupAlignment } from './radio-group.directive';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormBuilder, FormGroup, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { FormField, disabled, form as signalForm, required } from '@angular/forms/signals';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IgxRadioComponent } from '../../radio/radio.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('IgxRadioGroupDirective', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
                RadioGroupValueValidatorComponent,
                RadioGroupTemplateDisabledComponent,
                RadioGroupDeepProjectionComponent,
                RadioGroupTestComponent,
                DynamicRadioGroupComponent,
                RadioGroupVerticalComponent,
                RadioGroupInitiallyDisabledComponent,
                RadioGroupRadioControlsComponent
            ]
        })
            .compileComponents();
    });

    it('Properly initialize the radio group buttons\' properties.', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.radioButtons).toBeDefined();
        expect(radioInstance.radioButtons.length).toEqual(3);

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        const allButtonsWithGroupName = radioInstance.radioButtons.filter((btn) => btn.name === radioInstance.name);
        expect(allButtonsWithGroupName.length).toEqual(radioInstance.radioButtons.length);

        const buttonWithGroupValue = radioInstance.radioButtons.find((btn) => btn.value === radioInstance.value);
        expect(buttonWithGroupValue).toBeDefined();
        expect(buttonWithGroupValue).toEqual(radioInstance.selected);
    });

    it('Properly initializes FormControlValue with OnPush change detection strategy', async () => {
        const fixture = TestBed.createComponent(RadioGroupOnPushComponent);
        const radioInstance = fixture.componentInstance.radio;

        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.checked).toBe(true);
    });

    it('Setting radioGroup\'s properties should affect all radio buttons.', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.radioButtons).toBeDefined();

        // name
        radioInstance.name = 'newGroupName';
        fixture.detectChanges();
        await fixture.whenStable();

        const allButtonsWithNewName = radioInstance.radioButtons.filter((btn) => btn.name === 'newGroupName');
        expect(allButtonsWithNewName.length).toEqual(radioInstance.radioButtons.length);

        // required
        radioInstance.required = true;
        fixture.detectChanges();
        await fixture.whenStable();

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        // invalid
        radioInstance.invalid = true;
        fixture.detectChanges();

        const allInvalidButtons = radioInstance.radioButtons.filter((btn) => btn.invalid);
        expect(allInvalidButtons.length).toEqual(radioInstance.radioButtons.length);
    });

    it('Set value should change selected property', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

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
    });

    it('Set selected property should change value', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

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
    });

    it('Setting selected to null should clear the value and uncheck all radio buttons', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.radioButtons.last.checked).toBe(true);

        radioInstance.selected = null;
        fixture.detectChanges();

        expect(radioInstance.value).toBeNull();
        expect(radioInstance.radioButtons.toArray().some(btn => btn.checked)).toBe(false);
    });

    it('Resetting the form control should uncheck all radio buttons', async () => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);
        expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);

        fixture.componentInstance.personForm.get('favoriteSeason').reset();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.value).toBeNull();
        expect(radioGroup.radioButtons.toArray().some(btn => btn.checked)).toBe(false);
    });

    it('Should emit change once when a radio button is clicked', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

        vi.spyOn(radioInstance.change, 'emit');

        radioInstance.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.change.emit).toHaveBeenCalledTimes(1);
        expect(radioInstance.change.emit).toHaveBeenCalledWith(expect.objectContaining({
            value: 'Foo',
            owner: radioInstance.radioButtons.first
        }));
    });

    it('Should update the form control value once when a radio button is clicked', async () => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);
        const valueChanges = vi.fn();
        fixture.componentInstance.personForm.get('favoriteSeason').valueChanges.subscribe(valueChanges);

        radioGroup.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(valueChanges).toHaveBeenCalledExactlyOnceWith('Winter');
    });

    it('Should emit change once for radio buttons added in separate change detection cycles', async () => {
        const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
        const component = fixture.componentInstance;
        const radioGroup = component.radioGroup;
        fixture.detectChanges();

        component.addRadioButton('option1', 'Option 1');
        fixture.detectChanges();
        await fixture.whenStable();
        component.addRadioButton('option2', 'Option 2');
        fixture.detectChanges();
        await fixture.whenStable();
        component.addRadioButton('option3', 'Option 3');
        fixture.detectChanges();
        await fixture.whenStable();

        vi.spyOn(radioGroup.change, 'emit');

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.change.emit).toHaveBeenCalledTimes(1);
    });

    it('Should forward the registered touched callback to the radio buttons', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        await fixture.whenStable();

        const onTouched = vi.fn();
        radioGroup.registerOnTouched(onTouched);

        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;
        dispatchRadioEvent('blur', domRadio, fixture);

        expect(onTouched).toHaveBeenCalled();
    });

    it('Should mark the form control as touched when a radio button is blurred', async () => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const control = fixture.componentInstance.personForm.get('favoriteSeason');
        expect(control.touched).toBe(false);

        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;
        dispatchRadioEvent('blur', domRadio, fixture);
        await fixture.whenStable();

        expect(control.touched).toBe(true);
    });

    it('Should mark the form control as touched when a dynamically added radio button is blurred', async () => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.choices = [0, 1, 2, 3];
        fixture.detectChanges();
        await fixture.whenStable();

        const control = fixture.componentInstance.group1.get('favouriteChoice');
        dispatchRadioEvent('blur', fixture.componentInstance.radioGroup.radioButtons.last.nativeElement, fixture);
        await fixture.whenStable();

        expect(control.touched).toBe(true);
    });

    it('Should not override the touched callback of a radio button\'s own form control', async () => {
        const fixture = TestBed.createComponent(RadioGroupRadioControlsComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.componentInstance.radioGroup;
        const groupTouched = vi.fn();
        radioGroup.registerOnTouched(groupTouched);

        dispatchRadioEvent('blur', radioGroup.radioButtons.first.nativeElement, fixture);
        await fixture.whenStable();

        expect(groupTouched).toHaveBeenCalled();
        expect(fixture.componentInstance.invalidControl.touched).toBe(true);
    });

    it('Should disable radio buttons when the form control is initially disabled', async () => {
        const fixture = TestBed.createComponent(RadioGroupInitiallyDisabledComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.radioButtons.length).toBe(2);
        expect(radioGroup.radioButtons.toArray().every(btn => btn.disabled)).toBe(true);

        fixture.componentInstance.form.get('season').enable();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.radioButtons.toArray().some(btn => btn.disabled)).toBe(false);
    });

    it('Should take the validity of the selected radio button\'s own form control', async () => {
        const fixture = TestBed.createComponent(RadioGroupRadioControlsComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.componentInstance.radioGroup;
        const [invalidRadio, validRadio] = radioGroup.radioButtons.toArray();
        expect(radioGroup.invalid).toBe(false);

        invalidRadio.select();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.invalid).toBe(true);
        expect(radioGroup.radioButtons.toArray().every(btn => btn.invalid)).toBe(true);

        validRadio.select();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.toArray().some(btn => btn.invalid)).toBe(false);
    });

    it('Clicking on a radio button should update the model.', async () => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

        radioInstance.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    });

    it('Updating the model should select a radio button.', async () => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.personBob.favoriteSeason = 'Winter';
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    });

    it('Properly update the model when radio group is hosted in Reactive forms.', async () => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.personForm).toBeDefined();
        expect(fixture.componentInstance.model).toBeDefined();
        expect(fixture.componentInstance.newModel).toBeUndefined();

        fixture.componentInstance.personForm.patchValue({ favoriteSeason: fixture.componentInstance.seasons[0] });
        fixture.componentInstance.updateModel();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.newModel).toBeDefined();
        expect(fixture.componentInstance.newModel.name).toEqual(fixture.componentInstance.model.name);
        expect(fixture.componentInstance.newModel.favoriteSeason).toEqual(fixture.componentInstance.seasons[0]);
    });

    it('Should not throw for validators that read the control value.', async () => {
        const fixture = TestBed.createComponent(RadioGroupValueValidatorComponent);

        expect(() => {
            fixture.detectChanges();
        }).not.toThrow();
        await fixture.whenStable();
        expect(fixture.componentInstance.radioGroup.required).toBe(false);
    });

    it('Should report required when Validators.required is combined with a validator that reads the value.', async () => {
        const fixture = TestBed.createComponent(RadioGroupValueValidatorComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.requiredGroup.required).toBe(true);
    });

    it('Should re-evaluate validity when the form control status changes.', async () => {
        const fixture = TestBed.createComponent(RadioGroupValueValidatorComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.componentInstance.requiredGroup;
        const control = fixture.componentInstance.form.get('requiredChoice');

        // untouched and pristine controls stay in their initial state
        control.updateValueAndValidity();
        expect(radioGroup.invalid).toBe(false);

        control.markAsTouched();
        control.updateValueAndValidity();
        expect(radioGroup.invalid).toBe(true);

        control.setValue('a');
        expect(radioGroup.invalid).toBe(false);

        control.setValue('');
        expect(radioGroup.invalid).toBe(true);

        control.disable();
        expect(radioGroup.invalid).toBe(false);

        control.enable();
        control.reset('');
        expect(radioGroup.invalid).toBe(false);
    });

    it('Should disable and re-enable the buttons through the form control.', async () => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);
        const control = fixture.componentInstance.personForm.get('favoriteSeason');

        control.disable();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(radioGroup.radioButtons.toArray().every(b => b.disabled)).toBe(true);

        control.enable();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(radioGroup.radioButtons.toArray().some(b => b.disabled)).toBe(false);
    });

    it('Should keep template-disabled buttons disabled after the form control is re-enabled.', async () => {
        const fixture = TestBed.createComponent(RadioGroupTemplateDisabledComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const [summer, winter] = fixture.componentInstance.radioGroup.radioButtons.toArray();
        const control = fixture.componentInstance.form.get('season');

        control.disable();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(summer.disabled).toBe(true);
        expect(winter.disabled).toBe(true);

        control.enable();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(summer.disabled).toBe(false);
        expect(winter.disabled).toBe(true);
        expect(winter.nativeInput.nativeElement.disabled).toBe(true);
    });

    it('Properly initialize selection when value is falsy in deep content projection', async () => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.value).toEqual(0);
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
    });

    it('Properly rebind dynamically added components', async () => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        const radioInstance = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.choices = [0, 1, 4, 7];
        fixture.detectChanges();
        await fixture.whenStable();

        radioInstance.radioButtons.last.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioInstance.value).toEqual(7);
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);
    });

    it('Updates checked radio button correctly', async () => {
        const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
        expect(radioGroup.radioButtons.last.checked).toEqual(false);

        radioGroup.radioButtons.last.select();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.radioButtons.first.checked).toEqual(false);
        expect(radioGroup.radioButtons.last.checked).toEqual(true);
    });

    it('Should update styles correctly when required radio group\'s value is set.', async () => {
        const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        await fixture.whenStable();

        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
        expect(radioGroup.selected).toBeUndefined;
        expect(radioGroup.invalid).toBe(false);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);
        dispatchRadioEvent('blur', domRadio, fixture);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.invalid).toBe(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(true);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(domRadio.classList.contains('igx-radio--checked')).toBe(true);
        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
    });

    it('Should select radio button when added programmatically after group value is set', () => {
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
    });

    it('Should not register the same radio button twice', async () => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        await fixture.whenStable();

        const buttons = radioGroup.radioButtons.toArray();
        radioGroup._addRadioButton(buttons[0]);
        fixture.detectChanges();

        expect(radioGroup.radioButtons.toArray()).toEqual(buttons);
    });

    it('Should unregister radio buttons when they are destroyed', async () => {
        const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
        const component = fixture.componentInstance;
        const radioGroup = component.radioGroup;
        fixture.detectChanges();

        component.addRadioButton('option1', 'Option 1');
        component.addRadioButton('option2', 'Option 2');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.radioButtons.length).toBe(2);

        component.radioContainer.remove(0);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(radioGroup.radioButtons.length).toBe(1);
        expect(radioGroup.radioButtons.first.value).toBe('option2');
    });

    for (const { formType, createFixture } of [
        { formType: 'reactive', createFixture: () => TestBed.createComponent(RadioGroupReactiveFormsComponent) },
        { formType: 'template-driven', createFixture: () => TestBed.createComponent(RadioGroupWithModelComponent) }
    ]) {
        it(`should apply an explicit invalid value directly for ${formType} forms`, async () => {
            const fixture = createFixture();
            fixture.detectChanges();
            await fixture.whenStable();
            const instance = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);
            const control = instance.ngControl.control;
            expect(control.untouched && control.pristine).toBe(true);

            instance.invalid = true;
            expect(instance.invalid).toBe(true);
            instance.invalid = false;
            expect(instance.invalid).toBe(false);
        });
    }

    it('should apply an explicit invalid value directly without a bound form control', async () => {
        const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        const instance = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);

        instance.invalid = true;
        expect(instance.invalid).toBe(true);
        instance.invalid = false;
        expect(instance.invalid).toBe(false);
    });

    describe('Required input', () => {
        it('Should propagate required property to all child radio buttons when set to true', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            // RadioGroupComponent already has required="true"
            expect(radioGroup.required).toBe(true);

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(true);
            });
        });

        it('Should propagate required property to all child radio buttons when set to false', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.required).toBe(false);

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(false);
            });
        });

        it('Should update all child radio buttons when required property changes', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            // Initially not required
            expect(radioGroup.required).toBe(false);
            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(false);
            });

            // Set to required
            radioGroup.required = true;
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(true);
            });

            // Set back to not required
            radioGroup.required = false;
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(false);
            });
        });

        it('Should propagate required to dynamically added radio buttons', async () => {
            const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
            const component = fixture.componentInstance;
            const radioGroup = component.radioGroup;

            radioGroup.required = true;
            fixture.detectChanges();
            await fixture.whenStable();

            component.addRadioButton('option1', 'Option 1');
            component.addRadioButton('option2', 'Option 2');
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.radioButtons.forEach(button => {
                expect(button.required).toBe(true);
            });
        });
    });

    describe('Keyboard navigation', () => {
        it('Should navigate to next radio button with ArrowDown key', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(firstButton);

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.toArray()[1]);
            expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);
        });

        it('Should navigate to previous radio button with ArrowUp key', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const secondButton = radioGroup.radioButtons.toArray()[1];
            secondButton.select();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(secondButton);

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        });

        it('Should navigate to next radio button with ArrowRight key in LTR', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.toArray()[1]);
            expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);
        });

        it('Should navigate to previous radio button with ArrowLeft key in LTR', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const secondButton = radioGroup.radioButtons.toArray()[1];
            secondButton.select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        });

        it('Should wrap around to last button when pressing ArrowUp on first button', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.last);
            expect(radioGroup.radioButtons.last.checked).toBe(true);
        });

        it('Should wrap around to first button when pressing ArrowDown on last button', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const lastButton = radioGroup.radioButtons.last;
            lastButton.select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        });

        it('Should skip disabled buttons when navigating with arrow keys', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            // Disable the second button
            const buttons = radioGroup.radioButtons.toArray();
            buttons[1].disabled = true;
            fixture.detectChanges();
            await fixture.whenStable();

            // Select first button and navigate down
            buttons[0].select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            // Should skip the disabled second button and select the third
            expect(radioGroup.selected).toBe(buttons[2]);
            expect(buttons[2].checked).toBe(true);
        });

        it('Should set focus on selected radio button during keyboard navigation', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            fixture.detectChanges();
            await fixture.whenStable();

            vi.spyOn(radioGroup.radioButtons.toArray()[1].nativeElement, 'focus');

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.radioButtons.toArray()[1].nativeElement.focus).toHaveBeenCalled();
        });

        it('Should deselect previous button and blur it when navigating', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const firstButton = radioGroup.radioButtons.first;
            firstButton.select();
            firstButton.focused = true;
            fixture.detectChanges();
            await fixture.whenStable();

            vi.spyOn(firstButton.nativeElement, 'blur');

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(firstButton.checked).toBe(false);
            expect(firstButton.nativeElement.blur).toHaveBeenCalled();
        });

        it('Should prevent default behavior when navigating with arrow keys', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.radioButtons.first.select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
            vi.spyOn(event, 'preventDefault');

            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('Should update tab index to 0 on checked button and -1 on others', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const buttons = radioGroup.radioButtons.toArray();
            buttons[1].select();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(buttons[1].nativeElement.tabIndex).toBe(0);
            expect(buttons[0].nativeElement.tabIndex).toBe(-1);
            expect(buttons[2].nativeElement.tabIndex).toBe(-1);
        });

        it('Should select the first radio button with ArrowDown when none is checked', async () => {
            const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBeNull();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        });

        it('Should select the last radio button with ArrowUp when none is checked', async () => {
            const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.last);
            expect(radioGroup.radioButtons.last.checked).toBe(true);
        });

        it('Should navigate to next radio button with ArrowLeft key in RTL', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.radioButtons.first.select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dir = 'rtl';
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.toArray()[1]);
            expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);
        });

        it('Should navigate to previous radio button with ArrowRight key in RTL', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.radioButtons.toArray()[1].select();
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dir = 'rtl';
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        });

        it('Should not change the selection on non-arrow keys', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const selected = radioGroup.selected;
            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.selected).toBe(selected);
            expect(event.defaultPrevented).toBe(false);
        });

        it('Should stop Tab keydown propagation when there are unchecked enabled radio buttons', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'Tab' });
            vi.spyOn(event, 'stopPropagation');

            groupElement.dispatchEvent(event);

            expect(event.stopPropagation).toHaveBeenCalled();
        });

        it('Should not stop Tab keydown propagation when the checked radio button is the only enabled one', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const [foo, bar, baz] = radioGroup.radioButtons.toArray();
            foo.disabled = true;
            bar.disabled = true;
            fixture.detectChanges();
            expect(baz.checked).toBe(true);

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'Tab' });
            vi.spyOn(event, 'stopPropagation');

            groupElement.dispatchEvent(event);

            expect(event.stopPropagation).not.toHaveBeenCalled();
        });

        it('Should focus the checked radio button on Tab keyup', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const [foo, , baz] = radioGroup.radioButtons.toArray();
            expect(baz.checked).toBe(true);
            expect(baz.focused).toBe(false);

            foo.nativeElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));

            expect(baz.focused).toBe(true);
        });

        it('Should not focus the checked radio button on non-Tab keyup', async () => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const [foo, , baz] = radioGroup.radioButtons.toArray();

            foo.nativeElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

            expect(baz.focused).toBe(false);
        });
    });

    describe('Host classes', () => {
        it('Should apply the before CSS class when a radio button has its label before it', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            expect(groupElement.classList.contains('igx-radio-group--before')).toBe(false);

            radioGroup.radioButtons.first.labelPosition = 'before';
            fixture.detectChanges();

            expect(groupElement.classList.contains('igx-radio-group--before')).toBe(true);
        });

        it('Should apply the disabled CSS class only when all radio buttons are disabled', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const [first, last] = radioGroup.radioButtons.toArray();
            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(false);

            first.disabled = true;
            fixture.detectChanges();
            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(false);

            last.disabled = true;
            fixture.detectChanges();
            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(true);
        });
    });

    describe('Alignment', () => {
        it('Should have horizontal alignment by default', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;

            expect(radioGroup.alignment).toBe('horizontal');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(false);
        });

        it('Should apply vertical CSS class when alignment is set to vertical', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.alignment = 'vertical';
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;

            expect(radioGroup.alignment).toBe('vertical');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(true);
        });

        it('Should remove vertical CSS class when alignment is changed back to horizontal', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            radioGroup.alignment = 'vertical';
            fixture.detectChanges();
            await fixture.whenStable();

            let groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(true);

            radioGroup.alignment = 'horizontal';
            fixture.detectChanges();
            await fixture.whenStable();

            groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            expect(radioGroup.alignment).toBe('horizontal');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(false);
        });

        it('Should initialize with vertical alignment when set in template', async () => {
            const fixture = TestBed.createComponent(RadioGroupVerticalComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;

            expect(radioGroup.alignment).toBe('vertical');
            expect(groupElement.classList.contains('igx-radio-group--vertical')).toBe(true);
        });

        it('Should accept RadioGroupAlignment enum values', async () => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            await fixture.whenStable();

            // Import RadioGroupAlignment from the directive
            // const RadioGroupAlignment = { horizontal: 'horizontal', vertical: 'vertical' } as const;

            radioGroup.alignment = RadioGroupAlignment.vertical as any;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.alignment).toBe('vertical');

            radioGroup.alignment = RadioGroupAlignment.horizontal as any;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(radioGroup.alignment).toBe('horizontal');
        });
    });
});

describe('IgxRadioGroupDirective - Signal Forms', () => {
    let fixture: ComponentFixture<RadioGroupSignalFormComponent>;
    let radioGroup: IgxRadioGroupDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, RadioGroupSignalFormComponent]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(RadioGroupSignalFormComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        radioGroup = fixture.componentInstance.radioGroup;
    });

    it('should initialize and reflect the required rule', () => {
        expect(radioGroup.required).toBe(true);
        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.first.required).toBe(true);
    });

    it('should ignore an explicit invalid value while the field is untouched and pristine', () => {
        radioGroup.invalid = true;
        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.toArray().some(b => b.invalid)).toBe(false);

        fixture.componentInstance.userForm.season().markAsTouched();
        radioGroup.invalid = true;
        expect(radioGroup.invalid).toBe(true);
    });

    it('should become invalid once touched without a selection', async () => {
        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;

        dispatchRadioEvent('blur', domRadio, fixture);
        await fixture.whenStable();
        expect(fixture.componentInstance.userForm.season().touched()).toBe(true);
        expect(radioGroup.invalid).toBe(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(true);

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.componentInstance.model().season).toBe('Winter');
        expect(radioGroup.invalid).toBe(false);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
    });

    it('should return to the initial state when the form is reset', async () => {
        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(radioGroup.invalid).toBe(false);

        fixture.componentInstance.model.set({ season: '' });
        fixture.componentInstance.userForm().reset();
        fixture.detectChanges();
        await fixture.whenStable();

        // The field itself is invalid again, but untouched and pristine
        expect(fixture.componentInstance.userForm.season().invalid()).toBe(true);
        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.toArray().some(b => b.invalid)).toBe(false);
    });

    it('should follow the disabled rule', async () => {
        fixture.componentInstance.isDisabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(radioGroup.radioButtons.toArray().every(b => b.disabled)).toBe(true);

        fixture.componentInstance.isDisabled.set(false);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(radioGroup.radioButtons.toArray().some(b => b.disabled)).toBe(false);
    });
});

@Component({
    template: `
    <igx-radio-group #radioGroup>
        <igx-radio [checked]="true">Option 1</igx-radio>
        <igx-radio>Option 2</igx-radio>
    </igx-radio-group>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
})
class RadioGroupSimpleComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective]
})
class RadioGroupComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective]
})
class RadioGroupRequiredComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, FormsModule]
})
class RadioGroupWithModelComponent {
    @ViewChild('radioGroupSeasons', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;

    public seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    public personBob: Person = { name: 'Bob', favoriteSeason: 'Summer' };
}

const nonEmpty = (c: AbstractControl): ValidationErrors | null => (c.value as string).length === 0 ? { empty: true } : null;

@Component({
    template: `
<form [formGroup]="form">
    <igx-radio-group #group formControlName="choice">
        <igx-radio value="a">a</igx-radio>
        <igx-radio value="b">b</igx-radio>
    </igx-radio-group>
    <igx-radio-group #requiredGroup formControlName="requiredChoice">
        <igx-radio value="a">a</igx-radio>
        <igx-radio value="b">b</igx-radio>
    </igx-radio-group>
</form>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupValueValidatorComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
    @ViewChild('requiredGroup', { read: IgxRadioGroupDirective, static: true }) public requiredGroup: IgxRadioGroupDirective;

    public form = new FormGroup({
        choice: new FormControl('', nonEmpty),
        requiredChoice: new FormControl('', [Validators.required, nonEmpty])
    });
}

@Component({
    template: `
<form [formGroup]="form">
    <igx-radio-group #group formControlName="season">
        <igx-radio value="Summer">Summer</igx-radio>
        <igx-radio value="Winter" [disabled]="true">Winter</igx-radio>
    </igx-radio-group>
</form>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupTemplateDisabledComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public form = new FormGroup({ season: new FormControl('Summer') });
}

@Component({
    template: `
<form [formGroup]="form">
    <igx-radio-group #group formControlName="season">
        <igx-radio value="Summer">Summer</igx-radio>
        <igx-radio value="Winter">Winter</igx-radio>
    </igx-radio-group>
</form>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupInitiallyDisabledComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public form = new FormGroup({ season: new FormControl({ value: 'Summer', disabled: true }) });
}

const alwaysInvalid = (): ValidationErrors => ({ invalid: true });

@Component({
    template: `
    <igx-radio-group #group>
        <igx-radio value="a" [formControl]="invalidControl">a</igx-radio>
        <igx-radio value="b" [formControl]="validControl">b</igx-radio>
    </igx-radio-group>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupRadioControlsComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public invalidControl = new FormControl<string | null>(null, alwaysInvalid);
    public validControl = new FormControl<string | null>(null);
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioGroupDirective]
})

class RadioGroupTestComponent implements OnInit {
    @ViewChild('radioContainer', { read: ViewContainerRef, static: true })
    public container!: ViewContainerRef;

    public alignment = RadioGroupAlignment.horizontal;
    public required = false;
    public value: any;

    public radios: {
        label: string;
        value: any;
    }[] = [];

    public handleChange(args: any) {
        this.value = args.value;
    }

    public ngOnInit(): void {
        this.container.clear();
        this.radios.forEach((option) => {
            const componentRef: ComponentRef<IgxRadioComponent> = this.container.createComponent(IgxRadioComponent);

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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
})
class RadioGroupVerticalComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;
}

const dispatchRadioEvent = (eventName, radioNativeElement, fixture) => {
    radioNativeElement.dispatchEvent(new Event(eventName));
    fixture.detectChanges();
};

@Component({
    template: `
    <igx-radio-group #group [formField]="userForm.season">
        @for (season of seasons; track season) {
            <igx-radio [value]="season">{{ season }}</igx-radio>
        }
    </igx-radio-group>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, FormField]
})
class RadioGroupSignalFormComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
    public model = signal({ season: '' });
    public isDisabled = signal(false);
    public userForm = signalForm(this.model, (path) => {
        required(path.season);
        disabled(path.season, { when: () => this.isDisabled() });
    });
}
