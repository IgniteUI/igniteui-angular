import * as ts from 'typescript';
import * as es5processor from './es5processor';
import { ModulesManifest } from './modules_manifest';
import * as tsickle from './tsickle';
export interface TransformerOptions extends es5processor.Es5ProcessorOptions, tsickle.Options {
    /**
     * Whether to downlevel decorators
     */
    transformDecorators?: boolean;
    /**
     * Whether to convers types to closure
     */
    transformTypesToClosure?: boolean;
}
export interface TransformerHost extends es5processor.Es5ProcessorHost, tsickle.AnnotatorHost {
    /**
     * If true, tsickle and decorator downlevel processing will be skipped for
     * that file.
     */
    shouldSkipTsickleProcessing(fileName: string): boolean;
    /**
     * Tsickle treats warnings as errors, if true, ignore warnings.  This might be
     * useful for e.g. third party code.
     */
    shouldIgnoreWarningsForPath(filePath: string): boolean;
}
export declare function mergeEmitResults(emitResults: EmitResult[]): EmitResult;
export interface EmitResult extends ts.EmitResult {
    modulesManifest: ModulesManifest;
    /** externs.js files produced by tsickle, if any. */
    externs: {
        [fileName: string]: string;
    };
}
export interface EmitTransformers {
    beforeTsickle?: Array<ts.TransformerFactory<ts.SourceFile>>;
    beforeTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
    afterTs?: Array<ts.TransformerFactory<ts.SourceFile>>;
}
export declare function emitWithTsickle(program: ts.Program, host: TransformerHost, options: TransformerOptions, tsHost: ts.CompilerHost, tsOptions: ts.CompilerOptions, targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: EmitTransformers): EmitResult;
