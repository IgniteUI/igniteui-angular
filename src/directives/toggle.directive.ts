import {
    animate,
    AnimationBuilder,
    AnimationFactory,
    AnimationPlayer,
    style} from "@angular/animations";
import {
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    Output
} from "@angular/core";

@Directive({
    exportAs: "toggle",
    selector: "[igx-toggle]"
})
export class IgxToggleDirective {

    @Output()
    public onOpen = new EventEmitter();

    @Output()
    public onClose = new EventEmitter();

    @Input()
    public collapsed = true;

    get element() {
        return this.elementRef.nativeElement;
    }

    @HostBinding("class.igx-toggle-hidden")
    public get hiddenClass() {
        return this.collapsed;
    }

    @HostBinding("class.igx-toggle")
    public get defaultClass() {
        return !this.collapsed;
    }

    constructor(private elementRef: ElementRef, private builder: AnimationBuilder) { }

    public open() {
        if (!this.collapsed) { return; }
        const player = this.animationActivation();
        player.onStart(() => this.collapsed = !this.collapsed);
        player.play();
        this.onOpen.emit();
    }

    public close() {
        if (this.collapsed) { return; }
        const player = this.animationActivation();
        player.onDone(() => this.collapsed = !this.collapsed);
        player.play();
        this.onClose.emit();
    }

    private animationActivation() {
        let animation: AnimationFactory;
        if (this.collapsed) {
            animation = this.openingAnimation();
        } else {
            animation = this.closingAnimation();
        }

        return animation.create(this.elementRef.nativeElement);
    }

    private openingAnimation() {
        return this.builder.build([
            style({ transform: "scaleY(0) translateY(-48px)", transformOrigin: "100% 0%", opacity: 0 }),
            animate("200ms ease-out", style({ transform: "scaleY(1) translateY(0)", opacity: 1 }))
        ]);
    }

    private closingAnimation() {
        return this.builder.build([
            style({ transform: "translateY(0)", opacity: 1}),
            animate("120ms ease-in", style({ transform: "translateY(-12px)", opacity: 0 }))
        ]);
    }
}

@NgModule({
    declarations: [ IgxToggleDirective ],
    exports: [ IgxToggleDirective ]
})
export class IgxToggleModule {}

@Directive({
    exportAs: "toggle-action",
    selector: "[igx-toggle-action]"
})
export class IgxToggleActionDirective implements OnDestroy {

    @Input("igx-toggle-action")
    public toggle: IgxToggleDirective;

    private handler;

    constructor(private element: ElementRef) {
        this.handler = (evt) => {
            if (this.toggle.element.contains(evt.target) || this.element.nativeElement === evt.target) {
                return;
            }

            this.toggle.close();
            this.removeEventHandler("click", this.handler);
        };
    }

    public ngOnDestroy() {
        this.removeEventHandler("click", this.handler);
    }

    @HostListener("click", ["$event"])
    private onClick() {
        if (this.toggle.collapsed) {
            this.toggle.open();
            document.addEventListener("click", this.handler, true);
        } else {
            this.toggle.close();
            this.removeEventHandler("click", this.handler);
        }
    }

    private removeEventHandler(event, callback) {
        document.removeEventListener(event, callback);
    }
}
@NgModule({
    declarations: [ IgxToggleActionDirective ],
    exports: [ IgxToggleActionDirective ]
})
export class IgxToggleActionModule {}
