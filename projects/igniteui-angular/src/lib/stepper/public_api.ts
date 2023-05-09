import { IgxStepComponent } from './step/step.component';
import { IgxStepperComponent } from './stepper.component';
import { IgxStepActiveIndicatorDirective, IgxStepCompletedIndicatorDirective, IgxStepContentDirective, IgxStepIndicatorDirective, IgxStepInvalidIndicatorDirective, IgxStepSubTitleDirective, IgxStepTitleDirective } from './stepper.directive';

export * from './stepper.component';
export * from './step/step.component';
export {
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
    IgxStepSubTitleDirective,
    IgxStepIndicatorDirective,
    IgxStepContentDirective,
    IgxStepActiveIndicatorDirective,
    IgxStepCompletedIndicatorDirective,
    IgxStepInvalidIndicatorDirective
] as const;
