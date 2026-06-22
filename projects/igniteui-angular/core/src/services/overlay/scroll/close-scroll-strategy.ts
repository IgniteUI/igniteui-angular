import { IgxOverlayService } from '../overlay';
import { OverlayInfo } from '../utilities';
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
    private _threshold: number;
    private _initialized = false;
    private _sourceElement: Element;
    private _scrollContainer: HTMLElement;
    private _overlayInfo: OverlayInfo;

    constructor(scrollContainer?: HTMLElement) {
        super();
        this._scrollContainer = scrollContainer;
        this._threshold = 10;
    }

    /**
     * Initializes the strategy. Should be called once
     *
     * @param document reference to Document object.
     * @param overlayService IgxOverlay service to use in this strategy.
     * @param id Unique id for this strategy.
     * ```typescript
     * settings.scrollStrategy.initialize(document, overlay, id);
     * ```
     */
    public initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }
        this._overlayService = overlayService;
        this._id = id;
        this._document = document;
        this._initialized = true;
        this._overlayInfo = overlayService.getOverlayById(id);
    }

    /**
     * Attaches the strategy
     * ```typescript
     * settings.scrollStrategy.attach();
     * ```
     */
    public attach(): void {
        if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this.onScroll);
            this._sourceElement = this._scrollContainer;
        } else {
            this._document.addEventListener('scroll', this.onScroll, true);
        }
    }

    /**
     * Detaches the strategy
     * ```typescript
     * settings.scrollStrategy.detach();
     * ```
     */
    public detach(): void {
        // TODO: check why event listener removes only on first call and remains on each next!!!
        if (this._scrollContainer) {
            this._scrollContainer.removeEventListener('scroll', this.onScroll);
        } else {
            this._document.removeEventListener('scroll', this.onScroll, true);
        }
        this._sourceElement = null;
        this._initialized = false;
    }

    private onScroll = (ev: Event) => {
        if (!this._sourceElement) {
            this._sourceElement = ev.target as any;
            this.initialScrollTop = this._sourceElement.scrollTop;
            this.initialScrollLeft = this._sourceElement.scrollLeft;
        }

        if (this._overlayInfo.elementRef.nativeElement.contains(this._sourceElement)) {
            return;
        }
        if (Math.abs(this._sourceElement.scrollTop - this.initialScrollTop) > this._threshold ||
            Math.abs(this._sourceElement.scrollLeft - this.initialScrollLeft) > this._threshold) {
            this._overlayService.hide(this._id);
        }
    };
}
