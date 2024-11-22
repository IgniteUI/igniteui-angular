import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GridSearchBoxComponent } from '../grid-search-box/grid-search-box.component';
import { IgxSummaryOperand, IgxSummaryResult, IgxButtonGroupComponent, IgxButtonDirective, IgxTreeGridComponent, IgxColumnComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, IgxSwitchComponent, GridSummaryCalculationMode, IgxExcelExporterService, IgxCsvExporterService, GridSelectionMode, IgxExcelExporterOptions, IgxCsvExporterOptions, CsvFileTypes, IgxPaginatorComponent } from 'igniteui-angular';

export class MySummaryOperand extends IgxSummaryOperand {
    public override operate(data: any[] = []): IgxSummaryResult[] {
        return [{
            key: 'count',
            label: 'Count',
            summaryResult: IgxSummaryOperand.count(data)
        }, {
            key: 'countIf',
            label: 'Count If',
            summaryResult: data.filter(r => r > 10).length
        }];
    }
}

@Component({
    selector: 'app-tree-grid-flat-data-sample',
    styleUrls: ['tree-grid-flat-data.sample.scss'],
    templateUrl: 'tree-grid-flat-data.sample.html',
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxTreeGridComponent, NgFor, NgIf, IgxColumnComponent, IgxGridToolbarComponent, GridSearchBoxComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, IgxPaginatorComponent, IgxSwitchComponent, FormsModule]
})
export class TreeGridFlatDataSampleComponent implements OnInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true }) public grid1: IgxTreeGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public summaryMode: GridSummaryCalculationMode = GridSummaryCalculationMode.rootLevelOnly;
    public summaryModes = [];
    public selectionMode;
    public size = 'large';
    public sizes;
    public paging = false;

    private nextRow = 1;

    constructor(private excelExporterService: IgxExcelExporterService,
                private csvExporterService: IgxCsvExporterService) {
    }

    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.sizes = [
            { label: 'small', selected: this.size === 'small', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'large', selected: this.size === 'large', togglable: true }
        ];
        this.summaryModes = [
            { label: 'rootLevelOnly', selected: this.summaryMode === 'rootLevelOnly', togglable: true },
            { label: 'childLevelsOnly', selected: this.summaryMode === 'childLevelsOnly', togglable: true },
            { label: 'rootAndChildLevels', selected: this.summaryMode === 'rootAndChildLevels', togglable: true }
        ];

        this.columns = [
            { field: 'employeeID', label: 'ID', width: 200, resizable: true, dataType: 'number', hasSummary: false },
            { field: 'Salary', label: 'Salary', width: 200, resizable: true, dataType: 'number', hasSummary: true },
            { field: 'firstName', label: 'First Name', width: 300, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'lastName', label: 'Last Name', width: 150, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'Title', label: 'Title', width: 200, resizable: true, dataType: 'string', hasSummary: true }
        ];
        this.data = [
            { Salary: 2500, employeeID: 0, PID: -1, firstName: 'Andrew', lastName: 'Fuller', Title: 'Vice President, Sales' },
            { Salary: 3500, employeeID: 1, PID: -1, firstName: 'Jonathan', lastName: 'Smith', Title: 'Human resources' },
            { Salary: 1500, employeeID: 2, PID: -1, firstName: 'Nancy', lastName: 'Davolio', Title: 'CFO' },
            { Salary: 2500, employeeID: 3, PID: -1, firstName: 'Steven', lastName: 'Buchanan', Title: 'CTO' },
            // sub of ID 0
            { Salary: 2500, employeeID: 4, PID: 0, firstName: 'Janet', lastName: 'Leverling', Title: 'Sales Manager' },
            { Salary: 3500, employeeID: 5, PID: 0, firstName: 'Laura', lastName: 'Callahan',
                Title: 'Inside Sales Coordinator' },
            { Salary: 1500, employeeID: 6, PID: 0, firstName: 'Margaret', lastName: 'Peacock', Title: 'Sales Representative' },
            { Salary: 2500, employeeID: 7, PID: 0, firstName: 'Michael', lastName: 'Suyama', Title: 'Sales Representative' },
            // sub of ID 4
            { Salary: 2500, employeeID: 8, PID: 4, firstName: 'Anne', lastName: 'Dodsworth', Title: 'Sales Representative' },
            { Salary: 3500, employeeID: 9, PID: 4, firstName: 'Danielle', lastName: 'Davis', Title: 'Sales Representative' },
            { Salary: 1500, employeeID: 10, PID: 4, firstName: 'Robert', lastName: 'King', Title: 'Sales Representative' },
            // sub of ID 2
            { Salary: 2500, employeeID: 11, PID: 2, firstName: 'Peter', lastName: 'Lewis', Title: 'Chief Accountant' },
            { Salary: 3500, employeeID: 12, PID: 2, firstName: 'Ryder', lastName: 'Zenaida', Title: 'Accountant' },
            { Salary: 1500, employeeID: 13, PID: 2, firstName: 'Wang', lastName: 'Mercedes', Title: 'Accountant' },
            // sub of ID 3
            { Salary: 1500, employeeID: 14, PID: 3, firstName: 'Theodore', lastName: 'Zia', Title: 'Software Architect' },
            { Salary: 4500, employeeID: 15, PID: 3, firstName: 'Lacota', lastName: 'Mufutau', Title: 'Product Manager' },
            // sub of ID 16
            { Salary: 2500, employeeID: 16, PID: 15, firstName: 'Jin', lastName: 'Elliott', Title: 'Product Owner' },
            { Salary: 3500, employeeID: 17, PID: 15, firstName: 'Armand', lastName: 'Ross', Title: 'Product Owner' },
            { Salary: 1500, employeeID: 18, PID: 15, firstName: 'Dane', lastName: 'Rodriquez', Title: 'Team Leader' },
            // sub of ID 19
            { Salary: 2500, employeeID: 19, PID: 18, firstName: 'Declan', lastName: 'Lester',
                Title: 'Senior Software Developer' },
            { Salary: 3500, employeeID: 20, PID: 18, firstName: 'Bernard', lastName: 'Jarvis',
                Title: 'Senior Software Developer' },
            { Salary: 1500, employeeID: 21, PID: 18, firstName: 'Jason', lastName: 'Clark', Title: 'QA' },
            { Salary: 1500, employeeID: 22, PID: 18, firstName: 'Mark', lastName: 'Young', Title: 'QA' },
            // sub of ID 20
            { Salary: 1500, employeeID: 23, PID: 20, firstName: 'Jeremy', lastName: 'Donaldson', Title: 'Software Developer' }
        ];
    }

    public addRow() {
        this.grid1.addRow({
            employeeID: this.data.length + this.nextRow++,
            PID: -1,
            firstName: 'John',
            lastName: 'Doe',
            Title: 'Junior Sales Representative'
        });
    }

    public addChildRow() {
        const selectedRowId = this.grid1.selectedRows[0];
        this.grid1.addRow(
            {
                employeeID: this.data.length + this.nextRow++,
                firstName: `Added `,
                lastName: 'Added',
                Title: 'Sales Manager'
            },
            selectedRowId);
    }

    public deleteRow() {
        this.grid1.deleteRow(this.grid1.selectedRows[0]);
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }

    public selectSummaryMode(event) {
        this.summaryMode = this.summaryModes[event.index].label;
    }

    public disableSummary() {
        const name = 'Salary';
        const col = this.grid1.getColumnByName(name);
        // col.hasSummary = !col.hasSummary;
        // col.summaries = MySummaryOperand;

        if (col.hasSummary) {
            this.grid1.disableSummaries(name);
        } else {
            this.grid1.enableSummaries([{ fieldName: name, customSummary: MySummaryOperand }]);
        }
    }

    public undo() {
        this.grid1.transactions.undo();
    }

    public redo() {
        this.grid1.transactions.redo();
    }

    public commit() {
        this.grid1.transactions.commit(this.data);
    }

    public exportToExcel() {
        this.excelExporterService.export(this.grid1, new IgxExcelExporterOptions('TreeGrid'));
    }

    public exportToCSV() {
        this.csvExporterService.export(this.grid1, new IgxCsvExporterOptions('TreeGrid', CsvFileTypes.CSV));
    }

    public pinRow() {
        this.grid1.pinRow(4);
    }
}
