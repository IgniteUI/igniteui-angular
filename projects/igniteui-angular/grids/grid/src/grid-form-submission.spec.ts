import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { FilterMode, INPUT_DEBOUNCE_TIME_DEFAULT, IgxCellTemplateDirective, IgxColumnActionsComponent, IgxColumnComponent, IgxColumnHidingDirective, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent } from 'igniteui-angular/grids/core';
import { AbsoluteScrollStrategy, GlobalPositionStrategy } from 'igniteui-angular/core';
import { IgxInputDirective } from 'igniteui-angular/input-group';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { QueryBuilderFunctions } from '../../../query-builder/src/query-builder/query-builder-functions.spec';

const FILTER_UI_ROW = 'igx-grid-filtering-row';
const UNTYPED_BUTTONS = 'button:not([type]), button[type=submit]';

const DATA = [
    { ProductID: 1, ProductName: 'Chai', InStock: true, Released: new Date(2024, 0, 10) },
    { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, Released: new Date(2024, 1, 11) },
    { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, Released: new Date(2024, 2, 12) }
];

/**
 * Dispatches a keyboard event on the target and returns it.
 * The browser performs the implicit submission as the default action of the Enter key, so a cancelled event does not submit the form.
 */
const pressKey = (target: Element, key = 'Enter', type = 'keydown'): KeyboardEvent => {
    const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true, composed: true });
    target.dispatchEvent(event);
    return event;
};

const addAdvancedFilteringCondition = (fixture: ComponentFixture<any>): HTMLInputElement => {
    QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fixture, 0);
    tick(100);
    fixture.detectChanges();
    QueryBuilderFunctions.selectColumnInEditModeExpression(fixture, 1); // 'ProductName'
    QueryBuilderFunctions.selectOperatorInEditModeExpression(fixture, 2); // 'Starts With'
    return QueryBuilderFunctions.getQueryBuilderValueInput(fixture).querySelector('input');
};

describe('IgxGrid - implicit form submission #grid', () => {
    let fixture: ComponentFixture<GridInFormComponent>;
    let grid: IgxGridComponent;
    let form: HTMLFormElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, GridInFormComponent]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(GridInFormComponent);
        fixture.detectChanges();
        tick(100);
        fixture.detectChanges();
        grid = fixture.componentInstance.grid;
        form = fixture.nativeElement.querySelector('form');
    }));

    it('should not render buttons which can become the default button of the form', () => {
        // The add row snackbar is always rendered and was the default button of the form before the fix.
        expect(grid.nativeElement.querySelector('igx-snackbar button').getAttribute('type')).toBe('button');
        expect(grid.nativeElement.querySelectorAll(UNTYPED_BUTTONS).length).toBe(0);
        const defaultButton = form.querySelector('button:not([type]), button[type=submit], input[type=submit]');
        expect(defaultButton.id).toBe('submit');
    });

    it('should prevent implicit submission on Enter in the filtering row input', fakeAsync(() => {
        GridFunctions.clickFilterCellChipUI(fixture, 'ProductName');
        tick(100);
        fixture.detectChanges();

        const input: HTMLInputElement = fixture.debugElement.query(By.css(FILTER_UI_ROW)).query(By.directive(IgxInputDirective)).nativeElement;
        expect(input.form).toBe(form);
        // Typing must keep working: only Enter is cancelled.
        expect(pressKey(input, 'a').defaultPrevented).toBeFalse();

        GridFunctions.typeValueInFilterRowInput('Chai', fixture);
        tick(INPUT_DEBOUNCE_TIME_DEFAULT);
        fixture.detectChanges();

        expect(pressKey(input).defaultPrevented).toBeTrue();
        tick(100);
        fixture.detectChanges();

        expect(grid.rowList.map(row => row.data.ProductName)).toEqual(['Chai']);
    }));

    it('should prevent implicit submission on Enter in a cell editor', () => {
        const cell = grid.getCellByColumn(0, 'ProductName');
        cell.editMode = true;
        fixture.detectChanges();

        const input: HTMLInputElement = grid.nativeElement.querySelector('.igx-grid__td--editing input');
        expect(input.form).toBe(form);
        expect(pressKey(input).defaultPrevented).toBeTrue();
    });

    it('should prevent implicit submission on Enter in the toolbar column hiding search input', fakeAsync(() => {
        const hidingButton: HTMLButtonElement = fixture.nativeElement.querySelector('igx-grid-toolbar-hiding button');
        hidingButton.click();
        tick(100);
        fixture.detectChanges();

        const input: HTMLInputElement = grid.nativeElement.querySelector('igx-column-actions input');
        expect(input.form).toBe(form);
        expect(pressKey(input).defaultPrevented).toBeTrue();
    }));

    it('should prevent implicit submission on Enter in the excel style filtering custom dialog input', fakeAsync(() => {
        grid.filterMode = FilterMode.excelStyleFilter;
        fixture.detectChanges();

        GridFunctions.clickExcelFilterIconFromCode(fixture, grid, 'ProductName');
        GridFunctions.clickExcelFilterCascadeButton(fixture);
        tick(100);
        fixture.detectChanges();
        GridFunctions.clickOperatorFromCascadeMenu(fixture, 0);
        tick(200);
        fixture.detectChanges();

        const input = GridFunctions.getExcelFilteringInput(fixture, 0);
        expect(input.form).toBe(form);
        expect(pressKey(input).defaultPrevented).toBeTrue();
    }));

    it('should prevent implicit submission on Enter in the advanced filtering dialog opened with custom overlay settings', fakeAsync(() => {
        grid.openAdvancedFilteringDialog({
            closeOnOutsideClick: false,
            modal: false,
            positionStrategy: new GlobalPositionStrategy(),
            scrollStrategy: new AbsoluteScrollStrategy()
        });
        tick(100);
        fixture.detectChanges();

        const input = addAdvancedFilteringCondition(fixture);
        expect(grid.nativeElement.contains(input)).toBeFalse();
        expect(input.form).toBe(form);
        expect(pressKey(input).defaultPrevented).toBeTrue();

        grid.closeAdvancedFilteringDialog(false);
        tick(100);
    }));

    it('should prevent implicit submission on Enter in a filtering row date picker calendar, which moves the focus to its input', fakeAsync(() => {
        GridFunctions.clickFilterCellChipUI(fixture, 'Released');
        tick(100);
        fixture.detectChanges();

        const filteringRow = fixture.debugElement.query(By.css(FILTER_UI_ROW));
        const datePicker = filteringRow.query(By.directive(IgxDatePickerComponent)).componentInstance as IgxDatePickerComponent;
        (datePicker.getEditElement() as HTMLElement).click();
        tick(100);
        fixture.detectChanges();
        expect(datePicker.collapsed).toBeFalse();
        expect(document.activeElement.closest('igx-calendar')).not.toBeNull();

        // Selecting a date with Enter closes the picker and focuses its input during the keydown, so the browser
        // performs the implicit submission on the following keypress, which targets that input.
        pressKey(document.activeElement);
        tick(100);
        fixture.detectChanges();

        const pickerInput = document.activeElement as HTMLInputElement;
        expect(datePicker.collapsed).toBeTrue();
        expect(pickerInput.form).toBe(form);
        expect(pressKey(pickerInput, 'Enter', 'keypress').defaultPrevented).toBeTrue();
    }));

    it('should not prevent the native Enter behavior of other elements inside the grid', () => {
        const fileInput = grid.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
        expect(fileInput.form).toBe(form);

        expect(pressKey(grid.nativeElement.querySelector('summary')).defaultPrevented).toBeFalse();
        expect(pressKey(fileInput).defaultPrevented).toBeFalse();
        expect(pressKey(grid.nativeElement.querySelector('input[type=color]')).defaultPrevented).toBeFalse();
    });

    it('should not affect implicit submission from inputs outside the grid', () => {
        const outerInput: HTMLInputElement = fixture.nativeElement.querySelector('#outerInput');
        expect(pressKey(outerInput).defaultPrevented).toBeFalse();
        expect(pressKey(outerInput, 'Enter', 'keypress').defaultPrevented).toBeFalse();
    });
});

