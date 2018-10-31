import { async, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './index';
import { IgxTreeGridExpandingComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { first } from 'rxjs/operators';

describe('IgxTreeGrid - Expanding/Collapsing actions', () => {
    configureTestSuite();
    let fix;
    let grid;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridExpandingComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(IgxTreeGridExpandingComponent);
        fix.detectChanges();
        grid = fix.componentInstance.treeGrid;
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

        grid.toggleRow(grid.getRowByIndex(0).rowID);
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(7);

        grid.toggleRow(grid.getRowByIndex(0).rowID);
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
            grid.toggleRow(grid.getRowByIndex(rowToToggle).rowID);
            for (let rowToCheck = 0; rowToCheck < rows.length; rowToCheck++) {
                if (rowToCheck === rowToToggle) {
                    TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[rowToCheck]);
                } else {
                    TreeGridFunctions.verifyTreeRowHasCollapsedIcon(rows[rowToCheck]);
                }
            }
            grid.toggleRow(grid.getRowByIndex(rowToToggle).rowID);
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
        grid.toggleRow(grid.getRowByIndex(0).rowID);

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
        grid.toggleRow(grid.getRowByIndex(0).rowID);

        // expand third level record
        grid.toggleRow(grid.getRowByIndex(3).rowID);

        // check third level records indentation
        TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 4, 2); // fix, rowIndex, expectedLevel
        TreeGridFunctions.verifyRowIndentationLevelByIndex(fix, 5, 2);
    });

    it('check grand children are not visible when collapsing their grand parent', () => {
        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(4);

        // expand second level records
        grid.toggleRow(grid.getRowByIndex(0).rowID);

        // expand third level record
        grid.toggleRow(grid.getRowByIndex(3).rowID);

        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(9);

        // collapse first row with all its children and grand children
        grid.toggleRow(grid.getRowByIndex(0).rowID);

        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(4);
    });

    it('should expand/collapse rows when changing the "expanded" property', () => {
        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(4);

        // expand a root level row
        let aRow = grid.getRowByIndex(0);
        expect(aRow.cells.first.value).toBe(147, 'wrong root level row');
        expect(aRow.expanded).toBe(false);
        aRow.expanded = true;
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(7, 'root level row expanding problem');

        // expand a second level row
        aRow = grid.getRowByIndex(3);
        expect(aRow.cells.first.value).toBe(317, 'wrong second level row');
        expect(aRow.expanded).toBe(false);
        aRow.expanded = true;
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(9, 'second level row expanding problem');

        // check third level rows are having the correct values
        aRow = grid.getRowByIndex(4);
        expect(aRow.cells.first.value).toBe(711, 'wrong third level row');
        aRow = grid.getRowByIndex(5);
        expect(aRow.cells.first.value).toBe(998, 'wrong third level row');

        // collapse a second level row
        aRow = grid.getRowByIndex(3);
        aRow.expanded = false;
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(7, 'second level row collapsing problem');

        // collapse a root level row
        aRow = grid.getRowByIndex(0);
        aRow.expanded = false;
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(4, 'root level row collapsing problem');
    });

    it('should emits an event when expanding rows (API)', (done) => {
        const aRow = grid.getRowByIndex(0);
        grid.onRowToggle.pipe(first()).subscribe((args) => {
            expect(args.cancel).toBe(false);
            expect(args.event).toBeUndefined();
            expect(args.expanded).toBe(true);
            expect(args.rowID.ID).toBe(147);
            done();
        });
        aRow.expanded = true;
    });

    it('should emits an event when collapsing rows (API)', (done) => {
        const aRow = grid.getRowByIndex(0);
        aRow.expanded = true;
        grid.onRowToggle.pipe(first()).subscribe((args) => {
            expect(args.cancel).toBe(false);
            expect(args.event).toBeUndefined();
            expect(args.expanded).toBe(false);
            expect(args.rowID.ID).toBe(147);
            done();
        });
        aRow.expanded = false;
    });

    it('should emits an event when expanding rows (UI)', (done) => {
        grid.onRowToggle.pipe(first()).subscribe((args) => {
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

    it('should emits an event when collapsing rows (UI)', (done) => {
        const rowsDOM = TreeGridFunctions.getAllRows(fix);
        const indicatorDivDOM = TreeGridFunctions.getExpansionIndicatorDiv(rowsDOM[0]);
        indicatorDivDOM.triggerEventHandler('click', new Event('click'));
        grid.onRowToggle.pipe(first()).subscribe((args) => {
            expect(args.cancel).toBe(false);
            expect(args.event).toBeDefined();
            expect(args.expanded).toBe(false);
            expect(args.rowID.ID).toBe(147);
            done();
        });
        indicatorDivDOM.triggerEventHandler('click', new Event('click'));
    });
});

describe('IgxTreeGrid - Expanding/Collapsing actions using flat data source', () => {
    configureTestSuite();
    let fix;
    let treeGrid;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridPrimaryForeignKeyComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
        fix.detectChanges();
        treeGrid = fix.componentInstance.treeGrid;
        treeGrid.expansionDepth = 0;
        fix.detectChanges();
    });

    it('check row expanding and collapsing are changing rows count using flat data source (UI)', () => {
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

    it('check row expanding and collapsing are changing rows count using flat data source (API)', () => {
        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(3);

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(5);

        treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(3);
    });

});
