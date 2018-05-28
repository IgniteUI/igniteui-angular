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
        define("@angular/compiler/src/output/output_jit", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/output/abstract_emitter", "@angular/compiler/src/output/abstract_js_emitter", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var abstract_emitter_1 = require("@angular/compiler/src/output/abstract_emitter");
    var abstract_js_emitter_1 = require("@angular/compiler/src/output/abstract_js_emitter");
    var o = require("@angular/compiler/src/output/output_ast");
    function evalExpression(sourceUrl, ctx, vars, createSourceMap) {
        var fnBody = ctx.toSource() + "\n//# sourceURL=" + sourceUrl;
        var fnArgNames = [];
        var fnArgValues = [];
        for (var argName in vars) {
            fnArgNames.push(argName);
            fnArgValues.push(vars[argName]);
        }
        if (createSourceMap) {
            // using `new Function(...)` generates a header, 1 line of no arguments, 2 lines otherwise
            // E.g. ```
            // function anonymous(a,b,c
            // /**/) { ... }```
            // We don't want to hard code this fact, so we auto detect it via an empty function first.
            var emptyFn = new (Function.bind.apply(Function, tslib_1.__spread([void 0], fnArgNames.concat('return null;'))))().toString();
            var headerLines = emptyFn.slice(0, emptyFn.indexOf('return null;')).split('\n').length - 1;
            fnBody += "\n" + ctx.toSourceMapGenerator(sourceUrl, headerLines).toJsComment();
        }
        return new (Function.bind.apply(Function, tslib_1.__spread([void 0], fnArgNames.concat(fnBody))))().apply(void 0, tslib_1.__spread(fnArgValues));
    }
    function jitStatements(sourceUrl, statements, reflector, createSourceMaps) {
        var converter = new JitEmitterVisitor(reflector);
        var ctx = abstract_emitter_1.EmitterVisitorContext.createRoot();
        converter.visitAllStatements(statements, ctx);
        converter.createReturnStmt(ctx);
        return evalExpression(sourceUrl, ctx, converter.getArgs(), createSourceMaps);
    }
    exports.jitStatements = jitStatements;
    var JitEmitterVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(JitEmitterVisitor, _super);
        function JitEmitterVisitor(reflector) {
            var _this = _super.call(this) || this;
            _this.reflector = reflector;
            _this._evalArgNames = [];
            _this._evalArgValues = [];
            _this._evalExportedVars = [];
            return _this;
        }
        JitEmitterVisitor.prototype.createReturnStmt = function (ctx) {
            var stmt = new o.ReturnStatement(new o.LiteralMapExpr(this._evalExportedVars.map(function (resultVar) { return new o.LiteralMapEntry(resultVar, o.variable(resultVar), false); })));
            stmt.visitStatement(this, ctx);
        };
        JitEmitterVisitor.prototype.getArgs = function () {
            var result = {};
            for (var i = 0; i < this._evalArgNames.length; i++) {
                result[this._evalArgNames[i]] = this._evalArgValues[i];
            }
            return result;
        };
        JitEmitterVisitor.prototype.visitExternalExpr = function (ast, ctx) {
            var value = this.reflector.resolveExternalReference(ast.value);
            var id = this._evalArgValues.indexOf(value);
            if (id === -1) {
                id = this._evalArgValues.length;
                this._evalArgValues.push(value);
                var name_1 = compile_metadata_1.identifierName({ reference: value }) || 'val';
                this._evalArgNames.push("jit_" + name_1 + "_" + id);
            }
            ctx.print(ast, this._evalArgNames[id]);
            return null;
        };
        JitEmitterVisitor.prototype.visitDeclareVarStmt = function (stmt, ctx) {
            if (stmt.hasModifier(o.StmtModifier.Exported)) {
                this._evalExportedVars.push(stmt.name);
            }
            return _super.prototype.visitDeclareVarStmt.call(this, stmt, ctx);
        };
        JitEmitterVisitor.prototype.visitDeclareFunctionStmt = function (stmt, ctx) {
            if (stmt.hasModifier(o.StmtModifier.Exported)) {
                this._evalExportedVars.push(stmt.name);
            }
            return _super.prototype.visitDeclareFunctionStmt.call(this, stmt, ctx);
        };
        JitEmitterVisitor.prototype.visitDeclareClassStmt = function (stmt, ctx) {
            if (stmt.hasModifier(o.StmtModifier.Exported)) {
                this._evalExportedVars.push(stmt.name);
            }
            return _super.prototype.visitDeclareClassStmt.call(this, stmt, ctx);
        };
        return JitEmitterVisitor;
    }(abstract_js_emitter_1.AbstractJsEmitterVisitor));
    exports.JitEmitterVisitor = JitEmitterVisitor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ppdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvb3V0cHV0X2ppdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRUFBbUQ7SUFHbkQsa0ZBQXlEO0lBQ3pELHdGQUErRDtJQUMvRCwyREFBa0M7SUFFbEMsd0JBQ0ksU0FBaUIsRUFBRSxHQUEwQixFQUFFLElBQTBCLEVBQ3pFLGVBQXdCO1FBQzFCLElBQUksTUFBTSxHQUFNLEdBQUcsQ0FBQyxRQUFRLEVBQUUsd0JBQW1CLFNBQVcsQ0FBQztRQUM3RCxJQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDaEMsSUFBTSxXQUFXLEdBQVUsRUFBRSxDQUFDO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLElBQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0IsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLDBGQUEwRjtZQUMxRixXQUFXO1lBQ1gsMkJBQTJCO1lBQzNCLG1CQUFtQjtZQUNuQiwwRkFBMEY7WUFDMUYsSUFBTSxPQUFPLEdBQUcsS0FBSSxRQUFRLFlBQVIsUUFBUSw2QkFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFFLFFBQVEsRUFBRSxDQUFDO1lBQzlFLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FB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WUFDRCxNQUFNLENBQUMsaUJBQU0scUJBQXFCLFlBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUF0REQsQ0FBdUMsOENBQXdCLEdBc0Q5RDtJQXREWSw4Q0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aWRlbnRpZmllck5hbWV9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuLi9jb21waWxlX3JlZmxlY3Rvcic7XG5cbmltcG9ydCB7RW1pdHRlclZpc2l0b3JDb250ZXh0fSBmcm9tICcuL2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0IHtBYnN0cmFjdEpzRW1pdHRlclZpc2l0b3J9IGZyb20gJy4vYWJzdHJhY3RfanNfZW1pdHRlcic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0X2FzdCc7XG5cbmZ1bmN0aW9uIGV2YWxFeHByZXNzaW9uKFxuICAgIHNvdXJjZVVybDogc3RyaW5nLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCwgdmFyczoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgY3JlYXRlU291cmNlTWFwOiBib29sZWFuKTogYW55IHtcbiAgbGV0IGZuQm9keSA9IGAke2N0eC50b1NvdXJjZSgpfVxcbi8vIyBzb3VyY2VVUkw9JHtzb3VyY2VVcmx9YDtcbiAgY29uc3QgZm5BcmdOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZm5BcmdWYWx1ZXM6IGFueVtdID0gW107XG4gIGZvciAoY29uc3QgYXJnTmFtZSBpbiB2YXJzKSB7XG4gICAgZm5BcmdOYW1lcy5wdXNoKGFyZ05hbWUpO1xuICAgIGZuQXJnVmFsdWVzLnB1c2godmFyc1thcmdOYW1lXSk7XG4gIH1cbiAgaWYgKGNyZWF0ZVNvdXJjZU1hcCkge1xuICAgIC8vIHVzaW5nIGBuZXcgRnVuY3Rpb24oLi4uKWAgZ2VuZXJhdGVzIGEgaGVhZGVyLCAxIGxpbmUgb2Ygbm8gYXJndW1lbnRzLCAyIGxpbmVzIG90aGVyd2lzZVxuICAgIC8vIEUuZy4gYGBgXG4gICAgLy8gZnVuY3Rpb24gYW5vbnltb3VzKGEsYixjXG4gICAgLy8gLyoqLykgeyAuLi4gfWBgYFxuICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gaGFyZCBjb2RlIHRoaXMgZmFjdCwgc28gd2UgYXV0byBkZXRlY3QgaXQgdmlhIGFuIGVtcHR5IGZ1bmN0aW9uIGZpcnN0LlxuICAgIGNvbnN0IGVtcHR5Rm4gPSBuZXcgRnVuY3Rpb24oLi4uZm5BcmdOYW1lcy5jb25jYXQoJ3JldHVybiBudWxsOycpKS50b1N0cmluZygpO1xuICAgIGNvbnN0IGhlYWRlckxpbmVzID0gZW1wdHlGbi5zbGljZSgwLCBlbXB0eUZuLmluZGV4T2YoJ3JldHVybiBudWxsOycpKS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcbiAgICBmbkJvZHkgKz0gYFxcbiR7Y3R4LnRvU291cmNlTWFwR2VuZXJhdG9yKHNvdXJjZVVybCwgaGVhZGVyTGluZXMpLnRvSnNDb21tZW50KCl9YDtcbiAgfVxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKC4uLmZuQXJnTmFtZXMuY29uY2F0KGZuQm9keSkpKC4uLmZuQXJnVmFsdWVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGppdFN0YXRlbWVudHMoXG4gICAgc291cmNlVXJsOiBzdHJpbmcsIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIHJlZmxlY3RvcjogQ29tcGlsZVJlZmxlY3RvcixcbiAgICBjcmVhdGVTb3VyY2VNYXBzOiBib29sZWFuKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBjb25zdCBjb252ZXJ0ZXIgPSBuZXcgSml0RW1pdHRlclZpc2l0b3IocmVmbGVjdG9yKTtcbiAgY29uc3QgY3R4ID0gRW1pdHRlclZpc2l0b3JDb250ZXh0LmNyZWF0ZVJvb3QoKTtcbiAgY29udmVydGVyLnZpc2l0QWxsU3RhdGVtZW50cyhzdGF0ZW1lbnRzLCBjdHgpO1xuICBjb252ZXJ0ZXIuY3JlYXRlUmV0dXJuU3RtdChjdHgpO1xuICByZXR1cm4gZXZhbEV4cHJlc3Npb24oc291cmNlVXJsLCBjdHgsIGNvbnZlcnRlci5nZXRBcmdzKCksIGNyZWF0ZVNvdXJjZU1hcHMpO1xufVxuXG5leHBvcnQgY2xhc3MgSml0RW1pdHRlclZpc2l0b3IgZXh0ZW5kcyBBYnN0cmFjdEpzRW1pdHRlclZpc2l0b3Ige1xuICBwcml2YXRlIF9ldmFsQXJnTmFtZXM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgX2V2YWxBcmdWYWx1ZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgX2V2YWxFeHBvcnRlZFZhcnM6IHN0cmluZ1tdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IpIHsgc3VwZXIoKTsgfVxuXG4gIGNyZWF0ZVJldHVyblN0bXQoY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpIHtcbiAgICBjb25zdCBzdG10ID0gbmV3IG8uUmV0dXJuU3RhdGVtZW50KG5ldyBvLkxpdGVyYWxNYXBFeHByKHRoaXMuX2V2YWxFeHBvcnRlZFZhcnMubWFwKFxuICAgICAgICByZXN1bHRWYXIgPT4gbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KHJlc3VsdFZhciwgby52YXJpYWJsZShyZXN1bHRWYXIpLCBmYWxzZSkpKSk7XG4gICAgc3RtdC52aXNpdFN0YXRlbWVudCh0aGlzLCBjdHgpO1xuICB9XG5cbiAgZ2V0QXJncygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgY29uc3QgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZXZhbEFyZ05hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbdGhpcy5fZXZhbEFyZ05hbWVzW2ldXSA9IHRoaXMuX2V2YWxBcmdWYWx1ZXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2aXNpdEV4dGVybmFsRXhwcihhc3Q6IG8uRXh0ZXJuYWxFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnJlZmxlY3Rvci5yZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UoYXN0LnZhbHVlKTtcbiAgICBsZXQgaWQgPSB0aGlzLl9ldmFsQXJnVmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpZCA9PT0gLTEpIHtcbiAgICAgIGlkID0gdGhpcy5fZXZhbEFyZ1ZhbHVlcy5sZW5ndGg7XG4gICAgICB0aGlzLl9ldmFsQXJnVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgY29uc3QgbmFtZSA9IGlkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IHZhbHVlfSkgfHwgJ3ZhbCc7XG4gICAgICB0aGlzLl9ldmFsQXJnTmFtZXMucHVzaChgaml0XyR7bmFtZX1fJHtpZH1gKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGFzdCwgdGhpcy5fZXZhbEFyZ05hbWVzW2lkXSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdERlY2xhcmVWYXJTdG10KHN0bXQ6IG8uRGVjbGFyZVZhclN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBpZiAoc3RtdC5oYXNNb2RpZmllcihvLlN0bXRNb2RpZmllci5FeHBvcnRlZCkpIHtcbiAgICAgIHRoaXMuX2V2YWxFeHBvcnRlZFZhcnMucHVzaChzdG10Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIudmlzaXREZWNsYXJlVmFyU3RtdChzdG10LCBjdHgpO1xuICB9XG5cbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IG8uRGVjbGFyZUZ1bmN0aW9uU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGlmIChzdG10Lmhhc01vZGlmaWVyKG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkKSkge1xuICAgICAgdGhpcy5fZXZhbEV4cG9ydGVkVmFycy5wdXNoKHN0bXQubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBzdXBlci52aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdCwgY3R4KTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChzdG10OiBvLkNsYXNzU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGlmIChzdG10Lmhhc01vZGlmaWVyKG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkKSkge1xuICAgICAgdGhpcy5fZXZhbEV4cG9ydGVkVmFycy5wdXNoKHN0bXQubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBzdXBlci52aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdCwgY3R4KTtcbiAgfVxufVxuIl19