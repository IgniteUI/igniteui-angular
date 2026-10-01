import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxRadioGroupDirective } from './radio-group.directive';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormBuilder, FormGroup, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { FormField, disabled, form as signalForm, required } from '@angular/forms/signals';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IgxRadioComponent } from '../../radio/radio.component';

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
                RadioGroupValueValidatorComponent,
                RadioGroupTemplateDisabledComponent,
                RadioGroupDeepProjectionComponent,
                RadioGroupTestComponent,
                DynamicRadioGroupComponent,
                RadioGroupVerticalComponent,
                RadioGroupInitiallyDisabledComponent,
                RadioGroupRadioControlsComponent,
                RadioGroupRequiredRadioControlsComponent,
                RadioGroupChangeOrderComponent,
                RadioGroupInsertComponent,
                RadioGroupEarlySelectedComponent,
                RadioGroupEarlySelectedBoundComponent
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

        expect(radioInstance.checked).toBeTrue();
        expect(radioInstance.nativeElement.checked).toBeTrue();
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

        spyOn(radioInstance.change, 'emit');

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

        spyOn(radioInstance.change, 'emit');

        radioInstance.selected = radioInstance.radioButtons.first;
        fixture.detectChanges();

        expect(radioInstance.value).toEqual('Foo');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).not.toHaveBeenCalled();
    }));

    it('Setting selected to null should clear the value and uncheck all radio buttons', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons.last.checked).toBe(true);

        radioInstance.selected = null;
        fixture.detectChanges();

        expect(radioInstance.value).toBeNull();
        expect(radioInstance.radioButtons.toArray().some(btn => btn.checked)).toBe(false);
    }));

    it('Resetting the form control should uncheck all radio buttons', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);
        expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);

        fixture.componentInstance.personForm.get('favoriteSeason').reset();
        fixture.detectChanges();
        tick();

        expect(radioGroup.value).toBeNull();
        expect(radioGroup.radioButtons.toArray().some(btn => btn.checked)).toBe(false);
    }));

    it('Should emit change once when a radio button is clicked', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        spyOn(radioInstance.change, 'emit');

        radioInstance.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radioInstance.change.emit).toHaveBeenCalledTimes(1);
        expect(radioInstance.change.emit).toHaveBeenCalledWith(jasmine.objectContaining({
            value: 'Foo',
            owner: radioInstance.radioButtons.first
        }));
    }));

    it('Should update the form control value once when a radio button is clicked', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);
        const valueChanges = jasmine.createSpy('valueChanges');
        fixture.componentInstance.personForm.get('favoriteSeason').valueChanges.subscribe(valueChanges);

        radioGroup.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(valueChanges).toHaveBeenCalledOnceWith('Winter');
    }));

    it('Should emit change once for radio buttons added in separate change detection cycles', fakeAsync(() => {
        const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
        const component = fixture.componentInstance;
        const radioGroup = component.radioGroup;
        fixture.detectChanges();

        component.addRadioButton('option1', 'Option 1');
        fixture.detectChanges();
        tick();
        component.addRadioButton('option2', 'Option 2');
        fixture.detectChanges();
        tick();
        component.addRadioButton('option3', 'Option 3');
        fixture.detectChanges();
        tick();

        spyOn(radioGroup.change, 'emit');

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        tick();

        expect(radioGroup.change.emit).toHaveBeenCalledTimes(1);
    }));

    it('Should forward the registered touched callback to the radio buttons', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        const onTouched = jasmine.createSpy('onTouched');
        radioGroup.registerOnTouched(onTouched);

        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;
        dispatchRadioEvent('blur', domRadio, fixture);

        expect(onTouched).toHaveBeenCalled();
    }));

    it('Should mark the form control as touched when a radio button is blurred', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        tick();

        const control = fixture.componentInstance.personForm.get('favoriteSeason');
        expect(control.touched).toBe(false);

        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;
        dispatchRadioEvent('blur', domRadio, fixture);
        tick();

        expect(control.touched).toBe(true);
    }));

    it('Should mark the form control as touched when a dynamically added radio button is blurred', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        tick();

        fixture.componentInstance.choices.set([0, 1, 2, 3]);
        fixture.detectChanges();
        tick();

        const control = fixture.componentInstance.group1.get('favouriteChoice');
        dispatchRadioEvent('blur', fixture.componentInstance.radioGroup.radioButtons.last.nativeElement, fixture);
        tick();

        expect(control.touched).toBe(true);
    }));

    it('Should not override the touched callback of a radio button\'s own form control', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupRadioControlsComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        const groupTouched = jasmine.createSpy('groupTouched');
        radioGroup.registerOnTouched(groupTouched);

        dispatchRadioEvent('blur', radioGroup.radioButtons.first.nativeElement, fixture);
        tick();

        expect(groupTouched).toHaveBeenCalled();
        expect(fixture.componentInstance.invalidControl.touched).toBe(true);
    }));

    it('Should disable radio buttons when the form control is initially disabled', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupInitiallyDisabledComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.radioButtons.length).toBe(2);
        expect(radioGroup.radioButtons.toArray().every(btn => btn.disabled)).toBe(true);

        fixture.componentInstance.form.get('season').enable();
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.toArray().some(btn => btn.disabled)).toBe(false);
    }));

    it('Should take the validity of the selected radio button\'s own form control', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupRadioControlsComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        const [invalidRadio, validRadio] = radioGroup.radioButtons.toArray();
        expect(radioGroup.invalid).toBe(false);

        invalidRadio.select();
        fixture.detectChanges();
        tick();

        expect(radioGroup.invalid).toBe(true);
        expect(radioGroup.radioButtons.toArray().every(btn => btn.invalid)).toBe(true);

        validRadio.select();
        fixture.detectChanges();
        tick();

        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.toArray().some(btn => btn.invalid)).toBe(false);
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

        fixture.componentInstance.favoriteSeason.set('Winter');
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

    it('Should not throw for validators that read the control value.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupValueValidatorComponent);

        expect(() => {
            fixture.detectChanges();
            tick();
        }).not.toThrow();
        expect(fixture.componentInstance.radioGroup.required).toBe(false);
    }));

    it('Should report required when Validators.required is combined with a validator that reads the value.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupValueValidatorComponent);
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.requiredGroup.required).toBe(true);
    }));

    it('Should re-evaluate validity when the form control status changes.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupValueValidatorComponent);
        fixture.detectChanges();
        tick();

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
    }));

    it('Should disable and re-enable the buttons through the form control.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.debugElement.query(By.directive(IgxRadioGroupDirective)).injector.get(IgxRadioGroupDirective);
        const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
        const control = fixture.componentInstance.personForm.get('favoriteSeason');

        // Form control state reaches the view without a manual `markForCheck`.
        control.disable();
        fixture.detectChanges();
        tick();
        expect(radioGroup.radioButtons.toArray().every(b => b.disabled)).toBe(true);
        expect(radioGroup.radioButtons.toArray().every(b => b.nativeElement.disabled)).toBe(true);
        expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(true);

        control.enable();
        fixture.detectChanges();
        tick();
        expect(radioGroup.radioButtons.toArray().some(b => b.disabled)).toBe(false);
        expect(radioGroup.radioButtons.toArray().some(b => b.nativeElement.disabled)).toBe(false);
        expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(false);
    }));

    it('Should keep template-disabled buttons disabled after the form control is re-enabled.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupTemplateDisabledComponent);
        fixture.detectChanges();
        tick();

        const [summer, winter] = fixture.componentInstance.radioGroup.radioButtons.toArray();
        const control = fixture.componentInstance.form.get('season');

        control.disable();
        fixture.detectChanges();
        tick();
        expect(summer.disabled).toBe(true);
        expect(winter.disabled).toBe(true);

        control.enable();
        fixture.detectChanges();
        tick();
        expect(summer.disabled).toBe(false);
        expect(winter.disabled).toBe(true);
        expect(winter.nativeInput.nativeElement.disabled).toBe(true);
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

        fixture.componentInstance.choices.set([ 0, 1, 4, 7 ]);
        fixture.detectChanges();
        tick();

        radioInstance.radioButtons.last.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual(7);
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);
    }));

    it('Ignores a radio button that is removed from the group', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        const removed = radioGroup.radioButtons.last;

        fixture.componentInstance.choices.set([0, 1]);
        fixture.detectChanges();
        tick();

        // The group must not react to a button it no longer owns.
        spyOn(radioGroup.change, 'emit');
        const onTouched = jasmine.createSpy('onTouched');
        radioGroup.registerOnTouched(onTouched);

        removed.select();
        removed.onBlur();

        expect(radioGroup.change.emit).not.toHaveBeenCalled();
        expect(radioGroup.value).toBe(0);
        expect(onTouched).not.toHaveBeenCalled();
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

    it('Should not register the same radio button twice', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        const buttons = radioGroup.radioButtons.toArray();
        radioGroup._addRadioButton(buttons[0]);
        fixture.detectChanges();

        expect(radioGroup.radioButtons.toArray()).toEqual(buttons);
    }));

    it('Should unregister radio buttons when they are destroyed', fakeAsync(() => {
        const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
        const component = fixture.componentInstance;
        const radioGroup = component.radioGroup;
        fixture.detectChanges();

        component.addRadioButton('option1', 'Option 1');
        component.addRadioButton('option2', 'Option 2');
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.length).toBe(2);

        component.radioContainer.remove(0);
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.length).toBe(1);
        expect(radioGroup.radioButtons.first.value).toBe('option2');
    }));

    it('Setting value to null should uncheck all radio buttons without emitting change', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        spyOn(radioGroup.change, 'emit');

        radioGroup.value = null;
        fixture.detectChanges();

        expect(radioGroup.value).toBeNull();
        expect(radioGroup.radioButtons.toArray().some(btn => btn.checked)).toBe(false);
        expect(radioGroup.change.emit).not.toHaveBeenCalled();
    }));

    it('Setting value to null should clear the selected radio button', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        expect(radioGroup.selected).toBe(radioGroup.radioButtons.last);

        radioGroup.value = null;
        fixture.detectChanges();

        expect(radioGroup.selected).toBeNull();
    }));

    it('Setting a value that matches no radio button should clear the selection', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        radioGroup.value = 'Qux';
        fixture.detectChanges();

        expect(radioGroup.value).toBe('Qux');
        expect(radioGroup.selected).toBeNull();
        expect(radioGroup.radioButtons.toArray().some(btn => btn.checked)).toBe(false);
    }));

    it('Should keep selected set before the radio buttons register', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupEarlySelectedComponent);
        const { radioGroup, first } = fixture.componentInstance;
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.selectedOnInit).toBe(first);
        expect(radioGroup.selected).toBe(first);
        expect(radioGroup.value).toBe('Foo');
        expect(first.checked).toBe(true);
    }));

    it('Should apply selected set before the value of the radio button is bound', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupEarlySelectedBoundComponent);
        const { radioGroup, first } = fixture.componentInstance;
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.selectedOnInit).toBe(first);
        expect(radioGroup.selected).toBe(first);
        expect(radioGroup.value).toBe('Foo');
        expect(first.checked).toBe(true);
        expect(radioGroup.radioButtons.last.checked).toBe(false);
    }));

    it('Should let a value set after an early selected win', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupEarlySelectedComponent);
        fixture.componentInstance.valueAfterSelected = 'Bar';
        const { radioGroup, first } = fixture.componentInstance;
        fixture.detectChanges();
        tick();

        expect(radioGroup.value).toBe('Bar');
        expect(radioGroup.selected).toBe(radioGroup.radioButtons.last);
        expect(first.checked).toBe(false);
        expect(radioGroup.radioButtons.last.checked).toBe(true);
    }));

    it('Should emit the radio button change before the group change and the change callback', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupChangeOrderComponent);
        fixture.detectChanges();
        tick();

        const { radioGroup, log } = fixture.componentInstance;
        radioGroup.registerOnChange(() => log.push('onChange'));

        radioGroup.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(log).toEqual(['radio', 'group', 'onChange']);
    }));

    it('Should apply the group name to radio buttons added later', fakeAsync(() => {
        const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
        const component = fixture.componentInstance;
        const radioGroup = component.radioGroup;
        fixture.detectChanges();

        expect(radioGroup.name).toMatch(/^igx-radio-group-\d+$/);

        component.addRadioButton('option1', 'Option 1');
        fixture.detectChanges();
        tick();

        const first = radioGroup.radioButtons.first;
        expect(first.name).toBe(radioGroup.name);

        radioGroup.name = 'customName';
        fixture.detectChanges();
        expect(first.name).toBe('customName');

        component.addRadioButton('option2', 'Option 2');
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.last.name).toBe('customName');
        expect(radioGroup.radioButtons.last.nativeElement.name).toBe('customName');
    }));

    it('Should disable radio buttons added after the form control is disabled', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        const control = fixture.componentInstance.group1.get('favouriteChoice');
        control.disable();
        fixture.detectChanges();
        tick();

        fixture.componentInstance.choices.set([0, 1, 2, 3]);
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.length).toBe(4);
        expect(radioGroup.radioButtons.last.disabled).toBe(true);
        expect(radioGroup.radioButtons.last.nativeElement.disabled).toBe(true);

        control.enable();
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.toArray().some(btn => btn.disabled)).toBe(false);
    }));

    it('Should check a radio button added later that matches the form control value', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.componentInstance.group1.get('favouriteChoice').setValue(3);
        fixture.detectChanges();
        tick();

        expect(radioGroup.value).toBe(3);
        expect(radioGroup.radioButtons.toArray().some(btn => btn.checked)).toBe(false);

        fixture.componentInstance.choices.set([0, 1, 2, 3]);
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.last.checked).toBe(true);
        expect(radioGroup.selected).toBe(radioGroup.radioButtons.last);
    }));

    it('Should check a registered radio button whose value changes to match the group value', fakeAsync(() => {
        const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
        const component = fixture.componentInstance;
        const radioGroup = component.radioGroup;
        radioGroup.value = 'option2';
        fixture.detectChanges();

        component.addRadioButton('option1', 'Option 1');
        fixture.detectChanges();
        tick();

        const button = radioGroup.radioButtons.first;
        expect(button.checked).toBe(false);

        button.value = 'option2';
        fixture.detectChanges();

        expect(button.checked).toBe(true);
        expect(radioGroup.selected).toBe(button);
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

        it('Should keep the group required state over the own form control of a radio button', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupRequiredRadioControlsComponent);
            fixture.detectChanges();
            tick();

            const radioGroup = fixture.componentInstance.radioGroup;
            expect(radioGroup.required).toBe(true);
            expect(radioGroup.radioButtons.first.required).toBe(true);
            expect(radioGroup.radioButtons.first.nativeElement.required).toBe(true);
            expect(radioGroup.radioButtons.first.nativeElement.getAttribute('aria-required')).toBe('true');
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

            spyOn(radioGroup.radioButtons.toArray()[1].nativeElement, 'focus');

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

            spyOn(firstButton.nativeElement, 'blur');

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
            spyOn(event, 'preventDefault');

            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(event.preventDefault).toHaveBeenCalled();
        }));

        it('Should navigate in DOM order after a radio button is inserted in the middle', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupInsertComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            fixture.componentInstance.items.set(['A', 'B', 'C']);
            fixture.detectChanges();
            tick();

            expect(radioGroup.radioButtons.map(btn => btn.value)).toEqual(['A', 'B', 'C']);

            radioGroup.radioButtons.first.select();
            fixture.detectChanges();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected.value).toBe('B');
        }));

        it('Should keep DOM order for radio buttons created before existing ones', fakeAsync(() => {
            const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
            const component = fixture.componentInstance;
            const radioGroup = component.radioGroup;
            fixture.detectChanges();

            component.addRadioButton('option2', 'Option 2');
            const componentRef = component.radioContainer.createComponent(IgxRadioComponent, { index: 0 });
            componentRef.instance.value = 'option1';
            componentRef.changeDetectorRef.detectChanges();
            fixture.detectChanges();
            tick();

            expect(radioGroup.radioButtons.map(btn => btn.value)).toEqual(['option1', 'option2']);
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

        it('Should update the tab index and focused state when the value is set programmatically', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const [foo, bar, baz] = radioGroup.radioButtons.toArray();
            baz.focused = true;

            radioGroup.value = 'Foo';
            fixture.detectChanges();

            expect(foo.nativeElement.tabIndex).toBe(0);
            expect(bar.nativeElement.tabIndex).toBe(-1);
            expect(baz.nativeElement.tabIndex).toBe(-1);
            expect(baz.focused).toBe(false);
        }));

        it('Should restore the own tab index of the radio buttons when the value is cleared', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const buttons = radioGroup.radioButtons.toArray();
            expect(buttons.map(btn => btn.nativeElement.tabIndex)).toEqual([-1, -1, 0]);

            radioGroup.value = null;
            fixture.detectChanges();

            expect(buttons.map(btn => btn.nativeElement.tabIndex)).toEqual([0, 0, 0]);
        }));

        it('Should clear the focused state of the other radio buttons on Tab keyup', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const [foo, , baz] = radioGroup.radioButtons.toArray();
            foo.focused = true;

            foo.nativeElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab', bubbles: true }));
            fixture.detectChanges();

            expect(baz.focused).toBe(true);
            expect(foo.focused).toBe(false);
        }));

        it('Should keep the own tab index of the radio buttons when none is checked', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const [foo, bar] = radioGroup.radioButtons.toArray();
            foo.tabindex = 3;
            fixture.detectChanges();

            expect(foo.tabindex).toBe(3);
            expect(foo.nativeElement.tabIndex).toBe(3);
            expect(bar.nativeElement.tabIndex).toBe(0);
        }));

        it('Should select the first radio button with ArrowDown when none is checked', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBeNull();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        }));

        it('Should select the last radio button with ArrowUp when none is checked', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.last);
            expect(radioGroup.radioButtons.last.checked).toBe(true);
        }));

        it('Should navigate to next radio button with ArrowLeft key in RTL', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            radioGroup.radioButtons.first.select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dir = 'rtl';
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.toArray()[1]);
            expect(radioGroup.radioButtons.toArray()[1].checked).toBe(true);
        }));

        it('Should navigate to previous radio button with ArrowRight key in RTL', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            radioGroup.radioButtons.toArray()[1].select();
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            groupElement.dir = 'rtl';
            groupElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(radioGroup.radioButtons.first);
            expect(radioGroup.radioButtons.first.checked).toBe(true);
        }));

        it('Should not change the selection on non-arrow keys', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const selected = radioGroup.selected;
            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
            groupElement.dispatchEvent(event);
            fixture.detectChanges();
            tick();

            expect(radioGroup.selected).toBe(selected);
            expect(event.defaultPrevented).toBe(false);
        }));

        it('Should stop Tab keydown propagation when there are unchecked enabled radio buttons', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'Tab' });
            spyOn(event, 'stopPropagation').and.callThrough();

            groupElement.dispatchEvent(event);

            expect(event.stopPropagation).toHaveBeenCalled();
        }));

        it('Should not stop Tab keydown propagation when the checked radio button is the only enabled one', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const [foo, bar, baz] = radioGroup.radioButtons.toArray();
            foo.disabled = true;
            bar.disabled = true;
            fixture.detectChanges();
            expect(baz.checked).toBe(true);

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const event = new KeyboardEvent('keydown', { key: 'Tab' });
            spyOn(event, 'stopPropagation').and.callThrough();

            groupElement.dispatchEvent(event);

            expect(event.stopPropagation).not.toHaveBeenCalled();
        }));

        it('Should focus the checked radio button on Tab keyup', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const [foo, , baz] = radioGroup.radioButtons.toArray();
            expect(baz.checked).toBe(true);
            expect(baz.focused).toBe(false);

            foo.nativeElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab', bubbles: true }));

            expect(baz.focused).toBe(true);
        }));

        it('Should not focus the checked radio button on non-Tab keyup', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const [foo, , baz] = radioGroup.radioButtons.toArray();

            foo.nativeElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));

            expect(baz.focused).toBe(false);
        }));
    });

    describe('Host classes', () => {
        it('Should apply the before CSS class when a radio button has its label before it', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            expect(groupElement.classList.contains('igx-radio-group--before')).toBe(false);

            radioGroup.radioButtons.first.labelPosition = 'before';
            fixture.detectChanges();

            expect(groupElement.classList.contains('igx-radio-group--before')).toBe(true);
        }));

        it('Should apply the disabled CSS class only when all radio buttons are disabled', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
            const radioGroup = fixture.componentInstance.radioGroup;
            fixture.detectChanges();
            tick();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            const [first, last] = radioGroup.radioButtons.toArray();
            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(false);

            first.disabled = true;
            fixture.detectChanges();
            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(false);

            last.disabled = true;
            fixture.detectChanges();
            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(true);
        }));

        it('Should apply the disabled CSS class to a group without radio buttons', fakeAsync(() => {
            const fixture = TestBed.createComponent(DynamicRadioGroupComponent);
            fixture.detectChanges();

            const groupElement = fixture.debugElement.query(By.css('igx-radio-group')).nativeElement;
            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(true);

            fixture.componentInstance.addRadioButton('option1', 'Option 1');
            fixture.detectChanges();
            tick();

            expect(groupElement.classList.contains('igx-radio-group--disabled')).toBe(false);
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

            // Import RadioGroupAlignment from the directive
            const RadioGroupAlignment = { horizontal: 'horizontal', vertical: 'vertical' } as const;

            radioGroup.alignment = RadioGroupAlignment.vertical as any;
            fixture.detectChanges();
            tick();

            expect(radioGroup.alignment).toBe('vertical');

            radioGroup.alignment = RadioGroupAlignment.horizontal as any;
            fixture.detectChanges();
            tick();

            expect(radioGroup.alignment).toBe('horizontal');
        }));
    });
});

