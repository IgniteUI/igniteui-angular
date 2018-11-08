import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export abstract class ScrollStrategy implements IScrollStrategy {
    constructor(scrollContainer?: HTMLElement) { }
    /** @inheritdoc */
    abstract initialize(document: Document, overlayService: IgxOverlayService, id: string);

    /** @inheritdoc */
    abstract attach(): void;

    /** @inheritdoc */
    abstract detach(): void;
}
