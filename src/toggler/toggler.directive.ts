import {
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    Output,
    Renderer2
} from "@angular/core";

@Directive({
    exportAs: "toggler",
    selector: "[igx-toggler]"
})
export class IgxTogglerDirective implements OnDestroy {
    @HostBinding("class.hidden")
    public isHidden: boolean = true;

    @Output()
    public onOpen = new EventEmitter();

    @Output()
    public onClose = new EventEmitter();

    private eventListener;
    private isTriggerClick = true;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        this.eventListener = this.renderer.listen("document", "click", this.checkEventTarger.bind(this));
    }

    public open() {
        this.isHidden = false;
        this.isTriggerClick = true;
        this.onOpen.emit();
    }

    public close() {
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
