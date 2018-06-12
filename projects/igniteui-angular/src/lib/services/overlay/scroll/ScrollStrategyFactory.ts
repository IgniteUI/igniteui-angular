import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BlockScrollStrategy } from './BlockScrollStrategy';
import { NoOpScrollStrategy } from './NoOpScrollStrategy';

@Injectable({ providedIn: 'root' })
export class ScrollStrategyFactory {
    constructor(@Inject(DOCUMENT) private _document) { }

    block(): BlockScrollStrategy {
        const block: BlockScrollStrategy = new BlockScrollStrategy(this._document);
        return block;
    }

    noOp(): NoOpScrollStrategy {
        const noOp: NoOpScrollStrategy = new NoOpScrollStrategy();
        return noOp;
    }
}
