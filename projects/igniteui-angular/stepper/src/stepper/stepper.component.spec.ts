import { AnimationBuilder } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxInputDirective, IgxInputGroupComponent } from '../../../input-group/src/public_api';
import { IgxAngularAnimationService, PlatformUtil } from 'igniteui-angular/core';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';
import { IgxStepComponent } from './step/step.component';
import {
    HorizontalAnimationType,
    IGX_STEPPER_COMPONENT,
    IgxStepperOrientation,
    IgxStepperTitlePosition,
    IgxStepType,
    IStepChangedEventArgs,
    IStepChangingEventArgs,
    VerticalAnimationType
} from './stepper.common';
import { IgxStepperComponent } from './stepper.component';
import { IgxStepActiveIndicatorDirective, IgxStepCompletedIndicatorDirective, IgxStepContentDirective, IgxStepIndicatorDirective, IgxStepInvalidIndicatorDirective, IgxStepSubtitleDirective, IgxStepTitleDirective } from './stepper.directive';
import { IgxStepperService } from './stepper.service';

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

const testAnimationBehavior = (
    val: any,
    fix: ComponentFixture<IgxStepperSampleTestComponent>,
    isHorAnimTypeInvalidTest: boolean
): void => {
    const stepper = fix.componentInstance.stepper;
    stepper.steps[0].active = true;
    fix.detectChanges();
    const previousActiveStep = stepper.steps[0];
    const activeChangeSpy = spyOn(previousActiveStep.activeChange, 'emit');
    activeChangeSpy.calls.reset();
    stepper.next();
    fix.detectChanges();
    tick(1000);
    if (!isHorAnimTypeInvalidTest) {
        expect(previousActiveStep.activeChange.emit).withContext(val).toHaveBeenCalledOnceWith(false);
    } else {
        expect(previousActiveStep.activeChange.emit).withContext(val).not.toHaveBeenCalled();
    }
    activeChangeSpy.calls.reset();
};

