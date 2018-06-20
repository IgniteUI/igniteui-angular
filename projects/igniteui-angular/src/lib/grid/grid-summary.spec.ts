import { Component, DebugElement, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxDateSummaryOperand, IgxNumberSummaryOperand } from './grid-summary';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxGridAPIService } from './api.service';

describe('IgxGrid - Summaries', () => {
    const SUMMARY_CLASS = '.igx-grid-summary';
    const SUMMARY_LABEL_CLASS = '.igx-grid-summary__label';
    const SUMMARY_VALUE_CLASS = '.igx-grid-summary__result';
    const ITEM_CLASS = 'igx-grid-summary__item';
    const HIDDEN_ITEM_CLASS = 'igx-grid-summary__item--inactive';
    const INITIAL_SUMMARY_SIZE = 36.36;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NoActiveSummariesComponent,
                SummaryColumnComponent,
                VirtualSummaryColumnComponent,
                SummaryColumnsWithIdenticalWidthsComponent,
                UndefinedGridDataComponent
            ],
            imports: [BrowserAnimationsModule, IgxGridModule.forRoot()]
        })
            .compileComponents();
    }));
    it('should not have summary if no summary is active ', () => {
        const fixture = TestBed.createComponent(NoActiveSummariesComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css(SUMMARY_CLASS))).toBeNull();
    });
    it('should enableSummaries through grid API ', () => {
        const fixture = TestBed.createComponent(NoActiveSummariesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        expect(grid.hasSummarizedColumns).toBe(false);
        let tFoot = fixture.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;
        expect(tFoot < grid.defaultRowHeight).toBe(true);

        grid.enableSummaries([{ fieldName: 'ProductName' }, { fieldName: 'ProductID' }]);
        fixture.detectChanges();

        const summaries = fixture.debugElement.queryAll(By.css('igx-grid-summary'));
        let summaryLength = 0;
        summaries.forEach((summary) => {
            if (summary.children.length > 0) {
                summaryLength++;
            }
        });
        expect(grid.hasSummarizedColumns).toBe(true);

        tFoot = fixture.debugElement.query(By.css('.igx-grid__tfoot')).nativeElement.getBoundingClientRect().height;

        expect(summaryLength).toBe(2);
        expect(grid.getColumnByName('ProductID').hasSummary).toBe(true);
        expect(grid.getColumnByName('ProductName').hasSummary).toBe(true);
        expect(grid.getColumnByName('OrderDate').hasSummary).toBe(false);

        const expectedLength = calcMaxSummaryHeight(grid.columnList, summaries, grid.defaultRowHeight);
        expect(tFoot >= expectedLength).toBe(true);
    });
    it('should disableSummaries through grid API ', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summariedColumns = [];
        grid.columnList.forEach((col) => {
            if (col.hasSummary) {
                summariedColumns.push(col.field);
            }
        });
        grid.disableSummaries(summariedColumns);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(SUMMARY_CLASS))).toBeNull();
        expect(grid.hasSummarizedColumns).toBe(false);
    });
    it('should have summary per each column that \'hasSummary\'= true', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(SUMMARY_CLASS))).toBeDefined();

        let summaries = 0;
        const summariedColumns = fixture.componentInstance.grid1.columnList.filter((col) => col.hasSummary === true).length;
        summaries = fixture.debugElement.queryAll(By.css(SUMMARY_CLASS)).filter((summary) => summary.children.length > 0).length;
        expect(summaries).toBe(summariedColumns);
    });
    it('should have count summary for string and boolean data types', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const sum = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css('igx-grid-summary'));

        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === 'string' || col.dataType === 'boolean')) {
                const labels = summaries[index].queryAll(By.css(SUMMARY_LABEL_CLASS));
                expect(labels.length).toBe(1);
                expect(labels[0].nativeElement.innerText).toBe('Count');
            }
            index++;
        });
    });
    it('should have count, min, max, avg and sum summary for numeric data types', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const sum = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css('igx-grid-summary'));

        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === 'number')) {
                const labels = summaries[index].queryAll(By.css(SUMMARY_LABEL_CLASS));
                expect(labels.length).toBe(5);
                expect(labels[0].nativeElement.innerText).toBe('Count');
                expect(labels[1].nativeElement.innerText).toBe('Min');
                expect(labels[2].nativeElement.innerText).toBe('Max');
                expect(labels[3].nativeElement.innerText).toBe('Sum');
                expect(labels[4].nativeElement.innerText).toBe('Avg');
            }
            index++;
        });
    });
    it('should have count, earliest and latest summary for \'date\' data types', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const sum = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css('igx-grid-summary'));

        let index = 0;
        sum.columnList.forEach((col) => {
            if (col.hasSummary && (col.dataType === 'date')) {
                const labels = summaries[index].queryAll(By.css(SUMMARY_LABEL_CLASS));
                expect(labels.length).toBe(3);
                expect(labels[0].nativeElement.innerText).toBe('Count');
                expect(labels[1].nativeElement.innerText).toBe('Earliest');
                expect(labels[2].nativeElement.innerText).toBe('Latest');
            }
            index++;
        });
    });
    it('should summary function stay active when is clicked on it\'s label', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const summary = fixture.debugElement.queryAll(By.css('igx-grid-summary'))[3];
        const min: DebugElement = summary.query(By.css('[title=\'Min\']'));

        expect(min.parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
        min.triggerEventHandler('click', null);
        fixture.detectChanges();

        expect(min.parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
        expect(summary.query(By.css('[title=\'Count\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
        expect(summary.query(By.css('[title=\'Max\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
        expect(summary.query(By.css('[title=\'Sum\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
        expect(summary.query(By.css('[title=\'Avg\']')).parent.nativeElement.classList.contains(ITEM_CLASS)).toBeTruthy();
    });
    it('should recalculate summary functions onRowAdded', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css(SUMMARY_CLASS));

        let countValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css('[title=\'Count\']'));
            if (countLabel) {
                countValue = countLabel.nativeElement.nextSibling.innerText;
                expect(+countValue).toBe(grid.rowList.length);
            }
        });

        grid.addRow({
            ProductID: 11, ProductName: 'Belgian Chocolate', InStock: true, UnitsInStock: 99000, OrderDate: new Date('2018-03-01')
        });
        fixture.detectChanges();

        let updatedValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css('[title=\'Count\']'));
            if (countLabel) {
                updatedValue = countLabel.nativeElement.nextSibling.innerText;
                expect(+updatedValue).toBe(grid.rowList.length);
            }
        });
    });
    it('should recalculate summary functions onRowDeleted', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css(SUMMARY_CLASS));

        let countValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css('[title=\'Count\']'));
            if (countLabel) {
                countValue = countLabel.nativeElement.nextSibling.innerText;
                expect(+countValue).toBe(grid.rowList.length);
            }
        });

        grid.deleteRow(0);
        fixture.detectChanges();

        let updatedValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css('[title=\'Count\']'));
            if (countLabel) {
                updatedValue = countLabel.nativeElement.nextSibling.innerText;
                expect(+updatedValue).toBe(grid.rowList.length);
            }
        });
    });
    it('should recalculate summary functions on updateRow', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css(SUMMARY_CLASS));

        const productNameCell = grid.getCellByColumn(0, 'ProductName');
        const unitsInStockCell = grid.getCellByColumn(0, 'UnitsInStock');
        let countValue;
        summaries.forEach((summary) => {
            const countLabel = summary.query(By.css('[title=\'Count\']'));
            if (countLabel) {
                countValue = countLabel.nativeElement.nextSibling.innerText;
                expect(+countValue).toBe(grid.rowList.length);
            }
        });

        expect(productNameCell.value).toBe('Chai');
        expect(unitsInStockCell.value).toBe(2760);

        grid.updateRow({
            ProductID: 1, ProductName: 'Spearmint', InStock: true, UnitsInStock: 1, OrderDate: new Date('2005-03-21')
        }, 0);
        fixture.detectChanges();

        expect(+countValue).toBe(grid.rowList.length);
        expect(productNameCell.value).toBe('Spearmint');
        expect(unitsInStockCell.value).toBe(1);
    });
    it('should recalculate summary functions on cell update', async(() => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();
        const oldMaxValue = 20000;
        const newMaxValue = 99000;
        const grid = fixture.componentInstance.grid1;
        const summariesUnitOfStock = fixture.debugElement.queryAll(By.css(SUMMARY_CLASS))[3];
        const unitsInStockCell = grid.getCellByColumn(0, 'UnitsInStock');

        let maxValue = summariesUnitOfStock.query(By.css('[title=\'Max\']')).nativeElement.nextSibling.innerText;
        expect(+maxValue).toBe(oldMaxValue);
        unitsInStockCell.update(newMaxValue);
        grid.cdr.detectChanges();
        fixture.whenStable().then(() => {
            fixture.detectChanges();

            maxValue = summariesUnitOfStock.query(By.css('[title=\'Max\']')).nativeElement.nextSibling.innerText;
            expect(+maxValue).toBe(newMaxValue);
        });
    }));
    it('should display all active summaries after column pinning', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summariedColumns = grid.columnList.filter((col) => col.hasSummary === true).length;
        let displayedSummaries = fixture.debugElement.queryAll(By.css(SUMMARY_CLASS))
            .filter((summary) => summary.children.length > 0).length;
        expect(displayedSummaries).toBe(summariedColumns);

        grid.pinColumn('UnitsInStock');
        grid.pinColumn('ProductID');
        fixture.detectChanges();

        displayedSummaries = fixture.debugElement.queryAll(By.css(SUMMARY_CLASS)).filter((summary) => summary.children.length > 0).length;
        expect(displayedSummaries).toBe(summariedColumns);

    });
    it('should calc tfoot height according number of summary functions', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid1;
        const summaries = fixture.debugElement.queryAll(By.css('igx-grid-summary'));
        const footerRow = fixture.debugElement.query(By.css('.igx-grid__tfoot')).query(By.css('.igx-grid__summaries'))
            .nativeElement.getBoundingClientRect().height;
        const tfootSize = +footerRow;

        const expectedHeight = calcMaxSummaryHeight(grid.columnList, summaries, grid.defaultRowHeight);

        expect(tfootSize).toBe(expectedHeight);
    });
    it('should calculate summaries for \'number\' dataType or return if no data is provided', () => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaryClass = fixture.componentInstance.numberSummary;

        const summaries = summaryClass.operate(fixture.componentInstance.data.map((x) => x['UnitsInStock']));
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
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summaryClass = fixture.componentInstance.dateSummary;

        const summaries = summaryClass.operate(fixture.componentInstance.data.map((x) => x['OrderDate']));
        expect(summaries[0].summaryResult).toBe(10);
        expect(summaries[1].summaryResult.toLocaleDateString()).toBe('5/17/1990');
        expect(summaries[2].summaryResult.toLocaleDateString()).toBe('12/25/2025');

        const emptySummaries = summaryClass.operate([]);
        expect(emptySummaries[0].summaryResult).toBe(0);
        expect(emptySummaries[1].summaryResult).toBe(undefined);
        expect(emptySummaries[2].summaryResult).toBe(undefined);
    });
    it('should calculate summaries only over filteredData', (done) => {
        const fixture = TestBed.createComponent(SummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const filterUIContainer = fixture.debugElement.query(By.css('igx-grid-filter'));
        const filterIcon = filterUIContainer.query(By.css('igx-icon'));
        const input = filterUIContainer.query(By.directive(IgxInputDirective));
        const select = filterUIContainer.query(By.css('select'));
        const summaries = fixture.debugElement.queryAll(By.css('igx-grid-summary'));

        filterIcon.nativeElement.click();
        fixture.detectChanges();
        select.nativeElement.value = 'equals';
        select.nativeElement.dispatchEvent(new Event('change'));

        sendInput(input, '0', fixture).then(() => {
            fixture.detectChanges();
            const filterResult = grid.rowList.length;
            expect(filterResult).toEqual(3);
            let index = 0;
            grid.columnList.forEach((col) => {
                if (col.hasSummary) {
                    const values = summaries[index].queryAll(By.css(SUMMARY_VALUE_CLASS));
                    expect(+values[0].nativeElement.innerText).toBe(filterResult);
                    if (col.field === 'UnitsInStock') {
                        expect(values[1].nativeElement.innerText).toBe('0');
                        expect(values[2].nativeElement.innerText).toBe('0');
                    }
                }
                index++;
            });
            done();
        });
    });

    it('When we have data which is undefined and enable summary per defined column, error should not be thrown', async(() => {
        const fix = TestBed.createComponent(UndefinedGridDataComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const idColumn = grid.getColumnByName('ID');
        expect(grid.data.length > 0).toEqual(true);

        fix.whenStable().then(() => {
            fix.componentInstance.data = undefined;
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(grid.data).toEqual(undefined);
            expect(() => {
                grid.enableSummaries(idColumn.field);
                fix.detectChanges();
            }).not.toThrow();
        });
    }));

    it('should render correct data after hiding all summaries when scrolled to the bottom', async(() => {
        const fixture = TestBed.createComponent(VirtualSummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summariedColumns = ['ProductName', 'InStock', 'UnitsInStock', 'OrderDate'];
        let rowsRendered;
        let tbody;
        let expectedRowLenght;
        fixture.componentInstance.scrollTop(10000);

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            rowsRendered = fixture.nativeElement.querySelectorAll('igx-grid-row');
            tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
            expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight);

            expect(rowsRendered.length).toEqual(expectedRowLenght);
            grid.disableSummaries(summariedColumns);
            return fixture.whenStable();
        }).then(() => {
            setTimeout(() => {
                fixture.detectChanges();
                rowsRendered = Array.from(fixture.nativeElement.querySelectorAll('igx-grid-row'));
                tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
                expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight);

                fixture.detectChanges();
                const firstCells = rowsRendered.map((item) => {
                    return item.querySelectorAll('igx-grid-cell')[0];
                });
                expect(rowsRendered.length).toEqual(expectedRowLenght);
                const expectedFirstCellNum = grid.data.length - expectedRowLenght + 1;
                for (let i = 0; i < rowsRendered.length - 1; i++) {
                    expect(firstCells[i].textContent.trim()).toEqual((expectedFirstCellNum + i).toString());
                }
            }, 100);
        });
    }));

    it('should render correct data after hiding one bigger and then one smaller summary when scrolled to the bottom', async(() => {
        const fixture = TestBed.createComponent(VirtualSummaryColumnComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid1;
        const summariedColumns = ['ProductName', 'InStock', 'UnitsInStock', 'OrderDate'];
        let rowsRendered;
        let tbody;
        let expectedRowLenght;
        let firstCellsText;
        fixture.componentInstance.scrollTop(10000);

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            rowsRendered = fixture.nativeElement.querySelectorAll('igx-grid-row');
            tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
            expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight);
            expect(rowsRendered.length).toEqual(expectedRowLenght);

            grid.disableSummaries(['ProductName', 'InStock', 'UnitsInStock']);
            return fixture.whenStable();
        }).then(() => {
            setTimeout(() => {
                fixture.detectChanges();

                rowsRendered = Array.from(fixture.nativeElement.querySelectorAll('igx-grid-row'));
                tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
                expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight);

                firstCellsText = rowsRendered.map((item) => {
                    return item.querySelectorAll('igx-grid-cell')[0].textContent.trim();
                });
                expect(rowsRendered.length).toEqual(expectedRowLenght);
                let expectedFirstCellNum = grid.data.length - expectedRowLenght + 1;

                for (let i = 0; i < rowsRendered.length - 1; i++) {
                    expect(firstCellsText[i]).toEqual((expectedFirstCellNum + i).toString());
                }
                grid.disableSummaries(['OrderDate']);

                setTimeout(() => {
                    fixture.detectChanges();

                    rowsRendered = Array.from(fixture.nativeElement.querySelectorAll('igx-grid-row'));
                    tbody = grid.nativeElement.querySelector('.igx-grid__tbody').getBoundingClientRect().height;
                    expectedRowLenght = Math.ceil(parseFloat(tbody) / grid.defaultRowHeight);

                    firstCellsText = rowsRendered.map((item) => {
                        return item.querySelectorAll('igx-grid-cell')[0].textContent.trim();
                    });
                    expect(rowsRendered.length).toEqual(expectedRowLenght);
                    expectedFirstCellNum = grid.data.length - expectedRowLenght + 1;
                    for (let i = 0; i < rowsRendered.length - 1; i++) {
                        expect(firstCellsText[i]).toEqual((expectedFirstCellNum + i).toString());
                    }
                }, 100);
            }, 100);
        });
    }));

    it(`Should update summary section when the column is outside of the
            viewport and have identical width with others`, async(() => {
        const fix = TestBed.createComponent(SummaryColumnsWithIdenticalWidthsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;
        let summaries = fix.componentInstance.gridApi.get_summaries(grid.id);

        let getCountResSummary = summaries.get('UnitsInStock').find((k) => k.key === 'count').summaryResult;
        expect(getCountResSummary).toEqual(fix.componentInstance.data.length);
        fix.whenStable().then(() => {
            grid.addRow({
                ProductID: 11, ProductName: 'Belgian Chocolate', InStock: true, UnitsInStock: 99000, OrderDate: new Date('2018-03-01')
            });
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            scrollLeft(grid, 400);
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
           setTimeout(() => {
                summaries = fix.componentInstance.gridApi.get_summaries(grid.id);
                getCountResSummary = summaries.get('UnitsInStock').find((k) => k.key === 'count').summaryResult;
                expect(getCountResSummary).toEqual(fix.componentInstance.data.length);
                return getCountResSummary;
            }, 100);
        });
    }));

    function sendInput(element, text: string, fix) {
        element.nativeElement.value = text;
        element.nativeElement.dispatchEvent(new Event('input'));
        fix.detectChanges();
        return fix.whenStable();
    }
    function calcMaxSummaryHeight(columnList, summaries: DebugElement[], defaultRowHeight) {
        let maxSummaryLength = 0;
        let index = 0;
        columnList.filter((col) => col.hasSummary).forEach((column) => {
            const currentLength = summaries[index].queryAll(By.css(SUMMARY_LABEL_CLASS)).length;
            if (maxSummaryLength < currentLength) {
                maxSummaryLength = currentLength;
            }
            index++;
        });
        const expectedLength = maxSummaryLength * defaultRowHeight;
        return expectedLength;
    }

    function scrollLeft(grid: IgxGridComponent, newLeft: number) {
        const hScrollbar = grid.parentVirtDir.getHorizontalScroll();
        hScrollbar.scrollLeft = newLeft;
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
export class  SummaryColumnsWithIdenticalWidthsComponent {

    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public data = [
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: '2005-03-21' },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: '2008-01-15' },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: '2010-11-20' },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: '2007-10-11' },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: '2001-07-27' },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: '1990-05-17' },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: '2005-03-03' },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: '2017-09-09' },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: '2025-12-25' },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: '2018-03-01' }
    ];

    constructor(public gridApi: IgxGridAPIService) { }
}


