import { AnimationBuilder } from '@angular/animations';
import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxInputDirective, IgxInputGroupComponent } from '../input-group/public_api';
import { Direction } from '../services/direction/directionality';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxStepComponent } from './step/step.component';
import {
    HorizontalAnimationType,
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
const STEP_HEADER = 'igx-stepper__step-header';
const STEP_INDICATOR_CLASS = 'igx-stepper__step-indicator';
const STEP_TITLE_CLASS = 'igx-stepper__step-title';
const STEP_SUBTITLE_CLASS = 'igx-stepper__step-subtitle';
const INVALID_CLASS = 'igx-stepper__step-header--invalid';
const DISABLED_CLASS = 'igx-stepper__step--disabled';
const COMPLETED_CLASS = 'igx-stepper__step--completed';
const CURRENT_CLASS = 'igx-stepper__step-header--current';

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

const testAnimationBehvior = (
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
    configureTestSuite();
    let fix: ComponentFixture<IgxStepperSampleTestComponent>;
    let stepper: IgxStepperComponent;

    beforeAll(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxStepperSampleTestComponent,
                    IgxStepperLinearComponent
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

            expect(stepper.steps[1].nativeElement).toHaveClass('igx-stepper__step--disabled');

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

        it('should calculate disabled steps properly when the stepper is initially in linear mode', fakeAsync(()=>{
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
    });

    describe('Appearance', () => {
        it('should apply the appropriate class to a stepper in horizontal mode', () => {
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            expect(stepper.nativeElement).toHaveClass('igx-stepper--horizontal');
            // no css class is applied when the stepper is in vertical mode
        });

        it('should indicate the currently active step', () => {
            const step0Header = stepper.steps[0].nativeElement.querySelector(`.${STEP_HEADER}`);
            const step1Header = stepper.steps[1].nativeElement.querySelector(`.${STEP_HEADER}`);
            const serviceExpandSpy = spyOn((stepper as any).stepperService, 'expand').and.callThrough();

            stepper.steps[0].active = true;
            fix.detectChanges();

            expect(step0Header).toHaveClass(CURRENT_CLASS);

            stepper.steps[1].active = true;
            stepper.steps[1].nativeElement.focus();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem(' ', stepper.steps[1].nativeElement);
            fix.detectChanges();

            expect(step0Header).not.toHaveClass(CURRENT_CLASS);
            expect(step1Header).toHaveClass(CURRENT_CLASS);
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
            const step0Header = stepper.steps[0].nativeElement.querySelector(`.${STEP_HEADER}`);
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
                expect(step.nativeElement).toHaveClass(`igx-stepper__step--${stepper._defaultTitlePosition}`);
            }

            const positions = getStepperPositions();
            positions.forEach((pos: IgxStepperTitlePosition) => {
                stepper.titlePosition = pos;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement).toHaveClass(`igx-stepper__step--${pos}`);
                }
            });

            stepper.orientation = IgxStepperOrientation.Vertical;
            stepper.titlePosition = null;
            fix.detectChanges();

            //test default title positions
            for (const step of stepper.steps) {
                expect(step.titlePosition).toBe(stepper._defaultTitlePosition);
                expect(step.titlePosition).toBe(IgxStepperTitlePosition.End);
                expect(step.nativeElement).toHaveClass(`igx-stepper__step--${stepper._defaultTitlePosition}`);
            }

            positions.forEach((pos: IgxStepperTitlePosition) => {
                stepper.titlePosition = pos;
                fix.detectChanges();

                for (const step of stepper.steps) {
                    expect(step.nativeElement).toHaveClass(`igx-stepper__step--${pos}`);
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
            const step0Header = stepper.steps[0].nativeElement.querySelector(`.${STEP_HEADER}`);
            let indicatorElement = step0Header.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0Header).not.toHaveClass(INVALID_CLASS);
            expect(step0Header).toHaveClass(CURRENT_CLASS);
            expect(stepper.steps[0].nativeElement).not.toHaveClass(COMPLETED_CLASS);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('edit');

            stepper.steps[0].isValid = false;
            fix.detectChanges();
            stepper.steps[1].active = true;
            fix.detectChanges();

            indicatorElement = step0Header.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0Header).toHaveClass(INVALID_CLASS);
            expect(step0Header).not.toHaveClass(CURRENT_CLASS);
            expect(stepper.steps[0].nativeElement).not.toHaveClass(COMPLETED_CLASS);
            expect(indicatorElement.tagName).toBe('IGX-ICON');
            expect(indicatorElement.textContent).toBe('error');

            stepper.steps[0].isValid = true;
            stepper.steps[0].completed = true;
            fix.detectChanges();

            indicatorElement = step0Header.querySelector(`.${STEP_INDICATOR_CLASS}`).children[0];

            expect(step0Header).not.toHaveClass(INVALID_CLASS);
            expect(step0Header).not.toHaveClass(CURRENT_CLASS);
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
                testAnimationBehvior(val, fix, false);
            }

            const fallbackToDefaultValues = [-1, 0, null, undefined, 'sampleString', [], {}];
            for (const val of fallbackToDefaultValues) {
                fix.componentInstance.animationDuration = val as any;
                fix.detectChanges();
                expect(stepper.animationDuration)
                    .toBe((stepper as any)._defaultAnimationDuration);
                testAnimationBehvior(val, fix, false);
            }

            fix.componentInstance.animationDuration = 300;
            stepper.orientation = IgxStepperOrientation.Horizontal;
            fix.detectChanges();

            const horAnimTypeValidValues = ['slide', 'fade', 'none'];
            for (const val of horAnimTypeValidValues) {
                fix.componentInstance.horizontalAnimationType = val as any;
                testAnimationBehvior(val, fix, false);
            }

            const horAnimTypeTestValues = ['sampleString', null, undefined, 0, [], {}];
            for (const val of horAnimTypeTestValues) {
                fix.componentInstance.horizontalAnimationType = val as any;
                testAnimationBehvior(val, fix, true);
            }

            stepper.orientation = IgxStepperOrientation.Vertical;
            fix.detectChanges();

            const vertAnimTypeTestValues = ['fade', 'grow', 'none', 'sampleString', null, undefined, 0, [], {}];
            for (const val of vertAnimTypeTestValues) {
                fix.componentInstance.verticalAnimationType = val as any;
                testAnimationBehvior(val, fix, false);
            }
        }));

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
            testAnimationBehvior('fade', fix, false);
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

describe('Stepper service unit tests', () => {
    configureTestSuite();

    let stepperService: IgxStepperService;
    let mockElement: any;
    let mockElementRef: any;
    let mockCdr: any;
    let mockAnimationService: any;
    let mockPlatform: any;
    let mockDocument: any;
    let mockDir: any;

    let steps: IgxStepComponent[] = [];
    let stepper: IgxStepperComponent;

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

        mockDocument = {
            body: mockElement,
            defaultView: mockElement,
            createElement: () => mockElement,
            appendChild: () => { },
            addEventListener: (_type: string, _listener: (this: HTMLElement, ev: MouseEvent) => any) => { },
            removeEventListener: (_type: string, _listener: (this: HTMLElement, ev: MouseEvent) => any) => { }
        };

        mockDir = {
            value: (): Direction => 'rtl',
            document: () => mockDocument,
            rtl: () => true
        };

        mockCdr = {
            markForCheck: (): void => { },
            detach: (): void => { },
            detectChanges: (): void => { },
            checkNoChanges: (): void => { },
            reattach: (): void => { },
        };

        stepperService = new IgxStepperService();
        stepper = new IgxStepperComponent(mockCdr, mockAnimationService, stepperService, mockElementRef);
        steps = [];
        for (let index = 0; index < 4; index++) {
            const newStep = new IgxStepComponent(stepper, mockCdr, null,
                mockPlatform, stepperService, mockAnimationService, mockElementRef, mockDir);
            newStep._index = index;
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

        const testValues = [null, undefined, [], {}, 'sampleString'];

        for (const val of testValues) {
            expect(() => {
                stepperService.collapse(val as any);
            }).toThrow();
        }
    });

    it('should determine the steps that are marked as visited based on the active step', () => {
        spyOnProperty(stepper, 'steps', 'get').and.returnValue(steps);
        let sampleSet: Set<IgxStepComponent>;

        stepperService.activeStep = steps[0];
        stepperService.calculateVisitedSteps();
        expect(stepperService.visitedSteps.size).toEqual(1);
        sampleSet = new Set<IgxStepComponent>([steps[0]]);
        expect(stepperService.visitedSteps).toEqual(sampleSet);

        stepperService.activeStep = steps[1];
        stepperService.calculateVisitedSteps();
        expect(stepperService.visitedSteps.size).toEqual(2);
        sampleSet = new Set<IgxStepComponent>([steps[0], steps[1]]);
        expect(stepperService.visitedSteps).toEqual(sampleSet);

        stepperService.activeStep = steps[2];
        stepperService.calculateVisitedSteps();
        expect(stepperService.visitedSteps.size).toEqual(3);
        sampleSet = new Set<IgxStepComponent>([steps[0], steps[1], steps[2]]);
        expect(stepperService.visitedSteps).toEqual(sampleSet);
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
        expect(stepperService.linearDisabledSteps).toEqual(sampleSet);

        spyOnProperty(steps[0], 'isValid').and.returnValue(true);
        stepperService.calculateLinearDisabledSteps();
        sampleSet = new Set<IgxStepComponent>([steps[2], steps[3]]);
        expect(stepperService.linearDisabledSteps.size).toBe(2);
        expect(stepperService.linearDisabledSteps).toEqual(sampleSet);

        spyOnProperty(steps[1], 'active').and.returnValue(true);
        spyOnProperty(steps[1], 'isValid').and.returnValue(false);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(2);
        expect(stepperService.linearDisabledSteps).toEqual(sampleSet);

        spyOnProperty(steps[1], 'isValid').and.returnValue(true);
        stepperService.activeStep = steps[1];
        sampleSet = new Set<IgxStepComponent>([steps[3]]);
        stepperService.calculateLinearDisabledSteps();
        expect(stepperService.linearDisabledSteps.size).toBe(1);
        expect(stepperService.linearDisabledSteps).toEqual(sampleSet);
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

        <igx-step #hiddenStep *ngIf="displayHiddenStep">
            <span igxStepIndicator>*</span>
            <span igxStepTitle>Hidden step</span>
            <span igxStepSubtitle>Step SubTitle</span>
            <div igxStepContent class="sample-body">
               <p>Test hidden step</p>
            </div>
        </igx-step>

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
        NgIf
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
    imports: [IgxStepperComponent, IgxStepComponent]
})
export class IgxStepperLinearComponent {
    @ViewChild(IgxStepperComponent) public stepper: IgxStepperComponent;
}
