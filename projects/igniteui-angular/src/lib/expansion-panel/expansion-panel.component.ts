import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
    HostBinding,
    Input,
    Output,
    ContentChild,
    forwardRef,
} from '@angular/core';
import { AnimationBuilder, AnimationReferenceMetadata, useAnimation, AnimationAnimateRefMetadata } from '@angular/animations';
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
export class IgxExpansionPanelComponent implements IgxExpansionPanelBase {

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
     */
    @Input()
    public collapsed = true;

    /**
     * Emitted when the expansion panel finishes collapsing
     * ```typescript
     *  handleCollapsed(event: {
     *  panel: IgxExpansionPanelComponent,
     *  event: Event
     * })
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
     *  handleExpanded(event: {
     *  panel: IgxExpansionPanelComponent,
     *  event: Event
     * })
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
    constructor(private cdr: ChangeDetectorRef, private builder: AnimationBuilder) { }

    /**
     * @hidden
     */
    @ContentChild(forwardRef(() => IgxExpansionPanelBodyComponent), { read: forwardRef(() => IgxExpansionPanelBodyComponent) })
    public body: IgxExpansionPanelBodyComponent;

    /**
     * @hidden
     */
    @ContentChild(forwardRef(() => IgxExpansionPanelHeaderComponent), { read: forwardRef(() => IgxExpansionPanelHeaderComponent) })
    public header: IgxExpansionPanelHeaderComponent;


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
    collapse(evt?: Event) {
        this.playCloseAnimation(
            () => {
                this.onCollapsed.emit({ event: evt, panel: this });
                this.collapsed = true;
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
    expand(evt?: Event) {
        this.collapsed = false;
        this.cdr.detectChanges();
        this.playOpenAnimation(
            () => {
                this.onExpanded.emit({ event: evt, panel: this });
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
    toggle(evt?: Event) {
        if (this.collapsed) {
            this.open(evt);
        } else {
            this.close(evt);
        }
    }

    open(evt?: Event) {
        this.expand(evt);
    }
    close(evt?: Event) {
        this.collapse(evt);
    }

}
