import * as JSZip from "jszip/dist/jszip";

export class ExcelExportEndedEventArgs {
    constructor(public xlsx: JSZip) {
    }
}
