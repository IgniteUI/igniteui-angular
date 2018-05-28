/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {@link Request}.
 *
 * @deprecated use @angular/common/http instead
 */
var /**
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {@link Request}.
 *
 * @deprecated use @angular/common/http instead
 */
ConnectionBackend = /** @class */ (function () {
    function ConnectionBackend() {
    }
    return ConnectionBackend;
}());
/**
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {@link Request}.
 *
 * @deprecated use @angular/common/http instead
 */
export { ConnectionBackend };
/**
 * Abstract class from which real connections are derived.
 *
 * @deprecated use @angular/common/http instead
 */
var /**
 * Abstract class from which real connections are derived.
 *
 * @deprecated use @angular/common/http instead
 */
Connection = /** @class */ (function () {
    function Connection() {
    }
    return Connection;
}());
/**
 * Abstract class from which real connections are derived.
 *
 * @deprecated use @angular/common/http instead
 */
export { Connection };
/**
 * An XSRFStrategy configures XSRF protection (e.g. via headers) on an HTTP request.
 *
 * @deprecated use @angular/common/http instead
 */
var /**
 * An XSRFStrategy configures XSRF protection (e.g. via headers) on an HTTP request.
 *
 * @deprecated use @angular/common/http instead
 */
XSRFStrategy = /** @class */ (function () {
    function XSRFStrategy() {
    }
    return XSRFStrategy;
}());
/**
 * An XSRFStrategy configures XSRF protection (e.g. via headers) on an HTTP request.
 *
 * @deprecated use @angular/common/http instead
 */
