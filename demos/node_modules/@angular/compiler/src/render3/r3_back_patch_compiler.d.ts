/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { StaticReflector } from '../aot/static_reflector';
import { CompileDirectiveMetadata, CompileIdentifierMetadata, CompileNgModuleMetadata, CompilePipeSummary, CompileTypeMetadata } from '../compile_metadata';
import { CompileMetadataResolver } from '../metadata_resolver';
import * as o from '../output/output_ast';
import { TemplateAst } from '../template_parser/template_ast';
import { OutputContext } from '../util';
export declare const enum ModuleKind {
    Renderer2 = 0,
    Renderer3 = 1,
}
/**
 * Produce the back-patching function for the given module to the output context.
 */
export declare function compileModuleBackPatch(outputCtx: OutputContext, name: string, module: CompileNgModuleMetadata, kind: ModuleKind, backPatchReferenceOf: (module: CompileTypeMetadata) => o.Expression, parseTemplate: (compMeta: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata, directiveIdentifiers: CompileIdentifierMetadata[]) => {
    template: TemplateAst[];
    pipes: CompilePipeSummary[];
}, reflector: StaticReflector, resolver: CompileMetadataResolver): void;
