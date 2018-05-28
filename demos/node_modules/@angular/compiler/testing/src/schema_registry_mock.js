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
        define("@angular/compiler/testing/src/schema_registry_mock", ["require", "exports", "@angular/compiler/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compiler_1 = require("@angular/compiler/index");
    var MockSchemaRegistry = /** @class */ (function () {
        function MockSchemaRegistry(existingProperties, attrPropMapping, existingElements, invalidProperties, invalidAttributes) {
            this.existingProperties = existingProperties;
            this.attrPropMapping = attrPropMapping;
            this.existingElements = existingElements;
            this.invalidProperties = invalidProperties;
            this.invalidAttributes = invalidAttributes;
        }
        MockSchemaRegistry.prototype.hasProperty = function (tagName, property, schemas) {
            var value = this.existingProperties[property];
            return value === void 0 ? true : value;
        };
        MockSchemaRegistry.prototype.hasElement = function (tagName, schemaMetas) {
            var value = this.existingElements[tagName.toLowerCase()];
            return value === void 0 ? true : value;
        };
        MockSchemaRegistry.prototype.allKnownElementNames = function () { return Object.keys(this.existingElements); };
        MockSchemaRegistry.prototype.securityContext = function (selector, property, isAttribute) {
            return compiler_1.core.SecurityContext.NONE;
        };
        MockSchemaRegistry.prototype.getMappedPropName = function (attrName) { return this.attrPropMapping[attrName] || attrName; };
        MockSchemaRegistry.prototype.getDefaultComponentElementName = function () { return 'ng-component'; };
        MockSchemaRegistry.prototype.validateProperty = function (name) {
            if (this.invalidProperties.indexOf(name) > -1) {
                return { error: true, msg: "Binding to property '" + name + "' is disallowed for security reasons" };
            }
            else {
                return { error: false };
            }
        };
        MockSchemaRegistry.prototype.validateAttribute = function (name) {
            if (this.invalidAttributes.indexOf(name) > -1) {
                return {
                    error: true,
                    msg: "Binding to attribute '" + name + "' is disallowed for security reasons"
                };
            }
            else {
                return { error: false };
            }
        };
        MockSchemaRegistry.prototype.normalizeAnimationStyleProperty = function (propName) { return propName; };
        MockSchemaRegistry.prototype.normalizeAnimationStyleValue = function (camelCaseProp, userProvidedProp, val) {
            return { error: null, value: val.toString() };
        };
        return MockSchemaRegistry;
    }());
    exports.MockSchemaRegistry = MockSchemaRegistry;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hX3JlZ2lzdHJ5X21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci90ZXN0aW5nL3NyYy9zY2hlbWFfcmVnaXN0cnlfbW9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILG9EQUE4RDtJQUU5RDtRQUNFLDRCQUNXLGtCQUE0QyxFQUM1QyxlQUF3QyxFQUN4QyxnQkFBMEMsRUFBUyxpQkFBZ0MsRUFDbkYsaUJBQWdDO1lBSGhDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMEI7WUFDNUMsb0JBQWUsR0FBZixlQUFlLENBQXlCO1lBQ3hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBMEI7WUFBUyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWU7WUFDbkYsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFlO1FBQUcsQ0FBQztRQUUvQyx3Q0FBVyxHQUFYLFVBQVksT0FBZSxFQUFFLFFBQWdCLEVBQUUsT0FBOEI7WUFDM0UsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3pDLENBQUM7UUFFRCx1Q0FBVSxHQUFWLFVBQVcsT0FBZSxFQUFFLFdBQWtDO1lBQzVELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN6QyxDQUFDO1FBRUQsaURBQW9CLEdBQXBCLGNBQW1DLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvRSw0Q0FBZSxHQUFmLFVBQWdCLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxXQUFvQjtZQUN0RSxNQUFNLENBQUMsZUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7UUFDbkMsQ0FBQztRQUVELDhDQUFpQixHQUFqQixVQUFrQixRQUFnQixJQUFZLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFbEcsMkRBQThCLEdBQTlCLGNBQTJDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBRW5FLDZDQUFnQixHQUFoQixVQUFpQixJQUFZO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSwwQkFBd0IsSUFBSSx5Q0FBc0MsRUFBQyxDQUFDO1lBQ2hHLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNILENBQUM7UUFFRCw4Q0FBaUIsR0FBakIsVUFBa0IsSUFBWTtZQUM1QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDO29CQUNMLEtBQUssRUFBRSxJQUFJO29CQUNYLEdBQUcsRUFBRSwyQkFBeUIsSUFBSSx5Q0FBc0M7aUJBQ3pFLENBQUM7WUFDSixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDO1lBQ3hCLENBQUM7UUFDSCxDQUFDO1FBRUQsNERBQStCLEdBQS9CLFVBQWdDLFFBQWdCLElBQVksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUUseURBQTRCLEdBQTVCLFVBQTZCLGFBQXFCLEVBQUUsZ0JBQXdCLEVBQUUsR0FBa0I7WUFFOUYsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQW5ERCxJQW1EQztJQW5EWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5LCBjb3JlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmV4cG9ydCBjbGFzcyBNb2NrU2NoZW1hUmVnaXN0cnkgaW1wbGVtZW50cyBFbGVtZW50U2NoZW1hUmVnaXN0cnkge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBleGlzdGluZ1Byb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSxcbiAgICAgIHB1YmxpYyBhdHRyUHJvcE1hcHBpbmc6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgcHVibGljIGV4aXN0aW5nRWxlbWVudHM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSwgcHVibGljIGludmFsaWRQcm9wZXJ0aWVzOiBBcnJheTxzdHJpbmc+LFxuICAgICAgcHVibGljIGludmFsaWRBdHRyaWJ1dGVzOiBBcnJheTxzdHJpbmc+KSB7fVxuXG4gIGhhc1Byb3BlcnR5KHRhZ05hbWU6IHN0cmluZywgcHJvcGVydHk6IHN0cmluZywgc2NoZW1hczogY29yZS5TY2hlbWFNZXRhZGF0YVtdKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmV4aXN0aW5nUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgcmV0dXJuIHZhbHVlID09PSB2b2lkIDAgPyB0cnVlIDogdmFsdWU7XG4gIH1cblxuICBoYXNFbGVtZW50KHRhZ05hbWU6IHN0cmluZywgc2NoZW1hTWV0YXM6IGNvcmUuU2NoZW1hTWV0YWRhdGFbXSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5leGlzdGluZ0VsZW1lbnRzW3RhZ05hbWUudG9Mb3dlckNhc2UoKV07XG4gICAgcmV0dXJuIHZhbHVlID09PSB2b2lkIDAgPyB0cnVlIDogdmFsdWU7XG4gIH1cblxuICBhbGxLbm93bkVsZW1lbnROYW1lcygpOiBzdHJpbmdbXSB7IHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmV4aXN0aW5nRWxlbWVudHMpOyB9XG5cbiAgc2VjdXJpdHlDb250ZXh0KHNlbGVjdG9yOiBzdHJpbmcsIHByb3BlcnR5OiBzdHJpbmcsIGlzQXR0cmlidXRlOiBib29sZWFuKTogY29yZS5TZWN1cml0eUNvbnRleHQge1xuICAgIHJldHVybiBjb3JlLlNlY3VyaXR5Q29udGV4dC5OT05FO1xuICB9XG5cbiAgZ2V0TWFwcGVkUHJvcE5hbWUoYXR0ck5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiB0aGlzLmF0dHJQcm9wTWFwcGluZ1thdHRyTmFtZV0gfHwgYXR0ck5hbWU7IH1cblxuICBnZXREZWZhdWx0Q29tcG9uZW50RWxlbWVudE5hbWUoKTogc3RyaW5nIHsgcmV0dXJuICduZy1jb21wb25lbnQnOyB9XG5cbiAgdmFsaWRhdGVQcm9wZXJ0eShuYW1lOiBzdHJpbmcpOiB7ZXJyb3I6IGJvb2xlYW4sIG1zZz86IHN0cmluZ30ge1xuICAgIGlmICh0aGlzLmludmFsaWRQcm9wZXJ0aWVzLmluZGV4T2YobmFtZSkgPiAtMSkge1xuICAgICAgcmV0dXJuIHtlcnJvcjogdHJ1ZSwgbXNnOiBgQmluZGluZyB0byBwcm9wZXJ0eSAnJHtuYW1lfScgaXMgZGlzYWxsb3dlZCBmb3Igc2VjdXJpdHkgcmVhc29uc2B9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge2Vycm9yOiBmYWxzZX07XG4gICAgfVxuICB9XG5cbiAgdmFsaWRhdGVBdHRyaWJ1dGUobmFtZTogc3RyaW5nKToge2Vycm9yOiBib29sZWFuLCBtc2c/OiBzdHJpbmd9IHtcbiAgICBpZiAodGhpcy5pbnZhbGlkQXR0cmlidXRlcy5pbmRleE9mKG5hbWUpID4gLTEpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICBtc2c6IGBCaW5kaW5nIHRvIGF0dHJpYnV0ZSAnJHtuYW1lfScgaXMgZGlzYWxsb3dlZCBmb3Igc2VjdXJpdHkgcmVhc29uc2BcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ZXJyb3I6IGZhbHNlfTtcbiAgICB9XG4gIH1cblxuICBub3JtYWxpemVBbmltYXRpb25TdHlsZVByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gcHJvcE5hbWU7IH1cbiAgbm9ybWFsaXplQW5pbWF0aW9uU3R5bGVWYWx1ZShjYW1lbENhc2VQcm9wOiBzdHJpbmcsIHVzZXJQcm92aWRlZFByb3A6IHN0cmluZywgdmFsOiBzdHJpbmd8bnVtYmVyKTpcbiAgICAgIHtlcnJvcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfSB7XG4gICAgcmV0dXJuIHtlcnJvcjogbnVsbCAhLCB2YWx1ZTogdmFsLnRvU3RyaW5nKCl9O1xuICB9XG59XG4iXX0=