/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilePipeMetadata } from '../compile_metadata';
import { CompileReflector } from '../compile_reflector';
import { OutputContext } from '../util';
import { OutputMode } from './r3_types';
/**
 * Write a pipe definition to the output context.
 */
export declare function compilePipe(outputCtx: OutputContext, pipe: CompilePipeMetadata, reflector: CompileReflector, mode: OutputMode): void;
