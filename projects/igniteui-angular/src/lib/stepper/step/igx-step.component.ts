import { Component, ContentChild, Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { IgxStepperProgressLine } from '../common';

let NEXT_ID = 0;

@Directive({
    selector: '[igxStepIcon]'
})
export class IgxStepIconDirective {
}

@Directive({
    selector: '[igxStepLabel]'
})
export class IgxStepLabelDirective {
    @HostBinding('class.igx-step-label')
    public cssClass = 'igx-step-label';
}


@Component({
    selector: 'igx-step',
    templateUrl: 'igx-step.component.html'
})
export class IgxStepComponent {
    @HostBinding('class.igx-step')
    public cssClass = 'igx-step';

    @Input()
    public id = NEXT_ID++;

    @Input()
    public skip = false;

    @Input()
    @HostBinding('class.igx-step--disabled')
    public disabled = false;

    @Input()
    @HostBinding('class.igx-step--active')
    public get active() {
        return this._active;
    }

    public set active(value: boolean) {
        if (this._active !== value) {
            this._active = value;
            this.activeChanged.emit(this._active);
        }
    }

    @Input()
    public optional = false;

    @Input()
    @HostBinding('class.igx-step--complete')
    public complete = false;

    @Input()
    public isValid = true;

    @Input()
    public completedStyle = IgxStepperProgressLine.Solid;

    @ContentChild(IgxStepIconDirective)
    public icon: IgxStepIconDirective;

    @ContentChild(IgxStepLabelDirective)
    public label: IgxStepLabelDirective;

    @Output()
    public activeChanged = new EventEmitter<boolean>();

    /** @hidden @internal */
    public isLabelVisible = true;
    /** @hidden @internal */
    public isIndicatorVisible = true;
    /** @hidden @internal */
    public labelClass = '';

    private _active = false;

    private get inactive() {
        return this.skip || this.disabled;
    }

    @HostListener('click')
    public onClick() {
        if (this.inactive) {
            return;
        }
        this.active = true;
    }

    public toggleActive(id: number) {
        if (this.inactive) {
            return;
        }

        this.active = id === this.id;
    }
}
