import { Directive, ElementRef, HostBinding, Input, inject } from '@angular/core';
import { IgxStep, IGX_STEP_COMPONENT } from './stepper.common';
import { IgxStepperService } from './stepper.service';

/**
 * Allows a custom element to be added as an active step indicator.
 */
@Directive({
    selector: '[igxStepActiveIndicator]',
    standalone: true
})
export class IgxStepActiveIndicatorDirective { }

/**
 * Allows a custom element to be added as a complete step indicator.
 */
@Directive({
    selector: '[igxStepCompletedIndicator]',
    standalone: true
})
export class IgxStepCompletedIndicatorDirective { }

/**
 * Allows a custom element to be added as an invalid step indicator.
 */
@Directive({
    selector: '[igxStepInvalidIndicator]',
    standalone: true
})
export class IgxStepInvalidIndicatorDirective { }

/**
 * Allows a custom element to be added as a step indicator.
 */
@Directive({
    selector: '[igxStepIndicator]',
    standalone: true
})
export class IgxStepIndicatorDirective { }

/**
 * Allows a custom element to be added as a step title.
 */
@Directive({
    selector: '[igxStepTitle]',
    standalone: true
})
export class IgxStepTitleDirective {
    @HostBinding('class.igx-stepper__step-title')
    public defaultClass = true;
}

/**
 * Allows a custom element to be added as a step subtitle.
 */
@Directive({
    selector: '[igxStepSubtitle]',
    standalone: true
})
export class IgxStepSubtitleDirective {
    @HostBinding('class.igx-stepper__step-subtitle')
    public defaultClass = true;
}

/**
 * Allows a custom element to be added as a step content.
 */
@Directive({
    selector: '[igxStepContent]',
    standalone: true
})
export class IgxStepContentDirective {
    private step = inject<IgxStep>(IGX_STEP_COMPONENT);
    private stepperService = inject(IgxStepperService);
    public elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

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
}
