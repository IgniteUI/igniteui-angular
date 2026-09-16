import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, inject, signal, viewChild
} from '@angular/core';
import { IForOfState } from 'igniteui-angular/directives';
import { IgxSimpleComboComponent } from 'igniteui-angular/simple-combo';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxButtonDirective, IgxForOfDirective, IgxToggleActionDirective } from 'igniteui-angular/directives';
import { IgxVirtualScrollComponent, IgxVirtualItemDirective } from 'igniteui-angular/virtual-scroll';
import { IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective } from 'igniteui-angular/drop-down';
import { IgxSwitchComponent } from 'igniteui-angular/switch';
import { IgxComboBaseDirective, IgxComboComponent } from 'igniteui-angular/combo';
import {
    ConnectedPositioningStrategy, HorizontalAlignment, OverlaySettings, VerticalAlignment
} from 'igniteui-angular/core';
import { DATA } from './data';

export interface CompareItem {
    id: number;
    name: string;
    /** Text long enough to wrap over one to four lines when heights are content-sized. */
    detail: string;
}

/** What the scroll engine assumes an item is, next to what it really is. */
export interface SizeEstimate {
    realRowHeight: number;
    assumedPerItem: number;
    trackHeight: number;
    trackShouldBe: number;
}

/** One row of the results table. */
export interface BenchRow {
    metric: string;
    unit: string;
    forOf: number;
    vs: number;
    /** Which way is better for this metric. */
    lowerIsBetter: boolean;
}

/** The same source list ten times over, with ids kept unique. */
function buildItems(seed: number): CompareItem[] {
    return Array.from({ length: 10 }, (_, pass) =>
        DATA.map((record, index) => ({
            id: seed + pass * DATA.length + index,
            name: record.ProductName,
            detail: `${record.QuantityPerUnit} `.repeat(1 + (index % 4)).trim()
        }))
    ).flat();
}

const MILLION = 1_000_000;

/**
 * The item at a given index, worked out from the index instead of stored. A million of these
 * exist as far as a combo is concerned; only the ones asked for are ever built.
 */
function millionItem(index: number): CompareItem {
    const record = DATA[index % DATA.length];
    return {
        id: index,
        name: `${record.ProductName} #${index}`,
        detail: record.QuantityPerUnit
    };
}

function millionPage(startIndex: number, count: number): CompareItem[] {
    const end = Math.min(startIndex + count, MILLION);
    const page: CompareItem[] = [];
    for (let i = Math.max(0, startIndex); i < end; i++) {
        page.push(millionItem(i));
    }
    return page;
}

/** The page size to serve when the combo has not reported a window yet. */
const FIRST_PAGE = 24;

/**
 * Rows to serve on each side of the window the combo asked for. Without it the first row
 * scrolled into view is one the page does not cover yet, and shows up blank for a frame.
 */
const PAGE_MARGIN = 10;

/**
 * Stands in for a remote service over a million rows: it answers with the page the combo
 * asks for and nothing else. Two combos each need their own, because each has its own
 * scroll position and therefore its own window.
 */
class PagedMillion {
    public readonly page = signal<CompareItem[]>(millionPage(0, FIRST_PAGE));
    public readonly pagesServed = signal(0);
    public readonly window = signal('0 - 23');

    /** Answers a `dataPreLoad`: the combo reports the window, this fills it. */
    public serve(state: IForOfState): void {
        const start = Math.max(0, (state.startIndex ?? 0) - PAGE_MARGIN);
        const count = (state.chunkSize || FIRST_PAGE) + 2 * PAGE_MARGIN;

        this.page.set(millionPage(start, count));
        this.pagesServed.update(n => n + 1);
        this.window.set(`${start} - ${Math.min(start + count, MILLION) - 1}`);
    }
}

/** A frame longer than this reads as a stutter. */
const DROPPED_FRAME_MS = 20;
/** How often the live meters push their counters into the view. */
const PUBLISH_EVERY_MS = 250;

const frame = () => new Promise<number>(resolve => requestAnimationFrame(resolve));
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Frame-time meter. Counts in fields, publishes rarely: a signal write per frame would itself
 *  schedule change detection at 60 Hz and look like the stutter being measured. */
