import { merge as mergeStatic } from '../observable/merge';
/* tslint:enable:max-line-length */
/**
 * @deprecated Deprecated in favor of static merge.
 */
export function merge(...observables) {
    return (source) => source.lift.call(mergeStatic(source, ...observables));
}
//# sourceMappingURL=merge.js.map