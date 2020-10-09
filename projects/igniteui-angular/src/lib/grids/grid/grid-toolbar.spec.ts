import { Component, DebugElement, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, async, tick, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { first } from 'rxjs/operators';
import { IgxCsvExporterOptions, IgxCsvExporterService, IgxExcelExporterOptions, IgxExcelExporterService, CsvFileTypes
    } from '../../services/public_api';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './public_api';
import { DisplayDensity } from '../../core/displayDensity';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions } from '../../test-utils/grid-functions.spec';

const CSS_CLASS_GRID_TOOLBAR = 'igx-grid-toolbar';
const CSS_CLASS_GRID_TOOLBAR_COMPACT = `${CSS_CLASS_GRID_TOOLBAR}--compact`;
const CSS_CLASS_GRID_TOOLBAR_COSY = `${CSS_CLASS_GRID_TOOLBAR}--cosy`;
const CSS_CLASS_EXPORT_BTN = `.${CSS_CLASS_GRID_TOOLBAR}__dropdown#btnExport`;
const CSS_CLASS_CUSTOM_CONTENT = `.${CSS_CLASS_GRID_TOOLBAR}__custom-content`;
const CSS_CLASS_TITLE = `.${CSS_CLASS_GRID_TOOLBAR}__title`;
const TOOLBAR_TITLE = 'Grid Toolbar Title';

