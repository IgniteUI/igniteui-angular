/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the animation package.
 */
/**
 * \@description
 *
 * Represents the version of angular/animations
 */
export class Version {
    /**
     * @param {?} full
     */
    constructor(full) {
        this.full = full;
        const /** @type {?} */ splits = full.split('.');
        this.major = splits[0];
        this.minor = splits[1];
        this.patch = splits.slice(2).join('.');
    }
}
function Version_tsickle_Closure_declarations() {
    /** @type {?} */
    Version.prototype.major;
    /** @type {?} */
    Version.prototype.minor;
    /** @type {?} */
    Version.prototype.patch;
    /** @type {?} */
    Version.prototype.full;
}
/**
 *
 */
export const /** @type {?} */ VERSION = new Version('6.0.0');

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3ZlcnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLE1BQU07Ozs7SUFLSixZQUFtQixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUM3Qix1QkFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3hDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7O0FBS0QsTUFBTSxDQUFDLHVCQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogRW50cnkgcG9pbnQgZm9yIGFsbCBwdWJsaWMgQVBJcyBvZiB0aGUgYW5pbWF0aW9uIHBhY2thZ2UuXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBSZXByZXNlbnRzIHRoZSB2ZXJzaW9uIG9mIGFuZ3VsYXIvYW5pbWF0aW9uc1xuICovXG5leHBvcnQgY2xhc3MgVmVyc2lvbiB7XG4gIHB1YmxpYyByZWFkb25seSBtYWpvcjogc3RyaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgbWlub3I6IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IHBhdGNoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGZ1bGw6IHN0cmluZykge1xuICAgIGNvbnN0IHNwbGl0cyA9IGZ1bGwuc3BsaXQoJy4nKTtcbiAgICB0aGlzLm1ham9yID0gc3BsaXRzWzBdO1xuICAgIHRoaXMubWlub3IgPSBzcGxpdHNbMV07XG4gICAgdGhpcy5wYXRjaCA9IHNwbGl0cy5zbGljZSgyKS5qb2luKCcuJyk7XG4gIH1cbn1cblxuLyoqXG4gKlxuICovXG5leHBvcnQgY29uc3QgVkVSU0lPTiA9IG5ldyBWZXJzaW9uKCcwLjAuMC1QTEFDRUhPTERFUicpO1xuIl19