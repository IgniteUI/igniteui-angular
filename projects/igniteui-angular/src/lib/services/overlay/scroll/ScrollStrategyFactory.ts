import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BlockScrollStrategy, NoOpScrollStrategy, CloseScrollStrategy } from './index';
import { IgxOverlayService } from '../overlay';

@Injectable({ providedIn: 'root' })
export class ScrollStrategyFactory {
    constructor(
        @Inject(DOCUMENT) private _document,
        @Inject(IgxOverlayService) private _overlay: IgxOverlayService) { }

    block(): BlockScrollStrategy {
        const block: BlockScrollStrategy = new BlockScrollStrategy(this._document);
        return block;
    }

    noOp(): NoOpScrollStrategy {
        const noOp: NoOpScrollStrategy = new NoOpScrollStrategy();
        return noOp;
    }

    close(id: string): CloseScrollStrategy {
        const close: CloseScrollStrategy = new CloseScrollStrategy(this._document, this._overlay, id);
        return close;
    }
}