@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'">
            </igx-column>
        </igx-grid>
    `
})
export class NoActiveSummariesComponent {

    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public data = [
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: '2005-03-21' },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: '2008-01-15' },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: '2010-11-20' },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: '2007-10-11' },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: '2001-07-27' },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: '1990-05-17' },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: '2005-03-03' },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: '2017-09-09' },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: '2025-12-25' },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: '2018-03-01' }
    ];
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [filterable]="true">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
            </igx-column>
        </igx-grid>
    `
})
export class SummaryColumnComponent {

    public data = [
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21') },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15') },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: new Date('2010-11-20') },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11') },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27') },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17') },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03') },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09') },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: new Date('2025-12-25') },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: new Date('2018-03-01') }
    ];
    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [width]="width" [height]="height">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [filterable]="true">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
            </igx-column>
        </igx-grid>
    `
})
export class VirtualSummaryColumnComponent {

    public data = [
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21') },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15') },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: new Date('2010-11-20') },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11') },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27') },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17') },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03') },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09') },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: new Date('2025-12-25') },
        { ProductID: 10, ProductName: 'Pie', InStock: true, UnitsInStock: 1000, OrderDate: new Date('2017-05-07') },
        { ProductID: 11, ProductName: 'Pasta', InStock: false, UnitsInStock: 198, OrderDate: new Date('2001-02-15') },
        { ProductID: 12, ProductName: 'Krusty krab\'s burger', InStock: true, UnitsInStock: 52, OrderDate: new Date('2012-09-25') },
        { ProductID: 13, ProductName: 'Lasagna', InStock: false, UnitsInStock: 0, OrderDate: new Date('2015-02-09') },
        { ProductID: 14, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2008-03-17') },
        { ProductID: 15, ProductName: 'Cheese', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-11-27') },
        { ProductID: 16, ProductName: 'Devil\'s Hot Chilli Sauce', InStock: false, UnitsInStock: 0, OrderDate: new Date('2012-08-14') },
        { ProductID: 17, ProductName: 'Parmesan', InStock: true, UnitsInStock: 4898, OrderDate: new Date('2017-09-09') },
        { ProductID: 18, ProductName: 'Steaks', InStock: true, UnitsInStock: 3098, OrderDate: new Date('2025-12-25') },
        { ProductID: 19, ProductName: 'Biscuits', InStock: true, UnitsInStock: 10570, OrderDate: new Date('2018-03-01') }
    ];

    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public width = '800px';
    public height = '600px';

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();

    public scrollTop(newTop: number) {
        const vScrollbar = this.grid1.verticalScrollContainer.getVerticalScroll();
        vScrollbar.scrollTop = newTop;
    }
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column field="ID" [dataType]="'number'" [hasSummary]="hasSummary"></igx-column>
        </igx-grid>`
})
export class UndefinedGridDataComponent {

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public grid: IgxGridComponent;

    constructor() { }

    public data: any = [
        { ID: 1 },
        { ID: 2 },
        { ID: 3 },
        { ID: 4 },
        { ID: 5 },
        { ID: 6 },
        { ID: 7 }
    ];

    public hasSummary = false;
}
