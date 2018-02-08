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
    OnInit,
    Optional,
    Output
} from "@angular/core";
import { IgxNavigationService, IToggleView } from "../core/navigation";

@Directive({
    exportAs: "toggle",
    selector: "[igxToggle]"
})
export class IgxToggleDirective implements IToggleView, OnInit, OnDestroy {

    @Output()
    public onOpen = new EventEmitter();

    @Output()
    public onClose = new EventEmitter();

    @Input()
    public collapsed = true;

    @Input()
    public id: string;

    public get element() {
        return this.elementRef.nativeElement;
    }

    @HostBinding("class.igx-toggle--hidden")
    protected get hiddenClass() {
        return this.collapsed;
    }

    @HostBinding("class.igx-toggle")
    protected get defaultClass() {
        return !this.collapsed;
    }

    private _id: string;

    constructor(
        private elementRef: ElementRef,
        private builder: AnimationBuilder,
        @Optional() private navigationService: IgxNavigationService) { }

    public open(fireEvents?: boolean, handler?) {
        if (!this.collapsed) { return; }
        const player = this.animationActivation();
        player.onStart(() => this.collapsed = !this.collapsed);
        player.play();
        if (fireEvents) {
            this.onOpen.emit();
        }
    }

    public close(fireEvents?: boolean, handler?) {
        if (this.collapsed) { return; }
        const player = this.animationActivation();
        player.onDone(() => this.collapsed = !this.collapsed);
        player.play();
        if (fireEvents) {
            this.onClose.emit();
        }
    }

    public toggle(fireEvents?: boolean) {
        this.collapsed ? this.open(fireEvents) : this.close(fireEvents);
    }

    public ngOnInit() {
        if (this.navigationService && this.id) {
            this.navigationService.add(this.id, this);
        }
    }

    public ngOnDestroy() {
        if (this.navigationService && this.id) {
            this.navigationService.remove(this.id);
        }
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

@Directive({
    exportAs: "toggle-action",
    selector: "[igxToggleAction]"
})
export class IgxToggleActionDirective implements OnDestroy, OnInit {
    @Input()
    public closeOnOutsideClick: boolean = false;

    @Input("igx-toggle-action")
    set target(target) {
        this._target = target;
    }

    get target() {
        if (typeof this._target === "string") {
            return this.navigationService.get(this._target);
        }
        return this._target;
    }

    private _handler;
    private _target: IToggleView;

    constructor(private element: ElementRef, @Optional() private navigationService: IgxNavigationService) { }

    public ngOnDestroy() {
        document.removeEventListener("click", this._handler, true);
    }

    public ngOnInit() {
        if (this.closeOnOutsideClick) {
            this._handler = (evt) => {
                if (this.target.element.contains(evt.target) || this.element.nativeElement === evt.target) {
                    return;
                }

                this.target.close(true);
                document.removeEventListener("click", this._handler, true);
            };

            document.addEventListener("click", this._handler, true);
        }
    }

    @HostListener("click", ["$event"])
    private onClick() {
        this.target.toggle(true);

        if (this._handler) {
            document.addEventListener("click", this._handler, true);
        }
    }
}
@NgModule({
    declarations: [ IgxToggleDirective, IgxToggleActionDirective ],
    exports: [ IgxToggleDirective, IgxToggleActionDirective ]
})
export class IgxToggleModule {}
