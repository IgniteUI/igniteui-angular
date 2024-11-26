import { Component, ViewChild, ViewChildren } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxRadioComponent } from './radio.component';

import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgFor } from '@angular/common';

describe('IgxRadio', () => {
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxRadioComponent,
                InitRadioComponent,
                DisabledRadioComponent,
                RequiredRadioComponent,
                RadioFormComponent,
                RadioWithModelComponent,
                ReactiveFormComponent,
                RadioExternalLabelComponent,
                RadioInvisibleLabelComponent
            ]
        }).compileComponents();
    }));

    it('Init a radio', () => {
        const fixture = TestBed.createComponent(InitRadioComponent);
        const radioInstance = fixture.componentInstance.radio;
        fixture.detectChanges();

        const nativeRadio = radioInstance.nativeInput.nativeElement;
        const nativeLabel = radioInstance.nativeLabel.nativeElement;
        const placeholderLabel = radioInstance.placeholderLabel.nativeElement;

        expect(nativeRadio).toBeTruthy();
        expect(nativeRadio.type).toBe('radio');

        expect(nativeLabel).toBeTruthy();

        expect(placeholderLabel).toBeTruthy();
        expect(placeholderLabel.textContent.trim()).toEqual('Radio');
    });

    it('Init a radio with id property', () => {
        const fixture = TestBed.createComponent(InitRadioComponent);
        fixture.detectChanges();

        const radio = fixture.componentInstance.radio;
        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;

        expect(radio.id).toContain('igx-checkbox-');
        expect(domRadio.id).toContain('igx-checkbox-');

        radio.id = 'customRadio';
        fixture.detectChanges();
        expect(radio.id).toBe('customRadio');
        expect(domRadio.id).toBe('customRadio');
    });

    it('Binding to ngModel', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioWithModelComponent);
        fixture.detectChanges();

        const radios = fixture.componentInstance.radios.toArray();
        expect(radios.length).toEqual(3);

        // Change the model to change
        // the selected radio button in the UI
        fixture.componentInstance.selected = 'Baz';
        fixture.detectChanges();
        tick();

        fixture.detectChanges();
        expect(radios[2].checked).toBe(true);

        // Change the model through UI interaction
        // with the native label element
        radios[0].nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radios[0].checked).toBe(true);
        expect(fixture.componentInstance.selected).toEqual('Foo');

        // Change the model through UI interaction
        // with the placeholder label element
        radios[1].placeholderLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radios[1].checked).toBe(true);
        expect(fixture.componentInstance.selected).toEqual('Bar');
    }));

    it('Positions label before and after radio button', () => {
        const fixture = TestBed.createComponent(InitRadioComponent);
        const radioInstance = fixture.componentInstance.radio;
        const placeholderLabel = radioInstance.placeholderLabel.nativeElement;
        const labelStyles = window.getComputedStyle(placeholderLabel);
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('0');

        radioInstance.labelPosition = 'before';
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('-1');
    });

    it('Initializes with external label', () => {
        const fixture = TestBed.createComponent(RadioExternalLabelComponent);
        const radioInstance = fixture.componentInstance.radio;
        const nativeRadio = radioInstance.nativeInput.nativeElement;
        const externalLabel = fixture.debugElement.query(By.css('#my-label')).nativeElement;
        fixture.detectChanges();

        expect(nativeRadio.getAttribute('aria-labelledby')).toMatch(externalLabel.getAttribute('id'));
        expect(externalLabel.textContent).toMatch(fixture.componentInstance.label);
    });

    it('Initializes with invisible label', () => {
        const fixture = TestBed.createComponent(RadioInvisibleLabelComponent);
        const radioInstance = fixture.componentInstance.radio;
        const nativeRadio = radioInstance.nativeInput.nativeElement;
        fixture.detectChanges();

        expect(nativeRadio.getAttribute('aria-label')).toMatch(fixture.componentInstance.label);
        // aria-labelledby should not be present when aria-label is
        expect(nativeRadio.getAttribute('aria-labelledby')).toEqual(null);
    });

    it('Disabled state', fakeAsync(() => {
        const fixture = TestBed.createComponent(DisabledRadioComponent);
        // Requires two async change detection cycles to setup disabled on the component and then native element
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        tick();
        const testInstance = fixture.componentInstance;

        // get the disabled radio button
        const componentInstance = testInstance.radios.last as IgxRadioComponent;
        const radio = componentInstance.nativeInput.nativeElement as HTMLInputElement;

        expect(componentInstance.disabled).toBe(true);
        expect(radio.disabled).toBe(true);

        radio.click();
        fixture.detectChanges();

        // Should not update
        expect(componentInstance.nativeInput.nativeElement.checked).toBe(false);
        expect(radio.checked).toBe(false);
        expect(testInstance.selected).not.toEqual('Bar');
    }));

    it('Required state', () => {
        const fixture = TestBed.createComponent(RequiredRadioComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const radios = testInstance.radios.toArray();

        // get the required radio button
        const radioInstance = radios[1];
        const nativeRadio = radioInstance.nativeInput.nativeElement;

        expect(radioInstance.required).toBe(true);
        expect(nativeRadio.required).toBe(true);
    });

    it('Should update style when required radio\'s value is set.', () => {
        const fixture = TestBed.createComponent(RequiredRadioComponent);
        fixture.detectChanges();

        // Get the required radio button
        const testInstance = fixture.componentInstance;
        const radios = testInstance.radios.toArray();
        const radioInstance = radios[0];
        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;

        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
        expect(radioInstance.invalid).toBe(false);
        expect(radioInstance.checked).toBe(false);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);
        dispatchRadioEvent('blur', domRadio, fixture);

        expect(radioInstance.invalid).toBe(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(true);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);

        radioInstance.select();
        fixture.detectChanges();

        expect(domRadio.classList.contains('igx-radio--checked')).toBe(true);
        expect(radioInstance.checked).toBe(true);
        expect(radioInstance.invalid).toBe(false);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);

        radioInstance.deselect();
        fixture.detectChanges();

        expect(radioInstance.checked).toBe(false);
    });

    it('Should work properly with ngModel', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioFormComponent);
        fixture.detectChanges();
        tick();

        const radioInstance = fixture.componentInstance.radio;
        expect(radioInstance.invalid).toEqual(false);

        radioInstance.onBlur();
        expect(radioInstance.invalid).toEqual(true);

        fixture.componentInstance.ngForm.resetForm();
        tick();
        expect(radioInstance.invalid).toEqual(false);
    }));

    it('Should work properly with reactive forms validation.', () => {
        const fixture = TestBed.createComponent(ReactiveFormComponent);
        fixture.detectChanges();

        const radio = fixture.componentInstance.radio;
        radio.checked = false;
        expect(radio.required).toBe(true);
        expect(radio.nativeElement.getAttribute('aria-required')).toEqual('true');
        expect(radio.nativeElement.getAttribute('aria-invalid')).toEqual('false');

        fixture.debugElement.componentInstance.markAsTouched();
        fixture.detectChanges();

        const invalidRadio = fixture.debugElement.nativeElement.querySelectorAll(`.igx-radio--invalid`);
        expect(invalidRadio.length).toBe(1);
        expect(radio.invalid).toBe(true);
        expect(radio.nativeElement.getAttribute('aria-invalid')).toEqual('true');
    });

    describe('EditorProvider', () => {
        it('Should return correct edit element', () => {
            const fixture = TestBed.createComponent(InitRadioComponent);
            fixture.detectChanges();

            const radioInstance = fixture.componentInstance.radio;
            const editElement = fixture.debugElement.query(By.css('.igx-radio__input')).nativeElement;

            expect(radioInstance.getEditElement()).toBe(editElement);
        });
    });
});

