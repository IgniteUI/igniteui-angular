import { Component, Input, ViewChild, ElementRef, Pipe, PipeTransform, Renderer2 } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IgxMaskDirective } from './mask.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { Replaced } from './mask-parsing.service';
import { By } from '@angular/platform-browser';
import { IgxInputGroupComponent } from '../../input-group/input-group.component';
import { IgxInputDirective } from '../input/input.directive';

describe('igxMask', () => {
    configureTestSuite();
    // TODO: Refactor tests to reuse components
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
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
                PlaceholderMaskComponent,
                MaskTestComponent,
                ReadonlyMaskTestComponent
            ]
        }).compileComponents();
    }));

    it('Initializes an input with default mask', () => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.getAttribute('placeholder')).toEqual('CCCCCCCCCC');

        input.nativeElement.dispatchEvent(new Event('click'));

        input.nativeElement.value = '@#$YUA123';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));

        input.nativeElement.dispatchEvent(new Event('focus'));

        expect(input.nativeElement.value).toEqual('@#$YUA123_');
    });

    it('Initialize an input with escaped mask', () => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();

        const { input, maskDirective } = fixture.componentInstance;

        maskDirective.mask = '+\\9 000 000';
        fixture.detectChanges();

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('+9 ___ ___');
    });

    it('Escaped mask - advanced escaped patterns with input', () => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();

        const { input, maskDirective } = fixture.componentInstance;
        maskDirective.mask = '\\C\\C CCCC - \\0\\00 - X\\9\\9';
        fixture.detectChanges();

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('CC ____ - 00_ - X99');

        input.nativeElement.value = 'abcdefgh';
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('CC abcd - 00_ - X99');
    });

    it('Mask rules - digit (0-9) or a space', fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('555 55');

    }));

    it('Mask rules - digit (0-9), plus (+), or minus (-) sign', fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitPlusMinusMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

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
        tick(); // NgModel updateValue Promise

        const comp = fixture.componentInstance;
        const input = comp.input;


        expect(input.nativeElement.value).toEqual('(123) 4567-890');
        expect(comp.value).toEqual('1234567890');

        comp.value = '7777';
        fixture.detectChanges();
        tick();

        expect(input.nativeElement.value).toEqual('(777) 7___-___');
        expect(comp.value).toEqual('7777');
    }));

    it('Should be able to type full-width numbers', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.componentInstance.mask = '00/00/0000';
        fixture.detectChanges();
        tick();

        const input = fixture.debugElement.query(By.css('input'));
        input.triggerEventHandler('focus', {});
        fixture.detectChanges();

        UIInteractions.simulateCompositionEvent('０９０６２０２１', input, 0, 10);
        fixture.detectChanges();

        input.triggerEventHandler('blur', { target: input.nativeElement });
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('09/06/2021');
    }));

    it('Should be able to type full-width characters', fakeAsync(() => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.componentInstance.mask = 'CCC';
        fixture.detectChanges();
        tick();

        const input = fixture.debugElement.query(By.css('input'));
        input.triggerEventHandler('focus', {});
        fixture.detectChanges();

        UIInteractions.simulateCompositionEvent('あんｓ', input, 0, 3);
        fixture.detectChanges();

        input.triggerEventHandler('blur', { target: input.nativeElement });
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('あんｓ');
    }));

    it('Should move the cursor to the next character if the same character is typed', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.componentInstance.mask = '00/00/0000';
        fixture.detectChanges();
        tick();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = '22222222';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('22/22/2222');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        const target = fixture.debugElement.query(By.css('input'));
        target.triggerEventHandler('focus', {});
        fixture.detectChanges();

        UIInteractions.simulatePaste('2', target, 0, 1);
        fixture.detectChanges();
        tick();

        target.triggerEventHandler('blur', { target: input.nativeElement });
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.selectionEnd).toEqual(1);
    }));

    it('Should handle the input of invalid values', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = 'abc4569d12';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('(___) 4569-_12');
    }));

    it('Enter incorrect value with a preset mask', fakeAsync(() => {
        pending('This must be remade into a typing test.');
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
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('(456) 912_-___');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        input.nativeElement.value = '1111111111111111111';
        fixture.detectChanges();
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
        fixture.detectChanges();
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

        expect(input.nativeElement.value).toEqual('3456____');

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('3456****');
        expect(comp.value).toEqual(3456);

        input.nativeElement.value = 'A';
        fixture.detectChanges();
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

        const keyEvent = new KeyboardEvent('keydown', { key: '57' });
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

        input.nativeElement.value = '';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(___) ____-___');

        input.nativeElement.value = '6666';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(666) 6___-___');
    }));

    it('Should successfully drop text in the input', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        tick();
        input.nativeElement.select();
        tick();

        input.nativeElement.value = '4576';
        UIInteractions.simulateDropEvent(input.nativeElement, '4576', 'text');
        fixture.detectChanges();
        tick();

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();

        expect(input.nativeElement.value).toEqual('(457) 6___-___');
    }));

    it('Should display mask on dragenter and remove it on dragleave', fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskTestComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('CCCCCCCCCC');

        input.nativeElement.dispatchEvent(new DragEvent('dragenter'));
        expect(input.nativeElement.value).toEqual('__________');

        input.nativeElement.dispatchEvent(new DragEvent('dragleave'));
        expect(input.nativeElement.value).toEqual('');

        // should preserve state on dragenter
        input.nativeElement.dispatchEvent(new Event('focus'));
        UIInteractions.simulatePaste('76', fixture.debugElement.query(By.css('.igx-input-group__input')), 3, 3);
        fixture.detectChanges();

        input.nativeElement.dispatchEvent(new Event('blur'));
        expect(input.nativeElement.value).toEqual('___76_____');

        input.nativeElement.dispatchEvent(new DragEvent('dragenter'));
        expect(input.nativeElement.value).toEqual('___76_____');
    }));

    it('Apply display and input pipes on blur and focus.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PipesMaskComponent);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('SSS');

        input.nativeElement.dispatchEvent(new Event('blur'));
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('sss');
    }));

    it('Apply placeholder when value is not defined.', fakeAsync(() => {
        const fixture = TestBed.createComponent(PlaceholderMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('hello');

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('(__) (__)');
        expect(input.nativeElement.placeholder).toEqual('hello');

        input.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('hello');
    }));

    it('should not enter edit mode if it is marked as readonly', fakeAsync(() => {
        const fixture = TestBed.createComponent(ReadonlyMaskTestComponent);
        fixture.detectChanges();

        const maskDirective = fixture.componentInstance.mask;
        spyOn(maskDirective, 'onFocus').and.callThrough();
        spyOn<any>(maskDirective, 'showMask').and.callThrough();

        const input = fixture.debugElement.query(By.css('.igx-input-group__input'));
        input.triggerEventHandler('focus', {});
        fixture.detectChanges();

        expect(maskDirective.onFocus).toHaveBeenCalledTimes(1);
        expect((maskDirective as any).showMask).toHaveBeenCalledTimes(0);
        expect((maskDirective as any).inputValue).toEqual('');
    }));

    it('should be able to update the mask dynamically', fakeAsync(() => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        expect(input.nativeElement.value).toEqual('');
        expect(input.nativeElement.placeholder).toEqual('CCCCCCCCCC');

        fixture.componentInstance.mask = '00-00-00';
        fixture.detectChanges();
        expect(fixture.componentInstance.maskDirective.mask).toEqual('00-00-00');
        expect(input.nativeElement.placeholder).toEqual('00-00-00');

        fixture.componentInstance.mask = '0';
        fixture.detectChanges();
        expect(fixture.componentInstance.maskDirective.mask).toEqual('0');
        expect(input.nativeElement.placeholder).toEqual('0');

        fixture.componentInstance.mask = undefined;
        fixture.detectChanges();
        expect(fixture.componentInstance.maskDirective.mask).toEqual('CCCCCCCCCC');
        expect(input.nativeElement.placeholder).toEqual('CCCCCCCCCC');

        fixture.componentInstance.mask = '';
        fixture.detectChanges();
        expect(fixture.componentInstance.maskDirective.mask).toEqual('CCCCCCCCCC');
        expect(input.nativeElement.placeholder).toEqual('CCCCCCCCCC');

        fixture.componentInstance.mask = '##.##';
        fixture.detectChanges();
        expect(fixture.componentInstance.maskDirective.mask).toEqual('##.##');
        expect(input.nativeElement.placeholder).toEqual('##.##');
    }));

    it('should update input properly on selection with DELETE', () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const inputElement = fixture.debugElement.query(By.css('input'));
        inputElement.triggerEventHandler('focus');
        UIInteractions.simulatePaste('1234567890', inputElement, 1, 1);
        fixture.detectChanges();
        expect(inputElement.nativeElement.value).toEqual('(123) 4567-890');

        const inputHTMLElement = inputElement.nativeElement as HTMLInputElement;
        inputHTMLElement.setSelectionRange(6, 8);
        fixture.detectChanges();
        expect(inputElement.nativeElement.selectionStart).toEqual(6);
        expect(inputElement.nativeElement.selectionEnd).toEqual(8);

        UIInteractions.triggerEventHandlerKeyDown('Delete', inputElement);
        inputElement.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inputElement.nativeElement.selectionStart).toEqual(8);
        expect(inputElement.nativeElement.selectionEnd).toEqual(8);
        expect(inputHTMLElement.value).toEqual('(123) __67-890');
    });
});

