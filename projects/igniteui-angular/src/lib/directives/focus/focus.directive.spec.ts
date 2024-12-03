import { Component, DebugElement, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusDirective } from './focus.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { EditorProvider } from '../../core/edit-provider';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxDatePickerComponent } from '../../date-picker/public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxRadioComponent } from '../../radio/radio.component';
import { IgxSwitchComponent } from '../../switch/switch.component';

describe('igxFocus', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                SetFocusComponent,
                NoFocusComponent,
                TriggerFocusOnClickComponent,
                CheckboxPickerComponent
            ]
        }).compileComponents();
    }));

    it('The second element should be focused', fakeAsync(() => {
        const fix = TestBed.createComponent(SetFocusComponent);
        fix.detectChanges();

        const secondElem: HTMLElement = fix.debugElement.queryAll(By.all())[1].nativeElement;

        tick(16);
        fix.detectChanges();
        expect(document.activeElement).toBe(secondElem);
    }));

    it('Should select the last input element when click the button', fakeAsync(() => {
        const fix = TestBed.createComponent(TriggerFocusOnClickComponent);
        fix.detectChanges();

        const button: DebugElement = fix.debugElement.query(By.css('button'));
        const divs = fix.debugElement.queryAll(By.css('div'));
        const lastDiv = divs[divs.length - 1 ].nativeElement;

        button.triggerEventHandler('click', null);
        tick(16);
        expect(document.activeElement).toBe(lastDiv);
    }));

    it('Should not focus when the focus state is set to false', fakeAsync(() => {
        const fix = TestBed.createComponent(NoFocusComponent);
        fix.detectChanges();
        tick(16);
        const input = fix.debugElement.queryAll(By.css('input'))[0].nativeElement;

        expect(document.activeElement).not.toBe(input);
        expect(document.activeElement).toBe(document.body);
    }));

    it('Should return EditorProvider element to focus', fakeAsync(() => {
        const elem = { nativeElement: document.createElement('button') };
        const providerElem = document.createElement('input');
        const provider: EditorProvider = {
            getEditElement: () => providerElem
         };
        let directive = new IgxFocusDirective(elem, null);
        expect(directive.nativeElement).toBe(elem.nativeElement);
        directive = new IgxFocusDirective(elem, []);
        expect(directive.nativeElement).toBe(elem.nativeElement);
        directive = new IgxFocusDirective(elem, [null]);
        expect(directive.nativeElement).toBe(elem.nativeElement);
        directive = new IgxFocusDirective(elem, [provider]);
        expect(directive.nativeElement).toBe(providerElem);
    }));

    it('Should correctly focus igx-checkbox, igx-radio, igx-switch and igx-date-picker', fakeAsync(() => {
        const fix = TestBed.createComponent(CheckboxPickerComponent);
        fix.detectChanges();
        tick(16);
        expect(document.activeElement).toBe(fix.componentInstance.checkbox.getEditElement());

        fix.componentInstance.radioFocusRef.trigger();
        tick(16);
        expect(document.activeElement).toBe(fix.componentInstance.radio.getEditElement());

        fix.componentInstance.switchFocusRef.trigger();
        tick(16);
        expect(document.activeElement).toBe(fix.componentInstance.switch.getEditElement());

        fix.componentInstance.pickerFocusRef.trigger();
        tick(16);
        expect(document.activeElement).toBe(fix.componentInstance.picker.getEditElement());
    }));
});

@Component({
    template: `
        <input type="text" value="First" />
        <input type="text" [igxFocus]="true" value="Fifth" />
        <input type="text" value="Seventh" />
    `,
    imports: [IgxFocusDirective]
})
class SetFocusComponent { }

@Component({
    template: `<input type="text" [igxFocus]="false" value="First" />`,
    imports: [IgxFocusDirective]
})
class NoFocusComponent { }

@Component({
    template: `
    <div>First</div>
    <div>Second</div>
    <div tabindex="0" [igxFocus]>Third</div>
    <button type="button" (click)="focus()">Focus the third one</button>
    `,
    imports: [IgxFocusDirective]
})
class TriggerFocusOnClickComponent {
    @ViewChild(IgxFocusDirective, { static: true }) public focusRef: IgxFocusDirective;

    public focus() {
        this.focusRef.trigger();
    }

}

@Component({
    template: `
    <igx-checkbox [igxFocus]="true"></igx-checkbox>
    <igx-radio #radio [igxFocus]></igx-radio>
    <igx-switch #switch [igxFocus]></igx-switch>
    <igx-date-picker #picker [igxFocus]></igx-date-picker>
    `,
    imports: [IgxFocusDirective, IgxCheckboxComponent, IgxSwitchComponent, IgxRadioComponent, IgxDatePickerComponent]
})
class CheckboxPickerComponent {
    @ViewChild(IgxCheckboxComponent, { static: true }) public checkbox: IgxCheckboxComponent;
    @ViewChild(IgxRadioComponent, { static: true }) public radio: IgxRadioComponent;
    @ViewChild(IgxSwitchComponent, { static: true }) public switch: IgxSwitchComponent;
    @ViewChild(IgxDatePickerComponent, { static: true }) public picker: IgxDatePickerComponent;
    @ViewChild('radio', { read: IgxFocusDirective, static: true }) public radioFocusRef: IgxFocusDirective;
    @ViewChild('switch', { read: IgxFocusDirective, static: true }) public switchFocusRef: IgxFocusDirective;
    @ViewChild('picker', { read: IgxFocusDirective, static: true }) public pickerFocusRef: IgxFocusDirective;
}
