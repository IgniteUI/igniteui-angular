import { findClosingBracket, maskNonCode, normalizeName, skipString } from './scanner';

/** How a member name in a change is matched against the names in a stylesheet. */
export type NameMatch =
    /** The whole name, so `palette` matches `palette(` and `igx.palette(` but not `color-palette(`. */
    'exact' |
    /**
     * Any name ending with it, so `circular-theme` also matches `progress-circular-theme(`. Theme
     * property changes rely on this to address several theme functions with one owner.
     */
    'suffix';

/** Whether a member is called as a function or included as a mixin. */
export type MemberKind = 'function' | 'mixin';

/** A member referenced in a stylesheet, through a call, an include, or both. */
export interface SassMemberReference {
    /** Start of the member name, after any namespace. */
    nameStart: number;
    /** End of the member name. */
    nameEnd: number;
    /** The namespace the member is referenced through, such as `igx` in `igx.palette(`. */
    namespace?: string;
    kind: MemberKind;
    /** Start of the argument list, after its opening bracket, when the reference passes one. */
    bodyStart?: number;
    /** Index of the bracket closing the argument list. */
    bodyEnd?: number;
}

/** An `@include` statement, from the keyword (or the `+` shorthand) to its end. */
export interface SassInclude extends SassMemberReference {
    start: number;
    /** End of the statement, after its `;` in the SCSS syntax. */
    end: number;
    /** Whether the include passes a content block, which a removal would have to take with it. */
    hasContentBlock: boolean;
}

/** A `@use` or `@forward` rule. */
export interface SassModuleRule {
    keyword: '@use' | '@forward';
    start: number;
    /** End of the rule, after its `;` in the SCSS syntax. */
    end: number;
    url: string;
    /** Start and end of the URL, inside its quotes. */
    urlStart: number;
    urlEnd: number;
    /** The namespace members of a used module are referenced through, `*` for none. */
    namespace?: string;
}

/** A declaration, including its default arguments and body, which are evaluated when called. */
interface SassDeclaration {
    start: number;
    end: number;
}

/** The mixins and functions declared in one lexical scope of a stylesheet. */
interface SassDeclarationScope {
    start: number;
    end: number;
    mixins: Map<string, number>;
    functions: Map<string, number>;
    declarations: SassDeclaration[];
}

const IDENTIFIER = /[\w-]/;

/**
 * One stylesheet read for migrations. Strings, comments and `url()` tokens are masked once, so
 * that nothing mentioned in one of them is taken for code, and the members the stylesheet
 * declares itself are tracked by scope, so that a migration leaves them alone.
 *
 * Only this stylesheet is read. Telling which member a reference loaded from another one refers
 * to needs the module rules of `@use` and `@forward` - re-exports, `hide` and `as prefix-*` - so a
 * member of the app that another stylesheet declares is still taken for the Ignite UI one.
 */
export class SassStylesheet {
    private _code: string;
    private _scopes: SassDeclarationScope[];

    constructor(public readonly content: string, public readonly indented: boolean) { }

    /** The stylesheet with strings, comments and `url()` tokens masked by whitespace. */
    public get code(): string {
        return this._code ??= maskNonCode(this.content);
    }

    private get scopes(): SassDeclarationScope[] {
        return this._scopes ??= this.declarationScopes();
    }

