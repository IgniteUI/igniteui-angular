import { AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { NgIf, NgTemplateOutlet, NgFor } from '@angular/common';
import {
    AfterContentInit, ChangeDetectorRef, Component, ContentChild, ContentChildren,
    ElementRef, EventEmitter, HostBinding, Inject, Input, OnChanges, OnDestroy,
    OnInit, Output, QueryList, SimpleChanges, TemplateRef, booleanAttribute
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxCarouselComponentBase } from '../carousel/carousel-base';

import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxAngularAnimationService } from '../services/animation/angular-animation-service';
import { AnimationService } from '../services/animation/animation';
import { IgxStepComponent } from './step/step.component';
import {
    IgxStepper, IgxStepperOrientation, IgxStepperTitlePosition, IgxStepType,
    IGX_STEPPER_COMPONENT, IStepChangedEventArgs, IStepChangingEventArgs, VerticalAnimationType,
    HorizontalAnimationType
} from './stepper.common';
import {
    IgxStepActiveIndicatorDirective,
    IgxStepCompletedIndicatorDirective,
    IgxStepInvalidIndicatorDirective
} from './stepper.directive';
import { IgxStepperService } from './stepper.service';
import { fadeIn, growVerIn, growVerOut } from 'igniteui-angular/animations';


// TODO: common interface between IgxCarouselComponentBase and ToggleAnimationPlayer?

/**
 * IgxStepper provides a wizard-like workflow by dividing content into logical steps.
 *
 * @igxModule IgxStepperModule
 *
 * @igxKeywords stepper
 *
 * @igxGroup Layouts
 *
 * @remarks
 * The Ignite UI for Angular Stepper component allows the user to navigate between multiple steps.
 * It supports horizontal and vertical orientation as well as keyboard navigation and provides API methods to control the active step.
 * The component offers keyboard navigation and API to control the active step.
 *
 * @example
 * ```html
 * <igx-stepper>
 *  <igx-step [active]="true">
 *      <igx-icon igxStepIndicator>home</igx-icon>
 *      <p igxStepTitle>Home</p>
 *      <div igxStepContent>
 *         ...
 *      </div>
 *  </igx-step>
 *  <igx-step [optional]="true">
 *      <div igxStepContent>
 *          ...
 *      </div>
 *  </igx-step>
 *  <igx-step>
 *      <div igxStepContent>
 *          ...
 *      </div>
 *  </igx-step>
 * </igx-stepper>
 * ```
 */
@Component({
    selector: 'igx-stepper',
    templateUrl: 'stepper.component.html',
    providers: [
        IgxStepperService,
        { provide: IGX_STEPPER_COMPONENT, useExisting: IgxStepperComponent },
    ],
    imports: [NgIf, NgTemplateOutlet, NgFor]
})
export class IgxStepperComponent extends IgxCarouselComponentBase implements IgxStepper, OnChanges, OnInit, AfterContentInit, OnDestroy {

    /**
     * Get/Set the animation type of the stepper when the orientation direction is vertical.
     *
     * @remarks
     * Default value is `grow`. Other possible values are `fade` and `none`.
     *
     * ```html
     * <igx-stepper verticalAnimationType="none">
     * <igx-stepper>
     * ```
     */
    @Input()
    public get verticalAnimationType(): VerticalAnimationType {
        return this._verticalAnimationType;
    }

    public set verticalAnimationType(value: VerticalAnimationType) {
        // TODO: activeChange event is not emitted for the collapsing steps (loop through collapsing steps and emit)
        this.stepperService.collapsingSteps.clear();
        this._verticalAnimationType = value;

        switch (value) {
            case 'grow':
                this.verticalAnimationSettings = this.updateVerticalAnimationSettings(growVerIn, growVerOut);
                break;
            case 'fade':
                this.verticalAnimationSettings = this.updateVerticalAnimationSettings(fadeIn, null);
                break;
            case 'none':
                this.verticalAnimationSettings = this.updateVerticalAnimationSettings(null, null);
                break;
        }
    }

