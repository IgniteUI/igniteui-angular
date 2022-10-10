import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { glob } from "glob";
// import elementsConfig from './elements.config';


const ROOT = process.cwd().replace(/\\/g, '/');
const IGNITEUI_ANGULAR_PROJ = 'projects/igniteui-angular/src/lib/';
const ELEMENTS_CONFIG = path.posix.join(ROOT, 'projects/igniteui-angular-elements/src/analyzer/elements.config.ts');
const GENERATED_COMMENT = '// WARNING: Code below this line is auto-generated and any modifications will be overwritten';

cleanExistingConfig();

// TODO: Merge with project source program? Load tsConfig so path mappings work?
const configProg = ts.createProgram([ELEMENTS_CONFIG], {});
const config = configProg.getSourceFile(ELEMENTS_CONFIG);
const configChecker = configProg.getTypeChecker();
const defExport = configChecker.getExportsOfModule(configChecker.getSymbolAtLocation(config)).find(x => x.escapedName === 'registerComponents').valueDeclaration as ts.VariableDeclaration;
// const toRegister = (defExport.expression as ts.ObjectLiteralExpression).properties
//                     .find(x => x.name?.getText() === "registerComponents") as ts.PropertyAssignment;
// resolved types here are different (and less complete from program below)
// can match like type.symbol.valueDeclaration.getSourceFile().path === components[0].symbol.valueDeclaration.getSourceFile().path
// might be simpler to go with simple json + string config.. or a wrap-around method to read from
const configComponents = (defExport.initializer as ts.ArrayLiteralExpression).elements.map(x => configChecker.getTypeAtLocation(x));

// const defExport2 = configChecker.getExportsOfModule(configChecker.getSymbolAtLocation(defExport));

const ComponentConfigMap = new Map<ts.InterfaceType, ComponentMetadata>();

let componentList = new Map<string, ComponentMetadata<string> & { type: ts.InterfaceType}>();

