import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export abstract class ScrollStrategy implements IScrollStrategy {
    constructor() { }
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
    public abstract initialize(document: Document, overlayService: IgxOverlayService, id: string);

    /**
     * Attaches the strategy
     * ```typescript
     * settings.scrollStrategy.attach();
     * ```
     */
    public abstract attach(): void;

    /**
     * Detaches the strategy
     * ```typescript
     * settings.scrollStrategy.detach();
     * ```
     */
    public abstract detach(): void;
}
