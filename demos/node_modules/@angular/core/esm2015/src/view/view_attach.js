/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Services } from './types';
import { declaredViewContainer, renderNode, visitRootRenderNodes } from './util';
/**
 * @param {?} parentView
 * @param {?} elementData
 * @param {?} viewIndex
 * @param {?} view
 * @return {?}
 */
export function attachEmbeddedView(parentView, elementData, viewIndex, view) {
    let /** @type {?} */ embeddedViews = /** @type {?} */ ((elementData.viewContainer))._embeddedViews;
    if (viewIndex === null || viewIndex === undefined) {
        viewIndex = embeddedViews.length;
    }
    view.viewContainerParent = parentView;
    addToArray(embeddedViews, /** @type {?} */ ((viewIndex)), view);
    attachProjectedView(elementData, view);
    Services.dirtyParentQueries(view);
    const /** @type {?} */ prevView = /** @type {?} */ ((viewIndex)) > 0 ? embeddedViews[/** @type {?} */ ((viewIndex)) - 1] : null;
    renderAttachEmbeddedView(elementData, prevView, view);
}
/**
 * @param {?} vcElementData
 * @param {?} view
 * @return {?}
 */
function attachProjectedView(vcElementData, view) {
    const /** @type {?} */ dvcElementData = declaredViewContainer(view);
    if (!dvcElementData || dvcElementData === vcElementData ||
        view.state & 16 /* IsProjectedView */) {
        return;
    }
    // Note: For performance reasons, we
    // - add a view to template._projectedViews only 1x throughout its lifetime,
    //   and remove it not until the view is destroyed.
    //   (hard, as when a parent view is attached/detached we would need to attach/detach all
    //    nested projected views as well, even across component boundaries).
    // - don't track the insertion order of views in the projected views array
    //   (hard, as when the views of the same template are inserted different view containers)
    view.state |= 16 /* IsProjectedView */;
    let /** @type {?} */ projectedViews = dvcElementData.template._projectedViews;
    if (!projectedViews) {
        projectedViews = dvcElementData.template._projectedViews = [];
    }
    projectedViews.push(view);
    // Note: we are changing the NodeDef here as we cannot calculate
    // the fact whether a template is used for projection during compilation.
    markNodeAsProjectedTemplate(/** @type {?} */ ((view.parent)).def, /** @type {?} */ ((view.parentNodeDef)));
}
/**
 * @param {?} viewDef
 * @param {?} nodeDef
 * @return {?}
 */
function markNodeAsProjectedTemplate(viewDef, nodeDef) {
    if (nodeDef.flags & 4 /* ProjectedTemplate */) {
        return;
    }
    viewDef.nodeFlags |= 4 /* ProjectedTemplate */;
    nodeDef.flags |= 4 /* ProjectedTemplate */;
    let /** @type {?} */ parentNodeDef = nodeDef.parent;
    while (parentNodeDef) {
        parentNodeDef.childFlags |= 4 /* ProjectedTemplate */;
        parentNodeDef = parentNodeDef.parent;
    }
}
/**
 * @param {?} elementData
 * @param {?=} viewIndex
 * @return {?}
 */
export function detachEmbeddedView(elementData, viewIndex) {
    const /** @type {?} */ embeddedViews = /** @type {?} */ ((elementData.viewContainer))._embeddedViews;
    if (viewIndex == null || viewIndex >= embeddedViews.length) {
        viewIndex = embeddedViews.length - 1;
    }
    if (viewIndex < 0) {
        return null;
    }
    const /** @type {?} */ view = embeddedViews[viewIndex];
    view.viewContainerParent = null;
    removeFromArray(embeddedViews, viewIndex);
    // See attachProjectedView for why we don't update projectedViews here.
    Services.dirtyParentQueries(view);
    renderDetachView(view);
    return view;
}
/**
 * @param {?} view
 * @return {?}
 */
