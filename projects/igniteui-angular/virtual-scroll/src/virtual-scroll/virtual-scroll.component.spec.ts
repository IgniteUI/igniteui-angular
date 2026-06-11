import {
    TestBed,
    ComponentFixture,
    fakeAsync,
    tick,
    waitForAsync,
} from '@angular/core/testing';
import { Component, TemplateRef, viewChild } from '@angular/core';
import { By } from '@angular/platform-browser';

import { IgxVirtualScrollComponent } from './virtual-scroll.component';
import { IgxVirtualItemDirective } from './virtual-scroll-item.directive';
import { IgxVsItemContext, VirtualScrollDataRequest, VirtualScrollState } from './types';
import { VirtualScrollEngine } from './scroll-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateItems(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Item ${i}`);
}

// ---------------------------------------------------------------------------
// VirtualScrollEngine (pure unit tests – no DOM required)
// ---------------------------------------------------------------------------

describe('VirtualScrollEngine', () => {
    let engine: VirtualScrollEngine;

    beforeEach(() => {
        engine = new VirtualScrollEngine();
    });

    describe('resize', () => {
        it('should initialize sizes with the estimated value', () => {
            engine.resize(5, 40);
            expect(engine.totalSize()).toBe(200);
        });

        it('should grow preserving existing sizes', () => {
            engine.resize(3, 50);
            engine.measureItem(0, 80);
            engine.resize(5, 50);
            // item 0 = 80, items 1-4 = 50 each => 80 + 4*50 = 280
            expect(engine.totalSize()).toBe(280);
        });

        it('should shrink the array', () => {
            engine.resize(5, 50);
            engine.resize(2, 50);
            expect(engine.totalSize()).toBe(100);
        });

        it('should be a no-op when length is unchanged', () => {
            engine.resize(3, 50);
            const before = engine.totalSize();
            engine.resize(3, 99);
            expect(engine.totalSize()).toBe(before);
        });
    });

    describe('measureItem', () => {
        it('should update totalSize after a measurement', () => {
            engine.resize(3, 50);
            engine.measureItem(1, 120);
            expect(engine.totalSize()).toBe(50 + 120 + 50);
        });

        it('should ignore out-of-range indices', () => {
            engine.resize(3, 50);
            engine.measureItem(-1, 100);
            engine.measureItem(3, 100);
            expect(engine.totalSize()).toBe(150);
        });

        it('should be a no-op when the size has not changed', () => {
            engine.resize(3, 50);
            const before = engine.totalSize();
            engine.measureItem(0, 50); // size is already 50
            expect(engine.totalSize()).toBe(before);
        });
    });

    describe('getScrollOffsetForIndex', () => {
        it('should return 0 for index 0', () => {
            engine.resize(3, 50);
            expect(engine.getScrollOffsetForIndex(0)).toBe(0);
        });

        it('should return the cumulative size up to the given index', () => {
            engine.resize(4, 50);
            engine.measureItem(0, 30);
            engine.measureItem(1, 60);
            // offset for index 2 = item0 + item1 = 30 + 60 = 90
            expect(engine.getScrollOffsetForIndex(2)).toBe(90);
        });

        it('should clamp to totalSize for out-of-range indices', () => {
            engine.resize(3, 50);
            // pSums has length items+1; index clamps to pSums.length-1 = totalItems,
            // which equals the total virtual size, not the last item's leading offset.
            expect(engine.getScrollOffsetForIndex(100)).toBe(engine.totalSize());
        });
    });

    describe('getIndexAtScroll', () => {
        it('should return 0 when scrollPosition is 0', () => {
            engine.resize(5, 50);
            expect(engine.getIndexAtScroll(0)).toBe(0);
        });

        it('should return the last complete item before the scroll position', () => {
            engine.resize(5, 50);
            // binarySearchPrefixSums returns low-1: the last item whose end (prefixSums[i+1])
            // is at or before the target. At 125px item 1 ends at 100px, so index 1 is returned.
            // getVisibleRange adds overscan on top, which covers the partially-visible item.
            expect(engine.getIndexAtScroll(125)).toBe(1);
        });
    });

    describe('getVisibleRange', () => {
        it('should return empty range when totalItems is 0', () => {
            engine.resize(0, 50);
            const range = engine.getVisibleRange(0, 300, 2, 0);
            expect(range.startIndex).toBe(0);
            expect(range.endIndex).toBe(-1);
        });

        it('should return empty range when viewportSize is 0', () => {
            engine.resize(10, 50);
            const range = engine.getVisibleRange(0, 0, 2, 10);
            expect(range.startIndex).toBe(0);
            expect(range.endIndex).toBe(-1);
        });

        it('should include over-scanned items beyond the visible edge', () => {
            engine.resize(20, 50);
            // Viewport 200px, scroll 0 → visible items 0-3; with overScan=2 => 0-5
            const range = engine.getVisibleRange(0, 200, 2, 20);
            expect(range.startIndex).toBe(0);
            expect(range.endIndex).toBeGreaterThanOrEqual(5);
        });

        it('should not exceed totalItems - 1 as endIndex', () => {
            engine.resize(5, 50);
            const range = engine.getVisibleRange(0, 10000, 10, 5);
            expect(range.endIndex).toBe(4);
        });

        it('should not go below 0 as startIndex', () => {
            engine.resize(10, 50);
            const range = engine.getVisibleRange(0, 200, 10, 10);
            expect(range.startIndex).toBe(0);
        });
    });

    describe('getContentPosition', () => {
        it('should return 0 for index 0', () => {
            engine.resize(3, 50);
            expect(engine.getContentPosition(0)).toBe(0);
        });

        it('should match the prefix sum at the given index', () => {
            engine.resize(4, 50);
            engine.measureItem(0, 30);
            engine.measureItem(1, 70);
            // position for index 2 = sum of items 0 and 1 = 30 + 70 = 100
            expect(engine.getContentPosition(2)).toBe(100);
        });
    });
});

