import { AnimationBuilder } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { config as rxjsConfig, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxInputDirective, IgxInputGroupComponent } from '../../../input-group/src/public_api';
import { IgxAngularAnimationService, PlatformUtil } from 'igniteui-angular/core';
import { UIInteractions, nextFrame, wait } from '../../../test-utils/ui-interactions.spec';
import { IgxStepComponent } from './step/step.component';
import { HorizontalAnimationType, IGX_STEPPER_COMPONENT, IgxStepperOrientation, IgxStepperTitlePosition, IgxStepType, IStepChangedEventArgs, IStepChangingEventArgs, VerticalAnimationType } from './stepper.common';
import { IgxStepperComponent } from './stepper.component';
import { IgxStepActiveIndicatorDirective, IgxStepCompletedIndicatorDirective, IgxStepContentDirective, IgxStepIndicatorDirective, IgxStepInvalidIndicatorDirective, IgxStepSubtitleDirective, IgxStepTitleDirective } from './stepper.directive';
import { IgxStepperService } from './stepper.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const STEPPER_CLASS = 'igx-stepper';
const STEPPER_HEADER = 'igx-stepper__header';
const STEPPER_BODY = 'igx-stepper__body';
const STEP_TAG = 'IGX-STEP';
const STEP_INDICATOR_CLASS = 'igx-step__indicator';
const STEP_TITLE_CLASS = 'igx-step__title';
const STEP_SUBTITLE_CLASS = 'igx-step__subtitle';
const INVALID_CLASS = 'igx-step--invalid';
const DISABLED_CLASS = 'igx-step--disabled';
const COMPLETED_CLASS = 'igx-step--completed';
const CURRENT_CLASS = 'igx-step--current';

const getHeaderElements = (stepper: IgxStepperComponent, stepIndex: number): Map<string, any> => {
    const elementsMap = new Map<string, any>();
    elementsMap.set('indicator', stepper.steps[stepIndex].nativeElement.querySelector(`div.${STEP_INDICATOR_CLASS}`));
    elementsMap.set('title', stepper.steps[stepIndex].nativeElement.querySelector(`.${STEP_TITLE_CLASS}`));
    elementsMap.set('subtitle', stepper.steps[stepIndex].nativeElement.querySelector(`.${STEP_SUBTITLE_CLASS}`));
    return elementsMap;
};

const getStepperPositions = (): string[] => {
    const positions = [];
    Object.values(IgxStepperTitlePosition).forEach((position: IgxStepperTitlePosition) => {
        positions.push(position);
    });
    return positions;
};

const testAnimationBehavior = async (val: any, fix: ComponentFixture<IgxStepperSampleTestComponent>, isHorAnimTypeInvalidTest: boolean): Promise<void> => {
    const stepper = fix.componentInstance.stepper;
    stepper.steps[0].active = true;
    fix.detectChanges();
    const previousActiveStep = stepper.steps[0];
    const activeChangeSpy = vi.spyOn(previousActiveStep.activeChange, 'emit');
    activeChangeSpy.mockClear();
    stepper.next();
    fix.detectChanges();
    // the previous step is collapsed when its leave animation is done
    if (!isHorAnimTypeInvalidTest) {
        await vi.waitFor(() => expect(previousActiveStep.activeChange.emit, val).toHaveBeenCalledTimes(1));
        expect(previousActiveStep.activeChange.emit, val).toHaveBeenCalledWith(false);
    } else {
        await nextFrame();
        expect(previousActiveStep.activeChange.emit, val).not.toHaveBeenCalled();
    }
    activeChangeSpy.mockClear();
};

