import { Component, ViewChild, DebugElement } from '@angular/core';
import {
    async,
    fakeAsync,
    TestBed,
    tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxLinearProgressBarComponent } from './progressbar.component';
import { Common } from './common.spec';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgLinearBar', () => {
    configureTestSuite();
    const tickTime = 2000;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitLinearProgressBarComponent,
                LinearBarComponent,
                IgxLinearProgressBarComponent
            ]
        })
        .compileComponents();
    }));

    it('should initialize linearProgressbar with default values', () => {
        const fixture = TestBed.createComponent(InitLinearProgressBarComponent);
        fixture.detectChanges();

        const progress = fixture.componentInstance.linearBar;
        const domProgress = fixture.debugElement.query(By.css('igx-linear-bar')).nativeElement;
        const defaultMaxValue = 100;
        const defaultValue = 0;
        const defaultStriped = false;
        const defaultType = 'default';

        expect(progress.id).toContain('igx-linear-bar-');
        expect(domProgress.id).toContain('igx-linear-bar-');
        expect(progress.max).toBe(defaultMaxValue);
        expect(progress.striped).toBe(defaultStriped);
        expect(progress.type).toBe(defaultType);
        expect(progress.value).toBe(defaultValue);
    });

    it('should set value to 0 for negative values', fakeAsync(() => {
        const negativeValue = -20;
        const expectedValue = 0;
        const fixture = TestBed.createComponent(InitLinearProgressBarComponent);

        fixture.detectChanges();

        const progress = fixture.componentInstance.linearBar;
        progress.value = negativeValue;

        tick(tickTime);
        fixture.detectChanges();

        expect(progress.value).toBe(expectedValue);
    }));

    it('If passed value is higher then max it should stay equal to maximum (default max size)', fakeAsync(() => {
        const progressBarValue = 120;
        const expectedMaxValue = 100;
        const fixture = TestBed.createComponent(InitLinearProgressBarComponent);

        fixture.detectChanges();

        const progress = fixture.componentInstance.linearBar;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();

        expect(progress.value).toBe(expectedMaxValue);
    }));

    it(`If passed value is higher then max it should stay equal to maximum
        (custom max size and without animation)`, () => {
            const progressBarMaxValue = 150;
            const progressBarValue = 170;
            const fixture = TestBed.createComponent(InitLinearProgressBarComponent);
            fixture.detectChanges();

            const progress = fixture.componentInstance.linearBar;
            progress.animate = false;
            progress.max = progressBarMaxValue;
            progress.value = progressBarValue;

            fixture.detectChanges();

            expect(progress.value).toBe(progressBarMaxValue);
        });

    it('should not update value if max is decreased', fakeAsync(() => {
        let progressBarMaxValue = 200;
        const progressBarValue = 80;
        const fixture = TestBed.createComponent(InitLinearProgressBarComponent);
        fixture.detectChanges();

        const progress = fixture.componentInstance.linearBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();

        expect(progress.value).toBe(progressBarValue);

        progressBarMaxValue = 100;
        progress.max = progressBarMaxValue;

        tick(tickTime);
        fixture.detectChanges();

        expect(progress.value).toBe(progressBarValue);
    }));

    it('should not update value if max is increased (without animation)', () => {
        let progressBarMaxValue = 100;
        const progressBarValue = 50;
        const fixture = TestBed.createComponent(InitLinearProgressBarComponent);

        fixture.detectChanges();

        const progress = fixture.componentInstance.linearBar;
        progress.animate = false;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        fixture.detectChanges();

        expect(progress.value).toBe(progressBarValue);

        progressBarMaxValue = 200;
        progress.max = progressBarMaxValue;

        fixture.detectChanges();

        expect(progress.value).toBe(progressBarValue);
    });

    it('Should update value when we try to decrese it', fakeAsync(() => {
        const fixture = TestBed.createComponent(LinearBarComponent);
        fixture.detectChanges();
        const progressBar = fixture.componentInstance.linearBar;
        let expectedValue = 50;

        fixture.componentInstance.value = expectedValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progressBar.value).toBe(expectedValue);

        expectedValue = 20;
        fixture.componentInstance.value = expectedValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progressBar.value).toBe(expectedValue);
    }));

    it('Should update value when we try to decrease it (without animation)', () => {
        const fixture = TestBed.createComponent(LinearBarComponent);
        const progressBar = fixture.componentInstance.linearBar;
        let expectedValue = 50;

        fixture.componentInstance.animate = false;
        fixture.componentInstance.value = expectedValue;
        fixture.detectChanges();

        expect(progressBar.value).toBe(expectedValue);

        expectedValue = 20;
        fixture.componentInstance.value = expectedValue;
        fixture.detectChanges();

        expect(progressBar.value).toBe(expectedValue);
    });

    it('When passed value is string progress indication should remain the same', fakeAsync(() => {
        const fix = TestBed.createComponent(LinearBarComponent);
        fix.detectChanges();

        const datepicker = fix.componentInstance.linearBar;
        const expectedRes = fix.componentInstance.value;

        tick(tickTime);
        fix.detectChanges();
        expect(datepicker.value).toEqual(expectedRes);

        datepicker.value = '0345-234';
        tick(tickTime);
        fix.detectChanges();
        expect(datepicker.value).toEqual(expectedRes);
    }));

    it('The update step is 1% of the maximum value, which prevents from slow update with big nums', () => {
        const fix = TestBed.createComponent(LinearBarComponent);
        fix.detectChanges();

        const bar = fix.componentInstance.linearBar;
        const ONE_PERCENT = 0.01;
        let expectedValue = bar.max * ONE_PERCENT;
        expect(bar.step).toBe(expectedValue);

        const maxVal = 15345;
        fix.componentInstance.max = maxVal;
        fix.detectChanges();

        expectedValue = maxVal * ONE_PERCENT;
        expect(bar.step).toBe(expectedValue);
    });

    it('Value should not exceed the lower limit (0) when operating with floating numbers', fakeAsync(() => {
        const fix = TestBed.createComponent(LinearBarComponent);
        const compInstance = fix.componentInstance;
        compInstance.max = 2.5;
        compInstance.value = -0.3;
        fix.detectChanges();

        tick(tickTime);
        const bar = compInstance.linearBar;
        const expectedRes = 0;
        expect(bar.value).toBe(expectedRes);
        expect(bar.valueInPercent).toBe(expectedRes);

        compInstance.animate = false;
        compInstance.value = -2;

        fix.detectChanges();

        expect(bar.value).toBe(expectedRes);
        expect(bar.valueInPercent).toBe(expectedRes);
    }));

    it('Value should not exceed the max limit when operating with floating numbers', fakeAsync(() => {
        const fix = TestBed.createComponent(LinearBarComponent);
        const compInstance = fix.componentInstance;
        let value = 2.67;
        const max = 2.5;
        compInstance.max = max;
        compInstance.value = value;
        fix.detectChanges();

        const bar = compInstance.linearBar;
        tick(tickTime);
        expect(bar.value).toBe(max);
        expect(bar.valueInPercent).toBe(100);

        value = 3.01;
        compInstance.animate = false;
        compInstance.value = value;

        fix.detectChanges();
        expect(bar.value).toBe(max);
        expect(bar.valueInPercent).toBe(100);
    }));

    it('when passing string as value it should be parsed correctly', () => {
        const fix = TestBed.createComponent(LinearBarComponent);
        const compInstance = fix.componentInstance;
        const stringValue = '0.50';
        compInstance.value = stringValue;
        fix.detectChanges();

        const bar = compInstance.linearBar;

        let expectedRes: number | string = stringValue.toString();
        expect(bar.value).not.toBe(expectedRes);
        expectedRes = parseFloat(stringValue);
        expect(bar.value).toBe(expectedRes);
    });

    it('when update step is bigger than passed value the progress indicator should follow the value representation', () => {
        const fix = TestBed.createComponent(InitLinearProgressBarComponent);
        fix.detectChanges();

        const bar = fix.componentInstance.linearBar;
        const step = 5;
        const value = 2;
        const max = 10;
        bar.step = step;
        bar.max = max;
        bar.value = value;

        fix.detectChanges();

        const percentValue = Common.calcPercentage(value, max);
        expect(bar.value).toBe(value);
        expect(bar.step).toBe(step);
        expect(bar.max).toBe(max);
        expect(bar.valueInPercent).toBe(percentValue);
    });

    it(`when step value is not divisble to passed value the result returned from the
        value getter should be as same as the passed one`, fakeAsync(() => {
            const fix = TestBed.createComponent(InitLinearProgressBarComponent);
            fix.detectChanges();

            const bar = fix.componentInstance.linearBar;
            const step = 3.734;
            let value = 30;
            let valueInPercent = Common.calcPercentage(value, bar.max);
            bar.step = step;
            bar.value = value;

            tick(tickTime);
            fix.detectChanges();
            expect(bar.step).toBe(step);
            expect(bar.value).toBe(value);
            expect(bar.valueInPercent).toBe(valueInPercent);

            value = 10;
            valueInPercent = Common.calcPercentage(value, bar.max);
            bar.value = value;
            tick(tickTime);
            fix.detectChanges();
            expect(bar.value).toBe(value);
            expect(bar.valueInPercent).toBe(valueInPercent);
    }));

    // UI Tests
    describe('UI tests linear bar', () => {
        configureTestSuite();
        it('The percentage representation should respond to passed value correctly', fakeAsync(() => {
            const fixture = TestBed.createComponent(LinearBarComponent);
            fixture.detectChanges();

            const componentInstance = fixture.componentInstance;
            const progressBarContainer =
                fixture.debugElement.nativeElement.querySelector('.progress-linear__bar');
            const progressBarElem = progressBarContainer.querySelector('[class*=\'progress-linear__bar-progress\']');

            tick(tickTime);
            fixture.detectChanges();

            expect(progressBarElem.style.width).toBe(componentInstance.value + '%');
            expect(progressBarContainer.attributes['aria-valuenow'].textContent).toBe(componentInstance.value.toString());
        }));

        it('Should change class suffix which would be relevant to the type that has been passed', () => {
            const fixture = TestBed.createComponent(LinearBarComponent);
            fixture.detectChanges();

            const progressBarContainer =
                fixture.debugElement.nativeElement.querySelector('.progress-linear__bar');
            const progressBarElem = progressBarContainer.querySelector('[class*=\'progress-linear__bar-progress\']');

            expect(progressBarElem.classList.contains('progress-linear__bar-progress--default')).toBe(true);

            fixture.componentInstance.type = 'info';
            fixture.detectChanges();

            expect(progressBarElem.classList.contains('progress-linear__bar-progress--info')).toBe(true);
        });

        it('Change progressbar style to be striped', () => {
            const fixture = TestBed.createComponent(LinearBarComponent);
            fixture.detectChanges();

            const progressElem = fixture.debugElement.nativeElement
                .getElementsByClassName('progress-linear')[0];

            expect(progressElem.classList.contains('progress-linear--striped')).toBe(false);

            fixture.componentInstance.striped = true;
            fixture.detectChanges();

            expect(progressElem.classList.contains('progress-linear--striped')).toBe(true);
        });

        it('should stay striped when the type has changed', () => {
            const fixture = TestBed.createComponent(LinearBarComponent);
            fixture.detectChanges();

            const progressElem = fixture.debugElement.nativeElement
                .getElementsByClassName('progress-linear')[0];

            const progressBarContainer =
                fixture.debugElement.nativeElement.querySelector('.progress-linear__bar');
            const progressBarElem = progressBarContainer.querySelector('[class*=\'progress-linear__bar-progress\']');

            fixture.componentInstance.striped = true;
            fixture.detectChanges();

            expect(progressBarElem.classList.contains('progress-linear__bar-progress--default')).toBe(true);
            expect(progressElem.classList.contains('progress-linear--striped')).toBe(true);

            fixture.componentInstance.type = 'success';
            fixture.detectChanges();

            expect(progressBarElem.classList.contains('progress-linear__bar-progress--success')).toBe(true);
            expect(progressElem.classList.contains('progress-linear--striped')).toBe(true);
        });

        it('Manipulate progressbar with floating point numbers', fakeAsync(() => {
            const fix = TestBed.createComponent(InitLinearProgressBarComponent);
            fix.detectChanges();

            const bar = fix.componentInstance.linearBar;
            const maxVal = 1.25;
            const val = 0.50;

            bar.max = maxVal;
            bar.value = val;
            tick(tickTime);
            fix.detectChanges();

            const progressRepresentation = Common.calcPercentage(val, maxVal);
            const getProgressIndicator = fix.debugElement.query(By.css(`[class*='progress-linear__bar-progress']`));
            expect(getProgressIndicator.styles.width).toBe(`${progressRepresentation}%`);
        }));

        it('Prevent constant update of progress value when value and max value differ', fakeAsync(() => {
            const fix = TestBed.createComponent(InitLinearProgressBarComponent);
            fix.detectChanges();

            const bar = fix.componentInstance.linearBar;
            const maxVal = 3.25;
            const value = 2.55;
            bar.step = 0.634;
            bar.max = maxVal;
            bar.value  = value;

            tick(tickTime + tickTime); // enough time to exceed the progress update.
            fix.detectChanges();

            const progressBarContainer = fix.debugElement.query(By.css('.progress-linear__bar')).nativeElement;
            expect(parseFloat(progressBarContainer.attributes['aria-valuenow'].textContent)).toBe(value);
            expect(bar.value).toBe(value);
        }));
    });
});

@Component({ template: `<igx-linear-bar [animate]="true"></igx-linear-bar>` })
class InitLinearProgressBarComponent {
    @ViewChild(IgxLinearProgressBarComponent) public linearBar: IgxLinearProgressBarComponent;
}

@Component({
    template: `<div #wrapper>
                            <igx-linear-bar #linearBar [value]="value" [max]="max"
                                [animate]="animate" [type]="type" [striped]="striped">
                            </igx-linear-bar>
                        </div>` })
class LinearBarComponent {
    @ViewChild(IgxLinearProgressBarComponent) public progressbar: IgxLinearProgressBarComponent;
    @ViewChild('wrapper') public wrapper;
    @ViewChild('linearBar') public linearBar;

    public value: string | number = 30;
    public max = 100;
    public type = 'default';
    public striped = false;
    public animate = true;
}
