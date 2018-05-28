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
        define("@angular/compiler/src/ng_module_compiler", ["require", "exports", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/identifiers", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/parse_util", "@angular/compiler/src/provider_analyzer", "@angular/compiler/src/view_compiler/provider_compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var identifiers_1 = require("@angular/compiler/src/identifiers");
    var o = require("@angular/compiler/src/output/output_ast");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var provider_analyzer_1 = require("@angular/compiler/src/provider_analyzer");
    var provider_compiler_1 = require("@angular/compiler/src/view_compiler/provider_compiler");
    var NgModuleCompileResult = /** @class */ (function () {
        function NgModuleCompileResult(ngModuleFactoryVar) {
            this.ngModuleFactoryVar = ngModuleFactoryVar;
        }
        return NgModuleCompileResult;
    }());
    exports.NgModuleCompileResult = NgModuleCompileResult;
    var LOG_VAR = o.variable('_l');
    var NgModuleCompiler = /** @class */ (function () {
        function NgModuleCompiler(reflector) {
            this.reflector = reflector;
        }
        NgModuleCompiler.prototype.compile = function (ctx, ngModuleMeta, extraProviders) {
            var sourceSpan = parse_util_1.typeSourceSpan('NgModule', ngModuleMeta.type);
            var entryComponentFactories = ngModuleMeta.transitiveModule.entryComponents;
            var bootstrapComponents = ngModuleMeta.bootstrapComponents;
            var providerParser = new provider_analyzer_1.NgModuleProviderAnalyzer(this.reflector, ngModuleMeta, extraProviders, sourceSpan);
            var providerDefs = [provider_compiler_1.componentFactoryResolverProviderDef(this.reflector, ctx, 0 /* None */, entryComponentFactories)]
                .concat(providerParser.parse().map(function (provider) { return provider_compiler_1.providerDef(ctx, provider); }))
                .map(function (_a) {
                var providerExpr = _a.providerExpr, depsExpr = _a.depsExpr, flags = _a.flags, tokenExpr = _a.tokenExpr;
                return o.importExpr(identifiers_1.Identifiers.moduleProviderDef).callFn([
                    o.literal(flags), tokenExpr, providerExpr, depsExpr
                ]);
            });
            var ngModuleDef = o.importExpr(identifiers_1.Identifiers.moduleDef).callFn([o.literalArr(providerDefs)]);
            var ngModuleDefFactory = o.fn([new o.FnParam(LOG_VAR.name)], [new o.ReturnStatement(ngModuleDef)], o.INFERRED_TYPE);
            var ngModuleFactoryVar = compile_metadata_1.identifierName(ngModuleMeta.type) + "NgFactory";
            this._createNgModuleFactory(ctx, ngModuleMeta.type.reference, o.importExpr(identifiers_1.Identifiers.createModuleFactory).callFn([
                ctx.importExpr(ngModuleMeta.type.reference),
                o.literalArr(bootstrapComponents.map(function (id) { return ctx.importExpr(id.reference); })),
                ngModuleDefFactory
            ]));
            if (ngModuleMeta.id) {
                var id = typeof ngModuleMeta.id === 'string' ? o.literal(ngModuleMeta.id) :
                    ctx.importExpr(ngModuleMeta.id);
                var registerFactoryStmt = o.importExpr(identifiers_1.Identifiers.RegisterModuleFactoryFn)
                    .callFn([id, o.variable(ngModuleFactoryVar)])
                    .toStmt();
                ctx.statements.push(registerFactoryStmt);
            }
            return new NgModuleCompileResult(ngModuleFactoryVar);
        };
        NgModuleCompiler.prototype.createStub = function (ctx, ngModuleReference) {
            this._createNgModuleFactory(ctx, ngModuleReference, o.NULL_EXPR);
        };
        NgModuleCompiler.prototype._createNgModuleFactory = function (ctx, reference, value) {
            var ngModuleFactoryVar = compile_metadata_1.identifierName({ reference: reference }) + "NgFactory";
            var ngModuleFactoryStmt = o.variable(ngModuleFactoryVar)
                .set(value)
                .toDeclStmt(o.importType(identifiers_1.Identifiers.NgModuleFactory, [o.expressionType(ctx.importExpr(reference))], [o.TypeModifier.Const]), [o.StmtModifier.Final, o.StmtModifier.Exported]);
            ctx.statements.push(ngModuleFactoryStmt);
        };
        return NgModuleCompiler;
    }());
    exports.NgModuleCompiler = NgModuleCompiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlX2NvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL25nX21vZHVsZV9jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDJFQUFvRztJQUdwRyxpRUFBMEM7SUFDMUMsMkRBQXlDO0lBQ3pDLCtEQUE0QztJQUM1Qyw2RUFBNkQ7SUFFN0QsMkZBQTJHO0lBRTNHO1FBQ0UsK0JBQW1CLGtCQUEwQjtZQUExQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7UUFBRyxDQUFDO1FBQ25ELDRCQUFDO0lBQUQsQ0FBQyxBQUZELElBRUM7SUFGWSxzREFBcUI7SUFJbEMsSUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVqQztRQUNFLDBCQUFvQixTQUEyQjtZQUEzQixjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUFHLENBQUM7UUFDbkQsa0NBQU8sR0FBUCxVQUNJLEdBQWtCLEVBQUUsWUFBcUMsRUFDekQsY0FBeUM7WUFDM0MsSUFBTSxVQUFVLEdBQUcsMkJBQWMsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pFLElBQU0sdUJBQXVCLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQztZQUM5RSxJQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztZQUM3RCxJQUFNLGNBQWMsR0FDaEIsSUFBSSw0Q0FBd0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDM0YsSUFBTSxZQUFZLEdBQ2QsQ0FBQyx1REFBbUMsQ0FDL0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLGdCQUFrQix1QkFBdUIsQ0FBQyxDQUFDO2lCQUM5RCxNQUFN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QUMsRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLENBQUMsY0FBVyxDQUFDO1lBQ2hGLElBQU0sbUJBQW1CLEdBQ3JCLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUM7aUJBQ3pCLEdBQUcsQ0FBQyxLQUFLLENBQUM7aUJBQ1YsVUFBVSxDQUNQLENBQUMsQ0FBQyxVQUFVLENBQ1IseUJBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUcsQ0FBQyxFQUM1RSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDM0IsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFN0QsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBN0RELElBNkRDO0lBN0RZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlTmdNb2R1bGVNZXRhZGF0YSwgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsIGlkZW50aWZpZXJOYW1lfSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuL2NvbXBpbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7Tm9kZUZsYWdzfSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9pZGVudGlmaWVycyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHt0eXBlU291cmNlU3Bhbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcbmltcG9ydCB7TmdNb2R1bGVQcm92aWRlckFuYWx5emVyfSBmcm9tICcuL3Byb3ZpZGVyX2FuYWx5emVyJztcbmltcG9ydCB7T3V0cHV0Q29udGV4dH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7Y29tcG9uZW50RmFjdG9yeVJlc29sdmVyUHJvdmlkZXJEZWYsIGRlcERlZiwgcHJvdmlkZXJEZWZ9IGZyb20gJy4vdmlld19jb21waWxlci9wcm92aWRlcl9jb21waWxlcic7XG5cbmV4cG9ydCBjbGFzcyBOZ01vZHVsZUNvbXBpbGVSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmdNb2R1bGVGYWN0b3J5VmFyOiBzdHJpbmcpIHt9XG59XG5cbmNvbnN0IExPR19WQVIgPSBvLnZhcmlhYmxlKCdfbCcpO1xuXG5leHBvcnQgY2xhc3MgTmdNb2R1bGVDb21waWxlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yKSB7fVxuICBjb21waWxlKFxuICAgICAgY3R4OiBPdXRwdXRDb250ZXh0LCBuZ01vZHVsZU1ldGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLFxuICAgICAgZXh0cmFQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10pOiBOZ01vZHVsZUNvbXBpbGVSZXN1bHQge1xuICAgIGNvbnN0IHNvdXJjZVNwYW4gPSB0eXBlU291cmNlU3BhbignTmdNb2R1bGUnLCBuZ01vZHVsZU1ldGEudHlwZSk7XG4gICAgY29uc3QgZW50cnlDb21wb25lbnRGYWN0b3JpZXMgPSBuZ01vZHVsZU1ldGEudHJhbnNpdGl2ZU1vZHVsZS5lbnRyeUNvbXBvbmVudHM7XG4gICAgY29uc3QgYm9vdHN0cmFwQ29tcG9uZW50cyA9IG5nTW9kdWxlTWV0YS5ib290c3RyYXBDb21wb25lbnRzO1xuICAgIGNvbnN0IHByb3ZpZGVyUGFyc2VyID1cbiAgICAgICAgbmV3IE5nTW9kdWxlUHJvdmlkZXJBbmFseXplcih0aGlzLnJlZmxlY3RvciwgbmdNb2R1bGVNZXRhLCBleHRyYVByb3ZpZGVycywgc291cmNlU3Bhbik7XG4gICAgY29uc3QgcHJvdmlkZXJEZWZzID1cbiAgICAgICAgW2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlclByb3ZpZGVyRGVmKFxuICAgICAgICAgICAgIHRoaXMucmVmbGVjdG9yLCBjdHgsIE5vZGVGbGFncy5Ob25lLCBlbnRyeUNvbXBvbmVudEZhY3RvcmllcyldXG4gICAgICAgICAgICAuY29uY2F0KHByb3ZpZGVyUGFyc2VyLnBhcnNlKCkubWFwKChwcm92aWRlcikgPT4gcHJvdmlkZXJEZWYoY3R4LCBwcm92aWRlcikpKVxuICAgICAgICAgICAgLm1hcCgoe3Byb3ZpZGVyRXhwciwgZGVwc0V4cHIsIGZsYWdzLCB0b2tlbkV4cHJ9KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMubW9kdWxlUHJvdmlkZXJEZWYpLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgby5saXRlcmFsKGZsYWdzKSwgdG9rZW5FeHByLCBwcm92aWRlckV4cHIsIGRlcHNFeHByXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICBjb25zdCBuZ01vZHVsZURlZiA9IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5tb2R1bGVEZWYpLmNhbGxGbihbby5saXRlcmFsQXJyKHByb3ZpZGVyRGVmcyldKTtcbiAgICBjb25zdCBuZ01vZHVsZURlZkZhY3RvcnkgPSBvLmZuKFxuICAgICAgICBbbmV3IG8uRm5QYXJhbShMT0dfVkFSLm5hbWUgISldLCBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KG5nTW9kdWxlRGVmKV0sIG8uSU5GRVJSRURfVFlQRSk7XG5cbiAgICBjb25zdCBuZ01vZHVsZUZhY3RvcnlWYXIgPSBgJHtpZGVudGlmaWVyTmFtZShuZ01vZHVsZU1ldGEudHlwZSl9TmdGYWN0b3J5YDtcbiAgICB0aGlzLl9jcmVhdGVOZ01vZHVsZUZhY3RvcnkoXG4gICAgICAgIGN0eCwgbmdNb2R1bGVNZXRhLnR5cGUucmVmZXJlbmNlLCBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuY3JlYXRlTW9kdWxlRmFjdG9yeSkuY2FsbEZuKFtcbiAgICAgICAgICBjdHguaW1wb3J0RXhwcihuZ01vZHVsZU1ldGEudHlwZS5yZWZlcmVuY2UpLFxuICAgICAgICAgIG8ubGl0ZXJhbEFycihib290c3RyYXBDb21wb25lbnRzLm1hcChpZCA9PiBjdHguaW1wb3J0RXhwcihpZC5yZWZlcmVuY2UpKSksXG4gICAgICAgICAgbmdNb2R1bGVEZWZGYWN0b3J5XG4gICAgICAgIF0pKTtcblxuICAgIGlmIChuZ01vZHVsZU1ldGEuaWQpIHtcbiAgICAgIGNvbnN0IGlkID0gdHlwZW9mIG5nTW9kdWxlTWV0YS5pZCA9PT0gJ3N0cmluZycgPyBvLmxpdGVyYWwobmdNb2R1bGVNZXRhLmlkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmltcG9ydEV4cHIobmdNb2R1bGVNZXRhLmlkKTtcbiAgICAgIGNvbnN0IHJlZ2lzdGVyRmFjdG9yeVN0bXQgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuUmVnaXN0ZXJNb2R1bGVGYWN0b3J5Rm4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oW2lkLCBvLnZhcmlhYmxlKG5nTW9kdWxlRmFjdG9yeVZhcildKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9TdG10KCk7XG4gICAgICBjdHguc3RhdGVtZW50cy5wdXNoKHJlZ2lzdGVyRmFjdG9yeVN0bXQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTmdNb2R1bGVDb21waWxlUmVzdWx0KG5nTW9kdWxlRmFjdG9yeVZhcik7XG4gIH1cblxuICBjcmVhdGVTdHViKGN0eDogT3V0cHV0Q29udGV4dCwgbmdNb2R1bGVSZWZlcmVuY2U6IGFueSkge1xuICAgIHRoaXMuX2NyZWF0ZU5nTW9kdWxlRmFjdG9yeShjdHgsIG5nTW9kdWxlUmVmZXJlbmNlLCBvLk5VTExfRVhQUik7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVOZ01vZHVsZUZhY3RvcnkoY3R4OiBPdXRwdXRDb250ZXh0LCByZWZlcmVuY2U6IGFueSwgdmFsdWU6IG8uRXhwcmVzc2lvbikge1xuICAgIGNvbnN0IG5nTW9kdWxlRmFjdG9yeVZhciA9IGAke2lkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IHJlZmVyZW5jZX0pfU5nRmFjdG9yeWA7XG4gICAgY29uc3QgbmdNb2R1bGVGYWN0b3J5U3RtdCA9XG4gICAgICAgIG8udmFyaWFibGUobmdNb2R1bGVGYWN0b3J5VmFyKVxuICAgICAgICAgICAgLnNldCh2YWx1ZSlcbiAgICAgICAgICAgIC50b0RlY2xTdG10KFxuICAgICAgICAgICAgICAgIG8uaW1wb3J0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgSWRlbnRpZmllcnMuTmdNb2R1bGVGYWN0b3J5LCBbby5leHByZXNzaW9uVHlwZShjdHguaW1wb3J0RXhwcihyZWZlcmVuY2UpKSAhXSxcbiAgICAgICAgICAgICAgICAgICAgW28uVHlwZU1vZGlmaWVyLkNvbnN0XSksXG4gICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLkZpbmFsLCBvLlN0bXRNb2RpZmllci5FeHBvcnRlZF0pO1xuXG4gICAgY3R4LnN0YXRlbWVudHMucHVzaChuZ01vZHVsZUZhY3RvcnlTdG10KTtcbiAgfVxufVxuIl19