describe('Rendering Tests', () => {
    let fix: ComponentFixture<IgxStepperSampleTestComponent>;
    let stepper: IgxStepperComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxStepperSampleTestComponent,
                IgxStepperLinearComponent,
                IgxStepperIndicatorNoShrinkComponent
            ]
        }).compileComponents();
    });
    beforeEach(() => {
        fix = TestBed.createComponent(IgxStepperSampleTestComponent);
        fix.detectChanges();
        stepper = fix.componentInstance.stepper;
    });

    describe('General', () => {
        it('should render a stepper containing a sequence of steps', () => {
            const stepperElement: HTMLElement = fix.debugElement.queryAll(By.css(`${STEPPER_CLASS}`))[0].nativeElement;
            const stepperHeader = stepperElement.querySelector(`.${STEPPER_HEADER}`);
            const steps = Array.from(stepperHeader.children);
            expect(steps.length).toBe(5);
            for (const step of steps) {
                expect(step.tagName === STEP_TAG).toBeTruthy();
            }
        });

        it('should not allow activating a step with next/prev methods when disabled is set to true', async () => {
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');
            const serviceCollapseSpy = vi.spyOn((stepper as any).stepperService, 'collapse');
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.steps[0].active = true;
            stepper.steps[1].disabled = true;
            fix.detectChanges();
            await fix.whenStable();

            expect(stepper.steps[1].nativeElement.classList.contains('igx-step--disabled')).toBe(true);

            stepper.next();
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[2].isAccessible).toBeTruthy();
            expect(stepper.steps[2].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandSpy).toHaveBeenCalledWith(stepper.steps[2]);
            expect(serviceCollapseSpy).toHaveBeenCalledTimes(1);
            expect(serviceCollapseSpy).toHaveBeenCalledWith(stepper.steps[0]);

            serviceExpandSpy.mockClear();
            serviceCollapseSpy.mockClear();

            stepper.orientation = IgxStepperOrientation.Vertical;
            stepper.steps[0].active = true;
            stepper.steps[1].disabled = true;
            fix.detectChanges();
            await fix.whenStable();

            stepper.next();
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[2].isAccessible).toBeTruthy();
            expect(stepper.steps[2].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandSpy).toHaveBeenCalledWith(stepper.steps[2]);
            expect(serviceCollapseSpy).toHaveBeenCalledTimes(1);
            expect(serviceCollapseSpy).toHaveBeenCalledWith(stepper.steps[0]);
        });

        it('should calculate disabled steps properly when the stepper is initially in linear mode', async () => {
            const fixture = TestBed.createComponent(IgxStepperLinearComponent);
            fixture.detectChanges();
            const linearStepper = fixture.componentInstance.stepper;

            const serviceExpandSpy = vi.spyOn((linearStepper as any).stepperService, 'expand');
            linearStepper.next();
            fixture.detectChanges();

            expect(linearStepper.steps[1].active).toBeFalsy();
            expect(linearStepper.steps[0].active).toBeTruthy();
            expect(linearStepper.steps[1].linearDisabled).toBeTruthy();
            expect(serviceExpandSpy).not.toHaveBeenCalled();
        });

        it('should not allow moving forward to next step in linear mode if the previous step is invalid', async () => {
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.linear = true;
            stepper.steps[0].isValid = false;
            fix.detectChanges();

            stepper.next();
            fix.detectChanges();
            await fix.whenStable();

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[0].active).toBeTruthy();
            expect(stepper.steps[1].linearDisabled).toBeTruthy();
            expect(stepper.steps[2].linearDisabled).toBeTruthy();
            expect(serviceExpandSpy).not.toHaveBeenCalled();

            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            stepper.next();
            fix.detectChanges();
            await fix.whenStable();

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[0].active).toBeTruthy();
            expect(stepper.steps[1].linearDisabled).toBeTruthy();
            expect(serviceExpandSpy).not.toHaveBeenCalled();

            // if the step after the active and valid step is disabled,
            // the following accessible one should not be linear disabled
            stepper.steps[0].isValid = true;
            fix.detectChanges();
            expect(stepper.steps[1].linearDisabled).toBeFalsy();

            stepper.steps[1].disabled = true;
            stepper.steps[1].isValid = false;
            fix.detectChanges();

            expect(stepper.steps[1].linearDisabled).toBeFalsy();
            expect(stepper.steps[2].isAccessible).toBeTruthy();
            expect(stepper.steps[2].linearDisabled).toBeFalsy();
            expect(stepper.steps[2].isValid).toBeTruthy();

            // in case the disabled step ([1]) becomes enabled and invalid,
            // the following step becomes linear disabled
            stepper.steps[1].disabled = false;
            fix.detectChanges();

            expect(stepper.steps[2].linearDisabled).toBeTruthy();

            stepper.steps[1].isValid = true;
            fix.detectChanges();

            expect(stepper.steps[2].linearDisabled).toBeFalsy();
        });

        it('should emit ing and ed events when a step is activated', async () => {
            const changingSpy = vi.spyOn(stepper.activeStepChanging, 'emit');
            const changedSpy = vi.spyOn(stepper.activeStepChanged, 'emit');
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');
            const serviceCollapseSpy = vi.spyOn((stepper as any).stepperService, 'collapse');

            expect(changingSpy).not.toHaveBeenCalled();
            expect(changedSpy).not.toHaveBeenCalled();

            const argsIng: IStepChangingEventArgs = {
                newIndex: stepper.steps[1].index,
                oldIndex: stepper.steps[0].index,
                owner: stepper,
                cancel: false
            };
            const argsEd: IStepChangedEventArgs = {
                index: stepper.steps[1].index,
                owner: stepper,
            };

            const testValues = [null, undefined, [], {}, 'sampleString'];

            for (const val of testValues) {
                stepper.navigateTo(val as any);
                fix.detectChanges();
                expect(changingSpy).not.toHaveBeenCalled();
                expect(changedSpy).not.toHaveBeenCalled();
                expect(serviceExpandSpy).not.toHaveBeenCalled();
                expect(serviceCollapseSpy).not.toHaveBeenCalled();
            }

            stepper.navigateTo(1);
            fix.detectChanges();
            await fix.whenStable();

            expect(stepper.steps[1].active).toBeTruthy();
            expect(changingSpy).toHaveBeenCalledTimes(1);
            expect(changingSpy).toHaveBeenCalledWith(argsIng);
            expect(changedSpy).toHaveBeenCalledTimes(1);
            expect(changedSpy).toHaveBeenCalledWith(argsEd);
            expect(serviceExpandSpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandSpy).toHaveBeenCalledWith(stepper.steps[1]);
            expect(serviceCollapseSpy).toHaveBeenCalledTimes(1);
            expect(serviceCollapseSpy).toHaveBeenCalledWith(stepper.steps[0]);
        });

        it('should be able to cancel the activeStepChanging event', async () => {
            const changingSpy = vi.spyOn(stepper.activeStepChanging, 'emit');
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');
            const serviceCollapseSpy = vi.spyOn((stepper as any).stepperService, 'collapse');

            expect(changingSpy).not.toHaveBeenCalled();

            const argsIng: IStepChangingEventArgs = {
                newIndex: stepper.steps[1].index,
                oldIndex: stepper.steps[0].index,
                owner: stepper,
                cancel: true
            };

            stepper.activeStepChanging.pipe(take(1)).subscribe(e => {
                e.cancel = true;
            });

            stepper.navigateTo(1);
            fix.detectChanges();
            await fix.whenStable();

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[0].active).toBeTruthy();
            expect(changingSpy).toHaveBeenCalledTimes(1);
            expect(changingSpy).toHaveBeenCalledWith(argsIng);
            expect(serviceExpandSpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandSpy).toHaveBeenCalledWith(stepper.steps[1]);
            expect(serviceCollapseSpy).not.toHaveBeenCalled();
        });

        it('a step should emit activeChange event when its active property changes', async () => {
            const fourthActiveChangeSpy = vi.spyOn(stepper.steps[3].activeChange, 'emit');
            const fifthActiveChangeSpy = vi.spyOn(stepper.steps[4].activeChange, 'emit');
            const serviceExpandAPISpy = vi.spyOn((stepper as any).stepperService, 'expandThroughApi');

            expect(fourthActiveChangeSpy).not.toHaveBeenCalled();
            expect(fifthActiveChangeSpy).not.toHaveBeenCalled();

            stepper.steps[0].active = true;
            fix.detectChanges();
            expect(serviceExpandAPISpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandAPISpy).toHaveBeenCalledWith(stepper.steps[0]);

            stepper.steps[3].active = true;
            fix.detectChanges();
            await fix.whenStable();

            expect(stepper.steps[3].active).toBeTruthy();
            expect(stepper.steps[3].activeChange.emit).toHaveBeenCalledTimes(1);
            expect(stepper.steps[3].activeChange.emit).toHaveBeenCalledWith(true);
            expect(fifthActiveChangeSpy).not.toHaveBeenCalled();
            expect(vi.mocked(serviceExpandAPISpy).mock.lastCall[0]).toBe(stepper.steps[3]);

            fourthActiveChangeSpy.mockClear();
            serviceExpandAPISpy.mockClear();

            stepper.steps[4].active = true;
            fix.detectChanges();
            await fix.whenStable();

            expect(stepper.steps[4].active).toBeTruthy();
            expect(stepper.steps[3].active).toBeFalsy();
            expect(fifthActiveChangeSpy).toHaveBeenCalledTimes(1);
            expect(fifthActiveChangeSpy).toHaveBeenCalledWith(true);
            expect(fourthActiveChangeSpy).toHaveBeenCalledTimes(1);
            expect(fourthActiveChangeSpy).toHaveBeenCalledWith(false);
            expect(serviceExpandAPISpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandAPISpy).toHaveBeenCalledWith(stepper.steps[4]);
        });

        it('should activate the previous accessible step with the prev method', async () => {
            for (const orientation of [IgxStepperOrientation.Horizontal, IgxStepperOrientation.Vertical]) {
                stepper.orientation = orientation;
                stepper.steps[2].disabled = false;
                stepper.steps[3].active = true;
                fix.detectChanges();
                await fix.whenStable();

                stepper.steps[2].disabled = true;
                fix.detectChanges();

                stepper.prev();
                fix.detectChanges();
                await nextFrame();

                expect(stepper.steps[1].active, orientation).toBeTruthy();
                expect(stepper.steps[2].active, orientation).toBeFalsy();

                stepper.prev();
                fix.detectChanges();
                await nextFrame();

                expect(stepper.steps[0].active, orientation).toBeTruthy();

                // there is no previous step to activate
                stepper.prev();
                fix.detectChanges();
                await nextFrame();

                expect(stepper.steps[0].active, orientation).toBeTruthy();
            }
        });

        it('should not change the active step with the next method when the last step is active', async () => {
            stepper.steps[4].active = true;
            fix.detectChanges();
            const changingSpy = vi.spyOn(stepper.activeStepChanging, 'emit');

            stepper.next();
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[4].active).toBeTruthy();
            expect(changingSpy).not.toHaveBeenCalled();
        });

        it('should not deactivate the active step when its active property is set to false', () => {
            const activeChangeSpy = vi.spyOn(stepper.steps[0].activeChange, 'emit');

            stepper.steps[0].active = false;
            fix.detectChanges();

            expect(stepper.steps[0].active).toBeTruthy();
            expect(stepper.steps[0].nativeElement.classList.contains(CURRENT_CLASS)).toBe(true);
            expect(activeChangeSpy).not.toHaveBeenCalled();
        });

        it('should move the tabIndex to the active step when it is changed with next, prev and navigateTo', async () => {
            const verifyTabIndex = (activeIndex: number) => {
                stepper.steps.forEach((step, index) => {
                    const expected = index === activeIndex ? 0 : -1;
                    expect(step.tabIndex, `step ${index}`).toBe(expected);
                    expect(step.nativeElement.getAttribute('tabindex'), `step ${index}`).toBe(`${expected}`);
                });
            };

            for (const orientation of [IgxStepperOrientation.Horizontal, IgxStepperOrientation.Vertical]) {
                stepper.orientation = orientation;
                stepper.steps[0].active = true;
                fix.detectChanges();
                await nextFrame();
                verifyTabIndex(0);

                stepper.next();
                fix.detectChanges();
                await nextFrame();
                verifyTabIndex(1);

                stepper.navigateTo(3);
                fix.detectChanges();
                await nextFrame();
                verifyTabIndex(3);

                stepper.prev();
                fix.detectChanges();
                await nextFrame();
                verifyTabIndex(2);
            }
        });

        it('should emit activeChange(false) once for a collapsing step when the animation type changes before the animation ends', async () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();
            const activeChangeSpy = vi.spyOn(stepper.steps[0].activeChange, 'emit');
            const leaveAnimationDone = firstValueFrom(stepper.leaveAnimationDone);

            stepper.next();
            fix.detectChanges();
            stepper.horizontalAnimationType = HorizontalAnimationType.fade;
            fix.detectChanges();
            // the step is not collapsed again when its leave animation ends
            await leaveAnimationDone;
            fix.detectChanges();

            expect(activeChangeSpy).toHaveBeenCalledTimes(1);
            expect(activeChangeSpy).toHaveBeenCalledWith(false);
            expect(stepper.steps[0].collapsing).toBe(false);
            expect(stepper.steps[0].contentContainer.nativeElement.querySelector('.sample-body')).toBeNull();
        });

        it('should collapse all previously active steps when navigating while the animations are running', async () => {
            const stepperService: IgxStepperService = (stepper as any).stepperService;
            const firstStepSpy = vi.spyOn(stepper.steps[0].activeChange, 'emit');
            const secondStepSpy = vi.spyOn(stepper.steps[1].activeChange, 'emit');

            // the second navigation starts before the animations of the first one end
            stepper.next();
            stepper.next();
            fix.detectChanges();

            expect(stepper.steps[2].active).toBe(true);
            await vi.waitFor(() => expect(stepperService.collapsingSteps.size).toBe(0));

            expect(firstStepSpy).toHaveBeenCalledTimes(1);
            expect(firstStepSpy).toHaveBeenCalledWith(false);
            expect(secondStepSpy).toHaveBeenCalledTimes(2);
            expect(secondStepSpy.mock.lastCall[0]).toBe(false);
        });

        it('should not collapse the active step when the activation of a step is canceled and horizontalAnimationType is "fade"', async () => {
            fix.componentInstance.horizontalAnimationType = HorizontalAnimationType.fade;
            fix.detectChanges();
            const activeChangeSpy = vi.spyOn(stepper.steps[0].activeChange, 'emit');
            stepper.activeStepChanging.pipe(take(1)).subscribe(e => e.cancel = true);

            stepper.navigateTo(1);
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[0].active).toBe(true);
            expect(stepper.steps[1].active).toBe(false);
            expect(activeChangeSpy).not.toHaveBeenCalled();
        });

        it('should emit activeStepChanged only when the open animation of the active step ends', () => {
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();
            const changedSpy = vi.spyOn(stepper.activeStepChanged, 'emit');

            // e.g. the step was deactivated again before its open animation ended
            stepper.steps[1].openAnimationDone.emit();

            expect(changedSpy).not.toHaveBeenCalled();

            stepper.steps[0].openAnimationDone.emit();

            expect(changedSpy).toHaveBeenCalledTimes(1);
            expect(changedSpy).toHaveBeenCalledWith({ owner: stepper, index: 0 });
        });

        it('should not disable the steps after an invalid active step in linear mode when it is optional or disabled', () => {
            stepper.linear = true;
            stepper.steps[0].optional = true;
            stepper.steps[0].isValid = false;
            fix.detectChanges();

            for (let i = 1; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled, `optional, step ${i}`).toBe(false);
            }

            stepper.steps[0].optional = false;
            stepper.steps[0].disabled = true;
            fix.detectChanges();

            for (let i = 1; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled, `disabled, step ${i}`).toBe(false);
            }

            // a required invalid step after the optional active one still disables the steps after it
            stepper.steps[0].disabled = false;
            stepper.steps[0].optional = true;
            stepper.steps[2].isValid = false;
            fix.detectChanges();

            expect(stepper.steps[1].linearDisabled).toBe(false);
            expect(stepper.steps[2].linearDisabled).toBe(false);
            expect(stepper.steps[3].linearDisabled).toBe(true);
            expect(stepper.steps[4].linearDisabled).toBe(true);
        });

        it('should update the linear disabled steps when the optional state of a step changes', () => {
            stepper.linear = true;
            stepper.steps[1].isValid = false;
            fix.detectChanges();

            for (let i = 2; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled, `required, step ${i}`).toBe(true);
            }

            stepper.steps[1].optional = true;
            fix.detectChanges();

            expect(stepper.steps[1].optional).toBe(true);
            for (let i = 2; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled, `optional, step ${i}`).toBe(false);
                expect(stepper.steps[i].nativeElement.classList.contains(DISABLED_CLASS), `optional, step ${i}`).toBe(false);
            }

            stepper.steps[1].optional = false;
            fix.detectChanges();

            for (let i = 2; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled, `required again, step ${i}`).toBe(true);
            }
        });

        it('should keep the steps after the first invalid step disabled when navigating past it with navigateTo', async () => {
            const verifyLinearDisabled = (disabledIndexes: number[], context: string) => {
                for (const step of stepper.steps) {
                    const disabled = disabledIndexes.includes(step.index);
                    expect(step.linearDisabled, `${context}, step ${step.index}`).toBe(disabled);
                    expect(step.isAccessible, `${context}, step ${step.index}`).toBe(!disabled);
                }
            };

            stepper.linear = true;
            stepper.steps[0].isValid = false;
            fix.detectChanges();

            verifyLinearDisabled([1, 2, 3, 4], 'initial');

            // the API can activate a linear disabled step, which is not displayed as disabled
            stepper.navigateTo(3);
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[3].active).toBe(true);
            expect(stepper.steps[3].nativeElement.classList.contains(DISABLED_CLASS)).toBe(false);
            // the steps between the invalid and the active step stay unreachable
            verifyLinearDisabled([1, 2, 4], 'after navigateTo');
            expect(stepper.steps[1].nativeElement.classList.contains(DISABLED_CLASS)).toBe(true);
            expect(stepper.steps[2].nativeElement.classList.contains(DISABLED_CLASS)).toBe(true);

            // the only previous step that can be reached is the invalid one
            stepper.prev();
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[0].active).toBe(true);
            verifyLinearDisabled([1, 2, 3, 4], 'after prev');

            stepper.steps[0].isValid = true;
            fix.detectChanges();

            verifyLinearDisabled([], 'all valid');
        });

        it('should disable the steps after a previous step that becomes invalid', async () => {
            stepper.linear = true;
            stepper.navigateTo(3);
            fix.detectChanges();
            await nextFrame();

            stepper.steps[1].isValid = false;
            fix.detectChanges();

            expect(stepper.steps[3].active).toBe(true);
            expect(stepper.steps[3].linearDisabled).toBe(false);
            expect(stepper.steps[0].linearDisabled).toBe(false);
            expect(stepper.steps[1].linearDisabled).toBe(false);
            expect(stepper.steps[2].linearDisabled).toBe(true);
            expect(stepper.steps[4].linearDisabled).toBe(true);

            stepper.steps[1].isValid = true;
            fix.detectChanges();

            for (const step of stepper.steps) {
                expect(step.linearDisabled, `step ${step.index}`).toBe(false);
            }
        });

        it('should keep the active step visited when the stepper is reset', async () => {
            const stepperService: IgxStepperService = (stepper as any).stepperService;
            stepper.steps[0].isValid = false;
            stepper.steps[1].active = true;
            stepper.steps[0].active = true;
            fix.detectChanges();

            stepper.reset();
            fix.detectChanges();

            expect(stepper.steps[0].active).toBe(true);
            expect(stepperService.visitedSteps.size).toBe(1);
            expect(stepperService.visitedSteps).toContain(stepper.steps[0]);

            stepper.next();
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[0].nativeElement.classList.contains(INVALID_CLASS)).toBe(true);
        });

        it('should get and set the vertical and horizontal animation types', () => {
            expect(stepper.verticalAnimationType).toBe(VerticalAnimationType.Grow);
            expect(stepper.horizontalAnimationType).toBe(HorizontalAnimationType.slide);

            fix.componentInstance.verticalAnimationType = VerticalAnimationType.Fade;
            fix.componentInstance.horizontalAnimationType = HorizontalAnimationType.fade;
            fix.detectChanges();

            expect(stepper.verticalAnimationType).toBe(VerticalAnimationType.Fade);
            expect(stepper.horizontalAnimationType).toBe(HorizontalAnimationType.fade);
            expect(stepper.verticalAnimationSettings.openAnimation).toBeTruthy();
            expect(stepper.verticalAnimationSettings.closeAnimation).toBeNull();

            fix.componentInstance.verticalAnimationType = VerticalAnimationType.None;
            fix.detectChanges();

            expect(stepper.verticalAnimationSettings.openAnimation).toBeNull();
            expect(stepper.verticalAnimationSettings.closeAnimation).toBeNull();
        });

        it('should activate a step and emit activeStepChanged without animations when horizontalAnimationType is "none"', () => {
            fix.componentInstance.horizontalAnimationType = HorizontalAnimationType.none;
            fix.detectChanges();
            const changedSpy = vi.spyOn(stepper.activeStepChanged, 'emit');
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');

            stepper.navigateTo(1);
            fix.detectChanges();

            expect(stepper.steps[1].active).toBeTruthy();
            expect(changedSpy).toHaveBeenCalledTimes(1);
            expect(changedSpy).toHaveBeenCalledWith({ owner: stepper, index: 1 });
            expect(serviceExpandSpy).not.toHaveBeenCalled();

            changedSpy.mockClear();
            stepper.activeStepChanging.pipe(take(1)).subscribe(e => e.cancel = true);

            stepper.navigateTo(2);
            fix.detectChanges();

            expect(stepper.steps[1].active).toBeTruthy();
            expect(stepper.steps[2].active).toBeFalsy();
            expect(changedSpy).not.toHaveBeenCalled();
        });
    });

    describe('Appearance', () => {
        it('should apply the appropriate class to a stepper in horizontal mode', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            expect(stepper.nativeElement.classList.contains('igx-stepper--horizontal')).toBe(true);

            // no css class is applied when the stepper is in vertical mode
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            expect(stepper.nativeElement.classList.contains('igx-stepper--horizontal')).toBe(false);
            for (const step of stepper.steps) {
                expect(step.nativeElement.classList.contains('igx-step--vertical')).toBe(true);
                expect(step.nativeElement.classList.contains('igx-step--horizontal')).toBe(false);
            }
        });

        it('should restore the default title position when the orientation changes back to horizontal', () => {
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            expect(stepper._defaultTitlePosition).toBe(IgxStepperTitlePosition.End);

            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            expect(stepper._defaultTitlePosition).toBe(IgxStepperTitlePosition.Bottom);
            for (const step of stepper.steps) {
                expect(step.nativeElement.classList.contains(`igx-step--${IgxStepperTitlePosition.Bottom}`)).toBe(true);
            }
        });

        it('should apply the simple class to the steps when stepType is not "full"', () => {
            for (const type of [IgxStepType.Indicator, IgxStepType.Title]) {
                stepper.stepType = type;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement.classList.contains('igx-step--simple'), type).toBe(true);
                }
            }
        });

        it('should allow setting the tabIndex of the step content', () => {
            const content = stepper.steps[0].content;
            const contentElement = content.elementRef.nativeElement;

            expect(contentElement.getAttribute('tabindex')).toBe('0');

            content.tabIndex = -1;
            fix.detectChanges();

            expect(content.tabIndex).toBe(-1);
            expect(contentElement.getAttribute('tabindex')).toBe('-1');
        });

        it('should indicate the currently active step', () => {
            const step0 = stepper.steps[0].nativeElement;
            const step1 = stepper.steps[1].nativeElement;
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');

            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(step0.classList.contains(CURRENT_CLASS)).toBe(true);

            stepper.steps[1].active = true;
            stepper.steps[1].nativeElement.focus();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem(' ', stepper.steps[1].nativeElement);
            fix.detectChanges();

            expect(step0.classList.contains(CURRENT_CLASS)).toBe(false);
            expect(step1.classList.contains(CURRENT_CLASS)).toBe(true);
            expect(serviceExpandSpy).toHaveBeenCalledExactlyOnceWith(stepper.steps[1]);
        });

        it('should indicate that a step is completed', () => {
            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(stepper.steps[0].completed).toBeFalsy();
            expect(stepper.steps[0].nativeElement.classList.contains(COMPLETED_CLASS)).toBe(false);

            stepper.steps[0].completed = true;
            fix.detectChanges();

            expect(stepper.steps[0].nativeElement.classList.contains(COMPLETED_CLASS)).toBe(true);

            stepper.steps[1].completed = true;
            fix.detectChanges();

            expect(stepper.steps[1].nativeElement.classList.contains(COMPLETED_CLASS)).toBe(true);
        });

        it('should indicate that a step is invalid', () => {
            const step0Header = stepper.steps[0].nativeElement;
            stepper.steps[0].isValid = true;
            fix.detectChanges();

            expect(step0Header.classList.contains(INVALID_CLASS)).toBe(false);

            stepper.steps[0].isValid = false;
            fix.detectChanges();

            expect(step0Header.classList.contains(INVALID_CLASS)).toBe(false);

            stepper.steps[1].active = true;
            fix.detectChanges();

            expect(step0Header.classList.contains(INVALID_CLASS)).toBe(true);

            //indicate that a step is disabled without indicating that it is also invalid
            stepper.steps[0].disabled = true;
            fix.detectChanges();

            expect(step0Header.classList.contains(INVALID_CLASS)).toBe(false);
            expect(stepper.steps[0].nativeElement.classList.contains(DISABLED_CLASS)).toBe(true);
        });

        it('should render the visual step element according to the specified stepType', () => {
            stepper.stepType = IgxStepType.Full;
            fix.detectChanges();

            for (let i = 0; i < stepper.steps.length; i++) {
                const elementsMap = getHeaderElements(stepper, i);

                expect(elementsMap.get('indicator')).not.toBeNull();
                expect(stepper.steps[i].isIndicatorVisible).toBeTruthy();
                if (i === 3) {
                    expect(elementsMap.get('title')).toBeNull();
                    expect(elementsMap.get('subtitle')).toBeNull();
                    continue;
                }
                expect(elementsMap.get('title')).not.toBeNull();
                expect(elementsMap.get('subtitle')).not.toBeNull();
                expect(stepper.steps[i].isTitleVisible).toBeTruthy();
            }

            stepper.stepType = IgxStepType.Indicator;
            fix.detectChanges();

            for (let i = 0; i < stepper.steps.length; i++) {
                const elementsMap = getHeaderElements(stepper, i);

                expect(elementsMap.get('indicator')).not.toBeNull();
                expect(stepper.steps[i].isIndicatorVisible).toBeTruthy();
                expect(elementsMap.get('title')).toBeNull();
                expect(elementsMap.get('subtitle')).toBeNull();
                expect(stepper.steps[i].isTitleVisible).toBeFalsy();
            }

            stepper.stepType = IgxStepType.Title;
            fix.detectChanges();

            for (let i = 0; i < stepper.steps.length; i++) {
                const elementsMap = getHeaderElements(stepper, i);

                expect(elementsMap.get('indicator')).toBeNull();
                expect(stepper.steps[i].isIndicatorVisible).toBeFalsy();
                if (i === 3) {
                    expect(elementsMap.get('title')).toBeNull();
                    expect(elementsMap.get('subtitle')).toBeNull();
                    continue;
                }
                expect(elementsMap.get('title')).not.toBeNull();
                expect(elementsMap.get('subtitle')).not.toBeNull();
                expect(stepper.steps[i].isTitleVisible).toBeTruthy();
            }
        });

        it('should place the title in the step element according to the specified titlePosition when stepType is set to "full"', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.stepType = IgxStepType.Full;
            stepper.titlePosition = null;
            fix.detectChanges();

            //test default title positions
            for (const step of stepper.steps) {
                expect(step.titlePosition).toBe(stepper._defaultTitlePosition);
                expect(step.titlePosition).toBe(IgxStepperTitlePosition.Bottom);
                expect(step.nativeElement.classList.contains(`igx-step--${stepper._defaultTitlePosition}`)).toBe(true);
            }

            const positions = getStepperPositions();
            positions.forEach((pos: IgxStepperTitlePosition) => {
                stepper.titlePosition = pos;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement.classList.contains(`igx-step--${pos}`)).toBe(true);
                }
            });

            stepper.orientation = IgxStepperOrientation.Vertical;
            stepper.titlePosition = null;
            fix.detectChanges();

            //test default title positions
            for (const step of stepper.steps) {
                expect(step.titlePosition).toBe(stepper._defaultTitlePosition);
                expect(step.titlePosition).toBe(IgxStepperTitlePosition.End);
                expect(step.nativeElement.classList.contains(`igx-step--${stepper._defaultTitlePosition}`)).toBe(true);
            }

            positions.forEach((pos: IgxStepperTitlePosition) => {
                stepper.titlePosition = pos;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement.classList.contains(`igx-step--${pos}`)).toBe(true);
                }
            });
        });

        it('should indicate steps with a number when igxStepIndicator is not set and stepType is "indicator" or "full"', () => {
            stepper.stepType = IgxStepType.Full;
            fix.detectChanges();

            let indicatorElement5 = stepper.steps[4].nativeElement.querySelector(`div.${STEP_INDICATOR_CLASS}`);

            expect(stepper.steps[4].isIndicatorVisible).toBeTruthy();
            expect(indicatorElement5).not.toBeNull();
            expect(indicatorElement5.textContent).toBe((stepper.steps[4].index + 1).toString());

            stepper.stepType = IgxStepType.Indicator;
            fix.detectChanges();

            indicatorElement5 = stepper.steps[4].nativeElement.querySelector(`div.${STEP_INDICATOR_CLASS}`);

            expect(indicatorElement5).not.toBeNull();
            expect(indicatorElement5.textContent).toBe((stepper.steps[4].index + 1).toString());
        });

        it('should allow overriding the default invalid, completed and active indicators', () => {
            const step0 = stepper.steps[0].nativeElement;
            let indicatorElement = step0.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0.classList.contains(INVALID_CLASS)).toBe(false);
            expect(step0.classList.contains(CURRENT_CLASS)).toBe(true);
            expect(stepper.steps[0].nativeElement.classList.contains(COMPLETED_CLASS)).toBe(false);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('edit');

            stepper.steps[0].isValid = false;
            fix.detectChanges();
            stepper.steps[1].active = true;
            fix.detectChanges();

            indicatorElement = step0.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0.classList.contains(INVALID_CLASS)).toBe(true);
            expect(step0.classList.contains(CURRENT_CLASS)).toBe(false);
            expect(stepper.steps[0].nativeElement.classList.contains(COMPLETED_CLASS)).toBe(false);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('error');

            stepper.steps[0].isValid = true;
            stepper.steps[0].completed = true;
            fix.detectChanges();

            indicatorElement = step0.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0.classList.contains(INVALID_CLASS)).toBe(false);
            expect(step0.classList.contains(CURRENT_CLASS)).toBe(false);
            expect(stepper.steps[0].nativeElement.classList.contains(COMPLETED_CLASS)).toBe(true);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('check');
        });

        it('should be able to display the steps\' content above the steps headers when the stepper is horizontally orientated', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();
            expect(stepper.contentTop).toBeFalsy();

            expect(stepper.nativeElement.children[0].classList.contains(STEPPER_HEADER)).toBe(true);
            expect(stepper.nativeElement.children[1].classList.contains(STEPPER_BODY)).toBe(true);

            stepper.contentTop = true;
            fix.detectChanges();

            expect(stepper.nativeElement.children[0].classList.contains(STEPPER_BODY)).toBe(true);
            expect(stepper.nativeElement.children[1].classList.contains(STEPPER_HEADER)).toBe(true);
        });

        it('should allow modifying animationSettings that are used for transitioning between steps ', async () => {
            const numericTestValues = [100, 1000];

            for (const val of numericTestValues) {
                fix.componentInstance.animationDuration = val as any;
                await testAnimationBehavior(val, fix, false);
            }

            const fallbackToDefaultValues = [-1, 0, null, undefined, 'sampleString', [], {}];
            for (const val of fallbackToDefaultValues) {
                fix.componentInstance.animationDuration = val as any;
                fix.detectChanges();
                expect(stepper.animationDuration)
                    .toBe((stepper as any)._defaultAnimationDuration);
                await testAnimationBehavior(val, fix, false);
            }

            fix.componentInstance.animationDuration = 300;
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            const horAnimTypeValidValues = ['slide', 'fade', 'none'];
            for (const val of horAnimTypeValidValues) {
                fix.componentInstance.horizontalAnimationType = val as any;
                await testAnimationBehavior(val, fix, false);
            }

            const horAnimTypeTestValues = ['sampleString', null, undefined, 0, [], {}];
            for (const val of horAnimTypeTestValues) {
                fix.componentInstance.horizontalAnimationType = val as any;
                await testAnimationBehavior(val, fix, true);
            }

            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            const vertAnimTypeTestValues = ['fade', 'grow', 'none', 'sampleString', null, undefined, 0, [], {}];
            for (const val of vertAnimTypeTestValues) {
                fix.componentInstance.verticalAnimationType = val as any;
                await testAnimationBehavior(val, fix, false);
            }
        });

        it('should fall back to the default animation duration of 320ms for invalid values', () => {
            expect(stepper.animationDuration).toBe(300);

            for (const val of [-1, 0, null, undefined, 'sampleString']) {
                fix.componentInstance.animationDuration = val as any;
                fix.detectChanges();

                expect(stepper.animationDuration, `${val}`).toBe(320);
                expect((stepper.verticalAnimationSettings.openAnimation as any).options.params.duration, `${val}`).toBe('320ms');
                fix.componentInstance.animationDuration = 300;
                fix.detectChanges();
            }
        });

        it('should use the default animation duration of 320ms for the vertical animations', () => {
            const fixture = TestBed.createComponent(IgxStepperLinearComponent);
            fixture.detectChanges();
            const defaultStepper = fixture.componentInstance.stepper;

            expect(defaultStepper.animationDuration).toBe(320);
            expect((defaultStepper.verticalAnimationSettings.openAnimation as any).options.params.duration).toBe('320ms');
            expect((defaultStepper.verticalAnimationSettings.closeAnimation as any).options.params.duration).toBe('320ms');
        });

        it('should apply the animation duration to the vertical animations when it is set programmatically', () => {
            stepper.animationDuration = 500;

            expect((stepper.verticalAnimationSettings.openAnimation as any).options.params.duration).toBe('500ms');
            expect((stepper.verticalAnimationSettings.closeAnimation as any).options.params.duration).toBe('500ms');

            stepper.verticalAnimationType = VerticalAnimationType.Fade;
            stepper.animationDuration = 600;

            expect((stepper.verticalAnimationSettings.openAnimation as any).options.params.duration).toBe('600ms');
            expect(stepper.verticalAnimationSettings.closeAnimation).toBeNull();
        });

        it('should render dynamically added step and properly set the linear disabled steps with its addition', async () => {
            const stepsLength = stepper.steps.length;
            expect(stepsLength).toBe(5);

            fix.componentInstance.displayHiddenStep = true;
            fix.detectChanges();

            expect(stepper.steps.length).toBe(stepsLength + 1);

            const titleElement = stepper.steps[2].nativeElement.querySelector(`.${STEP_TITLE_CLASS}`);
            expect(titleElement.textContent).toBe('Hidden step');

            // should set the first accessible step as active when the active step is dynamically removed
            stepper.steps[2].active = true;
            fix.detectChanges();
            await nextFrame();
            fix.componentInstance.displayHiddenStep = false;
            fix.detectChanges();
            await nextFrame();

            let firstAccessibleStepIdx = stepper.steps.findIndex(step => step.isAccessible);
            expect(stepper.steps[firstAccessibleStepIdx].active).toBeTruthy();

            fix.componentInstance.displayHiddenStep = true;
            fix.detectChanges();
            await nextFrame();
            stepper.steps[2].active = true;
            stepper.steps[0].disabled = true;
            fix.detectChanges();
            await nextFrame();
            expect(stepper.steps[0].isAccessible).toBeFalsy();

            fix.componentInstance.displayHiddenStep = false;
            fix.detectChanges();
            await nextFrame();

            firstAccessibleStepIdx = stepper.steps.findIndex(step => step.isAccessible);
            expect(firstAccessibleStepIdx).toBe(1);
            expect(stepper.steps[firstAccessibleStepIdx].active).toBeTruthy();

            // if the dynamically added step's position is before the active step in linear mode,
            // it should not be linear disabled
            stepper.linear = true;
            stepper.steps[4].active = true;
            for (let index = 0; index <= 4; index++) {
                const step = stepper.steps[index];
                step.isValid = true;
            }
            fix.detectChanges();
            fix.componentInstance.displayHiddenStep = true;
            fix.detectChanges();

            for (let index = 0; index <= 5; index++) {
                const step = stepper.steps[index];
                expect(step.linearDisabled).toBeFalsy();
            }

            fix.componentInstance.displayHiddenStep = false;
            fix.detectChanges();

            // if the dynamically added step's position is after the active step in linear mode,
            // and the latter is not valid, the added step should be linear disabled
            stepper.steps[0].isValid = true;
            stepper.steps[1].isValid = false;
            stepper.steps[1].active = true;
            fix.detectChanges();
            fix.componentInstance.displayHiddenStep = true;
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[2].linearDisabled).toBeTruthy();

            for (let index = 3; index <= 5; index++) {
                const step = stepper.steps[index];
                expect(step.linearDisabled).toBeTruthy();
            }
        });

        it('should activate the first accessible step and clear the visited steps collection when the stepper is reset', async () => {
            // "visit" some steps
            stepper.steps[0].active = true;
            fix.detectChanges();
            stepper.steps[1].active = true;
            fix.detectChanges();
            stepper.steps[2].active = true;
            fix.detectChanges();

            expect((stepper as any).stepperService.visitedSteps.size).toBe(3);

            stepper.reset();
            fix.detectChanges();

            const firstAccessibleStepIdx = stepper.steps.findIndex(step => step.isAccessible);
            expect(stepper.steps[firstAccessibleStepIdx].active).toBeTruthy();

            expect((stepper as any).stepperService.visitedSteps.size).toBe(1);
            expect((stepper as any).stepperService.visitedSteps).toContain(stepper.steps[firstAccessibleStepIdx]);
        });

        it('should properly collapse the previously active step in horizontal orientation and animation type \'fade\'', async () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.horizontalAnimationType = 'fade';
            await testAnimationBehavior('fade', fix, false);
        });

        it('should not shrink the step indicator in vertical orientation when titlePosition="end" and the title is very long', async () => {
            const fixture = TestBed.createComponent(IgxStepperIndicatorNoShrinkComponent);
            fixture.detectChanges();
            await fixture.whenStable();

            const stepperInstance = fixture.componentInstance.stepper;
            const indicator = stepperInstance.steps[0].nativeElement.querySelector(`.${STEP_INDICATOR_CLASS}`) as HTMLElement;

            const { minWidth } = getComputedStyle(indicator);
            const { width, height } = indicator.getBoundingClientRect();

            expect(minWidth).not.toBe('0px');
            expect(minWidth).not.toBe('auto');
            expect(Math.abs(width - height)).toBeLessThan(1.5);
            expect(Math.abs(width - parseFloat(minWidth))).toBeLessThan(1.5);
        });

        it('should not shift step content horizontally when navigating between steps in vertical mode', async () => {
            const indicatorFix = TestBed.createComponent(IgxStepperIndicatorNoShrinkComponent);
            indicatorFix.detectChanges();
            const indicatorStepper = indicatorFix.componentInstance.stepper;

            const getContentWrapperStyles = (stepIndex: number) => {
                const contentWrapper = indicatorStepper.steps[stepIndex].nativeElement.querySelector('.igx-step__content-wrapper') as HTMLElement;
                const styles = window.getComputedStyle(contentWrapper);
                return {
                    paddingInlineStart: styles.paddingInlineStart || styles.paddingLeft,
                    marginInlineStart: styles.marginInlineStart || styles.marginLeft
                };
            };

            const step0ActiveStyles = getContentWrapperStyles(0);

            indicatorStepper.navigateTo(1);
            indicatorFix.detectChanges();

            const step0InactiveStyles = getContentWrapperStyles(0);

            expect(step0InactiveStyles.paddingInlineStart).toBe(step0ActiveStyles.paddingInlineStart);
            expect(step0InactiveStyles.marginInlineStart).toBe(step0ActiveStyles.marginInlineStart);
        });
    });

    describe('Keyboard navigation', () => {
        it('should navigate to first/last step on Home/End key press', async () => {
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');
            const serviceCollapseSpy = vi.spyOn((stepper as any).stepperService, 'collapse');

            stepper.steps[3].active = true;
            stepper.steps[3].nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(stepper.steps[3].nativeElement as Element);

            UIInteractions.triggerKeyDownEvtUponElem('Home', stepper.steps[3].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[0].nativeElement as Element).toBe(document.activeElement);
            expect(serviceExpandSpy).not.toHaveBeenCalled();
            expect(serviceCollapseSpy).not.toHaveBeenCalled();

            UIInteractions.triggerKeyDownEvtUponElem('End', stepper.steps[0].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[4].nativeElement as Element).toBe(document.activeElement);
            expect(serviceExpandSpy).not.toHaveBeenCalled();
            expect(serviceCollapseSpy).not.toHaveBeenCalled();
        });

        it('should activate the currently focused step on Enter/Space key press', async () => {
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');
            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(stepper.steps[3].active).toBeFalsy();

            stepper.steps[3].nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(stepper.steps[3].nativeElement as Element);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', stepper.steps[3].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[3].nativeElement as Element).toBe(document.activeElement);
            expect(stepper.steps[3].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandSpy).toHaveBeenCalledWith(stepper.steps[3]);

            stepper.steps[4].nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(stepper.steps[4].nativeElement as Element);
            expect(stepper.steps[4].active).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem(' ', stepper.steps[4].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[4].active).toBeTruthy();
            expect(vi.mocked(serviceExpandSpy).mock.lastCall[0]).toBe(stepper.steps[4]);
        });

        it('should navigate to the next/previous step in horizontal orientation on Arrow Right/Left key press', async () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(stepper.steps[1].active).toBeFalsy();

            stepper.steps[0].nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(stepper.steps[0].nativeElement as Element);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', stepper.steps[0].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[1].nativeElement as Element).toBe(document.activeElement);
            expect(stepper.steps[1].active).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', stepper.steps[1].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[0].nativeElement as Element).toBe(document.activeElement);
        });

        it('should navigate to the next/previous step in vertical orientation on Arrow Down/Up key press', async () => {
            stepper.orientation = IgxStepperOrientation.Vertical;
            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(stepper.steps[1].active).toBeFalsy();

            stepper.steps[0].nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(stepper.steps[0].nativeElement as Element);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', stepper.steps[0].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[1].nativeElement as Element).toBe(document.activeElement);
            expect(stepper.steps[1].active).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', stepper.steps[1].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[0].nativeElement as Element).toBe(document.activeElement);
        });

        it('should specify tabIndex="0" for the active step and tabIndex="-1" for the other steps', async () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.steps[0].active = true;
            fix.detectChanges();

            stepper.steps[0].nativeElement.focus();
            let stepContent = stepper.nativeElement.querySelector(`#${stepper.steps[0].id.replace('step', 'content')}`);

            expect(stepper.steps[0].tabIndex).toBe(0);
            expect(stepContent.getAttribute('tabIndex')).toBe('0');

            for (let i = 1; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].tabIndex).toBe(-1);
            }

            stepper.steps[1].active = true;
            fix.detectChanges();

            expect(stepContent.getAttribute('tabIndex')).toBe('-1');
            expect(stepper.steps[1].tabIndex).toBe(0);

            stepper.steps[1].nativeElement.focus();
            UIInteractions.triggerKeyDownEvtUponElem('Enter', stepper.steps[1].nativeElement);
            fix.detectChanges();

            stepContent = stepper.nativeElement.querySelector(`#${stepper.steps[1].id.replace('step', 'content')}`);
            expect(stepContent).not.toBeNull();
            expect(stepContent.getAttribute('tabIndex')).toBe('0');

            for (let i = 0; i < stepper.steps.length; i++) {
                if (i === 1) {
                    continue;
                }
                expect(stepper.steps[i].tabIndex).toBe(-1);
            }

            stepper.orientation = IgxStepperOrientation.Vertical;
            stepper.steps[0].active = true;
            fix.detectChanges();

            stepContent = stepper.nativeElement.querySelector(`#${stepper.steps[0].id.replace('step', 'content')}`);
            stepper.steps[0].nativeElement.focus();

            expect(stepper.steps[0].tabIndex).toBe(0);
            expect(stepContent).not.toBeNull();
            expect(stepContent.getAttribute('tabIndex')).toBe('0');

            for (let i = 1; i < stepper.steps.length; i++) {
                stepContent = stepper.nativeElement.querySelector(`#${stepper.steps[i].id.replace('step', 'content')}`);
                expect(stepper.steps[i].tabIndex).toBe(-1);
                expect(stepContent).toBeNull();
            }
        });

        it('should activate a step on header click in horizontal and vertical orientation', async () => {
            const serviceExpandSpy = vi.spyOn((stepper as any).stepperService, 'expand');
            const getHeader = (index: number) => stepper.steps[index].nativeElement.querySelector('.igx-step__header');

            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            UIInteractions.simulateClickEvent(getHeader(1));
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[1].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandSpy).toHaveBeenCalledWith(stepper.steps[1]);

            serviceExpandSpy.mockClear();
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            UIInteractions.simulateClickEvent(getHeader(2));
            fix.detectChanges();
            await nextFrame();

            expect(stepper.steps[2].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledTimes(1);
            expect(serviceExpandSpy).toHaveBeenCalledWith(stepper.steps[2]);
        });

        it('should activate the focused step on Enter key press in vertical orientation for every animation type', async () => {
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            const changedSpy = vi.spyOn(stepper.activeStepChanged, 'emit');
            const animationTypes = [VerticalAnimationType.Grow, VerticalAnimationType.Fade, VerticalAnimationType.None];
            for (const [i, type] of animationTypes.entries()) {
                fix.componentInstance.verticalAnimationType = type;
                fix.detectChanges();
                const stepElement = stepper.steps[i + 1].nativeElement;

                stepElement.focus();
                UIInteractions.triggerKeyDownEvtUponElem('Enter', stepElement);
                fix.detectChanges();

                expect(stepper.steps[i + 1].active, type).toBeTruthy();
                expect(stepper.steps[i].active, type).toBeFalsy();
                // activeStepChanged is emitted when the open animation is done
                await vi.waitFor(() => expect(changedSpy, type).toHaveBeenCalledTimes(1));
                expect(changedSpy, type).toHaveBeenCalledWith({ owner: stepper, index: i + 1 });
                changedSpy.mockClear();
            }
        });

        it('should not handle keyboard events that originate from the step content', async () => {
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            const input = stepper.steps[0].nativeElement.querySelector('input');
            input.focus();
            fix.detectChanges();

            for (const key of ['End', ' ', 'ArrowDown']) {
                const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                input.dispatchEvent(event);
                fix.detectChanges();

                expect(event.defaultPrevented, key).toBe(false);
                expect(document.activeElement, key).toBe(input);
            }
            expect(stepper.steps[0].active).toBeTruthy();
        });

        it('should ignore ArrowUp/ArrowDown in horizontal orientation and keys that are not used for navigation', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            const stepElement = stepper.steps[1].nativeElement;
            stepElement.focus();

            for (const key of ['ArrowUp', 'ArrowDown', 'a', 'Tab', 'Escape']) {
                const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                stepElement.dispatchEvent(event);
                fix.detectChanges();

                expect(event.defaultPrevented, key).toBe(false);
                expect(document.activeElement, key).toBe(stepElement);
            }
        });

        it('should wrap the focus around and skip the disabled steps on arrow key press', () => {
            for (const orientation of [IgxStepperOrientation.Horizontal, IgxStepperOrientation.Vertical]) {
                const [nextKey, prevKey] = orientation === IgxStepperOrientation.Horizontal ?
                    ['ArrowRight', 'ArrowLeft'] : ['ArrowDown', 'ArrowUp'];
                stepper.orientation = orientation;
                stepper.steps[0].disabled = false;
                stepper.steps[4].disabled = false;
                fix.detectChanges();

                stepper.steps[4].nativeElement.focus();
                UIInteractions.triggerKeyDownEvtUponElem(nextKey, stepper.steps[4].nativeElement);
                fix.detectChanges();
                expect(document.activeElement, orientation).toBe(stepper.steps[0].nativeElement);

                UIInteractions.triggerKeyDownEvtUponElem(prevKey, stepper.steps[0].nativeElement);
                fix.detectChanges();
                expect(document.activeElement, orientation).toBe(stepper.steps[4].nativeElement);

                stepper.steps[0].disabled = true;
                stepper.steps[4].disabled = true;
                fix.detectChanges();

                // the last accessible step wraps to the first accessible one and vice versa
                stepper.steps[3].nativeElement.focus();
                UIInteractions.triggerKeyDownEvtUponElem(nextKey, stepper.steps[3].nativeElement);
                fix.detectChanges();
                expect(document.activeElement, orientation).toBe(stepper.steps[1].nativeElement);

                UIInteractions.triggerKeyDownEvtUponElem(prevKey, stepper.steps[1].nativeElement);
                fix.detectChanges();
                expect(document.activeElement, orientation).toBe(stepper.steps[3].nativeElement);

                // a disabled step is skipped when focusing the previous step
                stepper.steps[2].disabled = true;
                fix.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem(prevKey, stepper.steps[3].nativeElement);
                fix.detectChanges();
                expect(document.activeElement, orientation).toBe(stepper.steps[1].nativeElement);
                stepper.steps[2].disabled = false;
            }
        });

        it('should reverse the ArrowLeft/ArrowRight navigation in horizontal orientation when the direction is RTL', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.nativeElement.setAttribute('dir', 'rtl');
            fix.detectChanges();

            stepper.steps[1].nativeElement.focus();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', stepper.steps[1].nativeElement);
            fix.detectChanges();
            expect(document.activeElement).toBe(stepper.steps[2].nativeElement);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', stepper.steps[2].nativeElement);
            fix.detectChanges();
            expect(document.activeElement).toBe(stepper.steps[1].nativeElement);

            // the arrows are not reversed in vertical orientation
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', stepper.steps[1].nativeElement);
            fix.detectChanges();
            expect(document.activeElement).toBe(stepper.steps[2].nativeElement);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', stepper.steps[2].nativeElement);
            fix.detectChanges();
            expect(document.activeElement).toBe(stepper.steps[1].nativeElement);
        });
    });

    describe('ARIA', () => {
        it('should render proper role and orientation attributes for the stepper', () => {
            expect(stepper.nativeElement.attributes['role'].value).toEqual('tablist');

            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            expect(stepper.nativeElement.attributes['aria-orientation'].value).toEqual('horizontal');

            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            expect(stepper.nativeElement.attributes['aria-orientation'].value).toEqual('vertical');
        });

        it('should render proper aria attributes for each step', () => {
            for (let i = 0; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].nativeElement.attributes['role'].value)
                    .toEqual('tab');
                expect(stepper.steps[i].nativeElement.attributes['aria-posinset'].value)
                    .toEqual((i + 1).toString());
                expect(stepper.steps[i].nativeElement.attributes['aria-setsize'].value)
                    .toEqual(stepper.steps.length.toString());
                expect(stepper.steps[i].nativeElement.attributes['aria-controls'].value)
                    .toEqual(`${stepper.steps[i].id.replace('step', 'content')}`);

                if (i !== 0) {
                    expect(stepper.steps[i].nativeElement.attributes['aria-selected'].value).toEqual('false');
                }

                stepper.steps[i].active = true;
                fix.detectChanges();

                expect(stepper.steps[i].nativeElement.attributes['aria-selected'].value).toEqual('true');
            }
        });
    });
});

