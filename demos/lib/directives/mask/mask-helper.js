export var MASK_FLAGS = ["C", "&", "a", "A", "?", "L", "9", "0", "#"];
export var KEYS = {
    Ctrl: 17,
    Z: 90,
    Y: 89,
    X: 88,
    BACKSPACE: 8,
    DELETE: 46
};
var MaskHelper = (function () {
    function MaskHelper() {
    }
    Object.defineProperty(MaskHelper.prototype, "cursor", {
        get: function () {
            return this._cursor;
        },
        enumerable: true,
        configurable: true
    });
    MaskHelper.prototype.parseValueByMask = function (value, maskOptions, cursor) {
        var inputValue = value;
        var mask = maskOptions.format;
        var literals = this.getMaskLiterals(mask);
        var literalKeys = Array.from(literals.keys());
        var nonLiteralIndeces = this.getNonLiteralIndeces(mask, literalKeys);
        if (inputValue.length < mask.length) {
            if (inputValue === "" && cursor === -1) {
                this._cursor = 0;
                return this.parseValueByMaskOnInit(value, maskOptions);
            }
            if (nonLiteralIndeces.indexOf(cursor + 1) !== -1) {
                inputValue = this.insertCharAt(inputValue, cursor + 1, maskOptions.promptChar);
                this._cursor = cursor + 1;
            }
            else {
                inputValue = this.insertCharAt(inputValue, cursor + 1, mask[cursor + 1]);
                this._cursor = cursor + 1;
                for (var i = this._cursor; i < 0; i--) {
                    if (literalKeys.indexOf(this._cursor) !== -1) {
                        this._cursor--;
                    }
                    else {
                        break;
                    }
                }
            }
        }
        else {
            var char = inputValue[cursor];
            var isCharValid = this.validateCharOnPostion(char, cursor, mask);
            if (nonLiteralIndeces.indexOf(cursor) !== -1) {
                inputValue = this.replaceCharAt(inputValue, cursor, "");
                if (isCharValid) {
                    inputValue = this.replaceCharAt(inputValue, cursor, char);
                    this._cursor = cursor + 1;
                }
                else {
                    this._cursor = cursor;
                }
            }
            else {
                inputValue = this.replaceCharAt(inputValue, cursor, "");
                this._cursor = ++cursor;
                for (var i = cursor; i < mask.length; i++) {
                    if (literalKeys.indexOf(this._cursor) !== -1) {
                        this._cursor = ++cursor;
                    }
                    else {
                        isCharValid = this.validateCharOnPostion(char, cursor, mask);
                        if (isCharValid) {
                            inputValue = this.replaceCharAt(inputValue, cursor, char);
                            this._cursor = ++cursor;
                            break;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        return inputValue;
    };
    MaskHelper.prototype.parseValueByMaskOnInit = function (inputVal, maskOptions) {
        var _this = this;
        var outputVal = "";
        var value = "";
        var mask = maskOptions.format;
        var literals = this.getMaskLiterals(mask);
        var literalKeys = Array.from(literals.keys());
        var nonLiteralIndeces = this.getNonLiteralIndeces(mask, literalKeys);
        var literalValues = Array.from(literals.values());
        if (inputVal != null) {
            value = inputVal.toString();
        }
        for (var _i = 0, mask_1 = mask; _i < mask_1.length; _i++) {
            var maskSym = mask_1[_i];
            outputVal += maskOptions.promptChar;
        }
        literals.forEach(function (val, key) {
            outputVal = _this.replaceCharAt(outputVal, key, val);
        });
        if (!value) {
            return outputVal;
        }
        var nonLiteralValues = this.getNonLiteralValues(value, literalValues);
        for (var i = 0; i < nonLiteralValues.length; i++) {
            var char = nonLiteralValues[i];
            var isCharValid = this.validateCharOnPostion(char, nonLiteralIndeces[i], mask);
            if (!isCharValid && char !== maskOptions.promptChar) {
                nonLiteralValues[i] = maskOptions.promptChar;
            }
        }
        if (nonLiteralValues.length > nonLiteralIndeces.length) {
            nonLiteralValues.splice(nonLiteralIndeces.length);
        }
        var pos = 0;
        for (var _a = 0, nonLiteralValues_1 = nonLiteralValues; _a < nonLiteralValues_1.length; _a++) {
            var nonLiteralValue = nonLiteralValues_1[_a];
            var char = nonLiteralValue;
            outputVal = this.replaceCharAt(outputVal, nonLiteralIndeces[pos++], char);
        }
        return outputVal;
    };
    MaskHelper.prototype.restoreValueFromMask = function (value, maskOptions) {
        var outputVal = "";
        var mask = maskOptions.format;
        var literals = this.getMaskLiterals(mask);
        var literalValues = Array.from(literals.values());
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var val = value_1[_i];
            if (literalValues.indexOf(val) === -1) {
                if (val !== maskOptions.promptChar) {
                    outputVal += val;
                }
            }
        }
        return outputVal;
    };
    MaskHelper.prototype.parseValueByMaskUponSelection = function (value, maskOptions, cursor, selection) {
        var isCharValid;
        var inputValue = value;
        var char = inputValue[cursor];
        var mask = maskOptions.format;
        var literals = this.getMaskLiterals(mask);
        var literalKeys = Array.from(literals.keys());
        var nonLiteralIndeces = this.getNonLiteralIndeces(mask, literalKeys);
        if (!this.data) {
            this._cursor = cursor < 0 ? ++cursor : cursor;
            if (nonLiteralIndeces.indexOf(this._cursor) !== -1) {
                isCharValid = this.validateCharOnPostion(char, this._cursor, mask);
                inputValue = isCharValid ? this.replaceCharAt(inputValue, this._cursor++, char) :
                    inputValue = this.replaceCharAt(inputValue, this._cursor++, maskOptions.promptChar);
                selection--;
                if (selection > 0) {
                    for (var i = 0; i < selection; i++) {
                        cursor++;
                        inputValue = nonLiteralIndeces.indexOf(cursor) !== -1 ?
                            this.insertCharAt(inputValue, cursor, maskOptions.promptChar) :
                            this.insertCharAt(inputValue, cursor, mask[cursor]);
                    }
                }
            }
            else {
                inputValue = this.replaceCharAt(inputValue, this._cursor, mask[this._cursor]);
                this._cursor++;
                selection--;
                var isMarked = false;
                if (selection > 0) {
                    cursor = this._cursor;
                    for (var i = 0; i < selection; i++) {
                        if (nonLiteralIndeces.indexOf(cursor) !== -1) {
                            isCharValid = this.validateCharOnPostion(char, cursor, mask);
                            if (isCharValid && !isMarked) {
                                inputValue = this.insertCharAt(inputValue, cursor, char);
                                cursor++;
                                this._cursor++;
                                isMarked = true;
                            }
                            else {
                                inputValue = this.insertCharAt(inputValue, cursor, maskOptions.promptChar);
                                cursor++;
                            }
                        }
                        else {
                            inputValue = this.insertCharAt(inputValue, cursor, mask[cursor]);
                            if (cursor === this._cursor) {
                                this._cursor++;
                            }
                            cursor++;
                        }
                    }
                }
            }
        }
        else {
            if (inputValue === "" && cursor === -1) {
                this._cursor = 0;
                return this.parseValueByMaskOnInit(value, maskOptions);
            }
            if (this._cursor < 0) {
                this._cursor++;
                cursor++;
            }
            cursor++;
            this._cursor = cursor;
            for (var i = 0; i < selection; i++) {
                if (nonLiteralIndeces.indexOf(cursor) !== -1) {
                    inputValue = this.insertCharAt(inputValue, cursor, maskOptions.promptChar);
                    cursor++;
                }
                else {
                    inputValue = this.insertCharAt(inputValue, cursor, mask[cursor]);
                    cursor++;
                }
            }
        }
        return inputValue;
    };
    MaskHelper.prototype.parseValueByMaskUponCopyPaste = function (value, maskOptions, cursor, clipboardData, selection) {
        var inputValue = value;
        var mask = maskOptions.format;
        var literals = this.getMaskLiterals(mask);
        var literalKeys = Array.from(literals.keys());
        var nonLiteralIndeces = this.getNonLiteralIndeces(mask, literalKeys);
        var selectionEnd = cursor + selection;
        this._cursor = cursor;
        for (var _i = 0, clipboardData_1 = clipboardData; _i < clipboardData_1.length; _i++) {
            var clipboardSym = clipboardData_1[_i];
            var char = clipboardSym;
            if (this._cursor > mask.length) {
                return inputValue;
            }
            if (nonLiteralIndeces.indexOf(this._cursor) !== -1) {
                var isCharValid = this.validateCharOnPostion(char, this._cursor, mask);
                if (isCharValid) {
                    inputValue = this.replaceCharAt(inputValue, this._cursor++, char);
                }
            }
            else {
                for (var i = cursor; i < mask.length; i++) {
                    if (literalKeys.indexOf(this._cursor) !== -1) {
                        this._cursor++;
                    }
                    else {
                        var isCharValid = this.validateCharOnPostion(char, this._cursor, mask);
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
            for (var i = this._cursor; i < selectionEnd; i++) {
                if (literalKeys.indexOf(this._cursor) !== -1) {
                    this._cursor++;
                }
                else {
                    inputValue = this.replaceCharAt(inputValue, this._cursor++, maskOptions.promptChar);
                }
            }
        }
        return inputValue;
    };
    MaskHelper.prototype.validateCharOnPostion = function (inputChar, position, mask) {
        var regex;
        var isValid;
        var letterOrDigitRegEx = "[\\d\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z]";
        var letterDigitOrSpaceRegEx = "[\\d\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z\\u0020]";
        var letterRegEx = "[\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z]";
        var letteSpaceRegEx = "[\\u00C0-\\u1FFF\\u2C00-\\uD7FFa-zA-Z\\u0020]";
        var digitRegEx = "[\\d]";
        var digitSpaceRegEx = "[\\d\\u0020]";
        var digitSpecialRegEx = "[\\d-\\+]";
        switch (mask.charAt(position)) {
            case "C":
                isValid = inputChar !== "";
                break;
            case "&":
                regex = new RegExp("[\\u0020]");
                isValid = !regex.test(inputChar);
                break;
            case "a":
                regex = new RegExp(letterDigitOrSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case "A":
                regex = new RegExp(letterOrDigitRegEx);
                isValid = regex.test(inputChar);
                break;
            case "?":
                regex = new RegExp(letteSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case "L":
                regex = new RegExp(letterRegEx);
                isValid = regex.test(inputChar);
                break;
            case "0":
                regex = new RegExp(digitRegEx);
                isValid = regex.test(inputChar);
                break;
            case "9":
                regex = new RegExp(digitSpaceRegEx);
                isValid = regex.test(inputChar);
                break;
            case "#":
                regex = new RegExp(digitSpecialRegEx);
                isValid = regex.test(inputChar);
                break;
            default: {
                isValid = null;
            }
        }
        return isValid;
    };
    MaskHelper.prototype.replaceCharAt = function (strValue, index, char) {
        if (strValue !== undefined) {
            return strValue.substring(0, index) + char + strValue.substring(index + 1);
        }
    };
    MaskHelper.prototype.insertCharAt = function (strValue, index, char) {
        if (strValue !== undefined) {
            return strValue.substring(0, index) + char + strValue.substring(index);
        }
    };
    MaskHelper.prototype.getMaskLiterals = function (mask) {
        var literals = new Map();
        for (var i = 0; i < mask.length; i++) {
            var char = mask.charAt(i);
            if (MASK_FLAGS.indexOf(char) === -1) {
                literals.set(i, char);
            }
        }
        return literals;
    };
    MaskHelper.prototype.getNonLiteralIndeces = function (mask, literalKeys) {
        var nonLiteralsIndeces = new Array();
        for (var i = 0; i < mask.length; i++) {
            if (literalKeys.indexOf(i) === -1) {
                nonLiteralsIndeces.push(i);
            }
        }
        return nonLiteralsIndeces;
    };
    MaskHelper.prototype.getNonLiteralValues = function (value, literalValues) {
        var nonLiteralValues = new Array();
        for (var _i = 0, value_2 = value; _i < value_2.length; _i++) {
            var val = value_2[_i];
            if (literalValues.indexOf(val) === -1) {
                nonLiteralValues.push(val);
            }
        }
        return nonLiteralValues;
    };
    return MaskHelper;
}());
export { MaskHelper };
