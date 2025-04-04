import {
    AfterContentInit,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    Output,
    booleanAttribute
} from '@angular/core';
import { IgxAngularAnimationService } from '../services/animation/angular-animation-service';
import { AnimationService } from '../services/animation/animation';
import { IgxExpansionPanelBodyComponent } from './expansion-panel-body.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import {
    IExpansionPanelCancelableEventArgs,
    IExpansionPanelEventArgs,
    IgxExpansionPanelBase,
    IGX_EXPANSION_PANEL_COMPONENT
} from './expansion-panel.common';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from './toggle-animation-component';

let NEXT_ID = 0;

@Component({
    selector: 'igx-expansion-panel',
    templateUrl: 'expansion-panel.component.html',
    providers: [{ provide: IGX_EXPANSION_PANEL_COMPONENT, useExisting: IgxExpansionPanelComponent }],
    imports: []
})
export class IgxExpansionPanelComponent extends ToggleAnimationPlayer implements IgxExpansionPanelBase, AfterContentInit {
    /**
     * Sets/gets the animation settings of the expansion panel component
     * Open and Close animation should be passed
     *
     * Get
     * ```typescript
     *  const currentAnimations = this.panel.animationSettings;
     * ```
     * Set
     * ```typescript
     *  import { slideInLeft, slideOutRight } from 'igniteui-angular';
     *  ...
     *  this.panel.animationsSettings = {
     *      openAnimation: slideInLeft,
     *      closeAnimation: slideOutRight
     * };
     * ```
     * or via template
     * ```typescript
     *  import { slideInLeft, slideOutRight } from 'igniteui-angular';
     *  ...
     *  myCustomAnimationObject = {
     *      openAnimation: slideInLeft,
     *      closeAnimation: slideOutRight
     * };
     * ```html
     *  <igx-expansion-panel [animationSettings]='myCustomAnimationObject'>
     *  ...
     *  </igx-expansion-panel>
     * ```
     */
    @Input()
    public override get animationSettings(): ToggleAnimationSettings {
        return this._animationSettings;
    }
    public override set animationSettings(value: ToggleAnimationSettings) {
        this._animationSettings = value;
    }

    /**
     * Sets/gets the `id` of the expansion panel component.
     * If not set, `id` will have value `"igx-expansion-panel-0"`;
     * ```html
     * <igx-expansion-panel id = "my-first-expansion-panel"></igx-expansion-panel>
     * ```
     * ```typescript
     * let panelId =  this.panel.id;
     * ```
     *
     * @memberof IgxExpansionPanelComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-expansion-panel-${NEXT_ID++}`;

    /**
     * @hidden
     */
    @HostBinding('class.igx-expansion-panel')
    public cssClass = 'igx-expansion-panel';

    /**
     * @hidden
     */
    @HostBinding('class.igx-expansion-panel--expanded')
    private opened = false;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-expanded')
    public get panelExpanded() {
        return !this.collapsed;
    }

    /**
     * Gets/sets whether the component is collapsed (its content is hidden)
     * Get
     * ```typescript
     *  const myPanelState: boolean = this.panel.collapsed;
     * ```
     * Set
     * ```html
     *  this.panel.collapsed = true;
     * ```
     *
     * Two-way data binding:
     * ```html
     * <igx-expansion-panel [(collapsed)]="model.isCollapsed"></igx-expansion-panel>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public collapsed = true;

    /**
     * @hidden
     */
    @Output()
    public collapsedChange = new EventEmitter<boolean>();

    /**
     * Emitted when the expansion panel starts collapsing
     * ```typescript
     *  handleCollapsing(event: IExpansionPanelCancelableEventArgs)
     * ```
     * ```html
     *  <igx-expansion-panel (contentCollapsing)="handleCollapsing($event)">
     *      ...
     *  </igx-expansion-panel>
     * ```
     */
    @Output()
    public contentCollapsing = new EventEmitter<IExpansionPanelCancelableEventArgs>();

    /**
     * Emitted when the expansion panel finishes collapsing
     * ```typescript
     *  handleCollapsed(event: IExpansionPanelEventArgs)
     * ```
     * ```html
     *  <igx-expansion-panel (contentCollapsed)="handleCollapsed($event)">
     *      ...
     *  </igx-expansion-panel>
     * ```
     */
    @Output()
    public contentCollapsed = new EventEmitter<IExpansionPanelEventArgs>();

