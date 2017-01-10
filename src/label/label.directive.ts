import {
    Directive,
    Input,
    ElementRef,
    Renderer,
    NgModule
} from '@angular/core';

@Directive({
    selector: '[igxLabel]'
})
export class IgxLabel {
    constructor(el: ElementRef, renderer: Renderer){
        renderer.setElementClass(el.nativeElement, 'igx-form-group__label', true);
    }
}

@NgModule({
    declarations: [IgxLabel],
    exports: [IgxLabel]
})
export class IgxLabelModule {}