export function detachProjectedView(view) {
    if (!(view.state & 16 /* IsProjectedView */)) {
        return;
    }
    const /** @type {?} */ dvcElementData = declaredViewContainer(view);
    if (dvcElementData) {
        const /** @type {?} */ projectedViews = dvcElementData.template._projectedViews;
        if (projectedViews) {
            removeFromArray(projectedViews, projectedViews.indexOf(view));
            Services.dirtyParentQueries(view);
        }
    }
}
/**
 * @param {?} elementData
 * @param {?} oldViewIndex
 * @param {?} newViewIndex
 * @return {?}
 */
export function moveEmbeddedView(elementData, oldViewIndex, newViewIndex) {
    const /** @type {?} */ embeddedViews = /** @type {?} */ ((elementData.viewContainer))._embeddedViews;
    const /** @type {?} */ view = embeddedViews[oldViewIndex];
    removeFromArray(embeddedViews, oldViewIndex);
    if (newViewIndex == null) {
        newViewIndex = embeddedViews.length;
    }
    addToArray(embeddedViews, newViewIndex, view);
    // Note: Don't need to change projectedViews as the order in there
    // as always invalid...
    Services.dirtyParentQueries(view);
    renderDetachView(view);
    const /** @type {?} */ prevView = newViewIndex > 0 ? embeddedViews[newViewIndex - 1] : null;
    renderAttachEmbeddedView(elementData, prevView, view);
    return view;
}
/**
 * @param {?} elementData
 * @param {?} prevView
 * @param {?} view
 * @return {?}
 */
function renderAttachEmbeddedView(elementData, prevView, view) {
    const /** @type {?} */ prevRenderNode = prevView ? renderNode(prevView, /** @type {?} */ ((prevView.def.lastRenderRootNode))) :
        elementData.renderElement;
    const /** @type {?} */ parentNode = view.renderer.parentNode(prevRenderNode);
    const /** @type {?} */ nextSibling = view.renderer.nextSibling(prevRenderNode);
    // Note: We can't check if `nextSibling` is present, as on WebWorkers it will always be!
    // However, browsers automatically do `appendChild` when there is no `nextSibling`.
    visitRootRenderNodes(view, 2 /* InsertBefore */, parentNode, nextSibling, undefined);
}
/**
 * @param {?} view
 * @return {?}
 */
export function renderDetachView(view) {
    visitRootRenderNodes(view, 3 /* RemoveChild */, null, null, undefined);
}
/**
 * @param {?} arr
 * @param {?} index
 * @param {?} value
 * @return {?}
 */
function addToArray(arr, index, value) {
    // perf: array.push is faster than array.splice!
    if (index >= arr.length) {
        arr.push(value);
    }
    else {
        arr.splice(index, 0, value);
    }
}
/**
 * @param {?} arr
 * @param {?} index
 * @return {?}
 */
