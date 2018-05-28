/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * This helper class is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we must use one of three strategies for doing this.
 * Support: Safari 10.x -> XHR strategy
 * Support: Firefox -> DomParser strategy
 * Default: InertDocument strategy
 */
var /**
 * This helper class is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we must use one of three strategies for doing this.
 * Support: Safari 10.x -> XHR strategy
 * Support: Firefox -> DomParser strategy
 * Default: InertDocument strategy
 */
InertBodyHelper = /** @class */ (function () {
    function InertBodyHelper(defaultDoc) {
        this.defaultDoc = defaultDoc;
        this.inertDocument = this.defaultDoc.implementation.createHTMLDocument('sanitization-inert');
        this.inertBodyElement = this.inertDocument.body;
        if (this.inertBodyElement == null) {
            // usually there should be only one body element in the document, but IE doesn't have any, so
            // we need to create one.
            var inertHtml = this.inertDocument.createElement('html');
            this.inertDocument.appendChild(inertHtml);
            this.inertBodyElement = this.inertDocument.createElement('body');
            inertHtml.appendChild(this.inertBodyElement);
        }
        this.inertBodyElement.innerHTML = '<svg><g onload="this.parentNode.remove()"></g></svg>';
        if (this.inertBodyElement.querySelector && !this.inertBodyElement.querySelector('svg')) {
            // We just hit the Safari 10.1 bug - which allows JS to run inside the SVG G element
            // so use the XHR strategy.
            this.getInertBodyElement = this.getInertBodyElement_XHR;
            return;
        }
        this.inertBodyElement.innerHTML =
            '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">';
        if (this.inertBodyElement.querySelector && this.inertBodyElement.querySelector('svg img')) {
            // We just hit the Firefox bug - which prevents the inner img JS from being sanitized
            // so use the DOMParser strategy, if it is available.
            // If the DOMParser is not available then we are not in Firefox (Server/WebWorker?) so we
            // fall through to the default strategy below.
            if (isDOMParserAvailable()) {
                this.getInertBodyElement = this.getInertBodyElement_DOMParser;
                return;
            }
        }
        // None of the bugs were hit so it is safe for us to use the default InertDocument strategy
        this.getInertBodyElement = this.getInertBodyElement_InertDocument;
    }
    /**
     * Use XHR to create and fill an inert body element (on Safari 10.1)
     * See
     * https://github.com/cure53/DOMPurify/blob/a992d3a75031cb8bb032e5ea8399ba972bdf9a65/src/purify.js#L439-L449
     */
    /**
       * Use XHR to create and fill an inert body element (on Safari 10.1)
       * See
       * https://github.com/cure53/DOMPurify/blob/a992d3a75031cb8bb032e5ea8399ba972bdf9a65/src/purify.js#L439-L449
       */
    InertBodyHelper.prototype.getInertBodyElement_XHR = /**
       * Use XHR to create and fill an inert body element (on Safari 10.1)
       * See
       * https://github.com/cure53/DOMPurify/blob/a992d3a75031cb8bb032e5ea8399ba972bdf9a65/src/purify.js#L439-L449
       */
    function (html) {
        // We add these extra elements to ensure that the rest of the content is parsed as expected
        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
        // `<head>` tag.
        html = '<body><remove></remove>' + html + '</body>';
        try {
            html = encodeURI(html);
        }
        catch (e) {
            return null;
        }
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', 'data:text/html;charset=utf-8,' + html, false);
        xhr.send(null);
        var body = xhr.response.body;
        body.removeChild((body.firstChild));
        return body;
    };
    /**
     * Use DOMParser to create and fill an inert body element (on Firefox)
     * See https://github.com/cure53/DOMPurify/releases/tag/0.6.7
     *
     */
    /**
       * Use DOMParser to create and fill an inert body element (on Firefox)
       * See https://github.com/cure53/DOMPurify/releases/tag/0.6.7
       *
       */
    InertBodyHelper.prototype.getInertBodyElement_DOMParser = /**
       * Use DOMParser to create and fill an inert body element (on Firefox)
       * See https://github.com/cure53/DOMPurify/releases/tag/0.6.7
       *
       */
    function (html) {
        // We add these extra elements to ensure that the rest of the content is parsed as expected
        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
        // `<head>` tag.
        html = '<body><remove></remove>' + html + '</body>';
        try {
            var body = new window
                .DOMParser()
                .parseFromString(html, 'text/html')
                .body;
            body.removeChild((body.firstChild));
            return body;
        }
        catch (e) {
            return null;
        }
    };
    /**
     * Use an HTML5 `template` element, if supported, or an inert body element created via
     * `createHtmlDocument` to create and fill an inert DOM element.
     * This is the default sane strategy to use if the browser does not require one of the specialised
     * strategies above.
     */
    /**
       * Use an HTML5 `template` element, if supported, or an inert body element created via
       * `createHtmlDocument` to create and fill an inert DOM element.
       * This is the default sane strategy to use if the browser does not require one of the specialised
       * strategies above.
       */
    InertBodyHelper.prototype.getInertBodyElement_InertDocument = /**
       * Use an HTML5 `template` element, if supported, or an inert body element created via
       * `createHtmlDocument` to create and fill an inert DOM element.
       * This is the default sane strategy to use if the browser does not require one of the specialised
       * strategies above.
       */
    function (html) {
        // Prefer using <template> element if supported.
        var templateEl = this.inertDocument.createElement('template');
        if ('content' in templateEl) {
            templateEl.innerHTML = html;
            return templateEl;
        }
        this.inertBodyElement.innerHTML = html;
        // Support: IE 9-11 only
        // strip custom-namespaced attributes on IE<=11
        if (this.defaultDoc.documentMode) {
            this.stripCustomNsAttrs(this.inertBodyElement);
        }
        return this.inertBodyElement;
    };
    /**
     * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
     * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
     * 'ns1:xlink:foo').
     *
     * This is undesirable since we don't want to allow any of these custom attributes. This method
     * strips them all.
     */
    /**
       * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
       * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
       * 'ns1:xlink:foo').
       *
       * This is undesirable since we don't want to allow any of these custom attributes. This method
       * strips them all.
       */
    InertBodyHelper.prototype.stripCustomNsAttrs = /**
       * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
       * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
       * 'ns1:xlink:foo').
       *
       * This is undesirable since we don't want to allow any of these custom attributes. This method
       * strips them all.
       */
    function (el) {
        var elAttrs = el.attributes;
        // loop backwards so that we can support removals.
        for (var i = elAttrs.length - 1; 0 < i; i--) {
            var attrib = elAttrs.item(i);
            var attrName = attrib.name;
            if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
                el.removeAttribute(attrName);
            }
        }
        var childNode = el.firstChild;
        while (childNode) {
            if (childNode.nodeType === Node.ELEMENT_NODE)
                this.stripCustomNsAttrs(childNode);
            childNode = childNode.nextSibling;
        }
    };
    return InertBodyHelper;
}());
/**
 * This helper class is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we must use one of three strategies for doing this.
 * Support: Safari 10.x -> XHR strategy
 * Support: Firefox -> DomParser strategy
 * Default: InertDocument strategy
 */
