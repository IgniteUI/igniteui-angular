import { Type } from '../type';
import { InjectableDef } from './defs';
import { ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueSansProvider } from './provider';
/**
 * Injectable providers used in `@Injectable` decorator.
 *
 * @experimental
 */
export declare type InjectableProvider = ValueSansProvider | ExistingSansProvider | StaticClassSansProvider | ConstructorSansProvider | FactorySansProvider | ClassSansProvider;
/**
 * Type of the Injectable decorator / constructor function.
 *
 *
 */
export interface InjectableDecorator {
    /**
     * @usageNotes
     * ```
     * @Injectable()
     * class Car {}
     * ```
     *
     * @description
     * A marker metadata that marks a class as available to {@link Injector} for creation.
     *
     * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
     *
     * ### Example
     *
     * {@example core/di/ts/metadata_spec.ts region='Injectable'}
     *
     * {@link Injector} will throw an error when trying to instantiate a class that
     * does not have `@Injectable` marker, as shown in the example below.
     *
     * {@example core/di/ts/metadata_spec.ts region='InjectableThrows'}
     *
     *
     */
    (): any;
    (options?: {
        providedIn: Type<any> | 'root' | null;
    } & InjectableProvider): any;
    new (): Injectable;
    new (options?: {
        providedIn: Type<any> | 'root' | null;
    } & InjectableProvider): Injectable;
}
/**
 * Type of the Injectable metadata.
 *
 * @experimental
 */
export interface Injectable {
    providedIn?: Type<any> | 'root' | null;
    factory: () => any;
}
export declare function convertInjectableProviderToFactory(type: Type<any>, provider?: InjectableProvider): () => any;
/**
* Injectable decorator and metadata.
*
*
* @Annotation
*/
export declare const Injectable: InjectableDecorator;
/**
 * Type representing injectable service.
 *
 * @experimental
 */
export interface InjectableType<T> extends Type<T> {
    ngInjectableDef: InjectableDef<T>;
}
