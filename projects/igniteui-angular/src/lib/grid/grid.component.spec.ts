import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { async, TestBed} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridAPIService } from './api.service';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxNumberFilteringOperand } from '../../public_api';

describe('IgxGrid - input properties', () => {
    const MIN_COL_WIDTH = '136px';
    const COLUMN_HEADER_CLASS = '.igx-grid__th';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridTestComponent, IgGridTest5x5Component, IgGridTest10x30Component,
                IgGridTest30x1000Component, IgGridTest150x200Component,
                IgxGridTestDefaultWidthHeightComponent,
                IgGridNullHeightComponent, IgxGridTestPercentWidthHeightComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it('height/width should be calculated depending on number of records', (done) => {
        const fix = TestBed.createComponent(IgxGridTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridBody = fix.debugElement.query(By.css('.igx-grid__tbody'));
        const gridHeader = fix.debugElement.query(By.css('.igx-grid__thead'));
        const gridFooter = fix.debugElement.query(By.css('.igx-grid__tfoot'));
        const gridScroll = fix.debugElement.query(By.css('.igx-grid__scroll'));
        let gridBodyHeight;
        let verticalScrollHeight;

        fix.whenStable().then(() => {
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
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            requestAnimationFrame(() => {
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBe(true);
                expect(fix.componentInstance.isHorizontalScrollbarVisible()).toBe(false);
                verticalScrollHeight = fix.componentInstance.getVerticalScrollHeight();
                grid.width = '200px';
            });
            return fix.whenStable();
        }).then(() => {
            setTimeout(() => {
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
                grid.width = '50%';
                return fix.whenStable();
            }, 100);
        }).then(() => {
            fix.detectChanges();
            setTimeout(() => {
                fix.detectChanges();
                expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
                expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');
                return fix.whenStable();
            }, 100);
        }).then(() => {
            fix.detectChanges();
            setTimeout(() => {
                fix.detectChanges();
                gridBodyHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10)
                - parseInt(window.getComputedStyle(gridScroll.nativeElement).height, 10);
                expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toEqual(gridBodyHeight);
                done();
             }, 500);
        });
    });

    it('should not have column misalignment when no vertical scrollbar is shown', () => {
        const fix = TestBed.createComponent(IgxGridTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridBody = fix.debugElement.query(By.css('.igx-grid__tbody'));
        const gridHeader = fix.debugElement.query(By.css('.igx-grid__thead'));

        expect(window.getComputedStyle(gridBody.children[0].nativeElement).width).toEqual(
            window.getComputedStyle(gridHeader.children[0].nativeElement).width
        );
    });

    it('col width should be >=136px - grid 5x5', () => {
        const fix = TestBed.createComponent(IgGridTest5x5Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[2].width).not.toBeLessThan(136);
        expect(grid.width).toMatch('100%');
    });

    it('col width should be >=136px - grid 10x30', () => {
        const fix = TestBed.createComponent(IgGridTest10x30Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;

        expect(grid.columns[0].width).not.toBeLessThan(136);
        expect(grid.columns[4].width).not.toBeLessThan(136);
        expect(grid.columns[6].width).not.toBeLessThan(136);
        expect(grid.width).toMatch('100%');
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
    });

    it('should render all records if height is explicitly set to null.', () => {
        const fix = TestBed.createComponent(IgGridNullHeightComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.instance;
        const recsCount = grid.data.length;

        // tbody should have height equal to all items * item height
        expect(grid.tbody.nativeElement.clientHeight).toEqual(recsCount * 50);
    });

    it('Test rendering when width and height are set in %', () => {
        const fix = TestBed.createComponent(IgxGridTestPercentWidthHeightComponent);
        const grid = fix.componentInstance.grid;

        fix.detectChanges();

        expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
        expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');
    });

    it(`When edit a cell onto filtered data through grid method, the row should
            disapear and the new value should not persist onto the next row`, async(() => {
        const fix = TestBed.createComponent(IgGridTest5x5Component);
        fix.detectChanges();

        const grid = fix.componentInstance.gridMinDefaultColWidth;
        const cols = fix.componentInstance.cols;
        const gridApi = fix.componentInstance.gridApi;
        const editValue = 777;

        fix.whenStable().then(() => {
            grid.filter(cols[0].key, 1, IgxNumberFilteringOperand.instance().condition('equals'));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            grid.updateCell(editValue, 0, cols[0].key);
            grid.markForCheck();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const gridRows = fix.debugElement.queryAll(By.css('igx-grid-row'));
            const firstRowCells = gridRows[0].queryAll(By.css('igx-grid-cell'));
            const firstCellInputValue = firstRowCells[0].nativeElement.textContent.trim();
            expect(firstCellInputValue).toEqual('1');
        });
    }));

    it('should render correct columns if after scrolling right container size changes so that all columns become visible.', (done) => {
        const fix = TestBed.createComponent(IgxGridTestDefaultWidthHeightComponent);
        const grid = fix.componentInstance.grid2;
        grid.width = '500px';
        fix.componentInstance.generateColumns(5);
        fix.componentInstance.generateData(5);

        fix.whenStable().then(() => {
            fix.detectChanges();
            // scrollbar should be visible
            expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(true);
            const scrollbar = fix.componentInstance.grid2.parentVirtDir.getHorizontalScroll();

            // scroll to the right
            scrollbar.scrollLeft = 10000;
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            // change width so that all columns are visible
            grid.width = '1500px';
            return fix.whenStable();
        }).then(() => {
            setTimeout(() => {
                expect(fix.componentInstance.isHorizonatScrollbarVisible()).toBe(false);

                // verify correct columns are rendered.
                const headers = fix.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));
                expect(headers.length).toEqual(5);
                for (let i = 0; i < headers.length; i ++) {
                    expect(headers[i].context.column.field).toEqual(fix.componentInstance.grid2.columns[i].field);
                }

                done();
            }, 100);
        });
    });
});

@Component({
    template: `<div style="width: 800px; height: 600px;">
    <igx-grid #grid [data]="data" [autoGenerate]="autoGenerate">
        <igx-column field="index" header="index" dataType="number"></igx-column>
        <igx-column field="value" header="value" dataType="number"></igx-column>
    </igx-grid></div>`
})
export class IgxGridTestComponent {
    public data = [{ index: 1, value: 1 }];
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
        return this.getVerticalScrollHeight() > 0;
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
                key: 'col' +  i,
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
                key: 'col' +  i,
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
