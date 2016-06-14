import { Directive, Component } from '@angular/core';

@Component({
    selector: 'ig-button',
    template: `<span class="ig-button-wrapper"><ng-content></ng-content></span>`
})

export class Button {
}