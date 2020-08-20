import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    Optional,
    ViewChild,
    Inject,
    TemplateRef,
    AfterViewInit
} from '@angular/core';

import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../../core/displayDensity';
import {
    CsvFileTypes,
    IgxBaseExporter,
    IgxCsvExporterOptions,
    IgxCsvExporterService,
    IgxExcelExporterOptions,
    IgxExcelExporterService,
    AbsoluteScrollStrategy
} from '../../services/public_api';
import { GridBaseAPIService } from '../api.service';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxDropDownComponent } from '../../drop-down/drop-down.component';
import { IgxColumnHidingComponent } from '../hiding/column-hiding.component';
import { IgxColumnPinningComponent } from '../pinning/column-pinning.component';
import { OverlaySettings, PositionSettings, HorizontalAlignment, VerticalAlignment } from '../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../services/overlay/position';
import { GridType } from '../common/grid.interface';
import { IgxGridIconService } from '../common/grid-icon.service';
import { PINNING_ICONS_FONT_SET, PINNING_ICONS } from '../pinning/pinning-icons';
import { GridIconsFeature } from '../common/enums';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxColumnHidingDirective } from '../column-actions/column-hiding.directive';
import { IgxColumnPinningDirective } from '../column-actions/column-pinning.directive';

/**
 * This class encapsulates the Toolbar's logic and is internally used by
 * the `IgxGridComponent`, `IgxTreeGridComponent` and `IgxHierarchicalGridComponent`.
 */
@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html'
})
export class IgxGridToolbarComponent extends DisplayDensityBase implements AfterViewInit {
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

    private _filterColumnsPrompt = this.grid.resourceStrings.igx_grid_toolbar_actions_filter_prompt;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public class = '';

