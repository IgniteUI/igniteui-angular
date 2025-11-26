import { Component, Input, Output, EventEmitter, Inject, booleanAttribute } from '@angular/core';
import { first } from 'rxjs/operators';
import { BaseToolbarDirective } from './grid-toolbar.base';
import { IgxExcelTextDirective, IgxCSVTextDirective, IgxPdfTextDirective } from './common';
import { GridType } from '../common/grid.interface';
import { IgxToolbarToken } from './token';
import { IgxButtonDirective, IgxRippleDirective, IgxToggleDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { CsvFileTypes, IgxCsvExporterOptions } from '../services/csv/csv-exporter-options';
import { IgxExcelExporterOptions } from '../services/excel/excel-exporter-options';
import { IgxPdfExporterOptions } from '../services/pdf/pdf-exporter-options';
import { IgxBaseExporter } from '../services/exporter-common/base-export-service';
import { IgxExcelExporterService } from '../services/excel/excel-exporter';
import { IgxCsvExporterService } from '../services/csv/csv-exporter';
import { IgxPdfExporterService } from '../services/pdf/pdf-exporter';

export type IgxExporterOptions = IgxCsvExporterOptions | IgxExcelExporterOptions | IgxPdfExporterOptions;

/* jsonAPIComplexObject */
/* wcAlternateName: ExporterEventArgs */
export interface IgxExporterEvent {
    exporter: IgxBaseExporter;
    /* alternateType: ExporterOptionsBase */
    options: IgxExporterOptions;
    grid: GridType;
    cancel: boolean;
}


/* blazorElement */
/* wcElementTag: igc-grid-toolbar-exporter */
/* blazorIndirectRender */
/* jsonAPIManageItemInMarkup */
/* singleInstanceIdentifier */
/**
 * Provides a pre-configured exporter component for the grid.
 *
 * @remarks
 * This component still needs the actual exporter service(s) provided in the DI chain
 * in order to export something.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent, IgxGridToolbarActionsComponent
 *
 */
@Component({
    selector: 'igx-grid-toolbar-exporter',
    templateUrl: './grid-toolbar-exporter.component.html',
    imports: [IgxButtonDirective, IgxRippleDirective, IgxIconComponent, IgxToggleDirective, IgxExcelTextDirective, IgxCSVTextDirective, IgxPdfTextDirective]
})
export class IgxGridToolbarExporterComponent extends BaseToolbarDirective {

    /**
     * Show entry for CSV export.
     */
    @Input({ transform: booleanAttribute })
    public exportCSV = true;

    /**
     * Show entry for Excel export.
     */
    @Input({ transform: booleanAttribute })
    public exportExcel = true;

    /**
     * Show entry for PDF export.
     */
    @Input({ transform: booleanAttribute })
    public exportPDF = true;

    /**
     * The name for the exported file.
     */
    @Input()
    public filename = 'ExportedData';

    /**
     * Emitted when starting an export operation. Re-emitted additionally
     * by the grid itself.
     */
    @Output()
    public exportStarted = new EventEmitter<IgxExporterEvent>();

    /**
     * Emitted on successful ending of an export operation.
     */
    @Output()
    public exportEnded = new EventEmitter<void>();

    /**
     * Indicates whether there is an export in progress.
     */
    protected isExporting = false;

    constructor(
        @Inject(IgxToolbarToken) toolbar: IgxToolbarToken,
        private excelExporter: IgxExcelExporterService,
        private csvExporter: IgxCsvExporterService,
        private pdfExporter: IgxPdfExporterService,
    ) {
        super(toolbar);
    }

    protected exportClicked(type: 'excel' | 'csv' | 'pdf', toggleRef?: IgxToggleDirective) {
        toggleRef?.close();
        this.export(type);
    }

    /* alternateName: exportGrid */
    /**
     * Export the grid's data
     * @param type File type to export
     */
    public export(type: 'excel' | 'csv' | 'pdf'): void {
        let options: IgxExporterOptions;
        let exporter: IgxBaseExporter;

        switch (type) {
            case 'csv':
                options = new IgxCsvExporterOptions(this.filename, CsvFileTypes.CSV);
                exporter = this.csvExporter;
                break;
            case 'excel':
                options = new IgxExcelExporterOptions(this.filename);
                exporter = this.excelExporter;
                break;
            case 'pdf':
                options = new IgxPdfExporterOptions(this.filename);
                exporter = this.pdfExporter;
        }

        const args = { exporter, options, grid: this.grid, cancel: false } as IgxExporterEvent;

        this.exportStarted.emit(args);
        this.grid.toolbarExporting.emit(args);

        if (args.cancel) {
            return;
        }

        this.isExporting = true;
        this.toolbar.showProgress = true;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            this.exportEnded.emit();
            this.isExporting = false;
            this.toolbar.showProgress = false;
        });

        exporter.export(this.grid, options);
    }
}