describe('Stepper with steps rendered with @for', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxStepperForComponent,
                IgxStepperForEagerComponent,
                IgxStepperBoundActiveComponent
            ]
        }).compileComponents();
    });

    const verifyFirstStepActive = (stepper: IgxStepperComponent) => {
        const firstStep = stepper.steps[0].nativeElement;
        expect(firstStep.getAttribute('aria-selected')).toBe('true');
        expect(firstStep.getAttribute('tabindex')).toBe('0');
        expect(firstStep.classList.contains(CURRENT_CLASS)).toBe(true);
        stepper.steps.forEach((step, index) => {
            expect(step.nativeElement.querySelector(`.${STEP_INDICATOR_CLASS}`).textContent.trim()).toBe(`${index + 1}`);
            if (index > 0) {
                expect(step.nativeElement.getAttribute('aria-selected')).toBe('false');
                expect(step.nativeElement.getAttribute('tabindex')).toBe('-1');
            }
        });
    };

    it('should activate the first step and render the step indicators on init', () => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.detectChanges();

        verifyFirstStepActive(fixture.componentInstance.stepper);
    });

    it(`should activate the first step and render the step indicators on init in a host with eager change detection,
    without throwing ExpressionChangedAfterItHasBeenCheckedError`, () => {
        const fixture = TestBed.createComponent(IgxStepperForEagerComponent);
        // the dev mode check runs as part of detectChanges and would throw for a stale aria-selected binding
        expect(() => fixture.detectChanges()).not.toThrow();

        verifyFirstStepActive(fixture.componentInstance.stepper);
    });

    it('should disable the steps after an invalid active step on init when the stepper is linear', () => {
        for (const host of [IgxStepperForComponent, IgxStepperForEagerComponent]) {
            const fixture = TestBed.createComponent<IgxStepperForComponent | IgxStepperForEagerComponent>(host);
            fixture.componentInstance.linear = true;
            expect(() => fixture.detectChanges(), host.name).not.toThrow();

            const steps = fixture.componentInstance.stepper.steps;
            expect(steps[0].nativeElement.classList.contains(DISABLED_CLASS), host.name).toBe(false);
            expect(steps[1].nativeElement.classList.contains(DISABLED_CLASS), host.name).toBe(true);
            expect(steps[2].nativeElement.classList.contains(DISABLED_CLASS), host.name).toBe(true);
        }
    });

    it('should emit activeChange only once for the step that is activated on init', () => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.activeChanges).toEqual(['Step 1:true']);
    });

    it('should not emit activeChange for the steps that are bound to [active]="false" and are not active', () => {
        const fixture = TestBed.createComponent(IgxStepperBoundActiveComponent);
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;

        expect(stepper.steps[1].active).toBe(true);
        expect(fixture.componentInstance.activeChanges).toEqual(['Step 2:true']);

        stepper.steps[2].active = false;
        fixture.detectChanges();

        expect(fixture.componentInstance.activeChanges).toEqual(['Step 2:true']);
    });

    it('should remove the steps that are removed from the stepper from its state', async () => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.componentInstance.linear = true;
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const stepperService: IgxStepperService = (stepper as any).stepperService;
        const [firstStep, , lastStep] = stepper.steps;

        expect(stepperService.linearDisabledSteps).toContain(lastStep);

        fixture.componentInstance.steps.set(STEPS_DATA.slice(0, 2));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(stepper.steps.length).toBe(2);
        expect(stepperService.linearDisabledSteps).not.toContain(lastStep);
        expect(stepperService.linearDisabledSteps.size).toBe(1);

        // removing the active step activates the first enabled step
        fixture.componentInstance.steps.set(STEPS_DATA.slice(1, 2));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(stepper.steps.length).toBe(1);
        expect(stepper.steps[0].active).toBe(true);
        expect(stepper.steps[0].nativeElement.getAttribute('aria-selected')).toBe('true');
        expect(stepperService.visitedSteps).not.toContain(firstStep);
        expect(stepperService.previousActiveStep).not.toBe(firstStep);
        expect(stepperService.linearDisabledSteps.size).toBe(0);
    });

    it('should not keep the previously active step in the stepper state when it is removed', async () => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const stepperService: IgxStepperService = (stepper as any).stepperService;
        const [firstStep, secondStep] = stepper.steps;

        secondStep.active = true;
        fixture.detectChanges();

        expect(stepperService.previousActiveStep).toBe(firstStep);

        fixture.componentInstance.steps.set(STEPS_DATA.slice(1));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(secondStep.active).toBe(true);
        expect(secondStep.index).toBe(0);
        expect(secondStep.nativeElement.getAttribute('aria-posinset')).toBe('1');
        expect(secondStep.nativeElement.getAttribute('aria-setsize')).toBe('2');
        expect(secondStep.nativeElement.querySelector(`.${STEP_INDICATOR_CLASS}`).textContent.trim()).toBe('1');
        expect(stepperService.previousActiveStep).toBeUndefined();
        expect(stepperService.visitedSteps).not.toContain(firstStep);
    });

    it('should not keep linear disabled steps when the active step is removed and no step can be activated', async () => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.componentInstance.linear = true;
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const stepperService: IgxStepperService = (stepper as any).stepperService;

        expect(stepperService.linearDisabledSteps.size).toBe(2);

        // remove the active (invalid) step and disable the rest
        fixture.componentInstance.steps.set(STEPS_DATA.slice(1).map(step => ({ ...step, disabled: true })));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(stepper.steps.some(step => step.active)).toBe(false);
        expect(stepperService.linearDisabledSteps.size).toBe(0);

        // a step that is enabled later can be activated
        fixture.componentInstance.steps.set(STEPS_DATA.slice(1).map((step, index) => ({ ...step, disabled: index === 0 })));
        fixture.detectChanges();

        expect(stepper.steps[1].isAccessible).toBe(true);

        stepper.next();
        fixture.detectChanges();
        await nextFrame();

        expect(stepper.steps[1].active).toBe(true);
    });

    it('should not throw when the active step is removed during its animation and no step can be activated', async () => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const changedSpy = vi.spyOn(stepper.activeStepChanged, 'emit');

        stepper.next();
        fixture.detectChanges();

        // remove the step that is being activated and disable the rest
        fixture.componentInstance.steps.set([STEPS_DATA[0], STEPS_DATA[2]].map(step => ({ ...step, disabled: true })));
        fixture.detectChanges();
        await fixture.whenStable();
        changedSpy.mockClear();

        // the no-op test animations end before the removal is handled, so simulate an animation that ends after it;
        // RxJS reports an error thrown by the stepper's handler asynchronously, so collect it
        const errors: unknown[] = [];
        const { onUnhandledError } = rxjsConfig;
        rxjsConfig.onUnhandledError = error => errors.push(error);
        try {
            stepper.enterAnimationDone.emit();
            await wait();
        } finally {
            rxjsConfig.onUnhandledError = onUnhandledError;
        }

        expect(errors).toEqual([]);
        expect(() => fixture.detectChanges()).not.toThrow();
        expect(stepper.steps.some(step => step.active)).toBe(false);
        expect(changedSpy).not.toHaveBeenCalled();
    });

    it('should not throw and should be able to activate a step when there is no active step', async () => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.componentInstance.steps.set(STEPS_DATA.map(step => ({ ...step, disabled: true })));
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const changingSpy = vi.spyOn(stepper.activeStepChanging, 'emit');
        const changedSpy = vi.spyOn(stepper.activeStepChanged, 'emit');

        expect(stepper.steps.some(step => step.active)).toBe(false);
        expect(() => {
            stepper.next();
            stepper.prev();
            stepper.reset();
            stepper.linear = true;
            stepper.steps[0].onFocus();
            stepper.steps[0].onBlur();
        }).not.toThrow();
        expect(changingSpy).not.toHaveBeenCalled();

        stepper.linear = false;
        fixture.componentInstance.steps.set(STEPS_DATA.map((step, index) => ({ ...step, disabled: index !== 1 })));
        fixture.detectChanges();

        stepper.next();
        fixture.detectChanges();
        await nextFrame();

        expect(stepper.steps[1].active).toBe(true);
        expect(stepper.steps[1].nativeElement.getAttribute('tabindex')).toBe('0');
        expect(changingSpy).toHaveBeenCalledTimes(1);
        expect(changingSpy).toHaveBeenCalledWith({ owner: stepper, newIndex: 1, oldIndex: -1, cancel: false });
        expect(changedSpy).toHaveBeenCalledTimes(1);
        expect(changedSpy).toHaveBeenCalledWith({ owner: stepper, index: 1 });
    });
});

