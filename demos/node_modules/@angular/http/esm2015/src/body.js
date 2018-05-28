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
import { stringToArrayBuffer } from './http_utils';
import { URLSearchParams } from './url_search_params';
/**
 * HTTP request body used by both {\@link Request} and {\@link Response}
 * https://fetch.spec.whatwg.org/#body
 * @abstract
 */
export class Body {
    /**
     * Attempts to return body as parsed `JSON` object, or raises an exception.
     * @return {?}
     */
    json() {
        if (typeof this._body === 'string') {
            return JSON.parse(/** @type {?} */ (this._body));
        }
        if (this._body instanceof ArrayBuffer) {
            return JSON.parse(this.text());
        }
        return this._body;
    }
    /**
     * Returns the body as a string, presuming `toString()` can be called on the response body.
     *
     * When decoding an `ArrayBuffer`, the optional `encodingHint` parameter determines how the
     * bytes in the buffer will be interpreted. Valid values are:
     *
     * - `legacy` - incorrectly interpret the bytes as UTF-16 (technically, UCS-2). Only characters
     *   in the Basic Multilingual Plane are supported, surrogate pairs are not handled correctly.
     *   In addition, the endianness of the 16-bit octet pairs in the `ArrayBuffer` is not taken
     *   into consideration. This is the default behavior to avoid breaking apps, but should be
     *   considered deprecated.
     *
     * - `iso-8859` - interpret the bytes as ISO-8859 (which can be used for ASCII encoded text).
     * @param {?=} encodingHint
     * @return {?}
     */
    text(encodingHint = 'legacy') {
        if (this._body instanceof URLSearchParams) {
            return this._body.toString();
        }
        if (this._body instanceof ArrayBuffer) {
            switch (encodingHint) {
                case 'legacy':
                    return String.fromCharCode.apply(null, new Uint16Array(/** @type {?} */ (this._body)));
                case 'iso-8859':
                    return String.fromCharCode.apply(null, new Uint8Array(/** @type {?} */ (this._body)));
                default:
                    throw new Error(`Invalid value for encodingHint: ${encodingHint}`);
            }
        }
        if (this._body == null) {
            return '';
        }
        if (typeof this._body === 'object') {
            return JSON.stringify(this._body, null, 2);
        }
        return this._body.toString();
    }
    /**
     * Return the body as an ArrayBuffer
     * @return {?}
     */
    arrayBuffer() {
        if (this._body instanceof ArrayBuffer) {
            return /** @type {?} */ (this._body);
        }
        return stringToArrayBuffer(this.text());
    }
    /**
     * Returns the request's body as a Blob, assuming that body exists.
     * @return {?}
     */
    blob() {
        if (this._body instanceof Blob) {
            return /** @type {?} */ (this._body);
        }
        if (this._body instanceof ArrayBuffer) {
            return new Blob([this._body]);
        }
        throw new Error('The request body isn\'t either a blob or an array buffer');
    }
}
function Body_tsickle_Closure_declarations() {
    /**
     * \@internal
     * @type {?}
     */
    Body.prototype._body;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2h0dHAvc3JjL2JvZHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7QUFPcEQsTUFBTTs7Ozs7SUFTSixJQUFJO1FBQ0YsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFTLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQztTQUN2QztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNoQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ25COzs7Ozs7Ozs7Ozs7Ozs7OztJQWdCRCxJQUFJLENBQUMsZUFBb0MsUUFBUTtRQUMvQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDOUI7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDckIsS0FBSyxRQUFRO29CQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxXQUFXLG1CQUFDLElBQUksQ0FBQyxLQUFvQixFQUFDLENBQUMsQ0FBQztnQkFDckYsS0FBSyxVQUFVO29CQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxVQUFVLG1CQUFDLElBQUksQ0FBQyxLQUFvQixFQUFDLENBQUMsQ0FBQztnQkFDcEY7b0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUN0RTtTQUNGO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxFQUFFLENBQUM7U0FDWDtRQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDOUI7Ozs7O0lBS0QsV0FBVztRQUNULEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLG1CQUFjLElBQUksQ0FBQyxLQUFLLEVBQUM7U0FDaEM7UUFFRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDekM7Ozs7O0lBS0QsSUFBSTtRQUNGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLG1CQUFPLElBQUksQ0FBQyxLQUFLLEVBQUM7U0FDekI7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDL0I7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7S0FDN0U7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzdHJpbmdUb0FycmF5QnVmZmVyfSBmcm9tICcuL2h0dHBfdXRpbHMnO1xuaW1wb3J0IHtVUkxTZWFyY2hQYXJhbXN9IGZyb20gJy4vdXJsX3NlYXJjaF9wYXJhbXMnO1xuXG5cbi8qKlxuICogSFRUUCByZXF1ZXN0IGJvZHkgdXNlZCBieSBib3RoIHtAbGluayBSZXF1ZXN0fSBhbmQge0BsaW5rIFJlc3BvbnNlfVxuICogaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI2JvZHlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJvZHkge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwcm90ZWN0ZWQgX2JvZHk6IGFueTtcblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gcmV0dXJuIGJvZHkgYXMgcGFyc2VkIGBKU09OYCBvYmplY3QsIG9yIHJhaXNlcyBhbiBleGNlcHRpb24uXG4gICAqL1xuICBqc29uKCk6IGFueSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl9ib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoPHN0cmluZz50aGlzLl9ib2R5KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnRleHQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2JvZHk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm9keSBhcyBhIHN0cmluZywgcHJlc3VtaW5nIGB0b1N0cmluZygpYCBjYW4gYmUgY2FsbGVkIG9uIHRoZSByZXNwb25zZSBib2R5LlxuICAgKlxuICAgKiBXaGVuIGRlY29kaW5nIGFuIGBBcnJheUJ1ZmZlcmAsIHRoZSBvcHRpb25hbCBgZW5jb2RpbmdIaW50YCBwYXJhbWV0ZXIgZGV0ZXJtaW5lcyBob3cgdGhlXG4gICAqIGJ5dGVzIGluIHRoZSBidWZmZXIgd2lsbCBiZSBpbnRlcnByZXRlZC4gVmFsaWQgdmFsdWVzIGFyZTpcbiAgICpcbiAgICogLSBgbGVnYWN5YCAtIGluY29ycmVjdGx5IGludGVycHJldCB0aGUgYnl0ZXMgYXMgVVRGLTE2ICh0ZWNobmljYWxseSwgVUNTLTIpLiBPbmx5IGNoYXJhY3RlcnNcbiAgICogICBpbiB0aGUgQmFzaWMgTXVsdGlsaW5ndWFsIFBsYW5lIGFyZSBzdXBwb3J0ZWQsIHN1cnJvZ2F0ZSBwYWlycyBhcmUgbm90IGhhbmRsZWQgY29ycmVjdGx5LlxuICAgKiAgIEluIGFkZGl0aW9uLCB0aGUgZW5kaWFubmVzcyBvZiB0aGUgMTYtYml0IG9jdGV0IHBhaXJzIGluIHRoZSBgQXJyYXlCdWZmZXJgIGlzIG5vdCB0YWtlblxuICAgKiAgIGludG8gY29uc2lkZXJhdGlvbi4gVGhpcyBpcyB0aGUgZGVmYXVsdCBiZWhhdmlvciB0byBhdm9pZCBicmVha2luZyBhcHBzLCBidXQgc2hvdWxkIGJlXG4gICAqICAgY29uc2lkZXJlZCBkZXByZWNhdGVkLlxuICAgKlxuICAgKiAtIGBpc28tODg1OWAgLSBpbnRlcnByZXQgdGhlIGJ5dGVzIGFzIElTTy04ODU5ICh3aGljaCBjYW4gYmUgdXNlZCBmb3IgQVNDSUkgZW5jb2RlZCB0ZXh0KS5cbiAgICovXG4gIHRleHQoZW5jb2RpbmdIaW50OiAnbGVnYWN5J3wnaXNvLTg4NTknID0gJ2xlZ2FjeScpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYm9keS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHN3aXRjaCAoZW5jb2RpbmdIaW50KSB7XG4gICAgICAgIGNhc2UgJ2xlZ2FjeSc6XG4gICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQxNkFycmF5KHRoaXMuX2JvZHkgYXMgQXJyYXlCdWZmZXIpKTtcbiAgICAgICAgY2FzZSAnaXNvLTg4NTknOlxuICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KHRoaXMuX2JvZHkgYXMgQXJyYXlCdWZmZXIpKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmFsdWUgZm9yIGVuY29kaW5nSGludDogJHtlbmNvZGluZ0hpbnR9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2JvZHkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGhpcy5fYm9keSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLl9ib2R5LCBudWxsLCAyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fYm9keS50b1N0cmluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgYm9keSBhcyBhbiBBcnJheUJ1ZmZlclxuICAgKi9cbiAgYXJyYXlCdWZmZXIoKTogQXJyYXlCdWZmZXIge1xuICAgIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiA8QXJyYXlCdWZmZXI+dGhpcy5fYm9keTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nVG9BcnJheUJ1ZmZlcih0aGlzLnRleHQoKSk7XG4gIH1cblxuICAvKipcbiAgICAqIFJldHVybnMgdGhlIHJlcXVlc3QncyBib2R5IGFzIGEgQmxvYiwgYXNzdW1pbmcgdGhhdCBib2R5IGV4aXN0cy5cbiAgICAqL1xuICBibG9iKCk6IEJsb2Ige1xuICAgIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgcmV0dXJuIDxCbG9iPnRoaXMuX2JvZHk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgcmV0dXJuIG5ldyBCbG9iKFt0aGlzLl9ib2R5XSk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcmVxdWVzdCBib2R5IGlzblxcJ3QgZWl0aGVyIGEgYmxvYiBvciBhbiBhcnJheSBidWZmZXInKTtcbiAgfVxufVxuIl19