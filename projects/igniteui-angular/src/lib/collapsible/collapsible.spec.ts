import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, Injectable, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync, flush } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDropDownBase, Navigate } from '../drop-down/drop-down.component';
import { IgxCollapsibleComponent } from './collapsible.component';
import { IgxCollapsibleModule } from './collapsible.module';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxGridComponent, IgxGridModule } from '../grid';
import { IgxListComponent, IgxListModule } from '../list';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxGridAPIService } from '../grid/api.service';

describe('igxCollapsible', () => {
    beforeEach(async(() => {
        // TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                IgxCollapsibleGridComponent,
                IgxCollapsibleListComponent
            ],
            imports: [
                IgxCollapsibleModule,
                NoopAnimationsModule,
                IgxToggleModule,
                IgxRippleModule,
                IgxButtonModule,
                IgxListModule,
                IgxGridModule.forRoot()
            ]
        }).compileComponents();
    }));


    fdescribe('General tests: ', () => {
        it('Should initialize the expansion panel component properly', () => {
            const fixture: ComponentFixture<IgxCollapsibleListComponent> = TestBed.createComponent(IgxCollapsibleListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            expect(fixture.componentInstance).toBeDefined();
            expect(panel).toBeDefined();
            // expect(panel.toggleBtn).toBeDefined();
            // expect(panel.headerButtons).toBeDefined();
            expect(panel.disabled).toBeDefined();
            expect(panel.disabled).toEqual(false);
            // expect(panel.ariaLabelledBy).toBeDefined();
            // expect(panel.ariaLabelledBy).toEqual('');
            // expect(panel.headerButtons).toBeDefined();
            // expect(panel.headerButtons).toEqual(true);
            expect(panel.animationSettings).toBeDefined();
            expect(panel.collapsed).toBeDefined();
            expect(panel.collapsed).toBeTruthy();
            panel.toggle();
            fixture.detectChanges();
            expect(panel.collapsed).toEqual(false);
        });
        it('Should properly accept input properties', () => {
            const fixture = TestBed.createComponent(IgxCollapsibleListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            expect(panel.disabled).toEqual(false);
            expect(panel.collapsed).toEqual(true);
            // expect(panel.ariaLabelledBy).toEqual('');
            // expect(panel.headerButtons).toEqual(true);
            panel.disabled = true;
            expect(panel.disabled).toEqual(true);
            panel.collapsed = false;
            expect(panel.collapsed).toEqual(false);
            panel.ariaLabelledBy = 'test label area';
            expect(panel.ariaLabelledBy).toEqual('test label area');
            panel.headerButtons = false;
            expect(panel.headerButtons).toEqual(false);
        });
    });
});


@Component({
    template: `
    <igx-collapsible #collapsibleItem>
<igx-collapsible-header headerHeight="50px">
                <igx-collapsible-title>Product orders</igx-collapsible-title>
                <igx-collapsible-description>Product orders details</igx-collapsible-description>
            </igx-collapsible-header>
            <igx-collapsible-body>
<igx-grid #grid1 [data] = "data" [autoGenerate]="true" [width]="width" [height]="height">
        </igx-grid>
       </igx-collapsible-body>
</igx-collapsible>
`
})
export class IgxCollapsibleGridComponent {

    @ViewChild('expansionPanel', { read: IgxCollapsibleComponent })
    public expansionPanel: IgxCollapsibleComponent;
    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public width = '800px';
    public height = '600px';

    public data = [
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: '2005-03-21' },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: '2008-01-15' },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: '2010-11-20' },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: '2007-10-11' },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: '2001-07-27' },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: '1990-05-17' },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: '2005-03-03' },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: '2017-09-09' },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: '2025-12-25' },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: '2018-03-01' }
    ];
}

@Component({
    template: `
<div style = "width:300px">
<igx-collapsible #expansionPanel>
<igx-collapsible-header headerHeight="50px">
<igx-collapsible-title>Product List</igx-collapsible-title>
</igx-collapsible-header>
<igx-collapsible-body>
<igx-list>
<igx-list-item [isHeader]="true">Products</igx-list-item>
<igx-list-item>Product 1</igx-list-item>
<igx-list-item>Product 2</igx-list-item>
<igx-list-item>Product 3</igx-list-item>
<igx-list-item>Product 4</igx-list-item>
<igx-list-item>Product 5</igx-list-item>
</igx-list>
</igx-collapsible-body>
</igx-collapsible>
</div>
`
})
export class IgxCollapsibleListComponent {
    @ViewChild('expansionPanel', { read: IgxCollapsibleComponent })
    public expansionPanel: IgxCollapsibleComponent;
}

