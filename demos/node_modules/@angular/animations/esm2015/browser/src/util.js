/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { sequence } from '@angular/animations';
export const /** @type {?} */ ONE_SECOND = 1000;
export const /** @type {?} */ SUBSTITUTION_EXPR_START = '{{';
export const /** @type {?} */ SUBSTITUTION_EXPR_END = '}}';
export const /** @type {?} */ ENTER_CLASSNAME = 'ng-enter';
export const /** @type {?} */ LEAVE_CLASSNAME = 'ng-leave';
export const /** @type {?} */ ENTER_SELECTOR = '.ng-enter';
export const /** @type {?} */ LEAVE_SELECTOR = '.ng-leave';
export const /** @type {?} */ NG_TRIGGER_CLASSNAME = 'ng-trigger';
export const /** @type {?} */ NG_TRIGGER_SELECTOR = '.ng-trigger';
export const /** @type {?} */ NG_ANIMATING_CLASSNAME = 'ng-animating';
export const /** @type {?} */ NG_ANIMATING_SELECTOR = '.ng-animating';
/**
 * @param {?} value
 * @return {?}
 */
export function resolveTimingValue(value) {
    if (typeof value == 'number')
        return value;
    const /** @type {?} */ matches = (/** @type {?} */ (value)).match(/^(-?[\.\d]+)(m?s)/);
    if (!matches || matches.length < 2)
        return 0;
    return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}
/**
 * @param {?} value
 * @param {?} unit
 * @return {?}
 */
function _convertTimeValueToMS(value, unit) {
    switch (unit) {
        case 's':
            return value * ONE_SECOND;
        default:
            // ms or something else
            return value;
    }
}
/**
 * @param {?} timings
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
export function resolveTiming(timings, errors, allowNegativeValues) {
    return timings.hasOwnProperty('duration') ? /** @type {?} */ (timings) :
        parseTimeExpression(/** @type {?} */ (timings), errors, allowNegativeValues);
}
/**
 * @param {?} exp
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
function parseTimeExpression(exp, errors, allowNegativeValues) {
    const /** @type {?} */ regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    let /** @type {?} */ duration;
    let /** @type {?} */ delay = 0;
    let /** @type {?} */ easing = '';
    if (typeof exp === 'string') {
        const /** @type {?} */ matches = exp.match(regex);
        if (matches === null) {
            errors.push(`The provided timing value "${exp}" is invalid.`);
            return { duration: 0, delay: 0, easing: '' };
        }
        duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
        const /** @type {?} */ delayMatch = matches[3];
        if (delayMatch != null) {
            delay = _convertTimeValueToMS(Math.floor(parseFloat(delayMatch)), matches[4]);
        }
        const /** @type {?} */ easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = /** @type {?} */ (exp);
    }
    if (!allowNegativeValues) {
        let /** @type {?} */ containsErrors = false;
        let /** @type {?} */ startIndex = errors.length;
        if (duration < 0) {
            errors.push(`Duration values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (delay < 0) {
            errors.push(`Delay values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (containsErrors) {
            errors.splice(startIndex, 0, `The provided timing value "${exp}" is invalid.`);
        }
    }
    return { duration, delay, easing };
}
/**
 * @param {?} obj
 * @param {?=} destination
 * @return {?}
 */
export function copyObj(obj, destination = {}) {
    Object.keys(obj).forEach(prop => { destination[prop] = obj[prop]; });
    return destination;
}
/**
 * @param {?} styles
 * @return {?}
 */
export function normalizeStyles(styles) {
    const /** @type {?} */ normalizedStyles = {};
    if (Array.isArray(styles)) {
        styles.forEach(data => copyStyles(data, false, normalizedStyles));
    }
    else {
        copyStyles(styles, false, normalizedStyles);
    }
    return normalizedStyles;
}
/**
 * @param {?} styles
 * @param {?} readPrototype
 * @param {?=} destination
 * @return {?}
 */
export function copyStyles(styles, readPrototype, destination = {}) {
    if (readPrototype) {
        // we make use of a for-in loop so that the
        // prototypically inherited properties are
        // revealed from the backFill map
        for (let /** @type {?} */ prop in styles) {
            destination[prop] = styles[prop];
        }
    }
    else {
        copyObj(styles, destination);
    }
    return destination;
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
export function setStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            const /** @type {?} */ camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = styles[prop];
        });
    }
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
export function eraseStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            const /** @type {?} */ camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = '';
        });
    }
}
/**
 * @param {?} steps
 * @return {?}
 */
