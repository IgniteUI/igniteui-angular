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
    public isLoadedOpen = false;

    private readonly HIDDEN_TOGGLER_CLASS: string = "igx-toggler--hidden";
    private readonly TOGGLER_CLASS: string = "igx-toggler";

    @HostBinding("class")
    private hostClass: string = this.HIDDEN_TOGGLER_CLASS;

    private eventListener;
    private isTriggerClick = true;
    private isHidden = true;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        this.eventListener = this.renderer.listen("document", "click", this.checkEventTarger.bind(this));
    }

    public open() {
        this.hostClass = this.TOGGLER_CLASS;
        this.isHidden = false;
        this.isTriggerClick = true;
        this.onOpen.emit();
    }

    public close() {
        this.hostClass = this.HIDDEN_TOGGLER_CLASS;
        this.isHidden = true;
        this.isTriggerClick = true;
        this.onClose.emit();
    }

    public ngOnDestroy() {
        if (this.eventListener) {
            // Removing the event handler
            this.eventListener();
        }
    }

    public ngOnInit() {
        if (this.isLoadedOpen) {
            this.hostClass = this.TOGGLER_CLASS;
        }
    }

    private checkEventTarger(evt: MouseEvent) {
        const getElement = this.elementRef.nativeElement;
        if (!getElement.contains(evt.target) && !this.isHidden && !this.isTriggerClick) {
            this.close();
        }

        this.isTriggerClick = false;
    }
}

@NgModule({
    declarations: [ IgxTogglerDirective ],
    exports: [ IgxTogglerDirective ]
})
export class IgxToggleBoxModule {}
