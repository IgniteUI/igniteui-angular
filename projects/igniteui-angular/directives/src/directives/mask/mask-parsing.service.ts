import { Injectable } from '@angular/core';


const FLAGS = new Set('aACL09#&?');
const REGEX = new Map([
    ['C', /(?!^$)/u], // Non-empty
    ['&', /[^\p{Separator}]/u], // Non-whitespace
    ['a', /[\p{Letter}\d\p{Separator}]/u], // Alphanumeric & whitespace
    ['A', /[\p{Letter}\d]/u], // Alphanumeric
    ['?', /[\p{Letter}\p{Separator}]/u], // Alpha & whitespace
    ['L', /\p{Letter}/u], // Alpha
    ['0', /\d/], // Numeric
    ['9', /[\d\p{Separator}]/u], // Numeric & whitespace
    ['#', /[\d\-+]/], // Numeric and sign
]);

/** @hidden */
export interface MaskOptions {
    format: string;
    promptChar: string;
}

/** @hidden */
export interface Replaced {
    value: string;
    end: number;
}

interface ParsedMask {
    literals: Map<number, string>,
    mask: string
}

const replaceCharAt = (string: string, idx: number, char: string) =>
    `${string.substring(0, idx)}${char}${string.substring(idx + 1)}`;


export function parseMask(format: string): ParsedMask {
    const literals = new Map<number, string>();
    let mask = format;

    for (let i = 0, j = 0; i < format.length; i++, j++) {
        const [current, next] = [format.charAt(i), format.charAt(i + 1)];

        if (current === '\\' && FLAGS.has(next)) {
            mask = replaceCharAt(mask, j, '');
            literals.set(j, next);
            i++;
        } else {
            if (!FLAGS.has(current)) {
                literals.set(j, current);
            }
        }
    }

    return { literals, mask };
}

/** @hidden */
@Injectable({
    providedIn: 'root'
})
export class MaskParsingService {

    public applyMask(inputVal: string, maskOptions: MaskOptions, pos = 0): string {
        let outputVal = '';
        let value = '';
        const { literals, mask } = parseMask(maskOptions.format);
        const literalKeys: number[] = Array.from(literals.keys());
        const nonLiteralIndices: number[] = this.getNonLiteralIndices(mask, literalKeys);
        const literalValues: string[] = Array.from(literals.values());

        if (inputVal != null) {
            value = inputVal.toString();
        }

        for (const _maskSym of mask) {
            outputVal += maskOptions.promptChar;
        }

        literals.forEach((val: string, key: number) => {
            outputVal = replaceCharAt(outputVal, key, val);
        });

        if (!value) {
            return outputVal;
        }

        const nonLiteralValues: string[] = this.getNonLiteralValues(value, literalValues);

        for (let i = 0; i < nonLiteralValues.length; i++) {
            const char = nonLiteralValues[i];
            const isCharValid = this.validateCharOnPosition(char, nonLiteralIndices[i], mask);

            if (!isCharValid && char !== maskOptions.promptChar) {
                nonLiteralValues[i] = maskOptions.promptChar;
            }
        }

        if (nonLiteralValues.length > nonLiteralIndices.length) {
            nonLiteralValues.splice(nonLiteralIndices.length);
        }

        for (const nonLiteralValue of nonLiteralValues) {
            const char = nonLiteralValue;
            outputVal = replaceCharAt(outputVal, nonLiteralIndices[pos++], char);
        }

        return outputVal;
    }

    public parseValueFromMask(maskedValue: string, maskOptions: MaskOptions): string {
        let outputVal = '';
        const literalValues: string[] = Array.from(parseMask(maskOptions.format).literals.values());

        for (const val of maskedValue) {
            if (literalValues.indexOf(val) === -1) {
                if (val !== maskOptions.promptChar) {
                    outputVal += val;
                }
            }
        }

        return outputVal;
    }

    public replaceInMask(maskedValue: string, value: string, maskOptions: MaskOptions, start: number, end: number): Replaced {
        const { literals, mask } = parseMask(maskOptions.format);
        const literalsPositions = Array.from(literals.keys());
        value = this.replaceIMENumbers(value);
        const chars = Array.from(value);
        let cursor = start;
        end = Math.min(end, maskedValue.length);

        for (let i = start; i < end || (chars.length && i < maskedValue.length); i++) {
            if (literalsPositions.indexOf(i) !== -1) {
                if (chars[0] === maskedValue[i] || value.length < 1) {
                    cursor = i + 1;
                    chars.shift();
                }
                continue;
            }
            if (chars[0]
                && !this.validateCharOnPosition(chars[0], i, mask)
                && chars[0] !== maskOptions.promptChar) {
                break;
            }

            let char = maskOptions.promptChar;
            if (chars.length) {
                cursor = i + 1;
                char = chars.shift();
            }
            if (value.length < 1) {
                // on `delete` the cursor should move forward
                cursor++;
            }
            maskedValue = replaceCharAt(maskedValue, i, char);
        }

        return { value: maskedValue, end: cursor };
    }

    /** Validates only non literal positions. */
    private validateCharOnPosition(inputChar: string, position: number, mask: string): boolean {
        const regex = REGEX.get(mask.charAt(position));
        return regex ? regex.test(inputChar) : false;
    }

    private getNonLiteralIndices(mask: string, literalKeys: number[]): number[] {
        const nonLiteralsIndices: number[] = [];

        for (let i = 0; i < mask.length; i++) {
            if (literalKeys.indexOf(i) === -1) {
                nonLiteralsIndices.push(i);
            }
        }

        return nonLiteralsIndices;
    }
    private getNonLiteralValues(value: string, literalValues: string[]): string[] {
        const nonLiteralValues: string[] = [];

        for (const val of value) {
            if (literalValues.indexOf(val) === -1) {
                nonLiteralValues.push(val);
            }
        }

        return nonLiteralValues;
    }

    private replaceIMENumbers(value: string): string {
        return value.replace(/[０１２３４５６７８９]/g, (num) => ({
            '１': '1', '２': '2', '３': '3', '４': '4', '５': '5',
            '６': '6', '７': '7', '８': '8', '９': '9', '０': '0'
        }[num]));
    }
}
