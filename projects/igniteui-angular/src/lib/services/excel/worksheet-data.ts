import { ExportRecordType, IExportRecord, IMapRecord } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { WorksheetDataDictionary } from './worksheet-data-dictionary';

/** @hidden */
export class WorksheetData {
    private _columnCount: number;
    private _rowCount: number;
    private _dataDictionary: WorksheetDataDictionary;
    private _keys: string[];
    private _isSpecialData: boolean;

    constructor(private _data: IExportRecord[],
                public options: IgxExcelExporterOptions,
                public sort: any,
                public owners: Map<any, IMapRecord>) {
            this.initializeData();
    }

    public get data(): IExportRecord[] {
        return this._data;
    }

    public get columnCount(): number {
        return this._columnCount;
    }

    public get rowCount(): number {
        return this._rowCount;
    }

    public get isEmpty(): boolean {
        return !this.rowCount || !this._columnCount;
    }

    public get keys(): string[] {
        return this._keys;
    }

    public get isSpecialData(): boolean {
        return this._isSpecialData;
    }

    public get dataDictionary(): WorksheetDataDictionary {
        return this._dataDictionary;
    }

    private initializeData() {
        if (!this._data || this._data.length === 0) {
            return;
        }
        debugger
        const columnWidths = this.owners.values().next().value.columnWidths;
        const actualData = this._data.filter(item => item.type !== ExportRecordType.HeaderRecord).map(item => item.data);

        if (this._data[0].type === ExportRecordType.HierarchicalGridRecord) {
            this.options.exportAsTable = false;

            const hierarchicalGridData =
                this._data.filter(item => item.type === ExportRecordType.HierarchicalGridRecord).map(item => item.data);

            this._keys = ExportUtilities.getKeysFromData(hierarchicalGridData); // TODO refactor
        } else {
            this._keys = ExportUtilities.getKeysFromData(actualData);
        }

        if (this._keys.length === 0) {
            return;
        }

        this._isSpecialData = ExportUtilities.isSpecialData(actualData);

        this._columnCount = this._keys.length;
        this._rowCount = this._data.length + 1;

        this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.options.columnWidth, columnWidths);
    }
}
