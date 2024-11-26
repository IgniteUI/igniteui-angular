import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFlexDirective, IgxLayoutDirective } from './layout.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxLayoutDirective', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [TestFlexLayoutComponent]
        }).compileComponents();
    }));

    it('should initialize with flex defaults', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance.instance;
        const el = fixture.debugElement.query(By.directive(IgxLayoutDirective)).nativeElement;

        expect(instance.display).toEqual('flex');
        expect(instance.dir).toEqual('row');
        expect(instance.wrap).toEqual('nowrap');
        expect(instance.align).toEqual('stretch');
        expect(instance.justify).toEqual('flex-start');
        expect(instance.reverse).toEqual(false);

        expect(el.style.display).toEqual('flex');
        expect(el.style.flexDirection).toEqual('row');
        expect(el.style.flexWrap).toEqual('nowrap');
        expect(el.style.alignItems).toEqual('stretch');
        expect(el.style.justifyContent).toEqual('flex-start');
    });

    it('should set flex direction', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);

        const instance = fixture.componentInstance.instance;
        const el = fixture.debugElement.query(By.directive(IgxLayoutDirective)).nativeElement;

        instance.dir = 'column';

        fixture.detectChanges();

        expect(el.style.flexDirection).toEqual('column');
    });

    it('should set flex wrap', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);

        const instance = fixture.componentInstance.instance;
        const el = fixture.debugElement.query(By.directive(IgxLayoutDirective)).nativeElement;

        instance.wrap = 'wrap';

        fixture.detectChanges();

        expect(el.style.flexWrap).toEqual('wrap');
    });

    it('should set flex align', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);

        const instance = fixture.componentInstance.instance;
        const el = fixture.debugElement.query(By.directive(IgxLayoutDirective)).nativeElement;

        instance.itemAlign = 'flex-start';

        fixture.detectChanges();

        expect(el.style.alignItems).toEqual('flex-start');
    });

    it('should set flex justify', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);

        const instance = fixture.componentInstance.instance;
        const el = fixture.debugElement.query(By.directive(IgxLayoutDirective)).nativeElement;

        instance.justify = 'flex-start';

        fixture.detectChanges();

        expect(el.style.justifyContent).toEqual('flex-start');
    });

    it('should reverse flex direction', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);

        const instance = fixture.componentInstance.instance;
        const el = fixture.debugElement.query(By.directive(IgxLayoutDirective)).nativeElement;

        instance.reverse = true;
        fixture.detectChanges();
        expect(el.style.flexDirection).toEqual('row-reverse');

        instance.dir = 'column';
        fixture.detectChanges();
        expect(el.style.flexDirection).toEqual('column-reverse');
    });

    it('should initialize child flex element with defaults', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);

        const instance = fixture.componentInstance.inner;
        const el = fixture.debugElement.query(By.directive(IgxFlexDirective)).nativeElement;
        fixture.detectChanges();

        expect(instance.flex).toBeFalsy();
        expect(instance.style).toEqual('1 1 auto');
        expect(instance.order).toEqual(0);

        expect(el.style.flex).toEqual('1 1 auto');
        expect(el.style.order).toEqual('0');
    });

    it('should set flex shrink, grow, basis, and order', () => {
        const fixture = TestBed.createComponent(TestFlexLayoutComponent);

        const instance = fixture.componentInstance.inner;
        const el = fixture.debugElement.query(By.directive(IgxFlexDirective)).nativeElement;

        instance.grow = 0;
        instance.shrink = 0;
        instance.basis = '100%';
        instance.order = 2;

        fixture.detectChanges();
        expect(instance.style).toEqual('0 0 100%');
        expect(instance.order).toEqual(2);

        expect(el.style.flex).toEqual('0 0 100%');
        expect(el.style.order).toEqual('2');
    });
});

@Component({
    template: `
        <div #instance igxLayout>
            <div #inner igxFlex></div>
        </div>
    `,
    imports: [IgxLayoutDirective, IgxFlexDirective]
})
class TestFlexLayoutComponent {
    @ViewChild(IgxLayoutDirective, { static: true }) public instance: IgxLayoutDirective;
    @ViewChild(IgxFlexDirective, { static: true }) public inner: IgxFlexDirective;
}
