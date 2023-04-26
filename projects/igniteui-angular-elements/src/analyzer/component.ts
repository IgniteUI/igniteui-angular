import * as ts from 'typescript';
import type { ComponentMetadata, ContentQuery } from './types';
import { asString, first, getDecoratorName, getDecorators, getProvidedAs, getTypeExpressionIdentifier, isMethod, isProperty, isPublic } from './utils';

export class AnalyzerComponent {
    #checker: ts.TypeChecker;

    /** The AST node representing the component/class declaration. */
    #node: ts.Node;

    /** The `ts.Node` as a `ts.InterfaceType` */
    #component: ts.InterfaceType;

    constructor(component: ts.Node, checker: ts.TypeChecker) {
        this.#node = component;
        this.#checker = checker;
        this.#component = checker.getTypeAtLocation(component) as ts.InterfaceType;
    }

    /**
     * Returns the component node as a ts.InterfaceType
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get type() {
        return this.#component;
    }

    /**
     * Returns the name of the underlying class/component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get name() {
        return asString(this.#component.symbol);
    }

    /**
     * Returns the resolved metadata for the current component.
     *
     * @readonly
     * @type {ComponentMetadata}
     * @memberof AnalyzerComponent
     */
    get metadata(): ComponentMetadata<string> {
        let parents = this.parents;
        let provideAs!: ts.Type;

        if (parents.length) {
            parents = this.standaloneParents;
            const provideAsNode = getProvidedAs(this.#node as ts.ClassDeclaration, this.#component);

            if (provideAsNode) {
                provideAs = this.#checker.getTypeAtLocation(provideAsNode);
            }
        }

        return {
            parents,
            contentQueries: this.#parseQueryProps(),
            methods: this.publicMethods.map(m => ({ name: m.name })),
            booleanProperties: this.booleanProperties.map(asString),
            numericProperties: this.numericProperties.map(asString),
            templateProperties: this.templateProperties.map(asString),
            ...(provideAs ? { provideAs } : {}),
        };
    }

    /**
     * Return all public properties of the underlying class.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get publicProperties() {
        return this.#component.getProperties()
            .filter(isProperty)
            .filter(isPublic);
    }

    /**
     * Returns all public methods of the underlying class.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get publicMethods() {
        return this.#component.getProperties()
            .filter(isMethod)
            .filter(isPublic);
    }

    /**
     * Return all @Input properties of the underlying component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get inputProperties() {
        const isInput = (dec: ts.Decorator) => getDecoratorName(dec).includes('Input');
        return this.publicProperties
            .filter(prop => getDecorators(first(prop.declarations as any))?.some(isInput));
    }

    /**
     * Return all @Output properties of the underlying component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get outputProperties() {
        const isOutput = (dec: ts.Decorator) => getDecoratorName(dec).includes('Output');
        return this.publicProperties
            .filter(prop => getDecorators(first(prop.declarations as any))?.some(isOutput));
    }

    /**
     * Return all boolean @Input properties of the underlying component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get booleanProperties() {
        return this.inputProperties
            .filter(prop => this.#checker.getTypeAtLocation(prop.valueDeclaration!).getFlags() & ts.TypeFlags.Boolean);
    }

    /**
     * Return all numeric @Input properties of the underlying component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get numericProperties() {
        return this.inputProperties
            .filter(prop => {
                const type = this.#checker.getTypeAtLocation(prop.valueDeclaration!);
                return type.getFlags() & ts.TypeFlags.Number && !type.isUnionOrIntersection();
            });
    }

    /**
     * Return all TemplateRef properties of the underlying component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get templateProperties() {
        return this.inputProperties
            .filter(prop => {
                const type = this.#checker.getTypeAtLocation(prop.valueDeclaration!);
                if (type.getFlags() & ts.TypeFlags.Object && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) {
                    const target = (type as ts.TypeReference).target;
                    return target.symbol.escapedName === 'TemplateRef';
                }
                return false;
            });
    }

    /**
     * Return all @ContentChild | @ContentChildren properties of the underlying component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get queryProperties() {
        const isQuery = (dec: ts.Decorator) => getDecoratorName(dec).includes('ContentChild');
        return this.#component.getProperties()
            .filter(prop => getDecorators(first(prop.declarations as any))?.some(isQuery));
    }

    /**
     * Return the parent JsDoc tags for the underlying component.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get parents() {
        const parents = this.#component.symbol.getJsDocTags()
            .filter(tag => tag.name === 'igxParent');

        return parents.length < 1 ? [] : first(first(parents)?.text?.filter(({ kind }) => kind === 'text')).text.split(/\s*,\s*/);
    }

    /**
     * Returns the parents left after skipping the wildcard tag '*', i.e. components
     * that can be standalone.
     *
     * @readonly
     * @memberof AnalyzerComponent
     */
    get standaloneParents() {
        return this.parents.filter(p => p !== '*');
    }

    #parseQueryProps() {
        const queries: ContentQuery[] = [];

        const checker = (e: ts.Expression): e is ts.ObjectLiteralExpression => e?.kind === ts.SyntaxKind.ObjectLiteralExpression;

        this.queryProperties.forEach(prop => {
            let queryType!: ts.Identifier | null;
            let descendants = false;

            const decorator = getDecorators(prop.valueDeclaration as any)?.find(dec => getDecoratorName(dec).includes('ContentChild'));
            const expression = decorator?.expression as ts.CallExpression;
            let [firstArg, secondArg, ...rest] = Array.from(expression.arguments);

            if (firstArg) {
                queryType = getTypeExpressionIdentifier(firstArg)!;
            }

            if (rest.length < 1 && checker(secondArg)) {
                const readProp = secondArg.properties.find(x => x?.name?.getText() === 'read') as ts.PropertyAssignment;
                if (readProp && this.#checker.getTypeAtLocation(queryType!) !== this.#checker.getTypeAtLocation(readProp.initializer)) {
                    // reading something else, i.e. not straight up component child query. ignore
                    queryType = null;
                }

                const descendantsProp = secondArg.properties.find(x => x?.name?.getText() === 'descendants') as ts.PropertyAssignment;
                descendants = descendantsProp?.initializer?.kind === ts.SyntaxKind.TrueKeyword;
            }

            if (queryType) {
                queries.push({
                    property: asString(prop),
                    childType: this.#checker.getTypeAtLocation(queryType) as ts.InterfaceType,
                    isQueryList: getDecoratorName(decorator!) === 'ContentChildren',
                    descendants
                });
            }
        });

        return queries;
    }
}
