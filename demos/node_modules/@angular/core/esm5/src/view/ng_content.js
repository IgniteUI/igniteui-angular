/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getParentRenderElement, visitProjectedRenderNodes } from './util';
export function ngContentDef(ngContentIndex, index) {
    return {
        // will bet set by the view definition
        nodeIndex: -1,
        parent: null,
        renderParent: null,
        bindingIndex: -1,
        outputIndex: -1,
        // regular values
        checkIndex: -1,
        flags: 8 /* TypeNgContent */,
        childFlags: 0,
        directChildFlags: 0,
        childMatchedQueries: 0,
        matchedQueries: {},
        matchedQueryIds: 0,
        references: {}, ngContentIndex: ngContentIndex,
        childCount: 0,
        bindings: [],
        bindingFlags: 0,
        outputs: [],
        element: null,
        provider: null,
        text: null,
        query: null,
        ngContent: { index: index }
    };
}
export function appendNgContent(view, renderHost, def) {
    var parentEl = getParentRenderElement(view, renderHost, def);
    if (!parentEl) {
        // Nothing to do if there is no parent element.
        return;
    }
    var ngContentIndex = def.ngContent.index;
    visitProjectedRenderNodes(view, ngContentIndex, 1 /* AppendChild */, parentEl, null, undefined);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvbmdfY29udGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBU0EsT0FBTyxFQUFtQixzQkFBc0IsRUFBRSx5QkFBeUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUUzRixNQUFNLHVCQUF1QixjQUE2QixFQUFFLEtBQWE7SUFDdkUsTUFBTSxDQUFDOztRQUVMLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDYixNQUFNLEVBQUUsSUFBSTtRQUNaLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDaEIsV0FBVyxFQUFFLENBQUMsQ0FBQzs7UUFFZixVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ2QsS0FBSyx1QkFBeUI7UUFDOUIsVUFBVSxFQUFFLENBQUM7UUFDYixnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsY0FBYyxFQUFFLEVBQUU7UUFDbEIsZUFBZSxFQUFFLENBQUM7UUFDbEIsVUFBVSxFQUFFLEVBQUUsRUFBRSxjQUFjLGdCQUFBO1FBQzlCLFVBQVUsRUFBRSxDQUFDO1FBQ2IsUUFBUSxFQUFFLEVBQUU7UUFDWixZQUFZLEVBQUUsQ0FBQztRQUNmLE9BQU8sRUFBRSxFQUFFO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixRQUFRLEVBQUUsSUFBSTtRQUNkLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsRUFBQyxLQUFLLE9BQUEsRUFBQztLQUNuQixDQUFDO0NBQ0g7QUFFRCxNQUFNLDBCQUEwQixJQUFjLEVBQUUsVUFBZSxFQUFFLEdBQVk7SUFDM0UsSUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7O1FBRWQsTUFBTSxDQUFDO0tBQ1I7SUFDRCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsU0FBVyxDQUFDLEtBQUssQ0FBQztJQUM3Qyx5QkFBeUIsQ0FDckIsSUFBSSxFQUFFLGNBQWMsdUJBQWdDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDcEYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Tm9kZURlZiwgTm9kZUZsYWdzLCBWaWV3RGF0YX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1JlbmRlck5vZGVBY3Rpb24sIGdldFBhcmVudFJlbmRlckVsZW1lbnQsIHZpc2l0UHJvamVjdGVkUmVuZGVyTm9kZXN9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBuZ0NvbnRlbnREZWYobmdDb250ZW50SW5kZXg6IG51bGwgfCBudW1iZXIsIGluZGV4OiBudW1iZXIpOiBOb2RlRGVmIHtcbiAgcmV0dXJuIHtcbiAgICAvLyB3aWxsIGJldCBzZXQgYnkgdGhlIHZpZXcgZGVmaW5pdGlvblxuICAgIG5vZGVJbmRleDogLTEsXG4gICAgcGFyZW50OiBudWxsLFxuICAgIHJlbmRlclBhcmVudDogbnVsbCxcbiAgICBiaW5kaW5nSW5kZXg6IC0xLFxuICAgIG91dHB1dEluZGV4OiAtMSxcbiAgICAvLyByZWd1bGFyIHZhbHVlc1xuICAgIGNoZWNrSW5kZXg6IC0xLFxuICAgIGZsYWdzOiBOb2RlRmxhZ3MuVHlwZU5nQ29udGVudCxcbiAgICBjaGlsZEZsYWdzOiAwLFxuICAgIGRpcmVjdENoaWxkRmxhZ3M6IDAsXG4gICAgY2hpbGRNYXRjaGVkUXVlcmllczogMCxcbiAgICBtYXRjaGVkUXVlcmllczoge30sXG4gICAgbWF0Y2hlZFF1ZXJ5SWRzOiAwLFxuICAgIHJlZmVyZW5jZXM6IHt9LCBuZ0NvbnRlbnRJbmRleCxcbiAgICBjaGlsZENvdW50OiAwLFxuICAgIGJpbmRpbmdzOiBbXSxcbiAgICBiaW5kaW5nRmxhZ3M6IDAsXG4gICAgb3V0cHV0czogW10sXG4gICAgZWxlbWVudDogbnVsbCxcbiAgICBwcm92aWRlcjogbnVsbCxcbiAgICB0ZXh0OiBudWxsLFxuICAgIHF1ZXJ5OiBudWxsLFxuICAgIG5nQ29udGVudDoge2luZGV4fVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kTmdDb250ZW50KHZpZXc6IFZpZXdEYXRhLCByZW5kZXJIb3N0OiBhbnksIGRlZjogTm9kZURlZikge1xuICBjb25zdCBwYXJlbnRFbCA9IGdldFBhcmVudFJlbmRlckVsZW1lbnQodmlldywgcmVuZGVySG9zdCwgZGVmKTtcbiAgaWYgKCFwYXJlbnRFbCkge1xuICAgIC8vIE5vdGhpbmcgdG8gZG8gaWYgdGhlcmUgaXMgbm8gcGFyZW50IGVsZW1lbnQuXG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IG5nQ29udGVudEluZGV4ID0gZGVmLm5nQ29udGVudCAhLmluZGV4O1xuICB2aXNpdFByb2plY3RlZFJlbmRlck5vZGVzKFxuICAgICAgdmlldywgbmdDb250ZW50SW5kZXgsIFJlbmRlck5vZGVBY3Rpb24uQXBwZW5kQ2hpbGQsIHBhcmVudEVsLCBudWxsLCB1bmRlZmluZWQpO1xufVxuIl19