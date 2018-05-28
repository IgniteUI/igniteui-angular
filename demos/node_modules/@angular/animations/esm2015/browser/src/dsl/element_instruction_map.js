/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
export class ElementInstructionMap {
    constructor() {
        this._map = new Map();
    }
    /**
     * @param {?} element
     * @return {?}
     */
    consume(element) {
        let /** @type {?} */ instructions = this._map.get(element);
        if (instructions) {
            this._map.delete(element);
        }
        else {
            instructions = [];
        }
        return instructions;
    }
    /**
     * @param {?} element
     * @param {?} instructions
     * @return {?}
     */
    append(element, instructions) {
        let /** @type {?} */ existingInstructions = this._map.get(element);
        if (!existingInstructions) {
            this._map.set(element, existingInstructions = []);
        }
        existingInstructions.push(...instructions);
    }
    /**
     * @param {?} element
     * @return {?}
     */
    has(element) { return this._map.has(element); }
    /**
     * @return {?}
     */
    clear() { this._map.clear(); }
}
function ElementInstructionMap_tsickle_Closure_declarations() {
    /** @type {?} */
    ElementInstructionMap.prototype._map;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9lbGVtZW50X2luc3RydWN0aW9uX21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBU0EsTUFBTTs7b0JBQ1csSUFBSSxHQUFHLEVBQXVDOzs7Ozs7SUFFN0QsT0FBTyxDQUFDLE9BQVk7UUFDbEIscUJBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDM0I7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLFlBQVksR0FBRyxFQUFFLENBQUM7U0FDbkI7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO0tBQ3JCOzs7Ozs7SUFFRCxNQUFNLENBQUMsT0FBWSxFQUFFLFlBQTRDO1FBQy9ELHFCQUFJLG9CQUFvQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNuRDtRQUNELG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDO0tBQzVDOzs7OztJQUVELEdBQUcsQ0FBQyxPQUFZLElBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Ozs7SUFFN0QsS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRTtDQUMvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudEluc3RydWN0aW9uTWFwIHtcbiAgcHJpdmF0ZSBfbWFwID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXT4oKTtcblxuICBjb25zdW1lKGVsZW1lbnQ6IGFueSk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSB7XG4gICAgbGV0IGluc3RydWN0aW9ucyA9IHRoaXMuX21hcC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGluc3RydWN0aW9ucykge1xuICAgICAgdGhpcy5fbWFwLmRlbGV0ZShlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5zdHJ1Y3Rpb25zID0gW107XG4gICAgfVxuICAgIHJldHVybiBpbnN0cnVjdGlvbnM7XG4gIH1cblxuICBhcHBlbmQoZWxlbWVudDogYW55LCBpbnN0cnVjdGlvbnM6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSkge1xuICAgIGxldCBleGlzdGluZ0luc3RydWN0aW9ucyA9IHRoaXMuX21hcC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKCFleGlzdGluZ0luc3RydWN0aW9ucykge1xuICAgICAgdGhpcy5fbWFwLnNldChlbGVtZW50LCBleGlzdGluZ0luc3RydWN0aW9ucyA9IFtdKTtcbiAgICB9XG4gICAgZXhpc3RpbmdJbnN0cnVjdGlvbnMucHVzaCguLi5pbnN0cnVjdGlvbnMpO1xuICB9XG5cbiAgaGFzKGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fbWFwLmhhcyhlbGVtZW50KTsgfVxuXG4gIGNsZWFyKCkgeyB0aGlzLl9tYXAuY2xlYXIoKTsgfVxufVxuIl19