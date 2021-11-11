import { fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPivotGridModule } from 'igniteui-angular';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { IgxPivotGridTestBaseComponent, IgxPivotGridTestComplexHierarchyComponent } from '../../test-utils/pivot-grid-samples.spec';

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
});

describe('IgxPivotGrid complex hierarchy #pivotGrid', () => {
    let fixture;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridTestComplexHierarchyComponent
            ],
            imports: [
                NoopAnimationsModule, IgxPivotGridModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
        fixture.detectChanges();
    }));

    it('should select/deselect the correct row', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const pivotRows = GridFunctions.getPivotRows(fixture);
        const row = pivotRows[2].componentInstance;
        row.selectPivotRow(row.rowDimensionData[1].column);
        fixture.detectChanges();
        expect(row.selected).toBeTrue();
        expect(pivotGrid.selectedRows).not.toBeNull();
        expect(pivotGrid.selectedRows.length).toBe(1);
        const expected =
        {
            'All cities': 'All Cities', 'All cities_level': 0,
            ProductCategory: 'Bikes', ProductCategory_level: 1,
            'Uruguay-AmountOfSale': 242.08, 'Uruguay-UnitsSold': 68
        };
        expect(pivotGrid.selectedRows[0]).toEqual(expected);

        //deselect
        row.selectPivotRow(row.rowDimensionData[1].column);
        fixture.detectChanges();
        expect(row.selected).toBeFalse();
        expect(pivotGrid.selectedRows.length).toBe(0);
    });

    it('should select/deselect the correct group of rows', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const pivotRows = GridFunctions.getPivotRows(fixture);
        const row = pivotRows[2].componentInstance;
        row.selectPivotRow(row.rowDimensionData[0].column);
        fixture.detectChanges();
        for (let i = 0; i < 5; ++i) {
            expect(pivotRows[i].componentInstance.selected).toBeTrue();
        }
        expect(pivotGrid.selectedRows).not.toBeNull();
        expect(pivotGrid.selectedRows.length).toBe(5);
        const expected =
            [
                {
                    AllProducts: 'AllProducts', 'All cities': 'All Cities',
                    'All cities_level': 0, AllProducts_level: 0, 'Bulgaria-UnitsSold': 774,
                    'Bulgaria-AmountOfSale': 11509.02, 'USA-UnitsSold': 829, 'USA-AmountOfSale': 44098.85999999999,
                    'Uruguay-UnitsSold': 524, 'Uruguay-AmountOfSale': 31400.56
                }, {
                    ProductCategory: 'Clothing', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0, 'Bulgaria-UnitsSold': 774,
                    'Bulgaria-AmountOfSale': 11509.02, 'USA-UnitsSold': 296, 'USA-AmountOfSale': 14672.72,
                    'Uruguay-UnitsSold': 456, 'Uruguay-AmountOfSale': 31158.48
                }, {
                    ProductCategory: 'Bikes', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0,
                    'Uruguay-UnitsSold': 68, 'Uruguay-AmountOfSale': 242.08
                }, {
                    ProductCategory: 'Accessories', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0,
                    'USA-UnitsSold': 293, 'USA-AmountOfSale': 25074.94
                }, {
                    ProductCategory: 'Components', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0,
                    'USA-UnitsSold': 240, 'USA-AmountOfSale': 4351.2
                }
            ];
        expect(pivotGrid.selectedRows).toEqual(expected);
    });

    it('should select/deselect the correct column', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const unitsSold = pivotGrid.getColumnByName('Bulgaria-UnitsSold');
        GridFunctions.clickColumnHeaderUI('Bulgaria-UnitsSold', fixture);
        GridSelectionFunctions.verifyColumnAndCellsSelected(unitsSold);
    });

    it('should select/deselect the correct column group', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const group = GridFunctions.getColGroup(pivotGrid, 'Bulgaria');
        const unitsSold = pivotGrid.getColumnByName('Bulgaria-UnitsSold');
        const amountOfSale = pivotGrid.getColumnByName('Bulgaria-AmountOfSale');
        const unitsSoldUSA = pivotGrid.getColumnByName('USA-UnitsSold');
        const amountOfSaleUSA = pivotGrid.getColumnByName('USA-AmountOfSale');

        GridFunctions.clickColumnGroupHeaderUI('Bulgaria', fixture);
        fixture.detectChanges();

        GridSelectionFunctions.verifyColumnSelected(unitsSold);
        GridSelectionFunctions.verifyColumnSelected(amountOfSale);
        GridSelectionFunctions.verifyColumnGroupSelected(fixture, group);

        GridSelectionFunctions.verifyColumnsSelected([unitsSoldUSA, amountOfSaleUSA], false);

        GridFunctions.clickColumnGroupHeaderUI('Bulgaria', fixture);

        GridSelectionFunctions.verifyColumnSelected(unitsSold, false);
        GridSelectionFunctions.verifyColumnSelected(amountOfSale, false);
        GridSelectionFunctions.verifyColumnGroupSelected(fixture, group, false);
    });
});
