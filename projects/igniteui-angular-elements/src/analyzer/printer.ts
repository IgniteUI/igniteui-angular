import * as ts from 'typescript';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { format } from 'prettier';
import type { ComponentMetadata, ContentQuery, PropertyInfo } from './types';
import { importContainsType } from './utils';


export class AnalyzerPrinter {

    private program: ts.Program;
    private checker: ts.TypeChecker;
    private printer: ts.Printer;
    private configPath: string;
    private configFile: ts.SourceFile;

    // TODO: Change to the default output path
    public out = 'elements.config.ts';

    constructor(public config = 'projects/igniteui-angular-elements/src/analyzer/config.template.ts') {
        this.configPath = path.join(process.cwd(), config);
        this.program = ts.createProgram([this.configPath], {});
        this.checker = this.program.getTypeChecker();
        this.configFile = this.program.getSourceFile(this.configPath)!;
        this.printer = ts.createPrinter();
    }

    public get baseExports() {
        const exports = this.checker.getExportsOfModule(this.checker.getSymbolAtLocation(this.configFile)!)
            .find(s => s.escapedName === 'registerComponents')?.valueDeclaration as ts.VariableDeclaration;
        return (exports.initializer as ts.ArrayLiteralExpression).elements.map(e => this.checker.getTypeAtLocation(e));
    }

    private importPathToType(type: ts.Type) {
        let importPath = type.symbol.valueDeclaration?.getSourceFile().fileName!;
        importPath = path.relative(path.dirname(this.configPath), importPath);
        importPath = importPath.replace(path.extname(importPath), '');
        // return relative as posix path
        return path.posix.join(...importPath.split(path.win32.sep))
    }

    private createContentQueryLiteral(query: ContentQuery) {
        const properties = [
            ts.factory.createPropertyAssignment('property', ts.factory.createStringLiteral(query.property)),
            ts.factory.createPropertyAssignment('childType', ts.factory.createIdentifier(query.childType.symbol.name))
        ];

        if (query.isQueryList) {
            properties.push(ts.factory.createPropertyAssignment('isQueryList', ts.factory.createToken(ts.SyntaxKind.TrueKeyword)));
        }

        if (query.descendants) {
            properties.push(ts.factory.createPropertyAssignment('descendants', ts.factory.createToken(ts.SyntaxKind.TrueKeyword)));
        }

        return ts.factory.createObjectLiteralExpression(properties);
    }

    private createPropertyLiteral(prop: PropertyInfo) {
        const properties = [
            ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(prop.name)),
        ];

        if (prop.writable) {
            properties.push(ts.factory.createPropertyAssignment('writable', ts.factory.createToken(ts.SyntaxKind.TrueKeyword)));
        }

        return ts.factory.createObjectLiteralExpression(properties);
    }

    private createMetaLiteralObject([type, meta]: readonly [ts.InterfaceType, ComponentMetadata]) {
        const properties = [
            ts.factory.createPropertyAssignment('component', ts.factory.createIdentifier(type.symbol.name)),
            ts.factory.createPropertyAssignment('selector', ts.factory.createStringLiteral(meta.selector)),
            ts.factory.createPropertyAssignment('parents', ts.factory.createArrayLiteralExpression(meta.parents.map(x => ts.factory.createIdentifier(x.symbol.name)))),
            ts.factory.createPropertyAssignment('contentQueries', ts.factory.createArrayLiteralExpression(meta.contentQueries.map(x => this.createContentQueryLiteral(x)))),
            ts.factory.createPropertyAssignment('additionalProperties', ts.factory.createArrayLiteralExpression(meta.additionalProperties.map(x => this.createPropertyLiteral(x)))),
            ts.factory.createPropertyAssignment('methods', ts.factory.createArrayLiteralExpression(meta.methods.map(x => ts.factory.createStringLiteral(x.name))))
        ];
        if (meta.templateProperties?.length) {
            properties.push(ts.factory.createPropertyAssignment('templateProps', ts.factory.createArrayLiteralExpression(meta.templateProperties.map(x => ts.factory.createStringLiteral(x)))));
        }
        if (meta.numericProperties?.length) {
            properties.push(ts.factory.createPropertyAssignment('numericProps', ts.factory.createArrayLiteralExpression(meta.numericProperties.map(x => ts.factory.createStringLiteral(x)))));
        }
        if (meta.booleanProperties?.length) {
            properties.push(ts.factory.createPropertyAssignment('boolProps', ts.factory.createArrayLiteralExpression(meta.booleanProperties.map(x => ts.factory.createStringLiteral(x)))));
        }
        if (meta.provideAs) {
            properties.push(ts.factory.createPropertyAssignment('provideAs', ts.factory.createIdentifier(meta.provideAs.symbol.name)));
        }

        return ts.factory.createObjectLiteralExpression(properties);
    }

    public async run(config: Map<ts.InterfaceType, ComponentMetadata>) {
        const outFile = path.join(path.dirname(this.configPath), this.out);
        const placeholder = ts.createSourceFile(outFile, '', ts.ScriptTarget.Latest);

        const imports = this.configFile.statements.filter(ts.isImportDeclaration);
        const lastImportIndex = imports.at(-1)!.getEnd();



        const types = Array.from(config.entries())
            .flatMap(([key, value]) => [key, value.provideAs]).filter(Boolean);


        for (const type of types) {
            if (!imports.some(i => importContainsType(i, type!))) {
                const namedImport = ts.factory.createNamedImports(
                    [ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(type!.symbol.name))]
                );
                const importDeclaration = ts.factory.createImportDeclaration(
                    undefined,
                    ts.factory.createImportClause(false, undefined, namedImport),
                    ts.factory.createStringLiteral(this.importPathToType(type!))
                );
                imports.push(importDeclaration);
            }
        }

        const configSorted = Array.from(config).sort((a, b) => a[0].symbol.name.localeCompare(b[0].symbol.name));
        const configExport = ts.factory.createVariableStatement(
            ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
            ts.factory.createVariableDeclarationList([
                ts.factory.createVariableDeclaration(
                    'registerConfig',
                    undefined,
                    undefined,
                    ts.factory.createArrayLiteralExpression(
                        configSorted.map(x => this.createMetaLiteralObject(x)),
                        true
                    )
                )
            ])
        );

        const data = [
            ...imports.map(i => this.printer.printNode(ts.EmitHint.Unspecified, i, this.configFile)),
            fs.readFileSync(this.configPath, { encoding: 'utf8' }).substring(lastImportIndex),
            `//// WARNING: Code below this line is auto-generated and any modifications will be overwritten`,
            this.printer.printNode(ts.EmitHint.Unspecified, configExport, placeholder)
        ].join('\n');


        const content = await format(data, { parser: 'babel-ts' });
        fs.writeFileSync(outFile, content, { encoding: 'utf8' });
    }
}
