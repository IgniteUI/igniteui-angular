import { Component, ContentChild, Input, Output, EventEmitter, Inject } from '@angular/core';
import { first } from 'rxjs/operators';
import { BaseToolbarDirective } from './grid-toolbar.base';
import { IgxExcelTextDirective, IgxCSVTextDirective } from './common';
import {
    CsvFileTypes,
    IgxBaseExporter,
    IgxCsvExporterOptions,
    IgxCsvExporterService,
    IgxExcelExporterOptions,
    IgxExcelExporterService
} from '../../services/public_api';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { GridType } from '../common/grid.interface';
import { IgxToolbarToken } from './token';


export type IgxExporterOptions = IgxCsvExporterOptions | IgxExcelExporterOptions;


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
/**
 * Provides a pre-configured exporter component for the grid.
 *
 * @remarks
 * This component still needs the actual exporter service(s) provided in the DI chain
 * in order to export something.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 */
@Component({
    selector: 'igx-grid-toolbar-exporter',
    templateUrl: './grid-toolbar-exporter.component.html'
})
export class IgxGridToolbarExporterComponent extends BaseToolbarDirective {

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxExcelTextDirective)
    public hasExcelAttr: IgxExcelTextDirective;

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxCSVTextDirective)
    public hasCSVAttr: IgxCSVTextDirective;

    /**
     * Show entry for CSV export.
     */
    @Input()
    public exportCSV = true;

    /**
     * Show entry for Excel export.
     */
    @Input()
    public exportExcel = true;

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
    public isExporting = false;

    constructor(
        @Inject(IgxToolbarToken) protected toolbar: IgxToolbarToken,
        private excelExporter: IgxExcelExporterService,
        private csvExporter: IgxCsvExporterService,
    ) {
        super(toolbar);
    }

    /* alternateName: exportGrid */
    public export(type: 'excel' | 'csv', toggleRef?: IgxToggleDirective): void {
        let options: IgxExporterOptions;
        let exporter: IgxBaseExporter;

        toggleRef?.close();

        switch (type) {
            case 'csv':
                options = new IgxCsvExporterOptions(this.filename, CsvFileTypes.CSV);
                exporter = this.csvExporter;
                break;
            case 'excel':
                options = new IgxExcelExporterOptions(this.filename);
                exporter = this.excelExporter;
        }

        const args = { exporter, options, grid: this.grid, cancel: false } as IgxExporterEvent;

        this.exportStarted.emit(args);
        this.grid.toolbarExporting.emit(args);
        this.isExporting = true;
        this.toolbar.showProgress = true;

        if (args.cancel) {
            return;
        }

        exporter.exportEnded.pipe(first()).subscribe(() => {
            this.exportEnded.emit();
            this.isExporting = false;
            this.toolbar.showProgress = false;
        });

        exporter.export(this.grid, options);
    }
}
