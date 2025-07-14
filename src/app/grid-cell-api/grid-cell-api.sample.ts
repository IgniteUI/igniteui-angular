import { Component, OnInit, Renderer2, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxGridComponent,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent,
    CellType,
    IgxPaginatorComponent,
    IgxGridDetailTemplateDirective,
    IgxColumnComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarHidingComponent,
    IgxButtonDirective,
    IgxIconComponent,
    IgxRowIslandComponent
} from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA, SAMPLE_DATA } from '../shared/sample-data';

@Component({
    selector: 'app-grid-cell-api-sample',
    styleUrls: ['grid-cell-api.sample.scss'],
    templateUrl: 'grid-cell-api.sample.html',
    imports: [FormsModule, IgxGridComponent, IgxPaginatorComponent, IgxGridDetailTemplateDirective, IgxColumnComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxButtonDirective, IgxIconComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxRowIslandComponent]
})

export class GridCellAPISampleComponent implements OnInit {
    private renderer = inject(Renderer2);

    public data2: any;
    public data: any[];
    public treeGridHierData: any[];
    public hierarchicalData: any[];
    public columns: any[];
    public hColumns: any[];
    public treeGridHierColumns: any[];
    public treeColumns: any[];
    public treeData: any[];

    public index = '00';
    public tIndex = '00';
    public tHIndex = '00';
    public hIndex = '00';

    public cellKey = 'ALFKI';
    public tCellKey = '0';
    public tHCellKey = 'ALFKI';
    public hCellKey = '0';

    public columnField = 'ContactName';
    public tcolumnField = 'Salary';
    public tHcolumnField = 'ContactName';
    public hcolumnField = 'ProductName';

    public selectedCell: CellType;

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', header: 'Company Name', width: '200px', groupable: true },
            { field: 'ContactName', width: '200px', pinned: false, groupable: true },
            { field: 'ContactTitle', width: '300px', pinned: false, groupable: true },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.hColumns = [
            { field: 'ID', width: '200px' },
            { field: 'ChildLevels', width: '200px' },
            { field: 'ProductName', width: '200px' },
            { field: 'Col1', width: '200px' },
            { field: 'Col2', width: '200px' },
            { field: 'Col3', width: '200px' },
            { field: 'childData', width: '200px' },
            { field: 'childData2', width: '200px' },
            { field: 'hasChild', width: '200px' }
        ];

        this.treeGridHierColumns = [
            { field: 'ID', width: 200, resizable: true, pinned: true },
            { field: 'CompanyName', width: 150, resizable: true },
            { field: 'ContactName', width: 150, resizable: true },
            { field: 'ContactTitle', width: 150, resizable: true },
            { field: 'Address', width: 150, resizable: true},
            { field: 'City', width: 150, resizable: true, summary: true },
            { field: 'Region', width: 150, resizable: true },
            { field: 'PostalCode', width: 150, resizable: true },
            { field: 'Phone', width: 150, resizable: true },
            { field: 'Fax', width: 150, resizable: true }
        ];
        this.treeGridHierData = HIERARCHICAL_SAMPLE_DATA.slice(0);

        this.data = SAMPLE_DATA;
        this.hierarchicalData = this.generateDataUneven(100, 3);

