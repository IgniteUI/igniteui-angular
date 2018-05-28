/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PipeTransform } from '@angular/core';
/**
 * Transforms text to lowercase.
 *
 * {@example  common/pipes/ts/lowerupper_pipe.ts region='LowerUpperPipe' }
 *
 *
 */
export declare class LowerCasePipe implements PipeTransform {
    transform(value: string): string;
}
/**
 * Transforms text to titlecase.
 *
 * The pipe splits up a text into words, capitalizes the first letter of each word and transforms
 * the rest of the word into lowercase. In this case, whitespace characters (such as "space", "\t",
 * "\n", etc) are used as word separators.
 *
 * ## Example
 * {@example common/pipes/ts/titlecase_pipe.ts region='TitleCasePipe'}
 *
 *
 */
export declare class TitleCasePipe implements PipeTransform {
    transform(value: string): string;
}
/**
 * Transforms text to uppercase.
 *
 *
 */
export declare class UpperCasePipe implements PipeTransform {
    transform(value: string): string;
}
