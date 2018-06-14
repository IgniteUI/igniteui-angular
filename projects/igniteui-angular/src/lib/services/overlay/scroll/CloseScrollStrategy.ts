import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class CloseScrollStrategy implements IScrollStrategy {
    private initialScrollTop: number;
    private initialScrollLeft: number;
    private cumulativeScrollTop: number;
    private cumulativeScrollLeft: number;
    private _threshold: number;

    constructor(private document: Document, private _overlayService: IgxOverlayService, private _id: string) {
        this._threshold = 10;
        this.cumulativeScrollTop = 0;
        this.cumulativeScrollLeft = 0;
    }

    attach(): void {
        this.initialScrollTop = this.document.scrollingElement.scrollTop;
        this.initialScrollLeft = this.document.scrollingElement.scrollLeft;
        this.document.addEventListener('scroll', this.onScroll);
    }

    detach(): void {
        this.document.removeEventListener('scroll', this.onScroll);
    }

    private onScroll = (ev) => {
        this.cumulativeScrollTop += ev.target.scrollingElement.scrollTop;
        this.cumulativeScrollLeft += ev.target.scrollingElement.scrollLeft;

        if (Math.abs(this.cumulativeScrollTop - this.initialScrollTop) > this._threshold ||
            Math.abs(this.cumulativeScrollLeft - this.initialScrollLeft) > this._threshold) {
                this._overlayService.hide(this._id);
        }
    }
}
