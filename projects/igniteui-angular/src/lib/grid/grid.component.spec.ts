import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridAPIService } from './api.service';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxNumberFilteringOperand } from '../../public_api';
import { DisplayDensity } from '../core/utils';

describe('IgxGrid - input properties', () => {
    const MIN_COL_WIDTH = '136px';
    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridTestComponent, IgGridTest5x5Component, IgGridTest10x30Component,
                IgGridTest30x1000Component, IgGridTest150x200Component,
                IgxGridTestDefaultWidthHeightComponent, IgGridNullHeightComponent,
                IgxGridTestPercentWidthHeightComponent, IgxGridDensityTestComponent,
                IgxGridWithEmptyDataComponent, IgxGridWrappedInNoHeightContainerComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it('height/width should be calculated depending on number of records', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxGridTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridBody = fix.debugElement.query(By.css('.igx-grid__tbody'));
        const gridHeader = fix.debugElement.query(By.css('.igx-grid__thead'));
        const gridFooter = fix.debugElement.query(By.css('.igx-grid__tfoot'));
        const gridScroll = fix.debugElement.query(By.css('.igx-grid__scroll'));
        let gridBodyHeight;
        let verticalScrollHeight;

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(1);
        expect(window.getComputedStyle(gridBody.nativeElement).height).toMatch('50px');

        for (let i = 2; i <= 30; i++) {
            grid.addRow({ index: i, value: i });
        }

        fix.detectChanges();

        expect(grid.rowList.length).toEqual(30);
        expect(window.getComputedStyle(gridBody.nativeElement).height).toMatch('1500px');
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(false);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false);
        grid.height = '200px';
        fix.detectChanges();

        tick(200);
        fix.detectChanges();
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false);
        verticalScrollHeight = fix.componentInstance.getVerticalScrollHeight();
        grid.width = '200px';

        tick(200);
        fix.detectChanges();
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(true);
        expect(fix.componentInstance.getVerticalScrollHeight()).toBeLessThan(verticalScrollHeight);
        gridBodyHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);

        expect(window.getComputedStyle(grid.nativeElement).width).toMatch('200px');
        expect(window.getComputedStyle(grid.nativeElement).height).toMatch('200px');
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toEqual(gridBodyHeight);
        grid.height = '50%';
        fix.detectChanges();
        tick(200);
        fix.detectChanges();

        grid.width = '50%';
        fix.detectChanges();
        tick(200);
        fix.detectChanges();

        expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
        expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');

        gridBodyHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10);

        // The scrollbar is no longer visible
        //    - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);
        // console.log(gridBodyHeight);
        // console.log(window.getComputedStyle(gridBody.nativeElement).height);
        // console.log(gridBodyHeight === parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10));
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toEqual(gridBodyHeight);
    }));

    it('should not have column misalignment when no vertical scrollbar is shown', () => {
        const fix = TestBed.createComponent(IgxGridTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridBody = fix.debugElement.query(By.css('.igx-grid__tbody'));
        const gridHeader = fix.debugElement.query(By.css('.igx-grid__thead'));

        expect(window.getComputedStyle(gridBody.children[0].nativeElement).width).toEqual(
            window.getComputedStyle(gridHeader.children[0].nativeElement).width
        );
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('col width should be >=136px - grid 5x5', () => {
        const fix = TestBed.createComponent(IgGridTest5x5Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[2].width).not.toBeLessThan(136);
        expect(grid.width).toMatch('100%');
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('col width should be >=136px - grid 10x30', () => {
        const fix = TestBed.createComponent(IgGridTest10x30Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[4].width).not.toBeLessThan(136);
        expect(grid.columns[6].width).not.toBeLessThan(136);
        expect(grid.width).toMatch('100%');
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('col width should be >=136px - grid 30x1000', () => {
        const fix = TestBed.createComponent(IgGridTest30x1000Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;
        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[4].width).not.toBeLessThan(136);
        expect(grid.columns[14].width).not.toBeLessThan(136);
        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
    });

    it('col width should be >=136px - grid 150x200', () => {
        const fix = TestBed.createComponent(IgGridTest150x200Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[4].width).not.toBeLessThan(136);
        expect(grid.columns[100].width).not.toBeLessThan(136);
        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering of data with 5 columns and 5 rows where 2 of the columns have width set', () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(5);
        fix.detectChanges();
        expect(grid.width).toEqual('100%');
        expect(grid.columns[0].width).toEqual('200px');
        expect(grid.columns[4].width).toEqual('200px');

        const actualGridWidth = grid.nativeElement.clientWidth;
        const expectedDefWidth = Math.max(Math.floor((actualGridWidth -
            parseInt(grid.columns[0].width, 10) -
            parseInt(grid.columns[4].width, 10)) / 3),
            parseInt(MIN_COL_WIDTH, 10));
        expect(parseInt(grid.columnWidth, 10)).toEqual(expectedDefWidth);

        expect(parseInt(grid.columns[1].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[2].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[3].width, 10)).toEqual(expectedDefWidth);

        grid.columns.forEach((column) => {
            const width = parseInt(column.width, 10);
            const minWidth = parseInt(grid.columnWidth, 10);
            if (column.index !== 0 && column.index !== 4) {
                expect(width).toBeGreaterThanOrEqual(minWidth);
            }
        });

        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(false);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering of data with 5 columns and 5 rows where 2 of the columns have width set and grid has width', () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        grid.width = '800px';
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(5);
        fix.detectChanges();

        expect(grid.width).toEqual('800px');
        expect(grid.columns[0].width).toEqual('200px');
        expect(grid.columns[4].width).toEqual('200px');

        const actualGridWidth = grid.nativeElement.clientWidth;
        const expectedDefWidth = Math.max(Math.floor((actualGridWidth -
            parseInt(grid.columns[0].width, 10) -
            parseInt(grid.columns[4].width, 10)) / 3),
            parseInt(MIN_COL_WIDTH, 10));
        expect(parseInt(grid.columnWidth, 10)).toEqual(expectedDefWidth);

        expect(parseInt(grid.columns[1].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[2].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[3].width, 10)).toEqual(expectedDefWidth);

        grid.columns.forEach((column) => {
            const width = parseInt(column.width, 10);
            const minWidth = parseInt(grid.columnWidth, 10);
            if (column.index !== 0 && column.index !== 4) {
                expect(width).toBeGreaterThanOrEqual(minWidth);
            }
        });

        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering of data with 5 columns and 30 rows where 2 of the columns have width set', () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(30);
        fix.detectChanges();

        expect(grid.width).toEqual('100%');
        expect(grid.columns[0].width).toEqual('200px');
        expect(grid.columns[4].width).toEqual('200px');

        const actualGridWidth = grid.nativeElement.clientWidth;

        const expectedDefWidth = Math.max(Math.floor((actualGridWidth -
            parseInt(grid.columns[0].width, 10) -
            parseInt(grid.columns[4].width, 10)) / 3),
            parseInt(MIN_COL_WIDTH, 10));
        expect(parseInt(grid.columnWidth, 10)).toEqual(expectedDefWidth);

        expect(parseInt(grid.columns[1].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[2].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[3].width, 10)).toEqual(expectedDefWidth);

        grid.columns.forEach((column) => {
            const width = parseInt(column.width, 10);
            const minWidth = parseInt(grid.columnWidth, 10);
            if (column.index !== 0 && column.index !== 4) {
                expect(width).toBeGreaterThanOrEqual(minWidth);
            }
        });

        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(false);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering of data with 30 columns and 1000 rows where 5 of the columns have width set', () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(30);
        fix.componentInstance.generateData(1000);
        fix.detectChanges();

        expect(grid.width).toEqual('100%');
        expect(grid.columns[0].width).toEqual('200px');
        expect(grid.columns[3].width).toEqual('200px');
        expect(grid.columns[5].width).toEqual('200px');
        expect(grid.columns[10].width).toEqual('200px');
        expect(grid.columns[25].width).toEqual('200px');

        const actualGridWidth = grid.nativeElement.clientWidth;

        const expectedDefWidth = Math.max(Math.floor((actualGridWidth - 5 * 200) / 25), parseInt(MIN_COL_WIDTH, 10));
        expect(parseInt(grid.columnWidth, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[1].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[2].width, 10)).toEqual(expectedDefWidth);
        expect(parseInt(grid.columns[4].width, 10)).toEqual(expectedDefWidth);

        grid.columns.forEach((column) => {
            const width = parseInt(column.width, 10);
            const minWidth = parseInt(grid.columnWidth, 10);
            if (column.index !== 0 && column.index !== 3 && column.index !== 5 &&
                column.index !== 10 && column.index !== 25) {
                expect(width).toEqual(minWidth);
            }
        });

        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering of data with 30 columns and 1000 rows where 5 of the columns have width set and grid has width', () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        grid.width = '800px';
        fix.componentInstance.generateColumns(30);
        fix.componentInstance.generateData(1000);
        fix.detectChanges();

        expect(grid.width).toEqual('800px');
        expect(grid.columns[0].width).toEqual('200px');
        expect(grid.columns[3].width).toEqual('200px');
        expect(grid.columns[5].width).toEqual('200px');
        expect(grid.columns[10].width).toEqual('200px');
        expect(grid.columns[25].width).toEqual('200px');

        const actualGridWidth = grid.nativeElement.clientWidth;
        const expectedDefWidth = Math.max(Math.floor((actualGridWidth - 5 * 200) / 25), parseInt(MIN_COL_WIDTH, 10));
        expect(parseInt(grid.columnWidth, 10)).toEqual(expectedDefWidth);

        grid.columns.forEach((column) => {
            const width = parseInt(column.width, 10);
            const minWidth = parseInt(grid.columnWidth, 10);
            if (column.index !== 0 && column.index !== 3 && column.index !== 5 &&
                column.index !== 10 && column.index !== 25) {
                expect(width).toEqual(minWidth);
            }
        });
        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering of data with 150 columns and 20000 rows where 5 of the columns have width set', () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        fix.componentInstance.generateColumns(150);
        fix.componentInstance.generateData(20000);
        fix.detectChanges();

        expect(grid.width).toEqual('100%');
        expect(grid.columns[0].width).toEqual('500px');
        expect(grid.columns[3].width).toEqual('500px');
        expect(grid.columns[5].width).toEqual('500px');
        expect(grid.columns[10].width).toEqual('500px');
        expect(grid.columns[50].width).toEqual('500px');

        grid.columns.forEach((column) => {
            const width = parseInt(column.width, 10);
            const minWidth = parseInt(grid.columnWidth, 10);
            if (column.index !== 0 && column.index !== 3 && column.index !== 5 &&
                column.index !== 10 && column.index !== 50) {
                expect(width).toEqual(minWidth);
            }
        });

        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering of data with 150 columns and 20000 rows where 5 of the columns have width set and grid has width', () => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        grid.width = '800px';
        fix.componentInstance.generateColumns(150);
        fix.componentInstance.generateData(20000);
        fix.detectChanges();

        expect(grid.width).toEqual('800px');
        expect(grid.columns[0].width).toEqual('500px');
        expect(grid.columns[3].width).toEqual('500px');
        expect(grid.columns[5].width).toEqual('500px');
        expect(grid.columns[10].width).toEqual('500px');
        expect(grid.columns[50].width).toEqual('500px');

        grid.columns.forEach((column) => {
            const width = parseInt(column.width, 10);
            const minWidth = parseInt(grid.columnWidth, 10);
            if (column.index !== 0 && column.index !== 3 && column.index !== 5 &&
                column.index !== 10 && column.index !== 50) {
                expect(width).toEqual(minWidth);
            }
        });

        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('should render all records if height is explicitly set to null.', () => {
        const fix = TestBed.createComponent(IgGridNullHeightComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const recsCount = grid.data.length;

        // tbody should have height equal to all items * item height
        expect(grid.tbody.nativeElement.clientHeight).toEqual(recsCount * 50);
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('Test rendering when width and height are set in %', () => {
        const fix = TestBed.createComponent(IgxGridTestPercentWidthHeightComponent);
        const grid = fix.componentInstance.grid;

        fix.detectChanges();

        expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
        expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');
        expect(grid.rowList.length).toBeGreaterThan(0);
    });

    it('should render 10 records if height is unset and parent container\'s height is unset', () => {
        const fix = TestBed.createComponent(IgxGridWrappedInNoHeightContainerComponent);
        fix.detectChanges();
        const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
        expect(defaultHeight).not.toBeNull();
        expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
        expect(fix.componentInstance.grid.rowList.length).toBeGreaterThanOrEqual(10);
    });

    it('should render 10 records if height is 100% and parent container\'s height is unset', () => {
        const fix = TestBed.createComponent(IgxGridWrappedInNoHeightContainerComponent);
        fix.componentInstance.grid.height = '700px';
        fix.detectChanges();
        const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
        expect(defaultHeight).not.toBeNull();
        expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
        expect(fix.componentInstance.grid.rowList.length).toBeGreaterThanOrEqual(10);
    });

    it(`should render all records exactly if height is 100% and parent container\'s height is unset and
        there are fewer than 10 records in the data view`, () => {
        const fix = TestBed.createComponent(IgxGridWrappedInNoHeightContainerComponent);
        fix.componentInstance.grid.height = '100%';
        fix.componentInstance.data = fix.componentInstance.data.slice(0, 5);
        fix.detectChanges();
        const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
        expect(defaultHeight).not.toBeNull();
        expect(parseInt(defaultHeight, 10)).toBeGreaterThan(200);
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeFalsy();
        expect(fix.componentInstance.grid.rowList.length).toEqual(5);
    });

    it(`should render 10 records if height is 100% and parent container\'s height is unset and
        display density is changed`, () => {
        const fix = TestBed.createComponent(IgxGridWrappedInNoHeightContainerComponent);
        fix.componentInstance.grid.height = '100%';
        fix.componentInstance.data = fix.componentInstance.data.slice(0, 11);
        fix.componentInstance.density = DisplayDensity.compact;
        fix.detectChanges();
        const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
        const defaultHeightNum = parseInt(defaultHeight, 10);
        expect(defaultHeight).not.toBeNull();
        expect(defaultHeightNum).toBeGreaterThan(300);
        expect(defaultHeightNum).toBeLessThan(330);
        expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
        expect(fix.componentInstance.grid.rowList.length).toEqual(11);
    });

    it(`When edit a cell onto filtered data through grid method, the row should
        disapear and the new value should not persist onto the next row`, () => {
        const fix = TestBed.createComponent(IgGridTest5x5Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;
        const cols = fix.componentInstance.cols;
        const gridApi = fix.componentInstance.gridApi;
        const editValue = 777;

        grid.filter(cols[0].key, 1, IgxNumberFilteringOperand.instance().condition('equals'));
        fix.detectChanges();
        grid.getCellByColumn(0, cols[0].key).update(editValue);
        fix.detectChanges();
        const gridRows = fix.debugElement.queryAll(By.css('igx-grid-row'));
        const firstRowCells = gridRows[0].queryAll(By.css('igx-grid-cell'));
        const firstCellInputValue = firstRowCells[0].nativeElement.textContent.trim();
        expect(firstCellInputValue).toEqual('1');
    });

    it('should render correct columns if after scrolling right container size changes so that all columns become visible.', (done) => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        grid.width = '500px';
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(5);

        fix.detectChanges();
        expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
        const scrollbar = fix.componentInstance.grid2.parentVirtDir.getHorizontalScroll();
        scrollbar.scrollLeft = 10000;
        grid.width = '1500px';

        setTimeout(() => {
            fix.detectChanges();
            expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(false);
            const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
            expect(headers.length).toEqual(5);
            for (let i = 0; i < headers.length; i++) {
                expect(headers[i].context.column.field).toEqual(fix.componentInstance.grid2.columns[i].field);
            }
            done();
        }, 100);
    });

    it('Keyboard navigation - should allow pageup/pagedown navigation when the grid is focused', (done) => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        const pageDownKeyEvent = new KeyboardEvent('keydown', {
            code: 'PageDown',
            key: 'PageDown'
        });
        const pageUpKeyEvent = new KeyboardEvent('keydown', {
            code: 'PageUp',
            key: 'PageUp'
        });
        let currScrollTop;
        grid.width = '800px';
        grid.height = '500px';
        fix.componentInstance.generateColumns(25);
        fix.componentInstance.generateData(25);
        fix.detectChanges();
        grid.nativeElement.dispatchEvent(new Event('focus'));

        // testing the pagedown key
        grid.nativeElement.dispatchEvent(pageDownKeyEvent);
        grid.cdr.detectChanges();
        setTimeout(() => {
            currScrollTop = grid.verticalScrollContainer.getVerticalScroll().scrollTop;
            expect(currScrollTop).toEqual(grid.verticalScrollContainer.igxForContainerSize);

            // testing the pageup key
            grid.nativeElement.dispatchEvent(pageUpKeyEvent);
            grid.cdr.detectChanges();
            setTimeout(() => {
                currScrollTop = grid.parentVirtDir.getHorizontalScroll().scrollTop;
                expect(currScrollTop).toEqual(0);
                done();
            }, 100);
        }, 0);
    });

    it('should change displayDensity runtime correctly', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridDensityTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headerHight = fixture.debugElement.query(By.css('.igx-grid__thead')).query(By.css('.igx-grid__tr')).nativeElement;
        const rowHeight = fixture.debugElement.query(By.css('.igx-grid__tbody')).query(By.css('.igx-grid__tr')).nativeElement;
        const summaryItemHeigh = fixture.debugElement.query(By.css('.igx-grid__tfoot'))
        .query(By.css('.igx-grid-summary__item')).nativeElement;

        expect(grid.defaultRowHeight).toBe(50);
        expect(headerHight.offsetHeight).toBe(grid.defaultRowHeight);
        expect(rowHeight.offsetHeight).toBe(grid.defaultRowHeight);
        expect(summaryItemHeigh.offsetHeight).toBe(grid.defaultRowHeight);
        grid.displayDensity = 'cosy';
        fixture.detectChanges();
        tick(100);
        expect(grid.nativeElement.classList.contains('igx-grid--cosy')).toBe(true);
        expect(grid.defaultRowHeight).toBe(40);
        expect(headerHight.offsetHeight).toBe(grid.defaultRowHeight);
        expect(rowHeight.offsetHeight).toBe(grid.defaultRowHeight);
        expect(summaryItemHeigh.offsetHeight).toBe(grid.defaultRowHeight);
        grid.displayDensity = 'compact';
        fixture.detectChanges();
        tick(100);
        expect(grid.nativeElement.classList.contains('igx-grid--compact')).toBe(true);
        expect(grid.defaultRowHeight).toBe(32);
        expect(headerHight.offsetHeight).toBe(grid.defaultRowHeight);
        expect(rowHeight.offsetHeight).toBe(grid.defaultRowHeight);
        expect(summaryItemHeigh.offsetHeight).toBe(grid.defaultRowHeight);
    }));

    it('Should render empty message', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridWithEmptyDataComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const gridBody = fixture.debugElement.query(By.css('.igx-grid__tbody'));

        // Check for loaded rows in grid's container
        fixture.componentInstance.generateData(4, 30);
        fixture.detectChanges();
        tick(100);
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toBeGreaterThan(1000);

        // Check for empty filter grid message and body less than 100px
        const columns = fixture.componentInstance.grid.columns;
        grid.filter(columns[0].field, 546000, IgxNumberFilteringOperand.instance().condition('equals'));
        fixture.detectChanges();
        tick(100);
        expect(gridBody.nativeElement.innerText.substr(0,
            gridBody.nativeElement.innerText.length - 1)).toEqual(grid.emptyFilteredGridMessage);
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toBeLessThan(100);

        // Clear filter and check if grid's body height is restored based on all loaded rows
        grid.clearFilter(columns[0].field);
        fixture.detectChanges();
        tick(100);
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toBeGreaterThan(1000);

        // Clearing grid's data and check for empty grid message
        fixture.componentInstance.clearData();
        fixture.detectChanges();
        tick(100);
        expect(gridBody.nativeElement.innerText.substr(0,
            gridBody.nativeElement.innerText.length - 1)).toEqual(grid.emptyGridMessage);
    }));
});

@Component({
    template: `<div style="width: 800px; height: 600px;">
        <igx-grid #grid [data]="data" [autoGenerate]="autoGenerate">
            <igx-column *ngFor="let column of columns;" [field]="column.field" [header]="column.field" [width]="column.width">
            </igx-column>
        </igx-grid>
    </div>`
})
export class IgxGridTestComponent {
    public data: any[] = [{ index: 1, value: 1 }];
    public columns = [
        { field: 'index', header: 'index', dataType: 'number', width: null },
        { field: 'value', header: 'value', dataType: 'number', width: null }
    ];
    @ViewChild('grid') public grid: IgxGridComponent;

    public autoGenerate = false;

    public isHorizontalScrollbarVisible() {
        const scrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        if (scrollbar) {
            return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
        }

        return false;
    }

    public getVerticalScrollHeight() {
        const scrollbar = this.grid.verticalScrollContainer.getVerticalScroll();
        if (scrollbar) {
            return parseInt(scrollbar.style.height, 10);
        }

        return 0;
    }

    public isVerticalScrollbarVisible() {
        const scrollbar = this.grid.verticalScrollContainer.getVerticalScroll();
        if (scrollbar) {
            return scrollbar.offsetHeight < scrollbar.children[0].offsetHeight;
        }
        return false;
    }
}

@Component({
    template: `<igx-grid #grid2 style="margin-bottom: 20px;" [data]="data" (onColumnInit)="initColumns($event)">
                <igx-column *ngFor="let c of cols" [field]="c.field" [header]="c.header" [hasSummary]="true">
                </igx-column>
                </igx-grid>`
})
export class IgxGridTestDefaultWidthHeightComponent {
    public data = [];
    public cols = [];
    @ViewChild('grid2') public grid2: IgxGridComponent;

    initColumns(column) {
        switch (this.grid2.columnList.length) {
            case 5:
                if (column.index === 0 || column.index === 4) {
                    column.width = '200px';
                }
                break;
            case 30:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                    column.width = '200px';
                }
                break;
            case 150:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                    column.width = '500px';
                }
                break;
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                field: 'col' + i,
                header: 'col' + i
            });
        }
        return this.cols;
    }
    public generateData(rows) {
        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < this.cols.length; c++) {
                record[this.cols[c].field] = c * r;
            }
            this.data.push(record);
        }
        return this.data;
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid2.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" >
        <igx-column *ngFor="let col of cols"
            [field]="col.key"
            [header]="col.key"
            [dataType]="col.dataType"
            [editable]="col.editable"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest5x5Component {
    public cols;
    public data;

    @ViewChild('gridMinDefaultColWidth', { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(public gridApi: IgxGridAPIService, private _cdr: ChangeDetectorRef) {
        this.generateColumns(5);
        this.generateData(this.cols.length, 5);
    }

    init(column) {
        column.hasSummary = true;
    }
    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                c === 0 ? record[this.cols[c].key] = 1 : record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            if (i % 2 === 0) {
                this.cols.push({
                    key: 'col' + i,
                    dataType: 'number',
                    editable: true
                });
            } else {
                this.cols.push({
                    key: 'col' + i,
                    dataType: 'number'
                });
            }
        }
        return this.cols;
    }
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)">
        <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest10x30Component {
    public cols;
    public data;

    @ViewChild('gridMinDefaultColWidth', { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.generateColumns(10);
        this.generateData(this.cols.length, 30);
    }

    init(column) {
        column.hasSummary = true;
    }

    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                key: 'col' + i,
                dataType: 'number'
            });
        }
        return this.cols;
    }
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" [width]="'1500px'" >
        <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest30x1000Component {
    public cols;
    public data;

    @ViewChild('gridMinDefaultColWidth', { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.generateColumns(30);
        this.generateData(this.cols.length, 1000);
    }

    init(column) {
        column.hasSummary = true;
    }

    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                key: 'col' + i,
                dataType: 'number'
            });
        }
        return this.cols;
    }
    public isHorizonatScrollbarVisible() {
        const scrollbar = this.gridMinDefaultColWidth.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}
