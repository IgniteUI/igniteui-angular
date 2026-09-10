import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { VirtualScrollEngine } from './scroll-engine';
import {
    IgxVsItemContext,
    VirtualDataWindow,
    VirtualScrollDataRequest,
    VirtualScrollState,
} from './types';
import { IgxVirtualItemDirective } from './virtual-scroll-item.directive';
import { IgxVirtualScrollComponent } from './virtual-scroll.component';

function generateItems(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Item ${i}`);
}

function engineOf(scroll: IgxVirtualScrollComponent<unknown>): VirtualScrollEngine {
    return (scroll as any)._engine;
}

describe('VirtualScrollEngine', () => {
    const ESTIMATE = 50;

    function createEngine(length = 100, estimate = ESTIMATE): VirtualScrollEngine {
        const engine = new VirtualScrollEngine();
        engine.resize(length, estimate);
        return engine;
    }

    /**
     * A stand-in document reporting `maxSize` as its largest reachable
     * coordinate. A non-zero `scrollTop` models an already scrolled document:
     * the probe's rect is viewport relative, so it comes back short by that
     * much. `probes` counts how often a probe element was created.
     */
    function createProbeDocument(maxSize: number, scrollTop = 0) {
        const probe = {
            style: {} as CSSStyleDeclaration,
            getBoundingClientRect: () => ({ top: maxSize - scrollTop }),
        };
        const state = { probes: 0 };
        const doc = {
            body: { appendChild: () => undefined, removeChild: () => undefined },
            documentElement: { scrollTop },
            createElement: () => {
                state.probes++;
                return probe;
            },
        } as unknown as Document;

        return { doc, state };
    }

    /** Builds an engine whose probed maximum browser size is `maxSize`. */
    function createEngineWithMaxSize(
        maxSize: number,
        length: number,
        estimate = ESTIMATE,
    ): VirtualScrollEngine {
        const engine = new VirtualScrollEngine();
        engine.initMaxBrowserSize(createProbeDocument(maxSize).doc);
        engine.resize(length, estimate);
        return engine;
    }

    describe('sizing', () => {
        it('should fill new items with the estimated size', () => {
            const engine = createEngine(10);

            expect(engine.totalSize()).toBe(500);
            expect(engine.domSize()).toBe(500);
            expect(engine.getScrollOffsetForIndex(0)).toBe(0);
            expect(engine.getScrollOffsetForIndex(3)).toBe(150);
        });

        it('should report zero size before it is sized', () => {
            const engine = new VirtualScrollEngine();

            expect(engine.totalSize()).toBe(0);
            expect(engine.getScrollOffsetForIndex(5)).toBe(0);
            expect(engine.getPhysicalRangeSize(0, 10)).toBe(0);
            expect(engine.getVisibleRange(0, 300, 2)).toEqual({
                startIndex: 0,
                endIndex: -1,
            });
        });

        it('should apply a measured size to subsequent offsets', () => {
            const engine = createEngine(10);
            engine.measureItem(2, 120);

            expect(engine.totalSize()).toBe(570);
            expect(engine.getScrollOffsetForIndex(2)).toBe(100);
            expect(engine.getScrollOffsetForIndex(3)).toBe(220);
            expect(engine.getPhysicalRangeSize(2, 2)).toBe(120);
        });

        it('should ignore measurements for out of range indices', () => {
            const engine = createEngine(10);
            engine.measureItem(10, 120);
            engine.measureItem(-1, 120);

            expect(engine.totalSize()).toBe(500);
        });

        it('should clamp offsets to the item count', () => {
            const engine = createEngine(10);

            expect(engine.getScrollOffsetForIndex(10)).toBe(500);
            expect(engine.getScrollOffsetForIndex(999)).toBe(500);
            expect(engine.getScrollOffsetForIndex(-5)).toBe(0);
        });

        it('should sum only the requested range, clamped to the item count', () => {
            const engine = createEngine(10);

            expect(engine.getPhysicalRangeSize(2, 4)).toBe(150);
            expect(engine.getPhysicalRangeSize(-5, 1)).toBe(100);
            expect(engine.getPhysicalRangeSize(8, 999)).toBe(100);
            expect(engine.getPhysicalRangeSize(4, 3)).toBe(0);
        });
    });

    describe('estimated size', () => {
        it('should apply a new estimate to unmeasured items only', () => {
            const engine = createEngine(10);
            engine.measureItem(0, 30);
            engine.updateEstimatedSize(100);

            expect(engine.totalSize()).toBe(30 + 9 * 100);
            expect(engine.getScrollOffsetForIndex(1)).toBe(30);
        });

        it('should treat a measurement equal to the current size as measured', () => {
            const engine = createEngine(10);
            // The same value as the estimate: no size change, but the item must
            // still be flagged as measured, so a later estimate cannot overwrite it.
            engine.measureItem(0, ESTIMATE);
            engine.updateEstimatedSize(100);

            expect(engine.totalSize()).toBe(ESTIMATE + 9 * 100);
        });
    });

    describe('resizing', () => {
        it('should preserve measured sizes when items are appended', () => {
            const engine = createEngine(10);
            engine.measureItem(1, 30);
            engine.resize(20, ESTIMATE);

            expect(engine.totalSize()).toBe(30 + 19 * ESTIMATE);
            expect(engine.getScrollOffsetForIndex(2)).toBe(80);
        });

        it('should preserve measured sizes when items are removed', () => {
            const engine = createEngine(10);
            engine.measureItem(1, 30);
            engine.resize(5, ESTIMATE);

            expect(engine.totalSize()).toBe(30 + 4 * ESTIMATE);
        });

        it('should discard measured sizes at and beyond retainCount', () => {
            const engine = createEngine(10);
            engine.measureItem(1, 30);
            engine.measureItem(6, 30);
            engine.resize(10, ESTIMATE, 4);

            // Item 1 is retained. Item 6 is set back to the estimate.
            expect(engine.totalSize()).toBe(30 + 9 * ESTIMATE);
            expect(engine.getScrollOffsetForIndex(2)).toBe(80);
        });

        it('should re-mark discarded items as unmeasured', () => {
            const engine = createEngine(10);
            engine.measureItem(6, 30);
            engine.resize(10, ESTIMATE, 4);
            engine.updateEstimatedSize(100);

            // Nothing is measured now, so each item follows the new estimate.
            expect(engine.totalSize()).toBe(10 * 100);
        });

        it('should be a no-op when the length matches and everything is retained', () => {
            const engine = createEngine(10);
            engine.measureItem(1, 30);

            const version = engine.version();
            engine.resize(10, ESTIMATE);

            expect(engine.version()).toBe(version);
            expect(engine.totalSize()).toBe(30 + 9 * ESTIMATE);
        });
    });

    describe('change notifications', () => {
        it('should notify on resize, measurement and estimate changes', () => {
            const engine = new VirtualScrollEngine();
            const version = engine.version();

            engine.resize(10, ESTIMATE);
            expect(engine.version()).toBe(version + 1);

            engine.measureItem(0, 30);
            expect(engine.version()).toBe(version + 2);

            engine.updateEstimatedSize(80);
            expect(engine.version()).toBe(version + 3);
        });

        it('should not notify when nothing actually changes', () => {
            const engine = createEngine(10);
            const version = engine.version();

            engine.measureItem(0, ESTIMATE);
            engine.updateEstimatedSize(ESTIMATE);

            expect(engine.version()).toBe(version);
        });
    });

    describe('visible range', () => {
        it('should return an empty range without items or viewport', () => {
            expect(createEngine(0).getVisibleRange(0, 300, 2)).toEqual({
                startIndex: 0,
                endIndex: -1,
            });
            expect(createEngine(10).getVisibleRange(0, 0, 2)).toEqual({
                startIndex: 0,
                endIndex: -1,
            });
        });

        it('should cover the viewport from the top', () => {
            const engine = createEngine(100);

            expect(engine.getVisibleRange(0, 300, 0)).toEqual({
                startIndex: 0,
                endIndex: 6,
            });
        });

        it('should resolve an offset that falls exactly on an item boundary', () => {
            const engine = createEngine(100);

            expect(engine.getVisibleRange(100, 100, 0)).toEqual({
                startIndex: 2,
                endIndex: 4,
            });
        });

        it('should expand by the over-scan and clamp to the item count', () => {
            const engine = createEngine(100);

            expect(engine.getVisibleRange(0, 300, 2)).toEqual({
                startIndex: 0,
                endIndex: 8,
            });
            expect(engine.getVisibleRange(5000, 300, 2)).toEqual({
                startIndex: 97,
                endIndex: 99,
            });
        });

        it('should account for measured sizes', () => {
            const engine = createEngine(100);
            for (let i = 0; i < 10; i++) {
                engine.measureItem(i, 100);
            }

            expect(engine.getVisibleRange(0, 300, 0)).toEqual({
                startIndex: 0,
                endIndex: 3,
            });
        });
    });

    describe('alignment', () => {
        it('should align to the leading edge', () => {
            const engine = createEngine(100);

            expect(engine.getAlignedScrollOffset(10, 300, 'start')).toBe(500);
        });

        it('should center the item within the viewport', () => {
            const engine = createEngine(100);

            // 500 - (300 - 50) / 2
            expect(engine.getAlignedScrollOffset(10, 300, 'center')).toBe(375);
        });

        it('should align to the trailing edge', () => {
            const engine = createEngine(100);

            // 500 - (300 - 50)
            expect(engine.getAlignedScrollOffset(10, 300, 'end')).toBe(250);
        });

        it('should never return a negative offset', () => {
            const engine = createEngine(100);

            expect(engine.getAlignedScrollOffset(0, 300, 'center')).toBe(0);
            expect(engine.getAlignedScrollOffset(1, 300, 'end')).toBe(0);
        });

        it('should clamp to the largest reachable scroll offset', () => {
            const engine = createEngine(100);
            const maxOffset = engine.domSize() - 300;

            expect(maxOffset).toBe(5000 - 300);
            expect(engine.getAlignedScrollOffset(99, 300, 'start')).toBe(maxOffset);
        });

        it('should report whether an item is fully in view', () => {
            const engine = createEngine(100);

            expect(engine.isIndexInView(0, 0, 300)).toBeTrue();
            expect(engine.isIndexInView(5, 0, 300)).toBeTrue();
            // Item 6 spans 300-350, so it is only partially visible.
            expect(engine.isIndexInView(6, 0, 300)).toBeFalse();
            expect(engine.isIndexInView(20, 0, 300)).toBeFalse();
        });

        it('should treat an item larger than the viewport as in view once it covers it', () => {
            const engine = createEngine(10);
            engine.measureItem(0, 1000);

            // The item cannot fit inside the viewport. While it spans the whole
            // viewport, there is nothing to scroll to, as with native
            // `scrollIntoView({ block: 'nearest' })`.
            expect(engine.isIndexInView(0, 0, 300)).toBeTrue();
            expect(engine.isIndexInView(0, 350, 300)).toBeTrue();
            // Scrolled past its trailing edge, the item no longer covers the viewport.
            expect(engine.isIndexInView(0, 800, 300)).toBeFalse();
        });

        it('should clamp an out of range index the same way as the alignment math', () => {
            const engine = createEngine(100);
            const last = engine.getAlignedScrollOffset(99, 300, 'start');

            expect(engine.getAlignedScrollOffset(999, 300, 'start')).toBe(last);
            expect(engine.isIndexInView(999, last, 300)).toBe(
                engine.isIndexInView(99, last, 300),
            );
        });

        it('should stay within range on an empty tree', () => {
            const engine = createEngine(0);

            expect(engine.getAlignedScrollOffset(0, 300, 'center')).toBe(0);
            expect(engine.isIndexInView(0, 0, 300)).toBeFalse();
        });
    });

    describe('coordinate compression', () => {
        const MAX_SIZE = 10_000;
        const ITEMS = 1000; // 50_000px total, a ratio of 5

        it('should clamp the DOM size to the maximum browser size', () => {
            const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);

            expect(engine.totalSize()).toBe(50_000);
            expect(engine.domSize()).toBe(MAX_SIZE);
        });

        it('should leave the DOM size untouched below the maximum', () => {
            const engine = createEngineWithMaxSize(MAX_SIZE, 100);

            expect(engine.totalSize()).toBe(5000);
            expect(engine.domSize()).toBe(5000);
        });

        it('should map DOM scroll positions onto the virtual space', () => {
            const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);

            // Halfway down the DOM range is halfway down the virtual range.
            expect(engine.getVisibleRange(MAX_SIZE / 2, 300, 0).startIndex).toBe(500);
            expect(engine.getScrollOffsetForIndex(500)).toBe(MAX_SIZE / 2);
        });

        it('should size the rendered window by the viewport, not by the ratio', () => {
            const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);
            const compressed = engine.getVisibleRange(MAX_SIZE / 2, 300, 0);

            // A 300px viewport of 50px items shows 6 items at any compression of
            // the virtual space, because the items render at their real size.
            expect(compressed.endIndex - compressed.startIndex).toBe(6);
        });

        it('should convert the alignment slack into DOM space', () => {
            const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);
            const start = engine.getAlignedScrollOffset(500, 300, 'start');
            const centered = engine.getAlignedScrollOffset(500, 300, 'center');

            // The slack is 125 virtual px, which is 25 DOM px at a ratio of 5.
            expect(start).toBe(MAX_SIZE / 2);
            expect(centered).toBe(MAX_SIZE / 2 - 25);
        });

        it('should compress an already sized engine when the probe arrives later', () => {
            const engine = new VirtualScrollEngine();
            engine.resize(ITEMS, ESTIMATE);

            // The component sizes the engine during change detection but can
            // only probe the document after the first render, so `domSize` is
            // read once before the maximum is known.
            expect(engine.domSize()).toBe(50_000);

            engine.initMaxBrowserSize(createProbeDocument(MAX_SIZE).doc);

            expect(engine.domSize()).toBe(MAX_SIZE);
        });

        it('should probe a given document only once', () => {
            const { doc, state } = createProbeDocument(MAX_SIZE);

            new VirtualScrollEngine().initMaxBrowserSize(doc);
            new VirtualScrollEngine().initMaxBrowserSize(doc);

            expect(state.probes).toBe(1);
        });

        it('should probe the full extent from an already scrolled document', () => {
            const { doc } = createProbeDocument(MAX_SIZE, 2500);
            const engine = new VirtualScrollEngine();

            engine.initMaxBrowserSize(doc);
            engine.resize(ITEMS, ESTIMATE);

            // If the document scroll offset were not added back, the probe would
            // report 7500 and the content would be compressed into it.
            expect(engine.domSize()).toBe(MAX_SIZE);
        });
    });
});

describe('IgxVsItemContext', () => {
    it('should expose item, index, and count', () => {
        const context = new IgxVsItemContext('a', 2, 5);

        expect(context.$implicit).toBe('a');
        expect(context.index).toBe(2);
        expect(context.count).toBe(5);
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

@Component({
    selector: 'test-virtual-scroll',
    template: `
        <igx-virtual-scroll
            [data]="items()"
            [orientation]="orientation()"
            [overScan]="overScan()"
            [estimatedItemSize]="estimatedItemSize()"
            [style.height.px]="hostHeight()"
            [style.width.px]="hostWidth()"
            (stateChange)="states.push($event)"
            (dataRequest)="requests.push($event)"
        >
            <ng-template igxVirtualItem let-item let-i="index">
                <span
                    class="item"
                    style="display: block"
                    [style.height.px]="itemHeight()"
                    [style.width.px]="itemWidth()"
                    >{{ i }}: {{ item }}</span
                >
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestHostComponent {
    public readonly vs = viewChild.required(IgxVirtualScrollComponent);

    public items = signal(generateItems(100));
    public orientation = signal<'vertical' | 'horizontal'>('vertical');
    public overScan = signal(2);
    public estimatedItemSize = signal(50);
    public hostHeight = signal<number | null>(300);
    public hostWidth = signal<number | null>(null);
    public itemHeight = signal<number | null>(50);
    public itemWidth = signal<number | null>(null);

    public states: VirtualScrollState[] = [];
    public requests: VirtualScrollDataRequest[] = [];

    /** A 300x100 horizontal viewport of 50px wide items. */
    public useHorizontal(): void {
        this.orientation.set('horizontal');
        this.hostHeight.set(100);
        this.hostWidth.set(300);
        this.itemHeight.set(null);
        this.itemWidth.set(50);
    }

    /** A 300px tall vertical viewport of 50px tall items. */
    public useVertical(): void {
        this.orientation.set('vertical');
        this.hostHeight.set(300);
        this.hostWidth.set(null);
        this.itemHeight.set(50);
        this.itemWidth.set(null);
    }
}

@Component({
    selector: 'test-virtual-scroll-window',
    template: `
        <igx-virtual-scroll
            [data]="items()"
            [dataWindow]="window()"
            style="display: block; height: 300px"
            (stateChange)="states.push($event)"
            (dataRequest)="requests.push($event)"
        >
            <ng-template igxVirtualItem let-item let-i="index" let-count="count">
                <span
                    class="item"
                    style="display: block"
                    [style.height.px]="rowHeight()"
                    >{{ i }}:{{ count }}:{{ item }}</span
                >
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestWindowHostComponent {
    public readonly vs = viewChild.required(IgxVirtualScrollComponent);

    public items = signal<unknown[]>([]);
    public window = signal<VirtualDataWindow<unknown> | null>(null);
    public rowHeight = signal(50);
    public states: VirtualScrollState[] = [];
    public requests: VirtualScrollDataRequest[] = [];

    public pageAt(startIndex: number, count = 20, totalCount = 1000): VirtualDataWindow<unknown> {
        return {
            items: Array.from({ length: count }, (_, i) => `Item ${startIndex + i}`),
            startIndex,
            totalCount,
        };
    }

    /** A page of fresh objects, the way a deserialized response arrives. */
    public objectPageAt(startIndex: number, count = 20): VirtualDataWindow<unknown> {
        return {
            items: Array.from({ length: count }, (_, i) => ({ id: startIndex + i })),
            startIndex,
            totalCount: 1000,
        };
    }
}

@Component({
    selector: 'test-virtual-scroll-popup',
    template: `
        <div [style.display]="open() ? 'block' : 'none'">
            <igx-virtual-scroll
                [data]="items()"
                [initialViewportSize]="initialViewportSize()"
                [style.height.px]="hostHeight()"
                style="display: block"
            >
                <ng-template igxVirtualItem let-item let-i="index">
                    <span class="item" style="display: block; height: 50px">{{ i }}: {{ item }}</span>
                </ng-template>
            </igx-virtual-scroll>
        </div>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestPopupHostComponent {
    public readonly vs = viewChild.required(IgxVirtualScrollComponent);

    public items = signal(generateItems(100));
    public initialViewportSize = signal(0);
    public hostHeight = signal<number | null>(300);
    public open = signal(false);
}

@Component({
    selector: 'test-virtual-scroll-rtl',
    template: `
        <igx-virtual-scroll
            dir="rtl"
            orientation="horizontal"
            [data]="items()"
            style="width: 300px; height: 100px"
        >
            <ng-template igxVirtualItem let-item>
                <span class="item" style="display: block; width: 50px; height: 100px">{{ item }}</span>
            </ng-template>
        </igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
class TestRtlHostComponent {
    public readonly vs = viewChild.required(IgxVirtualScrollComponent);
    public items = signal(generateItems(1000));
}

@Component({
    selector: 'test-virtual-scroll-no-template',
    template: `
        <igx-virtual-scroll [data]="items()" style="height: 300px"></igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent],
})
class TestNoTemplateHostComponent {
    public items = signal(generateItems(50));
}

@Component({
    selector: 'test-virtual-scroll-programmatic',
    template: `
        <ng-template #tpl let-item let-i="index">
            <span class="item" style="display: block; height: 50px">{{ i }}: {{ item }}</span>
        </ng-template>
        <igx-virtual-scroll
            [data]="items()"
            [itemTemplate]="tpl"
            style="height: 300px"
        ></igx-virtual-scroll>
    `,
    imports: [IgxVirtualScrollComponent],
})
class TestProgrammaticTemplateComponent {
    public items = signal(generateItems(50));
}

function vsElement(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('igx-virtual-scroll');
}

function vsTrack(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('.igx-vs__track');
}

function vsContent(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('.igx-vs__content');
}

function vsItems(fixture: ComponentFixture<unknown>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[data-vs-index]'));
}

function vsIndices(fixture: ComponentFixture<unknown>): number[] {
    return vsItems(fixture).map((el) => Number(el.dataset['vsIndex']));
}

/** Runs change detection and waits for the measurement passes to settle. */
async function settle(
    fixture: ComponentFixture<unknown>,
    scroll: IgxVirtualScrollComponent<unknown>,
): Promise<void> {
    fixture.detectChanges();
    await scroll.layoutComplete;
    fixture.detectChanges();
    await scroll.layoutComplete;
    fixture.detectChanges();
}

/** Sets a scroll offset on the given axis and dispatches a synthetic scroll. */
async function scrollTo(
    fixture: ComponentFixture<unknown>,
    scroll: IgxVirtualScrollComponent<unknown>,
    offset: number,
    axis: 'top' | 'left' = 'top',
): Promise<void> {
    const element = vsElement(fixture);

    if (axis === 'top') {
        element.scrollTop = offset;
    } else {
        element.scrollLeft = offset;
    }

    element.dispatchEvent(new Event('scroll'));
    await settle(fixture, scroll);
}

describe('IgxVirtualScrollComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let scroll: IgxVirtualScrollComponent<string>;

    async function createFixture(): Promise<void> {
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.autoDetectChanges();
        await fixture.whenStable();
        scroll = host.vs() as IgxVirtualScrollComponent<string>;
        await settle(fixture, scroll);
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                TestHostComponent,
                TestRtlHostComponent,
                TestNoTemplateHostComponent,
                TestProgrammaticTemplateComponent,
                TestPopupHostComponent,
                TestWindowHostComponent,
            ],
        }).compileComponents();
    }));

    describe('basic rendering', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should create the component', () => {
            expect(
                fixture.debugElement.query(By.directive(IgxVirtualScrollComponent)),
            ).toBeTruthy();
        });

        it('should have the igx-virtual-scroll class and role="list"', () => {
            const element = vsElement(fixture);

            expect(element.classList).toContain('igx-virtual-scroll');
            expect(element.getAttribute('role')).toBe('list');
        });

        it('should add the vertical modifier class by default', () => {
            expect(vsElement(fixture).classList).toContain('igx-virtual-scroll--vertical');
        });

        it('should render only a subset of the items', () => {
            const rendered = vsItems(fixture);

            expect(rendered.length).toBeGreaterThan(0);
            expect(rendered.length).toBeLessThan(100);
        });

        it('should render the track element sized to the full virtual extent', () => {
            expect(vsTrack(fixture).style.height).toBe(`${100 * 50}px`);
        });

        it('should wrap every rendered item and tag it with its data index', () => {
            const rendered = vsItems(fixture);

            for (const element of rendered) {
                expect(element.classList).toContain('igx-vs__item');
                expect(element.getAttribute('role')).toBe('presentation');
            }

            expect(vsIndices(fixture)).toEqual(
                rendered.map((_, i) => Number(rendered[0].dataset['vsIndex']) + i),
            );
        });

        it('should apply a transform to the content wrapper', () => {
            expect(vsContent(fixture).style.transform).toMatch(/translateY\(/);
        });

        it('should reflect updated data', async () => {
            host.items.set(generateItems(10));
            await settle(fixture, scroll);

            expect(vsTrack(fixture).style.height).toBe(`${10 * 50}px`);
            // A 300px viewport of 50px items shows 0..6, plus an over-scan of 2.
            expect(Math.max(...vsIndices(fixture))).toBe(8);
        });

        it('should render no items when data is empty', async () => {
            host.items.set([]);
            await settle(fixture, scroll);

            expect(vsItems(fixture).length).toBe(0);
            expect(vsTrack(fixture)).toBeTruthy();
        });

        it('should render nothing without an item template', async () => {
            const noTemplate = TestBed.createComponent(TestNoTemplateHostComponent);
            noTemplate.autoDetectChanges();
            await noTemplate.whenStable();

            expect(vsItems(noTemplate).length).toBe(0);
        });

        it('should render items from a programmatic itemTemplate', async () => {
            const programmatic = TestBed.createComponent(TestProgrammaticTemplateComponent);
            programmatic.autoDetectChanges();
            await programmatic.whenStable();

            expect(vsItems(programmatic).length).toBeGreaterThan(0);
            expect(programmatic.nativeElement.textContent).toContain('0: Item 0');
        });
    });

    describe('input normalization', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should fall back to the default for a non-positive estimatedItemSize', async () => {
            host.estimatedItemSize.set(0);
            host.items.set(generateItems(1000));
            host.itemHeight.set(20);
            await settle(fixture, scroll);

            // Rendered items are measured at 20px; the rest must fall back to
            // the default estimate of 50px rather than collapsing to zero.
            const measured = vsItems(fixture).length;
            const expected = measured * 20 + (1000 - measured) * 50;

            expect(vsTrack(fixture).style.height).toBe(`${expected}px`);
        });

        it('should clamp a negative overScan to zero', async () => {
            host.overScan.set(-5);
            host.itemHeight.set(50);
            await settle(fixture, scroll);

            // A 300px viewport of 50px items shows 7 items and nothing extra.
            expect(vsItems(fixture).length).toBe(7);
        });
    });

    describe('initial viewport size', () => {
        let popup: ComponentFixture<TestPopupHostComponent>;
        let popupHost: TestPopupHostComponent;
        let popupScroll: IgxVirtualScrollComponent<string>;

        /** Creates the fixture with the list hidden, the way a closed drop-down holds one. */
        async function createPopup(initialViewportSize = 0): Promise<void> {
            popup = TestBed.createComponent(TestPopupHostComponent);
            popupHost = popup.componentInstance;
            popupHost.initialViewportSize.set(initialViewportSize);
            popup.detectChanges();
            popupScroll = popupHost.vs() as IgxVirtualScrollComponent<string>;
        }

        /** Shows the list in one synchronous pass, the way opening a drop-down does. */
        function reveal(): void {
            popupHost.open.set(true);
            popup.detectChanges();
        }

        /** Settles repeatedly until `predicate` holds, so a resize report is not raced. */
        async function settleUntil(predicate: () => boolean): Promise<void> {
            for (let i = 0; i < 20 && !predicate(); i++) {
                await settle(popup, popupScroll);
            }
        }

        it('should render nothing in the pass that reveals it when the input is omitted', async () => {
            await createPopup();
            reveal();

            expect(vsItems(popup).length).toBe(0);
        });

        it('should render the first window in the pass that reveals it', async () => {
            await createPopup(300);
            reveal();

            // A 300px viewport of 50px rows shows 0..6, plus an over-scan of 2.
            expect(vsIndices(popup)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        });

        it('should let the measured size replace an initial value that was too large', async () => {
            await createPopup(2000);
            reveal();
            await settleUntil(() => vsItems(popup).length === 9);

            // The host is 300px, so the window settles at what it really holds rather than
            // the 40 rows 2000px would.
            expect(vsIndices(popup)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        });

        it('should follow a later resize of the host', async () => {
            await createPopup(300);
            reveal();
            expect(vsIndices(popup)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);

            popupHost.hostHeight.set(600);
            await settleUntil(() => vsItems(popup).length > 9);

            // 600px of 50px rows shows 0..12, plus an over-scan of 2.
            expect(Math.max(...vsIndices(popup))).toBe(14);
        });

        it('should keep the last measured size when the host is hidden', async () => {
            // The hint and the host disagree, so the window says which one is in use: the
            // 300px hint gives 9 rows, the 600px host gives 15.
            await createPopup(300);
            popupHost.hostHeight.set(600);
            reveal();
            await settleUntil(() => vsItems(popup).length === 15);
            expect(vsItems(popup).length).toBe(15);

            // A value that would be unmistakable if the input were read again.
            popupHost.initialViewportSize.set(2000);
            popupHost.open.set(false);
            await settle(popup, popupScroll);

            expect(vsItems(popup).length).toBe(15);
        });

        it('should render nothing for a host that is laid out with no size', async () => {
            await createPopup(300);
            popupHost.hostHeight.set(0);
            reveal();
            await settleUntil(() => vsItems(popup).length === 0);

            // Collapsed by its own layout rather than hidden, so zero is its real size and
            // the hint has no say in it.
            expect(vsItems(popup).length).toBe(0);
        });

        it('should collapse when a measured host is later given no size', async () => {
            await createPopup(300);
            popupHost.hostHeight.set(600);
            reveal();
            await settleUntil(() => vsItems(popup).length === 15);

            popupHost.hostHeight.set(0);
            await settleUntil(() => vsItems(popup).length === 0);

            expect(vsItems(popup).length).toBe(0);
        });

        it('should not start empty when the host is shown again', async () => {
            await createPopup(300);
            popupHost.hostHeight.set(600);
            reveal();
            await settleUntil(() => vsItems(popup).length === 15);

            popupHost.open.set(false);
            await settle(popup, popupScroll);
            reveal();

            expect(vsItems(popup).length).toBe(15);
        });

        for (const [label, value] of [
            ['negative', -300],
            ['NaN', Number.NaN],
            ['infinite', Number.POSITIVE_INFINITY],
        ] as [string, number][]) {
            it(`should treat a ${label} initial size as no hint at all`, async () => {
                await createPopup(value);
                reveal();

                expect(vsItems(popup).length).toBe(0);
            });
        }
    });

    describe('windowed data', () => {
        let windowFixture: ComponentFixture<TestWindowHostComponent>;
        let windowHost: TestWindowHostComponent;
        let windowScroll: IgxVirtualScrollComponent<unknown>;

        async function createWindowFixture(): Promise<void> {
            windowFixture = TestBed.createComponent(TestWindowHostComponent);
            windowHost = windowFixture.componentInstance;
            windowFixture.autoDetectChanges();
            await windowFixture.whenStable();
            windowScroll = windowHost.vs() as IgxVirtualScrollComponent<unknown>;
            await settle(windowFixture, windowScroll);
        }

        async function bindWindow(window: VirtualDataWindow<unknown> | null): Promise<void> {
            windowHost.window.set(window);
            await settle(windowFixture, windowScroll);
        }

        beforeEach(async () => {
            await createWindowFixture();
        });

        it('should behave like an ordinary array when no window is bound', async () => {
            windowHost.items.set(generateItems(40));
            await settle(windowFixture, windowScroll);

            expect(vsTrack(windowFixture).style.height).toBe(`${40 * 50}px`);
            expect(vsIndices(windowFixture)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        });

        it('should size the track from the whole collection', async () => {
            await bindWindow(windowHost.pageAt(0));

            expect(vsTrack(windowFixture).style.height).toBe(`${1000 * 50}px`);
        });

        it('should render a page that starts further in at its own indices', async () => {
            await bindWindow(windowHost.pageAt(400));
            await windowScroll.scrollToIndex(400);
            await settle(windowFixture, windowScroll);

            const rendered = vsIndices(windowFixture);
            expect(Math.min(...rendered)).toBeGreaterThanOrEqual(400);
            expect(Math.max(...rendered)).toBeLessThanOrEqual(419);
            expect(windowFixture.nativeElement.textContent).toContain('Item 400');
        });

        it('should report the whole collection as the item count', async () => {
            await bindWindow(windowHost.pageAt(0));

            // The template renders "index:count:item".
            expect(windowFixture.nativeElement.textContent).toContain('0:1000:Item 0');
        });

        it('should not render rows for indices the page does not cover', async () => {
            // The rendered range sits at the top of the collection, the page does not.
            await bindWindow(windowHost.pageAt(400));

            expect(vsItems(windowFixture).length).toBe(0);
        });

        it('should scroll to an index beyond the loaded page', async () => {
            await bindWindow(windowHost.pageAt(0));
            await windowScroll.scrollToIndex(900);
            await settle(windowFixture, windowScroll);

            expect(vsElement(windowFixture).scrollTop).toBeGreaterThan(0);
        });

        it('should keep the measured sizes when the page moves within the collection', async () => {
            await bindWindow(windowHost.pageAt(0));
            const resizeSpy = spyOn(engineOf(windowScroll), 'resize').and.callThrough();

            await bindWindow(windowHost.pageAt(400));

            // Nothing discarded: the indices still mean what they did, and the rows that
            // are rendered are measured again in the DOM.
            expect(resizeSpy.calls.mostRecent().args).toEqual([1000, 50, 1000]);
        });

        it('should not do work proportional to the collection when a page is re-fetched', async () => {
            await bindWindow(windowHost.objectPageAt(0));
            const resizeSpy = spyOn(engineOf(windowScroll), 'resize').and.callThrough();

            // The same records again as new objects, the way a deserialized response arrives.
            await bindWindow(windowHost.objectPageAt(0));

            expect(resizeSpy.calls.mostRecent().args).toEqual([1000, 50, 1000]);
        });

        it('should resize the track when the collection size changes', async () => {
            await bindWindow(windowHost.pageAt(0));
            expect(vsTrack(windowFixture).style.height).toBe(`${1000 * 50}px`);

            await bindWindow(windowHost.pageAt(0, 20, 400));

            expect(vsTrack(windowFixture).style.height).toBe(`${400 * 50}px`);
        });

        it('should go back to the ordinary array when the window is cleared', async () => {
            await bindWindow(windowHost.pageAt(400));

            windowHost.items.set(generateItems(40));
            await bindWindow(null);

            expect(vsTrack(windowFixture).style.height).toBe(`${40 * 50}px`);
            expect(vsIndices(windowFixture)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        });

        it('should ask for appended data again after the window is cleared', async () => {
            windowHost.items.set(generateItems(10));
            await settle(windowFixture, windowScroll);
            expect(windowHost.requests.length).toBe(1);

            await bindWindow(windowHost.pageAt(0));
            windowHost.requests.length = 0;

            // Back to the same array: the request the plain path had already made must not
            // stand in the way of making it again.
            await bindWindow(null);

            expect(windowHost.requests.length).toBe(1);
        });

        it('should measure a page that arrives after the list has scrolled to it', async () => {
            // The order a remote list actually goes in: a page is loaded, the list scrolls
            // past it, and the page covering where it landed arrives afterwards.
            await bindWindow(windowHost.pageAt(0));
            await windowScroll.scrollToIndex(400);
            await settle(windowFixture, windowScroll);
            expect(vsItems(windowFixture).length).toBe(0);

            windowHost.rowHeight.set(80);
            await bindWindow(windowHost.pageAt(400));

            // The rows that appeared have to be measured, or the collection keeps the
            // estimate for them and the scrollbar stays wrong.
            expect(vsItems(windowFixture).length).toBeGreaterThan(0);
            expect(engineOf(windowScroll).totalSize()).toBeGreaterThan(1000 * 50);
        });

        it('should report the range it needs and render it once that page arrives', async () => {
            await bindWindow(windowHost.pageAt(0));
            windowHost.states.length = 0;

            await windowScroll.scrollToIndex(400);
            await settle(windowFixture, windowScroll);

            const wanted = windowHost.states.at(-1)!;
            expect(wanted.startIndex).toBeGreaterThan(390);
            expect(wanted.endIndex).toBeGreaterThanOrEqual(wanted.startIndex);

            const count = wanted.endIndex - wanted.startIndex + 1;
            await bindWindow(windowHost.pageAt(wanted.startIndex, count));

            expect(vsIndices(windowFixture)).toContain(wanted.startIndex);
            expect(windowFixture.nativeElement.textContent)
                .toContain(`Item ${wanted.startIndex}`);
        });

        it('should not report a range again when the page it asked for arrives', async () => {
            // The list scrolls into a hole and reports the range it needs. The page that
            // answers it fills that hole without moving anything: the wanted range, the
            // viewport and the total size all keep the values already reported, because the
            // rows measure at the estimate.
            await bindWindow(windowHost.pageAt(0));
            await windowScroll.scrollToIndex(400);
            await settle(windowFixture, windowScroll);

            const wanted = windowHost.states.at(-1)!;
            const count = wanted.endIndex - wanted.startIndex + 1;
            windowHost.states.length = 0;

            await bindWindow(windowHost.pageAt(wanted.startIndex, count));

            // A consumer fetching a page for every report would otherwise ask for the page
            // it has just been given.
            expect(vsIndices(windowFixture)).toContain(wanted.startIndex);
            expect(windowHost.states.filter(state =>
                state.startIndex === wanted.startIndex && state.endIndex === wanted.endIndex)).toEqual([]);
        });

        it('should report a moved range whose loaded part has not changed', async () => {
            // Two loaded rows, and a viewport that reaches well past both of them. Moving
            // one row down changes the range the consumer is being asked for, while the
            // part of it that has data behind it stays exactly the same.
            await bindWindow({
                items: ['Item 400', 'Item 401'],
                startIndex: 400,
                totalCount: 1000,
            });

            await windowScroll.scrollToIndex(400);
            await settle(windowFixture, windowScroll);

            const first = windowHost.states.at(-1)!;

            await windowScroll.scrollToIndex(401);
            await settle(windowFixture, windowScroll);

            // The same two rows are rendered either way, so nothing about the DOM says the
            // request moved. The consumer loads pages from what it is told here.
            expect(vsIndices(windowFixture)).toEqual([400, 401]);
            expect(windowHost.states.at(-1)!.startIndex).toBe(first.startIndex + 1);
        });

        for (const [label, value, normalized] of [
            ['NaN', Number.NaN, 0],
            ['infinite', Number.POSITIVE_INFINITY, 0],
            ['negative', -400, 0],
            ['fractional', 400.7, 400],
        ] as [string, number, number][]) {
            it(`should normalize a ${label} start index`, async () => {
                await bindWindow({
                    items: generateItems(20),
                    startIndex: value,
                    totalCount: 1000,
                });

                expect(vsTrack(windowFixture).style.height).toBe(`${1000 * 50}px`);

                await windowScroll.scrollToIndex(normalized);
                await settle(windowFixture, windowScroll);

                // Only the page has data behind it, so the first rendered index is where the
                // page begins - which is the normalized start index and nothing else.
                expect(vsItems(windowFixture).length).toBeGreaterThan(0);
                expect(Math.min(...vsIndices(windowFixture))).toBe(normalized);
            });

            it(`should normalize a ${label} total count`, async () => {
                await bindWindow({
                    items: generateItems(20),
                    startIndex: 0,
                    totalCount: value,
                });

                // A page is trusted to be no longer than the collection it belongs to, so a
                // count that normalizes below the page it carries is raised to that page.
                const total = Math.max(normalized, 20);
                expect(vsTrack(windowFixture).style.height).toBe(`${total * 50}px`);
            });
        }

        it('should not ask for appended data while a window is bound', async () => {
            await bindWindow(windowHost.pageAt(0));
            windowHost.requests.length = 0;

            await windowScroll.scrollToIndex(999);
            await settle(windowFixture, windowScroll);

            expect(windowHost.requests).toEqual([]);
        });
    });

    describe('orientation', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should add the horizontal modifier class and size the track by width', async () => {
            host.useHorizontal();
            await settle(fixture, scroll);

            const element = vsElement(fixture);
            expect(element.classList).toContain('igx-virtual-scroll--horizontal');
            expect(vsTrack(fixture).style.width).toBe(`${100 * 50}px`);
            expect(vsContent(fixture).style.transform).toMatch(/translateX\(/);
        });

        it('should re-read the scroll offset from the new axis when it changes', async () => {
            host.useHorizontal();
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            await scrollTo(fixture, scroll, 500, 'left');
            expect(Math.min(...vsIndices(fixture))).toBeGreaterThan(0);

            // The vertical axis was never scrolled. A switch to it must render
            // from the top, not reuse the horizontal offset.
            host.useVertical();
            await settle(fixture, scroll);

            expect(Math.min(...vsIndices(fixture))).toBe(0);
        });
    });

    describe('scroll handling', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should not invalidate the window for a scroll that stays inside it', async () => {
            host.overScan.set(0);
            host.items.set(generateItems(500));
            await settle(fixture, scroll);

            const tick = () => (scroll as any)._scrollTick() as number;
            const before = tick();
            const element = vsElement(fixture);

            // Items are 50px tall and the over-scan is off, so any offset below
            // the first item boundary renders the same window.
            element.scrollTop = 10;
            element.dispatchEvent(new Event('scroll'));
            expect(tick()).toBe(before);

            element.scrollTop = 400;
            element.dispatchEvent(new Event('scroll'));
            expect(tick()).toBe(before + 1);
        });

        it('should render a later window after scrolling', async () => {
            host.items.set(generateItems(500));
            await settle(fixture, scroll);

            await scrollTo(fixture, scroll, 2000);

            expect(Math.min(...vsIndices(fixture))).toBeGreaterThan(0);
        });
    });

    describe('events', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should emit stateChange with the rendered window', () => {
            const state = host.states.at(-1);

            expect(state).toBeTruthy();
            expect(state!.startIndex).toBeLessThanOrEqual(state!.endIndex);
            expect(state!.viewportSize).toBeGreaterThan(0);
            expect(state!.totalSize).toBe(100 * 50);
        });

        it('should not re-emit stateChange when the window is unchanged', async () => {
            host.items.set(generateItems(500));
            await settle(fixture, scroll);

            host.states.length = 0;

            // A scroll inside the current window changes nothing.
            await scrollTo(fixture, scroll, 10);
            expect(host.states.length).toBe(0);

            await scrollTo(fixture, scroll, 2000);
            expect(host.states.length).toBeGreaterThan(0);
        });

        it('should emit dataRequest when the window reaches the end of data', async () => {
            host.items.set(generateItems(4));
            await settle(fixture, scroll);

            expect(host.requests.at(-1)).toEqual({ startIndex: 4, count: 20 });
        });

        it('should not re-request the same items when data is reassigned without growing', async () => {
            host.items.set(generateItems(4));
            await settle(fixture, scroll);

            host.requests.length = 0;

            // A consumer whose source is exhausted, but which still reassigns in
            // response to the request it cannot fulfil. Without the guard, this
            // loops for as long as the consumer answers.
            host.items.set(generateItems(4));
            await settle(fixture, scroll);
            host.items.set(generateItems(4));
            await settle(fixture, scroll);

            expect(host.requests.length).toBe(0);
        });

        it('should request again once data actually grows', async () => {
            host.items.set(generateItems(4));
            await settle(fixture, scroll);

            host.requests.length = 0;

            host.items.set(generateItems(8));
            await settle(fixture, scroll);

            expect(host.requests.at(-1)).toEqual({ startIndex: 8, count: 20 });
        });
    });

    describe('engine integration', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should resize the track when data changes', async () => {
            expect(vsTrack(fixture).style.height).toBe(`${100 * 50}px`);

            host.items.set(generateItems(200));
            await settle(fixture, scroll);

            expect(vsTrack(fixture).style.height).toBe(`${200 * 50}px`);
        });

        it('should apply a new estimatedItemSize when the item count is unchanged', async () => {
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            const engine = engineOf(scroll);
            expect(engine.totalSize()).toBe(1000 * 50);

            // `resize` is a no-op at an unchanged item count, so this only takes
            // effect through `updateEstimatedSize`.
            host.estimatedItemSize.set(80);
            await settle(fixture, scroll);

            // The rendered items keep their measured 50px, the rest follow 80px.
            expect(engine.getScrollOffsetForIndex(1)).toBe(50);
            expect(engine.totalSize()).toBeGreaterThan(1000 * 50);
            expect(engine.totalSize()).toBeLessThan(1000 * 80);
        });

        it('should retain measurements on append and discard them on replacement', async () => {
            host.items.set(generateItems(20));
            await settle(fixture, scroll);

            const engine = engineOf(scroll);
            const resizeSpy = spyOn(engine, 'resize').and.callThrough();

            // An append keeps the identity of each existing index, so all 20
            // measurements are retained.
            host.items.update((items) => [...items, ...generateItems(5)]);
            await settle(fixture, scroll);

            expect(resizeSpy.calls.mostRecent().args).toEqual([25, 50, 20]);

            // A replacement invalidates each index from the first difference on.
            host.items.update((items) => items.map((item) => `${item}!`));
            await settle(fixture, scroll);

            expect(resizeSpy.calls.mostRecent().args).toEqual([25, 50, 0]);
        });

        it('should discard stale measurements when data of the same length is swapped', async () => {
            host.items.set(generateItems(20));
            await settle(fixture, scroll);

            const engine = engineOf(scroll);
            const resizeSpy = spyOn(engine, 'resize').and.callThrough();

            // An identical item count used to make `resize` a no-op. That left
            // the previous data's measurements on the new items.
            host.items.set(generateItems(20).map((item) => `${item}!`));
            await settle(fixture, scroll);

            expect(resizeSpy.calls.mostRecent().args).toEqual([20, 50, 0]);
        });

        it('should not override the size of items already measured in the DOM', async () => {
            host.items.set(generateItems(20));
            host.hostHeight.set(100);
            host.itemHeight.set(30);
            await settle(fixture, scroll);

            const engine = engineOf(scroll);
            expect(engine.getScrollOffsetForIndex(1)).toBe(30);

            host.estimatedItemSize.set(200);
            await settle(fixture, scroll);

            // Item 0 was measured in the DOM, so the new estimate cannot move it,
            // while the unmeasured items at the end do follow it.
            expect(engine.getScrollOffsetForIndex(1)).toBe(30);
            expect(engine.totalSize()).toBeGreaterThan(20 * 30);
            expect(engine.totalSize()).toBeLessThan(20 * 200);
        });

        it('should re-measure reused item elements when they host a different index', async () => {
            host.items.set(generateItems(50));
            host.hostHeight.set(90);
            host.itemHeight.set(30);
            await settle(fixture, scroll);

            const element = vsElement(fixture);

            // Jump to the end. `@for` tracks by slot, so it reuses the wrapper
            // elements for the new indices at an identical size and the
            // ResizeObserver does not report that. Those indices used to keep
            // their estimated size, which left a gap between the last item and
            // the end of the track. Measurements at the bottom shrink the track,
            // so apply the jump again until the scroll height is stable.
            for (let i = 0; i < 10; i++) {
                const height = element.scrollHeight;
                await scrollTo(fixture, scroll, element.scrollHeight);

                if (element.scrollHeight === height) break;
            }

            const items = vsItems(fixture);
            const last = items[items.length - 1];

            expect(last.dataset['vsIndex']).toBe('49');
            expect(last.getBoundingClientRect().bottom).toBeCloseTo(
                vsTrack(fixture).getBoundingClientRect().bottom,
                0,
            );
        });
    });

    describe('scrollToIndex', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should scroll the vertical axis', async () => {
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            await scroll.scrollToIndex(100);

            expect(vsElement(fixture).scrollTop).toBe(100 * 50);
        });

        it('should scroll the horizontal axis', async () => {
            host.useHorizontal();
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            await scroll.scrollToIndex(100);

            expect(vsElement(fixture).scrollLeft).toBe(100 * 50);
        });

        it('should align the item to the center of the viewport', async () => {
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            await scroll.scrollToIndex(100, { block: 'center' });

            // 100 * 50 - (300 - 50) / 2
            expect(vsElement(fixture).scrollTop).toBe(5000 - 125);
        });

        it('should align the item to the trailing edge of the viewport', async () => {
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            await scroll.scrollToIndex(100, { block: 'end' });

            // 100 * 50 - (300 - 50)
            expect(vsElement(fixture).scrollTop).toBe(5000 - 250);
        });

        it('should settle at the last index instead of waiting out the scroll timeout', async () => {
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            const element = vsElement(fixture);

            // The aligned offset for the final item lies past the reachable
            // scroll range. Without a clamp, each correction pass would wait for
            // a `scrollend` that the browser never fires.
            await scroll.scrollToIndex(999, { block: 'end' });

            expect(element.scrollTop).toBe(element.scrollHeight - element.clientHeight);
        });

        it('should not scroll for block: nearest when the item is already in view', async () => {
            host.items.set(generateItems(1000));
            await settle(fixture, scroll);

            const element = vsElement(fixture);
            const scrollToSpy = spyOn(element, 'scrollTo').and.callThrough();

            await scroll.scrollToIndex(1, { block: 'nearest' });

            expect(scrollToSpy).not.toHaveBeenCalled();
            expect(element.scrollTop).toBe(0);
        });

        it('should leave an item that already fills the viewport alone for block: nearest', async () => {
            host.items.set(generateItems(20));
            host.estimatedItemSize.set(400);
            host.itemHeight.set(400);
            await settle(fixture, scroll);

            // Item 0 spans 0-400px and the viewport is 50-350px, so the item
            // covers it fully. The item cannot fit inside the viewport, but
            // there is also nothing to scroll to.
            await scrollTo(fixture, scroll, 50);

            const element = vsElement(fixture);
            const scrollToSpy = spyOn(element, 'scrollTo').and.callThrough();

            await scroll.scrollToIndex(0, { block: 'nearest' });

            expect(scrollToSpy).not.toHaveBeenCalled();
            expect(element.scrollTop).toBe(50);
        });

        it('should keep the requested index aligned once real sizes differ from the estimate', async () => {
            host.items.set(generateItems(500));
            host.itemHeight.set(30); // smaller than the estimate of 50
            await settle(fixture, scroll);

            await scroll.scrollToIndex(250);

            expect(Math.min(...vsIndices(fixture))).toBe(250 - host.overScan());
        });

        it('should clamp an out of range index', async () => {
            host.items.set(generateItems(20));
            await settle(fixture, scroll);

            const element = vsElement(fixture);
            await scroll.scrollToIndex(9999);

            expect(element.scrollTop).toBe(element.scrollHeight - element.clientHeight);
        });
    });

    describe('layoutComplete', () => {
        beforeEach(async () => {
            await createFixture();
        });

        it('should settle when no animation frames are served', async () => {
            const rafSpy = spyOn(window, 'requestAnimationFrame').and.returnValue(0);

            try {
                host.items.set(generateItems(200));
                fixture.detectChanges();
                await scroll.layoutComplete;
            } finally {
                rafSpy.and.callThrough();
            }

            expect(rafSpy).toHaveBeenCalled();
        });
    });

    describe('RTL', () => {
        let rtlFixture: ComponentFixture<TestRtlHostComponent>;
        let rtlScroll: IgxVirtualScrollComponent<string>;

        beforeEach(async () => {
            rtlFixture = TestBed.createComponent(TestRtlHostComponent);
            rtlFixture.autoDetectChanges();
            await rtlFixture.whenStable();
            rtlScroll = rtlFixture.componentInstance.vs() as IgxVirtualScrollComponent<string>;
            await settle(rtlFixture, rtlScroll);
        });

        it('should normalize the negative scrollLeft into a positive engine offset', async () => {
            // In RTL, browsers report scrollLeft as a negative value.
            await scrollTo(rtlFixture, rtlScroll, -500, 'left');

            expect(Math.min(...vsIndices(rtlFixture))).toBeGreaterThan(0);
        });

        it('should apply a negative translateX on the content wrapper when scrolled', async () => {
            await scrollTo(rtlFixture, rtlScroll, -300, 'left');

            expect(vsContent(rtlFixture).style.transform).toMatch(
                /translateX\(-\d+(\.\d+)?px\)/,
            );
        });

        it('should scroll to a negative scrollLeft via scrollToIndex', async () => {
            const element = vsElement(rtlFixture);
            const scrollToSpy = spyOn(element, 'scrollTo').and.callThrough();

            await rtlScroll.scrollToIndex(100);

            expect(scrollToSpy).toHaveBeenCalled();
            const args = scrollToSpy.calls.mostRecent().args[0] as ScrollToOptions;
            expect(args.left).toBeLessThan(0);
        });

        it('should render the first data item as the right-most item', () => {
            const items = vsItems(rtlFixture);
            expect(items.length).toBeGreaterThan(1);

            const indices = vsIndices(rtlFixture);
            // DOM order is ascending by data index...
            expect(indices[0]).toBeLessThan(indices[1]);

            // ...but visually the lowest index sits to the right of the next.
            expect(items[0].getBoundingClientRect().left).toBeGreaterThan(
                items[1].getBoundingClientRect().left,
            );
        });
    });
});
