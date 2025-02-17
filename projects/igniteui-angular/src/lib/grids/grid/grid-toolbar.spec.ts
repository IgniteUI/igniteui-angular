import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, ComponentFixture, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AbsoluteScrollStrategy, GlobalPositionStrategy, IgxCsvExporterService, IgxExcelExporterService } from '../../services/public_api';
import { IgxGridComponent } from './public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions } from "../../test-utils/grid-functions.spec";
import { By } from "@angular/platform-browser";
import { IgxGridToolbarComponent } from '../toolbar/grid-toolbar.component';
import { NgIf } from '@angular/common';
import { IgxGridToolbarActionsComponent, IgxGridToolbarTitleComponent } from '../toolbar/common';
import { IgxGridToolbarPinningComponent } from '../toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarHidingComponent } from '../toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarAdvancedFilteringComponent } from '../toolbar/grid-toolbar-advanced-filtering.component';
import { IgxGridToolbarExporterComponent } from '../toolbar/grid-toolbar-exporter.component';

const TOOLBAR_TAG = 'igx-grid-toolbar';
const TOOLBAR_TITLE_TAG = 'igx-grid-toolbar-title';
const TOOLBAR_ACTIONS_TAG = 'igx-grid-toolbar-actions';
const TOOLBAR_PINNING_TAG = 'igx-grid-toolbar-pinning';
const TOOLBAR_HIDING_TAG = 'igx-grid-toolbar-hiding';
const TOOLBAR_ADVANCED_FILTERING_TAG = 'igx-grid-toolbar-advanced-filtering';
const TOOLBAR_EXPORTER_TAG = 'igx-grid-toolbar-exporter';