class FrameMeter {
    public readonly worst = signal(0);
    public readonly dropped = signal(0);
    public readonly frames = signal(0);

    private _worst = 0;
    private _dropped = 0;
    private _frames = 0;
    private _handle = 0;
    private _publishedAt = 0;

    public reset(): void {
        this._worst = this._dropped = this._frames = this._publishedAt = 0;
        this.publish();
    }

    public tick(): void {
        if (this._handle) {
            return;
        }
        const start = performance.now();
        this._handle = requestAnimationFrame(() => {
            this._handle = 0;
            const elapsed = performance.now() - start;

            this._frames++;
            this._worst = Math.max(this._worst, elapsed);
            if (elapsed > DROPPED_FRAME_MS) {
                this._dropped++;
            }

            const now = performance.now();
            if (now - this._publishedAt > PUBLISH_EVERY_MS) {
                this._publishedAt = now;
                this.publish();
            }
        });
    }

    public publish(): void {
        this.worst.set(Math.round(this._worst * 10) / 10);
        this.dropped.set(this._dropped);
        this.frames.set(this._frames);
    }
}

/** The two elements a benchmark needs: the visible box, and whatever actually scrolls. */
interface Target {
    viewport: HTMLElement;
    scroller: HTMLElement;
}

@Component({
    selector: 'app-virtualization-compare-sample',
    templateUrl: './virtualization-compare.sample.html',
    styleUrls: ['./virtualization-compare.sample.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DecimalPipe,
        FormsModule,
        IgxForOfDirective,
        IgxVirtualScrollComponent,
        IgxVirtualItemDirective,
        IgxButtonDirective,
        IgxSwitchComponent,
        IgxDropDownComponent,
        IgxDropDownItemComponent,
        IgxDropDownItemNavigationDirective,
        IgxToggleActionDirective,
        IgxComboComponent,
        IgxSimpleComboComponent
    ]
})
export class VirtualizationCompareSampleComponent implements AfterViewInit, OnDestroy {
    private readonly zone = inject(NgZone);
    private readonly teardown: Array<() => void> = [];

    protected readonly forOfDir = viewChild<IgxForOfDirective<CompareItem>>(IgxForOfDirective);
    protected readonly virtualScroll = viewChild<IgxVirtualScrollComponent<CompareItem>>('virtualScroll');
    // read: ElementRef must be given at runtime; the generic alone would return the component.
    protected readonly virtualScrollRef = viewChild('virtualScroll', { read: ElementRef });
    protected readonly forOfHost = viewChild<ElementRef<HTMLElement>>('forOfHost');

    /**
     * One array per pane, built from the same seed so both hold identical data. They are
     * separate signals so that replacing the data of one does not re-render the other and
     * put its work inside the measurement.
     */
    protected readonly forOfItems = signal<CompareItem[]>(buildItems(0));
    protected readonly vsItems = signal<CompareItem[]>(buildItems(0));
    /** Content-sized items, which is what the two engines disagree about most. */
    protected readonly variableHeights = signal(false);
    protected readonly targetIndex = signal(5000);

    protected readonly forOfMeter = new FrameMeter();
    protected readonly vsMeter = new FrameMeter();

    protected readonly results = signal<BenchRow[]>([]);
    protected readonly comboEstimate = signal<SizeEstimate | null>(null);
    protected readonly running = signal('');

    /**
     * Only one section is rendered at a time. Several virtualized lists over the same 10,600
     * items on one page compete for the main thread, which shows up as dropped frames in
     * whichever one you happen to be scrolling.
     */
    protected readonly section = signal<'lists' | 'combo' | 'dropdowns' | 'million'>('lists');

    /** Extra rows kept rendered above and below the viewport. */
    protected readonly overScan = signal(2);
    protected readonly itemSize = 48;
    protected readonly containerSize = 480;

