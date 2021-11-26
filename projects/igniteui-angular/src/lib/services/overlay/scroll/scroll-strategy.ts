import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export abstract class ScrollStrategy implements IScrollStrategy {
    constructor() { }
    /** @inheritdoc */
    public abstract initialize(document: Document, overlayService: IgxOverlayService, id: string);

    /** @inheritdoc */
    public abstract attach(): void;

    /** @inheritdoc */
    public abstract detach(): void;
}
