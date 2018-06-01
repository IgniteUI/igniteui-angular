import {
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    HostBinding,
    Input,
    Optional,
    TemplateRef,
    ViewChild
} from "@angular/core";

import { IgxButtonDirective } from "../directives/button/button.directive";
import { IgxToggleDirective } from "../directives/toggle/toggle.directive";
import { CsvFileTypes,
         IgxCsvExporterOptions,
         IgxCsvExporterService,
         IgxExcelExporterOptions,
         IgxExcelExporterService } from "../services/index";
import { IgxGridAPIService } from "./api.service";
import { autoWire, IGridBus } from "./grid.common";
import { IgxGridComponent } from "./grid.component";

@Component({
    selector: "igx-grid-toolbar",
    templateUrl: "./grid-toolbar.component.html"
})
export class IgxGridToolbarComponent implements IGridBus {

    @HostBinding("class.igx-grid-toolbar")
    @Input()
    public gridID: string;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective })
    protected toggleDirective: IgxToggleDirective;

    public get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    public get shouldShowExportButton(): boolean {
        return (this.grid != null && (this.grid.exportExcel || this.grid.exportCsv));
    }

    public get shouldShowExportExcelButton(): boolean {
        return this.grid.exportExcel;
    }

    public get shouldShowExportCsvButton(): boolean {
        return this.grid.exportCsv;
    }

    private _exportEventSubscription;

    constructor(public gridAPI: IgxGridAPIService,
                public cdr: ChangeDetectorRef,
                @Optional() public excelExporter: IgxExcelExporterService,
                @Optional() public csvExporter: IgxCsvExporterService) {
    }

    public getTitle(): string {
        return this.grid != null ? this.grid.toolbarTitle : "";
    }

    public getExportText(): string {
        return this.grid != null ? this.grid.exportText : "";
    }

    public getExportExcelText(): string {
        return this.grid != null ? this.grid.exportExcelText : "";
    }

    public getExportCsvText(): string {
        return this.grid != null ? this.grid.exportCsvText : "";
    }

    public exportClicked() {
        this.toggleDirective.collapsed = !this.toggleDirective.collapsed;
    }

    public exportToExcelClicked() {
        this.toggleDirective.collapsed = !this.toggleDirective.collapsed;
        const args = { grid: this.grid, exporter: this.excelExporter, type: "excel", cancel: false };
        this.grid.onToolbarExporting.emit(args);
        if (args.cancel) {
            return;
        }
        this._exportEventSubscription = this.excelExporter.onExportEnded.subscribe((ev) => this._exportEndedHandler());
        // show busy indicator here
        this.excelExporter.export(this.grid, new IgxExcelExporterOptions("ExportedData"));
    }

    public exportToCsvClicked() {
        this.toggleDirective.collapsed = !this.toggleDirective.collapsed;
        const args = { grid: this.grid, exporter: this.csvExporter, type: "csv", cancel: false };
        this.grid.onToolbarExporting.emit(args);
        if (args.cancel) {
            return;
        }
        this._exportEventSubscription = this.csvExporter.onExportEnded.subscribe((ev) => this._exportEndedHandler());
        // show busy indicator here
        this.csvExporter.export(this.grid, new IgxCsvExporterOptions("ExportedData", CsvFileTypes.CSV));
    }

    private _exportEndedHandler() {
        if (this._exportEventSubscription) {
            this._exportEventSubscription.unsubscribe();
            this._exportEventSubscription = null;
        }
        // hide busy indicator here
    }

}
