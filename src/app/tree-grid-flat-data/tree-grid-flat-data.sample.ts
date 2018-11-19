import { Component, Injectable, ViewChild, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { IgxTreeGridComponent, IgxHierarchicalTransactionService, IgxGridTransaction } from 'igniteui-angular';

@Component({
    providers: [{ provide: IgxGridTransaction, useClass: IgxHierarchicalTransactionService }],
    selector: 'app-tree-grid-flat-data-sample',
    styleUrls: ['tree-grid-flat-data.sample.css'],
    templateUrl: 'tree-grid-flat-data.sample.html'
})
export class TreeGridFlatDataSampleComponent implements OnInit {

    public data: Array<any>;
    public columns: Array<any>;
    private nextRow = 1;

    @ViewChild('grid1') public grid1: IgxTreeGridComponent;

    public density = '';
    public displayDensities;

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];

        this.columns = [
            { field: 'employeeID', label: 'ID', width: 200, resizable: true, movable: true, dataType: 'number' },
            { field: 'firstName', label: 'First Name', width: 300, resizable: true, movable: true, dataType: 'string' },
            { field: 'lastName', label: 'Last Name', width: 150, resizable: true, movable: true, dataType: 'string' },
            { field: 'Title', label: 'Title', width: 200, resizable: true, movable: true, dataType: 'string' }
        ];
        this.data = [
            { 'employeeID': 0, 'PID': -1, 'firstName': 'Andrew', 'lastName': 'Fuller', 'Title': 'Vice President, Sales' },
            { 'employeeID': 1, 'PID': -1, 'firstName': 'Jonathan', 'lastName': 'Smith', 'Title': 'Human resources' },
            { 'employeeID': 2, 'PID': -1, 'firstName': 'Nancy', 'lastName': 'Davolio', 'Title': 'CFO' },
            { 'employeeID': 3, 'PID': -1, 'firstName': 'Steven', 'lastName': 'Buchanan', 'Title': 'CTO' },
            // sub of ID 0
            { 'employeeID': 4, 'PID': 0, 'firstName': 'Janet', 'lastName': 'Leverling', 'Title': 'Sales Manager' },
            { 'employeeID': 5, 'PID': 0, 'firstName': 'Laura', 'lastName': 'Callahan', 'Title': 'Inside Sales Coordinator' },
            { 'employeeID': 6, 'PID': 0, 'firstName': 'Margaret', 'lastName': 'Peacock', 'Title': 'Sales Representative' },
            { 'employeeID': 7, 'PID': 0, 'firstName': 'Michael', 'lastName': 'Suyama', 'Title': 'Sales Representative' },
            // sub of ID 4
            { 'employeeID': 8, 'PID': 4, 'firstName': 'Anne', 'lastName': 'Dodsworth', 'Title': 'Sales Representative' },
            { 'employeeID': 9, 'PID': 4, 'firstName': 'Danielle', 'lastName': 'Davis', 'Title': 'Sales Representative' },
            { 'employeeID': 10, 'PID': 4, 'firstName': 'Robert', 'lastName': 'King', 'Title': 'Sales Representative' },
            // sub of ID 2
            { 'employeeID': 11, 'PID': 2, 'firstName': 'Peter', 'lastName': 'Lewis', 'Title': 'Chief Accountant' },
            { 'employeeID': 12, 'PID': 2, 'firstName': 'Ryder', 'lastName': 'Zenaida', 'Title': 'Accountant' },
            { 'employeeID': 13, 'PID': 2, 'firstName': 'Wang', 'lastName': 'Mercedes', 'Title': 'Accountant' },
            // sub of ID 3
            { 'employeeID': 14, 'PID': 3, 'firstName': 'Theodore', 'lastName': 'Zia', 'Title': 'Software Architect' },
            { 'employeeID': 15, 'PID': 3, 'firstName': 'Lacota', 'lastName': 'Mufutau', 'Title': 'Product Manager' },
            // sub of ID 16
            { 'employeeID': 16, 'PID': 15, 'firstName': 'Jin', 'lastName': 'Elliott', 'Title': 'Product Owner' },
            { 'employeeID': 17, 'PID': 15, 'firstName': 'Armand', 'lastName': 'Ross', 'Title': 'Product Owner' },
            { 'employeeID': 18, 'PID': 15, 'firstName': 'Dane', 'lastName': 'Rodriquez', 'Title': 'Team Leader' },
            // sub of ID 19
            { 'employeeID': 19, 'PID': 18, 'firstName': 'Declan', 'lastName': 'Lester', 'Title': 'Senior Software Developer' },
            { 'employeeID': 20, 'PID': 18, 'firstName': 'Bernard', 'lastName': 'Jarvis', 'Title': 'Senior Software Developer' },
            { 'employeeID': 21, 'PID': 18, 'firstName': 'Jason', 'lastName': 'Clark', 'Title': 'QA' },
            { 'employeeID': 22, 'PID': 18, 'firstName': 'Mark', 'lastName': 'Young', 'Title': 'QA' },
            // sub of ID 20
            { 'employeeID': 23, 'PID': 20, 'firstName': 'Jeremy', 'lastName': 'Donaldson', 'Title': 'Software Developer' }
        ];
    }

    public addRow() {
        this.grid1.addRow({
            'employeeID': this.data.length + this.nextRow++,
            'PID': -1,
            'firstName': 'John',
            'lastName': 'Doe',
            'Title': 'Junior Sales Representative'
        });
    }

    public addChildRow() {
        const selectedRowId = this.grid1.selectedRows()[0];
        this.grid1.addRow(
            {
                'employeeID': this.data.length + this.nextRow++,
                'firstName': `Added `,
                'lastName': 'Added',
                'Title': 'Sales Manager'
            },
            selectedRowId);
    }

    public deleteRow() {
        this.grid1.deleteRowById(this.grid1.selectedRows()[0]);
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
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
}
