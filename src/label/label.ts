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
        renderer.setElementClass(el, 'ig-form-label', false)
    }
}

/** Export as module */
@NgModule({
    exports: [Label]
})

export class IgLabelModule {
}