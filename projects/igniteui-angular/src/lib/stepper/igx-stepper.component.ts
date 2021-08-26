import {
    AfterContentInit, Component, ContentChildren, Directive, EventEmitter,
    HostBinding, Input, NgModule, OnDestroy, Output, QueryList
} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IgxStepperLabelPosition, IgxStepperOrienatation,
    IgxStepType, IGX_STEPPER_COMPONENT, IStepperCancelableEventArgs, IStepperEventArgs
} from './common';
import { IgxStepComponent, IgxStepIconDirective, IgxStepLabelDirective } from './step/igx-step.component';

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
            this._steps.forEach(step => step.label.position = this.labelPosition);
        }
    }

    @Input()
    public linear = false;

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
    private destroy$ = new Subject();

    /** @hidden @internal */
    public ngAfterContentInit() {
        this.steps.forEach(s => {
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
        if (!this._activeStep) {
            this.steps.filter(s => s.index === index)[0].active = true;
        }
        if (this._activeStep && this._activeStep.index !== index) {
            this._activeStep.active = false;
            this.steps.filter(s => s.index === index)[0].active = true;
        }
    }
}

@NgModule({
    imports: [
        BrowserAnimationsModule
    ],
    declarations: [
        IgxStepComponent,
        IgxStepperComponent,
        IgxStepLabelDirective,
        IgxStepIconDirective
    ],
    exports: [
        IgxStepComponent,
        IgxStepperComponent,
        IgxStepLabelDirective,
        IgxStepIconDirective
    ]
})
export class IgxStepperModule { }
