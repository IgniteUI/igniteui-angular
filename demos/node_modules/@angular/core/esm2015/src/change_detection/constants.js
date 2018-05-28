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
/** @enum {number} */
const ChangeDetectionStrategy = {
    /**
       * `OnPush` means that the change detector's mode will be initially set to `CheckOnce`.
       */
    OnPush: 0,
    /**
       * `Default` means that the change detector's mode will be initially set to `CheckAlways`.
       */
    Default: 1,
};
export { ChangeDetectionStrategy };
ChangeDetectionStrategy[ChangeDetectionStrategy.OnPush] = "OnPush";
ChangeDetectionStrategy[ChangeDetectionStrategy.Default] = "Default";
/** @enum {number} */
const ChangeDetectorStatus = {
    /**
       * `CheckOnce` means that after calling detectChanges the mode of the change detector
       * will become `Checked`.
       */
    CheckOnce: 0,
    /**
       * `Checked` means that the change detector should be skipped until its mode changes to
       * `CheckOnce`.
       */
    Checked: 1,
    /**
       * `CheckAlways` means that after calling detectChanges the mode of the change detector
       * will remain `CheckAlways`.
       */
    CheckAlways: 2,
    /**
       * `Detached` means that the change detector sub tree is not a part of the main tree and
       * should be skipped.
       */
    Detached: 3,
    /**
       * `Errored` means that the change detector encountered an error checking a binding
       * or calling a directive lifecycle method and is now in an inconsistent state. Change
       * detectors in this state will no longer detect changes.
       */
    Errored: 4,
    /**
       * `Destroyed` means that the change detector is destroyed.
       */
    Destroyed: 5,
};
export { ChangeDetectorStatus };
ChangeDetectorStatus[ChangeDetectorStatus.CheckOnce] = "CheckOnce";
ChangeDetectorStatus[ChangeDetectorStatus.Checked] = "Checked";
ChangeDetectorStatus[ChangeDetectorStatus.CheckAlways] = "CheckAlways";
ChangeDetectorStatus[ChangeDetectorStatus.Detached] = "Detached";
ChangeDetectorStatus[ChangeDetectorStatus.Errored] = "Errored";
ChangeDetectorStatus[ChangeDetectorStatus.Destroyed] = "Destroyed";
/**
 * @param {?} changeDetectionStrategy
 * @return {?}
 */
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return changeDetectionStrategy == null ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUVBLE1BQU0sMkNBQTJDLHVCQUFnRDtJQUUvRixNQUFNLENBQUMsdUJBQXVCLElBQUksSUFBSTtRQUNsQyx1QkFBdUIsS0FBSyx1QkFBdUIsQ0FBQyxPQUFPLENBQUM7Q0FDakUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuLyoqXG4gKiBEZXNjcmliZXMgd2l0aGluIHRoZSBjaGFuZ2UgZGV0ZWN0b3Igd2hpY2ggc3RyYXRlZ3kgd2lsbCBiZSB1c2VkIHRoZSBuZXh0IHRpbWUgY2hhbmdlXG4gKiBkZXRlY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICpcbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICAvKipcbiAgICogYE9uUHVzaGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yJ3MgbW9kZSB3aWxsIGJlIGluaXRpYWxseSBzZXQgdG8gYENoZWNrT25jZWAuXG4gICAqL1xuICBPblB1c2ggPSAwLFxuXG4gIC8qKlxuICAgKiBgRGVmYXVsdGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yJ3MgbW9kZSB3aWxsIGJlIGluaXRpYWxseSBzZXQgdG8gYENoZWNrQWx3YXlzYC5cbiAgICovXG4gIERlZmF1bHQgPSAxLFxufVxuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIHRoZSBkZXRlY3Rvci5cbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0b3JTdGF0dXMge1xuICAvKipcbiAgICogYENoZWNrT25jZWAgbWVhbnMgdGhhdCBhZnRlciBjYWxsaW5nIGRldGVjdENoYW5nZXMgdGhlIG1vZGUgb2YgdGhlIGNoYW5nZSBkZXRlY3RvclxuICAgKiB3aWxsIGJlY29tZSBgQ2hlY2tlZGAuXG4gICAqL1xuICBDaGVja09uY2UsXG5cbiAgLyoqXG4gICAqIGBDaGVja2VkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3Igc2hvdWxkIGJlIHNraXBwZWQgdW50aWwgaXRzIG1vZGUgY2hhbmdlcyB0b1xuICAgKiBgQ2hlY2tPbmNlYC5cbiAgICovXG4gIENoZWNrZWQsXG5cbiAgLyoqXG4gICAqIGBDaGVja0Fsd2F5c2AgbWVhbnMgdGhhdCBhZnRlciBjYWxsaW5nIGRldGVjdENoYW5nZXMgdGhlIG1vZGUgb2YgdGhlIGNoYW5nZSBkZXRlY3RvclxuICAgKiB3aWxsIHJlbWFpbiBgQ2hlY2tBbHdheXNgLlxuICAgKi9cbiAgQ2hlY2tBbHdheXMsXG5cbiAgLyoqXG4gICAqIGBEZXRhY2hlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIHN1YiB0cmVlIGlzIG5vdCBhIHBhcnQgb2YgdGhlIG1haW4gdHJlZSBhbmRcbiAgICogc2hvdWxkIGJlIHNraXBwZWQuXG4gICAqL1xuICBEZXRhY2hlZCxcblxuICAvKipcbiAgICogYEVycm9yZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBlbmNvdW50ZXJlZCBhbiBlcnJvciBjaGVja2luZyBhIGJpbmRpbmdcbiAgICogb3IgY2FsbGluZyBhIGRpcmVjdGl2ZSBsaWZlY3ljbGUgbWV0aG9kIGFuZCBpcyBub3cgaW4gYW4gaW5jb25zaXN0ZW50IHN0YXRlLiBDaGFuZ2VcbiAgICogZGV0ZWN0b3JzIGluIHRoaXMgc3RhdGUgd2lsbCBubyBsb25nZXIgZGV0ZWN0IGNoYW5nZXMuXG4gICAqL1xuICBFcnJvcmVkLFxuXG4gIC8qKlxuICAgKiBgRGVzdHJveWVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgaXMgZGVzdHJveWVkLlxuICAgKi9cbiAgRGVzdHJveWVkLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3koY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KTpcbiAgICBib29sZWFuIHtcbiAgcmV0dXJuIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09IG51bGwgfHxcbiAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0O1xufVxuIl19