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
import { Type, isType } from '../type';
import { global, stringify } from '../util';
import { ANNOTATIONS, PARAMETERS, PROP_METADATA } from '../util/decorators';
/**
 * Attention: These regex has to hold even if the code is minified!
 */
export const /** @type {?} */ DELEGATE_CTOR = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*arguments\)/;
export const /** @type {?} */ INHERITED_CLASS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[A-Za-z\d$_]+\s*{/;
export const /** @type {?} */ INHERITED_CLASS_WITH_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[A-Za-z\d$_]+\s*{[\s\S]*constructor\s*\(/;
export class ReflectionCapabilities {
    /**
     * @param {?=} reflect
     */
    constructor(reflect) { this._reflect = reflect || global['Reflect']; }
    /**
     * @return {?}
     */
    isReflectionEnabled() { return true; }
    /**
     * @template T
     * @param {?} t
     * @return {?}
     */
    factory(t) { return (...args) => new t(...args); }
    /**
     * \@internal
     * @param {?} paramTypes
     * @param {?} paramAnnotations
     * @return {?}
     */
    _zipTypesAndAnnotations(paramTypes, paramAnnotations) {
        let /** @type {?} */ result;
        if (typeof paramTypes === 'undefined') {
            result = new Array(paramAnnotations.length);
        }
        else {
            result = new Array(paramTypes.length);
        }
        for (let /** @type {?} */ i = 0; i < result.length; i++) {
            // TS outputs Object for parameters without types, while Traceur omits
            // the annotations. For now we preserve the Traceur behavior to aid
            // migration, but this can be revisited.
            if (typeof paramTypes === 'undefined') {
                result[i] = [];
            }
            else if (paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
            }
            else {
                result[i] = [];
            }
            if (paramAnnotations && paramAnnotations[i] != null) {
                result[i] = result[i].concat(paramAnnotations[i]);
            }
        }
        return result;
    }
    /**
     * @param {?} type
     * @param {?} parentCtor
     * @return {?}
     */
    _ownParameters(type, parentCtor) {
        const /** @type {?} */ typeStr = type.toString();
        // If we have no decorators, we only have function.length as metadata.
        // In that case, to detect whether a child class declared an own constructor or not,
        // we need to look inside of that constructor to check whether it is
        // just calling the parent.
        // This also helps to work around for https://github.com/Microsoft/TypeScript/issues/12439
        // that sets 'design:paramtypes' to []
        // if a class inherits from another class but has no ctor declared itself.
        if (DELEGATE_CTOR.exec(typeStr) ||
            (INHERITED_CLASS.exec(typeStr) && !INHERITED_CLASS_WITH_CTOR.exec(typeStr))) {
            return null;
        }
        // Prefer the direct API.
        if ((/** @type {?} */ (type)).parameters && (/** @type {?} */ (type)).parameters !== parentCtor.parameters) {
            return (/** @type {?} */ (type)).parameters;
        }
        // API of tsickle for lowering decorators to properties on the class.
        const /** @type {?} */ tsickleCtorParams = (/** @type {?} */ (type)).ctorParameters;
        if (tsickleCtorParams && tsickleCtorParams !== parentCtor.ctorParameters) {
            // Newer tsickle uses a function closure
            // Retain the non-function case for compatibility with older tsickle
            const /** @type {?} */ ctorParameters = typeof tsickleCtorParams === 'function' ? tsickleCtorParams() : tsickleCtorParams;
            const /** @type {?} */ paramTypes = ctorParameters.map((ctorParam) => ctorParam && ctorParam.type);
            const /** @type {?} */ paramAnnotations = ctorParameters.map((ctorParam) => ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators));
            return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
        }
        // API for metadata created by invoking the decorators.
        const /** @type {?} */ paramAnnotations = type.hasOwnProperty(PARAMETERS) && (/** @type {?} */ (type))[PARAMETERS];
        const /** @type {?} */ paramTypes = this._reflect && this._reflect.getOwnMetadata &&
            this._reflect.getOwnMetadata('design:paramtypes', type);
        if (paramTypes || paramAnnotations) {
            return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
        }
        // If a class has no decorators, at least create metadata
        // based on function.length.
        // Note: We know that this is a real constructor as we checked
        // the content of the constructor above.
        return new Array((/** @type {?} */ (type.length))).fill(undefined);
    }
    /**
     * @param {?} type
     * @return {?}
     */
    parameters(type) {
        // Note: only report metadata if we have at least one class decorator
        // to stay in sync with the static reflector.
        if (!isType(type)) {
            return [];
        }
        const /** @type {?} */ parentCtor = getParentCtor(type);
        let /** @type {?} */ parameters = this._ownParameters(type, parentCtor);
        if (!parameters && parentCtor !== Object) {
            parameters = this.parameters(parentCtor);
        }
        return parameters || [];
    }
    /**
     * @param {?} typeOrFunc
     * @param {?} parentCtor
     * @return {?}
     */
    _ownAnnotations(typeOrFunc, parentCtor) {
        // Prefer the direct API.
        if ((/** @type {?} */ (typeOrFunc)).annotations && (/** @type {?} */ (typeOrFunc)).annotations !== parentCtor.annotations) {
            let /** @type {?} */ annotations = (/** @type {?} */ (typeOrFunc)).annotations;
            if (typeof annotations === 'function' && annotations.annotations) {
                annotations = annotations.annotations;
            }
            return annotations;
        }
        // API of tsickle for lowering decorators to properties on the class.
        if ((/** @type {?} */ (typeOrFunc)).decorators && (/** @type {?} */ (typeOrFunc)).decorators !== parentCtor.decorators) {
            return convertTsickleDecoratorIntoMetadata((/** @type {?} */ (typeOrFunc)).decorators);
        }
        // API for metadata created by invoking the decorators.
        if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
            return (/** @type {?} */ (typeOrFunc))[ANNOTATIONS];
        }
        return null;
    }
    /**
     * @param {?} typeOrFunc
     * @return {?}
     */
    annotations(typeOrFunc) {
        if (!isType(typeOrFunc)) {
            return [];
        }
        const /** @type {?} */ parentCtor = getParentCtor(typeOrFunc);
        const /** @type {?} */ ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
        const /** @type {?} */ parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
        return parentAnnotations.concat(ownAnnotations);
    }
    /**
     * @param {?} typeOrFunc
     * @param {?} parentCtor
     * @return {?}
     */
    _ownPropMetadata(typeOrFunc, parentCtor) {
        // Prefer the direct API.
        if ((/** @type {?} */ (typeOrFunc)).propMetadata &&
            (/** @type {?} */ (typeOrFunc)).propMetadata !== parentCtor.propMetadata) {
            let /** @type {?} */ propMetadata = (/** @type {?} */ (typeOrFunc)).propMetadata;
            if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
                propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
        }
        // API of tsickle for lowering decorators to properties on the class.
        if ((/** @type {?} */ (typeOrFunc)).propDecorators &&
            (/** @type {?} */ (typeOrFunc)).propDecorators !== parentCtor.propDecorators) {
            const /** @type {?} */ propDecorators = (/** @type {?} */ (typeOrFunc)).propDecorators;
            const /** @type {?} */ propMetadata = /** @type {?} */ ({});
            Object.keys(propDecorators).forEach(prop => {
                propMetadata[prop] = convertTsickleDecoratorIntoMetadata(propDecorators[prop]);
            });
            return propMetadata;
        }
        // API for metadata created by invoking the decorators.
        if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
            return (/** @type {?} */ (typeOrFunc))[PROP_METADATA];
        }
        return null;
    }
    /**
     * @param {?} typeOrFunc
     * @return {?}
     */
    propMetadata(typeOrFunc) {
        if (!isType(typeOrFunc)) {
            return {};
        }
        const /** @type {?} */ parentCtor = getParentCtor(typeOrFunc);
        const /** @type {?} */ propMetadata = {};
        if (parentCtor !== Object) {
            const /** @type {?} */ parentPropMetadata = this.propMetadata(parentCtor);
            Object.keys(parentPropMetadata).forEach((propName) => {
                propMetadata[propName] = parentPropMetadata[propName];
            });
        }
        const /** @type {?} */ ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
        if (ownPropMetadata) {
            Object.keys(ownPropMetadata).forEach((propName) => {
                const /** @type {?} */ decorators = [];
                if (propMetadata.hasOwnProperty(propName)) {
                    decorators.push(...propMetadata[propName]);
                }
                decorators.push(...ownPropMetadata[propName]);
                propMetadata[propName] = decorators;
            });
        }
        return propMetadata;
    }
    /**
     * @param {?} type
     * @param {?} lcProperty
     * @return {?}
     */
    hasLifecycleHook(type, lcProperty) {
        return type instanceof Type && lcProperty in type.prototype;
    }
    /**
     * @param {?} type
     * @return {?}
     */
    guards(type) { return {}; }
    /**
     * @param {?} name
     * @return {?}
     */
    getter(name) { return /** @type {?} */ (new Function('o', 'return o.' + name + ';')); }
    /**
     * @param {?} name
     * @return {?}
     */
    setter(name) {
        return /** @type {?} */ (new Function('o', 'v', 'return o.' + name + ' = v;'));
    }
    /**
     * @param {?} name
     * @return {?}
     */
    method(name) {
        const /** @type {?} */ functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
        return /** @type {?} */ (new Function('o', 'args', functionBody));
    }
    /**
     * @param {?} type
     * @return {?}
     */
    importUri(type) {
        // StaticSymbol
        if (typeof type === 'object' && type['filePath']) {
            return type['filePath'];
        }
        // Runtime type
        return `./${stringify(type)}`;
    }
    /**
     * @param {?} type
     * @return {?}
     */
    resourceUri(type) { return `./${stringify(type)}`; }
    /**
     * @param {?} name
     * @param {?} moduleUrl
     * @param {?} members
     * @param {?} runtime
     * @return {?}
     */
    resolveIdentifier(name, moduleUrl, members, runtime) {
        return runtime;
    }
    /**
     * @param {?} enumIdentifier
     * @param {?} name
     * @return {?}
     */
    resolveEnum(enumIdentifier, name) { return enumIdentifier[name]; }
}
function ReflectionCapabilities_tsickle_Closure_declarations() {
    /** @type {?} */
    ReflectionCapabilities.prototype._reflect;
}
/**
 * @param {?} decoratorInvocations
 * @return {?}
 */