    /**
     * Returns every reference to `name(...)` that passes arguments. A reference nested in the
     * arguments of another one reports its own closing bracket rather than the one of the
     * reference surrounding it. A reference with the same name nested in one is covered by it,
     * unless `nested` asks for those too. Members the stylesheet declares itself are skipped.
     */
    public findCalls(name: string, options: { match: NameMatch; kind?: MemberKind; nested?: boolean }): SassMemberReference[] {
        const calls: SassMemberReference[] = [];
        const target = normalizeName(name);
        const code = this.code;
        let brackets = 0;

        for (let i = 0; i < code.length; i++) {
            if (code[i] === '(' || code[i] === '[') {
                brackets++;
            } else if (code[i] === ')' || code[i] === ']') {
                brackets--;
            }
            if (code[i + name.length] !== '(' || normalizeName(code.substring(i, i + name.length)) !== target) {
                continue;
            }

            const reference = this.reference(i, name, options.match, this.indented && !brackets);
            if (!reference || (options.kind && reference.kind !== options.kind)) {
                continue;
            }

            const bodyStart = i + name.length + 1;
            const bodyEnd = findClosingBracket(this.content, bodyStart);
            if (bodyEnd === -1) {
                // unbalanced from here on, leave this call rather than the rest of the file
                continue;
            }

            calls.push({ ...reference, bodyStart, bodyEnd });
            if (!options.nested) {
                // a call of the same member nested in this one is already covered by it
                i = bodyEnd;
            }
        }

        return calls;
    }

    /** Returns every `@include` of the mixin `name`, with or without arguments. */
    public findIncludes(name: string, match: NameMatch): SassInclude[] {
        const includes: SassInclude[] = [];
        const code = this.code;
        const keyword = this.indented ? /@include\s+|^[ \t]*\+(?=[\w-])/gm : /@include\s+/g;

        for (const statement of code.matchAll(keyword)) {
            const shorthand = !statement[0].startsWith('@');
            const start = shorthand ? statement.index + statement[0].length - 1 : statement.index;
            let nameStart = statement.index + statement[0].length;
            let namespace: string;
            const token = /^([\w-]+)(?:\.([\w-]+))?/.exec(code.substring(nameStart));
            if (!token) {
                continue;
            }
            if (token[2] !== undefined) {
                namespace = token[1];
                nameStart += namespace.length + 1;
            }

            const member = token[2] ?? token[1];
            const matches = match === 'exact' ? normalizeName(member) === normalizeName(name) : member.endsWith(name);
            if (!matches || this.isOwnMember(nameStart + member.length - name.length, name)) {
                continue;
            }

            const nameEnd = nameStart + member.length;
            let end = nameEnd;
            let bodyStart: number;
            let bodyEnd: number;
            if (code[end] === '(') {
                bodyStart = end + 1;
                bodyEnd = findClosingBracket(this.content, bodyStart);
                if (bodyEnd === -1) {
                    continue;
                }
                end = bodyEnd + 1;
            }

            const rest = this.statementEnd(end, start);
            includes.push({
                start, end: rest.end, nameStart, nameEnd, namespace, kind: 'mixin', bodyStart, bodyEnd,
                hasContentBlock: rest.block
            });
        }

        return includes;
    }

    /** Returns every `@use` and `@forward` rule of the stylesheet. */
    public findModuleRules(): SassModuleRule[] {
        const rules: SassModuleRule[] = [];

        for (const match of this.code.matchAll(/@(use|forward)(?=\s)/g)) {
            // the URL is masked in the code, so whitespace is skipped in the original
            const urlQuote = match.index + match[0].length + /^\s*/.exec(this.content.substring(match.index + match[0].length))[0].length;
            const quote = this.content[urlQuote];
            if (quote !== '\'' && quote !== '"') {
                continue;
            }

            const urlEnd = skipString(this.content, urlQuote);
            const url = this.content.substring(urlQuote + 1, urlEnd);
            const { end } = this.statementEnd(urlEnd + 1, match.index);
            const keyword = match[1] === 'use' ? '@use' : '@forward';
            let namespace: string;
            if (keyword === '@use') {
                const as = /\bas\s+(\*|[\w-]+)/.exec(this.code.substring(urlEnd + 1, end));
                // without `as`, a module is used through the last part of its URL
                namespace = as ? as[1] : url.split('/').pop().replace(/^_/, '').replace(/\.s[ac]ss$/, '');
            }

            rules.push({ keyword, start: match.index, end, url, urlStart: urlQuote + 1, urlEnd, namespace });
        }

        return rules;
    }

