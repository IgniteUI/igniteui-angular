/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Body } from './body';
import { ContentType } from './enums';
import { Headers } from './headers';
import { normalizeMethodName } from './http_utils';
import { URLSearchParams } from './url_search_params';
// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 *
 * `Request` instances are typically created by higher-level classes, like {@link Http} and
 * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
 * One such example is when creating services that wrap higher-level services, like {@link Http},
 * where it may be useful to generate a `Request` with arbitrary headers and search params.
 *
 * ```typescript
 * import {Injectable, Injector} from '@angular/core';
 * import {HTTP_PROVIDERS, Http, Request, RequestMethod} from '@angular/http';
 *
 * @Injectable()
 * class AutoAuthenticator {
 *   constructor(public http:Http) {}
 *   request(url:string) {
 *     return this.http.request(new Request({
 *       method: RequestMethod.Get,
 *       url: url,
 *       search: 'password=123'
 *     }));
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
 * var authenticator = injector.get(AutoAuthenticator);
 * authenticator.request('people.json').subscribe(res => {
 *   //URL should have included '?password=123'
 *   console.log('people', res.json());
 * });
 * ```
 *
 * @deprecated use @angular/common/http instead
 */
var 
// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 *
 * `Request` instances are typically created by higher-level classes, like {@link Http} and
 * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
 * One such example is when creating services that wrap higher-level services, like {@link Http},
 * where it may be useful to generate a `Request` with arbitrary headers and search params.
 *
 * ```typescript
 * import {Injectable, Injector} from '@angular/core';
 * import {HTTP_PROVIDERS, Http, Request, RequestMethod} from '@angular/http';
 *
 * @Injectable()
 * class AutoAuthenticator {
 *   constructor(public http:Http) {}
 *   request(url:string) {
 *     return this.http.request(new Request({
 *       method: RequestMethod.Get,
 *       url: url,
 *       search: 'password=123'
 *     }));
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
 * var authenticator = injector.get(AutoAuthenticator);
 * authenticator.request('people.json').subscribe(res => {
 *   //URL should have included '?password=123'
 *   console.log('people', res.json());
 * });
 * ```
 *
 * @deprecated use @angular/common/http instead
 */
