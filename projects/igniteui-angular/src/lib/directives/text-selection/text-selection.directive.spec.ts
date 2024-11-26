import { Component, DebugElement, Directive, ElementRef, HostListener, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxTextSelectionDirective } from './text-selection.directive';

describe('IgxSelection', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                TriggerTextSelectionComponent,
                TriggerTextSelectionOnClickComponent,
                TextSelectionWithMultipleFocusHandlersComponent,
                IgxTestFocusDirective
            ]
        });
    }));


    it('Should select the text which is into the input', fakeAsync(() => {
        const fix = TestBed.createComponent(TriggerTextSelectionComponent);
        fix.detectChanges();

        const input = fix.debugElement.query(By.css('input')).nativeElement;
        input.focus();
        tick(16);
        expect(input.selectionEnd).toEqual(input.value.length);
        expect(input.value.substring(input.selectionStart, input.selectionEnd)).toEqual(input.value);
    }));

    it('Should select the text when the input is clicked', fakeAsync(()=> {
        const fix = TestBed.createComponent(TriggerTextSelectionOnClickComponent);
        fix.detectChanges();

        const input: DebugElement = fix.debugElement.query(By.css('input'));
        const inputNativeElem = input.nativeElement;
        const inputElem: HTMLElement = input.nativeElement;

        inputElem.click(); // might need to change to .focus
        fix.detectChanges();
        tick(16);
        expect(inputNativeElem.selectionEnd).toEqual(inputNativeElem.value.length);
        expect(inputNativeElem.value.substring(inputNativeElem.selectionStart, inputNativeElem.selectionEnd))
            .toEqual(inputNativeElem.value);
    }));

    it('Should check if the value is selected if based on input type', fakeAsync(() => {
        const fix = TestBed.createComponent(TriggerTextSelectionOnClickComponent);
        const selectableTypes: Types[] = [
            { "text" : "Some Values!" },
            { "search": "Search!" },
            { "password": "********" },
            { "tel": '+(359)554-587-415' },
            { "url": "www.infragistics.com" },
            { "number": 2136512312 }
        ];

        const nonSelectableTypes: Types[] = [
            {'date': new Date() },
            {'datetime-local': "2018-06-12T19:30" },
            {'email': 'JohnSmith@gmail.com'},
            {'month': "2018-05" },
            {'time': "13:30"},
            {'week': "2017-W01"}
        ];

        //skipped on purpose, if needed feel free to add to any of the above categories
        //const irrelevantTypes = ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit']

        const input = fix.debugElement.query(By.css('input'));
        const inputNativeElem = input.nativeElement;
        const inputElem: HTMLElement = input.nativeElement;

        selectableTypes.forEach( el => {
            const type = Object.keys(el)[0];
            const val = el[type];
            fix.componentInstance.inputType = type;
            fix.componentInstance.inputValue = val;
            fix.detectChanges();

            inputElem.click();
            fix.detectChanges();
            tick(16);

            if(type !== 'number'){
                expect(inputNativeElem.selectionEnd).toEqual(inputNativeElem.value.length);
                expect(inputNativeElem.value.substring(inputNativeElem.selectionStart, inputNativeElem.selectionEnd))
                    .toEqual(val);
            }

            if(type === 'number'){
                const selection = document.getSelection().toString();
                tick(1000);
                expect((String(val)).length).toBe(selection.length);
            }
        });

        nonSelectableTypes.forEach( el => {
            const type = Object.keys(el)[0];
            const val = el[type];
            fix.componentInstance.inputType = type;
            fix.componentInstance.inputValue = val;
            fix.detectChanges();

            inputElem.focus();
            fix.detectChanges();
            tick(16);
            expect(inputNativeElem.selectionStart).toEqual(inputNativeElem.selectionEnd);
        });
    }));



    it('Shouldn\'t make a selection when the state is set to false', () => {
        const fix = TestBed.createComponent(TriggerTextSelectionOnClickComponent);
        fix.componentInstance.selectValue = false;
        fix.componentInstance.inputType = "text";
        fix.componentInstance.inputValue = "4444444";
        fix.detectChanges();

        const input = fix.debugElement.query(By.css('input'));
        const inputNativeElem = input.nativeElement;
        const inputElem: HTMLElement = input.nativeElement;


        inputElem.focus();
        fix.detectChanges();
        expect(inputNativeElem.selectionStart).toEqual(inputNativeElem.selectionEnd);
    });

    it('should apply selection properly if present on an element with multiple focus handlers', fakeAsync(() => {
        const fix = TestBed.createComponent(TextSelectionWithMultipleFocusHandlersComponent);
        fix.detectChanges();

        const input = fix.debugElement.query(By.css('input')).nativeElement;
        input.focus();
        tick(16);
        expect(input.selectionEnd).toEqual(input.value.length);
        expect(input.value.substring(input.selectionStart, input.selectionEnd)).toEqual(input.value);
    }));
});

@Directive({
    selector: '[igxTestFocusDirective]',
    standalone: true
})
class IgxTestFocusDirective {
    constructor(private element: ElementRef) { }

    @HostListener('focus')
    public onFocus() {
        this.element.nativeElement.value = `$${this.element.nativeElement.value}`;
    }
}

@Component({
    template: `
            <input type="text" [igxTextSelection]="true" value="Some custom value!" />
        `,
    imports: [IgxTextSelectionDirective]
})
class TriggerTextSelectionComponent { }

@Component({
    template: `
            <input #input [type]="inputType" [igxTextSelection]="selectValue" #select="igxTextSelection" (click)="select.trigger()" [value]="inputValue" />
        `,
    imports: [IgxTextSelectionDirective]
})
class TriggerTextSelectionOnClickComponent {
    public selectValue = true;
    public inputType: any = "text";
    public inputValue: any = "Some custom V!"

    @ViewChild('input',{read: HTMLInputElement, static:true}) public input: HTMLInputElement;

    public waitForOneSecond() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve("I promise to return after one second!");
          }, 1000);
        });
    }
}

@Component({
    template: `<input #input type="text" igxTestFocusDirective [igxTextSelection]="true" [value]="inputValue" />`,
    imports: [IgxTextSelectionDirective, IgxTestFocusDirective]
})
 class TextSelectionWithMultipleFocusHandlersComponent {
    public inputValue: any = "12-34-56";
 }

interface Types {
    [key: string]: any;
}
