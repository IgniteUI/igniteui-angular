import { Component } from '@angular/core';
import { TestBed, fakeAsync, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxCsvExporterService, IgxExcelExporterService } from '../../services/public_api';
import { IgxGridModule } from './public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';


const TOOLBAR_TAG = 'igx-grid-toolbar';
const TOOLBAR_TITLE_TAG = 'igx-grid-toolbar-title';
const TOOLBAR_ACTIONS_TAG = 'igx-grid-toolbar-actions';
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
        TestBed.configureTestingModule({
            declarations: [
                DefaultToolbarComponent,
                ToolbarActionsComponent
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

        it('default toolbar title is rendered', () => {
            const titleEl = $(TOOLBAR_TITLE_TAG);
            expect(titleEl).toBeInstanceOf(HTMLElement);
            expect(titleEl.textContent).toMatch('');
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
    `
})
export class DefaultToolbarComponent {
    toolbarEnabled = true;
    toolbarTitle = 'Custom title';
    toolbarTitleEnabled = false;
    customContentEnabled = false;
    customContent = 'Custom Content';
    toolbarActionsEnabled = false;
    showProgress = false;
    data = [];

    constructor() {
        this.data = [...DATA];
    }
}

@Component({
    template: `
    <igx-grid [data]="data" [autoGenerate]="true">
        <igx-grid-toolbar>
            <igx-grid-toolbar-actions>
                <igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
                <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
                <igx-grid-toolbar-advanced-filtering>
                    {{ advancedFilteringTitle }}
                </igx-grid-toolbar-advanced-filtering>
                <igx-grid-toolbar-exporter [exportCSV]="exportCSV" [exportExcel]="exportExcel" [filename]="exportFilename">
                    {{ exporterText }}
                    <span id="excelEntry" excelText>{{ customExcelText }}</span>
                    <span id="csvEntry" csvText>{{ customCSVText }}</span>
                </igx-grid-toolbar-exporter>
            </igx-grid-toolbar-actions>
        </igx-grid-toolbar>
    </igx-grid>
    `
})
export class ToolbarActionsComponent {
    data  = [];
    advancedFilteringTitle = 'Custom button text';
    exportCSV = true;
    exportExcel = true;
    exportFilename = '';
    exporterText = 'Exporter Options';
    customExcelText = '<< Excel export >>';
    customCSVText = '<< CSV export >>';

    constructor() {
        this.data = [...DATA];
    }
}