@Component({
    template: `
    <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" [width]="'1500px'" >
        <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
    </igx-grid>
    `
})
export class IgGridTest150x200Component {
    public cols;
    public data;

    @ViewChild('gridMinDefaultColWidth', { read: IgxGridComponent })
    public gridMinDefaultColWidth: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.generateColumns(150);
        this.generateData(this.cols.length, 200);
    }

    init(column) {
        column.hasSummary = true;
    }

    public generateData(columns, rows) {
        this.data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record[this.cols[c].key] = c * r;
            }
            this.data.push(record);
        }
    }
    public generateColumns(count) {
        this.cols = [];
        for (let i = 0; i < count; i++) {
            this.cols.push({
                key: 'col' + i,
                dataType: 'number'
            });
        }
        return this.cols;
    }
    public isHorizonatScrollbarVisible() {
        const scrollbar = this.gridMinDefaultColWidth.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}

@Component({
    template: `
    <div style='height: 200px; overflow: auto;'>
        <igx-grid #grid [data]="data" [height]='null' [autoGenerate]="true">
        </igx-grid>
    </div>
    `
})
export class IgGridNullHeightComponent {
    public cols;
    public data;

    @ViewChild('grid', { read: IgxGridComponent })
    public instance: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.data = this.generateData(5, 20);
    }
    public generateData(columns, rows) {
        const data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record['col' + c] = c * r;
            }
            data.push(record);
        }
        return data;
    }
}

