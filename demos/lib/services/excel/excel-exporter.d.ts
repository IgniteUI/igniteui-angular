import * as JSZip from "jszip/dist/jszip";
import { EventEmitter } from "@angular/core";
import { IgxExcelExporterOptions } from "./excel-exporter-options";
import { IgxBaseExporter } from "../exporter-common/base-export-service";
export interface IExcelExportEndedEventArgs {
    xlsx: JSZip;
}
export declare class IgxExcelExporterService extends IgxBaseExporter {
    private static ZIP_OPTIONS;
    private static DATA_URL_PREFIX;
    private _xlsx;
    onExportEnded: EventEmitter<IExcelExportEndedEventArgs>;
    private static populateFolder(folder, zip, worksheetData);
    protected exportDataImplementation(data: any[], options: IgxExcelExporterOptions): void;
    private saveFile(data, fileName);
}
