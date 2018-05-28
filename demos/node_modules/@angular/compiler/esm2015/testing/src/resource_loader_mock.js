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
import { ResourceLoader } from '@angular/compiler';
/**
 * A mock implementation of {\@link ResourceLoader} that allows outgoing requests to be mocked
 * and responded to within a single test, without going to the network.
 */
export class MockResourceLoader extends ResourceLoader {
    constructor() {
        super(...arguments);
        this._expectations = [];
        this._definitions = new Map();
        this._requests = [];
    }
    /**
     * @param {?} url
     * @return {?}
     */
    get(url) {
        const /** @type {?} */ request = new _PendingRequest(url);
        this._requests.push(request);
        return request.getPromise();
    }
    /**
     * @return {?}
     */
    hasPendingRequests() { return !!this._requests.length; }
    /**
     * Add an expectation for the given URL. Incoming requests will be checked against
     * the next expectation (in FIFO order). The `verifyNoOutstandingExpectations` method
     * can be used to check if any expectations have not yet been met.
     *
     * The response given will be returned if the expectation matches.
     * @param {?} url
     * @param {?} response
     * @return {?}
     */
    expect(url, response) {
        const /** @type {?} */ expectation = new _Expectation(url, response);
        this._expectations.push(expectation);
    }
    /**
     * Add a definition for the given URL to return the given response. Unlike expectations,
     * definitions have no order and will satisfy any matching request at any time. Also
     * unlike expectations, unused definitions do not cause `verifyNoOutstandingExpectations`
     * to return an error.
     * @param {?} url
     * @param {?} response
     * @return {?}
     */
    when(url, response) { this._definitions.set(url, response); }
    /**
     * Process pending requests and verify there are no outstanding expectations. Also fails
     * if no requests are pending.
     * @return {?}
     */
    flush() {
        if (this._requests.length === 0) {
            throw new Error('No pending requests to flush');
        }
        do {
            this._processRequest(/** @type {?} */ ((this._requests.shift())));
        } while (this._requests.length > 0);
        this.verifyNoOutstandingExpectations();
    }
    /**
     * Throw an exception if any expectations have not been satisfied.
     * @return {?}
     */
    verifyNoOutstandingExpectations() {
        if (this._expectations.length === 0)
            return;
        const /** @type {?} */ urls = [];
        for (let /** @type {?} */ i = 0; i < this._expectations.length; i++) {
            const /** @type {?} */ expectation = this._expectations[i];
            urls.push(expectation.url);
        }
        throw new Error(`Unsatisfied requests: ${urls.join(', ')}`);
    }
    /**
     * @param {?} request
     * @return {?}
     */
    _processRequest(request) {
        const /** @type {?} */ url = request.url;
        if (this._expectations.length > 0) {
            const /** @type {?} */ expectation = this._expectations[0];
            if (expectation.url == url) {
                remove(this._expectations, expectation);
                request.complete(expectation.response);
                return;
            }
        }
        if (this._definitions.has(url)) {
            const /** @type {?} */ response = this._definitions.get(url);
            request.complete(response == null ? null : response);
            return;
        }
        throw new Error(`Unexpected request ${url}`);
    }
}
function MockResourceLoader_tsickle_Closure_declarations() {
    /** @type {?} */
    MockResourceLoader.prototype._expectations;
    /** @type {?} */
    MockResourceLoader.prototype._definitions;
    /** @type {?} */
    MockResourceLoader.prototype._requests;
}
class _PendingRequest {
    /**
     * @param {?} url
     */
    constructor(url) {
        this.url = url;
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
    /**
     * @param {?} response
     * @return {?}
     */
    complete(response) {
        if (response == null) {
            this.reject(`Failed to load ${this.url}`);
        }
        else {
            this.resolve(response);
        }
    }
    /**
     * @return {?}
     */
    getPromise() { return this.promise; }
}
function _PendingRequest_tsickle_Closure_declarations() {
    /** @type {?} */
    _PendingRequest.prototype.resolve;
    /** @type {?} */
    _PendingRequest.prototype.reject;
    /** @type {?} */
    _PendingRequest.prototype.promise;
    /** @type {?} */
    _PendingRequest.prototype.url;
}
class _Expectation {
    /**
     * @param {?} url
     * @param {?} response
     */
    constructor(url, response) {
        this.url = url;
        this.response = response;
    }
}
function _Expectation_tsickle_Closure_declarations() {
    /** @type {?} */
    _Expectation.prototype.url;
    /** @type {?} */
    _Expectation.prototype.response;
}
/**
 * @template T
 * @param {?} list
 * @param {?} el
 * @return {?}
 */
function remove(list, el) {
    const /** @type {?} */ index = list.indexOf(el);
    if (index > -1) {
        list.splice(index, 1);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGVyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci90ZXN0aW5nL3NyYy9yZXNvdXJjZV9sb2FkZXJfbW9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQzs7Ozs7QUFNakQsTUFBTSx5QkFBMEIsU0FBUSxjQUFjOzs7NkJBQ1osRUFBRTs0QkFDbkIsSUFBSSxHQUFHLEVBQWtCO3lCQUNULEVBQUU7Ozs7OztJQUV6QyxHQUFHLENBQUMsR0FBVztRQUNiLHVCQUFNLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzdCOzs7O0lBRUQsa0JBQWtCLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFOzs7Ozs7Ozs7OztJQVN4RCxNQUFNLENBQUMsR0FBVyxFQUFFLFFBQWdCO1FBQ2xDLHVCQUFNLFdBQVcsR0FBRyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDdEM7Ozs7Ozs7Ozs7SUFRRCxJQUFJLENBQUMsR0FBVyxFQUFFLFFBQWdCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Ozs7OztJQU03RSxLQUFLO1FBQ0gsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENB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LFVBQVUsS0FBc0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtDQUN2RDs7Ozs7Ozs7Ozs7QUFFRDs7Ozs7SUFHRSxZQUFZLEdBQVcsRUFBRSxRQUFnQjtRQUN2QyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0tBQzFCO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7QUFFRCxnQkFBbUIsSUFBUyxFQUFFLEVBQUs7SUFDakMsdUJBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0IsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3ZCO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UmVzb3VyY2VMb2FkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuLyoqXG4gKiBBIG1vY2sgaW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIFJlc291cmNlTG9hZGVyfSB0aGF0IGFsbG93cyBvdXRnb2luZyByZXF1ZXN0cyB0byBiZSBtb2NrZWRcbiAqIGFuZCByZXNwb25kZWQgdG8gd2l0aGluIGEgc2luZ2xlIHRlc3QsIHdpdGhvdXQgZ29pbmcgdG8gdGhlIG5ldHdvcmsuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrUmVzb3VyY2VMb2FkZXIgZXh0ZW5kcyBSZXNvdXJjZUxvYWRlciB7XG4gIHByaXZhdGUgX2V4cGVjdGF0aW9uczogX0V4cGVjdGF0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfZGVmaW5pdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBwcml2YXRlIF9yZXF1ZXN0czogX1BlbmRpbmdSZXF1ZXN0W10gPSBbXTtcblxuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgX1BlbmRpbmdSZXF1ZXN0KHVybCk7XG4gICAgdGhpcy5fcmVxdWVzdHMucHVzaChyZXF1ZXN0KTtcbiAgICByZXR1cm4gcmVxdWVzdC5nZXRQcm9taXNlKCk7XG4gIH1cblxuICBoYXNQZW5kaW5nUmVxdWVzdHMoKSB7IHJldHVybiAhIXRoaXMuX3JlcXVlc3RzLmxlbmd0aDsgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gZXhwZWN0YXRpb24gZm9yIHRoZSBnaXZlbiBVUkwuIEluY29taW5nIHJlcXVlc3RzIHdpbGwgYmUgY2hlY2tlZCBhZ2FpbnN0XG4gICAqIHRoZSBuZXh0IGV4cGVjdGF0aW9uIChpbiBGSUZPIG9yZGVyKS4gVGhlIGB2ZXJpZnlOb091dHN0YW5kaW5nRXhwZWN0YXRpb25zYCBtZXRob2RcbiAgICogY2FuIGJlIHVzZWQgdG8gY2hlY2sgaWYgYW55IGV4cGVjdGF0aW9ucyBoYXZlIG5vdCB5ZXQgYmVlbiBtZXQuXG4gICAqXG4gICAqIFRoZSByZXNwb25zZSBnaXZlbiB3aWxsIGJlIHJldHVybmVkIGlmIHRoZSBleHBlY3RhdGlvbiBtYXRjaGVzLlxuICAgKi9cbiAgZXhwZWN0KHVybDogc3RyaW5nLCByZXNwb25zZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZXhwZWN0YXRpb24gPSBuZXcgX0V4cGVjdGF0aW9uKHVybCwgcmVzcG9uc2UpO1xuICAgIHRoaXMuX2V4cGVjdGF0aW9ucy5wdXNoKGV4cGVjdGF0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBkZWZpbml0aW9uIGZvciB0aGUgZ2l2ZW4gVVJMIHRvIHJldHVybiB0aGUgZ2l2ZW4gcmVzcG9uc2UuIFVubGlrZSBleHBlY3RhdGlvbnMsXG4gICAqIGRlZmluaXRpb25zIGhhdmUgbm8gb3JkZXIgYW5kIHdpbGwgc2F0aXNmeSBhbnkgbWF0Y2hpbmcgcmVxdWVzdCBhdCBhbnkgdGltZS4gQWxzb1xuICAgKiB1bmxpa2UgZXhwZWN0YXRpb25zLCB1bnVzZWQgZGVmaW5pdGlvbnMgZG8gbm90IGNhdXNlIGB2ZXJpZnlOb091dHN0YW5kaW5nRXhwZWN0YXRpb25zYFxuICAgKiB0byByZXR1cm4gYW4gZXJyb3IuXG4gICAqL1xuICB3aGVuKHVybDogc3RyaW5nLCByZXNwb25zZTogc3RyaW5nKSB7IHRoaXMuX2RlZmluaXRpb25zLnNldCh1cmwsIHJlc3BvbnNlKTsgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIHBlbmRpbmcgcmVxdWVzdHMgYW5kIHZlcmlmeSB0aGVyZSBhcmUgbm8gb3V0c3RhbmRpbmcgZXhwZWN0YXRpb25zLiBBbHNvIGZhaWxzXG4gICAqIGlmIG5vIHJlcXVlc3RzIGFyZSBwZW5kaW5nLlxuICAgKi9cbiAgZmx1c2goKSB7XG4gICAgaWYgKHRoaXMuX3JlcXVlc3RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBwZW5kaW5nIHJlcXVlc3RzIHRvIGZsdXNoJyk7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAgdGhpcy5fcHJvY2Vzc1JlcXVlc3QodGhpcy5fcmVxdWVzdHMuc2hpZnQoKSAhKTtcbiAgICB9IHdoaWxlICh0aGlzLl9yZXF1ZXN0cy5sZW5ndGggPiAwKTtcblxuICAgIHRoaXMudmVyaWZ5Tm9PdXRzdGFuZGluZ0V4cGVjdGF0aW9ucygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRocm93IGFuIGV4Y2VwdGlvbiBpZiBhbnkgZXhwZWN0YXRpb25zIGhhdmUgbm90IGJlZW4gc2F0aXNmaWVkLlxuICAgKi9cbiAgdmVyaWZ5Tm9PdXRzdGFuZGluZ0V4cGVjdGF0aW9ucygpIHtcbiAgICBpZiAodGhpcy5fZXhwZWN0YXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdXJsczogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2V4cGVjdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZXhwZWN0YXRpb24gPSB0aGlzLl9leHBlY3RhdGlvbnNbaV07XG4gICAgICB1cmxzLnB1c2goZXhwZWN0YXRpb24udXJsKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc2F0aXNmaWVkIHJlcXVlc3RzOiAke3VybHMuam9pbignLCAnKX1gKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Byb2Nlc3NSZXF1ZXN0KHJlcXVlc3Q6IF9QZW5kaW5nUmVxdWVzdCkge1xuICAgIGNvbnN0IHVybCA9IHJlcXVlc3QudXJsO1xuXG4gICAgaWYgKHRoaXMuX2V4cGVjdGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBleHBlY3RhdGlvbiA9IHRoaXMuX2V4cGVjdGF0aW9uc1swXTtcbiAgICAgIGlmIChleHBlY3RhdGlvbi51cmwgPT0gdXJsKSB7XG4gICAgICAgIHJlbW92ZSh0aGlzLl9leHBlY3RhdGlvbnMsIGV4cGVjdGF0aW9uKTtcbiAgICAgICAgcmVxdWVzdC5jb21wbGV0ZShleHBlY3RhdGlvbi5yZXNwb25zZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZGVmaW5pdGlvbnMuaGFzKHVybCkpIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gdGhpcy5fZGVmaW5pdGlvbnMuZ2V0KHVybCk7XG4gICAgICByZXF1ZXN0LmNvbXBsZXRlKHJlc3BvbnNlID09IG51bGwgPyBudWxsIDogcmVzcG9uc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCByZXF1ZXN0ICR7dXJsfWApO1xuICB9XG59XG5cbmNsYXNzIF9QZW5kaW5nUmVxdWVzdCB7XG4gIHJlc29sdmU6IChyZXN1bHQ6IHN0cmluZykgPT4gdm9pZDtcbiAgcmVqZWN0OiAoZXJyb3I6IGFueSkgPT4gdm9pZDtcbiAgcHJvbWlzZTogUHJvbWlzZTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB1cmw6IHN0cmluZykge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgICAgdGhpcy5yZWplY3QgPSByZWo7XG4gICAgfSk7XG4gIH1cblxuICBjb21wbGV0ZShyZXNwb25zZTogc3RyaW5nfG51bGwpIHtcbiAgICBpZiAocmVzcG9uc2UgPT0gbnVsbCkge1xuICAgICAgdGhpcy5yZWplY3QoYEZhaWxlZCB0byBsb2FkICR7dGhpcy51cmx9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvbWlzZSgpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gdGhpcy5wcm9taXNlOyB9XG59XG5cbmNsYXNzIF9FeHBlY3RhdGlvbiB7XG4gIHVybDogc3RyaW5nO1xuICByZXNwb25zZTogc3RyaW5nO1xuICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgcmVzcG9uc2U6IHN0cmluZykge1xuICAgIHRoaXMudXJsID0gdXJsO1xuICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmU8VD4obGlzdDogVFtdLCBlbDogVCk6IHZvaWQge1xuICBjb25zdCBpbmRleCA9IGxpc3QuaW5kZXhPZihlbCk7XG4gIGlmIChpbmRleCA+IC0xKSB7XG4gICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59XG4iXX0=