Request = /** @class */ (function (_super) {
    tslib_1.__extends(Request, _super);
    function Request(requestOptions) {
        var _this = _super.call(this) || this;
        // TODO: assert that url is present
        var url = requestOptions.url;
        _this.url = (requestOptions.url);
        var paramsArg = requestOptions.params || requestOptions.search;
        if (paramsArg) {
            var params = void 0;
            if (typeof paramsArg === 'object' && !(paramsArg instanceof URLSearchParams)) {
                params = urlEncodeParams(paramsArg).toString();
            }
            else {
                params = paramsArg.toString();
            }
            if (params.length > 0) {
                var prefix = '?';
                if (_this.url.indexOf('?') != -1) {
                    prefix = (_this.url[_this.url.length - 1] == '&') ? '' : '&';
                }
                // TODO: just delete search-query-looking string in url?
                // TODO: just delete search-query-looking string in url?
                _this.url = url + prefix + params;
            }
        }
        _this._body = requestOptions.body;
        _this.method = normalizeMethodName((requestOptions.method));
        // TODO(jeffbcross): implement behavior
        // Defaults to 'omit', consistent with browser
        // TODO(jeffbcross): implement behavior
        // Defaults to 'omit', consistent with browser
        _this.headers = new Headers(requestOptions.headers);
        _this.contentType = _this.detectContentType();
        _this.withCredentials = (requestOptions.withCredentials);
        _this.responseType = (requestOptions.responseType);
        return _this;
    }
    /**
     * Returns the content type enum based on header options.
     */
    /**
       * Returns the content type enum based on header options.
       */
    Request.prototype.detectContentType = /**
       * Returns the content type enum based on header options.
       */
    function () {
        switch (this.headers.get('content-type')) {
            case 'application/json':
                return ContentType.JSON;
            case 'application/x-www-form-urlencoded':
                return ContentType.FORM;
            case 'multipart/form-data':
                return ContentType.FORM_DATA;
            case 'text/plain':
            case 'text/html':
                return ContentType.TEXT;
            case 'application/octet-stream':
                return this._body instanceof ArrayBuffer ? ContentType.ARRAY_BUFFER : ContentType.BLOB;
            default:
                return this.detectContentTypeFromBody();
        }
    };
    /**
     * Returns the content type of request's body based on its type.
     */
    /**
       * Returns the content type of request's body based on its type.
       */
    Request.prototype.detectContentTypeFromBody = /**
       * Returns the content type of request's body based on its type.
       */
    function () {
        if (this._body == null) {
            return ContentType.NONE;
        }
        else if (this._body instanceof URLSearchParams) {
            return ContentType.FORM;
        }
        else if (this._body instanceof FormData) {
            return ContentType.FORM_DATA;
        }
        else if (this._body instanceof Blob) {
            return ContentType.BLOB;
        }
        else if (this._body instanceof ArrayBuffer) {
            return ContentType.ARRAY_BUFFER;
        }
        else if (this._body && typeof this._body === 'object') {
            return ContentType.JSON;
        }
        else {
            return ContentType.TEXT;
        }
    };
    /**
     * Returns the request's body according to its type. If body is undefined, return
     * null.
     */
    /**
       * Returns the request's body according to its type. If body is undefined, return
       * null.
       */
    Request.prototype.getBody = /**
       * Returns the request's body according to its type. If body is undefined, return
       * null.
       */
    function () {
        switch (this.contentType) {
            case ContentType.JSON:
                return this.text();
            case ContentType.FORM:
                return this.text();
            case ContentType.FORM_DATA:
                return this._body;
            case ContentType.TEXT:
                return this.text();
            case ContentType.BLOB:
                return this.blob();
            case ContentType.ARRAY_BUFFER:
                return this.arrayBuffer();
            default:
                return null;
        }
    };
    return Request;
}(Body));
// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 *
 * `Request` instances are typically created by higher-level classes, like {@link Http} and
 * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
 * One such example is when creating services that wrap higher-level services, like {@link Http},
 * where it may be useful to generate a `Request` with arbitrary headers and search params.
 *
 * ```typescript
 * import {Injectable, Injector} from '@angular/core';
 * import {HTTP_PROVIDERS, Http, Request, RequestMethod} from '@angular/http';
 *
 * @Injectable()
 * class AutoAuthenticator {
 *   constructor(public http:Http) {}
 *   request(url:string) {
 *     return this.http.request(new Request({
 *       method: RequestMethod.Get,
 *       url: url,
 *       search: 'password=123'
 *     }));
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
 * var authenticator = injector.get(AutoAuthenticator);
 * authenticator.request('people.json').subscribe(res => {
 *   //URL should have included '?password=123'
 *   console.log('people', res.json());
 * });
 * ```
 *
 * @deprecated use @angular/common/http instead
 */
