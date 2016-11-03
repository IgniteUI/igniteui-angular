import {
    async,
    TestBed
} from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgProgressBarModule, IgProgressBar } from './progressbar.component'

describe('IgProgressBar', function() {
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitProgressBar,
                IgProgressBar
            ]
        })
        .compileComponents();
    }));

    it('should initialize progressbar with default values', () => {
        let fixture = TestBed.createComponent(InitProgressBar);
        fixture.detectChanges();

        //let progressBarComp = fixture.debugElement.query(By.css('ig-progressbar')).componentInstance;
        let progress = fixture.componentInstance.progressbar;

        const defaultMaxValue = 100,
            defaultAnimation = false,
            defaultStriped = false,
            defaultType = 'default';

            expect(progress.max).toBe(defaultMaxValue);
            expect(progress.animated).toBe(defaultAnimation);
            expect(progress.striped).toBe(defaultStriped);
            expect(progress.type).toBe(defaultType);
    });

    it('should calculate the percantage (defalt max size)', () => {
        let fixture = TestBed.createComponent(InitProgressBar);
        fixture.detectChanges();

        let progress = fixture.componentInstance.progressbar;

        let progressBarPercentValue = 50;

        progress.value = progressBarPercentValue;
        expect(progress.getPercentValue()).toBe(progressBarPercentValue);

        progressBarPercentValue = 25;
        progress.value = progressBarPercentValue;
        expect(progress.getPercentValue()).toBe(progressBarPercentValue);
    });

    it('should calculate the percentage (custom max size)', () => {
        let maxValue = 150,
            value = 75,
            expectedPercentValue = 50,
            fixture = TestBed.createComponent(InitProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.progressbar;
        progress.max = maxValue;

        progress.value = value;
        expect(progress.getPercentValue()).toBe(expectedPercentValue);

        value = 30;
        expectedPercentValue = 20;

        progress.value = value;
        expect(progress.getPercentValue()).toBe(expectedPercentValue)
    });

    it('should set value to 0 for negative numbers', () => {
        let negativeValue = -20,
            expectedValue = 0,
            fixture = TestBed.createComponent(InitProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.progressbar;
        progress.value = negativeValue;

        expect(progress.getValue()).toBe(expectedValue);
    });

    it('should set value to max if it is higher than max (default max size)', () => {
        let progressBarValue = 120,
            expectedMaxValue = 100,
            fixture = TestBed.createComponent(InitProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.progressbar;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(expectedMaxValue);
    });

    it('should set value to max if it is higher than max (custom max size)', () => {
        let progressBarMaxValue = 150,
            progressBarValue = 170,
            fixture = TestBed.createComponent(InitProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.progressbar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarMaxValue);
    });

    it('should update the value if max updates to a smaller value', () => {
        let progressBarMaxValue = 70,
            progressBarValue = 80,
            fixture = TestBed.createComponent(InitProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.progressbar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarMaxValue);
    });

    it('should not update the value if max updates to a larger value', () => {
        let progressBarMaxValue = 150,
            progressBarValue = 120,
            fixture = TestBed.createComponent(InitProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.progressbar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarValue);
    });

});

describe('IgProgressBar UI Logic', function() {
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SetValueProgressBar,
                IgProgressBar,
            ]
        })
        .compileComponents();
    }));

    // it('accepts a value and respond to value changes', () => {
    //     let fixture = TestBed.createComponent(SetValueProgressBar);

    //     fixture.detectChanges();

    //     let progress = fixture.componentInstance.wrapper,
    //         progressBarElem = progress.nativeElement.getElementByClassName('progress-bar');

    //     expect(progressBarElem.style.width).toBe('30%');

    //     fixture.componentInstance.value = 45;
    //     fixture.detectChanges();

    //     expect(progressBarElem.style.width).toBe('45%');
    //     expect(progressBarElem['aria-value']).toBe('45');
    // });
});

@Component({ template: `<ig-progressbar></ig-progressbar>` })
class InitProgressBar{
    @ViewChild(IgProgressBar) progressbar: IgProgressBar;
}

@Component({ template: `<div #wrapper>
                            <ig-progressbar [value]="value">
                            </ig-progressbar>
                        </div>` })
class SetValueProgressBar{
    @ViewChild(IgProgressBar) progressbar: IgProgressBar;
    @ViewChild("wrapper") wrapper;

    value: number = 30;
}

