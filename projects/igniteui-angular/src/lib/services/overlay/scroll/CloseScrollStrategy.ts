import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class CloseScrollStrategy implements IScrollStrategy {
    private _document: Document;
    private _overlayService: IgxOverlayService;
    private _id: string;
    private _scrollContainer: HTMLElement;
    private initialScrollTop: number;
    private initialScrollLeft: number;
    private cumulativeScrollTop: number;
    private cumulativeScrollLeft: number;
    private _threshold: number;
    private _initialized = false;

    constructor(scrollContainer?: HTMLElement) {
        this._scrollContainer = scrollContainer;
        this._threshold = 10;
        this.cumulativeScrollTop = 0;
        this.cumulativeScrollLeft = 0;
    }

    initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }
        this._overlayService = overlayService;
        this._id = id;
        this._document = document;
        if (!this._scrollContainer) {
            this._scrollContainer = this._document.documentElement.scrollHeight > this._document.body.scrollHeight ?
                this._document.documentElement :
                this._document.body;
        }
        this._initialized = true;
    }

    attach(): void {
        this.initialScrollTop = this._scrollContainer.scrollTop;
        this.initialScrollLeft = this._scrollContainer.scrollLeft;
        this._scrollContainer.addEventListener('scroll', this.onScroll, true);
    }

    detach(): void {
        // TODO: check why event listener removes only on first call and remains on each next!!!
        this._scrollContainer.removeEventListener('scroll', this.onScroll, true);
    }

    private onScroll = (ev: Event) => {
        this.cumulativeScrollTop += this._scrollContainer.scrollTop;
        this.cumulativeScrollLeft += this._scrollContainer.scrollLeft;

        if (Math.abs(this.cumulativeScrollTop - this.initialScrollTop) > this._threshold ||
            Math.abs(this.cumulativeScrollLeft - this.initialScrollLeft) > this._threshold) {
            this._overlayService.hide(this._id);
            this._scrollContainer.removeEventListener('scroll', this.onScroll, true);
        }
    }
}
