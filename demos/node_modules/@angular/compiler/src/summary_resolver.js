(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/summary_resolver", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SummaryResolver = /** @class */ (function () {
        function SummaryResolver() {
        }
        return SummaryResolver;
    }());
    exports.SummaryResolver = SummaryResolver;
    var JitSummaryResolver = /** @class */ (function () {
        function JitSummaryResolver() {
            this._summaries = new Map();
        }
        JitSummaryResolver.prototype.isLibraryFile = function () { return false; };
        JitSummaryResolver.prototype.toSummaryFileName = function (fileName) { return fileName; };
        JitSummaryResolver.prototype.fromSummaryFileName = function (fileName) { return fileName; };
        JitSummaryResolver.prototype.resolveSummary = function (reference) {
            return this._summaries.get(reference) || null;
        };
        JitSummaryResolver.prototype.getSymbolsOf = function () { return []; };
        JitSummaryResolver.prototype.getImportAs = function (reference) { return reference; };
        JitSummaryResolver.prototype.getKnownModuleName = function (fileName) { return null; };
        JitSummaryResolver.prototype.addSummary = function (summary) { this._summaries.set(summary.symbol, summary); };
        return JitSummaryResolver;
    }());
    exports.JitSummaryResolver = JitSummaryResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9zdW1tYXJ5X3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBZ0JBO1FBQUE7UUFTQSxDQUFDO1FBQUQsc0JBQUM7SUFBRCxDQUFDLEFBVEQsSUFTQztJQVRxQiwwQ0FBZTtJQVdyQztRQUFBO1lBQ1UsZUFBVSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBWXRELENBQUM7UUFWQywwQ0FBYSxHQUFiLGNBQTJCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFDLDhDQUFpQixHQUFqQixVQUFrQixRQUFnQixJQUFZLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLGdEQUFtQixHQUFuQixVQUFvQixRQUFnQixJQUFZLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLDJDQUFjLEdBQWQsVUFBZSxTQUFlO1lBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDaEQsQ0FBQztRQUNELHlDQUFZLEdBQVosY0FBeUIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckMsd0NBQVcsR0FBWCxVQUFZLFNBQWUsSUFBVSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN4RCwrQ0FBa0IsR0FBbEIsVUFBbUIsUUFBZ0IsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRCx1Q0FBVSxHQUFWLFVBQVcsT0FBc0IsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0Rix5QkFBQztJQUFELENBQUMsQUFiRCxJQWFDO0lBYlksZ0RBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb21waWxlVHlwZVN1bW1hcnl9IGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4vY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3VtbWFyeTxUPiB7XG4gIHN5bWJvbDogVDtcbiAgbWV0YWRhdGE6IGFueTtcbiAgdHlwZT86IENvbXBpbGVUeXBlU3VtbWFyeTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN1bW1hcnlSZXNvbHZlcjxUPiB7XG4gIGFic3RyYWN0IGlzTGlicmFyeUZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG4gIGFic3RyYWN0IHRvU3VtbWFyeUZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcsIHJlZmVycmluZ1NyY0ZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGZyb21TdW1tYXJ5RmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZywgcmVmZXJyaW5nTGliRmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZztcbiAgYWJzdHJhY3QgcmVzb2x2ZVN1bW1hcnkocmVmZXJlbmNlOiBUKTogU3VtbWFyeTxUPnxudWxsO1xuICBhYnN0cmFjdCBnZXRTeW1ib2xzT2YoZmlsZVBhdGg6IHN0cmluZyk6IFRbXXxudWxsO1xuICBhYnN0cmFjdCBnZXRJbXBvcnRBcyhyZWZlcmVuY2U6IFQpOiBUO1xuICBhYnN0cmFjdCBnZXRLbm93bk1vZHVsZU5hbWUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsO1xuICBhYnN0cmFjdCBhZGRTdW1tYXJ5KHN1bW1hcnk6IFN1bW1hcnk8VD4pOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgSml0U3VtbWFyeVJlc29sdmVyIGltcGxlbWVudHMgU3VtbWFyeVJlc29sdmVyPFR5cGU+IHtcbiAgcHJpdmF0ZSBfc3VtbWFyaWVzID0gbmV3IE1hcDxUeXBlLCBTdW1tYXJ5PFR5cGU+PigpO1xuXG4gIGlzTGlicmFyeUZpbGUoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICB0b1N1bW1hcnlGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGZpbGVOYW1lOyB9XG4gIGZyb21TdW1tYXJ5RmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBmaWxlTmFtZTsgfVxuICByZXNvbHZlU3VtbWFyeShyZWZlcmVuY2U6IFR5cGUpOiBTdW1tYXJ5PFR5cGU+fG51bGwge1xuICAgIHJldHVybiB0aGlzLl9zdW1tYXJpZXMuZ2V0KHJlZmVyZW5jZSkgfHwgbnVsbDtcbiAgfVxuICBnZXRTeW1ib2xzT2YoKTogVHlwZVtdIHsgcmV0dXJuIFtdOyB9XG4gIGdldEltcG9ydEFzKHJlZmVyZW5jZTogVHlwZSk6IFR5cGUgeyByZXR1cm4gcmVmZXJlbmNlOyB9XG4gIGdldEtub3duTW9kdWxlTmFtZShmaWxlTmFtZTogc3RyaW5nKSB7IHJldHVybiBudWxsOyB9XG4gIGFkZFN1bW1hcnkoc3VtbWFyeTogU3VtbWFyeTxUeXBlPikgeyB0aGlzLl9zdW1tYXJpZXMuc2V0KHN1bW1hcnkuc3ltYm9sLCBzdW1tYXJ5KTsgfVxufVxuIl19