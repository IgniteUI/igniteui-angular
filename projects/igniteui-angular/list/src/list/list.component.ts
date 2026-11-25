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
    afterEveryRender
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
import { IBaseEventArgs } from 'igniteui-angular/core';
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
    providers: [{ provide: IgxListBaseDirective, useExisting: IgxListComponent }],
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
    public isLoading = false;

    /**
     * Sets/gets whether the user selects items in the list.
     *
     * @remarks
     * Default value is `false`. When set, the list follows the ARIA listbox pattern: it has `role="listbox"`,
     * its items become options that expose their `selected` state, Tab focuses the selected option,
     * Arrow Up/Down and Home/End move between the options, and Enter/Space click the focused option.
     *
     * @example
     * ```html
     * <igx-list selectable aria-label="Employees">
     *     <igx-list-item [selected]="true">Kate</igx-list-item>
     * </igx-list>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public selectable = false;

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
        afterEveryRender({ write: () => this.updateAttributes() });
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
    private _activeItem: IgxListItemComponent | null = null;

    /** The `tabindex` the list set on itself, so a `tabindex` set by the app is kept. */
    private _tabIndex: string | null = null;

    /**
     * @hidden
     * @internal
     * Whether the list has options that are not hidden. Without them, the empty or loading message of a listbox is an option.
     */
    protected get hasOptions(): boolean {
        return this.ownItems.some(item => !item.isHeader && !item.hidden);
    }

    /** The items of this list, without those of nested lists, in the order they are displayed. */
    private get ownItems(): IgxListItemComponent[] {
        return this.sortedChildren?.filter(item => item.list === this) ?? [];
    }

    /**
     * Syncs the listbox attributes of the list and its items, in the order the items are displayed.
     * Only the active option is a tab stop: the one focused last, else the first selected option, else the first option.
     * Without options, the list itself is the tab stop, and when options are added while it has the focus, the focus moves to them.
     * While loading, the listbox is marked busy. A list that is not a listbox, and has not just stopped being one, is left untouched.
     */
    private updateAttributes() {
        const listbox = this.isListbox;
        if (!listbox && !this._synced) {
            return;
        }
        this._synced = listbox;
        const element = this.element.nativeElement as HTMLElement;
        syncAttribute(element, 'aria-busy', listbox && this.isLoading ? 'true' : null);
        const children = this.ownItems;
        const options = children.filter(item => !item.isHeader && !item.hidden);
        const tabStop = options.includes(this._activeItem!) ? this._activeItem
            : options.find(item => item.selected) ?? options[0];
        const tabIndex = element.getAttribute('tabindex');
        const focused = tabIndex !== null && tabIndex === this._tabIndex
            && (element.getRootNode() as Document | ShadowRoot).activeElement === element;
        if (tabIndex === null || tabIndex === this._tabIndex) {
            this._tabIndex = listbox && !tabStop ? '0' : null;
            element.classList.toggle('igx-list--focusable', this._tabIndex !== null);
            syncAttribute(element, 'tabindex', this._tabIndex);
        }
        let header: IgxListItemComponent | null = null;
        for (const item of children) {
            header = item.isHeader ? item : header;
            item.updateAttributes(listbox, item === tabStop, header);
        }
        if (listbox && tabStop && focused) {
            tabStop.element.focus();
        }
    }

    private _role = 'list';

    /**
     * Gets/Sets the `role` attribute value.
     *
     * @remarks
     * Defaults to `list`, and is `listbox` when the list is `selectable`.
     *
     * @deprecated in version 22.4.0. Use `selectable` to make the list a listbox instead.
     *
     * @example
     * ```typescript
     * let listRole =  this.list.role;
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public get role() {
        return this.selectable ? 'listbox' : this._role;
    }

    public set role(val: string) {
        this._role = val;
    }

    /**
     * @hidden
     * @internal
     * Whether the list follows the ARIA listbox pattern, which it does when it is `selectable`.
     */
    public override get isListbox(): boolean {
        return this.selectable;
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
        const target = event.composedPath()[0];
        this._activeItem = this.ownItems.find(item => item.element === target) ?? this._activeItem;
    }

    /**
     * @hidden
     * @internal
     * Moves the focus between the options of a listbox.
     * ArrowDown/ArrowUp go to the next/previous option, Home/End to the first/last one.
     * Enter/Space activate the focused option like a click, so `itemClicked` and its `click` handlers fire,
     * once per key press, also when the key is held down. Keys pressed in the content of an option are not handled.
     *
     * @param event The keydown event that bubbled up from an option.
     */
    @HostListener('keydown', ['$event'])
    public onKeydown(event: KeyboardEvent) {
        if (!this.isListbox) {
            return;
        }

        const target = event.composedPath()[0];
        const items = this.ownItems.filter(item => !item.isHeader && !item.hidden);
        const current = items.findIndex(item => item.element === target);
        if (current === -1) {
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!event.repeat) {
                items[current].element.click();
            }
            return;
        }

        let next: number;
        switch (event.key) {
            case 'ArrowDown':
                next = Math.min(current + 1, items.length - 1);
                break;
            case 'ArrowUp':
                next = Math.max(current - 1, 0);
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = items.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        items[next].element.focus();
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

/**
 * @hidden
 */

