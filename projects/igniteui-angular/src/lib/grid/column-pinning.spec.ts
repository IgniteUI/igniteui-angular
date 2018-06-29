
import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, Input, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../calendar';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxColumnPinningComponent, IgxColumnPinningModule } from './column-pinning.component';
import { IgxColumnComponent } from './column.component';
import { IgxGridComponent, IPinColumnEventArgs } from './grid.component';
import { IgxGridModule } from './index';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDropDownComponent, IgxDropDownModule } from '../drop-down/drop-down.component';

describe('Column Pinning UI', () => {
    let fix;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnPinningComponent;
    let columnChooserElement: DebugElement;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridWithColumnChooserComponent,
                ColumnPinningComponent,
                GridWithoutColumnChooserComponent,
                ColumnPinningToggleComponent,
                GridWithGroupColumnsComponent
            ],
            imports: [
                BrowserAnimationsModule,
                NoopAnimationsModule,
                IgxGridModule.forRoot(),
                IgxColumnPinningModule,
                IgxDropDownModule,
                IgxButtonModule
            ]
        })
        .compileComponents();
    });

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(ColumnPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        });

        afterAll(() => {
            clearOverlay();
        });

        it ('title is initially empty.', () => {
            const title = columnChooserElement.query(By.css('h4'));
            expect(title).toBe(null);
        });

        it ('title can be successfully changed.', () => {
            columnChooser.title = 'Pin/Unpin Columns';
            fix.detectChanges();

            const titleElement = (columnChooserElement.query(By.css('h4')).nativeElement as HTMLHeadingElement);
            expect(columnChooser.title).toBe('Pin/Unpin Columns');
            expect(titleElement.textContent).toBe('Pin/Unpin Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');

            columnChooser.title = null;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');
        });

        it('shows all checkboxes unchecked.', () => {
            const checkboxes = getCheckboxInputs();
            expect(checkboxes.filter((chk) => !chk.checked).length).toBe(5);
        });

        it('- toggling column checkbox checked state successfully changes the column\'s pinned state.', () => {
            const checkbox = getCheckboxInput('ReleaseDate');
            verifyCheckbox('ReleaseDate', false, false);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsPinned(column, false, 0);

            checkbox.click();

            expect(checkbox.checked).toBe(true);
            verifyColumnIsPinned(column, true, 1);

            checkbox.click();

            expect(checkbox.checked).toBe(false);
            verifyColumnIsPinned(column, false, 0);
        });

        it('reflects properly grid column pinned value changes.', () => {
            const name = 'ReleaseDate';
            verifyCheckbox(name, false, false);
            const column = grid.getColumnByName(name);

            column.pinned = true;
            fix.detectChanges();

            verifyCheckbox(name, true, false);
            verifyColumnIsPinned(column, true, 1);

            column.pinned = false;
            fix.detectChanges();

            verifyCheckbox(name, false, false);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = undefined;
            fix.detectChanges();

            verifyCheckbox(name, false, false);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = true;
            fix.detectChanges();
            verifyColumnIsPinned(column, true, 1);

            column.pinned = null;
            fix.detectChanges();

            verifyCheckbox(name, false, false);
            verifyColumnIsPinned(column, false, 0);
        });

        it('onColumnPinning event is fired on toggling checkboxes.', () => {
            let currentArgs: IPinColumnEventArgs;
            let counter = 0;
            grid.onColumnPinning.subscribe((args: IPinColumnEventArgs) => {
                counter++;
                currentArgs = args;
            });

            getCheckboxInput('ReleaseDate').click();

            expect(counter).toBe(1);
            expect(currentArgs.column.field).toBe('ReleaseDate');
            expect(currentArgs.insertAtIndex).toBe(0);

            getCheckboxInput('Downloads').click();

            expect(counter).toBe(2);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(currentArgs.insertAtIndex).toBe(1);

            getCheckboxInput('ReleaseDate').click();
            // TODO: Consider firing the event when unpinning!!!
            expect(counter).toBe(2);
            // expect(currentArgs.column.field).toBe('ReleaseDate');
            // expect(currentArgs.insertAtIndex).toBe(0);

            getCheckboxInput('Downloads').click();

            expect(counter).toBe(2);
            // expect(currentArgs.column.field).toBe('Downloads');
            // expect(currentArgs.insertAtIndex).toBe(0);

            getCheckboxInput('ProductName').click();

            expect(counter).toBe(3);
            expect(currentArgs.column.field).toBe('ProductName');
            expect(currentArgs.insertAtIndex).toBe(0);
        });

        it('doesn\'t pin columns if unpinned area width will become less than the defined minimum.', () => {
            const checkboxes = getCheckboxInputs();
            checkboxes[0].click();
            checkboxes[1].click();
            checkboxes[2].click();

            verifyColumnIsPinned(grid.columns[0], true, 2);
            verifyColumnIsPinned(grid.columns[1], true, 2);
            verifyColumnIsPinned(grid.columns[2], false, 2);

        });

        it('doesn\'t pin columns if unpinned area width does not allow it even after hiding a pinned column.', () => {
            const checkboxes = getCheckboxInputs();
            checkboxes[0].click();
            checkboxes[1].click();

            grid.columns[1].hidden = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(1);

            checkboxes[2].click();
            verifyColumnIsPinned(grid.columns[2], false, 1);

            checkboxes[0].click();
            verifyColumnIsPinned(grid.columns[0], false, 0);

            grid.columns[1].hidden = false;
            fix.detectChanges();

            verifyCheckbox('ProductName', true, false);
            verifyColumnIsPinned(grid.columns[1], true, 1);
        });

    });

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(GridWithGroupColumnsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        });

        it('shows only top level columns.', () => {
            const columnItems = columnChooser.columnItems;
            expect(columnItems.length).toBe(3);
            expect(columnItems[0].name).toBe('Missing');
            expect(columnItems[1].name).toBe('General Information');
            expect(columnItems[2].name).toBe('ID');
            expect(getColumnPinningItems().length).toBe(3);
        });

        it('- pinning group column pins all children.', () => {
            const columnName = 'General Information';
            getCheckboxInput(columnName).click();

            fix.detectChanges();
            verifyCheckbox(columnName, true, false);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);
        });


        it('- unpinning group column unpins all children.', () => {
            const columnName = 'General Information';
            grid.columns[1].pin();
            fix.detectChanges();

            verifyCheckbox(columnName, true, false);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);

            getCheckboxInput(columnName).click();

            fix.detectChanges();
            verifyCheckbox(columnName, false, false);
            expect(grid.columns[1].allChildren.every((col) => !col.pinned)).toBe(true);
        });
    });

    function getCheckboxElement(name: string) {
        if (!columnChooserElement) {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        }

        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        const chkProductName = checkboxElements.find((el) =>
        (el.context as IgxCheckboxComponent).placeholderLabel.nativeElement.innerText === name);

        return chkProductName;
    }

    function getCheckboxInput(name: string) {
        const checkboxEl = getCheckboxElement(name);
        const chkInput = checkboxEl.query(By.css('input')).nativeElement as HTMLInputElement;

        return chkInput;
    }

    function getCheckboxInputs(): HTMLInputElement[] {
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        const inputs = [];
        checkboxElements.forEach((el) => {
            inputs.push(el.query(By.css('input')).nativeElement as HTMLInputElement);
        });

        return inputs;
    }

    function getColumnPinningItems() {
        if (!columnChooserElement) {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        }
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        const items = [];
        checkboxElements.forEach((el) => {
            if ((el.nativeElement as HTMLElement).outerHTML.includes('igxcolumnpinningitem')) {
                items.push(el);
            }
        });

        return items;
    }

    function verifyColumnIsPinned(column: IgxColumnComponent, isPinned: boolean, pinnedColumnsCount: number) {
        expect(column.pinned).toBe(isPinned, 'Pinned is not ' + isPinned);

        const pinnedColumns = column.grid.pinnedColumns;
        expect(pinnedColumns.length).toBe(pinnedColumnsCount, 'Unexpected pinned columns count!');
        expect(pinnedColumns.findIndex((col) => col === column) > -1).toBe(isPinned, 'Unexpected result for pinnedColumns collection!');
    }

    function verifyCheckbox(name: string, isChecked: boolean, isDisabled: boolean) {
        const chkInput = getCheckboxInput(name);
        expect(chkInput.type).toBe('checkbox');
        expect(chkInput.disabled).toBe(isDisabled);
        expect(chkInput.checked).toBe(isChecked);
    }

    function clearOverlay() {
        const overlays = document.getElementsByClassName('igx-overlay') as HTMLCollectionOf<Element>;
        Array.from(overlays).forEach(element => {
            element.remove();
        });
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
    }
});

