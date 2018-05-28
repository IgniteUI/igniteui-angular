/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Supported http methods.
 * @deprecated use @angular/common/http instead
 */
/**
 * Supported http methods.
 * @deprecated use @angular/common/http instead
 */
export var RequestMethod;
/**
 * Supported http methods.
 * @deprecated use @angular/common/http instead
 */
(function (RequestMethod) {
    RequestMethod[RequestMethod["Get"] = 0] = "Get";
    RequestMethod[RequestMethod["Post"] = 1] = "Post";
    RequestMethod[RequestMethod["Put"] = 2] = "Put";
    RequestMethod[RequestMethod["Delete"] = 3] = "Delete";
    RequestMethod[RequestMethod["Options"] = 4] = "Options";
    RequestMethod[RequestMethod["Head"] = 5] = "Head";
    RequestMethod[RequestMethod["Patch"] = 6] = "Patch";
})(RequestMethod || (RequestMethod = {}));
/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
 * additional "CANCELLED" state.
 * @deprecated use @angular/common/http instead
 */
/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
 * additional "CANCELLED" state.
 * @deprecated use @angular/common/http instead
 */
export var ReadyState;
/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
 * additional "CANCELLED" state.
 * @deprecated use @angular/common/http instead
 */
(function (ReadyState) {
    ReadyState[ReadyState["Unsent"] = 0] = "Unsent";
    ReadyState[ReadyState["Open"] = 1] = "Open";
    ReadyState[ReadyState["HeadersReceived"] = 2] = "HeadersReceived";
    ReadyState[ReadyState["Loading"] = 3] = "Loading";
    ReadyState[ReadyState["Done"] = 4] = "Done";
    ReadyState[ReadyState["Cancelled"] = 5] = "Cancelled";
})(ReadyState || (ReadyState = {}));
/**
 * Acceptable response types to be associated with a {@link Response}, based on
 * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
 * @deprecated use @angular/common/http instead
 */
/**
 * Acceptable response types to be associated with a {@link Response}, based on
 * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
 * @deprecated use @angular/common/http instead
 */
export var ResponseType;
/**
 * Acceptable response types to be associated with a {@link Response}, based on
 * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
 * @deprecated use @angular/common/http instead
 */
(function (ResponseType) {
    ResponseType[ResponseType["Basic"] = 0] = "Basic";
    ResponseType[ResponseType["Cors"] = 1] = "Cors";
    ResponseType[ResponseType["Default"] = 2] = "Default";
    ResponseType[ResponseType["Error"] = 3] = "Error";
    ResponseType[ResponseType["Opaque"] = 4] = "Opaque";
})(ResponseType || (ResponseType = {}));
/**
 * Supported content type to be automatically associated with a {@link Request}.
 * @deprecated use @angular/common/http instead
 */
/**
 * Supported content type to be automatically associated with a {@link Request}.
 * @deprecated use @angular/common/http instead
 */
export var ContentType;
/**
 * Supported content type to be automatically associated with a {@link Request}.
 * @deprecated use @angular/common/http instead
 */
(function (ContentType) {
    ContentType[ContentType["NONE"] = 0] = "NONE";
    ContentType[ContentType["JSON"] = 1] = "JSON";
    ContentType[ContentType["FORM"] = 2] = "FORM";
    ContentType[ContentType["FORM_DATA"] = 3] = "FORM_DATA";
    ContentType[ContentType["TEXT"] = 4] = "TEXT";
    ContentType[ContentType["BLOB"] = 5] = "BLOB";
    ContentType[ContentType["ARRAY_BUFFER"] = 6] = "ARRAY_BUFFER";
})(ContentType || (ContentType = {}));
/**
 * Define which buffer to use to store the response
 * @deprecated use @angular/common/http instead
 */
/**
 * Define which buffer to use to store the response
 * @deprecated use @angular/common/http instead
 */
export var ResponseContentType;
/**
 * Define which buffer to use to store the response
 * @deprecated use @angular/common/http instead
 */