describe('Stepper service unit tests', () => {

    let stepperService: IgxStepperService;
    let mockElement: any;
    let mockElementRef: any;
    let mockCdr: any;
    let mockAnimationService: any;
    let mockPlatform: any;

    let steps: IgxStepComponent[] = [];
    let stepFixtures: ComponentFixture<IgxStepComponent>[] = [];
    let stepper: IgxStepperComponent;

    beforeEach(async () => {
        mockElement = {
            style: { visibility: '', cursor: '', transitionDuration: '' },
            classList: { add: () => { }, remove: () => { } },
            appendChild: () => { },
            removeChild: () => { },
            addEventListener: (_type: string, _listener: (this: HTMLElement, ev: MouseEvent) => any) => { },
            removeEventListener: (_type: string, _listener: (this: HTMLElement, ev: MouseEvent) => any) => { },
            insertBefore: (_newChild: HTMLDivElement, _refChild: Node) => { },
            contains: () => { }
        };
        mockElement.parent = mockElement;
        mockElement.parentElement = mockElement;
        mockElement.parentNode = mockElement;
        mockElementRef = { nativeElement: mockElement };

        mockAnimationService = {
            buildAnimation: (_builder: AnimationBuilder) => ({
                animationEnd: {
                    pipe: () => ({
                        subscribe: () => { }
                    }),
                    subscribe: () => { }
                },
                animationStart: {
                    pipe: () => ({
                        subscribe: () => { }
                    }),
                    subscribe: () => { }
                },
                position: 0,
                init: () => { },
                hasStarted: () => true,
                play: () => { },
                finish: () => { },
                reset: () => { },
                destroy: () => { }
            })
        };

        mockPlatform = { isIOS: false };

        mockCdr = {
            markForCheck: (): void => { },
            detach: (): void => { },
            detectChanges: (): void => { },
            checkNoChanges: (): void => { },
            reattach: (): void => { },
        };

        stepperService = new IgxStepperService();

        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxStepComponent],
            providers: [
                { provide: ChangeDetectorRef, useValue: mockCdr },
                { provide: IgxAngularAnimationService, useValue: mockAnimationService },
                { provide: ElementRef, useValue: mockElementRef },
                { provide: IgxStepperService, useValue: stepperService },
                { provide: PlatformUtil, useValue: mockPlatform },
                IgxStepperComponent,
                { provide: IGX_STEPPER_COMPONENT, useExisting: IgxStepperComponent },
                IgxStepComponent,
                Renderer2
            ]
        }).compileComponents();

        stepper = TestBed.inject(IgxStepperComponent);
        steps = [];
        stepFixtures = [];
        for (let index = 0; index < 4; index++) {
            const fixture = TestBed.createComponent(IgxStepComponent);
            stepFixtures.push(fixture);
            fixture.detectChanges();
            const newStep = fixture.componentInstance;
            newStep._index.set(index);
            steps.push(newStep);
        }
    });

    afterEach(() => {
        // The step host-binds its `id`, which replaces the `rootN` id TestBed uses to remove fixture hosts,
        // so the hosts must be removed explicitly or they stay in the page for the next spec files.
        stepFixtures.forEach(fixture => {
            fixture.destroy();
            fixture.nativeElement.remove();
        });
    });

    it('should expand a step by activating it and firing the step\'s activeChange event', () => {
        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Horizontal);
        vi.spyOn(stepper, 'steps', 'get').mockReturnValue(steps);

        stepperService.activeStep = steps[0];

        steps[0].contentContainer = mockElementRef;
        steps[1].contentContainer = mockElementRef;

        vi.spyOn(steps[0].activeChange, 'emit');
        vi.spyOn(steps[1].activeChange, 'emit');

        stepperService.expand(steps[1]);
        expect(stepperService.activeStep).toBe(steps[1]);
        expect(steps[1].activeChange.emit).toHaveBeenCalledTimes(1);
        expect(steps[1].activeChange.emit).toHaveBeenCalledWith(true);

        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Vertical);
        stepperService.expand(steps[0]);

        expect(stepperService.activeStep).toBe(steps[0]);
        expect(steps[0].activeChange.emit).toHaveBeenCalledTimes(1);
        expect(steps[0].activeChange.emit).toHaveBeenCalledWith(true);

        const testValues = [null, undefined, [], {}, 'sampleString'];

        for (const val of testValues) {
            expect(() => {
                stepperService.expand(val as any);
            }).toThrow();
        }
    });

    it('should expand a step through API by activating it and firing the step\'s activeChange event', () => {
        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Horizontal);
        vi.spyOn(stepper, 'steps', 'get').mockReturnValue(steps);

        stepperService.activeStep = steps[0];

        vi.spyOn(steps[0].activeChange, 'emit');
        vi.spyOn(steps[1].activeChange, 'emit');

        stepperService.expandThroughApi(steps[1]);

        expect(stepperService.activeStep).toBe(steps[1]);
        expect(steps[0].activeChange.emit).toHaveBeenCalledTimes(1);
        expect(steps[0].activeChange.emit).toHaveBeenCalledWith(false);
        expect(steps[1].activeChange.emit).toHaveBeenCalledTimes(1);
        expect(steps[1].activeChange.emit).toHaveBeenCalledWith(true);

        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Vertical);
        stepperService.expandThroughApi(steps[0]);

        expect(stepperService.activeStep).toBe(steps[0]);
        expect(steps[1].activeChange.emit).toHaveBeenCalledTimes(2);
        expect(steps[1].activeChange.emit).toHaveBeenCalledWith(false);
        expect(steps[0].activeChange.emit).toHaveBeenCalledTimes(2);
        expect(steps[0].activeChange.emit).toHaveBeenCalledWith(true);

        const testValues = [null, undefined, [], {}, 'sampleString'];

        for (const val of testValues) {
            expect(() => {
                stepperService.expandThroughApi(val as any);
            }).toThrow();
        }
    });

    it('should collapse the currently active step and fire the change event', () => {
        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Horizontal);
        vi.spyOn(stepper, 'steps', 'get').mockReturnValue(steps);

        stepperService.previousActiveStep = steps[0];
        stepperService.activeStep = steps[1];
        stepperService.collapsingSteps.add(stepperService.previousActiveStep);

        expect(stepperService.collapsingSteps).toContain(steps[0]);
        expect(stepperService.collapsingSteps).not.toContain(steps[1]);

        vi.spyOn(steps[0].activeChange, 'emit');
        vi.spyOn(steps[1].activeChange, 'emit');

        stepperService.collapse(steps[0]);

        expect(stepperService.collapsingSteps).not.toContain(steps[0]);
        expect(stepperService.activeStep).not.toBe(steps[0]);
        expect(stepperService.activeStep).toBe(steps[1]);
        expect(steps[0].activeChange.emit).toHaveBeenCalledTimes(1);
        expect(steps[0].activeChange.emit).toHaveBeenCalledWith(false);
        expect(steps[1].activeChange.emit).not.toHaveBeenCalled();

        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Vertical);

        stepperService.previousActiveStep = steps[1];
        stepperService.activeStep = steps[0];

        stepperService.collapsingSteps.add(stepperService.previousActiveStep);
        expect(stepperService.collapsingSteps).toContain(steps[1]);
        expect(stepperService.collapsingSteps).not.toContain(steps[0]);

        stepperService.collapse(steps[1]);

        expect(stepperService.collapsingSteps).not.toContain(steps[1]);
        expect(stepperService.activeStep).not.toBe(steps[1]);
        expect(stepperService.activeStep).toBe(steps[0]);

        expect(steps[1].activeChange.emit).toHaveBeenCalledTimes(1);

        expect(steps[1].activeChange.emit).toHaveBeenCalledWith(false);
        expect(steps[0].activeChange.emit).not.toHaveBeenCalledTimes(2);

        // a step that is not collapsing is not collapsed again
        stepperService.collapse(steps[1]);
        expect(steps[1].activeChange.emit).toHaveBeenCalledTimes(1);

        const testValues = [null, undefined, [], {}, 'sampleString'];

        for (const val of testValues) {
            expect(() => {
                stepperService.collapse(val as any);
            }).not.toThrow();
        }
    });

    it('should determine the steps that are marked as visited based on the active step', () => {
        vi.spyOn(stepper, 'steps', 'get').mockReturnValue(steps);
        let sampleSet: Set<IgxStepComponent>;

        stepperService.activeStep = steps[0];
        stepperService.calculateVisitedSteps();
        expect(stepperService.visitedSteps.size).toEqual(1);
        sampleSet = new Set<IgxStepComponent>([steps[0]]);
        expect(new Set(stepperService.visitedSteps)).toEqual(sampleSet);

        stepperService.activeStep = steps[1];
        stepperService.calculateVisitedSteps();
        expect(stepperService.visitedSteps.size).toEqual(2);
        sampleSet = new Set<IgxStepComponent>([steps[0], steps[1]]);
        expect(new Set(stepperService.visitedSteps)).toEqual(sampleSet);

        stepperService.activeStep = steps[2];
        stepperService.calculateVisitedSteps();
        expect(stepperService.visitedSteps.size).toEqual(3);
        sampleSet = new Set<IgxStepComponent>([steps[0], steps[1], steps[2]]);
        expect(new Set(stepperService.visitedSteps)).toEqual(sampleSet);
    });

    it('should determine the steps that should be disabled in linear mode based on the validity of the active step', () => {
        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Horizontal);
        vi.spyOn(stepper as any, 'steps', 'get').mockReturnValue(steps);

        for (const step of steps) {
            vi.spyOn(step as any, 'isValid', 'get').mockReturnValue(false);
        }
        vi.spyOn(stepper as any, 'linear', 'get').mockReturnValue(true);
        stepperService.activeStep = steps[0];
        vi.spyOn(steps[0] as any, 'active', 'get').mockReturnValue(true);

        expect(stepperService.linearDisabledSteps.size).toBe(0);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(3);
        let sampleSet = new Set<IgxStepComponent>([steps[1], steps[2], steps[3]]);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);

        vi.spyOn(steps[0] as any, 'isValid', 'get').mockReturnValue(true);
        stepperService.calculateLinearDisabledSteps();
        sampleSet = new Set<IgxStepComponent>([steps[2], steps[3]]);
        expect(stepperService.linearDisabledSteps.size).toBe(2);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);

        vi.spyOn(steps[1] as any, 'active', 'get').mockReturnValue(true);
        vi.spyOn(steps[1] as any, 'isValid', 'get').mockReturnValue(false);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(2);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);

        vi.spyOn(steps[1] as any, 'isValid', 'get').mockReturnValue(true);
        stepperService.activeStep = steps[1];
        sampleSet = new Set<IgxStepComponent>([steps[3]]);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(1);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);
        expect(stepperService.linearDisabledSteps).toContain(steps[3]);

        vi.spyOn(steps[2] as any, 'isValid', 'get').mockReturnValue(true);
        vi.spyOn(steps[3] as any, 'isValid', 'get').mockReturnValue(true);
        stepperService.activeStep = steps[3];
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(0);
        expect(stepperService.linearDisabledSteps).not.toContain(steps[3]);
    });

    it('should emit activating event', () => {
        vi.spyOn(stepper, 'orientation', 'get').mockReturnValue(IgxStepperOrientation.Horizontal);
        vi.spyOn(stepper as any, 'steps', 'get').mockReturnValue(steps);
        const activeChangingSpy = vi.spyOn(stepper.activeStepChanging, 'emit');
        stepperService.activeStep = steps[0];

        let activeChangingEventArgs: any = {
            owner: stepper,
            newIndex: steps[1].index,
            oldIndex: steps[0].index,
            cancel: false
        };

        let result: boolean = stepperService.emitActivatingEvent(steps[1]);
        expect(result).toEqual(false);
        expect(activeChangingSpy).toHaveBeenCalledTimes(1);
        expect(activeChangingSpy).toHaveBeenCalledWith(activeChangingEventArgs);

        activeChangingSpy.mockClear();

        stepperService.activeStep = steps[1];
        stepperService.previousActiveStep = steps[0];

        result = stepperService.emitActivatingEvent(steps[0]);
        expect(result).toEqual(false);
        expect(activeChangingSpy).toHaveBeenCalledTimes(1);
        expect(activeChangingSpy).not.toHaveBeenCalledWith(activeChangingEventArgs);

        activeChangingEventArgs = {
            owner: stepper,
            newIndex: steps[0].index,
            oldIndex: steps[1].index,
            cancel: false
        };

        expect(activeChangingSpy).toHaveBeenCalledWith(activeChangingEventArgs);
    });

    it('should not collapse the active step', () => {
        stepperService.activeStep = steps[0];
        stepperService.collapsingSteps.add(steps[0]);
        vi.spyOn(steps[0].activeChange, 'emit');

        stepperService.collapse(steps[0]);

        expect(steps[0].activeChange.emit).not.toHaveBeenCalled();
        expect(stepperService.collapsingSteps).toContain(steps[0]);
    });

    it('should calculate the linear disabled steps from the steps validity when there is no active step', () => {
        vi.spyOn(stepper, 'steps', 'get').mockReturnValue(steps);
        stepperService.linearDisabledSteps.add(steps[1]);
        stepperService.linearDisabledSteps.add(steps[2]);

        stepperService.calculateLinearDisabledSteps();

        // the stale disabled steps are cleared when all steps are valid
        expect(stepperService.linearDisabledSteps.size).toBe(0);

        vi.spyOn(steps[1], 'isValid', 'get').mockReturnValue(false);
        stepperService.calculateLinearDisabledSteps();

        expect(new Set(stepperService.linearDisabledSteps)).toEqual(new Set([steps[2], steps[3]]));
    });
});