// TODO: Create program from entry point? Will populate files automatically?
glob(path.posix.join(ROOT, IGNITEUI_ANGULAR_PROJ, '**/*.ts'), { ignore: '**/*.spec.ts' }, (err, files) => {
    // rough pass at source to gather info on all components
    const program = ts.createProgram(files, { declaration: true, emitDeclarationOnly: true }); // todo feed config?
    const typeChecker = program.getTypeChecker();

    for (const file of files) {
        const source = program.getSourceFile(file);

        const componentDeclarations = source.statements
            .filter((m): m is ts.ClassDeclaration => m.kind === ts.SyntaxKind.ClassDeclaration)
            .filter(x => x.decorators?.some(x => getDecoratorName(x) === 'Component'));

        for (const component of componentDeclarations) {
            const type = typeChecker.getTypeAtLocation(component);
            if (!type.isClass()) {
                // mostly for type narrowing, should be always be class with the Component decorator
                continue;
            }
            const baseTypes = type.getBaseTypes();

            const componentMetadata: ComponentMetadata<string> = { parents: [], contentQueries: [], methods: [] };

            // if (components.find(x => x.symbol.escapedName === type.symbol.escapedName)) {
            //     // pre-populate
            //     ComponentConfigMap.set(type, componentMetadata)
            // }
            const parents = type.symbol.getJsDocTags().find(x => x.name === 'igxParent')?.text?.find(x => x.kind === 'text').text.split(/\s*,\s*/);
            if (parents) {
                // skip * for components that can be standalone:
                componentMetadata.parents = parents.filter(x => x !== '*');
            }

            // content queries:
            const queryProps = type.getProperties().filter(x => x.declarations[0].decorators?.some(x => getDecoratorName(x).includes('ContentChild')));
            if (queryProps.length) {
                console.log(type.symbol.escapedName, ':');
            }
            for (const prop of queryProps) {
                const decorator = prop.valueDeclaration?.decorators.find(x => getDecoratorName(x).includes('ContentChild')) // TODO: valueDeclaration vs declarations
                const expression = decorator.expression as ts.CallExpression;
                const firstArg = expression.arguments && expression.arguments[0];
                let queryType: ts.Identifier | null;
                let descendants = false;
                if (firstArg && ts.isIdentifier(firstArg)) {
                    queryType = firstArg;
                }

                if (expression.arguments.length === 2 && expression.arguments[1].kind === ts.SyntaxKind.ObjectLiteralExpression) {
                    const ojectLiteral = expression.arguments[1] as ts.ObjectLiteralExpression;
                    const readProp = ojectLiteral.properties.find(x => x.name?.getText() === 'read') as ts.PropertyAssignment;

                    // queryType = readProp.initializer.getText();
                    if (readProp && typeChecker.getTypeAtLocation(queryType) !== typeChecker.getTypeAtLocation(readProp.initializer)) {
                        // reading something else, i.e. not straight up component child query. ignore
                        queryType = null;
                    }

                    // descendants:
                    const descendantsProp = ojectLiteral.properties.find(x => x.name?.getText() === 'descendants') as ts.PropertyAssignment;
                    descendants = descendantsProp?.initializer.kind === ts.SyntaxKind.TrueKeyword;
                }
                if (queryType) {
                    console.log(prop.escapedName, getDecoratorName(decorator), `(${queryType.getText()})`);
                    componentMetadata.contentQueries.push({
                        property: prop.escapedName.toString(),
                        childType: typeChecker.getTypeAtLocation(queryType) as ts.InterfaceType, // TODO
                        isQueryList: getDecoratorName(decorator) === 'ContentChildren',
                        descendants
                    })
                }
            }

            // template props:
            const templateProps = type.getProperties()
                .filter(x => isProperty(x))
                .filter(x => isPublic(x))
                .filter(x => {
                    const type = typeChecker.getTypeAtLocation(x.valueDeclaration);
                    if(type.getFlags() & ts.TypeFlags.Object && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) {
                        const target = (type as ts.TypeReference).target;
                        // TODO: check it's declared in @angular/core?
                        return target.symbol.escapedName === 'TemplateRef';
                    }
                    return false;
                })
                .filter(x => x.declarations[0].decorators?.some(x => getDecoratorName(x).includes('Input')));

            if (templateProps.length) {
                componentMetadata.templateProps = templateProps.map(x => x.escapedName.toString());
            }

            componentList.set(type.symbol.escapedName.toString(), { type, ...componentMetadata });
        }
    }

    // componentList = new Map(componentList.entries().filter(x => x));

    // Filter component list into the config map:
    for (let [ name, { type, parents, contentQueries, templateProps } ] of componentList) {

        if (configComponents.find(x => x.symbol.escapedName === type.symbol.escapedName)) {
            ComponentConfigMap.set(type, {
                contentQueries: filterRelevantQueries(contentQueries, name),
                parents: parents.map(x => componentList.get(x).type), // these should always be empty, but just in case?
                methods: getPublicMethods(type.getProperties()),
                templateProps
            });
        }

        if (parents && !ComponentConfigMap.has(type) && isChildOfConfigComponent(parents)) {
            // child or grandchild and so on
            ComponentConfigMap.set(type, {
                contentQueries: filterRelevantQueries(contentQueries, name),
                // filter out parents that don't lead to config components:
                parents: parents.filter(x => isChildOfConfigComponent([x])).map(x => componentList.get(x).type),
                methods: getPublicMethods(type.getProperties()),
                templateProps
            });
        }
    }

    console.log('----FINAL:-----');
    console.log(ComponentConfigMap);
    printConfiguration();



    //#region declaration output test

    let sourceFile = program.getSourceFiles().find(x => x.fileName.endsWith('grid.component.ts'));

    // TODO: possibly filter by owning class if replicating inheritance structure in declarations
    const gridProps = typeChecker.getTypeAtLocation(sourceFile.statements[sourceFile.statements.length-1]).getProperties();
    const gridInputs = gridProps.filter(x => x.declarations[0].decorators?.some(x => getDecoratorName(x).includes('Input')));
    const gridOutputs = gridProps.filter(x => x.declarations[0].decorators?.some(x => getDecoratorName(x).includes('Output')))

    function filterProperties(sourceFile: ts.SourceFile | ts.Bundle) {
        if (ts.isSourceFile(sourceFile)) {
            let classDecl = sourceFile.statements
                .filter((m): m is ts.ClassDeclaration => m.kind === ts.SyntaxKind.ClassDeclaration)
                 // TODO: NO DECORATORS HERE, declarations transform drops them :(
                // .filter(x => x.decorators?.some(x => getDecoratorName(x) === 'Component'))
                [0];

            // TODO: Strip @example tags due to Angular code?
            // Type Checker also doesn't work on AST after it's been transformed apparently:
            // const members = classDecl.members.filter(x => gridInputs.includes(typeChecker.getSymbolAtLocation(x)));
            const members = classDecl.members.filter(x => gridInputs.some(input => input.escapedName === x.name.getText()));

            classDecl = ts.factory.updateClassDeclaration(classDecl, classDecl.decorators, classDecl.modifiers, classDecl.name, classDecl.typeParameters, classDecl.heritageClauses, members /*members*/);
            return ts.factory.updateSourceFile(sourceFile, [...sourceFile.statements.slice(0,sourceFile.statements.length-2), classDecl]);
        }
        return sourceFile;
    }

    const test = program.emit(sourceFile,
        (fileName: string, text: string) => {
            // insert EventMap here before writing to file:
            // gridOutputs.map(x => ...)
            console.log(fileName, text);
        },
        null,
        true,
        {
            afterDeclarations: [context => sourceFile => filterProperties(sourceFile)]
        }
    );

    //#endregion declaration output test
});

