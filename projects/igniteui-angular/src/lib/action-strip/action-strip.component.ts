import {
    Component,
    Directive,
    HostBinding,
    Input,
    Renderer2,
    ViewContainerRef,
    ContentChildren,
    QueryList,
    ViewChild,
    TemplateRef,
    AfterContentInit,
    ChangeDetectorRef,
    AfterViewInit,
    ElementRef,
    booleanAttribute
} from '@angular/core';
import { ActionStripResourceStringsEN, IActionStripResourceStrings } from '../core/i18n/action-strip-resources';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { CloseScrollStrategy, OverlaySettings } from '../services/public_api';
import { IgxGridActionsBaseDirective } from './grid-actions/grid-actions-base.directive';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { IgxToggleActionDirective } from '../directives/toggle/toggle.directive';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { IgxIconButtonDirective } from '../directives/button/icon-button.directive';
import { IgxActionStripToken } from './token';

@Directive({
    selector: '[igxActionStripMenuItem]',
    standalone: true
})
export class IgxActionStripMenuItemDirective {
    constructor(public templateRef: TemplateRef<any>) {}
}

/* blazorElement */
/* jsonAPIManageItemInMarkup */
/* jsonAPIManageCollectionInMarkup */
/* wcElementTag: igc-action-strip */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/* contentParent: GridBaseDirective */
/* contentParent: RowIsland */
/* contentParent: HierarchicalGrid */
/**
 * Action Strip provides templatable area for one or more actions.
 *
 * @igxModule IgxActionStripModule
 *
 * @igxTheme igx-action-strip-theme
 *
 * @igxKeywords action, strip, actionStrip, pinning, editing
 *
 * @igxGroup Data Entry & Display
 *
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxRowIslandComponent, *
 *
 * @remarks
 * The Ignite UI Action Strip is a container, overlaying its parent container,
 * and displaying action buttons with action applicable to the parent component the strip is instantiated or shown for.
 *
 * @example
 * ```html
 * <igx-action-strip #actionStrip>
 *     <igx-icon (click)="doSomeAction()"></igx-icon>
 * </igx-action-strip>
 */
@Component({
    selector: 'igx-action-strip',
    templateUrl: 'action-strip.component.html',
    imports: [
        NgIf,
        NgFor,
        NgTemplateOutlet,
        IgxIconButtonDirective,
        IgxRippleDirective,
        IgxToggleActionDirective,
        IgxDropDownItemNavigationDirective,
        IgxIconComponent,
        IgxDropDownComponent,
        IgxDropDownItemComponent
    ],
    providers: [{ provide: IgxActionStripToken, useExisting: IgxActionStripComponent }]
})
export class IgxActionStripComponent implements IgxActionStripToken, AfterContentInit, AfterViewInit {

    /* blazorSuppress */
    /**
     * Sets the context of an action strip.
     * The context should be an instance of a @Component, that has element property.
     * This element will be the placeholder of the action strip.
     *
     * @example
     * ```html
     * <igx-action-strip [context]="cell"></igx-action-strip>
     * ```
     */
    @Input()
    public context: any;

    /**
     * Menu Items ContentChildren inside the Action Strip
     *
     * @hidden
     * @internal
     */
    @ContentChildren(IgxActionStripMenuItemDirective)
    public _menuItems: QueryList<IgxActionStripMenuItemDirective>;


    /* blazorInclude */
    /* contentChildren */
    /* blazorTreatAsCollection */
    /* blazorCollectionName: GridActionsBaseDirectiveCollection */
    /**
     * ActionButton as ContentChildren inside the Action Strip
     *
     * @hidden
     * @internal
     */
    @ContentChildren(IgxGridActionsBaseDirective)
    public actionButtons: QueryList<IgxGridActionsBaseDirective>;

    /**
     * Gets/Sets the visibility of the Action Strip.
     * Could be used to set if the Action Strip will be initially hidden.
     *
     * @example
     * ```html
     *  <igx-action-strip [hidden]="false">
     * ```
     */
    @Input({ transform: booleanAttribute })
    public hidden = false;


    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IActionStripResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    public get resourceStrings(): IActionStripResourceStrings {
        return this._resourceStrings;
    }

