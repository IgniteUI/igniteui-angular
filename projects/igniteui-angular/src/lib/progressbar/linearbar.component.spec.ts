import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxLinearProgressBarComponent, toPercent } from './progressbar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

const SUCCESS_TYPE_CLASS = 'igx-linear-bar--success';
const INFO_TYPE_CLASS = 'igx-linear-bar--info';
const STRIPED_CLASS = 'igx-linear-bar--striped';
const LINEAR_BAR_TAG = 'igx-linear-bar';
const INDETERMINATE_CLASS = 'igx-linear-bar--indeterminate';

describe('IgxLinearBar', () => {
    let progress: IgxLinearProgressBarComponent;
    let fixture: ComponentFixture<IgxLinearProgressBarComponent>;

    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgxLinearProgressBarComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxLinearProgressBarComponent);
        progress = fixture.componentInstance;
        progress.animate = false;
        fixture.detectChanges();
    });

    it('should initialize linearProgressbar with default values', () => {
        const domProgress = fixture.debugElement.nativeElement;
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

    it('should initialize linearProgressbar with non-default values', () => {
        const domProgress = fixture.debugElement.nativeElement;
        const defaultMaxValue = 100;
        const defaultValue = 0;
        const newStriped = true;
        const newType = 'error';

        progress.striped = newStriped;
        progress.type = newType;

        fixture.detectChanges();

        expect(progress.id).toContain('igx-linear-bar-');
        expect(domProgress.id).toContain('igx-linear-bar-');
        expect(progress.max).toBe(defaultMaxValue);
        expect(progress.striped).toBe(newStriped);
        expect(progress.type).toBe(newType);
        expect(progress.value).toBe(defaultValue);
        expect(progress.animate).toBe(false);
    });

    it('should set value to 0 for negative values', () => {
        const negativeValue = -20;
        const expectedValue = 10;

        progress.value = expectedValue;
        expect(progress.value).toBe(expectedValue);

        progress.value = negativeValue;
        expect(progress.value).toBe(expectedValue);
    });

    it('If passed value is higher then max it should stay equal to maximum (default max size)', () => {
        const progressBarValue = 120;
        const expectedMaxValue = 100;
        const expectedValue = 10;

        progress.value = expectedValue;
        expect(progress.value).toBe(expectedValue);

        progress.value = progressBarValue;
        expect(progress.value).toBe(expectedMaxValue);
    });

    it(`If passed value is higher then max it should stay equal to maximum (custom max size and without animation)`, () => {
        let progressBarMaxValue = 150;
        const progressBarValue = 170;

        progress.value = 30;
        expect(progress.value).toBe(30);

        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.value).toBe(progressBarMaxValue);

        progressBarMaxValue = 50;
        progress.max = progressBarMaxValue;
        expect(progress.value).toBe(50);
    });

    it('should not update value if max is decreased', () => {
        let progressBarMaxValue = 200;
        const progressBarValue = 80;

        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.value).toBe(progressBarValue);

        progressBarMaxValue = 100;
        progress.max = progressBarMaxValue;

        expect(progress.value).toBe(progressBarValue);
    });

    it('should not update value if max is increased (without animation)', () => {
        let progressBarMaxValue = 100;
        const progressBarValue = 50;

        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.value).toBe(progressBarValue);

        progressBarMaxValue = 200;
        progress.max = progressBarMaxValue;

        expect(progress.value).toBe(progressBarValue);
    });

    it('when update step is bigger than passed value the progress indicator should follow the value itself', () => {
        const step = 5;
        const value = 2;
        const max = 10;
        progress.step = step;
        progress.max = max;
        progress.value = value;

        const percentValue = toPercent(value, max);
        expect(progress.value).toBe(value);
        expect(progress.step).toBe(step);
        expect(progress.max).toBe(max);
        expect(progress.valueInPercent).toBe(percentValue);

        // Should not set a step larger than max value
        progress.step = 20;
        expect(progress.step).toBe(step);
        expect(progress.max).toBe(max);
    });

    it('When indeterminate mode is on value should not be updated', () => {
        expect(progress.value).toEqual(0);

        progress.indeterminate = true;
        progress.value = 30;
        expect(progress.value).toEqual(0);

        progress.value = 20;
        expect(progress.value).toEqual(0);
    });

    it('Prevent constant update of progress value when value and max value differ', () => {
        const maxVal = 3.25;
        const value = 2.55;
        const progressBar = fixture.debugElement.nativeElement;

        expect(progressBar.attributes['aria-valuenow'].textContent).toBe(progress.value.toString());
        progress.step = 0.634;
        progress.max = maxVal;
        progress.value  = value;

        fixture.detectChanges();

        expect(parseFloat(progressBar.attributes['aria-valuenow'].textContent)).toBe(value);
        expect(progress.value).toBe(value);
    });

    it('Should update value when we try to decrese it', () => {
        let expectedValue = 50;
        progress.value = expectedValue;
        expect(progress.value).toBe(expectedValue);

        expectedValue = 20;
        progress.value = expectedValue;
        expect(progress.value).toBe(expectedValue);
    });

    it('The update step is 1% of the maximum value, which prevents from slow update with big nums', () => {
        const ONE_PERCENT = 0.01;
        let expectedValue = progress.max * ONE_PERCENT;
        expect(progress.step).toBe(expectedValue);

        const maxVal = 15345;
        progress.max = maxVal;

        expectedValue = maxVal * ONE_PERCENT;
        expect(progress.step).toBe(expectedValue);
    });

    it('Value should not exceed the lower limit (0) when operating with floating numbers', () => {
        progress.max = 2.5;
        progress.value = -0.3;

        const expectedRes = 0;
        expect(progress.value).toBe(expectedRes);
        expect(progress.valueInPercent).toBe(expectedRes);

        progress.value = -2;

        expect(progress.value).toBe(expectedRes);
        expect(progress.valueInPercent).toBe(expectedRes);
    });

    it('Value should not exceed the max limit when operating with floating numbers', () => {
        let value = 2.67;
        const max = 2.5;

        expect(progress.value).toBe(0);

        progress.max = max;
        progress.value = value;

        expect(progress.value).toBe(max);
        expect(progress.valueInPercent).toBe(100);

        value = 3.01;
        progress.value = value;

        expect(progress.value).toBe(max);
        expect(progress.valueInPercent).toBe(100);
    });

    it('Value should not exceed the max limit when max limit is set to 0', () => {
        let value = 10;
        const max = 0;

        expect(progress.value).toBe(0);

        progress.value = value;

        expect(progress.value).toBe(value);
        expect(progress.valueInPercent).toBe(10);

        progress.max = max;
        expect(progress.value).toBe(max);
    });

    it('Should change class suffix which would be relevant to the type that has been passed', () => {
        const linearBar = fixture.debugElement.nativeElement;

        expect(linearBar.classList.length).toEqual(1);
        expect(linearBar.classList.contains(LINEAR_BAR_TAG)).toEqual(true);

        progress.type = 'info';
        fixture.detectChanges();

        expect(linearBar.classList.contains(INFO_TYPE_CLASS)).toEqual(true);
    });

    it('Change progressbar style to be striped', () => {
        const linerBar = fixture.debugElement.nativeElement;

        expect(linerBar.classList.contains(STRIPED_CLASS)).toEqual(false);

        progress.striped = true;
        fixture.detectChanges();

        expect(linerBar.classList.contains(STRIPED_CLASS)).toEqual(true);
    });

    it('should stay striped when the type has changed', () => {
        const linearBar = fixture.debugElement.nativeElement;

        progress.striped = true;
        fixture.detectChanges();

        expect(linearBar.classList.contains(STRIPED_CLASS)).toEqual(true);

        progress.type = 'success';
        fixture.detectChanges();

        expect(linearBar.classList.contains(SUCCESS_TYPE_CLASS)).toEqual(true);
        expect(linearBar.classList.contains(STRIPED_CLASS)).toEqual(true);
    });

    it('When enable indeterminate mode, then the appropriate class should be applied.', () => {
        const bar = fixture.debugElement.nativeElement;
        expect(bar.classList.contains(INDETERMINATE_CLASS)).toEqual(false);

        progress.indeterminate = true;
        fixture.detectChanges();

        expect(bar.classList.contains(INDETERMINATE_CLASS)).toEqual(true);
    });
});
