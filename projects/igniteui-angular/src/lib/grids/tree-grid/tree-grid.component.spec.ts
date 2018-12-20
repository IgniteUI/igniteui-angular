import { Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './index';
import { IgxTreeGridComponent } from './tree-grid.component';
import { DisplayDensity } from '../../core/displayDensity';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { By } from '@angular/platform-browser';

describe('IgxTreeGrid Component Tests', () => {

    describe('IgxTreeGrid - default rendering for rows and columns', () => {
        configureTestSuite();
        let fix;
        let grid: IgxTreeGridComponent;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxTreeGridWrappedInContComponent
                ],
                imports: [
                    NoopAnimationsModule, IgxTreeGridModule]
            }).compileComponents();
        }));

        it('should match width and height of parent container when width/height are set in %', fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            grid = fix.componentInstance.treeGrid;
            fix.componentInstance.outerWidth = 800;
            fix.componentInstance.outerHeight = 600;
            fix.componentInstance.treeGrid.width = '50%';
            fix.componentInstance.treeGrid.height = '50%';
            tick();
            fix.detectChanges();

            expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
            expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');
            expect(grid.rowList.length).toBeGreaterThan(0);
        }));

        it('should render 10 records if height is unset and parent container\'s height is unset', () => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(fix.componentInstance.treeGrid.rowList.length).toBeGreaterThanOrEqual(10);
        });

        it('should render 10 records if height is 100% and parent container\'s height is unset', fakeAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            fix.componentInstance.treeGrid.height = '600px';
            tick();
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(fix.componentInstance.treeGrid.rowList.length).toBeGreaterThanOrEqual(10);
        }));

        it(`should render all records exactly if height is 100% and parent container\'s height is unset and
            there are fewer than 10 records in the data view`, fakeAsync(() => {
                fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
                fix.componentInstance.treeGrid.height = '100%';
                fix.componentInstance.data = fix.componentInstance.data.slice(0, 1);
                tick();
                fix.detectChanges();
                const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
                expect(defaultHeight).not.toBeNull();
                expect(parseInt(defaultHeight, 10)).toBeGreaterThan(200);
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeFalsy();
                expect(fix.componentInstance.treeGrid.rowList.length).toEqual(6);
        }));

        it(`should render 11 records if height is 100% and parent container\'s height is unset and
            display density is changed`, fakeAsync(() => {
                fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
                fix.componentInstance.treeGrid.height = '100%';
                fix.componentInstance.density = DisplayDensity.compact;
                tick();
                fix.detectChanges();
                const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
                const defaultHeightNum = parseInt(defaultHeight, 10);
                expect(defaultHeight).not.toBeNull();
                expect(defaultHeightNum).toBeGreaterThan(300);
                expect(defaultHeightNum).toBeLessThan(330);
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
                expect(fix.componentInstance.treeGrid.rowList.length).toEqual(11);
        }));
    });

});

@Component({
    template:
        `<div [style.width.px]="outerWidth" [style.height.px]="outerHeight">
            <igx-tree-grid #treeGrid [data]="data" [displayDensity]="density"
                childDataKey="Employees" primaryKey="ID">
                <igx-column [field]="'ID'" dataType="number"></igx-column>
                <igx-column [field]="'Name'" dataType="string"></igx-column>
                <igx-column [field]="'HireDate'" dataType="date"></igx-column>
                <igx-column [field]="'Age'" dataType="number"></igx-column>
        </igx-tree-grid>
        </div>`
})

export class IgxTreeGridWrappedInContComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();

    public height = null;
    public paging = false;
    public pageSize = 5;
    public density = DisplayDensity.comfortable;
    public outerWidth = 800;
    public outerHeight: number;

    public isHorizontalScrollbarVisible() {
        const scrollbar = this.treeGrid.parentVirtDir.getHorizontalScroll();
        if (scrollbar) {
            return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
        }

        return false;
    }

    public getVerticalScrollHeight() {
        const scrollbar = this.treeGrid.verticalScrollContainer.getVerticalScroll();
        if (scrollbar) {
            return parseInt(scrollbar.style.height, 10);
        }

        return 0;
    }

    public isVerticalScrollbarVisible() {
        const scrollbar = this.treeGrid.verticalScrollContainer.getVerticalScroll();
        if (scrollbar && scrollbar.offsetHeight > 0) {
            return scrollbar.offsetHeight < scrollbar.children[0].offsetHeight;
        }
        return false;
    }

}
