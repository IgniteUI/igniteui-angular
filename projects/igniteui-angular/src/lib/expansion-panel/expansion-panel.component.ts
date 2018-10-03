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
import { AnimationBuilder, AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { growVerOut, growVerIn } from '../animations/main';
import { IgxExpansionPanelBodyComponent } from './expansion-panel-body.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IToggleView } from '../core/navigation';

let NEXT_ID = 0;

export interface AnimationSettings {
    openAnimation: AnimationReferenceMetadata;
    closeAnimation: AnimationReferenceMetadata;
}
@Component({
    selector: 'igx-expansion-panel',
    templateUrl: 'expansion-panel.component.html'
})
export class IgxExpansionPanelComponent implements IToggleView {
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

    @HostBinding('class.igx-expansion-panel')
    public cssClass = 'igx-expansion-panel';

    @Input()
    public collapsed = true;

    @Output()
    public onCollapsed = new EventEmitter<any>();

    @Output()
    public onExpanded = new EventEmitter<any>();

    public get headerId() {
        return this.header ? `${this.id}-header` : '';
    }

    /**
     * @hidden
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    constructor(
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        private builder: AnimationBuilder) { }

    @ContentChild(forwardRef(() => IgxExpansionPanelBodyComponent), { read: IgxExpansionPanelBodyComponent })
    public body: IgxExpansionPanelBodyComponent;

    @ContentChild(forwardRef(() => IgxExpansionPanelHeaderComponent), { read: IgxExpansionPanelHeaderComponent })
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

    collapse(evt?: Event) {
        this.playCloseAnimation(
            () => {
                this.onCollapsed.emit({ event: evt, panel: this });
                this.collapsed = true;
            }
        );
    }

    expand(evt?: Event) {
        this.collapsed = false;
        this.cdr.detectChanges();
        this.playOpenAnimation(
            () => {
                this.onExpanded.emit({ event: evt, panel: this });
            }
        );
    }

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
