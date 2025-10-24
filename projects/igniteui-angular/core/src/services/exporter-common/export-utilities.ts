/**
 * @hidden
 */
export class ExportUtilities {
    public static getKeysFromData(data: any[]) {
        const length = data.length;
        if (length === 0) {
            return [];
        }

        const dataEntry = data[0];
        const dataEntryMiddle = data[Math.floor(length / 2)];
        const dataEntryLast = data[length - 1];

        const keys1 = Object.keys(dataEntry);
        const keys2 = Object.keys(dataEntryMiddle);
        const keys3 = Object.keys(dataEntryLast);

        const keys = new Set(keys1.concat(keys2).concat(keys3));

        return !ExportUtilities.isSpecialData(dataEntry) ? Array.from(keys) : ['Column 1'];
    }

    public static saveBlobToFile(blob: Blob, fileName) {
        const doc = globalThis.document;
        const a = doc.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.download = fileName;

        a.href = url;
        doc.body.appendChild(a);
        a.click();
        doc.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    public static stringToArrayBuffer(s: string): ArrayBuffer {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }

    public static isSpecialData(data: any): boolean {
        return (typeof data === 'string' ||
            typeof data === 'number' ||
            data instanceof Date);
    }

    public static hasValue(value: any): boolean {
        return value !== undefined && value !== null;
    }

    public static isNullOrWhitespaces(value: string): boolean {
        return value === undefined || value === null || !value.trim();
    }

    public static sanitizeValue(value: any): string {
        if (!this.hasValue(value)) {
            return '';
        } else {
            const stringValue = String(value);
            return stringValue.replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;')
                              .replace(/'/g, '&apos;')
                              // Bug #14944 - Remove the not supported null character (\u0000, \x00)
                              .replace(/\x00/g, '');
        }
    }
}