function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
    if (!decoratorInvocations) {
        return [];
    }
    return decoratorInvocations.map(decoratorInvocation => {
        const /** @type {?} */ decoratorType = decoratorInvocation.type;
        const /** @type {?} */ annotationCls = decoratorType.annotationCls;
        const /** @type {?} */ annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
        return new annotationCls(...annotationArgs);
    });
}
/**
 * @param {?} ctor
 * @return {?}
 */
function getParentCtor(ctor) {
    const /** @type {?} */ parentProto = ctor.prototype ? Object.getPrototypeOf(ctor.prototype) : null;
    const /** @type {?} */ parentCtor = parentProto ? parentProto.constructor : null;
    // Note: We always use `Object` as the null value
    // to simplify checking later on.
    return parentCtor || Object;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdGlvbl9jYXBhYmlsaXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZWZsZWN0aW9uL3JlZmxlY3Rpb25fY2FwYWJpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDckMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7Ozs7QUFTMUUsTUFBTSxDQUFDLHVCQUFNLGFBQWEsR0FBRyw0REFBNEQsQ0FBQztBQUMxRixNQUFNLENBQUMsdUJBQU0sZUFBZSxHQUFHLHNEQUFzRCxDQUFDO0FBQ3RGLE1BQU0sQ0FBQyx1QkFBTSx5QkFBeUIsR0FDbEMsNkVBQTZFLENBQUM7QUFFbEYsTUFBTTs7OztJQUdKLFlBQVksT0FBYSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFOzs7O0lBRTVFLG1CQUFtQixLQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTs7Ozs7O0lBRS9DLE9BQU8sQ0FBSSxDQUFVLElBQXdCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7SUFHekYsdUJBQXVCLENBQUMsVUFBaUIsRUFBRSxnQkFBdUI7UUFDaEUscUJBQUksTUFBZSxDQUFDO1FBRXBCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sVUFBVSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLGdCQUFn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Q0FBQztDQUM3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlLCBpc1R5cGV9IGZyb20gJy4uL3R5cGUnO1xuaW1wb3J0IHtnbG9iYWwsIHN0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge0FOTk9UQVRJT05TLCBQQVJBTUVURVJTLCBQUk9QX01FVEFEQVRBfSBmcm9tICcuLi91dGlsL2RlY29yYXRvcnMnO1xuXG5pbXBvcnQge1BsYXRmb3JtUmVmbGVjdGlvbkNhcGFiaWxpdGllc30gZnJvbSAnLi9wbGF0Zm9ybV9yZWZsZWN0aW9uX2NhcGFiaWxpdGllcyc7XG5pbXBvcnQge0dldHRlckZuLCBNZXRob2RGbiwgU2V0dGVyRm59IGZyb20gJy4vdHlwZXMnO1xuXG5cbi8qKlxuICogQXR0ZW50aW9uOiBUaGVzZSByZWdleCBoYXMgdG8gaG9sZCBldmVuIGlmIHRoZSBjb2RlIGlzIG1pbmlmaWVkIVxuICovXG5leHBvcnQgY29uc3QgREVMRUdBVEVfQ1RPUiA9IC9eZnVuY3Rpb25cXHMrXFxTK1xcKFxcKVxccyp7W1xcc1xcU10rXFwuYXBwbHlcXCh0aGlzLFxccyphcmd1bWVudHNcXCkvO1xuZXhwb3J0IGNvbnN0IElOSEVSSVRFRF9DTEFTUyA9IC9eY2xhc3NcXHMrW0EtWmEtelxcZCRfXSpcXHMqZXh0ZW5kc1xccytbQS1aYS16XFxkJF9dK1xccyp7LztcbmV4cG9ydCBjb25zdCBJTkhFUklURURfQ0xBU1NfV0lUSF9DVE9SID1cbiAgICAvXmNsYXNzXFxzK1tBLVphLXpcXGQkX10qXFxzKmV4dGVuZHNcXHMrW0EtWmEtelxcZCRfXStcXHMqe1tcXHNcXFNdKmNvbnN0cnVjdG9yXFxzKlxcKC87XG5cbmV4cG9ydCBjbGFzcyBSZWZsZWN0aW9uQ2FwYWJpbGl0aWVzIGltcGxlbWVudHMgUGxhdGZvcm1SZWZsZWN0aW9uQ2FwYWJpbGl0aWVzIHtcbiAgcHJpdmF0ZSBfcmVmbGVjdDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHJlZmxlY3Q/OiBhbnkpIHsgdGhpcy5fcmVmbGVjdCA9IHJlZmxlY3QgfHwgZ2xvYmFsWydSZWZsZWN0J107IH1cblxuICBpc1JlZmxlY3Rpb25FbmFibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIGZhY3Rvcnk8VD4odDogVHlwZTxUPik6IChhcmdzOiBhbnlbXSkgPT4gVCB7IHJldHVybiAoLi4uYXJnczogYW55W10pID0+IG5ldyB0KC4uLmFyZ3MpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfemlwVHlwZXNBbmRBbm5vdGF0aW9ucyhwYXJhbVR5cGVzOiBhbnlbXSwgcGFyYW1Bbm5vdGF0aW9uczogYW55W10pOiBhbnlbXVtdIHtcbiAgICBsZXQgcmVzdWx0OiBhbnlbXVtdO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJhbVR5cGVzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KHBhcmFtQW5ub3RhdGlvbnMubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KHBhcmFtVHlwZXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdC5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gVFMgb3V0cHV0cyBPYmplY3QgZm9yIHBhcmFtZXRlcnMgd2l0aG91dCB0eXBlcywgd2hpbGUgVHJhY2V1ciBvbWl0c1xuICAgICAgLy8gdGhlIGFubm90YXRpb25zLiBGb3Igbm93IHdlIHByZXNlcnZlIHRoZSBUcmFjZXVyIGJlaGF2aW9yIHRvIGFpZFxuICAgICAgLy8gbWlncmF0aW9uLCBidXQgdGhpcyBjYW4gYmUgcmV2aXNpdGVkLlxuICAgICAgaWYgKHR5cGVvZiBwYXJhbVR5cGVzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXN1bHRbaV0gPSBbXTtcbiAgICAgIH0gZWxzZSBpZiAocGFyYW1UeXBlc1tpXSAhPSBPYmplY3QpIHtcbiAgICAgICAgcmVzdWx0W2ldID0gW3BhcmFtVHlwZXNbaV1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2ldID0gW107XG4gICAgICB9XG4gICAgICBpZiAocGFyYW1Bbm5vdGF0aW9ucyAmJiBwYXJhbUFubm90YXRpb25zW2ldICE9IG51bGwpIHtcbiAgICAgICAgcmVzdWx0W2ldID0gcmVzdWx0W2ldLmNvbmNhdChwYXJhbUFubm90YXRpb25zW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX293blBhcmFtZXRlcnModHlwZTogVHlwZTxhbnk+LCBwYXJlbnRDdG9yOiBhbnkpOiBhbnlbXVtdfG51bGwge1xuICAgIGNvbnN0IHR5cGVTdHIgPSB0eXBlLnRvU3RyaW5nKCk7XG4gICAgLy8gSWYgd2UgaGF2ZSBubyBkZWNvcmF0b3JzLCB3ZSBvbmx5IGhhdmUgZnVuY3Rpb24ubGVuZ3RoIGFzIG1ldGFkYXRhLlxuICAgIC8vIEluIHRoYXQgY2FzZSwgdG8gZGV0ZWN0IHdoZXRoZXIgYSBjaGlsZCBjbGFzcyBkZWNsYXJlZCBhbiBvd24gY29uc3RydWN0b3Igb3Igbm90LFxuICAgIC8vIHdlIG5lZWQgdG8gbG9vayBpbnNpZGUgb2YgdGhhdCBjb25zdHJ1Y3RvciB0byBjaGVjayB3aGV0aGVyIGl0IGlzXG4gICAgLy8ganVzdCBjYWxsaW5nIHRoZSBwYXJlbnQuXG4gICAgLy8gVGhpcyBhbHNvIGhlbHBzIHRvIHdvcmsgYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzEyNDM5XG4gICAgLy8gdGhhdCBzZXRzICdkZXNpZ246cGFyYW10eXBlcycgdG8gW11cbiAgICAvLyBpZiBhIGNsYXNzIGluaGVyaXRzIGZyb20gYW5vdGhlciBjbGFzcyBidXQgaGFzIG5vIGN0b3IgZGVjbGFyZWQgaXRzZWxmLlxuICAgIGlmIChERUxFR0FURV9DVE9SLmV4ZWModHlwZVN0cikgfHxcbiAgICAgICAgKElOSEVSSVRFRF9DTEFTUy5leGVjKHR5cGVTdHIpICYmICFJTkhFUklURURfQ0xBU1NfV0lUSF9DVE9SLmV4ZWModHlwZVN0cikpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBQcmVmZXIgdGhlIGRpcmVjdCBBUEkuXG4gICAgaWYgKCg8YW55PnR5cGUpLnBhcmFtZXRlcnMgJiYgKDxhbnk+dHlwZSkucGFyYW1ldGVycyAhPT0gcGFyZW50Q3Rvci5wYXJhbWV0ZXJzKSB7XG4gICAgICByZXR1cm4gKDxhbnk+dHlwZSkucGFyYW1ldGVycztcbiAgICB9XG5cbiAgICAvLyBBUEkgb2YgdHNpY2tsZSBmb3IgbG93ZXJpbmcgZGVjb3JhdG9ycyB0byBwcm9wZXJ0aWVzIG9uIHRoZSBjbGFzcy5cbiAgICBjb25zdCB0c2lja2xlQ3RvclBhcmFtcyA9ICg8YW55PnR5cGUpLmN0b3JQYXJhbWV0ZXJzO1xuICAgIGlmICh0c2lja2xlQ3RvclBhcmFtcyAmJiB0c2lja2xlQ3RvclBhcmFtcyAhPT0gcGFyZW50Q3Rvci5jdG9yUGFyYW1ldGVycykge1xuICAgICAgLy8gTmV3ZXIgdHNpY2tsZSB1c2VzIGEgZnVuY3Rpb24gY2xvc3VyZVxuICAgICAgLy8gUmV0YWluIHRoZSBub24tZnVuY3Rpb24gY2FzZSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG9sZGVyIHRzaWNrbGVcbiAgICAgIGNvbnN0IGN0b3JQYXJhbWV0ZXJzID1cbiAgICAgICAgICB0eXBlb2YgdHNpY2tsZUN0b3JQYXJhbXMgPT09ICdmdW5jdGlvbicgPyB0c2lja2xlQ3RvclBhcmFtcygpIDogdHNpY2tsZUN0b3JQYXJhbXM7XG4gICAgICBjb25zdCBwYXJhbVR5cGVzID0gY3RvclBhcmFtZXRlcnMubWFwKChjdG9yUGFyYW06IGFueSkgPT4gY3RvclBhcmFtICYmIGN0b3JQYXJhbS50eXBlKTtcbiAgICAgIGNvbnN0IHBhcmFtQW5ub3RhdGlvbnMgPSBjdG9yUGFyYW1ldGVycy5tYXAoXG4gICAgICAgICAgKGN0b3JQYXJhbTogYW55KSA9PlxuICAgICAgICAgICAgICBjdG9yUGFyYW0gJiYgY29udmVydFRzaWNrbGVEZWNvcmF0b3JJbnRvTWV0YWRhdGEoY3RvclBhcmFtLmRlY29yYXRvcnMpKTtcbiAgICAgIHJldHVybiB0aGlzLl96aXBUeXBlc0FuZEFubm90YXRpb25zKHBhcmFtVHlwZXMsIHBhcmFtQW5ub3RhdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIEFQSSBmb3IgbWV0YWRhdGEgY3JlYXRlZCBieSBpbnZva2luZyB0aGUgZGVjb3JhdG9ycy5cbiAgICBjb25zdCBwYXJhbUFubm90YXRpb25zID0gdHlwZS5oYXNPd25Qcm9wZXJ0eShQQVJBTUVURVJTKSAmJiAodHlwZSBhcyBhbnkpW1BBUkFNRVRFUlNdO1xuICAgIGNvbnN0IHBhcmFtVHlwZXMgPSB0aGlzLl9yZWZsZWN0ICYmIHRoaXMuX3JlZmxlY3QuZ2V0T3duTWV0YWRhdGEgJiZcbiAgICAgICAgdGhpcy5fcmVmbGVjdC5nZXRPd25NZXRhZGF0YSgnZGVzaWduOnBhcmFtdHlwZXMnLCB0eXBlKTtcbiAgICBpZiAocGFyYW1UeXBlcyB8fCBwYXJhbUFubm90YXRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5femlwVHlwZXNBbmRBbm5vdGF0aW9ucyhwYXJhbVR5cGVzLCBwYXJhbUFubm90YXRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBJZiBhIGNsYXNzIGhhcyBubyBkZWNvcmF0b3JzLCBhdCBsZWFzdCBjcmVhdGUgbWV0YWRhdGFcbiAgICAvLyBiYXNlZCBvbiBmdW5jdGlvbi5sZW5ndGguXG4gICAgLy8gTm90ZTogV2Uga25vdyB0aGF0IHRoaXMgaXMgYSByZWFsIGNvbnN0cnVjdG9yIGFzIHdlIGNoZWNrZWRcbiAgICAvLyB0aGUgY29udGVudCBvZiB0aGUgY29uc3RydWN0b3IgYWJvdmUuXG4gICAgcmV0dXJuIG5ldyBBcnJheSgoPGFueT50eXBlLmxlbmd0aCkpLmZpbGwodW5kZWZpbmVkKTtcbiAgfVxuXG4gIHBhcmFtZXRlcnModHlwZTogVHlwZTxhbnk+KTogYW55W11bXSB7XG4gICAgLy8gTm90ZTogb25seSByZXBvcnQgbWV0YWRhdGEgaWYgd2UgaGF2ZSBhdCBsZWFzdCBvbmUgY2xhc3MgZGVjb3JhdG9yXG4gICAgLy8gdG8gc3RheSBpbiBzeW5jIHdpdGggdGhlIHN0YXRpYyByZWZsZWN0b3IuXG4gICAgaWYgKCFpc1R5cGUodHlwZSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50Q3RvciA9IGdldFBhcmVudEN0b3IodHlwZSk7XG4gICAgbGV0IHBhcmFtZXRlcnMgPSB0aGlzLl9vd25QYXJhbWV0ZXJzKHR5cGUsIHBhcmVudEN0b3IpO1xuICAgIGlmICghcGFyYW1ldGVycyAmJiBwYXJlbnRDdG9yICE9PSBPYmplY3QpIHtcbiAgICAgIHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnMocGFyZW50Q3Rvcik7XG4gICAgfVxuICAgIHJldHVybiBwYXJhbWV0ZXJzIHx8IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3duQW5ub3RhdGlvbnModHlwZU9yRnVuYzogVHlwZTxhbnk+LCBwYXJlbnRDdG9yOiBhbnkpOiBhbnlbXXxudWxsIHtcbiAgICAvLyBQcmVmZXIgdGhlIGRpcmVjdCBBUEkuXG4gICAgaWYgKCg8YW55PnR5cGVPckZ1bmMpLmFubm90YXRpb25zICYmICg8YW55PnR5cGVPckZ1bmMpLmFubm90YXRpb25zICE9PSBwYXJlbnRDdG9yLmFubm90YXRpb25zKSB7XG4gICAgICBsZXQgYW5ub3RhdGlvbnMgPSAoPGFueT50eXBlT3JGdW5jKS5hbm5vdGF0aW9ucztcbiAgICAgIGlmICh0eXBlb2YgYW5ub3RhdGlvbnMgPT09ICdmdW5jdGlvbicgJiYgYW5ub3RhdGlvbnMuYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgYW5ub3RhdGlvbnMgPSBhbm5vdGF0aW9ucy5hbm5vdGF0aW9ucztcbiAgICAgIH1cbiAgICAgIHJldHVybiBhbm5vdGF0aW9ucztcbiAgICB9XG5cbiAgICAvLyBBUEkgb2YgdHNpY2tsZSBmb3IgbG93ZXJpbmcgZGVjb3JhdG9ycyB0byBwcm9wZXJ0aWVzIG9uIHRoZSBjbGFzcy5cbiAgICBpZiAoKDxhbnk+dHlwZU9yRnVuYykuZGVjb3JhdG9ycyAmJiAoPGFueT50eXBlT3JGdW5jKS5kZWNvcmF0b3JzICE9PSBwYXJlbnRDdG9yLmRlY29yYXRvcnMpIHtcbiAgICAgIHJldHVybiBjb252ZXJ0VHNpY2tsZURlY29yYXRvckludG9NZXRhZGF0YSgoPGFueT50eXBlT3JGdW5jKS5kZWNvcmF0b3JzKTtcbiAgICB9XG5cbiAgICAvLyBBUEkgZm9yIG1ldGFkYXRhIGNyZWF0ZWQgYnkgaW52b2tpbmcgdGhlIGRlY29yYXRvcnMuXG4gICAgaWYgKHR5cGVPckZ1bmMuaGFzT3duUHJvcGVydHkoQU5OT1RBVElPTlMpKSB7XG4gICAgICByZXR1cm4gKHR5cGVPckZ1bmMgYXMgYW55KVtBTk5PVEFUSU9OU107XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYW5ub3RhdGlvbnModHlwZU9yRnVuYzogVHlwZTxhbnk+KTogYW55W10ge1xuICAgIGlmICghaXNUeXBlKHR5cGVPckZ1bmMpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudEN0b3IgPSBnZXRQYXJlbnRDdG9yKHR5cGVPckZ1bmMpO1xuICAgIGNvbnN0IG93bkFubm90YXRpb25zID0gdGhpcy5fb3duQW5ub3RhdGlvbnModHlwZU9yRnVuYywgcGFyZW50Q3RvcikgfHwgW107XG4gICAgY29uc3QgcGFyZW50QW5ub3RhdGlvbnMgPSBwYXJlbnRDdG9yICE9PSBPYmplY3QgPyB0aGlzLmFubm90YXRpb25zKHBhcmVudEN0b3IpIDogW107XG4gICAgcmV0dXJuIHBhcmVudEFubm90YXRpb25zLmNvbmNhdChvd25Bbm5vdGF0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIF9vd25Qcm9wTWV0YWRhdGEodHlwZU9yRnVuYzogYW55LCBwYXJlbnRDdG9yOiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55W119fG51bGwge1xuICAgIC8vIFByZWZlciB0aGUgZGlyZWN0IEFQSS5cbiAgICBpZiAoKDxhbnk+dHlwZU9yRnVuYykucHJvcE1ldGFkYXRhICYmXG4gICAgICAgICg8YW55PnR5cGVPckZ1bmMpLnByb3BNZXRhZGF0YSAhPT0gcGFyZW50Q3Rvci5wcm9wTWV0YWRhdGEpIHtcbiAgICAgIGxldCBwcm9wTWV0YWRhdGEgPSAoPGFueT50eXBlT3JGdW5jKS5wcm9wTWV0YWRhdGE7XG4gICAgICBpZiAodHlwZW9mIHByb3BNZXRhZGF0YSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wTWV0YWRhdGEucHJvcE1ldGFkYXRhKSB7XG4gICAgICAgIHByb3BNZXRhZGF0YSA9IHByb3BNZXRhZGF0YS5wcm9wTWV0YWRhdGE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcE1ldGFkYXRhO1xuICAgIH1cblxuICAgIC8vIEFQSSBvZiB0c2lja2xlIGZvciBsb3dlcmluZyBkZWNvcmF0b3JzIHRvIHByb3BlcnRpZXMgb24gdGhlIGNsYXNzLlxuICAgIGlmICgoPGFueT50eXBlT3JGdW5jKS5wcm9wRGVjb3JhdG9ycyAmJlxuICAgICAgICAoPGFueT50eXBlT3JGdW5jKS5wcm9wRGVjb3JhdG9ycyAhPT0gcGFyZW50Q3Rvci5wcm9wRGVjb3JhdG9ycykge1xuICAgICAgY29uc3QgcHJvcERlY29yYXRvcnMgPSAoPGFueT50eXBlT3JGdW5jKS5wcm9wRGVjb3JhdG9ycztcbiAgICAgIGNvbnN0IHByb3BNZXRhZGF0YSA9IDx7W2tleTogc3RyaW5nXTogYW55W119Pnt9O1xuICAgICAgT2JqZWN0LmtleXMocHJvcERlY29yYXRvcnMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIHByb3BNZXRhZGF0YVtwcm9wXSA9IGNvbnZlcnRUc2lja2xlRGVjb3JhdG9ySW50b01ldGFkYXRhKHByb3BEZWNvcmF0b3JzW3Byb3BdKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb3BNZXRhZGF0YTtcbiAgICB9XG5cbiAgICAvLyBBUEkgZm9yIG1ldGFkYXRhIGNyZWF0ZWQgYnkgaW52b2tpbmcgdGhlIGRlY29yYXRvcnMuXG4gICAgaWYgKHR5cGVPckZ1bmMuaGFzT3duUHJvcGVydHkoUFJPUF9NRVRBREFUQSkpIHtcbiAgICAgIHJldHVybiAodHlwZU9yRnVuYyBhcyBhbnkpW1BST1BfTUVUQURBVEFdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByb3BNZXRhZGF0YSh0eXBlT3JGdW5jOiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55W119IHtcbiAgICBpZiAoIWlzVHlwZSh0eXBlT3JGdW5jKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRDdG9yID0gZ2V0UGFyZW50Q3Rvcih0eXBlT3JGdW5jKTtcbiAgICBjb25zdCBwcm9wTWV0YWRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0gPSB7fTtcbiAgICBpZiAocGFyZW50Q3RvciAhPT0gT2JqZWN0KSB7XG4gICAgICBjb25zdCBwYXJlbnRQcm9wTWV0YWRhdGEgPSB0aGlzLnByb3BNZXRhZGF0YShwYXJlbnRDdG9yKTtcbiAgICAgIE9iamVjdC5rZXlzKHBhcmVudFByb3BNZXRhZGF0YSkuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcbiAgICAgICAgcHJvcE1ldGFkYXRhW3Byb3BOYW1lXSA9IHBhcmVudFByb3BNZXRhZGF0YVtwcm9wTmFtZV07XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3Qgb3duUHJvcE1ldGFkYXRhID0gdGhpcy5fb3duUHJvcE1ldGFkYXRhKHR5cGVPckZ1bmMsIHBhcmVudEN0b3IpO1xuICAgIGlmIChvd25Qcm9wTWV0YWRhdGEpIHtcbiAgICAgIE9iamVjdC5rZXlzKG93blByb3BNZXRhZGF0YSkuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgZGVjb3JhdG9yczogYW55W10gPSBbXTtcbiAgICAgICAgaWYgKHByb3BNZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICBkZWNvcmF0b3JzLnB1c2goLi4ucHJvcE1ldGFkYXRhW3Byb3BOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVjb3JhdG9ycy5wdXNoKC4uLm93blByb3BNZXRhZGF0YVtwcm9wTmFtZV0pO1xuICAgICAgICBwcm9wTWV0YWRhdGFbcHJvcE5hbWVdID0gZGVjb3JhdG9ycztcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcE1ldGFkYXRhO1xuICB9XG5cbiAgaGFzTGlmZWN5Y2xlSG9vayh0eXBlOiBhbnksIGxjUHJvcGVydHk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlIGluc3RhbmNlb2YgVHlwZSAmJiBsY1Byb3BlcnR5IGluIHR5cGUucHJvdG90eXBlO1xuICB9XG5cbiAgZ3VhcmRzKHR5cGU6IGFueSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHt9OyB9XG5cbiAgZ2V0dGVyKG5hbWU6IHN0cmluZyk6IEdldHRlckZuIHsgcmV0dXJuIDxHZXR0ZXJGbj5uZXcgRnVuY3Rpb24oJ28nLCAncmV0dXJuIG8uJyArIG5hbWUgKyAnOycpOyB9XG5cbiAgc2V0dGVyKG5hbWU6IHN0cmluZyk6IFNldHRlckZuIHtcbiAgICByZXR1cm4gPFNldHRlckZuPm5ldyBGdW5jdGlvbignbycsICd2JywgJ3JldHVybiBvLicgKyBuYW1lICsgJyA9IHY7Jyk7XG4gIH1cblxuICBtZXRob2QobmFtZTogc3RyaW5nKTogTWV0aG9kRm4ge1xuICAgIGNvbnN0IGZ1bmN0aW9uQm9keSA9IGBpZiAoIW8uJHtuYW1lfSkgdGhyb3cgbmV3IEVycm9yKCdcIiR7bmFtZX1cIiBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgcmV0dXJuIG8uJHtuYW1lfS5hcHBseShvLCBhcmdzKTtgO1xuICAgIHJldHVybiA8TWV0aG9kRm4+bmV3IEZ1bmN0aW9uKCdvJywgJ2FyZ3MnLCBmdW5jdGlvbkJvZHkpO1xuICB9XG5cbiAgLy8gVGhlcmUgaXMgbm90IGEgY29uY2VwdCBvZiBpbXBvcnQgdXJpIGluIEpzLCBidXQgdGhpcyBpcyB1c2VmdWwgaW4gZGV2ZWxvcGluZyBEYXJ0IGFwcGxpY2F0aW9ucy5cbiAgaW1wb3J0VXJpKHR5cGU6IGFueSk6IHN0cmluZyB7XG4gICAgLy8gU3RhdGljU3ltYm9sXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyAmJiB0eXBlWydmaWxlUGF0aCddKSB7XG4gICAgICByZXR1cm4gdHlwZVsnZmlsZVBhdGgnXTtcbiAgICB9XG4gICAgLy8gUnVudGltZSB0eXBlXG4gICAgcmV0dXJuIGAuLyR7c3RyaW5naWZ5KHR5cGUpfWA7XG4gIH1cblxuICByZXNvdXJjZVVyaSh0eXBlOiBhbnkpOiBzdHJpbmcgeyByZXR1cm4gYC4vJHtzdHJpbmdpZnkodHlwZSl9YDsgfVxuXG4gIHJlc29sdmVJZGVudGlmaWVyKG5hbWU6IHN0cmluZywgbW9kdWxlVXJsOiBzdHJpbmcsIG1lbWJlcnM6IHN0cmluZ1tdLCBydW50aW1lOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBydW50aW1lO1xuICB9XG4gIHJlc29sdmVFbnVtKGVudW1JZGVudGlmaWVyOiBhbnksIG5hbWU6IHN0cmluZyk6IGFueSB7IHJldHVybiBlbnVtSWRlbnRpZmllcltuYW1lXTsgfVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0VHNpY2tsZURlY29yYXRvckludG9NZXRhZGF0YShkZWNvcmF0b3JJbnZvY2F0aW9uczogYW55W10pOiBhbnlbXSB7XG4gIGlmICghZGVjb3JhdG9ySW52b2NhdGlvbnMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIGRlY29yYXRvckludm9jYXRpb25zLm1hcChkZWNvcmF0b3JJbnZvY2F0aW9uID0+IHtcbiAgICBjb25zdCBkZWNvcmF0b3JUeXBlID0gZGVjb3JhdG9ySW52b2NhdGlvbi50eXBlO1xuICAgIGNvbnN0IGFubm90YXRpb25DbHMgPSBkZWNvcmF0b3JUeXBlLmFubm90YXRpb25DbHM7XG4gICAgY29uc3QgYW5ub3RhdGlvbkFyZ3MgPSBkZWNvcmF0b3JJbnZvY2F0aW9uLmFyZ3MgPyBkZWNvcmF0b3JJbnZvY2F0aW9uLmFyZ3MgOiBbXTtcbiAgICByZXR1cm4gbmV3IGFubm90YXRpb25DbHMoLi4uYW5ub3RhdGlvbkFyZ3MpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50Q3RvcihjdG9yOiBGdW5jdGlvbik6IFR5cGU8YW55PiB7XG4gIGNvbnN0IHBhcmVudFByb3RvID0gY3Rvci5wcm90b3R5cGUgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY3Rvci5wcm90b3R5cGUpIDogbnVsbDtcbiAgY29uc3QgcGFyZW50Q3RvciA9IHBhcmVudFByb3RvID8gcGFyZW50UHJvdG8uY29uc3RydWN0b3IgOiBudWxsO1xuICAvLyBOb3RlOiBXZSBhbHdheXMgdXNlIGBPYmplY3RgIGFzIHRoZSBudWxsIHZhbHVlXG4gIC8vIHRvIHNpbXBsaWZ5IGNoZWNraW5nIGxhdGVyIG9uLlxuICByZXR1cm4gcGFyZW50Q3RvciB8fCBPYmplY3Q7XG59XG4iXX0=