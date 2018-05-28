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
        define("@angular/compiler/src/aot/compiler_factory", ["require", "exports", "@angular/compiler/src/config", "@angular/compiler/src/core", "@angular/compiler/src/directive_normalizer", "@angular/compiler/src/directive_resolver", "@angular/compiler/src/expression_parser/lexer", "@angular/compiler/src/expression_parser/parser", "@angular/compiler/src/i18n/i18n_html_parser", "@angular/compiler/src/injectable_compiler", "@angular/compiler/src/metadata_resolver", "@angular/compiler/src/ml_parser/html_parser", "@angular/compiler/src/ng_module_compiler", "@angular/compiler/src/ng_module_resolver", "@angular/compiler/src/output/ts_emitter", "@angular/compiler/src/pipe_resolver", "@angular/compiler/src/schema/dom_element_schema_registry", "@angular/compiler/src/style_compiler", "@angular/compiler/src/template_parser/template_parser", "@angular/compiler/src/util", "@angular/compiler/src/view_compiler/type_check_compiler", "@angular/compiler/src/view_compiler/view_compiler", "@angular/compiler/src/aot/compiler", "@angular/compiler/src/aot/static_reflector", "@angular/compiler/src/aot/static_symbol", "@angular/compiler/src/aot/static_symbol_resolver", "@angular/compiler/src/aot/summary_resolver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config_1 = require("@angular/compiler/src/config");
    var core_1 = require("@angular/compiler/src/core");
    var directive_normalizer_1 = require("@angular/compiler/src/directive_normalizer");
    var directive_resolver_1 = require("@angular/compiler/src/directive_resolver");
    var lexer_1 = require("@angular/compiler/src/expression_parser/lexer");
    var parser_1 = require("@angular/compiler/src/expression_parser/parser");
    var i18n_html_parser_1 = require("@angular/compiler/src/i18n/i18n_html_parser");
    var injectable_compiler_1 = require("@angular/compiler/src/injectable_compiler");
    var metadata_resolver_1 = require("@angular/compiler/src/metadata_resolver");
    var html_parser_1 = require("@angular/compiler/src/ml_parser/html_parser");
    var ng_module_compiler_1 = require("@angular/compiler/src/ng_module_compiler");
    var ng_module_resolver_1 = require("@angular/compiler/src/ng_module_resolver");
    var ts_emitter_1 = require("@angular/compiler/src/output/ts_emitter");
    var pipe_resolver_1 = require("@angular/compiler/src/pipe_resolver");
    var dom_element_schema_registry_1 = require("@angular/compiler/src/schema/dom_element_schema_registry");
    var style_compiler_1 = require("@angular/compiler/src/style_compiler");
    var template_parser_1 = require("@angular/compiler/src/template_parser/template_parser");
    var util_1 = require("@angular/compiler/src/util");
    var type_check_compiler_1 = require("@angular/compiler/src/view_compiler/type_check_compiler");
    var view_compiler_1 = require("@angular/compiler/src/view_compiler/view_compiler");
    var compiler_1 = require("@angular/compiler/src/aot/compiler");
    var static_reflector_1 = require("@angular/compiler/src/aot/static_reflector");
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var static_symbol_resolver_1 = require("@angular/compiler/src/aot/static_symbol_resolver");
    var summary_resolver_1 = require("@angular/compiler/src/aot/summary_resolver");
    function createAotUrlResolver(host) {
        return {
            resolve: function (basePath, url) {
                var filePath = host.resourceNameToFileName(url, basePath);
                if (!filePath) {
                    throw util_1.syntaxError("Couldn't resolve resource " + url + " from " + basePath);
                }
                return filePath;
            }
        };
    }
    exports.createAotUrlResolver = createAotUrlResolver;
    /**
     * Creates a new AotCompiler based on options and a host.
     */
    function createAotCompiler(compilerHost, options, errorCollector) {
        var translations = options.translations || '';
        var urlResolver = createAotUrlResolver(compilerHost);
        var symbolCache = new static_symbol_1.StaticSymbolCache();
        var summaryResolver = new summary_resolver_1.AotSummaryResolver(compilerHost, symbolCache);
        var symbolResolver = new static_symbol_resolver_1.StaticSymbolResolver(compilerHost, symbolCache, summaryResolver);
        var staticReflector = new static_reflector_1.StaticReflector(summaryResolver, symbolResolver, [], [], errorCollector);
        var htmlParser;
        if (!!options.enableIvy) {
            // Ivy handles i18n at the compiler level so we must use a regular parser
            htmlParser = new html_parser_1.HtmlParser();
        }
        else {
            htmlParser = new i18n_html_parser_1.I18NHtmlParser(new html_parser_1.HtmlParser(), translations, options.i18nFormat, options.missingTranslation, console);
        }
        var config = new config_1.CompilerConfig({
            defaultEncapsulation: core_1.ViewEncapsulation.Emulated,
            useJit: false,
            missingTranslation: options.missingTranslation,
            preserveWhitespaces: options.preserveWhitespaces,
            strictInjectionParameters: options.strictInjectionParameters,
        });
        var normalizer = new directive_normalizer_1.DirectiveNormalizer({ get: function (url) { return compilerHost.loadResource(url); } }, urlResolver, htmlParser, config);
        var expressionParser = new parser_1.Parser(new lexer_1.Lexer());
        var elementSchemaRegistry = new dom_element_schema_registry_1.DomElementSchemaRegistry();
        var tmplParser = new template_parser_1.TemplateParser(config, staticReflector, expressionParser, elementSchemaRegistry, htmlParser, console, []);
        var resolver = new metadata_resolver_1.CompileMetadataResolver(config, htmlParser, new ng_module_resolver_1.NgModuleResolver(staticReflector), new directive_resolver_1.DirectiveResolver(staticReflector), new pipe_resolver_1.PipeResolver(staticReflector), summaryResolver, elementSchemaRegistry, normalizer, console, symbolCache, staticReflector, errorCollector);
        // TODO(vicb): do not pass options.i18nFormat here
        var viewCompiler = new view_compiler_1.ViewCompiler(staticReflector);
        var typeCheckCompiler = new type_check_compiler_1.TypeCheckCompiler(options, staticReflector);
        var compiler = new compiler_1.AotCompiler(config, options, compilerHost, staticReflector, resolver, tmplParser, new style_compiler_1.StyleCompiler(urlResolver), viewCompiler, typeCheckCompiler, new ng_module_compiler_1.NgModuleCompiler(staticReflector), new injectable_compiler_1.InjectableCompiler(staticReflector, !!options.enableIvy), new ts_emitter_1.TypeScriptEmitter(), summaryResolver, symbolResolver);
        return { compiler: compiler, reflector: staticReflector };
    }
    exports.createAotCompiler = createAotCompiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9hb3QvY29tcGlsZXJfZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHVEQUF5QztJQUN6QyxtREFBc0U7SUFDdEUsbUZBQTREO0lBQzVELCtFQUF3RDtJQUN4RCx1RUFBaUQ7SUFDakQseUVBQW1EO0lBQ25ELGdGQUF3RDtJQUN4RCxpRkFBMEQ7SUFDMUQsNkVBQTZEO0lBQzdELDJFQUFvRDtJQUNwRCwrRUFBdUQ7SUFDdkQsK0VBQXVEO0lBQ3ZELHNFQUF1RDtJQUN2RCxxRUFBOEM7SUFDOUMsd0dBQStFO0lBQy9FLHVFQUFnRDtJQUNoRCx5RkFBa0U7SUFFbEUsbURBQW9DO0lBQ3BDLCtGQUF1RTtJQUN2RSxtRkFBNEQ7SUFFNUQsK0RBQXVDO0lBR3ZDLCtFQUFtRDtJQUNuRCx5RUFBZ0U7SUFDaEUsMkZBQThEO0lBQzlELCtFQUFzRDtJQUV0RCw4QkFBcUMsSUFFcEM7UUFDQyxNQUFNLENBQUM7WUFDTCxPQUFPLEVBQUUsVUFBQyxRQUFnQixFQUFFLEdBQVc7Z0JBQ3JDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzVELEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDZCxNQUFNLGtCQUFXLENBQUMsK0JBQTZCLEdBQUcsY0FBUyxRQUFVLENBQUMsQ0FBQztnQkFDekUsQ0FBQztnQkFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ2xCLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQztJQVpELG9EQVlDO0lBRUQ7O09BRUc7SUFDSCwyQkFDSSxZQUE2QixFQUFFLE9BQTJCLEVBQzFELGNBQ1E7UUFDVixJQUFJLFlBQVksR0FBVyxPQUFPLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztRQUV0RCxJQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2RCxJQUFNLFdBQVcsR0FBRyxJQUFJLGlDQUFpQixFQUFFLENBQUM7UUFDNUMsSUFBTSxlQUFlLEdBQUcsSUFBSSxxQ0FBa0IsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDMUUsSUFBTSxjQUFjLEdBQUcsSUFBSSw2Q0FBb0IsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzVGLElBQU0sZUFBZSxHQUNqQixJQUFJLGtDQUFlLENBQUMsZUFBZSxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2pGLElBQUksVUFBMEIsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEIseUVBQXlFO1lBQ3pFLFVBQVUsR0FBRyxJQUFJLHdCQUFVLEVBQW9CLENBQUM7UUFDbEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sVUFBVSxHQUFHLElBQUksaUNBQWMsQ0FDM0IsSUFBSSx3QkFBVSxFQUFFLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLHVCQUFjLENBQUM7WUFDaEMsb0JBQW9CLEVBQUUsd0JBQWlCLENBQUMsUUFBUTtZQUNoRCxNQUFNLEVBQUUsS0FBSztZQUNiLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxrQkFBa0I7WUFDOUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLG1CQUFtQjtZQUNoRCx5QkFBeUIsRUFBRSxPQUFPLENBQUMseUJBQXlCO1NBQzdELENBQUMsQ0FBQztRQUNILElBQU0sVUFBVSxHQUFHLElBQUksMENBQW1CLENBQ3RDLEVBQUMsR0FBRyxFQUFFLFVBQUMsR0FBVyxJQUFLLE9BQUEsWUFBWSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBOUIsQ0FBOEIsRUFBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0YsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLGFBQUssRUFBRSxDQUFDLENBQUM7UUFDakQsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLHNEQUF3QixFQUFFLENBQUM7UUFDN0QsSUFBTSxVQUFVLEdBQUcsSUFBSSxnQ0FBYyxDQUNqQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0YsSUFBTSxRQUFRLEdBQUcsSUFBSSwyQ0FBdUIsQ0FDeEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLHFDQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUN6RCxJQUFJLHNDQUFpQixDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksNEJBQVksQ0FBQyxlQUFlLENBQUMsRUFBRSxlQUFlLEVBQzFGLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5RixrREFBa0Q7UUFDbEQsSUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZELElBQU0saUJBQWlCLEdBQUcsSUFBSSx1Q0FBaUIsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDMUUsSUFBTSxRQUFRLEdBQUcsSUFBSSxzQkFBVyxDQUM1QixNQUFNLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFDcEUsSUFBSSw4QkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFDL0QsSUFBSSxxQ0FBZ0IsQ0FBQyxlQUFlLENBQUMsRUFDckMsSUFBSSx3Q0FBa0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLDhCQUFpQixFQUFFLEVBQ3JGLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsRUFBQyxRQUFRLFVBQUEsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFDLENBQUM7SUFDaEQsQ0FBQztJQS9DRCw4Q0ErQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge01pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge0RpcmVjdGl2ZU5vcm1hbGl6ZXJ9IGZyb20gJy4uL2RpcmVjdGl2ZV9ub3JtYWxpemVyJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXJ9IGZyb20gJy4uL2RpcmVjdGl2ZV9yZXNvbHZlcic7XG5pbXBvcnQge0xleGVyfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9sZXhlcic7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCB7STE4Tkh0bWxQYXJzZXJ9IGZyb20gJy4uL2kxOG4vaTE4bl9odG1sX3BhcnNlcic7XG5pbXBvcnQge0luamVjdGFibGVDb21waWxlcn0gZnJvbSAnLi4vaW5qZWN0YWJsZV9jb21waWxlcic7XG5pbXBvcnQge0NvbXBpbGVNZXRhZGF0YVJlc29sdmVyfSBmcm9tICcuLi9tZXRhZGF0YV9yZXNvbHZlcic7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge05nTW9kdWxlQ29tcGlsZXJ9IGZyb20gJy4uL25nX21vZHVsZV9jb21waWxlcic7XG5pbXBvcnQge05nTW9kdWxlUmVzb2x2ZXJ9IGZyb20gJy4uL25nX21vZHVsZV9yZXNvbHZlcic7XG5pbXBvcnQge1R5cGVTY3JpcHRFbWl0dGVyfSBmcm9tICcuLi9vdXRwdXQvdHNfZW1pdHRlcic7XG5pbXBvcnQge1BpcGVSZXNvbHZlcn0gZnJvbSAnLi4vcGlwZV9yZXNvbHZlcic7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge1N0eWxlQ29tcGlsZXJ9IGZyb20gJy4uL3N0eWxlX2NvbXBpbGVyJztcbmltcG9ydCB7VGVtcGxhdGVQYXJzZXJ9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9wYXJzZXInO1xuaW1wb3J0IHtVcmxSZXNvbHZlcn0gZnJvbSAnLi4vdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7c3ludGF4RXJyb3J9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHtUeXBlQ2hlY2tDb21waWxlcn0gZnJvbSAnLi4vdmlld19jb21waWxlci90eXBlX2NoZWNrX2NvbXBpbGVyJztcbmltcG9ydCB7Vmlld0NvbXBpbGVyfSBmcm9tICcuLi92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXInO1xuXG5pbXBvcnQge0FvdENvbXBpbGVyfSBmcm9tICcuL2NvbXBpbGVyJztcbmltcG9ydCB7QW90Q29tcGlsZXJIb3N0fSBmcm9tICcuL2NvbXBpbGVyX2hvc3QnO1xuaW1wb3J0IHtBb3RDb21waWxlck9wdGlvbnN9IGZyb20gJy4vY29tcGlsZXJfb3B0aW9ucyc7XG5pbXBvcnQge1N0YXRpY1JlZmxlY3Rvcn0gZnJvbSAnLi9zdGF0aWNfcmVmbGVjdG9yJztcbmltcG9ydCB7U3RhdGljU3ltYm9sLCBTdGF0aWNTeW1ib2xDYWNoZX0gZnJvbSAnLi9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7U3RhdGljU3ltYm9sUmVzb2x2ZXJ9IGZyb20gJy4vc3RhdGljX3N5bWJvbF9yZXNvbHZlcic7XG5pbXBvcnQge0FvdFN1bW1hcnlSZXNvbHZlcn0gZnJvbSAnLi9zdW1tYXJ5X3Jlc29sdmVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFvdFVybFJlc29sdmVyKGhvc3Q6IHtcbiAgcmVzb3VyY2VOYW1lVG9GaWxlTmFtZShyZXNvdXJjZU5hbWU6IHN0cmluZywgY29udGFpbmluZ0ZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xufSk6IFVybFJlc29sdmVyIHtcbiAgcmV0dXJuIHtcbiAgICByZXNvbHZlOiAoYmFzZVBhdGg6IHN0cmluZywgdXJsOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gaG9zdC5yZXNvdXJjZU5hbWVUb0ZpbGVOYW1lKHVybCwgYmFzZVBhdGgpO1xuICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICB0aHJvdyBzeW50YXhFcnJvcihgQ291bGRuJ3QgcmVzb2x2ZSByZXNvdXJjZSAke3VybH0gZnJvbSAke2Jhc2VQYXRofWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbGVQYXRoO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IEFvdENvbXBpbGVyIGJhc2VkIG9uIG9wdGlvbnMgYW5kIGEgaG9zdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFvdENvbXBpbGVyKFxuICAgIGNvbXBpbGVySG9zdDogQW90Q29tcGlsZXJIb3N0LCBvcHRpb25zOiBBb3RDb21waWxlck9wdGlvbnMsXG4gICAgZXJyb3JDb2xsZWN0b3I/OiAoZXJyb3I6IGFueSwgdHlwZT86IGFueSkgPT5cbiAgICAgICAgdm9pZCk6IHtjb21waWxlcjogQW90Q29tcGlsZXIsIHJlZmxlY3RvcjogU3RhdGljUmVmbGVjdG9yfSB7XG4gIGxldCB0cmFuc2xhdGlvbnM6IHN0cmluZyA9IG9wdGlvbnMudHJhbnNsYXRpb25zIHx8ICcnO1xuXG4gIGNvbnN0IHVybFJlc29sdmVyID0gY3JlYXRlQW90VXJsUmVzb2x2ZXIoY29tcGlsZXJIb3N0KTtcbiAgY29uc3Qgc3ltYm9sQ2FjaGUgPSBuZXcgU3RhdGljU3ltYm9sQ2FjaGUoKTtcbiAgY29uc3Qgc3VtbWFyeVJlc29sdmVyID0gbmV3IEFvdFN1bW1hcnlSZXNvbHZlcihjb21waWxlckhvc3QsIHN5bWJvbENhY2hlKTtcbiAgY29uc3Qgc3ltYm9sUmVzb2x2ZXIgPSBuZXcgU3RhdGljU3ltYm9sUmVzb2x2ZXIoY29tcGlsZXJIb3N0LCBzeW1ib2xDYWNoZSwgc3VtbWFyeVJlc29sdmVyKTtcbiAgY29uc3Qgc3RhdGljUmVmbGVjdG9yID1cbiAgICAgIG5ldyBTdGF0aWNSZWZsZWN0b3Ioc3VtbWFyeVJlc29sdmVyLCBzeW1ib2xSZXNvbHZlciwgW10sIFtdLCBlcnJvckNvbGxlY3Rvcik7XG4gIGxldCBodG1sUGFyc2VyOiBJMThOSHRtbFBhcnNlcjtcbiAgaWYgKCEhb3B0aW9ucy5lbmFibGVJdnkpIHtcbiAgICAvLyBJdnkgaGFuZGxlcyBpMThuIGF0IHRoZSBjb21waWxlciBsZXZlbCBzbyB3ZSBtdXN0IHVzZSBhIHJlZ3VsYXIgcGFyc2VyXG4gICAgaHRtbFBhcnNlciA9IG5ldyBIdG1sUGFyc2VyKCkgYXMgSTE4Tkh0bWxQYXJzZXI7XG4gIH0gZWxzZSB7XG4gICAgaHRtbFBhcnNlciA9IG5ldyBJMThOSHRtbFBhcnNlcihcbiAgICAgICAgbmV3IEh0bWxQYXJzZXIoKSwgdHJhbnNsYXRpb25zLCBvcHRpb25zLmkxOG5Gb3JtYXQsIG9wdGlvbnMubWlzc2luZ1RyYW5zbGF0aW9uLCBjb25zb2xlKTtcbiAgfVxuICBjb25zdCBjb25maWcgPSBuZXcgQ29tcGlsZXJDb25maWcoe1xuICAgIGRlZmF1bHRFbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCxcbiAgICB1c2VKaXQ6IGZhbHNlLFxuICAgIG1pc3NpbmdUcmFuc2xhdGlvbjogb3B0aW9ucy5taXNzaW5nVHJhbnNsYXRpb24sXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlczogb3B0aW9ucy5wcmVzZXJ2ZVdoaXRlc3BhY2VzLFxuICAgIHN0cmljdEluamVjdGlvblBhcmFtZXRlcnM6IG9wdGlvbnMuc3RyaWN0SW5qZWN0aW9uUGFyYW1ldGVycyxcbiAgfSk7XG4gIGNvbnN0IG5vcm1hbGl6ZXIgPSBuZXcgRGlyZWN0aXZlTm9ybWFsaXplcihcbiAgICAgIHtnZXQ6ICh1cmw6IHN0cmluZykgPT4gY29tcGlsZXJIb3N0LmxvYWRSZXNvdXJjZSh1cmwpfSwgdXJsUmVzb2x2ZXIsIGh0bWxQYXJzZXIsIGNvbmZpZyk7XG4gIGNvbnN0IGV4cHJlc3Npb25QYXJzZXIgPSBuZXcgUGFyc2VyKG5ldyBMZXhlcigpKTtcbiAgY29uc3QgZWxlbWVudFNjaGVtYVJlZ2lzdHJ5ID0gbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpO1xuICBjb25zdCB0bXBsUGFyc2VyID0gbmV3IFRlbXBsYXRlUGFyc2VyKFxuICAgICAgY29uZmlnLCBzdGF0aWNSZWZsZWN0b3IsIGV4cHJlc3Npb25QYXJzZXIsIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgaHRtbFBhcnNlciwgY29uc29sZSwgW10pO1xuICBjb25zdCByZXNvbHZlciA9IG5ldyBDb21waWxlTWV0YWRhdGFSZXNvbHZlcihcbiAgICAgIGNvbmZpZywgaHRtbFBhcnNlciwgbmV3IE5nTW9kdWxlUmVzb2x2ZXIoc3RhdGljUmVmbGVjdG9yKSxcbiAgICAgIG5ldyBEaXJlY3RpdmVSZXNvbHZlcihzdGF0aWNSZWZsZWN0b3IpLCBuZXcgUGlwZVJlc29sdmVyKHN0YXRpY1JlZmxlY3RvciksIHN1bW1hcnlSZXNvbHZlcixcbiAgICAgIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgbm9ybWFsaXplciwgY29uc29sZSwgc3ltYm9sQ2FjaGUsIHN0YXRpY1JlZmxlY3RvciwgZXJyb3JDb2xsZWN0b3IpO1xuICAvLyBUT0RPKHZpY2IpOiBkbyBub3QgcGFzcyBvcHRpb25zLmkxOG5Gb3JtYXQgaGVyZVxuICBjb25zdCB2aWV3Q29tcGlsZXIgPSBuZXcgVmlld0NvbXBpbGVyKHN0YXRpY1JlZmxlY3Rvcik7XG4gIGNvbnN0IHR5cGVDaGVja0NvbXBpbGVyID0gbmV3IFR5cGVDaGVja0NvbXBpbGVyKG9wdGlvbnMsIHN0YXRpY1JlZmxlY3Rvcik7XG4gIGNvbnN0IGNvbXBpbGVyID0gbmV3IEFvdENvbXBpbGVyKFxuICAgICAgY29uZmlnLCBvcHRpb25zLCBjb21waWxlckhvc3QsIHN0YXRpY1JlZmxlY3RvciwgcmVzb2x2ZXIsIHRtcGxQYXJzZXIsXG4gICAgICBuZXcgU3R5bGVDb21waWxlcih1cmxSZXNvbHZlciksIHZpZXdDb21waWxlciwgdHlwZUNoZWNrQ29tcGlsZXIsXG4gICAgICBuZXcgTmdNb2R1bGVDb21waWxlcihzdGF0aWNSZWZsZWN0b3IpLFxuICAgICAgbmV3IEluamVjdGFibGVDb21waWxlcihzdGF0aWNSZWZsZWN0b3IsICEhb3B0aW9ucy5lbmFibGVJdnkpLCBuZXcgVHlwZVNjcmlwdEVtaXR0ZXIoKSxcbiAgICAgIHN1bW1hcnlSZXNvbHZlciwgc3ltYm9sUmVzb2x2ZXIpO1xuICByZXR1cm4ge2NvbXBpbGVyLCByZWZsZWN0b3I6IHN0YXRpY1JlZmxlY3Rvcn07XG59XG4iXX0=