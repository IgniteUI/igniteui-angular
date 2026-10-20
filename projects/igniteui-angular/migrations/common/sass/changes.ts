/**
 * The changes `ng update` makes to Sass stylesheets. Each one reads a stylesheet as text, through
 * the scanner, and changes only code: strings, comments and unquoted URLs stay as written.
 *
 * Known limits. The changes work on one stylesheet at a time and match names as text, so they:
 * - don't resolve modules: a call through any namespace matches, such as `mine.igx-color()` for
 *   `igx-color`, and a variable renamed globally is renamed where a local one shadows it too;
 * - don't find dynamic references, such as `meta.get-function('igx-color')` or a name built
 *   with interpolation;
 * - don't match a name written with escapes, such as `igx\-color()`;
 * - update the arguments of the outermost call only (`updateArgument`), when calls to the same
 *   member are nested in each other; adding an argument and renaming reach the nested calls too.
 * Calls whose arguments they can't change, such as `palette($args...)`, they report for manual
 * review instead.
 *
 * Each of these would take resolving the stylesheet as Sass does, which a text scanner doesn't.
 * Library stylesheets and themes don't write code like this, so the changes leave it as it is.
 */
import {
    argumentName, commentBreak, leadingCommentsEnd, lineEnding, maskComments, maskNonCode, normalizeName, splitArguments
} from './scanner';
import { MemberKind, NameMatch, SassInclude, SassMemberReference, SassStylesheet } from './stylesheet';
import { escapeRegExp } from '../util';

/** A replacement of `content.substring(start, end)` with `text`. */
export interface SassEdit {
    start: number;
    end: number;
    text: string;
}

/** Something a change could not do on its own, for the person running the migration to review. */
export interface SassManualChange {
    /** Offset of the code to review. */
    index: number;
    message: string;
}

/** The edits a change makes to one stylesheet, and what it left for manual review. */
export interface SassChangeResult {
    edits: SassEdit[];
    manual: SassManualChange[];
}

/**
 * The edits to apply, back to front, so the offsets they were collected at stay valid. Of two
 * edits at one offset, the one collected first ends up in front. An edit reaching into one
 * applied after it would corrupt it, so it is dropped.
 */
const editsToApply = (content: string, edits: SassEdit[]): SassEdit[] => {
    const applied: SassEdit[] = [];
    let limit = content.length;

    for (const edit of edits.map((edit, order) => ({ ...edit, order }))
        .sort((a, b) => b.start - a.start || b.order - a.order)) {
        if (edit.end <= limit) {
            applied.push(edit);
            limit = edit.start;
        }
    }

    return applied;
};

/** Applies edits to the content they were collected on. */
export const applyEdits = (content: string, edits: SassEdit[]): string =>
    editsToApply(content, edits).reduce((result, { start, end, text }) => result.substring(0, start) + text + result.substring(end), content);

/**
 * Applies edits and returns the result with a function that maps an offset in the content to
 * the matching offset in the result. An offset inside a replaced range maps to its start.
 */
export const applyEditsWithMap = (content: string, edits: SassEdit[]): { content: string; map: (offset: number) => number } => {
    const applied = editsToApply(content, edits);
    const result = applied.reduce((text, { start, end, text: replacement }) => text.substring(0, start) + replacement + text.substring(end), content);
    const map = (offset: number) => applied.reduce((mapped, { start, end, text }) => {
        if (end <= offset) {
            return mapped + text.length - (end - start);
        }
        return start < offset ? mapped - (offset - start) : mapped;
    }, offset);

    return { content: result, map };
};