describe('Rendering Tests', () => {
    let fix: ComponentFixture<IgxStepperSampleTestComponent>;
    let stepper: IgxStepperComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxStepperSampleTestComponent,
                    IgxStepperLinearComponent,
                    IgxStepperIndicatorNoShrinkComponent
                ]
            }).compileComponents();
        })
    );
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

        it('should not allow activating a step with next/prev methods when disabled is set to true', fakeAsync(() => {
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();
            const serviceCollapseSpy = spyOn((stepper as any).stepperService, 'collapse').and.callThrough();
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.steps[0].active = true;
            stepper.steps[1].disabled = true;
            fix.detectChanges();
            tick();

            expect(stepper.steps[1].nativeElement).toHaveClass('igx-step--disabled');

            stepper.next();
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[2].isAccessible).toBeTruthy();
            expect(stepper.steps[2].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[2]);
            expect(serviceCollapseSpy).toHaveBeenCalledOnceWith(stepper.steps[0]);

            serviceExpandSpy.calls.reset();
            serviceCollapseSpy.calls.reset();

            stepper.orientation = IgxStepperOrientation.Vertical;
            stepper.steps[0].active = true;
            stepper.steps[1].disabled = true;
            fix.detectChanges();
            tick();

            stepper.next();
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[2].isAccessible).toBeTruthy();
            expect(stepper.steps[2].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[2]);
            expect(serviceCollapseSpy).toHaveBeenCalledOnceWith(stepper.steps[0]);
        }));

        it('should calculate disabled steps properly when the stepper is initially in linear mode', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxStepperLinearComponent);
            fixture.detectChanges();
            const linearStepper = fixture.componentInstance.stepper;

            const serviceExpandSpy = spyOn((linearStepper as any).stepperService, 'expand').and.callThrough();
            linearStepper.next();
            fixture.detectChanges();
            tick();

            expect(linearStepper.steps[1].active).toBeFalsy();
            expect(linearStepper.steps[0].active).toBeTruthy();
            expect(linearStepper.steps[1].linearDisabled).toBeTruthy();
            expect(serviceExpandSpy).not.toHaveBeenCalled();
        }));

        it('should not allow moving forward to next step in linear mode if the previous step is invalid', fakeAsync(() => {
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.linear = true;
            stepper.steps[0].isValid = false;
            fix.detectChanges();

            stepper.next();
            fix.detectChanges();
            tick();

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[0].active).toBeTruthy();
            expect(stepper.steps[1].linearDisabled).toBeTruthy();
            expect(stepper.steps[2].linearDisabled).toBeTruthy();
            expect(serviceExpandSpy).not.toHaveBeenCalled();

            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            stepper.next();
            fix.detectChanges();
            tick();

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
        }));

        it('should emit ing and ed events when a step is activated', fakeAsync(() => {
            const changingSpy = spyOn(stepper.activeStepChanging, 'emit').and.callThrough();
            const changedSpy = spyOn(stepper.activeStepChanged, 'emit').and.callThrough();
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();
            const serviceCollapseSpy = spyOn((stepper as any).stepperService, 'collapse').and.callThrough();

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
            tick();

            expect(stepper.steps[1].active).toBeTruthy();
            expect(changingSpy).toHaveBeenCalledOnceWith(argsIng);
            expect(changedSpy).toHaveBeenCalledOnceWith(argsEd);
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[1]);
            expect(serviceCollapseSpy).toHaveBeenCalledOnceWith(stepper.steps[0]);
        }));

        it('should be able to cancel the activeStepChanging event', fakeAsync(() => {
            const changingSpy = spyOn(stepper.activeStepChanging, 'emit').and.callThrough();
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();
            const serviceCollapseSpy = spyOn((stepper as any).stepperService, 'collapse').and.callThrough();

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
            tick();

            expect(stepper.steps[1].active).toBeFalsy();
            expect(stepper.steps[0].active).toBeTruthy();
            expect(changingSpy).toHaveBeenCalledOnceWith(argsIng);
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[1]);
            expect(serviceCollapseSpy).not.toHaveBeenCalled();
        }));

        it('a step should emit activeChange event when its active property changes', fakeAsync(() => {
            const fourthActiveChangeSpy = spyOn(stepper.steps[3].activeChange, 'emit').and.callThrough();
            const fifthActiveChangeSpy = spyOn(stepper.steps[4].activeChange, 'emit').and.callThrough();
            const serviceExpandAPISpy = spyOn((stepper as any).stepperService, 'expandThroughApi').and.callThrough();

            expect(fourthActiveChangeSpy).not.toHaveBeenCalled();
            expect(fifthActiveChangeSpy).not.toHaveBeenCalled();

            stepper.steps[0].active = true;
            fix.detectChanges();
            expect(serviceExpandAPISpy).toHaveBeenCalledOnceWith(stepper.steps[0]);

            stepper.steps[3].active = true;
            fix.detectChanges();
            tick();

            expect(stepper.steps[3].active).toBeTruthy();
            expect(stepper.steps[3].activeChange.emit).toHaveBeenCalledOnceWith(true);
            expect(fifthActiveChangeSpy).not.toHaveBeenCalled();
            expect(serviceExpandAPISpy.calls.mostRecent().args[0]).toBe(stepper.steps[3]);

            fourthActiveChangeSpy.calls.reset();
            serviceExpandAPISpy.calls.reset();

            stepper.steps[4].active = true;
            fix.detectChanges();
            tick();

            expect(stepper.steps[4].active).toBeTruthy();
            expect(stepper.steps[3].active).toBeFalsy();
            expect(fifthActiveChangeSpy).toHaveBeenCalledOnceWith(true);
            expect(fourthActiveChangeSpy).toHaveBeenCalledOnceWith(false);
            expect(serviceExpandAPISpy).toHaveBeenCalledOnceWith(stepper.steps[4]);
        }));

        it('should activate the previous accessible step with the prev method', fakeAsync(() => {
            for (const orientation of [IgxStepperOrientation.Horizontal, IgxStepperOrientation.Vertical]) {
                stepper.orientation = orientation;
                stepper.steps[2].disabled = false;
                stepper.steps[3].active = true;
                fix.detectChanges();
                tick();

                stepper.steps[2].disabled = true;
                fix.detectChanges();

                stepper.prev();
                fix.detectChanges();
                tick(350);

                expect(stepper.steps[1].active).withContext(orientation).toBeTruthy();
                expect(stepper.steps[2].active).withContext(orientation).toBeFalsy();

                stepper.prev();
                fix.detectChanges();
                tick(350);

                expect(stepper.steps[0].active).withContext(orientation).toBeTruthy();

                // there is no previous step to activate
                stepper.prev();
                fix.detectChanges();
                tick(350);

                expect(stepper.steps[0].active).withContext(orientation).toBeTruthy();
            }
        }));

        it('should not change the active step with the next method when the last step is active', fakeAsync(() => {
            stepper.steps[4].active = true;
            fix.detectChanges();
            const changingSpy = spyOn(stepper.activeStepChanging, 'emit').and.callThrough();

            stepper.next();
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[4].active).toBeTruthy();
            expect(changingSpy).not.toHaveBeenCalled();
        }));

        it('should not deactivate the active step when its active property is set to false', () => {
            const activeChangeSpy = spyOn(stepper.steps[0].activeChange, 'emit').and.callThrough();

            stepper.steps[0].active = false;
            fix.detectChanges();

            expect(stepper.steps[0].active).toBeTruthy();
            expect(stepper.steps[0].nativeElement).toHaveClass(CURRENT_CLASS);
            expect(activeChangeSpy).not.toHaveBeenCalled();
        });

        it('should move the tabIndex to the active step when it is changed with next, prev and navigateTo', fakeAsync(() => {
            const verifyTabIndex = (activeIndex: number) => {
                stepper.steps.forEach((step, index) => {
                    const expected = index === activeIndex ? 0 : -1;
                    expect(step.tabIndex).withContext(`step ${index}`).toBe(expected);
                    expect(step.nativeElement.getAttribute('tabindex')).withContext(`step ${index}`).toBe(`${expected}`);
                });
            };

            for (const orientation of [IgxStepperOrientation.Horizontal, IgxStepperOrientation.Vertical]) {
                stepper.orientation = orientation;
                stepper.steps[0].active = true;
                fix.detectChanges();
                tick(350);
                verifyTabIndex(0);

                stepper.next();
                fix.detectChanges();
                tick(350);
                verifyTabIndex(1);

                stepper.navigateTo(3);
                fix.detectChanges();
                tick(350);
                verifyTabIndex(3);

                stepper.prev();
                fix.detectChanges();
                tick(350);
                verifyTabIndex(2);
            }
        }));

        it('should emit activeChange(false) once for a collapsing step when the animation type changes before the animation ends', fakeAsync(() => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();
            const activeChangeSpy = spyOn(stepper.steps[0].activeChange, 'emit').and.callThrough();

            stepper.next();
            fix.detectChanges();
            stepper.horizontalAnimationType = HorizontalAnimationType.fade;
            fix.detectChanges();
            tick(1000);
            fix.detectChanges();

            expect(activeChangeSpy).toHaveBeenCalledOnceWith(false);
            expect(stepper.steps[0].collapsing).toBeFalse();
            expect(stepper.steps[0].contentContainer.nativeElement.querySelector('.sample-body')).toBeNull();
        }));

        it('should not disable the steps after an invalid active step in linear mode when it is optional or disabled', () => {
            stepper.linear = true;
            stepper.steps[0].optional = true;
            stepper.steps[0].isValid = false;
            fix.detectChanges();

            for (let i = 1; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled).withContext(`optional, step ${i}`).toBeFalse();
            }

            stepper.steps[0].optional = false;
            stepper.steps[0].disabled = true;
            fix.detectChanges();

            for (let i = 1; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled).withContext(`disabled, step ${i}`).toBeFalse();
            }

            // a required invalid step after the optional active one still disables the steps after it
            stepper.steps[0].disabled = false;
            stepper.steps[0].optional = true;
            stepper.steps[2].isValid = false;
            fix.detectChanges();

            expect(stepper.steps[1].linearDisabled).toBeFalse();
            expect(stepper.steps[2].linearDisabled).toBeFalse();
            expect(stepper.steps[3].linearDisabled).toBeTrue();
            expect(stepper.steps[4].linearDisabled).toBeTrue();
        });

        it('should update the linear disabled steps when the active step changes', fakeAsync(() => {
            stepper.linear = true;
            stepper.steps[0].isValid = false;
            fix.detectChanges();

            expect(stepper.steps[2].linearDisabled).toBeTrue();

            // the API can activate a linear disabled step
            stepper.navigateTo(2);
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[2].active).toBeTrue();
            for (const step of stepper.steps) {
                expect(step.linearDisabled).withContext(`step ${step.index}`).toBeFalse();
            }
            expect(stepper.steps[2].nativeElement).not.toHaveClass(DISABLED_CLASS);

            stepper.steps[3].isValid = false;
            fix.detectChanges();
            stepper.navigateTo(3);
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[4].linearDisabled).toBeTrue();

            // moving back to the invalid step disables all steps after it again
            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(stepper.steps[0].linearDisabled).toBeFalse();
            for (let i = 1; i < stepper.steps.length; i++) {
                expect(stepper.steps[i].linearDisabled).withContext(`step ${i}`).toBeTrue();
            }
        }));

        it('should keep the active step visited when the stepper is reset', fakeAsync(() => {
            const stepperService: IgxStepperService = (stepper as any).stepperService;
            stepper.steps[0].isValid = false;
            stepper.steps[1].active = true;
            stepper.steps[0].active = true;
            fix.detectChanges();

            stepper.reset();
            fix.detectChanges();

            expect(stepper.steps[0].active).toBeTrue();
            expect(stepperService.visitedSteps.size).toBe(1);
            expect(stepperService.visitedSteps).toContain(stepper.steps[0]);

            stepper.next();
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[0].nativeElement).toHaveClass(INVALID_CLASS);
        }));

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
            const changedSpy = spyOn(stepper.activeStepChanged, 'emit').and.callThrough();
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();

            stepper.navigateTo(1);
            fix.detectChanges();

            expect(stepper.steps[1].active).toBeTruthy();
            expect(changedSpy).toHaveBeenCalledOnceWith({ owner: stepper, index: 1 });
            expect(serviceExpandSpy).not.toHaveBeenCalled();

            changedSpy.calls.reset();
            stepper.activeStepChanging.pipe(take(1)).subscribe(e => e.cancel = true);

            stepper.navigateTo(2);
            fix.detectChanges();

            expect(stepper.steps[1].active).toBeTruthy();
            expect(stepper.steps[2].active).toBeFalsy();
            expect(changedSpy).not.toHaveBeenCalled();
        });
    });

    describe('Appearance', () => {
        beforeAll(() => {
            jasmine.getEnv().allowRespy(true);
        });

        afterAll(() => {
            jasmine.getEnv().allowRespy(false);
        });

        it('should apply the appropriate class to a stepper in horizontal mode', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            expect(stepper.nativeElement).toHaveClass('igx-stepper--horizontal');

            // no css class is applied when the stepper is in vertical mode
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            expect(stepper.nativeElement).not.toHaveClass('igx-stepper--horizontal');
            for (const step of stepper.steps) {
                expect(step.nativeElement).toHaveClass('igx-step--vertical');
                expect(step.nativeElement).not.toHaveClass('igx-step--horizontal');
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
                expect(step.nativeElement).toHaveClass(`igx-step--${IgxStepperTitlePosition.Bottom}`);
            }
        });

        it('should apply the simple class to the steps when stepType is not "full"', () => {
            for (const type of [IgxStepType.Indicator, IgxStepType.Title]) {
                stepper.stepType = type;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement).withContext(type).toHaveClass('igx-step--simple');
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
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();

            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(step0).toHaveClass(CURRENT_CLASS);

            stepper.steps[1].active = true;
            stepper.steps[1].nativeElement.focus();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem(' ', stepper.steps[1].nativeElement);
            fix.detectChanges();

            expect(step0).not.toHaveClass(CURRENT_CLASS);
            expect(step1).toHaveClass(CURRENT_CLASS);
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[1]);
        });

        it('should indicate that a step is completed', () => {
            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(stepper.steps[0].completed).toBeFalsy();
            expect(stepper.steps[0].nativeElement).not.toHaveClass(COMPLETED_CLASS);

            stepper.steps[0].completed = true;
            fix.detectChanges();

            expect(stepper.steps[0].nativeElement).toHaveClass(COMPLETED_CLASS);

            stepper.steps[1].completed = true;
            fix.detectChanges();

            expect(stepper.steps[1].nativeElement).toHaveClass(COMPLETED_CLASS);
        });

        it('should indicate that a step is invalid', () => {
            const step0Header = stepper.steps[0].nativeElement;
            stepper.steps[0].isValid = true;
            fix.detectChanges();

            expect(step0Header).not.toHaveClass(INVALID_CLASS);

            stepper.steps[0].isValid = false;
            fix.detectChanges();

            expect(step0Header).not.toHaveClass(INVALID_CLASS);

            stepper.steps[1].active = true;
            fix.detectChanges();

            expect(step0Header).toHaveClass(INVALID_CLASS);

            //indicate that a step is disabled without indicating that it is also invalid
            stepper.steps[0].disabled = true;
            fix.detectChanges();

            expect(step0Header).not.toHaveClass(INVALID_CLASS);
            expect(stepper.steps[0].nativeElement).toHaveClass(DISABLED_CLASS);
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
                expect(step.nativeElement).toHaveClass(`igx-step--${stepper._defaultTitlePosition}`);
            }

            const positions = getStepperPositions();
            positions.forEach((pos: IgxStepperTitlePosition) => {
                stepper.titlePosition = pos;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement).toHaveClass(`igx-step--${pos}`);
                }
            });

            stepper.orientation = IgxStepperOrientation.Vertical;
            stepper.titlePosition = null;
            fix.detectChanges();

            //test default title positions
            for (const step of stepper.steps) {
                expect(step.titlePosition).toBe(stepper._defaultTitlePosition);
                expect(step.titlePosition).toBe(IgxStepperTitlePosition.End);
                expect(step.nativeElement).toHaveClass(`igx-step--${stepper._defaultTitlePosition}`);
            }

            positions.forEach((pos: IgxStepperTitlePosition) => {
                stepper.titlePosition = pos;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement).toHaveClass(`igx-step--${pos}`);
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

            expect(step0).not.toHaveClass(INVALID_CLASS);
            expect(step0).toHaveClass(CURRENT_CLASS);
            expect(stepper.steps[0].nativeElement).not.toHaveClass(COMPLETED_CLASS);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('edit');

            stepper.steps[0].isValid = false;
            fix.detectChanges();
            stepper.steps[1].active = true;
            fix.detectChanges();

            indicatorElement = step0.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0).toHaveClass(INVALID_CLASS);
            expect(step0).not.toHaveClass(CURRENT_CLASS);
            expect(stepper.steps[0].nativeElement).not.toHaveClass(COMPLETED_CLASS);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('error');

            stepper.steps[0].isValid = true;
            stepper.steps[0].completed = true;
            fix.detectChanges();

            indicatorElement = step0.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0).not.toHaveClass(INVALID_CLASS);
            expect(step0).not.toHaveClass(CURRENT_CLASS);
            expect(stepper.steps[0].nativeElement).toHaveClass(COMPLETED_CLASS);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('check');
        });

        it('should be able to display the steps\' content above the steps headers when the stepper is horizontally orientated', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();
            expect(stepper.contentTop).toBeFalsy();

            expect(stepper.nativeElement.children[0]).toHaveClass(STEPPER_HEADER);
            expect(stepper.nativeElement.children[1]).toHaveClass(STEPPER_BODY);

            stepper.contentTop = true;
            fix.detectChanges();

            expect(stepper.nativeElement.children[0]).toHaveClass(STEPPER_BODY);
            expect(stepper.nativeElement.children[1]).toHaveClass(STEPPER_HEADER);
        });

        it('should allow modifying animationSettings that are used for transitioning between steps ', fakeAsync(() => {
            const numericTestValues = [100, 1000];

            for (const val of numericTestValues) {
                fix.componentInstance.animationDuration = val as any;
                testAnimationBehavior(val, fix, false);
            }

            const fallbackToDefaultValues = [-1, 0, null, undefined, 'sampleString', [], {}];
            for (const val of fallbackToDefaultValues) {
                fix.componentInstance.animationDuration = val as any;
                fix.detectChanges();
                expect(stepper.animationDuration)
                    .toBe((stepper as any)._defaultAnimationDuration);
                testAnimationBehavior(val, fix, false);
            }

            fix.componentInstance.animationDuration = 300;
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            const horAnimTypeValidValues = ['slide', 'fade', 'none'];
            for (const val of horAnimTypeValidValues) {
                fix.componentInstance.horizontalAnimationType = val as any;
                testAnimationBehavior(val, fix, false);
            }

            const horAnimTypeTestValues = ['sampleString', null, undefined, 0, [], {}];
            for (const val of horAnimTypeTestValues) {
                fix.componentInstance.horizontalAnimationType = val as any;
                testAnimationBehavior(val, fix, true);
            }

            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            const vertAnimTypeTestValues = ['fade', 'grow', 'none', 'sampleString', null, undefined, 0, [], {}];
            for (const val of vertAnimTypeTestValues) {
                fix.componentInstance.verticalAnimationType = val as any;
                testAnimationBehavior(val, fix, false);
            }
        }));

        it('should fall back to the default animation duration of 320ms for invalid values', () => {
            expect(stepper.animationDuration).toBe(300);

            for (const val of [-1, 0, null, undefined, 'sampleString']) {
                fix.componentInstance.animationDuration = val as any;
                fix.detectChanges();

                expect(stepper.animationDuration).withContext(`${val}`).toBe(320);
                expect((stepper.verticalAnimationSettings.openAnimation as any).options.params.duration)
                    .withContext(`${val}`).toBe('320ms');
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

        it('should render dynamically added step and properly set the linear disabled steps with its addition', fakeAsync(() => {
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
            tick(300);
            fix.componentInstance.displayHiddenStep = false;
            fix.detectChanges();
            tick(300);

            let firstAccessibleStepIdx = stepper.steps.findIndex(step => step.isAccessible);
            expect(stepper.steps[firstAccessibleStepIdx].active).toBeTruthy();

            fix.componentInstance.displayHiddenStep = true;
            fix.detectChanges();
            tick(300);
            stepper.steps[2].active = true;
            stepper.steps[0].disabled = true;
            fix.detectChanges();
            tick(300);
            expect(stepper.steps[0].isAccessible).toBeFalsy();

            fix.componentInstance.displayHiddenStep = false;
            fix.detectChanges();
            tick(300);

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
            tick(300);

            expect(stepper.steps[2].linearDisabled).toBeTruthy();

            for (let index = 3; index <= 5; index++) {
                const step = stepper.steps[index];
                expect(step.linearDisabled).toBeTruthy();
            }
        }));

        it('should activate the first accessible step and clear the visited steps collection when the stepper is reset', fakeAsync(() => {
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
        }));

        it('should properly collapse the previously active step in horizontal orientation and animation type \'fade\'', fakeAsync(() => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            stepper.horizontalAnimationType = 'fade';
            testAnimationBehavior('fade', fix, false);
        }));

        it('should not shrink the step indicator in vertical orientation when titlePosition="end" and the title is very long', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxStepperIndicatorNoShrinkComponent);
            fixture.detectChanges();
            tick();

            const stepperInstance = fixture.componentInstance.stepper;
            const indicator = stepperInstance.steps[0].nativeElement.querySelector(`.${STEP_INDICATOR_CLASS}`) as HTMLElement;

            const { minWidth } = getComputedStyle(indicator);
            const { width, height } = indicator.getBoundingClientRect();

            expect(minWidth).not.toBe('0px');
            expect(minWidth).not.toBe('auto');
            expect(Math.abs(width - height)).toBeLessThan(1.5);
            expect(Math.abs(width - parseFloat(minWidth))).toBeLessThan(1.5);
        }));

        it('should not shift step content horizontally when navigating between steps in vertical mode', fakeAsync(() => {
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
            tick(500);

            const step0InactiveStyles = getContentWrapperStyles(0);

            expect(step0InactiveStyles.paddingInlineStart).toBe(step0ActiveStyles.paddingInlineStart);
            expect(step0InactiveStyles.marginInlineStart).toBe(step0ActiveStyles.marginInlineStart);
        }));
    });

    describe('Keyboard navigation', () => {
        it('should navigate to first/last step on Home/End key press', fakeAsync(() => {
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();
            const serviceCollapseSpy = spyOn((stepper as any).stepperService, 'collapse').and.callThrough();

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
        }));

        it('should activate the currently focused step on Enter/Space key press', fakeAsync(() => {
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();
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
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[3]);

            stepper.steps[4].nativeElement.focus();
            fix.detectChanges();

            expect(document.activeElement).toBe(stepper.steps[4].nativeElement as Element);
            expect(stepper.steps[4].active).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem(' ', stepper.steps[4].nativeElement);
            fix.detectChanges();

            expect(stepper.steps[4].active).toBeTruthy();
            expect(serviceExpandSpy.calls.mostRecent().args[0]).toBe(stepper.steps[4]);
        }));

        it('should navigate to the next/previous step in horizontal orientation on Arrow Right/Left key press', fakeAsync(() => {
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
        }));

        it('should navigate to the next/previous step in vertical orientation on Arrow Down/Up key press', fakeAsync(() => {
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
        }));

        it('should specify tabIndex="0" for the active step and tabIndex="-1" for the other steps', fakeAsync(() => {
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
        }));

        it('should activate a step on header click in horizontal and vertical orientation', fakeAsync(() => {
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();
            const getHeader = (index: number) => stepper.steps[index].nativeElement.querySelector('.igx-step__header');

            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            UIInteractions.simulateClickEvent(getHeader(1));
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[1].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[1]);

            serviceExpandSpy.calls.reset();
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            UIInteractions.simulateClickEvent(getHeader(2));
            fix.detectChanges();
            tick(350);

            expect(stepper.steps[2].active).toBeTruthy();
            expect(serviceExpandSpy).toHaveBeenCalledOnceWith(stepper.steps[2]);
        }));

        it('should activate the focused step on Enter key press in vertical orientation for every animation type', fakeAsync(() => {
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            const changedSpy = spyOn(stepper.activeStepChanged, 'emit').and.callThrough();
            const animationTypes = [VerticalAnimationType.Grow, VerticalAnimationType.Fade, VerticalAnimationType.None];
            for (const [i, type] of animationTypes.entries()) {
                fix.componentInstance.verticalAnimationType = type;
                fix.detectChanges();
                const stepElement = stepper.steps[i + 1].nativeElement;

                stepElement.focus();
                UIInteractions.triggerKeyDownEvtUponElem('Enter', stepElement);
                fix.detectChanges();
                tick(350);

                expect(stepper.steps[i + 1].active).withContext(type).toBeTruthy();
                expect(stepper.steps[i].active).withContext(type).toBeFalsy();
                expect(changedSpy).withContext(type).toHaveBeenCalledOnceWith({ owner: stepper, index: i + 1 });
                changedSpy.calls.reset();
            }
        }));

        it('should not handle keyboard events that originate from the step content', fakeAsync(() => {
            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            const input = stepper.steps[0].nativeElement.querySelector('input');
            input.focus();
            fix.detectChanges();

            for (const key of ['End', ' ', 'ArrowDown']) {
                const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                input.dispatchEvent(event);
                fix.detectChanges();

                expect(event.defaultPrevented).withContext(key).toBeFalse();
                expect(document.activeElement).withContext(key).toBe(input);
            }
            expect(stepper.steps[0].active).toBeTruthy();
        }));

        it('should ignore ArrowUp/ArrowDown in horizontal orientation and keys that are not used for navigation', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            const stepElement = stepper.steps[1].nativeElement;
            stepElement.focus();

            for (const key of ['ArrowUp', 'ArrowDown', 'a', 'Tab', 'Escape']) {
                const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                stepElement.dispatchEvent(event);
                fix.detectChanges();

                expect(event.defaultPrevented).withContext(key).toBeFalse();
                expect(document.activeElement).withContext(key).toBe(stepElement);
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
                expect(document.activeElement).withContext(orientation).toBe(stepper.steps[0].nativeElement);

                UIInteractions.triggerKeyDownEvtUponElem(prevKey, stepper.steps[0].nativeElement);
                fix.detectChanges();
                expect(document.activeElement).withContext(orientation).toBe(stepper.steps[4].nativeElement);

                stepper.steps[0].disabled = true;
                stepper.steps[4].disabled = true;
                fix.detectChanges();

                // the last accessible step wraps to the first accessible one and vice versa
                stepper.steps[3].nativeElement.focus();
                UIInteractions.triggerKeyDownEvtUponElem(nextKey, stepper.steps[3].nativeElement);
                fix.detectChanges();
                expect(document.activeElement).withContext(orientation).toBe(stepper.steps[1].nativeElement);

                UIInteractions.triggerKeyDownEvtUponElem(prevKey, stepper.steps[1].nativeElement);
                fix.detectChanges();
                expect(document.activeElement).withContext(orientation).toBe(stepper.steps[3].nativeElement);

                // a disabled step is skipped when focusing the previous step
                stepper.steps[2].disabled = true;
                fix.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem(prevKey, stepper.steps[3].nativeElement);
                fix.detectChanges();
                expect(document.activeElement).withContext(orientation).toBe(stepper.steps[1].nativeElement);
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
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxStepperForComponent,
                    IgxStepperForEagerComponent,
                    IgxStepperBoundActiveComponent
                ]
            }).compileComponents();
        })
    );

    const verifyFirstStepActive = (stepper: IgxStepperComponent) => {
        const firstStep = stepper.steps[0].nativeElement;
        expect(firstStep.getAttribute('aria-selected')).toBe('true');
        expect(firstStep.getAttribute('tabindex')).toBe('0');
        expect(firstStep).toHaveClass(CURRENT_CLASS);
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
            expect(() => fixture.detectChanges()).withContext(host.name).not.toThrow();

            const steps = fixture.componentInstance.stepper.steps;
            expect(steps[0].nativeElement).withContext(host.name).not.toHaveClass(DISABLED_CLASS);
            expect(steps[1].nativeElement).withContext(host.name).toHaveClass(DISABLED_CLASS);
            expect(steps[2].nativeElement).withContext(host.name).toHaveClass(DISABLED_CLASS);
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

        expect(stepper.steps[1].active).toBeTrue();
        expect(fixture.componentInstance.activeChanges).toEqual(['Step 2:true']);

        stepper.steps[2].active = false;
        fixture.detectChanges();

        expect(fixture.componentInstance.activeChanges).toEqual(['Step 2:true']);
    });

    it('should remove the steps that are removed from the stepper from its state', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.componentInstance.linear = true;
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const stepperService: IgxStepperService = (stepper as any).stepperService;
        const [firstStep, , lastStep] = stepper.steps;

        expect(stepperService.linearDisabledSteps).toContain(lastStep);

        fixture.componentInstance.steps.set(STEPS_DATA.slice(0, 2));
        fixture.detectChanges();
        tick();

        expect(stepper.steps.length).toBe(2);
        expect(stepperService.linearDisabledSteps).not.toContain(lastStep);
        expect(stepperService.linearDisabledSteps.size).toBe(1);

        // removing the active step activates the first enabled step
        fixture.componentInstance.steps.set(STEPS_DATA.slice(1, 2));
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(stepper.steps.length).toBe(1);
        expect(stepper.steps[0].active).toBeTrue();
        expect(stepper.steps[0].nativeElement.getAttribute('aria-selected')).toBe('true');
        expect(stepperService.visitedSteps).not.toContain(firstStep);
        expect(stepperService.previousActiveStep).not.toBe(firstStep);
        expect(stepperService.linearDisabledSteps.size).toBe(0);
    }));

    it('should not keep the previously active step in the stepper state when it is removed', fakeAsync(() => {
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
        tick();
        fixture.detectChanges();

        expect(secondStep.active).toBeTrue();
        expect(secondStep.index).toBe(0);
        expect(secondStep.nativeElement.getAttribute('aria-posinset')).toBe('1');
        expect(secondStep.nativeElement.getAttribute('aria-setsize')).toBe('2');
        expect(secondStep.nativeElement.querySelector(`.${STEP_INDICATOR_CLASS}`).textContent.trim()).toBe('1');
        expect(stepperService.previousActiveStep).toBeUndefined();
        expect(stepperService.visitedSteps).not.toContain(firstStep);
    }));

    it('should not keep linear disabled steps when the active step is removed and no step can be activated', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.componentInstance.linear = true;
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const stepperService: IgxStepperService = (stepper as any).stepperService;

        expect(stepperService.linearDisabledSteps.size).toBe(2);

        // remove the active (invalid) step and disable the rest
        fixture.componentInstance.steps.set(STEPS_DATA.slice(1).map(step => ({ ...step, disabled: true })));
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(stepper.steps.some(step => step.active)).toBeFalse();
        expect(stepperService.linearDisabledSteps.size).toBe(0);

        // a step that is enabled later can be activated
        fixture.componentInstance.steps.set(STEPS_DATA.slice(1).map((step, index) => ({ ...step, disabled: index === 0 })));
        fixture.detectChanges();

        expect(stepper.steps[1].isAccessible).toBeTrue();

        stepper.next();
        fixture.detectChanges();
        tick(350);

        expect(stepper.steps[1].active).toBeTrue();
    }));

    it('should not throw and should be able to activate a step when there is no active step', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxStepperForComponent);
        fixture.componentInstance.steps.set(STEPS_DATA.map(step => ({ ...step, disabled: true })));
        fixture.detectChanges();
        const stepper = fixture.componentInstance.stepper;
        const changingSpy = spyOn(stepper.activeStepChanging, 'emit').and.callThrough();
        const changedSpy = spyOn(stepper.activeStepChanged, 'emit').and.callThrough();

        expect(stepper.steps.some(step => step.active)).toBeFalse();
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
        tick(350);

        expect(stepper.steps[1].active).toBeTrue();
        expect(stepper.steps[1].nativeElement.getAttribute('tabindex')).toBe('0');
        expect(changingSpy).toHaveBeenCalledOnceWith({ owner: stepper, newIndex: 1, oldIndex: -1, cancel: false });
        expect(changedSpy).toHaveBeenCalledOnceWith({ owner: stepper, index: 1 });
    }));
});

