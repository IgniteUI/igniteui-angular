/**
 * @hidden
 */
export const MASK_FLAGS = [ 'C', '&', 'a', 'A', '?', 'L', '9', '0', '#' ];

/**
 * @hidden
 */
export const KEYS = {
    Ctrl : 17,
    Z : 90,
    Y : 89,
    X : 88,
    BACKSPACE : 8,
    DELETE : 46
  };


/**
 * @hidden
 */
export class MaskHelper {
    private _cursor;
    public get cursor() {
        return this._cursor;
    }
    public data: boolean;

    public parseValueByMask(value, maskOptions, cursor): string {
        let inputValue: string = value;
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);
        const literalKeys: number[] = Array.from(literals.keys());
        const nonLiteralIndeces: number[] = this.getNonLiteralIndeces(mask, literalKeys);

        if (inputValue.length < mask.length) { // BACKSPACE, DELETE
            if (inputValue === '' && cursor === -1) {
                this._cursor = 0;
                return this.parseValueByMaskOnInit(value, maskOptions);
            } // workaround for IE 'x' button

            if (nonLiteralIndeces.indexOf(cursor + 1) !== -1) {
                inputValue = this.insertCharAt(inputValue, cursor + 1, maskOptions.promptChar);
                this._cursor = cursor + 1;
            } else {
                inputValue = this.insertCharAt(inputValue, cursor + 1, mask[cursor + 1]);
                this._cursor = cursor + 1;
                for (let i = this._cursor; i < 0; i--) {
                    if (literalKeys.indexOf(this._cursor) !== -1) {
                        this._cursor--;
                    } else {
                        break;
                    }
                }
            }
        } else {
            const char = inputValue[cursor];
            let isCharValid = this.validateCharOnPostion(char, cursor, mask);
            if (nonLiteralIndeces.indexOf(cursor) !== -1) {
                inputValue = this.replaceCharAt(inputValue, cursor, '');
                if (isCharValid) {
                    inputValue = this.replaceCharAt(inputValue, cursor, char);
                    this._cursor = cursor + 1;
                } else {
                    this._cursor = cursor;
                }
            } else {
                inputValue = this.replaceCharAt(inputValue, cursor, '');
                this._cursor = ++cursor;
                for (let i = cursor; i < mask.length; i++) {
                    if (literalKeys.indexOf(this._cursor) !== -1) {
                        this._cursor = ++cursor;
                    } else {
                        isCharValid = this.validateCharOnPostion(char, cursor, mask);
                        if (isCharValid) {
                            inputValue = this.replaceCharAt(inputValue, cursor, char);
                            this._cursor = ++cursor;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        return inputValue;
    }

    public parseMask(maskOptions): string {
        let outputVal = '';
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);

        for (const maskSym of mask) {
            outputVal += maskOptions.promptChar;
        }

        literals.forEach((val: string, key: number) => {
            outputVal = this.replaceCharAt(outputVal, key, val);
        });

        return outputVal;
    }

    public parseValueByMaskOnInit(inputVal, maskOptions): string {
        let outputVal = '';
        let value = '';
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);
        const literalKeys: number[] = Array.from(literals.keys());
        const nonLiteralIndeces: number[] = this.getNonLiteralIndeces(mask, literalKeys);
        const literalValues: string[] = Array.from(literals.values());

        if (inputVal != null) {
            value = inputVal.toString();
        }

        for (const maskSym of mask) {
            outputVal += maskOptions.promptChar;
        }

        literals.forEach((val: string, key: number) => {
            outputVal = this.replaceCharAt(outputVal, key, val);
        });

        if (!value) {
            return outputVal;
        }

        const nonLiteralValues: string[] = this.getNonLiteralValues(value, literalValues);

        for (let i = 0; i < nonLiteralValues.length; i++) {
            const char = nonLiteralValues[i];
            const isCharValid = this.validateCharOnPostion(char, nonLiteralIndeces[i], mask);

            if (!isCharValid && char !== maskOptions.promptChar) {
                nonLiteralValues[i] = maskOptions.promptChar;
            }
        }

        if (nonLiteralValues.length > nonLiteralIndeces.length) {
            nonLiteralValues.splice(nonLiteralIndeces.length);
        }

        let pos = 0;
        for (const nonLiteralValue of nonLiteralValues) {
            const char = nonLiteralValue;
            outputVal = this.replaceCharAt(outputVal, nonLiteralIndeces[pos++], char);
        }

        return outputVal;
    }

    public restoreValueFromMask(value, maskOptions): string {
        let outputVal = '';
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);
        const literalValues: string[] = Array.from(literals.values());

        for (const val of value) {
            if (literalValues.indexOf(val) === -1) {
                if (val !== maskOptions.promptChar) {
                    outputVal += val;
                }
            }
        }

        return outputVal;
    }

    public parseValueByMaskUponSelection(value, maskOptions, cursor, selection): string {
        let isCharValid: boolean;
        let inputValue: string = value;
        const char: string = inputValue[cursor];
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);
        const literalKeys: number[] = Array.from(literals.keys());
        const nonLiteralIndeces: number[] = this.getNonLiteralIndeces(mask, literalKeys);

        if (!this.data) {
            this._cursor = cursor < 0 ? ++cursor : cursor;
            if (nonLiteralIndeces.indexOf(this._cursor) !== -1) {
                isCharValid = this.validateCharOnPostion(char, this._cursor, mask);
                inputValue = isCharValid ? this.replaceCharAt(inputValue, this._cursor++, char) :
                    inputValue = this.replaceCharAt(inputValue, this._cursor++, maskOptions.promptChar);
                selection--;
                if (selection > 0) {
                    for (let i = 0; i < selection; i++) {
                        cursor++;
                        inputValue = nonLiteralIndeces.indexOf(cursor) !== -1 ?
                            this.insertCharAt(inputValue, cursor, maskOptions.promptChar) :
                            this.insertCharAt(inputValue, cursor, mask[cursor]);
                    }
                }
            } else {
                inputValue = this.replaceCharAt(inputValue, this._cursor, mask[this._cursor]);
                this._cursor++;
                selection--;
                let isMarked = false;
                if (selection > 0) {
                    cursor = this._cursor;
                    for (let i = 0; i < selection; i++) {
                        if (nonLiteralIndeces.indexOf(cursor) !== -1) {
                            isCharValid = this.validateCharOnPostion(char, cursor, mask);
                            if (isCharValid && !isMarked) {
                                inputValue = this.insertCharAt(inputValue, cursor, char);
                                cursor++;
                                this._cursor++;
                                isMarked = true;
                            } else {
                                inputValue = this.insertCharAt(inputValue, cursor, maskOptions.promptChar);
                                cursor++;
                            }
                        } else {
                            inputValue = this.insertCharAt(inputValue, cursor, mask[cursor]);
                            if (cursor === this._cursor) {
                                this._cursor++;
                            }
                            cursor++;
                        }
                    }
                }
            }
        } else {
            if (inputValue === '' && cursor === -1) {
                this._cursor = 0;
                return this.parseValueByMaskOnInit(value, maskOptions);
            } // workaround for IE 'x' button

            if (this._cursor < 0) {
                this._cursor++;
                cursor++;
            }
            cursor++;
            this._cursor = cursor;
            for (let i = 0; i < selection; i++) {
                if (nonLiteralIndeces.indexOf(cursor) !== -1) {
                    inputValue = this.insertCharAt(inputValue, cursor, maskOptions.promptChar);
                    cursor++;
                } else {
                    inputValue = this.insertCharAt(inputValue, cursor, mask[cursor]);
                    cursor++;
                }
            }
        }

        return inputValue;
    }

