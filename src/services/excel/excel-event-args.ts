import * as JSZip from "jszip/dist/jszip";

export class ExportEndedEventArgs {
    constructor(public xlsx: JSZip) {
    }
}
