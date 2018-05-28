import { MissingTranslationStrategy, ViewEncapsulation } from './core';
export declare class CompilerConfig {
    defaultEncapsulation: ViewEncapsulation | null;
    useJit: boolean;
    jitDevMode: boolean;
    missingTranslation: MissingTranslationStrategy | null;
    preserveWhitespaces: boolean;
    strictInjectionParameters: boolean;
    constructor({defaultEncapsulation, useJit, jitDevMode, missingTranslation, preserveWhitespaces, strictInjectionParameters}?: {
        defaultEncapsulation?: ViewEncapsulation;
        useJit?: boolean;
        jitDevMode?: boolean;
        missingTranslation?: MissingTranslationStrategy;
        preserveWhitespaces?: boolean;
        strictInjectionParameters?: boolean;
    });
}
export declare function preserveWhitespacesDefault(preserveWhitespacesOption: boolean | null, defaultSetting?: boolean): boolean;
