import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './grid.module';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { ViewChild, Component } from '@angular/core';
import { verifyLayoutHeadersAreAligned, verifyDOMMatchesLayoutSettings, HelperUtils } from '../../test-utils/helper-utils.spec';
import { IgxColumnLayoutComponent } from './../column.component';
import { wait } from '../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

describe('IgxGrid - multi-row-layout Integration - ', () => {
    configureTestSuite();
    let fixture;
    let grid: IgxGridComponent;
    let colGroups: Array<any>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnLayoutPinningTestComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('Pinning ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(ColumnLayoutPinningTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            colGroups = fixture.componentInstance.colGroups;
        }));

        it('should allow pinning/unpinning a whole group.', () => {
            // group 1 should be pinned - all child columns should be pinned
            expect(grid.getColumnByName('PostalCode').pinned).toBeTruthy();
            expect(grid.getColumnByName('City').pinned).toBeTruthy();
            expect(grid.getColumnByName('Country').pinned).toBeTruthy();
            expect(grid.getColumnByName('Address').pinned).toBeTruthy();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactTitle').pinned).toBeFalsy();

            const gridFirstRow = grid.rowList.first;
            const firstRowCells = gridFirstRow.cells.toArray();
            const headerCells = grid.headerGroups.first.children.toArray();

            // headers are aligned to cells
            verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

            verifyDOMMatchesLayoutSettings(gridFirstRow, fixture.componentInstance.colGroups);

            // unpin group
            fixture.componentInstance.colGroups[0].pinned = false;
            fixture.detectChanges();

            expect(grid.getColumnByName('PostalCode').pinned).toBeFalsy();
            expect(grid.getColumnByName('City').pinned).toBeFalsy();
            expect(grid.getColumnByName('Country').pinned).toBeFalsy();
            expect(grid.getColumnByName('Address').pinned).toBeFalsy();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactTitle').pinned).toBeFalsy();

            // headers are aligned to cells
            verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

            verifyDOMMatchesLayoutSettings(gridFirstRow, fixture.componentInstance.colGroups);

            // pin the other group
            fixture.componentInstance.colGroups[1].pinned = true;
            fixture.detectChanges();

            expect(grid.getColumnByName('PostalCode').pinned).toBeFalsy();
            expect(grid.getColumnByName('City').pinned).toBeFalsy();
            expect(grid.getColumnByName('Country').pinned).toBeFalsy();
            expect(grid.getColumnByName('Address').pinned).toBeFalsy();

            expect(grid.getColumnByName('ID').pinned).toBeTruthy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeTruthy();
            expect(grid.getColumnByName('ContactName').pinned).toBeTruthy();
            expect(grid.getColumnByName('ContactTitle').pinned).toBeTruthy();

        });

        it('should pin/unpin whole group if a single child column is pinned/unpinned.', () => {
            // group 1 should be pinned - all child columns should be pinned
            expect(grid.getColumnByName('PostalCode').pinned).toBeTruthy();
            expect(grid.getColumnByName('City').pinned).toBeTruthy();
            expect(grid.getColumnByName('Country').pinned).toBeTruthy();
            expect(grid.getColumnByName('Address').pinned).toBeTruthy();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactTitle').pinned).toBeFalsy();


            grid.unpinColumn('City');
            fixture.detectChanges();

            expect(grid.getColumnByName('PostalCode').pinned).toBeFalsy();
            expect(grid.getColumnByName('City').pinned).toBeFalsy();
            expect(grid.getColumnByName('Country').pinned).toBeFalsy();
            expect(grid.getColumnByName('Address').pinned).toBeFalsy();

            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactTitle').pinned).toBeFalsy();

            grid.pinColumn('ContactName');
            fixture.detectChanges();

            expect(grid.getColumnByName('PostalCode').pinned).toBeFalsy();
            expect(grid.getColumnByName('City').pinned).toBeFalsy();
            expect(grid.getColumnByName('Country').pinned).toBeFalsy();
            expect(grid.getColumnByName('Address').pinned).toBeFalsy();

            expect(grid.getColumnByName('ID').pinned).toBeTruthy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeTruthy();
            expect(grid.getColumnByName('ContactName').pinned).toBeTruthy();
            expect(grid.getColumnByName('ContactTitle').pinned).toBeTruthy();
        });

        it('should not allow pinning if group width exceeds max allowed.', () => {
            // pin the other group
            fixture.componentInstance.colGroups[1].pinned = true;
            fixture.detectChanges();

            // group 1 should still be pinned - all child columns should be pinned
            expect(grid.getColumnByName('PostalCode').pinned).toBeTruthy();
            expect(grid.getColumnByName('City').pinned).toBeTruthy();
            expect(grid.getColumnByName('Country').pinned).toBeTruthy();
            expect(grid.getColumnByName('Address').pinned).toBeTruthy();
            // group 2 should not be pinned as it will exceed unpinnedAreaMinWidth
            expect(grid.getColumnByName('ID').pinned).toBeFalsy();
            expect(grid.getColumnByName('CompanyName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactName').pinned).toBeFalsy();
            expect(grid.getColumnByName('ContactTitle').pinned).toBeFalsy();
        });

        it('should emit onColumnPinning event with correct parameters', () => {
            let allArgs = [];
            grid.onColumnPinning.subscribe((args) => {
                allArgs.push(args);
            });

            grid.unpinColumn('City');
            fixture.detectChanges();
            // should unpin parent and all child cols - 4 child + 1 parent
            expect(allArgs.length).toBe(5);

            expect(allArgs[0].column.field).toBe('PostalCode');
            expect(allArgs[0].isPinned).toBeFalsy();

            expect(allArgs[1].column.field).toBe('City');
            expect(allArgs[1].isPinned).toBeFalsy();

            expect(allArgs[2].column.field).toBe('Country');
            expect(allArgs[2].isPinned).toBeFalsy();

            expect(allArgs[3].column.field).toBe('Address');
            expect(allArgs[3].isPinned).toBeFalsy();

            expect(allArgs[4].column instanceof IgxColumnLayoutComponent).toBeTruthy();
            expect(allArgs[4].isPinned).toBeFalsy();

            allArgs = [];
            grid.pinColumn('ID');
            fixture.detectChanges();
            // should pin parent and all child cols - 4 child + 1 parent
            expect(allArgs.length).toBe(5);

            expect(allArgs[0].column instanceof IgxColumnLayoutComponent).toBeTruthy();
            expect(allArgs[0].isPinned).toBeTruthy();

            expect(allArgs[1].column.field).toBe('ID');
            expect(allArgs[1].isPinned).toBeTruthy();

            expect(allArgs[2].column.field).toBe('CompanyName');
            expect(allArgs[2].isPinned).toBeTruthy();

            expect(allArgs[3].column.field).toBe('ContactName');
            expect(allArgs[3].isPinned).toBeTruthy();

            expect(allArgs[4].column.field).toBe('ContactTitle');
            expect(allArgs[4].isPinned).toBeTruthy();

        });

        it('should work with horizontal virtualization on the unpinned groups.', async() => {
            const uniqueGroups = [
                {
                group: 'group1',
                // total colspan 3
                columns: [
                    { field: 'Address', rowStart: 1, colStart: 1, colEnd : 4, rowEnd: 3},
                    { field: 'County', rowStart: 3, colStart: 1},
                    { field: 'Region', rowStart: 3, colStart: 2},
                    { field: 'City', rowStart: 3, colStart: 3}
                ]
            },
            {
                group: 'group2',
                  // total colspan 2
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1},
                    { field: 'Address', rowStart: 1, colStart: 2},
                    { field: 'ContactName', rowStart: 2, colStart: 1, colEnd : 3, rowEnd: 4}
                ]
            },
            {
                group: 'group3',
                // total colspan 1
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1},
                    { field: 'Fax', rowStart: 2, colStart: 1, rowEnd: 4}
                ]
            },
            {
                group: 'group4',
                // total colspan 4
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3},
                    { field: 'Phone', rowStart: 1, colStart: 3, rowEnd: 3},
                    { field: 'Address', rowStart: 1, colStart: 4, rowEnd: 4},
                    { field: 'Region', rowStart: 2, colStart: 1},
                    { field: 'City', rowStart: 2, colStart: 2},
                    { field: 'ContactName', rowStart: 3, colStart: 1, colEnd: 4},
                ]
            }
            ];
            fixture.componentInstance.colGroups = uniqueGroups;
            grid.columnWidth = '200px';
            fixture.componentInstance.grid.width = '600px';
            fixture.detectChanges();
            // pin group3
            grid.pinColumn('group3');
            fixture.detectChanges();
            // check group 3 is pinned
            expect(grid.getColumnByName('group3').pinned).toBeTruthy();
            expect(grid.getColumnByName('Fax').pinned).toBeTruthy();
            expect(grid.getColumnByName('Phone').pinned).toBeTruthy();
            const gridFirstRow = grid.rowList.first;
            const firstRowCells = gridFirstRow.cells.toArray();
            const headerCells = grid.headerGroups.first.children.toArray();

            verifyDOMMatchesLayoutSettings(gridFirstRow, fixture.componentInstance.colGroups.slice(2, 3));
             // headers are aligned to cells
             verifyLayoutHeadersAreAligned(headerCells, firstRowCells);

            // check virtualization state
            // 4 groups in total - 1 is pinned
            const horizontalVirtualization = grid.rowList.first.virtDirRow;
            expect(grid.hasHorizontalScroll()).toBeTruthy();
            expect(horizontalVirtualization.igxForOf.length).toBe(3);
            // check order is correct
            expect(horizontalVirtualization.igxForOf[0]).toBe(grid.getColumnByName('group1'));
            expect(horizontalVirtualization.igxForOf[1]).toBe(grid.getColumnByName('group2'));
            expect(horizontalVirtualization.igxForOf[2]).toBe(grid.getColumnByName('group4'));
            // check their sizes are correct
            expect(horizontalVirtualization.getSizeAt(0)).toBe(3 * 200);
            expect(horizontalVirtualization.getSizeAt(1)).toBe(2 * 200);
            expect(horizontalVirtualization.getSizeAt(2)).toBe(4 * 200);

            // check total widths sum
            const horizonatalScrElem = horizontalVirtualization.getHorizontalScroll();
            // 9 column span in total
            const totalExpected = 9 * 200;
            expect(parseInt(horizonatalScrElem.children[0].style.width, 10)).toBe(totalExpected);

            // check last column group can be scrolled in view
            horizontalVirtualization.scrollTo(2);
            await wait(100);
            fixture.detectChanges();

            const lastCell = grid.rowList.first.cells.toArray()[4];
            expect(lastCell.column.field).toBe('Address');
            expect(lastCell.column.parent.field).toBe('group4');
            expect(Math.round(lastCell.nativeElement.getBoundingClientRect().right) - 1)
            .toEqual(grid.tbody.nativeElement.getBoundingClientRect().right);
        });

        it('UI - pinned columns count and drop-down items text in pinnig toolbar should be correct when group is pinned. ', () => {
            // enable toolbar for pinning
            grid.showToolbar = true;
            grid.columnPinning = true;
            fixture.detectChanges();
            const toolbar = fixture.debugElement.query(By.css('igx-grid-toolbar'));
            const pinningButton = toolbar.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnPinning');
            const pinningButtonLabel = pinningButton.query(By.css('span'));
            pinningButtonLabel.nativeElement.click();
            fixture.detectChanges();
            // should show count for actual igxColumns displayed in the pinned area
            expect(parseInt(pinningButtonLabel.nativeElement.textContent.trim(), 10)).toBe(4);
            const columnChooserElement = fixture.debugElement.query(By.css('igx-column-pinning'));
            const checkboxes = columnChooserElement.queryAll(By.css('igx-checkbox'));
            // should show 2 checkboxes - one for each group
            expect(checkboxes.length).toBe(2);
            expect(checkboxes[0].query(By.css('.igx-checkbox__label')).nativeElement.textContent.trim()).toBe('group1');
            expect(checkboxes[1].query(By.css('.igx-checkbox__label')).nativeElement.textContent.trim()).toBe('group2');

            // verify checked state
            expect(checkboxes[0].componentInstance.checked).toBeTruthy();
            expect(checkboxes[1].componentInstance.checked).toBeFalsy();
        });

        it('UI - toggling column checkbox checked state successfully changes the column\'s pinned state. ', async(() => {
            grid.showToolbar = true;
            grid.columnPinning = true;
            const uniqueGroups = [
                {
                group: 'group1',
                // total colspan 3
                columns: [
                    { field: 'Address', rowStart: 1, colStart: 1, colEnd : 4, rowEnd: 3},
                    { field: 'County', rowStart: 3, colStart: 1},
                    { field: 'Region', rowStart: 3, colStart: 2},
                    { field: 'City', rowStart: 3, colStart: 3}
                ]
            },
            {
                group: 'group2',
                  // total colspan 2
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1},
                    { field: 'Address', rowStart: 1, colStart: 2},
                    { field: 'ContactName', rowStart: 2, colStart: 1, colEnd : 3, rowEnd: 4}
                ]
            },
            {
                group: 'group3',
                // total colspan 1
                columns: [
                    { field: 'Phone', rowStart: 1, colStart: 1},
                    { field: 'Fax', rowStart: 2, colStart: 1, rowEnd: 4}
                ]
            },
            {
                group: 'group4',
                // total colspan 4
                columns: [
                    { field: 'CompanyName', rowStart: 1, colStart: 1, colEnd: 3},
                    { field: 'Phone', rowStart: 1, colStart: 3, rowEnd: 3},
                    { field: 'Address', rowStart: 1, colStart: 4, rowEnd: 4},
                    { field: 'Region', rowStart: 2, colStart: 1},
                    { field: 'City', rowStart: 2, colStart: 2},
                    { field: 'ContactName', rowStart: 3, colStart: 1, colEnd: 4},
                ]
            }
            ];
            fixture.componentInstance.colGroups = uniqueGroups;
            grid.columnWidth = '200px';
            fixture.componentInstance.grid.width = '1000px';
            fixture.detectChanges();
            const toolbar = fixture.debugElement.query(By.css('igx-grid-toolbar'));
            const pinningButton = toolbar.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnPinning');
            pinningButton.nativeElement.click();
            const columnChooserElement = fixture.debugElement.query(By.css('igx-column-pinning'));

            const verifyCheckbox = HelperUtils.verifyCheckbox;
            const checkbox = HelperUtils.getCheckboxInput('group1', columnChooserElement, fixture);
            verifyCheckbox('group1', false, false, columnChooserElement, fixture);

            const column = grid.getColumnByName('group1');
            expect(column.pinned).toBeFalsy();

            checkbox.click();

            expect(checkbox.checked).toBe(true);
            expect(column.pinned).toBeTruthy();

            checkbox.click();

            expect(checkbox.checked).toBe(false);
            expect(column.pinned).toBeFalsy();
        }));

    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px">
        <igx-column-layout *ngFor='let group of colGroups' [field]='group.group' [pinned]='group.pinned'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-layout>
    </igx-grid>
    `
})
export class ColumnLayoutPinningTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
    cols1: Array<any> = [
        { field: 'ID', rowStart: 1, colStart: 1},
        { field: 'CompanyName', rowStart: 1, colStart: 2},
        { field: 'ContactName', rowStart: 1, colStart: 3},
        { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 4, colEnd : 4},
    ];
    cols2: Array<any> = [
        { field: 'PostalCode', rowStart: 1, colStart: 1, colEnd: 3 },
        { field: 'City', rowStart: 2, colStart: 1},
        { field: 'Country', rowStart: 2, colStart: 2},
        { field: 'Address', rowStart: 3, colStart: 1, colEnd: 3}
    ];
    colGroups = [
        {
            group: 'group1',
            pinned: true,
            columns: this.cols2
        },
        {
            group: 'group2',
            pinned: false,
            columns: this.cols1
        }
    ];
    data = SampleTestData.contactInfoDataFull();
}

