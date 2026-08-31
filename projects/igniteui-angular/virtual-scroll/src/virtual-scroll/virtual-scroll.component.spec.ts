import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { VirtualScrollEngine } from './scroll-engine';
import {
    IgxVsItemContext,
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
