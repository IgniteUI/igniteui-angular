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

    /** @inheritdoc */
    public initialize(document: Document) {
        if (this._initialized) {
            return;
        }

        this._document = document;
        this._initialized = true;
    }

    /** @inheritdoc */
    public attach(): void {
        this._document.addEventListener('scroll', this.onScroll, true);
    }

    /** @inheritdoc */
    public detach(): void {
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
}
