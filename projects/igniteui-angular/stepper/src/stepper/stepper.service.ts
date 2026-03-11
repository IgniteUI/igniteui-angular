import { Injectable } from '@angular/core';
import { IgxStepper, IgxStepperOrientation, IStepChangingEventArgs } from './stepper.common';
import { IgxStepComponent } from './step/step.component';

/** @hidden @internal */
@Injectable()
export class IgxStepperService {
    public activeStep: IgxStepComponent;
    public previousActiveStep: IgxStepComponent;
    public focusedStep: IgxStepComponent;

    public collapsingSteps: Set<IgxStepComponent> = new Set<IgxStepComponent>();
    public linearDisabledSteps: Set<IgxStepComponent> = new Set<IgxStepComponent>();
    public visitedSteps: Set<IgxStepComponent> = new Set<IgxStepComponent>();
    public stepper: IgxStepper;

    /**
     * Activates the step, fires the steps change event and plays animations.
     */
    public expand(step: IgxStepComponent): void {
        if (this.activeStep === step) {
            return;
        }

        const cancel = this.emitActivatingEvent(step);
        if (cancel) {
            return;
        }

        this.collapsingSteps.delete(step);

        this.previousActiveStep = this.activeStep;
        this.activeStep = step;
        this.activeStep.activeChange.emit(true);

        this.collapsingSteps.add(this.previousActiveStep);
        this.visitedSteps.add(this.activeStep);

        if (this.stepper.orientation === IgxStepperOrientation.Vertical) {
            this.previousActiveStep.playCloseAnimation(
                this.previousActiveStep.contentContainer
            );
            this.activeStep.cdr.detectChanges();

            this.activeStep.playOpenAnimation(
                this.activeStep.contentContainer
            );
        } else {
            this.activeStep.cdr.detectChanges();
            this.stepper.playHorizontalAnimations();
        }
    }

    /**
     * Activates the step and fires the steps change event without playing animations.
     */
    public expandThroughApi(step: IgxStepComponent): void {
        if (this.activeStep === step) {
            return;
        }

        this.collapsingSteps.clear();

        this.previousActiveStep = this.activeStep;
        this.activeStep = step;

        if (this.previousActiveStep) {
            this.previousActiveStep.tabIndex = -1;
        }
        this.activeStep.tabIndex = 0;
        this.visitedSteps.add(this.activeStep);

        this.activeStep.cdr.markForCheck();
        this.previousActiveStep?.cdr.markForCheck();

        this.activeStep.activeChange.emit(true);
        this.previousActiveStep?.activeChange.emit(false);
    }

    /**
     * Collapses the currently active step and fires the change event.
     */
    public collapse(step: IgxStepComponent): void {
        if (this.activeStep === step) {
            return;
        }
        step.activeChange.emit(false);
        this.collapsingSteps.delete(step);
    }

    /**
     * Determines the steps that should be marked as visited based on the active step.
     */
    public calculateVisitedSteps(): void {
        this.stepper.steps.forEach(step => {
            if (step.index <= this.activeStep.index) {
                this.visitedSteps.add(step);
            } else {
                this.visitedSteps.delete(step);
            }
        });
    }

    /**
     * Determines the steps that should be disabled in linear mode based on the validity of the active step.
     */
    public calculateLinearDisabledSteps(): void {
        if (!this.activeStep) {
            return;
        }

        if (this.activeStep.isValid) {
            const firstRequiredIndex = this.getNextRequiredStep();
            if (firstRequiredIndex !== -1) {
                this.updateLinearDisabledSteps(firstRequiredIndex);
            } else {
                this.linearDisabledSteps.clear();
            }
        } else {
            this.stepper.steps.forEach(s => {
                if (s.index > this.activeStep.index) {
                    this.linearDisabledSteps.add(s);
                }
            });
        }
    }

    public emitActivatingEvent(step: IgxStepComponent): boolean {
        const args: IStepChangingEventArgs = {
            owner: this.stepper,
            newIndex: step.index,
            oldIndex: this.activeStep.index,
            cancel: false
        };

        this.stepper.activeStepChanging.emit(args);
        return args.cancel;
    }

    /**
     * Updates the linearDisabled steps from the current active step to the next required invalid step.
     *
     * @param toIndex the index of the last step that should be enabled.
     */
    private updateLinearDisabledSteps(toIndex: number): void {
        this.stepper.steps.forEach(s => {
            if (s.index > this.activeStep.index) {
                if (s.index <= toIndex) {
                    this.linearDisabledSteps.delete(s);
                } else {
                    this.linearDisabledSteps.add(s);
                }
            }
        });
    }

    private getNextRequiredStep(): number {
        if (!this.activeStep) {
            return;
        }
        return this.stepper.steps.findIndex(s => s.index > this.activeStep.index && !s.optional && !s.disabled && !s.isValid);
    }
}