(function (ResponseContentType) {
    ResponseContentType[ResponseContentType["Text"] = 0] = "Text";
    ResponseContentType[ResponseContentType["Json"] = 1] = "Json";
    ResponseContentType[ResponseContentType["ArrayBuffer"] = 2] = "ArrayBuffer";
    ResponseContentType[ResponseContentType["Blob"] = 3] = "Blob";
})(ResponseContentType || (ResponseContentType = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9odHRwL3NyYy9lbnVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztHQU1HO0FBRUg7OztHQUdHOzs7OztBQUNILE1BQU0sQ0FBTixJQUFZLGFBUVg7Ozs7O0FBUkQsV0FBWSxhQUFhO0lBQ3ZCLCtDQUFHLENBQUE7SUFDSCxpREFBSSxDQUFBO0lBQ0osK0NBQUcsQ0FBQTtJQUNILHFEQUFNLENBQUE7SUFDTix1REFBTyxDQUFBO0lBQ1AsaURBQUksQ0FBQTtJQUNKLG1EQUFLLENBQUE7R0FQSyxhQUFhLEtBQWIsYUFBYSxRQVF4QjtBQUVEOzs7OztHQUtHOzs7Ozs7O0FBQ0gsTUFBTSxDQUFOLElBQVksVUFPWDs7Ozs7OztBQVBELFdBQVksVUFBVTtJQUNwQiwrQ0FBTSxDQUFBO0lBQ04sMkNBQUksQ0FBQTtJQUNKLGlFQUFlLENBQUE7SUFDZixpREFBTyxDQUFBO0lBQ1AsMkNBQUksQ0FBQTtJQUNKLHFEQUFTLENBQUE7R0FOQyxVQUFVLEtBQVYsVUFBVSxRQU9yQjtBQUVEOzs7O0dBSUc7Ozs7OztBQUNILE1BQU0sQ0FBTixJQUFZLFlBTVg7Ozs7OztBQU5ELFdBQVksWUFBWTtJQUN0QixpREFBSyxDQUFBO0lBQ0wsK0NBQUksQ0FBQTtJQUNKLHFEQUFPLENBQUE7SUFDUCxpREFBSyxDQUFBO0lBQ0wsbURBQU0sQ0FBQTtHQUxJLFlBQVksS0FBWixZQUFZLFFBTXZCO0FBRUQ7OztHQUdHOzs7OztBQUNILE1BQU0sQ0FBTixJQUFZLFdBUVg7Ozs7O0FBUkQsV0FBWSxXQUFXO0lBQ3JCLDZDQUFJLENBQUE7SUFDSiw2Q0FBSSxDQUFBO0lBQ0osNkNBQUksQ0FBQTtJQUNKLHVEQUFTLENBQUE7SUFDVCw2Q0FBSSxDQUFBO0lBQ0osNkNBQUksQ0FBQTtJQUNKLDZEQUFZLENBQUE7R0FQRixXQUFXLEtBQVgsV0FBVyxRQVF0QjtBQUVEOzs7R0FHRzs7Ozs7QUFDSCxNQUFNLENBQU4sSUFBWSxtQkFLWDs7Ozs7QUFMRCxXQUFZLG1CQUFtQjtJQUM3Qiw2REFBSSxDQUFBO0lBQ0osNkRBQUksQ0FBQTtJQUNKLDJFQUFXLENBQUE7SUFDWCw2REFBSSxDQUFBO0dBSk0sbUJBQW1CLEtBQW5CLG1CQUFtQixRQUs5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBTdXBwb3J0ZWQgaHR0cCBtZXRob2RzLlxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGVudW0gUmVxdWVzdE1ldGhvZCB7XG4gIEdldCxcbiAgUG9zdCxcbiAgUHV0LFxuICBEZWxldGUsXG4gIE9wdGlvbnMsXG4gIEhlYWQsXG4gIFBhdGNoXG59XG5cbi8qKlxuICogQWxsIHBvc3NpYmxlIHN0YXRlcyBpbiB3aGljaCBhIGNvbm5lY3Rpb24gY2FuIGJlLCBiYXNlZCBvblxuICogW1N0YXRlc10oaHR0cDovL3d3dy53My5vcmcvVFIvWE1MSHR0cFJlcXVlc3QvI3N0YXRlcykgZnJvbSB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBzcGVjLCBidXQgd2l0aCBhblxuICogYWRkaXRpb25hbCBcIkNBTkNFTExFRFwiIHN0YXRlLlxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGVudW0gUmVhZHlTdGF0ZSB7XG4gIFVuc2VudCxcbiAgT3BlbixcbiAgSGVhZGVyc1JlY2VpdmVkLFxuICBMb2FkaW5nLFxuICBEb25lLFxuICBDYW5jZWxsZWRcbn1cblxuLyoqXG4gKiBBY2NlcHRhYmxlIHJlc3BvbnNlIHR5cGVzIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCBhIHtAbGluayBSZXNwb25zZX0sIGJhc2VkIG9uXG4gKiBbUmVzcG9uc2VUeXBlXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jcmVzcG9uc2V0eXBlKSBmcm9tIHRoZSBGZXRjaCBzcGVjLlxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGVudW0gUmVzcG9uc2VUeXBlIHtcbiAgQmFzaWMsXG4gIENvcnMsXG4gIERlZmF1bHQsXG4gIEVycm9yLFxuICBPcGFxdWVcbn1cblxuLyoqXG4gKiBTdXBwb3J0ZWQgY29udGVudCB0eXBlIHRvIGJlIGF1dG9tYXRpY2FsbHkgYXNzb2NpYXRlZCB3aXRoIGEge0BsaW5rIFJlcXVlc3R9LlxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGVudW0gQ29udGVudFR5cGUge1xuICBOT05FLFxuICBKU09OLFxuICBGT1JNLFxuICBGT1JNX0RBVEEsXG4gIFRFWFQsXG4gIEJMT0IsXG4gIEFSUkFZX0JVRkZFUlxufVxuXG4vKipcbiAqIERlZmluZSB3aGljaCBidWZmZXIgdG8gdXNlIHRvIHN0b3JlIHRoZSByZXNwb25zZVxuICogQGRlcHJlY2F0ZWQgdXNlIEBhbmd1bGFyL2NvbW1vbi9odHRwIGluc3RlYWRcbiAqL1xuZXhwb3J0IGVudW0gUmVzcG9uc2VDb250ZW50VHlwZSB7XG4gIFRleHQsXG4gIEpzb24sXG4gIEFycmF5QnVmZmVyLFxuICBCbG9iXG59XG4iXX0=