import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HammerGesturesManager } from '../core/touch';
import { IgxList, IgxListHeader, IgxListItem, IgxListModule } from './list.component';
import { Component, ViewChild, ContentChildren } from '@angular/core';

describe("List", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxListModule],
            declarations: [ListTestComponent]
        })
            .compileComponents();
    }));

    it('should initialize ig-list with item and header', () => {
        let fixture = TestBed.createComponent(ListTestComponent),
            list = fixture.componentInstance.list;

        expect(list).toBeDefined();
        expect(list instanceof IgxList).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(0);
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(0);

        fixture.detectChanges();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.items.length).toBe(3);
        expect(list.items[0] instanceof IgxListItem).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();
        expect(list.headers.length).toBe(1);
        expect(list.headers[0] instanceof IgxListHeader).toBeTruthy();
    });

    it('should set/get properly layout properties: width, left, maxLeft', () => {
        let fixture = TestBed.createComponent(ListTestComponent),
            item, visibleAreaOnFullPan,
            testWidth = 400, testLeft = -100,
            list = fixture.componentInstance.list;
        fixture.detectChanges();

        fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + "px";

        fixture.detectChanges();
        expect(list.items.length).toBe(3);
        item = list.items[0];
        visibleAreaOnFullPan = item._VISIBLE_AREA_ON_FULL_PAN;
        expect(item instanceof IgxListItem).toBeTruthy();
        expect(item.width).toBe(testWidth);
        expect(item.left).toBe(0);
        expect(item.maxLeft).toBe(visibleAreaOnFullPan - testWidth);
        item.left = testLeft;
        expect(item.left).toBe(testLeft);
    });

    it('should calculate properly item index', () => {
        let fixture = TestBed.createComponent(ListTestComponent),
            list = fixture.componentInstance.list;
        fixture.detectChanges();

        expect(list.children instanceof Array).toBeTruthy();
        expect(list.items instanceof Array).toBeTruthy();
        expect(list.headers instanceof Array).toBeTruthy();

        expect(list.children.length).toBe(4);
        expect(list.items.length).toBe(3);
        expect(list.headers.length).toBe(1);

        for (let i = 0; i < list.children.length; i++) {
            expect(list.children[i].index).toBe(i);
        }

        list.addChild(new IgxListItem(list, null, null));
        fixture.detectChanges();

        expect(list.children.length).toBe(5);
        expect(list.items.length).toBe(4);
        expect(list.headers.length).toBe(1);

        for (let i = 0; i < list.children.length; i++) {
            expect(list.children[i].index).toBe(i);
        }
    });
});

@Component({
    template: `<div #wrapper>
                    <igx-list>
                        <igx-list-header>Header</ig-list-header>
                        <igx-list-item>Item 1</ig-list-item>
                        <igx-list-item>Item 2</ig-list-item>
                        <igx-list-item>Item 3</ig-list-item>
                    </igx-list>
                </div>`
})
class ListTestComponent {
     @ViewChild(IgxList) list: IgxList;
     @ViewChild("wrapper") wrapper;
}