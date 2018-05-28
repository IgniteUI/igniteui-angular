/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AnimationStateStyles, AnimationTransitionFactory } from './animation_transition_factory';
/**
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} ast
 * @return {?}
 */
export function buildTrigger(name, ast) {
    return new AnimationTrigger(name, ast);
}
/**
 * \@experimental Animation support is experimental.
 */
export class AnimationTrigger {
    /**
     * @param {?} name
     * @param {?} ast
     */
    constructor(name, ast) {
        this.name = name;
        this.ast = ast;
        this.transitionFactories = [];
        this.states = {};
        ast.states.forEach(ast => {
            const /** @type {?} */ defaultParams = (ast.options && ast.options.params) || {};
            this.states[ast.name] = new AnimationStateStyles(ast.style, defaultParams);
        });
        balanceProperties(this.states, 'true', '1');
        balanceProperties(this.states, 'false', '0');
        ast.transitions.forEach(ast => {
            this.transitionFactories.push(new AnimationTransitionFactory(name, ast, this.states));
        });
        this.fallbackTransition = createFallbackTransition(name, this.states);
    }
    /**
     * @return {?}
     */
    get containsQueries() { return this.ast.queryCount > 0; }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    matchTransition(currentState, nextState, element, params) {
        const /** @type {?} */ entry = this.transitionFactories.find(f => f.match(currentState, nextState, element, params));
        return entry || null;
    }
    /**
     * @param {?} currentState
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    matchStyles(currentState, params, errors) {
        return this.fallbackTransition.buildStyles(currentState, params, errors);
    }
}
function AnimationTrigger_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTrigger.prototype.transitionFactories;
    /** @type {?} */
    AnimationTrigger.prototype.fallbackTransition;
    /** @type {?} */
    AnimationTrigger.prototype.states;
    /** @type {?} */
    AnimationTrigger.prototype.name;
    /** @type {?} */
    AnimationTrigger.prototype.ast;
}
/**
 * @param {?} triggerName
 * @param {?} states
 * @return {?}
 */
function createFallbackTransition(triggerName, states) {
    const /** @type {?} */ matchers = [(fromState, toState) => true];
    const /** @type {?} */ animation = { type: 2 /* Sequence */, steps: [], options: null };
    const /** @type {?} */ transition = {
        type: 1 /* Transition */,
        animation,
        matchers,
        options: null,
        queryCount: 0,
        depCount: 0
    };
    return new AnimationTransitionFactory(triggerName, transition, states);
}
/**
 * @param {?} obj
 * @param {?} key1
 * @param {?} key2
 * @return {?}
 */
