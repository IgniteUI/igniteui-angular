/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ChangeDetectorRef, SimpleChange, WrappedValue } from '../change_detection/change_detection';
import { INJECTOR, Injector, resolveForwardRef } from '../di';
import { ElementRef } from '../linker/element_ref';
import { TemplateRef } from '../linker/template_ref';
import { ViewContainerRef } from '../linker/view_container_ref';
import { Renderer as RendererV1, Renderer2 } from '../render/api';
import { stringify } from '../util';
import { createChangeDetectorRef, createInjector, createRendererV1 } from './refs';
import { Services, asElementData, asProviderData, shouldCallLifecycleInitHook } from './types';
import { calcBindingFlags, checkBinding, dispatchEvent, isComponentView, splitDepsDsl, splitMatchedQueriesDsl, tokenKey, viewParentEl } from './util';
var RendererV1TokenKey = tokenKey(RendererV1);
var Renderer2TokenKey = tokenKey(Renderer2);
var ElementRefTokenKey = tokenKey(ElementRef);
var ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
var TemplateRefTokenKey = tokenKey(TemplateRef);
var ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
var InjectorRefTokenKey = tokenKey(Injector);
var INJECTORRefTokenKey = tokenKey(INJECTOR);
export function directiveDef(checkIndex, flags, matchedQueries, childCount, ctor, deps, props, outputs) {
    var bindings = [];
    if (props) {
        for (var prop in props) {
            var _a = tslib_1.__read(props[prop], 2), bindingIndex = _a[0], nonMinifiedName = _a[1];
            bindings[bindingIndex] = {
                flags: 8 /* TypeProperty */,
                name: prop, nonMinifiedName: nonMinifiedName,
                ns: null,
                securityContext: null,
                suffix: null
            };
        }
    }
    var outputDefs = [];
    if (outputs) {
        for (var propName in outputs) {
            outputDefs.push({ type: 1 /* DirectiveOutput */, propName: propName, target: null, eventName: outputs[propName] });
        }
    }
    flags |= 16384 /* TypeDirective */;
    return _def(checkIndex, flags, matchedQueries, childCount, ctor, ctor, deps, bindings, outputDefs);
}
export function pipeDef(flags, ctor, deps) {
    flags |= 16 /* TypePipe */;
    return _def(-1, flags, null, 0, ctor, ctor, deps);
}
export function providerDef(flags, matchedQueries, token, value, deps) {
    return _def(-1, flags, matchedQueries, 0, token, value, deps);
}
export function _def(checkIndex, flags, matchedQueriesDsl, childCount, token, value, deps, bindings, outputs) {
    var _a = splitMatchedQueriesDsl(matchedQueriesDsl), matchedQueries = _a.matchedQueries, references = _a.references, matchedQueryIds = _a.matchedQueryIds;
    if (!outputs) {
        outputs = [];
    }
    if (!bindings) {
        bindings = [];
    }
    // Need to resolve forwardRefs as e.g. for `useValue` we
    // lowered the expression and then stopped evaluating it,
    // i.e. also didn't unwrap it.
    value = resolveForwardRef(value);
    var depDefs = splitDepsDsl(deps, stringify(token));
    return {
        // will bet set by the view definition
        nodeIndex: -1,
        parent: null,
        renderParent: null,
        bindingIndex: -1,
        outputIndex: -1,
        // regular values
        checkIndex: checkIndex,
        flags: flags,
        childFlags: 0,
        directChildFlags: 0,
        childMatchedQueries: 0, matchedQueries: matchedQueries, matchedQueryIds: matchedQueryIds, references: references,
        ngContentIndex: -1, childCount: childCount, bindings: bindings,
        bindingFlags: calcBindingFlags(bindings), outputs: outputs,
        element: null,
        provider: { token: token, value: value, deps: depDefs },
        text: null,
        query: null,
        ngContent: null
    };
}
export function createProviderInstance(view, def) {
    return _createProviderInstance(view, def);
}
export function createPipeInstance(view, def) {
    // deps are looked up from component.
    var compView = view;
    while (compView.parent && !isComponentView(compView)) {
        compView = compView.parent;
    }
    // pipes can see the private services of the component
    var allowPrivateServices = true;
    // pipes are always eager and classes!
    return createClass((compView.parent), (viewParentEl(compView)), allowPrivateServices, def.provider.value, def.provider.deps);
}
export function createDirectiveInstance(view, def) {
    // components can see other private services, other directives can't.
    var allowPrivateServices = (def.flags & 32768 /* Component */) > 0;
    // directives are always eager and classes!
    var instance = createClass(view, (def.parent), allowPrivateServices, def.provider.value, def.provider.deps);
    if (def.outputs.length) {
        for (var i = 0; i < def.outputs.length; i++) {
            var output = def.outputs[i];
            var subscription = instance[output.propName].subscribe(eventHandlerClosure(view, def.parent.nodeIndex, output.eventName));
            view.disposables[def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
        }
    }
    return instance;
}
function eventHandlerClosure(view, index, eventName) {
    return function (event) { return dispatchEvent(view, index, eventName, event); };
}
export function checkAndUpdateDirectiveInline(view, def, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    var providerData = asProviderData(view, def.nodeIndex);
    var directive = providerData.instance;
    var changed = false;
    var changes = (undefined);
    var bindLen = def.bindings.length;
    if (bindLen > 0 && checkBinding(view, def, 0, v0)) {
        changed = true;
        changes = updateProp(view, providerData, def, 0, v0, changes);
    }
    if (bindLen > 1 && checkBinding(view, def, 1, v1)) {
        changed = true;
        changes = updateProp(view, providerData, def, 1, v1, changes);
    }
    if (bindLen > 2 && checkBinding(view, def, 2, v2)) {
        changed = true;
        changes = updateProp(view, providerData, def, 2, v2, changes);
    }
    if (bindLen > 3 && checkBinding(view, def, 3, v3)) {
        changed = true;
        changes = updateProp(view, providerData, def, 3, v3, changes);
    }
    if (bindLen > 4 && checkBinding(view, def, 4, v4)) {
        changed = true;
        changes = updateProp(view, providerData, def, 4, v4, changes);
    }
    if (bindLen > 5 && checkBinding(view, def, 5, v5)) {
        changed = true;
        changes = updateProp(view, providerData, def, 5, v5, changes);
    }
    if (bindLen > 6 && checkBinding(view, def, 6, v6)) {
        changed = true;
        changes = updateProp(view, providerData, def, 6, v6, changes);
    }
    if (bindLen > 7 && checkBinding(view, def, 7, v7)) {
        changed = true;
        changes = updateProp(view, providerData, def, 7, v7, changes);
    }
    if (bindLen > 8 && checkBinding(view, def, 8, v8)) {
        changed = true;
        changes = updateProp(view, providerData, def, 8, v8, changes);
    }
    if (bindLen > 9 && checkBinding(view, def, 9, v9)) {
        changed = true;
        changes = updateProp(view, providerData, def, 9, v9, changes);
    }
    if (changes) {
        directive.ngOnChanges(changes);
    }
    if ((def.flags & 65536 /* OnInit */) &&
        shouldCallLifecycleInitHook(view, 256 /* InitState_CallingOnInit */, def.nodeIndex)) {
        directive.ngOnInit();
    }
    if (def.flags & 262144 /* DoCheck */) {
        directive.ngDoCheck();
    }
    return changed;
}
export function checkAndUpdateDirectiveDynamic(view, def, values) {
    var providerData = asProviderData(view, def.nodeIndex);
    var directive = providerData.instance;
    var changed = false;
    var changes = (undefined);
    for (var i = 0; i < values.length; i++) {
        if (checkBinding(view, def, i, values[i])) {
            changed = true;
            changes = updateProp(view, providerData, def, i, values[i], changes);
        }
    }
    if (changes) {
        directive.ngOnChanges(changes);
    }
    if ((def.flags & 65536 /* OnInit */) &&
        shouldCallLifecycleInitHook(view, 256 /* InitState_CallingOnInit */, def.nodeIndex)) {
        directive.ngOnInit();
    }
    if (def.flags & 262144 /* DoCheck */) {
        directive.ngDoCheck();
    }
    return changed;
}
function _createProviderInstance(view, def) {
    // private services can see other private services
    var allowPrivateServices = (def.flags & 8192 /* PrivateProvider */) > 0;
    var providerDef = def.provider;
    switch (def.flags & 201347067 /* Types */) {
        case 512 /* TypeClassProvider */:
            return createClass(view, (def.parent), allowPrivateServices, providerDef.value, providerDef.deps);
        case 1024 /* TypeFactoryProvider */:
            return callFactory(view, (def.parent), allowPrivateServices, providerDef.value, providerDef.deps);
        case 2048 /* TypeUseExistingProvider */:
            return resolveDep(view, (def.parent), allowPrivateServices, providerDef.deps[0]);
        case 256 /* TypeValueProvider */:
            return providerDef.value;
    }
}
function createClass(view, elDef, allowPrivateServices, ctor, deps) {
    var len = deps.length;
    switch (len) {
        case 0:
            return new ctor();
        case 1:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]));
        case 2:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
        case 3:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
        default:
            var depValues = new Array(len);
            for (var i = 0; i < len; i++) {
                depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
            }
            return new (ctor.bind.apply(ctor, tslib_1.__spread([void 0], depValues)))();
    }
}
function callFactory(view, elDef, allowPrivateServices, factory, deps) {
    var len = deps.length;
    switch (len) {
        case 0:
            return factory();
        case 1:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]));
        case 2:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
        case 3:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
        default:
            var depValues = Array(len);
            for (var i = 0; i < len; i++) {
                depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
            }
            return factory.apply(void 0, tslib_1.__spread(depValues));
    }
}
// This default value is when checking the hierarchy for a token.
//
// It means both:
// - the token is not provided by the current injector,
// - only the element injectors should be checked (ie do not check module injectors
//
//          mod1
//         /
//       el1   mod2
//         \  /
//         el2
//
// When requesting el2.injector.get(token), we should check in the following order and return the
// first found value:
// - el2.injector.get(token, default)
// - el1.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) -> do not check the module
// - mod2.injector.get(token, default)
export var NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};
export function resolveDep(view, elDef, allowPrivateServices, depDef, notFoundValue) {
    if (notFoundValue === void 0) { notFoundValue = Injector.THROW_IF_NOT_FOUND; }
    if (depDef.flags & 8 /* Value */) {
        return depDef.token;
    }
    var startView = view;
    if (depDef.flags & 2 /* Optional */) {
        notFoundValue = null;
    }
    var tokenKey = depDef.tokenKey;
    if (tokenKey === ChangeDetectorRefTokenKey) {
        // directives on the same element as a component should be able to control the change detector
        // of that component as well.
        allowPrivateServices = !!(elDef && elDef.element.componentView);
    }
    if (elDef && (depDef.flags & 1 /* SkipSelf */)) {
        allowPrivateServices = false;
        elDef = (elDef.parent);
    }
    var searchView = view;
    while (searchView) {
        if (elDef) {
            switch (tokenKey) {
                case RendererV1TokenKey: {
                    var compView = findCompView(searchView, elDef, allowPrivateServices);
                    return createRendererV1(compView);
                }
                case Renderer2TokenKey: {
                    var compView = findCompView(searchView, elDef, allowPrivateServices);
                    return compView.renderer;
                }
                case ElementRefTokenKey:
                    return new ElementRef(asElementData(searchView, elDef.nodeIndex).renderElement);
                case ViewContainerRefTokenKey:
                    return asElementData(searchView, elDef.nodeIndex).viewContainer;
                case TemplateRefTokenKey: {
                    if (elDef.element.template) {
                        return asElementData(searchView, elDef.nodeIndex).template;
                    }
                    break;
                }
                case ChangeDetectorRefTokenKey: {
                    var cdView = findCompView(searchView, elDef, allowPrivateServices);
                    return createChangeDetectorRef(cdView);
                }
                case InjectorRefTokenKey:
                case INJECTORRefTokenKey:
                    return createInjector(searchView, elDef);
                default:
                    var providerDef_1 = (allowPrivateServices ? elDef.element.allProviders :
                        elDef.element.publicProviders)[tokenKey];
                    if (providerDef_1) {
                        var providerData = asProviderData(searchView, providerDef_1.nodeIndex);
                        if (!providerData) {
                            providerData = { instance: _createProviderInstance(searchView, providerDef_1) };
                            searchView.nodes[providerDef_1.nodeIndex] = providerData;
                        }
                        return providerData.instance;
                    }
            }
        }
        allowPrivateServices = isComponentView(searchView);
        elDef = (viewParentEl(searchView));
        searchView = (searchView.parent);
        if (depDef.flags & 4 /* Self */) {
            searchView = null;
        }
    }
    var value = startView.root.injector.get(depDef.token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR);
    if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
        notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
        // Return the value from the root element injector when
        // - it provides it
        //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        // - the module injector should not be checked
        //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        return value;
    }
    return startView.root.ngModule.injector.get(depDef.token, notFoundValue);
}
function findCompView(view, elDef, allowPrivateServices) {
    var compView;
    if (allowPrivateServices) {
        compView = asElementData(view, elDef.nodeIndex).componentView;
    }
    else {
        compView = view;
        while (compView.parent && !isComponentView(compView)) {
            compView = compView.parent;
        }
    }
    return compView;
}
function updateProp(view, providerData, def, bindingIdx, value, changes) {
    if (def.flags & 32768 /* Component */) {
        var compView = asElementData(view, def.parent.nodeIndex).componentView;
        if (compView.def.flags & 2 /* OnPush */) {
            compView.state |= 8 /* ChecksEnabled */;
        }
    }
    var binding = def.bindings[bindingIdx];
    var propName = (binding.name);
    // Note: This is still safe with Closure Compiler as
    // the user passed in the property name as an object has to `providerDef`,
    // so Closure Compiler will have renamed the property correctly already.
    providerData.instance[propName] = value;
    if (def.flags & 524288 /* OnChanges */) {
        changes = changes || {};
        var oldValue = WrappedValue.unwrap(view.oldValues[def.bindingIndex + bindingIdx]);
        var binding_1 = def.bindings[bindingIdx];
        changes[binding_1.nonMinifiedName] =
            new SimpleChange(oldValue, value, (view.state & 2 /* FirstCheck */) !== 0);
    }
    view.oldValues[def.bindingIndex + bindingIdx] = value;
    return changes;
}
// This function calls the ngAfterContentCheck, ngAfterContentInit,
// ngAfterViewCheck, and ngAfterViewInit lifecycle hooks (depending on the node
// flags in lifecycle). Unlike ngDoCheck, ngOnChanges and ngOnInit, which are
// called during a pre-order traversal of the view tree (that is calling the
// parent hooks before the child hooks) these events are sent in using a
// post-order traversal of the tree (children before parents). This changes the
// meaning of initIndex in the view state. For ngOnInit, initIndex tracks the
// expected nodeIndex which a ngOnInit should be called. When sending
// ngAfterContentInit and ngAfterViewInit it is the expected count of
// ngAfterContentInit or ngAfterViewInit methods that have been called. This
// ensure that despite being called recursively or after picking up after an
// exception, the ngAfterContentInit or ngAfterViewInit will be called on the
// correct nodes. Consider for example, the following (where E is an element
// and D is a directive)
//  Tree:       pre-order index  post-order index
//    E1        0                6
//      E2      1                1
//       D3     2                0
//      E4      3                5
//       E5     4                4
//        E6    5                2
//        E7    6                3
// As can be seen, the post-order index has an unclear relationship to the
// pre-order index (postOrderIndex === preOrderIndex - parentCount +
// childCount). Since number of calls to ngAfterContentInit and ngAfterViewInit
// are stable (will be the same for the same view regardless of exceptions or
// recursion) we just need to count them which will roughly correspond to the
// post-order index (it skips elements and directives that do not have
// lifecycle hooks).
//
// For example, if an exception is raised in the E6.onAfterViewInit() the
// initIndex is left at 3 (by shouldCallLifecycleInitHook() which set it to
// initIndex + 1). When checkAndUpdateView() is called again D3, E2 and E6 will
// not have their ngAfterViewInit() called but, starting with E7, the rest of
// the view will begin getting ngAfterViewInit() called until a check and
// pass is complete.
//
// This algorthim also handles recursion. Consider if E4's ngAfterViewInit()
// indirectly calls E1's ChangeDetectorRef.detectChanges(). The expected
// initIndex is set to 6, the recusive checkAndUpdateView() starts walk again.
// D3, E2, E6, E7, E5 and E4 are skipped, ngAfterViewInit() is called on E1.
// When the recursion returns the initIndex will be 7 so E1 is skipped as it
// has already been called in the recursively called checkAnUpdateView().
export function callLifecycleHooksChildrenFirst(view, lifecycles) {
    if (!(view.def.nodeFlags & lifecycles)) {
        return;
    }
    var nodes = view.def.nodes;
    var initIndex = 0;
    for (var i = 0; i < nodes.length; i++) {
        var nodeDef = nodes[i];
        var parent_1 = nodeDef.parent;
        if (!parent_1 && nodeDef.flags & lifecycles) {
            // matching root node (e.g. a pipe)
            callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
        }
        if ((nodeDef.childFlags & lifecycles) === 0) {
            // no child matches one of the lifecycles
            i += nodeDef.childCount;
        }
        while (parent_1 && (parent_1.flags & 1 /* TypeElement */) &&
            i === parent_1.nodeIndex + parent_1.childCount) {
            // last child of an element
            if (parent_1.directChildFlags & lifecycles) {
                initIndex = callElementProvidersLifecycles(view, parent_1, lifecycles, initIndex);
            }
            parent_1 = parent_1.parent;
        }
    }
}
function callElementProvidersLifecycles(view, elDef, lifecycles, initIndex) {
    for (var i = elDef.nodeIndex + 1; i <= elDef.nodeIndex + elDef.childCount; i++) {
        var nodeDef = view.def.nodes[i];
        if (nodeDef.flags & lifecycles) {
            callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
        }
        // only visit direct children
        i += nodeDef.childCount;
    }
    return initIndex;
}
function callProviderLifecycles(view, index, lifecycles, initIndex) {
    var providerData = asProviderData(view, index);
    if (!providerData) {
        return;
    }
    var provider = providerData.instance;
    if (!provider) {
        return;
    }
    Services.setCurrentNode(view, index);
    if (lifecycles & 1048576 /* AfterContentInit */ &&
        shouldCallLifecycleInitHook(view, 512 /* InitState_CallingAfterContentInit */, initIndex)) {
        provider.ngAfterContentInit();
    }
    if (lifecycles & 2097152 /* AfterContentChecked */) {
        provider.ngAfterContentChecked();
    }
    if (lifecycles & 4194304 /* AfterViewInit */ &&
        shouldCallLifecycleInitHook(view, 768 /* InitState_CallingAfterViewInit */, initIndex)) {
        provider.ngAfterViewInit();
    }
    if (lifecycles & 8388608 /* AfterViewChecked */) {
        provider.ngAfterViewChecked();
    }
    if (lifecycles & 131072 /* OnDestroy */) {
        provider.ngOnDestroy();
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy92aWV3L3Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBaUIsWUFBWSxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDbEgsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDNUQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsUUFBUSxJQUFJLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVsQyxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQ2pGLE9BQU8sRUFBc0gsUUFBUSxFQUFrQyxhQUFhLEVBQUUsY0FBYyxFQUFFLDJCQUEyQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQ2xQLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVwSixJQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoRCxJQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QyxJQUFNLGtCQUFrQixHQUFHLFFBQVEs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KlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBXcmFwcGVkVmFsdWV9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge0lOSkVDVE9SLCBJbmplY3RvciwgcmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJy4uL2RpJztcbmltcG9ydCB7RWxlbWVudFJlZn0gZnJvbSAnLi4vbGlua2VyL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7VGVtcGxhdGVSZWZ9IGZyb20gJy4uL2xpbmtlci90ZW1wbGF0ZV9yZWYnO1xuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmfSBmcm9tICcuLi9saW5rZXIvdmlld19jb250YWluZXJfcmVmJztcbmltcG9ydCB7UmVuZGVyZXIgYXMgUmVuZGVyZXJWMSwgUmVuZGVyZXIyfSBmcm9tICcuLi9yZW5kZXIvYXBpJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtjcmVhdGVDaGFuZ2VEZXRlY3RvclJlZiwgY3JlYXRlSW5qZWN0b3IsIGNyZWF0ZVJlbmRlcmVyVjF9IGZyb20gJy4vcmVmcyc7XG5pbXBvcnQge0JpbmRpbmdEZWYsIEJpbmRpbmdGbGFncywgRGVwRGVmLCBEZXBGbGFncywgTm9kZURlZiwgTm9kZUZsYWdzLCBPdXRwdXREZWYsIE91dHB1dFR5cGUsIFByb3ZpZGVyRGF0YSwgUXVlcnlWYWx1ZVR5cGUsIFNlcnZpY2VzLCBWaWV3RGF0YSwgVmlld0ZsYWdzLCBWaWV3U3RhdGUsIGFzRWxlbWVudERhdGEsIGFzUHJvdmlkZXJEYXRhLCBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2t9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtjYWxjQmluZGluZ0ZsYWdzLCBjaGVja0JpbmRpbmcsIGRpc3BhdGNoRXZlbnQsIGlzQ29tcG9uZW50Vmlldywgc3BsaXREZXBzRHNsLCBzcGxpdE1hdGNoZWRRdWVyaWVzRHNsLCB0b2tlbktleSwgdmlld1BhcmVudEVsfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBSZW5kZXJlclYxVG9rZW5LZXkgPSB0b2tlbktleShSZW5kZXJlclYxKTtcbmNvbnN0IFJlbmRlcmVyMlRva2VuS2V5ID0gdG9rZW5LZXkoUmVuZGVyZXIyKTtcbmNvbnN0IEVsZW1lbnRSZWZUb2tlbktleSA9IHRva2VuS2V5KEVsZW1lbnRSZWYpO1xuY29uc3QgVmlld0NvbnRhaW5lclJlZlRva2VuS2V5ID0gdG9rZW5LZXkoVmlld0NvbnRhaW5lclJlZik7XG5jb25zdCBUZW1wbGF0ZVJlZlRva2VuS2V5ID0gdG9rZW5LZXkoVGVtcGxhdGVSZWYpO1xuY29uc3QgQ2hhbmdlRGV0ZWN0b3JSZWZUb2tlbktleSA9IHRva2VuS2V5KENoYW5nZURldGVjdG9yUmVmKTtcbmNvbnN0IEluamVjdG9yUmVmVG9rZW5LZXkgPSB0b2tlbktleShJbmplY3Rvcik7XG5jb25zdCBJTkpFQ1RPUlJlZlRva2VuS2V5ID0gdG9rZW5LZXkoSU5KRUNUT1IpO1xuXG5leHBvcnQgZnVuY3Rpb24gZGlyZWN0aXZlRGVmKFxuICAgIGNoZWNrSW5kZXg6IG51bWJlciwgZmxhZ3M6IE5vZGVGbGFncyxcbiAgICBtYXRjaGVkUXVlcmllczogbnVsbCB8IFtzdHJpbmcgfCBudW1iZXIsIFF1ZXJ5VmFsdWVUeXBlXVtdLCBjaGlsZENvdW50OiBudW1iZXIsIGN0b3I6IGFueSxcbiAgICBkZXBzOiAoW0RlcEZsYWdzLCBhbnldIHwgYW55KVtdLCBwcm9wcz86IG51bGwgfCB7W25hbWU6IHN0cmluZ106IFtudW1iZXIsIHN0cmluZ119LFxuICAgIG91dHB1dHM/OiBudWxsIHwge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogTm9kZURlZiB7XG4gIGNvbnN0IGJpbmRpbmdzOiBCaW5kaW5nRGVmW10gPSBbXTtcbiAgaWYgKHByb3BzKSB7XG4gICAgZm9yIChsZXQgcHJvcCBpbiBwcm9wcykge1xuICAgICAgY29uc3QgW2JpbmRpbmdJbmRleCwgbm9uTWluaWZpZWROYW1lXSA9IHByb3BzW3Byb3BdO1xuICAgICAgYmluZGluZ3NbYmluZGluZ0luZGV4XSA9IHtcbiAgICAgICAgZmxhZ3M6IEJpbmRpbmdGbGFncy5UeXBlUHJvcGVydHksXG4gICAgICAgIG5hbWU6IHByb3AsIG5vbk1pbmlmaWVkTmFtZSxcbiAgICAgICAgbnM6IG51bGwsXG4gICAgICAgIHNlY3VyaXR5Q29udGV4dDogbnVsbCxcbiAgICAgICAgc3VmZml4OiBudWxsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBjb25zdCBvdXRwdXREZWZzOiBPdXRwdXREZWZbXSA9IFtdO1xuICBpZiAob3V0cHV0cykge1xuICAgIGZvciAobGV0IHByb3BOYW1lIGluIG91dHB1dHMpIHtcbiAgICAgIG91dHB1dERlZnMucHVzaChcbiAgICAgICAgICB7dHlwZTogT3V0cHV0VHlwZS5EaXJlY3RpdmVPdXRwdXQsIHByb3BOYW1lLCB0YXJnZXQ6IG51bGwsIGV2ZW50TmFtZTogb3V0cHV0c1twcm9wTmFtZV19KTtcbiAgICB9XG4gIH1cbiAgZmxhZ3MgfD0gTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmU7XG4gIHJldHVybiBfZGVmKFxuICAgICAgY2hlY2tJbmRleCwgZmxhZ3MsIG1hdGNoZWRRdWVyaWVzLCBjaGlsZENvdW50LCBjdG9yLCBjdG9yLCBkZXBzLCBiaW5kaW5ncywgb3V0cHV0RGVmcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaXBlRGVmKGZsYWdzOiBOb2RlRmxhZ3MsIGN0b3I6IGFueSwgZGVwczogKFtEZXBGbGFncywgYW55XSB8IGFueSlbXSk6IE5vZGVEZWYge1xuICBmbGFncyB8PSBOb2RlRmxhZ3MuVHlwZVBpcGU7XG4gIHJldHVybiBfZGVmKC0xLCBmbGFncywgbnVsbCwgMCwgY3RvciwgY3RvciwgZGVwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlckRlZihcbiAgICBmbGFnczogTm9kZUZsYWdzLCBtYXRjaGVkUXVlcmllczogbnVsbCB8IFtzdHJpbmcgfCBudW1iZXIsIFF1ZXJ5VmFsdWVUeXBlXVtdLCB0b2tlbjogYW55LFxuICAgIHZhbHVlOiBhbnksIGRlcHM6IChbRGVwRmxhZ3MsIGFueV0gfCBhbnkpW10pOiBOb2RlRGVmIHtcbiAgcmV0dXJuIF9kZWYoLTEsIGZsYWdzLCBtYXRjaGVkUXVlcmllcywgMCwgdG9rZW4sIHZhbHVlLCBkZXBzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9kZWYoXG4gICAgY2hlY2tJbmRleDogbnVtYmVyLCBmbGFnczogTm9kZUZsYWdzLFxuICAgIG1hdGNoZWRRdWVyaWVzRHNsOiBbc3RyaW5nIHwgbnVtYmVyLCBRdWVyeVZhbHVlVHlwZV1bXSB8IG51bGwsIGNoaWxkQ291bnQ6IG51bWJlciwgdG9rZW46IGFueSxcbiAgICB2YWx1ZTogYW55LCBkZXBzOiAoW0RlcEZsYWdzLCBhbnldIHwgYW55KVtdLCBiaW5kaW5ncz86IEJpbmRpbmdEZWZbXSxcbiAgICBvdXRwdXRzPzogT3V0cHV0RGVmW10pOiBOb2RlRGVmIHtcbiAgY29uc3Qge21hdGNoZWRRdWVyaWVzLCByZWZlcmVuY2VzLCBtYXRjaGVkUXVlcnlJZHN9ID0gc3BsaXRNYXRjaGVkUXVlcmllc0RzbChtYXRjaGVkUXVlcmllc0RzbCk7XG4gIGlmICghb3V0cHV0cykge1xuICAgIG91dHB1dHMgPSBbXTtcbiAgfVxuICBpZiAoIWJpbmRpbmdzKSB7XG4gICAgYmluZGluZ3MgPSBbXTtcbiAgfVxuICAvLyBOZWVkIHRvIHJlc29sdmUgZm9yd2FyZFJlZnMgYXMgZS5nLiBmb3IgYHVzZVZhbHVlYCB3ZVxuICAvLyBsb3dlcmVkIHRoZSBleHByZXNzaW9uIGFuZCB0aGVuIHN0b3BwZWQgZXZhbHVhdGluZyBpdCxcbiAgLy8gaS5lLiBhbHNvIGRpZG4ndCB1bndyYXAgaXQuXG4gIHZhbHVlID0gcmVzb2x2ZUZvcndhcmRSZWYodmFsdWUpO1xuXG4gIGNvbnN0IGRlcERlZnMgPSBzcGxpdERlcHNEc2woZGVwcywgc3RyaW5naWZ5KHRva2VuKSk7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyB3aWxsIGJldCBzZXQgYnkgdGhlIHZpZXcgZGVmaW5pdGlvblxuICAgIG5vZGVJbmRleDogLTEsXG4gICAgcGFyZW50OiBudWxsLFxuICAgIHJlbmRlclBhcmVudDogbnVsbCxcbiAgICBiaW5kaW5nSW5kZXg6IC0xLFxuICAgIG91dHB1dEluZGV4OiAtMSxcbiAgICAvLyByZWd1bGFyIHZhbHVlc1xuICAgIGNoZWNrSW5kZXgsXG4gICAgZmxhZ3MsXG4gICAgY2hpbGRGbGFnczogMCxcbiAgICBkaXJlY3RDaGlsZEZsYWdzOiAwLFxuICAgIGNoaWxkTWF0Y2hlZFF1ZXJpZXM6IDAsIG1hdGNoZWRRdWVyaWVzLCBtYXRjaGVkUXVlcnlJZHMsIHJlZmVyZW5jZXMsXG4gICAgbmdDb250ZW50SW5kZXg6IC0xLCBjaGlsZENvdW50LCBiaW5kaW5ncyxcbiAgICBiaW5kaW5nRmxhZ3M6IGNhbGNCaW5kaW5nRmxhZ3MoYmluZGluZ3MpLCBvdXRwdXRzLFxuICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgcHJvdmlkZXI6IHt0b2tlbiwgdmFsdWUsIGRlcHM6IGRlcERlZnN9LFxuICAgIHRleHQ6IG51bGwsXG4gICAgcXVlcnk6IG51bGwsXG4gICAgbmdDb250ZW50OiBudWxsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm92aWRlckluc3RhbmNlKHZpZXc6IFZpZXdEYXRhLCBkZWY6IE5vZGVEZWYpOiBhbnkge1xuICByZXR1cm4gX2NyZWF0ZVByb3ZpZGVySW5zdGFuY2UodmlldywgZGVmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBpcGVJbnN0YW5jZSh2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmKTogYW55IHtcbiAgLy8gZGVwcyBhcmUgbG9va2VkIHVwIGZyb20gY29tcG9uZW50LlxuICBsZXQgY29tcFZpZXcgPSB2aWV3O1xuICB3aGlsZSAoY29tcFZpZXcucGFyZW50ICYmICFpc0NvbXBvbmVudFZpZXcoY29tcFZpZXcpKSB7XG4gICAgY29tcFZpZXcgPSBjb21wVmlldy5wYXJlbnQ7XG4gIH1cbiAgLy8gcGlwZXMgY2FuIHNlZSB0aGUgcHJpdmF0ZSBzZXJ2aWNlcyBvZiB0aGUgY29tcG9uZW50XG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gdHJ1ZTtcbiAgLy8gcGlwZXMgYXJlIGFsd2F5cyBlYWdlciBhbmQgY2xhc3NlcyFcbiAgcmV0dXJuIGNyZWF0ZUNsYXNzKFxuICAgICAgY29tcFZpZXcucGFyZW50ICEsIHZpZXdQYXJlbnRFbChjb21wVmlldykgISwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlZi5wcm92aWRlciAhLnZhbHVlLFxuICAgICAgZGVmLnByb3ZpZGVyICEuZGVwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEaXJlY3RpdmVJbnN0YW5jZSh2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmKTogYW55IHtcbiAgLy8gY29tcG9uZW50cyBjYW4gc2VlIG90aGVyIHByaXZhdGUgc2VydmljZXMsIG90aGVyIGRpcmVjdGl2ZXMgY2FuJ3QuXG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gKGRlZi5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnQpID4gMDtcbiAgLy8gZGlyZWN0aXZlcyBhcmUgYWx3YXlzIGVhZ2VyIGFuZCBjbGFzc2VzIVxuICBjb25zdCBpbnN0YW5jZSA9IGNyZWF0ZUNsYXNzKFxuICAgICAgdmlldywgZGVmLnBhcmVudCAhLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVmLnByb3ZpZGVyICEudmFsdWUsIGRlZi5wcm92aWRlciAhLmRlcHMpO1xuICBpZiAoZGVmLm91dHB1dHMubGVuZ3RoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWYub3V0cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gZGVmLm91dHB1dHNbaV07XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBpbnN0YW5jZVtvdXRwdXQucHJvcE5hbWUgIV0uc3Vic2NyaWJlKFxuICAgICAgICAgIGV2ZW50SGFuZGxlckNsb3N1cmUodmlldywgZGVmLnBhcmVudCAhLm5vZGVJbmRleCwgb3V0cHV0LmV2ZW50TmFtZSkpO1xuICAgICAgdmlldy5kaXNwb3NhYmxlcyAhW2RlZi5vdXRwdXRJbmRleCArIGldID0gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlLmJpbmQoc3Vic2NyaXB0aW9uKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5mdW5jdGlvbiBldmVudEhhbmRsZXJDbG9zdXJlKHZpZXc6IFZpZXdEYXRhLCBpbmRleDogbnVtYmVyLCBldmVudE5hbWU6IHN0cmluZykge1xuICByZXR1cm4gKGV2ZW50OiBhbnkpID0+IGRpc3BhdGNoRXZlbnQodmlldywgaW5kZXgsIGV2ZW50TmFtZSwgZXZlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tBbmRVcGRhdGVEaXJlY3RpdmVJbmxpbmUoXG4gICAgdmlldzogVmlld0RhdGEsIGRlZjogTm9kZURlZiwgdjA6IGFueSwgdjE6IGFueSwgdjI6IGFueSwgdjM6IGFueSwgdjQ6IGFueSwgdjU6IGFueSwgdjY6IGFueSxcbiAgICB2NzogYW55LCB2ODogYW55LCB2OTogYW55KTogYm9vbGVhbiB7XG4gIGNvbnN0IHByb3ZpZGVyRGF0YSA9IGFzUHJvdmlkZXJEYXRhKHZpZXcsIGRlZi5ub2RlSW5kZXgpO1xuICBjb25zdCBkaXJlY3RpdmUgPSBwcm92aWRlckRhdGEuaW5zdGFuY2U7XG4gIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gIGxldCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzID0gdW5kZWZpbmVkICE7XG4gIGNvbnN0IGJpbmRMZW4gPSBkZWYuYmluZGluZ3MubGVuZ3RoO1xuICBpZiAoYmluZExlbiA+IDAgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgMCwgdjApKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDAsIHYwLCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDEgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgMSwgdjEpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDEsIHYxLCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDIgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgMiwgdjIpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDIsIHYyLCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDMgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgMywgdjMpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDMsIHYzLCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDQgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgNCwgdjQpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDQsIHY0LCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDUgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgNSwgdjUpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDUsIHY1LCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDYgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgNiwgdjYpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDYsIHY2LCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDcgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgNywgdjcpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDcsIHY3LCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDggJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgOCwgdjgpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDgsIHY4LCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoYmluZExlbiA+IDkgJiYgY2hlY2tCaW5kaW5nKHZpZXcsIGRlZiwgOSwgdjkpKSB7XG4gICAgY2hhbmdlZCA9IHRydWU7XG4gICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIDksIHY5LCBjaGFuZ2VzKTtcbiAgfVxuICBpZiAoY2hhbmdlcykge1xuICAgIGRpcmVjdGl2ZS5uZ09uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgfVxuICBpZiAoKGRlZi5mbGFncyAmIE5vZGVGbGFncy5PbkluaXQpICYmXG4gICAgICBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2sodmlldywgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nT25Jbml0LCBkZWYubm9kZUluZGV4KSkge1xuICAgIGRpcmVjdGl2ZS5uZ09uSW5pdCgpO1xuICB9XG4gIGlmIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuRG9DaGVjaykge1xuICAgIGRpcmVjdGl2ZS5uZ0RvQ2hlY2soKTtcbiAgfVxuICByZXR1cm4gY2hhbmdlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQW5kVXBkYXRlRGlyZWN0aXZlRHluYW1pYyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmLCB2YWx1ZXM6IGFueVtdKTogYm9vbGVhbiB7XG4gIGNvbnN0IHByb3ZpZGVyRGF0YSA9IGFzUHJvdmlkZXJEYXRhKHZpZXcsIGRlZi5ub2RlSW5kZXgpO1xuICBjb25zdCBkaXJlY3RpdmUgPSBwcm92aWRlckRhdGEuaW5zdGFuY2U7XG4gIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gIGxldCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzID0gdW5kZWZpbmVkICE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIGksIHZhbHVlc1tpXSkpIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgY2hhbmdlcyA9IHVwZGF0ZVByb3AodmlldywgcHJvdmlkZXJEYXRhLCBkZWYsIGksIHZhbHVlc1tpXSwgY2hhbmdlcyk7XG4gICAgfVxuICB9XG4gIGlmIChjaGFuZ2VzKSB7XG4gICAgZGlyZWN0aXZlLm5nT25DaGFuZ2VzKGNoYW5nZXMpO1xuICB9XG4gIGlmICgoZGVmLmZsYWdzICYgTm9kZUZsYWdzLk9uSW5pdCkgJiZcbiAgICAgIHNob3VsZENhbGxMaWZlY3ljbGVJbml0SG9vayh2aWV3LCBWaWV3U3RhdGUuSW5pdFN0YXRlX0NhbGxpbmdPbkluaXQsIGRlZi5ub2RlSW5kZXgpKSB7XG4gICAgZGlyZWN0aXZlLm5nT25Jbml0KCk7XG4gIH1cbiAgaWYgKGRlZi5mbGFncyAmIE5vZGVGbGFncy5Eb0NoZWNrKSB7XG4gICAgZGlyZWN0aXZlLm5nRG9DaGVjaygpO1xuICB9XG4gIHJldHVybiBjaGFuZ2VkO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlUHJvdmlkZXJJbnN0YW5jZSh2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmKTogYW55IHtcbiAgLy8gcHJpdmF0ZSBzZXJ2aWNlcyBjYW4gc2VlIG90aGVyIHByaXZhdGUgc2VydmljZXNcbiAgY29uc3QgYWxsb3dQcml2YXRlU2VydmljZXMgPSAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLlByaXZhdGVQcm92aWRlcikgPiAwO1xuICBjb25zdCBwcm92aWRlckRlZiA9IGRlZi5wcm92aWRlcjtcbiAgc3dpdGNoIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZXMpIHtcbiAgICBjYXNlIE5vZGVGbGFncy5UeXBlQ2xhc3NQcm92aWRlcjpcbiAgICAgIHJldHVybiBjcmVhdGVDbGFzcyhcbiAgICAgICAgICB2aWV3LCBkZWYucGFyZW50ICEsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBwcm92aWRlckRlZiAhLnZhbHVlLCBwcm92aWRlckRlZiAhLmRlcHMpO1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVGYWN0b3J5UHJvdmlkZXI6XG4gICAgICByZXR1cm4gY2FsbEZhY3RvcnkoXG4gICAgICAgICAgdmlldywgZGVmLnBhcmVudCAhLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgcHJvdmlkZXJEZWYgIS52YWx1ZSwgcHJvdmlkZXJEZWYgIS5kZXBzKTtcbiAgICBjYXNlIE5vZGVGbGFncy5UeXBlVXNlRXhpc3RpbmdQcm92aWRlcjpcbiAgICAgIHJldHVybiByZXNvbHZlRGVwKHZpZXcsIGRlZi5wYXJlbnQgISwgYWxsb3dQcml2YXRlU2VydmljZXMsIHByb3ZpZGVyRGVmICEuZGVwc1swXSk7XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVZhbHVlUHJvdmlkZXI6XG4gICAgICByZXR1cm4gcHJvdmlkZXJEZWYgIS52YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDbGFzcyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgZWxEZWY6IE5vZGVEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzOiBib29sZWFuLCBjdG9yOiBhbnksIGRlcHM6IERlcERlZltdKTogYW55IHtcbiAgY29uc3QgbGVuID0gZGVwcy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIG5ldyBjdG9yKCk7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIG5ldyBjdG9yKHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzBdKSk7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIG5ldyBjdG9yKFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzBdKSxcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1sxXSkpO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBuZXcgY3RvcihcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSksXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMV0pLFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzJdKSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnN0IGRlcFZhbHVlcyA9IG5ldyBBcnJheShsZW4pO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkZXBWYWx1ZXNbaV0gPSByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1tpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IGN0b3IoLi4uZGVwVmFsdWVzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxsRmFjdG9yeShcbiAgICB2aWV3OiBWaWV3RGF0YSwgZWxEZWY6IE5vZGVEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzOiBib29sZWFuLCBmYWN0b3J5OiBhbnksXG4gICAgZGVwczogRGVwRGVmW10pOiBhbnkge1xuICBjb25zdCBsZW4gPSBkZXBzLmxlbmd0aDtcbiAgc3dpdGNoIChsZW4pIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gZmFjdG9yeSgpO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBmYWN0b3J5KHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzBdKSk7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIGZhY3RvcnkoXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMF0pLFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzFdKSk7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIGZhY3RvcnkoXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMF0pLFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzFdKSxcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1syXSkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zdCBkZXBWYWx1ZXMgPSBBcnJheShsZW4pO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkZXBWYWx1ZXNbaV0gPSByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1tpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFjdG9yeSguLi5kZXBWYWx1ZXMpO1xuICB9XG59XG5cbi8vIFRoaXMgZGVmYXVsdCB2YWx1ZSBpcyB3aGVuIGNoZWNraW5nIHRoZSBoaWVyYXJjaHkgZm9yIGEgdG9rZW4uXG4vL1xuLy8gSXQgbWVhbnMgYm90aDpcbi8vIC0gdGhlIHRva2VuIGlzIG5vdCBwcm92aWRlZCBieSB0aGUgY3VycmVudCBpbmplY3Rvcixcbi8vIC0gb25seSB0aGUgZWxlbWVudCBpbmplY3RvcnMgc2hvdWxkIGJlIGNoZWNrZWQgKGllIGRvIG5vdCBjaGVjayBtb2R1bGUgaW5qZWN0b3JzXG4vL1xuLy8gICAgICAgICAgbW9kMVxuLy8gICAgICAgICAvXG4vLyAgICAgICBlbDEgICBtb2QyXG4vLyAgICAgICAgIFxcICAvXG4vLyAgICAgICAgIGVsMlxuLy9cbi8vIFdoZW4gcmVxdWVzdGluZyBlbDIuaW5qZWN0b3IuZ2V0KHRva2VuKSwgd2Ugc2hvdWxkIGNoZWNrIGluIHRoZSBmb2xsb3dpbmcgb3JkZXIgYW5kIHJldHVybiB0aGVcbi8vIGZpcnN0IGZvdW5kIHZhbHVlOlxuLy8gLSBlbDIuaW5qZWN0b3IuZ2V0KHRva2VuLCBkZWZhdWx0KVxuLy8gLSBlbDEuaW5qZWN0b3IuZ2V0KHRva2VuLCBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKSAtPiBkbyBub3QgY2hlY2sgdGhlIG1vZHVsZVxuLy8gLSBtb2QyLmluamVjdG9yLmdldCh0b2tlbiwgZGVmYXVsdClcbmV4cG9ydCBjb25zdCBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SID0ge307XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRGVwKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBlbERlZjogTm9kZURlZiwgYWxsb3dQcml2YXRlU2VydmljZXM6IGJvb2xlYW4sIGRlcERlZjogRGVwRGVmLFxuICAgIG5vdEZvdW5kVmFsdWU6IGFueSA9IEluamVjdG9yLlRIUk9XX0lGX05PVF9GT1VORCk6IGFueSB7XG4gIGlmIChkZXBEZWYuZmxhZ3MgJiBEZXBGbGFncy5WYWx1ZSkge1xuICAgIHJldHVybiBkZXBEZWYudG9rZW47XG4gIH1cbiAgY29uc3Qgc3RhcnRWaWV3ID0gdmlldztcbiAgaWYgKGRlcERlZi5mbGFncyAmIERlcEZsYWdzLk9wdGlvbmFsKSB7XG4gICAgbm90Rm91bmRWYWx1ZSA9IG51bGw7XG4gIH1cbiAgY29uc3QgdG9rZW5LZXkgPSBkZXBEZWYudG9rZW5LZXk7XG5cbiAgaWYgKHRva2VuS2V5ID09PSBDaGFuZ2VEZXRlY3RvclJlZlRva2VuS2V5KSB7XG4gICAgLy8gZGlyZWN0aXZlcyBvbiB0aGUgc2FtZSBlbGVtZW50IGFzIGEgY29tcG9uZW50IHNob3VsZCBiZSBhYmxlIHRvIGNvbnRyb2wgdGhlIGNoYW5nZSBkZXRlY3RvclxuICAgIC8vIG9mIHRoYXQgY29tcG9uZW50IGFzIHdlbGwuXG4gICAgYWxsb3dQcml2YXRlU2VydmljZXMgPSAhIShlbERlZiAmJiBlbERlZi5lbGVtZW50ICEuY29tcG9uZW50Vmlldyk7XG4gIH1cblxuICBpZiAoZWxEZWYgJiYgKGRlcERlZi5mbGFncyAmIERlcEZsYWdzLlNraXBTZWxmKSkge1xuICAgIGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gZmFsc2U7XG4gICAgZWxEZWYgPSBlbERlZi5wYXJlbnQgITtcbiAgfVxuXG4gIGxldCBzZWFyY2hWaWV3OiBWaWV3RGF0YXxudWxsID0gdmlldztcbiAgd2hpbGUgKHNlYXJjaFZpZXcpIHtcbiAgICBpZiAoZWxEZWYpIHtcbiAgICAgIHN3aXRjaCAodG9rZW5LZXkpIHtcbiAgICAgICAgY2FzZSBSZW5kZXJlclYxVG9rZW5LZXk6IHtcbiAgICAgICAgICBjb25zdCBjb21wVmlldyA9IGZpbmRDb21wVmlldyhzZWFyY2hWaWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMpO1xuICAgICAgICAgIHJldHVybiBjcmVhdGVSZW5kZXJlclYxKGNvbXBWaWV3KTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFJlbmRlcmVyMlRva2VuS2V5OiB7XG4gICAgICAgICAgY29uc3QgY29tcFZpZXcgPSBmaW5kQ29tcFZpZXcoc2VhcmNoVmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzKTtcbiAgICAgICAgICByZXR1cm4gY29tcFZpZXcucmVuZGVyZXI7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBFbGVtZW50UmVmVG9rZW5LZXk6XG4gICAgICAgICAgcmV0dXJuIG5ldyBFbGVtZW50UmVmKGFzRWxlbWVudERhdGEoc2VhcmNoVmlldywgZWxEZWYubm9kZUluZGV4KS5yZW5kZXJFbGVtZW50KTtcbiAgICAgICAgY2FzZSBWaWV3Q29udGFpbmVyUmVmVG9rZW5LZXk6XG4gICAgICAgICAgcmV0dXJuIGFzRWxlbWVudERhdGEoc2VhcmNoVmlldywgZWxEZWYubm9kZUluZGV4KS52aWV3Q29udGFpbmVyO1xuICAgICAgICBjYXNlIFRlbXBsYXRlUmVmVG9rZW5LZXk6IHtcbiAgICAgICAgICBpZiAoZWxEZWYuZWxlbWVudCAhLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gYXNFbGVtZW50RGF0YShzZWFyY2hWaWV3LCBlbERlZi5ub2RlSW5kZXgpLnRlbXBsYXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIENoYW5nZURldGVjdG9yUmVmVG9rZW5LZXk6IHtcbiAgICAgICAgICBsZXQgY2RWaWV3ID0gZmluZENvbXBWaWV3KHNlYXJjaFZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcyk7XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZUNoYW5nZURldGVjdG9yUmVmKGNkVmlldyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBJbmplY3RvclJlZlRva2VuS2V5OlxuICAgICAgICBjYXNlIElOSkVDVE9SUmVmVG9rZW5LZXk6XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZUluamVjdG9yKHNlYXJjaFZpZXcsIGVsRGVmKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zdCBwcm92aWRlckRlZiA9XG4gICAgICAgICAgICAgIChhbGxvd1ByaXZhdGVTZXJ2aWNlcyA/IGVsRGVmLmVsZW1lbnQgIS5hbGxQcm92aWRlcnMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbERlZi5lbGVtZW50ICEucHVibGljUHJvdmlkZXJzKSAhW3Rva2VuS2V5XTtcbiAgICAgICAgICBpZiAocHJvdmlkZXJEZWYpIHtcbiAgICAgICAgICAgIGxldCBwcm92aWRlckRhdGEgPSBhc1Byb3ZpZGVyRGF0YShzZWFyY2hWaWV3LCBwcm92aWRlckRlZi5ub2RlSW5kZXgpO1xuICAgICAgICAgICAgaWYgKCFwcm92aWRlckRhdGEpIHtcbiAgICAgICAgICAgICAgcHJvdmlkZXJEYXRhID0ge2luc3RhbmNlOiBfY3JlYXRlUHJvdmlkZXJJbnN0YW5jZShzZWFyY2hWaWV3LCBwcm92aWRlckRlZil9O1xuICAgICAgICAgICAgICBzZWFyY2hWaWV3Lm5vZGVzW3Byb3ZpZGVyRGVmLm5vZGVJbmRleF0gPSBwcm92aWRlckRhdGEgYXMgYW55O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyRGF0YS5pbnN0YW5jZTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWxsb3dQcml2YXRlU2VydmljZXMgPSBpc0NvbXBvbmVudFZpZXcoc2VhcmNoVmlldyk7XG4gICAgZWxEZWYgPSB2aWV3UGFyZW50RWwoc2VhcmNoVmlldykgITtcbiAgICBzZWFyY2hWaWV3ID0gc2VhcmNoVmlldy5wYXJlbnQgITtcblxuICAgIGlmIChkZXBEZWYuZmxhZ3MgJiBEZXBGbGFncy5TZWxmKSB7XG4gICAgICBzZWFyY2hWaWV3ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBjb25zdCB2YWx1ZSA9IHN0YXJ0Vmlldy5yb290LmluamVjdG9yLmdldChkZXBEZWYudG9rZW4sIE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpO1xuXG4gIGlmICh2YWx1ZSAhPT0gTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUiB8fFxuICAgICAgbm90Rm91bmRWYWx1ZSA9PT0gTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUikge1xuICAgIC8vIFJldHVybiB0aGUgdmFsdWUgZnJvbSB0aGUgcm9vdCBlbGVtZW50IGluamVjdG9yIHdoZW5cbiAgICAvLyAtIGl0IHByb3ZpZGVzIGl0XG4gICAgLy8gICAodmFsdWUgIT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpXG4gICAgLy8gLSB0aGUgbW9kdWxlIGluamVjdG9yIHNob3VsZCBub3QgYmUgY2hlY2tlZFxuICAgIC8vICAgKG5vdEZvdW5kVmFsdWUgPT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIHN0YXJ0Vmlldy5yb290Lm5nTW9kdWxlLmluamVjdG9yLmdldChkZXBEZWYudG9rZW4sIG5vdEZvdW5kVmFsdWUpO1xufVxuXG5mdW5jdGlvbiBmaW5kQ29tcFZpZXcodmlldzogVmlld0RhdGEsIGVsRGVmOiBOb2RlRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlczogYm9vbGVhbikge1xuICBsZXQgY29tcFZpZXc6IFZpZXdEYXRhO1xuICBpZiAoYWxsb3dQcml2YXRlU2VydmljZXMpIHtcbiAgICBjb21wVmlldyA9IGFzRWxlbWVudERhdGEodmlldywgZWxEZWYubm9kZUluZGV4KS5jb21wb25lbnRWaWV3O1xuICB9IGVsc2Uge1xuICAgIGNvbXBWaWV3ID0gdmlldztcbiAgICB3aGlsZSAoY29tcFZpZXcucGFyZW50ICYmICFpc0NvbXBvbmVudFZpZXcoY29tcFZpZXcpKSB7XG4gICAgICBjb21wVmlldyA9IGNvbXBWaWV3LnBhcmVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvbXBWaWV3O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQcm9wKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBwcm92aWRlckRhdGE6IFByb3ZpZGVyRGF0YSwgZGVmOiBOb2RlRGVmLCBiaW5kaW5nSWR4OiBudW1iZXIsIHZhbHVlOiBhbnksXG4gICAgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IFNpbXBsZUNoYW5nZXMge1xuICBpZiAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLkNvbXBvbmVudCkge1xuICAgIGNvbnN0IGNvbXBWaWV3ID0gYXNFbGVtZW50RGF0YSh2aWV3LCBkZWYucGFyZW50ICEubm9kZUluZGV4KS5jb21wb25lbnRWaWV3O1xuICAgIGlmIChjb21wVmlldy5kZWYuZmxhZ3MgJiBWaWV3RmxhZ3MuT25QdXNoKSB7XG4gICAgICBjb21wVmlldy5zdGF0ZSB8PSBWaWV3U3RhdGUuQ2hlY2tzRW5hYmxlZDtcbiAgICB9XG4gIH1cbiAgY29uc3QgYmluZGluZyA9IGRlZi5iaW5kaW5nc1tiaW5kaW5nSWR4XTtcbiAgY29uc3QgcHJvcE5hbWUgPSBiaW5kaW5nLm5hbWUgITtcbiAgLy8gTm90ZTogVGhpcyBpcyBzdGlsbCBzYWZlIHdpdGggQ2xvc3VyZSBDb21waWxlciBhc1xuICAvLyB0aGUgdXNlciBwYXNzZWQgaW4gdGhlIHByb3BlcnR5IG5hbWUgYXMgYW4gb2JqZWN0IGhhcyB0byBgcHJvdmlkZXJEZWZgLFxuICAvLyBzbyBDbG9zdXJlIENvbXBpbGVyIHdpbGwgaGF2ZSByZW5hbWVkIHRoZSBwcm9wZXJ0eSBjb3JyZWN0bHkgYWxyZWFkeS5cbiAgcHJvdmlkZXJEYXRhLmluc3RhbmNlW3Byb3BOYW1lXSA9IHZhbHVlO1xuICBpZiAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLk9uQ2hhbmdlcykge1xuICAgIGNoYW5nZXMgPSBjaGFuZ2VzIHx8IHt9O1xuICAgIGNvbnN0IG9sZFZhbHVlID0gV3JhcHBlZFZhbHVlLnVud3JhcCh2aWV3Lm9sZFZhbHVlc1tkZWYuYmluZGluZ0luZGV4ICsgYmluZGluZ0lkeF0pO1xuICAgIGNvbnN0IGJpbmRpbmcgPSBkZWYuYmluZGluZ3NbYmluZGluZ0lkeF07XG4gICAgY2hhbmdlc1tiaW5kaW5nLm5vbk1pbmlmaWVkTmFtZSAhXSA9XG4gICAgICAgIG5ldyBTaW1wbGVDaGFuZ2Uob2xkVmFsdWUsIHZhbHVlLCAodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5GaXJzdENoZWNrKSAhPT0gMCk7XG4gIH1cbiAgdmlldy5vbGRWYWx1ZXNbZGVmLmJpbmRpbmdJbmRleCArIGJpbmRpbmdJZHhdID0gdmFsdWU7XG4gIHJldHVybiBjaGFuZ2VzO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGNhbGxzIHRoZSBuZ0FmdGVyQ29udGVudENoZWNrLCBuZ0FmdGVyQ29udGVudEluaXQsXG4vLyBuZ0FmdGVyVmlld0NoZWNrLCBhbmQgbmdBZnRlclZpZXdJbml0IGxpZmVjeWNsZSBob29rcyAoZGVwZW5kaW5nIG9uIHRoZSBub2RlXG4vLyBmbGFncyBpbiBsaWZlY3ljbGUpLiBVbmxpa2UgbmdEb0NoZWNrLCBuZ09uQ2hhbmdlcyBhbmQgbmdPbkluaXQsIHdoaWNoIGFyZVxuLy8gY2FsbGVkIGR1cmluZyBhIHByZS1vcmRlciB0cmF2ZXJzYWwgb2YgdGhlIHZpZXcgdHJlZSAodGhhdCBpcyBjYWxsaW5nIHRoZVxuLy8gcGFyZW50IGhvb2tzIGJlZm9yZSB0aGUgY2hpbGQgaG9va3MpIHRoZXNlIGV2ZW50cyBhcmUgc2VudCBpbiB1c2luZyBhXG4vLyBwb3N0LW9yZGVyIHRyYXZlcnNhbCBvZiB0aGUgdHJlZSAoY2hpbGRyZW4gYmVmb3JlIHBhcmVudHMpLiBUaGlzIGNoYW5nZXMgdGhlXG4vLyBtZWFuaW5nIG9mIGluaXRJbmRleCBpbiB0aGUgdmlldyBzdGF0ZS4gRm9yIG5nT25Jbml0LCBpbml0SW5kZXggdHJhY2tzIHRoZVxuLy8gZXhwZWN0ZWQgbm9kZUluZGV4IHdoaWNoIGEgbmdPbkluaXQgc2hvdWxkIGJlIGNhbGxlZC4gV2hlbiBzZW5kaW5nXG4vLyBuZ0FmdGVyQ29udGVudEluaXQgYW5kIG5nQWZ0ZXJWaWV3SW5pdCBpdCBpcyB0aGUgZXhwZWN0ZWQgY291bnQgb2Zcbi8vIG5nQWZ0ZXJDb250ZW50SW5pdCBvciBuZ0FmdGVyVmlld0luaXQgbWV0aG9kcyB0aGF0IGhhdmUgYmVlbiBjYWxsZWQuIFRoaXNcbi8vIGVuc3VyZSB0aGF0IGRlc3BpdGUgYmVpbmcgY2FsbGVkIHJlY3Vyc2l2ZWx5IG9yIGFmdGVyIHBpY2tpbmcgdXAgYWZ0ZXIgYW5cbi8vIGV4Y2VwdGlvbiwgdGhlIG5nQWZ0ZXJDb250ZW50SW5pdCBvciBuZ0FmdGVyVmlld0luaXQgd2lsbCBiZSBjYWxsZWQgb24gdGhlXG4vLyBjb3JyZWN0IG5vZGVzLiBDb25zaWRlciBmb3IgZXhhbXBsZSwgdGhlIGZvbGxvd2luZyAod2hlcmUgRSBpcyBhbiBlbGVtZW50XG4vLyBhbmQgRCBpcyBhIGRpcmVjdGl2ZSlcbi8vICBUcmVlOiAgICAgICBwcmUtb3JkZXIgaW5kZXggIHBvc3Qtb3JkZXIgaW5kZXhcbi8vICAgIEUxICAgICAgICAwICAgICAgICAgICAgICAgIDZcbi8vICAgICAgRTIgICAgICAxICAgICAgICAgICAgICAgIDFcbi8vICAgICAgIEQzICAgICAyICAgICAgICAgICAgICAgIDBcbi8vICAgICAgRTQgICAgICAzICAgICAgICAgICAgICAgIDVcbi8vICAgICAgIEU1ICAgICA0ICAgICAgICAgICAgICAgIDRcbi8vICAgICAgICBFNiAgICA1ICAgICAgICAgICAgICAgIDJcbi8vICAgICAgICBFNyAgICA2ICAgICAgICAgICAgICAgIDNcbi8vIEFzIGNhbiBiZSBzZWVuLCB0aGUgcG9zdC1vcmRlciBpbmRleCBoYXMgYW4gdW5jbGVhciByZWxhdGlvbnNoaXAgdG8gdGhlXG4vLyBwcmUtb3JkZXIgaW5kZXggKHBvc3RPcmRlckluZGV4ID09PSBwcmVPcmRlckluZGV4IC0gcGFyZW50Q291bnQgK1xuLy8gY2hpbGRDb3VudCkuIFNpbmNlIG51bWJlciBvZiBjYWxscyB0byBuZ0FmdGVyQ29udGVudEluaXQgYW5kIG5nQWZ0ZXJWaWV3SW5pdFxuLy8gYXJlIHN0YWJsZSAod2lsbCBiZSB0aGUgc2FtZSBmb3IgdGhlIHNhbWUgdmlldyByZWdhcmRsZXNzIG9mIGV4Y2VwdGlvbnMgb3Jcbi8vIHJlY3Vyc2lvbikgd2UganVzdCBuZWVkIHRvIGNvdW50IHRoZW0gd2hpY2ggd2lsbCByb3VnaGx5IGNvcnJlc3BvbmQgdG8gdGhlXG4vLyBwb3N0LW9yZGVyIGluZGV4IChpdCBza2lwcyBlbGVtZW50cyBhbmQgZGlyZWN0aXZlcyB0aGF0IGRvIG5vdCBoYXZlXG4vLyBsaWZlY3ljbGUgaG9va3MpLlxuLy9cbi8vIEZvciBleGFtcGxlLCBpZiBhbiBleGNlcHRpb24gaXMgcmFpc2VkIGluIHRoZSBFNi5vbkFmdGVyVmlld0luaXQoKSB0aGVcbi8vIGluaXRJbmRleCBpcyBsZWZ0IGF0IDMgKGJ5IHNob3VsZENhbGxMaWZlY3ljbGVJbml0SG9vaygpIHdoaWNoIHNldCBpdCB0b1xuLy8gaW5pdEluZGV4ICsgMSkuIFdoZW4gY2hlY2tBbmRVcGRhdGVWaWV3KCkgaXMgY2FsbGVkIGFnYWluIEQzLCBFMiBhbmQgRTYgd2lsbFxuLy8gbm90IGhhdmUgdGhlaXIgbmdBZnRlclZpZXdJbml0KCkgY2FsbGVkIGJ1dCwgc3RhcnRpbmcgd2l0aCBFNywgdGhlIHJlc3Qgb2Zcbi8vIHRoZSB2aWV3IHdpbGwgYmVnaW4gZ2V0dGluZyBuZ0FmdGVyVmlld0luaXQoKSBjYWxsZWQgdW50aWwgYSBjaGVjayBhbmRcbi8vIHBhc3MgaXMgY29tcGxldGUuXG4vL1xuLy8gVGhpcyBhbGdvcnRoaW0gYWxzbyBoYW5kbGVzIHJlY3Vyc2lvbi4gQ29uc2lkZXIgaWYgRTQncyBuZ0FmdGVyVmlld0luaXQoKVxuLy8gaW5kaXJlY3RseSBjYWxscyBFMSdzIENoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKS4gVGhlIGV4cGVjdGVkXG4vLyBpbml0SW5kZXggaXMgc2V0IHRvIDYsIHRoZSByZWN1c2l2ZSBjaGVja0FuZFVwZGF0ZVZpZXcoKSBzdGFydHMgd2FsayBhZ2Fpbi5cbi8vIEQzLCBFMiwgRTYsIEU3LCBFNSBhbmQgRTQgYXJlIHNraXBwZWQsIG5nQWZ0ZXJWaWV3SW5pdCgpIGlzIGNhbGxlZCBvbiBFMS5cbi8vIFdoZW4gdGhlIHJlY3Vyc2lvbiByZXR1cm5zIHRoZSBpbml0SW5kZXggd2lsbCBiZSA3IHNvIEUxIGlzIHNraXBwZWQgYXMgaXRcbi8vIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkIGluIHRoZSByZWN1cnNpdmVseSBjYWxsZWQgY2hlY2tBblVwZGF0ZVZpZXcoKS5cbmV4cG9ydCBmdW5jdGlvbiBjYWxsTGlmZWN5Y2xlSG9va3NDaGlsZHJlbkZpcnN0KHZpZXc6IFZpZXdEYXRhLCBsaWZlY3ljbGVzOiBOb2RlRmxhZ3MpIHtcbiAgaWYgKCEodmlldy5kZWYubm9kZUZsYWdzICYgbGlmZWN5Y2xlcykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgbm9kZXMgPSB2aWV3LmRlZi5ub2RlcztcbiAgbGV0IGluaXRJbmRleCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gbm9kZXNbaV07XG4gICAgbGV0IHBhcmVudCA9IG5vZGVEZWYucGFyZW50O1xuICAgIGlmICghcGFyZW50ICYmIG5vZGVEZWYuZmxhZ3MgJiBsaWZlY3ljbGVzKSB7XG4gICAgICAvLyBtYXRjaGluZyByb290IG5vZGUgKGUuZy4gYSBwaXBlKVxuICAgICAgY2FsbFByb3ZpZGVyTGlmZWN5Y2xlcyh2aWV3LCBpLCBub2RlRGVmLmZsYWdzICYgbGlmZWN5Y2xlcywgaW5pdEluZGV4KyspO1xuICAgIH1cbiAgICBpZiAoKG5vZGVEZWYuY2hpbGRGbGFncyAmIGxpZmVjeWNsZXMpID09PSAwKSB7XG4gICAgICAvLyBubyBjaGlsZCBtYXRjaGVzIG9uZSBvZiB0aGUgbGlmZWN5Y2xlc1xuICAgICAgaSArPSBub2RlRGVmLmNoaWxkQ291bnQ7XG4gICAgfVxuICAgIHdoaWxlIChwYXJlbnQgJiYgKHBhcmVudC5mbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkgJiZcbiAgICAgICAgICAgaSA9PT0gcGFyZW50Lm5vZGVJbmRleCArIHBhcmVudC5jaGlsZENvdW50KSB7XG4gICAgICAvLyBsYXN0IGNoaWxkIG9mIGFuIGVsZW1lbnRcbiAgICAgIGlmIChwYXJlbnQuZGlyZWN0Q2hpbGRGbGFncyAmIGxpZmVjeWNsZXMpIHtcbiAgICAgICAgaW5pdEluZGV4ID0gY2FsbEVsZW1lbnRQcm92aWRlcnNMaWZlY3ljbGVzKHZpZXcsIHBhcmVudCwgbGlmZWN5Y2xlcywgaW5pdEluZGV4KTtcbiAgICAgIH1cbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxFbGVtZW50UHJvdmlkZXJzTGlmZWN5Y2xlcyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgZWxEZWY6IE5vZGVEZWYsIGxpZmVjeWNsZXM6IE5vZGVGbGFncywgaW5pdEluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICBmb3IgKGxldCBpID0gZWxEZWYubm9kZUluZGV4ICsgMTsgaSA8PSBlbERlZi5ub2RlSW5kZXggKyBlbERlZi5jaGlsZENvdW50OyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBsaWZlY3ljbGVzKSB7XG4gICAgICBjYWxsUHJvdmlkZXJMaWZlY3ljbGVzKHZpZXcsIGksIG5vZGVEZWYuZmxhZ3MgJiBsaWZlY3ljbGVzLCBpbml0SW5kZXgrKyk7XG4gICAgfVxuICAgIC8vIG9ubHkgdmlzaXQgZGlyZWN0IGNoaWxkcmVuXG4gICAgaSArPSBub2RlRGVmLmNoaWxkQ291bnQ7XG4gIH1cbiAgcmV0dXJuIGluaXRJbmRleDtcbn1cblxuZnVuY3Rpb24gY2FsbFByb3ZpZGVyTGlmZWN5Y2xlcyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgaW5kZXg6IG51bWJlciwgbGlmZWN5Y2xlczogTm9kZUZsYWdzLCBpbml0SW5kZXg6IG51bWJlcikge1xuICBjb25zdCBwcm92aWRlckRhdGEgPSBhc1Byb3ZpZGVyRGF0YSh2aWV3LCBpbmRleCk7XG4gIGlmICghcHJvdmlkZXJEYXRhKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHByb3ZpZGVyID0gcHJvdmlkZXJEYXRhLmluc3RhbmNlO1xuICBpZiAoIXByb3ZpZGVyKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIFNlcnZpY2VzLnNldEN1cnJlbnROb2RlKHZpZXcsIGluZGV4KTtcbiAgaWYgKGxpZmVjeWNsZXMgJiBOb2RlRmxhZ3MuQWZ0ZXJDb250ZW50SW5pdCAmJlxuICAgICAgc2hvdWxkQ2FsbExpZmVjeWNsZUluaXRIb29rKHZpZXcsIFZpZXdTdGF0ZS5Jbml0U3RhdGVfQ2FsbGluZ0FmdGVyQ29udGVudEluaXQsIGluaXRJbmRleCkpIHtcbiAgICBwcm92aWRlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgfVxuICBpZiAobGlmZWN5Y2xlcyAmIE5vZGVGbGFncy5BZnRlckNvbnRlbnRDaGVja2VkKSB7XG4gICAgcHJvdmlkZXIubmdBZnRlckNvbnRlbnRDaGVja2VkKCk7XG4gIH1cbiAgaWYgKGxpZmVjeWNsZXMgJiBOb2RlRmxhZ3MuQWZ0ZXJWaWV3SW5pdCAmJlxuICAgICAgc2hvdWxkQ2FsbExpZmVjeWNsZUluaXRIb29rKHZpZXcsIFZpZXdTdGF0ZS5Jbml0U3RhdGVfQ2FsbGluZ0FmdGVyVmlld0luaXQsIGluaXRJbmRleCkpIHtcbiAgICBwcm92aWRlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgfVxuICBpZiAobGlmZWN5Y2xlcyAmIE5vZGVGbGFncy5BZnRlclZpZXdDaGVja2VkKSB7XG4gICAgcHJvdmlkZXIubmdBZnRlclZpZXdDaGVja2VkKCk7XG4gIH1cbiAgaWYgKGxpZmVjeWNsZXMgJiBOb2RlRmxhZ3MuT25EZXN0cm95KSB7XG4gICAgcHJvdmlkZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxufVxuIl19