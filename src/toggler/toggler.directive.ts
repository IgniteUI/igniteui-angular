import {
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    Renderer2
} from "@angular/core";

@Directive({
    exportAs: "toggler",
    selector: "[igx-toggler]"
})
export class IgxTogglerDirective implements OnDestroy, OnInit {

    @Output()
    public onOpen = new EventEmitter();

    @Output()
    public onClose = new EventEmitter();

    @Input()
    public collapsed = false;

    private readonly HIDDEN_TOGGLER_CLASS: string = "igx-toggler--hidden";
    private readonly TOGGLER_CLASS: string = "igx-toggler";

    @HostBinding("class")
    private hostClass: string = this.HIDDEN_TOGGLER_CLASS;

    constructor(private elementRef: ElementRef) { }

    public toggle() {
        this.collapsed ? this.close() : this.open();
    }

    public open() {
        if (this.collapsed) { return; }
        this.hostClass = this.TOGGLER_CLASS;
        this.collapsed = true;
        document.addEventListener("click", this.handleClick.bind(this), true);
        this.onOpen.emit();
    }

    public close() {
        if (!this.collapsed) { return; }
        this.hostClass = this.HIDDEN_TOGGLER_CLASS;
        this.collapsed = false;
        this.onClose.emit();
    }

    public ngOnDestroy() {
        document.removeEventListener("click", this.handleClick.bind(this), true);
    }

    public ngOnInit() {
        if (this.collapsed) {
            this.hostClass = this.TOGGLER_CLASS;
        }
    }

    private handleClick(evt: MouseEvent) {
        const getElement = this.elementRef.nativeElement;
        if (getElement.contains(evt.target)) {
            return;
        }
        this.close();
        document.removeEventListener("click", this.handleClick.bind(this), true);
    }
}

@NgModule({
    declarations: [ IgxTogglerDirective ],
    exports: [ IgxTogglerDirective ]
})
export class IgxTogglerModule {}
