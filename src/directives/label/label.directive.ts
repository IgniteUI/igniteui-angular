import {
    Directive,
    ElementRef,
    Input,
    NgModule,
    Renderer2
} from "@angular/core";

@Directive({
    selector: "[igxLabel]"
})
export class IgxLabelDirective {
    constructor(el: ElementRef, renderer: Renderer2) {
        renderer.addClass(el.nativeElement, "igx-form-group__label");
    }
}

@NgModule({
    declarations: [IgxLabelDirective],
    exports: [IgxLabelDirective]
})
export class IgxLabelModule {}
