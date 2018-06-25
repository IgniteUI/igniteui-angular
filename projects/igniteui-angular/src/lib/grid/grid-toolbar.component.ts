import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    Optional,
    ViewChild
} from '@angular/core';

import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { CsvFileTypes,
         IgxBaseExporter,
         IgxCsvExporterOptions,
         IgxCsvExporterService,
         IgxExcelExporterOptions,
         IgxExcelExporterService } from '../services/index';
import { IgxGridAPIService } from './api.service';
import { IgxGridComponent } from './grid.component';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IgxColumnHidingComponent } from './column-hiding.component';

@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html'
})
export class IgxGridToolbarComponent {

    @HostBinding('class.igx-grid-toolbar')
    @Input()
    public gridID: string;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective })
    protected toggleDirective: IgxToggleDirective;

    @ViewChild('columnHidingDropdown', { read: IgxDropDownComponent })
    public columnHidingDropdown: IgxDropDownComponent;

    @ViewChild(IgxColumnHidingComponent)
    public columnHidingUI: IgxColumnHidingComponent;

    public get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    public get shouldShowExportButton(): boolean {
        return (this.grid != null && (this.grid.exportExcel || this.grid.exportCsv));
    }

    public get shouldShowExportExcelButton(): boolean {
        return (this.grid != null && this.grid.exportExcel);
    }

    public get shouldShowExportCsvButton(): boolean {
        return (this.grid != null && this.grid.exportCsv);
    }

    constructor(public gridAPI: IgxGridAPIService,
                public cdr: ChangeDetectorRef,
                @Optional() public excelExporter: IgxExcelExporterService,
                @Optional() public csvExporter: IgxCsvExporterService) {
    }

    public getTitle(): string {
        return this.grid != null ? this.grid.toolbarTitle : '';
    }

    public getExportText(): string {
        return this.grid != null ? this.grid.exportText : '';
    }

    public getExportExcelText(): string {
        return this.grid != null ? this.grid.exportExcelText : '';
    }

    public getExportCsvText(): string {
        return this.grid != null ? this.grid.exportCsvText : '';
    }

    public exportClicked() {
        this.toggleDirective.collapsed = !this.toggleDirective.collapsed;
    }

    public exportToExcelClicked() {
        this.performExport(this.excelExporter, 'excel');
    }

    public exportToCsvClicked() {
        this.performExport(this.csvExporter, 'csv');
    }

    private performExport(exp: IgxBaseExporter, exportType: string) {
        this.exportClicked();

        const fileName = 'ExportedData';
        const options = exportType === 'excel' ?
                        new IgxExcelExporterOptions(fileName) :
                        new IgxCsvExporterOptions(fileName, CsvFileTypes.CSV);

        const args = { grid: this.grid, exporter: exp, options: options, cancel: false };

        this.grid.onToolbarExporting.emit(args);
        if (args.cancel) {
            return;
        }
        exp.export(this.grid, options);
    }

    public toggleColumnHidingUI() {
        this.columnHidingDropdown.toggle();
    }
}
