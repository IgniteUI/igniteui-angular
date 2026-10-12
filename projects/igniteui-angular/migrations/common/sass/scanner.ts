/**
 * Low-level scanning of Sass source. Every function here works on the original text and keeps
 * offsets intact, so its results can address the stylesheet directly.
 */

const URL_TOKEN = 'url(';

/** The line ending a stylesheet uses, so that inserted lines match the rest of it. */
export const lineEnding = (content: string): string => content.includes('\r\n') ? '\r\n' : '\n';

/** Returns the index of the quote closing the string opened at `start`. */
export const skipString = (content: string, start: number): number => {
    const quote = content[start];

    for (let i = start + 1; i < content.length; i++) {
        if (content[i] === '\\') {
            i++;
        } else if (content[i] === quote) {
            return i;
        }
    }

    return content.length;
};

/**
 * Sass parses an unquoted `url()` as a single token, so a `//` inside one is part of the
 * address - `url(//cdn.example.com/bg.png)` - and not the start of a comment.
 */
const isUrlToken = (content: string, index: number): boolean => {
    if (content.substring(index, index + URL_TOKEN.length).toLowerCase() !== URL_TOKEN) {
        return false;
    }

    const previous = content[index - 1];

    return previous === undefined || !/[\w-]/.test(previous);
};

/** Returns the index of the bracket closing a `url(` whose contents start at `start`. */
const skipUrl = (content: string, start: number): number => {
    for (let i = start; i < content.length; i++) {
        const char = content[i];

        if (char === '\'' || char === '"') {
            i = skipString(content, i);
        } else if (char === ')') {
            return i;
        }
    }

    return content.length;
};

/**
 * When a string, a comment or a `url()` token starts at `index`, returns the index of its last
 * character so that a scan can carry on past it. Returns -1 when `index` is on code.
 */
export const skipNonCode = (content: string, index: number): number => {
    const char = content[index];
    const next = content[index + 1];

    if (char === '\'' || char === '"') {
        return skipString(content, index);
    }
    if (char === '/' && next === '*') {
        const end = content.indexOf('*/', index + 2);

        return end === -1 ? content.length : end + 1;
    }
    if (char === '/' && next === '/') {
        const end = content.indexOf('\n', index + 2);

        return end === -1 ? content.length : end;
    }
    if (isUrlToken(content, index)) {
        return skipUrl(content, index + URL_TOKEN.length);
    }

    return -1;
};

/** Returns the index of the brace closing an interpolation whose contents start at `start`. */
const skipInterpolation = (content: string, start: number): number => {
    let level = 0;

    for (let i = start; i < content.length; i++) {
        const nonCodeEnd = skipNonCode(content, i);
        if (nonCodeEnd !== -1) {
            i = nonCodeEnd;
        } else if (content[i] === '{') {
            level++;
        } else if (content[i] === '}') {
            if (!level) {
                return i;
            }
            level--;
        }
    }

    return content.length;
};

/**
 * Masks non-code with whitespace, preserving offsets and line endings. With `interpolation`,
 * the `#{...}` parts of quoted strings stay unmasked, because Sass evaluates them as code.
 */
export const maskNonCode = (content: string, interpolation = false): string => {
    const parts: string[] = [];
    let start = 0;
    const mask = (from: number, to: number) => parts.push(content.substring(from, to).replace(/[^\r\n]/g, ' '));

    for (let i = 0; i < content.length; i++) {
        const nonCodeEnd = skipNonCode(content, i);
        if (nonCodeEnd === -1) {
            continue;
        }

        parts.push(content.substring(start, i));
        if (interpolation && (content[i] === '\'' || content[i] === '"')) {
            // keep each interpolation, masking the literal text around it
            let from = i;
            for (let j = i + 1; j < nonCodeEnd; j++) {
                if (content[j] === '\\') {
                    j++;
                } else if (content[j] === '#' && content[j + 1] === '{') {
                    const close = Math.min(skipInterpolation(content, j + 2), nonCodeEnd - 1);
                    mask(from, j + 2);
                    parts.push(content.substring(j + 2, close));
                    from = close;
                    j = close;
                }
            }
            mask(from, nonCodeEnd + 1);
        } else {
            mask(i, nonCodeEnd + 1);
        }
        start = nonCodeEnd + 1;
        i = nonCodeEnd;
    }

    parts.push(content.substring(start));
    return parts.join('');
};

