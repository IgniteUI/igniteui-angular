export { AsyncTestCompleter } from './async_test_completer';
export { inject } from './test_bed';
export * from './logger';
export * from './ng_zone_mock';
export declare const proxy: ClassDecorator;
export declare const afterEach: Function;
export declare const expect: (actual: any) => jasmine.Matchers;
export declare function describe(...args: any[]): void;
export declare function ddescribe(...args: any[]): void;
export declare function xdescribe(...args: any[]): void;
export declare function beforeEach(fn: Function): void;
/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     {provide: Compiler, useClass: MockCompiler},
 *     {provide: SomeToken, useValue: myValue},
 *   ]);
 */
export declare function beforeEachProviders(fn: Function): void;
export declare function it(name: any, fn: any, timeOut?: any): void;
export declare function xit(name: any, fn: any, timeOut?: any): void;
export declare function iit(name: any, fn: any, timeOut?: any): void;
export declare class SpyObject {
    constructor(type?: any);
    spy(name: string): any;
    prop(name: string, value: any): void;
    static stub(object?: any, config?: any, overrides?: any): any;
}
