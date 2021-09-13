import { Injectable } from '@angular/core';
import { IgxStepperOrienatation, IStepTogglingEventArgs } from './common';
import { IgxStepperComponent } from './igx-stepper.component';
import { IgxStepComponent } from './step/igx-step.component';

/** @hidden @internal */
@Injectable()
export class IgxStepperService {

    public activeStep: IgxStepComponent;
    public previousActiveStep: IgxStepComponent;

    public collapsingSteps: Set<IgxStepComponent> = new Set<IgxStepComponent>();
    public stepper: IgxStepperComponent;

    /**
     * Adds the step to the `expandedSteps` set and fires the steps change event
     *
     * @param step target step
     * @param uiTrigger is the event triggered by a ui interraction (so we know if we should animate)
     * @returns void
     */
    public expand(step: IgxStepComponent): void {
        if (this.activeStep === step) {
            return;
        }

        //TODO: consider emitting cancelable events through API

        const argsCanceled = this.emitActivatingEvent(step);

        if (!argsCanceled) {
            this.collapsingSteps.delete(step);

            this.previousActiveStep = this.activeStep;
            this.activeStep = step;
            this.activeStep.activeChange.emit(true);

            this.collapsingSteps.add(this.previousActiveStep);

            if (this.stepper.orientation === IgxStepperOrienatation.Vertical) {
                this.previousActiveStep.playCloseAnimation(
                    this.previousActiveStep.verticalContentContainer
                );
                this.activeStep.cdr.detectChanges();

                this.activeStep.playOpenAnimation(
                    this.activeStep.verticalContentContainer
                );
            } else {
                this.activeStep.cdr.detectChanges();
                this.stepper.dummy();
            }

        }
    }

    public expandThroughApi(step: IgxStepComponent) {
        if (this.activeStep === step) {
            return;
        }

        this.collapsingSteps.clear();

        this.previousActiveStep = this.activeStep;
        this.activeStep = step;

        // TODO: Should the user call detectChanges manually?
        this.activeStep.cdr.detectChanges();
        this.previousActiveStep?.cdr.detectChanges();

        this.activeStep.activeChange.emit(true);
        this.previousActiveStep?.activeChange.emit(false);

        // TODO: Should the activeStepChanged be emitted when activating node through API
        // this.stepper.activeStepChanged.emit({ owner: this.stepper, activeStep: this.activeStep });
    }

    public collapse(step: IgxStepComponent) {
        if (this.activeStep === step) {
            return;
        }
        step.activeChange.emit(false);
        this.collapsingSteps.delete(step);
    }

    public register(stepper: IgxStepperComponent) {
        this.stepper = stepper;
    }

    private emitActivatingEvent(step: IgxStepComponent): boolean {
        const args: IStepTogglingEventArgs = {
            owner: this.stepper,
            activeStep: step,
            previousActiveStep: this.activeStep,
            cancel: false
        };

        this.stepper.activeStepChanging.emit(args);
        return args.cancel;
    }
}
