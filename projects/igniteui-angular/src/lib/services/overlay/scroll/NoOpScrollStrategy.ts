import { ScrollStrategy } from './scroll-strategy';

/**
 * Empty scroll strategy. Does nothing.
 */
export class NoOpScrollStrategy extends ScrollStrategy {
    constructor() {
        super();
    }
    /** @inheritDoc */
    public initialize() { }

    /** @inheritDoc */
    public attach(): void { }

    /** @inheritDoc */
    public detach(): void { }
}