export class GridData {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 15),
            Released: false
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', -1),
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', -1),
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: ''
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'day', 1),
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, 'month', 1),
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: false
        }
    ];

}
@Component({
    template: `<div>
    <igx-column-pinning [columns]="grid1.columns"></igx-column-pinning>
    <igx-grid #grid1 [data]="data" width="500px" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>
    </div>`
})
export class ColumnPinningComponent extends GridData implements AfterViewInit {
    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnPinningComponent) public chooser: IgxColumnPinningComponent;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }
}

@Component({
    template: `<div>
    <igx-grid #grid1 [data]="data" width="500px" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>
    <button igxButton (click)="pinningUI.toggle()">Show Column Pinning UI</button>
    <igx-drop-down #pinningUI>
        <igx-column-pinning [columns]="grid1.columns"></igx-column-pinning>
    </igx-drop-down>
    </div>`
})
export class ColumnPinningToggleComponent extends ColumnPinningComponent {
    @ViewChild(IgxDropDownComponent) public dropDown: IgxColumnPinningComponent;
}

@Component({
    template: `<igx-grid [data]="data" width="500px" height="500px"
        [showToolbar]="true">
        <igx-column [field]="'ID'" [header]="'ID'" [disableHiding]="false"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>`
})
export class GridWithColumnChooserComponent extends GridData {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnPinningComponent) public chooser: IgxColumnPinningComponent;
    @ViewChild(IgxDropDownComponent) public dropDown: IgxDropDownComponent;
}