// ---------------------------------------------------------------------------
// IgxVsItemContext
// ---------------------------------------------------------------------------

describe('IgxVsItemContext', () => {
    it('should expose item, index, and count', () => {
        const ctx = new IgxVsItemContext('hello', 3, 10);
        expect(ctx.$implicit).toBe('hello');
        expect(ctx.index).toBe(3);
        expect(ctx.count).toBe(10);
    });

    it('first should be true only at index 0', () => {
        expect(new IgxVsItemContext('a', 0, 5).first).toBeTrue();
        expect(new IgxVsItemContext('a', 1, 5).first).toBeFalse();
    });

    it('last should be true only at index count-1', () => {
        expect(new IgxVsItemContext('a', 4, 5).last).toBeTrue();
        expect(new IgxVsItemContext('a', 3, 5).last).toBeFalse();
    });

    it('even/odd should reflect index parity', () => {
        expect(new IgxVsItemContext('a', 0, 5).even).toBeTrue();
        expect(new IgxVsItemContext('a', 0, 5).odd).toBeFalse();
        expect(new IgxVsItemContext('a', 1, 5).even).toBeFalse();
        expect(new IgxVsItemContext('a', 1, 5).odd).toBeTrue();
    });
});

// ---------------------------------------------------------------------------
// Wrapper components used in TestBed tests
// ---------------------------------------------------------------------------