/** Masks comments with whitespace, preserving offsets and line endings, and keeps strings. */
export const maskComments = (content: string): string => {
    let result = '';
    let start = 0;

    for (let i = 0; i < content.length; i++) {
        const nonCodeEnd = skipNonCode(content, i);
        if (nonCodeEnd === -1) {
            continue;
        }
        if (content[i] === '/') {
            result += content.substring(start, i) + content.substring(i, nonCodeEnd + 1).replace(/[^\r\n]/g, ' ');
            start = nonCodeEnd + 1;
        }
        i = nonCodeEnd;
    }

    return result + content.substring(start);
};

/**
 * Returns the index of the bracket closing the one `start` is inside of, or -1 when the
 * content is unbalanced. Brackets in strings, comments and `url()` tokens are ignored.
 */
export const findClosingBracket = (content: string, start: number): number => {
    let level = 0;

    for (let i = start; i < content.length; i++) {
        const nonCodeEnd = skipNonCode(content, i);
        if (nonCodeEnd !== -1) {
            i = nonCodeEnd;
            continue;
        }

        const char = content[i];
        if (char === '(') {
            level++;
        } else if (char === ')') {
            if (!level) {
                return i;
            }
            level--;
        }
    }

    return -1;
};

/**
 * Safe split of an argument list by `','`, considering inner calls, maps, lists and
 * interpolations. E.g.:
 * ```
 * prop: inner-func(),
 * prop2: inner2(inner-param: 3, inner-param: inner-func(..)),
 * prop3: [1px, 2px],
 * prop4: #{$a, $b}
 * ```
 *
 * Strings, comments and `url()` tokens are scanned over, so a `','` inside one of them is not
 * taken for an argument separator.
 */
export const splitArguments = (body: string): string[] => {
    const parts = [];
    let lastIndex = 0;
    let level = 0;

    for (let i = 0; i < body.length; i++) {
        const nonCodeEnd = skipNonCode(body, i);
        if (nonCodeEnd !== -1) {
            i = nonCodeEnd;
            continue;
        }

        const char = body[i];
        if (char === '(' || char === '[' || char === '{') {
            level++;
        } else if (char === ')' || char === ']' || char === '}') {
            level--;
        } else if (char === ',' && !level) {
            parts.push(body.substring(lastIndex, i));
            lastIndex = i + 1;
        }
    }
    parts.push(body.substring(lastIndex));
    return parts;
};

/** Index where an argument's code starts, after its leading whitespace and comments. */
export const leadingCommentsEnd = (param: string): number => {
    let i = 0;
    while (i < param.length) {
        if (/\s/.test(param[i])) {
            i++;
        } else if (param[i] === '/' && (param[i + 1] === '/' || param[i + 1] === '*')) {
            i = skipNonCode(param, i) + 1;
        } else {
            break;
        }
    }
    return i;
};

/** The line break a carried `//` comment needs so that it does not swallow what follows it. */
export const commentBreak = (carried: string, next: string, eol: string): string =>
    /\/\/[^\n]*$/.test(carried) && !/^[ \t]*\r?\n/.test(next) ? eol : '';

/** The name a keyword argument passes, such as `$color` for `$color: red`, or null for a positional one. */
export const argumentName = (code: string): string | null => {
    const match = /^(\$[\w-]+)\s*:/.exec(code);
    return match ? match[1] : null;
};

/** Sass treats underscores and hyphens in identifiers as the same character. */
export const normalizeName = (name: string): string => name.replace(/_/g, '-');
