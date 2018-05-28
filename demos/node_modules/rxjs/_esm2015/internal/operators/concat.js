import { concat as concatStatic } from '../observable/concat';
/* tslint:enable:max-line-length */
/**
 * @deprecated Deprecated in favor of static concat.
 */
export function concat(...observables) {
    return (source) => source.lift.call(concatStatic(source, ...observables));
}
//# sourceMappingURL=concat.js.map