@Component({
    template: `<igx-grid [data]="data" width="500px" height="500px">
        <igx-column [field]="'ID'" [header]="'ID'" [disableHiding]="true"></igx-column>
        <igx-column [field]="'ProductName'" [disableHiding]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [hidden]="true" dataType="number"></igx-column>
        <igx-column [field]="'Released'" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'" dataType="date"></igx-column>
    </igx-grid>`
})
export class GridWithoutColumnChooserComponent extends GridData {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `<igx-column-pinning [columns]="grid.columns"></igx-column-pinning>
    <igx-grid [rowSelectable]="false" #grid [data]="data" displayDensity="compact">
    <igx-column [movable]="true" [hasSummary]="true" [resizable]="true" [pinned]="true" field="Missing"></igx-column>
    <igx-column-group [movable]="true" [pinned]="false" header="General Information">
        <igx-column [movable]="true" filterable="true" sortable="true" resizable="true" field="CompanyName"></igx-column>
        <igx-column-group [movable]="true" header="Person Details">
            <igx-column [movable]="true" [pinned]="false" filterable="true"
            sortable="true" resizable="true" field="ContactName"></igx-column>
            <igx-column [movable]="true" [hasSummary]="true" filterable="true" sortable="true"
            resizable="true" field="ContactTitle"></igx-column>
        </igx-column-group>
    </igx-column-group>
    <igx-column [movable]="true" [hasSummary]="true" [resizable]="true" field="ID" editable="true"></igx-column>
    </igx-grid>`
})
export class GridWithGroupColumnsComponent implements AfterViewInit {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnPinningComponent) public chooser: IgxColumnPinningComponent;

    data = [
        // tslint:disable:max-line-length
        { 'ID': 'ALFKI', 'CompanyName': 'Alfreds Futterkiste', 'ContactName': 'Maria Anders', 'ContactTitle': 'Sales Representative', 'Address': 'Obere Str. 57', 'City': 'Berlin', 'Region': null, 'PostalCode': '12209', 'Country': 'Germany', 'Phone': '030-0074321', 'Fax': '030-0076545' },
        { 'ID': 'ANATR', 'CompanyName': 'Ana Trujillo Emparedados y helados', 'ContactName': 'Ana Trujillo', 'ContactTitle': 'Owner', 'Address': 'Avda. de la Constitución 2222', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05021', 'Country': 'Mexico', 'Phone': '(5) 555-4729', 'Fax': '(5) 555-3745' },
        { 'ID': 'ANTON', 'CompanyName': 'Antonio Moreno Taquería', 'ContactName': 'Antonio Moreno', 'ContactTitle': 'Owner', 'Address': 'Mataderos 2312', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05023', 'Country': 'Mexico', 'Phone': '(5) 555-3932', 'Fax': null },
        { 'ID': 'AROUT', 'CompanyName': 'Around the Horn', 'ContactName': 'Thomas Hardy', 'ContactTitle': 'Sales Representative', 'Address': '120 Hanover Sq.', 'City': 'London', 'Region': null, 'PostalCode': 'WA1 1DP', 'Country': 'UK', 'Phone': '(171) 555-7788', 'Fax': '(171) 555-6750' },
        { 'ID': 'BERGS', 'CompanyName': 'Berglunds snabbköp', 'ContactName': 'Christina Berglund', 'ContactTitle': 'Order Administrator', 'Address': 'Berguvsvägen 8', 'City': 'Luleå', 'Region': null, 'PostalCode': 'S-958 22', 'Country': 'Sweden', 'Phone': '0921-12 34 65', 'Fax': '0921-12 34 67' },
        { 'ID': 'BLAUS', 'CompanyName': 'Blauer See Delikatessen', 'ContactName': 'Hanna Moos', 'ContactTitle': 'Sales Representative', 'Address': 'Forsterstr. 57', 'City': 'Mannheim', 'Region': null, 'PostalCode': '68306', 'Country': 'Germany', 'Phone': '0621-08460', 'Fax': '0621-08924' },
        { 'ID': 'BLONP', 'CompanyName': 'Blondesddsl père et fils', 'ContactName': 'Frédérique Citeaux', 'ContactTitle': 'Marketing Manager', 'Address': '24, place Kléber', 'City': 'Strasbourg', 'Region': null, 'PostalCode': '67000', 'Country': 'France', 'Phone': '88.60.15.31', 'Fax': '88.60.15.32' },
        { 'ID': 'BOLID', 'CompanyName': 'Bólido Comidas preparadas', 'ContactName': 'Martín Sommer', 'ContactTitle': 'Owner', 'Address': 'C/ Araquil, 67', 'City': 'Madrid', 'Region': null, 'PostalCode': '28023', 'Country': 'Spain', 'Phone': '(91) 555 22 82', 'Fax': '(91) 555 91 99' },
        { 'ID': 'BONAP', 'CompanyName': 'Bon app\'', 'ContactName': 'Laurence Lebihan', 'ContactTitle': 'Owner', 'Address': '12, rue des Bouchers', 'City': 'Marseille', 'Region': null, 'PostalCode': '13008', 'Country': 'France', 'Phone': '91.24.45.40', 'Fax': '91.24.45.41' },
        { 'ID': 'BOTTM', 'CompanyName': 'Bottom-Dollar Markets', 'ContactName': 'Elizabeth Lincoln', 'ContactTitle': 'Accounting Manager', 'Address': '23 Tsawassen Blvd.', 'City': 'Tsawassen', 'Region': 'BC', 'PostalCode': 'T2F 8M4', 'Country': 'Canada', 'Phone': '(604) 555-4729', 'Fax': '(604) 555-3745' },
        { 'ID': 'BSBEV', 'CompanyName': 'B\'s Beverages', 'ContactName': 'Victoria Ashworth', 'ContactTitle': 'Sales Representative', 'Address': 'Fauntleroy Circus', 'City': 'London', 'Region': null, 'PostalCode': 'EC2 5NT', 'Country': 'UK', 'Phone': '(171) 555-1212', 'Fax': null },
        { 'ID': 'CACTU', 'CompanyName': 'Cactus Comidas para llevar', 'ContactName': 'Patricio Simpson', 'ContactTitle': 'Sales Agent', 'Address': 'Cerrito 333', 'City': 'Buenos Aires', 'Region': null, 'PostalCode': '1010', 'Country': 'Argentina', 'Phone': '(1) 135-5555', 'Fax': '(1) 135-4892' },
        { 'ID': 'CENTC', 'CompanyName': 'Centro comercial Moctezuma', 'ContactName': 'Francisco Chang', 'ContactTitle': 'Marketing Manager', 'Address': 'Sierras de Granada 9993', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05022', 'Country': 'Mexico', 'Phone': '(5) 555-3392', 'Fax': '(5) 555-7293' },
        { 'ID': 'CHOPS', 'CompanyName': 'Chop-suey Chinese', 'ContactName': 'Yang Wang', 'ContactTitle': 'Owner', 'Address': 'Hauptstr. 29', 'City': 'Bern', 'Region': null, 'PostalCode': '3012', 'Country': 'Switzerland', 'Phone': '0452-076545', 'Fax': null },
        { 'ID': 'COMMI', 'CompanyName': 'Comércio Mineiro', 'ContactName': 'Pedro Afonso', 'ContactTitle': 'Sales Associate', 'Address': 'Av. dos Lusíadas, 23', 'City': 'Sao Paulo', 'Region': 'SP', 'PostalCode': '05432-043', 'Country': 'Brazil', 'Phone': '(11) 555-7647', 'Fax': null },
        { 'ID': 'CONSH', 'CompanyName': 'Consolidated Holdings', 'ContactName': 'Elizabeth Brown', 'ContactTitle': 'Sales Representative', 'Address': 'Berkeley Gardens 12 Brewery', 'City': 'London', 'Region': null, 'PostalCode': 'WX1 6LT', 'Country': 'UK', 'Phone': '(171) 555-2282', 'Fax': '(171) 555-9199' },
        { 'ID': 'DRACD', 'CompanyName': 'Drachenblut Delikatessen', 'ContactName': 'Sven Ottlieb', 'ContactTitle': 'Order Administrator', 'Address': 'Walserweg 21', 'City': 'Aachen', 'Region': null, 'PostalCode': '52066', 'Country': 'Germany', 'Phone': '0241-039123', 'Fax': '0241-059428' },
        { 'ID': 'DUMON', 'CompanyName': 'Du monde entier', 'ContactName': 'Janine Labrune', 'ContactTitle': 'Owner', 'Address': '67, rue des Cinquante Otages', 'City': 'Nantes', 'Region': null, 'PostalCode': '44000', 'Country': 'France', 'Phone': '40.67.88.88', 'Fax': '40.67.89.89' },
        { 'ID': 'EASTC', 'CompanyName': 'Eastern Connection', 'ContactName': 'Ann Devon', 'ContactTitle': 'Sales Agent', 'Address': '35 King George', 'City': 'London', 'Region': null, 'PostalCode': 'WX3 6FW', 'Country': 'UK', 'Phone': '(171) 555-0297', 'Fax': '(171) 555-3373' },
        { 'ID': 'ERNSH', 'CompanyName': 'Ernst Handel', 'ContactName': 'Roland Mendel', 'ContactTitle': 'Sales Manager', 'Address': 'Kirchgasse 6', 'City': 'Graz', 'Region': null, 'PostalCode': '8010', 'Country': 'Austria', 'Phone': '7675-3425', 'Fax': '7675-3426' },
        { 'ID': 'FAMIA', 'CompanyName': 'Familia Arquibaldo', 'ContactName': 'Aria Cruz', 'ContactTitle': 'Marketing Assistant', 'Address': 'Rua Orós, 92', 'City': 'Sao Paulo', 'Region': 'SP', 'PostalCode': '05442-030', 'Country': 'Brazil', 'Phone': '(11) 555-9857', 'Fax': null },
        { 'ID': 'FISSA', 'CompanyName': 'FISSA Fabrica Inter. Salchichas S.A.', 'ContactName': 'Diego Roel', 'ContactTitle': 'Accounting Manager', 'Address': 'C/ Moralzarzal, 86', 'City': 'Madrid', 'Region': null, 'PostalCode': '28034', 'Country': 'Spain', 'Phone': '(91) 555 94 44', 'Fax': '(91) 555 55 93' },
        { 'ID': 'FOLIG', 'CompanyName': 'Folies gourmandes', 'ContactName': 'Martine Rancé', 'ContactTitle': 'Assistant Sales Agent', 'Address': '184, chaussée de Tournai', 'City': 'Lille', 'Region': null, 'PostalCode': '59000', 'Country': 'France', 'Phone': '20.16.10.16', 'Fax': '20.16.10.17' },
        { 'ID': 'FOLKO', 'CompanyName': 'Folk och fä HB', 'ContactName': 'Maria Larsson', 'ContactTitle': 'Owner', 'Address': 'Åkergatan 24', 'City': 'Bräcke', 'Region': null, 'PostalCode': 'S-844 67', 'Country': 'Sweden', 'Phone': '0695-34 67 21', 'Fax': null },
        { 'ID': 'FRANK', 'CompanyName': 'Frankenversand', 'ContactName': 'Peter Franken', 'ContactTitle': 'Marketing Manager', 'Address': 'Berliner Platz 43', 'City': 'München', 'Region': null, 'PostalCode': '80805', 'Country': 'Germany', 'Phone': '089-0877310', 'Fax': '089-0877451' },
        { 'ID': 'FRANR', 'CompanyName': 'France restauration', 'ContactName': 'Carine Schmitt', 'ContactTitle': 'Marketing Manager', 'Address': '54, rue Royale', 'City': 'Nantes', 'Region': null, 'PostalCode': '44000', 'Country': 'France', 'Phone': '40.32.21.21', 'Fax': '40.32.21.20' },
        { 'ID': 'FRANS', 'CompanyName': 'Franchi S.p.A.', 'ContactName': 'Paolo Accorti', 'ContactTitle': 'Sales Representative', 'Address': 'Via Monte Bianco 34', 'City': 'Torino', 'Region': null, 'PostalCode': '10100', 'Country': 'Italy', 'Phone': '011-4988260', 'Fax': '011-4988261' }
    ];
    // tslint:enable:max-line-length

    constructor(private cdr: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        this.cdr.detectChanges();
    }

}
