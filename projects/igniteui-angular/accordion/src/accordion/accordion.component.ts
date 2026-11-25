import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ContentChildren, EventEmitter, HostBinding, Input, OnDestroy, Output, QueryList, booleanAttribute, inject, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IExpansionPanelCancelableEventArgs,
    IExpansionPanelEventArgs, IgxExpansionPanelBase
} from 'igniteui-angular/expansion-panel';
import { IgxExpansionPanelComponent } from 'igniteui-angular/expansion-panel';
import { ToggleAnimationSettings } from 'igniteui-angular/expansion-panel';
import {
    IgxKeyBindingObserver,
    IgxKeyBindingsService,
    altKey,
    arrowDown,
    arrowUp,
    endKey,
    homeKey,
    shiftKey
} from 'igniteui-angular/core';

export interface IAccordionEventArgs extends IExpansionPanelEventArgs {
    owner: IgxAccordionComponent;
    /** Provides a reference to the expansion panel which was expanded/collapsed. */
    panel: IgxExpansionPanelBase;
}

export interface IAccordionCancelableEventArgs extends IExpansionPanelCancelableEventArgs {
    owner: IgxAccordionComponent;
    /** Provides a reference to the expansion panel which is currently expanding/collapsing. */
    panel: IgxExpansionPanelBase;
    /** Enables canceling the expansion/collapse operation. */
    cancel: boolean;
}

let NEXT_ID = 0;

/**
 * Accordion is a container-based component that contains that can house multiple expansion panels.
 *
 * @igxModule IgxAccordionModule
 *
 * @igxKeywords accordion
 *
 * @igxGroup Layouts
 *
 * @remarks
 * The Ignite UI for Angular Accordion component enables the user to navigate among multiple collapsing panels
 * displayed in a single container.
 * The accordion offers keyboard navigation and API to control the underlying panels' expansion state.
 *
 * @example
 * ```html
 * <igx-accordion>
 *   <igx-expansion-panel *ngFor="let panel of panels">
 *       ...
 *   </igx-expansion-panel>
 * </igx-accordion>
 * ```
 */