export { Request };
function urlEncodeParams(params) {
    var searchParams = new URLSearchParams();
    Object.keys(params).forEach(function (key) {
        var value = params[key];
        if (value && Array.isArray(value)) {
            value.forEach(function (element) { return searchParams.append(key, element.toString()); });
        }
        else {
            searchParams.append(key, value.toString());
        }
    });
    return searchParams;
}
var noop = function () { };
var ɵ0 = noop;
var w = typeof window == 'object' ? window : noop;
var FormData = w /** TODO #9100 */['FormData'] || noop;
var Blob = w /** TODO #9100 */['Blob'] || noop;
export var ArrayBuffer = w /** TODO #9100 */['ArrayBuffer'] || noop;
export { ɵ0 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9odHRwL3NyYy9zdGF0aWNfcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVFBLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxFQUFDLFdBQVcsRUFBcUMsTUFBTSxTQUFTLENBQUM7QUFDeEUsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFakQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJDcEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7SUFBNkIsbUNBQUk7SUFpQi9CLGlCQUFZLGNBQTJCO1FBQXZDLFlBQ0UsaUJBQU8sU0E2QlI7O1FBM0JDLElBQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUM7UUFDL0IsS0FBSSxDQUFDLEdBQUcsSUFBRyxjQUFjLENBQUMsR0FBSyxDQUFBLENBQUM7UUFDaEMsSUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDO1FBQ2pFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFJLE1BQU0sU0FBUSxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsU0FBUyxZQUFZLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNoRDtZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDL0I7WUFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDakIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxNQUFNLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztpQkFDNUQ7O2dCQUVELEFBREEsd0RBQXdEO2dCQUN4RCxLQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO2FBQ2xDO1NBQ0Y7UUFDRCxLQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUM7UUFDakMsS0FBSSxDQUFDLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxDQUFBLGNBQWMsQ0FBQyxNQUFRLENBQUEsQ0FBQyxDQUFDOzs7UUFHM0QsQUFGQSx1Q0FBdUM7UUFDdkMsOENBQThDO1FBQzlDLEtBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELEtBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDNUMsS0FBSSxDQUFDLGVBQWUsSUFBRyxjQUFjLENBQUMsZUFBaUIsQ0FBQSxDQUFDO1FBQ3hELEtBQUksQ0FBQyxZQUFZLElBQUcsY0FBYyxDQUFDLFlBQWMsQ0FBQSxDQUFDOztLQUNuRDtJQUVEOztPQUVHOzs7O0lBQ0gsbUNBQWlCOzs7SUFBakI7UUFDRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsS0FBSyxrQkFBa0I7Z0JBQ3JCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQzFCLEtBQUssbUNBQW1DO2dCQUN0QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUMxQixLQUFLLHFCQUFxQjtnQkFDeEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7WUFDL0IsS0FBSyxZQUFZLENBQUM7WUFDbEIsS0FBSyxXQUFXO2dCQUNkLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQzFCLEtBQUssMEJBQTBCO2dCQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDekY7Z0JBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1NBQzNDO0tBQ0Y7SUFFRDs7T0FFRzs7OztJQUNILDJDQUF5Qjs7O0lBQXpCO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1NBQ3pCO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztTQUN6QjtRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7U0FDOUI7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1NBQ3pCO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQztTQUNqQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1NBQ3pCO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztTQUN6QjtLQUNGO0lBRUQ7OztPQUdHOzs7OztJQUNILHlCQUFPOzs7O0lBQVA7UUFDRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN6QixLQUFLLFdBQVcsQ0FBQyxJQUFJO2dCQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JCLEtBQUssV0FBVyxDQUFDLElBQUk7Z0JBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsS0FBSyxXQUFXLENBQUMsU0FBUztnQkFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDcEIsS0FBSyxXQUFXLENBQUMsSUFBSTtnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQixLQUFLLFdBQVcsQ0FBQyxJQUFJO2dCQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JCLEtBQUssV0FBVyxDQUFDLFlBQVk7Z0JBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUI7Z0JBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQztTQUNmO0tBQ0Y7a0JBeEtIO0VBd0Q2QixJQUFJLEVBaUhoQyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWpIRCxtQkFpSEM7QUFFRCx5QkFBeUIsTUFBNEI7SUFDbkQsSUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztJQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7UUFDN0IsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQTVDLENBQTRDLENBQUMsQ0FBQztTQUN4RTtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDNUM7S0FDRixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsWUFBWSxDQUFDO0NBQ3JCO0FBRUQsSUFBTSxJQUFJLEdBQUcsZUFBYSxDQUFDOztBQUMzQixJQUFNLENBQUMsR0FBRyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3BELElBQU0sUUFBUSxHQUFJLENBQVEsQ0FBQyxpQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDbEUsSUFBTSxJQUFJLEdBQUksQ0FBUSxDQUFDLGlCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztBQUMxRCxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQ25CLENBQVEsQ0FBQyxpQkFBa0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm9keX0gZnJvbSAnLi9ib2R5JztcbmltcG9ydCB7Q29udGVudFR5cGUsIFJlcXVlc3RNZXRob2QsIFJlc3BvbnNlQ29udGVudFR5cGV9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHtIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtub3JtYWxpemVNZXRob2ROYW1lfSBmcm9tICcuL2h0dHBfdXRpbHMnO1xuaW1wb3J0IHtSZXF1ZXN0QXJnc30gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7VVJMU2VhcmNoUGFyYW1zfSBmcm9tICcuL3VybF9zZWFyY2hfcGFyYW1zJztcblxuXG4vLyBUT0RPKGplZmZiY3Jvc3MpOiBwcm9wZXJseSBpbXBsZW1lbnQgYm9keSBhY2Nlc3NvcnNcbi8qKlxuICogQ3JlYXRlcyBgUmVxdWVzdGAgaW5zdGFuY2VzIGZyb20gcHJvdmlkZWQgdmFsdWVzLlxuICpcbiAqIFRoZSBSZXF1ZXN0J3MgaW50ZXJmYWNlIGlzIGluc3BpcmVkIGJ5IHRoZSBSZXF1ZXN0IGNvbnN0cnVjdG9yIGRlZmluZWQgaW4gdGhlIFtGZXRjaFxuICogU3BlY10oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3JlcXVlc3QtY2xhc3MpLFxuICogYnV0IGlzIGNvbnNpZGVyZWQgYSBzdGF0aWMgdmFsdWUgd2hvc2UgYm9keSBjYW4gYmUgYWNjZXNzZWQgbWFueSB0aW1lcy4gVGhlcmUgYXJlIG90aGVyXG4gKiBkaWZmZXJlbmNlcyBpbiB0aGUgaW1wbGVtZW50YXRpb24sIGJ1dCB0aGlzIGlzIHRoZSBtb3N0IHNpZ25pZmljYW50LlxuICpcbiAqIGBSZXF1ZXN0YCBpbnN0YW5jZXMgYXJlIHR5cGljYWxseSBjcmVhdGVkIGJ5IGhpZ2hlci1sZXZlbCBjbGFzc2VzLCBsaWtlIHtAbGluayBIdHRwfSBhbmRcbiAqIHtAbGluayBKc29ucH0sIGJ1dCBpdCBtYXkgb2NjYXNpb25hbGx5IGJlIHVzZWZ1bCB0byBleHBsaWNpdGx5IGNyZWF0ZSBgUmVxdWVzdGAgaW5zdGFuY2VzLlxuICogT25lIHN1Y2ggZXhhbXBsZSBpcyB3aGVuIGNyZWF0aW5nIHNlcnZpY2VzIHRoYXQgd3JhcCBoaWdoZXItbGV2ZWwgc2VydmljZXMsIGxpa2Uge0BsaW5rIEh0dHB9LFxuICogd2hlcmUgaXQgbWF5IGJlIHVzZWZ1bCB0byBnZW5lcmF0ZSBhIGBSZXF1ZXN0YCB3aXRoIGFyYml0cmFyeSBoZWFkZXJzIGFuZCBzZWFyY2ggcGFyYW1zLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgSHR0cCwgUmVxdWVzdCwgUmVxdWVzdE1ldGhvZH0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgQXV0b0F1dGhlbnRpY2F0b3Ige1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgaHR0cDpIdHRwKSB7fVxuICogICByZXF1ZXN0KHVybDpzdHJpbmcpIHtcbiAqICAgICByZXR1cm4gdGhpcy5odHRwLnJlcXVlc3QobmV3IFJlcXVlc3Qoe1xuICogICAgICAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kLkdldCxcbiAqICAgICAgIHVybDogdXJsLFxuICogICAgICAgc2VhcmNoOiAncGFzc3dvcmQ9MTIzJ1xuICogICAgIH0pKTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0hUVFBfUFJPVklERVJTLCBBdXRvQXV0aGVudGljYXRvcl0pO1xuICogdmFyIGF1dGhlbnRpY2F0b3IgPSBpbmplY3Rvci5nZXQoQXV0b0F1dGhlbnRpY2F0b3IpO1xuICogYXV0aGVudGljYXRvci5yZXF1ZXN0KCdwZW9wbGUuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICogICAvL1VSTCBzaG91bGQgaGF2ZSBpbmNsdWRlZCAnP3Bhc3N3b3JkPTEyMydcbiAqICAgY29uc29sZS5sb2coJ3Blb3BsZScsIHJlcy5qc29uKCkpO1xuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgQGFuZ3VsYXIvY29tbW9uL2h0dHAgaW5zdGVhZFxuICovXG5leHBvcnQgY2xhc3MgUmVxdWVzdCBleHRlbmRzIEJvZHkge1xuICAvKipcbiAgICogSHR0cCBtZXRob2Qgd2l0aCB3aGljaCB0byBwZXJmb3JtIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kO1xuICAvKipcbiAgICoge0BsaW5rIEhlYWRlcnN9IGluc3RhbmNlXG4gICAqL1xuICBoZWFkZXJzOiBIZWFkZXJzO1xuICAvKiogVXJsIG9mIHRoZSByZW1vdGUgcmVzb3VyY2UgKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBUeXBlIG9mIHRoZSByZXF1ZXN0IGJvZHkgKiovXG4gIHByaXZhdGUgY29udGVudFR5cGU6IENvbnRlbnRUeXBlO1xuICAvKiogRW5hYmxlIHVzZSBjcmVkZW50aWFscyAqL1xuICB3aXRoQ3JlZGVudGlhbHM6IGJvb2xlYW47XG4gIC8qKiBCdWZmZXIgdG8gc3RvcmUgdGhlIHJlc3BvbnNlICovXG4gIHJlc3BvbnNlVHlwZTogUmVzcG9uc2VDb250ZW50VHlwZTtcbiAgY29uc3RydWN0b3IocmVxdWVzdE9wdGlvbnM6IFJlcXVlc3RBcmdzKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvLyBUT0RPOiBhc3NlcnQgdGhhdCB1cmwgaXMgcHJlc2VudFxuICAgIGNvbnN0IHVybCA9IHJlcXVlc3RPcHRpb25zLnVybDtcbiAgICB0aGlzLnVybCA9IHJlcXVlc3RPcHRpb25zLnVybCAhO1xuICAgIGNvbnN0IHBhcmFtc0FyZyA9IHJlcXVlc3RPcHRpb25zLnBhcmFtcyB8fCByZXF1ZXN0T3B0aW9ucy5zZWFyY2g7XG4gICAgaWYgKHBhcmFtc0FyZykge1xuICAgICAgbGV0IHBhcmFtczogc3RyaW5nO1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbXNBcmcgPT09ICdvYmplY3QnICYmICEocGFyYW1zQXJnIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zKSkge1xuICAgICAgICBwYXJhbXMgPSB1cmxFbmNvZGVQYXJhbXMocGFyYW1zQXJnKS50b1N0cmluZygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyYW1zID0gcGFyYW1zQXJnLnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IHByZWZpeCA9ICc/JztcbiAgICAgICAgaWYgKHRoaXMudXJsLmluZGV4T2YoJz8nKSAhPSAtMSkge1xuICAgICAgICAgIHByZWZpeCA9ICh0aGlzLnVybFt0aGlzLnVybC5sZW5ndGggLSAxXSA9PSAnJicpID8gJycgOiAnJic7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzoganVzdCBkZWxldGUgc2VhcmNoLXF1ZXJ5LWxvb2tpbmcgc3RyaW5nIGluIHVybD9cbiAgICAgICAgdGhpcy51cmwgPSB1cmwgKyBwcmVmaXggKyBwYXJhbXM7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2JvZHkgPSByZXF1ZXN0T3B0aW9ucy5ib2R5O1xuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kTmFtZShyZXF1ZXN0T3B0aW9ucy5tZXRob2QgISk7XG4gICAgLy8gVE9ETyhqZWZmYmNyb3NzKTogaW1wbGVtZW50IGJlaGF2aW9yXG4gICAgLy8gRGVmYXVsdHMgdG8gJ29taXQnLCBjb25zaXN0ZW50IHdpdGggYnJvd3NlclxuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKHJlcXVlc3RPcHRpb25zLmhlYWRlcnMpO1xuICAgIHRoaXMuY29udGVudFR5cGUgPSB0aGlzLmRldGVjdENvbnRlbnRUeXBlKCk7XG4gICAgdGhpcy53aXRoQ3JlZGVudGlhbHMgPSByZXF1ZXN0T3B0aW9ucy53aXRoQ3JlZGVudGlhbHMgITtcbiAgICB0aGlzLnJlc3BvbnNlVHlwZSA9IHJlcXVlc3RPcHRpb25zLnJlc3BvbnNlVHlwZSAhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbnRlbnQgdHlwZSBlbnVtIGJhc2VkIG9uIGhlYWRlciBvcHRpb25zLlxuICAgKi9cbiAgZGV0ZWN0Q29udGVudFR5cGUoKTogQ29udGVudFR5cGUge1xuICAgIHN3aXRjaCAodGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgIGNhc2UgJ2FwcGxpY2F0aW9uL2pzb24nOlxuICAgICAgICByZXR1cm4gQ29udGVudFR5cGUuSlNPTjtcbiAgICAgIGNhc2UgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6XG4gICAgICAgIHJldHVybiBDb250ZW50VHlwZS5GT1JNO1xuICAgICAgY2FzZSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YSc6XG4gICAgICAgIHJldHVybiBDb250ZW50VHlwZS5GT1JNX0RBVEE7XG4gICAgICBjYXNlICd0ZXh0L3BsYWluJzpcbiAgICAgIGNhc2UgJ3RleHQvaHRtbCc6XG4gICAgICAgIHJldHVybiBDb250ZW50VHlwZS5URVhUO1xuICAgICAgY2FzZSAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA/IENvbnRlbnRUeXBlLkFSUkFZX0JVRkZFUiA6IENvbnRlbnRUeXBlLkJMT0I7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdGhpcy5kZXRlY3RDb250ZW50VHlwZUZyb21Cb2R5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbnRlbnQgdHlwZSBvZiByZXF1ZXN0J3MgYm9keSBiYXNlZCBvbiBpdHMgdHlwZS5cbiAgICovXG4gIGRldGVjdENvbnRlbnRUeXBlRnJvbUJvZHkoKTogQ29udGVudFR5cGUge1xuICAgIGlmICh0aGlzLl9ib2R5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5OT05FO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keSBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcykge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLkZPUk07XG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgRm9ybURhdGEpIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5GT1JNX0RBVEE7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLkJMT0I7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5BUlJBWV9CVUZGRVI7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5ICYmIHR5cGVvZiB0aGlzLl9ib2R5ID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIENvbnRlbnRUeXBlLkpTT047XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBDb250ZW50VHlwZS5URVhUO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXF1ZXN0J3MgYm9keSBhY2NvcmRpbmcgdG8gaXRzIHR5cGUuIElmIGJvZHkgaXMgdW5kZWZpbmVkLCByZXR1cm5cbiAgICogbnVsbC5cbiAgICovXG4gIGdldEJvZHkoKTogYW55IHtcbiAgICBzd2l0Y2ggKHRoaXMuY29udGVudFR5cGUpIHtcbiAgICAgIGNhc2UgQ29udGVudFR5cGUuSlNPTjpcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpO1xuICAgICAgY2FzZSBDb250ZW50VHlwZS5GT1JNOlxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCk7XG4gICAgICBjYXNlIENvbnRlbnRUeXBlLkZPUk1fREFUQTpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvZHk7XG4gICAgICBjYXNlIENvbnRlbnRUeXBlLlRFWFQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKTtcbiAgICAgIGNhc2UgQ29udGVudFR5cGUuQkxPQjpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpO1xuICAgICAgY2FzZSBDb250ZW50VHlwZS5BUlJBWV9CVUZGRVI6XG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdXJsRW5jb2RlUGFyYW1zKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBVUkxTZWFyY2hQYXJhbXMge1xuICBjb25zdCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zW2tleV07XG4gICAgaWYgKHZhbHVlICYmIEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YWx1ZS5mb3JFYWNoKGVsZW1lbnQgPT4gc2VhcmNoUGFyYW1zLmFwcGVuZChrZXksIGVsZW1lbnQudG9TdHJpbmcoKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWFyY2hQYXJhbXMuYXBwZW5kKGtleSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHNlYXJjaFBhcmFtcztcbn1cblxuY29uc3Qgbm9vcCA9IGZ1bmN0aW9uKCkge307XG5jb25zdCB3ID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyA/IHdpbmRvdyA6IG5vb3A7XG5jb25zdCBGb3JtRGF0YSA9ICh3IGFzIGFueSAvKiogVE9ETyAjOTEwMCAqLylbJ0Zvcm1EYXRhJ10gfHwgbm9vcDtcbmNvbnN0IEJsb2IgPSAodyBhcyBhbnkgLyoqIFRPRE8gIzkxMDAgKi8pWydCbG9iJ10gfHwgbm9vcDtcbmV4cG9ydCBjb25zdCBBcnJheUJ1ZmZlcjogQXJyYXlCdWZmZXJDb25zdHJ1Y3RvciA9XG4gICAgKHcgYXMgYW55IC8qKiBUT0RPICM5MTAwICovKVsnQXJyYXlCdWZmZXInXSB8fCBub29wO1xuIl19