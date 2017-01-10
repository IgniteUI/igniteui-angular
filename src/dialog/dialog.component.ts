import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, NgModule, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from "../button/button.directive";
import { IgxRippleModule } from "../directives/ripple.directive";

@Component({
    selector: 'igx-dialog',
    moduleId: module.id,
    templateUrl: 'dialog-content.component.html',
    animations: [
        trigger('flyInOut', [
            state('open', style({
                transform: 'translate(-50%, -50%)'
            })),
            transition('void => open', animate('.2s ease-out')),
            transition('open => void', [
                animate('.2s ease-in', style({
                    transform: 'translate(-50%, -100%)'
                }))
            ])
        ]),
        trigger('fadeInOut', [
            state('open', style({
                opacity: 1
            })),
            transition('void <=> open', animate('.2s ease-in-out'))
        ])
    ]
})
export class IgxDialog {
    private static NEXT_ID: number = 1;
    private static readonly DIALOG_CLASS = "igx-dialog";
    private _isOpen = false;
    private _titleId: string;
    private state: string;

    @Input()
    get isOpen() {
        return this._isOpen;
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

    @Input()
    get role() {
        if (this.leftButtonLabel != "" && this.rightButtonLabel != "") {
            return  "dialog";
        } else if (this.leftButtonLabel != "" || this.rightButtonLabel != "") {
            return  "alertdialog";
        } else {
            return "alert";
        }
    }

    @Input()
    get titleId() {
        return this._titleId;
    }

    @Output() onOpen = new EventEmitter();
    @Output() onClose = new EventEmitter();

    @Output() onLeftButtonSelect = new EventEmitter();
    @Output() onRightButtonSelect = new EventEmitter();    

    @ViewChild('dialog') dialogEl: ElementRef;

    constructor() {
        this._titleId = IgxDialog.NEXT_ID++ + "_title";
    }

    open() {
        if (this.isOpen) {
            return;
        }
        
        this.toggleState('open');
        this.onOpen.emit(this);
    }

    close() {
        if (!this.isOpen) {
            return;
        }

        this.toggleState(null);
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

    private toggleState(state: string): void {
        this.state = state;
        this._isOpen = state == 'open' ?  true : false;
    }
}

@NgModule({
    declarations: [IgxDialog],
    exports: [IgxDialog],
    imports: [CommonModule, IgxButtonModule, IgxRippleModule]
})
export class IgxDialogModule {}