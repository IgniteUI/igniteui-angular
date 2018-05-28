/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { checkAndUpdateElementDynamic, checkAndUpdateElementInline, createElement, listenToElementOutputs } from './element';
import { expressionChangedAfterItHasBeenCheckedError } from './errors';
import { appendNgContent } from './ng_content';
import { callLifecycleHooksChildrenFirst, checkAndUpdateDirectiveDynamic, checkAndUpdateDirectiveInline, createDirectiveInstance, createPipeInstance, createProviderInstance } from './provider';
import { checkAndUpdatePureExpressionDynamic, checkAndUpdatePureExpressionInline, createPureExpression } from './pure_expression';
import { checkAndUpdateQuery, createQuery } from './query';
import { createTemplateData, createViewContainerData } from './refs';
import { checkAndUpdateTextDynamic, checkAndUpdateTextInline, createText } from './text';
import { Services, asElementData, asQueryList, asTextData, shiftInitState } from './types';
import { NOOP, checkBindingNoChanges, isComponentView, markParentViewsForCheckProjectedViews, resolveDefinition, tokenKey } from './util';
import { detachProjectedView } from './view_attach';
export function viewDef(flags, nodes, updateDirectives, updateRenderer) {
    // clone nodes and set auto calculated values
    var viewBindingCount = 0;
    var viewDisposableCount = 0;
    var viewNodeFlags = 0;
    var viewRootNodeFlags = 0;
    var viewMatchedQueries = 0;
    var currentParent = null;
    var currentRenderParent = null;
    var currentElementHasPublicProviders = false;
    var currentElementHasPrivateProviders = false;
    var lastRenderRootNode = null;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.nodeIndex = i;
        node.parent = currentParent;
        node.bindingIndex = viewBindingCount;
        node.outputIndex = viewDisposableCount;
        node.renderParent = currentRenderParent;
        viewNodeFlags |= node.flags;
        viewMatchedQueries |= node.matchedQueryIds;
        if (node.element) {
            var elDef = node.element;
            elDef.publicProviders =
                currentParent ? currentParent.element.publicProviders : Object.create(null);
            elDef.allProviders = elDef.publicProviders;
            // Note: We assume that all providers of an element are before any child element!
            currentElementHasPublicProviders = false;
            currentElementHasPrivateProviders = false;
            if (node.element.template) {
                viewMatchedQueries |= node.element.template.nodeMatchedQueries;
            }
        }
        validateNode(currentParent, node, nodes.length);
        viewBindingCount += node.bindings.length;
        viewDisposableCount += node.outputs.length;
        if (!currentRenderParent && (node.flags & 3 /* CatRenderNode */)) {
            lastRenderRootNode = node;
        }
        if (node.flags & 20224 /* CatProvider */) {
            if (!currentElementHasPublicProviders) {
                currentElementHasPublicProviders = true;
                // Use prototypical inheritance to not get O(n^2) complexity...
                // Use prototypical inheritance to not get O(n^2) complexity...
                currentParent.element.publicProviders =
                    Object.create(currentParent.element.publicProviders);
                currentParent.element.allProviders = currentParent.element.publicProviders;
            }
            var isPrivateService = (node.flags & 8192 /* PrivateProvider */) !== 0;
            var isComponent = (node.flags & 32768 /* Component */) !== 0;
            if (!isPrivateService || isComponent) {
                currentParent.element.publicProviders[tokenKey(node.provider.token)] = node;
            }
            else {
                if (!currentElementHasPrivateProviders) {
                    currentElementHasPrivateProviders = true;
                    // Use prototypical inheritance to not get O(n^2) complexity...
                    // Use prototypical inheritance to not get O(n^2) complexity...
                    currentParent.element.allProviders =
                        Object.create(currentParent.element.publicProviders);
                }
                currentParent.element.allProviders[tokenKey(node.provider.token)] = node;
            }
            if (isComponent) {
                currentParent.element.componentProvider = node;
            }
        }
        if (currentParent) {
            currentParent.childFlags |= node.flags;
            currentParent.directChildFlags |= node.flags;
            currentParent.childMatchedQueries |= node.matchedQueryIds;
            if (node.element && node.element.template) {
                currentParent.childMatchedQueries |= node.element.template.nodeMatchedQueries;
            }
        }
        else {
            viewRootNodeFlags |= node.flags;
        }
        if (node.childCount > 0) {
            currentParent = node;
            if (!isNgContainer(node)) {
                currentRenderParent = node;
            }
        }
        else {
            // When the current node has no children, check if it is the last children of its parent.
            // When it is, propagate the flags up.
            // The loop is required because an element could be the last transitive children of several
            // elements. We loop to either the root or the highest opened element (= with remaining
            // children)
            while (currentParent && i === currentParent.nodeIndex + currentParent.childCount) {
                var newParent = currentParent.parent;
                if (newParent) {
                    newParent.childFlags |= currentParent.childFlags;
                    newParent.childMatchedQueries |= currentParent.childMatchedQueries;
                }
                currentParent = newParent;
                // We also need to update the render parent & account for ng-container
                if (currentParent && isNgContainer(currentParent)) {
                    currentRenderParent = currentParent.renderParent;
                }
                else {
                    currentRenderParent = currentParent;
                }
            }
        }
    }
    var handleEvent = function (view, nodeIndex, eventName, event) {
        return nodes[nodeIndex].element.handleEvent(view, eventName, event);
    };
    return {
        // Will be filled later...
        factory: null,
        nodeFlags: viewNodeFlags,
        rootNodeFlags: viewRootNodeFlags,
        nodeMatchedQueries: viewMatchedQueries, flags: flags,
        nodes: nodes,
        updateDirectives: updateDirectives || NOOP,
        updateRenderer: updateRenderer || NOOP, handleEvent: handleEvent,
        bindingCount: viewBindingCount,
        outputCount: viewDisposableCount, lastRenderRootNode: lastRenderRootNode
    };
}
function isNgContainer(node) {
    return (node.flags & 1 /* TypeElement */) !== 0 && node.element.name === null;
}
function validateNode(parent, node, nodeCount) {
    var template = node.element && node.element.template;
    if (template) {
        if (!template.lastRenderRootNode) {
            throw new Error("Illegal State: Embedded templates without nodes are not allowed!");
        }
        if (template.lastRenderRootNode &&
            template.lastRenderRootNode.flags & 16777216 /* EmbeddedViews */) {
            throw new Error("Illegal State: Last root node of a template can't have embedded views, at index " + node.nodeIndex + "!");
        }
    }
    if (node.flags & 20224 /* CatProvider */) {
        var parentFlags = parent ? parent.flags : 0;
        if ((parentFlags & 1 /* TypeElement */) === 0) {
            throw new Error("Illegal State: StaticProvider/Directive nodes need to be children of elements or anchors, at index " + node.nodeIndex + "!");
        }
    }
    if (node.query) {
        if (node.flags & 67108864 /* TypeContentQuery */ &&
            (!parent || (parent.flags & 16384 /* TypeDirective */) === 0)) {
            throw new Error("Illegal State: Content Query nodes need to be children of directives, at index " + node.nodeIndex + "!");
        }
        if (node.flags & 134217728 /* TypeViewQuery */ && parent) {
            throw new Error("Illegal State: View Query nodes have to be top level nodes, at index " + node.nodeIndex + "!");
        }
    }
    if (node.childCount) {
        var parentEnd = parent ? parent.nodeIndex + parent.childCount : nodeCount - 1;
        if (node.nodeIndex <= parentEnd && node.nodeIndex + node.childCount > parentEnd) {
            throw new Error("Illegal State: childCount of node leads outside of parent, at index " + node.nodeIndex + "!");
        }
    }
}
export function createEmbeddedView(parent, anchorDef, viewDef, context) {
    // embedded views are seen as siblings to the anchor, so we need
    // to get the parent of the anchor and use it as parentIndex.
    var view = createView(parent.root, parent.renderer, parent, anchorDef, viewDef);
    initView(view, parent.component, context);
    createViewNodes(view);
    return view;
}
export function createRootView(root, def, context) {
    var view = createView(root, root.renderer, null, null, def);
    initView(view, context, context);
    createViewNodes(view);
    return view;
}
export function createComponentView(parentView, nodeDef, viewDef, hostElement) {
    var rendererType = nodeDef.element.componentRendererType;
    var compRenderer;
    if (!rendererType) {
        compRenderer = parentView.root.renderer;
    }
    else {
        compRenderer = parentView.root.rendererFactory.createRenderer(hostElement, rendererType);
    }
    return createView(parentView.root, compRenderer, parentView, nodeDef.element.componentProvider, viewDef);
}
function createView(root, renderer, parent, parentNodeDef, def) {
    var nodes = new Array(def.nodes.length);
    var disposables = def.outputCount ? new Array(def.outputCount) : null;
    var view = {
        def: def,
        parent: parent,
        viewContainerParent: null, parentNodeDef: parentNodeDef,
        context: null,
        component: null, nodes: nodes,
        state: 13 /* CatInit */, root: root, renderer: renderer,
        oldValues: new Array(def.bindingCount), disposables: disposables,
        initIndex: -1
    };
    return view;
}
function initView(view, component, context) {
    view.component = component;
    view.context = context;
}
function createViewNodes(view) {
    var renderHost;
    if (isComponentView(view)) {
        var hostDef = view.parentNodeDef;
        renderHost = asElementData((view.parent), hostDef.parent.nodeIndex).renderElement;
    }
    var def = view.def;
    var nodes = view.nodes;
    for (var i = 0; i < def.nodes.length; i++) {
        var nodeDef = def.nodes[i];
        Services.setCurrentNode(view, i);
        var nodeData = void 0;
        switch (nodeDef.flags & 201347067 /* Types */) {
            case 1 /* TypeElement */:
                var el = createElement(view, renderHost, nodeDef);
                var componentView = (undefined);
                if (nodeDef.flags & 33554432 /* ComponentView */) {
                    var compViewDef = resolveDefinition((nodeDef.element.componentView));
                    componentView = Services.createComponentView(view, nodeDef, compViewDef, el);
                }
                listenToElementOutputs(view, componentView, nodeDef, el);
                nodeData = {
                    renderElement: el,
                    componentView: componentView,
                    viewContainer: null,
                    template: nodeDef.element.template ? createTemplateData(view, nodeDef) : undefined
                };
                if (nodeDef.flags & 16777216 /* EmbeddedViews */) {
                    nodeData.viewContainer = createViewContainerData(view, nodeDef, nodeData);
                }
                break;
            case 2 /* TypeText */:
                nodeData = createText(view, renderHost, nodeDef);
                break;
            case 512 /* TypeClassProvider */:
            case 1024 /* TypeFactoryProvider */:
            case 2048 /* TypeUseExistingProvider */:
            case 256 /* TypeValueProvider */: {
                nodeData = nodes[i];
                if (!nodeData && !(nodeDef.flags & 4096 /* LazyProvider */)) {
                    var instance = createProviderInstance(view, nodeDef);
                    nodeData = { instance: instance };
                }
                break;
            }
            case 16 /* TypePipe */: {
                var instance = createPipeInstance(view, nodeDef);
                nodeData = { instance: instance };
                break;
            }
            case 16384 /* TypeDirective */: {
                nodeData = nodes[i];
                if (!nodeData) {
                    var instance = createDirectiveInstance(view, nodeDef);
                    nodeData = { instance: instance };
                }
                if (nodeDef.flags & 32768 /* Component */) {
                    var compView = asElementData(view, nodeDef.parent.nodeIndex).componentView;
                    initView(compView, nodeData.instance, nodeData.instance);
                }
                break;
            }
            case 32 /* TypePureArray */:
            case 64 /* TypePureObject */:
            case 128 /* TypePurePipe */:
                nodeData = createPureExpression(view, nodeDef);
                break;
            case 67108864 /* TypeContentQuery */:
            case 134217728 /* TypeViewQuery */:
                nodeData = createQuery();
                break;
            case 8 /* TypeNgContent */:
                appendNgContent(view, renderHost, nodeDef);
                // no runtime data needed for NgContent...
                nodeData = undefined;
                break;
        }
        nodes[i] = nodeData;
    }
    // Create the ViewData.nodes of component views after we created everything else,
    // so that e.g. ng-content works
    execComponentViewsAction(view, ViewAction.CreateViewNodes);
    // fill static content and view queries
    execQueriesAction(view, 67108864 /* TypeContentQuery */ | 134217728 /* TypeViewQuery */, 268435456 /* StaticQuery */, 0 /* CheckAndUpdate */);
}
export function checkNoChangesView(view) {
    markProjectedViewsForCheck(view);
    Services.updateDirectives(view, 1 /* CheckNoChanges */);
    execEmbeddedViewsAction(view, ViewAction.CheckNoChanges);
    Services.updateRenderer(view, 1 /* CheckNoChanges */);
    execComponentViewsAction(view, ViewAction.CheckNoChanges);
    // Note: We don't check queries for changes as we didn't do this in v2.x.
    // TODO(tbosch): investigate if we can enable the check again in v5.x with a nicer error message.
    view.state &= ~(64 /* CheckProjectedViews */ | 32 /* CheckProjectedView */);
}
export function checkAndUpdateView(view) {
    if (view.state & 1 /* BeforeFirstCheck */) {
        view.state &= ~1 /* BeforeFirstCheck */;
        view.state |= 2 /* FirstCheck */;
    }
    else {
        view.state &= ~2 /* FirstCheck */;
    }
    shiftInitState(view, 0 /* InitState_BeforeInit */, 256 /* InitState_CallingOnInit */);
    markProjectedViewsForCheck(view);
    Services.updateDirectives(view, 0 /* CheckAndUpdate */);
    execEmbeddedViewsAction(view, ViewAction.CheckAndUpdate);
    execQueriesAction(view, 67108864 /* TypeContentQuery */, 536870912 /* DynamicQuery */, 0 /* CheckAndUpdate */);
    var callInit = shiftInitState(view, 256 /* InitState_CallingOnInit */, 512 /* InitState_CallingAfterContentInit */);
    callLifecycleHooksChildrenFirst(view, 2097152 /* AfterContentChecked */ | (callInit ? 1048576 /* AfterContentInit */ : 0));
    Services.updateRenderer(view, 0 /* CheckAndUpdate */);
    execComponentViewsAction(view, ViewAction.CheckAndUpdate);
    execQueriesAction(view, 134217728 /* TypeViewQuery */, 536870912 /* DynamicQuery */, 0 /* CheckAndUpdate */);
    callInit = shiftInitState(view, 512 /* InitState_CallingAfterContentInit */, 768 /* InitState_CallingAfterViewInit */);
    callLifecycleHooksChildrenFirst(view, 8388608 /* AfterViewChecked */ | (callInit ? 4194304 /* AfterViewInit */ : 0));
    if (view.def.flags & 2 /* OnPush */) {
        view.state &= ~8 /* ChecksEnabled */;
    }
    view.state &= ~(64 /* CheckProjectedViews */ | 32 /* CheckProjectedView */);
    shiftInitState(view, 768 /* InitState_CallingAfterViewInit */, 1024 /* InitState_AfterInit */);
}
export function checkAndUpdateNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    if (argStyle === 0 /* Inline */) {
        return checkAndUpdateNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    }
    else {
        return checkAndUpdateNodeDynamic(view, nodeDef, v0);
    }
}
function markProjectedViewsForCheck(view) {
    var def = view.def;
    if (!(def.nodeFlags & 4 /* ProjectedTemplate */)) {
        return;
    }
    for (var i = 0; i < def.nodes.length; i++) {
        var nodeDef = def.nodes[i];
        if (nodeDef.flags & 4 /* ProjectedTemplate */) {
            var projectedViews = asElementData(view, i).template._projectedViews;
            if (projectedViews) {
                for (var i_1 = 0; i_1 < projectedViews.length; i_1++) {
                    var projectedView = projectedViews[i_1];
                    projectedView.state |= 32 /* CheckProjectedView */;
                    markParentViewsForCheckProjectedViews(projectedView, view);
                }
            }
        }
        else if ((nodeDef.childFlags & 4 /* ProjectedTemplate */) === 0) {
            // a parent with leafs
            // no child is a component,
            // then skip the children
            i += nodeDef.childCount;
        }
    }
}
function checkAndUpdateNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    switch (nodeDef.flags & 201347067 /* Types */) {
        case 1 /* TypeElement */:
            return checkAndUpdateElementInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        case 2 /* TypeText */:
            return checkAndUpdateTextInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        case 16384 /* TypeDirective */:
            return checkAndUpdateDirectiveInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        case 32 /* TypePureArray */:
        case 64 /* TypePureObject */:
        case 128 /* TypePurePipe */:
            return checkAndUpdatePureExpressionInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        default:
            throw 'unreachable';
    }
}
function checkAndUpdateNodeDynamic(view, nodeDef, values) {
    switch (nodeDef.flags & 201347067 /* Types */) {
        case 1 /* TypeElement */:
            return checkAndUpdateElementDynamic(view, nodeDef, values);
        case 2 /* TypeText */:
            return checkAndUpdateTextDynamic(view, nodeDef, values);
        case 16384 /* TypeDirective */:
            return checkAndUpdateDirectiveDynamic(view, nodeDef, values);
        case 32 /* TypePureArray */:
        case 64 /* TypePureObject */:
        case 128 /* TypePurePipe */:
            return checkAndUpdatePureExpressionDynamic(view, nodeDef, values);
        default:
            throw 'unreachable';
    }
}
export function checkNoChangesNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    if (argStyle === 0 /* Inline */) {
        checkNoChangesNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    }
    else {
        checkNoChangesNodeDynamic(view, nodeDef, v0);
    }
    // Returning false is ok here as we would have thrown in case of a change.
    return false;
}
function checkNoChangesNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    var bindLen = nodeDef.bindings.length;
    if (bindLen > 0)
        checkBindingNoChanges(view, nodeDef, 0, v0);
    if (bindLen > 1)
        checkBindingNoChanges(view, nodeDef, 1, v1);
    if (bindLen > 2)
        checkBindingNoChanges(view, nodeDef, 2, v2);
    if (bindLen > 3)
        checkBindingNoChanges(view, nodeDef, 3, v3);
    if (bindLen > 4)
        checkBindingNoChanges(view, nodeDef, 4, v4);
    if (bindLen > 5)
        checkBindingNoChanges(view, nodeDef, 5, v5);
    if (bindLen > 6)
        checkBindingNoChanges(view, nodeDef, 6, v6);
    if (bindLen > 7)
        checkBindingNoChanges(view, nodeDef, 7, v7);
    if (bindLen > 8)
        checkBindingNoChanges(view, nodeDef, 8, v8);
    if (bindLen > 9)
        checkBindingNoChanges(view, nodeDef, 9, v9);
}
function checkNoChangesNodeDynamic(view, nodeDef, values) {
    for (var i = 0; i < values.length; i++) {
        checkBindingNoChanges(view, nodeDef, i, values[i]);
    }
}
/**
 * Workaround https://github.com/angular/tsickle/issues/497
 * @suppress {misplacedTypeAnnotation}
 */
