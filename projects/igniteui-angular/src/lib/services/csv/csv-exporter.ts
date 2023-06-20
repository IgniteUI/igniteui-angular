import { EventEmitter, Injectable } from '@angular/core';
import { DEFAULT_OWNER, IExportRecord, IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { CharSeparatedValueData } from './char-separated-value-data';
import { CsvFileTypes, IgxCsvExporterOptions } from './csv-exporter-options';
import { IBaseEventArgs } from '../../core/utils';

export interface ICsvExportEndedEventArgs extends IBaseEventArgs {
    csvData?: string;
}

/**
 * **Ignite UI for Angular CSV Exporter Service** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter-csv)
 *
 * The Ignite UI for Angular CSV Exporter service can export data in a Character Separated Values format from
 * both raw data (array) or from an `IgxGrid`.
 *
 * Example:
 * ```typescript
 * public localData = [
 *   { Name: "Eric Ridley", Age: "26" },
 *   { Name: "Alanis Brook", Age: "22" },
 *   { Name: "Jonathan Morris", Age: "23" }
 * ];
 *
 * constructor(private csvExportService: IgxCsvExporterService) {
 * }
 *
 * const opt: IgxCsvExporterOptions = new IgxCsvExporterOptions("FileName", CsvFileTypes.CSV);
 * this.csvExportService.exportData(this.localData, opt);
 * ```
 */
@Injectable({
    providedIn: 'root',
})
export class IgxCsvExporterService extends IgxBaseExporter {
    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.exportEnded.subscribe((args: ICsvExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxCsvExporterService
     */
    public override exportEnded = new EventEmitter<ICsvExportEndedEventArgs>();

    private _stringData: string;

    protected exportDataImplementation(data: IExportRecord[], options: IgxCsvExporterOptions, done: () => void) {
        data = data.map((item) => item.data);
        const columnList = this._ownersMap.get(DEFAULT_OWNER);

        const csvData = new CharSeparatedValueData(data, options.valueDelimiter, columnList?.columns);
        csvData.prepareDataAsync((r) => {
            this._stringData = r;
            this.saveFile(options);
            this.exportEnded.emit({ csvData: this._stringData });
            done();
        });
    }

    private saveFile(options: IgxCsvExporterOptions) {
        switch (options.fileType) {
            case CsvFileTypes.CSV:
                this.exportFile(this._stringData, options.fileName, 'text/csv;charset=utf-8;');
                break;
            case CsvFileTypes.TSV:
            case CsvFileTypes.TAB:
                this.exportFile(this._stringData, options.fileName, 'text/tab-separated-values;charset=utf-8;');
                break;
        }
    }

    private exportFile(data: string, fileName: string, fileType: string): void {
        const blob = new Blob([data ? '\ufeff' : '', data], { type: fileType });
        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
