import { Component, DebugElement, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTextSelectionModule } from './text-selection.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxSelection', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TriggerTextSelectionComponent,
                TriggerTextSelectionOnClickComponent,
            ],
            imports: [IgxTextSelectionModule]
        });
    }));


    it('Should select the text which is into the input', () => {
        const fix = TestBed.createComponent(TriggerTextSelectionComponent);
        fix.detectChanges();

        const input = fix.debugElement.query(By.css('input')).nativeElement;
        input.focus();

        expect(input.selectionEnd).toEqual(input.value.length);
        expect(input.value.substring(input.selectionStart, input.selectionEnd)).toEqual(input.value);
    });

    it('Should select the text when the input is clicked', ()=> {
        const fix = TestBed.createComponent(TriggerTextSelectionOnClickComponent);
        fix.detectChanges();

        const input: DebugElement = fix.debugElement.query(By.css('input'));
        const inputNativeElem = input.nativeElement;
        const inputElem: HTMLElement = input.nativeElement;

        inputElem.click(); // might need to change to .focus
        fix.detectChanges();

        expect(inputNativeElem.selectionEnd).toEqual(inputNativeElem.value.length);
        expect(inputNativeElem.value.substring(inputNativeElem.selectionStart, inputNativeElem.selectionEnd))
            .toEqual(inputNativeElem.value);
    });

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
            let type = Object.keys(el)[0];
            let val = el[type];
            fix.componentInstance.inputType = type;
            fix.componentInstance.inputValue = val;
            fix.detectChanges();

            inputElem.click();
            fix.detectChanges();

            if(type !== 'number'){
                expect(inputNativeElem.selectionEnd).toEqual(inputNativeElem.value.length);
                expect(inputNativeElem.value.substring(inputNativeElem.selectionStart, inputNativeElem.selectionEnd))
                    .toEqual(val);
            }

            if(type === 'number'){
                let selection = document.getSelection().toString();
                tick(1000);
                expect((String(val)).length).toBe(selection.length);
            }
        });

        nonSelectableTypes.forEach( el => {
            let type = Object.keys(el)[0];
            let val = el[type];
            fix.componentInstance.inputType = type;
            fix.componentInstance.inputValue = val;
            fix.detectChanges();

            inputElem.focus();
            fix.detectChanges();
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
});

@Component({
    template:
        `
            <input type="text" [igxTextSelection]="true" value="Some custom value!" />
        `
})
class TriggerTextSelectionComponent { }

@Component({
    template:
        `
            <input #input [type]="inputType" [igxTextSelection]="selectValue" #select="igxTextSelection" (click)="select.trigger()" [value]="inputValue" />
        `
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

 interface Types {
     [key: string]: any;
 }
