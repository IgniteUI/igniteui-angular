import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class BlockScrollStrategy implements IScrollStrategy {
    private _initialized = false;
    private _document: Document;
    private _scrollContainer: HTMLElement;
    private initialScrollTop: number;
    private initialScrollLeft: number;
    constructor(scrollContainer?: HTMLElement) { }

    initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }

        this._document = document;
        this._initialized = true;
    }

    public attach() {
        this._scrollContainer = this._document.documentElement.scrollHeight > this._document.body.scrollHeight ?
            this._document.documentElement :
            this._document.body;

        this.initialScrollTop = this._scrollContainer.scrollTop;
        this.initialScrollLeft = this._scrollContainer.scrollLeft;
        this._document.addEventListener('scroll', this.onScroll);
    }

    public detach() {
        this._document.removeEventListener('scroll', this.onScroll);
    }

    private onScroll = (ev) => {
        this._scrollContainer.scrollTop = this.initialScrollTop;
        this._scrollContainer.scrollLeft = this.initialScrollLeft;
    }
}
