/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
* Wraps a function in a new function which sets up document and HTML for running a test.
*
* This function is intended to wrap an existing testing function. The wrapper
* adds HTML to the `body` element of the `document` and subsequently tears it down.
*
* This function is intended to be used with `async await` and `Promise`s. If the wrapped
* function returns a promise (or is `async`) then the teardown is delayed until that `Promise`
* is resolved.
*
* On `node` this function detects if `document` is present and if not it will create one by
* loading `domino` and installing it.
*
* Example:
*
* ```
* describe('something', () => {
*   it('should do something', withBody('<my-app></my-app>', async () => {
*     const myApp = renderComponent(MyApp);
*     await whenRendered(myApp);
*     expect(getRenderedText(myApp)).toEqual('Hello World!');
*   }));
* });
* ```
*
* @param html HTML which should be inserted into `body` of the `document`.
* @param blockFn function to wrap. The function can return promise or be `async`.
* @experimental
*/
export function withBody(html, blockFn) {
    return function (done) {
        ensureDocument();
        var returnValue = undefined;
        if (typeof blockFn === 'function') {
            document.body.innerHTML = html;
            // TODO(i): I'm not sure why a cast is required here but otherwise I get
            //   TS2349: Cannot invoke an expression whose type lacks a call signature. Type 'never' has
            //   no compatible call signatures.
            var blockReturn = blockFn();
            if (blockReturn instanceof Promise) {
                blockReturn = blockReturn.then(done, done.fail);
            }
            else {
                done();
            }
        }
    };
}
var savedDocument = undefined;
var savedRequestAnimationFrame = undefined;
var savedNode = undefined;
var requestAnimationFrameCount = 0;
var ɵ0 = function (domino) {
    if (typeof global == 'object' && global.process && typeof require == 'function') {
        try {
            return require(domino);
        }
        catch (e) {
            // It is possible that we don't have domino available in which case just give up.
        }
    }
    // Seems like we don't have domino, give up.
    return null;
};
/**
 * System.js uses regexp to look for `require` statements. `domino` has to be
 * extracted into a constant so that the regexp in the System.js does not match
 * and does not try to load domino in the browser.
 */
var domino = (ɵ0)('domino');
/**
 * Ensure that global has `Document` if we are in node.js
 * @experimental
 */
export function ensureDocument() {
    if (domino) {
        // we are in node.js.
        var window_1 = domino.createWindow('', 'http://localhost');
        savedDocument = global.document;
        global.window = window_1;
        global.document = window_1.document;
        // Trick to avoid Event patching from
        // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
        // It fails with Domino with TypeError: Cannot assign to read only property
        // 'stopImmediatePropagation' of object '#<Event>'
        // Trick to avoid Event patching from
        // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
        // It fails with Domino with TypeError: Cannot assign to read only property
        // 'stopImmediatePropagation' of object '#<Event>'
        global.Event = null;
        savedNode = global.Node;
        global.Node = domino.impl.Node;
        savedRequestAnimationFrame = global.requestAnimationFrame;
        global.requestAnimationFrame = function (cb) {
            setImmediate(cb);
            return requestAnimationFrameCount++;
        };
    }
}
/**
 * Restore the state of `Document` between tests.
 * @experimental
 */
export function cleanupDocument() {
    if (savedDocument) {
        global.document = savedDocument;
        global.window = undefined;
        savedDocument = undefined;
    }
    if (savedNode) {
        global.Node = savedNode;
        savedNode = undefined;
    }
    if (savedRequestAnimationFrame) {
        global.requestAnimationFrame = savedRequestAnimationFrame;
        savedRequestAnimationFrame = undefined;
    }
}
if (typeof beforeEach == 'function')
    beforeEach(ensureDocument);
if (typeof afterEach == 'function')
    beforeEach(cleanupDocument);
