/**
 * The key names, and the case-insensitive key check.
 *
 * @remarks
 * The module has no imports, so a consumer of a key name depends on nothing
 * else. The names are `KeyboardEvent.key` values.
 */

/** @hidden @internal */
export const arrowLeft = 'ArrowLeft' as const;
/** @hidden @internal */
export const arrowRight = 'ArrowRight' as const;
/** @hidden @internal */
export const arrowUp = 'ArrowUp' as const;
/** @hidden @internal */
export const arrowDown = 'ArrowDown' as const;
/** @hidden @internal */
export const enterKey = 'Enter' as const;
/** @hidden @internal */
export const spaceBar = ' ' as const;
/** @hidden @internal */
export const escapeKey = 'Escape' as const;
/** @hidden @internal */
export const homeKey = 'Home' as const;
/** @hidden @internal */
export const endKey = 'End' as const;
/** @hidden @internal */
export const pageUpKey = 'PageUp' as const;
/** @hidden @internal */
export const pageDownKey = 'PageDown' as const;
/** @hidden @internal */
export const tabKey = 'Tab' as const;
/** @hidden @internal */
export const deleteKey = 'Delete' as const;
/** @hidden @internal */
export const backspaceKey = 'Backspace' as const;

/** @hidden @internal */
export const altKey = 'Alt' as const;
/** @hidden @internal */
export const ctrlKey = 'Control' as const;
/** @hidden @internal */
export const metaKey = 'Meta' as const;
/** @hidden @internal */
export const shiftKey = 'Shift' as const;

/**
 * Whether the key of the event matches `key`, without regard to case.
 *
 * @remarks
 * Prefer it over a direct comparison with `event.key`. A caller can hold a
 * normalized lowercase name, while an event carries the canonical case.
 */
export function isKey(event: KeyboardEvent, key: string): boolean {
    return event.key?.toLowerCase() === key.toLowerCase();
}
