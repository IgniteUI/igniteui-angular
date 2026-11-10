import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { FilterMode, IgxAdvancedFilteringDialogComponent, IgxCellTemplateDirective, IgxColumnActionsComponent, IgxColumnComponent, IgxColumnHidingDirective, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent } from 'igniteui-angular/grids/core';
import { AbsoluteScrollStrategy, GlobalPositionStrategy } from 'igniteui-angular/core';
import { IgxInputDirective } from 'igniteui-angular/input-group';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { GridFunctions } from '../../../test-utils/grid-functions.spec';
import { QueryBuilderFunctions } from '../../../query-builder/src/query-builder/query-builder-functions.spec';
import { firstValueFrom } from 'rxjs';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, beforeEach } from 'vitest';

const FILTER_UI_ROW = 'igx-grid-filtering-row';
const UNTYPED_BUTTONS = 'button:not([type]), button[type=submit]';

const DATA = [
    { ProductID: 1, ProductName: 'Chai', InStock: true, Released: new Date(2024, 0, 10) },
    { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, Released: new Date(2024, 1, 11) },
    { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, Released: new Date(2024, 2, 12) }
];

const pressEnter = (target: Element): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, composed: true });
    target.dispatchEvent(event);
    return event;
};

const SHADOW_CONTROLS_TAG = 'igx-test-shadow-controls';
if (!customElements.get(SHADOW_CONTROLS_TAG)) {
    customElements.define(SHADOW_CONTROLS_TAG, class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' }).innerHTML =
                '<button type="button"><span>Click</span></button><textarea></textarea><a href="#">Link</a>';
        }
    });
}

const addAdvancedFilteringCondition = async (fixture: ComponentFixture<any>): Promise<HTMLInputElement> => {
    QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fixture, 0);
    await fixture.whenStable();
    fixture.detectChanges();
    await QueryBuilderFunctions.selectColumnInEditModeExpression(fixture, 1); // 'ProductName'
    await QueryBuilderFunctions.selectOperatorInEditModeExpression(fixture, 2); // 'Starts With'
    return QueryBuilderFunctions.getQueryBuilderValueInput(fixture)!.querySelector('input')!;
};