describe('IgxGrid - Grid Toolbar #grid - ', () => {
    configureTestSuite();
    let grid: IgxGridComponent;

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridToolbarTestPage1Component,
                GridToolbarTestPage2Component
            ],
            imports: [
                IgxGridModule,
                NoopAnimationsModule
            ],
            providers: [
                IgxExcelExporterService,
                IgxCsvExporterService
            ]
        })
        .compileComponents();
    }));

  describe('Basic Tests - ', () => {
    let fixture: ComponentFixture<GridToolbarTestPage1Component>;

    beforeEach(fakeAsync(/** height/width setter rAF */() => {
        fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;
    }));


    it('testing toolbar visibility', () => {
        expect(GridFunctions.getToolbar(fixture)).toBe(null);

        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();

        expect(GridFunctions.getToolbar(fixture)).not.toBe(null);

        grid.showToolbar = false;
        fixture.detectChanges();

        expect(GridFunctions.getToolbar(fixture)).toBe(null);
    });

    it('testing toolbar title ', () => {
        const someTitle = TOOLBAR_TITLE;

        grid.showToolbar = true;
        grid.toolbarTitle = someTitle;
        fixture.detectChanges();

        const gridToolbar = GridFunctions.getToolbar(fixture);
        const gridToolbarTitle = gridToolbar.query(By.css(CSS_CLASS_TITLE)).nativeElement;

        expect(gridToolbarTitle.innerText).toBe(someTitle);

        grid.toolbarTitle = '';
        fixture.detectChanges();

        expect(GridFunctions.getToolbar(fixture)).not.toBe(null);

        grid.showToolbar = false;
        fixture.detectChanges();

        expect(GridFunctions.getToolbar(fixture)).toBe(null);
    });

    it('testing main export button visibility', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();

        const gridToolbar = GridFunctions.getToolbar(fixture);

        let exportButton = gridToolbar.query(By.css(CSS_CLASS_EXPORT_BTN));
        expect(exportButton).toBe(null);

        grid.exportExcel = true;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css(CSS_CLASS_EXPORT_BTN));
        expect(exportButton).not.toBe(null);

        grid.exportExcel = false;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css(CSS_CLASS_EXPORT_BTN));
        expect(exportButton).toBe(null);

        grid.exportCsv = true;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css(CSS_CLASS_EXPORT_BTN));
        expect(exportButton).not.toBe(null);

        grid.exportCsv = false;
        fixture.detectChanges();

        exportButton = gridToolbar.query(By.css(CSS_CLASS_EXPORT_BTN));
        expect(exportButton).toBe(null);
    });

    it('testing main export button text', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();

        const gridToolbar = GridFunctions.getToolbar(fixture);

        let exportButton = gridToolbar.query(By.css(CSS_CLASS_EXPORT_BTN + ' span span'));
        expect(exportButton).toBe(null);

        grid.exportText = 'NEWVALUE';
        grid.exportExcel = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        expect(grid.exportText).toBe('NEWVALUE');
        exportButton = gridToolbar.query(By.css(CSS_CLASS_EXPORT_BTN + ' span span'));
        expect(exportButton).not.toBe(null);
        expect(exportButton.nativeElement.innerText).toBe('NEWVALUE');
    });

    it('testing export to Excel button visibility', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();

        expect(GridFunctions.getExportButton(fixture)).toBe(null);

        grid.exportExcel = true;
        fixture.detectChanges();

        expect(GridFunctions.getExportButton(fixture)).not.toBe(null);

        grid.exportExcel = false;
        fixture.detectChanges();

        expect(GridFunctions.getExportButton(fixture)).toBe(null);
    });

    it('testing export to Excel button text', () => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));

        const exportDropDown = GridFunctions.getOverlay(fixture);
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
        grid.toolbarTitle = TOOLBAR_TITLE;
        grid.exportCsv = true;
        fixture.detectChanges();

        expect(GridFunctions.getExportButton(fixture)).not.toBe(null);
        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));

        expect(GridFunctions.getOverlay(fixture)).not.toBe(null);

        fixture.detectChanges();

        const exportButton = GridFunctions.getOverlay(fixture).querySelector('li#btnExportCsv');
        expect(exportButton).not.toBe(null);

        grid.exportCsv = false;
        fixture.detectChanges();

        expect(GridFunctions.getExportButton(fixture)).toBe(null);
    });

    it('testing export to CSV button text', () => {
        grid.showToolbar = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));

        const exportButton = GridFunctions.getOverlay(fixture).querySelector('li#btnExportCsv');
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

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));

        expect(GridFunctions.getOverlay(fixture)).not.toBe(null);
        expect(GridFunctions.getExportOptions(fixture).length).toBe(2);

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));
    });

    it('testing excel export starting event (cancel)', () => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        spyOn(grid.onToolbarExporting, 'emit').and.callThrough();
        grid.onToolbarExporting.pipe(first()).subscribe((args) => {
            args.cancel = true;
        });
        spyOn(grid.toolbar.excelExporter, 'export');

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));
        const exportExcelButton = GridFunctions.getOverlay(fixture).querySelector('li#btnExportExcel');
        exportExcelButton.click();

        expect(grid.toolbar.excelExporter.export).not.toHaveBeenCalled();
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledTimes(1);
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledWith({
            grid: grid,
            exporter: grid.toolbar.excelExporter,
            cancel: true,
            options: new IgxExcelExporterOptions('ExportedData')
        });
    });

    it('testing excel export starting event (non-cancel)', () => {
        grid.showToolbar = true;
        grid.exportExcel = true;
        fixture.detectChanges();

        spyOn(grid.onToolbarExporting, 'emit').and.callThrough();
        spyOn(grid.toolbar.excelExporter, 'export');

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));
        const exportExcelButton = GridFunctions.getOverlay(fixture).querySelector('li#btnExportExcel');
        exportExcelButton.click();

        expect(grid.toolbar.excelExporter.export).toHaveBeenCalled();
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledTimes(1);
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledWith({
            grid: grid,
            exporter: grid.toolbar.excelExporter,
            cancel: false,
            options: new IgxExcelExporterOptions('ExportedData')
        });
    });

    it('testing csv export starting event (cancel)', () => {
        grid.showToolbar = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        spyOn(grid.onToolbarExporting, 'emit').and.callThrough();
        grid.onToolbarExporting.pipe(first()).subscribe((args) => {
            args.cancel = true;
        });
        spyOn(grid.toolbar.csvExporter, 'export');

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));
        const exportCsvButton = GridFunctions.getOverlay(fixture).querySelector('li#btnExportCsv');
        exportCsvButton.click();

        expect(grid.toolbar.csvExporter.export).not.toHaveBeenCalled();
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledTimes(1);
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledWith({
            grid: grid,
            exporter: grid.toolbar.csvExporter,
            cancel: true,
            options: new IgxCsvExporterOptions('ExportedData', CsvFileTypes.CSV)
        });
    });

    it('testing csv export starting event (non-cancel)', () => {
        grid.showToolbar = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        spyOn(grid.onToolbarExporting, 'emit').and.callThrough();
        spyOn(grid.toolbar.csvExporter, 'export');

        GridFunctions.getExportButton(fixture).triggerEventHandler('click', new Event('click'));
        const exportCsvButton = GridFunctions.getOverlay(fixture).querySelector('li#btnExportCsv');
        exportCsvButton.click();

        expect(grid.toolbar.csvExporter.export).toHaveBeenCalled();
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledTimes(1);
        expect(grid.onToolbarExporting.emit).toHaveBeenCalledWith({
            grid: grid,
            exporter: grid.toolbar.csvExporter,
            cancel: false,
            options: new IgxCsvExporterOptions('ExportedData', CsvFileTypes.CSV)
        });
    });

    it('does not show Column Hiding button by default.', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();
        expect(grid.toolbar.columnHidingUI).toBeUndefined();

        const button = GridFunctions.getColumnHidingButton(fixture);
        expect(button).toBeUndefined();
    });

    it('shows Column Hiding button with default content when columnHiding=true.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();
        expect(grid.toolbar.columnHidingUI).toBeDefined();

        const button = GridFunctions.getColumnHidingButton(fixture);
        expect(button).toBeDefined();
        const btnText = button.innerText.toLowerCase();
        expect(btnText.includes('0') && btnText.includes('visibility') && !btnText.includes('visibility_off')).toBe(true);
    });

    it('shows the proper icon depending whether there is a hidden column or not.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        grid.columns[0].hidden = true;
        fixture.detectChanges();

        const button = GridFunctions.getColumnHidingButton(fixture);
        expect(button).toBeDefined();
        let btnText = button.innerText.toLowerCase();
        expect(btnText.includes('1') && btnText.includes('visibility_off')).toBe(true);

        grid.columns[0].hidden = false;
        fixture.detectChanges();
        btnText = button.innerText.toLowerCase();
        expect(btnText.includes('0') && btnText.includes('visibility') && !btnText.includes('visibility_off')).toBe(true);
    });

    it('toggleColumnHidingUI() method opens and closes the ColumnHiding dropdown.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        GridFunctions.getColumnHidingButton(fixture).click();

        const dropDownDiv = GridFunctions.getOverlay(fixture);
        expect(dropDownDiv).not.toBe(null);
        expect(dropDownDiv.querySelector('igx-column-actions')).not.toBe(null);

        GridFunctions.getColumnHidingButton(fixture).click();
    });

    it('does not show Column Pinning button by default.', () => {
        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();
        expect(grid.toolbar.columnPinningUI).toBeUndefined();
        expect(GridFunctions.getColumnPinningButton(fixture)).toBeUndefined();

        grid.columnPinning = true;
        fixture.detectChanges();

        expect(grid.toolbar.columnPinningUI).toBeDefined();
        expect(GridFunctions.getColumnPinningButton(fixture)).toBeDefined();
    });

    it('shows Column Pinning button with default content when columnPinning=true.', () => {
        grid.showToolbar = true;
        grid.columnPinning = true;
        fixture.detectChanges();
        expect(grid.toolbar.columnPinningUI).toBeDefined();

        const button = GridFunctions.getColumnPinningButton(fixture);
        expect(button).toBeDefined();
        const icon = button.querySelector('igx-icon');
        const iconName = icon.getAttribute('name');
        const btnText = button.innerText.toLowerCase();
        expect(btnText.includes('0')).toBe(true);
        expect(iconName === 'unpin-left').toBe(true);
    });

    it('toggleColumnPinningUI() method opens and closes the ColumnPinning dropdown.', () => {
        grid.showToolbar = true;
        grid.columnPinning = true;
        fixture.detectChanges();

        GridFunctions.getColumnPinningButton(fixture).click();

        const dropDownDiv = GridFunctions.getOverlay(fixture);
        expect(dropDownDiv).not.toBe(null);
        expect(dropDownDiv.querySelector('igx-column-actions')).not.toBe(null);

        GridFunctions.getColumnPinningButton(fixture).click();
    });

    it('display density is properly applied.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        const toolbar = GridFunctions.getToolbar(fixture).nativeElement;
        expect(grid.toolbar.displayDensity).toEqual(DisplayDensity.comfortable);
        expect(toolbar.classList[0]).toBe(CSS_CLASS_GRID_TOOLBAR);

        expect(parseFloat(toolbar.offsetHeight)).toBe(58);
        verifyButtonsDisplayDensity(GridFunctions.getToolbar(fixture), DisplayDensity.comfortable);

        grid.displayDensity = DisplayDensity.compact;
        fixture.detectChanges();

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.compact);
        expect(toolbar.classList[0]).toBe(CSS_CLASS_GRID_TOOLBAR_COMPACT);
        expect(parseFloat(toolbar.offsetHeight)).toBe(44);
        verifyButtonsDisplayDensity(GridFunctions.getToolbar(fixture), DisplayDensity.compact);

        grid.displayDensity = DisplayDensity.cosy;
        fixture.detectChanges();

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.cosy);
        expect(toolbar.classList[0]).toBe(CSS_CLASS_GRID_TOOLBAR_COSY);
        expect(parseFloat(toolbar.offsetHeight)).toBe(52);
        verifyButtonsDisplayDensity(GridFunctions.getToolbar(fixture), DisplayDensity.cosy);
    });

    it('display density is properly applied through the grid.', () => {
        grid.showToolbar = true;
        grid.columnHiding = true;
        fixture.detectChanges();

        const toolbar = GridFunctions.getToolbar(fixture).nativeElement;
        expect(grid.toolbar.displayDensity).toEqual(DisplayDensity.comfortable);
        expect(toolbar.classList[0]).toBe(CSS_CLASS_GRID_TOOLBAR);
        verifyButtonsDisplayDensity(GridFunctions.getToolbar(fixture), DisplayDensity.comfortable);

        grid.displayDensity = DisplayDensity.compact;
        fixture.detectChanges();

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.compact);
        expect(toolbar.classList[0]).toBe(CSS_CLASS_GRID_TOOLBAR_COMPACT);
        verifyButtonsDisplayDensity(GridFunctions.getToolbar(fixture), DisplayDensity.compact);

        grid.displayDensity = DisplayDensity.cosy;
        fixture.detectChanges();

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.cosy);
        expect(toolbar.classList[0]).toBe(CSS_CLASS_GRID_TOOLBAR_COSY);
        verifyButtonsDisplayDensity(GridFunctions.getToolbar(fixture), DisplayDensity.cosy);

        grid.displayDensity = DisplayDensity.comfortable;
        fixture.detectChanges();

        expect(grid.toolbar.displayDensity).toBe(DisplayDensity.comfortable);
        verifyButtonsDisplayDensity(GridFunctions.getToolbar(fixture), DisplayDensity.comfortable);
    });

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

        expect(parseFloat(grid.toolbar.columnHidingUI.columnsAreaMaxHeight)).toBe(grid.calcHeight * 0.7);

        grid.height = '600px';
        tick(100);
        fixture.detectChanges();

        expect(grid.toolbar.columnHidingUI.columnsAreaMaxHeight).toBe(grid.calcHeight * 0.7 + 'px');
    }));
  });

  describe('Custom Content - ', () => {

    it('should not have content container when no template is provided', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;

        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();

        const customContainer = GridFunctions.getToolbar(fixture).query(By.css(CSS_CLASS_CUSTOM_CONTENT));
        expect(customContainer).toBe(null);
    });

    it('should have the content container when the template is provided', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage2Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;

        grid.showToolbar = true;
        grid.toolbarTitle = TOOLBAR_TITLE;
        fixture.detectChanges();

        const customContainer = GridFunctions.getToolbar(fixture).query(By.css(CSS_CLASS_CUSTOM_CONTENT));
        expect(customContainer).not.toBe(null);
    });

    it('should expose the toolbar buttons with their correct type', () => {
        const fixture = TestBed.createComponent(GridToolbarTestPage1Component);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid1;

        grid.showToolbar = true;
        grid.columnHiding = true;
        grid.columnPinning = true;
        grid.exportExcel = true;
        grid.exportCsv = true;
        fixture.detectChanges();

        let aButton = grid.toolbar.columnHidingButton;
        expect(aButton instanceof IgxButtonDirective).toBe(true, 'column hiding button has wrong type');

        aButton = grid.toolbar.columnPinningButton;
        expect(aButton instanceof IgxButtonDirective).toBe(true, 'column pinning button has wrong type');

        aButton = grid.toolbar.exportButton;
        expect(aButton instanceof IgxButtonDirective).toBe(true, 'export button has wrong type');
    });
  });
});

