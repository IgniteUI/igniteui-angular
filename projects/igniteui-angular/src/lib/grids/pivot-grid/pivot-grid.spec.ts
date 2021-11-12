import { fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPivotGridModule } from 'igniteui-angular';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxPivotGridTestBaseComponent } from '../../test-utils/pivot-grid-samples.spec';

describe('Basic IgxPivotGrid #pivotGrid', () => {
    let fixture;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxPivotGridModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
        fixture.detectChanges();
    }));

    it('should apply formatter and dataType from measures', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const actualFormatterValue = pivotGrid.rowList.first.cells.first.title;
        expect(actualFormatterValue).toEqual('774$');
        const actualDataTypeValue = pivotGrid.rowList.first.cells.last.title;
        expect(actualDataTypeValue).toEqual('$71.89');
    });

    it('should apply css class to cells from measures', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const cells = pivotGrid.rowList.first.cells;
        expect(cells.first.nativeElement.classList).toContain('test');
        expect(cells.last.nativeElement.classList).not.toContain('test');
    });

    describe('IgxPivotGrid Features #pivotGrid', () => {
        it('should apply sorting for dimension via row chip', () => {
            fixture.detectChanges();
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="All"]');
            rowChip.click();
            fixture.detectChanges();
            let rows = pivotGrid.rowList.toArray();
            let expectedOrder = ['All', 'Accessories', 'Bikes', 'Clothing', 'Components'];
            let rowDimensionHeaders = rows.map(x => x.rowDimension).flat().map(x => x.header);
            expect(rowDimensionHeaders).toEqual(expectedOrder);

           rowChip.click();
           fixture.detectChanges();
           rows = pivotGrid.rowList.toArray();
           expectedOrder = ['All', 'Components', 'Clothing', 'Bikes', 'Accessories' ];
           rowDimensionHeaders = rows.map(x => x.rowDimension).flat().map(x => x.header);
           expect(rowDimensionHeaders).toEqual(expectedOrder);
        });

        it('should apply sorting for dimension via column chip', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const colChip = headerRow.querySelector('igx-chip[id="Country"]');

            // sort
            colChip.click();
            fixture.detectChanges();

            let colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
            let expected = ['Bulgaria', 'USA', 'Uruguay'];
            expect(colHeaders).toEqual(expected);

            // sort
            colChip.click();
            fixture.detectChanges();

            colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
            expected = ['Uruguay' , 'USA', 'Bulgaria'];
            expect(colHeaders).toEqual(expected);
        });
    });
});
