import { NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    Directive,
    booleanAttribute,
    inject,
    DestroyRef
} from '@angular/core';



import { IgxListItemComponent } from './list-item.component';
import {
    IgxListBaseDirective,
    IgxDataLoadingTemplateDirective,
    IgxEmptyListTemplateDirective,
    IgxListPanState,
    IgxListItemLeftPanningTemplateDirective,
    IgxListItemRightPanningTemplateDirective
} from './list.common';
import { IBaseEventArgs } from 'igniteui-angular/core';
import { IListResourceStrings, ListResourceStringsEN } from 'igniteui-angular/core';
import { getCurrentResourceStrings, onResourceChangeHandle } from 'igniteui-angular/core';

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
    standalone: true
})
export class IgxListLineTitleDirective {
    @HostBinding('class.igx-list__item-line-title')
    public cssClass = 'igx-list__item-line-title';
}

/**
 * igxListLineSubTitle is a directive that add class to the target element
 * Use it to make anything to look like list Subtitle.
 */
@Directive({
    selector: '[igxListLineSubTitle]',
    standalone: true
})
export class IgxListLineSubTitleDirective {
    @HostBinding('class.igx-list__item-line-subtitle')
    public cssClass = 'igx-list__item-line-subtitle';
}

/**
 * Displays a collection of data items in a templatable list format
 *
 * @remarks
 * The Ignite UI List displays rows of items and supports one or more header items as well as search and filtering
 * of list items. Each list item is completely templatable and will support any valid HTML or Angular component.
 */
@Component({
    selector: 'igx-list',
    templateUrl: 'list.component.html',
    providers: [{ provide: IgxListBaseDirective, useExisting: IgxListComponent }],
    imports: [NgTemplateOutlet]
})
export class IgxListComponent extends IgxListBaseDirective {
    public element = inject(ElementRef);
    private destroyRef = inject(DestroyRef);

    /**
     * Returns a collection of all items and headers in the list.
     */
    @ContentChildren(forwardRef(() => IgxListItemComponent), { descendants: true })
    public override children: QueryList<IgxListItemComponent>;

    /**
     * Sets/gets the empty list template.
     *
     * @remarks
     * This template is used by IgxList in case there are no list items
     * defined and `isLoading` is set to `false`.
     */
    @ContentChild(IgxEmptyListTemplateDirective, { read: IgxEmptyListTemplateDirective })
    public emptyListTemplate: IgxEmptyListTemplateDirective;

    /**
     * Sets/gets the list loading template.
     *
     * @remarks
     * This template is used by IgxList in case there are no list items defined and `isLoading` is set to `true`.
     */
    @ContentChild(IgxDataLoadingTemplateDirective, { read: IgxDataLoadingTemplateDirective })
    public dataLoadingTemplate: IgxDataLoadingTemplateDirective;

    /**
     * Sets/gets the template for left panning a list item.
     *
     * @remarks
     * Default value is `null`.
     */
    @ContentChild(IgxListItemLeftPanningTemplateDirective, { read: IgxListItemLeftPanningTemplateDirective })
    public override listItemLeftPanningTemplate: IgxListItemLeftPanningTemplateDirective;

    /**
     * Sets/gets the template for right panning a list item.
     *
     * @remarks
     * Default value is `null`.
     */
    @ContentChild(IgxListItemRightPanningTemplateDirective, { read: IgxListItemRightPanningTemplateDirective })
    public override listItemRightPanningTemplate: IgxListItemRightPanningTemplateDirective;

    /**
     * Provides a threshold after which the item's panning will be completed automatically.
     *
     * @remarks
     * By default this property is set to 0.5 which is 50% of the list item's width.
     */
    @Input()
    public override panEndTriggeringThreshold = 0.5;

    /**
     * Sets/gets the `id` of the list.
     *
     * @remarks
     * If not set, the `id` of the first list component will be `"igx-list-0"`.
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-list-${NEXT_ID++}`;

    /**
     * Sets/gets whether the left panning of an item is allowed.
     *
     * @remarks
     * Default value is `false`.
     */
    @Input({ transform: booleanAttribute })
    public override allowLeftPanning = false;

    /**
     * Sets/gets whether the right panning of an item is allowed.
     *
     * @remarks
     * Default value is `false`.
     */
    @Input({ transform: booleanAttribute })
    public override allowRightPanning = false;

    /**
     * Sets/gets whether the list is currently loading data.
     *
     * @remarks
     * Set it to display the dataLoadingTemplate while data is being retrieved.
     * Default value is `false`.
     */
    @Input({ transform: booleanAttribute })
    public isLoading = false;

    /**
     * Event emitted when a left pan gesture is executed on a list item.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     */
    @Output()
    public override leftPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a right pan gesture is executed on a list item.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     */
    @Output()
    public override rightPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a pan gesture is started.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     */
    @Output()
    public override startPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a pan gesture is completed or canceled.
     *
     * @remarks
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     */
    @Output()
    public override endPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Event emitted when a pan item is returned to its original position.
     *
     * @remarks
     * Provides a reference to an object of type `IgxListComponent` as an event argument.
     */
    @Output()
    public override resetPan = new EventEmitter<IgxListComponent>();

    /**
     *
     * Event emitted when a pan gesture is executed on a list item.
     *
     * @remarks
     * Provides references to the `IgxListItemComponent` and `IgxListPanState` as event arguments.
     */
    @Output()
    public override panStateChange = new EventEmitter<IPanStateChangeEventArgs>();

    /**
     * Event emitted when a list item is clicked.
     *
     * @remarks
     * Provides references to the `IgxListItemComponent` and `Event` as event arguments.
     */
    @Output()
    public override itemClicked = new EventEmitter<IListItemClickEventArgs>();

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultEmptyList', { read: TemplateRef, static: true })
    protected defaultEmptyListTemplate: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultDataLoading', { read: TemplateRef, static: true })
    protected defaultDataLoadingTemplate: TemplateRef<any>;

    private _resourceStrings: IListResourceStrings = null;
    private _defaultResourceStrings = getCurrentResourceStrings(ListResourceStringsEN);

    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IListResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * Returns the resource strings.
     */
    public get resourceStrings(): IListResourceStrings {
        return this._resourceStrings || this._defaultResourceStrings;
    }

    constructor() {
        super();
        onResourceChangeHandle(this.destroyRef, () => {
            this._defaultResourceStrings = getCurrentResourceStrings(ListResourceStringsEN, false);
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
        return null;
    }

    private _role = 'list';

    /**
     * Gets/Sets the `role` attribute value.
     */
    @HostBinding('attr.role')
    @Input()
    public get role() {
        return this._role;
    }

    public set role(val: string) {
        this._role = val;
    }

    /**
     * Gets a boolean indicating if the list is empty.
     */
    @HostBinding('class.igx-list--empty')
    public get isListEmpty(): boolean {
        return !this.children || this.children.length === 0;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-list')
    public get cssClass(): boolean {
        return !this.isListEmpty;
    }

    /**
     * Gets the list `items` excluding the header ones.
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
     * by providing the `$implicit` declaration which is the `IgxListComponent` itself.
     */
    public get context(): any {
        return {
            $implicit: this
        };
    }

    /**
     * Gets a `TemplateRef` to the currently used template.
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

