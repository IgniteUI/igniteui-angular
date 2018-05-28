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
/**
 * An interface implemented by all Angular type decorators, which allows them to be used as ES7
 * decorators as well as
 * Angular DSL syntax.
 *
 * ES7 syntax:
 *
 * ```
 * \@ng.Component({...})
 * class MyClass {...}
 * ```
 *
 * @record
 */
export function TypeDecorator() { }
function TypeDecorator_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    <T extends Type<any>>(type: T): T;
    */
    /* TODO: handle strange member:
    (target: Object, propertyKey?: string|symbol, parameterIndex?: number): void;
    */
}
export const /** @type {?} */ ANNOTATIONS = '__annotations__';
export const /** @type {?} */ PARAMETERS = '__parameters__';
export const /** @type {?} */ PROP_METADATA = '__prop__metadata__';
/**
 * @suppress {globalThis}
 * @param {?} name
 * @param {?=} props
 * @param {?=} parentClass
 * @param {?=} chainFn
 * @param {?=} typeFn
 * @return {?}
 */
export function makeDecorator(name, props, parentClass, chainFn, typeFn) {
    const /** @type {?} */ metaCtor = makeMetadataCtor(props);
    /**
     * @param {...?} args
     * @return {?}
     */
    function DecoratorFactory(...args) {
        if (this instanceof DecoratorFactory) {
            metaCtor.call(this, ...args);
            return this;
        }
        const /** @type {?} */ annotationInstance = new (/** @type {?} */ (DecoratorFactory))(...args);
        const /** @type {?} */ TypeDecorator = /** @type {?} */ (function TypeDecorator(cls) {
            typeFn && typeFn(cls, ...args);
            // Use of Object.defineProperty is important since it creates non-enumerable property which
            // prevents the property is copied during subclassing.
            const /** @type {?} */ annotations = cls.hasOwnProperty(ANNOTATIONS) ?
                (/** @type {?} */ (cls))[ANNOTATIONS] :
                Object.defineProperty(cls, ANNOTATIONS, { value: [] })[ANNOTATIONS];
            annotations.push(annotationInstance);
            return cls;
        });
        if (chainFn)
            chainFn(TypeDecorator);
        return TypeDecorator;
    }
    if (parentClass) {
        DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    DecoratorFactory.prototype.ngMetadataName = name;
    (/** @type {?} */ (DecoratorFactory)).annotationCls = DecoratorFactory;
    return /** @type {?} */ (DecoratorFactory);
}
/**
 * @param {?=} props
 * @return {?}
 */
function makeMetadataCtor(props) {
    return function ctor(...args) {
        if (props) {
            const /** @type {?} */ values = props(...args);
            for (const /** @type {?} */ propName in values) {
                this[propName] = values[propName];
            }
        }
    };
}
/**
 * @param {?} name
 * @param {?=} props
 * @param {?=} parentClass
 * @return {?}
 */
export function makeParamDecorator(name, props, parentClass) {
    const /** @type {?} */ metaCtor = makeMetadataCtor(props);
    /**
     * @param {...?} args
     * @return {?}
     */
    function ParamDecoratorFactory(...args) {
        if (this instanceof ParamDecoratorFactory) {
            metaCtor.apply(this, args);
            return this;
        }
        const /** @type {?} */ annotationInstance = new (/** @type {?} */ (ParamDecoratorFactory))(...args);
        (/** @type {?} */ (ParamDecorator)).annotation = annotationInstance;
        return ParamDecorator;
        /**
         * @param {?} cls
         * @param {?} unusedKey
         * @param {?} index
         * @return {?}
         */
        function ParamDecorator(cls, unusedKey, index) {
            // Use of Object.defineProperty is important since it creates non-enumerable property which
            // prevents the property is copied during subclassing.
            const /** @type {?} */ parameters = cls.hasOwnProperty(PARAMETERS) ?
                (/** @type {?} */ (cls))[PARAMETERS] :
                Object.defineProperty(cls, PARAMETERS, { value: [] })[PARAMETERS];
            // there might be gaps if some in between parameters do not have annotations.
            // we pad with nulls.
            while (parameters.length <= index) {
                parameters.push(null);
            }
            (parameters[index] = parameters[index] || []).push(annotationInstance);
            return cls;
        }
    }
    if (parentClass) {
        ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    ParamDecoratorFactory.prototype.ngMetadataName = name;
    (/** @type {?} */ (ParamDecoratorFactory)).annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
}
/**
 * @param {?} name
 * @param {?=} props
 * @param {?=} parentClass
 * @return {?}
 */
export function makePropDecorator(name, props, parentClass) {
    const /** @type {?} */ metaCtor = makeMetadataCtor(props);
    /**
     * @param {...?} args
     * @return {?}
     */
    function PropDecoratorFactory(...args) {
        if (this instanceof PropDecoratorFactory) {
            metaCtor.apply(this, args);
            return this;
        }
        const /** @type {?} */ decoratorInstance = new (/** @type {?} */ (PropDecoratorFactory))(...args);
        return function PropDecorator(target, name) {
            const /** @type {?} */ constructor = target.constructor;
            // Use of Object.defineProperty is important since it creates non-enumerable property which
            // prevents the property is copied during subclassing.
            const /** @type {?} */ meta = constructor.hasOwnProperty(PROP_METADATA) ?
                (/** @type {?} */ (constructor))[PROP_METADATA] :
                Object.defineProperty(constructor, PROP_METADATA, { value: {} })[PROP_METADATA];
            meta[name] = meta.hasOwnProperty(name) && meta[name] || [];
            meta[name].unshift(decoratorInstance);
        };
    }
    if (parentClass) {
        PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    PropDecoratorFactory.prototype.ngMetadataName = name;
    (/** @type {?} */ (PropDecoratorFactory)).annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3V0aWwvZGVjb3JhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0NBLE1BQU0sQ0FBQyx1QkFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUM7QUFDN0MsTUFBTSxDQUFDLHVCQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQztBQUMzQyxNQUFNLENBQUMsdUJBQU0sYUFBYSxHQUFHLG9CQUFvQixDQUFDOzs7Ozs7Ozs7O0FBS2xELE1BQU0sd0JBQ0YsSUFBWSxFQUFFLEtBQStCLEVBQUUsV0FBaUIsRUFDaEUsT0FBZ0MsRUFBRSxNQUFrRDtJQUV0Rix1QkFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7Ozs7O0lBRXpDLDBCQUEwQixHQUFHLElBQVc7UUFDdEMsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDYjtRQUVELHVCQUFNLGtCQUFrQixHQUFHLElBQUksbUJBQU0sZ0JBQWdCLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hFLHVCQUFNLGFBQWEscUJBQWlDLHVCQUF1QixHQUFjO1lBQ3ZGLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7OztZQUcvQix1QkFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxtQkFBQyxHQUFVLEVBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLENBQUMsY0FB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QWlCLENBQUMsQ0FBQztTQUN2QyxDQUFDO0tBQ0g7SUFFRCxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN2RTtJQUVELG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQ3JELG1CQUFNLG9CQUFvQixFQUFDLENBQUMsYUFBYSxHQUFHLG9CQUFvQixDQUFDO0lBQ2pFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztDQUM3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgaW1wbGVtZW50ZWQgYnkgYWxsIEFuZ3VsYXIgdHlwZSBkZWNvcmF0b3JzLCB3aGljaCBhbGxvd3MgdGhlbSB0byBiZSB1c2VkIGFzIEVTN1xuICogZGVjb3JhdG9ycyBhcyB3ZWxsIGFzXG4gKiBBbmd1bGFyIERTTCBzeW50YXguXG4gKlxuICogRVM3IHN5bnRheDpcbiAqXG4gKiBgYGBcbiAqIEBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBNeUNsYXNzIHsuLi59XG4gKiBgYGBcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZURlY29yYXRvciB7XG4gIC8qKlxuICAgKiBJbnZva2UgYXMgRVM3IGRlY29yYXRvci5cbiAgICovXG4gIDxUIGV4dGVuZHMgVHlwZTxhbnk+Pih0eXBlOiBUKTogVDtcblxuICAvLyBNYWtlIFR5cGVEZWNvcmF0b3IgYXNzaWduYWJsZSB0byBidWlsdC1pbiBQYXJhbWV0ZXJEZWNvcmF0b3IgdHlwZS5cbiAgLy8gUGFyYW1ldGVyRGVjb3JhdG9yIGlzIGRlY2xhcmVkIGluIGxpYi5kLnRzIGFzIGEgYGRlY2xhcmUgdHlwZWBcbiAgLy8gc28gd2UgY2Fubm90IGRlY2xhcmUgdGhpcyBpbnRlcmZhY2UgYXMgYSBzdWJ0eXBlLlxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzM3OSNpc3N1ZWNvbW1lbnQtMTI2MTY5NDE3XG4gICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk/OiBzdHJpbmd8c3ltYm9sLCBwYXJhbWV0ZXJJbmRleD86IG51bWJlcik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBBTk5PVEFUSU9OUyA9ICdfX2Fubm90YXRpb25zX18nO1xuZXhwb3J0IGNvbnN0IFBBUkFNRVRFUlMgPSAnX19wYXJhbWV0ZXJzX18nO1xuZXhwb3J0IGNvbnN0IFBST1BfTUVUQURBVEEgPSAnX19wcm9wX19tZXRhZGF0YV9fJztcblxuLyoqXG4gKiBAc3VwcHJlc3Mge2dsb2JhbFRoaXN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGVjb3JhdG9yKFxuICAgIG5hbWU6IHN0cmluZywgcHJvcHM/OiAoLi4uYXJnczogYW55W10pID0+IGFueSwgcGFyZW50Q2xhc3M/OiBhbnksXG4gICAgY2hhaW5Gbj86IChmbjogRnVuY3Rpb24pID0+IHZvaWQsIHR5cGVGbj86ICh0eXBlOiBUeXBlPGFueT4sIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTpcbiAgICB7bmV3ICguLi5hcmdzOiBhbnlbXSk6IGFueTsgKC4uLmFyZ3M6IGFueVtdKTogYW55OyAoLi4uYXJnczogYW55W10pOiAoY2xzOiBhbnkpID0+IGFueTt9IHtcbiAgY29uc3QgbWV0YUN0b3IgPSBtYWtlTWV0YWRhdGFDdG9yKHByb3BzKTtcblxuICBmdW5jdGlvbiBEZWNvcmF0b3JGYWN0b3J5KC4uLmFyZ3M6IGFueVtdKTogKGNsczogYW55KSA9PiBhbnkge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgRGVjb3JhdG9yRmFjdG9yeSkge1xuICAgICAgbWV0YUN0b3IuY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IGFubm90YXRpb25JbnN0YW5jZSA9IG5ldyAoPGFueT5EZWNvcmF0b3JGYWN0b3J5KSguLi5hcmdzKTtcbiAgICBjb25zdCBUeXBlRGVjb3JhdG9yOiBUeXBlRGVjb3JhdG9yID0gPFR5cGVEZWNvcmF0b3I+ZnVuY3Rpb24gVHlwZURlY29yYXRvcihjbHM6IFR5cGU8YW55Pikge1xuICAgICAgdHlwZUZuICYmIHR5cGVGbihjbHMsIC4uLmFyZ3MpO1xuICAgICAgLy8gVXNlIG9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBpcyBpbXBvcnRhbnQgc2luY2UgaXQgY3JlYXRlcyBub24tZW51bWVyYWJsZSBwcm9wZXJ0eSB3aGljaFxuICAgICAgLy8gcHJldmVudHMgdGhlIHByb3BlcnR5IGlzIGNvcGllZCBkdXJpbmcgc3ViY2xhc3NpbmcuXG4gICAgICBjb25zdCBhbm5vdGF0aW9ucyA9IGNscy5oYXNPd25Qcm9wZXJ0eShBTk5PVEFUSU9OUykgP1xuICAgICAgICAgIChjbHMgYXMgYW55KVtBTk5PVEFUSU9OU10gOlxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbHMsIEFOTk9UQVRJT05TLCB7dmFsdWU6IFtdfSlbQU5OT1RBVElPTlNdO1xuICAgICAgYW5ub3RhdGlvbnMucHVzaChhbm5vdGF0aW9uSW5zdGFuY2UpO1xuICAgICAgcmV0dXJuIGNscztcbiAgICB9O1xuICAgIGlmIChjaGFpbkZuKSBjaGFpbkZuKFR5cGVEZWNvcmF0b3IpO1xuICAgIHJldHVybiBUeXBlRGVjb3JhdG9yO1xuICB9XG5cbiAgaWYgKHBhcmVudENsYXNzKSB7XG4gICAgRGVjb3JhdG9yRmFjdG9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudENsYXNzLnByb3RvdHlwZSk7XG4gIH1cblxuICBEZWNvcmF0b3JGYWN0b3J5LnByb3RvdHlwZS5uZ01ldGFkYXRhTmFtZSA9IG5hbWU7XG4gICg8YW55PkRlY29yYXRvckZhY3RvcnkpLmFubm90YXRpb25DbHMgPSBEZWNvcmF0b3JGYWN0b3J5O1xuICByZXR1cm4gRGVjb3JhdG9yRmFjdG9yeSBhcyBhbnk7XG59XG5cbmZ1bmN0aW9uIG1ha2VNZXRhZGF0YUN0b3IocHJvcHM/OiAoLi4uYXJnczogYW55W10pID0+IGFueSk6IGFueSB7XG4gIHJldHVybiBmdW5jdGlvbiBjdG9yKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKHByb3BzKSB7XG4gICAgICBjb25zdCB2YWx1ZXMgPSBwcm9wcyguLi5hcmdzKTtcbiAgICAgIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gdmFsdWVzKSB7XG4gICAgICAgIHRoaXNbcHJvcE5hbWVdID0gdmFsdWVzW3Byb3BOYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUGFyYW1EZWNvcmF0b3IoXG4gICAgbmFtZTogc3RyaW5nLCBwcm9wcz86ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCBwYXJlbnRDbGFzcz86IGFueSk6IGFueSB7XG4gIGNvbnN0IG1ldGFDdG9yID0gbWFrZU1ldGFkYXRhQ3Rvcihwcm9wcyk7XG4gIGZ1bmN0aW9uIFBhcmFtRGVjb3JhdG9yRmFjdG9yeSguLi5hcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBQYXJhbURlY29yYXRvckZhY3RvcnkpIHtcbiAgICAgIG1ldGFDdG9yLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGNvbnN0IGFubm90YXRpb25JbnN0YW5jZSA9IG5ldyAoPGFueT5QYXJhbURlY29yYXRvckZhY3RvcnkpKC4uLmFyZ3MpO1xuXG4gICAgKDxhbnk+UGFyYW1EZWNvcmF0b3IpLmFubm90YXRpb24gPSBhbm5vdGF0aW9uSW5zdGFuY2U7XG4gICAgcmV0dXJuIFBhcmFtRGVjb3JhdG9yO1xuXG4gICAgZnVuY3Rpb24gUGFyYW1EZWNvcmF0b3IoY2xzOiBhbnksIHVudXNlZEtleTogYW55LCBpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICAgIC8vIFVzZSBvZiBPYmplY3QuZGVmaW5lUHJvcGVydHkgaXMgaW1wb3J0YW50IHNpbmNlIGl0IGNyZWF0ZXMgbm9uLWVudW1lcmFibGUgcHJvcGVydHkgd2hpY2hcbiAgICAgIC8vIHByZXZlbnRzIHRoZSBwcm9wZXJ0eSBpcyBjb3BpZWQgZHVyaW5nIHN1YmNsYXNzaW5nLlxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IGNscy5oYXNPd25Qcm9wZXJ0eShQQVJBTUVURVJTKSA/XG4gICAgICAgICAgKGNscyBhcyBhbnkpW1BBUkFNRVRFUlNdIDpcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xzLCBQQVJBTUVURVJTLCB7dmFsdWU6IFtdfSlbUEFSQU1FVEVSU107XG5cbiAgICAgIC8vIHRoZXJlIG1pZ2h0IGJlIGdhcHMgaWYgc29tZSBpbiBiZXR3ZWVuIHBhcmFtZXRlcnMgZG8gbm90IGhhdmUgYW5ub3RhdGlvbnMuXG4gICAgICAvLyB3ZSBwYWQgd2l0aCBudWxscy5cbiAgICAgIHdoaWxlIChwYXJhbWV0ZXJzLmxlbmd0aCA8PSBpbmRleCkge1xuICAgICAgICBwYXJhbWV0ZXJzLnB1c2gobnVsbCk7XG4gICAgICB9XG5cbiAgICAgIChwYXJhbWV0ZXJzW2luZGV4XSA9IHBhcmFtZXRlcnNbaW5kZXhdIHx8IFtdKS5wdXNoKGFubm90YXRpb25JbnN0YW5jZSk7XG4gICAgICByZXR1cm4gY2xzO1xuICAgIH1cbiAgfVxuICBpZiAocGFyZW50Q2xhc3MpIHtcbiAgICBQYXJhbURlY29yYXRvckZhY3RvcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnRDbGFzcy5wcm90b3R5cGUpO1xuICB9XG4gIFBhcmFtRGVjb3JhdG9yRmFjdG9yeS5wcm90b3R5cGUubmdNZXRhZGF0YU5hbWUgPSBuYW1lO1xuICAoPGFueT5QYXJhbURlY29yYXRvckZhY3RvcnkpLmFubm90YXRpb25DbHMgPSBQYXJhbURlY29yYXRvckZhY3Rvcnk7XG4gIHJldHVybiBQYXJhbURlY29yYXRvckZhY3Rvcnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUHJvcERlY29yYXRvcihcbiAgICBuYW1lOiBzdHJpbmcsIHByb3BzPzogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIHBhcmVudENsYXNzPzogYW55KTogYW55IHtcbiAgY29uc3QgbWV0YUN0b3IgPSBtYWtlTWV0YWRhdGFDdG9yKHByb3BzKTtcblxuICBmdW5jdGlvbiBQcm9wRGVjb3JhdG9yRmFjdG9yeSguLi5hcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBQcm9wRGVjb3JhdG9yRmFjdG9yeSkge1xuICAgICAgbWV0YUN0b3IuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25zdCBkZWNvcmF0b3JJbnN0YW5jZSA9IG5ldyAoPGFueT5Qcm9wRGVjb3JhdG9yRmFjdG9yeSkoLi4uYXJncyk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gUHJvcERlY29yYXRvcih0YXJnZXQ6IGFueSwgbmFtZTogc3RyaW5nKSB7XG4gICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvcjtcbiAgICAgIC8vIFVzZSBvZiBPYmplY3QuZGVmaW5lUHJvcGVydHkgaXMgaW1wb3J0YW50IHNpbmNlIGl0IGNyZWF0ZXMgbm9uLWVudW1lcmFibGUgcHJvcGVydHkgd2hpY2hcbiAgICAgIC8vIHByZXZlbnRzIHRoZSBwcm9wZXJ0eSBpcyBjb3BpZWQgZHVyaW5nIHN1YmNsYXNzaW5nLlxuICAgICAgY29uc3QgbWV0YSA9IGNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KFBST1BfTUVUQURBVEEpID9cbiAgICAgICAgICAoY29uc3RydWN0b3IgYXMgYW55KVtQUk9QX01FVEFEQVRBXSA6XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLCBQUk9QX01FVEFEQVRBLCB7dmFsdWU6IHt9fSlbUFJPUF9NRVRBREFUQV07XG4gICAgICBtZXRhW25hbWVdID0gbWV0YS5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiBtZXRhW25hbWVdIHx8IFtdO1xuICAgICAgbWV0YVtuYW1lXS51bnNoaWZ0KGRlY29yYXRvckluc3RhbmNlKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHBhcmVudENsYXNzKSB7XG4gICAgUHJvcERlY29yYXRvckZhY3RvcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnRDbGFzcy5wcm90b3R5cGUpO1xuICB9XG5cbiAgUHJvcERlY29yYXRvckZhY3RvcnkucHJvdG90eXBlLm5nTWV0YWRhdGFOYW1lID0gbmFtZTtcbiAgKDxhbnk+UHJvcERlY29yYXRvckZhY3RvcnkpLmFubm90YXRpb25DbHMgPSBQcm9wRGVjb3JhdG9yRmFjdG9yeTtcbiAgcmV0dXJuIFByb3BEZWNvcmF0b3JGYWN0b3J5O1xufVxuIl19