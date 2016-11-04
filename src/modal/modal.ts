import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from "../button/button";
import { IgRippleModule } from "../directives/ripple";

@Component({
    selector: 'ig-modal',
    moduleId: module.id,
    templateUrl: 'modal.html'
})
export class Modal {    
    @Input() title: string = "";
    @Input() message: string = "";

    @Input() action1ButtonLabel: string = "";
    @Input() action1ButtonType: string = "";
    @Input() action1ButtonColor: string = "";
    @Input() action1ButtonBackgroundColor: string = "";
    @Input() action1ButtonRipple: string = ""

    @Input() action2ButtonLabel: string = "";
    @Input() action2ButtonType: string = "";
    @Input() action2ButtonColor: string = "";
    @Input() action2ButtonBackgroundColor: string = "";
    @Input() action2ButtonRipple: string = "";

    @Input() backgroundClick: boolean = false;

    @Output() onOpen = new EventEmitter();
    @Output() onClose = new EventEmitter();

    @Output() onAction1Select = new EventEmitter();
    @Output() onAction2Select = new EventEmitter();

    isOpen = false;
    modalClass = "ig-modal";

    @ViewChild('modal') modalEl: ElementRef;

    open() {
        if (this.isOpen) {
            return;
        }
        
        this.isOpen = true;
        this.onOpen.emit(this);
        this.modalEl.nativeElement.classList.add(this.modalClass);
    }

    close() {
        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;
        this.onClose.emit(this);
        this.modalEl.nativeElement.classList.remove(this.modalClass);
    }

    private onModalClicked(event) {
        if (this.isOpen && this.backgroundClick &&
            event.target.classList.contains(this.modalClass)) {
            this.close();
        }
    }

    private onInternalAction1Select(event) {
        this.onAction1Select.emit({ modal: this, event: event });
    }

    private onInternalAction2Select(event) {
        this.onAction2Select.emit({ modal: this, event: event });
    }
}

@NgModule({
    declarations: [Modal],
    exports: [Modal],
    imports: [CommonModule, ButtonModule, IgRippleModule]
})
export class ModalModule {}