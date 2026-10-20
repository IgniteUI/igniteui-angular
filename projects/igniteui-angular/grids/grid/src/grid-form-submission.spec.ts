import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { FilterMode, IgxAdvancedFilteringDialogComponent, IgxColumnActionsComponent, IgxColumnComponent, IgxColumnHidingDirective, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent } from 'igniteui-angular/grids/core';
import { AbsoluteScrollStrategy, GlobalPositionStrategy } from 'igniteui-angular/core';
import { IgxInputDirective } from 'igniteui-angular/input-group';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { QueryBuilderFunctions } from '../../../query-builder/src/query-builder/query-builder-functions.spec';

const FILTER_UI_ROW = 'igx-grid-filtering-row';
const UNTYPED_BUTTONS = 'button:not([type]), button[type=submit]';

const DATA = [
    { ProductID: 1, ProductName: 'Chai', InStock: true },
    { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false },
    { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true }
];

const pressEnter = (target: Element): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
};

const addAdvancedFilteringCondition = (fixture: ComponentFixture<any>): HTMLInputElement => {
    QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fixture, 0);
    tick(100);
    fixture.detectChanges();
    QueryBuilderFunctions.selectColumnInEditModeExpression(fixture, 1); // 'ProductName'
    QueryBuilderFunctions.selectOperatorInEditModeExpression(fixture, 2); // 'Starts With'
    return QueryBuilderFunctions.getQueryBuilderValueInput(fixture)!.querySelector('input')!;
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
        tick();
        fixture.detectChanges();
        grid = fixture.componentInstance.grid;
        form = fixture.nativeElement.querySelector('form');
    }));

    it('should not render buttons which can become the default button of the form', () => {
        expect(grid.nativeElement.querySelectorAll(UNTYPED_BUTTONS).length).toBe(0);
        const defaultButton = form.querySelector('button:not([type]), button[type=submit], input[type=submit]');
        expect(defaultButton!.id).toBe('submit');
    });

    it('should prevent implicit submission on Enter in the filtering row input', fakeAsync(() => {
        GridFunctions.clickFilterCellChipUI(fixture, 'ProductName');
        tick();
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css(FILTER_UI_ROW)).query(By.directive(IgxInputDirective));
        expect(input.nativeElement.form).toBe(form);
        expect(pressEnter(input.nativeElement).defaultPrevented).toBeTrue();
    }));

    it('should prevent implicit submission on Enter in a cell editor', () => {
        const cell = grid.getCellByColumn(0, 'ProductName');
        cell.editMode = true;
        fixture.detectChanges();

        const input: HTMLInputElement = grid.nativeElement.querySelector('.igx-grid__td--editing input')!;
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBeTrue();
    });

    it('should prevent implicit submission on Enter in the toolbar column hiding search input', fakeAsync(() => {
        const hidingButton: HTMLButtonElement = fixture.nativeElement.querySelector('igx-grid-toolbar-hiding button');
        hidingButton.click();
        tick();
        fixture.detectChanges();

        const input: HTMLInputElement = grid.nativeElement.querySelector('igx-column-actions input')!;
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBeTrue();
    }));

    it('should prevent implicit submission on Enter in the excel style filtering custom dialog input', fakeAsync(() => {
        grid.filterMode = FilterMode.excelStyleFilter;
        fixture.detectChanges();

        GridFunctions.clickExcelFilterIconFromCode(fixture, grid, 'ProductName');
        GridFunctions.clickExcelFilterCascadeButton(fixture);
        tick(100);
        fixture.detectChanges();
        GridFunctions.clickOperatorFromCascadeMenu(fixture, 0);
        tick(100);
        fixture.detectChanges();

        const input = GridFunctions.getExcelFilteringInput(fixture, 0);
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBeTrue();
    }));

    it('should prevent implicit submission on Enter in the advanced filtering dialog input', fakeAsync(() => {
        grid.openAdvancedFilteringDialog();
        fixture.detectChanges();

        const input = addAdvancedFilteringCondition(fixture);
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBeTrue();

        grid.closeAdvancedFilteringDialog(false);
        tick(100);
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
        expect(pressEnter(input).defaultPrevented).toBeTrue();

        grid.closeAdvancedFilteringDialog(false);
        tick(100);
    }));

    it('should not prevent the native Enter activation of buttons inside the grid', () => {
        const hidingButton: HTMLButtonElement = fixture.nativeElement.querySelector('igx-grid-toolbar-hiding button');
        expect(pressEnter(hidingButton).defaultPrevented).toBeFalse();
    });

    it('should not affect implicit submission from inputs outside the grid', () => {
        const outerInput: HTMLInputElement = fixture.nativeElement.querySelector('#outerInput');
        expect(pressEnter(outerInput).defaultPrevented).toBeFalse();
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
        tick();
        fixture.detectChanges();
        form = fixture.nativeElement.querySelector('form');
    }));

    it('should prevent implicit submission on Enter in the standalone column actions filter input', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#standaloneActions input');
        expect(fixture.componentInstance.grid.nativeElement.contains(input)).toBeFalse();
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBeTrue();
    });

    it('should prevent implicit submission on Enter in the standalone advanced filtering dialog input', fakeAsync(() => {
        const input = addAdvancedFilteringCondition(fixture);
        expect(fixture.componentInstance.grid.nativeElement.contains(input)).toBeFalse();
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBeTrue();
    }));
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
            <igx-column field="InStock" [dataType]="'boolean'"></igx-column>
        </igx-grid>
        <button id="submit" type="submit">Submit</button>
    </form>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarActionsComponent,
        IgxGridToolbarHidingComponent
    ]
})
class GridInFormComponent {
    @ViewChild('grid', { static: true })
    public grid!: IgxGridComponent;

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
        <igx-advanced-filtering-dialog [grid]="grid"></igx-advanced-filtering-dialog>
        <button id="submit" type="submit">Submit</button>
    </form>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxColumnActionsComponent,
        IgxColumnHidingDirective,
        IgxAdvancedFilteringDialogComponent
    ]
})
class GridComponentsInFormComponent {
    @ViewChild('grid', { static: true })
    public grid!: IgxGridComponent;

    public data = DATA;
}
