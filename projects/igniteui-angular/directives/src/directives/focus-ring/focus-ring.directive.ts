import { Directive, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';

/**
 * The Focus Ring directive provides a way to style an element when it has keyboard focus.
 * It listens for keyboard and pointer events to determine when to apply the focus ring styles.
 * @hidden @internal
 */
@Directive({ selector: '[igxFocusRing]', standalone: true })
export class IgxFocusRingDirective {
    private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _hasKeyboardFocus = signal(false);

    /** Indicates whether the element has keyboard focus. */
    public readonly hasKeyboardFocus = this._hasKeyboardFocus.asReadonly();

    constructor() {
        merge(
            fromEvent(this._element.nativeElement, 'keyup'),
            fromEvent(this._element.nativeElement, 'focusout'),
            fromEvent(this._element.nativeElement, 'pointerdown')
        ).pipe(takeUntilDestroyed()).subscribe(({ type }) => {
            this._hasKeyboardFocus.set(type === 'keyup');
        });
    }
}
