import { isComposingKey, spaceBar } from './keys';

/**
 * How the type-ahead reads and filters the items.
 *
 * @hidden @internal
 */
export interface IgxTypeAheadItemOptions<T> {
    /** The text that an item matches against, such as its title. */
    text: (item: T) => string;
    /** The items to pass over, such as disabled ones. They keep their place in the order. */
    skip?: (item: T) => boolean;
}

/**
 * The options of {@link findTypeAheadMatch}.
 *
 * @hidden @internal
 */
export interface IgxTypeAheadMatchOptions<T> extends IgxTypeAheadItemOptions<T> {
    /** The item that the search starts after. */
    current?: T | null;
}

/**
 * The configuration of an {@link IgxTypeAhead}.
 *
 * @hidden @internal
 */
export interface IgxTypeAheadOptions<T> extends IgxTypeAheadItemOptions<T> {
    /** The pause, in milliseconds, after which the next key starts a new term. Defaults to `500`. */
    timeout?: number;
    /**
     * Whether a term of one repeated letter moves to the next item that
     * starts with the letter, as in a native select, even when an item starts
     * with the repeated letters. Defaults to `false`.
     */
    cycleRepeatedLetter?: boolean;
}

/**
 * Finds the next item whose text starts with `term`, without regard to case.
 *
 * @remarks
 * The search starts after the current item, wraps around, and never returns
 * the current item. When nothing matches and the term repeats its first
 * letter, as a held key does, the search runs again with that letter, so the
 * items with the same first letter take turns.
 *
 * @param items - The items, in order.
 * @param term - The typed text.
 * @param options - The text of an item, the current item and the items to pass over.
 * @returns The matching item, or `undefined` when nothing matches.
 *
 * @example
 * ```typescript
 * const next = findTypeAheadMatch(items, 'pa', { text: (item) => item.text, current: focused });
 * ```
 *
 * @hidden @internal
 */
export function findTypeAheadMatch<T>(
    items: readonly T[],
    term: string,
    options: IgxTypeAheadMatchOptions<T>
): T | undefined {
    const match = findNext(items, term, options);
    if (match || term.charAt(0) !== term.charAt(term.length - 1)) {
        return match;
    }
    return findNext(items, term.charAt(0), options);
}

function findNext<T>(items: readonly T[], term: string, { text, current, skip }: IgxTypeAheadMatchOptions<T>): T | undefined {
    const index = current ? items.indexOf(current) : -1;
    const matches = (item: T) => !skip?.(item) && startsWith(text(item), term);

    return items.slice(index + 1).find(matches) ?? items.slice(0, Math.max(index, 0)).find(matches);
}

function startsWith(text: string, term: string): boolean {
    return text.toLowerCase().startsWith(term.toLowerCase());
}

/**
 * The type-ahead search of a list of items: the keys typed in a quick
 * succession form a term, and the search moves to the next item whose text
 * starts with it.
 *
 * @remarks
 * Create one per host. The host decides which keys reach {@link search}, for
 * example with {@link accepts}, and what a match does, such as moving the
 * focus.
 *
 * @hidden @internal
 */
export class IgxTypeAhead<T> {
    private readonly _items: IgxTypeAheadItemOptions<T>;
    private readonly _timeout: number;
    private readonly _cycleRepeatedLetter: boolean;

    private _term = '';
    private _lastKeyTime = 0;

    /**
     * Whether a search is active: a key was added within the timeout.
     *
     * @returns `true` from the first key until a pause of the timeout or a {@link reset}.
     *
     * @example
     * ```typescript
     * const typesSpace = event.key === ' ' && typeAhead.searching;
     * ```
     */
    public get searching(): boolean {
        return this._term !== '' && !this._timedOut();
    }

    /**
     * @param options - The text of an item, the items to pass over and the timeout.
     *
     * @example
     * ```typescript
     * const typeAhead = new IgxTypeAhead({ text: (item) => item.text, skip: (item) => item.disabled });
     * ```
     */
    constructor(options: IgxTypeAheadOptions<T>) {
        this._items = { text: options.text, skip: options.skip };
        this._timeout = options.timeout ?? 500;
        this._cycleRepeatedLetter = options.cycleRepeatedLetter ?? false;
    }

    /**
     * Whether `event` types into the search: a single printable character
     * without Control, Meta or Alt, outside of an IME composition. Space
     * counts only while a search is active, so it can still activate an item.
     *
     * @param event - The keyboard event to check.
     * @returns `true` when the key belongs to the search.
     *
     * @example
     * ```typescript
     * if (typeAhead.accepts(event)) {
     *     event.preventDefault();
     *     this.focus(typeAhead.search(event.key, this.items, this.focused));
     * }
     * ```
     */
    public accepts(event: KeyboardEvent): boolean {
        if (event.ctrlKey || event.metaKey || event.altKey || isComposingKey(event)) {
            return false;
        }
        if (event.key === spaceBar) {
            return this.searching;
        }
        return /^.$/u.test(event.key);
    }

    /**
     * Adds `key` to the term and finds the item to move to.
     *
     * @remarks
     * A key after a pause of the timeout starts a new term. The current item
     * stays while it matches the longer term. With `cycleRepeatedLetter`, a
     * term of one repeated letter moves to the next item with that letter.
     *
     * @param key - The typed character.
     * @param items - The items, in order.
     * @param current - The item that the search starts after.
     * @returns The item to move to, the current item when it still matches, or `undefined`.
     *
     * @example
     * ```typescript
     * const match = typeAhead.search(event.key, this.items, this.focused);
     * if (match && match !== this.focused) {
     *     this.focus(match);
     * }
     * ```
     */
    public search(key: string, items: readonly T[], current?: T | null): T | undefined {
        if (this._timedOut()) {
            this._term = '';
        }
        this._term += key;
        this._lastKeyTime = Date.now();

        const [first, ...rest] = Array.from(this._term);
        if (this._cycleRepeatedLetter && rest.every(letter => letter === first)) {
            return findNext(items, first, { ...this._items, current });
        }

        if (current && this._term.length > 1 && startsWith(this._items.text(current), this._term)) {
            return current;
        }

        return findTypeAheadMatch(items, this._term, { ...this._items, current });
    }

    /**
     * Clears the term, so the next key starts a new search.
     *
     * @example
     * ```typescript
     * typeAhead.reset();
     * ```
     */
    public reset(): void {
        this._term = '';
    }

    private _timedOut(): boolean {
        return Date.now() - this._lastKeyTime >= this._timeout;
    }
}
