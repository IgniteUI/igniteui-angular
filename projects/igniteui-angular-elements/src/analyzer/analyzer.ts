import * as ts from 'typescript';

import type { ComponentMetadata } from './types';
import { AnalyzerComponent } from './component';
import { AnalyzerPrinter } from './printer';
import { getDecoratorName, getDecorators, filterRelevantQueries, isChildOfConfigComponent, readTSConfig } from './utils';


export class Analyzer {

    private checker: ts.TypeChecker;
    private program: ts.Program;
    private printer = new AnalyzerPrinter();

    private configMap = new Map<string, AnalyzerComponent>();
    private resolvedMap!: Map<ts.InterfaceType, ComponentMetadata>;


    private get sourceFiles() {
        return this.program.getSourceFiles()
            .filter(file => !file.isDeclarationFile);
    }

    private getComponents(source: ts.NodeArray<ts.Node>) {
        const isComponent = (dec: ts.Decorator) => getDecoratorName(dec) === 'Component';
        return source
            .filter(ts.isClassDeclaration)
            .filter(x => getDecorators(x)!.some(isComponent))
            .map(comp => new AnalyzerComponent(comp, this.checker));
    }

    constructor(fileNames: readonly string[], options: ts.CompilerOptions) {
        this.program = ts.createProgram(fileNames, options);
        this.checker = this.program.getTypeChecker();
    }

    public static fromDefaultTSConfig(compilerOptions?: ts.CompilerOptions) {
        const { fileNames, options } = readTSConfig();
        return new Analyzer(fileNames, { ...options, ...compilerOptions });
    }

    private resolve() {
        const out = new Map<ts.InterfaceType, ComponentMetadata>();
        const configs = this.printer.baseExports;

        for (const [name, entry] of this.configMap) {
            const meta = entry.metadata;

            if (configs.some(({ symbol }) => symbol.escapedName === name)) {
                out.set(entry.type, {
                    ...meta,
                    contentQueries: filterRelevantQueries(meta.contentQueries, name, this.configMap),
                    parents: meta.parents.map(p => this.configMap.get(p)!.type)
                });
            }

            if (meta?.parents.length && !out.has(entry.type) && isChildOfConfigComponent(meta.parents, configs, this.configMap)) {
                out.set(entry.type, {
                    ...meta,
                    contentQueries: filterRelevantQueries(meta.contentQueries, name, this.configMap),
                    parents: meta.parents.filter(p => isChildOfConfigComponent([p], configs, this.configMap))
                        .map(p => this.configMap.get(p)!.type)
                });
            }
        }

        return out;
    }

    public async analyze() {
        this.sourceFiles.flatMap(file => this.getComponents(file.statements))
            .forEach(comp => this.configMap.set(comp.name, comp));

        this.resolvedMap = this.resolve();
        await this.printer.run(this.resolvedMap);
    }

}


Analyzer.fromDefaultTSConfig({
    declaration: true,
    emitDeclarationOnly: true,
    skipLibCheck: true
})
    .analyze();






