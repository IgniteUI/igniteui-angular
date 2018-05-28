/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { core } from '@angular/compiler';
export class MockSchemaRegistry {
    /**
     * @param {?} existingProperties
     * @param {?} attrPropMapping
     * @param {?} existingElements
     * @param {?} invalidProperties
     * @param {?} invalidAttributes
     */
    constructor(existingProperties, attrPropMapping, existingElements, invalidProperties, invalidAttributes) {
        this.existingProperties = existingProperties;
        this.attrPropMapping = attrPropMapping;
        this.existingElements = existingElements;
        this.invalidProperties = invalidProperties;
        this.invalidAttributes = invalidAttributes;
    }
    /**
     * @param {?} tagName
     * @param {?} property
     * @param {?} schemas
     * @return {?}
     */
    hasProperty(tagName, property, schemas) {
        const /** @type {?} */ value = this.existingProperties[property];
        return value === void 0 ? true : value;
    }
    /**
     * @param {?} tagName
     * @param {?} schemaMetas
     * @return {?}
     */
    hasElement(tagName, schemaMetas) {
        const /** @type {?} */ value = this.existingElements[tagName.toLowerCase()];
        return value === void 0 ? true : value;
    }
    /**
     * @return {?}
     */
    allKnownElementNames() { return Object.keys(this.existingElements); }
    /**
     * @param {?} selector
     * @param {?} property
     * @param {?} isAttribute
     * @return {?}
     */
    securityContext(selector, property, isAttribute) {
        return core.SecurityContext.NONE;
    }
    /**
     * @param {?} attrName
     * @return {?}
     */
    getMappedPropName(attrName) { return this.attrPropMapping[attrName] || attrName; }
    /**
     * @return {?}
     */
    getDefaultComponentElementName() { return 'ng-component'; }
    /**
     * @param {?} name
     * @return {?}
     */
    validateProperty(name) {
        if (this.invalidProperties.indexOf(name) > -1) {
            return { error: true, msg: `Binding to property '${name}' is disallowed for security reasons` };
        }
        else {
            return { error: false };
        }
    }
    /**
     * @param {?} name
     * @return {?}
     */
    validateAttribute(name) {
        if (this.invalidAttributes.indexOf(name) > -1) {
            return {
                error: true,
                msg: `Binding to attribute '${name}' is disallowed for security reasons`
            };
        }
        else {
            return { error: false };
        }
    }
    /**
     * @param {?} propName
     * @return {?}
     */
    normalizeAnimationStyleProperty(propName) { return propName; }
    /**
     * @param {?} camelCaseProp
     * @param {?} userProvidedProp
     * @param {?} val
     * @return {?}
     */
    normalizeAnimationStyleValue(camelCaseProp, userProvidedProp, val) {
        return { error: /** @type {?} */ ((null)), value: val.toString() };
    }
}
function MockSchemaRegistry_tsickle_Closure_declarations() {
    /** @type {?} */
    MockSchemaRegistry.prototype.existingProperties;
    /** @type {?} */
    MockSchemaRegistry.prototype.attrPropMapping;
    /** @type {?} */
    MockSchemaRegistry.prototype.existingElements;
    /** @type {?} */
    MockSchemaRegistry.prototype.invalidProperties;
    /** @type {?} */
    MockSchemaRegistry.prototype.invalidAttributes;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hX3JlZ2lzdHJ5X21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci90ZXN0aW5nL3NyYy9zY2hlbWFfcmVnaXN0cnlfbW9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBd0IsSUFBSSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFOUQsTUFBTTs7Ozs7Ozs7SUFDSixZQUNXLG9CQUNBLGlCQUNBLGtCQUFtRCxpQkFBZ0MsRUFDbkY7UUFIQSx1QkFBa0IsR0FBbEIsa0JBQWtCO1FBQ2xCLG9CQUFlLEdBQWYsZUFBZTtRQUNmLHFCQUFnQixHQUFoQixnQkFBZ0I7UUFBbUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFlO1FBQ25GLHNCQUFpQixHQUFqQixpQkFBaUI7S0FBbUI7Ozs7Ozs7SUFFL0MsV0FBVyxDQUFDLE9BQWUsRUFBRSxRQUFnQixFQUFFLE9BQThCO1FBQzNFLHVCQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEQsTUFBTSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDeEM7Ozs7OztJQUVELFVBQVUsQ0FBQyxPQUFlLEVBQUUsV0FBa0M7UUFDNUQsdUJBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUMzRCxNQUFNLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUN4Qzs7OztJQUVELG9CQUFvQixLQUFlLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7SUFFL0UsZUFBZSxDQUFDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxXQUFvQjtRQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7S0FDbEM7Ozs7O0lBRUQsaUJBQWlCLENBQUMsUUFBZ0IsSUFBWSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsRUFBRTs7OztJQUVsRyw4QkFBOEIsS0FBYSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUU7Ozs7O0lBRW5FLGdCQUFnQixDQUFDLElBQVk7UUFDM0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsd0JBQXdCLElBQUksc0NBQXNDLEVBQUMsQ0FBQztTQUMvRjtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3ZCO0tBQ0Y7Ozs7O0lBRUQsaUJBQWlCLENBQUMsSUFBWTtRQUM1QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLENBQUM7Z0JBQ0wsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsR0FBRyxFQUFFLHlCQUF5QixJQUFJLHNDQUFzQzthQUN6RSxDQUFDO1NBQ0g7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQztTQUN2QjtLQUNGOzs7OztJQUVELCtCQUErQixDQUFDLFFBQWdCLElBQVksTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzs7Ozs7O0lBQzlFLDRCQUE0QixDQUFDLGFBQXFCLEVBQUUsZ0JBQXdCLEVBQUUsR0FBa0I7UUFFOUYsTUFBTSxDQUFDLEVBQUMsS0FBSyxxQkFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUM7S0FDL0M7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnksIGNvcmV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuZXhwb3J0IGNsYXNzIE1vY2tTY2hlbWFSZWdpc3RyeSBpbXBsZW1lbnRzIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGV4aXN0aW5nUHJvcGVydGllczoge1trZXk6IHN0cmluZ106IGJvb2xlYW59LFxuICAgICAgcHVibGljIGF0dHJQcm9wTWFwcGluZzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICBwdWJsaWMgZXhpc3RpbmdFbGVtZW50czoge1trZXk6IHN0cmluZ106IGJvb2xlYW59LCBwdWJsaWMgaW52YWxpZFByb3BlcnRpZXM6IEFycmF5PHN0cmluZz4sXG4gICAgICBwdWJsaWMgaW52YWxpZEF0dHJpYnV0ZXM6IEFycmF5PHN0cmluZz4pIHt9XG5cbiAgaGFzUHJvcGVydHkodGFnTmFtZTogc3RyaW5nLCBwcm9wZXJ0eTogc3RyaW5nLCBzY2hlbWFzOiBjb3JlLlNjaGVtYU1ldGFkYXRhW10pOiBib29sZWFuIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZXhpc3RpbmdQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICByZXR1cm4gdmFsdWUgPT09IHZvaWQgMCA/IHRydWUgOiB2YWx1ZTtcbiAgfVxuXG4gIGhhc0VsZW1lbnQodGFnTmFtZTogc3RyaW5nLCBzY2hlbWFNZXRhczogY29yZS5TY2hlbWFNZXRhZGF0YVtdKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmV4aXN0aW5nRWxlbWVudHNbdGFnTmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgICByZXR1cm4gdmFsdWUgPT09IHZvaWQgMCA/IHRydWUgOiB2YWx1ZTtcbiAgfVxuXG4gIGFsbEtub3duRWxlbWVudE5hbWVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZXhpc3RpbmdFbGVtZW50cyk7IH1cblxuICBzZWN1cml0eUNvbnRleHQoc2VsZWN0b3I6IHN0cmluZywgcHJvcGVydHk6IHN0cmluZywgaXNBdHRyaWJ1dGU6IGJvb2xlYW4pOiBjb3JlLlNlY3VyaXR5Q29udGV4dCB7XG4gICAgcmV0dXJuIGNvcmUuU2VjdXJpdHlDb250ZXh0Lk5PTkU7XG4gIH1cblxuICBnZXRNYXBwZWRQcm9wTmFtZShhdHRyTmFtZTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuYXR0clByb3BNYXBwaW5nW2F0dHJOYW1lXSB8fCBhdHRyTmFtZTsgfVxuXG4gIGdldERlZmF1bHRDb21wb25lbnRFbGVtZW50TmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gJ25nLWNvbXBvbmVudCc7IH1cblxuICB2YWxpZGF0ZVByb3BlcnR5KG5hbWU6IHN0cmluZyk6IHtlcnJvcjogYm9vbGVhbiwgbXNnPzogc3RyaW5nfSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZFByb3BlcnRpZXMuaW5kZXhPZihuYW1lKSA+IC0xKSB7XG4gICAgICByZXR1cm4ge2Vycm9yOiB0cnVlLCBtc2c6IGBCaW5kaW5nIHRvIHByb3BlcnR5ICcke25hbWV9JyBpcyBkaXNhbGxvd2VkIGZvciBzZWN1cml0eSByZWFzb25zYH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ZXJyb3I6IGZhbHNlfTtcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiB7ZXJyb3I6IGJvb2xlYW4sIG1zZz86IHN0cmluZ30ge1xuICAgIGlmICh0aGlzLmludmFsaWRBdHRyaWJ1dGVzLmluZGV4T2YobmFtZSkgPiAtMSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgIG1zZzogYEJpbmRpbmcgdG8gYXR0cmlidXRlICcke25hbWV9JyBpcyBkaXNhbGxvd2VkIGZvciBzZWN1cml0eSByZWFzb25zYFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtlcnJvcjogZmFsc2V9O1xuICAgIH1cbiAgfVxuXG4gIG5vcm1hbGl6ZUFuaW1hdGlvblN0eWxlUHJvcGVydHkocHJvcE5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBwcm9wTmFtZTsgfVxuICBub3JtYWxpemVBbmltYXRpb25TdHlsZVZhbHVlKGNhbWVsQ2FzZVByb3A6IHN0cmluZywgdXNlclByb3ZpZGVkUHJvcDogc3RyaW5nLCB2YWw6IHN0cmluZ3xudW1iZXIpOlxuICAgICAge2Vycm9yOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd9IHtcbiAgICByZXR1cm4ge2Vycm9yOiBudWxsICEsIHZhbHVlOiB2YWwudG9TdHJpbmcoKX07XG4gIH1cbn1cbiJdfQ==