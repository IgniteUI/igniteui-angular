export class ExportUtilities {
    public static getKeysFromData(data: any[]) {
        const length = data.length;
        const dataEntry = data[0];
        const dataEntryMiddle = data[Math.floor(length / 2)];
        const dataEntryLast = data[length - 1];

        const keys1 = Object.keys(dataEntry);
        const keys2 = Object.keys(dataEntryMiddle);
        const keys3 = Object.keys(dataEntryLast);

        const keys = new Set(keys1.concat(keys2).concat(keys3));

        return keys.size !== 0 ? Array.from(keys) : [ "Column 1" ];
    }

    public static saveBlobToFile(blob: Blob, fileName) {
        const a = document.createElement("a");
        a.download = fileName;

        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    public static stringToArrayBuffer(s: string): ArrayBuffer {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            /* tslint:disable no-bitwise */
            view[i] = s.charCodeAt(i) & 0xFF;
            /* tslint:enable no-bitwise */
        }
        return buf;
    }
}
