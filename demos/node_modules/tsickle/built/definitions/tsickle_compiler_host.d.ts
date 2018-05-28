import * as ts from 'typescript';
import { Es5ProcessorHost, Es5ProcessorOptions } from './es5processor';
import { ModulesManifest } from './modules_manifest';
import * as tsickle from './tsickle';
/**
 * Tsickle can perform 2 different precompilation transforms - decorator downleveling
 * and closurization.  Both require tsc to have already type checked their
 * input, so they can't both be run in one call to tsc. If you only want one of
 * the transforms, you can specify it in the constructor, if you want both, you'll
 * have to specify it by calling reconfigureForRun() with the appropriate Pass.
 */
export declare enum Pass {
    NONE = 0,
    /**
     * Note that we can do decorator downlevel and closurize in one pass,
     * so this should not be used anymore.
     */
    DECORATOR_DOWNLEVEL = 1,
    /**
     * Note that we can do decorator downlevel and closurize in one pass,
     * so this should not be used anymore.
     */
    CLOSURIZE = 2,
    DECORATOR_DOWNLEVEL_AND_CLOSURIZE = 3,
}
export interface Options extends Es5ProcessorOptions, tsickle.AnnotatorOptions {
    logWarning?: TsickleHost['logWarning'];
}
/**
 *  Provides hooks to customize TsickleCompilerHost's behavior for different
 *  compilation environments.
 */
export interface TsickleHost extends Es5ProcessorHost, tsickle.AnnotatorHost {
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
/**
 * TsickleCompilerHost does tsickle processing of input files, including
 * closure type annotation processing, decorator downleveling and
 * require -> googmodule rewriting.
 */
export declare class TsickleCompilerHost implements ts.CompilerHost {
    private delegate;
    private tscOptions;
    private options;
    private environment;
    modulesManifest: ModulesManifest;
    /** Error messages produced by tsickle, if any. */
    diagnostics: ts.Diagnostic[];
    /** externs.js files produced by tsickle, if any. */
    externs: {
        [fileName: string]: string;
    };
    private sourceFileToPreexistingSourceMap;
    private preexistingSourceMaps;
    private decoratorDownlevelSourceMaps;
    private tsickleSourceMaps;
    private runConfiguration;
    constructor(delegate: ts.CompilerHost, tscOptions: ts.CompilerOptions, options: Options, environment: TsickleHost);
    /**
     * Tsickle can perform 2 kinds of precompilation source transforms - decorator
     * downleveling and closurization.  They can't be run in the same run of the
     * typescript compiler, because they both depend on type information that comes
     * from running the compiler.  We need to use the same compiler host to run both
     * so we have all the source map data when finally write out.  Thus if we want
     * to run both transforms, we call reconfigureForRun() between the calls to
     * ts.createProgram().
     */
    reconfigureForRun(oldProgram: ts.Program, pass: Pass): void;
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile;
    writeFile(fileName: string, content: string, writeByteOrderMark: boolean, onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]): void;
    getSourceMapKeyForPathAndName(outputFilePath: string, sourceFileName: string): string;
    getSourceMapKeyForSourceFile(sourceFile: ts.SourceFile): string;
    stripAndStoreExistingSourceMap(sourceFile: ts.SourceFile): ts.SourceFile;
    combineSourceMaps(filePath: string, tscSourceMapText: string): string;
    combineInlineSourceMaps(filePath: string, compiledJsWithInlineSourceMap: string): string;
    convertCommonJsToGoogModule(fileName: string, content: string): string;
    private downlevelDecorators(sourceFile, program, fileName, languageVersion);
    private closurize(sourceFile, program, fileName, languageVersion, downlevelDecorators);
    /** Concatenate all generated externs definitions together into a string. */
    getGeneratedExterns(): string;
    fileExists(fileName: string): boolean;
    getCurrentDirectory(): string;
    useCaseSensitiveFileNames(): boolean;
    getNewLine(): string;
    getDirectories(path: string): string[];
    readFile(fileName: string): string;
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    getCanonicalFileName(fileName: string): string;
    getCancellationToken: (() => ts.CancellationToken) | undefined;
    getDefaultLibLocation: (() => string) | undefined;
    resolveModuleNames: ((moduleNames: string[], containingFile: string) => ts.ResolvedModule[]) | undefined;
    resolveTypeReferenceDirectives: ((typeReferenceDirectiveNames: string[], containingFile: string) => ts.ResolvedTypeReferenceDirective[]) | undefined;
    getEnvironmentVariable: ((name: string) => string) | undefined;
    trace: ((s: string) => void) | undefined;
    directoryExists: ((directoryName: string) => boolean) | undefined;
    realpath: ((path: string) => string) | undefined;
}