/** The range removing `start`-`end` takes: the whole line when nothing else is on it. */
export const removalRange = (content: string, start: number, end: number): { start: number; end: number } => {
    let lineStart = start;
    while (lineStart > 0 && (content[lineStart - 1] === ' ' || content[lineStart - 1] === '\t')) {
        lineStart--;
    }
    let lineEnd = end;
    while (lineEnd < content.length && (content[lineEnd] === ' ' || content[lineEnd] === '\t')) {
        lineEnd++;
    }

    const atLineStart = lineStart === 0 || content[lineStart - 1] === '\n';
    const atLineEnd = lineEnd >= content.length || content[lineEnd] === '\n' || content[lineEnd] === '\r';
    if (!atLineStart || !atLineEnd) {
        return { start, end };
    }

    if (content[lineEnd] === '\r' && content[lineEnd + 1] === '\n') {
        lineEnd += 2;
    } else if (content[lineEnd] === '\n' || content[lineEnd] === '\r') {
        lineEnd += 1;
    }
    return { start: lineStart, end: lineEnd };
};

/** References to a member, through calls and includes, each once and in source order. */
const memberReferences = (sheet: SassStylesheet, name: string): SassMemberReference[] => {
    const references = new Map<number, SassMemberReference>();
    for (const reference of [...sheet.findCalls(name, { match: 'exact', nested: true }), ...sheet.findIncludes(name, 'exact')]) {
        references.set(reference.nameStart, reference);
    }
    return [...references.values()].sort((a, b) => a.nameStart - b.nameStart);
};

/**
 * Renames a function or a mixin wherever the stylesheet references it, bare or through any
 * namespace, since an app can forward Ignite UI through a module of its own. Members the
 * stylesheet declares itself, and other members whose names merely contain this one, are left.
 */
export const renameMember = (sheet: SassStylesheet, name: string, replaceWith: string): SassChangeResult => ({
    edits: memberReferences(sheet, name).map(({ nameStart, nameEnd }) => ({ start: nameStart, end: nameEnd, text: replaceWith })),
    manual: []
});

/**
 * Removes the include statements of a mixin, together with their line when they are alone on it.
 * With `namespace`, only the includes through it are removed; `null` removes only bare includes.
 */
export const removeIncludes = (sheet: SassStylesheet, name: string, namespace?: string | null): SassChangeResult => {
    const result: SassChangeResult = { edits: [], manual: [] };
    const includes = sheet.findIncludes(name, 'exact')
        .filter(include => namespace === undefined || include.namespace === (namespace ?? undefined));

    for (const include of includes) {
        if (include.hasContentBlock) {
            result.manual.push({ index: include.start, message: `Remove the include of the mixin ${name}, which passes a content block.` });
            continue;
        }
        const range = removalRange(sheet.content, include.start, include.end);
        result.edits.push({ ...range, text: '' });
    }

    return result;
};

/** A change to the arguments a function or mixin call passes. */
export interface SassArgumentChange {
    /** The argument, such as `$background`. */
    name: string;
    replaceWith?: string;
    remove?: boolean;
    /**
     * The argument's 1-based index in the owner's parameter list. It only detects calls that pass
     * the argument by position: removing it from one of those would shift the arguments after it,
     * so such a call is left for manual review.
     */
    parameterIndex?: number;
}

/**
 * Renames or removes a keyword argument in every call of `owner`. Formatting and comments are
 * kept: a comment in front of a removed argument usually describes the previous one, so it stays.
 * Renaming onto a name the call already passes would make it a duplicate, so the argument is
 * removed instead. A call passing the argument by position keeps it through a rename, and is left
 * for manual review by a removal.
 */
