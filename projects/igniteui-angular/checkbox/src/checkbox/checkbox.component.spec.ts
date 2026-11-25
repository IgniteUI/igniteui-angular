import { Component, Signal, Type, ViewChild, ElementRef, inject, viewChild, ChangeDetectionStrategy, signal, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, FormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators, NgForm } from '@angular/forms';
import { FormField, disabled, form as signalForm, readonly, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { IgxCheckboxComponent } from './checkbox.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach } from 'vitest';

describe('IgxCheckbox', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                InitCheckboxComponent,
                CheckboxSimpleComponent,
                CheckboxReadonlyComponent,
                CheckboxIndeterminateComponent,
                CheckboxRequiredComponent,
                CheckboxExternalLabelComponent,
                CheckboxInvisibleLabelComponent,
                CheckboxDisabledTransitionsComponent,
                CheckboxFormComponent,
                CheckboxFormGroupComponent,
                CheckboxValueValidatorComponent,
                CheckboxNestedThemeScopeComponent,
                IgxCheckboxComponent
            ]
        }).compileComponents();
    });

    /**
     * Regression tests for https://github.com/IgniteUI/igniteui-angular/issues/15021
     */
    describe('Theming (issue #15021)', () => {
        const getMarks = (host: HTMLElement) => ({
            indigoMark: host.querySelector('.igx-checkbox__composite-mark--indigo') as HTMLElement,
            defaultMark: host.querySelector('.igx-checkbox__composite-mark:not(.igx-checkbox__composite-mark--indigo)') as HTMLElement
        });
        const isVisible = (el: HTMLElement) => getComputedStyle(el).display !== 'none';

        it('renders both tick-mark SVGs, with only one visible per the active --ig-theme', () => {
            const fixture = TestBed.createComponent(CheckboxNestedThemeScopeComponent);
            fixture.detectChanges();

            const root = getMarks(fixture.componentInstance.rootCbHost.nativeElement);
            expect(isVisible(root.defaultMark)).toBe(true);
            expect(isVisible(root.indigoMark)).toBe(false);

            const indigoScoped = getMarks(fixture.componentInstance.indigoCbHost.nativeElement);
            expect(isVisible(indigoScoped.indigoMark)).toBe(true);
            expect(isVisible(indigoScoped.defaultMark)).toBe(false);
        });

        it('shows the material tick mark for a checkbox in a material-scoped wrapper nested inside an indigo-scoped one', () => {
            const fixture = TestBed.createComponent(CheckboxNestedThemeScopeComponent);
            fixture.detectChanges();

            const nested = getMarks(fixture.componentInstance.materialCbHost.nativeElement);
            expect(isVisible(nested.defaultMark)).toBe(true);
            expect(isVisible(nested.indigoMark)).toBe(false);
        });
    });

    it('Initializes a checkbox', () => {
        const { fixture, checkbox, nativeCheckbox, nativeLabel, detectChanges } = createComponent(InitCheckboxComponent);
        const placeholderLabel = fixture.debugElement.query(By.css('.igx-checkbox__label')).nativeElement;

        expect(nativeCheckbox).toBeTruthy();
        expect(nativeCheckbox.id).toContain('igx-checkbox-');
        expect(nativeCheckbox.getAttribute('aria-label')).toEqual(null);
        expect(nativeCheckbox.getAttribute('aria-labelledby')).toContain('igx-checkbox-');

        expect(nativeLabel).toBeTruthy();
        // No longer have a for attribute to not propagate clicks to the native checkbox
        // expect(nativeLabel.getAttribute('for')).toEqual('igx-checkbox-0-input');

        expect(placeholderLabel.textContent.trim()).toEqual('Init');
        expect(placeholderLabel.classList).toContain('igx-checkbox__label');
        expect(placeholderLabel.getAttribute('id')).toContain('igx-checkbox-');

        // When aria-label is present, aria-labeledby shouldn't be
        checkbox.ariaLabel = 'New Label';
        detectChanges();

        expect(nativeCheckbox.getAttribute('aria-labelledby')).toEqual(null);
        expect(nativeCheckbox.getAttribute('aria-label')).toMatch('New Label');
    });

    it('Initializes with ngModel', async () => {
        const {fixture, checkbox, nativeCheckbox, detectChanges} = createComponent(CheckboxSimpleComponent);
        const instance = fixture.componentInstance;

        expect(nativeCheckbox.checked).toBe(false);
        expect(checkbox.checked).toBe(null);

        instance.subscribed = true;
        checkbox.name = 'my-checkbox';

        // One change detection cycle for updating our checkbox
        detectChanges();
        await fixture.whenStable();

        expect(checkbox.checked).toBe(true);

        // Now one more change detection cycle to update the native checkbox
        detectChanges();
        await fixture.whenStable();

        expect(nativeCheckbox.checked).toBe(true);
        expect(checkbox.name).toEqual('my-checkbox');
    });

    it('Initializes with form group', () => {
        const { fixture, checkbox} = createComponent(CheckboxFormGroupComponent);
        const instance = fixture.componentInstance;
        const form = instance.myForm;

        form.setValue({ checkbox: true });
        expect(checkbox.checked).toBe(true);

        form.reset();
        expect(checkbox.checked).toBe(null);
    });

    it('Initializes with external label', () => {
        const { fixture, nativeCheckbox } = createComponent(CheckboxExternalLabelComponent);
        const externalLabel = fixture.debugElement.query(By.css('#my-label')).nativeElement;

        expect(nativeCheckbox.getAttribute('aria-labelledby')).toMatch(externalLabel.getAttribute('id'));
        expect(externalLabel.textContent).toMatch(fixture.componentInstance.label);
    });

    it('Initializes with invisible label', () => {
        const { fixture, nativeCheckbox } = createComponent(CheckboxInvisibleLabelComponent);
        expect(nativeCheckbox.getAttribute('aria-label')).toMatch(fixture.componentInstance.label);
    });

    it('Positions label before and after checkbox', () => {
        const {checkbox, detectChanges} = createComponent(CheckboxSimpleComponent);
        const placeholderLabel = checkbox.placeholderLabel.nativeElement;
        const labelStyles = window.getComputedStyle(placeholderLabel);

        expect(labelStyles.order).toEqual('0');

        checkbox.labelPosition = 'before';
        detectChanges();

        expect(labelStyles.order).toEqual('-1');
    });

    it('Indeterminate state', async () => {
        const {fixture, checkbox, nativeCheckbox, nativeLabel, detectChanges} = createComponent(CheckboxIndeterminateComponent);
        const instance = fixture.componentInstance;

        // Before any changes indeterminate should be true
        expect(checkbox.indeterminate).toBe(true);
        expect(nativeCheckbox.indeterminate).toBe(true);

        instance.subscribed = true;
        detectChanges();
        await fixture.whenStable();

        // First change detection should update our checkbox state and API call should not change indeterminate
        expect(checkbox.checked).toBe(true);
        expect(checkbox.indeterminate).toBe(true);

        // Second change detection should update native checkbox state but indeterminate should not change
        detectChanges();
        await fixture.whenStable();

        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);

        // Should not change the state
        nativeCheckbox.dispatchEvent(new Event('change'));
        detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(checkbox.checked).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);

        // Should update the state on click
        nativeLabel.click();
        detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(false);
        expect(checkbox.checked).toBe(false);
        expect(nativeCheckbox.checked).toBe(false);

        // Should update the state again on click
        nativeLabel.click();
        detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(false);
        expect(checkbox.checked).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);

        // Should be able to set indeterminate again
        checkbox.indeterminate = true;
        detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(checkbox.checked).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);
    });

    it('Disabled state', () => {
        const { checkbox, nativeCheckbox, nativeLabel, detectChanges } = createComponent(InitCheckboxComponent);

        // For test fixture destroy
        checkbox.id = Date.now().toString();
        checkbox.disabled = true;
        const placeholderLabel = checkbox.placeholderLabel.nativeElement;
        detectChanges();

        expect(checkbox.disabled).toBe(true);
        expect(nativeCheckbox.disabled).toBe(true);

        nativeCheckbox.click();
        nativeLabel.click();
        placeholderLabel.click();
        detectChanges();

        // Should not update
        expect(checkbox.checked).toBe(false);
    });

    it('Readonly state', () => {
        const { fixture, checkbox, nativeCheckbox, nativeLabel, detectChanges } = createComponent(CheckboxReadonlyComponent);
        const instance = fixture.componentInstance;
        const placeholderLabel = checkbox.placeholderLabel.nativeElement;

        expect(checkbox.readonly).toBe(true);
        expect(instance.subscribed).toBe(false);

        nativeCheckbox.dispatchEvent(new Event('change'));
        detectChanges();
        // Should not update
        expect(instance.subscribed).toBe(false);

        nativeLabel.click();
        detectChanges();
        // Should not update
        expect(instance.subscribed).toBe(false);

        placeholderLabel.click();
        detectChanges();
        // Should not update
        expect(instance.subscribed).toBe(false);

        nativeCheckbox.click();
        detectChanges();
        // Should not update
        expect(instance.subscribed).toBe(false);
        expect(checkbox.indeterminate).toBe(true);
    });

    it('Should be able to enable/disable CSS transitions', () => {
        const { fixture, checkbox, detectChanges } = createComponent(CheckboxDisabledTransitionsComponent);
        const checkboxHost = fixture.debugElement.query(By.css('igx-checkbox')).nativeElement;

        expect(checkbox.disableTransitions).toBe(true);
        expect(checkboxHost.classList).toContain('igx-checkbox--plain');

        checkbox.disableTransitions = false;
        detectChanges();
        expect(checkboxHost.classList).not.toContain('igx-checkbox--plain');
    });

    it('Required state', () => {
        const { checkbox, nativeCheckbox, detectChanges } = createComponent(CheckboxRequiredComponent);

        expect(checkbox.required).toBe(true);
        expect(nativeCheckbox.required).toBeTruthy();

        checkbox.required = false;
        nativeCheckbox.required = false;
        detectChanges();

        expect(checkbox.required).toBe(false);
        expect(nativeCheckbox.required).toBe(false);
    });

    it('Event handling', () => {
        const { fixture, checkbox, nativeCheckbox, nativeLabel, detectChanges } = createComponent(CheckboxSimpleComponent);
        const instance = fixture.componentInstance;
        const domElement = fixture.debugElement.query(By.directive(IgxCheckboxComponent)).nativeElement;
        const placeholderLabel = checkbox.placeholderLabel.nativeElement;

        expect(checkbox.focused).toBe(false);

        domElement.dispatchEvent(new KeyboardEvent('keyup'));
        detectChanges();

        expect(checkbox.focused).toBe(true);

        nativeCheckbox.dispatchEvent(new Event('blur'));
        detectChanges();

        expect(checkbox.focused).toBe(false);

        nativeLabel.click();
        detectChanges();

        expect(instance.changeEventCalled).toBe(true);
        expect(instance.subscribed).toBe(true);
        expect(instance.clickCounter).toEqual(1);

        placeholderLabel.click();
        detectChanges();

        expect(instance.changeEventCalled).toBe(true);
        expect(instance.subscribed).toBe(false);
        expect(instance.clickCounter).toEqual(2);
    });

    it('Should update style when required checkbox\'s value is set.', () => {
        const { fixture, checkbox, detectChanges } = createComponent(CheckboxRequiredComponent);
        const domElement = fixture.debugElement.query(By.css('igx-checkbox')).nativeElement;

        expect(domElement.classList.contains('igx-checkbox--invalid')).toBe(false);
        expect(checkbox.invalid).toBe(false);
        expect(checkbox.checked).toBe(false);
        expect(checkbox.required).toBe(true);

        dispatchCheckboxEvent('keyup', domElement, detectChanges);
        expect(domElement.classList.contains('igx-checkbox--focused')).toBe(true);
        dispatchCheckboxEvent('blur', domElement, detectChanges);

        expect(checkbox.invalid).toBe(true);
        expect(domElement.classList.contains('igx-checkbox--invalid')).toBe(true);

        dispatchCheckboxEvent('keyup', domElement, detectChanges);
        expect(domElement.classList.contains('igx-checkbox--focused')).toBe(true);
        dispatchCheckboxEvent('click', domElement, detectChanges);

        expect(domElement.classList.contains('igx-checkbox--checked')).toBe(true);
        expect(checkbox.checked).toBe(true);
        expect(checkbox.invalid).toBe(false);
        expect(domElement.classList.contains('igx-checkbox--invalid')).toBe(false);

        dispatchCheckboxEvent('click', domElement, detectChanges);
        dispatchCheckboxEvent('keyup', domElement, detectChanges);
        expect(domElement.classList.contains('igx-checkbox--focused')).toBe(true);
        dispatchCheckboxEvent('blur', domElement, detectChanges);

        expect(checkbox.checked).toBe(false);
        expect(checkbox.invalid).toBe(true);
        expect(domElement.classList.contains('igx-checkbox--invalid')).toBe(true);
    });

    it('Should work properly with ngModel', async () => {
        const { fixture, checkbox } = createComponent(CheckboxFormComponent);
        await fixture.whenStable();

        expect(checkbox.invalid).toEqual(false);

        checkbox.onBlur();
        expect(checkbox.invalid).toEqual(true);

        fixture.componentInstance.ngForm().resetForm();
        await fixture.whenStable();
        expect(checkbox.invalid).toEqual(false);
    });

    it('Should work properly with reactive forms validation.', () => {
        const { fixture, checkbox, detectChanges } = createComponent(CheckboxFormGroupComponent);
        const domElement = fixture.debugElement.query(By.directive(IgxCheckboxComponent)).nativeElement;

        expect(checkbox.required).toBe(true);
        expect(checkbox.invalid).toBe(false);
        expect(domElement.classList.contains('igx-checkbox--invalid')).toBe(false);
        expect(checkbox.nativeElement.getAttribute('aria-required')).toEqual('true');
        expect(checkbox.nativeElement.getAttribute('aria-invalid')).toEqual('false');

        dispatchCheckboxEvent('keyup', domElement, detectChanges);
        expect(checkbox.focused).toBe(true);

        dispatchCheckboxEvent('blur', domElement, detectChanges);
        expect(domElement.classList.contains('igx-checkbox--invalid')).toBe(true);
        expect(checkbox.invalid).toBe(true);
        expect(checkbox.nativeElement.getAttribute('aria-invalid')).toEqual('true');

        checkbox.checked = true;
        detectChanges();

        expect(domElement.classList.contains('igx-checkbox--invalid')).toBe(false);
        expect(checkbox.invalid).toBe(false);
        expect(checkbox.nativeElement.getAttribute('aria-invalid')).toEqual('false');
    });

    it('Should not throw for validators that read the control value.', () => {
        const fixture = TestBed.createComponent(CheckboxValueValidatorComponent);

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(fixture.componentInstance.cb.required).toBe(false);
    });

    it('Should report required when Validators.required is combined with a validator that reads the value.', () => {
        const fixture = TestBed.createComponent(CheckboxValueValidatorComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.cbRequired.nativeInput.nativeElement;
        expect(fixture.componentInstance.cbRequired.required).toBe(true);
        expect(input.hasAttribute('required')).toBe(true);
        expect(input.getAttribute('aria-required')).toBe('true');
    });

    for (const { formType, createFixture } of [
        { formType: 'reactive', createFixture: () => TestBed.createComponent(CheckboxFormGroupComponent) },
        { formType: 'template-driven', createFixture: () => TestBed.createComponent(CheckboxSimpleComponent) }
    ]) {
        it(`should apply an explicit invalid value directly for ${formType} forms`, async () => {
            const fixture = createFixture();
            fixture.detectChanges();
            await fixture.whenStable();
            const instance = fixture.debugElement.query(By.directive(IgxCheckboxComponent)).injector.get(IgxCheckboxComponent);
            const control = instance.ngControl.control;
            expect(control.untouched && control.pristine).toBe(true);

            instance.invalid = true;
            expect(instance.invalid).toBe(true);
            instance.invalid = false;
            expect(instance.invalid).toBe(false);
        });
    }

    it('should apply an explicit invalid value directly without a bound form control', async () => {
        const fixture = TestBed.createComponent(InitCheckboxComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        const instance = fixture.debugElement.query(By.directive(IgxCheckboxComponent)).injector.get(IgxCheckboxComponent);

        instance.invalid = true;
        expect(instance.invalid).toBe(true);
        instance.invalid = false;
        expect(instance.invalid).toBe(false);
    });

    describe('EditorProvider', () => {
        it('Should return correct edit element', () => {
            const { fixture, checkbox } = createComponent(CheckboxSimpleComponent);
            const editElement = fixture.debugElement.query(By.css('.igx-checkbox__input')).nativeElement;

            expect(checkbox.getEditElement()).toBe(editElement);
        });
    });
});

