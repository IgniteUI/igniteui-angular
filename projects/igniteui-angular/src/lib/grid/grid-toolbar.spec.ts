import { Component, DebugElement, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxCsvExporterService, IgxExcelExporterService } from '../services/index';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';

describe('IgxGrid - Grid Toolbar', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridToolbarTestPage1Component
            ],
            imports: [
                IgxGridModule.forRoot(),
                BrowserAnimationsModule,
                NoopAnimationsModule
            ],
            providers: [
                IgxExcelExporterService,
                IgxCsvExporterService
            ]
        })
        .compileComponents();
    });

    it('testing toolbar visibility', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        let gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        expect(gridToolbar).toBe(null);

        testPage.grid1.showToolbar = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        expect(gridToolbar).not.toBe(null);

        testPage.grid1.showToolbar = false;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        expect(gridToolbar).toBe(null);
    });

    it('testing toolbar title ', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        const someTitle = 'Grid Toobar Title';

        testPage.grid1.showToolbar = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        let gridToolbarTitle = gridToolbar.query(By.css('.igx-grid-toolbar__title'));

        expect(gridToolbarTitle.nativeElement.innerText).toBe('');

        testPage.grid1.toolbarTitle = someTitle;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        gridToolbarTitle = gridToolbar.query(By.css('.igx-grid-toolbar__title'));
        expect(gridToolbarTitle.nativeElement.innerText).toBe(someTitle);

        testPage.grid1.toolbarTitle = '';
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        gridToolbarTitle = gridToolbar.query(By.css('.igx-grid-toolbar__title'));
        expect(gridToolbarTitle.nativeElement.innerText).toBe('');
    });

    it('testing main export button visibility', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));

        let exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).toBe(null);

        testPage.grid1.exportExcel = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).not.toBe(null);

        testPage.grid1.exportExcel = false;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).toBe(null);

        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).not.toBe(null);

        testPage.grid1.exportCsv = false;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        expect(exportButton).toBe(null);
    });

    it('testing main export button text', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));

        let exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport span span'));
        expect(exportButton).toBe(null);

        testPage.grid1.exportText = 'NEWVALUE';
        testPage.grid1.exportExcel = true;
        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        expect(testPage.grid1.exportText).toBe('NEWVALUE');
        exportButton = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport span span'));
        expect(exportButton).not.toBe(null);
        expect(exportButton.nativeElement.innerText).toBe('NEWVALUE');
    });

    it('testing export to Excel button visibility', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));

        let exportButton = gridToolbar.query(By.css('li#btnExportExcel'));
        expect(exportButton).toBe(null);

        testPage.grid1.exportExcel = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('li#btnExportExcel'));
        expect(exportButton).not.toBe(null);

        testPage.grid1.exportExcel = false;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('li#btnExportExcel'));
        expect(exportButton).toBe(null);
    });

    it('testing export to Excel button text', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.exportExcel = true;
        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));

        let exportButton = gridToolbar.query(By.css('li#btnExportExcel'));
        expect(exportButton.nativeElement.innerText).toBe('');

        testPage.grid1.exportExcelText = 'NEWVALUE';
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        expect(testPage.grid1.exportExcelText).toBe('NEWVALUE');
        exportButton = gridToolbar.query(By.css('li#btnExportExcel'));
        expect(exportButton.nativeElement.innerText).toBe('NEWVALUE');
    });

    it('testing export to CSV button visibility', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));

        let exportButton = gridToolbar.query(By.css('li#btnExportCsv'));
        expect(exportButton).toBe(null);

        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('li#btnExportCsv'));
        expect(exportButton).not.toBe(null);

        testPage.grid1.exportCsv = false;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css('li#btnExportCsv'));
        expect(exportButton).toBe(null);
    });

    it('testing export to CSV button text', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.exportExcel = true;
        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));

        let exportButton = gridToolbar.query(By.css('li#btnExportCsv'));
        expect(exportButton.nativeElement.innerText).toBe('');

        testPage.grid1.exportCsvText = 'NEWVALUE';
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        expect(testPage.grid1.exportCsvText).toBe('NEWVALUE');
        exportButton = gridToolbar.query(By.css('li#btnExportCsv'));
        expect(exportButton.nativeElement.innerText).toBe('NEWVALUE');
    });

    it('testing export dropdown visibility when pressing the export button', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.exportExcel = true;
        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        const dropDown = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        const exportButton = dropDown.query(By.css('button'));

        let toggleDiv = dropDown.query(By.css('div.igx-toggle--hidden'));
        expect(toggleDiv).not.toBe(null);

        exportButton.nativeElement.click();
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        toggleDiv = dropDown.query(By.css('div.igx-toggle'));
        expect(toggleDiv).not.toBe(null);

        exportButton.nativeElement.click();
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        toggleDiv = dropDown.query(By.css('div.igx-toggle--hidden'));
        expect(toggleDiv).not.toBe(null);
    });

    it('testing excel export starting event (cancel)', (done) => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.exportExcel = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        const dropDown = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        const exportExcelButton = dropDown.query(By.css('li#btnExportExcel'));

        testPage.grid1.onToolbarExporting.subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.type).toBe('excel');
            expect(args.cancel).toBe(false);
            args.cancel = true;
            done();
        });

        exportExcelButton.nativeElement.click();
    });

    it('testing excel export starting event (non-cancel)', (done) => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.exportExcel = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        const dropDown = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        const exportExcelButton = dropDown.query(By.css('li#btnExportExcel'));

        testPage.grid1.onToolbarExporting.subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.type).toBe('excel');
            expect(args.cancel).toBe(false);

            // Spy the 'export' and 'exportData' methods so the files are not really created
            spyOn(args.exporter, 'export');
            spyOn(args.exporter, 'exportData');

            done();
        });

        exportExcelButton.nativeElement.click();
    });

    it('testing csv export starting event (cancel)', (done) => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        const dropDown = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        const exportCsvButton = dropDown.query(By.css('li#btnExportCsv'));

        testPage.grid1.onToolbarExporting.subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.type).toBe('csv');
            expect(args.cancel).toBe(false);
            args.cancel = true;
            done();
        });

        exportCsvButton.nativeElement.click();
    });

    it('testing csv export starting event (non-cancel)', (done) => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        const testPage = fixture.componentInstance;

        testPage.grid1.showToolbar = true;
        testPage.grid1.exportCsv = true;
        testPage.grid1.cdr.detectChanges();
        fixture.detectChanges();

        const grid = fixture.debugElement.query(By.css('igx-grid'));
        const gridToolbar = grid.query(By.css('igx-grid-toolbar'));
        const dropDown = gridToolbar.query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        const exportCsvButton = dropDown.query(By.css('li#btnExportCsv'));

        testPage.grid1.onToolbarExporting.subscribe((args) => {
            expect(args.grid).not.toBe(null);
            expect(args.exporter).not.toBe(null);
            expect(args.type).toBe('csv');
            expect(args.cancel).toBe(false);

            // Spy the 'export' and 'exportData' methods so the files are not really created
            spyOn(args.exporter, 'export');
            spyOn(args.exporter, 'exportData');

            done();
        });

        exportCsvButton.nativeElement.click();
    });

    it('does not show Column Hiding button by default.', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        const grid = fixture.componentInstance.grid1;
        grid.showToolbar = true;
        fixture.detectChanges();
        expect(grid.toolbar.columnHidingUI).toBeUndefined();

        const button = fixture.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnChooser');
        expect(button).toBeUndefined();
    });

    it('shows Column Hiding button with default content when columnHiding=true.', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        const grid = fixture.componentInstance.grid1;
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();
        expect(grid.toolbar.columnHidingUI).toBeDefined();

        const button = fixture.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnChooser');
        expect(button).toBeDefined();
        const btnText = button.nativeElement.innerText;
        expect(btnText.includes('0') && btnText.includes('VISIBILITY') && !btnText.includes('VISIBILITY_OFF')).toBe(true);
    });

    it('toggleColumnHidingUI() method opens and closes the ColumnHiding dropdown.', () => {
        const fix = TestBed.createComponent(GridToolbarTestPage1Component);
        const grid = fix.componentInstance.grid1;
        grid.showToolbar = true;
        grid.columnHiding = true;
        fix.detectChanges();

        const dropdown = fix.debugElement.query(By.css('igx-drop-down'));
        const dropDownDiv = dropdown.query(By.css('div.igx-drop-down__list'));

        expect(JSON.stringify(dropDownDiv.classes)).toBe('{"igx-toggle--hidden":true,"igx-toggle":false}');
        expect(dropDownDiv.query(By.css('igx-column-hiding'))).toBe(null);

        const button = fix.debugElement.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnChooser').nativeElement;
        grid.toolbar.toggleColumnHidingUI();
        // button.click();

        expect(JSON.stringify(dropDownDiv.classes)).toBe('{"igx-toggle--hidden":false,"igx-toggle":true}');
        expect(dropDownDiv.query(By.css('igx-column-hiding'))).not.toBe(null);
        grid.toolbar.columnHidingDropdown.close();
        // grid.toolbar.toggleColumnHidingUI();
        // expect(dropDownDiv.query(By.css('igx-column-hiding'))).toBe(null);
        // expect(JSON.stringify(dropDownDiv.classes)).toBe('{"igx-toggle--hidden":true,"igx-toggle":false}');
    });
});

@Component({
    template: `
        <igx-grid #grid1 [data]='data' [autoGenerate]='true' width='400px' height='200px'>
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