describe('IgxGrid - implicit form submission from grid components outside of the grid #grid', () => {
    let fixture: ComponentFixture<GridComponentsInFormComponent>;
    let form: HTMLFormElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, GridComponentsInFormComponent]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(GridComponentsInFormComponent);
        fixture.detectChanges();
        tick(100);
        fixture.detectChanges();
        form = fixture.nativeElement.querySelector('form');
    }));

    it('should prevent implicit submission on Enter in the standalone column actions filter input', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#standaloneActions input');
        expect(fixture.componentInstance.grid.nativeElement.contains(input)).toBeFalse();
        expect(input.form).toBe(form);
        expect(pressKey(input).defaultPrevented).toBeTrue();
    });
});

@Component({
    template: `
    <form (submit)="$event.preventDefault()">
        <input id="outerInput" name="outerInput" type="text" />
        <igx-grid #grid [data]="data" [allowFiltering]="true" [primaryKey]="'ProductID'" height="500px">
            <igx-grid-toolbar>
                <igx-grid-toolbar-actions>
                    <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
                </igx-grid-toolbar-actions>
            </igx-grid-toolbar>
            <igx-column field="ProductID" [dataType]="'number'"></igx-column>
            <igx-column field="ProductName" [editable]="true"></igx-column>
            <igx-column field="InStock" [dataType]="'boolean'">
                <ng-template igxCell>
                    <details><summary>Details</summary>Content</details>
                    <input type="file" />
                    <input type="color" />
                </ng-template>
            </igx-column>
            <igx-column field="Released" [dataType]="'date'" [editable]="true"></igx-column>
        </igx-grid>
        <button id="submit" type="submit">Submit</button>
    </form>`,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxCellTemplateDirective,
        IgxGridToolbarComponent,
        IgxGridToolbarActionsComponent,
        IgxGridToolbarHidingComponent
    ]
})
class GridInFormComponent {
    @ViewChild('grid', { static: true })
    public grid: IgxGridComponent;

    public data = DATA;
}

@Component({
    template: `
    <form (submit)="$event.preventDefault()">
        <igx-grid #grid [data]="data" height="300px">
            <igx-column field="ProductID" [dataType]="'number'"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="InStock" [dataType]="'boolean'"></igx-column>
        </igx-grid>
        <igx-column-actions id="standaloneActions" igxColumnHiding [grid]="grid"></igx-column-actions>
        <button id="submit" type="submit">Submit</button>
    </form>`,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxColumnActionsComponent,
        IgxColumnHidingDirective
    ]
})
class GridComponentsInFormComponent {
    @ViewChild('grid', { static: true })
    public grid: IgxGridComponent;

    public data = DATA;
}
