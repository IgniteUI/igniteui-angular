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
    Input,
    OnDestroy,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild,
    inject,
    signal,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { IgxStep, IgxStepper, IgxStepperOrientation, IgxStepType, IGX_STEPPER_COMPONENT, IGX_STEP_COMPONENT, HorizontalAnimationType } from '../stepper.common';
import { IgxStepContentDirective, IgxStepIndicatorDirective } from '../stepper.directive';
import { IgxStepperService } from '../stepper.service';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { IgxRippleDirective } from 'igniteui-angular/directives';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from 'igniteui-angular/expansion-panel';
import { CarouselAnimationDirection, IgxSlideComponentBase } from 'igniteui-angular/carousel';
import { isLeftToRight, PlatformUtil } from 'igniteui-angular/core';

let NEXT_ID = 0;

/**
 * The step is used within the stepper element and it holds the content of each step.
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
    styleUrl: 'step.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: IGX_STEP_COMPONENT, useExisting: IgxStepComponent }
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, IgxRippleDirective, NgTemplateOutlet]
})
export class IgxStepComponent extends ToggleAnimationPlayer implements IgxStep, AfterViewInit, OnDestroy, IgxSlideComponentBase {
    public stepper = inject<IgxStepper>(IGX_STEPPER_COMPONENT);
    public cdr = inject(ChangeDetectorRef);
    public renderer = inject(Renderer2);
    protected platform = inject(PlatformUtil);
    protected stepperService = inject(IgxStepperService);
    private element = inject<ElementRef<HTMLElement>>(ElementRef);


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
    @HostBinding('class.igx-step--completed')
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
    public set optional(value: boolean) {
        this._optional = value;
        if (this.stepper.linear) {
            this.stepperService.calculateLinearDisabledSteps();
        }
    }

    public get optional(): boolean {
        return this._optional;
    }

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
        this._tabIndex.set(value);
    }

    public get tabIndex(): number {
        return this._tabIndex();
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
    @HostBinding('class.igx-step')
    public cssClass = true;

    /** @hidden @internal */
    @HostBinding('class.igx-step--vertical')
    public get isVertical(): boolean {
        return this.stepper.orientation === IgxStepperOrientation.Vertical;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-step--disabled')
    public get generalDisabled(): boolean {
        return this.disabled || this.linearDisabled;
    }

    /** @hidden @internal */
    @HostBinding('class')
    public get titlePositionTop(): string {
        if (this.stepper.stepType !== IgxStepType.Full) {
            return 'igx-step--simple';
        }

        return `igx-step--${this.titlePosition}`;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-step--current')
    public get isActive(): boolean {
        return this.active;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-step--invalid')
    public get isInvalid(): boolean {
        return !this.isValid
            && this.stepperService.visitedSteps.has(this)
            && !this.active
            && this.isAccessible;
    }

    /** @hidden @internal */
    public get stepHeaderClasses(): { [key: string]: boolean } {
        return {
            'igx-step-header--invalid': this.isInvalid,
            'igx-step-header--disabled': this.generalDisabled,
            'igx-step-header--current': this.active,
            'igx-step-header--completed': this.completed,
        };
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
    public contentTemplate!: TemplateRef<any>;

    /** @hidden @internal */
    @ViewChild('customIndicator', { static: true })
    public customIndicatorTemplate!: TemplateRef<any>;

    /** @hidden @internal */
    @ViewChild('contentContainer')
    public contentContainer!: ElementRef;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxStepIndicatorDirective))
    public indicator!: IgxStepIndicatorDirective;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxStepContentDirective))
    public content!: IgxStepContentDirective;

    /**
     * Get the step index inside of the stepper.
     *
     * ```typescript
     * const step = this.stepper.steps[1];
     * const stepIndex: number = step.index;
     * ```
     */
    public get index(): number {
        return this._index();
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

        return null!;
    }

    /** @hidden @internal */
    public get direction(): CarouselAnimationDirection {
        return this.stepperService.previousActiveStep
            && this.stepperService.previousActiveStep.index > this.index
            ? CarouselAnimationDirection.PREV
            : CarouselAnimationDirection.NEXT;
    }

    /** @hidden @internal */
    public get isAccessible(): boolean {
        return !this.generalDisabled;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-step--horizontal')
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
        return this.stepper.titlePosition || this.stepper._defaultTitlePosition;
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
    public get nativeElement(): HTMLElement {
        return this.element.nativeElement;
    }
    /** @hidden @internal */
    public previous!: boolean;
    /**
     * @hidden @internal
     * Signal-backed, like the tab index, so that the bindings reading it are refreshed
     * when it is set by the stepper after they were checked, e.g. in `ngAfterContentInit`.
     */
    public readonly _index = signal<number>(undefined!);
    private readonly _tabIndex = signal(-1);
    private _valid = true;
    private _focused = false;
    private _disabled = false;
    private _optional = false;

    /** @hidden @internal */
    @HostListener('focus')
    public onFocus(): void {
        this._focused = true;
        const activeStep = this.stepperService.activeStep;
        if (activeStep && this !== activeStep) {
            activeStep.tabIndex = -1;
        }
    }

    /** @hidden @internal */
    @HostListener('blur')
    public onBlur(): void {
        this._focused = false;
        const activeStep = this.stepperService.activeStep;
        if (activeStep) {
            activeStep.tabIndex = 0;
        }
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public handleKeydown(event: KeyboardEvent): void {
        if (!this._focused) {
            return;
        }
        const key = event.key;
        if (this.isHorizontal && (key === this.platform.KEYMAP.ARROW_UP || key === this.platform.KEYMAP.ARROW_DOWN)) {
            return;
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
        this.activate();
    }

    /** @hidden @internal */
    public handleNavigation(key: string): void {
        // the horizontal arrows follow the reading direction
        const reversed = this.isHorizontal && !isLeftToRight(this.nativeElement);

        switch (key) {
            case this.platform.KEYMAP.HOME:
                this.accessibleSteps[0]?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.END:
                this.accessibleSteps.at(-1)?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.ARROW_UP:
                this.previousStep?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.ARROW_DOWN:
                this.nextStep?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.ARROW_LEFT:
                (reversed ? this.nextStep : this.previousStep)?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.ARROW_RIGHT:
                (reversed ? this.previousStep : this.nextStep)?.nativeElement.focus();
                break;
            case this.platform.KEYMAP.SPACE:
            case this.platform.KEYMAP.ENTER:
                this.activate();
                break;
        }
    }

    /**
     * @hidden @internal
     * Activates the step, playing the animations for the current orientation.
     */
    public activate(): void {
        if (!this.stepperService.activeStep) {
            // there is no active step to animate from
            this.activateWithoutAnimation();
        } else if (this.isHorizontal) {
            this.changeHorizontalActiveStep();
        } else {
            this.changeVerticalActiveStep();
        }
    }

    private get accessibleSteps(): IgxStepComponent[] {
        return this.stepper.steps.filter(s => s.isAccessible);
    }

    /** The next accessible step, wrapping around to the first one */
    private get nextStep(): IgxStepComponent | undefined {
        const accessibleSteps = this.accessibleSteps;
        return accessibleSteps.find(s => s.index > this.index) ?? accessibleSteps[0];
    }

    /** The previous accessible step, wrapping around to the last one */
    private get previousStep(): IgxStepComponent | undefined {
        const accessibleSteps = this.accessibleSteps;
        return accessibleSteps.findLast(s => s.index < this.index) ?? accessibleSteps.at(-1);
    }

    private activateWithoutAnimation(): void {
        const argsCanceled = this.stepperService.emitActivatingEvent(this);
        if (argsCanceled) {
            return;
        }

        this.active = true;
        this.stepper.activeStepChanged.emit({ owner: this.stepper, index: this.index });
    }

    private changeHorizontalActiveStep(): void {
        if (this.stepper.animationType === HorizontalAnimationType.none && this.stepperService.activeStep !== this) {
            this.activateWithoutAnimation();
            return;
        }
        this.stepperService.expand(this);
        if (this.stepper.animationType === HorizontalAnimationType.fade) {
            if (this.stepperService.collapsingSteps.has(this.stepperService.previousActiveStep)) {
                this.stepperService.previousActiveStep.active = false;
            }
        }
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