    /**
     * Gets the height for the `IgxGridToolbarComponent`'s drop down panels.
     * ```typescript
     * const dropdownHeight = this.grid.toolbar.defaultDropDownsMaxHeight;
     * ```
     */
    @Input()
    get defaultDropDownsMaxHeight() {
        const gridHeight = this.grid.totalHeight;
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
     * Provides a reference to the `IgxColumnActionsComponent` for column hiding.
     * ```typescript
     * const hidingUI = this.grid.toolbar.columnHidingUI;
     * ```
     */
    @ViewChild(IgxColumnHidingDirective, { read: IgxColumnActionsComponent })
    public columnHidingUI: IgxColumnActionsComponent;

    /**
     * Provides a reference to the Column Hiding button.
     * ```typescript
     * const hidingButton = this.grid.toolbar.columnHidingButton;
     * ```
     */
    @ViewChild('columnHidingButton', { read: IgxButtonDirective })
    public columnHidingButton: IgxButtonDirective;

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
    @ViewChild('btnExport', { read: IgxButtonDirective })
    public exportButton: IgxButtonDirective;

    /**
     * Provides a reference to the `IgxDropDownComponent` of the Column Pinning UI.
     * ```typescript
     * const dropdownPinning = this.grid.toolbar.columnPinningDropdown;
     * ```
     */
    @ViewChild('columnPinningDropdown', { read: IgxDropDownComponent })
    public columnPinningDropdown: IgxDropDownComponent;

    /**
     * Provides a reference to the `IgxColumnActionsComponent` for column pinning.
     * ```typescript
     * const pinningUI = this.grid.toolbar.columnPinningDropdown;
     * ```
     */
    @ViewChild(IgxColumnPinningDirective, { read: IgxColumnActionsComponent })
    public columnPinningUI: IgxColumnActionsComponent;

    /**
     * Provides a reference to the Column Pinning button.
     * ```typescript
     * const pinningButton = this.grid.toolbar.columnPinningButton;
     * ```
     */
    @ViewChild('columnPinningButton', { read: IgxButtonDirective })
    public columnPinningButton: IgxButtonDirective;

    /**
     * Returns a reference to the `IgxGridComponent` component, hosting the `IgxGridToolbarComponent`.
     * ```typescript
     * const grid = this.igxGrid1.toolbar.grid;
     * ```
     */
    public get grid(): IgxGridBaseDirective {
        return this.gridAPI.grid;
    }

    /**
     * Returns whether the `IgxGridComponent` renders an export button.
     * ```typescript
     * const exportButton = this.igxGrid1.toolbar.shouldShowExportButton;
     * ```
     */
    public get shouldShowExportButton(): boolean {
        return (this.grid != null && (this.grid.exportExcel || this.grid.exportCsv));
    }

    /**
     * Returns whether the `IgxGridComponent` renders an Excel export button.
     * ```typescript
     * const exportExcelButton = this.igxGrid1.toolbar.shouldShowExportExcelButton;
     * ```
     */
    public get shouldShowExportExcelButton(): boolean {
        return (this.grid != null && this.grid.exportExcel);
    }

    /**
     * Returns whether the `IgxGridComponent` renders an CSV export button.
     * ```typescript
     * const exportCSVButton = this.igxGrid1.toolbar.shouldShowExportCsvButton;
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
        return this.grid.pinnedColumns.filter(col => !col.columnLayout).length;
    }

    /**
     * Returns the theme of the `IgxGridToolbarComponent`.
     * ```typescript
     * const toolbarTheme = this.grid.toolbar.hostClass;
     * ```
     */

    @HostBinding('attr.class')
    get hostClass(): string {
        const classes = [this.getComponentDensityClass('igx-grid-toolbar')];
        // The custom classes should be at the end.
        classes.push(this.class);
        return classes.join(' ');
        return this.getComponentDensityClass('igx-grid-toolbar');
    }

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        public cdr: ChangeDetectorRef,
        @Optional() public excelExporter: IgxExcelExporterService,
        @Optional() public csvExporter: IgxCsvExporterService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        private iconService: IgxGridIconService) {
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
        closeOnOutsideClick: true,
        excludePositionTarget: true
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
        this._overlaySettings.outlet = this.grid.outlet;
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
     * this.grid1.toolbar.toggleColumnHidingUI();
     * ```
     */
    public toggleColumnHidingUI() {
        this._overlaySettings.positionStrategy.settings.target = this.columnHidingButton.nativeElement;
        this._overlaySettings.outlet = this.grid.outlet;
        this.columnHidingDropdown.toggle(this._overlaySettings);
    }

    /**
     * Toggles the Column Pinning UI.
     * ```typescript
     * this.grid1.toolbar.toggleColumnPinningUI();
     * ```
     */
    public toggleColumnPinningUI() {
        this._overlaySettings.positionStrategy.settings.target = this.columnPinningButton.nativeElement;
        this._overlaySettings.outlet = this.grid.outlet;
        this.columnPinningDropdown.toggle(this._overlaySettings);
    }

    /**
     * @hidden @internal
     */
    public showAdvancedFilteringUI() {
        this.grid.openAdvancedFilteringDialog();
    }

    /**
     * Returns the `context` object which represents the `template context` binding into the
     * `toolbar custom container` by providing references to the parent IgxGird and the toolbar itself.
     * ```typescript
     * const context =  this.igxGrid.toolbar.context;
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

    /**
     * @hidden
     * @internal
     */
    ngAfterViewInit() {
        this.iconService.registerSVGIcons(GridIconsFeature.RowPinning, PINNING_ICONS, PINNING_ICONS_FONT_SET);
    }

    /**
     * @hidden @internal
     */
    public onClosingColumnHiding(args) {
        const activeElem = document.activeElement;

        if (!args.event && activeElem !== this.grid.nativeElement &&
            !this.columnHidingButton.nativeElement.contains(activeElem)) {
            args.cancel = true;
        }
    }

    /**
     * @hidden @internal
     */
    public onClosingColumnPinning(args) {
        const activeElem = document.activeElement;

        if (!args.event && activeElem !== this.grid.nativeElement &&
            !this.columnPinningButton.nativeElement.contains(activeElem)) {
            args.cancel = true;
        }
    }
}
