import { async, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './index';
import { IgxTreeGridExpandingComponent, IgxTreeGridPrimaryForeignKeyComponent,
    IgxTreeGridRowEditingComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';

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

    beforeEach(async() => {
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
        fix.detectChanges();
    });

    it('Hide banner with collapsing a parent node, using UI', fakeAsync(() => {
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

    xit('Hide banner while collapsing node that is NOT a parent one, but goes outside visible area, using UI', fakeAsync(() => {
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
    }));
});
