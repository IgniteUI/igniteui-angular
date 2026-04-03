import { Directive, ElementRef, Input, booleanAttribute, inject, AfterViewInit, signal, EventEmitter, Output} from '@angular/core';
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
        '[style.--_init-transition]': '_hasRendered() ? null : "0s"',
        '[style.transition]': '_hasRendered() ? "var(--_button-transition)" : "none"',
        '(click)': 'buttonClick.emit($event)',
    },
    hostDirectives: [IgxFocusRingDirective]
})
export abstract class IgxButtonBaseDirective implements AfterViewInit {
    protected readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly _hasKeyboardFocus = inject(IgxFocusRingDirective).hasKeyboardFocus;

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
    public get nativeElement(): HTMLButtonElement {
        return this._element.nativeElement as HTMLButtonElement;
    }

    public ngAfterViewInit(): void {
        // FUOC workaround - ensures that the transition is only applied after the initial render
        this._hasRendered.set(true);
    }
}