/**
 * Checks if the parent trace leads to a configured root component
 * @param parents list of parent names for the component
 */
function isChildOfConfigComponent(parents: string[]): boolean {
    const result = false;
    for (const parent of parents) {
        if (configComponents.find(x => x.symbol.escapedName === parent)) {
            return true;
        }
        const metadata = componentList.get(parent);
        if (metadata?.parents && isChildOfConfigComponent(metadata.parents)) {
            return true;
        }
    }
    return false;
}

/**
 * Filters content queries to only those that target components in the list that also mention this component as parent
 * This excludes mostly internal queries for other directives
 * @param contentQueries content queries to filter
 * @param name the name of the component in the component list
 * @returns the filtered query
 */
function filterRelevantQueries(contentQueries: ContentQuery[], name: string): ContentQuery[] {
    return contentQueries.filter(x => componentList.get(x.childType.symbol.escapedName.toString())?.parents.includes(name));
}

//#region config file

/** removes content after the auto-generated comment */
function cleanExistingConfig() {
     // TODO: try read trivia (last statement's leading trivia?) and delete after, etc
    let configContents = fs.readFileSync(ELEMENTS_CONFIG).toString();
    configContents = configContents.split(GENERATED_COMMENT)[0];
    configContents += `\n${GENERATED_COMMENT}\n`;
    fs.writeFileSync(ELEMENTS_CONFIG, configContents);
}

function printConfiguration() {
    const imports = config.statements.filter(ts.isImportDeclaration); // config.imports?
    const lastImportIndex = config.statements.indexOf(imports[imports.length -1]); // TODO: .at(-1), update lib
    let source = config;

    for (const [type, meta] of ComponentConfigMap) {
        // TODO: edit existing imports maybe, lazy approach:
        if (!imports.some(x => importContainsType(x, type))) {
            const namedImport = ts.factory.createNamedImports(
                [ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(type.symbol.name))]
            );
            const importDeclaration =  ts.factory.createImportDeclaration(
                undefined,
                undefined,
                ts.factory.createImportClause(false, undefined, namedImport),
                ts.factory.createStringLiteral(getImportPathToType(type))
            );
            imports.push(importDeclaration);
        }
    }

    const configExport = ts.factory.createVariableStatement(
        ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
        ts.factory.createVariableDeclarationList([
            ts.factory.createVariableDeclaration(
                'registerConfig',
                undefined,
                undefined,
                ts.factory.createArrayLiteralExpression(
                    Array.from(ComponentConfigMap).map(x => createMetaLiteralObject(x)),
                    true
                )
            )
    ]));

    // TODO: text formatting
    source = ts.factory.updateSourceFile(source, [
        ...imports,
        ...source.statements.slice(lastImportIndex + 1),
        configExport
    ]);
    ts.addSyntheticLeadingComment(configExport, ts.SyntaxKind.SingleLineCommentTrivia, GENERATED_COMMENT);
    fs.writeFileSync(ELEMENTS_CONFIG, ts.createPrinter().printFile(source));
}

