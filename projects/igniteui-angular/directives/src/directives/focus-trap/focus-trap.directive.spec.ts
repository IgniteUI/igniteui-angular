import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusTrapDirective } from './focus-trap.directive';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../../../test-utils/ui-interactions.spec';
import { IgxTimePickerComponent } from '../../../../time-picker/src/time-picker/time-picker.component';

describe('igxFocusTrap', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                TrapFocusTestComponent,
                TrapFocusElementsTestComponent,
                TrapFocusTabOrderTestComponent,
                TrapFocusShadowDomTestComponent
            ]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('should focus focusable elements on Tab key pressed', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));
        const inputs = fix.debugElement.queryAll(By.css('input'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);
    });

    it('should focus focusable elements in reversed order on Shift + Tab key pressed', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));
        const inputs = fix.debugElement.queryAll(By.css('input'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);
    });

    it('should trap focus on element when there is only one focusable element', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        fix.componentInstance.showInput = false;
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);
    });

    it('should trap focus on element with non-focusable elements', fakeAsync(() => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        fix.componentInstance.showInput = false;
        fix.componentInstance.showButton = false;
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        tick();
        fix.detectChanges();
        expect(document.activeElement).toEqual(focusTrap.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        tick();
        fix.detectChanges();
        expect(document.activeElement).toEqual(focusTrap.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        tick();
        fix.detectChanges();
        expect(document.activeElement).toEqual(focusTrap.nativeElement);
    }));

    it('should be able to set focusTrap dynamically', fakeAsync(() => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));
        const inputs = fix.debugElement.queryAll(By.css('input'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        button.nativeElement.blur();
        fix.detectChanges();

        fix.componentInstance.focusTrap = false;
        fix.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).not.toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).not.toEqual(inputs[1].nativeElement);

        fix.componentInstance.focusTrap = true;
        fix.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);
    }));

    it('should focus only visible focusable elements on Tab key pressed', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        fix.componentInstance.showTimePicker = true;
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const buttons = fix.debugElement.queryAll(By.css('button'));
        const inputs = fix.debugElement.queryAll(By.css('input'));
        const timePickerInput = fix.debugElement.query(By.css('.igx-input-group__input'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(timePickerInput.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[buttons.length - 1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);
    });

    it('should reflect the bound igxFocusTrap value in the focusTrap property', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const directive = fix.debugElement.query(By.directive(IgxFocusTrapDirective)).injector.get(IgxFocusTrapDirective);
        expect(directive.focusTrap).toBeTrue();
        expect(directive.element).toBe(fix.debugElement.query(By.css('div')).nativeElement);

        fix.componentInstance.focusTrap = false;
        fix.detectChanges();
        expect(directive.focusTrap).toBeFalse();
    });

    it('should coerce the igxFocusTrap attribute value to boolean', () => {
        const fix = TestBed.createComponent(TrapFocusElementsTestComponent);
        fix.detectChanges();

        const [enabled, disabled] = fix.debugElement.queryAll(By.directive(IgxFocusTrapDirective))
            .map(el => el.injector.get(IgxFocusTrapDirective));
        expect(enabled.focusTrap).toBeTrue();
        expect(disabled.focusTrap).toBeFalse();
    });

    it('should prevent the default Tab behavior only while focus is trapped', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const inputs = fix.debugElement.queryAll(By.css('input'));
        inputs[0].nativeElement.focus();

        expect(pressKey(inputs[0].nativeElement, 'Tab').defaultPrevented).toBeTrue();
        expect(document.activeElement).toBe(inputs[1].nativeElement);

        expect(pressKey(inputs[1].nativeElement, 'ArrowDown').defaultPrevented).toBeFalse();
        expect(document.activeElement).toBe(inputs[1].nativeElement);

        fix.componentInstance.focusTrap = false;
        fix.detectChanges();

        expect(pressKey(inputs[1].nativeElement, 'Tab').defaultPrevented).toBeFalse();
        expect(document.activeElement).toBe(inputs[1].nativeElement);
    });

    it('should move focus relative to the currently focused element', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const button = fix.debugElement.query(By.css('button')).nativeElement;
        const inputs = fix.debugElement.queryAll(By.css('input')).map(el => el.nativeElement);

        inputs[1].focus();
        pressKey(inputs[1], 'Tab');
        expect(document.activeElement).toBe(button);

        pressKey(button, 'Tab', true);
        expect(document.activeElement).toBe(inputs[1]);

        pressKey(inputs[1], 'Tab', true);
        expect(document.activeElement).toBe(inputs[0]);
    });

    it('should skip disabled elements and elements inside aria-hidden containers', () => {
        const fix = TestBed.createComponent(TrapFocusElementsTestComponent);
        fix.detectChanges();

        const first = fix.debugElement.query(By.css('#first')).nativeElement;
        const last = fix.debugElement.query(By.css('#last')).nativeElement;

        first.focus();
        pressKey(first, 'Tab');
        expect(document.activeElement).toBe(last);

        pressKey(last, 'Tab');
        expect(document.activeElement).toBe(first);

        pressKey(first, 'Tab', true);
        expect(document.activeElement).toBe(last);
    });

    it('should trap focus within an element rendered in a shadow root', () => {
        const fix = TestBed.createComponent(TrapFocusShadowDomTestComponent);
        fix.detectChanges();

        const shadowRoot = fix.nativeElement.shadowRoot as ShadowRoot;
        const input = shadowRoot.querySelector('input');
        const button = shadowRoot.querySelector('button');

        input.focus();
        expect(document.activeElement).toBe(fix.nativeElement);
        expect(shadowRoot.activeElement).toBe(input);

        pressKey(input, 'Tab');
        expect(shadowRoot.activeElement).toBe(button);

        pressKey(button, 'Tab');
        expect(shadowRoot.activeElement).toBe(input);

        pressKey(input, 'Tab', true);
        expect(shadowRoot.activeElement).toBe(button);
    });

    it('should move focus to the first or last element when nothing in the shadow root is focused', () => {
        const fix = TestBed.createComponent(TrapFocusShadowDomTestComponent);
        fix.detectChanges();

        const shadowRoot = fix.nativeElement.shadowRoot as ShadowRoot;
        const focusTrap = shadowRoot.querySelector('div');
        const input = shadowRoot.querySelector('input');
        const button = shadowRoot.querySelector('button');
        expect(shadowRoot.activeElement).toBeNull();

        pressKey(focusTrap, 'Tab');
        expect(shadowRoot.activeElement).toBe(input);

        input.blur();
        pressKey(focusTrap, 'Tab', true);
        expect(shadowRoot.activeElement).toBe(button);
    });

    it('should treat elements as visible when checkVisibility is not supported', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const button = fix.debugElement.query(By.css('button')).nativeElement;
        const inputs = fix.debugElement.queryAll(By.css('input')).map(el => el.nativeElement);
        [...inputs, button].forEach(el => Object.defineProperty(el, 'checkVisibility', { value: undefined }));

        inputs[1].focus();
        pressKey(inputs[1], 'Tab');
        expect(document.activeElement).toBe(button);
    });

    it('should focus only elements that are part of the sequential tab order', () => {
        const fix = TestBed.createComponent(TrapFocusTabOrderTestComponent);
        fix.detectChanges();

        const tabOrder = ['#first', '#middle', '#summary', '#editable', '#nested-editable', '#editable-island', '#shadow-host', '#last']
            .map(id => fix.debugElement.query(By.css(id)).nativeElement as HTMLElement);

        tabOrder[0].focus();
        for (const expected of [...tabOrder.slice(1), tabOrder[0]]) {
            pressKey(document.activeElement as HTMLElement, 'Tab');
            expect(document.activeElement).toBe(expected);
        }

        for (const expected of [...tabOrder].reverse()) {
            pressKey(document.activeElement as HTMLElement, 'Tab', true);
            expect(document.activeElement).toBe(expected);
        }
    });

    it('should not focus contenteditable elements that are part of an editing host', () => {
        const fix = TestBed.createComponent(TrapFocusTabOrderTestComponent);
        fix.detectChanges();

        const [editable, nestedEditable, editableIsland, shadowHost] = ['#editable', '#nested-editable', '#editable-island', '#shadow-host']
            .map(id => fix.debugElement.query(By.css(id)).nativeElement as HTMLElement);

        editable.focus();
        pressKey(editable, 'Tab');
        expect(document.activeElement).toBe(nestedEditable);

        pressKey(nestedEditable, 'Tab');
        expect(document.activeElement).toBe(editableIsland);

        pressKey(editableIsland, 'Tab');
        expect(document.activeElement).toBe(shadowHost);

        pressKey(shadowHost, 'Tab', true);
        expect(document.activeElement).toBe(editableIsland);

        pressKey(editableIsland, 'Tab', true);
        expect(document.activeElement).toBe(nestedEditable);

        pressKey(nestedEditable, 'Tab', true);
        expect(document.activeElement).toBe(editable);
    });

    it('should move focus from an element outside of the tab order to its adjacent focusable elements', () => {
        const fix = TestBed.createComponent(TrapFocusTabOrderTestComponent);
        fix.detectChanges();

        const first = fix.debugElement.query(By.css('#first')).nativeElement;
        const middle = fix.debugElement.query(By.css('#middle')).nativeElement;
        const untabbable = fix.debugElement.query(By.css('#untabbable')).nativeElement;

        untabbable.focus();
        pressKey(untabbable, 'Tab');
        expect(document.activeElement).toBe(middle);

        untabbable.focus();
        pressKey(untabbable, 'Tab', true);
        expect(document.activeElement).toBe(first);
    });

    it('should move focus from a focused shadow host to its adjacent focusable elements', () => {
        const fix = TestBed.createComponent(TrapFocusTabOrderTestComponent);
        fix.detectChanges();

        const editableIsland = fix.debugElement.query(By.css('#editable-island')).nativeElement;
        const shadowHost = fix.debugElement.query(By.css('#shadow-host')).nativeElement;
        const last = fix.debugElement.query(By.css('#last')).nativeElement;
        shadowHost.attachShadow({ mode: 'open' }).innerHTML = '<span>Shadow content</span>';

        shadowHost.focus();
        pressKey(shadowHost, 'Tab');
        expect(document.activeElement).toBe(last);

        shadowHost.focus();
        pressKey(shadowHost, 'Tab', true);
        expect(document.activeElement).toBe(editableIsland);
    });

    it('should move focus from an element inside a shadow root to the adjacent focusable elements of its host', () => {
        const fix = TestBed.createComponent(TrapFocusTabOrderTestComponent);
        fix.detectChanges();

        const editableIsland = fix.debugElement.query(By.css('#editable-island')).nativeElement;
        const shadowHost = fix.debugElement.query(By.css('#shadow-host')).nativeElement;
        const last = fix.debugElement.query(By.css('#last')).nativeElement;
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = '<input type="text">';
        const shadowInput = shadowRoot.querySelector('input');

        shadowInput.focus();
        pressKey(shadowInput, 'Tab');
        expect(document.activeElement).toBe(last);

        shadowInput.focus();
        pressKey(shadowInput, 'Tab', true);
        expect(document.activeElement).toBe(editableIsland);
    });

    it('should stop handling keydown events after the directive is destroyed', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const input = fix.debugElement.query(By.css('input')).nativeElement;
        fix.destroy();

        expect(pressKey(input, 'Tab').defaultPrevented).toBeFalse();
    });
});

