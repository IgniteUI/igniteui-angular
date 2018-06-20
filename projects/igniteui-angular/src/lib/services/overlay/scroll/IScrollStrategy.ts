import { IgxOverlayService } from '../overlay';

export class IScrollStrategy {
    constructor(scrollContainer?: HTMLElement) { }
    initialize(document: Document, overlayService: IgxOverlayService, id: string) { }
    attach(): void { }
    detach(): void { }
}
