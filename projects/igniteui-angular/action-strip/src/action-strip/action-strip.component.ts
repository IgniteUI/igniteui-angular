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
  ChangeDetectorRef,
  AfterViewInit,
  ElementRef,
  booleanAttribute,
  inject,
  DestroyRef,
  AfterContentInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal
} from '@angular/core';


import {
    ActionStripResourceStringsEN,
    CloseScrollStrategy,
    getCurrentResourceStrings,
    onResourceChangeHandle,
    IActionStripResourceStrings,
    IgxActionStripActionsToken,
    IgxActionStripToken,
    OverlaySettings
} from 'igniteui-angular/core';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxToggleActionDirective } from 'igniteui-angular/directives';
import { IgxRippleDirective } from 'igniteui-angular/directives';
import { NgTemplateOutlet } from '@angular/common';
import { IgxIconButtonDirective } from 'igniteui-angular/directives';
import { trackByIdentity } from 'igniteui-angular/core';
import { IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective } from 'igniteui-angular/drop-down';

@Directive({
    selector: '[igxActionStripMenuItem]',
    standalone: true
})
export class IgxActionStripMenuItemDirective {
    public templateRef = inject<TemplateRef<any>>(TemplateRef);
}

/* blazorElement */
/* jsonAPIManageItemInMarkup */
/* jsonAPIManageCollectionInMarkup */
/* wcElementTag: igc-action-strip */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/* contentParent: Grid */
/* contentParent: TreeGrid */
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
 * @igxParent IgxGridComponent, IgxHierarchicalGridComponent, IgxTreeGridComponent, IgxRowIslandComponent, *
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
    styleUrl: 'action-strip.component.css',
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        IgxIconButtonDirective,
        IgxRippleDirective,
        IgxToggleActionDirective,
        IgxDropDownItemNavigationDirective,
        IgxIconComponent,
        IgxDropDownComponent,
        IgxDropDownItemComponent
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [{ provide: IgxActionStripToken, useExisting: IgxActionStripComponent }]
})
export class IgxActionStripComponent implements IgxActionStripToken, AfterViewInit, AfterContentInit {
    private _viewContainer = inject(ViewContainerRef);
    private renderer = inject(Renderer2);
    protected el = inject(ElementRef);
    /* blazorSuppress */
    public cdr = inject(ChangeDetectorRef);


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
    public set context(value: any) {
        this._context.set(value);
    }

    public get context(): any {
        return this._context();
    }

    /**
     * Menu Items ContentChildren inside the Action Strip
     *
     * @hidden
     * @internal
     */
    @ContentChildren(IgxActionStripMenuItemDirective)
    public _menuItems!: QueryList<IgxActionStripMenuItemDirective>;


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
    @ContentChildren(IgxActionStripActionsToken)
    public actionButtons!: QueryList<IgxActionStripActionsToken>;

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
    public set hidden(value: boolean) {
        this._hidden.set(value);
    }

    public get hidden(): boolean {
        return this._hidden();
    }


    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IActionStripResourceStrings) {
        this._resourceStrings = value;
        this._customResourceStrings = Object.assign({}, this._defaultResourceStrings, this._resourceStrings);
    }

    public get resourceStrings(): IActionStripResourceStrings {
        return this._resourceStrings ? this._customResourceStrings : this._defaultResourceStrings;
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
        return undefined!;
    }

    /**
     * Reference to the menu
     *
     * @hidden
     * @internal
     */
    @ViewChild('dropdown')
    public menu!: IgxDropDownComponent;

    /**
     * Getter for menu overlay settings
     *
     * @hidden
     * @internal
     */
    public menuOverlaySettings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };

    private _destroyRef = inject(DestroyRef);
    /**
     * `hidden` and `context` are held in signals so that the reads in the `display` host binding
     * and in the action components' templates are tracked. Both are changed imperatively - from
     * `show`/`hide`, and from the grid while it is rendering (e.g. `viewDetachHandler` hiding the
     * strip as its row is detached) - and a plain field would leave those bindings stale, which
     * surfaces as `NG0100` in dev mode and as an out-of-date strip in a zoneless app: a component's
     * host binding is only re-evaluated when its parent view is refreshed, so marking this
     * component for check is not enough.
     */
    private _hidden = signal(true);
    private _context = signal<any>(undefined);
    private _resourceStrings: IActionStripResourceStrings = null!;
    private _customResourceStrings: IActionStripResourceStrings = null!;
    private _defaultResourceStrings = getCurrentResourceStrings(ActionStripResourceStringsEN);
    private _originalParent!: HTMLElement;

    constructor() {
        onResourceChangeHandle(this._destroyRef, () => {
            this._defaultResourceStrings = getCurrentResourceStrings(ActionStripResourceStringsEN, false);
            this._customResourceStrings = this._resourceStrings ? Object.assign({}, this._defaultResourceStrings, this._resourceStrings) : null!;
        }, this);
    }

    /**
     * Menu Items list.
     *
     * @hidden
     * @internal
     */
    public get menuItems() {
        const actions: any[] = [];
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
     * Getter for the 'display' property of the current action strip
     */
    @HostBinding('style.display')
    private get display(): string {
        return this._hidden() ? 'none' : 'flex';
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
            let allButtons: any[] = [];
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

    /** pin swapping w/ unpin resets the menuItems collection */
    protected trackMenuItem = trackByIdentity;

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