describe('IgxCheckboxComponent - Signal Forms', () => {
    let fixture: ComponentFixture<CheckboxSignalFormComponent>;
    let instance: IgxCheckboxComponent;
    let host: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, CheckboxSignalFormComponent],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckboxSignalFormComponent);
        fixture.detectChanges();
        instance = fixture.componentInstance.control;
        host = fixture.debugElement.query(By.css('igx-checkbox')).nativeElement;
    });

    it('should initialize and reflect the required rule', () => {
        expect(instance.required).toBe(true);
        expect(instance.invalid).toBe(false);
        expect(instance.nativeElement.getAttribute('aria-required')).toEqual('true');
    });

    it('should become invalid once touched while unchecked', () => {
        dispatchCheckboxEvent('blur', host, () => fixture.detectChanges());
        expect(instance.invalid).toBe(true);
        expect(host.classList.contains('igx-checkbox--invalid')).toBe(true);

        dispatchCheckboxEvent('click', host, () => fixture.detectChanges());
        expect(instance.checked).toBe(true);
        expect(fixture.componentInstance.model().accepted).toBe(true);
        expect(instance.invalid).toBe(false);
        expect(host.classList.contains('igx-checkbox--invalid')).toBe(false);
    });

    it('should follow the disabled rule', () => {
        fixture.componentInstance.isDisabled.set(true);
        fixture.detectChanges();
        expect(instance.disabled).toBe(true);

        fixture.componentInstance.isDisabled.set(false);
        fixture.detectChanges();
        expect(instance.disabled).toBe(false);
    });

    it('should ignore an explicit invalid value while the field is untouched and pristine', () => {
        instance.invalid = true;
        expect(instance.invalid).toBe(false);

        fixture.componentInstance.userForm.accepted().markAsTouched();
        instance.invalid = true;
        expect(instance.invalid).toBe(true);
    });

    for (const interaction of ['touched', 'dirty']) {
        for (const availability of ['readonly', 'disabled']) {
            it(`should restore invalid styling for a ${interaction} field after leaving ${availability}`, async () => {
                const field = fixture.componentInstance.userForm.accepted();
                const unavailable = availability === 'readonly'
                    ? fixture.componentInstance.isReadonly : fixture.componentInstance.isDisabled;
                if (interaction === 'touched') {
                    field.markAsTouched();
                } else {
                    field.markAsDirty();
                }
                await fixture.whenStable();

                expect(instance.invalid).toBe(true);
                expect(host.classList.contains('igx-checkbox--invalid')).toBe(true);
                expect(instance.nativeElement.getAttribute('aria-invalid')).toBe('true');

                unavailable.set(true);
                await fixture.whenStable();
                expect(instance[availability]).toBe(true);
                expect(field.invalid()).toBe(false);
                expect(instance.invalid).toBe(false);
                expect(host.classList.contains('igx-checkbox--invalid')).toBe(false);
                expect(instance.nativeElement.getAttribute('aria-invalid')).toBe('false');

                unavailable.set(false);
                await fixture.whenStable();
                expect(instance[availability]).toBe(false);
                expect(field.invalid()).toBe(true);
                expect(instance.invalid).toBe(true);
                expect(host.classList.contains('igx-checkbox--invalid')).toBe(true);
                expect(instance.nativeElement.getAttribute('aria-invalid')).toBe('true');
            });
        }
    }

    it('should return to the initial state when the form is reset', () => {
        dispatchCheckboxEvent('click', host, () => fixture.detectChanges());
        expect(instance.checked).toBe(true);
        expect(instance.invalid).toBe(false);

        fixture.componentInstance.model.set({ accepted: false });
        fixture.componentInstance.userForm().reset();
        fixture.detectChanges();

        // The field itself is invalid again, but untouched and pristine
        expect(fixture.componentInstance.userForm.accepted().invalid()).toBe(true);
        expect(instance.invalid).toBe(false);
        expect(host.classList.contains('igx-checkbox--invalid')).toBe(false);
    });
});