export { ɵ0 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvcmVuZGVyMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQ0EsTUFBTSxtQkFBc0IsSUFBWSxFQUFFLE9BQVU7SUFDbEQsTUFBTSxDQUFDLFVBQVMsSUFBOEI7UUFDNUMsY0FBYyxFQUFFLENBQUM7UUFDakIsSUFBSSxXQUFXLEdBQVEsU0FBUyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sT0FBTyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7O1lBSS9CLElBQUksV0FBVyxHQUFJLE9BQWUsRUFBRSxDQUFDO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsWUFBWSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxXQUFXLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pEO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxFQUFFLENBQUM7YUFDUjtTQUNGO0tBQ0ssQ0FBQztDQUNWO0FBRUQsSUFBSSxhQUFhLEdBQXVCLFNBQVMsQ0FBQztBQUNsRCxJQUFJLDBCQUEwQixHQUEyRCxTQUFTLENBQUM7QUFDbkcsSUFBSSxTQUFTLEdBQTBCLFNBQVMsQ0FBQztBQUNqRCxJQUFJLDBCQUEwQixHQUFHLENBQUMsQ0FBQztTQU9kLFVBQVMsTUFBTTtJQUNsQyxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxPQUFPLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQztZQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEI7UUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7U0FFWjtLQUNGOztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7Q0FDYjs7Ozs7O0FBVkQsSUFBTSxNQUFNLEdBQVEsSUFVbEIsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs7QUFNYixNQUFNO0lBQ0osRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7UUFFWCxJQUFNLFFBQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzNELGFBQWEsR0FBSSxNQUFjLENBQUMsUUFBUSxDQUFDO1FBQ3hDLE1BQWMsQ0FBQyxNQUFNLEdBQUcsUUFBTSxDQUFDO1FBQy9CLE1BQWMsQ0FBQyxRQUFRLEdBQUcsUUFBTSxDQUFDLFFBQVEsQ0FBQzs7Ozs7UUFLM0MsQUFKQSxxQ0FBcUM7UUFDckMsb0pBQW9KO1FBQ3BKLDJFQUEyRTtRQUMzRSxrREFBa0Q7UUFDakQsTUFBYyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDN0IsU0FBUyxHQUFJLE1BQWMsQ0FBQyxJQUFJLENBQUM7UUFDaEMsTUFBYyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV4QywwQkFBMEIsR0FBSSxNQUFjLENBQUMscUJBQXFCLENBQUM7UUFDbEUsTUFBYyxDQUFDLHFCQUFxQixHQUFHLFVBQVMsRUFBd0I7WUFDdkUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1NBQ3JDLENBQUM7S0FDSDtDQUNGOzs7OztBQU1ELE1BQU07SUFDSixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQWMsQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDO1FBQ3hDLE1BQWMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ25DLGFBQWEsR0FBRyxTQUFTLENBQUM7S0FDM0I7SUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2IsTUFBYyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFDakMsU0FBUyxHQUFHLFNBQVMsQ0FBQztLQUN2QjtJQUNELEVBQUUsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUM5QixNQUFjLENBQUMscUJBQXFCLEdBQUcsMEJBQTBCLENBQUM7UUFDbkUsMEJBQTBCLEdBQUcsU0FBUyxDQUFDO0tBQ3hDO0NBQ0Y7QUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLFVBQVUsSUFBSSxVQUFVLENBQUM7SUFBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDaEUsRUFBRSxDQUFDLENBQUMsT0FBTyxTQUFTLElBQUksVUFBVSxDQUFDO0lBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiogV3JhcHMgYSBmdW5jdGlvbiBpbiBhIG5ldyBmdW5jdGlvbiB3aGljaCBzZXRzIHVwIGRvY3VtZW50IGFuZCBIVE1MIGZvciBydW5uaW5nIGEgdGVzdC5cbipcbiogVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCB0byB3cmFwIGFuIGV4aXN0aW5nIHRlc3RpbmcgZnVuY3Rpb24uIFRoZSB3cmFwcGVyXG4qIGFkZHMgSFRNTCB0byB0aGUgYGJvZHlgIGVsZW1lbnQgb2YgdGhlIGBkb2N1bWVudGAgYW5kIHN1YnNlcXVlbnRseSB0ZWFycyBpdCBkb3duLlxuKlxuKiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgd2l0aCBgYXN5bmMgYXdhaXRgIGFuZCBgUHJvbWlzZWBzLiBJZiB0aGUgd3JhcHBlZFxuKiBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSAob3IgaXMgYGFzeW5jYCkgdGhlbiB0aGUgdGVhcmRvd24gaXMgZGVsYXllZCB1bnRpbCB0aGF0IGBQcm9taXNlYFxuKiBpcyByZXNvbHZlZC5cbipcbiogT24gYG5vZGVgIHRoaXMgZnVuY3Rpb24gZGV0ZWN0cyBpZiBgZG9jdW1lbnRgIGlzIHByZXNlbnQgYW5kIGlmIG5vdCBpdCB3aWxsIGNyZWF0ZSBvbmUgYnlcbiogbG9hZGluZyBgZG9taW5vYCBhbmQgaW5zdGFsbGluZyBpdC5cbipcbiogRXhhbXBsZTpcbipcbiogYGBgXG4qIGRlc2NyaWJlKCdzb21ldGhpbmcnLCAoKSA9PiB7XG4qICAgaXQoJ3Nob3VsZCBkbyBzb21ldGhpbmcnLCB3aXRoQm9keSgnPG15LWFwcD48L215LWFwcD4nLCBhc3luYyAoKSA9PiB7XG4qICAgICBjb25zdCBteUFwcCA9IHJlbmRlckNvbXBvbmVudChNeUFwcCk7XG4qICAgICBhd2FpdCB3aGVuUmVuZGVyZWQobXlBcHApO1xuKiAgICAgZXhwZWN0KGdldFJlbmRlcmVkVGV4dChteUFwcCkpLnRvRXF1YWwoJ0hlbGxvIFdvcmxkIScpO1xuKiAgIH0pKTtcbiogfSk7XG4qIGBgYFxuKlxuKiBAcGFyYW0gaHRtbCBIVE1MIHdoaWNoIHNob3VsZCBiZSBpbnNlcnRlZCBpbnRvIGBib2R5YCBvZiB0aGUgYGRvY3VtZW50YC5cbiogQHBhcmFtIGJsb2NrRm4gZnVuY3Rpb24gdG8gd3JhcC4gVGhlIGZ1bmN0aW9uIGNhbiByZXR1cm4gcHJvbWlzZSBvciBiZSBgYXN5bmNgLlxuKiBAZXhwZXJpbWVudGFsXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhCb2R5PFQ+KGh0bWw6IHN0cmluZywgYmxvY2tGbjogVCk6IFQge1xuICByZXR1cm4gZnVuY3Rpb24oZG9uZTogeygpOiB2b2lkLCBmYWlsKCk6IHZvaWR9KSB7XG4gICAgZW5zdXJlRG9jdW1lbnQoKTtcbiAgICBsZXQgcmV0dXJuVmFsdWU6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIGJsb2NrRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIC8vIFRPRE8oaSk6IEknbSBub3Qgc3VyZSB3aHkgYSBjYXN0IGlzIHJlcXVpcmVkIGhlcmUgYnV0IG90aGVyd2lzZSBJIGdldFxuICAgICAgLy8gICBUUzIzNDk6IENhbm5vdCBpbnZva2UgYW4gZXhwcmVzc2lvbiB3aG9zZSB0eXBlIGxhY2tzIGEgY2FsbCBzaWduYXR1cmUuIFR5cGUgJ25ldmVyJyBoYXNcbiAgICAgIC8vICAgbm8gY29tcGF0aWJsZSBjYWxsIHNpZ25hdHVyZXMuXG4gICAgICBsZXQgYmxvY2tSZXR1cm4gPSAoYmxvY2tGbiBhcyBhbnkpKCk7XG4gICAgICBpZiAoYmxvY2tSZXR1cm4gaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIGJsb2NrUmV0dXJuID0gYmxvY2tSZXR1cm4udGhlbihkb25lLCBkb25lLmZhaWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSBhcyBhbnk7XG59XG5cbmxldCBzYXZlZERvY3VtZW50OiBEb2N1bWVudHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5sZXQgc2F2ZWRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU6ICgoY2FsbGJhY2s6IEZyYW1lUmVxdWVzdENhbGxiYWNrKSA9PiBudW1iZXIpfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbmxldCBzYXZlZE5vZGU6IHR5cGVvZiBOb2RlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbmxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVDb3VudCA9IDA7XG5cbi8qKlxuICogU3lzdGVtLmpzIHVzZXMgcmVnZXhwIHRvIGxvb2sgZm9yIGByZXF1aXJlYCBzdGF0ZW1lbnRzLiBgZG9taW5vYCBoYXMgdG8gYmVcbiAqIGV4dHJhY3RlZCBpbnRvIGEgY29uc3RhbnQgc28gdGhhdCB0aGUgcmVnZXhwIGluIHRoZSBTeXN0ZW0uanMgZG9lcyBub3QgbWF0Y2hcbiAqIGFuZCBkb2VzIG5vdCB0cnkgdG8gbG9hZCBkb21pbm8gaW4gdGhlIGJyb3dzZXIuXG4gKi9cbmNvbnN0IGRvbWlubzogYW55ID0gKGZ1bmN0aW9uKGRvbWlubykge1xuICBpZiAodHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwucHJvY2VzcyAmJiB0eXBlb2YgcmVxdWlyZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiByZXF1aXJlKGRvbWlubyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gSXQgaXMgcG9zc2libGUgdGhhdCB3ZSBkb24ndCBoYXZlIGRvbWlubyBhdmFpbGFibGUgaW4gd2hpY2ggY2FzZSBqdXN0IGdpdmUgdXAuXG4gICAgfVxuICB9XG4gIC8vIFNlZW1zIGxpa2Ugd2UgZG9uJ3QgaGF2ZSBkb21pbm8sIGdpdmUgdXAuXG4gIHJldHVybiBudWxsO1xufSkoJ2RvbWlubycpO1xuXG4vKipcbiAqIEVuc3VyZSB0aGF0IGdsb2JhbCBoYXMgYERvY3VtZW50YCBpZiB3ZSBhcmUgaW4gbm9kZS5qc1xuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlRG9jdW1lbnQoKTogdm9pZCB7XG4gIGlmIChkb21pbm8pIHtcbiAgICAvLyB3ZSBhcmUgaW4gbm9kZS5qcy5cbiAgICBjb25zdCB3aW5kb3cgPSBkb21pbm8uY3JlYXRlV2luZG93KCcnLCAnaHR0cDovL2xvY2FsaG9zdCcpO1xuICAgIHNhdmVkRG9jdW1lbnQgPSAoZ2xvYmFsIGFzIGFueSkuZG9jdW1lbnQ7XG4gICAgKGdsb2JhbCBhcyBhbnkpLndpbmRvdyA9IHdpbmRvdztcbiAgICAoZ2xvYmFsIGFzIGFueSkuZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XG4gICAgLy8gVHJpY2sgdG8gYXZvaWQgRXZlbnQgcGF0Y2hpbmcgZnJvbVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi83Y2Y1ZTk1YWM5ZjBmMjY0OGJlZWJmMGQ1YmQ5MDU2Yjc5OTQ2OTcwL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvc3JjL2RvbS9ldmVudHMvZG9tX2V2ZW50cy50cyNMMTEyLUwxMzJcbiAgICAvLyBJdCBmYWlscyB3aXRoIERvbWlubyB3aXRoIFR5cGVFcnJvcjogQ2Fubm90IGFzc2lnbiB0byByZWFkIG9ubHkgcHJvcGVydHlcbiAgICAvLyAnc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uJyBvZiBvYmplY3QgJyM8RXZlbnQ+J1xuICAgIChnbG9iYWwgYXMgYW55KS5FdmVudCA9IG51bGw7XG4gICAgc2F2ZWROb2RlID0gKGdsb2JhbCBhcyBhbnkpLk5vZGU7XG4gICAgKGdsb2JhbCBhcyBhbnkpLk5vZGUgPSBkb21pbm8uaW1wbC5Ob2RlO1xuXG4gICAgc2F2ZWRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoZ2xvYmFsIGFzIGFueSkucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIChnbG9iYWwgYXMgYW55KS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYjogRnJhbWVSZXF1ZXN0Q2FsbGJhY2spOiBudW1iZXIge1xuICAgICAgc2V0SW1tZWRpYXRlKGNiKTtcbiAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWVDb3VudCsrO1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBSZXN0b3JlIHRoZSBzdGF0ZSBvZiBgRG9jdW1lbnRgIGJldHdlZW4gdGVzdHMuXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwRG9jdW1lbnQoKTogdm9pZCB7XG4gIGlmIChzYXZlZERvY3VtZW50KSB7XG4gICAgKGdsb2JhbCBhcyBhbnkpLmRvY3VtZW50ID0gc2F2ZWREb2N1bWVudDtcbiAgICAoZ2xvYmFsIGFzIGFueSkud2luZG93ID0gdW5kZWZpbmVkO1xuICAgIHNhdmVkRG9jdW1lbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKHNhdmVkTm9kZSkge1xuICAgIChnbG9iYWwgYXMgYW55KS5Ob2RlID0gc2F2ZWROb2RlO1xuICAgIHNhdmVkTm9kZSA9IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoc2F2ZWRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAoZ2xvYmFsIGFzIGFueSkucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gc2F2ZWRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgc2F2ZWRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQ7XG4gIH1cbn1cblxuaWYgKHR5cGVvZiBiZWZvcmVFYWNoID09ICdmdW5jdGlvbicpIGJlZm9yZUVhY2goZW5zdXJlRG9jdW1lbnQpO1xuaWYgKHR5cGVvZiBhZnRlckVhY2ggPT0gJ2Z1bmN0aW9uJykgYmVmb3JlRWFjaChjbGVhbnVwRG9jdW1lbnQpOyJdfQ==