@Component({
    template:
        `<div style="width: 800px; height: 600px;">
        <igx-grid #grid [data]="data" [autoGenerate]="true" height="50%" width="50%">
        </igx-grid>
    </div>`
})
export class IgxGridTestPercentWidthHeightComponent {
    public cols;
    public data;

    @ViewChild('grid', { read: IgxGridComponent })
    public grid: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
        this.data = this.generateData(3, 30);
    }
    public generateData(columns, rows) {
        const data = [];

        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record['col' + c] = c * r;
            }
            data.push(record);
        }
        return data;
    }
}

@Component({
    template:
        `
        <igx-grid #grid [data]="data" height="400px" width="600px">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [filterable]="true">
            </igx-column>
            <igx-column field="OrderDate" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
            </igx-column>
        </igx-grid>
        `
})
export class IgxGridDensityTestComponent {
    public data = [
        { ProductID: 1, ProductName: 'Chai', UnitsInStock: 2760, OrderDate: new Date('2005-03-21') },
        { ProductID: 2, ProductName: 'Aniseed Syrup', UnitsInStock: 198, OrderDate: new Date('2008-01-15') },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', UnitsInStock: 52, OrderDate: new Date('2010-11-20') },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', UnitsInStock: 0, OrderDate: new Date('2007-10-11') },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', UnitsInStock: 0, OrderDate: new Date('2001-07-27') },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', UnitsInStock: 1098, OrderDate: new Date('1990-05-17') },
        { ProductID: 7, ProductName: 'Queso Cabrales', UnitsInStock: 0, OrderDate: new Date('2005-03-03') },
        { ProductID: 8, ProductName: 'Tofu', UnitsInStock: 7898, OrderDate: new Date('2017-09-09') },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', UnitsInStock: 6998, OrderDate: new Date('2025-12-25') },
        { ProductID: 10, ProductName: 'Pie', UnitsInStock: 1000, OrderDate: new Date('2017-05-07') }
    ];

    @ViewChild('grid', { read: IgxGridComponent })
    public grid: IgxGridComponent;

}

