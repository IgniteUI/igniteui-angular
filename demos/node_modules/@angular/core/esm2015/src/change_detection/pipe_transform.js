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
 * To create a Pipe, you must implement this interface.
 *
 * Angular invokes the `transform` method with the value of a binding
 * as the first argument, and any parameters as the second argument in list form.
 *
 * ## Syntax
 *
 * `value | pipeName[:arg0[:arg1...]]`
 *
 * ### Example ([live demo](http://plnkr.co/edit/f5oyIked9M2cKzvZNKHV?p=preview))
 *
 * The `RepeatPipe` below repeats the value as many times as indicated by the first argument:
 *
 * ```
 * import {Pipe, PipeTransform} from '\@angular/core';
 *
 * \@Pipe({name: 'repeat'})
 * export class RepeatPipe implements PipeTransform {
 *   transform(value: any, times: number) {
 *     return value.repeat(times);
 *   }
 * }
 * ```
 *
 * Invoking `{{ 'ok' | repeat:3 }}` in a template produces `okokok`.
 *
 *
 * @record
 */
export function PipeTransform() { }
function PipeTransform_tsickle_Closure_declarations() {
    /** @type {?} */
    PipeTransform.prototype.transform;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV90cmFuc2Zvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9jaGFuZ2VfZGV0ZWN0aW9uL3BpcGVfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogVG8gY3JlYXRlIGEgUGlwZSwgeW91IG11c3QgaW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlLlxuICpcbiAqIEFuZ3VsYXIgaW52b2tlcyB0aGUgYHRyYW5zZm9ybWAgbWV0aG9kIHdpdGggdGhlIHZhbHVlIG9mIGEgYmluZGluZ1xuICogYXMgdGhlIGZpcnN0IGFyZ3VtZW50LCBhbmQgYW55IHBhcmFtZXRlcnMgYXMgdGhlIHNlY29uZCBhcmd1bWVudCBpbiBsaXN0IGZvcm0uXG4gKlxuICogIyMgU3ludGF4XG4gKlxuICogYHZhbHVlIHwgcGlwZU5hbWVbOmFyZzBbOmFyZzEuLi5dXWBcbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZjVveUlrZWQ5TTJjS3p2Wk5LSFY/cD1wcmV2aWV3KSlcbiAqXG4gKiBUaGUgYFJlcGVhdFBpcGVgIGJlbG93IHJlcGVhdHMgdGhlIHZhbHVlIGFzIG1hbnkgdGltZXMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBmaXJzdCBhcmd1bWVudDpcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7UGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKlxuICogQFBpcGUoe25hbWU6ICdyZXBlYXQnfSlcbiAqIGV4cG9ydCBjbGFzcyBSZXBlYXRQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gKiAgIHRyYW5zZm9ybSh2YWx1ZTogYW55LCB0aW1lczogbnVtYmVyKSB7XG4gKiAgICAgcmV0dXJuIHZhbHVlLnJlcGVhdCh0aW1lcyk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEludm9raW5nIGB7eyAnb2snIHwgcmVwZWF0OjMgfX1gIGluIGEgdGVtcGxhdGUgcHJvZHVjZXMgYG9rb2tva2AuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQaXBlVHJhbnNmb3JtIHsgdHJhbnNmb3JtKHZhbHVlOiBhbnksIC4uLmFyZ3M6IGFueVtdKTogYW55OyB9XG4iXX0=