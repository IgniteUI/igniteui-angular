import { IgxStepComponent } from './step/step.component';
import { IgxStepperComponent } from './stepper.component';
import { IgxStepActiveIndicatorDirective, IgxStepCompletedIndicatorDirective, IgxStepContentDirective, IgxStepIndicatorDirective, IgxStepInvalidIndicatorDirective, IgxStepSubtitleDirective, IgxStepTitleDirective } from './stepper.directive';

export * from './stepper.component';
export * from './step/step.component';
export {
    HorizontalAnimationType,
    IStepChangingEventArgs,
    IStepChangedEventArgs,
    IgxStepperOrientation,
    IgxStepType,
    IgxStepperTitlePosition,
    VerticalAnimationType
} from './stepper.common';
export * from './stepper.directive';

/* NOTE: Stepper directives collection for ease-of-use import in standalone components scenario */
export const IGX_STEPPER_DIRECTIVES = [
    IgxStepComponent,
    IgxStepperComponent,
    IgxStepTitleDirective,
    IgxStepSubtitleDirective,
    IgxStepIndicatorDirective,
    IgxStepContentDirective,
    IgxStepActiveIndicatorDirective,
    IgxStepCompletedIndicatorDirective,
    IgxStepInvalidIndicatorDirective
] as const;