export function normalizeAnimationEntry(steps) {
    if (Array.isArray(steps)) {
        if (steps.length == 1)
            return steps[0];
        return sequence(steps);
    }
    return /** @type {?} */ (steps);
}
/**
 * @param {?} value
 * @param {?} options
 * @param {?} errors
 * @return {?}
 */
export function validateStyleParams(value, options, errors) {
    const /** @type {?} */ params = options.params || {};
    const /** @type {?} */ matches = extractStyleParams(value);
    if (matches.length) {
        matches.forEach(varName => {
            if (!params.hasOwnProperty(varName)) {
                errors.push(`Unable to resolve the local animation param ${varName} in the given list of values`);
            }
        });
    }
}
const /** @type {?} */ PARAM_REGEX = new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, 'g');
/**
 * @param {?} value
 * @return {?}
 */
export function extractStyleParams(value) {
    let /** @type {?} */ params = [];
    if (typeof value === 'string') {
        const /** @type {?} */ val = value.toString();
        let /** @type {?} */ match;
        while (match = PARAM_REGEX.exec(val)) {
            params.push(/** @type {?} */ (match[1]));
        }
        PARAM_REGEX.lastIndex = 0;
    }
    return params;
}
/**
 * @param {?} value
 * @param {?} params
 * @param {?} errors
 * @return {?}
 */
export function interpolateParams(value, params, errors) {
    const /** @type {?} */ original = value.toString();
    const /** @type {?} */ str = original.replace(PARAM_REGEX, (_, varName) => {
        let /** @type {?} */ localVal = params[varName];
        // this means that the value was never overridden by the data passed in by the user
        if (!params.hasOwnProperty(varName)) {
            errors.push(`Please provide a value for the animation param ${varName}`);
            localVal = '';
        }
        return localVal.toString();
    });
    // we do this to assert that numeric values stay as they are
    return str == original ? value : str;
}
/**
 * @param {?} iterator
 * @return {?}
 */
export function iteratorToArray(iterator) {
    const /** @type {?} */ arr = [];
    let /** @type {?} */ item = iterator.next();
    while (!item.done) {
        arr.push(item.value);
        item = iterator.next();
    }
    return arr;
}
/**
 * @param {?} source
 * @param {?} destination
 * @return {?}
 */
export function mergeAnimationOptions(source, destination) {
    if (source.params) {
        const /** @type {?} */ p0 = source.params;
        if (!destination.params) {
            destination.params = {};
        }
        const /** @type {?} */ p1 = destination.params;
        Object.keys(p0).forEach(param => {
            if (!p1.hasOwnProperty(param)) {
                p1[param] = p0[param];
            }
        });
    }
    return destination;
}
const /** @type {?} */ DASH_CASE_REGEXP = /-+([a-z0-9])/g;
/**
 * @param {?} input
 * @return {?}
 */
export function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
/**
 * @param {?} duration
 * @param {?} delay
 * @return {?}
 */
export function allowPreviousPlayerStylesMerge(duration, delay) {
    return duration === 0 || delay === 0;
}
/**
 * @param {?} element
 * @param {?} keyframes
 * @param {?} previousStyles
 * @return {?}
 */
