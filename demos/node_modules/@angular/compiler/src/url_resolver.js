/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/url_resolver", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Create a {@link UrlResolver} with no package prefix.
     */
    function createUrlResolverWithoutPackagePrefix() {
        return new exports.UrlResolver();
    }
    exports.createUrlResolverWithoutPackagePrefix = createUrlResolverWithoutPackagePrefix;
    function createOfflineCompileUrlResolver() {
        return new exports.UrlResolver('.');
    }
    exports.createOfflineCompileUrlResolver = createOfflineCompileUrlResolver;
    exports.UrlResolver = /** @class */ (function () {
        function UrlResolverImpl(_packagePrefix) {
            if (_packagePrefix === void 0) { _packagePrefix = null; }
            this._packagePrefix = _packagePrefix;
        }
        /**
         * Resolves the `url` given the `baseUrl`:
         * - when the `url` is null, the `baseUrl` is returned,
         * - if `url` is relative ('path/to/here', './path/to/here'), the resolved url is a combination of
         * `baseUrl` and `url`,
         * - if `url` is absolute (it has a scheme: 'http://', 'https://' or start with '/'), the `url` is
         * returned as is (ignoring the `baseUrl`)
         */
        UrlResolverImpl.prototype.resolve = function (baseUrl, url) {
            var resolvedUrl = url;
            if (baseUrl != null && baseUrl.length > 0) {
                resolvedUrl = _resolveUrl(baseUrl, resolvedUrl);
            }
            var resolvedParts = _split(resolvedUrl);
            var prefix = this._packagePrefix;
            if (prefix != null && resolvedParts != null &&
                resolvedParts[_ComponentIndex.Scheme] == 'package') {
                var path = resolvedParts[_ComponentIndex.Path];
                prefix = prefix.replace(/\/+$/, '');
                path = path.replace(/^\/+/, '');
                return prefix + "/" + path;
            }
            return resolvedUrl;
        };
        return UrlResolverImpl;
    }());
    /**
     * Extract the scheme of a URL.
     */
    function getUrlScheme(url) {
        var match = _split(url);
        return (match && match[_ComponentIndex.Scheme]) || '';
    }
    exports.getUrlScheme = getUrlScheme;
    // The code below is adapted from Traceur:
    // https://github.com/google/traceur-compiler/blob/9511c1dafa972bf0de1202a8a863bad02f0f95a8/src/runtime/url.js
    /**
     * Builds a URI string from already-encoded parts.
     *
     * No encoding is performed.  Any component may be omitted as either null or
     * undefined.
     *
     * @param opt_scheme The scheme such as 'http'.
     * @param opt_userInfo The user name before the '@'.
     * @param opt_domain The domain such as 'www.google.com', already
     *     URI-encoded.
     * @param opt_port The port number.
     * @param opt_path The path, already URI-encoded.  If it is not
     *     empty, it must begin with a slash.
     * @param opt_queryData The URI-encoded query data.
     * @param opt_fragment The URI-encoded fragment identifier.
     * @return The fully combined URI.
     */
    function _buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
        var out = [];
        if (opt_scheme != null) {
            out.push(opt_scheme + ':');
        }
        if (opt_domain != null) {
            out.push('//');
            if (opt_userInfo != null) {
                out.push(opt_userInfo + '@');
            }
            out.push(opt_domain);
            if (opt_port != null) {
                out.push(':' + opt_port);
            }
        }
        if (opt_path != null) {
            out.push(opt_path);
        }
        if (opt_queryData != null) {
            out.push('?' + opt_queryData);
        }
        if (opt_fragment != null) {
            out.push('#' + opt_fragment);
        }
        return out.join('');
    }
    /**
     * A regular expression for breaking a URI into its component parts.
     *
     * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
     * As the "first-match-wins" algorithm is identical to the "greedy"
     * disambiguation method used by POSIX regular expressions, it is natural and
     * commonplace to use a regular expression for parsing the potential five
     * components of a URI reference.
     *
     * The following line is the regular expression for breaking-down a
     * well-formed URI reference into its components.
     *
     * <pre>
     * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
     *  12            3  4          5       6  7        8 9
     * </pre>
     *
     * The numbers in the second line above are only to assist readability; they
     * indicate the reference points for each subexpression (i.e., each paired
     * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
     * For example, matching the above expression to
     * <pre>
     *     http://www.ics.uci.edu/pub/ietf/uri/#Related
     * </pre>
     * results in the following subexpression matches:
     * <pre>
     *    $1 = http:
     *    $2 = http
     *    $3 = //www.ics.uci.edu
     *    $4 = www.ics.uci.edu
     *    $5 = /pub/ietf/uri/
     *    $6 = <undefined>
     *    $7 = <undefined>
     *    $8 = #Related
     *    $9 = Related
     * </pre>
     * where <undefined> indicates that the component is not present, as is the
     * case for the query component in the above example. Therefore, we can
     * determine the value of the five components as
     * <pre>
     *    scheme    = $2
     *    authority = $4
     *    path      = $5
     *    query     = $7
     *    fragment  = $9
     * </pre>
     *
     * The regular expression has been modified slightly to expose the
     * userInfo, domain, and port separately from the authority.
     * The modified version yields
     * <pre>
     *    $1 = http              scheme
     *    $2 = <undefined>       userInfo -\
     *    $3 = www.ics.uci.edu   domain     | authority
     *    $4 = <undefined>       port     -/
     *    $5 = /pub/ietf/uri/    path
     *    $6 = <undefined>       query without ?
     *    $7 = Related           fragment without #
     * </pre>
     * @internal
     */
    var _splitRe = new RegExp('^' +
        '(?:' +
        '([^:/?#.]+)' + // scheme - ignore special characters
        // used by other URL parts such as :,
        // ?, /, #, and .
        ':)?' +
        '(?://' +
        '(?:([^/?#]*)@)?' + // userInfo
        '([\\w\\d\\-\\u0100-\\uffff.%]*)' + // domain - restrict to letters,
        // digits, dashes, dots, percent
        // escapes, and unicode characters.
        '(?::([0-9]+))?' + // port
        ')?' +
        '([^?#]+)?' + // path
        '(?:\\?([^#]*))?' + // query
        '(?:#(.*))?' + // fragment
        '$');
    /**
     * The index of each URI component in the return value of goog.uri.utils.split.
     * @enum {number}
     */
    var _ComponentIndex;
    (function (_ComponentIndex) {
        _ComponentIndex[_ComponentIndex["Scheme"] = 1] = "Scheme";
        _ComponentIndex[_ComponentIndex["UserInfo"] = 2] = "UserInfo";
        _ComponentIndex[_ComponentIndex["Domain"] = 3] = "Domain";
        _ComponentIndex[_ComponentIndex["Port"] = 4] = "Port";
        _ComponentIndex[_ComponentIndex["Path"] = 5] = "Path";
        _ComponentIndex[_ComponentIndex["QueryData"] = 6] = "QueryData";
        _ComponentIndex[_ComponentIndex["Fragment"] = 7] = "Fragment";
    })(_ComponentIndex || (_ComponentIndex = {}));
    /**
     * Splits a URI into its component parts.
     *
     * Each component can be accessed via the component indices; for example:
     * <pre>
     * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
     * </pre>
     *
     * @param uri The URI string to examine.
     * @return Each component still URI-encoded.
     *     Each component that is present will contain the encoded value, whereas
     *     components that are not present will be undefined or empty, depending
     *     on the browser's regular expression implementation.  Never null, since
     *     arbitrary strings may still look like path names.
     */
    function _split(uri) {
        return uri.match(_splitRe);
    }
    /**
      * Removes dot segments in given path component, as described in
      * RFC 3986, section 5.2.4.
      *
      * @param path A non-empty path component.
      * @return Path component with removed dot segments.
      */
    function _removeDotSegments(path) {
        if (path == '/')
            return '/';
        var leadingSlash = path[0] == '/' ? '/' : '';
        var trailingSlash = path[path.length - 1] === '/' ? '/' : '';
        var segments = path.split('/');
        var out = [];
        var up = 0;
        for (var pos = 0; pos < segments.length; pos++) {
            var segment = segments[pos];
            switch (segment) {
                case '':
                case '.':
                    break;
                case '..':
                    if (out.length > 0) {
                        out.pop();
                    }
                    else {
                        up++;
                    }
                    break;
                default:
                    out.push(segment);
            }
        }
        if (leadingSlash == '') {
            while (up-- > 0) {
                out.unshift('..');
            }
            if (out.length === 0)
                out.push('.');
        }
        return leadingSlash + out.join('/') + trailingSlash;
    }
    /**
     * Takes an array of the parts from split and canonicalizes the path part
     * and then joins all the parts.
     */
    function _joinAndCanonicalizePath(parts) {
        var path = parts[_ComponentIndex.Path];
        path = path == null ? '' : _removeDotSegments(path);
        parts[_ComponentIndex.Path] = path;
        return _buildFromEncodedParts(parts[_ComponentIndex.Scheme], parts[_ComponentIndex.UserInfo], parts[_ComponentIndex.Domain], parts[_ComponentIndex.Port], path, parts[_ComponentIndex.QueryData], parts[_ComponentIndex.Fragment]);
    }
    /**
     * Resolves a URL.
     * @param base The URL acting as the base URL.
     * @param to The URL to resolve.
     */
    function _resolveUrl(base, url) {
        var parts = _split(encodeURI(url));
        var baseParts = _split(base);
        if (parts[_ComponentIndex.Scheme] != null) {
            return _joinAndCanonicalizePath(parts);
        }
        else {
            parts[_ComponentIndex.Scheme] = baseParts[_ComponentIndex.Scheme];
        }
        for (var i = _ComponentIndex.Scheme; i <= _ComponentIndex.Port; i++) {
            if (parts[i] == null) {
                parts[i] = baseParts[i];
            }
        }
        if (parts[_ComponentIndex.Path][0] == '/') {
            return _joinAndCanonicalizePath(parts);
        }
        var path = baseParts[_ComponentIndex.Path];
        if (path == null)
            path = '/';
        var index = path.lastIndexOf('/');
        path = path.substring(0, index + 1) + parts[_ComponentIndex.Path];
        parts[_ComponentIndex.Path] = path;
        return _joinAndCanonicalizePath(parts);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3VybF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVIOztPQUVHO0lBQ0g7UUFDRSxNQUFNLENBQUMsSUFBSSxtQkFBVyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUZELHNGQUVDO0lBRUQ7UUFDRSxNQUFNLENBQUMsSUFBSSxtQkFBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFGRCwwRUFFQztJQXNCWSxRQUFBLFdBQVc7UUFDdEIseUJBQW9CLGNBQWtDO1lBQWxDLCtCQUFBLEVBQUEscUJBQWtDO1lBQWxDLG1CQUFjLEdBQWQsY0FBYyxDQUFvQjtRQUFHLENBQUM7UUFFMUQ7Ozs7Ozs7V0FPRztRQUNILGlDQUFPLEdBQVAsVUFBUSxPQUFlLEVBQUUsR0FBVztZQUNsQyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUM7WUFDdEIsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFDRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDMUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNqQyxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxJQUFJLGFBQWEsSUFBSSxJQUFJO2dCQUN2QyxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQyxNQUFNLENBQUksTUFBTSxTQUFJLElBQU0sQ0FBQztZQUM3QixDQUFDO1lBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNyQixDQUFDO1FBQ0gsc0JBQUM7SUFBRCxDQUFDLEFBM0IyQyxJQTJCMUM7SUFFRjs7T0FFRztJQUNILHNCQUE2QixHQUFXO1FBQ3RDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4RCxDQUFDO0lBSEQsb0NBR0M7SUFFRCwwQ0FBMEM7SUFDMUMsOEdBQThHO0lBRTlHOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JHO0lBQ0gsZ0NBQ0ksVUFBbUIsRUFBRSxZQUFxQixFQUFFLFVBQW1CLEVBQUUsUUFBaUIsRUFDbEYsUUFBaUIsRUFBRSxhQUFzQixFQUFFLFlBQXFCO1FBQ2xFLElBQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUV6QixFQUFFLENBQUMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN2QixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVmLEVBQUUsQ0FBQyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVyQixFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUNILENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BNERHO0lBQ0gsSUFBTSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQ3ZCLEdBQUc7UUFDSCxLQUFLO1FBQ0wsYUFBYSxHQUFJLHFDQUFxQztRQUNyQyxxQ0FBcUM7UUFDckMsaUJBQWlCO1FBQ2xDLEtBQUs7UUFDTCxPQUFPO1FBQ1AsaUJBQWlCLEdBQW9CLFdBQVc7UUFDaEQsaUNBQWlDLEdBQUksZ0NBQWdDO1FBQ2hDLGdDQUFnQztRQUNoQyxtQ0FBbUM7UUFDeEUsZ0JBQWdCLEdBQXFCLE9BQU87UUFDNUMsSUFBSTtRQUNKLFdBQVcsR0FBVSxPQUFPO1FBQzVCLGlCQUFpQixHQUFJLFFBQVE7UUFDN0IsWUFBWSxHQUFTLFdBQVc7UUFDaEMsR0FBRyxDQUFDLENBQUM7SUFFVDs7O09BR0c7SUFDSCxJQUFLLGVBUUo7SUFSRCxXQUFLLGVBQWU7UUFDbEIseURBQVUsQ0FBQTtRQUNWLDZEQUFRLENBQUE7UUFDUix5REFBTSxDQUFBO1FBQ04scURBQUksQ0FBQTtRQUNKLHFEQUFJLENBQUE7UUFDSiwrREFBUyxDQUFBO1FBQ1QsNkRBQVEsQ0FBQTtJQUNWLENBQUMsRUFSSSxlQUFlLEtBQWYsZUFBZSxRQVFuQjtJQUVEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsZ0JBQWdCLEdBQVc7UUFDekIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFHLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7Ozs7UUFNSTtJQUNKLDRCQUE0QixJQUFZO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7WUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBRTVCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQy9DLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDL0QsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVqQyxJQUFNLEdBQUcsR0FBYSxFQUFFLENBQUM7UUFDekIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDL0MsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDO2dCQUNSLEtBQUssR0FBRztvQkFDTixLQUFLLENBQUM7Z0JBQ1IsS0FBSyxJQUFJO29CQUNQLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUNaLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sRUFBRSxFQUFFLENBQUM7b0JBQ1AsQ0FBQztvQkFDRCxLQUFLLENBQUM7Z0JBQ1I7b0JBQ0UsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QixDQUFDO1FBQ0gsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hCLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO2dCQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUM7SUFDdEQsQ0FBQztJQUVEOzs7T0FHRztJQUNILGtDQUFrQyxLQUFZO1FBQzVDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFbkMsTUFBTSxDQUFDLHNCQUFzQixDQUN6QixLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFDN0YsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFDbkUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gscUJBQXFCLElBQVksRUFBRSxHQUFXO1FBQzVDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFL0IsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNwRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDckIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixDQUFDO1FBQ0gsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDN0IsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQ3JlYXRlIGEge0BsaW5rIFVybFJlc29sdmVyfSB3aXRoIG5vIHBhY2thZ2UgcHJlZml4LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVXJsUmVzb2x2ZXJXaXRob3V0UGFja2FnZVByZWZpeCgpOiBVcmxSZXNvbHZlciB7XG4gIHJldHVybiBuZXcgVXJsUmVzb2x2ZXIoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU9mZmxpbmVDb21waWxlVXJsUmVzb2x2ZXIoKTogVXJsUmVzb2x2ZXIge1xuICByZXR1cm4gbmV3IFVybFJlc29sdmVyKCcuJyk7XG59XG5cbi8qKlxuICogVXNlZCBieSB0aGUge0BsaW5rIENvbXBpbGVyfSB3aGVuIHJlc29sdmluZyBIVE1MIGFuZCBDU1MgdGVtcGxhdGUgVVJMcy5cbiAqXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgdG8gY3JlYXRlIGN1c3RvbSBiZWhhdmlvci5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBpbGVyfVxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tcGlsZXIvdHMvdXJsX3Jlc29sdmVyL3VybF9yZXNvbHZlci50cyByZWdpb249J3VybF9yZXNvbHZlcid9XG4gKlxuICogQHNlY3VyaXR5ICBXaGVuIGNvbXBpbGluZyB0ZW1wbGF0ZXMgYXQgcnVudGltZSwgeW91IG11c3RcbiAqIGVuc3VyZSB0aGF0IHRoZSBlbnRpcmUgdGVtcGxhdGUgY29tZXMgZnJvbSBhIHRydXN0ZWQgc291cmNlLlxuICogQXR0YWNrZXItY29udHJvbGxlZCBkYXRhIGludHJvZHVjZWQgYnkgYSB0ZW1wbGF0ZSBjb3VsZCBleHBvc2UgeW91clxuICogYXBwbGljYXRpb24gdG8gWFNTIHJpc2tzLiBGb3IgbW9yZSBkZXRhaWwsIHNlZSB0aGUgW1NlY3VyaXR5IEd1aWRlXShodHRwOi8vZy5jby9uZy9zZWN1cml0eSkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXJsUmVzb2x2ZXIgeyByZXNvbHZlKGJhc2VVcmw6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmc7IH1cblxuZXhwb3J0IGludGVyZmFjZSBVcmxSZXNvbHZlckN0b3IgeyBuZXcgKHBhY2thZ2VQcmVmaXg/OiBzdHJpbmd8bnVsbCk6IFVybFJlc29sdmVyOyB9XG5cbmV4cG9ydCBjb25zdCBVcmxSZXNvbHZlcjogVXJsUmVzb2x2ZXJDdG9yID0gY2xhc3MgVXJsUmVzb2x2ZXJJbXBsIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFja2FnZVByZWZpeDogc3RyaW5nfG51bGwgPSBudWxsKSB7fVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyB0aGUgYHVybGAgZ2l2ZW4gdGhlIGBiYXNlVXJsYDpcbiAgICogLSB3aGVuIHRoZSBgdXJsYCBpcyBudWxsLCB0aGUgYGJhc2VVcmxgIGlzIHJldHVybmVkLFxuICAgKiAtIGlmIGB1cmxgIGlzIHJlbGF0aXZlICgncGF0aC90by9oZXJlJywgJy4vcGF0aC90by9oZXJlJyksIHRoZSByZXNvbHZlZCB1cmwgaXMgYSBjb21iaW5hdGlvbiBvZlxuICAgKiBgYmFzZVVybGAgYW5kIGB1cmxgLFxuICAgKiAtIGlmIGB1cmxgIGlzIGFic29sdXRlIChpdCBoYXMgYSBzY2hlbWU6ICdodHRwOi8vJywgJ2h0dHBzOi8vJyBvciBzdGFydCB3aXRoICcvJyksIHRoZSBgdXJsYCBpc1xuICAgKiByZXR1cm5lZCBhcyBpcyAoaWdub3JpbmcgdGhlIGBiYXNlVXJsYClcbiAgICovXG4gIHJlc29sdmUoYmFzZVVybDogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHJlc29sdmVkVXJsID0gdXJsO1xuICAgIGlmIChiYXNlVXJsICE9IG51bGwgJiYgYmFzZVVybC5sZW5ndGggPiAwKSB7XG4gICAgICByZXNvbHZlZFVybCA9IF9yZXNvbHZlVXJsKGJhc2VVcmwsIHJlc29sdmVkVXJsKTtcbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZWRQYXJ0cyA9IF9zcGxpdChyZXNvbHZlZFVybCk7XG4gICAgbGV0IHByZWZpeCA9IHRoaXMuX3BhY2thZ2VQcmVmaXg7XG4gICAgaWYgKHByZWZpeCAhPSBudWxsICYmIHJlc29sdmVkUGFydHMgIT0gbnVsbCAmJlxuICAgICAgICByZXNvbHZlZFBhcnRzW19Db21wb25lbnRJbmRleC5TY2hlbWVdID09ICdwYWNrYWdlJykge1xuICAgICAgbGV0IHBhdGggPSByZXNvbHZlZFBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXTtcbiAgICAgIHByZWZpeCA9IHByZWZpeC5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbiAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC8rLywgJycpO1xuICAgICAgcmV0dXJuIGAke3ByZWZpeH0vJHtwYXRofWA7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZFVybDtcbiAgfVxufTtcblxuLyoqXG4gKiBFeHRyYWN0IHRoZSBzY2hlbWUgb2YgYSBVUkwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVcmxTY2hlbWUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXRjaCA9IF9zcGxpdCh1cmwpO1xuICByZXR1cm4gKG1hdGNoICYmIG1hdGNoW19Db21wb25lbnRJbmRleC5TY2hlbWVdKSB8fCAnJztcbn1cblxuLy8gVGhlIGNvZGUgYmVsb3cgaXMgYWRhcHRlZCBmcm9tIFRyYWNldXI6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvYmxvYi85NTExYzFkYWZhOTcyYmYwZGUxMjAyYThhODYzYmFkMDJmMGY5NWE4L3NyYy9ydW50aW1lL3VybC5qc1xuXG4vKipcbiAqIEJ1aWxkcyBhIFVSSSBzdHJpbmcgZnJvbSBhbHJlYWR5LWVuY29kZWQgcGFydHMuXG4gKlxuICogTm8gZW5jb2RpbmcgaXMgcGVyZm9ybWVkLiAgQW55IGNvbXBvbmVudCBtYXkgYmUgb21pdHRlZCBhcyBlaXRoZXIgbnVsbCBvclxuICogdW5kZWZpbmVkLlxuICpcbiAqIEBwYXJhbSBvcHRfc2NoZW1lIFRoZSBzY2hlbWUgc3VjaCBhcyAnaHR0cCcuXG4gKiBAcGFyYW0gb3B0X3VzZXJJbmZvIFRoZSB1c2VyIG5hbWUgYmVmb3JlIHRoZSAnQCcuXG4gKiBAcGFyYW0gb3B0X2RvbWFpbiBUaGUgZG9tYWluIHN1Y2ggYXMgJ3d3dy5nb29nbGUuY29tJywgYWxyZWFkeVxuICogICAgIFVSSS1lbmNvZGVkLlxuICogQHBhcmFtIG9wdF9wb3J0IFRoZSBwb3J0IG51bWJlci5cbiAqIEBwYXJhbSBvcHRfcGF0aCBUaGUgcGF0aCwgYWxyZWFkeSBVUkktZW5jb2RlZC4gIElmIGl0IGlzIG5vdFxuICogICAgIGVtcHR5LCBpdCBtdXN0IGJlZ2luIHdpdGggYSBzbGFzaC5cbiAqIEBwYXJhbSBvcHRfcXVlcnlEYXRhIFRoZSBVUkktZW5jb2RlZCBxdWVyeSBkYXRhLlxuICogQHBhcmFtIG9wdF9mcmFnbWVudCBUaGUgVVJJLWVuY29kZWQgZnJhZ21lbnQgaWRlbnRpZmllci5cbiAqIEByZXR1cm4gVGhlIGZ1bGx5IGNvbWJpbmVkIFVSSS5cbiAqL1xuZnVuY3Rpb24gX2J1aWxkRnJvbUVuY29kZWRQYXJ0cyhcbiAgICBvcHRfc2NoZW1lPzogc3RyaW5nLCBvcHRfdXNlckluZm8/OiBzdHJpbmcsIG9wdF9kb21haW4/OiBzdHJpbmcsIG9wdF9wb3J0Pzogc3RyaW5nLFxuICAgIG9wdF9wYXRoPzogc3RyaW5nLCBvcHRfcXVlcnlEYXRhPzogc3RyaW5nLCBvcHRfZnJhZ21lbnQ/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBvdXQ6IHN0cmluZ1tdID0gW107XG5cbiAgaWYgKG9wdF9zY2hlbWUgIT0gbnVsbCkge1xuICAgIG91dC5wdXNoKG9wdF9zY2hlbWUgKyAnOicpO1xuICB9XG5cbiAgaWYgKG9wdF9kb21haW4gIT0gbnVsbCkge1xuICAgIG91dC5wdXNoKCcvLycpO1xuXG4gICAgaWYgKG9wdF91c2VySW5mbyAhPSBudWxsKSB7XG4gICAgICBvdXQucHVzaChvcHRfdXNlckluZm8gKyAnQCcpO1xuICAgIH1cblxuICAgIG91dC5wdXNoKG9wdF9kb21haW4pO1xuXG4gICAgaWYgKG9wdF9wb3J0ICE9IG51bGwpIHtcbiAgICAgIG91dC5wdXNoKCc6JyArIG9wdF9wb3J0KTtcbiAgICB9XG4gIH1cblxuICBpZiAob3B0X3BhdGggIT0gbnVsbCkge1xuICAgIG91dC5wdXNoKG9wdF9wYXRoKTtcbiAgfVxuXG4gIGlmIChvcHRfcXVlcnlEYXRhICE9IG51bGwpIHtcbiAgICBvdXQucHVzaCgnPycgKyBvcHRfcXVlcnlEYXRhKTtcbiAgfVxuXG4gIGlmIChvcHRfZnJhZ21lbnQgIT0gbnVsbCkge1xuICAgIG91dC5wdXNoKCcjJyArIG9wdF9mcmFnbWVudCk7XG4gIH1cblxuICByZXR1cm4gb3V0LmpvaW4oJycpO1xufVxuXG4vKipcbiAqIEEgcmVndWxhciBleHByZXNzaW9uIGZvciBicmVha2luZyBhIFVSSSBpbnRvIGl0cyBjb21wb25lbnQgcGFydHMuXG4gKlxuICoge0BsaW5rIGh0dHA6Ly93d3cuZ2Jpdi5jb20vcHJvdG9jb2xzL3VyaS9yZmMvcmZjMzk4Ni5odG1sI1JGQzIyMzR9IHNheXNcbiAqIEFzIHRoZSBcImZpcnN0LW1hdGNoLXdpbnNcIiBhbGdvcml0aG0gaXMgaWRlbnRpY2FsIHRvIHRoZSBcImdyZWVkeVwiXG4gKiBkaXNhbWJpZ3VhdGlvbiBtZXRob2QgdXNlZCBieSBQT1NJWCByZWd1bGFyIGV4cHJlc3Npb25zLCBpdCBpcyBuYXR1cmFsIGFuZFxuICogY29tbW9ucGxhY2UgdG8gdXNlIGEgcmVndWxhciBleHByZXNzaW9uIGZvciBwYXJzaW5nIHRoZSBwb3RlbnRpYWwgZml2ZVxuICogY29tcG9uZW50cyBvZiBhIFVSSSByZWZlcmVuY2UuXG4gKlxuICogVGhlIGZvbGxvd2luZyBsaW5lIGlzIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIGJyZWFraW5nLWRvd24gYVxuICogd2VsbC1mb3JtZWQgVVJJIHJlZmVyZW5jZSBpbnRvIGl0cyBjb21wb25lbnRzLlxuICpcbiAqIDxwcmU+XG4gKiBeKChbXjovPyNdKyk6KT8oLy8oW14vPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/XG4gKiAgMTIgICAgICAgICAgICAzICA0ICAgICAgICAgIDUgICAgICAgNiAgNyAgICAgICAgOCA5XG4gKiA8L3ByZT5cbiAqXG4gKiBUaGUgbnVtYmVycyBpbiB0aGUgc2Vjb25kIGxpbmUgYWJvdmUgYXJlIG9ubHkgdG8gYXNzaXN0IHJlYWRhYmlsaXR5OyB0aGV5XG4gKiBpbmRpY2F0ZSB0aGUgcmVmZXJlbmNlIHBvaW50cyBmb3IgZWFjaCBzdWJleHByZXNzaW9uIChpLmUuLCBlYWNoIHBhaXJlZFxuICogcGFyZW50aGVzaXMpLiBXZSByZWZlciB0byB0aGUgdmFsdWUgbWF0Y2hlZCBmb3Igc3ViZXhwcmVzc2lvbiA8bj4gYXMgJDxuPi5cbiAqIEZvciBleGFtcGxlLCBtYXRjaGluZyB0aGUgYWJvdmUgZXhwcmVzc2lvbiB0b1xuICogPHByZT5cbiAqICAgICBodHRwOi8vd3d3Lmljcy51Y2kuZWR1L3B1Yi9pZXRmL3VyaS8jUmVsYXRlZFxuICogPC9wcmU+XG4gKiByZXN1bHRzIGluIHRoZSBmb2xsb3dpbmcgc3ViZXhwcmVzc2lvbiBtYXRjaGVzOlxuICogPHByZT5cbiAqICAgICQxID0gaHR0cDpcbiAqICAgICQyID0gaHR0cFxuICogICAgJDMgPSAvL3d3dy5pY3MudWNpLmVkdVxuICogICAgJDQgPSB3d3cuaWNzLnVjaS5lZHVcbiAqICAgICQ1ID0gL3B1Yi9pZXRmL3VyaS9cbiAqICAgICQ2ID0gPHVuZGVmaW5lZD5cbiAqICAgICQ3ID0gPHVuZGVmaW5lZD5cbiAqICAgICQ4ID0gI1JlbGF0ZWRcbiAqICAgICQ5ID0gUmVsYXRlZFxuICogPC9wcmU+XG4gKiB3aGVyZSA8dW5kZWZpbmVkPiBpbmRpY2F0ZXMgdGhhdCB0aGUgY29tcG9uZW50IGlzIG5vdCBwcmVzZW50LCBhcyBpcyB0aGVcbiAqIGNhc2UgZm9yIHRoZSBxdWVyeSBjb21wb25lbnQgaW4gdGhlIGFib3ZlIGV4YW1wbGUuIFRoZXJlZm9yZSwgd2UgY2FuXG4gKiBkZXRlcm1pbmUgdGhlIHZhbHVlIG9mIHRoZSBmaXZlIGNvbXBvbmVudHMgYXNcbiAqIDxwcmU+XG4gKiAgICBzY2hlbWUgICAgPSAkMlxuICogICAgYXV0aG9yaXR5ID0gJDRcbiAqICAgIHBhdGggICAgICA9ICQ1XG4gKiAgICBxdWVyeSAgICAgPSAkN1xuICogICAgZnJhZ21lbnQgID0gJDlcbiAqIDwvcHJlPlxuICpcbiAqIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gaGFzIGJlZW4gbW9kaWZpZWQgc2xpZ2h0bHkgdG8gZXhwb3NlIHRoZVxuICogdXNlckluZm8sIGRvbWFpbiwgYW5kIHBvcnQgc2VwYXJhdGVseSBmcm9tIHRoZSBhdXRob3JpdHkuXG4gKiBUaGUgbW9kaWZpZWQgdmVyc2lvbiB5aWVsZHNcbiAqIDxwcmU+XG4gKiAgICAkMSA9IGh0dHAgICAgICAgICAgICAgIHNjaGVtZVxuICogICAgJDIgPSA8dW5kZWZpbmVkPiAgICAgICB1c2VySW5mbyAtXFxcbiAqICAgICQzID0gd3d3Lmljcy51Y2kuZWR1ICAgZG9tYWluICAgICB8IGF1dGhvcml0eVxuICogICAgJDQgPSA8dW5kZWZpbmVkPiAgICAgICBwb3J0ICAgICAtL1xuICogICAgJDUgPSAvcHViL2lldGYvdXJpLyAgICBwYXRoXG4gKiAgICAkNiA9IDx1bmRlZmluZWQ+ICAgICAgIHF1ZXJ5IHdpdGhvdXQgP1xuICogICAgJDcgPSBSZWxhdGVkICAgICAgICAgICBmcmFnbWVudCB3aXRob3V0ICNcbiAqIDwvcHJlPlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IF9zcGxpdFJlID0gbmV3IFJlZ0V4cChcbiAgICAnXicgK1xuICAgICcoPzonICtcbiAgICAnKFteOi8/Iy5dKyknICsgIC8vIHNjaGVtZSAtIGlnbm9yZSBzcGVjaWFsIGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgICAgICAgIC8vIHVzZWQgYnkgb3RoZXIgVVJMIHBhcnRzIHN1Y2ggYXMgOixcbiAgICAgICAgICAgICAgICAgICAgIC8vID8sIC8sICMsIGFuZCAuXG4gICAgJzopPycgK1xuICAgICcoPzovLycgK1xuICAgICcoPzooW14vPyNdKilAKT8nICsgICAgICAgICAgICAgICAgICAvLyB1c2VySW5mb1xuICAgICcoW1xcXFx3XFxcXGRcXFxcLVxcXFx1MDEwMC1cXFxcdWZmZmYuJV0qKScgKyAgLy8gZG9tYWluIC0gcmVzdHJpY3QgdG8gbGV0dGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGlnaXRzLCBkYXNoZXMsIGRvdHMsIHBlcmNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNjYXBlcywgYW5kIHVuaWNvZGUgY2hhcmFjdGVycy5cbiAgICAnKD86OihbMC05XSspKT8nICsgICAgICAgICAgICAgICAgICAgLy8gcG9ydFxuICAgICcpPycgK1xuICAgICcoW14/I10rKT8nICsgICAgICAgIC8vIHBhdGhcbiAgICAnKD86XFxcXD8oW14jXSopKT8nICsgIC8vIHF1ZXJ5XG4gICAgJyg/OiMoLiopKT8nICsgICAgICAgLy8gZnJhZ21lbnRcbiAgICAnJCcpO1xuXG4vKipcbiAqIFRoZSBpbmRleCBvZiBlYWNoIFVSSSBjb21wb25lbnQgaW4gdGhlIHJldHVybiB2YWx1ZSBvZiBnb29nLnVyaS51dGlscy5zcGxpdC5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmVudW0gX0NvbXBvbmVudEluZGV4IHtcbiAgU2NoZW1lID0gMSxcbiAgVXNlckluZm8sXG4gIERvbWFpbixcbiAgUG9ydCxcbiAgUGF0aCxcbiAgUXVlcnlEYXRhLFxuICBGcmFnbWVudFxufVxuXG4vKipcbiAqIFNwbGl0cyBhIFVSSSBpbnRvIGl0cyBjb21wb25lbnQgcGFydHMuXG4gKlxuICogRWFjaCBjb21wb25lbnQgY2FuIGJlIGFjY2Vzc2VkIHZpYSB0aGUgY29tcG9uZW50IGluZGljZXM7IGZvciBleGFtcGxlOlxuICogPHByZT5cbiAqIGdvb2cudXJpLnV0aWxzLnNwbGl0KHNvbWVTdHIpW2dvb2cudXJpLnV0aWxzLkNvbXBvbnRlbnRJbmRleC5RVUVSWV9EQVRBXTtcbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB1cmkgVGhlIFVSSSBzdHJpbmcgdG8gZXhhbWluZS5cbiAqIEByZXR1cm4gRWFjaCBjb21wb25lbnQgc3RpbGwgVVJJLWVuY29kZWQuXG4gKiAgICAgRWFjaCBjb21wb25lbnQgdGhhdCBpcyBwcmVzZW50IHdpbGwgY29udGFpbiB0aGUgZW5jb2RlZCB2YWx1ZSwgd2hlcmVhc1xuICogICAgIGNvbXBvbmVudHMgdGhhdCBhcmUgbm90IHByZXNlbnQgd2lsbCBiZSB1bmRlZmluZWQgb3IgZW1wdHksIGRlcGVuZGluZ1xuICogICAgIG9uIHRoZSBicm93c2VyJ3MgcmVndWxhciBleHByZXNzaW9uIGltcGxlbWVudGF0aW9uLiAgTmV2ZXIgbnVsbCwgc2luY2VcbiAqICAgICBhcmJpdHJhcnkgc3RyaW5ncyBtYXkgc3RpbGwgbG9vayBsaWtlIHBhdGggbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIF9zcGxpdCh1cmk6IHN0cmluZyk6IEFycmF5PHN0cmluZ3xhbnk+IHtcbiAgcmV0dXJuIHVyaS5tYXRjaChfc3BsaXRSZSkgITtcbn1cblxuLyoqXG4gICogUmVtb3ZlcyBkb3Qgc2VnbWVudHMgaW4gZ2l2ZW4gcGF0aCBjb21wb25lbnQsIGFzIGRlc2NyaWJlZCBpblxuICAqIFJGQyAzOTg2LCBzZWN0aW9uIDUuMi40LlxuICAqXG4gICogQHBhcmFtIHBhdGggQSBub24tZW1wdHkgcGF0aCBjb21wb25lbnQuXG4gICogQHJldHVybiBQYXRoIGNvbXBvbmVudCB3aXRoIHJlbW92ZWQgZG90IHNlZ21lbnRzLlxuICAqL1xuZnVuY3Rpb24gX3JlbW92ZURvdFNlZ21lbnRzKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChwYXRoID09ICcvJykgcmV0dXJuICcvJztcblxuICBjb25zdCBsZWFkaW5nU2xhc2ggPSBwYXRoWzBdID09ICcvJyA/ICcvJyA6ICcnO1xuICBjb25zdCB0cmFpbGluZ1NsYXNoID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdID09PSAnLycgPyAnLycgOiAnJztcbiAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG5cbiAgY29uc3Qgb3V0OiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgdXAgPSAwO1xuICBmb3IgKGxldCBwb3MgPSAwOyBwb3MgPCBzZWdtZW50cy5sZW5ndGg7IHBvcysrKSB7XG4gICAgY29uc3Qgc2VnbWVudCA9IHNlZ21lbnRzW3Bvc107XG4gICAgc3dpdGNoIChzZWdtZW50KSB7XG4gICAgICBjYXNlICcnOlxuICAgICAgY2FzZSAnLic6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLi4nOlxuICAgICAgICBpZiAob3V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBvdXQucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXArKztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dC5wdXNoKHNlZ21lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsZWFkaW5nU2xhc2ggPT0gJycpIHtcbiAgICB3aGlsZSAodXAtLSA+IDApIHtcbiAgICAgIG91dC51bnNoaWZ0KCcuLicpO1xuICAgIH1cblxuICAgIGlmIChvdXQubGVuZ3RoID09PSAwKSBvdXQucHVzaCgnLicpO1xuICB9XG5cbiAgcmV0dXJuIGxlYWRpbmdTbGFzaCArIG91dC5qb2luKCcvJykgKyB0cmFpbGluZ1NsYXNoO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIGFycmF5IG9mIHRoZSBwYXJ0cyBmcm9tIHNwbGl0IGFuZCBjYW5vbmljYWxpemVzIHRoZSBwYXRoIHBhcnRcbiAqIGFuZCB0aGVuIGpvaW5zIGFsbCB0aGUgcGFydHMuXG4gKi9cbmZ1bmN0aW9uIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0czogYW55W10pOiBzdHJpbmcge1xuICBsZXQgcGF0aCA9IHBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXTtcbiAgcGF0aCA9IHBhdGggPT0gbnVsbCA/ICcnIDogX3JlbW92ZURvdFNlZ21lbnRzKHBhdGgpO1xuICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF0gPSBwYXRoO1xuXG4gIHJldHVybiBfYnVpbGRGcm9tRW5jb2RlZFBhcnRzKFxuICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LlNjaGVtZV0sIHBhcnRzW19Db21wb25lbnRJbmRleC5Vc2VySW5mb10sIHBhcnRzW19Db21wb25lbnRJbmRleC5Eb21haW5dLFxuICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LlBvcnRdLCBwYXRoLCBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUXVlcnlEYXRhXSxcbiAgICAgIHBhcnRzW19Db21wb25lbnRJbmRleC5GcmFnbWVudF0pO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIGEgVVJMLlxuICogQHBhcmFtIGJhc2UgVGhlIFVSTCBhY3RpbmcgYXMgdGhlIGJhc2UgVVJMLlxuICogQHBhcmFtIHRvIFRoZSBVUkwgdG8gcmVzb2x2ZS5cbiAqL1xuZnVuY3Rpb24gX3Jlc29sdmVVcmwoYmFzZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzID0gX3NwbGl0KGVuY29kZVVSSSh1cmwpKTtcbiAgY29uc3QgYmFzZVBhcnRzID0gX3NwbGl0KGJhc2UpO1xuXG4gIGlmIChwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHNbX0NvbXBvbmVudEluZGV4LlNjaGVtZV0gPSBiYXNlUGFydHNbX0NvbXBvbmVudEluZGV4LlNjaGVtZV07XG4gIH1cblxuICBmb3IgKGxldCBpID0gX0NvbXBvbmVudEluZGV4LlNjaGVtZTsgaSA8PSBfQ29tcG9uZW50SW5kZXguUG9ydDsgaSsrKSB7XG4gICAgaWYgKHBhcnRzW2ldID09IG51bGwpIHtcbiAgICAgIHBhcnRzW2ldID0gYmFzZVBhcnRzW2ldO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF1bMF0gPT0gJy8nKSB7XG4gICAgcmV0dXJuIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cblxuICBsZXQgcGF0aCA9IGJhc2VQYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF07XG4gIGlmIChwYXRoID09IG51bGwpIHBhdGggPSAnLyc7XG4gIGNvbnN0IGluZGV4ID0gcGF0aC5sYXN0SW5kZXhPZignLycpO1xuICBwYXRoID0gcGF0aC5zdWJzdHJpbmcoMCwgaW5kZXggKyAxKSArIHBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXTtcbiAgcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdID0gcGF0aDtcbiAgcmV0dXJuIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG59XG4iXX0=