    public parseValueByMaskUponCopyPaste(value, maskOptions, cursor, clipboardData, selection): string {
        let inputValue: string = value;
        const mask: string = maskOptions.format;
        const literals: Map<number, string> = this.getMaskLiterals(mask);
        const literalKeys: number[] = Array.from(literals.keys());
        const nonLiteralIndeces: number[] = this.getNonLiteralIndeces(mask, literalKeys);

        const selectionEnd = cursor + selection;

        this._cursor = cursor;
        for (const clipboardSym of clipboardData) {
            const char = clipboardSym;

            if (this._cursor > mask.length) {
                return inputValue;
            }

            if (nonLiteralIndeces.indexOf(this._cursor) !== -1) {
                const isCharValid = this.validateCharOnPostion(char, this._cursor, mask);
                if (isCharValid) {
                    inputValue = this.replaceCharAt(inputValue, this._cursor++, char);
                }
            } else {
                for (let i = cursor; i < mask.length; i++) {
                    if (literalKeys.indexOf(this._cursor) !== -1) {
                        this._cursor++;
                    } else {
                        const isCharValid = this.validateCharOnPostion(char, this._cursor, mask);
                        if (isCharValid) {
                            inputValue = this.replaceCharAt(inputValue, this._cursor++, char);
                        }
                        break;
                    }
                }
            }

            selection--;
        }

        if (selection > 0) {
            for (let i = this._cursor; i < selectionEnd; i++) {
                if (literalKeys.indexOf(this._cursor) !== -1) {
                    this._cursor++;
                } else {
                    inputValue = this.replaceCharAt(inputValue, this._cursor++, maskOptions.promptChar);
                }
            }
        }

        return inputValue;
    }

