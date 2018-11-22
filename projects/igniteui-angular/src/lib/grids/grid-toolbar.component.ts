import {
    ChangeDetectorRef,
    Component,
    Directive,
    HostBinding,
    Input,
    Optional,
    ViewChild,
    Inject,
    TemplateRef
} from '@angular/core';

import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../core/displayDensity';
import {
    CsvFileTypes,
    IgxBaseExporter,
    IgxCsvExporterOptions,
    IgxCsvExporterService,
    IgxExcelExporterOptions,
    IgxExcelExporterService,
    AbsoluteScrollStrategy
} from '../services/index';
import { GridBaseAPIService } from './api.service';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IgxColumnHidingComponent } from './column-hiding.component';
import { IgxColumnPinningComponent } from './column-pinning.component';
import { OverlaySettings, PositionSettings, HorizontalAlignment, VerticalAlignment } from '../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../services/overlay/position';

/** @hidden */
@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html'
})
export class IgxGridToolbarComponent extends DisplayDensityBase {

    /**
     * @hidden
     */
    @HostBinding('class.igx-grid-toolbar')
    @Input()
    public gridID: string;

    /**
     * Gets the default text shown in the filtering box.
     * ```typescript
     * const filterPrompt = this.grid.toolbar.filterColumnsPrompt;
     * ```
     */
    @Input()
    public get filterColumnsPrompt() {
        return this._filterColumnsPrompt;
    }

    /**
     * Sets the default text shown in the filtering box.
     * ```typescript
     * this.grid.toolbar.filterColumnsPrompt('Filter columns ...');
     * ```
     */
    public set filterColumnsPrompt(value: string) {
        this._filterColumnsPrompt = value;
    }

    private _filterColumnsPrompt = 'Filter columns list ...';

    /**
     * Gets the height for the `IgxGridToolbarComponent`'s drop down panels.
     * ```typescript
     * const dropdownHeight = this.grid.toolbar.defaultDropDownsMaxHeight;
     * ```
     */
    @Input()
    get defaultDropDownsMaxHeight() {
        const gridHeight = this.grid.calcHeight;
        return (gridHeight) ? gridHeight * 0.7 + 'px' : '100%';
    }

    /**
     * Provides a reference to the `IgxDropDownComponent` of the Column Hiding UI.
     * ```typescript
     * const dropdownHiding = this.grid.toolbar.columnHidingDropdown;
     * ```
     */
    @ViewChild('columnHidingDropdown', { read: IgxDropDownComponent })
    public columnHidingDropdown: IgxDropDownComponent;

    /**
     * Provides a reference to the `IgxColumnHidingComponent`.
     * ```typescript
     * const hidingUI = this.grid.toolbar.columnHidingUI;
     * ```
     */
    @ViewChild(IgxColumnHidingComponent)
    public columnHidingUI: IgxColumnHidingComponent;

    /**
     * Provides a reference to the Column Hiding button.
     * ```typescript
     * const hidingButton = this.grid.toolbar.columnHidingButton;
     * ```
     */
    @ViewChild('columnHidingButton')
    public columnHidingButton;

    /**
     * Provides a reference to the `IgxDropDownComponent` of the Export button.
     * ```typescript
     * const exportDropdown = this.grid.toolbar.exportDropdown;
     * ```
     */
    @ViewChild('exportDropdown', { read: IgxDropDownComponent })
    public exportDropdown: IgxDropDownComponent;

    /**
     * Provides a reference to the Export button.
     * ```typescript
     * const exportBtn = this.grid.toolbar.exportButton;
     * ```
     */
    @ViewChild('btnExport')
    public exportButton;

    /**
     * Provides a reference to the `IgxDropDownComponent` of the Column Pinning UI.
     * ```typescript
     * const dropdownPinning = this.grid.toolbar.columnPinningDropdown;
     * ```
     */
    @ViewChild('columnPinningDropdown', { read: IgxDropDownComponent })
    public columnPinningDropdown: IgxDropDownComponent;

    /**
     * Provides a reference to the `IgxColumnPinningComponent`.
     * ```typescript
     * const pinningUI = this.grid.toolbar.columnPinningDropdown;
     * ```
     */
    @ViewChild(IgxColumnPinningComponent)
    public columnPinningUI: IgxColumnPinningComponent;

    /**
     * Provides a reference to the Column Pinning button.
     * ```typescript
     * const pinningButton = this.grid.toolbar.columnPinningButton;
     * ```
     */
    @ViewChild('columnPinningButton')
    public columnPinningButton;

    /**
     * Returns a reference to the `IgxGridComponent` component, hosting the `IgxGridToolbarComponent`.
     * ```typescript
     * const grid = this.igxGrid1.toolbar.grid;
     * ```
     */
    public get grid(): IgxGridBaseComponent {
        return this.gridAPI.get(this.gridID);
    }

    /**
     * Returns whether the `IgxGridComponent` renders an export button.
     * ```typescript
     * cosnt exportButton = this.igxGrid1.toolbar.shouldShowExportButton;
     * ```
     */
    public get shouldShowExportButton(): boolean {
        return (this.grid != null && (this.grid.exportExcel || this.grid.exportCsv));
    }

    /**
     * Returns whether the `IgxGridComponent` renders an Excel export button.
     * ```typescript
     * cosnt exportExcelButton = this.igxGrid1.toolbar.shouldShowExportExcelButton;
     * ```
     */
    public get shouldShowExportExcelButton(): boolean {
        return (this.grid != null && this.grid.exportExcel);
    }

