/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NoopAnimationPlayer } from '@angular/animations';
export class DirectStylePlayer extends NoopAnimationPlayer {
    /**
     * @param {?} element
     * @param {?} _styles
     */
    constructor(element, _styles) {
        super();
        this.element = element;
        this._styles = _styles;
        this._startingStyles = {};
        this.__initialized = false;
    }
    /**
     * @return {?}
     */
    init() {
        if (this.__initialized || !this._startingStyles)
            return;
        this.__initialized = true;
        Object.keys(this._styles).forEach(prop => {
            /** @type {?} */ ((this._startingStyles))[prop] = this.element.style[prop];
        });
        super.init();
    }
    /**
     * @return {?}
     */
    play() {
        if (!this._startingStyles)
            return;
        this.init();
        Object.keys(this._styles).forEach(prop => { this.element.style[prop] = this._styles[prop]; });
        super.play();
    }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._startingStyles)
            return;
        Object.keys(this._startingStyles).forEach(prop => {
            const /** @type {?} */ value = /** @type {?} */ ((this._startingStyles))[prop];
            if (value) {
                this.element.style[prop] = value;
            }
            else {
                this.element.style.removeProperty(prop);
            }
        });
        this._startingStyles = null;
        super.destroy();
    }
}
function DirectStylePlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    DirectStylePlayer.prototype._startingStyles;
    /** @type {?} */
    DirectStylePlayer.prototype.__initialized;
    /** @type {?} */
    DirectStylePlayer.prototype.element;
    /** @type {?} */
    DirectStylePlayer.prototype._styles;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0X3N0eWxlX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2Nzc19rZXlmcmFtZXMvZGlyZWN0X3N0eWxlX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFeEQsTUFBTSx3QkFBeUIsU0FBUSxtQkFBbUI7Ozs7O0lBSXhELFlBQW1CLE9BQVksRUFBVSxPQUE2QjtRQUFJLEtBQUssRUFBRSxDQUFDO1FBQS9ELFlBQU8sR0FBUCxPQUFPLENBQUs7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFzQjsrQkFIakIsRUFBRTs2QkFDL0IsS0FBSztLQUV1RDs7OztJQUVwRixJQUFJO1FBQ0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDeEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFOytCQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7U0FDeEQsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Q7Ozs7SUFFRCxJQUFJO1FBQ0YsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUYsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Q7Ozs7SUFFRCxPQUFPO1FBQ0wsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQyx1QkFBTSxLQUFLLHNCQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDM0MsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDbEM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDekM7U0FDRixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDakI7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Tm9vcEFuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RTdHlsZVBsYXllciBleHRlbmRzIE5vb3BBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9zdGFydGluZ1N0eWxlczoge1trZXk6IHN0cmluZ106IGFueX18bnVsbCA9IHt9O1xuICBwcml2YXRlIF9faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogYW55LCBwcml2YXRlIF9zdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7IHN1cGVyKCk7IH1cblxuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl9faW5pdGlhbGl6ZWQgfHwgIXRoaXMuX3N0YXJ0aW5nU3R5bGVzKSByZXR1cm47XG4gICAgdGhpcy5fX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9zdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICB0aGlzLl9zdGFydGluZ1N0eWxlcyAhW3Byb3BdID0gdGhpcy5lbGVtZW50LnN0eWxlW3Byb3BdO1xuICAgIH0pO1xuICAgIHN1cGVyLmluaXQoKTtcbiAgfVxuXG4gIHBsYXkoKSB7XG4gICAgaWYgKCF0aGlzLl9zdGFydGluZ1N0eWxlcykgcmV0dXJuO1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3N0eWxlcykuZm9yRWFjaChwcm9wID0+IHsgdGhpcy5lbGVtZW50LnN0eWxlW3Byb3BdID0gdGhpcy5fc3R5bGVzW3Byb3BdOyB9KTtcbiAgICBzdXBlci5wbGF5KCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5fc3RhcnRpbmdTdHlsZXMpIHJldHVybjtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9zdGFydGluZ1N0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fc3RhcnRpbmdTdHlsZXMgIVtwcm9wXTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9zdGFydGluZ1N0eWxlcyA9IG51bGw7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=