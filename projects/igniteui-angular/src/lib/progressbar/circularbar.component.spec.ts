import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxCircularProgressBarComponent, IgxProgressBarModule, toPercent } from './progressbar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

const CIRCULAR_INNER_CLASS = 'igx-circular-bar__inner';
const CIRCULAR_OUTER_CLASS = 'igx-circular-bar__outer';
const CIRCULAR_TEXT_CLASS = 'igx-circular-bar__text';
const CIRCULAR_INDETERMINATE_CLASS = 'igx-circular-bar--indeterminate';

describe('IgxCircularBar', () => {
    configureTestSuite();

    describe('Unit Tests', () => {
        let progress: IgxCircularProgressBarComponent;
        let fixture: ComponentFixture<IgxCircularProgressBarComponent>;

        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    IgxProgressBarModule
                ]
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxCircularProgressBarComponent);
            progress = fixture.componentInstance;
            progress.animate = false;
            fixture.detectChanges();
        });

        it('Initialize circularProgressbar with default values', () => {
            const defaultMaxValue = 100;

            expect(progress.id).toContain('igx-circular-bar-');
            expect(progress.max).toBe(defaultMaxValue);
            expect(progress.value).toBe(0);
        });

        it('should set value to 0 for negative numbers', () => {
            const negativeValue = -20;
            const expectedValue = 10;
            expect(progress.value).toBe(0);

            progress.value = expectedValue;
            expect(progress.value).toBe(expectedValue);

            progress.value = negativeValue;
            expect(progress.value).toBe(expectedValue);
        });

        it('should set value to 0 for negative numbers', () => {
            const negativeValue = -20;
            const expectedValue = 0;

            progress.value = negativeValue;

            expect(progress.value).toBe(expectedValue);
        });

        it('If passed value is higher then max it should stay equal to maximum (default max size)', () => {
            const progressBarValue = 120;
            let expectedMaxValue = 100;

            progress.value = progressBarValue;

            expect(progress.value).toBe(expectedMaxValue);

            expectedMaxValue = 50;
            progress.max = expectedMaxValue;
            expect(progress.value).toBe(expectedMaxValue);
        });

        it('If passed value is higher then max it should stay equal to maximum (custom max size)', () => {
            const progressBarMaxValue = 150;
            const progressBarValue = 170;
            progress.max = progressBarMaxValue;
            progress.value = progressBarValue;

            expect(progress.value).toBe(progressBarMaxValue);
        });

        it('should not update value if max is updated', () => {
            let progressBarMaxValue = 150;
            const progressBarValue = 120;
            progress.max = progressBarMaxValue;
            progress.value = progressBarValue;

            expect(progress.value).toBe(progressBarValue);
            expect(progress.max).toBe(progressBarMaxValue);

            progressBarMaxValue = 200;
            progress.max = progressBarMaxValue;

            expect(progress.value).toBe(progressBarValue);
            expect(progress.max).toBe(progressBarMaxValue);
        });

        it('Should update value when we try to decrease it (without animation)', () => {
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
            progress.value = 0;
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
            progress.max = max;
            progress.value = value;

            expect(progress.value).toBe(max);
            expect(progress.valueInPercent).toBe(100);

            value = 3.01;
            progress.value = value;

            expect(progress.value).toBe(max);
            expect(progress.valueInPercent).toBe(100);
        });

        it('when update step is bigger than passed value the progress indicator should follow the value representation', () => {
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

        it(`when step value is not divisble to passed value the result returned from the value getter should be the same as the passed one`, () => {
            const step = 3.734;
            let value = 30;
            let valueInPercent = toPercent(value, progress.max);
            progress.step = step;
            progress.value = value;

            expect(progress.step).toBe(step);
            expect(progress.value).toBe(value);
            expect(progress.valueInPercent).toBe(valueInPercent);

            value = 10;
            valueInPercent = toPercent(value, progress.max);
            progress.value = value;

            expect(progress.value).toBe(value);
            expect(progress.valueInPercent).toBe(valueInPercent);
        });

        it('When indeterminate mode is on value should not be updated', () => {
            expect(progress.value).toEqual(0);

            progress.indeterminate = true;
            progress.value = 20;
            expect(progress.value).toEqual(0);

            progress.animate = false;
            progress.value = 30;
            expect(progress.value).toEqual(0);
        });

        it('Prevent constant update of progress value when value and max value differ', () => {
            const maxVal = 3.25;
            const value = 2.55;
            progress.step = 0.634;
            progress.max = maxVal;
            progress.value = value;

            fixture.detectChanges();

            const progressBarContainer = fixture.debugElement.nativeElement;
            expect(parseFloat(progressBarContainer.attributes['aria-valuenow'].textContent)).toBe(value);
            expect(progress.value).toBe(value);
        });

        it('When enable indeterminate mode, then the appropriate class should be applied.', () => {
            const bar = fixture.debugElement.nativeElement;
            expect(bar.classList.contains(CIRCULAR_INDETERMINATE_CLASS)).toEqual(false);

            progress.indeterminate = true;
            fixture.detectChanges();

            expect(bar.classList.contains(CIRCULAR_INDETERMINATE_CLASS)).toEqual(true);

            // Expect text in indeterminate bar to be hidden;
            expect(getComputedStyle(bar.querySelector('span')).visibility).toEqual('hidden');
        });

        it('should manipulate progressbar with floating point numbers', () => {
            const maxVal = 1.25;
            const val = 0.50;

            progress.max = maxVal;
            progress.value = val;

            fixture.detectChanges();

            const progressRepresentation = toPercent(val, maxVal);
            const progressBarElem = fixture.debugElement.nativeElement;
            const valueInPercent = progressBarElem.querySelector('span');
            expect(valueInPercent.textContent.trim()).toBe(`${progressRepresentation}%`);
        });

        it('should respond to passed values correctly', () => {
            const progressBarElem = fixture.debugElement.query(By.css('svg')).nativeElement;
            const textElement = fixture.debugElement.query(By.css('span')).nativeElement;
            let expectedTextContent = progress.value + '%';

            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe(progress.value.toString());
            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe(progress.max.toString());

            expect(textElement.classList.value).toBe(CIRCULAR_TEXT_CLASS);
            expect(textElement.textContent.trim()).toMatch(expectedTextContent);

            expectedTextContent = 'No progress';
            progress.text = expectedTextContent;
            fixture.detectChanges();

            expect(textElement.textContent.trim()).toMatch(expectedTextContent);
        });

        it('should respond correctly to passed maximum value', () => {
            const progressBarElem = fixture.debugElement.nativeElement;

            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe(progress.value.toString());
            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe(progress.max.toString());

            progress.max = 200;
            fixture.detectChanges();

            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe(progress.max.toString());
        });
    });

    describe('UI Tests', () => {
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    CircularBarTemplateComponent,
                    CircularBarTemplateGradientComponent
                ],
                imports: [
                    IgxProgressBarModule
                ]
            }).compileComponents();
        }));

        it('should apply its template correctly', () => {
            const fixture = TestBed.createComponent(CircularBarTemplateComponent);
            fixture.detectChanges();

            const componentInstance = fixture.componentInstance;
            const progressBarElem = fixture.debugElement.query(By.css('svg')).nativeElement;
            const textElement = fixture.debugElement.query(By.css('span')).nativeElement;

            fixture.detectChanges();
            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe('20');

            expect(progressBarElem.children[0]).toHaveClass(CIRCULAR_INNER_CLASS);
            expect(progressBarElem.children[1]).toHaveClass(CIRCULAR_OUTER_CLASS);

            expect(textElement.children.length).toBe(2);
            expect(textElement.children[0].textContent.trim()).toBe('Value is:');
            expect(textElement.children[1].textContent.trim()).toMatch('20');

            componentInstance.progressbar.textVisibility = false;
            fixture.detectChanges();

            // Text is not rendered
            expect(fixture.debugElement.query(By.css('text'))).toEqual(null);
        });

        it('should apply its gradient template correctly', () => {
            const fixture = TestBed.createComponent(CircularBarTemplateGradientComponent);
            fixture.detectChanges();

            const componentInstance = fixture.componentInstance;
            const progressBarElem = fixture.debugElement.query(By.css('svg')).nativeElement;
            const textElement = fixture.debugElement.query(By.css('span')).nativeElement;

            fixture.detectChanges();
            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe('20');

            expect(progressBarElem.children[0]).toHaveClass(CIRCULAR_INNER_CLASS);
            expect(progressBarElem.children[1]).toHaveClass(CIRCULAR_OUTER_CLASS);

            expect(textElement.textContent.trim()).toBe('20%');

            componentInstance.progressbar.textVisibility = false;
            fixture.detectChanges();

            // Text is not rendered
            expect(fixture.debugElement.query(By.css('text'))).toEqual(null);
        });
    });
});

@Component({
    template: `
        <igx-circular-bar [value]="20" [animate]="false" [max]="100" [textVisibility]="true">
            <ng-template igxProcessBarText let-process>
                <svg:tspan>Value is:</svg:tspan>
                <svg:tspan>{{process.value}}</svg:tspan>
            </ng-template>
        </igx-circular-bar>`
})
class CircularBarTemplateComponent {
    @ViewChild(IgxCircularProgressBarComponent, { static: true }) public progressbar: IgxCircularProgressBarComponent;
}

@Component({
    template: `
        <igx-circular-bar [value]="20" [animate]="false" [max]="100" [textVisibility]="true">
            <ng-template igxProgressBarGradient let-id>
                <svg:linearGradient [id]="id" gradientTransform="rotate(90)">
                    <stop offset="0%" stop-color="#ff9a40" />
                    <stop offset="50%" stop-color="#1eccd4" />
                    <stop offset="100%" stop-color="#ff0079" />
                </svg:linearGradient>
            </ng-template>
        </igx-circular-bar>`
})
class CircularBarTemplateGradientComponent {
    @ViewChild(IgxCircularProgressBarComponent, { static: true }) public progressbar: IgxCircularProgressBarComponent;
}
