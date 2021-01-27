import { IgxOverlayService } from '../overlay';
import { ScrollStrategy } from './scroll-strategy';

/**
 * Uses a tolerance and closes the shown component upon scrolling if the tolerance is exceeded
 */
export class CloseScrollStrategy extends ScrollStrategy {
    private _document: Document;
    private _overlayService: IgxOverlayService;
    private _id: string;
    private initialScrollTop: number;
    private initialScrollLeft: number;
    private cumulativeScrollTop: number;
    private cumulativeScrollLeft: number;
    private _threshold: number;
    private _initialized = false;
    private _sourceElement: Element;
    private _scrollContainer: HTMLElement;

    constructor(scrollContainer?: HTMLElement) {
        super();
        this._scrollContainer = scrollContainer;
        this._threshold = 10;
        this.cumulativeScrollTop = 0;
        this.cumulativeScrollLeft = 0;
    }

    /** @inheritdoc */
    public initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }
        this._overlayService = overlayService;
        this._id = id;
        this._document = document;
        this._initialized = true;
    }

    /** @inheritdoc */
    public attach(): void {
        if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this.onScroll);
            this._sourceElement = this._scrollContainer;
        } else {
            this._document.addEventListener('scroll', this.onScroll);
            if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
                this._sourceElement = document.documentElement as Element;
            } else if (document.body.scrollHeight > document.body.clientHeight) {
                this._sourceElement = document.body as Element;
            }
        }

        if (!this._sourceElement) {
            return;
        }

        this.cumulativeScrollTop = 0;
        this.cumulativeScrollLeft = 0;
        this.initialScrollTop = this._sourceElement.scrollTop;
        this.initialScrollLeft = this._sourceElement.scrollLeft;
    }

    /** @inheritdoc */
    public detach(): void {
        // TODO: check why event listener removes only on first call and remains on each next!!!
        if (this._scrollContainer) {
            this._scrollContainer.removeEventListener('scroll', this.onScroll);
        } else {
            this._document.removeEventListener('scroll', this.onScroll);
        }
        this._sourceElement = null;
        this.cumulativeScrollTop = 0;
        this.cumulativeScrollLeft = 0;
        this.initialScrollTop = 0;
        this.initialScrollLeft = 0;
        this._initialized = false;
    }

    private onScroll = () => {
        if (!this._sourceElement) {
            return;
        }

        this.cumulativeScrollTop += this._sourceElement.scrollTop;
        this.cumulativeScrollLeft += this._sourceElement.scrollLeft;

        if (Math.abs(this.cumulativeScrollTop - this.initialScrollTop) > this._threshold ||
            Math.abs(this.cumulativeScrollLeft - this.initialScrollLeft) > this._threshold) {
            this._document.removeEventListener('scroll', this.onScroll, true);
            this._overlayService.hide(this._id);
        }
    };
}
