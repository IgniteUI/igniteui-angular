import { Component, ViewChild } from '@angular/core';
import {
    IgxColumnComponent,
    IgxNumberSummaryOperand,
    IgxSummaryResult,
    IgxExcelExporterService,
    IGridToolbarExportEventArgs,
    IgxExporterOptionsBase,
    IgxExcelExporterOptions,
    IColumnExportingEventArgs,
    IRowExportingEventArgs,
    IgxGridComponent,
    IgxTreeGridComponent
} from 'igniteui-angular';
import { HGRID_DATA } from './hGridData';
import { GRID_DATA } from './gridData';
import { TGRID_DATA } from './tGridData';

class GridSummary {
    public operate(data?: any[]): IgxSummaryResult[] {
        const result = new IgxNumberSummaryOperand().operate(data);
        result.push({
            key: 'test',
            label: 'Test',
            summaryResult: data.filter((rec) => rec > 10 && rec < 30).length
        });

        return result;
    }
}

class HGridSummary  {
    public operate(data?: any[]): IgxSummaryResult[] {
        const result = [];
        result.push(
        {
            key: 'min',
            label: 'Min',
            summaryResult: IgxNumberSummaryOperand.min(data)
        },
        {
            key: 'max',
            label: 'Max',
            summaryResult: IgxNumberSummaryOperand.max(data)
        },
        {
          key: 'avg',
          label: 'Avg',
          summaryResult: IgxNumberSummaryOperand.average(data)
        });
        return result;
    }
}

class HGridChildSummary {
    public operate(data?: any[]): IgxSummaryResult[] {
        const result = [];
        result.push(
        {
            key: 'count',
            label: 'Count',
            summaryResult: IgxNumberSummaryOperand.count(data)
        });
        return result;
    }
}

@Component({
    selector: 'app-grid-export-sample',
    templateUrl: 'grid-export.sample.html'
})
export class GridExportComponent {
    @ViewChild('grid', { static: true })
    private grid: IgxGridComponent;

    @ViewChild('tGrid', { static: true })
    private tGrid: IgxTreeGridComponent;

    public gridSummary = GridSummary;
    public hGridSummary = HGridSummary;
    public hGridChildSummary = HGridChildSummary;
    public gridData;
    public tGridData;
    public hGridData;
    public productId = 0;

    constructor() {
        this.gridData = GRID_DATA;
        this.tGridData = TGRID_DATA;
        this.hGridData = HGRID_DATA;
        this.productId = GRID_DATA.length;
    }

    public toggleSummary(column: IgxColumnComponent) {
        column.hasSummary = !column.hasSummary;
        this.grid.summaryService.clearSummaryCache();
        this.tGrid.summaryService.clearSummaryCache();
    }

    public configureExport(args: IGridToolbarExportEventArgs) {
        console.log(args);
        //const options: IgxExporterOptionsBase = args.options;

        // Change exporter options
        //
        // options.fileName = `Report_${new Date().toDateString()}`;
        // options.exportSummaries = false;

        // Cancel column exporting
        //
        // args.exporter.columnExporting.subscribe((colExportingArgs: IColumnExportingEventArgs) => {
        //     if (colExportingArgs.columnIndex === 1) {
        //         colExportingArgs.cancel = true;
        //     }
        // });

        // Cancel row exporting
        //
        // args.exporter.rowExporting.subscribe((rowExportingArgs: IRowExportingEventArgs) => {
        //     if (rowExportingArgs.rowIndex === 1) {
        //         rowExportingArgs.cancel = true;
        //     }
        // });
    }
}
