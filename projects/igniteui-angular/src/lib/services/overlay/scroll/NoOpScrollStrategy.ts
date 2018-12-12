import { IgxOverlayService } from '../overlay';
import { ScrollStrategy } from './scroll-strategy';

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