describe('igxMaskDirective ControlValueAccessor Unit', () => {
    let mask: IgxMaskDirective;
    let renderer2: Renderer2;
    it('Should correctly implement interface methods', () => {
        const mockNgControl = jasmine.createSpyObj('NgControl', ['registerOnChangeCb', 'registerOnTouchedCb']);
        const platformMock = {
            isIE: false,
            KEYMAP: {
                BACKSPACE: 'Backspace',
                DELETE: 'Delete',
                Y: 'y',
                Z: 'z'
            }
        };

        const mockParser = jasmine.createSpyObj('MaskParsingService', {
            applyMask: 'test____',
            replaceInMask: { value: 'test_2__', end: 6 } as Replaced,
            parseValueFromMask: 'test2'
        });
        const format = 'CCCCCCCC';

        // init
        renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute']);
        mask = new IgxMaskDirective({ nativeElement: {} } as any, mockParser, renderer2, platformMock as any);
        mask.mask = format;
        mask.registerOnChange(mockNgControl.registerOnChangeCb);
        mask.registerOnTouched(mockNgControl.registerOnTouchedCb);
        spyOn(mask.valueChanged, 'emit');
        const inputGet = spyOnProperty(mask as any, 'inputValue', 'get');
        const inputSet = spyOnProperty(mask as any, 'inputValue', 'set');

        // writeValue
        inputGet.and.returnValue('formatted');
        mask.writeValue('test');
        expect(mockParser.applyMask).toHaveBeenCalledWith('test', jasmine.objectContaining({ format }));
        expect(inputSet).toHaveBeenCalledWith('test____');
        expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
        expect(mask.valueChanged.emit).toHaveBeenCalledWith({ rawValue: 'test', formattedValue: 'formatted' });

        // OnChange callback
        inputGet.and.returnValue('test_2___');
        spyOnProperty(mask as any, 'selectionEnd').and.returnValue(6);
        const setSelectionSpy = spyOn(mask as any, 'setSelectionRange');
        mask.onInputChanged(false);
        expect(mockParser.replaceInMask).toHaveBeenCalledWith('', 'test_2', jasmine.objectContaining({ format }), 0, 0);
        expect(inputSet).toHaveBeenCalledWith('test_2__');
        expect(setSelectionSpy).toHaveBeenCalledWith(6);
        expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith('test2');

        // OnTouched callback
        mask.onFocus();
        expect(mockNgControl.registerOnTouchedCb).not.toHaveBeenCalled();
        mask.onBlur('');
        expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);
    });
});


