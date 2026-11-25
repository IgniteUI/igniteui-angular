import { describe, it, expect } from 'vitest';
import { MaskOptions, MaskParsingService } from './mask-parsing.service';

describe('MaskParsingService', () => {
    const parser = new MaskParsingService();
    const options = (format: string): MaskOptions => ({ format, promptChar: '_' });

    describe('astral characters', () => {
        // U+1F600, U+20BB7 (a letter) and U+1D7D9 (a decimal digit) take two UTF-16 code units each.
        const astral = ['😀', '𠮷', '𝟙'];

        it('should reject an astral character in replaceInMask and keep the mask length', () => {
            expect(parser.replaceInMask('___', '😀', options('CCC'), 0, 0)).toEqual({ value: '___', end: 0 });
        });

        it('should reject an astral character for each mask flag', () => {
            for (const flag of 'aACL09#&?') {
                for (const char of astral) {
                    expect(parser.replaceInMask('_', char, options(flag), 0, 0), `${char} in ${flag}`)
                        .toEqual({ value: '_', end: 0 });
                    expect(parser.applyMask(char, options(flag)), `${char} in ${flag}`).toEqual('_');
                }
            }
        });

        it('should reject a lone surrogate', () => {
            expect(parser.replaceInMask('___', '\uD83D', options('CCC'), 0, 0)).toEqual({ value: '___', end: 0 });
            expect(parser.replaceInMask('___', '\uDE00', options('CCC'), 0, 0)).toEqual({ value: '___', end: 0 });
        });

        it('should keep the selected text when an astral character replaces it', () => {
            expect(parser.replaceInMask('abc', '😀', options('CCC'), 0, 3)).toEqual({ value: 'abc', end: 0 });
        });

        it('should stop at an astral character as at any other invalid character', () => {
            const replaced = parser.replaceInMask('(__) __', 'ab😀cd', options('(CC) CC'), 0, 0);

            expect(replaced).toEqual({ value: '(ab) __', end: 3 });
            expect(replaced.value.length).toEqual(7);
        });

        it('should leave a prompt for an astral character in applyMask', () => {
            expect(parser.applyMask('😀ab', options('CCC'))).toEqual('_ab');
            expect(parser.applyMask('a😀b', options('(CC) C'))).toEqual('(a_) b');
            expect(parser.applyMask('😀😀😀', options('CC-C'))).toEqual('__-_');
        });

        it('should still accept characters of one code unit', () => {
            expect(parser.replaceInMask('___', '中я❤', options('CCC'), 0, 0)).toEqual({ value: '中я❤', end: 3 });
            expect(parser.applyMask('中я❤', options('CCC'))).toEqual('中я❤');
        });
    });
});