function verifyButtonsDisplayDensity(parentDebugEl: DebugElement, expectedDisplayDensity: DisplayDensity) {
    const flatButtons = parentDebugEl.queryAll(By.css('.igx-button--flat'));
    const raisedButtons = parentDebugEl.queryAll(By.css('.igx-button--raised'));
    const fabButtons = parentDebugEl.queryAll(By.css('.igx-button--fab'));
    const buttons = Array.from(flatButtons).concat(Array.from(raisedButtons)).concat(Array.from(fabButtons));

    let expectedDensityClass;
    switch (expectedDisplayDensity) {
        case DisplayDensity.compact: expectedDensityClass = 'igx-button--compact'; break;
        case DisplayDensity.cosy: expectedDensityClass = 'igx-button--cosy'; break;
        default: expectedDensityClass = ''; break;
    }

    buttons.forEach((button: DebugElement) => {
        if (expectedDisplayDensity === DisplayDensity.comfortable) {
            // If expected display density is comfortable, then button should not have 'compact' and 'cosy' classes.
            expect(button.nativeElement.classList.contains('igx-button--compact')).toBe(false, 'incorrect button density');
            expect(button.nativeElement.classList.contains('igx-button--cosy')).toBe(false, 'incorrect button density');
        } else {
            expect(button.nativeElement.classList.contains(expectedDensityClass)).toBe(true, 'incorrect button density');
        }
    });
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

    @ViewChild('grid1', { read: IgxGridComponent, static: true })
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

    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;

}