@Component({
    template: `
     <igx-stepper #stepper  [orientation]="'horizontal'" [verticalAnimationType]="verticalAnimationType"
        [horizontalAnimationType]="horizontalAnimationType" [animationDuration]="animationDuration">

        <ng-template igxStepInvalidIndicator>
            <igx-icon>error</igx-icon>
        </ng-template>

        <ng-template igxStepCompletedIndicator>
            <igx-icon>check</igx-icon>
        </ng-template>

        <ng-template igxStepActiveIndicator>
            <igx-icon>edit</igx-icon>
        </ng-template>

        <igx-step #step1  [active]="true">
            <span igxStepIndicator>1</span>
            <span igxStepTitle>Step No 1</span>
            <span igxStepSubtitle>Step SubTitle</span>
            <div igxStepContent class="sample-body">
                <igx-input-group>
                    <input igxInput name="firstName" type="text" />
                </igx-input-group>
            </div>
        </igx-step>

        <igx-step #step2>
            <span igxStepIndicator>2</span>
            <span igxStepTitle>Step No 2</span>
            <span igxStepSubtitle>Step SubTitle</span>
            <div igxStepContent class="sample-body">
               <p>Test step 2</p>
            </div>
        </igx-step>

        @if (displayHiddenStep) {
            <igx-step #hiddenStep>
                <span igxStepIndicator>*</span>
                <span igxStepTitle>Hidden step</span>
                <span igxStepSubtitle>Step SubTitle</span>
                <div igxStepContent class="sample-body">
                    <p>Test hidden step</p>
                </div>
            </igx-step>
        }

        <igx-step #step3>
            <span igxStepIndicator>3</span>
            <span igxStepTitle>Step No 3</span>
            <span igxStepSubtitle>Step SubTitle</span>
            <div igxStepContent class="sample-body">
               <p>Test step 3</p>
            </div>
        </igx-step>

        <igx-step #step4>
            <span igxStepIndicator>4</span>
            <div igxStepContent class="sample-body">
               <p>Test step 4</p>
            </div>
        </igx-step>

        <igx-step #step5 >
            <span igxStepTitle>Step No 5</span>
            <span igxStepSubtitle>Step SubTitle</span>
            <div igxStepContent class="sample-body">
               <p>Test step 5</p>
            </div>
        </igx-step>
    </igx-stepper>
    <br>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxStepperComponent,
        IgxStepComponent,
        IgxStepTitleDirective,
        IgxStepIndicatorDirective,
        IgxStepSubtitleDirective,
        IgxStepContentDirective,
        IgxStepInvalidIndicatorDirective,
        IgxStepCompletedIndicatorDirective,
        IgxStepActiveIndicatorDirective,
        IgxIconComponent,
        IgxInputDirective,
        IgxInputGroupComponent,
    ]
})
export class IgxStepperSampleTestComponent {
    @ViewChild(IgxStepperComponent)
    public stepper: IgxStepperComponent;

    public horizontalAnimationType: HorizontalAnimationType = 'slide';
    public verticalAnimationType: VerticalAnimationType = 'grow';
    public animationDuration = 300;
    public displayHiddenStep = false;
}

@Component({
    template: `
     <igx-stepper #stepper [linear]="true">
        <igx-step #step1 [isValid]="false">
        </igx-step>

        <igx-step #step2 [isValid]="false">
        </igx-step>

        <igx-step #step3 [isValid]="false">
        </igx-step>
    </igx-stepper>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxStepperComponent, IgxStepComponent]
})
export class IgxStepperLinearComponent {
    @ViewChild(IgxStepperComponent)
    public stepper: IgxStepperComponent;
}

