import { Type } from '../type';
import { InjectorType } from './defs';
import { InjectionToken } from './injection_token';
import { InjectFlags, Injector } from './injector';
/**
 * Create a new `Injector` which is configured using `InjectorType`s.
 *
 * @experimental
 */
export declare function createInjector(defType: any, parent?: Injector | null): Injector;
export declare class R3Injector {
    readonly parent: Injector;
    /**
     * Map of tokens to records which contain the instances of those tokens.
     */
    private records;
    /**
     * The transitive set of `InjectorType`s which define this injector.
     */
    private injectorDefTypes;
    /**
     * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
     */
    private onDestroy;
    /**
     * Flag indicating this injector provides the APP_ROOT_SCOPE token, and thus counts as the
     * root scope.
     */
    private readonly isRootInjector;
    /**
     * Flag indicating that this injector was previously destroyed.
     */
    private destroyed;
    constructor(def: InjectorType<any>, parent: Injector);
    /**
     * Destroy the injector and release references to every instance or provider associated with it.
     *
     * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
     * hook was found.
     */
    destroy(): void;
    get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: any, flags?: InjectFlags): T;
    private assertNotDestroyed();
    /**
     * Add an `InjectorType` or `InjectorDefTypeWithProviders` and all of its transitive providers
     * to this injector.
     */
    private processInjectorType(defOrWrappedDef, parents);
    /**
     * Process a `SingleProvider` and add it.
     */
    private processProvider(provider);
    private hydrate<T>(token, record);
    private injectableDefInScope(def);
}
