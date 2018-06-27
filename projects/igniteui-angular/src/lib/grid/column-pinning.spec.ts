
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
                ColumnPinningToggleComponent
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

    beforeEach(() => {
        fix = TestBed.createComponent(ColumnPinningComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
        columnChooser = fix.componentInstance.chooser;
        columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
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
