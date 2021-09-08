import { Injectable } from '@angular/core';
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
        this.collapsingSteps.delete(step);

        if (this.activeStep === step) {
            return;
        }
        step.expandedChange.emit(true);
        this.previousActiveStep = this.activeStep;
        this.activeStep = step;
        if (uiTrigger) {
            this.previousActiveStep?.collapse();
        } else {
            if (this.previousActiveStep) {
                this.previousActiveStep.active = false;
            }
        }
    }

    /**
     * Adds a step to the `collapsing` collection
     *
     * @param step target step
     */
    public collapsing(step: IgxStepComponent): void {
        this.collapsingSteps.add(step);
    }

    /**
     * Removes the step from the 'expandedSteps' set and emits the step's change event
     *
     * @param step target step
     * @returns void
     */
    public collapse(step: IgxStepComponent): void {
        this.collapsingSteps.delete(step);
        if (this.activeStep === step) {
            step.expandedChange.emit(false);
            this.previousActiveStep = step;
            this.activeStep = null;
        }
    }

    public register(stepper: IgxStepperComponent) {
        this.stepper = stepper;
    }
}
