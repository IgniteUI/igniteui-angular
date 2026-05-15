import { ScrollStrategy } from './scroll-strategy';

/**
 * Prevents scrolling while the overlay content is shown.
 */
export class BlockScrollStrategy extends ScrollStrategy {
    private _initialized = false;
    private _document: Document;
    private _initialScrollTop: number;
    private _initialScrollLeft: number;
    private _sourceElement: Element;

    constructor() {
        super();
    }

    /**
     * Initializes the strategy. Should be called once
     *
     */
    public initialize(document: Document) {
        if (this._initialized) {
            return;
        }

        this._document = document;
        this._initialized = true;
    }

    /**
     * Attaches the strategy
     * ```typescript
     * settings.scrollStrategy.attach();
     * ```
     */
    public attach(): void {
        // Prevent scroll from mouse/trackpad/touch before it occurs.
        // `{ passive: false }` is required — without it, browsers ignore preventDefault() on these events.
        // This also fixes Safari bug #17217 where the scroll event fires after the compositor has already
        // scrolled, making scroll-position reset ineffective for wheel/touch input.
        this._document.addEventListener('wheel', this.preventDefault, { passive: false });
        this._document.addEventListener('touchmove', this.preventDefault, { passive: false });
        // Handles keyboard-driven scrolling (arrow keys, spacebar, Page Up/Down) as a fallback,
        // since keyboard input cannot be intercepted via wheel/touchmove.
        this._document.addEventListener('scroll', this.onScroll, true);
    }

    /**
     * Detaches the strategy
     * ```typescript
     * settings.scrollStrategy.detach();
     * ```
     */
    public detach(): void {
        this._document.removeEventListener('wheel', this.preventDefault);
        this._document.removeEventListener('touchmove', this.preventDefault);
        this._document.removeEventListener('scroll', this.onScroll, true);
        this._sourceElement = null;
        this._initialScrollTop = 0;
        this._initialScrollLeft = 0;
        this._initialized = false;
    }

    private onScroll = (ev: Event) => {
        ev.preventDefault();
        if (!this._sourceElement || this._sourceElement !== ev.target) {
            this._sourceElement = ev.target as Element;
            this._initialScrollTop = this._sourceElement.scrollTop;
            this._initialScrollLeft = this._sourceElement.scrollLeft;
        }

        this._sourceElement.scrollTop = this._initialScrollTop;
        this._sourceElement.scrollLeft = this._initialScrollLeft;
    };

    private preventDefault = (ev: Event) => {
        ev.preventDefault();
    };
}