function balanceProperties(obj, key1, key2) {
    if (obj.hasOwnProperty(key1)) {
        if (!obj.hasOwnProperty(key2)) {
            obj[key2] = obj[key1];
        }
    }
    else if (obj.hasOwnProperty(key2)) {
        obj[key1] = obj[key2];
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJpZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBWUEsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7Ozs7Ozs7QUFPaEcsTUFBTSx1QkFBdUIsSUFBWSxFQUFFLEdBQWU7SUFDeEQsTUFBTSxDQUFDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3hDOzs7O0FBS0QsTUFBTTs7Ozs7SUFLSixZQUFtQixJQUFZLEVBQVMsR0FBZTtRQUFwQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBWTttQ0FKSSxFQUFFO3NCQUVBLEVBQUU7UUFHN0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdkIsdUJBQU0sYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7U0FDNUUsQ0FBQyxDQUFDO1FBRUgsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFN0MsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLDBCQUEwQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDdkYsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixHQUFHLHdCQUF3QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkU7Ozs7SUFFRCxJQUFJLGVBQWUsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7O0lBRXpELGVBQWUsQ0FBQyxZQUFpQixFQUFFLFNBQWMsRUFBRSxPQUFZLEVBQUUsTUFBNEI7UUFFM0YsdUJBQU0sS0FBSyxHQUNQLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDMUYsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7S0FDdEI7Ozs7Ozs7SUFFRCxXQUFXLENBQUMsWUFBaUIsRUFBRSxNQUE0QixFQUFFLE1BQWE7UUFDeEUsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztLQUMxRTtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxrQ0FDSSxXQUFtQixFQUNuQixNQUFtRDtJQUNyRCx1QkFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQWMsRUFBRSxPQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFELHVCQUFNLFNBQVMsR0FBZ0IsRUFBQyxJQUFJLGtCQUFnQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ2hHLHVCQUFNLFVBQVUsR0FBa0I7UUFDaEMsSUFBSSxvQkFBa0M7UUFDdEMsU0FBUztRQUNULFFBQVE7UUFDUixPQUFPLEVBQUUsSUFBSTtRQUNiLFVBQVUsRUFBRSxDQUFDO1FBQ2IsUUFBUSxFQUFFLENBQUM7S0FDWixDQUFDO0lBQ0YsTUFBTSxDQUFDLElBQUksMEJBQTBCLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUN4RTs7Ozs7OztBQUVELDJCQUEyQixHQUF5QixFQUFFLElBQVksRUFBRSxJQUFZO0lBQzlFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtLQUNGO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkI7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uTWV0YWRhdGFUeXBlLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7Y29weVN0eWxlcywgaW50ZXJwb2xhdGVQYXJhbXN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge1NlcXVlbmNlQXN0LCBTdHlsZUFzdCwgVHJhbnNpdGlvbkFzdCwgVHJpZ2dlckFzdH0gZnJvbSAnLi9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7QW5pbWF0aW9uU3RhdGVTdHlsZXMsIEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fSBmcm9tICcuL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnknO1xuXG5cblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVHJpZ2dlcihuYW1lOiBzdHJpbmcsIGFzdDogVHJpZ2dlckFzdCk6IEFuaW1hdGlvblRyaWdnZXIge1xuICByZXR1cm4gbmV3IEFuaW1hdGlvblRyaWdnZXIobmFtZSwgYXN0KTtcbn1cblxuLyoqXG4qIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuKi9cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UcmlnZ2VyIHtcbiAgcHVibGljIHRyYW5zaXRpb25GYWN0b3JpZXM6IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5W10gPSBbXTtcbiAgcHVibGljIGZhbGxiYWNrVHJhbnNpdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnk7XG4gIHB1YmxpYyBzdGF0ZXM6IHtbc3RhdGVOYW1lOiBzdHJpbmddOiBBbmltYXRpb25TdGF0ZVN0eWxlc30gPSB7fTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXN0OiBUcmlnZ2VyQXN0KSB7XG4gICAgYXN0LnN0YXRlcy5mb3JFYWNoKGFzdCA9PiB7XG4gICAgICBjb25zdCBkZWZhdWx0UGFyYW1zID0gKGFzdC5vcHRpb25zICYmIGFzdC5vcHRpb25zLnBhcmFtcykgfHwge307XG4gICAgICB0aGlzLnN0YXRlc1thc3QubmFtZV0gPSBuZXcgQW5pbWF0aW9uU3RhdGVTdHlsZXMoYXN0LnN0eWxlLCBkZWZhdWx0UGFyYW1zKTtcbiAgICB9KTtcblxuICAgIGJhbGFuY2VQcm9wZXJ0aWVzKHRoaXMuc3RhdGVzLCAndHJ1ZScsICcxJyk7XG4gICAgYmFsYW5jZVByb3BlcnRpZXModGhpcy5zdGF0ZXMsICdmYWxzZScsICcwJyk7XG5cbiAgICBhc3QudHJhbnNpdGlvbnMuZm9yRWFjaChhc3QgPT4ge1xuICAgICAgdGhpcy50cmFuc2l0aW9uRmFjdG9yaWVzLnB1c2gobmV3IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5KG5hbWUsIGFzdCwgdGhpcy5zdGF0ZXMpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZmFsbGJhY2tUcmFuc2l0aW9uID0gY3JlYXRlRmFsbGJhY2tUcmFuc2l0aW9uKG5hbWUsIHRoaXMuc3RhdGVzKTtcbiAgfVxuXG4gIGdldCBjb250YWluc1F1ZXJpZXMoKSB7IHJldHVybiB0aGlzLmFzdC5xdWVyeUNvdW50ID4gMDsgfVxuXG4gIG1hdGNoVHJhbnNpdGlvbihjdXJyZW50U3RhdGU6IGFueSwgbmV4dFN0YXRlOiBhbnksIGVsZW1lbnQ6IGFueSwgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6XG4gICAgICBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeXxudWxsIHtcbiAgICBjb25zdCBlbnRyeSA9XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkZhY3Rvcmllcy5maW5kKGYgPT4gZi5tYXRjaChjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgZWxlbWVudCwgcGFyYW1zKSk7XG4gICAgcmV0dXJuIGVudHJ5IHx8IG51bGw7XG4gIH1cblxuICBtYXRjaFN0eWxlcyhjdXJyZW50U3RhdGU6IGFueSwgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSwgZXJyb3JzOiBhbnlbXSk6IMm1U3R5bGVEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5mYWxsYmFja1RyYW5zaXRpb24uYnVpbGRTdHlsZXMoY3VycmVudFN0YXRlLCBwYXJhbXMsIGVycm9ycyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRmFsbGJhY2tUcmFuc2l0aW9uKFxuICAgIHRyaWdnZXJOYW1lOiBzdHJpbmcsXG4gICAgc3RhdGVzOiB7W3N0YXRlTmFtZTogc3RyaW5nXTogQW5pbWF0aW9uU3RhdGVTdHlsZXN9KTogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnkge1xuICBjb25zdCBtYXRjaGVycyA9IFsoZnJvbVN0YXRlOiBhbnksIHRvU3RhdGU6IGFueSkgPT4gdHJ1ZV07XG4gIGNvbnN0IGFuaW1hdGlvbjogU2VxdWVuY2VBc3QgPSB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlLCBzdGVwczogW10sIG9wdGlvbnM6IG51bGx9O1xuICBjb25zdCB0cmFuc2l0aW9uOiBUcmFuc2l0aW9uQXN0ID0ge1xuICAgIHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uLFxuICAgIGFuaW1hdGlvbixcbiAgICBtYXRjaGVycyxcbiAgICBvcHRpb25zOiBudWxsLFxuICAgIHF1ZXJ5Q291bnQ6IDAsXG4gICAgZGVwQ291bnQ6IDBcbiAgfTtcbiAgcmV0dXJuIG5ldyBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeSh0cmlnZ2VyTmFtZSwgdHJhbnNpdGlvbiwgc3RhdGVzKTtcbn1cblxuZnVuY3Rpb24gYmFsYW5jZVByb3BlcnRpZXMob2JqOiB7W2tleTogc3RyaW5nXTogYW55fSwga2V5MTogc3RyaW5nLCBrZXkyOiBzdHJpbmcpIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkxKSkge1xuICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KGtleTIpKSB7XG4gICAgICBvYmpba2V5Ml0gPSBvYmpba2V5MV07XG4gICAgfVxuICB9IGVsc2UgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkyKSkge1xuICAgIG9ialtrZXkxXSA9IG9ialtrZXkyXTtcbiAgfVxufVxuIl19