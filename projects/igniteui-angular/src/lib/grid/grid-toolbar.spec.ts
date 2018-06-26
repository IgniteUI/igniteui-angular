import { Component, DebugElement, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxCsvExporterOptions, IgxCsvExporterService, IgxExcelExporterOptions, IgxExcelExporterService } from '../services/index';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';

describe('IgxGrid - Grid Toolbar', () => {
    let fixture;
    let grid;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridToolbarTestPage1Component
            ],
            imports: [
                IgxGridModule.forRoot(),
                BrowserAnimationsModule
            ],
            providers: [
                IgxExcelExporterService,
                IgxCsvExporterService
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;
    });

    it('testing toolbar visibility', () => {
        expect(getToolbar()).toBe(null);

        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        expect(getToolbar()).not.toBe(null);

        grid.showToolbar = false;
        fixture.detectChanges();

        expect(getToolbar()).toBe(null);
    });

    it('testing toolbar title ', () => {
        const someTitle = 'Grid Toobar Title';

        grid.showToolbar = true;
        grid.toolbarTitle = someTitle;
        fixture.detectChanges();

        const gridToolbar = getToolbar();
        const gridToolbarTitle = gridToolbar.query(By.css('.igx-grid-toolbar__title')).nativeElement;

        expect(gridToolbarTitle.innerText).toBe(someTitle);

        grid.toolbarTitle = '';
        fixture.detectChanges();

        expect(getToolbar()).toBe(null);
    });

    it('testing main export button visibility', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = 'Grid Toobar Title';
        fixture.detectChanges();

        const gridToolbar = getToolbar();

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

        const gridToolbar = getToolbar();

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

        expect(getExportButton()).toBe(null);

        grid.exportExcel = true;
        fixture.detectChanges();

        expect(getExportButton()).not.toBe(null);

        grid.exportExcel = false;
        fixture.detectChanges();

        expect(getExportButton()).toBe(null);
    });

    it('testing export to Excel button text', () => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        getExportButton().nativeElement.click();

        const exportDropDown = getOverlay();
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

        expect(getExportButton()).not.toBe(null);
        getExportButton().nativeElement.click();

        expect(getOverlay()).not.toBe(null);

        fixture.detectChanges();

        const exportButton = getOverlay().querySelector('li#btnExportCsv');
        expect(exportButton).not.toBe(null);

        grid.exportCsv = false;
        fixture.detectChanges();

        expect(getExportButton()).toBe(null);
    });

    it('testing export to CSV button text', () => {
        grid.showToolbar = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        getExportButton().nativeElement.click();

        const exportButton = getOverlay().querySelector('li#btnExportCsv');
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

        getExportButton().nativeElement.click();

        expect(getOverlay()).not.toBe(null);
        expect(getExportOptions().length).toBe(2);

        getExportButton().nativeElement.click();

        // expect(getOverlay()).toBe(null);
    });

    it('testing excel export starting event (cancel)', (done) => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        getExportButton().nativeElement.click();
        const exportExcelButton = getOverlay().querySelector('li#btnExportExcel');

        grid.onToolbarExporting.subscribe((args) => {
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

        getExportButton().nativeElement.click();
        const exportExcelButton = getOverlay().querySelector('li#btnExportExcel');

        grid.onToolbarExporting.subscribe((args) => {
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

        getExportButton().nativeElement.click();
        const exportCsvButton = getOverlay().querySelector('li#btnExportCsv');

        grid.onToolbarExporting.subscribe((args) => {
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

        getExportButton().nativeElement.click();
        const exportCsvButton = getOverlay().querySelector('li#btnExportCsv');

        grid.onToolbarExporting.subscribe((args) => {
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

        const button = fixture.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnChooser');
        expect(button).toBeUndefined();
    });

    it('shows Column Hiding button with default content when columnHiding=true.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();
        expect(grid.toolbar.columnHidingUI).toBeDefined();

        const button = fixture.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');
        expect(button).toBeDefined();
        const btnText = button.nativeElement.innerText.toLowerCase();
        expect(btnText.includes('0') && btnText.includes('visibility') && !btnText.includes('visibility_off')).toBe(true);
    });

    it('toggleColumnHidingUI() method opens and closes the ColumnHiding dropdown.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        getColumnHidingButton().nativeElement.click();

        const dropDownDiv = getOverlay();
        expect(dropDownDiv).not.toBe(null);
        expect(dropDownDiv.querySelector('igx-column-hiding')).not.toBe(null);

        getColumnHidingButton().nativeElement.click();

    });

    function getToolbar() {
        return fixture.debugElement.query(By.css('igx-grid-toolbar'));
    }

    function getOverlay() {
        const div = fixture.debugElement.nativeElement.parentElement.lastChild;
        return div.classList.contains('igx-overlay') ? div : null;
    }

    function getColumnHidingButton() {
        return getToolbar().queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');
    }

    function getExportButton() {
        const div = getToolbar().query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        return (div) ? div.query(By.css('button')) : null;
    }

    function getExportOptions() {
        const div = getOverlay();
        return (div) ? div.querySelectorAll('li') : null;
    }
});

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
