import * as ts from 'typescript';

import type { ComponentMetadata } from './types';
import { AnalyzerComponent } from './component';
import { AnalyzerPrinter } from './printer';
import { getDecoratorName, getDecorators, isClass, filterRelevantQueries, isChildOfConfigComponent, readTSConfig } from './utils';


export class Analyzer {

    #checker: ts.TypeChecker;
    #program: ts.Program;
    #printer = new AnalyzerPrinter();

    #configMap = new Map<string, AnalyzerComponent>();
    #resolvedMap!: Map<ts.InterfaceType, ComponentMetadata>;


    get sourceFiles() {
        return this.#program.getSourceFiles()
            .filter(file => !file.isDeclarationFile);
    }

    #getComponents(source: ts.NodeArray<ts.Node>) {
        const isComponent = (dec: ts.Decorator) => getDecoratorName(dec) === 'Component';
        return source
            .filter(isClass)
            .filter(x => getDecorators(x as any)!.some(isComponent));
    }

    constructor(fileNames: readonly string[], options: ts.CompilerOptions) {
        this.#program = ts.createProgram(fileNames, options);
        this.#checker = this.#program.getTypeChecker();
    }

    static fromDefaultTSConfig(compilerOptions?: ts.CompilerOptions) {
        const { fileNames, options } = readTSConfig();
        return new Analyzer(fileNames, { ...options, ...compilerOptions });
    }


    getComponents(source: ts.SourceFile) {
        return this.#getComponents(source.statements)
            .map(comp => new AnalyzerComponent(comp, this.#checker));
    }

    #resolve() {
        const out = new Map<ts.InterfaceType, ComponentMetadata>();
        const configs = this.#printer.baseExports;

        for (const [name, entry] of this.#configMap) {
            const meta = entry.metadata;

            if (configs.some(({ symbol }) => symbol.escapedName === name)) {
                out.set(entry.type, {
                    ...meta,
                    contentQueries: filterRelevantQueries(meta.contentQueries, name, this.#configMap),
                    parents: meta.parents.map(p => this.#configMap.get(p)!.type)
                });
            }

            if (meta?.parents.length && !out.has(entry.type) && isChildOfConfigComponent(meta.parents, configs, this.#configMap)) {
                out.set(entry.type, {
                    ...meta,
                    contentQueries: filterRelevantQueries(meta.contentQueries, name, this.#configMap),
                    parents: meta.parents.filter(p => isChildOfConfigComponent([p], configs, this.#configMap))
                        .map(p => this.#configMap.get(p)!.type)
                });
            }
        }

        return out;
    }

    analyze() {
        this.sourceFiles.flatMap(file => this.getComponents(file))
            .forEach(comp => this.#configMap.set(comp.name, comp));

        this.#resolvedMap = this.#resolve();
        this.#printer.run(this.#resolvedMap);
    }

}


Analyzer.fromDefaultTSConfig({
    declaration: true,
    emitDeclarationOnly: true,
    skipLibCheck: true
})
    .analyze();






