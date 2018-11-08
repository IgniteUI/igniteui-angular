import { IgxOverlayService } from '../overlay';
/**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay_scroll.html).
 * Scroll strategies determines how the scrolling will be handled in the provided IgxOverlayService.
 */
export interface IScrollStrategy {
    /**
     * Initializes the strategy. Should be called once
     * @param document reference to Document object.
     * @param overlayService IgxOverlay service to use in this strategy
     * @param id Unique id for this strategy.
     * ```typescript
     * settings.scrollStrategy.initialize(document, overlay, id);
     * ```
     */
     initialize(document: Document, overlayService: IgxOverlayService, id: string);

    /**
     * Attaches the strategy
     * ```typescript
     * settings.scrollStrategy.attach();
     * ```
     */
    attach(): void;

    /**
     * Detaches the strategy
     * ```typescript
     * settings.scrollStrategy.detach();
     * ```
     */
    detach(): void;
}
