import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class CloseScrollStrategy implements IScrollStrategy {
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

    constructor(scrollContainer?: HTMLElement) {
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
        this._initialized = true;
    }

    attach(): void {
        this._document.addEventListener('scroll', this.onScroll, true);
    }

    detach(): void {
        // TODO: check why event listener removes only on first call and remains on each next!!!
        this._document.removeEventListener('scroll', this.onScroll, true);
        this._sourceElement = null;
        this.cumulativeScrollTop = 0;
        this.cumulativeScrollLeft = 0;
        this.initialScrollTop = 0;
        this.initialScrollLeft = 0;
        this._initialized = false;
    }

    private onScroll = (ev: Event) => {
        if (!this._sourceElement || this._sourceElement !== ev.srcElement) {
            this._sourceElement = ev.srcElement;
            this.cumulativeScrollTop = 0;
            this.cumulativeScrollLeft = 0;
            this.initialScrollTop = this._sourceElement.scrollTop;
            this.initialScrollLeft = this._sourceElement.scrollLeft;
        }

        this.cumulativeScrollTop += this._sourceElement.scrollTop;
        this.cumulativeScrollLeft += this._sourceElement.scrollLeft;

        if (Math.abs(this.cumulativeScrollTop - this.initialScrollTop) > this._threshold ||
            Math.abs(this.cumulativeScrollLeft - this.initialScrollLeft) > this._threshold) {
            this._document.removeEventListener('scroll', this.onScroll, true);
            this._overlayService.hide(this._id);
        }
    }
}
