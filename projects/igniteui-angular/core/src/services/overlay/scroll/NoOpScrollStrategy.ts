import { ScrollStrategy } from './scroll-strategy';

/**
 * Empty scroll strategy. Does nothing.
 */
export class NoOpScrollStrategy extends ScrollStrategy {
    constructor() {
        super();
    }
    /**
     * Initializes the strategy. Should be called once
     */
    public initialize() { }

    /**
     * Detaches the strategy
     */
    public attach(): void { }

    /**
     * Detaches the strategy
     */
    public detach(): void { }
}