@Component({
    selector: 'igx-accordion',
    templateUrl: 'accordion.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    providers: [IgxKeyBindingsService]
})
export class IgxAccordionComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    private cdr = inject(ChangeDetectorRef);
    private readonly _keyBindings = inject(IgxKeyBindingsService);
    private _headerObservers: IgxKeyBindingObserver[] = [];

    /**
     * Get/Set the `id` of the accordion component.
     * Default value is `"igx-accordion-0"`;
     * ```html
     * <igx-accordion id="my-first-accordion"></igx-accordion>
     * ```
     * ```typescript
     * const accordionId = this.accordion.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-accordion-${NEXT_ID++}`;

    /** @hidden @internal **/
    @HostBinding('class.igx-accordion')
    public cssClass = 'igx-accordion';

    /** @hidden @internal **/
    @HostBinding('style.display')
    public displayStyle = 'block';

    /**
     * Get/Set the animation settings that panels should use when expanding/collpasing.
     *
     * ```html
     * <igx-accordion [animationSettings]="customAnimationSettings"></igx-accordion>
     * ```
     *
     * ```typescript
     * const customAnimationSettings: ToggleAnimationSettings = {
     *      openAnimation: growVerIn,
     *      closeAnimation: growVerOut
     * };
     *
     * this.accordion.animationSettings = customAnimationSettings;
     * ```
     */
    @Input()
    public get animationSettings(): ToggleAnimationSettings {
        return this._animationSettings;
    }

    public set animationSettings(value: ToggleAnimationSettings) {
        this._animationSettings = value;
        this.updatePanelsAnimation();
    }

    /**
     * Get/Set how the accordion handles the expansion of the projected expansion panels.
     * If set to `true`, only a single panel can be expanded at a time, collapsing all others
     *
     * ```html
     * <igx-accordion [singleBranchExpand]="true">
     * ...
     * </igx-accordion>
     * ```
     *
     * ```typescript
     * this.accordion.singleBranchExpand = false;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get singleBranchExpand(): boolean {
        return this._singleBranchExpand;
    }

    public set singleBranchExpand(val: boolean) {
        this._singleBranchExpand = val;
        if (val) {
            this.collapseAllExceptLast();
        }
    }

    /**
     * Emitted before a panel is expanded.
     *
     * @remarks
     * This event is cancelable.
     *
     * ```html
     * <igx-accordion (panelExpanding)="handlePanelExpanding($event)">
     * </igx-accordion>
     * ```
     *
     *```typescript
     * public handlePanelExpanding(event: IExpansionPanelCancelableEventArgs){
     *  const expandedPanel: IgxExpansionPanelComponent = event.panel;
     *  if (expandedPanel.disabled) {
     *      event.cancel = true;
     *  }
     * }
     *```
     */
    @Output()
    public panelExpanding = new EventEmitter<IAccordionCancelableEventArgs>();

    /**
     * Emitted after a panel has been expanded.
     *
     * ```html
     * <igx-accordion (panelExpanded)="handlePanelExpanded($event)">
     * </igx-accordion>
     * ```
     *
     *```typescript
     * public handlePanelExpanded(event: IExpansionPanelCancelableEventArgs) {
     *  const expandedPanel: IgxExpansionPanelComponent = event.panel;
     *  console.log("Panel is expanded: ", expandedPanel.id);
     * }
     *```
     */
    @Output()
    public panelExpanded = new EventEmitter<IAccordionEventArgs>();

    /**
     * Emitted before a panel is collapsed.
     *
     * @remarks
     * This event is cancelable.
     *
     * ```html
     * <igx-accordion (panelCollapsing)="handlePanelCollapsing($event)">
     * </igx-accordion>
     * ```
     */
    @Output()
    public panelCollapsing = new EventEmitter<IAccordionCancelableEventArgs>();

    /**
     * Emitted after a panel has been collapsed.
     *
     * ```html
     * <igx-accordion (panelCollapsed)="handlePanelCollapsed($event)">
     * </igx-accordion>
     * ```
     */
    @Output()
    public panelCollapsed = new EventEmitter<IAccordionEventArgs>();

    /**
     * Get all panels.
     *
     * ```typescript
     * const panels: IgxExpansionPanelComponent[] = this.accordion.panels;
     * ```
     */
    public get panels(): IgxExpansionPanelComponent[] {
        return this._panels?.toArray();
    }

    @ContentChildren(IgxExpansionPanelComponent)
    private _panels!: QueryList<IgxExpansionPanelComponent>;
    private _animationSettings!: ToggleAnimationSettings;
    private _expandedPanels!: Set<IgxExpansionPanelComponent>;
    private _expandingPanels!: Set<IgxExpansionPanelComponent>;
    private _destroy$ = new Subject<void>();
    private _unsubChildren$ = new Subject<void>();
    private _singleBranchExpand = false;

    constructor() {
        // Only the keys pressed on a panel header navigate: they are handled at the header (observed in
        // subToChanges), the accordion host skips the rest. A held key runs its handler again.
        this._keyBindings
            .configure({ skip: (_target, event) => !this.getHeaderPanel(event), bindingDefaults: { repeat: true } })
            .set(homeKey, () => this.enabledPanels()[0]?.header.innerElement.focus())
            .set(endKey, () => this.enabledPanels().at(-1)?.header.innerElement.focus())
            .set(arrowUp, (event) => this.focusNextPanel(event, -1))
            .set(arrowDown, (event) => this.focusNextPanel(event, 1))
            .set([altKey, shiftKey, arrowUp], (event) => this.collapseEnabledPanels(event))
            .set([altKey, shiftKey, arrowDown], (event) => this.expandEnabledPanels(event));
    }

    /** @hidden @internal **/
    public ngAfterContentInit(): void {
        this.updatePanelsAnimation();
        if (this.singleBranchExpand) {
            this.collapseAllExceptLast();
        }
    }

    /** @hidden @internal **/
    public ngAfterViewInit(): void {
        this._expandedPanels = new Set<IgxExpansionPanelComponent>(this._panels.filter(panel => !panel.collapsed));
        this._expandingPanels = new Set<IgxExpansionPanelComponent>();
        this._panels.changes.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this.subToChanges();
        });
        this.subToChanges();
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this._unsubChildren$.next();
        this._unsubChildren$.complete();
        this._destroy$.next();
        this._destroy$.complete();
    }

    /**
     * Expands all collapsed expansion panels.
     *
     * ```typescript
     * accordion.expandAll();
     * ```
     */
    public expandAll(): void {
        if (this.singleBranchExpand) {
            for (let i = 0; i < this.panels.length - 1; i++) {
                this.panels[i].collapse();
            }
            this._panels.last.expand();
            return;
        }

        this.panels.forEach(panel => panel.expand());
    }

    /**
     * Collapses all expanded expansion panels.
     *
     * ```typescript
     * accordion.collapseAll();
     * ```
     */
    public collapseAll(): void {
        this.panels.forEach(panel => panel.collapse());
    }

    private collapseAllExceptLast(): void {
        const lastExpanded = this.panels?.filter(p => !p.collapsed && !p.header.disabled).pop();
        this.panels?.forEach((p: IgxExpansionPanelComponent) => {
            if (p !== lastExpanded && !p.header.disabled) {
                p.collapsed = true;
            }
        });
        this.cdr.markForCheck();
    }

    /** The panel whose header listener handles the event; the accordion host itself handles no keys. */
    private getHeaderPanel(event: KeyboardEvent): IgxExpansionPanelComponent | undefined {
        return this._panels?.find(p => p.header.innerElement === event.currentTarget);
    }


    private enabledPanels(): IgxExpansionPanelComponent[] {
        return this._panels.filter(p => !p.header.disabled);
    }

    /** Focuses the next (`1`) or previous (`-1`) enabled panel header; the focus stays at the first and last one. */
    private focusNextPanel(event: KeyboardEvent, dir: 1 | -1): void {
        const enabled = this.enabledPanels();
        const panel = this.getHeaderPanel(event)!;
        const next = enabled[enabled.indexOf(panel) + dir];
        next?.header.innerElement.focus();
    }

    /** Alt + Shift + ArrowUp: unlike `collapseAll()`, skips the disabled panels and passes the event. */
    private collapseEnabledPanels(event: KeyboardEvent): void {
        this.enabledPanels().forEach(p => p.collapse(event));
    }

    /**
     * Alt + Shift + ArrowDown: expands every enabled panel, or only the last one when `singleBranchExpand`
     * is set. Unlike `expandAll()`, skips the disabled panels and passes the event.
     */
    private expandEnabledPanels(event: KeyboardEvent): void {
        const enabled = this.enabledPanels();
        if (this.singleBranchExpand) {
            enabled.slice(0, -1).forEach(p => p.collapse(event));
            enabled.at(-1)?.expand(event);
            return;
        }
        enabled.forEach(p => p.expand(event));
    }

    private subToChanges(): void {
        this._unsubChildren$.next();
        this._panels.forEach(panel => {
            panel.contentExpanded.pipe(takeUntil(this._unsubChildren$)).subscribe((args: IExpansionPanelEventArgs) => {
                this._expandedPanels.add(args.owner);
                this._expandingPanels.delete(args.owner);
                const evArgs: IAccordionEventArgs = { ...args, owner: this, panel: args.owner };
                this.panelExpanded.emit(evArgs);
            });
            panel.contentExpanding.pipe(takeUntil(this._unsubChildren$)).subscribe((args: IExpansionPanelCancelableEventArgs) => {
                if (args.cancel) {
                    return;
                }
                const evArgs: IAccordionCancelableEventArgs = { ...args, owner: this, panel: args.owner };
                this.panelExpanding.emit(evArgs);
                if (evArgs.cancel) {
                    args.cancel = true;
                    return;
                }
                if (this.singleBranchExpand) {
                    this._expandedPanels.forEach(p => {
                        if (!p.header.disabled) {
                            p.collapse();
                        }
                    });
                    this._expandingPanels.forEach(p => {
                        if (!p.header.disabled) {
                            if (!p.animationSettings.closeAnimation) {
                                p.openAnimationPlayer?.reset();
                            }
                            if (!p.animationSettings.openAnimation) {
                                p.closeAnimationPlayer?.reset();
                            }
                            p.collapse();
                        }
                    });
                    this._expandingPanels.add(args.owner);
                }
            });
            panel.contentCollapsed.pipe(takeUntil(this._unsubChildren$)).subscribe((args: IExpansionPanelEventArgs) => {
                this._expandedPanels.delete(args.owner);
                this._expandingPanels.delete(args.owner);
                const evArgs: IAccordionEventArgs = { ...args, owner: this, panel: args.owner };
                this.panelCollapsed.emit(evArgs);
            });
            panel.contentCollapsing.pipe(takeUntil(this._unsubChildren$)).subscribe((args: IExpansionPanelCancelableEventArgs) => {
                const evArgs: IAccordionCancelableEventArgs = { ...args, owner: this, panel: args.owner };
                this.panelCollapsing.emit(evArgs);
                if (evArgs.cancel) {
                    args.cancel = true;
                }
            });
        });

        // The header listeners handle the keys before the panel headers themselves, as before.
        this._headerObservers.forEach(observer => observer.unsubscribe());
        this._headerObservers = this._panels.map(panel => this._keyBindings.observeElement(panel.header.innerElement));
    }

    private updatePanelsAnimation(): void {
        if (this.animationSettings !== undefined) {
            this.panels?.forEach(panel => panel.animationSettings = this.animationSettings);
        }
    }
}