export const updateArgument = (sheet: SassStylesheet, owner: string, change: SassArgumentChange, match: NameMatch = 'suffix',
    kind?: MemberKind): SassChangeResult => {
    const result: SassChangeResult = { edits: [], manual: [] };
    const content = sheet.content;
    const eol = lineEnding(content);
    const name = normalizeName(change.name);
    const replaceWith = change.replaceWith ? normalizeName(change.replaceWith) : undefined;

    for (const call of sheet.findCalls(owner, { match, kind })) {
        const rawBody = content.substring(call.bodyStart, call.bodyEnd);
        // keep whatever sits in front of the closing bracket so the formatting is preserved
        const trailing = /\s*$/.exec(rawBody).pop();
        const body = rawBody.substring(0, rawBody.length - trailing.length);

        const params = splitArguments(body);
        const codeStarts = params.map(param => leadingCommentsEnd(param));
        const names = params.map((param, i) => {
            const passed = argumentName(param.substring(codeStarts[i]));
            return passed ? normalizeName(passed) : null;
        });
        if (change.remove && change.parameterIndex) {
            const positional = params.filter((param, i) => !names[i] && param.substring(codeStarts[i]).trim());
            const spreads = positional.some(param => param.trimEnd().endsWith('...'));
            if (spreads || positional.length >= change.parameterIndex) {
                result.manual.push({
                    index: call.nameStart,
                    message: `Remove the ${change.name} argument this call of ${owner}() passes `
                        + `${spreads ? 'in the arguments it spreads' : 'by position'}; the arguments after it move up one parameter.`
                });
            }
        }
        if (!names.includes(name)) {
            continue;
        }
        const duplicate = !!replaceWith && names.includes(replaceWith);

        let carried = '';
        const kept = params.reduce((arr, param, i) => {
            const codeStart = codeStarts[i];
            if (names[i] === name) {
                if (!change.remove && !duplicate) {
                    // the name sits at the code start, so renaming must not search the comments
                    arr.push(carried + commentBreak(carried, param, eol) + param.substring(0, codeStart)
                        + change.replaceWith + param.substring(codeStart + change.name.length));
                    carried = '';
                } else {
                    carried += param.substring(0, codeStart).trimEnd();
                }
            } else {
                arr.push(carried + commentBreak(carried, param, eol) + param);
                carried = '';
            }
            return arr;
        }, []);

        result.edits.push({
            start: call.bodyStart,
            end: call.bodyEnd,
            text: kept.join(',') + carried + commentBreak(carried, trailing, eol) + trailing
        });
    }

    return result;
};

/** An argument to add to calls of a function or mixin. */
export interface SassArgumentAddition {
    /** The argument, such as `$generator`. */
    name: string;
    /** The value to pass, as Sass source, such as `'legacy'`. */
    value: string;
    /** Adds the argument only where the owner is called as a function or included as a mixin. */
    kind?: MemberKind;
    /**
     * The argument's 1-based index in the owner's parameter list. It only detects calls that pass
     * the argument by position already, so they are left alone; the argument is always added by
     * name after the last one.
     */
    parameterIndex?: number;
}

/**
 * Adds a keyword argument to every call of `owner` that does not pass it already. A call with
 * its arguments on one line gets it after the last one; a call with one argument per line gets
 * it on a line of its own, in the same indentation. Trailing commas and a comment closing the
 * last argument's line are kept. A call that spreads its arguments cannot take another one after
 * them, so it is left for manual review.
 */
