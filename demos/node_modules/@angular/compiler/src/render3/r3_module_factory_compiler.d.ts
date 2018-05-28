import { CompileNgModuleMetadata, CompileTypeMetadata } from '../compile_metadata';
import { CompileMetadataResolver } from '../metadata_resolver';
import * as o from '../output/output_ast';
import { OutputContext } from '../util';
/**
 * Write a Renderer2 compatibility module factory to the output context.
 */
export declare function compileModuleFactory(outputCtx: OutputContext, module: CompileNgModuleMetadata, backPatchReferenceOf: (module: CompileTypeMetadata) => o.Expression, resolver: CompileMetadataResolver): void;
