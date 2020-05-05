import { EventEmitter, Injectable, Output, OnDestroy, OnInit } from '@angular/core';
import { IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { CharSeparatedValueData } from './char-separated-value-data';
import { CsvFileTypes, IgxCsvExporterOptions } from './csv-exporter-options';
import { IBaseEventArgs } from '../../core/utils';
import { SaveUtilities } from '../exporter-common/save-utilities';

export interface ICsvExportEndedEventArgs extends IBaseEventArgs {
    csvData: string;
}

const USE_WORKER = true;

/**
 * **Ignite UI for Angular CSV Exporter Service** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter_csv.html)
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
@Injectable()
export class IgxCsvExporterService extends IgxBaseExporter {
    private _stringData: string;
    // private exporterWorker: Worker;

    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.onExportEnded.subscribe((args: ICsvExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     * @memberof IgxCsvExporterService
     */
    @Output()
    public onExportEnded = new EventEmitter<ICsvExportEndedEventArgs>();

    protected exportDataImplementation(data: any[], options: IgxCsvExporterOptions) {
        if (typeof Worker !== 'undefined' && USE_WORKER) {
            console.log('with worker start: ' + new Date());

            const exporterWorker = new Worker('./csv-exporter.worker', { type: 'module' });
            exporterWorker.onmessage = ({ data }) => {
                console.log('onmessage: ' + new Date());
                this._stringData = data;
                this.saveFile(options);
                this.onExportEnded.emit({ csvData: this._stringData });

                console.log('with worker end: ' + new Date());
            };

            data = data.map((item) => item.rowData);

            console.log('before stringify: ' + new Date());
            const string = JSON.stringify(data);
            console.log('after stringify: ' + new Date());
            const uint8_array = new TextEncoder().encode(string);
            const array_buffer = uint8_array.buffer;

            console.log('postmessage: ' + new Date());
            exporterWorker.postMessage({ data: array_buffer, valueDelimiter: options.valueDelimiter }, [array_buffer]);
        } else {
            // Web workers are not supported in this environment - Fallback

            console.log('no worker start: ' + new Date());

            data = data.map((item) => item.rowData);
            const csvData = new CharSeparatedValueData(data, options.valueDelimiter);
            this._stringData = csvData.prepareData();
            this.saveFile(options);
            this.onExportEnded.emit({ csvData: this._stringData });

            console.log('no worker end: ' + new Date());
        }

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
        const blob = new Blob(['\ufeff', data], { type: fileType });
        SaveUtilities.saveBlobToFile(blob, fileName);
    }

    // ngOnInit() {
    //     console.log('on init');
    //     if (typeof Worker !== 'undefined') {
    //         this.exporterWorker = new Worker('./csv-exporter.worker', { type: 'module' });
    //         console.log('worker created');
    //     }
    // }

    // ngOnDestroy() {
    //     if (this.exporterWorker) {
    //         this.exporterWorker.terminate();
    //         console.log('worker destroyed');
    //     }
    // }
}