describe('Stepper service unit tests', () => {

    let stepperService: IgxStepperService;
    let mockElement: any;
    let mockElementRef: any;
    let mockCdr: any;
    let mockAnimationService: any;
    let mockPlatform: any;

    let steps: IgxStepComponent[] = [];
    let stepper: IgxStepperComponent;

    beforeAll(() => {
        jasmine.getEnv().allowRespy(true);
    });

    afterAll(() => {
        jasmine.getEnv().allowRespy(false);
    });

    beforeEach(() => {
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

        TestBed.configureTestingModule({
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
        });

        stepper = TestBed.inject(IgxStepperComponent);
        steps = [];
        for (let index = 0; index < 4; index++) {
            const fixture = TestBed.createComponent(IgxStepComponent);
            fixture.detectChanges();
            const newStep = fixture.componentInstance;
            newStep._index.set(index);
            steps.push(newStep);
        }
    });

    it('should expand a step by activating it and firing the step\'s activeChange event', () => {
        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Horizontal);
        spyOnProperty(stepper, 'steps', 'get').and.returnValue(steps);

        stepperService.activeStep = steps[0];

        steps[0].contentContainer = mockElementRef;
        steps[1].contentContainer = mockElementRef;

        spyOn(steps[0].activeChange, 'emit').and.callThrough();
        spyOn(steps[1].activeChange, 'emit').and.callThrough();

        stepperService.expand(steps[1]);
        expect(stepperService.activeStep).toBe(steps[1]);
        expect(steps[1].activeChange.emit).toHaveBeenCalledTimes(1);
        expect(steps[1].activeChange.emit).toHaveBeenCalledWith(true);

        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Vertical);
        stepperService.expand(steps[0]);

        expect(stepperService.activeStep).toBe(steps[0]);
        expect(steps[0].activeChange.emit).toHaveBeenCalledOnceWith(true);

        const testValues = [null, undefined, [], {}, 'sampleString'];

        for (const val of testValues) {
            expect(() => {
                stepperService.expand(val as any);
            }).toThrow();
        }
    });

    it('should expand a step through API by activating it and firing the step\'s activeChange event', () => {
        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Horizontal);
        spyOnProperty(stepper, 'steps', 'get').and.returnValue(steps);

        stepperService.activeStep = steps[0];

        spyOn(steps[0].activeChange, 'emit');
        spyOn(steps[1].activeChange, 'emit');

        stepperService.expandThroughApi(steps[1]);

        expect(stepperService.activeStep).toBe(steps[1]);
        expect(steps[0].activeChange.emit).toHaveBeenCalledOnceWith(false);
        expect(steps[1].activeChange.emit).toHaveBeenCalledOnceWith(true);

        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Vertical);
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
        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Horizontal);
        spyOnProperty(stepper, 'steps', 'get').and.returnValue(steps);

        stepperService.previousActiveStep = steps[0];
        stepperService.activeStep = steps[1];
        stepperService.collapsingSteps.add(stepperService.previousActiveStep);

        expect(stepperService.collapsingSteps).toContain(steps[0]);
        expect(stepperService.collapsingSteps).not.toContain(steps[1]);

        spyOn(steps[0].activeChange, 'emit');
        spyOn(steps[1].activeChange, 'emit');

        stepperService.collapse(steps[0]);

        expect(stepperService.collapsingSteps).not.toContain(steps[0]);
        expect(stepperService.activeStep).not.toBe(steps[0]);
        expect(stepperService.activeStep).toBe(steps[1]);
        expect(steps[0].activeChange.emit).toHaveBeenCalledOnceWith(false);
        expect(steps[1].activeChange.emit).not.toHaveBeenCalled();

        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Vertical);

        stepperService.previousActiveStep = steps[1];
        stepperService.activeStep = steps[0];

        stepperService.collapsingSteps.add(stepperService.previousActiveStep);
        expect(stepperService.collapsingSteps).toContain(steps[1]);
        expect(stepperService.collapsingSteps).not.toContain(steps[0]);

        stepperService.collapse(steps[1]);

        expect(stepperService.collapsingSteps).not.toContain(steps[1]);
        expect(stepperService.activeStep).not.toBe(steps[1]);
        expect(stepperService.activeStep).toBe(steps[0]);

        expect(steps[1].activeChange.emit).toHaveBeenCalledOnceWith(false);
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
        spyOnProperty(stepper, 'steps', 'get').and.returnValue(steps);
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
        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Horizontal);
        spyOnProperty(stepper, 'steps').and.returnValue(steps);

        for (const step of steps) {
            spyOnProperty(step, 'isValid').and.returnValue(false);
        }
        spyOnProperty(stepper, 'linear').and.returnValue(true);
        stepperService.activeStep = steps[0];
        spyOnProperty(steps[0], 'active').and.returnValue(true);

        expect(stepperService.linearDisabledSteps.size).toBe(0);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(3);
        let sampleSet = new Set<IgxStepComponent>([steps[1], steps[2], steps[3]]);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);

        spyOnProperty(steps[0], 'isValid').and.returnValue(true);
        stepperService.calculateLinearDisabledSteps();
        sampleSet = new Set<IgxStepComponent>([steps[2], steps[3]]);
        expect(stepperService.linearDisabledSteps.size).toBe(2);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);

        spyOnProperty(steps[1], 'active').and.returnValue(true);
        spyOnProperty(steps[1], 'isValid').and.returnValue(false);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(2);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);

        spyOnProperty(steps[1], 'isValid').and.returnValue(true);
        stepperService.activeStep = steps[1];
        sampleSet = new Set<IgxStepComponent>([steps[3]]);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(1);
        expect(new Set(stepperService.linearDisabledSteps)).toEqual(sampleSet);
        expect(stepperService.linearDisabledSteps).toContain(steps[3]);

        spyOnProperty(steps[2], 'isValid').and.returnValue(true);
        spyOnProperty(steps[3], 'isValid').and.returnValue(true);
        stepperService.activeStep = steps[3];
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(0);
        expect(stepperService.linearDisabledSteps).not.toContain(steps[3]);
    });

    it('should emit activating event', () => {
        spyOnProperty(stepper, 'orientation', 'get').and.returnValue(IgxStepperOrientation.Horizontal);
        spyOnProperty(stepper, 'steps').and.returnValue(steps);
        const activeChangingSpy = spyOn(stepper.activeStepChanging, 'emit');
        stepperService.activeStep = steps[0];

        let activeChangingEventArgs: any = {
            owner: stepper,
            newIndex: steps[1].index,
            oldIndex: steps[0].index,
            cancel: false
        };

        let result: boolean = stepperService.emitActivatingEvent(steps[1]);
        expect(result).toEqual(false);
        expect(activeChangingSpy).toHaveBeenCalledOnceWith(activeChangingEventArgs);

        activeChangingSpy.calls.reset();

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
        spyOn(steps[0].activeChange, 'emit');

        stepperService.collapse(steps[0]);

        expect(steps[0].activeChange.emit).not.toHaveBeenCalled();
        expect(stepperService.collapsingSteps).toContain(steps[0]);
    });

    it('should clear the linear disabled steps when there is no active step', () => {
        const stepsSpy = spyOnProperty(stepper, 'steps').and.returnValue(steps);
        stepperService.linearDisabledSteps.add(steps[1]);
        stepperService.linearDisabledSteps.add(steps[2]);

        stepperService.calculateLinearDisabledSteps();

        expect(stepsSpy).not.toHaveBeenCalled();
        expect(stepperService.linearDisabledSteps.size).toBe(0);
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
    @ViewChild(IgxStepperComponent) public stepper: IgxStepperComponent;

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
    @ViewChild(IgxStepperComponent) public stepper: IgxStepperComponent;
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