describe('IgxRadioGroupDirective - Signal Forms', () => {
    let fixture: ComponentFixture<RadioGroupSignalFormComponent>;
    let radioGroup: IgxRadioGroupDirective;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, RadioGroupSignalFormComponent]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(RadioGroupSignalFormComponent);
        fixture.detectChanges();
        tick();
        radioGroup = fixture.componentInstance.radioGroup;
    }));

    it('should initialize and reflect the required rule', () => {
        expect(radioGroup.required).toBe(true);
        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.first.required).toBe(true);
    });

    it('should become invalid once touched without a selection', fakeAsync(() => {
        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;

        dispatchRadioEvent('blur', domRadio, fixture);
        tick();
        expect(fixture.componentInstance.userForm.season().touched()).toBe(true);
        expect(radioGroup.invalid).toBe(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(true);

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        tick();
        expect(fixture.componentInstance.model().season).toBe('Winter');
        expect(radioGroup.invalid).toBe(false);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
    }));

    it('should follow the disabled rule', fakeAsync(() => {
        fixture.componentInstance.isDisabled.set(true);
        fixture.detectChanges();
        tick();
        expect(radioGroup.radioButtons.toArray().every(b => b.disabled)).toBe(true);

        fixture.componentInstance.isDisabled.set(false);
        fixture.detectChanges();
        tick();
        expect(radioGroup.radioButtons.toArray().some(b => b.disabled)).toBe(false);
    }));

    it('should follow the required rule at runtime', fakeAsync(() => {
        fixture.componentInstance.isRequired.set(false);
        fixture.detectChanges();
        tick();
        expect(radioGroup.required).toBe(false);
        expect(radioGroup.radioButtons.toArray().some(b => b.required)).toBe(false);

        fixture.componentInstance.isRequired.set(true);
        fixture.detectChanges();
        tick();
        expect(radioGroup.required).toBe(true);
        expect(radioGroup.radioButtons.toArray().every(b => b.required)).toBe(true);
    }));
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
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupOnPushComponent {
    @ViewChild('checkedRadio', { read: IgxRadioComponent, static: true })
    public radio: IgxRadioComponent;

    public form = new FormGroup({
        radio: new FormControl('value1'),
    });
}

@Component({
    template: ` <igx-radio-group #radioGroupSeasons name="radioGroupSeasons" [(ngModel)]="favoriteSeason">
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

    public favoriteSeason = signal('Summer');
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
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupRadioControlsComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public invalidControl = new FormControl<string | null>(null, alwaysInvalid);
    public validControl = new FormControl<string | null>(null);
}

@Component({
    template: `
    <igx-radio-group #group required>
        <igx-radio value="a" [formControl]="control">a</igx-radio>
    </igx-radio-group>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule]
})
class RadioGroupRequiredRadioControlsComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public control = new FormControl<string | null>(null, alwaysInvalid);
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
                @for (choice of choices(); track choice) {
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

    public choices = signal([0, 1, 2]);
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
  imports: [IgxRadioComponent, IgxRadioGroupDirective]
})