@Component({
    template: `<igx-radio #radio>Radio</igx-radio>`,
    imports: [IgxRadioComponent]
})
class InitRadioComponent {
    @ViewChild('radio', { static: true }) public radio: IgxRadioComponent;
}

@Component({
    template: `
        <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']"
                    [value]="item"
                    name="group" [(ngModel)]="selected">{{item}}</igx-radio>`,
    imports: [FormsModule, IgxRadioComponent, NgFor]
})
class RadioWithModelComponent {
    @ViewChildren(IgxRadioComponent) public radios;

    public selected = 'Foo';
}

@Component({
    template: `
    <igx-radio #radios *ngFor="let item of items"
        [value]="item.value"
        [(ngModel)]="selected"
        [disabled]="item.disabled">
        {{item.value}}
    </igx-radio>`,
    imports: [FormsModule, IgxRadioComponent, NgFor]
})
class DisabledRadioComponent {
    @ViewChildren(IgxRadioComponent) public radios;

    public items = [{
        value: 'Foo',
        disabled: false
    }, {
        value: 'Bar',
        disabled: true
    }];

    public selected = 'Foo';
}

@Component({
    template: `
    <igx-radio #radios *ngFor="let item of ['Foo', 'Bar']"
        [value]="item"
        [(ngModel)]="Foo"
        required>
        {{item}}
    </igx-radio>`,
    imports: [FormsModule, IgxRadioComponent, NgFor]
})
class RequiredRadioComponent {
    @ViewChildren(IgxRadioComponent) public radios;
}

