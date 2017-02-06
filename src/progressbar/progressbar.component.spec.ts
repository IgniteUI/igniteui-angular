import {
    async,
    TestBed
} from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxCircularProgressBar, IgxLinearProgressBar } from './progressbar.component'

describe('IgLinearBar', function() {
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitLinearProgressBar,
                IgxLinearProgressBar
            ]
        })
        .compileComponents();
    }));

    it('should initialize linearProgressbar with default values', () => {
        let fixture = TestBed.createComponent(InitLinearProgressBar);
        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;

        const defaultMaxValue = 100,
            defaultValue = 0,
            defaultStriped = false,
            defaultType = 'default';

            expect(progress.max).toBe(defaultMaxValue);
            expect(progress.striped).toBe(defaultStriped);
            expect(progress.type).toBe(defaultType);
            expect(progress.value).toBe(defaultValue);
    });

    it('should calculate the percantage (defalt max size)', () => {
        let fixture = TestBed.createComponent(InitLinearProgressBar);
        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;

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
            fixture = TestBed.createComponent(InitLinearProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;
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
            fixture = TestBed.createComponent(InitLinearProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;
        progress.value = negativeValue;

        expect(progress.getValue()).toBe(expectedValue);
    });

    it('should set value to max if it is higher than max (default max size)', () => {
        let progressBarValue = 120,
            expectedMaxValue = 100,
            fixture = TestBed.createComponent(InitLinearProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(expectedMaxValue);
    });

    it('should set value to max if it is higher than max (custom max size)', () => {
        let progressBarMaxValue = 150,
            progressBarValue = 170,
            fixture = TestBed.createComponent(InitLinearProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarMaxValue);
    });

    it('should update the value if max updates to a smaller value', () => {
        let progressBarMaxValue = 70,
            progressBarValue = 80,
            fixture = TestBed.createComponent(InitLinearProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarMaxValue);
    });

    it('should not update the value if max updates to a larger value', () => {
        let progressBarMaxValue = 150,
            progressBarValue = 120,
            fixture = TestBed.createComponent(InitLinearProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.linearBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarValue);
    });

});

describe('IgCircularBar', function() {
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCircularProgressBar,
                IgxCircularProgressBar
            ]
        })
        .compileComponents();
    }));

    it('should initialize circularProgressbar with default values', () => {
        let fixture = TestBed.createComponent(InitCircularProgressBar);
        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;

        const value = 0,
            defaultMaxValue = 100;

        expect(progress.max).toBe(defaultMaxValue);
        expect(progress.value).toBe(0);
    });

    it('should calculate the percantage (defalt max size)', () => {
        let fixture = TestBed.createComponent(InitCircularProgressBar);
        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;

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
            fixture = TestBed.createComponent(InitCircularProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;
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
            fixture = TestBed.createComponent(InitCircularProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;
        progress.value = negativeValue;

        expect(progress.getValue()).toBe(expectedValue);
    });

    it('should set value to max if it is higher than max (default max size)', () => {
        let progressBarValue = 120,
            expectedMaxValue = 100,
            fixture = TestBed.createComponent(InitCircularProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(expectedMaxValue);
    });

    it('should set value to max if it is higher than max (custom max size)', () => {
        let progressBarMaxValue = 150,
            progressBarValue = 170,
            fixture = TestBed.createComponent(InitCircularProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarMaxValue);
    });

    it('should update the value if max updates to a smaller value', () => {
        let progressBarMaxValue = 70,
            progressBarValue = 80,
            fixture = TestBed.createComponent(InitCircularProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarMaxValue);
    });

    it('should not update the value if max updates to a larger value', () => {
        let progressBarMaxValue = 150,
            progressBarValue = 120,
            fixture = TestBed.createComponent(InitCircularProgressBar);

        fixture.detectChanges();

        let progress = fixture.componentInstance.circularBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        expect(progress.getValue()).toBe(progressBarValue);
    });

});

describe('IgLinearBar UI Logic', function() {
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                linearBar,
                SetValueAboveValuesLinearBar,
                IgxLinearProgressBar,
            ]
        })
        .compileComponents();
    }));

    it('accepts and respond to value', () => {
        let fixture = TestBed.createComponent(linearBar);

        let expectedValue = 30;

        fixture.detectChanges();

        let progressBarElem = fixture.componentInstance.linerBar.elementRef.nativeElement.querySelectorAll('[class*="progress-linear__bar--"]')[0];

        expect(progressBarElem.style.width).toBe(expectedValue + '%');
        expect(progressBarElem.attributes['aria-valuenow'].textContent).toBe(expectedValue.toString());
    });

    it('accepts a max value and respond to max changes', () => {
        let fixture = TestBed.createComponent(linearBar);

        let expectedValue = 30;

        fixture.detectChanges();

        let progressBarElem = fixture.componentInstance.linerBar.elementRef.nativeElement.querySelectorAll('[class*="progress-linear__bar--"]')[0];

        expect(progressBarElem.style.width).toBe(expectedValue + '%');

        fixture.componentInstance.max = 200;
        fixture.detectChanges();

        expect(progressBarElem.style.width).toBe("15%");
    });

    it('accepts a value and max value above default values', () => {
        let fixture = TestBed.createComponent(SetValueAboveValuesLinearBar);
        fixture.detectChanges();

        let progressBarElem = fixture.componentInstance.linerBar.elementRef.nativeElement.querySelectorAll('[class*="progress-linear__bar--"]')[0];

        expect(progressBarElem.style.width).toBe('100%');
    });

    it('accepts a custom type', () => {
        let fixture = TestBed.createComponent(linearBar);
        fixture.detectChanges();

        let progressBarElem = fixture.componentInstance.linerBar.elementRef.nativeElement.querySelectorAll('[class*="progress-linear__bar--"]')[0];

        expect(progressBarElem.classList.contains('progress-linear__bar--default')).toBeTruthy();

        fixture.componentInstance.type = 'info';
        fixture.detectChanges();

        expect(progressBarElem.classList.contains('progress-linear__bar--info')).toBeTruthy();
    });

    it('accepts striped as normal attr', () => {
        let fixture = TestBed.createComponent(linearBar);
        fixture.detectChanges();

        let progressElem = fixture.componentInstance.linerBar.elementRef.nativeElement.getElementsByClassName('progress-linear')[0];

        expect(progressElem.classList.contains('progress-linear--striped')).toBeFalsy();

        fixture.componentInstance.striped = true;
        fixture.detectChanges();

        expect(progressElem.classList.contains('progress-linear--striped')).toBeTruthy();
    });

    it('should stay striped when the type changes', () => {
        let fixture = TestBed.createComponent(linearBar);
        fixture.detectChanges();

        let progressElem = fixture.componentInstance.linerBar.elementRef.nativeElement.getElementsByClassName('progress-linear')[0];
        let progressBarElem = fixture.componentInstance.linerBar.elementRef.nativeElement.querySelectorAll('[class*="progress-linear__bar--"]')[0];

        fixture.componentInstance.striped = true;
        fixture.detectChanges();

        expect(progressBarElem.classList.contains('progress-linear__bar--default')).toBeTruthy();
        expect(progressElem.classList.contains('progress-linear--striped')).toBeTruthy();

        fixture.componentInstance.type = 'success';
        fixture.detectChanges();

        expect(progressBarElem.classList.contains('progress-linear__bar--success')).toBeTruthy();
        expect(progressElem.classList.contains('progress-linear--striped')).toBeTruthy();
    });
});

