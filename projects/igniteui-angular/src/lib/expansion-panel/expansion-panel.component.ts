import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    ContentChild,
    AfterContentInit
} from '@angular/core';
import { AnimationBuilder, AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { growVerOut, growVerIn } from '../animations/main';
import { IgxExpansionPanelBodyComponent } from './expansion-panel-body.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IGX_EXPANSION_PANEL_COMPONENT, IgxExpansionPanelBase, IExpansionPanelEventArgs } from './expansion-panel.common';

let NEXT_ID = 0;

export interface AnimationSettings {
    openAnimation: AnimationReferenceMetadata;
    closeAnimation: AnimationReferenceMetadata;
}
@Component({
    selector: 'igx-expansion-panel',
    templateUrl: 'expansion-panel.component.html',
    providers: [{ provide: IGX_EXPANSION_PANEL_COMPONENT, useExisting: IgxExpansionPanelComponent }]
})
export class IgxExpansionPanelComponent implements IgxExpansionPanelBase, AfterContentInit {
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
    public animationSettings: AnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

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
    @Input()
    public get collapsed(): boolean {
        return this._collapsed;
    }
    public set collapsed(value) {
        this._collapsed = value;
        this.collapsedChange.emit(this._collapsed);
    }

    /**
     * @hidden
     */
    @Output()
    public collapsedChange = new EventEmitter<boolean>();

    /**
     * Emitted when the expansion panel finishes collapsing
     * ```typescript
     *  handleCollapsed(event: IExpansionPanelEventArgs)
     * ```
     * ```html
     *  <igx-expansion-panel (onCollapsed)="handleCollapsed($event)">
     *      ...
     *  </igx-expansion-panel>
     * ```
     */
    @Output()
    public onCollapsed = new EventEmitter<IExpansionPanelEventArgs>();

    /**
     * Emitted when the expansion panel finishes expanding
     * ```typescript
     *  handleExpanded(event: IExpansionPanelEventArgs)
     * ```
     * ```html
     *  <igx-expansion-panel (onExpanded)="handleExpanded($event)">
     *      ...
     *  </igx-expansion-panel>
     * ```
     */
    @Output()
    public onExpanded = new EventEmitter<IExpansionPanelEventArgs>();

    /**
     * @hidden
     */
    public get headerId() {
        return this.header ? `${this.id}-header` : '';
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

    private _collapsed = true;

    constructor(private cdr: ChangeDetectorRef, private builder: AnimationBuilder) { }

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
     *  <button (click)="myPanel.collapse($event)">Collpase Panel</button>
     * ```
     */
    public collapse(evt?: Event) {
        if (this.collapsed) { // If expansion panel is already collapsed, do nothing
            return;
        }
        this.playCloseAnimation(
            () => {
                this.onCollapsed.emit({ event: evt, panel: this, owner: this });
                this.collapsed = true;
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
     *  <button (click)="myPanel.expand($event)">Expand Panel</button>
     * ```
     */
    public expand(evt?: Event) {
        if (!this.collapsed) { // If the panel is already opened, do nothing
            return;
        }
        this.collapsed = false;
        this.cdr.detectChanges();
        this.playOpenAnimation(
            () => {
                this.onExpanded.emit({ event: evt, panel: this, owner: this });
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
     *  <button (click)="myPanel.toggle($event)">Expand Panel</button>
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

    private playOpenAnimation(cb: () => void) {
        if (!this.body) { // if not body element is passed, there is nothing to animate
            return;
        }
        const animation = useAnimation(this.animationSettings.openAnimation);
        const animationBuilder = this.builder.build(animation);
        const openAnimationPlayer = animationBuilder.create(this.body.element.nativeElement);

        openAnimationPlayer.onDone(() => {
            cb();
            openAnimationPlayer.reset();
        });

        openAnimationPlayer.play();
    }

    private playCloseAnimation(cb: () => void) {
        if (!this.body) { // if not body element is passed, there is nothing to animate
            return;
        }
        const animation = useAnimation(this.animationSettings.closeAnimation);
        const animationBuilder = this.builder.build(animation);
        const closeAnimationPlayer = animationBuilder.create(this.body.element.nativeElement);
        closeAnimationPlayer.onDone(() => {
            cb();
            closeAnimationPlayer.reset();
        });

        closeAnimationPlayer.play();
    }
}
