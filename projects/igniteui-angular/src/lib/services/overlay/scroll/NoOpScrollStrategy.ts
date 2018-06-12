import { IScrollStrategy } from './IScrollStrategy';

export class NoOpScrollStrategy implements IScrollStrategy {
    attach(): void { }
    detach(): void { }
}
