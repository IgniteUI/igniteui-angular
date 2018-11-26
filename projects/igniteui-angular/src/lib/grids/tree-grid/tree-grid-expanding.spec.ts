import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './index';
import {
    IgxTreeGridExpandingComponent,
    IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridRowEditingComponent
} from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { first } from 'rxjs/operators';

describe('IgxTreeGrid - Expanding / Collapsing', () => {
    configureTestSuite();
    let fix;
    let treeGrid;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridExpandingComponent,
                IgxTreeGridPrimaryForeignKeyComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule]
        })
        .compileComponents();
    }));

    describe('Child Collection', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridExpandingComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('check row expanding and collapsing are changing rows count (UI)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            const firstRow = rows[0];
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('check row expanding and collapsing are changing rows count (API)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('check expand/collapse indicator changes (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[rowToToggle]);
                indicatorDiv.triggerEventHandler('click', new Event('click'));

                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }

                indicatorDiv.triggerEventHandler('click', new Event('click'));
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
        });

        it('check expand/collapse indicator changes (API)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                treeGrid.toggleRow(treeGrid.getRowByIndex(rowToToggle).rowID);
                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }
                treeGrid.toggleRow(treeGrid.getRowByIndex(rowToToggle).rowID);
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
        });

        it('check second level records are having the correct indentation (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 1);
        });

        it('check second level records are having the correct indentation (API)', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 1);
        });

        it('check third level records are having the correct indentation (UI)', () => {
            // expand second level records
            let rows = TreeGridFunctions.getAllRows(fix);
            let indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            // expand third level record
            rows = TreeGridFunctions.getAllRows(fix);
            indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[3]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 4, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 5, 2);
        });

        it('check third level records are having the correct indentation (API)', () => {
            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 4, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 5, 2);
        });

        it('check grand children are not visible when collapsing their grand parent', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(9);

            // collapse first row with all its children and grand children
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('should expand/collapse rows when changing the \'expanded\' property', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            // expand a root level row
            let aRow = treeGrid.getRowByIndex(0);
            expect(aRow.cells.first.value).toBe(147, 'wrong root level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7, 'root level row expanding problem');

            // expand a second level row
            aRow = treeGrid.getRowByIndex(3);
            expect(aRow.cells.first.value).toBe(317, 'wrong second level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(9, 'second level row expanding problem');

            // check third level rows are having the correct values
            aRow = treeGrid.getRowByIndex(4);
            expect(aRow.cells.first.value).toBe(711, 'wrong third level row');
            aRow = treeGrid.getRowByIndex(5);
            expect(aRow.cells.first.value).toBe(998, 'wrong third level row');

            // collapse a second level row
            aRow = treeGrid.getRowByIndex(3);
            aRow.expanded = false;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7, 'second level row collapsing problem');

            // collapse a root level row
            aRow = treeGrid.getRowByIndex(0);
            aRow.expanded = false;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4, 'root level row collapsing problem');
        });

        it('should expand/collapse when using \'expandAll\' and \'collapseAll\' methods', () => {
            treeGrid.perPage = 50;

            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);

            treeGrid.expandAll();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(12);

            treeGrid.collapseAll();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(4);
        });

        it('should emit an event when expanding rows (API)', (done) => {
            const aRow = treeGrid.getRowByIndex(0);
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            aRow.expanded = true;
        });

        it('should emit an event when collapsing rows (API)', (done) => {
            const aRow = treeGrid.getRowByIndex(0);
            aRow.expanded = true;
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            aRow.expanded = false;
        });

        it('should emit an event when expanding rows (UI)', (done) => {
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        });

        it('should emit an event when collapsing rows (UI)', (done) => {
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID.ID).toBe(147);
                done();
            });
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        });

        it('should update current page when \'collapseAll\' ', () => {
            // Test prerequisites
            treeGrid.paging = true;
            treeGrid.perPage = 4;
            fix.detectChanges();
            treeGrid.expandAll();
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 4, '147', '1 of 5', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(5);

            // Go to fourth page
            treeGrid.page = 3;
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 4, '17', '4 of 5', [false, false, false, false]);
            expect(treeGrid.totalPages).toBe(5);

            treeGrid.collapseAll();
            fix.detectChanges();

            // Verify current page is the first one and only root rows are visible.
            verifyGridPager(fix, 4, '147', '1 of 1', [true, true, true, true]);
            expect(treeGrid.totalPages).toBe(1);
        });
    });

    describe('Primary/Foreign key', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            treeGrid.expansionDepth = 0;
            fix.detectChanges();
        });

        it('check row expanding and collapsing are changing rows count (UI)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            const firstRow = rows[0];
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('check row expanding and collapsing are changing rows count (API)', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('check expand/collapse indicator changes (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[rowToToggle]);
                indicatorDiv.triggerEventHandler('click', new Event('click'));

                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }

                indicatorDiv.triggerEventHandler('click', new Event('click'));
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
        });

        it('check expand/collapse indicator changes (API)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });

            for (let rowToToggle = 0; rowToToggle < rows.length; rowToToggle++) {
                treeGrid.toggleRow(treeGrid.getRowByIndex(rowToToggle).rowID);
                for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                    if (rowToCheck === rowToToggle) {
                        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                    } else {
                        TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                    }
                }
                treeGrid.toggleRow(treeGrid.getRowByIndex(rowToToggle).rowID);
            }

            rows.forEach(row => {
                TreeGridFunctions.verifyTreeRowHasCollapsedIcon(row);
            });
        });

        it('check second level records are having the correct indentation (UI)', () => {
            const rows = TreeGridFunctions.getAllRows(fix);
            const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 0);
        });

        it('check second level records are having the correct indentation (API)', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 1, 1); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 1);
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 0);
        });

        it('check third level records are having the correct indentation (UI)', () => {
            // expand second level records
            let rows = TreeGridFunctions.getAllRows(fix);
            let indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[0]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            // expand third level record
            rows = TreeGridFunctions.getAllRows(fix);
            indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rows[1]);
            indicatorDiv.triggerEventHandler('click', new Event('click'));

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 2);
        });

        it('check third level records are having the correct indentation (API)', () => {
            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).rowID);

            // check third level records indentation
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 2, 2); // fix, rowIndex, expectedLevel
            TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 3, 2);
        });

        it('check grand children are not visible when collapsing their grand parent', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            // expand second level records
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            // expand third level record
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).rowID);

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7);

            // collapse first row with all its children and grand children
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);

            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('should expand/collapse rows when changing the \'expanded\' property', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            // expand a root level row
            let aRow = treeGrid.getRowByIndex(0);
            expect(aRow.cells.first.value).toBe(1, 'wrong root level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5, 'root level row expanding problem');

            // expand a second level row
            aRow = treeGrid.getRowByIndex(1);
            expect(aRow.cells.first.value).toBe(2, 'wrong second level row');
            expect(aRow.expanded).toBe(false);
            aRow.expanded = true;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(7, 'second level row expanding problem');

            // check third level rows are having the correct values
            aRow = treeGrid.getRowByIndex(2);
            expect(aRow.cells.first.value).toBe(3, 'wrong third level row');
            aRow = treeGrid.getRowByIndex(3);
            expect(aRow.cells.first.value).toBe(7, 'wrong third level row');

            // collapse a second level row
            aRow = treeGrid.getRowByIndex(1);
            aRow.expanded = false;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(5, 'second level row collapsing problem');

            // collapse a root level row
            aRow = treeGrid.getRowByIndex(0);
            aRow.expanded = false;
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3, 'root level row collapsing problem');
        });

        it('should expand/collapse when using \'expandAll\' and \'collapseAll\' methods', () => {
            let rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);

            treeGrid.expandAll();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);

            treeGrid.collapseAll();
            rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(3);
        });

        it('should emit an event when expanding rows (API)', (done) => {
            const aRow = treeGrid.getRowByIndex(0);
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID).toBe(1);
                done();
            });
            aRow.expanded = true;
        });

        it('should emit an event when collapsing rows (API)', (done) => {
            const aRow = treeGrid.getRowByIndex(0);
            aRow.expanded = true;
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeUndefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID).toBe(1);
                done();
            });
            aRow.expanded = false;
        });

        it('should emit an event when expanding rows (UI)', (done) => {
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(true);
                expect(args.rowID).toBe(1);
                done();
            });
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        });

        it('should emit an event when collapsing rows (UI)', (done) => {
            const rowsDOM = TreeGridFunctions.getAllRows(fix);
            const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
            treeGrid.onRowToggle.pipe(first()).subscribe((args) => {
                expect(args.cancel).toBe(false);
                expect(args.event).toBeDefined();
                expect(args.expanded).toBe(false);
                expect(args.rowID).toBe(1);
                done();
            });
            indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        });

        it('should update current page when \'collapseAll\' ', () => {
            // Test prerequisites
            treeGrid.paging = true;
            treeGrid.perPage = 2;
            fix.detectChanges();
            treeGrid.expandAll();
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 2, '1', '1 of 4', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(4);

            // Go to fourth page
            treeGrid.page = 3;
            fix.detectChanges();

            // Verify current page
            verifyGridPager(fix, 2, '10', '4 of 4', [false, false, true, true]);
            expect(treeGrid.totalPages).toBe(4);

            treeGrid.collapseAll();
            fix.detectChanges();

            // Verify current page is the first one and only root rows are visible.
            verifyGridPager(fix, 2, '1', '1 of 2', [true, true, false, false]);
            expect(treeGrid.totalPages).toBe(2);
        });
    });

});