@Component({
    template: `
        <div>
            <igx-stepper #stepper [orientation]="'vertical'" [titlePosition]="'end'">

                <igx-step [active]="true">
                    <span igxStepTitle>{{ longTitle }}</span>
                    <div igxStepContent>Content</div>
                </igx-step>

                <igx-step>
                    <span igxStepTitle>Short</span>
                    <div igxStepContent>Content</div>
                </igx-step>
            </igx-stepper>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxStepperComponent,
        IgxStepComponent,
        IgxStepTitleDirective,
        IgxStepContentDirective
    ]
})
export class IgxStepperIndicatorNoShrinkComponent {
    @ViewChild(IgxStepperComponent) public stepper: IgxStepperComponent;

    public longTitle =
        'This is a very very very very very very very very very very very very very very very very very very very very very long step title that should not shrink the indicator';
}

type StepData = Readonly<{ title: string, isValid: boolean, optional: boolean, disabled: boolean }>;

const STEPS_DATA: ReadonlyArray<StepData> = [
    { title: 'Step 1', isValid: false, optional: false, disabled: false },
    { title: 'Step 2', isValid: true, optional: false, disabled: false },
    { title: 'Step 3', isValid: true, optional: false, disabled: false }
];

const STEPS_FOR_TEMPLATE = `
    <igx-stepper [linear]="linear">
        @for (step of steps(); track step.title) {
            <igx-step [isValid]="step.isValid" [optional]="step.optional" [disabled]="step.disabled"
                (activeChange)="activeChanges.push(step.title + ':' + $event)">
                <span igxStepTitle>{{ step.title }}</span>
                <div igxStepContent>{{ step.title }} content</div>
            </igx-step>
        }
    </igx-stepper>
    `;

@Component({
    template: STEPS_FOR_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxStepperComponent, IgxStepComponent, IgxStepTitleDirective, IgxStepContentDirective]
})
export class IgxStepperForComponent {
    @ViewChild(IgxStepperComponent) public stepper: IgxStepperComponent;
    public steps = signal(STEPS_DATA);
    public linear = false;
    public activeChanges: string[] = [];
}

@Component({
    // a distinct selector avoids a component ID collision with the OnPush variant sharing the same template
    selector: 'igx-stepper-for-eager-test',
    template: STEPS_FOR_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxStepperComponent, IgxStepComponent, IgxStepTitleDirective, IgxStepContentDirective]
})
export class IgxStepperForEagerComponent {
    @ViewChild(IgxStepperComponent) public stepper: IgxStepperComponent;
    public steps = signal(STEPS_DATA);
    public linear = false;
    public activeChanges: string[] = [];
}

@Component({
    template: `
    <igx-stepper [orientation]="'vertical'">
        <igx-step [active]="false" (activeChange)="activeChanges.push('Step 1:' + $event)">
            <div igxStepContent>Step 1 content</div>
        </igx-step>
        <igx-step [active]="true" (activeChange)="activeChanges.push('Step 2:' + $event)">
            <div igxStepContent>Step 2 content</div>
        </igx-step>
        <igx-step [active]="false" (activeChange)="activeChanges.push('Step 3:' + $event)">
            <div igxStepContent>Step 3 content</div>
        </igx-step>
    </igx-stepper>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxStepperComponent, IgxStepComponent, IgxStepContentDirective]
})
export class IgxStepperBoundActiveComponent {
    @ViewChild(IgxStepperComponent) public stepper: IgxStepperComponent;
    public activeChanges: string[] = [];
}
