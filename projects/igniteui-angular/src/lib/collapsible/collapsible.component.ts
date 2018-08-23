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

let NEXT_ID = 0;

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-title'
})
export class IgxCollapsibleTitleDirective {

    constructor( template: ElementRef<any>) { }
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-description'
})
export class IgxCollapsibleDescriptionDirective {

    constructor( template: ElementRef<any>) { }
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-body'
})
export class IgxCollapsibleBodyDirective {

    constructor( template: ElementRef<any>) { }
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

    @Input()
    public disabled;

    @Input()
    public headerButtons;

    @Output()
    public onCollapsed = new EventEmitter<any>();

    // @Output()
    // public onCollapsing = new EventEmitter<any>();

    // @Output()
    // public onExpanding = new EventEmitter<any>();

    @Output()
    public onExpanded = new EventEmitter<any>();

    constructor(
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        private renderer: Renderer2,
        private builder: AnimationBuilder) { }

    @ViewChildren('collapseBody', { read : ElementRef})
    private body: QueryList<ElementRef>;

    private playOpenAnimation(cb: () => void) {
        this.animationSettings.openAnimation.options.params.fromPosition = 'translateY(-50px)';
        const animationBuilder = this.builder.build(this.animationSettings.openAnimation);
        const openAnimationPlayer = animationBuilder.create(this.body.first.nativeElement);

        openAnimationPlayer.onDone(() => {
            cb();
            openAnimationPlayer.reset();
        });

        openAnimationPlayer.play();
    }

    private playCloseAnimation(cb: () => void) {
        this.animationSettings.closeAnimation.options.params.toPosition = 'translateY(-50px)';
        const animationBuilder = this.builder.build(this.animationSettings.closeAnimation);
        const closeAnimationPlayer = animationBuilder.create(this.body.first.nativeElement);

        closeAnimationPlayer.onDone(() => {
            cb();
            closeAnimationPlayer.reset();
        });

        closeAnimationPlayer.play();
    }

    collapse () {
        this.playCloseAnimation(
            () => {
                this.onCollapsed.emit();
                this.collapsed = true; }
            );
    }

    expand () {
        this.collapsed = false;
        this.playOpenAnimation(
            () => { this.onExpanded.emit(); }
        );
    }

    toggle () {
        if (this.collapsed) {
            this.expand();
        } else  {
            this.collapse();
        }
    }
}