    /**
     * Get/Set the animation type of the stepper when the orientation direction is horizontal.
     *
     * @remarks
     * Default value is `grow`. Other possible values are `fade` and `none`.
     *
     * ```html
     * <igx-stepper animationType="none">
     * <igx-stepper>
     * ```
     */
    @Input()
    public get horizontalAnimationType(): HorizontalAnimationType {
        return this.animationType;
    }

    public set horizontalAnimationType(value: HorizontalAnimationType) {
        // TODO: activeChange event is not emitted for the collapsing steps (loop through collapsing steps and emit)
        this.stepperService.collapsingSteps.clear();
        this.animationType = value;
    }

    /**
     * Get/Set the animation duration.
     * ```html
     * <igx-stepper [animationDuration]="500">
     * <igx-stepper>
     * ```
     */
    @Input()
    public get animationDuration(): number {
        return this.defaultAnimationDuration;
    }

    public set animationDuration(value: number) {
        if (value && value > 0) {
            this.defaultAnimationDuration = value;
            return;
        }
        this.defaultAnimationDuration = this._defaultAnimationDuration;
    }

    /**
     * Get/Set whether the stepper is linear.
     *
     * @remarks
     * If the stepper is in linear mode and if the active step is valid only then the user is able to move forward.
     *
     * ```html
     * <igx-stepper [linear]="true"></igx-stepper>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get linear(): boolean {
        return this._linear;
    }

    public set linear(value: boolean) {
        this._linear = value;
        if (this._linear && this.steps.length > 0) {
            // when the stepper is in linear mode we should calculate which steps should be disabled
            // and which are visited i.e. their validity should be correctly displayed.
            this.stepperService.calculateVisitedSteps();
            this.stepperService.calculateLinearDisabledSteps();
        } else {
            this.stepperService.linearDisabledSteps.clear();
        }
    }

    /**
     * Get/Set the stepper orientation.
     *
     * ```typescript
     * this.stepper.orientation = IgxStepperOrientation.Vertical;
     * ```
     */
    @HostBinding('attr.aria-orientation')
    @Input()
    public get orientation(): IgxStepperOrientation {
        return this._orientation;
    }

    public set orientation(value: IgxStepperOrientation) {
        if (this._orientation === value) {
            return;
        }

        // TODO: activeChange event is not emitted for the collapsing steps
        this.stepperService.collapsingSteps.clear();
        this._orientation = value;
        this._defaultTitlePosition = this._orientation === IgxStepperOrientation.Horizontal ?
            IgxStepperTitlePosition.Bottom : IgxStepperTitlePosition.End;
    }

    /**
     * Get/Set the type of the steps.
     *
     * ```typescript
     * this.stepper.stepType = IgxStepType.Indicator;
     * ```
     */
    @Input()
    public stepType: IgxStepType = IgxStepType.Full;

    /**
     * Get/Set whether the content is displayed above the steps.
     *
     * @remarks
     * Default value is `false` and the content is below the steps.
     *
     * ```typescript
     * this.stepper.contentTop = true;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public contentTop = false;

    /**
     * Get/Set the position of the steps title.
     *
     * @remarks
     * The default value when the stepper is horizontally orientated is `bottom`.
     * In vertical layout the default title position is `end`.
     *
     * ```typescript
     * this.stepper.titlePosition = IgxStepperTitlePosition.Top;
     * ```
     */
    @Input()
    public titlePosition: IgxStepperTitlePosition = null;

    /** @hidden @internal **/
    @HostBinding('class.igx-stepper')
    public cssClass = 'igx-stepper';

    /** @hidden @internal **/
    @HostBinding('attr.role')
    public role = 'tablist';

