import { Directive, signal } from '@angular/core';

/**
 * The Focus Ring directive provides a way to style an element when it has keyboard focus.
 * It listens for keyboard and pointer events to determine when to apply the focus ring styles.
 * @hidden @internal
 */
@Directive({
    selector: '[igxFocusRing]',
    standalone: true,
    host: {
        '(keyup)': '_hasKeyboardFocus.set(true)',
        '(focusout)': '_hasKeyboardFocus.set(false)',
        '(pointerdown)': '_hasKeyboardFocus.set(false)',
    }
})
export class IgxFocusRingDirective {
    protected readonly _hasKeyboardFocus = signal(false);

    /** Indicates whether the element has keyboard focus. */
    public readonly hasKeyboardFocus = this._hasKeyboardFocus.asReadonly();
}