@Component({
    template: `<igx-checkbox #rootCb>Root</igx-checkbox>
        <div #indigoWrapper style="--ig-theme: indigo">
            <igx-checkbox #indigoCb>Indigo scope</igx-checkbox>
            <div #materialWrapper style="--ig-theme: material">
                <igx-checkbox #materialCb>Material scope nested in indigo</igx-checkbox>
            </div>
        </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent]
})
class CheckboxNestedThemeScopeComponent {
    @ViewChild('rootCb', { static: true }) public rootCb: IgxCheckboxComponent;
    @ViewChild('indigoCb', { static: true }) public indigoCb: IgxCheckboxComponent;
    @ViewChild('materialCb', { static: true }) public materialCb: IgxCheckboxComponent;
    @ViewChild('rootCb', { static: true, read: ElementRef }) public rootCbHost: ElementRef;
    @ViewChild('indigoCb', { static: true, read: ElementRef }) public indigoCbHost: ElementRef;
    @ViewChild('materialCb', { static: true, read: ElementRef }) public materialCbHost: ElementRef;
    @ViewChild('indigoWrapper', { static: true }) public indigoWrapper: ElementRef;
    @ViewChild('materialWrapper', { static: true }) public materialWrapper: ElementRef;
}

@Component({
    template: `<igx-checkbox>Init</igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent]
})
class InitCheckboxComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
}

