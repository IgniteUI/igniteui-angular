import {
    animate,
    AnimationBuilder,
    AnimationFactory,
    AnimationPlayer,
    style} from "@angular/animations";
import {
    ChangeDetectorRef,
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
import { IgxNavigationService, IToggleView } from "../../core/navigation";

@Directive({
    exportAs: "toggle",
    selector: "[igxToggle]"
})
export class IgxToggleDirective implements IToggleView, OnInit, OnDestroy {

    @Output()
    public onOpened = new EventEmitter();

    @Output()
    public onOpening = new EventEmitter();

    @Output()
    public onClosed = new EventEmitter();

    @Output()
    public onClosing = new EventEmitter();

    @Input()
    public collapsed = true;

    @Input()
    public id: string;

    public get element() {
        return this.elementRef.nativeElement;
    }

    @HostBinding("class.igx-toggle--hidden")
    public get hiddenClass() {
        return this.collapsed;
    }

    @HostBinding("class.igx-toggle")
    public get defaultClass() {
        return !this.collapsed;
    }

    private _id: string;

    constructor(
        private elementRef: ElementRef,
        private builder: AnimationBuilder,
        private cdr: ChangeDetectorRef,
        @Optional() private navigationService: IgxNavigationService) { }

    public open(fireEvents?: boolean, handler?) {
        if (!this.collapsed) { return; }

        const player = this.animationActivation();
        player.onStart(() => {
            // this.collapsed = !this.collapsed;
        });
        player.onDone(() =>  {
            player.destroy();
            if (fireEvents) {
                this.onOpened.emit();
            }
        });

        this.collapsed = !this.collapsed;
        if (fireEvents) {
            this.onOpening.emit();
        }
        player.play();
    }

    public close(fireEvents?: boolean, handler?) {
        if (this.collapsed) { return; }

        const player = this.animationActivation();
        player.onStart(() => {
        });
        player.onDone(() => {
            this.collapsed = !this.collapsed;
            // When using directive into component with OnPush it is necessary to
            // trigger change detection again when close animation ends
            // due to late updated @collapsed property.
            this.cdr.markForCheck();
            player.destroy();
            if (fireEvents) {
                this.onClosed.emit();
            }
        });

        if (fireEvents) {
            this.onClosing.emit();
        }
        player.play();
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

        this.collapsed ?
            animation = this.openingAnimation() :
            animation = this.closingAnimation();

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
    public closeOnOutsideClick = true;

    @Input("igxToggleAction")
    set target(target: any) {
        if (target !== null && target !== "") {
            this._target = target;
        }
    }

    get target(): any {
        if (typeof this._target === "string") {
            return this.navigationService.get(this._target);
        }
        return this._target;
    }

    private _handler;
    private _target: IToggleView | string;

    constructor(private element: ElementRef, @Optional() private navigationService: IgxNavigationService) { }

    public ngOnDestroy() {
        document.removeEventListener("click", this._handler, true);
    }

    public ngOnInit() {
        if (this.closeOnOutsideClick) {
            this._handler = (evt) => {
                if (this.target.element.contains(evt.target) || this.element.nativeElement.contains(evt.target)) {
                    return;
                }

                this.target.close(true);
                document.removeEventListener("click", this._handler, true);
            };

            document.addEventListener("click", this._handler, true);
        }
    }

    @HostListener("click")
    public onClick() {
        this.target.toggle(true);

        if (this._handler) {
            document.addEventListener("click", this._handler, true);
        }
    }
}
@NgModule({
    declarations: [ IgxToggleDirective, IgxToggleActionDirective ],
    exports: [ IgxToggleDirective, IgxToggleActionDirective ],
    providers: [ IgxNavigationService ]
})
export class IgxToggleModule {}