    /** Opens upwards; the drop-downs sit low on the page. */
    protected readonly dropUp: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy({
            horizontalDirection: HorizontalAlignment.Right,
            horizontalStartPoint: HorizontalAlignment.Left,
            verticalDirection: VerticalAlignment.Top,
            verticalStartPoint: VerticalAlignment.Top
        })
    };

    protected get total(): number {
        return this.vsItems().length;
    }

    protected readonly MILLION = MILLION;

    /** A million rows held as one array, built on demand: it costs a few hundred megabytes. */
    protected readonly millionItems = signal<CompareItem[] | null>(null);
    protected readonly millionBuildMs = signal(0);

    /** The same million served a page at a time, which costs a page. */
    protected readonly pagedCombo = new PagedMillion();
    protected readonly pagedSimple = new PagedMillion();

    private readonly pagedComboRef = viewChild<IgxComboComponent>('pagedComboRef');
    private readonly pagedSimpleRef = viewChild<IgxSimpleComboComponent>('pagedSimpleRef');

    /** Materializes the million. Blocks for a moment, which is the point of the button. */
    protected buildMillion(): void {
        const start = performance.now();
        const items = new Array<CompareItem>(MILLION);

        for (let i = 0; i < MILLION; i++) {
            items[i] = millionItem(i);
        }

        this.millionBuildMs.set(Math.round(performance.now() - start));
        this.millionItems.set(items);
    }

    protected releaseMillion(): void {
        this.millionItems.set(null);
        this.millionBuildMs.set(0);
    }

    /**
     * Serves the window the combo reports. `totalItemCount` is what makes the scrollbar span
     * the whole collection while the array holds one page.
     */
    protected servePage(combo: IgxComboBaseDirective, source: PagedMillion): void {
        combo.totalItemCount = MILLION;
        source.serve(combo.virtualizationState);
    }

    public ngAfterViewInit(): void {
        // Set before the first window is rendered, so the scrollbar starts out the right length.
        for (const combo of [this.pagedComboRef(), this.pagedSimpleRef()]) {
            if (combo) {
                combo.totalItemCount = MILLION;
            }
        }

        // Outside Angular: a (scroll) template binding would run CD on every scroll event.
        this.zone.runOutsideAngular(() => {
            for (const [element, meter] of this.meterTargets()) {
                const handler = () => meter.tick();
                element.addEventListener('scroll', handler, { passive: true, capture: true });
                this.teardown.push(() =>
                    element.removeEventListener('scroll', handler, { capture: true } as any));
            }
        });
    }

    public ngOnDestroy(): void {
        this.teardown.forEach(fn => fn());
    }

    private meterTargets(): Array<[HTMLElement, FrameMeter]> {
        const pairs: Array<[HTMLElement | undefined, FrameMeter]> = [
            [this.forOfHost()?.nativeElement, this.forOfMeter],
            [this.virtualScrollRef()?.nativeElement as HTMLElement | undefined, this.vsMeter]
        ];
        return pairs.filter((pair): pair is [HTMLElement, FrameMeter] => !!pair[0]);
    }

    //#region Manual controls

    protected resetMeters(): void {
        this.forOfMeter.reset();
        this.vsMeter.reset();
    }

    /** Flushes whatever the meters collected since their last publish. */
    protected refreshMeters(): void {
        this.forOfMeter.publish();
        this.vsMeter.publish();
    }

    protected toggleHeights(value: boolean): void {
        this.variableHeights.set(value);
        this.resetMeters();
    }

    protected async scrollBoth(): Promise<void> {
        const index = Math.max(0, Math.min(this.total - 1, this.targetIndex()));
        this.resetMeters();
        this.forOfDir()?.scrollTo(index);
        await this.virtualScroll()?.scrollToIndex(index);
    }

    /** Twelve large jumps, so the blank frames are visible by eye. */
    protected async flingBoth(): Promise<void> {
        this.resetMeters();
        for (let i = 0; i < 12; i++) {
            const index = Math.round(this.total * ((i * 0.37 + 0.11) % 1));
            this.forOfDir()?.scrollTo(index);
            void this.virtualScroll()?.scrollToIndex(index);
            await delay(120);
        }
        this.refreshMeters();
    }

    protected scrollTop(): void {
        this.resetMeters();
        this.forOfDir()?.scrollTo(0);
        void this.virtualScroll()?.scrollToIndex(0);
    }

    //#endregion

    //#region Benchmark

    /** The visible box and the element that scrolls, for each engine. */
    private target(which: 'forOf' | 'vs'): Target | null {
        if (which === 'vs') {
            const host = this.virtualScrollRef()?.nativeElement as HTMLElement | undefined;
            return host ? { viewport: host, scroller: host } : null;
        }
        const viewport = this.forOfHost()?.nativeElement;
        const scroller = this.forOfDir()?.getScroll();
        return viewport && scroller ? { viewport, scroller } : null;
    }

    /** Pixels of the visible box no rendered row covers; near the viewport height means empty. */
    private uncovered({ viewport }: Target): number {
        const box = viewport.getBoundingClientRect();
        const rects = Array.from(viewport.querySelectorAll('.vc__row'))
            .map(row => row.getBoundingClientRect());

        if (!rects.length) {
            return Math.round(box.height);
        }

        const top = Math.min(...rects.map(r => r.top));
        const bottom = Math.max(...rects.map(r => r.bottom));
        return Math.round(Math.max(0, top - box.top) + Math.max(0, box.bottom - bottom));
    }

    /** Drives one engine through `steps` positions, one per frame, recording what each frame cost. */
    private async sweep(which: 'forOf' | 'vs', steps: number, stepPx: number) {
        const target = this.target(which);
        if (!target) {
            return null;
        }

        target.scroller.scrollTop = 0;
        target.scroller.dispatchEvent(new Event('scroll'));
        await frame(); await frame(); await frame();

        const frames: number[] = [];
        let last = performance.now();

        for (let i = 1; i <= steps; i++) {
            target.scroller.scrollTop = i * stepPx;
            target.scroller.dispatchEvent(new Event('scroll'));
            await frame();

            const now = performance.now();
            frames.push(now - last);
            last = now;
        }

        return {
            worstFrame: Math.max(...frames),
            droppedFrames: frames.filter(f => f > DROPPED_FRAME_MS).length,
            sampled: steps
        };
    }

    /** Median of several sweeps; frame timings swing too much for a single pass to prove anything. */
    private async sweepMedian(which: 'forOf' | 'vs', steps: number, stepPx: number, passes = 3) {
        const runs: Array<NonNullable<Awaited<ReturnType<typeof this.sweep>>>> = [];
        for (let i = 0; i < passes; i++) {
            const result = await this.sweep(which, steps, stepPx);
            if (result) {
                runs.push(result);
            }
        }
        if (!runs.length) {
            return null;
        }

        const median = (pick: (r: typeof runs[0]) => number) => {
            const values = runs.map(pick).sort((a, b) => a - b);
            return values[Math.floor(values.length / 2)];
        };

        return {
            worstFrame: median(r => r.worstFrame),
            droppedFrames: median(r => r.droppedFrames),
            sampled: runs[0].sampled
        };
    }

    /** Time from asking for an index until a row carrying it is actually on screen. */
    private async seekLatency(which: 'forOf' | 'vs', index: number): Promise<number> {
        const target = this.target(which);
        if (!target) {
            return 0;
        }

        target.scroller.scrollTop = 0;
        target.scroller.dispatchEvent(new Event('scroll'));
        await frame(); await frame();

        const start = performance.now();
        if (which === 'vs') {
            void this.virtualScroll()?.scrollToIndex(index);
        } else {
            this.forOfDir()?.scrollTo(index);
        }

        // Wait until a rendered row reports the index we asked for.
        for (let i = 0; i < 120; i++) {
            await frame();
            const found = Array.from(target.viewport.querySelectorAll('.vc__index'))
                .some(el => Number(el.textContent) === index);
            if (found) {
                break;
            }
        }
        return performance.now() - start;
    }

    /** Time from swapping the whole data array until rows are on screen again. */
    private async rebindLatency(which: 'forOf' | 'vs'): Promise<number> {
        const target = this.target(which);
        if (!target) {
            return 0;
        }

        const items = buildItems(Math.round(Math.random() * 1e6));
        const start = performance.now();
        this.zone.run(() => (which === 'vs' ? this.vsItems : this.forOfItems).set(items));

        for (let i = 0; i < 120; i++) {
            await frame();
            if (target.viewport.querySelectorAll('.vc__row').length > 0 && this.uncovered(target) < 4) {
                break;
            }
        }
        return performance.now() - start;
    }

    /** Runs every scenario against both engines and fills the results table. */
    protected async runBenchmark(): Promise<void> {
        const rows: BenchRow[] = [];
        const add = (metric: string, unit: string, forOf: number, vs: number, lowerIsBetter = true) =>
            rows.push({
                metric, unit, lowerIsBetter,
                forOf: Math.round(forOf * 10) / 10,
                vs: Math.round(vs * 10) / 10
            });

        await this.zone.runOutsideAngular(async () => {
            this.setRunning('fast scroll');
            const flingFor = await this.sweepMedian('forOf', 40, 600);
            const flingVs = await this.sweepMedian('vs', 40, 600);

            this.setRunning('slow scroll');
            const steadyFor = await this.sweepMedian('forOf', 60, 160);
            const steadyVs = await this.sweepMedian('vs', 60, 160);

            this.setRunning('jump to a far item');
            const seekFor = await this.medianOf(() => this.seekLatency('forOf', this.total - 200));
            const seekVs = await this.medianOf(() => this.seekLatency('vs', this.total - 200));

            this.setRunning('replacing the data');
            const bindFor = await this.rebindLatency('forOf');
            const bindVs = await this.rebindLatency('vs');

            if (flingFor && flingVs) {
                add('Fast scroll - slowest frame', 'ms', flingFor.worstFrame, flingVs.worstFrame);
                add('Fast scroll - frames slower than 20ms', `of ${flingFor.sampled}`, flingFor.droppedFrames, flingVs.droppedFrames);
            }
            if (steadyFor && steadyVs) {
                add('Slow scroll - slowest frame', 'ms', steadyFor.worstFrame, steadyVs.worstFrame);
                add('Slow scroll - frames slower than 20ms', `of ${steadyFor.sampled}`, steadyFor.droppedFrames, steadyVs.droppedFrames);
            }
            add('Jump to a far item - time until it is visible', 'ms', seekFor, seekVs);
            add('Replace all the data - time until rows are back', 'ms', bindFor, bindVs);
            add('Rows kept in the DOM', 'rows', this.countRows('forOf'), this.countRows('vs'), false);
            add('DOM elements in the list', 'elements', this.countNodes('forOf'), this.countNodes('vs'));
        });

        this.zone.run(() => {
            this.results.set(rows);
            this.running.set('');
            this.refreshMeters();
        });
    }

    /** Median of three passes of any single-number measurement. */
    private async medianOf(measure: () => Promise<number>, passes = 3): Promise<number> {
        const values: number[] = [];
        for (let i = 0; i < passes; i++) {
            values.push(await measure());
        }
        values.sort((a, b) => a - b);
        return values[Math.floor(values.length / 2)];
    }

    /**
     * Reads what the engine assumes an item is from the height of the track, and compares it
     * with a row that is actually rendered. They should match; a difference means the scroll
     * position maps to the wrong item until the rows around it have been measured.
     */
    protected measureComboEstimate(): void {
        const host = document.querySelector('.igx-combo__content igx-virtual-scroll');
        const row = host?.querySelector('.igx-drop-down__item');
        const track = host?.querySelector('.igx-vs__track');

        if (!host || !row || !track) {
            this.comboEstimate.set(null);
            return;
        }

        const realRowHeight = Math.round(row.getBoundingClientRect().height * 10) / 10;
        const trackHeight = Math.round(track.getBoundingClientRect().height);

        this.comboEstimate.set({
            realRowHeight,
            assumedPerItem: Math.round(trackHeight / this.total * 10) / 10,
            trackHeight,
            trackShouldBe: Math.round(realRowHeight * this.total)
        });
    }

    private setRunning(label: string): void {
        this.zone.run(() => this.running.set(label));
    }

    private countRows(which: 'forOf' | 'vs'): number {
        return this.target(which)?.viewport.querySelectorAll('.vc__row').length ?? 0;
    }

    private countNodes(which: 'forOf' | 'vs'): number {
        return this.target(which)?.viewport.querySelectorAll('*').length ?? 0;
    }

    /** Names the engine that comes out ahead on a row, for the table's last column. */
    protected verdict(row: BenchRow): string {
        if (row.forOf === row.vs) {
            return 'tie';
        }
        const vsWins = row.lowerIsBetter ? row.vs < row.forOf : row.vs > row.forOf;
        return vsWins ? 'igx-virtual-scroll' : '*igxFor';
    }

    //#endregion
}
