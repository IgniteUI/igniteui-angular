import { CommonModule } from '@angular/common';
import {
    AfterContentInit, Component, ContentChildren, EventEmitter,
    HostBinding, Input, NgModule, OnDestroy, Output, QueryList
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IgxStepperLabelPosition, IgxStepperOrienatation,
    IgxStepType, IGX_STEPPER_COMPONENT, IStepperCancelableEventArgs, IStepperEventArgs
} from './common';
import {
    IgxStepValidIconDirective, IgxStepInvalidIconDirective,
    IgxStepIconDirective, IgxStepLabelDirective
} from './igx-stepper.directive';
import { IgxStepComponent } from './step/igx-step.component';

let NEXT_ID = 0;

@Component({
    selector: 'igx-stepper',
    templateUrl: 'igx-stepper.component.html',
    providers: [
        { provide: IGX_STEPPER_COMPONENT, useExisting: IgxStepperComponent },
    ]
})
export class IgxStepperComponent implements AfterContentInit, OnDestroy {
    /**
     * Get/Set the `id` of the stepper component.
     * Default value is `"igx-stepper-0"`;
     * ```html
     * <igx-stepper id="my-first-stepper"></igx-stepper>
     * ```
     * ```typescript
     * const stepperId = this.stepper.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-stepper-${NEXT_ID++}`;

    /** @hidden @internal **/
    @HostBinding('class.igx-stepper')
    public cssClass = 'igx-stepper';

    /**
     * Get all steps.
     *
     * ```typescript
     * const steps: IgxStepComponent[] = this.stepper.steps;
     * ```
     */
    @Input()
    public get steps(): IgxStepComponent[] {
        return this._steps?.toArray();
    }

    /**
     * Get/Set the stepper orientation.
     *
     * ```typescript
     * this.stepper.orientation = IgxStepperOrienatation.Vertical;
     * ```
     */
    @Input()
    public get orientation(): IgxStepperOrienatation {
        return this._orientation;
    }

    public set orientation(value: IgxStepperOrienatation) {
        if (this._orientation !== value) {
            this._orientation = value;
            this._steps?.forEach(step => {
                step.isHorizontal = (this._orientation === IgxStepperOrienatation.Horizontal);
            });
        }
    }

    /**
     * Get/Set the type of the steps.
     *
     * ```typescript
     * this.stepper.stepType = IgxStepType.Indicator;
     * ```
     */
    @Input()
    public get stepType(): IgxStepType {
        return this._stepType;
    }

    public set stepType(value: IgxStepType) {
        if (value !== this._stepType) {
            this._stepType = value;
            this._steps?.forEach(step => {
                step.isLabelVisible = !(this._stepType === IgxStepType.Indicator);
                step.isIndicatorVisible = !(this._stepType === IgxStepType.Label);
            });
        }
    }

    /**
     * Get/Set the position of the steps label.
     *
     * ```typescript
     * this.stepper.labelPosition = IgxStepperLabelPosition.Top;
     * ```
     */
    @Input()
    public get labelPosition(): IgxStepperLabelPosition {
        return this._labelPosition;
    }

    public set labelPosition(value: IgxStepperLabelPosition) {
        if (value !== this._labelPosition) {
            this._labelPosition = value;
            this._steps?.forEach(step => step.label.position = this.labelPosition);
        }
    }

    /**
     * Get/Set whether the stepper is linear.
     * Only if the active step is valid the user is able to move forward.
     *
     * ```html
     * <igx-stepper [linear]="true"></igx-stepper>
     * ```
     */
    @Input()
    public linear = false;

    /**
     * Get/Set the animation settings.
     *
     * ```html
     * <igx-stepper [animationSettings]="customAnimationSettings"></igx-stepper>
     * ```
     */
    @Input()
    public get animationSettings() {
        return this._animationSettings;
    }

    public set animationSettings(value: any) {
        this._animationSettings = value;
    }

    /**
     * Emitted when the stepper's active step is changing.
     *
     *```html
     * <igx-stepper (activeStepChanging)="handleActiveStepChanging($event)">
     * </igx-stepper>
     * ```
     *
     *```typescript
     * public handleActiveStepChanging(event: IStepperCancelableEventArgs) {
     *  if (event.newIndex < event.oldIndex) {
     *      event.cancel = true;
     *  }
     * }
     *```
     */
    @Output()
    public activeStepChanging = new EventEmitter<IStepperCancelableEventArgs>();

    /**
     * Emitted when the active step is changed.
     *
     * @example
     * ```
     * <igx-stepper (activeStepChanged)="handleActiveStepChanged($event)"></igx-stepper>
     * ```
     */
    @Output()
    public activeStepChanged = new EventEmitter<IStepperEventArgs>();

    @ContentChildren(IgxStepComponent)
    private _steps: QueryList<IgxStepComponent>;

    /** @hidden @internal */
    public _activeStep: IgxStepComponent = null;

    private _orientation = IgxStepperOrienatation.Horizontal;
    private _stepType = IgxStepType.Full;
    private _labelPosition = IgxStepperLabelPosition.Bottom;
    private _animationSettings;
    private destroy$ = new Subject();

    /** @hidden @internal */
    public ngAfterContentInit() {
        this.steps?.forEach(s => {
            s.activeChanged.pipe(takeUntil(this.destroy$)).subscribe((e) => {
                if (e) {
                    if (this._activeStep) {
                        this._activeStep.active = false;
                    }
                    this.steps.filter(_s => _s.index === s.index)[0].active = true;
                    this._activeStep = s;

                    const evArgs: IStepperEventArgs = { index: s.index, owner: this };
                    this.activeStepChanged.emit(evArgs);
                }
            });
        });
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public navigateTo(index: number) {
        const step = this._steps.filter(s => s.index === index)[0];
        if (!step || step.disabled) {
            return;
        }

        if (!this._activeStep) {
            step.active = true;
        }

        if (this._activeStep && this._activeStep.index !== index) {
            this._activeStep.active = false;
            step.active = true;
        }
    }

    private getNextStep() {
        if (this._activeStep) {
            return this._activeStep.index === this.steps.length - 1 ? this._activeStep :
                this._steps.find(s => s.index > this._activeStep.index && !s.disabled && !s.skip);
        }
    }

    private getPrevStep() {
        if (this._activeStep) {
            return this._activeStep.index === 0 ? this._activeStep :
                this._steps.find(s => s.index < this._activeStep.index && !s.disabled && !s.skip);
        }
    }

    private getOrientationDisplay() {
        if (this._orientation === IgxStepperOrienatation.Horizontal) {
            return 'flex';
        } else {
            return 'block';
        }
    }
}

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        IgxStepComponent,
        IgxStepperComponent,
        IgxStepLabelDirective,
        IgxStepIconDirective,
        IgxStepValidIconDirective,
        IgxStepInvalidIconDirective
    ],
    exports: [
        IgxStepComponent,
        IgxStepperComponent,
        IgxStepLabelDirective,
        IgxStepIconDirective,
        IgxStepValidIconDirective,
        IgxStepInvalidIconDirective
    ]
})
export class IgxStepperModule { }
