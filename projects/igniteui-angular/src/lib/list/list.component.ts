import { CommonModule } from '@angular/common';
import {
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    QueryList,
    TemplateRef,
    ViewChild
} from '@angular/core';

import { IgxRippleModule } from '../directives/ripple/ripple.directive';

import { IgxListItemComponent } from './list-item.component';
import {
    IgxListBase,
    IgxDataLoadingTemplateDirective,
    IgxEmptyListTemplateDirective,
    IgxListPanState,
    IgxListItemLeftPanningTemplateDirective,
    IgxListItemRightPanningTemplateDirective} from './list.common';

let NEXT_ID = 0;
export interface IPanStateChangeEventArgs {
    oldState: IgxListPanState;
    newState: IgxListPanState;
    item: IgxListItemComponent;
}

export interface IListItemClickEventArgs {
    item: IgxListItemComponent;
    event: Event;
    direction: IgxListPanState;
}

export interface IListItemPanningEventArgs {
    item: IgxListItemComponent;
    direction: IgxListPanState;
    keepItem: boolean;
}

/**
 * **Ignite UI for Angular List** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list.html)
 *
 * The Ignite UI List displays rows of items and supports one or more header items as well as search and filtering
 * of list items. Each list item is completely templateable and will support any valid HTML or Angular component.
 *
 * Example:
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
    providers: [{ provide: IgxListBase, useExisting: IgxListComponent }]
})
export class IgxListComponent implements IgxListBase {

    constructor(public element: ElementRef) {
    }

    /**
     * Returns a collection of all items and headers in the list.
     * ```typescript
     * let listChildren: QueryList = this.list.children;
     * ```
     * @memberof IgxListComponent
     */
    @ContentChildren(forwardRef(() => IgxListItemComponent))
    public children: QueryList<IgxListItemComponent>;

    /**
     * Returns the template which will be used by the IgxList in case there are no list items defined and `isLoading` is set to `false`.
     * ```typescript
     * let emptyTemplate = this.list.emptyListTemplate;
     * ```
     * @memberof IgxListComponent
     */
    @ContentChild(IgxEmptyListTemplateDirective, { read: IgxEmptyListTemplateDirective })
    public emptyListTemplate: IgxEmptyListTemplateDirective;

    /**
     * Returns the template which will be used by the IgxList in case there are no list items defined and `isLoading` is set to `true`.
     * ```typescript
     * let loadingTemplate = this.list.dataLoadingTemplate;
     * ```
     * @memberof IgxListComponent
     */
    @ContentChild(IgxDataLoadingTemplateDirective, { read: IgxDataLoadingTemplateDirective })
    public dataLoadingTemplate: IgxDataLoadingTemplateDirective;

    /**
     * Sets/gets the template shown when left panning a list item.
     * Default value is `null`.
     * ```html
     *  <igx-list [allowLeftPanning] = "true"></igx-list>
     * ```
     * ```typescript
     * let itemLeftPanTmpl = this.list.listItemLeftPanningTemplate;
     * ```
     * @memberof IgxListComponent
     */
    @ContentChild(IgxListItemLeftPanningTemplateDirective, { read: IgxListItemLeftPanningTemplateDirective })
    public listItemLeftPanningTemplate: IgxListItemLeftPanningTemplateDirective;

    /**
     * Sets/gets the template shown when right panning a list item.
     * Default value is `null`.
     * ```html
     *  <igx-list [allowLeftPanning] = "true"></igx-list>
     * ```
     * ```typescript
     * let itemRightPanTmpl = this.list.listItemRightPanningTemplate;
     * ```
     * @memberof IgxListComponent
     */
    @ContentChild(IgxListItemRightPanningTemplateDirective, { read: IgxListItemRightPanningTemplateDirective })
    public listItemRightPanningTemplate: IgxListItemRightPanningTemplateDirective;

    /**
     * Provides a threshold after which the item's panning will be completed automatically.
     * By default this property is set to 0.5 which is 50% of the list item's width.
     * ```typescript
     * this.list.panEndTriggeringThreshold = 0.8;
     * ```
     */
    @Input()
    public panEndTriggeringThreshold = 0.5;

    /**@hidden*/
    @ViewChild('defaultEmptyList', { read: TemplateRef })
    protected defaultEmptyListTemplate: TemplateRef<any>;

    /**@hidden*/
    @ViewChild('defaultDataLoading', { read: TemplateRef })
    protected defaultDataLoadingTemplate: TemplateRef<any>;

    /**
     * Sets/gets the `id` of the list.
     * If not set, the `id` of the first list component will be `"igx-list-0"`.
     * ```html
     * <igx-list id = "my-first-list"></igx-list>
     * ```
     * ```typescript
     * let listId =  this.list.id;
     * ```
     * @memberof IgxListComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-list-${NEXT_ID++}`;

    /**
     * Sets/gets whether the left panning of an item is allowed.
     * Default value is `false`.
     * ```html
     *  <igx-list [allowLeftPanning] = "true"></igx-list>
     * ```
     * ```typescript
     * let isLeftPanningAllowed = this.list.allowLeftPanning;
     * ```
     * @memberof IgxListComponent
     */
    @Input()
    public allowLeftPanning = false;

    /**
     * Sets/gets whether the right panning of an item is allowed.
     * Default value is `false`.
     * ```html
     *  <igx-list [allowRightPanning] = "true"></igx-list>
     * ```
     * ```typescript
     * let isRightPanningAllowed = this.list.allowRightPanning;
     * ```
     * @memberof IgxListComponent
     */
    @Input()
    public allowRightPanning = false;

    /**
     * Sets/gets whether the list is currently loading data.
     * Set it to display the dataLoadingTemplate while data is being retrieved.
     * Default value is `false`.
     * ```html
     *  <igx-list [isLoading]="true"></igx-list>
     * ```
     * ```typescript
     * let isLoading = this.list.isLoading;
     * ```
     * @memberof IgxListComponent
     */
    @Input()
    public isLoading = false;

    /**
     * Emits an event within the current list when left pan gesture is executed on a list item.
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     * ```html
     * <igx-list [allowLeftPanning]="true" (onLeftPan)="onLeftPan($event)"></igx-list>
     * ```
     * @memberof IgxListComponent
     */
    @Output()
    public onLeftPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
     * Emits an event within the current list when right pan gesture is executed on a list item.
     * Provides a reference to an object of type `IListItemPanningEventArgs` as an event argument.
     * ```html
     * <igx-list [allowRightPanning]="true" (onRightPan)="onRightPan($event)"></igx-list>
     * ```
     * @memberof IgxListComponent
     */
    @Output()
    public onRightPan = new EventEmitter<IListItemPanningEventArgs>();

    /**
    * Emits an event within the current list when pan gesture is executed on list item.
    * Provides references to the `IgxListItemComponent` and `IgxListPanState` as event arguments.
    * ```html
    * <igx-list (onPanStateChange) = "onPanStateChange($event)"></igx-list>
    * ```
    * @memberof IgxListComponent
    */
    @Output()
    public onPanStateChange = new EventEmitter<IPanStateChangeEventArgs>();

    /**
     * Emits an event within the current list when a list item has been clicked.
     * Provides references to the `IgxListItemComponent` and `Event` as event arguments.
     *  ```html
     * <igx-list (onItemClicked) = "onItemClicked($event)"></igx-list>
     * ```
     * @memberof IgxListComponent
     */
    @Output()
    public onItemClicked = new EventEmitter<IListItemClickEventArgs>();

    /**
     * Gets the `role` attribute.
     * ```typescript
     * let listRole =  this.list.role;
     * ```
     * @memberof IgxListComponent
     */
    @HostBinding('attr.role')
    public get role() {
        return 'list';
    }

    /**
     * Returns boolean indicating if the list is empty.
     * ```typescript
     * let isEmpty =  this.list.isListEmpty;
     * ```
     * @memberof IgxListComponent
     */
    @HostBinding('class.igx-list-empty')
    public get isListEmpty(): boolean {
        return !this.children || this.children.length === 0;
    }

    /**
     * Returns boolean indicating if the list has a `cssClass` attribute.
     * ```typescript
     * let hasCssClass =  this.list.cssClass;
     * ```
     * @memberof IgxListComponent
     */
    @HostBinding('class.igx-list')
    public get cssClass(): boolean {
        return this.children && this.children.length > 0;
    }

    /**
     * Returns the `items` in the list excluding the headers.
     * ```typescript
     * let listItems: IgxListItemComponent[] = this.list.items;
     * ```
     * @memberof IgxListComponent
     */
    public get items(): IgxListItemComponent[] {
        const items: IgxListItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }
        return items;
    }

    /**
     * Returns the headers in the list.
     * ```typescript
     * let listHeaders: IgxListItemComponent[] =  this.list.headers;
     * ```
     * @memberof IgxListComponent
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
     * Returns the `context` object which represents the `template context` binding into the `list container`
     * by providing the `$implicit` declaration which is the `IgxListComponent` itself.
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
     * Returns the `template` of an empty list.
     * ```typescript
     * let listTemplate = this.list.template;
     * ```
     * @memberof IgxListComponent
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
@NgModule({
    declarations: [IgxListComponent, IgxListItemComponent,
        IgxDataLoadingTemplateDirective, IgxEmptyListTemplateDirective,
        IgxListItemLeftPanningTemplateDirective, IgxListItemRightPanningTemplateDirective],
    exports: [IgxListComponent, IgxListItemComponent,
        IgxDataLoadingTemplateDirective, IgxEmptyListTemplateDirective,
        IgxListItemLeftPanningTemplateDirective, IgxListItemRightPanningTemplateDirective],
    imports: [CommonModule, IgxRippleModule]
})
export class IgxListModule {
}
