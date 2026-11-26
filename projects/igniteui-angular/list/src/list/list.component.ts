import { NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    Directive,
    booleanAttribute,
    inject,
    DestroyRef,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    afterEveryRender,
    afterRenderEffect,
    computed,
    signal
} from '@angular/core';

import { IgxListItemComponent } from './list-item.component';
import {
    IgxListBaseDirective,
    IgxDataLoadingTemplateDirective,
    IgxEmptyListTemplateDirective,
    IgxListPanState,
    IgxListItemLeftPanningTemplateDirective,
    IgxListItemRightPanningTemplateDirective,
    syncAttribute
} from './list.common';
import {
    IBaseEventArgs,
    IgxKeyBindingsService,
    IgxRovingFocusService,
    IgxSingleTabStopService,
    IgxTypeAhead,
    arrowLeft,
    arrowRight,
    enterKey,
    escapeKey,
    getTabbableElements,
    isFromArrowKeyControl,
    isLeftToRight,
    spaceBar
} from 'igniteui-angular/core';
import { IListResourceStrings, ListResourceStringsEN } from 'igniteui-angular/core';
import { getCurrentResourceStrings, onResourceChangeHandle } from 'igniteui-angular/core';
import { IgxNoTypographyDirective } from 'igniteui-angular/directives';

let NEXT_ID = 0;

/**
 * Interface for the panStateChange igxList event arguments
 */
export interface IPanStateChangeEventArgs extends IBaseEventArgs {
    oldState: IgxListPanState;
    newState: IgxListPanState;
    item: IgxListItemComponent;
}

/**
 * Interface for the listItemClick igxList event arguments
 */
export interface IListItemClickEventArgs extends IBaseEventArgs {
    item: IgxListItemComponent;
    event: Event;
    direction: IgxListPanState;
}

/**
 * Interface for the listItemPanning igxList event arguments
 */
export interface IListItemPanningEventArgs extends IBaseEventArgs {
    item: IgxListItemComponent;
    direction: IgxListPanState;
    keepItem: boolean;
}

/**
 * igxListThumbnail is container for the List media
 * Use it to wrap anything you want to be used as a thumbnail.
 */
@Directive({
    selector: '[igxListThumbnail]',
    standalone: true
})
export class IgxListThumbnailDirective { }

/**
 * igxListAction is container for the List action
 * Use it to wrap anything you want to be used as a list action: icon, checkbox...
 */
@Directive({
    selector: '[igxListAction]',
    standalone: true
})
export class IgxListActionDirective { }

/**
 * igxListLine is container for the List text content
 * Use it to wrap anything you want to be used as a plane text.
 */
@Directive({
    selector: '[igxListLine]',
    standalone: true
})
export class IgxListLineDirective { }

/**
 * igxListLineTitle is a directive that add class to the target element
 * Use it to make anything to look like list Title.
 */
@Directive({
    selector: '[igxListLineTitle]',
    standalone: true,
    hostDirectives: [IgxNoTypographyDirective]
})
export class IgxListLineTitleDirective {
    @HostBinding('class.igx-list-item__title')
    @HostBinding('class.igx-list__item-line-title')
    public cssClass = 'igx-list__item-line-title';
}

/**
 * igxListLineSubTitle is a directive that add class to the target element
 * Use it to make anything to look like list Subtitle.
 */
@Directive({
    selector: '[igxListLineSubTitle]',
    standalone: true,
    hostDirectives: [IgxNoTypographyDirective]
})
export class IgxListLineSubTitleDirective {
    @HostBinding('class.igx-list-item__subtitle')
    @HostBinding('class.igx-list__item-line-subtitle')
    public cssClass = 'igx-list__item-line-subtitle';
}

/**
 * The keyboard navigation and the ARIA pattern of a list.
 */
export const IgxListNavigation = {
    /** A static list, with list and list item semantics. */
    None: 'none',
    /** The ARIA listbox pattern. */
    Listbox: 'listbox',
    /** The ARIA layout grid pattern, one cell per row. */
    Grid: 'grid'
} as const;

/**
 * The keyboard navigation and the ARIA pattern of a list: `none`, `listbox` or `grid`.
 */