    /**
     * Returns whether the `IgxGridComponent` renders an CSV export button.
     * ```typescript
     * cosnt exportCSVButton = this.igxGrid1.toolbar.shouldShowExportCsvButton;
     * ```
     */
    public get shouldShowExportCsvButton(): boolean {
        return (this.grid != null && this.grid.exportCsv);
    }

    /**
     * Returns how many columns are pinned.
     * ```typescript
     * const pinnedCount = this.igxGrid1.toolbar.pinnedColumnsCount;
     * ```
     */
    public get pinnedColumnsCount() {
        return this.grid.pinnedColumns.length;
    }

    /**
     * Returns the theme of the `IgxGridToolbarComponent`.
     * ```typescript
     * const toolbarTheme = this.grid.toolbar.hostClass;
     * ```
     */

    @HostBinding('attr.class')
    get hostClass(): string {
        if (this.isCosy()) {
            return 'igx-grid-toolbar--cosy';
        } else if (this.isCompact()) {
            return 'igx-grid-toolbar--compact';
        } else {
            return 'igx-grid-toolbar';
        }
    }

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        public cdr: ChangeDetectorRef,
        @Optional() public excelExporter: IgxExcelExporterService,
        @Optional() public csvExporter: IgxCsvExporterService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
            super(_displayDensityOptions);
    }

    private _positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _overlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };


    /**
     * Returns the title of `IgxGridToolbarComponent`.
     * ```typescript
     * const toolbarTitle = this.igxGrid1.toolbar.getTitle();
     * ```
     */
    public getTitle(): string {
        return this.grid != null ? this.grid.toolbarTitle : '';
    }

    /**
     * Returns the text of the export button of the `IgxGridToolbarComponent`.
     * ```typescript
     * const toolbarExportText = this.igxGrid1.toolbar.getTitle();
     * ```
     */
    public getExportText(): string {
        return this.grid != null ? this.grid.exportText : '';
    }

    /**
     * Returns the text of the Excel export button of the `IgxGridToolbarComponent`.
     * ```typescript
     * const toolbarExcelText = this.igxGrid1.toolbar.getExportExcelText();
     * ```
     */
    public getExportExcelText(): string {
        return this.grid != null ? this.grid.exportExcelText : '';
    }

    /**
     * Returns the text of the CSV export button of the `IgxGridToolbarComponent`.
     * ```typescript
     * const toolbarCSVText = this.igxGrid1.toolbar.getExportCsvText();
     * ```
     */
    public getExportCsvText(): string {
        return this.grid != null ? this.grid.exportCsvText : '';
    }

    /**
     * Toggles the export button's dropdown menu.
     * ```typescript
     * this.igxGrid1.toolbar.exportClicked();
     * ```
     */
    public exportClicked() {
        this._overlaySettings.positionStrategy.settings.target = this.exportButton.nativeElement;
        this._overlaySettings.outlet = this.grid.outletDirective;
        this.exportDropdown.toggle(this._overlaySettings);
    }

    /**
     * Exports the grid to excel.
     * ```typescript
     * this.igxGrid1.toolbar.exportToExcelClicked();
     * ```
     */
    public exportToExcelClicked() {
        this.performExport(this.excelExporter, 'excel');
    }

    /**
     * Exports the grid to CSV.
     * ```typescript
     * this.igxGrid1.toolbar.exportToCsvClicked();
     * ```
     */
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

    /**
     * Toggles the Column Hiding UI.
     * ```typescript
     * grid1.toolbar.toggleColumnHidingUI();
     * ```
     */
    public toggleColumnHidingUI() {
        this._overlaySettings.positionStrategy.settings.target = this.columnHidingButton.nativeElement;
        this._overlaySettings.outlet = this.grid.outletDirective;
        this.columnHidingDropdown.toggle(this._overlaySettings);
    }

    /**
     * Toggles the Column Pinning UI.
     * ```typescript
     * grid1.toolbar.toggleColumnPinningUI();
     * ```
     */
    public toggleColumnPinningUI() {
        this._overlaySettings.positionStrategy.settings.target = this.columnPinningButton.nativeElement;
        this._overlaySettings.outlet = this.grid.outletDirective;
        this.columnPinningDropdown.toggle(this._overlaySettings);
    }

    /**
     * Returns the `context` object which represents the `template context` binding into the
     * `toolbar custom container` by providing references to the parent IgxGird and the toolbar itself.
     * ```typescript
     * let context =  this.igxGrid.toolbar.context;
     * ```
     */
    public get context(): any {
        return {
            // $implicit: this
            grid: this.grid,
            toolbar: this
        };
    }

    /** @hidden */
    public get customContentTemplate(): TemplateRef<any> {
        if (this.grid != null && this.grid.toolbarCustomContentTemplate != null) {
            return this.grid.toolbarCustomContentTemplate.template;
        } else {
            return null;
        }
    }
}

/**
 * The IgxGridToolbarCustomContentDirective directive is used to mark an 'ng-template' (with
 * the 'igxToolbarCustomContent' selector) defined in the IgxGrid which is used to provide
 * custom content for cener part of the IgxGridToolbar.
 */
@Directive({
    selector: '[igxToolbarCustomContent]'
})
export class IgxGridToolbarCustomContentDirective {
    constructor(public template: TemplateRef<any>) { }
}
