import { Directive, ElementRef, Input, NgModule } from "@angular/core";

@Directive({
    exportAs: "igxFocus",
    selector: "[igxAutoFocus]"
})
export class IgxAutoFocusDirective {

    private focusState = true;

    @Input("igxAutoFocus")
    get focused(): boolean {
        return this.focusState;
    }

    set focused(val: boolean) {
        this.focusState = val;
        this.trigger();
    }

    get nativeElement() {
        return this.element.nativeElement;
    }

    constructor(private element: ElementRef) { }

    trigger() {
        if (this.focusState) {
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }
}

@NgModule({
    declarations: [IgxAutoFocusDirective],
    exports: [IgxAutoFocusDirective]
})
export class IgxAutoFocusModule { }