    private validateCharOnPostion(inputChar: string, position: number, mask: string): boolean {
        let regex: RegExp;
        let isValid: boolean;
        const letterOrDigitRegEx = '[\\d\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z]';
        const letterDigitOrSpaceRegEx = '[\\d\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z\\u0020]';
        const letterRegEx = '[\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z]';
        const letteSpaceRegEx = '[\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z\\u0020]';
        const digitRegEx = '[\\d]';
        const digitSpaceRegEx = '[\\d\\u0020]';
        const digitSpecialRegEx = '[\\d-\\+]';

        switch (mask.charAt(position)) {
            case 'C':
                isValid = inputChar !== '';
                break;
            case '&':
                regex = new RegExp('[\\u0020]');
                isValid = !regex.test(inputChar);
                break;
            case 'a':
                regex = new RegExp(letterDigitOrSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case 'A':
                regex = new RegExp(letterOrDigitRegEx);
                isValid = regex.test(inputChar);
                break;
            case '?':
                regex = new RegExp(letteSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case 'L':
                regex = new RegExp(letterRegEx);
                isValid = regex.test(inputChar);
                break;
            case '0':
                regex = new RegExp(digitRegEx);
                isValid = regex.test(inputChar);
                break;
            case '9':
                regex = new RegExp(digitSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case '#':
                regex = new RegExp(digitSpecialRegEx);
                isValid = regex.test(inputChar);
                break;
            default: {
                isValid = null;
            }
        }

        return isValid;
    }
    private replaceCharAt(strValue: string, index: number, char: string): string {
        if (strValue !== undefined) {
            return strValue.substring(0, index) + char + strValue.substring(index + 1);
        }
    }
    private insertCharAt(strValue: string, index: number, char: string): string {
        if (strValue !== undefined) {
            return strValue.substring(0, index) + char + strValue.substring(index);
        }
    }
    private getMaskLiterals(mask: string): Map<number, string> {
        const literals = new Map<number, string>();

        for (let i = 0; i < mask.length; i++) {
            const char = mask.charAt(i);
            if (MASK_FLAGS.indexOf(char) === -1) {
                literals.set(i, char);
            }
        }

        return literals;
    }
    private getNonLiteralIndeces(mask: string, literalKeys: number[]): number[] {
        const nonLiteralsIndeces: number[] = new Array();

        for (let i = 0; i < mask.length; i++) {
            if (literalKeys.indexOf(i) === -1) {
                nonLiteralsIndeces.push(i);
            }
        }

        return nonLiteralsIndeces;
    }
    private getNonLiteralValues(value: string, literalValues: string[]): string[] {
        const nonLiteralValues: string[] = new Array();

        for (const val of value) {
            if (literalValues.indexOf(val) === -1) {
                nonLiteralValues.push(val);
            }
        }

        return nonLiteralValues;
    }
}
