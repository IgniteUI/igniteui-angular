import { ElementRef } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { IgxForOfToken } from 'igniteui-angular/directives';
import { IgxVirtualScrollComponent } from 'igniteui-angular/virtual-scroll';
import { Navigate } from './drop-down.common';

/** Match the index/count normalization used by `IgxVirtualScrollComponent.dataWindow`. */
function toCount(value: number): number {
    const count = Math.trunc(Number(value));
    return Number.isFinite(count) ? Math.max(0, count) : 0;
}

/**
 * @hidden @internal
 *
 * What differs between a projected `*igxFor` and a projected `igx-virtual-scroll`, so the
 * drop-down keeps one path for navigation, scrolling and active-descendant tracking.
 * Items are addressed by their index in the whole collection, not in the loaded subset.
 */
export interface IgxDropDownVirtualization {
    /** How many items the collection has, including any a remote service has not sent. */
    readonly length: number;

    /** The collection index the loaded items begin at; 0 unless the collection is paged. */
    readonly startIndex: number;

    /** The element that scrolls, for listeners and for restoring the offset on reopen. */
    readonly scrollElement: HTMLElement;

    /** Scroll offset of the virtualized viewport. */
    scrollPosition: number;

    /** The item at a collection index, or `undefined` when it is not loaded. */
    itemAt(index: number): any;

    /** The collection index of the first loaded item that matches, or -1. */
    findIndex(predicate: (item: any) => boolean): number;

    /** Whether an index currently has an element in the DOM. */
    isIndexRendered(index: number): boolean;

    /** Brings `index` into view, then runs `onRendered` once an element exists for it. */
    scrollToIndex(index: number, direction: Navigate, onRendered: () => void): void;

    /** Puts `index` in the middle of the viewport, for revealing the selection on open. */
    alignToIndex(index: number): void;

    /** Runs `callback` whenever the rendered window changes. */
    onWindowChange(callback: () => void): void;

    /** Drops the subscriptions, for when the projected content is replaced. */
    disconnect(): void;
}

/** The virtualization a drop-down was given, or `null` when its items are all rendered. */
export function createDropDownVirtualization(
    forOf: IgxForOfToken<any> | undefined,
    virtualScroll: IgxVirtualScrollComponent<any> | undefined,
    virtualScrollRef: ElementRef<HTMLElement> | undefined
): IgxDropDownVirtualization | null {
    if (virtualScroll && virtualScrollRef) {
        return new VirtualScrollVirtualization(virtualScroll, virtualScrollRef);
    }
    return forOf ? new ForOfVirtualization(forOf) : null;
}

/** Items virtualized by a projected `igx-virtual-scroll`, which is itself the scrolling element. */
class VirtualScrollVirtualization implements IgxDropDownVirtualization {
    private readonly _disconnect = new Subject<void>();

    constructor(
        private _scroll: IgxVirtualScrollComponent<any>,
        private _ref: ElementRef<HTMLElement>
    ) { }

    public get length(): number {
        const window = this._scroll.dataWindow();
        return window
            ? Math.max(toCount(window.totalCount), this.startIndex + (window.items?.length ?? 0))
            : (this._scroll.data() ?? []).length;
    }

    public get startIndex(): number {
        return toCount(this._scroll.dataWindow()?.startIndex ?? 0);
    }

    public get scrollElement(): HTMLElement {
        return this._ref.nativeElement;
    }

    public get scrollPosition(): number {
        return this.scrollElement.scrollTop;
    }

    public set scrollPosition(value: number) {
        this.scrollElement.scrollTop = value ?? 0;
    }

    public itemAt(index: number): any {
        const window = this._scroll.dataWindow();
        return window
            ? window.items?.[index - this.startIndex]
            : (this._scroll.data() ?? [])[index];
    }

