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
import { IgxEmptyListTemplateDirective, IgxListPanState } from './list.common';

let NEXT_ID = 0;
export interface IPanStateChangeEventArgs {
    oldState: IgxListPanState;
    newState: IgxListPanState;
    item: IgxListItemComponent;
}

export interface IListItemClickEventArgs {
    item: IgxListItemComponent;
    event: Event;
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
    templateUrl: 'list.component.html'
})
export class IgxListComponent {

    constructor(private element: ElementRef) {
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
 *@hidden
 */
@ContentChild(IgxEmptyListTemplateDirective, { read: IgxEmptyListTemplateDirective })
    public emptyListTemplate: IgxEmptyListTemplateDirective;
/**
 *@hidden
 */
@ViewChild('defaultEmptyList', { read: TemplateRef })
    protected defaultEmptyListTemplate: TemplateRef<any>;
    /**
     * Sets/gets the `id` of the list.
     * If not set, the `id` of the first list component will be `"igx-list-0"`.
     * ```html
     * <igx-list id = "my-first-list"></igx-list>
     * ```
     * ```typescript
     * let listID =  this.list.id;
     * ```
     * @memberof IgxListComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-list-${NEXT_ID++}`;
    /**
     * Sets/gets whether the left panning of an item is allowed.
     * Default value is `false`;
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
     * Default value is `false`;
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
     * Emits an event with the current list when left pan gesture is executed on list item.
     * @memberof IgxListComponent
     */
    @Output()
    public onLeftPan = new EventEmitter<IgxListItemComponent>();
    /**
     * Emits an event with the current list when right pan gesture is executed on list item.
     * @memberof IgxListComponent
     */
    @Output()
    public onRightPan = new EventEmitter<IgxListItemComponent>();
    /**
     * Emits an event with the current list when pan gesture is executed on list item
     * @memberof IgxListComponent
     */
    @Output()
    public onPanStateChange = new EventEmitter<IPanStateChangeEventArgs>();
/**
 * Emits an event with the current list when a list item has been clicked.
 * @memberof IgxListComponent
 */
@Output()
    public onItemClicked = new EventEmitter<IListItemClickEventArgs>();
/**
 * Returns the role attribute.
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
 * ```
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
 * let listHeaders: IgxListItemComponent[] =  this.list.headers
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
 * Returns a reference to `IgxListComponent`.
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
        return this.emptyListTemplate ? this.emptyListTemplate.template : this.defaultEmptyListTemplate;
    }
}
/**
 * The IgxListModule provides the {@link IgxListComponent} and the {@link IgxListItemComponent} inside your application.
 */
@NgModule({
    declarations: [IgxListComponent, IgxListItemComponent, IgxEmptyListTemplateDirective],
    exports: [IgxListComponent, IgxListItemComponent, IgxEmptyListTemplateDirective],
    imports: [CommonModule, IgxRippleModule]
})
export class IgxListModule {
}