@Component({
    selector: 'test-virtual-scroll-basic',
    template: `
        <igx-virtual-scroll [data]="items" style="height: 300px; display: block;">
            <ng-template igxVirtualItem let-item let-i="index">
                <div class="item" style="height: 50px;">{{ i }}: {{ item }}</div>
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestBasicComponent {
    public items = generateItems(100);
}

@Component({
    selector: 'test-virtual-scroll-horizontal',
    template: `
        <igx-virtual-scroll [data]="items" orientation="horizontal"
                            style="width: 400px; height: 50px; display: block;">
            <ng-template igxVirtualItem let-item>
                <div class="item" style="width: 80px; height: 50px;">{{ item }}</div>
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestHorizontalComponent {
    public items = generateItems(50);
}

@Component({
    selector: 'test-virtual-scroll-horizontal-rtl',
    template: `
        <igx-virtual-scroll dir="rtl" [data]="items" orientation="horizontal"
                            style="width: 400px; height: 50px; display: block;">
            <ng-template igxVirtualItem let-item>
                <div class="item" style="width: 80px; height: 50px;">{{ item }}</div>
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestHorizontalRtlComponent {
    public items = generateItems(50);
}

@Component({
    selector: 'test-virtual-scroll-events',
    template: `
        <igx-virtual-scroll [data]="items" style="height: 300px; display: block;"
                            (stateChange)="onStateChange($event)"
                            (dataRequest)="onDataRequest($event)">
            <ng-template igxVirtualItem let-item>
                <div class="item" style="height: 50px;">{{ item }}</div>
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestEventsComponent {
    public items = generateItems(100);
    public lastState: VirtualScrollState | null = null;
    public lastDataRequest: VirtualScrollDataRequest | null = null;

    public onStateChange(state: VirtualScrollState) {
        this.lastState = state;
    }

    public onDataRequest(req: VirtualScrollDataRequest) {
        this.lastDataRequest = req;
    }
}

@Component({
    selector: 'test-virtual-scroll-programmatic-template',
    template: `
        <ng-template #tpl let-item let-i="index">
            <div class="item" style="height: 50px;">{{ i }}: {{ item }}</div>
        </ng-template>
        <igx-virtual-scroll [data]="items" [itemTemplate]="tpl"
                            style="height: 300px; display: block;">
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent],
})
class TestProgrammaticTemplateComponent {
    public items = generateItems(50);
    public tpl = viewChild<TemplateRef<IgxVsItemContext<string>>>('tpl');
}

@Component({
    selector: 'test-virtual-scroll-empty',
    template: `
        <igx-virtual-scroll [data]="items" style="height: 300px; display: block;">
            <ng-template igxVirtualItem let-item>
                <div class="item" style="height: 50px;">{{ item }}</div>
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestEmptyComponent {
    public items: string[] = [];
}

// ---------------------------------------------------------------------------
// IgxVirtualScrollComponent TestBed tests
// ---------------------------------------------------------------------------

describe('IgxVirtualScrollComponent', () => {
    describe('basic rendering', () => {
        let fixture: ComponentFixture<TestBasicComponent>;
        let component: TestBasicComponent;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [TestBasicComponent],
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestBasicComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create the component', () => {
            const vs = fixture.debugElement.query(By.directive(IgxVirtualScrollComponent));
            expect(vs).toBeTruthy();
        });

        it('should have the igx-virtual-scroll class and role="list"', () => {
            const el: HTMLElement = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).nativeElement;
            expect(el.classList).toContain('igx-virtual-scroll');
            expect(el.getAttribute('role')).toBe('list');
        });

        it('should add the vertical modifier class by default', () => {
            const el: HTMLElement = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).nativeElement;
            expect(el.classList).toContain('igx-virtual-scroll--vertical');
            expect(el.classList).not.toContain('igx-virtual-scroll--horizontal');
        });

        it('should render a subset of items (not all 100)', () => {
            const items = fixture.debugElement.queryAll(By.css('.item'));
            expect(items.length).toBeGreaterThan(0);
            expect(items.length).toBeLessThan(component.items.length);
        });

        it('should render the track element with a non-zero height', () => {
            const track: HTMLElement = fixture.debugElement.query(
                By.css('.igx-vs__track')
            ).nativeElement;
            const heightPx = parseInt(track.style.height, 10);
            expect(heightPx).toBeGreaterThan(0);
        });

        it('should contain a content wrapper with a transform style', () => {
            const content: HTMLElement = fixture.debugElement.query(
                By.css('.igx-vs__content')
            ).nativeElement;
            expect(content.style.transform).toMatch(/translateY/);
        });

        it('should reflect updated data after input change', () => {
            component.items = generateItems(5);
            fixture.detectChanges();
            const items = fixture.debugElement.queryAll(By.css('.item'));
            expect(items.length).toBe(5);
        });

        it('should render no items when data is empty', () => {
            component.items = [];
            fixture.detectChanges();
            const items = fixture.debugElement.queryAll(By.css('.item'));
            expect(items.length).toBe(0);
        });
    });

    describe('horizontal orientation', () => {
        let fixture: ComponentFixture<TestHorizontalComponent>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [TestHorizontalComponent],
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestHorizontalComponent);
            fixture.detectChanges();
        });

        it('should add the horizontal modifier class', () => {
            const el: HTMLElement = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).nativeElement;
            expect(el.classList).toContain('igx-virtual-scroll--horizontal');
            expect(el.classList).not.toContain('igx-virtual-scroll--vertical');
        });

        it('should set a width on the track element instead of height', () => {
            const track: HTMLElement = fixture.debugElement.query(
                By.css('.igx-vs__track')
            ).nativeElement;
            expect(track.style.width).toBeTruthy();
        });

        it('should apply a translateX transform to the content wrapper', () => {
            const content: HTMLElement = fixture.debugElement.query(
                By.css('.igx-vs__content')
            ).nativeElement;
            expect(content.style.transform).toMatch(/translateX/);
        });
    });

    describe('horizontal orientation (RTL)', () => {
        let fixture: ComponentFixture<TestHorizontalRtlComponent>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [TestHorizontalRtlComponent],
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestHorizontalRtlComponent);
            fixture.detectChanges();
        });

        it('should apply a non-positive translateX transform in RTL', () => {
            const content: HTMLElement = fixture.debugElement.query(
                By.css('.igx-vs__content')
            ).nativeElement;
            const match = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(
                content.style.transform
            );
            expect(match).not.toBeNull();
            // In RTL the content wrapper is anchored to the right edge and
            // translates towards the negative (leading) direction.
            expect(parseFloat(match![1])).toBeLessThanOrEqual(0);
        });

        it('should normalize the RTL negative scrollLeft into a positive scroll position', fakeAsync(() => {
            const vsEl: HTMLElement = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).nativeElement;

            // Standards-compliant browsers report a negative scrollLeft in RTL.
            // Scroll far enough that the first rendered item moves past the
            // over-scan buffer, so the content wrapper is actually translated.
            Object.defineProperty(vsEl, 'scrollLeft', {
                get: () => -800,
                configurable: true,
            });
            vsEl.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();
            tick();

            const content: HTMLElement = fixture.debugElement.query(
                By.css('.igx-vs__content')
            ).nativeElement;
            const match = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(
                content.style.transform
            );
            expect(match).not.toBeNull();
            // The normalized (positive) scroll position maps to a leading-edge
            // offset that is applied in the negative (RTL) direction.
            expect(parseFloat(match![1])).toBeLessThan(0);
        }));

        it('should scroll to a negative scrollLeft in RTL via scrollToIndex', () => {
            const vs = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).componentInstance as IgxVirtualScrollComponent<string>;
            const vsEl: HTMLElement = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).nativeElement;

            vs.scrollToIndex(10);
            // In RTL the offset is applied as a negative scrollLeft.
            expect(vsEl.scrollLeft).toBeLessThan(0);
        });
    });

    describe('events', () => {
        let fixture: ComponentFixture<TestEventsComponent>;
        let component: TestEventsComponent;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [TestEventsComponent],
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestEventsComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should emit stateChange after initial render', () => {
            expect(component.lastState).not.toBeNull();
        });

        it('stateChange should include startIndex, endIndex, viewportSize, and totalSize', () => {
            const state = component.lastState!;
            expect(state.startIndex).toBeDefined();
            expect(state.endIndex).toBeDefined();
            expect(state.viewportSize).toBeDefined();
            expect(state.totalSize).toBeGreaterThan(0);
        });

        it('stateChange startIndex should be less than or equal to endIndex', () => {
            expect(component.lastState!.startIndex).toBeLessThanOrEqual(
                component.lastState!.endIndex
            );
        });

        it('should emit dataRequest when near the end of data', fakeAsync(() => {
            // Provide a very small list so the visible range is near the end.
            // dataRequest must not fire on initial render — only after the user
            // has scrolled (scrollPosition > 0 guard added to the effect).
            component.items = generateItems(3);
            fixture.detectChanges();
            tick();
            expect(component.lastDataRequest).toBeNull();

            // Simulate a scroll event so scrollPosition becomes > 0.
            const vsEl: HTMLElement = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).nativeElement;

            Object.defineProperty(vsEl, 'scrollTop', {
                get: () => 1,
                configurable: true,
            });
            vsEl.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();
            tick();

            expect(component.lastDataRequest).not.toBeNull();
            expect(component.lastDataRequest!.startIndex).toBe(3);
        }));
    });

    describe('programmatic itemTemplate input', () => {
        let fixture: ComponentFixture<TestProgrammaticTemplateComponent>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [TestProgrammaticTemplateComponent],
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestProgrammaticTemplateComponent);
            fixture.detectChanges();
        });

        it('should render items using the programmatic template', () => {
            const items = fixture.debugElement.queryAll(By.css('.item'));
            expect(items.length).toBeGreaterThan(0);
        });
    });

    describe('empty data', () => {
        let fixture: ComponentFixture<TestEmptyComponent>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [TestEmptyComponent],
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestEmptyComponent);
            fixture.detectChanges();
        });

        it('should not render any items', () => {
            const items = fixture.debugElement.queryAll(By.css('.item'));
            expect(items.length).toBe(0);
        });

        it('should still render the track element', () => {
            const track = fixture.debugElement.query(By.css('.igx-vs__track'));
            expect(track).toBeTruthy();
        });
    });

    describe('scrollToIndex', () => {
        let fixture: ComponentFixture<TestBasicComponent>;
        let vsComponent: IgxVirtualScrollComponent<string>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [TestBasicComponent],
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestBasicComponent);
            fixture.detectChanges();
            vsComponent = fixture.debugElement.query(
                By.directive(IgxVirtualScrollComponent)
            ).componentInstance;
        });

        it('should not throw when scrolling to a valid index', () => {
            expect(() => vsComponent.scrollToIndex(10)).not.toThrow();
        });

        it('should not throw when scrolling to index 0', () => {
            expect(() => vsComponent.scrollToIndex(0)).not.toThrow();
        });

        it('should not throw when scrolling to the last index', () => {
            expect(() => vsComponent.scrollToIndex(99)).not.toThrow();
        });
    });
});

