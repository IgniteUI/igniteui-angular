import { Component, ViewChild, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';
import { IgxDropDownItemComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-item.component';
import { IgxDropDownComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-navigation.directive';
import { IgxToggleActionDirective } from '../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxPaginatorComponent } from '../../../projects/igniteui-angular/src/lib/paginator/paginator.component';
import { IgxGridToolbarExporterComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component';
import { IgxGridToolbarAdvancedFilteringComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-advanced-filtering.component';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarActionsComponent, IgxExcelTextDirective, IgxCSVTextDirective } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { GridSearchBoxComponent } from '../grid-search-box/grid-search-box.component';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { IgxTreeGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/tree-grid/tree-grid.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';
import { DisplayDensity } from '../../../projects/igniteui-angular/src/lib/core/displayDensity';
import { GridSelectionMode } from '../../../projects/igniteui-angular/src/lib/grids/common/enums';
import { TreeGridFilteringStrategy } from '../../../projects/igniteui-angular/src/lib/grids/tree-grid/public_api';
import { CsvFileTypes, IgxCsvExporterOptions, IgxCsvExporterService, IgxExcelExporterOptions, IgxExcelExporterService } from '../../../projects/igniteui-angular/src/lib/services/public_api';

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['tree-grid.sample.scss'],
    templateUrl: 'tree-grid.sample.html',
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxTreeGridComponent, IgxGridToolbarComponent, GridSearchBoxComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, NgIf, IgxPaginatorComponent, IgxSwitchComponent, FormsModule, IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, NgFor, IgxDropDownItemComponent]
})

export class TreeGridSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxTreeGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public selectionMode;
    public density: DisplayDensity = 'comfortable';
    public displayDensities;
    public selectionModes: GridSelectionMode[] = ['none', 'single', 'multiple', 'multipleCascade'];
    public filterStrategy = new TreeGridFilteringStrategy(['ID']);
    public paging = false;

    private nextRow = 1;

    constructor(private excelExporterService: IgxExcelExporterService, private csvExporterService: IgxCsvExporterService) {

    }

    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];

        this.columns = [
            { field: 'ID', width: 150, resizable: true, pinned: true },
            { field: 'CompanyName', width: 150, resizable: true },
            { field: 'ContactName', width: 150, resizable: true },
            { field: 'ContactTitle', width: 150, resizable: true },
            { field: 'Address', width: 150, resizable: true },
            { field: 'City', width: 150, resizable: true },
            { field: 'Region', width: 150, resizable: true },
            { field: 'PostalCode', width: 150, resizable: true },
            { field: 'Phone', width: 150, resizable: true },
            { field: 'Fax', width: 150, resizable: true }
        ];
        this.data = HIERARCHICAL_SAMPLE_DATA.slice(0);
    }

    public addRow() {
        this.grid1.addRow({
            ID: `ADD${this.nextRow++}`,
            CompanyName: 'Around the Horn',
            ContactName: 'Thomas Hardy',
            ContactTitle: 'Sales Representative',
            Address: '120 Hanover Sq.',
            City: 'London',
            Region: null,
            PostalCode: 'WA1 1DP',
            Country: 'UK',
            Phone: '(171) 555-7788',
            Fax: '(171) 555-6750'
        });
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public addChildRow() {
        const selectedRowId = this.grid1.selectedRows[0];
        this.grid1.addRow (
            {
                ID: `ADD${this.nextRow++}`,
                CompanyName: 'Around the Horn',
                ContactName: 'Thomas Hardy',
                ContactTitle: 'Sales Representative',
                Address: '120 Hanover Sq.',
                City: 'London',
                Region: null,
                PostalCode: 'WA1 1DP',
                Country: 'UK',
                Phone: '(171) 555-7788',
                Fax: '(171) 555-6750'
            },
            selectedRowId);
    }

    public deleteRow() {
        this.grid1.deleteRow(this.grid1.selectedRows[0]);
    }

    public undo() {
        this.grid1.transactions.undo();
    }

    public redo() {
        this.grid1.transactions.redo();
    }

    public commit() {
        this.grid1.transactions.commit(this.data, this.grid1.primaryKey, this.grid1.childDataKey);
    }

    public exportToExcel() {
        this.excelExporterService.export(this.grid1, new IgxExcelExporterOptions('TreeGrid'));
    }

    public exportToCSV() {
        this.csvExporterService.export(this.grid1, new IgxCsvExporterOptions('TreeGrid', CsvFileTypes.CSV));
    }
}
