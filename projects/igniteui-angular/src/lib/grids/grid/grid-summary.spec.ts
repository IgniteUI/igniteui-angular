import { Component, DebugElement, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxDateSummaryOperand, IgxGridModule, IgxNumberSummaryOperand, IgxSummaryResult } from './index';
import { IgxGridComponent } from './grid.component';
import { IgxGridAPIService } from './grid-api.service';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    ProductsComponent,
    VirtualSummaryColumnComponent,
    SummaryColumnComponent,
    FilteringComponent,
    SummarieGroupByComponent
} from '../../test-utils/grid-samples.spec';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxNumberFilteringOperand, SortingDirection } from 'igniteui-angular';
import { ColumnGroupFourLevelTestComponent } from './column-group.spec';

describe('IgxGrid - Summaries', () => {
    configureTestSuite();
    const SUMMARY_CLASS = '.igx-grid-summary';
    const ITEM_CLASS = 'igx-grid-summary__item';
    const SUMMARY_ROW = 'igx-grid-summary-row';
    const SUMARRY_CELL = 'igx-grid-summary-cell';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ProductsComponent,
                SummaryColumnComponent,
                CustomSummariesComponent,
                VirtualSummaryColumnComponent,
                SummaryColumnsWithIdenticalWidthsComponent,
                FilteringComponent,
                ColumnGroupFourLevelTestComponent,
                SummarieGroupByComponent
            ],
            imports: [BrowserAnimationsModule, IgxGridModule.forRoot(), NoopAnimationsModule]
        })
            .compileComponents();
    }));

    describe('Base tests: ', () => {
        it('should not have summary if no summary is active ', () => {
            const fixture = TestBed.createComponent(ProductsComponent);
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css(SUMMARY_CLASS))).toBeNull();
        });

        it('should enableSummaries through grid API ', () => {
            const fixture = TestBed.createComponent(ProductsComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;
            expect(grid.hasSummarizedColumns).toBe(false);
            let tFoot = fixture.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;
            expect(tFoot < grid.defaultRowHeight).toBe(true);

            grid.enableSummaries([{ fieldName: 'ProductName' }, { fieldName: 'ProductID' }]);
            fixture.detectChanges();

            const summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            HelperUtils.verifyColumnSummaries(summaryRow, 0, ['Count'], ['10']);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, [], []);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, [], []);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, [], []);

            expect(grid.getColumnByName('ProductID').hasSummary).toBe(true);
            expect(grid.getColumnByName('ProductName').hasSummary).toBe(true);
            expect(grid.getColumnByName('OrderDate').hasSummary).toBe(false);

            tFoot = fixture.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;
            expect(tFoot).toEqual(grid.defaultRowHeight + 1);
        });

        it(`should recalculate grid sizes correctly when the column is outside of the viewport`, (async () => {
            const fixture = TestBed.createComponent(ProductsComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;
            grid.width = '300px';
            await wait(100);
            fixture.detectChanges();

            grid.getColumnByName('UnitsInStock').hasSummary = true;
            await wait(30);
            fixture.detectChanges();

            const tFoot = fixture.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;
            expect(tFoot).toEqual(5 * grid.defaultRowHeight + 1);
            expect(fixture.debugElement.query(By.css(SUMMARY_CLASS))).toBeDefined();
        }));

        xit('should have correct summaries when there are null and undefined values', fakeAsync(() => {
            const fixture = TestBed.createComponent(FilteringComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;
            grid.getColumnByName('ProductName').hasSummary = true;
            grid.getColumnByName('Downloads').hasSummary = true;
            grid.getColumnByName('Released').hasSummary = true;
            grid.getColumnByName('ReleaseDate').hasSummary = true;
            tick(100);
            fixture.detectChanges();

            const summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['8']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '1', '1,000', '2,204', '275.5']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count'], ['8']);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const earliest = SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1).toLocaleString('us', options);
            const latest = SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1).toLocaleString('us', options);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count', 'Earliest', 'Latest'], ['8', earliest, latest]);
        }));

        it('should properly render custom summaries', () => {
            const fixture = TestBed.createComponent(CustomSummariesComponent);
            const gridComp = fixture.componentInstance.grid1;
            fixture.detectChanges();

            const summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['10', '39,004', '3,900.4']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Earliest'], ['5/17/1990']);

            gridComp.filter('UnitsInStock', '0', IgxNumberFilteringOperand.instance().condition('lessThan'), true);
            fixture.detectChanges();

            const filterResult = gridComp.rowList.length;
            expect(filterResult).toEqual(0);

            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['0', '', '']);
        });

        it(`Should update summary section when the column is outside of the
            viewport and have identical width with others`, (async () => {
                const fixture = TestBed.createComponent(ProductsComponent);
                fixture.detectChanges();

                const grid = fixture.componentInstance.grid;
                grid.getColumnByName('UnitsInStock').hasSummary = true;
                grid.width = '300px';
                await wait(100);
                fixture.detectChanges();

                grid.addRow({
                    ProductID: 11, ProductName: 'Belgian Chocolate', InStock: true, UnitsInStock: 99000, OrderDate: new Date('2018-03-01')
                });
                await wait(30);
                fixture.detectChanges();
                GridFunctions.scrollLeft(grid, 600);
                await wait(30);
                fixture.detectChanges();

                const summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'],
                    ['11', '0', '99,000', '138,004', '12,545.818']);
            }));

        xit('When we have data which is undefined and enable summary per defined column, error should not be thrown', () => {
            const fixture = TestBed.createComponent(ProductsComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;
            const idColumn = grid.getColumnByName('ProductID');
            expect(grid.data.length > 0).toEqual(true);

            fixture.componentInstance.data = undefined;
            fixture.detectChanges();

            expect(grid.data).toEqual(undefined);
            expect(() => {
                grid.enableSummaries(idColumn.field);
                fixture.detectChanges();
            }).not.toThrow();
        });

        xit('should change custom summaries at runtime', fakeAsync(() => {
            const fixture = TestBed.createComponent(CustomSummariesComponent);
            const grid = fixture.componentInstance.grid1;
            fixture.detectChanges();

            const summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['10', '39,004', '3,900.4']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Earliest'], ['5/17/1990']);
            grid.getColumnByName('UnitsInStock').summaries = fixture.componentInstance.dealsSummaryMinMax;
            tick(100);
            fixture.detectChanges();
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '20,000']);
        }));

        it('should render correct data after hiding one bigger and then one smaller summary when scrolled to the bottom', (async () => {
            const fixture = TestBed.createComponent(VirtualSummaryColumnComponent);
            fixture.detectChanges();

            const grid = fixture.componentInstance.grid;
            let rowsRendered;
            let tbody;
            let expectedRowLenght;
            let firstCellsText;

            fixture.componentInstance.scrollTop(10000);
            await wait(100);
            fixture.detectChanges();

            rowsRendered = fixture.nativeElement.querySelectorAll('igx-grid-row');
            tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
            expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight) + 1;
            expect(rowsRendered.length).toEqual(expectedRowLenght);

            grid.disableSummaries(['ProductName', 'InStock', 'UnitsInStock']);
            await wait(50);
            fixture.detectChanges();

            rowsRendered = Array.from(fixture.nativeElement.querySelectorAll('igx-grid-row'));
            tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
            expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight) + 1;

            firstCellsText = rowsRendered.map((item) => {
                return item.querySelectorAll('igx-grid-cell')[0].textContent.trim();
            });
            expect(rowsRendered.length).toEqual(expectedRowLenght);
            let expectedFirstCellNum = grid.data.length - expectedRowLenght + 1;

            for (let i = 0; i < rowsRendered.length - 1; i++) {
                expect(firstCellsText[i]).toEqual((expectedFirstCellNum + i).toString());
            }

            grid.disableSummaries(['OrderDate']);
            await wait(50);
            fixture.detectChanges();

            rowsRendered = Array.from(fixture.nativeElement.querySelectorAll('igx-grid-row'));
            tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
            expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight) + 1;

            firstCellsText = rowsRendered.map((item) => {
                return item.querySelectorAll('igx-grid-cell')[0].textContent.trim();
            });
            expect(rowsRendered.length).toEqual(expectedRowLenght);
            expectedFirstCellNum = grid.data.length - expectedRowLenght + 1;
            for (let i = 0; i < rowsRendered.length - 1; i++) {
                expect(firstCellsText[i]).toEqual((expectedFirstCellNum + i).toString());
            }
        }));

        describe('', () => {
            let fix;
            let grid: IgxGridComponent;
            beforeEach(() => {
                fix = TestBed.createComponent(SummaryColumnComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
            });

            it('should disableSummaries through grid API ', () => {
                const summariedColumns = [];
                grid.columnList.forEach((col) => {
                    if (col.hasSummary) {
                        summariedColumns.push(col.field);
                    }
                });
                grid.disableSummaries(summariedColumns);
                fix.detectChanges();

                expect(fix.debugElement.query(By.css(SUMMARY_CLASS))).toBeNull();
                expect(grid.hasSummarizedColumns).toBe(false);
            });

            it('should change summary operand through grid API ', (async () => {
                grid.enableSummaries([{ fieldName: 'UnitsInStock', customSummary: fix.componentInstance.dealsSummaryMinMax }]);
                // grid.recalculateSummaries();
                await wait(200);
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Min', 'Max'], ['0', '20,000']);
            }));

            it('should have summary per each column that \'hasSummary\'= true', () => {
                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count', 'Earliest', 'Latest'], []);
            });

            it('should have count summary for string and boolean data types', () => {
                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                grid.columnList.forEach((col) => {
                    if (col.hasSummary && (col.dataType === 'string' || col.dataType === 'boolean')) {
                        HelperUtils.verifyColumnSummaries(summaryRow, col.visibleIndex, ['Count'], []);
                    }
                });
            });

            it('should have count, min, max, avg and sum summary for numeric data types', () => {
                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                grid.columnList.forEach((col) => {
                    if (col.hasSummary && (col.dataType === 'number')) {
                        HelperUtils.verifyColumnSummaries(summaryRow, col.visibleIndex, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                    }
                });
            });

            it('should have count, earliest and latest summary for \'date\' data types', () => {
                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                grid.columnList.forEach((col) => {
                    if (col.hasSummary && (col.dataType === 'date')) {
                        HelperUtils.verifyColumnSummaries(summaryRow, col.visibleIndex, ['Count', 'Earliest', 'Latest'], []);
                    }
                });
            });

            it('should summary function stay active when is clicked on it\'s label', () => {
                const summary = fix.debugElement.queryAll(By.css('igx-grid-summary-cell'))[3];
                const min: DebugElement = summary.query(By.css('[title=\'Min\']'));

                expect(min.parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                min.triggerEventHandler('click', null);
                fix.detectChanges();

                expect(min.parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Count\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Max\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Sum\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
                expect(summary.query(By.css('[title=\'Avg\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
            });

            it('should calculate summaries for \'number\' dataType or return if no data is provided', () => {
                const summaryClass = fix.componentInstance.numberSummary;

                const summaries = summaryClass.operate(fix.componentInstance.data.map((x) => x['UnitsInStock']));
                expect(summaries[0].summaryResult).toBe(10);
                expect(summaries[1].summaryResult).toBe(0);
                expect(summaries[2].summaryResult).toBe(20000);
                expect(summaries[3].summaryResult).toBe(39004);
                expect(summaries[4].summaryResult).toBe(3900.4);

                const emptySummaries = summaryClass.operate();
                expect(emptySummaries[0].summaryResult).toBe(0);
                expect(typeof emptySummaries[1].summaryResult).not.toEqual(undefined);
                expect(typeof emptySummaries[2].summaryResult).not.toEqual(undefined);
                expect(typeof emptySummaries[3].summaryResult).not.toEqual(undefined);
                expect(typeof emptySummaries[4].summaryResult).not.toEqual(undefined);

                expect(typeof emptySummaries[1].summaryResult).not.toEqual(null);
                expect(typeof emptySummaries[2].summaryResult).not.toEqual(null);
                expect(typeof emptySummaries[3].summaryResult).not.toEqual(null);
                expect(typeof emptySummaries[4].summaryResult).not.toEqual(null);

                expect(emptySummaries[1].summaryResult.length === 0).toBeTruthy();
                expect(emptySummaries[2].summaryResult.length === 0).toBeTruthy();
                expect(emptySummaries[3].summaryResult.length === 0).toBeTruthy();
                expect(emptySummaries[4].summaryResult.length === 0).toBeTruthy();
            });


            it('should calculate summaries for \'date\' dataType or return if no data is provided', () => {
                const summaryClass = fix.componentInstance.dateSummary;

                const summaries = summaryClass.operate(fix.componentInstance.data.map((x) => x['OrderDate']));
                expect(summaries[0].summaryResult).toBe(10);
                expect(summaries[1].summaryResult.toLocaleDateString()).toBe('5/17/1990');
                expect(summaries[2].summaryResult.toLocaleDateString()).toBe('12/25/2025');

                const emptySummaries = summaryClass.operate([]);
                expect(emptySummaries[0].summaryResult).toBe(0);
                expect(emptySummaries[1].summaryResult).toBe(undefined);
                expect(emptySummaries[2].summaryResult).toBe(undefined);
            });

            it('should calc tfoot height according number of summary functions', () => {
                const summaries = fix.debugElement.queryAll(By.css('igx-grid-summary-cell'));
                const footerRow = fix.debugElement.query(By.css('.igx-grid__tfoot')).query(By.css('.igx-grid__summaries'))
                    .nativeElement.getBoundingClientRect().height;
                const tfootSize = +footerRow;

                const expectedHeight = GridFunctions.calcMaxSummaryHeight(grid.columnList, summaries, grid.defaultRowHeight);

                expect(tfootSize).toBe(expectedHeight);
            });

            it('should be able to change \'hasSummary\' property runtime and to recalculate grid sizes correctly', fakeAsync(() => {
                grid.columnList.forEach((col) => {
                    if (col.field !== 'ProductID') {
                        expect(grid.getColumnByName(col.field).hasSummary).toBe(true);
                    }
                });
                grid.getColumnByName('UnitsInStock').hasSummary = false;
                tick(100);
                fix.detectChanges();

                expect(grid.getColumnByName('UnitsInStock').hasSummary).toBe(false);

                const summaries = fix.debugElement.queryAll(By.css(SUMARRY_CELL)).filter((el) =>
                    el.nativeElement.classList.contains('igx-grid-summary--empty') === false);
                const tfootSize = +fix.debugElement.query(By.css('.igx-grid__summaries'))
                    .nativeElement.getBoundingClientRect().height;
                const expectedHeight = GridFunctions.calcMaxSummaryHeight(grid.columnList, summaries, grid.defaultRowHeight);
                expect(tfootSize).toBe(expectedHeight);

                grid.getColumnByName('ProductName').hasSummary = false;
                grid.getColumnByName('InStock').hasSummary = false;
                grid.getColumnByName('OrderDate').hasSummary = false;
                fix.detectChanges();
                tick(100);
                expect(fix.debugElement.query(By.css('.igx-grid__summaries'))).toBeNull();
                expect(grid.hasSummarizedColumns).toBe(false);
            }));
        });
    });

    describe('Integration Scenarious: ', () => {
        describe('', () => {
            let fix;
            let grid: IgxGridComponent;
            beforeEach(() => {
                fix = TestBed.createComponent(SummaryColumnComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
            });

            it('Filtering: should calculate summaries only over filteredData', () => {
                grid.filter('UnitsInStock', 0, IgxNumberFilteringOperand.instance().condition('equals'), true);
                fix.detectChanges();

                let filterResult = grid.rowList.length;
                expect(filterResult).toEqual(3);

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['3']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '0', '0', '0', '0']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count', 'Earliest', 'Latest'], ['3', 'Jul 27, 2001', 'Oct 11, 2007']);

                grid.filter('ProductID', 0, IgxNumberFilteringOperand.instance().condition('equals'), true);
                fix.detectChanges();

                filterResult = grid.rowList.length;
                expect(filterResult).toEqual(0);

                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['0']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['0', '', '', '', '']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count', 'Earliest', 'Latest'], ['0', '', '']);

                grid.clearFilter();
                fix.detectChanges();

                filterResult = grid.rowList.length;
                expect(filterResult).toEqual(10);

                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            });

            it('Moving: should move summaries when move colomn', () => {
                const colUnitsInStock = grid.getColumnByName('UnitsInStock');
                const colProductID = grid.getColumnByName('ProductID');
                colUnitsInStock.movable = true;
                fix.detectChanges();

                grid.moveColumn(colUnitsInStock, colProductID);
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            });

            it('Hiding: should hide summary row when a column which has summary is hidded', fakeAsync(() => {
                grid.getColumnByName('ProductName').hasSummary = false;
                grid.getColumnByName('InStock').hasSummary = false;
                grid.getColumnByName('OrderDate').hasSummary = false;
                // grid.recalculateSummaries();
                fix.detectChanges();
                tick(100);

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4, [], []);

                grid.getColumnByName('UnitsInStock').hidden = true;
                tick();
                fix.detectChanges();


                let summaryArea = fix.debugElement.query(By.css('.igx-grid__summaries'));
                expect(summaryArea).toBeNull();
                expect(grid.hasSummarizedColumns).toBe(false);

                grid.getColumnByName('UnitsInStock').hidden = false;
                tick();
                fix.detectChanges();
                summaryArea = fix.debugElement.query(By.css('.igx-grid__summaries'));
                expect(summaryArea).toBeDefined();
                expect(grid.hasSummarizedColumns).toBe(true);
                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4, [], []);
            }));

            it('Hiding: should recalculate summary area after column with enabled summary is hidden', fakeAsync(() => {
                let tFoot = fix.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(5 * grid.defaultRowHeight + 1);

                grid.getColumnByName('UnitsInStock').hidden = true;
                tick();
                fix.detectChanges();

                tFoot = fix.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(3 * grid.defaultRowHeight + 1);
                expect(grid.hasSummarizedColumns).toBe(true);

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);

                grid.getColumnByName('UnitsInStock').hidden = false;
                tick();
                fix.detectChanges();

                expect(grid.hasSummarizedColumns).toBe(true);
                tFoot = fix.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;
                expect(tFoot).toEqual(5 * grid.defaultRowHeight + 1);
                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            }));

            it('CRUD: should recalculate summary functions onRowAdded', () => {
                grid.addRow({
                    ProductID: 11, ProductName: 'Belgian Chocolate', InStock: true, UnitsInStock: 99000, OrderDate: new Date('2018-03-01')
                });
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['11']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['11']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['11', '0', '99,000', '138,004', '12,545.818']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['11', 'May 17, 1990', 'Dec 25, 2025']);
            });

            it('CRUD: should recalculate summary functions onRowDeleted', () => {
                grid.deleteRow(9);
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['9']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['9']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['9', '0', '20,000', '32,006', '3,556.222']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['9', 'May 17, 1990', 'Mar 1, 2018']);
            });

            it('CRUD: should recalculate summary functions on updateRow', () => {
                const productNameCell = grid.getCellByColumn(0, 'ProductName');
                const unitsInStockCell = grid.getCellByColumn(0, 'UnitsInStock');

                expect(productNameCell.value).toBe('Chai');
                expect(unitsInStockCell.value).toBe(2760);

                grid.updateRow({
                    ProductID: 1, ProductName: 'Spearmint', InStock: true, UnitsInStock: 510000, OrderDate: new Date('1984-03-21')
                }, 1);
                fix.detectChanges();

                expect(productNameCell.value).toBe('Spearmint');
                expect(unitsInStockCell.value).toBe(510000);

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '510,000', '546,244', '54,624.4']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'Mar 21, 1984', 'Dec 25, 2025']);
            });

            it('CRUD: should recalculate summary functions on cell update', () => {
                const unitsInStockCell = grid.getCellByColumn(0, 'UnitsInStock');
                unitsInStockCell.update(99000);
                fix.detectChanges();

                let summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '99,000', '135,244', '13,524.4']);

                unitsInStockCell.update(-12);
                fix.detectChanges();
                summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 3,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '-12', '20,000', '36,232', '3,623.2']);
            });

            it('Pinning: should display all active summaries after column pinning', () => {
                grid.pinColumn('UnitsInStock');
                grid.pinColumn('ProductID');
                fix.detectChanges();

                const summaryRow = fix.debugElement.query(By.css(SUMMARY_ROW));
                HelperUtils.verifyColumnSummaries(summaryRow, 0,
                    ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['10', '0', '20,000', '39,004', '3,900.4']);
                HelperUtils.verifyColumnSummaries(summaryRow, 1, [], []);
                HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count'], ['10']);
                HelperUtils.verifyColumnSummaries(summaryRow, 4,
                    ['Count', 'Earliest', 'Latest'], ['10', 'May 17, 1990', 'Dec 25, 2025']);
            });
        });

        it('MCH - verify summaries when there are grouped columns', (async () => {
            const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
            fixture.detectChanges();
            const grid = fixture.componentInstance.grid;

            // Verify columns and groups
            expect(document.querySelectorAll('igx-grid-header-group').length).toEqual(18);
            expect(document.querySelectorAll('.igx-grid__th').length).toEqual(11);

            const allColumns = grid.columnList;
            allColumns.forEach((col) => {
                if (!col.columnGroup) {
                    col.hasSummary = true;
                }
            });
            await wait();
            fixture.detectChanges();

            const summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            HelperUtils.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['27']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['27']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count'], ['27']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['27']);
            HelperUtils.verifyColumnSummaries(summaryRow, 5, ['Count'], ['27']);
            HelperUtils.verifyColumnSummaries(summaryRow, 6, ['Count'], ['27']);
        }));
    });

    describe('Grouping tests: ', () => {
        let fix;
        let grid;
        beforeEach(() => {
            fix = TestBed.createComponent(SummarieGroupByComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            grid.groupBy({
                fieldName: 'ParentID', dir: SortingDirection.Asc, ignoreCase: false
            });

            fix.detectChanges();
        });

        it('should render correct summaries when there is grouped colomn', () => {
            verifyBaseSummaries(fix);
            verifySummariesForParentID17(fix, 3);
            const groupRows = grid.groupsRowList.toArray();
            groupRows[0].toggle();
            fix.detectChanges();
            verifyBaseSummaries(fix);
            verifySummariesForParentID19(fix, 3);
        });

        it('should be able to enable/disable summaries at runtime', () => {
            grid.getColumnByName('Age').hasSummary = false;
            grid.getColumnByName('ParentID').hasSummary = false;
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 3,  grid.defaultRowHeight );

            let summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, [], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, ['Count', 'Earliest', 'Latest'], []);
                HelperUtils.verifyColumnSummaries(summary, 4, [], []);
                HelperUtils.verifyColumnSummaries(summary, 5, ['Count'], []);
            });

            // Disable all summaries
            grid.getColumnByName('Name').hasSummary = false;
            grid.getColumnByName('HireDate').hasSummary = false;
            grid.getColumnByName('OnPTO').hasSummary = false;
            fix.detectChanges();
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(0);

            grid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(5);
            HelperUtils.verifyVisbleSummariesHeight(fix, 1,  grid.defaultRowHeight );
            summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, [], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, [], []);
                HelperUtils.verifyColumnSummaries(summary, 4, [], []);
                HelperUtils.verifyColumnSummaries(summary, 5, [], []);
            });
        });

        it('should show/hide summaries when expand/collapse group row', () => {
            grid.disableSummaries([{ fieldName: 'Age' }, { fieldName: 'ParentID' }, { fieldName: 'HireDate' }]);
            fix.detectChanges();
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(5);

            const groupRows = grid.groupsRowList.toArray();
            groupRows[0].toggle();
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(4);

            grid.toggleAllGroupRows();
            fix.detectChanges();
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);

            groupRows[0].toggle();
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);

            grid.toggleAllGroupRows();
            fix.detectChanges();
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(5);
        });

        it('should be able to enable/disable summaries at runtime', () => {
            grid.getColumnByName('Age').hasSummary = false;
            grid.getColumnByName('ParentID').hasSummary = false;
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 3,  grid.defaultRowHeight );

            let summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, [], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, ['Count', 'Earliest', 'Latest'], []);
                HelperUtils.verifyColumnSummaries(summary, 4, [], []);
                HelperUtils.verifyColumnSummaries(summary, 5, ['Count'], []);
            });

            // Disable all summaries
            grid.getColumnByName('Name').hasSummary = false;
            grid.getColumnByName('HireDate').hasSummary = false;
            grid.getColumnByName('OnPTO').hasSummary = false;
            fix.detectChanges();
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(0);

            grid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(5);
            HelperUtils.verifyVisbleSummariesHeight(fix, 1,  grid.defaultRowHeight );
            summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, [], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, [], []);
                HelperUtils.verifyColumnSummaries(summary, 4, [], []);
                HelperUtils.verifyColumnSummaries(summary, 5, [], []);
            });
        });


    });

    function verifyBaseSummaries(fixture) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, 0);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '17', '847', '2,188', '273.5']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['8']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['8', 'Dec 18, 2007', 'Dec 9, 2017']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['8', '25', '50', '293', '36.625']);
        HelperUtils.verifyColumnSummaries(summaryRow, 5, ['Count'], ['8']);
    }

    function verifySummariesForParentID19(fixture, vissibleIndex) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '19', '19', '19', '19']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['1']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['1', 'May 4, 2014', 'May 4, 2014']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '44', '44', '44', '44']);
        HelperUtils.verifyColumnSummaries(summaryRow, 5, ['Count'], ['1']);
    }

    function verifySummariesForParentID17(fixture, vissibleIndex) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '17', '17', '34', '17']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Earliest', 'Latest'], ['2', 'Dec 18, 2007', 'Mar 19, 2016']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '27', '50', '77', '38.5']);
        HelperUtils.verifyColumnSummaries(summaryRow, 5, ['Count'], ['2']);
    }
});