// ---------------------------------------------------------------------------
// IgxVirtualItemDirective
// ---------------------------------------------------------------------------

describe('IgxVirtualItemDirective', () => {
    @Component({
        selector: 'test-directive-host',
        template: `
            <igx-virtual-scroll [data]="items" style="height: 200px; display: block;">
                <ng-template igxVirtualItem let-item>
                    <div>{{ item }}</div>
                </ng-template>
            </igx-virtual-scroll>
        `,
        imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
    })
    class DirectiveHostComponent {
        public items = generateItems(10);
    }

    let fixture: ComponentFixture<DirectiveHostComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [DirectiveHostComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DirectiveHostComponent);
        fixture.detectChanges();
    });

    it('should be picked up as a content child of IgxVirtualScrollComponent', () => {
        // By.directive() is unreliable for ng-template nodes in headless environments;
        // access the component's contentChild signal directly instead.
        const vs = fixture.debugElement
            .query(By.directive(IgxVirtualScrollComponent))
            .componentInstance as any;
        expect(vs._itemDirective()).not.toBeNull();
    });

    it('should expose a non-null TemplateRef', () => {
        const vs = fixture.debugElement
            .query(By.directive(IgxVirtualScrollComponent))
            .componentInstance as any;
        expect(vs._itemDirective()?.template).toBeTruthy();
    });
});