export type IgxListNavigation = typeof IgxListNavigation[keyof typeof IgxListNavigation];

/**
 * Displays a collection of data items in a templatable list format
 *
 * @igxModule IgxListModule
 *
 * @igxTheme igx-list-theme
 *
 * @igxKeywords list, data
 *
 * @igxGroup Grids & Lists
 *
 * @remarks
 * The Ignite UI List displays rows of items and supports one or more header items as well as search and filtering
 * of list items. Each list item is completely templatable and will support any valid HTML or Angular component.
 *
 * @example
 * ```html
 * <igx-list>
 *   <igx-list-item isHeader="true">Contacts</igx-list-item>
 *   <igx-list-item *ngFor="let contact of contacts">
 *     <span class="name">{{ contact.name }}</span>
 *     <span class="phone">{{ contact.phone }}</span>
 *   </igx-list-item>
 * </igx-list>
 * ```
 */
@Component({
    selector: 'igx-list',
    templateUrl: 'list.component.html',
    styleUrl: 'list.component.css',
    providers: [
        { provide: IgxListBaseDirective, useExisting: IgxListComponent },
        IgxKeyBindingsService,
        IgxRovingFocusService,
        IgxSingleTabStopService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgTemplateOutlet]
})
export class IgxListComponent extends IgxListBaseDirective {
    public element = inject(ElementRef);
    private destroyRef = inject(DestroyRef);

    /**
     * Returns a collection of all items and headers in the list.
     *
     * @example
     * ```typescript
     * let listChildren: QueryList = this.list.children;
     * ```
     */
    @ContentChildren(forwardRef(() => IgxListItemComponent), { descendants: true })
    public override children!: QueryList<IgxListItemComponent>;

    /**
     * Sets/gets the empty list template.
     *
     * @remarks
     * This template is used by list in case there are no list items
     * defined and `isLoading` is set to `false`.
     *
     * @example
     * ```html
     * <igx-list>
     *   <ng-template igxEmptyList>
     *     <p class="empty">No contacts! :(</p>
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let emptyTemplate = this.list.emptyListTemplate;
     * ```
     */
    @ContentChild(IgxEmptyListTemplateDirective, { read: IgxEmptyListTemplateDirective })
    public emptyListTemplate!: IgxEmptyListTemplateDirective;

    /**
     * Sets/gets the list loading template.
     *
     * @remarks
     * This template is used by list in case there are no list items defined and `isLoading` is set to `true`.
     *
     * @example
     * ```html
     * <igx-list>
     *   <ng-template igxDataLoading>
     *     <p>Patience, we are currently loading your data...</p>
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let loadingTemplate = this.list.dataLoadingTemplate;
     * ```
     */
    @ContentChild(IgxDataLoadingTemplateDirective, { read: IgxDataLoadingTemplateDirective })
    public dataLoadingTemplate!: IgxDataLoadingTemplateDirective;

    /**
     * Sets/gets the template for left panning a list item.
     *
     * @remarks
     * Default value is `null`.
     *
     * @example
     * ```html
     * <igx-list [allowLeftPanning]="true">
     *   <ng-template igxListItemLeftPanning>
     *     <igx-icon>delete</igx-icon>Delete
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let itemLeftPanTmpl = this.list.listItemLeftPanningTemplate;
     * ```
     */
    @ContentChild(IgxListItemLeftPanningTemplateDirective, { read: IgxListItemLeftPanningTemplateDirective })
    public override listItemLeftPanningTemplate!: IgxListItemLeftPanningTemplateDirective;

    /**
     * Sets/gets the template for right panning a list item.
     *
     * @remarks
     * Default value is `null`.
     *
     * @example
     * ```html
     * <igx-list [allowRightPanning] = "true">
     *   <ng-template igxListItemRightPanning>
     *     <igx-icon>call</igx-icon>Dial
     *   </ng-template>
     * </igx-list>
     * ```
     * ```typescript
     * let itemRightPanTmpl = this.list.listItemRightPanningTemplate;
     * ```
     */
    @ContentChild(IgxListItemRightPanningTemplateDirective, { read: IgxListItemRightPanningTemplateDirective })
    public override listItemRightPanningTemplate!: IgxListItemRightPanningTemplateDirective;

