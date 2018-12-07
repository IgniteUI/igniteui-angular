import { Component, Input, ViewChild, OnInit, ElementRef, Pipe, PipeTransform } from '@angular/core';
import {
  async,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IgxInputGroupModule } from '../../input-group/input-group.component';
import { IgxMaskModule } from './mask.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('igxMask', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AlphanumSpaceMaskComponent,
                AnyCharMaskComponent,
                DefMaskComponent,
                DigitPlusMinusMaskComponent,
                DigitSpaceMaskComponent,
                EventFiringComponent,
                IncludeLiteralsComponent,
                LetterSpaceMaskComponent,
                MaskComponent,
                OneWayBindComponent,
                PipesMaskComponent,
                PlaceholderMaskComponent
            ],
            imports: [
                FormsModule,
                IgxInputGroupModule,
                IgxMaskModule
            ]
        })
        .compileComponents();
    }));

    it('Initializes an input with default mask', fakeAsync(() => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.getAttribute('placeholder')).toEqual('CCCCCCCCCC');

        input.nativeElement.dispatchEvent(new Event('click'));
        tick();

        input.nativeElement.value = '@#$YUA123';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('@#$YUA123_');
    }));

    it('Mask rules - digit (0-9) or a space', fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('555 55');

    }));

    it('Mask rules - digit (0-9), plus (+), or minus (-) sign', fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitPlusMinusMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('+359-884 19 08 54');
    }));

    it('Mask rules - letter (a-Z) or a space', fakeAsync(() => {
        const fixture = TestBed.createComponent(LetterSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('AB _CD E');
    }));

    it('Mask rules - alphanumeric (0-9, a-Z) or a space', fakeAsync(() => {
        const fixture = TestBed.createComponent(AlphanumSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('7c_ 8u');
    }));

    it('Mask rules - any keyboard character', fakeAsync(() => {
        const fixture = TestBed.createComponent(AnyCharMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('_=%. p]');
    }));

    it('Enter value with a preset mask and value', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const comp = fixture.componentInstance;
        const input = comp.input;

        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        expect(input.nativeElement.value).toEqual('(123) 4567-890');
        expect(comp.value).toEqual('1234567890');

        comp.value = '7777';
        fixture.detectChanges();

        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        expect(input.nativeElement.value).toEqual('(777) 7___-___');
        expect(comp.value).toEqual('7777');
    }));

    it('Enter incorrect value with a preset mask', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = 'abc4569d12';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(___) 4569-_12');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = '1111111111111111111';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(111) 1111-111');
    }));

    it('Include literals in component value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IncludeLiteralsComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(555) 55__-___');
    }));

    it('Correct event firing', fakeAsync(() => {
        const fixture = TestBed.createComponent(EventFiringComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = '123';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(123) ____-___');
        expect(fixture.componentInstance.raw).toEqual('123');
    }));

    it('One way binding', fakeAsync(() => {
        const fixture = TestBed.createComponent(OneWayBindComponent);
        fixture.detectChanges();

        const comp = fixture.componentInstance;
        const input = comp.input;

        expect(input.nativeElement.value).toEqual('3456');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('3456****');
        expect(comp.value).toEqual(3456);

        input.nativeElement.value = 'A';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('A*******');
    }));

    it('Selection', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        tick();

        input.nativeElement.select();
        tick();

        const keyEvent = new KeyboardEvent('keydown', {key : '57'});
        input.nativeElement.dispatchEvent(keyEvent);
        tick();

        input.nativeElement.value = '';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(___) ____-___');
    }));

    it('Enter value over literal', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        tick();

        input.nativeElement.select();
        tick();

        const keyEvent = new KeyboardEvent('keydown', {key : '8'});
        input.nativeElement.dispatchEvent(keyEvent);
        tick();

        input.nativeElement.value = '';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(___) ____-___');

        input.nativeElement.value = '6666';
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(666) 6___-___');
    }));

    it('Apply display and input pipes on blur and focus.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PipesMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        tick();

        expect(input.nativeElement.value).toEqual('SSS');

        input.nativeElement.dispatchEvent(new Event('blur'));
        tick();

        expect(input.nativeElement.value).toEqual('sss');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('SSS');
    }));

    it('Apply placehodler when value is not defined.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PlaceholderMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('hello');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(__) (__)');
        expect(input.nativeElement.placeholder).toEqual('hello');

        input.nativeElement.dispatchEvent(new Event('blur'));
        tick();

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('hello');
    }));
});

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class DefMaskComponent {
    public mask;
    public value;

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class MaskComponent {
    mask = '(000) 0000-000';
    value = '1234567890';

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask" [includeLiterals]="true"/>
                        </igx-input-group>
                        <igx-input-group>
                            <input #input1 igxInput [ngModel]="value"/>
                        </igx-input-group>` })
class IncludeLiteralsComponent {
    public mask = '(000) 0000-000';
    @Input() public value = '55555';

    @ViewChild('input')
    public input: ElementRef;

    @ViewChild('input1')
    public input1: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class DigitSpaceMaskComponent {
    public mask = '999999';
    public value = '555 555';

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class DigitPlusMinusMaskComponent {
    public mask = '####-### ## ## ##';
    public value = '+359884190854';

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class LetterSpaceMaskComponent {
    public mask = 'LL??LL??';
    public value = 'AB 2CD E';

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class AlphanumSpaceMaskComponent {
    public mask = 'AAAaaa';
    public value = '7c  8u';

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                        </igx-input-group>` })
class AnyCharMaskComponent {
    public mask = '&&&.CCC';
    public value = ' =% p]';

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput [(ngModel)]="myValue" [igxMask]="myMask"
                            (onValueChange)="handleValueChange($event)"/>
                        </igx-input-group>` })
class EventFiringComponent {
    myValue = '';
    myMask = '(000) 0000-000';
    raw: string;
    formatted: string;

    @ViewChild('input')
    public input: ElementRef;

    handleValueChange(event) {
        this.raw = event.rawValue;
        this.formatted = event.formattedValue;
    }
}

@Component({ template: `<igx-input-group>
                            <input type="text" #input igxInput
                                   [value]="value"
                                   [igxMask]="myMask"
                                   [includeLiterals]="true"
                                   [promptChar]="'*@#'"/>
                        </igx-input-group>` })
class OneWayBindComponent {
    myMask = 'AAAAAAAA';
    value = 3456;

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput
                                [placeholder]="'hello'"
                                [(ngModel)]="value"
                                [igxMask]="mask"/>
                        </igx-input-group>` })
class PlaceholderMaskComponent {
    public mask = '(00) (00)';
    public value = null;

    @ViewChild('input')
    public input: ElementRef;
}

@Component({ template: `<igx-input-group>
                            <input #input type="text" igxInput
                                [displayValuePipe]="displayFormat"
                                [focusedValuePipe]="inputFormat"
                                [(ngModel)]="value"
                                [igxMask]="mask"/>
                        </igx-input-group>` })
class PipesMaskComponent {
    public mask = 'CCC';
    public value = 'SSS';

    public displayFormat = new DisplayFormatPipe();
    public inputFormat = new InputFormatPipe();

    @ViewChild('input')
    public input: ElementRef;
}

@Pipe({ name: 'inputFormat' })
export class InputFormatPipe implements PipeTransform {
     transform(value: any): string {
        return value.toUpperCase();
    }
}

@Pipe({ name: 'displayFormat' })
export class DisplayFormatPipe implements PipeTransform {
     transform(value: any): string {
        return value.toLowerCase();
    }
}
