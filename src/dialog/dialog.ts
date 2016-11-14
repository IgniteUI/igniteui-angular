import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from "../button/button";
import { IgRippleModule } from "../directives/ripple";

@Component({
    selector: 'igx-dialog',
    moduleId: module.id,
    templateUrl: 'dialog.html'
})
export class Dialog {
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
        this.dialogEl.nativeElement.classList.add(Dialog.DIALOG_CLASS);
    }

    close() {
        if (!this.isOpen) {
            return;
        }

        this._isOpen = false;
        this.onClose.emit(this);
        this.dialogEl.nativeElement.classList.remove(Dialog.DIALOG_CLASS);
    }

    private onDialogSelected(event) {
        if (this.isOpen && this.closeOnOutsideSelect &&
            event.target.classList.contains(Dialog.DIALOG_CLASS)) {
            this.close();
        }
    }

    private onInternalLeftButtonSelect(event) {
        this.onLeftButtonSelect.emit({ dialog: this, event: event });
    }

    private onInternalRightButtonSelect(event) {
        this.onLeftButtonSelect.emit({ dialog: this, event: event });
    }
}

@NgModule({
    declarations: [Dialog],
    exports: [Dialog],
    imports: [CommonModule, ButtonModule, IgRippleModule]
})
export class DialogModule {}