export const addArgument = (sheet: SassStylesheet, owner: string, addition: SassArgumentAddition, match: NameMatch = 'exact'): SassChangeResult => {
    const result: SassChangeResult = { edits: [], manual: [] };
    const content = sheet.content;
    // strings stay, since a string can be an argument, and comments are masked, since they are not
    const code = maskComments(content);
    const eol = lineEnding(content);
    const argument = `${addition.name}: ${addition.value}`;

    // the edits are insertions, so a call nested in another one of the owner gets its own
    for (const call of sheet.findCalls(owner, { match, kind: addition.kind, nested: true })) {
        const { bodyStart, bodyEnd } = call;
        const params = splitArguments(code.substring(bodyStart, bodyEnd));
        const separators: number[] = [];
        params.slice(0, -1).reduce((offset, param) => {
            separators.push(offset + param.length);
            return offset + param.length + 1;
        }, bodyStart);

        // a trailing comma leaves an empty last argument; the one before it is the real last one
        const trailingComma = params.length > 1 && !params[params.length - 1].trim();
        const passed = trailingComma ? params.slice(0, -1) : params;
        if (!passed.join('').trim()) {
            result.edits.push({ start: bodyStart, end: bodyEnd, text: argument });
            continue;
        }

        const names = passed.map(param => argumentName(param.trim()));
        if (names.some(passedName => passedName && normalizeName(passedName) === normalizeName(addition.name))) {
            continue;
        }
        if (passed[passed.length - 1].trimEnd().endsWith('...')) {
            result.manual.push({
                index: call.nameStart,
                message: `Add ${argument} to the arguments this call of ${owner}() spreads.`
            });
            continue;
        }
        if (addition.parameterIndex && names.filter(passedName => !passedName).length >= addition.parameterIndex) {
            continue;
        }

        const last = separators[separators.length - 1];
        const argStart = trailingComma
            ? (separators[separators.length - 2] ?? bodyStart - 1) + 1
            : (last === undefined ? bodyStart : last + 1);
        const lastArg = code.substring(argStart, trailingComma ? last : bodyEnd);
        const codeEnd = argStart + lastArg.trimEnd().length;
        const leading = /^\s*/.exec(lastArg)[0];

        if (!leading.includes('\n')) {
            // arguments on one line: append after the last one
            result.edits.push({ start: codeEnd, end: codeEnd, text: `, ${argument}` });
            continue;
        }

        // one argument per line: add a line in the same indentation, after any comment that
        // closes the last argument's line so the comma does not end up inside that comment
        const line = `${eol}${leading.substring(leading.lastIndexOf('\n') + 1)}${argument}${trailingComma ? ',' : ''}`;
        const anchor = trailingComma ? last + 1 : codeEnd;
        const lineEnd = content.indexOf('\n', anchor);
        const comma = trailingComma ? '' : ',';

        if (lineEnd === -1 || lineEnd > bodyEnd) {
            // the closing bracket shares the last argument's line
            result.edits.push({ start: anchor, end: anchor, text: comma + line });
        } else {
            if (comma) {
                result.edits.push({ start: codeEnd, end: codeEnd, text: comma });
            }
            const at = lineEnd - (content[lineEnd - 1] === '\r' ? 1 : 0);
            result.edits.push({ start: at, end: at, text: line });
        }
    }

    if (addition.kind !== 'function') {
        // an include without arguments gets them
        for (const include of sheet.findIncludes(owner, match)) {
            if (include.bodyStart === undefined) {
                result.edits.push({ start: include.nameEnd, end: include.nameEnd, text: `(${argument})` });
            }
        }
    }

    return result;
};

/**
 * Renames a variable wherever the stylesheet reads or declares it, including interpolations in
 * strings and references through a namespace. A name followed by a colon inside brackets is a
 * keyword argument, a map key or a parameter, none of which is the variable, so it is left.
 */
export const renameVariable = (sheet: SassStylesheet, name: string, replaceWith: string): SassChangeResult => {
    const result: SassChangeResult = { edits: [], manual: [] };
    const code = maskNonCode(sheet.content, true);
    const target = normalizeName(name);
    let depth = 0;
    let scanned = 0;

    for (const match of code.matchAll(/\$[\w-]+/g)) {
        for (; scanned < match.index; scanned++) {
            if (code[scanned] === '(' || code[scanned] === '[') {
                depth++;
            } else if (code[scanned] === ')' || code[scanned] === ']') {
                depth--;
            }
        }
        if (normalizeName(match[0]) !== target || /[\w$-]/.test(code[match.index - 1] ?? '')) {
            continue;
        }
        const end = match.index + match[0].length;
        if (depth > 0 && /^\s*:/.test(code.substring(end))) {
            continue;
        }
        result.edits.push({ start: match.index, end, text: replaceWith });
    }

    return result;
};

/**
 * Removes a variable the library no longer has. A declaration of it overrode the library's
 * value, so the statement goes, together with its line when it is alone on it. Any other
 * reference has no automatic replacement, so it is left for manual review.
 */
