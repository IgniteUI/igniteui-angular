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
import { ICollapsibleEventArgs } from './collapsible-header.component';

let NEXT_ID = 0;
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-header'
})
export class IgxCollapsibleHeaderDirective {
    constructor (public element: ElementRef<any>) {}
}
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-title'
})
export class IgxCollapsibleTitleDirective {

    constructor(public element: ElementRef<any>) { }
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-description'
})
export class IgxCollapsibleDescriptionDirective {

    constructor(public element: ElementRef<any>) { }
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-body'
})
export class IgxCollapsibleBodyDirective {

    constructor(public element: ElementRef<any>) { }
}

@Component({
    selector: 'igx-collapsible',
    templateUrl: 'collapsible.component.html'
})
export class IgxCollapsibleComponent {

    animationSettings: { openAnimation: AnimationReferenceMetadata, closeAnimation: AnimationReferenceMetadata } = {
        openAnimation:  slideInTop,
        closeAnimation: slideOutTop
    };

    /**
     * Sets/gets the `id` of the collapsible component.
     * If not set, `id` will have value `"igx-collapsible-0"`;
     * ```html
     * <igx-collapsible id = "my-first-collapsible"></igx-collapsible>
     * ```
     * ```typescript
     * let collapsibleId =  this.collapsible.id;
     * ```
     * @memberof IgxCollapsibleComponent
     */

    @HostBinding('attr.id')
    @Input()
    public id = `igx-collapsible-${NEXT_ID++}`;

    @HostBinding('class.igx-collapsible')
    public cssClass = 'igx-collapsible';

    @ContentChild(IgxCollapsibleBodyDirective, { read: IgxCollapsibleBodyDirective })
    public textArea: IgxCollapsibleBodyDirective;

    @ViewChild('toggleBtn', { read: ElementRef })
    public toggleBtn: ElementRef;

    /**
     * An @Input property that set aria-labelledby attribute
     * ```html
     *<igx-combo [ariaLabelledBy]="'label1'">
     * ```
     */
    @HostBinding('attr.aria-labelledby')
    @Input()
    public ariaLabelledBy: string;

    @Input()
    public collapsed = true;

    @HostBinding('attr.aria-expanded')
    private get HostState () {
        return !this.collapsed;
    }

    @HostBinding('class.igx-collapsible--disabled')
    @Input() public disabled = false;

    @Input()
    public headerButtons;

    @Output()
    public onCollapsed = new EventEmitter<ICollapsibleEventArgs>();

    // @Output()
    // public onCollapsing = new EventEmitter<any>();

    // @Output()
    // public onExpanding = new EventEmitter<any>();

    @Output()
    public onExpanded = new EventEmitter<ICollapsibleEventArgs>();

    constructor(
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        private renderer: Renderer2,
        private builder: AnimationBuilder) { }

    @ViewChildren('collapseBody', { read : ElementRef})
    private body: QueryList<ElementRef>;

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