    /**
     * Emitted when the expansion panel starts expanding
     * ```typescript
     *  handleExpanding(event: IExpansionPanelCancelableEventArgs)
     * ```
     * ```html
     *  <igx-expansion-panel (contentExpanding)="handleExpanding($event)">
     *      ...
     *  </igx-expansion-panel>
     * ```
     */
    @Output()
    public contentExpanding = new EventEmitter<IExpansionPanelCancelableEventArgs>();

    /**
     * Emitted when the expansion panel finishes expanding
     * ```typescript
     *  handleExpanded(event: IExpansionPanelEventArgs)
     * ```
     * ```html
     *  <igx-expansion-panel (contentExpanded)="handleExpanded($event)">
     *      ...
     *  </igx-expansion-panel>
     * ```
     */
    @Output()
    public contentExpanded = new EventEmitter<IExpansionPanelEventArgs>();

    /**
     * @hidden
     */
    public get headerId() {
        return this.header ? `${this.id}-header` : '';
    }

    /**
     * @hidden @internal
     */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    @ContentChild(IgxExpansionPanelBodyComponent, { read: IgxExpansionPanelBodyComponent })
    public body: IgxExpansionPanelBodyComponent;

    /**
     * @hidden
     */
    @ContentChild(IgxExpansionPanelHeaderComponent, { read: IgxExpansionPanelHeaderComponent })
    public header: IgxExpansionPanelHeaderComponent;

    constructor(
        @Inject(IgxAngularAnimationService) animationService: AnimationService,
        private cdr: ChangeDetectorRef,
        private elementRef?: ElementRef) {
        super(animationService);
    }

    /** @hidden */
    public ngAfterContentInit(): void {
        if (this.body && this.header) {
            // schedule at end of turn:
            Promise.resolve().then(() => {
                this.body.labelledBy = this.body.labelledBy || this.headerId;
                this.body.label = this.body.label || this.id + '-region';
            });
        }
    }

    /**
     * Collapses the panel
     *
     * ```html
     *  <igx-expansion-panel #myPanel>
     *      ...
     *  </igx-expansion-panel>
     *  <button type="button" igxButton (click)="myPanel.collapse($event)">Collpase Panel</button>
     * ```
     */
    public collapse(evt?: Event) {
        // If expansion panel is already collapsed or is collapsing, do nothing
        if (this.collapsed || this.closeAnimationPlayer) {
            return;
        }
        const args = { event: evt, panel: this, owner: this, cancel: false };
        this.contentCollapsing.emit(args);
        if (args.cancel === true) {
            return;
        }
        this.opened = false;
        this.playCloseAnimation(
            this.body?.element,
            () => {
                this.contentCollapsed.emit({ event: evt, owner: this });
                this.collapsed = true;
                this.collapsedChange.emit(true);
                this.cdr.markForCheck();
            }
        );
    }

    /**
     * Expands the panel
     *
     * ```html
     *  <igx-expansion-panel #myPanel>
     *      ...
     *  </igx-expansion-panel>
     *  <button type="button" igxButton (click)="myPanel.expand($event)">Expand Panel</button>
     * ```
     */
    public expand(evt?: Event) {
        if (!this.collapsed && !this.closeAnimationPlayer) { // Check if the panel is currently collapsing or already expanded
            return;
        }
        const args = { event: evt, panel: this, owner: this, cancel: false };
        this.contentExpanding.emit(args);
        if (args.cancel === true) {
            return;
        }
        this.collapsed = false;
        this.opened = true;
        this.collapsedChange.emit(false);
        this.cdr.detectChanges();
        this.playOpenAnimation(
            this.body?.element,
            () => {
                this.contentExpanded.emit({ event: evt, owner: this });
            }
        );
    }

    /**
     * Toggles the panel
     *
     * ```html
     *  <igx-expansion-panel #myPanel>
     *      ...
     *  </igx-expansion-panel>
     *  <button type="button" igxButton (click)="myPanel.toggle($event)">Expand Panel</button>
     * ```
     */
    public toggle(evt?: Event) {
        if (this.collapsed) {
            this.open(evt);
        } else {
            this.close(evt);
        }
    }

    public open(evt?: Event) {
        this.expand(evt);
    }

    public close(evt?: Event) {
        this.collapse(evt);
    }
}
