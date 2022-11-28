import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export abstract class ScrollStrategy implements IScrollStrategy {
    constructor() { }
    /** @inheritDoc */
    public abstract initialize(document: Document, overlayService: IgxOverlayService, id: string);

    /** @inheritDoc */
    public abstract attach(): void;

    /** @inheritDoc */
    public abstract detach(): void;
}
