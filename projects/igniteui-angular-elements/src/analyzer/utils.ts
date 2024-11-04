import * as path from 'node:path';
import * as ts from 'typescript';

import type { AnalyzerComponent } from './component';
import type { ContentQuery } from './types';


export function readTSConfig() {
    const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
    if (!configPath)
        throw new Error(`Cannot find a valid 'tsconfig.json' at ${path.join(process.cwd(), 'tsconfig.json')}`);

    const configFile = ts.readJsonConfigFile(configPath, ts.sys.readFile);
    const { fileNames, options } = ts.parseJsonSourceFileConfigFileContent(configFile, ts.sys, process.cwd());
    return { options, fileNames: fileNames.filter(file => !file.endsWith('.spec.ts')) };
}


export function first<T>(arr?: T[]) {
    return arr!.at(0);
}

/**
 * Return whether the given node has decorators applied.
 *
 * @export
 * @param {ts.HasDecorators} node  the TS node to check
 */
export function hasDecorators(node: ts.HasDecorators): boolean {
    const decorators = ts.getDecorators(node);
    return decorators ? decorators.length > 0 : false;
}


/**
 * Returns all decorators for a given node.
 *
 * @export
 * @param {(ts.ClassDeclaration | ts.PropertyDeclaration)} node the decorated node
 */
export function getDecorators(node: ts.HasDecorators): readonly ts.Decorator[] {
    return hasDecorators(node) ? ts.getDecorators(node)! : [];
}

/**
 * Returns the name of a decorator node.
 *
 * @export
 * @param {ts.Decorator} { expression } the decorator node
 */
export function getDecoratorName({ expression }: ts.Decorator): string {
    return ts.isCallExpression(expression) ? expression.expression.getText() : '';
}

/**
 * Returns whether a given symbol node is a property
 *
 * @export
 */
export function isProperty(symbol: ts.Symbol): boolean {
    return symbol && (symbol.getFlags() & ts.SymbolFlags.PropertyOrAccessor) !== ts.SymbolFlags.None;
}

/**
 * Returns whether a given symbol node is a method.
 *
 * @export
 */
export function isMethod(symbol: ts.Symbol): boolean {
    return symbol && (symbol.getFlags() & ts.SymbolFlags.Method) !== ts.SymbolFlags.None;
}

export function isPublic(symbol: ts.Symbol) {
    const tags = new Set(['hidden', 'internal']);
    if (!(symbol && symbol.valueDeclaration)) return false;
    if ((ts.getCombinedModifierFlags(symbol.valueDeclaration) & ts.ModifierFlags.Public) !== ts.ModifierFlags.None) {
        return !symbol.getJsDocTags().some(({ name }) => tags.has(name));
    }
    return false;
}

/** returns if a symbol is either readonly or just a getter equivalent */
export function isReadOnly(symbol: ts.Symbol) {
    const isGetter = (symbol.flags & ts.SymbolFlags.GetAccessor) !== ts.SymbolFlags.None &&
        (symbol.flags & ts.SymbolFlags.SetAccessor) === ts.SymbolFlags.None;
    const readonly = symbol.valueDeclaration && ts.getCombinedModifierFlags(symbol.valueDeclaration) & ts.ModifierFlags.Readonly;
    return isGetter || readonly;
}

/** returns if a symbol has an override modifier */
export function isOverride(symbol: ts.Symbol) {
    return (ts.getCombinedModifierFlags(symbol.valueDeclaration!) & ts.ModifierFlags.Override) !== ts.ModifierFlags.None;
}

export function asString(x?: ts.Symbol) {
    return x ? x.escapedName.toString() : '';
}

/** Get the properties of the `@Component({ ...properties })` decorator object param */
function getDecoratorProps(component: ts.ClassDeclaration): ts.NodeArray<ts.ObjectLiteralElementLike> | null {
    const expression = getDecorators(component)?.find(x => getDecoratorName(x) === 'Component')?.expression;

    if (!expression || !ts.isCallExpression(expression))
        return null;

    const args = [...expression.arguments];

    if (!ts.isObjectLiteralExpression(args[0]))
        return null;

    const literal = args[0];
    return literal?.properties;
}

/**
 * Looks through the component decorator for providers that match the existing class to a different type/token, such as:
 *
 * @example
 * ```ts
 * providers: [{
 *  provide: IgxColumnComponent,
 *  useExisting: IgxColumnGroupComponent,
 * }]
 * ```
 *
 * @param component The component node
 * @param type The resolved type of the component
 * @returns Alternative type/token the component is provided as OR null
 */
