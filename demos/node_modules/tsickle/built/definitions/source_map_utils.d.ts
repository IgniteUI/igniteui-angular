/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BasicSourceMapConsumer, RawSourceMap, SourceMapConsumer, SourceMapGenerator } from 'source-map';
import * as ts from 'typescript';
export declare function containsInlineSourceMap(source: string): boolean;
export declare function getInlineSourceMapCount(source: string): number;
export declare function extractInlineSourceMap(source: string): string;
export declare function removeInlineSourceMap(source: string): string;
/**
 * Sets the source map inline in the file.  If there's an existing inline source
 * map, it clobbers it.
 */
export declare function setInlineSourceMap(source: string, sourceMap: string): string;
export declare function parseSourceMap(text: string, fileName?: string, sourceName?: string): RawSourceMap;
export declare function sourceMapConsumerToGenerator(sourceMapConsumer: SourceMapConsumer): SourceMapGenerator;
/**
 * Tsc identifies source files by their relative path to the output file.  Since
 * there's no easy way to identify these relative paths when tsickle generates its
 * own source maps, we patch them with the file name from the tsc source maps
 * before composing them.
 */
export declare function sourceMapGeneratorToConsumer(sourceMapGenerator: SourceMapGenerator, fileName?: string, sourceName?: string): SourceMapConsumer;
export declare function sourceMapTextToConsumer(sourceMapText: string): BasicSourceMapConsumer;
export declare function sourceMapTextToGenerator(sourceMapText: string): SourceMapGenerator;
export interface SourcePosition {
    column: number;
    line: number;
    position: number;
}
export interface SourceMapper {
    addMapping(originalNode: ts.Node, original: SourcePosition, generated: SourcePosition, length: number): void;
}
export declare const NOOP_SOURCE_MAPPER: SourceMapper;
export declare class DefaultSourceMapper implements SourceMapper {
    private fileName;
    /** The source map that's generated while rewriting this file. */
    sourceMap: SourceMapGenerator;
    constructor(fileName: string);
    addMapping(node: ts.Node, original: SourcePosition, generated: SourcePosition, length: number): void;
}
