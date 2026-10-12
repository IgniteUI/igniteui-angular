import { Injectable, signal } from '@angular/core';
import { IgxStepper, IgxStepperOrientation, IStepChangingEventArgs } from './stepper.common';
import { IgxStepComponent } from './step/step.component';

/**
 * A `Set` whose membership reads are tracked by signals, so that the bindings reading it are refreshed
 * when it is changed after they were checked, e.g. by the stepper in `ngAfterContentInit`.
 */
class TrackedSet<T> extends Set<T> {
    private readonly version = signal(0);

    public override has(value: T): boolean {
        this.version();
        return super.has(value);
    }

    public override add(value: T): this {
        if (!super.has(value)) {
            super.add(value);
            this.version.update(v => v + 1);
        }
        return this;
    }

    public override delete(value: T): boolean {
        const deleted = super.delete(value);
        if (deleted) {
            this.version.update(v => v + 1);
        }
        return deleted;
    }

    public override clear(): void {
        if (this.size) {
            super.clear();
            this.version.update(v => v + 1);
        }
    }
}

/** @hidden @internal */
@Injectable()
export class IgxStepperService {
    public previousActiveStep!: IgxStepComponent;

    public collapsingSteps: Set<IgxStepComponent> = new TrackedSet<IgxStepComponent>();
    public linearDisabledSteps: Set<IgxStepComponent> = new TrackedSet<IgxStepComponent>();
    public visitedSteps: Set<IgxStepComponent> = new TrackedSet<IgxStepComponent>();
    public stepper!: IgxStepper;

    /**
     * Signal-backed so that the bindings reading the active state (e.g. `aria-selected`) are refreshed
     * when it is changed after they were checked, e.g. by the stepper in `ngAfterContentInit`.
     */
    private readonly _activeStep = signal<IgxStepComponent>(undefined!);

    public get activeStep(): IgxStepComponent {
        return this._activeStep();
    }

    public set activeStep(value: IgxStepComponent) {
        this._activeStep.set(value);
    }

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
        this.setActiveStep(step);
        this.activeStep.activeChange.emit(true);
        this.collapsingSteps.add(this.previousActiveStep);

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

        this.collapsingSteps.delete(step);
        this.collapseAll();
        this.setActiveStep(step);

        this.activeStep.cdr.markForCheck();
        this.previousActiveStep?.cdr.markForCheck();

        this.activeStep.activeChange.emit(true);
        this.previousActiveStep?.activeChange.emit(false);
    }

    /**
     * Collapses a step that is no longer active and fires its change event.
     */
    public collapse(step: IgxStepComponent): void {
        if (this.activeStep === step || !this.collapsingSteps.has(step)) {
            return;
        }
        step.activeChange.emit(false);
        this.collapsingSteps.delete(step);
    }

    /**
     * Collapses all steps whose collapse animation has not finished yet.
     */
    public collapseAll(): void {
        this.collapsingSteps.forEach(step => this.collapse(step));
    }

    /**
     * Removes the steps that are no longer in the stepper from its state.
     */
    public removeDetachedSteps(): void {
        const steps = new Set(this.stepper.steps);
        for (const stepsSet of [this.collapsingSteps, this.linearDisabledSteps, this.visitedSteps]) {
            stepsSet.forEach(step => {
                if (!steps.has(step)) {
                    stepsSet.delete(step);
                }
            });
        }
        if (this.activeStep && !steps.has(this.activeStep)) {
            this.activeStep = undefined!;
        }
        if (this.previousActiveStep && !steps.has(this.previousActiveStep)) {
            this.previousActiveStep = undefined!;
        }
    }

    /**
     * Determines the steps that should be marked as visited based on the active step.
     */
    public calculateVisitedSteps(): void {
        const activeIndex = this.activeStep?.index ?? -1;
        this.stepper.steps.forEach(step => {
            if (step.index <= activeIndex) {
                this.visitedSteps.add(step);
            } else {
                this.visitedSteps.delete(step);
            }
        });
    }

    /**
     * Determines the steps that should be disabled in linear mode, i.e. the steps after the first step
     * starting from the active one which should be valid before moving forward.
     */
    public calculateLinearDisabledSteps(): void {
        if (!this.activeStep) {
            // there is nothing to move forward from, so no step is disabled
            this.linearDisabledSteps.clear();
            return;
        }

        const activeIndex = this.activeStep.index;
        const blockingStep = this.stepper.steps.find(s => s.index >= activeIndex && !s.optional && !s.disabled && !s.isValid);
        this.stepper.steps.forEach(s => {
            if (blockingStep && s.index > blockingStep.index) {
                this.linearDisabledSteps.add(s);
            } else {
                this.linearDisabledSteps.delete(s);
            }
        });
    }

    public emitActivatingEvent(step: IgxStepComponent): boolean {
        const args: IStepChangingEventArgs = {
            owner: this.stepper,
            newIndex: step.index,
            oldIndex: this.activeStep?.index ?? -1,
            cancel: false
        };

        this.stepper.activeStepChanging.emit(args);
        return args.cancel;
    }

    private setActiveStep(step: IgxStepComponent): void {
        this.previousActiveStep = this.activeStep;
        this.activeStep = step;

        if (this.previousActiveStep) {
            this.previousActiveStep.tabIndex = -1;
        }
        this.activeStep.tabIndex = 0;
        this.visitedSteps.add(this.activeStep);

        if (this.stepper.linear) {
            this.calculateLinearDisabledSteps();
        }
    }
}