describe('IgCircularBar UI Logic', function() {
   beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CircularBar,
                IgxCircularProgressBar,
                SetValueAboveValuesCircularBar
            ]
        })
        .compileComponents();
    }));

    it('accepts and respond to value', () => {
        let fixture = TestBed.createComponent(CircularBar);

        let expectedValue = 30;

        fixture.componentInstance.value = expectedValue;
        fixture.detectChanges();

        let progressBarElem = fixture.componentInstance.circularBar.elementRef.nativeElement.getElementsByClassName('progress-circular')[0];
        
        expect(progressBarElem.attributes["aria-valuenow"].textContent).toBe(expectedValue.toString());
        expect(progressBarElem.attributes["aria-valuemax"].textContent).toBe("100");
        expect(progressBarElem.children[1].classList.value).toBe("progress-circular__innercircle");
        expect(progressBarElem.children[2].classList.value).toBe("progress-circular__circle");
        expect(progressBarElem.children[3].classList.value).toBe("progress-circular__text");
    });

    it('accepts a max value and respond to max changes', () => {
        let fixture = TestBed.createComponent(CircularBar);

        let expectedValue = 30;

        fixture.detectChanges();

        let progressBarElem = fixture.componentInstance.circularBar.elementRef.nativeElement.getElementsByClassName('progress-circular')[0];

        expect(progressBarElem.attributes["aria-valuenow"].textContent).toBe(expectedValue.toString());
        expect(progressBarElem.attributes["aria-valuemax"].textContent).toBe("100");

        fixture.componentInstance.max = 200;
        fixture.detectChanges();

        expect(progressBarElem.attributes["aria-valuemax"].textContent).toBe("200");
        expect(progressBarElem.children[1].classList.value).toBe("progress-circular__innercircle");
        expect(progressBarElem.children[2].classList.value).toBe("progress-circular__circle");
        expect(progressBarElem.children[3].classList.value).toBe("progress-circular__text");
    });

    it('accepts a value and max value above default values', () => {
        let fixture = TestBed.createComponent(SetValueAboveValuesCircularBar);
        fixture.detectChanges();

        let progressBarElem = fixture.componentInstance.circularBar.elementRef.nativeElement.getElementsByClassName('progress-circular')[0];

        expect(progressBarElem.attributes["aria-valuenow"].textContent).toBe("150");
        expect(progressBarElem.attributes["aria-valuemax"].textContent).toBe("150");
        expect(progressBarElem.children[1].classList.value).toBe("progress-circular__innercircle");
        expect(progressBarElem.children[2].classList.value).toBe("progress-circular__circle");
        expect(progressBarElem.children[3].classList.value).toBe("progress-circular__text");
    });
});

