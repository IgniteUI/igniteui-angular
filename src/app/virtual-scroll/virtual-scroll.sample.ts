import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { IgxVirtualScrollComponent, IgxVirtualItemDirective, VirtualScrollDataRequest } from 'igniteui-angular/virtual-scroll';

export interface VsSampleItem {
    id: number;
    label: string;
    height: number;
    color: string;
}

export interface VsHorizontalItem {
    label: string;
    width: number;
    color: string;
}

const COLORS = ['#5f4cf1', '#2196f3', '#4caf50', '#ff9800', '#e91e63'];

function makeItems(start: number, count: number): VsSampleItem[] {
    return Array.from({ length: count }, (_, i) => {
        const id = start + i;
        return {
            id,
            label: `Item #${id}`,
            height: 40 + (id % 5) * 20,
            color: COLORS[id % COLORS.length],
        };
    });
}

@Component({
    selector: 'app-virtual-scroll-sample',
    templateUrl: './virtual-scroll.sample.html',
    styleUrls: ['./virtual-scroll.sample.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxVirtualScrollComponent, IgxVirtualItemDirective],
})
export class VirtualScrollSampleComponent {
    protected readonly verticalScroll =
        viewChild<IgxVirtualScrollComponent<VsSampleItem>>('verticalScroll');

    protected readonly verticalItems = signal<VsSampleItem[]>(makeItems(0, 1_000_000));
    protected readonly verticalConstantItems = signal<VsSampleItem[]>(
        Array.from({ length: 500 }, (_, i) => ({
            id: i,
            label: `Row ${i}`,
            height: 48,
            color: COLORS[i % COLORS.length],
        }))
    );
    protected readonly horizontalItems = signal<string[]>(
        Array.from({ length: 200 }, (_, i) => `Col ${i}`)
    );
    protected readonly horizontalVariableItems = signal<VsHorizontalItem[]>(
        Array.from({ length: 300 }, (_, i) => ({
            label: `Col ${i}`,
            width: 60 + (i % 7) * 30,
            color: COLORS[i % COLORS.length],
        }))
    );
    protected readonly remoteItems = signal<string[]>(makeItems(0, 20).map(it => it.label));
    protected readonly isLoading = signal(false);

    protected readonly targetIndex = signal(500_000);
    protected readonly alignment = signal<ScrollLogicalPosition>('start');
    protected readonly smoothScroll = signal(false);
    protected readonly isScrolling = signal(false);

    /**
     * Items outside the rendered window have only an estimated size, so the
     * first jump lands near the target rather than on it. `scrollToIndex`
     * measures the items there and corrects itself; the promise resolves once
     * the position is stable.
     */
    protected async scrollToTarget(): Promise<void> {
        const scroll = this.verticalScroll();
        if (!scroll) return;

        this.isScrolling.set(true);
        try {
            await scroll.scrollToIndex(this.targetIndex(), {
                block: this.alignment(),
                behavior: this.smoothScroll() ? 'smooth' : 'auto',
            });
        } finally {
            this.isScrolling.set(false);
        }
    }

    /** Append 20 more items when the virtual scroll requests more data. */
    protected onDataRequest(req: VirtualScrollDataRequest): void {
        if (this.isLoading()) return;
        this.isLoading.set(true);

        // Simulate an async fetch with a short delay
        setTimeout(() => {
            const current = this.remoteItems();
            const next = [
                ...current,
                ...Array.from({ length: req.count }, (_, i) => `Remote item ${current.length + i}`),
            ];
            this.remoteItems.set(next);
            this.isLoading.set(false);
        }, Math.random() * 1000 + 500); // Random delay between 500ms and 1500ms
    }
}
