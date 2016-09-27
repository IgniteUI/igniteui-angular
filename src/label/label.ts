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
        console.log(el.nativeElement);
        renderer.setElementClass(el.nativeElement, 'ig-form-group__label', true);
    }
}

// /** Export as module */
// @NgModule({
//     declarations: [Label],
//     exports: [Label]
// })

// export class IgLabelModule {
// }