@Component({
    template: `<igx-checkbox (change)="onChange()" (click)="onClick()" [(ngModel)]="subscribed">Simple</igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent, FormsModule]
})
class CheckboxSimpleComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
    public changeEventCalled = false;
    public subscribed = false;
    public clickCounter = 0;

    public onChange() {
        this.changeEventCalled = true;
    }

    public onClick() {
        this.clickCounter++;
    }
}
@Component({
    template: `<igx-checkbox [(ngModel)]="subscribed" [indeterminate]="true">Indeterminate</igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent, FormsModule]
})
class CheckboxIndeterminateComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
    public subscribed = false;
}

@Component({
    template: `<igx-checkbox required>Required</igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent]
})
class CheckboxRequiredComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
}

@Component({
    template: `<igx-checkbox [(ngModel)]="subscribed" [checked]="subscribed" [indeterminate]="true" [readonly]="true">Readonly</igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent, FormsModule]
})
class CheckboxReadonlyComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
    public subscribed = false;
}

@Component({
    template: `<p id="my-label">{{label}}</p><igx-checkbox aria-labelledby="my-label"></igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent]
})
class CheckboxExternalLabelComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
    public label = 'My Label';
}

@Component({
    template: `<igx-checkbox [aria-label]="label"></igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent]
})
class CheckboxInvisibleLabelComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
    public label = 'Invisible Label';
}

