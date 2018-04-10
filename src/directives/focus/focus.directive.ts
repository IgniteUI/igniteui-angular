import { Directive, ElementRef, Input, NgModule } from "@angular/core";

@Directive({
    exportAs: "igxFocus",
    selector: "[igxFocus]"
})
export class IgxFocusDirective {

    private focusState = true;

    @Input("igxFocus")
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
    declarations: [IgxFocusDirective],
    exports: [IgxFocusDirective]
})
export class IgxFocusModule { }
