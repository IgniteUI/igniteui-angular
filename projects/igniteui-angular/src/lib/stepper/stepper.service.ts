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
    public expand(step: IgxStepComponent, uiTrigger?: boolean): void {
        if (this.activeStep === step) {
            return;
        }

        //TODO: consider emitting cancelable events through API

        let argsCanceled = false;
        if (uiTrigger) {
            argsCanceled = this.emitActivatingEvent(step);
        }

        if (!argsCanceled) {
            this.collapsingSteps.delete(step);

            this.previousActiveStep = this.activeStep;
            this.activeStep = step;

            if (uiTrigger) {

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
            } else {
                this.collapsingSteps.delete(this.previousActiveStep);
                this.activeStep.cdr.detectChanges();
                this.previousActiveStep?.cdr.detectChanges();

                this.previousActiveStep?.activeChanged.emit(false);
                this.activeStep.activeChanged.emit(true);

                this.stepper.activeStepChanged.emit({ owner: this.stepper, activeStep: this.activeStep });
            }

        }

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
