import { ScrollStrategy } from './scroll-strategy';

/**
 * Empty scroll strategy. Does nothing.
 */
export class NoOpScrollStrategy extends ScrollStrategy {
    constructor() {
        super();
    }
    /** @inheritdoc */
    public initialize() { }

    /** @inheritdoc */
    public attach(): void { }

    /** @inheritdoc */
    public detach(): void { }
}
