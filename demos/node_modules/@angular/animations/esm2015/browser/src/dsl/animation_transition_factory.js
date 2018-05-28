/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { getOrSetAsInMap } from '../render/shared';
import { copyObj, interpolateParams, iteratorToArray } from '../util';
import { buildAnimationTimelines } from './animation_timeline_builder';
import { createTransitionInstruction } from './animation_transition_instruction';
const /** @type {?} */ EMPTY_OBJECT = {};
export class AnimationTransitionFactory {
    /**
     * @param {?} _triggerName
     * @param {?} ast
     * @param {?} _stateStyles
     */
    constructor(_triggerName, ast, _stateStyles) {
        this._triggerName = _triggerName;
        this.ast = ast;
        this._stateStyles = _stateStyles;
    }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    match(currentState, nextState, element, params) {
        return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
    }
    /**
     * @param {?} stateName
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    buildStyles(stateName, params, errors) {
        const /** @type {?} */ backupStateStyler = this._stateStyles['*'];
        const /** @type {?} */ stateStyler = this._stateStyles[stateName];
        const /** @type {?} */ backupStyles = backupStateStyler ? backupStateStyler.buildStyles(params, errors) : {};
        return stateStyler ? stateStyler.buildStyles(params, errors) : backupStyles;
    }
    /**
     * @param {?} driver
     * @param {?} element
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} enterClassName
     * @param {?} leaveClassName
     * @param {?=} currentOptions
     * @param {?=} nextOptions
     * @param {?=} subInstructions
     * @return {?}
     */
    build(driver, element, currentState, nextState, enterClassName, leaveClassName, currentOptions, nextOptions, subInstructions) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
        const /** @type {?} */ currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
        const /** @type {?} */ currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
        const /** @type {?} */ nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
        const /** @type {?} */ nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);
        const /** @type {?} */ queriedElements = new Set();
        const /** @type {?} */ preStyleMap = new Map();
        const /** @type {?} */ postStyleMap = new Map();
        const /** @type {?} */ isRemoval = nextState === 'void';
        const /** @type {?} */ animationOptions = { params: Object.assign({}, transitionAnimationParams, nextAnimationParams) };
        const /** @type {?} */ timelines = buildAnimationTimelines(driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles, nextStateStyles, animationOptions, subInstructions, errors);
        let /** @type {?} */ totalTime = 0;
        timelines.forEach(tl => { totalTime = Math.max(tl.duration + tl.delay, totalTime); });
        if (errors.length) {
            return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, [], [], preStyleMap, postStyleMap, totalTime, errors);
        }
        timelines.forEach(tl => {
            const /** @type {?} */ elm = tl.element;
            const /** @type {?} */ preProps = getOrSetAsInMap(preStyleMap, elm, {});
            tl.preStyleProps.forEach(prop => preProps[prop] = true);
            const /** @type {?} */ postProps = getOrSetAsInMap(postStyleMap, elm, {});
            tl.postStyleProps.forEach(prop => postProps[prop] = true);
            if (elm !== element) {
                queriedElements.add(elm);
            }
        });
        const /** @type {?} */ queriedElementsList = iteratorToArray(queriedElements.values());
        return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, timelines, queriedElementsList, preStyleMap, postStyleMap, totalTime);
    }
}
function AnimationTransitionFactory_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTransitionFactory.prototype._triggerName;
    /** @type {?} */
    AnimationTransitionFactory.prototype.ast;
    /** @type {?} */
    AnimationTransitionFactory.prototype._stateStyles;
}
/**
 * @param {?} matchFns
 * @param {?} currentState
 * @param {?} nextState
 * @param {?} element
 * @param {?} params
 * @return {?}
 */
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState, element, params) {
    return matchFns.some(fn => fn(currentState, nextState, element, params));
}
export class AnimationStateStyles {
    /**
     * @param {?} styles
     * @param {?} defaultParams
     */
    constructor(styles, defaultParams) {
        this.styles = styles;
        this.defaultParams = defaultParams;
    }
    /**
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    buildStyles(params, errors) {
        const /** @type {?} */ finalStyles = {};
        const /** @type {?} */ combinedParams = copyObj(this.defaultParams);
        Object.keys(params).forEach(key => {
            const /** @type {?} */ value = params[key];
            if (value != null) {
                combinedParams[key] = value;
            }
        });
        this.styles.styles.forEach(value => {
            if (typeof value !== 'string') {
                const /** @type {?} */ styleObj = /** @type {?} */ (value);
                Object.keys(styleObj).forEach(prop => {
                    let /** @type {?} */ val = styleObj[prop];
                    if (val.length > 1) {
                        val = interpolateParams(val, combinedParams, errors);
                    }
                    finalStyles[prop] = val;
                });
            }
        });
        return finalStyles;
    }
}
function AnimationStateStyles_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationStateStyles.prototype.styles;
    /** @type {?} */
    AnimationStateStyles.prototype.defaultParams;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVVBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBd0IsTUFBTSxTQUFTLENBQUM7QUFHM0YsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFpQywyQkFBMkIsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBRy9HLHVCQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFFeEIsTUFBTTs7Ozs7O0lBQ0osWUFDWSxjQUE2QixHQUFrQixFQUMvQztRQURBLGlCQUFZLEdBQVosWUFBWTtRQUFpQixRQUFHLEdBQUgsR0FBRyxDQUFlO1FBQy9DLGlCQUFZLEdBQVosWUFBWTtLQUFpRDs7Ozs7Ozs7SUFFekUsS0FBSyxDQUFDLFlBQWlCLEVBQUUsU0FBYyxFQUFFLE9BQVksRUFBRSxNQUE0QjtRQUNqRixNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDL0Y7Ozs7Ozs7SUFFRCxXQUFXLENBQUMsU0FBaUIsRUFBRSxNQUE0QixFQUFFLE1BQWE7UUFDeEUsdUJBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRCx1QkFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCx1QkFBTSxZQUFZ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QztRQUNuQyx1QkFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNoQyx1QkFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2FBQzdCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLHVCQUFNLFFBQVEscUJBQUcsS0FBWSxDQUFBLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNuQyxxQkFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25CLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUN0RDtvQkFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO2lCQUN6QixDQUFDLENBQUM7YUFDSjtTQUNGLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDcEI7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uT3B0aW9ucywgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi4vcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtnZXRPclNldEFzSW5NYXB9IGZyb20gJy4uL3JlbmRlci9zaGFyZWQnO1xuaW1wb3J0IHtjb3B5T2JqLCBpbnRlcnBvbGF0ZVBhcmFtcywgaXRlcmF0b3JUb0FycmF5LCBtZXJnZUFuaW1hdGlvbk9wdGlvbnN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge1N0eWxlQXN0LCBUcmFuc2l0aW9uQXN0fSBmcm9tICcuL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtidWlsZEFuaW1hdGlvblRpbWVsaW5lc30gZnJvbSAnLi9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlcic7XG5pbXBvcnQge1RyYW5zaXRpb25NYXRjaGVyRm59IGZyb20gJy4vYW5pbWF0aW9uX3RyYW5zaXRpb25fZXhwcic7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbiwgY3JlYXRlVHJhbnNpdGlvbkluc3RydWN0aW9ufSBmcm9tICcuL2FuaW1hdGlvbl90cmFuc2l0aW9uX2luc3RydWN0aW9uJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcblxuY29uc3QgRU1QVFlfT0JKRUNUID0ge307XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfdHJpZ2dlck5hbWU6IHN0cmluZywgcHVibGljIGFzdDogVHJhbnNpdGlvbkFzdCxcbiAgICAgIHByaXZhdGUgX3N0YXRlU3R5bGVzOiB7W3N0YXRlTmFtZTogc3RyaW5nXTogQW5pbWF0aW9uU3RhdGVTdHlsZXN9KSB7fVxuXG4gIG1hdGNoKGN1cnJlbnRTdGF0ZTogYW55LCBuZXh0U3RhdGU6IGFueSwgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG9uZU9yTW9yZVRyYW5zaXRpb25zTWF0Y2godGhpcy5hc3QubWF0Y2hlcnMsIGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBlbGVtZW50LCBwYXJhbXMpO1xuICB9XG5cbiAgYnVpbGRTdHlsZXMoc3RhdGVOYW1lOiBzdHJpbmcsIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0sIGVycm9yczogYW55W10pIHtcbiAgICBjb25zdCBiYWNrdXBTdGF0ZVN0eWxlciA9IHRoaXMuX3N0YXRlU3R5bGVzWycqJ107XG4gICAgY29uc3Qgc3RhdGVTdHlsZXIgPSB0aGlzLl9zdGF0ZVN0eWxlc1tzdGF0ZU5hbWVdO1xuICAgIGNvbnN0IGJhY2t1cFN0eWxlcyA9IGJhY2t1cFN0YXRlU3R5bGVyID8gYmFja3VwU3RhdGVTdHlsZXIuYnVpbGRTdHlsZXMocGFyYW1zLCBlcnJvcnMpIDoge307XG4gICAgcmV0dXJuIHN0YXRlU3R5bGVyID8gc3RhdGVTdHlsZXIuYnVpbGRTdHlsZXMocGFyYW1zLCBlcnJvcnMpIDogYmFja3VwU3R5bGVzO1xuICB9XG5cbiAgYnVpbGQoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgZWxlbWVudDogYW55LCBjdXJyZW50U3RhdGU6IGFueSwgbmV4dFN0YXRlOiBhbnksXG4gICAgICBlbnRlckNsYXNzTmFtZTogc3RyaW5nLCBsZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBjdXJyZW50T3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMsXG4gICAgICBuZXh0T3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMsXG4gICAgICBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXApOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24ge1xuICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcblxuICAgIGNvbnN0IHRyYW5zaXRpb25BbmltYXRpb25QYXJhbXMgPSB0aGlzLmFzdC5vcHRpb25zICYmIHRoaXMuYXN0Lm9wdGlvbnMucGFyYW1zIHx8IEVNUFRZX09CSkVDVDtcbiAgICBjb25zdCBjdXJyZW50QW5pbWF0aW9uUGFyYW1zID0gY3VycmVudE9wdGlvbnMgJiYgY3VycmVudE9wdGlvbnMucGFyYW1zIHx8IEVNUFRZX09CSkVDVDtcbiAgICBjb25zdCBjdXJyZW50U3RhdGVTdHlsZXMgPSB0aGlzLmJ1aWxkU3R5bGVzKGN1cnJlbnRTdGF0ZSwgY3VycmVudEFuaW1hdGlvblBhcmFtcywgZXJyb3JzKTtcbiAgICBjb25zdCBuZXh0QW5pbWF0aW9uUGFyYW1zID0gbmV4dE9wdGlvbnMgJiYgbmV4dE9wdGlvbnMucGFyYW1zIHx8IEVNUFRZX09CSkVDVDtcbiAgICBjb25zdCBuZXh0U3RhdGVTdHlsZXMgPSB0aGlzLmJ1aWxkU3R5bGVzKG5leHRTdGF0ZSwgbmV4dEFuaW1hdGlvblBhcmFtcywgZXJyb3JzKTtcblxuICAgIGNvbnN0IHF1ZXJpZWRFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IHByZVN0eWxlTWFwID0gbmV3IE1hcDxhbnksIHtbcHJvcDogc3RyaW5nXTogYm9vbGVhbn0+KCk7XG4gICAgY29uc3QgcG9zdFN0eWxlTWFwID0gbmV3IE1hcDxhbnksIHtbcHJvcDogc3RyaW5nXTogYm9vbGVhbn0+KCk7XG4gICAgY29uc3QgaXNSZW1vdmFsID0gbmV4dFN0YXRlID09PSAndm9pZCc7XG5cbiAgICBjb25zdCBhbmltYXRpb25PcHRpb25zID0ge3BhcmFtczogey4uLnRyYW5zaXRpb25BbmltYXRpb25QYXJhbXMsIC4uLm5leHRBbmltYXRpb25QYXJhbXN9fTtcblxuICAgIGNvbnN0IHRpbWVsaW5lcyA9IGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICAgICAgICBkcml2ZXIsIGVsZW1lbnQsIHRoaXMuYXN0LmFuaW1hdGlvbiwgZW50ZXJDbGFzc05hbWUsIGxlYXZlQ2xhc3NOYW1lLCBjdXJyZW50U3RhdGVTdHlsZXMsXG4gICAgICAgIG5leHRTdGF0ZVN0eWxlcywgYW5pbWF0aW9uT3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zLCBlcnJvcnMpO1xuXG4gICAgbGV0IHRvdGFsVGltZSA9IDA7XG4gICAgdGltZWxpbmVzLmZvckVhY2godGwgPT4geyB0b3RhbFRpbWUgPSBNYXRoLm1heCh0bC5kdXJhdGlvbiArIHRsLmRlbGF5LCB0b3RhbFRpbWUpOyB9KTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlVHJhbnNpdGlvbkluc3RydWN0aW9uKFxuICAgICAgICAgIGVsZW1lbnQsIHRoaXMuX3RyaWdnZXJOYW1lLCBjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgaXNSZW1vdmFsLCBjdXJyZW50U3RhdGVTdHlsZXMsXG4gICAgICAgICAgbmV4dFN0YXRlU3R5bGVzLCBbXSwgW10sIHByZVN0eWxlTWFwLCBwb3N0U3R5bGVNYXAsIHRvdGFsVGltZSwgZXJyb3JzKTtcbiAgICB9XG5cbiAgICB0aW1lbGluZXMuZm9yRWFjaCh0bCA9PiB7XG4gICAgICBjb25zdCBlbG0gPSB0bC5lbGVtZW50O1xuICAgICAgY29uc3QgcHJlUHJvcHMgPSBnZXRPclNldEFzSW5NYXAocHJlU3R5bGVNYXAsIGVsbSwge30pO1xuICAgICAgdGwucHJlU3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4gcHJlUHJvcHNbcHJvcF0gPSB0cnVlKTtcblxuICAgICAgY29uc3QgcG9zdFByb3BzID0gZ2V0T3JTZXRBc0luTWFwKHBvc3RTdHlsZU1hcCwgZWxtLCB7fSk7XG4gICAgICB0bC5wb3N0U3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4gcG9zdFByb3BzW3Byb3BdID0gdHJ1ZSk7XG5cbiAgICAgIGlmIChlbG0gIT09IGVsZW1lbnQpIHtcbiAgICAgICAgcXVlcmllZEVsZW1lbnRzLmFkZChlbG0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgcXVlcmllZEVsZW1lbnRzTGlzdCA9IGl0ZXJhdG9yVG9BcnJheShxdWVyaWVkRWxlbWVudHMudmFsdWVzKCkpO1xuICAgIHJldHVybiBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgIGVsZW1lbnQsIHRoaXMuX3RyaWdnZXJOYW1lLCBjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgaXNSZW1vdmFsLCBjdXJyZW50U3RhdGVTdHlsZXMsXG4gICAgICAgIG5leHRTdGF0ZVN0eWxlcywgdGltZWxpbmVzLCBxdWVyaWVkRWxlbWVudHNMaXN0LCBwcmVTdHlsZU1hcCwgcG9zdFN0eWxlTWFwLCB0b3RhbFRpbWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uZU9yTW9yZVRyYW5zaXRpb25zTWF0Y2goXG4gICAgbWF0Y2hGbnM6IFRyYW5zaXRpb25NYXRjaGVyRm5bXSwgY3VycmVudFN0YXRlOiBhbnksIG5leHRTdGF0ZTogYW55LCBlbGVtZW50OiBhbnksXG4gICAgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWF0Y2hGbnMuc29tZShmbiA9PiBmbihjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgZWxlbWVudCwgcGFyYW1zKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25TdGF0ZVN0eWxlcyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc3R5bGVzOiBTdHlsZUFzdCwgcHJpdmF0ZSBkZWZhdWx0UGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSkge31cblxuICBidWlsZFN0eWxlcyhwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBlcnJvcnM6IHN0cmluZ1tdKTogybVTdHlsZURhdGEge1xuICAgIGNvbnN0IGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICAgIGNvbnN0IGNvbWJpbmVkUGFyYW1zID0gY29weU9iaih0aGlzLmRlZmF1bHRQYXJhbXMpO1xuICAgIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBwYXJhbXNba2V5XTtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGNvbWJpbmVkUGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnN0eWxlcy5zdHlsZXMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCBzdHlsZU9iaiA9IHZhbHVlIGFzIGFueTtcbiAgICAgICAgT2JqZWN0LmtleXMoc3R5bGVPYmopLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgICAgbGV0IHZhbCA9IHN0eWxlT2JqW3Byb3BdO1xuICAgICAgICAgIGlmICh2YWwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdmFsID0gaW50ZXJwb2xhdGVQYXJhbXModmFsLCBjb21iaW5lZFBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmluYWxTdHlsZXNbcHJvcF0gPSB2YWw7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFN0eWxlcztcbiAgfVxufVxuIl19