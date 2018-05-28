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
        define("@angular/compiler/src/directive_resolver", ["require", "exports", "tslib", "@angular/compiler/src/core", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var core_1 = require("@angular/compiler/src/core");
    var util_1 = require("@angular/compiler/src/util");
    var QUERY_METADATA_IDENTIFIERS = [
        core_1.createViewChild,
        core_1.createViewChildren,
        core_1.createContentChild,
        core_1.createContentChildren,
    ];
    /*
     * Resolve a `Type` for {@link Directive}.
     *
     * This interface can be overridden by the application developer to create custom behavior.
     *
     * See {@link Compiler}
     */
    var DirectiveResolver = /** @class */ (function () {
        function DirectiveResolver(_reflector) {
            this._reflector = _reflector;
        }
        DirectiveResolver.prototype.isDirective = function (type) {
            var typeMetadata = this._reflector.annotations(util_1.resolveForwardRef(type));
            return typeMetadata && typeMetadata.some(isDirectiveMetadata);
        };
        DirectiveResolver.prototype.resolve = function (type, throwIfNotFound) {
            if (throwIfNotFound === void 0) { throwIfNotFound = true; }
            var typeMetadata = this._reflector.annotations(util_1.resolveForwardRef(type));
            if (typeMetadata) {
                var metadata = findLast(typeMetadata, isDirectiveMetadata);
                if (metadata) {
                    var propertyMetadata = this._reflector.propMetadata(type);
                    var guards = this._reflector.guards(type);
                    return this._mergeWithPropertyMetadata(metadata, propertyMetadata, guards, type);
                }
            }
            if (throwIfNotFound) {
                throw new Error("No Directive annotation found on " + util_1.stringify(type));
            }
            return null;
        };
        DirectiveResolver.prototype._mergeWithPropertyMetadata = function (dm, propertyMetadata, guards, directiveType) {
            var inputs = [];
            var outputs = [];
            var host = {};
            var queries = {};
            Object.keys(propertyMetadata).forEach(function (propName) {
                var input = findLast(propertyMetadata[propName], function (a) { return core_1.createInput.isTypeOf(a); });
                if (input) {
                    if (input.bindingPropertyName) {
                        inputs.push(propName + ": " + input.bindingPropertyName);
                    }
                    else {
                        inputs.push(propName);
                    }
                }
                var output = findLast(propertyMetadata[propName], function (a) { return core_1.createOutput.isTypeOf(a); });
                if (output) {
                    if (output.bindingPropertyName) {
                        outputs.push(propName + ": " + output.bindingPropertyName);
                    }
                    else {
                        outputs.push(propName);
                    }
                }
                var hostBindings = propertyMetadata[propName].filter(function (a) { return core_1.createHostBinding.isTypeOf(a); });
                hostBindings.forEach(function (hostBinding) {
                    if (hostBinding.hostPropertyName) {
                        var startWith = hostBinding.hostPropertyName[0];
                        if (startWith === '(') {
                            throw new Error("@HostBinding can not bind to events. Use @HostListener instead.");
                        }
                        else if (startWith === '[') {
                            throw new Error("@HostBinding parameter should be a property name, 'class.<name>', or 'attr.<name>'.");
                        }
                        host["[" + hostBinding.hostPropertyName + "]"] = propName;
                    }
                    else {
                        host["[" + propName + "]"] = propName;
                    }
                });
                var hostListeners = propertyMetadata[propName].filter(function (a) { return core_1.createHostListener.isTypeOf(a); });
                hostListeners.forEach(function (hostListener) {
                    var args = hostListener.args || [];
                    host["(" + hostListener.eventName + ")"] = propName + "(" + args.join(',') + ")";
                });
                var query = findLast(propertyMetadata[propName], function (a) { return QUERY_METADATA_IDENTIFIERS.some(function (i) { return i.isTypeOf(a); }); });
                if (query) {
                    queries[propName] = query;
                }
            });
            return this._merge(dm, inputs, outputs, host, queries, guards, directiveType);
        };
        DirectiveResolver.prototype._extractPublicName = function (def) { return util_1.splitAtColon(def, [null, def])[1].trim(); };
        DirectiveResolver.prototype._dedupeBindings = function (bindings) {
            var names = new Set();
            var publicNames = new Set();
            var reversedResult = [];
            // go last to first to allow later entries to overwrite previous entries
            for (var i = bindings.length - 1; i >= 0; i--) {
                var binding = bindings[i];
                var name_1 = this._extractPublicName(binding);
                publicNames.add(name_1);
                if (!names.has(name_1)) {
                    names.add(name_1);
                    reversedResult.push(binding);
                }
            }
            return reversedResult.reverse();
        };
        DirectiveResolver.prototype._merge = function (directive, inputs, outputs, host, queries, guards, directiveType) {
            var mergedInputs = this._dedupeBindings(directive.inputs ? directive.inputs.concat(inputs) : inputs);
            var mergedOutputs = this._dedupeBindings(directive.outputs ? directive.outputs.concat(outputs) : outputs);
            var mergedHost = directive.host ? tslib_1.__assign({}, directive.host, host) : host;
            var mergedQueries = directive.queries ? tslib_1.__assign({}, directive.queries, queries) : queries;
            if (core_1.createComponent.isTypeOf(directive)) {
                var comp = directive;
                return core_1.createComponent({
                    selector: comp.selector,
                    inputs: mergedInputs,
                    outputs: mergedOutputs,
                    host: mergedHost,
                    exportAs: comp.exportAs,
                    moduleId: comp.moduleId,
                    queries: mergedQueries,
                    changeDetection: comp.changeDetection,
                    providers: comp.providers,
                    viewProviders: comp.viewProviders,
                    entryComponents: comp.entryComponents,
                    template: comp.template,
                    templateUrl: comp.templateUrl,
                    styles: comp.styles,
                    styleUrls: comp.styleUrls,
                    encapsulation: comp.encapsulation,
                    animations: comp.animations,
                    interpolation: comp.interpolation,
                    preserveWhitespaces: directive.preserveWhitespaces,
                });
            }
            else {
                return core_1.createDirective({
                    selector: directive.selector,
                    inputs: mergedInputs,
                    outputs: mergedOutputs,
                    host: mergedHost,
                    exportAs: directive.exportAs,
                    queries: mergedQueries,
                    providers: directive.providers, guards: guards
                });
            }
        };
        return DirectiveResolver;
    }());
    exports.DirectiveResolver = DirectiveResolver;
    function isDirectiveMetadata(type) {
        return core_1.createDirective.isTypeOf(type) || core_1.createComponent.isTypeOf(type);
    }
    function findLast(arr, condition) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (condition(arr[i])) {
                return arr[i];
            }
        }
        return null;
    }
    exports.findLast = findLast;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2RpcmVjdGl2ZV9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCxtREFBc087SUFDdE8sbURBQWtFO0lBRWxFLElBQU0sMEJBQTBCLEdBQUc7UUFDakMsc0JBQWU7UUFDZix5QkFBa0I7UUFDbEIseUJBQWtCO1FBQ2xCLDRCQUFxQjtLQUN0QixDQUFDO0lBRUY7Ozs7OztPQU1HO0lBQ0g7UUFDRSwyQkFBb0IsVUFBNEI7WUFBNUIsZUFBVSxHQUFWLFVBQVUsQ0FBa0I7UUFBRyxDQUFDO1FBRXBELHVDQUFXLEdBQVgsVUFBWSxJQUFVO1lBQ3BCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLHdCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDaEUsQ0FBQztRQVFELG1DQUFPLEdBQVAsVUFBUSxJQUFVLEVBQUUsZUFBc0I7WUFBdEIsZ0NBQUEsRUFBQSxzQkFBc0I7WUFDeEMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsd0JBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0JBQzdELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2IsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDNUQsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbkYsQ0FBQztZQUNILENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFvQyxnQkFBUyxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7WUFDekUsQ0FBQztZQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRU8sc0RBQTBCLEdBQWxDLFVBQ0ksRUFBYSxFQUFFLGdCQUF3QyxFQUFFLE1BQTRCLEVBQ3JGLGFBQW1CO1lBQ3JCLElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztZQUM1QixJQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFDN0IsSUFBTSxJQUFJLEdBQTRCLEVBQUUsQ0FBQztZQUN6QyxJQUFNLE9BQU8sR0FBeUIsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFnQjtnQkFDckQsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsa0JBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztnQkFDbkYsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDVixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO3dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFJLFFBQVEsVUFBSyxLQUFLLENBQUMsbUJBQXFCLENBQUMsQ0FBQztvQkFDM0QsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN4QixDQUFDO2dCQUNILENBQUM7Z0JBQ0QsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsbUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQztnQkFDckYsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDWCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFJLFFBQVEsVUFBSyxNQUFNLENBQUMsbUJBQXFCLENBQUMsQ0FBQztvQkFDN0QsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN6QixDQUFDO2dCQUNILENBQUM7Z0JBQ0QsSUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsd0JBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUM7Z0JBQzNGLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxXQUFXO29CQUM5QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxJQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2xELEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGlFQUFpRSxDQUFDLENBQUM7d0JBQ3JGLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUM3QixNQUFNLElBQUksS0FBSyxDQUNYLHFGQUFxRixDQUFDLENBQUM7d0JBQzdGLENBQUM7d0JBQ0QsSUFBSSxDQUFDLE1BQUksV0FBVyxDQUFDLGdCQUFnQixNQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7b0JBQ3ZELENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sSUFBSSxDQUFDLE1BQUksUUFBUSxNQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7b0JBQ25DLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEseUJBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7Z0JBQzdGLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO29CQUNoQyxJQUFNLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDckMsSUFBSSxDQUFDLE1BQUksWUFBWSxDQUFDLFNBQVMsTUFBRyxDQUFDLEdBQU0sUUFBUSxTQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUcsQ0FBQztnQkFDekUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUNsQixnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLDBCQUEwQixDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQWIsQ0FBYSxDQUFDLEVBQW5ELENBQW1ELENBQUMsQ0FBQztnQkFDNUYsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDVixPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUM1QixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRU8sOENBQWtCLEdBQTFCLFVBQTJCLEdBQVcsSUFBSSxNQUFNLENBQUMsbUJBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdEYsMkNBQWUsR0FBdkIsVUFBd0IsUUFBa0I7WUFDeEMsSUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUNoQyxJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQ3RDLElBQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztZQUNwQyx3RUFBd0U7WUFDeEUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQU0sTUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFJLENBQUMsQ0FBQztnQkFDdEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFJLENBQUMsQ0FBQztvQkFDaEIsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztZQUNILENBQUM7WUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFTyxrQ0FBTSxHQUFkLFVBQ0ksU0FBb0IsRUFBRSxNQUFnQixFQUFFLE9BQWlCLEVBQUUsSUFBNkIsRUFDeEYsT0FBNkIsRUFBRSxNQUE0QixFQUFFLGFBQW1CO1lBQ2xGLElBQU0sWUFBWSxHQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RGLElBQU0sYUFBYSxHQUNmLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFGLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxzQkFBSyxTQUFTLENBQUMsSUFBSSxFQUFLLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3hFLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxzQkFBSyxTQUFTLENBQUMsT0FBTyxFQUFLLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ3ZGLEVBQUUsQ0FBQyxDQUFDLHNCQUFlLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsSUFBTSxJQUFJLEdBQUcsU0FBc0IsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLHNCQUFlLENBQUM7b0JBQ3JCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsTUFBTSxFQUFFLFlBQVk7b0JBQ3BCLE9BQU8sRUFBRSxhQUFhO29CQUN0QixJQUFJLEVBQUUsVUFBVTtvQkFDaEIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7b0JBQ3ZCLE9BQU8sRUFBRSxhQUFhO29CQUN0QixlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7b0JBQ3JDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDekIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO29CQUNqQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7b0JBQ3JDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO29CQUM3QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDekIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO29CQUNqQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7b0JBQzNCLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtvQkFDakMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLG1CQUFtQjtpQkFDbkQsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxzQkFBZSxDQUFDO29CQUNyQixRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7b0JBQzVCLE1BQU0sRUFBRSxZQUFZO29CQUNwQixPQUFPLEVBQUUsYUFBYTtvQkFDdEIsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtvQkFDNUIsT0FBTyxFQUFFLGFBQWE7b0JBQ3RCLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sUUFBQTtpQkFDdkMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUFwSkQsSUFvSkM7SUFwSlksOENBQWlCO0lBc0o5Qiw2QkFBNkIsSUFBUztRQUNwQyxNQUFNLENBQUMsc0JBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELGtCQUE0QixHQUFRLEVBQUUsU0FBZ0M7UUFDcEUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQVBELDRCQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4vY29tcGlsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtDb21wb25lbnQsIERpcmVjdGl2ZSwgVHlwZSwgY3JlYXRlQ29tcG9uZW50LCBjcmVhdGVDb250ZW50Q2hpbGQsIGNyZWF0ZUNvbnRlbnRDaGlsZHJlbiwgY3JlYXRlRGlyZWN0aXZlLCBjcmVhdGVIb3N0QmluZGluZywgY3JlYXRlSG9zdExpc3RlbmVyLCBjcmVhdGVJbnB1dCwgY3JlYXRlT3V0cHV0LCBjcmVhdGVWaWV3Q2hpbGQsIGNyZWF0ZVZpZXdDaGlsZHJlbn0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWYsIHNwbGl0QXRDb2xvbiwgc3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBRVUVSWV9NRVRBREFUQV9JREVOVElGSUVSUyA9IFtcbiAgY3JlYXRlVmlld0NoaWxkLFxuICBjcmVhdGVWaWV3Q2hpbGRyZW4sXG4gIGNyZWF0ZUNvbnRlbnRDaGlsZCxcbiAgY3JlYXRlQ29udGVudENoaWxkcmVuLFxuXTtcblxuLypcbiAqIFJlc29sdmUgYSBgVHlwZWAgZm9yIHtAbGluayBEaXJlY3RpdmV9LlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgdG8gY3JlYXRlIGN1c3RvbSBiZWhhdmlvci5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBpbGVyfVxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlUmVzb2x2ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IpIHt9XG5cbiAgaXNEaXJlY3RpdmUodHlwZTogVHlwZSkge1xuICAgIGNvbnN0IHR5cGVNZXRhZGF0YSA9IHRoaXMuX3JlZmxlY3Rvci5hbm5vdGF0aW9ucyhyZXNvbHZlRm9yd2FyZFJlZih0eXBlKSk7XG4gICAgcmV0dXJuIHR5cGVNZXRhZGF0YSAmJiB0eXBlTWV0YWRhdGEuc29tZShpc0RpcmVjdGl2ZU1ldGFkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4ge0BsaW5rIERpcmVjdGl2ZX0gZm9yIGEgZ2l2ZW4gYFR5cGVgLlxuICAgKi9cbiAgcmVzb2x2ZSh0eXBlOiBUeXBlKTogRGlyZWN0aXZlO1xuICByZXNvbHZlKHR5cGU6IFR5cGUsIHRocm93SWZOb3RGb3VuZDogdHJ1ZSk6IERpcmVjdGl2ZTtcbiAgcmVzb2x2ZSh0eXBlOiBUeXBlLCB0aHJvd0lmTm90Rm91bmQ6IGJvb2xlYW4pOiBEaXJlY3RpdmV8bnVsbDtcbiAgcmVzb2x2ZSh0eXBlOiBUeXBlLCB0aHJvd0lmTm90Rm91bmQgPSB0cnVlKTogRGlyZWN0aXZlfG51bGwge1xuICAgIGNvbnN0IHR5cGVNZXRhZGF0YSA9IHRoaXMuX3JlZmxlY3Rvci5hbm5vdGF0aW9ucyhyZXNvbHZlRm9yd2FyZFJlZih0eXBlKSk7XG4gICAgaWYgKHR5cGVNZXRhZGF0YSkge1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSBmaW5kTGFzdCh0eXBlTWV0YWRhdGEsIGlzRGlyZWN0aXZlTWV0YWRhdGEpO1xuICAgICAgaWYgKG1ldGFkYXRhKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5TWV0YWRhdGEgPSB0aGlzLl9yZWZsZWN0b3IucHJvcE1ldGFkYXRhKHR5cGUpO1xuICAgICAgICBjb25zdCBndWFyZHMgPSB0aGlzLl9yZWZsZWN0b3IuZ3VhcmRzKHR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbWVyZ2VXaXRoUHJvcGVydHlNZXRhZGF0YShtZXRhZGF0YSwgcHJvcGVydHlNZXRhZGF0YSwgZ3VhcmRzLCB0eXBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhyb3dJZk5vdEZvdW5kKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIERpcmVjdGl2ZSBhbm5vdGF0aW9uIGZvdW5kIG9uICR7c3RyaW5naWZ5KHR5cGUpfWApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VXaXRoUHJvcGVydHlNZXRhZGF0YShcbiAgICAgIGRtOiBEaXJlY3RpdmUsIHByb3BlcnR5TWV0YWRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0sIGd1YXJkczoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgICBkaXJlY3RpdmVUeXBlOiBUeXBlKTogRGlyZWN0aXZlIHtcbiAgICBjb25zdCBpbnB1dHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgb3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IHF1ZXJpZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgT2JqZWN0LmtleXMocHJvcGVydHlNZXRhZGF0YSkuZm9yRWFjaCgocHJvcE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgaW5wdXQgPSBmaW5kTGFzdChwcm9wZXJ0eU1ldGFkYXRhW3Byb3BOYW1lXSwgKGEpID0+IGNyZWF0ZUlucHV0LmlzVHlwZU9mKGEpKTtcbiAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQuYmluZGluZ1Byb3BlcnR5TmFtZSkge1xuICAgICAgICAgIGlucHV0cy5wdXNoKGAke3Byb3BOYW1lfTogJHtpbnB1dC5iaW5kaW5nUHJvcGVydHlOYW1lfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlucHV0cy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3Qgb3V0cHV0ID0gZmluZExhc3QocHJvcGVydHlNZXRhZGF0YVtwcm9wTmFtZV0sIChhKSA9PiBjcmVhdGVPdXRwdXQuaXNUeXBlT2YoYSkpO1xuICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICBpZiAob3V0cHV0LmJpbmRpbmdQcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICBvdXRwdXRzLnB1c2goYCR7cHJvcE5hbWV9OiAke291dHB1dC5iaW5kaW5nUHJvcGVydHlOYW1lfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dHB1dHMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGhvc3RCaW5kaW5ncyA9IHByb3BlcnR5TWV0YWRhdGFbcHJvcE5hbWVdLmZpbHRlcihhID0+IGNyZWF0ZUhvc3RCaW5kaW5nLmlzVHlwZU9mKGEpKTtcbiAgICAgIGhvc3RCaW5kaW5ncy5mb3JFYWNoKGhvc3RCaW5kaW5nID0+IHtcbiAgICAgICAgaWYgKGhvc3RCaW5kaW5nLmhvc3RQcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICBjb25zdCBzdGFydFdpdGggPSBob3N0QmluZGluZy5ob3N0UHJvcGVydHlOYW1lWzBdO1xuICAgICAgICAgIGlmIChzdGFydFdpdGggPT09ICcoJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBASG9zdEJpbmRpbmcgY2FuIG5vdCBiaW5kIHRvIGV2ZW50cy4gVXNlIEBIb3N0TGlzdGVuZXIgaW5zdGVhZC5gKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0V2l0aCA9PT0gJ1snKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEBIb3N0QmluZGluZyBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgcHJvcGVydHkgbmFtZSwgJ2NsYXNzLjxuYW1lPicsIG9yICdhdHRyLjxuYW1lPicuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGhvc3RbYFske2hvc3RCaW5kaW5nLmhvc3RQcm9wZXJ0eU5hbWV9XWBdID0gcHJvcE5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG9zdFtgWyR7cHJvcE5hbWV9XWBdID0gcHJvcE5hbWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgaG9zdExpc3RlbmVycyA9IHByb3BlcnR5TWV0YWRhdGFbcHJvcE5hbWVdLmZpbHRlcihhID0+IGNyZWF0ZUhvc3RMaXN0ZW5lci5pc1R5cGVPZihhKSk7XG4gICAgICBob3N0TGlzdGVuZXJzLmZvckVhY2goaG9zdExpc3RlbmVyID0+IHtcbiAgICAgICAgY29uc3QgYXJncyA9IGhvc3RMaXN0ZW5lci5hcmdzIHx8IFtdO1xuICAgICAgICBob3N0W2AoJHtob3N0TGlzdGVuZXIuZXZlbnROYW1lfSlgXSA9IGAke3Byb3BOYW1lfSgke2FyZ3Muam9pbignLCcpfSlgO1xuICAgICAgfSk7XG4gICAgICBjb25zdCBxdWVyeSA9IGZpbmRMYXN0KFxuICAgICAgICAgIHByb3BlcnR5TWV0YWRhdGFbcHJvcE5hbWVdLCAoYSkgPT4gUVVFUllfTUVUQURBVEFfSURFTlRJRklFUlMuc29tZShpID0+IGkuaXNUeXBlT2YoYSkpKTtcbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICBxdWVyaWVzW3Byb3BOYW1lXSA9IHF1ZXJ5O1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9tZXJnZShkbSwgaW5wdXRzLCBvdXRwdXRzLCBob3N0LCBxdWVyaWVzLCBndWFyZHMsIGRpcmVjdGl2ZVR5cGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdFB1YmxpY05hbWUoZGVmOiBzdHJpbmcpIHsgcmV0dXJuIHNwbGl0QXRDb2xvbihkZWYsIFtudWxsICEsIGRlZl0pWzFdLnRyaW0oKTsgfVxuXG4gIHByaXZhdGUgX2RlZHVwZUJpbmRpbmdzKGJpbmRpbmdzOiBzdHJpbmdbXSk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBuYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHB1YmxpY05hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgcmV2ZXJzZWRSZXN1bHQ6IHN0cmluZ1tdID0gW107XG4gICAgLy8gZ28gbGFzdCB0byBmaXJzdCB0byBhbGxvdyBsYXRlciBlbnRyaWVzIHRvIG92ZXJ3cml0ZSBwcmV2aW91cyBlbnRyaWVzXG4gICAgZm9yIChsZXQgaSA9IGJpbmRpbmdzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBiaW5kaW5nID0gYmluZGluZ3NbaV07XG4gICAgICBjb25zdCBuYW1lID0gdGhpcy5fZXh0cmFjdFB1YmxpY05hbWUoYmluZGluZyk7XG4gICAgICBwdWJsaWNOYW1lcy5hZGQobmFtZSk7XG4gICAgICBpZiAoIW5hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICBuYW1lcy5hZGQobmFtZSk7XG4gICAgICAgIHJldmVyc2VkUmVzdWx0LnB1c2goYmluZGluZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXZlcnNlZFJlc3VsdC5yZXZlcnNlKCk7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZShcbiAgICAgIGRpcmVjdGl2ZTogRGlyZWN0aXZlLCBpbnB1dHM6IHN0cmluZ1tdLCBvdXRwdXRzOiBzdHJpbmdbXSwgaG9zdDoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICBxdWVyaWVzOiB7W2tleTogc3RyaW5nXTogYW55fSwgZ3VhcmRzOiB7W2tleTogc3RyaW5nXTogYW55fSwgZGlyZWN0aXZlVHlwZTogVHlwZSk6IERpcmVjdGl2ZSB7XG4gICAgY29uc3QgbWVyZ2VkSW5wdXRzID1cbiAgICAgICAgdGhpcy5fZGVkdXBlQmluZGluZ3MoZGlyZWN0aXZlLmlucHV0cyA/IGRpcmVjdGl2ZS5pbnB1dHMuY29uY2F0KGlucHV0cykgOiBpbnB1dHMpO1xuICAgIGNvbnN0IG1lcmdlZE91dHB1dHMgPVxuICAgICAgICB0aGlzLl9kZWR1cGVCaW5kaW5ncyhkaXJlY3RpdmUub3V0cHV0cyA/IGRpcmVjdGl2ZS5vdXRwdXRzLmNvbmNhdChvdXRwdXRzKSA6IG91dHB1dHMpO1xuICAgIGNvbnN0IG1lcmdlZEhvc3QgPSBkaXJlY3RpdmUuaG9zdCA/IHsuLi5kaXJlY3RpdmUuaG9zdCwgLi4uaG9zdH0gOiBob3N0O1xuICAgIGNvbnN0IG1lcmdlZFF1ZXJpZXMgPSBkaXJlY3RpdmUucXVlcmllcyA/IHsuLi5kaXJlY3RpdmUucXVlcmllcywgLi4ucXVlcmllc30gOiBxdWVyaWVzO1xuICAgIGlmIChjcmVhdGVDb21wb25lbnQuaXNUeXBlT2YoZGlyZWN0aXZlKSkge1xuICAgICAgY29uc3QgY29tcCA9IGRpcmVjdGl2ZSBhcyBDb21wb25lbnQ7XG4gICAgICByZXR1cm4gY3JlYXRlQ29tcG9uZW50KHtcbiAgICAgICAgc2VsZWN0b3I6IGNvbXAuc2VsZWN0b3IsXG4gICAgICAgIGlucHV0czogbWVyZ2VkSW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBtZXJnZWRPdXRwdXRzLFxuICAgICAgICBob3N0OiBtZXJnZWRIb3N0LFxuICAgICAgICBleHBvcnRBczogY29tcC5leHBvcnRBcyxcbiAgICAgICAgbW9kdWxlSWQ6IGNvbXAubW9kdWxlSWQsXG4gICAgICAgIHF1ZXJpZXM6IG1lcmdlZFF1ZXJpZXMsXG4gICAgICAgIGNoYW5nZURldGVjdGlvbjogY29tcC5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgIHByb3ZpZGVyczogY29tcC5wcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IGNvbXAudmlld1Byb3ZpZGVycyxcbiAgICAgICAgZW50cnlDb21wb25lbnRzOiBjb21wLmVudHJ5Q29tcG9uZW50cyxcbiAgICAgICAgdGVtcGxhdGU6IGNvbXAudGVtcGxhdGUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiBjb21wLnRlbXBsYXRlVXJsLFxuICAgICAgICBzdHlsZXM6IGNvbXAuc3R5bGVzLFxuICAgICAgICBzdHlsZVVybHM6IGNvbXAuc3R5bGVVcmxzLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiBjb21wLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgIGFuaW1hdGlvbnM6IGNvbXAuYW5pbWF0aW9ucyxcbiAgICAgICAgaW50ZXJwb2xhdGlvbjogY29tcC5pbnRlcnBvbGF0aW9uLFxuICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBkaXJlY3RpdmUucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3JlYXRlRGlyZWN0aXZlKHtcbiAgICAgICAgc2VsZWN0b3I6IGRpcmVjdGl2ZS5zZWxlY3RvcixcbiAgICAgICAgaW5wdXRzOiBtZXJnZWRJbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IG1lcmdlZE91dHB1dHMsXG4gICAgICAgIGhvc3Q6IG1lcmdlZEhvc3QsXG4gICAgICAgIGV4cG9ydEFzOiBkaXJlY3RpdmUuZXhwb3J0QXMsXG4gICAgICAgIHF1ZXJpZXM6IG1lcmdlZFF1ZXJpZXMsXG4gICAgICAgIHByb3ZpZGVyczogZGlyZWN0aXZlLnByb3ZpZGVycywgZ3VhcmRzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNEaXJlY3RpdmVNZXRhZGF0YSh0eXBlOiBhbnkpOiB0eXBlIGlzIERpcmVjdGl2ZSB7XG4gIHJldHVybiBjcmVhdGVEaXJlY3RpdmUuaXNUeXBlT2YodHlwZSkgfHwgY3JlYXRlQ29tcG9uZW50LmlzVHlwZU9mKHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZExhc3Q8VD4oYXJyOiBUW10sIGNvbmRpdGlvbjogKHZhbHVlOiBUKSA9PiBib29sZWFuKTogVHxudWxsIHtcbiAgZm9yIChsZXQgaSA9IGFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChjb25kaXRpb24oYXJyW2ldKSkge1xuICAgICAgcmV0dXJuIGFycltpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=