import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ig-modal',
    moduleId: module.id,
    templateUrl: 'modal.html'
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
        this.modalEl.nativeElement.classList.add('ig-modal');
    }

    close() {
        if (!this.isOpen) {
            return;
        }
        this.isOpen = false;
        this.onClose.emit(this);
        this.modalEl.nativeElement.classList.remove('ig-modal');
    }

}

@NgModule({
    declarations: [Modal],
    exports: [Modal],
    imports: [CommonModule]
})
export class ModalModule {}