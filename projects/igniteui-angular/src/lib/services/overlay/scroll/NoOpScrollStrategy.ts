import { ScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class NoOpScrollStrategy extends ScrollStrategy {
    constructor(scrollContainer?: HTMLElement) {
        super(scrollContainer);
    }
    /** @inheritdoc */
    public initialize(document: Document, overlayService: IgxOverlayService, id: string) { }

    /** @inheritdoc */
    attach(): void { }

    /** @inheritdoc */
    detach(): void { }
}