    /**
     * Provides a threshold after which the item's panning will be completed automatically.
     *
     * @remarks
     * By default this property is set to 0.5 which is 50% of the list item's width.
     *
     * @example
     * ```html
     * <igx-list [panEndTriggeringThreshold]="0.8"></igx-list>
     * ```
     */
    @Input()
    public override panEndTriggeringThreshold = 0.5;

    /**
     * Sets/gets the `id` of the list.
     *
     * @remarks
     * If not set, the `id` of the first list component will be `"igx-list-0"`.
     *
     * @example
     * ```html
     * <igx-list id="my-first-list"></igx-list>
     * ```
     * ```typescript
     * let listId = this.list.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-list-${NEXT_ID++}`;

    /**
     * Sets/gets whether the left panning of an item is allowed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-list [allowLeftPanning]="true"></igx-list>
     * ```
     * ```typescript
     * let isLeftPanningAllowed = this.list.allowLeftPanning;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public override allowLeftPanning = false;

    /**
     * Sets/gets whether the right panning of an item is allowed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-list [allowRightPanning]="true"></igx-list>
     * ```
     * ```typescript
     * let isRightPanningAllowed = this.list.allowRightPanning;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public override allowRightPanning = false;

    /**
     * Sets/gets whether the list is currently loading data.
     *
     * @remarks
     * Set it to display the dataLoadingTemplate while data is being retrieved.
     * Default value is `false`.
     *
     * @example
     * ```html
     *  <igx-list [isLoading]="true"></igx-list>
     * ```
     * ```typescript
     * let isLoading = this.list.isLoading;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get isLoading(): boolean {
        return this._isLoading();
    }

    public set isLoading(value: boolean) {
        this._isLoading.set(value);
    }

    private readonly _isLoading = signal(false);

    /**
     * Sets/gets the keyboard navigation and the ARIA pattern of the list.
     *
     * @remarks
     * Defaults to `none`, a static list. `listbox` makes it an ARIA listbox, and `grid` an ARIA grid with one
     * cell per row, both with keyboard navigation.
     *
     * @example
     * ```html
     * <igx-list navigation="listbox" aria-label="Employees">
     *     <igx-list-item [selected]="true">Kate</igx-list-item>
     * </igx-list>
     * ```
     */
    @Input()
    public get navigation(): IgxListNavigation {
        return this._navigation();
    }

    public set navigation(value: IgxListNavigation) {
        this._navigation.set(value ?? IgxListNavigation.None);
    }

    private readonly _navigation = signal<IgxListNavigation>(IgxListNavigation.None);

    /**
     * Event emitted when a left pan gesture is executed on a list item.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list [allowLeftPanning]="true" (leftPan)="leftPan($event)"></igx-list>
     * ```
     */
    @Output()
    public override leftPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a right pan gesture is executed on a list item.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list [allowRightPanning]="true" (rightPan)="rightPan($event)"></igx-list>
     * ```
     */
    @Output()
    public override rightPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a pan gesture is started.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list (startPan)="startPan($event)"></igx-list>
     * ```
     */
    @Output()
    public override startPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a pan gesture is completed or canceled.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     *
     * @example
     * ```html
     * <igx-list (endPan)="endPan($event)"></igx-list>
     * ```
     */
    @Output()
    public override endPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a pan item is returned to its original position.
     *
     * @remarks
     * Provides a reference to an object of type list as an event argument.
     *
     * @example
     * ```html
     * <igx-list (resetPan)="resetPan($event)"></igx-list>
     * ```
     */
    @Output()
    public override resetPan = new EventEmitter<IgxListComponent>();

    /**
     *
     * Event emitted when a pan gesture is executed on a list item.
     *
     * @remarks
     * Provides references to the list item and list pan state as event arguments.
     *
     * @example
     * ```html
     * <igx-list (panStateChange)="panStateChange($event)"></igx-list>
     * ```
     */
    @Output()
    public override panStateChange = new EventEmitter<IPanStateChangeEventArgs>();

