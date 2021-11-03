import { Directive, ElementRef, HostBinding, Inject, Input } from '@angular/core';
import { IGX_STEP_COMPONENT } from './stepper.common';
import { IgxStepComponent } from './step/step.component';
import { IgxStepperService } from './stepper.service';

@Directive({
    selector: '[igxStepActiveIndicator]'
})
export class IgxStepActiveIndicatorDirective { }

@Directive({
    selector: '[igxStepCompletedIndicator]'
})
export class IgxStepCompletedIndicatorDirective { }

@Directive({
    selector: '[igxStepInvalidIndicator]'
})
export class IgxStepInvalidIndicatorDirective { }

@Directive({
    selector: '[igxStepIndicator]'
})
export class IgxStepIndicatorDirective { }

@Directive({
    selector: '[igxStepTitle]'
})
export class IgxStepTitleDirective {
    @HostBinding('class.igx-stepper__step-title')
    public defaultClass = true;
}

@Directive({
    selector: '[igxStepSubTitle]'
})
export class IgxStepSubTitleDirective {
    @HostBinding('class.igx-stepper__step-subtitle')
    public defaultClass = true;
}

@Directive({
    selector: '[igxStepContent]'
})
export class IgxStepContentDirective {
    private get target(): IgxStepComponent {
        return this.step;
    }

    @HostBinding('class.igx-stepper__step-content')
    public defaultClass = true;

    @HostBinding('attr.role')
    public role = 'tabpanel';

    @HostBinding('attr.aria-labelledby')
    public get stepId(): string {
        return this.target.id;
    }

    @HostBinding('attr.id')
    @Input()
    public id = this.target.id.replace('step', 'content');

    @HostBinding('attr.tabindex')
    @Input()
    public get tabIndex(): number {
        if (this._tabIndex !== null) {
            return this._tabIndex;
        }

        return this.stepperService.activeStep === this.target ? 0 : -1;
    }

    public set tabIndex(val: number) {
        this._tabIndex = val;
    }

    private _tabIndex = null;

    constructor(@Inject(IGX_STEP_COMPONENT) private step: IgxStepComponent,
        private stepperService: IgxStepperService,
        public elementRef: ElementRef) {
    }
}
