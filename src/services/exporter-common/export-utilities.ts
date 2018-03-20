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
        const keysLength = keys.size;

        if (keysLength === 0) {
            return [];
        } else {
            return Array.from(keys);
        }
    }

    public static saveBlobToFile(blob: Blob, fileName, extension) {
        const a = document.createElement("a");
        a.download = fileName.includes(extension) ? fileName : fileName + extension;
        a.href = URL.createObjectURL(blob);
        a.click();
    }
}
