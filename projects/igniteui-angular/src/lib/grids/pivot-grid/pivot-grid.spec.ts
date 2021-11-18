import { fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPivotGridModule } from 'igniteui-angular';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
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
            expectedOrder = ['All', 'Components', 'Clothing', 'Bikes', 'Accessories'];
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
            expected = ['Uruguay', 'USA', 'Bulgaria'];
            expect(colHeaders).toEqual(expected);
        });

        it('should sort on column for single row dimension.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerCell = GridFunctions.getColumnHeader('USA-UnitsSold', fixture);

            // sort asc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            let expectedOrder = [829, undefined, 240, 293, 296];
            let columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

            // sort desc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            expectedOrder = [829, 296, 293, 240, undefined];
            columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

            // remove sort
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(0);
            expectedOrder = [829, 293, undefined, 296, 240];
            columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);
        });

        // xit-ing because of https://github.com/IgniteUI/igniteui-angular/issues/10546
        xit('should sort on column for all sibling dimensions.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.height = '1500px';
            pivotGrid.pivotConfiguration.rows = [
                {
                    memberName: 'ProductCategory',
                    enabled: true
                },
                {
                    memberName: 'SellerName',
                    enabled: true
                }
            ];
            // add a bit more data to sort.
            pivotGrid.data = [
                {
                    ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                    Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                    Country: 'USA', Date: '01/05/2019', UnitsSold: 296
                },
                {
                    ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                    Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                },
                {
                    ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                    Country: 'USA', Date: '04/07/2021', UnitsSold: 293
                },
                {
                    ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                    Country: 'USA', Date: '12/08/2021', UnitsSold: 240
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                    Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                    Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Elisa',
                    Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 267
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Larry',
                    Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 100
                }
            ];
            pivotGrid.pipeTrigger++;
            fixture.detectChanges();
            const headerCell = GridFunctions.getColumnHeader('Bulgaria-UnitsSold', fixture);
            // sort asc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            let expectedOrder = [undefined, undefined, undefined, 100, 267, 282, 492];
            let columnValues = pivotGrid.dataView.map(x => x['Bulgaria-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

             // sort desc
             GridFunctions.clickHeaderSortIcon(headerCell);
             fixture.detectChanges();
             expect(pivotGrid.sortingExpressions.length).toBe(1);
             expectedOrder = [492, 282, 267, 100, undefined, undefined, undefined];
             columnValues = pivotGrid.dataView.map(x => x['Bulgaria-UnitsSold']);
             expect(columnValues).toEqual(expectedOrder);
        });
    });
});

