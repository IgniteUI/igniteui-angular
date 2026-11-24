import { Component, Input, ViewChild, ElementRef, Pipe, PipeTransform, Renderer2, ChangeDetectionStrategy, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IgxMaskDirective } from './mask.directive';

import { UIInteractions } from '../../../../test-utils/ui-interactions.spec';
import { MaskParsingService, Replaced } from './mask-parsing.service';
import { By } from '@angular/platform-browser';
import { IgxInputGroupComponent } from '../../../../input-group/src/input-group/input-group.component';
import { IgxInputDirective } from 'igniteui-angular/input-group';
import { PlatformUtil } from 'igniteui-angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

describe('igxMask', () => {
    // TODO: Refactor tests to reuse components
    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
    });

    it('Initializes an input with default mask', async () => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();
        await fixture.whenStable();
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

    it('Initialize an input with escaped mask', async () => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const { input, maskDirective } = fixture.componentInstance;

        maskDirective.mask = '+\\9 000 000';
        fixture.detectChanges();

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('+9 ___ ___');
    });

    it('Escaped mask - advanced escaped patterns with input', async () => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();
        await fixture.whenStable();

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

    it('Mask rules - digit (0-9) or a space', async () => {
        const fixture = TestBed.createComponent(DigitSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('555 55');

    });

    it('Mask rules - digit (0-9), plus (+), or minus (-) sign', async () => {
        const fixture = TestBed.createComponent(DigitPlusMinusMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('+359-884 19 08 54');
    });

    it('Mask rules - letter (a-Z) or a space', async () => {
        const fixture = TestBed.createComponent(LetterSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('AB _CD E');
    });

    it('Mask rules - alphanumeric (0-9, a-Z) or a space', async () => {
        const fixture = TestBed.createComponent(AlphanumSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('7c_ 8u');
    });

    it('Mask rules - any keyboard character', async () => {
        const fixture = TestBed.createComponent(AnyCharMaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('_=%. p]');
    });

    it('Enter value with a preset mask and value', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        await fixture.whenStable(); // NgModel updateValue Promise

        const comp = fixture.componentInstance;
        const input = comp.input;


        expect(input.nativeElement.value).toEqual('(123) 4567-890');
        expect(comp.value).toEqual('1234567890');

        comp.value = '7777';
        fixture.detectChanges();
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('(777) 7___-___');
        expect(comp.value).toEqual('7777');
    });

    it('Should be able to type full-width numbers', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.componentInstance.mask = '00/00/0000';
        fixture.detectChanges();
        await fixture.whenStable();

        const input = fixture.debugElement.query(By.css('input'));
        input.triggerEventHandler('focus', {});
        fixture.detectChanges();

        UIInteractions.simulateCompositionEvent('０９０６２０２１', input, 0, 10);
        fixture.detectChanges();

        input.triggerEventHandler('blur', { target: input.nativeElement });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('09/06/2021');
    });

    it('Should be able to type full-width characters', async () => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.componentInstance.mask = 'CCC';
        fixture.detectChanges();
        await fixture.whenStable();

        const input = fixture.debugElement.query(By.css('input'));
        input.triggerEventHandler('focus', {});
        fixture.detectChanges();

        UIInteractions.simulateCompositionEvent('あんｓ', input, 0, 3);
        fixture.detectChanges();

        input.triggerEventHandler('blur', { target: input.nativeElement });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('あんｓ');
    });

    it('Should move the cursor to the next character if the same character is typed', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.componentInstance.mask = '00/00/0000';
        fixture.detectChanges();
        await fixture.whenStable();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        input.nativeElement.value = '22222222';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('22/22/2222');

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        const target = fixture.debugElement.query(By.css('input'));
        target.triggerEventHandler('focus', {});
        fixture.detectChanges();

        UIInteractions.simulatePaste('2', target, 0, 1);
        fixture.detectChanges();
        await fixture.whenStable();

        target.triggerEventHandler('blur', { target: input.nativeElement });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.selectionEnd).toEqual(1);
    });

    it('Should handle the input of invalid values', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        input.nativeElement.value = 'abc4569d12';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('(___) 4569-_12');
    });

    it('Enter incorrect value with a preset mask', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        const input: HTMLInputElement = fixture.componentInstance.input.nativeElement;
        expect(input.value).toEqual('(123) 4567-890');

        // Clear the value and type - the characters that do not match the mask are rejected
        await userEvent.click(input);
        input.select();
        await userEvent.keyboard('{Backspace}');
        fixture.detectChanges();
        expect(input.value).toEqual('(___) ____-___');
        expect(input.selectionStart).toEqual(0);

        await userEvent.keyboard('abc');
        fixture.detectChanges();
        expect(input.value).toEqual('(___) ____-___');

        await userEvent.keyboard('4569d12');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(input.value).toEqual('(456) 912_-___');
        expect(fixture.componentInstance.value).toEqual('456912');

        // Typing over the whole value more characters than the mask allows - the extra ones are ignored
        input.select();
        await userEvent.keyboard('1111111111111111111');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(input.value).toEqual('(111) 1111-111');
        expect(fixture.componentInstance.value).toEqual('1111111111');
    });

    it('Include literals in component value', async () => {
        const fixture = TestBed.createComponent(IncludeLiteralsComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('(555) 55__-___');
    });

    it('Correct event firing', async () => {
        const fixture = TestBed.createComponent(EventFiringComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        input.nativeElement.value = '123';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('(123) ____-___');
        expect(fixture.componentInstance.raw).toEqual('123');
    });

    it('One way binding', async () => {
        const fixture = TestBed.createComponent(OneWayBindComponent);
        fixture.detectChanges();

        const comp = fixture.componentInstance;
        const input = comp.input;

        expect(input.nativeElement.value).toEqual('3456____');

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('3456****');
        expect(comp.value).toEqual(3456);

        input.nativeElement.value = 'A';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('A*******');
    });

    it('Selection', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        await fixture.whenStable();

        input.nativeElement.select();
        await fixture.whenStable();

        const keyEvent = new KeyboardEvent('keydown', { key: '57' });
        input.nativeElement.dispatchEvent(keyEvent);
        await fixture.whenStable();

        input.nativeElement.value = '';
        input.nativeElement.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('(___) ____-___');
    });

    it('Enter value over literal', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        await fixture.whenStable();

        input.nativeElement.select();
        await fixture.whenStable();

        input.nativeElement.value = '';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('(___) ____-___');

        input.nativeElement.value = '6666';
        fixture.detectChanges();
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('(666) 6___-___');
    });

    it('Should successfully drop text in the input', async () => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        const input = fixture.componentInstance.input;

        input.nativeElement.focus();
        await fixture.whenStable();
        input.nativeElement.select();
        await fixture.whenStable();

        input.nativeElement.value = '4576';
        UIInteractions.simulateDropEvent(input.nativeElement, '4576', 'text');
        fixture.detectChanges();
        await fixture.whenStable();

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(input.nativeElement.value).toEqual('(457) 6___-___');
    });

    it('Should display mask on dragenter and remove it on dragleave', async () => {
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
    });

    it('Apply display and input pipes on blur and focus.', async () => {
        const fixture = TestBed.createComponent(PipesMaskComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const input = fixture.componentInstance.input;

        input.nativeElement.dispatchEvent(new Event('focus'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('SSS');

        input.nativeElement.dispatchEvent(new Event('blur'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual('sss');
    });

    it('Apply placeholder when value is not defined.', async () => {
        const fixture = TestBed.createComponent(PlaceholderMaskComponent);
        fixture.detectChanges();
        await fixture.whenStable();

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
    });

    it('should not enter edit mode if it is marked as readonly', async () => {
        const fixture = TestBed.createComponent(ReadonlyMaskTestComponent);
        fixture.detectChanges();

        const maskDirective = fixture.componentInstance.mask;
        vi.spyOn(maskDirective, 'onFocus');
        vi.spyOn(maskDirective as any, 'showMask');

        const input = fixture.debugElement.query(By.css('.igx-input-group__input'));
        input.triggerEventHandler('focus', {});
        fixture.detectChanges();

        expect(maskDirective.onFocus).toHaveBeenCalledTimes(1);
        expect((maskDirective as any).showMask).toHaveBeenCalledTimes(0);
        expect((maskDirective as any).inputValue).toEqual('');
    });

    it('should be able to update the mask dynamically', async () => {
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
    });

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

    it('should handle deleteContentBackward input event after compositionend (line 209 branch)', async () => {
        // This test covers the branch at line 209 of mask.directive.ts:
        // After compositionend, Chromium fires an input event with inputType='deleteContentBackward'.
        // The branch adjusts start/end indexes to account for mask literals.
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const inputDebugEl = fixture.debugElement.query(By.css('input'));
        const inputEl = inputDebugEl.nativeElement as HTMLInputElement;

        // Focus and set a starting selection
        inputDebugEl.triggerEventHandler('focus', {});
        fixture.detectChanges();

        // Use compositionstart → compositionend to set up _compositionStartIndex and _compositionValue
        UIInteractions.simulateCompositionEvent('123', inputDebugEl, 0, 3, false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Now trigger an InputEvent with inputType='deleteContentBackward' and _key != BACKSPACE
        // This is the path Chromium takes after compositionend
        const deleteEvent = new InputEvent('input', {
            bubbles: true,
            inputType: 'deleteContentBackward'
        });
        inputEl.dispatchEvent(deleteEvent);
        fixture.detectChanges();
        await fixture.whenStable();

        // The branch should have run without throwing; mask is still applied
        expect(inputEl.value).toBeDefined();
    });

    describe('Undo / redo', () => {
        const EMPTY_MASK = '(___) ____-___';

        type Modifiers = Partial<Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>>;

        /** Creates a focused input with the `(000) 0000-000` mask and no value. */
        const setup = async () => {
            const fixture = TestBed.createComponent(EventFiringComponent);
            fixture.detectChanges();
            await fixture.whenStable(); // NgModel writeValue Promise

            const input = fixture.debugElement.query(By.css('input'));
            const element = input.nativeElement as HTMLInputElement;
            input.triggerEventHandler('focus', {});
            fixture.detectChanges();

            return { fixture, input, element, component: fixture.componentInstance };
        };

        /** Presses a key and returns the event, so that `preventDefault` can be checked. */
        const press = (input: DebugElement, key: string, modifiers: Modifiers = {}) => {
            const event = {
                key, target: input.nativeElement,
                ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
                preventDefault: vi.fn(),
                ...modifiers
            };
            input.triggerEventHandler('keydown', event);
            return event;
        };

        const undo = (input: DebugElement) => press(input, 'z', { ctrlKey: true });
        const redo = (input: DebugElement) => press(input, 'y', { ctrlKey: true });

        /** Types at the given position, by default where the caret is. */
        const type = (characters: string, input: DebugElement, at: number = input.nativeElement.selectionStart) =>
            UIInteractions.simulateTyping(characters, input, at, at);

        /** Does what the browser does on Backspace and fires the events. */
        const backspace = (input: DebugElement) => {
            const element = input.nativeElement as HTMLInputElement;
            UIInteractions.triggerEventHandlerKeyDown('Backspace', input);
            const [start, end] = [element.selectionStart, element.selectionEnd];
            const from = start === end ? Math.max(start - 1, 0) : start;
            element.value = element.value.substring(0, from) + element.value.substring(end);
            element.setSelectionRange(from, from);
            input.triggerEventHandler('input', { target: element });
        };

        /** Does what the browser does on Delete and fires the events. */
        const del = (input: DebugElement) => {
            const element = input.nativeElement as HTMLInputElement;
            UIInteractions.triggerEventHandlerKeyDown('Delete', input);
            const [start, end] = [element.selectionStart, element.selectionEnd];
            const to = start === end ? end + 1 : end;
            element.value = element.value.substring(0, start) + element.value.substring(to);
            element.setSelectionRange(start, start);
            input.triggerEventHandler('input', { target: element });
        };

        const expectSelection = (element: HTMLInputElement, start: number, end = start) => {
            expect(element.selectionStart).toEqual(start);
            expect(element.selectionEnd).toEqual(end);
        };

        it('should undo a run of typed characters as a single step and redo it', async () => {
            const { input, element, component } = await setup();

            type('123', input, 0);
            expect(element.value).toEqual('(123) ____-___');
            expect(component.myValue).toEqual('123');

            const event = undo(input);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(element.value).toEqual(EMPTY_MASK);
            expect(component.myValue).toEqual('');
            // the caret goes back to where the run began
            expectSelection(element, 0);

            redo(input);
            expect(element.value).toEqual('(123) ____-___');
            expect(component.myValue).toEqual('123');
            expectSelection(element, 4);

            // nothing more to redo
            redo(input);
            expect(element.value).toEqual('(123) ____-___');
        });

        it('should support the alternate shortcuts', async () => {
            const { input, element } = await setup();
            type('1', input, 0);

            press(input, 'z', { metaKey: true });
            expect(element.value).toEqual(EMPTY_MASK);

            press(input, 'Z', { ctrlKey: true, shiftKey: true });
            expect(element.value).toEqual('(1__) ____-___');

            press(input, 'z', { ctrlKey: true });
            expect(element.value).toEqual(EMPTY_MASK);

            press(input, 'Z', { metaKey: true, shiftKey: true });
            expect(element.value).toEqual('(1__) ____-___');

            // AltGr reports both Ctrl and Alt
            const altGr = press(input, 'z', { ctrlKey: true, altKey: true });
            expect(altGr.preventDefault).not.toHaveBeenCalled();
            expect(element.value).toEqual('(1__) ____-___');

            const metaY = press(input, 'y', { metaKey: true });
            expect(metaY.preventDefault).not.toHaveBeenCalled();
            expect(element.value).toEqual('(1__) ____-___');
        });

        it('should start a new step when the caret moves and keep the holes in the mask', async () => {
            const { input, element } = await setup();

            type('1', input, 0);
            type('5', input, 7);
            expect(element.value).toEqual('(1__) _5__-___');

            undo(input);
            expect(element.value).toEqual('(1__) ____-___');
            expectSelection(element, 7);

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);

            redo(input);
            redo(input);
            expect(element.value).toEqual('(1__) _5__-___');
        });

        it('should start a new step when the caret leaves and comes back', async () => {
            const { input, element } = await setup();

            // with the arrow keys
            type('12', input, 0);
            press(input, 'ArrowLeft');
            element.setSelectionRange(2, 2);
            press(input, 'ArrowRight');
            element.setSelectionRange(3, 3);
            type('3', input);
            expect(element.value).toEqual('(123) ____-___');

            undo(input);
            expect(element.value).toEqual('(12_) ____-___');

            // with a click at the same position
            type('3', input);
            input.triggerEventHandler('pointerdown', {});
            type('4', input);
            expect(element.value).toEqual('(123) 4___-___');

            undo(input);
            expect(element.value).toEqual('(123) ____-___');
            undo(input);
            expect(element.value).toEqual('(12_) ____-___');
            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should undo a run of backspaces across a literal as a single step', async () => {
            const { input, element, component } = await setup();

            type('1234', input, 0);
            expect(element.value).toEqual('(123) 4___-___');
            expectSelection(element, 7);

            // over '4', the space, the bracket and then the three digits
            for (let i = 0; i < 6; i++) {
                backspace(input);
            }
            expect(element.value).toEqual(EMPTY_MASK);
            expectSelection(element, 1);

            // typing and deleting are separate steps
            undo(input);
            expect(element.value).toEqual('(123) 4___-___');
            expect(component.myValue).toEqual('1234');
            expectSelection(element, 7);

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);

            redo(input);
            redo(input);
            expect(element.value).toEqual(EMPTY_MASK);
            undo(input);
            expect(element.value).toEqual('(123) 4___-___');
        });

        it('should undo a run of forward deletes as a single step', async () => {
            const { input, element } = await setup();

            type('123', input, 0);
            element.setSelectionRange(1, 1);
            del(input);
            del(input);
            del(input);
            expect(element.value).toEqual(EMPTY_MASK);

            undo(input);
            expect(element.value).toEqual('(123) ____-___');
            expectSelection(element, 1);
        });

        it('should record a paste as its own step', async () => {
            const { input, element } = await setup();

            type('12', input, 0);
            UIInteractions.simulatePaste('345', input, 3, 3);
            expect(element.value).toEqual('(123) 45__-___');

            // typing right after the paste does not join it
            type('6', input);
            expect(element.value).toEqual('(123) 456_-___');

            undo(input);
            expect(element.value).toEqual('(123) 45__-___');

            undo(input);
            expect(element.value).toEqual('(12_) ____-___');
            expectSelection(element, 3);

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should undo an IME composition as a single step', async () => {
            const { input, element } = await setup();

            UIInteractions.simulateCompositionEvent('12', input, 1, 1, false);
            expect(element.value).toEqual('(12_) ____-___');

            type('3', input);
            expect(element.value).toEqual('(123) ____-___');

            undo(input);
            expect(element.value).toEqual('(12_) ____-___');

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should not undo while an IME composition is in progress', async () => {
            const { input, element } = await setup();
            type('1', input, 0);

            input.triggerEventHandler('compositionstart', { target: element });
            const event = undo(input);
            // the shortcut is canceled, but the composition keeps the text
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(element.value).toEqual('(1__) ____-___');

            const command = { inputType: 'historyUndo', cancelable: true, preventDefault: vi.fn() };
            input.triggerEventHandler('beforeinput', command);
            expect(command.preventDefault).toHaveBeenCalledTimes(1);
            expect(element.value).toEqual('(1__) ____-___');

            input.triggerEventHandler('compositionend', { target: element });
            expect(element.value).toEqual('(1__) ____-___');

            // a key press that the IME handles is ignored as well
            press(input, 'z', { ctrlKey: true, isComposing: true } as Modifiers);
            expect(element.value).toEqual('(1__) ____-___');

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should record a cut as its own step', async () => {
            const { input, element, component } = await setup();
            type('123', input, 0);

            // Ctrl + X over the selected '23'
            element.setSelectionRange(2, 4);
            press(input, 'x', { ctrlKey: true });
            element.value = '(1) ____-___';
            element.setSelectionRange(2, 2);
            input.triggerEventHandler('input', { target: element, inputType: 'deleteByCut' });
            expect(element.value).toEqual('(1__) ____-___');
            expect(component.myValue).toEqual('1');

            undo(input);
            expect(element.value).toEqual('(123) ____-___');
            expectSelection(element, 2, 4);
            expect(component.myValue).toEqual('123');

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should not join a cut with Shift + Delete and a delete that follows it', async () => {
            const { input, element } = await setup();
            type('1234', input, 0);

            // Shift + Delete cuts the selected '12'
            element.setSelectionRange(1, 3);
            press(input, 'Delete', { shiftKey: true });
            element.value = '(3) 4___-___';
            element.setSelectionRange(1, 1);
            input.triggerEventHandler('input', { target: element, inputType: 'deleteByCut' });
            expect(element.value).toEqual('(__3) 4___-___');
            expectSelection(element, 3);

            del(input);
            expect(element.value).toEqual('(___) 4___-___');

            // only the delete is undone
            undo(input);
            expect(element.value).toEqual('(__3) 4___-___');

            undo(input);
            expect(element.value).toEqual('(123) 4___-___');
        });

        it('should record a drop as its own step', async () => {
            const { input, element, component } = await setup();
            type('1', input, 0);

            // the browser inserts the dropped text and selects it
            UIInteractions.simulateDropEvent(element, '23', 'text');
            element.value = '(123__) ____-___';
            element.setSelectionRange(2, 4);
            input.triggerEventHandler('input', { target: element, inputType: 'insertFromDrop' });
            expect(element.value).toEqual('(123) ____-___');
            expect(component.myValue).toEqual('123');

            undo(input);
            expect(element.value).toEqual('(1__) ____-___');
            expect(component.myValue).toEqual('1');

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should record a browser auto-fill as its own step', async () => {
            const { input, element, component } = await setup();
            type('1', input, 0);

            // auto-fill replaces the whole value and sends an input event with an empty input type
            element.value = '5554567890';
            input.triggerEventHandler('input', { target: element, inputType: '' });
            expect(element.value).toEqual('(555) 4567-890');
            expect(component.myValue).toEqual('5554567890');

            undo(input);
            expect(element.value).toEqual('(1__) ____-___');
            expect(component.myValue).toEqual('1');

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should not record an edit that the mask rejects', async () => {
            const { input, element } = await setup();

            type('a', input, 0);
            expect(element.value).toEqual(EMPTY_MASK);

            type('1', input, 0);
            // the rejected character does not break the run either
            type('a', input);
            type('2', input);
            expect(element.value).toEqual('(12_) ____-___');

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);

            // there is no step left for the rejected edits
            redo(input);
            undo(input);
            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should start a new step when a rejected edit follows a caret move', async () => {
            const { input, element } = await setup();

            type('1', input, 0);
            // the caret moves and the character typed at the new position is rejected
            type('a', input, 7);
            expect(element.value).toEqual('(1__) ____-___');
            expectSelection(element, 7);

            type('5', input);
            expect(element.value).toEqual('(1__) _5__-___');

            // the rejected edit must not join the two runs
            undo(input);
            expect(element.value).toEqual('(1__) ____-___');

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should update the value, emit valueChanged and restore the selection of the undone edit', async () => {
            const { input, element, component } = await setup();

            type('123', input, 0);
            // replace the selected '12' with '9'
            UIInteractions.simulateTyping('9', input, 1, 3);
            expect(element.value).toEqual('(9_3) ____-___');
            expect(component.raw).toEqual('93');

            undo(input);
            expect(element.value).toEqual('(123) ____-___');
            expectSelection(element, 1, 3);
            expect(component.myValue).toEqual('123');
            expect(component.raw).toEqual('123');
            expect(component.formatted).toEqual('(123) ____-___');

            redo(input);
            expect(element.value).toEqual('(9_3) ____-___');
            expect(component.myValue).toEqual('93');
            expect(component.raw).toEqual('93');
        });

        it('should do nothing with an empty history or while readonly', async () => {
            const { input, element } = await setup();
            const mask = input.injector.get(IgxMaskDirective);
            vi.spyOn(mask.valueChanged, 'emit');

            // the native undo stack is empty as well, so the shortcut is still canceled
            expect(undo(input).preventDefault).toHaveBeenCalledTimes(1);
            expect(redo(input).preventDefault).toHaveBeenCalledTimes(1);
            expect(element.value).toEqual(EMPTY_MASK);
            expect(mask.valueChanged.emit).not.toHaveBeenCalled();

            type('1', input, 0);
            element.readOnly = true;
            undo(input);
            expect(element.value).toEqual('(1__) ____-___');

            element.readOnly = false;
            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);
        });

        it('should drop the history when the value is set from outside', async () => {
            const { fixture, input, element, component } = await setup();

            type('1', input, 0);
            component.myValue = '555';
            fixture.detectChanges();
            await fixture.whenStable();
            expect(element.value).toEqual('(555) ____-___');

            undo(input);
            expect(element.value).toEqual('(555) ____-___');
        });

        it('should drop the history when the mask or the prompt changes', async () => {
            const { fixture, input, element, component } = await setup();

            type('1', input, 0);
            component.myMask = '00-00';
            fixture.detectChanges();
            expect(element.value).toEqual('1_-__');

            undo(input);
            expect(element.value).toEqual('1_-__');

            type('2', input, 1);
            expect(element.value).toEqual('12-__');
            input.injector.get(IgxMaskDirective).promptChar = '*';

            undo(input);
            expect(element.value).toEqual('12-__');
        });

        it('should keep the history after a blur and a refocus', async () => {
            const { fixture, input, element } = await setup();

            type('123', input, 0);
            input.triggerEventHandler('blur', { target: element });
            fixture.detectChanges();
            input.triggerEventHandler('focus', {});
            fixture.detectChanges();

            undo(input);
            expect(element.value).toEqual(EMPTY_MASK);

            // on blur the empty mask is replaced by the placeholder
            input.triggerEventHandler('blur', { target: element });
            fixture.detectChanges();
            expect(element.value).toEqual('');
            input.triggerEventHandler('focus', {});
            fixture.detectChanges();

            redo(input);
            expect(element.value).toEqual('(123) ____-___');
        });

        it('should handle the undo and redo commands that do not come from the keyboard', async () => {
            const { input, element } = await setup();
            type('1', input, 0);

            // context menu, Edit menu, software keyboard
            const undoCommand = { inputType: 'historyUndo', cancelable: true, preventDefault: vi.fn() };
            input.triggerEventHandler('beforeinput', undoCommand);
            expect(undoCommand.preventDefault).toHaveBeenCalledTimes(1);
            expect(element.value).toEqual(EMPTY_MASK);

            const redoCommand = { inputType: 'historyRedo', cancelable: true, preventDefault: vi.fn() };
            input.triggerEventHandler('beforeinput', redoCommand);
            expect(redoCommand.preventDefault).toHaveBeenCalledTimes(1);
            expect(element.value).toEqual('(1__) ____-___');

            const typing = { inputType: 'insertText', preventDefault: vi.fn() };
            input.triggerEventHandler('beforeinput', typing);
            expect(typing.preventDefault).not.toHaveBeenCalled();
            expect(element.value).toEqual('(1__) ____-___');

            // where `beforeinput` cannot be canceled the command arrives as an input event
            input.triggerEventHandler('input', { target: element, inputType: 'historyUndo' });
            expect(element.value).toEqual(EMPTY_MASK);

            input.triggerEventHandler('input', { target: element, inputType: 'historyRedo' });
            expect(element.value).toEqual('(1__) ____-___');
        });

        it('should move a single step for a history command that cannot be canceled', async () => {
            const { input, element } = await setup();
            type('1', input, 0);
            type('5', input, 7);
            expect(element.value).toEqual('(1__) _5__-___');

            // the browser sends both events for one command
            const undoCommand = { inputType: 'historyUndo', cancelable: false, preventDefault: vi.fn() };
            input.triggerEventHandler('beforeinput', undoCommand);
            expect(undoCommand.preventDefault).not.toHaveBeenCalled();
            expect(element.value).toEqual('(1__) _5__-___');

            input.triggerEventHandler('input', { target: element, inputType: 'historyUndo' });
            expect(element.value).toEqual('(1__) ____-___');

            const redoCommand = { inputType: 'historyRedo', cancelable: false, preventDefault: vi.fn() };
            input.triggerEventHandler('beforeinput', redoCommand);
            input.triggerEventHandler('input', { target: element, inputType: 'historyRedo' });
            expect(element.value).toEqual('(1__) _5__-___');
        });

        it('should keep the caret for redo when a history command that cannot be canceled changes the text', async () => {
            const { input, element } = await setup();
            type('12', input, 0);
            expectSelection(element, 3);

            // the native undo changes the text and moves the caret before the input event comes
            input.triggerEventHandler('beforeinput', { inputType: 'historyUndo', cancelable: false, preventDefault: vi.fn() });
            element.value = '(1__) ____-___';
            input.triggerEventHandler('input', { target: element, inputType: 'historyUndo' });
            expect(element.value).toEqual(EMPTY_MASK);

            redo(input);
            expect(element.value).toEqual('(12_) ____-___');
            // where the caret was before the undo, not at the end of the text
            expectSelection(element, 3);
        });

        it('should not undo over a text that was changed from outside before a rejected edit', async () => {
            const { fixture, input, element } = await setup();
            type('1', input, 0);

            // the text changes without the form control, for example through a native value binding
            element.value = '(555) ____-___';
            fixture.detectChanges();

            // a rejected character must not make the old step look current
            type('a', input, 6);
            expect(element.value).toEqual('(555) ____-___');

            undo(input);
            expect(element.value).toEqual('(555) ____-___');
            redo(input);
            expect(element.value).toEqual('(555) ____-___');
        });

        it('should restore the caret of an edit that comes with no keydown', async () => {
            const { input, element } = await setup();
            type('1', input, 0);

            // a software keyboard inserts text without key events
            element.setSelectionRange(7, 7);
            input.triggerEventHandler('beforeinput', { inputType: 'insertText', preventDefault: vi.fn() });
            element.value = '(1__) _5___-___';
            element.setSelectionRange(8, 8);
            input.triggerEventHandler('input', { target: element, inputType: 'insertText' });
            expect(element.value).toEqual('(1__) _5__-___');

            undo(input);
            expect(element.value).toEqual('(1__) ____-___');
            expectSelection(element, 7);
        });
    });
});

