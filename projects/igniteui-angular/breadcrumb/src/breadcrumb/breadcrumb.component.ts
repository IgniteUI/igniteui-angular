import {
    AfterContentInit,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    QueryList,
    numberAttribute
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IgxBreadcrumbItemComponent } from './breadcrumb-item.component';
import { IgxBreadcrumbSeparatorDirective } from './breadcrumb.directives';
import { BreadcrumbType } from './breadcrumb.common';

let NEXT_ID = 0;

/**
 * IgxBreadcrumb provides a navigation aid showing the user's location in a website hierarchy.
 *
 * @igxModule IgxBreadcrumbModule
 *
 * @igxTheme igx-breadcrumb-theme
 *
 * @igxKeywords breadcrumb, navigation, trail
 *
 * @igxGroup Navigation
 *
 * @remarks
 * The Ignite UI for Angular Breadcrumb component provides a navigation trail showing
 * the user's current location within a site hierarchy. It supports collapsing items
 * when there are too many, custom separators, and accessibility features.
 *
 * @example
 * ```html
 * <igx-breadcrumb>
 *   <igx-breadcrumb-item [routerLink]="['/home']" icon="home">Home</igx-breadcrumb-item>
 *   <igx-breadcrumb-item [routerLink]="['/products']">Products</igx-breadcrumb-item>
 *   <igx-breadcrumb-item [disabled]="true">Current Page</igx-breadcrumb-item>
 * </igx-breadcrumb>
 * ```
 */
@Component({
    selector: 'igx-breadcrumb',
    templateUrl: 'breadcrumb.component.html',
    styleUrl: 'breadcrumb.component.scss',
    host: {
        'role': 'navigation',
        '[attr.aria-label]': '"breadcrumb"'
    }
})
export class IgxBreadcrumbComponent implements AfterContentInit, OnDestroy {
    /**
     * Sets the value of the `id` attribute. If not provided it will be automatically generated.
     *
     * @example
     * ```html
     * <igx-breadcrumb [id]="'my-breadcrumb'">...</igx-breadcrumb>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-breadcrumb-${NEXT_ID++}`;

    /**
     * Custom separator between crumbs.
     * Default is a chevron icon (›).
     *
     * @example
     * ```html
     * <igx-breadcrumb separator="/">...</igx-breadcrumb>
     * ```
     */
    @Input()
    public separator = '›';

    /**
     * Maximum number of visible items before overflow/collapsing.
     * If not set, all items are visible.
     *
     * @example
     * ```html
     * <igx-breadcrumb [maxItems]="4">...</igx-breadcrumb>
     * ```
     */
    @Input({ transform: numberAttribute })
    public maxItems: number;

    /**
     * Number of items visible before the collapsed section.
     * Default is 1.
     *
     * @example
     * ```html
     * <igx-breadcrumb [maxItems]="4" [itemsBeforeCollapse]="1">...</igx-breadcrumb>
     * ```
     */
    @Input({ transform: numberAttribute })
    public itemsBeforeCollapse = 1;

    /**
     * Number of items visible after the collapsed section.
     * Default is 1.
     *
     * @example
     * ```html
     * <igx-breadcrumb [maxItems]="4" [itemsAfterCollapse]="2">...</igx-breadcrumb>
     * ```
     */
    @Input({ transform: numberAttribute })
    public itemsAfterCollapse = 1;

    /**
     * Breadcrumb type determining the display behavior.
     * - `location`: Used for navigation schemes with multiple levels of hierarchy
     * - `attribute`: Displays the full crumb items trail
     * - `dynamic`: Path-based breadcrumbs showing the path taken to arrive at a page
     *
     * @example
     * ```html
     * <igx-breadcrumb [type]="'dynamic'">...</igx-breadcrumb>
     * ```
     */
    @Input()
    public type: BreadcrumbType = 'location';

    /** @hidden */
    @HostBinding('class.igx-breadcrumb')
    public cssClass = true;

    /** @hidden */
    @ContentChildren(IgxBreadcrumbItemComponent)
    public items: QueryList<IgxBreadcrumbItemComponent>;

    /** @hidden */
    @ContentChild(IgxBreadcrumbSeparatorDirective)
    public separatorTemplate: IgxBreadcrumbSeparatorDirective;

    private destroy$ = new Subject<void>();

    constructor(
        public elementRef: ElementRef<HTMLElement>,
        private cdr: ChangeDetectorRef
    ) {}

    /** @hidden */
    public ngAfterContentInit(): void {
        this.updateItems();
        this.items.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.updateItems();
        });
    }

    /** @hidden */
    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Returns the visible items based on maxItems and collapse settings.
     */
    public get visibleItems(): IgxBreadcrumbItemComponent[] {
        if (!this.items) {
            return [];
        }

        const allItems = this.items.toArray();

        if (!this.maxItems || allItems.length <= this.maxItems) {
            return allItems;
        }

        const before = allItems.slice(0, this.itemsBeforeCollapse);
        const after = allItems.slice(allItems.length - this.itemsAfterCollapse);

        return [...before, ...after];
    }

    /**
     * Returns the items that are collapsed (hidden in ellipsis).
     */
    public get hiddenItems(): IgxBreadcrumbItemComponent[] {
        if (!this.items) {
            return [];
        }

        const allItems = this.items.toArray();

        if (!this.maxItems || allItems.length <= this.maxItems) {
            return [];
        }

        return allItems.slice(this.itemsBeforeCollapse, allItems.length - this.itemsAfterCollapse);
    }

    /**
     * Returns whether there are collapsed items.
     */
    public get hasCollapsedItems(): boolean {
        return this.hiddenItems.length > 0;
    }

    /** @hidden */
    public getCollapsedItemsTooltip(): string {
        return this.hiddenItems.map(item => item.label).join(' > ');
    }

    private updateItems(): void {
        if (!this.items) {
            return;
        }

        const allItems = this.items.toArray();

        // Mark the last item as current and determine visibility
        allItems.forEach((item, index) => {
            item.isCurrent = index === allItems.length - 1;
            item.isHidden = !this.visibleItems.includes(item);
        });

        this.cdr.markForCheck();
    }
}
