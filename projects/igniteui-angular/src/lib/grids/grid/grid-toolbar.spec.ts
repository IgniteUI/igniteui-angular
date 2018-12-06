import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, async, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { first } from 'rxjs/operators';
import { IgxCsvExporterOptions, IgxCsvExporterService, IgxExcelExporterOptions, IgxExcelExporterService } from '../../services/index';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { DisplayDensity } from '../../core/displayDensity';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxGrid - Grid Toolbar', () => {
    configureTestSuite();
    let fixture;
    let grid;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridToolbarTestPage1Component
            ],
            imports: [
                IgxGridModule.forRoot(),
                NoopAnimationsModule
            ],
            providers: [
                IgxExcelExporterService,
                IgxCsvExporterService
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;
    });

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('testing toolbar visibility', () => {
        expect(getToolbar(fixture)).toBe(null);

        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        expect(getToolbar(fixture)).not.toBe(null);

        grid.showToolbar = false;
        fixture.detectChanges();

        expect(getToolbar(fixture)).toBe(null);
    });

    it('testing toolbar title ', () => {
        const someTitle = 'Grid Toobar Title';

        grid.showToolbar = true;
        grid.toolbarTitle = someTitle;
        fixture.detectChanges();

        const gridToolbar = getToolbar(fixture);
        const gridToolbarTitle = gridToolbar.query(By.css('.igx-grid-toolbar__title')).nativeElement;

        expect(gridToolbarTitle.innerText).toBe(someTitle);

        grid.toolbarTitle = '';
        fixture.detectChanges();

        expect(getToolbar(fixture)).not.toBe(null);

        grid.showToolbar = false;
        fixture.detectChanges();

        expect(getToolbar(fixture)).toBe(null);
    });

    it('testing main export button visibility', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        const gridToolbar = getToolbar(fixture);

        let exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).toBe(null);

        grid.exportExcel = true;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).not.toBe(null);

        grid.exportExcel = false;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).toBe(null);

        grid.exportCsv = true;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).not.toBe(null);

        grid.exportCsv = false;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).toBe(null);
    });

    it('testing main export button text', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        const gridToolbar = getToolbar(fixture);

        let exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport span span'));
        expect(exportButton).toBe(null);

        grid.exportText = 'NEWVALUE';
        grid.exportExcel = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        expect(grid.exportText).toBe('NEWVALUE');
        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport span span'));
        expect(exportButton).not.toBe(null);
        expect(exportButton.nativeElement.innerText).toBe('NEWVALUE');
    });

    it('testing export to Excel button visibility', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        expect(getExportButton(fixture)).toBe(null);

        grid.exportExcel = true;
        fixture.detectChanges();

        expect(getExportButton(fixture)).not.toBe(null);

        grid.exportExcel = false;
        fixture.detectChanges();

        expect(getExportButton(fixture)).toBe(null);
    });

    it('testing export to Excel button text', () => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        getExportButton(fixture).nativeElement.click();

        const exportDropDown = getOverlay(fixture);
        expect(exportDropDown).not.toBe(null);

        const exportButton = exportDropDown.querySelector('li#btnExportExcel');
        expect(exportButton.innerText).toBe('');

        grid.exportExcelText = 'NEWVALUE';
        fixture.detectChanges();

        expect(grid.exportExcelText).toBe('NEWVALUE');
        expect(exportButton.innerText).toBe('NEWVALUE');
    });

    it('testing export to CSV button visibility', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        grid.exportCsv = true;
        fixture.detectChanges();

        expect(getExportButton(fixture)).not.toBe(null);
        getExportButton(fixture).nativeElement.click();

        expect(getOverlay(fixture)).not.toBe(null);

        fixture.detectChanges();

        const exportButton = getOverlay(fixture).querySelector('li#btnExportCsv');
        expect(exportButton).not.toBe(null);

        grid.exportCsv = false;
        fixture.detectChanges();

        expect(getExportButton(fixture)).toBe(null);
    });

    it('testing export to CSV button text', () => {
        grid.showToolbar = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        getExportButton(fixture).nativeElement.click();

        const exportButton = getOverlay(fixture).querySelector('li#btnExportCsv');
        expect(exportButton.innerText).toBe('');

        grid.exportCsvText = 'NEWVALUE';
        fixture.detectChanges();

        expect(grid.exportCsvText).toBe('NEWVALUE');
        expect(exportButton.innerText).toBe('NEWVALUE');
    });

    it('testing export dropdown visibility when pressing the export button', () => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        getExportButton(fixture).nativeElement.click();

        expect(getOverlay(fixture)).not.toBe(null);
        expect(getExportOptions(fixture).length).toBe(2);

        getExportButton(fixture).nativeElement.click();

        // expect(getOverlay()).toBe(null);
    });

    it('testing excel export starting event (cancel)', (done) => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        getExportButton(fixture).nativeElement.click();
        const exportExcelButton = getOverlay(fixture).querySelector('li#btnExportExcel');

        grid.onToolbarExporting.pipe(first()).subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.options).not.toBe(null);
            expect(args.options instanceof IgxExcelExporterOptions).toBeTruthy();
            expect(args.cancel).toBe(false);
            args.cancel = true;
            done();
        });

        exportExcelButton.click();
    });

    it('testing excel export starting event (non-cancel)', (done) => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        getExportButton(fixture).nativeElement.click();
        const exportExcelButton = getOverlay(fixture).querySelector('li#btnExportExcel');

        grid.onToolbarExporting.pipe(first()).subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.options).not.toBe(null);
            expect(args.options instanceof IgxExcelExporterOptions).toBeTruthy();
            expect(args.cancel).toBe(false);

            // Spy the 'export' and 'exportData' methods so the files are not really created
            spyOn(args.exporter, 'export');
            spyOn(args.exporter, 'exportData');

            done();
        });

        exportExcelButton.click();
    });

    it('testing csv export starting event (cancel)', (done) => {
        grid.showToolbar = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        getExportButton(fixture).nativeElement.click();
        const exportCsvButton = getOverlay(fixture).querySelector('li#btnExportCsv');

        grid.onToolbarExporting.pipe(first()).subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.options).not.toBe(null);
            expect(args.options instanceof IgxCsvExporterOptions).toBeTruthy();
            expect(args.cancel).toBe(false);
            args.cancel = true;
            done();
        });

        exportCsvButton.click();
    });

    it('testing csv export starting event (non-cancel)', (done) => {
        grid.showToolbar = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        getExportButton(fixture).nativeElement.click();
        const exportCsvButton = getOverlay(fixture).querySelector('li#btnExportCsv');

        grid.onToolbarExporting.pipe(first()).subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.options).not.toBe(null);
            expect(args.options instanceof IgxCsvExporterOptions).toBeTruthy();
            expect(args.cancel).toBe(false);

            // Spy the 'export' and 'exportData' methods so the files are not really created
            spyOn(args.exporter, 'export');
            spyOn(args.exporter, 'exportData');

            done();
        });

        exportCsvButton.click();
    });

    it('does not show Column Hiding button by default.', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();
        expect(grid.toolbar.columnHidingUI).toBeUndefined();

        const button = getColumnHidingButton(fixture);
        expect(button).toBeUndefined();
    });

    it('shows Column Hiding button with default content when columnHiding=true.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();
        expect(grid.toolbar.columnHidingUI).toBeDefined();

        const button = getColumnHidingButton(fixture);
        expect(button).toBeDefined();
        const btnText = button.nativeElement.innerText.toLowerCase();
        expect(btnText.includes('0') && btnText.includes('visibility') && !btnText.includes('visibility_off')).toBe(true);
    });

    it('shows the proper icon depending whether there is a hidden column or not.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        grid.columns[0].hidden = true;
        fixture.detectChanges();

        const button = getColumnHidingButton(fixture);
        expect(button).toBeDefined();
        let btnText = button.nativeElement.innerText.toLowerCase();
        expect(btnText.includes('1') && btnText.includes('visibility_off')).toBe(true);

        grid.columns[0].hidden = false;
        fixture.detectChanges();
        btnText = button.nativeElement.innerText.toLowerCase();
        expect(btnText.includes('0') && btnText.includes('visibility') && !btnText.includes('visibility_off')).toBe(true);

    });

    it('toggleColumnHidingUI() method opens and closes the ColumnHiding dropdown.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        getColumnHidingButton(fixture).nativeElement.click();

        const dropDownDiv = getOverlay(fixture);
        expect(dropDownDiv).not.toBe(null);
        expect(dropDownDiv.querySelector('igx-column-hiding')).not.toBe(null);

        getColumnHidingButton(fixture).nativeElement.click();

    });

    it('does not show Column Pinning button by default.', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();
        expect(grid.toolbar.columnPinningUI).toBeUndefined();
        expect(getColumnPinningButton(fixture)).toBeUndefined();

        grid.columnPinning = true;
        fixture.detectChanges();

        expect(grid.toolbar.columnPinningUI).toBeDefined();
        expect(getColumnPinningButton(fixture)).toBeDefined();
    });

    it('shows Column Pinning button with default content when columnPinning=true.', () => {
        grid.showToolbar = true;
        grid.columnPinning = true;
        fixture.detectChanges();
        expect(grid.toolbar.columnPinningUI).toBeDefined();

        const button = getColumnPinningButton(fixture);
        expect(button).toBeDefined();
        const btnText = button.nativeElement.innerText.toLowerCase();
        expect(btnText.includes('0') && btnText.includes('lock_open')).toBe(true);
    });

    it('toggleColumnPinningUI() method opens and closes the ColumnPinning dropdown.', () => {
        grid.showToolbar = true;
        grid.columnPinning = true;
        fixture.detectChanges();

        getColumnPinningButton(fixture).nativeElement.click();

        const dropDownDiv = getOverlay(fixture);
        expect(dropDownDiv).not.toBe(null);
        expect(dropDownDiv.querySelector('igx-column-pinning')).not.toBe(null);

        getColumnPinningButton(fixture).nativeElement.click();
    });

    it('display density is properly applied.', fakeAsync(() => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        const toolbar = getToolbar(fixture).nativeElement;
        expect(grid.toolbar.isComfortable()).toBe(true);
        expect(toolbar.classList[0]).toBe('igx-grid-toolbar');
        expect(parseFloat(toolbar.offsetHeight) > 55).toBe(true);

        grid.displayDensity = DisplayDensity.compact;
        fixture.detectChanges();
        tick(100);

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.compact);
        expect(toolbar.classList[0]).toBe('igx-grid-toolbar--compact');
        expect(parseFloat(toolbar.offsetHeight) < 50).toBe(true);

        grid.displayDensity = DisplayDensity.cosy;
        fixture.detectChanges();
        tick(100);

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.cosy);
        expect(toolbar.classList[0]).toBe('igx-grid-toolbar--cosy');
        expect(parseFloat(toolbar.offsetHeight) < 50).toBe(true);
    }));

    it('display density is properly applied through the grid.', fakeAsync(() => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        const toolbar = getToolbar(fixture).nativeElement;
        expect(grid.toolbar.isComfortable()).toBe(true);
        expect(toolbar.classList[0]).toBe('igx-grid-toolbar');

        grid.displayDensity = DisplayDensity.compact;
        fixture.detectChanges();
        tick(100);

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.compact);
        expect(toolbar.classList[0]).toBe('igx-grid-toolbar--compact');

        grid.displayDensity = DisplayDensity.cosy;
        fixture.detectChanges();
        tick(100);

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.cosy);
        expect(toolbar.classList[0]).toBe('igx-grid-toolbar--cosy');

        grid.displayDensity = DisplayDensity.comfortable;
        fixture.detectChanges();
        tick(100);

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.comfortable);
    }));

    it('test \'filterColumnsPrompt\' property.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();
        const toolbar = grid.toolbar;
        expect(toolbar.filterColumnsPrompt).toBe('Filter columns list ...');

        toolbar.toggleColumnHidingUI();
        expect(toolbar.columnHidingUI.filterColumnsPrompt).toBe('Filter columns list ...');

        toolbar.filterColumnsPrompt = null;
        fixture.detectChanges();
        expect(toolbar.filterColumnsPrompt).toBe(null);
        expect(toolbar.columnHidingUI.filterColumnsPrompt).toBe('');

        toolbar.filterColumnsPrompt = 'Test';
        toolbar.cdr.detectChanges();
        fixture.detectChanges();
        expect(toolbar.filterColumnsPrompt).toBe('Test');
        expect(toolbar.columnHidingUI.filterColumnsPrompt).toBe('Test');

        toolbar.toggleColumnHidingUI();
    });

    it('test hiding and pinning dropdowns height.', fakeAsync(() => {
        grid.height = '300px';
        tick(100);
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        expect(parseInt(grid.toolbar.columnHidingUI.columnsAreaMaxHeight, 10)).toBe(134);

        grid.height = '600px';
        tick(100);
        fixture.detectChanges();

        expect(grid.toolbar.columnHidingUI.columnsAreaMaxHeight).toBe(grid.calcHeight * 0.7 + 'px');
    }));

});