export function balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles) {
    const /** @type {?} */ previousStyleProps = Object.keys(previousStyles);
    if (previousStyleProps.length && keyframes.length) {
        let /** @type {?} */ startingKeyframe = keyframes[0];
        let /** @type {?} */ missingStyleProps = [];
        previousStyleProps.forEach(prop => {
            if (!startingKeyframe.hasOwnProperty(prop)) {
                missingStyleProps.push(prop);
            }
            startingKeyframe[prop] = previousStyles[prop];
        });
        if (missingStyleProps.length) {
            // tslint:disable-next-line
            for (var /** @type {?} */ i = 1; i < keyframes.length; i++) {
                let /** @type {?} */ kf = keyframes[i];
                missingStyleProps.forEach(function (prop) { kf[prop] = computeStyle(element, prop); });
            }
        }
    }
    return keyframes;
}
/**
 * @param {?} visitor
 * @param {?} node
 * @param {?} context
 * @return {?}
 */
export function visitDslNode(visitor, node, context) {
    switch (node.type) {
        case 7 /* Trigger */:
            return visitor.visitTrigger(node, context);
        case 0 /* State */:
            return visitor.visitState(node, context);
        case 1 /* Transition */:
            return visitor.visitTransition(node, context);
        case 2 /* Sequence */:
            return visitor.visitSequence(node, context);
        case 3 /* Group */:
            return visitor.visitGroup(node, context);
        case 4 /* Animate */:
            return visitor.visitAnimate(node, context);
        case 5 /* Keyframes */:
            return visitor.visitKeyframes(node, context);
        case 6 /* Style */:
            return visitor.visitStyle(node, context);
        case 8 /* Reference */:
            return visitor.visitReference(node, context);
        case 9 /* AnimateChild */:
            return visitor.visitAnimateChild(node, context);
        case 10 /* AnimateRef */:
            return visitor.visitAnimateRef(node, context);
        case 11 /* Query */:
            return visitor.visitQuery(node, context);
        case 12 /* Stagger */:
            return visitor.visitStagger(node, context);
        default:
            throw new Error(`Unable to resolve animation metadata node #${node.type}`);
    }
}
/**
 * @param {?} element
 * @param {?} prop
 * @return {?}
 */
