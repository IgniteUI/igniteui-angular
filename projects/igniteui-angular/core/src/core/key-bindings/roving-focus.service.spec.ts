import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    IgxKeyBindingsService,
    IgxRovingFocusService,
    arrowDown,
    arrowLeft,
    arrowRight,
    arrowUp,
    endKey,
    enterKey,
    homeKey,
    spaceBar
} from 'igniteui-angular/core';
import { beforeEach, describe, expect, it } from 'vitest';

describe('IgxRovingFocusService', () => {
    let fixture: ComponentFixture<RovingFocusHostComponent>;
    let host: HTMLElement;
    let roving: IgxRovingFocusService<HTMLElement>;
    let items: HTMLElement[];
    let current: HTMLElement | null;
    let focused: HTMLElement[];
    let activated: HTMLElement[];

    const ids = (elements: HTMLElement[]) => elements.map((element) => element.id);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [RovingFocusHostComponent] });
        fixture = TestBed.createComponent(RovingFocusHostComponent);
        fixture.detectChanges();
        host = fixture.nativeElement;
        roving = fixture.componentInstance.roving;
        items = Array.from(host.querySelectorAll<HTMLElement>('.item'));
        current = items[1];
        focused = [];
        activated = [];
    });

    /** Configures the service over the test items, with `options` on top. */
    function configure(options: Partial<Parameters<typeof roving.configure>[0]> = {}): void {
        roving.configure({
            items: () => items,
            current: () => current,
            focusItem: (item) => focused.push(item),
            activateItem: (item) => activated.push(item),
            ...options
        });
    }

    describe('Moves', () => {
        it('should move the focus with the horizontal arrows from the current item', () => {
            configure();

            press(host, arrowRight);
            press(host, arrowLeft);

            expect(ids(focused)).toEqual(['item-2', 'item-0']);
        });

        it('should wrap around the ends by default', () => {
            configure();

            current = items[2];
            press(host, arrowRight);
            current = items[0];
            press(host, arrowLeft);

            expect(ids(focused)).toEqual(['item-0', 'item-2']);
        });

        it('should move to the only item when it wraps around a set of one', () => {
            configure();
            items = [items[1]];

            press(host, arrowRight);

            expect(ids(focused)).toEqual(['item-1']);
        });

        it('should stop at the ends when wrap is false, and keep the keys from the browser', () => {
            configure({ wrap: false, vertical: true });

            current = items[2];
            const down = press(host, arrowDown);
            current = items[0];
            const up = press(host, arrowUp);

            expect(focused).toEqual([]);
            // The page does not scroll at an end of the set.
            expect(down.defaultPrevented).toBe(true);
            expect(up.defaultPrevented).toBe(true);

            press(host, arrowDown);
            expect(ids(focused)).toEqual(['item-1']);
        });

        it('should jump to the first and last item with Home and End', () => {
            configure();

            press(host, homeKey);
            press(host, endKey);

            expect(ids(focused)).toEqual(['item-0', 'item-2']);
        });

        it('should not bind Home and End when homeEnd is false', () => {
            configure({ homeEnd: false });

            expect(press(host, homeKey).defaultPrevented).toBe(false);
            expect(press(host, endKey).defaultPrevented).toBe(false);
            expect(focused).toEqual([]);
        });

        it('should do nothing for an empty set', () => {
            configure();
            items = [];

            press(host, arrowRight);
            press(host, homeKey);

            expect(focused).toEqual([]);
        });
    });

    describe('Axes', () => {
        it('should bind only the horizontal axis by default', () => {
            configure();

            expect(press(host, arrowDown).defaultPrevented).toBe(false);
            expect(focused).toEqual([]);
        });

        it('should gate an axis on its predicate and leave its keys to the browser while it is off', () => {
            let vertical = false;
            configure({ vertical: () => vertical });

            expect(press(host, arrowDown).defaultPrevented).toBe(false);
            expect(focused).toEqual([]);

            vertical = true;
            expect(press(host, arrowDown).defaultPrevented).toBe(true);
            press(host, arrowUp);
            expect(ids(focused)).toEqual(['item-2', 'item-0']);
        });

        it('should not bind the horizontal axis when horizontal is false', () => {
            configure({ horizontal: false, vertical: true });

            expect(press(host, arrowRight).defaultPrevented).toBe(false);
            expect(focused).toEqual([]);
        });

        it('should keep the when of the key binding defaults on a predicate axis', () => {
            let enabled = false;
            configure({
                keyBindings: { bindingDefaults: { when: () => enabled } },
                horizontal: () => true
            });

            press(host, arrowRight);
            expect(focused).toEqual([]);

            enabled = true;
            press(host, arrowRight);
            expect(ids(focused)).toEqual(['item-2']);
        });
    });

    describe('Right-to-left', () => {
        it('should flip the horizontal arrows', () => {
            host.dir = 'rtl';
            configure();

            press(host, arrowRight);

            expect(ids(focused)).toEqual(['item-0']);
        });

        it('should not flip the vertical arrows', () => {
            host.dir = 'rtl';
            configure({ vertical: true });

            press(host, arrowDown);

            expect(ids(focused)).toEqual(['item-2']);
        });
    });

    describe('Current item', () => {
        it('should do nothing without a current item', () => {
            configure();
            current = null;

            press(host, arrowRight);
            press(host, enterKey);

            expect(focused).toEqual([]);
            expect(activated).toEqual([]);
        });

        it('should move in from the edges without a current item when missingCurrent is wrap', () => {
            configure({ missingCurrent: 'wrap', wrap: false });
            current = null;

            press(host, arrowRight);
            press(host, arrowLeft);

            expect(ids(focused)).toEqual(['item-0', 'item-2']);
        });

        it('should move from the start when the current item is not in the set', () => {
            configure();
            current = host.querySelector<HTMLElement>('.outside');

            press(host, arrowRight);

            expect(ids(focused)).toEqual(['item-0']);
        });

        it('should default to the item that has the focus or holds the focused element', () => {
            configure({ current: undefined });

            items[0].focus();
            press(items[0], arrowRight);
            expect(ids(focused)).toEqual(['item-1']);

            items[2].querySelector<HTMLElement>('button')!.focus();
            press(host, arrowLeft);
            expect(ids(focused)).toEqual(['item-1', 'item-1']);
        });
    });

    describe('Activation', () => {
        it('should activate the current item with Enter and Space', () => {
            configure();

            press(host, enterKey);
            press(host, spaceBar);

            expect(ids(activated)).toEqual(['item-1', 'item-1']);
        });

        it('should not activate a current item outside the set', () => {
            configure();
            current = host.querySelector<HTMLElement>('.outside');

            press(host, enterKey);

            expect(activated).toEqual([]);
        });

        it('should not bind Enter and Space without activateItem', () => {
            configure({ activateItem: undefined });

            expect(press(host, enterKey).defaultPrevented).toBe(false);
            expect(press(host, spaceBar).defaultPrevented).toBe(false);
        });
    });

    it('should configure the key bindings of the element with keyBindings', () => {
        configure({ keyBindings: { skip: ['.item'] } });

        press(items[1], arrowRight);
        expect(focused).toEqual([]);

        expect(() => fixture.componentInstance.keyBindings.configure({})).toThrow(/already called/);
    });

    it('should throw when configure is called a second time', () => {
        configure();

        expect(() => configure()).toThrow(/configure\(\) was already called/);
    });

    it('should throw when the element does not provide IgxKeyBindingsService', () => {
        expect(() => TestBed.createComponent(RovingFocusWithoutKeyBindingsComponent)).toThrow(/IgxKeyBindingsService/);
    });
});

