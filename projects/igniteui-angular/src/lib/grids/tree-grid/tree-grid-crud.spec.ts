
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTreeGridModule, IgxTreeGridComponent } from './index';
import { IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { first } from 'rxjs/operators';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { DropPosition } from '../grid';
import { configureTestSuite } from '../../test-utils/configure-suite';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';

describe('IgxTreeGrid - CRUD', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent,
                IgxTreeGridPrimaryForeignKeyComponent
            ],
            imports: [IgxTreeGridModule]
        })
            .compileComponents();
    }));

    describe('Create', () => {
        describe('Child Collection', () => {
            configureTestSuite();

            beforeEach(async() => {
                fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
                treeGrid.height = '800px';
                await wait();
                fix.detectChanges();
            });

            fit('should support adding root row through treeGrid API', () => {
                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);

                spyOn(treeGrid.onRowAdded, 'emit');
                const newRow = {
                    ID: 777,
                    Name: 'New Employee',
                    HireDate: new Date(2018, 3, 22),
                    Age: 25,
                    Employees: []
                };
                treeGrid.addRow(newRow);
                fix.detectChanges();

                const rowDataEventArgs = /* IRowDataEventArgs */ { data: newRow };
                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith(rowDataEventArgs);
                verifyRowsCount(fix, 4, 11);
                verifyTreeGridRecordsCount(fix, 4, 11);
                verifyProcessedTreeGridRecordsCount(fix, 4, 11);
            });

            it('should support adding child rows through treeGrid API', () => {
                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);

                // Add child row on level 2
                spyOn(treeGrid.onRowAdded, 'emit');
                let newRow = {
                    ID: 777,
                    Name: 'TEST NAME 1',
                    HireDate: new Date(2018, 3, 22),
                    Age: 25,
                    Employees: []
                };
                treeGrid.addRow(newRow, 847);
                fix.detectChanges();

                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith({ data: newRow });
                verifyRowsCount(fix, 3, 11);
                verifyTreeGridRecordsCount(fix, 3, 11);
                verifyProcessedTreeGridRecordsCount(fix, 3, 11);

                // Add child row on level 3
                newRow = {
                    ID: 999,
                    Name: 'TEST NAME 2',
                    HireDate: new Date(2018, 5, 17),
                    Age: 35,
                    Employees: []
                };
                treeGrid.addRow(newRow, 317);
                fix.detectChanges();

                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith({ data: newRow });
                verifyRowsCount(fix, 3, 12);
                verifyTreeGridRecordsCount(fix, 3, 12);
                verifyProcessedTreeGridRecordsCount(fix, 3, 12);
            });

            it('should do nothing when adding child row to a non-existing parent row', () => {
                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);

                // Try adding child row to a non-existing parent row
                spyOn(treeGrid.onRowAdded, 'emit');
                const newRow = {
                    ID: 383,
                    Name: 'TEST NAME 1',
                    HireDate: new Date(2018, 3, 22),
                    Age: 55,
                    Employees: []
                };
                let error = '';
                try {
                    treeGrid.addRow(newRow, 12345);
                    fix.detectChanges();
                } catch (ex) {
                    error = (ex as Error).message;
                }
                expect(error).toMatch('Invalid parent row ID!');

                // Verify treeGrid remains unchanged
                expect(treeGrid.onRowAdded.emit).not.toHaveBeenCalled();
                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);
            });

            it('should support adding child row to \'null\' collection through treeGrid API', () => {
                // Add child row to a row that has a child collection set to 'null'
                spyOn(treeGrid.onRowAdded, 'emit');
                const newRow = {
                    ID: 888,
                    Name: 'TEST Child',
                    HireDate: new Date(2011, 1, 11),
                    Age: 25,
                    Employees: []
                };
                treeGrid.addRow(newRow, 475);
                fix.detectChanges();

                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith({ data: newRow });
                verifyRowsCount(fix, 3, 11);
                verifyTreeGridRecordsCount(fix, 3, 11);
                verifyProcessedTreeGridRecordsCount(fix, 3, 11);
            });

            it('should support adding child row to \'undefined\' collection through treeGrid API', () => {
                // Add child row to a row that has a child collection set to 'undefined'
                spyOn(treeGrid.onRowAdded, 'emit');
                const newRow = {
                    ID: 888,
                    Name: 'TEST Child',
                    HireDate: new Date(2011, 1, 11),
                    Age: 25,
                    Employees: []
                };
                treeGrid.addRow(newRow, 957);
                fix.detectChanges();

                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith({ data: newRow });
                verifyRowsCount(fix, 3, 11);
                verifyTreeGridRecordsCount(fix, 3, 11);
                verifyProcessedTreeGridRecordsCount(fix, 3, 11);
            });

            it('should support adding child row to \'non-existing\' collection through treeGrid API', () => {
                // Add child row to a row that has a child collection set to 'undefined'
                spyOn(treeGrid.onRowAdded, 'emit');
                const newRow = {
                    ID: 888,
                    Name: 'TEST Child',
                    HireDate: new Date(2011, 1, 11),
                    Age: 25,
                    Employees: []
                };
                treeGrid.addRow(newRow, 711);
                fix.detectChanges();

                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith({ data: newRow });
                verifyRowsCount(fix, 3, 11);
                verifyTreeGridRecordsCount(fix, 3, 11);
                verifyProcessedTreeGridRecordsCount(fix, 3, 11);
            });
        });

        describe('Primary/Foreign key', () => {
            configureTestSuite();
            beforeEach(async() => {
                fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
                treeGrid.height = '800px';
                await wait();
                fix.detectChanges();
            });

            it('should support adding root row through treeGrid API', () => {
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                spyOn(treeGrid.onRowAdded, 'emit');
                const newRow = {
                    ID: 777,
                    ParentID: -1,
                    Name: 'New Employee',
                    JobTitle: 'Senior Web Developer',
                    Age: 33
                };
                treeGrid.addRow(newRow);
                fix.detectChanges();

                const rowDataEventArgs = /* IRowDataEventArgs */ { data: newRow };
                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith(rowDataEventArgs);
                verifyRowsCount(fix, 9, 9);
                verifyTreeGridRecordsCount(fix, 4, 9);
                verifyProcessedTreeGridRecordsCount(fix, 4, 9);
            });

            it('should support adding child rows through treeGrid API', () => {
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                // Add child row on level 1
                spyOn(treeGrid.onRowAdded, 'emit');
                let newRow = {
                    ID: 777,
                    ParentID: 1,
                    Name: 'New Employee 1',
                    JobTitle: 'Senior Web Developer',
                    Age: 33
                };
                treeGrid.addRow(newRow, 1);
                fix.detectChanges();

                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith({ data: newRow });
                verifyRowsCount(fix, 9, 9);
                verifyTreeGridRecordsCount(fix, 3, 9);
                verifyProcessedTreeGridRecordsCount(fix, 3, 9);

                // Add child row on level 2
                newRow = {
                    ID: 333,
                    ParentID: 4,
                    Name: 'New Employee 2',
                    JobTitle: 'Senior Web Developer',
                    Age: 33
                };
                treeGrid.addRow(newRow, 4);
                fix.detectChanges();

                expect(treeGrid.onRowAdded.emit).toHaveBeenCalledWith({ data: newRow });
                verifyRowsCount(fix, 10, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);
            });

            it('should do nothing when adding child row to a non-existing parent row', () => {
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                // Try adding child row to a non-existing parent row
                spyOn(treeGrid.onRowAdded, 'emit');
                let error = '';
                const newRow = {
                    ID: 777,
                    ParentID: 12345,  // there is no row with ID=12345
                    Name: 'New Employee 1',
                    JobTitle: 'Senior Web Developer',
                    Age: 33
                };
                try {
                    treeGrid.addRow(newRow, 12345);
                    fix.detectChanges();
                } catch (ex) {
                    error = (ex as Error).message;
                }
                expect(error).toMatch('Invalid parent row ID!');

                // Verify treeGrid remains unchanged
                expect(treeGrid.onRowAdded.emit).not.toHaveBeenCalled();
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);
            });
        });
    });

    describe('Update API', () => {
        describe('Child Collection', () => {
            configureTestSuite();
            beforeEach(() => {
                fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
            });

            it('should support updating a root row through the treeGrid API', fakeAsync(() => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 0, 'Name', 'John Winchester');
                verifyRowsCount(fix, 3, 10);

                // Update row on level 1
                const oldRow = Object.assign({}, treeGrid.getRowByKey(147).rowData);
                const newRow = {
                    ID: 999,
                    Name: 'New Name',
                    HireDate: new Date(2001, 1, 1),
                    Age: 60,
                    Employees: []
                };
                treeGrid.updateRow(newRow, 147);
                fix.detectChanges();
                tick();
                const rowComponent = treeGrid.getRowByKey(999);
                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 147,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 0, 'Name', 'New Name');
                verifyRowsCount(fix, 3, 4);
            }));

            it('should support updating a child row through the treeGrid API', () => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 6, 'Name', 'Peter Lewis');
                verifyRowsCount(fix, 3, 10);

                // Update row on level 3
                const oldRow = Object.assign({}, treeGrid.getRowByKey(299).rowData);
                const newRow = {
                    ID: 888,
                    Name: 'New Name',
                    HireDate: new Date(2010, 11, 11),
                    Age: 42,
                    Employees: []
                };
                treeGrid.updateRow(newRow, 299);
                fix.detectChanges();

                const rowComponent = treeGrid.getRowByKey(888);
                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 299,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 6, 'Name', 'New Name');
                verifyRowsCount(fix, 3, 10);
            });

            it('should support updating a child row through the rowObject API', () => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 6, 'Name', 'Peter Lewis');
                verifyRowsCount(fix, 3, 10);

                // Update row on level 3
                const oldRow = Object.assign({}, treeGrid.getRowByKey(299).rowData);
                const newRow = {
                    ID: 888,
                    Name: 'New Name',
                    HireDate: new Date(2010, 11, 11),
                    Age: 42,
                    Employees: []
                };
                treeGrid.getRowByKey(299).update(newRow);
                fix.detectChanges();

                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 299,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 6, 'Name', 'New Name');
                verifyRowsCount(fix, 3, 10);
            });

            it('should support updating a child tree-cell through the treeGrid API', () => {
                // Test prerequisites: move 'Age' column so it becomes the tree-column
                const sourceColumn = treeGrid.columns.filter(c => c.field === 'Age')[0];
                const targetColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
                treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
                fix.detectChanges();

                spyOn(treeGrid.onCellEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 6, 'Age', '25');
                verifyRowsCount(fix, 3, 10);

                // Update cell on level 3
                const oldCellValue = treeGrid.getCellByKey(299, 'Age').value;
                const newCellValue = 18;
                treeGrid.updateCell(newCellValue, 299, 'Age');
                fix.detectChanges();

                const cellComponent = treeGrid.getCellByKey(299, 'Age');
                expect(treeGrid.onCellEdit.emit).toHaveBeenCalledWith({
                    rowID: cellComponent.cellID.rowID,
                    cellID: cellComponent.cellID,
                    oldValue: oldCellValue,
                    newValue: newCellValue,
                    cancel: false
                });
                verifyCellValue(fix, 6, 'Age', '18');
                verifyRowsCount(fix, 3, 10);
            });

            it('should support updating a child tree-cell through the cellObject API', () => {
                // Test prerequisites: move 'Age' column so it becomes the tree-column
                const sourceColumn = treeGrid.columns.filter(c => c.field === 'Age')[0];
                const targetColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
                treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
                fix.detectChanges();

                spyOn(treeGrid.onCellEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 6, 'Age', '25');
                verifyRowsCount(fix, 3, 10);

                // Update cell on level 3
                const oldCellValue = treeGrid.getCellByKey(299, 'Age').value;
                const newCellValue = 18;
                treeGrid.getCellByKey(299, 'Age').update(newCellValue);
                fix.detectChanges();

                const cellComponent = treeGrid.getCellByKey(299, 'Age');
                expect(treeGrid.onCellEdit.emit).toHaveBeenCalledWith({
                    rowID: cellComponent.cellID.rowID,
                    cellID: cellComponent.cellID,
                    oldValue: oldCellValue,
                    newValue: newCellValue,
                    cancel: false
                });
                verifyCellValue(fix, 6, 'Age', '18');
                verifyRowsCount(fix, 3, 10);
            });
        });

        describe('Primary/Foreign key', () => {
            configureTestSuite();
            beforeEach(() => {
                fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
            });

            it('should support updating a root row through the treeGrid API', () => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 0, 'Name', 'Casey Houston');
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);

                // Update row on level 1
                const oldRow = Object.assign({}, treeGrid.getRowByKey(1).rowData);
                const newRow = {
                    ID: 1,
                    ParentID: -1,
                    Name: 'New Name',
                    JobTitle: 'CFO',
                    Age: 40
                };
                treeGrid.updateRow(newRow, 1);
                fix.detectChanges();

                const rowComponent = treeGrid.getRowByKey(1);
                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 1,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 0, 'Name', 'New Name');
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
            });

            it('should support updating a root row by changing its ID (its children should become root rows)', () => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 0, 'Name', 'Casey Houston');
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // Second visible row is on level 2 (childrow)

                // Update row on level 1
                const oldRow = Object.assign({}, treeGrid.getRowByKey(1).rowData);
                const newRow = {
                    ID: 999, // Original ID is 1 and the new one is 999, which will transform its child rows into root rows.
                    ParentID: -1,
                    Name: 'New Name',
                    JobTitle: 'CFO',
                    Age: 40
                };
                treeGrid.updateRow(newRow, 1);
                fix.detectChanges();

                const rowComponent = treeGrid.getRowByKey(999);
                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 1,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 0, 'Name', 'New Name');
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 5, 8); // Root records increment count with 2
                TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 0); // Second visible row is now on level 1 (rootrow)
            });

            it('should support updating a child row through the treeGrid API', () => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 3, 'Name', 'Debra Morton');
                verifyRowsCount(fix, 8, 8);

                // Update row on level 3
                const oldRow = Object.assign({}, treeGrid.getRowByKey(7).rowData);
                const newRow = {
                    ID: 888,
                    ParentID: 2,
                    Name: 'New Name',
                    JobTitle: 'Web Developer',
                    Age: 42
                };
                treeGrid.updateRow(newRow, 7);
                fix.detectChanges();

                const rowComponent = treeGrid.getRowByKey(888);
                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 7,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 3, 'Name', 'New Name');
                verifyRowsCount(fix, 8, 8);
            });

            it('should support updating a child row through the rowObject API', () => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 3, 'Name', 'Debra Morton');
                verifyRowsCount(fix, 8, 8);

                // Update row on level 3
                const oldRow = Object.assign({}, treeGrid.getRowByKey(7).rowData);
                const newRow = {
                    ID: 888,
                    ParentID: 2,
                    Name: 'New Name',
                    JobTitle: 'Web Developer',
                    Age: 42
                };
                treeGrid.getRowByKey(7).update(newRow);
                fix.detectChanges();

                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 7,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 3, 'Name', 'New Name');
                verifyRowsCount(fix, 8, 8);
            });

            it('should support updating a child row by changing its original parentID', () => {
                spyOn(treeGrid.onRowEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 3, 'Name', 'Debra Morton');
                verifyCellValue(fix, 5, 'Name', 'Erma Walsh');
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);

                // Update row on level 3
                const oldRow = Object.assign({}, treeGrid.getRowByKey(7).rowData);
                const newRow = {
                    ID: 888,
                    ParentID: -1, // Original ID is 2 and the new one is -1, which will make the row a root row.
                    Name: 'New Name',
                    JobTitle: 'Web Developer',
                    Age: 42
                };
                treeGrid.getRowByKey(7).update(newRow);
                fix.detectChanges();

                const rowComponent = treeGrid.getRowByKey(4); // original component: Name = 'Jack Simon'
                expect(treeGrid.onRowEdit.emit).toHaveBeenCalledWith({
                    rowID: 7,
                    oldValue: oldRow,
                    newValue: newRow,
                    cancel: false
                });
                verifyCellValue(fix, 3, 'Name', 'Jack Simon');
                verifyCellValue(fix, 5, 'Name', 'New Name');
                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 4, 8); // Root rows count increment with 1 due to the row update.
            });

            it('should support updating a child tree-cell through the treeGrid API', () => {
                // Test prerequisites: move 'Name' column so it becomes the tree-column
                const sourceColumn = treeGrid.columns.filter(c => c.field === 'Name')[0];
                const targetColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
                treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
                fix.detectChanges();

                spyOn(treeGrid.onCellEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 3, 'Name', 'Debra Morton');
                verifyRowsCount(fix, 8, 8);

                // Update cell on level 3
                const oldCellValue = treeGrid.getCellByKey(7, 'Name').value;
                const newCellValue = 'Michael Myers';
                treeGrid.updateCell(newCellValue, 7, 'Name');
                fix.detectChanges();

                const cellComponent = treeGrid.getCellByKey(7, 'Name');
                expect(treeGrid.onCellEdit.emit).toHaveBeenCalledWith({
                    rowID: cellComponent.cellID.rowID,
                    cellID: cellComponent.cellID,
                    oldValue: oldCellValue,
                    newValue: newCellValue,
                    cancel: false
                });
                verifyCellValue(fix, 3, 'Name', 'Michael Myers');
                verifyRowsCount(fix, 8, 8);
            });

            it('should support updating a child tree-cell through the cellObject API', () => {
                // Test prerequisites: move 'Name' column so it becomes the tree-column
                const sourceColumn = treeGrid.columns.filter(c => c.field === 'Name')[0];
                const targetColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
                treeGrid.moveColumn(sourceColumn, targetColumn, DropPosition.BeforeDropTarget);
                fix.detectChanges();

                spyOn(treeGrid.onCellEdit, 'emit').and.callThrough();

                verifyCellValue(fix, 3, 'Name', 'Debra Morton');
                verifyRowsCount(fix, 8, 8);

                // Update cell on level 3
                const oldCellValue = treeGrid.getCellByKey(7, 'Name').value;
                const newCellValue = 'Michael Myers';
                // treeGrid.updateCell(newCellValue, 7, 'Name');
                treeGrid.getCellByKey(7, 'Name').update(newCellValue);
                fix.detectChanges();

                const cellComponent = treeGrid.getCellByKey(7, 'Name');
                expect(treeGrid.onCellEdit.emit).toHaveBeenCalledWith({
                    rowID: cellComponent.cellID.rowID,
                    cellID: cellComponent.cellID,
                    oldValue: oldCellValue,
                    newValue: newCellValue,
                    cancel: false
                });
                verifyCellValue(fix, 3, 'Name', 'Michael Myers');
                verifyRowsCount(fix, 8, 8);
            });
        });
    });

    describe('Update UI', () => {
        describe('Child Collection', () => {
            configureTestSuite();
            beforeEach(() => {
                fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
                for (const col of treeGrid.columns) {
                    col.editable = true;
                }
            });

            it('should be able to enter edit mode of a tree-grid column on dblclick, enter and F2', async() => {
                const allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                const cellDOM = allCells[0];
                const cell = treeGrid.getCellByColumn(0, 'ID');

                cellDOM.nativeElement.dispatchEvent(new Event('focus'));
                fix.detectChanges();

                cellDOM.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with double click');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with double click');

                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with enter');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with enter');

                UIInteractions.triggerKeyDownEvtUponElem('f2', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with F2');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with F2');
            });

            it('should be able to enter edit mode of a non-tree-grid column on dblclick, enter and F2', async() => {
                const allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                const cellDOM = allCells[1];
                const cell = treeGrid.getCellByColumn(0, 'Name');

                cellDOM.nativeElement.dispatchEvent(new Event('focus'));
                fix.detectChanges();

                cellDOM.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with double click');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with double click');

                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with enter');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with enter');

                UIInteractions.triggerKeyDownEvtUponElem('f2', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with F2');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with F2');
            });

            it('should be able to edit a tree-grid cell through UI', async() => {
                const cell = treeGrid.getCellByColumn(0, 'ID');
                const cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                cellDomNumber.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);

                expect(cell.inEditMode).toBe(true);
                const editTemplate = cellDomNumber.query(By.css('input'));
                expect(editTemplate).toBeDefined();

                UIInteractions.sendInput(editTemplate, 146);
                await wait(DEBOUNCETIME);
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);

                fix.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(parseInt(cell.value, 10)).toBe(146);
                expect(editTemplate.nativeElement.type).toBe('number');
                verifyCellValue(fix, 0, 'ID', '146');
            });

            it('should be able to edit a non-tree-grid cell through UI', async() => {
                const cell = treeGrid.getCellByColumn(0, 'Name');
                const cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

                cellDomNumber.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);

                expect(cell.inEditMode).toBe(true);
                const editTemplate = cellDomNumber.query(By.css('input'));
                expect(editTemplate).toBeDefined();

                UIInteractions.sendInput(editTemplate, 'Abc Def');
                await wait(DEBOUNCETIME);
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);

                fix.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(cell.value).toBe('Abc Def');
                expect(editTemplate.nativeElement.type).toBe('text');
                verifyCellValue(fix, 0, 'Name', 'Abc Def');
            });

            it('should emit an event when editing a tree-grid cell through UI', async() => {
                const cellComponent = treeGrid.getCellByColumn(0, 'ID');
                const cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                treeGrid.onCellEdit.pipe(first()).subscribe((args) => {
                    expect(args.newValue).toBe(146);
                });

                cellDomNumber.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);

                expect(cellComponent.inEditMode).toBe(true);
                const editTemplate = cellDomNumber.query(By.css('input'));
                expect(editTemplate).toBeDefined();

                UIInteractions.sendInput(editTemplate, '146');
                await wait(DEBOUNCETIME);

                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);
                fix.detectChanges();
            });
        });

        describe('Primary/Foreign key', () => {
            configureTestSuite();
            beforeEach(() => {
                fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
                for (const col of treeGrid.columns) {
                    col.editable = true;
                }
            });

            it('should be able to enter edit mode of a tree-grid column on dblclick, enter and F2', async() => {
                const allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                const cellDOM = allCells[0];
                const cell = treeGrid.getCellByColumn(0, 'ID');

                cellDOM.nativeElement.dispatchEvent(new Event('focus'));
                fix.detectChanges();

                cellDOM.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with double click');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with double click');

                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with enter');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with enter');

                UIInteractions.triggerKeyDownEvtUponElem('f2', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with F2');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with F2');
            });

            it('should be able to enter edit mode of a non-tree-grid column on dblclick, enter and F2', async() => {
                const allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
                const cellDOM = allCells[2];
                const cell = treeGrid.getCellByColumn(0, 'Name');

                cellDOM.nativeElement.dispatchEvent(new Event('focus'));
                fix.detectChanges();

                cellDOM.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with double click');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with double click');

                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with enter');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with enter');

                UIInteractions.triggerKeyDownEvtUponElem('f2', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(true, 'cannot enter edit mode with F2');

                UIInteractions.triggerKeyDownEvtUponElem('escape', cellDOM.nativeElement, true);
                await wait(DEBOUNCETIME);
                expect(cell.inEditMode).toBe(false, 'cannot exit edit mode after entering with F2');
            });

            it('should be able to edit a tree-grid cell through UI', async() => {
                const cell = treeGrid.getCellByColumn(0, 'ID');
                const cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                cellDomNumber.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);

                expect(cell.inEditMode).toBe(true);
                const editTemplate = cellDomNumber.query(By.css('input'));
                expect(editTemplate).toBeDefined();

                UIInteractions.sendInput(editTemplate, 146);
                await wait(DEBOUNCETIME);
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);

                fix.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(parseInt(cell.value, 10)).toBe(146);
                expect(editTemplate.nativeElement.type).toBe('number');
                verifyCellValue(fix, 0, 'ID', '146');
            });

            it('should be able to edit a non-tree-grid cell through UI', async() => {
                const cell = treeGrid.getCellByColumn(0, 'Name');
                const cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2];

                cellDomNumber.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);

                expect(cell.inEditMode).toBe(true);
                const editTemplate = cellDomNumber.query(By.css('input'));
                expect(editTemplate).toBeDefined();

                UIInteractions.sendInput(editTemplate, 'Abc Def');
                await wait(DEBOUNCETIME);
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);

                fix.detectChanges();
                expect(cell.inEditMode).toBe(false);
                expect(cell.value).toBe('Abc Def');
                expect(editTemplate.nativeElement.type).toBe('text');
                verifyCellValue(fix, 0, 'Name', 'Abc Def');
            });

            it('should emit an event when editing a tree-grid cell through UI', async() => {
                const cellComponent = treeGrid.getCellByColumn(0, 'ID');
                const cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

                treeGrid.onCellEdit.pipe(first()).subscribe((args) => {
                    expect(args.newValue).toBe(146);
                });

                cellDomNumber.triggerEventHandler('dblclick', new Event('dblclick'));
                await wait(DEBOUNCETIME);

                expect(cellComponent.inEditMode).toBe(true);
                const editTemplate = cellDomNumber.query(By.css('input'));
                expect(editTemplate).toBeDefined();

                UIInteractions.sendInput(editTemplate, '146');
                await wait(DEBOUNCETIME);
                UIInteractions.triggerKeyDownEvtUponElem('enter', cellDomNumber.nativeElement, true);
                await wait(DEBOUNCETIME);
            });
        });

    });

    describe('Delete', () => {
        describe('Child Collection', () => {
            configureTestSuite();
            beforeEach(() => {
                fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
            });

            it('should delete a root level row by ID', () => {
                let someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(147);

                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);

                treeGrid.deleteRow(someRow.rowID);
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(19);

                verifyRowsCount(fix, 2, 3);
                verifyTreeGridRecordsCount(fix, 2, 3);
                verifyProcessedTreeGridRecordsCount(fix, 2, 3);
            });

            it('should delete a child level row by ID', () => {
                let someRow = treeGrid.getRowByIndex(3);
                expect(someRow.rowID).toBe(317);

                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);

                treeGrid.deleteRow(someRow.rowID);
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(3);
                expect(someRow.rowID).toBe(19);

                verifyRowsCount(fix, 3, 6);
                verifyTreeGridRecordsCount(fix, 3, 6);
                verifyProcessedTreeGridRecordsCount(fix, 3, 6);
            });

            it('should delete a root level row through the row object', () => {
                let someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(147);

                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);

                someRow.delete();
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(19);

                verifyRowsCount(fix, 2, 3);
                verifyTreeGridRecordsCount(fix, 2, 3);
                verifyProcessedTreeGridRecordsCount(fix, 2, 3);
            });

            it('should delete a child level row through the row object', () => {
                let someRow = treeGrid.getRowByIndex(3);
                expect(someRow.rowID).toBe(317);

                verifyRowsCount(fix, 3, 10);
                verifyTreeGridRecordsCount(fix, 3, 10);
                verifyProcessedTreeGridRecordsCount(fix, 3, 10);

                someRow.delete();
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(3);
                expect(someRow.rowID).toBe(19);

                verifyRowsCount(fix, 3, 6);
                verifyTreeGridRecordsCount(fix, 3, 6);
                verifyProcessedTreeGridRecordsCount(fix, 3, 6);
            });

            it('should emit an event when deleting row by ID', (done) => {
                treeGrid.onRowDeleted.pipe(first()).subscribe((args) => {
                    expect(args.data.ID).toBe(147);
                    expect(args.data.Name).toBe('John Winchester');
                    done();
                });
                const someRow = treeGrid.getRowByIndex(0);
                treeGrid.deleteRow(someRow.rowID);
            });

            it('should emit an event when deleting row through the row object', (done) => {
                treeGrid.onRowDeleted.pipe(first()).subscribe((args) => {
                    expect(args.data.ID).toBe(147);
                    expect(args.data.Name).toBe('John Winchester');
                    done();
                });
                const someRow = treeGrid.getRowByIndex(0);
                someRow.delete();
            });
        });

        describe('Primary/Foreign key', () => {
            configureTestSuite();
            beforeEach(() => {
                fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
                fix.detectChanges();
                treeGrid = fix.componentInstance.treeGrid;
                treeGrid.cascadeOnDelete = false;
            });

            it('should delete a root level row by ID', () => {
                let someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(1);

                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                treeGrid.deleteRow(someRow.rowID);
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(2);

                verifyRowsCount(fix, 7, 7);
                verifyTreeGridRecordsCount(fix, 4, 7);
                verifyProcessedTreeGridRecordsCount(fix, 4, 7);
            });

            it('should delete a child level row by ID', () => {
                let someRow = treeGrid.getRowByIndex(1);
                expect(someRow.rowID).toBe(2);

                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                treeGrid.deleteRow(someRow.rowID);
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(1);
                expect(someRow.rowID).toBe(4);

                verifyRowsCount(fix, 7, 7);
                verifyTreeGridRecordsCount(fix, 5, 7);
                verifyProcessedTreeGridRecordsCount(fix, 5, 7);
            });

            it('should delete a root level row through the row object', () => {
                let someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(1);

                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                someRow.delete();
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(0);
                expect(someRow.rowID).toBe(2);

                verifyRowsCount(fix, 7, 7);
                verifyTreeGridRecordsCount(fix, 4, 7);
                verifyProcessedTreeGridRecordsCount(fix, 4, 7);
            });

            it('should delete a child level row through the row object', () => {
                let someRow = treeGrid.getRowByIndex(1);
                expect(someRow.rowID).toBe(2);

                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                someRow.delete();
                fix.detectChanges();
                someRow = treeGrid.getRowByIndex(1);
                expect(someRow.rowID).toBe(4);

                verifyRowsCount(fix, 7, 7);
                verifyTreeGridRecordsCount(fix, 5, 7);
                verifyProcessedTreeGridRecordsCount(fix, 5, 7);
            });

            it('should emit an event when deleting row by ID', (done) => {
                treeGrid.onRowDeleted.pipe(first()).subscribe((args) => {
                    expect(args.data.ID).toBe(1);
                    expect(args.data.Name).toBe('Casey Houston');
                    done();
                });
                const someRow = treeGrid.getRowByIndex(0);
                treeGrid.deleteRow(someRow.rowID);
            });

            it('should emit an event when deleting row through the row object', (done) => {
                treeGrid.onRowDeleted.pipe(first()).subscribe((args) => {
                    expect(args.data.ID).toBe(1);
                    expect(args.data.Name).toBe('Casey Houston');
                    done();
                });
                const someRow = treeGrid.getRowByIndex(0);
                someRow.delete();
            });

            it('should delete child rows of a parent row when the "cascadeOnDelete" is set (delete by ID)', () => {
                treeGrid.cascadeOnDelete = true;

                let aRow = treeGrid.getRowByIndex(0);
                expect(aRow.rowID).toBe(1);

                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                treeGrid.deleteRow(aRow.rowID);
                fix.detectChanges();
                aRow = treeGrid.getRowByIndex(0);
                expect(aRow.rowID).toBe(6);

                verifyRowsCount(fix, 3, 3);
                verifyTreeGridRecordsCount(fix, 2, 3);
                verifyProcessedTreeGridRecordsCount(fix, 2, 3);
            });

            it('should delete child rows of a parent row when the "cascadeOnDelete" is set (delete by API)', () => {
                treeGrid.cascadeOnDelete = true;

                let aRow = treeGrid.getRowByIndex(0);
                expect(aRow.rowID).toBe(1);

                verifyRowsCount(fix, 8, 8);
                verifyTreeGridRecordsCount(fix, 3, 8);
                verifyProcessedTreeGridRecordsCount(fix, 3, 8);

                aRow.delete();
                fix.detectChanges();
                aRow = treeGrid.getRowByIndex(0);
                expect(aRow.rowID).toBe(6);

                verifyRowsCount(fix, 3, 3);
                verifyTreeGridRecordsCount(fix, 2, 3);
                verifyProcessedTreeGridRecordsCount(fix, 2, 3);
            });
        });
    });
});

