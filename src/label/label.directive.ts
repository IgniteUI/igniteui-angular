import {
    Directive,
    Input,
    ElementRef,
    Renderer2,
    NgModule
} from '@angular/core';

@Directive({
    selector: '[igxLabel]'
})
export class IgxLabel {
    constructor(el: ElementRef, renderer: Renderer2){
        renderer.addClass(el.nativeElement, 'igx-form-group__label');
    }
}

@NgModule({
    declarations: [IgxLabel],
    exports: [IgxLabel]
})
export class IgxLabelModule {}
