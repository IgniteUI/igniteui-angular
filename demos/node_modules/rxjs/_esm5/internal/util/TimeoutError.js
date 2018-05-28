/** PURE_IMPORTS_START tslib PURE_IMPORTS_END */
import * as tslib_1 from "tslib";
/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 *
 * @class TimeoutError
 */
var TimeoutError = /*@__PURE__*/ (function (_super) {
    tslib_1.__extends(TimeoutError, _super);
    function TimeoutError() {
        var _this = _super.call(this, 'Timeout has occurred') || this;
        Object.setPrototypeOf(_this, TimeoutError.prototype);
        return _this;
    }
    return TimeoutError;
}(Error));
export { TimeoutError };
//# sourceMappingURL=TimeoutError.js.map
