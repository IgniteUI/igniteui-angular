/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { SourceMapper } from './source_map_utils';
/**
 * @fileoverview Creates a TypeScript transformer that parses code into a new `ts.SourceFile`,
 * marks the nodes as synthetic and where possible maps the new nodes back to the original nodes
 * via sourcemap information.
 */
export declare function createTransformerFromSourceMap(operator: (sourceFile: ts.SourceFile, sourceMapper: SourceMapper) => string): ts.TransformerFactory<ts.SourceFile>;