export const removeVariable = (sheet: SassStylesheet, name: string): SassChangeResult => {
    const result: SassChangeResult = { edits: [], manual: [] };
    const target = normalizeName(name);
    const code = maskNonCode(sheet.content, true);
    let depth = 0;
    let scanned = 0;

    for (const match of code.matchAll(/(?:[\w-]+\.)?\$[\w-]+/g)) {
        for (; scanned < match.index; scanned++) {
            if (code[scanned] === '(' || code[scanned] === '[') {
                depth++;
            } else if (code[scanned] === ')' || code[scanned] === ']') {
                depth--;
            }
        }
        const variable = match[0].substring(match[0].indexOf('$'));
        if (normalizeName(variable) !== target || /[\w$.-]/.test(code[match.index - 1] ?? '')) {
            continue;
        }

        const end = match.index + match[0].length;
        // a declaration starts a statement: after a delimiter, or at the start of a line in the
        // indented syntax, which has no delimiters
        const statementStart = sheet.indented ? /(^|\n)[ \t]*$/ : /(^|[;{}])\s*$/;
        const declaration = !depth && /^\s*:/.test(code.substring(end)) && statementStart.test(code.substring(0, match.index));
        if (declaration) {
            const statement = sheet.statementEnd(end, match.index);
            result.edits.push({ ...removalRange(sheet.content, match.index, statement.end), text: '' });
        } else if (!(depth && /^\s*:/.test(code.substring(end)))) {
            // a keyword argument or a map key of the same name is not the variable
            result.manual.push({ index: match.index, message: `Replace this reference to the removed variable ${name}.` });
        }
    }

    return result;
};

/** A change to the URL of a module the stylesheet loads with `@use` or `@forward`. */
export interface SassModuleChange {
    module: string;
    replaceWith?: string;
    remove?: boolean;
    /** With `remove`, a mixin of the module whose includes go with it. */
    member?: string;
}

/**
 * Moves or removes a module. A move rewrites the URL of every rule loading it. A removal drops
 * those rules, and with `member`, the includes of that mixin through each namespace the module
 * was used through; any other reference through such a namespace is left for manual review.
 */
export const updateModule = (sheet: SassStylesheet, change: SassModuleChange): SassChangeResult => {
    const result: SassChangeResult = { edits: [], manual: [] };
    const rules = sheet.findModuleRules().filter(rule => rule.url === change.module);

    if (change.replaceWith) {
        result.edits.push(...rules.map(rule => ({ start: rule.urlStart, end: rule.urlEnd, text: change.replaceWith })));
        return result;
    }
    if (!change.remove) {
        return result;
    }

    for (const rule of rules) {
        result.edits.push({ ...removalRange(sheet.content, rule.start, rule.end), text: '' });
        if (rule.keyword !== '@use') {
            continue;
        }
        if (rule.namespace === '*') {
            // a module used without a namespace gave its members bare names
            if (change.member) {
                const includes = removeIncludes(sheet, change.member, null);
                result.edits.push(...includes.edits);
                result.manual.push(...includes.manual);
            }
            continue;
        }

        let removed: SassInclude[] = [];
        if (change.member) {
            const includes = removeIncludes(sheet, change.member, rule.namespace);
            result.edits.push(...includes.edits);
            result.manual.push(...includes.manual);
            removed = sheet.findIncludes(change.member, 'exact').filter(include => include.namespace === rule.namespace);
        }

        const reference = new RegExp(`(?<![\\w$.-])${escapeRegExp(rule.namespace)}\\.[\\w$-]`, 'g');
        for (const match of sheet.code.matchAll(reference)) {
            if (!removed.some(include => include.start <= match.index && match.index < include.end)) {
                result.manual.push({
                    index: match.index,
                    message: `Replace this reference to the removed module ${change.module}.`
                });
            }
        }
    }

    return result;
};
