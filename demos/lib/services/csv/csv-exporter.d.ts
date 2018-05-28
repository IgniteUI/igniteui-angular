import { EventEmitter } from "@angular/core";
import { IgxBaseExporter } from "../exporter-common/base-export-service";
import { IgxCsvExporterOptions } from "./csv-exporter-options";
export interface ICsvExportEndedEventArgs {
    csvData: string;
}
export declare class IgxCsvExporterService extends IgxBaseExporter {
    private _stringData;
    onExportEnded: EventEmitter<ICsvExportEndedEventArgs>;
    protected exportDataImplementation(data: any[], options: IgxCsvExporterOptions): void;
    private saveFile(options);
    private exportFile(data, fileName, fileType);
}