@Pipe({ name: 'inputFormat', standalone: true })
export class InputFormatPipe implements PipeTransform {
    public transform(value: any): string {
        return value.toUpperCase();
    }
}

@Pipe({ name: 'displayFormat', standalone: true })
export class DisplayFormatPipe implements PipeTransform {
    public transform(value: any): string {
        return value.toLowerCase();
    }
}


@Component({
    template: `
    <igx-input-group>
        <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
    </igx-input-group>
    `,
    selector: 'igx-def-mask',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class DefMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    @ViewChild(IgxMaskDirective)
    public maskDirective: IgxMaskDirective;

    public mask;
    public value;
}

@Component({
    template: `<igx-input-group>
                    <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                </igx-input-group>`,
    selector: 'igx-mask-test',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class MaskComponent {

    @ViewChild('input', { static: true })
    public input: ElementRef;
    public mask = '(000) 0000-000';
    public value = '1234567890';
}

@Component({
    template: `<igx-input-group>
                    <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask" [includeLiterals]="true"/>
                </igx-input-group>
                <igx-input-group>
                    <input #input1 igxInput [ngModel]="value"/>
                </igx-input-group>`,
    selector: 'igx-incl-literals',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class IncludeLiteralsComponent {
    @Input() public value = '55555';

    @ViewChild('input', { static: true })
    public input: ElementRef;

    @ViewChild('input1', { static: true })
    public input1: ElementRef;
    public mask = '(000) 0000-000';
}

@Component({
    template: `<igx-input-group>
                    <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                </igx-input-group>`,
    selector: 'igx-digit-space-mask',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class DigitSpaceMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '999999';
    public value = '555 555';
}

@Component({
    template: `<igx-input-group>
                    <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                </igx-input-group>`,
    selector: 'igx-digital-plus-minus-mask',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class DigitPlusMinusMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '####-### ## ## ##';
    public value = '+359884190854';
}

@Component({
    template: `<igx-input-group>
                    <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                </igx-input-group>`,
    selector: 'igx-letter-space-mask',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class LetterSpaceMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = 'LL??LL??';
    public value = 'AB 2CD E';
}

@Component({
    template: `<igx-input-group>
                    <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
                </igx-input-group>`,
    selector: 'igx-alphanum-space-mask',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class AlphanumSpaceMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = 'AAAaaa';
    public value = '7c  8u';
}

@Component({
    template: `
    <igx-input-group>
        <input #input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>
    </igx-input-group>
    `,
    selector: 'igx-any-char-mask',
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class AnyCharMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '&&&.CCC';
    public value = ' =% p]';
}

@Component({
    template: `
    <igx-input-group>
        <input #input type="text" igxInput [(ngModel)]="myValue" [igxMask]="myMask"
        (valueChanged)="handleValueChanged($event)"/>
    </igx-input-group>
    `,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class EventFiringComponent {

    @ViewChild('input', { static: true })
    public input: ElementRef;
    public myValue = '';
    public myMask = '(000) 0000-000';
    public raw: string;
    public formatted: string;

    public handleValueChanged(event) {
        this.raw = event.rawValue;
        this.formatted = event.formattedValue;
    }
}

@Component({
    template: `
    <igx-input-group>
        <input type="text" #input igxInput
                [value]="value"
                [igxMask]="myMask"
                [includeLiterals]="true"
                [promptChar]="'* @#'"/>
    </igx-input-group>
    `,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class OneWayBindComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public myMask = 'AAAAAAAA';
    public value = 3456;
}

@Component({
    template: `
    <igx-input-group>
        <input #input type="text" igxInput
            [placeholder]="'hello'"
            [(ngModel)]="value"
            [igxMask]="mask"/>
    </igx-input-group>
    `,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class PlaceholderMaskComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = '(00) (00)';
    public value = null;
}

@Component({
    template: `
    <igx-input-group>
        <input #input type="text" igxInput
            [displayValuePipe]="displayFormat"
            [focusedValuePipe]="inputFormat"
            [(ngModel)]="value"
            [igxMask]="mask"/>
    </igx-input-group>`,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective, InputFormatPipe, DisplayFormatPipe]
})
class PipesMaskComponent {

    @ViewChild('input', { static: true })
    public input: ElementRef;

    public mask = 'CCC';
    public value = 'SSS';

    public displayFormat = new DisplayFormatPipe();
    public inputFormat = new InputFormatPipe();
}

@Component({
    template: `
    <igx-input-group>
        <input #input type="text" igxInput igxMask/>
    </igx-input-group>
    `,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class MaskTestComponent {
    @ViewChild('input', { static: true })
    public input: ElementRef;
}

@Component({
    template: `
    <igx-input-group>
        <input #input type="text" igxInput readonly [igxMask]="'00/00/0000'"/>
    </igx-input-group>`,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class ReadonlyMaskTestComponent {
    @ViewChild(IgxMaskDirective)
    public mask: IgxMaskDirective;
}
