import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Direction, IgxSlideComponentBase } from '../../carousel/carousel-base';
import { PlatformUtil } from '../../core/utils';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from '../../expansion-panel/toggle-animation-component';
import { IgxAngularAnimationService } from '../../services/animation/angular-animation-service';
import { AnimationService } from '../../services/animation/animation';
import { IgxDirectionality } from '../../services/direction/directionality';
import { IgxStep, IgxStepper, IgxStepperOrientation, IgxStepType, IGX_STEPPER_COMPONENT, IGX_STEP_COMPONENT, HorizontalAnimationType } from '../stepper.common';
import { IgxStepContentDirective, IgxStepIndicatorDirective } from '../stepper.directive';
import { IgxStepperService } from '../stepper.service';
import { IgxRippleDirective } from '../../directives/ripple/ripple.directive';
import { NgIf, NgClass, NgTemplateOutlet } from '@angular/common';

let NEXT_ID = 0;

/**
 * The IgxStepComponent is used within the `igx-stepper` element and it holds the content of each step.
 * It also supports custom indicators, title and subtitle.
 *
 * @igxModule IgxStepperModule
 *
 * @igxKeywords step
 *
 * @example
 * ```html
 *  <igx-stepper>
 *  ...
 *    <igx-step [active]="true" [completed]="true">
 *      ...
 *    </igx-step>
 *  ...
 *  </igx-stepper>
 * ```
 */
@Component({
    selector: 'igx-step',
    templateUrl: 'step.component.html',
    providers: [
        { provide: IGX_STEP_COMPONENT, useExisting: IgxStepComponent }
    ],
    imports: [NgIf, NgClass, IgxRippleDirective, NgTemplateOutlet]
})
export class IgxStepComponent extends ToggleAnimationPlayer implements IgxStep, AfterViewInit, OnDestroy, IgxSlideComponentBase {

    /**
     * Get/Set the `id` of the step component.
     * Default value is `"igx-step-0"`;
     * ```html
     * <igx-step id="my-first-step"></igx-step>
     * ```
     * ```typescript
     * const stepId = this.step.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-step-${NEXT_ID++}`;

    /**
     * Get/Set whether the step is interactable.
     *
     * ```html
     * <igx-stepper>
     * ...
     *     <igx-step [disabled]="true"></igx-step>
     * ...
     * </igx-stepper>
     * ```
     *
     * ```typescript
     * this.stepper.steps[1].disabled = true;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public set disabled(value: boolean) {
        this._disabled = value;
        if (this.stepper.linear) {
            this.stepperService.calculateLinearDisabledSteps();
        }
    }

    public get disabled(): boolean {
        return this._disabled;
    }

    /**
     * Get/Set whether the step is completed.
     *
     * @remarks
     * When set to `true` the following separator is styled `solid`.
     *
     * ```html
     * <igx-stepper>
     * ...
     *     <igx-step [completed]="true"></igx-step>
     * ...
     * </igx-stepper>
     * ```
     *
     * ```typescript
     * this.stepper.steps[1].completed = true;
     * ```
     */
    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-stepper__step--completed')
    public completed = false;

    /**
     * Get/Set whether the step is valid.
     *```html
     * <igx-step [isValid]="form.form.valid">
     *      ...
     *      <div igxStepContent>
     *          <form #form="ngForm">
     *              ...
     *          </form>
     *      </div>
     * </igx-step>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get isValid(): boolean {
        return this._valid;
    }

    public set isValid(value: boolean) {
        this._valid = value;
        if (this.stepper.linear && this.index !== undefined) {
            this.stepperService.calculateLinearDisabledSteps();
        }
    }

    /**
     * Get/Set whether the step is optional.
     *
     * @remarks
     * Optional steps validity does not affect the default behavior when the stepper is in linear mode i.e.
     * if optional step is invalid the user could still move to the next step.
     *
     * ```html
     * <igx-step [optional]="true"></igx-step>
     * ```
     * ```typescript
     * this.stepper.steps[1].optional = true;
     * ```
     */
    @Input({ transform: booleanAttribute })
    public optional = false;

    /**
     * Get/Set the active state of the step
     *
     * ```html
     * <igx-step [active]="true"></igx-step>
     * ```
     *
     * ```typescript
     * this.stepper.steps[1].active = true;
     * ```
     *
     * @param value: boolean
     */
    @HostBinding('attr.aria-selected')
    @Input({ transform: booleanAttribute })
    public set active(value: boolean) {
        if (value) {
            this.stepperService.expandThroughApi(this);
        } else {
            this.stepperService.collapse(this);
        }
    }

    public get active(): boolean {
        return this.stepperService.activeStep === this;
    }

    /** @hidden @internal */
    @HostBinding('attr.tabindex')
    @Input()
    public set tabIndex(value: number) {
        this._tabIndex = value;
    }

    public get tabIndex(): number {
        return this._tabIndex;
    }

    /** @hidden @internal **/
    @HostBinding('attr.role')
    public role = 'tab';