function verifyRowsCount(fix, expectedRootRowsCount, expectedVisibleRowsCount) {
    const treeGrid = fix.componentInstance.treeGrid;
    expect(TreeGridFunctions.getAllRows(fix).length).toBe(expectedVisibleRowsCount, 'Incorrect DOM rows length.');
    expect(treeGrid.data.length).toBe(expectedRootRowsCount, 'Incorrect data length.');
    expect(treeGrid.dataRowList.length).toBe(expectedVisibleRowsCount, 'Incorrect dataRowList length.');
}

function verifyTreeGridRecordsCount(fix, expectedRootRecordsCount, expectedFlatRecordsCount) {
    const treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
    expect(treeGrid.rootRecords.length).toBe(expectedRootRecordsCount);
    expect(treeGrid.records.size).toBe(expectedFlatRecordsCount);
}

function verifyProcessedTreeGridRecordsCount(fix, expectedProcessedRootRecordsCount, expectedProcessedFlatRecordsCount) {
    const treeGrid = fix.componentInstance.treeGrid as IgxTreeGridComponent;
    expect(treeGrid.processedRootRecords.length).toBe(expectedProcessedRootRecordsCount);
    expect(treeGrid.processedRecords.size).toBe(expectedProcessedFlatRecordsCount);
}

function verifyCellValue(fix, rowIndex, columnKey, expectedCellValue) {
    const treeGrid = fix.componentInstance.treeGrid;
    const actualValue = TreeGridFunctions.getCellValue(fix, rowIndex, columnKey);
    const actualAPIValue = treeGrid.getRowByIndex(rowIndex).cells.filter((c) => c.column.field === columnKey)[0].value;
    expect(actualValue.toString()).toBe(expectedCellValue, 'incorrect cell value');
    expect(actualAPIValue.toString()).toBe(expectedCellValue, 'incorrect api cell value');
}