export { InertBodyHelper };
/**
 * We need to determine whether the DOMParser exists in the global context.
 * The try-catch is because, on some browsers, trying to access this property
 * on window can actually throw an error.
 *
 * @suppress {uselessCode}
 */
function isDOMParserAvailable() {
    try {
        return !!window.DOMParser;
    }
    catch (e) {
        return false;
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5lcnRfYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3Nhbml0aXphdGlvbi9pbmVydF9ib2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7Ozs7Ozs7QUFBQTtJQUlFLHlCQUFvQixVQUFvQjtRQUFwQixlQUFVLEdBQVYsVUFBVSxDQUFVO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUM3RixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7UUFFaEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7OztZQUdsQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUM5QztRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsc0RBQXNELENBQUM7UUFDekYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7WUFHdkYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FB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QWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogVGhpcyBoZWxwZXIgY2xhc3MgaXMgdXNlZCB0byBnZXQgaG9sZCBvZiBhbiBpbmVydCB0cmVlIG9mIERPTSBlbGVtZW50cyBjb250YWluaW5nIGRpcnR5IEhUTUxcbiAqIHRoYXQgbmVlZHMgc2FuaXRpemluZy5cbiAqIERlcGVuZGluZyB1cG9uIGJyb3dzZXIgc3VwcG9ydCB3ZSBtdXN0IHVzZSBvbmUgb2YgdGhyZWUgc3RyYXRlZ2llcyBmb3IgZG9pbmcgdGhpcy5cbiAqIFN1cHBvcnQ6IFNhZmFyaSAxMC54IC0+IFhIUiBzdHJhdGVneVxuICogU3VwcG9ydDogRmlyZWZveCAtPiBEb21QYXJzZXIgc3RyYXRlZ3lcbiAqIERlZmF1bHQ6IEluZXJ0RG9jdW1lbnQgc3RyYXRlZ3lcbiAqL1xuZXhwb3J0IGNsYXNzIEluZXJ0Qm9keUhlbHBlciB7XG4gIHByaXZhdGUgaW5lcnRCb2R5RWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgaW5lcnREb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWZhdWx0RG9jOiBEb2N1bWVudCkge1xuICAgIHRoaXMuaW5lcnREb2N1bWVudCA9IHRoaXMuZGVmYXVsdERvYy5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJ3Nhbml0aXphdGlvbi1pbmVydCcpO1xuICAgIHRoaXMuaW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuaW5lcnREb2N1bWVudC5ib2R5O1xuXG4gICAgaWYgKHRoaXMuaW5lcnRCb2R5RWxlbWVudCA9PSBudWxsKSB7XG4gICAgICAvLyB1c3VhbGx5IHRoZXJlIHNob3VsZCBiZSBvbmx5IG9uZSBib2R5IGVsZW1lbnQgaW4gdGhlIGRvY3VtZW50LCBidXQgSUUgZG9lc24ndCBoYXZlIGFueSwgc29cbiAgICAgIC8vIHdlIG5lZWQgdG8gY3JlYXRlIG9uZS5cbiAgICAgIGNvbnN0IGluZXJ0SHRtbCA9IHRoaXMuaW5lcnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgICB0aGlzLmluZXJ0RG9jdW1lbnQuYXBwZW5kQ2hpbGQoaW5lcnRIdG1sKTtcbiAgICAgIHRoaXMuaW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuaW5lcnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib2R5Jyk7XG4gICAgICBpbmVydEh0bWwuYXBwZW5kQ2hpbGQodGhpcy5pbmVydEJvZHlFbGVtZW50KTtcbiAgICB9XG5cbiAgICB0aGlzLmluZXJ0Qm9keUVsZW1lbnQuaW5uZXJIVE1MID0gJzxzdmc+PGcgb25sb2FkPVwidGhpcy5wYXJlbnROb2RlLnJlbW92ZSgpXCI+PC9nPjwvc3ZnPic7XG4gICAgaWYgKHRoaXMuaW5lcnRCb2R5RWxlbWVudC5xdWVyeVNlbGVjdG9yICYmICF0aGlzLmluZXJ0Qm9keUVsZW1lbnQucXVlcnlTZWxlY3Rvcignc3ZnJykpIHtcbiAgICAgIC8vIFdlIGp1c3QgaGl0IHRoZSBTYWZhcmkgMTAuMSBidWcgLSB3aGljaCBhbGxvd3MgSlMgdG8gcnVuIGluc2lkZSB0aGUgU1ZHIEcgZWxlbWVudFxuICAgICAgLy8gc28gdXNlIHRoZSBYSFIgc3RyYXRlZ3kuXG4gICAgICB0aGlzLmdldEluZXJ0Qm9keUVsZW1lbnQgPSB0aGlzLmdldEluZXJ0Qm9keUVsZW1lbnRfWEhSO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaW5lcnRCb2R5RWxlbWVudC5pbm5lckhUTUwgPVxuICAgICAgICAnPHN2Zz48cD48c3R5bGU+PGltZyBzcmM9XCI8L3N0eWxlPjxpbWcgc3JjPXggb25lcnJvcj1hbGVydCgxKS8vXCI+JztcbiAgICBpZiAodGhpcy5pbmVydEJvZHlFbGVtZW50LnF1ZXJ5U2VsZWN0b3IgJiYgdGhpcy5pbmVydEJvZHlFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N2ZyBpbWcnKSkge1xuICAgICAgLy8gV2UganVzdCBoaXQgdGhlIEZpcmVmb3ggYnVnIC0gd2hpY2ggcHJldmVudHMgdGhlIGlubmVyIGltZyBKUyBmcm9tIGJlaW5nIHNhbml0aXplZFxuICAgICAgLy8gc28gdXNlIHRoZSBET01QYXJzZXIgc3RyYXRlZ3ksIGlmIGl0IGlzIGF2YWlsYWJsZS5cbiAgICAgIC8vIElmIHRoZSBET01QYXJzZXIgaXMgbm90IGF2YWlsYWJsZSB0aGVuIHdlIGFyZSBub3QgaW4gRmlyZWZveCAoU2VydmVyL1dlYldvcmtlcj8pIHNvIHdlXG4gICAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGRlZmF1bHQgc3RyYXRlZ3kgYmVsb3cuXG4gICAgICBpZiAoaXNET01QYXJzZXJBdmFpbGFibGUoKSkge1xuICAgICAgICB0aGlzLmdldEluZXJ0Qm9keUVsZW1lbnQgPSB0aGlzLmdldEluZXJ0Qm9keUVsZW1lbnRfRE9NUGFyc2VyO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTm9uZSBvZiB0aGUgYnVncyB3ZXJlIGhpdCBzbyBpdCBpcyBzYWZlIGZvciB1cyB0byB1c2UgdGhlIGRlZmF1bHQgSW5lcnREb2N1bWVudCBzdHJhdGVneVxuICAgIHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudF9JbmVydERvY3VtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbiBpbmVydCBET00gZWxlbWVudCBjb250YWluaW5nIERPTSBjcmVhdGVkIGZyb20gdGhlIGRpcnR5IEhUTUwgc3RyaW5nIHByb3ZpZGVkLlxuICAgKiBUaGUgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBpcyBkZXRlcm1pbmVkIGluIHRoZSBjb25zdHJ1Y3Rvciwgd2hlbiB0aGUgY2xhc3MgaXMgaW5zdGFudGlhdGVkLlxuICAgKi9cbiAgZ2V0SW5lcnRCb2R5RWxlbWVudDogKGh0bWw6IHN0cmluZykgPT4gSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBVc2UgWEhSIHRvIGNyZWF0ZSBhbmQgZmlsbCBhbiBpbmVydCBib2R5IGVsZW1lbnQgKG9uIFNhZmFyaSAxMC4xKVxuICAgKiBTZWVcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2N1cmU1My9ET01QdXJpZnkvYmxvYi9hOTkyZDNhNzUwMzFjYjhiYjAzMmU1ZWE4Mzk5YmE5NzJiZGY5YTY1L3NyYy9wdXJpZnkuanMjTDQzOS1MNDQ5XG4gICAqL1xuICBwcml2YXRlIGdldEluZXJ0Qm9keUVsZW1lbnRfWEhSKGh0bWw6IHN0cmluZykge1xuICAgIC8vIFdlIGFkZCB0aGVzZSBleHRyYSBlbGVtZW50cyB0byBlbnN1cmUgdGhhdCB0aGUgcmVzdCBvZiB0aGUgY29udGVudCBpcyBwYXJzZWQgYXMgZXhwZWN0ZWRcbiAgICAvLyBlLmcuIGxlYWRpbmcgd2hpdGVzcGFjZSBpcyBtYWludGFpbmVkIGFuZCB0YWdzIGxpa2UgYDxtZXRhPmAgZG8gbm90IGdldCBob2lzdGVkIHRvIHRoZVxuICAgIC8vIGA8aGVhZD5gIHRhZy5cbiAgICBodG1sID0gJzxib2R5PjxyZW1vdmU+PC9yZW1vdmU+JyArIGh0bWwgKyAnPC9ib2R5Pic7XG4gICAgdHJ5IHtcbiAgICAgIGh0bWwgPSBlbmNvZGVVUkkoaHRtbCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSAnZG9jdW1lbnQnO1xuICAgIHhoci5vcGVuKCdHRVQnLCAnZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCwnICsgaHRtbCwgZmFsc2UpO1xuICAgIHhoci5zZW5kKG51bGwpO1xuICAgIGNvbnN0IGJvZHk6IEhUTUxCb2R5RWxlbWVudCA9IHhoci5yZXNwb25zZS5ib2R5O1xuICAgIGJvZHkucmVtb3ZlQ2hpbGQoYm9keS5maXJzdENoaWxkICEpO1xuICAgIHJldHVybiBib2R5O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSBET01QYXJzZXIgdG8gY3JlYXRlIGFuZCBmaWxsIGFuIGluZXJ0IGJvZHkgZWxlbWVudCAob24gRmlyZWZveClcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jdXJlNTMvRE9NUHVyaWZ5L3JlbGVhc2VzL3RhZy8wLjYuN1xuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbmVydEJvZHlFbGVtZW50X0RPTVBhcnNlcihodG1sOiBzdHJpbmcpIHtcbiAgICAvLyBXZSBhZGQgdGhlc2UgZXh0cmEgZWxlbWVudHMgdG8gZW5zdXJlIHRoYXQgdGhlIHJlc3Qgb2YgdGhlIGNvbnRlbnQgaXMgcGFyc2VkIGFzIGV4cGVjdGVkXG4gICAgLy8gZS5nLiBsZWFkaW5nIHdoaXRlc3BhY2UgaXMgbWFpbnRhaW5lZCBhbmQgdGFncyBsaWtlIGA8bWV0YT5gIGRvIG5vdCBnZXQgaG9pc3RlZCB0byB0aGVcbiAgICAvLyBgPGhlYWQ+YCB0YWcuXG4gICAgaHRtbCA9ICc8Ym9keT48cmVtb3ZlPjwvcmVtb3ZlPicgKyBodG1sICsgJzwvYm9keT4nO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBib2R5ID0gbmV3ICh3aW5kb3cgYXMgYW55KVxuICAgICAgICAgICAgICAgICAgICAgICAuRE9NUGFyc2VyKClcbiAgICAgICAgICAgICAgICAgICAgICAgLnBhcnNlRnJvbVN0cmluZyhodG1sLCAndGV4dC9odG1sJylcbiAgICAgICAgICAgICAgICAgICAgICAgLmJvZHkgYXMgSFRNTEJvZHlFbGVtZW50O1xuICAgICAgYm9keS5yZW1vdmVDaGlsZChib2R5LmZpcnN0Q2hpbGQgISk7XG4gICAgICByZXR1cm4gYm9keTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXNlIGFuIEhUTUw1IGB0ZW1wbGF0ZWAgZWxlbWVudCwgaWYgc3VwcG9ydGVkLCBvciBhbiBpbmVydCBib2R5IGVsZW1lbnQgY3JlYXRlZCB2aWFcbiAgICogYGNyZWF0ZUh0bWxEb2N1bWVudGAgdG8gY3JlYXRlIGFuZCBmaWxsIGFuIGluZXJ0IERPTSBlbGVtZW50LlxuICAgKiBUaGlzIGlzIHRoZSBkZWZhdWx0IHNhbmUgc3RyYXRlZ3kgdG8gdXNlIGlmIHRoZSBicm93c2VyIGRvZXMgbm90IHJlcXVpcmUgb25lIG9mIHRoZSBzcGVjaWFsaXNlZFxuICAgKiBzdHJhdGVnaWVzIGFib3ZlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbmVydEJvZHlFbGVtZW50X0luZXJ0RG9jdW1lbnQoaHRtbDogc3RyaW5nKSB7XG4gICAgLy8gUHJlZmVyIHVzaW5nIDx0ZW1wbGF0ZT4gZWxlbWVudCBpZiBzdXBwb3J0ZWQuXG4gICAgY29uc3QgdGVtcGxhdGVFbCA9IHRoaXMuaW5lcnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIGlmICgnY29udGVudCcgaW4gdGVtcGxhdGVFbCkge1xuICAgICAgdGVtcGxhdGVFbC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgcmV0dXJuIHRlbXBsYXRlRWw7XG4gICAgfVxuXG4gICAgdGhpcy5pbmVydEJvZHlFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG5cbiAgICAvLyBTdXBwb3J0OiBJRSA5LTExIG9ubHlcbiAgICAvLyBzdHJpcCBjdXN0b20tbmFtZXNwYWNlZCBhdHRyaWJ1dGVzIG9uIElFPD0xMVxuICAgIGlmICgodGhpcy5kZWZhdWx0RG9jIGFzIGFueSkuZG9jdW1lbnRNb2RlKSB7XG4gICAgICB0aGlzLnN0cmlwQ3VzdG9tTnNBdHRycyh0aGlzLmluZXJ0Qm9keUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmluZXJ0Qm9keUVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiBJRTktMTEgY29tZXMgYWNyb3NzIGFuIHVua25vd24gbmFtZXNwYWNlZCBhdHRyaWJ1dGUgZS5nLiAneGxpbms6Zm9vJyBpdCBhZGRzICd4bWxuczpuczEnXG4gICAqIGF0dHJpYnV0ZSB0byBkZWNsYXJlIG5zMSBuYW1lc3BhY2UgYW5kIHByZWZpeGVzIHRoZSBhdHRyaWJ1dGUgd2l0aCAnbnMxJyAoZS5nLlxuICAgKiAnbnMxOnhsaW5rOmZvbycpLlxuICAgKlxuICAgKiBUaGlzIGlzIHVuZGVzaXJhYmxlIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gYWxsb3cgYW55IG9mIHRoZXNlIGN1c3RvbSBhdHRyaWJ1dGVzLiBUaGlzIG1ldGhvZFxuICAgKiBzdHJpcHMgdGhlbSBhbGwuXG4gICAqL1xuICBwcml2YXRlIHN0cmlwQ3VzdG9tTnNBdHRycyhlbDogRWxlbWVudCkge1xuICAgIGNvbnN0IGVsQXR0cnMgPSBlbC5hdHRyaWJ1dGVzO1xuICAgIC8vIGxvb3AgYmFja3dhcmRzIHNvIHRoYXQgd2UgY2FuIHN1cHBvcnQgcmVtb3ZhbHMuXG4gICAgZm9yIChsZXQgaSA9IGVsQXR0cnMubGVuZ3RoIC0gMTsgMCA8IGk7IGktLSkge1xuICAgICAgY29uc3QgYXR0cmliID0gZWxBdHRycy5pdGVtKGkpO1xuICAgICAgY29uc3QgYXR0ck5hbWUgPSBhdHRyaWIubmFtZTtcbiAgICAgIGlmIChhdHRyTmFtZSA9PT0gJ3htbG5zOm5zMScgfHwgYXR0ck5hbWUuaW5kZXhPZignbnMxOicpID09PSAwKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBjaGlsZE5vZGUgPSBlbC5maXJzdENoaWxkO1xuICAgIHdoaWxlIChjaGlsZE5vZGUpIHtcbiAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB0aGlzLnN0cmlwQ3VzdG9tTnNBdHRycyhjaGlsZE5vZGUgYXMgRWxlbWVudCk7XG4gICAgICBjaGlsZE5vZGUgPSBjaGlsZE5vZGUubmV4dFNpYmxpbmc7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV2UgbmVlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgRE9NUGFyc2VyIGV4aXN0cyBpbiB0aGUgZ2xvYmFsIGNvbnRleHQuXG4gKiBUaGUgdHJ5LWNhdGNoIGlzIGJlY2F1c2UsIG9uIHNvbWUgYnJvd3NlcnMsIHRyeWluZyB0byBhY2Nlc3MgdGhpcyBwcm9wZXJ0eVxuICogb24gd2luZG93IGNhbiBhY3R1YWxseSB0aHJvdyBhbiBlcnJvci5cbiAqXG4gKiBAc3VwcHJlc3Mge3VzZWxlc3NDb2RlfVxuICovXG5mdW5jdGlvbiBpc0RPTVBhcnNlckF2YWlsYWJsZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISEod2luZG93IGFzIGFueSkuRE9NUGFyc2VyO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=