import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from "../button/button.directive";
import { IgxRippleModule } from "../directives/ripple.directive";

@Component({
    selector: 'igx-dialog',
    moduleId: module.id,
    templateUrl: 'dialog-content.component.html'
})
export class IgxDialog {
    private static readonly DIALOG_CLASS = "igx-dialog";
    private _isOpen = false;

    @Input()
    get isOpen() {
        return  this._isOpen;
    }

    @Input() title: string = "";
    @Input() message: string = "";

    @Input() leftButtonLabel: string = "";
    @Input() leftButtonType: string = "flat";
    @Input() leftButtonColor: string = "";
    @Input() leftButtonBackgroundColor: string = "";
    @Input() leftButtonRipple: string = ""

    @Input() rightButtonLabel: string = "";
    @Input() rightButtonType: string = "flat";
    @Input() rightButtonColor: string = "";
    @Input() rightButtonBackgroundColor: string = "";
    @Input() rightButtonRipple: string = "";

    @Input() closeOnOutsideSelect: boolean = false;

    @Output() onOpen = new EventEmitter();
    @Output() onClose = new EventEmitter();

    @Output() onLeftButtonSelect = new EventEmitter();
    @Output() onRightButtonSelect = new EventEmitter();    

    @ViewChild('dialog') dialogEl: ElementRef;

    open() {
        if (this.isOpen) {
            return;
        }
        
        this._isOpen = true;
        this.onOpen.emit(this);
    }

    close() {
        if (!this.isOpen) {
            return;
        }

        this._isOpen = false;
        this.onClose.emit(this);
    }

    private onDialogSelected(event) {
        if (this.isOpen && this.closeOnOutsideSelect &&
            event.target.classList.contains(IgxDialog.DIALOG_CLASS)) {
            this.close();
        }
    }

    private onInternalLeftButtonSelect(event) {
        this.onLeftButtonSelect.emit({ dialog: this, event: event });
    }

    private onInternalRightButtonSelect(event) {
        this.onRightButtonSelect.emit({ dialog: this, event: event });
    }
}

@NgModule({
    declarations: [IgxDialog],
    exports: [IgxDialog],
    imports: [CommonModule, IgxButtonModule, IgxRippleModule]
})
export class IgxDialogModule {}