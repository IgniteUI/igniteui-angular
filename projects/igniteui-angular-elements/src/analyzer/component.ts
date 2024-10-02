import * as ts from 'typescript';
import type { ComponentMetadata, ContentQuery } from './types';
import { asString, first, getDecoratorName, getDecorators, getProvidedAs, getSelector, getTypeExpressionIdentifier, isMethod, isOverride, isProperty, isPublic, isReadOnly } from './utils';


const isInput = (dec: ts.Decorator) => getDecoratorName(dec).includes('Input');
const isOutput = (dec: ts.Decorator) => getDecoratorName(dec).includes('Output');
const isInputOutput = (dec: ts.Decorator) => ['Input', 'Output'].includes(getDecoratorName(dec));

export class AnalyzerComponent {
    private checker: ts.TypeChecker;

    /** The AST node representing the component/class declaration. */
    private node: ts.Node;

    /** The `ts.Node` as a `ts.InterfaceType` */
    private component: ts.InterfaceType;

    constructor(component: ts.Node, checker: ts.TypeChecker) {
        this.node = component;
        this.checker = checker;
        this.component = checker.getTypeAtLocation(component) as ts.InterfaceType;
    }

    /**
     * Returns the component node as a ts.InterfaceType
     */
    public get type() {
        return this.component;
    }

    /**
     * Returns the name of the underlying class/component.
     */
    public get name() {
        return asString(this.component.symbol);
    }

    /**
     * Returns the resolved metadata for the current component.
     */
    public get metadata(): ComponentMetadata<string> {
        let parents = this.parents;
        let provideAs!: ts.Type;
        const selector = getSelector(this.node as ts.ClassDeclaration, ['igx-', 'igc-']);

        if (parents.length) {
            parents = this.standaloneParents;
            const provideAsNode = getProvidedAs(this.node as ts.ClassDeclaration, this.component);

            if (provideAsNode) {
                provideAs = this.checker.getTypeAtLocation(provideAsNode);
            }
        }

        return {
            selector,
            parents,
            contentQueries: this.parseQueryProps(),
            methods: this.publicMethods.map(m => ({ name: m.name })),
            additionalProperties: this.additionalProperties.map(p => ({ name: p.name, writable: !isReadOnly(p)})),
            booleanProperties: this.booleanProperties.map(asString),
            numericProperties: this.numericProperties.map(asString),
            templateProperties: this.templateProperties.map(asString),
            ...(provideAs ? { provideAs } : {}),
        };
    }

    /**
     * Return all public properties of the underlying class.
     */
    private get publicProperties() {
        return this.component.getProperties()
            .filter(isProperty)
            .filter(isPublic);
    }

    /**
     * Returns all public methods of the underlying class.
     */
    private get publicMethods() {
        return this.component.getProperties()
            .filter(isMethod)
            .filter(isPublic);
    }

    /**
     * Return all `@Input` properties of the underlying component.
     */
    private get inputProperties() {
        return this.publicProperties
            .filter(prop => getDecorators(first(prop.declarations as any))?.some(isInput));
    }

    /**
     * Return all `@Output` properties of the underlying component.
     */
    private get outputProperties() {
        return this.publicProperties
            .filter(prop => getDecorators(first(prop.declarations as any))?.some(isOutput));
    }

    /**
     * Return all leftover exposed properties (non-inputs)
     */
    private get additionalProperties() {
        // TODO: Better handling of collisions with HTMLElement:
        const forbiddenNames = ['children'];

        const additionalProperties = this.publicProperties
            .filter(prop => !prop.declarations?.some(x => ts.canHaveDecorators(x) && getDecorators(x)?.some(isInputOutput)))
            .filter(x => !forbiddenNames.includes(x.name))
            .filter(x => !this.isOverrideOfParentInput(x, this.component));

        return additionalProperties;
    }

    /**
     * Return all boolean `@Input` properties of the underlying component.
     */
    private get booleanProperties() {
        return this.inputProperties
            .filter(prop => this.checker.getTypeAtLocation(prop.valueDeclaration!).getFlags() & ts.TypeFlags.Boolean);
    }

    /**
     * Return all numeric `@Input` properties of the underlying component.
     */
    private get numericProperties() {
        return this.inputProperties
            .filter(prop => {
                const type = this.checker.getTypeAtLocation(prop.valueDeclaration!);
                return type.getFlags() & ts.TypeFlags.Number && !type.isUnionOrIntersection();
            });
    }

    /**
     * Return all `TemplateRef` properties of the underlying component.
     */
    private get templateProperties() {
        return this.inputProperties
            .filter(prop => {
                const type = this.checker.getTypeAtLocation(prop.valueDeclaration!);
                if (type.getFlags() & ts.TypeFlags.Object && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) {
                    const target = (type as ts.TypeReference).target;
                    return target.symbol.escapedName === 'TemplateRef';
                }
                return false;
            });
    }

    /**
     * Return all `@ContentChild` or `@ContentChildren` properties of the underlying component.
     */
    private get queryProperties() {
        const isQuery = (dec: ts.Decorator) => getDecoratorName(dec).includes('ContentChild');
        return this.component.getProperties()
            .filter(prop => getDecorators(first(prop.declarations as any))?.some(isQuery));
    }

    /**
     * Return the parent JsDoc tags for the underlying component.
     */
    private get parents() {
        const parents = this.component.symbol.getJsDocTags()
            .filter(tag => tag.name === 'igxParent');

        return parents.length < 1 ? [] : first(first(parents)?.text?.filter(({ kind }) => kind === 'text')).text.split(/\s*,\s*/);
    }

    /**
     * Returns the parents left after skipping the wildcard tag '*', i.e. components
     * that can be standalone.
     */
    private get standaloneParents() {
        return this.parents.filter(p => p !== '*');
    }

    private parseQueryProps() {
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
                if (readProp && this.checker.getTypeAtLocation(queryType!) !== this.checker.getTypeAtLocation(readProp.initializer)) {
                    // reading something else, i.e. not straight up component child query. ignore
                    queryType = null;
                }

                const descendantsProp = secondArg.properties.find(x => x?.name?.getText() === 'descendants') as ts.PropertyAssignment;
                descendants = descendantsProp?.initializer?.kind === ts.SyntaxKind.TrueKeyword;
            }

            if (queryType) {
                queries.push({
                    property: asString(prop),
                    childType: this.checker.getTypeAtLocation(queryType) as ts.InterfaceType,
                    isQueryList: getDecoratorName(decorator!) === 'ContentChildren',
                    descendants
                });
            }
        });

        return queries;
    }

    private isOverrideOfParentInput(symbol: ts.Symbol, type: ts.InterfaceType): boolean {
        if (isOverride(symbol)) {
            // should resolve a single base for classes
            const base = first(type.getBaseTypes() || []);
            if (base?.isClass()) {
                const baseProp = base.getProperty(symbol.escapedName.toString());
                if (isOverride(baseProp)) {
                    // also inherited
                    return this.isOverrideOfParentInput(baseProp, base);
                }
                return baseProp?.declarations?.some(x => ts.canHaveDecorators(x) && getDecorators(x)?.some(isInputOutput));
            }
        }
        return false;
    }
}
