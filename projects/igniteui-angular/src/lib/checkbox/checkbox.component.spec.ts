import { Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxCheckboxComponent } from './checkbox.component';

import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IgxCheckbox', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCheckboxComponent,
                CheckboxSimpleComponent,
                CheckboxDisabledComponent,
                CheckboxReadonlyComponent,
                CheckboxIndeterminateComponent,
                CheckboxRequiredComponent,
                CheckboxExternalLabelComponent,
                CheckboxInvisibleLabelComponent,
                CheckboxDisabledTransitionsComponent,
                IgxCheckboxComponent
            ],
            imports: [FormsModule, IgxRippleModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    it('Initializes a checkbox', () => {
        const fixture = TestBed.createComponent(InitCheckboxComponent);
        fixture.detectChanges();

        const checkbox = fixture.componentInstance.cb;
        const nativeCheckbox = fixture.debugElement.query(By.css('input')).nativeElement;
        const nativeLabel = checkbox.nativeLabel.nativeElement;
        const placeholderLabel = fixture.debugElement.query(By.css('.igx-checkbox__label')).nativeElement;

        expect(nativeCheckbox).toBeTruthy();
        expect(nativeCheckbox.id).toEqual('igx-checkbox-0-input');
        expect(nativeCheckbox.getAttribute('aria-label')).toEqual(null);
        expect(nativeCheckbox.getAttribute('aria-labelledby')).toMatch('igx-checkbox-0-label');

        expect(nativeLabel).toBeTruthy();
        // No longer have a for attribute to not propagate clicks to the native checkbox
        // expect(nativeLabel.getAttribute('for')).toEqual('igx-checkbox-0-input');

        expect(placeholderLabel.textContent.trim()).toEqual('Init');
        expect(placeholderLabel.classList).toContain('igx-checkbox__label');
        expect(placeholderLabel.getAttribute('id')).toEqual('igx-checkbox-0-label');

        // When aria-label is present, aria-labeledby shouldn't be
        checkbox.ariaLabel = 'New Label';
        fixture.detectChanges();
        expect(nativeCheckbox.getAttribute('aria-labelledby')).toEqual(null);
        expect(nativeCheckbox.getAttribute('aria-label')).toMatch('New Label');
    });

    it('Initializes with ngModel', fakeAsync(() => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;

        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(false);
        expect(checkboxInstance.checked).toBe(false);

        testInstance.subscribed = true;
        checkboxInstance.name = 'my-checkbox';
        // One change detection cycle for updating our checkbox
        fixture.detectChanges();
        tick();
        expect(checkboxInstance.checked).toBe(true);

        // Now one more change detection cycle to update the native checkbox
        fixture.detectChanges();
        tick();
        expect(nativeCheckbox.checked).toBe(true);
        expect(checkboxInstance.name).toEqual('my-checkbox');
    }));

    it('Initializes with external label', () => {
        const fixture = TestBed.createComponent(CheckboxExternalLabelComponent);
        const checkboxInstance = fixture.componentInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const externalLabel = fixture.debugElement.query(By.css('#my-label')).nativeElement;
        fixture.detectChanges();

        expect(nativeCheckbox.getAttribute('aria-labelledby')).toMatch(externalLabel.getAttribute('id'));
        expect(externalLabel.textContent).toMatch(fixture.componentInstance.label);
    });

    it('Initializes with invisible label', () => {
        const fixture = TestBed.createComponent(CheckboxInvisibleLabelComponent);
        const checkboxInstance = fixture.componentInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        fixture.detectChanges();

        expect(nativeCheckbox.getAttribute('aria-label')).toMatch(fixture.componentInstance.label);
    });

    it('Positions label before and after checkbox', () => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        const checkboxInstance = fixture.componentInstance.cb;
        const placeholderLabel = checkboxInstance.placeholderLabel.nativeElement;
        const labelStyles = window.getComputedStyle(placeholderLabel);
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('0');

        checkboxInstance.labelPosition = 'before';
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('-1');
    });

    it('Indeterminate state', fakeAsync(() => {
        const fixture = TestBed.createComponent(CheckboxIndeterminateComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const nativeLabel = checkboxInstance.nativeLabel.nativeElement;

        // Before any changes indeterminate should be true
        fixture.detectChanges();
        expect(checkboxInstance.indeterminate).toBe(true);
        expect(nativeCheckbox.indeterminate).toBe(true);

        testInstance.subscribed = true;

        fixture.detectChanges();
        tick();
        // First change detection should update our checkbox state and API call should not change indeterminate
        expect(checkboxInstance.checked).toBe(true);
        expect(checkboxInstance.indeterminate).toBe(true);

        // Second change detection should update native checkbox state but indeterminate should not change
        fixture.detectChanges();
        tick();
        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);

        // Should not change the state
        nativeCheckbox.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(checkboxInstance.checked).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);

        // Should update the state on click
        nativeLabel.click();
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(false);
        expect(checkboxInstance.checked).toBe(false);
        expect(nativeCheckbox.checked).toBe(false);

        // Should update the state again on click
        nativeLabel.click();
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(false);
        expect(checkboxInstance.checked).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);

        // Should be able to set indeterminate again
        checkboxInstance.indeterminate = true;
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(checkboxInstance.checked).toBe(true);
        expect(nativeCheckbox.checked).toBe(true);
    }));

    it('Disabled state', () => {
        const fixture = TestBed.createComponent(CheckboxDisabledComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const nativeLabel = checkboxInstance.nativeLabel.nativeElement;
        const placeholderLabel = checkboxInstance.placeholderLabel.nativeElement;
        fixture.detectChanges();

        expect(checkboxInstance.disabled).toBe(true);
        expect(nativeCheckbox.disabled).toBe(true);

        nativeCheckbox.dispatchEvent(new Event('change'));
        nativeLabel.click();
        placeholderLabel.click();
        fixture.detectChanges();

        // Should not update
        expect(checkboxInstance.checked).toBe(false);
        expect(testInstance.subscribed).toBe(false);
    });

    it('Readonly state', () => {
        const fixture = TestBed.createComponent(CheckboxReadonlyComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const nativeLabel = checkboxInstance.nativeLabel.nativeElement;
        const placeholderLabel = checkboxInstance.placeholderLabel.nativeElement;
        fixture.detectChanges();
        expect(checkboxInstance.readonly).toBe(true);
        expect(testInstance.subscribed).toBe(false);

        nativeCheckbox.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        // Should not update
        expect(testInstance.subscribed).toBe(false);

        nativeLabel.click();
        fixture.detectChanges();
        // Should not update
        expect(testInstance.subscribed).toBe(false);

        placeholderLabel.click();
        fixture.detectChanges();
        // Should not update
        expect(testInstance.subscribed).toBe(false);

        nativeCheckbox.click();
        fixture.detectChanges();
        // Should not update
        expect(testInstance.subscribed).toBe(false);
        expect(checkboxInstance.indeterminate).toBe(true);
    });

    it('Should be able to enable/disable CSS transitions', () => {
        const fixture = TestBed.createComponent(CheckboxDisabledTransitionsComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const checkboxHost = fixture.debugElement.query(By.css('igx-checkbox')).nativeElement;
        fixture.detectChanges();

        expect(checkboxInstance.disableTransitions).toBe(true);
        expect(checkboxHost.classList).toContain('igx-checkbox--plain');

        testInstance.cb.disableTransitions = false;
        fixture.detectChanges();
        expect(checkboxHost.classList).not.toContain('igx-checkbox--plain');
    });

    it('Required state', () => {
        const fixture = TestBed.createComponent(CheckboxRequiredComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        fixture.detectChanges();

        expect(checkboxInstance.required).toBe(true);
        expect(nativeCheckbox.required).toBeTruthy();

        checkboxInstance.required = false;
        fixture.detectChanges();

        expect(checkboxInstance.required).toBe(false);
        expect(nativeCheckbox.required).toBe(false);
    });

    it('Event handling', () => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const cbxEl = fixture.debugElement.query(By.directive(IgxCheckboxComponent)).nativeElement;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const nativeLabel = checkboxInstance.nativeLabel.nativeElement;
        const placeholderLabel = checkboxInstance.placeholderLabel.nativeElement;

        fixture.detectChanges();
        expect(checkboxInstance.focused).toBe(false);

        cbxEl.dispatchEvent(new KeyboardEvent('keyup'));
        fixture.detectChanges();
        expect(checkboxInstance.focused).toBe(true);

        nativeCheckbox.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(checkboxInstance.focused).toBe(false);

        nativeLabel.click();
        fixture.detectChanges();

        expect(testInstance.changeEventCalled).toBe(true);
        expect(testInstance.subscribed).toBe(true);
        expect(testInstance.clickCounter).toEqual(1);

        placeholderLabel.click();
        fixture.detectChanges();

        expect(testInstance.changeEventCalled).toBe(true);
        expect(testInstance.subscribed).toBe(false);
        expect(testInstance.clickCounter).toEqual(2);
    });

    describe('EditorProvider', () => {
        it('Should return correct edit element', () => {
            const fixture = TestBed.createComponent(CheckboxSimpleComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.cb;
            const editElement = fixture.debugElement.query(By.css('.igx-checkbox__input')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });
});

@Component({ template: `<igx-checkbox #cb>Init</igx-checkbox>` })
class InitCheckboxComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;
}

@Component({
    template: `<igx-checkbox #cb (change)="onChange()" (click)="onClick()"
                            [(ngModel)]="subscribed">Simple</igx-checkbox>`
})
class CheckboxSimpleComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;
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
    template: `<igx-checkbox #cb
                                [(ngModel)]="subscribed"
                                [indeterminate]="true"
                                >Indeterminate</igx-checkbox>`})
class CheckboxIndeterminateComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;

    public subscribed = false;
}

@Component({
    template: `<igx-checkbox #cb required>Required</igx-checkbox>`
})
class CheckboxRequiredComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;
}

@Component({
    template: `<igx-checkbox #cb
                                [(ngModel)]="subscribed"
                                [disabled]="true">Disabled</igx-checkbox>`})
class CheckboxDisabledComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;

    public subscribed = false;
}

@Component({
    template: `<igx-checkbox #cb
                                [(ngModel)]="subscribed"
                                [checked]="subscribed"
                                [indeterminate]="true"
                                [readonly]="true">Readonly</igx-checkbox>`})
class CheckboxReadonlyComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;

    public subscribed = false;
}

@Component({
    template: `<p id="my-label">{{label}}</p>
    <igx-checkbox #cb aria-labelledby="my-label"></igx-checkbox>`
})
class CheckboxExternalLabelComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;
    public label = 'My Label';
}

@Component({
    template: `<igx-checkbox #cb [aria-label]="label"></igx-checkbox>`
})
class CheckboxInvisibleLabelComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;
    public label = 'Invisible Label';
}

@Component({
    template: `<igx-checkbox #cb [disableTransitions]="true"></igx-checkbox>`
})
class CheckboxDisabledTransitionsComponent {
    @ViewChild('cb', { static: true }) public cb: IgxCheckboxComponent;
}