@Component({
    selector: 'test-roving-focus-host',
    template: `
        <div id="item-0" class="item" tabindex="-1"></div>
        <div id="item-1" class="item" tabindex="-1"></div>
        <div id="item-2" class="item" tabindex="-1"><button>Action</button></div>
        <div class="outside" tabindex="-1"></div>
    `,
    providers: [IgxKeyBindingsService, IgxRovingFocusService]
})
class RovingFocusHostComponent {
    public readonly keyBindings = inject(IgxKeyBindingsService);
    public readonly roving = inject<IgxRovingFocusService<HTMLElement>>(IgxRovingFocusService);
}

@Component({
    selector: 'test-roving-focus-without-key-bindings',
    template: ``,
    providers: [IgxRovingFocusService]
})
class RovingFocusWithoutKeyBindingsComponent {
    public readonly roving = inject(IgxRovingFocusService);
}

/** Dispatches a keydown and a keyup of `key` on `target`, and returns the keydown. */
function press(target: EventTarget, key: string): KeyboardEvent {
    const init = { key, bubbles: true, composed: true, cancelable: true };
    const keydown = new KeyboardEvent('keydown', init);
    target.dispatchEvent(keydown);
    target.dispatchEvent(new KeyboardEvent('keyup', init));
    return keydown;
}
