"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("../Observable");
/**
 * Tests to see if the object is an RxJS {@link Observable}
 * @param obj the object to test
 */
function isObservable(obj) {
    return obj && obj instanceof Observable_1.Observable || (typeof obj.lift === 'function' && typeof obj.subscribe === 'function');
}
exports.isObservable = isObservable;
//# sourceMappingURL=isObservable.js.map