describe('Row editing expanding/collapsing', () => {
    configureTestSuite();
    let fix;
    let treeGrid;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridRowEditingComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxTreeGridModule]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(IgxTreeGridRowEditingComponent);
        fix.detectChanges();
        treeGrid = fix.componentInstance.treeGrid;
    });

    it('Hide banner with collapsing a node, using UI', fakeAsync(() => {
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeFalsy('Edit overlay should be visible');

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should hide');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should not show again');
    }));

    it('Hide banner with collapsing a node, using API', fakeAsync(() => {
        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeFalsy('Edit overlay should be visible');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should hide');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(treeGrid.rowEditingOverlay.collapsed).toBeTruthy('Edit overlay should not show again');
    }));

    // The following tests were written,
    // when collapsing/expanding was not causing cell/row to exit edit mode.
    // They were checking if row edit was hidden/shown.
    // Later any collapse/expand of the tree grid was exiting edit mode.
    // Please delete those test if you don't think this functionality will be reverted
    // and cell will stay in edit mode even row is collapsed/expanded.

    /*it('Hide banner with collapsing a parent node, using UI', fakeAsync(() => {
        // Test summary: Edit first child of the first row, then collapse parent row and see that row overlay is hidden.
        // Then expand again parent row and see that overlay is visible. All this clicking row indicator.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('none');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Hide banner with collapsing a parent node, using API', fakeAsync(() => {
        // Test summary: Edit first child of the first row, then collapse parent row and see that row overlay is hidden.
        // Then expand again parent row and see that overlay is visible. All this using API.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('none');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide parent banner while collapsing the parent node, using UI', fakeAsync(() => {
        // Test summary: Edit parent row, then collapse parent row and see that row overlay is still visible.
        // Then expand again parent row and see that again it is visible. All this clicking row indicator.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(0, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide parent banner while collapsing the parent node, using API', fakeAsync(() => {
        // Test summary: Edit parent row, then collapse parent row and see that row overlay is still visible.
        // Then expand again parent row and see that again it is visible. All this using API.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(1, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide banner while collapsing node that is NOT a parent one, using UI', fakeAsync(() => {
        // Test summary: Edit a row, then collapse row that is not parent of the edit row - then row overlay should be visible.
        // Then expand again parent row and see that again it is visible. All this clicking row indicator.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(9, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Do not hide banner while collapsing node that is NOT a parent one, using API', fakeAsync(() => {
        // Test summary: Edit a row, then collapse row that is not parent of the edit row - then row overlay should be visible.
        // Then expand again parent row and see that again it is visible. All this using API.
        const rows = TreeGridFunctions.getAllRows(fix);

        const cell = treeGrid.getCellByColumn(9, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        const editRow = cell.row.nativeElement;
        const banner = document.getElementsByClassName('igx-overlay__content')[0] as HTMLElement;
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));

    it('Hide banner while collapsing node that is NOT a parent one, but goes outside visible area, using UI', fakeAsync(() => {
        // Test summary: First make grid 300px.
        // Edit a row, then expand row that is not parent of the edit row, but the expanded row has so many records
        // that they push the edit row outside the visible area - then row overlay should be hidden.
        // Then collapse again previously expanded row and see that again it is visible. All this clicking row indicator.

        treeGrid.height = '300px'; // THIS IS NOT WORKING - the grid height is changed, but not the grid body height.
        tick();
        fix.detectChanges();

        const rows = TreeGridFunctions.getAllRows(fix);
        const firstRow = rows[0];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(firstRow);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();

        const cell = treeGrid.getCellByColumn(3, 'Name');
        cell.inEditMode = true;
        tick();
        fix.detectChanges();
        const overlayContent = treeGrid.rowEditingOverlay.element.parentElement;

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('none');

        indicatorDiv.triggerEventHandler('click', new Event('click'));
        tick();
        fix.detectChanges();
        expect(overlayContent.style.display).toEqual('');
    }));*/
});