export function getProvidedAs(component: ts.ClassDeclaration, type: ts.InterfaceType) {
    const properties = getDecoratorProps(component);
    const providers = properties?.find(x => x.name?.getText() === 'providers');
    if (!(providers && ts.isPropertyAssignment(providers) && ts.isArrayLiteralExpression(providers.initializer)))
        return null;

    const useExisting = providers.initializer.elements.filter(ts.isObjectLiteralExpression).find(x => x.properties.find(x => x.name?.getText() === 'useExisting'));
    if (!useExisting)
        return null;

    if (isUseExistingType(useExisting, type)) {
        const provideValue = useExisting?.properties.find(x => x.name?.getText() === 'provide') as ts.PropertyAssignment;
        return provideValue.initializer as ts.Identifier;
    }

    return null;

}

/**
 * Get the selector from the component decorator
 * @param component The component node
 * @param replace Find and replace pair
 * @returns The transformed selector as OR null
 */
export function getSelector(component: ts.ClassDeclaration, replace: [string, string]) {
    const properties = getDecoratorProps(component);
    const selector = properties?.find(x => x.name?.getText() === 'selector');
    if (!(selector && ts.isPropertyAssignment(selector) && ts.isStringLiteral(selector.initializer)))
        return null;

    return selector.initializer.text.replace(replace[0], replace[1]);
}


/**
 * Get type identifier from expression, unpacking Angular's `forwardRef` if needed.
 *
 * @param expression the expression of the type identifier
 *
 * @example <caption>Use to get Identifier for values like `useExisting: <type>` props or `ContentChild(<type>)` decorator arguments:</caption>
 * ```ts
 * getTypeExpressionIdentifier(useExistingProp.initializer);
 * getTypeExpressionIdentifier(decorator.expression.arguments[0])
 * ```
 */
export function getTypeExpressionIdentifier(expr: ts.Expression) {
    if (ts.isIdentifier(expr)) {
        // `<type>`
        return expr;
    }

    if (ts.isCallExpression(expr)
        && expr.expression.getText() === 'forwardRef'
        && ts.isArrowFunction(expr.arguments[0])
        && ts.isIdentifier(expr.arguments[0].body)) {
        // `forwardRef(() => <type>)`
        return expr.arguments[0].body;
    }
}

export function isUseExistingType(obj: ts.ObjectLiteralExpression, type: ts.InterfaceType) {
    const useExistingValue = obj?.properties
        .find(prop => prop?.name?.getText() === 'useExisting') as ts.PropertyAssignment;

    if (!useExistingValue) return false;

    // `useExisting: <type>`
    // `useExisting: forwardRef(() => <type>)`
    const initializer = getTypeExpressionIdentifier(useExistingValue.initializer);
    return initializer ? initializer.getText() === type.symbol.escapedName : false;
}

/**
 * Checks if given import declaration contains a given type (by name for now)
 * @param importDecl the import declaration to check
 * @param type the type to check for
 */
export function importContainsType(imp: ts.ImportDeclaration, type: ts.Type) {
    const namedImports = imp.importClause?.namedBindings;
    if (namedImports && ts.isNamedImports(namedImports)) {
        // Check by name, since config file type and generated types are resolved by different checker+program
        // and namedImports.elements.some(x => configChecker.getTypeAtLocation(x.name) === type) gives false
        return namedImports.elements.some(x => x.name.text === type.symbol.name);
    }
    return false;
}

export function isChildOfConfigComponent(parents: string[], bases: ts.Type[], map: Map<string, AnalyzerComponent>): boolean {
    for (const parent of parents) {
        if (bases.some(x => x.symbol.escapedName === parent)) {
            return true;
        }
        const metadata = map.get(parent)?.metadata;
        if (metadata?.parents.length && isChildOfConfigComponent(metadata.parents, bases, map)) {
            return true;
        }
    }
    return false;
}


/**
 * Filters content queries to only those which target components in the given `components` list
 * that also mention this component as parent.
 * This excludes mostly internal queries for other directives.
 *
 * @export
 * @param {ContentQuery[]} queries the queries to filter
 * @param {string} name the name of the component
 * @param {Map<string, ComponentMetadata>} components the component "list" in which to filter
 * @return {*}  {ContentQuery[]} the filtered queries
 */
export function filterRelevantQueries(queries: ContentQuery[], name: string, components: Map<string, AnalyzerComponent>): ContentQuery[] {
    const list = Array.from(components.values()).map(x => x.metadata);

    return queries.filter(q => {
        const childType = asString(q.childType.symbol);
        const childComponent = components.get(childType) || list.find(x => asString(x?.provideAs?.symbol) === childType);
        return childComponent?.parents.includes(name);
    })
}