function pressKey(target: HTMLElement, key: string, shiftKey = false): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true, composed: true });
    target.dispatchEvent(event);
    return event;
}


@Component({
    template: `
    <div #wrapper [igxFocusTrap]="focusTrap" tabindex="0">
        <label for="uname"><b>Username</b></label><br>
        @if (showInput) {
            <input type="text" placeholder="Enter Username" name="uname">
        }
        <br>
        <label for="psw"><b>Password</b></label><br>
        @if (showInput) {
            <input type="password" placeholder="Enter Password" name="psw">
        }
        <br>
        @if (showTimePicker) {
            <igx-time-picker> </igx-time-picker>
        }
        <br>
        @if (showButton) {
            <button>SIGN IN</button>
        }
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxFocusTrapDirective, IgxTimePickerComponent]
})
class TrapFocusTestComponent {
    public showInput = true;
    public showButton = true;
    public focusTrap = true;
    public showTimePicker = false;
}

@Component({
    template: `
    <div igxFocusTrap tabindex="0">
        <input id="first" type="text">
        <input type="text" disabled>
        <button disabled>Disabled</button>
        <div aria-hidden="true">
            <button>Hidden from assistive technologies</button>
        </div>
        <div tabindex="-1">Not in tab order</div>
        <button id="last">Last</button>
    </div>
    <div igxFocusTrap="false"></div>`,
    imports: [IgxFocusTrapDirective]
})
class TrapFocusElementsTestComponent { }

@Component({
    template: `
    <div igxFocusTrap tabindex="0">
        <input id="first" type="text">
        <input type="hidden">
        <button tabindex="-1">Not in tab order</button>
        <div id="untabbable" tabindex="-1">Not in tab order</div>
        <button id="middle">Middle</button>
        <button style="display: none">Not displayed</button>
        <button hidden>Hidden</button>
        <button style="visibility: hidden">Invisible</button>
        <fieldset disabled>
            <input type="text">
        </fieldset>
        <div inert>
            <button>Inert</button>
        </div>
        <details>
            <summary id="summary">More</summary>
            <button>Collapsed content</button>
        </details>
        <div id="editable" contenteditable="true">
            <span contenteditable="true">Part of the editing host</span>
            <span id="nested-editable" contenteditable="true" tabindex="0">In tab order</span>
            <span contenteditable="false">
                <span id="editable-island" contenteditable="true">Editing host</span>
            </span>
        </div>
        <div id="shadow-host" tabindex="0"></div>
        <button id="last">Last</button>
    </div>`,
    imports: [IgxFocusTrapDirective]
})
class TrapFocusTabOrderTestComponent { }

@Component({
    template: `
    <div [igxFocusTrap]="true" tabindex="0">
        <input type="text">
        <button>OK</button>
    </div>`,
    encapsulation: ViewEncapsulation.ShadowDom,
    imports: [IgxFocusTrapDirective]
})
class TrapFocusShadowDomTestComponent { }
