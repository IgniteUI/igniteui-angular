import * as ts from 'typescript';
/**
 * Determines if fileName refers to a builtin lib.d.ts file.
 * This is a terrible hack but it mirrors a similar thing done in Clutz.
 */
export declare function isBuiltinLibDTS(fileName: string): boolean;
export declare function typeToDebugString(type: ts.Type): string;
export declare function symbolToDebugString(sym: ts.Symbol): string;
/** TypeTranslator translates TypeScript types to Closure types. */
export declare class TypeTranslator {
    private readonly typeChecker;
    private readonly node;
    private readonly pathBlackList;
    private readonly symbolsToAliasedNames;
    /**
     * A list of types we've encountered while emitting; used to avoid getting stuck in recursive
     * types.
     */
    private readonly seenTypes;
    /**
     * Whether to write types suitable for an \@externs file. Externs types must not refer to
     * non-externs types (i.e. non ambient types) and need to use fully qualified names.
     */
    isForExterns: boolean;
    /**
     * @param node is the source AST ts.Node the type comes from.  This is used
     *     in some cases (e.g. anonymous types) for looking up field names.
     * @param pathBlackList is a set of paths that should never get typed;
     *     any reference to symbols defined in these paths should by typed
     *     as {?}.
     * @param symbolsToPrefix a mapping from symbols (`Foo`) to a prefix they should be emitted with
     *     (`tsickle_import.Foo`).
     */
    constructor(typeChecker: ts.TypeChecker, node: ts.Node, pathBlackList?: Set<string> | undefined, symbolsToAliasedNames?: Map<ts.Symbol, string>);
    /**
     * Converts a ts.Symbol to a string.
     * Other approaches that don't work:
     * - TypeChecker.typeToString translates Array as T[].
     * - TypeChecker.symbolToString emits types without their namespace,
     *   and doesn't let you pass the flag to control that.
     * @param useFqn whether to scope the name using its fully qualified name. Closure's template
     *     arguments are always scoped to the class containing them, where TypeScript's template args
     *     would be fully qualified. I.e. this flag is false for generic types.
     */
    symbolToString(sym: ts.Symbol, useFqn: boolean): string;
    private stripClutzNamespace(name);
    translate(type: ts.Type): string;
    private translateUnion(type);
    private translateEnumLiteral(type);
    private translateObject(type);
    /**
     * translateTypeLiteral translates a ts.SymbolFlags.TypeLiteral type, which
     * is the anonymous type encountered in e.g.
     *   let x: {a: number};
     */
    private translateTypeLiteral(type);
    /** Converts a ts.Signature (function signature) to a Closure function type. */
    private signatureToClosure(sig);
    private convertParams(sig);
    warn(msg: string): void;
    /** @return true if sym should always have type {?}. */
    isBlackListed(symbol: ts.Symbol): boolean;
}
