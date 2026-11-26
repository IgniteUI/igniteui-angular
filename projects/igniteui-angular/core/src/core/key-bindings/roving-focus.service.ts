import { ElementRef, Injectable, inject } from '@angular/core';
import { isLeftToRight } from '../utils';
import { getActiveElement } from '../tabbable';
import { canConfigure } from './configure-once';
import { IgxKeyBindingOptions, IgxKeyBindingsConfig, IgxKeyBindingsService } from './key-bindings.service';
import { arrowDown, arrowLeft, arrowRight, arrowUp, endKey, homeKey } from './keys';

/**
 * Whether an arrow axis navigates. A predicate, for a host that changes
 * orientation at runtime, binds the keys only while it returns `true`, so the
 * browser keeps the keys of an inactive axis, for example to scroll the page.
 *
 * @hidden @internal
 */
export type IgxRovingFocusAxis = boolean | (() => boolean);

/**
 * The configuration of an {@link IgxRovingFocusService}.
 *
 * @hidden @internal
 */
export interface IgxRovingFocusOptions<T extends Element> {
    /** The keyboard-navigable items, in order, without the inert ones. */
    items: () => T[];
    /**
     * The item that navigation moves from. Defaults to the item that has the
     * focus or holds the focused element.
     */
    current?: () => T | null | undefined;
    /** Moves the focus to `item`. The host owns any side effects. */
    focusItem: (item: T) => void;
    /** Runs with the current item on Enter and on Space. */
    activateItem?: (item: T) => void;
    /** Whether ArrowLeft and ArrowRight navigate. Defaults to `true`. */
    horizontal?: IgxRovingFocusAxis;
    /** Whether ArrowUp and ArrowDown navigate. Defaults to `false`. */
    vertical?: IgxRovingFocusAxis;
    /** Whether Home and End jump to the first and last item. Default `true`. */
    homeEnd?: boolean;
    /**
     * Whether the arrow moves wrap around the ends. With `false`, a move past
     * an end does nothing, and the key stays cancelled. Defaults to `true`.
     */
    loop?: boolean;
    /**
     * How arrow navigation treats a nullish current item:
     * - `skip` - do nothing (default)
     * - `wrap` - navigate from outside the list, so "next" lands on the first
     *   item and "previous" on the last one
     */
    missingCurrent?: 'skip' | 'wrap';
    /**
     * The configuration of the {@link IgxKeyBindingsService} of the element.
     * Without it, the service keeps the configuration that the host gives it.
     */
    keyBindings?: IgxKeyBindingsConfig;
}

/**
 * Implements the roving keyboard navigation of the container components.
 *
 * @remarks
 * Moves wrap over a flat list, unless `loop` is `false`, and the horizontal
 * axis follows the writing direction. A hierarchy, such as the tree, needs its
 * own navigation.
 *
 * List it in the `providers` of the component or directive, next to
 * {@link IgxKeyBindingsService}, which it adds its bindings to, and call
 * {@link configure} once.
 *
 * @hidden @internal
 */
@Injectable()
export class IgxRovingFocusService<T extends Element = Element> {
    private readonly _host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly _keyBindings = injectKeyBindings();

    private _options?: IgxRovingFocusOptions<T>;

    /**
     * Configures the navigation and binds its keys. Call it once.
     *
     * @param options - The items, the focus and activation callbacks, and the navigation rules.
     * @returns The service, for chaining.
     *
     * @example
     * ```typescript
     * inject(IgxRovingFocusService).configure({
     *     keyBindings: { skip: () => this.disabled },
     *     items: () => this.options,
     *     focusItem: (option) => option.focus(),
     *     activateItem: (option) => option.click(),
     *     horizontal: false,
     *     vertical: true,
     *     loop: false
     * });
     * ```
     */
    public configure(options: IgxRovingFocusOptions<T>): this {
        if (!canConfigure(!!this._options, 'IgxRovingFocusService')) {
            return this;
        }
        this._options = options;

        const { horizontal = true, vertical = false, homeEnd = true, activateItem, keyBindings } = options;

        const bindings = keyBindings ? this._keyBindings.configure(keyBindings) : this._keyBindings;
        const gate = keyBindings?.bindingDefaults?.when;
        // The axis predicate keeps the `when` of the binding defaults.
        const axis = (enabled: IgxRovingFocusAxis): IgxKeyBindingOptions | undefined =>
            typeof enabled === 'function'
                ? { when: () => enabled() && (gate?.() ?? true) }
                : undefined;

        if (horizontal) {
            bindings
                .set(arrowLeft, () => this._move(-1, true), axis(horizontal))
                .set(arrowRight, () => this._move(1, true), axis(horizontal));
        }

        if (vertical) {
            bindings
                .set(arrowUp, () => this._move(-1, false), axis(vertical))
                .set(arrowDown, () => this._move(1, false), axis(vertical));
        }

        if (homeEnd) {
            bindings
                .set(homeKey, () => this._focus(this._options!.items()[0]))
                .set(endKey, () => this._focus(this._options!.items().at(-1)));
        }

        if (activateItem) {
            bindings.setActivateHandler(() => this._activate());
        }

        return this;
    }

    private _focus(item?: T): void {
        if (item) {
            this._options!.focusItem(item);
        }
    }

    private _move(delta: -1 | 1, rtlAware: boolean): void {
        const { loop = true, missingCurrent } = this._options!;
        const items = this._options!.items();
        const current = this._current(items);

        if (!items.length || (!current && missingCurrent !== 'wrap')) {
            return;
        }

        // An item outside the set gives -1, so the move wraps in from an edge.
        const index = current ? items.indexOf(current) : -1;
        const direction = rtlAware && !isLeftToRight(this._host) ? -delta : delta;
        const last = items.length - 1;
        const target = index + direction;

        if (!loop && index !== -1 && (target < 0 || target > last)) {
            return;
        }

        this._focus(items[target < 0 ? last : target > last ? 0 : target]);
    }

    private _activate(): void {
        const items = this._options!.items();
        const current = this._current(items);

        if (current && items.includes(current)) {
            this._options!.activateItem!(current);
        }
    }

    private _current(items: T[]): T | null | undefined {
        if (this._options!.current) {
            return this._options!.current();
        }

        const active = getActiveElement(this._host);
        return active ? items.find((item) => item === active || item.contains(active)) : undefined;
    }
}

/** The key bindings of the same element, which the service adds its bindings to. */
function injectKeyBindings(): IgxKeyBindingsService {
    const keyBindings = inject(IgxKeyBindingsService, { self: true, optional: true });
    if (!keyBindings) {
        throw new Error(
            'IgxRovingFocusService needs IgxKeyBindingsService on the same element. ' +
            'List both in the providers of the component or directive that uses them.'
        );
    }
    return keyBindings;
}
