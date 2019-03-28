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

    it('should initialize a grid with column groups', () => {
        const fixture = TestBed.createComponent(ColumnGroupTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const gridFirstRow = grid.rowList.first;
        const firstRowCells = gridFirstRow.cells.toArray();
        const headerCells = grid.headerGroups.first.children.toArray();

        // headers are aligned to cells
        for (let i; i < headerCells.length; i++) {
            expect(headerCells[i].headerCell.elementRef.nativeElement.offsetWidth)
                .toBe(firstRowCells[i].nativeElement.offsetWidth);
            expect(headerCells[i].headerCell.elementRef.nativeElement.offsetHeight)
                .toBe(firstRowCells[i].nativeElement.offsetHeight);
        }

        // the last cell is spaned as much as the first 3 cells
        const firstThreeCellsWidth = firstRowCells[0].nativeElement.offsetWidth +
             firstRowCells[1].nativeElement.offsetWidth +
             firstRowCells[2].nativeElement.offsetWidth;
        const lastCellWidth = firstRowCells[3].nativeElement.offsetWidth;
        // expect(2 * firstRowCells[0].nativeElement.offsetHeight).toEqual(firstRowCells[3].nativeElement.offsetHeight);
        // the height of the last cell should be twice as big as the
    });
});

@Component({
    template: `
    <igx-grid #grid [data]="data" [enableMRL]="true" height="500px">
        <igx-column-group>
            <igx-column [rowStart]="1" [colStart]="1" field="ID"></igx-column>
            <igx-column [rowStart]="1" [colStart]="2" filterable="true" sortable="true" resizable="true" field="CompanyName"></igx-column>
            <igx-column [rowStart]="1" [colStart]="3" filterable="true" sortable="true" resizable="true" field="ContactName"></igx-column>
            <igx-column [rowStart]="2" [colStart]="1" [colEnd]="'span 3'" [rowEnd]="'span 2'"
             filterable="true" sortable="true" resizable="true" field="ContactTitle"></igx-column>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    data = SampleTestData.contactInfoDataFull();
}
