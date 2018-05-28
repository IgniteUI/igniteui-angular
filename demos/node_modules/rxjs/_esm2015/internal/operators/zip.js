import { zip as zipStatic } from '../observable/zip';
/* tslint:enable:max-line-length */
/**
 * @deprecated Deprecated in favor of static zip.
 */
export function zip(...observables) {
    return function zipOperatorFunction(source) {
        return source.lift.call(zipStatic(source, ...observables));
    };
}
//# sourceMappingURL=zip.js.map