import {
    ChangeDetectionStrategy,
    Component,
    NgZone,
    PLATFORM_ID,
    inject,
    provideZoneChangeDetection,
    provideZonelessChangeDetection
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    IgxKeyBindingsService,
    altKey,
    arrowDown,
    arrowUp,
    ctrlKey,
    enterKey,
    escapeKey,
    isKey,
    shiftKey,
    spaceBar
} from 'igniteui-angular/core';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

describe('IgxKeyBindingsService', () => {
    describe('Provided by a component', () => {
        let fixture: ComponentFixture<KeyBindingsHostComponent>;
        let host: HTMLElement;
        let keyBindings: IgxKeyBindingsService;
        let handler: Mock<(event: KeyboardEvent) => void>;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [KeyBindingsHostComponent] });
            fixture = TestBed.createComponent(KeyBindingsHostComponent);
            fixture.detectChanges();
            host = fixture.nativeElement;
            keyBindings = fixture.componentInstance.keyBindings;
            handler = vi.fn();
        });

        describe('Triggers', () => {
            it('should run a keydown binding on keydown only', () => {
                keyBindings.set('a', handler);

                dispatch(host, 'keyup', 'a');
                expect(handler).not.toHaveBeenCalled();

                const event = dispatch(host, 'keydown', 'a');
                expect(handler).toHaveBeenCalledExactlyOnceWith(event);
            });

            it('should run a keyup binding on keyup only', () => {
                keyBindings.set('s', handler, { triggers: ['keyup'] });

                dispatch(host, 'keydown', 's');
                expect(handler).not.toHaveBeenCalled();

                const event = dispatch(host, 'keyup', 's');
                expect(handler).toHaveBeenCalledExactlyOnceWith(event);
            });

            it('should run a binding with both triggers on keydown and keyup', () => {
                keyBindings.set('d', handler, { triggers: ['keydown', 'keyup'] });

                press(host, 'd');
                expect(handler).toHaveBeenCalledTimes(2);
                expect(handler.mock.calls[0][0].type).toBe('keydown');
                expect(handler.mock.calls[1][0].type).toBe('keyup');
            });

            it('should ignore keys without a binding', () => {
                keyBindings.set('a', handler);

                const event = dispatch(host, 'keydown', 'b');
                expect(handler).not.toHaveBeenCalled();
                expect(event.defaultPrevented).toBe(false);
            });

            it('should ignore events without a key', () => {
                keyBindings.set('a', handler);

                // Browser autofill dispatches a plain `Event` named `keydown`.
                expect(() => host.dispatchEvent(new Event('keydown', { bubbles: true }))).not.toThrow();
                expect(handler).not.toHaveBeenCalled();
            });
        });

        describe('Skip', () => {
            it('should skip keys from inner input, textarea and select elements by default', () => {
                keyBindings.set('k', handler);

                for (const selector of ['input', 'textarea', 'select']) {
                    dispatch(host.querySelector(selector)!, 'keydown', 'k');
                }
                expect(handler).not.toHaveBeenCalled();

                dispatch(host.querySelector('.inner')!, 'keydown', 'k');
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should skip keys from elements that match custom selectors', () => {
                keyBindings.configure({ skip: ['.inner'] }).set('k', handler);

                dispatch(host.querySelector('.inner')!, 'keydown', 'k');
                expect(handler).not.toHaveBeenCalled();

                dispatch(host.querySelector('input')!, 'keydown', 'k');
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should not skip any element when the selector list is empty', () => {
                keyBindings.configure({ skip: [] }).set('k', handler);

                dispatch(host.querySelector('input')!, 'keydown', 'k');
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should honor a skip callback and pass it the target and the event', () => {
                let skip = true;
                const skipCallback = vi.fn(() => skip);
                keyBindings.configure({ skip: skipCallback }).set('k', handler);

                const inner = host.querySelector('.inner')!;
                const event = dispatch(inner, 'keydown', 'k');
                expect(skipCallback).toHaveBeenCalledExactlyOnceWith(inner, event);
                expect(handler).not.toHaveBeenCalled();

                skip = false;
                dispatch(inner, 'keydown', 'k');
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should not call the skip callback for keys without a binding', () => {
                const skipCallback = vi.fn(() => false);
                keyBindings.configure({ skip: skipCallback }).set('k', handler);

                dispatch(host, 'keydown', 'q');
                expect(skipCallback).not.toHaveBeenCalled();
            });

            it('should replace the default selectors with a skip callback', () => {
                keyBindings.configure({ skip: () => false }).set('k', handler);

                dispatch(host.querySelector('input')!, 'keydown', 'k');
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should release a key on a skipped keyup', () => {
                keyBindings.set(['x', 'z'], handler);

                dispatch(host, 'keydown', 'x');
                // Focus moved into the input before the key was released.
                dispatch(host.querySelector('input')!, 'keyup', 'x');
                dispatch(host, 'keydown', 'z');

                expect(handler).not.toHaveBeenCalled();
            });
        });

        describe('Event modifiers', () => {
            it('should prevent the default action by default', () => {
                keyBindings.set('a', handler);

                expect(dispatch(host, 'keydown', 'a').defaultPrevented).toBe(true);
            });

            it('should not prevent the default action when preventDefault is false', () => {
                keyBindings.set('a', handler, { preventDefault: false });

                expect(dispatch(host, 'keydown', 'a').defaultPrevented).toBe(false);
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should prevent the default action on keyup triggers too', () => {
                keyBindings.set('d', handler, { triggers: ['keydown', 'keyup'] });

                expect(dispatch(host, 'keydown', 'd').defaultPrevented).toBe(true);
                expect(dispatch(host, 'keyup', 'd').defaultPrevented).toBe(true);
            });

            it('should stop propagation when stopPropagation is true', () => {
                const parentHandler = vi.fn();
                host.parentElement!.addEventListener('keydown', parentHandler);
                keyBindings.set('d', handler, { stopPropagation: true });

                dispatch(host, 'keydown', 'd');

                expect(handler).toHaveBeenCalledTimes(1);
                expect(parentHandler).not.toHaveBeenCalled();
                host.parentElement!.removeEventListener('keydown', parentHandler);
            });

            it('should let the event propagate by default', () => {
                const parentHandler = vi.fn();
                host.parentElement!.addEventListener('keydown', parentHandler);
                keyBindings.set('d', handler);

                dispatch(host, 'keydown', 'd');

                expect(parentHandler).toHaveBeenCalledTimes(1);
                host.parentElement!.removeEventListener('keydown', parentHandler);
            });
        });

        describe('Binding defaults', () => {
            it('should apply the binding defaults, with the binding options on top', () => {
                keyBindings
                    .configure({ bindingDefaults: { preventDefault: false, repeat: true } })
                    .set('a', handler)
                    .set('b', handler, { repeat: false });

                expect(dispatch(host, 'keydown', 'a', { repeat: true }).defaultPrevented).toBe(false);
                expect(handler).toHaveBeenCalledTimes(1);

                dispatch(host, 'keyup', 'a');
                dispatch(host, 'keydown', 'b', { repeat: true });
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should apply the binding defaults to bindings set before configure', () => {
                keyBindings.set('a', handler);
                keyBindings.configure({ bindingDefaults: { preventDefault: false } });

                expect(dispatch(host, 'keydown', 'a').defaultPrevented).toBe(false);
            });
        });

        describe('Activation keys', () => {
            it('should run the activate handler for Enter and Space', () => {
                keyBindings.setActivateHandler(handler);

                press(host, enterKey);
                press(host, spaceBar);

                expect(handler).toHaveBeenCalledTimes(2);
                expect(handler.mock.calls[0][0].key).toBe(enterKey);
                expect(handler.mock.calls[1][0].key).toBe(spaceBar);
            });
        });

        describe('Combinations', () => {
            it('should run a binding only for its full modifier combination', () => {
                keyBindings
                    .set([shiftKey, 'c'], handler)
                    .set([shiftKey, altKey, arrowUp], handler);

                dispatch(host, 'keydown', shiftKey, { shiftKey: true });
                dispatch(host, 'keyup', shiftKey);
                press(host, 'c');
                expect(handler).not.toHaveBeenCalled();

                press(host, 'C', { shiftKey: true });
                expect(handler).toHaveBeenCalledTimes(1);

                press(host, arrowUp, { shiftKey: true, altKey: true });
                expect(handler).toHaveBeenCalledTimes(2);

                press(host, arrowUp, { shiftKey: true });
                expect(handler).toHaveBeenCalledTimes(2);
            });

            it('should not depend on the order or the case of the key names', () => {
                keyBindings.set(['S', 'control'], handler);

                press(host, 's', { ctrlKey: true });
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should match a symbol produced with Shift only together with Shift', () => {
                const bangHandler = vi.fn();
                keyBindings.set('!', bangHandler).set([shiftKey, '!'], handler);

                // Shift+1 on a US layout: `key` is '!' and `shiftKey` is set.
                press(host, '!', { shiftKey: true, code: 'Digit1' });

                expect(handler).toHaveBeenCalledTimes(1);
                expect(bangHandler).not.toHaveBeenCalled();
            });
        });

        describe('Chords without modifiers', () => {
            beforeEach(() => keyBindings.set(['x', 'z'], handler));

            it('should not run when only one of the keys is down', () => {
                press(host, 'x');
                dispatch(host, 'keydown', 'z');

                expect(handler).not.toHaveBeenCalled();
            });

            it('should run when all keys are down together', () => {
                dispatch(host, 'keydown', 'x');
                dispatch(host, 'keydown', 'z');

                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should release the pressed keys on window blur', () => {
                dispatch(host, 'keydown', 'x');
                window.dispatchEvent(new FocusEvent('blur'));
                dispatch(host, 'keydown', 'z');

                expect(handler).not.toHaveBeenCalled();
            });

            it('should release the pressed keys when focus leaves the host', () => {
                const inner = host.querySelector('.inner')!;
                dispatch(inner, 'keydown', 'x');
                // The keyup of `x` fires outside the host, where the service does not listen.
                inner.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
                dispatch(inner, 'keydown', 'z');

                expect(handler).not.toHaveBeenCalled();
            });

            it('should keep the pressed keys when focus moves inside the host', () => {
                const inner = host.querySelector('.inner')!;
                const input = host.querySelector('input')!;
                keyBindings.configure({ skip: [] });
                dispatch(inner, 'keydown', 'x');
                inner.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: input }));
                dispatch(input, 'keydown', 'z');

                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        describe('Repeat', () => {
            it('should ignore a repeated keydown by default', () => {
                keyBindings.set('a', handler);

                dispatch(host, 'keydown', 'a', { repeat: true });
                expect(handler).not.toHaveBeenCalled();
            });

            it('should prevent the default of an ignored repeated keydown', () => {
                keyBindings
                    .set('a', handler)
                    .set('b', handler, { preventDefault: false });

                expect(dispatch(host, 'keydown', 'a', { repeat: true }).defaultPrevented, 'a held key keeps its default prevented')
                    .toBe(true);
                dispatch(host, 'keyup', 'a');
                expect(dispatch(host, 'keydown', 'b', { repeat: true }).defaultPrevented).toBe(false);
                expect(handler).not.toHaveBeenCalled();
            });

            it('should stop the propagation of an ignored repeated keydown when stopPropagation is true', () => {
                const parentHandler = vi.fn();
                host.parentElement!.addEventListener('keydown', parentHandler);
                keyBindings.set('a', handler, { stopPropagation: true });

                dispatch(host, 'keydown', 'a', { repeat: true });

                expect(parentHandler).not.toHaveBeenCalled();
                expect(handler).not.toHaveBeenCalled();
                host.parentElement!.removeEventListener('keydown', parentHandler);
            });

            it('should run for a repeated keydown when repeat is true', () => {
                keyBindings.set('b', handler, { repeat: true });

                dispatch(host, 'keydown', 'b');
                dispatch(host, 'keydown', 'b', { repeat: true });
                expect(handler).toHaveBeenCalledTimes(2);
            });

            it('should run the right binding for overlapping key presses', () => {
                const downHandler = vi.fn();
                const upHandler = vi.fn();
                keyBindings
                    .set(arrowDown, downHandler, { repeat: true })
                    .set(arrowUp, upHandler, { repeat: true });

                dispatch(host, 'keydown', arrowDown);
                dispatch(host, 'keydown', arrowDown, { repeat: true });
                // ArrowDown is still down: it has no keyup yet.
                dispatch(host, 'keydown', arrowUp);

                expect(upHandler).toHaveBeenCalledTimes(1);

                dispatch(host, 'keyup', arrowDown);
                dispatch(host, 'keyup', arrowUp);
                dispatch(host, 'keydown', arrowDown);

                expect(downHandler).toHaveBeenCalledTimes(3);
            });
        });

        describe('Dev-mode errors', () => {
            it('should throw for a combination bound twice and keep the first binding', () => {
                const second = vi.fn();
                keyBindings.set([shiftKey, 'a'], handler);

                expect(() => keyBindings.set(['A', shiftKey], second)).toThrowError(/shift\+a/);

                press(host, 'A', { shiftKey: true });
                expect(handler).toHaveBeenCalledTimes(1);
                expect(second).not.toHaveBeenCalled();
            });

            it('should throw for an activate handler on an already bound key', () => {
                keyBindings.set(enterKey, handler);

                expect(() => keyBindings.setActivateHandler(handler)).toThrowError(/enter/);
            });

            it('should throw when configure is called a second time', () => {
                keyBindings.configure({ skip: [] });

                expect(() => keyBindings.configure({ skip: () => true })).toThrowError(/configure/);

                keyBindings.set('k', handler);
                dispatch(host.querySelector('input')!, 'keydown', 'k');
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        describe('observeElement', () => {
            let external: HTMLElement;

            beforeEach(() => {
                external = document.createElement('div');
                document.body.appendChild(external);
                keyBindings.set(escapeKey, handler);
            });

            afterEach(() => external.remove());

            it('should handle the keys of an element outside the host', () => {
                keyBindings.observeElement(external);

                const event = dispatch(external, 'keydown', escapeKey);
                expect(handler).toHaveBeenCalledExactlyOnceWith(event);
            });

            it('should keep handling the keys of the host while observing', () => {
                keyBindings.observeElement(external);

                dispatch(host, 'keydown', escapeKey);
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should handle the keys of several observed elements', () => {
                const second = document.createElement('div');
                document.body.appendChild(second);
                keyBindings.observeElement(external);
                keyBindings.observeElement(second);

                dispatch(external, 'keydown', escapeKey);
                dispatch(second, 'keydown', escapeKey);

                expect(handler).toHaveBeenCalledTimes(2);
                second.remove();
            });

            it('should stop handling only the unsubscribed element', () => {
                const second = document.createElement('div');
                document.body.appendChild(second);
                const { unsubscribe } = keyBindings.observeElement(external);
                keyBindings.observeElement(second);

                unsubscribe();
                dispatch(external, 'keydown', escapeKey);
                expect(handler).not.toHaveBeenCalled();

                dispatch(second, 'keydown', escapeKey);
                expect(handler).toHaveBeenCalledTimes(1);
                second.remove();
            });

            it('should run once for an observed element inside the host and keep bubbling', () => {
                const parentHandler = vi.fn();
                host.parentElement!.addEventListener('keydown', parentHandler);
                const inner = host.querySelector<HTMLElement>('.inner')!;
                keyBindings.observeElement(inner);

                dispatch(inner, 'keydown', escapeKey);

                expect(handler).toHaveBeenCalledTimes(1);
                expect(parentHandler).toHaveBeenCalledTimes(1);
                host.parentElement!.removeEventListener('keydown', parentHandler);
            });

            it('should match the skip selectors up to the observed element', () => {
                const input = document.createElement('input');
                external.appendChild(input);
                keyBindings.observeElement(external);

                dispatch(input, 'keydown', escapeKey);
                expect(handler).not.toHaveBeenCalled();

                dispatch(external, 'keydown', escapeKey);
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should handle the keys of an observed input element itself', () => {
                const input = document.createElement('input');
                external.appendChild(input);
                keyBindings.observeElement(input);

                dispatch(input, 'keydown', escapeKey);
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should stop observing when the host is destroyed', () => {
                keyBindings.observeElement(external);

                fixture.destroy();
                dispatch(external, 'keydown', escapeKey);

                expect(handler).not.toHaveBeenCalled();
            });
        });

        it('should remove its listeners when destroyed', () => {
            keyBindings.set('a', handler);

            fixture.destroy();
            dispatch(host, 'keydown', 'a');

            expect(handler).not.toHaveBeenCalled();
        });
    });

    it('should throw when it is not provided by an element', () => {
        TestBed.configureTestingModule({ providers: [IgxKeyBindingsService] });

        expect(() => TestBed.inject(IgxKeyBindingsService)).toThrowError(/providers/);
    });

    describe('Change detection', () => {
        it('should run a bound handler inside the Angular zone, and nothing else', () => {
            TestBed.configureTestingModule({
                imports: [KeyBindingsCounterComponent],
                providers: [provideZoneChangeDetection()]
            });
            const fixture = TestBed.createComponent(KeyBindingsCounterComponent);
            fixture.detectChanges();
            const zone = TestBed.inject(NgZone);
            const host: HTMLElement = fixture.nativeElement;
            let zoneEntries = 0;
            const subscription = zone.onUnstable.subscribe(() => zoneEntries++);

            press(host, 'q');
            press(host, 'q', { ctrlKey: true });
            expect(zoneEntries).toBe(0);

            dispatch(host, 'keydown', enterKey);
            expect(zoneEntries).toBe(1);
            expect(fixture.componentInstance.ranInZone).toBe(true);
            subscription.unsubscribe();
        });

        it('should refresh an OnPush host after a bound handler changes a plain field', () => {
            TestBed.configureTestingModule({
                imports: [KeyBindingsCounterComponent],
                providers: [provideZoneChangeDetection()]
            });
            const fixture = TestBed.createComponent(KeyBindingsCounterComponent);
            fixture.detectChanges();
            const host: HTMLElement = fixture.nativeElement;

            dispatch(host, 'keydown', enterKey);
            fixture.detectChanges();

            expect(host.querySelector('.count')!.textContent).toBe('1');
        });

        it('should refresh the host after a bound handler without Zone.js', async () => {
            TestBed.configureTestingModule({
                imports: [KeyBindingsCounterComponent],
                providers: [provideZonelessChangeDetection()]
            });
            const fixture = TestBed.createComponent(KeyBindingsCounterComponent);
            await fixture.whenStable();
            const host: HTMLElement = fixture.nativeElement;

            dispatch(host, 'keydown', enterKey);
            await fixture.whenStable();

            expect(host.querySelector('.count')!.textContent).toBe('1');
        });
    });

    describe('Server platform', () => {
        it('should not add listeners outside the browser', () => {
            const addListener = vi.spyOn(window, 'addEventListener');
            TestBed.configureTestingModule({
                imports: [KeyBindingsHostComponent],
                providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
            });
            const fixture = TestBed.createComponent(KeyBindingsHostComponent);
            const keyBindings = fixture.componentInstance.keyBindings;
            const handler = vi.fn();
            const external = document.createElement('div');

            keyBindings.set('a', handler);
            const { unsubscribe } = keyBindings.observeElement(external);
            dispatch(fixture.nativeElement, 'keydown', 'a');
            dispatch(external, 'keydown', 'a');

            expect(handler).not.toHaveBeenCalled();
            expect(addListener).not.toHaveBeenCalledWith('blur', expect.anything(), expect.anything());
            expect(() => unsubscribe()).not.toThrow();
        });
    });
});

describe('isKey', () => {
    it('should compare the key of the event without regard to case', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });

        expect(isKey(event, arrowUp)).toBe(true);
        expect(isKey(event, 'arrowup')).toBe(true);
        expect(isKey(event, arrowDown)).toBe(false);
        expect(isKey(new KeyboardEvent('keydown', { key: 'Control' }), ctrlKey)).toBe(true);
    });
});

@Component({
    selector: 'test-key-bindings-host',
    template: `
        <input />
        <textarea></textarea>
        <select></select>
        <div class="inner" tabindex="0"></div>
    `,
    providers: [IgxKeyBindingsService]
})
class KeyBindingsHostComponent {
    public readonly keyBindings = inject(IgxKeyBindingsService);
}

@Component({
    selector: 'test-key-bindings-counter',
    template: `<span class="count">{{ count }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [IgxKeyBindingsService]
})
class KeyBindingsCounterComponent {
    public count = 0;
    public ranInZone = false;

    constructor() {
        inject(IgxKeyBindingsService).set(enterKey, () => {
            this.ranInZone = NgZone.isInAngularZone();
            this.count++;
        });
    }
}

function dispatch(
    target: EventTarget,
    type: 'keydown' | 'keyup',
    key: string,
    init: KeyboardEventInit = {}
): KeyboardEvent {
    const event = new KeyboardEvent(type, {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
        ...init
    });
    target.dispatchEvent(event);
    return event;
}

function press(target: EventTarget, key: string, init: KeyboardEventInit = {}): void {
    dispatch(target, 'keydown', key, init);
    dispatch(target, 'keyup', key, init);
}
