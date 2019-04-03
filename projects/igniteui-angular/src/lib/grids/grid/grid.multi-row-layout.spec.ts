import { async, TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { Component, ViewChild, DebugElement, AfterViewInit } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent, IgxColumnGroupComponent } from '../column.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { By } from '@angular/platform-browser';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridHeaderComponent } from '../grid-header.component';

const GRID_COL_THEAD_TITLE_CLASS = 'igx-grid__th-title';
const GRID_COL_GROUP_THEAD_TITLE_CLASS = 'igx-grid__thead-title';
const GRID_COL_GROUP_THEAD_GROUP_CLASS = 'igx-grid__thead-group';
const GRID_COL_THEAD_CLASS = '.igx-grid__th';

describe('IgxGrid - multi-row-layout', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnGroupTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        }).compileComponents();
    }));

    function verifyHeadersAreAligned(headerCells, rowCells) {
        for (let i; i < headerCells.length; i++) {
            expect(headerCells[i].headerCell.elementRef.nativeElement.offsetWidth)
                .toBe(rowCells[i].nativeElement.offsetWidth);
            expect(headerCells[i].headerCell.elementRef.nativeElement.offsetHeight)
                .toBe(rowCells[i].nativeElement.offsetHeight);
        }
    }

    function verifyDOMMatchesSettings(row, colSettings) {
       // TODO - generic function that checks if DOM is rendered correctly based on the column settings
        const firstRowCells = row.cells.toArray();
        colSettings.forEach(groupSetting => {
            // check group has rendered block
            groupSetting.columns.forEach(cols => {
                // check widths for columns that have col span
                // check heights for cols that have row span
                // check cols with same colStart start from same left
                // check cols with same rowStart start from same top
                // check that cols with same colStart+colSpan end at the same right
                // check that rows with same rowStart+rowSpan end at the same bottom
            });
        });
    }

    fit('should initialize a grid with column groups', () => {
        const fixture = TestBed.createComponent(ColumnGroupTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroups.first.children.toArray();

        // headers are aligned to cells
        verifyHeadersAreAligned(headerCells, firstRowCells);

        verifyDOMMatchesSettings(gridFirstRow, fixture.componentInstance.colGroups);

        // the last cell is spaned as much as the first 3 cells
        const firstThreeCellsWidth = firstRowCells[0].nativeElement.offsetWidth +
             firstRowCells[1].nativeElement.offsetWidth +
             firstRowCells[2].nativeElement.offsetWidth;
        const lastCellWidth = firstRowCells[3].nativeElement.offsetWidth;
        expect(2 * firstRowCells[0].nativeElement.offsetHeight).toEqual(firstRowCells[3].nativeElement.offsetHeight);
        //the height of the last cell should be twice as big as the
    });

    it('should not throw error when layout is incomplete', () => {});
    it('should initialize correctly when no widths are set.', () => {});
    it('should initialize correctly when widths are set in px.', () => {});
    it('should initialize correctly when widths are set in %.', () => {});

});

@Component({
    template: `
    <igx-grid #grid [data]="data" [enableMRL]="true" height="500px">
        <igx-column-group *ngFor='let group of colGroups'>
            <igx-column *ngFor='let col of group.columns'
            [rowStart]="col.rowStart" [colStart]="col.colStart" [width]='col.width'
            [colEnd]="col.colEnd" [rowEnd]="col.rowEnd" [field]='col.field'></igx-column>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
    colGroups = [
        {
            group: 'group1',
            columns: [
                { field: 'ID', rowStart: 1, colStart: 1},
                { field: 'CompanyName', rowStart: 1, colStart: 2},
                { field: 'ContactName', rowStart: 1, colStart: 3},
                { field: 'ContactTitle', rowStart: 2, colStart: 1, rowEnd: 'span 2', colEnd : 'span 3'},
            ]
        }
    ];
    data = SampleTestData.contactInfoDataFull();
}
