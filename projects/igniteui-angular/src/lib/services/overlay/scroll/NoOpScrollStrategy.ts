import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';

export class NoOpScrollStrategy implements IScrollStrategy {
    constructor(scrollContainer?: HTMLElement) { }
    initialize(document: Document, overlayService: IgxOverlayService, id: string) {}
    attach(): void { }
    detach(): void { }
}
