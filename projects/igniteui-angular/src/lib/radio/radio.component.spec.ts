import { Component, ViewChild, ViewChildren } from '@angular/core';
import {
    async,
    fakeAsync,
    TestBed,
    tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxRadioComponent } from './radio.component';

import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IgxRadio', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxRadioComponent,
                InitRadioComponent,
                DisabledRadioComponent,
                RequiredRadioComponent,
                RadioWithModelComponent,
                RadioExternalLabelComponent,
                RadioInvisibleLabelComponent
            ],
            imports: [FormsModule, IgxRippleModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    it('Init a radio', () => {
        const fixture = TestBed.createComponent(InitRadioComponent);
        const testInstance = fixture.componentInstance;
        const radioInstance = fixture.componentInstance.radio;
        fixture.detectChanges();

        const nativeRadio = radioInstance.nativeRadio.nativeElement;
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

        expect(radio.id).toContain('igx-radio-');
        expect(domRadio.id).toContain('igx-radio-');

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
        const nativeRadio = radioInstance.nativeRadio.nativeElement;
        const externalLabel = fixture.debugElement.query(By.css('#my-label')).nativeElement;
        fixture.detectChanges();

        expect(nativeRadio.getAttribute('aria-labelledby')).toMatch(externalLabel.getAttribute('id'));
        expect(externalLabel.textContent).toMatch(fixture.componentInstance.label);
    });

    it('Initializes with invisible label', () => {
        const fixture = TestBed.createComponent(RadioInvisibleLabelComponent);
        const radioInstance = fixture.componentInstance.radio;
        const nativeRadio = radioInstance.nativeRadio.nativeElement;
        fixture.detectChanges();

        expect(nativeRadio.getAttribute('aria-label')).toMatch(fixture.componentInstance.label);
    });

    it('Disabled state', () => {
        const fixture = TestBed.createComponent(DisabledRadioComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const radios = testInstance.radios.toArray();

        // get the disabled radio button
        const radioInstance = radios[1];
        const nativeRadio = radioInstance.nativeRadio.nativeElement;
        const nativeLabel = radioInstance.nativeLabel.nativeElement;
        const placeholderLabel = radioInstance.placeholderLabel.nativeElement;

        expect(radios.length).toEqual(2);
        expect(radioInstance.disabled).toBe(true);
        expect(nativeRadio.disabled).toBe(true);

        nativeRadio.dispatchEvent(new Event('change'));
        nativeLabel.click();
        placeholderLabel.click();
        fixture.detectChanges();

        // Should not update
        expect(nativeRadio.checked).toBe(false);
        expect(testInstance.selected).not.toEqual('Bar');
    });

    it('Required state', () => {
        const fixture = TestBed.createComponent(RequiredRadioComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const radios = testInstance.radios.toArray();

        // get the required radio button
        const radioInstance = radios[1];
        const nativeRadio = radioInstance.nativeRadio.nativeElement;

        expect(radioInstance.required).toBe(true);
        expect(nativeRadio.required).toBe(true);
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

@Component({ template: `<igx-radio #radio>Radio</igx-radio>` })
class InitRadioComponent {
    @ViewChild('radio') public radio: IgxRadioComponent;
}

@Component({
    template: `
        <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']"
                    value="{{item}}"
                    name="group" [(ngModel)]="selected">{{item}}</igx-radio>`
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
    </igx-radio>`
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
        [required]="true">
        {{item}}
    </igx-radio>`
})
class RequiredRadioComponent {
    @ViewChildren(IgxRadioComponent) public radios;
}

@Component({
    template: `<p id="my-label">{{label}}</p>
    <igx-radio #radio aria-labelledby="my-label"></igx-radio>`
})
class RadioExternalLabelComponent {
    @ViewChild('radio') public radio: IgxRadioComponent;
    label = 'My Label';
}

@Component({
    template: `<igx-radio #radio [aria-label]="label"></igx-radio>`
})
class RadioInvisibleLabelComponent {
    @ViewChild('radio') public radio: IgxRadioComponent;
    label = 'Invisible Label';
}
