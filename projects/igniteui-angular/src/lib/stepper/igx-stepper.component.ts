import {
    AfterContentInit, Component, ContentChildren, Directive, EventEmitter,
    HostBinding, Input, NgModule, OnDestroy, Output, QueryList
} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IgxStepperLabelPosition, IgxStepperOrienatation,
    IgxStepType, IStepperCancelableEventArgs, IStepperEventArgs
} from './common';
import { IgxStepComponent } from './step/igx-step.component';


let NEXT_ID = 0;

@Directive({
    selector: '[igxStepValidIcon]'
})
export class IgxStepValidIconDirective {
}


@Directive({
    selector: '[igxStepInvalidIcon]'
})
export class IgxStepInvalidIconDirective {
}


@Component({
    selector: 'igx-stepper',
    templateUrl: 'igx-stepper.component.html'
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

    @Input()
    public get steps(): IgxStepComponent[] {
        return this._steps.toArray();
    }

    @Input()
    public get orientation(): IgxStepperOrienatation {
        return this._orientation;
    }

    public set orientation(value: IgxStepperOrienatation) {
    }

    @Input()
    public get stepType(): IgxStepType {
        return this._stepType;
    }

    public set stepType(value: IgxStepType) {
        if (value !== this._stepType) {
            this._stepType = value;
            this._steps.forEach(step => {
                step.isLabelVisible = !(this._stepType === IgxStepType.Indicator);
                step.isIndicatorVisible = !(this._stepType === IgxStepType.Label);
            });
        }
    }

    @Input()
    public get labelPosition(): IgxStepperLabelPosition {
        return this._labelPosition;
    }

    public set labelPosition(value: IgxStepperLabelPosition) {
        if (value !== this._labelPosition) {
            this._labelPosition = value;
            this._steps.forEach(step => step.labelClass = this.labelPositionClass);
        }
    }

    /** @hidden */
    public get labelPositionClass() {
        return `igx-step_label--${this.labelPosition}`;
    }

    @Input()
    public linear = false;

    @Output()
    public activeStepChanging = new EventEmitter<IStepperCancelableEventArgs>();

    @Output()
    public activeStepChanged = new EventEmitter<IStepperEventArgs>();

    @ContentChildren(IgxStepComponent)
    private _steps: QueryList<IgxStepComponent>;

    private _orientation = IgxStepperOrienatation.Horizontal;
    private _stepType = IgxStepType.Full;
    private _labelPosition = IgxStepperLabelPosition.Bottom;
    private _activeStep: IgxStepComponent = null;

    private destroy$ = new Subject();

    public navigateTo(id: number) {
        if (!this._activeStep) {
            this.steps.filter(s => s.id === id)[0].active = true;
        }
        if (this._activeStep && this._activeStep.id !== id) {
            this._activeStep.active = false;
            this.steps.filter(s => s.id === id)[0].active = true;
        }
        // this.activeStepChanged.emit({index: id, owner: this});
    }

    public ngAfterContentInit() {
        this.steps.forEach(s => {
            s.activeChanged.pipe(takeUntil(this.destroy$)).subscribe((e) => {
                if (e) {
                    if (this._activeStep) {
                        this._activeStep.active = false;
                    }
                    this.steps.filter(_s => _s.id === s.id)[0].active = true;
                    this._activeStep = s;

                    const evArgs: IStepperEventArgs = { index: s.id, owner: this };
                    this.activeStepChanged.emit(evArgs);
                }
            });
        });
    }

    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

}

@NgModule({
    imports: [
        BrowserAnimationsModule
    ],
    declarations: [
        IgxStepComponent,
        IgxStepperComponent
    ],
    exports: [
        IgxStepComponent,
        IgxStepperComponent
    ]
})
export class IgxStepperModule { }
