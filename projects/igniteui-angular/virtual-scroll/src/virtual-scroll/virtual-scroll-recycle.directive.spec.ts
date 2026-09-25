import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgxVsRecycleDirective } from './virtual-scroll-recycle.directive';

@Component({
    selector: 'test-recycle-host',
    template: `
        <ul>
            <li *igxVsRecycle="let key of keys(); key: byKey" [attr.data-key]="key">
                <button>{{ key }}</button>
                <input type="checkbox" />
            </li>
        </ul>
    `,
    imports: [IgxVsRecycleDirective],
})
class TestRecycleHostComponent {
    public keys = signal<number[]>([]);
    public byKey = (key: number) => key;
}

function range(start: number, end: number): number[] {
    return Array.from({ length: end - start }, (_, i) => start + i);
}

/** Compares elements by identity. `toEqual` compares DOM nodes by structure. */
function expectSame(actual: Element[], expected: (Element | undefined)[]): void {
    expect(actual.length).toBe(expected.length);
    actual.forEach((element, i) => expect(element).toBe(expected[i]!));
}

describe('IgxVsRecycleDirective', () => {
    let fixture: ComponentFixture<TestRecycleHostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestRecycleHostComponent] });
        fixture = TestBed.createComponent(TestRecycleHostComponent);
    });

    function renderKeys(keys: number[]): void {
        fixture.componentInstance.keys.set(keys);
        fixture.detectChanges();
    }

    function list(): HTMLUListElement {
        return fixture.nativeElement.querySelector('ul');
    }

    function elements(): HTMLLIElement[] {
        return Array.from(list().querySelectorAll('li'));
    }

    function renderedKeys(): number[] {
        return elements().map((li) => Number(li.dataset['key']));
    }

    function elementByKey(): Map<number, HTMLLIElement> {
        return new Map(elements().map((li) => [Number(li.dataset['key']), li]));
    }

    function button(key: number): HTMLButtonElement {
        return elementByKey().get(key)!.querySelector('button')!;
    }

    /** Records the elements added to the list while `action` runs. */
    function addedElements(action: () => void): Element[] {
        const observer = new MutationObserver(() => undefined);
        observer.observe(list(), { childList: true });
        action();

        const added = observer
            .takeRecords()
            .flatMap((record) => Array.from(record.addedNodes))
            .filter((node): node is Element => node instanceof Element);

        observer.disconnect();
        return added;
    }

    it('should render the items in order', () => {
        renderKeys(range(0, 5));

        expect(renderedKeys()).toEqual([0, 1, 2, 3, 4]);
        expect(list().textContent!.replace(/\s/g, '')).toBe('01234');
    });

    it('should keep the element of each key that stays', () => {
        renderKeys(range(0, 10));
        const before = elementByKey();

        renderKeys(range(3, 13));
        const after = elementByKey();

        expect(renderedKeys()).toEqual(range(3, 13));
        for (const key of range(3, 10)) {
            expect(after.get(key)).toBe(before.get(key));
        }
    });

    it('should reuse the elements of departed keys without a DOM move', () => {
        renderKeys(range(0, 10));
        const before = elements();

        const added = addedElements(() => renderKeys(range(100, 110)));

        expect(renderedKeys()).toEqual(range(100, 110));
        expectSame(elements(), before);
        expect(added).toEqual([]);
    });

    it('should move only the recycled elements when the keys shift', () => {
        renderKeys(range(0, 10));
        const before = elementByKey();

        const down = addedElements(() => renderKeys(range(2, 12)));
        expect(renderedKeys()).toEqual(range(2, 12));
        expectSame(down, [before.get(1), before.get(0)]);

        const middle = elementByKey();
        const up = addedElements(() => renderKeys(range(0, 10)));
        expect(renderedKeys()).toEqual(range(0, 10));
        expectSame(up, [middle.get(11), middle.get(10)]);
    });

    it('should move the kept elements only when they are fewer than half the recycled ones', () => {
        renderKeys(range(0, 10));
        let before = elementByKey();

        // Four keys stay and six leave: the recycled elements move.
        let added = addedElements(() => renderKeys(range(6, 16)));
        expectSame(added, [5, 4, 3, 2, 1, 0].map((key) => before.get(key)));

        // Two keys stay and eight leave: the kept elements move.
        before = elementByKey();
        added = addedElements(() => renderKeys(range(14, 24)));
        expect(renderedKeys()).toEqual(range(14, 24));
        expectSame(added, [before.get(15), before.get(14)]);
    });

    it('should put the items in key order for any change of keys', () => {
        const sequences = [
            range(0, 8),
            range(0, 8).reverse(),
            [3, 1, 4, 0, 5, 2, 7, 6],
            [10, 3, 11, 1, 12],
            range(0, 12),
            range(0, 4),
            range(0, 9),
            [11, 5, 0, 20, 21, 4, 9],
            [],
            [7, 8, 9],
            [9, 30, 8, 31, 7, 32, 33, 34, 35],
            [1, 1, 2],
            [2, 1, 1, 1],
        ];

        for (const keys of sequences) {
            renderKeys(keys);
            expect(renderedKeys()).toEqual(keys);
        }
    });

    it('should put the items in key order for random changes of keys', () => {
        // A linear congruential generator, so a failure reproduces.
        let seed = 1;
        const random = (max: number) => {
            seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
            return Math.floor((seed / 2 ** 32) * max);
        };

        for (let step = 0; step < 200; step++) {
            const start = random(30);
            const keys = range(start, start + random(20));

            if (random(4) === 0) {
                for (let i = keys.length - 1; i > 0; i--) {
                    const j = random(i + 1);
                    [keys[i], keys[j]] = [keys[j], keys[i]];
                }
            }

            renderKeys(keys);
            expect(renderedKeys()).toEqual(keys);
        }
    });

    it('should keep the focused kept element in place when the kept elements move', () => {
        renderKeys(range(0, 10));
        const focused = button(9);
        focused.focus();

        // Two keys stay and eight leave, which would move the kept elements.
        renderKeys(range(8, 18));
        expect(renderedKeys()).toEqual(range(8, 18));
        expect(document.activeElement).toBe(focused);
    });

    it('should keep the focus in a kept item when the keys reverse', () => {
        renderKeys(range(0, 10));
        const focused = button(3);
        focused.focus();

        renderKeys(range(0, 10).reverse());
        expect(renderedKeys()).toEqual(range(0, 10).reverse());
        expect(document.activeElement).toBe(focused);
    });

    it('should destroy the views that no key takes', () => {
        renderKeys(range(0, 10));
        const last = elementByKey().get(9)!;

        renderKeys(range(0, 9));
        expect(last.isConnected).toBeFalse();

        // Not kept for reuse: a content query would still report its components.
        renderKeys(range(0, 10));
        expect(elements().includes(last)).toBeFalse();
    });

    it('should move unbound DOM state with a recycled element to the key that enters', () => {
        renderKeys(range(0, 3));
        elementByKey().get(0)!.querySelector('input')!.checked = true;

        renderKeys(range(1, 4));
        expect(elementByKey().get(3)!.querySelector('input')!.checked).toBeTrue();
    });
});
