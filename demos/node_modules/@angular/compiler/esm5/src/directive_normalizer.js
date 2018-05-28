/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { CompileStylesheetMetadata, CompileTemplateMetadata, templateSourceUrl } from './compile_metadata';
import { preserveWhitespacesDefault } from './config';
import { ViewEncapsulation } from './core';
import * as html from './ml_parser/ast';
import { InterpolationConfig } from './ml_parser/interpolation_config';
import { extractStyleUrls, isStyleUrlResolvable } from './style_url_resolver';
import { PreparsedElementType, preparseElement } from './template_parser/template_preparser';
import { SyncAsync, isDefined, stringify, syntaxError } from './util';
var DirectiveNormalizer = /** @class */ (function () {
    function DirectiveNormalizer(_resourceLoader, _urlResolver, _htmlParser, _config) {
        this._resourceLoader = _resourceLoader;
        this._urlResolver = _urlResolver;
        this._htmlParser = _htmlParser;
        this._config = _config;
        this._resourceLoaderCache = new Map();
    }
    DirectiveNormalizer.prototype.clearCache = function () { this._resourceLoaderCache.clear(); };
    DirectiveNormalizer.prototype.clearCacheFor = function (normalizedDirective) {
        var _this = this;
        if (!normalizedDirective.isComponent) {
            return;
        }
        var template = normalizedDirective.template;
        this._resourceLoaderCache.delete(template.templateUrl);
        template.externalStylesheets.forEach(function (stylesheet) { _this._resourceLoaderCache.delete(stylesheet.moduleUrl); });
    };
    DirectiveNormalizer.prototype._fetch = function (url) {
        var result = this._resourceLoaderCache.get(url);
        if (!result) {
            result = this._resourceLoader.get(url);
            this._resourceLoaderCache.set(url, result);
        }
        return result;
    };
    DirectiveNormalizer.prototype.normalizeTemplate = function (prenormData) {
        var _this = this;
        if (isDefined(prenormData.template)) {
            if (isDefined(prenormData.templateUrl)) {
                throw syntaxError("'" + stringify(prenormData.componentType) + "' component cannot define both template and templateUrl");
            }
            if (typeof prenormData.template !== 'string') {
                throw syntaxError("The template specified for component " + stringify(prenormData.componentType) + " is not a string");
            }
        }
        else if (isDefined(prenormData.templateUrl)) {
            if (typeof prenormData.templateUrl !== 'string') {
                throw syntaxError("The templateUrl specified for component " + stringify(prenormData.componentType) + " is not a string");
            }
        }
        else {
            throw syntaxError("No template specified for component " + stringify(prenormData.componentType));
        }
        if (isDefined(prenormData.preserveWhitespaces) &&
            typeof prenormData.preserveWhitespaces !== 'boolean') {
            throw syntaxError("The preserveWhitespaces option for component " + stringify(prenormData.componentType) + " must be a boolean");
        }
        return SyncAsync.then(this._preParseTemplate(prenormData), function (preparsedTemplate) { return _this._normalizeTemplateMetadata(prenormData, preparsedTemplate); });
    };
    DirectiveNormalizer.prototype._preParseTemplate = function (prenomData) {
        var _this = this;
        var template;
        var templateUrl;
        if (prenomData.template != null) {
            template = prenomData.template;
            templateUrl = prenomData.moduleUrl;
        }
        else {
            templateUrl = this._urlResolver.resolve(prenomData.moduleUrl, prenomData.templateUrl);
            template = this._fetch(templateUrl);
        }
        return SyncAsync.then(template, function (template) { return _this._preparseLoadedTemplate(prenomData, template, templateUrl); });
    };
    DirectiveNormalizer.prototype._preparseLoadedTemplate = function (prenormData, template, templateAbsUrl) {
        var isInline = !!prenormData.template;
        var interpolationConfig = InterpolationConfig.fromArray(prenormData.interpolation);
        var rootNodesAndErrors = this._htmlParser.parse(template, templateSourceUrl({ reference: prenormData.ngModuleType }, { type: { reference: prenormData.componentType } }, { isInline: isInline, templateUrl: templateAbsUrl }), true, interpolationConfig);
        if (rootNodesAndErrors.errors.length > 0) {
            var errorString = rootNodesAndErrors.errors.join('\n');
            throw syntaxError("Template parse errors:\n" + errorString);
        }
        var templateMetadataStyles = this._normalizeStylesheet(new CompileStylesheetMetadata({ styles: prenormData.styles, moduleUrl: prenormData.moduleUrl }));
        var visitor = new TemplatePreparseVisitor();
        html.visitAll(visitor, rootNodesAndErrors.rootNodes);
        var templateStyles = this._normalizeStylesheet(new CompileStylesheetMetadata({ styles: visitor.styles, styleUrls: visitor.styleUrls, moduleUrl: templateAbsUrl }));
        var styles = templateMetadataStyles.styles.concat(templateStyles.styles);
        var inlineStyleUrls = templateMetadataStyles.styleUrls.concat(templateStyles.styleUrls);
        var styleUrls = this
            ._normalizeStylesheet(new CompileStylesheetMetadata({ styleUrls: prenormData.styleUrls, moduleUrl: prenormData.moduleUrl }))
            .styleUrls;
        return {
            template: template,
            templateUrl: templateAbsUrl, isInline: isInline,
            htmlAst: rootNodesAndErrors, styles: styles, inlineStyleUrls: inlineStyleUrls, styleUrls: styleUrls,
            ngContentSelectors: visitor.ngContentSelectors,
        };
    };
    DirectiveNormalizer.prototype._normalizeTemplateMetadata = function (prenormData, preparsedTemplate) {
        var _this = this;
        return SyncAsync.then(this._loadMissingExternalStylesheets(preparsedTemplate.styleUrls.concat(preparsedTemplate.inlineStyleUrls)), function (externalStylesheets) { return _this._normalizeLoadedTemplateMetadata(prenormData, preparsedTemplate, externalStylesheets); });
    };
    DirectiveNormalizer.prototype._normalizeLoadedTemplateMetadata = function (prenormData, preparsedTemplate, stylesheets) {
        // Algorithm:
        // - produce exactly 1 entry per original styleUrl in
        // CompileTemplateMetadata.externalStylesheets with all styles inlined
        // - inline all styles that are referenced by the template into CompileTemplateMetadata.styles.
        // Reason: be able to determine how many stylesheets there are even without loading
        // the template nor the stylesheets, so we can create a stub for TypeScript always synchronously
        // (as resource loading may be async)
        var _this = this;
        var styles = tslib_1.__spread(preparsedTemplate.styles);
        this._inlineStyles(preparsedTemplate.inlineStyleUrls, stylesheets, styles);
        var styleUrls = preparsedTemplate.styleUrls;
        var externalStylesheets = styleUrls.map(function (styleUrl) {
            var stylesheet = stylesheets.get(styleUrl);
            var styles = tslib_1.__spread(stylesheet.styles);
            _this._inlineStyles(stylesheet.styleUrls, stylesheets, styles);
            return new CompileStylesheetMetadata({ moduleUrl: styleUrl, styles: styles });
        });
        var encapsulation = prenormData.encapsulation;
        if (encapsulation == null) {
            encapsulation = this._config.defaultEncapsulation;
        }
        if (encapsulation === ViewEncapsulation.Emulated && styles.length === 0 &&
            styleUrls.length === 0) {
            encapsulation = ViewEncapsulation.None;
        }
        return new CompileTemplateMetadata({
            encapsulation: encapsulation,
            template: preparsedTemplate.template,
            templateUrl: preparsedTemplate.templateUrl,
            htmlAst: preparsedTemplate.htmlAst, styles: styles, styleUrls: styleUrls,
            ngContentSelectors: preparsedTemplate.ngContentSelectors,
            animations: prenormData.animations,
            interpolation: prenormData.interpolation,
            isInline: preparsedTemplate.isInline, externalStylesheets: externalStylesheets,
            preserveWhitespaces: preserveWhitespacesDefault(prenormData.preserveWhitespaces, this._config.preserveWhitespaces),
        });
    };
    DirectiveNormalizer.prototype._inlineStyles = function (styleUrls, stylesheets, targetStyles) {
        var _this = this;
        styleUrls.forEach(function (styleUrl) {
            var stylesheet = stylesheets.get(styleUrl);
            stylesheet.styles.forEach(function (style) { return targetStyles.push(style); });
            _this._inlineStyles(stylesheet.styleUrls, stylesheets, targetStyles);
        });
    };
    DirectiveNormalizer.prototype._loadMissingExternalStylesheets = function (styleUrls, loadedStylesheets) {
        var _this = this;
        if (loadedStylesheets === void 0) { loadedStylesheets = new Map(); }
        return SyncAsync.then(SyncAsync.all(styleUrls.filter(function (styleUrl) { return !loadedStylesheets.has(styleUrl); })
            .map(function (styleUrl) { return SyncAsync.then(_this._fetch(styleUrl), function (loadedStyle) {
            var stylesheet = _this._normalizeStylesheet(new CompileStylesheetMetadata({ styles: [loadedStyle], moduleUrl: styleUrl }));
            loadedStylesheets.set(styleUrl, stylesheet);
            return _this._loadMissingExternalStylesheets(stylesheet.styleUrls, loadedStylesheets);
        }); })), function (_) { return loadedStylesheets; });
    };
    DirectiveNormalizer.prototype._normalizeStylesheet = function (stylesheet) {
        var _this = this;
        var moduleUrl = stylesheet.moduleUrl;
        var allStyleUrls = stylesheet.styleUrls.filter(isStyleUrlResolvable)
            .map(function (url) { return _this._urlResolver.resolve(moduleUrl, url); });
        var allStyles = stylesheet.styles.map(function (style) {
            var styleWithImports = extractStyleUrls(_this._urlResolver, moduleUrl, style);
            allStyleUrls.push.apply(allStyleUrls, tslib_1.__spread(styleWithImports.styleUrls));
            return styleWithImports.style;
        });
        return new CompileStylesheetMetadata({ styles: allStyles, styleUrls: allStyleUrls, moduleUrl: moduleUrl });
    };
    return DirectiveNormalizer;
}());
export { DirectiveNormalizer };
var TemplatePreparseVisitor = /** @class */ (function () {
    function TemplatePreparseVisitor() {
        this.ngContentSelectors = [];
        this.styles = [];
        this.styleUrls = [];
        this.ngNonBindableStackCount = 0;
    }
    TemplatePreparseVisitor.prototype.visitElement = function (ast, context) {
        var preparsedElement = preparseElement(ast);
        switch (preparsedElement.type) {
            case PreparsedElementType.NG_CONTENT:
                if (this.ngNonBindableStackCount === 0) {
                    this.ngContentSelectors.push(preparsedElement.selectAttr);
                }
                break;
            case PreparsedElementType.STYLE:
                var textContent_1 = '';
                ast.children.forEach(function (child) {
                    if (child instanceof html.Text) {
                        textContent_1 += child.value;
                    }
                });
                this.styles.push(textContent_1);
                break;
            case PreparsedElementType.STYLESHEET:
                this.styleUrls.push(preparsedElement.hrefAttr);
                break;
            default:
                break;
        }
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount++;
        }
        html.visitAll(this, ast.children);
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount--;
        }
        return null;
    };
    TemplatePreparseVisitor.prototype.visitExpansion = function (ast, context) { html.visitAll(this, ast.cases); };
    TemplatePreparseVisitor.prototype.visitExpansionCase = function (ast, context) {
        html.visitAll(this, ast.expression);
    };
    TemplatePreparseVisitor.prototype.visitComment = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitAttribute = function (ast, context) { return null; };
    TemplatePreparseVisitor.prototype.visitText = function (ast, context) { return null; };
    return TemplatePreparseVisitor;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX25vcm1hbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvZGlyZWN0aXZlX25vcm1hbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBMkIseUJBQXlCLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNuSSxPQUFPLEVBQWlCLDBCQUEwQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3BFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUN6QyxPQUFPLEtBQUssSUFBSSxNQUFNLGlCQUFpQixDQUFDO0FBRXhDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBR3JFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzVFLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUUzRixPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBZ0JwRTtJQUdFLDZCQUNZLGVBQStCLEVBQVUsWUFBeUIsRUFDbEUsV0FBdUIsRUFBVSxPQUF1QjtRQUR4RCxvQkFBZSxHQUFmLGVBQWUsQ0FBZ0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBYTtRQUNsRSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBSjVELHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO0lBSUcsQ0FBQztJQUV4RSx3Q0FBVSxHQUFWLGNBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFekQs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XG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSwgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEsIHRlbXBsYXRlU291cmNlVXJsfSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlckNvbmZpZywgcHJlc2VydmVXaGl0ZXNwYWNlc0RlZmF1bHR9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vY29yZSc7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi9tbF9wYXJzZXIvaW50ZXJwb2xhdGlvbl9jb25maWcnO1xuaW1wb3J0IHtQYXJzZVRyZWVSZXN1bHQgYXMgSHRtbFBhcnNlVHJlZVJlc3VsdH0gZnJvbSAnLi9tbF9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCB7UmVzb3VyY2VMb2FkZXJ9IGZyb20gJy4vcmVzb3VyY2VfbG9hZGVyJztcbmltcG9ydCB7ZXh0cmFjdFN0eWxlVXJscywgaXNTdHlsZVVybFJlc29sdmFibGV9IGZyb20gJy4vc3R5bGVfdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7UHJlcGFyc2VkRWxlbWVudFR5cGUsIHByZXBhcnNlRWxlbWVudH0gZnJvbSAnLi90ZW1wbGF0ZV9wYXJzZXIvdGVtcGxhdGVfcHJlcGFyc2VyJztcbmltcG9ydCB7VXJsUmVzb2x2ZXJ9IGZyb20gJy4vdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7U3luY0FzeW5jLCBpc0RlZmluZWQsIHN0cmluZ2lmeSwgc3ludGF4RXJyb3J9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlbm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEge1xuICBuZ01vZHVsZVR5cGU6IGFueTtcbiAgY29tcG9uZW50VHlwZTogYW55O1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgdGVtcGxhdGU6IHN0cmluZ3xudWxsO1xuICB0ZW1wbGF0ZVVybDogc3RyaW5nfG51bGw7XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIGludGVycG9sYXRpb246IFtzdHJpbmcsIHN0cmluZ118bnVsbDtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb258bnVsbDtcbiAgYW5pbWF0aW9uczogYW55W107XG4gIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW58bnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZU5vcm1hbGl6ZXIge1xuICBwcml2YXRlIF9yZXNvdXJjZUxvYWRlckNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFN5bmNBc3luYzxzdHJpbmc+PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfcmVzb3VyY2VMb2FkZXI6IFJlc291cmNlTG9hZGVyLCBwcml2YXRlIF91cmxSZXNvbHZlcjogVXJsUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIF9odG1sUGFyc2VyOiBIdG1sUGFyc2VyLCBwcml2YXRlIF9jb25maWc6IENvbXBpbGVyQ29uZmlnKSB7fVxuXG4gIGNsZWFyQ2FjaGUoKTogdm9pZCB7IHRoaXMuX3Jlc291cmNlTG9hZGVyQ2FjaGUuY2xlYXIoKTsgfVxuXG4gIGNsZWFyQ2FjaGVGb3Iobm9ybWFsaXplZERpcmVjdGl2ZTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTogdm9pZCB7XG4gICAgaWYgKCFub3JtYWxpemVkRGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRlbXBsYXRlID0gbm9ybWFsaXplZERpcmVjdGl2ZS50ZW1wbGF0ZSAhO1xuICAgIHRoaXMuX3Jlc291cmNlTG9hZGVyQ2FjaGUuZGVsZXRlKHRlbXBsYXRlLnRlbXBsYXRlVXJsICEpO1xuICAgIHRlbXBsYXRlLmV4dGVybmFsU3R5bGVzaGVldHMuZm9yRWFjaChcbiAgICAgICAgKHN0eWxlc2hlZXQpID0+IHsgdGhpcy5fcmVzb3VyY2VMb2FkZXJDYWNoZS5kZWxldGUoc3R5bGVzaGVldC5tb2R1bGVVcmwgISk7IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmV0Y2godXJsOiBzdHJpbmcpOiBTeW5jQXN5bmM8c3RyaW5nPiB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuX3Jlc291cmNlTG9hZGVyQ2FjaGUuZ2V0KHVybCk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3Jlc291cmNlTG9hZGVyLmdldCh1cmwpO1xuICAgICAgdGhpcy5fcmVzb3VyY2VMb2FkZXJDYWNoZS5zZXQodXJsLCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgbm9ybWFsaXplVGVtcGxhdGUocHJlbm9ybURhdGE6IFByZW5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhKTpcbiAgICAgIFN5bmNBc3luYzxDb21waWxlVGVtcGxhdGVNZXRhZGF0YT4ge1xuICAgIGlmIChpc0RlZmluZWQocHJlbm9ybURhdGEudGVtcGxhdGUpKSB7XG4gICAgICBpZiAoaXNEZWZpbmVkKHByZW5vcm1EYXRhLnRlbXBsYXRlVXJsKSkge1xuICAgICAgICB0aHJvdyBzeW50YXhFcnJvcihcbiAgICAgICAgICAgIGAnJHtzdHJpbmdpZnkocHJlbm9ybURhdGEuY29tcG9uZW50VHlwZSl9JyBjb21wb25lbnQgY2Fubm90IGRlZmluZSBib3RoIHRlbXBsYXRlIGFuZCB0ZW1wbGF0ZVVybGApO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwcmVub3JtRGF0YS50ZW1wbGF0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICBgVGhlIHRlbXBsYXRlIHNwZWNpZmllZCBmb3IgY29tcG9uZW50ICR7c3RyaW5naWZ5KHByZW5vcm1EYXRhLmNvbXBvbmVudFR5cGUpfSBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRGVmaW5lZChwcmVub3JtRGF0YS50ZW1wbGF0ZVVybCkpIHtcbiAgICAgIGlmICh0eXBlb2YgcHJlbm9ybURhdGEudGVtcGxhdGVVcmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IHN5bnRheEVycm9yKFxuICAgICAgICAgICAgYFRoZSB0ZW1wbGF0ZVVybCBzcGVjaWZpZWQgZm9yIGNvbXBvbmVudCAke3N0cmluZ2lmeShwcmVub3JtRGF0YS5jb21wb25lbnRUeXBlKX0gaXMgbm90IGEgc3RyaW5nYCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHN5bnRheEVycm9yKFxuICAgICAgICAgIGBObyB0ZW1wbGF0ZSBzcGVjaWZpZWQgZm9yIGNvbXBvbmVudCAke3N0cmluZ2lmeShwcmVub3JtRGF0YS5jb21wb25lbnRUeXBlKX1gKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEZWZpbmVkKHByZW5vcm1EYXRhLnByZXNlcnZlV2hpdGVzcGFjZXMpICYmXG4gICAgICAgIHR5cGVvZiBwcmVub3JtRGF0YS5wcmVzZXJ2ZVdoaXRlc3BhY2VzICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHRocm93IHN5bnRheEVycm9yKFxuICAgICAgICAgIGBUaGUgcHJlc2VydmVXaGl0ZXNwYWNlcyBvcHRpb24gZm9yIGNvbXBvbmVudCAke3N0cmluZ2lmeShwcmVub3JtRGF0YS5jb21wb25lbnRUeXBlKX0gbXVzdCBiZSBhIGJvb2xlYW5gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gU3luY0FzeW5jLnRoZW4oXG4gICAgICAgIHRoaXMuX3ByZVBhcnNlVGVtcGxhdGUocHJlbm9ybURhdGEpLFxuICAgICAgICAocHJlcGFyc2VkVGVtcGxhdGUpID0+IHRoaXMuX25vcm1hbGl6ZVRlbXBsYXRlTWV0YWRhdGEocHJlbm9ybURhdGEsIHByZXBhcnNlZFRlbXBsYXRlKSk7XG4gIH1cblxuICBwcml2YXRlIF9wcmVQYXJzZVRlbXBsYXRlKHByZW5vbURhdGE6IFByZW5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhKTpcbiAgICAgIFN5bmNBc3luYzxQcmVwYXJzZWRUZW1wbGF0ZT4ge1xuICAgIGxldCB0ZW1wbGF0ZTogU3luY0FzeW5jPHN0cmluZz47XG4gICAgbGV0IHRlbXBsYXRlVXJsOiBzdHJpbmc7XG4gICAgaWYgKHByZW5vbURhdGEudGVtcGxhdGUgIT0gbnVsbCkge1xuICAgICAgdGVtcGxhdGUgPSBwcmVub21EYXRhLnRlbXBsYXRlO1xuICAgICAgdGVtcGxhdGVVcmwgPSBwcmVub21EYXRhLm1vZHVsZVVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVtcGxhdGVVcmwgPSB0aGlzLl91cmxSZXNvbHZlci5yZXNvbHZlKHByZW5vbURhdGEubW9kdWxlVXJsLCBwcmVub21EYXRhLnRlbXBsYXRlVXJsICEpO1xuICAgICAgdGVtcGxhdGUgPSB0aGlzLl9mZXRjaCh0ZW1wbGF0ZVVybCk7XG4gICAgfVxuICAgIHJldHVybiBTeW5jQXN5bmMudGhlbihcbiAgICAgICAgdGVtcGxhdGUsICh0ZW1wbGF0ZSkgPT4gdGhpcy5fcHJlcGFyc2VMb2FkZWRUZW1wbGF0ZShwcmVub21EYXRhLCB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3ByZXBhcnNlTG9hZGVkVGVtcGxhdGUoXG4gICAgICBwcmVub3JtRGF0YTogUHJlbm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEsIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgICB0ZW1wbGF0ZUFic1VybDogc3RyaW5nKTogUHJlcGFyc2VkVGVtcGxhdGUge1xuICAgIGNvbnN0IGlzSW5saW5lID0gISFwcmVub3JtRGF0YS50ZW1wbGF0ZTtcbiAgICBjb25zdCBpbnRlcnBvbGF0aW9uQ29uZmlnID0gSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkocHJlbm9ybURhdGEuaW50ZXJwb2xhdGlvbiAhKTtcbiAgICBjb25zdCByb290Tm9kZXNBbmRFcnJvcnMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKFxuICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgdGVtcGxhdGVTb3VyY2VVcmwoXG4gICAgICAgICAgICB7cmVmZXJlbmNlOiBwcmVub3JtRGF0YS5uZ01vZHVsZVR5cGV9LCB7dHlwZToge3JlZmVyZW5jZTogcHJlbm9ybURhdGEuY29tcG9uZW50VHlwZX19LFxuICAgICAgICAgICAge2lzSW5saW5lLCB0ZW1wbGF0ZVVybDogdGVtcGxhdGVBYnNVcmx9KSxcbiAgICAgICAgdHJ1ZSwgaW50ZXJwb2xhdGlvbkNvbmZpZyk7XG4gICAgaWYgKHJvb3ROb2Rlc0FuZEVycm9ycy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZXJyb3JTdHJpbmcgPSByb290Tm9kZXNBbmRFcnJvcnMuZXJyb3JzLmpvaW4oJ1xcbicpO1xuICAgICAgdGhyb3cgc3ludGF4RXJyb3IoYFRlbXBsYXRlIHBhcnNlIGVycm9yczpcXG4ke2Vycm9yU3RyaW5nfWApO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlTWV0YWRhdGFTdHlsZXMgPSB0aGlzLl9ub3JtYWxpemVTdHlsZXNoZWV0KG5ldyBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhKFxuICAgICAgICB7c3R5bGVzOiBwcmVub3JtRGF0YS5zdHlsZXMsIG1vZHVsZVVybDogcHJlbm9ybURhdGEubW9kdWxlVXJsfSkpO1xuXG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBUZW1wbGF0ZVByZXBhcnNlVmlzaXRvcigpO1xuICAgIGh0bWwudmlzaXRBbGwodmlzaXRvciwgcm9vdE5vZGVzQW5kRXJyb3JzLnJvb3ROb2Rlcyk7XG4gICAgY29uc3QgdGVtcGxhdGVTdHlsZXMgPSB0aGlzLl9ub3JtYWxpemVTdHlsZXNoZWV0KG5ldyBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhKFxuICAgICAgICB7c3R5bGVzOiB2aXNpdG9yLnN0eWxlcywgc3R5bGVVcmxzOiB2aXNpdG9yLnN0eWxlVXJscywgbW9kdWxlVXJsOiB0ZW1wbGF0ZUFic1VybH0pKTtcblxuICAgIGNvbnN0IHN0eWxlcyA9IHRlbXBsYXRlTWV0YWRhdGFTdHlsZXMuc3R5bGVzLmNvbmNhdCh0ZW1wbGF0ZVN0eWxlcy5zdHlsZXMpO1xuXG4gICAgY29uc3QgaW5saW5lU3R5bGVVcmxzID0gdGVtcGxhdGVNZXRhZGF0YVN0eWxlcy5zdHlsZVVybHMuY29uY2F0KHRlbXBsYXRlU3R5bGVzLnN0eWxlVXJscyk7XG4gICAgY29uc3Qgc3R5bGVVcmxzID0gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAuX25vcm1hbGl6ZVN0eWxlc2hlZXQobmV3IENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3R5bGVVcmxzOiBwcmVub3JtRGF0YS5zdHlsZVVybHMsIG1vZHVsZVVybDogcHJlbm9ybURhdGEubW9kdWxlVXJsfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZVVybHM7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlLFxuICAgICAgdGVtcGxhdGVVcmw6IHRlbXBsYXRlQWJzVXJsLCBpc0lubGluZSxcbiAgICAgIGh0bWxBc3Q6IHJvb3ROb2Rlc0FuZEVycm9ycywgc3R5bGVzLCBpbmxpbmVTdHlsZVVybHMsIHN0eWxlVXJscyxcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogdmlzaXRvci5uZ0NvbnRlbnRTZWxlY3RvcnMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX25vcm1hbGl6ZVRlbXBsYXRlTWV0YWRhdGEoXG4gICAgICBwcmVub3JtRGF0YTogUHJlbm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEsXG4gICAgICBwcmVwYXJzZWRUZW1wbGF0ZTogUHJlcGFyc2VkVGVtcGxhdGUpOiBTeW5jQXN5bmM8Q29tcGlsZVRlbXBsYXRlTWV0YWRhdGE+IHtcbiAgICByZXR1cm4gU3luY0FzeW5jLnRoZW4oXG4gICAgICAgIHRoaXMuX2xvYWRNaXNzaW5nRXh0ZXJuYWxTdHlsZXNoZWV0cyhcbiAgICAgICAgICAgIHByZXBhcnNlZFRlbXBsYXRlLnN0eWxlVXJscy5jb25jYXQocHJlcGFyc2VkVGVtcGxhdGUuaW5saW5lU3R5bGVVcmxzKSksXG4gICAgICAgIChleHRlcm5hbFN0eWxlc2hlZXRzKSA9PiB0aGlzLl9ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZU1ldGFkYXRhKFxuICAgICAgICAgICAgcHJlbm9ybURhdGEsIHByZXBhcnNlZFRlbXBsYXRlLCBleHRlcm5hbFN0eWxlc2hlZXRzKSk7XG4gIH1cblxuICBwcml2YXRlIF9ub3JtYWxpemVMb2FkZWRUZW1wbGF0ZU1ldGFkYXRhKFxuICAgICAgcHJlbm9ybURhdGE6IFByZW5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhLCBwcmVwYXJzZWRUZW1wbGF0ZTogUHJlcGFyc2VkVGVtcGxhdGUsXG4gICAgICBzdHlsZXNoZWV0czogTWFwPHN0cmluZywgQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YT4pOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gICAgLy8gQWxnb3JpdGhtOlxuICAgIC8vIC0gcHJvZHVjZSBleGFjdGx5IDEgZW50cnkgcGVyIG9yaWdpbmFsIHN0eWxlVXJsIGluXG4gICAgLy8gQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEuZXh0ZXJuYWxTdHlsZXNoZWV0cyB3aXRoIGFsbCBzdHlsZXMgaW5saW5lZFxuICAgIC8vIC0gaW5saW5lIGFsbCBzdHlsZXMgdGhhdCBhcmUgcmVmZXJlbmNlZCBieSB0aGUgdGVtcGxhdGUgaW50byBDb21waWxlVGVtcGxhdGVNZXRhZGF0YS5zdHlsZXMuXG4gICAgLy8gUmVhc29uOiBiZSBhYmxlIHRvIGRldGVybWluZSBob3cgbWFueSBzdHlsZXNoZWV0cyB0aGVyZSBhcmUgZXZlbiB3aXRob3V0IGxvYWRpbmdcbiAgICAvLyB0aGUgdGVtcGxhdGUgbm9yIHRoZSBzdHlsZXNoZWV0cywgc28gd2UgY2FuIGNyZWF0ZSBhIHN0dWIgZm9yIFR5cGVTY3JpcHQgYWx3YXlzIHN5bmNocm9ub3VzbHlcbiAgICAvLyAoYXMgcmVzb3VyY2UgbG9hZGluZyBtYXkgYmUgYXN5bmMpXG5cbiAgICBjb25zdCBzdHlsZXMgPSBbLi4ucHJlcGFyc2VkVGVtcGxhdGUuc3R5bGVzXTtcbiAgICB0aGlzLl9pbmxpbmVTdHlsZXMocHJlcGFyc2VkVGVtcGxhdGUuaW5saW5lU3R5bGVVcmxzLCBzdHlsZXNoZWV0cywgc3R5bGVzKTtcbiAgICBjb25zdCBzdHlsZVVybHMgPSBwcmVwYXJzZWRUZW1wbGF0ZS5zdHlsZVVybHM7XG5cbiAgICBjb25zdCBleHRlcm5hbFN0eWxlc2hlZXRzID0gc3R5bGVVcmxzLm1hcChzdHlsZVVybCA9PiB7XG4gICAgICBjb25zdCBzdHlsZXNoZWV0ID0gc3R5bGVzaGVldHMuZ2V0KHN0eWxlVXJsKSAhO1xuICAgICAgY29uc3Qgc3R5bGVzID0gWy4uLnN0eWxlc2hlZXQuc3R5bGVzXTtcbiAgICAgIHRoaXMuX2lubGluZVN0eWxlcyhzdHlsZXNoZWV0LnN0eWxlVXJscywgc3R5bGVzaGVldHMsIHN0eWxlcyk7XG4gICAgICByZXR1cm4gbmV3IENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGEoe21vZHVsZVVybDogc3R5bGVVcmwsIHN0eWxlczogc3R5bGVzfSk7XG4gICAgfSk7XG5cbiAgICBsZXQgZW5jYXBzdWxhdGlvbiA9IHByZW5vcm1EYXRhLmVuY2Fwc3VsYXRpb247XG4gICAgaWYgKGVuY2Fwc3VsYXRpb24gPT0gbnVsbCkge1xuICAgICAgZW5jYXBzdWxhdGlvbiA9IHRoaXMuX2NvbmZpZy5kZWZhdWx0RW5jYXBzdWxhdGlvbjtcbiAgICB9XG4gICAgaWYgKGVuY2Fwc3VsYXRpb24gPT09IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkICYmIHN0eWxlcy5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgc3R5bGVVcmxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZW5jYXBzdWxhdGlvbiA9IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoe1xuICAgICAgZW5jYXBzdWxhdGlvbixcbiAgICAgIHRlbXBsYXRlOiBwcmVwYXJzZWRUZW1wbGF0ZS50ZW1wbGF0ZSxcbiAgICAgIHRlbXBsYXRlVXJsOiBwcmVwYXJzZWRUZW1wbGF0ZS50ZW1wbGF0ZVVybCxcbiAgICAgIGh0bWxBc3Q6IHByZXBhcnNlZFRlbXBsYXRlLmh0bWxBc3QsIHN0eWxlcywgc3R5bGVVcmxzLFxuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBwcmVwYXJzZWRUZW1wbGF0ZS5uZ0NvbnRlbnRTZWxlY3RvcnMsXG4gICAgICBhbmltYXRpb25zOiBwcmVub3JtRGF0YS5hbmltYXRpb25zLFxuICAgICAgaW50ZXJwb2xhdGlvbjogcHJlbm9ybURhdGEuaW50ZXJwb2xhdGlvbixcbiAgICAgIGlzSW5saW5lOiBwcmVwYXJzZWRUZW1wbGF0ZS5pc0lubGluZSwgZXh0ZXJuYWxTdHlsZXNoZWV0cyxcbiAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXM6IHByZXNlcnZlV2hpdGVzcGFjZXNEZWZhdWx0KFxuICAgICAgICAgIHByZW5vcm1EYXRhLnByZXNlcnZlV2hpdGVzcGFjZXMsIHRoaXMuX2NvbmZpZy5wcmVzZXJ2ZVdoaXRlc3BhY2VzKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2lubGluZVN0eWxlcyhcbiAgICAgIHN0eWxlVXJsczogc3RyaW5nW10sIHN0eWxlc2hlZXRzOiBNYXA8c3RyaW5nLCBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhPixcbiAgICAgIHRhcmdldFN0eWxlczogc3RyaW5nW10pIHtcbiAgICBzdHlsZVVybHMuZm9yRWFjaChzdHlsZVVybCA9PiB7XG4gICAgICBjb25zdCBzdHlsZXNoZWV0ID0gc3R5bGVzaGVldHMuZ2V0KHN0eWxlVXJsKSAhO1xuICAgICAgc3R5bGVzaGVldC5zdHlsZXMuZm9yRWFjaChzdHlsZSA9PiB0YXJnZXRTdHlsZXMucHVzaChzdHlsZSkpO1xuICAgICAgdGhpcy5faW5saW5lU3R5bGVzKHN0eWxlc2hlZXQuc3R5bGVVcmxzLCBzdHlsZXNoZWV0cywgdGFyZ2V0U3R5bGVzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRNaXNzaW5nRXh0ZXJuYWxTdHlsZXNoZWV0cyhcbiAgICAgIHN0eWxlVXJsczogc3RyaW5nW10sXG4gICAgICBsb2FkZWRTdHlsZXNoZWV0czpcbiAgICAgICAgICBNYXA8c3RyaW5nLCBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhPiA9IG5ldyBNYXA8c3RyaW5nLCBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhPigpKTpcbiAgICAgIFN5bmNBc3luYzxNYXA8c3RyaW5nLCBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhPj4ge1xuICAgIHJldHVybiBTeW5jQXN5bmMudGhlbihcbiAgICAgICAgU3luY0FzeW5jLmFsbChzdHlsZVVybHMuZmlsdGVyKChzdHlsZVVybCkgPT4gIWxvYWRlZFN0eWxlc2hlZXRzLmhhcyhzdHlsZVVybCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZVVybCA9PiBTeW5jQXN5bmMudGhlbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9mZXRjaChzdHlsZVVybCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGxvYWRlZFN0eWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHlsZXNoZWV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ub3JtYWxpemVTdHlsZXNoZWV0KG5ldyBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3R5bGVzOiBbbG9hZGVkU3R5bGVdLCBtb2R1bGVVcmw6IHN0eWxlVXJsfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVkU3R5bGVzaGVldHMuc2V0KHN0eWxlVXJsLCBzdHlsZXNoZWV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2FkTWlzc2luZ0V4dGVybmFsU3R5bGVzaGVldHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzaGVldC5zdHlsZVVybHMsIGxvYWRlZFN0eWxlc2hlZXRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkpLFxuICAgICAgICAoXykgPT4gbG9hZGVkU3R5bGVzaGVldHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm9ybWFsaXplU3R5bGVzaGVldChzdHlsZXNoZWV0OiBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhKTogQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSB7XG4gICAgY29uc3QgbW9kdWxlVXJsID0gc3R5bGVzaGVldC5tb2R1bGVVcmwgITtcbiAgICBjb25zdCBhbGxTdHlsZVVybHMgPSBzdHlsZXNoZWV0LnN0eWxlVXJscy5maWx0ZXIoaXNTdHlsZVVybFJlc29sdmFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAodXJsID0+IHRoaXMuX3VybFJlc29sdmVyLnJlc29sdmUobW9kdWxlVXJsLCB1cmwpKTtcblxuICAgIGNvbnN0IGFsbFN0eWxlcyA9IHN0eWxlc2hlZXQuc3R5bGVzLm1hcChzdHlsZSA9PiB7XG4gICAgICBjb25zdCBzdHlsZVdpdGhJbXBvcnRzID0gZXh0cmFjdFN0eWxlVXJscyh0aGlzLl91cmxSZXNvbHZlciwgbW9kdWxlVXJsLCBzdHlsZSk7XG4gICAgICBhbGxTdHlsZVVybHMucHVzaCguLi5zdHlsZVdpdGhJbXBvcnRzLnN0eWxlVXJscyk7XG4gICAgICByZXR1cm4gc3R5bGVXaXRoSW1wb3J0cy5zdHlsZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YShcbiAgICAgICAge3N0eWxlczogYWxsU3R5bGVzLCBzdHlsZVVybHM6IGFsbFN0eWxlVXJscywgbW9kdWxlVXJsOiBtb2R1bGVVcmx9KTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgUHJlcGFyc2VkVGVtcGxhdGUge1xuICB0ZW1wbGF0ZTogc3RyaW5nO1xuICB0ZW1wbGF0ZVVybDogc3RyaW5nO1xuICBpc0lubGluZTogYm9vbGVhbjtcbiAgaHRtbEFzdDogSHRtbFBhcnNlVHJlZVJlc3VsdDtcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgaW5saW5lU3R5bGVVcmxzOiBzdHJpbmdbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbn1cblxuY2xhc3MgVGVtcGxhdGVQcmVwYXJzZVZpc2l0b3IgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdID0gW107XG4gIHN0eWxlczogc3RyaW5nW10gPSBbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXSA9IFtdO1xuICBuZ05vbkJpbmRhYmxlU3RhY2tDb3VudDogbnVtYmVyID0gMDtcblxuICB2aXNpdEVsZW1lbnQoYXN0OiBodG1sLkVsZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgY29uc3QgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIHN3aXRjaCAocHJlcGFyc2VkRWxlbWVudC50eXBlKSB7XG4gICAgICBjYXNlIFByZXBhcnNlZEVsZW1lbnRUeXBlLk5HX0NPTlRFTlQ6XG4gICAgICAgIGlmICh0aGlzLm5nTm9uQmluZGFibGVTdGFja0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMucHVzaChwcmVwYXJzZWRFbGVtZW50LnNlbGVjdEF0dHIpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRTpcbiAgICAgICAgbGV0IHRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIGFzdC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBodG1sLlRleHQpIHtcbiAgICAgICAgICAgIHRleHRDb250ZW50ICs9IGNoaWxkLnZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3R5bGVzLnB1c2godGV4dENvbnRlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVDpcbiAgICAgICAgdGhpcy5zdHlsZVVybHMucHVzaChwcmVwYXJzZWRFbGVtZW50LmhyZWZBdHRyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUpIHtcbiAgICAgIHRoaXMubmdOb25CaW5kYWJsZVN0YWNrQ291bnQrKztcbiAgICB9XG4gICAgaHRtbC52aXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4pO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50Lm5vbkJpbmRhYmxlKSB7XG4gICAgICB0aGlzLm5nTm9uQmluZGFibGVTdGFja0NvdW50LS07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oYXN0OiBodG1sLkV4cGFuc2lvbiwgY29udGV4dDogYW55KTogYW55IHsgaHRtbC52aXNpdEFsbCh0aGlzLCBhc3QuY2FzZXMpOyB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGFzdDogaHRtbC5FeHBhbnNpb25DYXNlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGh0bWwudmlzaXRBbGwodGhpcywgYXN0LmV4cHJlc3Npb24pO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGFzdDogaHRtbC5Db21tZW50LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdEF0dHJpYnV0ZShhc3Q6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdFRleHQoYXN0OiBodG1sLlRleHQsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG4iXX0=