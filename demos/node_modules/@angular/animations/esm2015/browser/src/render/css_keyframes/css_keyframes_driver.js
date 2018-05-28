/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes } from '../../util';
import { containsElement, invokeQuery, matchesElement, validateStyleProperty } from '../shared';
import { CssKeyframesPlayer } from './css_keyframes_player';
import { DirectStylePlayer } from './direct_style_player';
const /** @type {?} */ KEYFRAMES_NAME_PREFIX = 'gen_css_kf_';
const /** @type {?} */ TAB_SPACE = ' ';
export class CssKeyframesDriver {
    constructor() {
        this._count = 0;
        this._head = document.querySelector('head');
        this._warningIssued = false;
    }
    /**
     * @param {?} prop
     * @return {?}
     */
    validateStyleProperty(prop) { return validateStyleProperty(prop); }
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    matchesElement(element, selector) {
        return matchesElement(element, selector);
    }
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    containsElement(elm1, elm2) { return containsElement(elm1, elm2); }
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    computeStyle(element, prop, defaultValue) {
        return /** @type {?} */ ((/** @type {?} */ (window.getComputedStyle(element)))[prop]);
    }
    /**
     * @param {?} element
     * @param {?} name
     * @param {?} keyframes
     * @return {?}
     */
    buildKeyframeElement(element, name, keyframes) {
        keyframes = keyframes.map(kf => hypenatePropsObject(kf));
        let /** @type {?} */ keyframeStr = `@keyframes ${name} {\n`;
        let /** @type {?} */ tab = '';
        keyframes.forEach(kf => {
            tab = TAB_SPACE;
            const /** @type {?} */ offset = parseFloat(kf["offset"]);
            keyframeStr += `${tab}${offset * 100}% {\n`;
            tab += TAB_SPACE;
            Object.keys(kf).forEach(prop => {
                const /** @type {?} */ value = kf[prop];
                switch (prop) {
                    case 'offset':
                        return;
                    case 'easing':
                        if (value) {
                            keyframeStr += `${tab}animation-timing-function: ${value};\n`;
                        }
                        return;
                    default:
                        keyframeStr += `${tab}${prop}: ${value};\n`;
                        return;
                }
            });
            keyframeStr += `${tab}}\n`;
        });
        keyframeStr += `}\n`;
        const /** @type {?} */ kfElm = document.createElement('style');
        kfElm.innerHTML = keyframeStr;
        return kfElm;
    }
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        if (scrubberAccessRequested) {
            this._notifyFaultyScrubber();
        }
        const /** @type {?} */ previousCssKeyframePlayers = /** @type {?} */ (previousPlayers.filter(player => player instanceof CssKeyframesPlayer));
        const /** @type {?} */ previousStyles = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousCssKeyframePlayers.forEach(player => {
                let /** @type {?} */ styles = player.currentSnapshot;
                Object.keys(styles).forEach(prop => previousStyles[prop] = styles[prop]);
            });
        }
        keyframes = balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles);
        const /** @type {?} */ finalStyles = flattenKeyframesIntoStyles(keyframes);
        // if there is no animation then there is no point in applying
        // styles and waiting for an event to get fired. This causes lag.
        // It's better to just directly apply the styles to the element
        // via the direct styling animation player.
        if (duration == 0) {
            return new DirectStylePlayer(element, finalStyles);
        }
        const /** @type {?} */ animationName = `${KEYFRAMES_NAME_PREFIX}${this._count++}`;
        const /** @type {?} */ kfElm = this.buildKeyframeElement(element, animationName, keyframes); /** @type {?} */
        ((document.querySelector('head'))).appendChild(kfElm);
        const /** @type {?} */ player = new CssKeyframesPlayer(element, keyframes, animationName, duration, delay, easing, finalStyles);
        player.onDestroy(() => removeElement(kfElm));
        return player;
    }
    /**
     * @return {?}
     */
    _notifyFaultyScrubber() {
        if (!this._warningIssued) {
            console.warn('@angular/animations: please load the web-animations.js polyfill to allow programmatic access...\n', '  visit http://bit.ly/IWukam to learn more about using the web-animation-js polyfill.');
            this._warningIssued = true;
        }
    }
}
function CssKeyframesDriver_tsickle_Closure_declarations() {
    /** @type {?} */
    CssKeyframesDriver.prototype._count;
    /** @type {?} */
    CssKeyframesDriver.prototype._head;
    /** @type {?} */
    CssKeyframesDriver.prototype._warningIssued;
}
/**
 * @param {?} keyframes
 * @return {?}
 */