const DATA = [
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

describe('IgxGrid - Grid Toolbar #grid - ', () => {
    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                DefaultToolbarComponent,
                ToolbarActionsComponent
            ],
            providers: [
                IgxExcelExporterService,
                IgxCsvExporterService
            ]
        });
    }));

    describe('Basic Tests - ', () => {
        let fixture: ComponentFixture<DefaultToolbarComponent>;

        const $ = (selector: string) => fixture.debugElement.nativeElement.querySelector(selector) as HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(DefaultToolbarComponent);
            fixture.detectChanges();
        }));

        it ('toolbar is rendered when declared between grid tags', () => {
            expect($(TOOLBAR_TAG)).toBeInstanceOf(HTMLElement);
        });

        it('toolbar can be conditionally rendered', () => {
            fixture.componentInstance.toolbarEnabled = false;
            fixture.detectChanges();
            expect($(TOOLBAR_TAG)).toBeNull();
        });

        it('toolbar title can be set through content projection', () => {
            const newTitle = '1234567890';
            fixture.componentInstance.toolbarTitle = newTitle;
            fixture.componentInstance.toolbarTitleEnabled = true;
            fixture.detectChanges();

            const titleEl = $(TOOLBAR_TITLE_TAG);
            expect(titleEl).toBeInstanceOf(HTMLElement);
            expect(titleEl.textContent).toMatch(newTitle);
        });

        it('default toolbar actions are rendered', () => {
            const actionsEl = $(TOOLBAR_ACTIONS_TAG);
            expect(actionsEl).toBeInstanceOf(HTMLElement);
        });

        it('toolbar actions can be set through content projection', () => {
            fixture.componentInstance.toolbarActionsEnabled = true;
            fixture.detectChanges();
            const actionsEl = $(TOOLBAR_ACTIONS_TAG);
            expect(actionsEl).toBeInstanceOf(HTMLElement);
            expect(actionsEl.textContent).toMatch('');
        });

        it('toolbar default content projection', () => {
            fixture.componentInstance.customContentEnabled = true;
            fixture.detectChanges();
            const contentEl = $('p');
            expect(contentEl.textContent).toMatch(fixture.componentInstance.customContent);
        });

        it('toolbar progress indicator prop', () => {
            fixture.componentInstance.showProgress = true;
            fixture.detectChanges();
            const barEl = $('igx-linear-bar');
            expect(barEl).toBeInstanceOf(HTMLElement);
        });
    });

    describe('Toolbar actions - ', () => {
        let fixture: ComponentFixture<ToolbarActionsComponent>;
        let instance: ToolbarActionsComponent;

        const $ = (selector: string) => fixture.debugElement.nativeElement.querySelector(selector) as HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ToolbarActionsComponent);
            fixture.detectChanges();
            instance = fixture.componentInstance;
        }));

        it('the buttons type should be set to "button"', fakeAsync(() => {
            tick();
            fixture.detectChanges();

            const pinningButtonType = $(TOOLBAR_PINNING_TAG).querySelector('button').getAttributeNode('type').value;
            const hidingButtonType = $(TOOLBAR_HIDING_TAG).querySelector('button').getAttributeNode('type').value;
            const advancedFilteringButtonType = $(TOOLBAR_ADVANCED_FILTERING_TAG).querySelector('button').getAttributeNode('type').value;
            const exporterButtonType = $(TOOLBAR_EXPORTER_TAG).querySelector('button').getAttributeNode('type').value;

            const expectedButtonType = 'button';

            expect(pinningButtonType).toBe(expectedButtonType);
            expect(hidingButtonType).toBe(expectedButtonType);
            expect(advancedFilteringButtonType).toBe(expectedButtonType);
            expect(exporterButtonType).toBe(expectedButtonType);
        }));

        it('toolbar exporter props', () => {
            const exporterButton = $(TOOLBAR_EXPORTER_TAG).querySelector('button');

            instance.exportCSV = false;
            instance.exportExcel = false;
            exporterButton.click();
            fixture.detectChanges();

            expect($('#excelEntry')).toBeNull();
            expect($('#csvEntry')).toBeNull();

            exporterButton.click();
            fixture.detectChanges();

            instance.exportCSV = true;
            instance.exportExcel = true;
            exporterButton.click();
            fixture.detectChanges();

            expect($('#excelEntry')).not.toBeNull();
            expect($('#csvEntry')).not.toBeNull();
        });

        it('toolbar exporter content projection', () => {
            expect($(TOOLBAR_EXPORTER_TAG).textContent).toMatch(instance.exporterText);
        });

        it('toolbar exporter dropdown entries', () => {
            $(TOOLBAR_EXPORTER_TAG).querySelector('button').click();
            fixture.detectChanges();

            expect($('igx-column-actions')).toBeInstanceOf(HTMLElement);
            expect($('#excelEntry').textContent).toMatch(instance.customExcelText);
            expect($('#csvEntry').textContent).toMatch(instance.customCSVText);
        });

        it('Setting overlaySettings for each toolbar columns action', () => {
            const defaultSettings = instance.pinningAction.overlaySettings;
            const defaultFiltSettings = instance.advancedFiltAction.overlaySettings;
            const defaultExportSettings = instance.exporterAction.overlaySettings;

            instance.pinningAction.overlaySettings = instance.overlaySettings;
            instance.hidingAction.overlaySettings = instance.overlaySettings;
            fixture.detectChanges();

            expect(defaultSettings).not.toEqual(instance.pinningAction.overlaySettings);
            expect(defaultSettings).not.toEqual(instance.hidingAction.overlaySettings);
            expect(defaultFiltSettings).toEqual(instance.advancedFiltAction.overlaySettings);
            expect(defaultExportSettings).toEqual(instance.exporterAction.overlaySettings);

            instance.advancedFiltAction.overlaySettings = instance.overlaySettings;
            instance.exporterAction.overlaySettings = instance.overlaySettings;
            fixture.detectChanges();

            expect(defaultFiltSettings).not.toEqual(instance.advancedFiltAction.overlaySettings);
            expect(defaultExportSettings).not.toEqual(instance.exporterAction.overlaySettings);
        });

        it('should initialize input property columnsAreaMaxHeight properly', fakeAsync(() => {
            expect(instance.pinningAction.columnsAreaMaxHeight).toEqual('100%');

            instance.pinningAction.columnsAreaMaxHeight = '10px';
            fixture.detectChanges();

            expect(instance.pinningAction.columnsAreaMaxHeight).toEqual('10px');

            const pinningButton = GridFunctions.getColumnPinningButton(fixture);
            pinningButton.click();
            tick();
            fixture.detectChanges()
            const element = fixture.debugElement.query(By.css('.igx-column-actions__columns'));
            expect(element.attributes.style).toBe('max-height: 10px;');

            expect(instance.pinningAction.columnsAreaMaxHeight).toEqual('10px');
        }));

        it('should emit columnToggle event when a column is shown/hidden via the column hiding action', fakeAsync(() => {
            const spy = spyOn(instance.hidingAction.columnToggle, 'emit');
            const hidingUI = $(TOOLBAR_HIDING_TAG);
            const grid = fixture.componentInstance.grid;
            fixture.detectChanges();
            const hidingActionButton = hidingUI.querySelector('button');
            const columnChooserElement = GridFunctions.getColumnHidingElement(fixture);

            hidingActionButton.click();
            tick();
            fixture.detectChanges();

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ProductID');
            fixture.detectChanges();

            expect(instance.hidingAction.columnToggle.emit).toHaveBeenCalledTimes(1);
            expect(instance.hidingAction.columnToggle.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ProductID'), checked: false });

            // test after closing and reopening the hiding UI
            spy.calls.reset();
            hidingActionButton.click();
            tick();
            fixture.detectChanges();

            hidingActionButton.click();
            tick();
            fixture.detectChanges();

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ProductID');
            fixture.detectChanges();

            expect(instance.hidingAction.columnToggle.emit).toHaveBeenCalledTimes(1);
            expect(instance.hidingAction.columnToggle.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ProductID'), checked: true });
        }));
    });
});

