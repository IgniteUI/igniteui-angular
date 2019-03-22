import { IgxOverlayService } from '../overlay';
import { ScrollStrategy } from './scroll-strategy';
import { NgZone } from '@angular/core';

/**
 * On scroll reposition the overlay content.
 */
export class AbsoluteScrollStrategy extends ScrollStrategy {
    private _initialized = false;
    private _document: Document;
    private _overlayService: IgxOverlayService;
    private _id: string;
    private _scrollContainer: HTMLElement;
    private _zone: NgZone;

    constructor(scrollContainer?: HTMLElement) {
        super(scrollContainer);
        this._scrollContainer = scrollContainer;
    }

    /** @inheritdoc */
    public initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }
        this._overlayService = overlayService;
        this._id = id;
        this._document = document;
        this._zone = overlayService.getOverlayById(id).ngZone;
        this._initialized = true;
    }

    /** @inheritdoc */
    public attach(): void {
        if (this._zone) {
            this._zone.runOutsideAngular(() => {
                this.addScrollEventListener();
            });
        } else {
            this.addScrollEventListener();
        }
    }

    /** @inheritdoc */
    public detach(): void {
        if (this._scrollContainer) {
            this._scrollContainer.removeEventListener('scroll', this.onScroll, true);
        } else {
            this._document.removeEventListener('scroll', this.onScroll, true);
        }

        this._initialized = false;
    }

    private addScrollEventListener() {
        if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this.onScroll, true);
        } else {
            this._document.addEventListener('scroll', this.onScroll, true);
        }
    }

    private onScroll = () => {
        this._overlayService.repositionAll();
    }
}
