import { Component, ViewChild, ViewChildren, QueryList, DebugElement } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, UntypedFormBuilder, ReactiveFormsModule, Validators, UntypedFormControl, UntypedFormGroup, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxInputGroupComponent } from '../../input-group/input-group.component';
import { IgxInputDirective, IgxInputState } from './input.directive';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxLabelDirective } from '../label/label.directive';
import { IgxSuffixDirective } from '../suffix/suffix.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxMaskDirective } from '../mask/mask.directive';

const INPUT_CSS_CLASS = 'igx-input-group__input';
const CSS_CLASS_INPUT_GROUP_LABEL = 'igx-input-group__label';
const TEXTAREA_CSS_CLASS = 'igx-input-group__textarea';

const INPUT_GROUP_FOCUSED_CSS_CLASS = 'igx-input-group--focused';
const INPUT_GROUP_PLACEHOLDER_CSS_CLASS = 'igx-input-group--placeholder';
const INPUT_GROUP_FILLED_CSS_CLASS = 'igx-input-group--filled';
const INPUT_GROUP_DISABLED_CSS_CLASS = 'igx-input-group--disabled';

const INPUT_GROUP_REQUIRED_CSS_CLASS = 'igx-input-group--required';
const INPUT_GROUP_VALID_CSS_CLASS = 'igx-input-group--valid';
const INPUT_GROUP_INVALID_CSS_CLASS = 'igx-input-group--invalid';

