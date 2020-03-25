import { Component, NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

let NEXT_ID = 0;

@Component({
    selector: 'igx-action-strip',
    templateUrl: 'action-strip.component.html'
})

export class IgxActionStripComponent {
    @Input() hidden: boolean = false;

    public context;

    show(context) {
        this.hidden = false;
        this.context = context;
    }

    hide() {
        this.hidden = true;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxActionStripComponent],
    exports: [IgxActionStripComponent],
    imports: [CommonModule]
})
export class IgxActionStripModule { }