import { Component, ViewChild } from '@angular/core';
import {
    async,
    fakeAsync,
    TestBed,
    tick,
    flush
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxCircularProgressBarComponent, IgxProgressBarModule } from './progressbar.component';
import { Common } from './common.spec';

import { configureTestSuite } from '../test-utils/configure-suite';

const CIRCULAR_INNER_CLASS = 'igx-circular-bar__inner';
const CIRCULAR_OUTER_CLASS = 'igx-circular-bar__outer';
const CIRCULAR_TEXT_CLASS = 'igx-circular-bar__text';
const CIRCULAR_HIDDEN_TEXT_CLASS = 'igx-circular-bar__text--hidden';
const CIRCULAR_INDETERMINATE_CLASS = 'igx-circular-bar--indeterminate';

describe('IgCircularBar', () => {
    configureTestSuite();
    const tickTime = 2000;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCircularProgressBarComponent,
                CircularBarComponent,
                CircularBarTemplateComponent
            ],
            imports: [
                IgxProgressBarModule
            ]
        })
        .compileComponents();
    }));

    it('Initialize circularProgressbar with default values', () => {
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);

        fixture.detectChanges();

        const progress = fixture.componentInstance.circularBar;
        const domProgress = fixture.debugElement.query(By.css('igx-circular-bar')).nativeElement;
        const value = 0;
        const defaultMaxValue = 100;

        expect(progress.id).toContain('igx-circular-bar-');
        expect(domProgress.id).toContain('igx-circular-bar-');
        expect(progress.max).toBe(defaultMaxValue);
        expect(progress.value).toBe(0);
    });

    it('should set value to 0 for negative numbers', () => {
        const negativeValue = -20;
        const expectedValue = 0;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);
        fixture.detectChanges();

        const progress = fixture.componentInstance.circularBar;
        progress.value = negativeValue;

        fixture.detectChanges();

        expect(progress.value).toBe(expectedValue);
    });

    it('If passed value is higher then max it should stay equal to maximum (default max size)', fakeAsync(() => {
        const progressBarValue = 120;
        const expectedMaxValue = 100;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);
        fixture.detectChanges();

        const progress = fixture.componentInstance.circularBar;
        progress.value = progressBarValue;

        tick(2500);
        fixture.detectChanges();

        expect(progress.value).toBe(expectedMaxValue);
    }));

    it('If passed value is higher then max it should stay equal to maximum (custom max size)', fakeAsync(() => {
        const progressBarMaxValue = 150;
        const progressBarValue = 170;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);
        fixture.detectChanges();

        const progress = fixture.componentInstance.circularBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        tick(3000);
        fixture.detectChanges();

        expect(progress.value).toBe(progressBarMaxValue);
    }));

    it('should not update value if max is updated', fakeAsync(() => {
        let progressBarMaxValue = 150;
        const progressBarValue = 120;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);

        fixture.detectChanges();

        const progress = fixture.componentInstance.circularBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();

        expect(progress.value).toBe(progressBarValue);
        expect(progress.max).toBe(progressBarMaxValue);

        progressBarMaxValue = 200;
        progress.max = progressBarMaxValue;

        tick(tickTime);
        fixture.detectChanges();

        expect(progress.value).toBe(progressBarValue);
        expect(progress.max).toBe(progressBarMaxValue);
    }));

    it('Should update value when we try to decrease it', fakeAsync(() => {
        const fixture = TestBed.createComponent(CircularBarComponent);
        fixture.detectChanges();

        const progressBar = fixture.componentInstance.circularBar;
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
        const fixture = TestBed.createComponent(CircularBarComponent);
        fixture.detectChanges();

        const progressBar = fixture.componentInstance.circularBar;
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
        const fix = TestBed.createComponent(CircularBarComponent);
        fix.detectChanges();

        const bar = fix.componentInstance.circularBar;
        const expectedRes = fix.componentInstance.value;

        tick(tickTime);
        expect(bar.value).toEqual(expectedRes);

        bar.value = '0345-234';
        tick(tickTime);
        fix.detectChanges();
        expect(bar.value).toEqual(expectedRes);
    }));

    it('The update step is 1% of the maximum value, which prevents from slow update with big nums', () => {
        const fix = TestBed.createComponent(InitCircularProgressBarComponent);
        fix.detectChanges();

        const bar = fix.componentInstance.circularBar;
        const ONE_PERCENT = 0.01;
        let expectedValue = bar.max * ONE_PERCENT;
        expect(bar.step).toBe(expectedValue);

        const maxVal = 15345;
        bar.max = maxVal;
        fix.detectChanges();

        expectedValue = maxVal * ONE_PERCENT;
        expect(bar.step).toBe(expectedValue);
    });

    it('Value should not exceed the lower limit (0) when operating with floating numbers', fakeAsync(() => {
        const fix = TestBed.createComponent(CircularBarComponent);
        const compInstance = fix.componentInstance;
        compInstance.max = 2.5;
        compInstance.value = -0.3;
        fix.detectChanges();

        tick(tickTime);
        const bar = compInstance.circularBar;
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
        const fix = TestBed.createComponent(CircularBarComponent);
        const compInstance = fix.componentInstance;
        let value = 2.67;
        const max = 2.5;
        compInstance.max = max;
        compInstance.value = value;
        fix.detectChanges();

        const bar = compInstance.circularBar;
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
        const fix = TestBed.createComponent(CircularBarComponent);
        const compInstance = fix.componentInstance;
        const stringValue = '0.50';
        compInstance.value = stringValue;
        fix.detectChanges();

        const bar = compInstance.circularBar;

        let expectedRes: number | string = stringValue.toString();
        expect(bar.value).not.toBe(expectedRes);
        expectedRes = parseFloat(stringValue);
        expect(bar.value).toBe(expectedRes);
    });

    it('when update step is bigger than passed value the progress indicator should follow the value representation', () => {
        const fix = TestBed.createComponent(InitCircularProgressBarComponent);
        fix.detectChanges();

        const bar = fix.componentInstance.circularBar;
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
    value getter should be the same as the passed one`, fakeAsync(() => {
        const fix = TestBed.createComponent(InitCircularProgressBarComponent);
        fix.detectChanges();

        const bar = fix.componentInstance.circularBar;
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

    it('The template should be applied correct', () => {
        const fixture = TestBed.createComponent(CircularBarTemplateComponent);
        fixture.detectChanges();

        const componentInstance = fixture.componentInstance;
        const progressBarElem = fixture.debugElement.nativeElement
            .querySelector('.igx-circular-bar');
        fixture.detectChanges();
        expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe('20');

        expect(progressBarElem.children[0].classList.value).toBe(CIRCULAR_INNER_CLASS);
        expect(progressBarElem.children[1].classList.value).toBe(CIRCULAR_OUTER_CLASS);
        expect(progressBarElem.children[2].children.length).toBe(2);
        expect(progressBarElem.children[2].children[0].textContent.trim()).toBe('Value is:');
        expect(progressBarElem.children[2].children[1].textContent.trim()).toMatch('20');

        componentInstance.progressbar.textVisibility = false;
        fixture.detectChanges();
        expect(progressBarElem.children[2].classList.value).toMatch(CIRCULAR_HIDDEN_TEXT_CLASS);
    });

    // UI TESTS
    describe('Circular bar UI TESTS', () => {
        configureTestSuite();
        it('The value representation should respond to passed value correctly', fakeAsync(() => {
            const fixture = TestBed.createComponent(CircularBarComponent);
            fixture.detectChanges();

            const componentInstance = fixture.componentInstance;
            const progressBarElem = fixture.debugElement.nativeElement
                .querySelector('.igx-circular-bar');
            let expectedTextContent = componentInstance.circularBar.value + '%';

            tick(tickTime);
            fixture.detectChanges();

            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe(componentInstance.value.toString());
            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe(componentInstance.max.toString());

            expect(progressBarElem.children[0].classList.value).toBe(CIRCULAR_INNER_CLASS);
            expect(progressBarElem.children[1].classList.value).toBe(CIRCULAR_OUTER_CLASS);
            expect(progressBarElem.children[2].children[0].classList.value).toBe(CIRCULAR_TEXT_CLASS);
            expect(progressBarElem.children[2].children[0].textContent.trim()).toMatch(expectedTextContent);

            componentInstance.circularBar.text = 'No progress';
            fixture.detectChanges();

            expectedTextContent = 'No progress';
            expect(progressBarElem.children[2].children[0].textContent.trim()).toMatch(expectedTextContent);

            componentInstance.circularBar.textVisibility = false;
            fixture.detectChanges();

            expect(progressBarElem.children[2].classList.value).toMatch(CIRCULAR_HIDDEN_TEXT_CLASS);
        }));

        it('The max representation should respond correctly to passed maximum value', fakeAsync(() => {
            const fixture = TestBed.createComponent(CircularBarComponent);
            fixture.detectChanges();

            const componentInstance = fixture.componentInstance;
            const progressBarElem = fixture.debugElement.nativeElement
                .querySelector('.igx-circular-bar');

            tick(tickTime);
            fixture.detectChanges();

            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe(componentInstance.value.toString());
            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe(componentInstance.max.toString());

            componentInstance.max = 200;
            tick(tickTime);
            fixture.detectChanges();

            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe(componentInstance.max.toString());
        }));

        it('Manipulate progressbar with floating point numbers', fakeAsync(() => {
            const fix = TestBed.createComponent(InitCircularProgressBarComponent);
            fix.detectChanges();

            const bar = fix.componentInstance.circularBar;
            const maxVal = 1.25;
            const val = 0.50;

            bar.max = maxVal;
            bar.value = val;
            tick(tickTime);
            fix.detectChanges();

            const progressRepresentation = Common.calcPercentage(val, maxVal);
            const progressBarElem = fix.debugElement.query(By.css('.igx-circular-bar'));
            const valueInPercent = progressBarElem.query(By.css(`.${CIRCULAR_TEXT_CLASS}`)).nativeElement;
            expect(valueInPercent.textContent.trim()).toBe(`${progressRepresentation}%`);
        }));

        it('Prevent constant update of progress value when value and max value differ', fakeAsync(() => {
            const fix = TestBed.createComponent(InitCircularProgressBarComponent);
            fix.detectChanges();

            const bar = fix.componentInstance.circularBar;
            const maxVal = 3.25;
            const value = 2.55;
            bar.step = 0.634;
            bar.max = maxVal;
            bar.value  = value;

            tick(tickTime + tickTime); // enough time to exceed the progress update.
            fix.detectChanges();

            const progressBarContainer = fix.debugElement.query(By.css('.igx-circular-bar')).nativeElement;
            expect(parseFloat(progressBarContainer.attributes['aria-valuenow'].textContent)).toBe(value);
            expect(bar.value).toBe(value);
        }));

        it('When enable indeterminate mode, then the appropriate class should be applied.', () => {
            const fix = TestBed.createComponent(InitCircularProgressBarComponent);
            fix.detectChanges();

            const bar = fix.debugElement.nativeElement.querySelector('igx-circular-bar');
            expect(bar.classList.contains(CIRCULAR_INDETERMINATE_CLASS)).toEqual(false);

            const barComponent = fix.componentInstance.circularBar;
            barComponent.indeterminate = true;
            fix.detectChanges();

            expect(bar.classList.contains(CIRCULAR_INDETERMINATE_CLASS)).toEqual(true);
        });
    });
});
@Component({ template: `<igx-circular-bar></igx-circular-bar>` })
class InitCircularProgressBarComponent {
    @ViewChild(IgxCircularProgressBarComponent) public circularBar: IgxCircularProgressBarComponent;
}

@Component({
    template: `
    <div #wrapper>
        <igx-circular-bar #circularBar [value]="value" [animate]="animate" [max]="max">
        </igx-circular-bar>
    </div>`
})
class CircularBarComponent {
    @ViewChild(IgxCircularProgressBarComponent) public progressbar: IgxCircularProgressBarComponent;
    @ViewChild('wrapper') public wrapper;
    @ViewChild('circularBar') public circularBar;

    public value: string | number = 30;
    public max = 100;
    public animate = true;
}

@Component({
    template: `
        <igx-circular-bar [value]="20" [animate]="false" [max]="100" [textVisibility]="true">
            <ng-template igxProcessBarText let-process>
                <svg:tspan>Value is:</tspan>
                <svg:tspan>{{process.value}}</tspan>
            </ng-template>
        </igx-circular-bar>`
})
class CircularBarTemplateComponent {
    @ViewChild(IgxCircularProgressBarComponent) public progressbar: IgxCircularProgressBarComponent;
}
