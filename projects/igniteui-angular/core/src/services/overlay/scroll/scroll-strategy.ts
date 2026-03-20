import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export abstract class ScrollStrategy implements IScrollStrategy {
    /**
     * Initializes the strategy. Should be called once
     *
     * @param document reference to Document object.
     * @param overlayService IgxOverlay service to use in this strategy.
     * @param id Unique id for this strategy.
     */
    public abstract initialize(document: Document, overlayService: IgxOverlayService, id: string);

    /**
     * Attaches the strategy
     */
    public abstract attach(): void;

    /**
     * Detaches the strategy
     */
    public abstract detach(): void;
}
