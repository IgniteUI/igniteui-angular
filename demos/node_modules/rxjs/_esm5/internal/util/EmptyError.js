/** PURE_IMPORTS_START tslib PURE_IMPORTS_END */
import * as tslib_1 from "tslib";
/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 *
 * @class EmptyError
 */
var EmptyError = /*@__PURE__*/ (function (_super) {
    tslib_1.__extends(EmptyError, _super);
    function EmptyError() {
        var _this = _super.call(this, 'no elements in sequence') || this;
        _this.name = 'EmptyError';
        Object.setPrototypeOf(_this, EmptyError.prototype);
        return _this;
    }
    return EmptyError;
}(Error));
export { EmptyError };
//# sourceMappingURL=EmptyError.js.map