    /** @hidden @internal */
    @HostBinding('attr.aria-controls')
    public get contentId(): string {
        return this.content?.id;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-stepper__step')
    public cssClass = true;

    /** @hidden @internal */
    @HostBinding('class.igx-stepper__step--disabled')
    public get generalDisabled(): boolean {
        return this.disabled || this.linearDisabled;
    }

    /** @hidden @internal */
    @HostBinding('class')
    public get titlePositionTop(): string {
        if (this.stepper.stepType !== IgxStepType.Full) {
            return 'igx-stepper__step--simple';
        }

        return `igx-stepper__step--${this.titlePosition}`;
    }

    /**
     * Emitted when the step's `active` property changes. Can be used for two-way binding.
     *
     * ```html
     * <igx-step [(active)]="this.isActive">
     * </igx-step>
     * ```
     *
     * ```typescript
     * const step: IgxStepComponent = this.stepper.step[0];
     * step.activeChange.subscribe((e: boolean) => console.log("Step active state change to ", e))
     * ```
     */
    @Output()
    public activeChange = new EventEmitter<boolean>();

    /** @hidden @internal */
    @ViewChild('contentTemplate', { static: true })
    public contentTemplate: TemplateRef<any>;

    /** @hidden @internal */
    @ViewChild('customIndicator', { static: true })
    public customIndicatorTemplate: TemplateRef<any>;

    /** @hidden @internal */
    @ViewChild('contentContainer')
    public contentContainer: ElementRef;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxStepIndicatorDirective))
    public indicator: IgxStepIndicatorDirective;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxStepContentDirective))
    public content: IgxStepContentDirective;

    /**
     * Get the step index inside of the stepper.
     *
     * ```typescript
     * const step = this.stepper.steps[1];
     * const stepIndex: number = step.index;
     * ```
     */
    public get index(): number {
        return this._index;
    }

    /** @hidden @internal */
    public get indicatorTemplate(): TemplateRef<any> {
        if (this.active && this.stepper.activeIndicatorTemplate) {
            return this.stepper.activeIndicatorTemplate;
        }

        if (!this.isValid && this.stepper.invalidIndicatorTemplate) {
            return this.stepper.invalidIndicatorTemplate;
        }

        if (this.completed && this.stepper.completedIndicatorTemplate) {
            return this.stepper.completedIndicatorTemplate;
        }

        if (this.indicator) {
            return this.customIndicatorTemplate;
        }

        return null;
    }

    /** @hidden @internal */
    public get direction(): Direction {
        return this.stepperService.previousActiveStep
            && this.stepperService.previousActiveStep.index > this.index
            ? Direction.PREV
            : Direction.NEXT;
    }

    /** @hidden @internal */
    public get isAccessible(): boolean {
        return !this.disabled && !this.linearDisabled;
    }

    /** @hidden @internal */
    public get isHorizontal(): boolean {
        return this.stepper.orientation === IgxStepperOrientation.Horizontal;
    }

    /** @hidden @internal */
    public get isTitleVisible(): boolean {
        return this.stepper.stepType !== IgxStepType.Indicator;
    }

    /** @hidden @internal */
    public get isIndicatorVisible(): boolean {
        return this.stepper.stepType !== IgxStepType.Title;
    }

    /** @hidden @internal */
    public get titlePosition(): string {
        return this.stepper.titlePosition ? this.stepper.titlePosition : this.stepper._defaultTitlePosition;
    }

    /** @hidden @internal */
    public get linearDisabled(): boolean {
        return this.stepperService.linearDisabledSteps.has(this);
    }

    /** @hidden @internal */
    public get collapsing(): boolean {
        return this.stepperService.collapsingSteps.has(this);
    }

    /** @hidden @internal */
    public override get animationSettings(): ToggleAnimationSettings {
        return this.stepper.verticalAnimationSettings;
    }

    /** @hidden @internal */
    public get contentClasses(): any {
        if (this.isHorizontal) {
            return { 'igx-stepper__body-content': true, 'igx-stepper__body-content--active': this.active };
        } else {
            return 'igx-stepper__step-content';
        }
    }

    /** @hidden @internal */
    public get stepHeaderClasses(): any {
        return {
            'igx-stepper__step--optional': this.optional,
            'igx-stepper__step-header--current': this.active,
            'igx-stepper__step-header--invalid': !this.isValid
                && this.stepperService.visitedSteps.has(this) && !this.active && this.isAccessible
        };
    }

    /** @hidden @internal */
    public get nativeElement(): HTMLElement {
        return this.element.nativeElement;
    }
    /** @hidden @internal */
    public previous: boolean;
    /** @hidden @internal */
    public _index: number;
    private _tabIndex = -1;
    private _valid = true;
    private _focused = false;
    private _disabled = false;

    constructor(
        @Inject(IGX_STEPPER_COMPONENT) public stepper: IgxStepper,
        public cdr: ChangeDetectorRef,
        public renderer: Renderer2,
        protected platform: PlatformUtil,
        protected stepperService: IgxStepperService,
        @Inject(IgxAngularAnimationService) animationService: AnimationService,
        private element: ElementRef<HTMLElement>,
        private dir: IgxDirectionality
    ) {
        super(animationService);
    }

    /** @hidden @internal */
    @HostListener('focus')
    public onFocus(): void {
        this._focused = true;
        this.stepperService.focusedStep = this;
        if (this.stepperService.focusedStep !== this.stepperService.activeStep) {
            this.stepperService.activeStep.tabIndex = -1;
        }
    }

    /** @hidden @internal */
    @HostListener('blur')
    public onBlur(): void {
        this._focused = false;
        this.stepperService.activeStep.tabIndex = 0;
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public handleKeydown(event: KeyboardEvent): void {
        if (!this._focused) {
            return;
        }
        const key = event.key;
        if (this.stepper.orientation === IgxStepperOrientation.Horizontal) {
            if (key === this.platform.KEYMAP.ARROW_UP || key === this.platform.KEYMAP.ARROW_DOWN) {
                return;
            }
        }
        if (!(this.platform.isNavigationKey(key) || this.platform.isActivationKey(event))) {
            return;
        }
        event.preventDefault();
        this.handleNavigation(key);
    }

    /** @hidden @internal */
    public ngAfterViewInit(): void {
        this.openAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(
            () => {
                if (this.stepperService.activeStep === this) {
                    this.stepper.activeStepChanged.emit({ owner: this.stepper, index: this.index });
                }
            }
        );
        this.closeAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.stepperService.collapse(this);
            this.cdr.markForCheck();
        });
    }

    /** @hidden @internal */
    public onPointerDown(event: MouseEvent): void {
        event.stopPropagation();
        if (this.isHorizontal) {
            this.changeHorizontalActiveStep();
        } else {
            this.changeVerticalActiveStep();
        }
    }

    /** @hidden @internal */
    public handleNavigation(key: string): void {
        switch (key) {
            case this.platform.KEYMAP.HOME:
                this.stepper.steps.filter(s => s.isAccessible)[0]?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.END:
                this.stepper.steps.filter(s => s.isAccessible).pop()?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.ARROW_UP:
                this.previousStep?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.ARROW_LEFT:
                if (this.dir.rtl && this.stepper.orientation === IgxStepperOrientation.Horizontal) {
                    this.nextStep?.nativeElement.focus();
                } else {
                    this.previousStep?.nativeElement.focus();
                }
                break;
            case this.platform.KEYMAP.ARROW_DOWN:
                this.nextStep?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.ARROW_RIGHT:
                if (this.dir.rtl && this.stepper.orientation === IgxStepperOrientation.Horizontal) {
                    this.previousStep?.nativeElement.focus();
                } else {
                    this.nextStep?.nativeElement.focus();
                }
                break;
            case this.platform.KEYMAP.SPACE:
            case this.platform.KEYMAP.ENTER:
                if (this.isHorizontal) {
                    this.changeHorizontalActiveStep();
                } else {
                    this.changeVerticalActiveStep();
                }
                break;
            default:
                return;
        }
    }

    /** @hidden @internal */
    public changeHorizontalActiveStep(): void {
        if (this.stepper.animationType === HorizontalAnimationType.none && this.stepperService.activeStep !== this) {
            const argsCanceled = this.stepperService.emitActivatingEvent(this);
            if (argsCanceled) {
                return;
            }

            this.active = true;
            this.stepper.activeStepChanged.emit({ owner: this.stepper, index: this.index });
            return;
        }
        this.stepperService.expand(this);
        if (this.stepper.animationType === HorizontalAnimationType.fade) {
            if (this.stepperService.collapsingSteps.has(this.stepperService.previousActiveStep)) {
                this.stepperService.previousActiveStep.active = false;
            }
        }
    }

    private get nextStep(): IgxStepComponent | null {
        const focusedStep = this.stepperService.focusedStep;
        if (focusedStep) {
            if (focusedStep.index === this.stepper.steps.length - 1) {
                return this.stepper.steps.find(s => s.isAccessible);
            }

            const nextAccessible = this.stepper.steps.find((s, i) => i > focusedStep.index && s.isAccessible);
            return nextAccessible ? nextAccessible : this.stepper.steps.find(s => s.isAccessible);
        }

        return null;
    }

    private get previousStep(): IgxStepComponent | null {
        const focusedStep = this.stepperService.focusedStep;
        if (focusedStep) {
            if (focusedStep.index === 0) {
                return this.stepper.steps.filter(s => s.isAccessible).pop();
            }

            let prevStep;
            for (let i = focusedStep.index - 1; i >= 0; i--) {
                const step = this.stepper.steps[i];
                if (step.isAccessible) {
                    prevStep = step;
                    break;
                }
            }

            return prevStep ? prevStep : this.stepper.steps.filter(s => s.isAccessible).pop();

        }

        return null;
    }

    private changeVerticalActiveStep(): void {
        this.stepperService.expand(this);

        if (!this.animationSettings.closeAnimation) {
            this.stepperService.previousActiveStep?.openAnimationPlayer?.finish();
        }

        if (!this.animationSettings.openAnimation) {
            this.stepperService.activeStep.closeAnimationPlayer?.finish();
        }
    }
}
