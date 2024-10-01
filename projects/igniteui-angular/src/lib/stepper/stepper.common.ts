import { ChangeDetectorRef, ElementRef, EventEmitter, InjectionToken, TemplateRef } from '@angular/core';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs } from '../core/utils';
import { IgxStepperComponent } from './stepper.component';
import { IgxStepComponent } from './step/step.component';
import {
    IgxStepActiveIndicatorDirective, IgxStepCompletedIndicatorDirective, IgxStepContentDirective,
    IgxStepIndicatorDirective, IgxStepInvalidIndicatorDirective
} from './stepper.directive';
import { Direction, IgxCarouselComponentBase } from '../carousel/carousel-base';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { CarouselAnimationType } from '../carousel/enums';

// Component interfaces
export interface IgxStepper extends IgxCarouselComponentBase {
    steps: IgxStepComponent[];
    /** @hidden @internal */
    nativeElement: HTMLElement;
    /** @hidden @internal */
    invalidIndicatorTemplate: TemplateRef<IgxStepInvalidIndicatorDirective>;
    /** @hidden @internal */
    completedIndicatorTemplate: TemplateRef<IgxStepCompletedIndicatorDirective>;
    /** @hidden @internal */
    activeIndicatorTemplate: TemplateRef<IgxStepActiveIndicatorDirective>;
    verticalAnimationType: VerticalAnimationType;
    horizontalAnimationType: HorizontalAnimationType;
    animationDuration: number;
    linear: boolean;
    orientation: IgxStepperOrientation;
    stepType: IgxStepType;
    contentTop: boolean;
    titlePosition: IgxStepperTitlePosition;
    /** @hidden @internal */
    verticalAnimationSettings: ToggleAnimationSettings;
    /** @hidden @internal */
    _defaultTitlePosition: IgxStepperTitlePosition;
    activeStepChanging: EventEmitter<IStepChangingEventArgs>;
    activeStepChanged: EventEmitter<IStepChangedEventArgs>;
    navigateTo(index: number): void;
    next(): void;
    prev(): void;
    reset(): void;
    /** @hidden @internal */
    playHorizontalAnimations(): void;
}

// Item interfaces
export interface IgxStep extends ToggleAnimationPlayer {
    id: string;
    /** @hidden @internal */
    contentTemplate: TemplateRef<any>;
    /** @hidden @internal */
    customIndicatorTemplate: TemplateRef<any>;
    /** @hidden @internal */
    contentContainer: ElementRef;
    /** @hidden @internal */
    indicator: IgxStepIndicatorDirective;
    /** @hidden @internal */
    content: IgxStepContentDirective;
    /** @hidden @internal */
    indicatorTemplate: TemplateRef<any>;
    index: number;
    disabled: boolean;
    completed: boolean;
    isValid: boolean;
    optional: boolean;
    active: boolean;
    tabIndex: number;
    /** @hidden @internal */
    contentId: string;
    /** @hidden @internal */
    generalDisabled: boolean;
    /** @hidden @internal */
    titlePositionTop: string;
    /** @hidden @internal */
    direction: Direction;
    /** @hidden @internal */
    isAccessible: boolean;
    /** @hidden @internal */
    isHorizontal: boolean;
    /** @hidden @internal */
    isTitleVisible: boolean;
    /** @hidden @internal */
    isIndicatorVisible: boolean;
    /** @hidden @internal */
    titlePosition: string;
    /** @hidden @internal */
    linearDisabled: boolean;
    /** @hidden @internal */
    collapsing: boolean;
    /** @hidden @internal */
    animationSettings: ToggleAnimationSettings;
    /** @hidden @internal */
    contentClasses: any;
    /** @hidden @internal */
    stepHeaderClasses: any;
    /** @hidden @internal */
    nativeElement: HTMLElement;
    /** @hidden @internal */
    previous: boolean;
    cdr: ChangeDetectorRef;
    activeChange: EventEmitter<boolean>;
}

// Events
export interface IStepChangingEventArgs extends IBaseEventArgs, IBaseCancelableBrowserEventArgs {
    newIndex: number;
    oldIndex: number;
    owner: IgxStepper;
}

export interface IStepChangedEventArgs extends IBaseEventArgs {
    // Provides the index of the current active step within the stepper steps
    index: number;
    owner: IgxStepper;
}

// Enums
export const IgxStepperOrientation = {
    Horizontal: 'horizontal',
    Vertical: 'vertical'
} as const;
export type IgxStepperOrientation = (typeof IgxStepperOrientation)[keyof typeof IgxStepperOrientation];

export const IgxStepType = {
    Indicator: 'indicator',
    Title: 'title',
    Full: 'full'
} as const;
export type IgxStepType = (typeof IgxStepType)[keyof typeof IgxStepType];

export const IgxStepperTitlePosition = {
    Bottom: 'bottom',
    Top: 'top',
    End: 'end',
    Start: 'start'
} as const;
export type IgxStepperTitlePosition = (typeof IgxStepperTitlePosition)[keyof typeof IgxStepperTitlePosition];

export const VerticalAnimationType = {
    Grow: 'grow',
    Fade: 'fade',
    None: 'none'
} as const;
export type VerticalAnimationType = (typeof VerticalAnimationType)[keyof typeof VerticalAnimationType];

export const HorizontalAnimationType = {
    ...CarouselAnimationType
} as const;
export type HorizontalAnimationType = (typeof HorizontalAnimationType)[keyof typeof HorizontalAnimationType];

// Token
export const IGX_STEPPER_COMPONENT = /*@__PURE__*/new InjectionToken<IgxStepperComponent>('IgxStepperToken');
export const IGX_STEP_COMPONENT = /*@__PURE__*/new InjectionToken<IgxStepComponent>('IgxStepToken');
