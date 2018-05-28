/**
 * Throws an error on another job so that it's picked up by the runtime's
 * uncaught error handling mechanism.
 * @param err the error to throw
 */
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
export function hostReportError(err) {
    setTimeout(function () { throw err; });
}
//# sourceMappingURL=hostReportError.js.map
