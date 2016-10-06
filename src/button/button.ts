import { Directive, Component, Input, Output, ElementRef, ViewChild, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ig-button',
    moduleId: module.id, // commonJS standard
    templateUrl: 'button.html'
})
export class IgButton {
    @ViewChild('igButton') _button: ElementRef;

    @Input() type: string = "flat";
    @Input() disabled: boolean;

    get isDisabled() {
        return this.disabled !== undefined;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
    }
}

@NgModule({
    declarations: [IgButton],
    imports: [CommonModule],
    exports: [IgButton]
})
export class ButtonModule {

}