@Component({
    template: `
    <igx-grid [data]="data" [autoGenerate]="true">
        <igx-grid-toolbar [showProgress]="showProgress" *ngIf="toolbarEnabled">
            <p *ngIf="customContentEnabled">{{ customContent }}</p>
            <igx-grid-toolbar-title *ngIf="toolbarTitleEnabled">{{ toolbarTitle }}</igx-grid-toolbar-title>
            <igx-grid-toolbar-actions *ngIf="toolbarActionsEnabled"></igx-grid-toolbar-actions>
        </igx-grid-toolbar>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarTitleComponent, NgIf]
})
export class DefaultToolbarComponent {
    public toolbarEnabled = true;
    public toolbarTitle = 'Custom title';
    public toolbarTitleEnabled = false;
    public customContentEnabled = false;
    public customContent = 'Custom Content';
    public toolbarActionsEnabled = false;
    public showProgress = false;
    public data = [];

    constructor() {
        this.data = [...DATA];
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" [autoGenerate]="true">
        <igx-grid-toolbar>
            <igx-grid-toolbar-actions>
                <igx-grid-toolbar-pinning #pinningAction></igx-grid-toolbar-pinning>
                <igx-grid-toolbar-hiding #hidingAction ></igx-grid-toolbar-hiding>
                <igx-grid-toolbar-advanced-filtering #advancedFiltAction>
                    {{ advancedFilteringTitle }}
                </igx-grid-toolbar-advanced-filtering>
                <igx-grid-toolbar-exporter #exporterAction [exportCSV]="exportCSV" [exportExcel]="exportExcel" [filename]="exportFilename">
                    {{ exporterText }}
                    <span id="excelEntry" excelText>{{ customExcelText }}</span>
                    <span id="csvEntry" csvText>{{ customCSVText }}</span>
                </igx-grid-toolbar-exporter>
            </igx-grid-toolbar-actions>
        </igx-grid-toolbar>
    </igx-grid>
    `,
    imports: [
        IgxGridComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarActionsComponent,
        IgxGridToolbarTitleComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarAdvancedFilteringComponent,
        IgxGridToolbarExporterComponent
    ]
})
export class ToolbarActionsComponent {
    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    @ViewChild('pinningAction', {static: true})
    public pinningAction;

    @ViewChild('hidingAction', {static: true})
    public hidingAction;

    @ViewChild('advancedFiltAction', {static: true})
    public advancedFiltAction;

    @ViewChild('exporterAction', {static: true})
    public exporterAction;

    public data  = [];
    public advancedFilteringTitle = 'Custom button text';
    public exportCSV = true;
    public exportExcel = true;
    public exportFilename = '';
    public exporterText = 'Exporter Options';
    public customExcelText = '<< Excel export >>';
    public customCSVText = '<< CSV export >>';
    public overlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: true,
        closeOnEscape: false
    };

    constructor() {
        this.data = [...DATA];
    }
}