describe('IgxGrid - implicit form submission #grid', () => {
    let fixture: ComponentFixture<GridInFormComponent>;
    let grid: IgxGridComponent;
    let form: HTMLFormElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, GridInFormComponent]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(GridInFormComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        grid = fixture.componentInstance.grid;
        form = fixture.nativeElement.querySelector('form');
    });

    it('should not render buttons which can become the default button of the form', () => {
        expect(grid.nativeElement.querySelectorAll(UNTYPED_BUTTONS).length).toBe(0);
        const defaultButton = form.querySelector('button:not([type]), button[type=submit], input[type=submit]');
        expect(defaultButton!.id).toBe('submit');
    });

    it('should prevent implicit submission on Enter in the filtering row input', async () => {
        GridFunctions.clickFilterCellChipUI(fixture, 'ProductName');
        await fixture.whenStable();
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css(FILTER_UI_ROW)).query(By.directive(IgxInputDirective));
        expect(input.nativeElement.form).toBe(form);
        expect(pressEnter(input.nativeElement).defaultPrevented).toBe(true);
    });

    it('should prevent implicit submission on Enter in a cell editor', () => {
        const cell = grid.getCellByColumn(0, 'ProductName');
        cell.editMode = true;
        fixture.detectChanges();

        const input: HTMLInputElement = grid.nativeElement.querySelector('.igx-grid__td--editing input')!;
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBe(true);
    });

    it('should prevent implicit submission on Enter in the toolbar column hiding search input', async () => {
        const hidingButton: HTMLButtonElement = fixture.nativeElement.querySelector('igx-grid-toolbar-hiding button');
        hidingButton.click();
        await fixture.whenStable();
        fixture.detectChanges();

        const input: HTMLInputElement = grid.nativeElement.querySelector('igx-column-actions input')!;
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBe(true);
    });

    it('should prevent implicit submission on Enter in the excel style filtering custom dialog input', async () => {
        grid.filterMode = FilterMode.excelStyleFilter;
        fixture.detectChanges();

        await GridFunctions.clickExcelFilterIconFromCode(fixture, grid, 'ProductName');
        GridFunctions.clickExcelFilterCascadeButton(fixture);
        await fixture.whenStable();
        fixture.detectChanges();
        GridFunctions.clickOperatorFromCascadeMenu(fixture, 0);
        await fixture.whenStable();
        fixture.detectChanges();

        const input = GridFunctions.getExcelFilteringInput(fixture, 0);
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBe(true);
    });

    it('should prevent implicit submission on Enter in the advanced filtering dialog input', async () => {
        grid.openAdvancedFilteringDialog();
        fixture.detectChanges();

        const input = await addAdvancedFilteringCondition(fixture);
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBe(true);

        grid.closeAdvancedFilteringDialog(false);
        await fixture.whenStable();
    });

    it('should prevent implicit submission on Enter in the advanced filtering dialog opened with custom overlay settings', async () => {
        grid.openAdvancedFilteringDialog({
            closeOnOutsideClick: false,
            modal: false,
            positionStrategy: new GlobalPositionStrategy(),
            scrollStrategy: new AbsoluteScrollStrategy()
        });
        await fixture.whenStable();
        fixture.detectChanges();

        const input = await addAdvancedFilteringCondition(fixture);
        expect(grid.nativeElement.contains(input)).toBe(false);
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBe(true);

        grid.closeAdvancedFilteringDialog(false);
        await fixture.whenStable();
    });

    it('should not submit the form on Enter in a filtering row date picker calendar, which moves the focus to its input', async () => {
        GridFunctions.clickFilterCellChipUI(fixture, 'Released');
        await fixture.whenStable();
        fixture.detectChanges();

        const filteringRow = fixture.debugElement.query(By.css(FILTER_UI_ROW));
        const datePicker = filteringRow.query(By.directive(IgxDatePickerComponent)).componentInstance as IgxDatePickerComponent;
        const opened = firstValueFrom(datePicker.opened);
        (datePicker.getEditElement() as HTMLElement).click();
        fixture.detectChanges();
        await opened;
        await fixture.whenStable();
        fixture.detectChanges();
        expect(document.activeElement!.closest('igx-calendar')).not.toBeNull();

        await userEvent.keyboard('{Enter}');
        await fixture.whenStable();
        fixture.detectChanges();

        expect(datePicker.collapsed).toBe(true);
        expect((document.activeElement as HTMLInputElement).form).toBe(form);
        expect(fixture.componentInstance.submits).toBe(0);
    });

    it('should submit the form on Enter in an input outside the grid', async () => {
        await userEvent.click(fixture.nativeElement.querySelector('#outerInput'));
        await userEvent.keyboard('{Enter}');
        expect(fixture.componentInstance.submits).toBe(1);
    });

    it('should not prevent the native Enter activation of buttons inside the grid', () => {
        const hidingButton: HTMLButtonElement = fixture.nativeElement.querySelector('igx-grid-toolbar-hiding button');
        expect(pressEnter(hidingButton).defaultPrevented).toBe(false);
    });

    it('should not prevent the native Enter behavior of controls inside a shadow root in the grid', () => {
        const shadowRoot = fixture.nativeElement.querySelector(SHADOW_CONTROLS_TAG).shadowRoot as ShadowRoot;
        expect(grid.nativeElement.contains(shadowRoot.host)).toBe(true);

        expect(pressEnter(shadowRoot.querySelector('button span')!).defaultPrevented).toBe(false);
        expect(pressEnter(shadowRoot.querySelector('textarea')!).defaultPrevented).toBe(false);
        expect(pressEnter(shadowRoot.querySelector('a')!).defaultPrevented).toBe(false);
    });

    it('should not prevent the native Enter behavior of other elements inside the grid', () => {
        const cell: HTMLElement = fixture.nativeElement.querySelector(SHADOW_CONTROLS_TAG).parentElement;
        expect(cell.querySelector<HTMLInputElement>('input[type=file]')!.form).toBe(form);

        expect(pressEnter(cell.querySelector('summary')!).defaultPrevented).toBe(false);
        expect(pressEnter(cell.querySelector('input[type=file]')!).defaultPrevented).toBe(false);
        expect(pressEnter(cell.querySelector('input[type=color]')!).defaultPrevented).toBe(false);
    });

    it('should not affect implicit submission from inputs outside the grid', () => {
        const outerInput: HTMLInputElement = fixture.nativeElement.querySelector('#outerInput');
        expect(pressEnter(outerInput).defaultPrevented).toBe(false);
    });
});

describe('IgxGrid - implicit form submission from grid components outside of the grid #grid', () => {
    let fixture: ComponentFixture<GridComponentsInFormComponent>;
    let form: HTMLFormElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, GridComponentsInFormComponent]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(GridComponentsInFormComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        form = fixture.nativeElement.querySelector('form');
    });

    it('should prevent implicit submission on Enter in the standalone column actions filter input', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#standaloneActions input');
        expect(fixture.componentInstance.grid.nativeElement.contains(input)).toBe(false);
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBe(true);
    });

    it('should prevent implicit submission on Enter in the standalone advanced filtering dialog input', async () => {
        const input = await addAdvancedFilteringCondition(fixture);
        expect(fixture.componentInstance.grid.nativeElement.contains(input)).toBe(false);
        expect(input.form).toBe(form);
        expect(pressEnter(input).defaultPrevented).toBe(true);
    });
});

@Component({
    template: `
    <form (submit)="$event.preventDefault(); submits = submits + 1">
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
                    <igx-test-shadow-controls></igx-test-shadow-controls>
                    <details><summary>Details</summary>Content</details>
                    <input type="file" />
                    <input type="color" />
                </ng-template>
            </igx-column>
            <igx-column field="Released" [dataType]="'date'" [editable]="true"></igx-column>
        </igx-grid>
        <button id="submit" type="submit">Submit</button>
    </form>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    public grid!: IgxGridComponent;

    public data = DATA;
    public submits = 0;
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