function createMetaLiteralObject(value: [ts.InterfaceType, ComponentMetadata<ts.InterfaceType>]) {
    const [type, meta] = value;
    const properties = [
        ts.factory.createPropertyAssignment('component', ts.factory.createIdentifier(type.symbol.name)),
        ts.factory.createPropertyAssignment('parents', ts.factory.createArrayLiteralExpression(meta.parents.map(x => ts.factory.createIdentifier(x.symbol.name)))),
        ts.factory.createPropertyAssignment('contentQueries', ts.factory.createArrayLiteralExpression(meta.contentQueries.map(x => createContentQueryLiteral(x)))),
        ts.factory.createPropertyAssignment('methods', ts.factory.createArrayLiteralExpression(meta.methods.map(x => ts.factory.createStringLiteral(x.name))))
    ];
    if (meta.templateProps?.length) {
        properties.push(ts.factory.createPropertyAssignment('templateProps', ts.factory.createArrayLiteralExpression(meta.templateProps.map(x => ts.factory.createStringLiteral(x)))));
    }
    return ts.factory.createObjectLiteralExpression(properties);
}

function createContentQueryLiteral(query: ContentQuery) {
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

function getImportPathToType(type: ts.InterfaceType) {
    let importPath = type.symbol.valueDeclaration.getSourceFile().fileName;
    importPath = path.posix.relative(path.posix.dirname(ELEMENTS_CONFIG), importPath);
    importPath = importPath.replace(path.extname(importPath), "");
    return importPath;
}

/**
 * Checks if given import declaration contains a given type (by name for now)
 * @param importDecl the import declaration to check
 * @param type the type to check for
 */
function importContainsType(importDecl: ts.ImportDeclaration, type: ts.Type) {
    const namedImports = importDecl.importClause?.namedBindings;
    if (namedImports && ts.isNamedImports(namedImports)) {
        // Check by name, since config file type and generated types are resolved by different checker+program
        // and namedImports.elements.some(x => configChecker.getTypeAtLocation(x.name) === type) gives false
        return namedImports.elements.some(x => x.name.text === type.symbol.name);
    }
    return false;
}

//#endregion config file

interface ComponentMetadata<ParentType = ts.InterfaceType> {
    parents: ParentType[],
    contentQueries: ContentQuery[],
    methods: MethodInfo[],
    templateProps?: string[]
}

interface ContentQuery {
    property: string;
    childType: ts.InterfaceType,
    isQueryList: boolean;
    descendants: boolean;
}

/** Method info container, tentatively with just name */
interface MethodInfo {
    name: string;
}

function getDecoratorName(decorator: ts.Decorator): string | null {
    if (decorator.expression.kind === ts.SyntaxKind.CallExpression) {
        return (decorator.expression as ts.CallExpression).expression.getText();
    }
    return null;
}

function getPublicMethods(symbols: ts.Symbol[]): MethodInfo[] {
    const methods = symbols
        .filter(x => isMethod(x))
        .filter(x => isPublic(x));
    return methods.map(x => ({ name: x.name }));
}

function isPublic(symbol: ts.Symbol) {
    if(!symbol || !symbol.valueDeclaration) return false;
    // TODO: Public flag only present w/ explicit keyword in code (currently enforced by lint)
    // Consider !protected & !private to be public instead as more robust?
    if ((ts.getCombinedModifierFlags(symbol.valueDeclaration) & ts.ModifierFlags.Public) !== ts.ModifierFlags.None) {
        return !symbol.getJsDocTags().some(x => ['hidden', 'internal'].includes(x.name));
    }
    return false;
}

function isMethod(symbol: ts.Symbol) {
    if(!symbol) return false;
    return (symbol.getFlags() & ts.SymbolFlags.Method) !== ts.SymbolFlags.None;
}

function isProperty(symbol: ts.Symbol) {
    if(!symbol) return false;
    return (symbol.getFlags() & ts.SymbolFlags.PropertyOrAccessor) !== ts.SymbolFlags.None;
}
