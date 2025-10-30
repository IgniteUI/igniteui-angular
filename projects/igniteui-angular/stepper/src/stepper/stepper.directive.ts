import { Directive, ElementRef, HostBinding, Inject, Input } from '@angular/core';
import { IgxStep, IGX_STEP_COMPONENT } from './stepper.common';
import { IgxStepperService } from './stepper.service';

/**
 * Allows a custom element to be added as an active step indicator.
 *
 * @igxModule IgxStepperModule
 * @igxTheme igx-stepper-theme
 * @igxKeywords stepper 
 * @igxGroup Layouts
 *
 * @example
 * <igx-stepper>
 *     <ng-template igxStepActiveIndicator>
 *          <igx-icon>edit</igx-icon>
 *       </ng-template>
 * </igx-stepper>
 */
@Directive({
    selector: '[igxStepActiveIndicator]',
    standalone: true
})
export class IgxStepActiveIndicatorDirective { }

/**
 * Allows a custom element to be added as a complete step indicator.
 *
 * @igxModule IgxStepperModule
 * @igxTheme igx-stepper-theme
 * @igxKeywords stepper 
 * @igxGroup Layouts
 *
 * @example
 * <igx-stepper>
 *     <ng-template igxStepCompletedIndicator>
 *          <igx-icon>check</igx-icon>
 *       </ng-template>
 * </igx-stepper>
 */
@Directive({
    selector: '[igxStepCompletedIndicator]',
    standalone: true
})
export class IgxStepCompletedIndicatorDirective { }

/**
 * Allows a custom element to be added as an invalid step indicator.
 *
 * @igxModule IgxStepperModule
 * @igxTheme igx-stepper-theme
 * @igxKeywords stepper 
 * @igxGroup Layouts
 *
 * @example
 * <igx-stepper>
 *     <ng-template igxStepInvalidIndicator>
 *          <igx-icon>error</igx-icon>
 *       </ng-template>
 * </igx-stepper>
 */
@Directive({
    selector: '[igxStepInvalidIndicator]',
    standalone: true
})
export class IgxStepInvalidIndicatorDirective { }

/**
 * Allows a custom element to be added as a step indicator.
 *
 * @igxModule IgxStepperModule
 * @igxTheme igx-stepper-theme
 * @igxKeywords stepper 
 * @igxGroup Layouts
 *
 * @example
 * <igx-stepper>
 *     <igx-step>
 *         <igx-icon igxStepIndicator>home</igx-icon>
 *     </igx-step>
 * </igx-stepper>
 */
@Directive({
    selector: '[igxStepIndicator]',
    standalone: true
})
export class IgxStepIndicatorDirective { }

/**
 * Allows a custom element to be added as a step title.
 *
 * @igxModule IgxStepperModule
 * @igxTheme igx-stepper-theme
 * @igxKeywords stepper 
 * @igxGroup Layouts
 *
 * @example
 * <igx-stepper>
 *     <igx-step>
 *         <p igxStepTitle>Home</p>
 *     </igx-step>
 * </igx-stepper>
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
 *
 * @igxModule IgxStepperModule
 * @igxTheme igx-stepper-theme
 * @igxKeywords stepper 
 * @igxGroup Layouts
 *
 * @example
 * <igx-stepper>
 *     <igx-step>
 *         <p igxStepSubtitle>Home Subtitle</p>
 *     </igx-step>
 * </igx-stepper>
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
 *
 * @igxModule IgxStepperModule
 * @igxTheme igx-stepper-theme
 * @igxKeywords stepper 
 * @igxGroup Layouts
 *
 * @example
 * <igx-stepper>
 *     <igx-step>
 *         <div igxStepContent>...</div>
 *     </igx-step>
 * </igx-stepper>
 */
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