function verifyGridPager( fix, rowsCount, firstCellValue,  pagerText,  buttonsVisibility) {
    const disabled = 'igx-button--disabled';
    const grid = fix.componentInstance.treeGrid;
    const gridElement: HTMLElement = fix.nativeElement.querySelector('.igx-grid');

    expect(grid.getCellByColumn(0, 'ID').value).toMatch(firstCellValue);
    expect(grid.rowList.length).toEqual(rowsCount, 'Invalid number of rows initialized');

    if ( pagerText != null ) {
        expect(gridElement.querySelector('.igx-paginator')).toBeDefined();
        expect(gridElement.querySelectorAll('.igx-paginator > select').length).toEqual(1);
        expect(gridElement.querySelector('.igx-paginator > span').textContent).toMatch(pagerText);
    }
    if ( buttonsVisibility != null && buttonsVisibility.length === 4 ) {
        const pagingButtons = gridElement.querySelectorAll('.igx-paginator > button');
        expect(pagingButtons.length).toEqual(4);
        expect(pagingButtons[0].className.includes(disabled)).toBe(buttonsVisibility[0]);
        expect(pagingButtons[1].className.includes(disabled)).toBe(buttonsVisibility[1]);
        expect(pagingButtons[2].className.includes(disabled)).toBe(buttonsVisibility[2]);
        expect(pagingButtons[3].className.includes(disabled)).toBe(buttonsVisibility[3]);
    }
}