@Component({
    template: `<p id="my-label">{{label}}</p>
    <igx-radio #radio aria-labelledby="my-label"></igx-radio>`,
    imports: [IgxRadioComponent]
})
class RadioExternalLabelComponent {
    @ViewChild('radio', { static: true }) public radio: IgxRadioComponent;
    public label = 'My Label';
}

@Component({
    template: `<igx-radio #radio [aria-label]="label"></igx-radio>`,
    imports: [IgxRadioComponent]
})
class RadioInvisibleLabelComponent {
    @ViewChild('radio', { static: true }) public radio: IgxRadioComponent;
    public label = 'Invisible Label';
}

@Component({
    template: `
    <form #form="ngForm">
        <igx-radio #radioInForm [required]="isRequired" name="option" [(ngModel)]="selected" value="option1">Option 1</igx-radio>
        <button type="submit" [disabled]="!form.valid">Submit</button>
    </form>
`,
    imports: [FormsModule, IgxRadioComponent]
})
class RadioFormComponent {
    @ViewChild('radioInForm', { read: IgxRadioComponent, static: true })
    public radio: IgxRadioComponent;
    @ViewChild(NgForm, { static: true })
    public ngForm: NgForm;

    public isRequired = true;
    public selected: string;
}

@Component({
    template: `<form [formGroup]="reactiveForm">
        <igx-radio #radio formControlName="radio">Radio</igx-radio>
    </form>`,
    imports: [ReactiveFormsModule, IgxRadioComponent]
})
class ReactiveFormComponent {
    @ViewChild('radio', { read: IgxRadioComponent, static: true })
    public radio: IgxRadioComponent;

    public reactiveForm = this.fb.group({
        radio: ['', Validators.required],
    });

    constructor(private fb: UntypedFormBuilder) { }

    public markAsTouched() {
        if (!this.reactiveForm.valid) {
            for (const key in this.reactiveForm.controls) {
                if (this.reactiveForm.controls[key]) {
                    this.reactiveForm.controls[key].markAsTouched();
                    this.reactiveForm.controls[key].updateValueAndValidity();
                }
            }
        }
    }
}

const dispatchRadioEvent = (eventName, radioNativeElement, fixture) => {
    radioNativeElement.dispatchEvent(new Event(eventName));
    fixture.detectChanges();
};
