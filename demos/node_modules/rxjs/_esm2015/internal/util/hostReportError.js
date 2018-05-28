/**
 * Throws an error on another job so that it's picked up by the runtime's
 * uncaught error handling mechanism.
 * @param err the error to throw
 */
export function hostReportError(err) {
    setTimeout(() => { throw err; });
}
//# sourceMappingURL=hostReportError.js.map