@Component({ template: `<igx-linear-bar></igx-linear-bar>` })
class InitLinearProgressBar{
    @ViewChild(IgxLinearProgressBar) linearBar: IgxLinearProgressBar;
}

@Component({ template: `<igx-circular-bar></igx-circular-bar>` })
class InitCircularProgressBar{
    @ViewChild(IgxCircularProgressBar) circularBar: IgxCircularProgressBar;
}

@Component({ template: `<div #wrapper>
                            <igx-linear-bar #linearBar [value]="value" [max]="max" [type]="type" [striped]="striped">
                            </igx-linear-bar>
                        </div>` })
class linearBar{
    @ViewChild(IgxLinearProgressBar) progressbar: IgxLinearProgressBar;
    @ViewChild("wrapper") wrapper;
    @ViewChild("linearBar") linerBar;

    value: number = 30;
    max: number = 100;
    type:string = "default";
    striped: boolean = false;
}

@Component({ template: `<div #wrapper>
                            <igx-linear-bar #linearBar [value]="value" [max]="max">
                            </igx-linear-bar>
                        </div>` })
class SetValueAboveValuesLinearBar{
    @ViewChild(IgxLinearProgressBar) progressbar: IgxLinearProgressBar;
    @ViewChild("wrapper") wrapper;
    @ViewChild("linearBar") linerBar;

    value: number = 150;
    max: number = 150;
}

@Component({ template: `<div #wrapper>
                            <igx-circular-bar #circularBar [value]="value" [max]="max">
                            </igx-circular-bar>
                        </div>` })
class CircularBar{
    @ViewChild(IgxCircularProgressBar) progressbar: IgxCircularProgressBar;
    @ViewChild("wrapper") wrapper;
    @ViewChild("circularBar") circularBar;

    value: number = 30;
    max: number = 100;
}

@Component({ template: `<div #wrapper>
                            <igx-circular-bar #circularBar [value]="value" [max]="max">
                            </igx-circular-bar>
                        </div>` })
class SetValueAboveValuesCircularBar{
    @ViewChild(IgxCircularProgressBar) progressbar: IgxCircularProgressBar;
    @ViewChild("wrapper") wrapper;
    @ViewChild("circularBar") circularBar;

    value: number = 150;
    max: number = 150;
}