@Component({
    template: `<igx-checkbox [disableTransitions]="true"></igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent]
})
class CheckboxDisabledTransitionsComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
}

@Component({
    template: `<form [formGroup]="myForm"><igx-checkbox formControlName="checkbox">Form Group</igx-checkbox></form>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent, ReactiveFormsModule]
})
class CheckboxFormGroupComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
    public myForm = inject(UntypedFormBuilder).group({ checkbox: ['', Validators.required] });
}

const nonEmpty = (c: AbstractControl): ValidationErrors | null => (c.value as string[]).length === 0 ? { empty: true } : null;

@Component({
    template: `
    <form [formGroup]="myForm">
        <igx-checkbox #cb formControlName="accepted">Accept</igx-checkbox>
        <igx-checkbox #cbRequired formControlName="agreed">Agree</igx-checkbox>
    </form>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent, ReactiveFormsModule]
})
class CheckboxValueValidatorComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;
    @ViewChild('cbRequired', { static: true }) public cbRequired: IgxCheckboxComponent;

    public myForm = new FormGroup({
        accepted: new FormControl<unknown>([], nonEmpty),
        agreed: new FormControl<unknown>([], [Validators.required, nonEmpty])
    });
}
@Component({
    template: `
    <form #form="ngForm">
        <igx-checkbox [(ngModel)]="subscribed" name="checkbox" required>Checkbox</igx-checkbox>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent, FormsModule]
})
class CheckboxFormComponent {
    public checkbox = viewChild.required(IgxCheckboxComponent);
    public ngForm = viewChild.required(NgForm);
    public subscribed: string;
}

function createComponent<T extends { checkbox: Signal<IgxCheckboxComponent> }>(component: Type<T>) {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();


    return {
        fixture,
        checkbox: fixture.componentInstance.checkbox(),
        nativeCheckbox: fixture.componentInstance.checkbox().nativeInput.nativeElement,
        nativeLabel: fixture.componentInstance.checkbox().nativeLabel.nativeElement,
        detectChanges: () => fixture.changeDetectorRef.detectChanges()
    };
}


const dispatchCheckboxEvent = (eventName: string, nativeElement: HTMLElement, detectChanges: () => void) => {
    nativeElement.dispatchEvent(new Event(eventName));
    detectChanges();
};

@Component({
    template: `<igx-checkbox #control [formField]="userForm.accepted">Accept</igx-checkbox>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCheckboxComponent, FormField]
})
class CheckboxSignalFormComponent {
    @ViewChild('control', { static: true }) public control: IgxCheckboxComponent;

    public model = signal({ accepted: false });
    public isDisabled = signal(false);
    public isReadonly = signal(false);
    public userForm = signalForm(this.model, (path) => {
        required(path.accepted);
        disabled(path.accepted, { when: () => this.isDisabled() });
        readonly(path.accepted, { when: () => this.isReadonly() });
    });
}
