import { fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPivotGridModule } from 'igniteui-angular';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxPivotGridTestBaseComponent } from '../../test-utils/pivot-grid-samples.spec';

describe('Basic IgxPivotGrid #pGrid', () => {
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
});