    public findIndex(predicate: (item: any) => boolean): number {
        const window = this._scroll.dataWindow();
        const items = (window ? window.items : this._scroll.data()) ?? [];
        const found = items.findIndex(predicate);
        return found < 0 ? -1 : found + this.startIndex;
    }

    /** `stateChange` reports the range wanted, which reaches past the rows that arrived. */
    public isIndexRendered(index: number): boolean {
        return !!this._ref.nativeElement.querySelector(`[data-vs-index="${index}"]`);
    }

    /** `'nearest'` leaves the offset alone when the item is already fully in view. */
    public scrollToIndex(index: number, _direction: Navigate, onRendered: () => void): void {
        const wasRendered = this.isIndexRendered(index);
        const scrolled = this._scroll.scrollToIndex(index, { block: 'nearest' });

        if (wasRendered) {
            onRendered();
            return;
        }
        void scrolled.then(onRendered);
    }

    public alignToIndex(index: number): void {
        void this._scroll.scrollToIndex(index, { block: 'center' });
    }

    public onWindowChange(callback: () => void): void {
        outputToObservable(this._scroll.stateChange)
            .pipe(takeUntil(this._disconnect))
            .subscribe(() => callback());
    }

    public disconnect(): void {
        this._disconnect.next();
        this._disconnect.complete();
    }
}

/** Items virtualized by a projected `*igxFor`, which keeps a scrollbar of its own. */
class ForOfVirtualization implements IgxDropDownVirtualization {
    private readonly _disconnect = new Subject<void>();

    /** `*igxFor` is bound to the whole collection, so it always starts at its beginning. */
    public readonly startIndex = 0;

    constructor(private _forOf: IgxForOfToken<any>) { }

    public get length(): number {
        return this._forOf.totalItemCount || this._items.length;
    }

    public get scrollElement(): HTMLElement {
        return this._forOf.getScroll()!;
    }

    public get scrollPosition(): number {
        return this._forOf.scrollPosition;
    }

    public set scrollPosition(value: number) {
        this._forOf.scrollPosition = value;
    }

    public itemAt(index: number): any {
        return this._items[index];
    }

    public findIndex(predicate: (item: any) => boolean): number {
        return this._items.findIndex(predicate);
    }

    public isIndexRendered(index: number): boolean {
        const { startIndex, chunkSize } = this._forOf.state;
        return index >= startIndex! && index < startIndex! + chunkSize!;
    }

    public scrollToIndex(index: number, direction: Navigate, onRendered: () => void): void {
        if (!this._needsScroll(index, direction)) {
            onRendered();
            return;
        }

        this._forOf.scrollTo(index);
        this._forOf.chunkLoad.pipe(take(1)).subscribe(() => onRendered());
    }

    public alignToIndex(index: number): void {
        const itemSize = this._forOf.igxForItemSize as number;
        const itemsInView = (this._forOf.igxForContainerSize as number) / itemSize;

        this._forOf.getScroll()!.scrollTop =
            this._forOf.getScrollForIndex(index) - (itemsInView / 2 - 1) * itemSize;
    }

    public onWindowChange(callback: () => void): void {
        this._forOf.chunkLoad.pipe(takeUntil(this._disconnect)).subscribe(() => callback());
    }

    public disconnect(): void {
        this._disconnect.next();
        this._disconnect.complete();
    }

    /** `*igxFor` is bound to the whole collection, so its indices are already global. */
    private get _items(): any[] {
        return this._forOf.igxForOf ?? [];
    }

    /** Whether `index` is outside the loaded chunk, or inside it but off screen. */
    private _needsScroll(index: number, direction: Navigate): boolean {
        const currentPosition = this._forOf.getScroll()!.scrollTop;
        const itemPosition = this._forOf.getScrollForIndex(index, direction === Navigate.Down);

        const offScreen = direction === Navigate.Down
            ? currentPosition < itemPosition
            : currentPosition > itemPosition;

        return !this.isIndexRendered(index) || offScreen;
    }
}