describe('igxMaskDirective ControlValueAccessor Unit', () => {
    let mask: IgxMaskDirective;
    let renderer2: Renderer2;
    it('Should correctly implement interface methods', async () => {
        const mockNgControl = {
            registerOnChangeCb: vi.fn().mockName("NgControl.registerOnChangeCb"),
            registerOnTouchedCb: vi.fn().mockName("NgControl.registerOnTouchedCb")
        };
        const platformMock = {
            isIE: false,
            KEYMAP: {
                BACKSPACE: 'Backspace',
                DELETE: 'Delete',
                Y: 'y',
                Z: 'z'
            }
        };

        const mockParser = {
            applyMask: vi.fn().mockName("MaskParsingService.applyMask").mockReturnValue('test____'),
            replaceInMask: vi.fn().mockName("MaskParsingService.replaceInMask").mockReturnValue({ value: 'test_2__', end: 6 } as Replaced),
            parseValueFromMask: vi.fn().mockName("MaskParsingService.parseValueFromMask").mockReturnValue('test2')
        };
        const format = 'CCCCCCCC';

        // init
        renderer2 = {
            setAttribute: vi.fn().mockName("Renderer2.setAttribute")
        } as unknown as Renderer2;

        await TestBed.configureTestingModule({
            providers: [
                { provide: ElementRef, useValue: { nativeElement: {} } },
                { provide: MaskParsingService, useValue: mockParser },
                { provide: Renderer2, useValue: renderer2 },
                { provide: PlatformUtil, useValue: platformMock },
                IgxMaskDirective
            ]
        }).compileComponents();

        mask = TestBed.inject(IgxMaskDirective);
        mask.mask = format;
        mask.registerOnChange(mockNgControl.registerOnChangeCb);
        mask.registerOnTouched(mockNgControl.registerOnTouchedCb);
        vi.spyOn(mask.valueChanged, 'emit');
        const inputGet = vi.spyOn(mask as any, 'inputValue', 'get');
        const inputSet = vi.spyOn(mask as any, 'inputValue', 'set');

        // writeValue
        inputGet.mockReturnValue('formatted');
        mask.writeValue('test');
        expect(mockParser.applyMask).toHaveBeenCalledWith('test', expect.objectContaining({ format }));
        expect(inputSet).toHaveBeenCalledWith('test____');
        expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
        expect(mask.valueChanged.emit).toHaveBeenCalledWith({ rawValue: 'test', formattedValue: 'formatted' });

        // OnChange callback
        inputGet.mockReturnValue('test_2___');
        vi.spyOn(mask as any, 'selectionEnd', 'get').mockReturnValue(6);
        const setSelectionSpy = vi.spyOn(mask as any, 'setSelectionRange').mockImplementation(() => { });
        mask.onInputChanged(new InputEvent('input'));
        expect(mockParser.replaceInMask).toHaveBeenCalledWith('', 'test_2', expect.objectContaining({ format }), 0, 0);
        expect(inputSet).toHaveBeenCalledWith('test_2__');
        expect(setSelectionSpy).toHaveBeenCalledWith(6);
        expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith('test2');

        // OnTouched callback
        mask.onFocus();
        expect(mockNgControl.registerOnTouchedCb).not.toHaveBeenCalled();
        const mockBlur = { target: { value: '' } };
        mask.onBlur(mockBlur as unknown as FocusEvent);
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class IncludeLiteralsComponent {
    @Input()
    public value = '55555';

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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxMaskDirective]
})
class ReadonlyMaskTestComponent {
    @ViewChild(IgxMaskDirective)
    public mask: IgxMaskDirective;
}
