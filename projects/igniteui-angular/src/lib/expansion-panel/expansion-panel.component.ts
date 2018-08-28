import { element } from 'protractor';
import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
    HostBinding,
    Input,
    Output,
    ViewChild,
    Renderer2,
    Directive,
    ContentChild,
    QueryList,
    ViewChildren
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { AnimationBuilder, AnimationReferenceMetadata, AnimationMetadataType, AnimationAnimateRefMetadata } from '@angular/animations';
import { IAnimationParams } from '../animations/main';
import { slideOutTop, slideInTop } from '../animations/main';
import { IExpansionPanelEventArgs, IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IgxExpansionPanelBodyDirective, IgxExpansionPanelHeaderDirective, IgxExpansionPanelTitleDirective } from './expansion-panel.directives';

let NEXT_ID = 0;

@Component({
    selector: 'igx-expansion-panel',
    templateUrl: 'expansion-panel.component.html'
})
export class IgxExpansionPanelComponent {

    @Input()
    public animationSettings: { openAnimation: AnimationReferenceMetadata, closeAnimation: AnimationReferenceMetadata } = {
        openAnimation:  Object.assign(slideInTop, {
            fromScale: 0,
            toScale: 1,
            fromPosition: 'translateY(0px)',
            toPosition: 'translateY(0px)',
            startOpacity: 0.7,
            endOpacity: 1,
            easing: `cubic-bezier(0.895, 0.030, 0.685, 0.220)`
        }),
        closeAnimation: slideOutTop
    };

    /**
     * Sets/gets the `id` of the collapsible component.
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

    // @ContentChild(IgxExpansionPanelBodyDirective, { read: ElementRef })
    // public textArea: IgxExpansionPanelBodyDirective;

    @Input()
    @HostBinding('attr.aria-role') //OK
    public role = 'region';

    @Input()
    public collapsed = true;

    @HostBinding('attr.aria-disabled')
    @HostBinding('class.igx-expansion-panel--disabled')
    public get isDisabled () {
        return this.disabled;
    }

    @Input() public disabled = false;

    @Input()
    public headerButtons;

    @Output()
    public onCollapsed = new EventEmitter<IExpansionPanelEventArgs>();

    // @Output()
    // public onCollapsing = new EventEmitter<any>();

    // @Output()
    // public onExpanding = new EventEmitter<any>();

    @Output()
    public onExpanded = new EventEmitter<IExpansionPanelEventArgs>();

    constructor(
        @ContentChild(IgxExpansionPanelHeaderComponent)
        public header: IgxExpansionPanelHeaderComponent,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        private renderer: Renderer2,
        private builder: AnimationBuilder) { }

    @ViewChildren('collapseBody', { read : ElementRef})
    private body: QueryList<ElementRef>;

    @ContentChild(IgxExpansionPanelTitleDirective)
    public title: IgxExpansionPanelTitleDirective;

    @Input()
    @HostBinding('attr.aria-labelledby')
    public labelledby = this.title.id; //??TODO reference to the title directive text

    private playOpenAnimation(cb: () => void) {
        this.animationSettings.openAnimation.options.params.fromPosition = 'translateY(0px)';
        const animationBuilder = this.builder.build(this.animationSettings.openAnimation);
        const openAnimationPlayer = animationBuilder.create(this.body.first.nativeElement);

        openAnimationPlayer.onDone(() => {
            cb();
            openAnimationPlayer.reset();
        });

        openAnimationPlayer.play();
    }

    private playCloseAnimation(cb: () => void) {
        this.animationSettings.closeAnimation.options.params.toPosition = 'translateY(0px)';
        const animationBuilder = this.builder.build(this.animationSettings.closeAnimation);
        const closeAnimationPlayer = animationBuilder.create(this.body.first.nativeElement);

        closeAnimationPlayer.onDone(() => {
            cb();
            closeAnimationPlayer.reset();
        });

        closeAnimationPlayer.play();
    }

    collapse (evt?: Event) {
        this.playCloseAnimation(
            () => {
                this.onCollapsed.emit({event: evt});
                this.collapsed = true; }
            );
    }

    expand (evt?: Event) {
        this.collapsed = false;
        this.playOpenAnimation(
            () => { this.onExpanded.emit({event: evt}); }
        );
    }

    toggle (evt?: Event) {
        if (this.collapsed) {
            this.expand(evt);
        } else  {
            this.collapse(evt);
        }
    }
}

