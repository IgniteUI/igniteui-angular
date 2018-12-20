import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './index';
import { IgxTreeGridComponent } from './tree-grid.component';
import { DisplayDensity } from '../../core/displayDensity';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { By } from '@angular/platform-browser';
import { IgxTreeGridWrappedInContComponent } from '../../test-utils/tree-grid-components.spec';

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

        beforeEach(async(() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            grid = fix.componentInstance.treeGrid;
        }));

        it('should match width and height of parent container when width/height are set in %', fakeAsync(() => {
            fix.componentInstance.outerWidth = 800;
            fix.componentInstance.outerHeight = 600;
            grid.width = '50%';
            grid.height = '50%';
            tick();
            fix.detectChanges();

            expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
            expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');
            expect(grid.rowList.length).toBeGreaterThan(0);
        }));

        it('should render 10 records if height is unset and parent container\'s height is unset', () => {
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(grid.rowList.length).toBeGreaterThanOrEqual(10);
        });

        it('should render 10 records if height is 100% and parent container\'s height is unset', fakeAsync(() => {
            grid.height = '600px';
            tick();
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(grid.rowList.length).toBeGreaterThanOrEqual(10);
        }));

        it(`should render all records exactly if height is 100% and parent container\'s height is unset and
            there are fewer than 10 records in the data view`, fakeAsync(() => {
                fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
                grid.height = '100%';
                fix.componentInstance.data = fix.componentInstance.data.slice(0, 1);
                tick();
                fix.detectChanges();
                const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
                expect(defaultHeight).not.toBeNull();
                expect(parseInt(defaultHeight, 10)).toBeGreaterThan(200);
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeFalsy();
                expect(grid.rowList.length).toEqual(6);
        }));

        it(`should render 11 records if height is 100% and parent container\'s height is unset and
            display density is changed`, fakeAsync(() => {
                fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
                grid.height = '100%';
                fix.componentInstance.density = DisplayDensity.compact;
                tick();
                fix.detectChanges();
                const defaultHeight = fix.debugElement.query(By.css('.igx-grid__tbody')).styles.height;
                const defaultHeightNum = parseInt(defaultHeight, 10);
                expect(defaultHeight).not.toBeNull();
                expect(defaultHeightNum).toBeGreaterThan(300);
                expect(defaultHeightNum).toBeLessThan(330);
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
                expect(grid.rowList.length).toEqual(11);
        }));
    });

});