    /**
     * The member reference whose name ends with `name` at `index`, or null when the name there is
     * not a reference: part of another name, a variable, or a member the stylesheet declares itself.
     */
    private reference(index: number, name: string, match: NameMatch, statementLevel: boolean): Omit<SassMemberReference, 'bodyStart' | 'bodyEnd'> | null {
        const code = this.code;
        let nameStart = index;
        while (nameStart > 0 && IDENTIFIER.test(code[nameStart - 1])) {
            nameStart--;
        }
        const nameEnd = index + name.length;
        const fullName = code.substring(nameStart, nameEnd);
        if (code[nameStart - 1] === '$' || code[nameStart - 1] === '%'
            || (match === 'exact' && normalizeName(fullName) !== normalizeName(name))) {
            return null;
        }

        let namespace: string;
        let start = nameStart;
        if (code[nameStart - 1] === '.') {
            start = nameStart - 1;
            while (start > 0 && IDENTIFIER.test(code[start - 1])) {
                start--;
            }
            namespace = code.substring(start, nameStart - 1);
        }

        const keyword = this.keywordBefore(code, start, statementLevel);
        if (keyword === '@mixin' || keyword === '@function' || this.isOwnMember(index, name, statementLevel)) {
            return null;
        }

        return { nameStart, nameEnd, namespace, kind: keyword === '@include' ? 'mixin' : 'function' };
    }

    /**
     * Where the statement that starts at `start` and continues at `index` ends, and whether a
     * content block follows it.
     */
    private statementEnd(index: number, start: number): { end: number; block: boolean } {
        const code = this.code;
        let depth = 0;

        for (let i = index; i < code.length; i++) {
            const char = code[i];
            if (char === '(' || char === '[') {
                depth++;
            } else if (char === ')' || char === ']') {
                depth--;
            } else if (depth) {
                continue;
            } else if (char === ';') {
                return { end: i + 1, block: false };
            } else if (char === '{') {
                return { end: i, block: true };
            } else if (char === '}') {
                return { end: i, block: false };
            } else if (char === '\n' && this.indented) {
                // a next line deeper than the statement's own is a content block
                const lineStart = code.lastIndexOf('\n', start - 1) + 1;
                const indentation = /^[ \t]*/.exec(code.substring(lineStart))[0].length;
                const next = /^([ \t]*)\S/m.exec(code.substring(i + 1));
                return { end: code[i - 1] === '\r' ? i - 1 : i, block: !!next && next[1].length > indentation };
            }
        }

        return { end: code.length, block: false };
    }

    /**
     * Tells whether the `name` at `index` is part of a member the stylesheet declares itself. A
     * user's own `app-grid-summary-theme` ends with a theme function name, so without this its
     * declaration would lose a parameter its body reads.
     */
    private isOwnMember(index: number, name: string, statementLevel = this.indented): boolean {
        const code = this.code;
        let start = index;
        while (start > 0 && IDENTIFIER.test(code[start - 1])) {
            start--;
        }

        // a namespace holds the members of another stylesheet, never the ones declared here
        if (code[start - 1] === '.') {
            return false;
        }

        const keyword = this.keywordBefore(code, start, statementLevel);
        if (keyword === '@mixin' || keyword === '@function') {
            // a declaration, whose body reads the parameters it lists
            return true;
        }

        const member = normalizeName(code.substring(start, index + name.length));
        // Bodies and defaults can run after a later declaration becomes available. Keep their
        // existing protection; declaration order is conclusive only for immediate calls.
        const deferred = this.scopes.some(scope => scope.declarations.some(declaration => declaration.start <= index && index < declaration.end));

        // a mixin and a function of one name are separate members, so only the referenced one shadows
        return this.scopes.some(scope => {
            const declaredAt = (keyword === '@include' ? scope.mixins : scope.functions).get(member);
            return scope.start <= index && index < scope.end && declaredAt !== undefined
                && (deferred || declaredAt <= index);
        });
    }

