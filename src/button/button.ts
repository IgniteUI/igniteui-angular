import { Directive, Component, Input, Output, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'ig-button',
    moduleId: module.id, // commonJS standard
    templateUrl: 'button.html' 
})

export class Button {
    @ViewChild('igButton') _button: ElementRef;
}