export function computeStyle(element, prop) {
    return (/** @type {?} */ (window.getComputedStyle(element)))[prop];
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUE2RSxRQUFRLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQUlySSxNQUFNLENBQUMsdUJBQU0sVUFBVSxHQUFHLElBQUksQ0FBQztBQUUvQixNQUFNLENBQUMsdUJBQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0FBQzVDLE1BQU0sQ0FBQyx1QkFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLG9CQUFvQixHQUFHLFlBQVksQ0FBQztBQUNqRCxNQUFNLENBQUMsdUJBQU0sbUJBQW1CLEdBQUcsYUFBYSxDQUFDO0FBQ2pELE1BQU0sQ0FBQyx1QkFBTSxzQkFBc0IsR0FBRyxjQUFjLENBQUM7QUFDckQsTUFBTSxDQUFDLHVCQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQzs7Ozs7QUFFckQsTUFBTSw2QkFBNkIsS0FBc0I7SUFDdkQsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksUUFBUSxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUUzQyx1QkFBTSxPQUFPLEdBQUcsbUJBQUMsS0FBZSxFQUFDLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDN0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7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Q0FDRjs7Ozs7O0FBRUQsTUFBTSx1QkFBdUIsT0FBWSxFQUFFLElBQVk7SUFDckQsTUFBTSxDQUFDLG1CQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3REIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRlVGltaW5ncywgQW5pbWF0aW9uTWV0YWRhdGEsIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSwgQW5pbWF0aW9uT3B0aW9ucywgc2VxdWVuY2UsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7QXN0IGFzIEFuaW1hdGlvbkFzdCwgQXN0VmlzaXRvciBhcyBBbmltYXRpb25Bc3RWaXNpdG9yfSBmcm9tICcuL2RzbC9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7QW5pbWF0aW9uRHNsVmlzaXRvcn0gZnJvbSAnLi9kc2wvYW5pbWF0aW9uX2RzbF92aXNpdG9yJztcblxuZXhwb3J0IGNvbnN0IE9ORV9TRUNPTkQgPSAxMDAwO1xuXG5leHBvcnQgY29uc3QgU1VCU1RJVFVUSU9OX0VYUFJfU1RBUlQgPSAne3snO1xuZXhwb3J0IGNvbnN0IFNVQlNUSVRVVElPTl9FWFBSX0VORCA9ICd9fSc7XG5leHBvcnQgY29uc3QgRU5URVJfQ0xBU1NOQU1FID0gJ25nLWVudGVyJztcbmV4cG9ydCBjb25zdCBMRUFWRV9DTEFTU05BTUUgPSAnbmctbGVhdmUnO1xuZXhwb3J0IGNvbnN0IEVOVEVSX1NFTEVDVE9SID0gJy5uZy1lbnRlcic7XG5leHBvcnQgY29uc3QgTEVBVkVfU0VMRUNUT1IgPSAnLm5nLWxlYXZlJztcbmV4cG9ydCBjb25zdCBOR19UUklHR0VSX0NMQVNTTkFNRSA9ICduZy10cmlnZ2VyJztcbmV4cG9ydCBjb25zdCBOR19UUklHR0VSX1NFTEVDVE9SID0gJy5uZy10cmlnZ2VyJztcbmV4cG9ydCBjb25zdCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGluZyc7XG5leHBvcnQgY29uc3QgTkdfQU5JTUFUSU5HX1NFTEVDVE9SID0gJy5uZy1hbmltYXRpbmcnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVRpbWluZ1ZhbHVlKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykgcmV0dXJuIHZhbHVlO1xuXG4gIGNvbnN0IG1hdGNoZXMgPSAodmFsdWUgYXMgc3RyaW5nKS5tYXRjaCgvXigtP1tcXC5cXGRdKykobT9zKS8pO1xuICBpZiAoIW1hdGNoZXMgfHwgbWF0Y2hlcy5sZW5ndGggPCAyKSByZXR1cm4gMDtcblxuICByZXR1cm4gX2NvbnZlcnRUaW1lVmFsdWVUb01TKHBhcnNlRmxvYXQobWF0Y2hlc1sxXSksIG1hdGNoZXNbMl0pO1xufVxuXG5mdW5jdGlvbiBfY29udmVydFRpbWVWYWx1ZVRvTVModmFsdWU6IG51bWJlciwgdW5pdDogc3RyaW5nKTogbnVtYmVyIHtcbiAgc3dpdGNoICh1bml0KSB7XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gdmFsdWUgKiBPTkVfU0VDT05EO1xuICAgIGRlZmF1bHQ6ICAvLyBtcyBvciBzb21ldGhpbmcgZWxzZVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVGltaW5nKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlciB8IEFuaW1hdGVUaW1pbmdzLCBlcnJvcnM6IGFueVtdLCBhbGxvd05lZ2F0aXZlVmFsdWVzPzogYm9vbGVhbikge1xuICByZXR1cm4gdGltaW5ncy5oYXNPd25Qcm9wZXJ0eSgnZHVyYXRpb24nKSA/XG4gICAgICA8QW5pbWF0ZVRpbWluZ3M+dGltaW5ncyA6XG4gICAgICBwYXJzZVRpbWVFeHByZXNzaW9uKDxzdHJpbmd8bnVtYmVyPnRpbWluZ3MsIGVycm9ycywgYWxsb3dOZWdhdGl2ZVZhbHVlcyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGltZUV4cHJlc3Npb24oXG4gICAgZXhwOiBzdHJpbmcgfCBudW1iZXIsIGVycm9yczogc3RyaW5nW10sIGFsbG93TmVnYXRpdmVWYWx1ZXM/OiBib29sZWFuKTogQW5pbWF0ZVRpbWluZ3Mge1xuICBjb25zdCByZWdleCA9IC9eKC0/W1xcLlxcZF0rKShtP3MpKD86XFxzKygtP1tcXC5cXGRdKykobT9zKSk/KD86XFxzKyhbLWEtel0rKD86XFwoLis/XFwpKT8pKT8kL2k7XG4gIGxldCBkdXJhdGlvbjogbnVtYmVyO1xuICBsZXQgZGVsYXk6IG51bWJlciA9IDA7XG4gIGxldCBlYXNpbmc6IHN0cmluZyA9ICcnO1xuICBpZiAodHlwZW9mIGV4cCA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gZXhwLm1hdGNoKHJlZ2V4KTtcbiAgICBpZiAobWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBwcm92aWRlZCB0aW1pbmcgdmFsdWUgXCIke2V4cH1cIiBpcyBpbnZhbGlkLmApO1xuICAgICAgcmV0dXJuIHtkdXJhdGlvbjogMCwgZGVsYXk6IDAsIGVhc2luZzogJyd9O1xuICAgIH1cblxuICAgIGR1cmF0aW9uID0gX2NvbnZlcnRUaW1lVmFsdWVUb01TKHBhcnNlRmxvYXQobWF0Y2hlc1sxXSksIG1hdGNoZXNbMl0pO1xuXG4gICAgY29uc3QgZGVsYXlNYXRjaCA9IG1hdGNoZXNbM107XG4gICAgaWYgKGRlbGF5TWF0Y2ggIT0gbnVsbCkge1xuICAgICAgZGVsYXkgPSBfY29udmVydFRpbWVWYWx1ZVRvTVMoTWF0aC5mbG9vcihwYXJzZUZsb2F0KGRlbGF5TWF0Y2gpKSwgbWF0Y2hlc1s0XSk7XG4gICAgfVxuXG4gICAgY29uc3QgZWFzaW5nVmFsID0gbWF0Y2hlc1s1XTtcbiAgICBpZiAoZWFzaW5nVmFsKSB7XG4gICAgICBlYXNpbmcgPSBlYXNpbmdWYWw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGR1cmF0aW9uID0gPG51bWJlcj5leHA7XG4gIH1cblxuICBpZiAoIWFsbG93TmVnYXRpdmVWYWx1ZXMpIHtcbiAgICBsZXQgY29udGFpbnNFcnJvcnMgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRJbmRleCA9IGVycm9ycy5sZW5ndGg7XG4gICAgaWYgKGR1cmF0aW9uIDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2goYER1cmF0aW9uIHZhbHVlcyBiZWxvdyAwIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhpcyBhbmltYXRpb24gc3RlcC5gKTtcbiAgICAgIGNvbnRhaW5zRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGRlbGF5IDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2goYERlbGF5IHZhbHVlcyBiZWxvdyAwIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhpcyBhbmltYXRpb24gc3RlcC5gKTtcbiAgICAgIGNvbnRhaW5zRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRXJyb3JzKSB7XG4gICAgICBlcnJvcnMuc3BsaWNlKHN0YXJ0SW5kZXgsIDAsIGBUaGUgcHJvdmlkZWQgdGltaW5nIHZhbHVlIFwiJHtleHB9XCIgaXMgaW52YWxpZC5gKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge2R1cmF0aW9uLCBkZWxheSwgZWFzaW5nfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlPYmooXG4gICAgb2JqOiB7W2tleTogc3RyaW5nXTogYW55fSwgZGVzdGluYXRpb246IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge30pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChwcm9wID0+IHsgZGVzdGluYXRpb25bcHJvcF0gPSBvYmpbcHJvcF07IH0pO1xuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTdHlsZXMoc3R5bGVzOiDJtVN0eWxlRGF0YSB8IMm1U3R5bGVEYXRhW10pOiDJtVN0eWxlRGF0YSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRTdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gIGlmIChBcnJheS5pc0FycmF5KHN0eWxlcykpIHtcbiAgICBzdHlsZXMuZm9yRWFjaChkYXRhID0+IGNvcHlTdHlsZXMoZGF0YSwgZmFsc2UsIG5vcm1hbGl6ZWRTdHlsZXMpKTtcbiAgfSBlbHNlIHtcbiAgICBjb3B5U3R5bGVzKHN0eWxlcywgZmFsc2UsIG5vcm1hbGl6ZWRTdHlsZXMpO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVkU3R5bGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVN0eWxlcyhcbiAgICBzdHlsZXM6IMm1U3R5bGVEYXRhLCByZWFkUHJvdG90eXBlOiBib29sZWFuLCBkZXN0aW5hdGlvbjogybVTdHlsZURhdGEgPSB7fSk6IMm1U3R5bGVEYXRhIHtcbiAgaWYgKHJlYWRQcm90b3R5cGUpIHtcbiAgICAvLyB3ZSBtYWtlIHVzZSBvZiBhIGZvci1pbiBsb29wIHNvIHRoYXQgdGhlXG4gICAgLy8gcHJvdG90eXBpY2FsbHkgaW5oZXJpdGVkIHByb3BlcnRpZXMgYXJlXG4gICAgLy8gcmV2ZWFsZWQgZnJvbSB0aGUgYmFja0ZpbGwgbWFwXG4gICAgZm9yIChsZXQgcHJvcCBpbiBzdHlsZXMpIHtcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb3B5T2JqKHN0eWxlcywgZGVzdGluYXRpb24pO1xuICB9XG4gIHJldHVybiBkZXN0aW5hdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0eWxlcyhlbGVtZW50OiBhbnksIHN0eWxlczogybVTdHlsZURhdGEpIHtcbiAgaWYgKGVsZW1lbnRbJ3N0eWxlJ10pIHtcbiAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCBjYW1lbFByb3AgPSBkYXNoQ2FzZVRvQ2FtZWxDYXNlKHByb3ApO1xuICAgICAgZWxlbWVudC5zdHlsZVtjYW1lbFByb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcmFzZVN0eWxlcyhlbGVtZW50OiBhbnksIHN0eWxlczogybVTdHlsZURhdGEpIHtcbiAgaWYgKGVsZW1lbnRbJ3N0eWxlJ10pIHtcbiAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCBjYW1lbFByb3AgPSBkYXNoQ2FzZVRvQ2FtZWxDYXNlKHByb3ApO1xuICAgICAgZWxlbWVudC5zdHlsZVtjYW1lbFByb3BdID0gJyc7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUFuaW1hdGlvbkVudHJ5KHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10pOlxuICAgIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3RlcHMpKSB7XG4gICAgaWYgKHN0ZXBzLmxlbmd0aCA9PSAxKSByZXR1cm4gc3RlcHNbMF07XG4gICAgcmV0dXJuIHNlcXVlbmNlKHN0ZXBzKTtcbiAgfVxuICByZXR1cm4gc3RlcHMgYXMgQW5pbWF0aW9uTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVN0eWxlUGFyYW1zKFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIsIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMsIGVycm9yczogYW55W10pIHtcbiAgY29uc3QgcGFyYW1zID0gb3B0aW9ucy5wYXJhbXMgfHwge307XG4gIGNvbnN0IG1hdGNoZXMgPSBleHRyYWN0U3R5bGVQYXJhbXModmFsdWUpO1xuICBpZiAobWF0Y2hlcy5sZW5ndGgpIHtcbiAgICBtYXRjaGVzLmZvckVhY2godmFyTmFtZSA9PiB7XG4gICAgICBpZiAoIXBhcmFtcy5oYXNPd25Qcm9wZXJ0eSh2YXJOYW1lKSkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgIGBVbmFibGUgdG8gcmVzb2x2ZSB0aGUgbG9jYWwgYW5pbWF0aW9uIHBhcmFtICR7dmFyTmFtZX0gaW4gdGhlIGdpdmVuIGxpc3Qgb2YgdmFsdWVzYCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgUEFSQU1fUkVHRVggPVxuICAgIG5ldyBSZWdFeHAoYCR7U1VCU1RJVFVUSU9OX0VYUFJfU1RBUlR9XFxcXHMqKC4rPylcXFxccyoke1NVQlNUSVRVVElPTl9FWFBSX0VORH1gLCAnZycpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTdHlsZVBhcmFtcyh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKTogc3RyaW5nW10ge1xuICBsZXQgcGFyYW1zOiBzdHJpbmdbXSA9IFtdO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IHZhbCA9IHZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICBsZXQgbWF0Y2g6IGFueTtcbiAgICB3aGlsZSAobWF0Y2ggPSBQQVJBTV9SRUdFWC5leGVjKHZhbCkpIHtcbiAgICAgIHBhcmFtcy5wdXNoKG1hdGNoWzFdIGFzIHN0cmluZyk7XG4gICAgfVxuICAgIFBBUkFNX1JFR0VYLmxhc3RJbmRleCA9IDA7XG4gIH1cbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVycG9sYXRlUGFyYW1zKFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIsIHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9LCBlcnJvcnM6IGFueVtdKTogc3RyaW5nfG51bWJlciB7XG4gIGNvbnN0IG9yaWdpbmFsID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgY29uc3Qgc3RyID0gb3JpZ2luYWwucmVwbGFjZShQQVJBTV9SRUdFWCwgKF8sIHZhck5hbWUpID0+IHtcbiAgICBsZXQgbG9jYWxWYWwgPSBwYXJhbXNbdmFyTmFtZV07XG4gICAgLy8gdGhpcyBtZWFucyB0aGF0IHRoZSB2YWx1ZSB3YXMgbmV2ZXIgb3ZlcnJpZGRlbiBieSB0aGUgZGF0YSBwYXNzZWQgaW4gYnkgdGhlIHVzZXJcbiAgICBpZiAoIXBhcmFtcy5oYXNPd25Qcm9wZXJ0eSh2YXJOYW1lKSkge1xuICAgICAgZXJyb3JzLnB1c2goYFBsZWFzZSBwcm92aWRlIGEgdmFsdWUgZm9yIHRoZSBhbmltYXRpb24gcGFyYW0gJHt2YXJOYW1lfWApO1xuICAgICAgbG9jYWxWYWwgPSAnJztcbiAgICB9XG4gICAgcmV0dXJuIGxvY2FsVmFsLnRvU3RyaW5nKCk7XG4gIH0pO1xuXG4gIC8vIHdlIGRvIHRoaXMgdG8gYXNzZXJ0IHRoYXQgbnVtZXJpYyB2YWx1ZXMgc3RheSBhcyB0aGV5IGFyZVxuICByZXR1cm4gc3RyID09IG9yaWdpbmFsID8gdmFsdWUgOiBzdHI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdGVyYXRvclRvQXJyYXkoaXRlcmF0b3I6IGFueSk6IGFueVtdIHtcbiAgY29uc3QgYXJyOiBhbnlbXSA9IFtdO1xuICBsZXQgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgd2hpbGUgKCFpdGVtLmRvbmUpIHtcbiAgICBhcnIucHVzaChpdGVtLnZhbHVlKTtcbiAgICBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuICB9XG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUFuaW1hdGlvbk9wdGlvbnMoXG4gICAgc291cmNlOiBBbmltYXRpb25PcHRpb25zLCBkZXN0aW5hdGlvbjogQW5pbWF0aW9uT3B0aW9ucyk6IEFuaW1hdGlvbk9wdGlvbnMge1xuICBpZiAoc291cmNlLnBhcmFtcykge1xuICAgIGNvbnN0IHAwID0gc291cmNlLnBhcmFtcztcbiAgICBpZiAoIWRlc3RpbmF0aW9uLnBhcmFtcykge1xuICAgICAgZGVzdGluYXRpb24ucGFyYW1zID0ge307XG4gICAgfVxuICAgIGNvbnN0IHAxID0gZGVzdGluYXRpb24ucGFyYW1zO1xuICAgIE9iamVjdC5rZXlzKHAwKS5mb3JFYWNoKHBhcmFtID0+IHtcbiAgICAgIGlmICghcDEuaGFzT3duUHJvcGVydHkocGFyYW0pKSB7XG4gICAgICAgIHAxW3BhcmFtXSA9IHAwW3BhcmFtXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmNvbnN0IERBU0hfQ0FTRV9SRUdFWFAgPSAvLSsoW2EtejAtOV0pL2c7XG5leHBvcnQgZnVuY3Rpb24gZGFzaENhc2VUb0NhbWVsQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoREFTSF9DQVNFX1JFR0VYUCwgKC4uLm06IGFueVtdKSA9PiBtWzFdLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlKGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIpIHtcbiAgcmV0dXJuIGR1cmF0aW9uID09PSAwIHx8IGRlbGF5ID09PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFsYW5jZVByZXZpb3VzU3R5bGVzSW50b0tleWZyYW1lcyhcbiAgICBlbGVtZW50OiBhbnksIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IGFueX1bXSwgcHJldmlvdXNTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gIGNvbnN0IHByZXZpb3VzU3R5bGVQcm9wcyA9IE9iamVjdC5rZXlzKHByZXZpb3VzU3R5bGVzKTtcbiAgaWYgKHByZXZpb3VzU3R5bGVQcm9wcy5sZW5ndGggJiYga2V5ZnJhbWVzLmxlbmd0aCkge1xuICAgIGxldCBzdGFydGluZ0tleWZyYW1lID0ga2V5ZnJhbWVzWzBdO1xuICAgIGxldCBtaXNzaW5nU3R5bGVQcm9wczogc3RyaW5nW10gPSBbXTtcbiAgICBwcmV2aW91c1N0eWxlUHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGlmICghc3RhcnRpbmdLZXlmcmFtZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBtaXNzaW5nU3R5bGVQcm9wcy5wdXNoKHByb3ApO1xuICAgICAgfVxuICAgICAgc3RhcnRpbmdLZXlmcmFtZVtwcm9wXSA9IHByZXZpb3VzU3R5bGVzW3Byb3BdO1xuICAgIH0pO1xuXG4gICAgaWYgKG1pc3NpbmdTdHlsZVByb3BzLmxlbmd0aCkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGtleWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQga2YgPSBrZXlmcmFtZXNbaV07XG4gICAgICAgIG1pc3NpbmdTdHlsZVByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkgeyBrZltwcm9wXSA9IGNvbXB1dGVTdHlsZShlbGVtZW50LCBwcm9wKTsgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBrZXlmcmFtZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdERzbE5vZGUoXG4gICAgdmlzaXRvcjogQW5pbWF0aW9uRHNsVmlzaXRvciwgbm9kZTogQW5pbWF0aW9uTWV0YWRhdGEsIGNvbnRleHQ6IGFueSk6IGFueTtcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdERzbE5vZGUoXG4gICAgdmlzaXRvcjogQW5pbWF0aW9uQXN0VmlzaXRvciwgbm9kZTogQW5pbWF0aW9uQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4sIGNvbnRleHQ6IGFueSk6IGFueTtcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdERzbE5vZGUodmlzaXRvcjogYW55LCBub2RlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlcjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VHJpZ2dlcihub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGF0ZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3RhdGUobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VHJhbnNpdGlvbihub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TZXF1ZW5jZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U2VxdWVuY2Uobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXA6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEdyb3VwKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGU6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEFuaW1hdGUobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuS2V5ZnJhbWVzOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRLZXlmcmFtZXMobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGU6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFN0eWxlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlJlZmVyZW5jZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmVmZXJlbmNlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVDaGlsZDpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZUNoaWxkKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVSZWY6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEFuaW1hdGVSZWYobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuUXVlcnk6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFF1ZXJ5KG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXI6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFN0YWdnZXIobm9kZSwgY29udGV4dCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgYW5pbWF0aW9uIG1ldGFkYXRhIG5vZGUgIyR7bm9kZS50eXBlfWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlU3R5bGUoZWxlbWVudDogYW55LCBwcm9wOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gKDxhbnk+d2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkpW3Byb3BdO1xufVxuIl19