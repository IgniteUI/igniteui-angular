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
    describe('IgxPivotGrid Features #pivotGrid', () => {
        it('should show excel style filtering via dimension chip.', () => {
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fixture, 'igx-pivot-grid');
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="All"]');
            const filterIcon = rowChip.querySelectorAll('igx-icon')[2];

            expect(excelMenu.parentElement.parentElement.attributes.hidden).not.toBeUndefined();
            filterIcon.click();
            fixture.detectChanges();
            const esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');
            const checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
            // should show and should display correct checkboxes.
            expect(excelMenu.parentElement.parentElement.attributes.hidden).toBeUndefined();
            expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');
            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Accessories');
            expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Bikes');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Clothing');
            expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Components');
        });

        it('should filter rows via excel style filtering dimension chip.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="All"]');
            const filterIcon = rowChip.querySelectorAll('igx-icon')[2];
            filterIcon.click();
            fixture.detectChanges();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fixture, 'igx-pivot-grid');
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));

            // uncheck Accessories
            checkboxes[1].click();
            fixture.detectChanges();

             // uncheck Bikes
            checkboxes[2].click();
            fixture.detectChanges();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fixture, excelMenu, 'igx-pivot-grid');
            fixture.detectChanges();

            // check rows
            const rows = pivotGrid.rowList.toArray();
            expect(rows.length).toBe(3);
            const expectedHeaders = ['All', 'Clothing', 'Components'];
            const rowDimensionHeaders = rows.map(x => x.rowDimension).flat().map(x => x.header);
            expect(rowDimensionHeaders).toEqual(expectedHeaders);
        });

        it('should filter columns via excel style filtering dimension chip.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="Country"]');
            const filterIcon = rowChip.querySelectorAll('igx-icon')[2];
            filterIcon.click();
            fixture.detectChanges();
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fixture, 'igx-pivot-grid');
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));

            // uncheck Bulgaria
            checkboxes[1].click();
            fixture.detectChanges();

             // uncheck Uruguay
            checkboxes[2].click();
            fixture.detectChanges();


             // Click 'apply' button to apply filter.
             GridFunctions.clickApplyExcelStyleFiltering(fixture, excelMenu, 'igx-pivot-grid');
             fixture.detectChanges();

             // check columns
             const colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
             const expected = ['USA'];
             expect(colHeaders).toEqual(expected);
        });
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
