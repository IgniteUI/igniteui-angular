/**
 * @hidden
 */
export class SaveUtilities {
    public static saveBlobToFile(blob: Blob, fileName) {
        const a = document.createElement('a');
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            const url = window.URL.createObjectURL(blob);
            a.download = fileName;

            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }
}
