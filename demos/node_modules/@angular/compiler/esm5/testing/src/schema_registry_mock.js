/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { core } from '@angular/compiler';
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
        return core.SecurityContext.NONE;
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
        return { error: (null), value: val.toString() };
    };
    return MockSchemaRegistry;
}());
export { MockSchemaRegistry };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hX3JlZ2lzdHJ5X21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci90ZXN0aW5nL3NyYy9zY2hlbWFfcmVnaXN0cnlfbW9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBUUEsT0FBTyxFQUF3QixJQUFJLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUU5RCxJQUFBO0lBQ0UsNEJBQ1csa0JBQTRDLEVBQzVDLGVBQXdDLEVBQ3hDLGdCQUEwQyxFQUFTLGlCQUFnQyxFQUNuRixpQkFBZ0M7UUFIaEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUEwQjtRQUM1QyxvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7UUFDeEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUEwQjtRQUFTLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBZTtRQUNuRixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWU7S0FBSTtJQUUvQyx3Q0FBVyxHQUFYLFVBQVksT0FBZSxFQUFFLFFBQWdCLEVBQUUsT0FBOEI7UUFDM0UsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQ3hDO0lBRUQsdUNBQVUsR0FBVixVQUFXLE9BQWUsRUFBRSxXQUFrQztRQUM1RCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDeEM7SUFFRCxpREFBb0IsR0FBcEIsY0FBbUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRTtJQUUvRSw0Q0FBZSxHQUFmLFVBQWdCLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxXQUFvQjtRQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7S0FDbEM7SUFFRCw4Q0FBaUIsR0FBakIsVUFBa0IsUUFBZ0IsSUFBWSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsRUFBRTtJQUVsRywyREFBOEIsR0FBOUIsY0FBMkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO0lBRW5FLDZDQUFnQixHQUFoQixVQUFpQixJQUFZO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLDBCQUF3QixJQUFJLHlDQUFzQyxFQUFDLENBQUM7U0FDL0Y7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQztTQUN2QjtLQUNGO0lBRUQsOENBQWlCLEdBQWpCLFVBQWtCLElBQVk7UUFDNUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDO2dCQUNMLEtBQUssRUFBRSxJQUFJO2dCQUNYLEdBQUcsRUFBRSwyQkFBeUIsSUFBSSx5Q0FBc0M7YUFDekUsQ0FBQztTQUNIO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDdkI7S0FDRjtJQUVELDREQUErQixHQUEvQixVQUFnQyxRQUFnQixJQUFZLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUM5RSx5REFBNEIsR0FBNUIsVUFBNkIsYUFBcUIsRUFBRSxnQkFBd0IsRUFBRSxHQUFrQjtRQUU5RixNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsQ0FBQSxJQUFNLENBQUEsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUM7S0FDL0M7NkJBNURIO0lBNkRDLENBQUE7QUFuREQsOEJBbURDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeSwgY29yZX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG5leHBvcnQgY2xhc3MgTW9ja1NjaGVtYVJlZ2lzdHJ5IGltcGxlbWVudHMgRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZXhpc3RpbmdQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0sXG4gICAgICBwdWJsaWMgYXR0clByb3BNYXBwaW5nOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgIHB1YmxpYyBleGlzdGluZ0VsZW1lbnRzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0sIHB1YmxpYyBpbnZhbGlkUHJvcGVydGllczogQXJyYXk8c3RyaW5nPixcbiAgICAgIHB1YmxpYyBpbnZhbGlkQXR0cmlidXRlczogQXJyYXk8c3RyaW5nPikge31cblxuICBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BlcnR5OiBzdHJpbmcsIHNjaGVtYXM6IGNvcmUuU2NoZW1hTWV0YWRhdGFbXSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5leGlzdGluZ1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdm9pZCAwID8gdHJ1ZSA6IHZhbHVlO1xuICB9XG5cbiAgaGFzRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcsIHNjaGVtYU1ldGFzOiBjb3JlLlNjaGVtYU1ldGFkYXRhW10pOiBib29sZWFuIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZXhpc3RpbmdFbGVtZW50c1t0YWdOYW1lLnRvTG93ZXJDYXNlKCldO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdm9pZCAwID8gdHJ1ZSA6IHZhbHVlO1xuICB9XG5cbiAgYWxsS25vd25FbGVtZW50TmFtZXMoKTogc3RyaW5nW10geyByZXR1cm4gT2JqZWN0LmtleXModGhpcy5leGlzdGluZ0VsZW1lbnRzKTsgfVxuXG4gIHNlY3VyaXR5Q29udGV4dChzZWxlY3Rvcjogc3RyaW5nLCBwcm9wZXJ0eTogc3RyaW5nLCBpc0F0dHJpYnV0ZTogYm9vbGVhbik6IGNvcmUuU2VjdXJpdHlDb250ZXh0IHtcbiAgICByZXR1cm4gY29yZS5TZWN1cml0eUNvbnRleHQuTk9ORTtcbiAgfVxuXG4gIGdldE1hcHBlZFByb3BOYW1lKGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5hdHRyUHJvcE1hcHBpbmdbYXR0ck5hbWVdIHx8IGF0dHJOYW1lOyB9XG5cbiAgZ2V0RGVmYXVsdENvbXBvbmVudEVsZW1lbnROYW1lKCk6IHN0cmluZyB7IHJldHVybiAnbmctY29tcG9uZW50JzsgfVxuXG4gIHZhbGlkYXRlUHJvcGVydHkobmFtZTogc3RyaW5nKToge2Vycm9yOiBib29sZWFuLCBtc2c/OiBzdHJpbmd9IHtcbiAgICBpZiAodGhpcy5pbnZhbGlkUHJvcGVydGllcy5pbmRleE9mKG5hbWUpID4gLTEpIHtcbiAgICAgIHJldHVybiB7ZXJyb3I6IHRydWUsIG1zZzogYEJpbmRpbmcgdG8gcHJvcGVydHkgJyR7bmFtZX0nIGlzIGRpc2FsbG93ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnNgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtlcnJvcjogZmFsc2V9O1xuICAgIH1cbiAgfVxuXG4gIHZhbGlkYXRlQXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IHtlcnJvcjogYm9vbGVhbiwgbXNnPzogc3RyaW5nfSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZEF0dHJpYnV0ZXMuaW5kZXhPZihuYW1lKSA+IC0xKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgICAgbXNnOiBgQmluZGluZyB0byBhdHRyaWJ1dGUgJyR7bmFtZX0nIGlzIGRpc2FsbG93ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnNgXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge2Vycm9yOiBmYWxzZX07XG4gICAgfVxuICB9XG5cbiAgbm9ybWFsaXplQW5pbWF0aW9uU3R5bGVQcm9wZXJ0eShwcm9wTmFtZTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIHByb3BOYW1lOyB9XG4gIG5vcm1hbGl6ZUFuaW1hdGlvblN0eWxlVmFsdWUoY2FtZWxDYXNlUHJvcDogc3RyaW5nLCB1c2VyUHJvdmlkZWRQcm9wOiBzdHJpbmcsIHZhbDogc3RyaW5nfG51bWJlcik6XG4gICAgICB7ZXJyb3I6IHN0cmluZywgdmFsdWU6IHN0cmluZ30ge1xuICAgIHJldHVybiB7ZXJyb3I6IG51bGwgISwgdmFsdWU6IHZhbC50b1N0cmluZygpfTtcbiAgfVxufVxuIl19