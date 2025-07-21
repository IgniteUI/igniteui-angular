import { Component, TemplateRef, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DefaultMergeStrategy, GridCellMergeMode, GridColumnDataType, GridType, IgxColumnComponent, IgxGridComponent, SortingDirection } from 'igniteui-angular';
import { DataParent } from '../../test-utils/sample-test-data.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { hasClass } from '../../test-utils/helper-utils.spec';

describe('IgxGrid - Cell merging #grid', () => {
    let fix;
    let grid: IgxGridComponent;
    const MERGE_CELL_CSS_CLASS = '.igx-grid__td--merged';
    const CELL_CSS_CLASS = '.igx-grid__td';
    const CSS_CLASS_GRID_ROW = '.igx-grid__tr';
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule, DefaultCellMergeGridComponent
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(DefaultCellMergeGridComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
    });

    describe('Basic', () => {
        it('should allow enabling/disabling merging per column.', () => {

            const col = grid.getColumnByName('ProductName');
            GridFunctions.verifyColumnMergedState(grid, col, [
                { value: 'Ignite UI for JavaScript', span: 2 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for Angular', span: 2 },
                { value: null , span: 1 },
                { value: 'NetAdvantage' , span: 2 }
            ]);

            // disable merge
            col.merge = false;
            fix.detectChanges();

            GridFunctions.verifyColumnMergedState(grid, col, [
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: null , span: 1 },
                { value: 'NetAdvantage' , span: 1 },
                { value: 'NetAdvantage' , span: 1 }
            ]);
        });

        it('should always merge columns if mergeMode is always.', () => {
            const col = grid.getColumnByName('Released');
            col.merge = true;
            fix.detectChanges();
            GridFunctions.verifyColumnMergedState(grid, col, [
                { value: true, span: 9 }
            ]);
        });

        it('should merge only sorted columns if mergeMode is onSort.', () => {
            grid.cellMergeMode = 'onSort';
            fix.detectChanges();
            const col = grid.getColumnByName('ProductName');
            //nothing is merged initially
            GridFunctions.verifyColumnMergedState(grid, col, [
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: null , span: 1 },
                { value: 'NetAdvantage' , span: 1 },
                { value: 'NetAdvantage' , span: 1 }
            ]);

            grid.sort({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
            fix.detectChanges();

            // merge only after sorted
            GridFunctions.verifyColumnMergedState(grid, col, [
                { value: 'NetAdvantage' , span: 2 },
                { value: 'Ignite UI for JavaScript', span: 3 },
                { value: 'Ignite UI for Angular', span: 3 },
                { value: null , span: 1 }
            ]);
        });

        it('should allow setting a custom merge strategy via mergeStrategy on grid.', () => {
            grid.mergeStrategy = new NoopMergeStrategy();
            fix.detectChanges();
            const col = grid.getColumnByName('ProductName');
            // this strategy does no merging
            GridFunctions.verifyColumnMergedState(grid, col, [
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: 'Ignite UI for JavaScript', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: 'Ignite UI for Angular', span: 1 },
                { value: null , span: 1 },
                { value: 'NetAdvantage' , span: 1 },
                { value: 'NetAdvantage' , span: 1 }
            ]);
        });

        it('should allow setting a custom comparer for merging on particular column via mergingComparer.', () => {
            const col = grid.getColumnByName('ProductName');
            // all are same and should merge
            col.mergingComparer = (prev:any, rec: any, field: string) => {
                return true;
            };
            grid.pipeTrigger += 1;
            fix.detectChanges();
            GridFunctions.verifyColumnMergedState(grid, col, [
                { value: 'Ignite UI for JavaScript', span: 9 }
            ]);
        });
    });


    describe('UI', () => {
        it ('should properly align merged cells with their spanned rows.', () => {
            const mergedCell = fix.debugElement.queryAll(By.css(MERGE_CELL_CSS_CLASS))[0].nativeNode;
            const endRow = fix.debugElement.queryAll(By.css(CSS_CLASS_GRID_ROW))[2].nativeNode;
            expect(mergedCell.getBoundingClientRect().bottom).toBe(endRow.getBoundingClientRect().bottom);
        });

        it('should mark merged cell as hovered when hovering any row that intersects that cell.', () => {
            const secondRow = fix.debugElement.queryAll(By.css(CSS_CLASS_GRID_ROW))[2];
            UIInteractions.hoverElement(secondRow.nativeNode);
            fix.detectChanges();
            // hover 2nd row that intersects the merged cell in row 1
            const mergedCell = fix.debugElement.queryAll(By.css(MERGE_CELL_CSS_CLASS))[0].nativeNode;
            // merged cell should be marked as hovered
            hasClass(mergedCell, 'igx-grid__td--merged-hovered', true);
        });

        it('should set correct size to merged cell that spans multiple rows that have different sizes.', () => {
            const col = grid.getColumnByName('ID');
            col.bodyTemplate = fix.componentInstance.customTemplate;
            fix.detectChanges();
            grid.verticalScrollContainer.recalcUpdateSizes();
            grid.dataRowList.toArray().forEach(x => x.cdr.detectChanges());
            const mergedCell = fix.debugElement.queryAll(By.css(MERGE_CELL_CSS_CLASS))[0].nativeNode;
            // one row is 100px, other is 200, 4px border
            expect(mergedCell.getBoundingClientRect().height).toBe(100 + 200 + 4);


        });
    });
});

@Component({
    template: `
        <igx-grid [data]="data" [cellMergeMode]="mergeMode" #grid>
        @for(col of cols; track col) {
            <igx-column width="100px" [field]="col.field" [dataType]="col.dataType" [merge]="col.merge"></igx-column>
        }
        </igx-grid>
        <ng-template #customTemplate let-value let-cell="cell">
            <button [style.height.px]="cell.row.index % 2 === 0 ? 100 : 200" type="button">{{value}}</button>
        </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class DefaultCellMergeGridComponent extends DataParent {
    public mergeMode: GridCellMergeMode = GridCellMergeMode.always;
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('customTemplate', { read: TemplateRef, static: true })
    public customTemplate: TemplateRef<any>;

    public cols = [
        { field:'ID', merge: false },
        { field:'ProductName', dataType: GridColumnDataType.String, merge: true },
        { field:'Downloads', dataType: GridColumnDataType.Number, merge: false },
        { field:'Released', dataType: GridColumnDataType.Boolean, merge: false },
        { field:'ReleaseDate', dataType: GridColumnDataType.Date, merge: false }
    ];

    public override data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.today,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 2,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.today,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 9,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.prevDay,
            Released: true
        }
    ];

}

class NoopMergeStrategy extends DefaultMergeStrategy {
    public override merge(
        data: any[],
        field: string,
        comparer: (prevRecord: any, record: any, field: string) => boolean = this.comparer,
        result: any[],
        activeRowIndexes : number[],
        grid?: GridType
    ) {
        return data;
    }
}