    /**
     * Event emitted when a list item is clicked.
     *
     * @remarks
     * Provides references to the list item and `Event` as event arguments.
     *
     * @example
     * ```html
     * <igx-list (itemClicked)="onItemClicked($event)"></igx-list>
     * ```
     */
    @Output()
    public override itemClicked = new EventEmitter<IListItemClickEventArgs>();

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultEmptyList', { read: TemplateRef, static: true })
    protected defaultEmptyListTemplate!: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultDataLoading', { read: TemplateRef, static: true })
    protected defaultDataLoadingTemplate!: TemplateRef<any>;

    private _resourceStrings: IListResourceStrings = null!;
    private _customResourceStrings: IListResourceStrings = null!;
    private _defaultResourceStrings = getCurrentResourceStrings(ListResourceStringsEN);

    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IListResourceStrings) {
        this._resourceStrings = value;
        this._customResourceStrings = Object.assign({}, this._defaultResourceStrings, this._resourceStrings);
    }

    /**
     * Returns the resource strings.
     */
    public get resourceStrings(): IListResourceStrings {
        return this._resourceStrings ? this._customResourceStrings : this._defaultResourceStrings;
    }

    constructor() {
        super();
        // Before the key bindings, so Space that the type-ahead takes is not also a click.
        this.listenTypeAhead();
        this.configureNavigation();
        afterEveryRender({ read: () => this.checkItemOrder() });
        afterRenderEffect({
            write: () => this.syncHostAttributes(),
            // After the items' write phase, so the tab stop is focusable.
            mixedReadWrite: (focusTarget) => focusTarget()?.element.focus()
        });
        // Owned by the list, so a removal while the list is destroyed does nothing.
        afterRenderEffect({ mixedReadWrite: () => this.recoverFocus() });
        onResourceChangeHandle(this.destroyRef, () => {
            this._defaultResourceStrings = getCurrentResourceStrings(ListResourceStringsEN, false);
            this._customResourceStrings = this._resourceStrings ? Object.assign({}, this._defaultResourceStrings, this._resourceStrings) : null!;
        }, this);
    }

    /**
     * @hidden
     * @internal
     */
    protected get sortedChildren(): IgxListItemComponent[] {
        if (this.children !== undefined) {
            return this.children.toArray()
                .sort((a: IgxListItemComponent, b: IgxListItemComponent) => a.index - b.index);
        }
        return null!;
    }

    /** Whether the list was a listbox at the last render, so its items are reset when it stops being one. */
    private _synced = false;

    /** The option that was focused last, which keeps the tab stop. */
    private readonly _activeItem = signal<IgxListItemComponent | null>(null);

    /** The `tabindex` the list set on itself, so a `tabindex` set by the app is kept. */
    private _tabIndex: string | null = null;

    /**
     * @hidden
     * @internal
     * Whether the list has options that are not hidden. Without them, the empty or loading message of a listbox is an option.
     */
    protected get hasOptions(): boolean {
        return this._options().length > 0;
    }

    /** The items registered through DI, without those of nested lists. */
    private readonly _registeredItems = signal<readonly IgxListItemComponent[]>([]);

    /** Whether the host has `aria-multiselectable`, read after each render, as the app may bind it. */
    private readonly _multiselectable = signal(false);

    /** Bumped when items move without registering. */
    private readonly _orderVersion = signal(0);

    /** The items of this list, in displayed order. */
    private readonly _ownItems = computed(() => {
        this._orderVersion();
        return [...this._registeredItems()].sort(byDocumentPosition);
    });

    /** The visible items that are not headers. */
    private readonly _options = computed(() => this._ownItems().filter(item => !item.isHeader && !item.hidden));

    /** The option focused last, else the first selected one, else the first one. */
    private readonly _tabStop = computed(() => {
        const options = this._options();
        const active = this._activeItem();
        return active && options.includes(active) ? active : options.find(item => item.selected) ?? options[0] ?? null;
    });

    /** The header above each item. */
    private readonly _groupHeaders = computed(() => {
        const headers = new Map<IgxListItemComponent, IgxListItemComponent | null>();
        let header: IgxListItemComponent | null = null;
        for (const item of this._ownItems()) {
            if (item.isHeader) {
                header = item;
            } else {
                headers.set(item, header);
            }
        }
        return headers;
    });

    /**
     * @hidden
     * @internal
     */
    public override isTabStop(item: IgxListItemComponent): boolean {
        return this._tabStop() === item;
    }

    /**
     * @hidden
     * @internal
     */
    public override headerOf(item: IgxListItemComponent): IgxListItemComponent | null {
        return this._groupHeaders().get(item) ?? null;
    }

    /**
     * @hidden
     * @internal
     */
    public override registerItem(item: IgxListItemComponent): void {
        this._registeredItems.update(items => [...items, item]);
    }

    /**
     * @hidden
     * @internal
     */
    public override unregisterItem(item: IgxListItemComponent): void {
        const index = this._options().indexOf(item);
        this._registeredItems.update(items => items.filter(registered => registered !== item));
        if (this.isNavigable && item === this._focusedItem && index !== -1) {
            this._focusedItem = null;
            this._removedFocusIndex.set(index);
        }
    }

    /** Focuses the option that took the place of a removed one, else the last option, else the list. */
    private recoverFocus() {
        const index = this._removedFocusIndex();
        if (index === null) {
            return;
        }
        this._removedFocusIndex.set(null);
        const host = this.element.nativeElement as HTMLElement;
        const active = (host.getRootNode() as Document | ShadowRoot).activeElement;
        // The app may have moved the focus already.
        if (active && active !== host.ownerDocument.body) {
            return;
        }
        const options = this._options();
        (options[index] ?? options.at(-1))?.element.focus() ?? host.focus();
    }

    private readonly _typeAhead = new IgxTypeAhead<IgxListItemComponent>({ label: optionLabel });
    private readonly _singleTabStop = inject(IgxSingleTabStopService);
    /** The item that holds the focus, so its removal moves the focus to a neighbor. */
    private _focusedItem: IgxListItemComponent | null = null;

    /** The index of a removed option that held the focus, until the focus moves to a neighbor. */
    private readonly _removedFocusIndex = signal<number | null>(null);

    /** The option that a key event was dispatched on, not on its content. */
    private eventOption(event: KeyboardEvent): IgxListItemComponent | undefined {
        const target = event.composedPath()[0];
        return this._options().find(item => item.element === target);
    }

    /** Moves the focus to the next option that starts with the typed letters. */
    private listenTypeAhead() {
        const host = this.element.nativeElement as HTMLElement;
        const onKeydown = (event: KeyboardEvent) => {
            const option = this.isNavigable && !event.defaultPrevented ? this.eventOption(event) : undefined;
            if (!option || !this._typeAhead.isSearchKey(event)) {
                return;
            }
            event.preventDefault();
            const match = this._typeAhead.search(event.key, this._options(), option);
            if (match && match !== option) {
                match.element.focus();
            }
        };
        host.addEventListener('keydown', onKeydown);
        this.destroyRef.onDestroy(() => host.removeEventListener('keydown', onKeydown));
    }

    /** The option that holds the target of a key event, or is the target. */
    private eventRow(event: KeyboardEvent): IgxListItemComponent | undefined {
        const target = event.composedPath()[0];
        return target instanceof Node ? this._options().find(item => item.element.contains(target)) : undefined;
    }

    /** The controls of a row; a nested navigable list counts as one, its tab stop. */
    private rowControls(row: IgxListItemComponent): HTMLElement[] {
        const host = this.element.nativeElement as HTMLElement;
        return getTabbableElements(row.element).filter(element => {
            const list = element.parentElement?.closest('igx-list');
            const nested = list !== host && list?.matches('[role="grid"], [role="listbox"]');
            return !nested || element.parentElement === list;
        });
    }

    /** Whether the list leaves a key to the page or to a control inside a row. */
    private skipKey(event: KeyboardEvent): boolean {
        const row = this.isNavigable ? this.eventRow(event) : undefined;
        if (!row) {
            return true;
        }
        const escape = event.key === escapeKey || event.key === 'F2';
        if (event.composedPath()[0] === row.element) {
            return escape;
        }
        if (this.isListbox) {
            return true;
        }
        // On a control: Escape and F2 go back to the row, the control keeps the other keys it uses.
        return !escape && (event.key === enterKey || event.key === spaceBar || isFromArrowKeyControl(event, this.element.nativeElement));
    }

    /** Moves from a row to its first or last control, and between its controls and back to the row. */
    private moveInRow(event: KeyboardEvent, delta: -1 | 1) {
        const row = this.eventRow(event)!;
        const target = event.composedPath()[0] as Node;
        const controls = this.rowControls(row);
        const direction = isLeftToRight(this.element.nativeElement) ? delta : -delta;
        const index = controls.findIndex(control => control.contains(target));
        const next = target === row.element
            ? (direction > 0 ? controls[0] : controls.at(-1))
            : controls[index + direction] ?? row.element;
        next?.focus();
    }

    /** Binds the keys of a listbox or grid: arrows, Home/End, Enter/Space as a click, and in a grid its controls. */
    private configureNavigation() {
        const keyBindings = inject(IgxKeyBindingsService);
        const grid = { when: () => this.isGrid };

        inject<IgxRovingFocusService<HTMLElement>>(IgxRovingFocusService).configure({
            keyBindings: {
                skip: (_, event) => this.skipKey(event),
                skipHandled: true,
                // Held arrows keep moving.
                bindingDefaults: { repeat: true }
            },
            items: () => this._options().map(item => item.element),
            focusItem: (element) => element.focus(),
            horizontal: false,
            vertical: true,
            loop: false
        });

        keyBindings
            .setActivateHandler((event) => this.eventOption(event)?.element.click(), { repeat: false })
            .set(arrowLeft, (event) => this.moveInRow(event, -1), grid)
            .set(arrowRight, (event) => this.moveInRow(event, 1), grid)
            .set(escapeKey, (event) => this.eventRow(event)!.element.focus(), grid)
            .set('F2', (event) => this.eventRow(event)!.element.focus(), grid);

        this._singleTabStop.configure({
            when: () => this.isGrid,
            tabStop: () => this._tabStop()?.element ?? this.element.nativeElement
        });
    }

    /** Detects moved items, which do not register again, and a change of `aria-multiselectable`. */
    private checkItemOrder() {
        if (!this.isNavigable) {
            return;
        }
        this._multiselectable.set((this.element.nativeElement as HTMLElement).hasAttribute('aria-multiselectable'));
        const ordered = [...this._registeredItems()].sort(byDocumentPosition);
        const current = this._ownItems();
        if (ordered.some((item, index) => item !== current[index])) {
            this._orderVersion.update(version => version + 1);
        }
    }

    /**
     * Syncs the listbox attributes of the list host. An empty listbox is the tab stop.
     *
     * @returns The tab stop to focus, when options arrive while the list has the focus.
     */
    private syncHostAttributes(): IgxListItemComponent | null {
        const listbox = this.isNavigable;
        if (!listbox && !this._synced) {
            return null;
        }
        this._synced = listbox;
        const element = this.element.nativeElement as HTMLElement;
        syncAttribute(element, 'aria-busy', listbox && this._isLoading() ? 'true' : null);
        const tabStop = this._tabStop();
        const tabIndex = element.getAttribute('tabindex');
        const focused = tabIndex !== null && tabIndex === this._tabIndex
            && (element.getRootNode() as Document | ShadowRoot).activeElement === element;
        if (tabIndex === null || tabIndex === this._tabIndex) {
            this._tabIndex = listbox && !tabStop ? '0' : null;
            element.classList.toggle('igx-list--focusable', this._tabIndex !== null);
            syncAttribute(element, 'tabindex', this._tabIndex);
        }
        return listbox && tabStop && focused ? tabStop : null;
    }

    private _role = 'list';

    /**
     * Gets/Sets the `role` attribute value.
     *
     * @remarks
     * Defaults to `list`, and is `listbox` when the `navigation` of the list is `listbox`.
     *
     * @example
     * ```typescript
     * let listRole =  this.list.role;
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public get role() {
        return this.isListbox ? 'listbox' : this.isGrid ? 'grid' : this._role;
    }

    public set role(val: string) {
        this._role = val;
    }

    /**
     * @hidden
     * @internal
     * Whether the list follows the ARIA listbox pattern, which it does when its `navigation` is `listbox`.
     */
    public override get isListbox(): boolean {
        return this._navigation() === IgxListNavigation.Listbox;
    }

    /**
     * @hidden
     * @internal
     */
    public override get isGrid(): boolean {
        return this._navigation() === IgxListNavigation.Grid;
    }

    /**
     * @hidden
     * @internal
     */
    public override get isMultiselectable(): boolean {
        return this._multiselectable();
    }

    /**
     * @hidden
     * @internal
     * Keeps the tab stop on the option that was focused last.
     *
     * @param event The focusin event of the list.
     */
    @HostListener('focusin', ['$event'])
    public onFocusIn(event: FocusEvent) {
        // A focus on the way out of the list keeps the tab stop.
        if (this._singleTabStop.leaving) {
            return;
        }
        const target = event.composedPath()[0];
        const item = target instanceof Node ? this._ownItems().find(own => own.element.contains(target)) : undefined;
        this._focusedItem = item ?? null;
        if (item) {
            this._activeItem.set(item);
        }
    }

    /**
     * @hidden
     * @internal
     * Forgets the focused item when the focus leaves the list.
     *
     * @param event The focusout event of the list.
     */
    @HostListener('focusout', ['$event'])
    public onFocusOut(event: FocusEvent) {
        const next = event.relatedTarget as Node | null;
        if (next && this.element.nativeElement.contains(next)) {
            return;
        }
        if (next) {
            this._focusedItem = null;
            return;
        }
        // A removed element loses the focus to nothing: keep the item until it unregisters in this task.
        const item = this._focusedItem;
        setTimeout(() => {
            if (this._focusedItem === item) {
                this._focusedItem = null;
            }
        });
    }

    /**
     * @hidden
     * @internal
     *
     */
    @HostBinding('class.igx-list')
    public cssClass = 'igx-list';

    /**
     * Gets a boolean indicating if the list is empty.
     *
     * @example
     * ```typescript
     * let isEmpty =  this.list.isListEmpty;
     * ```
     */
    @HostBinding('class.igx-list--empty')
    public get isListEmpty(): boolean {
        return !this.children || this.children.length === 0;
    }

    /**
     * Gets the list `items` excluding the header ones.
     *
     * @example
     * ```typescript
     * let listItems: IgxListItemComponent[] = this.list.items;
     * ```
     */
    public get items(): IgxListItemComponent[] {
        const items: IgxListItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.sortedChildren) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }
        return items;
    }

    /**
     * Gets the header list `items`.
     *
     * @example
     * ```typescript
     * let listHeaders: IgxListItemComponent[] =  this.list.headers;
     * ```
     */
    public get headers(): IgxListItemComponent[] {
        const headers: IgxListItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }
        return headers;
    }

    /**
     * Gets the `context` object of the template binding.
     *
     * @remarks
     * Gets the `context` object which represents the `template context` binding into the `list container`
     * by providing the `$implicit` declaration which is the list itself.
     *
     * @example
     * ```typescript
     * let listComponent =  this.list.context;
     * ```
     */
    public get context(): any {
        return {
            $implicit: this
        };
    }

    /**
     * Gets a `TemplateRef` to the currently used template.
     *
     * @example
     * ```typescript
     * let listTemplate = this.list.template;
     * ```
     */
    public get template(): TemplateRef<any> {
        if (this.isLoading) {
            return this.dataLoadingTemplate ? this.dataLoadingTemplate.template : this.defaultDataLoadingTemplate;
        } else {
            return this.emptyListTemplate ? this.emptyListTemplate.template : this.defaultEmptyListTemplate;
        }
    }
}

/** The title of an option, else its text, which the type-ahead matches. */
function optionLabel(item: IgxListItemComponent): string {
    const title = item.element.querySelector('.igx-list__item-line-title');
    return (title ?? item.element).textContent?.trim() ?? '';
}

/** Orders two items by their position in the document. */
function byDocumentPosition(a: IgxListItemComponent, b: IgxListItemComponent): number {
    return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/**
 * @hidden
 */

