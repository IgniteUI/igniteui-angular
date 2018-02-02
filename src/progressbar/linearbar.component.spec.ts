import { Component, ViewChild } from "@angular/core";
import {
    async,
    fakeAsync,
    TestBed,
    tick
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxLinearProgressBarComponent } from "./progressbar.component";

describe("IgLinearBar", () => {
    const tickTime = 2000;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitLinearProgressBar,
                LinearBar,
                IgxLinearProgressBarComponent
            ]
        })
        .compileComponents();
    }));

    it("should initialize linearProgressbar with default values", fakeAsync(() => {
        const fixture = TestBed.createComponent(InitLinearProgressBar);

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.linearBar;

        const defaultMaxValue = 100;
        const defaultValue = 0;
        const defaultStriped = false;
        const defaultType = "default";

        expect(progress.max).toBe(defaultMaxValue);
        expect(progress.striped).toBe(defaultStriped);
        expect(progress.type).toBe(defaultType);
        expect(progress.value).toBe(defaultValue);
    }));

    it("should set value to 0 for negative values", fakeAsync(() => {
        const negativeValue = -20;
        const expectedValue = 0;
        const fixture = TestBed.createComponent(InitLinearProgressBar);

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.linearBar;
        progress.value = negativeValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(expectedValue);
    }));

    it("If passed value is higher then max it should stay equal to maximum (default max size)", fakeAsync(() => {
        const progressBarValue = 120;
        const expectedMaxValue = 100;
        const fixture = TestBed.createComponent(InitLinearProgressBar);

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.linearBar;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(expectedMaxValue);
    }));

    it("If passed value is higher then max it should stay equal to maximum " +
        "(custom max size and without animation)", fakeAsync(() => {
        const progressBarMaxValue = 150;
        const progressBarValue = 170;
        const fixture = TestBed.createComponent(InitLinearProgressBar);

        fixture.detectChanges();

        const progress = fixture.componentInstance.linearBar;
        progress.animate = false;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        fixture.detectChanges();

        expect(progress.value).toBe(progressBarMaxValue);
    }));

    it("should not update value if max is decreased", fakeAsync(() => {
        let progressBarMaxValue = 200;
        const progressBarValue = 80;
        const fixture = TestBed.createComponent(InitLinearProgressBar);

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.linearBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(progressBarValue);

        progressBarMaxValue = 100;
        progress.max = progressBarMaxValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(progressBarValue);
    }));

    it("should not update value if max is increased (without animation)", fakeAsync(() => {
        let progressBarMaxValue = 100;
        const progressBarValue = 50;
        const fixture = TestBed.createComponent(InitLinearProgressBar);

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
    }));

    it("Should update value when we try to decrese it", fakeAsync(() => {
        const fixture = TestBed.createComponent(LinearBar);
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

    it("Should update value when we try to decrease it (without animation)", fakeAsync(() => {
        const fixture = TestBed.createComponent(LinearBar);
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

    }));

    // UI Tests

    it("The percentage representation should respond to passed value correctly", fakeAsync(() => {
        const fixture = TestBed.createComponent(LinearBar);

        const expectedValue = 30;

        fixture.componentInstance.value = expectedValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progressBarElem = fixture.componentInstance.linearBar.elementRef.nativeElement
                                    .querySelectorAll('[class*="progress-linear__bar--"]')[0];

        fixture.detectChanges();

        expect(progressBarElem.style.width).toBe(expectedValue + "%");
        expect(progressBarElem.attributes["aria-valuenow"].textContent).toBe(expectedValue.toString());
    }));

    it("Should change class suffix which would be relevant to the type that had been passed", fakeAsync(() => {
        const fixture = TestBed.createComponent(LinearBar);
        fixture.detectChanges();

        const progressBarElem = fixture.componentInstance.linearBar.elementRef.nativeElement
                                    .querySelectorAll('[class*="progress-linear__bar--"]')[0];

        expect(progressBarElem.classList.contains("progress-linear__bar--default")).toBeTruthy();

        fixture.componentInstance.type = "info";
        fixture.detectChanges();

        expect(progressBarElem.classList.contains("progress-linear__bar--info")).toBeTruthy();
    }));

    it("Change progressbar style to be striped", fakeAsync(() => {
        const fixture = TestBed.createComponent(LinearBar);
        fixture.detectChanges();

        const progressElem = fixture.componentInstance.linearBar.elementRef.nativeElement
                                    .getElementsByClassName("progress-linear")[0];

        expect(progressElem.classList.contains("progress-linear--striped")).toBeFalsy();

        fixture.componentInstance.striped = true;
        fixture.detectChanges();

        expect(progressElem.classList.contains("progress-linear--striped")).toBeTruthy();
    }));

    it("should stay striped when the type has changed", fakeAsync(() => {
        const fixture = TestBed.createComponent(LinearBar);
        fixture.detectChanges();

        const progressElem = fixture.componentInstance.linearBar.elementRef.nativeElement
                                    .getElementsByClassName("progress-linear")[0];
        const progressBarElem = fixture.componentInstance.linearBar.elementRef.nativeElement
                                    .querySelectorAll('[class*="progress-linear__bar--"]')[0];

        fixture.componentInstance.striped = true;
        fixture.detectChanges();

        expect(progressBarElem.classList.contains("progress-linear__bar--default")).toBeTruthy();
        expect(progressElem.classList.contains("progress-linear--striped")).toBeTruthy();

        fixture.componentInstance.type = "success";
        fixture.detectChanges();

        expect(progressBarElem.classList.contains("progress-linear__bar--success")).toBeTruthy();
        expect(progressElem.classList.contains("progress-linear--striped")).toBeTruthy();
    }));
});

@Component({ template: `<igx-linear-bar [animate]="true"></igx-linear-bar>` })
class InitLinearProgressBar {
    @ViewChild(IgxLinearProgressBarComponent) public linearBar: IgxLinearProgressBarComponent;
}

@Component({ template: `<div #wrapper>
                            <igx-linear-bar #linearBar [value]="value" [max]="max"
                                [animate]="animate" [type]="type" [striped]="striped">
                            </igx-linear-bar>
                        </div>` })
class LinearBar {
    @ViewChild(IgxLinearProgressBarComponent) public progressbar: IgxLinearProgressBarComponent;
    @ViewChild("wrapper") public wrapper;
    @ViewChild("linearBar") public linearBar;

    public value: number = 30;
    public max: number = 100;
    public type: string = "default";
    public striped: boolean = false;
    public animate: boolean = true;
}
