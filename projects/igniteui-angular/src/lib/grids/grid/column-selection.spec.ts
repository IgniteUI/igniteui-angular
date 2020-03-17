import { async, TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductsComponent, ColumnSelectionGroupTestComponent } from '../../test-utils/grid-samples.spec';
import { GridSelectionFunctions, GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxColumnComponent } from '../columns/column.component';
import { IColumnSelectionEventArgs } from '../common/events';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';

const SELECTED_COLUMN_CLASS = 'igx-grid__th--selected';
const SELECTED_COLUMN_CELL_CLASS = 'igx-grid__td--column-selected';

const selectedData = [{ ProductID: 1, ProductName: 'Chai' },
{ ProductID: 2, ProductName: 'Aniseed Syrup' },
{ ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning' },
{ ProductID: 4, ProductName: 'Grandmas Boysenberry Spread' },
{ ProductID: 5, ProductName: 'Uncle Bobs Dried Pears' },
{ ProductID: 6, ProductName: 'Northwoods Cranberry Sauce' },
{ ProductID: 7, ProductName: 'Queso Cabrales' },
{ ProductID: 8, ProductName: 'Tofu' },
{ ProductID: 9, ProductName: 'Teatime Chocolate Biscuits' },
{ ProductID: 10, ProductName: 'Chocolate' }];

describe('IgxGrid - Column Selection #grid', () => {
    configureTestSuite();
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ProductsComponent,
                ColumnSelectionGroupTestComponent
            ],
            imports: [BrowserAnimationsModule, IgxGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('Base tests: ', () => {
        let colProductName: IgxColumnComponent;
        let colProductID: IgxColumnComponent;
        let colInStock: IgxColumnComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ProductsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            colProductName = grid.getColumnByName('ProductName');
            colProductID = grid.getColumnByName('ProductID');
            colInStock = grid.getColumnByName('InStock');
        }));

        it('setting selected and selectable properties ', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            grid.columnList.forEach(column => {
                expect(column.selectable).toBeTruthy();
                expect(column.selected).toBeFalsy();
            });

            let col = grid.getColumnByName('ProductID');
            col.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(col);

            col = grid.getColumnByName('ProductName');
            col.selectable = false;
            fix.detectChanges();

            expect(col.selectable).toBeFalsy();

            // Verify that when column is not selectable cannot select it.
            col.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAndCellsSelected(col, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('selecting a column with mouse click', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            colProductName.selectable = false;
            fix.detectChanges();

            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: [],
                newSelection: ['ProductID'],
                added: ['ProductID'],
                removed: [],
                event: jasmine.anything(),
                cancel: false
            });

            GridFunctions.clickColumnHeaderUI('ProductName', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(1);

            GridFunctions.clickColumnHeaderUI('InStock', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['ProductID'],
                newSelection: ['InStock'],
                added: ['InStock'],
                removed: ['ProductID'],
                event: jasmine.anything(),
                cancel: false
            });

            GridFunctions.clickColumnHeaderUI('InStock', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(3);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['InStock'],
                newSelection: [],
                added: [],
                removed: ['InStock'],
                event: jasmine.anything(),
                cancel: false
            });
        });

        it('selecting a column with ctrl + mouse click', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            colProductName.selectable = false;
            fix.detectChanges();

            GridSelectionFunctions.clickOnColumnToSelect(colProductID, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: [],
                newSelection: ['ProductID'],
                added: ['ProductID'],
                removed: [],
                event: jasmine.anything(),
                cancel: false
            });

            GridSelectionFunctions.clickOnColumnToSelect(colInStock, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['ProductID'],
                newSelection: ['ProductID', 'InStock'],
                added: ['InStock'],
                removed: [],
                event: jasmine.anything(),
                cancel: false
            });

            GridSelectionFunctions.clickOnColumnToSelect(colProductName, true);
            grid.cdr.detectChanges();
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(2);

            const colOrderDate = grid.getColumnByName('OrderDate');
            GridSelectionFunctions.clickOnColumnToSelect(colOrderDate, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(3);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['ProductID', 'InStock'],
                newSelection: ['ProductID', 'InStock', 'OrderDate'],
                added: ['OrderDate'],
                removed: [],
                event: jasmine.anything(),
                cancel: false
            });

            GridSelectionFunctions.clickOnColumnToSelect(colInStock, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            GridSelectionFunctions.verifyColumnSelected(colInStock, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(4);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['ProductID', 'InStock', 'OrderDate'],
                newSelection: ['ProductID', 'OrderDate'],
                added: [],
                removed: ['InStock'],
                event: jasmine.anything(),
                cancel: false
            });
            GridSelectionFunctions.clickOnColumnToSelect(colOrderDate);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            GridSelectionFunctions.verifyColumnSelected(colInStock, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(5);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['ProductID', 'OrderDate'],
                newSelection: ['OrderDate'],
                added: [],
                removed: ['ProductID'],
                event: jasmine.anything(),
                cancel: false
            });
        });

        it('selecting a column with shift + mouse click', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            const colUnits = grid.getColumnByName('UnitsInStock');
            const colOrderDate = grid.getColumnByName('OrderDate');
            colUnits.selected = true;
            colProductName.selectable = false;
            fix.detectChanges();

            GridSelectionFunctions.clickOnColumnToSelect(colInStock, true, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colUnits);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['UnitsInStock'],
                newSelection: ['UnitsInStock', 'InStock'],
                added: ['InStock'],
                removed: [],
                event: jasmine.anything(),
                cancel: false
            });

            GridSelectionFunctions.clickOnColumnToSelect(colOrderDate, false, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colOrderDate);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            GridSelectionFunctions.verifyColumnSelected(colUnits);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['UnitsInStock', 'InStock'],
                newSelection: ['UnitsInStock', 'InStock', 'OrderDate'],
                added: ['OrderDate'],
                removed: [],
                event: jasmine.anything(),
                cancel: false
            });

            GridSelectionFunctions.clickOnColumnToSelect(colProductID, false, true);
            grid.cdr.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colOrderDate, false);
            GridSelectionFunctions.verifyColumnSelected(colProductName, false);
            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnSelected(colInStock);
            GridSelectionFunctions.verifyColumnSelected(colUnits);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(3);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: ['UnitsInStock', 'InStock', 'OrderDate'],
                newSelection: ['UnitsInStock', 'InStock', 'ProductID'],
                added: ['ProductID'],
                removed: ['OrderDate'],
                event: jasmine.anything(),
                cancel: false
            });
        });

        it('verify selectable class is applied when hover a column', () => {
            colProductName.selectable = false;
            fix.detectChanges();

            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            productIDHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productIDHeader);

            productIDHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productIDHeader, false);

            const productNameHeader = GridFunctions.getColumnHeader('ProductName', fix);
            productNameHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productNameHeader, false);

            productNameHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productIDHeader, false);
        });

        it('verify ARIA support', () => {
            colProductName.selected = true;
            fix.detectChanges();

            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            const productNameHeader = GridFunctions.getColumnHeader('ProductName', fix);

            expect(productIDHeader.nativeElement.getAttribute('aria-selected')).toMatch('false');
            expect(productNameHeader.nativeElement.getAttribute('aria-selected')).toMatch('true');

            colProductName.cells.forEach(cell => {
                expect(cell.nativeElement.getAttribute('aria-selected')).toMatch('true');
            });
            colProductID.cells.forEach(cell => {
                expect(cell.nativeElement.getAttribute('aria-selected')).toMatch('false');
            });
        });

        it('verify canceling event onColumnSelectionChange', () => {
            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            grid.onColumnSelectionChange.subscribe((e: IColumnSelectionEventArgs) => {
                e.cancel = true;
            });

            // Click on same column to deselect it.
            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            // Click on different column
            GridFunctions.clickColumnHeaderUI('ProductName', fix);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.selectedColumns()).toEqual([colProductID]);

            // Click on different column holding ctrl key
            GridFunctions.clickColumnHeaderUI('ProductName', fix, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.selectedColumns()).toEqual([colProductID]);

            // Click on different column holding shift key
            GridFunctions.clickColumnHeaderUI('ProductName', fix, false, true);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductName, false);
            expect(grid.selectedColumns()).toEqual([colProductID]);
        });

        it('verify method selectColumns', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            const colUnits = grid.getColumnByName('UnitsInStock');
            const colOrderDate = grid.getColumnByName('OrderDate');
            // select columns with array of fields
            grid.selectColumns(['ProductID', 'InStock']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colInStock]);
            expect(grid.selectedColumns()).toEqual([colProductID, colInStock]);

            // select columns with with clearCurrentSelection false
            grid.selectColumns(['UnitsInStock', 'InStock']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colInStock, colUnits]);
            expect(grid.selectedColumns()).toEqual([colProductID, colInStock, colUnits]);

            // select columns with with clearCurrentSelection true
            grid.selectColumns(['OrderDate', 'ProductID'], true);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colOrderDate]);
            expect(grid.selectedColumns()).toEqual([colOrderDate, colProductID]);

            // select columns with array of columns
            grid.selectColumns([colInStock, colProductName]);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colOrderDate, colInStock, colProductName]);
            expect(grid.selectedColumns()).toEqual([colOrderDate, colProductID, colInStock, colProductName]);

            grid.selectColumns([colProductID], true);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID);
            GridSelectionFunctions.verifyColumnsSelected([colOrderDate, colInStock, colProductName], false);
            expect(grid.selectedColumns()).toEqual([colProductID]);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('verify method deselectColumns', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            grid.columns.forEach(col => col.selected = true);

            const colUnits = grid.getColumnByName('UnitsInStock');
            const colOrderDate = grid.getColumnByName('OrderDate');

            // deselect columns with array of fields
            grid.deselectColumns(['ProductID']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnSelected(colProductID, false);
            GridSelectionFunctions.verifyColumnsSelected([colProductName, colInStock, colUnits, colOrderDate]);
            expect(grid.selectedColumns()).toEqual([colProductName, colInStock, colUnits, colOrderDate]);

            // deselect columns with not existing field
            grid.deselectColumns(['testField', 'ProductID', 'UnitsInStock']);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([colProductID, colUnits], false);
            GridSelectionFunctions.verifyColumnsSelected([colProductName, colInStock, colOrderDate]);
            expect(grid.selectedColumns()).toEqual([colProductName, colInStock, colOrderDate]);

            // select columns with array of columns
            grid.deselectColumns([colOrderDate, colUnits]);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([colProductID, colUnits, colOrderDate], false);
            GridSelectionFunctions.verifyColumnsSelected([colProductName, colInStock]);
            expect(grid.selectedColumns()).toEqual([colProductName, colInStock]);
        });

        it('verify methods selectAllColumns  and deselectAllColumns', () => {
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();
            // select all columns
            grid.selectAllColumns();
            fix.detectChanges();

            grid.columnList.forEach(c => {
                expect(c.selected).toEqual(true);
            });

            // deselect all columns
            grid.deselectAllColumns();
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected(grid.columns, false);
            expect(grid.selectedColumns()).toEqual([]);

            // Set selectable false to a column
            colProductName.selectable = false;
            fix.detectChanges();

            // select all columns
            grid.selectAllColumns();
            fix.detectChanges();

            grid.columnList.forEach(c => {
                expect(c.selected).toEqual(true);
            });

            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('verify method getSelectedColumnsData', () => {
            colProductID.selected = true;
            colProductName.selected = true;
            fix.detectChanges();

            expect(selectedData).toEqual(grid.getSelectedColumnsData());
        });
    });

    describe('Multi column headers tests: ', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnSelectionGroupTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('setting selected on a column group', () => {
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const genInf = GridFunctions.getColGroup(grid, 'General Information');
            const companyName = grid.getColumnByName('CompanyName');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();

            // verify setting selected true on a column group
            genInf.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([companyName, contactName, contactTitle]);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf);

            // verify setting selected false on a column group
            personDetails.selected = false;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([contactName, contactTitle], false);
            GridSelectionFunctions.verifyColumnSelected(companyName);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf, false);

            contactName.selected = true;
            contactTitle.selected = true;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([companyName, contactName, contactTitle]);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('setting selected on a column group with no selectable children', () => {
            const countryInf = GridFunctions.getColGroup(grid, 'Country Information');
            const regInf = GridFunctions.getColGroup(grid, 'Region Information');
            const cityInf = GridFunctions.getColGroup(grid, 'City Information');
            const country = grid.getColumnByName('Country');
            const region = grid.getColumnByName('Region');
            const postalCode = grid.getColumnByName('PostalCode');
            const city = grid.getColumnByName('City');
            const address = grid.getColumnByName('Address');
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();

            // verify setting selected true on a column group
            countryInf.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnsSelected([region, postalCode]);
            GridSelectionFunctions.verifyColumnsSelected([country, city, address], false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInf);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regInf);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, cityInf, false);

            // Set select to false to a column group
            countryInf.selected = false;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsSelected([country, region, postalCode, city, address], false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, countryInf, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, regInf, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, cityInf, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('setting selectable false to group children', () => {
            const genInf = GridFunctions.getColGroup(grid, 'General Information');
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const companyName = grid.getColumnByName('CompanyName');
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            spyOn(grid.onColumnSelectionChange, 'emit').and.callThrough();

            // verify setting selected true on a column group
            contactName.selectable = false;
            contactTitle.selectable = false;
            companyName.selectable = false;
            fix.detectChanges();

            expect(personDetails.selectable).toBeFalsy();
            expect(genInf.selectable).toBeFalsy();

            // Set selected
            genInf.selected = true;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails, false);
            GridSelectionFunctions.verifyColumnGroupSelected(fix, genInf, false);
            expect(grid.onColumnSelectionChange.emit).toHaveBeenCalledTimes(0);
        });

        it('verify that when hover group all its selectable children have correct classes', () => {
            const contactName = grid.getColumnByName('ContactName');
            const contactTitle = grid.getColumnByName('ContactTitle');
            const genInfHeader = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            const personDetailsHeader = GridFunctions.getColumnGroupHeaderCell('Person Details', fix);
            const companyNameHeader = GridFunctions.getColumnHeader('CompanyName', fix);
            const contactNameHeader = GridFunctions.getColumnHeader('ContactName', fix);
            const contactTitleHeader = GridFunctions.getColumnHeader('ContactTitle', fix);

            genInfHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader,
                personDetailsHeader, companyNameHeader, contactNameHeader, contactTitleHeader]);

            genInfHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader,
                personDetailsHeader, companyNameHeader, contactNameHeader, contactTitleHeader], false);

            contactName.selectable = false;
            contactTitle.selectable = false;
            fix.detectChanges();

            genInfHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader, companyNameHeader]);
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([personDetailsHeader,
                contactNameHeader, contactTitleHeader], false);

            genInfHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([genInfHeader, companyNameHeader], false);

            // hover not selectable group
            personDetailsHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([personDetailsHeader,
                contactNameHeader, contactTitleHeader, genInfHeader, companyNameHeader], false);
            personDetailsHeader.triggerEventHandler('pointerleave', null);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnsHeadersHasSelectableClass([personDetailsHeader,
                contactNameHeader, contactTitleHeader, genInfHeader, companyNameHeader], false);
        });


        it('verify selecting a group with mouse click', () => {
            const personDetails = GridFunctions.getColGroup(grid, 'Person Details');
            const genInfHeader = GridFunctions.getColumnGroupHeaderCell('General Information', fix);
            const personDetailsHeader = GridFunctions.getColumnGroupHeaderCell('Person Details', fix);
            const companyNameHeader = GridFunctions.getColumnHeader('CompanyName', fix);
            const contactNameHeader = GridFunctions.getColumnHeader('ContactName', fix);
            const contactTitleHeader = GridFunctions.getColumnHeader('ContactTitle', fix);

            GridFunctions.clickColumnGroupHeaderUI('Person Details', fix);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnGroupSelected(fix, personDetails);
        });
    });

    describe('Integration tests: ', () => {
        let colProductID;
        let colProductName;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ProductsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            colProductID = grid.getColumnByName('ProductID');
            colProductName = grid.getColumnByName('ProductName');
        }));

        it('Filtering: Verify column selection when filter row is opened ', fakeAsync(() => {
            grid.allowFiltering = true;
            const colInStock = grid.getColumnByName('InStock');
            colProductID.selected = true;
            fix.detectChanges();

            GridFunctions.clickFilterCellChipUI(fix, 'ProductName'); // Name column contains nested object as a value
            tick(150);
            fix.detectChanges();

            const filterRow = GridFunctions.getFilterRow(fix);
            expect(filterRow).toBeDefined();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);

            GridFunctions.clickColumnHeaderUI('InStock', fix);
            tick();

            GridSelectionFunctions.verifyColumnAndCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAndCellsSelected(colInStock, false);
            expect(grid.filteringRow.column.field).toEqual('InStock');

            GridFunctions.clickColumnHeaderUI('ProductID', fix);
            tick();

            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            expect(productIDHeader.nativeElement.classList.contains(SELECTED_COLUMN_CLASS)).toBeFalsy();
            colProductID.cells.forEach(cell => {
                expect(cell.nativeElement.classList.contains(SELECTED_COLUMN_CELL_CLASS)).toEqual(true);
            });
            expect(grid.filteringRow.column.field).toEqual('ProductID');

            // Hover column headers
            const productNameHeader = GridFunctions.getColumnHeader('ProductName', fix);
            productNameHeader.triggerEventHandler('pointerenter', null);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnHeaderHasSelectableClass(productNameHeader, false);
        }));

        it('Filtering: Verify column selection when filter', () => {
            colProductName.selected = true;
            colProductID.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);

            grid.filter('ProductName', 'Chocolate', IgxStringFilteringOperand.instance().condition('equals'), true);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual([{ ProductID: 10, ProductName: 'Chocolate' }]);

            grid.clearFilter();
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData);
        });

        it('Sorting: Verify column selection is not change when click on sort indicator', () => {
            const productIDHeader = GridFunctions.getColumnHeader('ProductID', fix);
            colProductName.selected = true;
            colProductID.sortable = true;
            colProductID.selected = true;
            fix.detectChanges();

            GridFunctions.clickHeaderSortIcon(productIDHeader);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID, true);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName, true);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData);

            GridFunctions.clickHeaderSortIcon(productIDHeader);
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID, true);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName, true);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData.sort(( a, b) => b.ProductID - a.ProductID));
        });

        it('Pinning: Verify that when pin/unpin the column stays selected', () => {
            colProductName.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);

            // pin the column
            colProductName.pinned = true;
            fix.detectChanges();

            GridFunctions.verifyColumnIsPinned(colProductName, true, 1);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);

            colProductName.pinned = false;
            fix.detectChanges();

            GridFunctions.verifyColumnIsPinned(colProductName, false, 0);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);
        });

        it('Hiding: Verify that when hide/unhide a column the column stays selected', () => {
            colProductID.selected = true;
            colProductName.selected = true;
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);

            // hide the column
            colProductName.hidden = true;
            fix.detectChanges();

            GridFunctions.verifyColumnIsHidden(colProductName, true, 4);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData);
            expect(grid.selectedColumns().includes(colProductName)).toBeTruthy();

            colProductName.hidden = false;
            fix.detectChanges();
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
        });

        it('Moving: Verify that when move a column, it stays selected', () => {
            colProductID.movable = true;
            colProductName.movable = true;
            colProductID.selected = true;
            fix.detectChanges();

            grid.moveColumn(colProductID, colProductName);
            fix.detectChanges();

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName, false);
            expect(colProductID.visibleIndex).toEqual(1);
        });

        it('Paging: Verify column stays selected when change page', fakeAsync(() => {
            colProductName.selected = true;
            colProductID.selected = true;
            grid.paging = true;
            grid.perPage = 3;
            fix.detectChanges();
            tick(30);

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData);

            grid.paginate(1);
            fix.detectChanges();
            tick(16);

            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductID);
            GridSelectionFunctions.verifyColumnAncCellsSelected(colProductName);
            expect(grid.getSelectedColumnsData()).toEqual(selectedData);
        }));
    });
});
