import { Component, ViewChild } from "@angular/core";
import {
    async,
    fakeAsync,
    TestBed,
    tick
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxCircularProgressBarComponent } from "./progressbar.component";

describe("IgCircularBar", () => {
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

    it("Initialize circularProgressbar with default values", fakeAsync(() => {
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.circularBar;

        const value = 0;
        const defaultMaxValue = 100;

        expect(progress.max).toBe(defaultMaxValue);
        expect(progress.value).toBe(0);
    }));

    it("should set value to 0 for negative numbers", fakeAsync(() => {
        const negativeValue = -20;
        const expectedValue = 0;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);
        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.circularBar;
        progress.value = negativeValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(expectedValue);
    }));

    it("If passed value is higher then max it should stay equal to maximum (default max size)", fakeAsync(() => {
        const progressBarValue = 120;
        const expectedMaxValue = 100;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);
        fixture.componentInstance.circularBar.value = 11;
        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.circularBar;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(expectedMaxValue);
    }));

    it("If passed value is higher then max it should stay equal to maximum (custom max size)", fakeAsync(() => {
        const progressBarMaxValue = 150;
        const progressBarValue = 170;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);
        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.circularBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(progressBarMaxValue);
    }));

    it("should not update value if max is updated", fakeAsync(() => {
        let progressBarMaxValue = 150;
        const progressBarValue = 120;
        const fixture = TestBed.createComponent(InitCircularProgressBarComponent);

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progress = fixture.componentInstance.circularBar;
        progress.max = progressBarMaxValue;
        progress.value = progressBarValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(progressBarValue);

        progressBarMaxValue = 200;
        progress.max = progressBarMaxValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progress.value).toBe(progressBarValue);
    }));

    it("Should update value when we try to decrease it", fakeAsync(() => {
        const fixture = TestBed.createComponent(CircularBarComponent);
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

    it("Should update value when we try to decrease it (without animation)", fakeAsync(() => {
        const fixture = TestBed.createComponent(CircularBarComponent);
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
    }));

    // UI TESTS

    it("The value representation should respond to passed value correctly", fakeAsync(() => {
        const fixture = TestBed.createComponent(CircularBarComponent);

        const expectedValue = 30;

        fixture.componentInstance.value = expectedValue;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progressBarElem = fixture.componentInstance.circularBar.elementRef.nativeElement
            .querySelector(".progress-circular");

        fixture.detectChanges();

        expect(progressBarElem.attributes["aria-valuenow"].textContent).toBe(expectedValue.toString());
        expect(progressBarElem.attributes["aria-valuemax"].textContent).toBe("100");

        expect(progressBarElem.children[0].classList.value).toBe("progress-circular__innercircle");
        expect(progressBarElem.children[1].classList.value).toBe("progress-circular__circle");
        expect(progressBarElem.children[2].classList.value).toBe("progress-circular__text");
    }));

    it("The max representation should respond correctly to passed maximum value", fakeAsync(() => {
        const fixture = TestBed.createComponent(CircularBarComponent);

        const expectedValue = 30;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        const progressBarElem = fixture.componentInstance.circularBar.elementRef.nativeElement
            .querySelector(".progress-circular");

        fixture.detectChanges();
        // tick(tickTime);

        expect(progressBarElem.attributes["aria-valuenow"].textContent).toBe(expectedValue.toString());
        expect(progressBarElem.attributes["aria-valuemax"].textContent).toBe("100");

        fixture.componentInstance.max = 200;

        tick(tickTime);
        fixture.detectChanges();
        tick(tickTime);

        expect(progressBarElem.attributes["aria-valuemax"].textContent).toBe("200");
        expect(progressBarElem.children[0].classList.value).toBe("progress-circular__innercircle");
        expect(progressBarElem.children[1].classList.value).toBe("progress-circular__circle");
        expect(progressBarElem.children[2].classList.value).toBe("progress-circular__text");
    }));
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
    @ViewChild("wrapper") public wrapper;
    @ViewChild("circularBar") public circularBar;

    public value = 30;
    public max = 100;
    public animate = true;
}
