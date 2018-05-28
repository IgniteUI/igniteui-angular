/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */
export function AnimationTransitionInstruction() { }
function AnimationTransitionInstruction_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTransitionInstruction.prototype.element;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.triggerName;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.isRemovalTransition;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.fromState;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.fromStyles;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.toState;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.toStyles;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.timelines;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.queriedElements;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.preStyleProps;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.postStyleProps;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.totalTime;
    /** @type {?|undefined} */
    AnimationTransitionInstruction.prototype.errors;
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?} isRemovalTransition
 * @param {?} fromStyles
 * @param {?} toStyles
 * @param {?} timelines
 * @param {?} queriedElements
 * @param {?} preStyleProps
 * @param {?} postStyleProps
 * @param {?} totalTime
 * @param {?=} errors
 * @return {?}
 */
export function createTransitionInstruction(element, triggerName, fromState, toState, isRemovalTransition, fromStyles, toStyles, timelines, queriedElements, preStyleProps, postStyleProps, totalTime, errors) {
    return {
        type: 0 /* TransitionAnimation */,
        element,
        triggerName,
        isRemovalTransition,
        fromState,
        fromStyles,
        toState,
        toStyles,
        timelines,
        queriedElements,
        preStyleProps,
        postStyleProps,
        totalTime,
        errors
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkJBLE1BQU0sc0NBQ0YsT0FBWSxFQUFFLFdBQW1CLEVBQUUsU0FBaUIsRUFBRSxPQUFlLEVBQ3JFLG1CQUE0QixFQUFFLFVBQXNCLEVBQUUsUUFBb0IsRUFDMUUsU0FBeUMsRUFBRSxlQUFzQixFQUNqRSxhQUFrRCxFQUNsRCxjQUFtRCxFQUFFLFNBQWlCLEVBQ3RFLE1BQWM7SUFDaEIsTUFBTSxDQUFDO1FBQ0wsSUFBSSw2QkFBd0Q7UUFDNUQsT0FBTztRQUNQLFdBQVc7UUFDWCxtQkFBbUI7UUFDbkIsU0FBUztRQUNULFVBQVU7UUFDVixPQUFPO1FBQ1AsUUFBUTtRQUNSLFNBQVM7UUFDVCxlQUFlO1FBQ2YsYUFBYTtRQUNiLGNBQWM7UUFDZCxTQUFTO1FBQ1QsTUFBTTtLQUNQLENBQUM7Q0FDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtBbmltYXRpb25FbmdpbmVJbnN0cnVjdGlvbiwgQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uVHlwZX0gZnJvbSAnLi4vcmVuZGVyL2FuaW1hdGlvbl9lbmdpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9ufSBmcm9tICcuL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uIGV4dGVuZHMgQW5pbWF0aW9uRW5naW5lSW5zdHJ1Y3Rpb24ge1xuICBlbGVtZW50OiBhbnk7XG4gIHRyaWdnZXJOYW1lOiBzdHJpbmc7XG4gIGlzUmVtb3ZhbFRyYW5zaXRpb246IGJvb2xlYW47XG4gIGZyb21TdGF0ZTogc3RyaW5nO1xuICBmcm9tU3R5bGVzOiDJtVN0eWxlRGF0YTtcbiAgdG9TdGF0ZTogc3RyaW5nO1xuICB0b1N0eWxlczogybVTdHlsZURhdGE7XG4gIHRpbWVsaW5lczogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdO1xuICBxdWVyaWVkRWxlbWVudHM6IGFueVtdO1xuICBwcmVTdHlsZVByb3BzOiBNYXA8YW55LCB7W3Byb3A6IHN0cmluZ106IGJvb2xlYW59PjtcbiAgcG9zdFN0eWxlUHJvcHM6IE1hcDxhbnksIHtbcHJvcDogc3RyaW5nXTogYm9vbGVhbn0+O1xuICB0b3RhbFRpbWU6IG51bWJlcjtcbiAgZXJyb3JzPzogYW55W107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCBmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLFxuICAgIGlzUmVtb3ZhbFRyYW5zaXRpb246IGJvb2xlYW4sIGZyb21TdHlsZXM6IMm1U3R5bGVEYXRhLCB0b1N0eWxlczogybVTdHlsZURhdGEsXG4gICAgdGltZWxpbmVzOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10sIHF1ZXJpZWRFbGVtZW50czogYW55W10sXG4gICAgcHJlU3R5bGVQcm9wczogTWFwPGFueSwge1twcm9wOiBzdHJpbmddOiBib29sZWFufT4sXG4gICAgcG9zdFN0eWxlUHJvcHM6IE1hcDxhbnksIHtbcHJvcDogc3RyaW5nXTogYm9vbGVhbn0+LCB0b3RhbFRpbWU6IG51bWJlcixcbiAgICBlcnJvcnM/OiBhbnlbXSk6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uVHlwZS5UcmFuc2l0aW9uQW5pbWF0aW9uLFxuICAgIGVsZW1lbnQsXG4gICAgdHJpZ2dlck5hbWUsXG4gICAgaXNSZW1vdmFsVHJhbnNpdGlvbixcbiAgICBmcm9tU3RhdGUsXG4gICAgZnJvbVN0eWxlcyxcbiAgICB0b1N0YXRlLFxuICAgIHRvU3R5bGVzLFxuICAgIHRpbWVsaW5lcyxcbiAgICBxdWVyaWVkRWxlbWVudHMsXG4gICAgcHJlU3R5bGVQcm9wcyxcbiAgICBwb3N0U3R5bGVQcm9wcyxcbiAgICB0b3RhbFRpbWUsXG4gICAgZXJyb3JzXG4gIH07XG59XG4iXX0=