        // treegrid cols and data
        this.treeColumns = [
            { field: 'employeeID', label: 'ID', width: 200, resizable: true, dataType: 'number', hasSummary: false },
            { field: 'Salary', label: 'Salary', width: 200, resizable: true, dataType: 'number', hasSummary: true },
            { field: 'firstName', label: 'First Name', width: 300, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'lastName', label: 'Last Name', width: 150, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'Title', label: 'Title', width: 200, resizable: true, dataType: 'string', hasSummary: true }
        ];
        this.treeData = [
            { Salary: 2500, employeeID: 0, PID: -1, firstName: 'Andrew', lastName: 'Fuller', Title: 'Vice President, Sales' },
            { Salary: 3500, employeeID: 1, PID: -1, firstName: 'Jonathan', lastName: 'Smith', Title: 'Human resources' },
            { Salary: 1500, employeeID: 2, PID: -1, firstName: 'Nancy', lastName: 'Davolio', Title: 'CFO' },
            { Salary: 2500, employeeID: 3, PID: -1, firstName: 'Steven', lastName: 'Buchanan', Title: 'CTO' },
            // sub of ID 0
            { Salary: 2500, employeeID: 4, PID: 0, firstName: 'Janet', lastName: 'Leverling', Title: 'Sales Manager' },
            { Salary: 3500, employeeID: 5, PID: 0, firstName: 'Laura', lastName: 'Callahan', Title: 'Inside Sales Coordinator' },
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
            { Salary: 2500, employeeID: 19, PID: 18, firstName: 'Declan', lastName: 'Lester', Title: 'Senior Software Developer' },
            { Salary: 3500, employeeID: 20, PID: 18, firstName: 'Bernard', lastName: 'Jarvis', Title: 'Senior Software Developer' },
            { Salary: 1500, employeeID: 21, PID: 18, firstName: 'Jason', lastName: 'Clark', Title: 'QA' },
            { Salary: 1500, employeeID: 22, PID: 18, firstName: 'Mark', lastName: 'Young', Title: 'QA' },
            // sub of ID 20
            { Salary: 1500, employeeID: 23, PID: 20, firstName: 'Jeremy', lastName: 'Donaldson', Title: 'Software Developer' }
        ];
    }

    public updateCell(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, rIndex: string, field: string,
        logger: HTMLElement) {
        const cell = grid.getCellByColumn(parseInt(rIndex, 10), field);
        cell.update('New Value');
        this.logState(grid, rIndex, field, logger);
    }

    public select(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, rIndex: string, field: string, logger: HTMLElement) {
        const cell = grid.getCellByColumn(parseInt(rIndex, 10), field);
        cell.selected = !cell.selected;
        this.selectedCell = cell;
        this.logState(grid, rIndex, field, logger);
    }

    public setEditMode(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, rIndex: string, field: string,
        logger: HTMLElement) {
        const cell = grid.getCellByColumn(parseInt(rIndex, 10), field);
        cell.editMode = !cell.editMode;
        this.logState(grid, rIndex, field, logger);
    }

    public generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0) {
                // Have child grids for row with even id less rows by not multiplying by 2
                children = this.generateDataUneven(((i % 2) + 1) * Math.round(count / 3), currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID,
                ChildLevels: currLevel,
                ProductName: 'Product: A' + i,
                Col1: i,
                Col2: i,
                Col3: i,
                childData: children,
                childData2: children,
                hasChild: true
            });
        }
        return prods;
    }

    public clearLog(logger: HTMLElement) {
        const elements = logger.querySelectorAll('p');

        elements.forEach(element => {
            this.renderer.removeChild(logger, element);
        });
    }

    public logState(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, rIndex: string,
        field: string, logger: HTMLElement) {
        this.clearLog(logger);
        const cell = grid.getCellByColumn(parseInt(rIndex, 10), field);
        let state: string;
        let states: string[];

        if (cell) {
            state = `
                value: ${cell.value},
                selected: ${cell.selected},
                editable: ${cell.editable},
                editMode: ${cell.editMode},
                editValue: ${cell.editValue},
                -----------------------------,
                colIndex: ${cell.column.index},
                visibleColIndex: ${cell.column.visibleIndex},
                colField: ${cell.column.field},
                -----------------------------,
                rowIndex: ${cell.row.index},
                rowViewIndex: ${cell.row.viewIndex},
                rowKey: ${cell.row.key},
                rowData: ${cell.row.data},
                -----------------------------,
                gridId: ${cell.grid.id},
                id: ${cell.id},
                width: ${cell.width}`;
            states = state.split(',');
        } else {
            states = [`Cell is: ${cell}`];
        }

        const createElem = this.renderer.createElement('p');

        states.forEach(st => {
            const text = this.renderer.createText(st);
            this.renderer.appendChild(createElem, text);
            this.renderer.appendChild(createElem, this.renderer.createElement('br'));
        });

        this.renderer.insertBefore(logger, createElem, logger.children[0]);
    }

    public logStateByKey(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, rIndex: string,
    field: string, logger: HTMLElement) {
        this.clearLog(logger);
        const cell = grid.getCellByColumn(parseInt(rIndex, 10), field);
        let state: string;
        let states: string[];

        if (cell) {
            state = `
                value: ${cell.value},
                selected: ${cell.selected},
                editable: ${cell.editable},
                editMode: ${cell.editMode},
                editValue: ${cell.editValue},
                -----------------------------,
                colIndex: ${cell.column.index},
                visibleColIndex: ${cell.column.visibleIndex},
                colField: ${cell.column.field},
                -----------------------------,
                rowIndex: ${cell.row.index},
                rowViewIndex: ${cell.row.viewIndex},
                rowKey: ${cell.row.key},
                rowData: ${cell.row.data},
                -----------------------------,
                gridId: ${cell.grid.id},
                cellID: ${cell.id},
                width: ${cell.width}`;

            states = state.split(',');
        } else {
            states = [`Cell is: ${cell}`];
        }

        const createElem = this.renderer.createElement('p');

        states.forEach(st => {
            const text = this.renderer.createText(st);
            this.renderer.appendChild(createElem, text);
            this.renderer.appendChild(createElem, this.renderer.createElement('br'));
        });

        this.renderer.insertBefore(logger, createElem, logger.children[0]);
    }

    public logStateByColumn(grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent, rowIndex: string,
    field: string, logger: HTMLElement) {
        this.clearLog(logger);
        const cell = grid.getCellByColumn(parseInt(rowIndex, 10), field);
        let state: string;
        let states: string[];

        if (cell) {
            state = `
						value: ${cell.value},
						selected: ${cell.selected},
						editable: ${cell.editable},
						editMode: ${cell.editMode},
						editValue: ${cell.editValue},
						-----------------------------,
						colIndex: ${cell.column.index},
						visibleColIndex: ${cell.column.visibleIndex},
						colField: ${cell.column.field},
						-----------------------------,
						rowIndex: ${cell.row.index},
                        rowViewIndex: ${cell.row.viewIndex},
						rowKey: ${cell.row.key},
						rowData: ${cell.row.data},
						-----------------------------,
						gridId: ${cell.grid.id},
						cellID: ${cell.id},
						width: ${cell.width}`;

            states = state.split(',');
        } else {
            states = [`Cell is: ${cell}`];
        }

        const createElem = this.renderer.createElement('p');

        states.forEach(st => {
            const text = this.renderer.createText(st);
            this.renderer.appendChild(createElem, text);
            this.renderer.appendChild(createElem, this.renderer.createElement('br'));
        });

        this.renderer.insertBefore(logger, createElem, logger.children[0]);
    }

    private getIndices(indices: string): number[] {
        if (indices.length === 1) {
            indices = `0${indices}`;
        }
        let nums: number[] = indices.split('').map(n => parseInt(n, 10));
        if (nums.length === 0) {
            nums = [0, 0];
        }
        return nums;
    }
}
