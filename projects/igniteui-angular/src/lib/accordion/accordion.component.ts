import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChildren,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    QueryList
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACCORDION_NAVIGATION_KEYS } from '../core/utils';
import { IExpansionPanelCancelableEventArgs, IExpansionPanelEventArgs } from '../expansion-panel/expansion-panel.common';
import { IgxExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxAccordionExpansionMode } from './accordion.common';

let NEXT_ID = 0;

@Component({
    selector: 'igx-accordion',
    templateUrl: 'accordion.component.html'
})
export class IgxAccordionComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    /**
     * Sets/gets the `id` of the accordion component.
     * If not set, `id` will have value `"igx-accordion-0"`;
     * ```html
     * <igx-accordion id="my-first-accordion"></igx-expansion-panel>
     * ```
     * ```typescript
     * const accordionId = this.accordion.id;
     * ```
     *
     * @memberof IgxAccordionComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-accordion-${NEXT_ID++}`;

    /** Get/Set the animation settings that panels should use when expanding/collpasing.
     *
     * ```html
     * <igx-accordion [animationSettings]="customAnimationSettings"></igx-accordion>
     * ```
     *
     * ```typescript
     * const animationSettings: ToggleAnimationSettings = {
     *      openAnimation: growVerIn,
     *      closeAnimation: growVerOut
     * };
     *
     * this.accordion.animationSettings = animationSettings;
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
     * Gets/Sets accordion expansion mode
     *
     * @remarks
     * By default the accordion expansion mode is 'Single'
     * @param expansionMode: IgxAccordionExpansionMode
     */
    @Input()
    public get expansionMode(): IgxAccordionExpansionMode {
        return this._expansionMode;
    }
    public set expansionMode(expansionMode: IgxAccordionExpansionMode) {
        if (expansionMode === IgxAccordionExpansionMode.Single && this.expansionMode === IgxAccordionExpansionMode.Multiple) {
            const lastExpanded = this.panels.filter(p => !p.collapsed).pop();
            this.expandedPanels.forEach(panel => {
                if (panel !== lastExpanded) {
                    panel.collapse();
                }
            });
        }
        this._expansionMode = expansionMode;
    }

    /**
     * Emitted when a panel is expanding, before it finishes
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
    public panelExpanding = new EventEmitter<IExpansionPanelCancelableEventArgs>();

    /** Emitted when a panel is expanded, after it finishes
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
    public panelExpanded = new EventEmitter<IExpansionPanelEventArgs>();

    /** Emitted when a panel is collapsing, before it finishes
     *
     * ```html
     * <igx-accordion (panelCollapsing)="handlePanelCollapsing($event)">
     * </igx-accordion>
     * ```
     */
    @Output()
    public panelCollapsing = new EventEmitter<IExpansionPanelCancelableEventArgs>();

    /** Emitted when a panel is collapsed, after it finishes
     *
     * @example
     * ```html
     * <igx-accordion (panelCollapsed)="handlePanelCollapsed($event)">
     * </igx-accordion>
     * ```
     */
    @Output()
    public panelCollapsed = new EventEmitter<IExpansionPanelEventArgs>();

    /** @hidden @internal */
    @ContentChildren(IgxExpansionPanelComponent, { descendants: false })
    public _panels: QueryList<IgxExpansionPanelComponent>;

    /**
     * Returns all panels
     *
     * ```typescript
     * const panels: IgxExpansionPanelComponent[] = this.accordion.panels;
     * ```
     */
    public get panels(): IgxExpansionPanelComponent[] {
        return this._panels?.toArray();
    }

    private _animationSettings: ToggleAnimationSettings;
    private _expansionMode: IgxAccordionExpansionMode = IgxAccordionExpansionMode.Single;
    private expandedPanels: Set<IgxExpansionPanelComponent> = new Set<IgxExpansionPanelComponent>();
    private destroy$ = new Subject<void>();
    private unsubChildren$ = new Subject<void>();
    private enabledPanels: IgxExpansionPanelComponent[];

    constructor() { }

    public ngAfterContentInit() {
        this.updatePanelsAnimation();
    }

    public ngAfterViewInit() {
        const initiallyExpandedPanels: IgxExpansionPanelComponent[] = this._panels.filter(panel => !panel.collapsed);
        if (this.expansionMode === IgxAccordionExpansionMode.Single) {
            for (let i = 0; i < initiallyExpandedPanels.length - 1; i++) {
                initiallyExpandedPanels[i].collapse();
            }
            this.expandedPanels.add(initiallyExpandedPanels.pop());
        } else {
            this.expandedPanels = new Set<IgxExpansionPanelComponent>(initiallyExpandedPanels);
        }

        this._panels.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.subToChanges();
        });
        this.subToChanges();
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.unsubChildren$.next();
        this.unsubChildren$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Expands all collapsed expansion panels.
     *
     * ```typescript
     * accordion.expandAll();
     * ```
     */
    public expandAll() {
        if (this.expansionMode === IgxAccordionExpansionMode.Single) {
            return;
        }

        this.panels.forEach(panel => {
            if (!panel.header.disabled) {
                panel.expand();
            }
        });
    }

    /**
     * Collapses all expanded expansion panels.
     *
     * ```typescript
     * accordion.collapseAll();
     * ```
     */
    public collapseAll() {
        if (this.expansionMode === IgxAccordionExpansionMode.Single) {
            return;
        }

        this.panels.forEach(panel => {
            if (!panel.collapsed && !panel.header.disabled) {
                panel.collapse();
            }
        });
    }

    public handleKeydown(event: KeyboardEvent, panel: IgxExpansionPanelComponent) {
        const key = event.key.toLowerCase();
        if (!(ACCORDION_NAVIGATION_KEYS.has(key))) {
            return;
        }
        // TO DO: if we ever want to improve the performance of the accordion,
        // enabledPanels could be cached (by making a disabledChange emitter on the panel header)
        this.enabledPanels = this._panels.filter(p => !p.header.disabled);
        event.preventDefault();
        if (event.repeat) {
            setTimeout(() => this.handleNavigation(event, panel), 1);
        } else {
            this.handleNavigation(event, panel);
        }
    }

    private handleNavigation(event: KeyboardEvent, panel: IgxExpansionPanelComponent) {
        switch (event.key.toLowerCase()) {
            case 'home':
                this.enabledPanels[0].header.innerElement.focus();
                break;
            case 'end':
                this.enabledPanels[this.enabledPanels.length - 1].header.innerElement.focus();
                break;
            case 'arrowup':
            case 'up':
                this.handleUpDownArrow(true, event, panel);
                break;
            case 'arrowdown':
            case 'down':
                this.handleUpDownArrow(false, event, panel);
                break;
            default:
                return;
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
                this.collapseAll();
            } else {
                this.expandAll();
            }
        }
    }

    private getNextPanel(panel: IgxExpansionPanelComponent, dir: 1 | -1 = 1): IgxExpansionPanelComponent {
        const panelIndex = this.enabledPanels.indexOf(panel);
        return this.enabledPanels[panelIndex + dir] || panel;
    }

    private subToChanges() {
        this.unsubChildren$.next();
        this._panels.forEach(panel => {
            panel.contentExpanded.pipe(takeUntil(this.unsubChildren$)).subscribe((args: IExpansionPanelEventArgs) => {
                this.expandedPanels.add(args.owner);
                this.panelExpanded.emit(args);
            });
            panel.contentExpanding.pipe(takeUntil(this.unsubChildren$)).subscribe((args: IExpansionPanelCancelableEventArgs) => {
                if (args.cancel) {
                    return;
                }

                if (this.expansionMode === IgxAccordionExpansionMode.Single) {
                    this.expandedPanels.forEach(p => p.collapse());
                }
                this.panelExpanding.emit(args);
            });
            panel.contentCollapsed.pipe(takeUntil(this.unsubChildren$)).subscribe((args: IExpansionPanelEventArgs) => {
                this.expandedPanels.delete(args.owner);
                this.panelCollapsed.emit(args);
            });
            panel.contentCollapsing.pipe(takeUntil(this.unsubChildren$)).subscribe((args: IExpansionPanelCancelableEventArgs) => {
                this.panelCollapsing.emit(args);
            });
            fromEvent(panel.header.innerElement, 'keydown')
                .pipe(takeUntil(this.unsubChildren$))
                .subscribe((e: KeyboardEvent) => {
                    this.handleKeydown(e, panel);
                });
        });
    }

    private updatePanelsAnimation() {
        if (this.animationSettings !== undefined) {
            this.panels?.forEach(panel => panel.animationSettings = this.animationSettings);
        }
    }
}
