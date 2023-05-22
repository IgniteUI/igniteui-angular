import { Directive, ElementRef, HostBinding, Inject, Input } from '@angular/core';
import { IgxStep, IGX_STEP_COMPONENT } from './stepper.common';
import { IgxStepperService } from './stepper.service';

@Directive({
    selector: '[igxStepActiveIndicator]',
    standalone: true
})
export class IgxStepActiveIndicatorDirective { }

@Directive({
    selector: '[igxStepCompletedIndicator]',
    standalone: true
})
export class IgxStepCompletedIndicatorDirective { }

@Directive({
    selector: '[igxStepInvalidIndicator]',
    standalone: true
})
export class IgxStepInvalidIndicatorDirective { }

@Directive({
    selector: '[igxStepIndicator]',
    standalone: true
})
export class IgxStepIndicatorDirective { }

@Directive({
    selector: '[igxStepTitle]',
    standalone: true
})
export class IgxStepTitleDirective {
    @HostBinding('class.igx-stepper__step-title')
    public defaultClass = true;
}

@Directive({
    selector: '[igxStepSubTitle]',
    standalone: true
})
export class IgxStepSubTitleDirective {
    @HostBinding('class.igx-stepper__step-subtitle')
    public defaultClass = true;
}

@Directive({
    selector: '[igxStepContent]',
    standalone: true
})
export class IgxStepContentDirective {
    private get target(): IgxStep {
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

    constructor(
        @Inject(IGX_STEP_COMPONENT) private step: IgxStep,
        private stepperService: IgxStepperService,
        public elementRef: ElementRef<HTMLElement>
    ) { }
}
