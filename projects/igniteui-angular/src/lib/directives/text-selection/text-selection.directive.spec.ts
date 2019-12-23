import { Component, DebugElement, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTextSelectionModule} from './text-selection.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxSelection', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TriggerTextSelectionComponent,
                TriggerTextSelectionOnClickComponent
            ],
            imports: [IgxTextSelectionModule]
        });
    }));

    it('Should select the text which is into the input', async() => {
        const fix = TestBed.createComponent(TriggerTextSelectionComponent);
        fix.detectChanges();

        const input = fix.debugElement.query(By.css('input')).nativeElement;
        input.focus();

        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(input.selectionEnd).toEqual(input.value.length);
            expect(input.value.substring(input.selectionStart, input.selectionEnd)).toEqual(input.value);
        });
    });

    it('Should select the text when the input is clicked', async() => {
        const fix = TestBed.createComponent(TriggerTextSelectionOnClickComponent);
        fix.detectChanges();

        const input: DebugElement = fix.debugElement.query(By.css('input'));
        const inputNativeElem = input.nativeElement;
        const inputElem: HTMLElement = input.nativeElement;

        inputElem.click();

        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(inputNativeElem.selectionEnd).toEqual(inputNativeElem.value.length);
            expect(inputNativeElem.value.substring(inputNativeElem.selectionStart, inputNativeElem.selectionEnd))
                .toEqual(inputNativeElem.value);
        });
    });

    it('Shouldn\'t make a selection when the state is set to false', () => {
        const template = ` <input type="text" [igxTextSelection]="false" #select="igxTextSelection"
            (click)="select.trigger()" value="Some custom value!" />`;

        TestBed.overrideComponent(TriggerTextSelectionOnClickComponent, {
            set: {
                template
            }
        });

        TestBed.compileComponents().then(() => {
            const fix = TestBed.createComponent(TriggerTextSelectionOnClickComponent);
            fix.detectChanges();

            const input = fix.debugElement.query(By.css('input'));
            const inputNativeElem = input.nativeElement;
            const inputElem: HTMLElement = input.nativeElement;

            inputElem.click();
            fix.detectChanges();

            expect(inputNativeElem.selectionEnd).toEqual(0);
            expect(inputNativeElem.value.substring(inputNativeElem.selectionStart, inputNativeElem.selectionEnd)).toEqual('');
        });
    });
});

@Component({
    template:
        `
            <input type="text" [igxTextSelection]="true" value="Some custom value!" />
        `
})
class TriggerTextSelectionComponent {}

@Component({
    template:
        `
            <input type="text" [igxTextSelection] #select="igxTextSelection" (click)="select.trigger()" value="Some custom value!" />
        `
})
class TriggerTextSelectionOnClickComponent {}