function checkNoChangesQuery(view, nodeDef) {
    var queryList = asQueryList(view, nodeDef.nodeIndex);
    if (queryList.dirty) {
        throw expressionChangedAfterItHasBeenCheckedError(Services.createDebugContext(view, nodeDef.nodeIndex), "Query " + nodeDef.query.id + " not dirty", "Query " + nodeDef.query.id + " dirty", (view.state & 1 /* BeforeFirstCheck */) !== 0);
    }
}
export function destroyView(view) {
    if (view.state & 128 /* Destroyed */) {
        return;
    }
    execEmbeddedViewsAction(view, ViewAction.Destroy);
    execComponentViewsAction(view, ViewAction.Destroy);
    callLifecycleHooksChildrenFirst(view, 131072 /* OnDestroy */);
    if (view.disposables) {
        for (var i = 0; i < view.disposables.length; i++) {
            view.disposables[i]();
        }
    }
    detachProjectedView(view);
    if (view.renderer.destroyNode) {
        destroyViewNodes(view);
    }
    if (isComponentView(view)) {
        view.renderer.destroy();
    }
    view.state |= 128 /* Destroyed */;
}
function destroyViewNodes(view) {
    var len = view.def.nodes.length;
    for (var i = 0; i < len; i++) {
        var def = view.def.nodes[i];
        if (def.flags & 1 /* TypeElement */) {
            view.renderer.destroyNode(asElementData(view, i).renderElement);
        }
        else if (def.flags & 2 /* TypeText */) {
            view.renderer.destroyNode(asTextData(view, i).renderText);
        }
        else if (def.flags & 67108864 /* TypeContentQuery */ || def.flags & 134217728 /* TypeViewQuery */) {
            asQueryList(view, i).destroy();
        }
    }
}
var ViewAction;
(function (ViewAction) {
    ViewAction[ViewAction["CreateViewNodes"] = 0] = "CreateViewNodes";
    ViewAction[ViewAction["CheckNoChanges"] = 1] = "CheckNoChanges";
    ViewAction[ViewAction["CheckNoChangesProjectedViews"] = 2] = "CheckNoChangesProjectedViews";
    ViewAction[ViewAction["CheckAndUpdate"] = 3] = "CheckAndUpdate";
    ViewAction[ViewAction["CheckAndUpdateProjectedViews"] = 4] = "CheckAndUpdateProjectedViews";
    ViewAction[ViewAction["Destroy"] = 5] = "Destroy";
})(ViewAction || (ViewAction = {}));
function execComponentViewsAction(view, action) {
    var def = view.def;
    if (!(def.nodeFlags & 33554432 /* ComponentView */)) {
        return;
    }
    for (var i = 0; i < def.nodes.length; i++) {
        var nodeDef = def.nodes[i];
        if (nodeDef.flags & 33554432 /* ComponentView */) {
            // a leaf
            callViewAction(asElementData(view, i).componentView, action);
        }
        else if ((nodeDef.childFlags & 33554432 /* ComponentView */) === 0) {
            // a parent with leafs
            // no child is a component,
            // then skip the children
            i += nodeDef.childCount;
        }
    }
}
function execEmbeddedViewsAction(view, action) {
    var def = view.def;
    if (!(def.nodeFlags & 16777216 /* EmbeddedViews */)) {
        return;
    }
    for (var i = 0; i < def.nodes.length; i++) {
        var nodeDef = def.nodes[i];
        if (nodeDef.flags & 16777216 /* EmbeddedViews */) {
            // a leaf
            var embeddedViews = asElementData(view, i).viewContainer._embeddedViews;
            for (var k = 0; k < embeddedViews.length; k++) {
                callViewAction(embeddedViews[k], action);
            }
        }
        else if ((nodeDef.childFlags & 16777216 /* EmbeddedViews */) === 0) {
            // a parent with leafs
            // no child is a component,
            // then skip the children
            i += nodeDef.childCount;
        }
    }
}
function callViewAction(view, action) {
    var viewState = view.state;
    switch (action) {
        case ViewAction.CheckNoChanges:
            if ((viewState & 128 /* Destroyed */) === 0) {
                if ((viewState & 12 /* CatDetectChanges */) === 12 /* CatDetectChanges */) {
                    checkNoChangesView(view);
                }
                else if (viewState & 64 /* CheckProjectedViews */) {
                    execProjectedViewsAction(view, ViewAction.CheckNoChangesProjectedViews);
                }
            }
            break;
        case ViewAction.CheckNoChangesProjectedViews:
            if ((viewState & 128 /* Destroyed */) === 0) {
                if (viewState & 32 /* CheckProjectedView */) {
                    checkNoChangesView(view);
                }
                else if (viewState & 64 /* CheckProjectedViews */) {
                    execProjectedViewsAction(view, action);
                }
            }
            break;
        case ViewAction.CheckAndUpdate:
            if ((viewState & 128 /* Destroyed */) === 0) {
                if ((viewState & 12 /* CatDetectChanges */) === 12 /* CatDetectChanges */) {
                    checkAndUpdateView(view);
                }
                else if (viewState & 64 /* CheckProjectedViews */) {
                    execProjectedViewsAction(view, ViewAction.CheckAndUpdateProjectedViews);
                }
            }
            break;
        case ViewAction.CheckAndUpdateProjectedViews:
            if ((viewState & 128 /* Destroyed */) === 0) {
                if (viewState & 32 /* CheckProjectedView */) {
                    checkAndUpdateView(view);
                }
                else if (viewState & 64 /* CheckProjectedViews */) {
                    execProjectedViewsAction(view, action);
                }
            }
            break;
        case ViewAction.Destroy:
            // Note: destroyView recurses over all views,
            // so we don't need to special case projected views here.
            destroyView(view);
            break;
        case ViewAction.CreateViewNodes:
            createViewNodes(view);
            break;
    }
}
function execProjectedViewsAction(view, action) {
    execEmbeddedViewsAction(view, action);
    execComponentViewsAction(view, action);
}
function execQueriesAction(view, queryFlags, staticDynamicQueryFlag, checkType) {
    if (!(view.def.nodeFlags & queryFlags) || !(view.def.nodeFlags & staticDynamicQueryFlag)) {
        return;
    }
    var nodeCount = view.def.nodes.length;
    for (var i = 0; i < nodeCount; i++) {
        var nodeDef = view.def.nodes[i];
        if ((nodeDef.flags & queryFlags) && (nodeDef.flags & staticDynamicQueryFlag)) {
            Services.setCurrentNode(view, nodeDef.nodeIndex);
            switch (checkType) {
                case 0 /* CheckAndUpdate */:
                    checkAndUpdateQuery(view, nodeDef);
                    break;
                case 1 /* CheckNoChanges */:
                    checkNoChangesQuery(view, nodeDef);
                    break;
            }
        }
        if (!(nodeDef.childFlags & queryFlags) || !(nodeDef.childFlags & staticDynamicQueryFlag)) {
            // no child has a matching query
            // then skip the children
            i += nodeDef.childCount;
        }
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBVUEsT0FBTyxFQUFDLDRCQUE0QixFQUFFLDJCQUEyQixFQUFFLGFBQWEsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUMzSCxPQUFPLEVBQUMsMkNBQTJDLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDckUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUMsK0JBQStCLEVBQUUsOEJBQThCLEVBQUUsNkJBQTZCLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDL0wsT0FBTyxFQUFDLG1DQUFtQyxFQUFFLGtDQUFrQyxFQUFFLG9CQUFvQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDaEksT0FBTyxFQUFDLG1CQUFtQixFQUFFLFdBQVcsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUN6RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDbkUsT0FBTyxFQUFDLHlCQUF5QixFQUFFLHdCQUF3QixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUN2RixPQUFPLEVBQTZGLFFBQVEsRUFBbUYsYUFBYSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQ3RRLE9BQU8sRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsZUFBZSxFQUFFLHFDQUFxQyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUN4SSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbEQsTUFBTSxrQkFDRixLQUFnQixFQUFFLEtBQWdCLEVBQUUsZ0JBQXNDLEVBQzFFLGNBQW9DOztJQUV0QyxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUN6QixJQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM1QixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFDdEIsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7SUFDMUIsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7SUFDM0IsSUFBSSxhQUFhLEdBQWlCLElBQUksQ0FBQztJQUN2QyxJQUFJLG1CQUFtQixHQUFpQixJQUFJLENBQUM7SUFDN0MsSUFBSSxnQ0FBZ0MsR0FBRyxLQUFLLENBQUM7SUFDN0MsSUFBSSxpQ0FBaUMsR0FBRyxLQUFLLENBQUM7SUFDOUMsSUFBSSxrQkFBa0IsR0FBaUIsSUFBSSxDQUFDO0lBQzVDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztRQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLGdCQUFnQixDQUFDO1FBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsbUJBQW1CLENBQUM7UUFDdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxtQkFBbUIsQ0FBQztRQUV4QyxhQUFhLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztRQUM1QixrQkFBa0IsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDO1FBRTNDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDM0IsS0FBSyxDQUFDLGVBQWU7Z0JBQ2pCLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEYsS0FBSyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDOztZQUUzQyxnQ0FBZ0MsR0FBRyxLQUFLLENBQUM7WUFDekMsaUNBQWlDLEdBQUcsS0FBSyxDQUFDO1lBRTFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsa0JBQWtCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUM7YUFDaEU7U0FDRjtRQUNELFlBQVksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUdoRCxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUN6QyxtQkFBbUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUUzQyxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssd0JBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1NBQzNCO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssMEJBQXdCLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7O2dCQUV4QyxBQURBLCtEQUErRDtnQkFDL0QsYUFBZSxDQUFDLE9BQVMsQ0FBQyxlQUFlO29CQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWUsQ0FBQyxPQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzdELGFBQWUsQ0FBQyxPQUFTLENBQUMsWUFBWSxHQUFHLGFBQWUsQ0FBQyxPQUFTLENBQUMsZUFBZSxDQUFDO2FBQ3BGO1lBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLDZCQUE0QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLElBQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssd0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxhQUFlLENBQUMsT0FBUyxDQUFDLGVBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDckY7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixFQUFFLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztvQkFDdkMsaUNBQWlDLEdBQUcsSUFBSSxDQUFDOztvQkFFekMsQUFEQSwrREFBK0Q7b0JBQy9ELGFBQWUsQ0FBQyxPQUFTLENBQUMsWUFBWTt3QkFDbEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFlLENBQUMsT0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUM5RDtnQkFDRCxhQUFlLENBQUMsT0FBUyxDQUFDLFlBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzthQUNsRjtZQUNELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLGFBQWUsQ0FBQyxPQUFTLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2FBQ3BEO1NBQ0Y7UUFFRCxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLGFBQWEsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN2QyxhQUFhLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM3QyxhQUFhLENBQUMsbUJBQW1CLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUMxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsYUFBYSxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDO2FBQy9FO1NBQ0Y7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLGlCQUFpQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDakM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsYUFBYSxHQUFHLElBQUksQ0FBQztZQUVyQixFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLG1CQUFtQixHQUFHLElBQUksQ0FBQzthQUM1QjtTQUNGO1FBQUMsSUFBSSxDQUFDLENBQUM7Ozs7OztZQU1OLE9BQU8sYUFBYSxJQUFJLENBQUMsS0FBSyxhQUFhLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDakYsSUFBTSxTQUFTLEdBQWlCLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQ3JELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsU0FBUyxDQUFDLFVBQVUsSUFBSSxhQUFhLENBQUMsVUFBVSxDQUFDO29CQUNqRCxTQUFTLENBQUMsbUJBQW1CLElBQUksYUFBYSxDQUFDLG1CQUFtQixDQUFDO2lCQUNwRTtnQkFDRCxhQUFhLEdBQUcsU0FBUyxDQUFDOztnQkFFMUIsRUFBRSxDQUFDLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xELG1CQUFtQixHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7aUJBQ2xEO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLG1CQUFtQixHQUFHLGFBQWEsQ0FBQztpQkFDckM7YUFDRjtTQUNGO0tBQ0Y7SUFFRCxJQUFNLFdBQVcsR0FBc0IsVUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLO1FBQ3JFLE9BQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQVMsQ0FBQyxXQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUM7SUFBaEUsQ0FBZ0UsQ0FBQztJQUVyRSxNQUFNLENBQUM7O1FBRUwsT0FBTyxFQUFFLElBQUk7UUFDYixTQUFTLEVBQUUsYUFBYTtRQUN4QixhQUFhLEVBQUUsaUJBQWlCO1FBQ2hDLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLEtBQUssT0FBQTtRQUM3QyxLQUFLLEVBQUUsS0FBSztRQUNaLGdCQUFnQixFQUFFLGdCQUFnQixJQUFJLElBQUk7UUFDMUMsY0FBYyxFQUFFLGNBQWMsSUFBSSxJQUFJLEVBQUUsV0FBVyxhQUFBO1FBQ25ELFlBQVksRUFBRSxnQkFBZ0I7UUFDOUIsV0FBVyxFQUFFLG1CQUFtQixFQUFFLGtCQUFrQixvQkFBQTtLQUNyRCxDQUFDO0NBQ0g7QUFFRCx1QkFBdUIsSUFBYTtJQUNsQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxzQkFBd0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBUyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUM7Q0FDbkY7QUFFRCxzQkFBc0IsTUFBc0IsRUFBRSxJQUFhLEVBQUUsU0FBaUI7SUFDNUUsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUN2RCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2IsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQztTQUNyRjtRQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0I7WUFDM0IsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEtBQUssK0JBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sSUFBSSxLQUFLLENBQ1gscUZBQW1GLElBQUksQ0FBQyxTQUFTLE1BQUcsQ0FBQyxDQUFDO1NBQzNHO0tBQ0Y7SUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSywwQkFBd0IsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLHNCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxNQUFNLElBQUksS0FBSyxDQUNYLHdHQUFzRyxJQUFJLENBQUMsU0FBUyxNQUFHLENBQUMsQ0FBQztTQUM5SDtLQUNGO0lBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDZixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxrQ0FBNkI7WUFDdkMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLDRCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sSUFBSSxLQUFLLENBQ1gsb0ZBQWtGLElBQUksQ0FBQyxTQUFTLE1BQUcsQ0FBQyxDQUFDO1NBQzFHO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssZ0NBQTBCLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksS0FBSyxDQUNYLDBFQUF3RSxJQUFJLENBQUMsU0FBUyxNQUFHLENBQUMsQ0FBQztTQUNoRztLQUNGO0lBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDaEYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEYsTUFBTSxJQUFJLEtBQUssQ0FDWCx5RUFBdUUsSUFBSSxDQUFDLFNBQVMsTUFBRyxDQUFDLENBQUM7U0FDL0Y7S0FDRjtDQUNGO0FBRUQsTUFBTSw2QkFDRixNQUFnQixFQUFFLFNBQWtCLEVBQUUsT0FBdUIsRUFBRSxPQUFhOzs7SUFHOUUsSUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xGLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMxQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQztDQUNiO0FBRUQsTUFBTSx5QkFBeUIsSUFBYyxFQUFFLEdBQW1CLEVBQUUsT0FBYTtJQUMvRSxJQUFNLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5RCxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQztDQUNiO0FBRUQsTUFBTSw4QkFDRixVQUFvQixFQUFFLE9BQWdCLEVBQUUsT0FBdUIsRUFBRSxXQUFnQjtJQUNuRixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsT0FBUyxDQUFDLHFCQUFxQixDQUFDO0lBQzdELElBQUksWUFBdUIsQ0FBQztJQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDbEIsWUFBWSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ3pDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixZQUFZLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUMxRjtJQUNELE1BQU0sQ0FBQyxVQUFVLENBQ2IsVUFBVSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxPQUFTLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDOUY7QUFFRCxvQkFDSSxJQUFjLEVBQUUsUUFBbUIsRUFBRSxNQUF1QixFQUFFLGFBQTZCLEVBQzNGLEdBQW1CO0lBQ3JCLElBQU0sS0FBSyxHQUFlLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEQsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDeEUsSUFBTSxJQUFJLEdBQWE7UUFDckIsR0FBRyxLQUFBO1FBQ0gsTUFBTSxRQUFBO1FBQ04sbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGFBQWEsZUFBQTtRQUN4QyxPQUFPLEVBQUUsSUFBSTtRQUNiLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxPQUFBO1FBQ3RCLEtBQUssa0JBQW1CLEVBQUUsSUFBSSxNQUFBLEVBQUUsUUFBUSxVQUFBO1FBQ3hDLFNBQVMsRUFBRSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsV0FBVyxhQUFBO1FBQ25ELFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDZCxDQUFDO0lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQztDQUNiO0FBRUQsa0JBQWtCLElBQWMsRUFBRSxTQUFjLEVBQUUsT0FBWTtJQUM1RCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztDQUN4QjtBQUVELHlCQUF5QixJQUFjO0lBQ3JDLElBQUksVUFBZSxDQUFDO0lBQ3BCLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNuQyxVQUFVLEdBQUcsYUFBYSxDQUFDLENBQUEsSUFBSSxDQUFDLE1BQVEsQ0FBQSxFQUFFLE9BQVMsQ0FBQyxNQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxDQUFDO0tBQ3ZGO0lBQ0QsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3pCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQyxJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksUUFBUSxTQUFLLENBQUM7UUFDbEIsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssd0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3hDO2dCQUNFLElBQU0sRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBUSxDQUFDO2dCQUMzRCxJQUFJLGFBQWEsR0FBYSxDQUFBLFNBQVcsQ0FBQSxDQUFDO2dCQUMxQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSywrQkFBMEIsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLElBQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLENBQUEsT0FBTyxDQUFDLE9BQVMsQ0FBQyxhQUFlLENBQUEsQ0FBQyxDQUFDO29CQUN6RSxhQUFhLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUM5RTtnQkFDRCxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDekQsUUFBUSxHQUFnQjtvQkFDdEIsYUFBYSxFQUFFLEVBQUU7b0JBQ2pCLGFBQWEsZUFBQTtvQkFDYixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQ3JGLENBQUM7Z0JBQ0YsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssK0JBQTBCLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxRQUFRLENBQUMsYUFBYSxHQUFHLHVCQUF1QixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQzNFO2dCQUNELEtBQUssQ0FBQztZQUNSO2dCQUNFLFFBQVEsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQVEsQ0FBQztnQkFDeEQsS0FBSyxDQUFDO1lBQ1IsaUNBQWlDO1lBQ2pDLG9DQUFtQztZQUNuQyx3Q0FBdUM7WUFDdkMsa0NBQWtDLENBQUM7Z0JBQ2pDLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSywwQkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0QsSUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUN2RCxRQUFRLEdBQWlCLEVBQUMsUUFBUSxVQUFBLEVBQUMsQ0FBQztpQkFDckM7Z0JBQ0QsS0FBSyxDQUFDO2FBQ1A7WUFDRCx3QkFBeUIsQ0FBQztnQkFDeEIsSUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNuRCxRQUFRLEdBQWlCLEVBQUMsUUFBUSxVQUFBLEVBQUMsQ0FBQztnQkFDcEMsS0FBSyxDQUFDO2FBQ1A7WUFDRCxnQ0FBOEIsQ0FBQztnQkFDN0IsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNkLElBQU0sUUFBUSxHQUFHLHVCQUF1QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDeEQsUUFBUSxHQUFpQixFQUFDLFFBQVEsVUFBQSxFQUFDLENBQUM7aUJBQ3JDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLHdCQUFzQixDQUFDLENBQUMsQ0FBQztvQkFDeEMsSUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztvQkFDL0UsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDMUQ7Z0JBQ0QsS0FBSyxDQUFDO2FBQ1A7WUFDRCw0QkFBNkI7WUFDN0IsNkJBQThCO1lBQzlCO2dCQUNFLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFRLENBQUM7Z0JBQ3RELEtBQUssQ0FBQztZQUNSLHFDQUFnQztZQUNoQztnQkFDRSxRQUFRLEdBQUcsV0FBVyxFQUFTLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQztZQUNSO2dCQUNFLGVBQWUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztnQkFFM0MsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFDckIsS0FBSyxDQUFDO1NBQ1Q7UUFDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO0tBQ3JCOzs7SUFHRCx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDOztJQUczRCxpQkFBaUIsQ0FDYixJQUFJLEVBQUUsK0RBQW9ELHNEQUNqQyxDQUFDO0NBQy9CO0FBRUQsTUFBTSw2QkFBNkIsSUFBYztJQUMvQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSx5QkFBMkIsQ0FBQztJQUMxRCx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pELFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSx5QkFBMkIsQ0FBQztJQUN4RCx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDOzs7SUFHMUQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsMERBQTRELENBQUMsQ0FBQztDQUMvRTtBQUVELE1BQU0sNkJBQTZCLElBQWM7SUFDL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssMkJBQTZCLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxLQUFLLElBQUkseUJBQTJCLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssc0JBQXdCLENBQUM7S0FDcEM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksQ0FBQyxLQUFLLElBQUksbUJBQXFCLENBQUM7S0FDckM7SUFDRCxjQUFjLENBQUMsSUFBSSxrRUFBb0UsQ0FBQztJQUN4RiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSx5QkFBMkIsQ0FBQztJQUMxRCx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pELGlCQUFpQixDQUNiLElBQUksd0ZBQStFLENBQUM7SUFDeEYsSUFBSSxRQUFRLEdBQUcsY0FBYyxDQUN6QixJQUFJLGlGQUFpRixDQUFDO0lBQzFGLCtCQUErQixDQUMzQixJQUFJLEVBQUUsb0NBQWdDLENBQUMsUUFBUSxDQUFDLENBQUMsZ0NBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXZGLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSx5QkFBMkIsQ0FBQztJQUV4RCx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFELGlCQUFpQixDQUNiLElBQUksc0ZBQTRFLENBQUM7SUFDckYsUUFBUSxHQUFHLGNBQWMsQ0FDckIsSUFBSSx3RkFBd0YsQ0FBQztJQUNqRywrQkFBK0IsQ0FDM0IsSUFBSSxFQUFFLGlDQUE2QixDQUFDLFFBQVEsQ0FBQyxDQUFDLDZCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssaUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxLQUFLLElBQUksc0JBQXdCLENBQUM7S0FDeEM7SUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQywwREFBNEQsQ0FBQyxDQUFDO0lBQzlFLGNBQWMsQ0FBQyxJQUFJLDJFQUEwRSxDQUFDO0NBQy9GO0FBRUQsTUFBTSw2QkFDRixJQUFjLEVBQUUsT0FBZ0IsRUFBRSxRQUFzQixFQUFFLEVBQVEsRUFBRSxFQUFRLEVBQUUsRUFBUSxFQUN0RixFQUFRLEVBQUUsRUFBUSxFQUFFLEVBQVEsRUFBRSxFQUFRLEVBQUUsRUFBUSxFQUFFLEVBQVEsRUFBRSxFQUFRO0lBQ3RFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsbUJBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3hGO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNyRDtDQUNGO0FBRUQsb0NBQW9DLElBQWM7SUFDaEQsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsNEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDO0tBQ1I7SUFDRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDMUMsSUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyw0QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO1lBQ3ZFLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBQyxHQUFHLENBQUMsRUFBRSxHQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFDLEVBQUUsRUFBRSxDQUFDO29CQUMvQyxJQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBQyxDQUFDLENBQUM7b0JBQ3hDLGFBQWEsQ0FBQyxLQUFLLCtCQUFnQyxDQUFDO29CQUNwRCxxQ0FBcUMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQzVEO2FBQ0Y7U0FDRjtRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLDRCQUE4QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztZQUlwRSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUN6QjtLQUNGO0NBQ0Y7QUFFRCxrQ0FDSSxJQUFjLEVBQUUsT0FBZ0IsRUFBRSxFQUFRLEVBQUUsRUFBUSxFQUFFLEVBQVEsRUFBRSxFQUFRLEVBQUUsRUFBUSxFQUFFLEVBQVEsRUFDNUYsRUFBUSxFQUFFLEVBQVEsRUFBRSxFQUFRLEVBQUUsRUFBUTtJQUN4QyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyx3QkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDeEM7WUFDRSxNQUFNLENBQUMsMkJBQTJCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RjtZQUNFLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pGO1lBQ0UsTUFBTSxDQUFDLDZCQUE2QixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUYsNEJBQTZCO1FBQzdCLDZCQUE4QjtRQUM5QjtZQUNFLE1BQU0sQ0FBQyxrQ0FBa0MsQ0FDckMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RDtZQUNFLE1BQU0sYUFBYSxDQUFDO0tBQ3ZCO0NBQ0Y7QUFFRCxtQ0FBbUMsSUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBYTtJQUNoRixNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyx3QkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDeEM7WUFDRSxNQUFNLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3RDtZQUNFLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFEO1lBQ0UsTUFBTSxDQUFDLDhCQUE4QixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDL0QsNEJBQTZCO1FBQzdCLDZCQUE4QjtRQUM5QjtZQUNFLE1BQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BFO1lBQ0UsTUFBTSxhQUFhLENBQUM7S0FDdkI7Q0FDRjtBQUVELE1BQU0sNkJBQ0YsSUFBYyxFQUFFLE9BQWdCLEVBQUUsUUFBc0IsRUFBRSxFQUFRLEVBQUUsRUFBUSxFQUFFLEVBQVEsRUFDdEYsRUFBUSxFQUFFLEVBQVEsRUFBRSxFQUFRLEVBQUUsRUFBUSxFQUFFLEVBQVEsRUFBRSxFQUFRLEVBQUUsRUFBUTtJQUN0RSxFQUFFLENBQUMsQ0FBQyxRQUFRLG1CQUF3QixDQUFDLENBQUMsQ0FBQztRQUNyQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ2pGO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTix5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzlDOztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUM7Q0FDZDtBQUVELGtDQUNJLElBQWMsRUFBRSxPQUFnQixFQUFFLEVBQU8sRUFBRSxFQUFPLEVBQUUsRUFBTyxFQUFFLEVBQU8sRUFBRSxFQUFPLEVBQUUsRUFBTyxFQUFFLEVBQU8sRUFDL0YsRUFBTyxFQUFFLEVBQU8sRUFBRSxFQUFPO0lBQzNCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ3hDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RCxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0QsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzdELEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RCxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0QsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzdELEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RCxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0QsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzdELEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUM5RDtBQUVELG1DQUFtQyxJQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFhO0lBQ2hGLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3ZDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BEO0NBQ0Y7Ozs7O0FBTUQsNkJBQTZCLElBQWMsRUFBRSxPQUFnQjtJQUMzRCxJQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLDJDQUEyQyxDQUM3QyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDcEQsV0FBUyxPQUFPLENBQUMsS0FBTSxDQUFDLEVBQUUsZUFBWSxFQUFFLFdBQVMsT0FBTyxDQUFDLEtBQU0sQ0FBQyxFQUFFLFdBQVEsRUFDMUUsQ0FBQyxJQUFJLENBQUMsS0FBSywyQkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3REO0NBQ0Y7QUFFRCxNQUFNLHNCQUFzQixJQUFjO0lBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUM7S0FDUjtJQUNELHVCQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEQsd0JBQXdCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuRCwrQkFBK0IsQ0FBQyxJQUFJLHlCQUFzQixDQUFDO0lBQzNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDdkI7S0FDRjtJQUNELG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM5QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN4QjtJQUNELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6QjtJQUNELElBQUksQ0FBQyxLQUFLLHVCQUF1QixDQUFDO0NBQ25DO0FBRUQsMEJBQTBCLElBQWM7SUFDdEMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2xDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDN0IsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssc0JBQXdCLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDbkU7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssbUJBQXFCLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDN0Q7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssa0NBQTZCLElBQUksR0FBRyxDQUFDLEtBQUssZ0NBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEM7S0FDRjtDQUNGO0FBRUQsSUFBSyxVQU9KO0FBUEQsV0FBSyxVQUFVO0lBQ2IsaUVBQWUsQ0FBQTtJQUNmLCtEQUFjLENBQUE7SUFDZCwyRkFBNEIsQ0FBQTtJQUM1QiwrREFBYyxDQUFBO0lBQ2QsMkZBQTRCLENBQUE7SUFDNUIsaURBQU8sQ0FBQTtHQU5KLFVBQVUsS0FBVixVQUFVLFFBT2Q7QUFFRCxrQ0FBa0MsSUFBYyxFQUFFLE1BQWtCO0lBQ2xFLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLCtCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sQ0FBQztLQUNSO0lBQ0QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzFDLElBQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssK0JBQTBCLENBQUMsQ0FBQyxDQUFDOztZQUU1QyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDOUQ7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSwrQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7WUFJaEUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUM7U0FDekI7S0FDRjtDQUNGO0FBRUQsaUNBQWlDLElBQWMsRUFBRSxNQUFrQjtJQUNqRSxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3JCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUywrQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxNQUFNLENBQUM7S0FDUjtJQUNELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQyxJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLCtCQUEwQixDQUFDLENBQUMsQ0FBQzs7WUFFNUMsSUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFlLENBQUMsY0FBYyxDQUFDO1lBQzVFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzFDO1NBQ0Y7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSwrQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7WUFJaEUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUM7U0FDekI7S0FDRjtDQUNGO0FBRUQsd0JBQXdCLElBQWMsRUFBRSxNQUFrQjtJQUN4RCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzdCLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDZixLQUFLLFVBQVUsQ0FBQyxjQUFjO1lBQzVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyw0QkFBNkIsQ0FBQyw4QkFBK0IsQ0FBQyxDQUFDLENBQUM7b0JBQzVFLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQjtnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUywrQkFBZ0MsQ0FBQyxDQUFDLENBQUM7b0JBQ3JELHdCQUF3QixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsNEJBQTRCLENBQUMsQ0FBQztpQkFDekU7YUFDRjtZQUNELEtBQUssQ0FBQztRQUNSLEtBQUssVUFBVSxDQUFDLDRCQUE0QjtZQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxFQUFFLENBQUMsQ0FBQyxTQUFTLDhCQUErQixDQUFDLENBQUMsQ0FBQztvQkFDN0Msa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzFCO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLCtCQUFnQyxDQUFDLENBQUMsQ0FBQztvQkFDckQsd0JBQXdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUN4QzthQUNGO1lBQ0QsS0FBSyxDQUFDO1FBQ1IsS0FBSyxVQUFVLENBQUMsY0FBYztZQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsNEJBQTZCLENBQUMsOEJBQStCLENBQUMsQ0FBQyxDQUFDO29CQUM1RSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDMUI7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsK0JBQWdDLENBQUMsQ0FBQyxDQUFDO29CQUNyRCx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLDRCQUE0QixDQUFDLENBQUM7aUJBQ3pFO2FBQ0Y7WUFDRCxLQUFLLENBQUM7UUFDUixLQUFLLFVBQVUsQ0FBQyw0QkFBNEI7WUFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsRUFBRSxDQUFDLENBQUMsU0FBUyw4QkFBK0IsQ0FBQyxDQUFDLENBQUM7b0JBQzdDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQjtnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUywrQkFBZ0MsQ0FBQyxDQUFDLENBQUM7b0JBQ3JELHdCQUF3QixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDeEM7YUFDRjtZQUNELEtBQUssQ0FBQztRQUNSLEtBQUssVUFBVSxDQUFDLE9BQU87OztZQUdyQixXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsS0FBSyxDQUFDO1FBQ1IsS0FBSyxVQUFVLENBQUMsZUFBZTtZQUM3QixlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsS0FBSyxDQUFDO0tBQ1Q7Q0FDRjtBQUVELGtDQUFrQyxJQUFjLEVBQUUsTUFBa0I7SUFDbEUsdUJBQXVCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3RDLHdCQUF3QixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztDQUN4QztBQUVELDJCQUNJLElBQWMsRUFBRSxVQUFxQixFQUFFLHNCQUFpQyxFQUN4RSxTQUFvQjtJQUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sQ0FBQztLQUNSO0lBQ0QsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3hDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDbkMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDbEI7b0JBQ0UsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNuQyxLQUFLLENBQUM7Z0JBQ1I7b0JBQ0UsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNuQyxLQUFLLENBQUM7YUFDVDtTQUNGO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7OztZQUd6RixDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUN6QjtLQUNGO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UmVuZGVyZXIyfSBmcm9tICcuLi9yZW5kZXIvYXBpJztcblxuaW1wb3J0IHtjaGVja0FuZFVwZGF0ZUVsZW1lbnREeW5hbWljLCBjaGVja0FuZFVwZGF0ZUVsZW1lbnRJbmxpbmUsIGNyZWF0ZUVsZW1lbnQsIGxpc3RlblRvRWxlbWVudE91dHB1dHN9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge2V4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXJyb3J9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7YXBwZW5kTmdDb250ZW50fSBmcm9tICcuL25nX2NvbnRlbnQnO1xuaW1wb3J0IHtjYWxsTGlmZWN5Y2xlSG9va3NDaGlsZHJlbkZpcnN0LCBjaGVja0FuZFVwZGF0ZURpcmVjdGl2ZUR5bmFtaWMsIGNoZWNrQW5kVXBkYXRlRGlyZWN0aXZlSW5saW5lLCBjcmVhdGVEaXJlY3RpdmVJbnN0YW5jZSwgY3JlYXRlUGlwZUluc3RhbmNlLCBjcmVhdGVQcm92aWRlckluc3RhbmNlfSBmcm9tICcuL3Byb3ZpZGVyJztcbmltcG9ydCB7Y2hlY2tBbmRVcGRhdGVQdXJlRXhwcmVzc2lvbkR5bmFtaWMsIGNoZWNrQW5kVXBkYXRlUHVyZUV4cHJlc3Npb25JbmxpbmUsIGNyZWF0ZVB1cmVFeHByZXNzaW9ufSBmcm9tICcuL3B1cmVfZXhwcmVzc2lvbic7XG5pbXBvcnQge2NoZWNrQW5kVXBkYXRlUXVlcnksIGNyZWF0ZVF1ZXJ5fSBmcm9tICcuL3F1ZXJ5JztcbmltcG9ydCB7Y3JlYXRlVGVtcGxhdGVEYXRhLCBjcmVhdGVWaWV3Q29udGFpbmVyRGF0YX0gZnJvbSAnLi9yZWZzJztcbmltcG9ydCB7Y2hlY2tBbmRVcGRhdGVUZXh0RHluYW1pYywgY2hlY2tBbmRVcGRhdGVUZXh0SW5saW5lLCBjcmVhdGVUZXh0fSBmcm9tICcuL3RleHQnO1xuaW1wb3J0IHtBcmd1bWVudFR5cGUsIENoZWNrVHlwZSwgRWxlbWVudERhdGEsIE5vZGVEYXRhLCBOb2RlRGVmLCBOb2RlRmxhZ3MsIFByb3ZpZGVyRGF0YSwgUm9vdERhdGEsIFNlcnZpY2VzLCBWaWV3RGF0YSwgVmlld0RlZmluaXRpb24sIFZpZXdGbGFncywgVmlld0hhbmRsZUV2ZW50Rm4sIFZpZXdTdGF0ZSwgVmlld1VwZGF0ZUZuLCBhc0VsZW1lbnREYXRhLCBhc1F1ZXJ5TGlzdCwgYXNUZXh0RGF0YSwgc2hpZnRJbml0U3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtOT09QLCBjaGVja0JpbmRpbmdOb0NoYW5nZXMsIGlzQ29tcG9uZW50VmlldywgbWFya1BhcmVudFZpZXdzRm9yQ2hlY2tQcm9qZWN0ZWRWaWV3cywgcmVzb2x2ZURlZmluaXRpb24sIHRva2VuS2V5fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtkZXRhY2hQcm9qZWN0ZWRWaWV3fSBmcm9tICcuL3ZpZXdfYXR0YWNoJztcblxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdEZWYoXG4gICAgZmxhZ3M6IFZpZXdGbGFncywgbm9kZXM6IE5vZGVEZWZbXSwgdXBkYXRlRGlyZWN0aXZlcz86IG51bGwgfCBWaWV3VXBkYXRlRm4sXG4gICAgdXBkYXRlUmVuZGVyZXI/OiBudWxsIHwgVmlld1VwZGF0ZUZuKTogVmlld0RlZmluaXRpb24ge1xuICAvLyBjbG9uZSBub2RlcyBhbmQgc2V0IGF1dG8gY2FsY3VsYXRlZCB2YWx1ZXNcbiAgbGV0IHZpZXdCaW5kaW5nQ291bnQgPSAwO1xuICBsZXQgdmlld0Rpc3Bvc2FibGVDb3VudCA9IDA7XG4gIGxldCB2aWV3Tm9kZUZsYWdzID0gMDtcbiAgbGV0IHZpZXdSb290Tm9kZUZsYWdzID0gMDtcbiAgbGV0IHZpZXdNYXRjaGVkUXVlcmllcyA9IDA7XG4gIGxldCBjdXJyZW50UGFyZW50OiBOb2RlRGVmfG51bGwgPSBudWxsO1xuICBsZXQgY3VycmVudFJlbmRlclBhcmVudDogTm9kZURlZnxudWxsID0gbnVsbDtcbiAgbGV0IGN1cnJlbnRFbGVtZW50SGFzUHVibGljUHJvdmlkZXJzID0gZmFsc2U7XG4gIGxldCBjdXJyZW50RWxlbWVudEhhc1ByaXZhdGVQcm92aWRlcnMgPSBmYWxzZTtcbiAgbGV0IGxhc3RSZW5kZXJSb290Tm9kZTogTm9kZURlZnxudWxsID0gbnVsbDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICBub2RlLm5vZGVJbmRleCA9IGk7XG4gICAgbm9kZS5wYXJlbnQgPSBjdXJyZW50UGFyZW50O1xuICAgIG5vZGUuYmluZGluZ0luZGV4ID0gdmlld0JpbmRpbmdDb3VudDtcbiAgICBub2RlLm91dHB1dEluZGV4ID0gdmlld0Rpc3Bvc2FibGVDb3VudDtcbiAgICBub2RlLnJlbmRlclBhcmVudCA9IGN1cnJlbnRSZW5kZXJQYXJlbnQ7XG5cbiAgICB2aWV3Tm9kZUZsYWdzIHw9IG5vZGUuZmxhZ3M7XG4gICAgdmlld01hdGNoZWRRdWVyaWVzIHw9IG5vZGUubWF0Y2hlZFF1ZXJ5SWRzO1xuXG4gICAgaWYgKG5vZGUuZWxlbWVudCkge1xuICAgICAgY29uc3QgZWxEZWYgPSBub2RlLmVsZW1lbnQ7XG4gICAgICBlbERlZi5wdWJsaWNQcm92aWRlcnMgPVxuICAgICAgICAgIGN1cnJlbnRQYXJlbnQgPyBjdXJyZW50UGFyZW50LmVsZW1lbnQgIS5wdWJsaWNQcm92aWRlcnMgOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgZWxEZWYuYWxsUHJvdmlkZXJzID0gZWxEZWYucHVibGljUHJvdmlkZXJzO1xuICAgICAgLy8gTm90ZTogV2UgYXNzdW1lIHRoYXQgYWxsIHByb3ZpZGVycyBvZiBhbiBlbGVtZW50IGFyZSBiZWZvcmUgYW55IGNoaWxkIGVsZW1lbnQhXG4gICAgICBjdXJyZW50RWxlbWVudEhhc1B1YmxpY1Byb3ZpZGVycyA9IGZhbHNlO1xuICAgICAgY3VycmVudEVsZW1lbnRIYXNQcml2YXRlUHJvdmlkZXJzID0gZmFsc2U7XG5cbiAgICAgIGlmIChub2RlLmVsZW1lbnQudGVtcGxhdGUpIHtcbiAgICAgICAgdmlld01hdGNoZWRRdWVyaWVzIHw9IG5vZGUuZWxlbWVudC50ZW1wbGF0ZS5ub2RlTWF0Y2hlZFF1ZXJpZXM7XG4gICAgICB9XG4gICAgfVxuICAgIHZhbGlkYXRlTm9kZShjdXJyZW50UGFyZW50LCBub2RlLCBub2Rlcy5sZW5ndGgpO1xuXG5cbiAgICB2aWV3QmluZGluZ0NvdW50ICs9IG5vZGUuYmluZGluZ3MubGVuZ3RoO1xuICAgIHZpZXdEaXNwb3NhYmxlQ291bnQgKz0gbm9kZS5vdXRwdXRzLmxlbmd0aDtcblxuICAgIGlmICghY3VycmVudFJlbmRlclBhcmVudCAmJiAobm9kZS5mbGFncyAmIE5vZGVGbGFncy5DYXRSZW5kZXJOb2RlKSkge1xuICAgICAgbGFzdFJlbmRlclJvb3ROb2RlID0gbm9kZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlcikge1xuICAgICAgaWYgKCFjdXJyZW50RWxlbWVudEhhc1B1YmxpY1Byb3ZpZGVycykge1xuICAgICAgICBjdXJyZW50RWxlbWVudEhhc1B1YmxpY1Byb3ZpZGVycyA9IHRydWU7XG4gICAgICAgIC8vIFVzZSBwcm90b3R5cGljYWwgaW5oZXJpdGFuY2UgdG8gbm90IGdldCBPKG5eMikgY29tcGxleGl0eS4uLlxuICAgICAgICBjdXJyZW50UGFyZW50ICEuZWxlbWVudCAhLnB1YmxpY1Byb3ZpZGVycyA9XG4gICAgICAgICAgICBPYmplY3QuY3JlYXRlKGN1cnJlbnRQYXJlbnQgIS5lbGVtZW50ICEucHVibGljUHJvdmlkZXJzKTtcbiAgICAgICAgY3VycmVudFBhcmVudCAhLmVsZW1lbnQgIS5hbGxQcm92aWRlcnMgPSBjdXJyZW50UGFyZW50ICEuZWxlbWVudCAhLnB1YmxpY1Byb3ZpZGVycztcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlzUHJpdmF0ZVNlcnZpY2UgPSAobm9kZS5mbGFncyAmIE5vZGVGbGFncy5Qcml2YXRlUHJvdmlkZXIpICE9PSAwO1xuICAgICAgY29uc3QgaXNDb21wb25lbnQgPSAobm9kZS5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnQpICE9PSAwO1xuICAgICAgaWYgKCFpc1ByaXZhdGVTZXJ2aWNlIHx8IGlzQ29tcG9uZW50KSB7XG4gICAgICAgIGN1cnJlbnRQYXJlbnQgIS5lbGVtZW50ICEucHVibGljUHJvdmlkZXJzICFbdG9rZW5LZXkobm9kZS5wcm92aWRlciAhLnRva2VuKV0gPSBub2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFjdXJyZW50RWxlbWVudEhhc1ByaXZhdGVQcm92aWRlcnMpIHtcbiAgICAgICAgICBjdXJyZW50RWxlbWVudEhhc1ByaXZhdGVQcm92aWRlcnMgPSB0cnVlO1xuICAgICAgICAgIC8vIFVzZSBwcm90b3R5cGljYWwgaW5oZXJpdGFuY2UgdG8gbm90IGdldCBPKG5eMikgY29tcGxleGl0eS4uLlxuICAgICAgICAgIGN1cnJlbnRQYXJlbnQgIS5lbGVtZW50ICEuYWxsUHJvdmlkZXJzID1cbiAgICAgICAgICAgICAgT2JqZWN0LmNyZWF0ZShjdXJyZW50UGFyZW50ICEuZWxlbWVudCAhLnB1YmxpY1Byb3ZpZGVycyk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudFBhcmVudCAhLmVsZW1lbnQgIS5hbGxQcm92aWRlcnMgIVt0b2tlbktleShub2RlLnByb3ZpZGVyICEudG9rZW4pXSA9IG5vZGU7XG4gICAgICB9XG4gICAgICBpZiAoaXNDb21wb25lbnQpIHtcbiAgICAgICAgY3VycmVudFBhcmVudCAhLmVsZW1lbnQgIS5jb21wb25lbnRQcm92aWRlciA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRQYXJlbnQpIHtcbiAgICAgIGN1cnJlbnRQYXJlbnQuY2hpbGRGbGFncyB8PSBub2RlLmZsYWdzO1xuICAgICAgY3VycmVudFBhcmVudC5kaXJlY3RDaGlsZEZsYWdzIHw9IG5vZGUuZmxhZ3M7XG4gICAgICBjdXJyZW50UGFyZW50LmNoaWxkTWF0Y2hlZFF1ZXJpZXMgfD0gbm9kZS5tYXRjaGVkUXVlcnlJZHM7XG4gICAgICBpZiAobm9kZS5lbGVtZW50ICYmIG5vZGUuZWxlbWVudC50ZW1wbGF0ZSkge1xuICAgICAgICBjdXJyZW50UGFyZW50LmNoaWxkTWF0Y2hlZFF1ZXJpZXMgfD0gbm9kZS5lbGVtZW50LnRlbXBsYXRlLm5vZGVNYXRjaGVkUXVlcmllcztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmlld1Jvb3ROb2RlRmxhZ3MgfD0gbm9kZS5mbGFncztcbiAgICB9XG5cbiAgICBpZiAobm9kZS5jaGlsZENvdW50ID4gMCkge1xuICAgICAgY3VycmVudFBhcmVudCA9IG5vZGU7XG5cbiAgICAgIGlmICghaXNOZ0NvbnRhaW5lcihub2RlKSkge1xuICAgICAgICBjdXJyZW50UmVuZGVyUGFyZW50ID0gbm9kZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2hlbiB0aGUgY3VycmVudCBub2RlIGhhcyBubyBjaGlsZHJlbiwgY2hlY2sgaWYgaXQgaXMgdGhlIGxhc3QgY2hpbGRyZW4gb2YgaXRzIHBhcmVudC5cbiAgICAgIC8vIFdoZW4gaXQgaXMsIHByb3BhZ2F0ZSB0aGUgZmxhZ3MgdXAuXG4gICAgICAvLyBUaGUgbG9vcCBpcyByZXF1aXJlZCBiZWNhdXNlIGFuIGVsZW1lbnQgY291bGQgYmUgdGhlIGxhc3QgdHJhbnNpdGl2ZSBjaGlsZHJlbiBvZiBzZXZlcmFsXG4gICAgICAvLyBlbGVtZW50cy4gV2UgbG9vcCB0byBlaXRoZXIgdGhlIHJvb3Qgb3IgdGhlIGhpZ2hlc3Qgb3BlbmVkIGVsZW1lbnQgKD0gd2l0aCByZW1haW5pbmdcbiAgICAgIC8vIGNoaWxkcmVuKVxuICAgICAgd2hpbGUgKGN1cnJlbnRQYXJlbnQgJiYgaSA9PT0gY3VycmVudFBhcmVudC5ub2RlSW5kZXggKyBjdXJyZW50UGFyZW50LmNoaWxkQ291bnQpIHtcbiAgICAgICAgY29uc3QgbmV3UGFyZW50OiBOb2RlRGVmfG51bGwgPSBjdXJyZW50UGFyZW50LnBhcmVudDtcbiAgICAgICAgaWYgKG5ld1BhcmVudCkge1xuICAgICAgICAgIG5ld1BhcmVudC5jaGlsZEZsYWdzIHw9IGN1cnJlbnRQYXJlbnQuY2hpbGRGbGFncztcbiAgICAgICAgICBuZXdQYXJlbnQuY2hpbGRNYXRjaGVkUXVlcmllcyB8PSBjdXJyZW50UGFyZW50LmNoaWxkTWF0Y2hlZFF1ZXJpZXM7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudFBhcmVudCA9IG5ld1BhcmVudDtcbiAgICAgICAgLy8gV2UgYWxzbyBuZWVkIHRvIHVwZGF0ZSB0aGUgcmVuZGVyIHBhcmVudCAmIGFjY291bnQgZm9yIG5nLWNvbnRhaW5lclxuICAgICAgICBpZiAoY3VycmVudFBhcmVudCAmJiBpc05nQ29udGFpbmVyKGN1cnJlbnRQYXJlbnQpKSB7XG4gICAgICAgICAgY3VycmVudFJlbmRlclBhcmVudCA9IGN1cnJlbnRQYXJlbnQucmVuZGVyUGFyZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1cnJlbnRSZW5kZXJQYXJlbnQgPSBjdXJyZW50UGFyZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaGFuZGxlRXZlbnQ6IFZpZXdIYW5kbGVFdmVudEZuID0gKHZpZXcsIG5vZGVJbmRleCwgZXZlbnROYW1lLCBldmVudCkgPT5cbiAgICAgIG5vZGVzW25vZGVJbmRleF0uZWxlbWVudCAhLmhhbmRsZUV2ZW50ICEodmlldywgZXZlbnROYW1lLCBldmVudCk7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBXaWxsIGJlIGZpbGxlZCBsYXRlci4uLlxuICAgIGZhY3Rvcnk6IG51bGwsXG4gICAgbm9kZUZsYWdzOiB2aWV3Tm9kZUZsYWdzLFxuICAgIHJvb3ROb2RlRmxhZ3M6IHZpZXdSb290Tm9kZUZsYWdzLFxuICAgIG5vZGVNYXRjaGVkUXVlcmllczogdmlld01hdGNoZWRRdWVyaWVzLCBmbGFncyxcbiAgICBub2Rlczogbm9kZXMsXG4gICAgdXBkYXRlRGlyZWN0aXZlczogdXBkYXRlRGlyZWN0aXZlcyB8fCBOT09QLFxuICAgIHVwZGF0ZVJlbmRlcmVyOiB1cGRhdGVSZW5kZXJlciB8fCBOT09QLCBoYW5kbGVFdmVudCxcbiAgICBiaW5kaW5nQ291bnQ6IHZpZXdCaW5kaW5nQ291bnQsXG4gICAgb3V0cHV0Q291bnQ6IHZpZXdEaXNwb3NhYmxlQ291bnQsIGxhc3RSZW5kZXJSb290Tm9kZVxuICB9O1xufVxuXG5mdW5jdGlvbiBpc05nQ29udGFpbmVyKG5vZGU6IE5vZGVEZWYpOiBib29sZWFuIHtcbiAgcmV0dXJuIChub2RlLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50KSAhPT0gMCAmJiBub2RlLmVsZW1lbnQgIS5uYW1lID09PSBudWxsO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU5vZGUocGFyZW50OiBOb2RlRGVmIHwgbnVsbCwgbm9kZTogTm9kZURlZiwgbm9kZUNvdW50OiBudW1iZXIpIHtcbiAgY29uc3QgdGVtcGxhdGUgPSBub2RlLmVsZW1lbnQgJiYgbm9kZS5lbGVtZW50LnRlbXBsYXRlO1xuICBpZiAodGVtcGxhdGUpIHtcbiAgICBpZiAoIXRlbXBsYXRlLmxhc3RSZW5kZXJSb290Tm9kZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIFN0YXRlOiBFbWJlZGRlZCB0ZW1wbGF0ZXMgd2l0aG91dCBub2RlcyBhcmUgbm90IGFsbG93ZWQhYCk7XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZS5sYXN0UmVuZGVyUm9vdE5vZGUgJiZcbiAgICAgICAgdGVtcGxhdGUubGFzdFJlbmRlclJvb3ROb2RlLmZsYWdzICYgTm9kZUZsYWdzLkVtYmVkZGVkVmlld3MpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgSWxsZWdhbCBTdGF0ZTogTGFzdCByb290IG5vZGUgb2YgYSB0ZW1wbGF0ZSBjYW4ndCBoYXZlIGVtYmVkZGVkIHZpZXdzLCBhdCBpbmRleCAke25vZGUubm9kZUluZGV4fSFgKTtcbiAgICB9XG4gIH1cbiAgaWYgKG5vZGUuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHJvdmlkZXIpIHtcbiAgICBjb25zdCBwYXJlbnRGbGFncyA9IHBhcmVudCA/IHBhcmVudC5mbGFncyA6IDA7XG4gICAgaWYgKChwYXJlbnRGbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgSWxsZWdhbCBTdGF0ZTogU3RhdGljUHJvdmlkZXIvRGlyZWN0aXZlIG5vZGVzIG5lZWQgdG8gYmUgY2hpbGRyZW4gb2YgZWxlbWVudHMgb3IgYW5jaG9ycywgYXQgaW5kZXggJHtub2RlLm5vZGVJbmRleH0hYCk7XG4gICAgfVxuICB9XG4gIGlmIChub2RlLnF1ZXJ5KSB7XG4gICAgaWYgKG5vZGUuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZUNvbnRlbnRRdWVyeSAmJlxuICAgICAgICAoIXBhcmVudCB8fCAocGFyZW50LmZsYWdzICYgTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmUpID09PSAwKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBJbGxlZ2FsIFN0YXRlOiBDb250ZW50IFF1ZXJ5IG5vZGVzIG5lZWQgdG8gYmUgY2hpbGRyZW4gb2YgZGlyZWN0aXZlcywgYXQgaW5kZXggJHtub2RlLm5vZGVJbmRleH0hYCk7XG4gICAgfVxuICAgIGlmIChub2RlLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVWaWV3UXVlcnkgJiYgcGFyZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYElsbGVnYWwgU3RhdGU6IFZpZXcgUXVlcnkgbm9kZXMgaGF2ZSB0byBiZSB0b3AgbGV2ZWwgbm9kZXMsIGF0IGluZGV4ICR7bm9kZS5ub2RlSW5kZXh9IWApO1xuICAgIH1cbiAgfVxuICBpZiAobm9kZS5jaGlsZENvdW50KSB7XG4gICAgY29uc3QgcGFyZW50RW5kID0gcGFyZW50ID8gcGFyZW50Lm5vZGVJbmRleCArIHBhcmVudC5jaGlsZENvdW50IDogbm9kZUNvdW50IC0gMTtcbiAgICBpZiAobm9kZS5ub2RlSW5kZXggPD0gcGFyZW50RW5kICYmIG5vZGUubm9kZUluZGV4ICsgbm9kZS5jaGlsZENvdW50ID4gcGFyZW50RW5kKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYElsbGVnYWwgU3RhdGU6IGNoaWxkQ291bnQgb2Ygbm9kZSBsZWFkcyBvdXRzaWRlIG9mIHBhcmVudCwgYXQgaW5kZXggJHtub2RlLm5vZGVJbmRleH0hYCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbWJlZGRlZFZpZXcoXG4gICAgcGFyZW50OiBWaWV3RGF0YSwgYW5jaG9yRGVmOiBOb2RlRGVmLCB2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgY29udGV4dD86IGFueSk6IFZpZXdEYXRhIHtcbiAgLy8gZW1iZWRkZWQgdmlld3MgYXJlIHNlZW4gYXMgc2libGluZ3MgdG8gdGhlIGFuY2hvciwgc28gd2UgbmVlZFxuICAvLyB0byBnZXQgdGhlIHBhcmVudCBvZiB0aGUgYW5jaG9yIGFuZCB1c2UgaXQgYXMgcGFyZW50SW5kZXguXG4gIGNvbnN0IHZpZXcgPSBjcmVhdGVWaWV3KHBhcmVudC5yb290LCBwYXJlbnQucmVuZGVyZXIsIHBhcmVudCwgYW5jaG9yRGVmLCB2aWV3RGVmKTtcbiAgaW5pdFZpZXcodmlldywgcGFyZW50LmNvbXBvbmVudCwgY29udGV4dCk7XG4gIGNyZWF0ZVZpZXdOb2Rlcyh2aWV3KTtcbiAgcmV0dXJuIHZpZXc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb290Vmlldyhyb290OiBSb290RGF0YSwgZGVmOiBWaWV3RGVmaW5pdGlvbiwgY29udGV4dD86IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3QgdmlldyA9IGNyZWF0ZVZpZXcocm9vdCwgcm9vdC5yZW5kZXJlciwgbnVsbCwgbnVsbCwgZGVmKTtcbiAgaW5pdFZpZXcodmlldywgY29udGV4dCwgY29udGV4dCk7XG4gIGNyZWF0ZVZpZXdOb2Rlcyh2aWV3KTtcbiAgcmV0dXJuIHZpZXc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRWaWV3KFxuICAgIHBhcmVudFZpZXc6IFZpZXdEYXRhLCBub2RlRGVmOiBOb2RlRGVmLCB2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgaG9zdEVsZW1lbnQ6IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3QgcmVuZGVyZXJUeXBlID0gbm9kZURlZi5lbGVtZW50ICEuY29tcG9uZW50UmVuZGVyZXJUeXBlO1xuICBsZXQgY29tcFJlbmRlcmVyOiBSZW5kZXJlcjI7XG4gIGlmICghcmVuZGVyZXJUeXBlKSB7XG4gICAgY29tcFJlbmRlcmVyID0gcGFyZW50Vmlldy5yb290LnJlbmRlcmVyO1xuICB9IGVsc2Uge1xuICAgIGNvbXBSZW5kZXJlciA9IHBhcmVudFZpZXcucm9vdC5yZW5kZXJlckZhY3RvcnkuY3JlYXRlUmVuZGVyZXIoaG9zdEVsZW1lbnQsIHJlbmRlcmVyVHlwZSk7XG4gIH1cbiAgcmV0dXJuIGNyZWF0ZVZpZXcoXG4gICAgICBwYXJlbnRWaWV3LnJvb3QsIGNvbXBSZW5kZXJlciwgcGFyZW50Vmlldywgbm9kZURlZi5lbGVtZW50ICEuY29tcG9uZW50UHJvdmlkZXIsIHZpZXdEZWYpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWaWV3KFxuICAgIHJvb3Q6IFJvb3REYXRhLCByZW5kZXJlcjogUmVuZGVyZXIyLCBwYXJlbnQ6IFZpZXdEYXRhIHwgbnVsbCwgcGFyZW50Tm9kZURlZjogTm9kZURlZiB8IG51bGwsXG4gICAgZGVmOiBWaWV3RGVmaW5pdGlvbik6IFZpZXdEYXRhIHtcbiAgY29uc3Qgbm9kZXM6IE5vZGVEYXRhW10gPSBuZXcgQXJyYXkoZGVmLm5vZGVzLmxlbmd0aCk7XG4gIGNvbnN0IGRpc3Bvc2FibGVzID0gZGVmLm91dHB1dENvdW50ID8gbmV3IEFycmF5KGRlZi5vdXRwdXRDb3VudCkgOiBudWxsO1xuICBjb25zdCB2aWV3OiBWaWV3RGF0YSA9IHtcbiAgICBkZWYsXG4gICAgcGFyZW50LFxuICAgIHZpZXdDb250YWluZXJQYXJlbnQ6IG51bGwsIHBhcmVudE5vZGVEZWYsXG4gICAgY29udGV4dDogbnVsbCxcbiAgICBjb21wb25lbnQ6IG51bGwsIG5vZGVzLFxuICAgIHN0YXRlOiBWaWV3U3RhdGUuQ2F0SW5pdCwgcm9vdCwgcmVuZGVyZXIsXG4gICAgb2xkVmFsdWVzOiBuZXcgQXJyYXkoZGVmLmJpbmRpbmdDb3VudCksIGRpc3Bvc2FibGVzLFxuICAgIGluaXRJbmRleDogLTFcbiAgfTtcbiAgcmV0dXJuIHZpZXc7XG59XG5cbmZ1bmN0aW9uIGluaXRWaWV3KHZpZXc6IFZpZXdEYXRhLCBjb21wb25lbnQ6IGFueSwgY29udGV4dDogYW55KSB7XG4gIHZpZXcuY29tcG9uZW50ID0gY29tcG9uZW50O1xuICB2aWV3LmNvbnRleHQgPSBjb250ZXh0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWaWV3Tm9kZXModmlldzogVmlld0RhdGEpIHtcbiAgbGV0IHJlbmRlckhvc3Q6IGFueTtcbiAgaWYgKGlzQ29tcG9uZW50Vmlldyh2aWV3KSkge1xuICAgIGNvbnN0IGhvc3REZWYgPSB2aWV3LnBhcmVudE5vZGVEZWY7XG4gICAgcmVuZGVySG9zdCA9IGFzRWxlbWVudERhdGEodmlldy5wYXJlbnQgISwgaG9zdERlZiAhLnBhcmVudCAhLm5vZGVJbmRleCkucmVuZGVyRWxlbWVudDtcbiAgfVxuICBjb25zdCBkZWYgPSB2aWV3LmRlZjtcbiAgY29uc3Qgbm9kZXMgPSB2aWV3Lm5vZGVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZi5ub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5vZGVEZWYgPSBkZWYubm9kZXNbaV07XG4gICAgU2VydmljZXMuc2V0Q3VycmVudE5vZGUodmlldywgaSk7XG4gICAgbGV0IG5vZGVEYXRhOiBhbnk7XG4gICAgc3dpdGNoIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVzKSB7XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlRWxlbWVudDpcbiAgICAgICAgY29uc3QgZWwgPSBjcmVhdGVFbGVtZW50KHZpZXcsIHJlbmRlckhvc3QsIG5vZGVEZWYpIGFzIGFueTtcbiAgICAgICAgbGV0IGNvbXBvbmVudFZpZXc6IFZpZXdEYXRhID0gdW5kZWZpbmVkICE7XG4gICAgICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNvbXBvbmVudFZpZXcpIHtcbiAgICAgICAgICBjb25zdCBjb21wVmlld0RlZiA9IHJlc29sdmVEZWZpbml0aW9uKG5vZGVEZWYuZWxlbWVudCAhLmNvbXBvbmVudFZpZXcgISk7XG4gICAgICAgICAgY29tcG9uZW50VmlldyA9IFNlcnZpY2VzLmNyZWF0ZUNvbXBvbmVudFZpZXcodmlldywgbm9kZURlZiwgY29tcFZpZXdEZWYsIGVsKTtcbiAgICAgICAgfVxuICAgICAgICBsaXN0ZW5Ub0VsZW1lbnRPdXRwdXRzKHZpZXcsIGNvbXBvbmVudFZpZXcsIG5vZGVEZWYsIGVsKTtcbiAgICAgICAgbm9kZURhdGEgPSA8RWxlbWVudERhdGE+e1xuICAgICAgICAgIHJlbmRlckVsZW1lbnQ6IGVsLFxuICAgICAgICAgIGNvbXBvbmVudFZpZXcsXG4gICAgICAgICAgdmlld0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgICB0ZW1wbGF0ZTogbm9kZURlZi5lbGVtZW50ICEudGVtcGxhdGUgPyBjcmVhdGVUZW1wbGF0ZURhdGEodmlldywgbm9kZURlZikgOiB1bmRlZmluZWRcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuRW1iZWRkZWRWaWV3cykge1xuICAgICAgICAgIG5vZGVEYXRhLnZpZXdDb250YWluZXIgPSBjcmVhdGVWaWV3Q29udGFpbmVyRGF0YSh2aWV3LCBub2RlRGVmLCBub2RlRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlVGV4dDpcbiAgICAgICAgbm9kZURhdGEgPSBjcmVhdGVUZXh0KHZpZXcsIHJlbmRlckhvc3QsIG5vZGVEZWYpIGFzIGFueTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlQ2xhc3NQcm92aWRlcjpcbiAgICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVGYWN0b3J5UHJvdmlkZXI6XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlVXNlRXhpc3RpbmdQcm92aWRlcjpcbiAgICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVWYWx1ZVByb3ZpZGVyOiB7XG4gICAgICAgIG5vZGVEYXRhID0gbm9kZXNbaV07XG4gICAgICAgIGlmICghbm9kZURhdGEgJiYgIShub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkxhenlQcm92aWRlcikpIHtcbiAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IGNyZWF0ZVByb3ZpZGVySW5zdGFuY2Uodmlldywgbm9kZURlZik7XG4gICAgICAgICAgbm9kZURhdGEgPSA8UHJvdmlkZXJEYXRhPntpbnN0YW5jZX07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlUGlwZToge1xuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IGNyZWF0ZVBpcGVJbnN0YW5jZSh2aWV3LCBub2RlRGVmKTtcbiAgICAgICAgbm9kZURhdGEgPSA8UHJvdmlkZXJEYXRhPntpbnN0YW5jZX07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBOb2RlRmxhZ3MuVHlwZURpcmVjdGl2ZToge1xuICAgICAgICBub2RlRGF0YSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAoIW5vZGVEYXRhKSB7XG4gICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBjcmVhdGVEaXJlY3RpdmVJbnN0YW5jZSh2aWV3LCBub2RlRGVmKTtcbiAgICAgICAgICBub2RlRGF0YSA9IDxQcm92aWRlckRhdGE+e2luc3RhbmNlfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnQpIHtcbiAgICAgICAgICBjb25zdCBjb21wVmlldyA9IGFzRWxlbWVudERhdGEodmlldywgbm9kZURlZi5wYXJlbnQgIS5ub2RlSW5kZXgpLmNvbXBvbmVudFZpZXc7XG4gICAgICAgICAgaW5pdFZpZXcoY29tcFZpZXcsIG5vZGVEYXRhLmluc3RhbmNlLCBub2RlRGF0YS5pbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlUHVyZUFycmF5OlxuICAgICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVB1cmVPYmplY3Q6XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlUHVyZVBpcGU6XG4gICAgICAgIG5vZGVEYXRhID0gY3JlYXRlUHVyZUV4cHJlc3Npb24odmlldywgbm9kZURlZikgYXMgYW55O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVDb250ZW50UXVlcnk6XG4gICAgICBjYXNlIE5vZGVGbGFncy5UeXBlVmlld1F1ZXJ5OlxuICAgICAgICBub2RlRGF0YSA9IGNyZWF0ZVF1ZXJ5KCkgYXMgYW55O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVOZ0NvbnRlbnQ6XG4gICAgICAgIGFwcGVuZE5nQ29udGVudCh2aWV3LCByZW5kZXJIb3N0LCBub2RlRGVmKTtcbiAgICAgICAgLy8gbm8gcnVudGltZSBkYXRhIG5lZWRlZCBmb3IgTmdDb250ZW50Li4uXG4gICAgICAgIG5vZGVEYXRhID0gdW5kZWZpbmVkO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbm9kZXNbaV0gPSBub2RlRGF0YTtcbiAgfVxuICAvLyBDcmVhdGUgdGhlIFZpZXdEYXRhLm5vZGVzIG9mIGNvbXBvbmVudCB2aWV3cyBhZnRlciB3ZSBjcmVhdGVkIGV2ZXJ5dGhpbmcgZWxzZSxcbiAgLy8gc28gdGhhdCBlLmcuIG5nLWNvbnRlbnQgd29ya3NcbiAgZXhlY0NvbXBvbmVudFZpZXdzQWN0aW9uKHZpZXcsIFZpZXdBY3Rpb24uQ3JlYXRlVmlld05vZGVzKTtcblxuICAvLyBmaWxsIHN0YXRpYyBjb250ZW50IGFuZCB2aWV3IHF1ZXJpZXNcbiAgZXhlY1F1ZXJpZXNBY3Rpb24oXG4gICAgICB2aWV3LCBOb2RlRmxhZ3MuVHlwZUNvbnRlbnRRdWVyeSB8IE5vZGVGbGFncy5UeXBlVmlld1F1ZXJ5LCBOb2RlRmxhZ3MuU3RhdGljUXVlcnksXG4gICAgICBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOb0NoYW5nZXNWaWV3KHZpZXc6IFZpZXdEYXRhKSB7XG4gIG1hcmtQcm9qZWN0ZWRWaWV3c0ZvckNoZWNrKHZpZXcpO1xuICBTZXJ2aWNlcy51cGRhdGVEaXJlY3RpdmVzKHZpZXcsIENoZWNrVHlwZS5DaGVja05vQ2hhbmdlcyk7XG4gIGV4ZWNFbWJlZGRlZFZpZXdzQWN0aW9uKHZpZXcsIFZpZXdBY3Rpb24uQ2hlY2tOb0NoYW5nZXMpO1xuICBTZXJ2aWNlcy51cGRhdGVSZW5kZXJlcih2aWV3LCBDaGVja1R5cGUuQ2hlY2tOb0NoYW5nZXMpO1xuICBleGVjQ29tcG9uZW50Vmlld3NBY3Rpb24odmlldywgVmlld0FjdGlvbi5DaGVja05vQ2hhbmdlcyk7XG4gIC8vIE5vdGU6IFdlIGRvbid0IGNoZWNrIHF1ZXJpZXMgZm9yIGNoYW5nZXMgYXMgd2UgZGlkbid0IGRvIHRoaXMgaW4gdjIueC5cbiAgLy8gVE9ETyh0Ym9zY2gpOiBpbnZlc3RpZ2F0ZSBpZiB3ZSBjYW4gZW5hYmxlIHRoZSBjaGVjayBhZ2FpbiBpbiB2NS54IHdpdGggYSBuaWNlciBlcnJvciBtZXNzYWdlLlxuICB2aWV3LnN0YXRlICY9IH4oVmlld1N0YXRlLkNoZWNrUHJvamVjdGVkVmlld3MgfCBWaWV3U3RhdGUuQ2hlY2tQcm9qZWN0ZWRWaWV3KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQW5kVXBkYXRlVmlldyh2aWV3OiBWaWV3RGF0YSkge1xuICBpZiAodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5CZWZvcmVGaXJzdENoZWNrKSB7XG4gICAgdmlldy5zdGF0ZSAmPSB+Vmlld1N0YXRlLkJlZm9yZUZpcnN0Q2hlY2s7XG4gICAgdmlldy5zdGF0ZSB8PSBWaWV3U3RhdGUuRmlyc3RDaGVjaztcbiAgfSBlbHNlIHtcbiAgICB2aWV3LnN0YXRlICY9IH5WaWV3U3RhdGUuRmlyc3RDaGVjaztcbiAgfVxuICBzaGlmdEluaXRTdGF0ZSh2aWV3LCBWaWV3U3RhdGUuSW5pdFN0YXRlX0JlZm9yZUluaXQsIFZpZXdTdGF0ZS5Jbml0U3RhdGVfQ2FsbGluZ09uSW5pdCk7XG4gIG1hcmtQcm9qZWN0ZWRWaWV3c0ZvckNoZWNrKHZpZXcpO1xuICBTZXJ2aWNlcy51cGRhdGVEaXJlY3RpdmVzKHZpZXcsIENoZWNrVHlwZS5DaGVja0FuZFVwZGF0ZSk7XG4gIGV4ZWNFbWJlZGRlZFZpZXdzQWN0aW9uKHZpZXcsIFZpZXdBY3Rpb24uQ2hlY2tBbmRVcGRhdGUpO1xuICBleGVjUXVlcmllc0FjdGlvbihcbiAgICAgIHZpZXcsIE5vZGVGbGFncy5UeXBlQ29udGVudFF1ZXJ5LCBOb2RlRmxhZ3MuRHluYW1pY1F1ZXJ5LCBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUpO1xuICBsZXQgY2FsbEluaXQgPSBzaGlmdEluaXRTdGF0ZShcbiAgICAgIHZpZXcsIFZpZXdTdGF0ZS5Jbml0U3RhdGVfQ2FsbGluZ09uSW5pdCwgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nQWZ0ZXJDb250ZW50SW5pdCk7XG4gIGNhbGxMaWZlY3ljbGVIb29rc0NoaWxkcmVuRmlyc3QoXG4gICAgICB2aWV3LCBOb2RlRmxhZ3MuQWZ0ZXJDb250ZW50Q2hlY2tlZCB8IChjYWxsSW5pdCA/IE5vZGVGbGFncy5BZnRlckNvbnRlbnRJbml0IDogMCkpO1xuXG4gIFNlcnZpY2VzLnVwZGF0ZVJlbmRlcmVyKHZpZXcsIENoZWNrVHlwZS5DaGVja0FuZFVwZGF0ZSk7XG5cbiAgZXhlY0NvbXBvbmVudFZpZXdzQWN0aW9uKHZpZXcsIFZpZXdBY3Rpb24uQ2hlY2tBbmRVcGRhdGUpO1xuICBleGVjUXVlcmllc0FjdGlvbihcbiAgICAgIHZpZXcsIE5vZGVGbGFncy5UeXBlVmlld1F1ZXJ5LCBOb2RlRmxhZ3MuRHluYW1pY1F1ZXJ5LCBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUpO1xuICBjYWxsSW5pdCA9IHNoaWZ0SW5pdFN0YXRlKFxuICAgICAgdmlldywgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nQWZ0ZXJDb250ZW50SW5pdCwgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nQWZ0ZXJWaWV3SW5pdCk7XG4gIGNhbGxMaWZlY3ljbGVIb29rc0NoaWxkcmVuRmlyc3QoXG4gICAgICB2aWV3LCBOb2RlRmxhZ3MuQWZ0ZXJWaWV3Q2hlY2tlZCB8IChjYWxsSW5pdCA/IE5vZGVGbGFncy5BZnRlclZpZXdJbml0IDogMCkpO1xuXG4gIGlmICh2aWV3LmRlZi5mbGFncyAmIFZpZXdGbGFncy5PblB1c2gpIHtcbiAgICB2aWV3LnN0YXRlICY9IH5WaWV3U3RhdGUuQ2hlY2tzRW5hYmxlZDtcbiAgfVxuICB2aWV3LnN0YXRlICY9IH4oVmlld1N0YXRlLkNoZWNrUHJvamVjdGVkVmlld3MgfCBWaWV3U3RhdGUuQ2hlY2tQcm9qZWN0ZWRWaWV3KTtcbiAgc2hpZnRJbml0U3RhdGUodmlldywgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nQWZ0ZXJWaWV3SW5pdCwgVmlld1N0YXRlLkluaXRTdGF0ZV9BZnRlckluaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tBbmRVcGRhdGVOb2RlKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBub2RlRGVmOiBOb2RlRGVmLCBhcmdTdHlsZTogQXJndW1lbnRUeXBlLCB2MD86IGFueSwgdjE/OiBhbnksIHYyPzogYW55LFxuICAgIHYzPzogYW55LCB2ND86IGFueSwgdjU/OiBhbnksIHY2PzogYW55LCB2Nz86IGFueSwgdjg/OiBhbnksIHY5PzogYW55KTogYm9vbGVhbiB7XG4gIGlmIChhcmdTdHlsZSA9PT0gQXJndW1lbnRUeXBlLklubGluZSkge1xuICAgIHJldHVybiBjaGVja0FuZFVwZGF0ZU5vZGVJbmxpbmUodmlldywgbm9kZURlZiwgdjAsIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3LCB2OCwgdjkpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjaGVja0FuZFVwZGF0ZU5vZGVEeW5hbWljKHZpZXcsIG5vZGVEZWYsIHYwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXJrUHJvamVjdGVkVmlld3NGb3JDaGVjayh2aWV3OiBWaWV3RGF0YSkge1xuICBjb25zdCBkZWYgPSB2aWV3LmRlZjtcbiAgaWYgKCEoZGVmLm5vZGVGbGFncyAmIE5vZGVGbGFncy5Qcm9qZWN0ZWRUZW1wbGF0ZSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gZGVmLm5vZGVzW2ldO1xuICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlByb2plY3RlZFRlbXBsYXRlKSB7XG4gICAgICBjb25zdCBwcm9qZWN0ZWRWaWV3cyA9IGFzRWxlbWVudERhdGEodmlldywgaSkudGVtcGxhdGUuX3Byb2plY3RlZFZpZXdzO1xuICAgICAgaWYgKHByb2plY3RlZFZpZXdzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvamVjdGVkVmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBwcm9qZWN0ZWRWaWV3ID0gcHJvamVjdGVkVmlld3NbaV07XG4gICAgICAgICAgcHJvamVjdGVkVmlldy5zdGF0ZSB8PSBWaWV3U3RhdGUuQ2hlY2tQcm9qZWN0ZWRWaWV3O1xuICAgICAgICAgIG1hcmtQYXJlbnRWaWV3c0ZvckNoZWNrUHJvamVjdGVkVmlld3MocHJvamVjdGVkVmlldywgdmlldyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKChub2RlRGVmLmNoaWxkRmxhZ3MgJiBOb2RlRmxhZ3MuUHJvamVjdGVkVGVtcGxhdGUpID09PSAwKSB7XG4gICAgICAvLyBhIHBhcmVudCB3aXRoIGxlYWZzXG4gICAgICAvLyBubyBjaGlsZCBpcyBhIGNvbXBvbmVudCxcbiAgICAgIC8vIHRoZW4gc2tpcCB0aGUgY2hpbGRyZW5cbiAgICAgIGkgKz0gbm9kZURlZi5jaGlsZENvdW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0FuZFVwZGF0ZU5vZGVJbmxpbmUoXG4gICAgdmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIHYwPzogYW55LCB2MT86IGFueSwgdjI/OiBhbnksIHYzPzogYW55LCB2ND86IGFueSwgdjU/OiBhbnksXG4gICAgdjY/OiBhbnksIHY3PzogYW55LCB2OD86IGFueSwgdjk/OiBhbnkpOiBib29sZWFuIHtcbiAgc3dpdGNoIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVzKSB7XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZUVsZW1lbnQ6XG4gICAgICByZXR1cm4gY2hlY2tBbmRVcGRhdGVFbGVtZW50SW5saW5lKHZpZXcsIG5vZGVEZWYsIHYwLCB2MSwgdjIsIHYzLCB2NCwgdjUsIHY2LCB2NywgdjgsIHY5KTtcbiAgICBjYXNlIE5vZGVGbGFncy5UeXBlVGV4dDpcbiAgICAgIHJldHVybiBjaGVja0FuZFVwZGF0ZVRleHRJbmxpbmUodmlldywgbm9kZURlZiwgdjAsIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3LCB2OCwgdjkpO1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmU6XG4gICAgICByZXR1cm4gY2hlY2tBbmRVcGRhdGVEaXJlY3RpdmVJbmxpbmUodmlldywgbm9kZURlZiwgdjAsIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3LCB2OCwgdjkpO1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVQdXJlQXJyYXk6XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVB1cmVPYmplY3Q6XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVB1cmVQaXBlOlxuICAgICAgcmV0dXJuIGNoZWNrQW5kVXBkYXRlUHVyZUV4cHJlc3Npb25JbmxpbmUoXG4gICAgICAgICAgdmlldywgbm9kZURlZiwgdjAsIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3LCB2OCwgdjkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyAndW5yZWFjaGFibGUnO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQW5kVXBkYXRlTm9kZUR5bmFtaWModmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIHZhbHVlczogYW55W10pOiBib29sZWFuIHtcbiAgc3dpdGNoIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVzKSB7XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZUVsZW1lbnQ6XG4gICAgICByZXR1cm4gY2hlY2tBbmRVcGRhdGVFbGVtZW50RHluYW1pYyh2aWV3LCBub2RlRGVmLCB2YWx1ZXMpO1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVUZXh0OlxuICAgICAgcmV0dXJuIGNoZWNrQW5kVXBkYXRlVGV4dER5bmFtaWModmlldywgbm9kZURlZiwgdmFsdWVzKTtcbiAgICBjYXNlIE5vZGVGbGFncy5UeXBlRGlyZWN0aXZlOlxuICAgICAgcmV0dXJuIGNoZWNrQW5kVXBkYXRlRGlyZWN0aXZlRHluYW1pYyh2aWV3LCBub2RlRGVmLCB2YWx1ZXMpO1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVQdXJlQXJyYXk6XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVB1cmVPYmplY3Q6XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVB1cmVQaXBlOlxuICAgICAgcmV0dXJuIGNoZWNrQW5kVXBkYXRlUHVyZUV4cHJlc3Npb25EeW5hbWljKHZpZXcsIG5vZGVEZWYsIHZhbHVlcyk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93ICd1bnJlYWNoYWJsZSc7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTm9DaGFuZ2VzTm9kZShcbiAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZURlZjogTm9kZURlZiwgYXJnU3R5bGU6IEFyZ3VtZW50VHlwZSwgdjA/OiBhbnksIHYxPzogYW55LCB2Mj86IGFueSxcbiAgICB2Mz86IGFueSwgdjQ/OiBhbnksIHY1PzogYW55LCB2Nj86IGFueSwgdjc/OiBhbnksIHY4PzogYW55LCB2OT86IGFueSk6IGFueSB7XG4gIGlmIChhcmdTdHlsZSA9PT0gQXJndW1lbnRUeXBlLklubGluZSkge1xuICAgIGNoZWNrTm9DaGFuZ2VzTm9kZUlubGluZSh2aWV3LCBub2RlRGVmLCB2MCwgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcsIHY4LCB2OSk7XG4gIH0gZWxzZSB7XG4gICAgY2hlY2tOb0NoYW5nZXNOb2RlRHluYW1pYyh2aWV3LCBub2RlRGVmLCB2MCk7XG4gIH1cbiAgLy8gUmV0dXJuaW5nIGZhbHNlIGlzIG9rIGhlcmUgYXMgd2Ugd291bGQgaGF2ZSB0aHJvd24gaW4gY2FzZSBvZiBhIGNoYW5nZS5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjaGVja05vQ2hhbmdlc05vZGVJbmxpbmUoXG4gICAgdmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIHYwOiBhbnksIHYxOiBhbnksIHYyOiBhbnksIHYzOiBhbnksIHY0OiBhbnksIHY1OiBhbnksIHY2OiBhbnksXG4gICAgdjc6IGFueSwgdjg6IGFueSwgdjk6IGFueSk6IHZvaWQge1xuICBjb25zdCBiaW5kTGVuID0gbm9kZURlZi5iaW5kaW5ncy5sZW5ndGg7XG4gIGlmIChiaW5kTGVuID4gMCkgY2hlY2tCaW5kaW5nTm9DaGFuZ2VzKHZpZXcsIG5vZGVEZWYsIDAsIHYwKTtcbiAgaWYgKGJpbmRMZW4gPiAxKSBjaGVja0JpbmRpbmdOb0NoYW5nZXModmlldywgbm9kZURlZiwgMSwgdjEpO1xuICBpZiAoYmluZExlbiA+IDIpIGNoZWNrQmluZGluZ05vQ2hhbmdlcyh2aWV3LCBub2RlRGVmLCAyLCB2Mik7XG4gIGlmIChiaW5kTGVuID4gMykgY2hlY2tCaW5kaW5nTm9DaGFuZ2VzKHZpZXcsIG5vZGVEZWYsIDMsIHYzKTtcbiAgaWYgKGJpbmRMZW4gPiA0KSBjaGVja0JpbmRpbmdOb0NoYW5nZXModmlldywgbm9kZURlZiwgNCwgdjQpO1xuICBpZiAoYmluZExlbiA+IDUpIGNoZWNrQmluZGluZ05vQ2hhbmdlcyh2aWV3LCBub2RlRGVmLCA1LCB2NSk7XG4gIGlmIChiaW5kTGVuID4gNikgY2hlY2tCaW5kaW5nTm9DaGFuZ2VzKHZpZXcsIG5vZGVEZWYsIDYsIHY2KTtcbiAgaWYgKGJpbmRMZW4gPiA3KSBjaGVja0JpbmRpbmdOb0NoYW5nZXModmlldywgbm9kZURlZiwgNywgdjcpO1xuICBpZiAoYmluZExlbiA+IDgpIGNoZWNrQmluZGluZ05vQ2hhbmdlcyh2aWV3LCBub2RlRGVmLCA4LCB2OCk7XG4gIGlmIChiaW5kTGVuID4gOSkgY2hlY2tCaW5kaW5nTm9DaGFuZ2VzKHZpZXcsIG5vZGVEZWYsIDksIHY5KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tOb0NoYW5nZXNOb2RlRHluYW1pYyh2aWV3OiBWaWV3RGF0YSwgbm9kZURlZjogTm9kZURlZiwgdmFsdWVzOiBhbnlbXSk6IHZvaWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIGNoZWNrQmluZGluZ05vQ2hhbmdlcyh2aWV3LCBub2RlRGVmLCBpLCB2YWx1ZXNbaV0pO1xuICB9XG59XG5cbi8qKlxuICogV29ya2Fyb3VuZCBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci90c2lja2xlL2lzc3Vlcy80OTdcbiAqIEBzdXBwcmVzcyB7bWlzcGxhY2VkVHlwZUFubm90YXRpb259XG4gKi9cbmZ1bmN0aW9uIGNoZWNrTm9DaGFuZ2VzUXVlcnkodmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYpIHtcbiAgY29uc3QgcXVlcnlMaXN0ID0gYXNRdWVyeUxpc3Qodmlldywgbm9kZURlZi5ub2RlSW5kZXgpO1xuICBpZiAocXVlcnlMaXN0LmRpcnR5KSB7XG4gICAgdGhyb3cgZXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFcnJvcihcbiAgICAgICAgU2VydmljZXMuY3JlYXRlRGVidWdDb250ZXh0KHZpZXcsIG5vZGVEZWYubm9kZUluZGV4KSxcbiAgICAgICAgYFF1ZXJ5ICR7bm9kZURlZi5xdWVyeSEuaWR9IG5vdCBkaXJ0eWAsIGBRdWVyeSAke25vZGVEZWYucXVlcnkhLmlkfSBkaXJ0eWAsXG4gICAgICAgICh2aWV3LnN0YXRlICYgVmlld1N0YXRlLkJlZm9yZUZpcnN0Q2hlY2spICE9PSAwKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzdHJveVZpZXcodmlldzogVmlld0RhdGEpIHtcbiAgaWYgKHZpZXcuc3RhdGUgJiBWaWV3U3RhdGUuRGVzdHJveWVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGV4ZWNFbWJlZGRlZFZpZXdzQWN0aW9uKHZpZXcsIFZpZXdBY3Rpb24uRGVzdHJveSk7XG4gIGV4ZWNDb21wb25lbnRWaWV3c0FjdGlvbih2aWV3LCBWaWV3QWN0aW9uLkRlc3Ryb3kpO1xuICBjYWxsTGlmZWN5Y2xlSG9va3NDaGlsZHJlbkZpcnN0KHZpZXcsIE5vZGVGbGFncy5PbkRlc3Ryb3kpO1xuICBpZiAodmlldy5kaXNwb3NhYmxlcykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmlldy5kaXNwb3NhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmlldy5kaXNwb3NhYmxlc1tpXSgpO1xuICAgIH1cbiAgfVxuICBkZXRhY2hQcm9qZWN0ZWRWaWV3KHZpZXcpO1xuICBpZiAodmlldy5yZW5kZXJlci5kZXN0cm95Tm9kZSkge1xuICAgIGRlc3Ryb3lWaWV3Tm9kZXModmlldyk7XG4gIH1cbiAgaWYgKGlzQ29tcG9uZW50Vmlldyh2aWV3KSkge1xuICAgIHZpZXcucmVuZGVyZXIuZGVzdHJveSgpO1xuICB9XG4gIHZpZXcuc3RhdGUgfD0gVmlld1N0YXRlLkRlc3Ryb3llZDtcbn1cblxuZnVuY3Rpb24gZGVzdHJveVZpZXdOb2Rlcyh2aWV3OiBWaWV3RGF0YSkge1xuICBjb25zdCBsZW4gPSB2aWV3LmRlZi5ub2Rlcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjb25zdCBkZWYgPSB2aWV3LmRlZi5ub2Rlc1tpXTtcbiAgICBpZiAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50KSB7XG4gICAgICB2aWV3LnJlbmRlcmVyLmRlc3Ryb3lOb2RlICEoYXNFbGVtZW50RGF0YSh2aWV3LCBpKS5yZW5kZXJFbGVtZW50KTtcbiAgICB9IGVsc2UgaWYgKGRlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlVGV4dCkge1xuICAgICAgdmlldy5yZW5kZXJlci5kZXN0cm95Tm9kZSAhKGFzVGV4dERhdGEodmlldywgaSkucmVuZGVyVGV4dCk7XG4gICAgfSBlbHNlIGlmIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZUNvbnRlbnRRdWVyeSB8fCBkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZVZpZXdRdWVyeSkge1xuICAgICAgYXNRdWVyeUxpc3QodmlldywgaSkuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG5lbnVtIFZpZXdBY3Rpb24ge1xuICBDcmVhdGVWaWV3Tm9kZXMsXG4gIENoZWNrTm9DaGFuZ2VzLFxuICBDaGVja05vQ2hhbmdlc1Byb2plY3RlZFZpZXdzLFxuICBDaGVja0FuZFVwZGF0ZSxcbiAgQ2hlY2tBbmRVcGRhdGVQcm9qZWN0ZWRWaWV3cyxcbiAgRGVzdHJveVxufVxuXG5mdW5jdGlvbiBleGVjQ29tcG9uZW50Vmlld3NBY3Rpb24odmlldzogVmlld0RhdGEsIGFjdGlvbjogVmlld0FjdGlvbikge1xuICBjb25zdCBkZWYgPSB2aWV3LmRlZjtcbiAgaWYgKCEoZGVmLm5vZGVGbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnRWaWV3KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZi5ub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5vZGVEZWYgPSBkZWYubm9kZXNbaV07XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ29tcG9uZW50Vmlldykge1xuICAgICAgLy8gYSBsZWFmXG4gICAgICBjYWxsVmlld0FjdGlvbihhc0VsZW1lbnREYXRhKHZpZXcsIGkpLmNvbXBvbmVudFZpZXcsIGFjdGlvbik7XG4gICAgfSBlbHNlIGlmICgobm9kZURlZi5jaGlsZEZsYWdzICYgTm9kZUZsYWdzLkNvbXBvbmVudFZpZXcpID09PSAwKSB7XG4gICAgICAvLyBhIHBhcmVudCB3aXRoIGxlYWZzXG4gICAgICAvLyBubyBjaGlsZCBpcyBhIGNvbXBvbmVudCxcbiAgICAgIC8vIHRoZW4gc2tpcCB0aGUgY2hpbGRyZW5cbiAgICAgIGkgKz0gbm9kZURlZi5jaGlsZENvdW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBleGVjRW1iZWRkZWRWaWV3c0FjdGlvbih2aWV3OiBWaWV3RGF0YSwgYWN0aW9uOiBWaWV3QWN0aW9uKSB7XG4gIGNvbnN0IGRlZiA9IHZpZXcuZGVmO1xuICBpZiAoIShkZWYubm9kZUZsYWdzICYgTm9kZUZsYWdzLkVtYmVkZGVkVmlld3MpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVmLm5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IGRlZi5ub2Rlc1tpXTtcbiAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5FbWJlZGRlZFZpZXdzKSB7XG4gICAgICAvLyBhIGxlYWZcbiAgICAgIGNvbnN0IGVtYmVkZGVkVmlld3MgPSBhc0VsZW1lbnREYXRhKHZpZXcsIGkpLnZpZXdDb250YWluZXIgIS5fZW1iZWRkZWRWaWV3cztcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZW1iZWRkZWRWaWV3cy5sZW5ndGg7IGsrKykge1xuICAgICAgICBjYWxsVmlld0FjdGlvbihlbWJlZGRlZFZpZXdzW2tdLCBhY3Rpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKG5vZGVEZWYuY2hpbGRGbGFncyAmIE5vZGVGbGFncy5FbWJlZGRlZFZpZXdzKSA9PT0gMCkge1xuICAgICAgLy8gYSBwYXJlbnQgd2l0aCBsZWFmc1xuICAgICAgLy8gbm8gY2hpbGQgaXMgYSBjb21wb25lbnQsXG4gICAgICAvLyB0aGVuIHNraXAgdGhlIGNoaWxkcmVuXG4gICAgICBpICs9IG5vZGVEZWYuY2hpbGRDb3VudDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FsbFZpZXdBY3Rpb24odmlldzogVmlld0RhdGEsIGFjdGlvbjogVmlld0FjdGlvbikge1xuICBjb25zdCB2aWV3U3RhdGUgPSB2aWV3LnN0YXRlO1xuICBzd2l0Y2ggKGFjdGlvbikge1xuICAgIGNhc2UgVmlld0FjdGlvbi5DaGVja05vQ2hhbmdlczpcbiAgICAgIGlmICgodmlld1N0YXRlICYgVmlld1N0YXRlLkRlc3Ryb3llZCkgPT09IDApIHtcbiAgICAgICAgaWYgKCh2aWV3U3RhdGUgJiBWaWV3U3RhdGUuQ2F0RGV0ZWN0Q2hhbmdlcykgPT09IFZpZXdTdGF0ZS5DYXREZXRlY3RDaGFuZ2VzKSB7XG4gICAgICAgICAgY2hlY2tOb0NoYW5nZXNWaWV3KHZpZXcpO1xuICAgICAgICB9IGVsc2UgaWYgKHZpZXdTdGF0ZSAmIFZpZXdTdGF0ZS5DaGVja1Byb2plY3RlZFZpZXdzKSB7XG4gICAgICAgICAgZXhlY1Byb2plY3RlZFZpZXdzQWN0aW9uKHZpZXcsIFZpZXdBY3Rpb24uQ2hlY2tOb0NoYW5nZXNQcm9qZWN0ZWRWaWV3cyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVmlld0FjdGlvbi5DaGVja05vQ2hhbmdlc1Byb2plY3RlZFZpZXdzOlxuICAgICAgaWYgKCh2aWV3U3RhdGUgJiBWaWV3U3RhdGUuRGVzdHJveWVkKSA9PT0gMCkge1xuICAgICAgICBpZiAodmlld1N0YXRlICYgVmlld1N0YXRlLkNoZWNrUHJvamVjdGVkVmlldykge1xuICAgICAgICAgIGNoZWNrTm9DaGFuZ2VzVmlldyh2aWV3KTtcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3U3RhdGUgJiBWaWV3U3RhdGUuQ2hlY2tQcm9qZWN0ZWRWaWV3cykge1xuICAgICAgICAgIGV4ZWNQcm9qZWN0ZWRWaWV3c0FjdGlvbih2aWV3LCBhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFZpZXdBY3Rpb24uQ2hlY2tBbmRVcGRhdGU6XG4gICAgICBpZiAoKHZpZXdTdGF0ZSAmIFZpZXdTdGF0ZS5EZXN0cm95ZWQpID09PSAwKSB7XG4gICAgICAgIGlmICgodmlld1N0YXRlICYgVmlld1N0YXRlLkNhdERldGVjdENoYW5nZXMpID09PSBWaWV3U3RhdGUuQ2F0RGV0ZWN0Q2hhbmdlcykge1xuICAgICAgICAgIGNoZWNrQW5kVXBkYXRlVmlldyh2aWV3KTtcbiAgICAgICAgfSBlbHNlIGlmICh2aWV3U3RhdGUgJiBWaWV3U3RhdGUuQ2hlY2tQcm9qZWN0ZWRWaWV3cykge1xuICAgICAgICAgIGV4ZWNQcm9qZWN0ZWRWaWV3c0FjdGlvbih2aWV3LCBWaWV3QWN0aW9uLkNoZWNrQW5kVXBkYXRlUHJvamVjdGVkVmlld3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFZpZXdBY3Rpb24uQ2hlY2tBbmRVcGRhdGVQcm9qZWN0ZWRWaWV3czpcbiAgICAgIGlmICgodmlld1N0YXRlICYgVmlld1N0YXRlLkRlc3Ryb3llZCkgPT09IDApIHtcbiAgICAgICAgaWYgKHZpZXdTdGF0ZSAmIFZpZXdTdGF0ZS5DaGVja1Byb2plY3RlZFZpZXcpIHtcbiAgICAgICAgICBjaGVja0FuZFVwZGF0ZVZpZXcodmlldyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmlld1N0YXRlICYgVmlld1N0YXRlLkNoZWNrUHJvamVjdGVkVmlld3MpIHtcbiAgICAgICAgICBleGVjUHJvamVjdGVkVmlld3NBY3Rpb24odmlldywgYWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBWaWV3QWN0aW9uLkRlc3Ryb3k6XG4gICAgICAvLyBOb3RlOiBkZXN0cm95VmlldyByZWN1cnNlcyBvdmVyIGFsbCB2aWV3cyxcbiAgICAgIC8vIHNvIHdlIGRvbid0IG5lZWQgdG8gc3BlY2lhbCBjYXNlIHByb2plY3RlZCB2aWV3cyBoZXJlLlxuICAgICAgZGVzdHJveVZpZXcodmlldyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFZpZXdBY3Rpb24uQ3JlYXRlVmlld05vZGVzOlxuICAgICAgY3JlYXRlVmlld05vZGVzKHZpZXcpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXhlY1Byb2plY3RlZFZpZXdzQWN0aW9uKHZpZXc6IFZpZXdEYXRhLCBhY3Rpb246IFZpZXdBY3Rpb24pIHtcbiAgZXhlY0VtYmVkZGVkVmlld3NBY3Rpb24odmlldywgYWN0aW9uKTtcbiAgZXhlY0NvbXBvbmVudFZpZXdzQWN0aW9uKHZpZXcsIGFjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGV4ZWNRdWVyaWVzQWN0aW9uKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBxdWVyeUZsYWdzOiBOb2RlRmxhZ3MsIHN0YXRpY0R5bmFtaWNRdWVyeUZsYWc6IE5vZGVGbGFncyxcbiAgICBjaGVja1R5cGU6IENoZWNrVHlwZSkge1xuICBpZiAoISh2aWV3LmRlZi5ub2RlRmxhZ3MgJiBxdWVyeUZsYWdzKSB8fCAhKHZpZXcuZGVmLm5vZGVGbGFncyAmIHN0YXRpY0R5bmFtaWNRdWVyeUZsYWcpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IG5vZGVDb3VudCA9IHZpZXcuZGVmLm5vZGVzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlQ291bnQ7IGkrKykge1xuICAgIGNvbnN0IG5vZGVEZWYgPSB2aWV3LmRlZi5ub2Rlc1tpXTtcbiAgICBpZiAoKG5vZGVEZWYuZmxhZ3MgJiBxdWVyeUZsYWdzKSAmJiAobm9kZURlZi5mbGFncyAmIHN0YXRpY0R5bmFtaWNRdWVyeUZsYWcpKSB7XG4gICAgICBTZXJ2aWNlcy5zZXRDdXJyZW50Tm9kZSh2aWV3LCBub2RlRGVmLm5vZGVJbmRleCk7XG4gICAgICBzd2l0Y2ggKGNoZWNrVHlwZSkge1xuICAgICAgICBjYXNlIENoZWNrVHlwZS5DaGVja0FuZFVwZGF0ZTpcbiAgICAgICAgICBjaGVja0FuZFVwZGF0ZVF1ZXJ5KHZpZXcsIG5vZGVEZWYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIENoZWNrVHlwZS5DaGVja05vQ2hhbmdlczpcbiAgICAgICAgICBjaGVja05vQ2hhbmdlc1F1ZXJ5KHZpZXcsIG5vZGVEZWYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIShub2RlRGVmLmNoaWxkRmxhZ3MgJiBxdWVyeUZsYWdzKSB8fCAhKG5vZGVEZWYuY2hpbGRGbGFncyAmIHN0YXRpY0R5bmFtaWNRdWVyeUZsYWcpKSB7XG4gICAgICAvLyBubyBjaGlsZCBoYXMgYSBtYXRjaGluZyBxdWVyeVxuICAgICAgLy8gdGhlbiBza2lwIHRoZSBjaGlsZHJlblxuICAgICAgaSArPSBub2RlRGVmLmNoaWxkQ291bnQ7XG4gICAgfVxuICB9XG59XG4iXX0=