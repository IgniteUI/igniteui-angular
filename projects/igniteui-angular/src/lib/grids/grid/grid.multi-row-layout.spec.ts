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
        const rowElem = row.nativeElement;
        const mrlBlocks = rowElem.querySelectorAll('.igx-grid__mrl_block');

        colSettings.forEach((groupSetting, index) => {
            // check group has rendered block
            const groupBlock = mrlBlocks[index];
            const cellsFromBlock = firstRowCells.filter((cell) => cell.nativeElement.parentNode === groupBlock);
            expect(groupBlock).not.toBeNull();
            groupSetting.columns.forEach((col, colIndex) => {
                const cell = cellsFromBlock[colIndex];
                const cellElem = cell.nativeElement;
                 // check correct attributes are applied
                expect(parseInt(cellElem.style['gridRowStart'], 10)).toBe(parseInt(col.rowStart, 10));
                expect(parseInt(cellElem.style['gridColumnStart'], 10)).toBe(parseInt(col.colStart, 10));
                expect(cellElem.style['gridColumnEnd']).toBe(col.colEnd || '');
                expect(cellElem.style['gridRowEnd']).toBe(col.rowEnd || '');

                // check width
                const expectedWidth = parseFloat(cell.column.calcWidth) * cell.gridColumnSpan;
                expect(cellElem.clientWidth - expectedWidth).toBeLessThan(1);
                // check height
                const expectedHeight = cell.grid.rowHeight * cell.gridRowSpan;
                expect(cellElem.clientHeight).toBe(expectedHeight);

                 // check offset left
                const acc = (acc, cell) => {
                    if (cell.column.colStart <  col.colStart && cell.column.rowStart === col.rowStart) {
                        return acc += parseFloat(cell.column.calcWidth);
                    } else {
                        return acc;
                    }
                };
                const expectedLeft = cellsFromBlock.reduce(acc, 0);
                expect(cellElem.offsetLeft - groupBlock.offsetLeft - expectedLeft).toBeLessThan(1);
                // check offsetTop
                const expectedTop = (col.rowStart - 1) * cell.grid.rowHeight;
                expect(cellElem.offsetTop).toBe(expectedTop);
            });
        });
    }

    it('should initialize a grid with 1 column group', () => {
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
        expect(firstThreeCellsWidth).toEqual(lastCellWidth);
    });

    it('should initialize grid with 2 column groups', () => {
        const fixture = TestBed.createComponent(ColumnGroupTestComponent);
        fixture.componentInstance.colGroups.push({
            group: 'group2',
            columns: [
                { field: 'ContactName', rowStart: 2, colStart: 1, colEnd : 'span 3', rowEnd: 'span 2'},
                { field: 'CompanyName', rowStart: 1, colStart: 1},
                { field: 'PostalCode', rowStart: 1, colStart: 2},
                { field: 'Fax', rowStart: 1, colStart: 3}
            ]
        });
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroups.first.children.toArray();

         // headers are aligned to cells
         verifyHeadersAreAligned(headerCells, firstRowCells);

         verifyDOMMatchesSettings(gridFirstRow, fixture.componentInstance.colGroups);
    });

    it('should not throw error when layout is incomplete', () => {});
    fit('should initialize correctly when no column widths are set.', () => {
        const fixture = TestBed.createComponent(ColumnGroupTestComponent);
        fixture.componentInstance.width = '617px';
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        // col span is 3 => columns should have grid width - scrollbarWitdh/3 width
        expect(grid.getCellByColumn(0, 'ID').nativeElement.offsetWidth).toBeCloseTo(200);
        expect(grid.getCellByColumn(0, 'CompanyName').nativeElement.offsetWidth).toBeCloseTo(200);
        expect(grid.getCellByColumn(0, 'ContactName').nativeElement.offsetWidth).toBeCloseTo(200);
        expect(grid.getCellByColumn(0, 'ContactTitle').nativeElement.offsetWidth).toBeCloseTo(200 * 3);

        const firstRowCells = grid.rowList.first.cells.toArray();
        const headerCells = grid.headerGroups.first.children.toArray();
        verifyHeadersAreAligned(headerCells, firstRowCells);

        verifyDOMMatchesSettings(grid.rowList.first, fixture.componentInstance.colGroups);

    });
    it('should initialize correctly when widths are set in px.', () => {});
    it('should initialize correctly when widths are set in %.', () => {});

});

@Component({
    template: `
    <igx-grid #grid [data]="data" [enableMRL]="true" height="500px" [width]='width'>
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
    width;
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