describe('IgxInput', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                InputComponent,
                TextareaComponent,
                InputWithPlaceholderComponent,
                InitiallyFilledInputComponent,
                FilledInputComponent,
                DisabledInputComponent,
                RequiredInputComponent,
                RequiredTwoWayDataBoundInputComponent,
                DataBoundDisabledInputComponent,
                DataBoundDisabledInputWithoutValueComponent,
                ReactiveFormComponent,
                InputsWithSameNameAttributesComponent,
                ToggleRequiredWithNgModelInputComponent,
                InputReactiveFormComponent,
                FileInputFormComponent
            ]
        }).compileComponents();
    }));

    it('Initializes an input.', () => {
        const fixture = TestBed.createComponent(InputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        expect(inputElement.classList.length).toBe(1);
        expect(inputElement.classList.contains(INPUT_CSS_CLASS)).toBe(true);
    });

    it('Initializes a textarea.', () => {
        const fixture = TestBed.createComponent(TextareaComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        expect(inputElement.classList.length).toBe(1);
        expect(inputElement.classList.contains(TEXTAREA_CSS_CLASS)).toBe(true);
    });

    it('should apply focused style.', () => {
        const fixture = TestBed.createComponent(InputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        inputElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FOCUSED_CSS_CLASS)).toBe(true);
        expect(igxInput.focused).toBe(true);

        inputElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_FOCUSED_CSS_CLASS)).toBe(false);
        expect(igxInput.focused).toBe(false);
    });

    it('should have a placeholder style. Placeholder API.', () => {
        const fixture = TestBed.createComponent(InputWithPlaceholderComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_PLACEHOLDER_CSS_CLASS)).toBe(true);

        const igxInput = fixture.componentInstance.igxInput;
        expect(igxInput.hasPlaceholder).toBe(true);
        expect(igxInput.placeholder).toBe('Test');
    });

    it('should have an initial filled style when data bound.', fakeAsync(() => {
        const fixture = TestBed.createComponent(InitiallyFilledInputComponent);
        fixture.detectChanges();

        tick();
        fixture.detectChanges();

        const notFilledUndefined = fixture.componentInstance.igxInputGroupNotFilledUndefined.element.nativeElement;
        expect(notFilledUndefined.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const notFilledNull = fixture.componentInstance.igxInputGroupNotFilledNull.element.nativeElement;
        expect(notFilledNull.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const notFilledEmpty = fixture.componentInstance.igxInputGroupNotFilledEmpty.element.nativeElement;
        expect(notFilledEmpty.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const filledString = fixture.componentInstance.igxInputGroupFilledString.element.nativeElement;
        expect(filledString.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledNumber = fixture.componentInstance.igxInputGroupFilledNumber.element.nativeElement;
        expect(filledNumber.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledBoolFalse = fixture.componentInstance.igxInputGroupFilledBoolFalse.element.nativeElement;
        expect(filledBoolFalse.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledBoolTrue = fixture.componentInstance.igxInputGroupFilledBoolTrue.element.nativeElement;
        expect(filledBoolTrue.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const filledDate = fixture.componentInstance.igxInputGroupFilledDate.element.nativeElement;
        expect(filledDate.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);
    }));

    it('should have a filled style. Value API.', () => {
        const fixture = TestBed.createComponent(FilledInputComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        inputElement.value = '';
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);

        const igxInput = fixture.componentInstance.igxInput;
        igxInput.value = 'test';
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);
        expect(igxInput.value).toBe('test');
    });

    it('should have a disabled style. Disabled API.', () => {
        const fixture = TestBed.createComponent(DisabledInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(true);
        expect(inputElement.disabled).toBe(true);
        expect(igxInput.disabled).toBe(true);

        igxInput.disabled = false;
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(false);
        expect(inputElement.disabled).toBe(false);
        expect(igxInput.disabled).toBe(false);
    });

    it('should have a disabled style via binding', () => {
        const fixture = TestBed.createComponent(DataBoundDisabledInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(false);
        expect(inputElement.disabled).toBe(false);
        expect(igxInput.disabled).toBe(false);

        fixture.componentInstance.disabled = true;
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(true);
        expect(inputElement.disabled).toBe(true);
        expect(igxInput.disabled).toBe(true);
    });

    it('should have disabled style if disabled attr is set without value', () => {
        const fixture = TestBed.createComponent(DataBoundDisabledInputWithoutValueComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(true);
        expect(inputElement.disabled).toBe(true);
        expect(igxInput.disabled).toBe(true);

        fixture.componentInstance.changeDisabledState();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_DISABLED_CSS_CLASS)).toBe(false);
        expect(inputElement.disabled).toBe(false);
        expect(igxInput.disabled).toBe(false);
    });

    it('should style required input correctly.', () => {
        const fixture = TestBed.createComponent(RequiredInputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        testRequiredValidation(inputElement, fixture);
    });

    it('should update style when required input\'s value is set.', () => {
        const fixture = TestBed.createComponent(RequiredInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;

        dispatchInputEvent('focus', inputElement, fixture);
        dispatchInputEvent('blur', inputElement, fixture);

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);

        dispatchInputEvent('focus', inputElement, fixture);
        igxInput.value = 'test';
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.VALID);


        igxInput.value = '';
        fixture.detectChanges();

        dispatchInputEvent('focus', inputElement, fixture);
        dispatchInputEvent('blur', inputElement, fixture);

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
    });

    it('should style required input with two-way databinding correctly.', () => {
        const fixture = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
        testRequiredValidation(inputElement, fixture);
    });

    it('should work properly with reactive forms validation.', () => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();

        fixture.debugElement.componentInstance.markAsTouched();
        fixture.detectChanges();

        const invalidInputGroups = fixture.debugElement.nativeElement.querySelectorAll(`.igx-input-group--invalid`);
        expect(invalidInputGroups.length).toBe(6);

        const requiredInputGroups = fixture.debugElement.nativeElement.querySelectorAll(`.igx-input-group--required`);
        expect(requiredInputGroups.length).toBe(6);
    });

    it('When updating two inputs with same attribute names through ngModel, label should responds', fakeAsync(() => {

        const fix = TestBed.createComponent(InputsWithSameNameAttributesComponent);
        fix.detectChanges();

        let igxInputGroups = fix.debugElement.queryAll(By.css('igx-input-group'));
        igxInputGroups.forEach(element => {
            const inputGroup = element.nativeElement;
            expect(inputGroup.classList.contains('igx-input-group--filled')).toBe(false);
        });

        fix.componentInstance.model.firstName = 'Mike';
        fix.detectChanges();

        tick();
        fix.detectChanges();

        igxInputGroups = fix.debugElement.queryAll(By.css('igx-input-group'));
        igxInputGroups.forEach(element => {
            const inputGroup = element.nativeElement;
            expect(inputGroup.classList.contains('igx-input-group--filled')).toBe(true);
        });
    }));

    it('should not draw input as invalid when updated through ngModel and input is pristine and untouched', fakeAsync(() => {
        const fix = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fix.detectChanges();

        const inputGroup = fix.debugElement.children[0];

        fix.componentInstance.user.firstName = 'Bobby';
        fix.detectChanges();
        tick();
        fix.detectChanges();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--filled')).toBe(true);

        fix.componentInstance.user.firstName = undefined;
        fix.detectChanges();
        tick();
        fix.detectChanges();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);

        fix.componentInstance.user.firstName = '';
        fix.detectChanges();
        tick();
        fix.detectChanges();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);
    }));

    it('should not draw input as invalid when value is changed via reactive form and input is pristine and untouched', () => {
        const fix = TestBed.createComponent(ReactiveFormComponent);
        fix.detectChanges();

        const igxInputGroups = fix.debugElement.queryAll(By.css('igx-input-group'));
        const firstInputGroup = igxInputGroups[0];

        fix.componentInstance.form.patchValue({ str: 'test' });
        fix.detectChanges();
        expect(firstInputGroup.nativeElement.classList.contains('igx-input-group--filled')).toBe(true);

        fix.componentInstance.form.patchValue({ str: undefined });
        fix.detectChanges();
        expect(firstInputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);

        fix.componentInstance.form.patchValue({ str: '' });
        fix.detectChanges();
        expect(firstInputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);
    });

    it('should correctly update state of input without model when updated trough code', fakeAsync(() => {
        const fixture = TestBed.createComponent(RequiredInputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        igxInput.value = 'test';
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);


        igxInput.value = '';
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
    }));

    it('should correctly update state of input when updated through ngModel, no user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.componentInstance.igxInputGroup.element.nativeElement;
        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = igxInput.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.user.firstName = 'Bobby';

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');

        igxInput.value = '';
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');

        igxInput.value = undefined;
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');
    }));

    it('should correctly update state of input when value is changed via reactive, no user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();

        const igxInputGroups = fixture.debugElement.queryAll(By.css('igx-input-group'));
        const inputGroupElement = igxInputGroups[0].nativeElement;
        const igxInput = fixture.componentInstance.strIgxInput;
        const inputElement = igxInput.nativeElement;

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        fixture.componentInstance.form.patchValue({ str: 'Bobby' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');

        fixture.componentInstance.form.patchValue({ str: '' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');

        fixture.componentInstance.form.patchValue({ str: undefined });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');

        fixture.componentInstance.form.reset();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');
    }));

    it('should correctly update state of input when updated through ngModel, with user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(RequiredTwoWayDataBoundInputComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.componentInstance.igxInputGroup.element.nativeElement;
        const igxInput = fixture.componentInstance.igxInput;
        const inputElement = igxInput.nativeElement;

        dispatchInputEvent('focus', inputElement, fixture);
        dispatchInputEvent('blur', inputElement, fixture);

        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('true');

        fixture.componentInstance.user.firstName = 'Bobby';

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');

        fixture.componentInstance.user.firstName = '';
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('true');

        fixture.componentInstance.user.firstName = undefined;
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
        expect(inputElement.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('true');
    }));

    it('should correctly update state of input when value is changed via reactive, with user interactions', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();

        const igxInputGroups = fixture.debugElement.queryAll(By.css('igx-input-group'));
        const inputGroupElement = igxInputGroups[0].nativeElement;
        const igxInput = fixture.componentInstance.strIgxInput;
        const input = igxInput.nativeElement;

        dispatchInputEvent('focus', input, fixture);
        dispatchInputEvent('blur', input, fixture);
        dispatchInputEvent('input', input, fixture);

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
        expect(input.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('true');

        fixture.componentInstance.form.patchValue({ str: 'Bobby' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(input.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');

        fixture.componentInstance.form.patchValue({ str: '' });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
        expect(input.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('true');

        fixture.componentInstance.form.patchValue({ str: undefined });
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(igxInput.valid).toBe(IgxInputState.INVALID);
        expect(input.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('true');

        fixture.componentInstance.form.reset();
        fixture.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
        expect(input.attributes.getNamedItem('aria-invalid').nodeValue).toEqual('false');
    }));

    it('should correctly update enabled/disabled state of igxInput when changed via reactive form', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();
        const igxInput = fixture.componentInstance.strIgxInput;

        expect(igxInput.disabled).toBe(false);
        expect(igxInput.inputGroup.disabled).toBe(false);

        fixture.componentInstance.form.disable();
        expect(igxInput.disabled).toBe(true);
        expect(igxInput.inputGroup.disabled).toBe(true);

        fixture.componentInstance.form.get('str').enable();
        expect(igxInput.disabled).toBe(false);
        expect(igxInput.inputGroup.disabled).toBe(false);
    }));

    it('should style input when required is toggled dynamically.', () => {
        const fixture = TestBed.createComponent(ToggleRequiredWithNgModelInputComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const input = instance.igxInputs.toArray()[1];
        const inputGroup = instance.igxInputGroups.toArray()[1];

        expect(input.required).toBe(false);
        expect(inputGroup.isRequired).toBeFalsy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(false);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);

        instance.isRequired = true;
        fixture.detectChanges();

        expect(input.required).toBe(true);

        expect(inputGroup.isRequired).toBeTruthy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(input.valid).toBe(IgxInputState.INVALID);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);
        expect(input.valid).toBe(IgxInputState.VALID);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
    });

    it('should style input with ngModel when required is toggled dynamically.', () => {
        const fixture = TestBed.createComponent(ToggleRequiredWithNgModelInputComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const input = instance.igxInputs.toArray()[0];
        const inputGroup = instance.igxInputGroups.toArray()[0];

        expect(input.required).toBe(false);
        expect(inputGroup.isRequired).toBeFalsy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(false);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);

        instance.isRequired = true;
        fixture.detectChanges();

        expect(input.required).toBe(true);

        expect(inputGroup.isRequired).toBeTruthy();
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);

        input.value = '';
        dispatchInputEvent('input', input.nativeElement, fixture);
        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('focus', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);

        input.value = '123';
        dispatchInputEvent('input', input.nativeElement, fixture);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);

        dispatchInputEvent('blur', input.nativeElement, fixture);
        expect(input.valid).toBe(IgxInputState.INITIAL);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.element.nativeElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
    });

    it('should not set null or undefined as input value', () => {
        const fixture = TestBed.createComponent(InputComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.igxInput;
        expect(igxInput.value).toBe('');

        igxInput.value = undefined;
        expect(igxInput.value).toBe('');

        igxInput.value = null;
        expect(igxInput.value).toBe('');

        igxInput.value = 0;
        expect(igxInput.value).toBe('0');

        igxInput.value = false;
        expect(igxInput.value).toBe('false');

        igxInput.value = 'Test';
        expect(igxInput.value).toBe('Test');
    });

    it('Should properly initialize when used as a reactive form control - without initial validators/toggle validators', fakeAsync(() => {
        const fix = TestBed.createComponent(InputReactiveFormComponent);
        fix.detectChanges();
        // 1) check if label's --required class and its asterisk are applied
        const dom = fix.debugElement;
        const input = fix.componentInstance.input;
        const inputGroup = fix.componentInstance.igxInputGroup.element.nativeElement;
        const formGroup: UntypedFormGroup = fix.componentInstance.reactiveForm;

        // interaction test - expect actual asterisk
        // The only way to get a pseudo elements like :before OR :after is to use getComputedStyle(element [, pseudoElt]),
        // as these are not in the actual DOM
        let asterisk = window.getComputedStyle(dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').content;
        expect(asterisk).toBe('"*"');
        expect(inputGroup.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);
        expect(input.nativeElement.attributes.getNamedItem('aria-required').nodeValue).toEqual('true');

        // 2) check that input group's --invalid class is NOT applied
        expect(inputGroup.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);

        // interaction test - focus&blur, so the --invalid and --required classes are applied
        // *Use markAsTouched() instead of user interaction ( calling focus + blur) because:
        // Angular handles blur and marks the component as touched, however:
        // in order to ensure Angular handles blur prior to our blur handler (where we check touched),
        // we have to call blur twice.
        fix.debugElement.componentInstance.markAsTouched();
        tick();
        fix.detectChanges();

        expect(inputGroup.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(inputGroup.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);
        expect(input.nativeElement.attributes.getNamedItem('aria-required').nodeValue).toEqual('true');

        // 3) Check if the input group's --invalid and --required classes are removed when validator is dynamically cleared
        fix.componentInstance.removeValidators(formGroup);
        fix.detectChanges();
        tick();

        const formReference = fix.componentInstance.reactiveForm.controls.fullName;
        // interaction test - expect no asterisk
        asterisk = window.getComputedStyle(dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').content;
        expect(formReference).toBeDefined();
        expect(input).toBeDefined();
        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.attributes.getNamedItem('aria-required').nodeValue).toEqual('false');
        expect(inputGroup.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toEqual(false);
        expect(asterisk).toBe('none');
        expect(input.valid).toEqual(IgxInputState.INITIAL);

        // interact with the input and expect no changes
        input.nativeElement.dispatchEvent(new Event('focus'));
        input.nativeElement.dispatchEvent(new Event('blur'));
        tick();
        fix.detectChanges();
        expect(input.valid).toEqual(IgxInputState.INITIAL);

        // Re-add all Validators
        fix.componentInstance.addValidators(formGroup);
        fix.detectChanges();

        expect(inputGroup.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);
        // interaction test - expect actual asterisk
        asterisk = window.getComputedStyle(dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').content;
        expect(asterisk).toBe('"*"');
        expect(input.nativeElement.attributes.getNamedItem('aria-required').nodeValue).toEqual('true');
    }));

    it('should not hold old file input value in form after clearing the input', () => {
        const fixture = TestBed.createComponent(FileInputFormComponent);
        fixture.detectChanges();

        const form = fixture.componentInstance.formWithFileInput;
        const igxInput = fixture.componentInstance.input;
        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        const inputElement = igxInput.nativeElement;

        expect(igxInput.value).toEqual('');
        expect(form.controls['fileInput'].value).toEqual('');

        const list = new DataTransfer();
        const file = new File(["content"], "filename.jpg");
        list.items.add(file);
        const myFileList = list.files;

        inputElement.files = myFileList;
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(igxInput.value).toEqual('C:\\fakepath\\filename.jpg');
        expect(form.controls['fileInput'].value).toEqual('C:\\fakepath\\filename.jpg')

        const clearButton = igxInputGroup.element.nativeElement.querySelector('.igx-input-group__clear-icon');
        expect(clearButton).toBeDefined();

        UIInteractions.simulateClickEvent(clearButton);
        fixture.detectChanges();

        expect(igxInput.value).toEqual('');
        expect(form.controls['fileInput'].value).toEqual('');
    });

    it('should not hold old file input value after clearing the input when ngModel is used', () => {
        const fixture = TestBed.createComponent(FileInputFormComponent);
        fixture.detectChanges();

        const igxInput = fixture.componentInstance.inputWithNgModel;
        const igxInputGroup = fixture.componentInstance.igxInputGroupNgModel;
        const inputElement = igxInput.nativeElement;
        const model = fixture.componentInstance.model;

        expect(igxInput.value).toEqual('');
        expect(model.inputValue).toEqual(null);

        const list = new DataTransfer();
        const file = new File(["content"], "filename.jpg");
        list.items.add(file);
        const myFileList = list.files;

        inputElement.files = myFileList;
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(igxInput.value).toEqual('C:\\fakepath\\filename.jpg');
        expect(model.inputValue).toEqual('C:\\fakepath\\filename.jpg');

        const clearButton = igxInputGroup.element.nativeElement.querySelector('.igx-input-group__clear-icon');
        expect(clearButton).toBeDefined();

        UIInteractions.simulateClickEvent(clearButton);
        fixture.detectChanges();

        expect(igxInput.value).toEqual('');
        expect(model.inputValue).toEqual('');
    });

    it('Should update validity state when programmatically setting errors on reactive form controls', fakeAsync(() => {
        const fix = TestBed.createComponent(InputReactiveFormComponent);
        fix.detectChanges();

        const inputGroup = fix.componentInstance.igxInputGroup.element.nativeElement;
        const formGroup = fix.componentInstance.reactiveForm;

        // the form control has validators
        formGroup.markAllAsTouched();
        formGroup.get('fullName').setErrors({ error: true });
        fix.detectChanges();

        expect(inputGroup.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(inputGroup.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(true);

        // remove the validators and check the same
        fix.componentInstance.removeValidators(formGroup);
        formGroup.markAsUntouched();
        tick();
        fix.detectChanges();

        expect(inputGroup.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroup.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(false);

        formGroup.markAllAsTouched();
        formGroup.get('fullName').setErrors({ error: true });
        fix.detectChanges();

        // no validator, but there is a set error
        expect(inputGroup.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
        expect(inputGroup.classList.contains(INPUT_GROUP_REQUIRED_CSS_CLASS)).toBe(false);
    }));

    it('should keep state as initial on type when there are no errors and validators on reactive form controls', fakeAsync(() => {
        const fix = TestBed.createComponent(InputReactiveFormComponent);
        fix.detectChanges();

        const formGroup = fix.componentInstance.reactiveForm;

        fix.componentInstance.removeValidators(formGroup);
        formGroup.markAsUntouched();
        fix.detectChanges();

        const igxInput = fix.componentInstance.input;
        const inputElement = fix.debugElement.query(By.directive(IgxInputDirective)).nativeElement;

        dispatchInputEvent('focus', inputElement, fix);
        dispatchInputEvent('blur', inputElement, fix);

        const inputGroupElement = fix.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(false);
        expect(igxInput.valid).toBe(IgxInputState.INITIAL);

        dispatchInputEvent('focus', inputElement, fix);
        igxInput.value = 'test';
        fix.detectChanges();

        expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(false);
        expect(inputGroupElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
        expect(inputGroupElement.classList.contains(INPUT_GROUP_FILLED_CSS_CLASS)).toBe(true);

        expect(igxInput.valid).toBe(IgxInputState.INITIAL);
    }));
});

@Component({
    template: `
    <form>
        <igx-input-group #igxInputGroup>
            <label for="firstName" #igxLabel igxLabel>Name</label>
            <input name="firstName" [(ngModel)]="model.firstName" type="text" igxInput />
        </igx-input-group>
        <igx-input-group #igxInputGroup>
            <label for="firstName" #igxLabel igxLabel>Name</label>
            <input name="firstName" [(ngModel)]="model.firstName"  type="text" igxInput />
        </igx-input-group>
    </form>`,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, FormsModule]
})
class InputsWithSameNameAttributesComponent {
    @ViewChildren('igxInputGroup') public igxInputGroup: QueryList<DebugElement>;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;

    public model = {
        firstName: null
    };
}


@Component({
    template: `
    <igx-input-group #igxInputGroup>
        <label for="test" igxLabel>Test</label>
        <input name="test" #igxInput type="text" igxInput />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class InputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `
    <igx-input-group>
        <label for="test" igxLabel>Test</label>
        <textarea name="test" igxInput></textarea>
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class TextareaComponent {
}

@Component({
    template: `
    <igx-input-group>
        <label for="test" igxLabel>Test</label>
        <input name="test" placeholder="Test" #igxInput type="text" igxInput />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class InputWithPlaceholderComponent {
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `
    <igx-input-group #igxInputGroup>
        <label for="test" igxLabel>Test</label>
        <input name="test" #igxInput type="text" igxInput value="Test" />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class FilledInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `
    <igx-input-group #igxInputGroup>
        <label for="test" igxLabel>Test</label>
        <input name="test" #igxInput type="text" igxInput value="Test" disabled="disabled" />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class DisabledInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `
    <igx-input-group #igxInputGroup>
        <label for="test" igxLabel>Test</label>
        <input name="test" #igxInput type="text" igxInput required="required" />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class RequiredInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <label for="test" igxLabel>Test</label>
                    <input name="test" #igxInput type="text" igxInput [(ngModel)]="user.firstName" required="required" />
                </igx-input-group>`,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, FormsModule]
})
class RequiredTwoWayDataBoundInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;

    public user = {
        firstName: ''
    };
}

@Component({
    template: `
    <igx-input-group #igxInputGroupNotFilledUndefined>
        <label for="not-filled-undefined" igxLabel>Not Filled Undefined</label>
        <input name="not-filled-undefined" igxInput [(ngModel)]="notFilledUndefined" />
    </igx-input-group>

    <igx-input-group #igxInputGroupNotFilledNull>
        <label for="not-filled-null" igxLabel>Not Filled Null</label>
        <input name="not-filled-null" igxInput [(ngModel)]="notFilledNull" />
    </igx-input-group>

    <igx-input-group #igxInputGroupNotFilledEmpty>
        <label for="not-filled-empty" igxLabel>Not Filled Empty</label>
        <input name="not-filled-empty" igxInput [(ngModel)]="notFilledEmpty" />
    </igx-input-group>

    <igx-input-group #igxInputGroupFilledString>
        <label for="filled-string" igxLabel>Filled String</label>
        <input name="filled-string" igxInput [(ngModel)]="user.firstName" />
    </igx-input-group>

    <igx-input-group #igxInputGroupFilledNumber>
        <label for="filled-number" igxLabel>Filled Number</label>
        <input name="filled-number" igxInput [(ngModel)]="user.age" />
    </igx-input-group>

    <igx-input-group #igxInputGroupFilledBoolFalse>
        <label for="filled-bool-false" igxLabel>Filled Bool False</label>
        <input name="filled-bool-false" igxInput [(ngModel)]="user.vegetarian" />
    </igx-input-group>

    <igx-input-group #igxInputGroupFilledBoolTrue>
        <label for="filled-bool-true" igxLabel>Filled Bool True</label>
        <input name="filled-bool-true" igxInput [(ngModel)]="user.smoker" />
    </igx-input-group>

    <igx-input-group #igxInputGroupFilledDate>
        <label for="filled-date" igxLabel>Filled Date</label>
        <input name="filled-date" igxInput [(ngModel)]="user.birthDate" />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, FormsModule]
})
class InitiallyFilledInputComponent {
    @ViewChild('igxInputGroupNotFilledUndefined', { static: true }) public igxInputGroupNotFilledUndefined: IgxInputGroupComponent;
    @ViewChild('igxInputGroupNotFilledNull', { static: true }) public igxInputGroupNotFilledNull: IgxInputGroupComponent;
    @ViewChild('igxInputGroupNotFilledEmpty', { static: true }) public igxInputGroupNotFilledEmpty: IgxInputGroupComponent;

    @ViewChild('igxInputGroupFilledString', { static: true }) public igxInputGroupFilledString: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledNumber', { static: true }) public igxInputGroupFilledNumber: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledBoolFalse', { static: true }) public igxInputGroupFilledBoolFalse: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledBoolTrue', { static: true }) public igxInputGroupFilledBoolTrue: IgxInputGroupComponent;
    @ViewChild('igxInputGroupFilledDate', { static: true }) public igxInputGroupFilledDate: IgxInputGroupComponent;

    public notFilledUndefined = undefined;
    public notFilledNull = null;
    public notFilledEmpty = '';
    public user = {
        firstName: 'Oke',
        age: 30,
        vegetarian: false,
        smoker: true,
        birthDate: new Date(1988, 1, 1)
    };
}

@Component({
    template: `
    <igx-input-group #igxInputGroup>
        <label for="test" igxLabel>Test</label>
        <input name="test" #igxInput type="text" igxInput [disabled]="disabled" />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class DataBoundDisabledInputComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective, { static: true }) public igxInput: IgxInputDirective;

    public disabled = false;
}

@Component({
    template: `
    <igx-input-group #igxInputGroup>
        <label for="test" igxLabel>Test</label>
        <input name="test" #igxInput type="text" igxInput disabled />
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
class DataBoundDisabledInputWithoutValueComponent extends DataBoundDisabledInputComponent {
    public changeDisabledState() {
        this.igxInput.disabled = !this.igxInput.disabled;
    }
}

@Component({
    template: `
    <form class="wrapper" [formGroup]="form">
        <section>
        <igx-input-group>
            <label igxLabel>single line</label>
            <input #strinput type="text" formControlName="str" igxInput>
        </igx-input-group>
        <br>
        <igx-input-group>
            <label igxLabel>multi line</label>
            <textarea type="text" formControlName="textarea" igxInput></textarea>
        </igx-input-group>
        <br>
        <igx-input-group>
            <label igxLabel>password</label>
            <input type="password" formControlName="password" igxInput>
        </igx-input-group>
        </section>
        <section>
        <igx-input-group>
            <label igxLabel>1000</label>
            <input type="number" formControlName="num" igxInput igxMask="###">
        </igx-input-group>
        </section>
    </form>
    <form>
        <section>
            <igx-input-group>
                <label igxLabel>single line</label>
                <input type="text" [formControl]="inputControl" igxInput>
            </igx-input-group>
            <igx-input-group>
                <label igxLabel>multi line</label>
                <textarea type="text" [formControl]="textareaControl" igxInput></textarea>
            </igx-input-group>
        </section>
    </form>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, IgxMaskDirective, ReactiveFormsModule]
})
class ReactiveFormComponent {
    @ViewChild('strinput', { static: true, read: IgxInputDirective }) public strIgxInput: IgxInputDirective;

    public form = this.fb.group({
        str: ['', Validators.required],
        textarea: ['', Validators.required],
        password: ['', Validators.required],
        num: [null, Validators.required]
    });

    public inputControl = new FormControl('', [Validators.required]);
    public textareaControl = new FormControl('', [Validators.required]);

    constructor(private fb: UntypedFormBuilder) { }

    public markAsTouched() {
        if (!this.form.valid) {
            for (const key in this.form.controls) {
                if (this.form.controls[key]) {
                    this.form.controls[key].markAsTouched();
                    this.form.controls[key].updateValueAndValidity();
                }
            }
        }

        this.inputControl.markAsTouched();
        this.inputControl.updateValueAndValidity();

        this.textareaControl.markAsTouched();
        this.textareaControl.updateValueAndValidity();
    }
}

@Component({
    template: `
    <igx-input-group>
        <label for="test" igxLabel>Test</label>
        <input name="test" type="text" igxInput [(ngModel)]="data" [required]="isRequired"/>
    </igx-input-group>
    <igx-input-group>
        <label for="test" igxLabel>Test</label>
        <input name="test" type="text" igxInput [value]="data1" [required]="isRequired"/>
    </igx-input-group>
    `,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, FormsModule]
})
class ToggleRequiredWithNgModelInputComponent {
    @ViewChildren(IgxInputDirective)
    public igxInputs: QueryList<IgxInputDirective>;

    @ViewChildren(IgxInputGroupComponent)
    public igxInputGroups: QueryList<IgxInputGroupComponent>;

    public data = '';
    public data1 = '';
    public isRequired = false;
}
@Component({
    template: `
        <form [formGroup]="reactiveForm" (ngSubmit)="onSubmitReactive()">
            <igx-input-group #igxInputGroup>
                <input igxInput #inputReactive name="fullName" type="text" formControlName="fullName" />
                <label igxLabel for="fullName">Full Name</label>
                <igx-suffix>
                    <igx-icon>person</igx-icon>
                </igx-suffix>
            </igx-input-group>
        </form>
`,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, IgxSuffixDirective, IgxIconComponent, ReactiveFormsModule]
})

class InputReactiveFormComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild('inputReactive', { read: IgxInputDirective }) public input: IgxInputDirective;
    public reactiveForm: UntypedFormGroup;

    public validationType = {
        fullName: [Validators.required]
    };

    constructor(fb: UntypedFormBuilder) {
        this.reactiveForm = fb.group({
            fullName: new UntypedFormControl('', Validators.required)
        });
    }
    public onSubmitReactive() { }

    public removeValidators(form: UntypedFormGroup) {
        for (const key in form.controls) {
            if (form.controls.hasOwnProperty(key)) {
                form.get(key).clearValidators();
                form.get(key).updateValueAndValidity();
            }
        }
    }

    public addValidators(form: UntypedFormGroup) {
        for (const key in form.controls) {
            if (form.controls.hasOwnProperty(key)) {
                form.get(key).setValidators(this.validationType[key]);
                form.get(key).updateValueAndValidity();
            }
        }
    }

    public markAsTouched() {
        if (!this.reactiveForm.valid) {
            for (const key in this.reactiveForm.controls) {
                if (this.reactiveForm.controls.hasOwnProperty(key)) {
                    if (this.reactiveForm.controls[key]) {
                        this.reactiveForm.controls[key].markAsTouched();
                        this.reactiveForm.controls[key].updateValueAndValidity();
                    }
                }
            }
        }
    }
}

@Component({
    template: `
        <form [formGroup]="formWithFileInput" (ngSubmit)="onSubmit()">
            <igx-input-group #igxInputGroup>
                <input igxInput #fileInput name="fileInput" type="file" formControlName="fileInput" />
                <label igxLabel for="fileInput">File Name</label>
            </igx-input-group>
        </form>
        <igx-input-group #igxInputGroupNgModel>
            <input igxInput #inputNgModel name="inputNgModel" type="file" [(ngModel)]="model.inputValue"/>
            <label igxLabel for="inputNgModel">File Name</label>
        </igx-input-group>
`,
    imports: [IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, ReactiveFormsModule, FormsModule]
})

class FileInputFormComponent {
    @ViewChild('igxInputGroup', { static: true }) public igxInputGroup: IgxInputGroupComponent;
    @ViewChild('fileInput', { read: IgxInputDirective }) public input: IgxInputDirective;
    @ViewChild('igxInputGroupNgModel', { static: true }) public igxInputGroupNgModel: IgxInputGroupComponent;
    @ViewChild('inputNgModel', { read: IgxInputDirective }) public inputWithNgModel: IgxInputDirective;
    public formWithFileInput: UntypedFormGroup;
    public model = {
        inputValue: null
    };

    constructor(fb: UntypedFormBuilder) {
        this.formWithFileInput = fb.group({
            fileInput: new UntypedFormControl('')
        });
    }
}

const testRequiredValidation = (inputElement, fixture) => {
    dispatchInputEvent('focus', inputElement, fixture);
    inputElement.value = 'test';
    dispatchInputEvent('input', inputElement, fixture);

    const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
    expect(inputGroupElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(true);
    const igxInput = fixture.componentInstance.igxInput;
    expect(igxInput.valid).toBe(IgxInputState.VALID);

    dispatchInputEvent('blur', inputElement, fixture);

    expect(inputGroupElement.classList.contains(INPUT_GROUP_VALID_CSS_CLASS)).toBe(false);
    expect(igxInput.valid).toBe(IgxInputState.INITIAL);

    dispatchInputEvent('focus', inputElement, fixture);
    inputElement.value = '';

    dispatchInputEvent('input', inputElement, fixture);

    expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
    expect(igxInput.valid).toBe(IgxInputState.INVALID);

    dispatchInputEvent('blur', inputElement, fixture);

    expect(inputGroupElement.classList.contains(INPUT_GROUP_INVALID_CSS_CLASS)).toBe(true);
    expect(igxInput.valid).toBe(IgxInputState.INVALID);
};

const dispatchInputEvent = (eventName, inputNativeElement, fixture) => {
    inputNativeElement.dispatchEvent(new Event(eventName));
    fixture.detectChanges();
};