    /** @hidden @internal **/
    @HostBinding('class.igx-stepper--horizontal')
    public get directionClass() {
        return this.orientation === IgxStepperOrientation.Horizontal;
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
     * public handleActiveStepChanging(event: IStepChangingEventArgs) {
     *  if (event.newIndex < event.oldIndex) {
     *      event.cancel = true;
     *  }
     * }
     *```
     */
    @Output()
    public activeStepChanging = new EventEmitter<IStepChangingEventArgs>();

    /**
     * Emitted when the active step is changed.
     *
     * @example
     * ```
     * <igx-stepper (activeStepChanged)="handleActiveStepChanged($event)"></igx-stepper>
     * ```
     */
    @Output()
    public activeStepChanged = new EventEmitter<IStepChangedEventArgs>();

    /** @hidden @internal */
    @ContentChild(IgxStepInvalidIndicatorDirective, { read: TemplateRef })
    public invalidIndicatorTemplate: TemplateRef<IgxStepInvalidIndicatorDirective>;

    /** @hidden @internal */
    @ContentChild(IgxStepCompletedIndicatorDirective, { read: TemplateRef })
    public completedIndicatorTemplate: TemplateRef<IgxStepCompletedIndicatorDirective>;

    /** @hidden @internal */
    @ContentChild(IgxStepActiveIndicatorDirective, { read: TemplateRef })
    public activeIndicatorTemplate: TemplateRef<IgxStepActiveIndicatorDirective>;

    /** @hidden @internal */
    @ContentChildren(IgxStepComponent, { descendants: false })
    private _steps: QueryList<IgxStepComponent>;

    /**
     * Get all steps.
     *
     * ```typescript
     * const steps: IgxStepComponent[] = this.stepper.steps;
     * ```
     */
    public get steps(): IgxStepComponent[] {
        return this._steps?.toArray() || [];
    }

    /** @hidden @internal */
    public get nativeElement(): HTMLElement {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
    public verticalAnimationSettings: ToggleAnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut,
    };
    /** @hidden @internal */
    public _defaultTitlePosition: IgxStepperTitlePosition = IgxStepperTitlePosition.Bottom;
    private destroy$ = new Subject<void>();
    private _orientation: IgxStepperOrientation = IgxStepperOrientation.Horizontal;
    private _verticalAnimationType: VerticalAnimationType = VerticalAnimationType.Grow;
    private _linear = false;
    private readonly _defaultAnimationDuration = 350;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(IgxAngularAnimationService) animationService: AnimationService,
        private stepperService: IgxStepperService,
        private element: ElementRef<HTMLElement>) {
        super(animationService, cdr);
        this.stepperService.stepper = this;
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['animationDuration']) {
            this.verticalAnimationType = this._verticalAnimationType;
        }
    }

    /** @hidden @internal */
    public ngOnInit(): void {
        this.enterAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.activeStepChanged.emit({ owner: this, index: this.stepperService.activeStep.index });
        });
        this.leaveAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.stepperService.collapsingSteps.size === 1) {
                this.stepperService.collapse(this.stepperService.previousActiveStep);
            } else {
                Array.from(this.stepperService.collapsingSteps).slice(0, this.stepperService.collapsingSteps.size - 1)
                    .forEach(step => this.stepperService.collapse(step));
            }
        });


    }

    /** @hidden @internal */
    public ngAfterContentInit(): void {
        let activeStep;
        this.steps.forEach((step, index) => {
            this.updateStepAria(step, index);
            if (!activeStep && step.active) {
                activeStep = step;
            }
        });
        if (!activeStep) {
            this.activateFirstStep(true);
        }

        if (this.linear) {
            this.stepperService.calculateLinearDisabledSteps();
        }

        this.handleStepChanges();
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Activates the step at a given index.
     *
     *```typescript
     * this.stepper.navigateTo(1);
     *```
     */
    public navigateTo(index: number): void {
        const step = this.steps[index];
        if (!step || this.stepperService.activeStep === step) {
            return;
        }
        this.activateStep(step);
    }

    /**
     * Activates the next enabled step.
     *
     *```typescript
     * this.stepper.next();
     *```
     */
    public next(): void {
        this.moveToNextStep();
    }

    /**
     * Activates the previous enabled step.
     *
     *```typescript
     * this.stepper.prev();
     *```
     */
    public prev(): void {
        this.moveToNextStep(false);
    }

    /**
     * Resets the stepper to its initial state i.e. activates the first step.
     *
     * @remarks
     * The steps' content will not be automatically reset.
     *```typescript
     * this.stepper.reset();
     *```
     */
    public reset(): void {
        this.stepperService.visitedSteps.clear();
        const activeStep = this.steps.find(s => !s.disabled);
        if (activeStep) {
            this.activateStep(activeStep);
        }
    }

    /** @hidden @internal */
    public playHorizontalAnimations(): void {
        this.previousItem = this.stepperService.previousActiveStep;
        this.currentItem = this.stepperService.activeStep;
        this.triggerAnimations();
    }

    protected getPreviousElement(): HTMLElement {
        return this.stepperService.previousActiveStep?.contentContainer.nativeElement;
    }

    protected getCurrentElement(): HTMLElement {
        return this.stepperService.activeStep.contentContainer.nativeElement;
    }

    private updateVerticalAnimationSettings(
        openAnimation: AnimationReferenceMetadata,
        closeAnimation: AnimationReferenceMetadata): ToggleAnimationSettings {
        const customCloseAnimation = useAnimation(closeAnimation, {
            params: {
                duration: this.animationDuration + 'ms'
            }
        });
        const customOpenAnimation = useAnimation(openAnimation, {
            params: {
                duration: this.animationDuration + 'ms'
            }
        });

        return {
            openAnimation: openAnimation ? customOpenAnimation : null,
            closeAnimation: closeAnimation ? customCloseAnimation : null
        };
    }

    private updateStepAria(step: IgxStepComponent, index: number): void {
        step._index = index;
        step.renderer.setAttribute(step.nativeElement, 'aria-setsize', (this.steps.length).toString());
        step.renderer.setAttribute(step.nativeElement, 'aria-posinset', (index + 1).toString());
    }

    private handleStepChanges(): void {
        this._steps.changes.pipe(takeUntil(this.destroy$)).subscribe(steps => {
            Promise.resolve().then(() => {
                steps.forEach((step, index) => {
                    this.updateStepAria(step, index);
                });

                // when the active step is removed
                const hasActiveStep = this.steps.find(s => s === this.stepperService.activeStep);
                if (!hasActiveStep) {
                    this.activateFirstStep();
                }
                // TO DO: mark step added before the active as visited?
                if (this.linear) {
                    this.stepperService.calculateLinearDisabledSteps();
                }
            });
        });
    }

    private activateFirstStep(activateInitially = false) {
        const firstEnabledStep = this.steps.find(s => !s.disabled);
        if (firstEnabledStep) {
            firstEnabledStep.active = true;
            if (activateInitially) {
                firstEnabledStep.activeChange.emit(true);
                this.activeStepChanged.emit({ owner: this, index: firstEnabledStep.index });
            }
        }
    }

    private activateStep(step: IgxStepComponent) {
        if (this.orientation === IgxStepperOrientation.Horizontal) {
            step.changeHorizontalActiveStep();
        } else {
            this.stepperService.expand(step);
        }
    }

    private moveToNextStep(next = true) {
        let steps: IgxStepComponent[] = this.steps;
        let activeStepIndex = this.stepperService.activeStep.index;
        if (!next) {
            steps = this.steps.reverse();
            activeStepIndex = steps.findIndex(s => s === this.stepperService.activeStep);
        }

        const nextStep = steps.find((s, i) => i > activeStepIndex && s.isAccessible);
        if (nextStep) {
            this.activateStep(nextStep);
        }
    }
}
