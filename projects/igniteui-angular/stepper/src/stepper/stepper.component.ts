import { AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    booleanAttribute,
    inject,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxCarouselComponentBase } from 'igniteui-angular/carousel';
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
import { ToggleAnimationSettings } from 'igniteui-angular/expansion-panel';


// TODO: common interface between IgxCarouselComponentBase and ToggleAnimationPlayer?

/**
 * Stepper provides a wizard-like workflow by dividing content into logical steps.
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
    styleUrl: 'stepper.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [
        IgxStepperService,
        { provide: IGX_STEPPER_COMPONENT, useExisting: IgxStepperComponent },
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgTemplateOutlet]
})
export class IgxStepperComponent extends IgxCarouselComponentBase implements IgxStepper, OnInit, AfterContentInit, OnDestroy {
    private stepperService = inject(IgxStepperService);
    private element = inject<ElementRef<HTMLElement>>(ElementRef);


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
        this.stepperService.collapseAll();
        this._verticalAnimationType = value;
        this.updateVerticalAnimationSettings();
    }

    /**
     * Get/Set the animation type of the stepper when the orientation direction is horizontal.
     *
     * @remarks
     * Default value is `slide`. Other possible values are `fade` and `none`.
     *
     * ```html
     * <igx-stepper horizontalAnimationType="none">
     * <igx-stepper>
     * ```
     */
    @Input()
    public get horizontalAnimationType(): HorizontalAnimationType {
        return this.animationType;
    }

    public set horizontalAnimationType(value: HorizontalAnimationType) {
        this.stepperService.collapseAll();
        this.animationType = value;
    }

    /**
     * Get/Set the animation duration in milliseconds.
     *
     * @remarks
     * Default value is `320`. It is also used when the value is not a positive number.
     *
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
        this.defaultAnimationDuration = value > 0 ? value : this._defaultAnimationDuration;
        this.updateVerticalAnimationSettings();
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

        this.stepperService.collapseAll();
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
    public titlePosition: IgxStepperTitlePosition = null!;

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
    public invalidIndicatorTemplate!: TemplateRef<IgxStepInvalidIndicatorDirective>;

    /** @hidden @internal */
    @ContentChild(IgxStepCompletedIndicatorDirective, { read: TemplateRef })
    public completedIndicatorTemplate!: TemplateRef<IgxStepCompletedIndicatorDirective>;

    /** @hidden @internal */
    @ContentChild(IgxStepActiveIndicatorDirective, { read: TemplateRef })
    public activeIndicatorTemplate!: TemplateRef<IgxStepActiveIndicatorDirective>;

    /** @hidden @internal */
    @ContentChildren(IgxStepComponent, { descendants: false })
    private _steps!: QueryList<IgxStepComponent>;

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
    public verticalAnimationSettings!: ToggleAnimationSettings;
    /** @hidden @internal */
    public _defaultTitlePosition: IgxStepperTitlePosition = IgxStepperTitlePosition.Bottom;
    private destroy$ = new Subject<void>();
    private _orientation: IgxStepperOrientation = IgxStepperOrientation.Horizontal;
    private _verticalAnimationType: VerticalAnimationType = VerticalAnimationType.Grow;
    private _linear = false;
    private readonly _defaultAnimationDuration = 320;

    constructor() {
        super();
        this.stepperService.stepper = this;
        this.defaultAnimationDuration = this._defaultAnimationDuration;
        this.updateVerticalAnimationSettings();
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
        this.steps.forEach((step, index) => this.updateStepAria(step, index));
        if (!this.stepperService.activeStep) {
            this.activateFirstStep(true);
        }

        if (this.linear) {
            this.stepperService.calculateLinearDisabledSteps();
        }

        this.handleStepChanges();
    }

    /** @hidden @internal */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
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
        step.activate();
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
        this.steps.find(s => !s.disabled)?.activate();
        // the active step is still visited when it is not changed, e.g. it is already the first enabled step
        if (this.stepperService.activeStep) {
            this.stepperService.visitedSteps.add(this.stepperService.activeStep);
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

    private updateVerticalAnimationSettings(): void {
        const withDuration = (animation: AnimationReferenceMetadata) =>
            useAnimation(animation, { params: { duration: `${this.animationDuration}ms` } });

        switch (this._verticalAnimationType) {
            case VerticalAnimationType.Grow:
                this.verticalAnimationSettings = { openAnimation: withDuration(growVerIn), closeAnimation: withDuration(growVerOut) };
                break;
            case VerticalAnimationType.Fade:
                this.verticalAnimationSettings = { openAnimation: withDuration(fadeIn), closeAnimation: null! };
                break;
            case VerticalAnimationType.None:
                this.verticalAnimationSettings = { openAnimation: null!, closeAnimation: null! };
                break;
        }
    }

    private updateStepAria(step: IgxStepComponent, index: number): void {
        step._index.set(index);
        step.renderer.setAttribute(step.nativeElement, 'aria-setsize', (this.steps.length).toString());
        step.renderer.setAttribute(step.nativeElement, 'aria-posinset', (index + 1).toString());
    }

    private handleStepChanges(): void {
        this._steps.changes.pipe(takeUntil(this.destroy$)).subscribe(steps => {
            Promise.resolve().then(() => {
                steps.forEach((step: IgxStepComponent, index: number) => {
                    this.updateStepAria(step, index);
                });

                this.stepperService.removeDetachedSteps();
                // when the active step is removed
                if (!this.stepperService.activeStep) {
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
            // activating the step emits its activeChange event
            firstEnabledStep.active = true;
            if (activateInitially) {
                this.activeStepChanged.emit({ owner: this, index: firstEnabledStep.index });
            }
        }
    }

    private moveToNextStep(next = true) {
        // when there is no active step, next activates the first accessible step
        const activeIndex = this.stepperService.activeStep?.index ?? -1;
        const accessibleSteps = this.steps.filter(s => s.isAccessible);
        const step = next
            ? accessibleSteps.find(s => s.index > activeIndex)
            : accessibleSteps.findLast(s => s.index < activeIndex);
        if (step) {
            step.activate();
        }
    }
}
