import { Component, ViewChild } from '@angular/core';
import {
    async,
    fakeAsync,
    TestBed,
    tick,
    flush
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxCircularProgressBarComponent } from './progressbar.component';

describe('IgCircularBar', () => {
    const tickTime = 2000;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCircularProgressBarComponent,
                CircularBarComponent,
                IgxCircularProgressBarComponent
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

    it('When passed value is string progress indication should remain the same', async(() => {
        const fix = TestBed.createComponent(CircularBarComponent);
        fix.detectChanges();

        const datepicker = fix.componentInstance.circularBar;
        const expectedRes = fix.componentInstance.value;
        fix.whenStable().then(() => {
            expect(datepicker.value).toEqual(expectedRes);
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            datepicker.value = '0345-234';
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(datepicker.value).toEqual(expectedRes);
        });
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

    // UI TESTS
    describe('Circularbar UI tests', () => {
        it('The value representation should respond to passed value correctly', fakeAsync(() => {
            const fixture = TestBed.createComponent(CircularBarComponent);

            const expectedValue = 30;

            fixture.componentInstance.value = expectedValue;

            tick(tickTime);
            fixture.detectChanges();
            tick(tickTime);

            const progressBarElem = fixture.componentInstance.circularBar.elementRef.nativeElement
                .querySelector('.progress-circular');

            fixture.detectChanges();

            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe(expectedValue.toString());
            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe('100');

            expect(progressBarElem.children[0].classList.value).toBe('progress-circular__innercircle');
            expect(progressBarElem.children[1].classList.value).toBe('progress-circular__circle');
            expect(progressBarElem.children[2].classList.value).toBe('progress-circular__text');
        }));

        it('The max representation should respond correctly to passed maximum value', fakeAsync(() => {
            const fixture = TestBed.createComponent(CircularBarComponent);

            const expectedValue = 30;

            tick(tickTime);
            fixture.detectChanges();
            tick(tickTime);

            const progressBarElem = fixture.componentInstance.circularBar.elementRef.nativeElement
                .querySelector('.progress-circular');

            fixture.detectChanges();

            expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe(expectedValue.toString());
            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe('100');

            fixture.componentInstance.max = 200;

            tick(tickTime);
            fixture.detectChanges();
            tick(tickTime);

            expect(progressBarElem.attributes['aria-valuemax'].textContent).toBe('200');
            expect(progressBarElem.children[0].classList.value).toBe('progress-circular__innercircle');
            expect(progressBarElem.children[1].classList.value).toBe('progress-circular__circle');
            expect(progressBarElem.children[2].classList.value).toBe('progress-circular__text');
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

            const progressRepresentation = Math.floor(100 * val / maxVal);
            const progressBarElem = fix.debugElement.query(By.css('.progress-circular'));
            const valueInPercent = progressBarElem.query(By.css('.progress-circular__text')).nativeElement;
            expect(valueInPercent.textContent.trim()).toBe(`${progressRepresentation}%`);
        }));

        it('Prevent constant update of progress value when value and max value differ', fakeAsync(() => {
            const fix = TestBed.createComponent(InitCircularProgressBarComponent);
            fix.detectChanges();

            const bar = fix.componentInstance.circularBar;
            const maxVal = 1.25;

            bar.step = 0.6;
            bar.max = maxVal;
            bar.value  = maxVal;

            tick(tickTime + tickTime);
            fix.detectChanges();

            const progressBarElem = fix.debugElement.query(By.css('.progress-circular')).nativeElement;
            const expectedRes = maxVal + bar.step;
            expect(parseFloat(progressBarElem.attributes['aria-valuenow'].textContent)).toBeLessThanOrEqual(expectedRes);
        }));
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

    public value = 30;
    public max = 100;
    public animate = true;
}
