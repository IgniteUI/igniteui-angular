import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'modal',
    moduleId: module.id,
    templateUrl: 'modal.html',
    styles: [`
        .modalDialog {
            position: fixed;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            background: rgba(0,0,0,.65);
            z-index: 9999;
            opacity: 1;
            transition: all 400ms ease-in;
        }
        .modal-inner {
            width: 400px;
            position: relative;
            margin: 10% auto;
            padding: 5px 25px 10px 10px;
            background: #fff;
        }
    `]
})
export class Modal {

    @Input() closeOnClick = true;

    @Output()
    onOpen = new EventEmitter();

    @Output()
    onClose = new EventEmitter();

    isOpen = false;

    @ViewChild('modal') modalEl: ElementRef;
    protected behindElement: HTMLElement;

    open() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        this.onOpen.emit(this);
        this.modalEl.nativeElement.classList.add('modalDialog');
    }

    close() {
        if (!this.isOpen) {
            return;
        }
        this.isOpen = false;
        this.onClose.emit(this);
        this.modalEl.nativeElement.classList.remove('modalDialog');
    }

}

@NgModule({
    declarations: [Modal],
    exports: [Modal],
    imports: [CommonModule]
})
export class ModalModule {}