/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
/**
 * Adjusts the given CustomTransformers with additional transformers
 * to fix bugs in TypeScript.
 */
export declare function createCustomTransformers(given: ts.CustomTransformers): ts.CustomTransformers;
/**
 * Convert comment text ranges before and after a node
 * into ts.SynthesizedComments for the node and prevent the
 * comment text ranges to be emitted, to allow
 * changing these comments.
 *
 * This function takes a visitor to be able to do some
 * state management after the caller is done changing a node.
 */
export declare function visitNodeWithSynthesizedComments<T extends ts.Node>(context: ts.TransformationContext, sourceFile: ts.SourceFile, node: T, visitor: (node: T) => T): T;
/**
 * This is a version of `ts.updateSourceFileNode` that works
 * well with property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 *
 * @param sf
 * @param statements
 */
export declare function updateSourceFileNode(sf: ts.SourceFile, statements: ts.NodeArray<ts.Statement>): ts.SourceFile;
/**
 * This is a version of `ts.visitEachChild` that does not visit children of types,
 * as this leads to errors in TypeScript < 2.4.0 and as types are not emitted anyways.
 */
export declare function visitEachChildIgnoringTypes<T extends ts.Node>(node: T, visitor: ts.Visitor, context: ts.TransformationContext): T;
export declare function isTypeNodeKind(kind: ts.SyntaxKind): boolean;