    /** The at-rule before a member name, or indented shorthand when outside an expression. */
    private keywordBefore(content: string, start: number, indented: boolean): string {
        let end = start;
        while (end > 0 && /\s/.test(content[end - 1])) {
            end--;
        }

        // Shorthand starts a statement. Unlike '=', '+' must be adjacent to the mixin name.
        const shorthand = content[end - 1];
        if (indented && (shorthand === '=' || (shorthand === '+' && end === start))
            && !content.substring(content.lastIndexOf('\n', end - 1) + 1, end - 1).trim()) {
            return shorthand === '=' ? '@mixin' : '@include';
        }

        let keywordStart = end;
        while (keywordStart > 0 && /[\w@-]/.test(content[keywordStart - 1])) {
            keywordStart--;
        }

        return content.substring(keywordStart, end);
    }

    /** Collects declarations within their brace or indentation scopes. */
    private declarationScopes(): SassDeclarationScope[] {
        const { content, code, indented } = this;
        const scopes: SassDeclarationScope[] = [];
        const stack: { scope: SassDeclarationScope; indentation: number; declaration?: SassDeclaration }[] = [];
        let brackets = 0;
        let pendingDeclaration: SassDeclaration;
        const enterScope = (start: number, indentation = 0) => {
            const scope: SassDeclarationScope = {
                start, end: code.length, mixins: new Map<string, number>(), functions: new Map<string, number>(), declarations: []
            };
            scopes.push(scope);
            // Braces in an interpolated default argument do not start the declaration's body.
            const declaration = brackets ? undefined : pendingDeclaration;
            stack.push({ scope, indentation, declaration });
            if (declaration) {
                pendingDeclaration = undefined;
            }
        };
        const leaveScope = (end: number) => {
            const { scope, declaration } = stack.pop();
            scope.end = end;
            if (declaration) {
                declaration.end = end;
            }
        };
        enterScope(0);
        const declaration = /(?:@(mixin|function)\s+|=\s*)([\w-]+)/y;

        for (let i = 0; i < code.length; i++) {
            // Indentation inside a multiline argument/list is not a new Sass scope.
            if (indented && !brackets && (i === 0 || code[i - 1] === '\n')) {
                const lineEnd = code.indexOf('\n', i);
                const line = code.substring(i, lineEnd === -1 ? code.length : lineEnd);
                if (line.trim()) {
                    // Masked comments are whitespace too, but are not part of the source indentation.
                    const indentation = /^[ \t]*/.exec(content.substring(i))[0].length;
                    // An indented mixin may have defaults but no body.
                    if (pendingDeclaration && indentation <= stack[stack.length - 1].indentation) {
                        pendingDeclaration.end = i;
                        pendingDeclaration = undefined;
                    }
                    while (stack.length > 1 && indentation < stack[stack.length - 1].indentation) {
                        leaveScope(i);
                    }
                    if (indentation > stack[stack.length - 1].indentation) {
                        enterScope(i, indentation);
                    }
                }
            }

            const char = code[i];
            if (!indented && char === '{') {
                enterScope(i);
            } else if (!indented && char === '}' && stack.length > 1) {
                leaveScope(i);
            } else if (char === '(' || char === '[') {
                brackets++;
            } else if (char === ')' || char === ']') {
                brackets--;
            } else if (char === '@' || (indented && !brackets && char === '='
                && this.keywordBefore(code, i + 1, true) === '@mixin')) {
                declaration.lastIndex = i;
                const match = declaration.exec(code);
                if (match) {
                    const scope = stack[stack.length - 1].scope;
                    // Sass treats underscores and hyphens as the same identifier character.
                    const members = scope[match[1] === 'function' ? 'functions' : 'mixins'];
                    const name = normalizeName(match[2]);
                    if (!members.has(name)) {
                        members.set(name, i);
                    }
                    pendingDeclaration = { start: i, end: code.length };
                    scope.declarations.push(pendingDeclaration);
                    i = declaration.lastIndex - 1;
                }
            }
        }

        return scopes;
    }
}