    /**
     * Hide or not the Action Strip based on if it is a menu.
     *
     * @hidden
     * @internal
     */
    public get hideOnRowLeave(): boolean {
        if (this.menu.items.length === 0) {
            return true;
        } else if (this.menu.items.length > 0) {
            if (this.menu.collapsed) {
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * Reference to the menu
     *
     * @hidden
     * @internal
     */
    @ViewChild('dropdown')
    public menu: IgxDropDownComponent;

    /**
     * Getter for menu overlay settings
     *
     * @hidden
     * @internal
     */
    public menuOverlaySettings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };

    private _hidden = false;
    private _resourceStrings = getCurrentResourceStrings(ActionStripResourceStringsEN);
    private _originalParent!: HTMLElement;

    constructor(
        private _viewContainer: ViewContainerRef,
        private renderer: Renderer2,
        protected el: ElementRef,
        /** @hidden @internal **/
        public cdr: ChangeDetectorRef,
    ) { }

    /**
     * Menu Items list.
     *
     * @hidden
     * @internal
     */
    public get menuItems() {
        const actions = [];
        this.actionButtons.forEach(button => {
            if (button.asMenuItems) {
                const children = button.buttons;
                if (children) {
                    children.toArray().forEach(x => actions.push(x));
                }
            }
        });
        return [... this._menuItems.toArray(), ...actions];
    }


    /**
     * Getter for the 'display' property of the current `IgxActionStrip`
     */
    @HostBinding('style.display')
    private get display(): string {
        return this.hidden ? 'none' : 'flex';
    }

    /**
     * Host `attr.class` binding.
     */
    @HostBinding('class.igx-action-strip')
    protected hostClass = 'igx-action-strip';

    /**
     * @hidden
     * @internal
     */
    public ngAfterContentInit() {
        this.actionButtons.forEach(button => {
            button.strip = this;
        });
        this.actionButtons.changes.subscribe(() => {
            this.actionButtons.forEach(button => {
                button.strip = this;
            });
        });
    }

    /**
     * @hidden
     * @internal
     */
    public ngAfterViewInit() {
        this.menu.selectionChanging.subscribe(($event) => {
            const newSelection = ($event.newSelection as any).elementRef.nativeElement;
            let allButtons = [];
            this.actionButtons.forEach(actionButtons => {
                if (actionButtons.asMenuItems) {
                    allButtons = [...allButtons, ...actionButtons.buttons.toArray()];
                }
            });
            const button = allButtons.find(x => newSelection.contains(x.container.nativeElement));
            if (button) {
                button.actionClick.emit();
            }
        });
        this._originalParent = this._viewContainer.element.nativeElement?.parentElement;
    }

    /**
     * Showing the Action Strip and appending it the specified context element.
     *
     * @param context
     * @example
     * ```typescript
     * this.actionStrip.show(row);
     * ```
     */
    public show(context?: any): void {
        this.hidden = false;
        if (!context) {
            return;
        }
        // when shown for different context make sure the menu won't stay opened
        if (this.context !== context) {
            this.closeMenu();
        }
        this.context = context;
        if (this.context && this.context.element) {
            this.renderer.appendChild(context.element.nativeElement, this._viewContainer.element.nativeElement);
        }
        this.cdr.detectChanges();
    }

    /**
     * Hiding the Action Strip and removing it from its current context element.
     *
     * @example
     * ```typescript
     * this.actionStrip.hide();
     * ```
     */
    public hide(): void {
        this.hidden = true;
        this.closeMenu();
        if (this._originalParent) {
            // D.P. fix(elements) don't detach native DOM, instead move back. Might not matter for Angular, but Elements will destroy
            this.renderer.appendChild(this._originalParent, this._viewContainer.element.nativeElement);
        } else if (this.context && this.context.element) {
            this.renderer.removeChild(this.context.element.nativeElement, this._viewContainer.element.nativeElement);
        }
    }

    /**
     * Close the menu if opened
     *
     * @hidden
     * @internal
     */
    private closeMenu(): void {
        if (this.menu && !this.menu.collapsed) {
            this.menu.close();
        }
    }
}