@Component({
    template: `
        <igx-grid #grid1 [data]="data" width="300px">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'">
            </igx-column>
            <igx-column field="OrderDate" [dataType]="'date'">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true">
            </igx-column>
        </igx-grid>
    `
})
export class SummaryColumnsWithIdenticalWidthsComponent {

    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public data = SampleTestData.foodProductData();
}

class DealsSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'average' || obj.key === 'sum' || obj.key === 'count') {
                const summaryResult = obj.summaryResult;
                // apply formatting to float numbers
                if (Number(summaryResult) === summaryResult) {
                    obj.summaryResult = summaryResult.toLocaleString('en-us', { maximumFractionDigits: 2 });
                }
                return obj;
            }
        });
        return result;
    }
}

class DealsSummaryMinMax extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries);
        result.push({
            key: 'test',
            label: 'Test',
            summaryResult: summaries.filter(rec => rec > 10 && rec < 30).length
        });

        return result;
    }
}

class EarliestSummary extends IgxDateSummaryOperand {
    constructor() {
        super();
    }

    public operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'earliest') {
                obj.summaryResult = new Intl.DateTimeFormat('en-US').format(obj.summaryResult);
                return obj;
            }
        });
        return result;
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [primaryKey]="'ProductID'" [allowFiltering]="true">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true"  [summaries]="dealsSummary">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true"
                [summaries]="earliest">
            </igx-column>
        </igx-grid>
    `
})

export class CustomSummariesComponent {
    public data = SampleTestData.foodProductData();
    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;
    public dealsSummary = DealsSummary;
    public dealsSummaryMinMax = DealsSummaryMinMax;
    public earliest = EarliestSummary;
}
