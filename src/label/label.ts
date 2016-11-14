import {
    Directive,
    Input,
    ElementRef,
    Renderer,
    NgModule
} from '@angular/core';

@Directive({
    selector: '[igLabel]'
})
export class Label {
    constructor(el: ElementRef, renderer: Renderer){
        renderer.setElementClass(el.nativeElement, 'ig-form-group__label', true);
    }
}

@NgModule({
    declarations: [Label],
    exports: [Label]
})
export class LabelModule {}