class RadioGroupTestComponent implements OnInit {
    @ViewChild('radioContainer', { read: ViewContainerRef, static: true })
    public container!: ViewContainerRef;

    public alignment = 'horizontal';
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
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
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

@Component({
    template: `
    <igx-radio-group #radioGroup (change)="log.push('group')">
        <igx-radio value="a" (change)="log.push('radio')">a</igx-radio>
        <igx-radio value="b" (change)="log.push('radio')">b</igx-radio>
    </igx-radio-group>
`,
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
})
class RadioGroupChangeOrderComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public log: string[] = [];
}

@Component({
    template: `
    <igx-radio-group #radioGroup>
        @for (item of items(); track item) {
            <igx-radio [value]="item">{{ item }}</igx-radio>
        }
    </igx-radio-group>
`,
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
})
class RadioGroupInsertComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public items = signal(['A', 'C']);
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
    imports: [IgxRadioComponent, IgxRadioGroupDirective, FormField]
})
class RadioGroupSignalFormComponent {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
    public model = signal({ season: '' });
    public isDisabled = signal(false);
    public isRequired = signal(true);
    public userForm = signalForm(this.model, (path) => {
        required(path.season, { when: () => this.isRequired() });
        disabled(path.season, { when: () => this.isDisabled() });
    });
}

@Component({
    template: `
    <igx-radio-group #group>
        <igx-radio #first value="Foo">Foo</igx-radio>
        <igx-radio value="Bar">Bar</igx-radio>
    </igx-radio-group>`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective]
})
class RadioGroupEarlySelectedComponent implements OnInit {
    @ViewChild('group', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
    @ViewChild('first', { static: true }) public first: IgxRadioComponent;

    public selectedOnInit: IgxRadioComponent | null;
    public valueAfterSelected: any;

    // Runs before the radio buttons register with the group in their own ngOnInit.
    public ngOnInit(): void {
        this.radioGroup.selected = this.first;
        this.selectedOnInit = this.radioGroup.selected;

        if (this.valueAfterSelected !== undefined) {
            this.radioGroup.value = this.valueAfterSelected;
        }
    }
}

@Component({
    template: `
    <igx-radio-group #group>
        <igx-radio #first [value]="'Foo'">Foo</igx-radio>
        <igx-radio [value]="'Bar'">Bar</igx-radio>
    </igx-radio-group>`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective]
})
class RadioGroupEarlySelectedBoundComponent extends RadioGroupEarlySelectedComponent { }
