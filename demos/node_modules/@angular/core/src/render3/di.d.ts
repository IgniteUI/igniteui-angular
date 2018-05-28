/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef as viewEngine_ChangeDetectorRef } from '../change_detection/change_detector_ref';
import { InjectFlags } from '../di/injector';
import { ElementRef as viewEngine_ElementRef } from '../linker/element_ref';
import { TemplateRef as viewEngine_TemplateRef } from '../linker/template_ref';
import { ViewContainerRef as viewEngine_ViewContainerRef } from '../linker/view_container_ref';
import { Type } from '../type';
import { DirectiveDef } from './interfaces/definition';
import { LInjector } from './interfaces/injector';
import { LContainerNode, LElementNode, LNode } from './interfaces/node';
import { QueryReadType } from './interfaces/query';
/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injector The node injector in which the directive should be registered
 * @param type The directive to register
 */
export declare function bloomAdd(injector: LInjector, type: Type<any>): void;
export declare function getOrCreateNodeInjector(): LInjector;
/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param node for which an injector should be retrieved / created.
 * @returns Node injector
 */
export declare function getOrCreateNodeInjectorForNode(node: LElementNode | LContainerNode): LInjector;
/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param def The definition of the directive to be made public
 */
export declare function diPublicInInjector(di: LInjector, def: DirectiveDef<any>): void;
/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param def The definition of the directive to be made public
 */
export declare function diPublic(def: DirectiveDef<any>): void;
/**
 * Searches for an instance of the given type up the injector tree and returns
 * that instance if found.
 *
 * If not found, it will propagate up to the next parent injector until the token
 * is found or the top is reached.
 *
 * Usage example (in factory function):
 *
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = defineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(directiveInject(DirectiveA))
 *   });
 * }
 *
 * NOTE: use `directiveInject` with `@Directive`, `@Component`, and `@Pipe`. For
 * all other injection use `inject` which does not walk the DOM render tree.
 *
 * @param token The directive type to search for
 * @param flags Injection flags (e.g. CheckParent)
 * @returns The instance found
 */
export declare function directiveInject<T>(token: Type<T>): T;
export declare function directiveInject<T>(token: Type<T>, flags?: InjectFlags): T | null;
/**
 * Creates an ElementRef and stores it on the injector.
 * Or, if the ElementRef already exists, retrieves the existing ElementRef.
 *
 * @returns The ElementRef instance to use
 */
export declare function injectElementRef(): viewEngine_ElementRef;
/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @returns The TemplateRef instance to use
 */
export declare function injectTemplateRef<T>(): viewEngine_TemplateRef<T>;
/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export declare function injectViewContainerRef(): viewEngine_ViewContainerRef;
/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export declare function injectChangeDetectorRef(): viewEngine_ChangeDetectorRef;
/**
 * Inject static attribute value into directive constructor.
 *
 * This method is used with `factory` functions which are generated as part of
 * `defineDirective` or `defineComponent`. The method retrieves the static value
 * of an attribute. (Dynamic attributes are not supported since they are not resolved
 *  at the time of injection and can change over time.)
 *
 * # Example
 * Given:
 * ```
 * @Component(...)
 * class MyComponent {
 *   constructor(@Attribute('title') title: string) { ... }
 * }
 * ```
 * When instantiated with
 * ```
 * <my-component title="Hello"></my-component>
 * ```
 *
 * Then factory method generated is:
 * ```
 * MyComponent.ngComponentDef = defineComponent({
 *   factory: () => new MyComponent(injectAttribute('title'))
 *   ...
 * })
 * ```
 *
 * @experimental
 */
export declare function injectAttribute(attrName: string): string | undefined;
/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 * Or, if it already exists, retrieves the existing instance.
 *
 * @returns The ChangeDetectorRef to use
 */
export declare function getOrCreateChangeDetectorRef(di: LInjector, context: any): viewEngine_ChangeDetectorRef;
/**
 * Searches for an instance of the given directive type up the injector tree and returns
 * that instance if found.
 *
 * Specifically, it gets the bloom filter bit associated with the directive (see bloomHashBit),
 * checks that bit against the bloom filter structure to identify an injector that might have
 * the directive (see bloomFindPossibleInjector), then searches the directives on that injector
 * for a match.
 *
 * If not found, it will propagate up to the next parent injector until the token
 * is found or the top is reached.
 *
 * @param di Node injector where the search should start
 * @param token The directive type to search for
 * @param flags Injection flags (e.g. CheckParent)
 * @returns The instance found
 */
export declare function getOrCreateInjectable<T>(di: LInjector, token: Type<T>, flags?: InjectFlags): T | null;
/**
 * Finds the closest injector that might have a certain directive.
 *
 * Each directive corresponds to a bit in an injector's bloom filter. Given the bloom bit to
 * check and a starting injector, this function traverses up injectors until it finds an
 * injector that contains a 1 for that bit in its bloom filter. A 1 indicates that the
 * injector may have that directive. It only *may* have the directive because directives begin
 * to share bloom filter bits after the BLOOM_SIZE is reached, and it could correspond to a
 * different directive sharing the bit.
 *
 * Note: We can skip checking further injectors up the tree if an injector's cbf structure
 * has a 0 for that bloom bit. Since cbf contains the merged value of all the parent
 * injectors, a 0 in the bloom bit indicates that the parents definitely do not contain
 * the directive and do not need to be checked.
 *
 * @param injector The starting node injector to check
 * @param  bloomBit The bit to check in each injector's bloom filter
 * @returns An injector that might have the directive
 */
export declare function bloomFindPossibleInjector(startInjector: LInjector, bloomBit: number): LInjector | null;
export declare class ReadFromInjectorFn<T> {
    readonly read: (injector: LInjector, node: LNode, directiveIndex?: number) => T;
    constructor(read: (injector: LInjector, node: LNode, directiveIndex?: number) => T);
}
/**
 * Creates an ElementRef for a given node injector and stores it on the injector.
 * Or, if the ElementRef already exists, retrieves the existing ElementRef.
 *
 * @param di The node injector where we should store a created ElementRef
 * @returns The ElementRef instance to use
 */
export declare function getOrCreateElementRef(di: LInjector): viewEngine_ElementRef;
export declare const QUERY_READ_TEMPLATE_REF: QueryReadType<viewEngine_TemplateRef<any>>;
export declare const QUERY_READ_CONTAINER_REF: QueryReadType<viewEngine_ViewContainerRef>;
export declare const QUERY_READ_ELEMENT_REF: QueryReadType<viewEngine_ElementRef<any>>;
export declare const QUERY_READ_FROM_NODE: QueryReadType<any>;
/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export declare function getOrCreateContainerRef(di: LInjector): viewEngine_ViewContainerRef;
/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @param di The node injector where we should store a created TemplateRef
 * @returns The TemplateRef instance to use
 */
export declare function getOrCreateTemplateRef<T>(di: LInjector): viewEngine_TemplateRef<T>;
