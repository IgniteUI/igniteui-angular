import { Component, ContentChild, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IBaseEventArgs, mkenum } from '../../core/utils';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxLabelDirective } from '../../input-group/public_api';

let NEXT_ID = 0;

@Component({
    selector: 'igx-step',
    templateUrl: 'igx-step.component.html'
})
export class IgxStepComponent {
    @Input()
    public id = NEXT_ID++;

    @Input()
    public skip: boolean;

    @Input()
    public interactable = true;

    @ContentChild(IgxIconComponent)
    public icon: IgxIconComponent;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    @Output()
    public activated = new EventEmitter<IBaseEventArgs>();

    public active: boolean;

    private get inactive() {
        return this.skip || !this.interactable;
    }

    @HostListener('click')
    public onClick() {
        if (this.inactive) {
            return;
        }

        this.activated.emit({ owner: this });
    }

    public toggleActive(id: number) {
        if (this.inactive) {
            return;
        }

        this.active = id === this.id;
    }
}
