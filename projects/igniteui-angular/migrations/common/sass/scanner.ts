/**
 * Low-level scanning of Sass source. Every function here works on the original text and keeps
 * offsets intact, so its results can address the stylesheet directly.
 *
 * The scanner tells code from non-code the way Sass does: strings, with the interpolations in
 * them as code; `//` and `/* *\/` comments; and unquoted URLs, with their escapes and the
 * interpolations in them as code. A `url()` that holds anything else, such as `url($icon)`, is a
 * function call and so code. The context matrix in changes.spec.ts checks each case against the
 * Sass compiler.
 */

const URL_TOKEN = 'url(';

/** The line ending a stylesheet uses, so that inserted lines match the rest of it. */
export const lineEnding = (content: string): string => content.includes('\r\n') ? '\r\n' : '\n';

/**
 * Returns the index of the quote closing the string opened at `start`. A quote inside an
 * interpolation, such as `"#{map.get($m, "key")}"`, belongs to the interpolation.
 */
export const skipString = (content: string, start: number): number => {
    const quote = content[start];

    for (let i = start + 1; i < content.length; i++) {
        if (content[i] === '\\') {
            i++;
        } else if (content[i] === '#' && content[i + 1] === '{') {
            i = skipInterpolation(content, i + 2);
        } else if (content[i] === quote) {
            return i;
        }
    }

    return content.length;
};

const isUrlStart = (content: string, index: number): boolean => {
    if (content.substring(index, index + URL_TOKEN.length).toLowerCase() !== URL_TOKEN) {
        return false;
    }

    const previous = content[index - 1];

    return previous === undefined || !/[\w-]/.test(previous);
};

/** The characters Sass allows in an unquoted URL, besides escapes and interpolations. */
const isUrlChar = (char: string): boolean => {
    const code = char.charCodeAt(0);

    return char === '!' || char === '%' || char === '&' || char === '#' || (code >= 0x2a && code <= 0x7e) || code >= 0x80;
};

/**
 * Returns the index of the bracket closing an unquoted URL whose contents start at `start`, or -1
 * when the contents are not one. Sass reads `url()` as an unquoted URL only when it holds URL
 * characters, escapes and interpolations: `url(//cdn.example.com/bg.png)` is one, so its `//` does
 * not start a comment, while `url($icon)` and `url("bg.png")` are function calls.
 */
const skipUrl = (content: string, start: number): number => {
    let i = start;
    while (/\s/.test(content[i] ?? '')) {
        i++;
    }

    for (; i < content.length; i++) {
        const char = content[i];

        if (char === '\\') {
            i++;
        } else if (char === '#' && content[i + 1] === '{') {
            i = skipInterpolation(content, i + 2);
        } else if (char === ')') {
            return i;
        } else if (/\s/.test(char)) {
            while (/\s/.test(content[i] ?? '')) {
                i++;
            }
            return content[i] === ')' ? i : -1;
        } else if (!isUrlChar(char)) {
            return -1;
        }
    }

    return -1;
};

/** Returns the index of the bracket closing the unquoted URL that starts at `index`, or -1 when none does. */
const urlEnd = (content: string, index: number): number =>
    isUrlStart(content, index) ? skipUrl(content, index + URL_TOKEN.length) : -1;

/**
 * When a string, a comment or an unquoted URL starts at `index`, returns the index of its last
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

    return urlEnd(content, index);
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
 * the `#{...}` parts of quoted strings and unquoted URLs stay unmasked, because Sass evaluates
 * them as code.
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
        if (interpolation && content[i] !== '/') {
            // keep each interpolation, masking the literal text around it
            let from = i;
            for (let j = i + 1; j < nonCodeEnd; j++) {
                if (content[j] === '\\') {
                    j++;
                } else if (content[j] === '#' && content[j + 1] === '{') {
                    const close = Math.min(skipInterpolation(content, j + 2), nonCodeEnd - 1);
                    mask(from, j + 2);
                    // an interpolation holds code, with strings and comments of its own
                    parts.push(maskNonCode(content.substring(j + 2, close), true));
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
 * content is unbalanced. Brackets in strings, comments and unquoted URLs are ignored.
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
 * Strings, comments and unquoted URLs are scanned over, so a `','` inside one of them is not
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
