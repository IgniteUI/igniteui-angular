/**
 * Jasmine matchers that check Angular specific conditions.
 */
export interface NgMatchers extends jasmine.Matchers {
    /**
     * Expect the value to be a `Promise`.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toBePromise'}
     */
    toBePromise(): boolean;
    /**
     * Expect the value to be an instance of a class.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toBeAnInstanceOf'}
     */
    toBeAnInstanceOf(expected: any): boolean;
    /**
     * Expect the element to have exactly the given text.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toHaveText'}
     */
    toHaveText(expected: string): boolean;
    /**
     * Expect the element to have the given CSS class.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toHaveCssClass'}
     */
    toHaveCssClass(expected: string): boolean;
    /**
     * Expect the element to have the given CSS styles.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toHaveCssStyle'}
     */
    toHaveCssStyle(expected: {
        [k: string]: string;
    } | string): boolean;
    /**
     * Expect a class to implement the interface of the given class.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toImplement'}
     */
    toImplement(expected: any): boolean;
    /**
     * Expect an exception to contain the given error text.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toContainError'}
     */
    toContainError(expected: any): boolean;
    /**
     * Invert the matchers.
     */
    not: NgMatchers;
}
/**
 * Jasmine matching function with Angular matchers mixed in.
 *
 * ## Example
 *
 * {@example testing/ts/matchers.ts region='toHaveText'}
 */
export declare const expect: (actual: any) => NgMatchers;