function removeFromArray(arr, index) {
    // perf: array.pop is faster than array.splice!
    if (index >= arr.length - 1) {
        arr.pop();
    }
    else {
        arr.splice(index, 1);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19hdHRhY2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy92aWV3L3ZpZXdfYXR0YWNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFrQyxRQUFRLEVBQXNDLE1BQU0sU0FBUyxDQUFDO0FBQ3ZHLE9BQU8sRUFBbUIscUJBQXFCLEVBQW1CLFVBQVUsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7QUFFbEgsTUFBTSw2QkFDRixVQUFvQixFQUFFLFdBQXdCLEVBQUUsU0FBb0MsRUFDcEYsSUFBYztJQUNoQixxQkFBSSxhQUFhLHNCQUFHLFdBQVcsQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDO0lBQy9ELEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7S0FDbEM7SUFDRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBQ3RDLFVBQVUsQ0FBQyxhQUFhLHFCQUFFLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUM3QyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFdkMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLHVCQUFNLFFBQVEsc0JBQUcsU0FBUyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxvQkFBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN6RSx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3ZEOzs7Ozs7QUFFRCw2QkFBNkIsYUFBMEIsRUFBRSxJQUFjO0lBQ3JFLHVCQUFNLGNBQWMsR0FBRyxxQkFB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LEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQy9GOzs7OztBQUVELE1BQU0sMkJBQTJCLElBQWM7SUFDN0Msb0JBQW9CLENBQUMsSUFBSSx1QkFBZ0MsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztDQUNqRjs7Ozs7OztBQUVELG9CQUFvQixHQUFVLEVBQUUsS0FBYSxFQUFFLEtBQVU7O0lBRXZELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN4QixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2pCO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDN0I7Q0FDRjs7Ozs7O0FBRUQseUJBQXlCLEdBQVUsRUFBRSxLQUFhOztJQUVoRCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNYO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN0QjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VsZW1lbnREYXRhLCBOb2RlRGVmLCBOb2RlRmxhZ3MsIFNlcnZpY2VzLCBWaWV3RGF0YSwgVmlld0RlZmluaXRpb24sIFZpZXdTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1JlbmRlck5vZGVBY3Rpb24sIGRlY2xhcmVkVmlld0NvbnRhaW5lciwgaXNDb21wb25lbnRWaWV3LCByZW5kZXJOb2RlLCB2aXNpdFJvb3RSZW5kZXJOb2Rlc30gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaEVtYmVkZGVkVmlldyhcbiAgICBwYXJlbnRWaWV3OiBWaWV3RGF0YSwgZWxlbWVudERhdGE6IEVsZW1lbnREYXRhLCB2aWV3SW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgdmlldzogVmlld0RhdGEpIHtcbiAgbGV0IGVtYmVkZGVkVmlld3MgPSBlbGVtZW50RGF0YS52aWV3Q29udGFpbmVyICEuX2VtYmVkZGVkVmlld3M7XG4gIGlmICh2aWV3SW5kZXggPT09IG51bGwgfHwgdmlld0luZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICB2aWV3SW5kZXggPSBlbWJlZGRlZFZpZXdzLmxlbmd0aDtcbiAgfVxuICB2aWV3LnZpZXdDb250YWluZXJQYXJlbnQgPSBwYXJlbnRWaWV3O1xuICBhZGRUb0FycmF5KGVtYmVkZGVkVmlld3MsIHZpZXdJbmRleCAhLCB2aWV3KTtcbiAgYXR0YWNoUHJvamVjdGVkVmlldyhlbGVtZW50RGF0YSwgdmlldyk7XG5cbiAgU2VydmljZXMuZGlydHlQYXJlbnRRdWVyaWVzKHZpZXcpO1xuXG4gIGNvbnN0IHByZXZWaWV3ID0gdmlld0luZGV4ICEgPiAwID8gZW1iZWRkZWRWaWV3c1t2aWV3SW5kZXggISAtIDFdIDogbnVsbDtcbiAgcmVuZGVyQXR0YWNoRW1iZWRkZWRWaWV3KGVsZW1lbnREYXRhLCBwcmV2Vmlldywgdmlldyk7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaFByb2plY3RlZFZpZXcodmNFbGVtZW50RGF0YTogRWxlbWVudERhdGEsIHZpZXc6IFZpZXdEYXRhKSB7XG4gIGNvbnN0IGR2Y0VsZW1lbnREYXRhID0gZGVjbGFyZWRWaWV3Q29udGFpbmVyKHZpZXcpO1xuICBpZiAoIWR2Y0VsZW1lbnREYXRhIHx8IGR2Y0VsZW1lbnREYXRhID09PSB2Y0VsZW1lbnREYXRhIHx8XG4gICAgICB2aWV3LnN0YXRlICYgVmlld1N0YXRlLklzUHJvamVjdGVkVmlldykge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBOb3RlOiBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgd2VcbiAgLy8gLSBhZGQgYSB2aWV3IHRvIHRlbXBsYXRlLl9wcm9qZWN0ZWRWaWV3cyBvbmx5IDF4IHRocm91Z2hvdXQgaXRzIGxpZmV0aW1lLFxuICAvLyAgIGFuZCByZW1vdmUgaXQgbm90IHVudGlsIHRoZSB2aWV3IGlzIGRlc3Ryb3llZC5cbiAgLy8gICAoaGFyZCwgYXMgd2hlbiBhIHBhcmVudCB2aWV3IGlzIGF0dGFjaGVkL2RldGFjaGVkIHdlIHdvdWxkIG5lZWQgdG8gYXR0YWNoL2RldGFjaCBhbGxcbiAgLy8gICAgbmVzdGVkIHByb2plY3RlZCB2aWV3cyBhcyB3ZWxsLCBldmVuIGFjcm9zcyBjb21wb25lbnQgYm91bmRhcmllcykuXG4gIC8vIC0gZG9uJ3QgdHJhY2sgdGhlIGluc2VydGlvbiBvcmRlciBvZiB2aWV3cyBpbiB0aGUgcHJvamVjdGVkIHZpZXdzIGFycmF5XG4gIC8vICAgKGhhcmQsIGFzIHdoZW4gdGhlIHZpZXdzIG9mIHRoZSBzYW1lIHRlbXBsYXRlIGFyZSBpbnNlcnRlZCBkaWZmZXJlbnQgdmlldyBjb250YWluZXJzKVxuICB2aWV3LnN0YXRlIHw9IFZpZXdTdGF0ZS5Jc1Byb2plY3RlZFZpZXc7XG4gIGxldCBwcm9qZWN0ZWRWaWV3cyA9IGR2Y0VsZW1lbnREYXRhLnRlbXBsYXRlLl9wcm9qZWN0ZWRWaWV3cztcbiAgaWYgKCFwcm9qZWN0ZWRWaWV3cykge1xuICAgIHByb2plY3RlZFZpZXdzID0gZHZjRWxlbWVudERhdGEudGVtcGxhdGUuX3Byb2plY3RlZFZpZXdzID0gW107XG4gIH1cbiAgcHJvamVjdGVkVmlld3MucHVzaCh2aWV3KTtcbiAgLy8gTm90ZTogd2UgYXJlIGNoYW5naW5nIHRoZSBOb2RlRGVmIGhlcmUgYXMgd2UgY2Fubm90IGNhbGN1bGF0ZVxuICAvLyB0aGUgZmFjdCB3aGV0aGVyIGEgdGVtcGxhdGUgaXMgdXNlZCBmb3IgcHJvamVjdGlvbiBkdXJpbmcgY29tcGlsYXRpb24uXG4gIG1hcmtOb2RlQXNQcm9qZWN0ZWRUZW1wbGF0ZSh2aWV3LnBhcmVudCAhLmRlZiwgdmlldy5wYXJlbnROb2RlRGVmICEpO1xufVxuXG5mdW5jdGlvbiBtYXJrTm9kZUFzUHJvamVjdGVkVGVtcGxhdGUodmlld0RlZjogVmlld0RlZmluaXRpb24sIG5vZGVEZWY6IE5vZGVEZWYpIHtcbiAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuUHJvamVjdGVkVGVtcGxhdGUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmlld0RlZi5ub2RlRmxhZ3MgfD0gTm9kZUZsYWdzLlByb2plY3RlZFRlbXBsYXRlO1xuICBub2RlRGVmLmZsYWdzIHw9IE5vZGVGbGFncy5Qcm9qZWN0ZWRUZW1wbGF0ZTtcbiAgbGV0IHBhcmVudE5vZGVEZWYgPSBub2RlRGVmLnBhcmVudDtcbiAgd2hpbGUgKHBhcmVudE5vZGVEZWYpIHtcbiAgICBwYXJlbnROb2RlRGVmLmNoaWxkRmxhZ3MgfD0gTm9kZUZsYWdzLlByb2plY3RlZFRlbXBsYXRlO1xuICAgIHBhcmVudE5vZGVEZWYgPSBwYXJlbnROb2RlRGVmLnBhcmVudDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoRW1iZWRkZWRWaWV3KGVsZW1lbnREYXRhOiBFbGVtZW50RGF0YSwgdmlld0luZGV4PzogbnVtYmVyKTogVmlld0RhdGF8bnVsbCB7XG4gIGNvbnN0IGVtYmVkZGVkVmlld3MgPSBlbGVtZW50RGF0YS52aWV3Q29udGFpbmVyICEuX2VtYmVkZGVkVmlld3M7XG4gIGlmICh2aWV3SW5kZXggPT0gbnVsbCB8fCB2aWV3SW5kZXggPj0gZW1iZWRkZWRWaWV3cy5sZW5ndGgpIHtcbiAgICB2aWV3SW5kZXggPSBlbWJlZGRlZFZpZXdzLmxlbmd0aCAtIDE7XG4gIH1cbiAgaWYgKHZpZXdJbmRleCA8IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCB2aWV3ID0gZW1iZWRkZWRWaWV3c1t2aWV3SW5kZXhdO1xuICB2aWV3LnZpZXdDb250YWluZXJQYXJlbnQgPSBudWxsO1xuICByZW1vdmVGcm9tQXJyYXkoZW1iZWRkZWRWaWV3cywgdmlld0luZGV4KTtcblxuICAvLyBTZWUgYXR0YWNoUHJvamVjdGVkVmlldyBmb3Igd2h5IHdlIGRvbid0IHVwZGF0ZSBwcm9qZWN0ZWRWaWV3cyBoZXJlLlxuICBTZXJ2aWNlcy5kaXJ0eVBhcmVudFF1ZXJpZXModmlldyk7XG5cbiAgcmVuZGVyRGV0YWNoVmlldyh2aWV3KTtcblxuICByZXR1cm4gdmlldztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGFjaFByb2plY3RlZFZpZXcodmlldzogVmlld0RhdGEpIHtcbiAgaWYgKCEodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5Jc1Byb2plY3RlZFZpZXcpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGR2Y0VsZW1lbnREYXRhID0gZGVjbGFyZWRWaWV3Q29udGFpbmVyKHZpZXcpO1xuICBpZiAoZHZjRWxlbWVudERhdGEpIHtcbiAgICBjb25zdCBwcm9qZWN0ZWRWaWV3cyA9IGR2Y0VsZW1lbnREYXRhLnRlbXBsYXRlLl9wcm9qZWN0ZWRWaWV3cztcbiAgICBpZiAocHJvamVjdGVkVmlld3MpIHtcbiAgICAgIHJlbW92ZUZyb21BcnJheShwcm9qZWN0ZWRWaWV3cywgcHJvamVjdGVkVmlld3MuaW5kZXhPZih2aWV3KSk7XG4gICAgICBTZXJ2aWNlcy5kaXJ0eVBhcmVudFF1ZXJpZXModmlldyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlRW1iZWRkZWRWaWV3KFxuICAgIGVsZW1lbnREYXRhOiBFbGVtZW50RGF0YSwgb2xkVmlld0luZGV4OiBudW1iZXIsIG5ld1ZpZXdJbmRleDogbnVtYmVyKTogVmlld0RhdGEge1xuICBjb25zdCBlbWJlZGRlZFZpZXdzID0gZWxlbWVudERhdGEudmlld0NvbnRhaW5lciAhLl9lbWJlZGRlZFZpZXdzO1xuICBjb25zdCB2aWV3ID0gZW1iZWRkZWRWaWV3c1tvbGRWaWV3SW5kZXhdO1xuICByZW1vdmVGcm9tQXJyYXkoZW1iZWRkZWRWaWV3cywgb2xkVmlld0luZGV4KTtcbiAgaWYgKG5ld1ZpZXdJbmRleCA9PSBudWxsKSB7XG4gICAgbmV3Vmlld0luZGV4ID0gZW1iZWRkZWRWaWV3cy5sZW5ndGg7XG4gIH1cbiAgYWRkVG9BcnJheShlbWJlZGRlZFZpZXdzLCBuZXdWaWV3SW5kZXgsIHZpZXcpO1xuXG4gIC8vIE5vdGU6IERvbid0IG5lZWQgdG8gY2hhbmdlIHByb2plY3RlZFZpZXdzIGFzIHRoZSBvcmRlciBpbiB0aGVyZVxuICAvLyBhcyBhbHdheXMgaW52YWxpZC4uLlxuXG4gIFNlcnZpY2VzLmRpcnR5UGFyZW50UXVlcmllcyh2aWV3KTtcblxuICByZW5kZXJEZXRhY2hWaWV3KHZpZXcpO1xuICBjb25zdCBwcmV2VmlldyA9IG5ld1ZpZXdJbmRleCA+IDAgPyBlbWJlZGRlZFZpZXdzW25ld1ZpZXdJbmRleCAtIDFdIDogbnVsbDtcbiAgcmVuZGVyQXR0YWNoRW1iZWRkZWRWaWV3KGVsZW1lbnREYXRhLCBwcmV2Vmlldywgdmlldyk7XG5cbiAgcmV0dXJuIHZpZXc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckF0dGFjaEVtYmVkZGVkVmlldyhcbiAgICBlbGVtZW50RGF0YTogRWxlbWVudERhdGEsIHByZXZWaWV3OiBWaWV3RGF0YSB8IG51bGwsIHZpZXc6IFZpZXdEYXRhKSB7XG4gIGNvbnN0IHByZXZSZW5kZXJOb2RlID0gcHJldlZpZXcgPyByZW5kZXJOb2RlKHByZXZWaWV3LCBwcmV2Vmlldy5kZWYubGFzdFJlbmRlclJvb3ROb2RlICEpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnREYXRhLnJlbmRlckVsZW1lbnQ7XG4gIGNvbnN0IHBhcmVudE5vZGUgPSB2aWV3LnJlbmRlcmVyLnBhcmVudE5vZGUocHJldlJlbmRlck5vZGUpO1xuICBjb25zdCBuZXh0U2libGluZyA9IHZpZXcucmVuZGVyZXIubmV4dFNpYmxpbmcocHJldlJlbmRlck5vZGUpO1xuICAvLyBOb3RlOiBXZSBjYW4ndCBjaGVjayBpZiBgbmV4dFNpYmxpbmdgIGlzIHByZXNlbnQsIGFzIG9uIFdlYldvcmtlcnMgaXQgd2lsbCBhbHdheXMgYmUhXG4gIC8vIEhvd2V2ZXIsIGJyb3dzZXJzIGF1dG9tYXRpY2FsbHkgZG8gYGFwcGVuZENoaWxkYCB3aGVuIHRoZXJlIGlzIG5vIGBuZXh0U2libGluZ2AuXG4gIHZpc2l0Um9vdFJlbmRlck5vZGVzKHZpZXcsIFJlbmRlck5vZGVBY3Rpb24uSW5zZXJ0QmVmb3JlLCBwYXJlbnROb2RlLCBuZXh0U2libGluZywgdW5kZWZpbmVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckRldGFjaFZpZXcodmlldzogVmlld0RhdGEpIHtcbiAgdmlzaXRSb290UmVuZGVyTm9kZXModmlldywgUmVuZGVyTm9kZUFjdGlvbi5SZW1vdmVDaGlsZCwgbnVsbCwgbnVsbCwgdW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gYWRkVG9BcnJheShhcnI6IGFueVtdLCBpbmRleDogbnVtYmVyLCB2YWx1ZTogYW55KSB7XG4gIC8vIHBlcmY6IGFycmF5LnB1c2ggaXMgZmFzdGVyIHRoYW4gYXJyYXkuc3BsaWNlIVxuICBpZiAoaW5kZXggPj0gYXJyLmxlbmd0aCkge1xuICAgIGFyci5wdXNoKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAwLCB2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlRnJvbUFycmF5KGFycjogYW55W10sIGluZGV4OiBudW1iZXIpIHtcbiAgLy8gcGVyZjogYXJyYXkucG9wIGlzIGZhc3RlciB0aGFuIGFycmF5LnNwbGljZSFcbiAgaWYgKGluZGV4ID49IGFyci5sZW5ndGggLSAxKSB7XG4gICAgYXJyLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59XG4iXX0=