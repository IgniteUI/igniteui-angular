import { booleanAttribute, Directive, ElementRef, EventEmitter, inject, Injector, Input, Output, signal } from '@angular/core';
import { runAfterRenderOnce } from 'igniteui-angular/core';
import { IgxFocusRingDirective } from '../focus-ring/focus-ring.directive';


export const IgxBaseButtonType = {
    Flat: 'flat',
    Contained: 'contained',
    Outlined: 'outlined'
} as const;

@Directive({
    host: {
        'role': 'button',
        '[attr.disabled]': '_disabled() || null',
        '[class.igx-button--focused]': '_hasKeyboardFocus()',
        '[class.igx-button--disabled]': '_disabled()',
        '(click)': 'buttonClick.emit($event)',
    },
    hostDirectives: [IgxFocusRingDirective]
})
export abstract class IgxButtonBaseDirective {
    private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly _hasKeyboardFocus = inject(IgxFocusRingDirective).hasKeyboardFocus;

    /**
     * Set after the first paint. Subclasses bind it to their `--ready` modifier,
     * which gates the CSS transitions so a button doesn't animate its resting
     * styles on mount (#14759 / #16817).
     */
    protected readonly _hasRendered = signal(false);
    protected readonly _disabled = signal(false);

    /**
     * Gets or sets whether the button is disabled.
     *
     * @example
     * ```html
     * <button type="button" igxButton="flat" [disabled]="isDisabled"></button>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public set disabled(value: boolean) {
        this._disabled.set(value);
    }

    public get disabled(): boolean {
        return this._disabled();
    }

    /** Emitted when the button is clicked. */
    @Output()
    public readonly buttonClick = new EventEmitter<MouseEvent>();

    /** Returns the underlying DOM element. */
    public get nativeElement(): HTMLElement {
        return this._element.nativeElement;
    }

    constructor() {
        // Browser-only, so SSR output never carries the transitions.
        runAfterRenderOnce(inject(Injector), () => this._hasRendered.set(true));
    }
}