describe('IgxGrid - Grid Toolbar Custom Content', () => {
    configureTestSuite();
    let fixture;
    let grid;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridToolbarTestPage1Component,
                GridToolbarTestPage2Component
            ],
            imports: [
                IgxGridModule.forRoot(),
                NoopAnimationsModule
            ],
            providers: [
                IgxExcelExporterService,
                IgxCsvExporterService
            ]
        })
        .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('should not have content container when no template is provided', () => {
        fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;

        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        const customContainer = getToolbar(fixture).query(By.css('.igx-grid-toolbar__custom-content'));
        expect(customContainer).toBe(null);
    });

    it('should have the content container when the template is provided', () => {
        fixture = TestBed.createComponent(GridToolbarTestPage2Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;

        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        const customContainer = getToolbar(fixture).query(By.css('.igx-grid-toolbar__custom-content'));
        expect(customContainer).not.toBe(null);
    });

});

function getToolbar(fixture) {
    return fixture.debugElement.query(By.css('igx-grid-toolbar'));
}

function getOverlay(fixture) {
    const div = fixture.debugElement.query(By.css('div.igx-grid__outlet'));
    return div.nativeElement;
}

function getColumnHidingButton(fixture) {
    return getToolbar(fixture).queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');
}

function getColumnPinningButton(fixture) {
    return getToolbar(fixture).queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnPinning');
}

function getExportButton(fixture) {
    const div = getToolbar(fixture).query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
    return (div) ? div.query(By.css('button')) : null;
}

function getExportOptions(fixture) {
    const div = getOverlay(fixture);
    return (div) ? div.querySelectorAll('li') : null;
}

@Component({
    template: `
        <igx-grid #grid1 [data]='data' [autoGenerate]='true'>
        </igx-grid>
    `
})
export class GridToolbarTestPage1Component {

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

}

@Component({
    template: `
        <igx-grid #grid1 [data]='data' [autoGenerate]='true'>
            <ng-template igxToolbarCustomContent>
                <button igxButton="flat" igxRipple igxRippleCentered="true">
                    <igx-icon fontSet="material" name="clear"></igx-icon>
                    Clear Filter
                </button>
                <button igxButton="flat" igxRipple igxRippleCentered="true">
                    <igx-icon fontSet="material" name="clear"></igx-icon>
                    Clear Sort
                </button>
            </ng-template>
        </igx-grid>
    `
})
export class GridToolbarTestPage2Component {

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

}
