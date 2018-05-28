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
        define("@angular/compiler/src/render3/r3_module_factory_compiler", ["require", "exports", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    /**
     * Write a Renderer2 compatibility module factory to the output context.
     */
    function compileModuleFactory(outputCtx, module, backPatchReferenceOf, resolver) {
        var ngModuleFactoryVar = compile_metadata_1.identifierName(module.type) + "NgFactory";
        var parentInjector = 'parentInjector';
        var createFunction = o.fn([new o.FnParam(parentInjector, o.DYNAMIC_TYPE)], [new o.IfStmt(o.THIS_EXPR.prop(r3_identifiers_1.Identifiers.PATCH_DEPS).notIdentical(o.literal(true, o.INFERRED_TYPE)), [
                o.THIS_EXPR.prop(r3_identifiers_1.Identifiers.PATCH_DEPS).set(o.literal(true, o.INFERRED_TYPE)).toStmt(),
                backPatchReferenceOf(module.type).callFn([]).toStmt()
            ])], o.INFERRED_TYPE, null, ngModuleFactoryVar + "_Create");
        var moduleFactoryLiteral = o.literalMap([
            { key: 'moduleType', value: outputCtx.importExpr(module.type.reference), quoted: false },
            { key: 'create', value: createFunction, quoted: false }
        ]);
        outputCtx.statements.push(o.variable(ngModuleFactoryVar).set(moduleFactoryLiteral).toDeclStmt(o.DYNAMIC_TYPE, [
            o.StmtModifier.Exported, o.StmtModifier.Final
        ]));
    }
    exports.compileModuleFactory = compileModuleFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfbW9kdWxlX2ZhY3RvcnlfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9yM19tb2R1bGVfZmFjdG9yeV9jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILDJFQUEwSztJQUUxSywyREFBMEM7SUFHMUMsK0VBQW1EO0lBRW5EOztPQUVHO0lBQ0gsOEJBQ0ksU0FBd0IsRUFBRSxNQUErQixFQUN6RCxvQkFBbUUsRUFDbkUsUUFBaUM7UUFDbkMsSUFBTSxrQkFBa0IsR0FBTSxpQ0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBVyxDQUFDO1FBRXJFLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO1FBQ3hDLElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQ3ZCLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsRUFDL0MsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQ1QsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsNEJBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQzlFO2dCQUNFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDRCQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDOUUsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7YUFDdEQsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUssa0JBQWtCLFlBQVMsQ0FBQyxDQUFDO1FBRTNELElBQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUN4QyxFQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDO1lBQ3RGLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7U0FDdEQsQ0FBQyxDQUFDO1FBRUgsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQ3JCLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRTtZQUNsRixDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUs7U0FDOUMsQ0FBQyxDQUFDLENBQUM7SUFDVixDQUFDO0lBMUJELG9EQTBCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0aWNSZWZsZWN0b3J9IGZyb20gJy4uL2FvdC9zdGF0aWNfcmVmbGVjdG9yJztcbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSwgQ29tcGlsZVBpcGVTdW1tYXJ5LCBDb21waWxlVHlwZU1ldGFkYXRhLCBpZGVudGlmaWVyTmFtZX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVNZXRhZGF0YVJlc29sdmVyfSBmcm9tICcuLi9tZXRhZGF0YV9yZXNvbHZlcic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7T3V0cHV0Q29udGV4dH0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4vcjNfaWRlbnRpZmllcnMnO1xuXG4vKipcbiAqIFdyaXRlIGEgUmVuZGVyZXIyIGNvbXBhdGliaWxpdHkgbW9kdWxlIGZhY3RvcnkgdG8gdGhlIG91dHB1dCBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZU1vZHVsZUZhY3RvcnkoXG4gICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBtb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLFxuICAgIGJhY2tQYXRjaFJlZmVyZW5jZU9mOiAobW9kdWxlOiBDb21waWxlVHlwZU1ldGFkYXRhKSA9PiBvLkV4cHJlc3Npb24sXG4gICAgcmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyKSB7XG4gIGNvbnN0IG5nTW9kdWxlRmFjdG9yeVZhciA9IGAke2lkZW50aWZpZXJOYW1lKG1vZHVsZS50eXBlKX1OZ0ZhY3RvcnlgO1xuXG4gIGNvbnN0IHBhcmVudEluamVjdG9yID0gJ3BhcmVudEluamVjdG9yJztcbiAgY29uc3QgY3JlYXRlRnVuY3Rpb24gPSBvLmZuKFxuICAgICAgW25ldyBvLkZuUGFyYW0ocGFyZW50SW5qZWN0b3IsIG8uRFlOQU1JQ19UWVBFKV0sXG4gICAgICBbbmV3IG8uSWZTdG10KFxuICAgICAgICAgIG8uVEhJU19FWFBSLnByb3AoUjMuUEFUQ0hfREVQUykubm90SWRlbnRpY2FsKG8ubGl0ZXJhbCh0cnVlLCBvLklORkVSUkVEX1RZUEUpKSxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBvLlRISVNfRVhQUi5wcm9wKFIzLlBBVENIX0RFUFMpLnNldChvLmxpdGVyYWwodHJ1ZSwgby5JTkZFUlJFRF9UWVBFKSkudG9TdG10KCksXG4gICAgICAgICAgICBiYWNrUGF0Y2hSZWZlcmVuY2VPZihtb2R1bGUudHlwZSkuY2FsbEZuKFtdKS50b1N0bXQoKVxuICAgICAgICAgIF0pXSxcbiAgICAgIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgYCR7bmdNb2R1bGVGYWN0b3J5VmFyfV9DcmVhdGVgKTtcblxuICBjb25zdCBtb2R1bGVGYWN0b3J5TGl0ZXJhbCA9IG8ubGl0ZXJhbE1hcChbXG4gICAge2tleTogJ21vZHVsZVR5cGUnLCB2YWx1ZTogb3V0cHV0Q3R4LmltcG9ydEV4cHIobW9kdWxlLnR5cGUucmVmZXJlbmNlKSwgcXVvdGVkOiBmYWxzZX0sXG4gICAge2tleTogJ2NyZWF0ZScsIHZhbHVlOiBjcmVhdGVGdW5jdGlvbiwgcXVvdGVkOiBmYWxzZX1cbiAgXSk7XG5cbiAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgIG8udmFyaWFibGUobmdNb2R1bGVGYWN0b3J5VmFyKS5zZXQobW9kdWxlRmFjdG9yeUxpdGVyYWwpLnRvRGVjbFN0bXQoby5EWU5BTUlDX1RZUEUsIFtcbiAgICAgICAgby5TdG10TW9kaWZpZXIuRXhwb3J0ZWQsIG8uU3RtdE1vZGlmaWVyLkZpbmFsXG4gICAgICBdKSk7XG59XG4iXX0=