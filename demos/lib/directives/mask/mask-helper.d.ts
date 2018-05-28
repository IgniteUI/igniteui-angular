export declare const MASK_FLAGS: string[];
export declare const KEYS: {
    Ctrl: number;
    Z: number;
    Y: number;
    X: number;
    BACKSPACE: number;
    DELETE: number;
};
export declare class MaskHelper {
    private _cursor;
    readonly cursor: any;
    data: boolean;
    parseValueByMask(value: any, maskOptions: any, cursor: any): string;
    parseValueByMaskOnInit(inputVal: any, maskOptions: any): string;
    restoreValueFromMask(value: any, maskOptions: any): string;
    parseValueByMaskUponSelection(value: any, maskOptions: any, cursor: any, selection: any): string;
    parseValueByMaskUponCopyPaste(value: any, maskOptions: any, cursor: any, clipboardData: any, selection: any): string;
    private validateCharOnPostion(inputChar, position, mask);
    private replaceCharAt(strValue, index, char);
    private insertCharAt(strValue, index, char);
    private getMaskLiterals(mask);
    private getNonLiteralIndeces(mask, literalKeys);
    private getNonLiteralValues(value, literalValues);
}
