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
        define("@angular/compiler/src/i18n/serializers/serializer", ["require", "exports", "tslib", "@angular/compiler/src/i18n/i18n_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var Serializer = /** @class */ (function () {
        function Serializer() {
        }
        // Creates a name mapper, see `PlaceholderMapper`
        // Returning `null` means that no name mapping is used.
        Serializer.prototype.createNameMapper = function (message) { return null; };
        return Serializer;
    }());
    exports.Serializer = Serializer;
    /**
     * A simple mapper that take a function to transform an internal name to a public name
     */
    var SimplePlaceholderMapper = /** @class */ (function (_super) {
        tslib_1.__extends(SimplePlaceholderMapper, _super);
        // create a mapping from the message
        function SimplePlaceholderMapper(message, mapName) {
            var _this = _super.call(this) || this;
            _this.mapName = mapName;
            _this.internalToPublic = {};
            _this.publicToNextId = {};
            _this.publicToInternal = {};
            message.nodes.forEach(function (node) { return node.visit(_this); });
            return _this;
        }
        SimplePlaceholderMapper.prototype.toPublicName = function (internalName) {
            return this.internalToPublic.hasOwnProperty(internalName) ?
                this.internalToPublic[internalName] :
                null;
        };
        SimplePlaceholderMapper.prototype.toInternalName = function (publicName) {
            return this.publicToInternal.hasOwnProperty(publicName) ? this.publicToInternal[publicName] :
                null;
        };
        SimplePlaceholderMapper.prototype.visitText = function (text, context) { return null; };
        SimplePlaceholderMapper.prototype.visitTagPlaceholder = function (ph, context) {
            this.visitPlaceholderName(ph.startName);
            _super.prototype.visitTagPlaceholder.call(this, ph, context);
            this.visitPlaceholderName(ph.closeName);
        };
        SimplePlaceholderMapper.prototype.visitPlaceholder = function (ph, context) { this.visitPlaceholderName(ph.name); };
        SimplePlaceholderMapper.prototype.visitIcuPlaceholder = function (ph, context) {
            this.visitPlaceholderName(ph.name);
        };
        // XMB placeholders could only contains A-Z, 0-9 and _
        SimplePlaceholderMapper.prototype.visitPlaceholderName = function (internalName) {
            if (!internalName || this.internalToPublic.hasOwnProperty(internalName)) {
                return;
            }
            var publicName = this.mapName(internalName);
            if (this.publicToInternal.hasOwnProperty(publicName)) {
                // Create a new XMB when it has already been used
                var nextId = this.publicToNextId[publicName];
                this.publicToNextId[publicName] = nextId + 1;
                publicName = publicName + "_" + nextId;
            }
            else {
                this.publicToNextId[publicName] = 1;
            }
            this.internalToPublic[internalName] = publicName;
            this.publicToInternal[publicName] = internalName;
        };
        return SimplePlaceholderMapper;
    }(i18n.RecurseVisitor));
    exports.SimplePlaceholderMapper = SimplePlaceholderMapper;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9pMThuL3NlcmlhbGl6ZXJzL3NlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsMERBQW9DO0lBRXBDO1FBQUE7UUFjQSxDQUFDO1FBSEMsaURBQWlEO1FBQ2pELHVEQUF1RDtRQUN2RCxxQ0FBZ0IsR0FBaEIsVUFBaUIsT0FBcUIsSUFBNEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEYsaUJBQUM7SUFBRCxDQUFDLEFBZEQsSUFjQztJQWRxQixnQ0FBVTtJQTRCaEM7O09BRUc7SUFDSDtRQUE2QyxtREFBbUI7UUFLOUQsb0NBQW9DO1FBQ3BDLGlDQUFZLE9BQXFCLEVBQVUsT0FBaUM7WUFBNUUsWUFDRSxpQkFBTyxTQUVSO1lBSDBDLGFBQU8sR0FBUCxPQUFPLENBQTBCO1lBTHBFLHNCQUFnQixHQUEwQixFQUFFLENBQUM7WUFDN0Msb0JBQWMsR0FBMEIsRUFBRSxDQUFDO1lBQzNDLHNCQUFnQixHQUEwQixFQUFFLENBQUM7WUFLbkQsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUksQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7O1FBQ2xELENBQUM7UUFFRCw4Q0FBWSxHQUFaLFVBQWEsWUFBb0I7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQztRQUNYLENBQUM7UUFFRCxnREFBYyxHQUFkLFVBQWUsVUFBa0I7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUM7UUFDakUsQ0FBQztRQUVELDJDQUFTLEdBQVQsVUFBVSxJQUFlLEVBQUUsT0FBYSxJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRS9ELHFEQUFtQixHQUFuQixVQUFvQixFQUF1QixFQUFFLE9BQWE7WUFDeEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QyxpQkFBTSxtQkFBbUIsWUFBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsa0RBQWdCLEdBQWhCLFVBQWlCLEVBQW9CLEVBQUUsT0FBYSxJQUFTLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxHLHFEQUFtQixHQUFuQixVQUFvQixFQUF1QixFQUFFLE9BQWE7WUFDeEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsc0RBQXNEO1FBQzlDLHNEQUFvQixHQUE1QixVQUE2QixZQUFvQjtZQUMvQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEUsTUFBTSxDQUFDO1lBQ1QsQ0FBQztZQUVELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFNUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELGlEQUFpRDtnQkFDakQsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxVQUFVLEdBQU0sVUFBVSxTQUFJLE1BQVEsQ0FBQztZQUN6QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUM7WUFDakQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFlBQVksQ0FBQztRQUNuRCxDQUFDO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBeERELENBQTZDLElBQUksQ0FBQyxjQUFjLEdBd0QvRDtJQXhEWSwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vaTE4bl9hc3QnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VyaWFsaXplciB7XG4gIC8vIC0gVGhlIGBwbGFjZWhvbGRlcnNgIGFuZCBgcGxhY2Vob2xkZXJUb01lc3NhZ2VgIHByb3BlcnRpZXMgYXJlIGlycmVsZXZhbnQgaW4gdGhlIGlucHV0IG1lc3NhZ2VzXG4gIC8vIC0gVGhlIGBpZGAgY29udGFpbnMgdGhlIG1lc3NhZ2UgaWQgdGhhdCB0aGUgc2VyaWFsaXplciBpcyBleHBlY3RlZCB0byB1c2VcbiAgLy8gLSBQbGFjZWhvbGRlciBuYW1lcyBhcmUgYWxyZWFkeSBtYXAgdG8gcHVibGljIG5hbWVzIHVzaW5nIHRoZSBwcm92aWRlZCBtYXBwZXJcbiAgYWJzdHJhY3Qgd3JpdGUobWVzc2FnZXM6IGkxOG4uTWVzc2FnZVtdLCBsb2NhbGU6IHN0cmluZ3xudWxsKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IGxvYWQoY29udGVudDogc3RyaW5nLCB1cmw6IHN0cmluZyk6XG4gICAgICB7bG9jYWxlOiBzdHJpbmcgfCBudWxsLCBpMThuTm9kZXNCeU1zZ0lkOiB7W21zZ0lkOiBzdHJpbmddOiBpMThuLk5vZGVbXX19O1xuXG4gIGFic3RyYWN0IGRpZ2VzdChtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBzdHJpbmc7XG5cbiAgLy8gQ3JlYXRlcyBhIG5hbWUgbWFwcGVyLCBzZWUgYFBsYWNlaG9sZGVyTWFwcGVyYFxuICAvLyBSZXR1cm5pbmcgYG51bGxgIG1lYW5zIHRoYXQgbm8gbmFtZSBtYXBwaW5nIGlzIHVzZWQuXG4gIGNyZWF0ZU5hbWVNYXBwZXIobWVzc2FnZTogaTE4bi5NZXNzYWdlKTogUGxhY2Vob2xkZXJNYXBwZXJ8bnVsbCB7IHJldHVybiBudWxsOyB9XG59XG5cbi8qKlxuICogQSBgUGxhY2Vob2xkZXJNYXBwZXJgIGNvbnZlcnRzIHBsYWNlaG9sZGVyIG5hbWVzIGZyb20gaW50ZXJuYWwgdG8gc2VyaWFsaXplZCByZXByZXNlbnRhdGlvbiBhbmRcbiAqIGJhY2suXG4gKlxuICogSXQgc2hvdWxkIGJlIHVzZWQgZm9yIHNlcmlhbGl6YXRpb24gZm9ybWF0IHRoYXQgcHV0IGNvbnN0cmFpbnRzIG9uIHRoZSBwbGFjZWhvbGRlciBuYW1lcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQbGFjZWhvbGRlck1hcHBlciB7XG4gIHRvUHVibGljTmFtZShpbnRlcm5hbE5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsO1xuXG4gIHRvSW50ZXJuYWxOYW1lKHB1YmxpY05hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsO1xufVxuXG4vKipcbiAqIEEgc2ltcGxlIG1hcHBlciB0aGF0IHRha2UgYSBmdW5jdGlvbiB0byB0cmFuc2Zvcm0gYW4gaW50ZXJuYWwgbmFtZSB0byBhIHB1YmxpYyBuYW1lXG4gKi9cbmV4cG9ydCBjbGFzcyBTaW1wbGVQbGFjZWhvbGRlck1hcHBlciBleHRlbmRzIGkxOG4uUmVjdXJzZVZpc2l0b3IgaW1wbGVtZW50cyBQbGFjZWhvbGRlck1hcHBlciB7XG4gIHByaXZhdGUgaW50ZXJuYWxUb1B1YmxpYzoge1trOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIHByaXZhdGUgcHVibGljVG9OZXh0SWQ6IHtbazogc3RyaW5nXTogbnVtYmVyfSA9IHt9O1xuICBwcml2YXRlIHB1YmxpY1RvSW50ZXJuYWw6IHtbazogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuXG4gIC8vIGNyZWF0ZSBhIG1hcHBpbmcgZnJvbSB0aGUgbWVzc2FnZVxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBpMThuLk1lc3NhZ2UsIHByaXZhdGUgbWFwTmFtZTogKG5hbWU6IHN0cmluZykgPT4gc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICBtZXNzYWdlLm5vZGVzLmZvckVhY2gobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHRvUHVibGljTmFtZShpbnRlcm5hbE5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFRvUHVibGljLmhhc093blByb3BlcnR5KGludGVybmFsTmFtZSkgP1xuICAgICAgICB0aGlzLmludGVybmFsVG9QdWJsaWNbaW50ZXJuYWxOYW1lXSA6XG4gICAgICAgIG51bGw7XG4gIH1cblxuICB0b0ludGVybmFsTmFtZShwdWJsaWNOYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucHVibGljVG9JbnRlcm5hbC5oYXNPd25Qcm9wZXJ0eShwdWJsaWNOYW1lKSA/IHRoaXMucHVibGljVG9JbnRlcm5hbFtwdWJsaWNOYW1lXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogaTE4bi5UZXh0LCBjb250ZXh0PzogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0UGxhY2Vob2xkZXJOYW1lKHBoLnN0YXJ0TmFtZSk7XG4gICAgc3VwZXIudmlzaXRUYWdQbGFjZWhvbGRlcihwaCwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdFBsYWNlaG9sZGVyTmFtZShwaC5jbG9zZU5hbWUpO1xuICB9XG5cbiAgdmlzaXRQbGFjZWhvbGRlcihwaDogaTE4bi5QbGFjZWhvbGRlciwgY29udGV4dD86IGFueSk6IGFueSB7IHRoaXMudmlzaXRQbGFjZWhvbGRlck5hbWUocGgubmFtZSk7IH1cblxuICB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0UGxhY2Vob2xkZXJOYW1lKHBoLm5hbWUpO1xuICB9XG5cbiAgLy8gWE1CIHBsYWNlaG9sZGVycyBjb3VsZCBvbmx5IGNvbnRhaW5zIEEtWiwgMC05IGFuZCBfXG4gIHByaXZhdGUgdmlzaXRQbGFjZWhvbGRlck5hbWUoaW50ZXJuYWxOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIWludGVybmFsTmFtZSB8fCB0aGlzLmludGVybmFsVG9QdWJsaWMuaGFzT3duUHJvcGVydHkoaW50ZXJuYWxOYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwdWJsaWNOYW1lID0gdGhpcy5tYXBOYW1lKGludGVybmFsTmFtZSk7XG5cbiAgICBpZiAodGhpcy5wdWJsaWNUb0ludGVybmFsLmhhc093blByb3BlcnR5KHB1YmxpY05hbWUpKSB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgWE1CIHdoZW4gaXQgaGFzIGFscmVhZHkgYmVlbiB1c2VkXG4gICAgICBjb25zdCBuZXh0SWQgPSB0aGlzLnB1YmxpY1RvTmV4dElkW3B1YmxpY05hbWVdO1xuICAgICAgdGhpcy5wdWJsaWNUb05leHRJZFtwdWJsaWNOYW1lXSA9IG5leHRJZCArIDE7XG4gICAgICBwdWJsaWNOYW1lID0gYCR7cHVibGljTmFtZX1fJHtuZXh0SWR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdWJsaWNUb05leHRJZFtwdWJsaWNOYW1lXSA9IDE7XG4gICAgfVxuXG4gICAgdGhpcy5pbnRlcm5hbFRvUHVibGljW2ludGVybmFsTmFtZV0gPSBwdWJsaWNOYW1lO1xuICAgIHRoaXMucHVibGljVG9JbnRlcm5hbFtwdWJsaWNOYW1lXSA9IGludGVybmFsTmFtZTtcbiAgfVxufVxuIl19