import { AfterContentInit, AfterViewInit, Component, ContentChildren, EventEmitter,
    HostBinding, Input, OnDestroy, Output, QueryList } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACCORDION_NAVIGATION_KEYS } from '../core/utils';
import { IExpansionPanelCancelableEventArgs,
    IExpansionPanelEventArgs, IgxExpansionPanelBase } from '../expansion-panel/expansion-panel.common';
import { IgxExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';

export interface IAccordionEventArgs extends IExpansionPanelEventArgs {
    owner: IgxAccordionComponent;
    /** Provides a reference to the `IgxExpansionPanelComponent` which was expanded/collapsed. */
    panel: IgxExpansionPanelBase;
}

export interface IAccordionCancelableEventArgs extends IExpansionPanelCancelableEventArgs {
    owner: IgxAccordionComponent;
    /** Provides a reference to the `IgxExpansionPanelComponent` which is currently expanding/collapsing. */
    panel: IgxExpansionPanelBase;
}

let NEXT_ID = 0;

/**
 * IgxAccordion is a container-based component that contains that can house multiple expansion panels.
 *
 * @igxModule IgxAccordionModule
 *
 * @igxKeywords accordion
 *
 * @igxGroup Layouts
 *
 * @remark
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
    templateUrl: 'accordion.component.html'
})
export class IgxAccordionComponent implements AfterContentInit, AfterViewInit, OnDestroy {
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
    @Input()
    public singleBranchExpand = false;

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
    private _destroy$ = new Subject<void>();
    private _unsubChildren$ = new Subject<void>();
    private _enabledPanels!: IgxExpansionPanelComponent[];

    constructor() { }

    /** @hidden @internal **/
    public ngAfterContentInit(): void {
        this.updatePanelsAnimation();
    }

    /** @hidden @internal **/
    public ngAfterViewInit(): void {
        this._expandedPanels = new Set<IgxExpansionPanelComponent>(this._panels.filter(panel => !panel.collapsed));
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
            for(let i = 0; i < this.panels.length - 1; i++) {
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

    private handleKeydown(event: KeyboardEvent, panel: IgxExpansionPanelComponent): void {
        const key = event.key.toLowerCase();
        if (!(ACCORDION_NAVIGATION_KEYS.has(key))) {
            return;
        }
        // TO DO: if we ever want to improve the performance of the accordion,
        // enabledPanels could be cached (by making a disabledChange emitter on the panel header)
        this._enabledPanels = this._panels.filter(p => !p.header.disabled);
        event.preventDefault();
        this.handleNavigation(event, panel);
    }

    private handleNavigation(event: KeyboardEvent, panel: IgxExpansionPanelComponent): void {
        switch (event.key.toLowerCase()) {
            case 'home':
                this._enabledPanels[0].header.innerElement.focus();
                break;
            case 'end':
                this._enabledPanels[this._enabledPanels.length - 1].header.innerElement.focus();
                break;
            case 'arrowup':
            case 'up':
                this.handleUpDownArrow(true, event, panel);
                break;
            case 'arrowdown':
            case 'down':
                this.handleUpDownArrow(false, event, panel);
                break;
        }
    }

    private handleUpDownArrow(isUp: boolean, event: KeyboardEvent, panel: IgxExpansionPanelComponent): void {
        if (!event.altKey) {
            const focusedPanel = panel;
            const next = this.getNextPanel(focusedPanel, isUp ? -1 : 1);
            if (next === focusedPanel) {
                return;
            }
            next.header.innerElement.focus();
        }
        if (event.altKey && event.shiftKey) {
            if (isUp) {
                this._enabledPanels.forEach(p => p.collapse());
            } else {
                if (this.singleBranchExpand) {
                    for(let i = 0; i < this._enabledPanels.length - 1; i++) {
                        this._enabledPanels[i].collapse();
                    }
                    this._enabledPanels[this._enabledPanels.length - 1].expand();
                    return;
                }
                this._enabledPanels.forEach(p => p.expand());
            }
        }
    }

    private getNextPanel(panel: IgxExpansionPanelComponent, dir: 1 | -1 = 1): IgxExpansionPanelComponent {
        const panelIndex = this._enabledPanels.indexOf(panel);
        return this._enabledPanels[panelIndex + dir] || panel;
    }

    private subToChanges(): void {
        this._unsubChildren$.next();
        this._panels.forEach(panel => {
            panel.contentExpanded.pipe(takeUntil(this._unsubChildren$)).subscribe((args: IExpansionPanelEventArgs) => {
                this._expandedPanels.add(args.owner);
                const evArgs: IAccordionEventArgs = { ...args, owner: this, panel: args.owner };
                this.panelExpanded.emit(evArgs);
            });
            panel.contentExpanding.pipe(takeUntil(this._unsubChildren$)).subscribe((args: IExpansionPanelCancelableEventArgs) => {
                if (args.cancel) {
                    return;
                }
                if (this.singleBranchExpand) {
                    this._expandedPanels.forEach(p => {
                        if (!p.header.disabled) {
                            p.collapse();
                        }
                    });
                }
                const evArgs: IAccordionCancelableEventArgs = { ...args, owner: this, panel: args.owner };
                this.panelExpanding.emit(evArgs);
                if (evArgs.cancel) {
                    args.cancel = true;
                }
            });
            panel.contentCollapsed.pipe(takeUntil(this._unsubChildren$)).subscribe((args: IExpansionPanelEventArgs) => {
                this._expandedPanels.delete(args.owner);
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
            fromEvent(panel.header.innerElement, 'keydown')
                .pipe(takeUntil(this._unsubChildren$))
                .subscribe((e: KeyboardEvent) => {
                    this.handleKeydown(e, panel);
                });
        });
    }

    private updatePanelsAnimation(): void {
        if (this.animationSettings !== undefined) {
            this.panels?.forEach(panel => panel.animationSettings = this.animationSettings);
        }
    }
}
