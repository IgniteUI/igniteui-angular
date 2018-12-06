import { Component, DebugElement, ViewChild } from '@angular/core';
import {
    async,
    TestBed,
    fakeAsync,
    tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusDirective, IgxFocusModule } from './focus.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { EditorProvider } from '../../core/edit-provider';
import { IgxCheckboxModule, IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxDatePickerModule, IgxDatePickerComponent } from '../../date-picker/date-picker.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('igxFocus', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SetFocusComponent,
                NoFocusComponent,
                TriggerFocusOnClickComponent,
                CheckboxPickerComponent
            ],
            imports: [ IgxFocusModule, IgxCheckboxModule, IgxDatePickerModule, NoopAnimationsModule ]
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

    it('Should correctly focus igx-checkbox and igx-date-picker', fakeAsync(() => {
        const fix = TestBed.createComponent(CheckboxPickerComponent);
        fix.detectChanges();
        tick(16);
        expect(document.activeElement).toBe(fix.componentInstance.checkbox.getEditElement());

        fix.componentInstance.pickerFocusRef.trigger();
        tick(16);
        expect(document.activeElement).toBe(fix.componentInstance.picker.getEditElement());
    }));
});

@Component({
    template:
    `
        <input type="text" value="First" />
        <input type="text" [igxFocus]="true" value="Fifth" />
        <input type="text" value="Seventh" />
    `
})
class SetFocusComponent { }

@Component({
    template: `<input type="text" [igxFocus]="false" value="First" />`
})
class NoFocusComponent { }

@Component({
    template:
    `
    <div>First</div>
    <div>Second</div>
    <div tabindex="0" [igxFocus]>Third</div>
    <button (click)="focus()">Focus the third one</button>
    `
})
class TriggerFocusOnClickComponent {
    @ViewChild(IgxFocusDirective) public focusRef: IgxFocusDirective;

    focus() {
        this.focusRef.trigger();
    }

}

@Component({
    template:
    `
    <igx-checkbox [igxFocus]="true"></igx-checkbox>
    <igx-date-picker #picker [igxFocus]></igx-date-picker>
    `
})
class CheckboxPickerComponent {
    @ViewChild(IgxCheckboxComponent) public checkbox: IgxCheckboxComponent;
    @ViewChild(IgxDatePickerComponent) public picker: IgxDatePickerComponent;
    @ViewChild('picker', { read: IgxFocusDirective}) public pickerFocusRef: IgxFocusDirective;
}