@Component({
    template:
        `<igx-grid #grid [data]="data" [width]="'700px'">
            <igx-column [filterable]="true" [field]="'col0'" [header]="'col0'"
                [dataType]="'number'">
            </igx-column>
            <igx-column [filterable]="true" [field]="'col1'" [header]="'col1'"
                [dataType]="'number'">
            </igx-column>
            <igx-column [filterable]="true" [field]="'col2'" [header]="'col2'"
                [dataType]="'number'">
            </igx-column>
            <igx-column [filterable]="true" [field]="'col3'" [header]="'col3'"
                [dataType]="'number'">
            </igx-column>
        </igx-grid>
        `
})
export class IgxGridWithEmptyDataComponent {
    public data = [];

    @ViewChild('grid', { read: IgxGridComponent })
    public grid: IgxGridComponent;

    constructor(private _cdr: ChangeDetectorRef) {
    }

    public generateData(columns, rows) {
        for (let r = 0; r < rows; r++) {
            const record = {};
            for (let c = 0; c < columns; c++) {
                record['col' + c] = c * r;
            }
            this.data.push(record);
        }
    }

    public clearData() {
        this.data = [];
    }
}

@Component({
    template:
        `<div style="width: 800px;">
            <igx-grid #grid [data]="data" [displayDensity]="density"
                [autoGenerate]="true" [paging]="paging" [perPage]="pageSize" width="100%">
            </igx-grid>
        </div>`
})
export class IgxGridWrappedInNoHeightContainerComponent extends IgxGridTestComponent {
    public data = [
        { 'ID': 'ALFKI', 'CompanyName': 'Alfreds Futterkiste' },
        { 'ID': 'ANATR', 'CompanyName': 'Ana Trujillo Emparedados y helados' },
        { 'ID': 'ANTON', 'CompanyName': 'Antonio Moreno Taquería' },
        { 'ID': 'AROUT', 'CompanyName': 'Around the Horn' },
        { 'ID': 'BERGS', 'CompanyName': 'Berglunds snabbköp' },
        { 'ID': 'BLAUS', 'CompanyName': 'Blauer See Delikatessen' },
        { 'ID': 'BLONP', 'CompanyName': 'Blondesddsl père et fils' },
        { 'ID': 'BOLID', 'CompanyName': 'Bólido Comidas preparadas' },
        { 'ID': 'BONAP', 'CompanyName': 'Bon app\'' },
        { 'ID': 'BOTTM', 'CompanyName': 'Bottom-Dollar Markets' },
        { 'ID': 'BSBEV', 'CompanyName': 'B\'s Beverages' },
        { 'ID': 'CACTU', 'CompanyName': 'Cactus Comidas para llevar' },
        { 'ID': 'CENTC', 'CompanyName': 'Centro comercial Moctezuma' },
        { 'ID': 'CHOPS', 'CompanyName': 'Chop-suey Chinese' },
        { 'ID': 'COMMI', 'CompanyName': 'Comércio Mineiro' },
        { 'ID': 'CONSH', 'CompanyName': 'Consolidated Holdings' },
        { 'ID': 'DRACD', 'CompanyName': 'Drachenblut Delikatessen' },
        { 'ID': 'DUMON', 'CompanyName': 'Du monde entier' },
        { 'ID': 'EASTC', 'CompanyName': 'Eastern Connection' },
        { 'ID': 'ERNSH', 'CompanyName': 'Ernst Handel' },
        { 'ID': 'FAMIA', 'CompanyName': 'Familia Arquibaldo' },
        { 'ID': 'FISSA', 'CompanyName': 'FISSA Fabrica Inter' },
        { 'ID': 'FOLIG', 'CompanyName': 'Folies gourmandes' },
        { 'ID': 'FOLKO', 'CompanyName': 'Folk och fä HB' },
        { 'ID': 'FRANK', 'CompanyName': 'Frankenversand' },
        { 'ID': 'FRANR', 'CompanyName': 'France restauration' },
        { 'ID': 'FRANS', 'CompanyName': 'Franchi S.p.A.' }
    ];

    public height = null;
    public paging = false;
    public pageSize = 5;
    public density = DisplayDensity.comfortable;
}