export { XSRFStrategy };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2h0dHAvc3JjL2ludGVyZmFjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBOzs7Ozs7OztBQUFBOzs7NEJBckJBO0lBcUJnRyxDQUFBOzs7Ozs7Ozs7QUFBaEcsNkJBQWdHOzs7Ozs7QUFPaEc7Ozs7O0FBQUE7OztxQkE1QkE7SUFnQ0MsQ0FBQTs7Ozs7O0FBSkQsc0JBSUM7Ozs7OztBQU9EOzs7OztBQUFBOzs7dUJBdkNBO0lBdUNxRixDQUFBOzs7Ozs7QUFBckYsd0JBQXFGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JlYWR5U3RhdGUsIFJlcXVlc3RNZXRob2QsIFJlc3BvbnNlQ29udGVudFR5cGUsIFJlc3BvbnNlVHlwZX0gZnJvbSAnLi9lbnVtcyc7XG5pbXBvcnQge0hlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge1JlcXVlc3R9IGZyb20gJy4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtVUkxTZWFyY2hQYXJhbXN9IGZyb20gJy4vdXJsX3NlYXJjaF9wYXJhbXMnO1xuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIGZyb20gd2hpY2ggcmVhbCBiYWNrZW5kcyBhcmUgZGVyaXZlZC5cbiAqXG4gKiBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIGEgYENvbm5lY3Rpb25CYWNrZW5kYCBpcyB0byBjcmVhdGUgbmV3IGNvbm5lY3Rpb25zIHRvIGZ1bGZpbGwgYSBnaXZlblxuICoge0BsaW5rIFJlcXVlc3R9LlxuICpcbiAqIEBkZXByZWNhdGVkIHVzZSBAYW5ndWxhci9jb21tb24vaHR0cCBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb25uZWN0aW9uQmFja2VuZCB7IGFic3RyYWN0IGNyZWF0ZUNvbm5lY3Rpb24ocmVxdWVzdDogYW55KTogQ29ubmVjdGlvbjsgfVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIGZyb20gd2hpY2ggcmVhbCBjb25uZWN0aW9ucyBhcmUgZGVyaXZlZC5cbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgQGFuZ3VsYXIvY29tbW9uL2h0dHAgaW5zdGVhZFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29ubmVjdGlvbiB7XG4gIHJlYWR5U3RhdGU6IFJlYWR5U3RhdGU7XG4gIHJlcXVlc3Q6IFJlcXVlc3Q7XG4gIHJlc3BvbnNlOiBhbnk7ICAvLyBUT0RPOiBnZW5lcmljIG9mIDxSZXNwb25zZT47XG59XG5cbi8qKlxuICogQW4gWFNSRlN0cmF0ZWd5IGNvbmZpZ3VyZXMgWFNSRiBwcm90ZWN0aW9uIChlLmcuIHZpYSBoZWFkZXJzKSBvbiBhbiBIVFRQIHJlcXVlc3QuXG4gKlxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFhTUkZTdHJhdGVneSB7IGFic3RyYWN0IGNvbmZpZ3VyZVJlcXVlc3QocmVxOiBSZXF1ZXN0KTogdm9pZDsgfVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3Igb3B0aW9ucyB0byBjb25zdHJ1Y3QgYSBSZXF1ZXN0T3B0aW9ucywgYmFzZWQgb25cbiAqIFtSZXF1ZXN0SW5pdF0oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3JlcXVlc3Rpbml0KSBmcm9tIHRoZSBGZXRjaCBzcGVjLlxuICpcbiAqIEBkZXByZWNhdGVkIHVzZSBAYW5ndWxhci9jb21tb24vaHR0cCBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdE9wdGlvbnNBcmdzIHtcbiAgdXJsPzogc3RyaW5nfG51bGw7XG4gIG1ldGhvZD86IHN0cmluZ3xSZXF1ZXN0TWV0aG9kfG51bGw7XG4gIC8qKiBAZGVwcmVjYXRlZCBmcm9tIDQuMC4wLiBVc2UgcGFyYW1zIGluc3RlYWQuICovXG4gIHNlYXJjaD86IHN0cmluZ3xVUkxTZWFyY2hQYXJhbXN8e1trZXk6IHN0cmluZ106IGFueSB8IGFueVtdfXxudWxsO1xuICBwYXJhbXM/OiBzdHJpbmd8VVJMU2VhcmNoUGFyYW1zfHtba2V5OiBzdHJpbmddOiBhbnkgfCBhbnlbXX18bnVsbDtcbiAgaGVhZGVycz86IEhlYWRlcnN8bnVsbDtcbiAgYm9keT86IGFueTtcbiAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbnxudWxsO1xuICByZXNwb25zZVR5cGU/OiBSZXNwb25zZUNvbnRlbnRUeXBlfG51bGw7XG59XG5cbi8qKlxuICogUmVxdWlyZWQgc3RydWN0dXJlIHdoZW4gY29uc3RydWN0aW5nIG5ldyBSZXF1ZXN0KCk7XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdEFyZ3MgZXh0ZW5kcyBSZXF1ZXN0T3B0aW9uc0FyZ3MgeyB1cmw6IHN0cmluZ3xudWxsOyB9XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBvcHRpb25zIHRvIGNvbnN0cnVjdCBhIFJlc3BvbnNlLCBiYXNlZCBvblxuICogW1Jlc3BvbnNlSW5pdF0oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3Jlc3BvbnNlaW5pdCkgZnJvbSB0aGUgRmV0Y2ggc3BlYy5cbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgQGFuZ3VsYXIvY29tbW9uL2h0dHAgaW5zdGVhZFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc3BvbnNlT3B0aW9uc0FyZ3Mge1xuICBib2R5Pzogc3RyaW5nfE9iamVjdHxGb3JtRGF0YXxBcnJheUJ1ZmZlcnxCbG9ifG51bGw7XG4gIHN0YXR1cz86IG51bWJlcnxudWxsO1xuICBzdGF0dXNUZXh0Pzogc3RyaW5nfG51bGw7XG4gIGhlYWRlcnM/OiBIZWFkZXJzfG51bGw7XG4gIHR5cGU/OiBSZXNwb25zZVR5cGV8bnVsbDtcbiAgdXJsPzogc3RyaW5nfG51bGw7XG59XG4iXX0=