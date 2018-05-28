/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { PipeResolver } from '@angular/compiler';
var MockPipeResolver = /** @class */ (function (_super) {
    tslib_1.__extends(MockPipeResolver, _super);
    function MockPipeResolver(refector) {
        var _this = _super.call(this, refector) || this;
        _this._pipes = new Map();
        return _this;
    }
    /**
     * Overrides the {@link Pipe} for a pipe.
     */
    /**
       * Overrides the {@link Pipe} for a pipe.
       */
    MockPipeResolver.prototype.setPipe = /**
       * Overrides the {@link Pipe} for a pipe.
       */
    function (type, metadata) { this._pipes.set(type, metadata); };
    /**
     * Returns the {@link Pipe} for a pipe:
     * - Set the {@link Pipe} to the overridden view when it exists or fallback to the
     * default
     * `PipeResolver`, see `setPipe`.
     */
    /**
       * Returns the {@link Pipe} for a pipe:
       * - Set the {@link Pipe} to the overridden view when it exists or fallback to the
       * default
       * `PipeResolver`, see `setPipe`.
       */
    MockPipeResolver.prototype.resolve = /**
       * Returns the {@link Pipe} for a pipe:
       * - Set the {@link Pipe} to the overridden view when it exists or fallback to the
       * default
       * `PipeResolver`, see `setPipe`.
       */
    function (type, throwIfNotFound) {
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        var metadata = this._pipes.get(type);
        if (!metadata) {
            metadata = (_super.prototype.resolve.call(this, type, throwIfNotFound));
        }
        return metadata;
    };
    return MockPipeResolver;
}(PipeResolver));
export { MockPipeResolver };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlcl9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvdGVzdGluZy9zcmMvcGlwZV9yZXNvbHZlcl9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFtQixZQUFZLEVBQU8sTUFBTSxtQkFBbUIsQ0FBQztBQUV2RSxJQUFBO0lBQXNDLDRDQUFZO0lBR2hELDBCQUFZLFFBQTBCO1FBQXRDLFlBQTBDLGtCQUFNLFFBQVEsQ0FBQyxTQUFHO3VCQUYzQyxJQUFJLEdBQUcsRUFBd0I7O0tBRVk7SUFFNUQ7O09BRUc7Ozs7SUFDSCxrQ0FBTzs7O0lBQVAsVUFBUSxJQUFlLEVBQUUsUUFBbUIsSUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtJQUV4Rjs7Ozs7T0FLRzs7Ozs7OztJQUNILGtDQUFPOzs7Ozs7SUFBUCxVQUFRLElBQWUsRUFBRSxlQUFzQjtRQUF0QixnQ0FBQSxFQUFBLHNCQUFzQjtRQUM3QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDZCxRQUFRLElBQUcsaUJBQU0sT0FBTyxZQUFDLElBQUksRUFBRSxlQUFlLENBQUcsQ0FBQSxDQUFDO1NBQ25EO1FBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztLQUNqQjsyQkFoQ0g7RUFVc0MsWUFBWSxFQXVCakQsQ0FBQTtBQXZCRCw0QkF1QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZVJlZmxlY3RvciwgUGlwZVJlc29sdmVyLCBjb3JlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmV4cG9ydCBjbGFzcyBNb2NrUGlwZVJlc29sdmVyIGV4dGVuZHMgUGlwZVJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfcGlwZXMgPSBuZXcgTWFwPGNvcmUuVHlwZSwgY29yZS5QaXBlPigpO1xuXG4gIGNvbnN0cnVjdG9yKHJlZmVjdG9yOiBDb21waWxlUmVmbGVjdG9yKSB7IHN1cGVyKHJlZmVjdG9yKTsgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIHtAbGluayBQaXBlfSBmb3IgYSBwaXBlLlxuICAgKi9cbiAgc2V0UGlwZSh0eXBlOiBjb3JlLlR5cGUsIG1ldGFkYXRhOiBjb3JlLlBpcGUpOiB2b2lkIHsgdGhpcy5fcGlwZXMuc2V0KHR5cGUsIG1ldGFkYXRhKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgUGlwZX0gZm9yIGEgcGlwZTpcbiAgICogLSBTZXQgdGhlIHtAbGluayBQaXBlfSB0byB0aGUgb3ZlcnJpZGRlbiB2aWV3IHdoZW4gaXQgZXhpc3RzIG9yIGZhbGxiYWNrIHRvIHRoZVxuICAgKiBkZWZhdWx0XG4gICAqIGBQaXBlUmVzb2x2ZXJgLCBzZWUgYHNldFBpcGVgLlxuICAgKi9cbiAgcmVzb2x2ZSh0eXBlOiBjb3JlLlR5cGUsIHRocm93SWZOb3RGb3VuZCA9IHRydWUpOiBjb3JlLlBpcGUge1xuICAgIGxldCBtZXRhZGF0YSA9IHRoaXMuX3BpcGVzLmdldCh0eXBlKTtcbiAgICBpZiAoIW1ldGFkYXRhKSB7XG4gICAgICBtZXRhZGF0YSA9IHN1cGVyLnJlc29sdmUodHlwZSwgdGhyb3dJZk5vdEZvdW5kKSAhO1xuICAgIH1cbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH1cbn1cbiJdfQ==