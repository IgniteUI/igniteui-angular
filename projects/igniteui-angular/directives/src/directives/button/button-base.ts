import {
    Directive,
    ElementRef,
    Input,
    booleanAttribute,
    inject,
    signal,
    EventEmitter,
    Output,
    afterNextRender
} from '@angular/core';
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
    protected readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly _hasKeyboardFocus = inject(IgxFocusRingDirective).hasKeyboardFocus;

    protected readonly _disabled = signal(false);

    /** `--ready` modifier that enables transitions; overridden by icon-button. */
    protected readyClass = 'igx-button--ready';

    constructor() {
        // Enable transitions only after first render so buttons don't animate their
        // resting styles on mount (#14759 / #16817). afterNextRender is browser-only.
        afterNextRender(() => {
            this._element.nativeElement.classList.add(this.readyClass);
        });
    }

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
}