function flattenKeyframesIntoStyles(keyframes) {
    let /** @type {?} */ flatKeyframes = {};
    if (keyframes) {
        const /** @type {?} */ kfs = Array.isArray(keyframes) ? keyframes : [keyframes];
        kfs.forEach(kf => {
            Object.keys(kf).forEach(prop => {
                if (prop == 'offset' || prop == 'easing')
                    return;
                flatKeyframes[prop] = kf[prop];
            });
        });
    }
    return flatKeyframes;
}
/**
 * @param {?} object
 * @return {?}
 */
function hypenatePropsObject(object) {
    const /** @type {?} */ newObj = {};
    Object.keys(object).forEach(prop => {
        const /** @type {?} */ newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newObj[newProp] = object[prop];
    });
    return newObj;
}
/**
 * @param {?} node
 * @return {?}
 */
function removeElement(node) {
    node.parentNode.removeChild(node);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzX2tleWZyYW1lc19kcml2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9jc3Nfa2V5ZnJhbWVzL2Nzc19rZXlmcmFtZXNfZHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxPQUFPLEVBQUMsOEJBQThCLEVBQUUsa0NBQWtDLEVBQWUsTUFBTSxZQUFZLENBQUM7QUFFNUcsT0FBTyxFQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRTlGLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXhELHVCQUFNLHFCQUFxQixHQUFHLGFBQWEsQ0FBQztBQUM1Qyx1QkFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBRXRCLE1BQU07O3NCQUNhLENBQUM7cUJBQ1ksUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7OEJBQ25DLEtBQUs7Ozs7OztJQUU5QixxQkFBcUIsQ0FBQyxJQUFZLElBQWEsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Ozs7OztJQUVwRixjQUFjLENBQUMsT0FBWSxFQUFFLFFBQWdCO1FBQzNDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzFDOzs7Ozs7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVMsSUFBYSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFOzs7Ozs7O0lBRXRGLEtBQUssQ0FBQyxPQUFZLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxF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RUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNkLHVCQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxRQUFRLENBQUM7b0JBQUMsTUFBTSxDQUFDO2dCQUNqRCxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hDLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQztLQUNKO0lBQ0QsTUFBTSxDQUFDLGFBQWEsQ0FBQztDQUN0Qjs7Ozs7QUFFRCw2QkFBNkIsTUFBNEI7SUFDdkQsdUJBQU0sTUFBTSxHQUF5QixFQUFFLENBQUM7SUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDakMsdUJBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO0NBQ2Y7Ozs7O0FBRUQsdUJBQXVCLElBQVM7SUFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge2FsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSwgYmFsYW5jZVByZXZpb3VzU3R5bGVzSW50b0tleWZyYW1lcywgY29tcHV0ZVN0eWxlfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Y29udGFpbnNFbGVtZW50LCBpbnZva2VRdWVyeSwgbWF0Y2hlc0VsZW1lbnQsIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eX0gZnJvbSAnLi4vc2hhcmVkJztcblxuaW1wb3J0IHtDc3NLZXlmcmFtZXNQbGF5ZXJ9IGZyb20gJy4vY3NzX2tleWZyYW1lc19wbGF5ZXInO1xuaW1wb3J0IHtEaXJlY3RTdHlsZVBsYXllcn0gZnJvbSAnLi9kaXJlY3Rfc3R5bGVfcGxheWVyJztcblxuY29uc3QgS0VZRlJBTUVTX05BTUVfUFJFRklYID0gJ2dlbl9jc3Nfa2ZfJztcbmNvbnN0IFRBQl9TUEFDRSA9ICcgJztcblxuZXhwb3J0IGNsYXNzIENzc0tleWZyYW1lc0RyaXZlciBpbXBsZW1lbnRzIEFuaW1hdGlvbkRyaXZlciB7XG4gIHByaXZhdGUgX2NvdW50ID0gMDtcbiAgcHJpdmF0ZSByZWFkb25seSBfaGVhZDogYW55ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpO1xuICBwcml2YXRlIF93YXJuaW5nSXNzdWVkID0gZmFsc2U7XG5cbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApOyB9XG5cbiAgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG1hdGNoZXNFbGVtZW50KGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpOyB9XG5cbiAgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gaW52b2tlUXVlcnkoZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgfVxuXG4gIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpIGFzIGFueSlbcHJvcF0gYXMgc3RyaW5nO1xuICB9XG5cbiAgYnVpbGRLZXlmcmFtZUVsZW1lbnQoZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IGFueX1bXSk6IGFueSB7XG4gICAga2V5ZnJhbWVzID0ga2V5ZnJhbWVzLm1hcChrZiA9PiBoeXBlbmF0ZVByb3BzT2JqZWN0KGtmKSk7XG4gICAgbGV0IGtleWZyYW1lU3RyID0gYEBrZXlmcmFtZXMgJHtuYW1lfSB7XFxuYDtcbiAgICBsZXQgdGFiID0gJyc7XG4gICAga2V5ZnJhbWVzLmZvckVhY2goa2YgPT4ge1xuICAgICAgdGFiID0gVEFCX1NQQUNFO1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gcGFyc2VGbG9hdChrZi5vZmZzZXQpO1xuICAgICAga2V5ZnJhbWVTdHIgKz0gYCR7dGFifSR7b2Zmc2V0ICogMTAwfSUge1xcbmA7XG4gICAgICB0YWIgKz0gVEFCX1NQQUNFO1xuICAgICAgT2JqZWN0LmtleXMoa2YpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0ga2ZbcHJvcF07XG4gICAgICAgIHN3aXRjaCAocHJvcCkge1xuICAgICAgICAgIGNhc2UgJ29mZnNldCc6XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgY2FzZSAnZWFzaW5nJzpcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICBrZXlmcmFtZVN0ciArPSBgJHt0YWJ9YW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogJHt2YWx1ZX07XFxuYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAga2V5ZnJhbWVTdHIgKz0gYCR7dGFifSR7cHJvcH06ICR7dmFsdWV9O1xcbmA7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAga2V5ZnJhbWVTdHIgKz0gYCR7dGFifX1cXG5gO1xuICAgIH0pO1xuICAgIGtleWZyYW1lU3RyICs9IGB9XFxuYDtcblxuICAgIGNvbnN0IGtmRWxtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBrZkVsbS5pbm5lckhUTUwgPSBrZXlmcmFtZVN0cjtcbiAgICByZXR1cm4ga2ZFbG07XG4gIH1cblxuICBhbmltYXRlKFxuICAgICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sIGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIsIGVhc2luZzogc3RyaW5nLFxuICAgICAgcHJldmlvdXNQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdLCBzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZD86IGJvb2xlYW4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGlmIChzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZCkge1xuICAgICAgdGhpcy5fbm90aWZ5RmF1bHR5U2NydWJiZXIoKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c0Nzc0tleWZyYW1lUGxheWVycyA9IDxDc3NLZXlmcmFtZXNQbGF5ZXJbXT5wcmV2aW91c1BsYXllcnMuZmlsdGVyKFxuICAgICAgICBwbGF5ZXIgPT4gcGxheWVyIGluc3RhbmNlb2YgQ3NzS2V5ZnJhbWVzUGxheWVyKTtcblxuICAgIGNvbnN0IHByZXZpb3VzU3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gICAgaWYgKGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZShkdXJhdGlvbiwgZGVsYXkpKSB7XG4gICAgICBwcmV2aW91c0Nzc0tleWZyYW1lUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGxldCBzdHlsZXMgPSBwbGF5ZXIuY3VycmVudFNuYXBzaG90O1xuICAgICAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2gocHJvcCA9PiBwcmV2aW91c1N0eWxlc1twcm9wXSA9IHN0eWxlc1twcm9wXSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBrZXlmcmFtZXMgPSBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzKGVsZW1lbnQsIGtleWZyYW1lcywgcHJldmlvdXNTdHlsZXMpO1xuICAgIGNvbnN0IGZpbmFsU3R5bGVzID0gZmxhdHRlbktleWZyYW1lc0ludG9TdHlsZXMoa2V5ZnJhbWVzKTtcblxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIGFuaW1hdGlvbiB0aGVuIHRoZXJlIGlzIG5vIHBvaW50IGluIGFwcGx5aW5nXG4gICAgLy8gc3R5bGVzIGFuZCB3YWl0aW5nIGZvciBhbiBldmVudCB0byBnZXQgZmlyZWQuIFRoaXMgY2F1c2VzIGxhZy5cbiAgICAvLyBJdCdzIGJldHRlciB0byBqdXN0IGRpcmVjdGx5IGFwcGx5IHRoZSBzdHlsZXMgdG8gdGhlIGVsZW1lbnRcbiAgICAvLyB2aWEgdGhlIGRpcmVjdCBzdHlsaW5nIGFuaW1hdGlvbiBwbGF5ZXIuXG4gICAgaWYgKGR1cmF0aW9uID09IDApIHtcbiAgICAgIHJldHVybiBuZXcgRGlyZWN0U3R5bGVQbGF5ZXIoZWxlbWVudCwgZmluYWxTdHlsZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGFuaW1hdGlvbk5hbWUgPSBgJHtLRVlGUkFNRVNfTkFNRV9QUkVGSVh9JHt0aGlzLl9jb3VudCsrfWA7XG4gICAgY29uc3Qga2ZFbG0gPSB0aGlzLmJ1aWxkS2V5ZnJhbWVFbGVtZW50KGVsZW1lbnQsIGFuaW1hdGlvbk5hbWUsIGtleWZyYW1lcyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpICEuYXBwZW5kQ2hpbGQoa2ZFbG0pO1xuXG4gICAgY29uc3QgcGxheWVyID0gbmV3IENzc0tleWZyYW1lc1BsYXllcihcbiAgICAgICAgZWxlbWVudCwga2V5ZnJhbWVzLCBhbmltYXRpb25OYW1lLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgZmluYWxTdHlsZXMpO1xuXG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiByZW1vdmVFbGVtZW50KGtmRWxtKSk7XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxuXG4gIHByaXZhdGUgX25vdGlmeUZhdWx0eVNjcnViYmVyKCkge1xuICAgIGlmICghdGhpcy5fd2FybmluZ0lzc3VlZCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICdAYW5ndWxhci9hbmltYXRpb25zOiBwbGVhc2UgbG9hZCB0aGUgd2ViLWFuaW1hdGlvbnMuanMgcG9seWZpbGwgdG8gYWxsb3cgcHJvZ3JhbW1hdGljIGFjY2Vzcy4uLlxcbicsXG4gICAgICAgICAgJyAgdmlzaXQgaHR0cDovL2JpdC5seS9JV3VrYW0gdG8gbGVhcm4gbW9yZSBhYm91dCB1c2luZyB0aGUgd2ViLWFuaW1hdGlvbi1qcyBwb2x5ZmlsbC4nKTtcbiAgICAgIHRoaXMuX3dhcm5pbmdJc3N1ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuS2V5ZnJhbWVzSW50b1N0eWxlcyhcbiAgICBrZXlmcmFtZXM6IG51bGwgfCB7W2tleTogc3RyaW5nXTogYW55fSB8IHtba2V5OiBzdHJpbmddOiBhbnl9W10pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGxldCBmbGF0S2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBpZiAoa2V5ZnJhbWVzKSB7XG4gICAgY29uc3Qga2ZzID0gQXJyYXkuaXNBcnJheShrZXlmcmFtZXMpID8ga2V5ZnJhbWVzIDogW2tleWZyYW1lc107XG4gICAga2ZzLmZvckVhY2goa2YgPT4ge1xuICAgICAgT2JqZWN0LmtleXMoa2YpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChwcm9wID09ICdvZmZzZXQnIHx8IHByb3AgPT0gJ2Vhc2luZycpIHJldHVybjtcbiAgICAgICAgZmxhdEtleWZyYW1lc1twcm9wXSA9IGtmW3Byb3BdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGZsYXRLZXlmcmFtZXM7XG59XG5cbmZ1bmN0aW9uIGh5cGVuYXRlUHJvcHNPYmplY3Qob2JqZWN0OiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3QgbmV3T2JqOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgY29uc3QgbmV3UHJvcCA9IHByb3AucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJyk7XG4gICAgbmV3T2JqW25ld1Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iajtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChub2RlOiBhbnkpIHtcbiAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xufVxuIl19